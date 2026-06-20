import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { MissingPerson } from "./types";

const PAGE_W = 612; // US Letter, points
const PAGE_H = 792;
const MARGIN = 56;

export async function buildBulletinPdf(
  person: MissingPerson,
  bulletinText: string
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.106, 0.122, 0.153); // matches --ink-900
  const tagRed = rgb(0.761, 0.231, 0.231);

  let y = PAGE_H - MARGIN;

  // Header band
  page.drawRectangle({
    x: 0,
    y: PAGE_H - 90,
    width: PAGE_W,
    height: 90,
    color: ink,
  });
  page.drawText("MISSING PERSON BULLETIN", {
    x: MARGIN,
    y: PAGE_H - 45,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  page.drawText("TraceLink Investigative Bulletin — For Public Distribution", {
    x: MARGIN,
    y: PAGE_H - 65,
    size: 9,
    font,
    color: rgb(0.85, 0.85, 0.85),
  });

  y = PAGE_H - 130;

  // Subject block
  page.drawText(person.name.toUpperCase(), {
    x: MARGIN,
    y,
    size: 22,
    font: fontBold,
    color: ink,
  });
  y -= 22;
  const meta = [
    person.age ? `Age ${person.age}` : null,
    person.gender || null,
  ]
    .filter(Boolean)
    .join("   •   ");
  if (meta) {
    page.drawText(meta, { x: MARGIN, y, size: 11, font, color: tagRed });
    y -= 22;
  } else {
    y -= 6;
  }

  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: PAGE_W - MARGIN, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 24;

  const maxWidth = PAGE_W - MARGIN * 2;
  const bodyLines = wrapText(bulletinText, font, 11, maxWidth);
  for (const line of bodyLines) {
    if (y < MARGIN + 60) break; // simple single-page guard
    page.drawText(line, { x: MARGIN, y, size: 11, font, color: ink });
    y -= 16;
  }

  // Footer
  page.drawLine({
    start: { x: MARGIN, y: 56 },
    end: { x: PAGE_W - MARGIN, y: 56 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(
    `Generated ${new Date().toLocaleDateString()} • Case ID ${person.id.slice(
      0,
      8
    )} • Last seen: ${person.last_seen_location ?? "Unknown"}`,
    { x: MARGIN, y: 40, size: 8, font, color: rgb(0.4, 0.4, 0.4) }
  );

  return pdf.save();
}

function wrapText(
  text: string,
  font: any,
  size: number,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  const paragraphs = text.split(/\n+/);
  for (const para of paragraphs) {
    const words = para.split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    lines.push(""); // blank line between paragraphs
  }
  return lines;
}
