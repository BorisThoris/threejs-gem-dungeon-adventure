// Direct DOM manipulation to avoid React re-renders
import { uiEvents, UI_EVENTS } from './uiEvents';
import { refBasedPlayerState } from './refBasedPlayerState';

class DOMUIManager {
  private mouseLookIndicator: HTMLElement | null = null;
  private gameUI: HTMLElement | null = null;
  private instructions: HTMLElement | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

    // Create mouse look indicator
    this.mouseLookIndicator = document.createElement('div');
    this.mouseLookIndicator.id = 'mouse-look-indicator';
    this.mouseLookIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-family: monospace;
      pointer-events: none;
      border: 1px solid #00ff00;
      display: none;
      z-index: 1001;
    `;
    this.mouseLookIndicator.textContent = '🖱️ Mouse Look Active - Release Right Mouse Button to Exit';
    document.body.appendChild(this.mouseLookIndicator);

    // Create game UI
    this.gameUI = document.createElement('div');
    this.gameUI.id = 'game-ui';
    this.gameUI.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.7);
      color: #ffffff;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      font-family: 'Press Start 2P', cursive;
      pointer-events: auto;
      min-width: 200px;
      z-index: 1000;
    `;
    document.body.appendChild(this.gameUI);

    // Create instructions
    this.instructions = document.createElement('div');
    this.instructions.id = 'game-instructions';
    this.instructions.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 12px;
      font-family: 'Press Start 2P', cursive;
      text-align: center;
      pointer-events: none;
      z-index: 1000;
    `;
    this.instructions.textContent = 'WASD to move • Right-click and hold to look around • X to pause';
    document.body.appendChild(this.instructions);

    // Listen to UI events
    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    uiEvents.on(UI_EVENTS.MOUSE_LOOK_START, () => {
      if (this.mouseLookIndicator) {
        this.mouseLookIndicator.style.display = 'block';
      }
      // Hide cursor when mouse look is active
      document.body.style.cursor = 'none';
    });

    uiEvents.on(UI_EVENTS.MOUSE_LOOK_END, () => {
      if (this.mouseLookIndicator) {
        this.mouseLookIndicator.style.display = 'none';
      }
      // Show cursor when mouse look is inactive
      document.body.style.cursor = 'default';
    });

    // Subscribe to ref-based player state changes
    refBasedPlayerState.subscribe(() => {
      this.updatePlayerStats(refBasedPlayerState.getStats());
    });

    uiEvents.on(UI_EVENTS.INVENTORY_UPDATE, (inventory) => {
      this.updateInventory(inventory);
    });

    uiEvents.on(UI_EVENTS.ROOM_CHANGE, (roomName) => {
      this.updateCurrentRoom(roomName);
    });
  }

  private updatePlayerStats(stats: any) {
    if (!this.gameUI) return;

    this.gameUI.innerHTML = `
      <h3 style="margin: 0 0 10px 0; color: #00ff00;">Player Stats</h3>
      <div>Health: ${stats.health}</div>
      <div>Mana: ${stats.mana}</div>
      <div>Points: ${stats.points}</div>
      <div>Experience: ${stats.experience}</div>
      <div>Strength: ${stats.strength}</div>
      <div>Defense: ${stats.defense}</div>
      <div>Intelligence: ${stats.intelligence}</div>
      <h4 style="margin: 15px 0 5px 0; color: #00ff00;">Inventory</h4>
      <div id="inventory-list" style="max-height: 100px; overflow-y: auto;"></div>
      <div style="margin-top: 10px; font-size: 10px; color: #888;">
        Room: <span id="current-room">Unknown</span>
      </div>
    `;
  }

  private updateInventory(inventory: any[]) {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return;

    inventoryList.innerHTML = inventory.map((item, index) => `
      <div style="
        padding: 5px;
        margin: 2px 0;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
      " onclick="window.dispatchEvent(new CustomEvent('itemUse', { detail: ${JSON.stringify(item)} }))">
        ${item.name} x${item.quantity || 1}
      </div>
    `).join('');
  }

  private updateCurrentRoom(roomName: string) {
    const currentRoomElement = document.getElementById('current-room');
    if (currentRoomElement) {
      currentRoomElement.textContent = roomName;
    }
  }

  destroy() {
    if (this.mouseLookIndicator) {
      this.mouseLookIndicator.remove();
      this.mouseLookIndicator = null;
    }
    if (this.gameUI) {
      this.gameUI.remove();
      this.gameUI = null;
    }
    if (this.instructions) {
      this.instructions.remove();
      this.instructions = null;
    }
    this.isInitialized = false;
  }
}

export const domUIManager = new DOMUIManager();
