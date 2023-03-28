import React, { useContext, useMemo } from "react";
import { SettingsContext } from "./context";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Portal,
} from "@mui/material";
import { ChatRadiusInput } from "./ChatRadiusInput";

export type SettingsDialogProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export type SettingsFormData = {
  radius: string;
};

export const SettingsDialog: React.FunctionComponent<SettingsDialogProps> = ({
  visible,
  setVisible,
}) => {
  const hideDialog = () => setVisible(false);
  const { setSettings, unitSystem, units, radiusInMeters } =
    useContext(SettingsContext);

  const onSubmitRadius = useMemo(() => {
    return async (data: SettingsFormData) => {
      const newRadius = Number.parseFloat(data.radius);
      hideDialog();
      setSettings(unitSystem, units, newRadius);
    };
  }, [hideDialog, units, unitSystem]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, isDirty },
  } = useForm<SettingsFormData>({
    defaultValues: {
      radius: `${radiusInMeters}`,
    },
  });

  const disableSaveButton = !isValid || isSubmitting || !isDirty;

  return (
    <Portal>
      <Dialog open={visible}>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent>
          <Controller
            control={control}
            rules={{
              required: true,
              min: 0.000001,
              max: 4828032.0,
              pattern: /^\d+(\.\d+)?$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <ChatRadiusInput
                disabled={isSubmitting}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
              />
            )}
            name="radius"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={hideDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit(onSubmitRadius)}
            disabled={disableSaveButton}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Portal>
  );
};
