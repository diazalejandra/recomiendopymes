from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from modules.review.models import ReviewCreate, ReviewPublic, ReviewResponse

# Import at module level to avoid circular import anti-pattern
from modules.business.service import BusinessService


SUSPICIOUS_THRESHOLD = 5  # reseñas en la misma ventana de tiempo
SUSPICIOUS_WINDOW_HOURS = 24


def _doc_to_public(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    d["business_id"] = str(d["business_id"])
    d["author_id"] = str(d["author_id"])
    return d


class ReviewService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_business_reviews(self, business_id: str, page: int = 1, limit: int = 10) -> dict:
        query = {"business_id": ObjectId(business_id), "is_visible": True}
        total = await self.db.reviews.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.reviews.find(query).sort("created_at", -1).skip(skip).limit(limit)
        reviews = [_doc_to_public(doc) async for doc in cursor]
        return {"reviews": reviews, "total": total, "page": page, "total_pages": max(1, -(-total // limit))}

    async def create(self, business_id: str, data: ReviewCreate, author: dict) -> dict:
        # Verificar que el negocio existe y está activo
        business = await self.db.businesses.find_one({"_id": ObjectId(business_id), "status": "active"})
        if not business:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")

        # No se puede reseñar el propio negocio (RV-1)
        if str(business.get("owner_user_id")) == str(author["_id"]):
            raise HTTPException(status_code=400, detail="No puedes reseñar tu propio emprendimiento")

        # Verificar que el autor no haya reseñado ya este negocio
        existing = await self.db.reviews.find_one({
            "business_id": ObjectId(business_id),
            "author_id": author["_id"]
        })
        if existing:
            raise HTTPException(status_code=400, detail="Ya dejaste una reseña en este emprendimiento")

        # Detección de comportamiento sospechoso (configurable vía admin)
        config = await self.db.config.find_one({"key": "review_rate_limit"})
        threshold = config["value"] if config else SUSPICIOUS_THRESHOLD
        window_start = datetime.now(timezone.utc) - timedelta(hours=SUSPICIOUS_WINDOW_HOURS)
        recent_count = await self.db.reviews.count_documents({
            "author_id": author["_id"],
            "created_at": {"$gte": window_start}
        })
        if recent_count >= threshold:
            # Marcar al usuario como sospechoso para revisión del admin
            await self.db.users.update_one(
                {"_id": author["_id"]},
                {"$set": {"suspicious_activity": True, "suspicious_reason": f"{recent_count} reseñas en {SUSPICIOUS_WINDOW_HOURS}h"}}
            )

        # La reseña se publica inmediatamente (no hay moderación previa)
        doc = {
            "business_id": ObjectId(business_id),
            "author_id": author["_id"],
            "author_name": author["name"],
            "rating": data.rating,
            "comment": data.comment,
            "is_visible": True,
            "owner_response": None,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        result = await self.db.reviews.insert_one(doc)

        # Recalcular rating del negocio
        bs = BusinessService(self.db)
        await bs.recalculate_rating(business_id)

        created = await self.db.reviews.find_one({"_id": result.inserted_id})
        return _doc_to_public(created)

    async def add_owner_response(self, review_id: str, text: str, owner: dict) -> dict:
        """El dueño del negocio responde a una reseña."""
        review = await self.db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Reseña no encontrada")

        # Verificar que el usuario es dueño del negocio al que pertenece la reseña
        business = await self.db.businesses.find_one({"_id": review["business_id"]})
        if not business or str(business.get("owner_user_id")) != str(owner["_id"]):
            raise HTTPException(status_code=403, detail="Solo el dueño del negocio puede responder")

        response = {
            "text": text,
            "author": owner["name"],
            "created_at": datetime.now(timezone.utc)
        }
        await self.db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"owner_response": response, "updated_at": datetime.now(timezone.utc)}}
        )
        updated = await self.db.reviews.find_one({"_id": ObjectId(review_id)})
        return _doc_to_public(updated)

    async def toggle_visibility(self, review_id: str) -> dict:
        """Admin: ocultar/mostrar una reseña."""
        review = await self.db.reviews.find_one({"_id": ObjectId(review_id)})
        if not review:
            raise HTTPException(status_code=404, detail="Reseña no encontrada")
        new_vis = not review.get("is_visible", True)
        await self.db.reviews.update_one(
            {"_id": ObjectId(review_id)},
            {"$set": {"is_visible": new_vis, "updated_at": datetime.now(timezone.utc)}}
        )
        # Recalcular rating del negocio tras el cambio de visibilidad
        bs = BusinessService(self.db)
        await bs.recalculate_rating(str(review["business_id"]))

        updated = await self.db.reviews.find_one({"_id": ObjectId(review_id)})
        return _doc_to_public(updated)
