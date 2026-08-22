import Component from '../utils/Component.js';
import G from '../globals.js';
import gsap from '../utils/gsap.js';
import Split from '../utils/Split.js';

customElements.define(
  'c-cover-home',
  class CoverHome extends Component {
    mount() {
      this.getElems();
      if (this.$video && this.$video.readyState >= 2) this.$video.play();
      this.startStillMotion();
      if (G.isFirstLoaded) {
        gsap.set(this, { paddingTop: 0 });
        this.initAnimations();
      }
    }

    unmount() {
      if (this.$video) this.$video.pause();
      if (this.stillMotion) this.stillMotion.kill();
    }

    getElems() {
      this.$video = this.$('video');
      this.$still = this.$('.cover-home-still');
      this.$titleLight = this.$('.cover-home-title-light');
      this.$content = this.$('.cover-home-content');
    }

    // A still hero keeps the video's sense of motion by drifting very slowly.
    // Scale only, so it composes with the parallax y tween on the same element.
    startStillMotion() {
      if (!this.$still) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.stillMotion = gsap.fromTo(
        this.$still,
        { scale: 1 },
        { scale: 1.14, duration: 18, ease: 'sine.inOut', repeat: -1, yoyo: true }
      );
    }

    initAnimations() {
      this.splittedTitle = new Split({
        target: this.$titleLight,
        by: 'lines',
        plugin: 'wrapLines',
        willChange: true,
      });
      this.splittedContent = new Split({
        target: this.$content,
        by: 'lines',
        plugin: 'wrapLines',
        willChange: true,
      });
      gsap.set(this.splittedTitle.instance.wrapLines, { yPercent: 100 });
      gsap.set(this.splittedContent.instance.wrapLines, { yPercent: 100 });
    }

    appear() {
      if (!G.isFirstLoaded) return;
      const tl = gsap.timeline();
      if (this.splittedTitle) tl.revealTitle(this.splittedTitle.instance.wrapLines);
      if (this.splittedContent) tl.revealContent(this.splittedContent.instance.wrapLines, '<25%');
    }

    resize() {}
  }
);
