import React, { useState, useMemo, useEffect, useRef } from 'react'; 
import styles from './Historial.module.css';
import TablaHistorial from '../../components/especificos/TablaHistorial/TablaHistorial.jsx';
import { getPedidosByEstado, resetPedidos } from '../../services/pedidosService';

const Historial = () => {
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtroTexto, setFiltroTexto] = useState('');
    const isInitialMount = useRef(true);

    const fetchHistorial = async (searchQuery = '') => {
        setLoading(true);
        try {
            const entregados = await getPedidosByEstado('ENTREGADO', searchQuery);
            const cancelados = await getPedidosByEstado('CANCELADO', searchQuery);
            setPedidos([...entregados.data, ...cancelados.data]);
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
        fetchHistorial();
    }, []);

    // Efecto para la búsqueda debounced
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const debounceFetch = setTimeout(() => {
            fetchHistorial(filtroTexto);
        }, 300);
        return () => clearTimeout(debounceFetch);
    }, [filtroTexto]);

    const handleResetTodo = async () => {
        if (window.confirm("¿Estás seguro de que deseas borrar TODO el historial? Esta acción no se puede deshacer.")) {
            try {
                await resetPedidos();
                await fetchHistorial(filtroTexto);
            } catch (error) {
                console.error("Error resetting history:", error);
                alert("Error al borrar el historial.");
            }
        }
    };

    const pedidosHistorial = useMemo(() => {
        return pedidos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [pedidos]);
    
    if (isInitialLoading) return <div>Cargando historial de pedidos...</div>;
    if (error) return <div>Error al cargar el historial: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}> 
            <div className={styles.header}>
                <div className={styles.tituloControles}>
                    <h1 className={styles.tituloPagina}>Historial de Pedidos (Entregados y Cancelados)</h1>
                    <button 
                        onClick={handleResetTodo}
                        className={styles.botonReset} 
                    >
                        Borrar Historial 🗑️
                    </button>
                </div>
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
            
            <TablaHistorial pedidos={pedidosHistorial} />
        </div>
    );
};

export default Historial;