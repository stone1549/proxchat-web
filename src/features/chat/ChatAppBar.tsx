import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { AuthContext } from "../../App";
import { SettingsDialog } from "../settings/SettingsDialog";

export const ChatAppBar: React.FunctionComponent = () => {
  const { logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);
  const menuOpen = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const launchSettingsDialog = () => {
    setSettingsDialogOpen(true);
    handleClose();
  };

  return (
    <AppBar color="primary" position="sticky" sx={{ height: "8%" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={styles.title}>
          Chat
        </Typography>
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          aria-label="menu"
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleClose}
          MenuListProps={{
            "aria-labelledby": "basic-button",
          }}
        >
          <MenuItem onClick={launchSettingsDialog}>Settings</MenuItem>
          <MenuItem onClick={logout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
      <SettingsDialog
        visible={settingsDialogOpen}
        setVisible={setSettingsDialogOpen}
      />
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
