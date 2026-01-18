import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Pedido.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaPedidos from '../../components/especificos/TablaPedidos/TablaPedidos.jsx';
import Paginacion from '../../components/ui/Paginacion/Paginacion.jsx';
import { updatePedidoToEnProduccion, getPedidosByEstado, cancelMultiplePedidos } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Pedido = ({ abrirModal }) => {
    const { refetchBags } = useBags();
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const ITEMS_PER_PAGE = 8;

    // Estados para filtros y selección
    const [bolsasSeleccionadas, setBolsasSeleccionadas] = useState([]);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    
    // 1. Lógica de búsqueda mejorada
    const [filtroTexto, setFiltroTexto] = useState(''); // Lo que el usuario escribe
    const [debouncedSearch, setDebouncedSearch] = useState(filtroTexto); // El valor que se usa para buscar

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const estadoFiltrado = queryParams.get('estado');
    const isInitialMount = useRef(true);

    const fetchPedidos = useCallback(async (searchQuery, page) => {
        setLoading(true);
        try {
            const estadoActual = estadoFiltrado || 'PENDIENTE';
            const data = await getPedidosByEstado(estadoActual, searchQuery, page, ITEMS_PER_PAGE);
            setPedidos(data.data);
            setTotalPages(data.lastPage);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            if (isInitialLoading) {
                setIsInitialLoading(false);
            }
        }
    }, [estadoFiltrado, isInitialLoading]);

    // 2. useEffect para el debounce: actualiza el término de búsqueda con retardo
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(filtroTexto);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [filtroTexto]);

    // 3. useEffect para resetear la página cuando los filtros cambian
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setCurrentPage(1);
    }, [debouncedSearch, estadoFiltrado]);

    // 4. useEffect principal para cargar datos: se activa con el debouncedSearch o cambio de página
    useEffect(() => {
        fetchPedidos(debouncedSearch, currentPage);
    }, [debouncedSearch, currentPage, estadoFiltrado, fetchPedidos]);


    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };
    
    const onSuccessfulUpdate = () => {
        fetchPedidos(debouncedSearch, currentPage);
        refetchBags();
    }

    const toggleModoSeleccion = () => {
        setModoSeleccion(prev => !prev);
        setBolsasSeleccionadas([]);
    };

    const toggleSeleccion = (nBolsa) => {
        setBolsasSeleccionadas(prev =>
            prev.includes(nBolsa)
                ? prev.filter(bolsa => bolsa !== nBolsa)
                : [...prev, nBolsa]
        );
    };

    const toggleSeleccionarTodos = (estaSeleccionado) => {
        if (estaSeleccionado) {
            setBolsasSeleccionadas([]);
        } else {
            const todasLasBolsas = pedidos.map(pedido => pedido.bagId);
            setBolsasSeleccionadas(todasLasBolsas);
        }
    };

    const verDetalles = (pedido) => {
        abrirModal('PEDIDO_DETAIL', pedido, { onUpdate: onSuccessfulUpdate });
    };

    const enviarAProduccion = async (nBolsa) => {
        const pedidoAActualizar = pedidos.find(p => p.bagId === nBolsa);
        if (!pedidoAActualizar) return;

        try {
            await updatePedidoToEnProduccion(pedidoAActualizar.id);
            onSuccessfulUpdate();
            setBolsasSeleccionadas(prev => prev.filter(bolsa => bolsa !== nBolsa));
        } catch (error) {
            console.error(`Error al enviar a producción:`, error);
            alert(`Error al enviar a producción: ${error.message}`);
        }
    };

    const handleCancelarSeleccionados = async () => {
        if (bolsasSeleccionadas.length === 0) return;

        if (!window.confirm(`¿Estás seguro de que deseas CANCELAR ${bolsasSeleccionadas.length} pedido(s)?`)) {
            return;
        }

        try {
            await cancelMultiplePedidos(bolsasSeleccionadas);
            onSuccessfulUpdate();
            setBolsasSeleccionadas([]);
            setModoSeleccion(false);
        } catch (error) {
            console.error('Error al cancelar pedidos:', error);
            alert('Error al cancelar pedidos.');
        }
    };

    const getTituloDisplay = (estado) => {
        const titulos = {
            PENDIENTE: 'Pedidos (Pendientes)',
            EN_PRODUCCION: 'Pedidos (En Producción)',
            EN_PROCESO: 'Pedidos (En Proceso)',
            LISTO_PARA_ENTREGA: 'Pedidos (Listos para Entrega)',
        };
        return titulos[estado] || 'Pedidos';
    };

    if (isInitialLoading) return <div>Cargando pedidos...</div>;
    if (error) return <div>Error al cargar los pedidos: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>{getTituloDisplay(estadoFiltrado || 'PENDIENTE')}</h1>
                <div className={styles.controlesAcciones}>
                    <Boton
                        tipo="primario"
                        onClick={() => abrirModal('PEDIDO_FORM', null, { onSave: () => fetchPedidos(debouncedSearch, 1) })}
                        disabled={modoSeleccion}
                    >
                        Crear Pedido ✚
                    </Boton>
                    <Boton
                        tipo={modoSeleccion ? "desactivar-cancelacion" : "peligro"}
                        onClick={toggleModoSeleccion}
                    >
                        {modoSeleccion ? 'Descartar' : 'Cancelar 🗑️'}
                    </Boton>
                    {modoSeleccion && bolsasSeleccionadas.length > 0 && (
                        <Boton
                            tipo="peligro"
                            onClick={handleCancelarSeleccionados}
                        >
                            Confirmar Cancelación ({bolsasSeleccionadas.length})
                        </Boton>
                    )}
                </div>
            </div>

            <div className={styles.barraFiltros}>
                <input
                    type="text"
                    placeholder="Buscar por bolsa, cliente, o tipo..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className={styles.inputFiltro}
                />
            </div>

            <TablaPedidos
                pedidos={pedidos}
                alEnviarProduccion={enviarAProduccion}
                alVerDetalles={verDetalles}
                modoSeleccion={modoSeleccion}
                bolsasSeleccionadas={bolsasSeleccionadas}
                alToggleSeleccion={toggleSeleccion}
                alToggleSeleccionarTodos={toggleSeleccionarTodos}
                loading={loading}
            />
            
            <Paginacion
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
            />
        </div>
    );
};

export default Pedido;
