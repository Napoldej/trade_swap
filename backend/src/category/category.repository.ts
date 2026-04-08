import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryRepository {
  constructor(private readonly db: DatabaseService) {}

  findAll() {
    return this.db.client.category.findMany({
      orderBy: { category_name: 'asc' },
    });
  }

  findById(category_id: number) {
    return this.db.client.category.findUnique({ where: { category_id } });
  }

  create(dto: CreateCategoryDto) {
    return this.db.client.category.create({ data: { category_name: dto.category_name } });
  }

  update(category_id: number, dto: UpdateCategoryDto) {
    return this.db.client.category.update({
      where: { category_id },
      data: { category_name: dto.category_name },
    });
  }

  remove(category_id: number) {
    return this.db.client.category.delete({ where: { category_id } });
  }
}
