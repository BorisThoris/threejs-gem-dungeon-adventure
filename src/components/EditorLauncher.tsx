import React, { useState } from "react";
import ThreeDEditor from "./ThreeDEditor";

const EditorLauncher: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);

  if (showEditor) {
    return <ThreeDEditor />;
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1e1e1e, #2d2d2d)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          textAlign: "center",
          background: "rgba(0,0,0,0.8)",
          padding: "40px",
          borderRadius: "20px",
          border: "2px solid #4CAF50",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <h1
          style={{
            fontSize: "3rem",
            margin: "0 0 20px 0",
            background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 20px rgba(76, 175, 80, 0.5)",
          }}
        >
          🎮 3D Editor
        </h1>

        <p
          style={{
            fontSize: "1.2rem",
            margin: "0 0 30px 0",
            color: "#cccccc",
            maxWidth: "500px",
            lineHeight: "1.6",
          }}
        >
          Explore and preview all your 3D rooms, objects, and components in an
          interactive 3D environment.
        </p>

        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#4CAF50", marginBottom: "15px" }}>Features:</h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🏠</span>
              <span>Room Gallery</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🎯</span>
              <span>3D Objects</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🔍</span>
              <span>Single View</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>📋</span>
              <span>Grid View</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🎪</span>
              <span>Showcase</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "1.5rem" }}>🎮</span>
              <span>Orbit Controls</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowEditor(true)}
          style={{
            background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
            color: "white",
            border: "none",
            padding: "15px 40px",
            fontSize: "1.2rem",
            fontWeight: "bold",
            borderRadius: "50px",
            cursor: "pointer",
            boxShadow: "0 5px 15px rgba(76, 175, 80, 0.4)",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow =
              "0 8px 25px rgba(76, 175, 80, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 5px 15px rgba(76, 175, 80, 0.4)";
          }}
        >
          🚀 Launch Editor
        </button>

        <div
          style={{
            marginTop: "20px",
            fontSize: "0.9rem",
            color: "#888",
            fontStyle: "italic",
          }}
        >
          Press ESC to return to this screen
        </div>
      </div>
    </div>
  );
};

export default EditorLauncher;
