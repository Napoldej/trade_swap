import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import type { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async create_user(createUserDto: CreateUserDto){
        const { email, password, user_name, first_name, last_name, role, verified } = createUserDto;
        const existing = await this.userRepository.findByUsername(user_name);
        if (existing) {
            throw new ConflictException('Username already taken');
        }
        return this.userRepository.create({ user_name, password_hash: password, email, first_name, last_name, role, verified });
    }

    async get_user_by_username(username: string){
        try{
            const user = await this.userRepository.findByUsername(username);
            if (!user) {
                throw new NotFoundException('User not found');
            }
            return user;
        } catch (error) {
            console.error("Error fetching user:", error)
            throw error;
        }
    }

    async get_all_user(){
        try{
            const result = await this.userRepository.findAll();
            return result;
        }catch(error){
            console.error("Error fetching users:", error)
        }
    }
    async check_user_exists(user_name: string, email: string){
        try{
            const existing = await this.userRepository.existing_user(user_name, email)
            return existing;
        }
        catch(error){
            console.error("Error checking user existence:", error)
            throw error;
        }
    }

    async get_exist_user(user_name: string){
        try{
            const existing = await this.userRepository.get_exist_user(user_name)
            return existing;
        }
        catch(error){
            console.error("Error fetching user:", error)
            throw error;
        }
    }

    async update_user(user_id: number, dto: UpdateUserDto){
        try{
            await this.userRepository.find_user_by_id(user_id);
            const result = await this.userRepository.update(user_id, dto);
            return result;
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    }

    async delete_user(user_id: number){
        try{
            await this.userRepository.find_user_by_id(user_id);
            return await this.userRepository.delete_user(user_id);
        } catch (error) {
            console.error("Error deleting user:", error);
            throw error;
        }
    }
}
