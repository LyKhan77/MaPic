# Mapic - GenAI Image Studio Frontend

This is the frontend for Mapic, built with React, Vite, Tailwind CSS, and Supabase.

## Tech Stack
- **Framework:** React (Vite)
- **Styling:** Tailwind CSS (Custom Cyberpunk Theme)
- **Icons:** Lucide React
- **State Management:** TanStack Query
- **Animations:** Framer Motion
- **Auth:** Supabase Auth UI

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Rename `.env` (or create `.env.local`) and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

## Project Structure
- `src/components`: Reusable UI components (Sidebar, ImageCanvas, PromptInput).
- `src/pages`: Route components (Login, Dashboard).
- `src/lib`: Utilities and API clients.
- `src/types.ts`: Shared TypeScript interfaces.