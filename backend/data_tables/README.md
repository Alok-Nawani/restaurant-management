# 📊 Database Tables Overview

This document provides an overview of all database tables in the Hotel Management System. Each table is automatically updated whenever data changes (create, update, delete operations).

## 🔄 Automatic Updates

All tables are automatically updated in real-time using Sequelize hooks:
- **afterCreate**: When new records are added
- **afterUpdate**: When existing records are modified  
- **afterDestroy**: When records are deleted

## 📋 Available Tables

### 1. **authenticate.md** - User Authentication
- Contains admin and user login credentials
- Fields: id, username, password (hashed), name, role, timestamps

### 2. **customers.md** - Customer Information
- Customer profiles and contact details
- Fields: id, name, email, phone, address, timestamps

### 3. **menu.md** - Menu Items
- Complete restaurant menu with 118+ dishes
- Fields: id, name, price, category, description, available, timestamps
- Categories: Appetizer, Beverage, Bread, Pizza, Rice, Curry, Vegetable, Dessert, Snack, Side, Dal

### 4. **orders.md** - Order Management
- Customer orders with detailed information
- Fields: id, tableNumber, status, total, customer info, items list, timestamps
- Status: PENDING, CONFIRMED, PREPARING, READY, DELIVERED, PAID, CANCELLED

### 5. **order_items.md** - Order Details
- Individual items within each order
- Fields: id, orderId, orderTable, menuItem, quantity, price, total, timestamps
- Links orders to specific menu items with quantities

### 6. **payments.md** - Payment Records
- Payment transactions and methods
- Fields: id, orderId, orderInfo, amount, method, status, timestamps
- Methods: cash, card, upi, netbanking

### 7. **reviews.md** - Customer Reviews
- Customer feedback and ratings
- Fields: id, customer, order, rating, comment, timestamps
- Ratings: 1-5 stars with detailed comments

### 8. **staff.md** - Staff Management
- Employee information and roles
- Fields: id, name, email, phone, position, department, salary, hireDate, timestamps
- Roles: Chef, Cook, Waiter, Manager, Cashier, Cleaner, Security

### 9. **inventory.md** - Inventory Management
- Stock management and supplies
- Fields: id, name, category, currentStock, minimumStock, unit, supplier, price, timestamps
- Categories: Furniture, Kitchen Equipment, Food Supplies, Cleaning Supplies, Utensils, Electronics, Decorations, Maintenance

## 🎯 Key Features

### **Real-time Updates**
- Tables update automatically when data changes
- Timestamps show last update time
- Record counts are maintained

### **Rich Data Relationships**
- Orders show customer names and email
- Order items show menu item names and prices
- Payments show order details and table numbers
- Reviews show customer and order information

### **Comprehensive Coverage**
- All major restaurant operations covered
- From customer orders to staff management
- Complete payment and review tracking

## 📈 Usage

These markdown files serve as:
- **Documentation**: Clear view of all data
- **Backup**: Human-readable data format
- **Monitoring**: Track data changes over time
- **Reporting**: Easy to share and analyze

## 🔧 Technical Details

- **Format**: Markdown tables with proper headers
- **Updates**: Automatic via Sequelize hooks
- **Location**: `backend/data_tables/`
- **Encoding**: UTF-8
- **Refresh**: Real-time on data changes

---

*Last Updated: ${new Date().toLocaleString()}*
*Total Tables: 9*
*System Status: ✅ Active*
