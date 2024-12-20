import React, { useState, useEffect } from "react";
import { Input, Button, Textarea, Select, SelectItem } from '@nextui-org/react';

function EditAnuncio({ anuncio, onSave, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
    });


    const tiposAnuncio = {
        'Alta': 'Alta de servicio',
        'Baja': 'Suspensión de servicio',
        'Notificacion': 'Notificación'
      };


    useEffect(() => {
        if (anuncio) {
            setFormData({
                title: anuncio.title,
                content: anuncio.content,
                tipo: anuncio.tipo,
            });
        }
    }, [anuncio]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (anuncio) {
            onSave(anuncio.id, formData);
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    if (!anuncio) {
        return <div>Cargando...</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 flex-col">
            <Input
                isRequired
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="flat"
                labelPlacement="outside"
                label="Título"
                placeholder="Titulo..."
            />
            <Textarea
                isRequired
                type="text"
                name="content"
                value={formData.content}
                onChange={handleChange}
                variant="flat"
                labelPlacement="outside"
                label="Anuncio"
                className={{
                    base: "max-w-xs",
                    input: "resize-y min-h-[40px]",
                }}
            />
            <Select
                aria-label="tipoAnuncio"
                name="tipo"
                placeholder="Tipo de anuncio"
                value={formData.tipo}
                labelPlacement="outside-left"
                onChange={(e) => handleChange(e)}
            >
                {Object.entries(tiposAnuncio).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                        {value}
                    </SelectItem>
                ))}
            </Select>
            <Button type="submit">Guardar cambios</Button>
        </form>
    );
}

export default EditAnuncio;
