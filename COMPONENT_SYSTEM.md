# Automated Component System

This document describes the automated component scanning and configuration system for the 3D Editor.

## 🏗️ Architecture

The system consists of several key components:

### 1. **Component Scanner** (`src/utils/componentScanner.ts`)
- Automatically scans directories for React components
- Extracts TypeScript interfaces and prop metadata
- Parses JSDoc comments for emoji and description
- Generates component configurations

### 2. **Component Loader** (`src/utils/componentLoader.ts`)
- Dynamically imports components at runtime
- Caches loaded components for performance
- Provides categorized access to components

### 3. **Configuration Generator** (`src/utils/generateEditorConfig.ts`)
- Generates TypeScript configuration files
- Creates separate configs for rooms, objects, and elements
- Auto-updates when components change

### 4. **Auto ThreeD Editor** (`src/components/AutoThreeDEditor.tsx`)
- Uses the automated system instead of manual configuration
- Dynamically loads and displays components
- Provides real-time component browsing

## 📁 Folder Structure

```
src/
├── components/
│   ├── rooms/           # Room components
│   │   ├── index.ts     # Auto-export file
│   │   ├── StartRoom.tsx
│   │   └── ...
│   ├── objects/         # 3D object components
│   │   ├── index.ts     # Auto-export file
│   │   └── ...
│   ├── roomElements/    # Reusable room elements
│   │   ├── index.ts     # Auto-export file
│   │   ├── Tile.tsx
│   │   ├── Plank.tsx
│   │   └── ...
│   └── AutoThreeDEditor.tsx
├── utils/
│   ├── componentScanner.ts
│   ├── componentLoader.ts
│   └── generateEditorConfig.ts
└── config/              # Generated configurations
    ├── roomConfig.ts
    ├── objectConfig.ts
    ├── elementConfig.ts
    └── editorConfig.ts
```

## 🚀 Usage

### Adding New Components

1. **Create your component** in the appropriate folder:
   - `src/components/rooms/` for room components
   - `src/components/objects/` for 3D objects
   - `src/components/roomElements/` for reusable elements

2. **Add JSDoc comments** for metadata:
   ```typescript
   /**
    * @emoji 🏠
    * @description A cozy room with fireplace
    */
   export interface MyRoomProps {
     size?: number;
     hasFireplace?: boolean;
     // ... other props
   }
   ```

3. **Export from index.ts**:
   ```typescript
   export { default as MyRoom } from './MyRoom';
   ```

4. **Generate configurations**:
   ```bash
   npm run generate-config
   ```

### Running the Auto Editor

```bash
# Start the development server
npm run dev

# The AutoThreeDEditor will automatically:
# - Scan all component directories
# - Extract prop metadata
# - Generate configurations
# - Load components dynamically
```

## 🔧 Configuration

### Component Metadata

The system automatically extracts:

- **Props**: From TypeScript interfaces
- **Types**: number, string, boolean, select, color, etc.
- **Options**: For select dropdowns
- **Constraints**: min, max, step for numbers
- **Emoji**: From JSDoc `@emoji` tags
- **Description**: From JSDoc `@description` tags

### Supported Prop Types

- `number` - Numeric input with optional min/max/step
- `string` - Text input
- `boolean` - Checkbox
- `select` - Dropdown with options
- `color` - Color picker
- `array` - Array input
- `object` - Object input

### JSDoc Tags

```typescript
/**
 * @emoji 🏠
 * @description A description of the component
 */
```

## 📝 Scripts

- `npm run generate-config` - Generate all configuration files
- `npm run scan-components` - Scan components and show metadata

## 🎯 Benefits

1. **No Manual Configuration**: Components are automatically discovered
2. **Type Safety**: Full TypeScript support with extracted interfaces
3. **Maintainable**: Add components without touching editor code
4. **Scalable**: Easy to add new component categories
5. **Consistent**: Standardized prop extraction and configuration

## 🔄 Workflow

1. **Develop**: Create components with proper TypeScript interfaces
2. **Document**: Add JSDoc comments for metadata
3. **Export**: Add to appropriate index.ts file
4. **Generate**: Run `npm run generate-config`
5. **Use**: Components appear automatically in the editor

## 🐛 Troubleshooting

### Component Not Appearing
- Check that the component is exported from index.ts
- Verify the component has a default export
- Ensure the file is in the correct directory

### Props Not Extracted
- Check that the interface follows the `ComponentNameProps` pattern
- Verify TypeScript types are properly defined
- Ensure optional props use `?` syntax

### Configuration Not Generated
- Check console for errors during generation
- Verify all dependencies are installed
- Ensure file paths are correct

## 🚀 Future Enhancements

- **Hot Reload**: Auto-regenerate configs on file changes
- **Prop Validation**: Runtime validation of prop values
- **Component Preview**: Thumbnail generation for components
- **Dependency Tracking**: Track component dependencies
- **Performance Metrics**: Component loading performance


