import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { useWebSocketContext } from "../../WebSocket/useWebSocketContext";

const DashboardDesktop = ({
  groupedEquipos,
  handleOpenModal,
  getHoverColorByEstado,
  getColorByEstado,
  salas,
  estadoEquipos,
}) => {
  const { equiposConEventoNuevo } = useWebSocketContext();

  return (
    <>
      {Object.keys(groupedEquipos).map((siglas_servicio) => (
        <Box
          key={siglas_servicio}
          sx={{
            mb: 4,
            px: 2,
            py: 3,
            bgcolor: '#fdfdfd',
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: '#1565c0',
              mb: 2,
              borderLeft: '4px solid #90caf9',
              pl: 1,
            }}
          >
            {siglas_servicio}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 2,
            }}
          >
            {groupedEquipos[siglas_servicio]
              .filter((equipo) => equipo.tipo === "MODALITY")
              .map((equipo) => {
                const estado = estadoEquipos[equipo.id];
                const tieneEventoNuevo = equiposConEventoNuevo.includes(equipo.id);

                return (
                  <Box key={equipo.id} sx={{ position: 'relative' }}>
                    {tieneEventoNuevo && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: '#e53935',
                          color: 'white',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          px: 1,
                          py: '2px',
                          borderRadius: '6px',
                          zIndex: 2,
                          boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
                        }}
                      >
                        NUEVO EVENTO
                      </Box>
                    )}

                    <Card
                      onClick={() => handleOpenModal(equipo)}
                      sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                        backgroundColor: getColorByEstado(estado),
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: getHoverColorByEstado(estado),
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            fontSize: '14px',
                            color: '#263238',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {equipo.modelo}
                        </Typography>
                        {salas
                          .filter((s) => s.id_ubicacion === equipo.id_ubicacion)
                          .map((sala) => (
                            <Typography
                              key={sala.id}
                              variant="body2"
                              sx={{
                                mt: 0.5,
                                fontSize: '12px',
                                color: '#546e7a',
                              }}
                            >
                              {sala.sala} - {sala.filial}
                            </Typography>
                          ))}
                      </CardContent>
                    </Card>
                  </Box>
                );
              })}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default DashboardDesktop;
