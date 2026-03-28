# Project Overview

Full-stack web application built with **Express.js + React.js + TypeScript**.

---

## Stack

| Layer    | Technology |
|----------|------------|
| Backend  | Express.js + TypeScript |
| Frontend | React.js + TypeScript |
| ORM      | Prisma |
| Auth     | JWT |

---

## Backend Status

| Feature | Status |
|---|---|
| JWT Authentication | ✅ Complete |
| Prisma ORM | ✅ Complete |
| Role-Based Access Control (RBAC) | 🔄 In Progress |
| Protected & Public Routes | 🔄 In Progress |
| Zod Validation | ⏳ Pending |
| Environment Variables (`env`) | ✅ Complete |
| uuid security api (pending)
| logger (pending)

---

## Frontend Status

| Feature | Status |
|---|---|
| shadcn/ui | ✅ Complete |
| Tailwind CSS | ✅ Complete |
| Zustand (state management) | ✅ Complete |
| Zod (validation) | ✅ Complete |
| React Hook Form | ✅ Complete |
| @hookform/resolvers | ✅ Complete |
| TanStack Table | ✅ Complete |
| TanStack Query | ✅ Complete |
| Lucide React (icons) | ✅ Complete |
| Environment Variables (`env`) | ✅ Complete |
| Protected / Public / Role Routes | 🔄 In Progress |
| Frontend Structure | ✅ Complete |
| Component Library | ✅ Complete |
| Dashboard | 🔄 In Progress |
| Dark / Light Mode | ✅ Complete |
| Custom Color Palette | ✅ Complete |
| Custom Font | ⏳ Pending |

---

## Key Conventions

- Use **TypeScript strict mode** across the entire project.
- All forms must use **React Hook Form** with **Zod** schemas via `@hookform/resolvers`.
- Server state is managed with **TanStack Query**; client/global state with **Zustand**.
- UI components come from the **shadcn/ui** library — avoid creating ad-hoc components if shadcn already covers the use case.
- Styling is done exclusively with **Tailwind CSS**.
- Icons use **Lucide React**.
- RBAC is partially implemented — be careful when modifying route guards or role logic.
- Do not modify auth logic (JWT) unless explicitly asked — it is complete and stable.

---

## Current Priorities

1. Finish **RBAC** implementation on the backend.
2. Complete **protected / public / role-based routes** on the frontend.
3. Add **Zod validation** on the backend (pending).
4. Complete the **Dashboard** view.
5. Implement **custom font** configuration.