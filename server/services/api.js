const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/upload/`, {
    method: "POST",
    body: formData,
  });
  return res.json();
}
