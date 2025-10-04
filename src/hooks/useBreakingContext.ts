import { useContext } from "react";
import { BreakingContext } from "../contexts/BreakingContextDefinition";

export const useBreakingContext = () => {
  const context = useContext(BreakingContext);
  if (!context) {
    throw new Error(
      "useBreakingContext must be used within a BreakingProvider"
    );
  }
  return context;
};
