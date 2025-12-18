#!/usr/bin/env python3
"""
Script para criar Administradores e Colaboradores
Sistema de Produção - Bicicletas Elétricas
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
from passlib.context import CryptContext
import uuid
from datetime import datetime, timezone

# Configuração
ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

async def criar_usuario(tipo='admin'):
    """
    Criar novo usuário (admin ou colaborador)
    """
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("\n" + "="*60)
    print(f"🔐 CRIAR NOVO {'ADMINISTRADOR' if tipo == 'admin' else 'COLABORADOR'}")
    print("="*60 + "\n")
    
    # Solicitar dados
    nome = input("📝 Nome completo: ").strip()
    email = input("📧 Email: ").strip().lower()
    senha = input("🔑 Senha: ").strip()
    
    # Validar email único
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"\n❌ ERRO: Email '{email}' já está cadastrado!")
        return
    
    # Dados adicionais para colaborador
    turno = None
    custo_swap = 0.0
    custo_move = 0.0
    custo_rebalancing = 0.0
    salario = 0.0
    bonus = 0.0
    
    if tipo == 'colaborador':
        print("\n📋 Dados adicionais do colaborador:")
        turno = input("🌓 Turno (dia/noite): ").strip().lower()
        while turno not in ['dia', 'noite']:
            print("❌ Turno inválido! Use 'dia' ou 'noite'")
            turno = input("🌓 Turno (dia/noite): ").strip().lower()
        
        custo_swap = float(input("💰 Custo por Swap (€): ") or "0.5")
        custo_move = float(input("💰 Custo por Move (€): ") or "0.6")
        custo_rebalancing = float(input("💰 Custo por Rebalancing (€): ") or "0.4")
        salario = float(input("💰 Salário mensal (€): ") or "0")
        bonus = float(input("💰 Bônus (€): ") or "0")
    
    # Criar usuário
    user_data = {
        "id": str(uuid.uuid4()),
        "name": nome,
        "email": email,
        "password": hash_password(senha),
        "role": tipo,
        "turno": turno,
        "custo_swap": custo_swap,
        "custo_move": custo_move,
        "custo_rebalancing": custo_rebalancing,
        "salario": salario,
        "bonus": bonus,
        "horas_extras": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_data)
    
    print("\n" + "="*60)
    print("✅ USUÁRIO CRIADO COM SUCESSO!")
    print("="*60)
    print(f"\n📋 Dados de acesso:")
    print(f"   Nome: {nome}")
    print(f"   Email: {email}")
    print(f"   Senha: {senha}")
    print(f"   Tipo: {tipo.upper()}")
    if tipo == 'colaborador':
        print(f"   Turno: {turno}")
    print("\n💡 Guarde essas informações em local seguro!")
    print("="*60 + "\n")

async def listar_usuarios():
    """
    Listar todos os usuários cadastrados
    """
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    users = await db.users.find({}, {"_id": 0, "password": 0}).to_list(length=100)
    
    print("\n" + "="*60)
    print("👥 USUÁRIOS CADASTRADOS")
    print("="*60 + "\n")
    
    admins = [u for u in users if u.get('role') == 'admin']
    colaboradores = [u for u in users if u.get('role') == 'colaborador']
    
    print(f"👨‍💼 Administradores ({len(admins)}):")
    for user in admins:
        print(f"   • {user['name']} - {user['email']}")
    
    print(f"\n👷 Colaboradores ({len(colaboradores)}):")
    for user in colaboradores:
        turno = user.get('turno', 'N/A')
        print(f"   • {user['name']} - {user['email']} (Turno: {turno})")
    
    print("\n" + "="*60 + "\n")

async def deletar_usuario():
    """
    Deletar usuário por email
    """
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("\n" + "="*60)
    print("🗑️  DELETAR USUÁRIO")
    print("="*60 + "\n")
    
    email = input("📧 Email do usuário para deletar: ").strip().lower()
    
    user = await db.users.find_one({"email": email})
    if not user:
        print(f"\n❌ Usuário com email '{email}' não encontrado!")
        return
    
    print(f"\n⚠️  Confirmar exclusão de:")
    print(f"   Nome: {user['name']}")
    print(f"   Email: {user['email']}")
    print(f"   Tipo: {user['role']}")
    
    confirmar = input("\n❓ Tem certeza? (sim/não): ").strip().lower()
    
    if confirmar == 'sim':
        await db.users.delete_one({"email": email})
        print(f"\n✅ Usuário '{user['name']}' deletado com sucesso!")
    else:
        print("\n❌ Operação cancelada!")
    
    print("="*60 + "\n")

async def resetar_senha():
    """
    Resetar senha de um usuário
    """
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("\n" + "="*60)
    print("🔄 RESETAR SENHA")
    print("="*60 + "\n")
    
    email = input("📧 Email do usuário: ").strip().lower()
    
    user = await db.users.find_one({"email": email})
    if not user:
        print(f"\n❌ Usuário com email '{email}' não encontrado!")
        return
    
    print(f"\n👤 Usuário: {user['name']}")
    nova_senha = input("🔑 Nova senha: ").strip()
    
    await db.users.update_one(
        {"email": email},
        {"$set": {"password": hash_password(nova_senha)}}
    )
    
    print(f"\n✅ Senha alterada com sucesso!")
    print(f"   Email: {email}")
    print(f"   Nova senha: {nova_senha}")
    print("="*60 + "\n")

async def menu():
    """
    Menu principal
    """
    while True:
        print("\n" + "="*60)
        print("🚲 SISTEMA DE PRODUÇÃO - GERENCIAMENTO DE USUÁRIOS")
        print("="*60)
        print("\n1. 👨‍💼 Criar Administrador")
        print("2. 👷 Criar Colaborador")
        print("3. 👥 Listar Usuários")
        print("4. 🔄 Resetar Senha")
        print("5. 🗑️  Deletar Usuário")
        print("6. ❌ Sair")
        print("\n" + "="*60)
        
        opcao = input("\n🎯 Escolha uma opção: ").strip()
        
        if opcao == '1':
            await criar_usuario('admin')
        elif opcao == '2':
            await criar_usuario('colaborador')
        elif opcao == '3':
            await listar_usuarios()
        elif opcao == '4':
            await resetar_senha()
        elif opcao == '5':
            await deletar_usuario()
        elif opcao == '6':
            print("\n👋 Até logo!\n")
            break
        else:
            print("\n❌ Opção inválida!")
        
        input("\n⏎ Pressione ENTER para continuar...")

if __name__ == "__main__":
    try:
        asyncio.run(menu())
    except KeyboardInterrupt:
        print("\n\n👋 Saindo...\n")
    except Exception as e:
        print(f"\n❌ Erro: {e}\n")
