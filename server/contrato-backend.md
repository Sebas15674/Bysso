CONTRATO-BACKEND: Aplicación de Gestión de Pedidos (Bysso)

  Este documento define la API y los modelos de datos que el backend debe proveer para ser compatible con el cliente frontend-bysso.

  1. Entidades y Modelos

  El sistema se centra en una única entidad principal que encapsula toda la información.

   * `Pedido`: Representa una orden de trabajo desde su creación hasta su entrega.

  Aunque campos como cliente y trabajadorAsignado podrían normalizarse en sus propias entidades (Cliente, Trabajador) en el futuro, el frontend actualmente los maneja como campos de texto
  dentro del Pedido. Para esta primera versión del backend, mantendremos esta estructura denormalizada.

  2. Campos de la Entidad Pedido


  ┌────────────────────┬────────────────────────┬─────────────────────────────────────────────────────┬───────────┬────────────────────────────────────┐
  │ Campo              │ Tipo de Dato (Backend) │ Descripción                                         │ Requerido │ Ejemplo                            │
  ├────────────────────┼────────────────────────┼─────────────────────────────────────────────────────┼───────────┼────────────────────────────────────┤
  │ id                 │ Int (Autoincremental)  │ Identificador único numérico del pedido.            │ Sí        │ 1                                  │
  │ bolsa              │ String                 │ Identificador alfanumérico único para la bolsa.     │ Sí        │ "10A"                              │
  │ cliente            │ String                 │ Nombre completo del cliente.                        │ Sí        │ "Andres Chitan"                    │
  │ cedula             │ String                 │ Número de cédula del cliente.                       │ Opcional  │ "1055000343"                       │
  │ celular            │ String                 │ Número de teléfono del cliente.                     │ Sí        │ "3226213276"                       │
  │ tipo               │ String                 │ Tipo de trabajo a realizar.                         │ Sí        │ "Bordado"                          │
  │ descripcion        │ String (Largo)         │ Detalles y especificaciones del pedido.             │ Sí        │ "Logo en el pecho izquierdo"       │
  │ fechaEntrega       │ Date                   │ Fecha de entrega prometida al cliente.              │ Sí        │ "2025-12-05"                       │
  │ prendas            │ Int                    │ Cantidad de artículos en el pedido.                 │ Sí        │ 5                                  │
  │ abono              │ Float                  │ Monto pagado como anticipo.                         │ Opcional  │ 20000.0                            │
  │ total              │ Float                  │ Costo total del pedido.                             │ Opcional  │ 50000.0                            │
  │ imagen             │ String (URL)           │ URL del archivo de imagen del diseño.               │ Opcional  │ "https://storage.bysso.../img.png" │
  │ trabajadorAsignado │ String                 │ Nombre del trabajador responsable.                  │ Sí        │ "Alba lucia Noreña"                │
  │ estado             │ String                 │ El estado actual del pedido en el flujo de trabajo. │ Sí        │ "Pendiente"                        │
  │ fechaFinalizacion  │ Date                   │ Fecha en que se completó la producción.             │ Opcional  │ "2025-12-03"                       │
  │ fechaEntregaReal   │ Date                   │ Fecha en que el pedido fue entregado al cliente.    │ Opcional  │ "2025-12-04"                       │
  └────────────────────┴────────────────────────┴─────────────────────────────────────────────────────┴───────────┴────────────────────────────────────┘

  3. Relaciones entre Entidades

   * No existen relaciones explícitas entre tablas en la implementación actual. Toda la información necesaria se encuentra dentro de la entidad Pedido.

  4. Flujos y Estados de un Pedido

  El campo estado en la entidad Pedido define su posición en el flujo. Las transiciones de estado son clave para la lógica del negocio.

   * Estados Válidos:
       * Pendiente
       * En Producción
       * En Proceso
       * Listo para Entrega
       * Entregado
       * Cancelado

   * Diagrama de Transiciones de Estado:
       1. (Creación) → `Pendiente`
       2. `Pendiente` → `En Producción` (Acción: Enviar a producción)
       3. `Pendiente` → `Cancelado` (Acción: Cancelar pedido)
       4. `En Producción` → `En Proceso` (Acción: Tomar pedido)
       5. `En Proceso` → `Listo para Entrega` (Acción: Finalizar producción)
       6. `Listo para Entrega` → `Entregado` (Acción: Entregar pedido)

  5. Contratos JSON (Endpoints de la API)

  El frontend espera una API RESTful para gestionar los pedidos. Dado que se manejan subidas de archivos, se usarán peticiones multipart/form-data.

   * `GET /pedidos`
       * Descripción: Obtiene la lista completa de todos los pedidos.
       * Respuesta (Éxito `200 OK`):

    1         [
    2           {
    3             "id": 1,
    4             "bolsa": "1A",
    5             "cliente": "Andres Chitan",
    6             "celular": "3226213276",
    7             "tipo": "Bordado",
    8             "descripcion": "Logo en el pecho",
    9             "fechaEntrega": "2025-12-10",
   10             "prendas": 5,
   11             "abono": 50000,
   12             "total": 100000,
   13             "imagen": "http://path/to/image.png",
   14             "trabajadorAsignado": "Alba Noreña",
   15             "estado": "Pendiente",
   16             "fechaFinalizacion": null,
   17             "fechaEntregaReal": null
   18           }
   19         ]

   * `POST /pedidos`
       * Descripción: Crea un nuevo pedido. Requiere un Content-Type de multipart/form-data.
       * Cuerpo (Petición `multipart/form-data`):
           * imagen: El archivo de imagen (opcional).
           * data: Un string JSON con el resto de los datos del pedido.

   1             // Ejemplo del string en el campo 'data'
   2             {
   3               "bolsa": "2B",
   4               "cliente": "Nuevo Cliente",
   5               "celular": "3111111111",
   6               "tipo": "Estampado",
   7               // ... otros campos del pedido
   8             }
       * Respuesta (Éxito `201 Created`): El objeto del pedido recién creado.

   * `PUT /pedidos/:id`
       * Descripción: Actualiza un pedido existente. También usa multipart/form-data.
       * Cuerpo (Petición `multipart/form-data`):
           * imagen: El nuevo archivo de imagen, un string null si se borra, o no se envía si no cambia.
           * data: Un string JSON con los datos a actualizar.
   1             // Ejemplo del string en el campo 'data'
   2             {
   3               "cliente": "Nombre Actualizado",
   4               "total": 120000,
   5               // ... otros campos a actualizar
   6             }
       * Respuesta (Éxito `200 OK`): El objeto del pedido actualizado.

   * `PATCH /pedidos/:id/estado`
       * Descripción: Actualiza únicamente el estado de un pedido (transición de flujo).
       * Cuerpo (Petición `application/json`):

   1         {
   2           "estado": "En Producción"
   3           // Opcionalmente, se pueden añadir otros campos relevantes a la transición
   4           // "fechaFinalizacion": "2025-12-03" (si estado es 'Listo para Entrega')
   5         }
       * Respuesta (Éxito `200 OK`): El objeto del pedido con el estado actualizado.

   * `POST /pedidos/cancelar-lote`
       * Descripción: Cambia el estado de múltiples pedidos a 'Cancelado'.
       * Cuerpo (Petición `application/json`):
   1         {
   2           "bolsas": ["1A", "3C", "5D"]
   3         }
       * Respuesta (Éxito `200 OK`): Un resumen de la operación.
   1         {
   2           "message": "Operación completada.",
   3           "actualizados": 3,
   4           "errores": 0
   5         }

  6. Reglas de Negocio y Validaciones (Lado Servidor)

  El backend debe replicar y reforzar las validaciones del frontend:

   1. Creación/Edición de Pedidos:
       * Los campos marcados como "Requerido" en la tabla de campos no deben ser nulos o vacíos.
       * El bolsa debe ser único. El backend debe rechazar la creación de un pedido con un número de bolsa ya existente y activo.
       * prendas no puede ser un número negativo.
       * abono y total deben ser valores numéricos no negativos.
   2. Edición de Pedidos:
       * Un pedido solo puede ser editado si su estado es Pendiente. El backend debe rechazar cualquier intento de PUT sobre pedidos en otros estados.
   3. Transiciones de Estado:
       * El backend debe validar que cualquier cambio de estado solicitado a través de PATCH /pedidos/:id/estado cumpla con el diagrama de transiciones definido en la sección 4. Por       
         ejemplo, no se puede pasar de Pendiente a Listo para Entrega.
   4. Imágenes:
       * El backend debe gestionar la subida de imágenes, guardarlas en un almacenamiento (ej. disco local, S3) y asociar la URL generada con el campo imagen del pedido.
       * Debe manejar la eliminación y actualización de imágenes.

  7. Dependencias entre Pantallas (Contexto para el Backend)

  El backend debe entender que el frontend opera con una única fuente de datos (pedidos) que se comparte entre todas las pantallas.

   * Cualquier cambio en un pedido (POST, PUT, PATCH) debe ser retornado en la respuesta para que el frontend pueda actualizar su estado global de manera reactiva.
   * La lógica de "bolsas disponibles" que se muestra en FormularioPedido es calculada en el frontend. El backend solo necesita garantizar la unicidad del campo bolsa al momento de        
     guardar.
   * Las diferentes pantallas (Pedido, Produccion, etc.) son simplemente vistas filtradas de la misma colección de datos. La API debe proveer todos los pedidos, y el frontend se encarga de
     filtrarlos según corresponda.