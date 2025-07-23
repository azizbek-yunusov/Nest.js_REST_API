import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PostImage } from './post-image.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  slug: string;

  @Column()
  image: string;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive';

  @Column({ default: 0 })
  viewCount: number;

  @Column()
  type: string;

  @UpdateDateColumn()
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PostImage, (image) => image.post, { cascade: true })
  images: PostImage[];
}
