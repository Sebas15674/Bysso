// src/components/especificos/TablaPedidos/TablaPedidos.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaPedidos.module.css';

const TablaPedidos = ({ pedidos, alVerDetalles, alEnviarProduccion }) => {
  return (
    <div className={styles.contenedorTabla}>
      <table className={styles.tabla}>
        <thead>
          <tr>
            <th>Nº Bolsa</th>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.mensajeVacio}>No hay pedidos para mostrar.</td>
            </tr>
          ) : (
            pedidos.map(pedido => (
              <tr key={pedido.bolsa}>
                <td>{pedido.bolsa}</td>
                <td>{pedido.tipo}</td>
                <td>{pedido.descripcion}</td>
                <td>{pedido.estado}</td>
                <td className={styles.acciones}>

                  <Boton tipo="info" onClick={() => alVerDetalles(pedido)}>
                    Ver
                  </Boton>
                  
                  {alEnviarProduccion && (
                    <Boton tipo="primario" onClick={() => alEnviarProduccion(pedido.bolsa)}>
                      Enviar 
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

export default TablaPedidos;