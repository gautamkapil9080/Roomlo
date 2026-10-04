module.exports = function errorResponse(error) {
    const status = error.statusCode || error.status ||
        (error.name === "CastError" ? 404 :
            error.code === "LIMIT_FILE_SIZE" ? 413 :
                error.name === "MulterError" ? 400 : 500);
    return {
        status,
        message: status < 500 ? error.message : "Something went wrong. Please try again."
    };
};
