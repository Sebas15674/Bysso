import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Pedido from './pages/Pedido/Pedido.jsx';
import Produccion from './pages/Produccion/Produccion.jsx';
import Finalizacion from './pages/Finalizacion/Finalizacion.jsx';
import Home from './pages/Home/Home.jsx';
import Sidebar from './components/layout/Sidebar/Sidebar.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import Footer from './components/layout/Footer/Footer.jsx'; // <-- Importamos el componente Footer
import Modal from './components/ui/Modal/Modal.jsx';
import FormularioPedido from './components/especificos/FormularioPedido/FormularioPedido.jsx';
import DetallePedido from './components/especificos/DetallePedido/DetallePedido.jsx';


import './styles/main.css';

const AppLayout = ({ pedidos, setPedidos }) => {
    const [estaMenuAbierto, setEstaMenuAbierto] = useState(false);
    const abrirMenu = () => setEstaMenuAbierto(true);
    const cerrarMenu = () => setEstaMenuAbierto(false);
    const location = useLocation();

    // Estado para controlar ambos modales (creación y detalles)
    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

    // La función abrirModal ahora puede recibir un pedido.
    // Si no recibe nada, abre el modal de creación.
    const abrirModal = (pedido) => {
        setPedidoSeleccionado(pedido || null);
        setEstaModalAbierto(true);
    };

    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null); // Resetea el pedido seleccionado al cerrar
    };

    const agregarPedido = (nuevosDatos) => {
        const pedidoExistente = pedidos.find(pedido => pedido.bolsa === nuevosDatos.bolsa);
    
        if (pedidoExistente) {
            alert('Error: Ya existe un pedido con el número de bolsa ' + nuevosDatos.bolsa);
            return;
        }
    
        const nuevoPedido = { ...nuevosDatos, estado: 'Pendiente' };
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
            case '/':
                return 'Dashboard';
            default:
                return 'Dashboard';
        }
    };

    const handleEntregarPedido = (id) => {
        setPedidos(pedidos.filter(pedido => pedido.id !== id));
    };

    return (
        <div className="app-container">
            <Sidebar estaAbierto={estaMenuAbierto} alCerrarMenu={cerrarMenu} />
            <div className="main-content">
                <Navbar
                    tituloPagina={getTituloPagina(location.pathname)}
                    alAbrirMenu={abrirMenu}
                />
                <Routes>
                    <Route path="/" element={<Home pedidos={pedidos} abrirModal={abrirModal} />} />
                    <Route path="/pedidos" element={<Pedido pedidos={pedidos} setPedidos={setPedidos} abrirModal={abrirModal} />} />
                    <Route path="/produccion" element={<Produccion pedidos={pedidos} setPedidos={setPedidos} />} />
                    <Route path="/finalizacion" element={<Finalizacion pedidos={pedidos} setPedidos={setPedidos} handleEntregarPedido={handleEntregarPedido} />} />
                </Routes>
                <Footer/>
                <Modal 
                    estaAbierto={estaModalAbierto} 
                    alCerrar={cerrarModal}
                    // Nuevo: Pasamos `false` si es un modal de creación y `true` si es de detalles
                    cierraAlHacerClickAfuera={!!pedidoSeleccionado}
                >
                    {pedidoSeleccionado ? (
                        <DetallePedido pedido={pedidoSeleccionado} alCerrarModal={cerrarModal} />
                    ) : (
                        <FormularioPedido alGuardar={agregarPedido} alCancelar={cerrarModal} />
                    )}
                </Modal>
            </div>
        </div>
    );
};

function App() {
    const [pedidos, setPedidos] = useState(() => {
        const pedidosGuardados = localStorage.getItem('pedidosBordados');
        return pedidosGuardados ? JSON.parse(pedidosGuardados) : [];
    });

    useEffect(() => {
        localStorage.setItem('pedidosBordados', JSON.stringify(pedidos));
    }, [pedidos]);

    return (
        <Router>
            <AppLayout pedidos={pedidos} setPedidos={setPedidos} />
        </Router>
    );
}

export default App;
