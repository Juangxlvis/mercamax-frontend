// src/app/app.routes.ts
import { Routes, UrlSegment, UrlMatchResult } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordConfirmComponent } from './reset-password-confirm/reset-password-confirm.component';
import { InviteUserComponent } from './invite-user/invite-user.component';
import { UbicacionesComponent } from './ubicaciones/ubicaciones.component';
import { LayoutComponent } from './layout/layout.component';
import { ProductsComponent } from './products/products.component';
import { AjusteInventarioComponent } from './ajuste-inventario/ajuste-inventario.component';
import { ReportesComponent } from './reportes/reportes.component';
import { AdminGuard } from './guards/admin.guard';

export function activateAccountMatcher(segments: UrlSegment[]): UrlMatchResult | null {
    if (segments.length === 3 && segments[0].path === 'activar-cuenta') {
        const uid = segments[1].path;
        const token = segments[2].path;
        return {
            consumed: segments,
            posParams: {
                uid: new UrlSegment(uid, {}),
                token: new UrlSegment(token, {})
            }
        };
    }
    return null;
}

const children: Routes = [
    { path: 'inventario/productos', component: ProductsComponent },
    { path: 'inventario/ubicaciones', component: UbicacionesComponent },
    { path: 'inventario/reportes', component: ReportesComponent },
    { path: 'inventario/ajuste', component: AjusteInventarioComponent },
    { path: 'admin/invite-user', component: InviteUserComponent, canActivate: [AdminGuard] }
];

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { matcher: activateAccountMatcher, component: RegistrationComponent },
    { path: 'reset-password-confirm/:uid/:token', component: ResetPasswordConfirmComponent },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: '', component: LayoutComponent, children },
];
