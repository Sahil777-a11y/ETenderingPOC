import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import UndoIcon from "@mui/icons-material/Undo";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import type { ReactNode } from "react";

export type ActionKey =
    | "view"
    | "edit"
    | "delete"
    | "withdraw"
    | "download"
    | "show_revisions"
    | "show_rejected_reason"

export const ACTION_CONFIG: Record<
    ActionKey,
    {
        icon: ReactNode;
        label: string;
        color: string;
    }
> = {
    view: {
        icon: <VisibilityIcon sx={{ fontSize: 20 }} />,
        label: "View Details",
        color: "#0080BC",
    },
    edit: {
        icon: <EditIcon sx={{ fontSize: 20 }} />,
        label: "Edit Batch",
        color: "#0080BC",
    },
    delete: {
        icon: <CancelIcon sx={{ fontSize: 20 }} />,
        label: "Delete",
        color: "#D32F2F",
    },
    withdraw: {
        icon: <UndoIcon sx={{ fontSize: 20 }} />,
        label: "Withdraw",
        color: "#F57F17",
    },
    download: {
        icon: <DownloadIcon sx={{ fontSize: 20 }} />,
        label: "Download Report",
        color: "#0080BC",
    },
    show_revisions: {
        icon: <HistoryIcon sx={{ fontSize: 20 }} />,
        label: "Show Revisions",
        color: "#0080BC",
    },
    show_rejected_reason: {
        icon: <HistoryIcon sx={{ fontSize: 20 }} />,
        label: "Show Rejection Reason",
        color: "#D32F2F",
    }
};

