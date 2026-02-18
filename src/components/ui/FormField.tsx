import { IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea } from "@ionic/react";
import { FormFieldProps, DateFieldProps, SelectFieldProps, FileFieldProps, CheckboxFieldProps, TextFieldProps, TextAreaFieldProps } from "../../interfaces/FormField";
import "../../styles/Onboarding.scss";

const FormField = <T extends string | number>({
    fieldType,
    label,
    value,
    onChange,
    placeholder,
    refObj,
    className = "",
    maxLength,
    required = false,
    ...rest
}: FormFieldProps<T>) => {
    // --- TEXT FIELD ---
    if (fieldType === "text") {
        const { type = "text", inputMode = "text" } = rest as TextFieldProps;
        const stringValue = String(value);

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonInput
                    color="dark"
                    type={type}
                    inputMode={inputMode}
                    placeholder={placeholder}
                    label={label}
                    labelPlacement="floating"
                    max={maxLength}
                    value={stringValue}
                    required={required}
                    onIonChange={(e) => {
                        const val = (e.detail.value || "").toUpperCase();
                        (onChange as (v: string) => void)(val);
                        if (refObj) refObj.current = val;
                    }}
                    className="floating-label-dark"
                />
            </IonItem>
        );
    }

    // --- DATE FIELD ---
    if (fieldType === "date") {
        const { min, max } = rest as DateFieldProps;
        const stringValue = String(value);

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonInput
                    color="dark"
                    type="date"
                    placeholder={placeholder}
                    label={label}
                    labelPlacement="floating"
                    value={stringValue}
                    min={min}
                    max={max}
                    required={required}
                    onIonChange={(e) => {
                        const val = e.detail.value || "";
                        (onChange as (v: string) => void)(val);
                        if (refObj) refObj.current = val;
                    }}
                    className="floating-label-dark"
                />
            </IonItem>
        );
    }

    // --- SELECT FIELD ---
    if (fieldType === "select") {
        const { options, interfaceType = "action-sheet", slot = "end", justify = "start" } =
            rest as SelectFieldProps<T>;

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonLabel>{label}</IonLabel>
                <IonSelect
                    interface={interfaceType}
                    slot={slot}
                    placeholder={placeholder || "Select..."}
                    value={value}
                    onIonChange={(e) => {
                        const selectedValue = e.detail.value as T;
                        onChange(selectedValue);
                        if (refObj) refObj.current = selectedValue;
                    }}
                    justify={justify}
                    required={required}
                >
                    {options.map((opt) => (
                        <IonSelectOption key={String(opt.value)} value={opt.value}>
                            {opt.label}
                        </IonSelectOption>
                    ))}
                </IonSelect>
            </IonItem>
        );
    }

    // --- FILE FIELD ---
    if (fieldType === "file") {
        const { accept, multiple = false, captureBackCamera = false } = rest as FileFieldProps;

        return (
            <div className="file-upload-wrapper">
                <IonLabel position="stacked">{label}</IonLabel>
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    capture={captureBackCamera ? "environment" : undefined} // <-- back camera
                    onChange={(e) => {
                        if (multiple) {
                            const filesArray = e.target.files ? Array.from(e.target.files) : [];
                            (onChange as (v: File[]) => void)(filesArray);
                            if (refObj) refObj.current = filesArray;
                        } else {
                            const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : null;
                            (onChange as (v: File | null) => void)(file);
                            if (refObj) refObj.current = file;
                        }
                    }}
                />
            </div>
        );
    }

    // --- CHECKBOX FIELD ---
    if (fieldType === "checkbox") {
        const { text } = rest as CheckboxFieldProps;
        const checked = Boolean(value);

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonLabel>
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                            const val = e.target.checked;
                            (onChange as (v: boolean) => void)(val);
                            if (refObj) refObj.current = val;
                        }}
                    />
                    <span style={{ marginLeft: "1rem" }}>{text}</span>
                </IonLabel>
            </IonItem>
        );
    }

    // --- TEXTAREA FIELD ---
    if (fieldType === "textarea") {
        const { rows = 4, autoGrow = true } = rest as TextAreaFieldProps;
        const stringValue = String(value);

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonTextarea
                    color="dark"
                    placeholder={placeholder}
                    label={label}
                    labelPlacement="floating"
                    value={stringValue}
                    rows={rows}
                    autoGrow={autoGrow}
                    required={required}
                    onIonChange={(e) => {
                        const val = (e.detail.value || "").toUpperCase();
                        (onChange as (v: string) => void)(val);
                        if (refObj) refObj.current = val;
                    }}
                    className="floating-label-dark"
                />
            </IonItem>
        );
    }

    return null;
};

export default FormField;
