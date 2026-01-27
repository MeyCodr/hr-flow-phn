import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    if (!filename) {
      return new NextResponse("Filename missing", { status: 400 });
    }

    // STORAGE PATH (outside public)
    const filePath = path.join(
      process.cwd(),
      "storage",
      "uploads",
      filename
    );

    console.log("filepath: ", filePath);

    // Check file exists
    if (!fs.existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    console.log("fileBuffer: ", fileBuffer);

    const ext = path.extname(filename).toLowerCase();
    console.log("file extension: ", ext);

    const contentTypeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".pdf": "application/pdf",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    console.log("contentTypeMap: ", contentTypeMap);

    const contentType =
      contentTypeMap[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
