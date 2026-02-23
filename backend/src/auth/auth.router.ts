import { Router } from 'express';
import { registerHandler, loginHandler, logoutHandler, profileHandler } from './auth.controller';
import { authMiddleware } from './auth.middleware';

const authRouter = Router();

authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.get('/profile', authMiddleware, profileHandler);

export default authRouter;