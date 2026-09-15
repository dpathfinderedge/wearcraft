import { NextRequest } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '@/lib/auth';
import { errorResponse, handleApiError, successResponse } from '@/lib/api-response';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const acceptedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function uploadBuffer(buffer: Buffer): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'wearcraft/products', resource_type: 'image' },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const formData = await request.formData();
    const entries = formData.getAll('files');
    if (entries.length === 0 || entries.some((entry) => !(entry instanceof File))) {
      return errorResponse('Select at least one image file.', 400);
    }
    if (entries.length > 8) return errorResponse('You can upload up to 8 images.', 400);

    const uploaded = [];
    for (const entry of entries) {
      if (!(entry instanceof File)) {
        return errorResponse('Invalid image upload.', 400);
      }
      const file = entry;
      if (!acceptedTypes.has(file.type)) return errorResponse('Only JPG, PNG, and WebP images are supported.', 400);
      if (file.size > MAX_FILE_SIZE) return errorResponse('Each image must be 5MB or smaller.', 400);
      uploaded.push(await uploadBuffer(Buffer.from(await file.arrayBuffer())));
    }
    return successResponse(uploaded);
  } catch (error) {
    return handleApiError(error);
  }
}
