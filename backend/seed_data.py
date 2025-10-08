import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Sample businesses data (from frontend mock)
businesses_data = [
    {
        "name": "Artisan Coffee Roasters",
        "category": "Food & Beverage", 
        "description": "Premium coffee roasters specializing in single-origin beans from sustainable farms. We offer artisanal blends and custom roasting services for cafes and restaurants.",
        "rating": 4.8,
        "reviews": 142,
        "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/artisancoffee",
            "facebook": "https://facebook.com/artisancoffee", 
            "website": "https://artisancoffee.com"
        },
        "owner": "Maria Rodriguez",
        "location": "Downtown District", 
        "city": "San Francisco",
        "established": "2019",
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Handcrafted Jewelry Studio",
        "category": "Arts & Crafts",
        "description": "Unique handmade jewelry pieces crafted with precious metals and ethically sourced gemstones. Custom design services available for special occasions.",
        "rating": 4.9,
        "reviews": 87,
        "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/handcraftedjewelry",
            "etsy": "https://etsy.com/shop/handcraftedjewelry",
            "website": "https://handcraftedjewelry.com"
        },
        "owner": "Sarah Chen",
        "location": "Arts Quarter", 
        "city": "Los Angeles",
        "established": "2020",
        "business_type": "both",
        "delivery_type": "nationwide"
    },
    {
        "name": "Green Thumb Nursery",
        "category": "Home & Garden",
        "description": "Organic plant nursery specializing in rare houseplants, succulents, and herb gardens. We provide plant care consulting and landscape design services.",
        "rating": 4.7,
        "reviews": 203,
        "image": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/greenthumbnursery",
            "facebook": "https://facebook.com/greenthumbnursery",
            "youtube": "https://youtube.com/greenthumbnursery"
        },
        "owner": "David Park",
        "location": "Garden District",
        "city": "San Francisco", 
        "established": "2018",
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Modern Web Solutions",
        "category": "Technology",
        "description": "Full-stack web development agency creating modern, responsive websites and web applications for small to medium businesses.",
        "rating": 4.9,
        "reviews": 156,
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "linkedin": "https://linkedin.com/company/modernwebsolutions",
            "github": "https://github.com/modernwebsolutions",
            "website": "https://modernwebsolutions.com"
        },
        "owner": "Alex Thompson",
        "location": "Tech Hub",
        "city": "Austin",
        "established": "2021",
        "business_type": "online",
        "delivery_type": "nationwide"
    },
    {
        "name": "Vintage Fashion Boutique",
        "category": "Fashion",
        "description": "Curated collection of vintage and sustainable fashion pieces from the 70s to 90s. We specialize in unique finds and eco-friendly fashion.",
        "rating": 4.6,
        "reviews": 94,
        "image": "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/vintagefashionboutique",
            "pinterest": "https://pinterest.com/vintagefashion",
            "website": "https://vintagefashionboutique.com"
        },
        "owner": "Emma Wilson",
        "location": "Fashion District",
        "city": "Los Angeles",
        "established": "2017",
        "business_type": "both",
        "delivery_type": "pickup_only"
    },
    {
        "name": "Gourmet Food Truck",
        "category": "Food & Beverage",
        "description": "Mobile gourmet kitchen serving fusion street food with locally sourced ingredients. Available for events, catering, and daily lunch spots.",
        "rating": 4.8,
        "reviews": 267,
        "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/gourmetfoodtruck",
            "twitter": "https://twitter.com/gourmetfoodtruck",
            "facebook": "https://facebook.com/gourmetfoodtruck"
        },
        "owner": "Carlos Martinez",
        "location": "Mobile Service",
        "city": "Austin",
        "established": "2020",
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Urban Fitness Studio",
        "category": "Health & Wellness",
        "description": "Modern fitness studio offering personal training, group classes, and wellness coaching. State-of-the-art equipment and certified trainers.",
        "rating": 4.7,
        "reviews": 189,
        "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/urbanfitnessstudio",
            "facebook": "https://facebook.com/urbanfitness",
            "website": "https://urbanfitnessstudio.com"
        },
        "owner": "Mike Johnson",
        "location": "Fitness District",
        "city": "New York",
        "established": "2019",
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Coastal Bakery",
        "category": "Food & Beverage",
        "description": "Artisanal bakery specializing in fresh bread, pastries, and custom cakes. Using organic ingredients and traditional baking methods.",
        "rating": 4.8,
        "reviews": 231,
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/coastalbakery",
            "facebook": "https://facebook.com/coastalbakery",
            "website": "https://coastalbakery.com"
        },
        "owner": "Jessica Lee",
        "location": "Waterfront",
        "city": "Seattle",
        "established": "2018",
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Digital Marketing Pro",
        "category": "Technology",
        "description": "Expert digital marketing services helping small businesses grow their online presence through strategic social media and content marketing.",
        "rating": 0.0,
        "reviews": 0,
        "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "website": "https://digitalmarketingpro.com",
            "instagram": "https://instagram.com/digitalmarketingpro",
            "tiktok": "https://tiktok.com/@digitalmarketingpro"
        },
        "owner": "Sarah Kim",
        "city": "Miami",
        "business_type": "online",
        "delivery_type": "local_and_pickup"
        # No location and established date provided
    },
    {
        "name": "Local Handyman Services",
        "category": "Professional Services",
        "description": "Reliable handyman services for all your home repair and maintenance needs. From plumbing to electrical work, we've got you covered.",
        "rating": 4.2,
        "reviews": 28,
        "image": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "facebook": "https://facebook.com/localhandyman"
        },
        "owner": "Mike Rodriguez",
        "location": "Service Area",
        "city": "Denver",
        "established": "2022"
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Creative Photo Studio",
        "category": "Arts & Crafts", 
        "description": "Professional photography studio specializing in portraits, events, and commercial photography. Bringing your vision to life with artistic excellence.",
        "rating": 4.9,
        "reviews": 64,
        "image": "https://images.unsplash.com/photo-1554048612-b6a482b224d1?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1554048612-b6a482b224d1?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1542038784456-1ea8e732a1d?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "website": "https://creativephotostudio.com",
            "instagram": "https://instagram.com/creativephotostudio",
            "facebook": "https://facebook.com/creativephotostudio",
            "tiktok": "https://tiktok.com/@creativephotostudio",
            "youtube": "https://youtube.com/creativephotostudio"
        },
        "owner": "Emily Chen",
        "established": "2019",
        "business_type": "both",
        "delivery_type": "local_and_pickup"
        # No location/city provided - completely missing
    },
    {
        "name": "Eco-Friendly Cleaning",
        "category": "Professional Services",
        "description": "Green cleaning services using only eco-friendly products. Safe for your family, pets, and the environment while delivering spotless results.",
        "rating": 4.7,
        "reviews": 112,
        "image": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "instagram": "https://instagram.com/ecofriendlycleaning",
            "tiktok": "https://tiktok.com/@ecofriendlycleaning"
        },
        "owner": "Maria Santos", 
        "location": "Residential & Commercial",
        "city": "Seattle"
        # No established date
    },
    {
        "name": "Book Haven Cafe",
        "category": "Food & Beverage",
        "description": "Cozy bookstore cafe serving artisan coffee and homemade pastries. The perfect place to read, work, or meet friends.",
        "rating": 4.5,
        "reviews": 73,
        "image": "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "website": "https://bookhavencafe.com",
            "instagram": "https://instagram.com/bookhavencafe"
        },
        "owner": "Lisa Johnson",
        "location": "Literary District",
        "city": "Portland",
        "established": "2020"
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Pet Grooming Spa",
        "category": "Professional Services", 
        "description": "Premium pet grooming services with a gentle touch. We pamper your pets like family with organic products and loving care.",
        "rating": 4.8,
        "reviews": 156,
        "image": "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "facebook": "https://facebook.com/petgroomingspa",
            "instagram": "https://instagram.com/petgroomingspa"
        },
        "owner": "Tom Wilson",
        "location": "Pet District",
        "city": "San Diego",
        "established": "2021"
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Artisan Bakery",
        "category": "Food & Beverage",
        "description": "Traditional European-style bakery creating fresh breads, croissants, and pastries daily using time-honored recipes.",
        "rating": 4.9,
        "reviews": 298,
        "image": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1555507036-ab794f0808c4?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "website": "https://artisanbakery.com",
            "instagram": "https://instagram.com/artisanbakery",
            "facebook": "https://facebook.com/artisanbakery"
        },
        "owner": "Pierre Dubois",
        "location": "Baker Street",
        "city": "Portland",
        "established": "2016"
        "business_type": "physical",
        "delivery_type": "local"
    },
    {
        "name": "Mobile Bike Repair", 
        "category": "Professional Services",
        "description": "On-the-go bike repair and maintenance service. We come to you for convenient, professional bicycle repairs anywhere in the city.",
        "rating": 4.6,
        "reviews": 84,
        "image": "https://images.unsplash.com/photo-1544191696-15693074e770?w=400&h=300&fit=crop",
        "gallery": [
            "https://images.unsplash.com/photo-1544191696-15693074e770?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=600&h=400&fit=crop"
        ],
        "socialLinks": {
            "website": "https://mobilebikerepair.com",
            "twitter": "https://twitter.com/mobilebikerepair"
        },
        "owner": "Jake Martinez",
        "city": "San Diego", 
        # No location/established date
    }
]

# Sample reviews data
reviews_data = [
    {"rating": 5, "text": "Amazing coffee! Best roastery in the city. The single-origin Ethiopian blend is incredible.", "reviewer": "John Smith"},
    {"rating": 4, "text": "Great atmosphere and excellent coffee. Perfect for working remotely.", "reviewer": "Emily Davis"},
    {"rating": 5, "text": "Outstanding service and the custom roasting is top-notch.", "reviewer": "Michael Brown"},
    
    {"rating": 5, "text": "Beautiful handcrafted jewelry! Sarah created the perfect engagement ring.", "reviewer": "David Wilson"},
    {"rating": 4, "text": "Unique designs and excellent craftsmanship. Highly recommended!", "reviewer": "Lisa Johnson"},
    
    {"rating": 4, "text": "Great selection of plants and very knowledgeable staff.", "reviewer": "Amanda Green"},
    {"rating": 5, "text": "They saved my dying succulent! Excellent plant care advice.", "reviewer": "Robert Taylor"},
    
    {"rating": 5, "text": "Professional web development team. Delivered exactly what we needed.", "reviewer": "Sarah Miller"},
    {"rating": 5, "text": "Modern, responsive design and great communication throughout the project.", "reviewer": "Tom Anderson"},
    
    {"rating": 4, "text": "Love the vintage collection! Found some amazing 80s pieces.", "reviewer": "Rachel White"},
    {"rating": 4, "text": "Sustainable fashion at its best. Great quality and unique finds.", "reviewer": "Kevin Martinez"},
    
    {"rating": 5, "text": "Best food truck in Austin! The fusion flavors are incredible.", "reviewer": "Chris Garcia"},
    {"rating": 5, "text": "Always fresh ingredients and creative combinations. A must-try!", "reviewer": "Jennifer Lopez"},
    
    {"rating": 4, "text": "Great trainers and modern equipment. Love the group classes.", "reviewer": "Mark Robinson"},
    {"rating": 5, "text": "Excellent fitness studio with personalized training programs.", "reviewer": "Nicole Clark"},
    
    {"rating": 5, "text": "Best bakery in Seattle! The sourdough bread is absolutely perfect.", "reviewer": "James Lee"},
    {"rating": 4, "text": "Delicious pastries and custom cakes. Great for special occasions.", "reviewer": "Maria Rodriguez"}
]

async def seed_database():
    """Seed the database with sample data"""
    
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Clear existing data
        await db.businesses.delete_many({})
        await db.reviews.delete_many({})
        print("Cleared existing data")
        
        # Insert businesses
        business_ids = []
        for business_data in businesses_data:
            # Add timestamps
            business_data["created_at"] = datetime.utcnow()
            business_data["updated_at"] = datetime.utcnow()
            
            result = await db.businesses.insert_one(business_data)
            business_ids.append(result.inserted_id)
            print(f"Inserted business: {business_data['name']}")
        
        # Insert reviews (distribute among businesses)
        review_index = 0
        for i, business_id in enumerate(business_ids):
            # Add 2-3 reviews per business
            reviews_count = min(2 + (i % 2), len(reviews_data) - review_index)
            
            for j in range(reviews_count):
                if review_index < len(reviews_data):
                    review = reviews_data[review_index].copy()
                    review["business_id"] = business_id
                    review["date"] = datetime.utcnow()
                    review["created_at"] = datetime.utcnow()
                    
                    await db.reviews.insert_one(review)
                    review_index += 1
        
        print(f"Inserted {review_index} reviews")
        
        # Create indexes for better performance
        await db.businesses.create_index([
            ("name", "text"),
            ("description", "text"), 
            ("category", "text"),
            ("city", "text")
        ])
        await db.businesses.create_index("category")
        await db.businesses.create_index("city")
        await db.businesses.create_index("rating")
        await db.reviews.create_index("business_id")
        
        print("Created database indexes")
        print("✅ Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())