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
import { ModalEdit } from './EditarAnuncio/ModalEdit';
import { ModalCreate } from './CargaAnuncio';
import { useWebSocket } from './hooks/useWebSocket';
import './anuncioStyle.css';
import { Header, Logo } from './hooks/StyleComponents';
import logo from './Img/logo.svg'

export default function Anuncios() {
    const { anuncio, setAnuncio, sendWebSocketMessage } = useWebSocket();
    const [filteredAnuncio, setFilteredAnuncio] = useState([]);
    const [sectorFilter, setSectorFilter] = useState('');
    const [mesFilter, setMesFilter] = useState('');
    const [buttonCreated, setButtonCreated] = useState('');
    const [editingAnuncio, setEditingAnuncio] = useState(null);
    const [user, setUser] = useState([]);
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

            setFilteredAnuncio(filtered);
        };

        filterAnuncios();
    }, [sectorFilter, mesFilter, anuncio]);

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

    const handleMesChange = (e) => {
        setMesFilter(e.target.value);
    };

    const ifFacturacion = buttonCreated === 'FACTU';
    const ifGestion = buttonCreated === 'GES';

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
                <aside className="w-1/4 p-4 ">
                    <Card className="filtro-card">
                        <p>Filtrar por sector:</p>
                        <Select value={sectorFilter} onChange={handleFilterChange} aria-label="sectorFilter">
                            <SelectItem value="" key="" aria-label="Todos">Todos</SelectItem>
                            {[...new Set(anuncio.map(a => a.sector))].map(sector => (
                                <SelectItem key={sector} value={sector} textValue={sector} aria-label={sector}>
                                    {sector}
                                </SelectItem>
                            ))}
                        </Select>
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
                    </Card>
                </aside>

                <main className="flex-1 p-4">
                    {(ifFacturacion || ifGestion) && <ModalCreate onEventCreate={() => sendWebSocketMessage({ type: 'fetch' })} authors={user}   sector={ifFacturacion ? "Facturacion" : "RRHH"}/>}
                    {filteredAnuncio.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4">
                            {filteredAnuncio.map((anuncios, index) => (
                                <Card key={index} className="anuncio" >
                                    <CardHeader className="relative w-full flex flex-col items-center">
                                        <div className="text-center mt-4">
                                            <p className="text-xl font-bold">{anuncios.title}</p>
                                            <p className="text-small text-default-500">{anuncios.sector}{anuncios.author ? ` - ${anuncios.author.name}` : ""}</p>
                                        </div>
                                    </CardHeader>
                                    <Divider />
                                    <CardBody className="text-center max-w-[100px] overflow-auto font-bold text-large">
                                        {anuncios.content}
                                    </CardBody>
                                    <Divider />
                                    <CardFooter className="text-center">
                                        <p className="text-small text-default-500">{formateDate(anuncios.updatedAt)}</p>
                                    </CardFooter>
                                    {ifGestion && (
                                        <div className="flex gap-3">
                                            <Button
                                                className="text-small"
                                                color="success"
                                                onClick={() => handleEdit(anuncios.id)}
                                                aria-label={`Editar anuncio ${anuncios.title}`}
                                            >
                                                Editar
                                            </Button>
                                            <Button
                                                className="text-small"
                                                color="danger"
                                                onClick={() => handleDelete(anuncios.id)}
                                                aria-label={`Eliminar anuncio ${anuncios.title}`}
                                            >
                                                Eliminar anuncio
                                            </Button>
                                        </div>
                                    )}
                                </Card>
                            ))}

                        </div>
                    ) : (
                        <div>
                            <h1 className="text-center">No hay anuncios para este sector y mes.</h1>
                        </div>
                    )}
                </main>
            </div>
            {editingAnuncio && (
                <ModalEdit anuncio={editingAnuncio} onSave={handleSave} onClose={() => setEditingAnuncio(null)} />
            )}
        </div>
    );
}
