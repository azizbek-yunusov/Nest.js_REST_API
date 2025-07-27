import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'admin' },
    });
    if (!existingAdmin) {
      const saltOrRounds = 10;
      const hashedPassword = await bcrypt.hash('admin123', saltOrRounds);
      const defaultAdmin: CreateUserDto = {
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        position: 'Administrator',
        password: hashedPassword,
        role: UserRole.ADMIN,
      };
      const adminUser = this.userRepository.create(defaultAdmin);
      await this.userRepository.save(adminUser);
      console.log('Default admin user created');
    } else {
      console.log('Default admin user already exists');
    }
  }
  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    if (existingUser) {
      throw new BadRequestException('Username already exists');
    }
    const saltOrRounds = 10;
    const hashedPassword = bcrypt.hashSync(
      createUserDto.password,
      saltOrRounds,
    );
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOneBy({ id });
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.userRepository.remove(user);
  }

  async findByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
