import React, { useState, useEffect } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetallePedido.module.css';
import baseStyles from '../../../styles/DetalleModalBase.module.css';
import { updatePedido, getActiveWorkers } from '../../../services/pedidosService.js';
import formatStatus from '../../../utils/formatStatus.jsx';

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

const DetallePedido = ({ pedido, alCerrarModal, alActualizar }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [imageURL, setImageURL] = useState(null);
    const [trabajadores, setTrabajadores] = useState([]);
    const [datosEditables, setDatosEditables] = useState({});

    useEffect(() => {
        if (pedido) {
            setDatosEditables({
                ...pedido,
                // Flatten nested objects for easier form handling
                clienteNombre: pedido.cliente?.nombre || '',
                clienteCedula: pedido.cliente?.cedula || '',
                clienteCelular: pedido.cliente?.celular || '',
                trabajadorId: pedido.trabajador?.id || '',
                // Format numbers for display
                abono: formatCurrency(pedido.abono),
                total: formatCurrency(pedido.total),
                prendas: pedido.prendas === 0 ? '' : (pedido.prendas ?? ''),
                // Ensure imagenUrl is used
                imagen: pedido.imagenUrl || null,
            });
            setIsEditing(false); // Reset editing state when pedido changes
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
        }
        else if (typeof imagenActual === 'string') {
            // Assuming backend serves images from a base URL
            setImageURL(`http://localhost:3000${imagenActual}`);
            console.log("Intentando cargar imagen desde:", `http://localhost:3000${imagenActual}`);
        }
        else {
            setImageURL(null);
        }
    }, [datosEditables.imagen]);


    if (!pedido) {
        return null;
    }

    const puedeEditarse = pedido.estado === 'PENDIENTE';

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setDatosEditables(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDatosEditables(prev => ({
                ...prev,
                imagen: e.target.files[0]
            }));
        }
    };


    const handleBorrarImagen = () => {
        setDatosEditables(prev => ({
            ...prev,
            imagen: null
        }));
        const fileInput = document.getElementById('inputArchivoEdicion');
        if (fileInput) fileInput.value = '';
    };

    const handleGuardarCambios = async () => {
        const formData = new FormData();

        // 1. Handle image
        if (datosEditables.imagen instanceof File) {
            formData.append('imagen', datosEditables.imagen);
        }
        
        // 2. Prepare text data for the 'pedido' field
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
            // If the image is null, it means we want to remove it
            imagenUrl: datosEditables.imagen === null ? null : undefined,
        };

        formData.append('pedido', JSON.stringify(datosDeTexto));

        try {
            await updatePedido(pedido.id, formData);
            if (alActualizar) {
                alActualizar();
            }
            alCerrarModal();
        } catch (error) {
            console.error("Error updating order:", error);
            alert(`Error al actualizar el pedido: ${error.message}`);
        }
    };
    
    const renderValue = (name, label, type = "text", isRequired = false) => {
        const value = datosEditables[name] ?? '';
        if (isEditing) {
             return (
                                 <div className={baseStyles.campoEditable}>                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <input
                        id={name} name={name} type={type} value={value}
                        onChange={handleEditChange} required={isRequired}
                        className={baseStyles.inputCampo}
                    />
                </div>
            );
        }

        // View Mode Logic
        let displayValue = value; // Default to the value from state
        if (name === 'fechaEntrega') {
            displayValue = new Date(value).toLocaleDateString('es-CO');
        } else if (name === 'abono' || name === 'total') {
            // The value is already a formatted string from the state (e.g., "50.000")
            // Just add the currency symbol.
            displayValue = `$${value}`;
        } else if (name === 'clienteNombre' || name.includes('Celular') || name.includes('Cedula')) {
            // clienteNombre, Celular, Cedula should not be uppercase
            displayValue = value;
        } else if (value && typeof value === 'string') {
            displayValue = value.toUpperCase();
        }

        return <p><strong>{label}:</strong> {displayValue || 'N/A'}</p>;
    };

    const renderSelectValue = (name, label, options, optionValueKey, optionLabelKey) => {
        const value = datosEditables[name] || '';
        if (isEditing) {
            return (
                    <div className={baseStyles.campoEditable}> <label htmlFor={name}><strong>{label}:</strong></label>
                        <select id={name} name={name} value={value} onChange={handleEditChange} required className={baseStyles.inputCampo}>
                        <option value="">{`Seleccione ${label.toLowerCase()}`}</option>
                                {options.map((opt, index) => {
                                        const keyValue = opt[optionValueKey];
                                        const labelValue = opt[optionLabelKey];
                                                
                                            return (
                                                    <option key={keyValue} value={keyValue}>
                                                        {labelValue}
                                                    </option>
                                            );
        })}             </select>
                    </div>
            );
        }
        // Find the label for the selected value for display mode
        let displayValue = value;
        if (name === 'trabajadorId') {
            // For display mode, get the name directly from the full pedido object
            // as the 'trabajadores' list is only fetched in edit mode.
            displayValue = pedido.trabajador?.nombre || value;
        } else {
            const selectedOption = null; // Placeholder for other potential select fields
            displayValue = selectedOption ? selectedOption.nombre : value;
        }

        return <p><strong>{label}:</strong> {displayValue}</p>;
    };

    const tipos = ['BORDADO', 'ESTAMPADO', 'ESTAMPADO_Y_BORDADO', 'OTROS'];

    return (
        <div className={baseStyles.modalDetalleContent}>
            <div className={baseStyles.header}>
                <h2 className={baseStyles.titulo}>{isEditing ? 'Editar Pedido' : 'Detalles del Pedido'}</h2>
            </div>
            <div className={baseStyles.body}>
                <div className={baseStyles.info}>
                    <p><strong>NÚMERO DE BOLSA:</strong> {pedido.bagId}</p>
                    <p><strong>ESTADO:</strong> {formatStatus(pedido.estado)}</p>
                    {renderValue('clienteNombre', 'CLIENTE', 'text', true)}
                    {renderValue('clienteCedula', 'CÉDULA')}
                    {renderValue('clienteCelular', 'CELULAR')}
                    {isEditing ? renderSelectValue('tipo', 'TIPO', tipos.map(t => ({ val: t, lab: t})), 'val', 'lab'): <p><strong>TIPO:</strong> {datosEditables.tipo}</p> }

                    {isEditing ? (
                        <div className={baseStyles.campoEditable}>
                            <label htmlFor="descripcion"><strong>DESCRIPCIÓN:</strong></label>
                            <textarea id="descripcion" name="descripcion" value={datosEditables.descripcion || ''} onChange={handleEditChange} required className={baseStyles.inputCampo}/>
                        </div>
                    ) : <p><strong>DESCRIPCIÓN:</strong> {datosEditables.descripcion}</p>}
                    
                    {renderValue('fechaEntrega', 'FECHA DE ENTREGA', 'date')}
                    {renderSelectValue('trabajadorId', 'TRABAJADOR ASIGNADO', trabajadores, 'id', 'nombre')}
                    {renderValue('prendas', 'Nº PRENDAS', 'number')}
                    {renderValue('abono', 'ABONO')}
                    {renderValue('total', 'TOTAL')}
                </div>
                {(imageURL || isEditing) && ( // Only show media section if there's an image or in editing mode
                    <div className={baseStyles.mediaSection}>
                        {imageURL ? (
                            <>
                                <p><strong>Imagen del diseño:</strong></p>
                                <img src={imageURL} alt="Diseño del pedido" className={baseStyles.imagen} />
                            </>
                        ) : <p><strong>Imagen del diseño:</strong> Sin imagen</p>}
                        {isEditing && (
                            <div className={styles.contenedorArchivo}>
                                <label htmlFor="inputArchivoEdicion" className={styles.etiquetaArchivo}>{imageURL ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</label>
                                <input id="inputArchivoEdicion" type="file" name="imagen" className={styles.inputArchivo} onChange={handleImageChange} />
                                <span className={styles.nombreArchivo}>
                                    {datosEditables.imagen instanceof File ? datosEditables.imagen.name : (imageURL ? 'Imagen actual' : 'Sin archivo')}
                                </span>
                                {datosEditables.imagen && (
                                    <Boton tipo="peligro" onClick={handleBorrarImagen} className={styles.botonBorrarEdicion}>Quitar Imagen</Boton>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className={baseStyles.acciones}>
                {isEditing ? (
                    <>
                        <Boton tipo="cancelar_edicion" onClick={() => setIsEditing(false)}>Cancelar Edición ❌</Boton>
                        <Boton tipo="primario" onClick={handleGuardarCambios}>Guardar Cambios ✅</Boton>
                    </>
                ) : (
                    <>
                        {puedeEditarse && (<Boton tipo="editar_pedido" onClick={() => setIsEditing(true)}>Editar Pedido ✏️</Boton>)}
                        <Boton tipo="cerrar_modal" onClick={alCerrarModal}>Cerrar</Boton>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetallePedido;
