import G from './globals.js';
import gsap from './utils/gsap.js';
import Split from './utils/Split.js';
import loadComponents from './loadComponents.js';

class Loader {
  constructor() {
    this.hasScrolled = false;
    this.getElems();
    if (G.smoothScroll) G.smoothScroll.scrollTo(0, { immediate: true, force: true });

    const isHome = Boolean(document.querySelector('.home'));
    if (isHome) this.initAnimations();
    G.smoothScroll.stop();

    loadComponents().then(() => {
      if (isHome) this.loadHome();
      else this.load();
    });
  }

  getElems() {
    this.$el = document.querySelector('.loader');
    this.$panel = document.querySelector('.loader-panel');
    this.$logo = this.$el.querySelector('.loader-logo');
    this.$overlay = this.$el.querySelector('.loader-overlay');
    this.$title = document.querySelector('.loader-title');
    this.$location = document.querySelector('.loader-location');
    this.$loading = document.querySelector('.loader-loading');
    this.$counter = document.querySelector('.loader-counter');
    this.$lettersTop = document.querySelectorAll('.loader-logo-top path');
    this.$lettersBottom = document.querySelectorAll('.loader-logo-bottom path');
    this.$app = document.querySelector('#wrapper');
    this.$image = document.querySelector('.cover-home-image');
    this.$imageInner = document.querySelector('.cover-home-image-inner');
    this.$imageParallax = document.querySelector('.cover-home-image-prlx');
    this.$titleLight = document.querySelector('.cover-home-title-light');
    this.$titleDark = document.querySelector('.cover-home-title-dark');
    this.$contentDark = document.querySelector('.cover-home-content-dark');
    this.$scrollDark = document.querySelector('.cover-home-scroll-dark');
    this.$bottomDark = document.querySelector('.cover-home-bottom-dark');
    this.$content = document.querySelector('.cover-home-content');
    this.$video = document.querySelector('.cover-home-video');
    this.$still = document.querySelector('.cover-home-still');
    this.$bottomBrackets = document.querySelectorAll('.cover-home-scroll-bracket');
    this.$bottomText = document.querySelectorAll('.cover-home-scroll-text');
    this.$bottomLight = document.querySelector('.cover-home-bottom-light');
    this.$header = document.querySelector('.header');
    this.$headerLogo = document.querySelectorAll('.header-logo path');
    this.$headerLogoWrapper = document.querySelector('.header-logo');
    this.$headerLinks = document.querySelector('.header-links');
    this.$headerToggler = document.querySelector('.header-toggler');
    this.$headerItems = document.querySelectorAll('.header-link');
    this.$headerTime = document.querySelector('.header-time');
    this.$headerLocation = document.querySelector('.header-location');
    this.$headerContact = document.querySelector('.header-contact');
  }

  initAnimations() {
    gsap.set(this.$headerLinks, {
      x: -this.$headerLinks.getBoundingClientRect().left + G.remToPixel(2),
    });

    this.splittedContent = new Split({
      target: this.$content,
      by: 'lines',
      plugin: 'wrapLines',
      willChange: true,
    });

    if (G.isMobile) {
      this.splittedTitle = new Split({
        target: this.$titleLight,
        by: 'lines',
        plugin: 'wrapLines',
        willChange: true,
      });
      gsap.set(this.splittedTitle.instance.wrapLines, { yPercent: 100 });
      gsap.set(this.splittedContent.instance.wrapLines, { yPercent: 100 });
      gsap.set(this.$imageParallax, { scale: 1.1 });
      this.$header.classList.add('header-light');
    } else {
      gsap.set(this.$imageInner, { scale: 0.75 });
      gsap.set(this.$image, { clipPath: `inset(${G.w.h}px ${0.5 * G.w.w}px)` });
      gsap.set(this.$bottomLight, { y: -G.remToPixel(16) });

      if (this.$titleDark) {
        this.splittedDarkTitle = new Split({
          target: this.$titleDark,
          by: 'lines',
          plugin: 'wrapLines',
          willChange: true,
        });
        gsap.set(this.splittedDarkTitle.instance.wrapLines, { yPercent: 100 });
      }

      if (this.$contentDark) {
        this.splittedDarkContent = new Split({
          target: this.$contentDark,
          by: 'lines',
          plugin: 'wrapLines',
          willChange: true,
        });
        gsap.set(this.splittedDarkContent.instance.wrapLines, { yPercent: 100 });
      }

      gsap.set(this.$bottomText, { yPercent: 100 });
      gsap.set(this.$bottomBrackets, { opacity: 0 });
      gsap.set(this.$bottomBrackets[0], { x: 20 });
      gsap.set(this.$bottomBrackets[1], { x: -20 });
      gsap.set([this.$headerItems, this.$headerTime, this.$headerLocation, this.$headerContact], {
        yPercent: 100,
      });
    }

    gsap.set(this.$app, {
      scale: 1 - G.remToPixel(4) / G.w.w,
      clipPath: G.isMobile
        ? `inset(${1.1 * G.w.h}px ${0.1 * G.w.w}px 0)`
        : `inset(${G.w.h}px ${0.3 * G.w.w}px 0)`,
    });
    gsap.set(this.$app, {
      y: this.$logo.offsetHeight - this.$app.getBoundingClientRect().top,
    });

    gsap.set(this.$lettersTop, { yPercent: 120 });
    gsap.set(this.$lettersBottom, { yPercent: 240 });

    if (this.$title) {
      this.splittedLoaderTitle = new Split({
        target: this.$title,
        by: 'lines',
        plugin: 'wrapLines',
        willChange: true,
      });
      gsap.set(this.splittedLoaderTitle.instance.wrapLines, { yPercent: 100 });
    }

    if (this.$location) {
      this.splittedLocation = new Split({
        target: this.$location,
        by: 'lines',
        plugin: 'wrapLines',
        willChange: true,
      });
      gsap.set(this.splittedLocation.instance.wrapLines, { yPercent: 100 });
    }

    gsap.set([this.$loading, this.$counter], { yPercent: 100 });
    gsap.set(this.$headerLogo, { yPercent: 120 });
    gsap.set(this.$headerToggler, { yPercent: 100 });
  }

  loadVideo() {
    return new Promise((resolve) => {
      if (!this.$video) return resolve();
      this.$video.onloadeddata = () => resolve();
      this.$video.src = this.$video.dataset.src;
      this.$video.load();
    });
  }

  // Still-image heroes stand in for the video on builds that have no footage.
  // Resolve on error too, so a missing file can never strand the preloader.
  loadStill() {
    return new Promise((resolve) => {
      if (!this.$still) return resolve();
      const done = () => resolve();
      if (this.$still.dataset.src) this.$still.src = this.$still.dataset.src;
      if (this.$still.dataset.srcset) this.$still.srcset = this.$still.dataset.srcset;
      if (this.$still.complete && this.$still.naturalWidth) return done();
      this.$still.addEventListener('load', done, { once: true });
      this.$still.addEventListener('error', done, { once: true });
    });
  }

  loadHome() {
    const videoPromise = this.$video ? this.loadVideo() : this.$still && this.loadStill();

    const intro = gsap.timeline({ delay: 0.25 });
    const reveal = gsap.timeline({
      paused: true,
      onComplete: () => {
        window.addEventListener(
          'touchmove',
          () => {
            if (!this.hasScrolled) this.onHomeScroll();
          },
          { once: true }
        );
        window.addEventListener(
          'wheel',
          () => {
            if (!this.hasScrolled) this.onHomeScroll();
          },
          { once: true }
        );
      },
    });

    intro
      .to(this.$panel, { autoAlpha: 0, ease: 'alpha', duration: 0.35 })
      .to(this.$lettersTop, { yPercent: -120, ease: 'expo.out', duration: 2, stagger: 0.0475 }, '<30%')
      .to(this.$lettersBottom, { yPercent: 0, ease: 'expo.out', duration: 2, stagger: 0.0475 }, '<');

    if (this.splittedLoaderTitle) {
      intro.to(
        this.splittedLoaderTitle.instance.wrapLines,
        { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.075 },
        '<'
      );
    }

    if (this.splittedLocation) {
      intro.to(
        this.splittedLocation.instance.wrapLines,
        { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.075 },
        '<=+0.1'
      );
    }

    intro
      .to([this.$loading, this.$counter], { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.075 }, '<=+0.1')
      .to(
        this.$counter,
        { textContent: '100%', snap: { textContent: 1 }, ease: 'gl.fastInOut', duration: 3 },
        '<'
      )
      .call(
        () => {
          if (videoPromise) Promise.all([videoPromise]).then(() => reveal.play());
          else reveal.play();
        },
        [],
        G.isMobile ? '<20%' : '<70%'
      );

    intro.call(
      () => {
        G.emitter.emit('appear-loader');
      },
      [],
      0.2
    );

    if (this.splittedLoaderTitle) {
      reveal.to(
        this.splittedLoaderTitle.instance.wrapLines,
        { yPercent: -100, ease: 'gl.fastInOut', duration: 1.2, stagger: 0.05 },
        0
      );
    }

    if (this.splittedLocation) {
      reveal.to(
        this.splittedLocation.instance.wrapLines,
        { yPercent: -100, ease: 'gl.fastInOut', duration: 1.2, stagger: 0.05 },
        '<=+0.1'
      );
    }

    reveal
      .to(
        [this.$loading, this.$counter],
        { yPercent: -100, ease: 'gl.fastInOut', duration: 1.2, stagger: 0.05 },
        '<=+0.1'
      )
      .to(
        this.$logo,
        { y: -this.$logo.getBoundingClientRect().top, ease: 'gl.fastInOut', duration: 1.7 },
        G.isMobile ? '<25%' : 0.1
      )
      .to(this.$app, { clipPath: 'inset(0px 0px 0px)', ease: 'gl.fastInOut', duration: 1.7 }, '<');

    if (G.isMobile) {
      if (this.splittedTitle) {
        reveal.call(
          () => {
            gsap.to(this.splittedTitle.instance.wrapLines, {
              yPercent: 0,
              ease: 'expo.out',
              duration: 1.2,
              stagger: 0.08,
            });
          },
          [],
          '<30%'
        );
      }
    } else {
      reveal
        .to(
          this.$image,
          { clipPath: `inset(${0.25 * G.w.h}px ${0.3 * G.w.w}px 0px)`, ease: 'gl.fastInOut', duration: 1.2 },
          '<0.1'
        )
        .to(this.$imageInner, { scale: 0.8, ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .addLabel('reveal-content', this.splittedDarkTitle ? '<45%' : '<60%');

      if (this.splittedDarkTitle) {
        reveal.revealTitle(this.splittedDarkTitle.instance.wrapLines, {}, 'reveal-content');
      }
      if (this.splittedDarkContent) {
        reveal.revealContent(this.splittedDarkContent.instance.wrapLines, {}, '<5%');
      }

      reveal
        .to(
          [this.$headerItems, this.$headerTime, this.$headerLocation, this.$headerContact],
          { yPercent: 0, ease: 'expo.out', duration: 1.2, stagger: 0.05 },
          this.splittedDarkTitle ? '<10%' : 'reveal-content'
        )
        .to(this.$bottomBrackets, { x: 0, ease: 'expo.out', duration: 1.2 }, '<')
        .set(this.$bottomBrackets, { opacity: 1 }, '<10%')
        .to(this.$bottomText, { yPercent: 0, ease: 'expo.out', duration: 1, stagger: 0.06 }, '<0.14');
    }
  }

  // Fired by the first wheel/touch gesture: pushes the intro logo off screen and
  // expands the hero video to fullscreen, handing control back to Lenis.
  onHomeScroll() {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(this.$app, { clearProps: 'all' });
        gsap.set(this.$image, { clearProps: 'all' });
        G.isFirstLoaded = true;
        G.emitter.emit('end-loader');
        G.smoothScroll.start();
        gsap.set(this.$el, { autoAlpha: 0 });
      },
    });

    tl.to(this.$headerToggler, { yPercent: 0, ease: 'gl.fastInOut', duration: 1.2 }, 0.25)
      .to(
        this.$logo,
        { y: '-=' + (G.isMobile ? 0.06 * G.w.h : 0.12 * G.w.h), ease: 'gl.fastInOut', duration: 1.2 },
        0
      )
      .to(this.$overlay, { opacity: 0.9, ease: 'alpha', duration: 0.6 }, '<')
      .to(this.$app, { scale: 1, y: 0, ease: 'gl.fastInOut', duration: 1.2 }, '<')
      .to(this.$headerLogo, { yPercent: 0, ease: 'gl.fastInOut', duration: 1, stagger: 0.02 }, '<')
      .to(this.$headerLinks, { x: 0, ease: 'gl.fastInOut', duration: 1.2 }, '<');

    if (G.isMobile) {
      tl.to(this.$imageParallax, { scale: 1, ease: 'gl.fastInOut', duration: 1.2 }, '<').call(
        () => {
          gsap.to(this.splittedContent.instance.wrapLines, {
            yPercent: 0,
            ease: 'expo.out',
            duration: 1.2,
            stagger: 0.08,
          });
        },
        [],
        '<30%'
      );
    } else {
      tl.to(this.$imageInner, { scale: 1, ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .to(this.$image, { clipPath: 'inset(0px 0px 0px)', y: 0, ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .to(this.$titleDark, { y: G.remToPixel(15), ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .to(this.$titleLight, { y: G.remToPixel(15), ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .to(this.$bottomDark, { y: G.remToPixel(16), ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .to(this.$bottomLight, { y: 0, ease: 'gl.fastInOut', duration: 1.2 }, '<')
        .call(
          () => {
            this.$header.classList.add('header-light');
          },
          [],
          '<28%'
        );
    }

    return tl;
  }

  load() {
    gsap
      .timeline({
        delay: 0.1,
        onComplete: () => {
          G.isFirstLoaded = true;
          G.emitter.emit('end-loader');
          gsap.set(this.$el, { autoAlpha: 0 });
          setTimeout(() => {
            G.smoothScroll.start();
          }, 300);
        },
      })
      .to(this.$panel, { autoAlpha: 0, ease: 'alpha', duration: 0.42 })
      .call(
        () => {
          G.emitter.emit('start-transition');
        },
        [],
        0
      )
      .call(
        () => {
          G.emitter.emit('appear-loader');
        },
        [],
        0.2
      );
  }

  resizeX() {
    if (this.splittedContent) this.splittedContent.update();
    if (this.splittedTitle) this.splittedTitle.update();
  }

  screenChange() {
    if (!G.isFirstLoaded) {
      this.onHomeScroll();
      gsap.set(this.$imageInner, { clearProps: 'all' });
      if (!G.isMobile) this.$header.classList.remove('header-light');
    }

    if (G.isMobile) {
      if (this.$titleLight) gsap.set(this.$titleLight, { clearProps: 'all' });
    } else {
      if (this.splittedContent) {
        this.splittedContent.reset();
        this.splittedContent = null;
      }
      if (this.splittedTitle) {
        this.splittedTitle.reset();
        this.splittedTitle = null;
      }
    }
  }
}

export default Loader;
