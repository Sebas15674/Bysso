import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './Home.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import marcaLogo from '../../assets/images/marca.png';

const Home = ({ pedidos, abrirModal }) => {
    const navigate = useNavigate();

    const irAHistorial = () => {
        navigate('/historial');
    };

    const conteos = useMemo(() => {
        const conteosEstado = {
            'Pendiente': 0,
            'En Producción': 0,
            'En Proceso': 0,
            'Listo para Entrega': 0,
        };
        
        pedidos.forEach(pedido => {
            if (conteosEstado.hasOwnProperty(pedido.estado)) {
                conteosEstado[pedido.estado]++;
            }
        });
        
        return conteosEstado;
    }, [pedidos]);

    const estadoColores = {
        'Pendiente': '#FACC15',
        'En Producción': '#3B82F6',
        'En Proceso': '#F97316',
        'Listo para Entrega': '#10B981',
    };
    
    const estadoRutaMap = {
        'Pendiente': '/pedidos',
        'En Producción': '/produccion',
        'En Proceso': '/produccion',
        'Listo para Entrega': '/finalizacion'
    };
    
    const handleCardClick = (estado) => {
        const ruta = estadoRutaMap[estado];
        if (conteos[estado] > 0) {
            if (estado === 'En Producción' || estado === 'En Proceso') {
                navigate(`${ruta}?estado=${encodeURIComponent(estado)}`);
            } else {
                navigate(ruta);
            }
        }
    };

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
                    {/* Solo el botón Crear Pedido se queda en este flujo */}
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
                {Object.keys(conteos).map((estado, index) => (
                    <div 
                        key={index} 
                        className={styles.tarjeta} 
                        style={{ borderLeftColor: estadoColores[estado] }}
                        onClick={() => handleCardClick(estado)}
                    >
                        <h3 className={styles.tarjetaTitulo}>{estado}</h3>
                        <p className={styles.tarjetaNumero}>{conteos[estado]}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
