import React, { useState } from "react";
import {
    Button,
    Input,
    Select,
    SelectItem,
    Textarea,
} from "@nextui-org/react";
import { ObraSocialSelect } from "../Buscador/ObraSocialSelect";

export function CargaAnuncio({ onClose, onEventCreated, authors, sector, obraSocial }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        obraSocial: '',
        codigoObraSocial: '',
        sector: sector,
        authorId: null // Campo para el ID del autor
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('sector', formData.sector);
        data.append('obraSocial', formData.obraSocial);
        data.append('codigoObraSocial', formData.codigoObraSocial)
        data.append('authorId', formData.authorId);

        try {
            await fetch('http://192.168.1.53:3000/anuncios', {
                method: 'POST',
                body: data,
            });

            onEventCreated();
            onClose();
        } catch (error) {
            console.error('Error al agregar el anuncio:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleObraSelect = (obra) => {
        setFormData(prevData => ({
            ...prevData,
            obraSocial: obra.razonSocial,
            codigoObraSocial: obra.codigo
        }));
    };
    const filteredAuthors = authors.filter((author) => {
        if (sector === "Facturacion") {
            return author.sector === "Facturacion";
        } else if (sector === "RRHH") {
            return author.sector === "Gestion";
        }
        return true;
    });
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
                placeholder="Titulo..."
                label="Titulo"
                className="max-w-s"
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
                className={{ base: "max-w-xs", input: "resize-y min-h-[40px]" }}
            />
            <Select
                isRequired
                aria-label="author"
                name="authorId"
                placeholder="Selecciona un autor"
                value={formData.authorId}
                labelPlacement="outside-left"
                onChange={(e) => handleSelectChange('authorId', e.target.value)}
            >
                {filteredAuthors.map((author) => (
                    <SelectItem key={author.id} value={author.id} textValue={author.name}>
                        {author.name}
                    </SelectItem>
                ))}
            </Select>
            <ObraSocialSelect handleObraSocial={handleObraSelect} />
            <Button type="submit">Agregar anuncio</Button>
        </form>
    );
}
