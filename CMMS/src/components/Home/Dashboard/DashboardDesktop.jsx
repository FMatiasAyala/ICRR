import React from "react"
import { Box, Typography, Card, CardContent } from "@mui/material"



const DashboardDesktop = ({ groupedEquipos, handleOpenModal, getHoverColorByEstado, getColorByEstado, salas, estadoEquipos }) => {

    return (
        <>
            {Object.keys(groupedEquipos).map((servicio) => {


                return (
                    <Box
                        key={servicio}
                        sx={{
                            gridColumn: 'span 1',
                            backgroundColor: '#f5f5f5',
                            p: 2,
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {servicio}
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: '16px',
                            }}
                        >
                            {groupedEquipos[servicio].filter((equipo) => equipo.tipo === 'MODALITY').map((equipo) => (
                                <Card
                                    key={equipo.id}
                                    onClick={() => handleOpenModal(equipo)}
                                    sx={{
                                        p: 2,
                                        cursor: "pointer",
                                        backgroundColor: getColorByEstado(estadoEquipos[equipo.id]),
                                        borderRadius: "12px",
                                        boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)",
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "scale(1.03)",
                                            boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.3)",
                                            backgroundColor: getHoverColorByEstado(estadoEquipos[equipo.id]),
                                        },
                                        "&:active": { transform: "scale(0.97)" },
                                    }}
                                >
                                    <CardContent sx={{ textAlign: "center", p: 2 }}>
                                        <Typography
                                            variant="body1"
                                            fontWeight="bold"
                                            sx={{ fontSize: "14px", color: "#333" }}
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
                                                        sx={{ fontSize: "12px", fontWeight: "bold" }}
                                                    >
                                                        {`${sala.sala} - ${sala.filial}`}
                                                    </Typography>
                                                ))}
                                    </CardContent>
                                </Card>

                            ))}
                        </Box>
                    </Box>

                )
            })}
        </>)

}


export default DashboardDesktop;