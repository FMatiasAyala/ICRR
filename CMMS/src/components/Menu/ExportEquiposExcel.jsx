// src/components/ExportEquiposExcel.jsx
import React, { useState } from 'react';
import {
    Box, Button, Checkbox, FormControlLabel, FormGroup, Typography,
    Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import * as XLSX from 'xlsx';
import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const camposDisponibles = [
    { key: 'id', label: 'ID' },
    { key: 'modelo', label: 'Modelo' },
    { key: 'marca', label: 'Marca' },
    { key: 'serial_number', label: 'Numero de serie' },
    { key: 'ip', label: 'IP' },
    { key: 'mascara', label: 'Mascara' },
    { key: 'gateway', label: 'Gateway' },
    { key: 'puerto', label: 'Puerto' },
    { key: 'compra_año', label: 'Año de compra' },
    { key: 'fabricacion_año', label: 'Año de fabricacion' },
    { key: 'alta', label: 'Fecha de alta' },
    { key: 'nombre_servicio', label: 'Servicio' },
    { key: 'siglas_servicio', label: 'Siglas servicio' },
    { key: 'sala', label: 'Sala' },
];

const ExportEquiposExcel = ({ open, onClose, salas }) => {
    const { state: { equipos } } = useWebSocketContext();
    const [camposSeleccionados, setCamposSeleccionados] = useState(camposDisponibles.map(c => c.key));

    const toggleCampo = (key) => {
        setCamposSeleccionados(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const obtenerSala = (id) => {
        const sala = salas.find((e) => e.id_ubicacion === id)
        return sala.sala
    }

    const handleExportar = () => {
        const dataFiltrada = equipos.map(eq => {
            const obj = {};
            camposSeleccionados.forEach(campo => {
                if (campo === 'sala') {
                    obj[campo] = obtenerSala(eq.id_ubicacion);
                } else {
                    obj[campo] = eq[campo];
                }
            });
            return obj;
        });


        const ws = XLSX.utils.json_to_sheet(dataFiltrada);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Equipos');
        XLSX.writeFile(wb, 'equipos_ICRR.xlsx');

        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <span>Exportar Equipos a Excel</span>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" mb={2}>
                    Seleccioná los campos que querés incluir en el archivo.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <FormGroup>
                    {camposDisponibles.map(({ key, label }) => (
                        <FormControlLabel
                            key={key}
                            control={
                                <Checkbox
                                    checked={camposSeleccionados.includes(key)}
                                    onChange={() => toggleCampo(key)}
                                />
                            }
                            label={label}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleExportar}
                    disabled={camposSeleccionados.length === 0}
                >
                    Descargar Excel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExportEquiposExcel;
