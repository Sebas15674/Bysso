import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Auth Components
import { useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login/Login.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute/ProtectedRoute.jsx';

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
import Trabajadores from './pages/Trabajadores/Trabajadores.jsx';
import GestionUsuarios from './pages/GestionUsuarios/GestionUsuarios.jsx'; 
import GestionBolsas from './pages/GestionBolsas/GestionBolsas.jsx';

// Form & Detail Components
import FormularioPedido from './components/especificos/FormularioPedido/FormularioPedido.jsx';
import formPedidoStyles from './components/especificos/FormularioPedido/FormularioPedido.module.css'; // Importar estilos del formulario de pedido
import FormularioTrabajador from './components/especificos/FormularioTrabajador/FormularioTrabajador.jsx';
import DetallePedido from './components/especificos/DetallePedido/DetallePedido.jsx';
import DetalleProduccion from './components/especificos/DetalleProduccion/DetalleProduccion.jsx';
import DetalleFinalizacion from './components/especificos/DetalleFinalizacion/DetalleFinalizacion.jsx';
import detalleBaseStyles from './styles/DetalleModalBase.module.css'; // Importar estilos base para modales de detalle
import formModalOverrides from './styles/FormModalOverrides.module.css'; // Importar overrides para modales de formulario

// Services & Context
import { createPedido } from './services/pedidosService';
import { BagProvider, useBags } from './context/BagContext.jsx';
import { WorkerProvider } from './context/WorkerContext.jsx';

// Styles
import './styles/main.css';

const AppLayout = () => {
    const { refetchBags } = useBags();
    const [estaMenuAbierto, setEstaMenuAbierto] = useState(false);
    const location = useLocation();
    const { logout } = useAuth(); // Obtener logout del contexto

    const [modalState, setModalState] = useState({
        isOpen: false, type: null, data: null, callbacks: {}
    });
    const [refreshDashboardKey, setRefreshDashboardKey] = useState(0);
    const [highlightedPedidoId, setHighlightedPedidoId] = useState(null); // Nuevo estado para el ID del pedido a resaltar

    // Función para limpiar el resaltado después de un tiempo
    useEffect(() => {
        if (highlightedPedidoId) {
            const timer = setTimeout(() => {
                setHighlightedPedidoId(null);
            }, 3000); // Resalta por 3 segundos
            return () => clearTimeout(timer);
        }
    }, [highlightedPedidoId]);

    const abrirModal = (type, data = null, callbacks = {}) => setModalState({ isOpen: true, type, data, callbacks });
    const cerrarModal = () => setModalState({ isOpen: false, type: null, data: null, callbacks: {} });

    const handleAgregarPedido = async (formData) => {
        try {
            await createPedido(formData);
            if (modalState.callbacks.onSave) modalState.callbacks.onSave();
            refetchBags();
            setRefreshDashboardKey(prevKey => prevKey + 1);
            cerrarModal();
        } catch (error) {
            console.error("Error al crear el pedido:", error);
            alert(`Error al crear el pedido: ${error.response?.data?.message || 'Error desconocido'}`);
        }
    };

    // Modificado para aceptar pedidoId
    const handleEditarPedido = (pedidoId) => {
        if (modalState.callbacks.onUpdate) modalState.callbacks.onUpdate();
        refetchBags();
        setHighlightedPedidoId(pedidoId); // Establece el ID para resaltar
        cerrarModal();
    };

    // Nuevo handler para pedidos de Producción
    const handleEditarProduccionPedido = (pedidoId) => {
        if (modalState.callbacks.onUpdate) modalState.callbacks.onUpdate();
        setHighlightedPedidoId(pedidoId); // Establece el ID para resaltar
        cerrarModal();
    };


    const getTituloPagina = (path) => {
        if (path.startsWith('/pedidos')) return 'Orden de Pedidos';
        if (path.startsWith('/produccion')) return 'Producción';
        if (path.startsWith('/finalizacion')) return 'Pedidos para Entrega';
        if (path.startsWith('/historial')) return 'Historial de Entregas';
        if (path.startsWith('/trabajadores')) return 'Gestión de Trabajadores';
        if (path.startsWith('/gestion-usuarios')) return 'Gestión de Usuarios';
        if (path.startsWith('/bolsas')) return 'Gestión de Bolsas';
        return 'Dashboard';
    };

    const renderModalContent = () => {
        const { type, data, callbacks } = modalState;
        switch (type) {
            case 'PEDIDO_FORM': return <FormularioPedido alGuardar={handleAgregarPedido} alCancelar={cerrarModal} />;
            case 'PEDIDO_DETAIL': return <DetallePedido pedido={data} alCerrarModal={cerrarModal} alActualizar={handleEditarPedido} />;
            case 'TRABAJADOR_FORM': return <FormularioTrabajador initialData={data} onSave={callbacks.onSave} onClose={cerrarModal} />;
            case 'PRODUCCION_DETAIL': return <DetalleProduccion pedidoId={data} alCerrarModal={cerrarModal} alActualizar={handleEditarProduccionPedido} />; // Usar el nuevo handler
            case 'FINALIZACION_DETAIL': return <DetalleFinalizacion pedidoId={data} alCerrarModal={cerrarModal} />;
            default: return null;
        }
    };

    return (
        <div className="app-container">
            <Sidebar estaAbierto={estaMenuAbierto} alCerrarMenu={() => setEstaMenuAbierto(false)} />
            <div className="main-content">
                <Navbar
                    tituloPagina={getTituloPagina(location.pathname)}
                    alAbrirMenu={() => setEstaMenuAbierto(true)}
                    onLogout={logout} // Pasar la función de logout al Navbar
                />
                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<Home abrirModal={abrirModal} refreshDashboardKey={refreshDashboardKey} />} />
                        <Route path="/pedidos" element={<Pedido abrirModal={abrirModal} highlightedPedidoId={highlightedPedidoId} />} />
                        <Route path="/produccion" element={<Produccion abrirModal={abrirModal} highlightedPedidoId={highlightedPedidoId} />} />
                        <Route path="/finalizacion" element={<Finalizacion abrirModal={abrirModal} />} />
                        <Route path="/historial" element={<Historial />} />
                        <Route path="/trabajadores" element={<Trabajadores abrirModal={abrirModal} />} />
                        <Route path="/gestion-usuarios" element={<GestionUsuarios />} />
                        <Route path="/bolsas" element={<GestionBolsas />} />
                        {/* Si se accede a una ruta no definida dentro del layout, redirigir al home */}
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </div>
                <Footer />
            <Modal
                estaAbierto={modalState.isOpen}
                alCerrar={cerrarModal}
                cierraAlHacerClickAfuera={!['PEDIDO_FORM', 'PEDIDO_DETAIL', 'PRODUCCION_DETAIL', 'FINALIZACION_DETAIL'].includes(modalState.type)}
                customClass={modalState.type === 'PEDIDO_FORM' ? formPedidoStyles.modalWidth : ''}
            >
                    {renderModalContent()}
                </Modal>
            </div>
        </div>
    );
};

function App() {
    return (
        <Router>
            <BagProvider>
                <WorkerProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route 
                            path="/*" 
                            element={
                                <ProtectedRoute>
                                    <AppLayout />
                                </ProtectedRoute>
                            } 
                        />
                    </Routes>
                </WorkerProvider>
            </BagProvider>
        </Router>
    );
}

export default App;