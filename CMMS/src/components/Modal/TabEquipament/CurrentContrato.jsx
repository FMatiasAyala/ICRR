import { Box, Typography, Grid, Button  } from "@mui/material";
import FileDownloadButton from "../../hooks/FileDownloadButton";






const CurrentContrato = ({contratos, equipo, handleTabChange}) => {


return (
    <Box
            sx={{
              p: 3,
              bgcolor: '#e3f2fd',
              boxShadow: 3,
              borderRadius: '12px',
              border: '2px solid #1565c0',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#0d47a1', fontWeight: 'bold', mb: 3 }}
            >
              Detalles del Contrato
            </Typography>

            {contratos.length === 0 ? (

              <Typography
                variant="body1"
                align="center"
                sx={{ color: '#b71c1c', fontWeight: 'bold', mt: 2 }}
              >
                No hay datos del contrato disponibles.
              </Typography>
            ) : (
              contratos.map((contrato) => (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '1rem',
                          color: '#0d47a1',
                          fontWeight: '500',
                        }}
                      >
                        <strong>Observacion:</strong> {contrato.descripcion}
                      </Typography>
                    </Box>

                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Actualizacion:</strong> {contrato.actualizacion}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Cobertura partes:</strong> {contrato.cobertura_partes}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Cobertura mano de obra:</strong> {contrato.cobertura_manoDeObra}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >

                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Desde:</strong> {new Date(contrato.desde).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        p: 2,
                        mb: 2,
                        bgcolor: '#bbdefb',
                        borderRadius: '8px',
                        borderLeft: '5px solid #1565c0',
                        boxShadow: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{
                            fontSize: '1rem',
                            color: '#0d47a1',
                            fontWeight: '500',
                          }}
                        >
                          <strong>Hasta:</strong> {new Date(contrato.hasta).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              ))
            )}

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 4,
              }}
            >
              <FileDownloadButton equipo={equipo} />
              <Button
                onClick={() => handleTabChange('main')}
                variant="contained"
                sx={{
                  bgcolor: '#1565c0',
                  color: '#fff',
                  ':hover': { bgcolor: '#0d47a1' },
                  borderRadius: '8px',
                  ml: 2,
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>

)

}

export default CurrentContrato;





