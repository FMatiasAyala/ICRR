import React, { useState } from "react";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Textarea } from "@nextui-org/react";
import AdjuntarArchivo from "./hooks/AdjuntarArchivo";

function CargaAnuncio({ onClose, onEventCreated, authors }) {

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        sector: '',
        authorId: null // Campo para el ID del autor

    });

    const sectores = [
        { key: 'Facturacion', name: 'Facturacion' },
        { key: 'Gestion', name: 'Gestion' }
    ];

    const [files, setFiles] = useState([]);

    const handleFilesAdded = (newFiles) => {
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();      

        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('sector', formData.sector);
        data.append('authorId',formData.authorId );
        files.forEach(file => {
            data.append('attachments', file);
        });
        console.log(files.name);
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
                aria-label="sector"
                name="sector"
                placeholder="Sector"
                value={formData.sector}
                labelPlacement="outsied-left"
                onChange={(e) => handleSelectChange('sector', e.target.value)}
            >
                {sectores.map((sector) => (
                    <SelectItem key={sector.key} value={sector.key} textValue={sector.name}>
                        {sector.name}
                    </SelectItem>
                ))}
            </Select>
            <Select
                isRequired
                aria-label="author"
                name="authorId"
                placeholder="Selecciona un autor"
                value={formData.authorId}
                labelPlacement="outsied-left"
                onChange={(e) => handleSelectChange('authorId', e.target.value)}
            >
                {authors && authors.map((author) => (
                    <SelectItem key={author.id} value={author.id} textValue={author.name}>
                        {author.name}
                    </SelectItem>
                ))}
            </Select>

            <AdjuntarArchivo onFilesAdded={handleFilesAdded} />
            <Button type="submit">Agregar anuncio</Button>
        </form>
    );
}

export function ModalCreate({ onEventCreate, authors }) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button onPress={onOpen}>Nuevo anuncio</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Cargar anuncio</ModalHeader>
                            <ModalBody>
                                <CargaAnuncio onClose={onClose} onEventCreated={onEventCreate} authors={authors} />
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
