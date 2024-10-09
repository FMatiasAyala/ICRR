import React from 'react';
import { Select, SelectItem } from "@nextui-org/react";

export function FilialFilter({ filialFilter, handleFilialChange, anuncio }) {
    const filiales = anuncio ? [...new Set(anuncio.map(a => a.servicio))] : [];
    return (
        <div>
            <p>Filtrar por filial:</p>
            <Select value={filialFilter} onChange={handleFilialChange} aria-label="filialFilter">
                <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                {filiales.map(filial => (
                    <SelectItem key={filial} value={filial} textValue={filial} aria-label={filial}>
                        {filial}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}
