import { get } from "lodash";
import React from "react";
import { showToast } from "../components/shared/ui/index.ts";
import { MAX_FILE_SIZE } from "../constants/index.tsx";

type UseFileUploadParams = {
  siteCode: string;
  uploadFile: (formData: FormData) => Promise<any>;
};

export const useFileUpload = ({
  siteCode,
  uploadFile,
}: UseFileUploadParams) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("text/plain")) {
      showToast({ message: "Only .txt files are allowed", type: "error" });
      e.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      showToast({
        message: "File size must be less than 5 MB",
        type: "error",
      });
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("siteCode", siteCode);

    try {
      setIsUploading(true);
      const res = await uploadFile(formData);

      if (res?.data?.success) {
        showToast({
          message: get(res, "data.message", "File uploaded successfully."),
          type: "success",
        });
      } else {
        showToast({
          message: get(res, "data.message", "File upload failed."),
          type: "error",
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
      showToast({
        message: "File upload failed.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  return {
    handleFileChange,
    isUploading,
  };
};
