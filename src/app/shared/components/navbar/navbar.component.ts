import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  private cartService = inject(CartService);
  private router = inject(Router);

  menuOpen = false;
  isAdmin = false;
  isLoggedIn = false;

  private routerSub?: Subscription;

  ngOnInit(): void {
    this.loadSessionState();

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadSessionState();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  loadSessionState(): void {
    const rawUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    let user: any = null;

    try {
      user = rawUser ? JSON.parse(rawUser) : null;
    } catch {
      user = null;
    }

    this.isLoggedIn = !!token;
    this.isAdmin = user?.role === 'admin';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    this.isLoggedIn = false;
    this.isAdmin = false;
    this.menuOpen = false;

    this.router.navigate(['/']);
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  hasCartItems(): boolean {
    return this.cartService.hasItems();
  }

  getCartCount(): number {
    return this.cartService.getTotalItems();
  }
}