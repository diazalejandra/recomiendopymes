import re
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from slugify import slugify
from modules.business.models import BusinessCreate, BusinessUpdate, BusinessPublic


def _doc_to_public(doc: dict) -> dict:
    """Convierte un documento MongoDB de negocio al formato de respuesta pública."""
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    if d.get("owner_user_id"):
        d["owner_user_id"] = str(d["owner_user_id"])
    if d.get("coordinates") and isinstance(d["coordinates"], dict):
        pass  # ya es dict
    return d


async def _generate_unique_slug(db: AsyncIOMotorDatabase, name: str, exclude_id: Optional[str] = None) -> str:
    """Genera slug único con sufijo numérico incremental si hay colisiones."""
    base = slugify(name, allow_unicode=False)
    candidate = base
    counter = 1
    while True:
        query = {"slug": candidate}
        if exclude_id:
            query["_id"] = {"$ne": ObjectId(exclude_id)}
        existing = await db.businesses.find_one(query)
        if not existing:
            return candidate
        candidate = f"{base}-{counter}"
        counter += 1


def _is_new_boost(activated_at: Optional[datetime], boost_days: int = 30) -> bool:
    """Retorna True si el negocio fue aprobado hace menos de boost_days días."""
    if not activated_at:
        return False
    return (datetime.utcnow() - activated_at).days <= boost_days


class BusinessService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_businesses(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        search: Optional[str] = None,
        nationwide: bool = False,
        page: int = 1,
        limit: int = 12
    ) -> dict:
        """Lista negocios activos con filtros. Orden: featured → nuevos (30d) → mejor rating → más antiguos."""
        query = {"status": "active"}
        and_clauses = []
        
        if category:
            query["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
            
        if city:
            if nationwide:
                and_clauses.append({
                    "$or": [
                        {"city": {"$regex": f"^{re.escape(city)}$", "$options": "i"}},
                        {"delivery_scope": "nationwide"}
                    ]
                })
            else:
                query["city"] = {"$regex": f"^{re.escape(city)}$", "$options": "i"}
                
        if search:
            and_clauses.append({
                "$or": [
                    {"name": {"$regex": re.escape(search), "$options": "i"}},
                    {"description": {"$regex": re.escape(search), "$options": "i"}},
                    {"category": {"$regex": re.escape(search), "$options": "i"}},
                ]
            })

        if and_clauses:
            query["$and"] = and_clauses

        total = await self.db.businesses.count_documents(query)
        skip = (page - 1) * limit

        # Ordenamiento: featured desc → boost (nuevos 30d) desc → rating desc → created_at asc
        pipeline = [
            {"$match": query},
            {"$addFields": {
                "is_new_boost": {
                    "$cond": [
                        {"$and": [
                            {"$ne": ["$activated_at", None]},
                            {"$lte": [
                                {"$subtract": [datetime.utcnow(), "$activated_at"]},
                                30 * 24 * 60 * 60 * 1000  # 30 días en ms
                            ]}
                        ]},
                        1, 0
                    ]
                }
            }},
            {"$sort": {
                "featured": -1,
                "is_new_boost": -1,
                "rating": -1,
                "created_at": 1
            }},
            {"$skip": skip},
            {"$limit": limit},
        ]

        businesses = []
        async for doc in self.db.businesses.aggregate(pipeline):
            doc.pop("is_new_boost", None)
            businesses.append(_doc_to_public(doc))

        return {
            "businesses": businesses,
            "total": total,
            "page": page,
            "total_pages": max(1, -(-total // limit))  # ceiling division
        }

    async def get_by_slug(self, slug: str) -> dict:
        doc = await self.db.businesses.find_one({"slug": slug, "status": "active"})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        # Incrementar contador de visitas
        await self.db.businesses.update_one({"_id": doc["_id"]}, {"$inc": {"view_count": 1}})
        doc["view_count"] = doc.get("view_count", 0) + 1

        return _doc_to_public(doc)

    async def get_by_id(self, business_id: str) -> dict:
        doc = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")
        return _doc_to_public(doc)

    async def get_mine(self, user_id: str) -> list:
        cursor = self.db.businesses.find({"owner_user_id": ObjectId(user_id)})
        return [_doc_to_public(doc) async for doc in cursor]

    async def create(self, data: BusinessCreate, user_id: str) -> dict:
        slug = await _generate_unique_slug(self.db, data.name)
        doc = {
            **data.model_dump(exclude_none=True),
            "slug": slug,
            "owner_user_id": ObjectId(user_id),
            "status": "active",
            "activated_at": datetime.utcnow(),
            "featured": False,
            "featured_until": None,
            "is_verified": False,
            "rating": 0.0,
            "review_count": 0,
            "view_count": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        # Convertir social_links y coordinates a dict si son modelos Pydantic
        if data.social_links:
            doc["social_links"] = data.social_links.model_dump(exclude_none=True)
        if data.coordinates:
            doc["coordinates"] = data.coordinates.model_dump()

        result = await self.db.businesses.insert_one(doc)
        created = await self.db.businesses.find_one({"_id": result.inserted_id})
        return _doc_to_public(created)

    async def update(self, business_id: str, data: BusinessUpdate, user_id: str) -> dict:
        doc = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")
        if str(doc.get("owner_user_id")) != user_id:
            raise HTTPException(status_code=403, detail="No tienes permisos para editar este emprendimiento")

        update_data = {k: v for k, v in data.model_dump(exclude_none=True).items()}
        if data.social_links:
            update_data["social_links"] = data.social_links.model_dump(exclude_none=True)
        if data.coordinates:
            update_data["coordinates"] = data.coordinates.model_dump()
        update_data["updated_at"] = datetime.utcnow()

        await self.db.businesses.update_one({"_id": ObjectId(business_id)}, {"$set": update_data})
        updated = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        return _doc_to_public(updated)

    async def change_status(self, business_id: str, new_status: str, by_admin: bool = False, owner_id: Optional[str] = None) -> dict:
        """Cambia el estado de un negocio. Admin puede aprobar, dueño puede desactivar o solicitar reactivación."""
        doc = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        if not by_admin and owner_id:
            if str(doc.get("owner_user_id")) != owner_id:
                raise HTTPException(status_code=403, detail="Sin permisos")
            # Dueño solo puede desactivar (active→inactive) o solicitar reactivación (inactive→pending)
            allowed = {"active": ["inactive"], "inactive": ["pending"]}
            if new_status not in allowed.get(doc["status"], []):
                raise HTTPException(status_code=400, detail=f"No puedes cambiar de '{doc['status']}' a '{new_status}'")

        update = {"status": new_status, "updated_at": datetime.utcnow()}

        # Si se activa por primera vez, registrar activated_at para el badge Nuevo
        if new_status == "active" and not doc.get("activated_at"):
            update["activated_at"] = datetime.utcnow()

        await self.db.businesses.update_one({"_id": ObjectId(business_id)}, {"$set": update})
        updated = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        return _doc_to_public(updated)

    async def delete(self, business_id: str) -> dict:
        doc = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")
        await self.db.businesses.delete_one({"_id": ObjectId(business_id)})
        # Eliminar también sus reseñas
        await self.db.reviews.delete_many({"business_id": ObjectId(business_id)})
        return {"message": f"Emprendimiento '{doc['name']}' eliminado correctamente"}

    async def recalculate_rating(self, business_id: str):
        """Recalcula rating promedio del negocio basado en sus reseñas visibles."""
        pipeline = [
            {"$match": {"business_id": ObjectId(business_id), "is_visible": True}},
            {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}}
        ]
        result = []
        async for doc in self.db.reviews.aggregate(pipeline):
            result.append(doc)

        if result:
            avg = round(result[0]["avg"], 1)
            count = result[0]["count"]
        else:
            avg = 0.0
            count = 0

        await self.db.businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {"rating": avg, "review_count": count}}
        )
