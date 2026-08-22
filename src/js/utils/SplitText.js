// Custom line/word/char splitter used across the site (in-house, not GSAP SplitText).
// Balances lines with a binary search on max-width, then wraps each line in a `.line` span.

let supportsTextWrapBalance = -1;
let hasWarnedBalance = false;

function toArray2(t, e) {
    return t && 0 !== t.length ? t.nodeName ? [t] : [].slice.call(t[0].nodeName ? t : document.querySelectorAll(t)) : []
}
const WHITESPACE_CHARS = [" ", String.fromCharCode(160), String.fromCharCode(8239)],
    LINE_PARENT_TAGS = ["DIV", "H1", "H2", "H3", "H4", "H5", "H6", "P", "UL", "OL", "LI"];
class SplitText {
    constructor(t, e = {
        lineThreshold: .2,
        type: "lines",
        noAriaLabel: !1,
        noBalance: !1,
        balanceRatio: 1,
        minLines: 1,
        handleCJT: !1
    }) {
        this.isSplit = !1, this.chars = [], this.words = [], this.lines = [], this.originals = [], this.lineParents = [], this.elements = [], this.options = {}, this.elements = toArray2(t), this.options = e, this.options.lineThreshold = "number" == typeof this.options.lineThreshold ? this.options.lineThreshold : .2, this.options.noAriaLabel = "boolean" == typeof this.options.noAriaLabel && this.options.noAriaLabel, this.options.noBalance = "boolean" == typeof this.options.noBalance && this.options.noBalance, this.options.minLines = "number" == typeof this.options.minLines ? this.options.minLines : 1, this.options.handleCJT = "boolean" == typeof this.options.handleCJT && this.options.handleCJT, this.options.type = "string" == typeof this.options.type ? this.options.type : "lines", this.split()
    }
    split() {
        this.isSplit && this.revert();
        const t = (this.options.type || "lines").split(",").map(t => t.trim()),
            e = ~t.indexOf("lines"),
            i = ~t.indexOf("words"),
            r = ~t.indexOf("chars");
        this.elements.forEach((t, n) => {
            if (t.__isParent = !0, this.originals[n] = t.innerHTML.trim(), t.innerHTML = t.innerHTML.trim().split(/\u200b/).join("<wbr>"), this.balance(t), i || e || r) {
                if (this.words.push(...this.splitElement(t, "word", /\s+/, !0)), 1 === this.words.length && this.words[0].offsetWidth < t.parentElement.offsetWidth && this.lineParents.forEach(t => t.style.removeProperty("max-width")), e) {
                    this.detectLinesTop(t, this.words, this.options.lineThreshold);
                    if (!this.checkMinLines(t, this.words)) return;
                    t.style.removeProperty("width"), this.attachBr(t, this.words), this.splitBr(t), this.replaceWords(t, (e || i) && !r), this.lines.push(...this.splitLines(t));
                    if (!this.checkBalance(t, n)) return;
                    this.safeCheckBalance = 0
                }!e || i || r || (this.lines.forEach(t => {
                    t.__words.forEach(t => {
                        t.insertAdjacentHTML("beforebegin", t.textContent), t.remove()
                    }), t.normalize()
                }), this.words.length = 0, this.chars.length = 0), r && (this.words.forEach(t => this.chars.push(...this.splitElement(t, "char", "", !1))), i || (this.chars.forEach(t => {
                    t.parentElement.insertAdjacentHTML("beforebegin", t.outerHTML), t.remove()
                }), this.chars = toArray2(t.getElementsByClassName("char")), this.words.forEach(t => t.remove()), this.words.length = 0))
            }
            if (!this.options.noAriaLabel && (r || i)) {
                this.recursiveAriaLabel(t);
                toArray2(t.querySelectorAll("a, button")).forEach(this.createAriaLabel)
            }
        }), this.isSplit = !0
    }
    recursiveAriaLabel(t) {
        const e = toArray2(t.childNodes).filter(t => LINE_PARENT_TAGS.includes(t.tagName));
        e.length ? e.forEach(t => {
            this.recursiveAriaLabel(t)
        }) : this.createAriaLabel(t)
    }
    createAriaLabel(t) {
        const e = document.createElement("span");
        e.classList.add("sr-only"), e.style.setProperty("position", "absolute"), e.style.setProperty("width", "1px"), e.style.setProperty("height", "1px"), e.style.setProperty("padding", "0"), e.style.setProperty("margin", "-1px"), e.style.setProperty("overflow", "hidden"), e.style.setProperty("clip", "rect(0, 0, 0, 0)"), e.style.setProperty("white-space", "nowrap"), e.style.setProperty("border", "0"), e.textContent = t.textContent, t.appendChild(e)
    }
    checkBalance(t, e) {
        var i;
        if (this.options.noBalance) return !0;
        const r = this.lines.filter(t => t.scrollWidth > t.parentElement.offsetWidth);
        for (let n = 0; n < r.length; n++) {
            const t = r[n],
                s = null == (i = t.__words[0]) ? void 0 : i.textContent;
            if (1 === t.__wordCount && s.match(/\b\w+-\w+\b/) && this.safeCheckBalance <= 5) {
                const t = s.split("-").join("-&#8203;");
                return this.originals[e] = this.originals[e].replace(s, t), this.safeCheckBalance++, this.revert(), this.split(), !1
            }
            t.parentElement.style.removeProperty("max-width")
        }
        return !0
    }
    revert() {
        0 !== this.originals.length && (this.elements.forEach((t, e) => t.innerHTML = this.originals[e]), [this.lines, this.words, this.chars, this.originals].forEach(t => t.length = 0), this.isSplit = !1)
    }
    recursiveBalance(t) {
        t.normalize(), toArray2(t.childNodes).forEach(e => {
            e.normalize(), e.__lineParent = Boolean(e.tagName && e.hasChildNodes() && LINE_PARENT_TAGS.includes(e.tagName)), e.__lineParent && (null == t ? void 0 : t.__lineParent) && !t.__isParent && (t.__lineParent = !1), this.recursiveBalance(e)
        })
    }
    recursiveCheckLineParent(t, e) {
        toArray2(t.childNodes).forEach(t => {
            t.__lineParent && (t.__idx = null, t.textContent.replace(/\s+/g, " ").trim().length > 0 && (t.__lines = [this.createLine()], e.push(t))), this.recursiveCheckLineParent(t, e)
        })
    }
    balance(t) {
        this.lineParents = [], this.recursiveBalance(t), this.recursiveCheckLineParent(t, this.lineParents);
        let e = !0;
        this.lineParents.length || (this.lineParents.push(t), t.__lines = [this.createLine()], t.__lineParent = !0, t.__idx = null, e = !1), t.__lineParent = !0, this.options.noBalance || this.lineParents.forEach(t => function balanceText({
            el: t,
            ratio: e = 1,
            useParent: i = !1,
            debug: r = !1
        } = {}) {
            -1 === supportsTextWrapBalance && (supportsTextWrapBalance = "undefined" != typeof CSS && "function" == typeof CSS.supports && CSS.supports("text-wrap", "balance"));
            const n = i ? t.parentElement : t;
            if (!n) return;
            const s = window.getComputedStyle(t);
            if (supportsTextWrapBalance && "balance" === s.textWrap) return void(r && !hasWarnedBalance && (console.warn("`text-wrap: balance` is supported by this browser, no need to use `balanceText` here"), hasWarnedBalance = !0));
            const update = e => t.style.maxWidth = `${Math.ceil(e)}px`;
            t.style.maxWidth = "";
            const o = n.clientWidth,
                a = n.clientHeight;
            let l, c = o / 2 - .25,
                u = o + .5,
                f = 0;
            if (o) {
                for (; c + 1 < u && f < 2e3;) l = Math.round((c + u) / 2), update(l), n.clientHeight === a ? u = l : c = l, f++;
                update(u * e + o * (1 - e))
            }
        }({
            el: t,
            ratio: this.options.balanceRatio,
            useParent: e
        }))
    }
    recursiveFindBr(t, e, i = !0) {
        t.normalize(), toArray2(t.childNodes).forEach(t => {
            "BR" !== t.tagName || i && t.__newBR ? this.recursiveFindBr(t, e, i) : e.push(t)
        })
    }
    findAllBr(t, e = !0) {
        const i = [];
        return this.recursiveFindBr(t, i, e), i
    }
    splitBr(t) {
        let e = 0;
        const i = this.findAllBr(t);
        for (; e < i.length;) {
            let r = 0,
                n = i[e++].parentElement;
            if (!n) return this.splitBr(t);
            for (; !n.__lineParent;) {
                if (r++ >= 100) return;
                if (!n.parentElement) return this.splitBr(t);
                const e = n.innerHTML,
                    i = n.cloneNode(),
                    s = i.tagName.toLowerCase(),
                    o = i.outerHTML.split(`</${s}>`).join(""),
                    a = e.split(/<br\b[^>]*>/).join(`</${s}><br>${o.trim()}`);
                n = n.parentElement, n.innerHTML = n.innerHTML.replace(e.trim(), a.trim()), toArray2(n.childNodes).forEach(t => {
                    "BR" === t.tagName ? t.__newBR = !0 : 3 !== t.nodeType && 0 === t.textContent.trim().length && t.remove()
                })
            }
        }
    }
    isNextBr(t) {
        var e;
        return "BR" === (null == (e = t.nextElementSibling) ? void 0 : e.tagName)
    }
    isPrevBr(t) {
        var e;
        return "BR" === (null == (e = t.previousElementSibling) ? void 0 : e.tagName)
    }
    attachBr(t, e) {
        var i;
        let r, n = (null == (i = e[0]) ? void 0 : i.__top) || 0;
        e.forEach((t, i) => {
            const s = e[i - 1];
            if (n !== t.__top && s) {
                const e = this.findLineParent(t);
                e.__idx || (e.__idx = `l${t.__top}`), this.isPrevBr(t.parentElement) || this.isPrevBr(t) || this.isNextBr(s) || r && (null == r ? void 0 : r.__idx) !== e.__idx || t.insertAdjacentHTML("beforebegin", "<br>"), r = e, n = t.__top
            }
        })
    }
    findLineParent(t) {
        let e = t.parentElement,
            i = !1;
        for (; !i;) e.__lineParent && (i = e), e = e.parentElement;
        return i
    }
    replaceWords(t, e) {
        Array.from(t.getElementsByClassName("word")).forEach((t, i) => {
            t.replaceWith(this.words[i]), t.__isCJT && e && (this.words[i].innerHTML = this.words[i].textContent)
        })
    }
    isCJTChar(t) {
        return /[\u4E00-\u9FFF\u3400-\u4DBF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF\u0E00-\u0E7F]/.test(t)
    }
    handleRawElement(t, e, i, r, n, s, o) {
        const a = e.wholeText || "";
        let l = a;
        if (l.trim().length) {
            if ("word" === i || "char" === i) {
                if (l = a.trim(), WHITESPACE_CHARS.includes(a[0]) && o.push(document.createTextNode(a[0])), this.options.handleCJT && "word" === i) {
                    const e = l.split(/(\s+)/).filter(Boolean);
                    for (let r = 0; r < e.length; r++) {
                        const n = e[r];
                        if (/^\s+$/.test(n)) {
                            o.push(document.createTextNode(n));
                            continue
                        }
                        let a = "",
                            l = !1;
                        for (let e = 0; e < n.length; e++) {
                            const r = n[e],
                                c = this.isCJTChar(r);
                            if (c !== l || e === n.length - 1) {
                                if (e === n.length - 1 && (a += r), a) {
                                    const e = this.createElement(t, i, a);
                                    s.push(e), o.push(e), l && (e.__isCJT = !0, this.chars.push(...this.splitElement(e, "char", "", !1)))
                                }
                                a = e === n.length - 1 ? "" : r, l = c
                            } else a += r
                        }
                    }
                } else if ("char" === i) {
                    Array.from(l).forEach(e => {
                        const r = this.createElement(t, i, e);
                        s.push(r), o.push(r)
                    })
                } else {
                    l.split(/([\s\u00A0\u202F]+)/).forEach((e, r) => {
                        if (r % 2 == 1) o.push(document.createTextNode(e));
                        else if (e) {
                            const r = this.createElement(t, i, e);
                            s.push(r), o.push(r)
                        }
                    })
                }
                WHITESPACE_CHARS.includes(a[a.length - 1]) && o.push(document.createTextNode(a[a.length - 1]))
            }
        } else o.push(document.createTextNode(a))
    }
    splitElement(t, e, i, r) {
        t.normalize();
        const n = [],
            s = document.createDocumentFragment(),
            o = [];
        return toArray2(t.childNodes).forEach(t => {
            if (t.tagName && !t.hasChildNodes()) return o.push(t);
            t.childNodes.length ? (o.push(t), n.push(...this.splitElement(t, e, i, r))) : this.handleRawElement(s, t, e, i, r, n, o)
        }), o.forEach(t => s.appendChild(t)), t.innerHTML = "", t.appendChild(s), n
    }
    offsetTop(t, e) {
        let i = e.offsetParent,
            r = 0,
            n = t;
        for (; n && n !== e && n !== i;) r += n.offsetTop, n = n.offsetParent;
        return r
    }
    detectLinesTop(t, e, i) {
        let r = -999;
        const n = window.getComputedStyle(t),
            s = parseFloat(n.fontSize || 0) * i,
            o = e.map(e => {
                const i = Math.round(this.offsetTop(e, t));
                return Math.abs(i - r) > s && (r = i), e.__top = r, e.__top
            });
        return [...new Set(o)]
    }
    splitLines(t) {
        const e = [];
        this.findAllBr(t, !1).forEach(t => {
            var e;
            const i = this.findLineParent(t),
                r = this.createLine();
            r.__isLine = !0, null == (e = null == i ? void 0 : i.__lines) || e.push(r)
        });
        let i = 0;
        return this.lineParents.forEach((t, r) => {
            let n = 0;
            r > 0 && i++, toArray2(t.childNodes).forEach(e => {
                "BR" === e.tagName ? (i++, n++, e.remove()) : (t.__lines[n].appendChild(e), toArray2(e.childNodes).forEach(t => t.__lineIndex = i), e.__lineIndex = i)
            }), t.__lines.forEach(e => t.appendChild(e)), e.push(...t.__lines)
        }), e.forEach(t => {
            t.__words = toArray2(t.getElementsByClassName("word")), t.__wordCount = t.__words.length
        }), e
    }
    createLine(t) {
        const e = document.createElement("span");
        return e.style.setProperty("display", "block"), e.className = "line", t ? t.appendChild(e) : e
    }
    createElement(t, e, i) {
        const r = document.createElement("span");
        return "word" === e && r.style.setProperty("display", "inline-block"), r.className = e, r.textContent = i, r.setAttribute("aria-hidden", !0), t.appendChild(r)
    }
    checkMinLines(t, e) {
        if (this.options.minLines <= 1 || this.options.minLines > 1 && e.length <= 1) return !0;
        let i = e[0].__top,
            r = 1;
        e.forEach(t => {
            const e = t.__top;
            e > i && (i = e, r++)
        });
        const n = this.options.minLines - r;
        n > 1 && !this.warned && (this.warned = !0, console.warn(`SplitText is ran ${n} times. Careful as this option might be expensive 🫰`.toUpperCase(), t));
        const s = this.words[this.words.length - 1];
        let o = s.offsetLeft + .9 * s.offsetWidth;
        return t.offsetWidth < o && (o = t.offsetWidth - .5 * s.offsetWidth), !(r < this.options.minLines && o > 0) || (t.style.width = `${o}px`, this.revert(), this.balance(t), this.split(), !1)
    }
}

export default SplitText;
