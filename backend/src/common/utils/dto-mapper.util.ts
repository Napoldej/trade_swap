import { ResponseUserDto } from 'src/user/dto/response-user.dto';

export function mapToResponseUserDto(user: any): ResponseUserDto {
  return {
    email: user.email,
    user_name: user.user_name,
    verified: user.verified,
  };
}