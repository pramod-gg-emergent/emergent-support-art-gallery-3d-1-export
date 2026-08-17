import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Pencil, Trash2, Plus, LogOut, ArrowUp, ArrowDown } from "lucide-react";
import ArtworkForm from "@/components/admin/ArtworkForm";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const BACKEND = process.env.REACT_APP_BACKEND_URL;

const imgSrc = (image) => (image.startsWith("/api/") ? `${BACKEND}${image}` : image);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [editing, setEditing] = useState(undefined); // undefined=closed, null=new, object=edit

  const load = async () => {
    const res = await axios.get(`${API}/artworks`);
    setArtworks(res.data);
  };

  useEffect(() => {
    axios
      .get(`${API}/auth/me`, { withCredentials: true })
      .then((res) => {
        setUser(res.data);
        load();
      })
      .catch(() => navigate("/admin/login"));
  }, [navigate]);

  const onDelete = async (slug) => {
    if (!window.confirm("Delete this artwork?")) return;
    await axios.delete(`${API}/artworks/${slug}`, { withCredentials: true });
    load();
  };

  const onMove = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= artworks.length) return;
    const next = [...artworks];
    [next[index], next[j]] = [next[j], next[index]];
    setArtworks(next);
    await axios.post(`${API}/artworks/reorder`, { slugs: next.map((a) => a.slug) }, { withCredentials: true });
  };

  const onLogout = async () => {
    await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
    navigate("/admin/login");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <p className="font-code text-[11px] uppercase tracking-[0.3em] text-white/40">Loading studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] px-6 py-10 md:px-12" data-testid="admin-dashboard">
      <header className="mb-12 flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center">
        <div>
          <p className="font-code mb-2 text-[11px] uppercase tracking-[0.35em] text-[#00F0FF]">
            Studio Console — {user.email}
          </p>
          <h1 className="font-display text-3xl font-black tracking-tighter md:text-4xl">
            ARTWORK MANAGER
          </h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setEditing(null)}
            className="font-code flex items-center gap-2 border border-[#00F0FF] px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-[#00F0FF] transition-colors duration-300 hover:bg-[#00F0FF] hover:text-black"
            data-testid="new-artwork-btn"
          >
            <Plus size={14} /> New Artwork
          </button>
          <button
            onClick={onLogout}
            className="font-code flex items-center gap-2 border border-white/20 px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors duration-300 hover:text-white"
            data-testid="admin-logout-btn"
          >
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {editing !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <ArtworkForm
            initial={editing}
            onSave={() => {
              setEditing(undefined);
              load();
            }}
            onCancel={() => setEditing(undefined)}
          />
        </motion.div>
      )}

      <div className="flex flex-col divide-y divide-white/10 border border-white/10">
        {artworks.map((art, i) => (
          <div
            key={art.slug}
            className="flex flex-col gap-4 p-4 transition-colors duration-300 hover:bg-white/[0.02] md:flex-row md:items-center"
            data-testid={`artwork-row-${art.slug}`}
          >
            <img src={imgSrc(art.image)} alt={art.title} className="h-20 w-32 border border-white/10 object-cover" />
            <div className="flex-1">
              <h3 className="font-display text-lg font-bold tracking-tight">{art.title}</h3>
              <p className="font-code mt-1 text-[10px] uppercase tracking-[0.25em] text-white/50">
                {art.category} / {art.year} / {art.polycount}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onMove(i, -1)}
                disabled={i === 0}
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-25"
                data-testid={`move-up-${art.slug}`}
                aria-label={`Move ${art.title} up`}
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => onMove(i, 1)}
                disabled={i === artworks.length - 1}
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF] disabled:opacity-25"
                data-testid={`move-down-${art.slug}`}
                aria-label={`Move ${art.title} down`}
              >
                <ArrowDown size={14} />
              </button>
              <button
                onClick={() => setEditing(art)}
                className="font-code flex items-center gap-2 border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:border-[#00F0FF] hover:text-[#00F0FF]"
                data-testid={`edit-artwork-${art.slug}`}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => onDelete(art.slug)}
                className="font-code flex items-center gap-2 border border-white/20 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-white/70 transition-colors duration-300 hover:border-[#FF003C] hover:text-[#FF003C]"
                data-testid={`delete-artwork-${art.slug}`}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {artworks.length === 0 && (
          <p className="font-code p-8 text-center text-[11px] uppercase tracking-[0.25em] text-white/40">
            No artworks yet — publish your first piece
          </p>
        )}
      </div>
    </div>
  );
}
