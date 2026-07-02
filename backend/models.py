from pydantic_core import core_schema
from typing import Any
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException


def to_object_id(value: str, detail: str = "Recurso no encontrado") -> ObjectId:
    """Convierte un string a ObjectId; si es inválido, responde 404 en lugar de 500 (N-11).

    Un id malformado en la URL es indistinguible para el cliente de un recurso
    inexistente, así que devolvemos 404 con el mismo mensaje que usan los servicios.
    """
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail=detail)


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler
    ) -> core_schema.CoreSchema:
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ])
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


# Config compartida para todos los modelos con ObjectId
MONGO_MODEL_CONFIG = {
    "populate_by_name": True,
    "arbitrary_types_allowed": True,
    "json_encoders": {ObjectId: str}
}