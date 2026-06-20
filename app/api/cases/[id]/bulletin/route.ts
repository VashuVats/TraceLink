import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateBulletinText } from "@/lib/ai_service";
import { buildBulletinPdf } from "@/lib/bulletin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { id } = await params;
  const { data: person, error } = await db
    .from("missing_persons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !person) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const bulletinText = await generateBulletinText(person);
  const pdfBytes = await buildBulletinPdf(person, bulletinText);

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="bulletin-${person.name
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf"`,
    },
  });
}
