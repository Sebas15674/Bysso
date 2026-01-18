// src/components/especificos/TablaFinalizacion/TablaFinalizacion.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaFinalizacion.module.css';
import formatStatus from '../../../utils/formatStatus.jsx';
import useConfirm from '../../../hooks/useConfirm.jsx'; // Added useConfirm import

const TablaFinalizacion = ({ pedidos, alVerDetalles, alEntregarPedido }) => {
  const { openConfirm, ConfirmDialog } = useConfirm(); // Initialize useConfirm

  const handleEntregarPedido = (bagId) => {
    openConfirm(
      `¿Estás seguro que deseas ENTREGAR el pedido con N° de Bolsa ${bagId}? Esta acción no se puede deshacer.`,
      () => alEntregarPedido(bagId) // Pass the original handler as the confirm callback
    );
  };

  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Nº Bolsa</th>
            <th>Cliente</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.mensajeVacio}>No hay pedidos listos para entrega.</td>
            </tr>
          ) : (
            pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.bagId}</td>
                <td>{pedido.cliente?.nombre}</td>
                <td>{pedido.descripcion}</td>
                <td>{formatStatus(pedido.estado)}</td>
                <td className={styles.acciones}>

                  <Boton tipo="info" onClick={() => alVerDetalles(pedido)}>
                    Ver
                  </Boton>
                  
                  <Boton tipo="exito" onClick={() => handleEntregarPedido(pedido.bagId)}>
                    Entregar
                  </Boton>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <ConfirmDialog /> {/* Render the ConfirmDialog component */}
    </div>
  );
};

export default TablaFinalizacion;