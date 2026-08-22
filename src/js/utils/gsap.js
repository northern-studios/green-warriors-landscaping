import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

CustomEase.create('alpha', '.25, .46, .45, .9');
CustomEase.create(
  'gl.quicky',
  'M0,0 C0.094,0.026 0.124,0.127 0.157,0.29 0.197,0.486 0.245,0.831 0.348,0.906 0.431,0.966 0.374,1 1,1 '
);
CustomEase.create(
  'gl.fastInOut',
  'M0,0 C0.094,0.026 0.124,0.127 0.157,0.29 0.197,0.486 0.254,0.8 0.348,0.884 0.42,0.949 0.374,1 1,1'
);
CustomEase.create('gl.inOut', 'M0,0 C0.2,0 0,1 1,1');
CustomEase.create(
  'wiggle',
  'M0,0 C0.012,0 0.025,0.066 0.05,0.066 0.1,0.066 0.1,-0.211 0.15,-0.211 0.2,-0.211 0.2,0.557 0.25,0.557 0.3,0.557 0.3,-0.837 0.35,-0.837 0.399,-0.837 0.399,0.984 0.449,0.984 0.499,0.984 0.499,-0.968 0.549,-0.968 0.6,-0.968 0.599,0.693 0.649,0.693 0.7,0.693 0.699,-0.319 0.749,-0.319 0.799,-0.319 0.799,0.114 0.849,0.114 0.899,0.114 0.899,-0.024 0.949,-0.024 0.974,-0.024 0.974,0 1,0'
);

gsap.registerEffect({
  name: 'revealTitle',
  defaults: { ease: 'expo.out', duration: 1.2, stagger: 0.1 },
  extendTimeline: true,
  effect: (targets, config) => {
    const tl = gsap.timeline({ defaults: config });
    tl.to(targets, { yPercent: 0 });
    return tl;
  },
});

gsap.registerEffect({
  name: 'revealContent',
  defaults: { ease: 'expo.out', duration: 1.2, stagger: 0.08 },
  extendTimeline: true,
  effect: (targets, config) => {
    const tl = gsap.timeline({ defaults: config });
    tl.to(targets, { yPercent: 0 });
    return tl;
  },
});

export { gsap, CustomEase, ScrollTrigger };
export default gsap;
