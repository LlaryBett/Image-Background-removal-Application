# Image-Background-removal-Application
This project is a background removal tool that allows users to easily remove backgrounds from images with high quality and accuracy.  🚀
## 🚀 Features

- ✅ **User Authentication** via Clerk
- 💳 **Stripe Payment Integration** for buying credits
- 🖼 **Image Background Removal** via AI processing
- 🔢 **Credits Management** with auto-deduction per usage
- 🔒 **Secure Backend** built with Express.js & MongoDB

## 🛠️ Tech Stack

**Frontend:** React, Clerk Authentication, Axios, React Router

**Backend:** Node.js, Express.js, MongoDB (Atlas)

**Payments:** Stripe API

**Hosting:** Vercel (Frontend) and Render/Heroku (Backend)

---

## 🔧 Installation

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2️⃣ Setup Environment Variables

Create a `.env` file in both the frontend and backend directories:

#### Frontend (`.env`)
```sh
VITE_BACKEND_URL=http://localhost:4000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### Backend (`.env`)
```sh
PORT=4000
MONGO_URI=your_mongo_db_uri
STRIPE_SECRET_KEY=your_stripe_secret_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 3️⃣ Install Dependencies & Start Development Server

#### Backend
```sh
cd backend
npm install
npm run dev
```

#### Frontend
```sh
cd frontend
npm install
npm run dev
```

---

## 🎯 API Endpoints

### 🔹 User Routes

- `GET /api/user/credits` → Fetch user credit balance
- `POST /api/user/pay-stripe` → Initiate Stripe payment

### 🔹 Image Processing

- `POST /api/image/remove-bg` → Remove background from an image _(Requires Auth & Credits)_

### 🔹 Stripe Webhooks

- `POST /api/webhook/stripe` → Handles Stripe payment confirmations

---

## 📸 Screenshots

### Homepage
![Homepage](client/Screenshots/Screenshot%202025-03-02%20202732.png)

---

## 💡 Future Improvements

- 🏆 Add PayPal/Futterwave payment options
- 🌎 Multi-language support

---

## 🤝 Contributing

1. **Fork the repo**
2. **Create a feature branch** (`git checkout -b feature-name`)
3. **Commit changes** (`git commit -m 'Add feature'`)
4. **Push to branch** (`git push origin feature-name`)
5. **Create a pull request**

---





