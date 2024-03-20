import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/api/prisma/prisma.service';

@Controller('prisma')
export class PrismaController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('method-one')
  async methodOne() {
    return await this.prismaService.methodOne();
  }

  @Get('method-two')
  async methodTwo() {
    return await this.prismaService.methodTwo();
  }

  @Get('method-three')
  async methodThree() {
    return await this.prismaService.methodThree();
  }

  @Get('cls-one')
  async clsOne() {
    return await this.prismaService.clsOne();
  }

  @Get('clean')
  async clean() {
    return await this.prismaService.clean();
  }
}
