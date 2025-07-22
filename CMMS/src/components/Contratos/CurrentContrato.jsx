import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { apiContrato } from "../utils/Fetch";
import ContratoDownloadButton from '../hooks/ContratoDowloadButton'


const CurrentContrato = ({ contratos }) => {
  const [orden, setOrden] = useState("desc");

  const ordenarContratos = (lista) => {
    return [...lista].sort((a, b) => {
      const fechaA = new Date(a.desde);
      const fechaB = new Date(b.desde);
      return orden === "asc" ? fechaA - fechaB : fechaB - fechaA;
    });
  };

  const contratosOrdenados = ordenarContratos(contratos);

  return (
    <Box sx={{ maxWidth: 2000, mx: "auto", mt: 4 }}>
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight={600} color="#0d47a1">
          Contratos asociados
        </Typography>

        <FormControl size="small">
          <InputLabel>Ordenar</InputLabel>
          <Select
            value={orden}
            label="Ordenar"
            onChange={(e) => setOrden(e.target.value)}
          >
            <MenuItem value="desc">Más nuevos primero</MenuItem>
            <MenuItem value="asc">Más viejos primero</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {contratosOrdenados.length === 0 ? (
        <Typography
          variant="body1"
          align="center"
          sx={{ color: "#b71c1c", fontWeight: "bold", mt: 2 }}
        >
          No hay contratos disponibles.
        </Typography>
      ) : (
        <Paper sx={{ border: "1px solid #ccc", borderRadius: 2, p: 2 }}>
          {/* CABECERA */}
          <Grid container spacing={2} sx={{ fontWeight: 500, mb: 1}}>
            <Grid item xs={2}>Vigencia</Grid>
            <Grid item xs={2}>Partes</Grid>
            <Grid item xs={2}>Mano de Obra</Grid>
            <Grid item xs={3}>Descripción</Grid>
            <Grid item xs={2}>Actualización</Grid>
            <Grid item xs={1} textAlign="center">Acción</Grid>
          </Grid>

          <Divider sx={{ mb: 1 }} />

          {/* FILAS */}
          {contratosOrdenados.map((contrato) => (
            <Grid
              container
              spacing={1}
              key={contrato.id_contrato}
              sx={{
                py: 1,
                borderBottom: "1px dashed #ccc",
                alignItems: "center",
              }}
            >
              <Grid item xs={2}>
                <Typography variant="body2">
                  {new Date(contrato.desde).toLocaleDateString("es-AR")} → {new Date(contrato.hasta).toLocaleDateString("es-AR")}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">{contrato.cobertura_partes}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">{contrato.cobertura_manoDeObra}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  }}
                  title={contrato.descripcion}
                >
                  {contrato.descripcion}
                </Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography variant="body2">
                  {contrato.actualizacion || '—'}
                </Typography>
              </Grid>
              <Grid item xs={1} textAlign="center">
                <ContratoDownloadButton
                  endpoint={apiContrato}
                  params={{ id_contrato: contrato.id_contrato }}
                  nombreArchivo={`contrato-${contrato.id_contrato}.pdf`}
                  label="⬇️"
                  sx={{ minWidth: '36px', padding: '2px 4px', fontSize: '0.75rem' }}
                />
              </Grid>
            </Grid>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default CurrentContrato;
