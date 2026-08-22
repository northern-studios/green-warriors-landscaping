import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';

customElements.define(
  'c-parallax-image',
  class ParallaxImage extends Component {
    mount() {
      this.$el = this;
      this.force = this.$el.dataset.parallaxForce || 5;
      this.getElems();
      this.init();
    }

    unmount() {
      if (this.sT) this.sT.kill();
    }

    getElems() {
      this.$image = this.$el.querySelector('img, .parallax-el');
    }

    init() {
      if (G.w.w < 1200 || G.detect.isMobile) return;
      this.$el.style.overflow = 'hidden';
      this.updateTransformValue();
      this.animation = gsap.fromTo(
        this.$image,
        { y: () => -this.transformValue / 2 },
        { paused: true, y: () => this.transformValue / 2, ease: 'none' }
      );
    }

    initTrigger() {
      const top = this.getBoundingClientRect().top;
      this.sT = G.scrollTrigger.create({
        start: () => (top < G.w.h ? `clamp(top-=${top}px top)` : 'top bottom'),
        trigger: this.$el,
        animation: this.animation,
        invalidateOnRefresh: true,
        scrub: true,
      });
    }

    ready() {
      this.initTrigger();
    }

    updateTransformValue() {
      this.rect = this.$el.getBoundingClientRect();
      this.transformValue = (this.rect.height / this.force) * (Math.min(G.w.w, 1440) / 1440);
      this.$image.style.height = `calc(100% + ${this.transformValue}px)`;
      this.$image.style.marginTop = `-${this.transformValue / 2}px`;
    }

    resizeX() {
      if (!G.isMobile) this.updateTransformValue();
    }

    screenChange() {
      this.updateTransformValue();
      if (G.isMobile) {
        if (this.sT) this.sT.kill();
        gsap.set(this.$image, { clearProps: 'all' });
      } else {
        this.init();
      }
    }
  }
);
