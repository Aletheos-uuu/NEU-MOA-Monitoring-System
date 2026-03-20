# 📄 NEU MOA Monitor

A centralized monitoring system for Memoranda of Agreement (MOAs) at New Era University. Replaces manual tracking with a structured, role-based platform for managing institutional partnerships across all colleges and departments.

🔗 **Live:** [neu-moa-monitoring-system.vercel.app](https://neu-moa-monitoring-system.vercel.app)

---

## Overview

NEU MOA Monitor allows authorized university personnel to track the full lifecycle of MOAs — from processing through approval, expiration, and renewal. Each user sees a tailored view based on their role: students browse available internship partners, faculty manage their department's agreements, and admins oversee everything system-wide with full audit visibility.

---

## For Students

- Sign in with your `@neu.edu.ph` Google account
- Browse all **approved** institutional partnerships
- View company name, address, and contact details
- Filter by college or search by company name

## For Faculty

- View all active, non-deleted MOA records with full details
- Add and edit MOA entries if granted management rights by an Admin
- Soft-delete MOA records (recoverable by Admin)
- Filter and search across all agreements

## For Admins

- Full visibility of all MOAs including deleted records and audit history
- Add, edit, soft-delete, and recover MOA entries
- View audit trails — who performed each action and when
- Dashboard stats showing active, processing, expired, and expiring MOA counts
- Filter by college, date range, or search by company, contact, status, and more
- Manage all users: assign roles (Student / Faculty / Admin), toggle MOA management rights, and block or unblock accounts

---

## MOA Status Tracking

| Status | Description |
|---|---|
| **Approved** | Signed by President / On-going notarization / No notarization needed |
| **Processing** | Awaiting HTE signature / Under Legal Office review / Sent to VPAA/OP |
| **Expiring** | Expiry date is within two months |
| **Expired** | Past expiry date with no renewal |

---

## Tech Stack

- **Next.js 15** — frontend framework
- **Firebase** — Firestore database + Google Authentication
- **Firestore Security Rules** — role-based data access enforcement
- **Tailwind CSS + shadcn/ui** — styling and components
- **Vercel** — deployment
