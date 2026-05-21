# ICON CYBER CAFE - Backend Server

A comprehensive backend system for the ICON CYBER CAFE platform built with **Express.js**, **MongoDB**, and **Node.js** (MERN Stack).

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Server](#running-the-server)
- [API Endpoints](#api-endpoints)
- [Database Models](#database-models)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)

---

## ✨ Features

### Core Features
- ✅ **User Authentication** - Registration, Login, Google OAuth
- ✅ **Role-Based Access Control** - User, Worker, Admin roles
- ✅ **Service Management** - Create, Read, Update, Delete services
- ✅ **Booking System** - Book services with status tracking
- ✅ **Payment Integration** - Razorpay payment gateway with EMI support
- ✅ **Task Management** - Create and manage tasks
- ✅ **Admin Dashboard** - Comprehensive statistics and analytics
- ✅ **Worker Management** - Assign workers to bookings
- ✅ **Rating & Reviews** - User can rate completed bookings
- ✅ **EMI Options** - Flexible payment plans

### Security Features
- 🔒 JWT Authentication
- 🔒 Password Hashing (bcryptjs)
- 🔒 CORS Configuration
- 🔒 Input Validation
- 🔒 Error Handling

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | v16+ | Runtime |
| Express.js | v4.18+ | Web Framework |
| MongoDB | Latest | Database |
| Mongoose | v8.0+ | ODM |
| JWT | v9.1+ | Authentication |
| bcryptjs | v2.4+ | Password Hashing |
| Razorpay | v2.8+ | Payment Gateway |
| Axios | v1.6+ | HTTP Client |
| Cloudinary | v2.10+ | Image Upload |

---

## 📁 Project Structure

```
backend/
├── config/               # Configuration files
│   ├── db.js            # Database connection
│   └── cloudinary.js    # Cloudinary setup
├── controllers/          # Business logic
│   ├── authController.js
│   ├── serviceController.js
│   ├── bookingController.js
│   ├── taskController.js
│   ├── paymentController.js
│   └── adminController.js
├── middleware/           # Express middleware
│   ├── authMiddleware.js
│   └── adminMiddleware.js
├── models/              # MongoDB schemas
│   ├── User.js
│   ├── Service.js
│   ├── Booking.js
│   ├── Task.js
│   ├── Payment.js
│   └── Worker.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── serviceRoutes.js
│   ├── bookingRoutes.js
│   ├── taskRoutes.js
│   ├── paymentRoutes.js
│   ├── adminRoutes.js
│   ├── uploadRoutes.js
│   └── notificationRoutes.js
├── utils/               # Utility functions
│   └── generateToken.js
├── scripts/             # Helper scripts
│   └── seed.js         # Database seeding
├── tests/               # Testing documentation
│   └── API_TESTING_GUIDE.txt
├── .env                 # Environment variables
├── .env.example         # Example env variables
├── server.js            # Main server file
├── package.json         # Dependencies
└── README.md            # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas)

### Steps

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

5. **Start MongoDB**
```bash
# Local
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

6. **Run database seed (optional)**
```bash
npm run seed
```

---

## ⚙️ Configuration

Edit `.env` file with your credentials:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/icon-cyber-cafe

# JWT
JWT_SECRET=your_very_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Razorpay (Payment Gateway)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend
FRONTEND_URL=http://localhost:5173

# Cloudinary (Optional)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## ▶️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Expected Output
```
✓ MongoDB Connected
✓ Server running on port 5000
✓ Environment: development
```

---

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google` | Google OAuth login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/change-password` | Change password |

### Services
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get service by ID |
| POST | `/api/services` | Create service (Admin) |
| PUT | `/api/services/:id` | Update service (Admin) |
| DELETE | `/api/services/:id` | Delete service (Admin) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get user bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PUT | `/api/bookings/:id/status` | Update status (Admin) |
| PUT | `/api/bookings/:id/rate` | Rate booking |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | Get all tasks |
| GET | `/api/tasks/:id` | Get task details |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/razorpay` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/:id` | Get payment details |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/users` | Get all users |
| PUT | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/analytics/revenue` | Revenue analytics |
| GET | `/api/admin/analytics/bookings` | Booking analytics |

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  avatar: String,
  role: Enum ["user", "worker", "admin"],
  googleId: String,
  isActive: Boolean,
  address: Object,
  bookingHistory: [ObjectId],
  totalBookings: Number,
  averageRating: Number,
  timestamps: true
}
```

### Service Model
```javascript
{
  title: String,
  description: String,
  price: Number,
  duration: Object { value, unit },
  image: String,
  category: Enum [...],
  isActive: Boolean,
  maxBookings: Number,
  currentBookings: Number,
  emiOptions: Object,
  ratings: Number,
  reviewCount: Number,
  timestamps: true
}
```

### Booking Model
```javascript
{
  user: ObjectId,
  service: ObjectId,
  worker: ObjectId,
  status: Enum [...],
  bookingDate: Date,
  completionDate: Date,
  amount: Number,
  paymentStatus: Enum [...],
  paymentMethod: String,
  emiDetails: Object,
  rating: Object,
  timestamps: true
}
```

---

## 🔐 Authentication

### JWT Token
- Tokens are issued upon login/registration
- Include in header: `Authorization: Bearer YOUR_TOKEN`
- Token expires in 7 days (configurable)

### Password Security
- Passwords are hashed using bcryptjs (salt rounds: 10)
- Passwords are never returned in API responses
- Password changes require current password verification

---

## 🧪 Testing

### Run Database Seed
```bash
npm run seed
```

Creates test users and services:
- **Admin**: admin@icon-cyber-cafe.com / admin@123
- **User 1**: john@example.com / user@123
- **User 2**: jane@example.com / user@123
- **Worker**: worker@example.com / user@123

### Manual Testing
See `/tests/API_TESTING_GUIDE.txt` for detailed API testing instructions.

### Using Postman
1. Import API endpoints to Postman
2. Use token from login response
3. Test each endpoint with sample data
4. Check response status and data format

---

## 📊 API Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Requested data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "pages": 10,
    "currentPage": 1
  }
}
```

---

## 🚀 Deployment

### Prepare for Production
1. Update `NODE_ENV` to `production`
2. Change `JWT_SECRET` to a strong random value
3. Update `FRONTEND_URL` to production domain
4. Configure MongoDB Atlas connection string
5. Set up Razorpay production keys
6. Configure email service

### Deploy on Heroku
```bash
# Create Heroku app
heroku create app-name

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Deploy on AWS
1. Create EC2 instance
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies: `npm install`
5. Run: `npm start`
6. Configure reverse proxy with Nginx
7. Set up SSL certificate

---

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection | mongodb://localhost/db |
| JWT_SECRET | JWT signing key | secret_key |
| GOOGLE_CLIENT_ID | Google OAuth ID | xxx.apps.googleusercontent.com |
| RAZORPAY_KEY_ID | Razorpay API key | key_xxx |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify database exists (MongoDB creates automatically)

### Token Invalid
- Token may have expired
- Login again to get new token
- Check token format in header

---

## 📞 Support & Documentation

- **API Documentation**: See `BACKEND_SETUP_GUIDE.md`
- **Testing Guide**: See `/tests/API_TESTING_GUIDE.txt`
- **Issues**: Check console logs for error messages

---

## 📄 License

This project is proprietary and belongs to ICON CYBER CAFE.

---

## 👥 Team

Developed by ICON CYBER CAFE Development Team

---

## 🙏 Acknowledgments

- Express.js documentation
- MongoDB documentation
- Razorpay API documentation
- Community contributions

---

## 📈 Future Enhancements

- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Mobile app API
- [ ] WebSocket for real-time updates
- [ ] File upload to S3
- [ ] Rate limiting
- [ ] Advanced search filters
- [ ] Export data to PDF/Excel
- [ ] Multi-language support

---

**Last Updated**: December 2024

**Version**: 1.0.0

---

Happy Coding! 🚀
