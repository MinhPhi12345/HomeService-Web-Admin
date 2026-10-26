import type { AuthResponse } from '../../types';
import { UserRole } from '../../types';

export const mockAuthUser: AuthResponse = {
  userId: 1,
  fullName: 'Quản trị viên',
  email: 'quantri.mock@example.com',
  role: UserRole.Admin,
  accessToken: 'mock_jwt_access_token_admin',
  expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
};
