"""
Script de seed data para RecomiendoPymes.
Crea 2 admins, usuarios de prueba, y 20 emprendimientos chilenos variados.

Uso: cd backend && python seed_data.py
"""
import asyncio
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from core.security import hash_password
from slugify import slugify


async def seed():
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client[settings.DB_NAME]

    print("[SEED] Iniciando seed data para RecomiendoPymes...")

    # ─── Limpiar colecciones (solo en dev) ───────────────────────────
    for col in ["users", "businesses", "reviews", "legal", "config"]:
        await db[col].drop()
    print("[OK] Colecciones limpiadas")

    # ─── Admins ───────────────────────────────────────────────────────
    admin1_id = (await db.users.insert_one({
        "email": settings.ADMIN_EMAIL,
        "name": "Admin Principal",
        "password_hash": hash_password(settings.ADMIN_PASSWORD),
        "role": "admin",
        "is_active": True,
        "is_email_verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })).inserted_id

    admin2_id = (await db.users.insert_one({
        "email": settings.ADMIN_EMAIL_2,
        "name": "Admin Secundario",
        "password_hash": hash_password(settings.ADMIN_PASSWORD_2),
        "role": "admin",
        "is_active": True,
        "is_email_verified": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })).inserted_id
    print(f"[OK] Admins creados: {settings.ADMIN_EMAIL}, {settings.ADMIN_EMAIL_2}")

    # ─── Usuarios de prueba ───────────────────────────────────────────
    user1_id = (await db.users.insert_one({
        "email": "maria.gonzalez@gmail.com",
        "name": "María González",
        "password_hash": hash_password("Contrasena123!"),
        "role": "user", "is_active": True, "is_email_verified": True,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })).inserted_id

    user2_id = (await db.users.insert_one({
        "email": "pedro.silva@gmail.com",
        "name": "Pedro Silva",
        "password_hash": hash_password("Contrasena123!"),
        "role": "user", "is_active": True, "is_email_verified": True,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })).inserted_id

    user3_id = (await db.users.insert_one({
        "email": "ana.rodriguez@gmail.com",
        "name": "Ana Rodríguez",
        "password_hash": hash_password("Contrasena123!"),
        "role": "user", "is_active": True, "is_email_verified": True,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })).inserted_id

    user4_id = (await db.users.insert_one({
        "email": "carlos.morales@gmail.com",
        "name": "Carlos Morales",
        "password_hash": hash_password("Contrasena123!"),
        "role": "user", "is_active": True, "is_email_verified": True,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })).inserted_id

    user5_id = (await db.users.insert_one({
        "email": "lucia.parra@gmail.com",
        "name": "Lucía Parra",
        "password_hash": hash_password("Contrasena123!"),
        "role": "user", "is_active": True, "is_email_verified": True,
        "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })).inserted_id
    print("[OK] 5 usuarios de prueba creados (contraseña: Contrasena123!)")

    # ─── Emprendimientos ──────────────────────────────────────────────
    # Combinaciones variadas:
    # - Con y sin coordenadas
    # - Con y sin imagen
    # - Varias ciudades, categorías
    # - Tipos: online / physical / both
    businesses_data = [
        # ── CON COORDENADAS ─────────────────────────────────────────
        {
            "name": "Repostería Dulce Tentación",
            "category": "Alimentación y Bebidas",
            "description": "Tortas personalizadas, cupcakes y galletas decoradas para todo tipo de ocasiones. "
                           "Elaboradas con ingredientes naturales y sin conservantes. ¡Pedidos con 48 horas!",
            "owner": "María González", "owner_user_id": user1_id,
            "business_type": "both", "delivery_type": "local",
            "city": "Santiago", "location": "Ñuñoa, Santiago",
            "coordinates": {"lat": -33.4569, "lng": -70.5978, "is_exact": False},
            "social_links": {"instagram": "https://instagram.com/dulcetentacion_cl", "whatsapp": "56912345678"},
            "status": "active", "featured": True,
            "activated_at": datetime.utcnow() - timedelta(days=10),
            "rating": 4.8, "review_count": 3, "view_count": 142,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?w=600&h=400&fit=crop",
        },
        {
            "name": "TechReparo — Computadores y Celulares",
            "category": "Electrónica y Tecnología",
            "description": "Reparación de computadores, notebooks, celulares y tablets. "
                           "Servicio a domicilio en la RM. Diagnóstico gratuito. Garantía 30 días.",
            "owner": "Pedro Silva", "owner_user_id": user2_id,
            "business_type": "both", "delivery_type": "local",
            "city": "Santiago", "location": "Maipú, Santiago",
            "coordinates": {"lat": -33.5101, "lng": -70.7577, "is_exact": False},
            "social_links": {"facebook": "https://facebook.com/techreparo", "whatsapp": "56987654321", "website": "https://techreparo.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=60),
            "rating": 4.5, "review_count": 2, "view_count": 89,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&h=400&fit=crop",
        },
        {
            "name": "Café La Molienda",
            "category": "Alimentación y Bebidas",
            "description": "Cafetería especializada en café de especialidad de origen chileno. "
                           "Granos de pequeños productores del norte. Cursos de barismo y degustaciones.",
            "owner": "María González", "owner_user_id": user1_id,
            "business_type": "physical", "delivery_type": "pickup_only",
            "city": "Valparaíso", "location": "Cerro Alegre, Valparaíso",
            "coordinates": {"lat": -33.0460, "lng": -71.6197, "is_exact": True},
            "social_links": {"instagram": "https://instagram.com/lamolienda_valpo", "facebook": "https://facebook.com/lamoliendavalpo"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=120),
            "rating": 4.2, "review_count": 1, "view_count": 67,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
        },
        {
            "name": "Estudio Fotográfico Luz Norte",
            "category": "Fotografía y Diseño",
            "description": "Fotografía de retrato, producto, eventos y arquitectura. "
                           "Estudio con iluminación profesional en Antofagasta. Reserva online.",
            "owner": "Carlos Morales", "owner_user_id": user4_id,
            "business_type": "both", "delivery_type": "local",
            "city": "Antofagasta", "location": "Centro, Antofagasta",
            "coordinates": {"lat": -23.6524, "lng": -70.3954, "is_exact": True},
            "social_links": {"instagram": "https://instagram.com/luznorte_foto", "email": "hola@luznorte.cl"},
            "status": "active", "featured": True,
            "activated_at": datetime.utcnow() - timedelta(days=20),
            "rating": 5.0, "review_count": 4, "view_count": 210,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop",
        },
        {
            "name": "Consultoría Digital Pathfinder",
            "category": "Consultoría y Servicios Profesionales",
            "description": "Asesoria en transformación digital, marketing online y gestión de redes sociales. "
                           "Trabajamos con pymes y emprendedores de toda Chile de manera 100% online.",
            "owner": "Lucía Parra", "owner_user_id": user5_id,
            "business_type": "online", "delivery_type": "nationwide",
            "city": "Concepción",
            "coordinates": {"lat": -36.8201, "lng": -73.0444, "is_exact": False},
            "social_links": {"linkedin": "https://linkedin.com/company/pathfinder-cl", "website": "https://pathfinder.cl", "email": "hola@pathfinder.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=45),
            "rating": 4.7, "review_count": 6, "view_count": 320,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
        },
        {
            "name": "Joyería Artesanal Raíces",
            "category": "Artesanías y Manualidades",
            "description": "Joyería hecha a mano con plata, piedras semi-preciosas y madera nativa de Chile. "
                           "Diseños únicos inspirados en la naturaleza patagónica. Envíos a todo el mundo.",
            "owner": "Ana Rodríguez", "owner_user_id": user3_id,
            "business_type": "both", "delivery_type": "nationwide",
            "city": "Puerto Montt", "location": "Pelluco, Puerto Montt",
            "coordinates": {"lat": -41.4693, "lng": -72.9424, "is_exact": True},
            "social_links": {"instagram": "https://instagram.com/raices_joyeria", "email": "contacto@raicesjoyeria.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=8),
            "rating": 4.9, "review_count": 11, "view_count": 445,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=400&fit=crop",
        },
        {
            "name": "Taller de Moda Sustentable Ñandú",
            "category": "Clothing y Moda",
            "description": "Ropa femenina confeccionada con telas recicladas y orgánicas. "
                           "Moda ética y sustentable hecha en Chile. Tallas S a 3XL. Tienda online y taller en Viña.",
            "owner": "Lucía Parra", "owner_user_id": user5_id,
            "business_type": "both", "delivery_type": "nationwide",
            "city": "Viña del Mar", "location": "Viña del Mar",
            "coordinates": {"lat": -33.0245, "lng": -71.5518, "is_exact": False},
            "social_links": {"instagram": "https://instagram.com/nandu_moda", "tiktok": "https://tiktok.com/@nandu.moda"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=3),
            "rating": 4.6, "review_count": 8, "view_count": 287,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop",
        },
        {
            "name": "Centro de Yoga Kalpana",
            "category": "Deporte y Vida Saludable",
            "description": "Clases de yoga ashtanga, vinyasa y yin yoga. Presenciales en Providencia "
                           "y online por Zoom. Primera clase gratis. Grupos de máximo 8 personas.",
            "owner": "Ana Rodríguez", "owner_user_id": user3_id,
            "business_type": "both", "delivery_type": "nationwide",
            "city": "Santiago", "location": "Providencia, Santiago",
            "coordinates": {"lat": -33.4186, "lng": -70.6093, "is_exact": True},
            "social_links": {"instagram": "https://instagram.com/kalpana_yoga_cl", "website": "https://kalpanayoga.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=90),
            "rating": 4.4, "review_count": 5, "view_count": 156,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
        },
        {
            "name": "Academia de Inglés Business Pro",
            "category": "Educación y Formación",
            "description": "Clases de inglés para negocios, certificaciones TOEIC y TOEFL. "
                           "100% online. Profesores nativos. Horarios flexibles mañana, tarde y noche.",
            "owner": "Carlos Morales", "owner_user_id": user4_id,
            "business_type": "online", "delivery_type": "nationwide",
            "city": "Temuco",
            "coordinates": {"lat": -38.7359, "lng": -72.5904, "is_exact": False},
            "social_links": {"website": "https://businesspro-english.cl", "email": "clases@businesspro-english.cl", "whatsapp": "56945678901"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=200),
            "rating": 4.3, "review_count": 9, "view_count": 512,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
        },
        {
            "name": "Vivero Plantas Nativas Austral",
            "category": "Jardinería y Plantas",
            "description": "Venta de plantas nativas del sur de Chile. Quillayes, arrayanes, nalcas y más. "
                           "Ideal para jardines sustentables. Envíos a todo Chile en caja especial.",
            "owner": "Pedro Silva", "owner_user_id": user2_id,
            "business_type": "both", "delivery_type": "nationwide",
            "city": "Valdivia", "location": "Valdivia",
            "coordinates": {"lat": -39.8196, "lng": -73.2452, "is_exact": False},
            "social_links": {"instagram": "https://instagram.com/vivero_austral", "facebook": "https://facebook.com/viveropaintasnativas"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=15),
            "rating": 4.8, "review_count": 7, "view_count": 198,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
        },

        # ── SIN COORDENADAS ─────────────────────────────────────────
        {
            "name": "Artesanías Mapuche Kimün",
            "category": "Artesanías y Manualidades",
            "description": "Tejidos, joyería y artesanías mapuche elaboradas de manera tradicional. "
                           "Cada pieza es única y lleva consigo la identidad cultural de nuestro pueblo. "
                           "Enviamos a todo Chile.",
            "owner": "Ana Rodríguez", "owner_user_id": user3_id,
            "business_type": "online", "delivery_type": "nationwide",
            "city": "Temuco",
            # Sin coordinates — para probar el catálogo sin pin en mapa
            "social_links": {"instagram": "https://instagram.com/kimun_artesanias", "tiktok": "https://tiktok.com/@kimun.artesanias", "email": "contacto@kimun.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=5),
            "rating": 4.1, "review_count": 3, "view_count": 95,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1604782206219-3b9576575203?w=600&h=400&fit=crop",
        },
        {
            "name": "Peluquería Canina La Patita Feliz",
            "category": "Mascotas",
            "description": "Baño, corte, deslanado y tratamientos especiales para perros y gatos. "
                           "Atendemos a domicilio en la zona norte de Santiago. Agenda WhatsApp.",
            "owner": "Lucía Parra", "owner_user_id": user5_id,
            "business_type": "physical", "delivery_type": "local",
            "city": "Santiago", "location": "Las Condes, Santiago",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/lapatitafeliz_cl", "whatsapp": "56934567890"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=30),
            "rating": 4.6, "review_count": 14, "view_count": 387,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&h=400&fit=crop",
        },
        {
            "name": "Diseño Web PymeClick",
            "category": "Electrónica y Tecnología",
            "description": "Páginas web profesionales para emprendedores y pymes chilenas. "
                           "Desde $150.000 CLP. Entrega en 5 días hábiles. Incluye dominio y hosting 1 año.",
            "owner": "Carlos Morales", "owner_user_id": user4_id,
            "business_type": "online", "delivery_type": "nationwide",
            "city": "Iquique",
            # Sin coordinates
            "social_links": {"website": "https://pymeclick.cl", "instagram": "https://instagram.com/pymeclick", "whatsapp": "56978901234"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=75),
            "rating": 4.9, "review_count": 22, "view_count": 634,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&h=400&fit=crop",
        },
        {
            "name": "Spa Belleza Natural Rayen",
            "category": "Belleza y Cuidado Personal",
            "description": "Masajes relajantes y terapéuticos, tratamientos faciales con productos naturales. "
                           "Ambiente tranquilo y personalizado. Reservas online. Gift cards disponibles.",
            "owner": "María González", "owner_user_id": user1_id,
            "business_type": "physical", "delivery_type": "local",
            "city": "La Serena", "location": "La Serena",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/rayen_spa_laserena", "email": "reservas@rayenspa.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=50),
            "rating": 4.7, "review_count": 18, "view_count": 423,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&h=400&fit=crop",
        },
        {
            "name": "Coaching Empresarial Impulsa",
            "category": "Consultoría y Servicios Profesionales",
            "description": "Coaching para emprendedores y líderes de pymes. Metodología basada en neurociencia. "
                           "Sesiones 1:1 y talleres grupales online. Primera sesión gratuita.",
            "owner": "Pedro Silva", "owner_user_id": user2_id,
            "business_type": "online", "delivery_type": "nationwide",
            "city": "Rancagua",
            # Sin coordinates
            "social_links": {"linkedin": "https://linkedin.com/in/coaching-impulsa", "website": "https://impulsa-coaching.cl", "whatsapp": "56956789012"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=180),
            "rating": 5.0, "review_count": 16, "view_count": 891,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop",
        },
        {
            "name": "Decoración de Interiores Morada",
            "category": "Hogar y Decoración",
            "description": "Servicios de decoración de interiores para hogares y oficinas. "
                           "Presupuesto gratuito. Trabajo con estilos nórdico, industrial y biofílico.",
            "owner": "Ana Rodríguez", "owner_user_id": user3_id,
            "business_type": "both", "delivery_type": "local",
            "city": "Santiago", "location": "Vitacura, Santiago",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/morada_deco_cl", "email": "hola@moradadeco.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=25),
            "rating": 4.5, "review_count": 7, "view_count": 267,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
        },
        {
            "name": "Entrenamiento Personalizado FitSur",
            "category": "Deporte y Vida Saludable",
            "description": "Entrenador personal certificado. Rutinas de fuerza, cardio y rehabilitación. "
                           "Presencial en Chillán o asesoría online via app. Plan nutricional incluido.",
            "owner": "Carlos Morales", "owner_user_id": user4_id,
            "business_type": "both", "delivery_type": "local",
            "city": "Chillán",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/fitsur_entrenamiento", "whatsapp": "56967890123"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=40),
            "rating": 4.8, "review_count": 12, "view_count": 334,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
        },
        {
            "name": "Estudio de Pilates Equilibrio",
            "category": "Deporte y Vida Saludable",
            "description": "Clases de pilates reformer y mat. Grupos reducidos de máx 5 personas. "
                           "Ideal para embarazadas y rehabilitación postural. Punta Arenas.",
            "owner": "Lucía Parra", "owner_user_id": user5_id,
            "business_type": "physical", "delivery_type": "local",
            "city": "Punta Arenas",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/equilibrio_pilates_pa"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=60),
            "rating": 4.9, "review_count": 9, "view_count": 145,
            "is_verified": True,
            "image": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop",
        },
        {
            "name": "Fotografía de Bodas Sur de Chile",
            "category": "Fotografía y Diseño",
            "description": "Fotógrafo especializado en bodas, elopements y sesiones de pareja en el sur. "
                           "Lagos, volcanes y bosques nativos como telón de fondo. Reservas 2025 abiertas.",
            "owner": "Pedro Silva", "owner_user_id": user2_id,
            "business_type": "physical", "delivery_type": "local",
            "city": "Osorno",
            # Sin coordinates
            "social_links": {"instagram": "https://instagram.com/bodasdelsurcl", "website": "https://bodasdelsur.cl", "email": "hola@bodasdelsur.cl"},
            "status": "active", "featured": False,
            "activated_at": datetime.utcnow() - timedelta(days=2),
            "rating": 5.0, "review_count": 3, "view_count": 88,
            "is_verified": False,
            "image": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
        },
        # ── Pendiente — no visible en catálogo ──────────────────────
        {
            "name": "Yoga & Mindfulness Bienestar",
            "category": "Deporte y Vida Saludable",
            "description": "Clases de yoga, meditación y mindfulness online y presenciales.",
            "owner": "Ana Rodríguez", "owner_user_id": user3_id,
            "business_type": "both", "delivery_type": "nationwide",
            "city": "Concepción",
            "social_links": {"instagram": "https://instagram.com/yogabienestar_cl"},
            "status": "pending",  # Pendiente — NO aparece en catálogo
            "featured": False, "activated_at": None,
            "rating": 0.0, "review_count": 0, "view_count": 0,
            "is_verified": False,
        },
    ]

    business_ids = []
    for b in businesses_data:
        name = b["name"]
        slug = slugify(name)
        existing = await db.businesses.find_one({"slug": slug})
        if existing:
            slug = f"{slug}-{len(business_ids) + 1}"

        doc = {
            **b,
            "slug": slug,
            "gallery": [],
            "established": None,
            "image": b.get("image"),  # Use image from data if present
            "featured_until": None,
            "created_at": datetime.utcnow() - timedelta(days=len(business_ids) * 3),
            "updated_at": datetime.utcnow(),
        }
        # Asegurar is_verified si no está en los datos
        if "is_verified" not in doc:
            doc["is_verified"] = False
        # Asegurar coordinates vacío si no viene
        if "coordinates" not in doc:
            doc["coordinates"] = None

        result = await db.businesses.insert_one(doc)
        business_ids.append(result.inserted_id)

    print(f"[OK] {len(businesses_data)} emprendimientos creados ({sum(1 for b in businesses_data if b['status']=='active')} activos, {sum(1 for b in businesses_data if b['status']=='pending')} pendientes)")
    con_coords = sum(1 for b in businesses_data if b.get("coordinates"))
    sin_coords = sum(1 for b in businesses_data if not b.get("coordinates") and b["status"] == "active")
    print(f"     Con ubicación en mapa: {con_coords} | Sin ubicación: {sin_coords}")

    # ─── Reseñas ──────────────────────────────────────────────────────
    reviews = [
        # Dulce Tentación
        {"business_id": business_ids[0], "author_id": user2_id, "author_name": "Pedro Silva",
         "rating": 5, "comment": "¡La torta de cumpleaños quedó perfecta! Muy prolija la decoración.", "is_visible": True, "owner_response": None},
        {"business_id": business_ids[0], "author_id": user3_id, "author_name": "Ana Rodríguez",
         "rating": 5, "comment": "Los cupcakes de vainilla son una delicia. Entrega puntual.", "is_visible": True,
         "owner_response": {"text": "¡Gracias Ana! Un placer 🎉", "author": "María González", "created_at": datetime.utcnow() - timedelta(days=3)}},
        {"business_id": business_ids[0], "author_id": admin1_id, "author_name": "Admin Principal",
         "rating": 4, "comment": "Muy buena calidad. Los brownies son adictivos.", "is_visible": True, "owner_response": None},
        # TechReparo
        {"business_id": business_ids[1], "author_id": user3_id, "author_name": "Ana Rodríguez",
         "rating": 5, "comment": "Repararon el notebook el mismo día. Precio justo y técnico honesto.", "is_visible": True, "owner_response": None},
        {"business_id": business_ids[1], "author_id": admin2_id, "author_name": "Admin Secundario",
         "rating": 4, "comment": "Cambio de pantalla rápido. Buen servicio.", "is_visible": True, "owner_response": None},
        # Café La Molienda
        {"business_id": business_ids[2], "author_id": user2_id, "author_name": "Pedro Silva",
         "rating": 4, "comment": "Muy acogedor en el Cerro Alegre. El café de Atacama tiene notas increíbles.", "is_visible": True, "owner_response": None},
        # Luz Norte
        {"business_id": business_ids[3], "author_id": user1_id, "author_name": "María González",
         "rating": 5, "comment": "Fotos de producto increíbles. La iluminación es perfecta.", "is_visible": True, "owner_response": None},
        {"business_id": business_ids[3], "author_id": user2_id, "author_name": "Pedro Silva",
         "rating": 5, "comment": "Muy profesional. Las fotos de mi restaurante quedaron espectaculares.", "is_visible": True, "owner_response": None},
        # Pathfinder
        {"business_id": business_ids[4], "author_id": user1_id, "author_name": "María González",
         "rating": 5, "comment": "Gracias a su asesoría logré triplicar mis ventas en Instagram.", "is_visible": True, "owner_response": None},
        # Joyería Raíces
        {"business_id": business_ids[5], "author_id": user4_id, "author_name": "Carlos Morales",
         "rating": 5, "comment": "Compré un anillo de plata con madera de raulí. Una obra de arte.", "is_visible": True, "owner_response": None},
    ]

    for r in reviews:
        await db.reviews.insert_one({**r, "created_at": datetime.utcnow() - timedelta(days=10), "updated_at": datetime.utcnow()})
    print(f"[OK] {len(reviews)} reseñas creadas")

    # ─── Textos legales ───────────────────────────────────────────────
    await db.legal.insert_many([
        {"key": "terms", "content": "# Términos y Condiciones de RecomiendoPymes\n\n**Última actualización:** Abril 2025\n\nAl acceder y utilizar RecomiendoPymes, aceptas estos Términos.", "updated_at": datetime.utcnow()},
        {"key": "privacy", "content": "# Política de Privacidad de RecomiendoPymes\n\n**Última actualización:** Abril 2025\n\nEsta política describe cómo recopilamos y usamos tu información.", "updated_at": datetime.utcnow()},
    ])
    print("[OK] Textos legales creados")

    # ─── Configuración ────────────────────────────────────────────────
    await db.config.insert_many([
        {"key": "review_rate_limit", "value": 5, "description": "Máximo de reseñas por usuario en 24h"},
        {"key": "boost_days", "value": 30, "description": "Días que se muestra el badge 'Nuevo'"},
        {"key": "max_gallery_images", "value": 6, "description": "Máximo de imágenes en la galería"},
        {"key": "maintenance_mode", "value": False, "description": "Activa modo mantenimiento"},
    ])
    print("[OK] Configuración inicial creada")

    # ─── Índices ──────────────────────────────────────────────────────
    await db.users.create_index("email", unique=True)
    await db.businesses.create_index("slug", unique=True)
    await db.businesses.create_index([("status", 1), ("featured", -1), ("rating", -1)])
    await db.reviews.create_index([("business_id", 1), ("author_id", 1)], unique=True)
    print("[OK] Índices MongoDB creados")

    client.close()
    print("\n[DONE] Seed completado exitosamente!")
    print(f"\n  Admin 1:  {settings.ADMIN_EMAIL} / {settings.ADMIN_PASSWORD}")
    print(f"  Admin 2:  {settings.ADMIN_EMAIL_2} / {settings.ADMIN_PASSWORD_2}")
    print("  Usuarios: maria.gonzalez@gmail.com | pedro.silva@gmail.com | ana.rodriguez@gmail.com")
    print("  Password: Contrasena123!")
    print(f"\n  {len(businesses_data)} emprendimientos | {len(reviews)} reseñas")
    print("  Abre http://localhost:8000/docs para ver la API")


if __name__ == "__main__":
    asyncio.run(seed())