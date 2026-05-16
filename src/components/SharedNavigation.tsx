import React from "react";

interface SharedNavigationProps {
  currentPage:
    | "game"
    | "editor"
    | "texture-painter"
    | "mosaic-creator"
    | "room-builder";
  className?: string;
}

const SharedNavigation: React.FC<SharedNavigationProps> = ({
  currentPage,
  className = "",
}) => {
  const navItems = [
    {
      id: "game",
      label: "Game",
      url: "/",
      description: "Main Game",
    },
    {
      id: "editor",
      label: "3D Editor",
      url: "?editor=true",
      description: "3D Scene Builder",
    },
    {
      id: "room-builder",
      label: "Room Builder",
      url: "?room-builder=true",
      description: "Build Rooms from Biomes",
    },
    {
      id: "texture-painter",
      label: "Textures",
      url: "?texture-painter=true",
      description: "Advanced Texture Painter with Library",
    },
    {
      id: "mosaic-creator",
      label: "Mosaic",
      url: "?mosaic-creator=true",
      description: "Texture Creation Tool",
    },
  ];

  return (
    <nav
      className={`shared-navigation ${className}`.trim()}
      aria-label="Application modes"
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => (window.location.href = item.url)}
          className="shared-navigation__item"
          aria-current={currentPage === item.id ? "page" : undefined}
          title={item.description}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
};

export default SharedNavigation;
