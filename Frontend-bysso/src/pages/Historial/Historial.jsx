import React from 'react';
import styles from './Historial.module.css';
import TablaHistorial from '../../components/especificos/TablaHistorial/TablaHistorial.jsx';
// Se utiliza un botón simple para evitar el error de compilación.

const Historial = ({ pedidos, handleResetTodo }) => {
    
    // Filtramos solo los pedidos que ya fueron marcados como 'Entregado'
    const pedidosEntregados = pedidos
        .filter(pedido => pedido.estado === 'Entregado')
        .sort((a, b) => b.id - a.id); 

    return (
        <div className={styles.contenedorPagina}> 
            
            <div className={styles.header}>
                
                {/* CRÍTICO: Este div alinea el título a la izquierda y el botón a la derecha */}
                <div className={styles.tituloControles}>
                    <h1 className={styles.tituloPagina}>Historial de Pedidos Entregados</h1>
                    
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
            
            {/* Llama al componente de tabla, pasándole solo los pedidos entregados */}
            <TablaHistorial pedidos={pedidosEntregados} />

        </div>
    );
};

export default Historial;