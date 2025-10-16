import React, { useState, useEffect } from "react";

const CAMPOS_POR_TIPO = {
    pc: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "modelo", label: "Modelo", type: "text" },
        { name: "mac", label: "MAC", type: "text" },
        { name: "sistema_operativo", label: "S.O", type: "text" },
        { name: "procesador", label: "Procesador", type: "text" },
        { name: "memoria_ram", label: "Memoria RAM", type: "text" },
        { name: "disco_duro", label: "Almacenamiento", type: "text" },
        { name: "licencia_windows", label: "Licencia Windows", type: "text" },
        { name: "antivirus", label: "Antivirus", type: "text" },
        { name: "ip", label: "IP", type: "text" },
        { name: "usuario_asignado", label: "Usuario", type: "text" },
        { name: "descripcion", label: "Descripcion", type: "text" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" }
    ],
    impresora: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "modelo", label: "Modelo", type: "text" },
        { name: "marca", label: "Marca", type: "text" },
        { name: "ip", label: "IP", type: "text" },
        { name: "mac", label: "MAC", type: "text" },
        { name: "tipo_toner", label: "Toner", type: "text" },
        { name: "descripcion", label: "Descripcion", type: "text" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" }
    ],
    switch: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "modelo", label: "Modelo", type: "text" },
        { name: "ip", label: "IP", type: "text" },
        { name: "cantidad_puertos", label: "Cantidad de Puertos", type: "number" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" }
    ],
    matafuego: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "tipo_matafuego", label: "Agente Extintor", type: "text" },
        { name: "capacidad_kg", label: "Capacidad (kg)", type: "number" },
        { name: "fecha_ultima_recarga", label: "Última Recarga", type: "date" },
        { name: "fecha_proxima_recarga", label: "Próxima Recarga", type: "date" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" },
    ],
    aire_acondicionado: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "marca", label: "Marca", type: "text" },
        { name: "modelo", label: "Modelo", type: "text" },
        { name: "potencia_frio_kw", label: "Potencia Frio", type: "number" },
        { name: "potencia_calor_kw", label: "Potencia Calor", type: "number" },
        { name: "tipo_gas", label: "Tipo gas", type: "text" },
        { name: "estado", label: "Estado", type: "text" },
        { name: "observaciones", label: "Observacion", type: "text" },
        { name: "fecha_ultimo_mantenimiento", label: "Última mantenimiento", type: "date" },
        { name: "fecha_proximo_mantenimiento", label: "Próxima mantenimiento", type: "date" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" },
    ],
    ups: [
        { name: "nombre", label: "Nombre", type: "text" },
        { name: "marca", label: "Marca", type: "text" },
        { name: "modelo", label: "Modelo", type: "text" },
        { name: "capacidad_va", label: "Capacidad KVA", type: "number" },
        { name: "autonomia_min", label: " Autonomia", type: "number" },
        { name: "estado", label: "Estado", type: "text" },
        { name: "x", label: "Posición X", type: "number" },
        { name: "y", label: "Posición Y", type: "number" },
    ]
};


const FormEquipo = ({ equipo, planoId, onGuardar, onCancelar, ubicaciones }) => {
    const [form, setForm] = useState({
        ...equipo,
        tipo: equipo?.tipo || "pc",
        id_plano: equipo?.id_plano || planoId,
        ubicacion_id: equipo?.ubicacion_id || ''
    });


    useEffect(() => {
        const camposValidos = CAMPOS_POR_TIPO[form.tipo]?.map(c => c.name) || [];
        const nuevoForm = Object.keys(form)
            .filter(key => camposValidos.includes(key) || ["tipo", "id", "id_plano", "ubicacion_id"].includes(key))
            .reduce((acc, key) => {
                acc[key] = form[key];
                return acc;
            }, {});
        setForm(nuevoForm);
    }, [form.tipo]);


    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNumber = (e) => {
        setForm({ ...form, [e.target.name]: Number(e.target.value) });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onGuardar({ ...form, id_plano: planoId });
    };

    const camposGenerales = CAMPOS_POR_TIPO[form.tipo] || [];

    const inputStyle = {
        border: "1.5px solid #dce3ec",
        borderRadius: 10,
        padding: "10px 12px",
        fontSize: 15,
        background: "#f9fbfd",
        marginTop: 4,
        outline: "none",
        transition: "border-color 0.2s",
    };

    const labelStyle = {
        fontWeight: 600,
        color: "#37474f",
        fontSize: 15,
        marginBottom: 4
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 70,
                left: "50%",
                transform: "translateX(-50%)",
                background: "#ffffff",
                borderRadius: 18,
                padding: "36px 46px 32px 46px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                minWidth: 400,
                maxWidth: "95vw",
                zIndex: 9999,
                maxHeight: "80vh",      // límite de altura
                overflowY: "auto",      // scroll vertical
            }}
        >
            <h2 style={{
                fontFamily: "Segoe UI, Roboto, sans-serif",
                fontWeight: 700,
                fontSize: 22,
                color: "#1976d2",
                textAlign: "center",
                marginBottom: 28,
                marginTop: 0
            }}>
                {form.id ? "Editar equipo" : "Nuevo equipo"}
            </h2>

            <form onSubmit={handleSubmit} style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 18
            }}>

                {/* Tipo de equipo */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <label style={labelStyle}>Tipo de equipo</label>
                    <select
                        name="tipo"
                        value={form.tipo}
                        onChange={handleChange}
                        style={{ ...inputStyle, fontWeight: 500 }}
                    >
                        <option value="pc">PC</option>
                        <option value="impresora">Impresora</option>
                        <option value="switch">Switch</option>
                        <option value="matafuego">Matafuego</option>
                        <option value="aire_acondicionado">Aire Acondicionado</option>
                        <option value="ups">UPS</option>
                    </select>
                </div>

                {/* Ubicación */}
                {ubicaciones.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <label style={labelStyle}>Ubicación</label>
                        <select
                            name="ubicacion_id"
                            value={form.ubicacion_id}
                            onChange={handleChange}
                            style={{ ...inputStyle, fontWeight: 500 }}
                            required
                        >
                            <option value="">Seleccionar ubicación</option>
                            {ubicaciones.map(ub => (
                                <option key={ub.id_ubicacion} value={ub.id_ubicacion}>{ub.sala}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Campos dinámicos */}
                {camposGenerales.map((campo) => (
                    <div key={campo.name} style={{ display: "flex", flexDirection: "column" }}>
                        <label style={labelStyle}>{campo.label}</label>
                        <input
                            name={campo.name}
                            type={campo.type}
                            value={form[campo.name] || ""}
                            onChange={campo.type === "number" ? handleNumber : handleChange}
                            placeholder={campo.label}
                            style={inputStyle}
                            onFocus={e => e.target.style.border = "1.5px solid #1976d2"}
                            onBlur={e => e.target.style.border = "1.5px solid #dce3ec"}
                        />
                    </div>
                ))}

                {/* Botones */}
                <div style={{
                    gridColumn: "1 / -1",
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    marginTop: 28
                }}>
                    <button
                        type="submit"
                        style={{
                            background: "linear-gradient(90deg, #1976d2 60%, #43a047)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 10,
                            padding: "10px 28px",
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 10px #43a04755",
                        }}
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={onCancelar}
                        style={{
                            background: "#fff",
                            color: "#1976d2",
                            border: "1.5px solid #1976d2",
                            borderRadius: 10,
                            padding: "10px 24px",
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: "pointer",
                            boxShadow: "0 2px 6px #1976d233",
                        }}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormEquipo;