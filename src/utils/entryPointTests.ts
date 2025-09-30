/**
 * Test utilities and test cases for the Entry Point System
 * Run these tests to verify entry point functionality
 */

import type { Room, EntryPoint, EntryDirection } from '../types/map';
import {
  generateEntryPoints,
  getOppositeDirection,
  getDirectionBetweenRooms,
  findAvailableEntryPoint,
  connectEntryPoints,
  getEntryPointWorldPosition,
  getDirectionOffset,
} from './entryPointGenerator';
import {
  calculateDoorPositionFromEntryPoints,
  getRoomDoorsWithSpacing,
  applyDoorSpacing,
  getActiveEntryPointsByDirection,
} from './doorPositionFromEntryPoint';
import { validateEntryPoints } from './entryPointDebugger';
import { RoomType } from '../types/map';

/**
 * Test result interface
 */
interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

/**
 * Test suite runner
 */
export class EntryPointTestSuite {
  private results: TestResult[] = [];

  /**
   * Run all tests
   */
  async runAll(): Promise<void> {
    console.group('🧪 Entry Point System Tests');
    
    this.testEntryPointGeneration();
    this.testDirectionHelpers();
    this.testEntryPointConnection();
    this.testDoorPositioning();
    this.testMultipleDoors();
    this.testValidation();
    this.testEdgeCases();
    
    this.printResults();
    console.groupEnd();
  }

  /**
   * Test entry point generation
   */
  private testEntryPointGeneration(): void {
    const start = performance.now();
    
    try {
      // Test square room
      const squarePoints = generateEntryPoints('test_room', RoomType.NORMAL, 'square', 10);
      this.assert(
        'Square room has 4 entry points',
        squarePoints.length === 4,
        `Expected 4, got ${squarePoints.length}`
      );
      
      // Test hexagon room
      const hexagonPoints = generateEntryPoints('test_hex', RoomType.NORMAL, 'hexagon', 10);
      this.assert(
        'Hexagon room has 6 entry points',
        hexagonPoints.length === 6,
        `Expected 6, got ${hexagonPoints.length}`
      );
      
      // Test corridor
      const corridorPoints = generateEntryPoints('test_corridor', RoomType.CORRIDOR, 'square', 10);
      this.assert(
        'Corridor has 2 entry points',
        corridorPoints.length === 2,
        `Expected 2, got ${corridorPoints.length}`
      );
      
      // Verify corridor directions
      const directions = corridorPoints.map(ep => ep.direction);
      this.assert(
        'Corridor has north and south entry points',
        directions.includes('north') && directions.includes('south'),
        `Got directions: ${directions.join(', ')}`
      );
      
      // Verify all entry points have required properties
      squarePoints.forEach((ep, i) => {
        this.assert(
          `Entry point ${i} has id`,
          ep.id !== undefined && ep.id !== '',
          `Entry point missing id`
        );
        this.assert(
          `Entry point ${i} has position`,
          ep.position !== undefined && ep.position.x !== undefined && ep.position.z !== undefined,
          `Entry point missing position`
        );
        this.assert(
          `Entry point ${i} starts inactive`,
          ep.isActive === false,
          `Entry point should be inactive initially`
        );
      });
      
    } catch (error) {
      this.fail('Entry point generation', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Entry point generation tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test direction helper functions
   */
  private testDirectionHelpers(): void {
    const start = performance.now();
    
    try {
      // Test opposite directions
      this.assert(
        'North opposite is south',
        getOppositeDirection('north') === 'south',
        'Failed'
      );
      this.assert(
        'East opposite is west',
        getOppositeDirection('east') === 'west',
        'Failed'
      );
      
      // Test direction between rooms
      const dir1 = getDirectionBetweenRooms(0, 0, 1, 0); // East
      this.assert(
        'Direction (0,0) to (1,0) is east',
        dir1 === 'east',
        `Got ${dir1}`
      );
      
      const dir2 = getDirectionBetweenRooms(5, 5, 5, 4); // North
      this.assert(
        'Direction (5,5) to (5,4) is north',
        dir2 === 'north',
        `Got ${dir2}`
      );
      
      // Test non-adjacent rooms
      const dir3 = getDirectionBetweenRooms(0, 0, 2, 0); // Not adjacent
      this.assert(
        'Non-adjacent rooms return null',
        dir3 === null,
        `Got ${dir3}`
      );
      
      // Test direction offset
      const offsetNorth = getDirectionOffset('north');
      this.assert(
        'North offset is (0, -1)',
        offsetNorth.dx === 0 && offsetNorth.dz === -1,
        `Got (${offsetNorth.dx}, ${offsetNorth.dz})`
      );
      
    } catch (error) {
      this.fail('Direction helpers', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Direction helper tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test entry point connection
   */
  private testEntryPointConnection(): void {
    const start = performance.now();
    
    try {
      // Create test rooms
      const room1: Room = {
        id: 'room_1',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: [],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_1', RoomType.NORMAL, 'square', 10),
      };
      
      const room2: Room = {
        id: 'room_2',
        position: { x: 10, z: 0 },
        type: RoomType.NORMAL,
        connections: [],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_2', RoomType.NORMAL, 'square', 10),
      };
      
      // Find entry points to connect
      const ep1 = findAvailableEntryPoint(room1, 'east');
      const ep2 = findAvailableEntryPoint(room2, 'west');
      
      this.assert(
        'Found east entry point in room1',
        ep1 !== undefined,
        'Entry point not found'
      );
      this.assert(
        'Found west entry point in room2',
        ep2 !== undefined,
        'Entry point not found'
      );
      
      if (ep1 && ep2) {
        // Connect them
        connectEntryPoints(ep1, ep2);
        
        this.assert(
          'Entry points are connected',
          ep1.connectedTo === ep2.id && ep2.connectedTo === ep1.id,
          'Connection mismatch'
        );
        
        this.assert(
          'Entry points are active',
          ep1.isActive === true && ep2.isActive === true,
          'Entry points not activated'
        );
        
        // Test world position calculation
        const worldPos = getEntryPointWorldPosition(room1, ep1);
        this.assert(
          'World position calculated correctly',
          worldPos.x === room1.position.x + ep1.position.x &&
          worldPos.z === room1.position.z + ep1.position.z,
          `Got (${worldPos.x}, ${worldPos.z})`
        );
      }
      
    } catch (error) {
      this.fail('Entry point connection', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Entry point connection tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test door positioning from entry points
   */
  private testDoorPositioning(): void {
    const start = performance.now();
    
    try {
      // Create test room with connected entry points
      const room: Room = {
        id: 'room_test',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: ['room_target'],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_test', RoomType.NORMAL, 'square', 10),
      };
      
      // Manually activate an entry point
      if (room.entryPoints && room.entryPoints.length > 0) {
        const ep = room.entryPoints[0];
        ep.isActive = true;
        ep.connectedTo = 'room_target_entry_north_0';
        
        // Test door position calculation
        const doorPos = calculateDoorPositionFromEntryPoints(room, 'room_target', 0);
        
        this.assert(
          'Door position calculated',
          doorPos !== null,
          'Failed to calculate door position'
        );
        
        if (doorPos) {
          this.assert(
            'Door position has correct structure',
            doorPos.pos.length === 3 && doorPos.rot.length === 3,
            'Invalid door position structure'
          );
          
          this.assert(
            'Door Y position is 1.5',
            doorPos.pos[1] === 1.5,
            `Got Y = ${doorPos.pos[1]}`
          );
        }
      }
      
    } catch (error) {
      this.fail('Door positioning', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Door positioning tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test multiple doors on same wall
   */
  private testMultipleDoors(): void {
    const start = performance.now();
    
    try {
      // Create room with multiple doors on the same wall
      const room: Room = {
        id: 'room_multi',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: ['room_a', 'room_b', 'room_c'],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_multi', RoomType.NORMAL, 'square', 10),
      };
      
      // Activate multiple entry points on the north wall
      if (room.entryPoints) {
        const northPoints = room.entryPoints.filter(ep => ep.direction === 'north');
        
        // For this test, we'll manually create extra entry points on north wall
        if (northPoints.length > 0) {
          northPoints.forEach((ep, i) => {
            ep.isActive = true;
            ep.connectedTo = `room_${String.fromCharCode(97 + i)}_entry_south_0`;
          });
          
          // Test grouping by direction
          const grouped = getActiveEntryPointsByDirection(room);
          const northDoors = grouped.get('north');
          
          this.assert(
            'Grouped entry points by direction',
            grouped.size > 0,
            'No groups found'
          );
          
          // Test door spacing
          const basePos: [number, number, number] = [0, 1.5, -5];
          const spaced1 = applyDoorSpacing(basePos, 'north', 0, 3);
          const spaced2 = applyDoorSpacing(basePos, 'north', 1, 3);
          const spaced3 = applyDoorSpacing(basePos, 'north', 2, 3);
          
          this.assert(
            'Door spacing applied correctly',
            spaced1[0] !== spaced2[0] || spaced1[2] !== spaced2[2],
            'Doors not spaced'
          );
          
          // Test getRoomDoorsWithSpacing
          const doors = getRoomDoorsWithSpacing(room, room.connections);
          
          this.assert(
            'Generated door configurations',
            doors.length > 0,
            'No doors generated'
          );
        }
      }
      
    } catch (error) {
      this.fail('Multiple doors', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Multiple doors tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test validation functions
   */
  private testValidation(): void {
    const start = performance.now();
    
    try {
      // Create valid rooms
      const room1: Room = {
        id: 'room_1',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: ['room_2'],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_1', RoomType.NORMAL, 'square', 10),
      };
      
      const room2: Room = {
        id: 'room_2',
        position: { x: 10, z: 0 },
        type: RoomType.NORMAL,
        connections: ['room_1'],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: generateEntryPoints('room_2', RoomType.NORMAL, 'square', 10),
      };
      
      // Connect entry points
      const ep1 = findAvailableEntryPoint(room1, 'east');
      const ep2 = findAvailableEntryPoint(room2, 'west');
      
      if (ep1 && ep2) {
        connectEntryPoints(ep1, ep2);
      }
      
      // Validate
      const validation = validateEntryPoints([room1, room2]);
      
      this.assert(
        'Validation passed for valid rooms',
        validation.valid === true || validation.errors.length === 0,
        `Errors: ${validation.errors.join(', ')}`
      );
      
      // Test invalid case - create broken connection
      const brokenRoom: Room = {
        id: 'broken',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: ['nonexistent'],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: [
          {
            id: 'broken_entry_north_0',
            direction: 'north',
            position: { x: 0, z: -5 },
            isActive: true,
            connectedTo: 'nonexistent_entry_south_0',
          },
        ],
      };
      
      const brokenValidation = validateEntryPoints([brokenRoom]);
      
      this.assert(
        'Validation detects broken connections',
        brokenValidation.errors.length > 0,
        'Failed to detect error'
      );
      
    } catch (error) {
      this.fail('Validation', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Validation tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Test edge cases
   */
  private testEdgeCases(): void {
    const start = performance.now();
    
    try {
      // Room without entry points
      const emptyRoom: Room = {
        id: 'empty',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: [],
        size: 10,
        isVisited: false,
        isCurrent: false,
      };
      
      const doorPos = calculateDoorPositionFromEntryPoints(emptyRoom, 'target', 0);
      this.assert(
        'Handles room without entry points',
        doorPos === null,
        'Should return null'
      );
      
      // Room with no available entry points
      const fullRoom: Room = {
        id: 'full',
        position: { x: 0, z: 0 },
        type: RoomType.NORMAL,
        connections: [],
        size: 10,
        isVisited: false,
        isCurrent: false,
        entryPoints: [
          {
            id: 'full_entry_north_0',
            direction: 'north',
            position: { x: 0, z: -5 },
            isActive: true,
            connectedTo: 'other',
          },
        ],
      };
      
      const availableEP = findAvailableEntryPoint(fullRoom, 'north');
      this.assert(
        'Finds no available entry point when all are active',
        availableEP === undefined,
        'Should return undefined'
      );
      
    } catch (error) {
      this.fail('Edge cases', (error as Error).message);
    }
    
    const duration = performance.now() - start;
    console.log(`✓ Edge case tests completed in ${duration.toFixed(2)}ms`);
  }

  /**
   * Assert helper
   */
  private assert(name: string, condition: boolean, message: string): void {
    this.results.push({
      name,
      passed: condition,
      message,
      duration: 0,
    });
    
    if (!condition) {
      console.error(`❌ ${name}: ${message}`);
    }
  }

  /**
   * Fail helper
   */
  private fail(name: string, message: string): void {
    this.results.push({
      name,
      passed: false,
      message,
      duration: 0,
    });
    console.error(`❌ ${name}: ${message}`);
  }

  /**
   * Print test results summary
   */
  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log(`Test Results: ${passed}/${total} passed (${passRate}%)`);
    console.log('═══════════════════════════════════════');
    
    if (failed > 0) {
      console.log('');
      console.log('Failed tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ❌ ${r.name}: ${r.message}`);
        });
    } else {
      console.log('');
      console.log('✅ All tests passed!');
    }
  }
}

/**
 * Run all entry point tests
 * Usage: import and call runEntryPointTests() in your dev console
 */
export async function runEntryPointTests(): Promise<void> {
  const suite = new EntryPointTestSuite();
  await suite.runAll();
}



