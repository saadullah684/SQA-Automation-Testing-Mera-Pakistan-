from fastapi import FastAPI, HTTPException, Query, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from typing import Optional, List
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

client = AsyncIOMotorClient(MONGODB_URI, tls=True, tlsInsecure=True)
db = client["mypakistan"]

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connected to MongoDB")
    yield
    client.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def to_plain(doc):
    if not doc:
        return doc
    doc["id"] = doc.pop("_id")
    doc.pop("__v", None)
    return doc

async def require_auth(request: Request):
    from clerk_backend_api import Clerk
    clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        claims = clerk.verify_token(token)
        return claims.get("sub")
    except:
        raise HTTPException(status_code=401, detail="Unauthorized")

# ── Health ────────────────────────────────────────────────
@app.get("/api/healthz")
async def health():
    return {"status": "ok"}

# ── Locations ─────────────────────────────────────────────
@app.get("/api/locations")
async def list_locations(
    province: Optional[str] = None,
    city: Optional[str] = None,
    category: Optional[str] = None,
    q: Optional[str] = None,
):
    filter = {}
    if province:
        filter["province"] = {"$regex": province, "$options": "i"}
    if city:
        filter["city"] = {"$regex": city, "$options": "i"}
    if category:
        filter["category"] = {"$regex": category, "$options": "i"}
    if q:
        filter["$or"] = [
            {"name": {"$regex": q, "$options": "i"}},
            {"city": {"$regex": q, "$options": "i"}},
            {"province": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
        ]
    docs = await db["locations"].find(filter).sort("rating", 1).to_list(1000)
    return [to_plain(doc) for doc in docs]

@app.get("/api/locations/featured")
async def get_featured_locations():
    docs = await db["locations"].find({"isFeatured": True}).limit(8).to_list(8)
    return [to_plain(doc) for doc in docs]

@app.get("/api/locations/{id}")
async def get_location(id: int):
    doc = await db["locations"].find_one({"_id": id})
    if not doc:
        raise HTTPException(status_code=404, detail="Location not found")
    return to_plain(doc)

# ── Provinces ─────────────────────────────────────────────
@app.get("/api/provinces")
async def list_provinces():
    docs = await db["provinces"].find().sort("name", 1).to_list(100)
    return [to_plain(doc) for doc in docs]

@app.get("/api/provinces/{slug}/cities")
async def list_cities_by_province(slug: str):
    province = await db["provinces"].find_one({"slug": slug})
    if not province:
        raise HTTPException(status_code=404, detail="Province not found")
    cities = await db["cities"].find({"province": province["name"]}).sort("name", 1).to_list(100)
    return [to_plain(doc) for doc in cities]

# ── Foods ─────────────────────────────────────────────────
@app.get("/api/foods")
async def list_foods(city: Optional[str] = None, province: Optional[str] = None):
    filter = {}
    if city:
        filter["city"] = city
    if province:
        filter["province"] = province
    docs = await db["fooditems"].find(filter).to_list(1000)
    return [to_plain(doc) for doc in docs]

# ── Dashboard ─────────────────────────────────────────────
@app.get("/api/dashboard/summary")
async def dashboard_summary():
    docs = await db["locations"].find().to_list(10000)
    locations = [to_plain(doc) for doc in docs]
    provinces = set(l["province"] for l in locations)
    cities = set(l["city"] for l in locations)
    top_rated = sorted(locations, key=lambda x: x.get("rating", 0), reverse=True)[:5]
    category_map = {}
    for l in locations:
        cat = l.get("category", "unknown")
        category_map[cat] = category_map.get(cat, 0) + 1
    return {
        "totalLocations": len(locations),
        "totalProvinces": len(provinces),
        "totalCities": len(cities),
        "topRatedLocations": top_rated,
        "categoryCounts": [{"category": k, "count": v} for k, v in category_map.items()],
    }

# ── History ───────────────────────────────────────────────
@app.get("/api/history")
async def list_history(user_id: str = Depends(require_auth)):
    docs = await db["searchhistories"].find({"userId": user_id}).sort("createdAt", -1).limit(50).to_list(50)
    return [to_plain(doc) for doc in docs]

@app.post("/api/history", status_code=201)
async def create_history(request: Request, user_id: str = Depends(require_auth)):
    body = await request.json()
    counter = await db["counters"].find_one_and_update(
        {"_id": "searchHistory"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    doc = {"_id": counter["seq"], "userId": user_id, **body}
    await db["searchhistories"].insert_one(doc)
    return to_plain(doc)

@app.delete("/api/history/{id}", status_code=204)
async def delete_history(id: int, user_id: str = Depends(require_auth)):
    result = await db["searchhistories"].find_one_and_delete({"_id": id, "userId": user_id})
    if not result:
        raise HTTPException(status_code=404, detail="History entry not found")

# ── Saved Spots ───────────────────────────────────────────
@app.get("/api/saved")
async def list_saved(user_id: str = Depends(require_auth)):
    saved = await db["savedspots"].find({"userId": user_id}).sort("createdAt", -1).to_list(100)
    location_ids = [s["locationId"] for s in saved]
    locations = await db["locations"].find({"_id": {"$in": location_ids}}).to_list(100)
    location_map = {l["_id"]: to_plain(l) for l in locations}
    result = []
    for s in saved:
        plain = to_plain(s)
        plain["location"] = location_map.get(s["locationId"])
        result.append(plain)
    return result

@app.post("/api/saved", status_code=201)
async def create_saved(request: Request, user_id: str = Depends(require_auth)):
    body = await request.json()
    counter = await db["counters"].find_one_and_update(
        {"_id": "savedSpots"},
        {"$inc": {"seq": 1}},
        upsert=True,
        return_document=True,
    )
    doc = {"_id": counter["seq"], "userId": user_id, **body}
    await db["savedspots"].insert_one(doc)
    location = await db["locations"].find_one({"_id": doc["locationId"]})
    plain = to_plain(doc)
    plain["location"] = to_plain(location) if location else None
    return plain

@app.delete("/api/saved/{id}", status_code=204)
async def delete_saved(id: int, user_id: str = Depends(require_auth)):
    result = await db["savedspots"].find_one_and_delete({"_id": id, "userId": user_id})
    if not result:
        raise HTTPException(status_code=404, detail="Saved spot not found")