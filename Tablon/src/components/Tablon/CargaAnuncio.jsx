import React, { useState } from "react";
import {
    Button,
    Input,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Select,
    SelectItem,
    Textarea
} from "@nextui-org/react";

function CargaAnuncio({ onClose, onEventCreated, authors, sector }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        sector: sector,
        authorId: null // Campo para el ID del autor
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();

        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('sector', formData.sector);
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
                labelPlacement="outside-left" // Corregido aquí
                onChange={(e) => handleSelectChange('authorId', e.target.value)}
            >
                {filteredAuthors.map((author) => (
                    <SelectItem key={author.id} value={author.id} textValue={author.name}>
                        {author.name}
                    </SelectItem>
                ))}
            </Select>
            <Button type="submit">Agregar anuncio</Button>
        </form>
    );
}

export function ModalCreate({ onEventCreate, authors, sector }) {
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
                                <CargaAnuncio onClose={onClose} onEventCreated={onEventCreate} authors={authors} sector={sector} />
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
