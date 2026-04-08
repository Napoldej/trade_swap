import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  findAll() {
    return this.categoryRepository.findAll();
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.categoryRepository.create(dto);
    } catch {
      throw new ConflictException('Category name already exists');
    }
  }

  async update(id: number, dto: UpdateCategoryDto) {
    await this.findById(id);
    return this.categoryRepository.update(id, dto);
  }

  async remove(id: number) {
    await this.findById(id);
    return this.categoryRepository.remove(id);
  }
}
