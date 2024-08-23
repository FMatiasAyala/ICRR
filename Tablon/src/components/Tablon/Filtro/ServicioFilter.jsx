import React from 'react';
import { Select, SelectItem } from "@nextui-org/react";

export function ServicioFilter({ servicioFilter, handleFilterChange, anuncio }) {
    const servicios = anuncio ? [...new Set(anuncio.map(a => a.servicio))] : [];
    return (
        <div>
            <p>Filtrar por servicio:</p>
            <Select value={servicioFilter} onChange={handleFilterChange} aria-label="servicioFilter">
                <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                {servicios.map(servicio => (
                    <SelectItem key={servicio} value={servicio} textValue={servicio} aria-label={servicio}>
                        {servicio}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}


