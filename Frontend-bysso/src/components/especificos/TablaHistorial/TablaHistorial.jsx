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
                        <th>FECHA ENTREGA</th> 
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
                                <td data-label="# BOLSA">{pedido.bolsa}</td>
                                <td data-label="CLIENTE">{pedido.cliente}</td>
                                <td data-label="TIPO">{pedido.tipo}</td>
                                <td data-label="TOTAL">${(pedido.total || 0).toLocaleString('es-CO')}</td>
                                <td data-label="FECHA ENTREGA">
                                    {pedido.fechaEntregaReal || 'N/A'}
                                </td>
                                
                                <td data-label="TRABAJADOR">{pedido.trabajadorAsignado || 'N/A'}</td>
                               <td data-label="ESTADO" className={styles.colEstado}>
                                <span 
                                    // 🔑 CLAVE: Aplicar la clase condicional aquí
                                    className={
                                        pedido.estado === 'Cancelado' 
                                            ? styles.badgeCancelado // Nueva clase para Cancelado (rojo)
                                            : styles.badgeEntregado  // Clase existente para Entregado (verde)
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