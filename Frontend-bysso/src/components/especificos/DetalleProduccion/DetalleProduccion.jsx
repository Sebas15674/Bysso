// src/components/especificos/DetalleProduccion/DetalleProduccion.jsx
import React, { useState, useEffect } from 'react'; // 🚨 IMPORTAR useEffect y useState
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleProduccion.module.css';

const DetalleProduccion = ({ pedido, alCerrarModal }) => {
    // Estado para guardar la URL temporal de la imagen
    const [imageURL, setImageURL] = useState(null); 

    useEffect(() => {
        // 1. Verificar si hay un archivo 'File' en el objeto pedido.imagen
        if (pedido && pedido.imagen instanceof File) {
            // Crea una URL temporal en memoria para el objeto File
            const url = URL.createObjectURL(pedido.imagen);
            setImageURL(url);

            // 2. Función de Limpieza: Esto es CRUCIAL. 
            // Libera la URL temporal cuando el componente se desmonte o el pedido cambie.
            return () => {
                URL.revokeObjectURL(url);
                setImageURL(null);
            };
        } else if (pedido && typeof pedido.imagen === 'string') {
            // Manejar el caso futuro donde el pedido.imagen sea una URL real del backend
            setImageURL(pedido.imagen);
        } else {
            setImageURL(null);
        }
    }, [pedido]); // Se ejecuta cada vez que el pedido cambia

    // Si el pedido es nulo o no se pudo generar la URL, no renderizar
    if (!pedido) {
        return null;
    }

    // =================================================================
    // 🎨 RENDERIZADO
    // =================================================================
    return (
        <div className={styles.contenedorDetalles}>
            <h2 className={styles.titulo}>Detalles del Pedido para Producción</h2>
            <div className={styles.info}>
                
                {/* ... (resto de la información) ... */}

                <p><strong>Número de Bolsa:</strong> {pedido.bolsa}</p>
                <p><strong>Descripción:</strong> {pedido.descripcion}</p>
                <p><strong>Tipo:</strong> {pedido.tipo}</p>
                <p><strong>Trabajador Asignado:</strong> {pedido.trabajadorAsignado}</p>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Fecha de Entrega:</strong> {pedido.fechaEntrega}</p>
                <p><strong>Número de Prendas:</strong> {pedido.prendas}</p>

                {/* 🚨 Usar la URL generada en el estado local */}
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