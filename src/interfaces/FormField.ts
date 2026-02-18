type FieldType = "text" | "select" | "date" | "file" | "checkbox" | "textarea";

// --- Base Props ---
export interface BaseProps<T = string> {
  fieldType: FieldType;
  label: string;
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  refObj?: React.MutableRefObject<T | null>;
  className?: string;
  maxLength?: string;
  required?: boolean;
}

// --- Text Field Props ---
export interface TextFieldProps extends BaseProps<string> {
  fieldType: "text";
  type?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "password"
    | "number"
    | "time"
    | "date"
    | "datetime-local"
    | "month"
    | "week";
  inputMode?:
    | "text"
    | "search"
    | "email"
    | "tel"
    | "url"
    | "none"
    | "numeric"
    | "decimal";
}

// --- Date Field Props ---
export interface DateFieldProps extends BaseProps<string> {
  fieldType: "date";
  min?: string;
  max?: string;
}

// --- Select Field Props ---
export interface SelectFieldProps<T = string> extends BaseProps<T> {
  fieldType: "select";
  options: { value: T; label: string }[];
  interfaceType?: "popover" | "action-sheet" | "alert";
  slot?: "start" | "end";
  justify?: "start" | "end" | "space-between";
}

// --- File Field Props ---
export interface FileFieldPropsSingle extends BaseProps<File | null> {
  fieldType: "file";
  multiple?: false;
  accept?: string;
  captureBackCamera?: boolean;
}

export interface FileFieldPropsMultiple extends BaseProps<File[]> {
  fieldType: "file";
  multiple: true;
  accept?: string;
  captureBackCamera?: boolean;
}

// --- Checkbox Field Props ---
export interface CheckboxFieldProps extends BaseProps<boolean> {
  fieldType: "checkbox";
  text: string; // Label text next to the checkbox
}

export interface TextAreaFieldProps extends BaseProps<string> {
  fieldType: "textarea";
  rows?: number;
  autoGrow?: boolean;
}

export type FileFieldProps = FileFieldPropsSingle | FileFieldPropsMultiple;

// --- Combined Props ---
export type FormFieldProps<T = string> =
  | TextFieldProps
  | DateFieldProps
  | SelectFieldProps<T>
  | FileFieldProps
  | CheckboxFieldProps
  | TextAreaFieldProps;
