import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';
import Split from '../utils/Split.js';

customElements.define(
  'c-subtitle',
  class Subtitle extends Component {
    mount() {
      this.getElems();
      this.initAnimations();
    }

    unmount() {
      if (this.trigger) this.trigger.kill();
    }

    getElems() {
      this.$number = this.$('.subtitle-number');
      this.$text = this.$('.subtitle-text');
    }

    initAnimations() {
      this.splittedNumber = new Split({
        target: this.$number,
        by: 'chars',
        plugin: 'wrapChars',
        willChange: true,
      });
      this.splittedText = new Split({
        target: this.$text,
        by: 'chars',
        plugin: 'wrapChars',
        willChange: true,
      });
      gsap.set(this.splittedText.instance.wrapChars, { yPercent: 200 });
      gsap.set(this.splittedNumber.instance.wrapChars, { xPercent: -100 });
      gsap.set(this.$text, {
        x: -(this.$text.getBoundingClientRect().left - this.getBoundingClientRect().left),
      });
    }

    initTrigger() {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });
      tl.to(this.splittedText.instance.wrapChars, { yPercent: 0, stagger: 0.02 })
        .to(this.$text, { x: 0, ease: 'gl.fastInOut', duration: 1.3 }, '<40%')
        .to(this.splittedNumber.instance.wrapChars, { xPercent: 0, stagger: 0.1 }, '<10%');

      this.trigger = G.scrollTrigger.create({
        trigger: this,
        start: 'top 90%',
        once: true,
        animation: tl,
      });
    }

    ready() {
      this.initTrigger();
    }

    resize() {}
  }
);
