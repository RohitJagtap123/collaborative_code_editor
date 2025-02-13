import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { v4 as uuidV4 } from "uuid";

axios.defaults.withCredentials = true;

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(120);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let countdown;
    if (isTimerActive && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
      toast.error("Request timed out! Please try again later.");
      setLoading(false);
    }
    return () => clearInterval(countdown);
  }, [isTimerActive, timer]);

  const createNewRoom = async (e) => {
    e.preventDefault();
    try {
      const id = uuidV4();
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5001/api/createRoom",
        { id, owner: username }
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

  const joinRoom = async () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & username are required");
      return;
    }

    try {
      setLoading(true);

      // Step 1: Check if the user is the owner or already approved
      let checkResponse;
      try {
        checkResponse = await axios.get(
          `http://localhost:5001/api/checkUserRole?roomId=${roomId}&username=${username}`,
          { withCredentials: true }
        );
      } catch (error) {
        toast.error("Error verifying user role. Please try again.");
        console.error("Error in checkUserRole:", error);
        setLoading(false);
        return;
      }

      console.log("User role check response:", checkResponse.data);

      if (
        checkResponse.data.role === "owner" ||
        checkResponse.data.role === "approved"
      ) {
        toast.success("Access granted! Redirecting...");
        navigate(`/editor/${roomId}`, { state: { username } });
        return;
      }

      // Step 2: If not owner or approved, proceed to request access
      setIsTimerActive(true);
      setTimer(120);

      let response;
      try {
        response = await axios.post(
          "http://localhost:5001/api/requestAccess",
          { roomId, username },
          { withCredentials: true }
        );
      } catch (error) {
        toast.error("Access Denied !");
        console.error("Error in requestAccess:", error);
        setLoading(false);
        setIsTimerActive(false);
        return;
      }

      console.log("Requesting access...");
      console.log("API Response:", response.data);

      if (response.data.success) {
        toast.success("Access request sent to the room owner");

        let approved = false;
        let retryCount = 0;
        const maxRetries = 41;

        while (!approved && retryCount < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          retryCount++;

          let statusResponse;
          try {
            statusResponse = await axios.get(
              `http://localhost:5001/api/check-access?roomId=${roomId}&username=${username}`,
              { withCredentials: true }
            );
          } catch (error) {
            toast.error("Error checking access status.");
            console.error("Error in check-access:", error);
            setLoading(false);
            setIsTimerActive(false);
            return;
          }

          console.log("Access status response:", statusResponse.data);

          if (statusResponse.data.status === "approved") {
            approved = true;
            toast.success("Access approved! Redirecting...");
            setLoading(false);
            setIsTimerActive(false);
            navigate(`/editor/${roomId}`, { state: { username } });
            return;
          } else if (statusResponse.data.status === "denied") {
            toast.error("Access denied!");
            setLoading(false);
            setIsTimerActive(false);
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
      toast.error("Unexpected error occurred.");
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
            {loading ? "Processing..." : "Request to Join"}
          </button>

          {isTimerActive && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 font-semibold">
                Request expires in {Math.floor(timer / 60)}:
                {(timer % 60).toString().padStart(2, "0")} minutes
              </p>
              <div className="relative w-full h-2 bg-gray-300 rounded-full overflow-hidden mt-2">
                <div
                  className="absolute left-0 top-0 h-full bg-blue-500"
                  style={{ width: `${(timer / 120) * 100}%` }}
                ></div>
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
    </div>
  );
};

export default Home;
