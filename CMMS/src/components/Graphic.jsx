import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Box,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { apiCantidadesEventos, apiEquipos } from '../utils/Fetch';


// Registrar elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

const Graphic = ({equipos, cantidadEventos}) => {
  const [isYearlyView, setIsYearlyView] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(1); // Mes por defecto: Enero



  // Relacionar el id_equipo de apiCantidadEventos con el nombre del equipo en apiEquipos
  const getChartData = () => {
    return cantidadEventos.map((cantidadEventos) => {
      const equipo = equipos.find((e) => e.id === cantidadEventos.id_equipo);
      return {
        name: equipo ? equipo.modelo : `Equipo ID ${cantidadEventos.id_equipo}`, // Mostrar nombre o ID del equipo
        value: cantidadEventos.cantidad_eventos, // Cantidad de eventos
      };
    });
  };

// Paleta de colores profesionales
const professionalColors = [
  '#1F77B4', // Azul
  '#FF7F0E', // Naranja
  '#2CA02C', // Verde
  '#D62728', // Rojo
  '#9467BD', // Púrpura
  '#8C564B', // Marrón
  '#7F7F7F', // Gris
  '#17BECF', // Cian
];

// Función que prepara los datos para el gráfico de torta
const prepareChartData = () => {
  const data = getChartData();

  // Selecciona colores de la paleta de forma aleatoria
  const backgroundColors = data.map(() => {
    return professionalColors[Math.floor(Math.random() * professionalColors.length)];
  });

  const hoverBackgroundColors = backgroundColors.map(color => {
    return color.replace(/[\d\.]+\)$/g, '0.8)'); // Cambia la opacidad a 0.8 para el hover
  });

  return {
    labels: data.map((d) => d.name), // Nombres de los equipos
    datasets: [
      {
        label: isYearlyView
          ? 'Cantidad de Eventos en el Año'
          : `Cantidad de Eventos en el Mes ${selectedMonth}`,
        data: data.map((d) => d.value), // Cantidades de eventos
        backgroundColor: backgroundColors,  // Colores de fondo de la paleta
        hoverBackgroundColor: hoverBackgroundColors,  // Colores para el hover
      },
    ],
  };
};



  // Manejar cambio de la vista (anual o por mes)
  const handleViewChange = (event) => {
    setIsYearlyView(event.target.checked);
  };

  // Manejar cambio de mes
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  return (
    <Box   sx={{ 
      textAlign: 'center', 
      backgroundColor: '#fff', // Fondo blanco para contrastar
      padding: '20px', // Espacio interno
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)', // Sombra sutil
      borderRadius: '12px', // Bordes redondeados
      maxWidth: '800px', // Tamaño máximo del contenedor
      margin: '20px auto', // Centramos horizontalmente y agregamos separación vertical
      border: '1px solid #e0e0e0' // Borde para darle un mejor acabado
    }}>
      <Typography variant="h5">Cantidad de Eventos por Equipo</Typography>

      {/* Checkbox para cambiar entre vista anual y por mes */}
      <FormControlLabel
        control={<Checkbox checked={isYearlyView} onChange={handleViewChange} />}
        label="Vista Anual"
      />

      {/* Selector de mes cuando se selecciona la vista mensual */}
      {!isYearlyView && (
        <Select value={selectedMonth} onChange={handleMonthChange} displayEmpty>
          <MenuItem value={1}>Enero</MenuItem>
          <MenuItem value={2}>Febrero</MenuItem>
          <MenuItem value={3}>Marzo</MenuItem>
          <MenuItem value={4}>Abril</MenuItem>
          <MenuItem value={5}>Mayo</MenuItem>
          <MenuItem value={6}>Junio</MenuItem>
          <MenuItem value={7}>Julio</MenuItem>
          <MenuItem value={8}>Agosto</MenuItem>
          <MenuItem value={9}>Septiembre</MenuItem>
          <MenuItem value={10}>Octubre</MenuItem>
          <MenuItem value={11}>Noviembre</MenuItem>
          <MenuItem value={12}>Diciembre</MenuItem>
        </Select>
      )}

      {/* Gráfico de torta */}
      <Box sx={{ width: '100%', maxWidth: 400, margin: '0 auto'}}>
        <Pie data={prepareChartData()} />
      </Box>
    </Box>
  );
};

export default Graphic;
