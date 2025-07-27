import { Express } from 'express';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { PostType } from './entities/post-type.entity';
import { CreatePostTypeDto } from './dto/create-post-type.dto';
import { PostImage } from './entities/post-image.entity';
import * as path from 'path';
import * as fs from 'fs';

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

    const images = files.map((file) =>
      this.postImageRepo.create({
        url: `/uploads/images/${file.filename}`,
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

  async findOne(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id: ${id} not found`);
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    files: Express.Multer.File[],
  ) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!post) {
      throw new NotFoundException(`Post with id: ${id} not found`);
    }

    Object.assign(post, updatePostDto);

    console.log(post);

    const updatedPost = await this.postRepo.save(post);

    const images = files.map((img) =>
      this.postImageRepo.create({
        url: `/uploads/images/${img.filename}`,
        post: updatedPost,
      }),
    );

    await this.postImageRepo.save(images);

    return this.postRepo.find({
      where: { id },
      relations: ['images'],
    });
  }

  async remove(id: number) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    for (const image of post.images) {
      if (!image?.url) continue;
      // import * as path from 'path'; import qilish shu korinishda bolishi kerak
      const filename = path.basename(image.url);

      // process.swd() loyiha izi __dirname da dist/ ga kirib ketadi
      const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Fayl o‘chirishda xatolik:', err);
      }
    }

    await this.postRepo.remove(post);

    return { ...post };
  }
  async deletePostImage(id: number) {
    console.log(id);

    const postImage = await this.postImageRepo.findOne({ where: { id } });
    if (!postImage) {
      throw new NotFoundException(`Post image with id:${id} not foud`);
    }
    console.log(postImage);

    const filename = path.basename(postImage.url);

    const imagePath = path.join(process.cwd(), 'uploads', 'images', filename);

    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (err) {
      console.log('Image delete error:', err);
    }

    // const post = await this.postRepo.findOne({
    //   where: { id: postImage.post.id },
    //   relations: ['images'],
    // });

    // if (post) {
    //   post.images = post.images.filter((img) => img.id !== id);

    //   await this.postRepo.save(post);
    // }
    await this.postImageRepo.remove(postImage);
  }
}
