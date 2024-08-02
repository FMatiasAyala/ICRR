import React from 'react';
import { Select, SelectItem } from '@nextui-org/react';

export function MesFilter({ mesFilter, handleMesChange }) {
    return (
        <div>
            <p>Filtrar por mes:</p>
            <Select value={mesFilter} onChange={handleMesChange} aria-label="monthFilter">
                <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                <SelectItem value="0" key="0" aria-label="Enero">Enero</SelectItem>
                <SelectItem value="1" key="1" aria-label="Febrero">Febrero</SelectItem>
                <SelectItem value="2" key="2" aria-label="Marzo">Marzo</SelectItem>
                <SelectItem value="3" key="3" aria-label="Abril">Abril</SelectItem>
                <SelectItem value="4" key="4" aria-label="Mayo">Mayo</SelectItem>
                <SelectItem value="5" key="5" aria-label="Junio">Junio</SelectItem>
                <SelectItem value="6" key="6" aria-label="Julio">Julio</SelectItem>
                <SelectItem value="7" key="7" aria-label="Agosto">Agosto</SelectItem>
                <SelectItem value="8" key="8" aria-label="Septiembre">Septiembre</SelectItem>
                <SelectItem value="9" key="9" aria-label="Octubre">Octubre</SelectItem>
                <SelectItem value="10" key="10" aria-label="Noviembre">Noviembre</SelectItem>
                <SelectItem value="11" key="11" aria-label="Diciembre">Diciembre</SelectItem>
            </Select>
        </div>
    );
}
