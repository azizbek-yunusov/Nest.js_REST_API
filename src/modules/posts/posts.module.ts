import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostType } from './entities/post-type.entity';
import { Post } from './entities/post.entity';
import { PostImage } from './entities/post-image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PostType, PostImage, Post])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
