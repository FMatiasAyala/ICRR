import { useState, useEffect, Fragment } from "react";
import {
  Box, Typography, FormControl, InputLabel, Select, MenuItem,
  Paper, Tooltip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Collapse, Grid, Divider, Chip
} from "@mui/material";
import { apiContrato, apiEditContrato } from "../utils/Fetch";
import ContratoDownloadButton from '../hooks/ContratoDowloadButton';
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import EditContratoDialog from "./EditContratoDialog";

function formatAR(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(+d) ? "—" : d.toLocaleDateString("es-AR");
}

// clamp + tooltip sin tipos
function TextClamp({ text, lines = 2, maxWidth = '100%' }) {
  const value = text || '—';
  return (
    <Tooltip title={value} placement="top">
      <Typography
        variant="body2"
        sx={{
          maxWidth,
          display: '-webkit-box',
          WebkitLineClamp: lines,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          wordBreak: 'break-word',
          hyphens: 'auto',
        }}
      >
        {value}
      </Typography>
    </Tooltip>
  );
}

export default function CurrentContrato({ contratos = [] }) {
  const [orden, setOrden] = useState('desc');
  const [openRow, setOpenRow] = useState(null);
  const [editing, setEditing] = useState(null);
  const [contratosLocal, setContratosLocal] = useState(contratos);

  // sync props → state
  useEffect(() => {
    setContratosLocal(contratos || []);
  }, [contratos]);
  const contratosOrdenados = [...(contratosLocal || [])].sort((a, b) => {
    const fechaA = new Date(a.desde).getTime() || 0;
    const fechaB = new Date(b.desde).getTime() || 0;
    return orden === "asc" ? fechaA - fechaB : fechaB - fechaA;
  });

  const handleOpenEdit = (contrato) => setEditing(contrato);
  const handleCloseEdit = () => setEditing(null);

  const handleSaveEdit = async (id_contrato, payload) => {
    const url = `${apiEditContrato}${id_contrato}`;
    const r = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) throw new Error("EDIT_CONTRATO_FAIL");

    setContratosLocal(prev =>
      prev.map(c => c.id_contrato === id_contrato ? { ...c, ...payload } : c)
    );
    handleCloseEdit();
  };

  return (
    <Box sx={{ maxWidth: 2000, mx: "auto", mt: 4 }}>
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" fontWeight={600} color="#0d47a1">
          Contratos asociados
        </Typography>
        <FormControl size="small">
          <InputLabel>Ordenar</InputLabel>
          <Select value={orden} label="Ordenar" onChange={(e) => setOrden(e.target.value)}>
            <MenuItem value="desc">Más nuevos primero</MenuItem>
            <MenuItem value="asc">Más viejos primero</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {contratosOrdenados.length === 0 ? (
        <Typography variant="body1" align="center" sx={{ color: "#b71c1c", fontWeight: "bold", mt: 2 }}>
          No hay contratos disponibles.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 48 }} />
                  <TableCell sx={{ minWidth: 180 }}>Vigencia</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Partes</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Mano de Obra</TableCell>
                  <TableCell sx={{ minWidth: 260 }}>Descripción</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Actualización</TableCell>
                  <TableCell sx={{ width: 120, textAlign: 'center' }}>Acción</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {contratosOrdenados.map((c) => {
                  const isOpen = openRow === c.id_contrato;
                  return (
                    <Fragment key={c.id_contrato}>
                      <TableRow hover>
                        <TableCell sx={{ width: 48, p: 0 }}>
                          <IconButton size="small" onClick={() => setOpenRow(isOpen ? null : c.id_contrato)}>
                            {isOpen ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </IconButton>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatAR(c.desde)} → {formatAR(c.hasta)}
                          </Typography>
                        </TableCell>

                        <TableCell><TextClamp text={c.cobertura_partes} lines={2} /></TableCell>
                        <TableCell><TextClamp text={c.cobertura_manoDeObra} lines={2} /></TableCell>
                        <TableCell><TextClamp text={c.descripcion} lines={2} /></TableCell>
                        <TableCell><TextClamp text={c.actualizacion || '—'} lines={1} /></TableCell>

                        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                          <ContratoDownloadButton
                            endpoint={apiContrato}
                            params={{ id_contrato: c.id_contrato }}
                            nombreArchivo={`contrato-${c.id_contrato}.pdf`}
                            label="⬇️"
                            sx={{ minWidth: '36px', padding: '2px 4px', fontSize: '0.75rem', mr: 0.5 }}
                          />
                          <Tooltip title="Editar">
                            <IconButton size="small" onClick={() => handleOpenEdit(c)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={7} sx={{ py: 0, border: 0 }}>
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="caption" color="text.secondary">Descripción completa</Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', hyphens: 'auto', mt: 0.5 }}
                                  >
                                    {c.descripcion || '—'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="caption" color="text.secondary">Partes</Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                                    {c.cobertura_partes || '—'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Typography variant="caption" color="text.secondary">Mano de Obra</Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, wordBreak: 'break-word' }}>
                                    {c.cobertura_manoDeObra || '—'}
                                  </Typography>
                                </Grid>
                              </Grid>

                              <Divider sx={{ my: 1.5 }} />

                              <Grid container spacing={1}>
                                <Grid item><Chip size="small" label={`Desde: ${formatAR(c.desde)}`} /></Grid>
                                <Grid item><Chip size="small" label={`Hasta: ${formatAR(c.hasta)}`} /></Grid>
                                {c.actualizacion && (
                                  <Grid item><Chip size="small" label={`Act: ${c.actualizacion}`} /></Grid>
                                )}
                              </Grid>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {editing && (
        <EditContratoDialog
          open={!!editing}
          onClose={handleCloseEdit}
          contrato={editing}
          onSave={handleSaveEdit}
        />
      )}
    </Box>
  );
}
