import React, { useState } from "react";

export type DoorStyle = "wooden" | "metal" | "stone" | "medieval" | "modern";

interface DoorStyleSelectorProps {
  currentStyle: DoorStyle;
  onStyleChange: (style: DoorStyle) => void;
  show?: boolean;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

const DoorStyleSelector: React.FC<DoorStyleSelectorProps> = ({
  currentStyle,
  onStyleChange,
  show = false,
  position = "top-left",
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const doorStyles: {
    style: DoorStyle;
    name: string;
    emoji: string;
    description: string;
  }[] = [
    {
      style: "wooden",
      name: "Wooden",
      emoji: "🚪",
      description: "Classic wooden door with grain texture",
    },
    {
      style: "metal",
      name: "Metal",
      emoji: "🚪",
      description: "Industrial metal door with scratches",
    },
    {
      style: "stone",
      name: "Stone",
      emoji: "🚪",
      description: "Heavy stone door with rough texture",
    },
    {
      style: "medieval",
      name: "Medieval",
      emoji: "🏰",
      description: "Medieval castle door with panels",
    },
    {
      style: "modern",
      name: "Modern",
      emoji: "🚪",
      description: "Sleek modern door with geometric patterns",
    },
  ];

  const getPositionStyle = () => {
    const baseStyle = {
      position: "fixed" as const,
      background: "rgba(0, 0, 0, 0.8)",
      color: "white",
      padding: "10px",
      borderRadius: "8px",
      fontFamily: "monospace",
      fontSize: "12px",
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

  const currentStyleInfo = doorStyles.find((s) => s.style === currentStyle);

  if (!show) return null;

  return (
    <div style={getPositionStyle()}>
      <div
        style={{ marginBottom: "8px", fontWeight: "bold", color: "#00FFFF" }}
      >
        🎨 Door Style Selector
      </div>

      {/* Current style display */}
      <div
        style={{
          padding: "8px",
          background: "rgba(0, 255, 0, 0.2)",
          borderRadius: "4px",
          border: "1px solid #00FF00",
          marginBottom: "8px",
          cursor: "pointer",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{currentStyleInfo?.emoji}</span>
          <span style={{ fontWeight: "bold" }}>{currentStyleInfo?.name}</span>
          <span style={{ fontSize: "10px", opacity: 0.7 }}>
            {isExpanded ? "▲" : "▼"}
          </span>
        </div>
        <div style={{ fontSize: "10px", opacity: 0.8, marginTop: "4px" }}>
          {currentStyleInfo?.description}
        </div>
      </div>

      {/* Style options */}
      {isExpanded && (
        <div style={{ marginBottom: "8px" }}>
          {doorStyles.map((styleInfo) => (
            <div
              key={styleInfo.style}
              onClick={() => {
                onStyleChange(styleInfo.style);
                setIsExpanded(false);
              }}
              style={{
                padding: "6px 8px",
                margin: "2px 0",
                background:
                  styleInfo.style === currentStyle
                    ? "rgba(0, 255, 0, 0.3)"
                    : "rgba(255, 255, 255, 0.1)",
                borderRadius: "4px",
                cursor: "pointer",
                transition: "background 0.2s",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border:
                  styleInfo.style === currentStyle
                    ? "1px solid #00FF00"
                    : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (styleInfo.style !== currentStyle) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                if (styleInfo.style !== currentStyle) {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                }
              }}
            >
              <span style={{ fontSize: "14px" }}>{styleInfo.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: "bold" }}>{styleInfo.name}</div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>
                  {styleInfo.description}
                </div>
              </div>
              {styleInfo.style === currentStyle && (
                <span style={{ color: "#00FF00", fontSize: "12px" }}>✓</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Style info */}
      <div
        style={{
          marginTop: "8px",
          padding: "4px",
          background: "rgba(0, 0, 0, 0.3)",
          borderRadius: "4px",
          fontSize: "10px",
          opacity: 0.7,
        }}
      >
        <div>Click to expand and select door style</div>
        <div>Style affects door appearance and texture</div>
      </div>
    </div>
  );
};

export default DoorStyleSelector;

