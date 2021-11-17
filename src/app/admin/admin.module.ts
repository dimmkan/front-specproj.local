import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule} from "@angular/router";
import {AdminLayoutComponent} from "./shared/components/admin-layout/admin-layout.component";
import {LoginPageComponent} from "./login-page/login-page.component";
import { DashboardPageComponent } from './dashboard-page/dashboard-page.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "./shared/services/auth.service";
import {SharedModule} from "../shared/shared.module";
import {AuthGuard} from "./shared/services/auth.guard";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    AdminLayoutComponent,
    LoginPageComponent,
    DashboardPageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path:'', component:AdminLayoutComponent, children:[
          {path:'', redirectTo: '/admin/login', pathMatch:'full'},
          {path:'login', component:LoginPageComponent},
          {path:'dashboard', component:DashboardPageComponent, canActivate:[AuthGuard]}
        ]
      }
    ]),
    SharedModule
  ],
  exports:[RouterModule],
  providers: [AuthService, AuthGuard]
})
export class AdminModule { }
