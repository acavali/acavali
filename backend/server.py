from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'sua-chave-secreta-aqui-mude-em-producao')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str  # "admin" or "colaborador"
    turno: Optional[str] = None  # "dia" or "noite"
    custo_swap: Optional[float] = 0.0
    custo_move: Optional[float] = 0.0
    custo_rebalancing: Optional[float] = 0.0

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    turno: Optional[str] = None
    custo_swap: float = 0.0
    custo_move: float = 0.0
    custo_rebalancing: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TaskCreate(BaseModel):
    colaborador_id: str
    tipo: str  # "swap", "move", "rebalancing"
    quantidade: int = 1
    data: Optional[str] = None  # YYYY-MM-DD

class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    colaborador_id: str
    colaborador_nome: str
    turno: str
    tipo: str
    quantidade: int
    custo_unitario: float
    custo_total: float
    data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RelatorioResponse(BaseModel):
    total_tasks: int
    total_custo: float
    por_tipo: dict
    por_colaborador: List[dict]
    por_turno: dict

# ==================== HELPER FUNCTIONS ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Usuário não encontrado")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except Exception:
        raise HTTPException(status_code=401, detail="Não autorizado")

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Sistema de Controle de Produção"}

# ========== AUTH ==========

@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    user_dict = user_data.model_dump()
    hashed_pw = hash_password(user_dict.pop("password"))
    
    user_obj = User(**user_dict)
    doc = user_obj.model_dump()
    doc['password'] = hashed_pw
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.users.insert_one(doc)
    return user_obj

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password']):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    
    access_token = create_access_token({"sub": user['id']})
    user.pop('password')
    
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(**user)
    }

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    if isinstance(current_user['created_at'], str):
        current_user['created_at'] = datetime.fromisoformat(current_user['created_at'])
    return User(**current_user)

# ========== USERS ==========

@api_router.get("/users", response_model=List[User])
async def get_users(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.get("/users/colaboradores", response_model=List[User])
async def get_colaboradores(current_user: dict = Depends(get_current_user)):
    users = await db.users.find({"role": "colaborador"}, {"_id": 0, "password": 0}).to_list(1000)
    for user in users:
        if isinstance(user['created_at'], str):
            user['created_at'] = datetime.fromisoformat(user['created_at'])
    return users

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_data: UserCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode atualizar usuários")
    
    update_data = user_data.model_dump()
    if 'password' in update_data and update_data['password']:
        update_data['password'] = hash_password(update_data['password'])
    else:
        update_data.pop('password', None)
    
    result = await db.users.update_one({"id": user_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if isinstance(user['created_at'], str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode deletar usuários")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    return {"message": "Usuário deletado com sucesso"}

# ========== TASKS ==========

@api_router.post("/tasks", response_model=Task)
async def create_task(task_data: TaskCreate, current_user: dict = Depends(get_current_user)):
    # Get colaborador info
    colaborador = await db.users.find_one({"id": task_data.colaborador_id}, {"_id": 0})
    if not colaborador:
        raise HTTPException(status_code=404, detail="Colaborador não encontrado")
    
    # Calculate cost
    custo_map = {
        "swap": colaborador.get('custo_swap', 0),
        "move": colaborador.get('custo_move', 0),
        "rebalancing": colaborador.get('custo_rebalancing', 0)
    }
    custo_unitario = custo_map.get(task_data.tipo, 0)
    custo_total = custo_unitario * task_data.quantidade
    
    # Use provided date or today
    data = task_data.data if task_data.data else datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    task_obj = Task(
        colaborador_id=task_data.colaborador_id,
        colaborador_nome=colaborador['name'],
        turno=colaborador['turno'],
        tipo=task_data.tipo,
        quantidade=task_data.quantidade,
        custo_unitario=custo_unitario,
        custo_total=custo_total,
        data=data
    )
    
    doc = task_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.tasks.insert_one(doc)
    return task_obj

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(data: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if data:
        query['data'] = data
    elif current_user['role'] == 'colaborador':
        # Colaboradores veem apenas suas tasks
        query['colaborador_id'] = current_user['id']
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(10000)
    for task in tasks:
        if isinstance(task['created_at'], str):
            task['created_at'] = datetime.fromisoformat(task['created_at'])
    return tasks

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, current_user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    
    # Colaboradores só podem deletar suas próprias tasks
    if current_user['role'] == 'colaborador' and task['colaborador_id'] != current_user['id']:
        raise HTTPException(status_code=403, detail="Sem permissão")
    
    await db.tasks.delete_one({"id": task_id})
    return {"message": "Tarefa deletada com sucesso"}

# ========== REPORTS ==========

@api_router.get("/relatorios/diario", response_model=RelatorioResponse)
async def relatorio_diario(data: str, current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"data": data}, {"_id": 0}).to_list(10000)
    
    total_tasks = sum(t['quantidade'] for t in tasks)
    total_custo = sum(t['custo_total'] for t in tasks)
    
    # Por tipo
    por_tipo = {}
    for task in tasks:
        tipo = task['tipo']
        if tipo not in por_tipo:
            por_tipo[tipo] = {"quantidade": 0, "custo": 0}
        por_tipo[tipo]['quantidade'] += task['quantidade']
        por_tipo[tipo]['custo'] += task['custo_total']
    
    # Por colaborador
    por_colab = {}
    for task in tasks:
        colab_id = task['colaborador_id']
        if colab_id not in por_colab:
            por_colab[colab_id] = {
                "nome": task['colaborador_nome'],
                "turno": task['turno'],
                "quantidade": 0,
                "custo": 0,
                "por_tipo": {}
            }
        por_colab[colab_id]['quantidade'] += task['quantidade']
        por_colab[colab_id]['custo'] += task['custo_total']
        
        tipo = task['tipo']
        if tipo not in por_colab[colab_id]['por_tipo']:
            por_colab[colab_id]['por_tipo'][tipo] = 0
        por_colab[colab_id]['por_tipo'][tipo] += task['quantidade']
    
    # Por turno
    por_turno = {"dia": {"quantidade": 0, "custo": 0}, "noite": {"quantidade": 0, "custo": 0}}
    for task in tasks:
        turno = task['turno']
        if turno in por_turno:
            por_turno[turno]['quantidade'] += task['quantidade']
            por_turno[turno]['custo'] += task['custo_total']
    
    return RelatorioResponse(
        total_tasks=total_tasks,
        total_custo=total_custo,
        por_tipo=por_tipo,
        por_colaborador=list(por_colab.values()),
        por_turno=por_turno
    )

@api_router.get("/relatorios/periodo")
async def relatorio_periodo(data_inicio: str, data_fim: str, current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({
        "data": {"$gte": data_inicio, "$lte": data_fim}
    }, {"_id": 0}).to_list(10000)
    
    # Group by date
    por_data = {}
    for task in tasks:
        data = task['data']
        if data not in por_data:
            por_data[data] = {"quantidade": 0, "custo": 0}
        por_data[data]['quantidade'] += task['quantidade']
        por_data[data]['custo'] += task['custo_total']
    
    return {"por_data": por_data, "tasks": tasks}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
