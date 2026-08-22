import { Transition } from '@unseenco/taxi';
import G from './globals.js';
import gsap from './utils/gsap.js';
import loadComponents from './loadComponents.js';

// Desktop pushes the outgoing page back and slides the incoming one up from
// below through an expanding clip-path; mobile just cross-fades.
class GlobalTransition extends Transition {
  onLeave({ from, done }) {
    this.from = from;
    G.isFirstLoaded = true;
    if (G.smoothScroll) G.smoothScroll.stop();

    if (!G.isMobile) return done();

    gsap.fromTo(
      G.fade,
      { autoAlpha: 0 },
      {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          if (G.smoothScroll) G.smoothScroll.scrollTo(0, { immediate: true, force: true });
          done();
        },
      }
    );
  }

  onEnter({ to, done }) {
    const pending = [];
    const video = to.querySelector('.cover-home-video');
    if (video) pending.push(this.loadVideo(video));

    Promise.all(pending).then(() => {
      if (G.isMobile) this.fade({ to, done });
      else this.translate({ to, done });
    });
  }

  loadVideo(video) {
    return new Promise((resolve) => {
      video.onloadeddata = () => resolve();
      video.src = video.dataset.src;
      video.load();
    });
  }

  fade({ to, done }) {
    this.from.remove();
    if (G.smoothScroll) G.smoothScroll.start();

    const tl = gsap.timeline({
      delay: 0.05,
      paused: true,
      onStart: () => G.emitter.emit('start-transition'),
      onComplete: () => G.emitter.emit('end-transition'),
    });

    tl.to(G.fade, { autoAlpha: 0, duration: 0.35, ease: 'alpha' }, 0).call(() => done(), [], 0.1);

    if (G.isFirstLoaded) loadComponents(to).then(() => tl.play());
  }

  translate({ to, done }) {
    const header = document.querySelector('.header');
    const overlay = document.querySelector('.page-overlay');

    gsap.set(to, {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      zIndex: 1,
      marginTop: 0,
      autoAlpha: 0,
      y: 1.1 * G.w.h,
    });

    const tl = gsap.timeline({
      delay: 0.05,
      paused: true,
      defaults: { ease: 'gl.fastInOut', duration: 1.35 },
      onStart: () => G.emitter.emit('start-transition'),
      onComplete: () => {
        this.from.remove();
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(to, { clearProps: 'all' });
        G.smoothScroll.resize();
        G.emitter.emit('end-transition');
        G.smoothScroll.start();
      },
    });

    tl.set(to, { autoAlpha: 1 })
      .to(header, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, 0)
      .to(
        this.from,
        { transformOrigin: 'top', y: G.remToPixel(2), scale: 1 - G.remToPixel(4) / G.w.w, duration: 1.4 },
        0
      )
      .to(header, { autoAlpha: 1, duration: 0.3, ease: 'alpha' }, '<60%')
      .fromTo(to, { clipPath: 'inset(30% 40% 0)' }, { y: 0, clipPath: 'inset(0% 0% 0%)' }, 0)
      .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.6, ease: 'alpha' }, '<10%')
      .call(() => done(), [], '<60%');

    if (!G.isFirstLoaded) return;

    loadComponents(to).then(() => {
      if (G.isFooterVisible) {
        G.smoothScroll.scrollTo(G.pageHeight - G.w.h - G.footerHeight - 10, {
          force: true,
          lock: true,
          duration: 0.7,
          onComplete: () => tl.play(),
        });
      } else {
        tl.play();
      }
    });
  }
}

export default GlobalTransition;
