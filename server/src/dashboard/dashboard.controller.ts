import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardStats() {
    return this.dashboardService.getOrderStatusCounts();
  }

  @Get('in-flow-orders-count')
  async getInFlowOrdersCount(): Promise<number> {
    return this.dashboardService.getInFlowOrdersCount();
  }
}
