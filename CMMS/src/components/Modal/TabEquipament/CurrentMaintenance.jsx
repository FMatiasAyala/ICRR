import {
  Box,
  Typography,
  Divider,
  Alert,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Chip
} from "@mui/material";

const CurrentMaintenance = ({ mantenimiento }) => {
  const mantenimientosFuturos = mantenimiento
    .filter((man) =>
      ['programado', 'postergado'].includes(man.estado.toLowerCase())
    )
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const mantenimientosRealizados = mantenimiento
    .filter((man) => man.estado.toLowerCase() === 'realizado')
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  const proximoMantenimiento =
    mantenimientosFuturos.length > 0 ? mantenimientosFuturos[0] : null;

  return (
    <Box sx={{ p: 4, bgcolor: '#fafafa', borderRadius: 3 }}>
      {/* Banner del próximo mantenimiento */}
      {proximoMantenimiento && (
        <Alert
          severity="info"
          sx={{
            mb: 4,
            bgcolor: '#e3f2fd',
            borderLeft: '6px solid #1976d2',
            fontWeight: 500,
            color: '#0d47a1',
          }}
        >
          Próximo mantenimiento <strong>({proximoMantenimiento.estado})</strong>:{' '}
          <strong>{new Date(proximoMantenimiento.fecha).toLocaleDateString('es-AR')}</strong> –{' '}
          {proximoMantenimiento.tipo}
        </Alert>
      )}

      <Typography
        variant="h5"
        align="center"
        sx={{ color: '#0d47a1', fontWeight: 600, mb: 4 }}
      >
        🛠️ Historial de Mantenimientos
      </Typography>

      <Grid container spacing={3}>
        {mantenimientosRealizados.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              No hay mantenimientos realizados.
            </Typography>
          </Grid>
        ) : (
          mantenimientosRealizados.map((man) => (
            <Grid item xs={12} sm={6} md={4} key={man.id_mantenimiento}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: 4,
                  bgcolor: '#ffffff',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardHeader
                  title={man.tipo}
                  subheader={new Date(man.fecha).toLocaleDateString('es-AR')}
                  sx={{
                    bgcolor: '#f1f8e9',
                    color: '#33691e',
                    fontWeight: 600,
                  }}
                />
                <CardContent>
                  <Chip
                    label={man.estado.toUpperCase()}
                    color="success"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Divider sx={{ mb: 2 }} />
                  {man.detalle && (
                    <Typography variant="body2" gutterBottom>
                      <strong>Detalle:</strong> {man.detalle}
                    </Typography>
                  )}
                  {man.comentario && (
                    <Typography variant="body2">
                      <strong>Comentario:</strong> {man.comentario}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default CurrentMaintenance;
