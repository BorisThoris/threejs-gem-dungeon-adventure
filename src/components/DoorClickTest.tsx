import React, { useState, useEffect } from "react";

const DoorClickTest: React.FC = () => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState<string>("Never");

  useEffect(() => {
    const handleDoorClick = () => {
      setClickCount((prev) => prev + 1);
      setLastClickTime(new Date().toLocaleTimeString());
    };

    // Listen for door click events
    window.addEventListener("doorClick", handleDoorClick);

    return () => {
      window.removeEventListener("doorClick", handleDoorClick);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "260px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <div>
        <strong>Door Click Test</strong>
      </div>
      <div>Door Clicks: {clickCount}</div>
      <div>Last Click: {lastClickTime}</div>
      <div style={{ color: "#4CAF50" }}>
        Status: {clickCount > 0 ? "✅ Working" : "⏳ Waiting"}
      </div>
    </div>
  );
};

export default DoorClickTest;
