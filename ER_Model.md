# Hotel Management System - Entity Relationship Model

## Database Overview
This document contains the Entity Relationship (ER) diagrams for the Hotel Management System database. The system uses SQLite as the database and Sequelize as the ORM.

## Table Structure and Relationships

### 1. Users Table
**Purpose**: Stores system users (admin, staff) for authentication and authorization.

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string password
        string role
        string name
        datetime createdAt
        datetime updatedAt
    }
```

### 2. Customers Table
**Purpose**: Stores customer information and loyalty points.

```mermaid
erDiagram
    Customer {
        int id PK
        string name
        string phone UK
        string email
        int loyaltyPoints
        datetime createdAt
        datetime updatedAt
    }
```

### 3. Staff Table
**Purpose**: Stores detailed staff information including roles, experience, and personal details.

```mermaid
erDiagram
    Staff {
        int id PK
        string name
        string email UK
        string phone
        enum role
        int experience
        decimal salary
        text address
        date dateOfBirth
        date dateOfJoining
        boolean isActive
        string emergencyContact
        string emergencyContactPhone
        json skills
        enum shift
        datetime createdAt
        datetime updatedAt
    }
```

### 4. Menu Items Table
**Purpose**: Stores menu items with pricing, categories, and availability.

```mermaid
erDiagram
    MenuItem {
        int id PK
        string name
        text description
        float price
        string category
        boolean isVeg
        boolean available
        datetime createdAt
        datetime updatedAt
    }
```

### 5. Orders Table
**Purpose**: Stores order information including table number, status, and total amount.

```mermaid
erDiagram
    Order {
        int id PK
        string tableNumber
        string status
        float total
        int customerId FK
        datetime createdAt
        datetime updatedAt
    }
```

### 6. Order Items Table
**Purpose**: Junction table storing individual items within orders with quantities and prices.

```mermaid
erDiagram
    OrderItem {
        int id PK
        int quantity
        float price
        int orderId FK
        int menuItemId FK
        datetime createdAt
        datetime updatedAt
    }
```

### 7. Payments Table
**Purpose**: Stores payment information for orders.

```mermaid
erDiagram
    Payment {
        int id PK
        string method
        float amount
        string status
        int orderId FK
        datetime createdAt
        datetime updatedAt
    }
```

### 8. Inventory Table
**Purpose**: Stores inventory items with stock levels, suppliers, and restocking information.

```mermaid
erDiagram
    Inventory {
        int id PK
        string name
        enum category
        string subcategory
        int currentStock
        int minimumStock
        int maximumStock
        string unit
        decimal unitPrice
        string supplier
        string supplierContact
        datetime lastRestocked
        datetime nextRestockDate
        string location
        text description
        boolean isActive
        boolean alertEnabled
        datetime createdAt
        datetime updatedAt
    }
```

### 9. Reviews Table
**Purpose**: Stores customer reviews and ratings for orders.

```mermaid
erDiagram
    Review {
        int id PK
        int customerId FK
        int orderId FK
        int rating
        text comment
        int foodRating
        int serviceRating
        int ambianceRating
        boolean isVerified
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
```

## Complete Entity Relationship Diagram

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string password
        string role
        string name
    }
    
    Customer {
        int id PK
        string name
        string phone UK
        string email
        int loyaltyPoints
    }
    
    Staff {
        int id PK
        string name
        string email UK
        string phone
        enum role
        int experience
        decimal salary
        boolean isActive
    }
    
    MenuItem {
        int id PK
        string name
        text description
        float price
        string category
        boolean isVeg
        boolean available
    }
    
    Order {
        int id PK
        string tableNumber
        string status
        float total
        int customerId FK
    }
    
    OrderItem {
        int id PK
        int quantity
        float price
        int orderId FK
        int menuItemId FK
    }
    
    Payment {
        int id PK
        string method
        float amount
        string status
        int orderId FK
    }
    
    Inventory {
        int id PK
        string name
        enum category
        int currentStock
        int minimumStock
        decimal unitPrice
        string supplier
        boolean isActive
    }
    
    Review {
        int id PK
        int customerId FK
        int orderId FK
        int rating
        text comment
        boolean isVerified
    }
    
    Customer ||--o{ Order : "places"
    Order ||--o{ OrderItem : "contains"
    OrderItem }o--|| MenuItem : "references"
    Order ||--o| Payment : "has"
    Customer ||--o{ Review : "writes"
    Order ||--o{ Review : "receives"
```

## Relationship Details

### One-to-Many Relationships:
1. **Customer → Orders**: One customer can place multiple orders
2. **Order → OrderItems**: One order can contain multiple order items
3. **Order → Payments**: One order can have one payment
4. **Customer → Reviews**: One customer can write multiple reviews
5. **Order → Reviews**: One order can receive multiple reviews

### Many-to-Many Relationships:
1. **Orders ↔ MenuItems**: Through OrderItems junction table
   - One order can contain multiple menu items
   - One menu item can be in multiple orders

### Key Constraints:
- **Primary Keys**: All tables have auto-incrementing integer primary keys
- **Foreign Keys**: Proper referential integrity maintained
- **Unique Constraints**: 
  - User.username
  - Customer.phone
  - Staff.email
- **Check Constraints**: 
  - Rating values (1-5)
  - Stock quantities (≥ 0)
  - Salary values (≥ 0)

## Database Features:
- **Timestamps**: All tables include createdAt and updatedAt fields
- **Soft Deletes**: Some tables use isActive flags for soft deletion
- **Data Validation**: Comprehensive validation rules for data integrity
- **Indexing**: Strategic indexes on frequently queried fields
- **JSON Fields**: Skills field in Staff table stores JSON data
- **Enum Types**: Restricted values for roles, categories, and statuses

## System Architecture:
- **Database**: SQLite (file-based)
- **ORM**: Sequelize.js
- **Backend**: Node.js with Express.js
- **Frontend**: React.js with Vite
- **Authentication**: JWT-based
- **API**: RESTful API design
