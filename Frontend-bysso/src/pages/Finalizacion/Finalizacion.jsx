import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Finalizacion.module.css';
import TablaFinalizacion from '../../components/especificos/TablaFinalizacion/TablaFinalizacion.jsx';
import Paginacion from '../../components/ui/Paginacion/Paginacion.jsx';
import { getPedidosByEstado, updatePedidoToEntregado } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Finalizacion = ({ abrirModal }) => {
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

    const fetchPedidosFinalizacion = useCallback(async (searchQuery, page) => {
        setLoading(true);
        try {
            const estadoActual = estadoFiltrado || 'LISTO_PARA_ENTREGA';
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
        fetchPedidosFinalizacion(debouncedSearch, currentPage);
    }, [debouncedSearch, currentPage, estadoFiltrado, fetchPedidosFinalizacion]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages && newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    };

    const onSuccessfulUpdate = () => {
        fetchPedidosFinalizacion(debouncedSearch, currentPage);
        refetchBags();
    };

    const verDetalles = (pedido) => {
        abrirModal('FINALIZACION_DETAIL', pedido.id, { onUpdate: onSuccessfulUpdate });
    };

    const entregarPedidoSincronizado = async (nBolsa) => {
        const pedido = pedidos.find(p => p.bagId === nBolsa);
        if (pedido) {
            try {
                await updatePedidoToEntregado(pedido.id);
                onSuccessfulUpdate();
            } catch (error) {
                console.error("Error delivering order:", error);
                alert("Error al entregar el pedido.");
            }
        }
    };

    const getTituloDisplay = (estado) => {
        const titulos = {
            LISTO_PARA_ENTREGA: 'Pedidos Listos para Entrega',
            PENDIENTE: 'Pedidos (Pendientes)',
            EN_PRODUCCION: 'Pedidos (En Producción)',
            EN_PROCESO: 'Pedidos (En Proceso)',
        };
        return titulos[estado] || 'Pedidos para Finalización';
    };

    if (isInitialLoading) return <div>Cargando pedidos para entrega...</div>;
    if (error) return <div>Error al cargar los pedidos: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoFinalizacion}>
                <h1 className={styles.tituloPagina}>{getTituloDisplay(estadoFiltrado || 'LISTO_PARA_ENTREGA')}</h1>
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

            <TablaFinalizacion
                pedidos={pedidos}
                alVerDetalles={verDetalles}
                alEntregarPedido={entregarPedidoSincronizado}
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

export default Finalizacion;
