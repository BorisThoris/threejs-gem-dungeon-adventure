import React, { useState, useMemo, useEffect } from "react";
import useMapStore from "../store/mapStore";
import { useConsolidatedGameStore } from "../store/consolidatedGameStore";
import { cameraRotationRefs } from "../utils/cameraRotationRef";
import type { Room } from "../types/map";

interface MinimapProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const Minimap: React.FC<MinimapProps> = ({ isVisible = true, onToggle }) => {
  const { currentMap, currentRoomId, visitedRooms } = useMapStore();
  const { currentRoomId: gameCurrentRoomId } = useConsolidatedGameStore();
  const [isMinimapVisible, setIsMinimapVisible] = useState(isVisible);
  const [cameraRotation, setCameraRotation] = useState({
    y: -Math.PI / 2,
    x: 0,
  });

  // Listen for camera rotation changes using refs
  useEffect(() => {
    const unsubscribe = cameraRotationRefs.subscribe(() => {
      setCameraRotation(cameraRotationRefs.getRotation());
    });

    // Set initial rotation
    setCameraRotation(cameraRotationRefs.getRotation());

    return unsubscribe;
  }, []);

  // Calculate circular minimap data
  const minimapData = useMemo(() => {
    if (!currentMap) return null;

    const rooms = currentMap.rooms;
    if (rooms.length === 0) return null;

    // Find current room to center the map on
    const currentRoom = rooms.find(
      (room) => room.id === currentRoomId || room.id === gameCurrentRoomId
    );

    // Use current room position as center, or fallback to geometric center
    const centerX = currentRoom
      ? currentRoom.position.x
      : (Math.min(...rooms.map((r) => r.position.x)) +
          Math.max(...rooms.map((r) => r.position.x))) /
        2;
    const centerZ = currentRoom
      ? currentRoom.position.z
      : (Math.min(...rooms.map((r) => r.position.z)) +
          Math.max(...rooms.map((r) => r.position.z))) /
        2;

    // Calculate bounds relative to the center
    const positions = rooms.map((room) => room.position);
    const distancesFromCenter = positions.map((pos) =>
      Math.sqrt(Math.pow(pos.x - centerX, 2) + Math.pow(pos.z - centerZ, 2))
    );
    const maxDistance = Math.max(...distancesFromCenter);

    // Minimap radius (pixels)
    const minimapRadius = 80;
    const worldRadius = Math.max(maxDistance, 5); // Minimum radius to prevent division by zero
    const scale = minimapRadius / worldRadius;

    return {
      centerX,
      centerZ,
      worldRadius,
      minimapRadius,
      scale,
      rooms: rooms.map((room) => ({
        ...room,
        // Convert world coordinates to circular minimap coordinates (centered on current room)
        minimapX: (room.position.x - centerX) * scale,
        minimapZ: (room.position.z - centerZ) * scale,
        // Calculate distance from center for circular clipping
        distanceFromCenter: Math.sqrt(
          Math.pow(room.position.x - centerX, 2) +
            Math.pow(room.position.z - centerZ, 2)
        ),
      })),
    };
  }, [currentMap, currentRoomId, gameCurrentRoomId]);

  // Get room color based on state
  const getRoomColor = (room: Room) => {
    const isCurrent =
      room.id === currentRoomId || room.id === gameCurrentRoomId;
    const isVisited = visitedRooms.has(room.id);

    if (isCurrent) {
      return "#00ff00"; // Bright green for current room
    } else if (isVisited) {
      return "#4CAF50"; // Green for visited rooms
    } else {
      return "#666666"; // Gray for unvisited rooms
    }
  };

  // Get room type icon
  const getRoomIcon = (roomType: string) => {
    switch (roomType) {
      case "start":
        return "🏠";
      case "end":
        return "🏁";
      case "boss":
        return "👹";
      case "treasure":
        return "💰";
      case "shop":
        return "🛒";
      case "puzzle":
        return "🧩";
      case "arena":
        return "⚔️";
      case "portal":
        return "🌀";
      case "library":
        return "📚";
      case "meditation":
        return "🧘";
      case "gym":
        return "💪";
      case "coffee":
        return "☕";
      case "challenge":
        return "🎯";
      case "secret":
        return "🔒";
      case "trap":
        return "⚠️";
      case "enemy":
        return "👾";
      case "normal":
        return "📦";
      default:
        return "📦";
    }
  };

  // Get current room for highlighting
  const currentRoom = useMemo(() => {
    if (!minimapData) return null;
    return minimapData.rooms.find(
      (room) => room.id === currentRoomId || room.id === gameCurrentRoomId
    );
  }, [minimapData, currentRoomId, gameCurrentRoomId]);

  // Toggle minimap visibility
  const handleToggle = () => {
    setIsMinimapVisible(!isMinimapVisible);
    onToggle?.();
  };

  if (!isMinimapVisible || !minimapData) {
    return (
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={handleToggle}
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "2px solid #fff",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            cursor: "pointer",
            fontSize: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "monospace",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          🗺️
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "200px",
        height: "200px",
        zIndex: 1000,
        fontFamily: "monospace",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          fontSize: "12px",
        }}
      >
        <span style={{ fontWeight: "bold" }}>MINIMAP</span>
        <button
          onClick={handleToggle}
          style={{
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "14px",
            padding: "2px",
          }}
        >
          ✕
        </button>
      </div>

      {/* Circular Minimap Canvas */}
      <div
        style={{
          position: "relative",
          width: "180px",
          height: "180px",
          margin: "0 auto",
        }}
      >
        {/* Circular Background */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: `${minimapData.minimapRadius * 2}px`,
            height: `${minimapData.minimapRadius * 2}px`,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "2px solid #fff",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            backdropFilter: "blur(5px)",
            overflow: "hidden",
          }}
        >
          {/* Map Content Container - Rotates with camera */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "100%",
              height: "100%",
              transform: `translate(-50%, -50%) rotate(${cameraRotation.y}rad)`,
              transformOrigin: "center center",
            }}
          >
            {/* Compass Directions - Fixed relative to map */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              {/* North */}
              <div
                style={{
                  position: "absolute",
                  top: "5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#ff0000",
                }}
              >
                N
              </div>
              {/* East */}
              <div
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#ff0000",
                }}
              >
                E
              </div>
              {/* South */}
              <div
                style={{
                  position: "absolute",
                  bottom: "5px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#ff0000",
                }}
              >
                S
              </div>
              {/* West */}
              <div
                style={{
                  position: "absolute",
                  left: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "10px",
                  fontWeight: "bold",
                  color: "#ff0000",
                }}
              >
                W
              </div>
            </div>

            {/* Room Connections */}
            {minimapData.rooms.map((room) => {
              return room.connections?.map((connectionId) => {
                const connectedRoom = minimapData.rooms.find(
                  (r) => r.id === connectionId
                );
                if (!connectedRoom) return null;

                // Only show connections within the circular bounds
                if (
                  room.distanceFromCenter > minimapData.worldRadius ||
                  connectedRoom.distanceFromCenter > minimapData.worldRadius
                ) {
                  return null;
                }

                return (
                  <div
                    key={`connection-${room.id}-${connectionId}`}
                    style={{
                      position: "absolute",
                      left: `${minimapData.minimapRadius + room.minimapX}px`,
                      top: `${minimapData.minimapRadius + room.minimapZ}px`,
                      width: `${Math.abs(
                        connectedRoom.minimapX - room.minimapX
                      )}px`,
                      height: `${Math.abs(
                        connectedRoom.minimapZ - room.minimapZ
                      )}px`,
                      borderLeft:
                        connectedRoom.minimapX > room.minimapX
                          ? "1px solid #555"
                          : "none",
                      borderRight:
                        connectedRoom.minimapX < room.minimapX
                          ? "1px solid #555"
                          : "none",
                      borderTop:
                        connectedRoom.minimapZ > room.minimapZ
                          ? "1px solid #555"
                          : "none",
                      borderBottom:
                        connectedRoom.minimapZ < room.minimapZ
                          ? "1px solid #555"
                          : "none",
                      transformOrigin: "0 0",
                      transform: `rotate(${Math.atan2(
                        connectedRoom.minimapZ - room.minimapZ,
                        connectedRoom.minimapX - room.minimapX
                      )}rad)`,
                    }}
                  />
                );
              });
            })}

            {/* Rooms */}
            {minimapData.rooms.map((room) => {
              const isCurrent =
                room.id === currentRoomId || room.id === gameCurrentRoomId;

              // Skip rooms outside circular bounds
              if (room.distanceFromCenter > minimapData.worldRadius) {
                return null;
              }

              return (
                <div
                  key={room.id}
                  style={{
                    position: "absolute",
                    left: `${
                      minimapData.minimapRadius +
                      room.minimapX -
                      (isCurrent ? 6 : 4)
                    }px`,
                    top: `${
                      minimapData.minimapRadius +
                      room.minimapZ -
                      (isCurrent ? 6 : 4)
                    }px`,
                    width: isCurrent ? "12px" : "8px",
                    height: isCurrent ? "12px" : "8px",
                    backgroundColor: getRoomColor(room),
                    border: isCurrent ? "2px solid #fff" : "1px solid #fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isCurrent ? "8px" : "6px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    boxShadow: isCurrent
                      ? "0 0 8px rgba(0, 255, 0, 0.5)"
                      : "none",
                    animation: isCurrent ? "pulse 2s infinite" : "none",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "scale(1.3)";
                    e.currentTarget.style.zIndex = "10";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.zIndex = "1";
                  }}
                  title={`${room.type} (${room.id})`}
                >
                  {getRoomIcon(room.type)}
                </div>
              );
            })}

            {/* Player Direction Indicator */}
            {currentRoom && (
              <div
                style={{
                  position: "absolute",
                  left: `${
                    minimapData.minimapRadius + currentRoom.minimapX - 2
                  }px`,
                  top: `${
                    minimapData.minimapRadius + currentRoom.minimapZ - 2
                  }px`,
                  width: "4px",
                  height: "4px",
                  backgroundColor: "#ff0000",
                  borderRadius: "50%",
                }}
              >
                {/* Direction arrow - Fixed pointing up */}
                <div
                  style={{
                    position: "absolute",
                    left: "1px",
                    top: "-8px",
                    width: "0",
                    height: "0",
                    borderLeft: "1px solid transparent",
                    borderRight: "1px solid transparent",
                    borderBottom: "8px solid #ff0000",
                    transform: "translateX(-50%)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: "8px",
          fontSize: "8px",
          textAlign: "center",
          lineHeight: "1.2",
        }}
      >
        <div style={{ color: "#00ff00" }}>● Current Room</div>
        <div style={{ color: "#4CAF50" }}>● Visited</div>
        <div style={{ color: "#666666" }}>● Unvisited</div>
        <div style={{ color: "#ff0000" }}>▲ Direction</div>
      </div>

      {/* Room Info */}
      {currentRoom && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            textAlign: "center",
            opacity: 0.8,
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>
            {currentRoom.type.toUpperCase()}
          </div>
          <div style={{ fontSize: "8px", opacity: 0.7 }}>
            {currentRoom.connections?.length || 0} connections
          </div>
        </div>
      )}

      {/* Add CSS animation for current room pulse */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Minimap;
