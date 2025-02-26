import { Box, Button, Typography, Table, TableContainer, TableRow, TableHead,TableBody, TableCell, Paper } from "@mui/material";


const CurrentMaintenance = ({tecnicosEquipo, mantenimiento, handleTabChange}) => {

return (<Box sx={{ p: 3, bgcolor: '#f4f6f8', borderRadius: 2 }}>

            <Button
              onClick={() => handleTabChange('main')}
              sx={{
                mt: { xs: 1, md: 2 }, // Menos margen en móvil
                fontSize: { xs: '12px', md: '14px' }, // Texto más pequeño en móvil
                padding: { xs: '6px 10px', md: '10px 20px' }, // Padding menor en móvil
                width: { xs: '100%', sm: 'auto' }, // Ocupa todo el ancho en móviles
                color: '#ffffff',
                bgcolor: '#388e3c',
                '&:hover': { bgcolor: '#2e7d32' },
              }}
            >
              Volver a Detalles del Equipo
            </Button>
            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#388e3c', mb: 2 }}
            >
              Información del Técnico
            </Typography>

            {tecnicosEquipo.length > 0 && (


              tecnicosEquipo.map((tecnico) => <Box sx={{ mt: 3, p: 2, bgcolor: '#ffffff', borderRadius: 1, boxShadow: 1 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Nombre:</strong> {tecnico?.nombre || 'No disponible'} {tecnico?.apellido || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Empresa:</strong> {tecnico?.empresa || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Contacto:</strong> {tecnico?.numero || 'No disponible'}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Equipo que cubre:</strong> {tecnico?.cobertura || 'No disponible'}
                </Typography>
              </Box>)
            )
            }

            <Typography
              variant="h5"
              gutterBottom
              align="center"
              sx={{ color: '#004d99', mt: 4 }}
            >
              Historial de Mantenimientos
            </Typography>
            <TableContainer
              component={Paper}
              sx={{
                mt: 2,
                maxHeight: 300, // Para agregar scroll si hay muchos eventos
                overflowY: 'auto',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Comentario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#004d99' }}>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(mantenimiento.length > 0) ? (
                    mantenimiento
                      .slice() // Crear una copia del array para no mutarlo directamente
                      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)) // Ordenar por fecha descendente
                      .map((man) => (
                        <TableRow key={man.id_mantenimiento}>
                          <TableCell>{new Date(man.fecha).toLocaleDateString()}</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{man.tipo}</TableCell>
                          <TableCell>
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 'bold',
                              }}
                            >
                              {man.comentario || 'Sin comentario'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>{man.estado}</TableCell>

                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No hay mantenimiento disponibles.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>

              </Table>
            </TableContainer>
          </Box>
        )}


export default CurrentMaintenance;