import React, { useEffect, useState } from 'react';

const LeaderboardPage = () => {
  const [topImages, setTopImages] = useState([]); // Initialize as an empty array
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/leaderboard');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTopImages(data.topImages); // Assuming the response has a property `topImages`
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };

    fetchLeaderboardData();
  }, []); // Empty dependency array means this effect runs once on mount

  // Render loading state or leaderboard data
  if (loading) {
    return <div>Loading...</div>; // Display loading text or spinner
  }

  return (
    <div>
      <h1 className="text-center text-2xl font-bold">Leaderboard</h1>
      <ul>
        {topImages.map((image) => (
          <li key={image._id}>
            <div className="p-4">
              <img src={image.url} alt={image.name} className="w-full h-auto" />
              <h2>{image.name}</h2>
              <p>{image.description}</p>
              <p>Rating: {image.rating}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaderboardPage;
