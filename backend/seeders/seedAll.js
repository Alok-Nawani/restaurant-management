const { sequelize } = require('../models');
const { seedStaff } = require('./seedStaff');
const { seedAdditionalStaff } = require('./seedAdditionalStaff');
const { seedInventory } = require('./seedInventory');
const { seedAdditionalInventory } = require('./seedAdditionalInventory');
const { seedSampleData } = require('./seedSampleData');
const bcrypt = require('bcryptjs');

async function seedAll() {
  try {
    console.log('🌱 Starting comprehensive database seeding...');
    
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
    
    // Seed menu items first (needed for orders)
    console.log('🍽️ Seeding menu items...');
    const { MenuItem } = require('../models');
    await MenuItem.bulkCreate([
      { name: 'Margherita Pizza', price: 250, category: 'Pizza', description: 'Classic tomato and mozzarella pizza' },
      { name: 'Veg Biryani', price: 180, category: 'Rice', description: 'Aromatic basmati rice with mixed vegetables' },
      { name: 'Cold Coffee', price: 80, category: 'Beverage', description: 'Iced coffee with milk and sugar' },
      { name: 'Chicken Curry', price: 200, category: 'Curry', description: 'Spicy chicken curry with onions and tomatoes' },
      { name: 'Dal Makhani', price: 150, category: 'Dal', description: 'Creamy black lentils with butter' },
      { name: 'Butter Naan', price: 30, category: 'Bread', description: 'Soft leavened bread with butter' },
      { name: 'Raita', price: 50, category: 'Side', description: 'Yogurt with cucumber and spices' },
      { name: 'Gulab Jamun', price: 60, category: 'Dessert', description: 'Sweet milk dumplings in syrup' },
      { name: 'Mango Lassi', price: 70, category: 'Beverage', description: 'Sweet yogurt drink with mango' },
      { name: 'Samosa', price: 25, category: 'Snack', description: 'Fried pastry with spiced potato filling' },
      { name: 'Paneer Tikka', price: 120, category: 'Appetizer', description: 'Grilled cottage cheese with spices' },
      { name: 'Chicken Tikka', price: 140, category: 'Appetizer', description: 'Grilled chicken with spices' },
      { name: 'Fish Curry', price: 180, category: 'Curry', description: 'Spicy fish curry with coconut milk' },
      { name: 'Vegetable Pulao', price: 160, category: 'Rice', description: 'Fragrant rice with mixed vegetables' },
      { name: 'Chicken Biryani', price: 220, category: 'Rice', description: 'Aromatic rice with spiced chicken' },
      { name: 'Mutton Curry', price: 250, category: 'Curry', description: 'Rich mutton curry with spices' },
      { name: 'Aloo Gobi', price: 100, category: 'Vegetable', description: 'Potato and cauliflower curry' },
      { name: 'Palak Paneer', price: 130, category: 'Vegetable', description: 'Cottage cheese in spinach gravy' },
      { name: 'Chana Masala', price: 110, category: 'Curry', description: 'Spiced chickpea curry' },
      { name: 'Rajma', price: 120, category: 'Dal', description: 'Kidney bean curry' },
      { name: 'Jeera Rice', price: 80, category: 'Rice', description: 'Cumin flavored basmati rice' },
      { name: 'Chicken Korma', price: 200, category: 'Curry', description: 'Mild chicken curry with cream' },
      { name: 'Tandoori Roti', price: 20, category: 'Bread', description: 'Whole wheat bread cooked in tandoor' },
      { name: 'Garlic Naan', price: 40, category: 'Bread', description: 'Leavened bread with garlic and herbs' },
      { name: 'Onion Kulcha', price: 35, category: 'Bread', description: 'Stuffed bread with onions' },
      { name: 'Papad', price: 15, category: 'Side', description: 'Crispy lentil wafers' },
      { name: 'Pickle', price: 20, category: 'Side', description: 'Spicy mixed vegetable pickle' },
      { name: 'Chutney', price: 25, category: 'Side', description: 'Mint and coriander chutney' },
      { name: 'Masala Chai', price: 30, category: 'Beverage', description: 'Spiced tea with milk' },
      { name: 'Fresh Lime Soda', price: 40, category: 'Beverage', description: 'Refreshing lime drink' },
      { name: 'Thums Up', price: 35, category: 'Beverage', description: 'Cola soft drink' },
      { name: 'Sprite', price: 35, category: 'Beverage', description: 'Lemon-lime soft drink' },
      { name: 'Mineral Water', price: 20, category: 'Beverage', description: 'Bottled mineral water' },
      // Additional Dal Dishes
      { name: 'Dal Tadka', price: 90, category: 'Dal', description: 'Tempered yellow lentils' },
      { name: 'Dal Makhani', price: 120, category: 'Dal', description: 'Creamy black lentils' },
      { name: 'Chana Dal', price: 85, category: 'Dal', description: 'Split chickpea lentils' },
      { name: 'Moong Dal', price: 80, category: 'Dal', description: 'Yellow split lentils' },
      { name: 'Masoor Dal', price: 75, category: 'Dal', description: 'Red lentils curry' },
      { name: 'Dal Fry', price: 95, category: 'Dal', description: 'Fried lentil curry' },
      { name: 'Dal Palak', price: 100, category: 'Dal', description: 'Lentils with spinach' },
      { name: 'Tarka Dal', price: 88, category: 'Dal', description: 'Spiced lentil curry' },
      // Additional Vegetable Dishes
      { name: 'Baingan Bharta', price: 110, category: 'Vegetable', description: 'Roasted eggplant curry' },
      { name: 'Gobi Manchurian', price: 120, category: 'Vegetable', description: 'Cauliflower in Chinese sauce' },
      { name: 'Mushroom Masala', price: 130, category: 'Vegetable', description: 'Mushroom curry' },
      { name: 'Bhindi Masala', price: 100, category: 'Vegetable', description: 'Okra curry' },
      { name: 'Kadai Paneer', price: 140, category: 'Vegetable', description: 'Cottage cheese in kadai style' },
      { name: 'Methi Malai Paneer', price: 150, category: 'Vegetable', description: 'Paneer with fenugreek' },
      { name: 'Aloo Jeera', price: 85, category: 'Vegetable', description: 'Cumin potatoes' },
      { name: 'Mix Vegetable', price: 95, category: 'Vegetable', description: 'Mixed vegetable curry' },
      // Additional Rice Dishes
      { name: 'Biryani Rice', price: 120, category: 'Rice', description: 'Fragrant basmati rice' },
      { name: 'Lemon Rice', price: 70, category: 'Rice', description: 'Tangy lemon flavored rice' },
      { name: 'Coconut Rice', price: 75, category: 'Rice', description: 'Coconut flavored rice' },
      { name: 'Tomato Rice', price: 80, category: 'Rice', description: 'Tomato flavored rice' },
      { name: 'Vegetable Pulao', price: 100, category: 'Rice', description: 'Mixed vegetable rice' },
      { name: 'Chicken Pulao', price: 150, category: 'Rice', description: 'Chicken flavored rice' },
      { name: 'Mutton Pulao', price: 180, category: 'Rice', description: 'Mutton flavored rice' },
      // Additional Curry Dishes
      { name: 'Butter Chicken', price: 200, category: 'Curry', description: 'Creamy tomato chicken curry' },
      { name: 'Chicken Tikka Masala', price: 190, category: 'Curry', description: 'Spiced chicken curry' },
      { name: 'Mutton Curry', price: 220, category: 'Curry', description: 'Spiced mutton curry' },
      { name: 'Fish Curry', price: 180, category: 'Curry', description: 'Spicy fish curry' },
      { name: 'Prawn Curry', price: 200, category: 'Curry', description: 'Spicy prawn curry' },
      { name: 'Egg Curry', price: 120, category: 'Curry', description: 'Boiled eggs in curry' },
      { name: 'Malai Kofta', price: 160, category: 'Curry', description: 'Cottage cheese balls in cream' },
      { name: 'Navratan Korma', price: 170, category: 'Curry', description: 'Nine gem vegetable curry' },
      // Additional Bread Items
      { name: 'Rumali Roti', price: 25, category: 'Bread', description: 'Thin handkerchief bread' },
      { name: 'Missi Roti', price: 30, category: 'Bread', description: 'Spiced gram flour bread' },
      { name: 'Bhatura', price: 35, category: 'Bread', description: 'Deep fried leavened bread' },
      { name: 'Poori', price: 25, category: 'Bread', description: 'Deep fried wheat bread' },
      { name: 'Chapati', price: 15, category: 'Bread', description: 'Whole wheat flatbread' },
      { name: 'Phulka', price: 18, category: 'Bread', description: 'Puffed wheat bread' },
      // Additional Snacks
      { name: 'Vada Pav', price: 40, category: 'Snack', description: 'Potato fritter in bread' },
      { name: 'Samosa', price: 25, category: 'Snack', description: 'Fried pastry with potato filling' },
      { name: 'Dhokla', price: 50, category: 'Snack', description: 'Steamed gram flour cake' },
      { name: 'Idli Sambar', price: 60, category: 'Snack', description: 'Steamed rice cakes with lentil soup' },
      { name: 'Dosa', price: 70, category: 'Snack', description: 'Crispy rice crepe' },
      { name: 'Uttapam', price: 65, category: 'Snack', description: 'Thick rice pancake' },
      { name: 'Medu Vada', price: 45, category: 'Snack', description: 'Fried lentil donuts' },
      { name: 'Ragda Pattice', price: 55, category: 'Snack', description: 'Potato patties with spicy peas' },
      // Additional Beverages
      { name: 'Lassi', price: 50, category: 'Beverage', description: 'Sweet yogurt drink' },
      { name: 'Mango Lassi', price: 60, category: 'Beverage', description: 'Mango flavored yogurt drink' },
      { name: 'Rose Lassi', price: 55, category: 'Beverage', description: 'Rose flavored yogurt drink' },
      { name: 'Badam Milk', price: 70, category: 'Beverage', description: 'Almond milk' },
      { name: 'Kesar Milk', price: 65, category: 'Beverage', description: 'Saffron milk' },
      { name: 'Hot Chocolate', price: 80, category: 'Beverage', description: 'Rich hot chocolate drink' },
      { name: 'Green Tea', price: 40, category: 'Beverage', description: 'Healthy green tea' },
      { name: 'Herbal Tea', price: 45, category: 'Beverage', description: 'Aromatic herbal tea' },
      // Additional Desserts
      { name: 'Gulab Jamun', price: 60, category: 'Dessert', description: 'Sweet milk dumplings' },
      { name: 'Rasgulla', price: 55, category: 'Dessert', description: 'Spongy cheese balls in syrup' },
      { name: 'Barfi', price: 50, category: 'Dessert', description: 'Sweet milk fudge' },
      { name: 'Ladoo', price: 45, category: 'Dessert', description: 'Sweet gram flour balls' },
      { name: 'Halwa', price: 65, category: 'Dessert', description: 'Sweet semolina pudding' },
      { name: 'Phirni', price: 70, category: 'Dessert', description: 'Rice pudding dessert' },
      { name: 'Rabri', price: 75, category: 'Dessert', description: 'Thickened milk dessert' },
      { name: 'Kulfi Falooda', price: 80, category: 'Dessert', description: 'Ice cream with vermicelli' },
      { name: 'Fresh Juice', price: 60, category: 'Beverage', description: 'Fresh seasonal fruit juice' },
      { name: 'Ice Cream', price: 50, category: 'Dessert', description: 'Vanilla ice cream' },
      { name: 'Kulfi', price: 45, category: 'Dessert', description: 'Traditional Indian ice cream' },
      { name: 'Ras Malai', price: 70, category: 'Dessert', description: 'Sweet cottage cheese in milk' },
      { name: 'Kheer', price: 55, category: 'Dessert', description: 'Rice pudding with nuts' },
      { name: 'Jalebi', price: 40, category: 'Dessert', description: 'Sweet fried pretzel' },
      { name: 'Kachori', price: 30, category: 'Snack', description: 'Fried pastry with lentil filling' },
      { name: 'Pakora', price: 35, category: 'Snack', description: 'Fried vegetable fritters' },
      { name: 'Bhel Puri', price: 45, category: 'Snack', description: 'Puffed rice with chutneys' },
      { name: 'Pani Puri', price: 50, category: 'Snack', description: 'Hollow puris with spiced water' },
      { name: 'Dahi Vada', price: 40, category: 'Snack', description: 'Lentil dumplings in yogurt' },
      { name: 'Aloo Tikki', price: 35, category: 'Snack', description: 'Spiced potato patties' },
      { name: 'Chicken Roll', price: 80, category: 'Snack', description: 'Chicken wrapped in paratha' },
      { name: 'Egg Roll', price: 60, category: 'Snack', description: 'Egg wrapped in paratha' },
      { name: 'Veg Roll', price: 50, category: 'Snack', description: 'Vegetables wrapped in paratha' },
      { name: 'Chicken Sandwich', price: 90, category: 'Snack', description: 'Chicken sandwich with vegetables' },
      { name: 'Veg Sandwich', price: 70, category: 'Snack', description: 'Vegetable sandwich' },
      { name: 'Club Sandwich', price: 100, category: 'Snack', description: 'Multi-layer sandwich' },
      { name: 'French Fries', price: 60, category: 'Snack', description: 'Crispy potato fries' },
      { name: 'Onion Rings', price: 55, category: 'Snack', description: 'Battered and fried onion rings' },
      { name: 'Chicken Wings', price: 120, category: 'Appetizer', description: 'Spicy chicken wings' },
      { name: 'Fish Fingers', price: 100, category: 'Appetizer', description: 'Breaded fish strips' },
      { name: 'Spring Rolls', price: 80, category: 'Appetizer', description: 'Crispy vegetable spring rolls' },
      { name: 'Chicken Nuggets', price: 90, category: 'Appetizer', description: 'Breaded chicken pieces' }
    ]);
    console.log('✅ Menu items seeded');
    
    // Seed all other data
    await seedStaff();
    await seedAdditionalStaff();
    await seedInventory();
    await seedAdditionalInventory();
    await seedSampleData();
    
    console.log('🎉 All data seeded successfully!');
    console.log('📊 Summary:');
    console.log('   - Admin user created (username: admin, password: admin123)');
    console.log('   - Staff members: ~30+ employees');
    console.log('   - Inventory items: ~100+ items');
    console.log('   - Customers: 10+ customers');
    console.log('   - Orders: 15+ orders with items');
    console.log('   - Reviews: 15+ customer reviews');
    console.log('   - Menu items: 55+ dishes');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

seedAll();
