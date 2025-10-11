import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

// النوع العام للملف (Browser File أو Buffer من API)
type UploadableFile = {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export async function uploadFile(
  file: UploadableFile,
  caseId: string,
  type: string
): Promise<string> {
  try {
    let bucket;
    try {
      // لو في bucket متظبط في Firebase Admin
      bucket = getStorage().bucket();
    } catch (err) {
      bucket = null;
    }

    if (bucket) {
      // ✅ رفع على Firebase Storage
      const filePath = `cases/${caseId}/${type}-${file.name}`;
      const fileRef = bucket.file(filePath);
      await fileRef.save(Buffer.from(await file.arrayBuffer()), {
        contentType: "application/octet-stream",
      });

      return `gs://${bucket.name}/${filePath}`;
    } else {
      // ✅ بديل: Local File System
      const uploadsDir = path.join(process.cwd(), "uploads", caseId);
      fs.mkdirSync(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, `${type}-${file.name}`);
      fs.writeFileSync(filePath, Buffer.from(await file.arrayBuffer()));

      return filePath; // بترجع المسار المحلي
    }
  } catch (error: any) {
    throw new Error(`Upload failed: ${error.message}`);
  }
}
