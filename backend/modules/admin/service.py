from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from modules.review.service import ReviewService


def _user_public(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    d.pop("password_hash", None)
    return d


def _business_doc(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    if d.get("owner_user_id"):
        d["owner_user_id"] = str(d["owner_user_id"])
    return d


def _review_doc(doc: dict) -> dict:
    d = dict(doc)
    d["id"] = str(d.pop("_id"))
    d["business_id"] = str(d["business_id"])
    d["author_id"] = str(d["author_id"])
    return d


class AdminService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_dashboard(self) -> dict:
        """Métricas generales para el panel de administración."""
        total_users = await self.db.users.count_documents({})
        total_businesses = await self.db.businesses.count_documents({})
        pending_businesses = await self.db.businesses.count_documents({"status": "pending"})
        active_businesses = await self.db.businesses.count_documents({"status": "active"})
        total_reviews = await self.db.reviews.count_documents({})
        hidden_reviews = await self.db.reviews.count_documents({"is_visible": False})
        suspicious_users = await self.db.users.count_documents({"suspicious_activity": True})

        return {
            "users": {"total": total_users, "suspicious": suspicious_users},
            "businesses": {
                "total": total_businesses,
                "pending": pending_businesses,
                "active": active_businesses,
                "inactive": total_businesses - pending_businesses - active_businesses
            },
            "reviews": {"total": total_reviews, "hidden": hidden_reviews},
        }

    async def get_businesses(self, status: Optional[str] = None, page: int = 1, limit: int = 20) -> dict:
        query = {}
        if status:
            query["status"] = status
        total = await self.db.businesses.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.businesses.find(query).sort("created_at", -1).skip(skip).limit(limit)
        businesses = [_business_doc(doc) async for doc in cursor]
        return {"businesses": businesses, "total": total, "page": page, "total_pages": max(1, -(-total // limit))}

    async def approve_business(self, business_id: str) -> dict:
        doc = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        if not doc:
            raise HTTPException(status_code=404, detail="Emprendimiento no encontrado")
        update = {"status": "active", "updated_at": datetime.utcnow()}
        if not doc.get("activated_at"):
            update["activated_at"] = datetime.utcnow()
        await self.db.businesses.update_one({"_id": ObjectId(business_id)}, {"$set": update})
        updated = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        return _business_doc(updated)

    async def reject_business(self, business_id: str) -> dict:
        await self.db.businesses.update_one(
            {"_id": ObjectId(business_id)},
            {"$set": {"status": "inactive", "updated_at": datetime.utcnow()}}
        )
        updated = await self.db.businesses.find_one({"_id": ObjectId(business_id)})
        return _business_doc(updated)

    async def get_reviews(self, visible_only: Optional[bool] = None, page: int = 1, limit: int = 20) -> dict:
        query = {}
        if visible_only is not None:
            query["is_visible"] = visible_only
        total = await self.db.reviews.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.reviews.find(query).sort("created_at", -1).skip(skip).limit(limit)
        reviews = [_review_doc(doc) async for doc in cursor]
        return {"reviews": reviews, "total": total, "page": page, "total_pages": max(1, -(-total // limit))}

    async def toggle_review_visibility(self, review_id: str) -> dict:
        service = ReviewService(self.db)
        return await service.toggle_visibility(review_id)

    async def get_users(self, page: int = 1, limit: int = 20, suspicious_only: bool = False) -> dict:
        query = {"suspicious_activity": True} if suspicious_only else {}
        total = await self.db.users.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.db.users.find(query).sort("created_at", -1).skip(skip).limit(limit)
        users = [_user_public(doc) async for doc in cursor]
        return {"users": users, "total": total, "page": page, "total_pages": max(1, -(-total // limit))}

    async def toggle_user_active(self, user_id: str) -> dict:
        """Inactivar usuario: oculta en cascada sus negocios y reseñas."""
        user = await self.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        new_state = not user.get("is_active", True)
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"is_active": new_state, "updated_at": datetime.utcnow()}}
        )

        # Cascada: al inactivar, ocultar negocios y reseñas
        if not new_state:
            await self.db.businesses.update_many(
                {"owner_user_id": ObjectId(user_id), "status": "active"},
                {"$set": {"status": "inactive"}}
            )
            await self.db.reviews.update_many(
                {"author_id": ObjectId(user_id)},
                {"$set": {"is_visible": False}}
            )
        else:
            # Al reactivar, negocios vuelven a pending para re-moderación
            await self.db.businesses.update_many(
                {"owner_user_id": ObjectId(user_id), "status": "inactive"},
                {"$set": {"status": "pending"}}
            )
            await self.db.reviews.update_many(
                {"author_id": ObjectId(user_id)},
                {"$set": {"is_visible": True}}
            )

        updated = await self.db.users.find_one({"_id": ObjectId(user_id)})
        return _user_public(updated)

    async def promote_user(self, user_id: str) -> dict:
        """Promover usuario a admin."""
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": "admin", "updated_at": datetime.utcnow()}}
        )
        updated = await self.db.users.find_one({"_id": ObjectId(user_id)})
        return _user_public(updated)

    async def clear_suspicious(self, user_id: str) -> dict:
        """Limpiar flag de actividad sospechosa."""
        await self.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$unset": {"suspicious_activity": "", "suspicious_reason": ""}}
        )
        updated = await self.db.users.find_one({"_id": ObjectId(user_id)})
        return _user_public(updated)
