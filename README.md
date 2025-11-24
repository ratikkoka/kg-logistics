# KG Logistics - Lead Management System

A comprehensive lead management system for KG Logistics LLC, built with Next.js 16, Supabase, and Prisma.

## Features

- **Lead Management**: Track and manage shipping quote leads with status tracking
- **Contact Management**: Separate dashboard for contact form submissions
- **Load Management**: Convert leads to loads and track them through completion
- **Email Templates**: Create and send templated emails to leads using Resend
- **User Authentication**: Google OAuth and email/password authentication via Supabase
- **Access Control**: Invite-only system with user access management
- **Dashboard Analytics**: Visual statistics and KPI tracking

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Supabase Auth
- **UI Components**: HeroUI
- **Email**: Resend (for templates), EmailJS (for form notifications)
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account
- Vercel account (for deployment)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd kg-logistics
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see `.env.example` or `DEPLOYMENT.md`)

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── (admin)/          # Admin routes (dashboard, leads, loads, etc.)
│   ├── (public)/         # Public routes (home, contact, ship)
│   ├── api/              # API routes
│   └── auth/             # Authentication routes
├── components/
│   ├── admin/            # Admin navigation components
│   ├── dashboard/         # Dashboard components
│   ├── leads/            # Lead management components
│   └── templates/        # Email template components
├── lib/
│   ├── auth.ts           # Authorization utilities
│   ├── prisma.ts         # Prisma client
│   └── supabase/         # Supabase client utilities
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
└── types/                # TypeScript type definitions
```

## License

See LICENSE file for details.
