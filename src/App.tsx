import React from "react";
import StartScreen from "./components/StartScreen";
import ThreeDEditor from "./components/ThreeDEditor";
import TexturePainterLauncher from "./components/TexturePainterLauncher";
import "./App.css";

function App() {
  console.log("=== APP COMPONENT LOADED ===");
  console.log(
    "Environment:",
    window.navigator.userAgent.toLowerCase().includes("electron")
      ? "Electron"
      : "Web Browser"
  );

  // Check URL parameter to show editor or texture painter
  const urlParams = new URLSearchParams(window.location.search);
  const showEditor = urlParams.get("editor") === "true";
  const showTexturePainter = urlParams.get("texture-painter") === "true";

  // Add CSS class to root element for editor mode
  React.useEffect(() => {
    const rootElement = document.getElementById("root");
    const bodyElement = document.body;
    const htmlElement = document.documentElement;

    if (showEditor) {
      rootElement?.classList.add("editor-mode");
      bodyElement?.classList.add("editor-mode");
      htmlElement?.classList.add("editor-mode");
    } else {
      rootElement?.classList.remove("editor-mode");
      bodyElement?.classList.remove("editor-mode");
      htmlElement?.classList.remove("editor-mode");
    }
  }, [showEditor]);

  if (showEditor) {
    return <ThreeDEditor />;
  }

  if (showTexturePainter) {
    return <TexturePainterLauncher />;
  }

  return <StartScreen />;
}

export default App;
