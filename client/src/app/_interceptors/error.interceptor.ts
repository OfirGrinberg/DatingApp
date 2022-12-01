import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (err) {
          switch (err.status) {
            case 400:
              const errs = err.error.errors;
              if (errs) {
                const modalStateErrors = [];
                for (const key in errs) {
                  if (errs[key]) {
                    modalStateErrors.push(errs[key]);
                  }
                }
                throw modalStateErrors.flat();
              } else {
                this.toastr.error(
                  err.statusText === 'OK' ? 'Bad Request' : err.statusText,
                  err.status
                );
              }
              break;
            case 401:
              this.toastr.error(
                err.statusText === 'OK' ? 'Unauthorized' : err.statusText,
                err.status
              );
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {
                state: { error: err.error },
              };
              this.router.navigateByUrl('server-error', navigationExtras);
              break;
            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(err);
              break;
          }
        }
        return throwError(() => err);
      })
    );
  }
}
