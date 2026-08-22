import G from './globals.js';
import gsap from './utils/gsap.js';

// The floating pill at the bottom of the viewport. Each `[data-widget]` section
// owns a scroll trigger that swaps the pill's label and destination link.
class Widget {
  constructor() {
    this.currentIndex = 0;
    this.getElems();
    this.events();
    if (this.blocks[0].url) this.$el.href = this.blocks[0].url;
  }

  getElems() {
    this.blocks = [];
    this.$blocks = document.querySelectorAll('[data-widget]');
    this.$el = document.querySelector('.widget');
    this.$titleWrapper = this.$el.querySelector('.widget-title-wrapper');
    this.$title = this.$el.querySelector('.widget-title');
    this.$cta = this.$el.querySelector('.widget-cta');
    this.$ctaLabel = this.$el.querySelector('.widget-cta-label');
    this.$plus = this.$el.querySelector('.widget-icon');

    this.$blocks.forEach((dom) => {
      this.blocks.push({
        dom,
        title: dom.dataset.widgetTitle,
        url: dom.dataset.widgetUrl,
        offset: Number(dom.dataset.widgetOffset),
        sT: null,
      });
    });
  }

  events() {}

  init() {
    if (this.$blocks.length) this.initWidget();
    this.initAnimations();
  }

  destroy() {
    this.blocks.forEach((block) => block.sT && block.sT.kill());
  }

  initAnimations() {
    gsap.set(this.$el, { width: this.blocks[0].width });
    gsap.set(this.$el, { yPercent: 200, autoAlpha: 1 });
  }

  initWidget() {
    this.blocks.forEach((block, index) => {
      const title = document.createElement('div');
      title.innerHTML = block.title;
      title.classList.add('widget-block-title');
      this.$title.appendChild(title);

      if (index !== 0) gsap.set(title, { yPercent: 100 });

      block.html = { title };
      block.width = title.getBoundingClientRect().width;

      block.sT = G.scrollTrigger.create({
        trigger: block.dom,
        start: block.offset ? `top+=${G.w.h * block.offset}px 70%` : 'top 70%',
        end: 'bottom 70%',
        markers: false,
        onEnter: () => {
          if (index === 0) this.show();
          this.updateWidget(index);
        },
        onLeaveBack: () => {
          if (index === 0) this.hide();
        },
        onEnterBack: () => {
          this.updateWidget(index);
        },
      });
    });
  }

  updateWidget(index) {
    if (index === this.currentIndex) return;
    gsap.killTweensOf(this.$title, 'width');

    const previous = this.blocks[this.currentIndex];
    const next = this.blocks[index];

    this.$el.href = next.url;
    this.currentIndex = index;

    gsap
      .timeline({ defaults: { ease: 'gl.fastInOut', duration: 0.9 } })
      .to(previous.html.title, { yPercent: -100 })
      .fromTo(next.html.title, { yPercent: 100 }, { yPercent: 0 }, '<')
      .to(this.$el, { scale: 0.95, duration: 0.6, ease: 'expo.out' }, '<10%')
      .to(this.$title, { width: next.width }, 0);
  }

  show() {
    gsap
      .timeline({ defaults: { ease: 'gl.fastInOut', duration: 1 } })
      .fromTo(this.$el, { scale: 0.8 }, { yPercent: 0, scale: 1 })
      .addLabel('expand', '<40%')
      .to(this.$el, { width: 'auto' }, 'expand')
      .fromTo(this.$plus, { rotate: -90 }, { rotate: 0 }, 'expand+=15%');
  }

  hide() {
    gsap
      .timeline({ defaults: { ease: 'gl.fastInOut', duration: 1 } })
      .to(this.$el, { width: this.blocks[0].width })
      .to(this.$el, { yPercent: 200, scale: 0.8 }, '<20%');
  }

  resize() {
    this.blocks.forEach((block, index) => {
      if (!block.html || !block.html.title) return;
      block.width = block.html.title.getBoundingClientRect().width;
      if (index === this.currentIndex) gsap.set(this.$title, { width: block.width });
    });
  }
}

export default Widget;
