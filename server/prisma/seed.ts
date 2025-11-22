import { PrismaClient, EstadoPedido } from '@prisma/client';

// Inicializa el cliente de Prisma
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando el proceso de seeding...');

  // Limpiar datos existentes para evitar duplicados
  await prisma.pedido.deleteMany();
  console.log('Datos antiguos eliminados.');

  // Crear un pedido de ejemplo
  const pedido1 = await prisma.pedido.create({
    data: {
      nombreCompleto: 'Juan Pérez',
      numeroTelefono: '3001234567',
      cedula: '123456789',
      numeroPrendas: 3,
      elegirDiseno: 'Diseño personalizado #123',
      numeroBolsa: 101,
      descripcion: 'Camiseta negra talla M, con logo en el pecho.',
      abono: 50000,
      totalPagar: 150000,
      posibleFechaEntrega: new Date('2025-12-24T10:00:00Z'),
      estado: EstadoPedido.EN_PRODUCCION,
      creadoPor: 'admin_user',
      fechaProduccionIniciada: new Date(),
    },
  });

  console.log('Seeding completado.');
  console.log(`Creado pedido con ID: ${pedido1.id}`);
}

// Ejecutar la función main y manejar errores
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerrar la conexión a la base de datos
    await prisma.$disconnect();
  });
