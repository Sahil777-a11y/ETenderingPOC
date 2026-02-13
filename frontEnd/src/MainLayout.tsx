import React, { useState } from "react";
import "./index.css";
import { Grid } from "@mui/material";
import Header from "./components/Header";
import SidebarWrapper from "./components/SidebarWrapper";
import theme from "./components/theme";
import Footer from "./components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  const toggleDrawer = () => setOpen((prev) => !prev);
  return (
    <Grid container spacing={1} sx={{ minHeight: "100vh", }}>
      <Grid size={{ xl: open ? 2 : 0.5, lg: open ? 2.5 : 1, md: open ? 3 : 1, sm: open ? 3 : 1 }} sx={{
        "@media (min-width:640px) and (max-width:767px)": {
          width: open ? "180px" : "50px",
        },
        "@media (min-width:600px) and (max-width:639px)": {
          width: open ? "50px !important" : "50px",
        },
        "@media (min-width:320px) and (max-width:599px)": {
          width: open ? "50px !important" : "50px !important",
          display: "none"
        },
      }}>
        <SidebarWrapper open={open} toggleDrawer={toggleDrawer} />
      </Grid>
      <Grid size={{ xl: open ? 10 : 11.5, lg: open ? 9.5 : 11, md: open ? 9 : 11, sm: open ? 9 : 11 }} sx={{

        display: "flex", flexDirection: "column", justifyContent: "flex-start", position: "relative",
        "@media (min-width:720px) and (max-width:767px)": {
          width: open ? "98%" : "91%",
          paddingLeft: open ? "34%" : "3%",
        },
        "@media (min-width:650px) and (max-width:719px)": {
          width: open ? "97%" : "100%",
          paddingLeft: open ? "37%" : "15%"
        },
        "@media (min-width:600px) and (max-width:649px)": {
          width: open ? "97%" : "100%",
          paddingLeft: open ? "37%" : "15%"
        },
        "@media (min-width:320px) and (max-width:599px)": {
          width: open ? "100%" : "100%",
          // paddingLeft:open ? "40%": "3%",

        }
      }}>
        <Grid
          size={{ xs: 12 }}
          sx={{
            [theme.breakpoints.down("xl")]: { zoom: "0.7" },
            [theme.breakpoints.down("lg")]: { zoom: "0.57" },
            [theme.breakpoints.up("xl")]: { zoom: "1" },
            [theme.breakpoints.between("lg", "xl")]: { zoom: "0.7" },
          }}
        >

          <Header drawerOpen={open} />

        </Grid>
        {children}
        <Footer />
      </Grid>
    </Grid>
  );
};

export default MainLayout;
