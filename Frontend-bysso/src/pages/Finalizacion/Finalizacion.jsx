import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import styles from './Finalizacion.module.css';
import TablaFinalizacion from '../../components/especificos/TablaFinalizacion/TablaFinalizacion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetalleFinalizacion from '../../components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';
import { getPedidosByEstado, updatePedidoToEntregado } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Finalizacion = () => {
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

    const fetchPedidosFinalizacion = async (searchQuery = '') => {
        setLoading(true);
        try {
            const estadoActual = estadoFiltrado || 'LISTO_PARA_ENTREGA'; // Use filtered state or default
            const data = await getPedidosByEstado(estadoActual, searchQuery);
            setPedidos(data.data);
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
        fetchPedidosFinalizacion();
    }, [estadoFiltrado]); // Depend on estadoFiltrado

    // Efecto para la búsqueda debounced
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const debounceFetch = setTimeout(() => {
            fetchPedidosFinalizacion(filtroTexto);
        }, 300);
        return () => clearTimeout(debounceFetch);
    }, [filtroTexto, estadoFiltrado]); // Also depend on estadoFiltrado for debounced search


    const abrirModal = () => setEstaModalAbierto(true);

    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido.id);
        abrirModal();
    };

    const entregarPedidoSincronizado = async (nBolsa) => {
        const pedido = pedidos.find(p => p.bagId === nBolsa);
        if (pedido) {
            try {
                await updatePedidoToEntregado(pedido.id);
                await fetchPedidosFinalizacion(filtroTexto);
                refetchBags();
            } catch (error) {
                console.error("Error delivering order:", error);
                alert("Error al entregar el pedido.");
            }
        }
    };

    const pedidosListosParaEntrega = useMemo(() => pedidos, [pedidos]);

    const getTituloDisplay = (estado) => {
        switch (estado) {
            case 'LISTO_PARA_ENTREGA': return 'Pedidos Listos para Entrega';
            case 'PENDIENTE': return 'Pedidos (Pendientes)'; // Fallback/Other states for clarity
            case 'EN_PRODUCCION': return 'Pedidos (En Producción)';
            case 'EN_PROCESO': return 'Pedidos (En Proceso)';
            default: return 'Pedidos para Finalización';
        }
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
                        placeholder="Buscar"
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                        
                    />
                </div>
            </div>

            <TablaFinalizacion
                pedidos={pedidosListosParaEntrega}
                alVerDetalles={verDetalles}
                alEntregarPedido={entregarPedidoSincronizado}
            />
            <Modal
                estaAbierto={estaModalAbierto}
                alCerrar={cerrarModal}
                cierraAlHacerClickAfuera={true}
            >
                <DetalleFinalizacion
                    pedidoId={pedidoSeleccionado}
                    alCerrarModal={cerrarModal}
                />
            </Modal>
        </div>
    );
};

export default Finalizacion;
