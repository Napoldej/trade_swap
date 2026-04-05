import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';


@Injectable()
export class UserRepository {
  constructor(private db: DatabaseService) {}

  async create(data: { user_name: string; password_hash: string; email: string }) {
    return this.db.client.user.create({ data });
  }

  async findByUsername(username: string) {
    return this.db.client.user.findUnique({ where: { user_name: username } });
  }

  async findAll() {
    return this.db.client.user.findMany();
  }
}