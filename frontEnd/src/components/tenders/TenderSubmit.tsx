import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useLocation, useNavigate } from "react-router";
import MainLayout from "../../MainLayout";
import {
  useGetVendersBidByTenderIdQuery,
  useUpdateTendorSubmitStatusMutation,
} from "../../api/Tenders";
import { formatDate } from "../../helpers";
import { showToast } from "../shared/ui";

const getRemainingTime = (endDate: string, now: dayjs.Dayjs) => {
  const end = dayjs(endDate);

  if (!end.isValid()) {
    return "-";
  }

  const daysLeft = end.startOf("day").diff(now.startOf("day"), "day");

  if (daysLeft < 0) {
    return "Closed";
  }

  return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`;
};

const TenderSubmit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [now, setNow] = useState(dayjs());
  const queryParams = new URLSearchParams(location.search);
  const tenderId = queryParams.get("tenderId") || "";
  const [updateTendorSubmitStatus, { isLoading: isSubmitting }] =
    useUpdateTendorSubmitStatusMutation();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(dayjs());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const { data, isLoading, isError } = useGetVendersBidByTenderIdQuery(tenderId, {
    skip: !tenderId,
  });

  const tender = data?.data;
  const templates = tender?.templates ?? [];

  const allTemplatesCompleted =
    templates.length > 0 && templates.every((template) => Boolean(template.isCompleted));

  const handleFinalSubmit = async () => {
    if (!tenderId) {
      showToast({ message: "Tender id is missing.", type: "error" });
      return;
    }

    try {
      const response = await updateTendorSubmitStatus(tenderId).unwrap();

      if (response?.success === false) {
        showToast({
          message: response?.message || "Failed to submit tender.",
          type: "error",
        });
        return;
      }

      showToast({
        message: response?.message || "Tender submitted successfully.",
        type: "success",
      });

      navigate("/");
    } catch {
      showToast({
        message: "Failed to submit tender.",
        type: "error",
      });
    }
  };

  return (
    <MainLayout>
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        {/* <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Tender Submit
        </Typography> */}

        {!tenderId && <Typography color="error">Tender id is missing.</Typography>}
        {isLoading && <Typography>Loading tender details...</Typography>}
        {isError && <Typography color="error">Failed to load tender details.</Typography>}

        {!isLoading && !isError && tender && (
          <>
            <Paper
              variant="outlined"
              sx={{ mb: 3, borderColor: "primary.light", borderRadius: 2, overflow: "hidden" }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tender Details
                </Typography>
                <Chip
                  size="small"
                  label={(tender.templateType || "-").toUpperCase()}
                  sx={{
                    fontWeight: 700,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "primary.contrastText",
                  }}
                />
              </Box>

              <Box sx={{ p: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
                  <Box sx={{ p: 1.5, bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 220 }}>
                    <Typography variant="caption" color="text.secondary">Tender Name</Typography>
                    <Typography sx={{ fontWeight: 700, mt: 0.3 }}>{tender.name || "-"}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 160 }}>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography sx={{ fontWeight: 700, mt: 0.3 }}>{tender.startDate ? formatDate(tender.startDate) : "-"}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 160 }}>
                    <Typography variant="caption" color="text.secondary">End Date</Typography>
                    <Typography sx={{ fontWeight: 700, mt: 0.3 }}>{tender.endDate ? formatDate(tender.endDate) : "-"}</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: "action.hover", border: "1px solid", borderColor: "divider", borderRadius: 2, minWidth: 190 }}>
                    <Typography variant="caption" color="text.secondary">Remaining Time</Typography>
                    <Typography sx={{ fontWeight: 700, mt: 0.3 }}>
                      {tender.endDate ? getRemainingTime(tender.endDate, now) : "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Paper>

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 56, px: 1 }}></TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Template Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => {
                    const isCompleted = Boolean(template.isCompleted);
                    return (
                      <TableRow key={template.tenderTemplateHeaderId}>
                        <TableCell sx={{ width: 56, px: 1 }}>
                          <Checkbox
                            checked={isCompleted}
                            disabled
                            icon={<RadioButtonUncheckedIcon sx={{ fontSize: 22, color: "#BDBDBD" }} />}
                            checkedIcon={<CheckCircleIcon sx={{ fontSize: 22, color: "#43A047" }} />}
                            sx={{
                              p: 0.5,
                              "&.Mui-disabled": {
                                opacity: 1,
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ pl: 0.5 }}>{template.name || "-"}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={isCompleted ? "COMPLETED" : "PENDING"}
                            sx={{
                              fontWeight: 700,
                              color: "#fff",
                              backgroundColor: isCompleted ? "#43A047" : "#FBC02D",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            disabled={isCompleted}
                            onClick={() => navigate(`/vendor-form/${template.tenderTemplateHeaderId}`)}
                            sx={{ textTransform: "uppercase", fontWeight: 700, minWidth: 100 }}
                          >
                            View / Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {templates.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography color="text.secondary">No templates found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{ textTransform: "uppercase", fontWeight: 700, minWidth: 140 }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                disabled={!allTemplatesCompleted || isSubmitting}
                onClick={handleFinalSubmit}
                sx={{ textTransform: "uppercase", fontWeight: 700, minWidth: 140 }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default TenderSubmit;
