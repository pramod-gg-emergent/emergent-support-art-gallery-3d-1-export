import { useRef, useState } from "react";
import axios from "axios";
import { X, ArrowUp, ArrowDown } from "lucide-react";

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
  media: [],
  stack: false,
  fit: false,
};

const inputCls =
  "w-full border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition-colors duration-300 focus:border-[#00F0FF]";
const labelCls = "font-code mb-2 block text-[10px] uppercase tracking-[0.25em] text-white/50";

const VIDEO_RE = /\.(mp4|webm|mov)(\?|$)/i;
const MODEL_RE = /\.mview(\?|$)/i;

const detectType = (url, fallback) =>
  VIDEO_RE.test(url) ? "video" : MODEL_RE.test(url) ? "model" : fallback;

export default function ArtworkForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial
      ? { ...initial, software: initial.software.join(", "), media: initial.media || [], stack: !!initial.stack, fit: !!initial.fit }
      : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaUploading, setMediaUploading] = useState(-1);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const mediaRefs = useRef([]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setMedia = (i, patch) =>
    setForm((f) => ({ ...f, media: f.media.map((m, idx) => (idx === i ? { ...m, ...patch } : m)) }));
  const addMedia = () =>
    setForm((f) => ({ ...f, media: [...f.media, { type: "image", url: "", label: "" }] }));
  const removeMedia = (i) =>
    setForm((f) => ({ ...f, media: f.media.filter((_, idx) => idx !== i) }));
  const moveMedia = (i, dir) =>
    setForm((f) => {
      const j = i + dir;
      if (j < 0 || j >= f.media.length) return f;
      const next = [...f.media];
      [next[i], next[j]] = [next[j], next[i]];
      return { ...f, media: next };
    });

  const uploadFile = async (file) => {
    const data = new FormData();
    data.append("file", file);
    const res = await axios.post(`${API}/upload`, data, { withCredentials: true });
    return res.data;
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const r = await uploadFile(file);
      if (r.kind !== "image") {
        setError("Cover must be an image — add videos and 3D scenes under Extra Media");
      } else {
        setForm((f) => ({ ...f, image: r.url }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onMediaUpload = async (i, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaUploading(i);
    setError("");
    try {
      const r = await uploadFile(file);
      setMedia(i, { url: r.url, type: r.kind });
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setMediaUploading(-1);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) {
      setError("Upload an image or paste an image URL");
      return;
    }
    const media = form.media
      .filter((m) => m.url)
      .map((m) => ({ ...m, type: detectType(m.url, m.type) }));
    if (media.some((m) => !m.label.trim())) {
      setError("Give every extra media item a label (e.g. Wireframe, UV Map, Turntable)");
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
      media,
      stack: !!form.stack,
      fit: !!form.fit,
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
            <option value="low-poly">Stylized Low Poly</option>
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
      <div className="mt-6 flex items-center gap-4 border border-white/10 px-4 py-3">
        <input
          id="stack-toggle"
          type="checkbox"
          checked={!!form.stack}
          onChange={(e) => setForm({ ...form, stack: e.target.checked })}
          className="h-4 w-4 accent-[#00F0FF]"
          data-testid="form-stack-toggle"
        />
        <label htmlFor="stack-toggle" className="font-code text-[10px] uppercase tracking-[0.25em] text-white/60">
          Vertical story layout — stack all images seamlessly like ArtStation
        </label>
      </div>
      <div className="mt-3 flex items-center gap-4 border border-white/10 px-4 py-3">
        <input
          id="fit-toggle"
          type="checkbox"
          checked={!!form.fit}
          onChange={(e) => setForm({ ...form, fit: e.target.checked })}
          className="h-4 w-4 accent-[#00F0FF]"
          data-testid="form-fit-toggle"
        />
        <label htmlFor="fit-toggle" className="font-code text-[10px] uppercase tracking-[0.25em] text-white/60">
          Fit whole image in gallery card — no cropping
        </label>
      </div>
      <div className="mt-6">
        <label className={labelCls}>Extra Media — wireframes, UV maps, alt renders, videos</label>
        {form.media.map((m, i) => (
          <div key={i} className="mb-3 flex flex-col gap-3 border border-white/10 p-4 md:flex-row md:items-center" data-testid={`media-row-${i}`}>
            {m.url && m.type !== "video" && m.type !== "model" && !VIDEO_RE.test(m.url) && !MODEL_RE.test(m.url) ? (
              <img
                src={m.url.startsWith("/api/") ? `${BACKEND}${m.url}` : m.url}
                alt={m.label || "Media preview"}
                className="h-14 w-20 border border-white/10 object-cover"
              />
            ) : m.url ? (
              <span className="font-code flex h-14 w-20 shrink-0 items-center justify-center border border-white/10 text-[9px] uppercase tracking-[0.2em] text-[#00F0FF]">
                {m.type === "model" || MODEL_RE.test(m.url) ? "3D" : "Video"}
              </span>
            ) : (
              <span className="h-14 w-20 shrink-0 border border-dashed border-white/15" />
            )}
            <input
              value={m.label}
              onChange={(e) => setMedia(i, { label: e.target.value })}
              placeholder="Label (Wireframe, UV Map...)"
              className={`${inputCls} md:w-56`}
              data-testid={`media-label-${i}`}
            />
            <input
              value={m.url}
              onChange={(e) => setMedia(i, { url: e.target.value, type: detectType(e.target.value, "image") })}
              placeholder="Paste URL or upload"
              className={`${inputCls} flex-1`}
              data-testid={`media-url-${i}`}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => moveMedia(i, -1)}
                disabled={i === 0}
                className="flex items-center border border-white/20 px-2 py-2 text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-25"
                data-testid={`media-up-${i}`}
                aria-label="Move media up"
              >
                <ArrowUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => moveMedia(i, 1)}
                disabled={i === form.media.length - 1}
                className="flex items-center border border-white/20 px-2 py-2 text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-25"
                data-testid={`media-down-${i}`}
                aria-label="Move media down"
              >
                <ArrowDown size={12} />
              </button>
              <button
                type="button"
                onClick={() => setMedia(i, { stacked: !m.stacked })}
                title="Include in vertical composition"
                className={`font-code border px-2 py-2 text-[9px] uppercase tracking-[0.15em] transition-colors duration-300 ${
                  m.stacked
                    ? "border-[#00F0FF] text-[#00F0FF]"
                    : "border-white/20 text-white/50 hover:text-white"
                }`}
                data-testid={`media-stack-${i}`}
              >
                Vert
              </button>
              <button
                type="button"
                onClick={() => mediaRefs.current[i]?.click()}
                disabled={mediaUploading === i}
                className="font-code border border-white/20 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-40"
                data-testid={`media-upload-${i}`}
              >
                {mediaUploading === i ? "..." : "Upload"}
              </button>
              <input
                ref={(el) => (mediaRefs.current[i] = el)}
                type="file"
                accept="image/*,video/*,.mview"
                onChange={(e) => onMediaUpload(i, e)}
                className="hidden"
                data-testid={`media-file-${i}`}
              />
              <button
                type="button"
                onClick={() => removeMedia(i)}
                aria-label="Remove media item"
                className="flex items-center border border-white/20 px-3 py-2 text-white/70 transition-colors duration-300 hover:border-[#FF003C] hover:text-[#FF003C]"
                data-testid={`media-remove-${i}`}
              >
                <X size={12} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addMedia}
          className="font-code border border-dashed border-white/25 px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF]"
          data-testid="add-media-btn"
        >
          + Add Media
        </button>
      </div>
      <div className="mt-8 flex gap-4">
        <button
          type="submit"
          disabled={saving || uploading || mediaUploading !== -1}
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
