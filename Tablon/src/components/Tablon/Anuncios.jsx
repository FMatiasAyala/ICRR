import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { updateAnuncio } from './hooks/Fecth';
import { formateDate } from './hooks/Date';
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Divider,
    Select,
    SelectItem,
    Button
} from '@nextui-org/react';
import { ModalEdit } from './Modal/ModalEdit';
import { ModalCreate } from './Modal/ModalCreate';
import { useWebSocket } from './hooks/useWebSocket';
import './anuncioStyle.css';
import { Header, Logo } from './hooks/StyleComponents';
import logo from './Img/logo.svg';
import { ObraSocialSearch } from './Filtro/ObraSocialSearch';
import { MesFilter } from './Filtro/MesFilter';
import { SectorFilter } from './Filtro/SectorFilter';

export default function Anuncios() {
    const { anuncio, setAnuncio, sendWebSocketMessage } = useWebSocket();
    const [filteredAnuncio, setFilteredAnuncio] = useState([]);
    const [sectorFilter, setSectorFilter] = useState('');
    const [mesFilter, setMesFilter] = useState('');
    const [buttonCreated, setButtonCreated] = useState('');
    const [editingAnuncio, setEditingAnuncio] = useState(null);
    const [user, setUser] = useState([]);
    const [obraSocialFilter, setObraSocialFilter] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchUsuario = async () => {
            try {
                const response = await fetch('http://192.168.1.53:3000/user');
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de equipos');
                }
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error en la solicitud de datos de equipos:', error);
            }
        };

        fetchUsuario();
    }, []);

    useEffect(() => {
        const filterAnuncios = () => {
            let filtered = anuncio;

            if (sectorFilter) {
                filtered = filtered.filter(anuncio => anuncio.sector === sectorFilter);
            }

            if (mesFilter !== '') {
                filtered = filtered.filter(anuncio => {
                    const anuncioDate = new Date(anuncio.createdAt);
                    return anuncioDate.getMonth() === parseInt(mesFilter, 10);
                });
            }

            if (obraSocialFilter) {
                filtered = filtered.filter(anuncio => anuncio.codigoObraSocial === obraSocialFilter);
            }

            setFilteredAnuncio(filtered);
        };

        filterAnuncios();
    }, [sectorFilter, mesFilter, obraSocialFilter, anuncio]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sector = params.get('sector');
        if (sector) {
            setButtonCreated(sector);
        }
    }, [location.search]);

    const handleFilterChange = (event) => {
        setSectorFilter(event.target.value);
    };

    const handleMesChange = (event) => {
        setMesFilter(event.target.value);
    };

    const handleObraSocialChange = (value) => {
        setObraSocialFilter(value === " " ? "" : value);
    };

    const handleEdit = (id) => {
        const editedAnuncio = anuncio.find(a => a.id === id);
        setEditingAnuncio(editedAnuncio);
    };

    const handleSave = async (id, updatedData) => {
        try {
            await updateAnuncio(id, updatedData);
            setAnuncio(anuncio.map(a => (a.id === id ? { ...a, ...updatedData } : a)));
            setEditingAnuncio(null);
            sendWebSocketMessage({ type: 'update' });
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`http://192.168.1.53:3000/anuncios/${id}`, {
                method: 'DELETE',
            });
            setAnuncio(anuncio.filter(a => a.id !== id));
            sendWebSocketMessage({ type: 'delete' });
        } catch (error) {
            console.error('Error al eliminar el anuncio:', error);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header>
                <Logo src={logo} alt='logo' />
                Tablon de anuncios
            </Header>
            <div className="flex flex-1">
                <aside className="w-1/4 p-4">
                    <Card className="filtro-card">
                        <SectorFilter
                            sectorFilter={sectorFilter}
                            handleFilterChange={handleFilterChange}
                            anuncio={anuncio} />
                        <ObraSocialSearch
                            obraSocialFilter={obraSocialFilter}
                            handleObraSocialChange={handleObraSocialChange}
                        />
                        <MesFilter
                            mesFilter={mesFilter}
                            handleMesChange={handleMesChange}
                        />
                    </Card>
                </aside>
                <main className="flex-1 p-4">
                    {(buttonCreated === 'FACTU' || buttonCreated === 'GES') && (
                        <ModalCreate
                            onEventCreate={() => sendWebSocketMessage({ type: 'fetch' })}
                            authors={user}
                            sector={buttonCreated === 'FACTU' ? "Facturacion" : "RRHH"}
                            obraSocial={[]}
                        />
                    )}
                    {filteredAnuncio.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                            {filteredAnuncio.map((anuncio, index) => (
                                <Card key={index} className="anuncio">
                                    <CardHeader className="relative w-full flex flex-col items-center">
                                        <div className="text-center mt-4">
                                            <p className="text-xl font-bold">{anuncio.title}</p>
                                            <p className="text-small text-default-500">{anuncio.sector}{anuncio.author ? ` - ${anuncio.author.name}` : ""}</p>
                                            <p className="text-small font-bold">{anuncio.obraSocial ? `${anuncio.obraSocial}` : ""}</p>
                                        </div>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody className="cardContent">
                                        <p>{anuncio.content}</p>
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="text-center">
                                        <p className="text-small text-default-500">{formateDate(anuncio.updatedAt)}</p>
                                    </CardFooter>
                                    {buttonCreated === 'GES' && (
                                        <div className="flex gap-3">
                                            <Button
                                                className="text-small"
                                                color="success"
                                                onClick={() => handleEdit(anuncio.id)}
                                                aria-label={`Editar anuncio ${anuncio.title}`}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                className="text-small"
                                                color="danger"
                                                onClick={() => handleDelete(anuncio.id)}
                                                aria-label={`Eliminar anuncio ${anuncio.title}`}
                                            >
                                                Eliminar anuncio
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p>No hay anuncios disponibles.</p>
                    )}
                </main>
            </div>
            {editingAnuncio && (
                <ModalEdit anuncio={editingAnuncio} onSave={handleSave} onClose={() => setEditingAnuncio(null)} />
            )}
        </div>
    );
}
