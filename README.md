<div align="center">
  <img src="https://img.icons8.com/color/96/000000/youtube-play.png" alt="Logo">
  <h1 align="center">YouTube Watch Party - Frontend</h1>
  <p align="center">
    <strong>Experience movies and videos together in perfect sync with real-time voice and live reactions.</strong>
  </p>
</div>

---

## 🚀 Overview
The frontend of the YouTube Watch Party application, built with **React** and **Vite**. It provides a sleek, dark-themed, glassmorphism UI for users to create rooms, invite friends, and watch YouTube videos perfectly synchronized across all devices.

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
- **Responsive Design:** A fully responsive, modern UI built with Tailwind CSS, featuring aesthetic glowing effects and backdrop blurs.

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

## 🌟 Key Features
- **Real-time Sync:** If the host pauses or seeks, everyone's video updates instantly.
- **Role Management:** Room creators become Hosts with exclusive playback controls and waiting-room management.
- **AFK Mode & PiP:** Users can mark themselves away; the app handles catch-up syncing.
- **Live Chat:** Built-in chat system for participants to communicate during the video.
