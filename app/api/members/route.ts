import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateImageAsync } from "@/utils/fileValidation";
import { saveUploadedFile } from "@/utils/uploadFile";
import { sanitizeHtml } from "@/utils/sanitize";

function invalidateMembers() {
  revalidatePath("/");
  revalidatePath("/gishuud");
}

export async function GET() {
  try {
    const list = await prisma.members.findMany({
      orderBy: { id: "asc" },
    });
    return NextResponse.json(list);
  } catch {
    return NextResponse.json(
      { error: "Error fetching members" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const position = form.get("position")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    const education = form.get("education")?.toString() ?? "";
    const company = form.get("company")?.toString() ?? "";
    const parlament = form.get("parlament")?.toString() ?? "";
    const file = form.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const validationError = await validateImageAsync(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const imagePath = await saveUploadedFile(file, "img/tech", "member");

    const newM = await prisma.members.create({
      data: {
        position,
        name,
        education: sanitizeHtml(education),
        company: sanitizeHtml(company),
        parlament: sanitizeHtml(parlament),
        image: imagePath,
      },
    });

    invalidateMembers();
    return NextResponse.json(newM, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error creating member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    await prisma.members.delete({ where: { id } });

    invalidateMembers();
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Error deleting member" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    const form = await req.formData();

    const position = form.get("position")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    const education = form.get("education")?.toString() ?? "";
    const company = form.get("company")?.toString() ?? "";
    const parlament = form.get("parlament")?.toString() ?? "";
    const file = form.get("image") as File | null;

    const existing = await prisma.members.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    let imagePath = existing.image;

    if (file && file.size > 0) {
      const validationError = await validateImageAsync(file);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      imagePath = await saveUploadedFile(file, "img/tech", "member");
    }

    const updated = await prisma.members.update({
      where: { id },
      data: {
        position,
        name,
        education: sanitizeHtml(education),
        company: sanitizeHtml(company),
        parlament: sanitizeHtml(parlament),
        image: imagePath,
      },
    });

    invalidateMembers();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error updating member" },
      { status: 500 }
    );
  }
}
