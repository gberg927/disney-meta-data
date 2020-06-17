import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authenticate = async (email, password) => {
  const user = await prisma.user.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return null;
  }
  return user;
};
