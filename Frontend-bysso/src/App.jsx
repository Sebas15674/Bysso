import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar/Sidebar.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import Modal from './components/ui/Modal/Modal.jsx';
import FormularioPedido from './components/especificos/FormularioPedido/FormularioPedido.jsx';
import DetallePedido from './components/especificos/DetallePedido/DetallePedido.jsx';
import Home from './pages/Home/Home.jsx'; 
import Pedido from './pages/Pedido/Pedido.jsx'; 
import Produccion from './pages/Produccion/Produccion.jsx'; 
import Finalizacion from './pages/Finalizacion/Finalizacion.jsx'; 
import Historial from './pages/Historial/Historial.jsx'; 

import './styles/main.css';

// ----------------------------------------------------------------------
// LÓGICA DE BOLSAS ALFANUMÉRICAS (STRING IDs)
// ----------------------------------------------------------------------

/**
 * Función de ordenamiento alfanumérico (ej: '1a' < '1v' < '2a' < '21').
 */
const sortBags = (a, b) => {
    // Aseguramos que 'a' y 'b' sean strings antes de usarlos
    const strA = String(a);
    const strB = String(b);
    
    // Extrae el número y la letra opcional
    const regex = /(\d+)([a-z])?/; 
    const matchA = strA.match(regex);
    const matchB = strB.match(regex);

    if (!matchA || !matchB) return 0;

    const numA = parseInt(matchA[1], 10);
    const numB = parseInt(matchB[1], 10);
    const charA = matchA[2] || '';
    const charB = matchB[2] || '';

    if (numA !== numB) {
        return numA - numB; // Ordena por número principal
    }

    // Si los números son iguales, ordena por la letra ('a' antes que 'v')
    if (charA < charB) return -1;
    if (charA > charB) return 1;

    return 0;
};

const inicializarBolsas = () => {
    const bolsas = [];
    const tipos = ['a', 'v']; // 'a' para azul, 'v' para verde

    // 1. Bolsas Duales (1 al 20) -> '1a', '1v', ..., '20a', '20v'
    for (let i = 1; i <= 20; i++) {
        tipos.forEach(tipo => {
            bolsas.push(`${i}${tipo}`); 
        });
    }

    // 2. Bolsas Simples (21 al 180) -> '21', '22', ..., '180'
    for (let i = 21; i <= 180; i++) {
        bolsas.push(String(i)); 
    }

    // Devolvemos las bolsas ya ordenadas.
    return bolsas.sort(sortBags); 
};


// ----------------------------------------------------------------------

const AppLayout = ({ 
    pedidos, setPedidos, 
    bolsasDisponibles, setBolsasDisponibles, 
    bolsasOcupadas, setBolsasOcupadas 
}) => {
    const [estaMenuAbierto, setEstaMenuAbierto] = useState(false);
    const abrirMenu = () => setEstaMenuAbierto(true);
    const cerrarMenu = () => setEstaMenuAbierto(false);
    const location = useLocation();

    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    const abrirModal = (pedido) => {
        setPedidoSeleccionado(pedido || null);
        setEstaModalAbierto(true);
    };

    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const getTituloPagina = (path) => {
        switch (path) {
            case '/pedidos': return 'Orden de Pedidos';
            case '/produccion': return 'Producción';
            case '/finalizacion': return 'Pedidos para Entrega';
            case '/historial': return 'Historial de Entregas'; 
            case '/': return 'Dashboard';
            default: return 'Dashboard';
        }
    };
    
    /**
     * FUNCIÓN DE CREACIÓN: Recibe FormData, extrae los datos y el File.
     */
    const agregarPedido = (formData) => {
        const dataString = formData.get('data');
        const imagenFile = formData.get('imagen'); 
        
        if (!dataString) return;

        let nuevosDatos;
        try {
            nuevosDatos = JSON.parse(dataString);
        } catch (e) {
            console.error("Error al parsear el JSON de nuevosDatos:", e);
            return;
        }

        // CLAVE: bolsaAsignada es un STRING
        const bolsaAsignada = String(nuevosDatos.bolsa); 
        const nuevasBolsasDisponibles = bolsasDisponibles.filter(bolsa => bolsa !== bolsaAsignada).sort(sortBags);
        const nuevasBolsasOcupadas = [...bolsasOcupadas, bolsaAsignada].sort(sortBags);
        
        setBolsasDisponibles(nuevasBolsasDisponibles);
        setBolsasOcupadas(nuevasBolsasOcupadas);

        // Crear el nuevo pedido
        const nuevoPedido = { 
            ...nuevosDatos, 
            id: Date.now(), 
            bolsa: bolsaAsignada, // Aquí queda como STRING
            estado: 'Pendiente',
            imagen: imagenFile instanceof File ? imagenFile : null, 
        };
        
        setPedidos([...pedidos, nuevoPedido]);
        cerrarModal();
    };

    /**
     * FUNCIÓN DE EDICIÓN: Recibe FormData y actualiza el pedido existente.
     */
    const handleEditarPedidoLocal = (formData) => {
        const dataString = formData.get('data');
        const imagenFile = formData.get('imagen');
        
        if (!dataString) return;

        let datosActualizados;
        try {
            datosActualizados = JSON.parse(dataString);
        } catch (e) {
            console.error("Error al parsear el JSON de datosActualizados:", e);
            return;
        }

        const pedidoId = datosActualizados.id; 

        setPedidos(prevPedidos => 
            prevPedidos.map(pedido => {
                if (pedido.id === pedidoId) {
                    
                    let imagenFinal = pedido.imagen;

                    // Lógica de Imagen: La imagen puede ser un File (nueva), null (eliminada), o un string/objeto (original).
                    if (imagenFile instanceof File) {
                        imagenFinal = imagenFile; 
                    } else if (datosActualizados.imagen === null) {
                        // El modal envió `imagen: null` (se borró la imagen)
                        imagenFinal = null;
                    } else if (datosActualizados.imagen === 'FILE_UPLOADING') {
                        // El modal tenía una imagen File cargada, pero no se envió un nuevo File.
                        imagenFinal = pedido.imagen;
                    } else {
                        // Mantiene la imagen original si no hay cambios.
                        imagenFinal = pedido.imagen; 
                    }
                    
                    return { 
                        ...datosActualizados, 
                        // ✅ CLAVE: La bolsa ya viene como STRING desde DetallePedido
                        bolsa: String(datosActualizados.bolsa), 
                        imagen: imagenFinal 
                    };
                }
                return pedido;
            })
        );
        cerrarModal(); 
    };

    // ======================================================================
    // 🔑 FUNCIÓN DE CANCELACIÓN DE PEDIDOS (MOVIMIENTO AL ESTADO 'CANCELADO')
    // ======================================================================

    /**
     * Mueve los pedidos seleccionados al estado 'Cancelado' y libera sus bolsas.
     * @param {string[]} bolsasACancelar - Array de IDs de bolsa de los pedidos a cancelar.
     */
    const handleCancelarPedidos = (bolsasACancelar) => {
        if (!window.confirm(`¿Estás seguro de que deseas CANCELAR ${bolsasACancelar.length} pedido(s)? Se moverán al historial y se liberarán las bolsas.`)) {
            return;
        }

        const bolsasLiberadas = [];

        // 1. Actualizar el estado de los pedidos a 'Cancelado'
        setPedidos(prevPedidos => 
            prevPedidos.map(pedido => {
                // Solo cancelamos pedidos que NO están entregados.
                if (bolsasACancelar.includes(pedido.bolsa) && pedido.estado !== 'Entregado' && pedido.estado !== 'Cancelado') {
                    bolsasLiberadas.push(pedido.bolsa); // Marcamos la bolsa para liberar
                    return { 
                        ...pedido, 
                        estado: 'Cancelado', 
                        fechaCancelacion: new Date().toLocaleString('es-CO', { 
                            year: 'numeric', 
                            month: '2-digit', 
                            day: '2-digit', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })
                    };
                }
                return pedido;
            })
        );

        // 2. Liberar las bolsas que se hayan cancelado
        setBolsasOcupadas(prevOcupadas => prevOcupadas.filter(bolsa => !bolsasLiberadas.includes(bolsa)));
        
        setBolsasDisponibles(prevDisponibles => {
            const nuevasDisponibles = new Set([...prevDisponibles, ...bolsasLiberadas]);
            return Array.from(nuevasDisponibles).sort(sortBags);
        });

        console.log(`✅ Pedidos con bolsas: ${bolsasACancelar.join(', ')} han sido cancelados y sus bolsas liberadas.`);
    };

    // ======================================================================
    // FIN: FUNCIÓN DE CANCELACIÓN
    // ======================================================================


    const handleEntregarPedido = (nBolsa) => {
        // nBolsa es el ID/bolsa (string)
        const pedidoAEntregar = pedidos.find(pedido => pedido.bolsa === nBolsa);
        
        if (pedidoAEntregar) {
            const bolsaLiberada = pedidoAEntregar.bolsa; // STRING
            const pedidoId = pedidoAEntregar.id;
            
            // Liberar la bolsa y reordenar
            const nuevasBolsasOcupadas = bolsasOcupadas.filter(bolsa => bolsa !== bolsaLiberada);
            const nuevasBolsasDisponibles = [...bolsasDisponibles, bolsaLiberada].sort(sortBags);
            
            setBolsasOcupadas(nuevasBolsasOcupadas);
            setBolsasDisponibles(nuevasBolsasDisponibles);
        
            setPedidos(pedidos.map(p => 
                p.id === pedidoId ? { 
                    ...p, 
                    estado: 'Entregado',
                    fechaEntregaReal: new Date().toLocaleString('es-CO', { 
                        year: 'numeric', 
                        month: '2-digit', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                } : p
            ));
        } else {
            console.error(`No se pudo liberar la bolsa. Pedido con bolsa ${nBolsa} no encontrado.`);
        }
    };

    const handleResetTodo = () => {
        setPedidos([]); 
        const bolsasIniciales = inicializarBolsas();
        setBolsasDisponibles(bolsasIniciales);
        setBolsasOcupadas([]);
        localStorage.clear(); // Limpiamos todo el localStorage
        alert("¡Sistema reiniciado! El historial y las bolsas se han borrado.");
    };

    return (
        <div className="app-container">
            <Sidebar estaAbierto={estaMenuAbierto} alCerrarMenu={cerrarMenu} />
            <div className="main-content">
                <Navbar
                    tituloPagina={getTituloPagina(location.pathname)}
                    alAbrirMenu={abrirMenu}
                />
                
                <div className="content-area"> 
                    <Routes>
                        <Route path="/" element={<Home pedidos={pedidos} abrirModal={abrirModal} />} />
                        <Route 
                            path="/pedidos" 
                            element={
                                <Pedido 
                                    pedidos={pedidos} 
                                    setPedidos={setPedidos} 
                                    abrirModal={abrirModal} 
                                    alCancelarPedidos={handleCancelarPedidos} // PROP CANCELACIÓN
                                />
                            } 
                        />
                        <Route path="/produccion" element={<Produccion pedidos={pedidos} setPedidos={setPedidos} abrirModal={abrirModal} />} />
                        <Route path="/finalizacion" element={<Finalizacion pedidos={pedidos} setPedidos={setPedidos} handleEntregarPedido={handleEntregarPedido} />} />
                        <Route path="/historial" element={<Historial pedidos={pedidos} handleResetTodo={handleResetTodo} />} /> 
                    </Routes>
                </div>
                <Footer/> 
                
                <Modal 
                    estaAbierto={estaModalAbierto} 
                    alCerrar={cerrarModal}
                    cierraAlHacerClickAfuera={!!pedidoSeleccionado}
                >
                    {pedidoSeleccionado ? (
                        // MODO DETALLE/EDICIÓN
                        <DetallePedido 
                            pedido={pedidoSeleccionado} 
                            alCerrarModal={cerrarModal} 
                            alActualizar={handleEditarPedidoLocal}
                        />
                    ) : (
                        // MODO CREACIÓN
                        <FormularioPedido 
                            alGuardar={agregarPedido}
                            alCancelar={cerrarModal} 
                            bolsasDisponibles={bolsasDisponibles} 
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};

function App() {
    // ----------------------------------------------------------------------
    // LÓGICA DE PERSISTENCIA
    // ----------------------------------------------------------------------
    
    const [pedidos, setPedidos] = useState(() => {
        const p = localStorage.getItem('pedidosBordados');
        return p ? JSON.parse(p) : [];
    });
    
    // CLAVE: Inicialización de Bolsas Disponibles usando la función alfanumérica
    const [bolsasDisponibles, setBolsasDisponibles] = useState(() => {
        const b = localStorage.getItem('bolsasDisponibles');
        let bolsas = b ? JSON.parse(b) : inicializarBolsas();

        // Si hay un error de tipo (ej. bolsas numéricas) lo limpiamos.
        if (bolsas.length > 0 && typeof bolsas[0] !== 'string') {
            console.warn("🚨 ERROR DE TIPO DE BOLSA DETECTADO EN LOCALSTORAGE. Reiniciando bolsas a formato string.");
            bolsas = inicializarBolsas();
        }

        return bolsas;
    });
    
    // CLAVE: Inicialización de Bolsas Ocupadas
    const [bolsasOcupadas, setBolsasOcupadas] = useState(() => {
        const b = localStorage.getItem('bolsasOcupadas');
        return b ? JSON.parse(b) : [];
    });
    
    useEffect(() => {
        // La lógica de imagen (File object) está bien, se ignora en el JSON.stringify 
        // y se mantiene el resto de los datos (incluyendo la bolsa como string).
        localStorage.setItem('pedidosBordados', JSON.stringify(pedidos));
        localStorage.setItem('bolsasDisponibles', JSON.stringify(bolsasDisponibles));
        localStorage.setItem('bolsasOcupadas', JSON.stringify(bolsasOcupadas));
    }, [pedidos, bolsasDisponibles, bolsasOcupadas]);


    return (
        <Router>
            <AppLayout 
                pedidos={pedidos} 
                setPedidos={setPedidos} 
                bolsasDisponibles={bolsasDisponibles}
                setBolsasDisponibles={setBolsasDisponibles}
                bolsasOcupadas={bolsasOcupadas}
                setBolsasOcupadas={setBolsasOcupadas}
            />
        </Router>
    );
}

export default App;