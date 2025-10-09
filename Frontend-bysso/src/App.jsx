import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Pedido from './pages/Pedido/Pedido.jsx';
import Produccion from './pages/Produccion/Produccion.jsx';
import Finalizacion from './pages/Finalizacion/Finalizacion.jsx';
import Historial from './pages/Historial/Historial.jsx'; 
import Home from './pages/Home/Home.jsx';
import Sidebar from './components/layout/Sidebar/Sidebar.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import Modal from './components/ui/Modal/Modal.jsx';
import FormularioPedido from './components/especificos/FormularioPedido/FormularioPedido.jsx';
import DetallePedido from './components/especificos/DetallePedido/DetallePedido.jsx';

import './styles/main.css';

// Función auxiliar para inicializar las bolsas (del 1 al 100)
const inicializarBolsas = () => Array.from({ length: 100 }, (_, i) => i + 1);

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

    // LÓGICA DE OCUPACIÓN DE BOLSA Y ASIGNACIÓN DE ID ÚNICO
    const agregarPedido = (nuevosDatos) => {
        const bolsaAsignada = Number(nuevosDatos.bolsa); 
        
        const nuevasBolsasDisponibles = bolsasDisponibles.filter(bolsa => bolsa !== bolsaAsignada);
        const nuevasBolsasOcupadas = [...bolsasOcupadas, bolsaAsignada].sort((a, b) => a - b);
        
        setBolsasDisponibles(nuevasBolsasDisponibles);
        setBolsasOcupadas(nuevasBolsasOcupadas);

        const nuevoPedido = { 
            ...nuevosDatos, 
            id: Date.now(), 
            bolsa: bolsaAsignada, 
            estado: 'Pendiente' 
        };
        setPedidos([...pedidos, nuevoPedido]);
        cerrarModal();
    };

    const getTituloPagina = (path) => {
        switch (path) {
            case '/pedidos':
                return 'Orden de Pedidos';
            case '/produccion':
                return 'Producción';
            case '/finalizacion':
                return 'Pedidos para Entrega';
            case '/historial': 
                return 'Historial de Entregas'; 
            case '/':
                return 'Dashboard';
            default:
                return 'Dashboard';
        }
    };

    const handleEntregarPedido = (nBolsa) => {
        const pedidoAEntregar = pedidos.find(pedido => pedido.bolsa === nBolsa);
        
        if (pedidoAEntregar) {
            const bolsaLiberada = pedidoAEntregar.bolsa; 
            const pedidoId = pedidoAEntregar.id;
            
            const nuevasBolsasOcupadas = bolsasOcupadas.filter(bolsa => bolsa !== bolsaLiberada);
            const nuevasBolsasDisponibles = [...bolsasDisponibles, bolsaLiberada].sort((a, b) => a - b);
            
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

    // Lógica de reseteo para el historial
    const handleResetTodo = () => {
        setPedidos([]); 
        const bolsasIniciales = inicializarBolsas();
        setBolsasDisponibles(bolsasIniciales);
        setBolsasOcupadas([]);
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
                
                {/* 👈 Este contenedor envuelve las rutas, maneja el scroll y empuja al Footer */}
                <div className="content-area"> 
                    <Routes>
                        <Route path="/" element={<Home pedidos={pedidos} abrirModal={abrirModal} />} />
                        <Route path="/pedidos" element={<Pedido pedidos={pedidos} setPedidos={setPedidos} abrirModal={abrirModal} />} />
                        <Route path="/produccion" element={<Produccion pedidos={pedidos} setPedidos={setPedidos} />} />
                        <Route path="/finalizacion" element={<Finalizacion pedidos={pedidos} setPedidos={setPedidos} handleEntregarPedido={handleEntregarPedido} />} />
                        <Route path="/historial" element={<Historial pedidos={pedidos} handleResetTodo={handleResetTodo} />} /> 
                    </Routes>
                </div>
                {/* El Footer permanece fijo en la parte inferior de la ventana visible */}
                <Footer/> 
                
                <Modal 
                    estaAbierto={estaModalAbierto} 
                    alCerrar={cerrarModal}
                    cierraAlHacerClickAfuera={!!pedidoSeleccionado}
                >
                    {pedidoSeleccionado ? (
                        <DetallePedido pedido={pedidoSeleccionado} alCerrarModal={cerrarModal} />
                    ) : (
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
    // La lógica de estado y persistencia permanece INTACTA
    const [pedidos, setPedidos] = useState(() => {
        const p = localStorage.getItem('pedidosBordados');
        return p ? JSON.parse(p) : [];
    });
    const [bolsasDisponibles, setBolsasDisponibles] = useState(() => {
        const b = localStorage.getItem('bolsasDisponibles');
        return b ? JSON.parse(b) : inicializarBolsas();
    });
    const [bolsasOcupadas, setBolsasOcupadas] = useState(() => {
        const b = localStorage.getItem('bolsasOcupadas');
        return b ? JSON.parse(b) : [];
    });
    
    useEffect(() => {
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