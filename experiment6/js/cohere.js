var d = Object.defineProperty;
var E = (a, e, t) => e in a ? d(a, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : a[e] = t;
var c = (a, e, t) => (E(a, typeof e != "symbol" ? e + "" : e, t), t);
class l {
  handleError(e) {
    var n, o, s;
    const t = ((n = e.response) == null ? void 0 : n.status) || 500, r = ((s = (o = e.response) == null ? void 0 : o.data) == null ? void 0 : s.message) || e.message;
    return {
      statusCode: t,
      body: {
        message: r
      }
    };
  }
}
const g = new l();
let p = new TextEncoder();
new TextDecoder();
class m {
  constructor() {
    c(this, "COHERE_API_KEY", "");
    c(this, "COHERE_VERSION", "");
  }
  init(e, t) {
    this.COHERE_API_KEY = e, t === void 0 ? this.COHERE_VERSION = "2022-12-06" : this.COHERE_VERSION = t;
  }
  async post(e, t) {
    return new Promise((r, n) => {
      try {
        t = JSON.parse(`${t}`);
      } catch {
      }
      const o = JSON.stringify(t);
      fetch("https://api.cohere.ai" + e, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": p.encode(o).length.toString(),
          "Cohere-Version": this.COHERE_VERSION,
          Authorization: `Bearer ${this.COHERE_API_KEY}`,
          "Request-Source": "node-sdk"
        },
        body: o
      }).then((s) => {
        if (console.log(s), "x-api-warning" in s.headers) {
          const i = s.headers["x-api-warning"];
          if (typeof i == "string")
            console.warn("Warning: %s", i);
          else
            for (const u in i)
              console.warn("Warning: %s", u);
        }
        return s.json().then((i) => {
          r({
            statusCode: s.status,
            body: i
          });
        });
      }).catch((s) => {
        n(g.handleError(s));
      });
    });
  }
}
const h = new m(), R = 5;
class C {
  init(e, t) {
    h.init(e, t);
  }
  makeRequest(e, t) {
    return h.post(e, t);
  }
  /** Generates realistic text conditioned on a given input.
   * See: https://docs.cohere.ai/generate-reference
   */
  generate(e) {
    return this.makeRequest("/generate", e);
  }
  /** Returns a list of tokens for the specified text.
   * See: https://docs.cohere.ai/tokenize-reference
   */
  tokenize({
    text: e
  }) {
    return this.makeRequest("/tokenize", {
      text: e
    });
  }
  /** Returns a string for the specified list of tokens.
   * See: https://docs.cohere.ai/detokenize-reference
   */
  detokenize({
    tokens: e
  }) {
    return this.makeRequest("/detokenize", {
      tokens: e
    });
  }
  /** Returns text embeddings. An embedding is a list of floating point numbers that captures semantic
   * information about the text that it represents.
   * See: https://docs.cohere.ai/embed-reference
   */
  embed(e) {
    const t = (r) => {
      const n = [];
      for (const o of r) {
        const s = n[n.length - 1];
        !s || s.length === R ? n.push([o]) : s.push(o);
      }
      return n;
    };
    return Promise.all(
      t(e.texts).map(
        (r) => this.makeRequest("/embed", {
          ...e,
          texts: r
        })
      )
    ).then((r) => {
      let n = [];
      return r.forEach((s) => {
        n = n.concat(s.body.embeddings);
      }), {
        statusCode: r[0].statusCode,
        body: { embeddings: n }
      };
    });
  }
  /**
   * Classifies text as one of the given labels. Returns a confidence score for each label.
   * See: https://docs.cohere.ai/classify-reference
   */
  classify(e) {
    return this.makeRequest("/classify", e);
  }
  detectLanguage(e) {
    return this.makeRequest("/detect-language", e);
  }
}
const f = new C();
export {
  f as default
};
