import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { auth, AuthError, refreshToken, signup } from "./api";
import { getSenderFromToken } from "./utils";
import { AuthContextValue } from "./App";

export const useAuth = (): AuthContextValue => {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const loginFunc = useMemo(() => {
    return async (username: string, password: string) => {
      try {
        const { token } = await auth(username, password);
        setToken(token);
        setError("");
        return;
      } catch (e) {
        if (e instanceof AuthError) {
          setError(e.message);
          return;
        }

        setError("unknown error");
        return;
      }
    };
  }, [setToken, setError]);

  const logoutFunc = useMemo(() => {
    return () => {
      setError("");
      setToken("");
    };
  }, [setError, setToken]);

  useInterval(
    async () => {
      if (!token) {
        return;
      }

      try {
        const newToken = await refreshToken(token);
        setToken(newToken.token);
        return;
      } catch (e) {
        if (e instanceof AuthError) {
          setToken("");
          setError(e.message);
          return;
        }

        setToken("");
        setError("unknown error");
      }
    },
    150000,
    true
  );

  const signupFunc = useMemo(() => {
    return async (email: string, username: string, password: string) => {
      try {
        const { token } = await signup(email, username, password);
        setToken(token);
        setError("");
        return;
      } catch (e) {
        if (e instanceof AuthError) {
          setError(e.message);
          return;
        }

        setError("unknown error");
        return;
      }
    };
  }, [setToken, setError]);

  const sender = getSenderFromToken(token);
  return {
    token,
    login: loginFunc,
    logout: logoutFunc,
    error,
    sender,
    signup: signupFunc,
  };
};

export const useInterval = (
  callback: () => void,
  delay: number | null,
  immediately = false
) => {
  const [firstRun, setFirstRun] = useState(true);
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);

  if (firstRun) {
    if (immediately) {
      callback();
    }
    setFirstRun(false);
  }
};
