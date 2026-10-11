# Neighborly

Neighborly is a community help and volunteer hub that makes it easier to ask for support and show up for one another. Residents can browse local requests, offer their time, and post a request of their own.

## Features

- Browse and search community requests by category.
- Filter requests by category and urgency.
- Offer to volunteer with a personal message.
- Post a request with a contact email and preferred date.
- See community impact at a glance.
- Store requests and volunteer sign-ups in MySQL.
- Use locally familiar Bangladesh examples, Dhaka neighborhoods, and Bangladesh-formatted dates.

## Tech stack

- React and Vite
- Express and Node.js
- MySQL with XAMPP

## Prerequisites

- Node.js 18 or later and npm
- XAMPP with MySQL enabled

## Setup

1. Start **MySQL** from the XAMPP Control Panel.
2. Open phpMyAdmin at `http://localhost/phpmyadmin`, select **Import**, and import [`database/schema.sql`](database/schema.sql). The script creates the `neighborly` database and sample requests.
3. In a terminal at the project root, install the root and app dependencies:

   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

4. Copy `server/.env.example` to `server/.env` and update the MySQL settings if your local XAMPP credentials differ. The default XAMPP setup uses `root` with an empty password.
5. Start the API and frontend together:

   ```bash
   npm run dev
   ```

6. Open the Vite URL printed in the terminal (usually `http://localhost:5173`).

The API runs on `http://localhost:4000`. Set `VITE_API_URL` in `client/.env` if you want the frontend to use a different API URL.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Check API and database connectivity |
| GET | `/api/needs` | List active community requests |
| POST | `/api/needs` | Create a community request |
| POST | `/api/needs/:id/volunteer` | Offer to help with a request |

## GitHub
