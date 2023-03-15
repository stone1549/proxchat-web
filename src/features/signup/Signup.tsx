import React, { useContext, useEffect, useMemo } from "react";
import { Button, Container, Paper, TextField, Theme } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { AuthContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";

type FormData = {
  email: string;
  username: string;
  password: string;
};

export const Signup: React.FunctionComponent = () => {
  const { signup, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = useMemo(() => {
    return async (data: FormData) => {
      const { email, username, password } = data;
      signup(email, username, password);
    };
  }, [signup]);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <Container sx={styles.container}>
      <Paper sx={styles.signupPaper}>
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
          <br />
          <br />
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
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
              disabled={isSubmitting}
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
};
