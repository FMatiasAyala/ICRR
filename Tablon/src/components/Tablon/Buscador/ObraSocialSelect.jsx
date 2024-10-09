import React, { useState, useEffect } from 'react';
import { Input, Select, SelectItem } from "@nextui-org/react";

export function ObraSocialSelect({ handleObraSocial }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [obraSocial, setObraSocial] = useState([]);
    const [selectedObra, setSelectedObra] = useState({ codigo: '', razonSocial: '' });

    useEffect(() => {
        const fetchObraSocial = async () => {
            if (searchTerm.length > 0) {
                try {
                    const response = await fetch(`http://192.168.1.6:3000/tablon/obrasociales/${searchTerm}`);
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

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        const selectedObra = obraSocial.find(obra => obra.codigo === selectedId);
        if (selectedObra) {
            setSelectedObra({
                codigo: selectedObra.codigo,
                razonSocial: selectedObra.razonSocial,
            });
            handleObraSocial(selectedObra); // Llamar al prop `handleObraSocialChange`
        }
    };

    // Reset selectedObra when searchTerm changes and doesn't match any options
    useEffect(() => {
        if (obraSocial.length === 0 && searchTerm === '') {
            setSelectedObra({ codigo: '', razonSocial: '' });
            handleObraSocial({ codigo: '', razonSocial: '' });
        }
    }, [obraSocial, searchTerm]);

    return (
        <div>
            <Input
                clearable
                fullWidth
                placeholder="Buscar obra social"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
                value={selectedObra.codigo}
                onChange={handleSelectChange}
                aria-label="obraSocialFilter"
                placeholder="Selecciona una obra social"
                className='mt-2'
            >
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

