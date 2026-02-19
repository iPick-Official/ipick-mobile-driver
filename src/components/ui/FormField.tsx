import { IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, IonTextarea } from "@ionic/react";
import { FormFieldProps, DateFieldProps, SelectFieldProps, FileFieldProps, CheckboxFieldProps, TextFieldProps, TextAreaFieldProps } from "../../interfaces/FormField";
import "../../styles/Onboarding.scss";
import { FileData } from "../../types/driverTypes";
import { useState, useEffect, useRef, useMemo } from "react";
import { UploadService } from "../../services/uploadService";

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
                    labelPlacement="stacked"
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
        const {
            options,
            interfaceType = "action-sheet",
            justify = "start",
        } = rest as SelectFieldProps<T>;

        return (
            <IonItem lines="none" className={`input-field ${className}`}>
                <IonSelect
                    label={label}
                    labelPlacement="stacked"
                    interface={interfaceType}
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
        const [previews, setPreviews] = useState<string[]>([]);
        const inputRef = useRef<HTMLInputElement>(null);

        // Normalize value into array for consistent preview handling
        const valueArray = useMemo(() => {
            if (multiple) return (value as FileData[]) || [];
            return value ? [(value as FileData)] : [];
        }, [value, multiple]);

        // Generate preview URLs for both uploaded and new files
        useEffect(() => {
            const urls = valueArray.map((file) => {
                if (file.file instanceof File) return URL.createObjectURL(file.file); // newly selected
                return file.url || ""; // already uploaded
            });

            setPreviews(urls);

            // Cleanup blob URLs on unmount
            return () => urls.forEach((url) => url.startsWith("blob:") && URL.revokeObjectURL(url));
        }, [valueArray]);

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.files) return;

            try {
                if (multiple) {
                    const filesArray = Array.from(e.target.files);

                    // Upload all files
                    const uploadedFiles = await Promise.all(
                        filesArray.map(async (f) => {
                            const uploaded = await UploadService.uploadFile(f);
                            return { name: f.name, url: uploaded.url, file: f, key: uploaded.key };
                        })
                    );

                    (onChange as (v: FileData[]) => void)(uploadedFiles);
                    if (refObj) refObj.current = uploadedFiles;
                } else {
                    const file = e.target.files[0];
                    if (!file) return;

                    const uploaded = await UploadService.uploadFile(file);
                    const fileData: FileData = { name: file.name, url: uploaded.url, file, key: uploaded.key };

                    (onChange as (v: FileData | null) => void)(fileData);
                    if (refObj) refObj.current = fileData;
                }
            } catch (err: any) {
                console.error("File upload failed:", err);
                alert(err.message || "Failed to upload file");
            }
        };

        return (
            <div className="file-upload-wrapper">
                <IonLabel position="stacked">{label}</IonLabel>

                {previews.length > 0 && (
                    <div className="image-preview-container">
                        {previews.map((src, idx) => (
                            <img
                                key={idx}
                                src={src}
                                alt={`preview-${idx}`}
                                className="uploaded-image-preview"
                                style={{ maxWidth: "100%", marginBottom: "0.5rem", borderRadius: "8px" }}
                            />
                        ))}
                    </div>
                )}

                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    capture={captureBackCamera ? "environment" : undefined}
                    style={{ display: "none" }}
                    ref={inputRef}
                    onChange={handleFileChange}
                />

                <button type="button" onClick={() => inputRef.current?.click()} className="upload-btn">
                    {previews.length > 0 ? "Change File" : "Upload File"}
                </button>
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
                    labelPlacement="stacked"
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
