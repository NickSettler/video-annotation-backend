import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '../db/entities/workspace.entity';
import { CaslModule } from '../casl/casl.module';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace]), CaslModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
})
export class WorkspacesModule {}
