import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom'; // Import useLocation
import styles from './Produccion.module.css';
import TablaProduccion from '../../components/especificos/TablaProduccion/TablaProduccion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetalleProduccion from '../../components/especificos/DetalleProduccion/DetalleProduccion.jsx';
import { getPedidosByEstado, updatePedidoToEnProceso, updatePedidoToListoParaEntrega } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Produccion = () => {
    const { refetchBags } = useBags();
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [filtroTexto, setFiltroTexto] = useState('');
    const isInitialMount = useRef(true);

    const location = useLocation(); // Get location object for filtering
    const queryParams = new URLSearchParams(location.search);
    const estadoFiltrado = queryParams.get('estado'); // Get 'estado' query param

    const fetchPedidosProduccion = async (searchQuery = '') => {
        setLoading(true);
        try {
            let fetchedPedidos = [];
            if (estadoFiltrado) {
                // If a specific state is filtered, fetch only that state
                const data = await getPedidosByEstado(estadoFiltrado, searchQuery);
                fetchedPedidos = data.data;
            } else {
                // Default behavior: fetch both EN_PRODUCCION and EN_PROCESO
                const enProduccion = await getPedidosByEstado('EN_PRODUCCION', searchQuery);
                const enProceso = await getPedidosByEstado('EN_PROCESO', searchQuery);
                fetchedPedidos = [...enProduccion.data, ...enProceso.data];
            }
            setPedidos(fetchedPedidos);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            if (isInitialLoading) {
                setIsInitialLoading(false);
            }
        }
    };

    // Efecto para la carga inicial y re-fetch al cambiar filtro de URL
    useEffect(() => {
        fetchPedidosProduccion();
    }, [estadoFiltrado]); // Depend on estadoFiltrado

    // Efecto para la búsqueda debounced
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const debounceFetch = setTimeout(() => {
            fetchPedidosProduccion(filtroTexto);
        }, 300);
        return () => clearTimeout(debounceFetch);
    }, [filtroTexto, estadoFiltrado]); // Also depend on estadoFiltrado for debounced search

    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido.id);
        setEstaModalAbierto(true);
    };

    const pedidosFiltrados = useMemo(() => pedidos, [pedidos]);

    const tomarPedido = async (nBolsa) => {
        const pedido = pedidos.find(p => p.bagId === nBolsa);
        if (pedido) {
            try {
                await updatePedidoToEnProceso(pedido.id);
                await fetchPedidosProduccion(filtroTexto);
                refetchBags();
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
                await fetchPedidosProduccion(filtroTexto);
                refetchBags();
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
                        placeholder="Buscar "
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
               
                    />
                </div>
            </div>

            <TablaProduccion
                pedidos={pedidosFiltrados}
                alVerDetalles={verDetalles}
                alTomarPedido={tomarPedido}
                alFinalizar={finalizarProduccion}
                loading={loading}
            />
            <Modal
                estaAbierto={estaModalAbierto}
                alCerrar={cerrarModal}
                cierraAlHacerClickAfuera={true}
            >
                <DetalleProduccion
                    pedidoId={pedidoSeleccionado}
                    alCerrarModal={cerrarModal}
                />
            </Modal>
        </div>
    );
};

export default Produccion;