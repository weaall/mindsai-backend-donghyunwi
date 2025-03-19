import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { User } from './entities/user.entity';

describe('UsersController', () => {
    let controller: UsersController;
    let service: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                {
                    provide: UsersService,
                    useValue: {
                        createUser: jest.fn(),
                        getAllUsers: jest.fn(),
                        getUserById: jest.fn(),
                        updateUser: jest.fn(),
                        deleteUser: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => {
                    const request = context.switchToHttp().getRequest();
                    request.user = { id: 1 };
                    return true;
                },
            })
            .compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a user', async () => {
            const createUserDto: CreateUserDto = { name: 'Test', email: 'test@example.com', password: 'test1234' };
            const result = { id: 1, name: 'Test', email: 'test@example.com' };

            jest.spyOn(service, 'createUser').mockResolvedValue(result as User);

            expect(await controller.create(createUserDto)).toEqual(result);
        });
    });

    describe('listUsers', () => {
        it('should return an array of users', async () => {
            const result = [{ id: 1, name: 'Test', email: 'test@example.com' }];
            jest.spyOn(service, 'getAllUsers').mockResolvedValue(result as User[]);

            expect(await controller.listUsers()).toEqual(result);
        });
    });

    describe('getMe', () => {
        it('should return the current user', async () => {
            const result = { id: 1, name: 'Test', email: 'test@example.com' };
            jest.spyOn(service, 'getUserById').mockResolvedValue(result as User);

            expect(await controller.getMe({ user: { id: 1 } })).toEqual(result);
        });
    });

    describe('updateMe', () => {
        it('should update the current user', async () => {
            const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
            const result = { message: 'Name updated successfully', data: { id: 1, name: 'Updated Name', email: 'test@example.com' } };

            jest.spyOn(service, 'updateUser').mockResolvedValue(result);

            expect(await controller.updateMe(updateUserDto, { user: { id: 1 } })).toEqual(result);
        });
    });

    describe('deleteMe', () => {
        it('should delete the current user', async () => {
            jest.spyOn(service, 'deleteUser').mockResolvedValue(undefined);

            await expect(controller.deleteMe({ user: { id: 1 } })).resolves.toBeUndefined();
        });
    });
});
