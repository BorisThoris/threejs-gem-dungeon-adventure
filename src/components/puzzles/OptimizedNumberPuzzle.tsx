import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../../store/gameStore";
import { useGameTimer } from "../../hooks/useGameTimer";

interface OptimizedNumberPuzzleProps {
  onComplete: () => void;
  difficulty: "easy" | "medium" | "hard";
}

const OptimizedNumberPuzzle: React.FC<OptimizedNumberPuzzleProps> = ({
  onComplete,
  difficulty,
}) => {
  const { addPoints, addExperience } = useGameStore();
  const [numbers, setNumbers] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<string>("");
  const [gameComplete, setGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showNumbers, setShowNumbers] = useState(true);

  const sequenceLength =
    difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;
  const numberRange =
    difficulty === "easy" ? 10 : difficulty === "medium" ? 20 : 50;

  // Use event-driven timer instead of React state
  const { timeLeft, isRunning, isComplete, start, reset } = useGameTimer({
    id: `number-puzzle-${difficulty}`,
    duration: 45,
    onComplete: () => {
      // Time's up - reset puzzle
      setPlayerInput("");
      setMoves(0);
      setShowNumbers(true);
      setNumbers(generateNewNumbers());
      reset();
    },
    onTick: (remainingTime) => {
      // Optional: Add visual feedback based on time remaining
      if (remainingTime < 10) {
        // Could emit events for visual effects
      }
    },
    autoStart: false, // We'll start it manually
  });

  // Generate new numbers
  const generateNewNumbers = useCallback(() => {
    return Array.from(
      { length: sequenceLength },
      () => Math.floor(Math.random() * numberRange) + 1
    );
  }, [sequenceLength, numberRange]);

  // Initialize puzzle
  useEffect(() => {
    const newNumbers = generateNewNumbers();
    setNumbers(newNumbers);
    setShowNumbers(true);
    setPlayerInput("");
    setMoves(0);
    setGameComplete(false);

    // Start timer after a short delay
    setTimeout(() => {
      start();
    }, 1000);
  }, [difficulty, start, generateNewNumbers]);

  // Hide numbers after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNumbers(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [numbers]);

  // Check for completion
  useEffect(() => {
    if (playerInput.length === sequenceLength) {
      const inputNumbers = playerInput.split("").map(Number);
      const isCorrect = numbers.every(
        (num, index) => num === inputNumbers[index]
      );

      if (isCorrect) {
        setGameComplete(true);
        const points = Math.max(200, 400 - moves * 15 + timeLeft * 4);
        addPoints(points);
        addExperience(points * 0.5);

        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setPlayerInput("");
        setMoves((prev) => prev + 1);
      }
    }
  }, [
    playerInput,
    numbers,
    sequenceLength,
    moves,
    timeLeft,
    addPoints,
    addExperience,
    onComplete,
  ]);

  // Memoize the number display to prevent unnecessary re-renders
  const numberDisplay = useMemo(() => {
    if (showNumbers) {
      return (
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          {numbers.map((num, index) => (
            <div
              key={index}
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#4CAF50",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "5px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {num}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "18px",
          color: "#666",
        }}
      >
        Numbers hidden! Enter the sequence:
      </div>
    );
  }, [showNumbers, numbers]);

  // Memoize the input display
  const inputDisplay = useMemo(() => {
    return (
      <div
        style={{
          display: "flex",
          gap: "5px",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        {Array.from({ length: sequenceLength }, (_, index) => (
          <input
            key={index}
            type="text"
            value={playerInput[index] || ""}
            onChange={(e) => {
              const newInput = playerInput.split("");
              newInput[index] = e.target.value;
              setPlayerInput(newInput.join(""));
            }}
            style={{
              width: "30px",
              height: "30px",
              textAlign: "center",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "3px",
            }}
            maxLength={1}
            disabled={gameComplete}
          />
        ))}
      </div>
    );
  }, [playerInput, sequenceLength, gameComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "30px",
        borderRadius: "10px",
        textAlign: "center",
        zIndex: 1000,
        minWidth: "400px",
        border: "2px solid #4CAF50",
      }}
    >
      <h2 style={{ marginBottom: "20px", color: "#4CAF50" }}>
        Number Sequence Puzzle ({difficulty.toUpperCase()})
      </h2>

      {numberDisplay}

      {!showNumbers && !gameComplete && (
        <>
          {inputDisplay}

          <div style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <span style={{ color: timeLeft < 10 ? "#ff0000" : "#00ff00" }}>
                Time: {Math.ceil(timeLeft)}s
              </span>
              <span style={{ margin: "0 20px" }}>Moves: {moves}</span>
            </div>
          </div>
        </>
      )}

      {gameComplete && (
        <div style={{ color: "#4CAF50", fontSize: "18px", marginTop: "20px" }}>
          🎉 Puzzle Complete! 🎉
          <br />+{Math.max(200, 400 - moves * 15 + timeLeft * 4)} points!
        </div>
      )}

      {isComplete && !gameComplete && (
        <div style={{ color: "#ff0000", fontSize: "18px", marginTop: "20px" }}>
          ⏰ Time's up! Try again!
        </div>
      )}
    </div>
  );
};

export default OptimizedNumberPuzzle;
