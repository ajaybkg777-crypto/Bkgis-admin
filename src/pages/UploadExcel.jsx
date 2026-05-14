import React, { useState } from "react";
import api from "../api";

export default function UploadExcel() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const uploadExcel = async () => {
    if (!file) return alert("Select Excel file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading...");

      const res = await api.post("/admin/results/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(
        `✔ ${res.data.replaced} results updated/replaced successfully`
      );

      setFile(null);
    } catch (err) {
      setStatus("❌ Upload failed. Check Excel format.");
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={uploadExcel}>Upload Excel</button>

      <p>{status}</p>
    </div>
  );
}
