import React, { useState, useEffect } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@nextui-org/react';
import EditAnuncio from '../EditarAnuncio/EditAnuncio';

export function ModalEdit({ anuncio, onSave, onClose }) {
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
                            <ModalBody className="p-4 bg-gray-50 rounded-lg shadow-sm">
                                <EditAnuncio onClose={handleClose} anuncio={anuncio} onSave={onSave} />
                            </ModalBody>
                            <ModalFooter className="flex justify-between items-center p-4 bg-gray-100">
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                    className="py-2 px-6 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all"
                                >
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

