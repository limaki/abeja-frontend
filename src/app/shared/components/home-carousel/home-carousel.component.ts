import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CarouselItem {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

@Component({
  selector: 'app-home-carousel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home-carousel.component.html',
  styleUrl: './home-carousel.component.css'
})
export class HomeCarouselComponent implements OnInit, OnDestroy {
  currentIndex = 0;
  intervalId: any;

  slides: CarouselItem[] = [
    {
      title: 'Nueva colección',
      subtitle: 'Descubrí prendas modernas, cómodas y listas para tu día a día.',
      buttonText: 'Comprar ahora',
      buttonLink: '/shop',
      image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80'
    },
    {
      title: 'Ofertas destacadas',
      subtitle: 'Encontrá tus favoritos con precios especiales por tiempo limitado.',
      buttonText: 'Ver ofertas',
      buttonLink: '/shop',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80'
    },
    {
      title: 'Comprá fácil',
      subtitle: 'Elegí tus productos y finalizá tu pedido rápido desde tu celular.',
      buttonText: 'Explorar tienda',
      buttonLink: '/shop',
      image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80'
    }
  ];

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.next();
    }, 4000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.startAutoSlide();
  }
}