import React, { useState, useEffect, useCallback } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetalleProduccion.module.css'; // Usaremos este para estilos específicos si son necesarios
import baseStyles from '../../../styles/DetalleModalBase.module.css';
import { getPedidoById, updatePedido, getActiveWorkers } from '../../../services/pedidosService.js';
import formatStatus from '../../../utils/formatStatus.jsx';
import { snakeToTitleCase } from '../../../utils/formatText.js';

// --- Helper functions recycled from DetallePedido ---
const cleanSimpleNumber = (formattedValue) => {
    if (typeof formattedValue !== 'string') return '';
    const cleaned = formattedValue.replace(/[^0-9]/g, '');
    if (cleaned === '') return '';
    return Number(cleaned);
};

const formatCurrency = (num) => {
    const numberValue = Number(num);
    if (isNaN(numberValue) || numberValue === 0) {
        return '0';
    }
    return numberValue.toLocaleString('es-CO');
};

const DetalleProduccion = ({ pedidoId, alCerrarModal, alActualizar }) => {
    // --- State management from both files ---
    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [trabajadores, setTrabajadores] = useState([]);
    const [datosEditables, setDatosEditables] = useState({});

    // --- Data fetching logic ---
    const fetchPedidoDetalle = useCallback(async () => {
        if (!pedidoId) {
            setPedido(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getPedidoById(pedidoId);
            setPedido(data);
            setError(null);
        } catch (err) {
            setError(err);
            setPedido(null);
        } finally {
            setLoading(false);
        }
    }, [pedidoId]);

    useEffect(() => {
        fetchPedidoDetalle();
    }, [fetchPedidoDetalle]);

    // --- Recycled useEffects for editing logic ---
    useEffect(() => {
        if (pedido) {
            setDatosEditables({
                ...pedido,
                clienteNombre: pedido.cliente?.nombre || '',
                clienteCelular: pedido.cliente?.celular || '',
                trabajadorId: pedido.trabajador?.id || '',
                abono: formatCurrency(pedido.abono),
                total: formatCurrency(pedido.total),
                prendas: pedido.prendas === 0 ? '' : (pedido.prendas ?? ''),
                imagen: pedido.imagenUrl || null,
                fechaEntrega: pedido.fechaEntrega ? pedido.fechaEntrega.split('T')[0] : '',
            });
            setIsEditing(false);
        }
    }, [pedido]);

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                const activeWorkers = await getActiveWorkers();
                setTrabajadores(activeWorkers);
            } catch (error) {
                console.error("Error fetching workers:", error);
            }
        };
        if (isEditing) {
            fetchWorkers();
        }
    }, [isEditing]);
    
    useEffect(() => {
        const imagenActual = datosEditables.imagen;
        if (imagenActual instanceof File) {
            const url = URL.createObjectURL(imagenActual);
            setImageURL(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof imagenActual === 'string') {
            setImageURL(`http://localhost:3000${imagenActual}`);
        } else {
            setImageURL(null);
        }
    }, [datosEditables.imagen]);

    // --- Recycled handlers ---
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setDatosEditables(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDatosEditables(prev => ({ ...prev, imagen: e.target.files[0] }));
        }
    };

    const handleBorrarImagen = () => {
        setDatosEditables(prev => ({ ...prev, imagen: null }));
        const fileInput = document.getElementById('inputArchivoEdicionProduccion');
        if (fileInput) fileInput.value = '';
    };

    const handleGuardarCambios = async () => {
        const formData = new FormData();
        if (datosEditables.imagen instanceof File) {
            formData.append('imagen', datosEditables.imagen);
        }
        
        const datosDeTexto = {
            clienteNombre: datosEditables.clienteNombre,
            clienteCelular: datosEditables.clienteCelular,
            tipo: datosEditables.tipo,
            descripcion: datosEditables.descripcion,
            fechaEntrega: datosEditables.fechaEntrega,
            trabajadorId: datosEditables.trabajadorId,
            prendas: Number(datosEditables.prendas) || 0,
            abono: cleanSimpleNumber(datosEditables.abono) || 0,
            total: cleanSimpleNumber(datosEditables.total) || 0,
            imagenUrl: datosEditables.imagen === null ? null : undefined,
        };

        formData.append('pedido', JSON.stringify(datosDeTexto));

        try {
            await updatePedido(pedido.id, formData);
            if (alActualizar) alActualizar(pedido.id); // Notifica al padre que refresque su lista
            alCerrarModal(); // Cierra el modal
        } catch (error) {
            console.error("Error updating order:", error);
            alert(`Error al actualizar el pedido: ${error.response?.data?.message || error.message}`);
        }
    };

    // --- Recycled Render Helpers ---
    const renderValue = (name, label, type = "text") => {
        const value = datosEditables[name] ?? '';
        if (isEditing) {
            return (
                <div className={baseStyles.campoEditable}>
                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <input id={name} name={name} type={type} value={value} onChange={handleEditChange} className={baseStyles.inputCampo} />
                </div>
            );
        }
        let displayValue = value;
        if (name === 'fechaEntrega' && value) {
            const dateParts = value.split('T')[0].split('-');
            displayValue = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])).toLocaleDateString('es-CO');
        } else if ((name === 'abono' || name === 'total')) {
            displayValue = `$${value}`;
        }
        return <p><strong>{label}:</strong> {displayValue || 'N/A'}</p>;
    };

    const renderSelectValue = (name, label, options, optionValueKey, optionLabelKey) => {
        const value = datosEditables[name] || '';
        if (isEditing) {
            return (
                <div className={baseStyles.campoEditable}>
                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <select id={name} name={name} value={value} onChange={handleEditChange} required className={baseStyles.inputCampo}>
                        <option value="">{`Seleccione ${label.toLowerCase()}`}</option>
                        {options.map((opt) => (
                            <option key={opt[optionValueKey]} value={opt[optionValueKey]}>
                                {opt[optionLabelKey]}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }
        const displayValue = name === 'trabajadorId' ? (pedido.trabajador?.nombre || value) : value;
        return <p><strong>{label}:</strong> {displayValue}</p>;
    };


    // --- Loading and Error states ---
    if (loading) return <div className={baseStyles.modalDetalleContent}><p>Cargando detalles...</p></div>;
    if (error) return <div className={baseStyles.modalDetalleContent}><p>Error: {error.message}</p></div>;
    if (!pedido) return null;

    // --- Edit condition and component render ---
    const puedeEditarse = pedido.estado === 'EN_PRODUCCION' || pedido.estado === 'EN_PROCESO';
    const tipos = ['BORDADO', 'ESTAMPADO', 'ESTAMPADO_Y_BORDADO', 'OTROS'];

    return (
        <div className={baseStyles.modalDetalleContent}>
            <div className={baseStyles.header}>
                <h2 className={baseStyles.titulo}>{isEditing ? 'Editar Pedido' : 'Detalles del Pedido para Producción'}</h2>
                <button onClick={alCerrarModal} className={baseStyles.closeButton} aria-label="Cerrar modal">&times;</button>
            </div>
            <div className={baseStyles.body}>
                <div className={baseStyles.info}>
                    <p><strong>NÚMERO DE BOLSA:</strong> {pedido.bagId}</p>
                    <p><strong>ESTADO:</strong> {formatStatus(pedido.estado)}</p>
                    <p><strong>CLIENTE:</strong> {datosEditables.clienteNombre || 'N/A'}</p>
                    
                    {isEditing ? (
                        <div className={baseStyles.campoEditable}>
                            <label htmlFor="descripcion"><strong>DESCRIPCIÓN:</strong></label>
                            <textarea id="descripcion" name="descripcion" value={datosEditables.descripcion || ''} onChange={handleEditChange} required className={baseStyles.inputCampo}/>
                        </div>
                    ) : <p><strong>DESCRIPCIÓN:</strong> {datosEditables.descripcion}</p>}

                    {isEditing ? renderSelectValue('tipo', 'TIPO', tipos.map(t => ({ val: t, lab: snakeToTitleCase(t) })), 'val', 'lab') : <p><strong>TIPO:</strong> {snakeToTitleCase(datosEditables.tipo)}</p>}
                    <p><strong>TRABAJADOR ASIGNADO:</strong> {pedido.trabajador?.nombre || 'N/A'}</p>
                    <p><strong>FECHA DE ENTREGA:</strong> {datosEditables.fechaEntrega ? new Date(datosEditables.fechaEntrega.split('T')[0]).toLocaleDateString('es-CO') : 'N/A'}</p>
                    {renderValue('prendas', 'Nº PRENDAS', 'number')}
                    {renderValue('abono', 'ABONO')}
                    {renderValue('total', 'TOTAL')}
                </div>

                <div className={baseStyles.mediaSection}>
                    {imageURL ? (
                        <>
                            <p><strong>Imagen del diseño:</strong></p>
                            <img src={imageURL} alt="Diseño del pedido" className={baseStyles.imagen} />
                        </>
                    ) : <p><strong>Imagen del diseño:</strong> Sin imagen</p>}
                    
                    {isEditing && (
                        <div className={styles.contenedorArchivo}>
                            <label htmlFor="inputArchivoEdicionProduccion" className={styles.etiquetaArchivo}>{imageURL ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</label>
                            <input id="inputArchivoEdicionProduccion" type="file" name="imagen" className={styles.inputArchivo} onChange={handleImageChange} />
                            <span className={styles.nombreArchivo}>
                                {datosEditables.imagen instanceof File ? datosEditables.imagen.name : (imageURL ? 'Imagen actual' : 'Sin archivo')}
                            </span>
                            {datosEditables.imagen && (
                                <Boton tipo="peligro" onClick={handleBorrarImagen} className={styles.botonBorrarEdicion}>Quitar Imagen</Boton>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className={baseStyles.acciones}>
                {isEditing ? (
                    <>
                        <Boton tipo="cancelar_edicion" onClick={() => setIsEditing(false)}>Cancelar Edición ❌</Boton>
                        <Boton tipo="primario" onClick={handleGuardarCambios}>Guardar Cambios ✅</Boton>
                    </>
                ) : (
                    <>
                        {puedeEditarse && <Boton tipo="editar_pedido" onClick={() => setIsEditing(true)}>Editar Pedido ✏️</Boton>}
                        <Boton tipo="cerrar_modal" onClick={alCerrarModal}>Cerrar</Boton>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetalleProduccion;
