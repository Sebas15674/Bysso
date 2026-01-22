import React from 'react';
import styles from './TablaHistorial.module.css';
import formatStatus from '../../../utils/formatStatus.jsx';
import { snakeToTitleCase } from '../../../utils/formatText.js';
import idBadgeStyles from '../../../styles/IdBadge.module.css';

const TablaHistorial = ({ 
    pedidos,
    modoSeleccion,
    pedidosSeleccionados,
    alToggleSeleccion,
    alToggleSeleccionarTodos
}) => {
    
    const todosSeleccionados = pedidos.length > 0 && pedidosSeleccionados.length === pedidos.length;
    const colSpan = 8; // Always 8 columns now

    return (
        <div className={styles.contenedorTabla}>
            <table className={`${styles.tabla} ${modoSeleccion ? styles.modoSeleccion : ''}`}>
                <thead>
                    <tr>
                        <th className={styles.columnaCheckbox}>
                            <input
                                type="checkbox"
                                checked={todosSeleccionados}
                                onChange={() => alToggleSeleccionarTodos(todosSeleccionados)}
                                className={styles.checkboxControl}
                            />
                        </th>
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
                            <td colSpan={colSpan} className={styles.mensajeVacio}>
                                No hay pedidos entregados o cancelados en el historial todavía.
                            </td>
                        </tr>
                    ) : (
                        pedidos.map(pedido => (
                            <tr 
                                key={pedido.id}
                                className={pedidosSeleccionados.includes(pedido.id) ? styles.filaSeleccionada : ''}
                            >
                                <td className={styles.columnaCheckbox}>
                                    <input
                                        type="checkbox"
                                        checked={pedidosSeleccionados.includes(pedido.id)}
                                        onChange={() => alToggleSeleccion(pedido.id)}
                                        className={styles.checkboxControl}
                                    />
                                </td>
                                <td data-label="# BOLSA"><span className={idBadgeStyles.idBadge}>{pedido.bagId}</span></td>
                                <td data-label="CLIENTE">{pedido.cliente?.nombre}</td>
                                <td data-label="TIPO">{snakeToTitleCase(pedido.tipo)}</td>
                                <td data-label="TOTAL">
                                    ${(Number(pedido.total) || 0).toLocaleString('es-CO')}
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
                                    {formatStatus(pedido.estado)}
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