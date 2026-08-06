"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ContentType, SiteSettings } from "@/types/admin";

type Tab = "overview" | "appointments" | "messages" | "content" | "settings";
type Item = Record<string, unknown> & { _id: string };
type DoctorOption = { slug: string; name: string };
type Notice = { text: string; type: "success" | "error" | "info" } | null;

type Stats = {
  appointments: { total: number; pending: number; confirmed: number; today: number; upcoming: number };
  messages: { total: number; new: number };
  content: { services: number; doctors: number; posts: number };
  demo?: boolean;
};

const emptyStats: Stats = {
  appointments: { total: 0, pending: 0, confirmed: 0, today: 0, upcoming: 0 },
  messages: { total: 0, new: 0 },
  content: { services: 0, doctors: 0, posts: 0 },
};

const emptyContent = {
  type: "service" as ContentType,
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  meta: "{}",
  published: true,
};

const emptySettings: SiteSettings = {
  name: "PrimeCare",
  phone: "",
  email: "",
  address: "",
  emergency: "",
  hours: [],
  social: { facebook: "", instagram: "", x: "", linkedin: "" },
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("Session expired");
  }
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

function value(item: Item, key: string) {
  return String(item[key] ?? "");
}

function csvEscape(input: unknown) {
  const text = String(input ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [contentType, setContentType] = useState<ContentType>("service");
  const [contentForm, setContentForm] = useState(emptyContent);
  const [contentId, setContentId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ kind: "appointment" | "message"; item: Item } | null>(null);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [settings, setSettings] = useState<SiteSettings>(emptySettings);

  const showNotice = useCallback((text: string, type: "success" | "error" | "info" = "info") => {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 5500);
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await api<Stats>("/api/admin/stats");
      setStats(data);
      if (data.demo) setNotice({ text: "Demo mode is active because MongoDB is not configured. Data works during the current server process but is not production-persistent.", type: "info" });
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to load dashboard statistics", "error");
    }
  }, [showNotice]);

  const loadDoctors = useCallback(async () => {
    try {
      const data = await api<{ doctors: DoctorOption[] }>("/api/appointments");
      setDoctors(data.doctors || []);
    } catch {
      setDoctors([]);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ item: SiteSettings }>("/api/admin/settings");
      setSettings(data.item);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showNotice]);

  const load = useCallback(async () => {
    if (tab === "overview") return;
    if (tab === "settings") {
      await loadSettings();
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab === "content") params.set("type", contentType);
      else {
        params.set("page", String(page));
        params.set("limit", "20");
        if (search) params.set("q", search);
        if (statusFilter) params.set("status", statusFilter);
      }
      const data = await api<{ items: Item[]; total?: number; pages?: number; demo?: boolean }>(`/api/admin/${tab}?${params}`);
      setItems(data.items || []);
      setTotal(data.total ?? data.items?.length ?? 0);
      setPages(data.pages || 1);
      if (data.demo) setNotice({ text: "Demo mode: connect MongoDB for persistent production data.", type: "info" });
    } catch (error) {
      setItems([]);
      showNotice(error instanceof Error ? error.message : "Unable to load records", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, contentType, page, search, statusFilter, loadSettings, showNotice]);

  useEffect(() => { void loadStats(); void loadDoctors(); }, [loadStats, loadDoctors]);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 220);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => { setPage(1); }, [tab, search, statusFilter, contentType]);

  const title = useMemo(() => ({
    overview: "Dashboard overview",
    appointments: "Appointments",
    messages: "Contact messages",
    content: "Website content",
    settings: "Clinic settings",
  })[tab], [tab]);

  function changeTab(next: Tab, filter = "") {
    setTab(next);
    setSearch("");
    setStatusFilter(filter);
    setPage(1);
    setEditor(null);
  }

  function newAppointment() {
    setEditor({ kind: "appointment", item: {
      _id: "new",
      reference: "New appointment",
      name: "",
      email: "",
      phone: "",
      location: "",
      medicalRecord: "",
      date: "",
      time: "09:00 AM",
      reason: "Routine Checkup",
      doctorSlug: "",
      message: "",
      internalNotes: "",
      status: "confirmed",
    } });
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  async function patchRecord(kind: "appointments" | "messages", id: string, payload: Record<string, unknown>) {
    try {
      const creating = kind === "appointments" && id === "new";
      const url = creating ? "/api/admin/appointments" : `/api/admin/${kind}/${encodeURIComponent(id)}`;
      await api(url, { method: creating ? "POST" : "PATCH", body: JSON.stringify(payload) });
      showNotice(creating ? "Appointment created" : "Changes saved", "success");
      setEditor(null);
      await Promise.all([load(), loadStats()]);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to save changes", "error");
    }
  }

  async function removeRecord(kind: "appointments" | "messages", item: Item) {
    if (!window.confirm(`Permanently delete this ${kind === "appointments" ? "appointment" : "message"}?`)) return;
    try {
      await api(`/api/admin/${kind}/${encodeURIComponent(item._id)}`, { method: "DELETE" });
      showNotice("Record deleted", "success");
      await Promise.all([load(), loadStats()]);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to delete record", "error");
    }
  }

  function editContent(item?: Item) {
    if (!item) {
      setContentId(null);
      setContentForm({ ...emptyContent, type: contentType });
      return;
    }
    setContentId(item._id);
    setContentForm({
      type: value(item, "type") as ContentType,
      title: value(item, "title"),
      slug: value(item, "slug"),
      excerpt: value(item, "excerpt"),
      content: value(item, "content"),
      image: value(item, "image"),
      meta: JSON.stringify(item.meta || {}, null, 2),
      published: Boolean(item.published),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveContent(event: FormEvent) {
    event.preventDefault();
    let meta: Record<string, unknown>;
    try {
      meta = JSON.parse(contentForm.meta || "{}");
    } catch {
      showNotice("Meta must be valid JSON", "error");
      return;
    }
    const payload = { ...contentForm, type: contentType, meta };
    try {
      const url = contentId ? `/api/admin/content/${encodeURIComponent(contentId)}` : "/api/admin/content";
      await api(url, { method: contentId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      showNotice(contentId ? "Content updated" : "Content created", "success");
      editContent();
      await Promise.all([load(), loadStats()]);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to save content", "error");
    }
  }

  async function removeContent(item: Item) {
    const isDefault = Boolean(item.isDefault);
    const hasOverride = Boolean(item.hasOverride);
    const action = isDefault ? (hasOverride ? "restore the original default" : "hide this default item") : "delete this custom item";
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;
    try {
      await api(`/api/admin/content/${encodeURIComponent(item._id)}`, { method: "DELETE" });
      showNotice(isDefault && hasOverride ? "Default content restored" : isDefault ? "Default content hidden" : "Content deleted", "success");
      await Promise.all([load(), loadStats()]);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to remove content", "error");
    }
  }

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await api<{ item: SiteSettings }>("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
      setSettings(data.item);
      showNotice("Clinic settings saved", "success");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to save settings", "error");
    }
  }

  async function sendReminder(item: Item) {
    if (!window.confirm(`Send an appointment reminder to ${value(item, "email")}?`)) return;
    try {
      await api(`/api/admin/appointments/${encodeURIComponent(item._id)}`, { method: "PATCH", body: JSON.stringify({ action: "send-reminder" }) });
      showNotice("Reminder sent", "success");
      await load();
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to send reminder", "error");
    }
  }

  async function exportAppointments() {
    try {
      const all: Item[] = [];
      let current = 1;
      let maxPages = 1;
      do {
        const params = new URLSearchParams({ page: String(current), limit: "100" });
        if (search) params.set("q", search);
        if (statusFilter) params.set("status", statusFilter);
        const data = await api<{ items: Item[]; pages: number }>(`/api/admin/appointments?${params}`);
        all.push(...data.items);
        maxPages = data.pages || 1;
        current += 1;
      } while (current <= maxPages);
      const headers = ["Reference", "Name", "Email", "Phone", "Date", "Time", "Reason", "Doctor", "Status", "Notes", "Created"];
      const rows = all.map((item) => [item.reference, item.name, item.email, item.phone, item.date, item.time, item.reason, item.doctorName, item.status, item.internalNotes, item.createdAt].map(csvEscape).join(","));
      const blob = new Blob([[headers.map(csvEscape).join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `primecare-appointments-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Unable to export appointments", "error");
    }
  }

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><strong>PrimeCare</strong><span>Administration</span></div>
        <nav>
          {(["overview", "appointments", "messages", "content", "settings"] as Tab[]).map((name) => (
            <button key={name} className={tab === name ? "active" : ""} onClick={() => changeTab(name)}>{name === "overview" ? "Overview" : name[0].toUpperCase() + name.slice(1)}</button>
          ))}
        </nav>
        <div className="admin-user"><span>{email}</span><button onClick={logout}>Sign out</button></div>
      </aside>

      <main className="admin-main">
        <div className="admin-heading">
          <div><span className="eyebrow">Clinic dashboard</span><h1>{title}</h1></div>
          <div className="admin-heading-actions">
            {tab === "appointments" ? <><button className="admin-refresh" onClick={newAppointment}>Add appointment</button><button className="admin-refresh" onClick={exportAppointments}>Export CSV</button></> : null}
            {tab !== "overview" ? <button className="admin-refresh" onClick={() => void load()}>Refresh</button> : null}
          </div>
        </div>

        {notice ? <div className={`admin-notice ${notice.type}`}>{notice.text}</div> : null}

        {tab === "overview" ? (
          <>
            <div className="admin-stat-grid">
              <button onClick={() => changeTab("appointments")}><small>Today</small><strong>{stats.appointments.today}</strong><span>appointments</span></button>
              <button onClick={() => changeTab("appointments", "pending")}><small>Needs action</small><strong>{stats.appointments.pending}</strong><span>pending requests</span></button>
              <button onClick={() => changeTab("appointments", "confirmed")}><small>Upcoming</small><strong>{stats.appointments.upcoming}</strong><span>active bookings</span></button>
              <button onClick={() => changeTab("messages", "new")}><small>Inbox</small><strong>{stats.messages.new}</strong><span>new messages</span></button>
            </div>
            <div className="admin-overview-grid">
              <section className="admin-panel"><h2>Booking summary</h2><dl><div><dt>Total requests</dt><dd>{stats.appointments.total}</dd></div><div><dt>Confirmed</dt><dd>{stats.appointments.confirmed}</dd></div><div><dt>Pending</dt><dd>{stats.appointments.pending}</dd></div><div><dt>Upcoming</dt><dd>{stats.appointments.upcoming}</dd></div></dl></section>
              <section className="admin-panel"><h2>Published website content</h2><dl><div><dt>Services</dt><dd>{stats.content.services}</dd></div><div><dt>Doctors</dt><dd>{stats.content.doctors}</dd></div><div><dt>Articles</dt><dd>{stats.content.posts}</dd></div><div><dt>Messages</dt><dd>{stats.messages.total}</dd></div></dl></section>
            </div>
          </>
        ) : null}

        {(tab === "appointments" || tab === "messages") ? (
          <div className="admin-toolbar">
            <label><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={tab === "appointments" ? "Reference, patient, email or phone" : "Sender, subject or message"}/></label>
            <label><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option>{(tab === "appointments" ? ["pending", "confirmed", "completed", "cancelled"] : ["new", "read", "resolved"]).map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
            <span className="admin-total">{total} record{total === 1 ? "" : "s"}</span>
          </div>
        ) : null}

        {tab === "content" ? (
          <>
            <div className="content-tabs">
              {(["service", "doctor", "post"] as ContentType[]).map((type) => <button className={contentType === type ? "active" : ""} onClick={() => { setContentType(type); setContentId(null); setContentForm({ ...emptyContent, type }); }} key={type}>{type}s</button>)}
            </div>
            <form className="content-form" onSubmit={saveContent}>
              <div className="content-form-heading"><h2>{contentId ? `Edit ${contentType}` : `Add ${contentType}`}</h2>{contentId ? <button type="button" className="admin-refresh" onClick={() => editContent()}>Cancel edit</button> : null}</div>
              <label>Title<input required value={contentForm.title} onChange={(event) => setContentForm({ ...contentForm, title: event.target.value })}/></label>
              <label>Slug<input required value={contentForm.slug} onChange={(event) => setContentForm({ ...contentForm, slug: event.target.value })}/></label>
              <label className="full">Image URL or local path<input value={contentForm.image} placeholder="https://... or /images/example.svg" onChange={(event) => setContentForm({ ...contentForm, image: event.target.value })}/></label>
              <label className="full">Excerpt<textarea rows={3} value={contentForm.excerpt} onChange={(event) => setContentForm({ ...contentForm, excerpt: event.target.value })}/></label>
              <label className="full">Content<textarea rows={6} value={contentForm.content} onChange={(event) => setContentForm({ ...contentForm, content: event.target.value })}/></label>
              <label className="full">Meta JSON<textarea rows={6} value={contentForm.meta} onChange={(event) => setContentForm({ ...contentForm, meta: event.target.value })}/><small>Services: shortTitle, icon, features[]. Doctors: role, qualification, experience, specialties[]. Posts: date, category, readTime.</small></label>
              <label className="admin-checkbox full"><input type="checkbox" checked={contentForm.published} onChange={(event) => setContentForm({ ...contentForm, published: event.target.checked })}/><span>Published on the public website</span></label>
              <button className="button">{contentId ? "Save changes" : `Add ${contentType}`}</button>
            </form>
          </>
        ) : null}

        {tab === "settings" ? (
          <form className="settings-form" onSubmit={saveSettings}>
            <section className="admin-panel"><h2>Clinic identity</h2><div className="settings-grid"><label>Clinic name<input required value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })}/></label><label>Email<input type="email" required value={settings.email} onChange={(event) => setSettings({ ...settings, email: event.target.value })}/></label><label>Phone<input required value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })}/></label><label>Emergency phone<input required value={settings.emergency} onChange={(event) => setSettings({ ...settings, emergency: event.target.value })}/></label><label className="full">Address<input required value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })}/></label></div></section>
            <section className="admin-panel"><h2>Opening hours</h2><label>One line per day or day range<textarea rows={6} value={settings.hours.join("\n")} onChange={(event) => setSettings({ ...settings, hours: event.target.value.split("\n") })}/></label></section>
            <section className="admin-panel"><h2>Social links</h2><div className="settings-grid"><label>Facebook URL<input value={settings.social.facebook} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, facebook: event.target.value } })}/></label><label>Instagram URL<input value={settings.social.instagram} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, instagram: event.target.value } })}/></label><label>X URL<input value={settings.social.x} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, x: event.target.value } })}/></label><label>LinkedIn URL<input value={settings.social.linkedin} onChange={(event) => setSettings({ ...settings, social: { ...settings.social, linkedin: event.target.value } })}/></label></div></section>
            <button className="button" disabled={loading}>Save clinic settings</button>
          </form>
        ) : null}

        {loading ? <div className="admin-loading">Loading…</div> : null}

        {!loading && (tab === "appointments" || tab === "messages" || tab === "content") ? (
          <div className="admin-table-wrap">
            <table>
              <thead><tr>{tab === "appointments" ? <><th>Patient</th><th>Appointment</th><th>Visit</th><th>Status</th></> : tab === "messages" ? <><th>Sender</th><th>Subject</th><th>Message</th><th>Status</th></> : <><th>Title</th><th>Slug</th><th>Visibility</th><th>Source</th></>}<th>Actions</th></tr></thead>
              <tbody>
                {items.length === 0 ? <tr><td colSpan={5}>No records found.</td></tr> : items.map((item) => (
                  <tr key={item._id}>
                    <td>{tab === "appointments" ? <><strong>{value(item, "name")}</strong><small>{value(item, "reference")}<br/>{value(item, "email")}<br/>{value(item, "phone")}</small></> : tab === "messages" ? <><strong>{value(item, "name")}</strong><small>{value(item, "email")}<br/>{value(item, "phone")}</small></> : <><strong>{value(item, "title")}</strong><small>{value(item, "type")}</small></>}</td>
                    <td>{tab === "appointments" ? <><strong>{value(item, "date")}</strong><small>{value(item, "time")}<br/>{value(item, "doctorName") || "Any dentist"}</small></> : tab === "messages" ? value(item, "subject") : value(item, "slug")}</td>
                    <td>{tab === "appointments" ? <><strong>{value(item, "reason")}</strong><small>{value(item, "message")}</small></> : tab === "messages" ? <span className="message-preview">{value(item, "message")}</span> : <span className={item.published ? "badge good" : "badge"}>{item.published ? "Published" : "Hidden"}</span>}</td>
                    <td>{tab === "content" ? <span className="badge">{item.isDefault ? (item.hasOverride ? "Default edited" : "Default") : "Custom"}</span> : <span className={`badge status-${value(item, "status")}`}>{value(item, "status")}</span>}</td>
                    <td><div className="admin-row-actions">{tab === "appointments" ? <><button onClick={() => setEditor({ kind: "appointment", item: { ...item } })}>Open</button><button onClick={() => void sendReminder(item)}>Reminder</button><button className="danger" onClick={() => void removeRecord("appointments", item)}>Delete</button></> : tab === "messages" ? <><button onClick={() => setEditor({ kind: "message", item: { ...item } })}>Open</button><a href={`mailto:${encodeURIComponent(value(item, "email"))}?subject=${encodeURIComponent(`Re: ${value(item, "subject")}`)}`}>Reply</a><button className="danger" onClick={() => void removeRecord("messages", item)}>Delete</button></> : <><button onClick={() => editContent(item)}>Edit</button><button className="danger" onClick={() => void removeContent(item)}>{item.isDefault ? (item.hasOverride ? "Restore" : "Hide") : "Delete"}</button></>}</div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {(tab === "appointments" || tab === "messages") && pages > 1 ? <div className="admin-pagination"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage((current) => current + 1)}>Next</button></div> : null}
      </main>

      {editor ? (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setEditor(null); }}>
          <form className="admin-modal" onSubmit={(event) => { event.preventDefault(); void patchRecord(editor.kind === "appointment" ? "appointments" : "messages", editor.item._id, editor.item); }}>
            <div className="admin-modal-heading"><div><span className="eyebrow">{editor.kind}</span><h2>{editor.kind === "appointment" ? value(editor.item, "reference") : value(editor.item, "subject")}</h2></div><button type="button" onClick={() => setEditor(null)} aria-label="Close">×</button></div>
            {editor.kind === "appointment" ? <div className="modal-form-grid"><label>Name<input value={value(editor.item, "name")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, name: event.target.value } })}/></label><label>Email<input type="email" value={value(editor.item, "email")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, email: event.target.value } })}/></label><label>Phone<input value={value(editor.item, "phone")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, phone: event.target.value } })}/></label><label>Status<select value={value(editor.item, "status")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, status: event.target.value } })}>{["pending", "confirmed", "completed", "cancelled"].map((status) => <option key={status}>{status}</option>)}</select></label><label>Date<input type="date" value={value(editor.item, "date")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, date: event.target.value } })}/></label><label>Time<select value={value(editor.item, "time")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, time: event.target.value } })}>{["09:00 AM", "11:00 AM", "01:30 PM", "03:30 PM", "05:30 PM"].map((time) => <option key={time}>{time}</option>)}</select></label><label>Reason<select value={value(editor.item, "reason")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, reason: event.target.value } })}>{["Routine Checkup", "New Patient Visit", "Specific Concern", "Emergency", "Cosmetic Consultation", "Orthodontic Consultation"].map((reason) => <option key={reason}>{reason}</option>)}</select></label><label>Clinician<select value={value(editor.item, "doctorSlug")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, doctorSlug: event.target.value } })}><option value="">Any available dentist</option>{doctors.map((doctor) => <option value={doctor.slug} key={doctor.slug}>{doctor.name}</option>)}</select></label><label>Location<input value={value(editor.item, "location")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, location: event.target.value } })}/></label><label>Medical record<input value={value(editor.item, "medicalRecord")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, medicalRecord: event.target.value } })}/></label><label className="full">Patient message<textarea rows={4} value={value(editor.item, "message")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, message: event.target.value } })}/></label><label className="full">Internal notes<textarea rows={5} value={value(editor.item, "internalNotes")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, internalNotes: event.target.value } })}/></label></div> : <div className="modal-form-grid"><div className="full admin-message-body"><strong>From: {value(editor.item, "name")} &lt;{value(editor.item, "email")}&gt;</strong><p>{value(editor.item, "message")}</p></div><label>Status<select value={value(editor.item, "status")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, status: event.target.value } })}>{["new", "read", "resolved"].map((status) => <option key={status}>{status}</option>)}</select></label><label className="full">Internal notes<textarea rows={6} value={value(editor.item, "internalNotes")} onChange={(event) => setEditor({ ...editor, item: { ...editor.item, internalNotes: event.target.value } })}/></label></div>}
            <div className="admin-modal-actions"><button type="button" className="admin-refresh" onClick={() => setEditor(null)}>Cancel</button><button className="button">Save changes</button></div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
