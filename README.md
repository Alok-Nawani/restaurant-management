# Hotel Management System

A modern, full-stack hotel management system built with React and Node.js. This system provides comprehensive order management, customer tracking, and menu management capabilities for restaurants and hotels.

## 🚀 Features

### Backend Features
- **RESTful API** with Express.js
- **JWT Authentication** with role-based access control
- **SQLite Database** with Sequelize ORM
- **Input Validation** using express-validator
- **Error Handling** with comprehensive error middleware
- **Security Headers** and CORS configuration
- **Order Management** with status tracking
- **Customer Management** system
- **Menu Management** with categories
- **Payment Tracking** integration

### Frontend Features
- **Modern React UI** with Tailwind CSS
- **Responsive Design** for all screen sizes
- **Real-time Updates** with loading states
- **Toast Notifications** for user feedback
- **Order Status Management** with visual indicators
- **Interactive Order Form** with quantity controls
- **Dashboard Analytics** with key metrics
- **Customer Selection** for orders
- **Menu Browsing** with categories

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite Database
- JWT Authentication
- bcryptjs for password hashing
- express-validator for input validation

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- React Hot Toast
- Axios for API calls
- Vite for build tooling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file with your configuration:
```env
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your-super-secret-jwt-key-here
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Seed the database:
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

The backend will be available at `http://localhost:4000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update the `.env` file:
```env
VITE_API_URL=http://localhost:4000/api
```

5. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 💾 Direct SQL from Terminal (SQLite)

You can add/update data directly using SQLite CLI and see it reflected in the frontend (the backend reads from the same `backend/database.sqlite`).

### Open the database
```bash
# From repo root
sqlite3 "backend/database.sqlite"
```

If the file doesn’t exist yet, start the backend once to create it or run the seed: `cd backend && npm run seed`.

### Useful tables and columns
- Customers: `Customers(id, name, phone, email, loyaltyPoints)`
- Menu items: `MenuItems(id, name, description, price, category, isVeg, available)`
- Orders: `Orders(id, customerId, status, ... )`
- Order items: `OrderItems(id, orderId, menuItemId, quantity, price)`
- Payments: `Payments(id, orderId, amount, method, status)`
- Users (for login): `Users(id, username, password, name, role)`

Note: SQLite stores booleans as integers (`0`/`1`).

### Example inserts
```sql
-- Inside sqlite3 prompt
-- Add a customer
INSERT INTO Customers (name, phone, email, loyaltyPoints)
VALUES ('Neha', '9999990009', 'neha@example.com', 0);

-- Add a menu item
INSERT INTO MenuItems (name, description, price, category, isVeg, available)
VALUES ('Pasta Arrabbiata', 'Spicy tomato pasta', 220.0, 'Pasta', 1, 1);

-- Verify
SELECT * FROM Customers ORDER BY id DESC LIMIT 3;
SELECT id, name, price FROM MenuItems ORDER BY id DESC LIMIT 3;
```

Changes appear in the frontend as soon as the UI fetches again (navigate or refresh). Ensure the backend is running and the frontend is pointed to `VITE_API_URL=http://localhost:4000/api`.

### Tips
- Keep the backend running while editing; SQLite handles concurrent access (writes are short, exclusive transactions).
- To inspect schema quickly: `\.schema Customers` and `\.tables` inside sqlite3.
- To exit sqlite3: `\.quit`

### Troubleshooting
- If you see `Cannot find module 'wkx'` during `npm install`/seed:
	```bash
	cd backend
	rm -rf node_modules package-lock.json
	npm install
	```
	Then re-seed: `npm run seed`.
 

## 🔐 Default Credentials

After seeding the database, you can login with:
- **Username:** admin
- **Password:** admin123
- **Role:** admin

## 📱 Usage

### Dashboard
- View key metrics including total orders, pending orders, revenue, and menu items
- Monitor recent orders with status indicators
- Quick access to all system features

### Order Management
- Create new orders with table numbers and customer selection
- Add menu items with quantity controls
- Track order status through the workflow: Pending → Confirmed → Preparing → Ready → Delivered
- Filter orders by status
- Cancel pending orders

### Menu Management
- View all available menu items
- Add new menu items with categories and pricing
- Organize items by categories

### Customer Management
- View customer information
- Add new customers
- Link customers to orders

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Orders
- `GET /api/orders` - Get all orders (with pagination and filtering)
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create new menu item

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer

## 🏗️ Project Structure

```
hotel management/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── error.js
│   ├── models/
│   │   ├── customer.js
│   │   ├── menuItem.js
│   │   ├── order.js
│   │   ├── orderItem.js
│   │   ├── payment.js
│   │   ├── user.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── customers.js
│   │   ├── menu.js
│   │   ├── orders.js
│   │   └── payments.js
│   ├── seeders/
│   │   └── seed.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── OrderForm.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Menu.jsx
│   │   │   ├── Customers.jsx
│   │   │   └── Reports.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- Role-based access control

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment
2. Use a production database (PostgreSQL recommended)
3. Set a strong JWT_SECRET
4. Configure proper CORS origins
5. Use a process manager like PM2

### Frontend Deployment
1. Build the production bundle:
```bash
npm run build
```
2. Deploy the `dist` folder to your hosting service
3. Update the API URL in environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue in the repository.

## 🔄 Recent Improvements

- Enhanced error handling and user feedback
- Improved UI/UX with modern design
- Added comprehensive input validation
- Implemented proper authentication flow
- Added order status management
- Enhanced dashboard with analytics
- Improved responsive design
- Added loading states and toast notifications
- Enhanced security with proper headers and CORS
- Added comprehensive documentation
# Hotel-Management2
