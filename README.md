# Secret Santa App

A secure, mobile-responsive Secret Santa application built with Next.js, MongoDB, and Tailwind CSS.

## Features
- **Role-based Dashboards**: Separate views for Organizers and Participants.
- **Secure Matching**: Organizers trigger the match but can't see who got whom.
- **Rich UI**: Glassmorphism design with animations.
- **Claim Flow**: Users claim their pre-assigned accounts.

## Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/secret-santa
   JWT_SECRET=your-super-secret-key-change-me
   ```

3. **Run Locally**:
   ```bash
   npm run dev
   ```

4. **Initial Setup**:
   - Create the first admin user:
     ```bash
     curl -X POST http://localhost:3000/api/admin/users -H "Content-Type: application/json" -d '{"username":"admin", "role":"ORGANIZER"}'
     ```
   - Go to `http://localhost:3000`, click "Need to claim account?", and claim the `admin` account.

## Deployment (Vercel)

1. **Database**: 
   - Create a free MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/atlas/database).
   - Get your connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/secret-santa`).

2. **Vercel Project**:
   - Import this repository to Vercel.
   - In **Settings > Environment Variables**, add:
     - `MONGODB_URI`: Your MongoDB Atlas connection string.
     - `JWT_SECRET`: A long random string (e.g., generated via `openssl rand -base64 32`).

3. **Deploy**:
   - Click Deploy. Vercel will build and host your app.
