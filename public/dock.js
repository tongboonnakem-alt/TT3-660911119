// Enhance regular navigation links with pointer proximity magnification.
// Links and focus styling remain usable when JavaScript is unavailable.
(() => {
  const dock = document.querySelector('.dock');
  if (!dock) return;
  const links = [...dock.querySelectorAll('a')];
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reset = () => links.forEach(link => link.style.removeProperty('--dock-scale'));
  dock.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
    links.forEach(link => {
      const rect = link.getBoundingClientRect();
      const distance = Math.abs(event.clientX - rect.left - rect.width / 2);
      const proximity = Math.max(0, 1 - distance / 130);
      link.style.setProperty('--dock-scale', String(1 + 0.38 * proximity * proximity));
    });
  });
  dock.addEventListener('pointerleave', reset);
  dock.addEventListener('pointercancel', reset);
  finePointer.addEventListener('change', reset);
  reducedMotion.addEventListener('change', reset);
})();
