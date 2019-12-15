import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TodoStorageService } from './todo-storage.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [TodoStorageService],
})
export class AppModule {}
