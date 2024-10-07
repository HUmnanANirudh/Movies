// src/pages/MainPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaBars, FaTimes } from 'react-icons/fa';

function MainPage() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Socket.io client connection
  useEffect(() => {
    const socket = io('http://localhost:8000');

    socket.on('ratingUpdate', (data) => {
      console.log('Real-time rating update:', data);
      // Fetch updated leaderboard after a rating update
      fetchLeaderboard();
    });

    return () => {
      socket.disconnect(); // Cleanup when the component unmounts
    };
  }, []);

  // Fetch two random images from backend
  const fetchImages = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/images');
      setImages([response.data.leftImage, response.data.rightImage]);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // Fetch the leaderboard data
  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/v1/leaderboard');
      setLeaderboard(response.data.topImages);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };

  useEffect(() => {
    fetchImages();  // Fetch images on component mount
    fetchLeaderboard(); // Fetch leaderboard on component mount
  }, []);

  const handleVote = async (winner) => {
    const winnerId = winner === 'left' ? images[0]._id : images[1]._id;
    const loserId = winner === 'left' ? images[1]._id : images[0]._id;

    try {
      // Send the vote result to backend to update ratings
      await axios.post('http://localhost:8000/api/v1/update', {
        winner: winner,
        leftImageId: images[0]._id,
        rightImageId: images[1]._id,
        leftRating: images[0].rating,
        rightRating: images[1].rating
      });

      // Fetch new images after voting
      fetchImages();
    } catch (error) {
      console.error("Error updating ratings:", error);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-8 relative">
      {/* Navbar */}
      <div className="w-full flex justify-between items-center bg-gray-800 p-4">
        <h1 className="text-white text-lg font-bold">Your App Name</h1>
        <div className="cursor-pointer" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes className="text-white" /> : <FaBars className="text-white" />}
        </div>
      </div>

      {/* Leaderboard Menu */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-700 transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        } w-64 shadow-lg z-50`}
      >
        <h2 className="text-white text-lg font-bold p-4">Leaderboard</h2>
        <ul className="text-white">
          {leaderboard.map((player, index) => (
            <li key={player._id} className="p-2 border-b border-gray-500">
              {index + 1}. {player.name} - Rating: {player.rating}
            </li>
          ))}
        </ul>
      </div>

      {/* Image Voting Area */}
      <div className="flex justify-between w-3/4">
        {images.map((image) => (
          <div key={image._id} className="w-1/2 p-4">
            <img
              src={image.url}
              alt={image.name}
              className="w-full h-64 object-cover cursor-pointer"
              onClick={() => handleImageClick(image)}
            />
            <div className="text-center mt-2 text-lg">{image.name}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-between w-1/4 mt-6">
        <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => handleVote('left')}>Choose Left</button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => fetchImages()}>Skip</button>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => handleVote('right')}>Choose Right</button>
      </div>

      {/* Image Modal */}
      {showModal && selectedImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg relative w-3/4">
            <button className="absolute top-4 right-4 text-2xl" onClick={() => setShowModal(false)}>×</button>
            <img src={selectedImage.url} alt={selectedImage.name} className="w-full h-80 object-cover" />
            <div className="mt-4">
              <h2 className="text-xl font-bold">{selectedImage.name}</h2>
              <p className="mt-2">{selectedImage.description}</p>
              <p className="mt-1">Rating: {selectedImage.rating}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;
