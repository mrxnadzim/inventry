import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export const uploadImageToS3 = async (fileBuffer, fileName, fileContent) => {
  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: fileContent,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);
    return fileName;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
}

export const deleteImageFromS3 = async (deleteParams) => {
  try {
    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log(`Image deleted successfully from S3: ${deleteParams.Key}`);
    return true;
  } catch (error) {
    console.error("Error deleting image from S3:", error);
    throw error;
  }
}

export const deleteAttachmentFromS3 = async (deleteParams) => {
  try {
    const command = new DeleteObjectCommand(deleteParams);
    await s3.send(command);
    console.log(`Attachment(s) deleted successfully from S3: ${deleteParams.Key}`);
    return true;
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw error;
  }
}

export const getSignedUrlForImage = async (key) => {
  if (!key) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
  });

  try {
    // The URL will be valid for 1 hour (3600 seconds) by default.
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return null;
  }
};