import { useMemo, useState } from "react";
import { Box, Pagination, Typography } from "@mui/material";
import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { themeMaterial } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useNavigate } from "react-router";
import MainLayout from "../../MainLayout";
import { useGetTendersForVendorQuery } from "../../api/Tenders";
import { useAuth } from "../../auth/useAuth";
import { formatDate } from "../../helpers";
import { StatusRenderer } from "../../helpers/statusRenderer";
import { renderActionIcon } from "../../utils/actionUtils";

const PAGE_SIZE = 10;

type VendorTenderRow = {
  tenderId: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
};

const ActionRenderer = (
  params: ICellRendererParams<VendorTenderRow> & { navigate: ReturnType<typeof useNavigate> }
) => {
  const status = String(params.data?.status || "").toLowerCase();
  const isDisabled = status === "submitted";
  const tenderId = params.data?.tenderId;

  return renderActionIcon("submit", {
    disabled: isDisabled || !tenderId,
    onClick: () => {
      if (!isDisabled && tenderId) {
        params.navigate(`/tender-submit?tenderId=${tenderId}`);
      }
    },
  });
};

const Dashboard = () => {
  const { roles } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const hasAllowedRole =
    roles.includes("eTendering.Vendor");

  const {
    data: vendorTendersResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetTendersForVendorQuery(
    { pageNumber: currentPage - 1, pageSize: PAGE_SIZE },
    { skip: !hasAllowedRole }
  );

  const rowData: VendorTenderRow[] = useMemo(() => {
    const list = vendorTendersResponse?.data ?? [];

    return list.map((item) => ({
      tenderId: item.tenderId,
      name: item.name || "-",
      type: item.templateType || "-",
      startDate: item.startDate ? formatDate(item.startDate) : "-",
      endDate: item.endDate ? formatDate(item.endDate) : "-",
      status: item.status || "-",
    }));
  }, [vendorTendersResponse?.data]);

  const totalRecords = vendorTendersResponse?.totalRecords ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));

  const columnDefs = useMemo<ColDef<VendorTenderRow>[]>(
    () => [
      {
        headerName: "TENDER NAME",
        field: "name",
        minWidth: 260,
        headerClass: "uppercase-header",
      },
      {
        headerName: "TYPE",
        field: "type",
        minWidth: 140,
        headerClass: "uppercase-header",
      },
      {
        headerName: "START DATE",
        field: "startDate",
        minWidth: 140,
        headerClass: "uppercase-header",
      },
      {
        headerName: "END DATE",
        field: "endDate",
        minWidth: 140,
        headerClass: "uppercase-header",
      },
      {
        headerName: "STATUS",
        field: "status",
        minWidth: 160,
        headerClass: "uppercase-header",
        cellRenderer: StatusRenderer,
      },
      {
        headerName: "ACTION",
        minWidth: 140,
        headerClass: "uppercase-header",
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<VendorTenderRow>) =>
          ActionRenderer({ ...params, navigate }),
      },
    ],
    [navigate]
  );

  const defaultColDef = useMemo<ColDef<VendorTenderRow>>(
    () => ({
      flex: 1,
      minWidth: 120,
      resizable: true,
    }),
    []
  );

  return (
    <MainLayout>
      <Box sx={{ mt: 2.5, mb: 2.5, paddingRight: "15px" }}>
        {!hasAllowedRole ? (
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Home
          </Typography>
        ) : (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Tenders
            </Typography>

            {isError && <Typography color="error">Failed to load tenders.</Typography>}

            <Box
              sx={{
                "& .ag-header-cell-text": {
                  fontWeight: 700,
                  color: "#000000",
                },
              }}
            >
              <AgGridReact
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                theme={themeMaterial}
                rowHeight={55}
                headerHeight={50}
                pagination={false}
                domLayout="autoHeight"
                suppressCellFocus
                loading={isLoading || isFetching}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => setCurrentPage(page)}
                shape="rounded"
                color="primary"
                size="large"
              />
            </Box>
          </>
        )}
      </Box>
    </MainLayout>
  );
};

export default Dashboard;