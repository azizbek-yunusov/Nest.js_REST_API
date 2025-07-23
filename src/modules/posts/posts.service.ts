import { Express } from 'express';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostType } from './entities/post-type.entity';
import { CreatePostTypeDto } from './dto/create-post-type.dto';
import { PostImage } from './entities/post-image.entity';
@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepo: Repository<Post>,
    @InjectRepository(PostType) private postTypeRepo: Repository<PostType>,
    @InjectRepository(PostImage) private postImageRepo: Repository<PostImage>,
  ) {}

  async createWithImages(dto: CreatePostDto, files: Express.Multer.File[]) {
    const post = this.postRepo.create({
      title: dto.title,
      content: dto.content,
      slug: dto.slug,
      type: dto.type,
      image: dto.image,
    });

    const savedPost = await this.postRepo.save(post);
    console.log(files);

    const images = files.map((file) =>
      this.postImageRepo.create({
        url: `/uploads/posts/${file.filename}`,
        post: savedPost,
      }),
    );

    await this.postImageRepo.save(images);

    return this.postRepo.findOne({
      where: { id: savedPost.id },
      relations: ['images'],
    });
  }

  async create(createPostDto: CreatePostDto) {
    const existingPost = await this.postRepo.findOne({
      where: { slug: createPostDto.slug },
    });
    if (existingPost) {
      throw new BadRequestException('Slug alredy exist');
    }
    const post = this.postRepo.create(createPostDto);
    return this.postRepo.save(post);
  }

  findAll() {
    return this.postRepo.find({
      relations: ['images'],
    });
  }

  async createType(createPostTypeDto: CreatePostTypeDto) {
    const existingType = await this.postTypeRepo.findOne({
      where: { slug: createPostTypeDto.slug },
    });
    if (existingType) {
      throw new BadRequestException('Slug already exist');
    }
    const postType = this.postTypeRepo.create(createPostTypeDto);
    return this.postTypeRepo.save(postType);
  }

  findAllTypes() {
    return this.postTypeRepo.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action update a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
