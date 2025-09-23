// src/pages/Finalizacion/Finalizacion.jsx
import React, { useState } from 'react';
import styles from './Finalizacion.module.css';
import TablaFinalizacion from '../../components/especificos/TablaFinalizacion/TablaFinalizacion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetallePedido from '../../components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';

const Finalizacion = ({ pedidos, setPedidos }) => {
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

  const entregarPedido = (nBolsa) => {
    const pedidosActualizados = pedidos.map(pedido => {
      if (pedido.bolsa === nBolsa) {
        return { ...pedido, estado: 'Entregado' };
      }
      return pedido;
    });
    setPedidos(pedidosActualizados);
  };

  // Filtramos los pedidos que tienen el estado 'Listo para Entrega'
  const pedidosListosParaEntrega = pedidos.filter(pedido => pedido.estado === 'Listo para Entrega');

  return (
    <div className={styles.contenedorPagina}>
      <h1 className={styles.tituloPagina}>Pedidos Listos para Entrega</h1>
      <TablaFinalizacion 
        pedidos={pedidosListosParaEntrega} 
        alVerDetalles={verDetalles}
        alEntregarPedido={entregarPedido}
      />
      <Modal estaAbierto={estaModalAbierto} alCerrar={cerrarModal} cierraAlHacerClickAfuera={true}>
        <DetallePedido pedido={pedidoSeleccionado} alCerrarModal={cerrarModal}  />
      </Modal>
    </div>
  );
};

export default Finalizacion;