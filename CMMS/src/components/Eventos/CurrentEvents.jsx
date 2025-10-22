import React, { useState, useMemo } from "react";
import {
    Box, Typography, Card, CardContent, Grid, CardHeader, Collapse, Divider, IconButton, Modal, FormControl, InputLabel, Select, MenuItem, Chip, Stack, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { differenceInMinutes } from "date-fns";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditNote } from "@mui/icons-material";
import { styled } from '@mui/material/styles'
import FormEventoModal from "./FormEventoModal";
import FileDownloadButton from "../hooks/FileDownloadButton";
import { apiAdjuntos } from "../utils/Fetch";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CircularProgress from '@mui/material/CircularProgress';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import { useWebSocketContext } from "../WebSocket/useWebSocketContext";
import FormEditEvento from "./FormEditEvet";

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest,
    }),
}));

// === Helpers KPI (nuevo) ===
const formatDuration = (mins) => {
    const d = Math.floor(mins / 1440);
    const h = Math.floor((mins % 1440) / 60);
    const m = mins % 60;
    return `${d}d ${h}h ${m}m`;
};

// Minutos de superposición entre [a1,a2) y [b1,b2)
const overlapMins = (a1, a2, b1, b2) => {
    const start = new Date(Math.max(+a1, +b1));
    const end = new Date(Math.min(+a2, +b2));
    const ms = end - start;
    return ms > 0 ? Math.floor(ms / 60000) : 0;
};

/**
 * estados esperados: "OPERATIVO" | "NO OPERATIVO" | "REVISION"
 * evento: { estado, desde, hasta? }
 * opts: { ventanaDesde?: Date, ventanaHasta?: Date }
 */
const calcularIndicadores = (eventos, opts = {}) => {
    if (!Array.isArray(eventos) || !eventos.length) {
        return {
            total: 0,
            porEstado: { OPERATIVO: 0, "NO OPERATIVO": 0, REVISION: 0, OTRO: 0 },
            disponibilidadIncluyeRevision: 0,
            disponibilidadSoloOperativo: 0,
            promedioNoOperativo: 0,
            promedioOperativo: 0,
            promedioRevision: 0,
            mttr: 0,
            mtbf: 0,
            ratioUptimeDowntime: Infinity,
            cantidadFallas: 0,
            legible: {
                total: "0d 0h 0m",
                operativo: "0d 0h 0m",
                no_operativo: "0d 0h 0m",
                revision: "0d 0h 0m",
                promedioNoOperativo: "0d 0h 0m",
                promedioOperativo: "0d 0h 0m",
                promedioRevision: "0d 0h 0m",
                mttr: "0d 0h 0m",
                mtbf: "0d 0h 0m",
                disponibilidadIncluyeRevision: "0.00%",
                disponibilidadSoloOperativo: "0.00%",
            },
        };
    }

    const ventanaDesde =
        opts.ventanaDesde ?? new Date(Math.min(...eventos.map(e => +new Date(e.desde))));
    const ventanaHasta = opts.ventanaHasta ?? new Date();

    const norm = (s) => (s || "").toString().trim().toUpperCase();

    const totales = { OPERATIVO: 0, "NO OPERATIVO": 0, REVISION: 0, OTRO: 0 };
    const duraciones = { OPERATIVO: [], "NO OPERATIVO": [], REVISION: [], OTRO: [] };
    const segmentos = []; // para MTBF

    for (const e of eventos) {
        const estado = ["OPERATIVO", "NO OPERATIVO", "REVISION"].includes(norm(e.estado))
            ? norm(e.estado)
            : "OTRO";
        const desde = new Date(e.desde);
        const hasta = e.hasta ? new Date(e.hasta) : new Date();

        const mins = overlapMins(desde, hasta, ventanaDesde, ventanaHasta);
        if (mins <= 0) continue;

        const clipDesde = new Date(Math.max(+desde, +ventanaDesde));
        const clipHasta = new Date(Math.min(+hasta, +ventanaHasta));

        totales[estado] += mins;
        duraciones[estado].push(mins);
        segmentos.push({ estado, desde: clipDesde, hasta: clipHasta });
    }

    // Orden por tiempo para cálculos entre fallas
    segmentos.sort((a, b) => +a.desde - +b.desde);

    const totalMins = Object.values(totales).reduce((a, b) => a + b, 0) || 0;
    const prom = (arr) => (arr.length ? Math.floor(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

    const promedioNoOperativo = prom(duraciones["NO OPERATIVO"]);
    const promedioOperativo = prom(duraciones["OPERATIVO"]);
    const promedioRevision = prom(duraciones["REVISION"]);

    const uptimeMins = totales["OPERATIVO"] + totales["REVISION"];
    const disponibilidadIncluyeRevision = totalMins ? uptimeMins / totalMins : 0;
    const disponibilidadSoloOperativo = totalMins ? totales["OPERATIVO"] / totalMins : 0;

    // MTTR = promedio de duración de fallas (NO OPERATIVO)
    const mttr = promedioNoOperativo;

    // MTBF = promedio de uptime entre fallas consecutivas
    const fallas = segmentos.filter(s => s.estado === "NO OPERATIVO");
    const uptimesEntreFallas = [];
    for (let i = 0; i < fallas.length - 1; i++) {
        const finFallaActual = fallas[i].hasta;
        const inicioFallaSgte = fallas[i + 1].desde;
        if (+inicioFallaSgte <= +finFallaActual) continue;

        // sumo solo segmentos de uptime entre ambas fallas
        const minsUptime = segmentos.reduce((acc, s) => {
            if (s.estado !== "OPERATIVO" && s.estado !== "REVISION") return acc;
            return acc + overlapMins(s.desde, s.hasta, finFallaActual, inicioFallaSgte);
        }, 0);
        uptimesEntreFallas.push(minsUptime);
    }
    const mtbf = uptimesEntreFallas.length
        ? Math.floor(uptimesEntreFallas.reduce((a, b) => a + b, 0) / uptimesEntreFallas.length)
        : 0;

    return {
        total: totalMins,
        porEstado: totales, // mins por estado
        disponibilidadIncluyeRevision, // 0..1
        disponibilidadSoloOperativo,   // 0..1
        promedioNoOperativo,           // mins
        promedioOperativo,             // mins
        promedioRevision,              // mins
        mttr,                          // mins
        mtbf,                          // mins         
        cantidadFallas: fallas.length,
        legible: {
            total: formatDuration(totalMins),
            operativo: formatDuration(totales["OPERATIVO"]),
            no_operativo: formatDuration(totales["NO OPERATIVO"]),
            revision: formatDuration(totales["REVISION"]),
            promedioNoOperativo: formatDuration(promedioNoOperativo),
            promedioOperativo: formatDuration(promedioOperativo),
            promedioRevision: formatDuration(promedioRevision),
            mttr: formatDuration(mttr),
            mtbf: formatDuration(mtbf),
            disponibilidadIncluyeRevision: `${(disponibilidadIncluyeRevision * 100).toFixed(2)}%`,
            disponibilidadSoloOperativo: `${(disponibilidadSoloOperativo * 100).toFixed(2)}%`,
        },
    };
};

// === Fin helpers KPI ===


const CurrentEvents = ({ equipo, salas }) => {
    const { state: { eventosFiltrados: eventos } } = useWebSocketContext();
    const [expandedId, setExpandedId] = useState(null);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [modalAbierta, setModalAbierta] = useState(false);
    const [loadingFormulario, setLoadingFormulario] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [ordenFecha, setOrdenFecha] = useState('desc');
    // KPIs calculados a partir de todos los eventos visibles en el contexto
    const indicadores = useMemo(() => calcularIndicadores(eventos), [eventos]);

    const handleEditarEvento = (evento) => {
        setLoadingFormulario(true);
        setModalAbierta(true);
        setTimeout(() => {
            setEventoSeleccionado(evento);
            setLoadingFormulario(false);
        }, 300); // Simula tiempo de carga, puedes ajustar
    };

    const handleCerrarModal = () => {
        setEventoSeleccionado(null);
        setModalAbierta(false);
    };

    const handleExpandClick = (id) => {
        setExpandedId(prev => (prev === id ? null : id));
    };

    const obtenerColorEstado = (estado) => {
        switch (estado) {
            case 'OPERATIVO':
            case 'REALIZADO':
                return { bgColor: '#c8e6c9', borderColor: '#43a047', textColor: '#2e7d32' };
            case 'NO OPERATIVO':
            case 'PROGRAMADO':
                return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' };
            case 'REVISION':
                return {
                    bgColor: '#fff9c4', borderColor: '#fbc02d', textColor: '#f57f17'
                };
            default:
                return { bgColor: '#e0e0e0', borderColor: '#757575', textColor: '#424242' };
        }
    };

    const calcularTiempo = (evento) => {
        const fechaDesde = new Date(evento.desde);
        const fechaHasta = evento.hasta ? new Date(evento.hasta) : new Date();
        const diffMins = differenceInMinutes(fechaHasta, fechaDesde);
        const dias = Math.floor(diffMins / 1440);
        const horas = Math.floor((diffMins % 1440) / 60);
        const minutos = diffMins % 60;
        return `${dias}d ${horas}h ${minutos}m${!evento.hasta ? " (en curso)" : ""}`;
    };
    const eventosFiltradosYOrdenados = eventos
        .filter((evento) =>
            filtroEstado === 'todos' ? true : evento.estado.toUpperCase() === filtroEstado
        )
        .sort((a, b) => {
            const fechaA = new Date(a.desde);
            const fechaB = new Date(b.desde);
            return ordenFecha === 'asc' ? fechaA - fechaB : fechaB - fechaA;
        });

    const repuestos = Array.isArray(eventos.repuestos)
        ? eventos.repuestos
        : (eventos.repuesto && eventos.repuesto !== 0 && eventos.repuesto !== '0'
            ? [{
                repuesto: eventos.repuesto,
                costo: eventos.costo,
                proveedor: eventos.proveedor,
                serial_number: eventos.serial_number,
                cobertura: eventos.cobertura,
            }]
            : []);

    const tieneRepuesto = repuestos.length > 0;
    return (
        <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#004d99' }}>
                Historial de Eventos
            </Typography>
            {/* RESUMEN KPI */}
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 4, overflow: 'hidden' }}>
                <CardHeader
                    title="Resumen de Estado / KPIs"
                    subheader={`Ventana: ${new Date(Math.min(...eventos.map(e => +new Date(e.desde)))).toLocaleDateString('es-AR')} → ${new Date().toLocaleDateString('es-AR')}`}
                    sx={{ bgcolor: '#f7f9fc', borderBottom: '1px solid #e5eaf2', py: 1.5 }}
                />
                <CardContent>
                    <Grid container spacing={2}>
                        {/* Disponibilidad (incluye revisión) */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                Disponibilidad (incluye revisión)
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.disponibilidadIncluyeRevision}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Operativo + Revisión / Total
                            </Typography>
                        </Grid>

                        {/* Disponibilidad solo operativo */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                Disponibilidad (solo operativo)
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.disponibilidadSoloOperativo}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Sólo Operativo / Total
                            </Typography>
                        </Grid>

                        {/* MTTR */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                MTTR
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.mttr}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Promedio de NO OPERATIVO
                            </Typography>
                        </Grid>

                        {/* MTBF (nuevo) */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                MTBF
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.mtbf}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Uptime promedio entre fallas
                            </Typography>
                        </Grid>

                        {/* Promedios por estado */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                Prom. Operativo
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.promedioOperativo}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Promedio por evento operativo
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                Prom. Revisión
                            </Typography>
                            <Typography variant="h6">{indicadores.legible.promedioRevision}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Operativo con observación
                            </Typography>
                        </Grid>
                        {/* Cantidad de fallas (badge) */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Typography variant="overline" sx={{ color: '#607d8b' }}>
                                Fallas registradas
                            </Typography>
                            <Typography variant="h6">
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: '#ffe0e0',
                                        color: '#b71c1c',
                                        border: '1px solid #ffcdd2',
                                        borderRadius: 8,
                                        padding: '2px 10px',
                                        fontWeight: 700,
                                        fontSize: 16,
                                        lineHeight: 1.6
                                    }}
                                >
                                    {indicadores.cantidadFallas ?? 0}
                                </span>
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Eventos NO OPERATIVO en la ventana
                            </Typography>
                        </Grid>

                        {/* Totales */}
                        <Grid item xs={12}>
                            <Divider sx={{ my: 1 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Total ventana
                                    </Typography>
                                    <Typography variant="body2">{indicadores.legible.total}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Tiempo Operativo
                                    </Typography>
                                    <Typography variant="body2">{indicadores.legible.operativo}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Tiempo No Operativo
                                    </Typography>
                                    <Typography variant="body2">{indicadores.legible.no_operativo}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        Tiempo Revisión
                                    </Typography>
                                    <Typography variant="body2">{indicadores.legible.revision}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Box sx={{ display: "flex" }}>
                <FormEventoModal equipo={equipo} salas={salas} handleCerrarModal={handleCerrarModal} />
            </Box>
            <Box display="flex" gap={2} mb={3} alignItems="center">
                <FormControl size="small">
                    <InputLabel>Estado</InputLabel>
                    <Select
                        value={filtroEstado}
                        label="Estado"
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <MenuItem value="todos">Todos</MenuItem>
                        <MenuItem value="OPERATIVO">Operativo</MenuItem>
                        <MenuItem value="NO OPERATIVO">No Operativo</MenuItem>
                        <MenuItem value="REVISION">Revisión</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small">
                    <InputLabel>Orden</InputLabel>
                    <Select
                        value={ordenFecha}
                        label="Orden"
                        onChange={(e) => setOrdenFecha(e.target.value)}
                    >
                        <MenuItem value="desc">Más reciente primero</MenuItem>
                        <MenuItem value="asc">Más antiguo primero</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Grid container spacing={2}>
                {eventos.length === 0 ? (
                    <Grid item xs={12}>
                        <Typography align="center" color="text.secondary">
                            No hay eventos disponibles.
                        </Typography>
                    </Grid>
                ) : (
                    eventosFiltradosYOrdenados.map((evento) => {
                        const { bgColor, borderColor, textColor } = obtenerColorEstado(evento.estado);
                        const isExpanded = expandedId === evento.id_evento;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={evento.id_evento}>
                                <Card
                                    sx={{
                                        boxShadow: 4,
                                        borderRadius: 3,
                                        border: `2px solid ${borderColor}`,
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                    <CardHeader
                                        title={
                                            <Typography variant="h6" sx={{ fontWeight: 600, color: textColor }}>
                                                {evento.estado.toUpperCase()}
                                            </Typography>
                                        }
                                        subheader={
                                            <Typography variant="subtitle2">
                                                {new Date(evento.desde).toLocaleDateString('es-AR')}
                                            </Typography>
                                        }
                                        sx={{
                                            backgroundColor: bgColor,
                                            borderBottom: `2px solid ${borderColor}`,
                                            py: 1.5,
                                        }}
                                        action={
                                            <ExpandMore
                                                expand={isExpanded ? 1 : 0}
                                                onClick={() => handleExpandClick(evento.id_evento)}
                                                aria-expanded={isExpanded}
                                                aria-label="mostrar más"
                                            >
                                                <ExpandMoreIcon sx={{ color: textColor }} />
                                            </ExpandMore>
                                        }
                                    />

                                    <CardContent sx={{ pb: 1 }}>
                                        <Box display="flex" alignItems="center" mb={1}>
                                            <EditNote sx={{ mr: 1, color: '#1976d2' }} />
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 500, cursor: 'pointer' }}
                                                onClick={() => handleEditarEvento(evento)}
                                                color="primary"
                                            >
                                                Editar evento
                                            </Typography>
                                        </Box>

                                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                            Tipo de Falla
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            {(evento.tipo_falla || 'No especificado').toUpperCase()}
                                        </Typography>

                                        <Typography variant="subtitle2" fontWeight="bold">
                                            Descripción
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {evento.descripcion || 'Sin descripción'}
                                        </Typography>

                                        {(() => {
                                            const repuestos = Array.isArray(evento.repuestos)
                                                ? evento.repuestos
                                                : (evento.repuesto && evento.repuesto !== 0 && evento.repuesto !== '0'
                                                    ? [{
                                                        repuesto: evento.repuesto,
                                                        costo: evento.costo,
                                                        proveedor: evento.proveedor,
                                                        serial_number: evento.serial_number,
                                                        cobertura: evento.cobertura,
                                                    }]
                                                    : []);

                                            const tieneRepuesto = repuestos.length > 0;

                                            return (
                                                <>
                                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                        Repuestos
                                                    </Typography>

                                                    <Stack direction="row" spacing={1} mb={tieneRepuesto ? 1 : 2}>
                                                        <Chip
                                                            label={tieneRepuesto ? `Cambio de pieza (${repuestos.length})` : 'Sin cambio de pieza'}
                                                            color={tieneRepuesto ? 'success' : 'default'}
                                                            size="small"
                                                            variant={tieneRepuesto ? 'filled' : 'outlined'}
                                                        />
                                                    </Stack>

                                                    {tieneRepuesto && (
                                                        <List dense sx={{ mt: -0.5, mb: 1, pt: 0, pb: 0 }}>
                                                            {repuestos.map((r, i) => {
                                                                const titulo = r?.repuesto.toUpperCase() || r?.nombre || r?.descripcion || `Repuesto ${i + 1}`;
                                                                const secundario = [
                                                                    r?.serial_number ? `SN: ${r.serial_number}` : null,
                                                                    r?.proveedor ? `Prov: ${r.proveedor}` : null,
                                                                    (r?.cobertura ? `Cobertura: ${r.cobertura}` : null),
                                                                    (r?.costo !== undefined && r?.costo !== null) ? `Costo: $${Number(r.costo).toLocaleString('es-AR')}` : null,
                                                                ].filter(Boolean).join(' • ');

                                                                return (
                                                                    <ListItem key={i} disableGutters sx={{ py: 0.25 }}>
                                                                        <ListItemIcon sx={{ minWidth: 34 }}>
                                                                            <Inventory2RoundedIcon fontSize="small" sx={{ color: '#1976d2' }} />
                                                                        </ListItemIcon>
                                                                        <ListItemText
                                                                            primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                                            primary={titulo}
                                                                            secondary={secundario || null}
                                                                        />
                                                                    </ListItem>
                                                                );
                                                            })}
                                                        </List>
                                                    )}
                                                </>
                                            );
                                        })()}

                                        <Divider sx={{ my: 1 }} />

                                       {evento.tiene_adjuntos && (<FileDownloadButton
                                            endpoint={apiAdjuntos}
                                            params={{ id_evento: evento.id_evento }}
                                            icono={<CloudDownloadIcon />}
                                            label="Descargar adjunto"
                                        />)}
                                    </CardContent>

                                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                        <CardContent
                                            sx={{
                                                bgcolor: '#f5f5f5',
                                                borderTop: `1px dashed ${borderColor}`,
                                                mt: 1,
                                            }}
                                        >
                                            <Typography variant="subtitle2" fontWeight="bold">
                                                Tiempo en este estado
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {evento.desde ? calcularTiempo(evento) : 'Sin datos'}
                                            </Typography>
                                        </CardContent>
                                    </Collapse>
                                </Card>
                            </Grid>
                        );
                    })
                )}
            </Grid>


            {/* MODAL CON FORMULARIO */}
            <Modal
                open={modalAbierta}
                onClose={handleCerrarModal}
                aria-labelledby="modal-edit-evento"
                aria-describedby="modal-edit-evento-description"
            >
                {loadingFormulario || !eventoSeleccionado ? (
                    <Box sx={{ textAlign: 'center', backgroundColor: "#ffffff", position: "absolute", mt: '10%', ml: '50%', borderRadius: ' 10px' }}>
                        <CircularProgress />
                        <Typography sx={{ mt: 2 }}>Cargando formulario...</Typography>
                    </Box>
                ) : (
                    <>
                        <FormEditEvento evento={eventoSeleccionado} onClose={handleCerrarModal} />
                    </>
                )}
            </Modal>
        </Box>
    );
};

export default CurrentEvents;



