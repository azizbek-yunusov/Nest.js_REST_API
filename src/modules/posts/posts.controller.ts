import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreatePostTypeDto } from './dto/create-post-type.dto';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 6, {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (res, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, unique + extname(file.originalname));
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.postsService.createWithImages(createPostDto, files);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Post('type')
  @ApiOperation({ summary: 'Create Post Type' })
  createType(@Body() createPostTypeDto: CreatePostTypeDto) {
    return this.postsService.createType(createPostTypeDto);
  }

  @Get('types')
  @ApiOperation({ summary: 'Get all types' })
  findAllTypes() {
    return this.postsService.findAllTypes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
