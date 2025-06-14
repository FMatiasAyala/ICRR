import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  /* Soy un comebala -Señor Mmmmmmmatias */
  Typography,
  InputLabel,
  MenuItem,
  Select,
  FormControl
} from "@mui/material";
import { format, differenceInHours, differenceInMinutes } from "date-fns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { apiReportEventos } from "../utils/Fetch";



const FiltrosReportes = ({ equipos, salas }) => {
  const [filtros, setFiltros] = useState({
    estado: "",
    id_equipo: [],
    servicio: "",
    fechaDesde: null,
    fechaHasta: null,
  });

  const [resultados, setResultados] = useState([]);
  const [orden, setOrden] = useState({ columna: "", direccion: "asc" });

  const handleBuscar = async () => {
    const { fechaDesde, fechaHasta } = filtros;

    const filtrosFormateados = {
      id_equipo: filtros.id_equipo.length === 1 ? filtros.id_equipo[0] : "todos",
      estado: filtros.estado || "todos",
      desde: fechaDesde ? format(fechaDesde, "yyyy-MM-dd") : null,
      hasta: fechaHasta ? format(fechaHasta, "yyyy-MM-dd") : null,
    };

    try {
      const response = await fetch(apiReportEventos, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtrosFormateados),
      });

      if (!response.ok) {
        throw new Error("Error al obtener los eventos desde la URL");
      }

      const data = await response.json();
      setResultados(data);
    } catch (error) {
      console.error("Error al obtener los eventos:", error);
      setResultados([]);
    }
  };

  const obtenerNombreEquipo = (id_equipo) => {
    const equipo = equipos.find((e) => e.id === id_equipo);
    return equipo ? equipo.modelo : "Equipo no encontrado";
  };
  const ordenarResultados = (columna) => {
    const nuevaDireccion =
      orden.columna === columna && orden.direccion === "asc" ? "desc" : "asc";
    setOrden({ columna, direccion: nuevaDireccion });

    const resultadosOrdenados = [...resultados].sort((a, b) => {
      let valorA, valorB;

      if (columna === "tiempo") {
        const hastaA = a.hasta ? new Date(a.hasta) : new Date();
        const hastaB = b.hasta ? new Date(b.hasta) : new Date();
        /* Soy un comebala -Señor Mmmmmmmatias */
        const desdeA = new Date(a.desde);
        const desdeB = new Date(b.desde);
        valorA = differenceInMinutes(hastaA, desdeA);
        valorB = differenceInMinutes(hastaB, desdeB);
      } else {
        valorA = a[columna] ? new Date(a[columna]) : new Date(0);
        valorB = b[columna] ? new Date(b[columna]) : new Date(0);
      }

      return nuevaDireccion === "asc" ? valorA - valorB : valorB - valorA;
    });

    setResultados(resultadosOrdenados);
  };


  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        Reporte de Eventos
      </Typography>
      <Paper sx={{ p: 1, mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <FormControl sx={{ m: 1, width: 300 }}>
            <InputLabel>Condición</InputLabel>
            <Select
              
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            >
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="operativo">Operativo</MenuItem>
              <MenuItem value="no operativo">No Operativo</MenuItem>
              <MenuItem value="revision">Revisión</MenuItem>
            </Select>
          </FormControl>

          <Autocomplete
            options={equipos}
            getOptionLabel={(option) =>
              `${option.modelo} - ${option.servicio} (${salas.find((sala) => sala.id_sala === option.sala)?.sala || "Desconocida"})`
            }
            onChange={(event, newValue) =>
              setFiltros({ ...filtros, id_equipo: newValue ? [newValue.id] : [] })
            }
            renderInput={(params) => (
              <TextField {...params} label="Seleccionar Equipo" margin="normal" size="small" />
            )}
            sx={{ minWidth: 300 }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Desde"
              /* Soy un comebala -Señor Mmmmmmmatias */
              value={filtros.fechaDesde}
              onChange={(nuevaFecha) => setFiltros({ ...filtros, fechaDesde: nuevaFecha })}
              renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 150 }} />}
            />
            <DatePicker
              label="Hasta"
              value={filtros.fechaHasta}
              onChange={(nuevaFecha) => setFiltros({ ...filtros, fechaHasta: nuevaFecha })}
              renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: 150 }} />}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            color="primary"
            onClick={handleBuscar}
            sx={{ height: "40px", mt: { xs: 1, sm: 0 } }}
          >
            Buscar
          </Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          Resultados de Eventos
        </Typography>
        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: "#1976d2" }}>
              <TableRow>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Estado</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Equipo</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Descripcion</TableCell>
                <TableCell onClick={() => ordenarResultados("desde")} sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                  Desde
                </TableCell>
                <TableCell onClick={() => ordenarResultados("hasta")} sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                  Hasta
                </TableCell>
                <TableCell onClick={() => ordenarResultados("tiempo")} sx={{ cursor: "pointer", color: "#fff", fontWeight: "bold" }}>
                  Tiempo
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultados.length > 0 ? (
                resultados.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.estado}</TableCell>
                    <TableCell>{obtenerNombreEquipo(item.id_equipo)}</TableCell>
                    <TableCell
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        maxWidth: 300, // o el ancho que prefieras
                      }}
                    >
                      {item.descripcion || "Sin servicio"}
                    </TableCell>

                    <TableCell>
                      {item.desde ? format(new Date(item.desde), "yyyy-MM-dd") : "Sin fecha"}
                    </TableCell>
                    <TableCell>
                      {format(item.hasta ? new Date(item.hasta) : new Date(), "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      {item.desde ? (() => {
                        const fechaDesde = new Date(item.desde);
                        const fechaHasta = item.hasta ? new Date(item.hasta) : new Date(); // Usa la actual si no hay "hasta"
                        const diffMins = differenceInMinutes(fechaHasta, fechaDesde);
                        const dias = Math.floor(diffMins / 1440);
                        const horas = Math.floor((diffMins % 1440) / 60);
                        const minutos = diffMins % 60;
                        return `${dias}d ${horas}h ${minutos}m${!item.hasta ? " (en curso)" : ""}`;
                      })() : "Sin datos"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay resultados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default FiltrosReportes;
