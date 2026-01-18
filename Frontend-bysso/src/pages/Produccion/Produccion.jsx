import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Produccion.module.css';
import TablaProduccion from '../../components/especificos/TablaProduccion/TablaProduccion.jsx';
import Paginacion from '../../components/ui/Paginacion/Paginacion.jsx';
import { getPedidosByEstado, updatePedidoToEnProceso, updatePedidoToListoParaEntrega } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Produccion = ({ abrirModal }) => {
    const { refetchBags } = useBags();
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados de paginación y filtros
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const ITEMS_PER_PAGE = 8;
    const [filtroTexto, setFiltroTexto] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(filtroTexto);
    const isInitialMount = useRef(true);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const estadoFiltrado = queryParams.get('estado');

    const fetchPedidosProduccion = useCallback(async (searchQuery, page) => {
        setLoading(true);
        try {
            // Determina los estados a buscar: el filtrado específico o ambos por defecto.
            const estadosABuscar = estadoFiltrado ? [estadoFiltrado] : ['EN_PRODUCCION', 'EN_PROCESO'];
            const data = await getPedidosByEstado(estadosABuscar, searchQuery, page, ITEMS_PER_PAGE);
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

    // useEffect para el debounce del buscador
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(filtroTexto);
        }, 300);
        return () => clearTimeout(handler);
    }, [filtroTexto]);

    // useEffect para resetear la página cuando cambian los filtros
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        setCurrentPage(1);
    }, [debouncedSearch, estadoFiltrado]);

    // useEffect principal para cargar datos
    useEffect(() => {
        fetchPedidosProduccion(debouncedSearch, currentPage);
    }, [debouncedSearch, currentPage, estadoFiltrado, fetchPedidosProduccion]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    const onSuccessfulUpdate = () => {
        fetchPedidosProduccion(debouncedSearch, currentPage);
        refetchBags();
    };

    const verDetalles = (pedido) => {
        abrirModal('PRODUCCION_DETAIL', pedido.id, { onUpdate: onSuccessfulUpdate });
    };

    const tomarPedido = async (nBolsa) => {
        const pedido = pedidos.find(p => p.bagId === nBolsa);
        if (pedido) {
            try {
                await updatePedidoToEnProceso(pedido.id);
                onSuccessfulUpdate();
            } catch (error) {
                console.error("Error taking order:", error);
                alert("Error al tomar el pedido.");
            }
        }
    };

    const finalizarProduccion = async (nBolsa) => {
        const pedido = pedidos.find(p => p.bagId === nBolsa);
        if(pedido) {
            try {
                await updatePedidoToListoParaEntrega(pedido.id);
                onSuccessfulUpdate();
            } catch (error) {
                console.error("Error finalizing order:", error);
                alert("Error al finalizar la producción.");
            }
        }
    };

    const getTituloDisplay = (estado) => {
        switch (estado) {
            case 'EN_PRODUCCION': return 'Ordenes de Producción (En Producción)';
            case 'EN_PROCESO': return 'Ordenes de Producción (En Proceso)';
            default: return 'Ordenes de Producción';
        }
    };

    if (isInitialLoading) return <div>Cargando pedidos de producción...</div>;
    if (error) return <div>Error al cargar los pedidos: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>
                    {getTituloDisplay(estadoFiltrado)}
                </h1>
            </div>

            <div className={styles.barraFiltros}>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        placeholder="Buscar por bolsa, cliente, o tipo..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                    />
                </div>
            </div>

            <TablaProduccion
                pedidos={pedidos}
                alVerDetalles={verDetalles}
                alTomarPedido={tomarPedido}
                alFinalizar={finalizarProduccion}
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

export default Produccion;