// src/pages/PlayerPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function PlayerPage() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);

  // Fetch player details from backend
  const fetchPlayer = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/v1/player/${id}`);
      setPlayer(response.data);
    } catch (error) {
      console.error("Error fetching player details:", error);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [id]);

  if (!player) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center p-6">
      <img src={player.url} alt={player.name} className="w-1/2 h-80 object-cover" />
      <div className="mt-6">
        <h2 className="text-3xl font-bold">{player.name}</h2>
        <p className="mt-4">{player.description}</p>
        <p className="mt-2">Rating: {player.rating}</p>
      </div>
    </div>
  );
}

export default PlayerPage;
