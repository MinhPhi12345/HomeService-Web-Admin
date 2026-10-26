export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface NotificationResponse {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPage {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  unreadCount: number;
}

export interface UploadResponse {
  url: string;
}
