import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptorFn } from './Interceptors/auth.interceptor';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SeatService } from './Service/seat.service';
import { ToastrModule } from 'ngx-toastr';
import { WebSocketInterceptor } from './Interceptors/WebSocket.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideHttpClient(withInterceptors([authInterceptorFn])),
    importProvidersFrom([
      BrowserAnimationsModule,
      ToastrModule.forRoot({
        timeOut: 4000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
        progressBar: true,
        closeButton: true,
        enableHtml: true,
        tapToDismiss: true,
        newestOnTop: true,
        maxOpened: 3,
        autoDismiss: true,
        extendedTimeOut: 2000,
        titleClass: 'toast-title',
        messageClass: 'toast-message'
      })
    ]),
    SeatService,
    WebSocketInterceptor
  ]
};