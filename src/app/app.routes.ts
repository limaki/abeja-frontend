import { Routes } from '@angular/router';

// 🔓 PUBLIC
import { HomeComponent } from './pages/home/home.component';
import { ShopComponent } from './pages/shop/shop.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { MyOrdersComponent } from './pages/my-orders/my-orders.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

// 🔐 GUARDS
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

// 🔐 ADMIN
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { CategoriesComponent } from './pages/admin/categories/categories.component';
import { ProductsComponent } from './pages/admin/products/products.component';
import { OrdersComponent } from './pages/admin/orders/orders.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'product/:id', component: ProductDetailComponent },

  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },

  { path: 'my-orders', component: MyOrdersComponent, canActivate: [authGuard] },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'admin/dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/categories', component: CategoriesComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: ProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: OrdersComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];