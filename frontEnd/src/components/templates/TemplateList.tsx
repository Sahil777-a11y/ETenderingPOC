import { useState, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Pagination
} from "@mui/material";
import MainLayout from "../../MainLayout";
import { InputField } from "../shared/ui";
import { showToast } from "../shared/ui";
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../theme";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeMaterial } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router";
import { useDeleteTemplateMutation, useGetAllTemplatesQuery } from "../../api/Templates";
import ConfirmDialog from "../shared/ui/confirmDialog";


const TemplateList = () => {
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateIdToDelete, setTemplateIdToDelete] = useState<string | null>(null);

  const { data, isError, refetch } = useGetAllTemplatesQuery();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const handleDeleteClick = (templateId: string) => {
    setTemplateIdToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    if (isDeleting) return;
    setDeleteDialogOpen(false);
    setTemplateIdToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!templateIdToDelete) return;

    try {
      const response = await deleteTemplate(templateIdToDelete).unwrap();

      if (response?.success === false) {
        showToast({
          message: response?.message || "Failed to delete template.",
          type: "error",
        });
        return;
      }

      showToast({
        message: response?.message || "Template deleted successfully.",
        type: "success",
      });
      setDeleteDialogOpen(false);
      setTemplateIdToDelete(null);
    } catch {
      showToast({
        message: "Failed to delete template.",
        type: "error",
      });
    }
  };

  const tableData = useMemo(() => {
    const templates = data?.data ?? [];

    return templates.map((template) => ({
      id: template.templateId,
      name: template.templateName,
      description: template.description,
      type: template.typeName || "-",
      createdOn: template.templateCreatedDateTime
        ? new Date(template.templateCreatedDateTime).toLocaleDateString()
        : "-",
      updatedOn: template.templateModifiedDateTime
        ? new Date(template.templateModifiedDateTime).toLocaleDateString()
        : "-",
    }));
  }, [data]);

  const filteredData = useMemo(() => {
    if (!searchValue.trim()) return tableData;

    const query = searchValue.toLowerCase();
    return tableData.filter((template) =>
      [template.name, template.description, String(template.type)]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [searchValue, tableData]);


  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "TEMPLATE NAME",
        field: "name",
        headerClass: "uppercase-header",
        minWidth: 250,

      },
      {
        headerName: "DESCRIPTION",
        field: "description",
        headerClass: "uppercase-header",
        minWidth: 250,
      },
      {
        headerName: "TYPE",
        field: "type",
        width: 150,
        headerClass: "uppercase-header",
      },
      {
        headerName: "CREATED ON",
        field: "createdOn",
        width: 150,
        headerClass: "uppercase-header",
      },
      {
        headerName: "UPDATED ON",
        field: "updatedOn",
        width: 150,
        headerClass: "uppercase-header",
      },
      {
        headerName: "ACTIONS",
        width: 130,
        headerClass: "uppercase-header",
        cellRenderer: (params: ICellRendererParams<{ id: string }>) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                sx={{ color: "#0080BC" }}
                onClick={() => params.data && navigate(`/edit-template/${params.data.id}`)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                sx={{ color: "#d32f2f" }}
                onClick={() => params.data && handleDeleteClick(params.data.id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ] as ColDef[];
  }, [navigate]);

  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      resizable: true,
    }),
    []
  );

  // if (isLoading) return <div>Loading templates...</div>;
  if (isError) return <div>Failed to load templates</div>;

  return (
    <MainLayout>
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        {/* Header */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Templates
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
              placeholder="Search Templates..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              endIcon={<SearchIcon sx={{ color: theme.palette.primary.main }} />}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate("/templates/create-template")}
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
              Create Template
            </Button>

            <Tooltip title="Reload">
              <IconButton
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
                onClick={() => refetch()}
              >
                <RestartAltIcon fontSize="small" sx={{ color: "#0080BC" }} />
              </IconButton>
            </Tooltip>

          </Box>
        </Grid>

        {/* Table */}
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              "& .ag-header-cell-text": {
                fontWeight: 700,
                color: "#000000",
              }
            }}
          >
            <AgGridReact
              rowData={filteredData}
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

        <ConfirmDialog
          open={deleteDialogOpen}
          title="Delete Template"
          message="Are you sure you want to delete this template?"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          disableSubmit={isDeleting}
          isLoading={isDeleting}
        />
      </Box>
    </MainLayout>
  );
};

export default TemplateList;