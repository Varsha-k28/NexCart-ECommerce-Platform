# NexCart — MERN Stack E-Commerce Application

A full-stack e-commerce web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). NexCart allows users to browse products, manage their cart, authenticate securely, and place orders with multiple payment options.

---

## Live Demo

- **Frontend:** https://nexcart-frontend.onrender.com
- **Backend API:** https://nexcart-api.onrender.com

---

## Features

### User Authentication
- Email & Password login with JWT
- Google OAuth login
- OTP-based forgot password via Gmail
- Persistent login using localStorage
- Secure password hashing with bcrypt

### Product Catalogue
- Live product data from DummyJSON public API
- Category filtering and search
- Price range filter and sort options
- Product detail page with image gallery
- Related products section

### Cart System
- User-specific cart stored in MongoDB
- Add, update quantity, remove items
- Cart persists across sessions
- Auto-loads on login, clears on logout

### Payment
- Razorpay integration (Cards, Net Banking, Wallets)
- Dummy UPI payment UI with QR code (demo mode)
- Cash on Delivery option
- Order saved to MongoDB after payment

### User Settings
- Edit profile (name, email, phone)
- Change password with strength meter
- View order history
- Account management

### UI/UX
- Fully responsive (mobile, tablet, desktop)
- Poppins font, clean modern design
- Toast notifications
- Skeleton loading states
- Smooth animations

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs, Google OAuth |
| Payment | Razorpay |
| Email | Nodemailer (Gmail) |
| Product Data | DummyJSON API |
| Deployment | Render (backend + frontend) |

---

## Project Structure

```
nexcart/
├── src/                        # React frontend
│   ├── components/
│   │   ├── Navbar/
│   │   ├── Footer/
│   │   ├── ProductCard/
│   │   ├── Toast/
│   │   ├── UPIModal/
│   │   └── GoogleLoginBtn.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── ToastContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Auth.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   └── Settings.jsx
│   └── services/
│       ├── api.js              # Backend API calls
│       └── dummyApi.js         # DummyJSON API calls
│
└── server/                     # Node.js backend
    ├── controllers/
    │   ├── authController.js
    │   ├── cartController.js
    │   ├── orderController.js
    │   ├── productController.js
    │   └── paymentController.js
    ├── models/
    │   ├── User.js
    │   ├── Cart.js
    │   ├── Order.js
    │   └── Product.js
    ├── routes/
    ├── middleware/
    │   └── authMiddleware.js
    ├── utils/
    │   └── sendEmail.js
    └── index.js
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free)
- Razorpay account (free test mode)
- Gmail account with App Password

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nexcart.git
cd nexcart
```

### 2. Install dependencies

```bash
npm install
cd server && npm install
```

### 3. Configure environment variables

Create `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Create `.env` (frontend):

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000/api
```

### 4. Seed the database (optional)

```bash
node server/seed.js
```

### 5. Run the application

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
npm run dev
```

Open http://localhost:5173

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/google | Google OAuth login |
| POST | /api/auth/forgot-password | Send OTP to email |
| POST | /api/auth/verify-otp | Verify OTP |
| POST | /api/auth/reset-password/:token | Reset password |
| GET | /api/auth/profile | Get user profile |
| PUT | /api/auth/profile | Update profile |
| PUT | /api/auth/change-password | Change password |

### Cart
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/cart | Get user's cart |
| POST | /api/cart/add | Add item to cart |
| PUT | /api/cart/update | Update item quantity |
| DELETE | /api/cart/remove/:productId | Remove item |
| DELETE | /api/cart/clear | Clear cart |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/orders | Place order |
| GET | /api/orders/my | Get user's orders |

### Payment
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/payment/create-order | Create Razorpay order |
| POST | /api/payment/verify | Verify payment signature |

---

## Deployment

### Backend — Render Web Service
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `node index.js`
- Add all environment variables from `server/.env`

### Frontend — Render Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Add `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL` environment variables

---

## Test Credentials (Razorpay Test Mode)

| Field | Value |
|---|---|
| Card Number | 4111 1111 1111 1111 |
| Expiry | 12/26 |
| CVV | 123 |
| OTP | 1234 |
| UPI ID | success@razorpay |

---

## Author

**Varsha Bangera**
- GitHub: [@varshabangera5](https://github.com/varshabangera5)
- Email: varshabangera5@gmail.com

---

## License

This project is built for internship/educational purposes.
