import React, { useState } from "react";
import {
  Grid,
  IconButton,
  Typography,
  Avatar,
  Badge,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import theme from "../theme";
import { useLocation, useNavigate } from "react-router";
import { Notifications } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { styled } from "@mui/material/styles";
import { InputField } from "../shared/ui";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../auth/useAuth";

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 12,
    boxShadow: '0px 6px 24px rgba(40,60,90,0.18)',
    minWidth: 220,
    marginTop: theme.spacing(1),
    padding: theme.spacing(0.5, 0),
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: theme.spacing(1.2, 2),
  fontSize: 16,
  fontWeight: 500,
  display: 'flex',
  flexDirection: 'row-reverse',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  borderRadius: 8,
  minHeight: 40,
  '&:hover': { backgroundColor: theme.palette.action.hover }
}));

const Header = ({ drawerOpen = false }: { drawerOpen?: boolean }) => {
  const { logout, account } = useAuth();
  const userName = account && account?.name ? account.name : "";


  const location = useLocation();
  const navigate = useNavigate();

  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };


  const handleMyProfileClick = () => {
    navigate('/my-profile')
    // handleUserMenuClose();
    // setMyProfileDialogOpen(true)
    // setOooDataLoaded(false);
  };

  const handleLogout = () => {
    logout();
  };


  return (
    <Grid
      container
      size={{ xs: 12 }}
      sx={{
        "@media (max-width:599px)": {
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
        },
      }}
    >
      <Grid
        container
        size={{ xs: drawerOpen ? 5 : 6 }}
        // gap={2}
        alignItems={"center"}
        sx={{
          "@media (max-width:599px)": {
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
            marginBottom: "20px",
          },
        }}
      >
        {/* <Grid container alignItems="center" spacing={1}>
          <Grid
            sx={{
              paddingTop: "10px",
              paddingRight: "20px",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AddBoxIcon
              sx={{
                color: "#0080BC", // blue like in screenshot
                fontSize: 32,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#202124",
                whiteSpace: "nowrap",
              }}
            >
              QwantifyP2P Portal
            </Typography>
          </Grid>
        </Grid> */}
        {location.pathname === "/" && (
          <Grid
            sx={{
              paddingTop: "10px",
              zoom: 1.2,
              "@media (max-width:599px)": {
                width: "70%",
                zoom: "1.5",
              },
            }}
          >
            <InputField
              placeholder="Search anything here...."
              endIcon={
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              }
            />
          </Grid>
        )}
      </Grid>

      <Grid
        container
        size={{ xs: drawerOpen ? 7 : 6 }}
        alignItems={"center"}
        justifyContent={"flex-end"}
        sx={{
          "@media (max-width:599px)": {
            flexDirection: "column",
            width: "100%",
            alignItems: "center",
          },
        }}
      >

        <Grid
          sx={{
            display: "flex",
            alignItems: "center",
            "@media (max-width:599px)": {
              display: "flex",
              width: "100%",
              justifyContent: "center",

            },
          }}
        >
          <Grid size={{ xs: 1 }}>
            <IconButton
            // onClick={handleNotificationClick}
            // title={
            //   isConnected
            //     ? "Real-time notifications active"
            //     : isConnecting
            //       ? "Connecting to notifications..."
            //       : "Notifications offline"
            // }
            >
              <Badge
                color="error"
                sx={{
                  "& .MuiBadge-dot": {
                    backgroundColor: "#c6bebdff",
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                  },
                  position: "relative",
                }}
              // badgeContent={unreadCount}
              >
                <Notifications />
                {/* Connection status indicator */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    // backgroundColor: isConnected
                    //   ? "#4caf50"
                    //   : isConnecting
                    //     ? "#ff9800"
                    //     : "#f44336",
                    // border: "1px solid white",
                    // animation: isConnecting ? "pulse 1.5s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Badge>
            </IconButton>
          </Grid>
          <Grid
            size={{ xs: 3 }}
            container
            alignItems="center"
            gap={1}
            wrap="nowrap"
            sx={{
              padding: "25px",
              width: "auto",
              ml: 1,
              flexWrap: "nowrap",
              zoom: 1.2,
              "@media (max-width:599px)": {
                zoom: "1.5",
              },
            }}
          >
            <Grid sx={{ marginLeft: "30px" }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: theme.palette.primary.light,
                }}
              >
                <PersonIcon sx={{ color: "#e1f5fe" }} />
              </Avatar>
            </Grid>
            <Grid
              sx={{
                display: "flex",
                flexDirection: "column",
                pl: 0.5,
                zoom: 1.1,
              }}
            >
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ lineHeight: 1, textAlign: "justify !important" }}
              >
                Welcome
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, display: "flex", alignItems: "center" }}
              >
                {userName || "User"}
                <IconButton size="small" onClick={handleUserMenuOpen}>
                  <ArrowDropDownIcon
                    fontSize="small"
                    sx={{ verticalAlign: "middle", ml: 0.2 }}
                  />
                </IconButton>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <StyledMenu
        anchorEl={userMenuAnchorEl}
        open={Boolean(userMenuAnchorEl)}
        onClose={handleUserMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >


        <StyledMenuItem onClick={handleMyProfileClick}>
          <ListItemIcon>
            <AccountBoxIcon color="primary" fontSize="small" />
          </ListItemIcon>
          My Profile
        </StyledMenuItem>
        <StyledMenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon color="primary" fontSize="small" />
          </ListItemIcon>
          Sign Out
        </StyledMenuItem>
      </StyledMenu>


    </Grid >
  );
};

export default Header;
