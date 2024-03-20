import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { ApiModule } from './api/api.module';
import { ClsModule } from 'nestjs-cls';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { PrismaClient } from 'src/modules/prisma/prisma.service';

@Module({
  imports: [
    PrismaModule,
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          // if PrismaModule is not global, we need to make it available to the plugin
          imports: [PrismaModule],
          adapter: new TransactionalAdapterPrisma({
            // each adapter has its own options, see the adapter docs for more info
            prismaInjectionToken: PrismaClient,
          }),
        }),
      ],
    }),
    ApiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
