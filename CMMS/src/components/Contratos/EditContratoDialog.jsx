import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Grid, Alert
} from "@mui/material";
import { useMemo, useState } from "react";

export default function EditContratoDialog({ open, onClose, contrato, onSave }) {
  const [form, setForm] = useState(() => ({
    descripcion: contrato.descripcion || "",
    cobertura_partes: contrato.cobertura_partes || "",
    cobertura_manoDeObra: contrato.cobertura_manoDeObra || "",
    desde: contrato.desde ? contrato.desde.slice(0, 10) : "",
    hasta: contrato.hasta ? contrato.hasta.slice(0, 10) : "",
    actualizacion: contrato.actualizacion || "",
  }));
  const [error, setError] = useState("");

  const invalidDates = useMemo(() => {
    if (!form.desde || !form.hasta) return false;
    const d1 = new Date(form.desde);
    const d2 = new Date(form.hasta);
    return isFinite(+d1) && isFinite(+d2) && d2 < d1;
  }, [form.desde, form.hasta]);

  const handleChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setError("");
    if (invalidDates) {
      setError("La fecha 'hasta' no puede ser menor que 'desde'.");
      return;
    }
    try {
      await onSave(contrato.id_contrato, form);
    } catch (e) {
      setError("No se pudo guardar. Probá de nuevo.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar contrato #{contrato.id_contrato}</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Cobertura (Partes)"
              fullWidth
              value={form.cobertura_partes}
              onChange={handleChange("cobertura_partes")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Cobertura (Mano de Obra)"
              fullWidth
              value={form.cobertura_manoDeObra}
              onChange={handleChange("cobertura_manoDeObra")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Descripción"
              fullWidth
              multiline
              minRows={2}
              value={form.descripcion}
              onChange={handleChange("descripcion")}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              label="Desde"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.desde}
              onChange={handleChange("desde")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              type="date"
              label="Hasta"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={form.hasta}
              error={invalidDates}
              helperText={invalidDates ? "Debe ser mayor o igual a 'Desde'." : ""}
              onChange={handleChange("hasta")}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Actualización"
              fullWidth
              value={form.actualizacion}
              onChange={handleChange("actualizacion")}
              placeholder="p.ej. índice, ajuste, notas breves"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}
