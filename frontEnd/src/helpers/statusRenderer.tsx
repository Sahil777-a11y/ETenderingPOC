import { Chip } from "@mui/material";
import type { ICellRendererParams } from "ag-grid-community";
import { STATUS_MAP } from "../constants";

export const StatusRenderer = (params: ICellRendererParams<{ status: string }>) => {
  const status = String(params.value || "");
  const config = STATUS_MAP[status] || { color: "#FFFFFF", bgcolor: "#6B7280" };

  return (
    <Chip
      label={(status || "Unknown").toUpperCase()}
      size="small"
      sx={{
        backgroundColor: config.bgcolor,
        color: config.color,
        fontWeight: 800,
        fontSize: "10px",
        letterSpacing: "0.4px",
        height: "24px",
        border: "none",
        minWidth: "118px",
      }}
    />
  );
};
