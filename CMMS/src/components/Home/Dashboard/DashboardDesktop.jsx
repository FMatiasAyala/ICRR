import React, { useMemo, useState } from "react";
import { Box, Typography, Card, CardContent, Button, Chip, Stack, Tooltip } from "@mui/material";
import { useWebSocketContext } from "../../WebSocket/useWebSocketContext";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import RemoveModeratorSharpIcon from '@mui/icons-material/RemoveModeratorSharp';

const ESTADOS_META = [
  {
    key: 'OPERATIVO',
    label: 'Operativos',
    icon: (active) => <CheckCircleIcon sx={{ fontSize: 36, color: active ? '#1b5e20' : '#2e7d32' }} />,
    bg: '#e8f5e9',
    color: '#1b5e20',
  },
  {
    key: 'NO OPERATIVO',
    label: 'No Operativos',
    icon: (active) => <ReportProblemIcon sx={{ fontSize: 36, color: active ? '#b71c1c' : '#c62828' }} />,
    bg: '#ffebee',
    color: '#b71c1c',
  },
  {
    key: 'REVISION',
    label: 'En Revisión',
    icon: (active) => <BuildCircleIcon sx={{ fontSize: 36, color: active ? '#f57f17' : '#f9a825' }} />,
    bg: '#fffde7',
    color: '#f57f17',
  },
];

const DashboardDesktop = ({
  groupedEquipos,
  handleOpenModal,
  getHoverColorByEstado,
  getColorByEstado,
  salas,
  estadoEquipos,
  showResumen = true,
  estadoSeleccionado: controlledEstado,
  onEstadoSeleccionadoChange,
  allContratos = [],
}) => {
  const { equiposConEventoNuevo } = useWebSocketContext();

  const [uncontrolledEstado, setUncontrolledEstado] = useState(null);
  const estadoSeleccionado = controlledEstado ?? uncontrolledEstado;
  const setEstadoSeleccionado = onEstadoSeleccionadoChange ?? setUncontrolledEstado;

  // Index por equipo para lookup O(1)
  const contratosByEquipo = React.useMemo(() => {
    const m = new Map();
    for (const c of allContratos) {
      const id = c.id_equipo ?? c.equipo_id ?? c.equipoId;
      if (!id) continue;
      if (!m.has(id)) m.set(id, []);
      m.get(id).push(c);
    }
    return m;
  }, [allContratos]);

  const parseDate = (d) => (d instanceof Date ? d : d ? new Date(d) : null);

  // detecta si un contrato está activo por fechas (inicio/fin flexibles)
  const isContratoVigente = (c, ahora = new Date()) => {
    const desde = parseDate(c.desde ?? c.fecha_desde ?? c.inicio ?? c.fecha_inicio);
    const hasta = parseDate(c.hasta ?? c.fecha_hasta ?? c.fin ?? c.fecha_fin ?? c.vigenciaHasta);
    const okDesde = !desde || ahora >= desde;
    const okHasta = !hasta || ahora <= hasta;
    // si tenés un booleano c.vigente, también podrías: return c.vigente && okDesde && okHasta;
    return okDesde && okHasta;
  };

  // devuelve estado del contrato para un equipo
  const getEstadoContrato = (equipoId) => {
    const lista = contratosByEquipo.get(equipoId) || [];
    if (!lista.length) return { estado: 'SIN' };

    const ahora = new Date();
    const vigente = lista.find(c => isContratoVigente(c, ahora));
    if (vigente) return { estado: 'VIGENTE', contrato: vigente };

    // si ninguno vigente, consideramos vencido (tomamos el más reciente por fin)
    const ordenados = [...lista].sort((a, b) => {
      const fa = parseDate(a.hasta ?? a.fecha_hasta ?? a.fin ?? a.fecha_fin) ?? new Date(0);
      const fb = parseDate(b.hasta ?? b.fecha_hasta ?? b.fin ?? b.fecha_fin) ?? new Date(0);
      return fb - fa;
    });
    return { estado: 'VENCIDO', contrato: ordenados[0] };
  };



  // ---- Conteos por estado (memo)
  const { countOperativo, countNoOperativo, countRevision } = useMemo(() => {
    const values = Object.values(estadoEquipos || {});
    return {
      countOperativo: values.filter(v => v === 'OPERATIVO').length,
      countNoOperativo: values.filter(v => v === 'NO OPERATIVO').length,
      countRevision: values.filter(v => v === 'REVISION').length,
    };
  }, [estadoEquipos]);




  const countsByKey = {
    'OPERATIVO': countOperativo,
    'NO OPERATIVO': countNoOperativo,
    'REVISION': countRevision,
  };

  // ---- Helper para saber si un equipo pasa el filtro actual
  const pasaFiltro = (equipoId) => {
    if (!estadoSeleccionado) return true;
    return estadoEquipos?.[equipoId] === estadoSeleccionado;
  };

  // ---- Para evitar duplicados por id al renderizar por servicio
  const renderEquiposDeServicio = (siglas_servicio) => {
    const yaVistos = new Set(); // por grupo/servicio
    return (groupedEquipos[siglas_servicio] || [])
      .filter((equipo) => equipo.tipo === "MODALITY")
      .filter((equipo) => {
        if (yaVistos.has(equipo.id)) return false;
        yaVistos.add(equipo.id);
        return true;
      })
      .filter((equipo) => pasaFiltro(equipo.id))
      .map((equipo) => {
        const estado = estadoEquipos?.[equipo.id];
        const tieneEventoNuevo = equiposConEventoNuevo.includes(equipo.id);
        const { estado: estadoContrato } = getEstadoContrato(equipo.id);

        return (
          <Box key={equipo.id} sx={{ position: 'relative' }}>
            <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 3 }}>
              <Tooltip
                title={
                  estadoContrato === 'VIGENTE'
                    ? 'Contrato vigente'
                    : estadoContrato === 'VENCIDO'
                      ? 'Contrato vencido'
                      : 'Sin contrato'
                }
                arrow
              >
                <span>
                  {estadoContrato === 'VIGENTE' ? (
                    <GppGoodIcon sx={{ fontSize: 22 }} color="primary" />
                  ) : estadoContrato === 'VENCIDO' ? (
                    <GppBadIcon sx={{ fontSize: 22 }} color="error" />
                  ) : (
                    <RemoveModeratorSharpIcon sx={{ fontSize: 22 }} color="disabled" />
                  )}
                </span>
              </Tooltip>
            </Box>
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
                  .slice(0, 1) // por las dudas si hay más de una coincidencia
                  .map((sala) => (
                    <Typography
                      key={sala.id}
                      variant="body2"
                      sx={{ mt: 0.5, fontSize: '12px', color: '#546e7a' }}
                    >
                      {sala.sala} - {sala.filial}
                    </Typography>
                  ))}
              </CardContent>
            </Card>
          </Box>
        );
      });
  };

  return (
    <>
      {/* ---- Cards resumen con filtro por click ---- */}
      {showResumen && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ px: 1, pt: 1, gap: 1 }}>
          <Box display="flex" flexDirection="row" alignItems="center" sx={{ px: 1, pt: 1, gap: 2 }}>
            {ESTADOS_META.map(({ key, label, icon, bg, color }) => {
              const active = estadoSeleccionado === key;
              return (
                <Card
                  key={key}
                  onClick={() => setEstadoSeleccionado(prev => (prev === key ? null : key))}
                  sx={{
                    backgroundColor: bg,
                    borderRadius: 3,
                    boxShadow: 3,
                    mb: 2,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
                    cursor: 'pointer',
                    border: active ? `2px solid ${color}` : '2px solid transparent',
                    '&:hover': { transform: 'scale(1.01)', boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2, px: 2 }}>
                    {icon(active)}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#333', mt: 0.5 }}>
                        {countsByKey[key] ?? 0} equipos
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          <Box>
            {estadoSeleccionado && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1, pb: 1 }}>
                <Chip label={`Filtrando por: ${estadoSeleccionado}`} color="primary" variant="outlined" />
                <Button onClick={() => setEstadoSeleccionado(null)} size="small">Quitar filtro</Button>
              </Stack>
            )}
          </Box>
        </Box>
      )}


      {/* ---- Grillas por servicio ---- */}
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
            {renderEquiposDeServicio(siglas_servicio)}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default DashboardDesktop;
