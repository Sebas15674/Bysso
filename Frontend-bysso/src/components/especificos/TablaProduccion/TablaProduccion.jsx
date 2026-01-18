// src/components/especificos/TablaProduccion/TablaProduccion.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaProduccion.module.css';
import formatStatus from '../../../utils/formatStatus.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import useConfirm from '../../../hooks/useConfirm.jsx'; // Added useConfirm import

const TablaProduccion = ({ pedidos, alVerDetalles, alTomarPedido, alFinalizar }) => {
  const { user } = useAuth();
  const { openConfirm, ConfirmDialog } = useConfirm(); // Initialize useConfirm

  const handleTomarPedido = (bagId) => {
    openConfirm(
      `¿Estás seguro de que deseas TOMAR el pedido con N° de Bolsa ${bagId}?`,
      () => alTomarPedido(bagId) // Pass the original handler as the confirm callback
    );
  };

  const handleCompletarPedido = (bagId) => {
    openConfirm(
      `¿Estás seguro de que deseas COMPLETAR/FINALIZAR el pedido con N° de Bolsa ${bagId}?`,
      () => alFinalizar(bagId) // Pass the original handler as the confirm callback
    );
  };

  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Nº Bolsa</th>
            <th>Descripción</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.mensajeVacio}>No hay pedidos en producción.</td>
            </tr>
          ) : (
            pedidos.map(pedido => (
              <tr key={pedido.id}>
                <td>{pedido.bagId}</td>
                <td>{pedido.descripcion}</td>
                <td>{pedido.trabajador?.nombre}</td>
                <td>{formatStatus(pedido.estado)}</td>
                <td className={styles.acciones}>
                  <Boton tipo="info" onClick={() => alVerDetalles(pedido)}>
                    Ver
                  </Boton>
                  {pedido.estado === 'EN_PRODUCCION' && (
                    <Boton tipo="primario" onClick={() => handleTomarPedido(pedido.bagId)}> 
                      Tomar 
                    </Boton>
                  )}
                  {pedido.estado === 'EN_PROCESO' && user?.role?.toUpperCase() === 'SUPER_ADMIN' && (
                    <Boton tipo="exito" onClick={() => handleCompletarPedido(pedido.bagId)}>
                      Completar
                    </Boton>
                  )}
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

export default TablaProduccion;