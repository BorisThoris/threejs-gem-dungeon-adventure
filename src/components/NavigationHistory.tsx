import React, { useState, useEffect } from "react";
import { roomNavigationSystem } from "../systems/RoomNavigationSystem";

interface NavigationHistoryProps {
  onRoomSelect?: (roomId: string) => void;
  maxHistoryItems?: number;
  showRoomNames?: boolean;
}

const NavigationHistory: React.FC<NavigationHistoryProps> = ({
  onRoomSelect,
  maxHistoryItems = 5,
  showRoomNames = true,
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    const updateHistory = () => {
      const navHistory = roomNavigationSystem.getHistory();
      const state = roomNavigationSystem.getState();

      setHistory(navHistory.slice(0, maxHistoryItems));
      setCurrentRoomId(state.currentRoomId);
    };

    // Initial update
    updateHistory();

    // Listen for history changes
    const handleHistoryUpdate = () => updateHistory();
    roomNavigationSystem.on("roomChanged", handleHistoryUpdate);

    return () => {
      roomNavigationSystem.off("roomChanged", handleHistoryUpdate);
    };
  }, [maxHistoryItems]);

  const handleRoomSelect = (roomId: string) => {
    roomNavigationSystem.startTransition(roomId);
    onRoomSelect?.(roomId);
  };

  const handleGoBack = () => {
    roomNavigationSystem.goBack();
  };

  const formatRoomName = (roomId: string) => {
    if (!showRoomNames) return roomId;
    return roomId.replace("room_", "Room ").replace("_", " ");
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 1000,
        minWidth: "200px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        🗺️ Navigation History
      </div>

      {/* Current room */}
      {currentRoomId && (
        <div
          style={{
            marginBottom: "8px",
            padding: "4px 8px",
            background: "rgba(0, 255, 0, 0.2)",
            borderRadius: "4px",
            border: "1px solid #00FF00",
          }}
        >
          <strong>📍 Current: {formatRoomName(currentRoomId)}</strong>
        </div>
      )}

      {/* History items */}
      <div style={{ marginBottom: "8px" }}>
        {history.map((roomId, index) => (
          <div
            key={roomId}
            onClick={() => handleRoomSelect(roomId)}
            style={{
              padding: "4px 8px",
              margin: "2px 0",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "background 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            <span style={{ fontSize: "10px", opacity: 0.7 }}>{index + 1}.</span>
            <span>{formatRoomName(roomId)}</span>
            <span style={{ fontSize: "10px", opacity: 0.5 }}>←</span>
          </div>
        ))}
      </div>

      {/* Go back button */}
      <button
        onClick={handleGoBack}
        disabled={history.length === 0}
        style={{
          width: "100%",
          padding: "6px",
          background:
            history.length > 0
              ? "rgba(0, 150, 255, 0.8)"
              : "rgba(100, 100, 100, 0.5)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: history.length > 0 ? "pointer" : "not-allowed",
          fontSize: "11px",
          fontWeight: "bold",
        }}
      >
        ⬅️ Go Back
      </button>

      {/* Clear history button */}
      {history.length > 0 && (
        <button
          onClick={() => roomNavigationSystem.clearHistory()}
          style={{
            width: "100%",
            padding: "4px",
            marginTop: "4px",
            background: "rgba(255, 100, 100, 0.8)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "10px",
          }}
        >
          🗑️ Clear History
        </button>
      )}

      {/* History stats */}
      <div
        style={{
          marginTop: "8px",
          padding: "4px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
          fontSize: "10px",
          opacity: 0.7,
        }}
      >
        {history.length} room{history.length !== 1 ? "s" : ""} visited
      </div>
    </div>
  );
};

export default NavigationHistory;
