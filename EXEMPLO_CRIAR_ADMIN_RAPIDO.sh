#!/bin/bash
#
# Script Rápido para Criar Novo Administrador
# Edite as variáveis abaixo e execute: bash /app/EXEMPLO_CRIAR_ADMIN_RAPIDO.sh
#

# ============================================================
# CONFIGURAÇÃO - ALTERE AQUI OS DADOS DO NOVO ADMIN
# ============================================================

NOME="Novo Administrador"
EMAIL="novo.admin@sistema.com"
SENHA="SenhaSuperSegura123!"

# ============================================================
# NÃO EDITE ABAIXO DESTA LINHA
# ============================================================

echo ""
echo "============================================================"
echo "🔐 CRIANDO NOVO ADMINISTRADOR"
echo "============================================================"
echo ""
echo "Nome:  $NOME"
echo "Email: $EMAIL"
echo "Senha: $SENHA"
echo ""
echo "⏳ Aguarde..."
echo ""

cd /app/backend && python3 << EOF
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
    
    novo_admin = {
        "id": str(uuid.uuid4()),
        "name": "$NOME",
        "email": "$EMAIL",
        "password": pwd_context.hash("$SENHA"),
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
    
    existing = await db.users.find_one({"email": novo_admin["email"]})
    if existing:
        print(f"❌ ERRO: Email {novo_admin['email']} já está cadastrado!")
        return False
    
    await db.users.insert_one(novo_admin)
    return True

if asyncio.run(criar_admin()):
    print("")
    print("============================================================")
    print("✅ ADMINISTRADOR CRIADO COM SUCESSO!")
    print("============================================================")
    print("")
    print("📋 Dados de acesso:")
    print(f"   Nome:  $NOME")
    print(f"   Email: $EMAIL")
    print(f"   Senha: $SENHA")
    print("")
    print("💡 Anote essas credenciais em local seguro!")
    print("")
    print("🌐 Acesse: https://seu-dominio.com")
    print("")
    print("============================================================")
else:
    print("")
    print("============================================================")
    print("❌ FALHA AO CRIAR ADMINISTRADOR")
    print("============================================================")
    print("")
EOF

echo ""
