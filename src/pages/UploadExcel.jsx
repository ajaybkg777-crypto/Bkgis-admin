const uploadExcel = async () => {
  if (!file) return alert("Select Excel file!");

  const formData = new FormData();
  formData.append("file", file);

  try {
    setStatus("Uploading...");

    const res = await api.post("/admin/results/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setStatus(`✅ ${res.data.replaced} results uploaded successfully`);
    setFile(null);
  } catch (err) {
    console.error(err);
    setStatus("❌ Upload failed. Check Excel format.");
  }
};
