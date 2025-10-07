// Mock data for business catalog
export const mockBusinesses = [
  {
    id: '1',
    name: 'Artisan Coffee Roasters',
    category: 'Food & Beverage',
    description: 'Premium coffee roasters specializing in single-origin beans from sustainable farms. We offer artisanal blends and custom roasting services for cafes and restaurants.',
    rating: 4.8,
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/artisancoffee',
      facebook: 'https://facebook.com/artisancoffee',
      website: 'https://artisancoffee.com'
    },
    owner: 'Maria Rodriguez',
    location: 'Downtown District',
    city: 'San Francisco',
    established: '2019'
  },
  {
    id: '2',
    name: 'Handcrafted Jewelry Studio',
    category: 'Arts & Crafts',
    description: 'Unique handmade jewelry pieces crafted with precious metals and ethically sourced gemstones. Custom design services available for special occasions.',
    rating: 4.9,
    reviews: 87,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/handcraftedjewelry',
      etsy: 'https://etsy.com/shop/handcraftedjewelry',
      website: 'https://handcraftedjewelry.com'
    },
    owner: 'Sarah Chen',
    location: 'Arts Quarter',
    city: 'Los Angeles',
    established: '2020'
  },
  {
    id: '3',
    name: 'Green Thumb Nursery',
    category: 'Home & Garden',
    description: 'Organic plant nursery specializing in rare houseplants, succulents, and herb gardens. We provide plant care consulting and landscape design services.',
    rating: 4.7,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/greenthumbnursery',
      facebook: 'https://facebook.com/greenthumbnursery',
      youtube: 'https://youtube.com/greenthumbnursery'
    },
    owner: 'David Park',
    location: 'Garden District',
    city: 'San Francisco',
    established: '2018'
  },
  {
    id: '4',
    name: 'Modern Web Solutions',
    category: 'Technology',
    description: 'Full-stack web development agency creating modern, responsive websites and web applications for small to medium businesses.',
    rating: 4.9,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/modernwebsolutions',
      github: 'https://github.com/modernwebsolutions',
      website: 'https://modernwebsolutions.com'
    },
    owner: 'Alex Thompson',
    location: 'Tech Hub',
    city: 'Austin',
    established: '2021'
  },
  {
    id: '5',
    name: 'Vintage Fashion Boutique',
    category: 'Fashion',
    description: 'Curated collection of vintage and sustainable fashion pieces from the 70s to 90s. We specialize in unique finds and eco-friendly fashion.',
    rating: 4.6,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/vintagefashionboutique',
      pinterest: 'https://pinterest.com/vintagefashion',
      website: 'https://vintagefashionboutique.com'
    },
    owner: 'Emma Wilson',
    location: 'Fashion District',
    city: 'Los Angeles',
    established: '2017'
  },
  {
    id: '6',
    name: 'Gourmet Food Truck',
    category: 'Food & Beverage',
    description: 'Mobile gourmet kitchen serving fusion street food with locally sourced ingredients. Available for events, catering, and daily lunch spots.',
    rating: 4.8,
    reviews: 267,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/gourmetfoodtruck',
      twitter: 'https://twitter.com/gourmetfoodtruck',
      facebook: 'https://facebook.com/gourmetfoodtruck'
    },
    owner: 'Carlos Martinez',
    location: 'Mobile Service',
    city: 'Austin',
    established: '2020'
  },
  {
    id: '7',
    name: 'Urban Fitness Studio',
    category: 'Health & Wellness',
    description: 'Modern fitness studio offering personal training, group classes, and wellness coaching. State-of-the-art equipment and certified trainers.',
    rating: 4.7,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/urbanfitnessstudio',
      facebook: 'https://facebook.com/urbanfitness',
      website: 'https://urbanfitnessstudio.com'
    },
    owner: 'Mike Johnson',
    location: 'Fitness District',
    city: 'New York',
    established: '2019'
  },
  {
    id: '8',
    name: 'Coastal Bakery',
    category: 'Food & Beverage',
    description: 'Artisanal bakery specializing in fresh bread, pastries, and custom cakes. Using organic ingredients and traditional baking methods.',
    rating: 4.8,
    reviews: 231,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop'
    ],
    socialLinks: {
      instagram: 'https://instagram.com/coastalbakery',
      facebook: 'https://facebook.com/coastalbakery',
      website: 'https://coastalbakery.com'
    },
    owner: 'Jessica Lee',
    location: 'Waterfront',
    city: 'Seattle',
    established: '2018'
  }
];

// Categories for filtering
export const categories = [
  'All',
  'Food & Beverage',
  'Arts & Crafts',
  'Home & Garden',
  'Technology',
  'Fashion',
  'Health & Wellness'
];

// Cities for location filtering
export const cities = [
  'All Cities',
  'San Francisco',
  'Los Angeles', 
  'Austin',
  'New York',
  'Seattle',
  'Denver',
  'Miami'
];