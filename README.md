# CodeSync Arena ⚔️

**CodeSync Arena** is a high-performance, real-time competitive coding platform where developers can engage in 1v1 battles. It combines a synchronized code editor with a powerful execution engine, allowing users to solve complex DSA problems while tracking their opponent's progress.

![CodeSync Hero Placeholder](https://via.placeholder.com/800x450?text=CodeSync+Arena+Dashboard)

## 🚀 Features
- **Real-time Synchronization:** Collaborative coding with <300ms latency using Socket.io.
- **Dynamic Arena:** Room-based matchmaking with customizable topics (DP, Graphs, Arrays) and difficulty.
- **Multi-Language Support:** Execute code in C++, Java, Python, and JavaScript via Judge0.
- **Competitive Edge:** 
  - **Live Battle Timer:** 30-minute rounds for high-pressure problem solving.
  - **Anti-Cheat Blur:** Opponent code is blurred until the match ends.
  - **Instant Feedback:** Real-time test case validation for both visible and hidden cases.
- **Premium UI:** Fully responsive, resizable IDE panels with a modern "Dark Arena" aesthetic.

## 🛠 Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Monaco Editor, Socket.io-client.
- **Backend:** Node.js, Express, MongoDB, Socket.io.
- **Cloud Execution:** Judge0 API.
- **Styling:** Vanilla CSS (Modern CSS Variables & Flexbox).

## 🏗 Architecture Overview
CodeSync follows a decoupled Client-Server architecture:
1. **Client Layer:** Manages state via React Hooks and Context API. Handles local debouncing for socket events.
2. **Real-time Layer:** Socket.io handles orchestration of "Battle Events" (code changes, results, timer sync).
3. **Persistence Layer:** MongoDB stores user profiles and historical battle data with TTL indexes for ephemeral room cleanup.
4. **Execution Layer:** A dedicated service layer interfaces with Judge0 to provide sandboxed code execution.

## 🚦 How It Works
1. **Host:** A user creates a room, selecting a topic and difficulty.
2. **Join:** An opponent enters using the unique Room ID.
3. **Battle:** Both players receive the same problem. They write, run, and debug in real-time.
4. **Victory:** The first player to pass all test cases or the one with more passed cases when the timer hits zero wins.

## 📸 Screenshots
| Dashboard | Battle Arena |
| :--- | :--- |
| ![Dashboard Placeholder](https://via.placeholder.com/400x250?text=Dashboard+UI) | ![Arena Placeholder](https://via.placeholder.com/400x250?text=Battle+Arena+UI) |

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/code-sync.git
cd code-sync

# Install Backend
cd backend && npm install

# Install Frontend
cd ../frontend && npm install
```

### 2. Environment Variables
Create a `.env` in the `backend` folder:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Application
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
cd frontend && npm run dev
```

## 🔮 Future Improvements
- [ ] **Redis Integration:** Move socket state to Redis for multi-instance scaling.
- [ ] **Async Execution:** Implement webhooks for Judge0 to handle long-running test cases.
- [ ] **Global Leaderboard:** Ranked matchmaking system with ELO ratings.
- [ ] **Spectator Mode:** Allow other users to watch high-stakes battles.

## 💎 Why CodeSync?
Unlike standard editors, CodeSync is built for **pressure**. It simulates the technical interview environment while adding a competitive layer, making it an ideal tool for both interview preparation and community coding events.

---
**Author:** Aditya Maurya
**Contact:** adityaah.301@gmail.com
