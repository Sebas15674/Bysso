import React, { useState, useEffect } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleFinalizacion.module.css';
import baseStyles from '../../../styles/DetalleModalBase.module.css';
import { getPedidoById } from '../../../services/pedidosService.js';
import formatStatus from '../../../utils/formatStatus.jsx';

const formatCurrency = (num) => {
    const numberValue = Number(num);
    if (isNaN(numberValue) || numberValue === 0) {
        return '$0';
    }
    return '$' + numberValue.toLocaleString('es-CO');
};

const DetalleFinalizacion = ({ pedidoId, alCerrarModal }) => {
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (pedidoId) {
            const fetchPedidoDetalle = async () => {
                try {
                    setLoading(true);
                    const data = await getPedidoById(pedidoId);
                    setPedido(data);
                } catch (err) {
                    setError(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchPedidoDetalle();
        } else {
            setPedido(null);
            setLoading(false);
        }
    }, [pedidoId]);

    if (loading) {
        return <div className={baseStyles.modalDetalleContent}><p>Cargando detalles...</p></div>;
    }

    if (error) {
        return <div className={baseStyles.modalDetalleContent}><p>Error: {error.message}</p></div>;
    }
    
    if (!pedido) {
        return null;
    }

    return (
        <div className={baseStyles.modalDetalleContent}>
            <div className={baseStyles.header}>
                <h2 className={baseStyles.titulo}>Detalles del Pedido para Entrega</h2>
                <button onClick={alCerrarModal} className={baseStyles.closeButton} aria-label="Cerrar modal">&times;</button>
            </div>
            <div className={baseStyles.body}>
                <div className={baseStyles.info}>
                    <p><strong>Número de Bolsa:</strong> {pedido.bagId}</p>
                    <p><strong>Cliente:</strong> {pedido.cliente?.nombre}</p>
                    <p><strong>Celular:</strong> {pedido.cliente?.celular}</p>
                    <p><strong>Descripción:</strong> {pedido.descripcion}</p>
                    <p><strong>Estado:</strong> {formatStatus(pedido.estado)}</p>
                    <p><strong>Tipo:</strong> {pedido.tipo}</p>
                    <p><strong>Fecha de Entrega:</strong> {(() => {
                        const dateString = pedido.fechaEntrega;
                        if (!dateString) return 'N/A';
                        const dateParts = dateString.split('T')[0].split('-');
                        if (dateParts.length < 3) return 'Fecha inválida';
                        const year = parseInt(dateParts[0]);
                        const month = parseInt(dateParts[1]) - 1;
                        const day = parseInt(dateParts[2]);
                        return new Date(year, month, day).toLocaleDateString('es-CO');
                    })()}</p>
                    <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>
                    <p><strong>Abono:</strong> {formatCurrency(pedido.abono)}</p>
                    <p><strong>Total:</strong> {formatCurrency(pedido.total)}</p>
                    <p><strong>Trabajador Asignado:</strong> {pedido.trabajador?.nombre}</p>
                    {pedido.fechaFinalizacion && (
                        <p><strong>Fecha de Finalización:</strong> {new Date(pedido.fechaFinalizacion).toLocaleDateString('es-CO', { timeZone: 'UTC' })}</p>
                    )}
                </div>
            </div>
            <div className={baseStyles.acciones}>
                <Boton tipo="cerrar_modal" onClick={alCerrarModal}>
                    Cerrar
                </Boton>
            </div>
        </div>
    );
};

export default DetalleFinalizacion;