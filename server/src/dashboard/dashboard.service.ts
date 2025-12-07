import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client'; // Import OrderStatus enum

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getOrderStatusCounts() {
    // Use Prisma's groupBy to count orders by status directly in the database
    const orderStatusCounts = await this.prisma.order.groupBy({
      by: ['estado'], // Group by the 'estado' field
      _count: {
        estado: true, // Count the occurrences of 'estado'
      },
    });

    // Initialize counts for all possible statuses to ensure all are returned, even if 0
    const counts: Record<OrderStatus, number> = {
      PENDIENTE: 0,
      EN_PRODUCCION: 0,
      EN_PROCESO: 0,
      LISTO_PARA_ENTREGA: 0,
      ENTREGADO: 0,
      CANCELADO: 0,
    };

    // Map the grouped results back into the desired format
    orderStatusCounts.forEach(item => {
      // Ensure the estado from the database matches an OrderStatus enum value
      if (item.estado in counts) {
        counts[item.estado as OrderStatus] = item._count.estado;
      }
    });

    return counts;
  }

  async getInFlowOrdersCount(): Promise<number> {
    // Definir los estados que se consideran "en flujo"
    const inFlowStatuses: OrderStatus[] = [
      OrderStatus.PENDIENTE,
      OrderStatus.EN_PRODUCCION,
      OrderStatus.EN_PROCESO,
      OrderStatus.LISTO_PARA_ENTREGA,
    ];

    // Contar los pedidos que están en alguno de esos estados
    const count = await this.prisma.order.count({
      where: {
        estado: {
          in: inFlowStatuses, // Filtrar por los estados "en flujo"
        },
      },
    });

    return count;
  }
}

