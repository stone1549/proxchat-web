import { useState } from "react";
import { Units, UnitSystems } from "../../utils";
import { useLocalStorage } from "../../hooks";

export type Settings = {
  unitSystem: UnitSystems;
  units: Units;
  radiusInMeters: number;
};

export const useSettings = () => {
  const [storedValue, setValue] = useLocalStorage("settings", {
    unitSystem: UnitSystems.metric,
    units: Units.m,
    radiusInMeters: 100,
  });
  const [settings, setSettings] = useState<Settings>(storedValue);

  const { unitSystem, units, radiusInMeters } = settings;

  const setSettingsFunc = (
    unitSystem: UnitSystems,
    units: Units,
    radiusInMeters: number
  ) => {
    setSettings({
      unitSystem,
      units,
      radiusInMeters,
    });
    setValue({
      unitSystem,
      units,
      radiusInMeters,
    });
  };
  return {
    unitSystem,
    units,
    radiusInMeters,
    setSettings: setSettingsFunc,
  };
};
