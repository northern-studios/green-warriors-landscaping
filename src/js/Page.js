import { Renderer } from '@unseenco/taxi';
import G from './globals.js';
import Widget from './Widget.js';
import piecesManager from './utils/PiecesManager.js';

// Taxi renderer for every page. Acts as the broadcast hub: it forwards lifecycle
// and rAF/scroll/resize events to every mounted `c-*` component.
class Page extends Renderer {
  onEnter() {
    this.scrollTriggers = [];
    G.isMobile = G.w.w < 1200;
    this.bind();
    this.events();
    this.$widget = this.content.querySelector('.widget');
    G.widget = this.$widget ? new Widget() : null;
  }

  bind() {
    this.onLoaderComplete = this.onLoaderComplete.bind(this);
    this.onTransitionComplete = this.onTransitionComplete.bind(this);
    this.onTransitionStart = this.onTransitionStart.bind(this);
  }

  events() {
    if (!G.isFirstLoaded) G.emitter.on('end-loader', this.onLoaderComplete);
    G.emitter.on('start-transition', this.onTransitionStart);
    G.emitter.on('end-transition', this.onTransitionComplete);
  }

  onLeave() {
    G.emitter.off('start-transition', this.onTransitionStart);
    G.emitter.off('end-transition', this.onTransitionComplete);
    G.emitter.off('end-loader', this.onLoaderComplete);
  }

  onLeaveCompleted() {
    if (G.widget) G.widget.destroy();
    this.scrollTriggers.forEach((st) => st.kill());
  }

  onEnterCompleted() {
    if (G.isFirstLoaded) this.appear();
    else G.emitter.on('appear-loader', () => this.appear());
  }

  // Any `[data-dark]` section flips the header to its light (white) variant
  // while it occupies the top of the viewport.
  detectDarkSections() {
    const header = document.querySelector('.header');
    this.content.querySelectorAll('[data-dark]').forEach((section) => {
      const st = G.scrollTrigger.create({
        trigger: section,
        start: () => `top-=${G.remToPixel(3)} top`,
        end: () => `bottom-=${G.remToPixel(3)}px top`,
        onEnter: () => header.classList.add('header-light'),
        onEnterBack: () => header.classList.add('header-light'),
        onLeave: () => header.classList.remove('header-light'),
        onLeaveBack: () => header.classList.remove('header-light'),
      });
      this.scrollTriggers.push(st);
    });
  }

  appear() {
    const isHome = Boolean(this.content.querySelector('.home'));
    const header = document.querySelector('.header');
    if (G.isFirstLoaded) {
      if (isHome) header.classList.add('header-light');
      else header.classList.remove('header-light');
    }
    this.emit('appear');
  }

  onTransitionComplete() {
    G.pageHeight = G.smoothScroll.dimensions.scrollHeight;
    if (G.widget) G.widget.init();
    this.detectDarkSections();
    this.emit('ready');
  }

  onTransitionStart() {
    this.emit('onTransitionStart');
  }

  onLoaderComplete() {
    this.detectDarkSections();
    if (G.widget) G.widget.init();
    G.pageHeight = G.smoothScroll.dimensions.scrollHeight;
    this.emit('ready');
  }

  resize() {
    if (G.widget) G.widget.resize();
    this.emit('resize');
  }

  resizeX() {
    this.screenChange();
    this.emit('resizeX');
  }

  screenChange() {
    const isMobile = G.w.w < 1200;
    if (isMobile !== G.isMobile) {
      G.isMobile = isMobile;
      if (G.loader) G.loader.screenChange();
      this.emit('screenChange');
    }
    if (!G.isMobile && G.header.isOpen) G.header.close();
  }

  scroll() {
    this.emit('scroll');
  }

  loop(time) {
    this.emit('update', time);
  }

  emit(method, arg) {
    Object.values(piecesManager.currentPieces).forEach((byId) => {
      Object.values(byId).forEach((entry) => {
        if (typeof entry.piece[method] === 'function') entry.piece[method](arg);
      });
    });
  }
}

export default Page;
