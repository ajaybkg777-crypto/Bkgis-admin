import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import UploadExcel from "./UploadExcel";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const token = localStorage.getItem("token");
  if (!token) return <h2>Unauthorized</h2>;

  const [form, setForm] = useState({});
  const [announcementFile, setAnnouncementFile] = useState(null);
  const [galleryFile, setGalleryFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [academicFile, setAcademicFile] = useState(null);
  const [tcFile, setTcFile] = useState(null);
  const [mediaType, setMediaType] = useState("photo");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [manageSearch, setManageSearch] = useState("");
  const tcFileInputRef = useRef(null);

  const [events, setEvents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tcRecords, setTcRecords] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [disclosure, setDisclosure] = useState({ documents: [], academic: [] });

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.response?.data?.error || fallback;

  const loadEvents = async () => setEvents((await api.get("/admin/calendar")).data || []);
  const loadLeads = async () => setLeads((await api.get("/admin/counseling")).data || []);
  const loadTCRecords = async () => setTcRecords((await api.get("/admin/tc")).data || []);
  const loadAnnouncements = async () => setAnnouncements((await api.get("/admin/announcements")).data || []);
  const loadGallery = async () => setGalleryItems((await api.get("/admin/gallery")).data || []);
  const loadDisclosure = async () => setDisclosure((await api.get("/admin/disclosures")).data || { documents: [], academic: [] });

  useEffect(() => {
    loadEvents();
    loadTCRecords();
    loadAnnouncements();
    loadGallery();
    loadDisclosure();
  }, []);

  const uploadAnnouncement = async () => {
    if (!form.title || !form.body) return alert("Title and body required");
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    if (announcementFile) fd.append("attachments", announcementFile);
    try {
      await api.post("/admin/announcements", fd);
      setForm({});
      setAnnouncementFile(null);
      loadAnnouncements();
      alert("Announcement uploaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload announcement"));
    }
  };

  const deleteAnnouncement = async (id) => {
    await api.delete(`/admin/announcements/${id}`);
    loadAnnouncements();
    alert("Announcement deleted");
  };

  const uploadGallery = async () => {
    if (!form.event || !form.category) return alert("Event and category required");
    if (!galleryFile) return alert("File required");
    if (mediaType === "video" && !form.videoLink) return alert("Video link required");

    const fd = new FormData();
    fd.append("event", form.event);
    fd.append("category", form.category.toLowerCase());
    fd.append("type", mediaType);
    fd.append("file", galleryFile);
    if (mediaType === "video") fd.append("videoLink", form.videoLink);

    try {
      await api.post("/admin/gallery", fd);
      setForm({});
      setGalleryFile(null);
      setMediaType("photo");
      loadGallery();
      alert("Gallery item uploaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload gallery item"));
    }
  };

  const deleteGalleryItem = async (id) => {
    await api.delete(`/admin/gallery/${id}`);
    loadGallery();
    alert("Gallery item deleted");
  };

  const uploadPDF = async () => {
    if (!form.docName || !documentFile) return alert("Document name and PDF required");
    const fd = new FormData();
    fd.append("name", form.docName);
    fd.append("pdf", documentFile);
    try {
      await api.post("/admin/disclosures/documents", fd);
      setForm({});
      setDocumentFile(null);
      loadDisclosure();
      alert("PDF uploaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload PDF"));
    }
  };

  const deleteDocument = async (index) => {
    await api.delete(`/admin/disclosures/documents/${index}`);
    loadDisclosure();
    alert("PDF deleted");
  };

  const addAcademic = async () => {
    if (!form.acTitle || !academicFile) return alert("Title and PDF required");
    const fd = new FormData();
    fd.append("title", form.acTitle);
    fd.append("pdf", academicFile);
    try {
      await api.post("/admin/disclosures/academic", fd);
      setForm({});
      setAcademicFile(null);
      loadDisclosure();
      alert("Academic PDF uploaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload academic PDF"));
    }
  };

  const deleteAcademic = async (index) => {
    await api.delete(`/admin/disclosures/academic/${index}`);
    loadDisclosure();
    alert("Academic record deleted");
  };

  const deleteGeneralInfo = async (index) => {
    await api.delete(`/admin/disclosures/general/${index}`);
    loadDisclosure();
    alert("General info deleted");
  };

  const deleteStaffInfo = async (index) => {
    await api.delete(`/admin/disclosures/staff/${index}`);
    loadDisclosure();
    alert("Staff info deleted");
  };

  const deleteInfraInfo = async (index) => {
    await api.delete(`/admin/disclosures/infra/${index}`);
    loadDisclosure();
    alert("Infrastructure info deleted");
  };

  const deleteResultX = async (index) => {
    await api.delete(`/admin/disclosures/resultX/${index}`);
    loadDisclosure();
    alert("Result X deleted");
  };

  const deleteResultXII = async (index) => {
    await api.delete(`/admin/disclosures/resultXII/${index}`);
    loadDisclosure();
    alert("Result XII deleted");
  };

  const uploadTC = async () => {
    if (!form.tcStudentName || !form.tcFatherName || !form.tcDob || !tcFile) {
      return alert("Student name, father name, DOB and PDF are required");
    }
    const fd = new FormData();
    fd.append("studentName", form.tcStudentName);
    fd.append("fatherName", form.tcFatherName);
    fd.append("dateOfBirth", form.tcDob);
    fd.append("pdf", tcFile);
    try {
      await api.post("/admin/tc", fd);
      setForm((prev) => ({
        ...prev,
        tcStudentName: "",
        tcFatherName: "",
        tcDob: "",
      }));
      setTcFile(null);
      if (tcFileInputRef.current) tcFileInputRef.current.value = "";
      loadTCRecords();
      alert("TC uploaded");
    } catch (error) {
      alert(getErrorMessage(error, "Failed to upload TC"));
    }
  };

  const deleteTCRecord = async (id) => {
    await api.delete(`/admin/tc/${id}`);
    loadTCRecords();
    alert("TC deleted");
  };

  const addGeneralInfo = async () => {
    if (!form.info || !form.detail) return alert("Fields required");
    await api.post("/admin/disclosures/general", { info: form.info, detail: form.detail });
    setForm({});
    alert("General info added");
  };

  const addResultX = async () => {
    await api.post("/admin/disclosures/resultX", {
      year: form.xYear,
      registered: form.xReg,
      passed: form.xPass,
      percentage: form.xPer,
    });
    alert("Result X added");
  };

  const addResultXII = async () => {
    await api.post("/admin/disclosures/resultXII", {
      year: form.xiiYear,
      registered: form.xiiReg,
      passed: form.xiiPass,
      percentage: form.xiiPer,
    });
    alert("Result XII added");
  };

  const addStaff = async () => {
    await api.post("/admin/disclosures/staff", { info: form.staffInfo, detail: form.staffDetail });
    alert("Staff added");
  };

  const addInfra = async () => {
    await api.post("/admin/disclosures/infra", { info: form.infraInfo, detail: form.infraDetail });
    alert("Infrastructure added");
  };

  const addEvent = async () => {
    await api.post("/admin/calendar", {
      title: form.eventTitle,
      description: form.eventDesc,
      date: form.eventDate,
    });
    loadEvents();
    alert("Event added");
  };

  const deleteEvent = async (id) => {
    await api.delete(`/admin/calendar/${id}`);
    loadEvents();
    alert("Event deleted");
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.city && l.city.toLowerCase().includes(search.toLowerCase()))
  );

  const exportExcel = () => {
    const csv = "Name,Phone,Village,City,WhatsApp,Date\n" + filteredLeads
      .map((l) => `${l.name},${l.phone},${l.village || ""},${l.city || ""},${l.whatsappSent ? "Sent" : "Pending"},${new Date(l.createdAt).toLocaleString()}`)
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "counseling_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const query = manageSearch.trim().toLowerCase();
  const includeByQuery = (text) => !query || (text || "").toLowerCase().includes(query);
  const generalRows = (disclosure.generalInfo || [])
    .map((item, index) => ({ index, text: `${item.info || ""} ${item.detail || ""}`.trim(), item }))
    .filter((row) => includeByQuery(row.text));
  const staffRows = (disclosure.staff || [])
    .map((item, index) => ({ index, text: `${item.info || ""} ${item.detail || ""}`.trim(), item }))
    .filter((row) => includeByQuery(row.text));
  const infraRows = (disclosure.infrastructure || [])
    .map((item, index) => ({ index, text: `${item.info || ""} ${item.detail || ""}`.trim(), item }))
    .filter((row) => includeByQuery(row.text));
  const resultXRows = (disclosure.resultX || [])
    .map((item, index) => ({ index, text: `${item.year || ""} ${item.registered || ""} ${item.passed || ""} ${item.percentage || ""}`.trim(), item }))
    .filter((row) => includeByQuery(row.text));
  const resultXIIRows = (disclosure.resultXII || [])
    .map((item, index) => ({ index, text: `${item.year || ""} ${item.registered || ""} ${item.passed || ""} ${item.percentage || ""}`.trim(), item }))
    .filter((row) => includeByQuery(row.text));

  return (
    <div className="admin-panel">
      <div className="tabs">
        <button className="tab-button" onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className="tab-button" onClick={() => { setActiveTab("leads"); loadLeads(); }}>Counseling Leads</button>
      </div>

      {activeTab === "dashboard" && (
        <div className="dashboard">
          <div className="section">
            <h2>Upload Announcement</h2>
            <input className="input-field" placeholder="Title" onChange={(e) => updateForm("title", e.target.value)} />
            <textarea className="input-field" placeholder="Body" onChange={(e) => updateForm("body", e.target.value)} />
            <input type="file" onChange={(e) => setAnnouncementFile(e.target.files[0])} />
            <button className="btn" onClick={uploadAnnouncement}>Upload</button>
            <div className="events-list">
              {announcements.slice(0, 5).map((item) => (
                <div className="event-item" key={item._id}>
                  <span>{item.title}</span>
                  <button className="delete-btn" onClick={() => deleteAnnouncement(item._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Upload Gallery</h2>
            <input className="input-field" placeholder="Event" onChange={(e) => updateForm("event", e.target.value)} />
            <input className="input-field" placeholder="Category (junior/senior)" onChange={(e) => updateForm("category", e.target.value)} />
            <div className="media-toggle">
              <button type="button" className={mediaType === "photo" ? "active" : ""} onClick={() => setMediaType("photo")}>Photo</button>
              <button type="button" className={mediaType === "video" ? "active" : ""} onClick={() => setMediaType("video")}>Video</button>
            </div>
            {mediaType === "video" && <input className="input-field" placeholder="YouTube Link" onChange={(e) => updateForm("videoLink", e.target.value)} />}
            <input type="file" onChange={(e) => setGalleryFile(e.target.files[0])} />
            <button className="btn" onClick={uploadGallery}>Upload</button>
            <div className="events-list">
              {galleryItems.slice(0, 5).map((item) => (
                <div className="event-item" key={item._id}>
                  <span>{item.event} ({item.type})</span>
                  <button className="delete-btn" onClick={() => deleteGalleryItem(item._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Add Event</h2>
            <input className="input-field" placeholder="Title" onChange={(e) => updateForm("eventTitle", e.target.value)} />
            <textarea className="input-field" placeholder="Description" onChange={(e) => updateForm("eventDesc", e.target.value)} />
            <input type="date" onChange={(e) => updateForm("eventDate", e.target.value)} />
            <button className="btn" onClick={addEvent}>Add</button>
            <div className="events-list">
              {events.map((ev) => (
                <div className="event-item" key={ev._id}>
                  <span>{ev.title}</span>
                  <button className="delete-btn" onClick={() => deleteEvent(ev._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Add General Info</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => updateForm("info", e.target.value)} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => updateForm("detail", e.target.value)} />
            <button className="btn" onClick={addGeneralInfo}>Add</button>
          </div>

          <div className="section">
            <h2>Upload PDF</h2>
            <input className="input-field" type="text" placeholder="Document Name" onChange={(e) => updateForm("docName", e.target.value)} />
            <input className="input-field" type="file" onChange={(e) => setDocumentFile(e.target.files[0])} />
            <button className="btn" onClick={uploadPDF}>Upload</button>
            <div className="events-list">
              {(disclosure.documents || []).map((doc, index) => (
                <div className="event-item" key={`${doc.name}-${index}`}>
                  <span>{doc.name}</span>
                  <button className="delete-btn" onClick={() => deleteDocument(index)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Add Academic</h2>
            <input className="input-field" type="text" placeholder="Title" onChange={(e) => updateForm("acTitle", e.target.value)} />
            <input className="input-field" type="file" onChange={(e) => setAcademicFile(e.target.files[0])} />
            <button className="btn" onClick={addAcademic}>Add</button>
            <div className="events-list">
              {(disclosure.academic || []).map((item, index) => (
                <div className="event-item" key={`${item.title}-${index}`}>
                  <span>{item.title}</span>
                  <button className="delete-btn" onClick={() => deleteAcademic(index)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2>Add Result X</h2>
            <input className="input-field" type="text" placeholder="Year" onChange={(e) => updateForm("xYear", e.target.value)} />
            <input className="input-field" type="text" placeholder="Registered" onChange={(e) => updateForm("xReg", e.target.value)} />
            <input className="input-field" type="text" placeholder="Passed" onChange={(e) => updateForm("xPass", e.target.value)} />
            <input className="input-field" type="text" placeholder="Percentage" onChange={(e) => updateForm("xPer", e.target.value)} />
            <button className="btn" onClick={addResultX}>Add</button>
          </div>

          <div className="section">
            <h2>Add Result XII</h2>
            <input className="input-field" type="text" placeholder="Year" onChange={(e) => updateForm("xiiYear", e.target.value)} />
            <input className="input-field" type="text" placeholder="Registered" onChange={(e) => updateForm("xiiReg", e.target.value)} />
            <input className="input-field" type="text" placeholder="Passed" onChange={(e) => updateForm("xiiPass", e.target.value)} />
            <input className="input-field" type="text" placeholder="Percentage" onChange={(e) => updateForm("xiiPer", e.target.value)} />
            <button className="btn" onClick={addResultXII}>Add</button>
          </div>

          <div className="section">
            <h2>Add Staff</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => updateForm("staffInfo", e.target.value)} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => updateForm("staffDetail", e.target.value)} />
            <button className="btn" onClick={addStaff}>Add</button>
          </div>

          <div className="section">
            <h2>Add Infrastructure</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => updateForm("infraInfo", e.target.value)} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => updateForm("infraDetail", e.target.value)} />
            <button className="btn" onClick={addInfra}>Add</button>
          </div>

          <div className="section">
            <h2>Manage Disclosure Entries</h2>
            <input
              className="input-field"
              type="text"
              placeholder="Search info, detail, year, percentage..."
              value={manageSearch}
              onChange={(e) => setManageSearch(e.target.value)}
            />

            <div className="events-list">
              {generalRows.map((row) => (
                <div className="event-item" key={`general-${row.index}`}>
                  <span><strong>General:</strong> {row.item.info} - {row.item.detail}</span>
                  <button className="delete-btn" onClick={() => deleteGeneralInfo(row.index)}>Delete</button>
                </div>
              ))}
              {staffRows.map((row) => (
                <div className="event-item" key={`staff-${row.index}`}>
                  <span><strong>Staff:</strong> {row.item.info} - {row.item.detail}</span>
                  <button className="delete-btn" onClick={() => deleteStaffInfo(row.index)}>Delete</button>
                </div>
              ))}
              {infraRows.map((row) => (
                <div className="event-item" key={`infra-${row.index}`}>
                  <span><strong>Infra:</strong> {row.item.info} - {row.item.detail}</span>
                  <button className="delete-btn" onClick={() => deleteInfraInfo(row.index)}>Delete</button>
                </div>
              ))}
              {resultXRows.map((row) => (
                <div className="event-item" key={`resultx-${row.index}`}>
                  <span><strong>Result X:</strong> Year {row.item.year}, Reg {row.item.registered}, Pass {row.item.passed}, {row.item.percentage}%</span>
                  <button className="delete-btn" onClick={() => deleteResultX(row.index)}>Delete</button>
                </div>
              ))}
              {resultXIIRows.map((row) => (
                <div className="event-item" key={`resultxii-${row.index}`}>
                  <span><strong>Result XII:</strong> Year {row.item.year}, Reg {row.item.registered}, Pass {row.item.passed}, {row.item.percentage}%</span>
                  <button className="delete-btn" onClick={() => deleteResultXII(row.index)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <UploadExcel />
          </div>

          <div className="section">
            <h2>Upload Transfer Certificate</h2>
            <input className="input-field" type="text" placeholder="Student Name" value={form.tcStudentName || ""} onChange={(e) => updateForm("tcStudentName", e.target.value)} />
            <input className="input-field" type="text" placeholder="Father Name" value={form.tcFatherName || ""} onChange={(e) => updateForm("tcFatherName", e.target.value)} />
            <input className="input-field" type="date" value={form.tcDob || ""} onChange={(e) => updateForm("tcDob", e.target.value)} />
            <input ref={tcFileInputRef} type="file" accept="application/pdf" onChange={(e) => setTcFile(e.target.files[0])} />
            <button className="btn" onClick={uploadTC}>Upload TC</button>
            <div className="events-list">
              {tcRecords.map((tc) => (
                <div className="event-item" key={tc._id}>
                  <span>{tc.studentName} | {tc.fatherName} | {new Date(tc.dateOfBirth).toLocaleDateString()}</span>
                  <button className="delete-btn" onClick={() => deleteTCRecord(tc._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "leads" && (
        <div className="leads-container">
          <h2>Counseling Leads</h2>
          <div className="search-export">
            <input className="search-input" placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
            <button className="export-btn" onClick={exportExcel}>Export Excel</button>
          </div>
          <table className="leads-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Phone</th><th>City</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filteredLeads.map((l, i) => (
                <tr key={l._id}>
                  <td>{i + 1}</td>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.city || "-"}</td>
                  <td>{l.whatsappSent ? "Sent" : "Pending"}</td>
                  <td>{new Date(l.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
