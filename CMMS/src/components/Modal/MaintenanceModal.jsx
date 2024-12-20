import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { apiMantenimiento, apiMantenimientoPostpone } from '../../utils/Fetch';

const MaintenanceModal = ({ open, handleClose, equipos }) => {
  const [mantenimientos, setMantenimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPostponeForm, setShowPostponeForm] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState(null);
  const [newFecha, setNewFecha] = useState('');
  const [newHoraDesde, setNewHoraDesde] = useState('');
  const [newHoraHasta, setNewHoraHasta] = useState('');


  const obtenerMantenimientos = async () => {
    setLoading(true);
    try {
      const response = await fetch(apiMantenimiento);
      const data = await response.json();
      setMantenimientos(data);
    } catch (error) {
      console.error('Error al obtener los mantenimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    if (open) {
      obtenerMantenimientos();
    }
  }, [open]);

  const obtenerNombreEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.modelo : 'Equipo no encontrado';
  };

  const handleActualizarEstado = async (id_mantenimiento, nuevoEstado) => {
    try {
      const response = await fetch(`${apiMantenimiento}${id_mantenimiento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (response.ok) {
        setMantenimientos((prevMantenimientos) =>
          prevMantenimientos.map((mantenimiento) =>
            mantenimiento.id_mantenimiento === id_mantenimiento
              ? { ...mantenimiento, estado: nuevoEstado }
              : mantenimiento
          )
        );
        console.log('Mantenimiento actualizado');
      } else {
        console.error('Error al actualizar el mantenimiento:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const handleOpenPostponeForm = (mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setShowPostponeForm(true);
  };

  const handlePostpone = async () => {
    if (!selectedMantenimiento) return;

    try {
      const response = await fetch(`${apiMantenimientoPostpone}${selectedMantenimiento.id_mantenimiento}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estado: 'POSTERGADO',
          fecha: newFecha,
          desde: newHoraDesde,
          hasta: newHoraHasta,
        }),
      });

      if (response.ok) {
        setMantenimientos((prevMantenimientos) =>
          prevMantenimientos.map((mantenimiento) =>
            mantenimiento.id_mantenimiento === selectedMantenimiento.id_mantenimiento
              ? { ...mantenimiento, estado: 'POSTERGADO', nueva_fecha: newFecha }
              : mantenimiento
          )
        );
        setShowPostponeForm(false);
        setSelectedMantenimiento(null);
        console.log('Mantenimiento postergado');
      } else {
        console.error('Error al postergar el mantenimiento:', response.statusText);
      }
    } catch (error) {
      console.error('Error al realizar la solicitud:', error);
    }
  };

  const mantenimientosProgramados = mantenimientos.filter(
    (mantenimiento) => mantenimiento.estado === 'PROGRAMADO' || mantenimiento.estado === 'POSTERGADO'
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: showPostponeForm ? 800 : 600,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: '12px',
          display: 'flex',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Listado de Mantenimientos Programados
          </Typography>
          {loading ? (
            <Typography variant="body1" align="center">
              Cargando mantenimientos...
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Equipo
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Detalle
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Fecha
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Horario
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mantenimientosProgramados.length > 0 ? (
                  mantenimientosProgramados.map((mantenimiento) => (
                    <TableRow key={mantenimiento.id_mantenimiento}>
                      <TableCell align="center">{obtenerNombreEquipo(mantenimiento.id_equipo)}</TableCell>
                      <TableCell align="center">{mantenimiento.descripcion}</TableCell>
                      <TableCell align="center">{new Date(mantenimiento.fecha).toLocaleDateString()}</TableCell>
                      <TableCell align="center">{new Date(`2024-11-01T${mantenimiento.desde}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})} - {new Date(`2024-11-01T${mantenimiento.hasta}`).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleActualizarEstado(mantenimiento.id_mantenimiento, 'REALIZADO')}
                          color="primary"
                        >
                          <DoneIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleOpenPostponeForm(mantenimiento)}
                          color="secondary"
                        >
                          <ScheduleIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell align="center" colSpan={4}>
                      No hay mantenimientos programados disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Box>

        {showPostponeForm && (
          <Box sx={{ flex: 1, pl: 4 }}>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              Reprogramar Mantenimiento
            </Typography>

            <TextField
              label="Nueva Fecha"
              type="date"
              fullWidth
              value={newFecha}
              onChange={(e) => setNewFecha(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Hora Desde"
              type="time"
              fullWidth
              value={newHoraDesde}
              onChange={(e) => setNewHoraDesde(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Hora Hasta"
              type="time"
              fullWidth
              value={newHoraHasta}
              onChange={(e) => setNewHoraHasta(e.target.value)}
              sx={{ mb: 2 }}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button variant="contained" color="primary" fullWidth onClick={handlePostpone}>
              Guardar Cambios
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default MaintenanceModal;
