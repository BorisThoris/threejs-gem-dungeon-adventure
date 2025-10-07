import React, { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useConsolidatedGameStore } from "../../../store/consolidatedGameStore";
import { getBiomeScale } from "../../../utils/biomeScaling";
import RoomActionCards from "../../RoomActionCards";
import { useRoomActions } from "../../../hooks/useRoomActions";
import Table from "../elements/Table";
import Candle from "../elements/Candle";

interface MemoryGamePuzzleBiomeProps {
  size?: number;
  onPuzzleComplete?: () => void;
  onRoomComplete?: () => void;
  onDoorsLock?: () => void;
  onDoorsUnlock?: () => void;
}

interface MemoryBlock {
  id: number;
  position: [number, number, number];
  color: string;
  emissiveColor: string;
  pattern: number[];
}

const MemoryGamePuzzleBiome: React.FC<MemoryGamePuzzleBiomeProps> = ({
  onPuzzleComplete,
  onRoomComplete,
  onDoorsLock,
  onDoorsUnlock,
  size = 10,
}) => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState<
    "waiting" | "showing" | "playing" | "completed"
  >("waiting");
  const [currentPattern, setCurrentPattern] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);

  // Candle state management
  const [candlesLit, setCandlesLit] = useState([true, true]); // 2 candles
  const [wrongGuesses, setWrongGuesses] = useState(0);

  // Visual feedback states
  const [shakingBlocks, setShakingBlocks] = useState<Set<number>>(new Set());
  const [redBlocks, setRedBlocks] = useState<Set<number>>(new Set());
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [failureEffect, setFailureEffect] = useState(false);

  // Use ref to maintain stable pattern reference
  const patternRef = useRef<number[]>([]);
  // Track timeouts to avoid orphan animations
  const activeTimeouts = useRef<number[]>([]);

  // Refs for animated elements
  const blockRefs = useRef<THREE.Mesh[]>([]);
  const bookRef = useRef<THREE.Mesh>(null);

  // Utility: register timeout so we can clear on phase changes
  const addTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    activeTimeouts.current.push(id);
    return id;
  };

  // Utility: clear all outstanding timeouts
  const clearActiveTimeouts = () => {
    activeTimeouts.current.forEach((id) => clearTimeout(id));
    activeTimeouts.current = [];
  };

  // Utility: reset all blocks to default visuals
  const resetAllBlocksVisuals = () => {
    blockRefs.current.forEach((ref, index) => {
      if (!ref) return;
      ref.scale.set(1, 1, 1);
      ref.rotation.x = 0;
      ref.rotation.z = 0;
      const mat = ref.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissiveIntensity !== undefined) {
        const isRed = redBlocks.has(index);
        mat.emissiveIntensity = isRed ? 0.8 : 0.2;
      }
      // Ensure position returns to base for shake recovery
      const base = memoryBlocks[index].position;
      ref.position.x = base[0];
      ref.position.y = base[1];
      ref.position.z = base[2];
    });
  };

  const playerDimensions = useConsolidatedGameStore(
    (state) => state.playerStats.dimensions
  );
  const scale = getBiomeScale(playerDimensions);
  const biomeSize = size;

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "puzzle",
  });

  // Get game store for health management
  const { playerStats, loseLife, addExperience, addPoints } =
    useConsolidatedGameStore();

  // Memory blocks configuration
  const memoryBlocks: MemoryBlock[] = [
    {
      id: 0,
      position: [-1.5, 2, 0],
      color: "#FF6B6B",
      emissiveColor: "#FF4444",
      pattern: [0],
    },
    {
      id: 1,
      position: [1.5, 2, 0],
      color: "#4ECDC4",
      emissiveColor: "#44CCCC",
      pattern: [1],
    },
    {
      id: 2,
      position: [-1.5, 0.5, 0],
      color: "#45B7D1",
      emissiveColor: "#44AACC",
      pattern: [2],
    },
    {
      id: 3,
      position: [1.5, 0.5, 0],
      color: "#96CEB4",
      emissiveColor: "#88CCAA",
      pattern: [3],
    },
  ];

  // Generate random pattern
  const generatePattern = (length: number): number[] => {
    const pattern = Array.from({ length }, () => Math.floor(Math.random() * 4));
    console.log("DEBUG: Generated pattern:", pattern);
    return pattern;
  };

  // Start the memory game
  const startMemoryGame = () => {
    if (gameStarted) return;

    setGameStarted(true);
    setGamePhase("showing");
    const newPattern = generatePattern(level + 2); // Start with 3 steps, increase by 1 each level
    console.log("DEBUG: Setting current pattern to:", newPattern);
    setCurrentPattern(newPattern);
    patternRef.current = newPattern; // Update ref as well
    setPlayerSequence([]);
    setCurrentStep(0);

    // Reset candle states
    setCandlesLit([true, true]);
    setWrongGuesses(0);
    setRedBlocks(new Set());
    setShakingBlocks(new Set());
    setFailureEffect(false);
    setIsInteractionPaused(false);

    // Lock all doors when game starts
    onDoorsLock?.();

    // Show pattern after a short delay
    clearActiveTimeouts();
    resetAllBlocksVisuals();
    addTimeout(() => {
      showPattern(newPattern);
    }, 1000);
  };

  // Show the pattern to the player
  const showPattern = (pattern: number[]) => {
    console.log("DEBUG: Showing pattern:", pattern);
    let stepIndex = 0;

    const showNextStep = () => {
      if (stepIndex < pattern.length) {
        const blockId = pattern[stepIndex];
        console.log(
          `DEBUG: Highlighting block ${blockId} (step ${stepIndex + 1}/${
            pattern.length
          })`
        );
        highlightBlock(blockId);
        stepIndex++;
        addTimeout(showNextStep, 1200);
      } else {
        // Pattern shown, now player's turn
        console.log(
          "DEBUG: Pattern display complete, switching to playing phase"
        );
        addTimeout(() => {
          setGamePhase("playing");
        }, 1000);
      }
    };

    showNextStep();
  };

  // Handle wrong guess - shake block and turn red
  const handleWrongGuess = (blockId: number) => {
    console.log("DEBUG: Handling wrong guess for block", blockId);

    // Add to shaking and red blocks
    // Note: per-cube feedback is applied only if NOT final failure

    // Pause interaction briefly
    setIsInteractionPaused(true);

    // Turn off a candle
    const newWrongGuesses = wrongGuesses + 1;
    setWrongGuesses(newWrongGuesses);

    if (newWrongGuesses <= candlesLit.length) {
      const newCandlesLit = [...candlesLit];
      newCandlesLit[newWrongGuesses - 1] = false;
      setCandlesLit(newCandlesLit);
    }

    // If all candles are out, trigger failure effect
    if (newWrongGuesses >= candlesLit.length) {
      console.log("DEBUG: All candles out - triggering failure effect");
      // Ensure no single-cube feedback remains
      setShakingBlocks(new Set([0, 1, 2, 3]));
      setRedBlocks(new Set([0, 1, 2, 3]));
      resetAllBlocksVisuals();
      clearActiveTimeouts();
      addTimeout(() => {
        setFailureEffect(true);
        // All blocks turn red and shake
        setRedBlocks(new Set([0, 1, 2, 3]));
        setShakingBlocks(new Set([0, 1, 2, 3]));

        // Apply damage after effect
        addTimeout(() => {
          console.log("DEBUG: Applying damage and unlocking doors");
          loseLife();
          onDoorsUnlock?.();
          setIsInteractionPaused(false);
          // Reset everything
          addTimeout(() => {
            console.log("DEBUG: Resetting game state");
            clearActiveTimeouts();
            resetAllBlocksVisuals();
            setGameStarted(false);
            setLevel(1);
            setScore(0);
            setGamePhase("waiting");
            setCandlesLit([true, true]);
            setWrongGuesses(0);
            setFailureEffect(false);
            setRedBlocks(new Set());
            setShakingBlocks(new Set());
            setIsInteractionPaused(false);
          }, 2000);
        }, 900);
      }, 500);
    } else {
      // Not all candles out: replay the current pattern after a brief pause
      // Apply single-cube feedback briefly
      setShakingBlocks((prev) => new Set(prev).add(blockId));
      setRedBlocks((prev) => new Set(prev).add(blockId));
      addTimeout(() => {
        setShakingBlocks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
        setRedBlocks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
        resetAllBlocksVisuals();
      }, 600);

      addTimeout(() => {
        setIsInteractionPaused(false);
        setPlayerSequence([]);
        clearActiveTimeouts();
        resetAllBlocksVisuals();
        setGamePhase("showing");
        addTimeout(() => {
          showPattern(patternRef.current);
        }, 400);
      }, 700);
    }
  };

  // Highlight a specific block
  const highlightBlock = (blockId: number) => {
    const blockRef = blockRefs.current[blockId];
    if (blockRef) {
      // Create a temporary highlight effect
      const originalScale = blockRef.scale.clone();
      const material = blockRef.material as THREE.MeshStandardMaterial;
      const originalEmissive = material.emissiveIntensity;

      // Expand and glow
      blockRef.scale.setScalar(1.3);
      material.emissiveIntensity = 1.0;

      // Reset after delay
      addTimeout(() => {
        blockRef.scale.copy(originalScale);
        material.emissiveIntensity = originalEmissive;
      }, 600);
    }
  };

  // Handle block click
  const handleBlockClick = (blockId: number) => {
    if (gamePhase !== "playing" || isInteractionPaused) return;

    console.log("DEBUG: Player clicked block", blockId);
    console.log("DEBUG: Current step:", playerSequence.length);
    console.log(
      "DEBUG: Expected for this step:",
      patternRef.current[playerSequence.length]
    );

    // Check if this individual click is correct
    const expectedBlockId = patternRef.current[playerSequence.length];
    const isCorrectClick = blockId === expectedBlockId;

    console.log("DEBUG: Click correct?", isCorrectClick);
    console.log("DEBUG: Clicked:", blockId, "Expected:", expectedBlockId);

    // Highlight the clicked block
    highlightBlock(blockId);

    if (isCorrectClick) {
      // Correct click - add to sequence
      const newSequence = [...playerSequence, blockId];
      setPlayerSequence(newSequence);

      console.log("DEBUG: ✅ Correct click! Sequence:", newSequence);

      // Check if pattern is complete
      if (newSequence.length === patternRef.current.length) {
        console.log("DEBUG: ✅ Pattern complete!");

        // Level completed!
        setScore(score + level * 10);
        setLevel(level + 1);
        setPlayerSequence([]);
        setCurrentStep(0);

        // Add rewards for completing level
        addPoints(level * 5);
        addExperience(level * 3);

        // Check if player has completed enough levels (e.g., level 5+)
        if (level >= 5) {
          // Game completed successfully!
          setGamePhase("completed");
          onRoomComplete?.();
          onDoorsUnlock?.();

          // Add bonus rewards for completing the puzzle
          addPoints(50);
          addExperience(25);

          addTimeout(() => {
            setGameStarted(false);
            setLevel(1);
            setScore(0);
            setGamePhase("waiting");
            setCandlesLit([true, true]);
            setWrongGuesses(0);
            setRedBlocks(new Set());
            setShakingBlocks(new Set());
            setFailureEffect(false);
            setIsInteractionPaused(false);
          }, 3000);
        } else {
          // Start next level
          addTimeout(() => {
            const newPattern = generatePattern(level + 3);
            setCurrentPattern(newPattern);
            patternRef.current = newPattern; // Update ref as well
            setGamePhase("showing");
            showPattern(newPattern);
          }, 1500);
        }
      }
    } else {
      console.log("DEBUG: ❌ Wrong click! Immediate feedback");
      // Wrong click - immediate feedback
      handleWrongGuess(blockId);
    }
  };

  // Animation frame for floating blocks
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Animate floating blocks
    blockRefs.current.forEach((blockRef, index) => {
      if (blockRef) {
        const floatOffset = Math.sin(time * 2 + index) * 0.1;
        blockRef.position.y = memoryBlocks[index].position[1] + floatOffset;

        // Gentle rotation
        blockRef.rotation.y = time * 0.5 + index;

        // Shaking animation (failure state shakes all cubes)
        const shouldShake = failureEffect || shakingBlocks.has(index);
        if (shouldShake) {
          const shakeIntensity = 0.1;
          blockRef.position.x =
            memoryBlocks[index].position[0] +
            (Math.random() - 0.5) * shakeIntensity;
          blockRef.position.z =
            memoryBlocks[index].position[2] +
            (Math.random() - 0.5) * shakeIntensity;
          blockRef.rotation.x = (Math.random() - 0.5) * 0.2;
          blockRef.rotation.z = (Math.random() - 0.5) * 0.2;
        } else {
          // Reset position when not shaking
          blockRef.position.x = memoryBlocks[index].position[0];
          blockRef.position.z = memoryBlocks[index].position[2];
          blockRef.rotation.x = 0;
          blockRef.rotation.z = 0;
        }
      }
    });

    // Animate book glow
    if (bookRef.current && !gameStarted) {
      const glowIntensity = Math.sin(time * 3) * 0.2 + 0.3;
      const material = bookRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = glowIntensity;
    }
  });

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[biomeSize, 1, biomeSize]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      </RigidBody>

      {/* Central Table */}
      <Table
        position={[0, 0, 0]}
        size={[3, 0.8, 2]}
        color="#8B4513"
        legColor="#654321"
        castShadow={true}
      />

      {/* Candles on the table */}
      <Candle position={[-0.8, 0.9, 0.3]} isLit={candlesLit[0]} scale={0.8} />
      <Candle position={[0.8, 0.9, 0.3]} isLit={candlesLit[1]} scale={0.8} />

      {/* Interactive Book */}
      <mesh
        ref={bookRef}
        position={[0, 1, 0]}
        onClick={startMemoryGame}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = gameStarted ? "not-allowed" : "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
        castShadow
      >
        <boxGeometry args={[0.8, 0.1, 0.6]} />
        <meshStandardMaterial
          color="#8B0000"
          emissive="#FFD700"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Memory Game Blocks */}
      {memoryBlocks.map((block, index) => (
        <mesh
          key={block.id}
          ref={(el) => {
            if (el) blockRefs.current[index] = el;
          }}
          position={block.position}
          onClick={() => handleBlockClick(block.id)}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor =
              gamePhase === "playing" ? "pointer" : "default";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
          castShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={redBlocks.has(block.id) ? "#FF0000" : block.color}
            emissive={redBlocks.has(block.id) ? "#FF0000" : block.emissiveColor}
            emissiveIntensity={redBlocks.has(block.id) ? 0.8 : 0.2}
          />
        </mesh>
      ))}

      {/* Game Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        🧠 MEMORY PUZZLE 🧠
      </Text>

      {/* Game Status */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {(gamePhase === "waiting" && "Click the book to start!") ||
          (gamePhase === "showing" &&
            "Watch the pattern... Doors are locked!") ||
          (gamePhase === "playing" &&
            "Repeat the pattern! Doors remain locked!") ||
          (gamePhase === "completed" && "Puzzle completed! Doors unlocked!")}
      </Text>

      {/* Score and Level */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Level: {level} | Score: {score}
      </Text>

      {/* Health Warning */}
      {gameStarted && (
        <Text
          position={[0, 2.0, 0]}
          fontSize={0.25}
          color="#FF6B6B"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ⚠️ Wrong pattern = -1 Life! ⚠️
        </Text>
      )}

      {/* Pattern Progress */}
      {gamePhase === "playing" && (
        <Text
          position={[0, 2.4, 0]}
          fontSize={0.25}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Progress: {playerSequence.length}/{currentPattern.length}
        </Text>
      )}

      {/* Magical Particles */}
      {gameStarted &&
        Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 8,
              Math.random() * 3 + 1,
              (Math.random() - 0.5) * 8,
            ]}
          >
            <sphereGeometry args={[0.05]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
              transparent
              opacity={0.7}
            />
          </mesh>
        ))}

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "start_puzzle" && !gameStarted) {
            startMemoryGame();
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default MemoryGamePuzzleBiome;
