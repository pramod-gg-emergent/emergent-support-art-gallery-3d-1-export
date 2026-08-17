from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, UploadFile, File, Depends
from fastapi.responses import Response as FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import List, Literal
import os
import re
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import bcrypt
import io
import jwt
import requests
from PIL import Image, ImageEnhance

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {"sub": user_id, "email": email, "exp": datetime.now(timezone.utc) + timedelta(hours=12), "type": "access"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload["email"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
APP_NAME = "kai-voss-portfolio"
storage_key = None

def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": os.environ.get("EMERGENT_LLM_KEY")}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": init_storage(), "Content-Type": content_type},
        data=data, timeout=120,
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str):
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": init_storage()}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

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
    arts = await db.artworks.find({}, {"_id": 0}).to_list(200)
    return sorted(arts, key=lambda a: a.get("order", 999))

@api_router.get("/artworks/{slug}")
async def get_artwork(slug: str):
    art = await db.artworks.find_one({"slug": slug}, {"_id": 0})
    if not art:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return art

class LoginIn(BaseModel):
    email: str
    password: str

@api_router.post("/auth/login")
async def login(input: LoginIn, request: Request, response: Response):
    email = input.email.lower().strip()
    identifier = f"{request.client.host}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        updated = attempts.get("updated_at")
        if updated and updated.tzinfo is None:
            updated = updated.replace(tzinfo=timezone.utc)
        if updated and datetime.now(timezone.utc) - updated < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(input.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"updated_at": datetime.now(timezone.utc)}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(str(user["_id"]), email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="none", max_age=43200, path="/")
    return {"email": email, "name": user.get("name", "Admin"), "role": user.get("role", "admin")}

@api_router.get("/auth/me")
async def auth_me(user=Depends(get_current_user)):
    return user

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}

class MediaItem(BaseModel):
    type: Literal["image", "video", "model"]
    url: str
    label: str = ""
    stacked: bool = False

class ArtworkIn(BaseModel):
    title: str
    category: Literal["characters", "environments", "props", "low-poly"]
    year: int
    image: str
    description: str
    software: List[str]
    polycount: str
    media: List[MediaItem] = []
    stack: bool = False
    fit: bool = False

def slugify(title: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-") or "artwork"

@api_router.post("/artworks", status_code=201)
async def create_artwork(input: ArtworkIn, user=Depends(get_current_user)):
    doc = input.model_dump()
    base = slugify(doc["title"])
    slug = base
    n = 2
    while await db.artworks.find_one({"slug": slug}):
        slug = f"{base}-{n}"
        n += 1
    doc["slug"] = slug
    doc["order"] = await db.artworks.count_documents({})
    await db.artworks.insert_one(doc)
    doc.pop("_id", None)
    return doc

class ReorderIn(BaseModel):
    slugs: List[str]

@api_router.post("/artworks/reorder")
async def reorder_artworks(input: ReorderIn, user=Depends(get_current_user)):
    for i, slug in enumerate(input.slugs):
        await db.artworks.update_one({"slug": slug}, {"$set": {"order": i}})
    return {"ok": True}

@api_router.put("/artworks/{slug}")
async def update_artwork(slug: str, input: ArtworkIn, user=Depends(get_current_user)):
    result = await db.artworks.update_one({"slug": slug}, {"$set": input.model_dump()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artwork not found")
    return await db.artworks.find_one({"slug": slug}, {"_id": 0})

@api_router.delete("/artworks/{slug}")
async def delete_artwork(slug: str, user=Depends(get_current_user)):
    art = await db.artworks.find_one({"slug": slug})
    if not art:
        raise HTTPException(status_code=404, detail="Artwork not found")
    if art.get("image", "").startswith("/api/files/"):
        path = art["image"].replace("/api/files/", "", 1)
        await db.files.update_one({"storage_path": path}, {"$set": {"is_deleted": True}})
    await db.artworks.delete_one({"slug": slug})
    return {"ok": True}

def grade_image(data: bytes, ext: str):
    img = Image.open(io.BytesIO(data))
    has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if has_alpha else "RGB")
    if max(img.size) > 2560:
        ratio = 2560 / max(img.size)
        img = img.resize((round(img.size[0] * ratio), round(img.size[1] * ratio)), Image.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(1.06)
    img = ImageEnhance.Color(img).enhance(1.08)
    img = ImageEnhance.Sharpness(img).enhance(1.35)
    img = ImageEnhance.Brightness(img).enhance(1.02)
    buf = io.BytesIO()
    if ext == "png" and has_alpha:
        img.save(buf, "PNG")
        return buf.getvalue(), "image/png"
    img.convert("RGB").save(buf, "WEBP", quality=88)
    return buf.getvalue(), "image/webp"

ALLOWED_IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif"}
ALLOWED_VIDEO_EXTS = {"mp4", "webm", "mov"}
ALLOWED_MODEL_EXTS = {"mview"}

@api_router.post("/upload", status_code=201)
async def upload_image(file: UploadFile = File(...), user=Depends(get_current_user)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_IMAGE_EXTS | ALLOWED_VIDEO_EXTS | ALLOWED_MODEL_EXTS:
        raise HTTPException(status_code=400, detail="Only images, videos (mp4, webm, mov) or Marmoset .mview scenes are allowed")
    kind = "video" if ext in ALLOWED_VIDEO_EXTS else "model" if ext in ALLOWED_MODEL_EXTS else "image"
    data = await file.read()
    limit = 15 * 1024 * 1024 if kind == "image" else 150 * 1024 * 1024
    if len(data) > limit:
        raise HTTPException(status_code=400, detail="Images must be under 15MB, videos and 3D scenes under 150MB")
    default_type = {"image": "image/jpeg", "video": "video/mp4", "model": "application/octet-stream"}[kind]
    content_type = file.content_type or default_type
    if kind == "image" and ext != "gif":
        try:
            data, content_type = grade_image(data, ext)
        except Exception:
            logger.warning("Image grading failed, storing original")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    result = put_object(path, data, content_type)
    await db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"path": result["path"], "url": f"/api/files/{result['path']}", "kind": kind}

@api_router.api_route("/files/{path:path}", methods=["GET", "HEAD"])
async def serve_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in storage")
    return FileResponse(
        content=data,
        media_type=record.get("content_type", content_type),
        headers={"Cache-Control": "public, max-age=300", "Accept-Ranges": "none"},
    )

async def seed_admin():
    email = os.environ["ADMIN_EMAIL"].lower()
    password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "email": email,
            "password_hash": hash_password(password),
            "name": "Aman Deep",
            "role": "admin",
            "created_at": datetime.now(timezone.utc),
        })
    elif not verify_password(password, existing["password_hash"]):
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await seed_admin()
    for art in ARTWORKS:
        await db.artworks.update_one({"slug": art["slug"]}, {"$setOnInsert": art}, upsert=True)
    docs = await db.artworks.find({}).to_list(200)
    docs.sort(key=lambda d: d.get("order", 999))
    for i, d in enumerate(docs):
        if d.get("order") != i:
            await db.artworks.update_one({"_id": d["_id"]}, {"$set": {"order": i}})
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000")],
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
