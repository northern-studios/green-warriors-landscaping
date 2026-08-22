import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';
import Split from '../utils/Split.js';

customElements.define(
  'c-content',
  class Content extends Component {
    mount() {
      this.isEntered = false;
      this.split();
    }

    split() {
      if (this.splittedContent) {
        if (this.isEntered) this.splittedContent.reset();
        else this.splittedContent.update();
      } else {
        this.splittedContent = new Split({ target: this, by: 'lines', plugin: 'wrapLines', willChange: true });
      }
      if (!this.isEntered) gsap.set(this.splittedContent.instance.wrapLines, { yPercent: 100 });
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
        animation: gsap.effects.revealContent(this.splittedContent.instance.wrapLines),
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
