import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findOneByEmail: jest.fn(),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn().mockReturnValue('token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user data without password if credentials are valid', async () => {
            const user: Partial<User> = {
                id: 1,
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                createdAt: new Date(),
            };
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user as User);

            const result = await service.validateUser('test@example.com', 'password123');
            expect(result).toMatchObject({ id: 1, email: 'test@example.com', name: 'Test User' });
        });

        it('should return null if credentials are invalid', async () => {
            const user: Partial<User> = {
                id: 1,
                email: 'test@example.com',
                password: await bcrypt.hash('password123', 10),
                name: 'Test User',
                createdAt: new Date(),
            };
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(user as User);

            const result = await service.validateUser('test@example.com', 'wrongpassword');
            expect(result).toBeNull();
        });

        it('should return null if user is not found', async () => {
            jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

            const result = await service.validateUser('nonexistent@example.com', 'password123');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return a signed JWT token', async () => {
            const user: Partial<User> = { id: 1, email: 'test@example.com', name: 'Test User' };
            const result = await service.login(user as User);
            expect(result).toEqual({ access_token: 'token' });
        });
    });
});
