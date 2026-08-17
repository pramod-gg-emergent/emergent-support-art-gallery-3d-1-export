import { useEffect, useRef } from "react";

export default function MarmosetViewer({ url }) {
  const ref = useRef(null);

  useEffect(() => {
    let disposed = false;
    const mount = () => {
      if (disposed || !ref.current || !window.marmoset) return;
      ref.current.innerHTML = "";
      const src = url.startsWith("/") ? `${window.location.origin}${url}` : url;
      const w = ref.current.clientWidth || 800;
      const h = ref.current.clientHeight || 600;
      const viewer = new window.marmoset.WebViewer(w, h, src);
      ref.current.appendChild(viewer.domRoot);
    };
    const existing = document.getElementById("marmoset-viewer-script");
    if (window.marmoset) {
      mount();
    } else if (existing) {
      existing.addEventListener("load", mount);
    } else {
      const s = document.createElement("script");
      s.id = "marmoset-viewer-script";
      s.src = "https://viewer.marmoset.co/main/marmoset.js";
      s.onload = mount;
      document.head.appendChild(s);
    }
    return () => {
      disposed = true;
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [url]);

  return <div ref={ref} className="absolute inset-0 bg-black" data-testid="artwork-modal-model" />;
}
