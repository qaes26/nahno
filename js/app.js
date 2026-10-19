/* ==========================================================================
   منصة نَحْنُ (Nahno) للتطوع × جامعة إربد الأهلية
   التفاعلات البرمجية والتأثيرات الحية (Main App Interactions)
   إعداد: قيس الجازي
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileNav();
    initStatsCounter();
    initTracksFilter();
    initFaqAccordion();
    initContactForm();
  });

  /* -------------------------------------------------------------------------
     1. شريط التنقل وتأثير التمرير (Sticky Navbar)
     ------------------------------------------------------------------------- */
  function initNavbar() {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }

      // تحديد الرابط النشط أثناء التمرير
      let currentSection = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------
     2. قائمة الموبايل (Mobile Navigation Drawer)
     ------------------------------------------------------------------------- */
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileNavToggle');
    const drawer = document.getElementById('mobileNavDrawer');
    const drawerLinks = drawer?.querySelectorAll('a');

    if (!toggleBtn || !drawer) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
      }
    });

    drawerLinks?.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        const icon = toggleBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  /* -------------------------------------------------------------------------
     3. عداد الإحصائيات التفاعلي (Animated Counter)
     ------------------------------------------------------------------------- */
  function initStatsCounter() {
    const statCounters = document.querySelectorAll('.stat-num[data-target]');
    if (!statCounters.length) return;

    let hasRun = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          statCounters.forEach(counter => {
            const target = +counter.getAttribute('data-target');
            const suffix = counter.getAttribute('data-suffix') || '';
            const prefix = counter.getAttribute('data-prefix') || '';
            const duration = 1800;
            const startTime = performance.now();

            function updateCounter(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // دالة التخفيف easeOutQuad
              const easeOut = 1 - Math.pow(1 - progress, 3);
              const currentVal = Math.floor(easeOut * target);

              counter.innerText = `${prefix}${currentVal.toLocaleString('ar-EG')}${suffix}`;

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                counter.innerText = `${prefix}${target.toLocaleString('ar-EG')}${suffix}`;
              }
            }

            requestAnimationFrame(updateCounter);
          });
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats-row');
    if (statsSection) observer.observe(statsSection);
  }


  /* -------------------------------------------------------------------------
     5. تصفية مجالات التطوع (Tracks Filter)
     ------------------------------------------------------------------------- */
  function initTracksFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const trackCards = document.querySelectorAll('.track-card');

    if (!filterBtns.length || !trackCards.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        trackCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
            setTimeout(() => { card.style.opacity = '1'; }, 10);
          } else {
            card.style.opacity = '0';
            setTimeout(() => { card.style.display = 'none'; }, 200);
          }
        });
      });
    });
  }



  /* -------------------------------------------------------------------------
     7. أكورديون الأسئلة الشائعة (FAQ Accordion)
     ------------------------------------------------------------------------- */
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const questionBtn = item.querySelector('.faq-question');
      questionBtn?.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // إغلاق باقي العناصر
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('active');
        });

        // التبديل للعنصر الحالي
        item.classList.toggle('active', !isActive);
      });
    });
  }

  /* -------------------------------------------------------------------------
     8. نموذج التواصل والتسجيل السريع (Contact Form Handling)
     ------------------------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('volunteerContactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال الطلب...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم استلام طلبك بنجاح!';
        submitBtn.style.background = '#10B981';

        // إشعار نجاح لطيف
        alert('شكراً لتواصلك! 🌟 تم استلام استفسارك بنجاح وسيتواصل معك فريق منسقية منصة نحن في عمادة شؤون الطلبة بجامعة إربد الأهلية في أقرب وقت.');

        form.reset();

        setTimeout(() => {
          submitBtn.innerHTML = origText;
          submitBtn.style.background = '';
        }, 4000);
      }, 1000);
    });
  }

})();
