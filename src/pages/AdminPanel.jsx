import React, { useEffect, useState } from "react";
import api from "../api";
import UploadExcel from "./UploadExcel";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const token = localStorage.getItem("token");

  /* ================= AUTH ================= */
  if (!token) return <h2>Unauthorized</h2>;

  /* ================= STATES ================= */
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("photo");

  const [events, setEvents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");

  /* ================= LOAD EVENTS ================= */
  const loadEvents = async () => {
    try {
      const res = await api.get("/admin/calendar");
      setEvents(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= LOAD LEADS ================= */
  const loadLeads = async () => {
    try {
      const res = await api.get("/admin/counseling");
      setLeads(res.data || []);
    } catch {
      alert("Failed to load leads");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  /* ================= FILTER LEADS ================= */
  const filteredLeads = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.city && l.city.toLowerCase().includes(search.toLowerCase()))
  );

  /* ================= ANNOUNCEMENT ================= */
  const uploadAnnouncement = async () => {
    if (!form.title || !form.body) return alert("Title & Body required");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    if (file) fd.append("attachments", file);

    await api.post("/admin/announcements", fd);
    alert("Announcement Added");
    setForm({});
    setFile(null);
  };

  /* ================= GALLERY ================= */
const uploadGallery = async () => {
  if (!form.event || !form.category)
    return alert("Event & Category required");

  if (mediaType === "photo") {
    if (!file) return alert("Photo required");
  }

  if (mediaType === "video") {
    if (!form.videoLink)
      return alert("YouTube link required");
    if (!file)
      return alert("Thumbnail image required");
  }

  const fd = new FormData();
  fd.append("event", form.event);
  fd.append("category", form.category.toLowerCase());
  fd.append("type", mediaType);
  fd.append("file", file); // image OR thumbnail

  if (mediaType === "video") {
    fd.append("videoLink", form.videoLink);
  }

  try {
    await api.post("/admin/gallery", fd);
    alert("Gallery uploaded successfully");

    // RESET
    setForm({});
    setFile(null);
    setMediaType("photo");
  } catch (err) {
    alert("Gallery upload failed");
  }
};


  /* ================= GENERAL INFO ================= */
  const addGeneralInfo = async () => {
    if (!form.info || !form.detail) return alert("Fields required");

    await api.post("/admin/disclosures/general", {
      info: form.info,
      detail: form.detail,
    });

    alert("General Info Added");
    setForm({});
  };

  /* ================= PDF ================= */
  const uploadPDF = async () => {
    if (!form.docName || !file) return alert("Fields required");

    const fd = new FormData();
    fd.append("name", form.docName);
    fd.append("pdf", file);

    await api.post("/admin/disclosures/documents", fd);
    alert("PDF Uploaded");
    setForm({});
    setFile(null);
  };

  /* ================= ACADEMIC ================= */
  const addAcademic = async () => {
    if (!form.acTitle || !file) return alert("Fields required");

    const fd = new FormData();
    fd.append("title", form.acTitle);
    fd.append("pdf", file);

    await api.post("/admin/disclosures/academic", fd);
    alert("Academic Added");
    setForm({});
    setFile(null);
  };

  /* ================= RESULTS ================= */
  const addResultX = async () => {
    await api.post("/admin/disclosures/resultX", {
      year: form.xYear,
      registered: form.xReg,
      passed: form.xPass,
      percentage: form.xPer,
    });
    alert("Result X Added");
  };

  const addResultXII = async () => {
    await api.post("/admin/disclosures/resultXII", {
      year: form.xiiYear,
      registered: form.xiiReg,
      passed: form.xiiPass,
      percentage: form.xiiPer,
    });
    alert("Result XII Added");
  };

  /* ================= STAFF / INFRA ================= */
  const addStaff = async () => {
    await api.post("/admin/disclosures/staff", {
      info: form.staffInfo,
      detail: form.staffDetail,
    });
    alert("Staff Added");
  };

  const addInfra = async () => {
    await api.post("/admin/disclosures/infra", {
      info: form.infraInfo,
      detail: form.infraDetail,
    });
    alert("Infrastructure Added");
  };

  /* ================= EVENTS ================= */
  const addEvent = async () => {
    await api.post("/admin/calendar", {
      title: form.eventTitle,
      description: form.eventDesc,
      date: form.eventDate,
    });
    alert("Event Added");
    loadEvents();
  };

  const deleteEvent = async (id) => {
    await api.delete(`/admin/calendar/${id}`);
    alert("Event Deleted");
    loadEvents();
  };

  /* ================= EXPORT ================= */
  const exportExcel = () => {
    const csv =
      "Name,Phone,Village,City,WhatsApp,Date\n" +
      filteredLeads
        .map(
          (l) =>
            `${l.name},${l.phone},${l.village || ""},${l.city || ""},${
              l.whatsappSent ? "Sent" : "Pending"
            },${new Date(l.createdAt).toLocaleString()}`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "counseling_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ================= UI ================= */
  return (
    <div className="admin-panel">
      {/* TABS */}
      <div className="tabs">
        <button className="tab-button" onClick={() => setActiveTab("dashboard")}>
          Dashboard
        </button>
        <button
          className="tab-button"
          onClick={() => {
            setActiveTab("leads");
            loadLeads();
          }}
        >
          Counseling Leads
        </button>
      </div>

      {/* ================= DASHBOARD ================= */}
      {activeTab === "dashboard" && (
        <div className="dashboard">

          {/* ANNOUNCEMENT */}
          <div className="section">
            <h2>Upload Announcement</h2>
            <input className="input-field" placeholder="Title" onChange={(e)=>setForm({...form,title:e.target.value})}/>
            <textarea className="input-field" placeholder="Body" onChange={(e)=>setForm({...form,body:e.target.value})}/>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
            <button className="btn" onClick={uploadAnnouncement}>Upload</button>
          </div>

          {/* GALLERY */}
         <div className="section">
  <h2>Upload Gallery</h2>

  <input
    className="input-field"
    placeholder="Event Name"
    onChange={(e) =>
      setForm({ ...form, event: e.target.value })
    }
  />

  <input
    className="input-field"
    placeholder="Category (junior / senior)"
    onChange={(e) =>
      setForm({ ...form, category: e.target.value })
    }
  />

  {/* MEDIA TYPE TOGGLE */}
  <div className="media-toggle">
    <button
      type="button"
      className={mediaType === "photo" ? "active" : ""}
      onClick={() => {
        setMediaType("photo");
        setFile(null);
      }}
    >
      📸 Photo
    </button>

    <button
      type="button"
      className={mediaType === "video" ? "active" : ""}
      onClick={() => {
        setMediaType("video");
        setFile(null);
      }}
    >
      ▶️ YouTube Video
    </button>
  </div>

  {/* YOUTUBE LINK (ONLY FOR VIDEO) */}
  {mediaType === "video" && (
    <input
      className="input-field"
      placeholder="Paste YouTube Video Link"
      onChange={(e) =>
        setForm({ ...form, videoLink: e.target.value })
      }
    />
  )}

  {/* FILE INPUT */}
  <input
    className="input-field"
    type="file"
    accept="image/*"
    onChange={(e) => setFile(e.target.files[0])}
  />

  <button className="btn" onClick={uploadGallery}>
    Upload
  </button>
</div>


          {/* EVENTS */}
          <div className="section">
            <h2>Add Event</h2>
            <input className="input-field" placeholder="Title" onChange={(e)=>setForm({...form,eventTitle:e.target.value})}/>
            <textarea className="input-field" placeholder="Description" onChange={(e)=>setForm({...form,eventDesc:e.target.value})}/>
            <input type="date" onChange={(e)=>setForm({...form,eventDate:e.target.value})}/>
            <button className="btn" onClick={addEvent}>Add</button>
            <div className="events-list">
              {events.map(ev=>(
                <div className="event-item" key={ev._id}>
                  {ev.title}
                  <button className="delete-btn" onClick={()=>deleteEvent(ev._id)}>Delete</button>
                </div>
              ))}
            </div>
          </div>

          <UploadExcel />
        </div>
      )}

      {/* ================= LEADS ================= */}
      {activeTab === "leads" && (
        <div className="leads-container">
          <h2>Counseling Leads</h2>
          <div className="search-export">
            <input className="search-input" placeholder="Search..." onChange={(e)=>setSearch(e.target.value)}/>
            <button className="export-btn" onClick={exportExcel}>Export Excel</button>
          </div>

          <table className="leads-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Phone</th><th>City</th><th>Status</th><th>Date</th></tr>
            </thead>
            <tbody>
              {filteredLeads.map((l,i)=>(
                <tr key={l._id}>
                  <td>{i+1}</td>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.city||"-"}</td>
                  <td>{l.whatsappSent?"Sent":"Pending"}</td>
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
