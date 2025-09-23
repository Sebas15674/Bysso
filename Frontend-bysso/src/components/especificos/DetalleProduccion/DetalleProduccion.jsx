// src/components/especificos/DetalleProduccion/DetalleProduccion.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleProduccion.module.css';

const DetalleProduccion = ({ pedido, alCerrarModal }) => {
  if (!pedido) {
    return null;
  }

  return (
    <div className={styles.contenedorDetalles}>
      <h2 className={styles.titulo}>Detalles del Pedido para Producción</h2>
      <div className={styles.info}>

        <p><strong>Número de Bolsa:</strong> {pedido.bolsa}</p>
        <p><strong>Descripción:</strong> {pedido.descripcion}</p>
        <p><strong>Tipo:</strong> {pedido.tipo}</p>
        <p><strong>Trabajador Asignado:</strong> {pedido.trabajadorAsignado}</p>
        <p><strong>Estado:</strong> {pedido.estado}</p>
        <p><strong>Fecha de Entrega:</strong> {pedido.fechaEntrega}</p>
        <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>
        {pedido.imagen && (
            <div className={styles.contenedorImagen}>
              <p><strong>Imagen del diseño:</strong></p>
              <img src={pedido.imagen} alt="Diseño del pedido" className={styles.imagen} />
            </div>
          )}
      </div>
      <div className={styles.acciones}>
        <Boton tipo="primario" onClick={alCerrarModal}>
          Cerrar
        </Boton>
      </div>
    </div>
  );
};

export default DetalleProduccion;