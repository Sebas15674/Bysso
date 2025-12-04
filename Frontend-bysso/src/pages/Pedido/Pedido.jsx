import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Pedido.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaPedidos from '../../components/especificos/TablaPedidos/TablaPedidos.jsx';
import { updatePedidoToEnProduccion, getPedidosByEstado, cancelMultiplePedidos } from '../../services/pedidosService';
import { useBags } from '../../context/BagContext';

const Pedido = ({ abrirModal }) => {
    const { refetchBags } = useBags();
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Para la carga inicial
    const [loading, setLoading] = useState(false); // Para las búsquedas
    const [error, setError] = useState(null);

    const [bolsasSeleccionadas, setBolsasSeleccionadas] = useState([]);
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [filtroTexto, setFiltroTexto] = useState('');
    const isInitialMount = useRef(true);

    const location = useLocation(); // Get location object
    const queryParams = new URLSearchParams(location.search);
    const estadoFiltrado = queryParams.get('estado'); // Get 'estado' query param

    const fetchPedidos = async (searchQuery = '') => {
        setLoading(true);
        try {
            const estadoActual = estadoFiltrado || 'PENDIENTE'; // Use filtered state or default to PENDIENTE
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

    // Efecto para la carga inicial de datos y re-fetch al cambiar filtro de URL
    useEffect(() => {
        fetchPedidos();
    }, [estadoFiltrado]); // Depend on estadoFiltrado

    // Efecto para la búsqueda debounced
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const debounceFetch = setTimeout(() => {
            fetchPedidos(filtroTexto);
        }, 300);

        return () => clearTimeout(debounceFetch);
    }, [filtroTexto, estadoFiltrado]);

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
        abrirModal('PEDIDO_DETAIL', pedido, { onUpdate: fetchPedidos });
    };

    const enviarAProduccion = async (nBolsa) => {
        const pedidoAActualizar = pedidos.find(p => p.bagId === nBolsa);
        if (!pedidoAActualizar) {
            console.error(`No se encontró el pedido con bolsa ${nBolsa}`);
            alert(`Error: No se encontró el pedido con bolsa ${nBolsa}`);
            return;
        }

        try {
            await updatePedidoToEnProduccion(pedidoAActualizar.id);
            await fetchPedidos(); // Re-fetch all pending orders
            refetchBags();
            setBolsasSeleccionadas(prev => prev.filter(bolsa => bolsa !== nBolsa));
        } catch (error) {
            console.error(`Error al enviar el pedido con bolsa ${nBolsa} a producción:`, error);
            alert(`Error al enviar a producción: ${error.message}`);
        }
    };

    const handleCancelarSeleccionados = async () => {
        if (bolsasSeleccionadas.length === 0) return;

        if (!window.confirm(`¿Estás seguro de que deseas CANCELAR ${bolsasSeleccionadas.length} pedido(s)? Se moverán al historial y se liberarán las bolsas.`)) {
            return;
        }

        try {
            if(bolsasSeleccionadas.length > 0) {
                await cancelMultiplePedidos(bolsasSeleccionadas);
                await fetchPedidos(); // Re-fetch all pending orders
                refetchBags();
            }
            setBolsasSeleccionadas([]);
            setModoSeleccion(false);
        } catch (error) {
            console.error('Error al cancelar pedidos:', error);
            if (error.response) {
                console.error('Datos de error del servidor:', error.response.data);
                console.error('Estado del error del servidor:', error.response.status);
            }
            alert('Error al cancelar pedidos. Consulta la consola para más detalles.');
        }
    };

    const getTituloDisplay = (estado) => {
        switch (estado) {
            case 'PENDIENTE': return 'Pedidos (Pendientes)';
            case 'EN_PRODUCCION': return 'Pedidos (En Producción)';
            case 'EN_PROCESO': return 'Pedidos (En Proceso)';
            case 'LISTO_PARA_ENTREGA': return 'Pedidos (Listos para Entrega)';
            default: return 'Pedidos';
        }
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
                        onClick={() => abrirModal('PEDIDO_FORM', null, { onSave: fetchPedidos })}
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
                    placeholder="Buscar por bolsa o tipo "
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
        </div>
    );
}; // <--- Missing closing brace added here

export default Pedido;
