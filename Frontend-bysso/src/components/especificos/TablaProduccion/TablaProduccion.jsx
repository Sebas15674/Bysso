// src/components/especificos/TablaProduccion/TablaProduccion.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaProduccion.module.css';

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
              <tr key={pedido.bolsa}>
                <td>{pedido.bolsa}</td>
                <td>{pedido.descripcion}</td>
                <td>{pedido.trabajadorAsignado}</td>
                <td>{pedido.estado}</td>
                <td className={styles.acciones}>
                  <Boton tipo="info" onClick={() => alVerDetalles(pedido)}>
                    Ver
                  </Boton>
                  {pedido.estado === 'En Producción' && (
                    <Boton tipo="primario" onClick={() => alTomarPedido(pedido.bolsa)}> 
                      Tomar 
                    </Boton>
                  )}
                  {pedido.estado === 'En Proceso' && (
                    <Boton tipo="exito" onClick={() => alFinalizar(pedido.bolsa)}>
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