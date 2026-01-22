// src/pages/GestionBolsas/GestionBolsas.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as bagsService from '../../services/bagsService';
import styles from './GestionBolsas.module.css';
import TablaBolsas from '../../components/especificos/TablaBolsas/TablaBolsas.jsx';
import FormularioBolsa from '../../components/especificos/FormularioBolsa/FormularioBolsa.jsx';
import Modal from '../../components/ui/Modal/Modal.jsx';
import formModalOverrides from '../../styles/FormModalOverrides.module.css';
import { useBags } from '../../context/BagContext.jsx';
import Paginacion from '../../components/ui/Paginacion/Paginacion.jsx';
import Boton from '../../components/ui/Boton/Boton.jsx';


const GestionBolsas = () => {
    const [allBags, setAllBags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { refetchBags: refetchBagsContext } = useBags();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [apiError, setApiError] = useState('');

    // --- Filtros y Paginación ---
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'DISPONIBLE', 'OCUPADA'
    const [filtroTexto, setFiltroTexto] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fetchBags = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bagsService.getBags();
            const sortedData = data.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
            setAllBags(sortedData);
        } catch (err) {
            setError(err.message || 'No se pudieron cargar las bolsas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBags();
    }, [fetchBags]);
    
    const filteredBags = useMemo(() => {
        return allBags
            .filter(bag => {
                if (statusFilter === 'ALL') return true;
                return bag.status === statusFilter;
            })
            .filter(bag => {
                return bag.id.toLowerCase().includes(filtroTexto.toLowerCase());
            });
    }, [allBags, statusFilter, filtroTexto]);

    const totalPages = Math.ceil(filteredBags.length / ITEMS_PER_PAGE);

    const paginatedBags = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredBags.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredBags, currentPage]);

    // Reset page to 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, filtroTexto]);

    const handleOpenCreateModal = () => {
        setApiError('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setApiError('');
    };

    const handleSaveBag = async (bagId) => {
        try {
            setApiError('');
            await bagsService.createBag(bagId);
            fetchBags();
            refetchBagsContext();
            handleCloseModal();
        } catch (err) {
            setApiError(err.response?.data?.message || 'Ocurrió un error al guardar la bolsa.');
        }
    };

    const handleDeleteBag = async (bag) => {
        if (bag.status === 'OCUPADA') {
            alert("No puedes eliminar una bolsa que está en uso.");
            return;
        }
        
        if (window.confirm(`¿Estás seguro de que quieres eliminar la bolsa ${bag.id}?`)) {
            try {
                await bagsService.deleteBag(bag.id);
                fetchBags();
                refetchBagsContext();
            } catch (err) {
                setError(err.message || 'Error al eliminar la bolsa.');
            }
        }
    };

    return (
        <div className={styles.contenedorPagina}>
            <div className={styles.header}>
                <h1 className={styles.tituloPagina}>Gestión de Bolsas</h1>
                <Boton tipo="primario" onClick={handleOpenCreateModal}>
                    Crear Nueva Bolsa
                </Boton>
            </div>

            <div className={styles.barraFiltros}>
                <div className={styles.inputContainer}> 
                    <input 
                        type="text"
                        placeholder="Buscar por ID de bolsa..."
                        value={filtroTexto}
                        onChange={(e) => setFiltroTexto(e.target.value)}
                        className={styles.inputFiltro}
                    />
                </div>
                <div className={styles.statusButtons}>
                    <button onClick={() => setStatusFilter('ALL')} className={statusFilter === 'ALL' ? styles.activeFilter : ''}>Todas</button>
                    <button onClick={() => setStatusFilter('DISPONIBLE')} className={statusFilter === 'DISPONIBLE' ? styles.activeFilter : ''}>Disponibles</button>
                    <button onClick={() => setStatusFilter('OCUPADA')} className={statusFilter === 'OCUPADA' ? styles.activeFilter : ''}>Ocupadas</button>
                </div>
            </div>

            {loading && <p>Cargando bolsas...</p>}
            {error && <p className={styles.mensajeError}>{error}</p>}
            
            {!loading && !error && (
                <>
                    <TablaBolsas
                        bolsas={paginatedBags}
                        onDelete={handleDeleteBag}
                    />
                    <Paginacion
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        loading={loading}
                    />
                </>
            )}

            <Modal
                estaAbierto={isModalOpen}
                alCerrar={handleCloseModal}
                customClass={formModalOverrides.transparentContainer}
            >
                <FormularioBolsa
                    onSave={handleSaveBag}
                    onClose={handleCloseModal}
                    errorMessageApi={apiError}
                    existingBags={allBags.map(b => b.id)}
                />
            </Modal>
        </div>
    );
};

export default GestionBolsas;
