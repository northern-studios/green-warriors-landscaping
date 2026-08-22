import '../css/app.css';
import Site from './Site.js';

// `g` toggles the debug grid overlay when one is present.
class Grid {
  constructor() {
    this.grid = document.querySelector('.debug-grid');
    if (this.grid) this.addEvents();
  }

  addEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'g' || e.key === 'G') this.grid.classList.toggle('opacity-0');
    });
    document.addEventListener('dblclick', () => {
      if (window.innerWidth < 1024) this.grid.classList.toggle('opacity-0');
    });
  }
}

// Waiting on `document.fonts.ready` matters: the loader measures the wordmark and
// splits every line before the first frame, and web-font metrics change both.
window.addEventListener('load', () => {
  document.fonts.ready.then(() => {
    new Site();
    new Grid();
  });
});
