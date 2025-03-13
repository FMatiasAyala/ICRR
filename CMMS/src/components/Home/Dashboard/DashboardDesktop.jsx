import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

const DashboardDesktop = ({ groupedEquipos, handleOpenModal, getHoverColorByEstado, getColorByEstado, salas, estadoEquipos }) => {
    return (
        <>
            {Object.keys(groupedEquipos).map((servicio) => (
                <Box
                    key={servicio}
                    sx={{
                        gridColumn: 'span 1',
                        backgroundColor: '#fafafa',
                        p: 1.5,
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: "#444", pb: 1 }}>
                        {servicio}
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                            gap: '12px',
                        }}
                    >
                        {groupedEquipos[servicio]
                            .filter((equipo) => equipo.tipo === 'MODALITY')
                            .map((equipo) => (
                                <Card
                                    key={equipo.id}
                                    onClick={() => handleOpenModal(equipo)}
                                    sx={{
                                        cursor: "pointer",
                                        backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                                        borderRadius: "8px",
                                        boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.15)",
                                        transition: "transform 0.2s ease-in-out",
                                        "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                                            backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]),
                                        },
                                        "&:active": { transform: "scale(0.98)" },
                                    }}
                                >
                                    <CardContent sx={{ textAlign: "center", p: 1.5 }}>
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            sx={{ fontSize: "13px", color: "#222" }}
                                        >
                                            {equipo.modelo}
                                        </Typography>
                                        {salas &&
                                            salas
                                                .filter((sala) => sala.id_sala === equipo.sala)
                                                .map((sala) => (
                                                    <Typography
                                                        key={sala.id}
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ fontSize: "11px", fontWeight: "500", mt: 0.5 }}
                                                    >
                                                        {`${sala.sala} - ${sala.filial}`}
                                                    </Typography>
                                                ))}
                                    </CardContent>
                                </Card>
                            ))}
                    </Box>
                </Box>
            ))}
        </>
    );
};

export default DashboardDesktop;
