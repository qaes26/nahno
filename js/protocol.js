/* ==========================================================================
   منصة نَحْنُ (Nahno) للتطوع × جامعة إربد الأهلية
   إدارة وثيقة البروتوكول الرسمي والطباعة والتصدير
   إعداد: قيس الجازي
   ========================================================================== */

(function () {
  'use strict';

  function initProtocolModal() {
    const openBtns = document.querySelectorAll('[data-open-protocol]');
    const modalOverlay = document.getElementById('protocolModalOverlay');
    const closeBtn = document.getElementById('protocolCloseBtn');
    const printBtn = document.getElementById('protocolPrintBtn');

    if (!modalOverlay) return;

    openBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
      }
    });

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProtocolModal);
  } else {
    initProtocolModal();
  }
})();
