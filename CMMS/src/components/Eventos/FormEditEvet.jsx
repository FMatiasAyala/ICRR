import React, { useState } from 'react';
import {
    Box, Typography, TextField, FormControl, InputLabel,
    Select, MenuItem, Button, Grid, Card, CardHeader, CardContent, Divider, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { apiModificacionEvento } from '../utils/Fetch';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const FormEditEvento = ({ evento, onClose }) => {
    const [formData, setFormData] = useState({
        descripcion: evento.descripcion || "",
        estado: evento.estado || "",
        tipo_falla: evento.tipo_falla || "",
        criticidad: evento.criticidad || "",
        repuesto: evento.repuestos || [],
        tipo_archivo: evento.tipo_archivo || "",
    });
    const [adjuntos, setAdjuntos] = useState([]);
    const [archivosActuales, setArchivosActuales] = useState(evento.archivos || []);
    const [change, setChange] = useState(false);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setChange(true);
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const [repuestos, setRepuestos] = useState(evento.repuestos || []);

    const handleRepuestoFieldChange = (index, field, value) => {
        setRepuestos((prev) => {
            const updated = [...prev];
            updated[index][field] = value;
            setChange(true);
            return updated;
        });
    };

    const handleAgregarRepuesto = () => {
        setRepuestos((prev) => [
            ...prev,
            { repuesto: '', costo: '', observacion: '', proveedor: '', serial_number: '', cobertura: '' }
        ]);
        setChange(true);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Agrega los datos del formulario base
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(item => data.append(key, item));
            } else {
                data.append(key, value || '');
            }
        });

        // Agrega los archivos adjuntos nuevos
        adjuntos.forEach(file => {
            data.append('files', file);
        });

        // Archivos actuales (para no eliminarlos del servidor si no se quitan)
        data.append('archivosActuales', JSON.stringify(archivosActuales.map(a => a.nombre)));

        // 👉 Agregar los repuestos como JSON
        data.append('repuestos', JSON.stringify(repuestos));

        try {
            const response = await fetch(`${apiModificacionEvento}${evento.id_evento}`, {
                method: 'PUT',
                body: data,
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el evento');
            }

            console.log('Evento actualizado correctamente');
            onClose(); // Cierra el modal si se guardó correctamente
        } catch (error) {
            console.error('Error al actualizar:', error);
        }
    };


    return (
        <Card sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', md: 900 },
            maxHeight: '90vh',
            overflowY: 'auto',
            borderRadius: 3,
            boxShadow: 5,
        }}>
            <CardHeader
                title="Editar Evento"
                sx={{ bgcolor: 'primary.main', color: 'white', textAlign: 'center', py: 2 }}
            />
            <Divider />
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Datos del Evento</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        name='descripcion'
                                        label="Descripción"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        fullWidth
                                        multiline
                                        rows={2}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Condición</InputLabel>
                                        <Select name='estado' value={formData.estado} onChange={handleChange}>
                                            <MenuItem value="OPERATIVO">Operativo</MenuItem>
                                            <MenuItem value="MANTENIMIENTO">Mantenimiento</MenuItem>
                                            <MenuItem value="REVISION">Revisión</MenuItem>
                                            <MenuItem value="NO OPERATIVO">No Operativo</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Tipo de Evento</InputLabel>
                                        <Select name='tipo_falla' value={formData.tipo_falla} onChange={handleChange}>
                                            <MenuItem value="estado inicial">Estado inicial</MenuItem>
                                            <MenuItem value="electrica">Eléctrica</MenuItem>
                                            <MenuItem value="electronica">Electrónica</MenuItem>
                                            <MenuItem value="mecanica">Mecánica</MenuItem>
                                            <MenuItem value="software">Software</MenuItem>
                                            <MenuItem value="cotizacion">Cotizacion</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required>
                                        <InputLabel>Criticidad</InputLabel>
                                        <Select name='criticidad' value={formData.criticidad} onChange={handleChange}>
                                            <MenuItem value="bajo">Bajo</MenuItem>
                                            <MenuItem value="medio">Medio</MenuItem>
                                            <MenuItem value="alto">Alto</MenuItem>
                                            <MenuItem value="muy alto">Muy Alto</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion >
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Repuestos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                {repuestos?.map?.((rep, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box
                                            sx={{
                                                border: '1px solid #ccc',
                                                borderRadius: 2,
                                                p: 2,
                                                backgroundColor: '#f9f9f9'
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Repuesto</InputLabel>
                                                        <Select
                                                            value={rep.repuesto}
                                                            onChange={(e) => handleRepuestoFieldChange(index, 'repuesto', e.target.value)}
                                                        >
                                                            <MenuItem value="bobina">Bobina</MenuItem>
                                                            <MenuItem value="camilla">Camilla</MenuItem>
                                                            <MenuItem value="fusible">Fusible</MenuItem>
                                                            <MenuItem value="tubo">Tubo</MenuItem>
                                                            <MenuItem value="motor">Motor</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={3}>
                                                    <TextField
                                                        label="Costo"
                                                        type="number"
                                                        fullWidth
                                                        value={rep.costo}
                                                        onChange={(e) => handleRepuestoFieldChange(index, 'costo', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField
                                                        label="Descripción"
                                                        fullWidth
                                                        value={rep.observacion || ''}
                                                        onChange={(e) => handleRepuestoFieldChange(index, 'observacion', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField
                                                        label="Proveedor"
                                                        fullWidth
                                                        value={rep.proveedor || ''}
                                                        onChange={(e) => handleRepuestoFieldChange(index, 'proveedor', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={5}>
                                                    <TextField
                                                        label="Serial Numbre"
                                                        fullWidth
                                                        value={rep.serial_number || ''}
                                                        onChange={(e) => handleRepuestoFieldChange(index, 'serial_number', e.target.value)}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={4}>
                                                    <FormControl fullWidth>
                                                        <InputLabel>Cobertura</InputLabel>
                                                        <Select
                                                            value={rep.cobertura}
                                                            onChange={(e) => handleRepuestoFieldChange(index, 'cobertura', e.target.value)}
                                                        >
                                                            <MenuItem value="contrato">Contrato</MenuItem>
                                                            <MenuItem value="garantia">Garantia</MenuItem>
                                                            <MenuItem value="sin contrato preventivo">Sin contrato-Preventivo</MenuItem>
                                                            <MenuItem value="sin contrato correctivo">Sin contrato-Correctivo</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                ))}

                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={handleAgregarRepuesto}
                                        fullWidth
                                    >
                                        Agregar nuevo repuesto
                                    </Button>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">Archivos Adjuntos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de Archivo</InputLabel>
                                        <Select
                                            name='tipo_archivo'
                                            value={formData.tipo_archivo}
                                            onChange={handleChange}
                                        >
                                            <MenuItem value="factura">Factura</MenuItem>
                                            <MenuItem value="informe">Informe</MenuItem>
                                            <MenuItem value="presupuesto">Presupuesto</MenuItem>
                                            <MenuItem value="otro">Otro</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button variant="contained" component="label" fullWidth>
                                        Subir Nuevos Archivos
                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            onChange={(e) => setAdjuntos([...e.target.files])}
                                        />
                                    </Button>
                                </Grid>

                                {adjuntos.length > 0 && (
                                    <Grid item xs={12}>
                                        <Typography variant="body2" mt={1}>
                                            Archivos nuevos: {adjuntos.map(f => f.name).join(', ')}
                                        </Typography>
                                    </Grid>
                                )}
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                    <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2} mt={2}>
                        <Button disabled={!change} variant="contained" color="primary" type="submit">
                            Guardar Cambios
                        </Button>
                        <Button variant="outlined" onClick={onClose}>
                            Cerrar
                        </Button>
                    </Grid>
                </form>
            </CardContent>
        </Card>
    );
};

export default FormEditEvento;
