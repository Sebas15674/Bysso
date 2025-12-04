import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Layout Components
import Sidebar from './components/layout/Sidebar/Sidebar.jsx';
import Navbar from './components/layout/Navbar/Navbar.jsx';
import Footer from './components/layout/Footer/Footer.jsx';
import Modal from './components/ui/Modal/Modal.jsx';

// Page Components
import Home from './pages/Home/Home.jsx';
import Pedido from './pages/Pedido/Pedido.jsx';
import Produccion from './pages/Produccion/Produccion.jsx';
import Finalizacion from './pages/Finalizacion/Finalizacion.jsx';
import Historial from './pages/Historial/Historial.jsx';
import Trabajadores from './pages/Trabajadores/Trabajadores.jsx'; // Import new page

// Form & Detail Components
import FormularioPedido from './components/especificos/FormularioPedido/FormularioPedido.jsx';
import FormularioTrabajador from './components/especificos/FormularioTrabajador/FormularioTrabajador.jsx'; // Import new form
import DetallePedido from './components/especificos/DetallePedido/DetallePedido.jsx';
import DetalleProduccion from './components/especificos/DetalleProduccion/DetalleProduccion.jsx'; // Import production detail
import DetalleFinalizacion from './components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';

// Services & Context
import { createPedido } from './services/pedidosService';
import { BagProvider, useBags } from './context/BagContext.jsx';
import { WorkerProvider } from './context/WorkerContext.jsx'; // Import new provider

// Styles
import './styles/main.css';


const AppLayout = () => {
    const { refetchBags } = useBags();
    const [estaMenuAbierto, setEstaMenuAbierto] = useState(false);
    const location = useLocation();

    // --- Generalized Modal State ---
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null, // e.g., 'PEDIDO_FORM', 'PEDIDO_DETAIL', 'TRABAJADOR_FORM'
        data: null,   // Data for the modal content (e.g., a specific order or worker)
        callbacks: {} // To handle onSave, onUpdate, etc.
    });

    const [refreshDashboardKey, setRefreshDashboardKey] = useState(0);

    const abrirModal = (type, data = null, callbacks = {}) => {
        setModalState({ isOpen: true, type, data, callbacks });
    };

    const cerrarModal = () => {
        setModalState({ isOpen: false, type: null, data: null, callbacks: {} });
    };

    // --- Handlers ---
    const handleAgregarPedido = async (formData) => {
        try {
            await createPedido(formData);
            if (modalState.callbacks.onSave) {
                modalState.callbacks.onSave();
            }
            refetchBags();
            setRefreshDashboardKey(prevKey => prevKey + 1);
            cerrarModal();
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            alert(`Error al crear el pedido: ${error.response?.data?.message || 'Error desconocido'}`);
        }
    };

    const handleEditarPedido = () => {
        if (modalState.callbacks.onUpdate) {
            modalState.callbacks.onUpdate();
        }
        refetchBags();
        cerrarModal();
    };
    
    const getTituloPagina = (path) => {
        // Updated to include the new page
        if (path.startsWith('/pedidos')) return 'Orden de Pedidos';
        if (path.startsWith('/produccion')) return 'Producción';
        if (path.startsWith('/finalizacion')) return 'Pedidos para Entrega';
        if (path.startsWith('/historial')) return 'Historial de Entregas';
        if (path.startsWith('/trabajadores')) return 'Gestión de Trabajadores';
        return 'Dashboard';
    };

    // --- Modal Content Renderer ---
    const renderModalContent = () => {
        const { type, data, callbacks } = modalState;

        switch (type) {
            case 'PEDIDO_FORM':
                return <FormularioPedido alGuardar={handleAgregarPedido} alCancelar={cerrarModal} />;
            case 'PEDIDO_DETAIL':
                return <DetallePedido pedido={data} alCerrarModal={cerrarModal} alActualizar={handleEditarPedido} />;
            case 'TRABAJADOR_FORM':
                return <FormularioTrabajador initialData={data} onSave={callbacks.onSave} onClose={cerrarModal} />;
            case 'PRODUCCION_DETAIL':
                return <DetalleProduccion pedidoId={data} alCerrarModal={cerrarModal} />;
            case 'FINALIZACION_DETAIL':
                return <DetalleFinalizacion pedidoId={data} alCerrarModal={cerrarModal} />;
            default:
                return null;
        }
    };

    return (
        <div className="app-container">
            <Sidebar estaAbierto={estaMenuAbierto} alCerrarMenu={() => setEstaMenuAbierto(false)} />
            <div className="main-content">
                <Navbar
                    tituloPagina={getTituloPagina(location.pathname)}
                    alAbrirMenu={() => setEstaMenuAbierto(true)}
                />
                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<Home abrirModal={abrirModal} refreshDashboardKey={refreshDashboardKey} />} />
                        <Route path="/pedidos" element={<Pedido abrirModal={abrirModal} />} />
                        <Route path="/produccion" element={<Produccion abrirModal={abrirModal} />} />
                        <Route path="/finalizacion" element={<Finalizacion abrirModal={abrirModal} />} />
                        <Route path="/historial" element={<Historial />} />
                        <Route path="/trabajadores" element={<Trabajadores abrirModal={abrirModal} />} /> {/* New Route */}
                    </Routes>
                </div>
                <Footer/>
                <Modal
                    estaAbierto={modalState.isOpen}
                    alCerrar={cerrarModal}
                    cierraAlHacerClickAfuera={!!modalState.data}
                >
                    {renderModalContent()}
                </Modal>
            </div>
        </div>
    );
};

function App() {
    // Consolidate providers here
    return (
        <Router>
            <BagProvider>
                <WorkerProvider>
                    <AppLayout />
                </WorkerProvider>
            </BagProvider>
        </Router>
    );
}

export default App;

