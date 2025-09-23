// src/components/especificos/DetallePedido/DetallePedido.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetallePedido.module.css';

const DetallePedido = ({ pedido, alCerrarModal, abrirModal }) => {
  if (!pedido) {
    return null;
  }

  return (
    <div className={styles.contenedorDetalles}>
      <h2 className={styles.titulo}>Detalles del Pedido</h2>
      <div className={styles.info}>

        <p><strong>Número de Bolsa:</strong> {pedido.bolsa}</p>
        <p><strong>Cliente:</strong> {pedido.cliente}</p>
        <p><strong>Celular:</strong> {pedido.celular}</p>
        <p><strong>Descripción:</strong> {pedido.descripcion}</p>
        <p><strong>Tipo:</strong> {pedido.tipo}</p>
        <p><strong>Trabajador Asignado:</strong> {pedido.trabajadorAsignado}</p>
        <p><strong>Fecha de Entrega:</strong> {pedido.fechaEntrega}</p>
        <p><strong>Estado:</strong> {pedido.estado}</p>
        <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>
        <p><strong>Abono:</strong> {pedido.abono}</p>
        <p><strong>Total:</strong> {pedido.total}</p>
        
      </div>
      <div className={styles.acciones}>
        <Boton tipo="primario" onClick={alCerrarModal}>
          Cerrar
        </Boton>
      </div>
    </div>
  );
};

export default DetallePedido;