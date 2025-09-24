// Debug component to monitor game state without affecting performance
import React, { useState, useEffect } from "react";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";
import { useGameState } from "../hooks/useGameState";

const GameStateDebugger: React.FC = () => {
  const { getState } = useGameState();
  const [debugInfo, setDebugInfo] = useState({
    currentRoom: null,
    gamePhase: "exploration",
    actionCardsVisible: false,
    eventCount: 0,
  });

  useEffect(() => {
    let eventCount = 0;

    const unsubscribeRoomEnter = gameEvents.on(
      GAME_EVENTS.ROOM_ENTER,
      (room) => {
        eventCount++;
        setDebugInfo((prev) => ({
          ...prev,
          currentRoom: room?.id || null,
          eventCount,
        }));
      }
    );

    const unsubscribeRoomExit = gameEvents.on(GAME_EVENTS.ROOM_EXIT, (room) => {
      eventCount++;
      setDebugInfo((prev) => ({
        ...prev,
        currentRoom: null,
        eventCount,
      }));
    });

    const unsubscribeGamePhase = gameEvents.on(
      GAME_EVENTS.GAME_PHASE_CHANGE,
      (phase) => {
        eventCount++;
        setDebugInfo((prev) => ({
          ...prev,
          gamePhase: phase,
          eventCount,
        }));
      }
    );

    const unsubscribeActionCards = gameEvents.on(
      GAME_EVENTS.ACTION_CARD_SHOW,
      () => {
        eventCount++;
        setDebugInfo((prev) => ({
          ...prev,
          actionCardsVisible: true,
          eventCount,
        }));
      }
    );

    const unsubscribeActionCardsHide = gameEvents.on(
      GAME_EVENTS.ACTION_CARD_HIDE,
      () => {
        eventCount++;
        setDebugInfo((prev) => ({
          ...prev,
          actionCardsVisible: false,
          eventCount,
        }));
      }
    );

    return () => {
      unsubscribeRoomEnter();
      unsubscribeRoomExit();
      unsubscribeGamePhase();
      unsubscribeActionCards();
      unsubscribeActionCardsHide();
    };
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontSize: "12px",
        fontFamily: "monospace",
        zIndex: 1000,
        minWidth: "200px",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#00ff00" }}>
        Game State Debug
      </h4>
      <div>Room: {debugInfo.currentRoom || "None"}</div>
      <div>Phase: {debugInfo.gamePhase}</div>
      <div>Cards: {debugInfo.actionCardsVisible ? "Visible" : "Hidden"}</div>
      <div>Events: {debugInfo.eventCount}</div>
      <div style={{ marginTop: "10px", fontSize: "10px", color: "#888" }}>
        Event-driven state management active
      </div>
    </div>
  );
};

export default GameStateDebugger;
