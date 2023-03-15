import React from "react";
import "./App.css";
import { Secured } from "./features/common/Secured";
import { Chat } from "./features/chat/Chat";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "./hooks";
import { Sender } from "./domain";
import { Login } from "./features/login/Login";
import { Signup } from "./features/signup/Signup";

const theme = createTheme({});

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Secured>
        <Chat />
      </Secured>
    ),
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

export type AuthContextValue = {
  token: string;
  error: string;
  sender: Sender;
  login: (email: string, password: string) => void;
  logout: () => void;
  signup: (email: string, username: string, password: string) => void;
};

export const AuthContext = React.createContext<AuthContextValue>({
  token: "",
  error: "",
  sender: {
    username: "",
    id: "",
  },
  login: (_: string, __: string) => {
    throw new Error(`login function default`);
  },
  logout: () => {
    throw new Error(`logout function default`);
  },
  signup: (_: string, __: string, ___: string) => {
    throw new Error(`signup function default`);
  },
});

export const App = () => {
  const { token, sender, login, logout, signup, error } = useAuth();
  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthContext.Provider
          value={{ token, login, logout, sender, signup, error }}
        >
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </ThemeProvider>
    </div>
  );
};
