import StartScreen from "./components/StartScreen";
import "./App.css";

function App() {
  console.log("=== APP COMPONENT LOADED ===");
  console.log(
    "Environment:",
    window.navigator.userAgent.toLowerCase().includes("electron")
      ? "Electron"
      : "Web Browser"
  );

  return <StartScreen />;
}

export default App;
