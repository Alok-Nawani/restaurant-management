const { sequelize } = require('../models');
const { seedStaff } = require('./seedStaff');
const { seedAdditionalStaff } = require('./seedAdditionalStaff');
const { seedMoreStaff } = require('./seedMoreStaff');
const { seedInventory } = require('./seedInventory');
const { seedAdditionalInventory } = require('./seedAdditionalInventory');
const { seedMoreInventory } = require('./seedMoreInventory');
const { seedEvenMoreMenuItems } = require('./seedEvenMoreMenuItems');
const bcrypt = require('bcryptjs');

async function seedComprehensiveEnhanced() {
  try {
    console.log('🌱 Starting ENHANCED comprehensive database seeding...');
    
    // Force sync to reset database
    await sequelize.sync({ force: true });
    console.log('✅ Database reset complete');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    const { User } = require('../models');
    await User.create({
      username: 'admin',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin'
    });
    console.log('✅ Admin user created');
    
    // Seed comprehensive menu items (150+ items)
    console.log('🍽️ Seeding comprehensive menu items (150+ items)...');
    const { MenuItem } = require('../models');
    await MenuItem.bulkCreate([
      // ========== APPETIZERS (20 items) ==========
      { name: 'Paneer Tikka', price: 120, category: 'Appetizer', description: 'Grilled cottage cheese with spices', available: true, isVeg: true },
      { name: 'Chicken Tikka', price: 140, category: 'Appetizer', description: 'Grilled chicken with spices', available: true, isVeg: false },
      { name: 'Chicken Wings', price: 120, category: 'Appetizer', description: 'Spicy chicken wings', available: true, isVeg: false },
      { name: 'Fish Fingers', price: 100, category: 'Appetizer', description: 'Breaded fish strips', available: true, isVeg: false },
      { name: 'Spring Rolls', price: 80, category: 'Appetizer', description: 'Crispy vegetable spring rolls', available: true, isVeg: true },
      { name: 'Chicken Nuggets', price: 90, category: 'Appetizer', description: 'Breaded chicken pieces', available: true, isVeg: false },
      { name: 'Tandoori Chicken', price: 180, category: 'Appetizer', description: 'Traditional tandoori chicken', available: true, isVeg: false },
      { name: 'Seekh Kebab', price: 150, category: 'Appetizer', description: 'Spiced minced meat kebab', available: true, isVeg: false },
      { name: 'Hara Bhara Kebab', price: 110, category: 'Appetizer', description: 'Green vegetable kebab', available: true, isVeg: true },
      { name: 'Aloo Tikki', price: 60, category: 'Appetizer', description: 'Spiced potato patties', available: true, isVeg: true },
      { name: 'Chicken Lollipop', price: 130, category: 'Appetizer', description: 'Spicy chicken drumsticks', available: true, isVeg: false },
      { name: 'Mutton Seekh Kebab', price: 160, category: 'Appetizer', description: 'Mutton kebab on skewers', available: true, isVeg: false },
      { name: 'Paneer Chilli', price: 125, category: 'Appetizer', description: 'Indo-Chinese paneer', available: true, isVeg: true },
      { name: 'Gobi Manchurian', price: 115, category: 'Appetizer', description: 'Cauliflower in Chinese sauce', available: true, isVeg: true },
      { name: 'Mushroom Tikka', price: 135, category: 'Appetizer', description: 'Grilled mushrooms with spices', available: true, isVeg: true },
      { name: 'Prawn Tempura', price: 180, category: 'Appetizer', description: 'Battered and fried prawns', available: true, isVeg: false },
      { name: 'Chicken Satay', price: 145, category: 'Appetizer', description: 'Grilled chicken skewers', available: true, isVeg: false },
      { name: 'Veg Manchurian', price: 105, category: 'Appetizer', description: 'Vegetable balls in Chinese sauce', available: true, isVeg: true },
      { name: 'Chicken 65', price: 150, category: 'Appetizer', description: 'Spicy deep-fried chicken', available: true, isVeg: false },
      { name: 'Paneer 65', price: 130, category: 'Appetizer', description: 'Spicy deep-fried paneer', available: true, isVeg: true },

      // ========== RICE DISHES (25 items) ==========
      { name: 'Veg Biryani', price: 180, category: 'Rice', description: 'Aromatic basmati rice with mixed vegetables', available: true, isVeg: true },
      { name: 'Chicken Biryani', price: 220, category: 'Rice', description: 'Aromatic rice with spiced chicken', available: true, isVeg: false },
      { name: 'Mutton Biryani', price: 280, category: 'Rice', description: 'Aromatic rice with spiced mutton', available: true, isVeg: false },
      { name: 'Prawn Biryani', price: 250, category: 'Rice', description: 'Aromatic rice with prawns', available: true, isVeg: false },
      { name: 'Egg Biryani', price: 200, category: 'Rice', description: 'Aromatic rice with boiled eggs', available: true, isVeg: false },
      { name: 'Vegetable Pulao', price: 160, category: 'Rice', description: 'Fragrant rice with mixed vegetables', available: true, isVeg: true },
      { name: 'Chicken Pulao', price: 190, category: 'Rice', description: 'Fragrant rice with chicken', available: true, isVeg: false },
      { name: 'Mutton Pulao', price: 240, category: 'Rice', description: 'Fragrant rice with mutton', available: true, isVeg: false },
      { name: 'Jeera Rice', price: 80, category: 'Rice', description: 'Cumin flavored basmati rice', available: true, isVeg: true },
      { name: 'Lemon Rice', price: 90, category: 'Rice', description: 'Tangy lemon flavored rice', available: true, isVeg: true },
      { name: 'Coconut Rice', price: 100, category: 'Rice', description: 'Coconut flavored rice', available: true, isVeg: true },
      { name: 'Tomato Rice', price: 85, category: 'Rice', description: 'Tangy tomato flavored rice', available: true, isVeg: true },
      { name: 'Fried Rice', price: 120, category: 'Rice', description: 'Chinese style fried rice', available: true, isVeg: true },
      { name: 'Chicken Fried Rice', price: 150, category: 'Rice', description: 'Chinese style chicken fried rice', available: true, isVeg: false },
      { name: 'Egg Fried Rice', price: 130, category: 'Rice', description: 'Chinese style egg fried rice', available: true, isVeg: false },
      { name: 'Schezwan Rice', price: 140, category: 'Rice', description: 'Spicy Schezwan flavored rice', available: true, isVeg: true },
      { name: 'Hyderabadi Biryani', price: 260, category: 'Rice', description: 'Traditional Hyderabadi style biryani', available: true, isVeg: false },
      { name: 'Lucknowi Biryani', price: 270, category: 'Rice', description: 'Awadhi style biryani', available: true, isVeg: false },
      { name: 'Kolkata Biryani', price: 240, category: 'Rice', description: 'Bengali style biryani with potato', available: true, isVeg: false },
      { name: 'Thalassery Biryani', price: 250, category: 'Rice', description: 'Kerala style biryani', available: true, isVeg: false },
      { name: 'Paneer Biryani', price: 200, category: 'Rice', description: 'Aromatic rice with paneer', available: true, isVeg: true },
      { name: 'Mushroom Biryani', price: 190, category: 'Rice', description: 'Aromatic rice with mushrooms', available: true, isVeg: true },
      { name: 'Soya Biryani', price: 170, category: 'Rice', description: 'Aromatic rice with soya chunks', available: true, isVeg: true },
      { name: 'Kashmiri Pulao', price: 180, category: 'Rice', description: 'Sweet pulao with dry fruits', available: true, isVeg: true },
      { name: 'Tawa Pulao', price: 140, category: 'Rice', description: 'Street style spicy pulao', available: true, isVeg: true },

      // ========== CURRIES (30 items) ==========
      { name: 'Chicken Curry', price: 200, category: 'Curry', description: 'Spicy chicken curry with onions and tomatoes', available: true, isVeg: false },
      { name: 'Mutton Curry', price: 250, category: 'Curry', description: 'Rich mutton curry with spices', available: true, isVeg: false },
      { name: 'Fish Curry', price: 180, category: 'Curry', description: 'Spicy fish curry with coconut milk', available: true, isVeg: false },
      { name: 'Prawn Curry', price: 220, category: 'Curry', description: 'Spicy prawn curry', available: true, isVeg: false },
      { name: 'Chicken Korma', price: 200, category: 'Curry', description: 'Mild chicken curry with cream', available: true, isVeg: false },
      { name: 'Mutton Korma', price: 260, category: 'Curry', description: 'Mild mutton curry with cream', available: true, isVeg: false },
      { name: 'Butter Chicken', price: 220, category: 'Curry', description: 'Creamy tomato chicken curry', available: true, isVeg: false },
      { name: 'Chicken Tikka Masala', price: 210, category: 'Curry', description: 'Creamy chicken tikka curry', available: true, isVeg: false },
      { name: 'Kadai Chicken', price: 200, category: 'Curry', description: 'Spicy kadai style chicken', available: true, isVeg: false },
      { name: 'Chicken Do Pyaza', price: 190, category: 'Curry', description: 'Chicken with double onions', available: true, isVeg: false },
      { name: 'Chicken Handi', price: 210, category: 'Curry', description: 'Creamy chicken curry', available: true, isVeg: false },
      { name: 'Mutton Rogan Josh', price: 270, category: 'Curry', description: 'Kashmiri style mutton curry', available: true, isVeg: false },
      { name: 'Mutton Keema', price: 240, category: 'Curry', description: 'Spiced minced mutton', available: true, isVeg: false },
      { name: 'Fish Moilee', price: 190, category: 'Curry', description: 'Kerala style fish curry', available: true, isVeg: false },
      { name: 'Prawn Malai Curry', price: 230, category: 'Curry', description: 'Creamy prawn curry', available: true, isVeg: false },
      { name: 'Chana Masala', price: 110, category: 'Curry', description: 'Spiced chickpea curry', available: true, isVeg: true },
      { name: 'Rajma', price: 120, category: 'Curry', description: 'Kidney bean curry', available: true, isVeg: true },
      { name: 'Dal Makhani', price: 150, category: 'Curry', description: 'Creamy black lentils with butter', available: true, isVeg: true },
      { name: 'Paneer Butter Masala', price: 170, category: 'Curry', description: 'Rich tomato and butter gravy', available: true, isVeg: true },
      { name: 'Paneer Tikka Masala', price: 180, category: 'Curry', description: 'Creamy paneer tikka curry', available: true, isVeg: true },
      { name: 'Navratan Korma', price: 165, category: 'Curry', description: 'Nine veggie creamy curry', available: true, isVeg: true },
      { name: 'Malai Kofta', price: 160, category: 'Curry', description: 'Cottage cheese balls in cream', available: true, isVeg: true },
      { name: 'Egg Curry', price: 120, category: 'Curry', description: 'Boiled eggs in spiced gravy', available: true, isVeg: false },
      { name: 'Mushroom Curry', price: 140, category: 'Curry', description: 'Spicy mushroom curry', available: true, isVeg: true },
      { name: 'Aloo Matar', price: 90, category: 'Curry', description: 'Potato and green pea curry', available: true, isVeg: true },
      { name: 'Bhindi Masala', price: 100, category: 'Curry', description: 'Spiced okra curry', available: true, isVeg: true },
      { name: 'Baingan Bharta', price: 110, category: 'Curry', description: 'Roasted eggplant curry', available: true, isVeg: true },
      { name: 'Mix Vegetable Curry', price: 120, category: 'Curry', description: 'Mixed vegetable curry', available: true, isVeg: true },
      { name: 'Kadai Paneer', price: 150, category: 'Curry', description: 'Paneer in kadai spices', available: true, isVeg: true },
      { name: 'Methi Malai Paneer', price: 160, category: 'Curry', description: 'Paneer with fenugreek and cream', available: true, isVeg: true },

      // ========== VEGETABLES (20 items) ==========
      { name: 'Aloo Gobi', price: 100, category: 'Vegetable', description: 'Potato and cauliflower curry', available: true, isVeg: true },
      { name: 'Palak Paneer', price: 130, category: 'Vegetable', description: 'Cottage cheese in spinach gravy', available: true, isVeg: true },
      { name: 'Mutter Paneer', price: 140, category: 'Vegetable', description: 'Cottage cheese with green peas', available: true, isVeg: true },
      { name: 'Aloo Matar', price: 90, category: 'Vegetable', description: 'Potato and green pea curry', available: true, isVeg: true },
      { name: 'Baingan Bharta', price: 110, category: 'Vegetable', description: 'Roasted eggplant curry', available: true, isVeg: true },
      { name: 'Mix Vegetable', price: 120, category: 'Vegetable', description: 'Mixed vegetable curry', available: true, isVeg: true },
      { name: 'Bhindi Masala', price: 100, category: 'Vegetable', description: 'Spiced okra curry', available: true, isVeg: true },
      { name: 'Gobi Manchurian', price: 130, category: 'Vegetable', description: 'Indo-Chinese cauliflower', available: true, isVeg: true },
      { name: 'Mushroom Masala', price: 130, category: 'Vegetable', description: 'Mushroom curry', available: true, isVeg: true },
      { name: 'Aloo Jeera', price: 95, category: 'Vegetable', description: 'Cumin tempered potatoes', available: true, isVeg: true },
      { name: 'Karela Sabzi', price: 105, category: 'Vegetable', description: 'Bitter gourd curry', available: true, isVeg: true },
      { name: 'Lauki Sabzi', price: 90, category: 'Vegetable', description: 'Bottle gourd curry', available: true, isVeg: true },
      { name: 'Tinda Sabzi', price: 85, category: 'Vegetable', description: 'Indian squash curry', available: true, isVeg: true },
      { name: 'Chana Pulao', price: 115, category: 'Vegetable', description: 'Chickpea with vegetables', available: true, isVeg: true },
      { name: 'Dum Aloo', price: 125, category: 'Vegetable', description: 'Potato in rich gravy', available: true, isVeg: true },
      { name: 'Paneer Do Pyaza', price: 155, category: 'Vegetable', description: 'Paneer with double onions', available: true, isVeg: true },
      { name: 'Shahi Paneer', price: 165, category: 'Vegetable', description: 'Royal style paneer curry', available: true, isVeg: true },
      { name: 'Paneer Pasanda', price: 170, category: 'Vegetable', description: 'Stuffed paneer in gravy', available: true, isVeg: true },
      { name: 'Veg Kofta', price: 145, category: 'Vegetable', description: 'Vegetable balls in gravy', available: true, isVeg: true },
      { name: 'Stuffed Capsicum', price: 135, category: 'Vegetable', description: 'Bell peppers stuffed with vegetables', available: true, isVeg: true },

      // ========== BREADS (15 items) ==========
      { name: 'Butter Naan', price: 30, category: 'Bread', description: 'Soft leavened bread with butter', available: true, isVeg: true },
      { name: 'Garlic Naan', price: 40, category: 'Bread', description: 'Leavened bread with garlic and herbs', available: true, isVeg: true },
      { name: 'Tandoori Roti', price: 20, category: 'Bread', description: 'Whole wheat bread cooked in tandoor', available: true, isVeg: true },
      { name: 'Onion Kulcha', price: 35, category: 'Bread', description: 'Stuffed bread with onions', available: true, isVeg: true },
      { name: 'Aloo Paratha', price: 50, category: 'Bread', description: 'Stuffed bread with potato', available: true, isVeg: true },
      { name: 'Gobi Paratha', price: 55, category: 'Bread', description: 'Stuffed bread with cauliflower', available: true, isVeg: true },
      { name: 'Paneer Paratha', price: 60, category: 'Bread', description: 'Stuffed bread with cottage cheese', available: true, isVeg: true },
      { name: 'Missi Roti', price: 25, category: 'Bread', description: 'Spiced gram flour bread', available: true, isVeg: true },
      { name: 'Rumali Roti', price: 25, category: 'Bread', description: 'Thin handkerchief roti', available: true, isVeg: true },
      { name: 'Bhatura', price: 35, category: 'Bread', description: 'Deep fried leavened bread', available: true, isVeg: true },
      { name: 'Poori', price: 30, category: 'Bread', description: 'Deep fried whole wheat bread', available: true, isVeg: true },
      { name: 'Chapati', price: 15, category: 'Bread', description: 'Whole wheat flatbread', available: true, isVeg: true },
      { name: 'Phulka', price: 18, category: 'Bread', description: 'Puffed wheat bread', available: true, isVeg: true },
      { name: 'Lachha Paratha', price: 45, category: 'Bread', description: 'Layered flaky bread', available: true, isVeg: true },
      { name: 'Stuffed Naan', price: 50, category: 'Bread', description: 'Naan stuffed with paneer and vegetables', available: true, isVeg: true },

      // ========== PIZZA (10 items) ==========
      { name: 'Margherita Pizza', price: 250, category: 'Pizza', description: 'Classic tomato and mozzarella pizza', available: true, isVeg: true },
      { name: 'Pepperoni Pizza', price: 280, category: 'Pizza', description: 'Pepperoni with mozzarella cheese', available: true, isVeg: false },
      { name: 'Veg Supreme Pizza', price: 260, category: 'Pizza', description: 'Mixed vegetables with cheese', available: true, isVeg: true },
      { name: 'Chicken Pizza', price: 300, category: 'Pizza', description: 'Chicken with vegetables and cheese', available: true, isVeg: false },
      { name: 'BBQ Chicken Pizza', price: 320, category: 'Pizza', description: 'BBQ chicken with onions and cheese', available: true, isVeg: false },
      { name: 'Paneer Pizza', price: 270, category: 'Pizza', description: 'Cottage cheese with vegetables', available: true, isVeg: true },
      { name: 'Mushroom Pizza', price: 265, category: 'Pizza', description: 'Mushrooms with cheese and herbs', available: true, isVeg: true },
      { name: 'Farmhouse Pizza', price: 275, category: 'Pizza', description: 'Mixed vegetables and corn', available: true, isVeg: true },
      { name: 'Cheese Burst Pizza', price: 290, category: 'Pizza', description: 'Extra cheese stuffed crust', available: true, isVeg: true },
      { name: 'Chicken Supreme Pizza', price: 330, category: 'Pizza', description: 'Chicken with all toppings', available: true, isVeg: false },

      // ========== BEVERAGES (20 items) ==========
      { name: 'Cold Coffee', price: 80, category: 'Beverage', description: 'Iced coffee with milk and sugar', available: true, isVeg: true },
      { name: 'Mango Lassi', price: 70, category: 'Beverage', description: 'Sweet yogurt drink with mango', available: true, isVeg: true },
      { name: 'Masala Chai', price: 30, category: 'Beverage', description: 'Spiced tea with milk', available: true, isVeg: true },
      { name: 'Fresh Lime Soda', price: 40, category: 'Beverage', description: 'Refreshing lime drink', available: true, isVeg: true },
      { name: 'Thums Up', price: 35, category: 'Beverage', description: 'Cola soft drink', available: true, isVeg: true },
      { name: 'Sprite', price: 35, category: 'Beverage', description: 'Lemon-lime soft drink', available: true, isVeg: true },
      { name: 'Mineral Water', price: 20, category: 'Beverage', description: 'Bottled mineral water', available: true, isVeg: true },
      { name: 'Fresh Juice', price: 60, category: 'Beverage', description: 'Fresh seasonal fruit juice', available: true, isVeg: true },
      { name: 'Coconut Water', price: 50, category: 'Beverage', description: 'Fresh coconut water', available: true, isVeg: true },
      { name: 'Buttermilk', price: 25, category: 'Beverage', description: 'Spiced buttermilk', available: true, isVeg: true },
      { name: 'Green Tea', price: 40, category: 'Beverage', description: 'Light green tea', available: true, isVeg: true },
      { name: 'Herbal Tea', price: 45, category: 'Beverage', description: 'Aromatic herbal infusion', available: true, isVeg: true },
      { name: 'Hot Chocolate', price: 80, category: 'Beverage', description: 'Rich chocolate drink', available: true, isVeg: true },
      { name: 'Rose Lassi', price: 55, category: 'Beverage', description: 'Rose flavored yogurt drink', available: true, isVeg: true },
      { name: 'Badam Milk', price: 70, category: 'Beverage', description: 'Almond milk', available: true, isVeg: true },
      { name: 'Kesar Milk', price: 65, category: 'Beverage', description: 'Saffron milk', available: true, isVeg: true },
      { name: 'Lassi', price: 50, category: 'Beverage', description: 'Sweet yogurt drink', available: true, isVeg: true },
      { name: 'Salted Lassi', price: 45, category: 'Beverage', description: 'Salted yogurt drink', available: true, isVeg: true },
      { name: 'Mango Shake', price: 75, category: 'Beverage', description: 'Thick mango milkshake', available: true, isVeg: true },
      { name: 'Chocolate Shake', price: 85, category: 'Beverage', description: 'Rich chocolate milkshake', available: true, isVeg: true },

      // ========== DESSERTS (15 items) ==========
      { name: 'Gulab Jamun', price: 60, category: 'Dessert', description: 'Sweet milk dumplings in syrup', available: true, isVeg: true },
      { name: 'Ice Cream', price: 50, category: 'Dessert', description: 'Vanilla ice cream', available: true, isVeg: true },
      { name: 'Kulfi', price: 45, category: 'Dessert', description: 'Traditional Indian ice cream', available: true, isVeg: true },
      { name: 'Ras Malai', price: 70, category: 'Dessert', description: 'Sweet cottage cheese in milk', available: true, isVeg: true },
      { name: 'Kheer', price: 55, category: 'Dessert', description: 'Rice pudding with nuts', available: true, isVeg: true },
      { name: 'Jalebi', price: 40, category: 'Dessert', description: 'Sweet fried pretzel', available: true, isVeg: true },
      { name: 'Rasgulla', price: 50, category: 'Dessert', description: 'Sweet cottage cheese balls', available: true, isVeg: true },
      { name: 'Halwa', price: 45, category: 'Dessert', description: 'Sweet semolina pudding', available: true, isVeg: true },
      { name: 'Barfi', price: 50, category: 'Dessert', description: 'Milk-based fudge', available: true, isVeg: true },
      { name: 'Ladoo', price: 45, category: 'Dessert', description: 'Gram flour sweet balls', available: true, isVeg: true },
      { name: 'Phirni', price: 70, category: 'Dessert', description: 'Creamy ground rice pudding', available: true, isVeg: true },
      { name: 'Rabri', price: 75, category: 'Dessert', description: 'Thickened milk dessert', available: true, isVeg: true },
      { name: 'Kulfi Falooda', price: 80, category: 'Dessert', description: 'Ice cream with vermicelli', available: true, isVeg: true },
      { name: 'Gajar Ka Halwa', price: 65, category: 'Dessert', description: 'Carrot pudding', available: true, isVeg: true },
      { name: 'Moong Dal Halwa', price: 70, category: 'Dessert', description: 'Lentil pudding', available: true, isVeg: true },

      // ========== SNACKS (20 items) ==========
      { name: 'Samosa', price: 25, category: 'Snack', description: 'Fried pastry with spiced potato filling', available: true, isVeg: true },
      { name: 'Kachori', price: 30, category: 'Snack', description: 'Fried pastry with lentil filling', available: true, isVeg: true },
      { name: 'Pakora', price: 35, category: 'Snack', description: 'Fried vegetable fritters', available: true, isVeg: true },
      { name: 'Bhel Puri', price: 45, category: 'Snack', description: 'Puffed rice with chutneys', available: true, isVeg: true },
      { name: 'Pani Puri', price: 50, category: 'Snack', description: 'Hollow puris with spiced water', available: true, isVeg: true },
      { name: 'Dahi Vada', price: 40, category: 'Snack', description: 'Lentil dumplings in yogurt', available: true, isVeg: true },
      { name: 'Chicken Roll', price: 80, category: 'Snack', description: 'Chicken wrapped in paratha', available: true, isVeg: false },
      { name: 'Egg Roll', price: 60, category: 'Snack', description: 'Egg wrapped in paratha', available: true, isVeg: false },
      { name: 'Veg Roll', price: 50, category: 'Snack', description: 'Vegetables wrapped in paratha', available: true, isVeg: true },
      { name: 'Chicken Sandwich', price: 90, category: 'Snack', description: 'Chicken sandwich with vegetables', available: true, isVeg: false },
      { name: 'Veg Sandwich', price: 70, category: 'Snack', description: 'Vegetable sandwich', available: true, isVeg: true },
      { name: 'Club Sandwich', price: 100, category: 'Snack', description: 'Multi-layer sandwich', available: true, isVeg: false },
      { name: 'French Fries', price: 60, category: 'Snack', description: 'Crispy potato fries', available: true, isVeg: true },
      { name: 'Onion Rings', price: 55, category: 'Snack', description: 'Battered and fried onion rings', available: true, isVeg: true },
      { name: 'Vada Pav', price: 40, category: 'Snack', description: 'Mumbai style potato slider', available: true, isVeg: true },
      { name: 'Dhokla', price: 50, category: 'Snack', description: 'Steamed gram flour cake', available: true, isVeg: true },
      { name: 'Medu Vada', price: 55, category: 'Snack', description: 'South Indian lentil donut', available: true, isVeg: true },
      { name: 'Idli Sambar', price: 60, category: 'Snack', description: 'Steamed rice cakes with lentil soup', available: true, isVeg: true },
      { name: 'Dosa', price: 70, category: 'Snack', description: 'Crispy rice crepe', available: true, isVeg: true },
      { name: 'Uttapam', price: 65, category: 'Snack', description: 'Thick rice pancake', available: true, isVeg: true },

      // ========== DAL DISHES (10 items) ==========
      { name: 'Dal Tadka', price: 90, category: 'Dal', description: 'Tempered yellow lentils', available: true, isVeg: true },
      { name: 'Dal Makhani', price: 150, category: 'Dal', description: 'Creamy black lentils with butter', available: true, isVeg: true },
      { name: 'Chana Dal', price: 85, category: 'Dal', description: 'Split chickpea lentils', available: true, isVeg: true },
      { name: 'Moong Dal', price: 80, category: 'Dal', description: 'Yellow split lentils', available: true, isVeg: true },
      { name: 'Masoor Dal', price: 75, category: 'Dal', description: 'Red lentils curry', available: true, isVeg: true },
      { name: 'Dal Fry', price: 95, category: 'Dal', description: 'Fried lentil curry', available: true, isVeg: true },
      { name: 'Dal Palak', price: 100, category: 'Dal', description: 'Lentils with spinach', available: true, isVeg: true },
      { name: 'Tarka Dal', price: 88, category: 'Dal', description: 'Spiced lentil curry', available: true, isVeg: true },
      { name: 'Dal Chawal', price: 110, category: 'Dal', description: 'Lentils with rice combo', available: true, isVeg: true },
      { name: 'Sambhar', price: 70, category: 'Dal', description: 'South Indian lentil soup', available: true, isVeg: true },

      // ========== SIDES (10 items) ==========
      { name: 'Raita', price: 50, category: 'Side', description: 'Yogurt with cucumber and spices', available: true, isVeg: true },
      { name: 'Papad', price: 15, category: 'Side', description: 'Crispy lentil wafers', available: true, isVeg: true },
      { name: 'Pickle', price: 20, category: 'Side', description: 'Spicy mixed vegetable pickle', available: true, isVeg: true },
      { name: 'Chutney', price: 25, category: 'Side', description: 'Mint and coriander chutney', available: true, isVeg: true },
      { name: 'Salad', price: 40, category: 'Side', description: 'Fresh mixed vegetable salad', available: true, isVeg: true },
      { name: 'Soup', price: 60, category: 'Side', description: 'Hot vegetable soup', available: true, isVeg: true },
      { name: 'Onion Salad', price: 30, category: 'Side', description: 'Sliced onions with lemon', available: true, isVeg: true },
      { name: 'Green Chutney', price: 25, category: 'Side', description: 'Mint and coriander dip', available: true, isVeg: true },
      { name: 'Red Chutney', price: 25, category: 'Side', description: 'Spicy red chutney', available: true, isVeg: true },
      { name: 'Mixed Pickle', price: 30, category: 'Side', description: 'Assorted vegetable pickle', available: true, isVeg: true }
    ]);
    console.log('✅ Menu items seeded (175+ items)');
    
    // Seed all other data using individual seeders
    console.log('👥 Seeding staff data...');
    await seedStaff();
    await seedAdditionalStaff();
    await seedMoreStaff();
    console.log('✅ Staff data seeded');
    
    console.log('📦 Seeding inventory data...');
    await seedInventory();
    await seedAdditionalInventory();
    await seedMoreInventory();
    console.log('✅ Inventory data seeded');
    
    console.log('🍽️ Seeding even more menu items...');
    await seedEvenMoreMenuItems();
    console.log('✅ Additional menu items seeded');
    
    // Seed comprehensive customer data (30+ customers)
    console.log('👥 Seeding comprehensive customer data (30+ customers)...');
    const { Customer } = require('../models');
    const customers = [];
    const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Kavita', 'Ramesh', 'Anita', 'Suresh', 'Pooja', 'Rahul', 'Deepika', 'Mohit', 'Neha', 'Arjun', 'Sneha', 'Karan', 'Meera', 'Aditya', 'Shreya', 'Varun', 'Anjali', 'Rohit', 'Divya', 'Nikhil', 'Pooja', 'Siddharth', 'Kritika', 'Yash', 'Isha'];
    const lastNames = ['Kumar', 'Sharma', 'Patel', 'Reddy', 'Singh', 'Joshi', 'Gupta', 'Mehta', 'Yadav', 'Agarwal', 'Verma', 'Malhotra', 'Kapoor', 'Shah', 'Desai', 'Jain', 'Bansal', 'Chopra', 'Nair', 'Iyer', 'Menon', 'Pillai', 'Rao', 'Naidu', 'Gowda', 'Shetty', 'Pai', 'Bhat', 'Rao', 'Kulkarni'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
    const areas = ['MG Road', 'Bandra West', 'Andheri East', 'Powai', 'Goregaon', 'Malad West', 'Borivali East', 'Kandivali West', 'Chembur', 'Vashi'];
    
    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const city = cities[i % cities.length];
      const area = areas[i % areas.length];
      const year = 1985 + (i % 15);
      const month = (i % 12) + 1;
      const day = (i % 28) + 1;
      
      customers.push({
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        phone: `+919876543${String(i + 1).padStart(3, '0')}`,
        address: `${100 + i} ${area}, ${city}`,
        dateOfBirth: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      });
    }
    await Customer.bulkCreate(customers);
    console.log('✅ Customers seeded (30 customers)');
    
    // Seed comprehensive orders (50+ orders)
    console.log('📋 Seeding comprehensive orders (50+ orders)...');
    const { Order, OrderItem } = require('../models');
    const menuItems = await MenuItem.findAll();
    const orders = [];
    const orderItems = [];
    const statuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
    const orderTypes = ['dine-in', 'takeaway', 'delivery'];
    
    for (let i = 0; i < 50; i++) {
      const customerId = (i % 30) + 1;
      const status = statuses[i % statuses.length];
      const tableNum = `T-${String((i % 20) + 1).padStart(2, '0')}`;
      const daysAgo = i % 30;
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(10 + (i % 12), (i % 60), 0, 0);
      
      const order = await Order.create({
        customerId,
        tableNumber: tableNum,
        status,
        total: 0, // Will calculate
        createdAt,
        updatedAt: createdAt
      });
      
      // Add 2-5 items per order
      const numItems = 2 + (i % 4);
      let orderTotal = 0;
      const usedMenuItemIds = new Set(); // Track used menu items to avoid duplicates
      
      for (let j = 0; j < numItems; j++) {
        let menuItem;
        let attempts = 0;
        // Ensure we don't add the same menu item twice to the same order
        do {
          menuItem = menuItems[Math.floor(Math.random() * menuItems.length)];
          attempts++;
          if (attempts > 50) break; // Safety break
        } while (usedMenuItemIds.has(menuItem.id));
        
        if (attempts > 50) break; // If we can't find a unique item, skip
        
        usedMenuItemIds.add(menuItem.id);
        const qty = 1 + (j % 3);
        const price = menuItem.price * qty;
        orderTotal += price;
        
        orderItems.push({
          orderId: order.id,
          menuItemId: menuItem.id,
          quantity: qty,
          price: menuItem.price
        });
      }
      
      // Update order total
      await order.update({ total: orderTotal });
      orders.push(order);
    }
    
    await OrderItem.bulkCreate(orderItems);
    console.log('✅ Orders seeded (50 orders with items)');
    
    // Seed comprehensive reviews (50+ reviews)
    console.log('⭐ Seeding comprehensive reviews (50+ reviews)...');
    const { Review } = require('../models');
    const completedOrders = await Order.findAll({ where: { status: ['COMPLETED', 'DELIVERED'] }, limit: 50 });
    const reviews = [];
    
    for (let i = 0; i < Math.min(50, completedOrders.length); i++) {
      const order = completedOrders[i];
      const rating = 3 + Math.floor(Math.random() * 3); // 3-5 stars
      const foodRating = rating;
      const serviceRating = rating + (Math.random() > 0.7 ? -1 : 0);
      const ambianceRating = rating + (Math.random() > 0.8 ? -1 : 0);
      
      const comments = [
        'Excellent food! Will definitely come back.',
        'Good food and quick service.',
        'Amazing experience! The staff was very friendly.',
        'Great food quality and reasonable prices.',
        'Perfect for family dining.',
        'Food was okay but service was slow.',
        'Good value for money.',
        'Celebrated my birthday here and it was perfect!',
        'Quick and tasty lunch.',
        'Professional service and excellent food.',
        'Outstanding dinner experience.',
        'Good food but had to wait a bit longer.',
        'Excellent quality and presentation.',
        'Great weekend special menu.',
        'The biryani was perfectly cooked and very flavorful.',
        'The curry was delicious but could be a bit spicier.',
        'The dessert was particularly good.',
        'Kids loved the food and the portion sizes were generous.',
        'The place was quite crowded.',
        'The takeaway packaging was excellent.',
        'The staff made it special.',
        'The place is clean and well-maintained.',
        'Perfect for business meetings.',
        'The chef really knows how to balance flavors.',
        'Highly recommended!'
      ];
      
      reviews.push({
        customerId: order.customerId,
        orderId: order.id,
        rating,
        comment: comments[i % comments.length],
        foodRating: Math.max(1, Math.min(5, foodRating)),
        serviceRating: Math.max(1, Math.min(5, serviceRating)),
        ambianceRating: Math.max(1, Math.min(5, ambianceRating)),
        isVerified: Math.random() > 0.3,
        createdAt: order.createdAt,
        updatedAt: order.createdAt
      });
    }
    
    await Review.bulkCreate(reviews);
    console.log('✅ Reviews seeded (50+ reviews)');
    
    // Seed comprehensive payment data (30+ payments)
    console.log('💳 Seeding comprehensive payment data (30+ payments)...');
    const { Payment } = require('../models');
    const paidOrders = await Order.findAll({ where: { status: ['COMPLETED', 'DELIVERED'] }, limit: 30 });
    const payments = [];
    const paymentMethods = ['cash', 'card', 'upi', 'wallet'];
    const paymentStatuses = ['completed', 'pending', 'failed'];
    
    for (let i = 0; i < Math.min(30, paidOrders.length); i++) {
      const order = paidOrders[i];
      const method = paymentMethods[i % paymentMethods.length];
      const status = paymentStatuses[i % paymentStatuses.length] === 'failed' && Math.random() > 0.9 ? 'failed' : 'completed';
      
      payments.push({
        orderId: order.id,
        amount: order.total,
        paymentMethod: method,
        status,
        transactionId: `TXN${String(i + 1).padStart(5, '0')}`,
        notes: method === 'cash' ? 'Cash payment received' : method === 'card' ? 'Card payment processed' : method === 'upi' ? 'UPI payment successful' : 'Wallet payment',
        createdAt: order.createdAt,
        updatedAt: order.createdAt
      });
    }
    
    await Payment.bulkCreate(payments);
    console.log('✅ Payment data seeded (30+ payments)');
    
    console.log('🎉 ENHANCED comprehensive seeding completed successfully!');
    console.log('📊 Final Summary:');
    console.log('   - Admin user created (username: admin, password: admin123)');
    console.log('   - Menu items: 175+ dishes across all categories');
    console.log('   - Staff members: 50+ employees across all roles');
    console.log('   - Inventory items: 150+ items with full details');
    console.log('   - Customers: 30 customers with complete profiles');
    console.log('   - Orders: 50 orders with detailed order items');
    console.log('   - Reviews: 50+ customer reviews with ratings');
    console.log('   - Payments: 30+ payment records with various methods');
    console.log('   - All data tables exported to markdown files');
    
  } catch (error) {
    console.error('❌ Error during enhanced comprehensive seeding:', error);
    console.error(error.stack);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

if (require.main === module) {
  seedComprehensiveEnhanced();
}

module.exports = { seedComprehensiveEnhanced };

