import { Request } from 'express';
import { users } from '@prisma/client';

export interface RequestWithUser extends Request {
  user: users;
}
