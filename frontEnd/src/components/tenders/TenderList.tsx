import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Pagination
} from "@mui/material";
import MainLayout from "../../MainLayout";
import { InputField } from "../shared/ui";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import theme from "../theme";
import type { ColDef } from "ag-grid-community";
import { themeMaterial } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router";
import { useGetAllTendersQuery } from "../../api/Tenders";
import { formatDate } from "../../helpers";

interface TenderRow {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
}

const TenderList = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  const {
    data: tendersResponse,
    isError,
    refetch,
  } = useGetAllTendersQuery();

  const rowData: TenderRow[] = useMemo(() => {
    const list = tendersResponse?.data ?? [];

    return list.map((item) => ({
      id: item.tenderHeaderId,
      name: item.name || "-",
      type: item.typeName || "-",
      startDate: item.startDate ? formatDate(item.startDate) : "-",
      endDate: item.endDate ? formatDate(item.endDate) : "-",
    }));
  }, [tendersResponse?.data]);

  const filteredRows = useMemo(() => {
    const search = searchValue.trim().toLowerCase();
    if (!search) return rowData;

    return rowData.filter((row) =>
      [row.name, row.type, row.startDate, row.endDate]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [rowData, searchValue]);

  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "TENDER NAME",
        field: "name",
        headerClass: "uppercase-header",
        minWidth: 250,

      },
      {
        headerName: "TENDER TYPE",
        field: "type",
        width: 150,
        headerClass: "uppercase-header",
      },
      {
        headerName: "START DATE",
        field: "startDate",
        width: 150,
        headerClass: "uppercase-header",
      },
      {
        headerName: "END DATE",
        field: "endDate",
        width: 150,
        headerClass: "uppercase-header",
      },
      // {
      //   headerName: "ACTIONS",
      //   width: 130,
      //   headerClass: "uppercase-header",
      //   cellRenderer: (params: any) => (
      //     <Stack direction="row" spacing={1}>
      //       <Tooltip title="Edit">
      //         <IconButton
      //           size="small"
      //           sx={{ color: "#0080BC" }}
      //           onClick={() => navigate(`/tenders/edit/${params.data.id}`)}
      //         >
      //           <EditIcon fontSize="small" />
      //         </IconButton>
      //       </Tooltip>
      //       <Tooltip title="Delete">
      //         <IconButton
      //           size="small"
      //           sx={{ color: "#d32f2f" }}
      //           onClick={() => console.log("Delete", params.data.id)}
      //         >
      //           <DeleteIcon fontSize="small" />
      //         </IconButton>
      //       </Tooltip>
      //     </Stack>
      //   ),
      // },
    ] as ColDef[];
  }, []);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      resizable: true,
    }),
    []
  );

  return (
    <MainLayout>
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Tenders
          </Typography>
        </Grid>

        {/* Search + Create */}
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            marginTop: "30px",
            flexWrap: "nowrap",
            "@media (min-width:320px) and (max-width:767px)": {
              flexDirection: "column",
              gap: 2
            }
          }}
        >
          <Box sx={{ width: "300px" }}>
            <InputField
              placeholder="Search Tenders..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              endIcon={<SearchIcon sx={{ color: theme.palette.primary.main }} />}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/tenders/create-tender")}
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
                backgroundColor: "#0080BC",
                borderRadius: "20px",
                padding: "6px 20px",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#006b9c",
                  boxShadow: "none"
                }
              }}
            >
              Create Tender
            </Button>

            <Tooltip title="Reload">
              <IconButton
                onClick={() => refetch()}
                size="small"
                sx={{
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                  padding: "8px",
                  height: "40px",
                  width: "40px",
                  backgroundColor: "#fff",
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                    borderColor: "#0080BC"
                  }
                }}
              >
                <RestartAltIcon fontSize="small" sx={{ color: "#0080BC" }} />
              </IconButton>
            </Tooltip>

          </Box>
        </Grid>

        {/* Table */}
        <Box sx={{ mt: 2 }}>
          {isError && <Typography color="error">Failed to load tenders.</Typography>}
          <Box
            sx={{
              "& .ag-header-cell-text": {
                fontWeight: 700,
                color: "#000000",
              }
            }}
          >
            <AgGridReact
              rowData={filteredRows}
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

        {/* Pagination (Dummy for now) */}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Pagination
            count={1}
            page={pageNumber}
            onChange={(_, page) => setPageNumber(page)}
            shape="rounded"
            color="primary"
            size="large"
          />
        </Box>
      </Box>
    </MainLayout>
  );
};

export default TenderList;