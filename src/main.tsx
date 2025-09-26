import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

console.log("=== MAIN.TSX LOADED ===");
console.log(
  "Environment:",
  window.navigator.userAgent.toLowerCase().includes("electron")
    ? "Electron"
    : "Web Browser"
);

// Force multiple console methods to ensure visibility
console.warn("=== MAIN.TSX WARN ===");
console.error("=== MAIN.TSX ERROR ===");

// Test if console is working
setTimeout(() => {
  console.log("=== MAIN.TSX DELAYED TEST ===");
}, 1000);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
