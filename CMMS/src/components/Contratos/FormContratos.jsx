import React, { useState, forwardRef } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, IconButton, Stepper, Step, StepLabel, Grid, Paper, StepContent, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Close } from '@mui/icons-material';
import { format } from 'date-fns';
import { apiCargaContrato } from '../utils/Fetch';
import { parseISO } from 'date-fns';


const FormContratos = forwardRef(({ contratoClose= () => { }, equipo }, ref) => {
    const [description, setDescription] = useState('');
    const [update, setUpdate] = useState('');
    const [desde, setDesde] = useState(null);
    const [hasta, setHasta] = useState(null);
    const [idEquipo, setIdEquipo] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [coberturaPartes, setCoberturaPartes] = useState('');
    const [coberturaManoDeObra, setCoberturaManoDeObra] = useState('');
    const [fechaError, setFechaError] = useState(false);


    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Datos del contrato', 'Coberturas', 'Adjuntos', 'Confirmar'];
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');


    const handleNext = () => setActiveStep((prev) => prev + 1);
    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        console.log('aca deberia estar le id', idEquipo);

        if (!selectedFile) {
            setSnackbarMessage('Por favor, seleccione un archivo.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
            return;
        }


        const formData = new FormData();
        formData.append('file', selectedFile);
        if (description) formData.append('descripcion', description);
        if (update) formData.append('actualizacion', update);
        if (desde) formData.append('desde', format(parseISO(desde), 'yyyy-MM-dd'));
        if (hasta) formData.append('hasta', format(parseISO(hasta), 'yyyy-MM-dd'));
        if (coberturaPartes) formData.append('cobertura_partes', coberturaPartes);
        if (coberturaManoDeObra) formData.append('cobertura_manoDeObra', coberturaManoDeObra);
        formData.append('id_equipo', String(equipo.id));

        try {
            const response = await fetch(apiCargaContrato, { method: 'POST', body: formData });

            const contentType = response.headers.get('content-type') || '';
            const raw = await response.text();  // SIEMPRE miro el body para debug
            let data = null;
            if (contentType.includes('application/json')) {
                try { data = JSON.parse(raw); } catch { /* no pasa nada */ }
            }

            console.log('upload status=', response.status, 'body=', raw);

            // si el server devolvió 2xx lo tomo como OK
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            // si vino JSON y ok === false, también lo trato como error
            if (data && data.ok === false) throw new Error(data.error || 'UPLOAD_FAIL');

            setSnackbarMessage('Contrato cargado exitosamente.');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);

            // cerrá sólo si es función
            if (typeof contratoClose === 'function') contratoClose();
        } catch (err) {
            console.error('Upload error:', err);
            setSnackbarMessage('Error al cargar el contrato.');
            setSnackbarSeverity('error');
            setSnackbarOpen(true);
        }
    }


    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Datos del equipo</Typography>
                        <TextField
                            label="Equipo"
                            value={equipo?.marca || ''}
                            fullWidth
                            sx={{ mb: 2 }}
                            disabled
                        />
                        <TextField
                            label="Observación"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            label="Actualización"
                            value={update}
                            onChange={(e) => setUpdate(e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            required
                        />
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Desde"
                                    type="date"
                                    value={desde || ''}
                                    onChange={(e) => {
                                        setDesde(e.target.value);
                                        // Si hasta ya tiene valor, volvemos a validar
                                        if (hasta && new Date(hasta) < new Date(e.target.value)) {
                                            setFechaError(true);
                                        } else {
                                            setFechaError(false);
                                        }
                                    }}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Hasta"
                                    type="date"
                                    value={hasta || ''}
                                    onChange={(e) => {
                                        const nuevaHasta = e.target.value;
                                        setHasta(nuevaHasta);
                                        if (desde && new Date(nuevaHasta) < new Date(desde)) {
                                            setFechaError(true);
                                        } else {
                                            setFechaError(false);
                                        }
                                    }}

                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 1:
                return (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Cobertura</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Cobertura Partes"
                                    value={coberturaPartes}
                                    onChange={(e) => setCoberturaPartes(e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Cobertura Mano de Obra"
                                    value={coberturaManoDeObra}
                                    onChange={(e) => setCoberturaManoDeObra(e.target.value)}
                                    fullWidth
                                    required
                                />
                            </Grid>
                        </Grid>
                    </Box>
                );

            case 2:
                return (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Archivo del contrato</Typography>

                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            sx={{ justifyContent: 'flex-start', textTransform: 'none', mb: 1 }}
                        >
                            {selectedFile ? selectedFile.name : 'Seleccionar archivo (.pdf, .docx, .doc)'}
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                            />
                        </Button>

                        {selectedFile && (
                            <Typography variant="caption" color="text.secondary">
                                Archivo seleccionado: {selectedFile.name}
                            </Typography>
                        )}
                    </Box>

                );

            case 3:
                return (
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>Revisá que esté todo bien 👇</Typography>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                            <Typography variant="body1"><strong>Equipo:</strong> {equipo?.marca || '-'}</Typography>
                            <Typography variant="body1"><strong>Observación:</strong> {description}</Typography>
                            <Typography variant="body1"><strong>Actualización:</strong> {update}</Typography>
                            <Typography variant="body1"><strong>Desde:</strong> {desde ? new Date(desde).toLocaleDateString('es-AR') : '-'}</Typography>
                            <Typography variant="body1"><strong>Hasta:</strong> {hasta ? new Date(hasta).toLocaleDateString('es-AR') : '-'}</Typography>
                            <Typography variant="body1"><strong>Cobertura Partes:</strong> {coberturaPartes}</Typography>
                            <Typography variant="body1"><strong>Cobertura Mano de Obra:</strong> {coberturaManoDeObra}</Typography>
                            <Typography variant="body1"><strong>Archivo:</strong> {selectedFile?.name || 'No adjuntado'}</Typography>
                        </Box>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Paper ref={ref} sx={{ p: 4, width: '100%', maxWidth: 700, mx: 'auto', mt: 5, borderRadius: 3 }}>
            <IconButton onClick={contratoClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
                <Close />
            </IconButton>

            <Typography variant="h5" gutterBottom>
                Cargar contrato
            </Typography>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 2 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>
                            <Typography variant="caption">{label}</Typography>
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>


            <Box mt={4}>{renderStepContent(activeStep)}</Box>

            <Box mt={4} display="flex" justifyContent="space-between">
                <Button disabled={activeStep === 0} onClick={handleBack}>
                    Anterior
                </Button>
                {activeStep === steps.length - 1 ? (
                    <Button variant="contained" onClick={handleSubmit}>
                        Finalizar
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext}>
                        Siguiente
                    </Button>
                )}
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
});

export default FormContratos;
