import React, { useState, useMemo, useEffect, useRef } from 'react';
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

    const fetchPedidosFinalizacion = async (searchQuery = '') => {
        setLoading(true);
        try {
            const data = await getPedidosByEstado('LISTO_PARA_ENTREGA', searchQuery);
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

    // Efecto para la carga inicial
    useEffect(() => {
        fetchPedidosFinalizacion();
    }, []);

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
    }, [filtroTexto]);


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

    if (isInitialLoading) return <div>Cargando pedidos para entrega...</div>;
    if (error) return <div>Error al cargar los pedidos: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoFinalizacion}>
                <h1 className={styles.tituloPagina}>Pedidos Listos para Entrega</h1>
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
