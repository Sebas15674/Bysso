import React, { useState } from 'react';
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
import { createPedido } from './services/pedidosService';
import { BagProvider, useBags } from './context/BagContext.jsx';

const AppLayout = () => {
    const { refetchBags } = useBags(); // Get refetchBags from context
    const [estaMenuAbierto, setEstaMenuAbierto] = useState(false);
    const abrirMenu = () => setEstaMenuAbierto(true);
    const cerrarMenu = () => setEstaMenuAbierto(false);
    const location = useLocation();

    const [estaModalAbierto, setEstaModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
    const [onSaveCallback, setOnSaveCallback] = useState(null);
    const [onUpdateCallback, setOnUpdateCallback] = useState(null);

    const abrirModal = (pedido, callbacks) => {
        setPedidoSeleccionado(pedido || null);
        if (callbacks) {
            setOnSaveCallback(() => callbacks.onSave);
            setOnUpdateCallback(() => callbacks.onUpdate);
        }
        setEstaModalAbierto(true);
    };

    const cerrarModal = () => {
        setEstaModalAbierto(false);
        setPedidoSeleccionado(null);
        setOnSaveCallback(null);
        setOnUpdateCallback(null);
    };

    const handleAgregarPedido = async (formData) => {
        try {
            await createPedido(formData);
            if (onSaveCallback) {
                onSaveCallback();
            }
            refetchBags(); // Refetch bags after creating a new order
            cerrarModal();
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            if (error.response) {
                // El servidor respondió con un estado fuera del rango 2xx
                console.error("Datos de error del servidor:", error.response.data);
                console.error("Estado del error del servidor:", error.response.status);
                alert(`Error al crear el pedido: ${error.response.data.message || error.response.data.error || 'Error desconocido'}`);
            } else if (error.request) {
                // La solicitud fue hecha pero no se recibió respuesta
                console.error("No se recibió respuesta del servidor:", error.request);
                alert("Error: No se recibió respuesta del servidor.");
            } else {
                // Algo más sucedió al configurar la solicitud que provocó un error
                console.error("Error al configurar la solicitud:", error.message);
                alert(`Error al crear el pedido: ${error.message}`);
            }
        }
    };

    const handleEditarPedido = () => {
        if (onUpdateCallback) {
            onUpdateCallback();
        }
        refetchBags(); // Also refetch bags after an update, as status might change
        cerrarModal();
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
                        <Route path="/" element={<Home abrirModal={abrirModal} />} />
                        <Route path="/pedidos" element={<Pedido abrirModal={abrirModal} />} />
                        <Route path="/produccion" element={<Produccion abrirModal={abrirModal} />} />
                        <Route path="/finalizacion" element={<Finalizacion />} />
                        <Route path="/historial" element={<Historial />} />
                    </Routes>
                </div>
                <Footer/>
                <Modal
                    estaAbierto={estaModalAbierto}
                    alCerrar={cerrarModal}
                    cierraAlHacerClickAfuera={!!pedidoSeleccionado}
                >
                    {pedidoSeleccionado ? (
                        <DetallePedido
                            pedido={pedidoSeleccionado}
                            alCerrarModal={cerrarModal}
                            alActualizar={handleEditarPedido}
                        />
                    ) : (
                        <FormularioPedido
                            alGuardar={handleAgregarPedido}
                            alCancelar={cerrarModal}
                            // bolsasDisponibles is no longer passed as a prop
                        />
                    )}
                </Modal>
            </div>
        </div>
    );
};

function App() {
    return (
        <BagProvider>
            <Router>
                <AppLayout />
            </Router>
        </BagProvider>
    );
}

export default App;
