import { ConflictException, Injectable } from '@nestjs/common';
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

  async existing_user(user_name: string, email: string){
    const existing_username = await this.db.client.user.findFirst({
      where: {
        user_name: user_name,
      }
    });
    if(existing_username){
      throw new ConflictException('Username already taken')
    }
    const existing_email = await this.db.client.user.findFirst({
      where: {
        email: email,
      }
    });
    if(existing_email){
      throw new ConflictException('Email already taken')
    }
    return false;
  }

  async get_exist_user(user_name: string){
    try{
      const existing = await this.db.client.user.findFirst({
        where: {
          user_name: user_name
        }
      })
      return existing;
    }
    catch(error){
      console.error("Error fetching user:", error)
      throw error;
    }
  }
}