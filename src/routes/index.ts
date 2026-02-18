import { Router } from 'express';

import { authRoutes } from '../modules/auth/auth.route';
import { userRoutes } from '../modules/user/user.route';

export const router: Router = Router();

interface IModuleRoute {
  path: string;
  route: Router;
}

const moduleRoutes: IModuleRoute[] = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
