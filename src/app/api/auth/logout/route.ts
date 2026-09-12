import { removeAuthCookie } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/api-response';

export async function POST() {
  try {
    await removeAuthCookie();

    return successResponse(null, 'Logged out successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
