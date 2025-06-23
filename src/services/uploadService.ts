import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class UploadService {
  private s3Client: S3Client;
  private bucket: string;
  private region: string;
  private fileUrlBase: string;

  constructor(
    awsAccessKey: string,
    awsSecretKey: string,
    region: string,
    bucket: string
  ) {
    this.bucket = bucket;
    this.region = region;
    this.fileUrlBase = `https://${bucket}.s3.${region}.amazonaws.com/`;

    this.s3Client = new S3Client({
      region: region,
      credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey,
      },
    });
  }

  async getFileUrl(key: string): Promise<string> {
    try {
      // Option: Presigned URL (private file access)
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 3600,
      });
      return url;

      // Option: Public URL (if the file is public)
      // return this.fileUrlBase + key;
    } catch (err) {
      console.error("Error retrieving file URL:", err);
      throw err;
    }
  }

  async uploadFile(file: File): Promise<void> {
    try {
      // Convert file to Uint8Array (safe for both Node and Browser environments)
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: file.name,
        Body: uint8Array,
        ContentType: file.type || "application/octet-stream",
      });

      await this.s3Client.send(command);
      console.log(`Successfully uploaded '${file.name}' to S3.`);
    } catch (err) {
      console.error("Error uploading file to S3:", err);
      throw err;
    }
  }
}
