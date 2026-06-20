"""
Fixtures de test compartidas.

Provee un fake de MongoDB en memoria (async) que imita la porción de la API de
motor que usan los servicios — sin necesitar una instancia real de Mongo. Es
deliberadamente mínimo: solo implementa los operadores que los tests ejercitan
($set, $inc, $ne). Si un test necesita más, amplía FakeCollection aquí.
"""
from bson import ObjectId


def _matches(doc: dict, query: dict) -> bool:
    for key, cond in query.items():
        value = doc.get(key)
        if isinstance(cond, dict):
            if "$ne" in cond and value == cond["$ne"]:
                return False
            if "$gte" in cond and not (value is not None and value >= cond["$gte"]):
                return False
        elif value != cond:
            return False
    return True


class FakeCollection:
    def __init__(self, docs=None):
        # Copia profunda superficial: cada doc es propio del fake
        self._docs = [dict(d) for d in (docs or [])]

    async def find_one(self, query):
        for doc in self._docs:
            if _matches(doc, query):
                return dict(doc)  # copia, como hace motor
        return None

    async def update_one(self, query, update):
        for doc in self._docs:
            if _matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                if "$inc" in update:
                    for field, amount in update["$inc"].items():
                        doc[field] = doc.get(field, 0) + amount
                return _Result(1)
        return _Result(0)

    async def update_many(self, query, update):
        count = 0
        for doc in self._docs:
            if _matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                count += 1
        return _Result(count)

    async def count_documents(self, query):
        return sum(1 for doc in self._docs if _matches(doc, query))

    async def insert_one(self, doc):
        new = dict(doc)
        new.setdefault("_id", ObjectId())
        self._docs.append(new)
        return _InsertResult(new["_id"])

    def stored(self, _id):
        """Helper de test: devuelve el doc almacenado (no una copia) por _id."""
        for doc in self._docs:
            if doc.get("_id") == _id:
                return doc
        return None


class _Result:
    def __init__(self, n):
        self.modified_count = n
        self.matched_count = n


class _InsertResult:
    def __init__(self, _id):
        self.inserted_id = _id


class FakeDB:
    """Imita `db.<colección>` exponiendo FakeCollection por atributo."""
    def __init__(self, **collections):
        for name, coll in collections.items():
            setattr(self, name, coll)
