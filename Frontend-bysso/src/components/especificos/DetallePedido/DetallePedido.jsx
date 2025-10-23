import React, { useState, useEffect } from 'react'; 
import Boton from '../../ui/Boton/Boton.jsx';
import styles from './DetallePedido.module.css';


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
    
    // Estado para saber si la imagen original era un File o un String (para la persistencia)
    const [estadoImagenOriginal, setEstadoImagenOriginal] = useState(null); 

    // Inicialización del estado: Abono/Total deben ser la cadena con el formato de moneda.
    // Incluimos todos los datos del pedido.
    const [datosEditables, setDatosEditables] = useState(() => {
        if (!pedido) return {};
        
        const formatNumberToDisplay = (num) => formatCurrency(num); 
        
        return {
            ...pedido, // 💡 IMPORTANTE: Copiamos todos los campos (id, estado, bolsa, etc.)
            imagen: pedido.imagen || null, 
            abono: formatNumberToDisplay(pedido.abono),
            total: formatNumberToDisplay(pedido.total),
            prendas: pedido.prendas === 0 ? '' : (pedido.prendas ?? ''),
            bolsa: String(pedido.bolsa ?? ''), // ✅ CLAVE: Aseguramos que la bolsa se cargue como STRING
        };
    });

    
    // useEffect para manejar la URL temporal del objeto File (Imagen)
    useEffect(() => {
        const imagenActual = datosEditables.imagen;
        
        if (imagenActual instanceof File) {
            const url = URL.createObjectURL(imagenActual);
            setImageURL(url);
            setEstadoImagenOriginal('FILE');
            // Limpieza
            return () => {
                URL.revokeObjectURL(url);
                setImageURL(null);
            };
        } 
        else if (typeof imagenActual === 'string' && imagenActual.startsWith('http')) {
            setImageURL(imagenActual);
            setEstadoImagenOriginal('URL'); // Backend
        } 
        else {
            setImageURL(null);
            setEstadoImagenOriginal(null); // Sin imagen
        }
    }, [datosEditables.imagen]); 

    // Reinicia el estado de edición si el pedido original cambia (ej. al cambiar de modal)
    useEffect(() => {
        if (pedido) {
            setDatosEditables({
                ...pedido,
                imagen: pedido.imagen || null,
                abono: formatCurrency(pedido.abono),
                total: formatCurrency(pedido.total),
                prendas: pedido.prendas === 0 ? '' : (pedido.prendas ?? ''),
                bolsa: String(pedido.bolsa ?? ''), // ✅ CLAVE: Recarga la bolsa como STRING
            });
            setIsEditing(false);
        }
    }, [pedido]);


    if (!pedido) {
        return null;
    }

    const puedeEditarse = pedido.estado === 'Pendiente';
    
    const handleEditChange = (e) => {
        const { name, value } = e.target;
        let val = value;
        
        // La bolsa se mantiene como string
        if (name === 'prendas') {
            val = value === '' ? '' : Number(value);
        } else if (['abono', 'total'].includes(name)) {
            val = value;
        }
        
        setDatosEditables(prev => ({ 
            ...prev, 
            [name]: val
        }));
    };
    
    const handleImageChange = (e) => {
        setDatosEditables(prev => ({ 
            ...prev, 
            imagen: e.target.files[0] 
        }));
    };

    const handleBorrarImagen = () => {
        setDatosEditables(prev => ({
            ...prev,
            imagen: null // Setea a null para indicar que debe ser eliminada
        }));
        // Opcional: limpiar el input de tipo file
        const fileInput = document.getElementById('inputArchivoEdicion');
        if (fileInput) fileInput.value = '';
    };

    /**
     * 🚀 FUNCIÓN CORREGIDA: Crea y envía FormData con todos los datos.
     */
    const handleGuardarCambios = () => {
        // 1. Limpieza de datos numéricos
        const abonoLimpio = cleanSimpleNumber(datosEditables.abono);
        const totalLimpio = cleanSimpleNumber(datosEditables.total);
        
        // 2. Objeto con los datos de texto limpios (Usamos 'spread' para incluir id, estado, etc.)
        const datosDeTexto = {
            ...datosEditables, // Incluye ID, estado, cliente, etc.
            // Sobreescribimos con valores limpios
            abono: abonoLimpio === '' ? 0 : abonoLimpio,
            total: totalLimpio === '' ? 0 : totalLimpio,
            prendas: datosEditables.prendas === '' ? 0 : Number(datosEditables.prendas),
            
            // ✅ CORRECCIÓN CRÍTICA: Mantenemos la bolsa como STRING
            bolsa: String(datosEditables.bolsa), 
            
            // La clave 'imagen' en el JSON. Esto es un marcador para App.jsx.
            imagen: datosEditables.imagen === null 
                ? null // Eliminada
                : (datosEditables.imagen instanceof File ? 'FILE_UPLOADING' : datosEditables.imagen) // Nuevo File o URL/string
        };

        // 3. Crear FormData
        const formData = new FormData();

        // 4. Adjuntar la imagen SOLO si es un nuevo archivo File
        if (datosEditables.imagen instanceof File) {
            formData.append('imagen', datosEditables.imagen); 
        }
        
        // 5. Adjuntar el resto de los datos como un string JSON
        formData.append('data', JSON.stringify(datosDeTexto)); 
        
        // 6. Enviar el FormData a la función alActualizar
        alActualizar(formData);
        setIsEditing(false);
    };

    // ... (El resto del componente DetallePedido se mantiene) ...
    // (renderValue y renderSelectValue funcionan correctamente con los ajustes)

    const renderValue = (name, label, type = "text", isRequired = false) => {
        // ... (lógica de renderValue) ...
        const value = datosEditables[name] ?? ''; 
        let inputType = type;
        const isMonetary = (name === 'abono' || name === 'total');

        if (isMonetary) { inputType = 'text'; } 
        else if (name === 'prendas') { inputType = 'number'; }
        
        // 🚨 Impedimos editar la bolsa en este modal, se debe mostrar siempre
        const isBolsa = name === 'bolsa';
        if (isBolsa) {
            return <p><strong>NÚMERO DE BOLSA:</strong> {String(pedido.bolsa)}</p>;
        }

        if (isEditing) {
            const minAttr = name === 'prendas' ? { min: "0" } : {}; 
            return (
                <div className={styles.campoEditable}>
                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <input
                        id={name} name={name} type={inputType} value={value} 
                        onChange={handleEditChange} required={isRequired}
                        className={styles.inputCampo} {...minAttr}
                    />
                </div>
            );
        }

        let displayValue = value;
        if (isMonetary) { displayValue = displayValue === '' ? 'N/A' : `$${displayValue}`; } 
        else if (displayValue === '' || displayValue === 0) { displayValue = 'N/A'; }

        return <p><strong>{label}:</strong> {displayValue}</p>;
    };

    const renderSelectValue = (name, label, options) => {
        // ... (lógica de renderSelectValue) ...
        const value = datosEditables[name] || '';
        if (isEditing) {
            return (
                <div className={styles.campoEditable}>
                    <label htmlFor={name}><strong>{label}:</strong></label>
                    <select id={name} name={name} value={value} onChange={handleEditChange} required className={styles.inputCampo}>
                        <option value="">{`Seleccione ${label.toLowerCase()}`}</option>
                        {options.map((opt, index) => (<option key={index} value={opt}>{opt}</option>))}
                    </select>
                </div>
            );
        }
        return <p><strong>{label}:</strong> {value}</p>;
    };

    const tipos = ['Bordado', 'Estampado', 'Estampado y Bordado'];
    const trabajadores = ['Juan Pérez', 'María Gómez', 'Luis García'];

    return (
        <div className={styles.contenedorDetalles}>
            <h2 className={styles.titulo}>{isEditing ? 'Editar Pedido' : 'Detalles del Pedido'}</h2>
            
            <div className={styles.info}>
                {renderValue('bolsa', 'NÚMERO DE BOLSA')} {/* Usa el renderValue para la bolsa (que se mantiene estático) */}
                <p><strong>ESTADO:</strong> {pedido.estado}</p>
                
                {renderValue('cliente', 'CLIENTE', 'text', true)}
                {renderValue('cedula', 'CÉDULA')}
                {renderValue('celular', 'CELULAR')}
                
                {renderSelectValue('tipo', 'TIPO', tipos)}
                
                {/* Usar textarea para la descripción en modo edición */}
                {isEditing ? (
                    <div className={styles.campoEditable}>
                        <label htmlFor="descripcion"><strong>DESCRIPCIÓN:</strong></label>
                        <textarea
                            id="descripcion" name="descripcion" value={datosEditables.descripcion} 
                            onChange={handleEditChange} required
                            className={styles.inputCampo} 
                        />
                    </div>
                ) : (
                    <p><strong>DESCRIPCIÓN:</strong> {datosEditables.descripcion}</p>
                )}


                {renderValue('fechaEntrega', 'FECHA DE ENTREGA', 'date')}
                
                {renderSelectValue('trabajadorAsignado', 'TRABAJADOR ASIGNADO', trabajadores)}

                {renderValue('prendas', 'Nº PRENDAS', 'number')}
                
                {renderValue('abono', 'ABONO')} 
                {renderValue('total', 'TOTAL')}
                
                {/* Lógica de Imagen */}
                <div className={styles.contenedorImagen}>
                    {imageURL ? (
                        <>
                            <p><strong>Imagen del diseño:</strong></p>
                            <img src={imageURL} alt="Diseño del pedido" className={styles.imagen} />
                        </>
                    ) : (
                        <p><strong>Imagen del diseño:</strong> Sin imagen</p>
                    )}
                </div>

                {/* Input de archivo visible SOLO en modo edición */}
                {isEditing && (
                    <div className={styles.contenedorArchivo}>
                        <label htmlFor="inputArchivoEdicion" className={styles.etiquetaArchivo}>
                            {imageURL ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                        </label>
                        <input 
                            id="inputArchivoEdicion" 
                            type="file" 
                            name="imagen" 
                            className={styles.inputArchivo} 
                            onChange={handleImageChange}
                        />
                        <span className={styles.nombreArchivo}>
                            {datosEditables.imagen 
                                ? (datosEditables.imagen instanceof File ? datosEditables.imagen.name : 'Imagen Actual') 
                                : 'Sin archivo seleccionado'}
                        </span>
                        {datosEditables.imagen && (
                            <Boton tipo="peligro" onClick={handleBorrarImagen} className={styles.botonBorrarEdicion}>
                                Quitar Imagen
                            </Boton>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.acciones}>
                {isEditing ? (
                    <>
                        <Boton tipo="primario" onClick={handleGuardarCambios}>
                            Guardar Cambios ✅
                        </Boton>
                        <Boton tipo="neutro" onClick={() => {
                                setIsEditing(false);
                                // Recargar datos originales
                                setDatosEditables({
                                    ...pedido,
                                    imagen: pedido.imagen || null,
                                    abono: formatCurrency(pedido.abono),
                                    total: formatCurrency(pedido.total),
                                    prendas: pedido.prendas === 0 ? '' : (pedido.prendas ?? ''),
                                    bolsa: String(pedido.bolsa ?? ''),
                                });
                            }}>
                            Cancelar Edición ❌
                        </Boton>
                    </>
                ) : (
                    <>
                        {puedeEditarse && (
                            <Boton tipo="info" onClick={() => setIsEditing(true)}>
                                Editar Pedido ✏️
                            </Boton>
                        )}
                        <Boton tipo="primario" onClick={alCerrarModal}>
                            Cerrar
                        </Boton>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetallePedido;