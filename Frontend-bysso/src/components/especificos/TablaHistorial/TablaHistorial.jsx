import React from 'react';
import styles from './TablaHistorial.module.css';

const TablaHistorial = ({ pedidos }) => {
    
    return (
        <div className={styles.contenedorTabla}>
            <table className={styles.tabla}>
                <thead>
                    <tr>
                        <th># BOLSA</th>
                        <th>CLIENTE</th>
                        <th>TIPO</th>
                        <th>TOTAL</th>
                        <th>FECHA ENTREGA/CANCELACIÓN</th> 
                        <th>TRABAJADOR</th>
                        <th>ESTADO</th>
                    </tr>
                </thead>
                <tbody>
                    {pedidos.length === 0 ? (
                        <tr>
                            <td colSpan="7" className={styles.mensajeVacio}>
                                No hay pedidos entregados en el historial todavía.
                            </td>
                        </tr>
                    ) : (
                        pedidos.map(pedido => (
                            <tr key={pedido.id}>
                                <td data-label="# BOLSA">{pedido.bagId}</td>
                                <td data-label="CLIENTE">{pedido.cliente?.nombre}</td>
                                <td data-label="TIPO">{pedido.tipo}</td>
                                <td data-label="TOTAL">
                                    ${( (Number(pedido.abono) || 0) + (Number(pedido.total) || 0) ).toLocaleString('es-CO')}
                                </td>
                                <td data-label="FECHA ENTREGADO/CANCELADO">
                                    {pedido.estado === 'ENTREGADO' && pedido.fechaEntregaReal
                                        ? new Date(pedido.fechaEntregaReal).toLocaleDateString()
                                        : pedido.estado === 'CANCELADO' && pedido.fechaCancelacion
                                            ? new Date(pedido.fechaCancelacion).toLocaleDateString()
                                            : 'N/A'
                                    }
                                </td>
                                
                                <td data-label="TRABAJADOR">{pedido.trabajador?.nombre || 'N/A'}</td>
                               <td data-label="ESTADO" className={styles.colEstado}>
                                <span 
                                    className={
                                        pedido.estado === 'CANCELADO' 
                                            ? styles.badgeCancelado 
                                            : pedido.estado === 'ENTREGADO'
                                                ? styles.badgeEntregado
                                                : '' // Fallback or another style if needed
                                    }
                                >
                                    {pedido.estado}
                                </span>
                            </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TablaHistorial;