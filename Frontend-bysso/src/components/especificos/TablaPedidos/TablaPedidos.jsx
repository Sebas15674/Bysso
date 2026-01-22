// src/components/especificos/TablaPedidos/TablaPedidos.jsx
import React from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './TablaPedidos.module.css';
import formatStatus from '../../../utils/formatStatus.jsx';
import { snakeToTitleCase } from '../../../utils/formatText.js';
import idBadgeStyles from '../../../styles/IdBadge.module.css';

const TablaPedidos = ({ 
    pedidos, 
    alVerDetalles, 
    alEnviarProduccion,
    modoSeleccion, 
    bolsasSeleccionadas, 
    alToggleSeleccion, 
    alToggleSeleccionarTodos,
    loading,
    highlightedPedidoId // <--- Añadida la prop highlightedPedidoId
}) => {
    
    // Calcular si todos los pedidos visibles están seleccionados
    const todosSeleccionados = pedidos.length > 0 && bolsasSeleccionadas.length === pedidos.length;

    // Número de columnas base (5: Bolsa, Tipo, Desc, Estado, Acción)
    const colSpan = modoSeleccion ? 6 : 5; 

    return (
        <div 
            className={styles.contenedorTabla} 
        >
            <table className={styles.tabla}>
                <thead>
                    <tr className={modoSeleccion ? styles.modoSeleccion : ''}> {/* CLAVE: Clase condicional */}
                        {/* CHECKBOX DE SELECCIÓN MASIVA (Solo visible en modoSeleccion) */}
                        {modoSeleccion && (
                            <th>
                                <input
                                    type="checkbox"
                                    checked={todosSeleccionados}
                                    onChange={() => alToggleSeleccionarTodos(todosSeleccionados)}
                                    className={styles.checkboxControl}
                                />
                            </th>
                        )}
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
                            <td colSpan={colSpan} className={styles.mensajeVacio}>No hay pedidos para mostrar.</td>
                        </tr>
                    ) : (
                        pedidos.map(pedido => (
                            <tr 
                                key={pedido.id} // Use the unique order ID as key
                                className={`${bolsasSeleccionadas.includes(pedido.bagId) ? styles.filaSeleccionada : ''} ${modoSeleccion ? styles.modoSeleccion : ''} ${pedido.id === highlightedPedidoId ? styles.highlightedRow : ''}`}
                            >
                                {/* CHECKBOX INDIVIDUAL (Solo visible en modoSeleccion) */}
                                {modoSeleccion && (
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={bolsasSeleccionadas.includes(pedido.bagId)}
                                            onChange={() => alToggleSeleccion(pedido.bagId)}
                                            className={styles.checkboxControl}
                                        />
                                    </td>
                                )}
                                <td><span className={idBadgeStyles.idBadge}>{pedido.bagId}</span></td>
                                <td>{snakeToTitleCase(pedido.tipo)}</td>
                                <td>{pedido.descripcion}</td>
                                <td>{formatStatus(pedido.estado)}</td>
                                <td className={styles.acciones}>

                                    <Boton tipo="info" onClick={() => alVerDetalles(pedido)} disabled={modoSeleccion}>
                                        Ver
                                    </Boton>
                                    
                                    {alEnviarProduccion && (
                                        <Boton tipo="primario" onClick={() => alEnviarProduccion(pedido.bagId)} disabled={modoSeleccion}>
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