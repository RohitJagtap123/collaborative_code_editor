import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";

axios.defaults.withCredentials = true;

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false); // Spinner state

  // Create a new room
  const createNewRoom = async (e) => {
    e.preventDefault();
    try {
      const id = uuidV4();
      const response = await axios.post(
        "http://localhost:5001/api/createRoom",
        {
          id,
          owner: username, // Set the creator as the room owner
        }
      );

      if (response.data.success) {
        setRoomId(id);
        setUsername("Owner");
        toast.success("Created a new room");
        navigate(`/editor/${id}`, {
          state: { username: "Owner", isOwner: true },
        });
      } else {
        toast.error("Failed to create room");
      }
    } catch (error) {
      toast.error("Error creating room");
      console.error(error);
    }
  };

  // Request to join a room
  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username are required");
      return;
    }

    try {
      setLoading(true); // Show spinner
      const response = await axios.post(
        "http://localhost:5001/api/requestAccess",
        { roomId, username }, // Ensure username is sent
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Access request sent to the room owner");

        let approved = false;
        let retryCount = 0;
        const maxRetries = 20; // Prevent infinite loop (e.g., 20 tries ~60 seconds)

        while (!approved && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000)); // Poll every 3s
          retryCount++;

          const statusResponse = await axios.get(
            `http://localhost:5001/api/check-access?roomId=${roomId}`,
            { withCredentials: true }
          );

          if (statusResponse.data.status === "approved") {
            approved = true;
            toast.success("Access approved! Redirecting...");
            setLoading(false);
            navigate(`/editor/${roomId}`, { state: { username } }); // Redirect properly
          } else if (statusResponse.data.status === "denied") {
            toast.error("Access denied!");
            setLoading(false);
            return;
          }
        }

        if (!approved) {
          toast.error("Request timed out! Please try again later.");
        }
      } else {
        toast.error(response.data.message || "Failed to request access");
      }
    } catch (error) {
      toast.error("Error sending access request");
      console.error(error);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
        <img className="w-24 mx-auto mb-6" src="Logo.PNG" alt="logo" />
        <h4 className="text-2xl font-semibold mb-4">
          Paste invitation ROOM ID
        </h4>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ROOM ID"
            onChange={(e) => setRoomId(e.target.value)}
            value={roomId}
          />
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />
          <button
            className="w-full p-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
            onClick={joinRoom}
          >
            Request to Join
          </button>
          <span className="block text-sm text-gray-600 mt-4">
            If you don't have an invite,{" "}
            <a
              onClick={createNewRoom}
              href="#"
              className="text-blue-500 hover:underline cursor-pointer"
            >
              create a new room
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Home;
