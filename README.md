<img width="1767" height="1082" alt="image-2" src="https://github.com/user-attachments/assets/456c70f8-cf08-4d91-ab08-3fca29a148d7" /># TradeSwap

A web-based item trading platform where users can swap items with each other — no money involved. All listings go through a human verification process before going live to ensure quality and prevent fraud.

---

## Table of Contents

- [Project Description](#project-description)
- [System Architecture](#system-architecture)
- [User Roles & Permissions](#user-roles--permissions)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [How to Run the System](#how-to-run-the-system)
- [Screenshots](#screenshots)

---

## Project Description

TradeSwap solves a common problem: people have unused items at home but buying new things costs money. Existing platforms like Facebook Marketplace and Craigslist focus on selling, not trading. TradeSwap provides a dedicated platform for direct item-to-item swapping with quality assurance built in.

**Target Users:**
- College students wanting to swap textbooks, electronics, and dorm items
- Collectors looking to trade cards, sneakers, or vinyl records
- General public wanting to exchange household items, clothes, or gadgets without spending money

**Core Workflows:**

```
List Item → Verification → Browse → Propose Trade → Both Confirm → Verifier Approves → Completed
```

- Every item listing starts as **PENDING** and must be approved by a Verifier before going live
- Trade proposals require both parties to confirm before a Verifier reviews and finalises the trade
- A built-in chat system lets traders communicate within each trade
- Traders rate each other after every completed trade

---

## System Architecture

TradeSwap uses a **4-Tier Layered Architecture**:

```
┌─────────────────────────────────────────────────────┐
│               Presentation Layer                     │
│         React.js (Vite) — Port 8080                   │
└────────────────────┬────────────────────────────────┘
                     │ HTTP / REST
┌────────────────────▼────────────────────────────────┐
│              Business Logic Layer                    │
│           NestJS API — Port 3000                    │
│  Controllers → Guards → Services → Repositories     │
└────────────────────┬────────────────────────────────┘
                     │ Prisma ORM
┌────────────────────▼────────────────────────────────┐
│               Data Access Layer                      │
│          Repositories + DatabaseService             │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  Data Layer                          │
│           PostgreSQL — Port 5432                    │
└─────────────────────────────────────────────────────┘
```

**Request Flow:**
```
HTTP Request → Controller → Auth Guard → Roles Guard → Service → Repository → Database
```

**Why Layered Architecture:**
- All features share the same operational characteristics — no need to scale independently
- Features are tightly coupled (trades depend on items, chat depends on trades)
- Small team, university timeline — distributed architectures add overhead without value

**File Storage:** Item photos are stored in AWS S3 and served via public URLs.

---

## User Roles & Permissions

### Trader
The default role for all registered users.

| Action | Permission |
|--------|-----------|
| Create item listings with photos | ✅ |
| Browse all approved items | ✅ |
| Propose, accept, reject, cancel trades | ✅ |
| Chat within a trade conversation | ✅ |
| Rate other traders after completed trade | ✅ |
| Edit / delete own listings | ✅ |
| Access verification or admin features | ❌ |

### Verifier
Assigned by an Admin. Reviews content quality and approves trades.

| Action | Permission |
|--------|-----------|
| View all pending item listings | ✅ |
| Approve or reject item listings | ✅ |
| View trades awaiting verification | ✅ |
| Confirm or reject trade completion | ✅ |
| Create listings or trade items | ❌ |
| Manage users or platform settings | ❌ |

### Admin
Full platform control. Does not participate in trading.

| Action | Permission |
|--------|-----------|
| Manage all users (edit, delete, ban) | ✅ |
| Promote users to Verifier role | ✅ |
| Verify / unverify user accounts | ✅ |
| Manage all item listings (edit, delete) | ✅ |
| View platform analytics | ✅ |
| Create and manage categories | ✅ |

---

## Technology Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| **NestJS** (Node.js + TypeScript) | REST API framework |
| **Prisma ORM** | Type-safe database queries |
| **PostgreSQL** | Relational database |
| **JWT + Cookies** | Stateless authentication |
| **class-validator** | Request DTO validation |
| **AWS S3** | Item photo storage |
| **bcrypt** | Password hashing |

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React.js** (TypeScript) | UI framework |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Component library |
| **TanStack Query** | Server state and caching |
| **React Router** | Client-side routing |
| **Recharts** | Analytics charts |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Docker + Docker Compose** | Containerised deployment |
| **Nginx** | Static file serving + SPA routing |

---

## Installation & Setup

### Prerequisites
- [Docker](https://www.docker.com/get-started) and Docker Compose installed
- AWS S3 bucket with public read access enabled (for item photo uploads)

### 1. Clone the repository

```bash
git clone <repository-url>
cd trade_swap
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your AWS S3 credentials:

```env
AWS_BUCKET_NAME=your-s3-bucket-name
AWS_BUCKET_REGION=your-region          # e.g. ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

> **Note:** The database connection is handled automatically by Docker. You do not need to set `DATABASE_URL`.

### 3. AWS S3 Bucket Setup

Your S3 bucket must allow public read access for item photos to display correctly.

1. Go to your S3 bucket → **Permissions** tab
2. Under **Block public access**, disable "Block all public access"
3. Add the following **Bucket Policy**:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}
```

---

## How to Run the System

### Docker (Recommended — for everyone)

```bash
docker compose up --build
```

This single command will:
1. Start a PostgreSQL database container
2. Run all database migrations automatically
3. Start the NestJS backend API
4. Build the React frontend and serve it with Nginx

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080|
| Backend API | http://localhost:3000 |
| Prisma Studio | http://localhost:5555 |
| PostgreSQL | localhost:5432 |

To stop:
```bash
docker compose down
```

To stop and delete all data (database included):
```bash
docker compose down -v
```

---

### Local Development (without Docker)

**Requirements:** Node.js 20+, PostgreSQL running locally

**Backend:**
```bash
cd backend
cp .env.example .env        # add DATABASE_URL and AWS keys
npm install

cd src/infrastructure
npx prisma migrate dev      # run migrations
cd ../..

npm run start:dev           # starts on http://localhost:3000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:8080
```

---

### Default Accounts

Before seeding, make sure:

1. **PostgreSQL is running** (locally or via Docker)
2. **`backend/.env` exists** — copy from `.env.example` and fill in your values:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/tradeswap
   ADMIN_USER_NAME=admin
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-secure-password
   ```
3. **Dependencies are installed:**
   ```bash
   cd backend && npm install
   ```
4. **Database is migrated** (tables must exist before seeding):
   ```bash
   npx prisma migrate deploy
   ```
5. **Run the seed script once:**
   ```bash
   npm run seed
   ```

The script is idempotent — if an admin already exists it will skip silently. After that, use the Admin panel to promote other users to Verifier.

---

## Screenshots

### Landing Page
<img width="1796" height="1036" alt="image" src="https://github.com/user-attachments/assets/e93733ce-9bbe-4dbd-96d2-49190f393a7b" />

### Browse Items
<img width="1783" height="1089" alt="image-3" src="https://github.com/user-attachments/assets/b90683da-0087-42db-95cf-232fdee73aff" />

### Profile Management

#### User Profile
<img width="1797" height="889" alt="image-13" src="https://github.com/user-attachments/assets/bde82ec7-de05-438e-9af8-a4f84c272029" />

#### Edit Profile
<img width="1799" height="1087" alt="image-14" src="https://github.com/user-attachments/assets/9748524e-10bb-48cc-b4ba-f7795b4409ad" />


### Item Detail
<img width="1798" height="1079" alt="image-4" src="https://github.com/user-attachments/assets/a961143d-7c2d-4fad-9ec9-e36d7a96c36c" />


### Create Item Listing
<img width="1799" height="1052" alt="image-1" src="https://github.com/user-attachments/assets/d4d73400-d071-4859-b74f-1b86f15549fa" />


### Trade Detail & Progress Stepper
#### Send Trade Proposal
<img width="1800" height="1069" alt="image-5" src="https://github.com/user-attachments/assets/c7e9c677-23cb-4dc6-b6bd-819ab1355499" />

#### Trade Detail
<img width="1800" height="1079" alt="image-6" src="https://github.com/user-attachments/assets/68bcf9df-1f1b-4d8c-a8f1-2b7f76a0cc51" />

#### Receiver get proposal
<img width="1799" height="1089" alt="image-8" src="https://github.com/user-attachments/assets/462e528a-fe91-4f71-b9fa-a7c392842e10" />

#### Await verifier to approve trade
<img width="1773" height="1076" alt="image-9" src="https://github.com/user-attachments/assets/3d60f034-8c4d-457d-899b-4a9d7748c202" />

#### Complete Trade
<img width="1800" height="1083" alt="image-11" src="https://github.com/user-attachments/assets/f0c11608-4321-4eb0-a83f-ef77aa2ee9ac" />


### My Trades
<img width="1800" height="1088" alt="image-7" src="https://github.com/user-attachments/assets/172e850c-06a2-47e9-af11-83af6af520d1" />

### Chat
<img width="1799" height="1088" alt="image-15" src="https://github.com/user-attachments/assets/497085eb-da10-4951-ace7-fea77e33b014" />


### Verifier Dashboard — Pending Items
<img width="1767" height="1082" alt="image-2" src="https://github.com/user-attachments/assets/00921bc5-04b6-4105-a748-33748d0d218e" />

### Verifier Trade Review
<img width="1764" height="1088" alt="image-10" src="https://github.com/user-attachments/assets/8a68bb2a-7650-42d5-8c48-02f352e525b4" />


### Admin — User Management
<img width="1800" height="1091" alt="image-16" src="https://github.com/user-attachments/assets/9e414b3d-3fb7-45c3-a0bd-1b8c85ddc137" />


### Admin — Item Management
<img width="1800" height="1090" alt="image-17" src="https://github.com/user-attachments/assets/86e3669f-0729-4919-aa3f-f248df899ce3" />


### Admin — Analytics
<img width="1800" height="1089" alt="image-18" src="https://github.com/user-attachments/assets/0bf7ac3a-0675-4d78-9d65-74c8dbe96f01" />


---

> Add your screenshots to `docs/screenshots/` and update the paths above.
