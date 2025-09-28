import React from "react";
import StartScreen from "./components/StartScreen";
import ThreeDEditor from "./components/ThreeDEditor";
import TexturePainterLauncher from "./components/TexturePainterLauncher";
import MosaicCreatorLauncher from "./components/MosaicCreatorLauncher";
import TexturePainterExample from "./components/TexturePainterExample";
import { ThemeProvider } from "./themes";
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
  const showMosaicCreator = urlParams.get("mosaic-creator") === "true";
  const showTexturePainterExample =
    urlParams.get("texture-painter-example") === "true";

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
    return (
      <ThemeProvider>
        <ThreeDEditor />
      </ThemeProvider>
    );
  }

  if (showTexturePainter) {
    return (
      <ThemeProvider>
        <TexturePainterLauncher />
      </ThemeProvider>
    );
  }

  if (showMosaicCreator) {
    return (
      <ThemeProvider>
        <MosaicCreatorLauncher />
      </ThemeProvider>
    );
  }

  if (showTexturePainterExample) {
    return (
      <ThemeProvider>
        <TexturePainterExample />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <StartScreen />
    </ThemeProvider>
  );
}

export default App;
