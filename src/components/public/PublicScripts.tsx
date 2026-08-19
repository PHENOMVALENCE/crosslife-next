'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function PublicScripts({ includeHomeExtras = false }: { includeHomeExtras?: boolean }) {
  useEffect(() => {
    if (!includeHomeExtras) return;

    // Expandable feature cards
    document.querySelectorAll('.feature-card-compact[data-expandable]').forEach((card) => {
      const el = card as HTMLElement;
      const closeBtn = el.querySelector('.feature-card-close');
      closeBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        el.classList.remove('expanded');
      });
      el.addEventListener('click', (e) => {
        if ((e.target as Element).closest('.feature-card-close')) return;
        el.classList.toggle('expanded');
      });
    });

    // Hero slideshow
    const slides = document.querySelectorAll('.slideshow-container .slide');
    let currentSlide = 0;
    let slideInterval: ReturnType<typeof setInterval> | undefined;
    if (slides.length > 0) {
      const showSlide = (index: number) => {
        slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
        currentSlide = index;
      };
      const nextSlide = () => showSlide((currentSlide + 1) % slides.length);
      showSlide(0);
      slideInterval = setInterval(nextSlide, 8000);
    }

    // Convictions carousel
    const carousel = document.querySelector('.convictions-carousel');
    if (carousel) {
      const track = carousel.querySelector('.convictions-track') as HTMLElement;
      const cards = Array.from(track.querySelectorAll('.conviction-card')) as HTMLElement[];
      const dotsContainer = carousel.querySelector('.convictions-dots') as HTMLElement;
      const prevBtn = carousel.querySelector('.convictions-prev');
      const nextBtn = carousel.querySelector('.convictions-next');
      let currentIndex = 0;
      let cardsPerView = 3;
      let autoplayInterval: ReturnType<typeof setInterval> | undefined;

      const getCardsPerView = () => {
        if (window.innerWidth <= 576) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
      };

      const getTotalPages = () => Math.ceil(cards.length / cardsPerView);

      const buildDots = () => {
        dotsContainer.innerHTML = '';
        for (let i = 0; i < getTotalPages(); i++) {
          const dot = document.createElement('button');
          dot.className = 'dot' + (i === currentIndex ? ' active' : '');
          dot.setAttribute('aria-label', `Go to slide group ${i + 1}`);
          dot.addEventListener('click', () => {
            goTo(i);
            resetAutoplay();
          });
          dotsContainer.appendChild(dot);
        }
      };

      const updateDots = () => {
        dotsContainer.querySelectorAll('.dot').forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      };

      const goTo = (index: number) => {
        const pages = getTotalPages();
        if (index < 0) index = pages - 1;
        if (index >= pages) index = 0;
        currentIndex = index;
        const cardWidth = cards[0].offsetWidth + 16;
        track.style.transform = `translateX(-${currentIndex * cardsPerView * cardWidth}px)`;
        updateDots();
      };

      const next = () => goTo(currentIndex + 1);
      const prev = () => goTo(currentIndex - 1);
      const startAutoplay = () => {
        autoplayInterval = setInterval(next, 5000);
      };
      const resetAutoplay = () => {
        clearInterval(autoplayInterval);
        startAutoplay();
      };

      prevBtn?.addEventListener('click', () => {
        prev();
        resetAutoplay();
      });
      nextBtn?.addEventListener('click', () => {
        next();
        resetAutoplay();
      });

      cardsPerView = getCardsPerView();
      buildDots();
      goTo(0);
      startAutoplay();

      return () => {
        if (slideInterval) clearInterval(slideInterval);
        if (autoplayInterval) clearInterval(autoplayInterval);
      };
    }

    return () => {
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [includeHomeExtras]);

  return (
    <>
      <Script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/aos/aos.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/swiper/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/glightbox/js/glightbox.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}
