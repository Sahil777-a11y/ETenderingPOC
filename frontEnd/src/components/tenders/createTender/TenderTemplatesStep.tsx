import { useMemo } from "react";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ColDef } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeMaterial } from "ag-grid-community";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { showToast } from "../../shared/ui";

interface TemplateRow {
  id: string;
  name: string;
}

interface TenderTemplatesStepProps {
  templates: TemplateRow[];
}

const TenderTemplatesStep = ({ templates }: TenderTemplatesStepProps) => {
  const columnDefs = useMemo(
    () =>
      [
        {
          headerName: "TEMPLATE NAME",
          field: "name",
          minWidth: 280,
          headerClass: "uppercase-header",
        },
        {
          headerName: "ACTIONS",
          width: 170,
          headerClass: "uppercase-header",
          cellRenderer: (params: { data: TemplateRow }) => (
            <Stack direction="row" spacing={1}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  sx={{ color: "#0080BC" }}
                  onClick={() =>
                    showToast({
                      message: `Edit template ${params.data.name}`,
                      type: "success",
                    })
                  }
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="View">
                <IconButton
                  size="small"
                  sx={{ color: "#0080BC" }}
                  onClick={() =>
                    showToast({
                      message: `View template ${params.data.name}`,
                      type: "success",
                    })
                  }
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  sx={{ color: "#d32f2f" }}
                  onClick={() =>
                    showToast({
                      message: `Delete template ${params.data.name}`,
                      type: "success",
                    })
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          ),
        },
      ] as ColDef[],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      resizable: true,
    }),
    []
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Mapped Templates
      </Typography>

      <Box
        sx={{
          "& .ag-header-cell-text": {
            fontWeight: 700,
            color: "#000000",
          },
        }}
      >
        <AgGridReact
          rowData={templates}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={themeMaterial}
          rowHeight={55}
          headerHeight={50}
          pagination={false}
          domLayout="autoHeight"
          suppressCellFocus
        />
      </Box>
    </Box>
  );
};

export default TenderTemplatesStep;
