import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
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

    const [searchParams] = useSearchParams();

    const fetchPedidosProduccion = async (searchQuery = '') => {
        setLoading(true);
        try {
            const enProduccion = await getPedidosByEstado('EN_PRODUCCION', searchQuery);
            const enProceso = await getPedidosByEstado('EN_PROCESO', searchQuery);
            setPedidos([...enProduccion.data, ...enProceso.data]);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
            if (isInitialLoading) {
                setIsInitialLoading(false);
            }
        }
    };

    // Efecto para la carga inicial
    useEffect(() => {
        fetchPedidosProduccion();
    }, []);

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
    }, [filtroTexto]);

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

    if (isInitialLoading) return <div>Cargando pedidos en producción...</div>;
    if (error) return <div>Error al cargar los pedidos: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>
                    Ordenes de Producción
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