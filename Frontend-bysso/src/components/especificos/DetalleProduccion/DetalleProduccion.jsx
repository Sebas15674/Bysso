// src/components/especificos/DetalleProduccion/DetalleProduccion.jsx
import React, { useState, useEffect } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleProduccion.module.css';
import { getPedidoById } from '../../../services/pedidosService.js';

const DetalleProduccion = ({ pedidoId, alCerrarModal }) => {
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
            setPedido(null); // Clear pedido if pedidoId is null
            setLoading(false);
        }
    }, [pedidoId]);

    if (loading) {
        return <div className={styles.contenedorDetalles}><p>Cargando detalles del pedido...</p></div>;
    }

    if (error) {
        return <div className={styles.contenedorDetalles}><p>Error al cargar los detalles: {error.message}</p></div>;
    }

    if (!pedido) {
        return null;
    }

    const imageURL = pedido.imagenUrl ? `http://localhost:3000${pedido.imagenUrl}` : null;

    return (
        <div className={styles.contenedorDetalles}>
            <h2 className={styles.titulo}>Detalles del Pedido para Producción</h2>
            <div className={styles.info}>
                <p><strong>Número de Bolsa:</strong> {pedido.bagId}</p>
                <p><strong>Descripción:</strong> {pedido.descripcion}</p>
                <p><strong>Tipo:</strong> {pedido.tipo}</p>
                <p><strong>Trabajador Asignado:</strong> {pedido.trabajador?.nombre}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Fecha de Entrega:</strong> {new Date(pedido.fechaEntrega).toLocaleDateString()}</p>
                <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>

                {imageURL && (
                    <div className={styles.contenedorImagen}>
                        <p><strong>Imagen del diseño:</strong></p>
                        <img 
                            src={imageURL} 
                            alt="Diseño del pedido" 
                            className={styles.imagen} 
                        />
                    </div>
                )}
                {!imageURL && <p><strong>Imagen del diseño:</strong> No disponible</p>}
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