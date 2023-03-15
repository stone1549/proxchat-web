import React, { useContext, useEffect, useMemo } from "react";
import { ChatContext } from "./context";
import { Box, Fab, TextField } from "@mui/material";
import { useForm, Controller } from "react-hook-form";

type FormData = {
  message: "";
};

export const ChatInput: React.FunctionComponent = () => {
  const { sendMessage, position } = useContext(ChatContext);

  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitted,
      isSubmitSuccessful,
      isSubmitting,
      isValid,
      isValidating,
    },
    reset: resetForm,
  } = useForm<FormData>({
    defaultValues: {
      message: "",
    },
  });

  const onSubmit = useMemo(() => {
    return (data: FormData) => {
      if (position === undefined) {
        return;
      }

      sendMessage(data.message, position);
    };
  }, [sendMessage, position]);

  useEffect(() => {
    if (isSubmitted && isSubmitSuccessful) {
      resetForm();
    } else if (isSubmitted && errors.root) {
      resetForm();
    }
  }, [isSubmitted, isSubmitSuccessful]);
  const enableSendButton =
    !isSubmitted &&
    !isSubmitSuccessful &&
    !isSubmitting &&
    !isValidating &&
    isValid;
  return (
    <Box sx={styles.chatInputContainer}>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <Controller
          control={control}
          rules={{
            required: true,
            min: 1,
            max: 500,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              sx={styles.chatInputText}
              type="text"
              value={value}
              onBlur={onBlur}
              onChange={onChange}
            />
          )}
          name="message"
        />
        <Fab
          sx={styles.chatInputButton}
          type="submit"
          variant="circular"
          size="large"
          color="primary"
          disabled={!enableSendButton}
        >
          Send
        </Fab>
      </form>
    </Box>
  );
};

const styles = {
  chatInputContainer: {
    flex: 1,
    flexDirection: "row",
    height: "5vh",
    width: "100%",
    padding: 0,
    marginTop: 2,
  },
  chatInputText: {
    width: "80%",
    alignSelf: "flex-start",
  },
  chatInputButton: {
    float: "right",
    marginRight: 2,
  },
};
