# Mawkish Creates — Backend API

Express + MongoDB REST API for the Mawkish Creates website.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in your values
cp .env.example .env

# 3. Seed the database with sample data + default admin
npm run seed

# 4. Start development server (with auto-reload)
npm run dev

# 5. Production
npm start
```

Server runs on **http://localhost:5000** by default.

---

## Environment Variables

| Variable          | Description                                      |
|-------------------|--------------------------------------------------|
| `PORT`            | Server port (default: 5000)                      |
| `NODE_ENV`        | `development` or `production`                    |
| `MONGO_URI`       | MongoDB Atlas connection string                  |
| `JWT_SECRET`      | Long random string for signing tokens            |
| `JWT_EXPIRES_IN`  | Token expiry e.g. `7d`                           |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs for CORS           |
| `SMTP_HOST`       | SMTP server (e.g. `smtp.gmail.com`)              |
| `SMTP_PORT`       | SMTP port (587 for TLS, 465 for SSL)             |
| `SMTP_USER`       | SMTP username / email                            |
| `SMTP_PASS`       | SMTP password / app password                     |
| `NOTIFY_EMAIL`    | Agency email that receives lead notifications    |

---

## API Reference

All responses follow the shape:
```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "..." }
```

### Health Check
```
GET /health
```

---

### Auth  `/api/auth`

| Method | Endpoint                  | Auth         | Description              |
|--------|---------------------------|--------------|--------------------------|
| POST   | `/login`                  | Public       | Admin login              |
| GET    | `/me`                     | Admin token  | Get current admin        |
| POST   | `/register`               | Superadmin   | Create new admin account |
| PATCH  | `/change-password`        | Admin token  | Change own password      |

**Login body:**
```json
{ "email": "admin@mawkishcreates.com", "password": "Admin@1234!" }
```
Returns `{ token, data }` — include token as `Authorization: Bearer <token>`.

---

### Leads  `/api/leads`

| Method | Endpoint       | Auth        | Description              |
|--------|----------------|-------------|--------------------------|
| POST   | `/`            | Public      | Submit inquiry form      |
| GET    | `/`            | Admin       | List all leads           |
| GET    | `/stats`       | Admin       | Leads by status/service  |
| GET    | `/:id`         | Admin       | Get single lead          |
| PATCH  | `/:id`         | Admin       | Update status/notes      |
| DELETE | `/:id`         | Admin       | Delete a lead            |

**POST body:**
```json
{
  "name":        "Jane Doe",
  "company":     "Acme Ltd",
  "email":       "jane@acme.com",
  "phone":       "+1 555 000 0000",
  "industry":    "E-Commerce",
  "service":     "Lead Generation",
  "budget":      "$3,000 – $5,000/mo",
  "description": "We want to grow our Instagram presence..."
}
```

**GET query params:**
- `?status=new|contacted|qualified|proposal|closed_won|closed_lost`
- `?search=company+name`
- `?page=1&limit=20&sort=-createdAt`

---

### Portfolio  `/api/portfolio`

| Method | Endpoint          | Auth   | Description              |
|--------|-------------------|--------|--------------------------|
| GET    | `/`               | Public | List projects            |
| GET    | `/industries`     | Public | List unique industries   |
| GET    | `/:id`            | Public | Single project           |
| POST   | `/`               | Admin  | Create project           |
| PUT    | `/:id`            | Admin  | Update project           |
| DELETE | `/:id`            | Admin  | Delete project           |

**GET query params:** `?industry=E-Commerce&featured=true`

---

### Case Studies  `/api/case-studies`

| Method | Endpoint | Auth   | Description       |
|--------|----------|--------|-------------------|
| GET    | `/`      | Public | List case studies |
| GET    | `/:id`   | Public | Single case study |
| POST   | `/`      | Admin  | Create            |
| PUT    | `/:id`   | Admin  | Update            |
| DELETE | `/:id`   | Admin  | Delete            |

---

### Testimonials  `/api/testimonials`

| Method | Endpoint | Auth   | Description       |
|--------|----------|--------|-------------------|
| GET    | `/`      | Public | List testimonials |
| POST   | `/`      | Admin  | Create            |
| PUT    | `/:id`   | Admin  | Update            |
| DELETE | `/:id`   | Admin  | Delete            |

---

## Default Admin Credentials (after seeding)

```
Email:    admin@mawkishcreates.com
Password: Admin@1234!
```
⚠️  **Change the password immediately after first login.**

---

## Project Structure

```
src/
├── server.js           Entry point
├── app.js              Express app, middleware, routes
├── config/
│   └── db.js           MongoDB connection
├── models/
│   ├── Lead.js
│   ├── PortfolioProject.js
│   ├── CaseStudy.js
│   ├── Testimonial.js
│   └── Admin.js
├── controllers/
│   ├── leadController.js
│   ├── portfolioController.js
│   ├── caseStudyController.js
│   ├── testimonialController.js
│   └── authController.js
├── routes/
│   ├── leadRoutes.js
│   ├── portfolioRoutes.js
│   ├── caseStudyRoutes.js
│   ├── testimonialRoutes.js
│   └── authRoutes.js
├── middleware/
│   ├── auth.js           JWT protect + superAdmin guards
│   ├── errorHandler.js   Central error + 404 handler
│   └── rateLimiter.js    Per-route rate limits
└── utils/
    ├── logger.js          Winston logger
    ├── email.js           Nodemailer helpers
    └── seed.js            Database seeder
```

---

## Connecting the Frontend

In your Vite frontend, set the API base URL in `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Example lead form submission:
```js
const res = await fetch(`${import.meta.env.VITE_API_URL}/leads`, {
  method:  'POST',
  headers: { 'Content-Type': 'application/json' },
  body:    JSON.stringify(formData),
})
const data = await res.json()
```

---

## Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on Render
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Add all environment variables from `.env.example`
6. Add your MongoDB Atlas IP whitelist: `0.0.0.0/0` for Render
