import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import RoomActionCards, { type ActionCard } from "./RoomActionCards";
import { ComponentLoader } from "../utils/componentLoader";
import { ComponentConfig } from "../utils/componentScanner";

// Room configuration interface
interface RoomConfig {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  title: string;
  emoji: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any;
  availableActions?: ActionCard[];
  editableProps?: PropConfig[];
}

interface PropConfig {
  key: string;
  label?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "array"
    | "object"
    | "select"
    | "color";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

// Auto-generated component configurations
let ROOM_CONFIGS: RoomConfig[] = [];
let OBJECT_CONFIGS: RoomConfig[] = [];
let ELEMENT_CONFIGS: RoomConfig[] = [];

// Ground plane for the editor
const EditorGround: React.FC = () => (
  <RigidBody type="fixed" colliders="trimesh">
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial color="#2a2a2a" />
    </mesh>
  </RigidBody>
);

// Grid helper for reference
const GridHelper: React.FC = () => (
  <gridHelper args={[50, 50, "#444", "#444"]} position={[0, -0.9, 0]} />
);

// Loading component
const LoadingFallback: React.FC = () => (
  <Html center>
    <div style={{ color: "white", fontSize: "24px" }}>
      Loading components...
    </div>
  </Html>
);

// Main editor component
const AutoThreeDEditor: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<RoomConfig | null>(
    null
  );
  const [selectedObject, setSelectedObject] = useState<RoomConfig | null>(null);
  const [selectedElement, setSelectedElement] = useState<RoomConfig | null>(
    null
  );
  const [componentProps, setComponentProps] = useState<any>({});
  const [objectProps, setObjectProps] = useState<any>({});
  const [elementProps, setElementProps] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setIsLoading(true);
      const loader = ComponentLoader.getInstance();

      // Load all component types
      const [rooms, objects, elements] = await Promise.all([
        loader.getRoomComponents(),
        loader.getObjectComponents(),
        loader.getElementComponents(),
      ]);

      ROOM_CONFIGS = rooms;
      OBJECT_CONFIGS = objects;
      ELEMENT_CONFIGS = elements;

      // Set default selections
      if (rooms.length > 0) {
        setSelectedComponent(rooms[0]);
        setComponentProps(rooms[0].props || {});
      }
      if (objects.length > 0) {
        setSelectedObject(objects[0]);
        setObjectProps(objects[0].props || {});
      }
      if (elements.length > 0) {
        setSelectedElement(elements[0]);
        setElementProps(elements[0].props || {});
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load components:", err);
      setError(
        "Failed to load components. Please check the console for details."
      );
      setIsLoading(false);
    }
  };

  const handleComponentSelect = (component: RoomConfig) => {
    setSelectedComponent(component);
    setComponentProps(component.props || {});
  };

  const handleObjectSelect = (object: RoomConfig) => {
    setSelectedObject(object);
    setObjectProps(object.props || {});
  };

  const handleElementSelect = (element: RoomConfig) => {
    setSelectedElement(element);
    setElementProps(element.props || {});
  };

  const updateProps = (
    newProps: any,
    type: "component" | "object" | "element"
  ) => {
    switch (type) {
      case "component":
        setComponentProps(newProps);
        break;
      case "object":
        setObjectProps(newProps);
        break;
      case "element":
        setElementProps(newProps);
        break;
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a1a",
          color: "white",
        }}
      >
        <div>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>
            Loading 3D Editor...
          </div>
          <div>Scanning components and generating configurations...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a1a",
          color: "red",
        }}
      >
        <div>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>
            Error Loading Editor
          </div>
          <div>{error}</div>
          <button
            onClick={loadComponents}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#333",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1a1a1a" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          background: "#2a2a2a",
          padding: "20px",
          overflowY: "auto",
          borderRight: "1px solid #444",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "20px" }}>3D Editor</h2>

        {/* Rooms Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#4CAF50", marginBottom: "15px" }}>🏠 Rooms</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ROOM_CONFIGS.map((room) => (
              <button
                key={room.type}
                onClick={() => handleComponentSelect(room)}
                style={{
                  padding: "10px",
                  background:
                    selectedComponent?.type === room.type ? "#4CAF50" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>{room.emoji}</span>
                <div>
                  <div style={{ fontWeight: "bold" }}>{room.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {room.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Objects Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#2196F3", marginBottom: "15px" }}>📦 Objects</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {OBJECT_CONFIGS.map((object) => (
              <button
                key={object.type}
                onClick={() => handleObjectSelect(object)}
                style={{
                  padding: "10px",
                  background:
                    selectedObject?.type === object.type ? "#2196F3" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>{object.emoji}</span>
                <div>
                  <div style={{ fontWeight: "bold" }}>{object.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {object.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Elements Section */}
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ color: "#FF9800", marginBottom: "15px" }}>
            🧩 Elements
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {ELEMENT_CONFIGS.map((element) => (
              <button
                key={element.type}
                onClick={() => handleElementSelect(element)}
                style={{
                  padding: "10px",
                  background:
                    selectedElement?.type === element.type ? "#FF9800" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>{element.emoji}</span>
                <div>
                  <div style={{ fontWeight: "bold" }}>{element.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {element.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3D Viewport */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Physics>
              <Environment preset="sunset" />
              <ambientLight intensity={0.4} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
              />

              <EditorGround />
              <GridHelper />

              {/* Render selected components */}
              {selectedComponent && (
                <selectedComponent.component {...componentProps} />
              )}

              {selectedObject && <selectedObject.component {...objectProps} />}

              {selectedElement && (
                <selectedElement.component {...elementProps} />
              )}
            </Physics>

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
};

export default AutoThreeDEditor;

