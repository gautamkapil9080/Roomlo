const acceptedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

module.exports = {
    maxFileSize: 5 * 1024 * 1024,
    validateFile(file) {
        if (!acceptedImageTypes.has(file.mimetype)) return "Upload a JPG, PNG, or WebP image.";
        return null;
    }
};
