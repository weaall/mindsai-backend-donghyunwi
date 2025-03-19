import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}
    async createUser(name: string, email: string, password: string): Promise<User> {
        if (!name || !email || !password) {
            throw new BadRequestException('All fields are required');
        }

        if (name.length < 2 || name.length > 50) {
            throw new BadRequestException('Name must be between 2 and 50 characters long');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        if (password.length < 8 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
            throw new BadRequestException('Password must be at least 8 characters long and contain both letters and numbers');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = this.usersRepository.create({ name, email, password: hashedPassword });
        return this.usersRepository.save(user);
    }

    async getAllUsers(): Promise<{ id: number; name: string; email: string }[]> {
        const users = await this.usersRepository.find();
        return users.map((user) => {
            const { password, ...userData } = user;
            return userData;
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<{ message: string; data?: Partial<User> }> {
        const user = await this.usersRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        let updatedFields: string[] = [];

        if (updateUserDto.name) {
            if (updateUserDto.name.length < 2 || updateUserDto.name.length > 50) {
                throw new BadRequestException('Name must be between 2 and 50 characters long');
            }
            user.name = updateUserDto.name;
            updatedFields.push('name');
        }

        if (updateUserDto.password) {
            if (updateUserDto.password.length < 8 || !/\d/.test(updateUserDto.password) || !/[a-zA-Z]/.test(updateUserDto.password)) {
                throw new BadRequestException('Password must be at least 8 characters long and contain both letters and numbers');
            }

            const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
            user.password = hashedPassword;
            updatedFields.push('password');
        }

        const otherFields = Object.keys(updateUserDto).filter((field) => field !== 'name' && field !== 'password');
        if (otherFields.length > 0) {
            throw new BadRequestException(`Invalid fields: ${otherFields.join(', ')}`);
        }

        await this.usersRepository.save(user);

        const updatedUser = await this.getUserById(id);
        const { password, ...userData } = updatedUser;

        let message = '';
        if (updatedFields.length === 1) {
            if (updatedFields.includes('name')) {
                message = 'Name updated successfully';
            } else if (updatedFields.includes('password')) {
                message = 'Password updated successfully';
            }
        } else if (updatedFields.length === 2) {
            message = 'Name and password updated successfully';
        } else {
            message = 'No fields were updated';
        }

        return {
            message: message,
            data: userData,
        };
    }

    async deleteUser(id: number): Promise<void> {
        await this.usersRepository.delete(id);
    }

    async findOneByEmail(email: string): Promise<User | undefined> {
        return this.usersRepository.findOne({ where: { email } });
    }
}
