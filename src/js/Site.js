import { Core as Taxi } from '@unseenco/taxi';
import Lenis from 'lenis';
import LazyLoad from 'vanilla-lazyload';
import mitt from 'mitt';
import { debounce, throttle } from 'throttle-debounce';

import G from './globals.js';
import gsap, { ScrollTrigger } from './utils/gsap.js';
import Loader from './Loader.js';
import Header from './Header.js';
import Page from './Page.js';
import GlobalTransition from './GlobalTransition.js';

class Site {
  constructor() {
    this.resize = this.resize.bind(this);
    this.scroll = this.scroll.bind(this);
    this.update = this.update.bind(this);
    this.resizeDebounced = debounce(100, this.resize);
    this.resizeThrottled = throttle(100, this.resize);
    this.scrollDebounced = debounce(100, this.scroll);
    this.scrollThrottled = throttle(30, this.scroll);

    G.w = {
      w: document.body.offsetWidth,
      h: window.innerHeight,
      pR: window.devicePixelRatio,
    };

    this.start();
  }

  start() {
    G.fade = document.querySelector('.fade');
    history.scrollRestoration = 'manual';
    document.body.scrollTop = 0;

    document.documentElement.style.setProperty('--vw', `${document.body.offsetWidth}px`);
    document.documentElement.style.setProperty('--vh-initial', G.w.h / 100 + 'px');
    document.documentElement.style.setProperty('--vh-initial-dynamic', G.w.h / 100 + 'px');
    document.documentElement.style.setProperty('--v-ratio', '' + G.w.h / G.w.w);

    this.initEmitter();
    this.initSmoothScroll();
    this.initScrollTrigger();
    this.initTaxi();

    G.loader = new Loader();
    G.lazyLoad = new LazyLoad({
      container: document.querySelector('#app'),
      threshold: G.w.h / 2,
    });

    this.header = new Header();
    G.header = this.header;

    this.events();
    this.updateLinks();
    this.addConsole();
    this.initGSAP();
  }

  initEmitter() {
    G.emitter = mitt();
  }

  initGSAP() {
    gsap.defaults({ ease: 'none' });
    requestAnimationFrame(this.update);
  }

  // ScrollTrigger reads its scroll position from Lenis rather than the native
  // scroller, since #app is the scroll container.
  initScrollTrigger() {
    G.scrollTrigger = ScrollTrigger;
    G.scrollTrigger.scrollerProxy(document.body, {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }),
      scrollTop: () => G.smoothScroll.scroll,
    });
    G.scrollTrigger.defaults({ scroller: '#app' });
  }

  initSmoothScroll() {
    if (G.smoothScroll) G.smoothScroll.destroy();
    G.smoothScroll = new Lenis({
      wrapper: document.querySelector('#app'),
      easing: (t) => 1 - Math.pow(1 - t, 5),
      wheelEventsTarget: document.body,
    });
    window.lenis = G.smoothScroll;
    G.smoothScroll.on('scroll', (e) => {
      this.scroll(e);
    });
  }

  initTaxi() {
    this.taxi = new Taxi({
      links: 'a:not([target]):not([href^=\\#]):not([data-taxi-ignore]):not(.ab-item)',
      reloadJsFilter: (el) => el.dataset.taxiReload !== undefined,
      removeOldContent: false,
      transitions: { default: GlobalTransition },
      renderers: { default: Page },
    });
    G.router = this.taxi;
    this.currentRenderer = this.taxi.currentCacheEntry.renderer;
  }

  resize() {
    const widthChanged = window.innerWidth !== G.w.w;
    G.w = {
      w: document.body.offsetWidth,
      h: window.innerHeight,
      pR: window.devicePixelRatio,
    };
    document.documentElement.style.setProperty('--vh-initial-dynamic', G.w.h / 100 + 'px');
    document.documentElement.style.setProperty('--v-ratio', '' + G.w.h / G.w.w);
    if (widthChanged) this.resizeX();
    this.currentRenderer.resize();
  }

  resizeX() {
    document.documentElement.style.setProperty('--vw', `${document.body.offsetWidth}px`);
    document.documentElement.style.setProperty('--vh-initial', G.w.h / 100 + 'px');
    G.loader.resizeX();
    this.currentRenderer.resizeX();
  }

  scroll(e) {
    if (this.currentRenderer) this.currentRenderer.scroll(e);
  }

  update(time) {
    if (G.smoothScroll) G.smoothScroll.raf(time);
    if (G.scrollTrigger) G.scrollTrigger.update();
    this.currentRenderer.loop(time);
    requestAnimationFrame(this.update);
  }

  events() {
    window.addEventListener('resize', this.resizeDebounced);
    window.addEventListener('orientationchange', this.resize);
    window.addEventListener('wheel', this.scrollThrottled);
    window.addEventListener('wheel', this.scrollDebounced);

    this.taxi.on('NAVIGATE_IN', ({ to }) => {
      this.currentRenderer = to.renderer;
      this.header.onPageChange({ location });
    });
    this.taxi.on('NAVIGATE_OUT', () => {});
    this.taxi.on('NAVIGATE_END', () => {
      G.smoothScroll.resize();
      G.lazyLoad.update();
      this.updateLinks();
    });
  }

  updateLinks() {
    this.links = document.body.querySelectorAll('a');
    if (!this.siteUrl) this.siteUrl = 'https://telhaclarke.com.au/';
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];
      if (link.href.indexOf(this.siteUrl) > -1) {
        link.href = `${window.location.origin}/${link.href.split(this.siteUrl)[1]}`;
      }
    }
  }

  addConsole() {
    console.log(
      '%c Development by Grégory Lallé ',
      'background: #141414; color: #fff;  border-radius: 5px; padding: 10px 0; margin-right: 5px;',
      'https://gregorylalle.com/'
    );
    console.log(
      '%c Design by Thomas Monavon ',
      'background: #141414; color: #fff;  border-radius: 5px; padding: 10px 0; margin-right: 5px;',
      'https://thomasmonavon.com/'
    );
  }
}

export default Site;
