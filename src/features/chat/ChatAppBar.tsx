import React, { useContext } from "react";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { AuthContext } from "../../App";

export const ChatAppBar: React.FunctionComponent = () => {
  const { logout } = useContext(AuthContext);
  return (
    <AppBar color="primary" position="sticky" sx={{ height: "8%" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={styles.title}>
          Chat
        </Typography>
        <Button color="inherit" onClick={logout} sx={styles.signOutBtn}>
          Sign Out
        </Button>
      </Toolbar>
    </AppBar>
  );
};

const styles = {
  title: {
    marginLeft: "auto",
    marginRight: "auto",
  },
  signOutBtn: {
    float: "right",
  },
};
