import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import type { ColorTheme } from "./colors";
import { THEMES, DEFAULT_THEME } from "./colors";

interface ThemeContextType {
  currentTheme: ColorTheme;
  setTheme: (themeName: string) => void;
  availableThemes: string[];
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark",
}) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(
    THEMES[defaultTheme] || DEFAULT_THEME
  );

  const availableThemes = Object.keys(THEMES);
  const isDark =
    currentTheme.background === "#121212" ||
    currentTheme.background === "#000000" ||
    currentTheme.background === "#0A0A0A";

  const setTheme = (themeName: string) => {
    if (THEMES[themeName]) {
      setCurrentTheme(THEMES[themeName]);
      localStorage.setItem("selectedTheme", themeName);
    }
  };

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(THEMES[savedTheme]);
    }
  }, []);

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", currentTheme.primary);
    root.style.setProperty("--color-secondary", currentTheme.secondary);
    root.style.setProperty("--color-accent", currentTheme.accent);
    root.style.setProperty("--color-background", currentTheme.background);
    root.style.setProperty("--color-surface", currentTheme.surface);
    root.style.setProperty("--color-text", currentTheme.text);
    root.style.setProperty(
      "--color-text-secondary",
      currentTheme.textSecondary
    );
    root.style.setProperty("--color-border", currentTheme.border);
    root.style.setProperty("--color-success", currentTheme.success);
    root.style.setProperty("--color-warning", currentTheme.warning);
    root.style.setProperty("--color-error", currentTheme.error);
    root.style.setProperty("--color-info", currentTheme.info);
  }, [currentTheme]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Hook for getting theme-aware styles
export const useThemeStyles = () => {
  const { currentTheme } = useTheme();

  return {
    // Common component styles
    button: {
      primary: {
        backgroundColor: currentTheme.primary,
        color: currentTheme.text,
        border: `1px solid ${currentTheme.primary}`,
        borderRadius: "8px",
        padding: "12px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      },
      secondary: {
        backgroundColor: "transparent",
        color: currentTheme.primary,
        border: `1px solid ${currentTheme.primary}`,
        borderRadius: "8px",
        padding: "12px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      },
      danger: {
        backgroundColor: currentTheme.error,
        color: currentTheme.text,
        border: `1px solid ${currentTheme.error}`,
        borderRadius: "8px",
        padding: "12px 24px",
        cursor: "pointer",
        transition: "all 0.3s ease",
      },
    },
    card: {
      backgroundColor: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "12px",
      padding: "20px",
      boxShadow: `0 4px 6px rgba(0, 0, 0, ${
        currentTheme.isDark ? "0.3" : "0.1"
      })`,
    },
    input: {
      backgroundColor: currentTheme.surface,
      color: currentTheme.text,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "8px",
      padding: "12px",
      fontSize: "14px",
      outline: "none",
      transition: "border-color 0.3s ease",
    },
    panel: {
      backgroundColor: currentTheme.surface,
      border: `1px solid ${currentTheme.border}`,
      borderRadius: "8px",
      padding: "16px",
      color: currentTheme.text,
    },
    text: {
      primary: {
        color: currentTheme.text,
        fontSize: "16px",
        lineHeight: "1.5",
      },
      secondary: {
        color: currentTheme.textSecondary,
        fontSize: "14px",
        lineHeight: "1.4",
      },
      heading: {
        color: currentTheme.text,
        fontSize: "24px",
        fontWeight: "bold",
        lineHeight: "1.2",
      },
      subheading: {
        color: currentTheme.text,
        fontSize: "18px",
        fontWeight: "600",
        lineHeight: "1.3",
      },
    },
  };
};
