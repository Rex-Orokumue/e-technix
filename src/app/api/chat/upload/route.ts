import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, 'image' | 'file'> = {
  'image/jpeg': 'image',
  'image/png':  'image',
  'image/gif':  'image',
  'image/webp': 'image',
  'application/pdf': 'file',
  'application/msword': 'file',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file',
  'application/vnd.ms-excel': 'file',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file',
};

export async function POST(req: NextRequest) {
  // Auth — student or admin
  const ssrClient = await createClient();
  const { data: { user } } = await ssrClient.auth.getUser();
  const isAdmin = !user && await isAdminAuthenticated();
  if (!user && !isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const attachType = ALLOWED_TYPES[file.type];
  if (!attachType) return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 });

  // Use a unique path so files never collide
  const ext = file.name.split('.').pop() ?? 'bin';
  const prefix = user ? user.id.slice(0, 8) : 'admin';
  const path = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const bytes = await file.arrayBuffer();
  const adminClient = createAdminClient();
  const { error } = await adminClient.storage
    .from('chat-attachments')
    .upload(path, bytes, { contentType: file.type, upsert: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: { publicUrl } } = adminClient.storage
    .from('chat-attachments')
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl, type: attachType, name: file.name });
}
