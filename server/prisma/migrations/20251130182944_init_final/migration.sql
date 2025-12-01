-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDIENTE', 'EN_PRODUCCION', 'EN_PROCESO', 'LISTO_PARA_ENTREGA', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('BORDADO', 'ESTAMPADO', 'ESTAMPADO_Y_BORDADO', 'OTROS');

-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('DISPONIBLE', 'OCUPADA');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "trabajadorId" TEXT NOT NULL,
    "tipo" "OrderType" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "abono" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "prendas" INTEGER NOT NULL DEFAULT 0,
    "fechaEntrega" DATE NOT NULL,
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "imagenUrl" VARCHAR(500),
    "estado" "OrderStatus" NOT NULL DEFAULT 'PENDIENTE',
    "fechaFinalizacion" DATE,
    "fechaCancelacion" TIMESTAMP(3),
    "fechaEntregaReal" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bagId" TEXT NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bolsas" (
    "id" VARCHAR(10) NOT NULL,
    "status" "BagStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bolsas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,
    "celular" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "orders_estado_idx" ON "orders"("estado");

-- CreateIndex
CREATE INDEX "orders_clienteId_idx" ON "orders"("clienteId");

-- CreateIndex
CREATE INDEX "orders_trabajadorId_idx" ON "orders"("trabajadorId");

-- CreateIndex
CREATE INDEX "orders_fechaEntrega_idx" ON "orders"("fechaEntrega");

-- CreateIndex
CREATE INDEX "orders_fechaFinalizacion_idx" ON "orders"("fechaFinalizacion");

-- CreateIndex
CREATE INDEX "orders_fechaCancelacion_idx" ON "orders"("fechaCancelacion");

-- CreateIndex
CREATE INDEX "orders_fechaEntregaReal_idx" ON "orders"("fechaEntregaReal");

-- CreateIndex
CREATE INDEX "bolsas_status_idx" ON "bolsas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bolsas_id_key" ON "bolsas"("id");

-- CreateIndex
CREATE UNIQUE INDEX "clientes_cedula_key" ON "clientes"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "workers_nombre_key" ON "workers"("nombre");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_trabajadorId_fkey" FOREIGN KEY ("trabajadorId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "bolsas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
