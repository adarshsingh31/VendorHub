import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const isAllowedImageType = (file) => {
  const extension = file.originalname?.split(".").pop()?.toLowerCase();

  const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
  return (
    ALLOWED_MIME_TYPES.includes(file.mimetype) ||
    (extension !== undefined && allowedExtensions.includes(extension))
  );
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    if (!isAllowedImageType(file)) {
      return cb(
        new Error("Only JPG, JPEG, PNG, and WEBP image files are allowed."),
      );
    }

    cb(null, true);
  },
});

export const uploadProductImages = upload.array("images", 5);
export const uploadStoreImages = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "banner", maxCount: 1 }
]);

export default uploadProductImages;
