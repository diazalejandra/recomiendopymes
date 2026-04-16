from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter(tags=["meta"])

# Categorías fijas del catálogo chileno
CATEGORIES = [
    "Alimentación y Bebidas",
    "Artesanías y Manualidades",
    "Belleza y Cuidado Personal",
    "Clothing y Moda",
    "Consultoría y Servicios Profesionales",
    "Deporte y Vida Saludable",
    "Educación y Formación",
    "Electrónica y Tecnología",
    "Fotografía y Diseño",
    "Hogar y Decoración",
    "Jardinería y Plantas",
    "Librería y Papelería",
    "Mascotas",
    "Música y Entretenimiento",
    "Repostería y Pastelería",
    "Ropa y Accesorios",
    "Salud y Bienestar",
    "Servicios del Hogar",
    "Turismo y Experiencias",
    "Otro",
]

# Ciudades principales de Chile (con caché implícita al ser lista fija)
CITIES = [
    "Arica", "Iquique", "Antofagasta", "Calama", "Copiapó", "La Serena", "Coquimbo",
    "Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio",
    "Santiago", "Puente Alto", "Maipú", "La Florida", "Las Condes", "Providencia",
    "Ñuñoa", "San Bernardo", "Quilicura", "Peñalolén", "Lo Barnechea",
    "Rancagua", "Talca", "Curicó", "Linares", "Chillán", "Los Ángeles",
    "Concepción", "Talcahuano", "San Pedro de la Paz", "Hualpén", "Coronel",
    "Temuco", "Padre Las Casas", "Valdivia", "Osorno", "Puerto Montt",
    "Castro", "Coyhaique", "Punta Arenas",
    "Otra ciudad",
]


@router.get("/api/categories")
async def get_categories():
    return {"categories": CATEGORIES}


@router.get("/api/cities")
async def get_cities():
    return {"cities": CITIES}
