import React, { useState } from 'react'; // 🚨 Importamos useState
import styles from './Pedido.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaPedidos from '../../components/especificos/TablaPedidos/TablaPedidos.jsx';

// 🚨 Recibimos alCancelarPedidos como prop
const Pedido = ({ 
    pedidos, 
    setPedidos,
    abrirModal,
    alCancelarPedidos // Nueva prop para cancelar
}) => {
    // Estado para guardar los IDs de los pedidos seleccionados
    const [selectedPedidoIds, setSelectedPedidoIds] = useState([]); 

    // Función para ver los detalles de un pedido
    const verDetalles = (pedido) => {
        abrirModal(pedido);
    };

    // Función para manejar la selección/deselección de un pedido
    const handleSelectPedido = (id) => {
        setSelectedPedidoIds(prevIds => {
            if (prevIds.includes(id)) {
                return prevIds.filter(itemId => itemId !== id); // Deseleccionar
            } else {
                return [...prevIds, id]; // Seleccionar
            }
        });
    };
    
    // Función para seleccionar/deseleccionar todos
    const handleSelectAll = (isChecked) => {
        if (isChecked) {
            const allIds = pedidosPendientes.map(p => p.id);
            setSelectedPedidoIds(allIds);
        } else {
            setSelectedPedidoIds([]);
        }
    };
    
    // Acción que llama a la función central en App.jsx
    const handleCancelarSeleccionados = () => {
        if (selectedPedidoIds.length === 0) {
            alert('Debes seleccionar al menos un pedido para cancelar.');
            return;
        }

        if (window.confirm(`¿Está seguro de CANCELAR los ${selectedPedidoIds.length} pedidos seleccionados? Se enviarán al historial con estado 'Cancelado' y sus bolsas se liberarán.`)) {
            alCancelarPedidos(selectedPedidoIds);
            setSelectedPedidoIds([]); // Limpiar selección después de la acción
        }
    };

    // La función enviarAProduccion se mantiene igual
    const enviarAProduccion = (nBolsa) => {
        const pedidosActualizados = pedidos.map(pedido => {
            if (pedido.bolsa === nBolsa) {
                // Estado: De 'Pendiente' a 'En Producción'
                return { ...pedido, estado: 'En Producción' };
            }
            return pedido;
        });
        setPedidos(pedidosActualizados);
    };

    // CRÍTICO: Filtra para mostrar SOLO los pedidos en estado 'Pendiente'. 
    const pedidosPendientes = pedidos.filter(pedido => pedido.estado === 'Pendiente');
    
    const isAllSelected = selectedPedidoIds.length === pedidosPendientes.length && pedidosPendientes.length > 0;

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>Pedidos (Pendientes)</h1>
                {/* Botón para crear */}
                <Boton tipo="primario" onClick={() => abrirModal(null)}>
                    Crear Pedido ✚
                </Boton>
                {/* 🚨 Nuevo Botón de Cancelación Masiva */}
                <Boton 
                    tipo="peligro" 
                    onClick={handleCancelarSeleccionados}
                    disabled={selectedPedidoIds.length === 0} 
                >
                    Cancelar Seleccionados ({selectedPedidoIds.length}) 🗑️
                </Boton>
            </div>
            <TablaPedidos 
                pedidos={pedidosPendientes} 
                alEnviarProduccion={enviarAProduccion}
                alVerDetalles={verDetalles}
                // 🚨 Nuevas Props para la Selección
                selectedIds={selectedPedidoIds}
                onSelectRow={handleSelectPedido}
                onSelectAll={handleSelectAll}
                isAllSelected={isAllSelected}
            />
        </div>
    );
};

export default Pedido;