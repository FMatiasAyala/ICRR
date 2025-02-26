import { Box, Typography, Table, TableBody, TableHead, TableCell, TableRow, TableContainer, Button, Paper } from "@mui/material";





const CurrentEvents = ({eventos, handleTabChange, estadoActual}) => {
    const obtenerColorEstado = (estado) => {
        switch (estado) {
          case 'OPERATIVO':
            return { bgColor: '#c8e6c9', borderColor: '#43a047', textColor: '#2e7d32' }; // Verde
          case 'REALIZADO':
            return { bgColor: '#c8e6c9', borderColor: '#43a047', textColor: '#2e7d32' };
          // Verde
          case 'NO OPERATIVO':
            return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' }; // Rojo
          case 'PROGRAMADO':
            return { bgColor: '#ffcdd2', borderColor: '#e53935', textColor: '#b71c1c' }; // Rojo
          default:
            return { bgColor: '#e0e0e0', borderColor: '#757575', textColor: '#424242' }; // Gris
        }
      };
      const { bgColor, borderColor, textColor } = obtenerColorEstado(estadoActual);


    return (
        <Box>
            <Typography variant="h5" gutterBottom align="center" sx={{ color: '#004d99' }}>
                Historial de Eventos
            </Typography>
            <Button onClick={() => handleTabChange('main')} sx={{ mt: 4 }}>
                Volver a Detalles del Equipo
            </Button>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {eventos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2}>No hay eventos disponibles.</TableCell>
                            </TableRow>
                        ) : (
                            eventos.map((evento) => (
                                <TableRow key={evento.id}>
                                    <TableCell>{new Date(evento.desde).toLocaleDateString()}</TableCell>
                                    <TableCell>{evento.descripcion}</TableCell>
                                    <TableCell>
                                        <Typography variant="body1" sx={{ color: textColor }}>
                                            {evento.estado}
                                        </Typography>

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

        </Box>
    )

}


export default CurrentEvents;