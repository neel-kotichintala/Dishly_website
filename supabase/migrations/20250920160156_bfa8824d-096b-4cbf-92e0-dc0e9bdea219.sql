-- Add sample data to get started with Dishly

-- Insert sample restaurants from West Lafayette
INSERT INTO public.restaurants (name, address, city, state, cuisine_type) VALUES
('Triple XXX Family Restaurant', '2 N. Salisbury St', 'West Lafayette', 'IN', 'American'),
('Nine Irish Brothers', '544 E State St', 'West Lafayette', 'IN', 'Irish Pub'),
('Mad Mushroom', '320 E State St', 'West Lafayette', 'IN', 'Pizza'),
('Greyhouse Coffee', '111 N Grant St', 'West Lafayette', 'IN', 'Coffee Shop'),
('Bruno''s Swiss Inn', '1318 WIN Herschel Dr', 'West Lafayette', 'IN', 'Swiss'),
('Harry''s Chocolate Shop', '329 E State St', 'West Lafayette', 'IN', 'American'),
('Puccini''s Smiling Teeth', '1600 Teal Rd', 'West Lafayette', 'IN', 'Italian'),
('Korea Garden', '600 E State St', 'West Lafayette', 'IN', 'Korean')
ON CONFLICT DO NOTHING;

-- Insert sample food items with trending dishes
INSERT INTO public.food_items (name, canonical_name, description, restaurant_id, tags, price, avg_rating, rating_count, is_trending) 
SELECT 
    'The Barney Burger',
    'barney-burger',
    'A 1/4lb. chop steak, cheese and grilled onions - a Triple XXX classic',
    r.id,
    ARRAY['burger', 'classic', 'american'],
    12.99,
    4.5,
    127,
    true
FROM public.restaurants r WHERE r.name = 'Triple XXX Family Restaurant'
UNION ALL
SELECT 
    'Breaded Tenderloin',
    'breaded-tenderloin',
    'Crispy hand-breaded pork tenderloin sandwich',
    r.id,
    ARRAY['sandwich', 'pork', 'crispy'],
    11.49,
    4.3,
    89,
    true
FROM public.restaurants r WHERE r.name = 'Triple XXX Family Restaurant'
UNION ALL
SELECT 
    'Irish Pizza',
    'irish-pizza',
    'Unique Irish-style pizza with special toppings',
    r.id,
    ARRAY['pizza', 'irish', 'unique'],
    14.99,
    4.2,
    64,
    false
FROM public.restaurants r WHERE r.name = 'Nine Irish Brothers'
UNION ALL
SELECT 
    'Boat of Wings',
    'boat-of-wings',
    'Generous portion of wings with your choice of sauce',
    r.id,
    ARRAY['wings', 'spicy', 'shareable'],
    16.99,
    4.4,
    112,
    true
FROM public.restaurants r WHERE r.name = 'Nine Irish Brothers'
UNION ALL
SELECT 
    'Mad Mushroom Pizza',
    'mad-mushroom-pizza',
    'Signature pizza with fresh mushrooms and house sauce',
    r.id,
    ARRAY['pizza', 'mushroom', 'signature'],
    18.99,
    4.6,
    203,
    true
FROM public.restaurants r WHERE r.name = 'Mad Mushroom'
UNION ALL
SELECT 
    'Breakfast Burrito',
    'breakfast-burrito',
    'Hearty burrito with eggs, cheese, and your choice of meat',
    r.id,
    ARRAY['breakfast', 'burrito', 'hearty'],
    8.99,
    4.1,
    45,
    false
FROM public.restaurants r WHERE r.name = 'Greyhouse Coffee'
UNION ALL
SELECT 
    'Swiss Rosti',
    'swiss-rosti',
    'Traditional Swiss potato dish with crispy golden edges',
    r.id,
    ARRAY['swiss', 'potato', 'traditional'],
    13.99,
    4.7,
    78,
    true
FROM public.restaurants r WHERE r.name = 'Bruno''s Swiss Inn'
UNION ALL
SELECT 
    'Chocolate Shop Burger',
    'chocolate-shop-burger',
    'Famous burger from this historic Purdue landmark',
    r.id,
    ARRAY['burger', 'famous', 'historic'],
    10.99,
    4.3,
    156,
    false
FROM public.restaurants r WHERE r.name = 'Harry''s Chocolate Shop'
UNION ALL
SELECT 
    'Linguine Carbonara',
    'linguine-carbonara',
    'Classic Italian pasta with eggs, cheese, and pancetta',
    r.id,
    ARRAY['pasta', 'italian', 'carbonara'],
    17.99,
    4.5,
    92,
    false
FROM public.restaurants r WHERE r.name = 'Puccini''s Smiling Teeth'
UNION ALL
SELECT 
    'Korean BBQ Bulgogi',
    'korean-bbq-bulgogi',
    'Marinated beef bulgogi with rice and banchan',
    r.id,
    ARRAY['korean', 'bbq', 'beef'],
    19.99,
    4.8,
    134,
    true
FROM public.restaurants r WHERE r.name = 'Korea Garden'
ON CONFLICT DO NOTHING;