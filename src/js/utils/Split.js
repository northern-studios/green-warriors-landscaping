import SplitText from './SplitText.js';

// Thin wrapper around SplitText that adds the `.line-w` / `.char-w` overflow
// wrappers every reveal animation in the site translates against.
class Split {
  constructor({ target, by = 'chars', auto = true, handleCJT = false, plugin = null, willChange = false }) {
    this.target = target;
    this.by = by;
    this.handleCJT = handleCJT;
    this.plugin = plugin;
    this.willChange = willChange;
    this.plugins = {
      wrapLines: this.wrapLines.bind(this),
      wrapChars: this.wrapChars.bind(this),
    };
    if (auto) this.split();
  }

  split() {
    this.instance = new SplitText(this.target, {
      type: this.by,
      noBalance: true,
      handleCJT: this.handleCJT,
    });

    if (this.by.includes('lines') && this.willChange) {
      this.instance.lines.forEach((line) => {
        line.style.willChange = 'transform';
      });
    }

    if (this.plugin && this.plugins[this.plugin]) this.plugins[this.plugin]();

    return this.instance;
  }

  wrapLines() {
    const inner = [];
    this.instance.lines.forEach((line) => {
      const wrapper = document.createElement('div');
      const clone = line.cloneNode(true);
      wrapper.classList.add('line-w');
      wrapper.appendChild(clone);
      inner.push(clone);
      line.replaceWith(wrapper);
    });
    this.instance.wrapLines = inner;
  }

  wrapChars() {
    const inner = [];
    this.instance.chars.forEach((char) => {
      const wrapper = document.createElement('div');
      const clone = char.cloneNode(true);
      clone.dataset.char = char.innerText;
      wrapper.classList.add('char-w');
      wrapper.appendChild(clone);
      inner.push(clone);
      char.replaceWith(wrapper);
    });
    this.instance.wrapChars = inner;
  }

  update() {
    if (this.hasBr) {
      this.target.innerHTML = this.original;
      this.removeBr();
    } else {
      this.instance.revert();
    }
    this.instance.split();
    if (this.plugin && this.plugins[this.plugin]) this.plugins[this.plugin]();
  }

  reset() {
    this.instance.revert();
  }
}

export default Split;
