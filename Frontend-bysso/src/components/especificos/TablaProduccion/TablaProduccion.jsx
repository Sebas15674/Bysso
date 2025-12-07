// src/components/especificos/TablaProduccion/TablaProduccion.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaProduccion.module.css';
import formatStatus from '../../../utils/formatStatus.jsx';

const TablaProduccion = ({ pedidos, alVerDetalles, alTomarPedido, alFinalizar }) => {
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
                    <Boton tipo="primario" onClick={() => alTomarPedido(pedido.bagId)}> 
                      Tomar 
                    </Boton>
                  )}
                  {pedido.estado === 'EN_PROCESO' && (
                    <Boton tipo="exito" onClick={() => alFinalizar(pedido.bagId)}>
                      Completar
                    </Boton>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TablaProduccion;