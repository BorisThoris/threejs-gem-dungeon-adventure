import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Environment } from "@react-three/drei";
import useMapStore from "../store/mapStore";
import {
  analyzeConnectivity,
  ensureRoomConnectivity,
} from "../utils/roomConnectivityValidator";
import ConnectivityDebugger from "../components/ConnectivityDebugger";
import type { Room, GameMap } from "../types/map";

const ConnectivityTestExample: React.FC = () => {
  const { currentMap, generateMap } = useMapStore();
  const [connectivityReport, setConnectivityReport] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (currentMap) {
      const report = analyzeConnectivity(currentMap);
      setConnectivityReport(report);
    }
  }, [currentMap]);

  const runConnectivityTest = async () => {
    setIsTesting(true);
    const results: string[] = [];

    try {
      results.push("🧪 Starting Connectivity Test...");

      if (!currentMap) {
        results.push("❌ No map available for testing");
        setTestResults(results);
        setIsTesting(false);
        return;
      }

      // Test 1: Analyze current connectivity
      const initialReport = analyzeConnectivity(currentMap);
      results.push(`📊 Initial Analysis:`);
      results.push(`   - Total Rooms: ${initialReport.totalRooms}`);
      results.push(`   - Connected Rooms: ${initialReport.connectedRooms}`);
      results.push(
        `   - Isolated Rooms: ${initialReport.isolatedRooms.length}`
      );
      results.push(
        `   - Components: ${initialReport.connectedComponents.length}`
      );
      results.push(
        `   - Fully Connected: ${initialReport.isFullyConnected ? "✅" : "❌"}`
      );

      // Test 2: Check for isolated rooms
      if (initialReport.isolatedRooms.length > 0) {
        results.push(
          `⚠️ Found ${initialReport.isolatedRooms.length} isolated rooms:`
        );
        initialReport.isolatedRooms.forEach((room: Room) => {
          results.push(
            `   - ${room.type} (${room.id}) - ${room.connections.length} connections`
          );
        });
      }

      // Test 3: Check for disconnected components
      if (initialReport.connectedComponents.length > 1) {
        results.push(
          `⚠️ Found ${initialReport.connectedComponents.length} disconnected components:`
        );
        initialReport.connectedComponents.forEach(
          (component: Room[], index: number) => {
            results.push(
              `   - Component ${index + 1}: ${component.length} rooms`
            );
          }
        );
      }

      // Test 4: Apply connectivity repair if needed
      if (initialReport.needsRepair) {
        results.push("🔧 Applying connectivity repairs...");
        const repairedMap = ensureRoomConnectivity(currentMap);

        // Test 5: Verify repair worked
        const finalReport = analyzeConnectivity(repairedMap);
        results.push(`📊 Final Analysis:`);
        results.push(`   - Total Rooms: ${finalReport.totalRooms}`);
        results.push(`   - Connected Rooms: ${finalReport.connectedRooms}`);
        results.push(
          `   - Isolated Rooms: ${finalReport.isolatedRooms.length}`
        );
        results.push(
          `   - Components: ${finalReport.connectedComponents.length}`
        );
        results.push(
          `   - Fully Connected: ${finalReport.isFullyConnected ? "✅" : "❌"}`
        );

        if (finalReport.isFullyConnected) {
          results.push("✅ All rooms are now connected!");
        } else {
          results.push("❌ Some rooms may still be isolated");
        }
      } else {
        results.push("✅ No repairs needed - all rooms are connected");
      }

      // Test 6: Connection type analysis
      results.push("🔍 Connection Type Analysis:");
      const connectionTypes = new Map<string, number>();
      currentMap.rooms.forEach((room: Room) => {
        room.connections.forEach((connectionId: string) => {
          const targetRoom = currentMap.rooms.find(
            (r) => r.id === connectionId
          );
          if (targetRoom) {
            const connectionType = determineConnectionType(room, targetRoom);
            connectionTypes.set(
              connectionType,
              (connectionTypes.get(connectionType) || 0) + 1
            );
          }
        });
      });

      connectionTypes.forEach((count, type) => {
        results.push(`   - ${type}: ${count} connections`);
      });

      // Test 7: Room connection statistics
      const connectionStats = currentMap.rooms
        .map((room) => ({
          id: room.id,
          type: room.type,
          connections: room.connections.length,
        }))
        .sort((a, b) => b.connections - a.connections);

      results.push("📈 Room Connection Statistics:");
      connectionStats.slice(0, 5).forEach((stat) => {
        results.push(
          `   - ${stat.type} (${stat.id}): ${stat.connections} connections`
        );
      });

      results.push("✅ Connectivity test completed successfully!");
    } catch (error) {
      results.push(`❌ Test failed: ${error}`);
    }

    setTestResults(results);
    setIsTesting(false);
  };

  const determineConnectionType = (room1: Room, room2: Room): string => {
    const room1Type = room1.type.toLowerCase();
    const room2Type = room2.type.toLowerCase();

    if (
      room1Type.includes("portal") ||
      room2Type.includes("portal") ||
      room1Type.includes("mystical") ||
      room2Type.includes("mystical") ||
      room1.theme === "mystical" ||
      room2.theme === "mystical"
    ) {
      return "portal";
    }

    if (
      room1Type.includes("dungeon") ||
      room2Type.includes("dungeon") ||
      room1Type.includes("challenge") ||
      room2Type.includes("challenge") ||
      room1Type.includes("boss") ||
      room2Type.includes("boss") ||
      room1.theme === "dungeon" ||
      room2.theme === "dungeon"
    ) {
      return "breakable_wall";
    }

    if (room1Type.includes("corridor") || room2Type.includes("corridor")) {
      return "corridor";
    }

    return "door";
  };

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* Control Panel */}
      <div
        style={{
          width: "400px",
          padding: "20px",
          backgroundColor: "#2a2a2a",
          color: "white",
          overflowY: "auto",
        }}
      >
        <h2>Connectivity Test Suite</h2>
        <p>Test and verify room connectivity in the generated map</p>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={runConnectivityTest}
            disabled={isTesting || !currentMap}
            style={{
              padding: "10px 20px",
              backgroundColor: isTesting ? "#666" : "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: isTesting ? "not-allowed" : "pointer",
            }}
          >
            {isTesting ? "Testing..." : "Run Connectivity Test"}
          </button>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => generateMap()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Generate New Map
          </button>
        </div>

        {connectivityReport && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Current Status</h3>
            <p>
              <strong>Total Rooms:</strong> {connectivityReport.totalRooms}
            </p>
            <p>
              <strong>Connected Rooms:</strong>{" "}
              {connectivityReport.connectedRooms}
            </p>
            <p>
              <strong>Isolated Rooms:</strong>{" "}
              {connectivityReport.isolatedRooms.length}
            </p>
            <p>
              <strong>Components:</strong>{" "}
              {connectivityReport.connectedComponents.length}
            </p>
            <p>
              <strong>Fully Connected:</strong>{" "}
              {connectivityReport.isFullyConnected ? "✅" : "❌"}
            </p>
          </div>
        )}

        {testResults.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3>Test Results</h3>
            <div
              style={{
                backgroundColor: "#333",
                padding: "10px",
                borderRadius: "5px",
                maxHeight: "300px",
                overflowY: "auto",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
            >
              {testResults.map((result, index) => (
                <div key={index} style={{ marginBottom: "2px" }}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <h3>Test Description</h3>
          <p style={{ fontSize: "12px" }}>
            This test suite verifies that every room in the map has at least one
            connection to another room. It checks for isolated rooms,
            disconnected components, and ensures proper connectivity.
          </p>
        </div>
      </div>

      {/* 3D Visualization */}
      <div style={{ flex: 1 }}>
        <ConnectivityDebugger />
      </div>
    </div>
  );
};

export default ConnectivityTestExample;
