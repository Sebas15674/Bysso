import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleFinalizacion.module.css';

const formatCurrency = (num) => {
    const numberValue = Number(num);
    if (isNaN(numberValue) || numberValue === 0) {
        return '0';
    }
    return numberValue.toLocaleString('es-CO');
};

const DetalleFinalizacion = ({ pedido, alCerrarModal }) => {
    if (!pedido) {
        return null;
    }

    return (
        <div className={styles.contenedorDetalles}>
            <h2 className={styles.titulo}>Detalles del Pedido para Entrega</h2>
            <div className={styles.info}>

                <p><strong>Número de Bolsa:</strong> {pedido.bolsa}</p>
                <p><strong>Cliente:</strong> {pedido.cliente}</p>
                <p><strong>Celular:</strong> {pedido.celular}</p>
                <p><strong>Descripción:</strong> {pedido.descripcion}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Tipo:</strong> {pedido.tipo}</p>
                <p><strong>Fecha de Entrega:</strong> {pedido.fechaEntrega}</p>
                <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>

                <p><strong>Abono:</strong> ${formatCurrency(pedido.abono)}</p>

                <p><strong>Total:</strong> ${formatCurrency(pedido.total)}</p>

                <p><strong>Trabajador Asignado:</strong> {pedido.trabajadorAsignado}</p>

                {pedido.fechaFinalizacion && (
                    <p><strong>Fecha de Finalización:</strong> {pedido.fechaFinalizacion}</p>
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

export default DetalleFinalizacion;