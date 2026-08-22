const G = {
  router: null,
  fade: null,
  isMobile: false,
  remToPixel: (v) => v * parseFloat(getComputedStyle(document.documentElement).fontSize),
  pixelToRem: (v) => v / parseFloat(getComputedStyle(document.documentElement).fontSize),
  lerp: (a, b, t) => a * (1 - t) + b * t,
  getMaxWidth: (els) => Math.max(...Array.from(els).map((el) => el.offsetWidth)),
  getMaxHeight: (els) => Math.max(...Array.from(els).map((el) => el.offsetHeight)),
  distance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
  detect: {
    uA: navigator.userAgent.toLowerCase(),
    get iPadIOS13() {
      return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    },
    get isMobile() {
      return (/mobi|android|tablet|ipad|iphone/.test(this.uA) && window.innerWidth <= 1024) || this.iPadIOS13;
    },
    get isMobileAndroid() {
      return /android.*mobile/.test(this.uA);
    },
    get isFirefox() {
      return this.uA.indexOf('firefox') > -1;
    },
    get isAndroid() {
      return this.isMobileAndroid || (!this.isMobileAndroid && /android/i.test(this.uA));
    },
    get safari() {
      return this.uA.match(/version\/[\d.]+.*safari/);
    },
    get isSafari() {
      return this.safari && !this.isAndroid;
    },
  },
};

export default G;
