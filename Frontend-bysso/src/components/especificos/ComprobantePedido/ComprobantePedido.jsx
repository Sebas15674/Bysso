// Frontend-bysso/src/components/especificos/ComprobantePedido/ComprobantePedido.jsx
import React from 'react';
import styles from './ComprobantePedido.module.css';
import logoBysso from '../../../assets/images/Logo.png'; // Assuming logo path is correct
import formatStatus from '../../../utils/formatStatus.jsx';
import { snakeToTitleCase } from '../../../utils/formatText.js';

const ComprobantePedido = React.forwardRef(({ pedido }, ref) => {
    if (!pedido) {
        return null;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-CO');
    };

    const formatCurrency = (num) => {
        const numberValue = Number(num);
        if (isNaN(numberValue)) return '$0';
        return '$' + numberValue.toLocaleString('es-CO');
    };

    return (
        <div ref={ref} className={styles.comprobante}>
            <div className={styles.header}>
                <img src={logoBysso} alt="Logo Bysso" className={styles.logo} />
                <h1 className={styles.titulo}>Comprobante de Pedido</h1>
                <p className={styles.subtitulo}>Número de Bolsa: {pedido.bagId}</p>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                    <strong>Cliente</strong>
                    {pedido.cliente?.nombre || 'N/A'}
                </div>
                <div className={styles.infoItem}>
                    <strong>Cédula / NIT</strong>
                    {pedido.cliente?.cedula || 'N/A'}
                </div>
                <div className={styles.infoItem}>
                    <strong>Celular</strong>
                    {pedido.cliente?.celular || 'N/A'}
                </div>
                <div className={styles.infoItem}>
                    <strong>Estado del Pedido</strong>
                    {formatStatus(pedido.estado)}
                </div>
                <div className={styles.infoItem}>
                    <strong>Tipo de Trabajo</strong>
                    {snakeToTitleCase(pedido.tipo)}
                </div>
                <div className={styles.infoItem}>
                    <strong>Fecha de Entrega</strong>
                    {formatDate(pedido.fechaEntrega)}
                </div>
                <div className={styles.infoItem}>
                    <strong>Nº de Prendas</strong>
                    {pedido.prendas}
                </div>
                <div className={styles.infoItem}>
                    <strong>Trabajador Asignado</strong>
                    {pedido.trabajador?.nombre || 'N/A'}
                </div>
                <div className={`${styles.infoItem} ${styles.descripcion}`}>
                    <strong>Descripción</strong>
                    {pedido.descripcion || 'Sin descripción.'}
                </div>
                <div className={styles.infoItem}>
                    <strong>Abono</strong>
                    {formatCurrency(pedido.abono)}
                </div>
                <div className={styles.infoItem}>
                    <strong>Total</strong>
                    {formatCurrency(pedido.total)}
                </div>
            </div>

            <div className={styles.footer}>
                <p>Gracias por su confianza.</p>
                <p className={styles.disclaimer}>
                    Si el pedido no es reclamado dentro de los treinta (30) días calendario posteriores a su notificación, no se procederá con la entrega.
                </p>
            </div>
        </div>
    );
});

export default ComprobantePedido;