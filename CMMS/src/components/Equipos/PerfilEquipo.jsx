import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Grid,
  Divider,
  Box,
  Avatar,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  TextField,
  Snackbar,
  Alert,
  Button,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { Build, AssignmentInd, History, Event, Description, SaveAs, PowerOff, DesktopAccessDisabled } from '@mui/icons-material';
import { apiModificacionEquipo, apiTecnicosEquipo, apiEventosFiltrados, apiDatosContrato, apiModificacionTecnico, apiBajaEquipo, apiEventos } from '../utils/Fetch';
import { jwtDecode } from 'jwt-decode';
import CurrentMaintenance from '../Mantenimiento/CurrentMaintenance';
import CurrentEvents from '../Eventos/CurrentEvents';
import NewTechnician from '../Menu/NewTechnician';
import CurrentContrato from '../Contratos/CurrentContrato';
import ContratoFormModal from '../Contratos/ContratosFormModal';
import { useWebSocketContext } from '../WebSocket/useWebSocketContext';

const ProfileEquipament = ({ equipo, salas }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [tecnicosEquipo, setTecnicosEquipo] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [openContratoModal, setOpenContratoModal] = useState(false);
  const { state: { mantenimiento: mantenimientos }, dispatch, socketRef } = useWebSocketContext();
  const mantenimientoFiltrados = mantenimientos.filter((m) => m.id_equipo === equipo.id);

  const fecthDatosContrato = async () => {

    try {
      const response = await fetch(`${apiDatosContrato}?id_equipo=${equipo.id}`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
      const data = await response.json();
      setContratos(data);
    } catch (error) {
      console.error("Error al cargar los datos del contrato:", error);
    };
  }
  const fetchTecnicosEquipo = async () => {

    try {
      const response = await fetch(`${apiTecnicosEquipo}${equipo.id}`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
      const data = await response.json();
      setTecnicosEquipo(data);
    } catch (error) {
      console.error('Error al cargar los técnicos del equipo:', error);
    }
  }

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !equipo?.id) return;

    const handleTecnicoAsignado = (payload) => {
      if (payload.id_equipo === equipo.id) {
        setTecnicosEquipo((prev) => {
          const yaExiste = prev.some(
            (t) => t.id_tecnico === payload.tecnico.id_tecnico
          );
          return yaExiste ? prev : [...prev, payload.tecnico];
        });
      }
    };

    socket.on('tecnicoAsignadoAEquipo', handleTecnicoAsignado);

    return () => {
      socket.off('tecnicoAsignadoAEquipo', handleTecnicoAsignado);
    };
  }, [equipo]);


  const fetchEventosFiltrados = async () => {
    try {
      const response = await fetch(`${apiEventosFiltrados}?id_equipo=${equipo.id}`);
      if (!response.ok) {
        throw new Error(`Error en la respuesta del servidor: ${response.status}`);
      }
      const data = await response.json();
      dispatch({ type: "SET_EVENTOS_FILTRADOS", payload: data });
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  };

  useEffect(() => {
    if (equipo?.id) {
      console.log("Cargando eventos, contrato y técnicos...");
      fetchEventosFiltrados();
      fecthDatosContrato();
      fetchTecnicosEquipo();
    }
  }, [equipo]);



  if (!equipo) return null;

  return (
    <Grid container spacing={2} sx={{ mt: 2, mx: 12 }}>
      {/* Sidebar */}
      <Grid item xs={12} md={2}>
        <Card elevation={3} sx={{ borderRadius: 4, p: 2, height: '30rem' }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar
              variant="rounded"
              sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: 28 }}
            >
              {equipo?.modelo?.[0] || '?'}
            </Avatar>
            <Typography variant="h6" mt={1} textAlign="center">
              {equipo.modelo}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <List>
            <ListItemButton selected={tabIndex === 0} onClick={() => setTabIndex(0)}>
              <ListItemIcon><Build /></ListItemIcon>
              <ListItemText primary="Datos del equipo" />
            </ListItemButton>
            <ListItemButton selected={tabIndex === 1} onClick={() => setTabIndex(1)}>
              <ListItemIcon><History /></ListItemIcon>
              <ListItemText primary="Mantenimientos" />
            </ListItemButton>
            <ListItemButton selected={tabIndex === 2} onClick={() => setTabIndex(2)}>
              <ListItemIcon><AssignmentInd /></ListItemIcon>
              <ListItemText primary="Técnicos" />
            </ListItemButton>
            <ListItemButton selected={tabIndex === 3} onClick={() => setTabIndex(3)}>
              <ListItemIcon><Event /></ListItemIcon>
              <ListItemText primary="Eventos" />
            </ListItemButton>
            <ListItemButton selected={tabIndex === 4} onClick={() => setTabIndex(4)}>
              <ListItemIcon><Description /></ListItemIcon>
              <ListItemText primary="Contratos" />
            </ListItemButton>
            <ListItemButton selected={tabIndex === 5} onClick={() => setTabIndex(5)} >
              <ListItemIcon><DesktopAccessDisabled /></ListItemIcon>
              <ListItemText primary="Baja equipo" />
            </ListItemButton>
          </List>
        </Card>
      </Grid>

      {/* Main content */}
      <Grid item xs={12} md={9}>
        <Card elevation={3} sx={{ borderRadius: 4, p: 3, height: '100%' }}>
          <Box sx={{ mt: 2 }}>
            {tabIndex === 0 && (
              <>
                <DatosEquipo equipo={equipo} salas={salas} />
              </>
            )}

            {tabIndex === 1 && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">Historial de mantenimientos</Typography>
                <CurrentMaintenance mantenimiento={mantenimientoFiltrados} />
              </Box>
            )}

            {tabIndex === 2 && (
              <TecnicosEquipo tecnicosEquipo={tecnicosEquipo} equipo={equipo} />
            )}

            {tabIndex === 3 && (

              <CurrentEvents equipo={equipo} salas={salas} />
            )}

            {tabIndex === 4 && (
              <Box>
                <ContratoFormModal open={openContratoModal} onOpen={() => setOpenContratoModal(true)} onClose={() => setOpenContratoModal(false)} equipo={equipo} salas={salas} />
                <CurrentContrato equipo={equipo} contratos={contratos} />
              </Box>
            )}
            {tabIndex === 5 && (
              <Box>
                <CurrentDown equipo={equipo} />
              </Box>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ProfileEquipament;


const DatosEquipo = ({ equipo, salas }) => {
  const [change, setChange] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    serial_number: "",
    tipo: "",
    servicio: "",
    ip: "",
    mascara: "",
    gateway: "",
    aetitle: "",
    puerto: "",
    fabricacion_año: "",
    compra_año: "",
    id_ubicacion: "",
    alta: "",
    requerimientos: "",
    antecedentes: "",
    funcion: "",
    riesgo: "",
  });


  const GE_EM = (fun, ries, reque, ante) => {
    const sumaGeem = Number(fun) + Number(ries) + Number(reque) + Number(ante);
    return sumaGeem;
  };

  useEffect(() => {
    if (equipo) {
      setFormData({
        marca: equipo.marca || "",
        modelo: equipo.modelo || "",
        serial_number: equipo.serial_number || "",
        tipo: equipo.tipo || "",
        servicio: equipo.nombre_servicio || "",
        ip: equipo.ip || "",
        mascara: equipo.mascara || "",
        gateway: equipo.gateway || "",
        aetitle: equipo.aetitle || "",
        id_ubicacion: equipo.id_ubicacion || "",
        puerto: equipo.puerto || "",
        fabricacion_año: equipo.fabricacion_año || "",
        compra_año: equipo.compra_año || "",
        requerimientos: equipo.requerimientos || "",
        antecedentes: equipo.antecedentes || "",
        funcion: equipo.funcion || "",
        riesgo: equipo.riesgo || "",
        alta: equipo.alta || ""
      });
    }
  }, [equipo]);


  const handleChange = (e) => {
    setChange(true);
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiModificacionEquipo}${equipo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setSnackbarMessage('Técnico guardado correctamente.');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        const data = await response.json();
        setSnackbarMessage(data.message || 'Error al guardar el técnico.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error("Error en la actualización:", error);
    }
  };


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2, boxShadow: 2 }}>
        <CardHeader title="Ficha del Equipo" sx={{ backgroundColor: '#1976d2', color: '#fff' }} />
        <CardContent>
          {/* Detalles del equipo */}
          <Typography variant="h6" sx={{ mt: 2 }}>Detalles del equipo</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Marca" name="marca" value={formData.marca} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Modelo" name="modelo" value={formData.modelo} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Serial Number" name="serial_number" value={formData.serial_number} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Tipo" name="tipo" value={formData.tipo} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Servicio" name="servicio" value={formData.servicio} onChange={handleChange} InputLabelProps={{ shrink: true }} disabled /></Grid>
            <Grid item xs={12} sm={6}>
              <Autocomplete
                options={salas}
                getOptionLabel={(option) => option.sala}
                value={salas.find((s) => s.id_ubicacion === formData.id_ubicacion) || null}
                onChange={(event, newValue) => {
                  handleChange({
                    target: {
                      name: 'id_ubicacion',
                      value: newValue ? newValue.id_ubicacion : '',
                    },
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Sala" variant="outlined" fullWidth />
                )}
                isOptionEqualToValue={(option, value) => option.id_ubicacion === value.id_ubicacion}
              />
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Alta de equipo" name="alta" value={new Date(formData.alta).toLocaleDateString('es-AR')} onChange={handleChange} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Año de compra" name="compra_año" value={formData.compra_año} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Año de fabricacion" name="fabricacion_año" value={formData.fabricacion_año} onChange={handleChange} /></Grid>
          </Grid>

          {/* GE / EM */}
          <Typography variant="h6" sx={{ mt: 4 }}>GE / EM</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}><TextField type='number' fullWidth label="Función" name="funcion" value={formData.funcion} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField type='number' fullWidth label="Riesgo" name="riesgo" value={formData.riesgo} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField type='number' fullWidth label="Requerimientos" name="requerimientos" value={formData.requerimientos} onChange={handleChange} /></Grid>
            <Grid item xs={6}><TextField type='number' fullWidth label="Antecedentes" name="antecedentes" value={formData.antecedentes} onChange={handleChange} /></Grid>
            <Grid item xs={12}>
              <Box sx={{ mt: 2, px: 2, py: 1.5, backgroundColor: '#f57c00', borderRadius: 2, border: '1px solid #ddd', boxShadow: 1, textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {`GE/EM: ${GE_EM(formData.funcion, formData.riesgo, formData.requerimientos, formData.antecedentes)}`}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Detalles de red */}
          <Typography variant="h6" sx={{ mt: 4 }}>Detalles de red</Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}><TextField fullWidth label="IP" name="ip" value={formData.ip} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Máscara" name="mascara" value={formData.mascara} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Gateway" name="gateway" value={formData.gateway} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="AETITLE" name="aetitle" value={formData.aetitle} onChange={handleChange} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Puerto" name="puerto" value={formData.puerto} onChange={handleChange} /></Grid>
          </Grid>
        </CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button variant="contained" color="primary" type="submit" disabled={!change} startIcon={<SaveAs />}>
            Guardar cambios
          </Button>
        </Box>
      </Card>

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};


const TecnicosEquipo = ({ tecnicosEquipo, equipo }) => {
  const [formDataList, setFormDataList] = useState([]);
  const [changeList, setChangeList] = useState([]);
  const [originalDataList, setOriginalDataList] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    if (tecnicosEquipo?.length) {
      setFormDataList(tecnicosEquipo.map(tecnico => ({ ...tecnico })));
      setChangeList(tecnicosEquipo.map(() => false));
      setOriginalDataList(tecnicosEquipo.map(tecnico => ({ ...tecnico })));
    }
  }, [tecnicosEquipo]);

  const handleChange = (index, field, value) => {
    const updatedList = [...formDataList];
    updatedList[index][field] = value;
    setFormDataList(updatedList);

    const updatedChangeList = [...changeList];
    updatedChangeList[index] = true;
    setChangeList(updatedChangeList);
  };


  const handleSubmit = async (index) => {
    const tecnico = formDataList[index];
    try {
      const response = await fetch(`${apiModificacionTecnico}${tecnico.id_tecnico}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tecnico),
      });

      if (response.ok) {
        setSnackbarMessage('Técnico guardado correctamente.');
        setSnackbarSeverity('success');
      } else {
        const data = await response.json();
        setSnackbarMessage(data.message || 'Error al guardar el técnico.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error("Error en la actualización:", error);
      setSnackbarMessage("Error en la conexión.");
      setSnackbarSeverity("error");
    } finally {
      setSnackbarOpen(true);
      const updatedChangeList = [...changeList];
      updatedChangeList[index] = false;
      setChangeList(updatedChangeList);
    }
  };

  const handleCancel = (index) => {
    const updatedFormDataList = [...formDataList];
    updatedFormDataList[index] = { ...originalDataList[index] };
    setFormDataList(updatedFormDataList);

    const updatedChangeList = [...changeList];
    updatedChangeList[index] = false;
    setChangeList(updatedChangeList);
  }
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight="bold">Técnicos asignados</Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <NewTechnician equipo={equipo} />
      </Box>
      <Grid container spacing={2}>
        {formDataList.length > 0 ? (
          formDataList.map((tecnico, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardContent>
                  <TextField
                    fullWidth
                    label="Nombre" name="nombre"
                    value={tecnico.nombre}
                    margin="normal"
                    onChange={(e) => handleChange(index, "nombre", e.target.value)}
                  />
                  <TextField
                    fullWidth label="Apellido" name="apellido"
                    value={tecnico.apellido}
                    margin="normal"
                    onChange={(e) => handleChange(index, "apellido", e.target.value)}
                  />
                  <TextField
                    fullWidth label="Empresa" name="empresa"
                    value={tecnico.empresa}
                    margin="normal"
                    onChange={(e) => handleChange(index, "empresa", e.target.value)}
                  />
                  <TextField
                    fullWidth label="Número" name="numero"
                    value={tecnico.numero}
                    margin="normal"
                    onChange={(e) => handleChange(index, "numero", e.target.value)}
                  />
                  <TextField
                    fullWidth label="Email" name="email"
                    value={tecnico.email}
                    margin="normal"
                    onChange={(e) => handleChange(index, "email", e.target.value)}
                  />
                  <TextField
                    fullWidth label="Cobertura" name="cobertura"
                    value={tecnico.cobertura}
                    margin="normal"
                    onChange={(e) => handleChange(index, "cobertura", e.target.value)}
                  />
                  <Box sx={{ mt: 2, gap: 2, display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <Button
                      disabled={!changeList[index]}
                      onClick={() => handleSubmit(index)}
                      variant="contained"
                      color="primary"
                    >
                      <ListItemIcon><SaveAs /></ListItemIcon>
                      <ListItemText primary="Guardar cambios" />
                    </Button>
                    <Button
                      disabled={!changeList[index]}
                      onClick={() => handleCancel(index)}
                      variant="outlined"
                      color="secondary"

                    >
                      Cancelar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">(Sin técnicos asignados)</Typography>
        )}
      </Grid>

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};


const CurrentDown = ({ equipo }) => {
  const [descripcion, setDescripcion] = useState('');
  const [openConfirm, setOpenConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [sbOpen, setSbOpen] = useState(false);
  const [sbMsg, setSbMsg] = useState('');
  const [sbType, setSbType] = useState('success'); // 'success' | 'error'

  const handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!descripcion.trim()) {
      setSbMsg('Por favor, escribí una descripción.');
      setSbType('error');
      setSbOpen(true);
      return;
    }
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => setOpenConfirm(false);

  const doDown = async () => {
    setLoading(true);
    setOpenConfirm(false);


    try {
          const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    }
    console.log("id tker ",userId)
      // 1) Crear evento de baja
      const nuevoEvento = {
        descripcion,
        id_equipo: equipo.id,
        estado: 'baja',
        tipo_falla: 'dado de baja',
        id_usuario: userId,
      };

      const r1 = await fetch(apiEventos, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevoEvento),
      });

      const t1 = await r1.text();
      if (!r1.ok) {
        throw new Error(`Error creando evento de baja (${r1.status}): ${t1}`);
      }

      // 2) Dar de baja el equipo
      const r2 = await fetch(apiBajaEquipo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_equipo: equipo.id }),
      });

      const t2 = await r2.text();
      if (!r2.ok) {
        throw new Error(`Error al dar de baja el equipo (${r2.status}): ${t2}`);
      }

      setSbMsg('Equipo dado de baja correctamente.');
      setSbType('success');
      setSbOpen(true);

      // limpiar y avisar al padre
      setDescripcion('');

    } catch (err) {
      console.error(err);
      setSbMsg('No se pudo dar de baja el equipo.');
      setSbType('error');
      setSbOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleOpenConfirm}
      sx={{
        bgcolor: 'background.paper',
        width: { xs: '100%', sm: 600 },
        borderRadius: 4,
        p: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" fontWeight={700}>Baja de equipo</Typography>

      <TextField
        label="Descripción"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        fullWidth
        required
        multiline
        rows={3}
      />

      <FormControl fullWidth>
        <InputLabel>Condición</InputLabel>
        <Select value="baja" disabled sx={{ mb: 1 }}>
          <MenuItem value="operativo">Operativo</MenuItem>
          <MenuItem value="no operativo">No Operativo</MenuItem>
          <MenuItem value="revision">Revisión</MenuItem>
          <MenuItem value="baja">Baja</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>Tipo de Evento</InputLabel>
        <Select value="dado de baja" disabled>
          <MenuItem value="dado de baja">Dado de baja</MenuItem>
        </Select>
      </FormControl>

      <Box mt={1} display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          color="error"
          type="submit"
          startIcon={<PowerOff />}
          disabled={loading}
          sx={{ fontSize: 16, px: 2, borderRadius: 2, textTransform: 'none' }}
        >
          {loading ? 'Procesando…' : 'Dar de baja'}
        </Button>
      </Box>

      {/* Confirmación */}
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirmar baja</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Confirmás dar de baja el equipo <b>{equipo?.modelo}</b> (ID {equipo?.id})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={doDown} disabled={loading}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={sbOpen} autoHideDuration={5000} onClose={() => setSbOpen(false)}>
        <Alert onClose={() => setSbOpen(false)} severity={sbType} sx={{ width: '100%' }}>
          {sbMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

