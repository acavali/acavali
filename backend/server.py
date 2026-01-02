from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Product Models
class StickerProduct(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    name_it: str
    description: str
    description_it: str
    category: str  # sagomato, tondo, rettangolare, ovale, quadrato, fogli
    base_price: float
    image_url: str
    rating: float = 5.0
    reviews_count: int = 0
    features: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StickerProductCreate(BaseModel):
    name: str
    name_it: str
    description: str
    description_it: str
    category: str
    base_price: float
    image_url: str
    features: List[str] = []

# Order Models
class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    size: str
    price: float

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[OrderItem]
    total_amount: float
    notes: Optional[str] = None
    status: str = "pending"  # pending, processing, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    items: List[OrderItem]
    total_amount: float
    notes: Optional[str] = None

# Contact Form Model
class ContactForm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactFormCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: str
    message: str

# Routes
@api_router.get("/")
async def root():
    return {"message": "Point Sign Milano API"}

# Sticker Products Routes
@api_router.post("/products", response_model=StickerProduct)
async def create_product(product: StickerProductCreate):
    product_obj = StickerProduct(**product.model_dump())
    doc = product_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.products.insert_one(doc)
    return product_obj

@api_router.get("/products", response_model=List[StickerProduct])
async def get_products(category: Optional[str] = None):
    query = {"category": category} if category else {}
    products = await db.products.find(query, {"_id": 0}).to_list(1000)
    
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return products

@api_router.get("/products/{product_id}", response_model=StickerProduct)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    
    return product

# Orders Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate):
    order_obj = Order(**order.model_dump())
    doc = order_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    return order_obj

@api_router.get("/orders", response_model=List[Order])
async def get_orders():
    orders = await db.orders.find({}, {"_id": 0}).to_list(1000)
    
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return orders

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if isinstance(order.get('created_at'), str):
        order['created_at'] = datetime.fromisoformat(order['created_at'])
    
    return order

# Contact Form Routes
@api_router.post("/contact", response_model=ContactForm)
async def submit_contact_form(form: ContactFormCreate):
    form_obj = ContactForm(**form.model_dump())
    doc = form_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.contacts.insert_one(doc)
    return form_obj

@api_router.get("/contact", response_model=List[ContactForm])
async def get_contact_forms():
    forms = await db.contacts.find({}, {"_id": 0}).to_list(1000)
    
    for form in forms:
        if isinstance(form.get('created_at'), str):
            form['created_at'] = datetime.fromisoformat(form['created_at'])
    
    return forms

# Initialize default products
@api_router.post("/init-products")
async def initialize_products():
    # Check if products already exist
    count = await db.products.count_documents({})
    if count > 0:
        return {"message": "Products already initialized"}
    
    default_products = [
        {
            "id": str(uuid.uuid4()),
            "name": "Die Cut Sticker",
            "name_it": "Sticker Sagomato",
            "description": "Custom shaped stickers cut to your design",
            "description_it": "Adesivi personalizzati sagomati secondo il tuo design",
            "category": "sagomato",
            "base_price": 15.00,
            "image_url": "https://placehold.co/400x400/E63946/white?text=Sagomato",
            "rating": 5.0,
            "reviews_count": 48,
            "features": ["Forma personalizzata", "Alta qualità", "Resistente all'acqua"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Round Sticker",
            "name_it": "Sticker Tondo",
            "description": "Perfect circular stickers for any occasion",
            "description_it": "Adesivi circolari perfetti per ogni occasione",
            "category": "tondo",
            "base_price": 12.00,
            "image_url": "https://placehold.co/400x400/1D3557/white?text=Tondo",
            "rating": 4.96,
            "reviews_count": 52,
            "features": ["Forma circolare", "Varie dimensioni", "Stampa HD"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Rectangular Sticker",
            "name_it": "Sticker Rettangolare",
            "description": "Classic rectangular stickers",
            "description_it": "Adesivi rettangolari classici",
            "category": "rettangolare",
            "base_price": 10.00,
            "image_url": "https://placehold.co/400x400/E63946/white?text=Rettangolare",
            "rating": 5.0,
            "reviews_count": 35,
            "features": ["Versatile", "Ottima adesione", "Facile da applicare"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Oval Sticker",
            "name_it": "Sticker Ovale",
            "description": "Elegant oval shaped stickers",
            "description_it": "Eleganti adesivi di forma ovale",
            "category": "ovale",
            "base_price": 11.00,
            "image_url": "https://placehold.co/400x400/1D3557/white?text=Ovale",
            "rating": 5.0,
            "reviews_count": 28,
            "features": ["Forma elegante", "Perfetto per loghi", "Durevole"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Square Sticker",
            "name_it": "Sticker Quadrato",
            "description": "Perfect square stickers",
            "description_it": "Adesivi quadrati perfetti",
            "category": "quadrato",
            "base_price": 10.00,
            "image_url": "https://placehold.co/400x400/E63946/white?text=Quadrato",
            "rating": 5.0,
            "reviews_count": 42,
            "features": ["Forma quadrata", "Dimensioni varie", "Alta qualità"],
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sticker Sheets",
            "name_it": "Fogli di Stickers",
            "description": "Multiple stickers on a sheet",
            "description_it": "Più adesivi su un foglio",
            "category": "fogli",
            "base_price": 25.00,
            "image_url": "https://placehold.co/400x400/1D3557/white?text=Fogli",
            "rating": 5.0,
            "reviews_count": 31,
            "features": ["Economico", "Molte varianti", "Ideale per eventi"],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.products.insert_many(default_products)
    return {"message": f"Initialized {len(default_products)} products"}

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
