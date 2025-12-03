import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './Home.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import marcaLogo from '../../assets/images/marca.png';
import { getDashboardStats } from '../../services/pedidosService'; // Import the new service

const statusMap = {
    PENDIENTE: { display: 'Pendiente', color: '#FACC15', route: '/pedidos', backendValue: 'PENDIENTE' },
    EN_PRODUCCION: { display: 'En Producción', color: '#3B82F6', route: '/produccion', backendValue: 'EN_PRODUCCION' },
    EN_PROCESO: { display: 'En Proceso', color: '#F97316', route: '/produccion', backendValue: 'EN_PROCESO' },
    LISTO_PARA_ENTREGA: { display: 'Listo para Entrega', color: '#10B981', route: '/finalizacion', backendValue: 'LISTO_PARA_ENTREGA' },
   // Assuming cancelled goes to historial
};

const Home = ({ abrirModal, refreshDashboardKey }) => {
    const navigate = useNavigate();
    const [dashboardStats, setDashboardStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const stats = await getDashboardStats();
                setDashboardStats(stats);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setError("No se pudieron cargar las estadísticas del dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [refreshDashboardKey]); // Add refreshDashboardKey to dependency array

    const irAHistorial = () => {
        navigate('/historial');
    };

    // Recalculate conteos based on fetched dashboardStats
    const conteos = useMemo(() => {
        const newConteos = {};
        for (const backendStatus in statusMap) {
            newConteos[statusMap[backendStatus].display] = dashboardStats[backendStatus] || 0;
        }
        return newConteos;
    }, [dashboardStats]);

    // Map display names for rendering and routing logic (simplified as all relevant statuses are in statusMap)
    // No need for displayedStatuses useMemo as all statusMap entries are relevant for cards
    
    const handleCardClick = (displayStatus) => {
        // Find the backend status from the displayStatus
        const backendStatusEntry = Object.values(statusMap).find(s => s.display === displayStatus);
        if (!backendStatusEntry) return;

        const { route: ruta, backendValue } = backendStatusEntry;
        const count = conteos[displayStatus];

        if (count > 0 && ruta) {
            navigate(`${ruta}?estado=${encodeURIComponent(backendValue)}`);
        }
    };

    if (loading) {
        return <div className={styles.contenedorHome}>Cargando estadísticas...</div>;
    }

    if (error) {
        return <div className={`${styles.contenedorHome} ${styles.error}`}>Error: {error}</div>;
    }

    return (
        <div className={styles.contenedorHome}>
            
            {/* 1. Logo a la izquierda */}
            <div className={styles.logoContenedor}>
                <img src={marcaLogo} alt="Logo de la Marca" className={styles.logoDashboard} />
            </div>

            {/* 2. Encabezado principal: Título y botón Crear Pedido */}
            <div className={styles.encabezadoHome}>
                <h1 className={styles.titulo}>Dashboard de Pedidos</h1>
                <div className={styles.accionesEncabezado}>
                    <Boton 
                        tipo="primario" 
                        onClick={() => abrirModal(null)}
                    >
                        Crear Pedido ✚
                    </Boton>
                </div>
            </div>

            {/* 3. Botón Historial: Posicionado de forma absoluta para sobresalir */}
            <div className={styles.historialBotonContenedor}>
                <Boton 
                    tipo="neutro" 
                    onClick={irAHistorial}
                >
                    Historial de Pedidos 📚
                </Boton>
            </div>
            
            <div className={styles.tarjetasResumen}>
                {Object.values(statusMap)
                    .filter(s => s.display !== 'Entregado' && s.display !== 'Cancelado')
                    .map((statusEntry, index) => (
                    <div 
                        key={index} 
                        className={styles.tarjeta} 
                        style={{ borderLeftColor: statusEntry.color }}
                        onClick={() => handleCardClick(statusEntry.display)}
                    >
                        <h3 className={styles.tarjetaTitulo}>{statusEntry.display}</h3>
                        <p className={styles.tarjetaNumero}>{conteos[statusEntry.display]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;