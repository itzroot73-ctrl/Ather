
# 🌌 Aether Bot Nexus - Minecraft Multi-Bot Panel

A high-performance, glassmorphic web panel for managing multiple Minecraft bots with automated advertising (Ad Bot) capabilities.

![Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## ✨ Features

- **Multi-Bot Management:** Create and control multiple Minecraft bot instances from a single dashboard.
- **Automated Advertising:** Configure custom ad messages and transmission intervals for each bot.
- **Live Console:** Real-time neural link stream of server chat and bot logs.
- **Glassmorphic UI:** Premium frosted glass aesthetic with smooth animations and background glows.
- **Responsive Design:** Fully optimized for desktop and mobile viewing.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Git**

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd aether-bot-nexus

# Install dependencies
npm install
```

### 3. Run the Bot Manager (Backend)
The backend manages the `mineflayer` bot instances and handles the connection to Minecraft servers.
```bash
node bot/index.js
```

### 4. Run the Web Panel (Frontend)
Open a new terminal and run the Vite development server.
```bash
npm run dev
```
Navigate to `http://localhost:5173` to access the panel.

## 🌐 Deployment

### Frontend (Netlify / Vercel)
The web panel is a static React app. You can deploy it by simply pushing to GitHub and connecting your repository to Netlify.

### Backend (Render / Railway / VPS)
Since the bot manager needs to run 24/7, it should be deployed to a persistent server provider like **Render**, **Railway**, or a **VPS**.
- Set the `PORT` environment variable.
- Ensure the frontend points to your deployed backend URL in `components/MinecraftBotPanel.tsx`.

## 🛠 Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide React
- **Backend:** Node.js, Express, Socket.io
- **Minecraft Logic:** Mineflayer

---
Built with 🖤 by Jules
