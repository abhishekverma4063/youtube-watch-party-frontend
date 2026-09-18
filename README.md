<div align="center">
  <img src="https://img.icons8.com/color/96/000000/youtube-play.png" alt="Logo">
  <h1 align="center">YouTube Watch Party - Frontend</h1>
  <p align="center">
    <strong>Experience movies and videos together in perfect sync with real-time voice and live reactions.</strong>
  </p>
  <p align="center">
    <a href="https://youtube-watch-party-frontend-4utc.vercel.app/signup"><strong>🔗 View Live Application</strong></a>
  </p>
</div>

---

## 🚀 Project Overview
This is the frontend component of the **YouTube Watch Party** application, designed to give users a premium, synchronized video-watching experience. Built with **React** and **Vite**, it features a sleek, dark-themed, glassmorphism UI. 

When a user creates a room, they become the **Host** and can invite friends using a room code. The Host has full control over the video (Play, Pause, Seek), and the WebSockets ensure that every participant's screen stays perfectly in sync with millisecond precision. Additionally, users can chat in real-time, send floating emoji reactions, and request to join private rooms via a waiting list.

## 📂 Project Structure
```text
frontend/
├── src/
│   ├── assets/                # Images, icons, and static assets
│   ├── components/            # Reusable UI components and main pages
│   │   ├── AudioChat.tsx      # WebRTC peer-to-peer audio
│   │   ├── Chat.tsx           # Real-time room chat
│   │   ├── DashboardPage.tsx  # Create/Join room landing page
│   │   ├── LiveReactions.tsx  # Floating emoji reaction animations
│   │   ├── LoginPage.tsx      # User authentication (Login)
│   │   ├── SignupPage.tsx     # User authentication (Signup)
│   │   ├── RoomPage.tsx       # Main synchronized video room
│   │   ├── StudioControls.tsx # Host-only playback and admin controls
│   │   ├── VideoPlayer.tsx    # YouTube IFrame API wrapper
│   │   └── WaitingRoomPanel.tsx # Admin panel for admitting users
│   ├── context/               # Global React State (Context API)
│   │   ├── AuthContext.tsx    # Manages JWT sessions and user state
│   │   ├── SocketContext.tsx  # Manages the global WebSocket connection
│   │   └── ThemeContext.tsx   # Light/Dark mode toggling
│   ├── hooks/                 # Custom React hooks
│   ├── App.tsx                # Main Router and protected routes
│   └── main.tsx               # React application entry point
```

## 💻 Tech Stack
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS + Framer Motion (for buttery-smooth animations)
- **Real-time:** Socket.io-client
- **Routing:** React Router v6
- **Icons & UI:** Lucide React, React Hot Toast
- **Deployment:** Vercel

## 🏗️ Architecture
- **Context API:** Utilizes React Context (`AuthContext`, `SocketContext`) for global state management.
- **WebSocket Integration:** Maintains a persistent, low-latency connection to the backend to sync video states (play, pause, seek), handle chat messages, and manage room participants.
- **Authentication:** Communicates with the backend REST API using secure HTTP-only cookies to handle JWT sessions seamlessly without exposing tokens to XSS attacks.

## 🔌 Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

> **Note:** The frontend development server runs on **Port 5173** by default (`http://localhost:5173`).
