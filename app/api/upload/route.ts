import { NextResponse } from "next/server";
import { saveUploadedFile } from "@/utils/uploadFile";
import { validateImage } from "@/utils/fileValidation";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const fileField = form.get("file");
    const file = fileField instanceof File ? fileField : null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validationError = validateImage(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const url = await saveUploadedFile(file, "editor", uuidv4());

    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
