import piecesManager from './PiecesManager.js';

const isNodeList = (v) => {
  const type = Object.prototype.toString.call(v);
  return (
    typeof v === 'object' &&
    /^\[object (HTMLCollection|NodeList|Object)\]$/.test(type) &&
    typeof v.length === 'number' &&
    (v.length === 0 || (typeof v[0] === 'object' && v[0].nodeType > 0))
  );
};

// Base class for every `c-*` custom element. Keeps the server-rendered markup,
// registers itself with the pieces manager, and wires `data-events-*` attributes.
class Component extends HTMLElement {
  constructor(name, { stylesheets = [] } = {}) {
    super();
    this.name = name || this.constructor.name;
    this.template = document.createElement('template');
    this.piecesManager = piecesManager;
    this.stylesheets = stylesheets;
    this.updatedPiecesCount = this.piecesManager.piecesCount++;
    if (this.innerHTML != '') this.baseHTML = this.innerHTML;
    this._boundListeners = new Map();
  }

  connectedCallback(register = true) {
    if (register) {
      if (typeof this.cid !== 'string') this.cid = `c${this.updatedPiecesCount}`;
      this.piecesManager.addPiece({ name: this.name, id: this.cid, piece: this });
    }
    this.privatePremount(register);
    if (this.baseHTML == null) {
      this.innerHTML = '';
      this.template.innerHTML = this.render() != null ? this.render() : '';
      this.appendChild(this.template.cloneNode(true).content);
    }
    this.privateMount(register);
  }

  render() {
    if (this.baseHTML != null) return this.baseHTML;
  }

  disconnectedCallback() {
    this.privateUnmount();
  }

  adoptedCallback() {}

  privatePremount(register = true) {
    if (this.baseHTML == null) this.innerHTML = '';
    if (this.log) console.log('🚧 premount', this.name);
    this.loadStyles(register);
    this.premount(register);
  }

  premount() {}

  privateMount(register) {
    if (this.log) console.log('✅ mount', this.name);

    if (register) {
      this.piecesManager.loadedPiecesCount++;
      this.domEventsElements = Array.from(this.querySelectorAll('*')).filter((el) => {
        const attrs = el.attributes;
        for (let i = 0; i < attrs.length; i++) if (attrs[i].name.startsWith('data-events-')) return true;
        return false;
      });

      const attrs = this.attributes;
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].name.startsWith('data-events-')) this.domEventsElements.push(this);
      }

      if (this.domEventsElements) {
        this.domEventsElements.forEach((el) => {
          const attributes = el.attributes;
          for (let i = 0; i < attributes.length; i++) {
            if (!attributes[i].name.startsWith('data-events-')) continue;
            const event = attributes[i].name.replace('data-events-', '');
            let method = attributes[i].value;
            const parts = attributes[i].value.split(',');
            if (parts.length == 1) {
              if (typeof this[method] === 'function') this.on(event, el, this[method]);
            } else if (parts.length >= 2 && el.dataset.eventInit == null) {
              method = parts[0];
              const componentName = parts[1];
              const componentId = parts[2];
              el.dataset.eventInit = true;
              this.on(event, el, () => {
                this.call(method, el, componentName, componentId);
              });
            }
          }
        });
      }
    }

    this.mount(register);
  }

  mount() {}

  privateUpdate() {
    if (this.log) console.log('🔃 update', this.name);
    this.update();
    this.privateUnmount(true);
    this.connectedCallback(false);
  }

  update() {}

  privateUnmount(keep = false) {
    if (!keep) {
      this.piecesManager.removePiece({ name: this.name, id: this.cid });
      if (this.domEventsElements) {
        this.domEventsElements.forEach((el) => {
          const attributes = el.attributes;
          for (let i = 0; i < attributes.length; i++) {
            if (!attributes[i].name.startsWith('data-events-')) continue;
            const event = attributes[i].name.replace('data-events-', '');
            let method = attributes[i].value;
            const parts = attributes[i].value.split(',');
            if (parts.length == 1) {
              if (typeof this[method] === 'function') this.off(event, el, this[method]);
            } else if (parts.length >= 2 && el.dataset.eventInit == null) {
              method = parts[0];
              const componentName = parts[1];
              const componentId = parts[2];
              el.dataset.eventInit = true;
              this.off(event, el, () => {
                this.call(method, el, componentName, componentId);
              });
            }
          }
        });
      }
    }
    if (this.log) console.log('❌ unmount', this.name);
    this.unmount(keep);
  }

  unmount() {}

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this[name] = newValue;
      this.privateUpdate();
    }
  }

  $(selector, scope = this) {
    const found = scope.querySelectorAll(selector);
    return found.length == 1 ? found[0] : found.length == 0 ? null : found;
  }

  dom(selector, scope = this) {
    return this.$(selector, scope);
  }

  domAttr(name, scope = this) {
    const found = scope.querySelectorAll(`[data-dom="${name}"]`);
    return found.length == 1 ? found[0] : found.length == 0 ? null : found;
  }

  $All(selector, scope = this) {
    return Array.from(scope.querySelectorAll(selector));
  }

  domAll(selector, scope = this) {
    return Array.from(scope.querySelectorAll(selector));
  }

  domAttrAll(name, scope = this) {
    return Array.from(scope.querySelectorAll(`[data-dom="${name}"]`));
  }

  captureTree() {
    const els = this.querySelectorAll('[data-dom]');
    const tree = {};
    for (const el of els) {
      const key = el.getAttribute('data-dom');
      if (typeof tree[key] > 'u') tree[key] = [];
      tree[key].push(el);
    }
    return tree;
  }

  on(event, target, handler, arg = null) {
    if (target == null) return;
    const key = `${event}_${handler.name}`;
    if (!this._boundListeners.has(key)) {
      this._boundListeners.set(key, { original: handler, bound: handler.bind(this) });
    }
    const bound = this._boundListeners.get(key).bound;
    if (isNodeList(target) || Array.isArray(target)) {
      if (target.length > 0) {
        target.forEach((el) => {
          if (arg == null) el.addEventListener(event, bound);
          else el.addEventListener(event, () => bound(arg));
        });
      }
    } else if (arg == null) {
      target.addEventListener(event, bound);
    } else {
      target.addEventListener(event, () => bound(arg));
    }
  }

  off(event, target, handler) {
    if (target == null) return;
    const key = `${event}_${handler.name}`;
    const entry = this._boundListeners.get(key);
    if (!entry) return void console.warn(`No bound listener found for ${key}`);
    const bound = entry.bound;
    if (isNodeList(target) || Array.isArray(target)) {
      if (target.length > 0) target.forEach((el) => el.removeEventListener(event, bound));
    } else {
      target.removeEventListener(event, bound);
    }
    this._boundListeners.delete(key);
  }

  emit(name, target = document, detail) {
    target.dispatchEvent(new CustomEvent(name, { detail }));
  }

  call(method, el, componentName, componentId) {
    Object.keys(this.piecesManager.currentPieces).forEach((name) => {
      if (name != componentName) return;
      Object.keys(this.piecesManager.currentPieces[name]).forEach((id) => {
        if (componentId != null) {
          if (id == componentId) this.piecesManager.currentPieces[name][id].piece[method](el);
        } else {
          this.piecesManager.currentPieces[name][id].piece[method](el);
        }
      });
    });
  }

  async loadStyles(load = true) {
    if (!load) return;
    for (let i = 0; i < this.stylesheets.length; i++) await this.stylesheets[i]();
  }

  get log() {
    return typeof this.getAttribute('log') === 'string';
  }

  get cid() {
    return this.getAttribute('cid');
  }

  set cid(value) {
    return this.setAttribute('cid', value);
  }

  get properties() {
    return Object.values(this.attributes)
      .map((attr) => `${attr.name}="${attr.value}"`)
      .join(' ');
  }
}

export { isNodeList };
export default Component;
