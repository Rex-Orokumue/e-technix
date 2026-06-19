import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { renderCurriculumPdf } from '@/lib/curriculum-pdf';
import { UNLOCK_COOKIE } from '@/app/api/curriculum/lead/route';

export async function GET(req: NextRequest) {
  const id = req.cookies.get(UNLOCK_COOKIE)?.value;
  if (!id) return NextResponse.json({ error: 'Unlock the curriculum first.' }, { status: 403 });

  const supabase = createAdminClient();
  const { data: lead } = await supabase
    .from('curriculum_leads')
    .select('name, email')
    .eq('id', id)
    .single();
  if (!lead) return NextResponse.json({ error: 'Unlock the curriculum first.' }, { status: 403 });

  try {
    const buf = await renderCurriculumPdf({ name: lead.name, email: lead.email });
    return new NextResponse(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="E-Technix-Curriculum.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: unknown) {
    console.error('[curriculum/pdf]', e);
    return NextResponse.json({ error: 'Could not generate the PDF. Please try again.' }, { status: 500 });
  }
}
