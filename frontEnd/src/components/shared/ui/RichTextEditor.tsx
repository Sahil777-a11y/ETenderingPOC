import React, { useEffect, useRef } from "react";
import { useQuill } from "react-quilljs";
import { Box } from "@mui/material";
import {
  PLACEHOLDER_TOKEN_OPTIONS,
  toTokenMarkup,
  type PlaceholderTokenOption,
} from "../../../utils/templateTokens";

interface Props {
  value?: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
  tokenOptions?: PlaceholderTokenOption[];
}

function RichTextEditor({
  value = "",
  onChange,
  readOnly,
  tokenOptions = PLACEHOLDER_TOKEN_OPTIONS,
}: Props) {
  const effectiveTokenOptions = tokenOptions.length
    ? tokenOptions
    : PLACEHOLDER_TOKEN_OPTIONS;
  const toolbarIdRef = useRef(`rte-toolbar-${Math.random().toString(36).slice(2, 11)}`);

  const { quill, quillRef } = useQuill({
    theme: "snow",
    readOnly,
    modules: {
      toolbar: {
        container: `#${toolbarIdRef.current}`,
      },
    },
  });
  
  const handleInsertToken = (selectedToken: string) => {
    if (!quill || !selectedToken) return;

    const range = quill.getSelection(true);
    const insertIndex = range?.index ?? quill.getLength();
    const tokenMarkup = toTokenMarkup(selectedToken);

    quill.insertText(insertIndex, tokenMarkup, "user");
    quill.setSelection(insertIndex + tokenMarkup.length, 0, "silent");
    quill.focus();
  };

  useEffect(() => {
    if (!quill) return;

    const currentHtml = quill.root.innerHTML;
    const nextHtml = value || "";

    if (currentHtml !== nextHtml) {
      quill.clipboard.dangerouslyPasteHTML(nextHtml);
    }
  }, [quill, value]);

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

  return (
    <Box
      sx={{
        background: "#fff",
        "& .toolbar-row": {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        },
        "& .toolbar-left": {
          flex: 1,
        },
        "& .ql-toolbar.ql-snow": {
          border: "none",
          padding: "8px",
        },
        "& .token-select-wrap": {
          px: 1,
          py: 0.5,
        },
        "& .insert-token-select": {
          display: "inline-block",
          height: 26,
          minWidth: 170,
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: "0 8px",
          backgroundColor: "#fff",
          color: "#111",
          WebkitAppearance: "menulist",
          appearance: "menulist",
        },
        "& .insert-token-select option": {
          color: "#111",
          backgroundColor: "#fff",
        },
      }}
    >
      <div className="toolbar-row">
        <div id={toolbarIdRef.current} className="ql-toolbar ql-snow toolbar-left">
          <span className="ql-formats">
            <button className="ql-bold" type="button" />
            <button className="ql-italic" type="button" />
            <button className="ql-underline" type="button" />
          </span>
          <span className="ql-formats">
            <button className="ql-list" value="ordered" type="button" />
            <button className="ql-list" value="bullet" type="button" />
          </span>
        </div>

        <div className="token-select-wrap">
          <select
            className="insert-token-select"
            defaultValue=""
            disabled={Boolean(readOnly)}
            onChange={(event) => {
              handleInsertToken(event.target.value);
              event.currentTarget.value = "";
            }}
          >
            <option value="">InsertToken</option>
            {effectiveTokenOptions.map((token) => (
              <option key={token.value} value={token.value}>
                {token.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div ref={quillRef} />
    </Box>
  );
}

export default React.memo(RichTextEditor);