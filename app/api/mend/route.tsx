import { prisma } from "@/utils/prisma";
import { validateImage } from "@/utils/fileValidation";
import { saveUploadedFile } from "@/utils/uploadFile";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const content = await prisma.mend.findFirst();
    return Response.json(content);
  } catch (err) {
    return Response.json({ error: "Error fetching content" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const fileField = formData.get("image");
    const file = fileField instanceof File ? fileField : null;

    let imagePath = null;

    if (file && file.size > 0) {
      const validationError = validateImage(file);
      if (validationError) {
        return Response.json({ error: validationError }, { status: 400 });
      }
      imagePath = await saveUploadedFile(file, "img/tech", "image");
    }

    const newContent = await prisma.mend.create({
      data: {
        name,
        company,
        image: imagePath ?? "",
      },
    });

    return Response.json(newContent, { status: 201 });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Error creating content" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const company = formData.get("company") as string;
    const fileField = formData.get("image");
    const file = fileField instanceof File ? fileField : null;

    const existing = await prisma.mend.findFirst();
    if (!existing)
      return Response.json({ error: "Not found" }, { status: 404 });

    const updatedData: { name: string; company: string; image?: string } = { name, company };

    if (file && file.size > 0) {
      const validationError = validateImage(file);
      if (validationError) {
        return Response.json({ error: validationError }, { status: 400 });
      }
      updatedData.image = await saveUploadedFile(file, "img/tech", "image");
    }

    const updated = await prisma.mend.update({
      where: { id: existing.id },
      data: updatedData,
    });

    return Response.json(updated);
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Error updating content" }, { status: 500 });
  }
}
