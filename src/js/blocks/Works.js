import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';

customElements.define(
  'c-works',
  class Works extends Component {
    mount() {
      this.getElems();
    }

    unmount() {}

    getElems() {
      this.items = [];
      this.$items = this.$All('.works-item');
      this.$items.forEach((el) => {
        this.items.push({
          el,
          wrapper: this.$('.works-item-wrapper', el),
          title: this.$('.works-item-title', el),
          bracketLeft: this.$('.works-item-bracket-left', el),
          bracketRight: this.$('.works-item-bracket-right', el),
          image: this.$('.works-item-image', el),
          imageWrapper: this.$('.works-item-image-wrapper', el),
          img: this.$('.image', el),
          category: this.$('.works-item-category', el),
          date: this.$('.works-item-date', el),
        });
      });
    }

    ready() {
      if (!G.isMobile) this.initTriggers();
    }

    initTriggers() {
      this.items.forEach((item) => {
        if (item.enterST) item.enterST.kill();
        if (item.leaveST) item.leaveST.kill();
        gsap.set(
          [item.bracketLeft, item.bracketRight, item.title, item.img, item.wrapper, item.image, item.imageWrapper],
          { clearProps: 'all' }
        );
      });

      if (G.isMobile) return;

      this.items.forEach((item) => {
        const enter = gsap.timeline({ defaults: { ease: 'none' } });
        const leave = gsap.timeline({ defaults: { ease: 'none' } });

        enter
          .fromTo(item.bracketLeft, { xPercent: 0 }, { xPercent: -90 }, 0)
          .fromTo(item.bracketRight, { xPercent: 0 }, { xPercent: 90 }, 0)
          .fromTo(item.title, { letterSpacing: 0 }, { letterSpacing: '0.04em' }, 0)
          .fromTo(item.img, { scale: 1.75 }, { scale: 1 }, 0);

        leave
          .fromTo(item.bracketLeft, { xPercent: -90 }, { xPercent: 0 }, 0)
          .fromTo(item.bracketRight, { xPercent: 90 }, { xPercent: 0 }, 0)
          .fromTo(item.title, { letterSpacing: '0.04em' }, { letterSpacing: 0 }, 0)
          .fromTo(item.img, { scale: 1 }, { scale: 1.75 }, 0)
          .fromTo(item.wrapper, { y: 0 }, { y: G.remToPixel(35) }, 0);

        enter.fromTo(item.image, { scale: 0.4 }, { scale: 1 }, 0);

        item.enterST = G.scrollTrigger.create({
          trigger: item.el,
          start: 'top bottom',
          end: 'top 10%',
          scrub: 0.1,
          animation: enter,
        });

        leave.fromTo(item.image, { scale: 1 }, { scale: 0.2 }, 0);
        leave.fromTo(item.imageWrapper, { yPercent: 0 }, { yPercent: -40 }, 0);

        item.leaveST = G.scrollTrigger.create({
          trigger: item.el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.1,
          animation: leave,
          onEnter: () => {
            gsap.killTweensOf([item.category, item.date]);
            gsap.to([item.category, item.date], { yPercent: -100, duration: 0.8, ease: 'expo.out' });
          },
          onLeaveBack: () => {
            gsap.killTweensOf([item.category, item.date]);
            gsap.fromTo(
              [item.category, item.date],
              { yPercent: 100 },
              { yPercent: 0, duration: 1.1, ease: 'expo.out' }
            );
          },
        });
      });
    }

    screenChange() {
      this.initTriggers();
    }
  }
);
