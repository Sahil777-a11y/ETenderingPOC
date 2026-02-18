import { Box, Button, Divider, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import MainLayout from "../../MainLayout";


const VendorForm = () => {
  const navigate = useNavigate();
  const { tempId } = useParams<{ tempId: string }>();



  return (
    <MainLayout>
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Vendor Form
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography color="text.secondary">
            Vendor form builder/render flow will be implemented here for template id: {tempId || "-"}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Button onClick={() => navigate(-1)}>Back</Button>
      </Box>
    </MainLayout>
  );
};

export default VendorForm;
