import React, { useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Grid, Card,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

const ResumenEventosEquipo = ({ eventos, listaEquipos  }) => {
    console.log(listaEquipos)
    const resumenEventos = useMemo(() => {
        const porEquipo = {};

        eventos.forEach((e) => {
            const id = e.id_equipo;
            if (!e.desde) return;

            const fecha = new Date(e.desde);
            const yearMonth = `${fecha.getFullYear()}-${fecha.getMonth()}`;

            if (!porEquipo[id]) {
                porEquipo[id] = {
                    total: 0,
                    fechas: [],
                    meses: new Set(),
                };
            }

            porEquipo[id].total += 1;
            porEquipo[id].fechas.push(fecha);
            porEquipo[id].meses.add(yearMonth);
        });

        const result = {};

        for (const id in porEquipo) {
            const data = porEquipo[id];
            data.fechas.sort((a, b) => a - b);

            const intervalos = [];
            for (let i = 1; i < data.fechas.length; i++) {
                const diff = (data.fechas[i] - data.fechas[i - 1]) / (1000 * 60 * 60 * 24);
                intervalos.push(diff);
            }

            const promedioIntervalo = intervalos.length > 0
                ? Math.round(intervalos.reduce((a, b) => a + b) / intervalos.length)
                : '-';

            const promedioMensual = Math.round((data.total / data.meses.size) * 10) / 10;

            result[id] = {
                total: data.total,
                promedioMensual,
                promedioDiasEntreEventos: promedioIntervalo,
            };
        }

        return result;
    }, [eventos]);

    // 👇 Esta función usa la lista de equipos correctamente
    const obtenerNombreEquipo = (id_equipo) => {
        const idNormalizado = parseInt(id_equipo)
        const equipo = listaEquipos.find((e) => e.id === idNormalizado);
        return equipo ? equipo.modelo : `ID ${id_equipo}`;
    };

    const equiposIDs = Object.keys(resumenEventos);
    const nombresEquipos = equiposIDs.map(id => obtenerNombreEquipo(id));
    const totales = equiposIDs.map(id => resumenEventos[id].total);
    const diasEntreEventos = equiposIDs.map(id =>
        resumenEventos[id].promedioDiasEntreEventos === '-' ? 0 : resumenEventos[id].promedioDiasEntreEventos
    );

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="h6" align="center">Resumen de Eventos por Equipo</Typography>
            </Grid>

            <Grid item xs={12}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Equipo</strong></TableCell>
                                <TableCell align="right"><strong>Total Eventos</strong></TableCell>
                                <TableCell align="right"><strong>Prom. por Mes</strong></TableCell>
                                <TableCell align="right"><strong>Días entre Eventos</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {equiposIDs.map(id => {
                                const d = resumenEventos[id];
                                return (
                                    <TableRow key={id}>
                                        <TableCell>{obtenerNombreEquipo(id)}</TableCell>
                                        <TableCell align="right">{d.total}</TableCell>
                                        <TableCell align="right">{d.promedioMensual}</TableCell>
                                        <TableCell align="right">{d.promedioDiasEntreEventos}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle1" align="center">Eventos Totales por Equipo</Typography>
                    <BarChart
                        xAxis={[{ scaleType: 'band', data: nombresEquipos }]}
                        series={[{ data: totales, label: 'Eventos', color: '#1976d2' }]}
                        width={500}
                        height={300}
                    />
                </Card>
            </Grid>

            <Grid item xs={12} md={6}>
                <Card sx={{ p: 2 }}>
                    <Typography variant="subtitle1" align="center">Días Promedio entre Eventos</Typography>
                    <BarChart
                        xAxis={[{ scaleType: 'band', data: nombresEquipos }]}
                        series={[{ data: diasEntreEventos, label: 'Días', color: '#ff9800' }]}
                        width={500}
                        height={300}
                    />
                </Card>
            </Grid>
        </Grid>
    );
};

export default ResumenEventosEquipo;
