import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainPage from './pages/Mainpage';
import LeaderboardPage from './pages/Leaderboard';
import PlayerPage from './pages/Player';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
