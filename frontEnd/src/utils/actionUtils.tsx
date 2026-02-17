import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import CancelIcon from "@mui/icons-material/Cancel";
import UndoIcon from "@mui/icons-material/Undo";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from "@mui/icons-material/History";
import SaveAltSharpIcon from "@mui/icons-material/SaveAltSharp";
import { IconButton, Tooltip } from "@mui/material";
import type { ReactNode } from "react";

export type ActionKey =
    | "view"
    | "edit"
    | "delete"
    | "withdraw"
    | "download"
    | "show_revisions"
    | "show_rejected_reason"
    | "submit"

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
    },
    submit: {
        icon: <SaveAltSharpIcon sx={{ fontSize: 18 }} />,
        label: "Submit",
        color: "#0080BC",
    }
};

type RenderActionIconOptions = {
    onClick: () => void;
    disabled?: boolean;
};

export const renderActionIcon = (action: ActionKey, options: RenderActionIconOptions) => {
    const config = ACTION_CONFIG[action];
    const isDisabled = Boolean(options.disabled);

    return (
        <Tooltip title={config.label}>
            <span>
                <IconButton
                    size="small"
                    disabled={isDisabled}
                    onClick={options.onClick}
                    sx={{
                        color: isDisabled ? "#9CA3AF" : config.color,
                        border: "1px solid",
                        borderColor: isDisabled ? "#D1D5DB" : "#BFE3F4",
                        backgroundColor: isDisabled ? "#F3F4F6" : "#EAF6FC",
                        borderRadius: "10px",
                        width: 32,
                        height: 32,
                        "&:hover": {
                            backgroundColor: isDisabled ? "#F3F4F6" : "#D8EDF8",
                        },
                    }}
                >
                    {config.icon}
                </IconButton>
            </span>
        </Tooltip>
    );
};

