import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import type { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  async create_user(createUserDto: CreateUserDto) {
    const { email, password, user_name, first_name, last_name, role, verified } = createUserDto;
    const existing = await this.userRepository.findByUsername(user_name);
    if (existing) throw new ConflictException('Username already taken');
    return this.userRepository.create({ user_name, password_hash: password, email, first_name, last_name, role, verified });
  }

  async get_user_by_username(username: string) {
    const user = await this.userRepository.findByUsername(username);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async get_all_user() {
    return this.userRepository.findAll();
  }

  async check_user_exists(user_name: string, email: string) {
    return this.userRepository.existing_user(user_name, email);
  }

  async get_exist_user(user_name: string) {
    return this.userRepository.get_exist_user(user_name);
  }

  async update_user(user_id: number, dto: UpdateUserDto) {
    await this.userRepository.find_user_by_id(user_id);
    return this.userRepository.update(user_id, dto);
  }

  async delete_user(user_id: number) {
    await this.userRepository.find_user_by_id(user_id);
    return this.userRepository.delete_user(user_id);
  }
}
