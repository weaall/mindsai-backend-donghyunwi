import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: {
                        validateUser: jest.fn(),
                        login: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('login', () => {
        it('should return an access token', async () => {
            const loginDto: LoginDto = { email: 'test@example.com', password: 'password123' };
            const user = { id: 1, email: 'test@example.com' };
            const accessToken = { access_token: 'token' };

            jest.spyOn(service, 'validateUser').mockResolvedValue(user);
            jest.spyOn(service, 'login').mockResolvedValue(accessToken);

            expect(await controller.login(loginDto)).toEqual({ accessToken: 'token' });
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            const loginDto: LoginDto = { email: 'invalid@example.com', password: 'wrongpassword' };

            jest.spyOn(service, 'validateUser').mockResolvedValue(null);

            await expect(controller.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
