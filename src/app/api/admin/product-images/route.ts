import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const MAX_PRODUCT_IMAGE_SIZE = 3 * 1024 * 1024;
const ALLOWED_PRODUCT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const PRODUCT_IMAGE_BUCKET = 'product-images';

function getExtension(file: File) {
  const fromName = file.name.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;

  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'image/gif') return 'gif';
  return 'bin';
}

async function ensureProductImageBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { data: bucket } = await supabase.storage.getBucket(PRODUCT_IMAGE_BUCKET);
  if (bucket) return;

  const { error } = await supabase.storage.createBucket(PRODUCT_IMAGE_BUCKET, {
    public: true,
    fileSizeLimit: MAX_PRODUCT_IMAGE_SIZE,
    allowedMimeTypes: ALLOWED_PRODUCT_IMAGE_TYPES,
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await req.formData();
    const file = formData.get('image');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required.' }, { status: 400 });
    }

    if (!ALLOWED_PRODUCT_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPG, PNG, WEBP, or GIF images are allowed.' }, { status: 415 });
    }

    if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
      return NextResponse.json({ error: 'Image must be 3 MB or smaller.' }, { status: 413 });
    }

    await ensureProductImageBucket(supabase);

    const extension = getExtension(file);
    const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '31536000',
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path });
  } catch (error) {
    console.error('Error uploading product image:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
