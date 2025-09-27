import React, { useRef, useEffect, useState } from "react";
import { Box } from "@react-three/drei";
import * as THREE from "three";

interface DebrisPiece {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  color: string;
  size: number;
  lifetime: number;
}

interface DebrisProps {
  pieces: DebrisPiece[];
  onPieceExpired?: (pieceId: string) => void;
}

const DebrisPiece: React.FC<{
  piece: DebrisPiece;
  onExpired: (id: string) => void;
}> = ({ piece, onExpired }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [position, setPosition] = useState<[number, number, number]>(
    piece.position
  );
  const [rotation, setRotation] = useState<[number, number, number]>(
    piece.rotation
  );
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let animationId: number;
    const startTime = Date.now();
    const velocity = [...piece.velocity] as [number, number, number];
    const rotationVelocity = [
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1,
    ] as [number, number, number];

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / piece.lifetime;

      if (progress >= 1) {
        onExpired(piece.id);
        return;
      }

      // Update position with gravity
      velocity[1] -= 0.02; // Gravity
      setPosition((prev) => [
        prev[0] + velocity[0] * 0.016,
        prev[1] + velocity[1] * 0.016,
        prev[2] + velocity[2] * 0.016,
      ]);

      // Update rotation
      setRotation((prev) => [
        prev[0] + rotationVelocity[0],
        prev[1] + rotationVelocity[1],
        prev[2] + rotationVelocity[2],
      ]);

      // Fade out over time
      setOpacity(1 - progress);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [piece.id, piece.velocity, piece.lifetime, onExpired]);

  return (
    <Box
      ref={meshRef}
      position={position}
      rotation={rotation}
      args={[piece.size, piece.size * 0.5, piece.size * 0.3]}
    >
      <meshLambertMaterial color={piece.color} transparent opacity={opacity} />
    </Box>
  );
};

const Debris: React.FC<DebrisProps> = ({ pieces, onPieceExpired }) => {
  const handlePieceExpired = (pieceId: string) => {
    onPieceExpired?.(pieceId);
  };

  return (
    <group>
      {pieces.map((piece) => (
        <DebrisPiece
          key={piece.id}
          piece={piece}
          onExpired={handlePieceExpired}
        />
      ))}
    </group>
  );
};

export default Debris;
