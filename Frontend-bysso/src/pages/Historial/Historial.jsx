import React, { useState, useMemo } from 'react'; 
import styles from './Historial.module.css';
import TablaHistorial from '../../components/especificos/TablaHistorial/TablaHistorial.jsx';

const Historial = ({ pedidos, handleResetTodo }) => {
    
    // 🔑 NUEVO ESTADO PARA EL FILTRO DE TEXTO
    const [filtroTexto, setFiltroTexto] = useState('');

    // 🔑 OPTIMIZACIÓN: useMemo para el filtrado y ordenamiento.
    const pedidosHistorial = useMemo(() => {
        // 1. FILTRADO POR ESTADO BASE (Entregado o Cancelado)
        let listaFiltrada = pedidos.filter(pedido => 
            pedido.estado === 'Entregado' || pedido.estado === 'Cancelado'
        );

        // 2. FILTRADO POR TEXTO DE BÚSQUEDA
        if (filtroTexto.trim() !== '') {
            const textoBusqueda = filtroTexto.toLowerCase().trim();
            
            listaFiltrada = listaFiltrada.filter(p => {
                const bolsa = String(p.bolsa).toLowerCase();
                const cliente = p.cliente ? p.cliente.toLowerCase() : '';
                const estado = p.estado ? p.estado.toLowerCase() : '';
                const tipo = p.tipo ? p.tipo.toLowerCase() : '';
                const fechaEntregaReal = p.fechaEntregaReal ? p.fechaEntregaReal.toLowerCase() : ''; 
                
                return (
                    cliente.includes(textoBusqueda) ||
                    bolsa.includes(textoBusqueda) ||
                    estado.includes(textoBusqueda) ||
                    tipo.includes(textoBusqueda) ||
                    fechaEntregaReal.includes(textoBusqueda)
                );
            });
        }
        
        // 3. ORDENAMIENTO (se mantiene)
        return listaFiltrada.sort((a, b) => b.id - a.id);
        
    }, [pedidos, filtroTexto]); // ⬅️ Dependencia añadida para re-ejecutar solo cuando el filtro cambia

    return (
        <div className={styles.contenedorPagina}> 
            
            <div className={styles.header}>
                
                <div className={styles.tituloControles}>
                    <h1 className={styles.tituloPagina}>Historial de Pedidos (Entregados y Cancelados)</h1>
                    
                    {/* Botón de Reset en la esquina superior derecha */}
                    {handleResetTodo && (
                        <button 
                            onClick={handleResetTodo}
                            className={styles.botonReset} 
                        >
                            Borrar Historial 🗑️
                        </button>
                    )}
                </div>
            </div>
            
            {/* 🔑 NUEVA BARRA DE FILTROS */}
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
            
            {/* Llama al componente de tabla, pasándole los pedidos del historial */}
            <TablaHistorial pedidos={pedidosHistorial} />

        </div>
    );
};

export default Historial;