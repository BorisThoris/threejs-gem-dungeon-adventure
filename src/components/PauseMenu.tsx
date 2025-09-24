import React from "react";

interface PauseMenuProps {
  isVisible: boolean;
  onUnpause: () => void;
}

const PauseMenu: React.FC<PauseMenuProps> = ({ isVisible, onUnpause }) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
        color: "white",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{ fontSize: "3rem", margin: "0 0 2rem 0", textAlign: "center" }}
      >
        GAME PAUSED
      </h1>

      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p style={{ fontSize: "1.2rem", margin: "0 0 1rem 0" }}>
          Press X to unpause
        </p>
        <p style={{ fontSize: "1rem", opacity: 0.7, margin: 0 }}>
          Or click the button below
        </p>
      </div>

      <button
        onClick={onUnpause}
        style={{
          padding: "15px 30px",
          fontSize: "1.5rem",
          backgroundColor: "#00ff00",
          color: "black",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontFamily: "monospace",
          fontWeight: "bold",
          transition: "all 0.3s ease",
          boxShadow: "0 4px 15px rgba(0, 255, 0, 0.3)",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#00cc00";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "#00ff00";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        Lol, unpause
      </button>

      <div style={{ marginTop: "2rem", fontSize: "0.9rem", opacity: 0.5 }}>
        <p>Controls:</p>
        <p>WASD - Move | Mouse - Look around | Click - Interact</p>
      </div>
    </div>
  );
};

export default PauseMenu;
