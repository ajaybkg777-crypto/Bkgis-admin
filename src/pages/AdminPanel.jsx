import React, { useState, useEffect } from "react";
import api from "../api";
import UploadExcel from "./UploadExcel";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [events, setEvents] = useState([]);

  /* 🆕 COUNSELING LEADS STATE */
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [search, setSearch] = useState("");

  if (!token) return <h2>Unauthorized</h2>;

  /* ================= LOAD EVENTS ================= */
  const loadEvents = async () => {
    try {
      const res = await api.get("/admin/calendar");
      setEvents(res.data);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }
  };

  /* ================= LOAD COUNSELING LEADS ================= */
  const loadLeads = async () => {
    try {
      const res = await api.get("/admin/counseling");
      setLeads(res.data);
    } catch (err) {
      console.error("Leads fetch error:", err);
      alert("Failed to load counseling leads");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search) ||
    (lead.city && lead.city.toLowerCase().includes(search.toLowerCase()))
  );

  /* ================= HANDLERS (UNCHANGED) ================= */
  const uploadAnnouncement = async () => {
    if (!form.title || !form.body) return alert("Title & Body required!");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("body", form.body);
    if (file) fd.append("attachments", file);

    try {
      await api.post("/admin/announcements", fd);
      alert("Announcement Added!");
    } catch {
      alert("Failed to add announcement");
    }
  };

  const uploadGallery = async () => {
    if (!form.event || !form.category || !file)
      return alert("All fields required!");

    const fd = new FormData();
    fd.append("event", form.event);
    fd.append("category", form.category);
    fd.append("photo", file);

    try {
      await api.post("/admin/gallery", fd);
      alert("Gallery Image Uploaded!");
    } catch {
      alert("Failed to upload gallery image");
    }
  };

  const addGeneralInfo = async () => {
    if (!form.info || !form.detail) return alert("Both fields required!");

    try {
      await api.post("/admin/disclosures/general", {
        info: form.info,
        detail: form.detail,
      });
      alert("General Info Added!");
    } catch {
      alert("Failed to add general info");
    }
  };

  const uploadPDF = async () => {
    if (!form.docName || !file)
      return alert("Document name & file required!");

    const fd = new FormData();
    fd.append("name", form.docName);
    fd.append("pdf", file);

    try {
      await api.post("/admin/disclosures/documents", fd);
      alert("PDF Uploaded!");
    } catch {
      alert("Failed to upload PDF");
    }
  };

  const addAcademic = async () => {
    if (!form.acTitle || !file) return alert("Fields required!");

    const fd = new FormData();
    fd.append("title", form.acTitle);
    fd.append("pdf", file);

    try {
      await api.post("/admin/disclosures/academic", fd);
      alert("Academic Info Added!");
    } catch {
      alert("Failed to add academic info");
    }
  };

  const addResultX = async () => {
    try {
      await api.post("/admin/disclosures/resultX", {
        year: form.xYear,
        registered: form.xReg,
        passed: form.xPass,
        percentage: form.xPer,
      });
      alert("Result X Added!");
    } catch {
      alert("Failed to add Result X");
    }
  };

  const addResultXII = async () => {
    try {
      await api.post("/admin/disclosures/resultXII", {
        year: form.xiiYear,
        registered: form.xiiReg,
        passed: form.xiiPass,
        percentage: form.xiiPer,
      });
      alert("Result XII Added!");
    } catch {
      alert("Failed to add Result XII");
    }
  };

  const addStaff = async () => {
    try {
      await api.post("/admin/disclosures/staff", {
        info: form.staffInfo,
        detail: form.staffDetail,
      });
      alert("Staff Added!");
    } catch {
      alert("Failed to add staff");
    }
  };

  const addInfra = async () => {
    try {
      await api.post("/admin/disclosures/infra", {
        info: form.infraInfo,
        detail: form.infraDetail,
      });
      alert("Infrastructure Added!");
    } catch {
      alert("Failed to add infrastructure");
    }
  };

  const addEvent = async () => {
    try {
      await api.post("/admin/calendar", {
        title: form.eventTitle,
        description: form.eventDesc,
        date: form.eventDate,
      });
      alert("Event Added!");
      loadEvents();
    } catch {
      alert("Failed to add event");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/admin/calendar/${id}`);
      alert("Event Deleted!");
      loadEvents();
    } catch {
      alert("Failed to delete event");
    }
  };

  const exportExcel = () => {
    const csv =
      "Name,Phone,Village,City,WhatsApp,Date\n" +
      filteredLeads
        .map(
          (l) =>
            `${l.name || ""},${l.phone || ""},${l.village || ""},${
              l.city || ""
            },${l.whatsappSent ? "Sent" : "Pending"},${new Date(
              l.createdAt
            ).toLocaleString()}`
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

      {/* 🔹 SIMPLE TABS */}
      <div className="tabs">
        <button className="tab-button" onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className="tab-button" onClick={() => {
          setActiveTab("leads");
          loadLeads();
        }}>
          Counseling Leads
        </button>
      </div>

      {/* ================= DASHBOARD ================= */}
      {activeTab === "dashboard" && (
        <div className="dashboard">
          <div className="section">
            <h2>Upload Announcement</h2>
            <input className="input-field" type="text" placeholder="Title" onChange={(e) => setForm({...form, title: e.target.value})} />
            <textarea className="input-field" placeholder="Body" onChange={(e) => setForm({...form, body: e.target.value})} />
            <input className="input-field" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn" onClick={uploadAnnouncement}>Add Announcement</button>
          </div>
          <div className="section">
            <h2>Upload Gallery</h2>
            <input className="input-field" type="text" placeholder="Event" onChange={(e) => setForm({...form, event: e.target.value})} />
            <input className="input-field" type="text" placeholder="Category" onChange={(e) => setForm({...form, category: e.target.value})} />
            <input className="input-field" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn" onClick={uploadGallery}>Upload Image</button>
          </div>
          <div className="section">
            <h2>Add Event</h2>
            <input className="input-field" type="text" placeholder="Title" onChange={(e) => setForm({...form, eventTitle: e.target.value})} />
            <textarea className="input-field" placeholder="Description" onChange={(e) => setForm({...form, eventDesc: e.target.value})} />
            <input className="input-field" type="date" onChange={(e) => setForm({...form, eventDate: e.target.value})} />
            <button className="btn" onClick={addEvent}>Add Event</button>
          </div>
          <div className="section">
            <h2>Existing Events</h2>
            <div className="events-list">
              {events.map(e => <div className="event-item" key={e._id}>{e.title} <button className="delete-btn" onClick={() => deleteEvent(e._id)}>Delete</button></div>)}
            </div>
          </div>
          <div className="section">
            <h2>Add General Info</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => setForm({...form, info: e.target.value})} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => setForm({...form, detail: e.target.value})} />
            <button className="btn" onClick={addGeneralInfo}>Add</button>
          </div>
          <div className="section">
            <h2>Upload PDF</h2>
            <input className="input-field" type="text" placeholder="Document Name" onChange={(e) => setForm({...form, docName: e.target.value})} />
            <input className="input-field" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn" onClick={uploadPDF}>Upload</button>
          </div>
          <div className="section">
            <h2>Add Academic</h2>
            <input className="input-field" type="text" placeholder="Title" onChange={(e) => setForm({...form, acTitle: e.target.value})} />
            <input className="input-field" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button className="btn" onClick={addAcademic}>Add</button>
          </div>
          <div className="section">
            <h2>Add Result X</h2>
            <input className="input-field" type="text" placeholder="Year" onChange={(e) => setForm({...form, xYear: e.target.value})} />
            <input className="input-field" type="text" placeholder="Registered" onChange={(e) => setForm({...form, xReg: e.target.value})} />
            <input className="input-field" type="text" placeholder="Passed" onChange={(e) => setForm({...form, xPass: e.target.value})} />
            <input className="input-field" type="text" placeholder="Percentage" onChange={(e) => setForm({...form, xPer: e.target.value})} />
            <button className="btn" onClick={addResultX}>Add</button>
          </div>
          <div className="section">
            <h2>Add Result XII</h2>
            <input className="input-field" type="text" placeholder="Year" onChange={(e) => setForm({...form, xiiYear: e.target.value})} />
            <input className="input-field" type="text" placeholder="Registered" onChange={(e) => setForm({...form, xiiReg: e.target.value})} />
            <input className="input-field" type="text" placeholder="Passed" onChange={(e) => setForm({...form, xiiPass: e.target.value})} />
            <input className="input-field" type="text" placeholder="Percentage" onChange={(e) => setForm({...form, xiiPer: e.target.value})} />
            <button className="btn" onClick={addResultXII}>Add</button>
          </div>
          <div className="section">
            <h2>Add Staff</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => setForm({...form, staffInfo: e.target.value})} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => setForm({...form, staffDetail: e.target.value})} />
            <button className="btn" onClick={addStaff}>Add</button>
          </div>
          <div className="section">
            <h2>Add Infrastructure</h2>
            <input className="input-field" type="text" placeholder="Info" onChange={(e) => setForm({...form, infraInfo: e.target.value})} />
            <input className="input-field" type="text" placeholder="Detail" onChange={(e) => setForm({...form, infraDetail: e.target.value})} />
            <button className="btn" onClick={addInfra}>Add</button>
          </div>
          <UploadExcel />
        </div>
      )}

         {/* LEADS */}
      {activeTab === "leads" && (
        <div className="leads-container">
          <h2>Counseling Leads</h2>

          <input
            className="search-input"
            placeholder="Search name / phone / city"
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="export-btn" onClick={exportExcel}>
            Export Excel
          </button>

          <table className="leads-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Village</th>
                <th>City</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="7">No data found</td>
                </tr>
              )}

              {filteredLeads.map((l, i) => (
                <tr key={l._id || i}>
                  <td>{i + 1}</td>
                  <td>{l.name}</td>
                  <td>{l.phone}</td>
                  <td>{l.village || "-"}</td>
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
