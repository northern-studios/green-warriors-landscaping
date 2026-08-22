import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';
import Split from '../utils/Split.js';

customElements.define(
  'c-title',
  class Title extends Component {
    mount() {
      this.isEntered = false;
      this.split();
    }

    split() {
      if (this.splittedTitle) {
        if (this.isEntered) this.splittedTitle.reset();
        else this.splittedTitle.update();
      } else {
        this.splittedTitle = new Split({ target: this, by: 'lines', plugin: 'wrapLines', willChange: true });
      }
      if (!this.isEntered) gsap.set(this.splittedTitle.instance.wrapLines, { yPercent: 100 });
    }

    unmount() {
      if (this.trigger) this.trigger.kill();
    }

    ready() {
      this.initTrigger();
    }

    initTrigger() {
      if (this.trigger) this.trigger.kill();
      this.trigger = G.scrollTrigger.create({
        trigger: this,
        start: 'top 90%',
        once: true,
        animation: gsap.effects.revealTitle(this.splittedTitle.instance.wrapLines),
        onEnter: () => {
          this.isEntered = true;
        },
      });
    }

    resize() {
      this.split();
      if (!this.isEntered) this.initTrigger();
    }
  }
);
