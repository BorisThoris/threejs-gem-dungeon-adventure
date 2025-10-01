import React, { useState, useEffect } from "react";
import { loadTextureFromImage } from "../utils/textureUtils";
import * as THREE from "three";

const TextureLoadingTest: React.FC = () => {
  const [textureStatus, setTextureStatus] = useState<{
    [key: string]: { loaded: boolean; error?: string };
  }>({});

  const testTextures = ["wood", "brick", "cobblestone"];

  useEffect(() => {
    const testTextureLoading = async () => {
      const status: { [key: string]: { loaded: boolean; error?: string } } = {};

      for (const textureId of testTextures) {
        try {
          const texture = await loadTextureFromImage(textureId);
          status[textureId] = {
            loaded: true,
            error: undefined,
          };
          console.log(`✅ Texture ${textureId} loaded successfully:`, texture);
        } catch (error) {
          status[textureId] = {
            loaded: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
          console.error(`❌ Failed to load texture ${textureId}:`, error);
        }
      }

      setTextureStatus(status);
    };

    testTextureLoading();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: "410px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <div>
        <strong>Texture Loading Test</strong>
      </div>
      {testTextures.map((textureId) => {
        const status = textureStatus[textureId];
        if (!status) {
          return (
            <div key={textureId} style={{ color: "#FFA500" }}>
              {textureId}: ⏳ Loading...
            </div>
          );
        }
        return (
          <div
            key={textureId}
            style={{ color: status.loaded ? "#4CAF50" : "#F44336" }}
          >
            {textureId}: {status.loaded ? "✅ Loaded" : `❌ ${status.error}`}
          </div>
        );
      })}
    </div>
  );
};

export default TextureLoadingTest;
