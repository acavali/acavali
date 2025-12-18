# 🔐 Como Criar Administradores e Colaboradores

## 🚀 Método 1: Script Interativo (RECOMENDADO)

### **Passo a Passo:**

1. **Acesse o terminal/console do servidor**

2. **Execute o script:**
   ```bash
   cd /app
   python3 criar_admin.py
   ```

3. **Escolha a opção no menu:**
   - `1` - Criar Administrador
   - `2` - Criar Colaborador
   - `3` - Listar todos os usuários
   - `4` - Resetar senha
   - `5` - Deletar usuário

4. **Siga as instruções na tela**

### **Exemplo - Criar Administrador:**
```
🎯 Escolha uma opção: 1

📝 Nome completo: Maria Silva
📧 Email: maria.admin@sistema.com
🔑 Senha: MinhaSenh@123

✅ USUÁRIO CRIADO COM SUCESSO!
```

### **Exemplo - Criar Colaborador:**
```
🎯 Escolha uma opção: 2

📝 Nome completo: João Santos
📧 Email: joao@sistema.com
🔑 Senha: senha123
🌓 Turno (dia/noite): dia
💰 Custo por Swap (€): 0.50
💰 Custo por Move (€): 0.60
💰 Custo por Rebalancing (€): 0.40
💰 Salário mensal (€): 1500
💰 Bônus (€): 100

✅ USUÁRIO CRIADO COM SUCESSO!
```

---

## 📝 Método 2: Comando Rápido (Python)

### **Criar Administrador:**
```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def criar_admin():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # ALTERE AQUI os dados do novo admin
    novo_admin = {
        "id": str(uuid.uuid4()),
        "name": "Seu Nome Aqui",
        "email": "seu.email@sistema.com",
        "password": pwd_context.hash("sua-senha-aqui"),
        "role": "admin",
        "turno": None,
        "custo_swap": 0.0,
        "custo_move": 0.0,
        "custo_rebalancing": 0.0,
        "salario": 0.0,
        "bonus": 0.0,
        "horas_extras": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Verificar se email já existe
    existing = await db.users.find_one({"email": novo_admin["email"]})
    if existing:
        print(f"❌ Email {novo_admin['email']} já cadastrado!")
        return
    
    await db.users.insert_one(novo_admin)
    print(f"✅ Admin criado!")
    print(f"   Email: {novo_admin['email']}")
    print(f"   Senha: sua-senha-aqui")

asyncio.run(criar_admin())
EOF
```

### **Criar Colaborador:**
```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def criar_colaborador():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # ALTERE AQUI os dados do novo colaborador
    novo_colab = {
        "id": str(uuid.uuid4()),
        "name": "Nome do Colaborador",
        "email": "colaborador@sistema.com",
        "password": pwd_context.hash("senha123"),
        "role": "colaborador",
        "turno": "dia",  # "dia" ou "noite"
        "custo_swap": 0.5,
        "custo_move": 0.6,
        "custo_rebalancing": 0.4,
        "salario": 1500.0,
        "bonus": 100.0,
        "horas_extras": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Verificar se email já existe
    existing = await db.users.find_one({"email": novo_colab["email"]})
    if existing:
        print(f"❌ Email {novo_colab['email']} já cadastrado!")
        return
    
    await db.users.insert_one(novo_colab)
    print(f"✅ Colaborador criado!")
    print(f"   Email: {novo_colab['email']}")
    print(f"   Senha: senha123")
    print(f"   Turno: {novo_colab['turno']}")

asyncio.run(criar_colaborador())
EOF
```

---

## 📋 Método 3: Via API (curl)

### **Criar usuário via endpoint:**
```bash
curl -X POST https://seu-dominio.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nome Completo",
    "email": "email@sistema.com",
    "password": "senha123",
    "role": "admin",
    "turno": null,
    "custo_swap": 0,
    "custo_move": 0,
    "custo_rebalancing": 0,
    "salario": 0,
    "bonus": 0,
    "horas_extras": 0
  }'
```

**Para colaborador, altere:**
- `"role": "colaborador"`
- `"turno": "dia"` ou `"turno": "noite"`
- Adicione os valores de custo e salário

---

## 👥 Listar Usuários Existentes

```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')

async def listar():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(length=100)
    
    print("\n👥 USUÁRIOS CADASTRADOS:")
    print("="*60)
    for user in users:
        print(f"\n📧 {user['email']}")
        print(f"   Nome: {user['name']}")
        print(f"   Tipo: {user['role']}")
        if user.get('turno'):
            print(f"   Turno: {user['turno']}")
    print("\n" + "="*60)

asyncio.run(listar())
EOF
```

---

## 🔄 Resetar Senha de Usuário

```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def resetar_senha():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # ALTERE AQUI
    email = "usuario@sistema.com"
    nova_senha = "nova-senha-123"
    
    result = await db.users.update_one(
        {"email": email},
        {"$set": {"password": pwd_context.hash(nova_senha)}}
    )
    
    if result.modified_count > 0:
        print(f"✅ Senha resetada para: {email}")
        print(f"   Nova senha: {nova_senha}")
    else:
        print(f"❌ Usuário {email} não encontrado!")

asyncio.run(resetar_senha())
EOF
```

---

## 🗑️ Deletar Usuário

```bash
cd /app/backend && python3 << 'EOF'
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path('.')
load_dotenv(ROOT_DIR / '.env')

async def deletar():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # ALTERE AQUI
    email = "usuario@deletar.com"
    
    result = await db.users.delete_one({"email": email})
    
    if result.deleted_count > 0:
        print(f"✅ Usuário {email} deletado!")
    else:
        print(f"❌ Usuário {email} não encontrado!")

asyncio.run(deletar())
EOF
```

---

## 📝 Usuários Pré-Cadastrados

### **Administrador Padrão:**
- Email: `admin@sistema.com`
- Senha: `admin123`
- Tipo: Admin

### **Colaboradores de Teste:**
1. **João Silva**
   - Email: `joao@sistema.com`
   - Senha: `senha123`
   - Turno: Dia

2. **Maria Santos**
   - Email: `maria@sistema.com`
   - Senha: `senha123`
   - Turno: Noite

3. **Pedro Costa**
   - Email: `pedro@sistema.com`
   - Senha: `senha123`
   - Turno: Dia

---

## ⚠️ SEGURANÇA IMPORTANTE

✅ **Use senhas fortes** para administradores
✅ **Não compartilhe** credenciais de admin
✅ **Altere a senha padrão** do admin imediatamente
✅ **Use emails únicos** para cada usuário
✅ **Documente** as credenciais em local seguro

---

## ❓ Dúvidas Comuns

**P: Posso ter múltiplos admins?**
R: Sim! Crie quantos administradores precisar.

**P: Como alterar dados de um colaborador?**
R: Use o dashboard admin ou delete e recrie o usuário.

**P: Esqueci a senha do admin principal.**
R: Use o Método 2 para resetar a senha diretamente no banco.

**P: O email precisa ser real?**
R: Não precisa ser um email válido/existente, mas deve ser único no sistema.

---

**Última atualização:** Dezembro 2024
