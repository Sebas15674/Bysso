import React, { useState } from 'react';
import styles from './Finalizacion.module.css';
import TablaFinalizacion from '../../components/especificos/TablaFinalizacion/TablaFinalizacion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetallePedido from '../../components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';

// Ahora acepta handleEntregarPedido para sincronizar la bolsa.
const Finalizacion = ({ pedidos, setPedidos, handleEntregarPedido }) => {
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    const abrirModal = () => setEstaModalAbierto(true);
    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };
    
    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido);
        abrirModal();
    };

    // CRÍTICO: Esta función ahora solo llama a la función global.
    // La función global (handleEntregarPedido en App.jsx) hace el trabajo completo:
    // 1. Cambia el estado del pedido a 'Entregado'.
    // 2. Libera la bolsa.
    const entregarPedidoSincronizado = (nBolsa) => {
        if (handleEntregarPedido) {
            handleEntregarPedido(nBolsa);
        } else {
            console.error("handleEntregarPedido no está definida. No se liberará la bolsa.");
        }
    };

    // Filtramos los pedidos que tienen el estado 'Listo para Entrega' y NO están 'Entregado'
    const pedidosListosParaEntrega = pedidos.filter(pedido => 
        pedido.estado === 'Listo para Entrega'
    );

    return (
        <div className={styles.contenedorPagina}>
            <h1 className={styles.tituloPagina}>Pedidos Listos para Entrega</h1>
            <TablaFinalizacion 
                pedidos={pedidosListosParaEntrega} 
                alVerDetalles={verDetalles}
                // Usamos la nueva función sincronizada
                alEntregarPedido={entregarPedidoSincronizado}
            />
            <Modal estaAbierto={estaModalAbierto} alCerrar={cerrarModal} cierraAlHacerClickAfuera={true}>
                <DetallePedido pedido={pedidoSeleccionado} alCerrarModal={cerrarModal}  />
            </Modal>
        </div>
    );
};

export default Finalizacion;