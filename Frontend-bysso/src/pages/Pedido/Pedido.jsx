import React from 'react';
import styles from './Pedido.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaPedidos from '../../components/especificos/TablaPedidos/TablaPedidos.jsx';

const Pedido = ({ 
    pedidos, 
    setPedidos,
    abrirModal
}) => {
    // Función para ver los detalles de un pedido
    const verDetalles = (pedido) => {
        abrirModal(pedido);
    };

    const enviarAProduccion = (nBolsa) => {
        const pedidosActualizados = pedidos.map(pedido => {
            if (pedido.bolsa === nBolsa) {
                return { ...pedido, estado: 'En Producción' };
            }
            return pedido;
        });
        setPedidos(pedidosActualizados);
    };

    const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'Pendiente');

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>Pedidos</h1>
                <Boton tipo="primario" onClick={() => abrirModal(null)}>
                    Crear Pedido ✚
                </Boton>
            </div>
            <TablaPedidos 
                pedidos={pedidosPendientes} 
                alEnviarProduccion={enviarAProduccion}
                alVerDetalles={verDetalles}
            />
        </div>
    );
};

export default Pedido;