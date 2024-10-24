import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  GetOrderDtoOutput,
  SubmitOrderDto,
  SubmitOrderDtoOutput,
} from './orders.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('/:id')
  async getOrder(@Param('id') orderId: string): Promise<GetOrderDtoOutput> {
    const order = await this.ordersService.getOrder(orderId);
    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
    return order;
  }

  @Post()
  async submitOrder(
    @Body() order: SubmitOrderDto
  ): Promise<SubmitOrderDtoOutput> {
    const orderId = await this.ordersService.submitOrder(order);
    return { orderId };
  }
}
