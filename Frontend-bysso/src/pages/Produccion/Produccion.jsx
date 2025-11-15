import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Produccion.module.css';
import TablaProduccion from '../../components/especificos/TablaProduccion/TablaProduccion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetalleProduccion from '../../components/especificos/DetalleProduccion/DetalleProduccion.jsx';

const Produccion = ({ pedidos, setPedidos }) => {
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    
    // 🔑 NUEVO ESTADO PARA EL FILTRO DE TEXTO
    const [filtroTexto, setFiltroTexto] = useState('');

    const [searchParams] = useSearchParams();
    const filtroEstadoURL = searchParams.get('estado');

    const abrirModal = () => setEstaModalAbierto(true);
    
    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido);
        abrirModal();
    };
    
    // 🔑 OPTIMIZACIÓN: useMemo para el filtrado complejo
    const pedidosFiltrados = useMemo(() => {
        // 1. FILTRADO POR ESTADO BASE (Activos en Producción)
        let listaFiltrada = pedidos.filter(pedido => {
            const estadoActivo = pedido.estado === 'En Producción' || pedido.estado === 'En Proceso';

            // Excluir estados finales o cancelados
            const esExcluido = pedido.estado === 'Listo para Entrega' || pedido.estado === 'Entregado' || pedido.estado === 'Cancelado';
            
            if (esExcluido) return false;

            // Aplica filtro de URL si existe
            if (filtroEstadoURL) {
                return estadoActivo && pedido.estado === filtroEstadoURL;
            }

            // Muestra todos los estados activos si no hay filtro de URL
            return estadoActivo;
        });
        
        // 2. FILTRADO POR TEXTO DE BÚSQUEDA
        if (filtroTexto.trim() !== '') {
            const textoBusqueda = filtroTexto.toLowerCase().trim();
            
            listaFiltrada = listaFiltrada.filter(p => {
                const bolsa = String(p.bolsa).toLowerCase(); 
                const cliente = p.cliente ? p.cliente.toLowerCase() : '';
                const descripcion = p.descripcion ? p.descripcion.toLowerCase() : '';
                const estado = p.estado ? p.estado.toLowerCase() : '';
                
                return (
                    cliente.includes(textoBusqueda) ||
                    bolsa.includes(textoBusqueda) ||
                    descripcion.includes(textoBusqueda) ||
                    estado.includes(textoBusqueda)
                );
            });
        }
        
        return listaFiltrada;
        
    }, [pedidos, filtroEstadoURL, filtroTexto]); // ⬅️ Dependencias para re-ejecutar solo cuando es necesario

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
                    {filtroEstadoURL && ` - (${filtroEstadoURL})`}
                </h1>
            </div>
            
            {/* 🔑 NUEVA BARRA DE FILTROS */}
            <div className={styles.barraFiltros}>
                <div className={styles.inputContainer}> 
                    <input 
                        type="text"
                        placeholder="Buscar "
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                    />
                </div>
            </div>

            <TablaProduccion
                pedidos={pedidosFiltrados}
                alVerDetalles={verDetalles}
                alTomarPedido={tomarPedido}
                alFinalizar={finalizarProduccion}
            />
            <Modal 
                estaAbierto={estaModalAbierto} 
                alCerrar={cerrarModal}
                cierraAlHacerClickAfuera={true}
            >
                <DetalleProduccion 
                    pedido={pedidoSeleccionado} 
                    alCerrarModal={cerrarModal} 
                />
            </Modal>
        </div>
    );
};

export default Produccion;