import React, { useRef, useState } from "react";
import { IonAvatar, IonIcon, IonImg } from "@ionic/react";
import { cameraOutline } from "ionicons/icons";
import "../../styles/FileUpload.scss";

interface FileUploadProps {
  label: string;
  file?: File | string;
  onFileChange: (file: File) => void;
  accept?: string;
  capture?: "user" | "environment";
  isImagePreview?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  label,
  file,
  onFileChange,
  accept = "image/*",
  capture,
  isImagePreview = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    typeof file === "string" ? file : null
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
      if (isImagePreview) {
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  return (
    <div
      className="profile-upload-container"
      onClick={() => inputRef.current?.click()}
    >
      {isImagePreview && (
        <IonAvatar className="profile-avatar">
          <IonImg src={preview || "/favicon.png"} alt={label} />
        </IonAvatar>
      )}

      <div className="upload-text-container">
        <IonIcon icon={cameraOutline} className="upload-icon" />
        <span className="upload-text">{file ? label : `Upload ${label}`}</span>
      </div>

      <input
        type="file"
        accept={accept}
        capture={capture}
        ref={inputRef}
        onChange={handleChange}
        className="hidden-file-input"
      />
    </div>
  );
};

export default FileUpload;
