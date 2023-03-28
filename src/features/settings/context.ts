import { createContext } from "react";
import { Units, UnitSystems } from "../../utils";

export type SettingsContextValue = {
  unitSystem: UnitSystems;
  units: Units;
  radiusInMeters: number;
  setSettings: (
    unitSystem: UnitSystems,
    units: Units,
    radiusInMeters: number
  ) => void;
};

export const SettingsContext = createContext<SettingsContextValue>({
  unitSystem: UnitSystems.metric,
  units: Units.m,
  radiusInMeters: 100,
  setSettings: () => {
    throw new Error("default implementation");
  },
});
