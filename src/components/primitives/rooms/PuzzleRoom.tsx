import React, { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import PuzzleRouter from "../../PuzzleRouter";
import RoomActionCards from "../../RoomActionCards";
import { useRoomActions } from "../../../hooks/useRoomActions";
import type { Puzzle } from "../../../types/map";
import type { PuzzleType } from "../../PuzzleRouter";

interface PuzzleRoomProps {
  puzzle: Puzzle;
  onPuzzleComplete: () => void;
}

const PuzzleRoom: React.FC<PuzzleRoomProps> = ({
  puzzle,
  onPuzzleComplete,
}) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showPuzzle, setShowPuzzle] = useState(false);

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "puzzle",
    onPuzzleStart: () => setShowPuzzle(true),
  });

  // Map puzzle type to our puzzle types
  const getPuzzleType = (): PuzzleType => {
    switch (puzzle.type) {
      case "memory-pairs":
        return "memory";
      case "sequence":
        return "sequence";
      case "number":
        return "number";
      default:
        return "memory";
    }
  };

  // Get difficulty based on puzzle difficulty
  const getDifficulty = (): "easy" | "medium" | "hard" => {
    if (typeof puzzle.difficulty === "number") {
      if (puzzle.difficulty <= 2) return "easy";
      if (puzzle.difficulty <= 4) return "medium";
      return "hard";
    }
    return "medium";
  };

  const handlePuzzleComplete = () => {
    setIsCompleted(true);
    setShowReward(true);
    setShowPuzzle(false);
    onPuzzleComplete();
  };

  return (
    <group>
      {/* Puzzle Table - Simple 3D model */}
      <RigidBody type="fixed" colliders="trimesh">
        <group position={[0, 0, 0]}>
          {/* Table Top */}
          <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[4, 0.1, 4]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          {/* Table Legs */}
          {[
            [-1.8, -1.8],
            [1.8, -1.8],
            [-1.8, 1.8],
            [1.8, 1.8],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.2, z]}>
              <boxGeometry args={[0.2, 0.4, 0.2]} />
              <meshLambertMaterial color="#654321" />
            </mesh>
          ))}
        </group>
      </RigidBody>

      {/* Puzzle Table */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[3.5, 0.2, 3.5]} />
          <meshStandardMaterial
            color={isCompleted ? "#4CAF50" : "#8B4513"}
            emissive={isCompleted ? "#4CAF50" : "#000000"}
            emissiveIntensity={isCompleted ? 0.2 : 0}
          />
        </mesh>

        {/* Puzzle Icon */}
        <Text
          position={[0, 0.6, 0]}
          fontSize={0.8}
          color={isCompleted ? "#00ff00" : "#ffffff"}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {isCompleted ? "✓ COMPLETED" : "🧩 PUZZLE"}
        </Text>
      </group>

      {/* Room Decoration - Puzzle Symbols */}
      <group position={[-3, 1, -3]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#9B59B6" />
        </mesh>
        {/* Puzzle icon - Simple colored sphere */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>

      <group position={[3, 1, -3]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#9B59B6" />
        </mesh>
        {/* Target icon - Simple colored sphere */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#FF5722" />
        </mesh>
      </group>

      <group position={[-3, 1, 3]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#9B59B6" />
        </mesh>
        {/* Search icon - Simple colored sphere */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#2196F3" />
        </mesh>
      </group>

      <group position={[3, 1, 3]}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#9B59B6" />
        </mesh>
        {/* Lightbulb icon - Simple colored sphere */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#FFD700" />
        </mesh>
      </group>

      {/* Room Label - Simple colored cube */}
      {/* Puzzle Title - Large visible sign */}
      <mesh position={[0, 3, 0]}>
        <boxGeometry args={[4, 0.5, 0.2]} />
        <meshBasicMaterial color="#9B59B6" />
      </mesh>

      {/* Puzzle Title Text */}
      <Text
        position={[0, 3, 0.15]}
        fontSize={0.8}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        PUZZLE ROOM
      </Text>

      {/* Puzzle Indicator - Large purple diamond */}
      <mesh position={[0, 4, 0]}>
        <octahedronGeometry args={[1.5]} />
        <meshBasicMaterial color="#9B59B6" />
      </mesh>

      {/* Completion Status */}
      <mesh position={[0, 2.5, 0]}>
        <boxGeometry args={[1.5, 0.2, 0.1]} />
        <meshBasicMaterial color={isCompleted ? "#4CAF50" : "#F44336"} />
      </mesh>
      <Text
        position={[0, 2.5, 0.15]}
        fontSize={0.4}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {isCompleted ? "COMPLETED" : "IN PROGRESS"}
      </Text>

      {/* Reward Display */}
      {showReward && (
        <group position={[0, 1.5, 0]}>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
          </mesh>
          {/* Reward icon - Simple colored sphere */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          {/* Claim text - Simple colored cube */}
          <mesh position={[0, -1, 0]}>
            <boxGeometry args={[1.5, 0.2, 0.1]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
        </group>
      )}

      {/* Instructions */}
      <Text
        position={[0, -2, 0]}
        fontSize={0.4}
        color={isCompleted ? "#00ff00" : "#ffffff"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {isCompleted
          ? "Puzzle completed! Use action cards to replay."
          : "Use action cards below to solve the puzzle!"}
      </Text>

      {/* Puzzle Overlay */}
      <PuzzleRouter
        isVisible={showPuzzle}
        onClose={() => setShowPuzzle(false)}
        puzzleType={getPuzzleType()}
        difficulty={getDifficulty()}
        roomTitle="🧩 Puzzle Room"
        roomSubtitle="Test your memory and concentration!"
        onComplete={handlePuzzleComplete}
      />

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "solve_puzzle") {
            setShowPuzzle(true);
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default PuzzleRoom;
