import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";

export function ObraSocialSearch({ obraSocialFilter, handleObraSocialChange }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [obraSocial, setObraSocial] = useState([]);
    useEffect(() => {
        const fetchObraSocial = async () => {
            if (searchTerm.length > 0) {
                try {
                    const response = await fetch(`http://192.168.1.53:3000/obrasociales/${searchTerm}`);
                    if (!response.ok) {
                        throw new Error('Error al obtener las obras sociales');
                    }
                    const data = await response.json();
                    setObraSocial(data);
                } catch (error) {
                    console.error('Error en la solicitud de datos de obras sociales:', error);
                }
            } else {
                setObraSocial([]);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchObraSocial();
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    return (
        <div>
            <p>Filtrar por obra social:</p>
            <Input
                clearable
                fullWidth
                placeholder="Buscar obra social"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
                value={obraSocialFilter}
                onChange={(e) => handleObraSocialChange(e.target.value)}
                aria-label="obraSocialFilter"
                placeholder="Selecciona una obra social"
                className='mt-2'
            >
                <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                {obraSocial.map(obra => (
                    <SelectItem
                        key={obra.codigo}
                        value={obra.codigo}
                        textValue={obra.razonSocial}
                        aria-label={obra.razonSocial}
                    >
                        {obra.razonSocial}
                    </SelectItem>
                ))}
            </Select>
        </div>
    );
}


