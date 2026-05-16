from fastapi import HTTPException, status
from bson import ObjectId
from datetime import datetime
from core.database import get_db
from .schemas import NewsCreate, NewsUpdate

class NewsService:
    @staticmethod
    async def get_all_news(limit: int = 10, only_published: bool = True):
        db = get_db()
        query = {"status": "published"} if only_published else {}
        cursor = db.news.find(query).sort("created_at", -1).limit(limit)
        news = await cursor.to_list(length=limit)
        
        return [{**n, "id": str(n["_id"])} for n in news]

    @staticmethod
    async def get_news_by_slug(slug: str):
        db = get_db()
        news = await db.news.find_one({"slug": slug, "status": "published"})
        if not news:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
        return {**news, "id": str(news["_id"])}


    @staticmethod
    async def create_news(data: NewsCreate):
        db = get_db()
        doc = data.dict()
        doc["created_at"] = datetime.utcnow()
        doc["updated_at"] = datetime.utcnow()
        
        result = await db.news.insert_one(doc)
        created = await db.news.find_one({"_id": result.inserted_id})
        return {**created, "id": str(created["_id"])}

    @staticmethod
    async def update_news(news_id: str, data: NewsUpdate):
        db = get_db()
        if not ObjectId.is_valid(news_id):
            raise HTTPException(status_code=400, detail="ID inválido")
            
        update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="Sin datos para actualizar")
            
        update_data["updated_at"] = datetime.utcnow()
        
        result = await db.news.update_one(
            {"_id": ObjectId(news_id)},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
            
        updated = await db.news.find_one({"_id": ObjectId(news_id)})
        return {**updated, "id": str(updated["_id"])}

    @staticmethod
    async def delete_news(news_id: str):
        db = get_db()
        if not ObjectId.is_valid(news_id):
            raise HTTPException(status_code=400, detail="ID inválido")
            
        result = await db.news.delete_one({"_id": ObjectId(news_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Noticia no encontrada")
            
        return {"msg": "Noticia eliminada correctamente"}
