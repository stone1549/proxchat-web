import React, { useContext, useEffect, useMemo } from "react";
import {
  Button,
  Container,
  FormHelperText,
  Paper,
  TextField,
  Theme,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { AuthContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";
import { enumKeys } from "../../utils";
import { Gender } from "../../domain";
import { AuthError } from "../../api";

const genderButtons = () => {
  return enumKeys(Gender).map((g) => {
    return {
      label: g,
      value: g,
    };
  });
};

type FormData = {
  email: string;
  username: string;
  password: string;
  gender: string;
  age: string;
  topics: Set<string>;
};

export const Signup: React.FunctionComponent = () => {
  const { signup, token, error } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
      isValidating,
      isValid,
      isSubmitSuccessful,
    },
  } = useForm<FormData>({
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
      username: "",
      gender: "",
      age: "",
      topics: new Set<string>(),
    },
  });

  const onSubmit = useMemo(() => {
    return async (data: FormData) => {
      const { email, username, password, gender, age, topics } = data;
      await signup(
        email,
        username,
        password,
        gender as keyof typeof Gender,
        Number.parseInt(age),
        topics
      );
    };
  }, [signup]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  const loading = isSubmitting;
  const disableSignupButton =
    !isValid || isValidating || (isSubmitSuccessful && !error) || isSubmitting;
  return (
    <Container sx={styles.container}>
      <Paper sx={styles.signupPaper}>
        {error && (
          <FormHelperText error={true} sx={styles.error}>
            {error}
          </FormHelperText>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            rules={{
              required: true,
              min: 5,
              max: 24,
              pattern:
                /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                type="text"
                label="Email"
                name="email"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                fullWidth={true}
                disabled={isSubmitting}
              />
            )}
            name="email"
          />
          {errors.email && (
            <FormHelperText error={true}>
              {errors.email.type === "required"
                ? "email required"
                : "invalid email"}
            </FormHelperText>
          )}
          <br />
          <br />
          <Controller
            control={control}
            rules={{
              required: true,
              min: 8,
              max: 24,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                type="text"
                label="username"
                name="username"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                fullWidth={true}
                disabled={isSubmitting}
              />
            )}
            name="username"
          />
          {errors.username && (
            <FormHelperText error={true}>
              {errors.username.type === "required"
                ? "username required"
                : "invalid username"}
            </FormHelperText>
          )}
          <br />
          <br />
          <Controller
            control={control}
            rules={{
              required: true,
              min: 8,
              max: 24,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                type="password"
                label="Password"
                name="password"
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                fullWidth={true}
                disabled={isSubmitting}
              />
            )}
            name="password"
          />
          {errors.password && (
            <FormHelperText error={true}>
              {errors.password.type === "required"
                ? "password required"
                : "invalid password"}
            </FormHelperText>
          )}
          <br />
          <br />
          <Controller
            control={control}
            rules={{
              validate: (value) => {
                if (!value) {
                  return false;
                }

                return enumKeys(Gender).includes(value as keyof typeof Gender);
              },
            }}
            render={({ field: { onChange, value } }) => (
              <ToggleButtonGroup
                onChange={onChange}
                exclusive
                value={value ? `${value}` : ""}
                aria-label="text gender"
                orientation="vertical"
              >
                {genderButtons().map(({ label, value }) => (
                  <ToggleButton key={value} value={value} aria-label={value}>
                    {label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            )}
            name="gender"
          />
          {errors.gender && (
            <FormHelperText error={true}>
              {errors.gender.type === "required"
                ? "gender required"
                : "invalid gender"}
            </FormHelperText>
          )}
          <br />
          <br />
          <Controller
            control={control}
            rules={{
              required: true,
              pattern: /^[[1-9]+[0-9]*$/,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label={"age"}
                onBlur={onBlur}
                onChange={onChange}
                value={value}
                disabled={loading}
              />
            )}
            name="age"
          />
          {errors.age && (
            <FormHelperText error={true}>
              {errors.age.type === "required" ? "age required" : "invalid age"}
            </FormHelperText>
          )}
          <br />
          <br />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={disableSignupButton}
          >
            Signup
          </Button>
          <br />
          <br />
          <Link to="/login">
            <Button
              type="button"
              variant="contained"
              size="large"
              disabled={loading}
            >
              Already Have An Account?
            </Button>
          </Link>
        </form>
      </Paper>
    </Container>
  );
};

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
  },
  signupPaper: (theme: Theme) => ({
    width: "100%",
    margin: "auto",
    padding: "5vh 5vw",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "65%",
      minWidth: "65%",
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: "50%",
      minWidth: "50%",
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: "40%",
      minWidth: "40%",
    },
  }),
  error: {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "1.2rem",
  },
};
