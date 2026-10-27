import apiClient from './api';
import { isMockEnabled, delayMock } from './mock/mockData';

export interface UploadResponse {
  url: string;
}

export async function uploadImage(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    throw new Error('Chỉ hỗ trợ ảnh định dạng JPG hoặc PNG.');
  }

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('Ảnh vượt quá dung lượng tối đa 5 MB.');
  }

  if (isMockEnabled) {
    const mockUrl = `/uploads/mock_${Date.now()}_${file.name}`;
    return delayMock(mockUrl, 400);
  }

  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/uploads', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.url;
}
