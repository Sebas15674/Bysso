-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'EN_PRODUCCION', 'EN_PROCESO', 'FINALIZADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "numero_telefono" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "numero_prendas" INTEGER NOT NULL,
    "elegir_diseno" TEXT NOT NULL,
    "numero_bolsa" INTEGER NOT NULL,
    "descripcion" TEXT,
    "abono" DOUBLE PRECISION NOT NULL,
    "total_pagar" DOUBLE PRECISION NOT NULL,
    "posible_fecha_entrega" TIMESTAMP(3),
    "fecha_produccion_iniciada" TIMESTAMP(3),
    "fecha_produccion_finalizada" TIMESTAMP(3),
    "fecha_entrega_finalizada" TIMESTAMP(3),
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "creado_por" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);
