import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({
        description: 'User Name',
        example: 'Test',
        minLength: 2,
        maxLength: 50,
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(2)
    @MaxLength(50)
    name?: string;

    @ApiProperty({
        description: 'Password',
        example: 'test1234',
        minLength: 8,
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(8)
    @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/, {
        message: 'Password must be at least 8 characters long and contain both letters and numbers',
    })
    password?: string;
}
