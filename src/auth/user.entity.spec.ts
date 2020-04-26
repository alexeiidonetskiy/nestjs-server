import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('UserEntity', () => {
  let user: User;

  beforeEach(() => {
    user = new User();
    user.salt = 'testSalt';
    user.password = 'testPassword'
    bcrypt.hash = jest.fn();
  })
  describe('validatePassword', () => {
    it('returns true as password is valid', async () => {
      bcrypt.hash.mockReturnValue(user.password);
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword(user.password);
      expect(bcrypt.hash).toBeCalledWith(user.password, user.salt);
      expect(result).toBeTruthy();
    })

    it('returns false as password is invalid', async () => {
      bcrypt.hash.mockReturnValue('someWrongHash');
      expect(bcrypt.hash).not.toHaveBeenCalled();

      const result = await user.validatePassword('wrongPassword');
      expect(bcrypt.hash).toHaveBeenCalledWith('wrongPassword', user.salt);
      expect(result).toBeFalsy();

    })
  })
})
