import { PartialType } from '@nestjs/swagger';
import { CreatePostTypeDto } from './create-post-type.dto';

export class UpdatePostTypeDto extends PartialType(CreatePostTypeDto) {}
