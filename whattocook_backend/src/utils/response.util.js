/**
 * ========================================================
 * UTILITY CHUẨN HÓA PHẢN HỒI API (RESPONSE FORMATTER)
 * Giúp mọi API trả về định dạng thống nhất:
 * {
 *   success: true/false,
 *   message: "Thông điệp",
 *   data: ...,
 *   pagination: { ... } (tùy chọn)
 * }
 * ========================================================
 */

/**
 * Trả về phản hồi thành công
 */
const sendSuccess = (res, data = null, message = 'Thành công', statusCode = 200, pagination = null) => {
    const response = {
        success: true,
        message,
        data
    };

    if (pagination) {
        response.pagination = pagination;
    }

    return res.status(statusCode).json(response);
};

/**
 * Trả về phản hồi lỗi
 */
const sendError = (res, message = 'Đã có lỗi xảy ra', statusCode = 500, errorDetails = null) => {
    const response = {
        success: false,
        message
    };

    if (process.env.NODE_ENV === 'development' && errorDetails) {
        response.error = errorDetails.message || errorDetails;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError
};
