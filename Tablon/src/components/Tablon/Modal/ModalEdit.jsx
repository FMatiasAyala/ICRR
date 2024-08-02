import React, {useState, useEffect} from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import EditAnuncio from '../EditarAnuncio/EditAnuncio';

export function ModalEdit({ anuncio, onSave, onClose}) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (anuncio) {
            setIsOpen(true);
        }
    }, [anuncio]);
    const handleClose = () => {
        setIsOpen(false);
        onClose();
    };
    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={handleClose}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Editar anuncio</ModalHeader>
                            <ModalBody>
                                <EditAnuncio onClose={handleClose} anuncio={anuncio} onSave={onSave} />
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

