export default function PanelEquipo({ equipo, onCerrar, onEditar, onConectar }) {
  const esPC = equipo?.tipo?.toLowerCase?.() === 'pc';
  const esImpresora = equipo?.tipo?.toLowerCase() === "impresora";
  const tieneIP = !!equipo?.ip;

  return (
    <div style={{
      position: "fixed",
      top: 150,
      right: 60,
      width: 330,
      background: "#fff",
      borderRadius: 16,
      boxShadow: "0 8px 32px #1976d211, 0 2px 8px #1976d231",
      border: "1.5px solid #e0e6ef",
      padding: "28px 30px 18px 28px",
      zIndex: 9998,
      minHeight: 170,
      display: "flex",
      flexDirection: "column",
      gap: 7,
      animation: "fadeIn .28s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <h4 style={{ margin: 0, color: "#1976d2", fontWeight: 700, fontSize: 20 }}>
          {equipo.nombre}
        </h4>
        <button
          style={{
            background: "none", border: "none", color: "#999", fontSize: 22, cursor: "pointer"
          }}
          title="Cerrar"
          onClick={onCerrar}
        >✕</button>
      </div>
      <div
        style={{
          color: "#444",
          fontSize: 16,
          margin: "6px 0 14px 0",
          lineHeight: 1.6,
        }}
      >
        {equipo.tipo === "matafuego" ? (
          <>
            <b>Tipo:</b> {equipo.tipo}
            <br />
            <b>Agente:</b> {equipo.tipo_matafuego || "-"}
            <br />
            <b>Capacidad:</b> {equipo.capacidad_kg || "-"} kg
            <br />
            <b>Última recarga:</b>{" "}
            {equipo.fecha_ultima_recarga
              ? new Date(equipo.fecha_ultima_recarga).toLocaleDateString("es-AR")
              : "-"}
            <br />
            <b>Próxima recarga:</b>{" "}
            {equipo.fecha_proxima_recarga
              ? new Date(equipo.fecha_proxima_recarga).toLocaleDateString("es-AR")
              : "-"}
            <br />
          </>
        ) : equipo.tipo === "impresora" ? (
          <>
            <b>Tipo:</b> {equipo.tipo}
            <br />
            <b>Modelo:</b> {equipo.modelo || "-"}
            <br />
            <b>Tóner/Tinta:</b> {equipo.tipo_toner || "-"}
            <br />
            <b>IP:</b> {equipo.ip || "-"}
            <br />
          </>
        ) : equipo.tipo === "aire_acondicionado" ? (
          <>
            <b>Tipo:</b> {equipo.tipo}
            <br />
            <b>Marca:</b> {equipo.marca || "-"}
            <br />
            <b>Modelo:</b> {equipo.modelo || "-"}
            <br />
            <b>Capacidad frío:</b> {equipo.capacidad_frio || "-"} frigorías
            <br />
            <b>Estado:</b> {equipo.estado || "-"}
            <br />
          </>
        ) : equipo.tipo === "ups" ? (
          <>
            <b>Tipo:</b> {equipo.tipo}
            <br />
            <b>Modelo:</b> {equipo.marca || "-"}
            <br />
            <b>Usuario:</b> {equipo.capacidad_va || "-"} kva
            <br />
            <b>IP:</b> {equipo.nombre || "-"}
            <br />
          </>
        ) : (
          <>
            <b>Tipo:</b> {equipo.tipo}
            <br />
            <b>Modelo:</b> {equipo.modelo || "-"}
            <br />
            <b>Usuario:</b> {equipo.usuario_asignado || "-"}
            <br />
            <b>IP:</b> {equipo.ip || "-"}
            <br />
          </>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          marginTop: 8,
        }}
      >
        {/* 🔹 Botón para PC con VNC */}
        {esPC && (
          <button
            onClick={onConectar}
            disabled={!tieneIP}
            style={{
              background: "#1f6feb",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 14px",
              fontWeight: 600,
              cursor: tieneIP ? "pointer" : "not-allowed",
              opacity: tieneIP ? 1 : 0.6,
            }}
            title={tieneIP ? "Conectarme vía VNC" : "Sin IP"}
          >
            Conectarme
          </button>
        )}

        {/* 🔹 Botón para impresora con interfaz web */}
        {esImpresora && (
          <button
            onClick={() => {
              if (tieneIP) {
                window.open(`http://${equipo.ip}`, "_blank");
              }
            }}
            disabled={!tieneIP}
            style={{
              background: "#ff9800",
              color: "#fff",
              border: "none",
              borderRadius: 7,
              padding: "7px 14px",
              fontWeight: 600,
              cursor: tieneIP ? "pointer" : "not-allowed",
              opacity: tieneIP ? 1 : 0.6,
            }}
            title={tieneIP ? "Abrir interfaz web" : "Sin IP"}
          >
            Abrir interfaz
          </button>
        )}

        {/* 🔹 Botón para editar/mas detalles */}
        <button
          onClick={onEditar}
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "7px 20px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Mas detalles
        </button>
      </div>

    </div>

  );
}