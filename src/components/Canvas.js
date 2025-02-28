import React, { useRef, useEffect, useState } from "react";

const Canvas = ({ socketRef, roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000"); // Default black color

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Set initial canvas properties
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctxRef.current = ctx;

    const startDrawing = (event) => {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(
        event.clientX - canvas.offsetLeft,
        event.clientY - canvas.offsetTop
      );
    };

    const draw = (event) => {
      if (!isDrawing) return;
      ctx.lineTo(
        event.clientX - canvas.offsetLeft,
        event.clientY - canvas.offsetTop
      );
      ctx.stroke();

      // Emit drawing data
      if (socketRef.current) {
        socketRef.current.emit("drawing", {
          roomId,
          x: event.clientX - canvas.offsetLeft,
          y: event.clientY - canvas.offsetTop,
          color,
        });
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      ctx.beginPath();
    };

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Listen for drawing data from other users
    if (socketRef.current) {
      socketRef.current.on("drawing", ({ x, y, color }) => {
        ctx.strokeStyle = color;
        ctx.lineTo(x, y);
        ctx.stroke();
      });
    }

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
    };
  }, [socketRef, roomId, isDrawing, color]);

  // Function to clear the canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      style={{ position: "absolute", top: "50px", left: "350px", zIndex: 100 }}
    >
      {/* Toolbar */}
      <div style={{ marginBottom: "10px" }}>
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={clearCanvas} style={{ marginLeft: "10px" }}>
          Clear
        </button>
      </div>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{ border: "2px solid black", background: "white" }}
      />
    </div>
  );
};

export default Canvas;
