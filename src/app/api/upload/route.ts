import { NextRequest, NextResponse } from 'next/server';
import { CONTENT_ROLES, DISCIPLESHIP_ROLES } from '@/lib/auth/admin';
import { isApiError, requireAdminApi } from '@/lib/auth/require-admin-api';
import { ALLOWED, isAllowedExt, maxBytes, saveUpload } from '@/lib/upload';

export async function POST(request: NextRequest) {
  const auth = await requireAdminApi([...CONTENT_ROLES, ...DISCIPLESHIP_ROLES]);
  if (isApiError(auth)) return auth;

  const form = await request.formData();
  const file = form.get('file') as File | null;
  const subdir = String(form.get('subdir') || 'misc');
  const type = String(form.get('type') || 'image');

  if (!file || file.size === 0) {
    return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
  }

  const allowed =
    type === 'audio' ? ALLOWED.audio :
    type === 'video' ? ALLOWED.video :
    type === 'pdf' ? ALLOWED.pdf :
    type === 'sermon' ? ALLOWED.sermon :
    ALLOWED.image;

  if (!isAllowedExt(file.name, allowed)) {
    return NextResponse.json({ success: false, message: 'File type not allowed' }, { status: 400 });
  }

  const limit = type === 'video' ? maxBytes(200) : type === 'audio' ? maxBytes(100) : maxBytes(50);
  if (file.size > limit) {
    return NextResponse.json({ success: false, message: 'File too large' }, { status: 400 });
  }

  const path = await saveUpload(file, subdir, type);
  return NextResponse.json({ success: true, path, url: `/${path}` });
}
