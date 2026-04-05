import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import type { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(private userRepository: UserRepository) {}

    async create_user(createUserDto: CreateUserDto){
        const { email, password, user_name} = createUserDto;
        const existing = await this.userRepository.findByUsername(user_name);
        if (existing) {
            throw new ConflictException('Username already taken');
        }
        return this.userRepository.create({ user_name, password_hash: password, email });
    }

    async get_user_by_username(username: string){
        try{
            const result = await this.userRepository.findByUsername(username);
            return result;
        }catch(error){
            console.error("Error fetching user:", error)
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
}
