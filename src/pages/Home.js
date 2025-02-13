import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";
import { motion } from "framer-motion";

axios.defaults.withCredentials = true;

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & Username are required");
      return;
    }

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 text-gray-900">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-xl text-center">
        {/* Header */}
        <div className="flex justify-center mb-6">
          <img src="Logo.png" className="w-60 h-12" />
        </div>

        <h2 className="text-3xl font-semibold">Collaborative Code Editor</h2>
        <p className="text-gray-600 text-lg mt-2">
          Connect, collaborate, and code from anywhere with us.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={createNewRoom}
            className="bg-blue-500 text-white w-full sm:w-45 py-2 rounded-full font-medium shadow-md hover:bg-blue-600 transition"
          >
            + Create Room
          </button>

          <div className="flex items-center border-2 border-gray-300 rounded-full px-4 py-3 w-full">
            <input
              type="text"
              placeholder="Enter room id"
              className="w-full focus:outline-none text-center"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              onKeyUp={handleInputEnter}
            />
            <button
              onClick={joinRoom}
              className="text-blue-500 font-semibold ml-3 disabled:text-gray-400"
              disabled={!roomId || !username}
            >
              Join
            </button>
          </div>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter your username"
            className="w-full border-2 border-gray-300 rounded-full px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
