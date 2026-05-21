# ICON CYBER CAFE Backend - Setup & Testing Guide

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (local or Atlas)
- Postman or similar API testing tool

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update with your credentials:

```bash
cp .env.example .env
```

**Important `.env` variables:**

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/icon-cyber-cafe

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Google OAuth (optional but recommended)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Step 3: Start MongoDB

**For local MongoDB:**
```bash
# Windows
mongod

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**For MongoDB Atlas:**
- Create a cluster and get your connection string
- Update `MONGODB_URI` in `.env`

### Step 4: Start the Server

```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

You should see:
```
✓ MongoDB Connected
✓ Server running on port 5000
```

---

## 🧪 API Testing Guide

### Base URL
```
http://localhost:5000/api
```

### 1. Authentication APIs

#### Register New User
**POST** `/auth/register`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "userIdHere",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "jwtTokenHere"
  }
}
```

#### Login User
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Google OAuth Login
**POST** `/auth/google`

```json
{
  "token": "google_access_token_here"
}
```

#### Get Current User
**GET** `/auth/me`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Update Profile
**PUT** `/auth/profile`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Body:
```json
{
  "name": "Updated Name",
  "phone": "9876543210",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001",
    "country": "USA"
  }
}
```

#### Change Password
**PUT** `/auth/change-password`

Headers:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

Body:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

### 2. Service APIs

#### Get All Services
**GET** `/services`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` (document, typing, printing, scanning, website, forms)
- `search` (search in title and description)

#### Get Service by ID
**GET** `/services/:id`

#### Create Service (Admin Only)
**POST** `/services`

Headers:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

Body:
```json
{
  "title": "Income Certificate",
  "description": "Government approved income certificate service",
  "price": 500,
  "category": "document",
  "duration": {
    "value": 2,
    "unit": "hours"
  },
  "maxBookings": 10,
  "emiOptions": {
    "available": true,
    "months": [3, 6, 12]
  }
}
```

#### Update Service (Admin Only)
**PUT** `/services/:id`

#### Delete Service (Admin Only)
**DELETE** `/services/:id`

---

### 3. Booking APIs

#### Create Booking
**POST** `/bookings`

Headers:
```
Authorization: Bearer USER_JWT_TOKEN
```

Body:
```json
{
  "serviceId": "serviceIdHere",
  "bookingDate": "2024-12-25T10:00:00Z",
  "description": "Need urgent income certificate",
  "useEMI": false,
  "emiMonths": null
}
```

#### Get All Bookings
**GET** `/bookings`

Headers:
```
Authorization: Bearer JWT_TOKEN
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` (pending, confirmed, in-progress, completed, cancelled)

#### Get Booking by ID
**GET** `/bookings/:id`

#### Update Booking Status (Admin)
**PUT** `/bookings/:id/status`

Body:
```json
{
  "status": "confirmed"
}
```

#### Rate Booking
**PUT** `/bookings/:id/rate`

Body:
```json
{
  "score": 5,
  "comment": "Excellent service and fast delivery"
}
```

#### Cancel Booking
**PUT** `/bookings/:id/cancel`

#### Get Booking Stats
**GET** `/bookings/stats/dashboard`

---

### 4. Admin APIs

#### Get Dashboard Stats
**GET** `/admin/dashboard`

Headers:
```
Authorization: Bearer ADMIN_JWT_TOKEN
```

#### Get All Users
**GET** `/admin/users`

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `role` (user, worker, admin)
- `search` (search by name or email)

#### Update User
**PUT** `/admin/users/:id`

Body:
```json
{
  "name": "Updated Name",
  "role": "worker",
  "isActive": true,
  "phone": "9876543210"
}
```

#### Deactivate User
**PUT** `/admin/users/:id/deactivate`

#### Delete User
**DELETE** `/admin/users/:id`

#### Get All Payments
**GET** `/admin/payments`

#### Get Revenue Analytics
**GET** `/admin/analytics/revenue`

#### Get Booking Analytics
**GET** `/admin/analytics/bookings`

#### Assign Worker to Booking
**PUT** `/admin/bookings/:id/assign-worker`

Body:
```json
{
  "workerId": "workerUserId"
}
```

---

## 📊 Database Models

### User Model
- `name` (String) - User's full name
- `email` (String, Unique) - User's email
- `password` (String) - Hashed password
- `phone` (String) - Phone number
- `avatar` (String) - Avatar image URL
- `role` (Enum) - user, worker, admin
- `googleId` (String) - Google OAuth ID
- `isActive` (Boolean) - Account status
- `address` (Object) - Full address details
- `bookingHistory` (Array) - Booking references
- `totalBookings` (Number) - Total bookings count
- `averageRating` (Number) - User's average rating

### Service Model
- `title` (String) - Service name
- `description` (String) - Service description
- `price` (Number) - Service price
- `duration` (Object) - Duration (value + unit)
- `image` (String) - Service image URL
- `category` (Enum) - Service category
- `isActive` (Boolean) - Active status
- `availability` (Boolean) - Available for booking
- `maxBookings` (Number) - Max concurrent bookings
- `currentBookings` (Number) - Current bookings count
- `emiOptions` (Object) - EMI configuration
- `ratings` (Number) - Average rating
- `reviewCount` (Number) - Number of reviews

### Booking Model
- `user` (ObjectId) - Reference to User
- `service` (ObjectId) - Reference to Service
- `worker` (ObjectId) - Assigned worker (optional)
- `status` (Enum) - pending, confirmed, in-progress, completed, cancelled
- `bookingDate` (Date) - Booking date and time
- `completionDate` (Date) - Completion date (optional)
- `amount` (Number) - Booking amount
- `paymentStatus` (Enum) - Payment status
- `paymentMethod` (Enum) - Payment method used
- `paymentId` (String) - Payment gateway transaction ID
- `emiDetails` (Object) - EMI payment details
- `description` (String) - Booking description
- `rating` (Object) - User rating and review
- `documents` (Array) - Uploaded documents

### Payment Model
- `user` (ObjectId) - Reference to User
- `booking` (ObjectId) - Reference to Booking
- `amount` (Number) - Payment amount
- `paymentMethod` (Enum) - Payment method
- `paymentGateway` (Enum) - razorpay or stripe
- `transactionId` (String, Unique) - Transaction ID
- `status` (Enum) - pending, captured, failed, refunded
- `emiDetails` (Object) - EMI details if applicable
- `refund` (Object) - Refund information

---

## ✅ Testing Checklist

### 1. Authentication Testing
- [ ] Register new user
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Get current user profile
- [ ] Update user profile
- [ ] Change password

### 2. Service Testing
- [ ] Get all services (public)
- [ ] Get service by ID
- [ ] Create service (admin)
- [ ] Update service (admin)
- [ ] Delete service (admin)
- [ ] Filter services by category
- [ ] Search services

### 3. Booking Testing
- [ ] Create new booking
- [ ] Get all user bookings
- [ ] Get booking by ID
- [ ] Update booking status
- [ ] Rate completed booking
- [ ] Cancel booking
- [ ] Check booking statistics

### 4. Admin Testing
- [ ] View dashboard stats
- [ ] View all users
- [ ] Update user details
- [ ] Deactivate user account
- [ ] View payment history
- [ ] View revenue analytics
- [ ] View booking analytics
- [ ] Assign worker to booking

---

## 🔒 Security Checklist

- ✅ JWT authentication for protected routes
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (RBAC)
- ✅ Input validation
- ✅ CORS configuration
- ✅ Error handling and logging
- ✅ Environment variable protection
- ✅ MongoDB injection prevention

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Solution: Ensure MongoDB is running and MONGODB_URI is correct
```

### JWT Token Expired
```
Solution: Login again to get a new token. Token expires in 7 days (configurable)
```

### CORS Error
```
Solution: Ensure FRONTEND_URL in .env matches your React app's URL
```

### File Upload Issues
```
Solution: Check file size limit (default 50MB) and temp directory permissions
```

---

## 📱 Frontend Integration

The backend is configured to work with React frontend at `http://localhost:5173`

### Important Headers for Requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Response Format:
All API responses follow this structure:
```json
{
  "success": true/false,
  "message": "Success or error message",
  "data": {}
}
```

---

## 📝 Notes

- Change `JWT_SECRET` in production
- Update `FRONTEND_URL` for production domain
- Implement rate limiting for production
- Add email verification for production
- Configure proper error logging
- Set up database backups

---

## 📞 Support

For issues or questions, contact the development team.

Happy Coding! 🚀
