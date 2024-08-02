import React from 'react';
import { Select, SelectItem } from "@nextui-org/react";

export function SectorFilter({ sectorFilter, handleFilterChange, anuncio }) {
    const sectores = anuncio ? [...new Set(anuncio.map(a => a.sector))] : [];
    return (
        <div>
            <p>Filtrar por sector:</p>
            <Select value={sectorFilter} onChange={handleFilterChange} aria-label="sectorFilter">
                <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                {sectores.map(sector => (
                    <SelectItem key={sector} value={sector} textValue={sector} aria-label={sector}>
                        {sector}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}


