import React, { useState, forwardRef } from 'react';
import {
    Stepper,
    Step,
    StepLabel,
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    TextField,
    InputAdornment,
    Snackbar,
    Alert,
    Autocomplete,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { apiAltaEquipos, servicios } from '../utils/Fetch';
import { InfoOutlined } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

const legends = {
    funcion: [
        "1 : Equipos relacionados con los pacientes y otros equipos.",
        "2 : Sistema de cómputo y equipos asociados.",
        "3 : Accesorios de laboratorio.",
        "4 : Laboratorio analitico.",
        "5 : Otros equipos para el monitoreo de variables fisiológicas y el diagnóstico.",
        "6 : Monitoreo quirúrgico y de cuidados intensivos.",
        "7 : Terapia fisica y tratamiento.",
        "8 : Cirugía y cuidados intensivos.",
        "9 : Soporte de vida."
    ],
    riesgo: [
        "1 : No se detectan riesgos significativos.",
        "2 : Daños en el equipo.",
        "3 : Terapia inapropiada o falso diagnóstico.",
        "4 : Posible lesión del paciente o el usuario.",
        "5 : Posible muerte del paciente."
    ],
    requerimientos: [
        "1 : Minimos",
        "2 : Menor al promedio.",
        "3 : Promedio.",
        "4 : Superior al promedio.",
        "5 : Extensivos: calibración de rutina y reemplazo de partes."
    ],
    antecedentes: [
        "-2 : Insignificante: menos de 1 en los ultimos 30 meses.",
        "-1 : Minimos: 1 cada 18 a 30 meses.",
        "0 : Usual: 1 cada 9 a 18 meses.",
        "1 : Moderado: 1 cada 6 a 9 meses.",
        "2 : Significativo: 1 cada 6 meses."
    ]
};


const steps = ['Datos técnicos', 'GE/EM', ' Red', 'Ubicación'];
const NewEquipamentForm = forwardRef(({ handleClose, sala }, ref) => {
    const [activeStep, setActiveStep] = useState(0);


    const [modelo, setModelo] = useState('');
    const [marca, setMarca] = useState('');
    const [aetitle, setAetitle] = useState('');
    const [compra, setCompra] = useState('');
    const [mascara, setMascara] = useState('');
    const [ip, setIp] = useState('');
    const [tipo, setTipo] = useState('MODALITY');
    const [puerto, setPuerto] = useState('');
    const [gateway, setGateway] = useState('');
    const [fabricacion, setFabricacion] = useState('');
    const [riesgo, setRiesgo] = useState('');
    const [funcion, setFuncion] = useState('');
    const [requerimientos, setRequerimientos] = useState('');
    const [antecedentes, setAntecedentes] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [selectedSala, setSelectedSala] = useState(null);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null);


    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [infoField, setInfoField] = useState('');



    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);
    const handleSnackbarClose = () => setSnackbarOpen(false);

    const handleSubmit = async (event) => {
        event.preventDefault();


        const nuevoEquipo = {
            marca: marca,
            modelo: modelo,
            serial_number: serialNumber,
            tipo: tipo,
            id_servicio: servicioSeleccionado.id_servicio,
            ip: ip,
            mascara: mascara,
            gateway: gateway,
            aetitle: aetitle,
            puerto: puerto,
            compra_año: compra,
            id_ubicacion: selectedSala.id_ubicacion,
            funcion: funcion,
            riesgo: riesgo,
            requerimientos: requerimientos,
            antecedentes: antecedentes,
            facbricacion_año: fabricacion
        }
         console.log(nuevoEquipo)
        try {
            const response = await fetch(apiAltaEquipos, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoEquipo),
            });

            if (response.ok) {
                setSnackbarMessage('Equipo cargado exitosamente.');
                setSnackbarSeverity('success');
                setSnackbarOpen(true);
                handleClose();
            } else {
                const error = await response.json();
                console.error('Error del servidor:', error);
                throw new Error('Error al cargar equipo.');
            }
        } catch (error) {
            console.error(error);
            setSnackbarMessage('Error al cargar equipo.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="Modelo" value={modelo} onChange={(e) => setModelo(e.target.value)} fullWidth required /></Grid>
                        <Grid item xs={6}><TextField label="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} fullWidth required /></Grid>
                        <Grid item xs={6}>
                            <Autocomplete
                                options={servicios}
                                value={servicioSeleccionado}
                                onChange={(event, newValue) => setServicioSeleccionado(newValue)}
                                getOptionLabel={(option) => option.nombre_servicio}
                                renderInput={(params) => (
                                    <TextField {...params} label="Seleccionar servicio" required />
                                )}
                            />

                        </Grid>
                        <Grid item xs={6}><TextField label="Serial Number" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} fullWidth disabled /></Grid>
                        <Grid item xs={6}><TextField label="Año de fabricación" type="number" value={fabricacion} onChange={(e) => setFabricacion(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Año de compra" type="number" value={compra} onChange={(e) => setCompra(e.target.value)} fullWidth /></Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Función" value={funcion} type='number' onChange={(e) => setFuncion(e.target.value)} name="funcion" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Ver detalles">
                                            <IconButton onClick={() => {
                                                setInfoField('funcion');
                                                setInfoDialogOpen(true);
                                            }}>
                                                <InfoOutlined />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Riesgo" value={riesgo} onChange={(e) => setRiesgo(e.target.value)} name="riesgo" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Ver detalles">
                                            <IconButton onClick={() => {
                                                setInfoField('riesgo');
                                                setInfoDialogOpen(true);
                                            }}>
                                                <InfoOutlined />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Requerimientos" value={requerimientos} onChange={(e) => setRequerimientos(e.target.value)} name="requerimientos" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Ver detalles">
                                            <IconButton onClick={() => {
                                                setInfoField('requerimientos');
                                                setInfoDialogOpen(true);
                                            }}>
                                                <InfoOutlined />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Antecedentes" value={antecedentes} onChange={(e) => setAntecedentes(e.target.value)} name="antecedentes" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Ver detalles">
                                            <IconButton onClick={() => {
                                                setInfoField('antecedentes');
                                                setInfoDialogOpen(true);
                                            }}>
                                                <InfoOutlined />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }} />
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Grid container spacing={2}>
                        <Grid item xs={6}><TextField label="IP" value={ip} onChange={(e) => setIp(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Máscara" value={mascara} onChange={(e) => setMascara(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={6}><TextField label="Gateway" value={gateway} onChange={(e) => setGateway(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={3}><TextField label="Puerto" value={puerto} onChange={(e) => setPuerto(e.target.value)} fullWidth /></Grid>
                        <Grid item xs={3}><TextField label="AETITLE" value={aetitle} onChange={(e) => setAetitle(e.target.value)} fullWidth /></Grid>
                    </Grid>
                );
            case 3:
                return (
                    <Box>
                        <Autocomplete
                            options={sala}
                            value={selectedSala}
                            onChange={(event, newValue) => setSelectedSala(newValue)}
                            isOptionEqualToValue={(option, value) => option.id_ubicacion === value.id_ubicacion}
                            getOptionLabel={(option) => {
                                const servicio = servicios.find(s => s.id_servicio === option.id_servicio);
                                return `${option.sala} - ${servicio?.siglas_servicio || 'Sin sigla'}`;
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Seleccionar Sala" required />
                            )}
                        />
                        <Box mt={3}>
                            <Typography variant="body2">
                                Revisa todos los datos antes de confirmar.
                            </Typography>
                        </Box>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 800, margin: 'auto', mt: 5, borderRadius: 3 }}>
            <IconButton
                aria-label="cerrar"
                onClick={handleClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <Typography variant="h5" mb={3}>Alta de equipo médico</Typography>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                        <Step key={label}><StepLabel>{label}</StepLabel></Step>
                    ))}
                </Stepper>

                <Box mt={4}>{renderStepContent(activeStep)}</Box>

                <Box mt={4} display="flex" justifyContent="space-between">
                    <Button disabled={activeStep === 0} onClick={handleBack}>Anterior</Button>
                    {activeStep === steps.length - 1 ? (
                        <Button variant="contained" color="primary" onClick={handleSubmit}>Finalizar</Button>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleNext}>Siguiente</Button>
                    )}
                </Box>

                <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={handleSnackbarClose}>
                    <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
                <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)}>
                    <DialogTitle>Significado de los valores</DialogTitle>
                    <DialogContent>
                        <DialogContentText component="div">
                            {legends[infoField]?.map((desc, index) => (
                                <Typography key={index} variant="body2" gutterBottom>
                                    {desc}
                                </Typography>
                            ))}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setInfoDialogOpen(false)} autoFocus>
                            Cerrar
                        </Button>
                    </DialogActions>
                </Dialog>
        </Paper>
    );
});



export default NewEquipamentForm;




