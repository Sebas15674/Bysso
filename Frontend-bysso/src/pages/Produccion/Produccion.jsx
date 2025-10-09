import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Produccion.module.css';
import TablaProduccion from '../../components/especificos/TablaProduccion/TablaProduccion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetalleProduccion from '../../components/especificos/DetalleProduccion/DetalleProduccion.jsx';

const Produccion = ({ pedidos, setPedidos }) => {
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

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
    
    // CRÍTICO: El filtro ahora excluye explícitamente los estados finales ('Listo para Entrega', 'Entregado')
    const pedidosFiltrados = pedidos.filter(pedido => {
        // Los pedidos activos en producción son: 'En Producción' o 'En Proceso'
        const estadoActivo = pedido.estado === 'En Producción' || pedido.estado === 'En Proceso';

        // Aseguramos que NO esté en un estado de entrega o historial
        const esExcluido = pedido.estado === 'Listo para Entrega' || pedido.estado === 'Entregado';
        
        if (esExcluido) return false;

        // Si hay un filtro de URL, aplicarlo solo a los estados activos
        if (filtroEstado) {
             // Solo muestra si el estado coincide con el filtro y está activo
            return estadoActivo && pedido.estado === filtroEstado;
        }

        // Si no hay filtro de URL, muestra todos los estados activos
        return estadoActivo;
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