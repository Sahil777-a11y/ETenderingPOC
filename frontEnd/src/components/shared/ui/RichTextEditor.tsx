import React, { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import { Box } from "@mui/material";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

function RichTextEditor({
  value = "",
  onChange,
  readOnly,
}: Props) {
  const { quill, quillRef } = useQuill({
    theme: "snow",
    readOnly,
    modules: {
      toolbar: [
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        // ["clean"],
      ],
    },
  });

  const initialized = useRef(false);

  // ✅ Set initial value ONLY ONCE
  useEffect(() => {
    if (!quill || initialized.current) return;

    quill.clipboard.dangerouslyPasteHTML(value);
    initialized.current = true;
  }, [quill]);

  // ✅ Listen to changes (no forcing value back in)
  useEffect(() => {
    if (!quill) return;

    const handler = () => {
      onChange(quill.root.innerHTML);
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [quill, onChange]);

  useEffect(() => {
    if (!quill) return;
    quill.enable(!readOnly);
  }, [quill, readOnly]);

  console.log("render RTE");

  return (
    <Box sx={{ background: "#fff" }}>
      <div ref={quillRef} />
    </Box>
  );
}

export default React.memo(RichTextEditor);