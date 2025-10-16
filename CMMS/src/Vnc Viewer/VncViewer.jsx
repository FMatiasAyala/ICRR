// src/components/VncQuickModal.jsx
import { useEffect, useRef, useState } from "react";

export default function VncQuickModal({
  isOpen,
  onClose,
  host,
  port = 5900,
  bridgeUrl,   // ej: ws://192.168.8.3:3003/ws-vnc
  token        // opcional
}) {
  const screenRef = useRef(null);
  const rfbRef = useRef(null);
  const [status, setStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  // 🔹 NEW: modo de visualización
  const [viewMode, setViewMode] = useState("fit"); // "fit" | "remote-resize" | "original"

  const toggleFullscreen = () => setFullscreen(prev => !prev);

  function toWsUrl(urlStr) {
    if (!urlStr) return "";
    if (urlStr.startsWith("ws://") || urlStr.startsWith("wss://")) return urlStr;
    if (urlStr.startsWith("http://")) return "ws://" + urlStr.slice(7);
    if (urlStr.startsWith("https://")) return "wss://" + urlStr.slice(8);
    const h = location.host || "192.168.1.6:3002"; // fallback si abrís file://
    return `ws://${h}${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      try { rfbRef.current?.disconnect(); } catch { }
      rfbRef.current = null;
      setStatus("idle");
      setPwdOpen(false);
      setPassword("");
      setLoading(false);
    }
  }, [isOpen]);

  // 🔹 NEW: aplica el modo de visualización a la instancia actual
  function applyViewMode(rfb, mode = viewMode) {
    if (!rfb) return;
    // reset
    rfb.scaleViewport = false;
    rfb.clipViewport = true;
    rfb.resizeSession = false;

    if (mode === "fit") {
      rfb.scaleViewport = true;   // escala canvas al contenedor
      rfb.clipViewport = true;   // evita scroll cuando no entra
    } else if (mode === "remote-resize") {
      rfb.resizeSession = true;   // intenta cambiar resolución remota
      rfb.clipViewport = true;
    } else {
      // "original": 1:1 con scroll si no entra
      rfb.scaleViewport = false;
      rfb.clipViewport = true;
    }
  }

  // 🔹 NEW: re-aplicar cuando cambia el tamaño de ventana
  useEffect(() => {
    if (!isOpen) return;
    const reapply = () => applyViewMode(rfbRef.current);
    window.addEventListener("resize", reapply);
    return () => window.removeEventListener("resize", reapply);
  }, [isOpen, viewMode]);

  // 🔹 NEW: observar el contenedor por si el modal cambia (p.ej., fullscreen)
  useEffect(() => {
    if (!isOpen || !screenRef.current) return;
    const ro = new ResizeObserver(() => applyViewMode(rfbRef.current));
    ro.observe(screenRef.current);
    return () => ro.disconnect();
  }, [isOpen, viewMode]);

  const handleClose = () => {
    try { rfbRef.current?.disconnect(); } catch { }
    rfbRef.current = null;
    setPwdOpen(false);
    setPassword("");
    setStatus("idle");
    onClose?.();
  };

  const connect = async () => {
    if (!screenRef.current || !host) return;
    setLoading(true);
    setStatus("loading-novnc");

    const mod = await import("./novnc/core/rfb");
    const RFB = mod.default || mod;

    const raw = toWsUrl(bridgeUrl);
    const url = new URL(raw);
    url.searchParams.set("host", host);
    url.searchParams.set("port", String(port));
    if (token) url.searchParams.set("token", token);

    const rfb = new RFB(screenRef.current, url.toString(), { shared: true });
    rfb.viewOnly = false;
    rfb.scaleViewport = false; // se define según viewMode abajo
    rfb.focusOnClick = true;
    rfb.credentials = {};

    // 🔹 NEW: aplicar modo apenas se crea
    applyViewMode(rfb);

    rfb.addEventListener("connect", () => {
      setStatus("connected");
      setLoading(false);
      // 🔹 NEW: re-aplicar por si el server anuncia el tamaño después
      applyViewMode(rfb);
    });

    rfb.addEventListener("credentialsrequired", () => {
      setPwdOpen(true);
      setLoading(false);
    });

    rfb.addEventListener("securityfailure", (e) => {
      setStatus("securityfailure");
      alert("Fallo de seguridad: " + (e.detail?.reason || e.detail?.status || ""));
      try { rfb.disconnect(); } catch { }
      rfbRef.current = null;
      setPwdOpen(false);
      setLoading(false);
    });

    rfb.addEventListener("disconnect", (e) => {
      setStatus(`disconnected${e.detail?.clean ? " (clean)" : " (unclean)"}`);
      rfbRef.current = null;
      setPwdOpen(false);
      setLoading(false);
    });

    // 🔹 NEW: fallback si remote-resize no está permitido
    rfb.addEventListener("capabilities", () => {
      // noVNC expone capabilities.remote_resize cuando el server lo soporta
      // @ts-ignore: property exists en runtime
      if (viewMode === "remote-resize" && !rfb.capabilities?.resize) {
        // algunos builds usan .resize, otros .power?.resize o .supportsSetDesktopSize
        // si no vemos capacidad, caemos a fit
        setViewMode("fit");
        applyViewMode(rfb, "fit");
        setStatus(s => s + " | sin soporte de remote-resize, usando fit");
      }
    });

    rfbRef.current = rfb;
    setStatus("connecting");
  };

  const disconnect = () => {
    try { rfbRef.current?.disconnect(); } catch { }
    rfbRef.current = null;
    setStatus("disconnected");
    setPwdOpen(false);
    setLoading(false);
  };

  const submitPassword = () => {
    try {
      rfbRef.current?.sendCredentials({ password });
      setPwdOpen(false);
      setPassword("");
    } catch (e) {
      alert("No se pudo enviar la contraseña: " + (e?.message || e));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={S.backdrop} onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}>
      <div style={fullscreen ? S.modalFullscreen : S.modal}>
        <div style={S.header}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 16 }}>VNC — {host}:{port}</strong>
            <span style={{ opacity: .8 }}>Estado: {status}{loading ? "…" : ""}</span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            {/* 🔹 NEW: selector de modo */}
            <select
              value={viewMode}
              onChange={(e) => { setViewMode(e.target.value); applyViewMode(rfbRef.current, e.target.value); }}
              style={{ ...S.btnGhost, padding: "8px 10px" }}
              title="Modo de ajuste"
              aria-label="Modo de ajuste"
            >
              <option value="fit">Ajustar al contenedor (escala)</option>
              <option value="remote-resize">Cambiar resolución remota</option>
              <option value="original">Original 1:1 (scroll)</option>
            </select>

            <button
              onClick={toggleFullscreen}
              style={S.iconBtn}
              title={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              aria-label={fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {fullscreen ? <ExitFsIcon /> : <EnterFsIcon />}
            </button>
            <button onClick={connect} disabled={loading} style={S.btn}>Conectarme</button>
            <button onClick={disconnect} style={S.btnGhost}>Desconectar</button>
            <button onClick={handleClose} style={S.iconBtn} aria-label="Cerrar">✕</button>
          </div>
        </div>

        <div ref={screenRef} tabIndex={0} style={S.screen} />

        {pwdOpen && (
          <div style={S.pwdBackdrop}>
            <div style={S.pwdCard} onClick={(e) => e.stopPropagation()}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Contraseña VNC</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá la contraseña"
                style={S.input}
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") submitPassword(); }}
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <button onClick={() => { setPwdOpen(false); setPassword(""); }} style={S.btnGhost}>Cancelar</button>
                <button onClick={submitPassword} style={S.btn}>Aceptar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const EnterFsIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 3v6H3" />
    <path d="M15 3v6h6" />
    <path d="M9 21v-6H3" />
    <path d="M21 15h-6v6" />
  </svg>
);

const ExitFsIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M7 3h4v4" />
    <path d="M17 3h-4v4" />
    <path d="M7 21h4v-4" />
    <path d="M17 21h-4v-4" />
  </svg>
);

const S = {
  backdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999,
  },
  modal: {
    width: "95vw", maxWidth: 1200, height: "85vh",
    background: "#0b0f14", color: "#e6edf3",
    border: "1px solid #2a3544", borderRadius: 12,
    display: "flex", flexDirection: "column", padding: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,.4)"
  },
  modalFullscreen: {
    position: "fixed", inset: 0,
    background: "#0b0f14", color: "#e6edf3",
    display: "flex", flexDirection: "column",
    border: "none", borderRadius: 0,
    padding: 0, boxShadow: "none", zIndex: 10000,
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8,
    padding: "8px 12px"
  },
  iconBtn: {
    background: "transparent", color: "#e6edf3",
    border: "1px solid #2a3544",
    borderRadius: 8,
    padding: "6px 10px",
    cursor: "pointer"
  },
  btn: {
    background: "#1f6feb", color: "#fff",
    border: "1px solid #1f6feb", borderRadius: 8,
    padding: "8px 12px", cursor: "pointer"
  },
  btnGhost: {
    background: "transparent", color: "#e6edf3",
    border: "1px solid #2a3544", borderRadius: 8,
    padding: "8px 12px", cursor: "pointer"
  },
  screen: {
    flex: 1,
    background: "#000",
    outline: "none",
    borderRadius: 8,
    position: "relative",
    overflow: "hidden",      // 👈 clave
    maxHeight: "100%",       // 👈 importante
    minHeight: 300
  },
  pwdBackdrop: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex", alignItems: "center", justifyContent: "center"
  },
  pwdCard: {
    width: "min(92vw, 420px)", background: "#10161d", color: "#e6edf3",
    border: "1px solid #2a3544", borderRadius: 12, padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,.5)"
  },
  input: {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: "1px solid #2a3544", background: "#0b0f14", color: "#e6edf3"
  },
};
