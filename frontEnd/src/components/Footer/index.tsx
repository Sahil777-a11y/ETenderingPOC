import { Typography } from "@mui/material";
import MohawkMedbuy from "../../assets/MohawkMedbuy.png";
import { Grid } from "@mui/material";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <Grid sx={{ display: "flex", textAlign: "center", alignItems: "center", margin: "30px 0" }}>
      <Typography sx={{ position: "absolute", bottom: "0", left: "-100px", width: "100%", }}>Copyright {currentYear === 2025 ? currentYear : `2025 - ${currentYear}`} Mohawk Medbuy. All Rights Reserved. Powered by <span style={{ position: "absolute", top: "-4px" }}><img src={MohawkMedbuy} alt="MohawkMedbuy" width={150} /></span></Typography>
    </Grid>
  )
}

export default Footer;