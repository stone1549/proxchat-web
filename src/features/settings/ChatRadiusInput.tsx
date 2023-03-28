import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Noop } from "react-hook-form";
import {
  convertToDesiredUnits,
  convertToMeters,
  MetricUnits,
  roundTo,
  StandardUnits,
  Units,
  UnitSystems,
} from "../../utils";
import { SettingsContext } from "./context";
import { TextField, ToggleButton, ToggleButtonGroup } from "@mui/material";

const unitsSystemButtons = [
  { label: "metric", value: UnitSystems.metric },
  { label: "standard", value: UnitSystems.standard },
];

export type ChatRadiusInputProps = {
  value: string;
  onBlur: Noop;
  onChange: (...event: any[]) => void;
  disabled: boolean;
};

export const ChatRadiusInput: React.FunctionComponent<ChatRadiusInputProps> = ({
  onBlur,
  onChange,
  disabled,
}) => {
  const {
    unitSystem: savedUnitSystem,
    units: savedUnits,
    radiusInMeters,
    setSettings,
  } = useContext(SettingsContext);
  const savedAdjustedRadius = convertToDesiredUnits(
    radiusInMeters,
    Units.m,
    savedUnits
  ).toString();
  const [adjustedRadius, setAdjustedRadius] = useState(savedAdjustedRadius);
  const adjustedRadiusRef = useRef<HTMLInputElement>(null);

  const unitButtons = useMemo(() => {
    switch (savedUnitSystem) {
      case "metric":
        return MetricUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
      case "standard":
        return StandardUnits.map((u) => {
          return {
            value: u,
            label: u,
          };
        });
      default:
        throw new Error("unhandled unit system");
    }
  }, [savedUnitSystem]);

  useEffect(() => {
    const radiusInMeters = roundTo(
      convertToMeters(Number.parseFloat(adjustedRadius), savedUnits),
      2
    );
    onChange(radiusInMeters.toString());
  }, [adjustedRadius, savedUnits]);

  const onChangeAdjustedRadius: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = useMemo(() => {
    return (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      setAdjustedRadius(event.target.value);
    };
  }, [setAdjustedRadius]);

  const onRadiusUnitsChange = useMemo(() => {
    return async (_: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      const newAdjustedRadius = roundTo(
        convertToDesiredUnits(
          Number.parseFloat(adjustedRadius),
          savedUnits,
          Units[value as keyof typeof Units]
        ),
        2
      );

      setSettings(
        savedUnitSystem,
        Units[value as keyof typeof Units],
        radiusInMeters
      );
      setAdjustedRadius(newAdjustedRadius.toString());
    };
  }, [adjustedRadius, savedUnits, savedUnitSystem, setAdjustedRadius]);

  const onRadiusUnitsSystemChange = useMemo(() => {
    return async (_: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
      switch (UnitSystems[value as keyof typeof UnitSystems]) {
        case UnitSystems.standard:
          const newAdjustedRadius = roundTo(
            convertToDesiredUnits(
              Number.parseFloat(adjustedRadius),
              savedUnits,
              Units.ft
            ),
            2
          );
          setSettings(UnitSystems.standard, Units.ft, radiusInMeters);
          setAdjustedRadius(newAdjustedRadius.toString());
          break;
        case UnitSystems.metric:
          const newAdjustedRadius2 = roundTo(
            convertToDesiredUnits(
              Number.parseFloat(adjustedRadius),
              savedUnits,
              Units.m
            ),
            2
          );
          setSettings(UnitSystems.metric, Units.m, radiusInMeters);
          setAdjustedRadius(newAdjustedRadius2.toString());
          break;
        default:
          throw new Error("unsupported units system");
      }
    };
  }, [adjustedRadius, savedUnits, savedUnitSystem, setAdjustedRadius]);

  return (
    <>
      <br />
      <TextField
        label={`radius (${savedUnits})`}
        ref={adjustedRadiusRef}
        onBlur={onBlur}
        onChange={onChangeAdjustedRadius}
        value={adjustedRadius}
        inputMode={"decimal"}
        disabled={disabled}
      />
      <br />
      <br />
      <ToggleButtonGroup
        value={savedUnits}
        exclusive
        onChange={onRadiusUnitsChange}
        aria-label="text alignment"
      >
        {unitButtons.map((b) => (
          <ToggleButton value={b.value} key={b.value}>
            {b.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <br />
      <br />
      <ToggleButtonGroup
        value={savedUnitSystem}
        exclusive
        onChange={onRadiusUnitsSystemChange}
      >
        {unitsSystemButtons.map((b) => (
          <ToggleButton value={b.value} key={b.value}>
            {b.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  );
};
