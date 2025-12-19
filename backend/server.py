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
    tipo_funcionario: Optional[str] = "motorista"  # "motorista" or "mecanico"
    turno: Optional[str] = None  # "dia" or "noite"
    
    # Informações Pessoais
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    
    # Tipo de Contrato
    tipo_contrato: Optional[str] = "contrato"  # "contrato", "partida_iva", "parttime"
    
    # Forma de Faturamento
    forma_faturamento: Optional[str] = "salario_fixo"  # "diaria", "salario_fixo", "producao", "diaria_producao"
    valor_diaria: Optional[float] = 0.0
    valor_por_task: Optional[float] = 0.0
    
    # Campos antigos (manter compatibilidade)
    custo_swap: Optional[float] = 0.0
    custo_move: Optional[float] = 0.0
    custo_rebalancing: Optional[float] = 0.0
    salario: Optional[float] = 0.0
    bonus: Optional[float] = 0.0
    bonus_por_producao: Optional[float] = 0.0
    horas_extras: Optional[float] = 0.0
    
    # Dados Bancários
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None  # "corrente" or "poupanca"
    pix: Optional[str] = None

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    tipo_funcionario: str = "motorista"
    turno: Optional[str] = None
    
    # Informações Pessoais
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    endereco: Optional[str] = None
    
    # Tipo de Contrato
    tipo_contrato: str = "contrato"
    
    # Forma de Faturamento
    forma_faturamento: str = "salario_fixo"
    valor_diaria: float = 0.0
    valor_por_task: float = 0.0
    
    # Campos antigos
    custo_swap: float = 0.0
    custo_move: float = 0.0
    custo_rebalancing: float = 0.0
    salario: float = 0.0
    bonus: float = 0.0
    bonus_por_producao: float = 0.0
    horas_extras: float = 0.0
    
    # Dados Bancários
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    pix: Optional[str] = None
    
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

class VeiculoCreate(BaseModel):
    placa: str
    modelo: str
    turno: str  # "dia" or "noite"
    tipo_combustivel: str  # "diesel", "gasolina", "eletrico", "hibrido"
    consumo_km_por_litro: Optional[float] = 0.0  # km/L
    custo_litro_diesel: Optional[float] = 1.57  # Custo por litro
    custo_por_bateria: Optional[float] = 0.0  # Para veículos elétricos

class Veiculo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    placa: str
    modelo: str
    turno: str
    tipo_combustivel: str = "diesel"
    consumo_km_por_litro: float = 0.0
    custo_litro_diesel: float = 1.57
    custo_por_bateria: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RegistroVeiculoCreate(BaseModel):
    veiculo_id: str
    motorista_id: str
    km_inicial: float
    km_final: Optional[float] = None
    litros_diesel: Optional[float] = 0.0
    custo_diesel: Optional[float] = 0.0
    data: Optional[str] = None

class RegistroVeiculo(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    veiculo_id: str
    veiculo_placa: str
    veiculo_modelo: str
    motorista_id: str
    motorista_nome: str
    turno: str
    km_inicial: float
    km_final: Optional[float] = None
    km_rodado: Optional[float] = 0.0
    litros_diesel: float = 0.0
    custo_diesel: float = 0.0
    km_por_litro: Optional[float] = 0.0
    data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DespesaCreate(BaseModel):
    descricao: str
    valor: float
    categoria: str  # "material", "aluguel", "manutencao", "outro"
    pago_por: Optional[str] = None
    observacoes: Optional[str] = None
    data: Optional[str] = None

class Despesa(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    descricao: str
    valor: float
    categoria: str
    pago_por: Optional[str] = None
    observacoes: Optional[str] = None
    data: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ManutencaoCreate(BaseModel):
    veiculo_id: str
    tipo: str  # "oleo", "pneus", "filtros", "revisao", "outro"
    descricao: str
    km_atual: float
    km_proxima_troca: Optional[float] = None
    data_realizada: Optional[str] = None
    custo: float
    pecas_trocadas: Optional[str] = None
    observacoes: Optional[str] = None

class Manutencao(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    veiculo_id: str
    veiculo_placa: str
    veiculo_modelo: str
    tipo: str
    descricao: str
    km_atual: float
    km_proxima_troca: Optional[float] = None
    km_faltante: Optional[float] = None
    data_realizada: str
    custo: float
    pecas_trocadas: Optional[str] = None
    observacoes: Optional[str] = None
    status: str = "concluida"  # "concluida", "proxima", "atrasada"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RegistroPresencaCreate(BaseModel):
    usuario_id: str
    tipo: str  # "login" or "logout"
    localizacao: Optional[dict] = None  # {latitude, longitude, endereco}
    data: Optional[str] = None

class RegistroPresenca(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    usuario_id: str
    usuario_nome: str
    tipo: str  # "login" or "logout"
    localizacao: Optional[dict] = None
    data: str
    hora: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RelatorioResponse(BaseModel):
    total_tasks: int
    total_custo: float
    por_tipo: dict
    por_colaborador: List[dict]
    por_turno: dict
    total_despesas: float
    total_custo_veiculos: float
    faturamento_bruto: float
    faturamento_liquido: float
    total_salarios: float

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

# ========== VEICULOS ==========

@api_router.post("/veiculos", response_model=Veiculo)
async def create_veiculo(veiculo_data: VeiculoCreate, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode criar veículos")
    
    veiculo_obj = Veiculo(**veiculo_data.model_dump())
    doc = veiculo_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.veiculos.insert_one(doc)
    return veiculo_obj

@api_router.get("/veiculos", response_model=List[Veiculo])
async def get_veiculos(current_user: dict = Depends(get_current_user)):
    veiculos = await db.veiculos.find({}, {"_id": 0}).to_list(1000)
    for veiculo in veiculos:
        if isinstance(veiculo['created_at'], str):
            veiculo['created_at'] = datetime.fromisoformat(veiculo['created_at'])
    return veiculos

@api_router.delete("/veiculos/{veiculo_id}")
async def delete_veiculo(veiculo_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode deletar veículos")
    
    result = await db.veiculos.delete_one({"id": veiculo_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    return {"message": "Veículo deletado com sucesso"}

# ========== REGISTROS DE VEICULOS ==========

@api_router.post("/registros-veiculos", response_model=RegistroVeiculo)
async def create_registro_veiculo(registro_data: RegistroVeiculoCreate, current_user: dict = Depends(get_current_user)):
    # Get veiculo info
    veiculo = await db.veiculos.find_one({"id": registro_data.veiculo_id}, {"_id": 0})
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Get motorista info
    motorista = await db.users.find_one({"id": registro_data.motorista_id}, {"_id": 0})
    if not motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")
    
    # Calculate km_rodado, litros_diesel (automatic), custo_diesel and km_por_litro
    km_rodado = 0
    km_por_litro = 0
    custo_diesel = 0
    litros_diesel = registro_data.litros_diesel or 0
    
    if registro_data.km_final:
        km_rodado = registro_data.km_final - registro_data.km_inicial
        
        # Automatic calculation of fuel liters based on vehicle's average consumption
        consumo_medio = veiculo.get('consumo_km_por_litro', 0)
        if consumo_medio > 0 and km_rodado > 0:
            # Calculate: Litros = Distância / Média de Consumo (km/L)
            litros_diesel = km_rodado / consumo_medio
            km_por_litro = consumo_medio  # Use the registered average
        elif litros_diesel > 0:
            # Fallback: if liters were manually provided
            km_por_litro = km_rodado / litros_diesel
        
        # Calculate diesel cost
        if litros_diesel > 0:
            custo_diesel = litros_diesel * veiculo.get('custo_litro_diesel', 1.50)
    
    data = registro_data.data if registro_data.data else datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    registro_obj = RegistroVeiculo(
        veiculo_id=registro_data.veiculo_id,
        veiculo_placa=veiculo['placa'],
        veiculo_modelo=veiculo['modelo'],
        motorista_id=registro_data.motorista_id,
        motorista_nome=motorista['name'],
        turno=motorista['turno'],
        km_inicial=registro_data.km_inicial,
        km_final=registro_data.km_final,
        km_rodado=km_rodado,
        litros_diesel=litros_diesel,
        custo_diesel=custo_diesel,
        km_por_litro=km_por_litro,
        data=data
    )
    
    doc = registro_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.registros_veiculos.insert_one(doc)
    return registro_obj

@api_router.get("/registros-veiculos", response_model=List[RegistroVeiculo])
async def get_registros_veiculos(data: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if data:
        query['data'] = data
    
    registros = await db.registros_veiculos.find(query, {"_id": 0}).to_list(10000)
    for registro in registros:
        if isinstance(registro['created_at'], str):
            registro['created_at'] = datetime.fromisoformat(registro['created_at'])
    return registros

@api_router.put("/registros-veiculos/{registro_id}", response_model=RegistroVeiculo)
async def update_registro_veiculo(registro_id: str, registro_data: RegistroVeiculoCreate, current_user: dict = Depends(get_current_user)):
    # Get veiculo info
    veiculo = await db.veiculos.find_one({"id": registro_data.veiculo_id}, {"_id": 0})
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Get motorista info
    motorista = await db.users.find_one({"id": registro_data.motorista_id}, {"_id": 0})
    if not motorista:
        raise HTTPException(status_code=404, detail="Motorista não encontrado")
    
    # Calculate km_rodado, litros_diesel (automatic), custo_diesel and km_por_litro
    km_rodado = 0
    km_por_litro = 0
    custo_diesel = 0
    litros_diesel = registro_data.litros_diesel or 0
    
    if registro_data.km_final:
        km_rodado = registro_data.km_final - registro_data.km_inicial
        
        # Automatic calculation of fuel liters based on vehicle's average consumption
        consumo_medio = veiculo.get('consumo_km_por_litro', 0)
        if consumo_medio > 0 and km_rodado > 0:
            # Calculate: Litros = Distância / Média de Consumo (km/L)
            litros_diesel = km_rodado / consumo_medio
            km_por_litro = consumo_medio  # Use the registered average
        elif litros_diesel > 0:
            # Fallback: if liters were manually provided
            km_por_litro = km_rodado / litros_diesel
        
        # Calculate diesel cost
        if litros_diesel > 0:
            custo_diesel = litros_diesel * veiculo.get('custo_litro_diesel', 1.50)
    
    update_data = {
        "veiculo_placa": veiculo['placa'],
        "veiculo_modelo": veiculo['modelo'],
        "motorista_nome": motorista['name'],
        "turno": motorista['turno'],
        "km_inicial": registro_data.km_inicial,
        "km_final": registro_data.km_final,
        "km_rodado": km_rodado,
        "litros_diesel": litros_diesel,
        "custo_diesel": custo_diesel,
        "km_por_litro": km_por_litro
    }
    
    result = await db.registros_veiculos.update_one({"id": registro_id}, {"$set": update_data})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    
    registro = await db.registros_veiculos.find_one({"id": registro_id}, {"_id": 0})
    if isinstance(registro['created_at'], str):
        registro['created_at'] = datetime.fromisoformat(registro['created_at'])
    return RegistroVeiculo(**registro)

@api_router.delete("/registros-veiculos/{registro_id}")
async def delete_registro_veiculo(registro_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.registros_veiculos.delete_one({"id": registro_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registro não encontrado")
    
    return {"message": "Registro deletado com sucesso"}

# ========== DESPESAS ==========

@api_router.post("/despesas", response_model=Despesa)
async def create_despesa(despesa_data: DespesaCreate, current_user: dict = Depends(get_current_user)):
    data = despesa_data.data if despesa_data.data else datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    despesa_obj = Despesa(
        descricao=despesa_data.descricao,
        valor=despesa_data.valor,
        categoria=despesa_data.categoria,
        pago_por=despesa_data.pago_por,
        observacoes=despesa_data.observacoes,
        data=data
    )
    
    doc = despesa_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.despesas.insert_one(doc)
    return despesa_obj

@api_router.get("/despesas", response_model=List[Despesa])
async def get_despesas(data: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if data:
        query['data'] = data
    
    despesas = await db.despesas.find(query, {"_id": 0}).to_list(10000)
    for despesa in despesas:
        if isinstance(despesa['created_at'], str):
            despesa['created_at'] = datetime.fromisoformat(despesa['created_at'])
    return despesas

@api_router.delete("/despesas/{despesa_id}")
async def delete_despesa(despesa_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.despesas.delete_one({"id": despesa_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Despesa não encontrada")
    
    return {"message": "Despesa deletada com sucesso"}

# ========== MANUTENCOES ==========

@api_router.post("/manutencoes", response_model=Manutencao)
async def create_manutencao(manutencao_data: ManutencaoCreate, current_user: dict = Depends(get_current_user)):
    # Get veiculo info
    veiculo = await db.veiculos.find_one({"id": manutencao_data.veiculo_id}, {"_id": 0})
    if not veiculo:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    data = manutencao_data.data_realizada if manutencao_data.data_realizada else datetime.now(timezone.utc).strftime('%Y-%m-%d')
    
    # Calculate km_faltante if proxima_troca is set
    km_faltante = None
    if manutencao_data.km_proxima_troca:
        km_faltante = manutencao_data.km_proxima_troca - manutencao_data.km_atual
    
    manutencao_obj = Manutencao(
        veiculo_id=manutencao_data.veiculo_id,
        veiculo_placa=veiculo['placa'],
        veiculo_modelo=veiculo['modelo'],
        tipo=manutencao_data.tipo,
        descricao=manutencao_data.descricao,
        km_atual=manutencao_data.km_atual,
        km_proxima_troca=manutencao_data.km_proxima_troca,
        km_faltante=km_faltante,
        data_realizada=data,
        custo=manutencao_data.custo,
        pecas_trocadas=manutencao_data.pecas_trocadas,
        observacoes=manutencao_data.observacoes,
        status="concluida"
    )
    
    doc = manutencao_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.manutencoes.insert_one(doc)
    return manutencao_obj

@api_router.get("/manutencoes", response_model=List[Manutencao])
async def get_manutencoes(veiculo_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if veiculo_id:
        query['veiculo_id'] = veiculo_id
    
    manutencoes = await db.manutencoes.find(query, {"_id": 0}).sort("data_realizada", -1).to_list(10000)
    for manutencao in manutencoes:
        if isinstance(manutencao['created_at'], str):
            manutencao['created_at'] = datetime.fromisoformat(manutencao['created_at'])
    return manutencoes

@api_router.get("/manutencoes/proximas/{veiculo_id}")
async def get_proximas_manutencoes(veiculo_id: str, km_atual: float, current_user: dict = Depends(get_current_user)):
    """
    Get upcoming maintenance based on current km
    """
    # Get last maintenance records
    manutencoes = await db.manutencoes.find(
        {"veiculo_id": veiculo_id, "km_proxima_troca": {"$ne": None}},
        {"_id": 0}
    ).sort("data_realizada", -1).to_list(100)
    
    proximas = []
    for manutencao in manutencoes:
        if manutencao['km_proxima_troca']:
            km_faltante = manutencao['km_proxima_troca'] - km_atual
            status = "atrasada" if km_faltante < 0 else "proxima" if km_faltante < 1000 else "ok"
            
            proximas.append({
                "tipo": manutencao['tipo'],
                "descricao": manutencao['descricao'],
                "km_proxima_troca": manutencao['km_proxima_troca'],
                "km_faltante": km_faltante,
                "status": status
            })
    
    return proximas

@api_router.delete("/manutencoes/{manutencao_id}")
async def delete_manutencao(manutencao_id: str, current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Apenas admin pode deletar manutenções")
    
    result = await db.manutencoes.delete_one({"id": manutencao_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Manutenção não encontrada")
    
    return {"message": "Manutenção deletada com sucesso"}

# ========== REPORTS ==========

@api_router.get("/relatorios/diario", response_model=RelatorioResponse)
async def relatorio_diario(data: str, current_user: dict = Depends(get_current_user)):
    tasks = await db.tasks.find({"data": data}, {"_id": 0}).to_list(10000)
    despesas = await db.despesas.find({"data": data}, {"_id": 0}).to_list(10000)
    registros_veiculos = await db.registros_veiculos.find({"data": data}, {"_id": 0}).to_list(10000)
    
    # Get all colaboradores to calculate salaries
    colaboradores = await db.users.find({"role": "colaborador"}, {"_id": 0}).to_list(1000)
    
    total_tasks = sum(t['quantidade'] for t in tasks)
    total_custo = sum(t['custo_total'] for t in tasks)
    total_despesas = sum(d['valor'] for d in despesas)
    total_custo_veiculos = sum(r['custo_diesel'] for r in registros_veiculos)
    
    # Calculate salaries for active colaboradores on this day
    colaboradores_ativos_ids = set(t['colaborador_id'] for t in tasks)
    total_salarios = sum(
        (c.get('salario', 0) / 30) + c.get('bonus', 0) + c.get('horas_extras', 0)
        for c in colaboradores 
        if c['id'] in colaboradores_ativos_ids
    )
    
    # Calculate revenue (faturamento) - Valores de contrato Dott
    revenue_map = {
        "deploy": 2.80,
        "rebalancing": 2.80,  # deploy e rebalancing são o mesmo
        "swap": 3.00,
        "move": 3.20,
        "mecanica": 21.00
    }
    
    faturamento_bruto = sum(
        t['quantidade'] * revenue_map.get(t['tipo'], 3.00)
        for t in tasks
    )
    
    # Faturamento líquido = bruto - custos totais
    total_custos = total_custo + total_despesas + total_custo_veiculos + total_salarios
    faturamento_liquido = faturamento_bruto - total_custos
    
    # Por tipo
    por_tipo = {}
    for task in tasks:
        tipo = task['tipo']
        if tipo not in por_tipo:
            por_tipo[tipo] = {"quantidade": 0, "custo": 0, "faturamento": 0}
        por_tipo[tipo]['quantidade'] += task['quantidade']
        por_tipo[tipo]['custo'] += task['custo_total']
        por_tipo[tipo]['faturamento'] += task['quantidade'] * revenue_map.get(tipo, 3.00)
    
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
                "faturamento": 0,
                "por_tipo": {}
            }
        por_colab[colab_id]['quantidade'] += task['quantidade']
        por_colab[colab_id]['custo'] += task['custo_total']
        por_colab[colab_id]['faturamento'] += task['quantidade'] * revenue_map.get(task['tipo'], 3.00)
        
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
        por_turno=por_turno,
        total_despesas=total_despesas,
        total_custo_veiculos=total_custo_veiculos,
        faturamento_bruto=faturamento_bruto,
        faturamento_liquido=faturamento_liquido,
        total_salarios=total_salarios
    )

@api_router.get("/relatorios/periodo")
async def relatorio_periodo(
    data_inicio: str, 
    data_fim: str, 
    colaborador_id: Optional[str] = None,
    tipo_task: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Advanced report with filters
    """
    # Build query
    query = {"data": {"$gte": data_inicio, "$lte": data_fim}}
    
    if colaborador_id:
        query['colaborador_id'] = colaborador_id
    
    if tipo_task:
        query['tipo'] = tipo_task
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(10000)
    
    despesas = await db.despesas.find({
        "data": {"$gte": data_inicio, "$lte": data_fim}
    }, {"_id": 0}).to_list(10000)
    
    registros_veiculos = await db.registros_veiculos.find({
        "data": {"$gte": data_inicio, "$lte": data_fim}
    }, {"_id": 0}).to_list(10000)
    
    # Calculate totals
    revenue_map = {
        "deploy": 2.80,
        "rebalancing": 2.80,
        "swap": 3.00,
        "move": 3.20,
        "mecanica": 21.00
    }
    
    total_tasks = sum(t['quantidade'] for t in tasks)
    total_custo = sum(t['custo_total'] for t in tasks)
    total_faturamento = sum(t['quantidade'] * revenue_map.get(t['tipo'], 3.00) for t in tasks)
    total_despesas = sum(d['valor'] for d in despesas)
    total_custo_veiculos = sum(r['custo_diesel'] for r in registros_veiculos)
    
    # Group by date
    por_data = {}
    for task in tasks:
        data = task['data']
        if data not in por_data:
            por_data[data] = {"quantidade": 0, "custo": 0, "faturamento": 0}
        por_data[data]['quantidade'] += task['quantidade']
        por_data[data]['custo'] += task['custo_total']
        por_data[data]['faturamento'] += task['quantidade'] * revenue_map.get(task['tipo'], 3.00)
    
    # Group by tipo
    por_tipo = {}
    for task in tasks:
        tipo = task['tipo']
        if tipo not in por_tipo:
            por_tipo[tipo] = {"quantidade": 0, "custo": 0, "faturamento": 0}
        por_tipo[tipo]['quantidade'] += task['quantidade']
        por_tipo[tipo]['custo'] += task['custo_total']
        por_tipo[tipo]['faturamento'] += task['quantidade'] * revenue_map.get(tipo, 3.00)
    
    # Group by colaborador
    por_colaborador = {}
    for task in tasks:
        colab_id = task['colaborador_id']
        if colab_id not in por_colaborador:
            por_colaborador[colab_id] = {
                "id": colab_id,
                "nome": task['colaborador_nome'],
                "turno": task['turno'],
                "quantidade": 0,
                "custo": 0,
                "faturamento": 0
            }
        por_colaborador[colab_id]['quantidade'] += task['quantidade']
        por_colaborador[colab_id]['custo'] += task['custo_total']
        por_colaborador[colab_id]['faturamento'] += task['quantidade'] * revenue_map.get(task['tipo'], 3.00)
    
    return {
        "periodo": {"inicio": data_inicio, "fim": data_fim},
        "totais": {
            "tasks": total_tasks,
            "custo": total_custo,
            "faturamento": total_faturamento,
            "lucro": total_faturamento - (total_custo + total_despesas + total_custo_veiculos),
            "despesas": total_despesas,
            "custo_veiculos": total_custo_veiculos
        },
        "por_data": por_data,
        "por_tipo": por_tipo,
        "por_colaborador": list(por_colaborador.values()),
        "tasks": tasks,
        "despesas": despesas,
        "registros_veiculos": registros_veiculos
    }

# ========== MOCK APIs - External Data Simulation ==========

@api_router.get("/mock/fuel-price/milan")
async def get_milan_fuel_price():
    """
    Mock API - Simulates fuel price in Milan
    Real API: GlobalPetrolPrices or Fuelo.net
    """
    import random
    # Simulate real data with small variation
    base_price = 1.57  # €/liter base price for diesel in Milan
    variation = random.uniform(-0.03, 0.03)
    current_price = round(base_price + variation, 2)
    
    return {
        "city": "Milan",
        "country": "Italy",
        "fuel_type": "Diesel",
        "price_per_liter": current_price,
        "currency": "EUR",
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "Mock API (Simulated Data)"
    }

@api_router.get("/mock/vehicle-consumption/{model}")
async def get_vehicle_consumption(model: str):
    """
    Mock API - Simulates vehicle fuel consumption
    Real API: RapidAPI Cars Fuel Consumption or CarAPI
    """
    # Common vehicle models and their typical consumption
    vehicle_database = {
        "iveco daily": {"city": 14.5, "highway": 10.2, "combined": 12.0},
        "fiat ducato": {"city": 13.8, "highway": 9.8, "combined": 11.5},
        "ford transit": {"city": 14.2, "highway": 10.5, "combined": 12.2},
        "mercedes sprinter": {"city": 13.5, "highway": 9.5, "combined": 11.2},
        "renault master": {"city": 14.0, "highway": 10.0, "combined": 11.8},
        "volkswagen crafter": {"city": 13.2, "highway": 9.2, "combined": 10.9},
    }
    
    # Normalize model name for search
    model_lower = model.lower().strip()
    
    # Try to find vehicle in database
    consumption_data = None
    for key in vehicle_database.keys():
        if key in model_lower or model_lower in key:
            consumption_data = vehicle_database[key]
            break
    
    # Default values if vehicle not found
    if not consumption_data:
        consumption_data = {"city": 13.0, "highway": 9.5, "combined": 11.0}
    
    # Calculate km per liter (inverse of liters per 100km)
    km_per_liter = round(100 / consumption_data["combined"], 2)
    
    return {
        "model": model,
        "consumption_l_per_100km": consumption_data,
        "km_per_liter": km_per_liter,
        "fuel_type": "Diesel",
        "source": "Mock API (Simulated Data)",
        "note": "Real consumption may vary based on driving conditions"
    }

# ========== REGISTRO DE PRESENÇA (LOGIN/LOGOUT) ==========

@api_router.post("/presenca/registrar", response_model=RegistroPresenca)
async def registrar_presenca(registro_data: RegistroPresencaCreate, current_user: dict = Depends(get_current_user)):
    """
    Registra login ou logout do colaborador com localização (GPS)
    """
    user = await db.users.find_one({"id": registro_data.usuario_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    
    now = datetime.now(timezone.utc)
    data = registro_data.data if registro_data.data else now.strftime('%Y-%m-%d')
    hora = now.strftime('%H:%M:%S')
    
    registro_obj = RegistroPresenca(
        usuario_id=registro_data.usuario_id,
        usuario_nome=user['name'],
        tipo=registro_data.tipo,
        localizacao=registro_data.localizacao,
        data=data,
        hora=hora
    )
    
    doc = registro_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.registros_presenca.insert_one(doc)
    return registro_obj

@api_router.get("/presenca/registros")
async def get_registros_presenca(
    data_inicio: Optional[str] = None,
    data_fim: Optional[str] = None,
    usuario_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Busca registros de presença com filtros
    """
    query = {}
    
    if usuario_id:
        query['usuario_id'] = usuario_id
    
    if data_inicio and data_fim:
        query['data'] = {'$gte': data_inicio, '$lte': data_fim}
    elif data_inicio:
        query['data'] = {'$gte': data_inicio}
    elif data_fim:
        query['data'] = {'$lte': data_fim}
    
    registros = await db.registros_presenca.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    for registro in registros:
        if isinstance(registro.get('created_at'), str):
            registro['created_at'] = datetime.fromisoformat(registro['created_at'])
    
    return registros

# ========== RELATÓRIO MENSAL ==========

@api_router.get("/relatorios/mensal")
async def get_relatorio_mensal(
    mes: str, 
    ano: str,
    data_inicio_custom: Optional[str] = None,
    data_fim_custom: Optional[str] = None,
    colaborador_id: Optional[str] = None,
    tipo_funcionario: Optional[str] = None,  # "motorista", "mecanico", "todos"
    tipo_tarefa: Optional[str] = None,  # "deploy", "swap", "move", "mecanica", "todas"
    tipo_despesa: Optional[str] = None,  # "tasks", "gerais", "manutencao", "todas"
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    localizacao_filtro: Optional[str] = None,
    producao_min: Optional[int] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Gera relatório de fechamento mensal completo com filtros avançados
    mes: formato "01" a "12"
    ano: formato "2025"
    """
    # Datas do mês (ou período customizado)
    if data_inicio_custom and data_fim_custom:
        data_inicio = data_inicio_custom
        data_fim = data_fim_custom
    else:
        data_inicio = f"{ano}-{mes}-01"
        ultimo_dia = 31 if mes in ['01','03','05','07','08','10','12'] else 30 if mes in ['04','06','09','11'] else 28
        data_fim = f"{ano}-{mes}-{ultimo_dia}"
    
    # 1. Buscar tasks com filtros
    task_query = {"data": {"$gte": data_inicio, "$lte": data_fim}}
    if colaborador_id:
        task_query["colaborador_id"] = colaborador_id
    if tipo_tarefa and tipo_tarefa != "todas":
        task_query["tipo"] = tipo_tarefa
    
    tasks = await db.tasks.find(task_query, {"_id": 0}).to_list(10000)
    
    # 2. Buscar despesas com filtros
    despesa_query = {"data": {"$gte": data_inicio, "$lte": data_fim}}
    if valor_min is not None or valor_max is not None:
        despesa_query["valor"] = {}
        if valor_min is not None:
            despesa_query["valor"]["$gte"] = valor_min
        if valor_max is not None:
            despesa_query["valor"]["$lte"] = valor_max
    
    despesas = await db.despesas.find(despesa_query, {"_id": 0}).to_list(10000)
    
    # 3. Buscar manutenções do mês
    manutencao_query = {"data_realizada": {"$gte": data_inicio, "$lte": data_fim}}
    if colaborador_id:
        manutencao_query["realizado_por"] = colaborador_id
    
    manutencoes = await db.manutencoes.find(manutencao_query, {"_id": 0}).to_list(10000)
    
    # 4. Buscar registros de presença com filtro de localização
    presenca_query = {
        "data": {"$gte": data_inicio, "$lte": data_fim},
        "tipo": "login"
    }
    if colaborador_id:
        presenca_query["usuario_id"] = colaborador_id
    
    registros_presenca = await db.registros_presenca.find(presenca_query, {"_id": 0}).to_list(10000)
    
    # Filtro de localização (busca parcial no endereço)
    if localizacao_filtro:
        registros_presenca = [
            r for r in registros_presenca 
            if r.get('localizacao') and localizacao_filtro.lower() in r['localizacao'].get('endereco', '').lower()
        ]
    
    # 5. Buscar colaboradores com filtros
    colab_query = {"role": "colaborador"}
    if tipo_funcionario and tipo_funcionario != "todos":
        colab_query["tipo_funcionario"] = tipo_funcionario
    if colaborador_id:
        colab_query["id"] = colaborador_id
    
    colaboradores = await db.users.find(colab_query, {"_id": 0}).to_list(100)
    
    # Valores de contrato
    valoresContrato = {
        "deploy": 2.80,
        "rebalancing": 2.80,
        "swap": 3.00,
        "move": 3.20,
        "mecanica": 21.00
    }
    
    # Calcular faturamento total
    faturamento_total = sum(task['quantidade'] * valoresContrato.get(task['tipo'], 3.00) for task in tasks)
    
    # Calcular despesas de tasks
    despesas_tasks = sum(task['custo_total'] for task in tasks)
    
    # Calcular despesas gerais
    despesas_gerais = sum(d['valor'] for d in despesas)
    
    # Calcular despesas de manutenção
    despesas_manutencao = sum(m['custo'] for m in manutencoes)
    
    # Filtrar despesas por tipo se especificado
    if tipo_despesa and tipo_despesa != "todas":
        if tipo_despesa == "gerais":
            despesas_manutencao = 0
        elif tipo_despesa == "manutencao":
            despesas_gerais = 0
        elif tipo_despesa == "tasks":
            despesas_gerais = 0
            despesas_manutencao = 0
    
    # Calcular pagamentos por colaborador
    pagamentos_colaboradores = []
    total_pagamentos = 0
    
    for colab in colaboradores:
        # Contar diárias (dias únicos com login)
        diarias = len(set(r['data'] for r in registros_presenca if r['usuario_id'] == colab['id']))
        
        # Tasks do colaborador
        tasks_colab = [t for t in tasks if t['colaborador_id'] == colab['id']]
        total_tasks = sum(t['quantidade'] for t in tasks_colab)
        
        # Manutenções do colaborador (se for mecânico)
        manutencoes_colab = [m for m in manutencoes if m.get('realizado_por') == colab['id']]
        total_manutencoes = len(manutencoes_colab)
        
        # Calcular salário baseado na forma de faturamento
        forma_faturamento = colab.get('forma_faturamento', 'salario_fixo')
        salario_base = 0
        valor_producao = 0
        valor_diarias = 0
        
        if forma_faturamento == 'diaria':
            # Diária: Dias Trabalhados × Valor da Diária
            valor_diaria = colab.get('valor_diaria', 0)
            valor_diarias = diarias * valor_diaria
            salario_total = valor_diarias + colab.get('bonus', 0)
            
        elif forma_faturamento == 'salario_fixo':
            # Salário Fixo: Valor fixo mensal
            salario_base = colab.get('salario', 0)
            salario_total = salario_base + colab.get('bonus', 0)
            
        elif forma_faturamento == 'producao':
            # Produção: Quantidade de Tasks × Valor por Task
            valor_por_task = colab.get('valor_por_task', 0)
            if colab.get('tipo_funcionario') == 'mecanico':
                # Mecânico: conta manutenções
                valor_producao = total_manutencoes * valor_por_task
            else:
                # Motorista: conta tasks
                valor_producao = total_tasks * valor_por_task
            salario_total = valor_producao + colab.get('bonus', 0)
            
        elif forma_faturamento == 'diaria_producao':
            # Diária + Produção: (Dias × Diária) + (Tasks × Valor)
            valor_diaria = colab.get('valor_diaria', 0)
            valor_por_task = colab.get('valor_por_task', 0)
            valor_diarias = diarias * valor_diaria
            
            if colab.get('tipo_funcionario') == 'mecanico':
                valor_producao = total_manutencoes * valor_por_task
            else:
                valor_producao = total_tasks * valor_por_task
            
            salario_total = valor_diarias + valor_producao + colab.get('bonus', 0)
        
        else:
            # Fallback para lógica antiga (compatibilidade)
            if colab.get('tipo_funcionario') == 'mecanico':
                salario_base = colab.get('salario', 0)
                bonus_producao = total_manutencoes * colab.get('bonus_por_producao', 0)
                salario_total = salario_base + bonus_producao + colab.get('bonus', 0)
            else:
                salario_base = colab.get('salario', 0)
                custo_tasks = sum(t['custo_total'] for t in tasks_colab)
                salario_total = salario_base + custo_tasks + colab.get('bonus', 0)
        
        # Filtro de produção mínima
        if producao_min is not None:
            total_producao = total_tasks + total_manutencoes
            if total_producao < producao_min:
                continue  # Pula colaboradores abaixo da produção mínima
        
        total_pagamentos += salario_total
        
        pagamentos_colaboradores.append({
            "nome": colab['name'],
            "tipo": colab.get('tipo_funcionario', 'motorista'),
            "tipo_contrato": colab.get('tipo_contrato', 'contrato'),
            "forma_faturamento": forma_faturamento,
            "diarias_trabalhadas": diarias,
            "total_tasks": total_tasks,
            "total_manutencoes": total_manutencoes,
            "salario_base": salario_base,
            "valor_diarias": valor_diarias,
            "valor_producao": valor_producao,
            "bonus": colab.get('bonus', 0),
            "salario_total": salario_total
        })
    
    # Calcular lucro líquido
    despesas_totais = despesas_tasks + despesas_gerais + despesas_manutencao + total_pagamentos
    lucro_liquido = faturamento_total - despesas_totais
    
    return {
        "mes": mes,
        "ano": ano,
        "periodo": f"{data_inicio} a {data_fim}",
        "resumo_tarefas": {
            "total_tarefas": len(tasks),
            "total_manutencoes": len(manutencoes),
            "por_tipo": {}
        },
        "faturamento": {
            "total": faturamento_total
        },
        "despesas": {
            "despesas_tasks": despesas_tasks,
            "despesas_gerais": despesas_gerais,
            "despesas_manutencao": despesas_manutencao,
            "pagamentos_colaboradores": total_pagamentos,
            "total": despesas_totais
        },
        "pagamentos_colaboradores": pagamentos_colaboradores,
        "lucro_liquido": lucro_liquido,
        "margem_lucro": (lucro_liquido / faturamento_total * 100) if faturamento_total > 0 else 0,
        "registros_localizacao": {
            "total_registros": len(registros_presenca),
            "registros": registros_presenca[:50]  # Primeiros 50
        }
    }

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
