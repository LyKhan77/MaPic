# MaPic - GenAI Image Studio

**Developed by Lee Khan** | *Synthesizing the Future*

MaPic is a cutting-edge AI Image Studio designed to bridge the gap between human intent and neural rendering. Powered by local inference engines (Ollama), it enables the effortless materialization of digital artifacts. With a futuristic "Glassmorphism" interface, adaptive themes, and intelligent history tracking, MaPic is your portal to the Generative Age.

## 🚀 Features

*   **AI Image Generation:** Generate images using models like `x/z-image-turbo:fp8` (via Ollama).
*   **Modern UI:** Futuristic "Glassmorphism" design with smooth animations (Framer Motion).
*   **Theme Support:** Fully supported **Dark** and **Light** modes with a one-click toggle.
*   **History Management:** Automatically saves generated images and prompts. View, select, and delete history items.
*   **Responsive Design:** Collapsible sidebar and mobile-friendly layout.
*   **Secure Auth:** Google OAuth 2.0 via Supabase Authentication.
*   **Share & Download:** Easily download images or copy direct links to the clipboard.

## 🛠️ Tech Stack

### Frontend
*   **Framework:** React (Vite)
*   **Styling:** Tailwind CSS
*   **Icons:** Lucide React
*   **State Management:** TanStack Query (React Query)
*   **Animations:** Framer Motion
*   **Notifications:** Sonner

### Backend
*   **Framework:** Python FastAPI
*   **AI Engine:** Custom Ollama Host
*   **Database & Storage:** Supabase (PostgreSQL + Storage Buckets)

## 📦 Installation & Setup

### Prerequisites
*   Node.js & npm
*   Python 3.10+
*   Supabase Account (Project URL & Anon Key)
*   Ollama Instance (Custom or Local)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/mapic.git
cd mapic
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `backend/`:
```env
SUPABASE_URL="your_supabase_url"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"
OLLAMA_API_URL="https://your-ollama-host/api/generate"
MODEL_NAME="x/z-image-turbo:fp8"
CORS_ORIGINS="http://localhost:5173"
```

Run the backend:
```bash
# Standard local development
fastapi dev main.py

# OR run with Uvicorn (accessible from other devices)
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the frontend:
```bash
npm run dev
```

## 🖼️ Usage

1.  Login with your Google account.
2.  Use the **Prompt Input** at the bottom to describe the image you want.
3.  Click **Generate** or press Enter.
4.  View your creation in the main canvas.
5.  Use the **Sidebar** to access previous generations or switch themes.

## ⚡ Creator

Developed with vision by **Lee Khan**.
*The code is the canvas.*
