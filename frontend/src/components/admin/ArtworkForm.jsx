import { useRef, useState } from "react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND = process.env.REACT_APP_BACKEND_URL;

const EMPTY = {
  title: "",
  category: "characters",
  year: new Date().getFullYear(),
  image: "",
  description: "",
  software: "",
  polycount: "",
};

const inputCls =
  "w-full border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition-colors duration-300 focus:border-[#00F0FF]";
const labelCls = "font-code mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50";

export default function ArtworkForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, software: initial.software.join(", ") }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await axios.post(`${API}/upload`, data, { withCredentials: true });
      setForm((f) => ({ ...f, image: res.data.url }));
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setError("Upload an image or paste an image URL");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      title: form.title,
      category: form.category,
      year: Number(form.year),
      image: form.image,
      description: form.description,
      software: form.software.split(",").map((s) => s.trim()).filter(Boolean),
      polycount: form.polycount,
    };
    try {
      if (initial) {
        await axios.put(`${API}/artworks/${initial.slug}`, payload, { withCredentials: true });
      } else {
        await axios.post(`${API}/artworks`, payload, { withCredentials: true });
      }
      onSave();
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : "Save failed");
      setSaving(false);
    }
  };

  const previewSrc = form.image.startsWith("/api/") ? `${BACKEND}${form.image}` : form.image;

  return (
    <form onSubmit={onSubmit} className="border border-white/10 bg-[#0a0a0a] p-8" data-testid="artwork-form">
      <h2 className="font-display mb-8 text-2xl font-black tracking-tighter">
        {initial ? "EDIT ARTWORK" : "NEW ARTWORK"}
      </h2>
      {error && (
        <p className="font-code mb-6 border border-[#FF003C]/40 bg-[#FF003C]/10 px-4 py-3 text-xs text-[#FF003C]" data-testid="artwork-form-error">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <label className={labelCls}>Title</label>
          <input required value={form.title} onChange={set("title")} className={inputCls} data-testid="form-title-input" />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select value={form.category} onChange={set("category")} className={inputCls} data-testid="form-category-select">
            <option value="characters">Characters</option>
            <option value="environments">Environments</option>
            <option value="props">Props</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Year</label>
          <input required type="number" value={form.year} onChange={set("year")} className={inputCls} data-testid="form-year-input" />
        </div>
        <div>
          <label className={labelCls}>Polycount</label>
          <input required value={form.polycount} onChange={set("polycount")} placeholder="e.g. 48K tris" className={inputCls} data-testid="form-polycount-input" />
        </div>
      </div>
      <div className="mt-6">
        <label className={labelCls}>Software (comma separated)</label>
        <input required value={form.software} onChange={set("software")} placeholder="ZBrush, Blender, UE5" className={inputCls} data-testid="form-software-input" />
      </div>
      <div className="mt-6">
        <label className={labelCls}>Description</label>
        <textarea required rows={4} value={form.description} onChange={set("description")} className={inputCls} data-testid="form-description-input" />
      </div>
      <div className="mt-6">
        <label className={labelCls}>Artwork Image</label>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <div className="flex-1">
            <input
              value={form.image}
              onChange={set("image")}
              placeholder="Paste image URL or upload a file"
              className={inputCls}
              data-testid="form-image-input"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="font-code mt-3 border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-40"
              data-testid="form-image-upload-btn"
            >
              {uploading ? "Uploading..." : "Upload File"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" data-testid="form-image-file-input" />
          </div>
          {previewSrc && (
            <img src={previewSrc} alt="Preview" className="h-28 w-44 border border-white/10 object-cover" data-testid="form-image-preview" />
          )}
        </div>
      </div>
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={saving || uploading}
          className="font-code border border-[#00F0FF] px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-[#00F0FF] transition-colors duration-300 hover:bg-[#00F0FF] hover:text-black disabled:opacity-40"
          data-testid="form-submit-btn"
        >
          {saving ? "Saving..." : initial ? "Save Changes" : "Publish Artwork"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="font-code border border-white/20 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-white/60 transition-colors duration-300 hover:text-white"
          data-testid="form-cancel-btn"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
