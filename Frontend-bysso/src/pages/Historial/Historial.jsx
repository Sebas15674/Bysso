import React, { useState, useMemo, useEffect, useRef } from 'react';
import styles from './historial.module.css';
import TablaHistorial from '../../components/especificos/TablaHistorial/TablaHistorial.jsx';
import Boton from '../../components/ui/Boton/Boton.jsx';
import { getPedidosByEstado, deleteMultiplePedidos } from '../../services/pedidosService';
import { useAuth } from '../../context/AuthContext.jsx';

const Historial = () => {
    const { user } = useAuth();
    const [pedidos, setPedidos] = useState([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtroTexto, setFiltroTexto] = useState('');
    
    // State for selection mode
    const [modoSeleccion, setModoSeleccion] = useState(false);
    const [pedidosSeleccionados, setPedidosSeleccionados] = useState([]);

    const isInitialMount = useRef(true);

    const fetchHistorial = async (searchQuery = '') => {
        setLoading(true);
        try {
            const [entregados, cancelados] = await Promise.all([
                getPedidosByEstado('ENTREGADO', searchQuery),
                getPedidosByEstado('CANCELADO', searchQuery)
            ]);
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

    useEffect(() => {
        fetchHistorial();
    }, []);

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

    // --- SELECTION LOGIC ---

    const handleToggleModoSeleccion = () => {
        setModoSeleccion(prev => !prev);
        setPedidosSeleccionados([]); // Clear selections when toggling mode
    };

    const handleToggleSeleccion = (pedidoId) => {
        setPedidosSeleccionados(prev =>
            prev.includes(pedidoId)
                ? prev.filter(id => id !== pedidoId)
                : [...prev, pedidoId]
        );
    };

    const handleToggleSeleccionarTodos = (todosSeleccionados) => {
        if (todosSeleccionados) {
            setPedidosSeleccionados([]);
        } else {
            setPedidosSeleccionados(pedidos.map(p => p.id));
        }
    };

    const handleDeleteSelected = async () => {
        const totalSelected = pedidosSeleccionados.length;
        if (totalSelected === 0) {
            alert("No hay pedidos seleccionados para eliminar.");
            return;
        }

        const confirmMessage = totalSelected > 1
            ? `¿Estás seguro de que deseas eliminar los ${totalSelected} pedidos seleccionados? Esta acción no se puede deshacer.`
            : "¿Estás seguro de que deseas eliminar el pedido seleccionado? Esta acción no se puede deshacer.";

        if (window.confirm(confirmMessage)) {
            setLoading(true);
            try {
                await deleteMultiplePedidos(pedidosSeleccionados);
                await fetchHistorial(filtroTexto); // Refresh data
                setModoSeleccion(false); // Exit selection mode
                setPedidosSeleccionados([]); // Clear selections
                alert(`${totalSelected} pedido(s) eliminado(s) correctamente.`);
            } catch (error) {
                console.error("Error deleting selected orders:", error);
                alert("Error al eliminar los pedidos seleccionados.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("¿Estás seguro de que deseas borrar TODO el historial? Esta acción no se puede deshacer.")) {
            const allIds = pedidos.map(p => p.id);
            if (allIds.length === 0) {
                alert("No hay pedidos en el historial para eliminar.");
                return;
            }
            
            setLoading(true);
            try {
                await deleteMultiplePedidos(allIds);
                await fetchHistorial(filtroTexto); // Refresh data
                alert("Todo el historial ha sido eliminado.");
            } catch (error) {
                console.error("Error deleting all orders:", error);
                alert("Error al eliminar todo el historial.");
            } finally {
                setLoading(false);
            }
        }
    };


    const pedidosHistorial = useMemo(() => {
        return pedidos.sort((a, b) => {
            const dateA = new Date(a.fechaEntregaReal || a.fechaCancelacion || a.createdAt);
            const dateB = new Date(b.fechaEntregaReal || b.fechaCancelacion || b.createdAt);
            return dateB - dateA;
        });
    }, [pedidos]);
    
    if (isInitialLoading) return <div>Cargando historial de pedidos...</div>;
    if (error) return <div>Error al cargar el historial: {error.message}</div>;

    return (
        <div className={styles.contenedorPagina}> 
            <div className={styles.header}>
                <div className={styles.tituloControles}>
                    <h1 className={styles.tituloPagina}>Historial de Pedidos (Entregados y Cancelados)</h1>
                    <div className={styles.controlesAcciones}>
                        {!modoSeleccion ? (
                            <>
                                {user?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                                    <Boton tipo="secundario" onClick={handleToggleModoSeleccion} disabled={loading || pedidos.length === 0}>
                                        Seleccionar
                                    </Boton>

                                )}

                                {user?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                                    <Boton tipo="peligro" onClick={handleDeleteAll} disabled={loading || pedidos.length === 0}>
                                        Borrar Todo
                                    </Boton>
                                )}
                            </>
                        ) : (
                            <>
                                <Boton tipo="cancelar" onClick={handleToggleModoSeleccion} disabled={loading}>
                                    Cancelar
                                </Boton>
                                {user?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                                    <Boton 
                                        tipo="peligro" 
                                        onClick={handleDeleteSelected} 
                                        disabled={loading || pedidosSeleccionados.length === 0}
                                    >
                                        Eliminar ({pedidosSeleccionados.length})
                                    </Boton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <div className={styles.barraFiltros}>
                <div className={styles.inputContainer}> 
                    <input 
                        type="text"
                        placeholder="Buscar por cliente y bolsa"
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                    />
                </div>
            </div>
            
            <TablaHistorial 
                pedidos={pedidosHistorial}
                modoSeleccion={modoSeleccion}
                pedidosSeleccionados={pedidosSeleccionados}
                alToggleSeleccion={handleToggleSeleccion}
                alToggleSeleccionarTodos={handleToggleSeleccionarTodos}
            />
        </div>
    );
};

export default Historial;