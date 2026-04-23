import { authHeader } from "./auth";

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/admin/uploads/images", {
      method: "POST",
      headers: authHeader(),
      body: formData,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 413) {
        return { error: "图片太大，请上传 20MB 以内的图片" };
      }
      return { error: data?.error || `upload failed: ${response.status}` };
    }

    return data;
  } catch {
    return { error: "network error" };
  }
}
