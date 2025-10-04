import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import {
  useCurrentRoomId,
  useNavigateToRoom,
  useRoomStore,
} from "../store/roomStore";
import SimpleRoomManager from "./SimpleRoomManager";
import { SafeFirstPersonPlayer } from "./SafeFirstPersonPlayer";

const SimpleRoomDemo: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 75 }}
        shadows
        style={{ background: "#87CEEB" }}
      >
        <Environment preset="sunset" />

        <Physics gravity={[0, -9.81, 0]}>
          {/* Render current room and doors */}
          <SimpleRoomManager />

          {/* Player */}
          <SafeFirstPersonPlayer />

          {/* Ground plane */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -0.5, 0]}
              receiveShadow
            >
              <planeGeometry args={[50, 50]} />
              <meshLambertMaterial color="#2d5016" />
            </mesh>
          </RigidBody>
        </Physics>
      </Canvas>

      {/* Simple UI to show current room */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          background: "rgba(0,0,0,0.7)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontFamily: "monospace",
        }}
      >
        <SimpleRoomInfo />
      </div>
    </div>
  );
};

// Component to show current room info
const SimpleRoomInfo: React.FC = () => {
  const currentRoomId = useCurrentRoomId();
  const navigateToRoom = useNavigateToRoom();

  // Get room data from store
  const currentRoom = useRoomStore.getState().getCurrentRoom();
  const doors = useRoomStore.getState().getAllConnectedRooms();

  return (
    <div>
      <h3>Current Room: {currentRoom?.name || "Unknown"}</h3>
      <p>Connected Rooms (doors available):</p>
      <ul>
        {doors.map((doorId) => (
          <li key={doorId}>{doorId}</li>
        ))}
      </ul>
      <p>Click on doors to navigate!</p>
    </div>
  );
};

export default SimpleRoomDemo;
