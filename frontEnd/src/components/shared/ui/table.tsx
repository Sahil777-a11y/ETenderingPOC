import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Pagination,
  Tooltip,
} from "@mui/material";
import type { Column } from "../types/column";


interface CommonTableProps<T> {
  columns: Column<T>[];
  data: T[];
  noDataText?: string;
  showPagination?: boolean;
  pageNumber?: number;
  pageSize?: number;
  totalRecords?: number;
  onPageChange?: (event: React.ChangeEvent<unknown>, page: number) => void;
  tooltipThreshold?: number;
}

const CommonTable = <T extends object>({
  columns,
  data,
  noDataText = "",
  showPagination = false,
  pageNumber = 1,
  pageSize = 10,
  totalRecords = 0,
  onPageChange,
  tooltipThreshold = 25,
}: CommonTableProps<T>) => {

  const totalPages = Math.ceil(totalRecords / pageSize);

  const renderCellContent = (value: any) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const stringValue = String(value);
    const needsTooltip = stringValue.length > tooltipThreshold;

    if (needsTooltip) {
      return (
        <Tooltip
          title={stringValue || "No description"}
          placement="top"
          arrow
          enterDelay={500}
          sx={{
            ".MuiTooltip-tooltip": {
              maxWidth: 300,
              bgcolor: "common.black",
              fontSize: "12px",
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "text.primary",
              fontSize: "12px",
            }}
          >
            {`${stringValue.substring(0, tooltipThreshold)}...`}
          </Typography>
        </Tooltip>
      );
    }

    return (
      <Typography
        variant="body2"
        sx={{
          color: "text.primary",
          fontSize: "12px",
        }}
      >
        {stringValue}
      </Typography>
    );
  };

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  sx={{ backgroundColor: "#f3f3f3", fontWeight: 600, paddingTop: "15px !important", paddingBottom: "15px !important" }}
                  key={String(column.key)}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography
                    variant="body2"
                    align="center"
                    color="text.secondary"
                  >
                    {noDataText}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={String(column.key)} sx={{ fontSize: "12px" }}>
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : renderCellContent(row[column.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {showPagination && totalRecords > 10 && pageNumber && pageSize && (
        <Box
          sx={{
            mt: 2,
            mb: 0,
            p: 2,
            display: "flex",
            alignItems: "center",
            background: "#fff",
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ color: "#555", fontSize: 12 }}>
            {`Showing ${data.length} items`}
          </Typography>
          <Pagination
            count={totalPages}
            page={pageNumber}
            onChange={onPageChange}
            shape="rounded"
            color="primary"
            size="large"
            sx={{
              "& .Mui-selected": {
                borderRadius: "50%",
                fontWeight: 600,
                background: "#01AAAD",
                color: "#fff",

              },

              "& .MuiPaginationItem-root": {
                fontSize: "12px",
                minWidth: 38,
                minHeight: 38,
              },
            }}
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Box>
  );
};

export default CommonTable;
