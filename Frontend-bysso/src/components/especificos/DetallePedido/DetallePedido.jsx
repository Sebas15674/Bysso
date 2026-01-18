import React, { useState, useEffect, useRef } from 'react';
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetallePedido.module.css';
import baseStyles from '../../../styles/DetalleModalBase.module.css';
import { updatePedido, getActiveWorkers } from '../../../services/pedidosService.js';
import formatStatus from '../../../utils/formatStatus.jsx';
import { snakeToTitleCase } from '../../../utils/formatText.js';
import html2pdf from 'html2pdf.js';
import ComprobantePedido from '../ComprobantePedido/ComprobantePedido.jsx';

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
    const receiptRef = useRef(null);

    useEffect(() => {
        if (pedido) {
            setDatosEditables({
                ...pedido,
                clienteNombre: pedido.cliente?.nombre || '',
                clienteCedula: pedido.cliente?.cedula || '',
                clienteCelular: pedido.cliente?.celular || '',
                trabajadorId: pedido.trabajador?.id || '',
                abono: pedido.abono === 0 ? '' : (pedido.abono ?? ''), // Store raw number, not formatted string
                total: pedido.total === 0 ? '' : (pedido.total ?? ''), // Store raw number, not formatted string
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

    const handleDownloadPdf = () => {
        console.log("handleDownloadPdf called!"); // Debugging log
        const element = receiptRef.current;
        if (!element) {
            console.error("El elemento del comprobante no está disponible.");
            return;
        }

        const opt = {
          margin:       0,
          filename: `Comprobante_Bysso_Bolsa_${pedido.bagId}.pdf`,
          image: { type: 'jpeg', quality: 1.0 },
          html2canvas: { scale: 3, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save();
    };

    if (!pedido) {
        return null;
    }

    const puedeEditarse = pedido.estado === 'PENDIENTE';

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;

        if (name === 'prendas') {
            newValue = parseInt(value, 10) || '';
        } else if (name === 'abono' || name === 'total') {
            const cleanedValue = value.replace(/[^0-9]/g, '');
            newValue = parseInt(cleanedValue, 10) || '';
        }
        
        setDatosEditables(prev => ({
            ...prev,
            [name]: newValue
        }));
    };
    
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setDatosEditables(prev => ({ ...prev, imagen: e.target.files[0] }));
        }
    };

    const handleBorrarImagen = () => {
        setDatosEditables(prev => ({ ...prev, imagen: null }));
        const fileInput = document.getElementById('inputArchivoEdicion');
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
            abono: Number(datosEditables.abono) || 0,
            total: Number(datosEditables.total) || 0,
            imagenUrl: datosEditables.imagen === null ? null : undefined,
        };
        formData.append('pedido', JSON.stringify(datosDeTexto));
        try {
            await updatePedido(pedido.id, formData);
            if (alActualizar) alActualizar();
            alCerrarModal();
        } catch (error) {
            console.error("Error updating order:", error);
            alert(`Error al actualizar el pedido: ${error.message}`);
        }
    };
    
    const renderValue = (name, label, type = "text", isRequired = false) => {
        const value = datosEditables[name] ?? '';
        if (isEditing) {
            // In edit mode, for type="number" inputs, always show the raw number (which is now stored in state)
            // No cleaning needed here as state stores raw numbers
             return (
                <div className={baseStyles.campoEditable}>
                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <input
                        id={name} name={name} type={type} value={String(value)} // value is already raw number or ''
                        onChange={handleEditChange} required={isRequired}
                        className={baseStyles.inputCampo}
                    />
                </div>
            );
        }
        let displayValue = value;
        if (name === 'fechaEntrega' && value) {
            const date = new Date(value);
            const userTimezoneOffset = date.getTimezoneOffset() * 60000;
            displayValue = new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('es-CO');
        } else if (name === 'abono' || name === 'total') {
            displayValue = `$${formatCurrency(value)}`; // Format raw number from state for display
        } else if (value && typeof value === 'string' && !['clienteNombre', 'clienteCedula', 'clienteCelular'].includes(name)) {
            displayValue = value.toUpperCase();
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
                        {options.map((opt) => (<option key={opt[optionValueKey]} value={opt[optionValueKey]}>{opt[optionLabelKey]}</option>))}
                    </select>
                </div>
            );
        }
        let displayValue = pedido.trabajador?.nombre || value;
        return <p><strong>{label}:</strong> {displayValue}</p>;
    };

    const tipos = ['BORDADO', 'ESTAMPADO', 'ESTAMPADO_Y_BORDADO', 'OTROS'];

    return (
        <div className={baseStyles.modalDetalleContent}>
            {/* Contenido visible del modal */}
            <div className={baseStyles.header}>
                <h2 className={baseStyles.titulo}>{isEditing ? 'Editar Pedido' : 'Detalles del Pedido'}</h2>
                <button onClick={alCerrarModal} className={baseStyles.closeButton} aria-label="Cerrar modal">&times;</button>
            </div>
            <div className={baseStyles.body}>
                <div className={baseStyles.info}>
                    <p><strong>NÚMERO DE BOLSA:</strong> {pedido.bagId}</p>
                    <p><strong>ESTADO:</strong> {formatStatus(pedido.estado)}</p>
                    {renderValue('clienteNombre', 'CLIENTE', 'text', true)}
                    {renderValue('clienteCedula', 'CÉDULA')}
                    {renderValue('clienteCelular', 'CELULAR')}
                    {isEditing ? renderSelectValue('tipo', 'TIPO', tipos.map(t => ({ val: t, lab: snakeToTitleCase(t) })), 'val', 'lab') : <p><strong>TIPO:</strong> {snakeToTitleCase(datosEditables.tipo)}</p>}
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
                {(imageURL || isEditing) && (
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
                                {datosEditables.imagen && (<Boton tipo="peligro" onClick={handleBorrarImagen} className={styles.botonBorrarEdicion}>Quitar Imagen</Boton>)}
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
                    
                        <Boton tipo="descargar" onClick={handleDownloadPdf}>Descargar PDF 📄</Boton>
                        {puedeEditarse && (<Boton tipo="editar_pedido" onClick={() => setIsEditing(true)}>Editar Pedido ✏️</Boton>)}
                      
                        <Boton tipo="cerrar_modal" onClick={alCerrarModal}>Cerrar</Boton>
                    </>
                )}
            </div>

            {/* Componente de comprobante oculto para la generación del PDF */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                <ComprobantePedido ref={receiptRef} pedido={pedido} />
            </div>
        </div>
    );
};

export default DetallePedido;