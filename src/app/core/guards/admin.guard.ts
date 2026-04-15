import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(userData);

    if (user.role === 'admin') {
      return true;
    }

    router.navigate(['/']);
    return false;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.navigate(['/login']);
    return false;
  }
};