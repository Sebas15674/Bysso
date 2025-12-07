// server/prisma/seed.ts

import { PrismaClient, OrderStatus, OrderType, BagStatus, Prisma, Role } from '@prisma/client';

import * as bcrypt from 'bcrypt'; // Importar bcrypt



const prisma = new PrismaClient();



async function main() {

  console.log('Start seeding...');



  // ----------------------------------------------------------------------

  // 1. Seed Users (Administrators)

  // ----------------------------------------------------------------------

  console.log('Seeding Users (Administrators)...');

  const superAdminEmail = 'admin@bysso.com';

  const superAdminPassword = 'password123'; // ¡CAMBIAR ESTO EN PRODUCCIÓN Y USAR VARIABLES DE ENTORNO!

  const hashedPassword = await bcrypt.hash(superAdminPassword, 10); // Hash con salt de 10



  await prisma.user.upsert({

    where: { email: superAdminEmail },

    update: {

      password: hashedPassword,

      role: Role.SUPER_ADMIN,

    },

    create: {

      email: superAdminEmail,

      password: hashedPassword,

      role: Role.SUPER_ADMIN,

    },

  });

  console.log(`Created/Updated SUPER_ADMIN user: ${superAdminEmail}`);



  // ----------------------------------------------------------------------

  // 2. Seed Bags (Bolsas)

  // ----------------------------------------------------------------------

  console.log('Seeding Bags...');

  // Explicitly define the type of bagsToCreate

  const bagsToCreate: Prisma.BagCreateInput[] = []; // Corrected: Added explicit type



  const tipos = ['a', 'v']; // 'a' para azul, 'v' para verde



  // Bolsas Duales (1 al 20) -> '1a', '1v', ..., '20a', '20v'

  for (let i = 1; i <= 20; i++) {

    tipos.forEach(tipo => {

      bagsToCreate.push({ id: `${i}${tipo}`, status: BagStatus.DISPONIBLE });

    });

  }



  // Bolsas Simples (21 al 180) -> '21', '22', ..., '180'

  for (let i = 21; i <= 180; i++) {

    bagsToCreate.push({ id: String(i), status: BagStatus.DISPONIBLE });

  }



  // Use a transaction to create all bags

  await prisma.$transaction(

    bagsToCreate.map(bag => prisma.bag.upsert({

      where: { id: bag.id },

      update: { status: BagStatus.DISPONIBLE }, // Ensure they are available on update

      create: bag,

    }))

  );

  console.log(`Created/Updated ${bagsToCreate.length} Bags.`);



  // ----------------------------------------------------------------------

  // 3. Seed Workers (Trabajadores)

  // ----------------------------------------------------------------------

  console.log('Seeding Workers...');

  const workersToCreate = [

    { nombre: 'Alba lucia Noreña' },

    { nombre: 'Dayana Gallego' },

    { nombre: 'Rosa Sanchez' },

    { nombre: 'Juliana Betancur Noreña' },

  ];



  for (const worker of workersToCreate) {

    await prisma.worker.upsert({

      where: { nombre: worker.nombre },

      update: worker,

      create: worker,

    });

  }

  console.log(`Created/Updated ${workersToCreate.length} Workers.`);



  console.log('Seeding finished.');

}



main()

  .catch((e) => {

    console.error(e);

    process.exit(1);

  })

  .finally(async () => {

    await prisma.$disconnect();

  });
