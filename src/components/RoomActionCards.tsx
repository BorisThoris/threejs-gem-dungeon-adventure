import React, { useState, useEffect, useMemo, useCallback } from "react";
import useGameStore from "../store/gameStore";

export interface ActionCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  cost?: number;
  cooldown?: number;
}

interface RoomActionCardsProps {
  cards: ActionCard[];
  isVisible: boolean;
  onCardClick?: (card: ActionCard) => void;
}

const RoomActionCards: React.FC<RoomActionCardsProps> = ({
  cards,
  isVisible,
  onCardClick,
}) => {
  const { playerStats } = useGameStore();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Reset selection when cards change
  useEffect(() => {
    setSelectedCard(null);
  }, [cards]);

  // Memoize card click handler to prevent unnecessary re-renders
  const handleCardClick = useCallback(
    (card: ActionCard) => {
      if (card.disabled) return;

      setSelectedCard(card.id);
      onCardClick?.(card);
      card.action();
    },
    [onCardClick]
  );

  // Memoize affordability check to prevent unnecessary recalculations
  const canAfford = useCallback(
    (card: ActionCard) => {
      if (!card.cost) return true;
      return playerStats.points >= card.cost;
    },
    [playerStats.points]
  );

  // Memoize card rendering to prevent unnecessary re-renders
  const renderedCards = useMemo(() => {
    return cards.map((card) => {
      const isSelected = selectedCard === card.id;
      const isHovered = hoveredCard === card.id;
      const isDisabled = card.disabled || (card.cost && !canAfford(card));
      const isAffordable = canAfford(card);

      return (
        <div
          key={card.id}
          onClick={() => handleCardClick(card)}
          onMouseEnter={() => setHoveredCard(card.id)}
          onMouseLeave={() => setHoveredCard(null)}
          style={{
            background: isSelected
              ? "linear-gradient(135deg, #00ff00, #00cc00)"
              : isHovered
              ? "linear-gradient(135deg, #333, #555)"
              : "linear-gradient(135deg, #222, #444)",
            border: isSelected
              ? "2px solid #00ff00"
              : isHovered
              ? "2px solid #666"
              : "2px solid #333",
            borderRadius: "12px",
            padding: "1rem",
            minWidth: "200px",
            maxWidth: "250px",
            cursor: isDisabled ? "not-allowed" : "pointer",
            opacity: isDisabled ? 0.5 : 1,
            transform: isHovered ? "translateY(-5px)" : "translateY(0)",
            transition: "all 0.3s ease",
            boxShadow: isSelected
              ? "0 0 20px rgba(0, 255, 0, 0.5)"
              : isHovered
              ? "0 5px 15px rgba(0, 0, 0, 0.3)"
              : "0 2px 8px rgba(0, 0, 0, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Card Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                marginRight: "0.5rem",
                filter: isDisabled ? "grayscale(100%)" : "none",
              }}
            >
              {card.icon}
            </div>
            <h3
              style={{
                color: isSelected ? "#000" : "#fff",
                fontSize: "1.1rem",
                fontWeight: "bold",
                margin: 0,
                textShadow: isSelected
                  ? "none"
                  : "0 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              {card.title}
            </h3>
          </div>

          {/* Card Description */}
          <p
            style={{
              color: isSelected ? "#333" : "#ccc",
              fontSize: "0.9rem",
              margin: "0 0 0.5rem 0",
              lineHeight: 1.3,
            }}
          >
            {card.description}
          </p>

          {/* Cost Display */}
          {card.cost && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <span
                style={{
                  color: isAffordable ? "#00ff00" : "#ff0000",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                }}
              >
                💰 {card.cost} points
              </span>
              {!isAffordable && (
                <span
                  style={{
                    color: "#ff0000",
                    fontSize: "0.7rem",
                    fontStyle: "italic",
                  }}
                >
                  Not enough points
                </span>
              )}
            </div>
          )}

          {/* Cooldown Display */}
          {card.cooldown && card.cooldown > 0 && (
            <div
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                background: "rgba(255, 0, 0, 0.8)",
                color: "#fff",
                padding: "0.2rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.7rem",
                fontWeight: "bold",
              }}
            >
              {card.cooldown}s
            </div>
          )}

          {/* Disabled Overlay */}
          {isDisabled && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
              }}
            >
              <span
                style={{
                  color: "#ff0000",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                {card.cost && !isAffordable
                  ? "Insufficient Points"
                  : "Unavailable"}
              </span>
            </div>
          )}

          {/* Hover Effect */}
          {isHovered && !isDisabled && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent)",
                animation: "shimmer 1.5s infinite",
              }}
            />
          )}
        </div>
      );
    });
  }, [cards, selectedCard, hoveredCard, canAfford, handleCardClick]);

  if (!isVisible || cards.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        maxWidth: "90vw",
        padding: "0 1rem",
      }}
    >
      {renderedCards}

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default RoomActionCards;
