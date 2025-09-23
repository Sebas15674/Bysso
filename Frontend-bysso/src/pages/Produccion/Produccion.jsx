import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Produccion.module.css';
import TablaProduccion from '../../components/especificos/TablaProduccion/TablaProduccion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetalleProduccion from '../../components/especificos/DetalleProduccion/DetalleProduccion.jsx';

const Produccion = ({ pedidos, setPedidos }) => {
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    // Nuevo: obtenemos los parámetros de búsqueda de la URL
    const [searchParams] = useSearchParams();
    const filtroEstado = searchParams.get('estado');

    const abrirModal = () => setEstaModalAbierto(true);
    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido);
        abrirModal();
    };
    
    // Filtramos los pedidos basándonos en el filtro de la URL
    // Si no hay filtro, mostramos todos los pedidos en producción o en proceso
    const pedidosFiltrados = pedidos.filter(pedido => {
        const esValido = pedido.estado === 'En Producción' || pedido.estado === 'En Proceso';
        if (filtroEstado) {
            return esValido && pedido.estado === filtroEstado;
        }
        return esValido;
    });

    const tomarPedido = (nBolsa) => {
        const pedidosActualizados = pedidos.map(pedido => {
            if (pedido.bolsa === nBolsa) {
                return { ...pedido, estado: 'En Proceso' };
            }
            return pedido;
        });
        setPedidos(pedidosActualizados);
    };

    const finalizarProduccion = (nBolsa) => {
        const fecha = new Date();
        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const año = fecha.getFullYear();
        const fechaFinalizacion = `${dia}-${mes}-${año}`;

        const pedidosActualizados = pedidos.map(pedido => {
            if (pedido.bolsa === nBolsa) {
                return {
                    ...pedido,
                    estado: 'Listo para Entrega',
                    fechaFinalizacion: fechaFinalizacion
                };
            }
            return pedido;
        });
        setPedidos(pedidosActualizados);
    };

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>
                    Ordenes de Producción
                    {filtroEstado && ` - (${filtroEstado})`}
                </h1>
            </div>
            <TablaProduccion
                pedidos={pedidosFiltrados}
                alVerDetalles={verDetalles}
                alTomarPedido={tomarPedido}
                alFinalizar={finalizarProduccion}
            />
            <Modal estaAbierto={estaModalAbierto} alCerrar={cerrarModal}
            cierraAlHacerClickAfuera={true}>
            
                <DetalleProduccion pedido={pedidoSeleccionado} alCerrarModal={cerrarModal} />
            </Modal>
        </div>
    );
};

export default Produccion;