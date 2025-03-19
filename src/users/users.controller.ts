import { Controller, Post, Body, Get, Put, Delete, Req, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'OK' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 409, description: 'Eail already exists' })
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.createUser(createUserDto.name, createUserDto.email, createUserDto.password);
        const { password, ...result } = user;
        return result;
    }

    @Get()
    @ApiOperation({ summary: 'List all users' })
    @ApiResponse({ status: 200, description: 'OK' })
    async listUsers() {
        return this.usersService.getAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Get('me')
    @ApiOperation({ summary: 'Get My Data' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMe(@Req() req) {
        const user = await this.usersService.getUserById(req.user.id);
        const { password, ...userData } = user;
        return userData;
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Put('me')
    @ApiOperation({ summary: 'Update My Data' })
    @ApiResponse({ status: 200, description: 'OK' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateMe(@Body() updateUserDto: UpdateUserDto, @Req() req) {
        return this.usersService.updateUser(req.user.id, updateUserDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @Delete('me')
    @HttpCode(204)
    @ApiOperation({ summary: 'Delete My Data' })
    @ApiResponse({ status: 204, description: 'The user has been successfully deleted.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    async deleteMe(@Req() req) {
        await this.usersService.deleteUser(req.user.id);
    }
}
