import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { apiAltaEquiposInf, apiAltaMatafuegos, apiEquiposInf, apiMatafuegos, apiModEquiposInf, apiModMatafuegos, apiPlanos, apiSalas, apiRefrigeracion, apiModRefrigeracion, apiAltaRefrigeracion, apiModUps, apiUps, apiAltaUps } from "../../utils/Fetch";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VncQuickModal from "../../../Vnc Viewer/VncViewer";
import FormEquipo from "./NuevoEquipoInf";
import EquipoPin from "./EquipoPin";
import PanelEquipo from "./PanelEquipo";
const BRIDGE_URL = import.meta.env.VITE_BRIDGE_URL;
const API_BASE = import.meta.env.VITE_API_URL;

const tiposDisponibles = [
  { tipo: "impresora", label: "Impresoras" },
  { tipo: "pc", label: "PCs" },
  { tipo: "matafuego", label: "Mata Fuegos" },
  { tipo: "aire_acondicionado", label: "Aire Acondicionado" },
  { tipo: "ups", label: "UPS" }
];

export default function PlanoKonva() {
  const [q, setQ] = useState("");
  const [salas, setSalas] = useState([])
  const [equipos, setEquipos] = useState([]);
  const [mataFuego, setMataFuego] = useState([]);
  const [equipoActivo, setEquipoActivo] = useState(null);
  const [tiposSeleccionados, setTiposSeleccionados] = useState(tiposDisponibles.map(t => t.tipo));
  const [popupId, setPopupId] = useState(null);
  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [editEquipo, setEditEquipo] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [equiposEditados, setEquiposEditados] = useState({});
  const [matafuegoEditado, setMatafuegoEditado] = useState({});
  const [refrigeracion, setRefrigeracion] = useState([]);
  const [refrigeracionEditada, setRefrigeracionEditada] = useState({});
  const [ups, setUps] = useState([]);
  const [upsEditada, setUpsEditada] = useState({});
  const [planos, setPlanos] = useState([]);
  const [planoActivo, setPlanoActivo] = useState(null);
  const [vncOpen, setVncOpen] = useState(false);
  const [vncParams, setVncParams] = useState({ ip: '', port: 5900, viewOnly: false });
  const BRIDGE = `${BRIDGE_URL}/ws-vnc`
  const stageRef = useRef(null);

  // Pan + zoom suave al punto (x,y) del plano
  const focusOnPoint = ({ x, y, targetScale = 1.8, duration = 0.35 }) => {
    const stage = stageRef.current?.getStage?.();
    if (!stage) return;

    const viewportW = 1000; // mismo width del <Stage>
    const viewportH = 1000; // mismo height del <Stage>

    // Centro del viewport
    const centerX = viewportW / 2;
    const centerY = viewportH / 2;

    // Posición para que (x,y) quede centrado con el nuevo scale
    const nextX = centerX - x * targetScale;
    const nextY = centerY - y * targetScale;

    // Animación nativa de Konva
    stage.to({
      scaleX: targetScale,
      scaleY: targetScale,
      x: nextX,
      y: nextY,
      duration,
      easing: Konva.Easings.EaseInOut,
    });

    // Mantené el estado de tu UI sincronizado
    setScale(targetScale);
    setStagePos({ x: nextX, y: nextY });
  };


  const fetchSalas = async () => {
    try {
      const response = await fetch(apiSalas);
      const data = await response.json();
/*       const soloAdministrativas = data.filter(sala =>
        sala.tipo?.toLowerCase().includes("administrativo")
      ); */
      setSalas(data);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('Error al cargar las salas:', error);
    }
  };
  const norm = (s) =>
    (s ?? "").toString().toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const matchesEq = (it) => {
    if (!q) return true;
    const t = norm(q);
    const sala = salas.find(s => s.id_ubicacion === it.ubicacion_id)?.sala;
    return [it.nombre, it.modelo, it.ip, it.tipo, it.estado, sala]
      .some(v => norm(v).includes(t));
  };

  const matchesMf = (it) => {
    if (!q) return true;
    const t = norm(q);
    return [it.nombre, it.tipo, it.tipo_matafuego, it.capacidad_kg]
      .some(v => norm(v).includes(t));
  };
  const equiposDeposito = equipos.filter(eq => {
    const sala = salas.find(s => s.id_ubicacion === eq.ubicacion_id);
    return sala?.sala?.toLowerCase().includes("deposito central");
  });

  // 1. Traer los equipos del backend
  const fetchEquipos = async () => {
    try {
      const [resEq, resMf, resRef, resUps] = await Promise.all([
        fetch(apiEquiposInf),
        fetch(apiMatafuegos),
        fetch(apiRefrigeracion),
        fetch(apiUps)
      ]);
      const [dataEq, dataMf, dataRef, dataUps] = await Promise.all([
        resEq.json(),
        resMf.json(),
        resRef.json(),
        resUps.json()
      ]);


      setEquipos(dataEq);
      setMataFuego(dataMf);
      setRefrigeracion(dataRef);
      setUps(dataUps);
    } catch (error) {
      console.error("Error al cargar los equipos:", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchSalas();
  }, []);
  useEffect(() => {
    fetch(apiPlanos)
      .then(res => res.json())
      .then(data => {
        setPlanos(data);
        if (data.length > 0) setPlanoActivo(data[0]);
      });
  }, []);

  // Usar los equipos editados si existen
  const equiposFiltrados = equipos
    .filter(eq => {
      const sala = salas.find(s => s.id_ubicacion === eq.ubicacion_id);
      return eq.id_plano === (planoActivo?.id || -1) &&
        !sala?.sala?.toLowerCase().includes("deposito central");
    })
    .map(eq => equiposEditados[eq.id] || eq)
    .filter(eq => tiposSeleccionados.includes(eq.tipo))
    .filter(matchesEq);

  const handleTipoChange = (tipo) => {
    setTiposSeleccionados(prev =>
      prev.includes(tipo)
        ? prev.filter(t => t !== tipo)
        : [...prev, tipo]
    );
    setPopupId(null);
  };

  const matafuegosFiltrados = mataFuego
    .filter(mf => mf.id_plano === (planoActivo?.id || -1))
    .map(mf => matafuegoEditado[mf.id] || mf)
    .filter(mf => tiposSeleccionados.includes(mf.tipo))
    .filter(matchesMf);

  const matchesRef = (it) => {
    if (!q) return true;
    const t = norm(q);
    return [it.nombre, it.tipo, it.marca, it.modelo, it.capacidad_frio]
      .some(v => norm(v).includes(t));
  };
  const refrigeracionFiltrada = refrigeracion
    .filter(rf => rf.id_plano === (planoActivo?.id || -1))
    .map(rf => refrigeracionEditada[rf.id] || rf)
    .filter(rf => tiposSeleccionados.includes(rf.tipo))
    .filter(matchesRef);

  const matchesUps = (it) => {
    if (!q) return true;
    const t = norm(q);
    return [it.nombre, it.tipo, it.marca, it.modelo, it.capacidad_va]
      .some(v => norm(v).includes(t));
  };
  const upsFiltrada = ups
    .filter(up => up.id_plano === (planoActivo?.id || -1))
    .map(up => upsEditada[up.id] || up)
    .filter(up => tiposSeleccionados.includes(up.tipo))
    .filter(matchesUps);



  // Arrastrar: modificar solo el estado local
  const handlePinDrag = (tipo, id, x, y) => {
    if (tipo === "matafuego") {
      setMatafuegoEditado(prev => ({
        ...prev,
        [id]: { ...(mataFuego.find(mf => mf.id === id)), x, y }
      }));
    } else if (tipo === "aire_acondicionado") {
      setRefrigeracionEditada(prev => ({
        ...prev,
        [id]: { ...(refrigeracion.find(rf => rf.id === id)), x, y }
      }));
    } else if(tipo === "ups") {
      setUpsEditada(prev => ({
        ...prev,
        [id]: { ...(ups.find(up => up.id === id)), x, y }
      }));

    } else {
      setEquiposEditados(prev => ({
        ...prev,
        [id]: { ...(equipos.find(eq => eq.id === id)), x, y }
      }));
    }
  };


  // Guardar TODOS los cambios hechos por drag
  const guardarCambiosPosiciones = async () => {
    const cambiosEquipos = Object.values(equiposEditados).map(eq =>
      fetch(`${apiModEquiposInf}${eq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: eq.x, y: eq.y })
      })
    );

    const cambiosMatafuegos = Object.values(matafuegoEditado).map(mf =>
      fetch(`${apiModMatafuegos}${mf.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: mf.x, y: mf.y })
      })
    );
    const cambiosRefrigeracion = Object.values(refrigeracionEditada).map(rf =>
      fetch(`${apiModRefrigeracion}${rf.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: rf.x, y: rf.y })
      })
    );
    const cambiosUps = Object.values(upsEditada).map(up =>
      fetch(`${apiModUps}${up.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: up.x, y: up.y })
      })
    );
    await Promise.all([...cambiosEquipos, ...cambiosMatafuegos, ...cambiosRefrigeracion, ...cambiosUps]);

    setEquiposEditados({});
    setMatafuegoEditado({});
    setRefrigeracionEditada({});
    setUpsEditada({});
    fetchEquipos();
    toast.success("¡Cambios de posición guardados!", { position: "top-right", autoClose: 2000 });
  };

  // Cancelar: descarta cambios locales
  const cancelarCambiosPosiciones = () => {
    setEquiposEditados({});
    setMatafuegoEditado({});
    setRefrigeracionEditada({});
    setUpsEditada({});
    fetchEquipos();
    toast.info("Se cancelaron los cambios", { position: "top-right", autoClose: 1500 });
  };

  // 5. Guardar equipo (alta o edición)
  const guardarEquipo = (datos) => {
    const isMatafuego = datos.tipo === "matafuego";
    const isRefrigeracion = datos.tipo === "aire_acondicionado";
    const isUps = datos.tipo === "ups";

    // Elegir URL de modificación según tipo
    const url = isMatafuego
      ? `${apiModMatafuegos}${datos.id || ""}`
      : isRefrigeracion
        ? `${apiModRefrigeracion}${datos.id || ""}`
        : isUps
          ? `${apiModUps}${datos.id || ""}`
          : `${apiModEquiposInf}${datos.id || ""}`;

    const method = datos.id ? "PUT" : "POST";
    const body = JSON.stringify(datos);

    // Si no hay ID => POST a la URL de alta correspondiente
    const urlAlta = isMatafuego
      ? apiAltaMatafuegos
      : isRefrigeracion
        ? apiAltaRefrigeracion
        : isUps
          ? apiAltaUps
          : apiAltaEquiposInf;

    fetch(datos.id ? url : urlAlta, {
      method,
      headers: { "Content-Type": "application/json" },
      body,
    })
      .then(() => {
        fetchEquipos(); // refresca todos los listados
        setShowForm(false);

        toast.success(
          isMatafuego
            ? "¡Matafuego guardado!"
            : isRefrigeracion
              ? "¡Refrigeración guardada!"
              : isUps
              ? "Ups guardada!"
              : "¡Equipo guardado!",
          { position: "top-right", autoClose: 2000 }
        );
      })
      .catch(() => {
        toast.error("Error al guardar", {
          position: "top-right",
          autoClose: 2000,
        });
      });
  };


  // Zoom y pan
  const handleWheel = e => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    newScale = Math.max(0.5, Math.min(3, newScale));
    setScale(newScale);
    setStagePos({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    });
  };


  const [image, status] = useImage(
    planoActivo?.url_imagen
      ? `${API_BASE}${planoActivo.url_imagen}`
      : null,
    "anonymous"
  );


  return (
    <div
      style={{
        maxWidth: 1580,
        margin: "32px auto",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 4px 32px #0002",
        padding: 30,
        position: "relative",
      }}
    >
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 22,
        borderBottom: "1.5px solid #e0e6ef",
        paddingBottom: 16,
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 0.5, color: "#0D2235" }}>
          Planos Virtuales
        </div>
        {/* Plano Selector */}
        <div style={{ display: "flex", gap: 8 }}>
          {planos.map(plano => (
            <button
              key={plano.id}
              onClick={() => setPlanoActivo(plano)}
              style={{
                padding: "8px 28px",
                borderRadius: 8,
                background: planoActivo && planoActivo.id === plano.id ? "#1976d2" : "#f1f6fb",
                color: planoActivo && planoActivo.id === plano.id ? "#fff" : "#2b3a4a",
                border: planoActivo && planoActivo.id === plano.id ? "none" : "1.5px solid #e0e6ef",
                fontWeight: 600,
                letterSpacing: 0.3,
                fontSize: 17,
                cursor: "pointer",
                boxShadow: planoActivo && planoActivo.id === plano.id ? "0 2px 6px #1976d23d" : undefined,
                transition: "all 0.15s"
              }}
            >
              {plano.nombre}
            </button>
          ))}
        </div>
        {/* Botón agregar */}
      </div>
      {/* Filtros */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 32,
        margin: "18px 0 6px 0",
        fontSize: 18,
      }}>
        {tiposDisponibles.map(t => (
          <label key={t.tipo} style={{ display: "flex", alignItems: "center", fontWeight: 500, gap: 7 }}>
            <input
              type="checkbox"
              checked={tiposSeleccionados.includes(t.tipo)}
              onChange={() => handleTipoChange(t.tipo)}
              style={{
                accentColor: "#1976d2",
                width: 18,
                height: 18
              }}
            />
            {t.label}
          </label>
        ))}
        <span style={{ marginLeft: 18, color: "#8fa3bd", fontWeight: 400, fontSize: 16 }}>
          Hacé click en "+" para agregar un equipo nuevo
        </span>
        {/* Botón flotante */}
        <button
          style={{
            position: "fixed",
            bottom: 32,
            right: 38,
            zIndex: 1300,
            background: "linear-gradient(90deg, #1976d2 60%, #43a047)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 62,
            height: 62,
            fontSize: 38,
            fontWeight: 800,
            boxShadow: "0 6px 24px #1976d2aa",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.18s, box-shadow 0.18s",
            outline: "none"
          }}
          title="Agregar nuevo equipo"
          onClick={() => {
            setEditEquipo({
              nombre: "",
              tipo: "pc",
              modelo: "",
              x: 400,
              y: 500,
              id_plano: planoActivo?.id,
            });
            setShowForm(true);
            setPopupId(null);
          }}
          onMouseOver={e => {
            e.currentTarget.style.transform = "scale(1.12)";
            e.currentTarget.style.boxShadow = "0 12px 32px #1976d2bb";
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 24px #1976d2aa";
          }}
        >
          +
        </button>

      </div>
      {/* Nombre del plano */}
      <h2 style={{
        textAlign: "center",
        margin: "16px 0 8px 0",
        fontSize: 26,
        fontWeight: 700,
        color: "#1976d2"
      }}>
        {planoActivo ? planoActivo.titulo : "Seleccioná un plano"}
      </h2>
      {/* Guardar/cancelar cambios */}
      {Object.keys(equiposEditados).length > 0 || Object.keys(matafuegoEditado).length || Object.keys(refrigeracionEditada).length || Object.keys(upsEditada)> 0 ? (
        <div
          style={{
            position: "fixed",
            top: 140, // ajustá según el header o panel superior
            right: 32,
            zIndex: 1200,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 4px 24px #0002",
            padding: "28px 24px 22px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
            alignItems: "stretch",
            minWidth: 240,
            border: "1.5px solid #e0e6ef",
            animation: "fadeIn .28s"
          }}
        >
          <div style={{
            fontWeight: 600,
            fontSize: 18,
            color: "#1976d2",
            marginBottom: 8,
            textAlign: "center"
          }}>
            Cambios sin guardar
          </div>
          <button
            onClick={guardarCambiosPosiciones}
            style={{
              background: "linear-gradient(90deg, #43a047 70%, #388e3c)",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px #388e3c18"
            }}>
            Guardar cambios de posición
          </button>
          <button
            onClick={cancelarCambiosPosiciones}
            style={{
              background: "#e53935",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "12px 0",
              fontWeight: 700,
              fontSize: 17,
              cursor: "pointer",
              boxShadow: "0 2px 8px #e5393525"
            }}>
            Cancelar
          </button>
        </div>
      ) : null}

      {/* Plano interactivo */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: 16,
        margin: "0 auto 20px auto",
        alignItems: "flex-start"
      }}>
        {/* SIDEBAR LISTADO */}
        <div style={{
          width: 300,
          maxHeight: 1000,
          overflow: "auto",
          background: "#ffffff",
          border: "1px solid #e0e6ef",
          borderRadius: 12,
          boxShadow: "0 2px 10px #0001",
          padding: 12,
          position: "sticky",
          top: 120
        }}>
          <div style={{ fontWeight: 700, color: "#0D2235", margin: "4px 4px 10px 4px" }}>
            Equipos
          </div>
          {/* Buscador */}
          <div style={{ display: "flex", gap: 8, margin: "0 4px 10px 4px" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") setQ(""); }}
              placeholder="Buscar por nombre, modelo o IP…"
              style={{
                flex: 1,
                border: "1.5px solid #dce3ec",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 14,
                background: "#f7f9fc",
                outline: "none"
              }}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                title="Limpiar"
                style={{
                  background: "#fff",
                  color: "#6b7c93",
                  border: "1px solid #e0e6ef",
                  borderRadius: 10,
                  padding: "0 12px",
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                ×
              </button>
            )}
          </div>
          {q && (
            <div style={{ color: "#8fa3bd", fontSize: 13, margin: "0 6px 10px 6px" }}>
              {equiposFiltrados.length + matafuegosFiltrados.length} resultados
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {equiposFiltrados.map(eq => (
              <button
                key={`eq-${eq.id}`}
                onClick={() => {
                  focusOnPoint({ x: eq.x, y: eq.y, targetScale: 2.2 });
                  setEquipoActivo(eq);
                  setShowForm(false);
                  setPopupId?.(null);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  background: (equipoActivo?.tipo === eq.tipo && equipoActivo?.id === eq.id) ? "#e8f1ff" : "#f7f9fc",
                  border: (equipoActivo?.tipo === eq.tipo && equipoActivo?.id === eq.id) ? "2px solid #1976d2" : "1px solid #e6ebf2",
                  boxShadow: (equipoActivo?.tipo === eq.tipo && equipoActivo?.id === eq.id) ? "0 0 0 3px #1976d233 inset" : undefined,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#2b3a4a",
                  fontWeight: 600
                }}
                title="Centrar en el plano"
              >
                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {(eq.nombre || eq.modelo || eq.ip || `Equipo #${eq.id}`)} <span style={{ color: "#8aa0b6", fontWeight: 500 }}>· {eq.tipo}</span>
                </span>
                <span style={{ fontSize: 12, color: "#8aa0b6" }}>
                  ({Math.round(eq.x)}, {Math.round(eq.y)})
                </span>
              </button>

            ))}

            {matafuegosFiltrados.map(mf => (
              <button
                key={`mf-${mf.id}`}
                onClick={() => {
                  focusOnPoint({ x: mf.x, y: mf.y, targetScale: 2.2 });
                  setEquipoActivo(mf);
                  setShowForm(false);
                  setPopupId?.(null);
                }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                  gap: 8,
                  width: "100%",
                  padding: "10px 12px",
                  background: (equipoActivo?.tipo === mf.tipo && equipoActivo?.id === mf.id) ? "#ffecec" : "#fff7f7",
                  border: (equipoActivo?.tipo === mf.tipo && equipoActivo?.id === mf.id) ? "2px solid #e53935" : "1px solid #f0d6d6",
                  boxShadow: (equipoActivo?.tipo === mf.tipo && equipoActivo?.id === mf.id) ? "0 0 0 3px #e5393526 inset" : undefined,
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: 14,
                  color: "#7a2e2e",
                  fontWeight: 600
                }}
                title="Centrar en el plano"
              >
                <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {(mf.nombre || `Matafuego #${mf.id}`)} <span style={{ color: "#b67c7c", fontWeight: 500 }}>· {mf.tipo}</span>
                </span>
                <span style={{ fontSize: 12, color: "#b67c7c" }}>
                  ({Math.round(mf.x)}, {Math.round(mf.y)})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CANVAS */}
        <Stage
          ref={stageRef}
          width={1000}
          height={1000}
          draggable
          scaleX={scale}
          scaleY={scale}
          x={stagePos.x}
          y={stagePos.y}
          onWheel={handleWheel}
          style={{
            border: "2px solid #e6ebf1",
            background: "#f9fbfd",
            margin: 0,
            borderRadius: 12,
            boxShadow: "0 4px 16px #1976d208"
          }}
        >
          <Layer>
            {planoActivo && image && (
              <KonvaImage image={image} width={1000} height={1000} />
            )}
            {equiposFiltrados.map(eq => (
              <EquipoPin
                key={`${eq.tipo}-${eq.id}`}
                eq={eq}
                onDragEnd={handlePinDrag}
                onPinClick={(tipo, id) => {
                  setEquipoActivo(eq);
                  setShowForm(false);
                  setPopupId(null);
                }}
                editado={!!equiposEditados[eq.id]}
                isSelected={equipoActivo?.tipo === eq.tipo && equipoActivo?.id === eq.id}
              />
            ))}
            {matafuegosFiltrados.map(mf => (
              <EquipoPin
                key={`${mf.tipo}-${mf.id}`}
                eq={mf}
                onDragEnd={handlePinDrag}
                onPinClick={(tipo, id) => {
                  setEquipoActivo(mf);
                  setShowForm(false);
                  setPopupId(null);
                }}
                editado={!!matafuegoEditado[mf.id]}
                isSelected={equipoActivo?.tipo === mf.tipo && equipoActivo?.id === mf.id}
              />
            ))}
            {refrigeracionFiltrada.map(rf => (
              <EquipoPin
                key={`${rf.tipo}-${rf.id}`}
                eq={rf}
                onDragEnd={handlePinDrag}
                onPinClick={(tipo, id) => {
                  setEquipoActivo(rf);
                  setShowForm(false);
                  setPopupId(null);
                }}
                editado={!!refrigeracionEditada[rf.id]}
                isSelected={equipoActivo?.tipo === rf.tipo && equipoActivo?.id === rf.id}
              />
            ))}
            {upsFiltrada.map(up => (
              <EquipoPin
                key={`${up.tipo}-${up.id}`}
                eq={up}
                onDragEnd={handlePinDrag}
                onPinClick={(tipo, id) => {
                  setEquipoActivo(up);
                  setShowForm(false);
                  setPopupId(null);
                }}
                editado={!!upsEditada[up.id]}
                isSelected={equipoActivo?.tipo === up.tipo && equipoActivo?.id === up.id}
              />
            ))}
          </Layer>
        </Stage>

        {equipoActivo && (
          <PanelEquipo
            equipo={equipoActivo}
            onCerrar={() => setEquipoActivo(null)}
            onEditar={() => {
              setEditEquipo(equipoActivo);
              setShowForm(true);
              setEquipoActivo(null);
            }}
            onConectar={() => {
              const tipo = equipoActivo?.tipo?.toLowerCase();

              // 🔹 Si es PC, abrir VNC
              if (tipo === "pc" && equipoActivo?.ip) {
                setVncParams({ ip: equipoActivo.ip, port: equipoActivo.vnc_port || 5900 });
                setVncOpen(true);
                return;
              }

              // 🔹 Si es impresora, abrir modal con iframe
              if (tipo === "impresora" && equipoActivo?.ip) {
                setPrinterIp(equipoActivo.ip); // estado que maneja la IP
                setPrinterOpen(true);          // abre modal impresora
                return;
              }
            }}
          />
        )}

      </div>


      {/* Formulario modal para alta/edición */}
      {showForm && (
        <FormEquipo
          equipo={editEquipo}
          planoId={planoActivo?.id}
          ubicaciones={salas}
          onGuardar={guardarEquipo}
          onCancelar={() => setShowForm(false)}
        />
      )}
      {/* Sección DEPÓSITO */}
      <div style={{
        margin: "48px auto 0 auto",
        background: "#f9fbfd",
        borderRadius: 16,
        boxShadow: "0 2px 8px #0001",
        padding: 30,
        maxWidth: 900,
      }}>
        <h2 style={{
          color: "#e53935",
          fontWeight: 700,
          fontSize: 26,
          marginBottom: 20,
          letterSpacing: 0.5
        }}>
          DEPÓSITO
        </h2>
        {equiposDeposito.length === 0 ? (
          <div style={{ color: "#999", fontSize: 18, marginTop: 20 }}>No hay equipos en depósito</div>
        ) : (
          <table style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 17
          }}>
            <thead>
              <tr style={{ background: "#f6e7e7" }}>
                <th style={{ padding: "10px 8px", borderBottom: "1.5px solid #eee", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "10px 8px", borderBottom: "1.5px solid #eee", textAlign: "left" }}>Tipo</th>
                <th style={{ padding: "10px 8px", borderBottom: "1.5px solid #eee", textAlign: "left" }}>Modelo</th>
                <th style={{ padding: "10px 8px", borderBottom: "1.5px solid #eee", textAlign: "left" }}>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {equiposDeposito.map(eq => (
                <tr key={eq.id}>
                  <td style={{ padding: "8px 6px" }}>{eq.nombre}</td>
                  <td style={{ padding: "8px 6px" }}>{eq.tipo}</td>
                  <td style={{ padding: "8px 6px" }}>{eq.modelo}</td>
                  <td style={{ padding: "8px 6px" }}>{eq.estado || "-"}</td>
                  <td>
                    <button
                      onClick={() => {
                        setEditEquipo(eq);
                        setShowForm(true);
                      }}
                      style={{
                        background: "#1976d2",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 14,
                        cursor: "pointer",
                        fontWeight: 600
                      }}
                    >
                      Editar
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <VncQuickModal
        isOpen={vncOpen}
        onClose={() => setVncOpen(false)}
        host={vncParams.ip}
        port={vncParams.port}
        bridgeUrl={BRIDGE}
      />
    </div>

  )
}













