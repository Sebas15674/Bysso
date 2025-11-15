import React, { useState, useMemo } from 'react';
import styles from './Finalizacion.module.css';
import TablaFinalizacion from '../../components/especificos/TablaFinalizacion/TablaFinalizacion.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import DetallePedido from '../../components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';
import Boton from '../../components/ui/Boton/Boton.jsx'; // Importamos Boton

// Ahora acepta handleEntregarPedido para sincronizar la bolsa.
const Finalizacion = ({ pedidos, setPedidos, handleEntregarPedido }) => {
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    // 🔑 NUEVO ESTADO PARA EL FILTRO DE TEXTO
    const [filtroTexto, setFiltroTexto] = useState('');

    const abrirModal = () => setEstaModalAbierto(true);
    
    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };
    
    const verDetalles = (pedido) => {
        setPedidoSeleccionado(pedido);
        abrirModal();
    };

    // CRÍTICO: Esta función ahora solo llama a la función global.
    const entregarPedidoSincronizado = (nBolsa) => {
        if (handleEntregarPedido) {
            handleEntregarPedido(nBolsa);
        } else {
            console.error("handleEntregarPedido no está definida. No se liberará la bolsa.");
        }
    };

    // 🔑 OPTIMIZACIÓN: useMemo para el filtrado.
    const pedidosListosParaEntrega = useMemo(() => {
        // 1. FILTRADO POR ESTADO BASE (Listo para Entrega)
        let listaFiltrada = pedidos.filter(pedido => 
            pedido.estado === 'Listo para Entrega'
        );

        // 2. FILTRADO POR TEXTO DE BÚSQUEDA
        if (filtroTexto.trim() !== '') {
            const textoBusqueda = filtroTexto.toLowerCase().trim();
            
            listaFiltrada = listaFiltrada.filter(p => {
                const bolsa = String(p.bolsa).toLowerCase();
                const cliente = p.cliente ? p.cliente.toLowerCase() : '';
                // También buscamos en la fecha de finalización
                const fecha = p.fechaFinalizacion ? p.fechaFinalizacion.toLowerCase() : '';
                
                return (
                    cliente.includes(textoBusqueda) ||
                    bolsa.includes(textoBusqueda) ||
                    fecha.includes(textoBusqueda)
                );
            });
        }
        
        return listaFiltrada;
        
    }, [pedidos, filtroTexto]); // ⬅️ Dependencia añadida para reactividad

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoFinalizacion}> {/* ⬅️ Nuevo contenedor flex para título y filtros */}
                <h1 className={styles.tituloPagina}>Pedidos Listos para Entrega</h1>
            </div>
            
            {/* 🔑 NUEVA BARRA DE FILTROS */}
            <div className={styles.barraFiltros}>
                <div className={styles.inputContainer}> 
                    <input 
                        type="text"
                        placeholder="Buscar"
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                    />
                </div>
            </div>

            <TablaFinalizacion 
                pedidos={pedidosListosParaEntrega} 
                alVerDetalles={verDetalles}
                alEntregarPedido={entregarPedidoSincronizado}
            />
            <Modal 
                estaAbierto={estaModalAbierto} 
                alCerrar={cerrarModal} 
                cierraAlHacerClickAfuera={true}
            >
                <DetallePedido 
                    pedido={pedidoSeleccionado} 
                    alCerrarModal={cerrarModal} 
                />
            </Modal>
        </div>
    );
};

export default Finalizacion;