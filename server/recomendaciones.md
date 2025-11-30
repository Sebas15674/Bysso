 # Plan de Acción: Mejora de la Integración Frontend-Backend
     2
    3 Este documento describe las tareas necesarias para alinear completamente el backend con los requisitos del frontend, garantizando una integración fluida y robusta.
    4
    5 ---
    6
    7 ## 1. Tareas Críticas del Backend
    8
    9 Las siguientes tareas son fundamentales para habilitar los flujos principales del frontend:
   10
   11 ### 1.1. Implementar Filtrado de Bolsas por Estado
   12
   13 *   **Descripción:** El frontend necesita obtener bolsas disponibles para la creación de pedidos. Actualmente, el endpoint `/bags` del backend no soporta el filtrado por estado (ej.,     
      `AVAILABLE`).
   14 *   **Acciones:**
   15     *   Modificar `server/src/bags/bags.controller.ts` para aceptar un parámetro de consulta `status` (ej., `GET /bags?status=AVAILABLE`).
   16     *   Modificar `server/src/bags/bags.service.ts` para implementar la lógica de filtrado de bolsas por el `status` proporcionado.
   17
   18 ### 1.2. Definir Endpoints y Lógica para la Gestión de Estados de Pedidos
   19
   20 *   **Descripción:** El frontend requiere funcionalidades específicas para visualizar y gestionar pedidos en diferentes etapas (Producción, Finalización, Historial) y para actualizar sus 
      estados. El backend actual carece de endpoints dedicados y/o lógica para estas operaciones.
   21 *   **Acciones:**
   22     *   **Filtrado de Pedidos por Estado:**
   23         *   Modificar `server/src/orders/orders.controller.ts` para que el endpoint `GET /orders` soporte un parámetro de consulta `status` (ej., `GET /orders?status=EN_PRODUCCION`).     
   24         *   Implementar la lógica de filtrado en `server/src/orders/orders.service.ts` para retornar pedidos que coincidan con el estado solicitado (EN_PRODUCCION, LISTO_PARA_ENTREGA,    
      ENTREGADO, etc.).
   25     *   **Transiciones de Estado Específicas:**
   26         *   Crear nuevos endpoints en `server/src/orders/orders.controller.ts` para manejar transiciones de estado específicas, por ejemplo:
   27             *   `PATCH /orders/:id/to-production`
   28             *   `PATCH /orders/:id/to-finalized`
   29             *   `PATCH /orders/:id/to-delivered`
   30         *   Implementar la lógica de transición de estado en `server/src/orders/orders.service.ts` para cada endpoint, incluyendo validaciones para asegurar transiciones válidas. Consider
      la lógica ya presente en `cancel-orders.dto.ts` como referencia.

Este documento describe las tareas necesarias para alinear completamente el backend con los requisitos del frontend, garantizando una integración fluida y robusta.

---

## 1. Tareas Críticas del Backend

 ## 2. Recomendaciones de Buenas Prácticas
   44
   45 Estas recomendaciones buscan mejorar la consistencia y la mantenibilidad de la API.
   46
   47 ### 2.1. Consistencia en Nomenclatura de Endpoints
   48
   49 *   **Descripción:** Unificar la nomenclatura de los recursos en los endpoints para evitar discrepancias entre el frontend y el backend (ej., frontend usa `/pedidos` y backend `/orders`).
   50 *   **Recomendación:** Estandarizar la API a la nomenclatura en inglés (`/orders`, `/clients`, `/bags`) ya que es una práctica común en el diseño de APIs RESTful y el backend ya la utiliz
      en gran parte. Esto implicará ajustar las llamadas en el frontend.
Las siguientes tareas son fundamentales para habilitar los flujos principales del frontend:

### 1.1. Implementar Filtrado de Recursos por Estado

*   **Descripción:** El frontend necesita obtener listas de recursos filtradas por su estado actual.
*   **Acciones:**
    *   **Bolsas:** Modificar `server/src/bags/bags.controller.ts` para que el endpoint `findAll()` acepte un parámetro de consulta `status` (ej., `GET /bags?status=AVAILABLE`). La lógica de filtrado se implementará en `server/src/bags/bags.service.ts`.
    *   **Pedidos:** Modificar `server/src/orders/orders.controller.ts` para que el endpoint `findAll()` soporte un parámetro de consulta `status` (ej., `GET /orders?status=EN_PRODUCCION`). La lógica se implementará en `server/src/orders/orders.service.ts` para devolver pedidos que coincidan con el estado solicitado (EN_PRODUCCION, LISTO_PARA_ENTREGA, ENTREGADO, etc.).

### 1.2. Unificar y Mejorar la Gestión de Estados de Pedidos

*   **Descripción:** El frontend requiere una forma clara y segura de transicionar los pedidos entre diferentes etapas. El enfoque actual de múltiples endpoints (`/to-production`, `/to-finalized`) es poco escalable.
*   **Acciones:**
    *   **Endpoint Unificado:** Reemplazar los múltiples endpoints de transición por un único endpoint robusto: `PATCH /orders/:id/status`.
    *   **DTO para Cambio de Estado:** Crear un DTO (`UpdateOrderStatus.dto.ts`) que valide el nuevo estado recibido en el body de la petición.
        ```typescript
        // server/src/orders/dto/update-order-status.dto.ts
        import { IsEnum, IsNotEmpty } from 'class-validator';
        import { OrderStatus } from '../entities/order.entity'; // Asumiendo que OrderStatus es un enum

        export class UpdateOrderStatusDto {
          @IsEnum(OrderStatus)
          @IsNotEmpty()
          status: OrderStatus;
        }
        ```
    *   **Lógica de Transición Segura:**
        *   En `server/src/orders/orders.controller.ts`, crear un método `updateStatus(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto)`.
        *   En `server/src/orders/orders.service.ts`, implementar la lógica en `updateStatus`. Esta debe:
            1.  Recuperar el pedido actual de la base de datos.
            2.  Validar que la transición del estado actual al nuevo estado es permitida (ej. un pedido `ENTREGADO` no puede volver a `EN_PRODUCCION`).
            3.  Actualizar el estado y guardar el pedido.
            4.  Devolver el pedido actualizado.



## 2. Recomendaciones de Buenas Prácticas

Estas recomendaciones buscan mejorar la consistencia y la mantenibilidad de la API.

### 2.1. Consistencia en Nomenclatura de Endpoints

*   **Problema:** El frontend usa `/pedidos` mientras que el backend expone `/orders`.
*   **Recomendación:** **Estandarizar toda la comunicación a la nomenclatura en inglés** (`/orders`, `/clients`, `/bags`). Es una práctica estándar en APIs RESTful y el backend ya la utiliza mayoritariamente.
*   **Acción Inmediata:** El frontend debe actualizar todas las llamadas a la API para usar `/orders` en lugar de `/pedidos`.

### 2.2. Centralización de la Lógica de Negocio

*   **Problema:** La lógica de negocio, como las validaciones de transición de estado, debe residir en la capa de servicio del backend, no en los controladores.
*   **Recomendación:** Asegurarse de que los controladores (`*.controller.ts`) se limiten a recibir peticiones y devolver respuestas, delegando toda la lógica de negocio a los servicios (`*.service.ts`). Esto hace que el código sea más reutilizable, testeable y fácil de mantener.






 Prioridad 2: Habilitar la Visualización de Pedidos por Estado

   1. Filtrar Pedidos por Estado:
       * Objetivo: Las tablas del frontend (TablaPedidos, TablaProduccion, etc.) necesitan llamar a GET /orders?status=PRODUCCION, etc.
       * Acción:
           * En orders.service.ts, utiliza el query.status que ya recibes en el método findAll para filtrar la consulta: this.prisma.order.findMany({ where: { status: query.status } }).
           * Asegúrate de que el order-query.dto.ts tenga validadores adecuados para el campo status (@IsEnum(OrderStatus), @IsOptional()).