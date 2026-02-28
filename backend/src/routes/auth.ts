import { Router } from 'express';
import { signUp, signInWithPassword, getUser, signOut } from '../controllers/authController';

const router = Router();

router.post('/signup', signUp);
router.post('/signin', signInWithPassword);
router.get('/user', getUser);
router.post('/signout', signOut);

export default router;
