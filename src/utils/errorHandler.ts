import axios from 'axios';

interface ApiErrorResponse {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return 'Không kết nối được máy chủ. Vui lòng kiểm tra kết nối mạng rồi thử lại.';
    }

    const { status, data } = error.response;

    if (data?.message && typeof data.message === 'string') {
      return data.message;
    }

    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) {
        return messages.join('. ');
      }
    }

    switch (status) {
      case 400:
        return 'Dữ liệu yêu cầu không hợp lệ. Vui lòng kiểm tra lại.';
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này.';
      case 404:
        return 'Không tìm thấy dữ liệu yêu cầu.';
      case 409:
        return 'Dữ liệu vừa được cập nhật bởi thao tác khác hoặc đã tồn tại.';
      case 500:
        return 'Đã xảy ra lỗi hệ thống từ máy chủ. Vui lòng thử lại sau.';
      default:
        return `Đã xảy ra lỗi (mã ${status}). Vui lòng thử lại.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định.';
}
