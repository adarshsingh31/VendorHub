import { v2 as cloudinary } from "cloudinary";

const requiredEnvKeys = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnvKeys = requiredEnvKeys.filter(
  (key) => !process.env[key] || process.env[key].includes("your_"),
);

if (missingEnvKeys.length) {
  console.warn(
    `Cloudinary configuration is incomplete or still using placeholders: ${missingEnvKeys.join(", ")}`,
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

export const hasCloudinaryConfig = () =>
  requiredEnvKeys.every(
    (key) => process.env[key] && !process.env[key].includes("your_"),
  );

export default cloudinary;
