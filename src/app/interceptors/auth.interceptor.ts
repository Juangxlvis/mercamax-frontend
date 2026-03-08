import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('auth_token');

  const publicEndpoints = [
    '/api/auth/login/',
    '/api/auth/verify-2fa/',
    '/api/users/roles/'
  ];

  const isPublic = publicEndpoints.some(url => req.url.includes(url));

  if (isPublic) {
    return next(req);
  }

  if (token) {

    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });

    return next(clonedRequest);
  }

  return next(req);
};