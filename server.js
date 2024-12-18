const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server);

const axios = require("axios");
const cors = require("cors");
require("dotenv").config();


// Middleware
app.use(cors());
app.use(express.json());



const JUDGE0_API_BASE_URL = process.env.JUDGE0_API_BASE_URL || "https://judge0-ce.p.rapidapi.com";
;
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY; // Store your RapidAPI key in .env
const JUDGE0_API_HOST = "judge0-ce.p.rapidapi.com"; // Judge0 API Host


app.get("/", (req, res) => {
    res.json({ message: "Code Execution API is running!" });
  });



  // Route to Submit Code for Execution
app.post("/api/run-code", async (req, res) => {
    const { language_id, source_code, stdin } = req.body;
  
    if (!language_id || !source_code) {
      return res.status(400).json({ error: "Language ID and source code are required!" });
    }
  
    try {
      // Submit code to Judge0 API
      const submissionResponse = await axios.post(
        `${process.env.JUDGE0_API_BASE_URL}/submissions`,
        {
          language_id,
          source_code,
          stdin,
          base64_encoded: true, // Encode request data in base64
        },
        {
          headers: {
            "X-RapidAPI-Key":"6eb6835bf9msh41cf638713f7db0p1be9b8jsn469ea9d25832",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            "Content-Type": "application/json",
          },
        }
      );
  
      // Return token to the client for fetching output
      res.json({ token: submissionResponse.data.token });
    } catch (error) {
      console.error("Error while submitting code:", error.message);
      res.status(500).json({ error: "Failed to submit code for execution." });
    }
  });

  
  // Route to Fetch Code Execution Result Using Token
app.get("/api/get-output/:token", async (req, res) => {
    const { token } = req.params;
  
    if (!token) {
      return res.status(400).json({ error: "Token is required!" });
    }
  
    try {
      // Fetch result from Judge0 using the provided token
      const result = await axios.get(`${process.env.JUDGE0_API_BASE_URL}/submissions/${token}`, {
        params: { base64_encoded: true, fields: "*" },
        headers: {
          "X-RapidAPI-Key":'6eb6835bf9msh41cf638713f7db0p1be9b8jsn469ea9d25832',
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      });
  
      if (result.data.status.id <= 2) {
        // Status 1: In Queue, 2: Processing - Client should poll again
        return res.json({ status: "Processing", output: "Execution is still in progress..." });
      }
  
      // Decode base64 encoded responses
      const decodedOutput = Buffer.from(result.data.stdout || "", "base64").toString("utf-8");
      const decodedError = Buffer.from(result.data.stderr || "", "base64").toString("utf-8");
      const decodedCompileOutput = Buffer.from(result.data.compile_output || "", "base64").toString("utf-8");
  
      // Return output, error, or compilation output
      res.json({
        status: result.data.status.description,
        output: decodedOutput || decodedError || decodedCompileOutput,
      });
    } catch (error) {
      console.error("Error while fetching output:", error.message);
      res.status(500).json({ error: "Failed to fetch code execution result." });
    }
  });
  
 


const userSocketMap = {};
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));























//1d-> const express = require('express');
// const app = express();
// const http = require('http');
// const path = require('path');
// const { Server } = require('socket.io');
// const ACTIONS = require('./src/Actions');

// const server = http.createServer(app);
// const io = new Server(server);


// const userSocketMap = {};
// function getAllConnectedClients(roomId) {
//     // Map
//     return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
//         (socketId) => {
//             return {
//                 socketId,
//                 username: userSocketMap[socketId],
//             };
//         }
//     );
// }

// io.on('connection', (socket) => {
//     console.log('socket connected', socket.id);

//     socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
//         userSocketMap[socket.id] = username;
//         socket.join(roomId);
//         const clients = getAllConnectedClients(roomId);
//         clients.forEach(({ socketId }) => {
//             io.to(socketId).emit(ACTIONS.JOINED, {
//                 clients,
//                 username,
//                 socketId: socket.id,
//             });
//         });
//     });

//     socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
//         socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
//         io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
//     });

//     socket.on('disconnecting', () => {
//         const rooms = [...socket.rooms];
//         rooms.forEach((roomId) => {
//             socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
//                 socketId: socket.id,
//                 username: userSocketMap[socket.id],
//             });
//         });
//         delete userSocketMap[socket.id];
//         socket.leave();
//     });
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));