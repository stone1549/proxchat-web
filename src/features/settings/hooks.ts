import { useState } from "react";
import { Units, UnitSystems } from "../../utils";

export type Settings = {
  unitSystem: UnitSystems;
  units: Units;
  radiusInMeters: number;
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>({
    unitSystem: UnitSystems.metric,
    units: Units.m,
    radiusInMeters: 100,
  });
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
  };
  return {
    unitSystem,
    units,
    radiusInMeters,
    setSettings: setSettingsFunc,
  };
};
