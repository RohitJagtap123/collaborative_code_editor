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
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/api/createRoom",
        {
          id,
          owner: username,
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
    } finally {
      setLoading(false);
    }
  };

  // Request to join a room
  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username are required");
      return;
    }

    try {
      setLoading(true);

    //   // Step 1: Check if user was already approved before
    //   const checkAccessResponse = await axios.get(
    //     "http://localhost:5001/api/checkaccess1",
    //     { roomId, username },
    //     { withCredentials: true }
    //   );

    //   if (checkAccessResponse.data.status === "approved") {
    //     toast.success("You are already approved! Redirecting...");
    //     setLoading(false);
    //     navigate(`/editor/${roomId}`, { state: { username } });
    //     return; // Exit early, no need to request access again
    //   }
    //   else{
    //     console.log("Check Access Response", checkAccessResponse.data);
    //   }


      // Step 2: If not approved, send a request
      const response = await axios.post(
        "http://localhost:5001/api/requestAccess",
        { roomId, username },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success("Access request sent to the room owner");

        let approved = false;
        let retryCount = 0;
        const maxRetries = 20;

        while (!approved && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          retryCount++;

          const statusResponse = await axios.get(
            `http://localhost:5001/api/check-access?roomId=${roomId}&username=${username}`,
            { withCredentials: true }
          );

          if (statusResponse.data.status === "approved") {
            approved = true;
            toast.success("Access approved! Redirecting...");
            setLoading(false);
            navigate(`/editor/${roomId}`, { state: { username } });
            return;
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
      toast.error("Error checking or requesting access");
      console.error(error);
    } finally {
      setLoading(false);
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
            disabled={loading}
          />
          <input
            type="text"
            className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="USERNAME"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            disabled={loading}
          />
          <button
            className={`w-full p-3 text-white rounded-md transition duration-300 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            onClick={joinRoom}
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h4l-3 3 3 3h-4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8H1l3-3-3-3h4z"
                  />
                </svg>
                Processing...
              </div>
            ) : (
              "Request to Join"
            )}
          </button>

          {/* Progress Slider & Message */}
          {loading && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 font-semibold">
                Ask the owner to check mail and approve request
              </p>
              <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-500 animate-slide"></div>
              </div>
            </div>
          )}

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

      {/* Tailwind Animation */}
      <style>
        {`
          @keyframes slide {
            0% { left: -33%; }
            100% { left: 100%; }
          }
          .animate-slide {
            animation: slide 1.5s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Home;
