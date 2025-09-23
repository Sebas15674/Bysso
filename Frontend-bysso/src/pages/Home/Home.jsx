import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';

const Home = ({ pedidos, abrirModal }) => {
    const navigate = useNavigate();

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
            <div className={styles.encabezadoHome}>
                <h1 className={styles.titulo}>Dashboard de Pedidos</h1>
                <Boton 
                    tipo="primario" 
                    onClick={() => abrirModal(null)} // <- La corrección está aquí
                >
                    Crear Pedido ✚
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