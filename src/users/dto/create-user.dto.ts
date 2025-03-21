import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({
        description: 'User Name',
        example: 'Test',
        minLength: 2,
        maxLength: 50,
    })
    @IsString()
    @Length(2, 50, { message: 'Name must be between 2 and 50 characters long' })
    name: string;

    @ApiProperty({
        description: 'Email',
        example: 'test@example.com',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({
        description: 'Password',
        example: 'test1234',
        minLength: 8,
    })
    @IsString()
    @Length(8, undefined, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: 'Password must include both numbers and letters',
    })
    password: string;
}
