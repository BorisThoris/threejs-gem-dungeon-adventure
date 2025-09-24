import React, { useState, useEffect } from "react";
import OptimizedNumberPuzzle from "./puzzles/OptimizedNumberPuzzle";
import { useGameTimer } from "../hooks/useGameTimer";

interface OptimizedPuzzleRouterProps {
  isVisible: boolean;
  onComplete: () => void;
  onExit: () => void;
  puzzleType?: "memory" | "sequence" | "number";
  difficulty?: "easy" | "medium" | "hard";
}

const OptimizedPuzzleRouter: React.FC<OptimizedPuzzleRouterProps> = ({
  isVisible,
  onComplete,
  onExit,
  puzzleType = "number",
  difficulty = "medium",
}) => {
  const [currentPuzzle, setCurrentPuzzle] = useState<string | null>(null);

  // Use event-driven timer for puzzle timeout
  const { timeLeft, isRunning, start, stop, reset } = useGameTimer({
    id: "puzzle-timeout",
    duration: 60, // 60 second timeout
    onComplete: () => {
      // Auto-exit if puzzle takes too long
      onExit();
    },
    autoStart: false,
  });

  // Start puzzle timer when visible
  useEffect(() => {
    if (isVisible) {
      setCurrentPuzzle(puzzleType);
      start();
    } else {
      setCurrentPuzzle(null);
      stop();
    }
  }, [isVisible, puzzleType, start, stop]);

  // Handle puzzle completion
  const handlePuzzleComplete = () => {
    stop();
    onComplete();
  };

  // Handle puzzle exit
  const handlePuzzleExit = () => {
    stop();
    onExit();
  };

  if (!isVisible || !currentPuzzle) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Puzzle Timer Display */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "5px",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        <span style={{ color: timeLeft < 10 ? "#ff0000" : "#00ff00" }}>
          Time: {Math.ceil(timeLeft)}s
        </span>
      </div>

      {/* Exit Button */}
      <button
        onClick={handlePuzzleExit}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          backgroundColor: "#ff4444",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
        }}
      >
        Exit Puzzle
      </button>

      {/* Puzzle Content */}
      <div style={{ position: "relative" }}>
        {currentPuzzle === "number" && (
          <OptimizedNumberPuzzle
            onComplete={handlePuzzleComplete}
            difficulty={difficulty}
          />
        )}

        {/* Add other optimized puzzle types here */}
        {currentPuzzle === "memory" && (
          <div style={{ color: "white", fontSize: "24px" }}>
            Memory Puzzle (Coming Soon)
          </div>
        )}

        {currentPuzzle === "sequence" && (
          <div style={{ color: "white", fontSize: "24px" }}>
            Sequence Puzzle (Coming Soon)
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedPuzzleRouter;
