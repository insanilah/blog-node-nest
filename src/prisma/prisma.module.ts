import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Ekspor PrismaService agar dapat di-import oleh modul lain
})
export class PrismaModule {}
