import { JwtStrategy } from './jwt.stategy';
import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UnauthorizedException } from '@nestjs/common';

const mockUserRepository = () => ({
  findOne: jest.fn().mockResolvedValue({ username: 'testUsername' }),
});

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: UserRepository, useFactory: mockUserRepository },
      ],
    }).compile();

    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate', () => {
    it('it returns the user based on jwt payload', async () => {
      const jwtPayload = { username: 'testUser' };
      const user = new User();
      user.username = 'testUser';
      userRepository.findOne.mockResolvedValue(jwtPayload);

      const result = await jwtStrategy.validate({ username: user.username });
      expect(userRepository.findOne).toHaveBeenCalledWith(jwtPayload);
      expect(result).toEqual(user);
    });

    it('throws unauthorized exception as user can not be found', () => {
      userRepository.findOne.mockResolvedValue(
        Promise.reject(new UnauthorizedException()),
      );

      expect(jwtStrategy.validate({ username: 'TestUser' })).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
