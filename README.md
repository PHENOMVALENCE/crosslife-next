# CrossLife Next.js

Next.js migration of CrossLife Mission Network — church website + School of Christ Academy LMS.

Mirrors the PHP app at `C:\xampp\htdocs\crosslife` using the **same MySQL database** and **same assets/CSS**.

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | MySQL via `mysql2` (same `crosslife` DB) |
| UI | Bootstrap 5 + existing CrossLife CSS (LeadPage template) |
| Auth | iron-session (admin + student cookies) |
| Email | nodemailer |
| OAuth | Google Sign-In for students |

## Quick start (local)

1. Copy env file:
   ```bat
   copy .env.example .env.local
   ```
   Set `DB_*`, `SESSION_SECRET`, mail vars, and optional `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (same as PHP `.env`).

2. Install and run:
   ```bat
   npm install
   npm run dev
   ```

3. Open **http://localhost:3000**

## Migration status

### Complete
- Public site (homepage, sermons, events, ministries, leadership, gallery, contact, discipleship)
- Search + public forms (contact, prayer, feedback, newsletter) with email notifications
- Unified student/admin login + session auth
- **Cross Admin**: sermons, events, ministries, leadership, gallery CRUD
- **Discipleship CMS**: programs, modules, resources, quizzes, certificate issuance
- Admin inbox + student approval (with approval email)
- File uploads (`/api/upload`) for sermons and discipleship resources
- Google OAuth student sign-in (`/api/auth/google`)
- **Student LMS**: enroll, sequential unlock, study gate, quiz attempts, program completion emails
- Certificate page (`/student/certificate/[enrollmentId]`)
- Admin users list + super-admin settings (admin account CRUD)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `node scripts/extract-home.mjs` | Re-extract homepage HTML from PHP app |
| `node scripts/extract-pages.mjs` | Re-extract contact/discipleship HTML |

## Reference

Original PHP app: `C:\xampp\htdocs\crosslife`
