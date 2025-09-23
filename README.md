

# Blogs – Backend

Backend of the Blogs Platform built with **Node.js, Express, SQLite, and Cloudinary**.  
Handles authentication, blog CRUD, image uploads, and user profiles.

---

## Features
- JWT-based authentication (signup/login/logout)
- Blog CRUD operations
- Image upload using Cloudinary
- User profile management
- API ready for frontend consumption

---

## Tech Stack
- Node.js
- Express.js
- SQLite
- JWT authentication
- Multer + Cloudinary

---

## Setup & Run

1. Install dependencies:
```bash
cd backend
npm install
Configure environment variables in dotenv.env:

env
Copy code
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
Start backend server:

bash
Copy code
npm start
Runs on http://localhost:5000

Project Structure
plaintext
Copy code
backend/
├── controllers/       # Route logic
├── middleware/        # Authentication & validation
├── routes/            # API routes
├── utils/             # Helper functions (Cloudinary, etc.)
├── blogs.db           # SQLite database file
├── index.js           # Entry point
├── package.json
└── dotenv.env
API Endpoints
Auth
POST /api/auth/register – Register new user

POST /api/auth/login – Login user

POST /api/auth/logout – Logout

Posts
GET /api/posts – Get all posts

GET /api/posts/:id – Get single post

POST /api/posts – Create post

PUT /api/posts/:id – Update post (author only)

DELETE /api/posts/:id – Delete post (author only)

Deployment
Backend hosted on Render

Set environment variables (JWT, Cloudinary credentials)

Enable CORS for frontend URL
