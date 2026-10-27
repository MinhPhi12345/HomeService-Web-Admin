export const isMockEnabled = import.meta.env.VITE_USE_MOCK === 'true';

export function delayMock<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export * from './mockAuth';
export * from './mockServices';
export * from './mockUsers';
export * from './mockReports';
export * from './mockDisputes';
export * from './mockReviews';
