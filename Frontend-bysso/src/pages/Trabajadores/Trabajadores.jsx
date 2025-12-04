import React, { useState, useEffect, useCallback } from 'react';
import styles from './Trabajadores.module.css';
import Boton from '../../components/ui/Boton/Boton.jsx';
import TablaTrabajadores from '../../components/especificos/TablaTrabajadores/TablaTrabajadores'; // This will be created next
import { useWorkers } from '../../context/WorkerContext';

const Trabajadores = ({ abrirModal }) => {
  const { fetchWorkers, removeWorker: removeWorkerFromContext } = useWorkers();

  const [trabajadores, setTrabajadores] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTexto, setFiltroTexto] = useState('');

  const fetchData = useCallback(async (searchQuery = '') => {
    // For this table, we want to see all workers, active and inactive
    // We pass `undefined` to get all of them, as per our backend logic.
    try {
      const data = await fetchWorkers(undefined, searchQuery); // `fetchWorkers` from context now needs to support search query
      setTrabajadores(data);
    } catch (err) {
      setError(err);
    } finally {
      if (isInitialLoading) setIsInitialLoading(false);
    }
  }, [fetchWorkers, isInitialLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search effect can be added later if needed

  const handleCrear = () => {
    // When creating, pass the type, null data, and an onSave callback
    abrirModal('TRABAJADOR_FORM', null, { onSave: fetchData });
  };

  const handleEditar = (trabajador) => {
    // When editing, pass the type, the worker object, and the onSave callback
    abrirModal('TRABAJADOR_FORM', trabajador, { onSave: fetchData });
  };

  const handleEliminar = async (trabajador) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${trabajador.nombre}?`)) {
      return;
    }

    try {
      await removeWorkerFromContext(trabajador.id);
      // OPTIONAL: for immediate UI update before re-fetch
      setTrabajadores(prev => prev.filter(t => t.id !== trabajador.id));
    } catch (error) {
      console.error('Error al eliminar trabajador:', error);
      alert(`No se pudo eliminar al trabajador. ${error.response?.data?.message || error.message}`);
    }
  };

  if (isInitialLoading) return <div>Cargando trabajadores...</div>;
  if (error) return <div>Error al cargar: {error.message}</div>;

  const trabajadoresFiltrados = trabajadores.filter(t => 
    t.nombre.toLowerCase().includes(filtroTexto.toLowerCase())
  );

  return (
    <div className={styles.contenedorPagina}>
          <div className={styles.header}>
              <div className={styles.tituloControles}>
                  <h1 className={styles.tituloPagina}>Gestión de Trabajadores</h1>
                  <div className={styles.controlesAcciones}>
                      <Boton tipo="primario" onClick={handleCrear}>
                          Crear Trabajador ✚
                      </Boton>
                  </div>
              </div>
          </div>
          
          <div className={styles.barraFiltros}>
              <div className={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className={styles.inputFiltro}
                  />
              </div>
          </div>
      <TablaTrabajadores
        trabajadores={trabajadoresFiltrados}
        onEdit={handleEditar}
        onDelete={handleEliminar}
      />
    </div>
  );
};

export default Trabajadores;
