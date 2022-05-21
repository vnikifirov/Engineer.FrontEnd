import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { DashboardComponent } from './dashboard.component';
import { DashboardProductsComponent } from './dashboard-products/dashboard-products.component';
import { DashboardCategoriesComponent } from './dashboard-categories/dashboard-categories.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: DashboardProductsComponent,
        canActivate: [AuthGuard],
      },

      {
        path: 'categories',
        component: DashboardCategoriesComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
