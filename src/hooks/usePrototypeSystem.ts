import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  universalPrototypeManager, 
  createGameObject, 
  createRoom,
  createTile,
  createWall,
  createStair,
  createDoor,
  type GameObjectPrototype,
  type RoomPrototype 
} from '../types/UniversalPrototypeSystem';

// Hook for managing a single prototype
export const usePrototype = (id: string) => {
  const [prototype, setPrototype] = useState<GameObjectPrototype | RoomPrototype | undefined>(
    universalPrototypeManager.getPrototype(id) as GameObjectPrototype | RoomPrototype
  );

  const updatePrototype = useCallback((updates: Partial<GameObjectPrototype | RoomPrototype>) => {
    const current = universalPrototypeManager.getPrototype(id);
    if (current) {
      Object.assign(current, updates);
      setPrototype({ ...current } as GameObjectPrototype | RoomPrototype);
    }
  }, [id]);

  const executeAction = useCallback((actionId: string, context?: unknown) => {
    const current = universalPrototypeManager.getPrototype(id);
    if (current && current.actions) {
      const action = current.actions.find(a => a.id === actionId);
      if (action && (!action.canExecute || action.canExecute(current, context))) {
        action.execute(current, context);
        setPrototype({ ...current } as GameObjectPrototype | RoomPrototype);
      }
    }
  }, [id]);

  return {
    prototype,
    updatePrototype,
    executeAction,
  };
};

// Hook for managing a room and its objects
export const useRoom = (roomId: string) => {
  const [room, setRoom] = useState<RoomPrototype | undefined>(
    universalPrototypeManager.getRoom(roomId)
  );
  const [objects, setObjects] = useState<GameObjectPrototype[]>([]);

  useEffect(() => {
    const roomData = universalPrototypeManager.getRoom(roomId);
    if (roomData) {
      setRoom(roomData);
      setObjects(universalPrototypeManager.getObjectsInRoom(roomId));
    }
  }, [roomId]);

  const addObject = useCallback((object: GameObjectPrototype) => {
    if (room) {
      room.addObject(object.id);
      object.roomId = roomId;
      setObjects(prev => [...prev, object]);
      setRoom({ ...room });
    }
  }, [room, roomId]);

  const removeObject = useCallback((objectId: string) => {
    if (room) {
      room.removeObject(objectId);
      setObjects(prev => prev.filter(obj => obj.id !== objectId));
      setRoom({ ...room });
    }
  }, [room]);

  const executeActionOnAllObjects = useCallback((actionId: string, context?: unknown) => {
    universalPrototypeManager.executeActionInRoom(roomId, actionId, context);
    setObjects(universalPrototypeManager.getObjectsInRoom(roomId));
  }, [roomId]);

  const executeActionOnType = useCallback((objectType: string, actionId: string, context?: unknown) => {
    const roomObjects = objects.filter(obj => obj.objectType === objectType);
    roomObjects.forEach(obj => {
      if (obj.actions) {
        const action = obj.actions.find(a => a.id === actionId);
        if (action && (!action.canExecute || action.canExecute(obj, context))) {
          action.execute(obj, context);
        }
      }
    });
    setObjects(universalPrototypeManager.getObjectsInRoom(roomId));
  }, [objects, roomId]);

  return {
    room,
    objects,
    addObject,
    removeObject,
    executeActionOnAllObjects,
    executeActionOnType,
  };
};

// Hook for managing all prototypes
export const usePrototypeSystem = () => {
  const [prototypes, setPrototypes] = useState<GameObjectPrototype[]>([]);
  const [rooms, setRooms] = useState<RoomPrototype[]>([]);

  useEffect(() => {
    setPrototypes(universalPrototypeManager.getAllGameObjects());
    setRooms(universalPrototypeManager.getAllRooms());
  }, []);

  const createObject = useCallback((type: 'tile' | 'wall' | 'stair' | 'door', position: [number, number, number], roomId?: string) => {
    let newObject: GameObjectPrototype;
    
    switch (type) {
      case 'tile':
        newObject = createTile(position, roomId);
        break;
      case 'wall':
        newObject = createWall(position, roomId);
        break;
      case 'stair':
        newObject = createStair(position, roomId);
        break;
      case 'door':
        newObject = createDoor(position, roomId);
        break;
      default:
        newObject = createGameObject({ objectType: type, position, roomId });
    }
    
    setPrototypes(prev => [...prev, newObject]);
    return newObject;
  }, []);

  const createRoomObject = useCallback((roomType: 'start' | 'puzzle' | 'enemy' | 'treasure' | 'boss' | 'custom') => {
    const newRoom = createRoom({ roomType });
    setRooms(prev => [...prev, newRoom]);
    return newRoom;
  }, []);

  const moveObjectToRoom = useCallback((objectId: string, roomId: string) => {
    const success = universalPrototypeManager.moveObjectToRoom(objectId, roomId);
    if (success) {
      setPrototypes(universalPrototypeManager.getAllGameObjects());
    }
    return success;
  }, []);

  const executeActionOnAll = useCallback((actionId: string, context?: unknown) => {
    prototypes.forEach(obj => {
      if (obj.actions) {
        const action = obj.actions.find(a => a.id === actionId);
        if (action && (!action.canExecute || action.canExecute(obj, context))) {
          action.execute(obj, context);
        }
      }
    });
    setPrototypes(universalPrototypeManager.getAllGameObjects());
  }, [prototypes]);

  return {
    prototypes,
    rooms,
    createObject,
    createRoomObject,
    moveObjectToRoom,
    executeActionOnAll,
  };
};

// Hook for managing a specific object type
export const useObjectType = (objectType: string) => {
  const [objects, setObjects] = useState<GameObjectPrototype[]>([]);

  useEffect(() => {
    const allObjects = universalPrototypeManager.getAllGameObjects();
    setObjects(allObjects.filter(obj => obj.objectType === objectType));
  }, [objectType]);

  const executeActionOnType = useCallback((actionId: string, context?: unknown) => {
    universalPrototypeManager.executeActionOnType(objectType, actionId, context);
    setObjects(universalPrototypeManager.getAllGameObjects().filter(obj => obj.objectType === objectType));
  }, [objectType]);

  return {
    objects,
    executeActionOnType,
  };
};

// Hook for managing object visibility
export const useObjectVisibility = () => {
  const [visibleObjects, setVisibleObjects] = useState<Set<string>>(new Set());

  const toggleVisibility = useCallback((objectId: string) => {
    const object = universalPrototypeManager.getGameObject(objectId);
    if (object) {
      object.isVisible = !object.isVisible;
      setVisibleObjects(prev => {
        const newSet = new Set(prev);
        if (object.isVisible) {
          newSet.add(objectId);
        } else {
          newSet.delete(objectId);
        }
        return newSet;
      });
    }
  }, []);

  const showAll = useCallback(() => {
    const allObjects = universalPrototypeManager.getAllGameObjects();
    allObjects.forEach(obj => {
      obj.isVisible = true;
    });
    setVisibleObjects(new Set(allObjects.map(obj => obj.id)));
  }, []);

  const hideAll = useCallback(() => {
    const allObjects = universalPrototypeManager.getAllGameObjects();
    allObjects.forEach(obj => {
      obj.isVisible = false;
    });
    setVisibleObjects(new Set());
  }, []);

  return {
    visibleObjects,
    toggleVisibility,
    showAll,
    hideAll,
  };
};

// Hook for managing object physics
export const useObjectPhysics = () => {
  const [physicsEnabled, setPhysicsEnabled] = useState<Set<string>>(new Set());

  const togglePhysics = useCallback((objectId: string) => {
    const object = universalPrototypeManager.getGameObject(objectId);
    if (object) {
      object.physics.enabled = !object.physics.enabled;
      setPhysicsEnabled(prev => {
        const newSet = new Set(prev);
        if (object.physics.enabled) {
          newSet.add(objectId);
        } else {
          newSet.delete(objectId);
        }
        return newSet;
      });
    }
  }, []);

  const enablePhysicsForType = useCallback((objectType: string) => {
    const objects = universalPrototypeManager.getAllGameObjects().filter(obj => obj.objectType === objectType);
    objects.forEach(obj => {
      obj.physics.enabled = true;
    });
    setPhysicsEnabled(prev => {
      const newSet = new Set(prev);
      objects.forEach(obj => newSet.add(obj.id));
      return newSet;
    });
  }, []);

  return {
    physicsEnabled,
    togglePhysics,
    enablePhysicsForType,
  };
};
