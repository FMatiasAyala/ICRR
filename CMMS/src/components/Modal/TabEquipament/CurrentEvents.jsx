import React, { useState } from "react";
import {
    Box, Typography, Card, CardContent, Grid, CardHeader, Collapse, Divider, IconButton, Modal, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { differenceInMinutes } from "date-fns";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EditNote } from "@mui/icons-material";
import { styled } from '@mui/material/styles'
import FormEventoModal from "../FormEventoModal";
import FileDownloadButton from "../../hooks/FileDownloadButton";
import { apiAdjuntos } from "../../utils/Fetch";
import FormEditEvento from "../../Equipos/FormEditEvento";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CircularProgress from '@mui/material/CircularProgress';
import { useWebSocketContext } from "../../hooks/useWebSocketContext";

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


const CurrentEvents = ({ equipo, salas }) => {
    const { state: { eventosFiltrados: eventos } } = useWebSocketContext();
    const [expandedId, setExpandedId] = useState(null);
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [modalAbierta, setModalAbierta] = useState(false);
    const [loadingFormulario, setLoadingFormulario] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState('todos');
    const [ordenFecha, setOrdenFecha] = useState('desc');


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


    return (
        <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#004d99' }}>
                Historial de Eventos
            </Typography>

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
                        <MenuItem value="PROGRAMADO">Programado</MenuItem>
                        <MenuItem value="REALIZADO">Realizado</MenuItem>
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

                                        <Divider sx={{ my: 1 }} />

                                        <FileDownloadButton
                                            endpoint={apiAdjuntos}
                                            params={{ id_evento: evento.id_evento }}
                                            icono={<CloudDownloadIcon />}
                                            label="Descargar adjunto"
                                        />
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



