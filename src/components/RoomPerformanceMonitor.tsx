import React, { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { roomNavigationSystem } from "../systems/RoomNavigationSystem";

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  roomCount: number;
  doorCount: number;
  transitionActive: boolean;
  lastTransitionTime: number;
}

interface RoomPerformanceMonitorProps {
  show?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  updateInterval?: number;
}

const RoomPerformanceMonitor: React.FC<RoomPerformanceMonitorProps> = ({
  show = false,
  position = "top-left",
  updateInterval = 1000,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    roomCount: 0,
    doorCount: 0,
    transitionActive: false,
    lastTransitionTime: 0,
  });

  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const lastUpdateRef = useRef(performance.now());

  // FPS calculation
  useFrame(() => {
    const now = performance.now();
    const deltaTime = now - lastTimeRef.current;

    frameCountRef.current++;

    if (now - lastUpdateRef.current >= updateInterval) {
      const fps = Math.round(
        (frameCountRef.current * 1000) / (now - lastUpdateRef.current)
      );
      const frameTime = deltaTime;

      // Memory usage (approximate)
      const memoryUsage = (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)
        : 0;

      // Room system metrics
      const state = roomNavigationSystem.getState();
      const roomCount = state.roomInstances.size;
      const doorCount = state.doors.size;
      const transitionActive = state.isTransitioning;
      const lastTransitionTime = state.transition?.startTime || 0;

      setMetrics({
        fps,
        frameTime: Math.round(frameTime * 100) / 100,
        memoryUsage,
        roomCount,
        doorCount,
        transitionActive,
        lastTransitionTime,
      });

      frameCountRef.current = 0;
      lastUpdateRef.current = now;
    }

    lastTimeRef.current = now;
  });

  if (!show) return null;

  const getPositionStyle = () => {
    const baseStyle = {
      position: "fixed" as const,
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "11px",
      zIndex: 1000,
      minWidth: "200px",
      border: "1px solid rgba(255, 255, 255, 0.2)",
    };

    switch (position) {
      case "top-left":
        return { ...baseStyle, top: "20px", left: "20px" };
      case "top-right":
        return { ...baseStyle, top: "20px", right: "20px" };
      case "bottom-left":
        return { ...baseStyle, bottom: "20px", left: "20px" };
      case "bottom-right":
        return { ...baseStyle, bottom: "20px", right: "20px" };
      default:
        return { ...baseStyle, top: "20px", left: "20px" };
    }
  };

  const getFPSColor = (fps: number) => {
    if (fps >= 55) return "#00FF00"; // Green
    if (fps >= 30) return "#FFFF00"; // Yellow
    return "#FF0000"; // Red
  };

  const getFrameTimeColor = (frameTime: number) => {
    if (frameTime <= 16.67) return "#00FF00"; // Green (60fps)
    if (frameTime <= 33.33) return "#FFFF00"; // Yellow (30fps)
    return "#FF0000"; // Red
  };

  return (
    <div style={getPositionStyle()}>
      <div
        style={{ marginBottom: "8px", fontWeight: "bold", color: "#00FFFF" }}
      >
        📊 Room System Performance
      </div>

      {/* FPS */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>FPS: </span>
        <span style={{ color: getFPSColor(metrics.fps) }}>{metrics.fps}</span>
      </div>

      {/* Frame Time */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>Frame Time: </span>
        <span style={{ color: getFrameTimeColor(metrics.frameTime) }}>
          {metrics.frameTime}ms
        </span>
      </div>

      {/* Memory Usage */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>Memory: </span>
        <span
          style={{ color: metrics.memoryUsage > 100 ? "#FF0000" : "#00FF00" }}
        >
          {metrics.memoryUsage}MB
        </span>
      </div>

      {/* Room Count */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>Rooms: </span>
        <span style={{ color: "#00FF00" }}>{metrics.roomCount}</span>
      </div>

      {/* Door Count */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>Doors: </span>
        <span style={{ color: "#00FF00" }}>{metrics.doorCount}</span>
      </div>

      {/* Transition Status */}
      <div style={{ marginBottom: "4px" }}>
        <span style={{ color: "#FFFFFF" }}>Transition: </span>
        <span
          style={{ color: metrics.transitionActive ? "#FF0000" : "#00FF00" }}
        >
          {metrics.transitionActive ? "Active" : "Idle"}
        </span>
      </div>

      {/* Last Transition Time */}
      {metrics.lastTransitionTime > 0 && (
        <div style={{ marginBottom: "4px" }}>
          <span style={{ color: "#FFFFFF" }}>Last Transition: </span>
          <span style={{ color: "#FFFF00" }}>
            {new Date(metrics.lastTransitionTime).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Performance Status */}
      <div
        style={{
          marginTop: "8px",
          padding: "4px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
          fontSize: "10px",
        }}
      >
        <div style={{ color: "#FFFFFF" }}>Status:</div>
        <div
          style={{
            color:
              metrics.fps >= 55 && metrics.frameTime <= 16.67
                ? "#00FF00"
                : "#FF0000",
          }}
        >
          {metrics.fps >= 55 && metrics.frameTime <= 16.67
            ? "✅ Optimal"
            : "⚠️ Performance Issues"}
        </div>
      </div>

      {/* Recommendations */}
      {metrics.fps < 30 && (
        <div
          style={{
            marginTop: "8px",
            padding: "4px",
            background: "rgba(255, 0, 0, 0.2)",
            borderRadius: "4px",
            fontSize: "10px",
            color: "#FFAAAA",
          }}
        >
          💡 Consider reducing room complexity or enabling LOD
        </div>
      )}

      {metrics.memoryUsage > 100 && (
        <div
          style={{
            marginTop: "8px",
            padding: "4px",
            background: "rgba(255, 165, 0, 0.2)",
            borderRadius: "4px",
            fontSize: "10px",
            color: "#FFB366",
          }}
        >
          💡 High memory usage - consider unloading unused rooms
        </div>
      )}
    </div>
  );
};

export default RoomPerformanceMonitor;
