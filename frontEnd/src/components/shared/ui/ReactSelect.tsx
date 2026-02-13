import { forwardRef, useMemo } from "react";
import Select, { components, type MenuListProps } from "react-select";

type Option = { label: string; value: string | number };



interface ReactSelectProps {
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  options: Option[];
  value?: string | number | null;
  disabled?: boolean;
  onChange: (value: string | number | null, option?: Option | null) => void;
  onInputChange?: (value: string) => void;
  onMenuScrollToBottom?: () => void;
  loading?: boolean;
  getOptionLabel?: (option: Option) => string;
  selectedLabel?: string;
  placeholder?: string
  isClearable?: boolean
  isDisabled?: boolean
  maxMenuHeight?: number;
  onBlur?: () => void;
  onMenuOpen?: () => void;
  onMenuClose?: () => void;
}
const CustomMenuList = (props: MenuListProps<Option, false>) => {
  const { onMenuScrollToBottom } = props.selectProps;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;

    // Threshold to handle sub-pixel rounding (trackpad/zoom)
    const bottomThreshold = 10;
    const isNearBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + bottomThreshold;

    if (isNearBottom && onMenuScrollToBottom) {
      onMenuScrollToBottom(e as any);
    }
  };

  return (
    <components.MenuList
      {...props}
      innerProps={{
        ...props.innerProps,
        // We attach the scroll listener to the component's existing props
        onScroll: (e: React.UIEvent<HTMLDivElement>) => {
          handleScroll(e);
          // Ensure we don't break react-select's internal scroll handling
          props.innerProps.onScroll?.(e);
        }
      }}
    >
      {props.children}
    </components.MenuList>
  );
};
const ReactSelect = forwardRef<HTMLDivElement, ReactSelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      value,
      onChange,
      onInputChange,
      onMenuScrollToBottom,
      loading = false,
      getOptionLabel,
      selectedLabel,
      required = false,
      placeholder = "",
      isClearable = false,
      isDisabled = false,
      maxMenuHeight = 250,
      onBlur,
      onMenuClose,
      onMenuOpen,
    },
    ref
  ) => {
    const selectedOption = useMemo(() => {
      if (value === null || value === undefined) return null;

      // First try to find the option in the current options list
      const foundOption = options.find((opt) => String(opt.value) === String(value));
      if (foundOption) return foundOption;

      // If not found and we have a selectedLabel, create a fallback option with that label
      if (selectedLabel) {
        return {
          value: String(value),
          label: String(selectedLabel),
        };
      }

      // Last resort: just use the value as label
      return {
        value: String(value),
        label: String(value),
      };
    }, [options, value, selectedLabel]);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 0, }}>
        {label && (
          <label
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: error ? "#d32f2f" : "#555",
              marginBottom: 0,
              marginLeft: 10,
            }}
          >
            {label}
            {required && <span style={{ color: "#d32f2f" }}> *</span>}
          </label>
        )}
        <Select<Option, false>
          ref={ref as any}
          components={{ MenuList: CustomMenuList }}
          className="custom-select"
          options={options}
          value={selectedOption}
          isLoading={loading}
          isDisabled={isDisabled}
          isClearable={isClearable}
          getOptionLabel={getOptionLabel}
          placeholder={placeholder}
          onMenuOpen={onMenuOpen}
          onMenuClose={onMenuClose}
          menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
          menuPosition="fixed"
          onChange={(newValue, actionMeta) => {
            if (!newValue) {
              onChange(null, null);
              if (actionMeta.action === "clear") onInputChange?.("");
              return;
            }
            onChange(newValue.value, newValue);
          }}
          onInputChange={(inputValue, meta) => {
            if (meta.action === "input-change") onInputChange?.(inputValue);
          }}
          onMenuScrollToBottom={onMenuScrollToBottom}
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: 32,
              backgroundColor: isDisabled ? "#f0f0f0" : "#ffffff",
              cursor: isDisabled ? "not-allowed" : "text",
              minHeight: 40,
              padding: "0px",
              border: error ? "1px solid #d32f2f" : "1px solid rgba(0, 0, 0, 0.23)",
              boxShadow: error ? "0 0 0 1px #d32f2f" : "none",
              "&:hover": {
                border: error ? "1px solid #d32f2f" : "1px solid rgba(0, 0, 0, 0.87)",
              },
              "&:focus-within": {
                border: error ? "2px solid #d32f2f" : "2px solid #1976d2",
                boxShadow: "none",
              },
            }),
            placeholder: (base) => ({
              ...base,
              fontSize: 11,
              color: "rgba(0, 0, 0, 0.6)",
              textTransform: "capitalize"
            }),
            input: (base) => ({
              ...base,
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.87)",
              textTransform: "capitalize"
            }),
            singleValue: (base) => ({
              ...base,
              fontSize: 12,
              color: "rgba(0, 0, 0, 0.87)",
              textTransform: "capitalize"
            }),
            option: (base, state) => ({
              ...base,
              fontSize: 12,
              textTransform: "capitalize",
              backgroundColor: state.isSelected ? "#1976d2" : state.isFocused ? "#f5f5f5" : "transparent",
              color: state.isSelected ? "#ffffff" : "rgba(0, 0, 0, 0.87)",
              "&:hover": {
                backgroundColor: state.isSelected ? "#1976d2" : "#f5f5f5",
              },
            }),
            menu: (base) => ({ ...base, zIndex: 5 }),
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            menuList: (base) => ({ ...base, maxHeight: maxMenuHeight }),
          }}
          onBlur={onBlur}
        />

        {helperText && (
          <span
            style={{
              color: error ? "#d32f2f" : "#6b7280",
              fontSize: 12,
              marginTop: "3px",
              marginLeft: "14px",
            }}
          >
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

export default ReactSelect;