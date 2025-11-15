import React, { useState, useMemo } from 'react';
import styles from './Pedido.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaPedidos from '../../components/especificos/TablaPedidos/TablaPedidos.jsx';

// ⚠️ NOTA: Asumo que la función de ordenamiento 'sortPedidos'
// está definida en otro lugar o no es necesaria para este fragmento.

const Pedido = ({ 
    pedidos, 
    setPedidos,
    abrirModal,
    alCancelarPedidos // Prop para la cancelación
}) => {
    // 1. Estado para manejar la selección de bolsas (IDs de string)
    const [bolsasSeleccionadas, setBolsasSeleccionadas] = useState([]);
    
    // 2. Estado para controlar si los checkboxes están visibles
    const [modoSeleccion, setModoSeleccion] = useState(false);

    // 🔑 NUEVO: ESTADO PARA EL FILTRO DE TEXTO
    const [filtroTexto, setFiltroTexto] = useState('');

    // Filtra para mostrar SOLO los pedidos en estado 'Pendiente' (memorizado y filtrado por texto)
    const pedidosPendientes = useMemo(() => {
        let listaFiltrada = pedidos.filter(pedido => pedido.estado === 'Pendiente');
        
        // Lógica de Filtrado por Texto (Cliente, Bolsa o Tipo)
        if (filtroTexto.trim() !== '') {
            const textoBusqueda = filtroTexto.toLowerCase().trim();
            
            listaFiltrada = listaFiltrada.filter(p => {
                
                const bolsa = String(p.bolsa).toLowerCase(); 
                const tipo = p.tipo ? p.tipo.toLowerCase() : '';
                
                return (
                    bolsa.includes(textoBusqueda) ||
                    tipo.includes(textoBusqueda)
                );
            });
        }
        
        // Aquí deberías tener tu función de ordenamiento (si existe)
        // Ejemplo: return listaFiltrada.sort(sortPedidos);
        return listaFiltrada;

    }, [pedidos, filtroTexto]); // 🔑 CLAVE: Dependencia añadida para reactividad

    // Función para activar/desactivar el modo de selección
    const toggleModoSeleccion = () => {
        setModoSeleccion(prev => !prev);
        // Si desactivamos el modo, limpiamos la selección
        setBolsasSeleccionadas([]);
    };

    // Lógica para manejar la selección de una fila (checkbox)
    const toggleSeleccion = (nBolsa) => {
        setBolsasSeleccionadas(prev => 
            prev.includes(nBolsa)
                ? prev.filter(bolsa => bolsa !== nBolsa) // Deseleccionar
                : [...prev, nBolsa] // Seleccionar
        );
    };

    // Lógica para seleccionar/deseleccionar todos
    const toggleSeleccionarTodos = (estaSeleccionado) => {
        if (estaSeleccionado) {
            setBolsasSeleccionadas([]);
        } else {
            // Se seleccionan solo los que están actualmente visibles (filtrados)
            const todasLasBolsas = pedidosPendientes.map(p => p.bolsa); 
            setBolsasSeleccionadas(todasLasBolsas);
        }
    };


    // Función para ver los detalles de un pedido
    const verDetalles = (pedido) => {
        abrirModal(pedido);
    };

    const enviarAProduccion = (nBolsa) => {
        // Al enviar a producción, se deselecciona automáticamente (si estaba seleccionado)
        setBolsasSeleccionadas(prev => prev.filter(bolsa => bolsa !== nBolsa));
        
        const pedidosActualizados = pedidos.map(pedido => {
            if (pedido.bolsa === nBolsa) {
                // Estado: De 'Pendiente' a 'En Producción'
                return { ...pedido, estado: 'En Producción' };
            }
            return pedido;
        });
        setPedidos(pedidosActualizados);
    };
    
    // Función de acción para el botón de cancelar
    const handleCancelarSeleccionados = () => {
        if (bolsasSeleccionadas.length > 0) {
            alCancelarPedidos(bolsasSeleccionadas);
            setBolsasSeleccionadas([]); // Limpiar la selección después de la acción
            setModoSeleccion(false); // Salir del modo de selección
        }
    };


    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.encabezadoPedidos}>
                <h1 className={styles.tituloPagina}>Pedidos (Pendientes)</h1>
                
                {/* 🔑 USAMOS .controlesAcciones COMO CONTENEDOR FLEXBOX PARA ALINEAR A LA DERECHA */}
                <div className={styles.controlesAcciones}>

                    {/* Botón Crear Pedido (siempre visible) */}
                    <Boton 
                        tipo="primario" 
                        onClick={() => abrirModal(null)}
                        // Deshabilitado si estamos en modo selección para evitar confusiones
                        disabled={modoSeleccion} 
                    >
                        Crear Pedido ✚
                    </Boton>
                    
                    {/* Botón de Cancelar / Desactivar Selección */}
                    <Boton 
                        tipo={modoSeleccion ? "desactivar-cancelacion" : "peligro"} 
                        onClick={toggleModoSeleccion}
                    >
                        {modoSeleccion ? 'Descartar' : 'Cancelar 🗑️'}
                    </Boton>

                    {/* Botón de Confirmar Cancelación (Solo visible en modo selección Y con elementos seleccionados) */}
                    {modoSeleccion && bolsasSeleccionadas.length > 0 && (
                        <Boton 
                            tipo="peligro" 
                            onClick={handleCancelarSeleccionados}
                        >
                            Confirmar Cancelación ({bolsasSeleccionadas.length})
                        </Boton>
                    )}
                </div>
            </div>

            {/* ⬅️ ZONA DE LA BARRA DE FILTROS 🔑 */}
            <div className={styles.barraFiltros}>
                <input 
                    type="text"
                    placeholder="Buscar por bolsa o tipo "
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className={styles.inputFiltro}
                />
            </div>
            
            <TablaPedidos 
                pedidos={pedidosPendientes} 
                alEnviarProduccion={enviarAProduccion}
                alVerDetalles={verDetalles}
                modoSeleccion={modoSeleccion} // Nuevo: Indica si mostrar los checkboxes
                bolsasSeleccionadas={bolsasSeleccionadas}
                alToggleSeleccion={toggleSeleccion}
                alToggleSeleccionarTodos={toggleSeleccionarTodos}
            />
        </div>
    );
};

export default Pedido;