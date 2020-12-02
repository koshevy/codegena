import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TodoStorageService } from './todo-storage.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [TodoStorageService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
      // todo add service tests
  });
});
