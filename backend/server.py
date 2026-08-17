from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

ARTWORKS = [
    {
        "slug": "neon-oracle",
        "title": "NEON ORACLE",
        "category": "characters",
        "year": 2026,
        "image": "https://images.unsplash.com/photo-1750096319146-6310519b5af2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwzfHxjeWJlcnB1bmslMjAzZCUyMGNoYXJhY3RlciUyMHBvcnRyYWl0fGVufDB8fHx8MTc4Njk0NjkxMnww&ixlib=rb-4.1.0&q=85",
        "description": "A cybernetic seer built for a cyberpunk RPG pitch. High-poly sculpt in ZBrush, retopo in Blender, emissive circuit tattoos hand-painted in Substance 3D. Lit as a three-point cinematic portrait inside Unreal Engine 5.",
        "software": ["ZBrush", "Blender", "Substance 3D", "UE5"],
        "polycount": "48K tris",
    },
    {
        "slug": "chrome-sentinel",
        "title": "CHROME SENTINEL",
        "category": "characters",
        "year": 2025,
        "image": "https://images.pexels.com/photos/20434858/pexels-photo-20434858.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Character study of a synthetic bodyguard in a mirrored exo-suit. Focus on cloth sim over hard-surface plates and anisotropic metal shading that holds up in close-up cinematics.",
        "software": ["Blender", "Marvelous Designer", "Substance 3D"],
        "polycount": "62K tris",
    },
    {
        "slug": "sector-7",
        "title": "SECTOR 7",
        "category": "environments",
        "year": 2026,
        "image": "https://images.pexels.com/photos/18337644/pexels-photo-18337644.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Modular neon district kit — 40 unique building modules snapped to a 2m grid, with a master material driving all emissive signage. Built for real-time at 60fps in UE5 with Lumen.",
        "software": ["Blender", "UE5", "Substance 3D"],
        "polycount": "1.2M tris / scene",
    },
    {
        "slug": "control-deck",
        "title": "CONTROL DECK",
        "category": "environments",
        "year": 2024,
        "image": "https://images.pexels.com/photos/7671959/pexels-photo-7671959.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
        "description": "Interior environment for a derelict starship bridge. Trim-sheet workflow across all panels, decal-driven damage pass, and a flickering hologram shader as the focal point.",
        "software": ["Maya", "Substance 3D", "UE5"],
        "polycount": "840K tris / scene",
    },
    {
        "slug": "pulse-sidearm",
        "title": "PULSE SIDEARM",
        "category": "props",
        "year": 2025,
        "image": "https://images.unsplash.com/photo-1688288822105-1dc8fdf9a07e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHwzZCUyMHNjaS1maSUyMHdlYXBvbiUyMHByb3B8ZW58MHx8fHwxNzg2OTQ2OTEyfDA&ixlib=rb-4.1.0&q=85",
        "description": "First-person energy pistol concept to engine-ready prop. Weighted normals workflow, 4K PBR set, and a charge-up emissive state driven by a single material parameter.",
        "software": ["Blender", "Substance 3D", "Marmoset"],
        "polycount": "18K tris",
    },
    {
        "slug": "mk4-longrifle",
        "title": "MK-4 LONGRIFLE",
        "category": "props",
        "year": 2024,
        "image": "https://images.unsplash.com/photo-1588425090516-b339647f1fec?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHwzZCUyMHNjaS1maSUyMHdlYXBvbiUyMHByb3B8ZW58MHx8fHwxNzg2OTQ2OTEyfDA&ixlib=rb-4.1.0&q=85",
        "description": "Military marksman platform with full attachment rail system. Hard-surface booleans cleaned to subdivision-ready geometry, textured with a worn cerakote finish and dust accumulation masks.",
        "software": ["Fusion 360", "Blender", "Substance 3D"],
        "polycount": "24K tris",
    },
    {
        "slug": "grid-relics",
        "title": "GRID RELICS",
        "category": "props",
        "year": 2026,
        "image": "https://images.unsplash.com/photo-1634585738250-09ee92cae0f8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHw0fHwzZCUyMHNjaS1maSUyMHdlYXBvbiUyMHByb3B8ZW58MHx8fHwxNzg2OTQ2OTEyfDA&ixlib=rb-4.1.0&q=85",
        "description": "A set of abstract holo-artifacts designed as collectible pickups. Each relic shares one shader with per-instance color and scanline offsets, keeping draw calls to a minimum.",
        "software": ["Houdini", "Blender", "UE5"],
        "polycount": "9K tris / set",
    },
]

@api_router.get("/")
async def root():
    return {"message": "Kai Voss portfolio API"}

@api_router.get("/artworks")
async def get_artworks():
    return await db.artworks.find({}, {"_id": 0}).to_list(100)

@api_router.get("/artworks/{slug}")
async def get_artwork(slug: str):
    art = await db.artworks.find_one({"slug": slug}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return art

@app.on_event("startup")
async def seed_artworks():
    for art in ARTWORKS:
        await db.artworks.update_one({"slug": art["slug"]}, {"$set": art}, upsert=True)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
