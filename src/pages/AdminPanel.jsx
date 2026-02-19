import React, { useEffect, useState } from "react";
import api from "../api";
import UploadExcel from "./UploadExcel";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const token = localStorage.getItem("token");

  /* ================= STATES ================= */
  const [form, setForm] = useState({});
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState("photo"); // photo | video

  const [events, setEvents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");

  if (!token) return <h2>Unauthorized</h2>;

  /* ================= LOAD EVENTS ================= */
  const loadEvents = async () => {
    try {
      const res = await api.get("/admin/calendar");
      setEvents(res.data || []);
    } catch (err) {
      console.error("Calendar fetch error:", err);
    }
  };

  /* ================= LOAD LEADS ================= */
  const loadLeads = async () => {
    try {
      const res = await api.get("/admin/counseling");
      setLeads(res.data || []);
    } catch (err) {
      alert("Failed to load counseling leads");
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

    try {
      await api.post("/admin/announcements", fd);
      alert("Announcement Added");
      setForm({});
      setFile(null);
    } catch {
      alert("Failed to add announcement");
    }
  };

  /* ================= GALLERY (PHOTO / VIDEO) ================= */
  const uploadGallery = async () => {
    if (!form.event || !form.category)
      return alert("Event & Category required");

    if (mediaType === "photo" && !file)
      return alert("Photo required");

    if (mediaType === "video" && (!file || !form.videoLink))
      return alert("Video link & thumbnail required");

    const fd = new FormData();
    fd.append("event", form.event);
    fd.append("category", form.category.toLowerCase());
    fd.append("type", mediaType);
    fd.append("file", file);

    if (mediaType === "video") {
      fd.append("videoLink", form.videoLink);
    }

    try {
      await api.post("/admin/gallery", fd);
      alert("Gallery uploaded successfully");
      setForm({});
      setFile(null);
      setMediaType("photo");
    } catch {
      alert("Gallery upload failed");
    }
  };

  /* ================= EVENTS ================= */
  const addEvent = async () => {
    try {
      await api.post("/admin/calendar", {
        title: form.eventTitle,
        description: form.eventDesc,
        date: form.eventDate,
      });
      alert("Event Added");
      loadEvents();
    } catch {
      alert("Failed to add event");
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/admin/calendar/${id}`);
      alert("Event Deleted");
      loadEvents();
    } catch {
      alert("Failed to delete event");
    }
  };

  /* ================= EXPORT LEADS ================= */
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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "counseling_leads.csv";
    a.click();
    window.URL.revokeObjectURL(url);
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
            <input
              className="input-field"
              placeholder="Title"
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
            <textarea
              className="input-field"
              placeholder="Body"
              onChange={(e) =>
                setForm({ ...form, body: e.target.value })
              }
            />
            <input
              className="input-field"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button className="btn" onClick={uploadAnnouncement}>
              Add Announcement
            </button>
          </div>

          {/* GALLERY */}
          <div className="section">
            <h2>Upload Gallery</h2>

            <input
              className="input-field"
              placeholder="Event"
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

            <div className="media-toggle">
              <button
                className={mediaType === "photo" ? "active" : ""}
                onClick={() => setMediaType("photo")}
              >
                📸 Photo
              </button>
              <button
                className={mediaType === "video" ? "active" : ""}
                onClick={() => setMediaType("video")}
              >
                🎥 Video
              </button>
            </div>

            {mediaType === "video" && (
              <input
                className="input-field"
                placeholder="YouTube Video Link"
                onChange={(e) =>
                  setForm({ ...form, videoLink: e.target.value })
                }
              />
            )}

            <input
              className="input-field"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <button className="btn" onClick={uploadGallery}>
              Upload Gallery
            </button>
          </div>

          {/* EVENTS */}
          <div className="section">
            <h2>Add Event</h2>
            <input
              className="input-field"
              placeholder="Title"
              onChange={(e) =>
                setForm({ ...form, eventTitle: e.target.value })
              }
            />
            <textarea
              className="input-field"
              placeholder="Description"
              onChange={(e) =>
                setForm({ ...form, eventDesc: e.target.value })
              }
            />
            <input
              className="input-field"
              type="date"
              onChange={(e) =>
                setForm({ ...form, eventDate: e.target.value })
              }
            />
            <button className="btn" onClick={addEvent}>
              Add Event
            </button>

            <div className="events-list">
              {events.map((e) => (
                <div className="event-item" key={e._id}>
                  {e.title}
                  <button
                    className="delete-btn"
                    onClick={() => deleteEvent(e._id)}
                  >
                    Delete
                  </button>
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
            <input
              className="search-input"
              placeholder="Search name / phone / city"
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="export-btn" onClick={exportExcel}>
              Export Excel
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="leads-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Village</th>
                  <th>City</th>
                  <th>WhatsApp</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((l, i) => (
                  <tr key={l._id}>
                    <td>{i + 1}</td>
                    <td>{l.name}</td>
                    <td>{l.phone}</td>
                    <td>{l.village || "-"}</td>
                    <td>{l.city || "-"}</td>
                    <td>
                      {l.whatsappSent ? (
                        <span style={{ color: "green" }}>Sent</span>
                      ) : (
                        <span style={{ color: "red" }}>Pending</span>
                      )}
                    </td>
                    <td>{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="no-leads">
                      No counseling leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
