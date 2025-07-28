import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelperModule } from './Helper/helper.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/helper'),
    HelperModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
