import G from './globals.js';
import gsap from './utils/gsap.js';

class Header {
  constructor() {
    this.isOpen = false;
    this.getElems();
    this.events();
    this.initAnimations();
    this.onPageChange({ location: window.location });
    this.startClock();
  }

  getElems() {
    this.$el = document.body.querySelector('header');
    this.$items = this.$el.querySelectorAll('.header-link');
    this.$logo = this.$el.querySelector('.header-logo');
    this.$toggler = this.$el.querySelector('.header-toggler');
    this.$togglerClose = this.$el.querySelector('.header-toggler-close');
    this.$itemsWrapper = this.$el.querySelector('.header-links');
    this.$links = this.$el.querySelectorAll('a');
    this.$menu = this.$el.querySelector('.header-menu');
    this.$menuInner = this.$el.querySelector('.header-menu-inner');
    this.$menuClose = this.$el.querySelector('.header-toggler-close');
    this.$menuItems = this.$el.querySelectorAll('.header-link-mobile');
    this.$menuSocials = this.$el.querySelectorAll('.header-social-link');
    this.$overlay = this.$el.querySelector('.header-overlay');
    this.$hour = this.$el.querySelector('#hour');
    this.$minute = this.$el.querySelector('#minute');
    this.$ampm = this.$el.querySelector('#ampm');
  }

  events() {
    if (this.$toggler) this.$toggler.addEventListener('click', this.toggle.bind(this));
    if (this.$togglerClose) this.$togglerClose.addEventListener('click', this.toggle.bind(this));
    this.$links.forEach((link, index) => {
      link.addEventListener('click', this.onLinkClick.bind(this, index));
    });
  }

  initAnimations() {
    gsap.set(this.$menu, { yPercent: -100 });
    gsap.set(this.$menuInner, { yPercent: 100 });
    gsap.set([this.$menuItems, this.$menuSocials], { yPercent: 100 });
    gsap.set(this.$menuClose, { yPercent: 100 });
  }

  onLinkClick(index, event) {
    // Before the intro has been dismissed, a click first plays the loader's
    // scroll-out timeline, then navigates.
    if (G.isFirstLoaded) return;
    event.preventDefault();
    event.stopPropagation();
    G.loader.onHomeScroll().then(() => {
      G.router.navigateTo(this.$links[index].href);
    });
  }

  onPageChange({ location }) {
    if (this.activeIndex > -1) this.$items[this.activeIndex].classList.remove('a');
    this.activeIndex = -1;
    for (let i = 0; i < this.$items.length; i++) {
      if (this.$items[i].href === location.href) this.activeIndex = i;
    }
    if (this.activeIndex > -1) {
      this.$itemsWrapper.classList.add('a');
      this.$items[this.activeIndex].classList.add('a');
    } else {
      this.$itemsWrapper.classList.remove('a');
    }
    if (this.isOpen) this.close();
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    return new Promise((resolve) => {
      this.isOpen = true;
      G.smoothScroll.stop();
      gsap.killTweensOf([this.$menuItems, this.$menuSocials, this.$overlay, this.$menu, this.$menuInner]);

      gsap
        .timeline({ defaults: { ease: 'gl.fastInOut', duration: 1.1 } })
        .to(this.$overlay, { opacity: 0.8, ease: 'alpha', duration: 0.6 }, 0)
        .fromTo(this.$menuClose, { yPercent: 100 }, { yPercent: 0, ease: 'expo.out' }, 0.2)
        .to([this.$menu, this.$menuInner], { yPercent: 0 }, 0)
        .to(this.$menuItems, { yPercent: 0, stagger: 0.1, ease: 'expo.out' }, '<10%')
        .to(this.$menuSocials, { yPercent: 0, stagger: 0.1, ease: 'expo.out' }, '<30%');

      resolve();
    });
  }

  close() {
    return new Promise((resolve) => {
      this.isOpen = false;
      G.smoothScroll.start();
      gsap.killTweensOf([this.$menuItems, this.$menuSocials, this.$overlay, this.$menu, this.$menuInner]);

      gsap
        .timeline({ defaults: { ease: 'gl.fastInOut', duration: 0.7 } })
        .to(this.$overlay, { opacity: 0, ease: 'alpha', duration: 0.35 }, 0)
        .to(this.$menu, { yPercent: -100 }, 0)
        .to(this.$menuInner, { yPercent: 100 }, '<')
        .to(this.$menuItems, { yPercent: 100, stagger: -0.02, ease: 'expo.out' }, '<')
        .to(this.$menuSocials, { yPercent: 100, stagger: -0.02, ease: 'expo.out' }, '<');

      resolve();
    });
  }

  startClock() {
    this.updateTime();
    const now = new Date();
    const untilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
      this.updateTime();
      setInterval(() => this.updateTime(), 60000);
    }, untilNextMinute);
  }

  updateTime() {
    const parts = new Intl.DateTimeFormat('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Australia/Sydney',
    }).formatToParts(new Date());

    let hour = parts.find((p) => p.type === 'hour').value;
    let minute = parts.find((p) => p.type === 'minute').value;
    const dayPeriod = parts.find((p) => p.type === 'dayPeriod').value;

    hour = hour.toString().padStart(2, '0');
    minute = minute.toString().padStart(2, '0');

    this.$hour.textContent = hour;
    this.$minute.textContent = minute;
    this.$ampm.textContent = dayPeriod;
  }
}

export default Header;
