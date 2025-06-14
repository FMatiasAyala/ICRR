import React from "react";
import {Accordion, AccordionSummary, AccordionDetails, Card, CardContent, Box, Typography} from "@mui/material";
import { CheckCircle, Cancel, ReportProblem } from '@mui/icons-material';


const DashboardMobile = ({groupedEquipos, salas, handleOpenModal, getColorByEstado, getHoverColorByEstado, estadoEquipos}) => {



    return (
        <>
            {Object.keys(groupedEquipos).map((siglas_servicio) => {
                const equiposEnServicio = groupedEquipos[siglas_servicio] || [];
                const countOperativo = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'OPERATIVO').length;
                const countNoOperativo = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'NO OPERATIVO').length;
                const countRevision = equiposEnServicio.filter((equipo) => estadoEquipos[equipo.id] === 'REVISION').length;

               return (<Accordion>
                    <AccordionSummary>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {siglas_servicio} -
                        </Typography>
                        <CheckCircle sx={{ color: '#4CAF50' }} />
                        <Typography>{countOperativo}</Typography>
                        <Cancel sx={{ color: '#F44336' }} />
                        <Typography>{countNoOperativo}</Typography>
                        <ReportProblem sx={{ color: '#FFB74D' }} />
                        <Typography>{countRevision}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box
                            key={siglas_servicio}
                            sx={{
                                gridColumn: 'span 1',
                                backgroundColor: '#f5f5f5',
                                p: 2,
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                    gap: '16px',
                                }}
                            >
                                {groupedEquipos[siglas_servicio].filter((equipo) => equipo.tipo === 'MODALITY').map((equipo) => (
                                    <Card
                                        key={equipo.id}
                                        onClick={() => handleOpenModal(equipo)}
                                        sx={{
                                            p: 2,
                                            cursor: 'pointer',
                                            '&:hover': { backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]) },
                                            height: 'auto',
                                            minWidth: { xs: '100%', sm: '180px' },
                                            minHeight: '120px',
                                            backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                                            borderRadius: '8px',
                                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                            transition: 'transform 0.2s ease-in-out',
                                            '&:active': { transform: 'scale(0.98)' },
                                        }}
                                    >
                                        <CardContent sx={{ padding: '8px' }}>
                                            <Typography variant="body2" align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '14px', sm: '12px' } }}>
                                                {equipo.modelo}
                                            </Typography>
                                            {salas &&
                                                salas
                                                    .filter((sala) => sala.id_ubicacion === equipo.id_ubicacion)
                                                    .map((sala) => (
                                                        <Typography
                                                            key={sala.id_ubicacion}
                                                            variant="body2"
                                                            color="text.secondary"
                                                            fontSize={{ xs: '12px', sm: '10px' }}
                                                            fontWeight="bold"
                                                        >
                                                            {`${sala.sala} - ${sala.filial}`}
                                                        </Typography>
                                                    ))}
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>)
            })}

        </>
    )
}

export default DashboardMobile;