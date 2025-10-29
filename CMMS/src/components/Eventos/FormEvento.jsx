import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, MenuItem, FormControl, InputLabel, Select, Grid, Stepper, Step, StepLabel, List, ListItem, IconButton, ListItemText, ListItemIcon, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { apiEventos } from '../utils/Fetch';
import { jwtDecode } from 'jwt-decode';
import { Folder } from '@mui/icons-material';
import { ArrowBack } from '@mui/icons-material';




const FormEvento = forwardRef(({ handleClose, equipo }, ref) => {
  const steps = ['Descripción del evento', 'Estado del equipo', 'Repuestos', 'Adjuntos', 'Finalizar'];
  const [activeStep, setActiveStep] = useState(0);
  const [taskDescription, setTaskDescription] = useState('');
  const [condicion, setCondicion] = useState('');
  const [falla, setFalla] = useState('');
  const [criticidad, setCriticidad] = useState('');
  const [adjuntos, setAdjuntos] = useState([]);
  const [tipoArchivo, setTipoArchivo] = useState('');
  const [respuestoTab, setRespuestoTab] = useState('');
  const [repuestos, setRepuestos] = useState([]);
  const [nuevoRepuesto, setNuevoRepuesto] = useState({
    repuesto: '',
    costo: '',
    serial_number: '',
    proveedor: '',
    observacion: ''
  });


  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleNuevoRepuestoChange = (field, value) => {
    setNuevoRepuesto({ ...nuevoRepuesto, [field]: value });
  };

  const agregarRepuesto = () => {
    if (!nuevoRepuesto.repuesto) return; // validar que haya al menos repuesto
    setRepuestos([...repuestos, nuevoRepuesto]);
    setNuevoRepuesto({
      repuesto: '',
      costo: '',
      serial_number: '',
      proveedor: '',
      observacion: '',
      cobertura: ''
    });
  };

  const eliminarRepuesto = (index) => {
    const actualizados = [...repuestos];
    actualizados.splice(index, 1);
    setRepuestos(actualizados);
  };

  const agregarAdjuntos = (files) => {
    setAdjuntos(prev => [...prev, ...files]);
  }

  const eliminarAdjunto = (index) => {
    const actualizado = [...adjuntos];
    actualizado.splice(index, 1)
    setAdjuntos(actualizado);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem('token');
    let userId = null;
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        // Verificamos que tenga 'id' y que no esté expirado
        if (decodedToken.id && (!decodedToken.exp || decodedToken.exp * 1000 > Date.now())) {
          userId = decodedToken.id;
        } else {
          console.warn("Token expirado o sin ID, eliminando token");
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error("Error al decodificar token:", err);
        localStorage.removeItem('token');
      }
    }
    console.log("userId:", userId);

    const formData = new FormData();
    formData.append('descripcion', taskDescription);
    formData.append('id_equipo', equipo.id);
    formData.append('estado', condicion);
    formData.append('tipo_falla', falla);
    formData.append('criticidad', criticidad);
    formData.append('id_usuario', userId);
    formData.append('tipo_archivo', tipoArchivo);


    //repuestos
    repuestos.forEach((rep, i) => {
      formData.append(`repuestos[${i}][repuesto]`, rep.repuesto);
      formData.append(`repuestos[${i}][costo]`, rep.costo);
      formData.append(`repuestos[${i}][observacion]`, rep.observacion);
      formData.append(`repuestos[${i}][serial_number]`, rep.serial_number);
      formData.append(`repuestos[${i}][proveedor]`, rep.proveedor);
      formData.append(`repuestos[${i}][cobertura]`, rep.cobertura);
    });

    // Archivos
    adjuntos.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(apiEventos, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Evento guardado correctamente');
        handleClose();
      } else {
        console.error('Error al guardar el evento');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
    }

    // Limpiar campos
    setTaskDescription('');
    setFalla('');
    setCondicion('');
    setCriticidad('');
    setTipoArchivo('');
    setAdjuntos([]);
    setRespuestoTab(false);
  };



  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Evento</InputLabel>
                <Select value={falla} onChange={(e) => setFalla(e.target.value)}>
                  <MenuItem value="electrica">Eléctrica</MenuItem>
                  <MenuItem value="mecanica">Mecánica</MenuItem>
                  <MenuItem value="software">Software</MenuItem>
                  <MenuItem value="cotizacion">Cotización</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label="Descripción"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Condición</InputLabel>
                <Select value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                  <MenuItem value="operativo">Operativo</MenuItem>
                  <MenuItem value="mantenimiento">Mantenimiento</MenuItem>
                  <MenuItem value="revision">Revisión</MenuItem>
                  <MenuItem value="no operativo">No Operativo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Criticidad</InputLabel>
                <Select value={criticidad} onChange={(e) => setCriticidad(e.target.value)}>
                  <MenuItem value="bajo">Bajo</MenuItem>
                  <MenuItem value="medio">Medio</MenuItem>
                  <MenuItem value="alto">Alto</MenuItem>
                  <MenuItem value="muy alto">Muy Alto</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Repuesto</InputLabel>
                <Select
                  value={nuevoRepuesto.repuesto}
                  onChange={(e) => handleNuevoRepuestoChange('repuesto', e.target.value)}
                >
                  <MenuItem value="bobina">Bobina</MenuItem>
                  <MenuItem value="camilla">Camilla</MenuItem>
                  <MenuItem value="fusible">Fusible</MenuItem>
                  <MenuItem value="tubo">Tubo</MenuItem>
                  <MenuItem value="motor">Motor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                label="Costo"
                type="number"
                fullWidth
                value={nuevoRepuesto.costo}
                onChange={(e) => handleNuevoRepuestoChange('costo', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="N° Serie"
                fullWidth
                value={nuevoRepuesto.serial_number}
                onChange={(e) => handleNuevoRepuestoChange('serial_number', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Proveedor"
                fullWidth
                value={nuevoRepuesto.proveedor}
                onChange={(e) => handleNuevoRepuestoChange('proveedor', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Cobertura</InputLabel>
                <Select
                  value={nuevoRepuesto.cobertura}
                  onChange={(e) => handleNuevoRepuestoChange('cobertura', e.target.value)}
                >
                  <MenuItem value="contrato">Contrato</MenuItem>
                  <MenuItem value="garantia">Garantia</MenuItem>
                  <MenuItem value="sin contrato preventivo">Sin contrato-Preventivo</MenuItem>
                  <MenuItem value="sin contrato correctivo">Sin contrato-Correctivo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Observación"
                multiline
                fullWidth
                rows={2}
                value={nuevoRepuesto.observacion}
                onChange={(e) => handleNuevoRepuestoChange('observacion', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={agregarRepuesto}>Agregar Repuesto</Button>
            </Grid>

            {repuestos.length > 0 && (
              <Grid item xs={12}>
                <List>
                  {repuestos.map((rep, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" color="error" onClick={() => eliminarRepuesto(index)}>
                          <DeleteIcon />
                        </IconButton>
                      }
                    >
                      <ListItemText
                        primary={`${rep.repuesto} - ${rep.serial_number} - $${rep.costo}`}
                        secondary={`Proveedor: ${rep.proveedor} | Obs: ${rep.observacion}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>

        );
      case 3:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Adjuntar archivos
              <Divider />
            </Typography>

            <Grid container spacing={1}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Archivo</InputLabel>
                  <Select
                    name='tipo_archivo'
                    value={tipoArchivo}
                    onChange={(e) => setTipoArchivo(e.target.value)}
                  >
                    <MenuItem value="factura">Factura</MenuItem>
                    <MenuItem value="informe">Informe</MenuItem>
                    <MenuItem value="presupuesto">Presupuesto</MenuItem>
                    <MenuItem value="otro">Otro</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={5}>
                <Button variant="contained" component="label" fullWidth>
                  Subir Nuevos Archivos
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={(e) => agregarAdjuntos(Array.from(e.target.files))}
                  />
                </Button>
              </Grid>
              {adjuntos.length > 0 && (
                <Grid item xs={10}>
                  <List>
                    {adjuntos.map((f, index) => (
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" color="error" onClick={() => eliminarAdjunto(index)}>
                            <DeleteIcon />
                          </IconButton>
                        }>
                        <ListItemIcon>
                          <Folder />
                        </ListItemIcon>
                        <ListItemText primary={f.name} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      case 4:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Resumen del evento</Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Tipo de Evento:</strong> {falla}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Condición:</strong> {condicion}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1"><strong>Criticidad:</strong> {criticidad}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1"><strong>Descripción:</strong> {taskDescription}</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6">Repuestos agregados</Typography>
            {repuestos.length > 0 ? (
              <List>
                {repuestos.map((rep, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${rep.repuesto} - $${rep.costo} - SN: ${rep.serial_number}`}
                      secondary={`Proveedor: ${rep.proveedor} | Observación: ${rep.observacion}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No se han agregado repuestos.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Typography variant="h6">Archivos cargados</Typography>
            {adjuntos.length > 0 && (
              <Grid item xs={10}>
                <List>
                  {adjuntos.map((f) => (
                    <ListItem>
                      <ListItemIcon>
                        <Folder />
                      </ListItemIcon>
                      <ListItemText primary={f.name} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
            <Divider sx={{ my: 2 }} />

            <Box display="flex" justifyContent="center">
              <Button type="submit" variant="contained" color="primary">
                Confirmar y Guardar
              </Button>
            </Box>
          </Box>
        );

      default:
        return 'Paso no válido';
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        position: 'absolute',
        bgcolor: 'background.paper',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', md: 700 },
        maxHeight: '95vh',
        overflowY: 'auto',
        p: 4,
        borderRadius: '12px',
      }}
    >
      <IconButton onClick={handleClose}>
        <ArrowBack />
      </IconButton>
      <Typography variant="h6" gutterBottom>Cargar Nuevo Evento</Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {renderStepContent(activeStep)}

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>Atrás</Button>
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>Siguiente</Button>
        ) : null}
      </Box>
    </Box>
  );
})

export default FormEvento;


