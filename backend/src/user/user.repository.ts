import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';


@Injectable()
export class UserRepository {
  constructor(private db: DatabaseService) {}

  //Create user
  async create(data: { user_name: string; password_hash: string; email: string, first_name: string, last_name: string}) {
    return this.db.client.user.create({ data });
  }

  // Find and Fetch
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
  async find_user_by_id(user_id: number){
    try{
      const existing = await this.db.client.user.findUnique({
        where: {
          user_id: user_id
        }
      })
      return existing
    }catch(error){
      console.error("Error fetching user by id:", error)
      throw new ConflictException('Error fetching user by id' + error.message);
    }
  }

  // Update
  async update(user_id: number, dto: UpdateUserDto){
    const updateData: Partial<UpdateUserDto> = {};
      if (dto.user_name) {
        updateData.user_name = dto.user_name;
      }
      if (dto.email) {
        updateData.email = dto.email;
      }

    const updated_user = await this.db.client.user.update({
      where: { user_id: user_id },
      data: { 
        ...updateData,
        updated_at: new Date()

      }
    })
    return updated_user
  }


  async delete_user(user_id: number){
    return this.db.client.user.delete({
      where: {
        user_id: user_id
      }
    })
  }
}