import React, { useState, useEffect } from "react";

const Cursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Only update cursor position if pointer is not locked
      if (!isPointerLocked) {
        // Constrain mouse position to window boundaries
        const constrainedX = Math.max(
          0,
          Math.min(event.clientX, window.innerWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(event.clientY, window.innerHeight)
        );

        setMousePosition({ x: constrainedX, y: constrainedY });
      }
    };

    const handleResize = () => {
      // If cursor is at center, keep it centered after resize
      if (
        mousePosition.x === window.innerWidth / 2 &&
        mousePosition.y === window.innerHeight / 2
      ) {
        setMousePosition({
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        });
      } else {
        // Constrain existing position to new window size
        const constrainedX = Math.max(
          0,
          Math.min(mousePosition.x, window.innerWidth)
        );
        const constrainedY = Math.max(
          0,
          Math.min(mousePosition.y, window.innerHeight)
        );
        setMousePosition({ x: constrainedX, y: constrainedY });
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
    };

    // Add event listeners
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);
    document.addEventListener("pointerlockchange", handlePointerLockChange);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
    };
  }, [mousePosition.x, mousePosition.y, isPointerLocked]);

  // Don't render cursor when pointer is locked
  if (isPointerLocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: mousePosition.y,
        left: mousePosition.x,
        transform: "translate(-50%, -50%)",
        width: "24px",
        height: "24px",
        border: "3px solid #ffffff",
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        pointerEvents: "none",
        zIndex: 1000,
        transition: "all 0.1s ease",
        boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
        animation: "pulse 2s infinite",
      }}
    />
  );
};

export default Cursor;
