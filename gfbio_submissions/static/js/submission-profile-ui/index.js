function T1(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const o in r)
        if (o !== "default" && !(o in e)) {
          const s = Object.getOwnPropertyDescriptor(r, o);
          s &&
            Object.defineProperty(
              e,
              o,
              s.get ? s : { enumerable: !0, get: () => r[o] }
            );
        }
    }
  }
  return Object.freeze(
    Object.defineProperty(e, Symbol.toStringTag, { value: "Module" })
  );
}
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) r(o);
  new MutationObserver((o) => {
    for (const s of o)
      if (s.type === "childList")
        for (const i of s.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(o) {
    const s = {};
    return (
      o.integrity && (s.integrity = o.integrity),
      o.referrerPolicy && (s.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : o.crossOrigin === "anonymous"
        ? (s.credentials = "omit")
        : (s.credentials = "same-origin"),
      s
    );
  }
  function r(o) {
    if (o.ep) return;
    o.ep = !0;
    const s = n(o);
    fetch(o.href, s);
  }
})();
var cd =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
function zr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var dg = { exports: {} },
  Ul = {},
  fg = { exports: {} },
  de = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Xs = Symbol.for("react.element"),
  N1 = Symbol.for("react.portal"),
  O1 = Symbol.for("react.fragment"),
  j1 = Symbol.for("react.strict_mode"),
  $1 = Symbol.for("react.profiler"),
  L1 = Symbol.for("react.provider"),
  A1 = Symbol.for("react.context"),
  F1 = Symbol.for("react.forward_ref"),
  M1 = Symbol.for("react.suspense"),
  I1 = Symbol.for("react.memo"),
  z1 = Symbol.for("react.lazy"),
  Dp = Symbol.iterator;
function B1(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Dp && e[Dp]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var pg = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  mg = Object.assign,
  hg = {};
function Fo(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = hg),
    (this.updater = n || pg);
}
Fo.prototype.isReactComponent = {};
Fo.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
Fo.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function gg() {}
gg.prototype = Fo.prototype;
function ud(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = hg),
    (this.updater = n || pg);
}
var dd = (ud.prototype = new gg());
dd.constructor = ud;
mg(dd, Fo.prototype);
dd.isPureReactComponent = !0;
var Pp = Array.isArray,
  yg = Object.prototype.hasOwnProperty,
  fd = { current: null },
  vg = { key: !0, ref: !0, __self: !0, __source: !0 };
function wg(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (i = t.ref),
    t.key !== void 0 && (s = "" + t.key),
    t))
      yg.call(t, r) && !vg.hasOwnProperty(r) && (o[r] = t[r]);
  var l = arguments.length - 2;
  if (l === 1) o.children = n;
  else if (1 < l) {
    for (var a = Array(l), c = 0; c < l; c++) a[c] = arguments[c + 2];
    o.children = a;
  }
  if (e && e.defaultProps)
    for (r in ((l = e.defaultProps), l)) o[r] === void 0 && (o[r] = l[r]);
  return {
    $$typeof: Xs,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: fd.current,
  };
}
function V1(e, t) {
  return {
    $$typeof: Xs,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function pd(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Xs;
}
function H1(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Tp = /\/+/g;
function Ja(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? H1("" + e.key)
    : t.toString(36);
}
function Bi(e, t, n, r, o) {
  var s = typeof e;
  (s === "undefined" || s === "boolean") && (e = null);
  var i = !1;
  if (e === null) i = !0;
  else
    switch (s) {
      case "string":
      case "number":
        i = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case Xs:
          case N1:
            i = !0;
        }
    }
  if (i)
    return (
      (i = e),
      (o = o(i)),
      (e = r === "" ? "." + Ja(i, 0) : r),
      Pp(o)
        ? ((n = ""),
          e != null && (n = e.replace(Tp, "$&/") + "/"),
          Bi(o, t, n, "", function (c) {
            return c;
          }))
        : o != null &&
          (pd(o) &&
            (o = V1(
              o,
              n +
                (!o.key || (i && i.key === o.key)
                  ? ""
                  : ("" + o.key).replace(Tp, "$&/") + "/") +
                e
            )),
          t.push(o)),
      1
    );
  if (((i = 0), (r = r === "" ? "." : r + ":"), Pp(e)))
    for (var l = 0; l < e.length; l++) {
      s = e[l];
      var a = r + Ja(s, l);
      i += Bi(s, t, n, a, o);
    }
  else if (((a = B1(e)), typeof a == "function"))
    for (e = a.call(e), l = 0; !(s = e.next()).done; )
      (s = s.value), (a = r + Ja(s, l++)), (i += Bi(s, t, n, a, o));
  else if (s === "object")
    throw (
      ((t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]"
            ? "object with keys {" + Object.keys(e).join(", ") + "}"
            : t) +
          "). If you meant to render a collection of children, use an array instead."
      ))
    );
  return i;
}
function mi(e, t, n) {
  if (e == null) return e;
  var r = [],
    o = 0;
  return (
    Bi(e, r, "", "", function (s) {
      return t.call(n, s, o++);
    }),
    r
  );
}
function U1(e) {
  if (e._status === -1) {
    var t = e._result;
    (t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) &&
            ((e._status = 2), (e._result = n));
        }
      ),
      e._status === -1 && ((e._status = 0), (e._result = t));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var ct = { current: null },
  Vi = { transition: null },
  W1 = {
    ReactCurrentDispatcher: ct,
    ReactCurrentBatchConfig: Vi,
    ReactCurrentOwner: fd,
  };
function xg() {
  throw Error("act(...) is not supported in production builds of React.");
}
de.Children = {
  map: mi,
  forEach: function (e, t, n) {
    mi(
      e,
      function () {
        t.apply(this, arguments);
      },
      n
    );
  },
  count: function (e) {
    var t = 0;
    return (
      mi(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      mi(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!pd(e))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return e;
  },
};
de.Component = Fo;
de.Fragment = O1;
de.Profiler = $1;
de.PureComponent = ud;
de.StrictMode = j1;
de.Suspense = M1;
de.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W1;
de.act = xg;
de.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        "."
    );
  var r = mg({}, e.props),
    o = e.key,
    s = e.ref,
    i = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((s = t.ref), (i = fd.current)),
      t.key !== void 0 && (o = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var l = e.type.defaultProps;
    for (a in t)
      yg.call(t, a) &&
        !vg.hasOwnProperty(a) &&
        (r[a] = t[a] === void 0 && l !== void 0 ? l[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    l = Array(a);
    for (var c = 0; c < a; c++) l[c] = arguments[c + 2];
    r.children = l;
  }
  return { $$typeof: Xs, type: e.type, key: o, ref: s, props: r, _owner: i };
};
de.createContext = function (e) {
  return (
    (e = {
      $$typeof: A1,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: L1, _context: e }),
    (e.Consumer = e)
  );
};
de.createElement = wg;
de.createFactory = function (e) {
  var t = wg.bind(null, e);
  return (t.type = e), t;
};
de.createRef = function () {
  return { current: null };
};
de.forwardRef = function (e) {
  return { $$typeof: F1, render: e };
};
de.isValidElement = pd;
de.lazy = function (e) {
  return { $$typeof: z1, _payload: { _status: -1, _result: e }, _init: U1 };
};
de.memo = function (e, t) {
  return { $$typeof: I1, type: e, compare: t === void 0 ? null : t };
};
de.startTransition = function (e) {
  var t = Vi.transition;
  Vi.transition = {};
  try {
    e();
  } finally {
    Vi.transition = t;
  }
};
de.unstable_act = xg;
de.useCallback = function (e, t) {
  return ct.current.useCallback(e, t);
};
de.useContext = function (e) {
  return ct.current.useContext(e);
};
de.useDebugValue = function () {};
de.useDeferredValue = function (e) {
  return ct.current.useDeferredValue(e);
};
de.useEffect = function (e, t) {
  return ct.current.useEffect(e, t);
};
de.useId = function () {
  return ct.current.useId();
};
de.useImperativeHandle = function (e, t, n) {
  return ct.current.useImperativeHandle(e, t, n);
};
de.useInsertionEffect = function (e, t) {
  return ct.current.useInsertionEffect(e, t);
};
de.useLayoutEffect = function (e, t) {
  return ct.current.useLayoutEffect(e, t);
};
de.useMemo = function (e, t) {
  return ct.current.useMemo(e, t);
};
de.useReducer = function (e, t, n) {
  return ct.current.useReducer(e, t, n);
};
de.useRef = function (e) {
  return ct.current.useRef(e);
};
de.useState = function (e) {
  return ct.current.useState(e);
};
de.useSyncExternalStore = function (e, t, n) {
  return ct.current.useSyncExternalStore(e, t, n);
};
de.useTransition = function () {
  return ct.current.useTransition();
};
de.version = "18.3.1";
fg.exports = de;
var y = fg.exports;
const Wl = zr(y),
  Sg = T1({ __proto__: null, default: Wl }, [y]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Y1 = y,
  K1 = Symbol.for("react.element"),
  q1 = Symbol.for("react.fragment"),
  G1 = Object.prototype.hasOwnProperty,
  X1 = Y1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  Q1 = { key: !0, ref: !0, __self: !0, __source: !0 };
function bg(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  n !== void 0 && (s = "" + n),
    t.key !== void 0 && (s = "" + t.key),
    t.ref !== void 0 && (i = t.ref);
  for (r in t) G1.call(t, r) && !Q1.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) o[r] === void 0 && (o[r] = t[r]);
  return {
    $$typeof: K1,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: X1.current,
  };
}
Ul.Fragment = q1;
Ul.jsx = bg;
Ul.jsxs = bg;
dg.exports = Ul;
var x = dg.exports,
  Hc = {},
  Cg = { exports: {} },
  _t = {},
  Eg = { exports: {} },
  kg = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(R, k) {
    var $ = R.length;
    R.push(k);
    e: for (; 0 < $; ) {
      var O = ($ - 1) >>> 1,
        I = R[O];
      if (0 < o(I, k)) (R[O] = k), (R[$] = I), ($ = O);
      else break e;
    }
  }
  function n(R) {
    return R.length === 0 ? null : R[0];
  }
  function r(R) {
    if (R.length === 0) return null;
    var k = R[0],
      $ = R.pop();
    if ($ !== k) {
      R[0] = $;
      e: for (var O = 0, I = R.length, K = I >>> 1; O < K; ) {
        var J = 2 * (O + 1) - 1,
          ee = R[J],
          ne = J + 1,
          te = R[ne];
        if (0 > o(ee, $))
          ne < I && 0 > o(te, ee)
            ? ((R[O] = te), (R[ne] = $), (O = ne))
            : ((R[O] = ee), (R[J] = $), (O = J));
        else if (ne < I && 0 > o(te, $)) (R[O] = te), (R[ne] = $), (O = ne);
        else break e;
      }
    }
    return k;
  }
  function o(R, k) {
    var $ = R.sortIndex - k.sortIndex;
    return $ !== 0 ? $ : R.id - k.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var s = performance;
    e.unstable_now = function () {
      return s.now();
    };
  } else {
    var i = Date,
      l = i.now();
    e.unstable_now = function () {
      return i.now() - l;
    };
  }
  var a = [],
    c = [],
    u = 1,
    d = null,
    f = 3,
    m = !1,
    p = !1,
    h = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    v = typeof clearTimeout == "function" ? clearTimeout : null,
    w = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(R) {
    for (var k = n(c); k !== null; ) {
      if (k.callback === null) r(c);
      else if (k.startTime <= R)
        r(c), (k.sortIndex = k.expirationTime), t(a, k);
      else break;
      k = n(c);
    }
  }
  function b(R) {
    if (((h = !1), g(R), !p))
      if (n(a) !== null) (p = !0), P(C);
      else {
        var k = n(c);
        k !== null && T(b, k.startTime - R);
      }
  }
  function C(R, k) {
    (p = !1), h && ((h = !1), v(D), (D = -1)), (m = !0);
    var $ = f;
    try {
      for (
        g(k), d = n(a);
        d !== null && (!(d.expirationTime > k) || (R && !M()));

      ) {
        var O = d.callback;
        if (typeof O == "function") {
          (d.callback = null), (f = d.priorityLevel);
          var I = O(d.expirationTime <= k);
          (k = e.unstable_now()),
            typeof I == "function" ? (d.callback = I) : d === n(a) && r(a),
            g(k);
        } else r(a);
        d = n(a);
      }
      if (d !== null) var K = !0;
      else {
        var J = n(c);
        J !== null && T(b, J.startTime - k), (K = !1);
      }
      return K;
    } finally {
      (d = null), (f = $), (m = !1);
    }
  }
  var E = !1,
    _ = null,
    D = -1,
    L = 5,
    N = -1;
  function M() {
    return !(e.unstable_now() - N < L);
  }
  function B() {
    if (_ !== null) {
      var R = e.unstable_now();
      N = R;
      var k = !0;
      try {
        k = _(!0, R);
      } finally {
        k ? V() : ((E = !1), (_ = null));
      }
    } else E = !1;
  }
  var V;
  if (typeof w == "function")
    V = function () {
      w(B);
    };
  else if (typeof MessageChannel < "u") {
    var A = new MessageChannel(),
      j = A.port2;
    (A.port1.onmessage = B),
      (V = function () {
        j.postMessage(null);
      });
  } else
    V = function () {
      S(B, 0);
    };
  function P(R) {
    (_ = R), E || ((E = !0), V());
  }
  function T(R, k) {
    D = S(function () {
      R(e.unstable_now());
    }, k);
  }
  (e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (R) {
      R.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      p || m || ((p = !0), P(C));
    }),
    (e.unstable_forceFrameRate = function (R) {
      0 > R || 125 < R
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
          )
        : (L = 0 < R ? Math.floor(1e3 / R) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return f;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(a);
    }),
    (e.unstable_next = function (R) {
      switch (f) {
        case 1:
        case 2:
        case 3:
          var k = 3;
          break;
        default:
          k = f;
      }
      var $ = f;
      f = k;
      try {
        return R();
      } finally {
        f = $;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (R, k) {
      switch (R) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          R = 3;
      }
      var $ = f;
      f = R;
      try {
        return k();
      } finally {
        f = $;
      }
    }),
    (e.unstable_scheduleCallback = function (R, k, $) {
      var O = e.unstable_now();
      switch (
        (typeof $ == "object" && $ !== null
          ? (($ = $.delay), ($ = typeof $ == "number" && 0 < $ ? O + $ : O))
          : ($ = O),
        R)
      ) {
        case 1:
          var I = -1;
          break;
        case 2:
          I = 250;
          break;
        case 5:
          I = 1073741823;
          break;
        case 4:
          I = 1e4;
          break;
        default:
          I = 5e3;
      }
      return (
        (I = $ + I),
        (R = {
          id: u++,
          callback: k,
          priorityLevel: R,
          startTime: $,
          expirationTime: I,
          sortIndex: -1,
        }),
        $ > O
          ? ((R.sortIndex = $),
            t(c, R),
            n(a) === null &&
              R === n(c) &&
              (h ? (v(D), (D = -1)) : (h = !0), T(b, $ - O)))
          : ((R.sortIndex = I), t(a, R), p || m || ((p = !0), P(C))),
        R
      );
    }),
    (e.unstable_shouldYield = M),
    (e.unstable_wrapCallback = function (R) {
      var k = f;
      return function () {
        var $ = f;
        f = k;
        try {
          return R.apply(this, arguments);
        } finally {
          f = $;
        }
      };
    });
})(kg);
Eg.exports = kg;
var J1 = Eg.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Z1 = y,
  kt = J1;
function H(e) {
  for (
    var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1;
    n < arguments.length;
    n++
  )
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var _g = new Set(),
  ks = {};
function Br(e, t) {
  Eo(e, t), Eo(e + "Capture", t);
}
function Eo(e, t) {
  for (ks[e] = t, e = 0; e < t.length; e++) _g.add(t[e]);
}
var Tn = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Uc = Object.prototype.hasOwnProperty,
  ex =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Np = {},
  Op = {};
function tx(e) {
  return Uc.call(Op, e)
    ? !0
    : Uc.call(Np, e)
    ? !1
    : ex.test(e)
    ? (Op[e] = !0)
    : ((Np[e] = !0), !1);
}
function nx(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : n !== null
        ? !n.acceptsBooleans
        : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function rx(e, t, n, r) {
  if (t === null || typeof t > "u" || nx(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function ut(e, t, n, r, o, s, i) {
  (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = o),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = s),
    (this.removeEmptyString = i);
}
var Ke = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Ke[e] = new ut(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Ke[t] = new ut(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Ke[e] = new ut(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  Ke[e] = new ut(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Ke[e] = new ut(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Ke[e] = new ut(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Ke[e] = new ut(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Ke[e] = new ut(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Ke[e] = new ut(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var md = /[\-:]([a-z])/g;
function hd(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(md, hd);
    Ke[t] = new ut(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(md, hd);
    Ke[t] = new ut(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(md, hd);
  Ke[t] = new ut(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Ke[e] = new ut(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Ke.xlinkHref = new ut(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1
);
["src", "href", "action", "formAction"].forEach(function (e) {
  Ke[e] = new ut(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function gd(e, t, n, r) {
  var o = Ke.hasOwnProperty(t) ? Ke[t] : null;
  (o !== null
    ? o.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (rx(t, n, o, r) && (n = null),
    r || o === null
      ? tx(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : o.mustUseProperty
      ? (e[o.propertyName] = n === null ? (o.type === 3 ? !1 : "") : n)
      : ((t = o.attributeName),
        (r = o.attributeNamespace),
        n === null
          ? e.removeAttribute(t)
          : ((o = o.type),
            (n = o === 3 || (o === 4 && n === !0) ? "" : "" + n),
            r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var An = Z1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  hi = Symbol.for("react.element"),
  eo = Symbol.for("react.portal"),
  to = Symbol.for("react.fragment"),
  yd = Symbol.for("react.strict_mode"),
  Wc = Symbol.for("react.profiler"),
  Rg = Symbol.for("react.provider"),
  Dg = Symbol.for("react.context"),
  vd = Symbol.for("react.forward_ref"),
  Yc = Symbol.for("react.suspense"),
  Kc = Symbol.for("react.suspense_list"),
  wd = Symbol.for("react.memo"),
  Hn = Symbol.for("react.lazy"),
  Pg = Symbol.for("react.offscreen"),
  jp = Symbol.iterator;
function Zo(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (jp && e[jp]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Pe = Object.assign,
  Za;
function fs(e) {
  if (Za === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      Za = (t && t[1]) || "";
    }
  return (
    `
` +
    Za +
    e
  );
}
var ec = !1;
function tc(e, t) {
  if (!e || ec) return "";
  ec = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (c) {
          var r = c;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (c) {
          r = c;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (c) {
        r = c;
      }
      e();
    }
  } catch (c) {
    if (c && r && typeof c.stack == "string") {
      for (
        var o = c.stack.split(`
`),
          s = r.stack.split(`
`),
          i = o.length - 1,
          l = s.length - 1;
        1 <= i && 0 <= l && o[i] !== s[l];

      )
        l--;
      for (; 1 <= i && 0 <= l; i--, l--)
        if (o[i] !== s[l]) {
          if (i !== 1 || l !== 1)
            do
              if ((i--, l--, 0 > l || o[i] !== s[l])) {
                var a =
                  `
` + o[i].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    a.includes("<anonymous>") &&
                    (a = a.replace("<anonymous>", e.displayName)),
                  a
                );
              }
            while (1 <= i && 0 <= l);
          break;
        }
    }
  } finally {
    (ec = !1), (Error.prepareStackTrace = n);
  }
  return (e = e ? e.displayName || e.name : "") ? fs(e) : "";
}
function ox(e) {
  switch (e.tag) {
    case 5:
      return fs(e.type);
    case 16:
      return fs("Lazy");
    case 13:
      return fs("Suspense");
    case 19:
      return fs("SuspenseList");
    case 0:
    case 2:
    case 15:
      return (e = tc(e.type, !1)), e;
    case 11:
      return (e = tc(e.type.render, !1)), e;
    case 1:
      return (e = tc(e.type, !0)), e;
    default:
      return "";
  }
}
function qc(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case to:
      return "Fragment";
    case eo:
      return "Portal";
    case Wc:
      return "Profiler";
    case yd:
      return "StrictMode";
    case Yc:
      return "Suspense";
    case Kc:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Dg:
        return (e.displayName || "Context") + ".Consumer";
      case Rg:
        return (e._context.displayName || "Context") + ".Provider";
      case vd:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case wd:
        return (
          (t = e.displayName || null), t !== null ? t : qc(e.type) || "Memo"
        );
      case Hn:
        (t = e._payload), (e = e._init);
        try {
          return qc(e(t));
        } catch {}
    }
  return null;
}
function sx(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ""),
        t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return qc(t);
    case 8:
      return t === yd ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function ir(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function Tg(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function ix(e) {
  var t = Tg(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var o = n.get,
      s = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return o.call(this);
        },
        set: function (i) {
          (r = "" + i), s.call(this, i);
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (i) {
          r = "" + i;
        },
        stopTracking: function () {
          (e._valueTracker = null), delete e[t];
        },
      }
    );
  }
}
function gi(e) {
  e._valueTracker || (e._valueTracker = ix(e));
}
function Ng(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = Tg(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function ol(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function Gc(e, t) {
  var n = t.checked;
  return Pe({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function $p(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  (n = ir(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    });
}
function Og(e, t) {
  (t = t.checked), t != null && gd(e, "checked", t, !1);
}
function Xc(e, t) {
  Og(e, t);
  var n = ir(t.value),
    r = t.type;
  if (n != null)
    r === "number"
      ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
      : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value")
    ? Qc(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && Qc(e, t.type, ir(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked);
}
function Lp(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (
      !(
        (r !== "submit" && r !== "reset") ||
        (t.value !== void 0 && t.value !== null)
      )
    )
      return;
    (t = "" + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t);
  }
  (n = e.name),
    n !== "" && (e.name = ""),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== "" && (e.name = n);
}
function Qc(e, t, n) {
  (t !== "number" || ol(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var ps = Array.isArray;
function mo(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++)
      (o = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== o && (e[n].selected = o),
        o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + ir(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        (e[o].selected = !0), r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function Jc(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(H(91));
  return Pe({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function Ap(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(H(92));
      if (ps(n)) {
        if (1 < n.length) throw Error(H(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), (n = t);
  }
  e._wrapperState = { initialValue: ir(n) };
}
function jg(e, t) {
  var n = ir(t.value),
    r = ir(t.defaultValue);
  n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r);
}
function Fp(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function $g(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Zc(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? $g(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
    ? "http://www.w3.org/1999/xhtml"
    : e;
}
var yi,
  Lg = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, o) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, o);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e)
      e.innerHTML = t;
    else {
      for (
        yi = yi || document.createElement("div"),
          yi.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = yi.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function _s(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var gs = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  lx = ["Webkit", "ms", "Moz", "O"];
Object.keys(gs).forEach(function (e) {
  lx.forEach(function (t) {
    (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (gs[t] = gs[e]);
  });
});
function Ag(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (gs.hasOwnProperty(e) && gs[e])
    ? ("" + t).trim()
    : t + "px";
}
function Fg(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        o = Ag(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : (e[n] = o);
    }
}
var ax = Pe(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  }
);
function eu(e, t) {
  if (t) {
    if (ax[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(H(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(H(60));
      if (
        typeof t.dangerouslySetInnerHTML != "object" ||
        !("__html" in t.dangerouslySetInnerHTML)
      )
        throw Error(H(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(H(62));
  }
}
function tu(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var nu = null;
function xd(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var ru = null,
  ho = null,
  go = null;
function Mp(e) {
  if ((e = Zs(e))) {
    if (typeof ru != "function") throw Error(H(280));
    var t = e.stateNode;
    t && ((t = Xl(t)), ru(e.stateNode, e.type, t));
  }
}
function Mg(e) {
  ho ? (go ? go.push(e) : (go = [e])) : (ho = e);
}
function Ig() {
  if (ho) {
    var e = ho,
      t = go;
    if (((go = ho = null), Mp(e), t)) for (e = 0; e < t.length; e++) Mp(t[e]);
  }
}
function zg(e, t) {
  return e(t);
}
function Bg() {}
var nc = !1;
function Vg(e, t, n) {
  if (nc) return e(t, n);
  nc = !0;
  try {
    return zg(e, t, n);
  } finally {
    (nc = !1), (ho !== null || go !== null) && (Bg(), Ig());
  }
}
function Rs(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Xl(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) ||
        ((e = e.type),
        (r = !(
          e === "button" ||
          e === "input" ||
          e === "select" ||
          e === "textarea"
        ))),
        (e = !r);
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(H(231, t, typeof n));
  return n;
}
var ou = !1;
if (Tn)
  try {
    var es = {};
    Object.defineProperty(es, "passive", {
      get: function () {
        ou = !0;
      },
    }),
      window.addEventListener("test", es, es),
      window.removeEventListener("test", es, es);
  } catch {
    ou = !1;
  }
function cx(e, t, n, r, o, s, i, l, a) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (u) {
    this.onError(u);
  }
}
var ys = !1,
  sl = null,
  il = !1,
  su = null,
  ux = {
    onError: function (e) {
      (ys = !0), (sl = e);
    },
  };
function dx(e, t, n, r, o, s, i, l, a) {
  (ys = !1), (sl = null), cx.apply(ux, arguments);
}
function fx(e, t, n, r, o, s, i, l, a) {
  if ((dx.apply(this, arguments), ys)) {
    if (ys) {
      var c = sl;
      (ys = !1), (sl = null);
    } else throw Error(H(198));
    il || ((il = !0), (su = c));
  }
}
function Vr(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do (t = e), t.flags & 4098 && (n = t.return), (e = t.return);
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Hg(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (
      (t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)),
      t !== null)
    )
      return t.dehydrated;
  }
  return null;
}
function Ip(e) {
  if (Vr(e) !== e) throw Error(H(188));
}
function px(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = Vr(e)), t === null)) throw Error(H(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var o = n.return;
    if (o === null) break;
    var s = o.alternate;
    if (s === null) {
      if (((r = o.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (o.child === s.child) {
      for (s = o.child; s; ) {
        if (s === n) return Ip(o), e;
        if (s === r) return Ip(o), t;
        s = s.sibling;
      }
      throw Error(H(188));
    }
    if (n.return !== r.return) (n = o), (r = s);
    else {
      for (var i = !1, l = o.child; l; ) {
        if (l === n) {
          (i = !0), (n = o), (r = s);
          break;
        }
        if (l === r) {
          (i = !0), (r = o), (n = s);
          break;
        }
        l = l.sibling;
      }
      if (!i) {
        for (l = s.child; l; ) {
          if (l === n) {
            (i = !0), (n = s), (r = o);
            break;
          }
          if (l === r) {
            (i = !0), (r = s), (n = o);
            break;
          }
          l = l.sibling;
        }
        if (!i) throw Error(H(189));
      }
    }
    if (n.alternate !== r) throw Error(H(190));
  }
  if (n.tag !== 3) throw Error(H(188));
  return n.stateNode.current === n ? e : t;
}
function Ug(e) {
  return (e = px(e)), e !== null ? Wg(e) : null;
}
function Wg(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Wg(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Yg = kt.unstable_scheduleCallback,
  zp = kt.unstable_cancelCallback,
  mx = kt.unstable_shouldYield,
  hx = kt.unstable_requestPaint,
  $e = kt.unstable_now,
  gx = kt.unstable_getCurrentPriorityLevel,
  Sd = kt.unstable_ImmediatePriority,
  Kg = kt.unstable_UserBlockingPriority,
  ll = kt.unstable_NormalPriority,
  yx = kt.unstable_LowPriority,
  qg = kt.unstable_IdlePriority,
  Yl = null,
  yn = null;
function vx(e) {
  if (yn && typeof yn.onCommitFiberRoot == "function")
    try {
      yn.onCommitFiberRoot(Yl, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var Xt = Math.clz32 ? Math.clz32 : Sx,
  wx = Math.log,
  xx = Math.LN2;
function Sx(e) {
  return (e >>>= 0), e === 0 ? 32 : (31 - ((wx(e) / xx) | 0)) | 0;
}
var vi = 64,
  wi = 4194304;
function ms(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function al(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    o = e.suspendedLanes,
    s = e.pingedLanes,
    i = n & 268435455;
  if (i !== 0) {
    var l = i & ~o;
    l !== 0 ? (r = ms(l)) : ((s &= i), s !== 0 && (r = ms(s)));
  } else (i = n & ~o), i !== 0 ? (r = ms(i)) : s !== 0 && (r = ms(s));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & o) &&
    ((o = r & -r), (s = t & -t), o >= s || (o === 16 && (s & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      (n = 31 - Xt(t)), (o = 1 << n), (r |= e[n]), (t &= ~o);
  return r;
}
function bx(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function Cx(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      o = e.expirationTimes,
      s = e.pendingLanes;
    0 < s;

  ) {
    var i = 31 - Xt(s),
      l = 1 << i,
      a = o[i];
    a === -1
      ? (!(l & n) || l & r) && (o[i] = bx(l, t))
      : a <= t && (e.expiredLanes |= l),
      (s &= ~l);
  }
}
function iu(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function Gg() {
  var e = vi;
  return (vi <<= 1), !(vi & 4194240) && (vi = 64), e;
}
function rc(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Qs(e, t, n) {
  (e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - Xt(t)),
    (e[t] = n);
}
function Ex(e, t) {
  var n = e.pendingLanes & ~t;
  (e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements);
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var o = 31 - Xt(n),
      s = 1 << o;
    (t[o] = 0), (r[o] = -1), (e[o] = -1), (n &= ~s);
  }
}
function bd(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - Xt(n),
      o = 1 << r;
    (o & t) | (e[r] & t) && (e[r] |= t), (n &= ~o);
  }
}
var he = 0;
function Xg(e) {
  return (e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1;
}
var Qg,
  Cd,
  Jg,
  Zg,
  ey,
  lu = !1,
  xi = [],
  Jn = null,
  Zn = null,
  er = null,
  Ds = new Map(),
  Ps = new Map(),
  Yn = [],
  kx =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " "
    );
function Bp(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Jn = null;
      break;
    case "dragenter":
    case "dragleave":
      Zn = null;
      break;
    case "mouseover":
    case "mouseout":
      er = null;
      break;
    case "pointerover":
    case "pointerout":
      Ds.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Ps.delete(t.pointerId);
  }
}
function ts(e, t, n, r, o, s) {
  return e === null || e.nativeEvent !== s
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: s,
        targetContainers: [o],
      }),
      t !== null && ((t = Zs(t)), t !== null && Cd(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function _x(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return (Jn = ts(Jn, e, t, n, r, o)), !0;
    case "dragenter":
      return (Zn = ts(Zn, e, t, n, r, o)), !0;
    case "mouseover":
      return (er = ts(er, e, t, n, r, o)), !0;
    case "pointerover":
      var s = o.pointerId;
      return Ds.set(s, ts(Ds.get(s) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return (
        (s = o.pointerId), Ps.set(s, ts(Ps.get(s) || null, e, t, n, r, o)), !0
      );
  }
  return !1;
}
function ty(e) {
  var t = br(e.target);
  if (t !== null) {
    var n = Vr(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = Hg(n)), t !== null)) {
          (e.blockedOn = t),
            ey(e.priority, function () {
              Jg(n);
            });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Hi(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = au(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      (nu = r), n.target.dispatchEvent(r), (nu = null);
    } else return (t = Zs(n)), t !== null && Cd(t), (e.blockedOn = n), !1;
    t.shift();
  }
  return !0;
}
function Vp(e, t, n) {
  Hi(e) && n.delete(t);
}
function Rx() {
  (lu = !1),
    Jn !== null && Hi(Jn) && (Jn = null),
    Zn !== null && Hi(Zn) && (Zn = null),
    er !== null && Hi(er) && (er = null),
    Ds.forEach(Vp),
    Ps.forEach(Vp);
}
function ns(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    lu ||
      ((lu = !0),
      kt.unstable_scheduleCallback(kt.unstable_NormalPriority, Rx)));
}
function Ts(e) {
  function t(o) {
    return ns(o, e);
  }
  if (0 < xi.length) {
    ns(xi[0], e);
    for (var n = 1; n < xi.length; n++) {
      var r = xi[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Jn !== null && ns(Jn, e),
      Zn !== null && ns(Zn, e),
      er !== null && ns(er, e),
      Ds.forEach(t),
      Ps.forEach(t),
      n = 0;
    n < Yn.length;
    n++
  )
    (r = Yn[n]), r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < Yn.length && ((n = Yn[0]), n.blockedOn === null); )
    ty(n), n.blockedOn === null && Yn.shift();
}
var yo = An.ReactCurrentBatchConfig,
  cl = !0;
function Dx(e, t, n, r) {
  var o = he,
    s = yo.transition;
  yo.transition = null;
  try {
    (he = 1), Ed(e, t, n, r);
  } finally {
    (he = o), (yo.transition = s);
  }
}
function Px(e, t, n, r) {
  var o = he,
    s = yo.transition;
  yo.transition = null;
  try {
    (he = 4), Ed(e, t, n, r);
  } finally {
    (he = o), (yo.transition = s);
  }
}
function Ed(e, t, n, r) {
  if (cl) {
    var o = au(e, t, n, r);
    if (o === null) pc(e, t, r, ul, n), Bp(e, r);
    else if (_x(o, e, t, n, r)) r.stopPropagation();
    else if ((Bp(e, r), t & 4 && -1 < kx.indexOf(e))) {
      for (; o !== null; ) {
        var s = Zs(o);
        if (
          (s !== null && Qg(s),
          (s = au(e, t, n, r)),
          s === null && pc(e, t, r, ul, n),
          s === o)
        )
          break;
        o = s;
      }
      o !== null && r.stopPropagation();
    } else pc(e, t, r, null, n);
  }
}
var ul = null;
function au(e, t, n, r) {
  if (((ul = null), (e = xd(r)), (e = br(e)), e !== null))
    if (((t = Vr(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = Hg(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return (ul = e), null;
}
function ny(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (gx()) {
        case Sd:
          return 1;
        case Kg:
          return 4;
        case ll:
        case yx:
          return 16;
        case qg:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Gn = null,
  kd = null,
  Ui = null;
function ry() {
  if (Ui) return Ui;
  var e,
    t = kd,
    n = t.length,
    r,
    o = "value" in Gn ? Gn.value : Gn.textContent,
    s = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === o[s - r]; r++);
  return (Ui = o.slice(e, 1 < r ? 1 - r : void 0));
}
function Wi(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Si() {
  return !0;
}
function Hp() {
  return !1;
}
function Rt(e) {
  function t(n, r, o, s, i) {
    (this._reactName = n),
      (this._targetInst = o),
      (this.type = r),
      (this.nativeEvent = s),
      (this.target = i),
      (this.currentTarget = null);
    for (var l in e)
      e.hasOwnProperty(l) && ((n = e[l]), (this[l] = n ? n(s) : s[l]));
    return (
      (this.isDefaultPrevented = (
        s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1
      )
        ? Si
        : Hp),
      (this.isPropagationStopped = Hp),
      this
    );
  }
  return (
    Pe(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = Si));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = Si));
      },
      persist: function () {},
      isPersistent: Si,
    }),
    t
  );
}
var Mo = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  _d = Rt(Mo),
  Js = Pe({}, Mo, { view: 0, detail: 0 }),
  Tx = Rt(Js),
  oc,
  sc,
  rs,
  Kl = Pe({}, Js, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: Rd,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== rs &&
            (rs && e.type === "mousemove"
              ? ((oc = e.screenX - rs.screenX), (sc = e.screenY - rs.screenY))
              : (sc = oc = 0),
            (rs = e)),
          oc);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : sc;
    },
  }),
  Up = Rt(Kl),
  Nx = Pe({}, Kl, { dataTransfer: 0 }),
  Ox = Rt(Nx),
  jx = Pe({}, Js, { relatedTarget: 0 }),
  ic = Rt(jx),
  $x = Pe({}, Mo, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Lx = Rt($x),
  Ax = Pe({}, Mo, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Fx = Rt(Ax),
  Mx = Pe({}, Mo, { data: 0 }),
  Wp = Rt(Mx),
  Ix = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  zx = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  Bx = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function Vx(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Bx[e]) ? !!t[e] : !1;
}
function Rd() {
  return Vx;
}
var Hx = Pe({}, Js, {
    key: function (e) {
      if (e.key) {
        var t = Ix[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Wi(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
        ? zx[e.keyCode] || "Unidentified"
        : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: Rd,
    charCode: function (e) {
      return e.type === "keypress" ? Wi(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Wi(e)
        : e.type === "keydown" || e.type === "keyup"
        ? e.keyCode
        : 0;
    },
  }),
  Ux = Rt(Hx),
  Wx = Pe({}, Kl, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Yp = Rt(Wx),
  Yx = Pe({}, Js, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Rd,
  }),
  Kx = Rt(Yx),
  qx = Pe({}, Mo, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Gx = Rt(qx),
  Xx = Pe({}, Kl, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
        ? -e.wheelDeltaY
        : "wheelDelta" in e
        ? -e.wheelDelta
        : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  Qx = Rt(Xx),
  Jx = [9, 13, 27, 32],
  Dd = Tn && "CompositionEvent" in window,
  vs = null;
Tn && "documentMode" in document && (vs = document.documentMode);
var Zx = Tn && "TextEvent" in window && !vs,
  oy = Tn && (!Dd || (vs && 8 < vs && 11 >= vs)),
  Kp = " ",
  qp = !1;
function sy(e, t) {
  switch (e) {
    case "keyup":
      return Jx.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function iy(e) {
  return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
}
var no = !1;
function eS(e, t) {
  switch (e) {
    case "compositionend":
      return iy(t);
    case "keypress":
      return t.which !== 32 ? null : ((qp = !0), Kp);
    case "textInput":
      return (e = t.data), e === Kp && qp ? null : e;
    default:
      return null;
  }
}
function tS(e, t) {
  if (no)
    return e === "compositionend" || (!Dd && sy(e, t))
      ? ((e = ry()), (Ui = kd = Gn = null), (no = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return oy && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var nS = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Gp(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!nS[e.type] : t === "textarea";
}
function ly(e, t, n, r) {
  Mg(r),
    (t = dl(t, "onChange")),
    0 < t.length &&
      ((n = new _d("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t }));
}
var ws = null,
  Ns = null;
function rS(e) {
  vy(e, 0);
}
function ql(e) {
  var t = so(e);
  if (Ng(t)) return e;
}
function oS(e, t) {
  if (e === "change") return t;
}
var ay = !1;
if (Tn) {
  var lc;
  if (Tn) {
    var ac = "oninput" in document;
    if (!ac) {
      var Xp = document.createElement("div");
      Xp.setAttribute("oninput", "return;"),
        (ac = typeof Xp.oninput == "function");
    }
    lc = ac;
  } else lc = !1;
  ay = lc && (!document.documentMode || 9 < document.documentMode);
}
function Qp() {
  ws && (ws.detachEvent("onpropertychange", cy), (Ns = ws = null));
}
function cy(e) {
  if (e.propertyName === "value" && ql(Ns)) {
    var t = [];
    ly(t, Ns, e, xd(e)), Vg(rS, t);
  }
}
function sS(e, t, n) {
  e === "focusin"
    ? (Qp(), (ws = t), (Ns = n), ws.attachEvent("onpropertychange", cy))
    : e === "focusout" && Qp();
}
function iS(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return ql(Ns);
}
function lS(e, t) {
  if (e === "click") return ql(t);
}
function aS(e, t) {
  if (e === "input" || e === "change") return ql(t);
}
function cS(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Zt = typeof Object.is == "function" ? Object.is : cS;
function Os(e, t) {
  if (Zt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!Uc.call(t, o) || !Zt(e[o], t[o])) return !1;
  }
  return !0;
}
function Jp(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Zp(e, t) {
  var n = Jp(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t))
        return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Jp(n);
  }
}
function uy(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
      ? !1
      : t && t.nodeType === 3
      ? uy(e, t.parentNode)
      : "contains" in e
      ? e.contains(t)
      : e.compareDocumentPosition
      ? !!(e.compareDocumentPosition(t) & 16)
      : !1
    : !1;
}
function dy() {
  for (var e = window, t = ol(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = ol(e.document);
  }
  return t;
}
function Pd(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
function uS(e) {
  var t = dy(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    uy(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && Pd(n)) {
      if (
        ((t = r.start),
        (e = r.end),
        e === void 0 && (e = t),
        "selectionStart" in n)
      )
        (n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window),
        e.getSelection)
      ) {
        e = e.getSelection();
        var o = n.textContent.length,
          s = Math.min(r.start, o);
        (r = r.end === void 0 ? s : Math.min(r.end, o)),
          !e.extend && s > r && ((o = r), (r = s), (s = o)),
          (o = Zp(n, s));
        var i = Zp(n, r);
        o &&
          i &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== o.node ||
            e.anchorOffset !== o.offset ||
            e.focusNode !== i.node ||
            e.focusOffset !== i.offset) &&
          ((t = t.createRange()),
          t.setStart(o.node, o.offset),
          e.removeAllRanges(),
          s > r
            ? (e.addRange(t), e.extend(i.node, i.offset))
            : (t.setEnd(i.node, i.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 &&
        t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
      (e = t[n]),
        (e.element.scrollLeft = e.left),
        (e.element.scrollTop = e.top);
  }
}
var dS = Tn && "documentMode" in document && 11 >= document.documentMode,
  ro = null,
  cu = null,
  xs = null,
  uu = !1;
function em(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  uu ||
    ro == null ||
    ro !== ol(r) ||
    ((r = ro),
    "selectionStart" in r && Pd(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = (
          (r.ownerDocument && r.ownerDocument.defaultView) ||
          window
        ).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (xs && Os(xs, r)) ||
      ((xs = r),
      (r = dl(cu, "onSelect")),
      0 < r.length &&
        ((t = new _d("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = ro))));
}
function bi(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var oo = {
    animationend: bi("Animation", "AnimationEnd"),
    animationiteration: bi("Animation", "AnimationIteration"),
    animationstart: bi("Animation", "AnimationStart"),
    transitionend: bi("Transition", "TransitionEnd"),
  },
  cc = {},
  fy = {};
Tn &&
  ((fy = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete oo.animationend.animation,
    delete oo.animationiteration.animation,
    delete oo.animationstart.animation),
  "TransitionEvent" in window || delete oo.transitionend.transition);
function Gl(e) {
  if (cc[e]) return cc[e];
  if (!oo[e]) return e;
  var t = oo[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in fy) return (cc[e] = t[n]);
  return e;
}
var py = Gl("animationend"),
  my = Gl("animationiteration"),
  hy = Gl("animationstart"),
  gy = Gl("transitionend"),
  yy = new Map(),
  tm =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
function ur(e, t) {
  yy.set(e, t), Br(t, [e]);
}
for (var uc = 0; uc < tm.length; uc++) {
  var dc = tm[uc],
    fS = dc.toLowerCase(),
    pS = dc[0].toUpperCase() + dc.slice(1);
  ur(fS, "on" + pS);
}
ur(py, "onAnimationEnd");
ur(my, "onAnimationIteration");
ur(hy, "onAnimationStart");
ur("dblclick", "onDoubleClick");
ur("focusin", "onFocus");
ur("focusout", "onBlur");
ur(gy, "onTransitionEnd");
Eo("onMouseEnter", ["mouseout", "mouseover"]);
Eo("onMouseLeave", ["mouseout", "mouseover"]);
Eo("onPointerEnter", ["pointerout", "pointerover"]);
Eo("onPointerLeave", ["pointerout", "pointerover"]);
Br(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
Br(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
Br("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Br(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
Br(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
Br(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var hs =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ),
  mS = new Set("cancel close invalid load scroll toggle".split(" ").concat(hs));
function nm(e, t, n) {
  var r = e.type || "unknown-event";
  (e.currentTarget = n), fx(r, t, void 0, e), (e.currentTarget = null);
}
function vy(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      o = r.event;
    r = r.listeners;
    e: {
      var s = void 0;
      if (t)
        for (var i = r.length - 1; 0 <= i; i--) {
          var l = r[i],
            a = l.instance,
            c = l.currentTarget;
          if (((l = l.listener), a !== s && o.isPropagationStopped())) break e;
          nm(o, l, c), (s = a);
        }
      else
        for (i = 0; i < r.length; i++) {
          if (
            ((l = r[i]),
            (a = l.instance),
            (c = l.currentTarget),
            (l = l.listener),
            a !== s && o.isPropagationStopped())
          )
            break e;
          nm(o, l, c), (s = a);
        }
    }
  }
  if (il) throw ((e = su), (il = !1), (su = null), e);
}
function we(e, t) {
  var n = t[hu];
  n === void 0 && (n = t[hu] = new Set());
  var r = e + "__bubble";
  n.has(r) || (wy(t, e, 2, !1), n.add(r));
}
function fc(e, t, n) {
  var r = 0;
  t && (r |= 4), wy(n, e, r, t);
}
var Ci = "_reactListening" + Math.random().toString(36).slice(2);
function js(e) {
  if (!e[Ci]) {
    (e[Ci] = !0),
      _g.forEach(function (n) {
        n !== "selectionchange" && (mS.has(n) || fc(n, !1, e), fc(n, !0, e));
      });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ci] || ((t[Ci] = !0), fc("selectionchange", !1, t));
  }
}
function wy(e, t, n, r) {
  switch (ny(t)) {
    case 1:
      var o = Dx;
      break;
    case 4:
      o = Px;
      break;
    default:
      o = Ed;
  }
  (n = o.bind(null, t, n, e)),
    (o = void 0),
    !ou ||
      (t !== "touchstart" && t !== "touchmove" && t !== "wheel") ||
      (o = !0),
    r
      ? o !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: o })
        : e.addEventListener(t, n, !0)
      : o !== void 0
      ? e.addEventListener(t, n, { passive: o })
      : e.addEventListener(t, n, !1);
}
function pc(e, t, n, r, o) {
  var s = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var i = r.tag;
      if (i === 3 || i === 4) {
        var l = r.stateNode.containerInfo;
        if (l === o || (l.nodeType === 8 && l.parentNode === o)) break;
        if (i === 4)
          for (i = r.return; i !== null; ) {
            var a = i.tag;
            if (
              (a === 3 || a === 4) &&
              ((a = i.stateNode.containerInfo),
              a === o || (a.nodeType === 8 && a.parentNode === o))
            )
              return;
            i = i.return;
          }
        for (; l !== null; ) {
          if (((i = br(l)), i === null)) return;
          if (((a = i.tag), a === 5 || a === 6)) {
            r = s = i;
            continue e;
          }
          l = l.parentNode;
        }
      }
      r = r.return;
    }
  Vg(function () {
    var c = s,
      u = xd(n),
      d = [];
    e: {
      var f = yy.get(e);
      if (f !== void 0) {
        var m = _d,
          p = e;
        switch (e) {
          case "keypress":
            if (Wi(n) === 0) break e;
          case "keydown":
          case "keyup":
            m = Ux;
            break;
          case "focusin":
            (p = "focus"), (m = ic);
            break;
          case "focusout":
            (p = "blur"), (m = ic);
            break;
          case "beforeblur":
          case "afterblur":
            m = ic;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            m = Up;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            m = Ox;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            m = Kx;
            break;
          case py:
          case my:
          case hy:
            m = Lx;
            break;
          case gy:
            m = Gx;
            break;
          case "scroll":
            m = Tx;
            break;
          case "wheel":
            m = Qx;
            break;
          case "copy":
          case "cut":
          case "paste":
            m = Fx;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            m = Yp;
        }
        var h = (t & 4) !== 0,
          S = !h && e === "scroll",
          v = h ? (f !== null ? f + "Capture" : null) : f;
        h = [];
        for (var w = c, g; w !== null; ) {
          g = w;
          var b = g.stateNode;
          if (
            (g.tag === 5 &&
              b !== null &&
              ((g = b),
              v !== null && ((b = Rs(w, v)), b != null && h.push($s(w, b, g)))),
            S)
          )
            break;
          w = w.return;
        }
        0 < h.length &&
          ((f = new m(f, p, null, n, u)), d.push({ event: f, listeners: h }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((f = e === "mouseover" || e === "pointerover"),
          (m = e === "mouseout" || e === "pointerout"),
          f &&
            n !== nu &&
            (p = n.relatedTarget || n.fromElement) &&
            (br(p) || p[Nn]))
        )
          break e;
        if (
          (m || f) &&
          ((f =
            u.window === u
              ? u
              : (f = u.ownerDocument)
              ? f.defaultView || f.parentWindow
              : window),
          m
            ? ((p = n.relatedTarget || n.toElement),
              (m = c),
              (p = p ? br(p) : null),
              p !== null &&
                ((S = Vr(p)), p !== S || (p.tag !== 5 && p.tag !== 6)) &&
                (p = null))
            : ((m = null), (p = c)),
          m !== p)
        ) {
          if (
            ((h = Up),
            (b = "onMouseLeave"),
            (v = "onMouseEnter"),
            (w = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((h = Yp),
              (b = "onPointerLeave"),
              (v = "onPointerEnter"),
              (w = "pointer")),
            (S = m == null ? f : so(m)),
            (g = p == null ? f : so(p)),
            (f = new h(b, w + "leave", m, n, u)),
            (f.target = S),
            (f.relatedTarget = g),
            (b = null),
            br(u) === c &&
              ((h = new h(v, w + "enter", p, n, u)),
              (h.target = g),
              (h.relatedTarget = S),
              (b = h)),
            (S = b),
            m && p)
          )
            t: {
              for (h = m, v = p, w = 0, g = h; g; g = qr(g)) w++;
              for (g = 0, b = v; b; b = qr(b)) g++;
              for (; 0 < w - g; ) (h = qr(h)), w--;
              for (; 0 < g - w; ) (v = qr(v)), g--;
              for (; w--; ) {
                if (h === v || (v !== null && h === v.alternate)) break t;
                (h = qr(h)), (v = qr(v));
              }
              h = null;
            }
          else h = null;
          m !== null && rm(d, f, m, h, !1),
            p !== null && S !== null && rm(d, S, p, h, !0);
        }
      }
      e: {
        if (
          ((f = c ? so(c) : window),
          (m = f.nodeName && f.nodeName.toLowerCase()),
          m === "select" || (m === "input" && f.type === "file"))
        )
          var C = oS;
        else if (Gp(f))
          if (ay) C = aS;
          else {
            C = iS;
            var E = sS;
          }
        else
          (m = f.nodeName) &&
            m.toLowerCase() === "input" &&
            (f.type === "checkbox" || f.type === "radio") &&
            (C = lS);
        if (C && (C = C(e, c))) {
          ly(d, C, n, u);
          break e;
        }
        E && E(e, f, c),
          e === "focusout" &&
            (E = f._wrapperState) &&
            E.controlled &&
            f.type === "number" &&
            Qc(f, "number", f.value);
      }
      switch (((E = c ? so(c) : window), e)) {
        case "focusin":
          (Gp(E) || E.contentEditable === "true") &&
            ((ro = E), (cu = c), (xs = null));
          break;
        case "focusout":
          xs = cu = ro = null;
          break;
        case "mousedown":
          uu = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          (uu = !1), em(d, n, u);
          break;
        case "selectionchange":
          if (dS) break;
        case "keydown":
        case "keyup":
          em(d, n, u);
      }
      var _;
      if (Dd)
        e: {
          switch (e) {
            case "compositionstart":
              var D = "onCompositionStart";
              break e;
            case "compositionend":
              D = "onCompositionEnd";
              break e;
            case "compositionupdate":
              D = "onCompositionUpdate";
              break e;
          }
          D = void 0;
        }
      else
        no
          ? sy(e, n) && (D = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (D = "onCompositionStart");
      D &&
        (oy &&
          n.locale !== "ko" &&
          (no || D !== "onCompositionStart"
            ? D === "onCompositionEnd" && no && (_ = ry())
            : ((Gn = u),
              (kd = "value" in Gn ? Gn.value : Gn.textContent),
              (no = !0))),
        (E = dl(c, D)),
        0 < E.length &&
          ((D = new Wp(D, e, null, n, u)),
          d.push({ event: D, listeners: E }),
          _ ? (D.data = _) : ((_ = iy(n)), _ !== null && (D.data = _)))),
        (_ = Zx ? eS(e, n) : tS(e, n)) &&
          ((c = dl(c, "onBeforeInput")),
          0 < c.length &&
            ((u = new Wp("onBeforeInput", "beforeinput", null, n, u)),
            d.push({ event: u, listeners: c }),
            (u.data = _)));
    }
    vy(d, t);
  });
}
function $s(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function dl(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e,
      s = o.stateNode;
    o.tag === 5 &&
      s !== null &&
      ((o = s),
      (s = Rs(e, n)),
      s != null && r.unshift($s(e, s, o)),
      (s = Rs(e, t)),
      s != null && r.push($s(e, s, o))),
      (e = e.return);
  }
  return r;
}
function qr(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function rm(e, t, n, r, o) {
  for (var s = t._reactName, i = []; n !== null && n !== r; ) {
    var l = n,
      a = l.alternate,
      c = l.stateNode;
    if (a !== null && a === r) break;
    l.tag === 5 &&
      c !== null &&
      ((l = c),
      o
        ? ((a = Rs(n, s)), a != null && i.unshift($s(n, a, l)))
        : o || ((a = Rs(n, s)), a != null && i.push($s(n, a, l)))),
      (n = n.return);
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var hS = /\r\n?/g,
  gS = /\u0000|\uFFFD/g;
function om(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      hS,
      `
`
    )
    .replace(gS, "");
}
function Ei(e, t, n) {
  if (((t = om(t)), om(e) !== t && n)) throw Error(H(425));
}
function fl() {}
var du = null,
  fu = null;
function pu(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var mu = typeof setTimeout == "function" ? setTimeout : void 0,
  yS = typeof clearTimeout == "function" ? clearTimeout : void 0,
  sm = typeof Promise == "function" ? Promise : void 0,
  vS =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof sm < "u"
      ? function (e) {
          return sm.resolve(null).then(e).catch(wS);
        }
      : mu;
function wS(e) {
  setTimeout(function () {
    throw e;
  });
}
function mc(e, t) {
  var n = t,
    r = 0;
  do {
    var o = n.nextSibling;
    if ((e.removeChild(n), o && o.nodeType === 8))
      if (((n = o.data), n === "/$")) {
        if (r === 0) {
          e.removeChild(o), Ts(t);
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = o;
  } while (n);
  Ts(t);
}
function tr(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function im(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var Io = Math.random().toString(36).slice(2),
  hn = "__reactFiber$" + Io,
  Ls = "__reactProps$" + Io,
  Nn = "__reactContainer$" + Io,
  hu = "__reactEvents$" + Io,
  xS = "__reactListeners$" + Io,
  SS = "__reactHandles$" + Io;
function br(e) {
  var t = e[hn];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[Nn] || n[hn])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = im(e); e !== null; ) {
          if ((n = e[hn])) return n;
          e = im(e);
        }
      return t;
    }
    (e = n), (n = e.parentNode);
  }
  return null;
}
function Zs(e) {
  return (
    (e = e[hn] || e[Nn]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function so(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(H(33));
}
function Xl(e) {
  return e[Ls] || null;
}
var gu = [],
  io = -1;
function dr(e) {
  return { current: e };
}
function xe(e) {
  0 > io || ((e.current = gu[io]), (gu[io] = null), io--);
}
function ve(e, t) {
  io++, (gu[io] = e.current), (e.current = t);
}
var lr = {},
  tt = dr(lr),
  ht = dr(!1),
  Nr = lr;
function ko(e, t) {
  var n = e.type.contextTypes;
  if (!n) return lr;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var o = {},
    s;
  for (s in n) o[s] = t[s];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = o)),
    o
  );
}
function gt(e) {
  return (e = e.childContextTypes), e != null;
}
function pl() {
  xe(ht), xe(tt);
}
function lm(e, t, n) {
  if (tt.current !== lr) throw Error(H(168));
  ve(tt, t), ve(ht, n);
}
function xy(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(H(108, sx(e) || "Unknown", o));
  return Pe({}, n, r);
}
function ml(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || lr),
    (Nr = tt.current),
    ve(tt, e),
    ve(ht, ht.current),
    !0
  );
}
function am(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(H(169));
  n
    ? ((e = xy(e, t, Nr)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      xe(ht),
      xe(tt),
      ve(tt, e))
    : xe(ht),
    ve(ht, n);
}
var kn = null,
  Ql = !1,
  hc = !1;
function Sy(e) {
  kn === null ? (kn = [e]) : kn.push(e);
}
function bS(e) {
  (Ql = !0), Sy(e);
}
function fr() {
  if (!hc && kn !== null) {
    hc = !0;
    var e = 0,
      t = he;
    try {
      var n = kn;
      for (he = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      (kn = null), (Ql = !1);
    } catch (o) {
      throw (kn !== null && (kn = kn.slice(e + 1)), Yg(Sd, fr), o);
    } finally {
      (he = t), (hc = !1);
    }
  }
  return null;
}
var lo = [],
  ao = 0,
  hl = null,
  gl = 0,
  jt = [],
  $t = 0,
  Or = null,
  _n = 1,
  Rn = "";
function vr(e, t) {
  (lo[ao++] = gl), (lo[ao++] = hl), (hl = e), (gl = t);
}
function by(e, t, n) {
  (jt[$t++] = _n), (jt[$t++] = Rn), (jt[$t++] = Or), (Or = e);
  var r = _n;
  e = Rn;
  var o = 32 - Xt(r) - 1;
  (r &= ~(1 << o)), (n += 1);
  var s = 32 - Xt(t) + o;
  if (30 < s) {
    var i = o - (o % 5);
    (s = (r & ((1 << i) - 1)).toString(32)),
      (r >>= i),
      (o -= i),
      (_n = (1 << (32 - Xt(t) + o)) | (n << o) | r),
      (Rn = s + e);
  } else (_n = (1 << s) | (n << o) | r), (Rn = e);
}
function Td(e) {
  e.return !== null && (vr(e, 1), by(e, 1, 0));
}
function Nd(e) {
  for (; e === hl; )
    (hl = lo[--ao]), (lo[ao] = null), (gl = lo[--ao]), (lo[ao] = null);
  for (; e === Or; )
    (Or = jt[--$t]),
      (jt[$t] = null),
      (Rn = jt[--$t]),
      (jt[$t] = null),
      (_n = jt[--$t]),
      (jt[$t] = null);
}
var Ct = null,
  bt = null,
  Ce = !1,
  qt = null;
function Cy(e, t) {
  var n = Lt(5, null, null, 0);
  (n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n);
}
function cm(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (Ct = e), (bt = tr(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (Ct = e), (bt = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = Or !== null ? { id: _n, overflow: Rn } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = Lt(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (Ct = e),
            (bt = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function yu(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function vu(e) {
  if (Ce) {
    var t = bt;
    if (t) {
      var n = t;
      if (!cm(e, t)) {
        if (yu(e)) throw Error(H(418));
        t = tr(n.nextSibling);
        var r = Ct;
        t && cm(e, t)
          ? Cy(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (Ce = !1), (Ct = e));
      }
    } else {
      if (yu(e)) throw Error(H(418));
      (e.flags = (e.flags & -4097) | 2), (Ce = !1), (Ct = e);
    }
  }
}
function um(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  Ct = e;
}
function ki(e) {
  if (e !== Ct) return !1;
  if (!Ce) return um(e), (Ce = !0), !1;
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !pu(e.type, e.memoizedProps))),
    t && (t = bt))
  ) {
    if (yu(e)) throw (Ey(), Error(H(418)));
    for (; t; ) Cy(e, t), (t = tr(t.nextSibling));
  }
  if ((um(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(H(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              bt = tr(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      bt = null;
    }
  } else bt = Ct ? tr(e.stateNode.nextSibling) : null;
  return !0;
}
function Ey() {
  for (var e = bt; e; ) e = tr(e.nextSibling);
}
function _o() {
  (bt = Ct = null), (Ce = !1);
}
function Od(e) {
  qt === null ? (qt = [e]) : qt.push(e);
}
var CS = An.ReactCurrentBatchConfig;
function os(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(H(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(H(147, e));
      var o = r,
        s = "" + e;
      return t !== null &&
        t.ref !== null &&
        typeof t.ref == "function" &&
        t.ref._stringRef === s
        ? t.ref
        : ((t = function (i) {
            var l = o.refs;
            i === null ? delete l[s] : (l[s] = i);
          }),
          (t._stringRef = s),
          t);
    }
    if (typeof e != "string") throw Error(H(284));
    if (!n._owner) throw Error(H(290, e));
  }
  return e;
}
function _i(e, t) {
  throw (
    ((e = Object.prototype.toString.call(t)),
    Error(
      H(
        31,
        e === "[object Object]"
          ? "object with keys {" + Object.keys(t).join(", ") + "}"
          : e
      )
    ))
  );
}
function dm(e) {
  var t = e._init;
  return t(e._payload);
}
function ky(e) {
  function t(v, w) {
    if (e) {
      var g = v.deletions;
      g === null ? ((v.deletions = [w]), (v.flags |= 16)) : g.push(w);
    }
  }
  function n(v, w) {
    if (!e) return null;
    for (; w !== null; ) t(v, w), (w = w.sibling);
    return null;
  }
  function r(v, w) {
    for (v = new Map(); w !== null; )
      w.key !== null ? v.set(w.key, w) : v.set(w.index, w), (w = w.sibling);
    return v;
  }
  function o(v, w) {
    return (v = sr(v, w)), (v.index = 0), (v.sibling = null), v;
  }
  function s(v, w, g) {
    return (
      (v.index = g),
      e
        ? ((g = v.alternate),
          g !== null
            ? ((g = g.index), g < w ? ((v.flags |= 2), w) : g)
            : ((v.flags |= 2), w))
        : ((v.flags |= 1048576), w)
    );
  }
  function i(v) {
    return e && v.alternate === null && (v.flags |= 2), v;
  }
  function l(v, w, g, b) {
    return w === null || w.tag !== 6
      ? ((w = bc(g, v.mode, b)), (w.return = v), w)
      : ((w = o(w, g)), (w.return = v), w);
  }
  function a(v, w, g, b) {
    var C = g.type;
    return C === to
      ? u(v, w, g.props.children, b, g.key)
      : w !== null &&
        (w.elementType === C ||
          (typeof C == "object" &&
            C !== null &&
            C.$$typeof === Hn &&
            dm(C) === w.type))
      ? ((b = o(w, g.props)), (b.ref = os(v, w, g)), (b.return = v), b)
      : ((b = Ji(g.type, g.key, g.props, null, v.mode, b)),
        (b.ref = os(v, w, g)),
        (b.return = v),
        b);
  }
  function c(v, w, g, b) {
    return w === null ||
      w.tag !== 4 ||
      w.stateNode.containerInfo !== g.containerInfo ||
      w.stateNode.implementation !== g.implementation
      ? ((w = Cc(g, v.mode, b)), (w.return = v), w)
      : ((w = o(w, g.children || [])), (w.return = v), w);
  }
  function u(v, w, g, b, C) {
    return w === null || w.tag !== 7
      ? ((w = Rr(g, v.mode, b, C)), (w.return = v), w)
      : ((w = o(w, g)), (w.return = v), w);
  }
  function d(v, w, g) {
    if ((typeof w == "string" && w !== "") || typeof w == "number")
      return (w = bc("" + w, v.mode, g)), (w.return = v), w;
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case hi:
          return (
            (g = Ji(w.type, w.key, w.props, null, v.mode, g)),
            (g.ref = os(v, null, w)),
            (g.return = v),
            g
          );
        case eo:
          return (w = Cc(w, v.mode, g)), (w.return = v), w;
        case Hn:
          var b = w._init;
          return d(v, b(w._payload), g);
      }
      if (ps(w) || Zo(w))
        return (w = Rr(w, v.mode, g, null)), (w.return = v), w;
      _i(v, w);
    }
    return null;
  }
  function f(v, w, g, b) {
    var C = w !== null ? w.key : null;
    if ((typeof g == "string" && g !== "") || typeof g == "number")
      return C !== null ? null : l(v, w, "" + g, b);
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case hi:
          return g.key === C ? a(v, w, g, b) : null;
        case eo:
          return g.key === C ? c(v, w, g, b) : null;
        case Hn:
          return (C = g._init), f(v, w, C(g._payload), b);
      }
      if (ps(g) || Zo(g)) return C !== null ? null : u(v, w, g, b, null);
      _i(v, g);
    }
    return null;
  }
  function m(v, w, g, b, C) {
    if ((typeof b == "string" && b !== "") || typeof b == "number")
      return (v = v.get(g) || null), l(w, v, "" + b, C);
    if (typeof b == "object" && b !== null) {
      switch (b.$$typeof) {
        case hi:
          return (v = v.get(b.key === null ? g : b.key) || null), a(w, v, b, C);
        case eo:
          return (v = v.get(b.key === null ? g : b.key) || null), c(w, v, b, C);
        case Hn:
          var E = b._init;
          return m(v, w, g, E(b._payload), C);
      }
      if (ps(b) || Zo(b)) return (v = v.get(g) || null), u(w, v, b, C, null);
      _i(w, b);
    }
    return null;
  }
  function p(v, w, g, b) {
    for (
      var C = null, E = null, _ = w, D = (w = 0), L = null;
      _ !== null && D < g.length;
      D++
    ) {
      _.index > D ? ((L = _), (_ = null)) : (L = _.sibling);
      var N = f(v, _, g[D], b);
      if (N === null) {
        _ === null && (_ = L);
        break;
      }
      e && _ && N.alternate === null && t(v, _),
        (w = s(N, w, D)),
        E === null ? (C = N) : (E.sibling = N),
        (E = N),
        (_ = L);
    }
    if (D === g.length) return n(v, _), Ce && vr(v, D), C;
    if (_ === null) {
      for (; D < g.length; D++)
        (_ = d(v, g[D], b)),
          _ !== null &&
            ((w = s(_, w, D)), E === null ? (C = _) : (E.sibling = _), (E = _));
      return Ce && vr(v, D), C;
    }
    for (_ = r(v, _); D < g.length; D++)
      (L = m(_, v, D, g[D], b)),
        L !== null &&
          (e && L.alternate !== null && _.delete(L.key === null ? D : L.key),
          (w = s(L, w, D)),
          E === null ? (C = L) : (E.sibling = L),
          (E = L));
    return (
      e &&
        _.forEach(function (M) {
          return t(v, M);
        }),
      Ce && vr(v, D),
      C
    );
  }
  function h(v, w, g, b) {
    var C = Zo(g);
    if (typeof C != "function") throw Error(H(150));
    if (((g = C.call(g)), g == null)) throw Error(H(151));
    for (
      var E = (C = null), _ = w, D = (w = 0), L = null, N = g.next();
      _ !== null && !N.done;
      D++, N = g.next()
    ) {
      _.index > D ? ((L = _), (_ = null)) : (L = _.sibling);
      var M = f(v, _, N.value, b);
      if (M === null) {
        _ === null && (_ = L);
        break;
      }
      e && _ && M.alternate === null && t(v, _),
        (w = s(M, w, D)),
        E === null ? (C = M) : (E.sibling = M),
        (E = M),
        (_ = L);
    }
    if (N.done) return n(v, _), Ce && vr(v, D), C;
    if (_ === null) {
      for (; !N.done; D++, N = g.next())
        (N = d(v, N.value, b)),
          N !== null &&
            ((w = s(N, w, D)), E === null ? (C = N) : (E.sibling = N), (E = N));
      return Ce && vr(v, D), C;
    }
    for (_ = r(v, _); !N.done; D++, N = g.next())
      (N = m(_, v, D, N.value, b)),
        N !== null &&
          (e && N.alternate !== null && _.delete(N.key === null ? D : N.key),
          (w = s(N, w, D)),
          E === null ? (C = N) : (E.sibling = N),
          (E = N));
    return (
      e &&
        _.forEach(function (B) {
          return t(v, B);
        }),
      Ce && vr(v, D),
      C
    );
  }
  function S(v, w, g, b) {
    if (
      (typeof g == "object" &&
        g !== null &&
        g.type === to &&
        g.key === null &&
        (g = g.props.children),
      typeof g == "object" && g !== null)
    ) {
      switch (g.$$typeof) {
        case hi:
          e: {
            for (var C = g.key, E = w; E !== null; ) {
              if (E.key === C) {
                if (((C = g.type), C === to)) {
                  if (E.tag === 7) {
                    n(v, E.sibling),
                      (w = o(E, g.props.children)),
                      (w.return = v),
                      (v = w);
                    break e;
                  }
                } else if (
                  E.elementType === C ||
                  (typeof C == "object" &&
                    C !== null &&
                    C.$$typeof === Hn &&
                    dm(C) === E.type)
                ) {
                  n(v, E.sibling),
                    (w = o(E, g.props)),
                    (w.ref = os(v, E, g)),
                    (w.return = v),
                    (v = w);
                  break e;
                }
                n(v, E);
                break;
              } else t(v, E);
              E = E.sibling;
            }
            g.type === to
              ? ((w = Rr(g.props.children, v.mode, b, g.key)),
                (w.return = v),
                (v = w))
              : ((b = Ji(g.type, g.key, g.props, null, v.mode, b)),
                (b.ref = os(v, w, g)),
                (b.return = v),
                (v = b));
          }
          return i(v);
        case eo:
          e: {
            for (E = g.key; w !== null; ) {
              if (w.key === E)
                if (
                  w.tag === 4 &&
                  w.stateNode.containerInfo === g.containerInfo &&
                  w.stateNode.implementation === g.implementation
                ) {
                  n(v, w.sibling),
                    (w = o(w, g.children || [])),
                    (w.return = v),
                    (v = w);
                  break e;
                } else {
                  n(v, w);
                  break;
                }
              else t(v, w);
              w = w.sibling;
            }
            (w = Cc(g, v.mode, b)), (w.return = v), (v = w);
          }
          return i(v);
        case Hn:
          return (E = g._init), S(v, w, E(g._payload), b);
      }
      if (ps(g)) return p(v, w, g, b);
      if (Zo(g)) return h(v, w, g, b);
      _i(v, g);
    }
    return (typeof g == "string" && g !== "") || typeof g == "number"
      ? ((g = "" + g),
        w !== null && w.tag === 6
          ? (n(v, w.sibling), (w = o(w, g)), (w.return = v), (v = w))
          : (n(v, w), (w = bc(g, v.mode, b)), (w.return = v), (v = w)),
        i(v))
      : n(v, w);
  }
  return S;
}
var Ro = ky(!0),
  _y = ky(!1),
  yl = dr(null),
  vl = null,
  co = null,
  jd = null;
function $d() {
  jd = co = vl = null;
}
function Ld(e) {
  var t = yl.current;
  xe(yl), (e._currentValue = t);
}
function wu(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function vo(e, t) {
  (vl = e),
    (jd = co = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (ft = !0), (e.firstContext = null));
}
function Mt(e) {
  var t = e._currentValue;
  if (jd !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), co === null)) {
      if (vl === null) throw Error(H(308));
      (co = e), (vl.dependencies = { lanes: 0, firstContext: e });
    } else co = co.next = e;
  return t;
}
var Cr = null;
function Ad(e) {
  Cr === null ? (Cr = [e]) : Cr.push(e);
}
function Ry(e, t, n, r) {
  var o = t.interleaved;
  return (
    o === null ? ((n.next = n), Ad(t)) : ((n.next = o.next), (o.next = n)),
    (t.interleaved = n),
    On(e, r)
  );
}
function On(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    (e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return);
  return n.tag === 3 ? n.stateNode : null;
}
var Un = !1;
function Fd(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Dy(e, t) {
  (e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      });
}
function Dn(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function nr(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), pe & 2)) {
    var o = r.pending;
    return (
      o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
      (r.pending = t),
      On(e, n)
    );
  }
  return (
    (o = r.interleaved),
    o === null ? ((t.next = t), Ad(r)) : ((t.next = o.next), (o.next = t)),
    (r.interleaved = t),
    On(e, n)
  );
}
function Yi(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), bd(e, n);
  }
}
function fm(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var o = null,
      s = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var i = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        s === null ? (o = s = i) : (s = s.next = i), (n = n.next);
      } while (n !== null);
      s === null ? (o = s = t) : (s = s.next = t);
    } else o = s = t;
    (n = {
      baseState: r.baseState,
      firstBaseUpdate: o,
      lastBaseUpdate: s,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n);
    return;
  }
  (e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t);
}
function wl(e, t, n, r) {
  var o = e.updateQueue;
  Un = !1;
  var s = o.firstBaseUpdate,
    i = o.lastBaseUpdate,
    l = o.shared.pending;
  if (l !== null) {
    o.shared.pending = null;
    var a = l,
      c = a.next;
    (a.next = null), i === null ? (s = c) : (i.next = c), (i = a);
    var u = e.alternate;
    u !== null &&
      ((u = u.updateQueue),
      (l = u.lastBaseUpdate),
      l !== i &&
        (l === null ? (u.firstBaseUpdate = c) : (l.next = c),
        (u.lastBaseUpdate = a)));
  }
  if (s !== null) {
    var d = o.baseState;
    (i = 0), (u = c = a = null), (l = s);
    do {
      var f = l.lane,
        m = l.eventTime;
      if ((r & f) === f) {
        u !== null &&
          (u = u.next =
            {
              eventTime: m,
              lane: 0,
              tag: l.tag,
              payload: l.payload,
              callback: l.callback,
              next: null,
            });
        e: {
          var p = e,
            h = l;
          switch (((f = t), (m = n), h.tag)) {
            case 1:
              if (((p = h.payload), typeof p == "function")) {
                d = p.call(m, d, f);
                break e;
              }
              d = p;
              break e;
            case 3:
              p.flags = (p.flags & -65537) | 128;
            case 0:
              if (
                ((p = h.payload),
                (f = typeof p == "function" ? p.call(m, d, f) : p),
                f == null)
              )
                break e;
              d = Pe({}, d, f);
              break e;
            case 2:
              Un = !0;
          }
        }
        l.callback !== null &&
          l.lane !== 0 &&
          ((e.flags |= 64),
          (f = o.effects),
          f === null ? (o.effects = [l]) : f.push(l));
      } else
        (m = {
          eventTime: m,
          lane: f,
          tag: l.tag,
          payload: l.payload,
          callback: l.callback,
          next: null,
        }),
          u === null ? ((c = u = m), (a = d)) : (u = u.next = m),
          (i |= f);
      if (((l = l.next), l === null)) {
        if (((l = o.shared.pending), l === null)) break;
        (f = l),
          (l = f.next),
          (f.next = null),
          (o.lastBaseUpdate = f),
          (o.shared.pending = null);
      }
    } while (!0);
    if (
      (u === null && (a = d),
      (o.baseState = a),
      (o.firstBaseUpdate = c),
      (o.lastBaseUpdate = u),
      (t = o.shared.interleaved),
      t !== null)
    ) {
      o = t;
      do (i |= o.lane), (o = o.next);
      while (o !== t);
    } else s === null && (o.shared.lanes = 0);
    ($r |= i), (e.lanes = i), (e.memoizedState = d);
  }
}
function pm(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        o = r.callback;
      if (o !== null) {
        if (((r.callback = null), (r = n), typeof o != "function"))
          throw Error(H(191, o));
        o.call(r);
      }
    }
}
var ei = {},
  vn = dr(ei),
  As = dr(ei),
  Fs = dr(ei);
function Er(e) {
  if (e === ei) throw Error(H(174));
  return e;
}
function Md(e, t) {
  switch ((ve(Fs, t), ve(As, e), ve(vn, ei), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Zc(null, "");
      break;
    default:
      (e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = Zc(t, e));
  }
  xe(vn), ve(vn, t);
}
function Do() {
  xe(vn), xe(As), xe(Fs);
}
function Py(e) {
  Er(Fs.current);
  var t = Er(vn.current),
    n = Zc(t, e.type);
  t !== n && (ve(As, e), ve(vn, n));
}
function Id(e) {
  As.current === e && (xe(vn), xe(As));
}
var Re = dr(0);
function xl(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (
        n !== null &&
        ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!")
      )
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      (t.child.return = t), (t = t.child);
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    (t.sibling.return = t.return), (t = t.sibling);
  }
  return null;
}
var gc = [];
function zd() {
  for (var e = 0; e < gc.length; e++)
    gc[e]._workInProgressVersionPrimary = null;
  gc.length = 0;
}
var Ki = An.ReactCurrentDispatcher,
  yc = An.ReactCurrentBatchConfig,
  jr = 0,
  De = null,
  ze = null,
  Ve = null,
  Sl = !1,
  Ss = !1,
  Ms = 0,
  ES = 0;
function Xe() {
  throw Error(H(321));
}
function Bd(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!Zt(e[n], t[n])) return !1;
  return !0;
}
function Vd(e, t, n, r, o, s) {
  if (
    ((jr = s),
    (De = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Ki.current = e === null || e.memoizedState === null ? DS : PS),
    (e = n(r, o)),
    Ss)
  ) {
    s = 0;
    do {
      if (((Ss = !1), (Ms = 0), 25 <= s)) throw Error(H(301));
      (s += 1),
        (Ve = ze = null),
        (t.updateQueue = null),
        (Ki.current = TS),
        (e = n(r, o));
    } while (Ss);
  }
  if (
    ((Ki.current = bl),
    (t = ze !== null && ze.next !== null),
    (jr = 0),
    (Ve = ze = De = null),
    (Sl = !1),
    t)
  )
    throw Error(H(300));
  return e;
}
function Hd() {
  var e = Ms !== 0;
  return (Ms = 0), e;
}
function fn() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return Ve === null ? (De.memoizedState = Ve = e) : (Ve = Ve.next = e), Ve;
}
function It() {
  if (ze === null) {
    var e = De.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ze.next;
  var t = Ve === null ? De.memoizedState : Ve.next;
  if (t !== null) (Ve = t), (ze = e);
  else {
    if (e === null) throw Error(H(310));
    (ze = e),
      (e = {
        memoizedState: ze.memoizedState,
        baseState: ze.baseState,
        baseQueue: ze.baseQueue,
        queue: ze.queue,
        next: null,
      }),
      Ve === null ? (De.memoizedState = Ve = e) : (Ve = Ve.next = e);
  }
  return Ve;
}
function Is(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function vc(e) {
  var t = It(),
    n = t.queue;
  if (n === null) throw Error(H(311));
  n.lastRenderedReducer = e;
  var r = ze,
    o = r.baseQueue,
    s = n.pending;
  if (s !== null) {
    if (o !== null) {
      var i = o.next;
      (o.next = s.next), (s.next = i);
    }
    (r.baseQueue = o = s), (n.pending = null);
  }
  if (o !== null) {
    (s = o.next), (r = r.baseState);
    var l = (i = null),
      a = null,
      c = s;
    do {
      var u = c.lane;
      if ((jr & u) === u)
        a !== null &&
          (a = a.next =
            {
              lane: 0,
              action: c.action,
              hasEagerState: c.hasEagerState,
              eagerState: c.eagerState,
              next: null,
            }),
          (r = c.hasEagerState ? c.eagerState : e(r, c.action));
      else {
        var d = {
          lane: u,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        };
        a === null ? ((l = a = d), (i = r)) : (a = a.next = d),
          (De.lanes |= u),
          ($r |= u);
      }
      c = c.next;
    } while (c !== null && c !== s);
    a === null ? (i = r) : (a.next = l),
      Zt(r, t.memoizedState) || (ft = !0),
      (t.memoizedState = r),
      (t.baseState = i),
      (t.baseQueue = a),
      (n.lastRenderedState = r);
  }
  if (((e = n.interleaved), e !== null)) {
    o = e;
    do (s = o.lane), (De.lanes |= s), ($r |= s), (o = o.next);
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function wc(e) {
  var t = It(),
    n = t.queue;
  if (n === null) throw Error(H(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    o = n.pending,
    s = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var i = (o = o.next);
    do (s = e(s, i.action)), (i = i.next);
    while (i !== o);
    Zt(s, t.memoizedState) || (ft = !0),
      (t.memoizedState = s),
      t.baseQueue === null && (t.baseState = s),
      (n.lastRenderedState = s);
  }
  return [s, r];
}
function Ty() {}
function Ny(e, t) {
  var n = De,
    r = It(),
    o = t(),
    s = !Zt(r.memoizedState, o);
  if (
    (s && ((r.memoizedState = o), (ft = !0)),
    (r = r.queue),
    Ud($y.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || s || (Ve !== null && Ve.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      zs(9, jy.bind(null, n, r, o, t), void 0, null),
      He === null)
    )
      throw Error(H(349));
    jr & 30 || Oy(n, t, o);
  }
  return o;
}
function Oy(e, t, n) {
  (e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = De.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (De.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e));
}
function jy(e, t, n, r) {
  (t.value = n), (t.getSnapshot = r), Ly(t) && Ay(e);
}
function $y(e, t, n) {
  return n(function () {
    Ly(t) && Ay(e);
  });
}
function Ly(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Zt(e, n);
  } catch {
    return !0;
  }
}
function Ay(e) {
  var t = On(e, 1);
  t !== null && Qt(t, e, 1, -1);
}
function mm(e) {
  var t = fn();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Is,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = RS.bind(null, De, e)),
    [t.memoizedState, e]
  );
}
function zs(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = De.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (De.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function Fy() {
  return It().memoizedState;
}
function qi(e, t, n, r) {
  var o = fn();
  (De.flags |= e),
    (o.memoizedState = zs(1 | t, n, void 0, r === void 0 ? null : r));
}
function Jl(e, t, n, r) {
  var o = It();
  r = r === void 0 ? null : r;
  var s = void 0;
  if (ze !== null) {
    var i = ze.memoizedState;
    if (((s = i.destroy), r !== null && Bd(r, i.deps))) {
      o.memoizedState = zs(t, n, s, r);
      return;
    }
  }
  (De.flags |= e), (o.memoizedState = zs(1 | t, n, s, r));
}
function hm(e, t) {
  return qi(8390656, 8, e, t);
}
function Ud(e, t) {
  return Jl(2048, 8, e, t);
}
function My(e, t) {
  return Jl(4, 2, e, t);
}
function Iy(e, t) {
  return Jl(4, 4, e, t);
}
function zy(e, t) {
  if (typeof t == "function")
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function By(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null), Jl(4, 4, zy.bind(null, t, e), n)
  );
}
function Wd() {}
function Vy(e, t) {
  var n = It();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Bd(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function Hy(e, t) {
  var n = It();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Bd(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function Uy(e, t, n) {
  return jr & 21
    ? (Zt(n, t) || ((n = Gg()), (De.lanes |= n), ($r |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (ft = !0)), (e.memoizedState = n));
}
function kS(e, t) {
  var n = he;
  (he = n !== 0 && 4 > n ? n : 4), e(!0);
  var r = yc.transition;
  yc.transition = {};
  try {
    e(!1), t();
  } finally {
    (he = n), (yc.transition = r);
  }
}
function Wy() {
  return It().memoizedState;
}
function _S(e, t, n) {
  var r = or(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    Yy(e))
  )
    Ky(t, n);
  else if (((n = Ry(e, t, n, r)), n !== null)) {
    var o = lt();
    Qt(n, e, r, o), qy(n, t, r);
  }
}
function RS(e, t, n) {
  var r = or(e),
    o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Yy(e)) Ky(t, o);
  else {
    var s = e.alternate;
    if (
      e.lanes === 0 &&
      (s === null || s.lanes === 0) &&
      ((s = t.lastRenderedReducer), s !== null)
    )
      try {
        var i = t.lastRenderedState,
          l = s(i, n);
        if (((o.hasEagerState = !0), (o.eagerState = l), Zt(l, i))) {
          var a = t.interleaved;
          a === null
            ? ((o.next = o), Ad(t))
            : ((o.next = a.next), (a.next = o)),
            (t.interleaved = o);
          return;
        }
      } catch {
      } finally {
      }
    (n = Ry(e, t, o, r)),
      n !== null && ((o = lt()), Qt(n, e, r, o), qy(n, t, r));
  }
}
function Yy(e) {
  var t = e.alternate;
  return e === De || (t !== null && t === De);
}
function Ky(e, t) {
  Ss = Sl = !0;
  var n = e.pending;
  n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t);
}
function qy(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), bd(e, n);
  }
}
var bl = {
    readContext: Mt,
    useCallback: Xe,
    useContext: Xe,
    useEffect: Xe,
    useImperativeHandle: Xe,
    useInsertionEffect: Xe,
    useLayoutEffect: Xe,
    useMemo: Xe,
    useReducer: Xe,
    useRef: Xe,
    useState: Xe,
    useDebugValue: Xe,
    useDeferredValue: Xe,
    useTransition: Xe,
    useMutableSource: Xe,
    useSyncExternalStore: Xe,
    useId: Xe,
    unstable_isNewReconciler: !1,
  },
  DS = {
    readContext: Mt,
    useCallback: function (e, t) {
      return (fn().memoizedState = [e, t === void 0 ? null : t]), e;
    },
    useContext: Mt,
    useEffect: hm,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        qi(4194308, 4, zy.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return qi(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return qi(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = fn();
      return (
        (t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e
      );
    },
    useReducer: function (e, t, n) {
      var r = fn();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = _S.bind(null, De, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = fn();
      return (e = { current: e }), (t.memoizedState = e);
    },
    useState: mm,
    useDebugValue: Wd,
    useDeferredValue: function (e) {
      return (fn().memoizedState = e);
    },
    useTransition: function () {
      var e = mm(!1),
        t = e[0];
      return (e = kS.bind(null, e[1])), (fn().memoizedState = e), [t, e];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = De,
        o = fn();
      if (Ce) {
        if (n === void 0) throw Error(H(407));
        n = n();
      } else {
        if (((n = t()), He === null)) throw Error(H(349));
        jr & 30 || Oy(r, t, n);
      }
      o.memoizedState = n;
      var s = { value: n, getSnapshot: t };
      return (
        (o.queue = s),
        hm($y.bind(null, r, s, e), [e]),
        (r.flags |= 2048),
        zs(9, jy.bind(null, r, s, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = fn(),
        t = He.identifierPrefix;
      if (Ce) {
        var n = Rn,
          r = _n;
        (n = (r & ~(1 << (32 - Xt(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Ms++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":");
      } else (n = ES++), (t = ":" + t + "r" + n.toString(32) + ":");
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  PS = {
    readContext: Mt,
    useCallback: Vy,
    useContext: Mt,
    useEffect: Ud,
    useImperativeHandle: By,
    useInsertionEffect: My,
    useLayoutEffect: Iy,
    useMemo: Hy,
    useReducer: vc,
    useRef: Fy,
    useState: function () {
      return vc(Is);
    },
    useDebugValue: Wd,
    useDeferredValue: function (e) {
      var t = It();
      return Uy(t, ze.memoizedState, e);
    },
    useTransition: function () {
      var e = vc(Is)[0],
        t = It().memoizedState;
      return [e, t];
    },
    useMutableSource: Ty,
    useSyncExternalStore: Ny,
    useId: Wy,
    unstable_isNewReconciler: !1,
  },
  TS = {
    readContext: Mt,
    useCallback: Vy,
    useContext: Mt,
    useEffect: Ud,
    useImperativeHandle: By,
    useInsertionEffect: My,
    useLayoutEffect: Iy,
    useMemo: Hy,
    useReducer: wc,
    useRef: Fy,
    useState: function () {
      return wc(Is);
    },
    useDebugValue: Wd,
    useDeferredValue: function (e) {
      var t = It();
      return ze === null ? (t.memoizedState = e) : Uy(t, ze.memoizedState, e);
    },
    useTransition: function () {
      var e = wc(Is)[0],
        t = It().memoizedState;
      return [e, t];
    },
    useMutableSource: Ty,
    useSyncExternalStore: Ny,
    useId: Wy,
    unstable_isNewReconciler: !1,
  };
function Yt(e, t) {
  if (e && e.defaultProps) {
    (t = Pe({}, t)), (e = e.defaultProps);
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function xu(e, t, n, r) {
  (t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : Pe({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Zl = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? Vr(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = lt(),
      o = or(e),
      s = Dn(r, o);
    (s.payload = t),
      n != null && (s.callback = n),
      (t = nr(e, s, o)),
      t !== null && (Qt(t, e, o, r), Yi(t, e, o));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = lt(),
      o = or(e),
      s = Dn(r, o);
    (s.tag = 1),
      (s.payload = t),
      n != null && (s.callback = n),
      (t = nr(e, s, o)),
      t !== null && (Qt(t, e, o, r), Yi(t, e, o));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = lt(),
      r = or(e),
      o = Dn(n, r);
    (o.tag = 2),
      t != null && (o.callback = t),
      (t = nr(e, o, r)),
      t !== null && (Qt(t, e, r, n), Yi(t, e, r));
  },
};
function gm(e, t, n, r, o, s, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, s, i)
      : t.prototype && t.prototype.isPureReactComponent
      ? !Os(n, r) || !Os(o, s)
      : !0
  );
}
function Gy(e, t, n) {
  var r = !1,
    o = lr,
    s = t.contextType;
  return (
    typeof s == "object" && s !== null
      ? (s = Mt(s))
      : ((o = gt(t) ? Nr : tt.current),
        (r = t.contextTypes),
        (s = (r = r != null) ? ko(e, o) : lr)),
    (t = new t(n, s)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Zl),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = o),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    t
  );
}
function ym(e, t, n, r) {
  (e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Zl.enqueueReplaceState(t, t.state, null);
}
function Su(e, t, n, r) {
  var o = e.stateNode;
  (o.props = n), (o.state = e.memoizedState), (o.refs = {}), Fd(e);
  var s = t.contextType;
  typeof s == "object" && s !== null
    ? (o.context = Mt(s))
    : ((s = gt(t) ? Nr : tt.current), (o.context = ko(e, s))),
    (o.state = e.memoizedState),
    (s = t.getDerivedStateFromProps),
    typeof s == "function" && (xu(e, t, s, n), (o.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof o.getSnapshotBeforeUpdate == "function" ||
      (typeof o.UNSAFE_componentWillMount != "function" &&
        typeof o.componentWillMount != "function") ||
      ((t = o.state),
      typeof o.componentWillMount == "function" && o.componentWillMount(),
      typeof o.UNSAFE_componentWillMount == "function" &&
        o.UNSAFE_componentWillMount(),
      t !== o.state && Zl.enqueueReplaceState(o, o.state, null),
      wl(e, n, o, r),
      (o.state = e.memoizedState)),
    typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function Po(e, t) {
  try {
    var n = "",
      r = t;
    do (n += ox(r)), (r = r.return);
    while (r);
    var o = n;
  } catch (s) {
    o =
      `
Error generating stack: ` +
      s.message +
      `
` +
      s.stack;
  }
  return { value: e, source: t, stack: o, digest: null };
}
function xc(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function bu(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var NS = typeof WeakMap == "function" ? WeakMap : Map;
function Xy(e, t, n) {
  (n = Dn(-1, n)), (n.tag = 3), (n.payload = { element: null });
  var r = t.value;
  return (
    (n.callback = function () {
      El || ((El = !0), (Ou = r)), bu(e, t);
    }),
    n
  );
}
function Qy(e, t, n) {
  (n = Dn(-1, n)), (n.tag = 3);
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    (n.payload = function () {
      return r(o);
    }),
      (n.callback = function () {
        bu(e, t);
      });
  }
  var s = e.stateNode;
  return (
    s !== null &&
      typeof s.componentDidCatch == "function" &&
      (n.callback = function () {
        bu(e, t),
          typeof r != "function" &&
            (rr === null ? (rr = new Set([this])) : rr.add(this));
        var i = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: i !== null ? i : "",
        });
      }),
    n
  );
}
function vm(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new NS();
    var o = new Set();
    r.set(t, o);
  } else (o = r.get(t)), o === void 0 && ((o = new Set()), r.set(t, o));
  o.has(n) || (o.add(n), (e = WS.bind(null, e, t, n)), t.then(e, e));
}
function wm(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) &&
        ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function xm(e, t, n, r, o) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = o), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null
              ? (n.tag = 17)
              : ((t = Dn(-1, 1)), (t.tag = 2), nr(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var OS = An.ReactCurrentOwner,
  ft = !1;
function st(e, t, n, r) {
  t.child = e === null ? _y(t, null, n, r) : Ro(t, e.child, n, r);
}
function Sm(e, t, n, r, o) {
  n = n.render;
  var s = t.ref;
  return (
    vo(t, o),
    (r = Vd(e, t, n, r, s, o)),
    (n = Hd()),
    e !== null && !ft
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        jn(e, t, o))
      : (Ce && n && Td(t), (t.flags |= 1), st(e, t, r, o), t.child)
  );
}
function bm(e, t, n, r, o) {
  if (e === null) {
    var s = n.type;
    return typeof s == "function" &&
      !Zd(s) &&
      s.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = s), Jy(e, t, s, r, o))
      : ((e = Ji(n.type, null, r, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((s = e.child), !(e.lanes & o))) {
    var i = s.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Os), n(i, r) && e.ref === t.ref)
    )
      return jn(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = sr(s, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function Jy(e, t, n, r, o) {
  if (e !== null) {
    var s = e.memoizedProps;
    if (Os(s, r) && e.ref === t.ref)
      if (((ft = !1), (t.pendingProps = r = s), (e.lanes & o) !== 0))
        e.flags & 131072 && (ft = !0);
      else return (t.lanes = e.lanes), jn(e, t, o);
  }
  return Cu(e, t, n, r, o);
}
function Zy(e, t, n) {
  var r = t.pendingProps,
    o = r.children,
    s = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        ve(fo, St),
        (St |= n);
    else {
      if (!(n & 1073741824))
        return (
          (e = s !== null ? s.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = {
            baseLanes: e,
            cachePool: null,
            transitions: null,
          }),
          (t.updateQueue = null),
          ve(fo, St),
          (St |= e),
          null
        );
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = s !== null ? s.baseLanes : n),
        ve(fo, St),
        (St |= r);
    }
  else
    s !== null ? ((r = s.baseLanes | n), (t.memoizedState = null)) : (r = n),
      ve(fo, St),
      (St |= r);
  return st(e, t, o, n), t.child;
}
function ev(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function Cu(e, t, n, r, o) {
  var s = gt(n) ? Nr : tt.current;
  return (
    (s = ko(t, s)),
    vo(t, o),
    (n = Vd(e, t, n, r, s, o)),
    (r = Hd()),
    e !== null && !ft
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        jn(e, t, o))
      : (Ce && r && Td(t), (t.flags |= 1), st(e, t, n, o), t.child)
  );
}
function Cm(e, t, n, r, o) {
  if (gt(n)) {
    var s = !0;
    ml(t);
  } else s = !1;
  if ((vo(t, o), t.stateNode === null))
    Gi(e, t), Gy(t, n, r), Su(t, n, r, o), (r = !0);
  else if (e === null) {
    var i = t.stateNode,
      l = t.memoizedProps;
    i.props = l;
    var a = i.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = Mt(c))
      : ((c = gt(n) ? Nr : tt.current), (c = ko(t, c)));
    var u = n.getDerivedStateFromProps,
      d =
        typeof u == "function" ||
        typeof i.getSnapshotBeforeUpdate == "function";
    d ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== r || a !== c) && ym(t, i, r, c)),
      (Un = !1);
    var f = t.memoizedState;
    (i.state = f),
      wl(t, r, i, o),
      (a = t.memoizedState),
      l !== r || f !== a || ht.current || Un
        ? (typeof u == "function" && (xu(t, n, u, r), (a = t.memoizedState)),
          (l = Un || gm(t, n, l, r, f, a, c))
            ? (d ||
                (typeof i.UNSAFE_componentWillMount != "function" &&
                  typeof i.componentWillMount != "function") ||
                (typeof i.componentWillMount == "function" &&
                  i.componentWillMount(),
                typeof i.UNSAFE_componentWillMount == "function" &&
                  i.UNSAFE_componentWillMount()),
              typeof i.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof i.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = a)),
          (i.props = r),
          (i.state = a),
          (i.context = c),
          (r = l))
        : (typeof i.componentDidMount == "function" && (t.flags |= 4194308),
          (r = !1));
  } else {
    (i = t.stateNode),
      Dy(e, t),
      (l = t.memoizedProps),
      (c = t.type === t.elementType ? l : Yt(t.type, l)),
      (i.props = c),
      (d = t.pendingProps),
      (f = i.context),
      (a = n.contextType),
      typeof a == "object" && a !== null
        ? (a = Mt(a))
        : ((a = gt(n) ? Nr : tt.current), (a = ko(t, a)));
    var m = n.getDerivedStateFromProps;
    (u =
      typeof m == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function") ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== d || f !== a) && ym(t, i, r, a)),
      (Un = !1),
      (f = t.memoizedState),
      (i.state = f),
      wl(t, r, i, o);
    var p = t.memoizedState;
    l !== d || f !== p || ht.current || Un
      ? (typeof m == "function" && (xu(t, n, m, r), (p = t.memoizedState)),
        (c = Un || gm(t, n, c, r, f, p, a) || !1)
          ? (u ||
              (typeof i.UNSAFE_componentWillUpdate != "function" &&
                typeof i.componentWillUpdate != "function") ||
              (typeof i.componentWillUpdate == "function" &&
                i.componentWillUpdate(r, p, a),
              typeof i.UNSAFE_componentWillUpdate == "function" &&
                i.UNSAFE_componentWillUpdate(r, p, a)),
            typeof i.componentDidUpdate == "function" && (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof i.componentDidUpdate != "function" ||
              (l === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate != "function" ||
              (l === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = p)),
        (i.props = r),
        (i.state = p),
        (i.context = a),
        (r = c))
      : (typeof i.componentDidUpdate != "function" ||
          (l === e.memoizedProps && f === e.memoizedState) ||
          (t.flags |= 4),
        typeof i.getSnapshotBeforeUpdate != "function" ||
          (l === e.memoizedProps && f === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return Eu(e, t, n, r, s, o);
}
function Eu(e, t, n, r, o, s) {
  ev(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return o && am(t, n, !1), jn(e, t, s);
  (r = t.stateNode), (OS.current = t);
  var l =
    i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && i
      ? ((t.child = Ro(t, e.child, null, s)), (t.child = Ro(t, null, l, s)))
      : st(e, t, l, s),
    (t.memoizedState = r.state),
    o && am(t, n, !0),
    t.child
  );
}
function tv(e) {
  var t = e.stateNode;
  t.pendingContext
    ? lm(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && lm(e, t.context, !1),
    Md(e, t.containerInfo);
}
function Em(e, t, n, r, o) {
  return _o(), Od(o), (t.flags |= 256), st(e, t, n, r), t.child;
}
var ku = { dehydrated: null, treeContext: null, retryLane: 0 };
function _u(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function nv(e, t, n) {
  var r = t.pendingProps,
    o = Re.current,
    s = !1,
    i = (t.flags & 128) !== 0,
    l;
  if (
    ((l = i) ||
      (l = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
    l
      ? ((s = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (o |= 1),
    ve(Re, o & 1),
    e === null)
  )
    return (
      vu(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1
            ? e.data === "$!"
              ? (t.lanes = 8)
              : (t.lanes = 1073741824)
            : (t.lanes = 1),
          null)
        : ((i = r.children),
          (e = r.fallback),
          s
            ? ((r = t.mode),
              (s = t.child),
              (i = { mode: "hidden", children: i }),
              !(r & 1) && s !== null
                ? ((s.childLanes = 0), (s.pendingProps = i))
                : (s = na(i, r, 0, null)),
              (e = Rr(e, r, n, null)),
              (s.return = t),
              (e.return = t),
              (s.sibling = e),
              (t.child = s),
              (t.child.memoizedState = _u(n)),
              (t.memoizedState = ku),
              e)
            : Yd(t, i))
    );
  if (((o = e.memoizedState), o !== null && ((l = o.dehydrated), l !== null)))
    return jS(e, t, i, r, l, o, n);
  if (s) {
    (s = r.fallback), (i = t.mode), (o = e.child), (l = o.sibling);
    var a = { mode: "hidden", children: r.children };
    return (
      !(i & 1) && t.child !== o
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = a),
          (t.deletions = null))
        : ((r = sr(o, a)), (r.subtreeFlags = o.subtreeFlags & 14680064)),
      l !== null ? (s = sr(l, s)) : ((s = Rr(s, i, n, null)), (s.flags |= 2)),
      (s.return = t),
      (r.return = t),
      (r.sibling = s),
      (t.child = r),
      (r = s),
      (s = t.child),
      (i = e.child.memoizedState),
      (i =
        i === null
          ? _u(n)
          : {
              baseLanes: i.baseLanes | n,
              cachePool: null,
              transitions: i.transitions,
            }),
      (s.memoizedState = i),
      (s.childLanes = e.childLanes & ~n),
      (t.memoizedState = ku),
      r
    );
  }
  return (
    (s = e.child),
    (e = s.sibling),
    (r = sr(s, { mode: "visible", children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions),
      n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function Yd(e, t) {
  return (
    (t = na({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Ri(e, t, n, r) {
  return (
    r !== null && Od(r),
    Ro(t, e.child, null, n),
    (e = Yd(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function jS(e, t, n, r, o, s, i) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = xc(Error(H(422)))), Ri(e, t, i, r))
      : t.memoizedState !== null
      ? ((t.child = e.child), (t.flags |= 128), null)
      : ((s = r.fallback),
        (o = t.mode),
        (r = na({ mode: "visible", children: r.children }, o, 0, null)),
        (s = Rr(s, o, i, null)),
        (s.flags |= 2),
        (r.return = t),
        (s.return = t),
        (r.sibling = s),
        (t.child = r),
        t.mode & 1 && Ro(t, e.child, null, i),
        (t.child.memoizedState = _u(i)),
        (t.memoizedState = ku),
        s);
  if (!(t.mode & 1)) return Ri(e, t, i, null);
  if (o.data === "$!") {
    if (((r = o.nextSibling && o.nextSibling.dataset), r)) var l = r.dgst;
    return (r = l), (s = Error(H(419))), (r = xc(s, r, void 0)), Ri(e, t, i, r);
  }
  if (((l = (i & e.childLanes) !== 0), ft || l)) {
    if (((r = He), r !== null)) {
      switch (i & -i) {
        case 4:
          o = 2;
          break;
        case 16:
          o = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          o = 32;
          break;
        case 536870912:
          o = 268435456;
          break;
        default:
          o = 0;
      }
      (o = o & (r.suspendedLanes | i) ? 0 : o),
        o !== 0 &&
          o !== s.retryLane &&
          ((s.retryLane = o), On(e, o), Qt(r, e, o, -1));
    }
    return Jd(), (r = xc(Error(H(421)))), Ri(e, t, i, r);
  }
  return o.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = YS.bind(null, e)),
      (o._reactRetry = t),
      null)
    : ((e = s.treeContext),
      (bt = tr(o.nextSibling)),
      (Ct = t),
      (Ce = !0),
      (qt = null),
      e !== null &&
        ((jt[$t++] = _n),
        (jt[$t++] = Rn),
        (jt[$t++] = Or),
        (_n = e.id),
        (Rn = e.overflow),
        (Or = t)),
      (t = Yd(t, r.children)),
      (t.flags |= 4096),
      t);
}
function km(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), wu(e.return, t, n);
}
function Sc(e, t, n, r, o) {
  var s = e.memoizedState;
  s === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: o,
      })
    : ((s.isBackwards = t),
      (s.rendering = null),
      (s.renderingStartTime = 0),
      (s.last = r),
      (s.tail = n),
      (s.tailMode = o));
}
function rv(e, t, n) {
  var r = t.pendingProps,
    o = r.revealOrder,
    s = r.tail;
  if ((st(e, t, r.children, n), (r = Re.current), r & 2))
    (r = (r & 1) | 2), (t.flags |= 128);
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && km(e, n, t);
        else if (e.tag === 19) km(e, n, t);
        else if (e.child !== null) {
          (e.child.return = e), (e = e.child);
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        (e.sibling.return = e.return), (e = e.sibling);
      }
    r &= 1;
  }
  if ((ve(Re, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (o) {
      case "forwards":
        for (n = t.child, o = null; n !== null; )
          (e = n.alternate),
            e !== null && xl(e) === null && (o = n),
            (n = n.sibling);
        (n = o),
          n === null
            ? ((o = t.child), (t.child = null))
            : ((o = n.sibling), (n.sibling = null)),
          Sc(t, !1, o, n, s);
        break;
      case "backwards":
        for (n = null, o = t.child, t.child = null; o !== null; ) {
          if (((e = o.alternate), e !== null && xl(e) === null)) {
            t.child = o;
            break;
          }
          (e = o.sibling), (o.sibling = n), (n = o), (o = e);
        }
        Sc(t, !0, n, null, s);
        break;
      case "together":
        Sc(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Gi(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function jn(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    ($r |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(H(153));
  if (t.child !== null) {
    for (
      e = t.child, n = sr(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;

    )
      (e = e.sibling), (n = n.sibling = sr(e, e.pendingProps)), (n.return = t);
    n.sibling = null;
  }
  return t.child;
}
function $S(e, t, n) {
  switch (t.tag) {
    case 3:
      tv(t), _o();
      break;
    case 5:
      Py(t);
      break;
    case 1:
      gt(t.type) && ml(t);
      break;
    case 4:
      Md(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        o = t.memoizedProps.value;
      ve(yl, r._currentValue), (r._currentValue = o);
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (ve(Re, Re.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
          ? nv(e, t, n)
          : (ve(Re, Re.current & 1),
            (e = jn(e, t, n)),
            e !== null ? e.sibling : null);
      ve(Re, Re.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return rv(e, t, n);
        t.flags |= 128;
      }
      if (
        ((o = t.memoizedState),
        o !== null &&
          ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
        ve(Re, Re.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return (t.lanes = 0), Zy(e, t, n);
  }
  return jn(e, t, n);
}
var ov, Ru, sv, iv;
ov = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      (n.child.return = n), (n = n.child);
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    (n.sibling.return = n.return), (n = n.sibling);
  }
};
Ru = function () {};
sv = function (e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    (e = t.stateNode), Er(vn.current);
    var s = null;
    switch (n) {
      case "input":
        (o = Gc(e, o)), (r = Gc(e, r)), (s = []);
        break;
      case "select":
        (o = Pe({}, o, { value: void 0 })),
          (r = Pe({}, r, { value: void 0 })),
          (s = []);
        break;
      case "textarea":
        (o = Jc(e, o)), (r = Jc(e, r)), (s = []);
        break;
      default:
        typeof o.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = fl);
    }
    eu(n, r);
    var i;
    n = null;
    for (c in o)
      if (!r.hasOwnProperty(c) && o.hasOwnProperty(c) && o[c] != null)
        if (c === "style") {
          var l = o[c];
          for (i in l) l.hasOwnProperty(i) && (n || (n = {}), (n[i] = ""));
        } else
          c !== "dangerouslySetInnerHTML" &&
            c !== "children" &&
            c !== "suppressContentEditableWarning" &&
            c !== "suppressHydrationWarning" &&
            c !== "autoFocus" &&
            (ks.hasOwnProperty(c)
              ? s || (s = [])
              : (s = s || []).push(c, null));
    for (c in r) {
      var a = r[c];
      if (
        ((l = o != null ? o[c] : void 0),
        r.hasOwnProperty(c) && a !== l && (a != null || l != null))
      )
        if (c === "style")
          if (l) {
            for (i in l)
              !l.hasOwnProperty(i) ||
                (a && a.hasOwnProperty(i)) ||
                (n || (n = {}), (n[i] = ""));
            for (i in a)
              a.hasOwnProperty(i) &&
                l[i] !== a[i] &&
                (n || (n = {}), (n[i] = a[i]));
          } else n || (s || (s = []), s.push(c, n)), (n = a);
        else
          c === "dangerouslySetInnerHTML"
            ? ((a = a ? a.__html : void 0),
              (l = l ? l.__html : void 0),
              a != null && l !== a && (s = s || []).push(c, a))
            : c === "children"
            ? (typeof a != "string" && typeof a != "number") ||
              (s = s || []).push(c, "" + a)
            : c !== "suppressContentEditableWarning" &&
              c !== "suppressHydrationWarning" &&
              (ks.hasOwnProperty(c)
                ? (a != null && c === "onScroll" && we("scroll", e),
                  s || l === a || (s = []))
                : (s = s || []).push(c, a));
    }
    n && (s = s || []).push("style", n);
    var c = s;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
iv = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function ss(e, t) {
  if (!Ce)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; )
          t.alternate !== null && (n = t), (t = t.sibling);
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null; )
          n.alternate !== null && (r = n), (n = n.sibling);
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function Qe(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var o = e.child; o !== null; )
      (n |= o.lanes | o.childLanes),
        (r |= o.subtreeFlags & 14680064),
        (r |= o.flags & 14680064),
        (o.return = e),
        (o = o.sibling);
  else
    for (o = e.child; o !== null; )
      (n |= o.lanes | o.childLanes),
        (r |= o.subtreeFlags),
        (r |= o.flags),
        (o.return = e),
        (o = o.sibling);
  return (e.subtreeFlags |= r), (e.childLanes = n), t;
}
function LS(e, t, n) {
  var r = t.pendingProps;
  switch ((Nd(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Qe(t), null;
    case 1:
      return gt(t.type) && pl(), Qe(t), null;
    case 3:
      return (
        (r = t.stateNode),
        Do(),
        xe(ht),
        xe(tt),
        zd(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (ki(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), qt !== null && (Lu(qt), (qt = null)))),
        Ru(e, t),
        Qe(t),
        null
      );
    case 5:
      Id(t);
      var o = Er(Fs.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        sv(e, t, n, r, o),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(H(166));
          return Qe(t), null;
        }
        if (((e = Er(vn.current)), ki(t))) {
          (r = t.stateNode), (n = t.type);
          var s = t.memoizedProps;
          switch (((r[hn] = t), (r[Ls] = s), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              we("cancel", r), we("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              we("load", r);
              break;
            case "video":
            case "audio":
              for (o = 0; o < hs.length; o++) we(hs[o], r);
              break;
            case "source":
              we("error", r);
              break;
            case "img":
            case "image":
            case "link":
              we("error", r), we("load", r);
              break;
            case "details":
              we("toggle", r);
              break;
            case "input":
              $p(r, s), we("invalid", r);
              break;
            case "select":
              (r._wrapperState = { wasMultiple: !!s.multiple }),
                we("invalid", r);
              break;
            case "textarea":
              Ap(r, s), we("invalid", r);
          }
          eu(n, s), (o = null);
          for (var i in s)
            if (s.hasOwnProperty(i)) {
              var l = s[i];
              i === "children"
                ? typeof l == "string"
                  ? r.textContent !== l &&
                    (s.suppressHydrationWarning !== !0 &&
                      Ei(r.textContent, l, e),
                    (o = ["children", l]))
                  : typeof l == "number" &&
                    r.textContent !== "" + l &&
                    (s.suppressHydrationWarning !== !0 &&
                      Ei(r.textContent, l, e),
                    (o = ["children", "" + l]))
                : ks.hasOwnProperty(i) &&
                  l != null &&
                  i === "onScroll" &&
                  we("scroll", r);
            }
          switch (n) {
            case "input":
              gi(r), Lp(r, s, !0);
              break;
            case "textarea":
              gi(r), Fp(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof s.onClick == "function" && (r.onclick = fl);
          }
          (r = o), (t.updateQueue = r), r !== null && (t.flags |= 4);
        } else {
          (i = o.nodeType === 9 ? o : o.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = $g(n)),
            e === "http://www.w3.org/1999/xhtml"
              ? n === "script"
                ? ((e = i.createElement("div")),
                  (e.innerHTML = "<script></script>"),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == "string"
                ? (e = i.createElement(n, { is: r.is }))
                : ((e = i.createElement(n)),
                  n === "select" &&
                    ((i = e),
                    r.multiple
                      ? (i.multiple = !0)
                      : r.size && (i.size = r.size)))
              : (e = i.createElementNS(e, n)),
            (e[hn] = t),
            (e[Ls] = r),
            ov(e, t, !1, !1),
            (t.stateNode = e);
          e: {
            switch (((i = tu(n, r)), n)) {
              case "dialog":
                we("cancel", e), we("close", e), (o = r);
                break;
              case "iframe":
              case "object":
              case "embed":
                we("load", e), (o = r);
                break;
              case "video":
              case "audio":
                for (o = 0; o < hs.length; o++) we(hs[o], e);
                o = r;
                break;
              case "source":
                we("error", e), (o = r);
                break;
              case "img":
              case "image":
              case "link":
                we("error", e), we("load", e), (o = r);
                break;
              case "details":
                we("toggle", e), (o = r);
                break;
              case "input":
                $p(e, r), (o = Gc(e, r)), we("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                (e._wrapperState = { wasMultiple: !!r.multiple }),
                  (o = Pe({}, r, { value: void 0 })),
                  we("invalid", e);
                break;
              case "textarea":
                Ap(e, r), (o = Jc(e, r)), we("invalid", e);
                break;
              default:
                o = r;
            }
            eu(n, o), (l = o);
            for (s in l)
              if (l.hasOwnProperty(s)) {
                var a = l[s];
                s === "style"
                  ? Fg(e, a)
                  : s === "dangerouslySetInnerHTML"
                  ? ((a = a ? a.__html : void 0), a != null && Lg(e, a))
                  : s === "children"
                  ? typeof a == "string"
                    ? (n !== "textarea" || a !== "") && _s(e, a)
                    : typeof a == "number" && _s(e, "" + a)
                  : s !== "suppressContentEditableWarning" &&
                    s !== "suppressHydrationWarning" &&
                    s !== "autoFocus" &&
                    (ks.hasOwnProperty(s)
                      ? a != null && s === "onScroll" && we("scroll", e)
                      : a != null && gd(e, s, a, i));
              }
            switch (n) {
              case "input":
                gi(e), Lp(e, r, !1);
                break;
              case "textarea":
                gi(e), Fp(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + ir(r.value));
                break;
              case "select":
                (e.multiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? mo(e, !!r.multiple, s, !1)
                    : r.defaultValue != null &&
                      mo(e, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = fl);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return Qe(t), null;
    case 6:
      if (e && t.stateNode != null) iv(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(H(166));
        if (((n = Er(Fs.current)), Er(vn.current), ki(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[hn] = t),
            (s = r.nodeValue !== n) && ((e = Ct), e !== null))
          )
            switch (e.tag) {
              case 3:
                Ei(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Ei(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          s && (t.flags |= 4);
        } else
          (r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[hn] = t),
            (t.stateNode = r);
      }
      return Qe(t), null;
    case 13:
      if (
        (xe(Re),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (Ce && bt !== null && t.mode & 1 && !(t.flags & 128))
          Ey(), _o(), (t.flags |= 98560), (s = !1);
        else if (((s = ki(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!s) throw Error(H(318));
            if (
              ((s = t.memoizedState),
              (s = s !== null ? s.dehydrated : null),
              !s)
            )
              throw Error(H(317));
            s[hn] = t;
          } else
            _o(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4);
          Qe(t), (s = !1);
        } else qt !== null && (Lu(qt), (qt = null)), (s = !0);
        if (!s) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || Re.current & 1 ? Be === 0 && (Be = 3) : Jd())),
          t.updateQueue !== null && (t.flags |= 4),
          Qe(t),
          null);
    case 4:
      return (
        Do(), Ru(e, t), e === null && js(t.stateNode.containerInfo), Qe(t), null
      );
    case 10:
      return Ld(t.type._context), Qe(t), null;
    case 17:
      return gt(t.type) && pl(), Qe(t), null;
    case 19:
      if ((xe(Re), (s = t.memoizedState), s === null)) return Qe(t), null;
      if (((r = (t.flags & 128) !== 0), (i = s.rendering), i === null))
        if (r) ss(s, !1);
        else {
          if (Be !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((i = xl(e)), i !== null)) {
                for (
                  t.flags |= 128,
                    ss(s, !1),
                    r = i.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;

                )
                  (s = n),
                    (e = r),
                    (s.flags &= 14680066),
                    (i = s.alternate),
                    i === null
                      ? ((s.childLanes = 0),
                        (s.lanes = e),
                        (s.child = null),
                        (s.subtreeFlags = 0),
                        (s.memoizedProps = null),
                        (s.memoizedState = null),
                        (s.updateQueue = null),
                        (s.dependencies = null),
                        (s.stateNode = null))
                      : ((s.childLanes = i.childLanes),
                        (s.lanes = i.lanes),
                        (s.child = i.child),
                        (s.subtreeFlags = 0),
                        (s.deletions = null),
                        (s.memoizedProps = i.memoizedProps),
                        (s.memoizedState = i.memoizedState),
                        (s.updateQueue = i.updateQueue),
                        (s.type = i.type),
                        (e = i.dependencies),
                        (s.dependencies =
                          e === null
                            ? null
                            : {
                                lanes: e.lanes,
                                firstContext: e.firstContext,
                              })),
                    (n = n.sibling);
                return ve(Re, (Re.current & 1) | 2), t.child;
              }
              e = e.sibling;
            }
          s.tail !== null &&
            $e() > To &&
            ((t.flags |= 128), (r = !0), ss(s, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = xl(i)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              ss(s, !0),
              s.tail === null && s.tailMode === "hidden" && !i.alternate && !Ce)
            )
              return Qe(t), null;
          } else
            2 * $e() - s.renderingStartTime > To &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), ss(s, !1), (t.lanes = 4194304));
        s.isBackwards
          ? ((i.sibling = t.child), (t.child = i))
          : ((n = s.last),
            n !== null ? (n.sibling = i) : (t.child = i),
            (s.last = i));
      }
      return s.tail !== null
        ? ((t = s.tail),
          (s.rendering = t),
          (s.tail = t.sibling),
          (s.renderingStartTime = $e()),
          (t.sibling = null),
          (n = Re.current),
          ve(Re, r ? (n & 1) | 2 : n & 1),
          t)
        : (Qe(t), null);
    case 22:
    case 23:
      return (
        Qd(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? St & 1073741824 && (Qe(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Qe(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(H(156, t.tag));
}
function AS(e, t) {
  switch ((Nd(t), t.tag)) {
    case 1:
      return (
        gt(t.type) && pl(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        Do(),
        xe(ht),
        xe(tt),
        zd(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return Id(t), null;
    case 13:
      if (
        (xe(Re), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(H(340));
        _o();
      }
      return (
        (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return xe(Re), null;
    case 4:
      return Do(), null;
    case 10:
      return Ld(t.type._context), null;
    case 22:
    case 23:
      return Qd(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Di = !1,
  Je = !1,
  FS = typeof WeakSet == "function" ? WeakSet : Set,
  q = null;
function uo(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        Ne(e, t, r);
      }
    else n.current = null;
}
function Du(e, t, n) {
  try {
    n();
  } catch (r) {
    Ne(e, t, r);
  }
}
var _m = !1;
function MS(e, t) {
  if (((du = cl), (e = dy()), Pd(e))) {
    if ("selectionStart" in e)
      var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var o = r.anchorOffset,
            s = r.focusNode;
          r = r.focusOffset;
          try {
            n.nodeType, s.nodeType;
          } catch {
            n = null;
            break e;
          }
          var i = 0,
            l = -1,
            a = -1,
            c = 0,
            u = 0,
            d = e,
            f = null;
          t: for (;;) {
            for (
              var m;
              d !== n || (o !== 0 && d.nodeType !== 3) || (l = i + o),
                d !== s || (r !== 0 && d.nodeType !== 3) || (a = i + r),
                d.nodeType === 3 && (i += d.nodeValue.length),
                (m = d.firstChild) !== null;

            )
              (f = d), (d = m);
            for (;;) {
              if (d === e) break t;
              if (
                (f === n && ++c === o && (l = i),
                f === s && ++u === r && (a = i),
                (m = d.nextSibling) !== null)
              )
                break;
              (d = f), (f = d.parentNode);
            }
            d = m;
          }
          n = l === -1 || a === -1 ? null : { start: l, end: a };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (fu = { focusedElem: e, selectionRange: n }, cl = !1, q = t; q !== null; )
    if (((t = q), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      (e.return = t), (q = e);
    else
      for (; q !== null; ) {
        t = q;
        try {
          var p = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (p !== null) {
                  var h = p.memoizedProps,
                    S = p.memoizedState,
                    v = t.stateNode,
                    w = v.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? h : Yt(t.type, h),
                      S
                    );
                  v.__reactInternalSnapshotBeforeUpdate = w;
                }
                break;
              case 3:
                var g = t.stateNode.containerInfo;
                g.nodeType === 1
                  ? (g.textContent = "")
                  : g.nodeType === 9 &&
                    g.documentElement &&
                    g.removeChild(g.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(H(163));
            }
        } catch (b) {
          Ne(t, t.return, b);
        }
        if (((e = t.sibling), e !== null)) {
          (e.return = t.return), (q = e);
          break;
        }
        q = t.return;
      }
  return (p = _m), (_m = !1), p;
}
function bs(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var o = (r = r.next);
    do {
      if ((o.tag & e) === e) {
        var s = o.destroy;
        (o.destroy = void 0), s !== void 0 && Du(t, n, s);
      }
      o = o.next;
    } while (o !== r);
  }
}
function ea(e, t) {
  if (
    ((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)
  ) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Pu(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : (t.current = e);
  }
}
function lv(e) {
  var t = e.alternate;
  t !== null && ((e.alternate = null), lv(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[hn], delete t[Ls], delete t[hu], delete t[xS], delete t[SS])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null);
}
function av(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Rm(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || av(e.return)) return null;
      e = e.return;
    }
    for (
      e.sibling.return = e.return, e = e.sibling;
      e.tag !== 5 && e.tag !== 6 && e.tag !== 18;

    ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      (e.child.return = e), (e = e.child);
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Tu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    (e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = fl));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Tu(e, t, n), e = e.sibling; e !== null; ) Tu(e, t, n), (e = e.sibling);
}
function Nu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Nu(e, t, n), e = e.sibling; e !== null; ) Nu(e, t, n), (e = e.sibling);
}
var We = null,
  Kt = !1;
function Bn(e, t, n) {
  for (n = n.child; n !== null; ) cv(e, t, n), (n = n.sibling);
}
function cv(e, t, n) {
  if (yn && typeof yn.onCommitFiberUnmount == "function")
    try {
      yn.onCommitFiberUnmount(Yl, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Je || uo(n, t);
    case 6:
      var r = We,
        o = Kt;
      (We = null),
        Bn(e, t, n),
        (We = r),
        (Kt = o),
        We !== null &&
          (Kt
            ? ((e = We),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : We.removeChild(n.stateNode));
      break;
    case 18:
      We !== null &&
        (Kt
          ? ((e = We),
            (n = n.stateNode),
            e.nodeType === 8
              ? mc(e.parentNode, n)
              : e.nodeType === 1 && mc(e, n),
            Ts(e))
          : mc(We, n.stateNode));
      break;
    case 4:
      (r = We),
        (o = Kt),
        (We = n.stateNode.containerInfo),
        (Kt = !0),
        Bn(e, t, n),
        (We = r),
        (Kt = o);
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !Je &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        o = r = r.next;
        do {
          var s = o,
            i = s.destroy;
          (s = s.tag),
            i !== void 0 && (s & 2 || s & 4) && Du(n, t, i),
            (o = o.next);
        } while (o !== r);
      }
      Bn(e, t, n);
      break;
    case 1:
      if (
        !Je &&
        (uo(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          (r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount();
        } catch (l) {
          Ne(n, t, l);
        }
      Bn(e, t, n);
      break;
    case 21:
      Bn(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Je = (r = Je) || n.memoizedState !== null), Bn(e, t, n), (Je = r))
        : Bn(e, t, n);
      break;
    default:
      Bn(e, t, n);
  }
}
function Dm(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new FS()),
      t.forEach(function (r) {
        var o = KS.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(o, o));
      });
  }
}
function Wt(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var o = n[r];
      try {
        var s = e,
          i = t,
          l = i;
        e: for (; l !== null; ) {
          switch (l.tag) {
            case 5:
              (We = l.stateNode), (Kt = !1);
              break e;
            case 3:
              (We = l.stateNode.containerInfo), (Kt = !0);
              break e;
            case 4:
              (We = l.stateNode.containerInfo), (Kt = !0);
              break e;
          }
          l = l.return;
        }
        if (We === null) throw Error(H(160));
        cv(s, i, o), (We = null), (Kt = !1);
        var a = o.alternate;
        a !== null && (a.return = null), (o.return = null);
      } catch (c) {
        Ne(o, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) uv(t, e), (t = t.sibling);
}
function uv(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Wt(t, e), un(e), r & 4)) {
        try {
          bs(3, e, e.return), ea(3, e);
        } catch (h) {
          Ne(e, e.return, h);
        }
        try {
          bs(5, e, e.return);
        } catch (h) {
          Ne(e, e.return, h);
        }
      }
      break;
    case 1:
      Wt(t, e), un(e), r & 512 && n !== null && uo(n, n.return);
      break;
    case 5:
      if (
        (Wt(t, e),
        un(e),
        r & 512 && n !== null && uo(n, n.return),
        e.flags & 32)
      ) {
        var o = e.stateNode;
        try {
          _s(o, "");
        } catch (h) {
          Ne(e, e.return, h);
        }
      }
      if (r & 4 && ((o = e.stateNode), o != null)) {
        var s = e.memoizedProps,
          i = n !== null ? n.memoizedProps : s,
          l = e.type,
          a = e.updateQueue;
        if (((e.updateQueue = null), a !== null))
          try {
            l === "input" && s.type === "radio" && s.name != null && Og(o, s),
              tu(l, i);
            var c = tu(l, s);
            for (i = 0; i < a.length; i += 2) {
              var u = a[i],
                d = a[i + 1];
              u === "style"
                ? Fg(o, d)
                : u === "dangerouslySetInnerHTML"
                ? Lg(o, d)
                : u === "children"
                ? _s(o, d)
                : gd(o, u, d, c);
            }
            switch (l) {
              case "input":
                Xc(o, s);
                break;
              case "textarea":
                jg(o, s);
                break;
              case "select":
                var f = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!s.multiple;
                var m = s.value;
                m != null
                  ? mo(o, !!s.multiple, m, !1)
                  : f !== !!s.multiple &&
                    (s.defaultValue != null
                      ? mo(o, !!s.multiple, s.defaultValue, !0)
                      : mo(o, !!s.multiple, s.multiple ? [] : "", !1));
            }
            o[Ls] = s;
          } catch (h) {
            Ne(e, e.return, h);
          }
      }
      break;
    case 6:
      if ((Wt(t, e), un(e), r & 4)) {
        if (e.stateNode === null) throw Error(H(162));
        (o = e.stateNode), (s = e.memoizedProps);
        try {
          o.nodeValue = s;
        } catch (h) {
          Ne(e, e.return, h);
        }
      }
      break;
    case 3:
      if (
        (Wt(t, e), un(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          Ts(t.containerInfo);
        } catch (h) {
          Ne(e, e.return, h);
        }
      break;
    case 4:
      Wt(t, e), un(e);
      break;
    case 13:
      Wt(t, e),
        un(e),
        (o = e.child),
        o.flags & 8192 &&
          ((s = o.memoizedState !== null),
          (o.stateNode.isHidden = s),
          !s ||
            (o.alternate !== null && o.alternate.memoizedState !== null) ||
            (Gd = $e())),
        r & 4 && Dm(e);
      break;
    case 22:
      if (
        ((u = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Je = (c = Je) || u), Wt(t, e), (Je = c)) : Wt(t, e),
        un(e),
        r & 8192)
      ) {
        if (
          ((c = e.memoizedState !== null),
          (e.stateNode.isHidden = c) && !u && e.mode & 1)
        )
          for (q = e, u = e.child; u !== null; ) {
            for (d = q = u; q !== null; ) {
              switch (((f = q), (m = f.child), f.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  bs(4, f, f.return);
                  break;
                case 1:
                  uo(f, f.return);
                  var p = f.stateNode;
                  if (typeof p.componentWillUnmount == "function") {
                    (r = f), (n = f.return);
                    try {
                      (t = r),
                        (p.props = t.memoizedProps),
                        (p.state = t.memoizedState),
                        p.componentWillUnmount();
                    } catch (h) {
                      Ne(r, n, h);
                    }
                  }
                  break;
                case 5:
                  uo(f, f.return);
                  break;
                case 22:
                  if (f.memoizedState !== null) {
                    Tm(d);
                    continue;
                  }
              }
              m !== null ? ((m.return = f), (q = m)) : Tm(d);
            }
            u = u.sibling;
          }
        e: for (u = null, d = e; ; ) {
          if (d.tag === 5) {
            if (u === null) {
              u = d;
              try {
                (o = d.stateNode),
                  c
                    ? ((s = o.style),
                      typeof s.setProperty == "function"
                        ? s.setProperty("display", "none", "important")
                        : (s.display = "none"))
                    : ((l = d.stateNode),
                      (a = d.memoizedProps.style),
                      (i =
                        a != null && a.hasOwnProperty("display")
                          ? a.display
                          : null),
                      (l.style.display = Ag("display", i)));
              } catch (h) {
                Ne(e, e.return, h);
              }
            }
          } else if (d.tag === 6) {
            if (u === null)
              try {
                d.stateNode.nodeValue = c ? "" : d.memoizedProps;
              } catch (h) {
                Ne(e, e.return, h);
              }
          } else if (
            ((d.tag !== 22 && d.tag !== 23) ||
              d.memoizedState === null ||
              d === e) &&
            d.child !== null
          ) {
            (d.child.return = d), (d = d.child);
            continue;
          }
          if (d === e) break e;
          for (; d.sibling === null; ) {
            if (d.return === null || d.return === e) break e;
            u === d && (u = null), (d = d.return);
          }
          u === d && (u = null), (d.sibling.return = d.return), (d = d.sibling);
        }
      }
      break;
    case 19:
      Wt(t, e), un(e), r & 4 && Dm(e);
      break;
    case 21:
      break;
    default:
      Wt(t, e), un(e);
  }
}
function un(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (av(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(H(160));
      }
      switch (r.tag) {
        case 5:
          var o = r.stateNode;
          r.flags & 32 && (_s(o, ""), (r.flags &= -33));
          var s = Rm(e);
          Nu(e, s, o);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo,
            l = Rm(e);
          Tu(e, l, i);
          break;
        default:
          throw Error(H(161));
      }
    } catch (a) {
      Ne(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function IS(e, t, n) {
  (q = e), dv(e);
}
function dv(e, t, n) {
  for (var r = (e.mode & 1) !== 0; q !== null; ) {
    var o = q,
      s = o.child;
    if (o.tag === 22 && r) {
      var i = o.memoizedState !== null || Di;
      if (!i) {
        var l = o.alternate,
          a = (l !== null && l.memoizedState !== null) || Je;
        l = Di;
        var c = Je;
        if (((Di = i), (Je = a) && !c))
          for (q = o; q !== null; )
            (i = q),
              (a = i.child),
              i.tag === 22 && i.memoizedState !== null
                ? Nm(o)
                : a !== null
                ? ((a.return = i), (q = a))
                : Nm(o);
        for (; s !== null; ) (q = s), dv(s), (s = s.sibling);
        (q = o), (Di = l), (Je = c);
      }
      Pm(e);
    } else
      o.subtreeFlags & 8772 && s !== null ? ((s.return = o), (q = s)) : Pm(e);
  }
}
function Pm(e) {
  for (; q !== null; ) {
    var t = q;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              Je || ea(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Je)
                if (n === null) r.componentDidMount();
                else {
                  var o =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : Yt(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    o,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate
                  );
                }
              var s = t.updateQueue;
              s !== null && pm(t, s, r);
              break;
            case 3:
              var i = t.updateQueue;
              if (i !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                pm(t, i, n);
              }
              break;
            case 5:
              var l = t.stateNode;
              if (n === null && t.flags & 4) {
                n = l;
                var a = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    a.autoFocus && n.focus();
                    break;
                  case "img":
                    a.src && (n.src = a.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var c = t.alternate;
                if (c !== null) {
                  var u = c.memoizedState;
                  if (u !== null) {
                    var d = u.dehydrated;
                    d !== null && Ts(d);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(H(163));
          }
        Je || (t.flags & 512 && Pu(t));
      } catch (f) {
        Ne(t, t.return, f);
      }
    }
    if (t === e) {
      q = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      (n.return = t.return), (q = n);
      break;
    }
    q = t.return;
  }
}
function Tm(e) {
  for (; q !== null; ) {
    var t = q;
    if (t === e) {
      q = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      (n.return = t.return), (q = n);
      break;
    }
    q = t.return;
  }
}
function Nm(e) {
  for (; q !== null; ) {
    var t = q;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            ea(4, t);
          } catch (a) {
            Ne(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              Ne(t, o, a);
            }
          }
          var s = t.return;
          try {
            Pu(t);
          } catch (a) {
            Ne(t, s, a);
          }
          break;
        case 5:
          var i = t.return;
          try {
            Pu(t);
          } catch (a) {
            Ne(t, i, a);
          }
      }
    } catch (a) {
      Ne(t, t.return, a);
    }
    if (t === e) {
      q = null;
      break;
    }
    var l = t.sibling;
    if (l !== null) {
      (l.return = t.return), (q = l);
      break;
    }
    q = t.return;
  }
}
var zS = Math.ceil,
  Cl = An.ReactCurrentDispatcher,
  Kd = An.ReactCurrentOwner,
  At = An.ReactCurrentBatchConfig,
  pe = 0,
  He = null,
  Me = null,
  Ye = 0,
  St = 0,
  fo = dr(0),
  Be = 0,
  Bs = null,
  $r = 0,
  ta = 0,
  qd = 0,
  Cs = null,
  dt = null,
  Gd = 0,
  To = 1 / 0,
  En = null,
  El = !1,
  Ou = null,
  rr = null,
  Pi = !1,
  Xn = null,
  kl = 0,
  Es = 0,
  ju = null,
  Xi = -1,
  Qi = 0;
function lt() {
  return pe & 6 ? $e() : Xi !== -1 ? Xi : (Xi = $e());
}
function or(e) {
  return e.mode & 1
    ? pe & 2 && Ye !== 0
      ? Ye & -Ye
      : CS.transition !== null
      ? (Qi === 0 && (Qi = Gg()), Qi)
      : ((e = he),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : ny(e.type))),
        e)
    : 1;
}
function Qt(e, t, n, r) {
  if (50 < Es) throw ((Es = 0), (ju = null), Error(H(185)));
  Qs(e, n, r),
    (!(pe & 2) || e !== He) &&
      (e === He && (!(pe & 2) && (ta |= n), Be === 4 && Kn(e, Ye)),
      yt(e, r),
      n === 1 && pe === 0 && !(t.mode & 1) && ((To = $e() + 500), Ql && fr()));
}
function yt(e, t) {
  var n = e.callbackNode;
  Cx(e, t);
  var r = al(e, e === He ? Ye : 0);
  if (r === 0)
    n !== null && zp(n), (e.callbackNode = null), (e.callbackPriority = 0);
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && zp(n), t === 1))
      e.tag === 0 ? bS(Om.bind(null, e)) : Sy(Om.bind(null, e)),
        vS(function () {
          !(pe & 6) && fr();
        }),
        (n = null);
    else {
      switch (Xg(r)) {
        case 1:
          n = Sd;
          break;
        case 4:
          n = Kg;
          break;
        case 16:
          n = ll;
          break;
        case 536870912:
          n = qg;
          break;
        default:
          n = ll;
      }
      n = wv(n, fv.bind(null, e));
    }
    (e.callbackPriority = t), (e.callbackNode = n);
  }
}
function fv(e, t) {
  if (((Xi = -1), (Qi = 0), pe & 6)) throw Error(H(327));
  var n = e.callbackNode;
  if (wo() && e.callbackNode !== n) return null;
  var r = al(e, e === He ? Ye : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = _l(e, r);
  else {
    t = r;
    var o = pe;
    pe |= 2;
    var s = mv();
    (He !== e || Ye !== t) && ((En = null), (To = $e() + 500), _r(e, t));
    do
      try {
        HS();
        break;
      } catch (l) {
        pv(e, l);
      }
    while (!0);
    $d(),
      (Cl.current = s),
      (pe = o),
      Me !== null ? (t = 0) : ((He = null), (Ye = 0), (t = Be));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((o = iu(e)), o !== 0 && ((r = o), (t = $u(e, o)))), t === 1)
    )
      throw ((n = Bs), _r(e, 0), Kn(e, r), yt(e, $e()), n);
    if (t === 6) Kn(e, r);
    else {
      if (
        ((o = e.current.alternate),
        !(r & 30) &&
          !BS(o) &&
          ((t = _l(e, r)),
          t === 2 && ((s = iu(e)), s !== 0 && ((r = s), (t = $u(e, s)))),
          t === 1))
      )
        throw ((n = Bs), _r(e, 0), Kn(e, r), yt(e, $e()), n);
      switch (((e.finishedWork = o), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(H(345));
        case 2:
          wr(e, dt, En);
          break;
        case 3:
          if (
            (Kn(e, r), (r & 130023424) === r && ((t = Gd + 500 - $e()), 10 < t))
          ) {
            if (al(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & r) !== r)) {
              lt(), (e.pingedLanes |= e.suspendedLanes & o);
              break;
            }
            e.timeoutHandle = mu(wr.bind(null, e, dt, En), t);
            break;
          }
          wr(e, dt, En);
          break;
        case 4:
          if ((Kn(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var i = 31 - Xt(r);
            (s = 1 << i), (i = t[i]), i > o && (o = i), (r &= ~s);
          }
          if (
            ((r = o),
            (r = $e() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                ? 480
                : 1080 > r
                ? 1080
                : 1920 > r
                ? 1920
                : 3e3 > r
                ? 3e3
                : 4320 > r
                ? 4320
                : 1960 * zS(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = mu(wr.bind(null, e, dt, En), r);
            break;
          }
          wr(e, dt, En);
          break;
        case 5:
          wr(e, dt, En);
          break;
        default:
          throw Error(H(329));
      }
    }
  }
  return yt(e, $e()), e.callbackNode === n ? fv.bind(null, e) : null;
}
function $u(e, t) {
  var n = Cs;
  return (
    e.current.memoizedState.isDehydrated && (_r(e, t).flags |= 256),
    (e = _l(e, t)),
    e !== 2 && ((t = dt), (dt = n), t !== null && Lu(t)),
    e
  );
}
function Lu(e) {
  dt === null ? (dt = e) : dt.push.apply(dt, e);
}
function BS(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var o = n[r],
            s = o.getSnapshot;
          o = o.value;
          try {
            if (!Zt(s(), o)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null))
      (n.return = t), (t = n);
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      (t.sibling.return = t.return), (t = t.sibling);
    }
  }
  return !0;
}
function Kn(e, t) {
  for (
    t &= ~qd,
      t &= ~ta,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;

  ) {
    var n = 31 - Xt(t),
      r = 1 << n;
    (e[n] = -1), (t &= ~r);
  }
}
function Om(e) {
  if (pe & 6) throw Error(H(327));
  wo();
  var t = al(e, 0);
  if (!(t & 1)) return yt(e, $e()), null;
  var n = _l(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = iu(e);
    r !== 0 && ((t = r), (n = $u(e, r)));
  }
  if (n === 1) throw ((n = Bs), _r(e, 0), Kn(e, t), yt(e, $e()), n);
  if (n === 6) throw Error(H(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    wr(e, dt, En),
    yt(e, $e()),
    null
  );
}
function Xd(e, t) {
  var n = pe;
  pe |= 1;
  try {
    return e(t);
  } finally {
    (pe = n), pe === 0 && ((To = $e() + 500), Ql && fr());
  }
}
function Lr(e) {
  Xn !== null && Xn.tag === 0 && !(pe & 6) && wo();
  var t = pe;
  pe |= 1;
  var n = At.transition,
    r = he;
  try {
    if (((At.transition = null), (he = 1), e)) return e();
  } finally {
    (he = r), (At.transition = n), (pe = t), !(pe & 6) && fr();
  }
}
function Qd() {
  (St = fo.current), xe(fo);
}
function _r(e, t) {
  (e.finishedWork = null), (e.finishedLanes = 0);
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), yS(n)), Me !== null))
    for (n = Me.return; n !== null; ) {
      var r = n;
      switch ((Nd(r), r.tag)) {
        case 1:
          (r = r.type.childContextTypes), r != null && pl();
          break;
        case 3:
          Do(), xe(ht), xe(tt), zd();
          break;
        case 5:
          Id(r);
          break;
        case 4:
          Do();
          break;
        case 13:
          xe(Re);
          break;
        case 19:
          xe(Re);
          break;
        case 10:
          Ld(r.type._context);
          break;
        case 22:
        case 23:
          Qd();
      }
      n = n.return;
    }
  if (
    ((He = e),
    (Me = e = sr(e.current, null)),
    (Ye = St = t),
    (Be = 0),
    (Bs = null),
    (qd = ta = $r = 0),
    (dt = Cs = null),
    Cr !== null)
  ) {
    for (t = 0; t < Cr.length; t++)
      if (((n = Cr[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var o = r.next,
          s = n.pending;
        if (s !== null) {
          var i = s.next;
          (s.next = o), (r.next = i);
        }
        n.pending = r;
      }
    Cr = null;
  }
  return e;
}
function pv(e, t) {
  do {
    var n = Me;
    try {
      if (($d(), (Ki.current = bl), Sl)) {
        for (var r = De.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), (r = r.next);
        }
        Sl = !1;
      }
      if (
        ((jr = 0),
        (Ve = ze = De = null),
        (Ss = !1),
        (Ms = 0),
        (Kd.current = null),
        n === null || n.return === null)
      ) {
        (Be = 1), (Bs = t), (Me = null);
        break;
      }
      e: {
        var s = e,
          i = n.return,
          l = n,
          a = t;
        if (
          ((t = Ye),
          (l.flags |= 32768),
          a !== null && typeof a == "object" && typeof a.then == "function")
        ) {
          var c = a,
            u = l,
            d = u.tag;
          if (!(u.mode & 1) && (d === 0 || d === 11 || d === 15)) {
            var f = u.alternate;
            f
              ? ((u.updateQueue = f.updateQueue),
                (u.memoizedState = f.memoizedState),
                (u.lanes = f.lanes))
              : ((u.updateQueue = null), (u.memoizedState = null));
          }
          var m = wm(i);
          if (m !== null) {
            (m.flags &= -257),
              xm(m, i, l, s, t),
              m.mode & 1 && vm(s, c, t),
              (t = m),
              (a = c);
            var p = t.updateQueue;
            if (p === null) {
              var h = new Set();
              h.add(a), (t.updateQueue = h);
            } else p.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              vm(s, c, t), Jd();
              break e;
            }
            a = Error(H(426));
          }
        } else if (Ce && l.mode & 1) {
          var S = wm(i);
          if (S !== null) {
            !(S.flags & 65536) && (S.flags |= 256),
              xm(S, i, l, s, t),
              Od(Po(a, l));
            break e;
          }
        }
        (s = a = Po(a, l)),
          Be !== 4 && (Be = 2),
          Cs === null ? (Cs = [s]) : Cs.push(s),
          (s = i);
        do {
          switch (s.tag) {
            case 3:
              (s.flags |= 65536), (t &= -t), (s.lanes |= t);
              var v = Xy(s, a, t);
              fm(s, v);
              break e;
            case 1:
              l = a;
              var w = s.type,
                g = s.stateNode;
              if (
                !(s.flags & 128) &&
                (typeof w.getDerivedStateFromError == "function" ||
                  (g !== null &&
                    typeof g.componentDidCatch == "function" &&
                    (rr === null || !rr.has(g))))
              ) {
                (s.flags |= 65536), (t &= -t), (s.lanes |= t);
                var b = Qy(s, l, t);
                fm(s, b);
                break e;
              }
          }
          s = s.return;
        } while (s !== null);
      }
      gv(n);
    } catch (C) {
      (t = C), Me === n && n !== null && (Me = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function mv() {
  var e = Cl.current;
  return (Cl.current = bl), e === null ? bl : e;
}
function Jd() {
  (Be === 0 || Be === 3 || Be === 2) && (Be = 4),
    He === null || (!($r & 268435455) && !(ta & 268435455)) || Kn(He, Ye);
}
function _l(e, t) {
  var n = pe;
  pe |= 2;
  var r = mv();
  (He !== e || Ye !== t) && ((En = null), _r(e, t));
  do
    try {
      VS();
      break;
    } catch (o) {
      pv(e, o);
    }
  while (!0);
  if (($d(), (pe = n), (Cl.current = r), Me !== null)) throw Error(H(261));
  return (He = null), (Ye = 0), Be;
}
function VS() {
  for (; Me !== null; ) hv(Me);
}
function HS() {
  for (; Me !== null && !mx(); ) hv(Me);
}
function hv(e) {
  var t = vv(e.alternate, e, St);
  (e.memoizedProps = e.pendingProps),
    t === null ? gv(e) : (Me = t),
    (Kd.current = null);
}
function gv(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = AS(n, t)), n !== null)) {
        (n.flags &= 32767), (Me = n);
        return;
      }
      if (e !== null)
        (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
      else {
        (Be = 6), (Me = null);
        return;
      }
    } else if (((n = LS(n, t, St)), n !== null)) {
      Me = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Me = t;
      return;
    }
    Me = t = e;
  } while (t !== null);
  Be === 0 && (Be = 5);
}
function wr(e, t, n) {
  var r = he,
    o = At.transition;
  try {
    (At.transition = null), (he = 1), US(e, t, n, r);
  } finally {
    (At.transition = o), (he = r);
  }
  return null;
}
function US(e, t, n, r) {
  do wo();
  while (Xn !== null);
  if (pe & 6) throw Error(H(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(H(177));
  (e.callbackNode = null), (e.callbackPriority = 0);
  var s = n.lanes | n.childLanes;
  if (
    (Ex(e, s),
    e === He && ((Me = He = null), (Ye = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      Pi ||
      ((Pi = !0),
      wv(ll, function () {
        return wo(), null;
      })),
    (s = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || s)
  ) {
    (s = At.transition), (At.transition = null);
    var i = he;
    he = 1;
    var l = pe;
    (pe |= 4),
      (Kd.current = null),
      MS(e, n),
      uv(n, e),
      uS(fu),
      (cl = !!du),
      (fu = du = null),
      (e.current = n),
      IS(n),
      hx(),
      (pe = l),
      (he = i),
      (At.transition = s);
  } else e.current = n;
  if (
    (Pi && ((Pi = !1), (Xn = e), (kl = o)),
    (s = e.pendingLanes),
    s === 0 && (rr = null),
    vx(n.stateNode),
    yt(e, $e()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      (o = t[n]), r(o.value, { componentStack: o.stack, digest: o.digest });
  if (El) throw ((El = !1), (e = Ou), (Ou = null), e);
  return (
    kl & 1 && e.tag !== 0 && wo(),
    (s = e.pendingLanes),
    s & 1 ? (e === ju ? Es++ : ((Es = 0), (ju = e))) : (Es = 0),
    fr(),
    null
  );
}
function wo() {
  if (Xn !== null) {
    var e = Xg(kl),
      t = At.transition,
      n = he;
    try {
      if (((At.transition = null), (he = 16 > e ? 16 : e), Xn === null))
        var r = !1;
      else {
        if (((e = Xn), (Xn = null), (kl = 0), pe & 6)) throw Error(H(331));
        var o = pe;
        for (pe |= 4, q = e.current; q !== null; ) {
          var s = q,
            i = s.child;
          if (q.flags & 16) {
            var l = s.deletions;
            if (l !== null) {
              for (var a = 0; a < l.length; a++) {
                var c = l[a];
                for (q = c; q !== null; ) {
                  var u = q;
                  switch (u.tag) {
                    case 0:
                    case 11:
                    case 15:
                      bs(8, u, s);
                  }
                  var d = u.child;
                  if (d !== null) (d.return = u), (q = d);
                  else
                    for (; q !== null; ) {
                      u = q;
                      var f = u.sibling,
                        m = u.return;
                      if ((lv(u), u === c)) {
                        q = null;
                        break;
                      }
                      if (f !== null) {
                        (f.return = m), (q = f);
                        break;
                      }
                      q = m;
                    }
                }
              }
              var p = s.alternate;
              if (p !== null) {
                var h = p.child;
                if (h !== null) {
                  p.child = null;
                  do {
                    var S = h.sibling;
                    (h.sibling = null), (h = S);
                  } while (h !== null);
                }
              }
              q = s;
            }
          }
          if (s.subtreeFlags & 2064 && i !== null) (i.return = s), (q = i);
          else
            e: for (; q !== null; ) {
              if (((s = q), s.flags & 2048))
                switch (s.tag) {
                  case 0:
                  case 11:
                  case 15:
                    bs(9, s, s.return);
                }
              var v = s.sibling;
              if (v !== null) {
                (v.return = s.return), (q = v);
                break e;
              }
              q = s.return;
            }
        }
        var w = e.current;
        for (q = w; q !== null; ) {
          i = q;
          var g = i.child;
          if (i.subtreeFlags & 2064 && g !== null) (g.return = i), (q = g);
          else
            e: for (i = w; q !== null; ) {
              if (((l = q), l.flags & 2048))
                try {
                  switch (l.tag) {
                    case 0:
                    case 11:
                    case 15:
                      ea(9, l);
                  }
                } catch (C) {
                  Ne(l, l.return, C);
                }
              if (l === i) {
                q = null;
                break e;
              }
              var b = l.sibling;
              if (b !== null) {
                (b.return = l.return), (q = b);
                break e;
              }
              q = l.return;
            }
        }
        if (
          ((pe = o), fr(), yn && typeof yn.onPostCommitFiberRoot == "function")
        )
          try {
            yn.onPostCommitFiberRoot(Yl, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      (he = n), (At.transition = t);
    }
  }
  return !1;
}
function jm(e, t, n) {
  (t = Po(n, t)),
    (t = Xy(e, t, 1)),
    (e = nr(e, t, 1)),
    (t = lt()),
    e !== null && (Qs(e, 1, t), yt(e, t));
}
function Ne(e, t, n) {
  if (e.tag === 3) jm(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        jm(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (rr === null || !rr.has(r)))
        ) {
          (e = Po(n, e)),
            (e = Qy(t, e, 1)),
            (t = nr(t, e, 1)),
            (e = lt()),
            t !== null && (Qs(t, 1, e), yt(t, e));
          break;
        }
      }
      t = t.return;
    }
}
function WS(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t),
    (t = lt()),
    (e.pingedLanes |= e.suspendedLanes & n),
    He === e &&
      (Ye & n) === n &&
      (Be === 4 || (Be === 3 && (Ye & 130023424) === Ye && 500 > $e() - Gd)
        ? _r(e, 0)
        : (qd |= n)),
    yt(e, t);
}
function yv(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = wi), (wi <<= 1), !(wi & 130023424) && (wi = 4194304))
      : (t = 1));
  var n = lt();
  (e = On(e, t)), e !== null && (Qs(e, t, n), yt(e, n));
}
function YS(e) {
  var t = e.memoizedState,
    n = 0;
  t !== null && (n = t.retryLane), yv(e, n);
}
function KS(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        o = e.memoizedState;
      o !== null && (n = o.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(H(314));
  }
  r !== null && r.delete(t), yv(e, n);
}
var vv;
vv = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || ht.current) ft = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return (ft = !1), $S(e, t, n);
      ft = !!(e.flags & 131072);
    }
  else (ft = !1), Ce && t.flags & 1048576 && by(t, gl, t.index);
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      Gi(e, t), (e = t.pendingProps);
      var o = ko(t, tt.current);
      vo(t, n), (o = Vd(null, t, r, e, o, n));
      var s = Hd();
      return (
        (t.flags |= 1),
        typeof o == "object" &&
        o !== null &&
        typeof o.render == "function" &&
        o.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            gt(r) ? ((s = !0), ml(t)) : (s = !1),
            (t.memoizedState =
              o.state !== null && o.state !== void 0 ? o.state : null),
            Fd(t),
            (o.updater = Zl),
            (t.stateNode = o),
            (o._reactInternals = t),
            Su(t, r, e, n),
            (t = Eu(null, t, r, !0, s, n)))
          : ((t.tag = 0), Ce && s && Td(t), st(null, t, o, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Gi(e, t),
          (e = t.pendingProps),
          (o = r._init),
          (r = o(r._payload)),
          (t.type = r),
          (o = t.tag = GS(r)),
          (e = Yt(r, e)),
          o)
        ) {
          case 0:
            t = Cu(null, t, r, e, n);
            break e;
          case 1:
            t = Cm(null, t, r, e, n);
            break e;
          case 11:
            t = Sm(null, t, r, e, n);
            break e;
          case 14:
            t = bm(null, t, r, Yt(r.type, e), n);
            break e;
        }
        throw Error(H(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Yt(r, o)),
        Cu(e, t, r, o, n)
      );
    case 1:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Yt(r, o)),
        Cm(e, t, r, o, n)
      );
    case 3:
      e: {
        if ((tv(t), e === null)) throw Error(H(387));
        (r = t.pendingProps),
          (s = t.memoizedState),
          (o = s.element),
          Dy(e, t),
          wl(t, r, null, n);
        var i = t.memoizedState;
        if (((r = i.element), s.isDehydrated))
          if (
            ((s = {
              element: r,
              isDehydrated: !1,
              cache: i.cache,
              pendingSuspenseBoundaries: i.pendingSuspenseBoundaries,
              transitions: i.transitions,
            }),
            (t.updateQueue.baseState = s),
            (t.memoizedState = s),
            t.flags & 256)
          ) {
            (o = Po(Error(H(423)), t)), (t = Em(e, t, r, n, o));
            break e;
          } else if (r !== o) {
            (o = Po(Error(H(424)), t)), (t = Em(e, t, r, n, o));
            break e;
          } else
            for (
              bt = tr(t.stateNode.containerInfo.firstChild),
                Ct = t,
                Ce = !0,
                qt = null,
                n = _y(t, null, r, n),
                t.child = n;
              n;

            )
              (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
        else {
          if ((_o(), r === o)) {
            t = jn(e, t, n);
            break e;
          }
          st(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Py(t),
        e === null && vu(t),
        (r = t.type),
        (o = t.pendingProps),
        (s = e !== null ? e.memoizedProps : null),
        (i = o.children),
        pu(r, o) ? (i = null) : s !== null && pu(r, s) && (t.flags |= 32),
        ev(e, t),
        st(e, t, i, n),
        t.child
      );
    case 6:
      return e === null && vu(t), null;
    case 13:
      return nv(e, t, n);
    case 4:
      return (
        Md(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = Ro(t, null, r, n)) : st(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Yt(r, o)),
        Sm(e, t, r, o, n)
      );
    case 7:
      return st(e, t, t.pendingProps, n), t.child;
    case 8:
      return st(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return st(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (o = t.pendingProps),
          (s = t.memoizedProps),
          (i = o.value),
          ve(yl, r._currentValue),
          (r._currentValue = i),
          s !== null)
        )
          if (Zt(s.value, i)) {
            if (s.children === o.children && !ht.current) {
              t = jn(e, t, n);
              break e;
            }
          } else
            for (s = t.child, s !== null && (s.return = t); s !== null; ) {
              var l = s.dependencies;
              if (l !== null) {
                i = s.child;
                for (var a = l.firstContext; a !== null; ) {
                  if (a.context === r) {
                    if (s.tag === 1) {
                      (a = Dn(-1, n & -n)), (a.tag = 2);
                      var c = s.updateQueue;
                      if (c !== null) {
                        c = c.shared;
                        var u = c.pending;
                        u === null
                          ? (a.next = a)
                          : ((a.next = u.next), (u.next = a)),
                          (c.pending = a);
                      }
                    }
                    (s.lanes |= n),
                      (a = s.alternate),
                      a !== null && (a.lanes |= n),
                      wu(s.return, n, t),
                      (l.lanes |= n);
                    break;
                  }
                  a = a.next;
                }
              } else if (s.tag === 10) i = s.type === t.type ? null : s.child;
              else if (s.tag === 18) {
                if (((i = s.return), i === null)) throw Error(H(341));
                (i.lanes |= n),
                  (l = i.alternate),
                  l !== null && (l.lanes |= n),
                  wu(i, n, t),
                  (i = s.sibling);
              } else i = s.child;
              if (i !== null) i.return = s;
              else
                for (i = s; i !== null; ) {
                  if (i === t) {
                    i = null;
                    break;
                  }
                  if (((s = i.sibling), s !== null)) {
                    (s.return = i.return), (i = s);
                    break;
                  }
                  i = i.return;
                }
              s = i;
            }
        st(e, t, o.children, n), (t = t.child);
      }
      return t;
    case 9:
      return (
        (o = t.type),
        (r = t.pendingProps.children),
        vo(t, n),
        (o = Mt(o)),
        (r = r(o)),
        (t.flags |= 1),
        st(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (o = Yt(r, t.pendingProps)),
        (o = Yt(r.type, o)),
        bm(e, t, r, o, n)
      );
    case 15:
      return Jy(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Yt(r, o)),
        Gi(e, t),
        (t.tag = 1),
        gt(r) ? ((e = !0), ml(t)) : (e = !1),
        vo(t, n),
        Gy(t, r, o),
        Su(t, r, o, n),
        Eu(null, t, r, !0, e, n)
      );
    case 19:
      return rv(e, t, n);
    case 22:
      return Zy(e, t, n);
  }
  throw Error(H(156, t.tag));
};
function wv(e, t) {
  return Yg(e, t);
}
function qS(e, t, n, r) {
  (this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
        null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null);
}
function Lt(e, t, n, r) {
  return new qS(e, t, n, r);
}
function Zd(e) {
  return (e = e.prototype), !(!e || !e.isReactComponent);
}
function GS(e) {
  if (typeof e == "function") return Zd(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === vd)) return 11;
    if (e === wd) return 14;
  }
  return 2;
}
function sr(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Lt(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies =
      t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function Ji(e, t, n, r, o, s) {
  var i = 2;
  if (((r = e), typeof e == "function")) Zd(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else
    e: switch (e) {
      case to:
        return Rr(n.children, o, s, t);
      case yd:
        (i = 8), (o |= 8);
        break;
      case Wc:
        return (
          (e = Lt(12, n, t, o | 2)), (e.elementType = Wc), (e.lanes = s), e
        );
      case Yc:
        return (e = Lt(13, n, t, o)), (e.elementType = Yc), (e.lanes = s), e;
      case Kc:
        return (e = Lt(19, n, t, o)), (e.elementType = Kc), (e.lanes = s), e;
      case Pg:
        return na(n, o, s, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Rg:
              i = 10;
              break e;
            case Dg:
              i = 9;
              break e;
            case vd:
              i = 11;
              break e;
            case wd:
              i = 14;
              break e;
            case Hn:
              (i = 16), (r = null);
              break e;
          }
        throw Error(H(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = Lt(i, n, t, o)), (t.elementType = e), (t.type = r), (t.lanes = s), t
  );
}
function Rr(e, t, n, r) {
  return (e = Lt(7, e, r, t)), (e.lanes = n), e;
}
function na(e, t, n, r) {
  return (
    (e = Lt(22, e, r, t)),
    (e.elementType = Pg),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function bc(e, t, n) {
  return (e = Lt(6, e, null, t)), (e.lanes = n), e;
}
function Cc(e, t, n) {
  return (
    (t = Lt(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function XS(e, t, n, r, o) {
  (this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork =
      this.pingCache =
      this.current =
      this.pendingChildren =
        null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = rc(0)),
    (this.expirationTimes = rc(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = rc(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = o),
    (this.mutableSourceEagerHydrationData = null);
}
function ef(e, t, n, r, o, s, i, l, a) {
  return (
    (e = new XS(e, t, n, l, a)),
    t === 1 ? ((t = 1), s === !0 && (t |= 8)) : (t = 0),
    (s = Lt(3, null, null, t)),
    (e.current = s),
    (s.stateNode = e),
    (s.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    Fd(s),
    e
  );
}
function QS(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: eo,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function xv(e) {
  if (!e) return lr;
  e = e._reactInternals;
  e: {
    if (Vr(e) !== e || e.tag !== 1) throw Error(H(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (gt(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(H(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (gt(n)) return xy(e, n, t);
  }
  return t;
}
function Sv(e, t, n, r, o, s, i, l, a) {
  return (
    (e = ef(n, r, !0, e, o, s, i, l, a)),
    (e.context = xv(null)),
    (n = e.current),
    (r = lt()),
    (o = or(n)),
    (s = Dn(r, o)),
    (s.callback = t ?? null),
    nr(n, s, o),
    (e.current.lanes = o),
    Qs(e, o, r),
    yt(e, r),
    e
  );
}
function ra(e, t, n, r) {
  var o = t.current,
    s = lt(),
    i = or(o);
  return (
    (n = xv(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = Dn(s, i)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = nr(o, t, i)),
    e !== null && (Qt(e, o, i, s), Yi(e, o, i)),
    i
  );
}
function Rl(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function $m(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function tf(e, t) {
  $m(e, t), (e = e.alternate) && $m(e, t);
}
function JS() {
  return null;
}
var bv =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function nf(e) {
  this._internalRoot = e;
}
oa.prototype.render = nf.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(H(409));
  ra(e, t, null, null);
};
oa.prototype.unmount = nf.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Lr(function () {
      ra(null, e, null, null);
    }),
      (t[Nn] = null);
  }
};
function oa(e) {
  this._internalRoot = e;
}
oa.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Zg();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Yn.length && t !== 0 && t < Yn[n].priority; n++);
    Yn.splice(n, 0, e), n === 0 && ty(e);
  }
};
function rf(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function sa(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Lm() {}
function ZS(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var s = r;
      r = function () {
        var c = Rl(i);
        s.call(c);
      };
    }
    var i = Sv(t, r, e, 0, null, !1, !1, "", Lm);
    return (
      (e._reactRootContainer = i),
      (e[Nn] = i.current),
      js(e.nodeType === 8 ? e.parentNode : e),
      Lr(),
      i
    );
  }
  for (; (o = e.lastChild); ) e.removeChild(o);
  if (typeof r == "function") {
    var l = r;
    r = function () {
      var c = Rl(a);
      l.call(c);
    };
  }
  var a = ef(e, 0, !1, null, null, !1, !1, "", Lm);
  return (
    (e._reactRootContainer = a),
    (e[Nn] = a.current),
    js(e.nodeType === 8 ? e.parentNode : e),
    Lr(function () {
      ra(t, a, n, r);
    }),
    a
  );
}
function ia(e, t, n, r, o) {
  var s = n._reactRootContainer;
  if (s) {
    var i = s;
    if (typeof o == "function") {
      var l = o;
      o = function () {
        var a = Rl(i);
        l.call(a);
      };
    }
    ra(t, i, e, o);
  } else i = ZS(n, t, e, o, r);
  return Rl(i);
}
Qg = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = ms(t.pendingLanes);
        n !== 0 &&
          (bd(t, n | 1), yt(t, $e()), !(pe & 6) && ((To = $e() + 500), fr()));
      }
      break;
    case 13:
      Lr(function () {
        var r = On(e, 1);
        if (r !== null) {
          var o = lt();
          Qt(r, e, 1, o);
        }
      }),
        tf(e, 1);
  }
};
Cd = function (e) {
  if (e.tag === 13) {
    var t = On(e, 134217728);
    if (t !== null) {
      var n = lt();
      Qt(t, e, 134217728, n);
    }
    tf(e, 134217728);
  }
};
Jg = function (e) {
  if (e.tag === 13) {
    var t = or(e),
      n = On(e, t);
    if (n !== null) {
      var r = lt();
      Qt(n, e, t, r);
    }
    tf(e, t);
  }
};
Zg = function () {
  return he;
};
ey = function (e, t) {
  var n = he;
  try {
    return (he = e), t();
  } finally {
    he = n;
  }
};
ru = function (e, t, n) {
  switch (t) {
    case "input":
      if ((Xc(e, n), (t = n.name), n.type === "radio" && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll(
            "input[name=" + JSON.stringify("" + t) + '][type="radio"]'
          ),
            t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var o = Xl(r);
            if (!o) throw Error(H(90));
            Ng(r), Xc(r, o);
          }
        }
      }
      break;
    case "textarea":
      jg(e, n);
      break;
    case "select":
      (t = n.value), t != null && mo(e, !!n.multiple, t, !1);
  }
};
zg = Xd;
Bg = Lr;
var eb = { usingClientEntryPoint: !1, Events: [Zs, so, Xl, Mg, Ig, Xd] },
  is = {
    findFiberByHostInstance: br,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  tb = {
    bundleType: is.bundleType,
    version: is.version,
    rendererPackageName: is.rendererPackageName,
    rendererConfig: is.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: An.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return (e = Ug(e)), e === null ? null : e.stateNode;
    },
    findFiberByHostInstance: is.findFiberByHostInstance || JS,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ti = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ti.isDisabled && Ti.supportsFiber)
    try {
      (Yl = Ti.inject(tb)), (yn = Ti);
    } catch {}
}
_t.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = eb;
_t.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!rf(t)) throw Error(H(200));
  return QS(e, t, null, n);
};
_t.createRoot = function (e, t) {
  if (!rf(e)) throw Error(H(299));
  var n = !1,
    r = "",
    o = bv;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
    (t = ef(e, 1, !1, null, null, n, !1, r, o)),
    (e[Nn] = t.current),
    js(e.nodeType === 8 ? e.parentNode : e),
    new nf(t)
  );
};
_t.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(H(188))
      : ((e = Object.keys(e).join(",")), Error(H(268, e)));
  return (e = Ug(t)), (e = e === null ? null : e.stateNode), e;
};
_t.flushSync = function (e) {
  return Lr(e);
};
_t.hydrate = function (e, t, n) {
  if (!sa(t)) throw Error(H(200));
  return ia(null, e, t, !0, n);
};
_t.hydrateRoot = function (e, t, n) {
  if (!rf(e)) throw Error(H(405));
  var r = (n != null && n.hydratedSources) || null,
    o = !1,
    s = "",
    i = bv;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (o = !0),
      n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (t = Sv(t, null, e, 1, n ?? null, o, !1, s, i)),
    (e[Nn] = t.current),
    js(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      (n = r[e]),
        (o = n._getVersion),
        (o = o(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, o])
          : t.mutableSourceEagerHydrationData.push(n, o);
  return new oa(t);
};
_t.render = function (e, t, n) {
  if (!sa(t)) throw Error(H(200));
  return ia(null, e, t, !1, n);
};
_t.unmountComponentAtNode = function (e) {
  if (!sa(e)) throw Error(H(40));
  return e._reactRootContainer
    ? (Lr(function () {
        ia(null, null, e, !1, function () {
          (e._reactRootContainer = null), (e[Nn] = null);
        });
      }),
      !0)
    : !1;
};
_t.unstable_batchedUpdates = Xd;
_t.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!sa(n)) throw Error(H(200));
  if (e == null || e._reactInternals === void 0) throw Error(H(38));
  return ia(e, t, n, !1, r);
};
_t.version = "18.3.1-next-f1338f8080-20240426";
function Cv() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Cv);
    } catch (e) {
      console.error(e);
    }
}
Cv(), (Cg.exports = _t);
var ti = Cg.exports;
const nb = zr(ti);
var Am = ti;
(Hc.createRoot = Am.createRoot), (Hc.hydrateRoot = Am.hydrateRoot);
var gn = function () {
  return (
    (gn =
      Object.assign ||
      function (t) {
        for (var n, r = 1, o = arguments.length; r < o; r++) {
          n = arguments[r];
          for (var s in n)
            Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
        }
        return t;
      }),
    gn.apply(this, arguments)
  );
};
function Ev(e, t) {
  var n = {};
  for (var r in e)
    Object.prototype.hasOwnProperty.call(e, r) &&
      t.indexOf(r) < 0 &&
      (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, r = Object.getOwnPropertySymbols(e); o < r.length; o++)
      t.indexOf(r[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, r[o]) &&
        (n[r[o]] = e[r[o]]);
  return n;
}
function rb(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, o = t.length, s; r < o; r++)
      (s || !(r in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, r)), (s[r] = t[r]));
  return e.concat(s || Array.prototype.slice.call(t));
}
var Zi = "right-scroll-bar-position",
  el = "width-before-scroll-bar",
  ob = "with-scroll-bars-hidden",
  sb = "--removed-body-scroll-bar-size";
function Ec(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function ib(e, t) {
  var n = y.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var o = n.value;
          o !== r && ((n.value = r), n.callback(r, o));
        },
      },
    };
  })[0];
  return (n.callback = t), n.facade;
}
var lb = typeof window < "u" ? y.useLayoutEffect : y.useEffect,
  Fm = new WeakMap();
function ab(e, t) {
  var n = ib(null, function (r) {
    return e.forEach(function (o) {
      return Ec(o, r);
    });
  });
  return (
    lb(
      function () {
        var r = Fm.get(n);
        if (r) {
          var o = new Set(r),
            s = new Set(e),
            i = n.current;
          o.forEach(function (l) {
            s.has(l) || Ec(l, null);
          }),
            s.forEach(function (l) {
              o.has(l) || Ec(l, i);
            });
        }
        Fm.set(n, e);
      },
      [e]
    ),
    n
  );
}
function cb(e) {
  return e;
}
function ub(e, t) {
  t === void 0 && (t = cb);
  var n = [],
    r = !1,
    o = {
      read: function () {
        if (r)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`."
          );
        return n.length ? n[n.length - 1] : e;
      },
      useMedium: function (s) {
        var i = t(s, r);
        return (
          n.push(i),
          function () {
            n = n.filter(function (l) {
              return l !== i;
            });
          }
        );
      },
      assignSyncMedium: function (s) {
        for (r = !0; n.length; ) {
          var i = n;
          (n = []), i.forEach(s);
        }
        n = {
          push: function (l) {
            return s(l);
          },
          filter: function () {
            return n;
          },
        };
      },
      assignMedium: function (s) {
        r = !0;
        var i = [];
        if (n.length) {
          var l = n;
          (n = []), l.forEach(s), (i = n);
        }
        var a = function () {
            var u = i;
            (i = []), u.forEach(s);
          },
          c = function () {
            return Promise.resolve().then(a);
          };
        c(),
          (n = {
            push: function (u) {
              i.push(u), c();
            },
            filter: function (u) {
              return (i = i.filter(u)), n;
            },
          });
      },
    };
  return o;
}
function db(e) {
  e === void 0 && (e = {});
  var t = ub(null);
  return (t.options = gn({ async: !0, ssr: !1 }, e)), t;
}
var kv = function (e) {
  var t = e.sideCar,
    n = Ev(e, ["sideCar"]);
  if (!t)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car"
    );
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return y.createElement(r, gn({}, n));
};
kv.isSideCarExport = !0;
function fb(e, t) {
  return e.useMedium(t), kv;
}
var _v = db(),
  kc = function () {},
  la = y.forwardRef(function (e, t) {
    var n = y.useRef(null),
      r = y.useState({
        onScrollCapture: kc,
        onWheelCapture: kc,
        onTouchMoveCapture: kc,
      }),
      o = r[0],
      s = r[1],
      i = e.forwardProps,
      l = e.children,
      a = e.className,
      c = e.removeScrollBar,
      u = e.enabled,
      d = e.shards,
      f = e.sideCar,
      m = e.noIsolation,
      p = e.inert,
      h = e.allowPinchZoom,
      S = e.as,
      v = S === void 0 ? "div" : S,
      w = e.gapMode,
      g = Ev(e, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      b = f,
      C = ab([n, t]),
      E = gn(gn({}, g), o);
    return y.createElement(
      y.Fragment,
      null,
      u &&
        y.createElement(b, {
          sideCar: _v,
          removeScrollBar: c,
          shards: d,
          noIsolation: m,
          inert: p,
          setCallbacks: s,
          allowPinchZoom: !!h,
          lockRef: n,
          gapMode: w,
        }),
      i
        ? y.cloneElement(y.Children.only(l), gn(gn({}, E), { ref: C }))
        : y.createElement(v, gn({}, E, { className: a, ref: C }), l)
    );
  });
la.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
la.classNames = { fullWidth: el, zeroRight: Zi };
var pb = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function mb() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = pb();
  return t && e.setAttribute("nonce", t), e;
}
function hb(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function gb(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var yb = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        e == 0 && (t = mb()) && (hb(t, n), gb(t)), e++;
      },
      remove: function () {
        e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null));
      },
    };
  },
  vb = function () {
    var e = yb();
    return function (t, n) {
      y.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n]
      );
    };
  },
  Rv = function () {
    var e = vb(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return e(r, o), null;
      };
    return t;
  },
  wb = { left: 0, top: 0, right: 0, gap: 0 },
  _c = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  xb = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [_c(n), _c(r), _c(o)];
  },
  Sb = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return wb;
    var t = xb(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    };
  },
  bb = Rv(),
  xo = "data-scroll-locked",
  Cb = function (e, t, n, r) {
    var o = e.left,
      s = e.top,
      i = e.right,
      l = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          ob,
          ` {
   overflow: hidden `
        )
        .concat(
          r,
          `;
   padding-right: `
        )
        .concat(l, "px ")
        .concat(
          r,
          `;
  }
  body[`
        )
        .concat(
          xo,
          `] {
    overflow: hidden `
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `
        )
        .concat(
          [
            t && "position: relative ".concat(r, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  o,
                  `px;
    padding-top: `
                )
                .concat(
                  s,
                  `px;
    padding-right: `
                )
                .concat(
                  i,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `
                )
                .concat(l, "px ")
                .concat(
                  r,
                  `;
    `
                ),
            n === "padding" &&
              "padding-right: ".concat(l, "px ").concat(r, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`
        )
        .concat(
          Zi,
          ` {
    right: `
        )
        .concat(l, "px ")
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(
          el,
          ` {
    margin-right: `
        )
        .concat(l, "px ")
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Zi, " .")
        .concat(
          Zi,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(el, " .")
        .concat(
          el,
          ` {
    margin-right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  body[`
        )
        .concat(
          xo,
          `] {
    `
        )
        .concat(sb, ": ")
        .concat(
          l,
          `px;
  }
`
        )
    );
  },
  Mm = function () {
    var e = parseInt(document.body.getAttribute(xo) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  Eb = function () {
    y.useEffect(function () {
      return (
        document.body.setAttribute(xo, (Mm() + 1).toString()),
        function () {
          var e = Mm() - 1;
          e <= 0
            ? document.body.removeAttribute(xo)
            : document.body.setAttribute(xo, e.toString());
        }
      );
    }, []);
  },
  kb = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    Eb();
    var s = y.useMemo(
      function () {
        return Sb(o);
      },
      [o]
    );
    return y.createElement(bb, { styles: Cb(s, !t, o, n ? "" : "!important") });
  },
  Au = !1;
if (typeof window < "u")
  try {
    var Ni = Object.defineProperty({}, "passive", {
      get: function () {
        return (Au = !0), !0;
      },
    });
    window.addEventListener("test", Ni, Ni),
      window.removeEventListener("test", Ni, Ni);
  } catch {
    Au = !1;
  }
var Gr = Au ? { passive: !1 } : !1,
  _b = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Dv = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== "hidden" &&
      !(n.overflowY === n.overflowX && !_b(e) && n[t] === "visible")
    );
  },
  Rb = function (e) {
    return Dv(e, "overflowY");
  },
  Db = function (e) {
    return Dv(e, "overflowX");
  },
  Im = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = Pv(e, r);
      if (o) {
        var s = Tv(e, r),
          i = s[1],
          l = s[2];
        if (i > l) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  Pb = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Tb = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  Pv = function (e, t) {
    return e === "v" ? Rb(t) : Db(t);
  },
  Tv = function (e, t) {
    return e === "v" ? Pb(t) : Tb(t);
  },
  Nb = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  Ob = function (e, t, n, r, o) {
    var s = Nb(e, window.getComputedStyle(t).direction),
      i = s * r,
      l = n.target,
      a = t.contains(l),
      c = !1,
      u = i > 0,
      d = 0,
      f = 0;
    do {
      var m = Tv(e, l),
        p = m[0],
        h = m[1],
        S = m[2],
        v = h - S - s * p;
      (p || v) && Pv(e, l) && ((d += v), (f += p)),
        l instanceof ShadowRoot ? (l = l.host) : (l = l.parentNode);
    } while ((!a && l !== document.body) || (a && (t.contains(l) || t === l)));
    return (
      ((u && (Math.abs(d) < 1 || !o)) || (!u && (Math.abs(f) < 1 || !o))) &&
        (c = !0),
      c
    );
  },
  Oi = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  zm = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Bm = function (e) {
    return e && "current" in e ? e.current : e;
  },
  jb = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  $b = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`
      )
      .concat(
        e,
        ` {pointer-events: all;}
`
      );
  },
  Lb = 0,
  Xr = [];
function Ab(e) {
  var t = y.useRef([]),
    n = y.useRef([0, 0]),
    r = y.useRef(),
    o = y.useState(Lb++)[0],
    s = y.useState(Rv)[0],
    i = y.useRef(e);
  y.useEffect(
    function () {
      i.current = e;
    },
    [e]
  ),
    y.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var h = rb([e.lockRef.current], (e.shards || []).map(Bm), !0).filter(
            Boolean
          );
          return (
            h.forEach(function (S) {
              return S.classList.add("allow-interactivity-".concat(o));
            }),
            function () {
              document.body.classList.remove("block-interactivity-".concat(o)),
                h.forEach(function (S) {
                  return S.classList.remove("allow-interactivity-".concat(o));
                });
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards]
    );
  var l = y.useCallback(function (h, S) {
      if ("touches" in h && h.touches.length === 2)
        return !i.current.allowPinchZoom;
      var v = Oi(h),
        w = n.current,
        g = "deltaX" in h ? h.deltaX : w[0] - v[0],
        b = "deltaY" in h ? h.deltaY : w[1] - v[1],
        C,
        E = h.target,
        _ = Math.abs(g) > Math.abs(b) ? "h" : "v";
      if ("touches" in h && _ === "h" && E.type === "range") return !1;
      var D = Im(_, E);
      if (!D) return !0;
      if ((D ? (C = _) : ((C = _ === "v" ? "h" : "v"), (D = Im(_, E))), !D))
        return !1;
      if (
        (!r.current && "changedTouches" in h && (g || b) && (r.current = C), !C)
      )
        return !0;
      var L = r.current || C;
      return Ob(L, S, h, L === "h" ? g : b, !0);
    }, []),
    a = y.useCallback(function (h) {
      var S = h;
      if (!(!Xr.length || Xr[Xr.length - 1] !== s)) {
        var v = "deltaY" in S ? zm(S) : Oi(S),
          w = t.current.filter(function (C) {
            return (
              C.name === S.type &&
              (C.target === S.target || S.target === C.shadowParent) &&
              jb(C.delta, v)
            );
          })[0];
        if (w && w.should) {
          S.cancelable && S.preventDefault();
          return;
        }
        if (!w) {
          var g = (i.current.shards || [])
              .map(Bm)
              .filter(Boolean)
              .filter(function (C) {
                return C.contains(S.target);
              }),
            b = g.length > 0 ? l(S, g[0]) : !i.current.noIsolation;
          b && S.cancelable && S.preventDefault();
        }
      }
    }, []),
    c = y.useCallback(function (h, S, v, w) {
      var g = { name: h, delta: S, target: v, should: w, shadowParent: Fb(v) };
      t.current.push(g),
        setTimeout(function () {
          t.current = t.current.filter(function (b) {
            return b !== g;
          });
        }, 1);
    }, []),
    u = y.useCallback(function (h) {
      (n.current = Oi(h)), (r.current = void 0);
    }, []),
    d = y.useCallback(function (h) {
      c(h.type, zm(h), h.target, l(h, e.lockRef.current));
    }, []),
    f = y.useCallback(function (h) {
      c(h.type, Oi(h), h.target, l(h, e.lockRef.current));
    }, []);
  y.useEffect(function () {
    return (
      Xr.push(s),
      e.setCallbacks({
        onScrollCapture: d,
        onWheelCapture: d,
        onTouchMoveCapture: f,
      }),
      document.addEventListener("wheel", a, Gr),
      document.addEventListener("touchmove", a, Gr),
      document.addEventListener("touchstart", u, Gr),
      function () {
        (Xr = Xr.filter(function (h) {
          return h !== s;
        })),
          document.removeEventListener("wheel", a, Gr),
          document.removeEventListener("touchmove", a, Gr),
          document.removeEventListener("touchstart", u, Gr);
      }
    );
  }, []);
  var m = e.removeScrollBar,
    p = e.inert;
  return y.createElement(
    y.Fragment,
    null,
    p ? y.createElement(s, { styles: $b(o) }) : null,
    m ? y.createElement(kb, { gapMode: e.gapMode }) : null
  );
}
function Fb(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode);
  return t;
}
const Mb = fb(_v, Ab);
var Nv = y.forwardRef(function (e, t) {
  return y.createElement(la, gn({}, e, { ref: t, sideCar: Mb }));
});
Nv.classNames = la.classNames;
function wn(e) {
  return Object.keys(e);
}
function Rc(e) {
  return e && typeof e == "object" && !Array.isArray(e);
}
function of(e, t) {
  const n = { ...e },
    r = t;
  return (
    Rc(e) &&
      Rc(t) &&
      Object.keys(t).forEach((o) => {
        Rc(r[o]) && o in e ? (n[o] = of(n[o], r[o])) : (n[o] = r[o]);
      }),
    n
  );
}
function Ib(e) {
  return e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function zb(e) {
  var t;
  return typeof e != "string" || !e.includes("var(--mantine-scale)")
    ? e
    : (t = e.match(/^calc\((.*?)\)$/)) == null
    ? void 0
    : t[1].split("*")[0].trim();
}
function Bb(e) {
  const t = zb(e);
  return typeof t == "number"
    ? t
    : typeof t == "string"
    ? t.includes("calc") || t.includes("var")
      ? t
      : t.includes("px")
      ? Number(t.replace("px", ""))
      : t.includes("rem")
      ? Number(t.replace("rem", "")) * 16
      : t.includes("em")
      ? Number(t.replace("em", "")) * 16
      : Number(t)
    : NaN;
}
function Dc(e) {
  return e === "0rem" ? "0rem" : `calc(${e} * var(--mantine-scale))`;
}
function Ov(e, { shouldScale: t = !1 } = {}) {
  function n(r) {
    if (r === 0 || r === "0") return `0${e}`;
    if (typeof r == "number") {
      const o = `${r / 16}${e}`;
      return t ? Dc(o) : o;
    }
    if (typeof r == "string") {
      if (
        r === "" ||
        r.startsWith("calc(") ||
        r.startsWith("clamp(") ||
        r.includes("rgba(")
      )
        return r;
      if (r.includes(","))
        return r
          .split(",")
          .map((s) => n(s))
          .join(",");
      if (r.includes(" "))
        return r
          .split(" ")
          .map((s) => n(s))
          .join(" ");
      if (r.includes(e)) return t ? Dc(r) : r;
      const o = r.replace("px", "");
      if (!Number.isNaN(Number(o))) {
        const s = `${Number(o) / 16}${e}`;
        return t ? Dc(s) : s;
      }
    }
    return r;
  }
  return n;
}
const z = Ov("rem", { shouldScale: !0 }),
  Vm = Ov("em");
function sf(e) {
  return Object.keys(e).reduce(
    (t, n) => (e[n] !== void 0 && (t[n] = e[n]), t),
    {}
  );
}
function jv(e) {
  return typeof e == "number"
    ? !0
    : typeof e == "string"
    ? e.startsWith("calc(") ||
      e.startsWith("var(") ||
      (e.includes(" ") && e.trim() !== "")
      ? !0
      : /[0-9]/.test(e.trim().replace("-", "")[0])
    : !1;
}
function Hr(e) {
  return Array.isArray(e) || e === null
    ? !1
    : typeof e == "object"
    ? e.type !== y.Fragment
    : !1;
}
function pr(e) {
  const t = y.createContext(null);
  return [
    ({ children: o, value: s }) => x.jsx(t.Provider, { value: s, children: o }),
    () => {
      const o = y.useContext(t);
      if (o === null) throw new Error(e);
      return o;
    },
  ];
}
function lf(e = null) {
  const t = y.createContext(e);
  return [
    ({ children: o, value: s }) => x.jsx(t.Provider, { value: s, children: o }),
    () => y.useContext(t),
  ];
}
const Vb = { app: 100, modal: 200, popover: 300, overlay: 400, max: 9999 };
function Ur(e) {
  return Vb[e];
}
const Hb = () => {};
function Ub(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active
    ? t.onKeyDown || Hb
    : (n) => {
        var r;
        n.key === "Escape" && (e(n), (r = t.onTrigger) == null || r.call(t));
      };
}
function Ee(e, t = "size", n = !0) {
  if (e !== void 0) return jv(e) ? (n ? z(e) : e) : `var(--${t}-${e})`;
}
function aa(e) {
  return Ee(e, "mantine-spacing");
}
function Sn(e) {
  return e === void 0
    ? "var(--mantine-radius-default)"
    : Ee(e, "mantine-radius");
}
function et(e) {
  return Ee(e, "mantine-font-size");
}
function Wb(e) {
  return Ee(e, "mantine-line-height", !1);
}
function af(e) {
  if (e) return Ee(e, "mantine-shadow", !1);
}
function Dl(e, t) {
  return (n) => {
    e == null || e(n), t == null || t(n);
  };
}
function Yb(e, t, n) {
  return t === void 0 && n === void 0
    ? e
    : t !== void 0 && n === void 0
    ? Math.max(e, t)
    : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function $v() {
  return `mantine-${Math.random().toString(36).slice(2, 11)}`;
}
function Hm(e) {
  return typeof e != "string" ? "" : e.charAt(0).toUpperCase() + e.slice(1);
}
function xr(e) {
  const t = y.useRef(e);
  return (
    y.useEffect(() => {
      t.current = e;
    }),
    y.useMemo(
      () =>
        (...n) => {
          var r;
          return (r = t.current) == null ? void 0 : r.call(t, ...n);
        },
      []
    )
  );
}
function ca(e, t) {
  const n = xr(e),
    r = y.useRef(0);
  return (
    y.useEffect(() => () => window.clearTimeout(r.current), []),
    y.useCallback(
      (...o) => {
        window.clearTimeout(r.current),
          (r.current = window.setTimeout(() => n(...o), t));
      },
      [n, t]
    )
  );
}
const Um = ["mousedown", "touchstart"];
function Kb(e, t, n) {
  const r = y.useRef();
  return (
    y.useEffect(() => {
      const o = (s) => {
        const { target: i } = s ?? {};
        if (Array.isArray(n)) {
          const l =
            (i == null
              ? void 0
              : i.hasAttribute("data-ignore-outside-clicks")) ||
            (!document.body.contains(i) && i.tagName !== "HTML");
          n.every((c) => !!c && !s.composedPath().includes(c)) && !l && e();
        } else r.current && !r.current.contains(i) && e();
      };
      return (
        (t || Um).forEach((s) => document.addEventListener(s, o)),
        () => {
          (t || Um).forEach((s) => document.removeEventListener(s, o));
        }
      );
    }, [r, e, n]),
    r
  );
}
function qb(e, t) {
  try {
    return (
      e.addEventListener("change", t), () => e.removeEventListener("change", t)
    );
  } catch {
    return e.addListener(t), () => e.removeListener(t);
  }
}
function Gb(e, t) {
  return typeof window < "u" && "matchMedia" in window
    ? window.matchMedia(e).matches
    : !1;
}
function Xb(
  e,
  t,
  { getInitialValueInEffect: n } = { getInitialValueInEffect: !0 }
) {
  const [r, o] = y.useState(n ? t : Gb(e)),
    s = y.useRef();
  return (
    y.useEffect(() => {
      if ("matchMedia" in window)
        return (
          (s.current = window.matchMedia(e)),
          o(s.current.matches),
          qb(s.current, (i) => o(i.matches))
        );
    }, [e]),
    r
  );
}
const ni = typeof document < "u" ? y.useLayoutEffect : y.useEffect;
function Ar(e, t) {
  const n = y.useRef(!1);
  y.useEffect(
    () => () => {
      n.current = !1;
    },
    []
  ),
    y.useEffect(() => {
      if (n.current) return e();
      n.current = !0;
    }, t);
}
function Lv({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = y.useRef(),
    r = () => {
      var o;
      n.current &&
        "focus" in n.current &&
        typeof n.current.focus == "function" &&
        ((o = n.current) == null || o.focus({ preventScroll: !0 }));
    };
  return (
    Ar(() => {
      let o = -1;
      const s = (i) => {
        i.key === "Tab" && window.clearTimeout(o);
      };
      return (
        document.addEventListener("keydown", s),
        e
          ? (n.current = document.activeElement)
          : t && (o = window.setTimeout(r, 10)),
        () => {
          window.clearTimeout(o), document.removeEventListener("keydown", s);
        }
      );
    }, [e, t]),
    r
  );
}
function Qb(e, t = "body > :not(script)") {
  const n = $v(),
    r = Array.from(document.querySelectorAll(t)).map((o) => {
      var a;
      if (
        ((a = o == null ? void 0 : o.shadowRoot) != null && a.contains(e)) ||
        o.contains(e)
      )
        return;
      const s = o.getAttribute("aria-hidden"),
        i = o.getAttribute("data-hidden"),
        l = o.getAttribute("data-focus-id");
      return (
        o.setAttribute("data-focus-id", n),
        s === null || s === "false"
          ? o.setAttribute("aria-hidden", "true")
          : !i && !l && o.setAttribute("data-hidden", s),
        { node: o, ariaHidden: i || null }
      );
    });
  return () => {
    r.forEach((o) => {
      !o ||
        n !== o.node.getAttribute("data-focus-id") ||
        (o.ariaHidden === null
          ? o.node.removeAttribute("aria-hidden")
          : o.node.setAttribute("aria-hidden", o.ariaHidden),
        o.node.removeAttribute("data-focus-id"),
        o.node.removeAttribute("data-hidden"));
    });
  };
}
const Jb = /input|select|textarea|button|object/,
  Av = "a, input, select, textarea, button, object, [tabindex]";
function Zb(e) {
  return e.style.display === "none";
}
function eC(e) {
  if (
    e.getAttribute("aria-hidden") ||
    e.getAttribute("hidden") ||
    e.getAttribute("type") === "hidden"
  )
    return !1;
  let n = e;
  for (; n && !(n === document.body || n.nodeType === 11); ) {
    if (Zb(n)) return !1;
    n = n.parentNode;
  }
  return !0;
}
function Fv(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function Fu(e) {
  const t = e.nodeName.toLowerCase(),
    n = !Number.isNaN(Fv(e));
  return (
    ((Jb.test(t) && !e.disabled) ||
      (e instanceof HTMLAnchorElement && e.href) ||
      n) &&
    eC(e)
  );
}
function Mv(e) {
  const t = Fv(e);
  return (Number.isNaN(t) || t >= 0) && Fu(e);
}
function tC(e) {
  return Array.from(e.querySelectorAll(Av)).filter(Mv);
}
function nC(e, t) {
  const n = tC(e);
  if (!n.length) {
    t.preventDefault();
    return;
  }
  const r = n[t.shiftKey ? 0 : n.length - 1],
    o = e.getRootNode();
  let s = r === o.activeElement || e === o.activeElement;
  const i = o.activeElement;
  if (
    (i.tagName === "INPUT" &&
      i.getAttribute("type") === "radio" &&
      (s = n
        .filter(
          (u) =>
            u.getAttribute("type") === "radio" &&
            u.getAttribute("name") === i.getAttribute("name")
        )
        .includes(r)),
    !s)
  )
    return;
  t.preventDefault();
  const a = n[t.shiftKey ? n.length - 1 : 0];
  a && a.focus();
}
function rC(e = !0) {
  const t = y.useRef(),
    n = y.useRef(null),
    r = (s) => {
      let i = s.querySelector("[data-autofocus]");
      if (!i) {
        const l = Array.from(s.querySelectorAll(Av));
        (i = l.find(Mv) || l.find(Fu) || null), !i && Fu(s) && (i = s);
      }
      i && i.focus({ preventScroll: !0 });
    },
    o = y.useCallback(
      (s) => {
        if (e) {
          if (s === null) {
            n.current && (n.current(), (n.current = null));
            return;
          }
          (n.current = Qb(s)),
            t.current !== s &&
              (s
                ? (setTimeout(() => {
                    s.getRootNode() && r(s);
                  }),
                  (t.current = s))
                : (t.current = null));
        }
      },
      [e]
    );
  return (
    y.useEffect(() => {
      if (!e) return;
      t.current && setTimeout(() => r(t.current));
      const s = (i) => {
        i.key === "Tab" && t.current && nC(t.current, i);
      };
      return (
        document.addEventListener("keydown", s),
        () => {
          document.removeEventListener("keydown", s), n.current && n.current();
        }
      );
    }, [e]),
    o
  );
}
const oC = Wl.useId || (() => {});
function sC() {
  const e = oC();
  return e ? `mantine-${e.replace(/:/g, "")}` : "";
}
function Wr(e) {
  const t = sC(),
    [n, r] = y.useState(t);
  return (
    ni(() => {
      r($v());
    }, []),
    typeof e == "string" ? e : typeof window > "u" ? t : n
  );
}
function iC(e, t, n) {
  y.useEffect(
    () => (
      window.addEventListener(e, t, n),
      () => window.removeEventListener(e, t, n)
    ),
    [e, t]
  );
}
function cf(e, t) {
  typeof e == "function"
    ? e(t)
    : typeof e == "object" && e !== null && "current" in e && (e.current = t);
}
function Iv(...e) {
  return (t) => {
    e.forEach((n) => cf(n, t));
  };
}
function Dt(...e) {
  return y.useCallback(Iv(...e), e);
}
function $n({
  value: e,
  defaultValue: t,
  finalValue: n,
  onChange: r = () => {},
}) {
  const [o, s] = y.useState(t !== void 0 ? t : n),
    i = (l, ...a) => {
      s(l), r == null || r(l, ...a);
    };
  return e !== void 0 ? [e, r, !0] : [o, i, !1];
}
function uf(e, t) {
  return Xb("(prefers-reduced-motion: reduce)", e, t);
}
function Vs(e = !1, t) {
  const { onOpen: n, onClose: r } = t || {},
    [o, s] = y.useState(e),
    i = y.useCallback(() => {
      s((c) => c || (n == null || n(), !0));
    }, [n]),
    l = y.useCallback(() => {
      s((c) => c && (r == null || r(), !1));
    }, [r]),
    a = y.useCallback(() => {
      o ? l() : i();
    }, [l, i, o]);
  return [o, { open: i, close: l, toggle: a }];
}
var lC = {};
function aC() {
  return typeof process < "u" && lC ? "production" : "development";
}
function zv(e) {
  var t,
    n,
    r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (n = zv(e[t])) && (r && (r += " "), (r += n));
    } else for (n in e) e[n] && (r && (r += " "), (r += n));
  return r;
}
function at() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = zv(e)) && (r && (r += " "), (r += t));
  return r;
}
const cC = {};
function uC(e) {
  const t = {};
  return (
    e.forEach((n) => {
      Object.entries(n).forEach(([r, o]) => {
        t[r] ? (t[r] = at(t[r], o)) : (t[r] = o);
      });
    }),
    t
  );
}
function ua({ theme: e, classNames: t, props: n, stylesCtx: r }) {
  const s = (Array.isArray(t) ? t : [t]).map((i) =>
    typeof i == "function" ? i(e, n, r) : i || cC
  );
  return uC(s);
}
function Pl({ theme: e, styles: t, props: n, stylesCtx: r }) {
  return (Array.isArray(t) ? t : [t]).reduce(
    (s, i) =>
      typeof i == "function" ? { ...s, ...i(e, n, r) } : { ...s, ...i },
    {}
  );
}
const Bv = y.createContext(null);
function Yr() {
  const e = y.useContext(Bv);
  if (!e)
    throw new Error("[@mantine/core] MantineProvider was not found in tree");
  return e;
}
function dC() {
  return Yr().cssVariablesResolver;
}
function fC() {
  return Yr().classNamesPrefix;
}
function df() {
  return Yr().getStyleNonce;
}
function pC() {
  return Yr().withStaticClasses;
}
function mC() {
  return Yr().headless;
}
function hC() {
  var e;
  return (e = Yr().stylesTransform) == null ? void 0 : e.sx;
}
function gC() {
  var e;
  return (e = Yr().stylesTransform) == null ? void 0 : e.styles;
}
function yC(e) {
  return /^#?([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(e);
}
function vC(e) {
  let t = e.replace("#", "");
  if (t.length === 3) {
    const i = t.split("");
    t = [i[0], i[0], i[1], i[1], i[2], i[2]].join("");
  }
  if (t.length === 8) {
    const i = parseInt(t.slice(6, 8), 16) / 255;
    return {
      r: parseInt(t.slice(0, 2), 16),
      g: parseInt(t.slice(2, 4), 16),
      b: parseInt(t.slice(4, 6), 16),
      a: i,
    };
  }
  const n = parseInt(t, 16),
    r = (n >> 16) & 255,
    o = (n >> 8) & 255,
    s = n & 255;
  return { r, g: o, b: s, a: 1 };
}
function wC(e) {
  const [t, n, r, o] = e
    .replace(/[^0-9,./]/g, "")
    .split(/[/,]/)
    .map(Number);
  return { r: t, g: n, b: r, a: o || 1 };
}
function xC(e) {
  const t =
      /^hsla?\(\s*(\d+)\s*,\s*(\d+%)\s*,\s*(\d+%)\s*(,\s*(0?\.\d+|\d+(\.\d+)?))?\s*\)$/i,
    n = e.match(t);
  if (!n) return { r: 0, g: 0, b: 0, a: 1 };
  const r = parseInt(n[1], 10),
    o = parseInt(n[2], 10) / 100,
    s = parseInt(n[3], 10) / 100,
    i = n[5] ? parseFloat(n[5]) : void 0,
    l = (1 - Math.abs(2 * s - 1)) * o,
    a = r / 60,
    c = l * (1 - Math.abs((a % 2) - 1)),
    u = s - l / 2;
  let d, f, m;
  return (
    a >= 0 && a < 1
      ? ((d = l), (f = c), (m = 0))
      : a >= 1 && a < 2
      ? ((d = c), (f = l), (m = 0))
      : a >= 2 && a < 3
      ? ((d = 0), (f = l), (m = c))
      : a >= 3 && a < 4
      ? ((d = 0), (f = c), (m = l))
      : a >= 4 && a < 5
      ? ((d = c), (f = 0), (m = l))
      : ((d = l), (f = 0), (m = c)),
    {
      r: Math.round((d + u) * 255),
      g: Math.round((f + u) * 255),
      b: Math.round((m + u) * 255),
      a: i || 1,
    }
  );
}
function ff(e) {
  return yC(e)
    ? vC(e)
    : e.startsWith("rgb")
    ? wC(e)
    : e.startsWith("hsl")
    ? xC(e)
    : { r: 0, g: 0, b: 0, a: 1 };
}
function ji(e, t) {
  if (e.startsWith("var("))
    return `color-mix(in srgb, ${e}, black ${t * 100}%)`;
  const { r: n, g: r, b: o, a: s } = ff(e),
    i = 1 - t,
    l = (a) => Math.round(a * i);
  return `rgba(${l(n)}, ${l(r)}, ${l(o)}, ${s})`;
}
function Hs(e, t) {
  return typeof e.primaryShade == "number"
    ? e.primaryShade
    : t === "dark"
    ? e.primaryShade.dark
    : e.primaryShade.light;
}
function Pc(e) {
  return e <= 0.03928 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4;
}
function SC(e) {
  const t = e.match(/oklch\((.*?)%\s/);
  return t ? parseFloat(t[1]) : null;
}
function bC(e) {
  if (e.startsWith("oklch(")) return (SC(e) || 0) / 100;
  const { r: t, g: n, b: r } = ff(e),
    o = t / 255,
    s = n / 255,
    i = r / 255,
    l = Pc(o),
    a = Pc(s),
    c = Pc(i);
  return 0.2126 * l + 0.7152 * a + 0.0722 * c;
}
function ls(e, t = 0.179) {
  return e.startsWith("var(") ? !1 : bC(e) > t;
}
function zo({ color: e, theme: t, colorScheme: n }) {
  if (typeof e != "string")
    throw new Error(
      `[@mantine/core] Failed to parse color. Expected color to be a string, instead got ${typeof e}`
    );
  if (e === "bright")
    return {
      color: e,
      value: n === "dark" ? t.white : t.black,
      shade: void 0,
      isThemeColor: !1,
      isLight: ls(n === "dark" ? t.white : t.black, t.luminanceThreshold),
      variable: "--mantine-color-bright",
    };
  if (e === "dimmed")
    return {
      color: e,
      value: n === "dark" ? t.colors.dark[2] : t.colors.gray[7],
      shade: void 0,
      isThemeColor: !1,
      isLight: ls(
        n === "dark" ? t.colors.dark[2] : t.colors.gray[6],
        t.luminanceThreshold
      ),
      variable: "--mantine-color-dimmed",
    };
  if (e === "white" || e === "black")
    return {
      color: e,
      value: e === "white" ? t.white : t.black,
      shade: void 0,
      isThemeColor: !1,
      isLight: ls(e === "white" ? t.white : t.black, t.luminanceThreshold),
      variable: `--mantine-color-${e}`,
    };
  const [r, o] = e.split("."),
    s = o ? Number(o) : void 0,
    i = r in t.colors;
  if (i) {
    const l = s !== void 0 ? t.colors[r][s] : t.colors[r][Hs(t, n || "light")];
    return {
      color: r,
      value: l,
      shade: s,
      isThemeColor: i,
      isLight: ls(l, t.luminanceThreshold),
      variable: o ? `--mantine-color-${r}-${s}` : `--mantine-color-${r}-filled`,
    };
  }
  return {
    color: e,
    value: e,
    isThemeColor: i,
    isLight: ls(e, t.luminanceThreshold),
    shade: s,
    variable: void 0,
  };
}
function No(e, t) {
  const n = zo({ color: e || t.primaryColor, theme: t });
  return n.variable ? `var(${n.variable})` : e;
}
function Mu(e, t) {
  const n = {
      from: (e == null ? void 0 : e.from) || t.defaultGradient.from,
      to: (e == null ? void 0 : e.to) || t.defaultGradient.to,
      deg: (e == null ? void 0 : e.deg) || t.defaultGradient.deg || 0,
    },
    r = No(n.from, t),
    o = No(n.to, t);
  return `linear-gradient(${n.deg}deg, ${r} 0%, ${o} 100%)`;
}
function pn(e, t) {
  if (typeof e != "string" || t > 1 || t < 0) return "rgba(0, 0, 0, 1)";
  if (e.startsWith("var(")) {
    const s = (1 - t) * 100;
    return `color-mix(in srgb, ${e}, transparent ${s}%)`;
  }
  if (e.startsWith("oklch"))
    return e.includes("/")
      ? e.replace(/\/\s*[\d.]+\s*\)/, `/ ${t})`)
      : e.replace(")", ` / ${t})`);
  const { r: n, g: r, b: o } = ff(e);
  return `rgba(${n}, ${r}, ${o}, ${t})`;
}
const Qr = pn,
  CC = ({ color: e, theme: t, variant: n, gradient: r, autoContrast: o }) => {
    const s = zo({ color: e, theme: t }),
      i = typeof o == "boolean" ? o : t.autoContrast;
    if (n === "filled") {
      const l =
        i && s.isLight
          ? "var(--mantine-color-black)"
          : "var(--mantine-color-white)";
      return s.isThemeColor
        ? s.shade === void 0
          ? {
              background: `var(--mantine-color-${e}-filled)`,
              hover: `var(--mantine-color-${e}-filled-hover)`,
              color: l,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: `var(--mantine-color-${s.color}-${s.shade})`,
              hover: `var(--mantine-color-${s.color}-${
                s.shade === 9 ? 8 : s.shade + 1
              })`,
              color: l,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: e,
            hover: ji(e, 0.1),
            color: l,
            border: `${z(1)} solid transparent`,
          };
    }
    if (n === "light") {
      if (s.isThemeColor) {
        if (s.shade === void 0)
          return {
            background: `var(--mantine-color-${e}-light)`,
            hover: `var(--mantine-color-${e}-light-hover)`,
            color: `var(--mantine-color-${e}-light-color)`,
            border: `${z(1)} solid transparent`,
          };
        const l = t.colors[s.color][s.shade];
        return {
          background: pn(l, 0.1),
          hover: pn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: pn(e, 0.1),
        hover: pn(e, 0.12),
        color: e,
        border: `${z(1)} solid transparent`,
      };
    }
    if (n === "outline")
      return s.isThemeColor
        ? s.shade === void 0
          ? {
              background: "transparent",
              hover: `var(--mantine-color-${e}-outline-hover)`,
              color: `var(--mantine-color-${e}-outline)`,
              border: `${z(1)} solid var(--mantine-color-${e}-outline)`,
            }
          : {
              background: "transparent",
              hover: pn(t.colors[s.color][s.shade], 0.05),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid var(--mantine-color-${s.color}-${
                s.shade
              })`,
            }
        : {
            background: "transparent",
            hover: pn(e, 0.05),
            color: e,
            border: `${z(1)} solid ${e}`,
          };
    if (n === "subtle") {
      if (s.isThemeColor) {
        if (s.shade === void 0)
          return {
            background: "transparent",
            hover: `var(--mantine-color-${e}-light-hover)`,
            color: `var(--mantine-color-${e}-light-color)`,
            border: `${z(1)} solid transparent`,
          };
        const l = t.colors[s.color][s.shade];
        return {
          background: "transparent",
          hover: pn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: "transparent",
        hover: pn(e, 0.12),
        color: e,
        border: `${z(1)} solid transparent`,
      };
    }
    return n === "transparent"
      ? s.isThemeColor
        ? s.shade === void 0
          ? {
              background: "transparent",
              hover: "transparent",
              color: `var(--mantine-color-${e}-light-color)`,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: "transparent",
              hover: "transparent",
              color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: "transparent",
            hover: "transparent",
            color: e,
            border: `${z(1)} solid transparent`,
          }
      : n === "white"
      ? s.isThemeColor
        ? s.shade === void 0
          ? {
              background: "var(--mantine-color-white)",
              hover: ji(t.white, 0.01),
              color: `var(--mantine-color-${e}-filled)`,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: "var(--mantine-color-white)",
              hover: ji(t.white, 0.01),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: "var(--mantine-color-white)",
            hover: ji(t.white, 0.01),
            color: e,
            border: `${z(1)} solid transparent`,
          }
      : n === "gradient"
      ? {
          background: Mu(r, t),
          hover: Mu(r, t),
          color: "var(--mantine-color-white)",
          border: "none",
        }
      : n === "default"
      ? {
          background: "var(--mantine-color-default)",
          hover: "var(--mantine-color-default-hover)",
          color: "var(--mantine-color-default-color)",
          border: `${z(1)} solid var(--mantine-color-default-border)`,
        }
      : {};
  },
  EC = {
    dark: [
      "#C9C9C9",
      "#b8b8b8",
      "#828282",
      "#696969",
      "#424242",
      "#3b3b3b",
      "#2e2e2e",
      "#242424",
      "#1f1f1f",
      "#141414",
    ],
    gray: [
      "#f8f9fa",
      "#f1f3f5",
      "#e9ecef",
      "#dee2e6",
      "#ced4da",
      "#adb5bd",
      "#868e96",
      "#495057",
      "#343a40",
      "#212529",
    ],
    red: [
      "#fff5f5",
      "#ffe3e3",
      "#ffc9c9",
      "#ffa8a8",
      "#ff8787",
      "#ff6b6b",
      "#fa5252",
      "#f03e3e",
      "#e03131",
      "#c92a2a",
    ],
    pink: [
      "#fff0f6",
      "#ffdeeb",
      "#fcc2d7",
      "#faa2c1",
      "#f783ac",
      "#f06595",
      "#e64980",
      "#d6336c",
      "#c2255c",
      "#a61e4d",
    ],
    grape: [
      "#f8f0fc",
      "#f3d9fa",
      "#eebefa",
      "#e599f7",
      "#da77f2",
      "#cc5de8",
      "#be4bdb",
      "#ae3ec9",
      "#9c36b5",
      "#862e9c",
    ],
    violet: [
      "#f3f0ff",
      "#e5dbff",
      "#d0bfff",
      "#b197fc",
      "#9775fa",
      "#845ef7",
      "#7950f2",
      "#7048e8",
      "#6741d9",
      "#5f3dc4",
    ],
    indigo: [
      "#edf2ff",
      "#dbe4ff",
      "#bac8ff",
      "#91a7ff",
      "#748ffc",
      "#5c7cfa",
      "#4c6ef5",
      "#4263eb",
      "#3b5bdb",
      "#364fc7",
    ],
    blue: [
      "#e7f5ff",
      "#d0ebff",
      "#a5d8ff",
      "#74c0fc",
      "#4dabf7",
      "#339af0",
      "#228be6",
      "#1c7ed6",
      "#1971c2",
      "#1864ab",
    ],
    cyan: [
      "#e3fafc",
      "#c5f6fa",
      "#99e9f2",
      "#66d9e8",
      "#3bc9db",
      "#22b8cf",
      "#15aabf",
      "#1098ad",
      "#0c8599",
      "#0b7285",
    ],
    teal: [
      "#e6fcf5",
      "#c3fae8",
      "#96f2d7",
      "#63e6be",
      "#38d9a9",
      "#20c997",
      "#12b886",
      "#0ca678",
      "#099268",
      "#087f5b",
    ],
    green: [
      "#ebfbee",
      "#d3f9d8",
      "#b2f2bb",
      "#8ce99a",
      "#69db7c",
      "#51cf66",
      "#40c057",
      "#37b24d",
      "#2f9e44",
      "#2b8a3e",
    ],
    lime: [
      "#f4fce3",
      "#e9fac8",
      "#d8f5a2",
      "#c0eb75",
      "#a9e34b",
      "#94d82d",
      "#82c91e",
      "#74b816",
      "#66a80f",
      "#5c940d",
    ],
    yellow: [
      "#fff9db",
      "#fff3bf",
      "#ffec99",
      "#ffe066",
      "#ffd43b",
      "#fcc419",
      "#fab005",
      "#f59f00",
      "#f08c00",
      "#e67700",
    ],
    orange: [
      "#fff4e6",
      "#ffe8cc",
      "#ffd8a8",
      "#ffc078",
      "#ffa94d",
      "#ff922b",
      "#fd7e14",
      "#f76707",
      "#e8590c",
      "#d9480f",
    ],
  },
  Wm =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
  pf = {
    scale: 1,
    fontSmoothing: !0,
    focusRing: "auto",
    white: "#fff",
    black: "#000",
    colors: EC,
    primaryShade: { light: 6, dark: 8 },
    primaryColor: "blue",
    variantColorResolver: CC,
    autoContrast: !1,
    luminanceThreshold: 0.3,
    fontFamily: Wm,
    fontFamilyMonospace:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    respectReducedMotion: !1,
    cursorType: "default",
    defaultGradient: { from: "blue", to: "cyan", deg: 45 },
    defaultRadius: "sm",
    activeClassName: "mantine-active",
    focusClassName: "",
    headings: {
      fontFamily: Wm,
      fontWeight: "700",
      textWrap: "wrap",
      sizes: {
        h1: { fontSize: z(34), lineHeight: "1.3" },
        h2: { fontSize: z(26), lineHeight: "1.35" },
        h3: { fontSize: z(22), lineHeight: "1.4" },
        h4: { fontSize: z(18), lineHeight: "1.45" },
        h5: { fontSize: z(16), lineHeight: "1.5" },
        h6: { fontSize: z(14), lineHeight: "1.5" },
      },
    },
    fontSizes: { xs: z(12), sm: z(14), md: z(16), lg: z(18), xl: z(20) },
    lineHeights: { xs: "1.4", sm: "1.45", md: "1.55", lg: "1.6", xl: "1.65" },
    radius: { xs: z(2), sm: z(4), md: z(8), lg: z(16), xl: z(32) },
    spacing: { xs: z(10), sm: z(12), md: z(16), lg: z(20), xl: z(32) },
    breakpoints: { xs: "36em", sm: "48em", md: "62em", lg: "75em", xl: "88em" },
    shadows: {
      xs: `0 ${z(1)} ${z(3)} rgba(0, 0, 0, 0.05), 0 ${z(1)} ${z(
        2
      )} rgba(0, 0, 0, 0.1)`,
      sm: `0 ${z(1)} ${z(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${z(
        10
      )} ${z(15)} ${z(-5)}, rgba(0, 0, 0, 0.04) 0 ${z(7)} ${z(7)} ${z(-5)}`,
      md: `0 ${z(1)} ${z(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${z(
        20
      )} ${z(25)} ${z(-5)}, rgba(0, 0, 0, 0.04) 0 ${z(10)} ${z(10)} ${z(-5)}`,
      lg: `0 ${z(1)} ${z(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${z(
        28
      )} ${z(23)} ${z(-7)}, rgba(0, 0, 0, 0.04) 0 ${z(12)} ${z(12)} ${z(-7)}`,
      xl: `0 ${z(1)} ${z(3)} rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0 ${z(
        36
      )} ${z(28)} ${z(-7)}, rgba(0, 0, 0, 0.04) 0 ${z(17)} ${z(17)} ${z(-7)}`,
    },
    other: {},
    components: {},
  };
function Ym(e) {
  return e === "auto" || e === "dark" || e === "light";
}
function kC({ key: e = "mantine-color-scheme-value" } = {}) {
  let t;
  return {
    get: (n) => {
      if (typeof window > "u") return n;
      try {
        const r = window.localStorage.getItem(e);
        return Ym(r) ? r : n;
      } catch {
        return n;
      }
    },
    set: (n) => {
      try {
        window.localStorage.setItem(e, n);
      } catch (r) {
        console.warn(
          "[@mantine/core] Local storage color scheme manager was unable to save color scheme.",
          r
        );
      }
    },
    subscribe: (n) => {
      (t = (r) => {
        r.storageArea === window.localStorage &&
          r.key === e &&
          Ym(r.newValue) &&
          n(r.newValue);
      }),
        window.addEventListener("storage", t);
    },
    unsubscribe: () => {
      window.removeEventListener("storage", t);
    },
    clear: () => {
      window.localStorage.removeItem(e);
    },
  };
}
const _C =
    "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color",
  Km =
    "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
function Tc(e) {
  return e < 0 || e > 9 ? !1 : parseInt(e.toString(), 10) === e;
}
function qm(e) {
  if (!(e.primaryColor in e.colors)) throw new Error(_C);
  if (
    typeof e.primaryShade == "object" &&
    (!Tc(e.primaryShade.dark) || !Tc(e.primaryShade.light))
  )
    throw new Error(Km);
  if (typeof e.primaryShade == "number" && !Tc(e.primaryShade))
    throw new Error(Km);
}
function RC(e, t) {
  var r;
  if (!t) return qm(e), e;
  const n = of(e, t);
  return (
    t.fontFamily &&
      !((r = t.headings) != null && r.fontFamily) &&
      (n.headings.fontFamily = t.fontFamily),
    qm(n),
    n
  );
}
const mf = y.createContext(null),
  DC = () => y.useContext(mf) || pf;
function bn() {
  const e = y.useContext(mf);
  if (!e)
    throw new Error(
      "@mantine/core: MantineProvider was not found in component tree, make sure you have it in your app"
    );
  return e;
}
function Vv({ theme: e, children: t, inherit: n = !0 }) {
  const r = DC(),
    o = y.useMemo(() => RC(n ? r : pf, e), [e, r, n]);
  return x.jsx(mf.Provider, { value: o, children: t });
}
Vv.displayName = "@mantine/core/MantineThemeProvider";
function PC() {
  const e = bn(),
    t = df(),
    n = wn(e.breakpoints).reduce((r, o) => {
      const s = e.breakpoints[o].includes("px"),
        i = Bb(e.breakpoints[o]),
        l = s ? `${i - 0.1}px` : Vm(i - 0.1),
        a = s ? `${i}px` : Vm(i);
      return `${r}@media (max-width: ${l}) {.mantine-visible-from-${o} {display: none !important;}}@media (min-width: ${a}) {.mantine-hidden-from-${o} {display: none !important;}}`;
    }, "");
  return x.jsx("style", {
    "data-mantine-styles": "classes",
    nonce: t == null ? void 0 : t(),
    dangerouslySetInnerHTML: { __html: n },
  });
}
function Nc(e) {
  return Object.entries(e)
    .map(([t, n]) => `${t}: ${n};`)
    .join("");
}
function Oc(e, t) {
  return (Array.isArray(e) ? e : [e]).reduce((r, o) => `${o}{${r}}`, t);
}
function TC(e, t) {
  const n = Nc(e.variables),
    r = n ? Oc(t, n) : "",
    o = Nc(e.dark),
    s = o ? Oc(`${t}[data-mantine-color-scheme="dark"]`, o) : "",
    i = Nc(e.light),
    l = i ? Oc(`${t}[data-mantine-color-scheme="light"]`, i) : "";
  return `${r}${s}${l}`;
}
function Hv({ color: e, theme: t, autoContrast: n }) {
  return (typeof n == "boolean" ? n : t.autoContrast) &&
    zo({ color: e || t.primaryColor, theme: t }).isLight
    ? "var(--mantine-color-black)"
    : "var(--mantine-color-white)";
}
function Gm(e, t) {
  return Hv({
    color: e.colors[e.primaryColor][Hs(e, t)],
    theme: e,
    autoContrast: null,
  });
}
function $i({
  theme: e,
  color: t,
  colorScheme: n,
  name: r = t,
  withColorValues: o = !0,
}) {
  if (!e.colors[t]) return {};
  if (n === "light") {
    const l = Hs(e, "light"),
      a = {
        [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-filled)`,
        [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
          l === 9 ? 8 : l + 1
        })`,
        [`--mantine-color-${r}-light`]: Qr(e.colors[t][l], 0.1),
        [`--mantine-color-${r}-light-hover`]: Qr(e.colors[t][l], 0.12),
        [`--mantine-color-${r}-light-color`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline-hover`]: Qr(e.colors[t][l], 0.05),
      };
    return o
      ? {
          [`--mantine-color-${r}-0`]: e.colors[t][0],
          [`--mantine-color-${r}-1`]: e.colors[t][1],
          [`--mantine-color-${r}-2`]: e.colors[t][2],
          [`--mantine-color-${r}-3`]: e.colors[t][3],
          [`--mantine-color-${r}-4`]: e.colors[t][4],
          [`--mantine-color-${r}-5`]: e.colors[t][5],
          [`--mantine-color-${r}-6`]: e.colors[t][6],
          [`--mantine-color-${r}-7`]: e.colors[t][7],
          [`--mantine-color-${r}-8`]: e.colors[t][8],
          [`--mantine-color-${r}-9`]: e.colors[t][9],
          ...a,
        }
      : a;
  }
  const s = Hs(e, "dark"),
    i = {
      [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-4)`,
      [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${s})`,
      [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
        s === 9 ? 8 : s + 1
      })`,
      [`--mantine-color-${r}-light`]: Qr(e.colors[t][Math.max(0, s - 2)], 0.15),
      [`--mantine-color-${r}-light-hover`]: Qr(
        e.colors[t][Math.max(0, s - 2)],
        0.2
      ),
      [`--mantine-color-${r}-light-color`]: `var(--mantine-color-${r}-${Math.max(
        s - 5,
        0
      )})`,
      [`--mantine-color-${r}-outline`]: `var(--mantine-color-${r}-${Math.max(
        s - 4,
        0
      )})`,
      [`--mantine-color-${r}-outline-hover`]: Qr(
        e.colors[t][Math.max(s - 4, 0)],
        0.05
      ),
    };
  return o
    ? {
        [`--mantine-color-${r}-0`]: e.colors[t][0],
        [`--mantine-color-${r}-1`]: e.colors[t][1],
        [`--mantine-color-${r}-2`]: e.colors[t][2],
        [`--mantine-color-${r}-3`]: e.colors[t][3],
        [`--mantine-color-${r}-4`]: e.colors[t][4],
        [`--mantine-color-${r}-5`]: e.colors[t][5],
        [`--mantine-color-${r}-6`]: e.colors[t][6],
        [`--mantine-color-${r}-7`]: e.colors[t][7],
        [`--mantine-color-${r}-8`]: e.colors[t][8],
        [`--mantine-color-${r}-9`]: e.colors[t][9],
        ...i,
      }
    : i;
}
function NC(e) {
  return !!e && typeof e == "object" && "mantine-virtual-color" in e;
}
function Jr(e, t, n) {
  wn(t).forEach((r) => Object.assign(e, { [`--mantine-${n}-${r}`]: t[r] }));
}
const Uv = (e) => {
  const t = Hs(e, "light"),
    n =
      e.defaultRadius in e.radius
        ? e.radius[e.defaultRadius]
        : z(e.defaultRadius),
    r = {
      variables: {
        "--mantine-scale": e.scale.toString(),
        "--mantine-cursor-type": e.cursorType,
        "--mantine-color-scheme": "light dark",
        "--mantine-webkit-font-smoothing": e.fontSmoothing
          ? "antialiased"
          : "unset",
        "--mantine-moz-font-smoothing": e.fontSmoothing ? "grayscale" : "unset",
        "--mantine-color-white": e.white,
        "--mantine-color-black": e.black,
        "--mantine-line-height": e.lineHeights.md,
        "--mantine-font-family": e.fontFamily,
        "--mantine-font-family-monospace": e.fontFamilyMonospace,
        "--mantine-font-family-headings": e.headings.fontFamily,
        "--mantine-heading-font-weight": e.headings.fontWeight,
        "--mantine-heading-text-wrap": e.headings.textWrap,
        "--mantine-radius-default": n,
        "--mantine-primary-color-filled": `var(--mantine-color-${e.primaryColor}-filled)`,
        "--mantine-primary-color-filled-hover": `var(--mantine-color-${e.primaryColor}-filled-hover)`,
        "--mantine-primary-color-light": `var(--mantine-color-${e.primaryColor}-light)`,
        "--mantine-primary-color-light-hover": `var(--mantine-color-${e.primaryColor}-light-hover)`,
        "--mantine-primary-color-light-color": `var(--mantine-color-${e.primaryColor}-light-color)`,
      },
      light: {
        "--mantine-primary-color-contrast": Gm(e, "light"),
        "--mantine-color-bright": "var(--mantine-color-black)",
        "--mantine-color-text": e.black,
        "--mantine-color-body": e.white,
        "--mantine-color-error": "var(--mantine-color-red-6)",
        "--mantine-color-placeholder": "var(--mantine-color-gray-5)",
        "--mantine-color-anchor": `var(--mantine-color-${e.primaryColor}-${t})`,
        "--mantine-color-default": "var(--mantine-color-white)",
        "--mantine-color-default-hover": "var(--mantine-color-gray-0)",
        "--mantine-color-default-color": "var(--mantine-color-black)",
        "--mantine-color-default-border": "var(--mantine-color-gray-4)",
        "--mantine-color-dimmed": "var(--mantine-color-gray-6)",
      },
      dark: {
        "--mantine-primary-color-contrast": Gm(e, "dark"),
        "--mantine-color-bright": "var(--mantine-color-white)",
        "--mantine-color-text": "var(--mantine-color-dark-0)",
        "--mantine-color-body": "var(--mantine-color-dark-7)",
        "--mantine-color-error": "var(--mantine-color-red-8)",
        "--mantine-color-placeholder": "var(--mantine-color-dark-3)",
        "--mantine-color-anchor": `var(--mantine-color-${e.primaryColor}-4)`,
        "--mantine-color-default": "var(--mantine-color-dark-6)",
        "--mantine-color-default-hover": "var(--mantine-color-dark-5)",
        "--mantine-color-default-color": "var(--mantine-color-white)",
        "--mantine-color-default-border": "var(--mantine-color-dark-4)",
        "--mantine-color-dimmed": "var(--mantine-color-dark-2)",
      },
    };
  Jr(r.variables, e.breakpoints, "breakpoint"),
    Jr(r.variables, e.spacing, "spacing"),
    Jr(r.variables, e.fontSizes, "font-size"),
    Jr(r.variables, e.lineHeights, "line-height"),
    Jr(r.variables, e.shadows, "shadow"),
    Jr(r.variables, e.radius, "radius"),
    e.colors[e.primaryColor].forEach((s, i) => {
      r.variables[
        `--mantine-primary-color-${i}`
      ] = `var(--mantine-color-${e.primaryColor}-${i})`;
    }),
    wn(e.colors).forEach((s) => {
      const i = e.colors[s];
      if (NC(i)) {
        Object.assign(
          r.light,
          $i({
            theme: e,
            name: i.name,
            color: i.light,
            colorScheme: "light",
            withColorValues: !0,
          })
        ),
          Object.assign(
            r.dark,
            $i({
              theme: e,
              name: i.name,
              color: i.dark,
              colorScheme: "dark",
              withColorValues: !0,
            })
          );
        return;
      }
      i.forEach((l, a) => {
        r.variables[`--mantine-color-${s}-${a}`] = l;
      }),
        Object.assign(
          r.light,
          $i({ theme: e, color: s, colorScheme: "light", withColorValues: !1 })
        ),
        Object.assign(
          r.dark,
          $i({ theme: e, color: s, colorScheme: "dark", withColorValues: !1 })
        );
    });
  const o = e.headings.sizes;
  return (
    wn(o).forEach((s) => {
      (r.variables[`--mantine-${s}-font-size`] = o[s].fontSize),
        (r.variables[`--mantine-${s}-line-height`] = o[s].lineHeight),
        (r.variables[`--mantine-${s}-font-weight`] =
          o[s].fontWeight || e.headings.fontWeight);
    }),
    r
  );
};
function OC({ theme: e, generator: t }) {
  const n = Uv(e),
    r = t == null ? void 0 : t(e);
  return r ? of(n, r) : n;
}
const jc = Uv(pf);
function jC(e) {
  const t = { variables: {}, light: {}, dark: {} };
  return (
    wn(e.variables).forEach((n) => {
      jc.variables[n] !== e.variables[n] && (t.variables[n] = e.variables[n]);
    }),
    wn(e.light).forEach((n) => {
      jc.light[n] !== e.light[n] && (t.light[n] = e.light[n]);
    }),
    wn(e.dark).forEach((n) => {
      jc.dark[n] !== e.dark[n] && (t.dark[n] = e.dark[n]);
    }),
    t
  );
}
function $C(e) {
  return `
  ${e}[data-mantine-color-scheme="dark"] { --mantine-color-scheme: dark; }
  ${e}[data-mantine-color-scheme="light"] { --mantine-color-scheme: light; }
`;
}
function Wv({ cssVariablesSelector: e, deduplicateCssVariables: t }) {
  const n = bn(),
    r = df(),
    o = dC(),
    s = OC({ theme: n, generator: o }),
    i = e === ":root" && t,
    l = i ? jC(s) : s,
    a = TC(l, e);
  return a
    ? x.jsx("style", {
        "data-mantine-styles": !0,
        nonce: r == null ? void 0 : r(),
        dangerouslySetInnerHTML: { __html: `${a}${i ? "" : $C(e)}` },
      })
    : null;
}
Wv.displayName = "@mantine/CssVariables";
function LC() {
  const e = console.error;
  console.error = (...t) => {
    (t.length > 1 &&
      typeof t[0] == "string" &&
      t[0].toLowerCase().includes("extra attributes from the server") &&
      typeof t[1] == "string" &&
      t[1].toLowerCase().includes("data-mantine-color-scheme")) ||
      e(...t);
  };
}
function Zr(e, t) {
  var r;
  const n =
    e !== "auto"
      ? e
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  (r = t()) == null || r.setAttribute("data-mantine-color-scheme", n);
}
function AC({
  manager: e,
  defaultColorScheme: t,
  getRootElement: n,
  forceColorScheme: r,
}) {
  const o = y.useRef(),
    [s, i] = y.useState(() => e.get(t)),
    l = r || s,
    a = y.useCallback(
      (u) => {
        r || (Zr(u, n), i(u), e.set(u));
      },
      [e.set, l, r]
    ),
    c = y.useCallback(() => {
      i(t), Zr(t, n), e.clear();
    }, [e.clear, t]);
  return (
    y.useEffect(
      () => (e.subscribe(a), e.unsubscribe),
      [e.subscribe, e.unsubscribe]
    ),
    ni(() => {
      Zr(e.get(t), n);
    }, []),
    y.useEffect(() => {
      var d;
      if (r) return Zr(r, n), () => {};
      r === void 0 && Zr(s, n),
        (o.current = window.matchMedia("(prefers-color-scheme: dark)"));
      const u = (f) => {
        s === "auto" && Zr(f.matches ? "dark" : "light", n);
      };
      return (
        (d = o.current) == null || d.addEventListener("change", u),
        () => {
          var f;
          return (f = o.current) == null
            ? void 0
            : f.removeEventListener("change", u);
        }
      );
    }, [s, r]),
    { colorScheme: l, setColorScheme: a, clearColorScheme: c }
  );
}
function FC({ respectReducedMotion: e, getRootElement: t }) {
  ni(() => {
    var n;
    e &&
      ((n = t()) == null ||
        n.setAttribute("data-respect-reduced-motion", "true"));
  }, [e]);
}
LC();
function Yv({
  theme: e,
  children: t,
  getStyleNonce: n,
  withStaticClasses: r = !0,
  withGlobalClasses: o = !0,
  deduplicateCssVariables: s = !0,
  withCssVariables: i = !0,
  cssVariablesSelector: l = ":root",
  classNamesPrefix: a = "mantine",
  colorSchemeManager: c = kC(),
  defaultColorScheme: u = "light",
  getRootElement: d = () => document.documentElement,
  cssVariablesResolver: f,
  forceColorScheme: m,
  stylesTransform: p,
}) {
  const {
    colorScheme: h,
    setColorScheme: S,
    clearColorScheme: v,
  } = AC({
    defaultColorScheme: u,
    forceColorScheme: m,
    manager: c,
    getRootElement: d,
  });
  return (
    FC({
      respectReducedMotion: (e == null ? void 0 : e.respectReducedMotion) || !1,
      getRootElement: d,
    }),
    x.jsx(Bv.Provider, {
      value: {
        colorScheme: h,
        setColorScheme: S,
        clearColorScheme: v,
        getRootElement: d,
        classNamesPrefix: a,
        getStyleNonce: n,
        cssVariablesResolver: f,
        cssVariablesSelector: l,
        withStaticClasses: r,
        stylesTransform: p,
      },
      children: x.jsxs(Vv, {
        theme: e,
        children: [
          i &&
            x.jsx(Wv, { cssVariablesSelector: l, deduplicateCssVariables: s }),
          o && x.jsx(PC, {}),
          t,
        ],
      }),
    })
  );
}
Yv.displayName = "@mantine/core/MantineProvider";
function Bo({ classNames: e, styles: t, props: n, stylesCtx: r }) {
  const o = bn();
  return {
    resolvedClassNames: ua({
      theme: o,
      classNames: e,
      props: n,
      stylesCtx: r || void 0,
    }),
    resolvedStyles: Pl({
      theme: o,
      styles: t,
      props: n,
      stylesCtx: r || void 0,
    }),
  };
}
const MC = {
  always: "mantine-focus-always",
  auto: "mantine-focus-auto",
  never: "mantine-focus-never",
};
function IC({ theme: e, options: t, unstyled: n }) {
  return at(
    (t == null ? void 0 : t.focusable) &&
      !n &&
      (e.focusClassName || MC[e.focusRing]),
    (t == null ? void 0 : t.active) && !n && e.activeClassName
  );
}
function zC({ selector: e, stylesCtx: t, options: n, props: r, theme: o }) {
  return ua({
    theme: o,
    classNames: n == null ? void 0 : n.classNames,
    props: (n == null ? void 0 : n.props) || r,
    stylesCtx: t,
  })[e];
}
function Xm({ selector: e, stylesCtx: t, theme: n, classNames: r, props: o }) {
  return ua({ theme: n, classNames: r, props: o, stylesCtx: t })[e];
}
function BC({ rootSelector: e, selector: t, className: n }) {
  return e === t ? n : void 0;
}
function VC({ selector: e, classes: t, unstyled: n }) {
  return n ? void 0 : t[e];
}
function HC({
  themeName: e,
  classNamesPrefix: t,
  selector: n,
  withStaticClass: r,
}) {
  return r === !1 ? [] : e.map((o) => `${t}-${o}-${n}`);
}
function UC({ themeName: e, theme: t, selector: n, props: r, stylesCtx: o }) {
  return e.map((s) => {
    var i, l;
    return (l = ua({
      theme: t,
      classNames: (i = t.components[s]) == null ? void 0 : i.classNames,
      props: r,
      stylesCtx: o,
    })) == null
      ? void 0
      : l[n];
  });
}
function WC({ options: e, classes: t, selector: n, unstyled: r }) {
  return e != null && e.variant && !r ? t[`${n}--${e.variant}`] : void 0;
}
function YC({
  theme: e,
  options: t,
  themeName: n,
  selector: r,
  classNamesPrefix: o,
  classNames: s,
  classes: i,
  unstyled: l,
  className: a,
  rootSelector: c,
  props: u,
  stylesCtx: d,
  withStaticClasses: f,
  headless: m,
  transformedStyles: p,
}) {
  return at(
    IC({ theme: e, options: t, unstyled: l || m }),
    UC({ theme: e, themeName: n, selector: r, props: u, stylesCtx: d }),
    WC({ options: t, classes: i, selector: r, unstyled: l }),
    Xm({ selector: r, stylesCtx: d, theme: e, classNames: s, props: u }),
    Xm({ selector: r, stylesCtx: d, theme: e, classNames: p, props: u }),
    zC({ selector: r, stylesCtx: d, options: t, props: u, theme: e }),
    BC({ rootSelector: c, selector: r, className: a }),
    VC({ selector: r, classes: i, unstyled: l || m }),
    f &&
      !m &&
      HC({
        themeName: n,
        classNamesPrefix: o,
        selector: r,
        withStaticClass: t == null ? void 0 : t.withStaticClass,
      }),
    t == null ? void 0 : t.className
  );
}
function KC({ theme: e, themeName: t, props: n, stylesCtx: r, selector: o }) {
  return t
    .map((s) => {
      var i;
      return Pl({
        theme: e,
        styles: (i = e.components[s]) == null ? void 0 : i.styles,
        props: n,
        stylesCtx: r,
      })[o];
    })
    .reduce((s, i) => ({ ...s, ...i }), {});
}
function Iu({ style: e, theme: t }) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...Iu({ style: r, theme: t }) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function qC(e) {
  return e.reduce(
    (t, n) => (
      n &&
        Object.keys(n).forEach((r) => {
          t[r] = { ...t[r], ...sf(n[r]) };
        }),
      t
    ),
    {}
  );
}
function GC({
  vars: e,
  varsResolver: t,
  theme: n,
  props: r,
  stylesCtx: o,
  selector: s,
  themeName: i,
  headless: l,
}) {
  var a;
  return (a = qC([
    l ? {} : t == null ? void 0 : t(n, r, o),
    ...i.map((c) => {
      var u, d, f;
      return (f =
        (d = (u = n.components) == null ? void 0 : u[c]) == null
          ? void 0
          : d.vars) == null
        ? void 0
        : f.call(d, n, r, o);
    }),
    e == null ? void 0 : e(n, r, o),
  ])) == null
    ? void 0
    : a[s];
}
function XC({
  theme: e,
  themeName: t,
  selector: n,
  options: r,
  props: o,
  stylesCtx: s,
  rootSelector: i,
  styles: l,
  style: a,
  vars: c,
  varsResolver: u,
  headless: d,
  withStylesTransform: f,
}) {
  return {
    ...(!f &&
      KC({ theme: e, themeName: t, props: o, stylesCtx: s, selector: n })),
    ...(!f && Pl({ theme: e, styles: l, props: o, stylesCtx: s })[n]),
    ...(!f &&
      Pl({
        theme: e,
        styles: r == null ? void 0 : r.styles,
        props: (r == null ? void 0 : r.props) || o,
        stylesCtx: s,
      })[n]),
    ...GC({
      theme: e,
      props: o,
      stylesCtx: s,
      vars: c,
      varsResolver: u,
      selector: n,
      themeName: t,
      headless: d,
    }),
    ...(i === n ? Iu({ style: a, theme: e }) : null),
    ...Iu({ style: r == null ? void 0 : r.style, theme: e }),
  };
}
function QC({ props: e, stylesCtx: t, themeName: n }) {
  var i;
  const r = bn(),
    o = (i = gC()) == null ? void 0 : i();
  return {
    getTransformedStyles: (l) =>
      o
        ? [
            ...l.map((c) => o(c, { props: e, theme: r, ctx: t })),
            ...n.map((c) => {
              var u;
              return o((u = r.components[c]) == null ? void 0 : u.styles, {
                props: e,
                theme: r,
                ctx: t,
              });
            }),
          ].filter(Boolean)
        : [],
    withStylesTransform: !!o,
  };
}
function ue({
  name: e,
  classes: t,
  props: n,
  stylesCtx: r,
  className: o,
  style: s,
  rootSelector: i = "root",
  unstyled: l,
  classNames: a,
  styles: c,
  vars: u,
  varsResolver: d,
}) {
  const f = bn(),
    m = fC(),
    p = pC(),
    h = mC(),
    S = (Array.isArray(e) ? e : [e]).filter((g) => g),
    { withStylesTransform: v, getTransformedStyles: w } = QC({
      props: n,
      stylesCtx: r,
      themeName: S,
    });
  return (g, b) => ({
    className: YC({
      theme: f,
      options: b,
      themeName: S,
      selector: g,
      classNamesPrefix: m,
      classNames: a,
      classes: t,
      unstyled: l,
      className: o,
      rootSelector: i,
      props: n,
      stylesCtx: r,
      withStaticClasses: p,
      headless: h,
      transformedStyles: w([b == null ? void 0 : b.styles, c]),
    }),
    style: XC({
      theme: f,
      themeName: S,
      selector: g,
      options: b,
      props: n,
      stylesCtx: r,
      rootSelector: i,
      styles: c,
      style: s,
      vars: u,
      varsResolver: d,
      headless: h,
      withStylesTransform: v,
    }),
  });
}
function JC(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function U(e, t, n) {
  var i;
  const r = bn(),
    o = (i = r.components[e]) == null ? void 0 : i.defaultProps,
    s = typeof o == "function" ? o(r) : o;
  return { ...t, ...s, ...sf(n) };
}
function Qm(e) {
  return wn(e)
    .reduce((t, n) => (e[n] !== void 0 ? `${t}${Ib(n)}:${e[n]};` : t), "")
    .trim();
}
function ZC({ selector: e, styles: t, media: n }) {
  const r = t ? Qm(t) : "",
    o = Array.isArray(n)
      ? n.map((s) => `@media${s.query}{${e}{${Qm(s.styles)}}}`)
      : [];
  return `${r ? `${e}{${r}}` : ""}${o.join("")}`.trim();
}
function eE({ selector: e, styles: t, media: n }) {
  const r = df();
  return x.jsx("style", {
    "data-mantine-styles": "inline",
    nonce: r == null ? void 0 : r(),
    dangerouslySetInnerHTML: {
      __html: ZC({ selector: e, styles: t, media: n }),
    },
  });
}
function ri(e) {
  const {
    m: t,
    mx: n,
    my: r,
    mt: o,
    mb: s,
    ml: i,
    mr: l,
    me: a,
    ms: c,
    p: u,
    px: d,
    py: f,
    pt: m,
    pb: p,
    pl: h,
    pr: S,
    pe: v,
    ps: w,
    bg: g,
    c: b,
    opacity: C,
    ff: E,
    fz: _,
    fw: D,
    lts: L,
    ta: N,
    lh: M,
    fs: B,
    tt: V,
    td: A,
    w: j,
    miw: P,
    maw: T,
    h: R,
    mih: k,
    mah: $,
    bgsz: O,
    bgp: I,
    bgr: K,
    bga: J,
    pos: ee,
    top: ne,
    left: te,
    bottom: me,
    right: oe,
    inset: le,
    display: Z,
    flex: ge,
    hiddenFrom: ce,
    visibleFrom: se,
    lightHidden: je,
    darkHidden: Ie,
    sx: ye,
    ...rt
  } = e;
  return {
    styleProps: sf({
      m: t,
      mx: n,
      my: r,
      mt: o,
      mb: s,
      ml: i,
      mr: l,
      me: a,
      ms: c,
      p: u,
      px: d,
      py: f,
      pt: m,
      pb: p,
      pl: h,
      pr: S,
      pe: v,
      ps: w,
      bg: g,
      c: b,
      opacity: C,
      ff: E,
      fz: _,
      fw: D,
      lts: L,
      ta: N,
      lh: M,
      fs: B,
      tt: V,
      td: A,
      w: j,
      miw: P,
      maw: T,
      h: R,
      mih: k,
      mah: $,
      bgsz: O,
      bgp: I,
      bgr: K,
      bga: J,
      pos: ee,
      top: ne,
      left: te,
      bottom: me,
      right: oe,
      inset: le,
      display: Z,
      flex: ge,
      hiddenFrom: ce,
      visibleFrom: se,
      lightHidden: je,
      darkHidden: Ie,
      sx: ye,
    }),
    rest: rt,
  };
}
const tE = {
  m: { type: "spacing", property: "margin" },
  mt: { type: "spacing", property: "marginTop" },
  mb: { type: "spacing", property: "marginBottom" },
  ml: { type: "spacing", property: "marginLeft" },
  mr: { type: "spacing", property: "marginRight" },
  ms: { type: "spacing", property: "marginInlineStart" },
  me: { type: "spacing", property: "marginInlineEnd" },
  mx: { type: "spacing", property: "marginInline" },
  my: { type: "spacing", property: "marginBlock" },
  p: { type: "spacing", property: "padding" },
  pt: { type: "spacing", property: "paddingTop" },
  pb: { type: "spacing", property: "paddingBottom" },
  pl: { type: "spacing", property: "paddingLeft" },
  pr: { type: "spacing", property: "paddingRight" },
  ps: { type: "spacing", property: "paddingInlineStart" },
  pe: { type: "spacing", property: "paddingInlineEnd" },
  px: { type: "spacing", property: "paddingInline" },
  py: { type: "spacing", property: "paddingBlock" },
  bg: { type: "color", property: "background" },
  c: { type: "textColor", property: "color" },
  opacity: { type: "identity", property: "opacity" },
  ff: { type: "fontFamily", property: "fontFamily" },
  fz: { type: "fontSize", property: "fontSize" },
  fw: { type: "identity", property: "fontWeight" },
  lts: { type: "size", property: "letterSpacing" },
  ta: { type: "identity", property: "textAlign" },
  lh: { type: "lineHeight", property: "lineHeight" },
  fs: { type: "identity", property: "fontStyle" },
  tt: { type: "identity", property: "textTransform" },
  td: { type: "identity", property: "textDecoration" },
  w: { type: "spacing", property: "width" },
  miw: { type: "spacing", property: "minWidth" },
  maw: { type: "spacing", property: "maxWidth" },
  h: { type: "spacing", property: "height" },
  mih: { type: "spacing", property: "minHeight" },
  mah: { type: "spacing", property: "maxHeight" },
  bgsz: { type: "size", property: "backgroundSize" },
  bgp: { type: "identity", property: "backgroundPosition" },
  bgr: { type: "identity", property: "backgroundRepeat" },
  bga: { type: "identity", property: "backgroundAttachment" },
  pos: { type: "identity", property: "position" },
  top: { type: "identity", property: "top" },
  left: { type: "size", property: "left" },
  bottom: { type: "size", property: "bottom" },
  right: { type: "size", property: "right" },
  inset: { type: "size", property: "inset" },
  display: { type: "identity", property: "display" },
  flex: { type: "identity", property: "flex" },
};
function Kv(e, t) {
  const n = zo({ color: e, theme: t });
  return n.color === "dimmed"
    ? "var(--mantine-color-dimmed)"
    : n.color === "bright"
    ? "var(--mantine-color-bright)"
    : n.variable
    ? `var(${n.variable})`
    : n.color;
}
function nE(e, t) {
  const n = zo({ color: e, theme: t });
  return n.isThemeColor && n.shade === void 0
    ? `var(--mantine-color-${n.color}-text)`
    : Kv(e, t);
}
const Jm = {
  text: "var(--mantine-font-family)",
  mono: "var(--mantine-font-family-monospace)",
  monospace: "var(--mantine-font-family-monospace)",
  heading: "var(--mantine-font-family-headings)",
  headings: "var(--mantine-font-family-headings)",
};
function rE(e) {
  return typeof e == "string" && e in Jm ? Jm[e] : e;
}
const oE = ["h1", "h2", "h3", "h4", "h5", "h6"];
function sE(e, t) {
  return typeof e == "string" && e in t.fontSizes
    ? `var(--mantine-font-size-${e})`
    : typeof e == "string" && oE.includes(e)
    ? `var(--mantine-${e}-font-size)`
    : typeof e == "number" || typeof e == "string"
    ? z(e)
    : e;
}
function iE(e) {
  return e;
}
const lE = ["h1", "h2", "h3", "h4", "h5", "h6"];
function aE(e, t) {
  return typeof e == "string" && e in t.lineHeights
    ? `var(--mantine-line-height-${e})`
    : typeof e == "string" && lE.includes(e)
    ? `var(--mantine-${e}-line-height)`
    : e;
}
function cE(e) {
  return typeof e == "number" ? z(e) : e;
}
function uE(e, t) {
  if (typeof e == "number") return z(e);
  if (typeof e == "string") {
    const n = e.replace("-", "");
    if (!(n in t.spacing)) return z(e);
    const r = `--mantine-spacing-${n}`;
    return e.startsWith("-") ? `calc(var(${r}) * -1)` : `var(${r})`;
  }
  return e;
}
const $c = {
  color: Kv,
  textColor: nE,
  fontSize: sE,
  spacing: uE,
  identity: iE,
  size: cE,
  lineHeight: aE,
  fontFamily: rE,
};
function Zm(e) {
  return e.replace("(min-width: ", "").replace("em)", "");
}
function dE({ media: e, ...t }) {
  const r = Object.keys(e)
    .sort((o, s) => Number(Zm(o)) - Number(Zm(s)))
    .map((o) => ({ query: o, styles: e[o] }));
  return { ...t, media: r };
}
function fE(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.keys(e);
  return !(t.length === 1 && t[0] === "base");
}
function pE(e) {
  return typeof e == "object" && e !== null
    ? "base" in e
      ? e.base
      : void 0
    : e;
}
function mE(e) {
  return typeof e == "object" && e !== null
    ? wn(e).filter((t) => t !== "base")
    : [];
}
function hE(e, t) {
  return typeof e == "object" && e !== null && t in e ? e[t] : e;
}
function gE({ styleProps: e, data: t, theme: n }) {
  return dE(
    wn(e).reduce(
      (r, o) => {
        if (o === "hiddenFrom" || o === "visibleFrom" || o === "sx") return r;
        const s = t[o],
          i = Array.isArray(s.property) ? s.property : [s.property],
          l = pE(e[o]);
        if (!fE(e[o]))
          return (
            i.forEach((c) => {
              r.inlineStyles[c] = $c[s.type](l, n);
            }),
            r
          );
        r.hasResponsiveStyles = !0;
        const a = mE(e[o]);
        return (
          i.forEach((c) => {
            l && (r.styles[c] = $c[s.type](l, n)),
              a.forEach((u) => {
                const d = `(min-width: ${n.breakpoints[u]})`;
                r.media[d] = { ...r.media[d], [c]: $c[s.type](hE(e[o], u), n) };
              });
          }),
          r
        );
      },
      { hasResponsiveStyles: !1, styles: {}, inlineStyles: {}, media: {} }
    )
  );
}
function yE() {
  return `__m__-${y.useId().replace(/:/g, "")}`;
}
function qv(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...qv(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function Gv(e) {
  return e.startsWith("data-") ? e : `data-${e}`;
}
function vE(e) {
  return Object.keys(e).reduce((t, n) => {
    const r = e[n];
    return (
      r === void 0 || r === "" || r === !1 || r === null || (t[Gv(n)] = e[n]), t
    );
  }, {});
}
function Xv(e) {
  return e
    ? typeof e == "string"
      ? { [Gv(e)]: !0 }
      : Array.isArray(e)
      ? [...e].reduce((t, n) => ({ ...t, ...Xv(n) }), {})
      : vE(e)
    : null;
}
function zu(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...zu(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function wE({ theme: e, style: t, vars: n, styleProps: r }) {
  const o = zu(t, e),
    s = zu(n, e);
  return { ...o, ...s, ...r };
}
const Qv = y.forwardRef(
  (
    {
      component: e,
      style: t,
      __vars: n,
      className: r,
      variant: o,
      mod: s,
      size: i,
      hiddenFrom: l,
      visibleFrom: a,
      lightHidden: c,
      darkHidden: u,
      renderRoot: d,
      ...f
    },
    m
  ) => {
    var _;
    const p = bn(),
      h = e || "div",
      { styleProps: S, rest: v } = ri(f),
      w = hC(),
      g = (_ = w == null ? void 0 : w()) == null ? void 0 : _(S.sx),
      b = yE(),
      C = gE({ styleProps: S, theme: p, data: tE }),
      E = {
        ref: m,
        style: wE({ theme: p, style: t, vars: n, styleProps: C.inlineStyles }),
        className: at(r, g, {
          [b]: C.hasResponsiveStyles,
          "mantine-light-hidden": c,
          "mantine-dark-hidden": u,
          [`mantine-hidden-from-${l}`]: l,
          [`mantine-visible-from-${a}`]: a,
        }),
        "data-variant": o,
        "data-size": jv(i) ? void 0 : i || void 0,
        ...Xv(s),
        ...v,
      };
    return x.jsxs(x.Fragment, {
      children: [
        C.hasResponsiveStyles &&
          x.jsx(eE, { selector: `.${b}`, styles: C.styles, media: C.media }),
        typeof d == "function" ? d(E) : x.jsx(h, { ...E }),
      ],
    });
  }
);
Qv.displayName = "@mantine/core/Box";
const G = Qv;
function Jv(e) {
  return e;
}
function X(e) {
  const t = y.forwardRef(e);
  return (t.extend = Jv), t;
}
function Fn(e) {
  const t = y.forwardRef(e);
  return (t.extend = Jv), t;
}
const xE = y.createContext({
  dir: "ltr",
  toggleDirection: () => {},
  setDirection: () => {},
});
function hf() {
  return y.useContext(xE);
}
function SE(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Lc(e) {
  return e != null && e.current ? e.current.scrollHeight : "auto";
}
const as = typeof window < "u" && window.requestAnimationFrame;
function bE({
  transitionDuration: e,
  transitionTimingFunction: t = "ease",
  onTransitionEnd: n = () => {},
  opened: r,
}) {
  const o = y.useRef(null),
    s = 0,
    i = { display: "none", height: 0, overflow: "hidden" },
    [l, a] = y.useState(r ? {} : i),
    c = (p) => {
      ti.flushSync(() => a(p));
    },
    u = (p) => {
      c((h) => ({ ...h, ...p }));
    };
  function d(p) {
    const h = e || SE(p);
    return { transition: `height ${h}ms ${t}, opacity ${h}ms ${t}` };
  }
  Ar(() => {
    typeof as == "function" &&
      as(
        r
          ? () => {
              u({ willChange: "height", display: "block", overflow: "hidden" }),
                as(() => {
                  const p = Lc(o);
                  u({ ...d(p), height: p });
                });
            }
          : () => {
              const p = Lc(o);
              u({ ...d(p), willChange: "height", height: p }),
                as(() => u({ height: s, overflow: "hidden" }));
            }
      );
  }, [r]);
  const f = (p) => {
    if (!(p.target !== o.current || p.propertyName !== "height"))
      if (r) {
        const h = Lc(o);
        h === l.height ? c({}) : u({ height: h }), n();
      } else l.height === s && (c(i), n());
  };
  function m({ style: p = {}, refKey: h = "ref", ...S } = {}) {
    const v = S[h];
    return {
      "aria-hidden": !r,
      ...S,
      [h]: Iv(o, v),
      onTransitionEnd: f,
      style: { boxSizing: "border-box", ...p, ...l },
    };
  }
  return m;
}
const CE = {
    transitionDuration: 200,
    transitionTimingFunction: "ease",
    animateOpacity: !0,
  },
  Zv = X((e, t) => {
    const {
        children: n,
        in: r,
        transitionDuration: o,
        transitionTimingFunction: s,
        style: i,
        onTransitionEnd: l,
        animateOpacity: a,
        ...c
      } = U("Collapse", CE, e),
      u = bn(),
      d = uf(),
      m = (u.respectReducedMotion ? d : !1) ? 0 : o,
      p = bE({
        opened: r,
        transitionDuration: m,
        transitionTimingFunction: s,
        onTransitionEnd: l,
      });
    return m === 0
      ? r
        ? x.jsx(G, { ...c, children: n })
        : null
      : x.jsx(G, {
          ...p({
            style: {
              opacity: r || !a ? 1 : 0,
              transition: a ? `opacity ${m}ms ${s}` : "none",
              ...qv(i, u),
            },
            ref: t,
            ...c,
          }),
          children: n,
        });
  });
Zv.displayName = "@mantine/core/Collapse";
const [EE, zt] = pr("ScrollArea.Root component was not found in tree");
function Oo(e, t) {
  const n = xr(t);
  ni(() => {
    let r = 0;
    if (e) {
      const o = new ResizeObserver(() => {
        cancelAnimationFrame(r), (r = window.requestAnimationFrame(n));
      });
      return (
        o.observe(e),
        () => {
          window.cancelAnimationFrame(r), o.unobserve(e);
        }
      );
    }
  }, [e, n]);
}
const kE = y.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = zt(),
      [s, i] = y.useState(0),
      [l, a] = y.useState(0),
      c = !!(s && l);
    return (
      Oo(o.scrollbarX, () => {
        var d;
        const u = ((d = o.scrollbarX) == null ? void 0 : d.offsetHeight) || 0;
        o.onCornerHeightChange(u), a(u);
      }),
      Oo(o.scrollbarY, () => {
        var d;
        const u = ((d = o.scrollbarY) == null ? void 0 : d.offsetWidth) || 0;
        o.onCornerWidthChange(u), i(u);
      }),
      c
        ? x.jsx("div", { ...r, ref: t, style: { ...n, width: s, height: l } })
        : null
    );
  }),
  _E = y.forwardRef((e, t) => {
    const n = zt(),
      r = !!(n.scrollbarX && n.scrollbarY);
    return n.type !== "scroll" && r ? x.jsx(kE, { ...e, ref: t }) : null;
  }),
  RE = { scrollHideDelay: 1e3, type: "hover" },
  e0 = y.forwardRef((e, t) => {
    const n = U("ScrollAreaRoot", RE, e),
      { type: r, scrollHideDelay: o, scrollbars: s, ...i } = n,
      [l, a] = y.useState(null),
      [c, u] = y.useState(null),
      [d, f] = y.useState(null),
      [m, p] = y.useState(null),
      [h, S] = y.useState(null),
      [v, w] = y.useState(0),
      [g, b] = y.useState(0),
      [C, E] = y.useState(!1),
      [_, D] = y.useState(!1),
      L = Dt(t, (N) => a(N));
    return x.jsx(EE, {
      value: {
        type: r,
        scrollHideDelay: o,
        scrollArea: l,
        viewport: c,
        onViewportChange: u,
        content: d,
        onContentChange: f,
        scrollbarX: m,
        onScrollbarXChange: p,
        scrollbarXEnabled: C,
        onScrollbarXEnabledChange: E,
        scrollbarY: h,
        onScrollbarYChange: S,
        scrollbarYEnabled: _,
        onScrollbarYEnabledChange: D,
        onCornerWidthChange: w,
        onCornerHeightChange: b,
      },
      children: x.jsx(G, {
        ...i,
        ref: L,
        __vars: {
          "--sa-corner-width": s !== "xy" ? "0px" : `${v}px`,
          "--sa-corner-height": s !== "xy" ? "0px" : `${g}px`,
        },
      }),
    });
  });
e0.displayName = "@mantine/core/ScrollAreaRoot";
function t0(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function da(e) {
  const t = t0(e.viewport, e.content),
    n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd,
    r = (e.scrollbar.size - n) * t;
  return Math.max(r, 18);
}
function n0(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function DE(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function eh(e, t, n = "ltr") {
  const r = da(t),
    o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
    s = t.scrollbar.size - o,
    i = t.content - t.viewport,
    l = s - r,
    a = n === "ltr" ? [0, i] : [i * -1, 0],
    c = DE(e, a);
  return n0([0, i], [0, l])(c);
}
function PE(e, t, n, r = "ltr") {
  const o = da(n),
    s = o / 2,
    i = t || s,
    l = o - i,
    a = n.scrollbar.paddingStart + i,
    c = n.scrollbar.size - n.scrollbar.paddingEnd - l,
    u = n.content - n.viewport,
    d = r === "ltr" ? [0, u] : [u * -1, 0];
  return n0([a, c], d)(e);
}
function r0(e, t) {
  return e > 0 && e < t;
}
function Tl(e) {
  return e ? parseInt(e, 10) : 0;
}
function Dr(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (r) => {
    e == null || e(r), (n === !1 || !r.defaultPrevented) && (t == null || t(r));
  };
}
const [TE, o0] = pr("ScrollAreaScrollbar was not found in tree"),
  s0 = y.forwardRef((e, t) => {
    const {
        sizes: n,
        hasThumb: r,
        onThumbChange: o,
        onThumbPointerUp: s,
        onThumbPointerDown: i,
        onThumbPositionChange: l,
        onDragScroll: a,
        onWheelScroll: c,
        onResize: u,
        ...d
      } = e,
      f = zt(),
      [m, p] = y.useState(null),
      h = Dt(t, (D) => p(D)),
      S = y.useRef(null),
      v = y.useRef(""),
      { viewport: w } = f,
      g = n.content - n.viewport,
      b = xr(c),
      C = xr(l),
      E = ca(u, 10),
      _ = (D) => {
        if (S.current) {
          const L = D.clientX - S.current.left,
            N = D.clientY - S.current.top;
          a({ x: L, y: N });
        }
      };
    return (
      y.useEffect(() => {
        const D = (L) => {
          const N = L.target;
          (m == null ? void 0 : m.contains(N)) && b(L, g);
        };
        return (
          document.addEventListener("wheel", D, { passive: !1 }),
          () => document.removeEventListener("wheel", D, { passive: !1 })
        );
      }, [w, m, g, b]),
      y.useEffect(C, [n, C]),
      Oo(m, E),
      Oo(f.content, E),
      x.jsx(TE, {
        value: {
          scrollbar: m,
          hasThumb: r,
          onThumbChange: xr(o),
          onThumbPointerUp: xr(s),
          onThumbPositionChange: C,
          onThumbPointerDown: xr(i),
        },
        children: x.jsx("div", {
          ...d,
          ref: h,
          style: { position: "absolute", ...d.style },
          onPointerDown: Dr(e.onPointerDown, (D) => {
            D.button === 0 &&
              (D.target.setPointerCapture(D.pointerId),
              (S.current = m.getBoundingClientRect()),
              (v.current = document.body.style.webkitUserSelect),
              (document.body.style.webkitUserSelect = "none"),
              _(D));
          }),
          onPointerMove: Dr(e.onPointerMove, _),
          onPointerUp: Dr(e.onPointerUp, (D) => {
            const L = D.target;
            L.hasPointerCapture(D.pointerId) &&
              L.releasePointerCapture(D.pointerId),
              (document.body.style.webkitUserSelect = v.current),
              (S.current = null);
          }),
        }),
      })
    );
  }),
  NE = y.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = zt(),
      [l, a] = y.useState(),
      c = y.useRef(null),
      u = Dt(t, c, i.onScrollbarXChange);
    return (
      y.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      x.jsx(s0, {
        "data-orientation": "horizontal",
        ...s,
        ref: u,
        sizes: n,
        style: { ...o, "--sa-thumb-width": `${da(n)}px` },
        onThumbPointerDown: (d) => e.onThumbPointerDown(d.x),
        onDragScroll: (d) => e.onDragScroll(d.x),
        onWheelScroll: (d, f) => {
          if (i.viewport) {
            const m = i.viewport.scrollLeft + d.deltaX;
            e.onWheelScroll(m), r0(m, f) && d.preventDefault();
          }
        },
        onResize: () => {
          c.current &&
            i.viewport &&
            l &&
            r({
              content: i.viewport.scrollWidth,
              viewport: i.viewport.offsetWidth,
              scrollbar: {
                size: c.current.clientWidth,
                paddingStart: Tl(l.paddingLeft),
                paddingEnd: Tl(l.paddingRight),
              },
            });
        },
      })
    );
  }),
  OE = y.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = zt(),
      [l, a] = y.useState(),
      c = y.useRef(null),
      u = Dt(t, c, i.onScrollbarYChange);
    return (
      y.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      x.jsx(s0, {
        ...s,
        "data-orientation": "vertical",
        ref: u,
        sizes: n,
        style: { "--sa-thumb-height": `${da(n)}px`, ...o },
        onThumbPointerDown: (d) => e.onThumbPointerDown(d.y),
        onDragScroll: (d) => e.onDragScroll(d.y),
        onWheelScroll: (d, f) => {
          if (i.viewport) {
            const m = i.viewport.scrollTop + d.deltaY;
            e.onWheelScroll(m), r0(m, f) && d.preventDefault();
          }
        },
        onResize: () => {
          c.current &&
            i.viewport &&
            l &&
            r({
              content: i.viewport.scrollHeight,
              viewport: i.viewport.offsetHeight,
              scrollbar: {
                size: c.current.clientHeight,
                paddingStart: Tl(l.paddingTop),
                paddingEnd: Tl(l.paddingBottom),
              },
            });
        },
      })
    );
  }),
  gf = y.forwardRef((e, t) => {
    const { orientation: n = "vertical", ...r } = e,
      { dir: o } = hf(),
      s = zt(),
      i = y.useRef(null),
      l = y.useRef(0),
      [a, c] = y.useState({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
      }),
      u = t0(a.viewport, a.content),
      d = {
        ...r,
        sizes: a,
        onSizesChange: c,
        hasThumb: u > 0 && u < 1,
        onThumbChange: (m) => {
          i.current = m;
        },
        onThumbPointerUp: () => {
          l.current = 0;
        },
        onThumbPointerDown: (m) => {
          l.current = m;
        },
      },
      f = (m, p) => PE(m, l.current, a, p);
    return n === "horizontal"
      ? x.jsx(NE, {
          ...d,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollLeft,
                p = eh(m, a, o);
              i.current.style.transform = `translate3d(${p}px, 0, 0)`;
            }
          },
          onWheelScroll: (m) => {
            s.viewport && (s.viewport.scrollLeft = m);
          },
          onDragScroll: (m) => {
            s.viewport && (s.viewport.scrollLeft = f(m, o));
          },
        })
      : n === "vertical"
      ? x.jsx(OE, {
          ...d,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollTop,
                p = eh(m, a);
              i.current.style.transform = `translate3d(0, ${p}px, 0)`;
            }
          },
          onWheelScroll: (m) => {
            s.viewport && (s.viewport.scrollTop = m);
          },
          onDragScroll: (m) => {
            s.viewport && (s.viewport.scrollTop = f(m));
          },
        })
      : null;
  }),
  i0 = y.forwardRef((e, t) => {
    const n = zt(),
      { forceMount: r, ...o } = e,
      [s, i] = y.useState(!1),
      l = e.orientation === "horizontal",
      a = ca(() => {
        if (n.viewport) {
          const c = n.viewport.offsetWidth < n.viewport.scrollWidth,
            u = n.viewport.offsetHeight < n.viewport.scrollHeight;
          i(l ? c : u);
        }
      }, 10);
    return (
      Oo(n.viewport, a),
      Oo(n.content, a),
      r || s
        ? x.jsx(gf, { "data-state": s ? "visible" : "hidden", ...o, ref: t })
        : null
    );
  }),
  jE = y.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = zt(),
      [s, i] = y.useState(!1);
    return (
      y.useEffect(() => {
        const { scrollArea: l } = o;
        let a = 0;
        if (l) {
          const c = () => {
              window.clearTimeout(a), i(!0);
            },
            u = () => {
              a = window.setTimeout(() => i(!1), o.scrollHideDelay);
            };
          return (
            l.addEventListener("pointerenter", c),
            l.addEventListener("pointerleave", u),
            () => {
              window.clearTimeout(a),
                l.removeEventListener("pointerenter", c),
                l.removeEventListener("pointerleave", u);
            }
          );
        }
      }, [o.scrollArea, o.scrollHideDelay]),
      n || s
        ? x.jsx(i0, { "data-state": s ? "visible" : "hidden", ...r, ref: t })
        : null
    );
  }),
  $E = y.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = zt(),
      s = e.orientation === "horizontal",
      [i, l] = y.useState("hidden"),
      a = ca(() => l("idle"), 100);
    return (
      y.useEffect(() => {
        if (i === "idle") {
          const c = window.setTimeout(() => l("hidden"), o.scrollHideDelay);
          return () => window.clearTimeout(c);
        }
      }, [i, o.scrollHideDelay]),
      y.useEffect(() => {
        const { viewport: c } = o,
          u = s ? "scrollLeft" : "scrollTop";
        if (c) {
          let d = c[u];
          const f = () => {
            const m = c[u];
            d !== m && (l("scrolling"), a()), (d = m);
          };
          return (
            c.addEventListener("scroll", f),
            () => c.removeEventListener("scroll", f)
          );
        }
      }, [o.viewport, s, a]),
      n || i !== "hidden"
        ? x.jsx(gf, {
            "data-state": i === "hidden" ? "hidden" : "visible",
            ...r,
            ref: t,
            onPointerEnter: Dr(e.onPointerEnter, () => l("interacting")),
            onPointerLeave: Dr(e.onPointerLeave, () => l("idle")),
          })
        : null
    );
  }),
  th = y.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = zt(),
      { onScrollbarXEnabledChange: s, onScrollbarYEnabledChange: i } = o,
      l = e.orientation === "horizontal";
    return (
      y.useEffect(
        () => (
          l ? s(!0) : i(!0),
          () => {
            l ? s(!1) : i(!1);
          }
        ),
        [l, s, i]
      ),
      o.type === "hover"
        ? x.jsx(jE, { ...r, ref: t, forceMount: n })
        : o.type === "scroll"
        ? x.jsx($E, { ...r, ref: t, forceMount: n })
        : o.type === "auto"
        ? x.jsx(i0, { ...r, ref: t, forceMount: n })
        : o.type === "always"
        ? x.jsx(gf, { ...r, ref: t })
        : null
    );
  });
function LE(e, t = () => {}) {
  let n = { left: e.scrollLeft, top: e.scrollTop },
    r = 0;
  return (
    (function o() {
      const s = { left: e.scrollLeft, top: e.scrollTop },
        i = n.left !== s.left,
        l = n.top !== s.top;
      (i || l) && t(), (n = s), (r = window.requestAnimationFrame(o));
    })(),
    () => window.cancelAnimationFrame(r)
  );
}
const AE = y.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = zt(),
      s = o0(),
      { onThumbPositionChange: i } = s,
      l = Dt(t, (u) => s.onThumbChange(u)),
      a = y.useRef(),
      c = ca(() => {
        a.current && (a.current(), (a.current = void 0));
      }, 100);
    return (
      y.useEffect(() => {
        const { viewport: u } = o;
        if (u) {
          const d = () => {
            if ((c(), !a.current)) {
              const f = LE(u, i);
              (a.current = f), i();
            }
          };
          return (
            i(),
            u.addEventListener("scroll", d),
            () => u.removeEventListener("scroll", d)
          );
        }
      }, [o.viewport, c, i]),
      x.jsx("div", {
        "data-state": s.hasThumb ? "visible" : "hidden",
        ...r,
        ref: l,
        style: {
          width: "var(--sa-thumb-width)",
          height: "var(--sa-thumb-height)",
          ...n,
        },
        onPointerDownCapture: Dr(e.onPointerDownCapture, (u) => {
          const f = u.target.getBoundingClientRect(),
            m = u.clientX - f.left,
            p = u.clientY - f.top;
          s.onThumbPointerDown({ x: m, y: p });
        }),
        onPointerUp: Dr(e.onPointerUp, s.onThumbPointerUp),
      })
    );
  }),
  nh = y.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = o0();
    return n || o.hasThumb ? x.jsx(AE, { ref: t, ...r }) : null;
  }),
  l0 = y.forwardRef(({ children: e, style: t, ...n }, r) => {
    const o = zt(),
      s = Dt(r, o.onViewportChange);
    return x.jsx(G, {
      ...n,
      ref: s,
      style: {
        overflowX: o.scrollbarXEnabled ? "scroll" : "hidden",
        overflowY: o.scrollbarYEnabled ? "scroll" : "hidden",
        ...t,
      },
      children: x.jsx("div", {
        style: { minWidth: "100%", display: "table" },
        ref: o.onContentChange,
        children: e,
      }),
    });
  });
l0.displayName = "@mantine/core/ScrollAreaViewport";
var yf = {
  root: "m_d57069b5",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268",
};
const a0 = { scrollHideDelay: 1e3, type: "hover", scrollbars: "xy" },
  FE = (e, { scrollbarSize: t }) => ({
    root: { "--scrollarea-scrollbar-size": z(t) },
  }),
  oi = X((e, t) => {
    const n = U("ScrollArea", a0, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        scrollbarSize: a,
        vars: c,
        type: u,
        scrollHideDelay: d,
        viewportProps: f,
        viewportRef: m,
        onScrollPositionChange: p,
        children: h,
        offsetScrollbars: S,
        scrollbars: v,
        ...w
      } = n,
      [g, b] = y.useState(!1),
      C = ue({
        name: "ScrollArea",
        props: n,
        classes: yf,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: FE,
      });
    return x.jsxs(e0, {
      type: u === "never" ? "always" : u,
      scrollHideDelay: d,
      ref: t,
      scrollbars: v,
      ...C("root"),
      ...w,
      children: [
        x.jsx(l0, {
          ...f,
          ...C("viewport", { style: f == null ? void 0 : f.style }),
          ref: m,
          "data-offset-scrollbars": S === !0 ? "xy" : S || void 0,
          "data-scrollbars": v || void 0,
          onScroll: (E) => {
            var _;
            (_ = f == null ? void 0 : f.onScroll) == null || _.call(f, E),
              p == null ||
                p({
                  x: E.currentTarget.scrollLeft,
                  y: E.currentTarget.scrollTop,
                });
          },
          children: h,
        }),
        (v === "xy" || v === "x") &&
          x.jsx(th, {
            ...C("scrollbar"),
            orientation: "horizontal",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: x.jsx(nh, { ...C("thumb") }),
          }),
        (v === "xy" || v === "y") &&
          x.jsx(th, {
            ...C("scrollbar"),
            orientation: "vertical",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: x.jsx(nh, { ...C("thumb") }),
          }),
        x.jsx(_E, {
          ...C("corner"),
          "data-hovered": g || void 0,
          "data-hidden": u === "never" || void 0,
        }),
      ],
    });
  });
oi.displayName = "@mantine/core/ScrollArea";
const vf = X((e, t) => {
  const {
    children: n,
    classNames: r,
    styles: o,
    scrollbarSize: s,
    scrollHideDelay: i,
    type: l,
    dir: a,
    offsetScrollbars: c,
    viewportRef: u,
    onScrollPositionChange: d,
    unstyled: f,
    variant: m,
    viewportProps: p,
    scrollbars: h,
    style: S,
    vars: v,
    ...w
  } = U("ScrollAreaAutosize", a0, e);
  return x.jsx(G, {
    ...w,
    ref: t,
    style: [{ display: "flex", overflow: "auto" }, S],
    children: x.jsx(G, {
      style: { display: "flex", flexDirection: "column", flex: 1 },
      children: x.jsx(oi, {
        classNames: r,
        styles: o,
        scrollHideDelay: i,
        scrollbarSize: s,
        type: l,
        dir: a,
        offsetScrollbars: c,
        viewportRef: u,
        onScrollPositionChange: d,
        unstyled: f,
        variant: m,
        viewportProps: p,
        vars: v,
        scrollbars: h,
        children: n,
      }),
    }),
  });
});
oi.classes = yf;
vf.displayName = "@mantine/core/ScrollAreaAutosize";
vf.classes = yf;
oi.Autosize = vf;
var c0 = { root: "m_87cf2631" };
const ME = { __staticSelector: "UnstyledButton" },
  Pn = Fn((e, t) => {
    const n = U("UnstyledButton", ME, e),
      {
        className: r,
        component: o = "button",
        __staticSelector: s,
        unstyled: i,
        classNames: l,
        styles: a,
        style: c,
        ...u
      } = n,
      d = ue({
        name: s,
        props: n,
        classes: c0,
        className: r,
        style: c,
        classNames: l,
        styles: a,
        unstyled: i,
      });
    return x.jsx(G, {
      ...d("root", { focusable: !0 }),
      component: o,
      ref: t,
      type: o === "button" ? "button" : void 0,
      ...u,
    });
  });
Pn.classes = c0;
Pn.displayName = "@mantine/core/UnstyledButton";
var u0 = { root: "m_515a97f8" };
const IE = {},
  wf = X((e, t) => {
    const n = U("VisuallyHidden", IE, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        ...c
      } = n,
      u = ue({
        name: "VisuallyHidden",
        classes: u0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
      });
    return x.jsx(G, { component: "span", ref: t, ...u("root"), ...c });
  });
wf.classes = u0;
wf.displayName = "@mantine/core/VisuallyHidden";
var d0 = { root: "m_1b7284a3" };
const zE = {},
  BE = (e, { radius: t, shadow: n }) => ({
    root: {
      "--paper-radius": t === void 0 ? void 0 : Sn(t),
      "--paper-shadow": af(n),
    },
  }),
  xf = Fn((e, t) => {
    const n = U("Paper", zE, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        withBorder: a,
        vars: c,
        radius: u,
        shadow: d,
        variant: f,
        mod: m,
        ...p
      } = n,
      h = ue({
        name: "Paper",
        props: n,
        classes: d0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: BE,
      });
    return x.jsx(G, {
      ref: t,
      mod: [{ "data-with-border": a }, m],
      ...h("root"),
      variant: f,
      ...p,
    });
  });
xf.classes = d0;
xf.displayName = "@mantine/core/Paper";
function Vo(e) {
  return f0(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Et(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function Mn(e) {
  var t;
  return (t = (f0(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function f0(e) {
  return e instanceof Node || e instanceof Et(e).Node;
}
function pt(e) {
  return e instanceof Element || e instanceof Et(e).Element;
}
function xn(e) {
  return e instanceof HTMLElement || e instanceof Et(e).HTMLElement;
}
function rh(e) {
  return typeof ShadowRoot > "u"
    ? !1
    : e instanceof ShadowRoot || e instanceof Et(e).ShadowRoot;
}
function si(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: o } = en(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + r + n) &&
    !["inline", "contents"].includes(o)
  );
}
function VE(e) {
  return ["table", "td", "th"].includes(Vo(e));
}
function Sf(e) {
  const t = bf(),
    n = en(e);
  return (
    n.transform !== "none" ||
    n.perspective !== "none" ||
    (n.containerType ? n.containerType !== "normal" : !1) ||
    (!t && (n.backdropFilter ? n.backdropFilter !== "none" : !1)) ||
    (!t && (n.filter ? n.filter !== "none" : !1)) ||
    ["transform", "perspective", "filter"].some((r) =>
      (n.willChange || "").includes(r)
    ) ||
    ["paint", "layout", "strict", "content"].some((r) =>
      (n.contain || "").includes(r)
    )
  );
}
function HE(e) {
  let t = ar(e);
  for (; xn(t) && !jo(t); ) {
    if (Sf(t)) return t;
    t = ar(t);
  }
  return null;
}
function bf() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none");
}
function jo(e) {
  return ["html", "body", "#document"].includes(Vo(e));
}
function en(e) {
  return Et(e).getComputedStyle(e);
}
function fa(e) {
  return pt(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.pageXOffset, scrollTop: e.pageYOffset };
}
function ar(e) {
  if (Vo(e) === "html") return e;
  const t = e.assignedSlot || e.parentNode || (rh(e) && e.host) || Mn(e);
  return rh(t) ? t.host : t;
}
function p0(e) {
  const t = ar(e);
  return jo(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : xn(t) && si(t)
    ? t
    : p0(t);
}
function Us(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = p0(e),
    s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
    i = Et(o);
  return s
    ? t.concat(
        i,
        i.visualViewport || [],
        si(o) ? o : [],
        i.frameElement && n ? Us(i.frameElement) : []
      )
    : t.concat(o, Us(o, [], n));
}
const tn = Math.min,
  Ze = Math.max,
  Nl = Math.round,
  Li = Math.floor,
  cr = (e) => ({ x: e, y: e }),
  UE = { left: "right", right: "left", bottom: "top", top: "bottom" },
  WE = { start: "end", end: "start" };
function Bu(e, t, n) {
  return Ze(e, tn(t, n));
}
function Ln(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function nn(e) {
  return e.split("-")[0];
}
function Ho(e) {
  return e.split("-")[1];
}
function Cf(e) {
  return e === "x" ? "y" : "x";
}
function Ef(e) {
  return e === "y" ? "height" : "width";
}
function Kr(e) {
  return ["top", "bottom"].includes(nn(e)) ? "y" : "x";
}
function kf(e) {
  return Cf(Kr(e));
}
function YE(e, t, n) {
  n === void 0 && (n = !1);
  const r = Ho(e),
    o = kf(e),
    s = Ef(o);
  let i =
    o === "x"
      ? r === (n ? "end" : "start")
        ? "right"
        : "left"
      : r === "start"
      ? "bottom"
      : "top";
  return t.reference[s] > t.floating[s] && (i = Ol(i)), [i, Ol(i)];
}
function KE(e) {
  const t = Ol(e);
  return [Vu(e), t, Vu(t)];
}
function Vu(e) {
  return e.replace(/start|end/g, (t) => WE[t]);
}
function qE(e, t, n) {
  const r = ["left", "right"],
    o = ["right", "left"],
    s = ["top", "bottom"],
    i = ["bottom", "top"];
  switch (e) {
    case "top":
    case "bottom":
      return n ? (t ? o : r) : t ? r : o;
    case "left":
    case "right":
      return t ? s : i;
    default:
      return [];
  }
}
function GE(e, t, n, r) {
  const o = Ho(e);
  let s = qE(nn(e), n === "start", r);
  return (
    o && ((s = s.map((i) => i + "-" + o)), t && (s = s.concat(s.map(Vu)))), s
  );
}
function Ol(e) {
  return e.replace(/left|right|bottom|top/g, (t) => UE[t]);
}
function XE(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function _f(e) {
  return typeof e != "number"
    ? XE(e)
    : { top: e, right: e, bottom: e, left: e };
}
function $o(e) {
  const { x: t, y: n, width: r, height: o } = e;
  return {
    width: r,
    height: o,
    top: n,
    left: t,
    right: t + r,
    bottom: n + o,
    x: t,
    y: n,
  };
}
function oh(e, t, n) {
  let { reference: r, floating: o } = e;
  const s = Kr(t),
    i = kf(t),
    l = Ef(i),
    a = nn(t),
    c = s === "y",
    u = r.x + r.width / 2 - o.width / 2,
    d = r.y + r.height / 2 - o.height / 2,
    f = r[l] / 2 - o[l] / 2;
  let m;
  switch (a) {
    case "top":
      m = { x: u, y: r.y - o.height };
      break;
    case "bottom":
      m = { x: u, y: r.y + r.height };
      break;
    case "right":
      m = { x: r.x + r.width, y: d };
      break;
    case "left":
      m = { x: r.x - o.width, y: d };
      break;
    default:
      m = { x: r.x, y: r.y };
  }
  switch (Ho(t)) {
    case "start":
      m[i] -= f * (n && c ? -1 : 1);
      break;
    case "end":
      m[i] += f * (n && c ? -1 : 1);
      break;
  }
  return m;
}
const QE = async (e, t, n) => {
  const {
      placement: r = "bottom",
      strategy: o = "absolute",
      middleware: s = [],
      platform: i,
    } = n,
    l = s.filter(Boolean),
    a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({ reference: e, floating: t, strategy: o }),
    { x: u, y: d } = oh(c, r, a),
    f = r,
    m = {},
    p = 0;
  for (let h = 0; h < l.length; h++) {
    const { name: S, fn: v } = l[h],
      {
        x: w,
        y: g,
        data: b,
        reset: C,
      } = await v({
        x: u,
        y: d,
        initialPlacement: r,
        placement: f,
        strategy: o,
        middlewareData: m,
        rects: c,
        platform: i,
        elements: { reference: e, floating: t },
      });
    (u = w ?? u),
      (d = g ?? d),
      (m = { ...m, [S]: { ...m[S], ...b } }),
      C &&
        p <= 50 &&
        (p++,
        typeof C == "object" &&
          (C.placement && (f = C.placement),
          C.rects &&
            (c =
              C.rects === !0
                ? await i.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: o,
                  })
                : C.rects),
          ({ x: u, y: d } = oh(c, f, a))),
        (h = -1));
  }
  return { x: u, y: d, placement: f, strategy: o, middlewareData: m };
};
async function Rf(e, t) {
  var n;
  t === void 0 && (t = {});
  const { x: r, y: o, platform: s, rects: i, elements: l, strategy: a } = e,
    {
      boundary: c = "clippingAncestors",
      rootBoundary: u = "viewport",
      elementContext: d = "floating",
      altBoundary: f = !1,
      padding: m = 0,
    } = Ln(t, e),
    p = _f(m),
    S = l[f ? (d === "floating" ? "reference" : "floating") : d],
    v = $o(
      await s.getClippingRect({
        element:
          (n = await (s.isElement == null ? void 0 : s.isElement(S))) == null ||
          n
            ? S
            : S.contextElement ||
              (await (s.getDocumentElement == null
                ? void 0
                : s.getDocumentElement(l.floating))),
        boundary: c,
        rootBoundary: u,
        strategy: a,
      })
    ),
    w =
      d === "floating"
        ? { x: r, y: o, width: i.floating.width, height: i.floating.height }
        : i.reference,
    g = await (s.getOffsetParent == null
      ? void 0
      : s.getOffsetParent(l.floating)),
    b = (await (s.isElement == null ? void 0 : s.isElement(g)))
      ? (await (s.getScale == null ? void 0 : s.getScale(g))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    C = $o(
      s.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: w,
            offsetParent: g,
            strategy: a,
          })
        : w
    );
  return {
    top: (v.top - C.top + p.top) / b.y,
    bottom: (C.bottom - v.bottom + p.bottom) / b.y,
    left: (v.left - C.left + p.left) / b.x,
    right: (C.right - v.right + p.right) / b.x,
  };
}
const JE = (e) => ({
    name: "arrow",
    options: e,
    async fn(t) {
      const {
          x: n,
          y: r,
          placement: o,
          rects: s,
          platform: i,
          elements: l,
          middlewareData: a,
        } = t,
        { element: c, padding: u = 0 } = Ln(e, t) || {};
      if (c == null) return {};
      const d = _f(u),
        f = { x: n, y: r },
        m = kf(o),
        p = Ef(m),
        h = await i.getDimensions(c),
        S = m === "y",
        v = S ? "top" : "left",
        w = S ? "bottom" : "right",
        g = S ? "clientHeight" : "clientWidth",
        b = s.reference[p] + s.reference[m] - f[m] - s.floating[p],
        C = f[m] - s.reference[m],
        E = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
      let _ = E ? E[g] : 0;
      (!_ || !(await (i.isElement == null ? void 0 : i.isElement(E)))) &&
        (_ = l.floating[g] || s.floating[p]);
      const D = b / 2 - C / 2,
        L = _ / 2 - h[p] / 2 - 1,
        N = tn(d[v], L),
        M = tn(d[w], L),
        B = N,
        V = _ - h[p] - M,
        A = _ / 2 - h[p] / 2 + D,
        j = Bu(B, A, V),
        P =
          !a.arrow &&
          Ho(o) != null &&
          A !== j &&
          s.reference[p] / 2 - (A < B ? N : M) - h[p] / 2 < 0,
        T = P ? (A < B ? A - B : A - V) : 0;
      return {
        [m]: f[m] + T,
        data: {
          [m]: j,
          centerOffset: A - j - T,
          ...(P && { alignmentOffset: T }),
        },
        reset: P,
      };
    },
  }),
  ZE = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "flip",
        options: e,
        async fn(t) {
          var n, r;
          const {
              placement: o,
              middlewareData: s,
              rects: i,
              initialPlacement: l,
              platform: a,
              elements: c,
            } = t,
            {
              mainAxis: u = !0,
              crossAxis: d = !0,
              fallbackPlacements: f,
              fallbackStrategy: m = "bestFit",
              fallbackAxisSideDirection: p = "none",
              flipAlignment: h = !0,
              ...S
            } = Ln(e, t);
          if ((n = s.arrow) != null && n.alignmentOffset) return {};
          const v = nn(o),
            w = nn(l) === l,
            g = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)),
            b = f || (w || !h ? [Ol(l)] : KE(l));
          !f && p !== "none" && b.push(...GE(l, h, p, g));
          const C = [l, ...b],
            E = await Rf(t, S),
            _ = [];
          let D = ((r = s.flip) == null ? void 0 : r.overflows) || [];
          if ((u && _.push(E[v]), d)) {
            const B = YE(o, i, g);
            _.push(E[B[0]], E[B[1]]);
          }
          if (
            ((D = [...D, { placement: o, overflows: _ }]),
            !_.every((B) => B <= 0))
          ) {
            var L, N;
            const B = (((L = s.flip) == null ? void 0 : L.index) || 0) + 1,
              V = C[B];
            if (V)
              return {
                data: { index: B, overflows: D },
                reset: { placement: V },
              };
            let A =
              (N = D.filter((j) => j.overflows[0] <= 0).sort(
                (j, P) => j.overflows[1] - P.overflows[1]
              )[0]) == null
                ? void 0
                : N.placement;
            if (!A)
              switch (m) {
                case "bestFit": {
                  var M;
                  const j =
                    (M = D.map((P) => [
                      P.placement,
                      P.overflows
                        .filter((T) => T > 0)
                        .reduce((T, R) => T + R, 0),
                    ]).sort((P, T) => P[1] - T[1])[0]) == null
                      ? void 0
                      : M[0];
                  j && (A = j);
                  break;
                }
                case "initialPlacement":
                  A = l;
                  break;
              }
            if (o !== A) return { reset: { placement: A } };
          }
          return {};
        },
      }
    );
  };
function m0(e) {
  const t = tn(...e.map((s) => s.left)),
    n = tn(...e.map((s) => s.top)),
    r = Ze(...e.map((s) => s.right)),
    o = Ze(...e.map((s) => s.bottom));
  return { x: t, y: n, width: r - t, height: o - n };
}
function ek(e) {
  const t = e.slice().sort((o, s) => o.y - s.y),
    n = [];
  let r = null;
  for (let o = 0; o < t.length; o++) {
    const s = t[o];
    !r || s.y - r.y > r.height / 2 ? n.push([s]) : n[n.length - 1].push(s),
      (r = s);
  }
  return n.map((o) => $o(m0(o)));
}
const tk = function (e) {
  return (
    e === void 0 && (e = {}),
    {
      name: "inline",
      options: e,
      async fn(t) {
        const {
            placement: n,
            elements: r,
            rects: o,
            platform: s,
            strategy: i,
          } = t,
          { padding: l = 2, x: a, y: c } = Ln(e, t),
          u = Array.from(
            (await (s.getClientRects == null
              ? void 0
              : s.getClientRects(r.reference))) || []
          ),
          d = ek(u),
          f = $o(m0(u)),
          m = _f(l);
        function p() {
          if (
            d.length === 2 &&
            d[0].left > d[1].right &&
            a != null &&
            c != null
          )
            return (
              d.find(
                (S) =>
                  a > S.left - m.left &&
                  a < S.right + m.right &&
                  c > S.top - m.top &&
                  c < S.bottom + m.bottom
              ) || f
            );
          if (d.length >= 2) {
            if (Kr(n) === "y") {
              const N = d[0],
                M = d[d.length - 1],
                B = nn(n) === "top",
                V = N.top,
                A = M.bottom,
                j = B ? N.left : M.left,
                P = B ? N.right : M.right,
                T = P - j,
                R = A - V;
              return {
                top: V,
                bottom: A,
                left: j,
                right: P,
                width: T,
                height: R,
                x: j,
                y: V,
              };
            }
            const S = nn(n) === "left",
              v = Ze(...d.map((N) => N.right)),
              w = tn(...d.map((N) => N.left)),
              g = d.filter((N) => (S ? N.left === w : N.right === v)),
              b = g[0].top,
              C = g[g.length - 1].bottom,
              E = w,
              _ = v,
              D = _ - E,
              L = C - b;
            return {
              top: b,
              bottom: C,
              left: E,
              right: _,
              width: D,
              height: L,
              x: E,
              y: b,
            };
          }
          return f;
        }
        const h = await s.getElementRects({
          reference: { getBoundingClientRect: p },
          floating: r.floating,
          strategy: i,
        });
        return o.reference.x !== h.reference.x ||
          o.reference.y !== h.reference.y ||
          o.reference.width !== h.reference.width ||
          o.reference.height !== h.reference.height
          ? { reset: { rects: h } }
          : {};
      },
    }
  );
};
async function nk(e, t) {
  const { placement: n, platform: r, elements: o } = e,
    s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
    i = nn(n),
    l = Ho(n),
    a = Kr(n) === "y",
    c = ["left", "top"].includes(i) ? -1 : 1,
    u = s && a ? -1 : 1,
    d = Ln(t, e);
  let {
    mainAxis: f,
    crossAxis: m,
    alignmentAxis: p,
  } = typeof d == "number"
    ? { mainAxis: d, crossAxis: 0, alignmentAxis: null }
    : { mainAxis: 0, crossAxis: 0, alignmentAxis: null, ...d };
  return (
    l && typeof p == "number" && (m = l === "end" ? p * -1 : p),
    a ? { x: m * u, y: f * c } : { x: f * c, y: m * u }
  );
}
const rk = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: "offset",
        options: e,
        async fn(t) {
          var n, r;
          const { x: o, y: s, placement: i, middlewareData: l } = t,
            a = await nk(t, e);
          return i === ((n = l.offset) == null ? void 0 : n.placement) &&
            (r = l.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: o + a.x, y: s + a.y, data: { ...a, placement: i } };
        },
      }
    );
  },
  ok = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "shift",
        options: e,
        async fn(t) {
          const { x: n, y: r, placement: o } = t,
            {
              mainAxis: s = !0,
              crossAxis: i = !1,
              limiter: l = {
                fn: (S) => {
                  let { x: v, y: w } = S;
                  return { x: v, y: w };
                },
              },
              ...a
            } = Ln(e, t),
            c = { x: n, y: r },
            u = await Rf(t, a),
            d = Kr(nn(o)),
            f = Cf(d);
          let m = c[f],
            p = c[d];
          if (s) {
            const S = f === "y" ? "top" : "left",
              v = f === "y" ? "bottom" : "right",
              w = m + u[S],
              g = m - u[v];
            m = Bu(w, m, g);
          }
          if (i) {
            const S = d === "y" ? "top" : "left",
              v = d === "y" ? "bottom" : "right",
              w = p + u[S],
              g = p - u[v];
            p = Bu(w, p, g);
          }
          const h = l.fn({ ...t, [f]: m, [d]: p });
          return { ...h, data: { x: h.x - n, y: h.y - r } };
        },
      }
    );
  },
  sk = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: r, placement: o, rects: s, middlewareData: i } = t,
            { offset: l = 0, mainAxis: a = !0, crossAxis: c = !0 } = Ln(e, t),
            u = { x: n, y: r },
            d = Kr(o),
            f = Cf(d);
          let m = u[f],
            p = u[d];
          const h = Ln(l, t),
            S =
              typeof h == "number"
                ? { mainAxis: h, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...h };
          if (a) {
            const g = f === "y" ? "height" : "width",
              b = s.reference[f] - s.floating[g] + S.mainAxis,
              C = s.reference[f] + s.reference[g] - S.mainAxis;
            m < b ? (m = b) : m > C && (m = C);
          }
          if (c) {
            var v, w;
            const g = f === "y" ? "width" : "height",
              b = ["top", "left"].includes(nn(o)),
              C =
                s.reference[d] -
                s.floating[g] +
                ((b && ((v = i.offset) == null ? void 0 : v[d])) || 0) +
                (b ? 0 : S.crossAxis),
              E =
                s.reference[d] +
                s.reference[g] +
                (b ? 0 : ((w = i.offset) == null ? void 0 : w[d]) || 0) -
                (b ? S.crossAxis : 0);
            p < C ? (p = C) : p > E && (p = E);
          }
          return { [f]: m, [d]: p };
        },
      }
    );
  },
  ik = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "size",
        options: e,
        async fn(t) {
          const { placement: n, rects: r, platform: o, elements: s } = t,
            { apply: i = () => {}, ...l } = Ln(e, t),
            a = await Rf(t, l),
            c = nn(n),
            u = Ho(n),
            d = Kr(n) === "y",
            { width: f, height: m } = r.floating;
          let p, h;
          c === "top" || c === "bottom"
            ? ((p = c),
              (h =
                u ===
                ((await (o.isRTL == null ? void 0 : o.isRTL(s.floating)))
                  ? "start"
                  : "end")
                  ? "left"
                  : "right"))
            : ((h = c), (p = u === "end" ? "top" : "bottom"));
          const S = m - a[p],
            v = f - a[h],
            w = !t.middlewareData.shift;
          let g = S,
            b = v;
          if (d) {
            const E = f - a.left - a.right;
            b = u || w ? tn(v, E) : E;
          } else {
            const E = m - a.top - a.bottom;
            g = u || w ? tn(S, E) : E;
          }
          if (w && !u) {
            const E = Ze(a.left, 0),
              _ = Ze(a.right, 0),
              D = Ze(a.top, 0),
              L = Ze(a.bottom, 0);
            d
              ? (b = f - 2 * (E !== 0 || _ !== 0 ? E + _ : Ze(a.left, a.right)))
              : (g =
                  m - 2 * (D !== 0 || L !== 0 ? D + L : Ze(a.top, a.bottom)));
          }
          await i({ ...t, availableWidth: b, availableHeight: g });
          const C = await o.getDimensions(s.floating);
          return f !== C.width || m !== C.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function h0(e) {
  const t = en(e);
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0;
  const o = xn(e),
    s = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : r,
    l = Nl(n) !== s || Nl(r) !== i;
  return l && ((n = s), (r = i)), { width: n, height: r, $: l };
}
function Df(e) {
  return pt(e) ? e : e.contextElement;
}
function So(e) {
  const t = Df(e);
  if (!xn(t)) return cr(1);
  const n = t.getBoundingClientRect(),
    { width: r, height: o, $: s } = h0(t);
  let i = (s ? Nl(n.width) : n.width) / r,
    l = (s ? Nl(n.height) : n.height) / o;
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: i, y: l }
  );
}
const lk = cr(0);
function g0(e) {
  const t = Et(e);
  return !bf() || !t.visualViewport
    ? lk
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function ak(e, t, n) {
  return t === void 0 && (t = !1), !n || (t && n !== Et(e)) ? !1 : t;
}
function Fr(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(),
    s = Df(e);
  let i = cr(1);
  t && (r ? pt(r) && (i = So(r)) : (i = So(e)));
  const l = ak(s, n, r) ? g0(s) : cr(0);
  let a = (o.left + l.x) / i.x,
    c = (o.top + l.y) / i.y,
    u = o.width / i.x,
    d = o.height / i.y;
  if (s) {
    const f = Et(s),
      m = r && pt(r) ? Et(r) : r;
    let p = f,
      h = p.frameElement;
    for (; h && r && m !== p; ) {
      const S = So(h),
        v = h.getBoundingClientRect(),
        w = en(h),
        g = v.left + (h.clientLeft + parseFloat(w.paddingLeft)) * S.x,
        b = v.top + (h.clientTop + parseFloat(w.paddingTop)) * S.y;
      (a *= S.x),
        (c *= S.y),
        (u *= S.x),
        (d *= S.y),
        (a += g),
        (c += b),
        (p = Et(h)),
        (h = p.frameElement);
    }
  }
  return $o({ width: u, height: d, x: a, y: c });
}
const ck = [":popover-open", ":modal"];
function Pf(e) {
  return ck.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function uk(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: o } = e;
  const s = o === "fixed",
    i = Mn(r),
    l = t ? Pf(t.floating) : !1;
  if (r === i || (l && s)) return n;
  let a = { scrollLeft: 0, scrollTop: 0 },
    c = cr(1);
  const u = cr(0),
    d = xn(r);
  if (
    (d || (!d && !s)) &&
    ((Vo(r) !== "body" || si(i)) && (a = fa(r)), xn(r))
  ) {
    const f = Fr(r);
    (c = So(r)), (u.x = f.x + r.clientLeft), (u.y = f.y + r.clientTop);
  }
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - a.scrollLeft * c.x + u.x,
    y: n.y * c.y - a.scrollTop * c.y + u.y,
  };
}
function dk(e) {
  return Array.from(e.getClientRects());
}
function y0(e) {
  return Fr(Mn(e)).left + fa(e).scrollLeft;
}
function fk(e) {
  const t = Mn(e),
    n = fa(e),
    r = e.ownerDocument.body,
    o = Ze(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    s = Ze(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let i = -n.scrollLeft + y0(e);
  const l = -n.scrollTop;
  return (
    en(r).direction === "rtl" && (i += Ze(t.clientWidth, r.clientWidth) - o),
    { width: o, height: s, x: i, y: l }
  );
}
function pk(e, t) {
  const n = Et(e),
    r = Mn(e),
    o = n.visualViewport;
  let s = r.clientWidth,
    i = r.clientHeight,
    l = 0,
    a = 0;
  if (o) {
    (s = o.width), (i = o.height);
    const c = bf();
    (!c || (c && t === "fixed")) && ((l = o.offsetLeft), (a = o.offsetTop));
  }
  return { width: s, height: i, x: l, y: a };
}
function mk(e, t) {
  const n = Fr(e, !0, t === "fixed"),
    r = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    s = xn(e) ? So(e) : cr(1),
    i = e.clientWidth * s.x,
    l = e.clientHeight * s.y,
    a = o * s.x,
    c = r * s.y;
  return { width: i, height: l, x: a, y: c };
}
function sh(e, t, n) {
  let r;
  if (t === "viewport") r = pk(e, n);
  else if (t === "document") r = fk(Mn(e));
  else if (pt(t)) r = mk(t, n);
  else {
    const o = g0(e);
    r = { ...t, x: t.x - o.x, y: t.y - o.y };
  }
  return $o(r);
}
function v0(e, t) {
  const n = ar(e);
  return n === t || !pt(n) || jo(n)
    ? !1
    : en(n).position === "fixed" || v0(n, t);
}
function hk(e, t) {
  const n = t.get(e);
  if (n) return n;
  let r = Us(e, [], !1).filter((l) => pt(l) && Vo(l) !== "body"),
    o = null;
  const s = en(e).position === "fixed";
  let i = s ? ar(e) : e;
  for (; pt(i) && !jo(i); ) {
    const l = en(i),
      a = Sf(i);
    !a && l.position === "fixed" && (o = null),
      (
        s
          ? !a && !o
          : (!a &&
              l.position === "static" &&
              !!o &&
              ["absolute", "fixed"].includes(o.position)) ||
            (si(i) && !a && v0(e, i))
      )
        ? (r = r.filter((u) => u !== i))
        : (o = l),
      (i = ar(i));
  }
  return t.set(e, r), r;
}
function gk(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: o } = e;
  const i = [
      ...(n === "clippingAncestors"
        ? Pf(t)
          ? []
          : hk(t, this._c)
        : [].concat(n)),
      r,
    ],
    l = i[0],
    a = i.reduce((c, u) => {
      const d = sh(t, u, o);
      return (
        (c.top = Ze(d.top, c.top)),
        (c.right = tn(d.right, c.right)),
        (c.bottom = tn(d.bottom, c.bottom)),
        (c.left = Ze(d.left, c.left)),
        c
      );
    }, sh(t, l, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top,
  };
}
function yk(e) {
  const { width: t, height: n } = h0(e);
  return { width: t, height: n };
}
function vk(e, t, n) {
  const r = xn(t),
    o = Mn(t),
    s = n === "fixed",
    i = Fr(e, !0, s, t);
  let l = { scrollLeft: 0, scrollTop: 0 };
  const a = cr(0);
  if (r || (!r && !s))
    if (((Vo(t) !== "body" || si(o)) && (l = fa(t)), r)) {
      const d = Fr(t, !0, s, t);
      (a.x = d.x + t.clientLeft), (a.y = d.y + t.clientTop);
    } else o && (a.x = y0(o));
  const c = i.left + l.scrollLeft - a.x,
    u = i.top + l.scrollTop - a.y;
  return { x: c, y: u, width: i.width, height: i.height };
}
function Ac(e) {
  return en(e).position === "static";
}
function ih(e, t) {
  return !xn(e) || en(e).position === "fixed"
    ? null
    : t
    ? t(e)
    : e.offsetParent;
}
function w0(e, t) {
  const n = Et(e);
  if (Pf(e)) return n;
  if (!xn(e)) {
    let o = ar(e);
    for (; o && !jo(o); ) {
      if (pt(o) && !Ac(o)) return o;
      o = ar(o);
    }
    return n;
  }
  let r = ih(e, t);
  for (; r && VE(r) && Ac(r); ) r = ih(r, t);
  return r && jo(r) && Ac(r) && !Sf(r) ? n : r || HE(e) || n;
}
const wk = async function (e) {
  const t = this.getOffsetParent || w0,
    n = this.getDimensions,
    r = await n(e.floating);
  return {
    reference: vk(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  };
};
function xk(e) {
  return en(e).direction === "rtl";
}
const Sk = {
  convertOffsetParentRelativeRectToViewportRelativeRect: uk,
  getDocumentElement: Mn,
  getClippingRect: gk,
  getOffsetParent: w0,
  getElementRects: wk,
  getClientRects: dk,
  getDimensions: yk,
  getScale: So,
  isElement: pt,
  isRTL: xk,
};
function bk(e, t) {
  let n = null,
    r;
  const o = Mn(e);
  function s() {
    var l;
    clearTimeout(r), (l = n) == null || l.disconnect(), (n = null);
  }
  function i(l, a) {
    l === void 0 && (l = !1), a === void 0 && (a = 1), s();
    const { left: c, top: u, width: d, height: f } = e.getBoundingClientRect();
    if ((l || t(), !d || !f)) return;
    const m = Li(u),
      p = Li(o.clientWidth - (c + d)),
      h = Li(o.clientHeight - (u + f)),
      S = Li(c),
      w = {
        rootMargin: -m + "px " + -p + "px " + -h + "px " + -S + "px",
        threshold: Ze(0, tn(1, a)) || 1,
      };
    let g = !0;
    function b(C) {
      const E = C[0].intersectionRatio;
      if (E !== a) {
        if (!g) return i();
        E
          ? i(!1, E)
          : (r = setTimeout(() => {
              i(!1, 1e-7);
            }, 1e3));
      }
      g = !1;
    }
    try {
      n = new IntersectionObserver(b, { ...w, root: o.ownerDocument });
    } catch {
      n = new IntersectionObserver(b, w);
    }
    n.observe(e);
  }
  return i(!0), s;
}
function Ck(e, t, n, r) {
  r === void 0 && (r = {});
  const {
      ancestorScroll: o = !0,
      ancestorResize: s = !0,
      elementResize: i = typeof ResizeObserver == "function",
      layoutShift: l = typeof IntersectionObserver == "function",
      animationFrame: a = !1,
    } = r,
    c = Df(e),
    u = o || s ? [...(c ? Us(c) : []), ...Us(t)] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n, { passive: !0 }),
      s && v.addEventListener("resize", n);
  });
  const d = c && l ? bk(c, n) : null;
  let f = -1,
    m = null;
  i &&
    ((m = new ResizeObserver((v) => {
      let [w] = v;
      w &&
        w.target === c &&
        m &&
        (m.unobserve(t),
        cancelAnimationFrame(f),
        (f = requestAnimationFrame(() => {
          var g;
          (g = m) == null || g.observe(t);
        }))),
        n();
    })),
    c && !a && m.observe(c),
    m.observe(t));
  let p,
    h = a ? Fr(e) : null;
  a && S();
  function S() {
    const v = Fr(e);
    h &&
      (v.x !== h.x ||
        v.y !== h.y ||
        v.width !== h.width ||
        v.height !== h.height) &&
      n(),
      (h = v),
      (p = requestAnimationFrame(S));
  }
  return (
    n(),
    () => {
      var v;
      u.forEach((w) => {
        o && w.removeEventListener("scroll", n),
          s && w.removeEventListener("resize", n);
      }),
        d == null || d(),
        (v = m) == null || v.disconnect(),
        (m = null),
        a && cancelAnimationFrame(p);
    }
  );
}
const Ek = rk,
  kk = ok,
  lh = ZE,
  _k = ik,
  ah = JE,
  ch = tk,
  uh = sk,
  Rk = (e, t, n) => {
    const r = new Map(),
      o = { platform: Sk, ...n },
      s = { ...o.platform, _c: r };
    return QE(e, t, { ...o, platform: s });
  },
  Dk = (e) => {
    function t(n) {
      return {}.hasOwnProperty.call(n, "current");
    }
    return {
      name: "arrow",
      options: e,
      fn(n) {
        const { element: r, padding: o } = typeof e == "function" ? e(n) : e;
        return r && t(r)
          ? r.current != null
            ? ah({ element: r.current, padding: o }).fn(n)
            : {}
          : r
          ? ah({ element: r, padding: o }).fn(n)
          : {};
      },
    };
  };
var tl = typeof document < "u" ? y.useLayoutEffect : y.useEffect;
function jl(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == "function" && e.toString() === t.toString()) return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (r = n; r-- !== 0; ) if (!jl(e[r], t[r])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1;
    for (r = n; r-- !== 0; ) {
      const s = o[r];
      if (!(s === "_owner" && e.$$typeof) && !jl(e[s], t[s])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function x0(e) {
  return typeof window > "u"
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function dh(e, t) {
  const n = x0(e);
  return Math.round(t * n) / n;
}
function fh(e) {
  const t = y.useRef(e);
  return (
    tl(() => {
      t.current = e;
    }),
    t
  );
}
function Pk(e) {
  e === void 0 && (e = {});
  const {
      placement: t = "bottom",
      strategy: n = "absolute",
      middleware: r = [],
      platform: o,
      elements: { reference: s, floating: i } = {},
      transform: l = !0,
      whileElementsMounted: a,
      open: c,
    } = e,
    [u, d] = y.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [f, m] = y.useState(r);
  jl(f, r) || m(r);
  const [p, h] = y.useState(null),
    [S, v] = y.useState(null),
    w = y.useCallback((T) => {
      T !== E.current && ((E.current = T), h(T));
    }, []),
    g = y.useCallback((T) => {
      T !== _.current && ((_.current = T), v(T));
    }, []),
    b = s || p,
    C = i || S,
    E = y.useRef(null),
    _ = y.useRef(null),
    D = y.useRef(u),
    L = a != null,
    N = fh(a),
    M = fh(o),
    B = y.useCallback(() => {
      if (!E.current || !_.current) return;
      const T = { placement: t, strategy: n, middleware: f };
      M.current && (T.platform = M.current),
        Rk(E.current, _.current, T).then((R) => {
          const k = { ...R, isPositioned: !0 };
          V.current &&
            !jl(D.current, k) &&
            ((D.current = k),
            ti.flushSync(() => {
              d(k);
            }));
        });
    }, [f, t, n, M]);
  tl(() => {
    c === !1 &&
      D.current.isPositioned &&
      ((D.current.isPositioned = !1), d((T) => ({ ...T, isPositioned: !1 })));
  }, [c]);
  const V = y.useRef(!1);
  tl(
    () => (
      (V.current = !0),
      () => {
        V.current = !1;
      }
    ),
    []
  ),
    tl(() => {
      if ((b && (E.current = b), C && (_.current = C), b && C)) {
        if (N.current) return N.current(b, C, B);
        B();
      }
    }, [b, C, B, N, L]);
  const A = y.useMemo(
      () => ({ reference: E, floating: _, setReference: w, setFloating: g }),
      [w, g]
    ),
    j = y.useMemo(() => ({ reference: b, floating: C }), [b, C]),
    P = y.useMemo(() => {
      const T = { position: n, left: 0, top: 0 };
      if (!j.floating) return T;
      const R = dh(j.floating, u.x),
        k = dh(j.floating, u.y);
      return l
        ? {
            ...T,
            transform: "translate(" + R + "px, " + k + "px)",
            ...(x0(j.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: R, top: k };
    }, [n, l, j.floating, u.x, u.y]);
  return y.useMemo(
    () => ({ ...u, update: B, refs: A, elements: j, floatingStyles: P }),
    [u, B, A, j, P]
  );
}
const S0 = { ...Sg },
  Tk = S0.useInsertionEffect,
  Nk = Tk || ((e) => e());
function Ok(e) {
  const t = y.useRef(() => {});
  return (
    Nk(() => {
      t.current = e;
    }),
    y.useCallback(function () {
      for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
        r[o] = arguments[o];
      return t.current == null ? void 0 : t.current(...r);
    }, [])
  );
}
var Hu = typeof document < "u" ? y.useLayoutEffect : y.useEffect;
let ph = !1,
  jk = 0;
const mh = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + jk++;
function $k() {
  const [e, t] = y.useState(() => (ph ? mh() : void 0));
  return (
    Hu(() => {
      e == null && t(mh());
    }, []),
    y.useEffect(() => {
      ph = !0;
    }, []),
    e
  );
}
const Lk = S0.useId,
  Ak = Lk || $k;
function Fk() {
  const e = new Map();
  return {
    emit(t, n) {
      var r;
      (r = e.get(t)) == null || r.forEach((o) => o(n));
    },
    on(t, n) {
      e.set(t, [...(e.get(t) || []), n]);
    },
    off(t, n) {
      var r;
      e.set(
        t,
        ((r = e.get(t)) == null ? void 0 : r.filter((o) => o !== n)) || []
      );
    },
  };
}
const Mk = y.createContext(null),
  Ik = y.createContext(null),
  zk = () => {
    var e;
    return ((e = y.useContext(Mk)) == null ? void 0 : e.id) || null;
  },
  Bk = () => y.useContext(Ik);
function Vk(e) {
  const { open: t = !1, onOpenChange: n, elements: r } = e,
    o = Ak(),
    s = y.useRef({}),
    [i] = y.useState(() => Fk()),
    l = zk() != null,
    [a, c] = y.useState(r.reference),
    u = Ok((m, p, h) => {
      (s.current.openEvent = m ? p : void 0),
        i.emit("openchange", { open: m, event: p, reason: h, nested: l }),
        n == null || n(m, p, h);
    }),
    d = y.useMemo(() => ({ setPositionReference: c }), []),
    f = y.useMemo(
      () => ({
        reference: a || r.reference || null,
        floating: r.floating || null,
        domReference: r.reference,
      }),
      [a, r.reference, r.floating]
    );
  return y.useMemo(
    () => ({
      dataRef: s,
      open: t,
      onOpenChange: u,
      elements: f,
      events: i,
      floatingId: o,
      refs: d,
    }),
    [t, u, f, i, o, d]
  );
}
function Hk(e) {
  e === void 0 && (e = {});
  const { nodeId: t } = e,
    n = Vk({
      ...e,
      elements: { reference: null, floating: null, ...e.elements },
    }),
    r = e.rootContext || n,
    o = r.elements,
    [s, i] = y.useState(null),
    [l, a] = y.useState(null),
    u = (o == null ? void 0 : o.reference) || s,
    d = y.useRef(null),
    f = Bk();
  Hu(() => {
    u && (d.current = u);
  }, [u]);
  const m = Pk({ ...e, elements: { ...o, ...(l && { reference: l }) } }),
    p = y.useCallback(
      (g) => {
        const b = pt(g)
          ? {
              getBoundingClientRect: () => g.getBoundingClientRect(),
              contextElement: g,
            }
          : g;
        a(b), m.refs.setReference(b);
      },
      [m.refs]
    ),
    h = y.useCallback(
      (g) => {
        (pt(g) || g === null) && ((d.current = g), i(g)),
          (pt(m.refs.reference.current) ||
            m.refs.reference.current === null ||
            (g !== null && !pt(g))) &&
            m.refs.setReference(g);
      },
      [m.refs]
    ),
    S = y.useMemo(
      () => ({
        ...m.refs,
        setReference: h,
        setPositionReference: p,
        domReference: d,
      }),
      [m.refs, h, p]
    ),
    v = y.useMemo(() => ({ ...m.elements, domReference: u }), [m.elements, u]),
    w = y.useMemo(
      () => ({ ...m, ...r, refs: S, elements: v, nodeId: t }),
      [m, S, v, t, r]
    );
  return (
    Hu(() => {
      r.dataRef.current.floatingContext = w;
      const g = f == null ? void 0 : f.nodesRef.current.find((b) => b.id === t);
      g && (g.context = w);
    }),
    y.useMemo(() => ({ ...m, context: w, refs: S, elements: v }), [m, S, v, w])
  );
}
function Uk(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, r] = t.split("-"),
      o = n === "right" ? "left" : "right";
    return r === void 0 ? o : `${o}-${r}`;
  }
  return t;
}
function hh(e, t, n, r) {
  return e === "center" || r === "center"
    ? { top: t }
    : e === "end"
    ? { bottom: n }
    : e === "start"
    ? { top: n }
    : {};
}
function gh(e, t, n, r, o) {
  return e === "center" || r === "center"
    ? { left: t }
    : e === "end"
    ? { [o === "ltr" ? "right" : "left"]: n }
    : e === "start"
    ? { [o === "ltr" ? "left" : "right"]: n }
    : {};
}
const Wk = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius",
};
function Yk({
  position: e,
  arrowSize: t,
  arrowOffset: n,
  arrowRadius: r,
  arrowPosition: o,
  arrowX: s,
  arrowY: i,
  dir: l,
}) {
  const [a, c = "center"] = e.split("-"),
    u = {
      width: z(t),
      height: z(t),
      transform: "rotate(45deg)",
      position: "absolute",
      [Wk[a]]: z(r),
    },
    d = z(-t / 2);
  return a === "left"
    ? {
        ...u,
        ...hh(c, i, n, o),
        right: d,
        borderLeftColor: "transparent",
        borderBottomColor: "transparent",
      }
    : a === "right"
    ? {
        ...u,
        ...hh(c, i, n, o),
        left: d,
        borderRightColor: "transparent",
        borderTopColor: "transparent",
      }
    : a === "top"
    ? {
        ...u,
        ...gh(c, s, n, o, l),
        bottom: d,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
      }
    : a === "bottom"
    ? {
        ...u,
        ...gh(c, s, n, o, l),
        top: d,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
      }
    : {};
}
const b0 = y.forwardRef(
  (
    {
      position: e,
      arrowSize: t,
      arrowOffset: n,
      arrowRadius: r,
      arrowPosition: o,
      visible: s,
      arrowX: i,
      arrowY: l,
      style: a,
      ...c
    },
    u
  ) => {
    const { dir: d } = hf();
    return s
      ? x.jsx("div", {
          ...c,
          ref: u,
          style: {
            ...a,
            ...Yk({
              position: e,
              arrowSize: t,
              arrowOffset: n,
              arrowRadius: r,
              arrowPosition: o,
              dir: d,
              arrowX: i,
              arrowY: l,
            }),
          },
        })
      : null;
  }
);
b0.displayName = "@mantine/core/FloatingArrow";
const [Kk, C0] = pr("Popover component was not found in the tree");
function pa({ children: e, active: t = !0, refProp: n = "ref" }) {
  const r = rC(t),
    o = Dt(r, e == null ? void 0 : e.ref);
  return Hr(e) ? y.cloneElement(e, { [n]: o }) : e;
}
function E0(e) {
  return x.jsx(wf, { tabIndex: -1, "data-autofocus": !0, ...e });
}
pa.displayName = "@mantine/core/FocusTrap";
E0.displayName = "@mantine/core/FocusTrapInitialFocus";
pa.InitialFocus = E0;
function qk(e) {
  const t = document.createElement("div");
  return (
    t.setAttribute("data-portal", "true"),
    typeof e.className == "string" &&
      t.classList.add(...e.className.split(" ").filter(Boolean)),
    typeof e.style == "object" && Object.assign(t.style, e.style),
    typeof e.id == "string" && t.setAttribute("id", e.id),
    t
  );
}
const Gk = {},
  k0 = y.forwardRef((e, t) => {
    const { children: n, target: r, ...o } = U("Portal", Gk, e),
      [s, i] = y.useState(!1),
      l = y.useRef(null);
    return (
      ni(
        () => (
          i(!0),
          (l.current = r
            ? typeof r == "string"
              ? document.querySelector(r)
              : r
            : qk(o)),
          cf(t, l.current),
          !r && l.current && document.body.appendChild(l.current),
          () => {
            !r && l.current && document.body.removeChild(l.current);
          }
        ),
        [r]
      ),
      !s || !l.current
        ? null
        : ti.createPortal(x.jsx(x.Fragment, { children: n }), l.current)
    );
  });
k0.displayName = "@mantine/core/Portal";
function ma({ withinPortal: e = !0, children: t, ...n }) {
  return e
    ? x.jsx(k0, { ...n, children: t })
    : x.jsx(x.Fragment, { children: t });
}
ma.displayName = "@mantine/core/OptionalPortal";
const cs = (e) => ({
    in: { opacity: 1, transform: "scale(1)" },
    out: {
      opacity: 0,
      transform: `scale(.9) translateY(${z(e === "bottom" ? 10 : -10)})`,
    },
    transitionProperty: "transform, opacity",
  }),
  Ai = {
    fade: {
      in: { opacity: 1 },
      out: { opacity: 0 },
      transitionProperty: "opacity",
    },
    "fade-up": {
      in: { opacity: 1, transform: "translateY(0)" },
      out: { opacity: 0, transform: `translateY(${z(30)}` },
      transitionProperty: "opacity, transform",
    },
    "fade-down": {
      in: { opacity: 1, transform: "translateY(0)" },
      out: { opacity: 0, transform: `translateY(${z(-30)}` },
      transitionProperty: "opacity, transform",
    },
    "fade-left": {
      in: { opacity: 1, transform: "translateX(0)" },
      out: { opacity: 0, transform: `translateX(${z(30)}` },
      transitionProperty: "opacity, transform",
    },
    "fade-right": {
      in: { opacity: 1, transform: "translateX(0)" },
      out: { opacity: 0, transform: `translateX(${z(-30)}` },
      transitionProperty: "opacity, transform",
    },
    scale: {
      in: { opacity: 1, transform: "scale(1)" },
      out: { opacity: 0, transform: "scale(0)" },
      common: { transformOrigin: "top" },
      transitionProperty: "transform, opacity",
    },
    "scale-y": {
      in: { opacity: 1, transform: "scaleY(1)" },
      out: { opacity: 0, transform: "scaleY(0)" },
      common: { transformOrigin: "top" },
      transitionProperty: "transform, opacity",
    },
    "scale-x": {
      in: { opacity: 1, transform: "scaleX(1)" },
      out: { opacity: 0, transform: "scaleX(0)" },
      common: { transformOrigin: "left" },
      transitionProperty: "transform, opacity",
    },
    "skew-up": {
      in: { opacity: 1, transform: "translateY(0) skew(0deg, 0deg)" },
      out: {
        opacity: 0,
        transform: `translateY(${z(-20)}) skew(-10deg, -5deg)`,
      },
      common: { transformOrigin: "top" },
      transitionProperty: "transform, opacity",
    },
    "skew-down": {
      in: { opacity: 1, transform: "translateY(0) skew(0deg, 0deg)" },
      out: {
        opacity: 0,
        transform: `translateY(${z(20)}) skew(-10deg, -5deg)`,
      },
      common: { transformOrigin: "bottom" },
      transitionProperty: "transform, opacity",
    },
    "rotate-left": {
      in: { opacity: 1, transform: "translateY(0) rotate(0deg)" },
      out: { opacity: 0, transform: `translateY(${z(20)}) rotate(-5deg)` },
      common: { transformOrigin: "bottom" },
      transitionProperty: "transform, opacity",
    },
    "rotate-right": {
      in: { opacity: 1, transform: "translateY(0) rotate(0deg)" },
      out: { opacity: 0, transform: `translateY(${z(20)}) rotate(5deg)` },
      common: { transformOrigin: "top" },
      transitionProperty: "transform, opacity",
    },
    "slide-down": {
      in: { opacity: 1, transform: "translateY(0)" },
      out: { opacity: 0, transform: "translateY(-100%)" },
      common: { transformOrigin: "top" },
      transitionProperty: "transform, opacity",
    },
    "slide-up": {
      in: { opacity: 1, transform: "translateY(0)" },
      out: { opacity: 0, transform: "translateY(100%)" },
      common: { transformOrigin: "bottom" },
      transitionProperty: "transform, opacity",
    },
    "slide-left": {
      in: { opacity: 1, transform: "translateX(0)" },
      out: { opacity: 0, transform: "translateX(100%)" },
      common: { transformOrigin: "left" },
      transitionProperty: "transform, opacity",
    },
    "slide-right": {
      in: { opacity: 1, transform: "translateX(0)" },
      out: { opacity: 0, transform: "translateX(-100%)" },
      common: { transformOrigin: "right" },
      transitionProperty: "transform, opacity",
    },
    pop: { ...cs("bottom"), common: { transformOrigin: "center center" } },
    "pop-bottom-left": {
      ...cs("bottom"),
      common: { transformOrigin: "bottom left" },
    },
    "pop-bottom-right": {
      ...cs("bottom"),
      common: { transformOrigin: "bottom right" },
    },
    "pop-top-left": { ...cs("top"), common: { transformOrigin: "top left" } },
    "pop-top-right": { ...cs("top"), common: { transformOrigin: "top right" } },
  },
  yh = {
    entering: "in",
    entered: "in",
    exiting: "out",
    exited: "out",
    "pre-exiting": "out",
    "pre-entering": "out",
  };
function Xk({ transition: e, state: t, duration: n, timingFunction: r }) {
  const o = { transitionDuration: `${n}ms`, transitionTimingFunction: r };
  return typeof e == "string"
    ? e in Ai
      ? {
          transitionProperty: Ai[e].transitionProperty,
          ...o,
          ...Ai[e].common,
          ...Ai[e][yh[t]],
        }
      : {}
    : {
        transitionProperty: e.transitionProperty,
        ...o,
        ...e.common,
        ...e[yh[t]],
      };
}
function Qk({
  duration: e,
  exitDuration: t,
  timingFunction: n,
  mounted: r,
  onEnter: o,
  onExit: s,
  onEntered: i,
  onExited: l,
}) {
  const a = bn(),
    c = uf(),
    u = a.respectReducedMotion ? c : !1,
    [d, f] = y.useState(u ? 0 : e),
    [m, p] = y.useState(r ? "entered" : "exited"),
    h = y.useRef(-1),
    S = y.useRef(-1),
    v = (w) => {
      const g = w ? o : s,
        b = w ? i : l;
      window.clearTimeout(h.current);
      const C = u ? 0 : w ? e : t;
      f(C),
        C === 0
          ? (typeof g == "function" && g(),
            typeof b == "function" && b(),
            p(w ? "entered" : "exited"))
          : (S.current = requestAnimationFrame(() => {
              nb.flushSync(() => {
                p(w ? "pre-entering" : "pre-exiting");
              }),
                (S.current = requestAnimationFrame(() => {
                  typeof g == "function" && g(),
                    p(w ? "entering" : "exiting"),
                    (h.current = window.setTimeout(() => {
                      typeof b == "function" && b(),
                        p(w ? "entered" : "exited");
                    }, C));
                }));
            }));
    };
  return (
    Ar(() => {
      v(r);
    }, [r]),
    y.useEffect(
      () => () => {
        window.clearTimeout(h.current), cancelAnimationFrame(S.current);
      },
      []
    ),
    {
      transitionDuration: d,
      transitionStatus: m,
      transitionTimingFunction: n || "ease",
    }
  );
}
function Uo({
  keepMounted: e,
  transition: t = "fade",
  duration: n = 250,
  exitDuration: r = n,
  mounted: o,
  children: s,
  timingFunction: i = "ease",
  onExit: l,
  onEntered: a,
  onEnter: c,
  onExited: u,
}) {
  const {
    transitionDuration: d,
    transitionStatus: f,
    transitionTimingFunction: m,
  } = Qk({
    mounted: o,
    exitDuration: r,
    duration: n,
    timingFunction: i,
    onExit: l,
    onEntered: a,
    onEnter: c,
    onExited: u,
  });
  return d === 0
    ? o
      ? x.jsx(x.Fragment, { children: s({}) })
      : e
      ? s({ display: "none" })
      : null
    : f === "exited"
    ? e
      ? s({ display: "none" })
      : null
    : x.jsx(x.Fragment, {
        children: s(
          Xk({ transition: t, duration: d, state: f, timingFunction: m })
        ),
      });
}
Uo.displayName = "@mantine/core/Transition";
var _0 = { dropdown: "m_38a85659", arrow: "m_a31dc6c1" };
const Jk = {},
  Tf = X((e, t) => {
    var S, v, w, g;
    const n = U("PopoverDropdown", Jk, e),
      {
        className: r,
        style: o,
        vars: s,
        children: i,
        onKeyDownCapture: l,
        variant: a,
        classNames: c,
        styles: u,
        ...d
      } = n,
      f = C0(),
      m = Lv({ opened: f.opened, shouldReturnFocus: f.returnFocus }),
      p = f.withRoles
        ? {
            "aria-labelledby": f.getTargetId(),
            id: f.getDropdownId(),
            role: "dialog",
            tabIndex: -1,
          }
        : {},
      h = Dt(t, f.floating);
    return f.disabled
      ? null
      : x.jsx(ma, {
          ...f.portalProps,
          withinPortal: f.withinPortal,
          children: x.jsx(Uo, {
            mounted: f.opened,
            ...f.transitionProps,
            transition:
              ((S = f.transitionProps) == null ? void 0 : S.transition) ||
              "fade",
            duration:
              ((v = f.transitionProps) == null ? void 0 : v.duration) ?? 150,
            keepMounted: f.keepMounted,
            exitDuration:
              typeof ((w = f.transitionProps) == null
                ? void 0
                : w.exitDuration) == "number"
                ? f.transitionProps.exitDuration
                : (g = f.transitionProps) == null
                ? void 0
                : g.duration,
            children: (b) =>
              x.jsx(pa, {
                active: f.trapFocus,
                children: x.jsxs(G, {
                  ...p,
                  ...d,
                  variant: a,
                  ref: h,
                  onKeyDownCapture: Ub(f.onClose, {
                    active: f.closeOnEscape,
                    onTrigger: m,
                    onKeyDown: l,
                  }),
                  "data-position": f.placement,
                  ...f.getStyles("dropdown", {
                    className: r,
                    props: n,
                    classNames: c,
                    styles: u,
                    style: [
                      {
                        ...b,
                        zIndex: f.zIndex,
                        top: f.y ?? 0,
                        left: f.x ?? 0,
                        width: f.width === "target" ? void 0 : z(f.width),
                      },
                      o,
                    ],
                  }),
                  children: [
                    i,
                    x.jsx(b0, {
                      ref: f.arrowRef,
                      arrowX: f.arrowX,
                      arrowY: f.arrowY,
                      visible: f.withArrow,
                      position: f.placement,
                      arrowSize: f.arrowSize,
                      arrowRadius: f.arrowRadius,
                      arrowOffset: f.arrowOffset,
                      arrowPosition: f.arrowPosition,
                      ...f.getStyles("arrow", {
                        props: n,
                        classNames: c,
                        styles: u,
                      }),
                    }),
                  ],
                }),
              }),
          }),
        });
  });
Tf.classes = _0;
Tf.displayName = "@mantine/core/PopoverDropdown";
const Zk = { refProp: "ref", popupType: "dialog" },
  R0 = X((e, t) => {
    const {
      children: n,
      refProp: r,
      popupType: o,
      ...s
    } = U("PopoverTarget", Zk, e);
    if (!Hr(n))
      throw new Error(
        "Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = s,
      l = C0(),
      a = Dt(l.reference, n.ref, t),
      c = l.withRoles
        ? {
            "aria-haspopup": o,
            "aria-expanded": l.opened,
            "aria-controls": l.getDropdownId(),
            id: l.getTargetId(),
          }
        : {};
    return y.cloneElement(n, {
      ...i,
      ...c,
      ...l.targetProps,
      className: at(l.targetProps.className, i.className, n.props.className),
      [r]: a,
      ...(l.controlled ? null : { onClick: l.onToggle }),
    });
  });
R0.displayName = "@mantine/core/PopoverTarget";
function e_({ opened: e, floating: t, position: n, positionDependencies: r }) {
  const [o, s] = y.useState(0);
  y.useEffect(() => {
    if (t.refs.reference.current && t.refs.floating.current)
      return Ck(t.refs.reference.current, t.refs.floating.current, t.update);
  }, [t.refs.reference.current, t.refs.floating.current, e, o, n]),
    Ar(() => {
      t.update();
    }, r),
    Ar(() => {
      s((i) => i + 1);
    }, [e]);
}
function t_(e) {
  if (e === void 0) return { shift: !0, flip: !0 };
  const t = { ...e };
  return (
    e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t
  );
}
function n_(e, t) {
  const n = t_(e.middlewares),
    r = [Ek(e.offset)];
  return (
    n.shift &&
      r.push(
        kk(
          typeof n.shift == "boolean"
            ? { limiter: uh(), padding: 5 }
            : { limiter: uh(), padding: 5, ...n.shift }
        )
      ),
    n.flip && r.push(typeof n.flip == "boolean" ? lh() : lh(n.flip)),
    n.inline && r.push(typeof n.inline == "boolean" ? ch() : ch(n.inline)),
    r.push(Dk({ element: e.arrowRef, padding: e.arrowOffset })),
    (n.size || e.width === "target") &&
      r.push(
        _k({
          ...(typeof n.size == "boolean" ? {} : n.size),
          apply({ rects: o, availableWidth: s, availableHeight: i }) {
            var c;
            const a =
              ((c = t().refs.floating.current) == null ? void 0 : c.style) ??
              {};
            n.size &&
              Object.assign(a, { maxWidth: `${s}px`, maxHeight: `${i}px` }),
              e.width === "target" &&
                Object.assign(a, { width: `${o.reference.width}px` });
          },
        })
      ),
    r
  );
}
function r_(e) {
  const [t, n] = $n({
      value: e.opened,
      defaultValue: e.defaultOpened,
      finalValue: !1,
      onChange: e.onChange,
    }),
    r = () => {
      var i;
      t && ((i = e.onClose) == null || i.call(e), n(!1));
    },
    o = () => {
      var i, l;
      t
        ? ((i = e.onClose) == null || i.call(e), n(!1))
        : ((l = e.onOpen) == null || l.call(e), n(!0));
    },
    s = Hk({
      strategy: e.strategy,
      placement: e.position,
      middleware: n_(e, () => s),
    });
  return (
    e_({
      opened: e.opened,
      position: e.position,
      positionDependencies: e.positionDependencies || [],
      floating: s,
    }),
    Ar(() => {
      var i;
      (i = e.onPositionChange) == null || i.call(e, s.placement);
    }, [s.placement]),
    Ar(() => {
      var i, l;
      e.opened
        ? (l = e.onOpen) == null || l.call(e)
        : (i = e.onClose) == null || i.call(e);
    }, [e.opened]),
    {
      floating: s,
      controlled: typeof e.opened == "boolean",
      opened: t,
      onClose: r,
      onToggle: o,
    }
  );
}
const o_ = {
    position: "bottom",
    offset: 8,
    positionDependencies: [],
    transitionProps: { transition: "fade", duration: 150 },
    middlewares: { flip: !0, shift: !0, inline: !1 },
    arrowSize: 7,
    arrowOffset: 5,
    arrowRadius: 0,
    arrowPosition: "side",
    closeOnClickOutside: !0,
    withinPortal: !0,
    closeOnEscape: !0,
    trapFocus: !1,
    withRoles: !0,
    returnFocus: !1,
    clickOutsideEvents: ["mousedown", "touchstart"],
    zIndex: Ur("popover"),
    __staticSelector: "Popover",
    width: "max-content",
  },
  s_ = (e, { radius: t, shadow: n }) => ({
    dropdown: {
      "--popover-radius": t === void 0 ? void 0 : Sn(t),
      "--popover-shadow": af(n),
    },
  });
function rn(e) {
  var ye, rt, Te, Le, W, re;
  const t = U("Popover", o_, e),
    {
      children: n,
      position: r,
      offset: o,
      onPositionChange: s,
      positionDependencies: i,
      opened: l,
      transitionProps: a,
      width: c,
      middlewares: u,
      withArrow: d,
      arrowSize: f,
      arrowOffset: m,
      arrowRadius: p,
      arrowPosition: h,
      unstyled: S,
      classNames: v,
      styles: w,
      closeOnClickOutside: g,
      withinPortal: b,
      portalProps: C,
      closeOnEscape: E,
      clickOutsideEvents: _,
      trapFocus: D,
      onClose: L,
      onOpen: N,
      onChange: M,
      zIndex: B,
      radius: V,
      shadow: A,
      id: j,
      defaultOpened: P,
      __staticSelector: T,
      withRoles: R,
      disabled: k,
      returnFocus: $,
      variant: O,
      keepMounted: I,
      vars: K,
      floatingStrategy: J,
      ...ee
    } = t,
    ne = ue({
      name: T,
      props: t,
      classes: _0,
      classNames: v,
      styles: w,
      unstyled: S,
      rootSelector: "dropdown",
      vars: K,
      varsResolver: s_,
    }),
    te = y.useRef(null),
    [me, oe] = y.useState(null),
    [le, Z] = y.useState(null),
    { dir: ge } = hf(),
    ce = Wr(j),
    se = r_({
      middlewares: u,
      width: c,
      position: Uk(ge, r),
      offset: typeof o == "number" ? o + (d ? f / 2 : 0) : o,
      arrowRef: te,
      arrowOffset: m,
      onPositionChange: s,
      positionDependencies: i,
      opened: l,
      defaultOpened: P,
      onChange: M,
      onOpen: N,
      onClose: L,
      strategy: J,
    });
  Kb(() => g && se.onClose(), _, [me, le]);
  const je = y.useCallback(
      (ie) => {
        oe(ie), se.floating.refs.setReference(ie);
      },
      [se.floating.refs.setReference]
    ),
    Ie = y.useCallback(
      (ie) => {
        Z(ie), se.floating.refs.setFloating(ie);
      },
      [se.floating.refs.setFloating]
    );
  return x.jsx(Kk, {
    value: {
      returnFocus: $,
      disabled: k,
      controlled: se.controlled,
      reference: je,
      floating: Ie,
      x: se.floating.x,
      y: se.floating.y,
      arrowX:
        (Te =
          (rt = (ye = se.floating) == null ? void 0 : ye.middlewareData) == null
            ? void 0
            : rt.arrow) == null
          ? void 0
          : Te.x,
      arrowY:
        (re =
          (W = (Le = se.floating) == null ? void 0 : Le.middlewareData) == null
            ? void 0
            : W.arrow) == null
          ? void 0
          : re.y,
      opened: se.opened,
      arrowRef: te,
      transitionProps: a,
      width: c,
      withArrow: d,
      arrowSize: f,
      arrowOffset: m,
      arrowRadius: p,
      arrowPosition: h,
      placement: se.floating.placement,
      trapFocus: D,
      withinPortal: b,
      portalProps: C,
      zIndex: B,
      radius: V,
      shadow: A,
      closeOnEscape: E,
      onClose: se.onClose,
      onToggle: se.onToggle,
      getTargetId: () => `${ce}-target`,
      getDropdownId: () => `${ce}-dropdown`,
      withRoles: R,
      targetProps: ee,
      __staticSelector: T,
      classNames: v,
      styles: w,
      unstyled: S,
      variant: O,
      keepMounted: I,
      getStyles: ne,
    },
    children: n,
  });
}
rn.Target = R0;
rn.Dropdown = Tf;
rn.displayName = "@mantine/core/Popover";
rn.extend = (e) => e;
var Gt = {
  root: "m_5ae2e3c",
  barsLoader: "m_7a2bd4cd",
  bar: "m_870bb79",
  "bars-loader-animation": "m_5d2b3b9d",
  dotsLoader: "m_4e3f22d7",
  dot: "m_870c4af",
  "loader-dots-animation": "m_aac34a1",
  ovalLoader: "m_b34414df",
  "oval-loader-animation": "m_f8e89c4b",
};
const i_ = y.forwardRef(({ className: e, ...t }, n) =>
    x.jsxs(G, {
      component: "span",
      className: at(Gt.barsLoader, e),
      ...t,
      ref: n,
      children: [
        x.jsx("span", { className: Gt.bar }),
        x.jsx("span", { className: Gt.bar }),
        x.jsx("span", { className: Gt.bar }),
      ],
    })
  ),
  l_ = y.forwardRef(({ className: e, ...t }, n) =>
    x.jsxs(G, {
      component: "span",
      className: at(Gt.dotsLoader, e),
      ...t,
      ref: n,
      children: [
        x.jsx("span", { className: Gt.dot }),
        x.jsx("span", { className: Gt.dot }),
        x.jsx("span", { className: Gt.dot }),
      ],
    })
  ),
  a_ = y.forwardRef(({ className: e, ...t }, n) =>
    x.jsx(G, {
      component: "span",
      className: at(Gt.ovalLoader, e),
      ...t,
      ref: n,
    })
  ),
  D0 = { bars: i_, oval: a_, dots: l_ },
  c_ = { loaders: D0, type: "oval" },
  u_ = (e, { size: t, color: n }) => ({
    root: {
      "--loader-size": Ee(t, "loader-size"),
      "--loader-color": n ? No(n, e) : void 0,
    },
  }),
  ii = X((e, t) => {
    const n = U("Loader", c_, e),
      {
        size: r,
        color: o,
        type: s,
        vars: i,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: d,
        loaders: f,
        variant: m,
        children: p,
        ...h
      } = n,
      S = ue({
        name: "Loader",
        props: n,
        classes: Gt,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: d,
        vars: i,
        varsResolver: u_,
      });
    return p
      ? x.jsx(G, { ...S("root"), ref: t, ...h, children: p })
      : x.jsx(G, {
          ...S("root"),
          ref: t,
          component: f[s],
          variant: m,
          size: r,
          ...h,
        });
  });
ii.defaultLoaders = D0;
ii.classes = Gt;
ii.displayName = "@mantine/core/Loader";
const P0 = y.forwardRef(
  ({ size: e = "var(--cb-icon-size, 70%)", style: t, ...n }, r) =>
    x.jsx("svg", {
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { ...t, width: e, height: e },
      ref: r,
      ...n,
      children: x.jsx("path", {
        d: "M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    })
);
P0.displayName = "@mantine/core/CloseIcon";
var T0 = { root: "m_86a44da5", "root--subtle": "m_220c80f2" };
const d_ = { variant: "subtle" },
  f_ = (e, { size: t, radius: n, iconSize: r }) => ({
    root: {
      "--cb-size": Ee(t, "cb-size"),
      "--cb-radius": n === void 0 ? void 0 : Sn(n),
      "--cb-icon-size": z(r),
    },
  }),
  Mr = Fn((e, t) => {
    const n = U("CloseButton", d_, e),
      {
        iconSize: r,
        children: o,
        vars: s,
        radius: i,
        className: l,
        classNames: a,
        style: c,
        styles: u,
        unstyled: d,
        "data-disabled": f,
        disabled: m,
        variant: p,
        icon: h,
        mod: S,
        ...v
      } = n,
      w = ue({
        name: "CloseButton",
        props: n,
        className: l,
        style: c,
        classes: T0,
        classNames: a,
        styles: u,
        unstyled: d,
        vars: s,
        varsResolver: f_,
      });
    return x.jsxs(Pn, {
      ref: t,
      ...v,
      unstyled: d,
      variant: p,
      disabled: m,
      mod: [{ disabled: m || f }, S],
      ...w("root", { variant: p, active: !m && !f }),
      children: [h || x.jsx(P0, {}), o],
    });
  });
Mr.classes = T0;
Mr.displayName = "@mantine/core/CloseButton";
function p_(e) {
  return y.Children.toArray(e).filter(Boolean);
}
var N0 = { root: "m_4081bf90" };
const m_ = {
    preventGrowOverflow: !0,
    gap: "md",
    align: "center",
    justify: "flex-start",
    wrap: "wrap",
  },
  h_ = (
    e,
    { grow: t, preventGrowOverflow: n, gap: r, align: o, justify: s, wrap: i },
    { childWidth: l }
  ) => ({
    root: {
      "--group-child-width": t && n ? l : void 0,
      "--group-gap": aa(r),
      "--group-align": o,
      "--group-justify": s,
      "--group-wrap": i,
    },
  }),
  qn = X((e, t) => {
    const n = U("Group", m_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        children: a,
        gap: c,
        align: u,
        justify: d,
        wrap: f,
        grow: m,
        preventGrowOverflow: p,
        vars: h,
        variant: S,
        __size: v,
        mod: w,
        ...g
      } = n,
      b = p_(a),
      C = b.length,
      E = aa(c ?? "md"),
      D = { childWidth: `calc(${100 / C}% - (${E} - ${E} / ${C}))` },
      L = ue({
        name: "Group",
        props: n,
        stylesCtx: D,
        className: o,
        style: s,
        classes: N0,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: h,
        varsResolver: h_,
      });
    return x.jsx(G, {
      ...L("root"),
      ref: t,
      variant: S,
      mod: [{ grow: m }, w],
      size: v,
      ...g,
      children: b,
    });
  });
qn.classes = N0;
qn.displayName = "@mantine/core/Group";
var O0 = { root: "m_9814e45f" };
const g_ = { zIndex: Ur("modal") },
  y_ = (
    e,
    {
      gradient: t,
      color: n,
      backgroundOpacity: r,
      blur: o,
      radius: s,
      zIndex: i,
    }
  ) => ({
    root: {
      "--overlay-bg":
        t ||
        ((n !== void 0 || r !== void 0) && pn(n || "#000", r ?? 0.6)) ||
        void 0,
      "--overlay-filter": o ? `blur(${z(o)})` : void 0,
      "--overlay-radius": s === void 0 ? void 0 : Sn(s),
      "--overlay-z-index": i == null ? void 0 : i.toString(),
    },
  }),
  Ws = Fn((e, t) => {
    const n = U("Overlay", g_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        fixed: c,
        center: u,
        children: d,
        radius: f,
        zIndex: m,
        gradient: p,
        blur: h,
        color: S,
        backgroundOpacity: v,
        mod: w,
        ...g
      } = n,
      b = ue({
        name: "Overlay",
        props: n,
        classes: O0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: y_,
      });
    return x.jsx(G, {
      ref: t,
      ...b("root"),
      mod: [{ center: u, fixed: c }, w],
      ...g,
      children: d,
    });
  });
Ws.classes = O0;
Ws.displayName = "@mantine/core/Overlay";
const [v_, In] = pr("ModalBase component was not found in tree");
function w_({ opened: e, transitionDuration: t }) {
  const [n, r] = y.useState(e),
    o = y.useRef(),
    i = uf() ? 0 : t;
  return (
    y.useEffect(
      () => (
        e
          ? (r(!0), window.clearTimeout(o.current))
          : i === 0
          ? r(!1)
          : (o.current = window.setTimeout(() => r(!1), i)),
        () => window.clearTimeout(o.current)
      ),
      [e, i]
    ),
    n
  );
}
function x_({
  id: e,
  transitionProps: t,
  opened: n,
  trapFocus: r,
  closeOnEscape: o,
  onClose: s,
  returnFocus: i,
}) {
  const l = Wr(e),
    [a, c] = y.useState(!1),
    [u, d] = y.useState(!1),
    f =
      typeof (t == null ? void 0 : t.duration) == "number"
        ? t == null
          ? void 0
          : t.duration
        : 200,
    m = w_({ opened: n, transitionDuration: f });
  return (
    iC(
      "keydown",
      (p) => {
        var h;
        p.key === "Escape" &&
          o &&
          n &&
          ((h = p.target) == null
            ? void 0
            : h.getAttribute("data-mantine-stop-propagation")) !== "true" &&
          s();
      },
      { capture: !0 }
    ),
    Lv({ opened: n, shouldReturnFocus: r && i }),
    {
      _id: l,
      titleMounted: a,
      bodyMounted: u,
      shouldLockScroll: m,
      setTitleMounted: c,
      setBodyMounted: d,
    }
  );
}
const S_ = y.forwardRef(
  (
    {
      keepMounted: e,
      opened: t,
      onClose: n,
      id: r,
      transitionProps: o,
      trapFocus: s,
      closeOnEscape: i,
      returnFocus: l,
      closeOnClickOutside: a,
      withinPortal: c,
      portalProps: u,
      lockScroll: d,
      children: f,
      zIndex: m,
      shadow: p,
      padding: h,
      __vars: S,
      unstyled: v,
      removeScrollProps: w,
      ...g
    },
    b
  ) => {
    const {
      _id: C,
      titleMounted: E,
      bodyMounted: _,
      shouldLockScroll: D,
      setTitleMounted: L,
      setBodyMounted: N,
    } = x_({
      id: r,
      transitionProps: o,
      opened: t,
      trapFocus: s,
      closeOnEscape: i,
      onClose: n,
      returnFocus: l,
    });
    return x.jsx(ma, {
      ...u,
      withinPortal: c,
      children: x.jsx(v_, {
        value: {
          opened: t,
          onClose: n,
          closeOnClickOutside: a,
          transitionProps: { ...o, keepMounted: e },
          getTitleId: () => `${C}-title`,
          getBodyId: () => `${C}-body`,
          titleMounted: E,
          bodyMounted: _,
          setTitleMounted: L,
          setBodyMounted: N,
          trapFocus: s,
          closeOnEscape: i,
          zIndex: m,
          unstyled: v,
        },
        children: x.jsx(Nv, {
          enabled: D && d,
          ...w,
          children: x.jsx(G, {
            ref: b,
            ...g,
            __vars: {
              ...S,
              "--mb-z-index": (m || Ur("modal")).toString(),
              "--mb-shadow": af(p),
              "--mb-padding": aa(h),
            },
            children: f,
          }),
        }),
      }),
    });
  }
);
function b_() {
  const e = In();
  return (
    y.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []),
    e.getBodyId()
  );
}
var Lo = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311",
};
const j0 = y.forwardRef(({ className: e, ...t }, n) => {
  const r = b_(),
    o = In();
  return x.jsx(G, {
    ref: n,
    ...t,
    id: r,
    className: at({ [Lo.body]: !o.unstyled }, e),
  });
});
j0.displayName = "@mantine/core/ModalBaseBody";
const $0 = y.forwardRef(({ className: e, onClick: t, ...n }, r) => {
  const o = In();
  return x.jsx(Mr, {
    ref: r,
    ...n,
    onClick: (s) => {
      o.onClose(), t == null || t(s);
    },
    className: at({ [Lo.close]: !o.unstyled }, e),
    unstyled: o.unstyled,
  });
});
$0.displayName = "@mantine/core/ModalBaseCloseButton";
const C_ = y.forwardRef(
    (
      {
        transitionProps: e,
        className: t,
        innerProps: n,
        onKeyDown: r,
        style: o,
        ...s
      },
      i
    ) => {
      const l = In();
      return x.jsx(Uo, {
        mounted: l.opened,
        transition: "pop",
        ...l.transitionProps,
        ...e,
        children: (a) =>
          x.jsx("div", {
            ...n,
            className: at({ [Lo.inner]: !l.unstyled }, n.className),
            children: x.jsx(pa, {
              active: l.opened && l.trapFocus,
              children: x.jsx(xf, {
                ...s,
                component: "section",
                role: "dialog",
                tabIndex: -1,
                "aria-modal": !0,
                "aria-describedby": l.bodyMounted ? l.getBodyId() : void 0,
                "aria-labelledby": l.titleMounted ? l.getTitleId() : void 0,
                ref: i,
                style: [o, a],
                className: at({ [Lo.content]: !l.unstyled }, t),
                unstyled: l.unstyled,
                children: s.children,
              }),
            }),
          }),
      });
    }
  ),
  L0 = y.forwardRef(({ className: e, ...t }, n) => {
    const r = In();
    return x.jsx(G, {
      component: "header",
      ref: n,
      className: at({ [Lo.header]: !r.unstyled }, e),
      ...t,
    });
  });
L0.displayName = "@mantine/core/ModalBaseHeader";
const E_ = { duration: 200, timingFunction: "ease", transition: "fade" };
function k_(e) {
  const t = In();
  return { ...E_, ...t.transitionProps, ...e };
}
const A0 = y.forwardRef(
  ({ onClick: e, transitionProps: t, style: n, ...r }, o) => {
    const s = In(),
      i = k_(t);
    return x.jsx(Uo, {
      mounted: s.opened,
      ...i,
      transition: "fade",
      children: (l) =>
        x.jsx(Ws, {
          ref: o,
          fixed: !0,
          style: [n, l],
          zIndex: s.zIndex,
          unstyled: s.unstyled,
          onClick: (a) => {
            e == null || e(a), s.closeOnClickOutside && s.onClose();
          },
          ...r,
        }),
    });
  }
);
A0.displayName = "@mantine/core/ModalBaseOverlay";
function __() {
  const e = In();
  return (
    y.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []),
    e.getTitleId()
  );
}
const F0 = y.forwardRef(({ className: e, ...t }, n) => {
  const r = __(),
    o = In();
  return x.jsx(G, {
    component: "h2",
    ref: n,
    className: at({ [Lo.title]: !o.unstyled }, e),
    ...t,
    id: r,
  });
});
F0.displayName = "@mantine/core/ModalBaseTitle";
function R_({ children: e }) {
  return x.jsx(x.Fragment, { children: e });
}
const [D_, Wo] = lf({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0,
});
var Bt = {
  wrapper: "m_6c018570",
  input: "m_8fb7ebe7",
  section: "m_82577fc2",
  placeholder: "m_88bacfd0",
  root: "m_46b77525",
  label: "m_8fdc1311",
  required: "m_78a94662",
  error: "m_8f816625",
  description: "m_fe47ce59",
};
const vh = {},
  P_ = (e, { size: t }) => ({
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${et(t)} - ${z(2)})`,
    },
  }),
  ha = X((e, t) => {
    const n = U("InputDescription", vh, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        __staticSelector: u,
        __inheritStyles: d = !0,
        variant: f,
        ...m
      } = U("InputDescription", vh, n),
      p = Wo(),
      h = ue({
        name: ["InputWrapper", u],
        props: n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "description",
        vars: a,
        varsResolver: P_,
      }),
      S = (d && (p == null ? void 0 : p.getStyles)) || h;
    return x.jsx(G, {
      component: "p",
      ref: t,
      variant: f,
      size: c,
      ...S(
        "description",
        p != null && p.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
ha.classes = Bt;
ha.displayName = "@mantine/core/InputDescription";
const T_ = {},
  N_ = (e, { size: t }) => ({
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${et(t)} - ${z(2)})`,
    },
  }),
  ga = X((e, t) => {
    const n = U("InputError", T_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        __staticSelector: u,
        __inheritStyles: d = !0,
        variant: f,
        ...m
      } = n,
      p = ue({
        name: ["InputWrapper", u],
        props: n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "error",
        vars: a,
        varsResolver: N_,
      }),
      h = Wo(),
      S = (d && (h == null ? void 0 : h.getStyles)) || p;
    return x.jsx(G, {
      component: "p",
      ref: t,
      variant: f,
      size: c,
      ...S(
        "error",
        h != null && h.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
ga.classes = Bt;
ga.displayName = "@mantine/core/InputError";
const wh = { labelElement: "label" },
  O_ = (e, { size: t }) => ({
    label: { "--input-label-size": et(t), "--input-asterisk-color": void 0 },
  }),
  ya = X((e, t) => {
    const n = U("InputLabel", wh, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        labelElement: c,
        size: u,
        required: d,
        htmlFor: f,
        onMouseDown: m,
        children: p,
        __staticSelector: h,
        variant: S,
        mod: v,
        ...w
      } = U("InputLabel", wh, n),
      g = ue({
        name: ["InputWrapper", h],
        props: n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "label",
        vars: a,
        varsResolver: O_,
      }),
      b = Wo(),
      C = (b == null ? void 0 : b.getStyles) || g;
    return x.jsxs(G, {
      ...C(
        "label",
        b != null && b.getStyles ? { className: o, style: s } : void 0
      ),
      component: c,
      variant: S,
      size: u,
      ref: t,
      htmlFor: c === "label" ? f : void 0,
      mod: [{ required: d }, v],
      onMouseDown: (E) => {
        m == null || m(E),
          !E.defaultPrevented && E.detail > 1 && E.preventDefault();
      },
      ...w,
      children: [
        p,
        d &&
          x.jsx("span", {
            ...C("required"),
            "aria-hidden": !0,
            children: " *",
          }),
      ],
    });
  });
ya.classes = Bt;
ya.displayName = "@mantine/core/InputLabel";
const xh = {},
  Nf = X((e, t) => {
    const n = U("InputPlaceholder", xh, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        variant: u,
        error: d,
        mod: f,
        ...m
      } = U("InputPlaceholder", xh, n),
      p = ue({
        name: ["InputPlaceholder", c],
        props: n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "placeholder",
      });
    return x.jsx(G, {
      ...p("placeholder"),
      mod: [{ error: !!d }, f],
      component: "span",
      variant: u,
      ref: t,
      ...m,
    });
  });
Nf.classes = Bt;
Nf.displayName = "@mantine/core/InputPlaceholder";
function j_(e, { hasDescription: t, hasError: n }) {
  const r = e.findIndex((a) => a === "input"),
    o = e[r - 1],
    s = e[r + 1];
  return {
    offsetBottom: (t && s === "description") || (n && s === "error"),
    offsetTop: (t && o === "description") || (n && o === "error"),
  };
}
const $_ = {
    labelElement: "label",
    inputContainer: (e) => e,
    inputWrapperOrder: ["label", "description", "input", "error"],
  },
  L_ = (e, { size: t }) => ({
    label: { "--input-label-size": et(t), "--input-asterisk-color": void 0 },
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${et(t)} - ${z(2)})`,
    },
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${et(t)} - ${z(2)})`,
    },
  }),
  Of = X((e, t) => {
    const n = U("InputWrapper", $_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        variant: u,
        __staticSelector: d,
        inputContainer: f,
        inputWrapperOrder: m,
        label: p,
        error: h,
        description: S,
        labelProps: v,
        descriptionProps: w,
        errorProps: g,
        labelElement: b,
        children: C,
        withAsterisk: E,
        id: _,
        required: D,
        __stylesApiProps: L,
        mod: N,
        ...M
      } = n,
      B = ue({
        name: ["InputWrapper", d],
        props: L || n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: L_,
      }),
      V = { size: c, variant: u, __staticSelector: d },
      A = Wr(_),
      j = typeof E == "boolean" ? E : D,
      P = (g == null ? void 0 : g.id) || `${A}-error`,
      T = (w == null ? void 0 : w.id) || `${A}-description`,
      R = A,
      k = !!h && typeof h != "boolean",
      $ = !!S,
      O = `${k ? P : ""} ${$ ? T : ""}`,
      I = O.trim().length > 0 ? O.trim() : void 0,
      K = (v == null ? void 0 : v.id) || `${A}-label`,
      J =
        p &&
        x.jsx(
          ya,
          {
            labelElement: b,
            id: K,
            htmlFor: R,
            required: j,
            ...V,
            ...v,
            children: p,
          },
          "label"
        ),
      ee =
        $ &&
        x.jsx(
          ha,
          {
            ...w,
            ...V,
            size: (w == null ? void 0 : w.size) || V.size,
            id: (w == null ? void 0 : w.id) || T,
            children: S,
          },
          "description"
        ),
      ne = x.jsx(y.Fragment, { children: f(C) }, "input"),
      te =
        k &&
        y.createElement(
          ga,
          {
            ...g,
            ...V,
            size: (g == null ? void 0 : g.size) || V.size,
            key: "error",
            id: (g == null ? void 0 : g.id) || P,
          },
          h
        ),
      me = m.map((oe) => {
        switch (oe) {
          case "label":
            return J;
          case "input":
            return ne;
          case "description":
            return ee;
          case "error":
            return te;
          default:
            return null;
        }
      });
    return x.jsx(D_, {
      value: {
        getStyles: B,
        describedBy: I,
        inputId: R,
        labelId: K,
        ...j_(m, { hasDescription: $, hasError: k }),
      },
      children: x.jsx(G, {
        ref: t,
        variant: u,
        size: c,
        mod: [{ error: !!h }, N],
        ...B("root"),
        ...M,
        children: me,
      }),
    });
  });
Of.classes = Bt;
Of.displayName = "@mantine/core/InputWrapper";
const A_ = {
    variant: "default",
    leftSectionPointerEvents: "none",
    rightSectionPointerEvents: "none",
    withAria: !0,
    withErrorStyles: !0,
  },
  F_ = (e, t, n) => ({
    wrapper: {
      "--input-margin-top": n.offsetTop
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-margin-bottom": n.offsetBottom
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-height": Ee(t.size, "input-height"),
      "--input-fz": et(t.size),
      "--input-radius": t.radius === void 0 ? void 0 : Sn(t.radius),
      "--input-left-section-width":
        t.leftSectionWidth !== void 0 ? z(t.leftSectionWidth) : void 0,
      "--input-right-section-width":
        t.rightSectionWidth !== void 0 ? z(t.rightSectionWidth) : void 0,
      "--input-padding-y": t.multiline ? Ee(t.size, "input-padding-y") : void 0,
      "--input-left-section-pointer-events": t.leftSectionPointerEvents,
      "--input-right-section-pointer-events": t.rightSectionPointerEvents,
    },
  }),
  nt = Fn((e, t) => {
    const n = U("Input", A_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        required: a,
        __staticSelector: c,
        __stylesApiProps: u,
        size: d,
        wrapperProps: f,
        error: m,
        disabled: p,
        leftSection: h,
        leftSectionProps: S,
        leftSectionWidth: v,
        rightSection: w,
        rightSectionProps: g,
        rightSectionWidth: b,
        rightSectionPointerEvents: C,
        leftSectionPointerEvents: E,
        variant: _,
        vars: D,
        pointer: L,
        multiline: N,
        radius: M,
        id: B,
        withAria: V,
        withErrorStyles: A,
        mod: j,
        ...P
      } = n,
      { styleProps: T, rest: R } = ri(P),
      k = Wo(),
      $ = {
        offsetBottom: k == null ? void 0 : k.offsetBottom,
        offsetTop: k == null ? void 0 : k.offsetTop,
      },
      O = ue({
        name: ["Input", c],
        props: u || n,
        classes: Bt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        stylesCtx: $,
        rootSelector: "wrapper",
        vars: D,
        varsResolver: F_,
      }),
      I = V
        ? {
            required: a,
            disabled: p,
            "aria-invalid": !!m,
            "aria-describedby": k == null ? void 0 : k.describedBy,
            id: (k == null ? void 0 : k.inputId) || B,
          }
        : {};
    return x.jsxs(G, {
      ...O("wrapper"),
      ...T,
      ...f,
      mod: [
        {
          error: !!m && A,
          pointer: L,
          disabled: p,
          multiline: N,
          "data-with-right-section": !!w,
          "data-with-left-section": !!h,
        },
        j,
      ],
      variant: _,
      size: d,
      children: [
        h &&
          x.jsx("div", {
            ...S,
            "data-position": "left",
            ...O("section", {
              className: S == null ? void 0 : S.className,
              style: S == null ? void 0 : S.style,
            }),
            children: h,
          }),
        x.jsx(G, {
          component: "input",
          ...R,
          ...I,
          ref: t,
          required: a,
          mod: { disabled: p, error: !!m && A },
          variant: _,
          ...O("input"),
        }),
        w &&
          x.jsx("div", {
            ...g,
            "data-position": "right",
            ...O("section", {
              className: g == null ? void 0 : g.className,
              style: g == null ? void 0 : g.style,
            }),
            children: w,
          }),
      ],
    });
  });
nt.classes = Bt;
nt.Wrapper = Of;
nt.Label = ya;
nt.Error = ga;
nt.Description = ha;
nt.Placeholder = Nf;
nt.displayName = "@mantine/core/Input";
function M_(e, t, n) {
  const r = U(e, t, n),
    {
      label: o,
      description: s,
      error: i,
      required: l,
      classNames: a,
      styles: c,
      className: u,
      unstyled: d,
      __staticSelector: f,
      __stylesApiProps: m,
      errorProps: p,
      labelProps: h,
      descriptionProps: S,
      wrapperProps: v,
      id: w,
      size: g,
      style: b,
      inputContainer: C,
      inputWrapperOrder: E,
      withAsterisk: _,
      variant: D,
      vars: L,
      mod: N,
      ...M
    } = r,
    { styleProps: B, rest: V } = ri(M),
    A = {
      label: o,
      description: s,
      error: i,
      required: l,
      classNames: a,
      className: u,
      __staticSelector: f,
      __stylesApiProps: m || r,
      errorProps: p,
      labelProps: h,
      descriptionProps: S,
      unstyled: d,
      styles: c,
      size: g,
      style: b,
      inputContainer: C,
      inputWrapperOrder: E,
      withAsterisk: _,
      variant: D,
      id: w,
      mod: N,
      ...v,
    };
  return {
    ...V,
    classNames: a,
    styles: c,
    unstyled: d,
    wrapperProps: { ...A, ...B },
    inputProps: {
      required: l,
      classNames: a,
      styles: c,
      unstyled: d,
      size: g,
      __staticSelector: f,
      __stylesApiProps: m || r,
      error: i,
      variant: D,
      id: w,
    },
  };
}
const I_ = { __staticSelector: "InputBase", withAria: !0 },
  Cn = Fn((e, t) => {
    const { inputProps: n, wrapperProps: r, ...o } = M_("InputBase", I_, e);
    return x.jsx(nt.Wrapper, {
      ...r,
      children: x.jsx(nt, { ...n, ...o, ref: t }),
    });
  });
Cn.classes = { ...nt.classes, ...nt.Wrapper.classes };
Cn.displayName = "@mantine/core/InputBase";
function Uu({ style: e, size: t = 16, ...n }) {
  return x.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { ...e, width: z(t), height: z(t), display: "block" },
    ...n,
    children: x.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
Uu.displayName = "@mantine/core/AccordionChevron";
var M0 = { root: "m_b6d8b162" };
function z_(e) {
  if (e === "start") return "start";
  if (e === "end" || e) return "end";
}
const B_ = { inherit: !1 },
  V_ = (e, { variant: t, lineClamp: n, gradient: r, size: o, color: s }) => ({
    root: {
      "--text-fz": et(o),
      "--text-lh": Wb(o),
      "--text-gradient": t === "gradient" ? Mu(r, e) : void 0,
      "--text-line-clamp": typeof n == "number" ? n.toString() : void 0,
      "--text-color": s ? No(s, e) : void 0,
    },
  }),
  kr = Fn((e, t) => {
    const n = U("Text", B_, e),
      {
        lineClamp: r,
        truncate: o,
        inline: s,
        inherit: i,
        gradient: l,
        span: a,
        __staticSelector: c,
        vars: u,
        className: d,
        style: f,
        classNames: m,
        styles: p,
        unstyled: h,
        variant: S,
        mod: v,
        size: w,
        ...g
      } = n,
      b = ue({
        name: ["Text", c],
        props: n,
        classes: M0,
        className: d,
        style: f,
        classNames: m,
        styles: p,
        unstyled: h,
        vars: u,
        varsResolver: V_,
      });
    return x.jsx(G, {
      ...b("root", { focusable: !0 }),
      ref: t,
      component: a ? "span" : "p",
      variant: S,
      mod: [
        {
          "data-truncate": z_(o),
          "data-line-clamp": typeof r == "number",
          "data-inline": s,
          "data-inherit": i,
        },
        v,
      ],
      size: w,
      ...g,
    });
  });
kr.classes = M0;
kr.displayName = "@mantine/core/Text";
function I0(e) {
  return typeof e == "string"
    ? { value: e, label: e }
    : "value" in e && !("label" in e)
    ? { value: e.value, label: e.value, disabled: e.disabled }
    : typeof e == "number"
    ? { value: e.toString(), label: e.toString() }
    : "group" in e
    ? { group: e.group, items: e.items.map((t) => I0(t)) }
    : e;
}
function z0(e) {
  return e ? e.map((t) => I0(t)) : [];
}
function jf(e) {
  return e.reduce(
    (t, n) => ("group" in n ? { ...t, ...jf(n.items) } : ((t[n.value] = n), t)),
    {}
  );
}
var wt = {
  dropdown: "m_88b62a41",
  options: "m_b2821a6e",
  option: "m_92253aa5",
  search: "m_985517d8",
  empty: "m_2530cd1d",
  header: "m_858f94bd",
  footer: "m_82b967cb",
  group: "m_254f3e4f",
  groupLabel: "m_2bb2e9e5",
  chevron: "m_2943220b",
  optionsDropdownOption: "m_390b5f4",
  optionsDropdownCheckIcon: "m_8ee53fc2",
};
const H_ = { error: null },
  U_ = (e, { size: t }) => ({
    chevron: { "--combobox-chevron-size": Ee(t, "combobox-chevron-size") },
  }),
  $f = X((e, t) => {
    const n = U("ComboboxChevron", H_, e),
      {
        size: r,
        error: o,
        style: s,
        className: i,
        classNames: l,
        styles: a,
        unstyled: c,
        vars: u,
        mod: d,
        ...f
      } = n,
      m = ue({
        name: "ComboboxChevron",
        classes: wt,
        props: n,
        style: s,
        className: i,
        classNames: l,
        styles: a,
        unstyled: c,
        vars: u,
        varsResolver: U_,
        rootSelector: "chevron",
      });
    return x.jsx(G, {
      component: "svg",
      ...f,
      ...m("chevron"),
      size: r,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      mod: ["combobox-chevron", { error: o }, d],
      ref: t,
      children: x.jsx("path", {
        d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    });
  });
$f.classes = wt;
$f.displayName = "@mantine/core/ComboboxChevron";
const [W_, Vt] = pr("Combobox component was not found in tree"),
  B0 = y.forwardRef(
    ({ size: e, onMouseDown: t, onClick: n, onClear: r, ...o }, s) =>
      x.jsx(Mr, {
        ref: s,
        size: e || "sm",
        variant: "transparent",
        tabIndex: -1,
        "aria-hidden": !0,
        ...o,
        onMouseDown: (i) => {
          i.preventDefault(), t == null || t(i);
        },
        onClick: (i) => {
          r(), n == null || n(i);
        },
      })
  );
B0.displayName = "@mantine/core/ComboboxClearButton";
const Y_ = {},
  Lf = X((e, t) => {
    const {
        classNames: n,
        styles: r,
        className: o,
        style: s,
        hidden: i,
        ...l
      } = U("ComboboxDropdown", Y_, e),
      a = Vt();
    return x.jsx(rn.Dropdown, {
      ...l,
      ref: t,
      role: "presentation",
      "data-hidden": i || void 0,
      ...a.getStyles("dropdown", {
        className: o,
        style: s,
        classNames: n,
        styles: r,
      }),
    });
  });
Lf.classes = wt;
Lf.displayName = "@mantine/core/ComboboxDropdown";
const K_ = { refProp: "ref" },
  V0 = X((e, t) => {
    const { children: n, refProp: r } = U("ComboboxDropdownTarget", K_, e);
    if ((Vt(), !Hr(n)))
      throw new Error(
        "Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    return x.jsx(rn.Target, { ref: t, refProp: r, children: n });
  });
V0.displayName = "@mantine/core/ComboboxDropdownTarget";
const q_ = {},
  Af = X((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = U("ComboboxEmpty", q_, e),
      a = Vt();
    return x.jsx(G, {
      ref: t,
      ...a.getStyles("empty", {
        className: r,
        classNames: n,
        styles: s,
        style: o,
      }),
      ...l,
    });
  });
Af.classes = wt;
Af.displayName = "@mantine/core/ComboboxEmpty";
function Ff({
  onKeyDown: e,
  withKeyboardNavigation: t,
  withAriaAttributes: n,
  withExpandedAttribute: r,
  targetType: o,
  autoComplete: s,
}) {
  const i = Vt(),
    [l, a] = y.useState(null),
    c = (d) => {
      if ((e == null || e(d), !i.readOnly && t)) {
        if (d.nativeEvent.isComposing) return;
        if (
          (d.nativeEvent.code === "ArrowDown" &&
            (d.preventDefault(),
            i.store.dropdownOpened
              ? a(i.store.selectNextOption())
              : (i.store.openDropdown("keyboard"),
                a(i.store.selectActiveOption()))),
          d.nativeEvent.code === "ArrowUp" &&
            (d.preventDefault(),
            i.store.dropdownOpened
              ? a(i.store.selectPreviousOption())
              : (i.store.openDropdown("keyboard"),
                a(i.store.selectActiveOption()))),
          d.nativeEvent.code === "Enter" ||
            d.nativeEvent.code === "NumpadEnter")
        ) {
          if (d.nativeEvent.keyCode === 229) return;
          const f = i.store.getSelectedOptionIndex();
          i.store.dropdownOpened && f !== -1
            ? (d.preventDefault(), i.store.clickSelectedOption())
            : o === "button" &&
              (d.preventDefault(), i.store.openDropdown("keyboard"));
        }
        d.nativeEvent.code === "Escape" && i.store.closeDropdown("keyboard"),
          d.nativeEvent.code === "Space" &&
            o === "button" &&
            (d.preventDefault(), i.store.toggleDropdown("keyboard"));
      }
    };
  return {
    ...(n
      ? {
          "aria-haspopup": "listbox",
          "aria-expanded":
            (r && !!(i.store.listId && i.store.dropdownOpened)) || void 0,
          "aria-controls": i.store.listId,
          "aria-activedescendant": (i.store.dropdownOpened && l) || void 0,
          autoComplete: s,
          "data-expanded": i.store.dropdownOpened || void 0,
          "data-mantine-stop-propagation": i.store.dropdownOpened || void 0,
        }
      : {}),
    onKeyDown: c,
  };
}
const G_ = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  H0 = X((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = U("ComboboxEventsTarget", G_, e);
    if (!Hr(n))
      throw new Error(
        "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Vt(),
      d = Ff({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      });
    return y.cloneElement(n, {
      ...d,
      ...c,
      [r]: Dt(t, u.store.targetRef, n == null ? void 0 : n.ref),
    });
  });
H0.displayName = "@mantine/core/ComboboxEventsTarget";
const X_ = {},
  Mf = X((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = U("ComboboxFooter", X_, e),
      a = Vt();
    return x.jsx(G, {
      ref: t,
      ...a.getStyles("footer", {
        className: r,
        classNames: n,
        style: o,
        styles: s,
      }),
      ...l,
    });
  });
Mf.classes = wt;
Mf.displayName = "@mantine/core/ComboboxFooter";
const Q_ = {},
  If = X((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        children: l,
        label: a,
        ...c
      } = U("ComboboxGroup", Q_, e),
      u = Vt();
    return x.jsxs(G, {
      ref: t,
      ...u.getStyles("group", {
        className: r,
        classNames: n,
        style: o,
        styles: s,
      }),
      ...c,
      children: [
        a &&
          x.jsx("div", {
            ...u.getStyles("groupLabel", { classNames: n, styles: s }),
            children: a,
          }),
        l,
      ],
    });
  });
If.classes = wt;
If.displayName = "@mantine/core/ComboboxGroup";
const J_ = {},
  zf = X((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = U("ComboboxHeader", J_, e),
      a = Vt();
    return x.jsx(G, {
      ref: t,
      ...a.getStyles("header", {
        className: r,
        classNames: n,
        style: o,
        styles: s,
      }),
      ...l,
    });
  });
zf.classes = wt;
zf.displayName = "@mantine/core/ComboboxHeader";
function U0({ value: e, valuesDivider: t = ",", ...n }) {
  return x.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e || "",
    ...n,
  });
}
U0.displayName = "@mantine/core/ComboboxHiddenInput";
const Z_ = {},
  Bf = X((e, t) => {
    const n = U("ComboboxOption", Z_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        vars: l,
        onClick: a,
        id: c,
        active: u,
        onMouseDown: d,
        onMouseOver: f,
        disabled: m,
        selected: p,
        mod: h,
        ...S
      } = n,
      v = Vt(),
      w = y.useId(),
      g = c || w;
    return x.jsx(G, {
      ...v.getStyles("option", {
        className: o,
        classNames: r,
        styles: i,
        style: s,
      }),
      ...S,
      ref: t,
      id: g,
      mod: [
        "combobox-option",
        {
          "combobox-active": u,
          "combobox-disabled": m,
          "combobox-selected": p,
        },
        h,
      ],
      role: "option",
      onClick: (b) => {
        var C;
        m
          ? b.preventDefault()
          : ((C = v.onOptionSubmit) == null || C.call(v, n.value, n),
            a == null || a(b));
      },
      onMouseDown: (b) => {
        b.preventDefault(), d == null || d(b);
      },
      onMouseOver: (b) => {
        v.resetSelectionOnOptionHover && v.store.resetSelectedOption(),
          f == null || f(b);
      },
    });
  });
Bf.classes = wt;
Bf.displayName = "@mantine/core/ComboboxOption";
const eR = {},
  Vf = X((e, t) => {
    const n = U("ComboboxOptions", eR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        id: l,
        onMouseDown: a,
        labelledBy: c,
        ...u
      } = n,
      d = Vt(),
      f = Wr(l);
    return (
      y.useEffect(() => {
        d.store.setListId(f);
      }, [f]),
      x.jsx(G, {
        ref: t,
        ...d.getStyles("options", {
          className: o,
          style: s,
          classNames: r,
          styles: i,
        }),
        ...u,
        id: f,
        role: "listbox",
        "aria-labelledby": c,
        onMouseDown: (m) => {
          m.preventDefault(), a == null || a(m);
        },
      })
    );
  });
Vf.classes = wt;
Vf.displayName = "@mantine/core/ComboboxOptions";
const tR = { withAriaAttributes: !0, withKeyboardNavigation: !0 },
  Hf = X((e, t) => {
    const n = U("ComboboxSearch", tR, e),
      {
        classNames: r,
        styles: o,
        unstyled: s,
        vars: i,
        withAriaAttributes: l,
        onKeyDown: a,
        withKeyboardNavigation: c,
        size: u,
        ...d
      } = n,
      f = Vt(),
      m = f.getStyles("search"),
      p = Ff({
        targetType: "input",
        withAriaAttributes: l,
        withKeyboardNavigation: c,
        withExpandedAttribute: !1,
        onKeyDown: a,
        autoComplete: "off",
      });
    return x.jsx(nt, {
      ref: Dt(t, f.store.searchRef),
      classNames: [{ input: m.className }, r],
      styles: [{ input: m.style }, o],
      size: u || f.size,
      ...p,
      ...d,
      __staticSelector: "Combobox",
    });
  });
Hf.classes = wt;
Hf.displayName = "@mantine/core/ComboboxSearch";
const nR = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  W0 = X((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = U("ComboboxTarget", nR, e);
    if (!Hr(n))
      throw new Error(
        "Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Vt(),
      d = Ff({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      }),
      f = y.cloneElement(n, { ...d, ...c });
    return x.jsx(rn.Target, { ref: Dt(t, u.store.targetRef), children: f });
  });
W0.displayName = "@mantine/core/ComboboxTarget";
function rR(e, t, n) {
  for (let r = e - 1; r >= 0; r -= 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = t.length - 1; r > -1; r -= 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function oR(e, t, n) {
  for (let r = e + 1; r < t.length; r += 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = 0; r < t.length; r += 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function sR(e) {
  for (let t = 0; t < e.length; t += 1)
    if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Uf({
  defaultOpened: e,
  opened: t,
  onOpenedChange: n,
  onDropdownClose: r,
  onDropdownOpen: o,
  loop: s = !0,
  scrollBehavior: i = "instant",
} = {}) {
  const [l, a] = $n({ value: t, defaultValue: e, finalValue: !1, onChange: n }),
    c = y.useRef(null),
    u = y.useRef(-1),
    d = y.useRef(null),
    f = y.useRef(null),
    m = y.useRef(-1),
    p = y.useRef(-1),
    h = y.useRef(-1),
    S = y.useCallback(
      (P = "unknown") => {
        l || (a(!0), o == null || o(P));
      },
      [a, o, l]
    ),
    v = y.useCallback(
      (P = "unknown") => {
        l && (a(!1), r == null || r(P));
      },
      [a, r, l]
    ),
    w = y.useCallback(
      (P = "unknown") => {
        l ? v(P) : S(P);
      },
      [v, S, l]
    ),
    g = y.useCallback(() => {
      const P = document.querySelector(
        `#${c.current} [data-combobox-selected]`
      );
      P == null || P.removeAttribute("data-combobox-selected"),
        P == null || P.removeAttribute("aria-selected");
    }, []),
    b = y.useCallback(
      (P) => {
        const T = document.getElementById(c.current),
          R = T == null ? void 0 : T.querySelectorAll("[data-combobox-option]");
        if (!R) return null;
        const k = P >= R.length ? 0 : P < 0 ? R.length - 1 : P;
        return (
          (u.current = k),
          R != null && R[k] && !R[k].hasAttribute("data-combobox-disabled")
            ? (g(),
              R[k].setAttribute("data-combobox-selected", "true"),
              R[k].setAttribute("aria-selected", "true"),
              R[k].scrollIntoView({ block: "nearest", behavior: i }),
              R[k].id)
            : null
        );
      },
      [i, g]
    ),
    C = y.useCallback(() => {
      const P = document.querySelector(`#${c.current} [data-combobox-active]`);
      if (P) {
        const T = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          R = Array.from(T).findIndex((k) => k === P);
        return b(R);
      }
      return b(0);
    }, [b]),
    E = y.useCallback(
      () =>
        b(
          oR(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    _ = y.useCallback(
      () =>
        b(
          rR(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    D = y.useCallback(
      () =>
        b(
          sR(document.querySelectorAll(`#${c.current} [data-combobox-option]`))
        ),
      [b]
    ),
    L = y.useCallback((P = "selected", T) => {
      h.current = window.setTimeout(() => {
        var $;
        const R = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          k = Array.from(R).findIndex((O) =>
            O.hasAttribute(`data-combobox-${P}`)
          );
        (u.current = k),
          T != null &&
            T.scrollIntoView &&
            (($ = R[k]) == null ||
              $.scrollIntoView({ block: "nearest", behavior: i }));
      }, 0);
    }, []),
    N = y.useCallback(() => {
      (u.current = -1), g();
    }, [g]),
    M = y.useCallback(() => {
      const P = document.querySelectorAll(
          `#${c.current} [data-combobox-option]`
        ),
        T = P == null ? void 0 : P[u.current];
      T == null || T.click();
    }, []),
    B = y.useCallback((P) => {
      c.current = P;
    }, []),
    V = y.useCallback(() => {
      m.current = window.setTimeout(() => d.current.focus(), 0);
    }, []),
    A = y.useCallback(() => {
      p.current = window.setTimeout(() => f.current.focus(), 0);
    }, []),
    j = y.useCallback(() => u.current, []);
  return (
    y.useEffect(
      () => () => {
        window.clearTimeout(m.current),
          window.clearTimeout(p.current),
          window.clearTimeout(h.current);
      },
      []
    ),
    {
      dropdownOpened: l,
      openDropdown: S,
      closeDropdown: v,
      toggleDropdown: w,
      selectedOptionIndex: u.current,
      getSelectedOptionIndex: j,
      selectOption: b,
      selectFirstOption: D,
      selectActiveOption: C,
      selectNextOption: E,
      selectPreviousOption: _,
      resetSelectedOption: N,
      updateSelectedOptionIndex: L,
      listId: c.current,
      setListId: B,
      clickSelectedOption: M,
      searchRef: d,
      focusSearchInput: V,
      targetRef: f,
      focusTarget: A,
    }
  );
}
const iR = {
    keepMounted: !0,
    withinPortal: !0,
    resetSelectionOnOptionHover: !1,
    width: "target",
    transitionProps: { transition: "fade", duration: 0 },
  },
  lR = (e, { size: t, dropdownPadding: n }) => ({
    options: {
      "--combobox-option-fz": et(t),
      "--combobox-option-padding": Ee(t, "combobox-option-padding"),
    },
    dropdown: {
      "--combobox-padding": n === void 0 ? void 0 : z(n),
      "--combobox-option-fz": et(t),
      "--combobox-option-padding": Ee(t, "combobox-option-padding"),
    },
  });
function fe(e) {
  const t = U("Combobox", iR, e),
    {
      classNames: n,
      styles: r,
      unstyled: o,
      children: s,
      store: i,
      vars: l,
      onOptionSubmit: a,
      onClose: c,
      size: u,
      dropdownPadding: d,
      resetSelectionOnOptionHover: f,
      __staticSelector: m,
      readOnly: p,
      ...h
    } = t,
    S = Uf(),
    v = i || S,
    w = ue({
      name: m || "Combobox",
      classes: wt,
      props: t,
      classNames: n,
      styles: r,
      unstyled: o,
      vars: l,
      varsResolver: lR,
    }),
    g = () => {
      c == null || c(), v.closeDropdown();
    };
  return x.jsx(W_, {
    value: {
      getStyles: w,
      store: v,
      onOptionSubmit: a,
      size: u,
      resetSelectionOnOptionHover: f,
      readOnly: p,
    },
    children: x.jsx(rn, {
      opened: v.dropdownOpened,
      ...h,
      onClose: g,
      withRoles: !1,
      unstyled: o,
      children: s,
    }),
  });
}
const aR = (e) => e;
fe.extend = aR;
fe.classes = wt;
fe.displayName = "@mantine/core/Combobox";
fe.Target = W0;
fe.Dropdown = Lf;
fe.Options = Vf;
fe.Option = Bf;
fe.Search = Hf;
fe.Empty = Af;
fe.Chevron = $f;
fe.Footer = Mf;
fe.Header = zf;
fe.EventsTarget = H0;
fe.DropdownTarget = V0;
fe.Group = If;
fe.ClearButton = B0;
fe.HiddenInput = U0;
var Y0 = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc",
};
const cR = Y0,
  K0 = y.forwardRef(
    (
      {
        __staticSelector: e,
        __stylesApiProps: t,
        className: n,
        classNames: r,
        styles: o,
        unstyled: s,
        children: i,
        label: l,
        description: a,
        id: c,
        disabled: u,
        error: d,
        size: f,
        labelPosition: m = "left",
        bodyElement: p = "div",
        labelElement: h = "label",
        variant: S,
        style: v,
        vars: w,
        mod: g,
        ...b
      },
      C
    ) => {
      const E = ue({
        name: e,
        props: t,
        className: n,
        style: v,
        classes: Y0,
        classNames: r,
        styles: o,
        unstyled: s,
      });
      return x.jsx(G, {
        ...E("root"),
        ref: C,
        __vars: { "--label-fz": et(f), "--label-lh": Ee(f, "label-lh") },
        mod: [{ "label-position": m }, g],
        variant: S,
        size: f,
        ...b,
        children: x.jsxs(G, {
          component: p,
          htmlFor: p === "label" ? c : void 0,
          ...E("body"),
          children: [
            i,
            x.jsxs("div", {
              ...E("labelWrapper"),
              "data-disabled": u || void 0,
              children: [
                l &&
                  x.jsx(G, {
                    component: h,
                    htmlFor: h === "label" ? c : void 0,
                    ...E("label"),
                    "data-disabled": u || void 0,
                    children: l,
                  }),
                a &&
                  x.jsx(nt.Description, {
                    size: f,
                    __inheritStyles: !1,
                    ...E("description"),
                    children: a,
                  }),
                d &&
                  typeof d != "boolean" &&
                  x.jsx(nt.Error, {
                    size: f,
                    __inheritStyles: !1,
                    ...E("error"),
                    children: d,
                  }),
              ],
            }),
          ],
        }),
      });
    }
  );
K0.displayName = "@mantine/core/InlineInput";
const q0 = y.createContext(null),
  uR = q0.Provider,
  dR = () => y.useContext(q0);
function fR({ children: e, role: t }) {
  const n = Wo();
  return n
    ? x.jsx("div", {
        role: t,
        "aria-labelledby": n.labelId,
        "aria-describedby": n.describedBy,
        children: e,
      })
    : x.jsx(x.Fragment, { children: e });
}
const pR = {},
  Wf = X((e, t) => {
    const {
        value: n,
        defaultValue: r,
        onChange: o,
        size: s,
        wrapperProps: i,
        children: l,
        readOnly: a,
        ...c
      } = U("CheckboxGroup", pR, e),
      [u, d] = $n({ value: n, defaultValue: r, finalValue: [], onChange: o }),
      f = (m) => {
        const p = m.currentTarget.value;
        !a && d(u.includes(p) ? u.filter((h) => h !== p) : [...u, p]);
      };
    return x.jsx(uR, {
      value: { value: u, onChange: f, size: s },
      children: x.jsx(nt.Wrapper, {
        size: s,
        ref: t,
        ...i,
        ...c,
        labelElement: "div",
        __staticSelector: "CheckboxGroup",
        children: x.jsx(fR, { role: "group", children: l }),
      }),
    });
  });
Wf.classes = nt.Wrapper.classes;
Wf.displayName = "@mantine/core/CheckboxGroup";
function G0({ size: e, style: t, ...n }) {
  const r = e !== void 0 ? { width: z(e), height: z(e), ...t } : t;
  return x.jsx("svg", {
    viewBox: "0 0 10 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: r,
    "aria-hidden": !0,
    ...n,
    children: x.jsx("path", {
      d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
function mR({ indeterminate: e, ...t }) {
  return e
    ? x.jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 32 6",
        "aria-hidden": !0,
        ...t,
        children: x.jsx("rect", {
          width: "32",
          height: "6",
          fill: "currentColor",
          rx: "3",
        }),
      })
    : x.jsx(G0, { ...t });
}
var X0 = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542",
};
const hR = { labelPosition: "right", icon: mR },
  gR = (
    e,
    { radius: t, color: n, size: r, iconColor: o, variant: s, autoContrast: i }
  ) => {
    const l = zo({ color: n || e.primaryColor, theme: e }),
      a =
        l.isThemeColor && l.shade === void 0
          ? `var(--mantine-color-${l.color}-outline)`
          : l.color;
    return {
      root: {
        "--checkbox-size": Ee(r, "checkbox-size"),
        "--checkbox-radius": t === void 0 ? void 0 : Sn(t),
        "--checkbox-color": s === "outline" ? a : No(n, e),
        "--checkbox-icon-color": o
          ? No(o, e)
          : JC(i, e)
          ? Hv({ color: n, theme: e })
          : void 0,
      },
    };
  },
  Ys = X((e, t) => {
    const n = U("Checkbox", hR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        color: c,
        label: u,
        id: d,
        size: f,
        radius: m,
        wrapperProps: p,
        children: h,
        checked: S,
        labelPosition: v,
        description: w,
        error: g,
        disabled: b,
        variant: C,
        indeterminate: E,
        icon: _,
        rootRef: D,
        iconColor: L,
        onChange: N,
        autoContrast: M,
        mod: B,
        ...V
      } = n,
      A = dR(),
      j = f || (A == null ? void 0 : A.size),
      P = _,
      T = ue({
        name: "Checkbox",
        props: n,
        classes: X0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: gR,
      }),
      { styleProps: R, rest: k } = ri(V),
      $ = Wr(d),
      O = A
        ? {
            checked: A.value.includes(k.value),
            onChange: (I) => {
              A.onChange(I), N == null || N(I);
            },
          }
        : {};
    return x.jsx(K0, {
      ...T("root"),
      __staticSelector: "Checkbox",
      __stylesApiProps: n,
      id: $,
      size: j,
      labelPosition: v,
      label: u,
      description: w,
      error: g,
      disabled: b,
      classNames: r,
      styles: i,
      unstyled: l,
      "data-checked": O.checked || S || void 0,
      variant: C,
      ref: D,
      mod: B,
      ...R,
      ...p,
      children: x.jsxs(G, {
        ...T("inner"),
        mod: { "data-label-position": v },
        children: [
          x.jsx(G, {
            component: "input",
            id: $,
            ref: t,
            checked: S,
            disabled: b,
            mod: { error: !!g, indeterminate: E },
            ...T("input", { focusable: !0, variant: C }),
            onChange: N,
            ...k,
            ...O,
            type: "checkbox",
          }),
          x.jsx(P, { indeterminate: E, ...T("icon") }),
        ],
      }),
    });
  });
Ys.classes = { ...X0, ...cR };
Ys.displayName = "@mantine/core/Checkbox";
Ys.Group = Wf;
function Ao(e) {
  return "group" in e;
}
function Q0({ options: e, search: t, limit: n }) {
  const r = t.trim().toLowerCase(),
    o = [];
  for (let s = 0; s < e.length; s += 1) {
    const i = e[s];
    if (o.length === n) return o;
    Ao(i) &&
      o.push({
        group: i.group,
        items: Q0({ options: i.items, search: t, limit: n - o.length }),
      }),
      Ao(i) || (i.label.toLowerCase().includes(r) && o.push(i));
  }
  return o;
}
function yR(e) {
  if (e.length === 0) return !0;
  for (const t of e) if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function J0(e, t = new Set()) {
  if (Array.isArray(e))
    for (const n of e)
      if (Ao(n)) J0(n.items, t);
      else {
        if (typeof n.value > "u")
          throw new Error(
            "[@mantine/core] Each option must have value property"
          );
        if (typeof n.value != "string")
          throw new Error(
            `[@mantine/core] Option value must be a string, other data formats are not supported, got ${typeof n.value}`
          );
        if (t.has(n.value))
          throw new Error(
            `[@mantine/core] Duplicate options are not supported. Option with value "${n.value}" was provided more than once`
          );
        t.add(n.value);
      }
}
function vR(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function Z0({
  data: e,
  withCheckIcon: t,
  value: n,
  checkIconPosition: r,
  unstyled: o,
  renderOption: s,
}) {
  if (!Ao(e)) {
    const l = vR(n, e.value),
      a = t && l && x.jsx(G0, { className: wt.optionsDropdownCheckIcon }),
      c = x.jsxs(x.Fragment, {
        children: [
          r === "left" && a,
          x.jsx("span", { children: e.label }),
          r === "right" && a,
        ],
      });
    return x.jsx(fe.Option, {
      value: e.value,
      disabled: e.disabled,
      className: at({ [wt.optionsDropdownOption]: !o }),
      "data-reverse": r === "right" || void 0,
      "data-checked": l || void 0,
      "aria-selected": l,
      active: l,
      children: typeof s == "function" ? s({ option: e, checked: l }) : c,
    });
  }
  const i = e.items.map((l) =>
    x.jsx(
      Z0,
      {
        data: l,
        value: n,
        unstyled: o,
        withCheckIcon: t,
        checkIconPosition: r,
        renderOption: s,
      },
      l.value
    )
  );
  return x.jsx(fe.Group, { label: e.group, children: i });
}
function ew({
  data: e,
  hidden: t,
  hiddenWhenEmpty: n,
  filter: r,
  search: o,
  limit: s,
  maxDropdownHeight: i,
  withScrollArea: l = !0,
  filterOptions: a = !0,
  withCheckIcon: c = !1,
  value: u,
  checkIconPosition: d,
  nothingFoundMessage: f,
  unstyled: m,
  labelId: p,
  renderOption: h,
  scrollAreaProps: S,
  "aria-label": v,
}) {
  J0(e);
  const g =
      typeof o == "string"
        ? (r || Q0)({ options: e, search: a ? o : "", limit: s ?? 1 / 0 })
        : e,
    b = yR(g),
    C = g.map((E) =>
      x.jsx(
        Z0,
        {
          data: E,
          withCheckIcon: c,
          value: u,
          checkIconPosition: d,
          unstyled: m,
          renderOption: h,
        },
        Ao(E) ? E.group : E.value
      )
    );
  return x.jsx(fe.Dropdown, {
    hidden: t || (n && b),
    children: x.jsxs(fe.Options, {
      labelledBy: p,
      "aria-label": v,
      children: [
        l
          ? x.jsx(oi.Autosize, {
              mah: i ?? 220,
              type: "scroll",
              scrollbarSize: "var(--combobox-padding)",
              offsetScrollbars: "y",
              ...S,
              children: C,
            })
          : C,
        b && f && x.jsx(fe.Empty, { children: f }),
      ],
    }),
  });
}
var va = {
  root: "m_77c9d27d",
  inner: "m_80f1301b",
  label: "m_811560b9",
  section: "m_a74036a",
  loader: "m_a25b86ee",
  group: "m_80d6d844",
};
const Sh = { orientation: "horizontal" },
  wR = (e, { borderWidth: t }) => ({
    group: { "--button-border-width": z(t) },
  }),
  Yf = X((e, t) => {
    const n = U("ButtonGroup", Sh, e),
      {
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        orientation: a,
        vars: c,
        borderWidth: u,
        variant: d,
        mod: f,
        ...m
      } = U("ButtonGroup", Sh, e),
      p = ue({
        name: "ButtonGroup",
        props: n,
        classes: va,
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: wR,
        rootSelector: "group",
      });
    return x.jsx(G, {
      ...p("group"),
      ref: t,
      variant: d,
      mod: [{ "data-orientation": a }, f],
      role: "group",
      ...m,
    });
  });
Yf.classes = va;
Yf.displayName = "@mantine/core/ButtonGroup";
const xR = {
    in: { opacity: 1, transform: `translate(-50%, calc(-50% + ${z(1)}))` },
    out: { opacity: 0, transform: "translate(-50%, -200%)" },
    common: { transformOrigin: "center" },
    transitionProperty: "transform, opacity",
  },
  SR = {},
  bR = (
    e,
    {
      radius: t,
      color: n,
      gradient: r,
      variant: o,
      size: s,
      justify: i,
      autoContrast: l,
    }
  ) => {
    const a = e.variantColorResolver({
      color: n || e.primaryColor,
      theme: e,
      gradient: r,
      variant: o || "filled",
      autoContrast: l,
    });
    return {
      root: {
        "--button-justify": i,
        "--button-height": Ee(s, "button-height"),
        "--button-padding-x": Ee(s, "button-padding-x"),
        "--button-fz":
          s != null && s.includes("compact")
            ? et(s.replace("compact-", ""))
            : et(s),
        "--button-radius": t === void 0 ? void 0 : Sn(t),
        "--button-bg": n || o ? a.background : void 0,
        "--button-hover": n || o ? a.hover : void 0,
        "--button-color": a.color,
        "--button-bd": n || o ? a.border : void 0,
        "--button-hover-color": n || o ? a.hoverColor : void 0,
      },
    };
  },
  mn = Fn((e, t) => {
    const n = U("Button", SR, e),
      {
        style: r,
        vars: o,
        className: s,
        color: i,
        disabled: l,
        children: a,
        leftSection: c,
        rightSection: u,
        fullWidth: d,
        variant: f,
        radius: m,
        loading: p,
        loaderProps: h,
        gradient: S,
        classNames: v,
        styles: w,
        unstyled: g,
        "data-disabled": b,
        autoContrast: C,
        mod: E,
        ..._
      } = n,
      D = ue({
        name: "Button",
        props: n,
        classes: va,
        className: s,
        style: r,
        classNames: v,
        styles: w,
        unstyled: g,
        vars: o,
        varsResolver: bR,
      }),
      L = !!c,
      N = !!u;
    return x.jsxs(Pn, {
      ref: t,
      ...D("root", { active: !l && !p && !b }),
      unstyled: g,
      variant: f,
      disabled: l || p,
      mod: [
        {
          disabled: l || b,
          loading: p,
          block: d,
          "with-left-section": L,
          "with-right-section": N,
        },
        E,
      ],
      ..._,
      children: [
        x.jsx(Uo, {
          mounted: !!p,
          transition: xR,
          duration: 150,
          children: (M) =>
            x.jsx(G, {
              component: "span",
              ...D("loader", { style: M }),
              "aria-hidden": !0,
              children: x.jsx(ii, {
                color: "var(--button-color)",
                size: "calc(var(--button-height) / 1.8)",
                ...h,
              }),
            }),
        }),
        x.jsxs("span", {
          ...D("inner"),
          children: [
            c &&
              x.jsx(G, {
                component: "span",
                ...D("section"),
                mod: { position: "left" },
                children: c,
              }),
            x.jsx(G, {
              component: "span",
              mod: { loading: p },
              ...D("label"),
              children: a,
            }),
            u &&
              x.jsx(G, {
                component: "span",
                ...D("section"),
                mod: { position: "right" },
                children: u,
              }),
          ],
        }),
      ],
    });
  });
mn.classes = va;
mn.displayName = "@mantine/core/Button";
mn.Group = Yf;
var tw = { root: "m_4451eb3a" };
const CR = {},
  Kf = Fn((e, t) => {
    const n = U("Center", CR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        inline: c,
        mod: u,
        ...d
      } = n,
      f = ue({
        name: "Center",
        props: n,
        classes: tw,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
      });
    return x.jsx(G, { ref: t, mod: [{ inline: c }, u], ...f("root"), ...d });
  });
Kf.classes = tw;
Kf.displayName = "@mantine/core/Center";
function ER({ open: e, close: t, openDelay: n, closeDelay: r }) {
  const o = y.useRef(-1),
    s = y.useRef(-1),
    i = () => {
      window.clearTimeout(o.current), window.clearTimeout(s.current);
    },
    l = () => {
      i(),
        n === 0 || n === void 0 ? e() : (o.current = window.setTimeout(e, n));
    },
    a = () => {
      i(),
        r === 0 || r === void 0 ? t() : (s.current = window.setTimeout(t, r));
    };
  return y.useEffect(() => i, []), { openDropdown: l, closeDropdown: a };
}
const [kR, nw] = pr("HoverCard component was not found in the tree"),
  _R = {};
function rw(e) {
  const {
      children: t,
      onMouseEnter: n,
      onMouseLeave: r,
      ...o
    } = U("HoverCardDropdown", _R, e),
    s = nw(),
    i = Dl(n, s.openDropdown),
    l = Dl(r, s.closeDropdown);
  return x.jsx(rn.Dropdown, {
    onMouseEnter: i,
    onMouseLeave: l,
    ...o,
    children: t,
  });
}
rw.displayName = "@mantine/core/HoverCardDropdown";
const RR = { refProp: "ref" },
  ow = y.forwardRef((e, t) => {
    const {
      children: n,
      refProp: r,
      eventPropsWrapperName: o,
      ...s
    } = U("HoverCardTarget", RR, e);
    if (!Hr(n))
      throw new Error(
        "HoverCard.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = nw(),
      l = Dl(n.props.onMouseEnter, i.openDropdown),
      a = Dl(n.props.onMouseLeave, i.closeDropdown),
      c = { onMouseEnter: l, onMouseLeave: a };
    return x.jsx(rn.Target, {
      refProp: r,
      ref: t,
      ...s,
      children: y.cloneElement(n, o ? { [o]: c } : c),
    });
  });
ow.displayName = "@mantine/core/HoverCardTarget";
const DR = { openDelay: 0, closeDelay: 150, initiallyOpened: !1 };
function Pr(e) {
  const {
      children: t,
      onOpen: n,
      onClose: r,
      openDelay: o,
      closeDelay: s,
      initiallyOpened: i,
      ...l
    } = U("HoverCard", DR, e),
    [a, { open: c, close: u }] = Vs(i, { onClose: r, onOpen: n }),
    { openDropdown: d, closeDropdown: f } = ER({
      open: c,
      close: u,
      openDelay: o,
      closeDelay: s,
    });
  return x.jsx(kR, {
    value: { openDropdown: d, closeDropdown: f },
    children: x.jsx(rn, {
      ...l,
      opened: a,
      __staticSelector: "HoverCard",
      children: t,
    }),
  });
}
Pr.displayName = "@mantine/core/HoverCard";
Pr.Target = ow;
Pr.Dropdown = rw;
Pr.extend = (e) => e;
function Wu() {
  return (
    (Wu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Wu.apply(this, arguments)
  );
}
function PR(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) >= 0) continue;
      n[r] = e[r];
    }
  return n;
}
var TR = y.useLayoutEffect,
  NR = function (t) {
    var n = y.useRef(t);
    return (
      TR(function () {
        n.current = t;
      }),
      n
    );
  },
  bh = function (t, n) {
    if (typeof t == "function") {
      t(n);
      return;
    }
    t.current = n;
  },
  OR = function (t, n) {
    var r = y.useRef();
    return y.useCallback(
      function (o) {
        (t.current = o),
          r.current && bh(r.current, null),
          (r.current = n),
          n && bh(n, o);
      },
      [n]
    );
  },
  Ch = {
    "min-height": "0",
    "max-height": "none",
    height: "0",
    visibility: "hidden",
    overflow: "hidden",
    position: "absolute",
    "z-index": "-1000",
    top: "0",
    right: "0",
  },
  jR = function (t) {
    Object.keys(Ch).forEach(function (n) {
      t.style.setProperty(n, Ch[n], "important");
    });
  },
  Eh = jR,
  ot = null,
  kh = function (t, n) {
    var r = t.scrollHeight;
    return n.sizingStyle.boxSizing === "border-box"
      ? r + n.borderSize
      : r - n.paddingSize;
  };
function $R(e, t, n, r) {
  n === void 0 && (n = 1),
    r === void 0 && (r = 1 / 0),
    ot ||
      ((ot = document.createElement("textarea")),
      ot.setAttribute("tabindex", "-1"),
      ot.setAttribute("aria-hidden", "true"),
      Eh(ot)),
    ot.parentNode === null && document.body.appendChild(ot);
  var o = e.paddingSize,
    s = e.borderSize,
    i = e.sizingStyle,
    l = i.boxSizing;
  Object.keys(i).forEach(function (f) {
    var m = f;
    ot.style[m] = i[m];
  }),
    Eh(ot),
    (ot.value = t);
  var a = kh(ot, e);
  (ot.value = t), (a = kh(ot, e)), (ot.value = "x");
  var c = ot.scrollHeight - o,
    u = c * n;
  l === "border-box" && (u = u + o + s), (a = Math.max(u, a));
  var d = c * r;
  return l === "border-box" && (d = d + o + s), (a = Math.min(d, a)), [a, c];
}
var _h = function () {},
  LR = function (t, n) {
    return t.reduce(function (r, o) {
      return (r[o] = n[o]), r;
    }, {});
  },
  AR = [
    "borderBottomWidth",
    "borderLeftWidth",
    "borderRightWidth",
    "borderTopWidth",
    "boxSizing",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "paddingTop",
    "tabSize",
    "textIndent",
    "textRendering",
    "textTransform",
    "width",
    "wordBreak",
  ],
  FR = !!document.documentElement.currentStyle,
  MR = function (t) {
    var n = window.getComputedStyle(t);
    if (n === null) return null;
    var r = LR(AR, n),
      o = r.boxSizing;
    if (o === "") return null;
    FR &&
      o === "border-box" &&
      (r.width =
        parseFloat(r.width) +
        parseFloat(r.borderRightWidth) +
        parseFloat(r.borderLeftWidth) +
        parseFloat(r.paddingRight) +
        parseFloat(r.paddingLeft) +
        "px");
    var s = parseFloat(r.paddingBottom) + parseFloat(r.paddingTop),
      i = parseFloat(r.borderBottomWidth) + parseFloat(r.borderTopWidth);
    return { sizingStyle: r, paddingSize: s, borderSize: i };
  },
  IR = MR;
function sw(e, t, n) {
  var r = NR(n);
  y.useLayoutEffect(function () {
    var o = function (i) {
      return r.current(i);
    };
    if (e)
      return (
        e.addEventListener(t, o),
        function () {
          return e.removeEventListener(t, o);
        }
      );
  }, []);
}
var zR = function (t) {
    sw(window, "resize", t);
  },
  BR = function (t) {
    sw(document.fonts, "loadingdone", t);
  },
  VR = [
    "cacheMeasurements",
    "maxRows",
    "minRows",
    "onChange",
    "onHeightChange",
  ],
  HR = function (t, n) {
    var r = t.cacheMeasurements,
      o = t.maxRows,
      s = t.minRows,
      i = t.onChange,
      l = i === void 0 ? _h : i,
      a = t.onHeightChange,
      c = a === void 0 ? _h : a,
      u = PR(t, VR),
      d = u.value !== void 0,
      f = y.useRef(null),
      m = OR(f, n),
      p = y.useRef(0),
      h = y.useRef(),
      S = function () {
        var g = f.current,
          b = r && h.current ? h.current : IR(g);
        if (b) {
          h.current = b;
          var C = $R(b, g.value || g.placeholder || "x", s, o),
            E = C[0],
            _ = C[1];
          p.current !== E &&
            ((p.current = E),
            g.style.setProperty("height", E + "px", "important"),
            c(E, { rowHeight: _ }));
        }
      },
      v = function (g) {
        d || S(), l(g);
      };
    return (
      y.useLayoutEffect(S),
      zR(S),
      BR(S),
      y.createElement("textarea", Wu({}, u, { onChange: v, ref: m }))
    );
  },
  UR = y.forwardRef(HR);
const WR = {},
  qf = X((e, t) => {
    const {
        autosize: n,
        maxRows: r,
        minRows: o,
        __staticSelector: s,
        resize: i,
        ...l
      } = U("Textarea", WR, e),
      a = n && aC() !== "test",
      c = a ? { maxRows: r, minRows: o } : {};
    return x.jsx(Cn, {
      component: a ? UR : "textarea",
      ref: t,
      ...l,
      __staticSelector: s || "Textarea",
      multiline: !0,
      "data-no-overflow": (n && r === void 0) || void 0,
      __vars: { "--input-resize": i },
      ...c,
    });
  });
qf.classes = Cn.classes;
qf.displayName = "@mantine/core/Textarea";
var iw = { root: "m_6e45937b", loader: "m_e8eb006c", overlay: "m_df587f17" };
const Rh = {
    transitionProps: { transition: "fade", duration: 0 },
    overlayProps: { backgroundOpacity: 0.75 },
    zIndex: Ur("overlay"),
  },
  YR = (e, { zIndex: t }) => ({
    root: { "--lo-z-index": t == null ? void 0 : t.toString() },
  }),
  Gf = X((e, t) => {
    const n = U("LoadingOverlay", Rh, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        transitionProps: c,
        loaderProps: u,
        overlayProps: d,
        visible: f,
        zIndex: m,
        ...p
      } = n,
      h = bn(),
      S = ue({
        name: "LoadingOverlay",
        classes: iw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: YR,
      }),
      v = { ...Rh.overlayProps, ...d };
    return x.jsx(Uo, {
      transition: "fade",
      ...c,
      mounted: !!f,
      children: (w) =>
        x.jsxs(G, {
          ...S("root", { style: w }),
          ref: t,
          ...p,
          children: [
            x.jsx(ii, { ...S("loader"), unstyled: l, ...u }),
            x.jsx(Ws, {
              ...v,
              ...S("overlay"),
              darkHidden: !0,
              unstyled: l,
              color: (d == null ? void 0 : d.color) || h.white,
            }),
            x.jsx(Ws, {
              ...v,
              ...S("overlay"),
              lightHidden: !0,
              unstyled: l,
              color: (d == null ? void 0 : d.color) || h.colors.dark[5],
            }),
          ],
        }),
    });
  });
Gf.classes = iw;
Gf.displayName = "@mantine/core/LoadingOverlay";
const [KR, Yo] = pr("Modal component was not found in tree");
var zn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd",
};
const qR = {},
  wa = X((e, t) => {
    const n = U("ModalBody", qR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = Yo();
    return x.jsx(j0, {
      ref: t,
      ...c.getStyles("body", {
        classNames: r,
        style: s,
        styles: i,
        className: o,
      }),
      ...a,
    });
  });
wa.classes = zn;
wa.displayName = "@mantine/core/ModalBody";
const GR = {},
  xa = X((e, t) => {
    const n = U("ModalCloseButton", GR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = Yo();
    return x.jsx($0, {
      ref: t,
      ...c.getStyles("close", {
        classNames: r,
        style: s,
        styles: i,
        className: o,
      }),
      ...a,
    });
  });
xa.classes = zn;
xa.displayName = "@mantine/core/ModalCloseButton";
const XR = {},
  Sa = X((e, t) => {
    const n = U("ModalContent", XR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        vars: l,
        children: a,
        ...c
      } = n,
      u = Yo(),
      d = u.scrollAreaComponent || R_;
    return x.jsx(C_, {
      ...u.getStyles("content", {
        className: o,
        style: s,
        styles: i,
        classNames: r,
      }),
      innerProps: u.getStyles("inner", {
        className: o,
        style: s,
        styles: i,
        classNames: r,
      }),
      "data-full-screen": u.fullScreen || void 0,
      "data-modal-content": !0,
      ref: t,
      ...c,
      children: x.jsx(d, {
        style: {
          maxHeight: u.fullScreen
            ? "100dvh"
            : `calc(100dvh - (${z(u.yOffset)} * 2))`,
        },
        children: a,
      }),
    });
  });
Sa.classes = zn;
Sa.displayName = "@mantine/core/ModalContent";
const QR = {},
  ba = X((e, t) => {
    const n = U("ModalHeader", QR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = Yo();
    return x.jsx(L0, {
      ref: t,
      ...c.getStyles("header", {
        classNames: r,
        style: s,
        styles: i,
        className: o,
      }),
      ...a,
    });
  });
ba.classes = zn;
ba.displayName = "@mantine/core/ModalHeader";
const JR = {},
  Ca = X((e, t) => {
    const n = U("ModalOverlay", JR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = Yo();
    return x.jsx(A0, {
      ref: t,
      ...c.getStyles("overlay", {
        classNames: r,
        style: s,
        styles: i,
        className: o,
      }),
      ...a,
    });
  });
Ca.classes = zn;
Ca.displayName = "@mantine/core/ModalOverlay";
const ZR = {
    __staticSelector: "Modal",
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: Ur("modal"),
    transitionProps: { duration: 200, transition: "pop" },
    yOffset: "5dvh",
  },
  eD = (e, { radius: t, size: n, yOffset: r, xOffset: o }) => ({
    root: {
      "--modal-radius": t === void 0 ? void 0 : Sn(t),
      "--modal-size": Ee(n, "modal-size"),
      "--modal-y-offset": z(r),
      "--modal-x-offset": z(o),
    },
  }),
  Ea = X((e, t) => {
    const n = U("ModalRoot", ZR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        yOffset: c,
        scrollAreaComponent: u,
        radius: d,
        fullScreen: f,
        centered: m,
        xOffset: p,
        __staticSelector: h,
        ...S
      } = n,
      v = ue({
        name: h,
        classes: zn,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: eD,
      });
    return x.jsx(KR, {
      value: {
        yOffset: c,
        scrollAreaComponent: u,
        getStyles: v,
        fullScreen: f,
      },
      children: x.jsx(S_, {
        ref: t,
        ...v("root"),
        "data-full-screen": f || void 0,
        "data-centered": m || void 0,
        unstyled: l,
        ...S,
      }),
    });
  });
Ea.classes = zn;
Ea.displayName = "@mantine/core/ModalRoot";
const tD = {},
  ka = X((e, t) => {
    const n = U("ModalTitle", tD, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = Yo();
    return x.jsx(F0, {
      ref: t,
      ...c.getStyles("title", {
        classNames: r,
        style: s,
        styles: i,
        className: o,
      }),
      ...a,
    });
  });
ka.classes = zn;
ka.displayName = "@mantine/core/ModalTitle";
const nD = {
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: Ur("modal"),
    transitionProps: { duration: 200, transition: "fade-down" },
    withOverlay: !0,
    withCloseButton: !0,
  },
  on = X((e, t) => {
    const {
        title: n,
        withOverlay: r,
        overlayProps: o,
        withCloseButton: s,
        closeButtonProps: i,
        children: l,
        radius: a,
        ...c
      } = U("Modal", nD, e),
      u = !!n || s;
    return x.jsxs(Ea, {
      ref: t,
      radius: a,
      ...c,
      children: [
        r && x.jsx(Ca, { ...o }),
        x.jsxs(Sa, {
          radius: a,
          children: [
            u &&
              x.jsxs(ba, {
                children: [
                  n && x.jsx(ka, { children: n }),
                  s && x.jsx(xa, { ...i }),
                ],
              }),
            x.jsx(wa, { children: l }),
          ],
        }),
      ],
    });
  });
on.classes = zn;
on.displayName = "@mantine/core/Modal";
on.Root = Ea;
on.Overlay = Ca;
on.Content = Sa;
on.Body = wa;
on.Header = ba;
on.Title = ka;
on.CloseButton = xa;
const [rD, Xf] = lf(),
  [oD, sD] = lf();
var _a = {
  root: "m_7cda1cd6",
  "root--default": "m_44da308b",
  "root--contrast": "m_e3a01f8",
  label: "m_1e0e6180",
  remove: "m_ae386778",
  group: "m_1dcfd90b",
};
const iD = {},
  lD = (e, { gap: t }, { size: n }) => ({
    group: { "--pg-gap": t !== void 0 ? Ee(t) : Ee(n, "pg-gap") },
  }),
  Qf = X((e, t) => {
    const n = U("PillGroup", iD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        disabled: u,
        ...d
      } = n,
      f = Xf(),
      m = (f == null ? void 0 : f.size) || c || void 0,
      p = ue({
        name: "PillGroup",
        classes: _a,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: lD,
        stylesCtx: { size: m },
        rootSelector: "group",
      });
    return x.jsx(oD, {
      value: { size: m, disabled: u },
      children: x.jsx(G, { ref: t, size: m, ...p("group"), ...d }),
    });
  });
Qf.classes = _a;
Qf.displayName = "@mantine/core/PillGroup";
const aD = { variant: "default" },
  cD = (e, { radius: t }, { size: n }) => ({
    root: {
      "--pill-fz": Ee(n, "pill-fz"),
      "--pill-height": Ee(n, "pill-height"),
      "--pill-radius": t === void 0 ? void 0 : Sn(t),
    },
  }),
  Ks = X((e, t) => {
    const n = U("Pill", aD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        variant: c,
        children: u,
        withRemoveButton: d,
        onRemove: f,
        removeButtonProps: m,
        radius: p,
        size: h,
        disabled: S,
        mod: v,
        ...w
      } = n,
      g = sD(),
      b = Xf(),
      C = h || (g == null ? void 0 : g.size) || void 0,
      E =
        (b == null ? void 0 : b.variant) === "filled"
          ? "contrast"
          : c || "default",
      _ = ue({
        name: "Pill",
        classes: _a,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: cD,
        stylesCtx: { size: C },
      });
    return x.jsxs(G, {
      component: "span",
      ref: t,
      variant: E,
      size: C,
      ..._("root", { variant: E }),
      mod: [
        {
          "with-remove": d && !S,
          disabled: S || (g == null ? void 0 : g.disabled),
        },
        v,
      ],
      ...w,
      children: [
        x.jsx("span", { ..._("label"), children: u }),
        d &&
          x.jsx(Mr, {
            variant: "transparent",
            radius: p,
            tabIndex: -1,
            "aria-hidden": !0,
            unstyled: l,
            ...m,
            ..._("remove", {
              className: m == null ? void 0 : m.className,
              style: m == null ? void 0 : m.style,
            }),
            onMouseDown: (D) => {
              var L;
              D.preventDefault(),
                D.stopPropagation(),
                (L = m == null ? void 0 : m.onMouseDown) == null ||
                  L.call(m, D);
            },
            onClick: (D) => {
              var L;
              D.stopPropagation(),
                f == null || f(),
                (L = m == null ? void 0 : m.onClick) == null || L.call(m, D);
            },
          }),
      ],
    });
  });
Ks.classes = _a;
Ks.displayName = "@mantine/core/Pill";
Ks.Group = Qf;
var lw = { field: "m_45c4369d" };
const uD = { type: "visible" },
  Jf = X((e, t) => {
    const n = U("PillsInputField", uD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        type: c,
        disabled: u,
        id: d,
        pointer: f,
        mod: m,
        ...p
      } = n,
      h = Xf(),
      S = Wo(),
      v = ue({
        name: "PillsInputField",
        classes: lw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "field",
      }),
      w = u || (h == null ? void 0 : h.disabled);
    return x.jsx(G, {
      component: "input",
      ref: Dt(t, h == null ? void 0 : h.fieldRef),
      "data-type": c,
      disabled: w,
      mod: [{ disabled: w, pointer: f }, m],
      ...v("field"),
      ...p,
      id: (S == null ? void 0 : S.inputId) || d,
      "aria-invalid": h == null ? void 0 : h.hasError,
      "aria-describedby": S == null ? void 0 : S.describedBy,
      type: "text",
      onMouseDown: (g) => !f && g.stopPropagation(),
    });
  });
Jf.classes = lw;
Jf.displayName = "@mantine/core/PillsInputField";
const dD = {},
  $l = X((e, t) => {
    const n = U("PillsInput", dD, e),
      {
        children: r,
        onMouseDown: o,
        onClick: s,
        size: i,
        disabled: l,
        __staticSelector: a,
        error: c,
        variant: u,
        ...d
      } = n,
      f = y.useRef();
    return x.jsx(rD, {
      value: { fieldRef: f, size: i, disabled: l, hasError: !!c, variant: u },
      children: x.jsx(Cn, {
        size: i,
        error: c,
        variant: u,
        component: "div",
        ref: t,
        onMouseDown: (m) => {
          var p;
          m.preventDefault(),
            o == null || o(m),
            (p = f.current) == null || p.focus();
        },
        onClick: (m) => {
          var p;
          m.preventDefault(),
            s == null || s(m),
            (p = f.current) == null || p.focus();
        },
        ...d,
        multiline: !0,
        disabled: l,
        __staticSelector: a || "PillsInput",
        withAria: !1,
        children: r,
      }),
    });
  });
$l.displayName = "@mantine/core/PillsInput";
$l.Field = Jf;
function fD({ data: e, value: t }) {
  const n = t.map((o) => o.trim().toLowerCase());
  return e.reduce(
    (o, s) => (
      Ao(s)
        ? o.push({
            group: s.group,
            items: s.items.filter(
              (i) => n.indexOf(i.value.toLowerCase().trim()) === -1
            ),
          })
        : n.indexOf(s.value.toLowerCase().trim()) === -1 && o.push(s),
      o
    ),
    []
  );
}
const pD = {
    maxValues: 1 / 0,
    withCheckIcon: !0,
    checkIconPosition: "left",
    hiddenInputValuesDivider: ",",
  },
  Zf = X((e, t) => {
    const n = U("MultiSelect", pD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        value: u,
        defaultValue: d,
        onChange: f,
        onKeyDown: m,
        variant: p,
        data: h,
        dropdownOpened: S,
        defaultDropdownOpened: v,
        onDropdownOpen: w,
        onDropdownClose: g,
        selectFirstOptionOnChange: b,
        onOptionSubmit: C,
        comboboxProps: E,
        filter: _,
        limit: D,
        withScrollArea: L,
        maxDropdownHeight: N,
        searchValue: M,
        defaultSearchValue: B,
        onSearchChange: V,
        readOnly: A,
        disabled: j,
        onFocus: P,
        onBlur: T,
        onPaste: R,
        radius: k,
        rightSection: $,
        rightSectionWidth: O,
        rightSectionPointerEvents: I,
        rightSectionProps: K,
        leftSection: J,
        leftSectionWidth: ee,
        leftSectionPointerEvents: ne,
        leftSectionProps: te,
        inputContainer: me,
        inputWrapperOrder: oe,
        withAsterisk: le,
        labelProps: Z,
        descriptionProps: ge,
        errorProps: ce,
        wrapperProps: se,
        description: je,
        label: Ie,
        error: ye,
        maxValues: rt,
        searchable: Te,
        nothingFoundMessage: Le,
        withCheckIcon: W,
        checkIconPosition: re,
        hidePickedOptions: ie,
        withErrorStyles: Se,
        name: Ae,
        form: Pt,
        id: be,
        clearable: Fe,
        clearButtonProps: an,
        hiddenInputProps: qe,
        placeholder: Tt,
        hiddenInputValuesDivider: yr,
        required: cn,
        mod: Ht,
        renderOption: Ka,
        onRemove: Ut,
        onClear: Xo,
        scrollAreaProps: qa,
        ...di
      } = n,
      Qo = Wr(be),
      ke = z0(h),
      Nt = jf(ke),
      Ot = Uf({
        opened: S,
        defaultOpened: v,
        onDropdownOpen: w,
        onDropdownClose: () => {
          g == null || g(), Ot.resetSelectedOption();
        },
      }),
      {
        styleProps: E1,
        rest: { type: HO, autoComplete: k1, ..._1 },
      } = ri(di),
      [Ge, Jo] = $n({ value: u, defaultValue: d, finalValue: [], onChange: f }),
      [fi, pi] = $n({ value: M, defaultValue: B, finalValue: "", onChange: V }),
      Ga = ue({
        name: "MultiSelect",
        classes: {},
        props: n,
        classNames: r,
        styles: i,
        unstyled: l,
      }),
      { resolvedClassNames: Cp, resolvedStyles: Ep } = Bo({
        props: n,
        styles: i,
        classNames: r,
      }),
      R1 = (_e) => {
        m == null || m(_e),
          _e.key === " " && !Te && (_e.preventDefault(), Ot.toggleDropdown()),
          _e.key === "Backspace" &&
            fi.length === 0 &&
            Ge.length > 0 &&
            (Ut == null || Ut(Ge[Ge.length - 1]),
            Jo(Ge.slice(0, Ge.length - 1)));
      },
      D1 = Ge.map((_e, Qa) => {
        var _p, Rp;
        return x.jsx(
          Ks,
          {
            withRemoveButton: !A && !((_p = Nt[_e]) != null && _p.disabled),
            onRemove: () => {
              Jo(Ge.filter((P1) => _e !== P1)), Ut == null || Ut(_e);
            },
            unstyled: l,
            disabled: j,
            ...Ga("pill"),
            children: ((Rp = Nt[_e]) == null ? void 0 : Rp.label) || _e,
          },
          `${_e}-${Qa}`
        );
      });
    y.useEffect(() => {
      b && Ot.selectFirstOption();
    }, [b, Ge]);
    const Xa =
        Fe &&
        Ge.length > 0 &&
        !j &&
        !A &&
        x.jsx(fe.ClearButton, {
          size: c,
          ...an,
          onClear: () => {
            Xo == null || Xo(), Jo([]), pi("");
          },
        }),
      kp = fD({ data: ke, value: Ge });
    return x.jsxs(x.Fragment, {
      children: [
        x.jsxs(fe, {
          store: Ot,
          classNames: Cp,
          styles: Ep,
          unstyled: l,
          size: c,
          readOnly: A,
          __staticSelector: "MultiSelect",
          onOptionSubmit: (_e) => {
            C == null || C(_e),
              pi(""),
              Ot.updateSelectedOptionIndex("selected"),
              Ge.includes(Nt[_e].value)
                ? (Jo(Ge.filter((Qa) => Qa !== Nt[_e].value)),
                  Ut == null || Ut(Nt[_e].value))
                : Ge.length < rt && Jo([...Ge, Nt[_e].value]);
          },
          ...E,
          children: [
            x.jsx(fe.DropdownTarget, {
              children: x.jsx($l, {
                ...E1,
                __staticSelector: "MultiSelect",
                classNames: Cp,
                styles: Ep,
                unstyled: l,
                size: c,
                className: o,
                style: s,
                variant: p,
                disabled: j,
                radius: k,
                rightSection:
                  $ ||
                  Xa ||
                  x.jsx(fe.Chevron, { size: c, error: ye, unstyled: l }),
                rightSectionPointerEvents: I || (Xa ? "all" : "none"),
                rightSectionWidth: O,
                rightSectionProps: K,
                leftSection: J,
                leftSectionWidth: ee,
                leftSectionPointerEvents: ne,
                leftSectionProps: te,
                inputContainer: me,
                inputWrapperOrder: oe,
                withAsterisk: le,
                labelProps: Z,
                descriptionProps: ge,
                errorProps: ce,
                wrapperProps: se,
                description: je,
                label: Ie,
                error: ye,
                multiline: !0,
                withErrorStyles: Se,
                __stylesApiProps: {
                  ...n,
                  rightSectionPointerEvents: I || (Xa ? "all" : "none"),
                  multiline: !0,
                },
                pointer: !Te,
                onClick: () => (Te ? Ot.openDropdown() : Ot.toggleDropdown()),
                "data-expanded": Ot.dropdownOpened || void 0,
                id: Qo,
                required: cn,
                mod: Ht,
                children: x.jsxs(Ks.Group, {
                  disabled: j,
                  unstyled: l,
                  ...Ga("pillsList"),
                  children: [
                    D1,
                    x.jsx(fe.EventsTarget, {
                      autoComplete: k1,
                      children: x.jsx($l.Field, {
                        ..._1,
                        ref: t,
                        id: Qo,
                        placeholder: Tt,
                        type: !Te && !Tt ? "hidden" : "visible",
                        ...Ga("inputField"),
                        unstyled: l,
                        onFocus: (_e) => {
                          P == null || P(_e), Te && Ot.openDropdown();
                        },
                        onBlur: (_e) => {
                          T == null || T(_e), Ot.closeDropdown(), pi("");
                        },
                        onKeyDown: R1,
                        value: fi,
                        onChange: (_e) => {
                          pi(_e.currentTarget.value),
                            Te && Ot.openDropdown(),
                            b && Ot.selectFirstOption();
                        },
                        disabled: j,
                        readOnly: A || !Te,
                        pointer: !Te,
                      }),
                    }),
                  ],
                }),
              }),
            }),
            x.jsx(ew, {
              data: ie ? kp : ke,
              hidden: A || j,
              filter: _,
              search: fi,
              limit: D,
              hiddenWhenEmpty:
                !Te || !Le || (ie && kp.length === 0 && fi.trim().length === 0),
              withScrollArea: L,
              maxDropdownHeight: N,
              filterOptions: Te,
              value: Ge,
              checkIconPosition: re,
              withCheckIcon: W,
              nothingFoundMessage: Le,
              unstyled: l,
              labelId: Ie ? `${Qo}-label` : void 0,
              "aria-label": Ie ? void 0 : di["aria-label"],
              renderOption: Ka,
              scrollAreaProps: qa,
            }),
          ],
        }),
        x.jsx(fe.HiddenInput, {
          name: Ae,
          valuesDivider: yr,
          value: Ge,
          form: Pt,
          disabled: j,
          ...qe,
        }),
      ],
    });
  });
Zf.classes = { ...Cn.classes, ...fe.classes };
Zf.displayName = "@mantine/core/MultiSelect";
const mD = {
    searchable: !1,
    withCheckIcon: !0,
    allowDeselect: !0,
    checkIconPosition: "left",
  },
  ep = X((e, t) => {
    const n = U("Select", mD, e),
      {
        classNames: r,
        styles: o,
        unstyled: s,
        vars: i,
        dropdownOpened: l,
        defaultDropdownOpened: a,
        onDropdownClose: c,
        onDropdownOpen: u,
        onFocus: d,
        onBlur: f,
        onClick: m,
        onChange: p,
        data: h,
        value: S,
        defaultValue: v,
        selectFirstOptionOnChange: w,
        onOptionSubmit: g,
        comboboxProps: b,
        readOnly: C,
        disabled: E,
        filter: _,
        limit: D,
        withScrollArea: L,
        maxDropdownHeight: N,
        size: M,
        searchable: B,
        rightSection: V,
        checkIconPosition: A,
        withCheckIcon: j,
        nothingFoundMessage: P,
        name: T,
        form: R,
        searchValue: k,
        defaultSearchValue: $,
        onSearchChange: O,
        allowDeselect: I,
        error: K,
        rightSectionPointerEvents: J,
        id: ee,
        clearable: ne,
        clearButtonProps: te,
        hiddenInputProps: me,
        renderOption: oe,
        onClear: le,
        autoComplete: Z,
        scrollAreaProps: ge,
        ...ce
      } = n,
      se = y.useMemo(() => z0(h), [h]),
      je = y.useMemo(() => jf(se), [se]),
      Ie = Wr(ee),
      [ye, rt, Te] = $n({
        value: S,
        defaultValue: v,
        finalValue: null,
        onChange: p,
      }),
      Le = typeof ye == "string" ? je[ye] : void 0,
      [W, re] = $n({
        value: k,
        defaultValue: $,
        finalValue: Le ? Le.label : "",
        onChange: O,
      }),
      ie = Uf({
        opened: l,
        defaultOpened: a,
        onDropdownOpen: () => {
          u == null || u(),
            ie.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
        },
        onDropdownClose: () => {
          c == null || c(), ie.resetSelectedOption();
        },
      }),
      { resolvedClassNames: Se, resolvedStyles: Ae } = Bo({
        props: n,
        styles: o,
        classNames: r,
      });
    y.useEffect(() => {
      w && ie.selectFirstOption();
    }, [w, ye]),
      y.useEffect(() => {
        S === null && re(""), typeof S == "string" && Le && re(Le.label);
      }, [S, Le]);
    const Pt =
      ne &&
      !!ye &&
      !E &&
      !C &&
      x.jsx(fe.ClearButton, {
        size: M,
        ...te,
        onClear: () => {
          rt(null, null), re(""), le == null || le();
        },
      });
    return x.jsxs(x.Fragment, {
      children: [
        x.jsxs(fe, {
          store: ie,
          __staticSelector: "Select",
          classNames: Se,
          styles: Ae,
          unstyled: s,
          readOnly: C,
          onOptionSubmit: (be) => {
            g == null || g(be);
            const Fe = I && je[be].value === ye ? null : je[be],
              an = Fe ? Fe.value : null;
            rt(an, Fe),
              !Te &&
                re(
                  (typeof an == "string" && (Fe == null ? void 0 : Fe.label)) ||
                    ""
                ),
              ie.closeDropdown();
          },
          size: M,
          ...b,
          children: [
            x.jsx(fe.Target, {
              targetType: B ? "input" : "button",
              autoComplete: Z,
              children: x.jsx(Cn, {
                id: Ie,
                ref: t,
                rightSection:
                  V ||
                  Pt ||
                  x.jsx(fe.Chevron, { size: M, error: K, unstyled: s }),
                rightSectionPointerEvents: J || (Pt ? "all" : "none"),
                ...ce,
                size: M,
                __staticSelector: "Select",
                disabled: E,
                readOnly: C || !B,
                value: W,
                onChange: (be) => {
                  re(be.currentTarget.value),
                    ie.openDropdown(),
                    w && ie.selectFirstOption();
                },
                onFocus: (be) => {
                  B && ie.openDropdown(), d == null || d(be);
                },
                onBlur: (be) => {
                  var Fe;
                  B && ie.closeDropdown(),
                    re(
                      (ye != null &&
                        ((Fe = je[ye]) == null ? void 0 : Fe.label)) ||
                        ""
                    ),
                    f == null || f(be);
                },
                onClick: (be) => {
                  B ? ie.openDropdown() : ie.toggleDropdown(),
                    m == null || m(be);
                },
                classNames: Se,
                styles: Ae,
                unstyled: s,
                pointer: !B,
                error: K,
              }),
            }),
            x.jsx(ew, {
              data: se,
              hidden: C || E,
              filter: _,
              search: W,
              limit: D,
              hiddenWhenEmpty: !B || !P,
              withScrollArea: L,
              maxDropdownHeight: N,
              filterOptions: B && (Le == null ? void 0 : Le.label) !== W,
              value: ye,
              checkIconPosition: A,
              withCheckIcon: j,
              nothingFoundMessage: P,
              unstyled: s,
              labelId: ce.label ? `${Ie}-label` : void 0,
              "aria-label": ce.label ? void 0 : ce["aria-label"],
              renderOption: oe,
              scrollAreaProps: ge,
            }),
          ],
        }),
        x.jsx(fe.HiddenInput, {
          value: ye,
          name: T,
          form: R,
          disabled: E,
          ...me,
        }),
      ],
    });
  });
ep.classes = { ...Cn.classes, ...fe.classes };
ep.displayName = "@mantine/core/Select";
const hD = {},
  Ra = X((e, t) => {
    const n = U("TextInput", hD, e);
    return x.jsx(Cn, {
      component: "input",
      ref: t,
      ...n,
      __staticSelector: "TextInput",
    });
  });
Ra.classes = Cn.classes;
Ra.displayName = "@mantine/core/TextInput";
function gD(e) {
  return function ({ isLoading: n, ...r }) {
    return n ? x.jsx("div", { children: "Loading..." }) : x.jsx(e, { ...r });
  };
}
function yD(e) {
  return function ({ error: n, ...r }) {
    return n
      ? x.jsxs("div", { children: ["Error: ", n.message] })
      : x.jsx(e, { ...r });
  };
}
var aw = { exports: {} },
  vD = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",
  wD = vD,
  xD = wD;
function cw() {}
function uw() {}
uw.resetWarningCache = cw;
var SD = function () {
  function e(r, o, s, i, l, a) {
    if (a !== xD) {
      var c = new Error(
        "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
      );
      throw ((c.name = "Invariant Violation"), c);
    }
  }
  e.isRequired = e;
  function t() {
    return e;
  }
  var n = {
    array: e,
    bigint: e,
    bool: e,
    func: e,
    number: e,
    object: e,
    string: e,
    symbol: e,
    any: e,
    arrayOf: t,
    element: e,
    elementType: e,
    instanceOf: t,
    node: e,
    objectOf: t,
    oneOf: t,
    oneOfType: t,
    shape: t,
    exact: t,
    checkPropTypes: uw,
    resetWarningCache: cw,
  };
  return (n.PropTypes = n), n;
};
aw.exports = SD();
var bD = aw.exports;
const Y = zr(bD);
function CD(e) {
  if (!/^[0-9a-zA-Z-]+$/.test(e))
    throw new Error(
      `[@mantine/use-form] Form name "${e}" is invalid, it should contain only letters, numbers and dashes`
    );
}
const ED = typeof window < "u" ? y.useLayoutEffect : y.useEffect;
function Ue(e, t) {
  ED(() => {
    if (e)
      return (
        window.addEventListener(e, t), () => window.removeEventListener(e, t)
      );
  }, [e]);
}
function kD(e, t) {
  e && CD(e),
    Ue(`mantine-form:${e}:set-field-value`, (n) =>
      t.setFieldValue(n.detail.path, n.detail.value)
    ),
    Ue(`mantine-form:${e}:set-values`, (n) => t.setValues(n.detail)),
    Ue(`mantine-form:${e}:set-initial-values`, (n) =>
      t.setInitialValues(n.detail)
    ),
    Ue(`mantine-form:${e}:set-errors`, (n) => t.setErrors(n.detail)),
    Ue(`mantine-form:${e}:set-field-error`, (n) =>
      t.setFieldError(n.detail.path, n.detail.error)
    ),
    Ue(`mantine-form:${e}:clear-field-error`, (n) =>
      t.clearFieldError(n.detail)
    ),
    Ue(`mantine-form:${e}:clear-errors`, t.clearErrors),
    Ue(`mantine-form:${e}:reset`, t.reset),
    Ue(`mantine-form:${e}:validate`, t.validate),
    Ue(`mantine-form:${e}:validate-field`, (n) => t.validateField(n.detail)),
    Ue(`mantine-form:${e}:reorder-list-item`, (n) =>
      t.reorderListItem(n.detail.path, n.detail.payload)
    ),
    Ue(`mantine-form:${e}:remove-list-item`, (n) =>
      t.removeListItem(n.detail.path, n.detail.index)
    ),
    Ue(`mantine-form:${e}:insert-list-item`, (n) =>
      t.insertListItem(n.detail.path, n.detail.item, n.detail.index)
    ),
    Ue(`mantine-form:${e}:set-dirty`, (n) => t.setDirty(n.detail)),
    Ue(`mantine-form:${e}:set-touched`, (n) => t.setTouched(n.detail)),
    Ue(`mantine-form:${e}:reset-dirty`, (n) => t.resetDirty(n.detail)),
    Ue(`mantine-form:${e}:reset-touched`, t.resetTouched);
}
function dw(e) {
  return (t) => {
    if (!t) e(t);
    else if (typeof t == "function") e(t);
    else if (typeof t == "object" && "nativeEvent" in t) {
      const { currentTarget: n } = t;
      n instanceof HTMLInputElement
        ? n.type === "checkbox"
          ? e(n.checked)
          : e(n.value)
        : (n instanceof HTMLTextAreaElement ||
            n instanceof HTMLSelectElement) &&
          e(n.value);
    } else e(t);
  };
}
function Yu(e) {
  return e === null || typeof e != "object"
    ? {}
    : Object.keys(e).reduce((t, n) => {
        const r = e[n];
        return r != null && r !== !1 && (t[n] = r), t;
      }, {});
}
function _D(e) {
  const [t, n] = y.useState(Yu(e)),
    r = y.useCallback((l) => {
      n((a) => Yu(typeof l == "function" ? l(a) : l));
    }, []),
    o = y.useCallback(() => n({}), []),
    s = y.useCallback(
      (l) => {
        t[l] !== void 0 &&
          r((a) => {
            const c = { ...a };
            return delete c[l], c;
          });
      },
      [t]
    ),
    i = y.useCallback(
      (l, a) => {
        a == null || a === !1
          ? s(l)
          : t[l] !== a && r((c) => ({ ...c, [l]: a }));
      },
      [t]
    );
  return {
    errorsState: t,
    setErrors: r,
    clearErrors: o,
    setFieldError: i,
    clearFieldError: s,
  };
}
function fw(e, t) {
  if (t === null || typeof t != "object") return {};
  const n = { ...t };
  return (
    Object.keys(t).forEach((r) => {
      r.includes(`${String(e)}.`) && delete n[r];
    }),
    n
  );
}
function Dh(e, t) {
  const n = e.substring(t.length + 1).split(".")[0];
  return parseInt(n, 10);
}
function Ph(e, t, n, r) {
  if (t === void 0) return n;
  const o = `${String(e)}`;
  let s = n;
  r === -1 && (s = fw(`${o}.${t}`, s));
  const i = { ...s },
    l = new Set();
  return (
    Object.entries(s)
      .filter(([a]) => {
        if (!a.startsWith(`${o}.`)) return !1;
        const c = Dh(a, o);
        return Number.isNaN(c) ? !1 : c >= t;
      })
      .forEach(([a, c]) => {
        const u = Dh(a, o),
          d = a.replace(`${o}.${u}`, `${o}.${u + r}`);
        (i[d] = c), l.add(d), l.has(a) || delete i[a];
      }),
    i
  );
}
function RD(e, { from: t, to: n }, r) {
  const o = `${e}.${t}`,
    s = `${e}.${n}`,
    i = { ...r };
  return (
    Object.keys(r).every((l) => {
      let a, c;
      if (
        (l.startsWith(o) && ((a = l), (c = l.replace(o, s))),
        l.startsWith(s) && ((a = l.replace(s, o)), (c = l)),
        a && c)
      ) {
        const u = i[a],
          d = i[c];
        return (
          d === void 0 ? delete i[a] : (i[a] = d),
          u === void 0 ? delete i[c] : (i[c] = u),
          !1
        );
      }
      return !0;
    }),
    i
  );
}
function Th(e, t, n) {
  typeof n.value == "object" && (n.value = po(n.value)),
    !n.enumerable ||
    n.get ||
    n.set ||
    !n.configurable ||
    !n.writable ||
    t === "__proto__"
      ? Object.defineProperty(e, t, n)
      : (e[t] = n.value);
}
function po(e) {
  if (typeof e != "object") return e;
  var t = 0,
    n,
    r,
    o,
    s = Object.prototype.toString.call(e);
  if (
    (s === "[object Object]"
      ? (o = Object.create(e.__proto__ || null))
      : s === "[object Array]"
      ? (o = Array(e.length))
      : s === "[object Set]"
      ? ((o = new Set()),
        e.forEach(function (i) {
          o.add(po(i));
        }))
      : s === "[object Map]"
      ? ((o = new Map()),
        e.forEach(function (i, l) {
          o.set(po(l), po(i));
        }))
      : s === "[object Date]"
      ? (o = new Date(+e))
      : s === "[object RegExp]"
      ? (o = new RegExp(e.source, e.flags))
      : s === "[object DataView]"
      ? (o = new e.constructor(po(e.buffer)))
      : s === "[object ArrayBuffer]"
      ? (o = e.slice(0))
      : s.slice(-6) === "Array]" && (o = new e.constructor(e)),
    o)
  ) {
    for (r = Object.getOwnPropertySymbols(e); t < r.length; t++)
      Th(o, r[t], Object.getOwnPropertyDescriptor(e, r[t]));
    for (t = 0, r = Object.getOwnPropertyNames(e); t < r.length; t++)
      (Object.hasOwnProperty.call(o, (n = r[t])) && o[n] === e[n]) ||
        Th(o, n, Object.getOwnPropertyDescriptor(e, n));
  }
  return o || e;
}
function pw(e) {
  return typeof e != "string" ? [] : e.split(".");
}
function mt(e, t) {
  const n = pw(e);
  if (n.length === 0 || typeof t != "object" || t === null) return;
  let r = t[n[0]];
  for (let o = 1; o < n.length && r !== void 0; o += 1) r = r[n[o]];
  return r;
}
function Da(e, t, n) {
  const r = pw(e);
  if (r.length === 0) return n;
  const o = po(n);
  if (r.length === 1) return (o[r[0]] = t), o;
  let s = o[r[0]];
  for (let i = 1; i < r.length - 1; i += 1) {
    if (s === void 0) return o;
    s = s[r[i]];
  }
  return (s[r[r.length - 1]] = t), o;
}
function DD(e, { from: t, to: n }, r) {
  const o = mt(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o],
    i = o[t];
  return s.splice(t, 1), s.splice(n, 0, i), Da(e, s, r);
}
function PD(e, t, n, r) {
  const o = mt(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o];
  return s.splice(typeof n == "number" ? n : s.length, 0, t), Da(e, s, r);
}
function TD(e, t, n) {
  const r = mt(e, n);
  return Array.isArray(r)
    ? Da(
        e,
        r.filter((o, s) => s !== t),
        n
      )
    : n;
}
function ND({ $values: e, $errors: t, $status: n }) {
  const r = y.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => RD(i, l, a)),
        e.setValues({ values: DD(i, l, e.refValues.current), updateState: !0 });
    }, []),
    o = y.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => Ph(i, l, a, -1)),
        e.setValues({ values: TD(i, l, e.refValues.current), updateState: !0 });
    }, []),
    s = y.useCallback((i, l, a) => {
      n.clearFieldDirty(i),
        t.setErrors((c) => Ph(i, a, c, 1)),
        e.setValues({
          values: PD(i, l, a, e.refValues.current),
          updateState: !0,
        });
    }, []);
  return { reorderListItem: r, removeListItem: o, insertListItem: s };
}
var OD = function e(t, n) {
  if (t === n) return !0;
  if (t && n && typeof t == "object" && typeof n == "object") {
    if (t.constructor !== n.constructor) return !1;
    var r, o, s;
    if (Array.isArray(t)) {
      if (((r = t.length), r != n.length)) return !1;
      for (o = r; o-- !== 0; ) if (!e(t[o], n[o])) return !1;
      return !0;
    }
    if (t.constructor === RegExp)
      return t.source === n.source && t.flags === n.flags;
    if (t.valueOf !== Object.prototype.valueOf)
      return t.valueOf() === n.valueOf();
    if (t.toString !== Object.prototype.toString)
      return t.toString() === n.toString();
    if (((s = Object.keys(t)), (r = s.length), r !== Object.keys(n).length))
      return !1;
    for (o = r; o-- !== 0; )
      if (!Object.prototype.hasOwnProperty.call(n, s[o])) return !1;
    for (o = r; o-- !== 0; ) {
      var i = s[o];
      if (!e(t[i], n[i])) return !1;
    }
    return !0;
  }
  return t !== t && n !== n;
};
const Fc = zr(OD);
function Fi(e, t) {
  const n = Object.keys(e);
  if (typeof t == "string") {
    const r = n.filter((o) => o.startsWith(`${t}.`));
    return e[t] || r.some((o) => e[o]) || !1;
  }
  return n.some((r) => e[r]);
}
function jD({ initialDirty: e, initialTouched: t, mode: n, $values: r }) {
  const [o, s] = y.useState(t),
    [i, l] = y.useState(e),
    a = y.useRef(t),
    c = y.useRef(e),
    u = y.useCallback((C) => {
      const E = typeof C == "function" ? C(a.current) : C;
      (a.current = E), n === "controlled" && s(E);
    }, []),
    d = y.useCallback((C) => {
      const E = typeof C == "function" ? C(c.current) : C;
      (c.current = E), n === "controlled" && l(E);
    }, []),
    f = y.useCallback(() => u({}), []),
    m = (C) => {
      const E = C ? { ...C, ...r.refValues.current } : r.refValues.current;
      r.setValuesSnapshot(E), d({});
    },
    p = y.useCallback((C, E) => {
      u((_) => (Fi(_, C) === E ? _ : { ..._, [C]: E }));
    }, []),
    h = y.useCallback((C, E) => {
      d((_) => (Fi(_, C) === E ? _ : { ..._, [C]: E }));
    }, []),
    S = y.useCallback((C) => Fi(a.current, C), []),
    v = y.useCallback(
      (C) =>
        d((E) => {
          if (typeof C != "string") return E;
          const _ = fw(C, E);
          return delete _[C], Fc(_, E) ? E : _;
        }),
      []
    ),
    w = y.useCallback((C) => {
      if (C) {
        const _ = mt(C, c.current);
        if (typeof _ == "boolean") return _;
        const D = mt(C, r.refValues.current),
          L = mt(C, r.valuesSnapshot.current);
        return !Fc(D, L);
      }
      return Object.keys(c.current).length > 0
        ? Fi(c.current)
        : !Fc(r.refValues.current, r.valuesSnapshot.current);
    }, []),
    g = y.useCallback(() => c.current, []),
    b = y.useCallback(() => a.current, []);
  return {
    touchedState: o,
    dirtyState: i,
    touchedRef: a,
    dirtyRef: c,
    setTouched: u,
    setDirty: d,
    resetDirty: m,
    resetTouched: f,
    isTouched: S,
    setFieldTouched: p,
    setFieldDirty: h,
    setTouchedState: s,
    setDirtyState: l,
    clearFieldDirty: v,
    isDirty: w,
    getDirty: g,
    getTouched: b,
  };
}
function $D({ initialValues: e, onValuesChange: t, mode: n }) {
  const r = y.useRef(!1),
    [o, s] = y.useState(e || {}),
    i = y.useRef(o),
    l = y.useRef(o),
    a = y.useCallback(
      ({
        values: p,
        subscribers: h,
        updateState: S = !0,
        mergeWithPreviousValues: v = !0,
      }) => {
        const w = i.current,
          g = p instanceof Function ? p(i.current) : p,
          b = v ? { ...w, ...g } : g;
        (i.current = b),
          S && s(b),
          t == null || t(b, w),
          h == null ||
            h
              .filter(Boolean)
              .forEach((C) => C({ updatedValues: b, previousValues: w }));
      },
      [t]
    ),
    c = y.useCallback((p) => {
      var v;
      const h = mt(p.path, i.current),
        S = p.value instanceof Function ? p.value(h) : p.value;
      if (h !== S) {
        const w = i.current,
          g = Da(p.path, S, i.current);
        a({ values: g, updateState: p.updateState }),
          (v = p.subscribers) == null ||
            v
              .filter(Boolean)
              .forEach((b) =>
                b({ path: p.path, updatedValues: g, previousValues: w })
              );
      }
    }, []),
    u = y.useCallback((p) => {
      l.current = p;
    }, []),
    d = y.useCallback((p, h) => {
      r.current ||
        ((r.current = !0),
        a({ values: p, updateState: n === "controlled" }),
        u(p),
        h());
    }, []),
    f = y.useCallback(() => {
      a({ values: l.current, updateState: !0, mergeWithPreviousValues: !1 });
    }, []),
    m = y.useCallback(() => i.current, []);
  return {
    initialized: r,
    stateValues: o,
    refValues: i,
    valuesSnapshot: l,
    setValues: a,
    setFieldValue: c,
    resetValues: f,
    setValuesSnapshot: u,
    initialize: d,
    getValues: m,
  };
}
function LD({ $status: e }) {
  const t = y.useRef({}),
    n = y.useCallback((o, s) => {
      y.useEffect(
        () => (
          (t.current[o] = t.current[o] || []),
          t.current[o].push(s),
          () => {
            t.current[o] = t.current[o].filter((i) => i !== s);
          }
        ),
        [s]
      );
    }, []),
    r = y.useCallback(
      (o) =>
        t.current[o]
          ? t.current[o].map(
              (s) => (i) =>
                s({
                  previousValue: mt(o, i.previousValues),
                  value: mt(o, i.updatedValues),
                  touched: e.isTouched(o),
                  dirty: e.isDirty(o),
                })
            )
          : [],
      []
    );
  return { subscribers: t, watch: n, getFieldSubscribers: r };
}
function Nh(e) {
  const t = Yu(e);
  return { hasErrors: Object.keys(t).length > 0, errors: t };
}
function Ku(e, t, n = "", r = {}) {
  return typeof e != "object" || e === null
    ? r
    : Object.keys(e).reduce((o, s) => {
        const i = e[s],
          l = `${n === "" ? "" : `${n}.`}${s}`,
          a = mt(l, t);
        let c = !1;
        return (
          typeof i == "function" && (o[l] = i(a, t, l)),
          typeof i == "object" &&
            Array.isArray(a) &&
            ((c = !0), a.forEach((u, d) => Ku(i, t, `${l}.${d}`, o))),
          typeof i == "object" &&
            typeof a == "object" &&
            a !== null &&
            (c || Ku(i, t, l, o)),
          o
        );
      }, r);
}
function qu(e, t) {
  return Nh(typeof e == "function" ? e(t) : Ku(e, t));
}
function Mi(e, t, n) {
  if (typeof e != "string") return { hasError: !1, error: null };
  const r = qu(t, n),
    o = Object.keys(r.errors).find((s) =>
      e.split(".").every((i, l) => i === s.split(".")[l])
    );
  return { hasError: !!o, error: o ? r.errors[o] : null };
}
const AD = "__MANTINE_FORM_INDEX__";
function Gu(e, t) {
  return t
    ? typeof t == "boolean"
      ? t
      : Array.isArray(t)
      ? t.includes(e.replace(/[.][0-9]/g, `.${AD}`))
      : !1
    : !1;
}
function FD({
  name: e,
  mode: t = "controlled",
  initialValues: n,
  initialErrors: r = {},
  initialDirty: o = {},
  initialTouched: s = {},
  clearInputErrorOnChange: i = !0,
  validateInputOnChange: l = !1,
  validateInputOnBlur: a = !1,
  onValuesChange: c,
  transformValues: u = (m) => m,
  enhanceGetInputProps: d,
  validate: f,
} = {}) {
  const m = _D(r),
    p = $D({ initialValues: n, onValuesChange: c, mode: t }),
    h = jD({ initialDirty: o, initialTouched: s, $values: p, mode: t }),
    S = ND({ $values: p, $errors: m, $status: h }),
    v = LD({ $status: h }),
    [w, g] = y.useState(0),
    [b, C] = y.useState({}),
    E = y.useCallback(() => {
      p.resetValues(),
        m.clearErrors(),
        h.resetDirty(),
        h.resetTouched(),
        t === "uncontrolled" && g((k) => k + 1);
    }, []),
    _ = y.useCallback((k) => {
      p.initialize(k, () => t === "uncontrolled" && g(($) => $ + 1));
    }, []),
    D = y.useCallback(
      (k, $, O) => {
        const I = Gu(k, l);
        h.clearFieldDirty(k),
          h.setFieldTouched(k, !0),
          !I && i && m.clearFieldError(k),
          p.setFieldValue({
            path: k,
            value: $,
            updateState: t === "controlled",
            subscribers: [
              ...v.getFieldSubscribers(k),
              I
                ? (K) => {
                    const J = Mi(k, f, K.updatedValues);
                    J.hasError
                      ? m.setFieldError(k, J.error)
                      : m.clearFieldError(k);
                  }
                : null,
              (O == null ? void 0 : O.forceUpdate) !== !1 && t !== "controlled"
                ? () => C((K) => ({ ...K, [k]: (K[k] || 0) + 1 }))
                : null,
            ],
          });
      },
      [c, f]
    ),
    L = y.useCallback(
      (k) => {
        const $ = p.refValues.current;
        p.setValues({ values: k, updateState: t === "controlled" }),
          i && m.clearErrors(),
          t === "uncontrolled" && g((O) => O + 1),
          Object.keys(v.subscribers.current).forEach((O) => {
            const I = mt(O, p.refValues.current),
              K = mt(O, $);
            I !== K &&
              v
                .getFieldSubscribers(O)
                .forEach((J) =>
                  J({ previousValues: $, updatedValues: p.refValues.current })
                );
          });
      },
      [c, i]
    ),
    N = y.useCallback(() => {
      const k = qu(f, p.refValues.current);
      return m.setErrors(k.errors), k;
    }, [f]),
    M = y.useCallback(
      (k) => {
        const $ = Mi(k, f, p.refValues.current);
        return (
          $.hasError ? m.setFieldError(k, $.error) : m.clearFieldError(k), $
        );
      },
      [f]
    ),
    B = (
      k,
      { type: $ = "input", withError: O = !0, withFocus: I = !0, ...K } = {}
    ) => {
      const ee = { onChange: dw((ne) => D(k, ne, { forceUpdate: !1 })) };
      return (
        O && (ee.error = m.errorsState[k]),
        $ === "checkbox"
          ? (ee[t === "controlled" ? "checked" : "defaultChecked"] = mt(
              k,
              p.refValues.current
            ))
          : (ee[t === "controlled" ? "value" : "defaultValue"] = mt(
              k,
              p.refValues.current
            )),
        I &&
          ((ee.onFocus = () => h.setFieldTouched(k, !0)),
          (ee.onBlur = () => {
            if (Gu(k, a)) {
              const ne = Mi(k, f, p.refValues.current);
              ne.hasError ? m.setFieldError(k, ne.error) : m.clearFieldError(k);
            }
          })),
        Object.assign(
          ee,
          d == null
            ? void 0
            : d({
                inputProps: ee,
                field: k,
                options: { type: $, withError: O, withFocus: I, ...K },
                form: R,
              })
        )
      );
    },
    V = (k, $) => (O) => {
      O == null || O.preventDefault();
      const I = N();
      I.hasErrors
        ? $ == null || $(I.errors, p.refValues.current, O)
        : k == null || k(u(p.refValues.current), O);
    },
    A = (k) => u(k || p.refValues.current),
    j = y.useCallback((k) => {
      k.preventDefault(), E();
    }, []),
    P = y.useCallback(
      (k) =>
        k
          ? !Mi(k, f, p.refValues.current).hasError
          : !qu(f, p.refValues.current).hasErrors,
      [f]
    ),
    T = (k) => `${w}-${k}-${b[k] || 0}`,
    R = {
      watch: v.watch,
      initialized: p.initialized.current,
      values: p.stateValues,
      getValues: p.getValues,
      setInitialValues: p.setValuesSnapshot,
      initialize: _,
      setValues: L,
      setFieldValue: D,
      errors: m.errorsState,
      setErrors: m.setErrors,
      setFieldError: m.setFieldError,
      clearFieldError: m.clearFieldError,
      clearErrors: m.clearErrors,
      resetDirty: h.resetDirty,
      setTouched: h.setTouched,
      setDirty: h.setDirty,
      isTouched: h.isTouched,
      resetTouched: h.resetTouched,
      isDirty: h.isDirty,
      getTouched: h.getTouched,
      getDirty: h.getDirty,
      reorderListItem: S.reorderListItem,
      insertListItem: S.insertListItem,
      removeListItem: S.removeListItem,
      reset: E,
      validate: N,
      validateField: M,
      getInputProps: B,
      onSubmit: V,
      onReset: j,
      isValid: P,
      getTransformedValues: A,
      key: T,
    };
  return kD(e, R), R;
}
function MD({
  mode: e = "controlled",
  clearErrorOnChange: t = !0,
  initialValue: n,
  initialError: r = null,
  initialTouched: o = !1,
  onValueChange: s,
  validateOnChange: i = !1,
  validateOnBlur: l = !1,
  validate: a,
  resolveValidationError: c,
  type: u = "input",
}) {
  const [d, f] = y.useState(n),
    m = y.useRef(d),
    [p, h] = y.useState(0),
    [S, v] = y.useState(r || null),
    w = y.useRef(o || !1),
    [, g] = y.useState(w.current),
    [b, C] = y.useState(!1),
    E = y.useMemo(() => c || ((P) => P), [c]),
    _ = y.useCallback((P, { updateState: T = e === "controlled" } = {}) => {
      (w.current = P), T && g(P);
    }, []),
    D = y.useCallback(
      async (
        P,
        {
          updateKey: T = e === "uncontrolled",
          updateState: R = e === "controlled",
        } = {}
      ) => {
        m.current !== P &&
          ((m.current = P),
          s == null || s(P),
          t && S !== null && v(null),
          R && f(P),
          T && h((k) => k + 1),
          i && V());
      },
      [S, t]
    ),
    L = y.useCallback(() => {
      D(n), v(null), _(!1);
    }, [n]),
    N = y.useCallback(() => m.current, []),
    M = y.useCallback(() => w.current, []),
    B = y.useCallback(() => m.current !== n, [n]),
    V = y.useCallback(async () => {
      const P = a == null ? void 0 : a(m.current);
      if (P instanceof Promise) {
        C(!0);
        try {
          const T = await P;
          C(!1), v(T);
        } catch (T) {
          C(!1);
          const R = E(T);
          return v(R), R;
        }
      } else return v(P), P;
    }, []),
    A = ({ withError: P = !0, withFocus: T = !0 } = {}) => {
      const k = { onChange: dw(($) => D($, { updateKey: !1 })) };
      return (
        P && (k.error = S),
        u === "checkbox"
          ? (k[e === "controlled" ? "checked" : "defaultChecked"] = m.current)
          : (k[e === "controlled" ? "value" : "defaultValue"] = m.current),
        T &&
          ((k.onFocus = () => {
            _(!0);
          }),
          (k.onBlur = () => {
            Gu("", !!l) && V();
          })),
        k
      );
    },
    j = y.useCallback(() => _(!1), []);
  return {
    key: p,
    getValue: N,
    setValue: D,
    reset: L,
    getInputProps: A,
    isValidating: b,
    validate: V,
    error: S,
    setError: v,
    isTouched: M,
    isDirty: B,
    resetTouched: j,
  };
}
const tp = (e) => {
  const {
    title: t,
    description: n,
    form: r,
    options: o,
    default_value: s,
    field_id: i,
  } = e;
  console.log(o);
  var l = s ? o.map((f) => f.option).filter((f) => f == s) : null;
  const [a, c] = y.useState(l ? l[0] : o[0].option);
  r.setFieldValue(i, a);
  const [u, { toggle: d }] = Vs(!1);
  return x.jsxs("div", {
    className: "collapsible-selector-container",
    children: [
      t && x.jsx("label", { children: t }),
      n && x.jsx("label", { children: n }),
      x.jsx("div", {
        className: "container",
        children: x.jsxs("div", {
          className: "multi-select-row row btn-style",
          onClick: d,
          children: [
            x.jsxs("p", {
              className: "col my-2 row-title",
              children: [x.jsx("i", { class: "fa fa-balance-scale mr-2" }), a],
            }),
            x.jsx("p", {
              className: "clickable-text col-auto text-right my-2",
              children: "change",
            }),
          ],
        }),
      }),
      x.jsx(Zv, {
        className: "container",
        in: u,
        transitionDuration: 100,
        transitionTimingFunction: "linear",
        children: o.map((f) => {
          console.log(f);
          const [m, { open: p, close: h }] = Vs(!1),
            S = function () {
              c(f.option);
            };
          return x.jsxs("div", {
            className: "multi-select-row row clickable-row",
            children: [
              x.jsx("p", {
                className: "col my-2 row-title",
                onClick: S,
                children: f.option,
              }),
              (f.description || f.help_link) &&
                x.jsxs(x.Fragment, {
                  children: [
                    x.jsxs(on, {
                      opened: m,
                      onClose: h,
                      title: f.option,
                      centered: !0,
                      size: "auto",
                      children: [
                        x.jsx("div", {
                          className: "modal-dialog-body",
                          children:
                            f.description &&
                            x.jsx(kr, { children: f.description }),
                        }),
                        x.jsxs("div", {
                          className: "modal-dialog-footer container p-0",
                          children: [
                            f.help_link &&
                              x.jsx("div", {
                                className: "row",
                                children: x.jsx("div", {
                                  className: "col-12",
                                  children: x.jsx("a", {
                                    href: f.help_link,
                                    className:
                                      "btn btn-light-blue-inverted btn-block",
                                    children: "More detail",
                                  }),
                                }),
                              }),
                            x.jsx("div", {
                              className: "row",
                              children: x.jsx("div", {
                                className: "col-12",
                                children: x.jsx("p", {
                                  className:
                                    "btn btn-light-blue-inverted btn-block",
                                  onClick: () => {
                                    S(), h();
                                  },
                                  children: "Choose this",
                                }),
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    x.jsx("div", {
                      className: "col-auto clickable-text",
                      onClick: p,
                      children: x.jsx("p", {
                        className: "text-right my-2",
                        children: "details",
                      }),
                    }),
                  ],
                }),
            ],
          });
        }),
      }),
    ],
  });
};
tp.defaultProps = {};
tp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
};
const np = (e) => {
  const {
      title: t,
      description: n,
      mandatory: r,
      form: o,
      field_id: s,
      placeholder: i,
    } = e,
    l = /^(ftp|http|https):\/\/[^ "]+$/,
    [a, c] = y.useState();
  y.useEffect(() => {
    o.setFieldValue(s, a);
  });
  const u = MD({
    initialValue: "",
    validateOnBlur: !0,
    validate: (d) => {
      if (r && d === "") return "This field is required";
      if (d !== "" && !l.test(d)) return "Please enter a valid URL";
    },
  });
  return x.jsx(
    Ra,
    {
      label: t,
      description: n,
      placeholder: i,
      required: r,
      value: a,
      onChange: (d) => c(d.currentTarget.value),
      ...u.getInputProps(),
    },
    o.key(s)
  );
};
np.defaultProps = { placeholder: "" };
np.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  mandatory: Y.bool.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const ID = new Map([
  ["aac", "audio/aac"],
  ["abw", "application/x-abiword"],
  ["arc", "application/x-freearc"],
  ["avif", "image/avif"],
  ["avi", "video/x-msvideo"],
  ["azw", "application/vnd.amazon.ebook"],
  ["bin", "application/octet-stream"],
  ["bmp", "image/bmp"],
  ["bz", "application/x-bzip"],
  ["bz2", "application/x-bzip2"],
  ["cda", "application/x-cdf"],
  ["csh", "application/x-csh"],
  ["css", "text/css"],
  ["csv", "text/csv"],
  ["doc", "application/msword"],
  [
    "docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ["eot", "application/vnd.ms-fontobject"],
  ["epub", "application/epub+zip"],
  ["gz", "application/gzip"],
  ["gif", "image/gif"],
  ["heic", "image/heic"],
  ["heif", "image/heif"],
  ["htm", "text/html"],
  ["html", "text/html"],
  ["ico", "image/vnd.microsoft.icon"],
  ["ics", "text/calendar"],
  ["jar", "application/java-archive"],
  ["jpeg", "image/jpeg"],
  ["jpg", "image/jpeg"],
  ["js", "text/javascript"],
  ["json", "application/json"],
  ["jsonld", "application/ld+json"],
  ["mid", "audio/midi"],
  ["midi", "audio/midi"],
  ["mjs", "text/javascript"],
  ["mp3", "audio/mpeg"],
  ["mp4", "video/mp4"],
  ["mpeg", "video/mpeg"],
  ["mpkg", "application/vnd.apple.installer+xml"],
  ["odp", "application/vnd.oasis.opendocument.presentation"],
  ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
  ["odt", "application/vnd.oasis.opendocument.text"],
  ["oga", "audio/ogg"],
  ["ogv", "video/ogg"],
  ["ogx", "application/ogg"],
  ["opus", "audio/opus"],
  ["otf", "font/otf"],
  ["png", "image/png"],
  ["pdf", "application/pdf"],
  ["php", "application/x-httpd-php"],
  ["ppt", "application/vnd.ms-powerpoint"],
  [
    "pptx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ["rar", "application/vnd.rar"],
  ["rtf", "application/rtf"],
  ["sh", "application/x-sh"],
  ["svg", "image/svg+xml"],
  ["swf", "application/x-shockwave-flash"],
  ["tar", "application/x-tar"],
  ["tif", "image/tiff"],
  ["tiff", "image/tiff"],
  ["ts", "video/mp2t"],
  ["ttf", "font/ttf"],
  ["txt", "text/plain"],
  ["vsd", "application/vnd.visio"],
  ["wav", "audio/wav"],
  ["weba", "audio/webm"],
  ["webm", "video/webm"],
  ["webp", "image/webp"],
  ["woff", "font/woff"],
  ["woff2", "font/woff2"],
  ["xhtml", "application/xhtml+xml"],
  ["xls", "application/vnd.ms-excel"],
  ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ["xml", "application/xml"],
  ["xul", "application/vnd.mozilla.xul+xml"],
  ["zip", "application/zip"],
  ["7z", "application/x-7z-compressed"],
  ["mkv", "video/x-matroska"],
  ["mov", "video/quicktime"],
  ["msg", "application/vnd.ms-outlook"],
]);
function li(e, t) {
  const n = zD(e);
  if (typeof n.path != "string") {
    const { webkitRelativePath: r } = e;
    Object.defineProperty(n, "path", {
      value:
        typeof t == "string"
          ? t
          : typeof r == "string" && r.length > 0
          ? r
          : e.name,
      writable: !1,
      configurable: !1,
      enumerable: !0,
    });
  }
  return n;
}
function zD(e) {
  const { name: t } = e;
  if (t && t.lastIndexOf(".") !== -1 && !e.type) {
    const r = t.split(".").pop().toLowerCase(),
      o = ID.get(r);
    o &&
      Object.defineProperty(e, "type", {
        value: o,
        writable: !1,
        configurable: !1,
        enumerable: !0,
      });
  }
  return e;
}
var Ko = (e, t, n) =>
  new Promise((r, o) => {
    var s = (a) => {
        try {
          l(n.next(a));
        } catch (c) {
          o(c);
        }
      },
      i = (a) => {
        try {
          l(n.throw(a));
        } catch (c) {
          o(c);
        }
      },
      l = (a) => (a.done ? r(a.value) : Promise.resolve(a.value).then(s, i));
    l((n = n.apply(e, t)).next());
  });
const BD = [".DS_Store", "Thumbs.db"];
function VD(e) {
  return Ko(this, null, function* () {
    return Ll(e) && HD(e.dataTransfer)
      ? KD(e.dataTransfer, e.type)
      : UD(e)
      ? WD(e)
      : Array.isArray(e) &&
        e.every((t) => "getFile" in t && typeof t.getFile == "function")
      ? YD(e)
      : [];
  });
}
function HD(e) {
  return Ll(e);
}
function UD(e) {
  return Ll(e) && Ll(e.target);
}
function Ll(e) {
  return typeof e == "object" && e !== null;
}
function WD(e) {
  return Xu(e.target.files).map((t) => li(t));
}
function YD(e) {
  return Ko(this, null, function* () {
    return (yield Promise.all(e.map((n) => n.getFile()))).map((n) => li(n));
  });
}
function KD(e, t) {
  return Ko(this, null, function* () {
    if (e.items) {
      const n = Xu(e.items).filter((o) => o.kind === "file");
      if (t !== "drop") return n;
      const r = yield Promise.all(n.map(qD));
      return Oh(mw(r));
    }
    return Oh(Xu(e.files).map((n) => li(n)));
  });
}
function Oh(e) {
  return e.filter((t) => BD.indexOf(t.name) === -1);
}
function Xu(e) {
  if (e === null) return [];
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    t.push(r);
  }
  return t;
}
function qD(e) {
  if (typeof e.webkitGetAsEntry != "function") return jh(e);
  const t = e.webkitGetAsEntry();
  return t && t.isDirectory ? hw(t) : jh(e);
}
function mw(e) {
  return e.reduce((t, n) => [...t, ...(Array.isArray(n) ? mw(n) : [n])], []);
}
function jh(e) {
  const t = e.getAsFile();
  if (!t) return Promise.reject(`${e} is not a File`);
  const n = li(t);
  return Promise.resolve(n);
}
function GD(e) {
  return Ko(this, null, function* () {
    return e.isDirectory ? hw(e) : XD(e);
  });
}
function hw(e) {
  const t = e.createReader();
  return new Promise((n, r) => {
    const o = [];
    function s() {
      t.readEntries(
        (i) =>
          Ko(this, null, function* () {
            if (i.length) {
              const l = Promise.all(i.map(GD));
              o.push(l), s();
            } else
              try {
                const l = yield Promise.all(o);
                n(l);
              } catch (l) {
                r(l);
              }
          }),
        (i) => {
          r(i);
        }
      );
    }
    s();
  });
}
function XD(e) {
  return Ko(this, null, function* () {
    return new Promise((t, n) => {
      e.file(
        (r) => {
          const o = li(r, e.fullPath);
          t(o);
        },
        (r) => {
          n(r);
        }
      );
    });
  });
}
function QD(e, t) {
  if (e && t) {
    const n = Array.isArray(t) ? t : t.split(","),
      r = e.name || "",
      o = (e.type || "").toLowerCase(),
      s = o.replace(/\/.*$/, "");
    return n.some((i) => {
      const l = i.trim().toLowerCase();
      return l.charAt(0) === "."
        ? r.toLowerCase().endsWith(l)
        : l.endsWith("/*")
        ? s === l.replace(/\/.*$/, "")
        : o === l;
    });
  }
  return !0;
}
var JD = Object.defineProperty,
  ZD = Object.defineProperties,
  eP = Object.getOwnPropertyDescriptors,
  $h = Object.getOwnPropertySymbols,
  tP = Object.prototype.hasOwnProperty,
  nP = Object.prototype.propertyIsEnumerable,
  Lh = (e, t, n) =>
    t in e
      ? JD(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  rP = (e, t) => {
    for (var n in t || (t = {})) tP.call(t, n) && Lh(e, n, t[n]);
    if ($h) for (var n of $h(t)) nP.call(t, n) && Lh(e, n, t[n]);
    return e;
  },
  oP = (e, t) => ZD(e, eP(t));
const sP = "file-invalid-type",
  iP = "file-too-large",
  lP = "file-too-small",
  aP = "too-many-files",
  cP = (e) => {
    e = Array.isArray(e) && e.length === 1 ? e[0] : e;
    const t = Array.isArray(e) ? `one of ${e.join(", ")}` : e;
    return { code: sP, message: `File type must be ${t}` };
  },
  Ah = (e) => ({
    code: iP,
    message: `File is larger than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  Fh = (e) => ({
    code: lP,
    message: `File is smaller than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  uP = { code: aP, message: "Too many files" };
function gw(e, t) {
  const n = e.type === "application/x-moz-file" || QD(e, t);
  return [n, n ? null : cP(t)];
}
function yw(e, t, n) {
  if (Sr(e.size))
    if (Sr(t) && Sr(n)) {
      if (e.size > n) return [!1, Ah(n)];
      if (e.size < t) return [!1, Fh(t)];
    } else {
      if (Sr(t) && e.size < t) return [!1, Fh(t)];
      if (Sr(n) && e.size > n) return [!1, Ah(n)];
    }
  return [!0, null];
}
function Sr(e) {
  return e != null;
}
function dP({
  files: e,
  accept: t,
  minSize: n,
  maxSize: r,
  multiple: o,
  maxFiles: s,
  validator: i,
}) {
  return (!o && e.length > 1) || (o && s >= 1 && e.length > s)
    ? !1
    : e.every((l) => {
        const [a] = gw(l, t),
          [c] = yw(l, n, r),
          u = i ? i(l) : null;
        return a && c && !u;
      });
}
function Al(e) {
  return typeof e.isPropagationStopped == "function"
    ? e.isPropagationStopped()
    : typeof e.cancelBubble < "u"
    ? e.cancelBubble
    : !1;
}
function Ii(e) {
  return e.dataTransfer
    ? Array.prototype.some.call(
        e.dataTransfer.types,
        (t) => t === "Files" || t === "application/x-moz-file"
      )
    : !!e.target && !!e.target.files;
}
function Mh(e) {
  e.preventDefault();
}
function fP(e) {
  return e.indexOf("MSIE") !== -1 || e.indexOf("Trident/") !== -1;
}
function pP(e) {
  return e.indexOf("Edge/") !== -1;
}
function mP(e = window.navigator.userAgent) {
  return fP(e) || pP(e);
}
function dn(...e) {
  return (t, ...n) => e.some((r) => (!Al(t) && r && r(t, ...n), Al(t)));
}
function hP() {
  return "showOpenFilePicker" in window;
}
function gP(e) {
  return Sr(e)
    ? [
        {
          description: "Files",
          accept: Object.entries(e)
            .filter(([n, r]) => {
              let o = !0;
              return (
                vw(n) ||
                  (console.warn(
                    `Skipped "${n}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`
                  ),
                  (o = !1)),
                (!Array.isArray(r) || !r.every(ww)) &&
                  (console.warn(
                    `Skipped "${n}" because an invalid file extension was provided.`
                  ),
                  (o = !1)),
                o
              );
            })
            .reduce((n, [r, o]) => oP(rP({}, n), { [r]: o }), {}),
        },
      ]
    : e;
}
function yP(e) {
  if (Sr(e))
    return Object.entries(e)
      .reduce((t, [n, r]) => [...t, n, ...r], [])
      .filter((t) => vw(t) || ww(t))
      .join(",");
}
function vP(e) {
  return (
    e instanceof DOMException &&
    (e.name === "AbortError" || e.code === e.ABORT_ERR)
  );
}
function wP(e) {
  return (
    e instanceof DOMException &&
    (e.name === "SecurityError" || e.code === e.SECURITY_ERR)
  );
}
function vw(e) {
  return (
    e === "audio/*" ||
    e === "video/*" ||
    e === "image/*" ||
    e === "text/*" ||
    /\w+\/[-+.\w]+/g.test(e)
  );
}
function ww(e) {
  return /^.*\.[\w]+$/.test(e);
}
var xP = Object.defineProperty,
  SP = Object.defineProperties,
  bP = Object.getOwnPropertyDescriptors,
  Fl = Object.getOwnPropertySymbols,
  xw = Object.prototype.hasOwnProperty,
  Sw = Object.prototype.propertyIsEnumerable,
  Ih = (e, t, n) =>
    t in e
      ? xP(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  it = (e, t) => {
    for (var n in t || (t = {})) xw.call(t, n) && Ih(e, n, t[n]);
    if (Fl) for (var n of Fl(t)) Sw.call(t, n) && Ih(e, n, t[n]);
    return e;
  },
  Wn = (e, t) => SP(e, bP(t)),
  Ml = (e, t) => {
    var n = {};
    for (var r in e) xw.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
    if (e != null && Fl)
      for (var r of Fl(e)) t.indexOf(r) < 0 && Sw.call(e, r) && (n[r] = e[r]);
    return n;
  };
const rp = y.forwardRef((e, t) => {
  var n = e,
    { children: r } = n,
    o = Ml(n, ["children"]);
  const s = Cw(o),
    { open: i } = s,
    l = Ml(s, ["open"]);
  return (
    y.useImperativeHandle(t, () => ({ open: i }), [i]),
    Wl.createElement(y.Fragment, null, r(Wn(it({}, l), { open: i })))
  );
});
rp.displayName = "Dropzone";
const bw = {
  disabled: !1,
  getFilesFromEvent: VD,
  maxSize: 1 / 0,
  minSize: 0,
  multiple: !0,
  maxFiles: 0,
  preventDropOnDocument: !0,
  noClick: !1,
  noKeyboard: !1,
  noDrag: !1,
  noDragEventsBubbling: !1,
  validator: null,
  useFsAccessApi: !0,
  autoFocus: !1,
};
rp.defaultProps = bw;
rp.propTypes = {
  children: Y.func,
  accept: Y.objectOf(Y.arrayOf(Y.string)),
  multiple: Y.bool,
  preventDropOnDocument: Y.bool,
  noClick: Y.bool,
  noKeyboard: Y.bool,
  noDrag: Y.bool,
  noDragEventsBubbling: Y.bool,
  minSize: Y.number,
  maxSize: Y.number,
  maxFiles: Y.number,
  disabled: Y.bool,
  getFilesFromEvent: Y.func,
  onFileDialogCancel: Y.func,
  onFileDialogOpen: Y.func,
  useFsAccessApi: Y.bool,
  autoFocus: Y.bool,
  onDragEnter: Y.func,
  onDragLeave: Y.func,
  onDragOver: Y.func,
  onDrop: Y.func,
  onDropAccepted: Y.func,
  onDropRejected: Y.func,
  onError: Y.func,
  validator: Y.func,
};
const Qu = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  acceptedFiles: [],
  fileRejections: [],
};
function Cw(e = {}) {
  const {
      accept: t,
      disabled: n,
      getFilesFromEvent: r,
      maxSize: o,
      minSize: s,
      multiple: i,
      maxFiles: l,
      onDragEnter: a,
      onDragLeave: c,
      onDragOver: u,
      onDrop: d,
      onDropAccepted: f,
      onDropRejected: m,
      onFileDialogCancel: p,
      onFileDialogOpen: h,
      useFsAccessApi: S,
      autoFocus: v,
      preventDropOnDocument: w,
      noClick: g,
      noKeyboard: b,
      noDrag: C,
      noDragEventsBubbling: E,
      onError: _,
      validator: D,
    } = it(it({}, bw), e),
    L = y.useMemo(() => yP(t), [t]),
    N = y.useMemo(() => gP(t), [t]),
    M = y.useMemo(() => (typeof h == "function" ? h : zh), [h]),
    B = y.useMemo(() => (typeof p == "function" ? p : zh), [p]),
    V = y.useRef(null),
    A = y.useRef(null),
    [j, P] = y.useReducer(CP, Qu),
    { isFocused: T, isFileDialogActive: R } = j,
    k = y.useRef(typeof window < "u" && window.isSecureContext && S && hP()),
    $ = () => {
      !k.current &&
        R &&
        setTimeout(() => {
          if (A.current) {
            const { files: W } = A.current;
            W.length || (P({ type: "closeDialog" }), B());
          }
        }, 300);
    };
  y.useEffect(
    () => (
      window.addEventListener("focus", $, !1),
      () => {
        window.removeEventListener("focus", $, !1);
      }
    ),
    [A, R, B, k]
  );
  const O = y.useRef([]),
    I = (W) => {
      (V.current && V.current.contains(W.target)) ||
        (W.preventDefault(), (O.current = []));
    };
  y.useEffect(
    () => (
      w &&
        (document.addEventListener("dragover", Mh, !1),
        document.addEventListener("drop", I, !1)),
      () => {
        w &&
          (document.removeEventListener("dragover", Mh),
          document.removeEventListener("drop", I));
      }
    ),
    [V, w]
  ),
    y.useEffect(
      () => (!n && v && V.current && V.current.focus(), () => {}),
      [V, v, n]
    );
  const K = y.useCallback(
      (W) => {
        _ ? _(W) : console.error(W);
      },
      [_]
    ),
    J = y.useCallback(
      (W) => {
        W.preventDefault(),
          W.persist(),
          ye(W),
          (O.current = [...O.current, W.target]),
          Ii(W) &&
            Promise.resolve(r(W))
              .then((re) => {
                if (Al(W) && !E) return;
                const ie = re.length,
                  Se =
                    ie > 0 &&
                    dP({
                      files: re,
                      accept: L,
                      minSize: s,
                      maxSize: o,
                      multiple: i,
                      maxFiles: l,
                      validator: D,
                    }),
                  Ae = ie > 0 && !Se;
                P({
                  isDragAccept: Se,
                  isDragReject: Ae,
                  isDragActive: !0,
                  type: "setDraggedFiles",
                }),
                  a && a(W);
              })
              .catch((re) => K(re));
      },
      [r, a, K, E, L, s, o, i, l, D]
    ),
    ee = y.useCallback(
      (W) => {
        W.preventDefault(), W.persist(), ye(W);
        const re = Ii(W);
        if (re && W.dataTransfer)
          try {
            W.dataTransfer.dropEffect = "copy";
          } catch {}
        return re && u && u(W), !1;
      },
      [u, E]
    ),
    ne = y.useCallback(
      (W) => {
        W.preventDefault(), W.persist(), ye(W);
        const re = O.current.filter(
            (Se) => V.current && V.current.contains(Se)
          ),
          ie = re.indexOf(W.target);
        ie !== -1 && re.splice(ie, 1),
          (O.current = re),
          !(re.length > 0) &&
            (P({
              type: "setDraggedFiles",
              isDragActive: !1,
              isDragAccept: !1,
              isDragReject: !1,
            }),
            Ii(W) && c && c(W));
      },
      [V, c, E]
    ),
    te = y.useCallback(
      (W, re) => {
        const ie = [],
          Se = [];
        W.forEach((Ae) => {
          const [Pt, be] = gw(Ae, L),
            [Fe, an] = yw(Ae, s, o),
            qe = D ? D(Ae) : null;
          if (Pt && Fe && !qe) ie.push(Ae);
          else {
            let Tt = [be, an];
            qe && (Tt = Tt.concat(qe)),
              Se.push({ file: Ae, errors: Tt.filter((yr) => yr) });
          }
        }),
          ((!i && ie.length > 1) || (i && l >= 1 && ie.length > l)) &&
            (ie.forEach((Ae) => {
              Se.push({ file: Ae, errors: [uP] });
            }),
            ie.splice(0)),
          P({ acceptedFiles: ie, fileRejections: Se, type: "setFiles" }),
          d && d(ie, Se, re),
          Se.length > 0 && m && m(Se, re),
          ie.length > 0 && f && f(ie, re);
      },
      [P, i, L, s, o, l, d, f, m, D]
    ),
    me = y.useCallback(
      (W) => {
        W.preventDefault(),
          W.persist(),
          ye(W),
          (O.current = []),
          Ii(W) &&
            Promise.resolve(r(W))
              .then((re) => {
                (Al(W) && !E) || te(re, W);
              })
              .catch((re) => K(re)),
          P({ type: "reset" });
      },
      [r, te, K, E]
    ),
    oe = y.useCallback(() => {
      if (k.current) {
        P({ type: "openDialog" }), M();
        const W = { multiple: i, types: N };
        window
          .showOpenFilePicker(W)
          .then((re) => r(re))
          .then((re) => {
            te(re, null), P({ type: "closeDialog" });
          })
          .catch((re) => {
            vP(re)
              ? (B(re), P({ type: "closeDialog" }))
              : wP(re)
              ? ((k.current = !1),
                A.current
                  ? ((A.current.value = null), A.current.click())
                  : K(
                      new Error(
                        "Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."
                      )
                    ))
              : K(re);
          });
        return;
      }
      A.current &&
        (P({ type: "openDialog" }),
        M(),
        (A.current.value = null),
        A.current.click());
    }, [P, M, B, S, te, K, N, i]),
    le = y.useCallback(
      (W) => {
        !V.current ||
          !V.current.isEqualNode(W.target) ||
          ((W.key === " " ||
            W.key === "Enter" ||
            W.keyCode === 32 ||
            W.keyCode === 13) &&
            (W.preventDefault(), oe()));
      },
      [V, oe]
    ),
    Z = y.useCallback(() => {
      P({ type: "focus" });
    }, []),
    ge = y.useCallback(() => {
      P({ type: "blur" });
    }, []),
    ce = y.useCallback(() => {
      g || (mP() ? setTimeout(oe, 0) : oe());
    }, [g, oe]),
    se = (W) => (n ? null : W),
    je = (W) => (b ? null : se(W)),
    Ie = (W) => (C ? null : se(W)),
    ye = (W) => {
      E && W.stopPropagation();
    },
    rt = y.useMemo(
      () =>
        (W = {}) => {
          var re = W,
            {
              refKey: ie = "ref",
              role: Se,
              onKeyDown: Ae,
              onFocus: Pt,
              onBlur: be,
              onClick: Fe,
              onDragEnter: an,
              onDragOver: qe,
              onDragLeave: Tt,
              onDrop: yr,
            } = re,
            cn = Ml(re, [
              "refKey",
              "role",
              "onKeyDown",
              "onFocus",
              "onBlur",
              "onClick",
              "onDragEnter",
              "onDragOver",
              "onDragLeave",
              "onDrop",
            ]);
          return it(
            it(
              {
                onKeyDown: je(dn(Ae, le)),
                onFocus: je(dn(Pt, Z)),
                onBlur: je(dn(be, ge)),
                onClick: se(dn(Fe, ce)),
                onDragEnter: Ie(dn(an, J)),
                onDragOver: Ie(dn(qe, ee)),
                onDragLeave: Ie(dn(Tt, ne)),
                onDrop: Ie(dn(yr, me)),
                role: typeof Se == "string" && Se !== "" ? Se : "presentation",
                [ie]: V,
              },
              !n && !b ? { tabIndex: 0 } : {}
            ),
            cn
          );
        },
      [V, le, Z, ge, ce, J, ee, ne, me, b, C, n]
    ),
    Te = y.useCallback((W) => {
      W.stopPropagation();
    }, []),
    Le = y.useMemo(
      () =>
        (W = {}) => {
          var re = W,
            { refKey: ie = "ref", onChange: Se, onClick: Ae } = re,
            Pt = Ml(re, ["refKey", "onChange", "onClick"]);
          const be = {
            accept: L,
            multiple: i,
            type: "file",
            style: { display: "none" },
            onChange: se(dn(Se, me)),
            onClick: se(dn(Ae, Te)),
            tabIndex: -1,
            [ie]: A,
          };
          return it(it({}, be), Pt);
        },
      [A, t, i, me, n]
    );
  return Wn(it({}, j), {
    isFocused: T && !n,
    getRootProps: rt,
    getInputProps: Le,
    rootRef: V,
    inputRef: A,
    open: se(oe),
  });
}
function CP(e, t) {
  switch (t.type) {
    case "focus":
      return Wn(it({}, e), { isFocused: !0 });
    case "blur":
      return Wn(it({}, e), { isFocused: !1 });
    case "openDialog":
      return Wn(it({}, Qu), { isFileDialogActive: !0 });
    case "closeDialog":
      return Wn(it({}, e), { isFileDialogActive: !1 });
    case "setDraggedFiles":
      return Wn(it({}, e), {
        isDragActive: t.isDragActive,
        isDragAccept: t.isDragAccept,
        isDragReject: t.isDragReject,
      });
    case "setFiles":
      return Wn(it({}, e), {
        acceptedFiles: t.acceptedFiles,
        fileRejections: t.fileRejections,
      });
    case "reset":
      return it({}, Qu);
    default:
      return e;
  }
}
function zh() {}
const [EP, kP] = pr("Dropzone component was not found in tree");
function op(e) {
  const t = (n) => {
    const { children: r, ...o } = U(`Dropzone${Hm(e)}`, {}, n),
      s = kP(),
      i = Hr(r) ? r : x.jsx("span", { children: r });
    return s[e] ? y.cloneElement(i, o) : null;
  };
  return (t.displayName = `@mantine/dropzone/${Hm(e)}`), t;
}
const _P = op("accept"),
  RP = op("reject"),
  DP = op("idle");
var qs = {
  root: "m_d46a4834",
  inner: "m_b85f7144",
  fullScreen: "m_96f6e9ad",
  dropzone: "m_7946116d",
};
const PP = {
    loading: !1,
    multiple: !0,
    maxSize: 1 / 0,
    autoFocus: !1,
    activateOnClick: !0,
    activateOnDrag: !0,
    dragEventsBubbling: !0,
    activateOnKeyboard: !0,
    useFsAccessApi: !0,
    variant: "light",
    rejectColor: "red",
  },
  TP = (e, { radius: t, variant: n, acceptColor: r, rejectColor: o }) => {
    const s = e.variantColorResolver({
        color: r || e.primaryColor,
        theme: e,
        variant: n,
      }),
      i = e.variantColorResolver({ color: o || "red", theme: e, variant: n });
    return {
      root: {
        "--dropzone-radius": Sn(t),
        "--dropzone-accept-color": s.color,
        "--dropzone-accept-bg": s.background,
        "--dropzone-reject-color": i.color,
        "--dropzone-reject-bg": i.background,
      },
    };
  },
  mr = X((e, t) => {
    const n = U("Dropzone", PP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        radius: c,
        disabled: u,
        loading: d,
        multiple: f,
        maxSize: m,
        accept: p,
        children: h,
        onDropAny: S,
        onDrop: v,
        onReject: w,
        openRef: g,
        name: b,
        maxFiles: C,
        autoFocus: E,
        activateOnClick: _,
        activateOnDrag: D,
        dragEventsBubbling: L,
        activateOnKeyboard: N,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: V,
        onFileDialogCancel: A,
        onFileDialogOpen: j,
        preventDropOnDocument: P,
        useFsAccessApi: T,
        getFilesFromEvent: R,
        validator: k,
        rejectColor: $,
        acceptColor: O,
        enablePointerEvents: I,
        loaderProps: K,
        inputProps: J,
        mod: ee,
        ...ne
      } = n,
      te = ue({
        name: "Dropzone",
        classes: qs,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: TP,
      }),
      {
        getRootProps: me,
        getInputProps: oe,
        isDragAccept: le,
        isDragReject: Z,
        open: ge,
      } = Cw({
        onDrop: S,
        onDropAccepted: v,
        onDropRejected: w,
        disabled: u || d,
        accept: Array.isArray(p)
          ? p.reduce((se, je) => ({ ...se, [je]: [] }), {})
          : p,
        multiple: f,
        maxSize: m,
        maxFiles: C,
        autoFocus: E,
        noClick: !_,
        noDrag: !D,
        noDragEventsBubbling: !L,
        noKeyboard: !N,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: V,
        onFileDialogCancel: A,
        onFileDialogOpen: j,
        preventDropOnDocument: P,
        useFsAccessApi: T,
        validator: k,
        ...(R ? { getFilesFromEvent: R } : null),
      });
    cf(g, ge);
    const ce = !le && !Z;
    return x.jsx(EP, {
      value: { accept: le, reject: Z, idle: ce },
      children: x.jsxs(G, {
        ...me(),
        ...te("root", { focusable: !0 }),
        ...ne,
        mod: [
          {
            accept: le,
            reject: Z,
            idle: ce,
            loading: d,
            "activate-on-click": _,
          },
          ee,
        ],
        children: [
          x.jsx(Gf, {
            visible: d,
            overlayProps: { radius: c },
            unstyled: l,
            loaderProps: K,
          }),
          x.jsx("input", { ...oe(J), name: b }),
          x.jsx("div", {
            ...te("inner"),
            ref: t,
            "data-enable-pointer-events": I || void 0,
            children: h,
          }),
        ],
      }),
    });
  });
mr.classes = qs;
mr.displayName = "@mantine/dropzone/Dropzone";
mr.Accept = _P;
mr.Idle = DP;
mr.Reject = RP;
const NP = {
    loading: !1,
    maxSize: 1 / 0,
    activateOnClick: !1,
    activateOnDrag: !0,
    dragEventsBubbling: !0,
    activateOnKeyboard: !0,
    active: !0,
    zIndex: Ur("max"),
    withinPortal: !0,
  },
  sp = X((e, t) => {
    const n = U("DropzoneFullScreen", NP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        active: c,
        onDrop: u,
        onReject: d,
        zIndex: f,
        withinPortal: m,
        portalProps: p,
        ...h
      } = n,
      S = ue({
        name: "DropzoneFullScreen",
        classes: qs,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "fullScreen",
      }),
      { resolvedClassNames: v, resolvedStyles: w } = Bo({
        classNames: r,
        styles: i,
        props: n,
      }),
      [g, b] = y.useState(0),
      [C, { open: E, close: _ }] = Vs(!1),
      D = (N) => {
        var M;
        (M = N.dataTransfer) != null &&
          M.types.includes("Files") &&
          (b((B) => B + 1), E());
      },
      L = () => {
        b((N) => N - 1);
      };
    return (
      y.useEffect(() => {
        g === 0 && _();
      }, [g]),
      y.useEffect(() => {
        if (c)
          return (
            document.addEventListener("dragenter", D, !1),
            document.addEventListener("dragleave", L, !1),
            () => {
              document.removeEventListener("dragenter", D, !1),
                document.removeEventListener("dragleave", L, !1);
            }
          );
      }, [c]),
      x.jsx(ma, {
        ...p,
        withinPortal: m,
        children: x.jsx(G, {
          ...S("fullScreen", {
            style: {
              opacity: C ? 1 : 0,
              pointerEvents: C ? "all" : "none",
              zIndex: f,
            },
          }),
          ref: t,
          children: x.jsx(mr, {
            ...h,
            classNames: v,
            styles: w,
            unstyled: l,
            className: qs.dropzone,
            onDrop: (N) => {
              u == null || u(N), _(), b(0);
            },
            onReject: (N) => {
              d == null || d(N), _(), b(0);
            },
          }),
        }),
      })
    );
  });
sp.classes = qs;
sp.displayName = "@mantine/dropzone/DropzoneFullScreen";
mr.FullScreen = sp;
const zi = mr,
  ip = (e) => {
    const { title: t, description: n, form: r, field_id: o } = e,
      [s, i] = y.useState([]);
    r.values.files.map((a, c) =>
      x.jsxs(
        kr,
        {
          children: [
            x.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            x.jsx(Mr, {
              size: "xs",
              onClick: () =>
                r.setFieldValue(
                  "files",
                  r.values.files.filter((u, d) => d !== c)
                ),
            }),
          ],
        },
        a.name
      )
    );
    const l = s.map((a, c) =>
      x.jsxs(
        kr,
        {
          children: [
            x.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            x.jsx(Mr, {
              size: "xs",
              onClick: () => {
                const u = s.filter((d, f) => f !== c);
                r.setFieldValue("files", u), i(u);
              },
            }),
          ],
        },
        a.name
      )
    );
    return x.jsxs(x.Fragment, {
      children: [
        x.jsx(zi, {
          h: 120,
          p: 0,
          multiple: !0,
          onDrop: (a) => {
            r.setFieldValue("files", a), i(a);
          },
          children: x.jsxs(Kf, {
            h: 120,
            children: [
              x.jsx(zi.Idle, { children: "Drop files here" }),
              x.jsx(zi.Accept, { children: "Drop files here" }),
              x.jsx(zi.Reject, { children: "Files are invalid" }),
            ],
          }),
        }),
        r.errors.files &&
          x.jsx(kr, { c: "red", mt: 5, children: r.errors.files }),
        l.length > 0 &&
          x.jsxs(x.Fragment, {
            children: [
              x.jsx(kr, { mb: 5, mt: "md", children: "Selected files:" }),
              l,
            ],
          }),
      ],
    });
  };
ip.defaultProps = {};
ip.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
};
var Ew = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(cd, function () {
    var n = 1e3,
      r = 6e4,
      o = 36e5,
      s = "millisecond",
      i = "second",
      l = "minute",
      a = "hour",
      c = "day",
      u = "week",
      d = "month",
      f = "quarter",
      m = "year",
      p = "date",
      h = "Invalid Date",
      S =
        /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
      v =
        /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
      w = {
        name: "en",
        weekdays:
          "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months:
          "January_February_March_April_May_June_July_August_September_October_November_December".split(
            "_"
          ),
        ordinal: function (A) {
          var j = ["th", "st", "nd", "rd"],
            P = A % 100;
          return "[" + A + (j[(P - 20) % 10] || j[P] || j[0]) + "]";
        },
      },
      g = function (A, j, P) {
        var T = String(A);
        return !T || T.length >= j
          ? A
          : "" + Array(j + 1 - T.length).join(P) + A;
      },
      b = {
        s: g,
        z: function (A) {
          var j = -A.utcOffset(),
            P = Math.abs(j),
            T = Math.floor(P / 60),
            R = P % 60;
          return (j <= 0 ? "+" : "-") + g(T, 2, "0") + ":" + g(R, 2, "0");
        },
        m: function A(j, P) {
          if (j.date() < P.date()) return -A(P, j);
          var T = 12 * (P.year() - j.year()) + (P.month() - j.month()),
            R = j.clone().add(T, d),
            k = P - R < 0,
            $ = j.clone().add(T + (k ? -1 : 1), d);
          return +(-(T + (P - R) / (k ? R - $ : $ - R)) || 0);
        },
        a: function (A) {
          return A < 0 ? Math.ceil(A) || 0 : Math.floor(A);
        },
        p: function (A) {
          return (
            { M: d, y: m, w: u, d: c, D: p, h: a, m: l, s: i, ms: s, Q: f }[
              A
            ] ||
            String(A || "")
              .toLowerCase()
              .replace(/s$/, "")
          );
        },
        u: function (A) {
          return A === void 0;
        },
      },
      C = "en",
      E = {};
    E[C] = w;
    var _ = "$isDayjsObject",
      D = function (A) {
        return A instanceof B || !(!A || !A[_]);
      },
      L = function A(j, P, T) {
        var R;
        if (!j) return C;
        if (typeof j == "string") {
          var k = j.toLowerCase();
          E[k] && (R = k), P && ((E[k] = P), (R = k));
          var $ = j.split("-");
          if (!R && $.length > 1) return A($[0]);
        } else {
          var O = j.name;
          (E[O] = j), (R = O);
        }
        return !T && R && (C = R), R || (!T && C);
      },
      N = function (A, j) {
        if (D(A)) return A.clone();
        var P = typeof j == "object" ? j : {};
        return (P.date = A), (P.args = arguments), new B(P);
      },
      M = b;
    (M.l = L),
      (M.i = D),
      (M.w = function (A, j) {
        return N(A, { locale: j.$L, utc: j.$u, x: j.$x, $offset: j.$offset });
      });
    var B = (function () {
        function A(P) {
          (this.$L = L(P.locale, null, !0)),
            this.parse(P),
            (this.$x = this.$x || P.x || {}),
            (this[_] = !0);
        }
        var j = A.prototype;
        return (
          (j.parse = function (P) {
            (this.$d = (function (T) {
              var R = T.date,
                k = T.utc;
              if (R === null) return new Date(NaN);
              if (M.u(R)) return new Date();
              if (R instanceof Date) return new Date(R);
              if (typeof R == "string" && !/Z$/i.test(R)) {
                var $ = R.match(S);
                if ($) {
                  var O = $[2] - 1 || 0,
                    I = ($[7] || "0").substring(0, 3);
                  return k
                    ? new Date(
                        Date.UTC(
                          $[1],
                          O,
                          $[3] || 1,
                          $[4] || 0,
                          $[5] || 0,
                          $[6] || 0,
                          I
                        )
                      )
                    : new Date(
                        $[1],
                        O,
                        $[3] || 1,
                        $[4] || 0,
                        $[5] || 0,
                        $[6] || 0,
                        I
                      );
                }
              }
              return new Date(R);
            })(P)),
              this.init();
          }),
          (j.init = function () {
            var P = this.$d;
            (this.$y = P.getFullYear()),
              (this.$M = P.getMonth()),
              (this.$D = P.getDate()),
              (this.$W = P.getDay()),
              (this.$H = P.getHours()),
              (this.$m = P.getMinutes()),
              (this.$s = P.getSeconds()),
              (this.$ms = P.getMilliseconds());
          }),
          (j.$utils = function () {
            return M;
          }),
          (j.isValid = function () {
            return this.$d.toString() !== h;
          }),
          (j.isSame = function (P, T) {
            var R = N(P);
            return this.startOf(T) <= R && R <= this.endOf(T);
          }),
          (j.isAfter = function (P, T) {
            return N(P) < this.startOf(T);
          }),
          (j.isBefore = function (P, T) {
            return this.endOf(T) < N(P);
          }),
          (j.$g = function (P, T, R) {
            return M.u(P) ? this[T] : this.set(R, P);
          }),
          (j.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }),
          (j.valueOf = function () {
            return this.$d.getTime();
          }),
          (j.startOf = function (P, T) {
            var R = this,
              k = !!M.u(T) || T,
              $ = M.p(P),
              O = function (oe, le) {
                var Z = M.w(
                  R.$u ? Date.UTC(R.$y, le, oe) : new Date(R.$y, le, oe),
                  R
                );
                return k ? Z : Z.endOf(c);
              },
              I = function (oe, le) {
                return M.w(
                  R.toDate()[oe].apply(
                    R.toDate("s"),
                    (k ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(le)
                  ),
                  R
                );
              },
              K = this.$W,
              J = this.$M,
              ee = this.$D,
              ne = "set" + (this.$u ? "UTC" : "");
            switch ($) {
              case m:
                return k ? O(1, 0) : O(31, 11);
              case d:
                return k ? O(1, J) : O(0, J + 1);
              case u:
                var te = this.$locale().weekStart || 0,
                  me = (K < te ? K + 7 : K) - te;
                return O(k ? ee - me : ee + (6 - me), J);
              case c:
              case p:
                return I(ne + "Hours", 0);
              case a:
                return I(ne + "Minutes", 1);
              case l:
                return I(ne + "Seconds", 2);
              case i:
                return I(ne + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }),
          (j.endOf = function (P) {
            return this.startOf(P, !1);
          }),
          (j.$set = function (P, T) {
            var R,
              k = M.p(P),
              $ = "set" + (this.$u ? "UTC" : ""),
              O = ((R = {}),
              (R[c] = $ + "Date"),
              (R[p] = $ + "Date"),
              (R[d] = $ + "Month"),
              (R[m] = $ + "FullYear"),
              (R[a] = $ + "Hours"),
              (R[l] = $ + "Minutes"),
              (R[i] = $ + "Seconds"),
              (R[s] = $ + "Milliseconds"),
              R)[k],
              I = k === c ? this.$D + (T - this.$W) : T;
            if (k === d || k === m) {
              var K = this.clone().set(p, 1);
              K.$d[O](I),
                K.init(),
                (this.$d = K.set(p, Math.min(this.$D, K.daysInMonth())).$d);
            } else O && this.$d[O](I);
            return this.init(), this;
          }),
          (j.set = function (P, T) {
            return this.clone().$set(P, T);
          }),
          (j.get = function (P) {
            return this[M.p(P)]();
          }),
          (j.add = function (P, T) {
            var R,
              k = this;
            P = Number(P);
            var $ = M.p(T),
              O = function (J) {
                var ee = N(k);
                return M.w(ee.date(ee.date() + Math.round(J * P)), k);
              };
            if ($ === d) return this.set(d, this.$M + P);
            if ($ === m) return this.set(m, this.$y + P);
            if ($ === c) return O(1);
            if ($ === u) return O(7);
            var I = ((R = {}), (R[l] = r), (R[a] = o), (R[i] = n), R)[$] || 1,
              K = this.$d.getTime() + P * I;
            return M.w(K, this);
          }),
          (j.subtract = function (P, T) {
            return this.add(-1 * P, T);
          }),
          (j.format = function (P) {
            var T = this,
              R = this.$locale();
            if (!this.isValid()) return R.invalidDate || h;
            var k = P || "YYYY-MM-DDTHH:mm:ssZ",
              $ = M.z(this),
              O = this.$H,
              I = this.$m,
              K = this.$M,
              J = R.weekdays,
              ee = R.months,
              ne = R.meridiem,
              te = function (le, Z, ge, ce) {
                return (le && (le[Z] || le(T, k))) || ge[Z].slice(0, ce);
              },
              me = function (le) {
                return M.s(O % 12 || 12, le, "0");
              },
              oe =
                ne ||
                function (le, Z, ge) {
                  var ce = le < 12 ? "AM" : "PM";
                  return ge ? ce.toLowerCase() : ce;
                };
            return k.replace(v, function (le, Z) {
              return (
                Z ||
                (function (ge) {
                  switch (ge) {
                    case "YY":
                      return String(T.$y).slice(-2);
                    case "YYYY":
                      return M.s(T.$y, 4, "0");
                    case "M":
                      return K + 1;
                    case "MM":
                      return M.s(K + 1, 2, "0");
                    case "MMM":
                      return te(R.monthsShort, K, ee, 3);
                    case "MMMM":
                      return te(ee, K);
                    case "D":
                      return T.$D;
                    case "DD":
                      return M.s(T.$D, 2, "0");
                    case "d":
                      return String(T.$W);
                    case "dd":
                      return te(R.weekdaysMin, T.$W, J, 2);
                    case "ddd":
                      return te(R.weekdaysShort, T.$W, J, 3);
                    case "dddd":
                      return J[T.$W];
                    case "H":
                      return String(O);
                    case "HH":
                      return M.s(O, 2, "0");
                    case "h":
                      return me(1);
                    case "hh":
                      return me(2);
                    case "a":
                      return oe(O, I, !0);
                    case "A":
                      return oe(O, I, !1);
                    case "m":
                      return String(I);
                    case "mm":
                      return M.s(I, 2, "0");
                    case "s":
                      return String(T.$s);
                    case "ss":
                      return M.s(T.$s, 2, "0");
                    case "SSS":
                      return M.s(T.$ms, 3, "0");
                    case "Z":
                      return $;
                  }
                  return null;
                })(le) ||
                $.replace(":", "")
              );
            });
          }),
          (j.utcOffset = function () {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }),
          (j.diff = function (P, T, R) {
            var k,
              $ = this,
              O = M.p(T),
              I = N(P),
              K = (I.utcOffset() - this.utcOffset()) * r,
              J = this - I,
              ee = function () {
                return M.m($, I);
              };
            switch (O) {
              case m:
                k = ee() / 12;
                break;
              case d:
                k = ee();
                break;
              case f:
                k = ee() / 3;
                break;
              case u:
                k = (J - K) / 6048e5;
                break;
              case c:
                k = (J - K) / 864e5;
                break;
              case a:
                k = J / o;
                break;
              case l:
                k = J / r;
                break;
              case i:
                k = J / n;
                break;
              default:
                k = J;
            }
            return R ? k : M.a(k);
          }),
          (j.daysInMonth = function () {
            return this.endOf(d).$D;
          }),
          (j.$locale = function () {
            return E[this.$L];
          }),
          (j.locale = function (P, T) {
            if (!P) return this.$L;
            var R = this.clone(),
              k = L(P, T, !0);
            return k && (R.$L = k), R;
          }),
          (j.clone = function () {
            return M.w(this.$d, this);
          }),
          (j.toDate = function () {
            return new Date(this.valueOf());
          }),
          (j.toJSON = function () {
            return this.isValid() ? this.toISOString() : null;
          }),
          (j.toISOString = function () {
            return this.$d.toISOString();
          }),
          (j.toString = function () {
            return this.$d.toUTCString();
          }),
          A
        );
      })(),
      V = B.prototype;
    return (
      (N.prototype = V),
      [
        ["$ms", s],
        ["$s", i],
        ["$m", l],
        ["$H", a],
        ["$W", c],
        ["$M", d],
        ["$y", m],
        ["$D", p],
      ].forEach(function (A) {
        V[A[1]] = function (j) {
          return this.$g(j, A[0], A[1]);
        };
      }),
      (N.extend = function (A, j) {
        return A.$i || (A(j, B, N), (A.$i = !0)), N;
      }),
      (N.locale = L),
      (N.isDayjs = D),
      (N.unix = function (A) {
        return N(1e3 * A);
      }),
      (N.en = E[C]),
      (N.Ls = E),
      (N.p = {}),
      N
    );
  });
})(Ew);
var OP = Ew.exports;
const Q = zr(OP);
function jP({
  direction: e,
  levelIndex: t,
  rowIndex: n,
  cellIndex: r,
  size: o,
}) {
  switch (e) {
    case "up":
      return t === 0 && n === 0
        ? null
        : n === 0
        ? {
            levelIndex: t - 1,
            rowIndex:
              r <= o[t - 1][o[t - 1].length - 1] - 1
                ? o[t - 1].length - 1
                : o[t - 1].length - 2,
            cellIndex: r,
          }
        : { levelIndex: t, rowIndex: n - 1, cellIndex: r };
    case "down":
      return n === o[t].length - 1
        ? { levelIndex: t + 1, rowIndex: 0, cellIndex: r }
        : n === o[t].length - 2 && r >= o[t][o[t].length - 1]
        ? { levelIndex: t + 1, rowIndex: 0, cellIndex: r }
        : { levelIndex: t, rowIndex: n + 1, cellIndex: r };
    case "left":
      return t === 0 && n === 0 && r === 0
        ? null
        : n === 0 && r === 0
        ? {
            levelIndex: t - 1,
            rowIndex: o[t - 1].length - 1,
            cellIndex: o[t - 1][o[t - 1].length - 1] - 1,
          }
        : r === 0
        ? { levelIndex: t, rowIndex: n - 1, cellIndex: o[t][n - 1] - 1 }
        : { levelIndex: t, rowIndex: n, cellIndex: r - 1 };
    case "right":
      return n === o[t].length - 1 && r === o[t][n] - 1
        ? { levelIndex: t + 1, rowIndex: 0, cellIndex: 0 }
        : r === o[t][n] - 1
        ? { levelIndex: t, rowIndex: n + 1, cellIndex: 0 }
        : { levelIndex: t, rowIndex: n, cellIndex: r + 1 };
    default:
      return { levelIndex: t, rowIndex: n, cellIndex: r };
  }
}
function kw({
  controlsRef: e,
  direction: t,
  levelIndex: n,
  rowIndex: r,
  cellIndex: o,
  size: s,
}) {
  var a, c, u;
  const i = jP({
    direction: t,
    size: s,
    rowIndex: r,
    cellIndex: o,
    levelIndex: n,
  });
  if (!i) return;
  const l =
    (u =
      (c = (a = e.current) == null ? void 0 : a[i.levelIndex]) == null
        ? void 0
        : c[i.rowIndex]) == null
      ? void 0
      : u[i.cellIndex];
  l &&
    (l.disabled ||
    l.getAttribute("data-hidden") ||
    l.getAttribute("data-outside")
      ? kw({
          controlsRef: e,
          direction: t,
          levelIndex: i.levelIndex,
          cellIndex: i.cellIndex,
          rowIndex: i.rowIndex,
          size: s,
        })
      : l.focus());
}
function $P(e) {
  switch (e) {
    case "ArrowDown":
      return "down";
    case "ArrowUp":
      return "up";
    case "ArrowRight":
      return "right";
    case "ArrowLeft":
      return "left";
    default:
      return null;
  }
}
function LP(e) {
  var t;
  return (t = e.current) == null
    ? void 0
    : t.map((n) => n.map((r) => r.length));
}
function lp({
  controlsRef: e,
  levelIndex: t,
  rowIndex: n,
  cellIndex: r,
  event: o,
}) {
  const s = $P(o.key);
  if (s) {
    o.preventDefault();
    const i = LP(e);
    kw({
      controlsRef: e,
      direction: s,
      levelIndex: t,
      rowIndex: n,
      cellIndex: r,
      size: i,
    });
  }
}
var _w = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(cd, function () {
    var n = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 },
      r = {};
    return function (o, s, i) {
      var l,
        a = function (f, m, p) {
          p === void 0 && (p = {});
          var h = new Date(f),
            S = (function (v, w) {
              w === void 0 && (w = {});
              var g = w.timeZoneName || "short",
                b = v + "|" + g,
                C = r[b];
              return (
                C ||
                  ((C = new Intl.DateTimeFormat("en-US", {
                    hour12: !1,
                    timeZone: v,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: g,
                  })),
                  (r[b] = C)),
                C
              );
            })(m, p);
          return S.formatToParts(h);
        },
        c = function (f, m) {
          for (var p = a(f, m), h = [], S = 0; S < p.length; S += 1) {
            var v = p[S],
              w = v.type,
              g = v.value,
              b = n[w];
            b >= 0 && (h[b] = parseInt(g, 10));
          }
          var C = h[3],
            E = C === 24 ? 0 : C,
            _ =
              h[0] +
              "-" +
              h[1] +
              "-" +
              h[2] +
              " " +
              E +
              ":" +
              h[4] +
              ":" +
              h[5] +
              ":000",
            D = +f;
          return (i.utc(_).valueOf() - (D -= D % 1e3)) / 6e4;
        },
        u = s.prototype;
      (u.tz = function (f, m) {
        f === void 0 && (f = l);
        var p = this.utcOffset(),
          h = this.toDate(),
          S = h.toLocaleString("en-US", { timeZone: f }),
          v = Math.round((h - new Date(S)) / 1e3 / 60),
          w = i(S, { locale: this.$L })
            .$set("millisecond", this.$ms)
            .utcOffset(15 * -Math.round(h.getTimezoneOffset() / 15) - v, !0);
        if (m) {
          var g = w.utcOffset();
          w = w.add(p - g, "minute");
        }
        return (w.$x.$timezone = f), w;
      }),
        (u.offsetName = function (f) {
          var m = this.$x.$timezone || i.tz.guess(),
            p = a(this.valueOf(), m, { timeZoneName: f }).find(function (h) {
              return h.type.toLowerCase() === "timezonename";
            });
          return p && p.value;
        });
      var d = u.startOf;
      (u.startOf = function (f, m) {
        if (!this.$x || !this.$x.$timezone) return d.call(this, f, m);
        var p = i(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
        return d.call(p, f, m).tz(this.$x.$timezone, !0);
      }),
        (i.tz = function (f, m, p) {
          var h = p && m,
            S = p || m || l,
            v = c(+i(), S);
          if (typeof f != "string") return i(f).tz(S);
          var w = (function (E, _, D) {
              var L = E - 60 * _ * 1e3,
                N = c(L, D);
              if (_ === N) return [L, _];
              var M = c((L -= 60 * (N - _) * 1e3), D);
              return N === M
                ? [L, N]
                : [E - 60 * Math.min(N, M) * 1e3, Math.max(N, M)];
            })(i.utc(f, h).valueOf(), v, S),
            g = w[0],
            b = w[1],
            C = i(g).utcOffset(b);
          return (C.$x.$timezone = S), C;
        }),
        (i.tz.guess = function () {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }),
        (i.tz.setDefault = function (f) {
          l = f;
        });
    };
  });
})(_w);
var AP = _w.exports;
const FP = zr(AP);
var Rw = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(cd, function () {
    var n = "minute",
      r = /[+-]\d\d(?::?\d\d)?/g,
      o = /([+-]|\d\d)/g;
    return function (s, i, l) {
      var a = i.prototype;
      (l.utc = function (h) {
        var S = { date: h, utc: !0, args: arguments };
        return new i(S);
      }),
        (a.utc = function (h) {
          var S = l(this.toDate(), { locale: this.$L, utc: !0 });
          return h ? S.add(this.utcOffset(), n) : S;
        }),
        (a.local = function () {
          return l(this.toDate(), { locale: this.$L, utc: !1 });
        });
      var c = a.parse;
      a.parse = function (h) {
        h.utc && (this.$u = !0),
          this.$utils().u(h.$offset) || (this.$offset = h.$offset),
          c.call(this, h);
      };
      var u = a.init;
      a.init = function () {
        if (this.$u) {
          var h = this.$d;
          (this.$y = h.getUTCFullYear()),
            (this.$M = h.getUTCMonth()),
            (this.$D = h.getUTCDate()),
            (this.$W = h.getUTCDay()),
            (this.$H = h.getUTCHours()),
            (this.$m = h.getUTCMinutes()),
            (this.$s = h.getUTCSeconds()),
            (this.$ms = h.getUTCMilliseconds());
        } else u.call(this);
      };
      var d = a.utcOffset;
      a.utcOffset = function (h, S) {
        var v = this.$utils().u;
        if (v(h))
          return this.$u ? 0 : v(this.$offset) ? d.call(this) : this.$offset;
        if (
          typeof h == "string" &&
          ((h = (function (C) {
            C === void 0 && (C = "");
            var E = C.match(r);
            if (!E) return null;
            var _ = ("" + E[0]).match(o) || ["-", 0, 0],
              D = _[0],
              L = 60 * +_[1] + +_[2];
            return L === 0 ? 0 : D === "+" ? L : -L;
          })(h)),
          h === null)
        )
          return this;
        var w = Math.abs(h) <= 16 ? 60 * h : h,
          g = this;
        if (S) return (g.$offset = w), (g.$u = h === 0), g;
        if (h !== 0) {
          var b = this.$u
            ? this.toDate().getTimezoneOffset()
            : -1 * this.utcOffset();
          ((g = this.local().add(w + b, n)).$offset = w),
            (g.$x.$localOffset = b);
        } else g = this.utc();
        return g;
      };
      var f = a.format;
      (a.format = function (h) {
        var S = h || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
        return f.call(this, S);
      }),
        (a.valueOf = function () {
          var h = this.$utils().u(this.$offset)
            ? 0
            : this.$offset +
              (this.$x.$localOffset || this.$d.getTimezoneOffset());
          return this.$d.valueOf() - 6e4 * h;
        }),
        (a.isUTC = function () {
          return !!this.$u;
        }),
        (a.toISOString = function () {
          return this.toDate().toISOString();
        }),
        (a.toString = function () {
          return this.toDate().toUTCString();
        });
      var m = a.toDate;
      a.toDate = function (h) {
        return h === "s" && this.$offset
          ? l(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate()
          : m.call(this);
      };
      var p = a.diff;
      a.diff = function (h, S, v) {
        if (h && this.$u === h.$u) return p.call(this, h, S, v);
        var w = this.local(),
          g = l(h).local();
        return p.call(w, g, S, v);
      };
    };
  });
})(Rw);
var MP = Rw.exports;
const IP = zr(MP);
Q.extend(IP);
Q.extend(FP);
function zP(e, t) {
  return t ? Q(e).tz(t).utcOffset() + e.getTimezoneOffset() : 0;
}
const Bh = (e, t, n) => {
  if (!e) return null;
  if (!t) return e;
  let r = zP(e, t);
  return n === "remove" && (r *= -1), Q(e).add(r, "minutes").toDate();
};
function bo(e, t, n, r) {
  return r || !t
    ? t
    : Array.isArray(t)
    ? t.map((o) => Bh(o, n, e))
    : Bh(t, n, e);
}
const BP = {
    locale: "en",
    timezone: null,
    firstDayOfWeek: 1,
    weekendDays: [0, 6],
    labelSeparator: "–",
    consistentWeeks: !1,
  },
  VP = y.createContext(BP);
function sn() {
  const e = y.useContext(VP),
    t = y.useCallback((i) => i || e.locale, [e.locale]),
    n = y.useCallback((i) => i || e.timezone || void 0, [e.timezone]),
    r = y.useCallback(
      (i) => (typeof i == "number" ? i : e.firstDayOfWeek),
      [e.firstDayOfWeek]
    ),
    o = y.useCallback(
      (i) => (Array.isArray(i) ? i : e.weekendDays),
      [e.weekendDays]
    ),
    s = y.useCallback(
      (i) => (typeof i == "string" ? i : e.labelSeparator),
      [e.labelSeparator]
    );
  return {
    ...e,
    getLocale: t,
    getTimezone: n,
    getFirstDayOfWeek: r,
    getWeekendDays: o,
    getLabelSeparator: s,
  };
}
var Dw = { day: "m_396ce5cb" };
const HP = {},
  UP = (e, { size: t }) => ({ day: { "--day-size": Ee(t, "day-size") } }),
  ap = X((e, t) => {
    const n = U("Day", HP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        date: c,
        disabled: u,
        __staticSelector: d,
        weekend: f,
        outside: m,
        selected: p,
        renderDay: h,
        inRange: S,
        firstInRange: v,
        lastInRange: w,
        hidden: g,
        static: b,
        ...C
      } = n,
      E = ue({
        name: d || "Day",
        classes: Dw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: UP,
        rootSelector: "day",
      }),
      _ = sn();
    return x.jsx(Pn, {
      ...E("day", { style: g ? { display: "none" } : void 0 }),
      component: b ? "div" : "button",
      ref: t,
      disabled: u,
      "data-today":
        Q(c).isSame(bo("add", new Date(), _.getTimezone()), "day") || void 0,
      "data-hidden": g || void 0,
      "data-disabled": u || void 0,
      "data-weekend": (!u && !m && f) || void 0,
      "data-outside": (!u && m) || void 0,
      "data-selected": (!u && p) || void 0,
      "data-in-range": (S && !u) || void 0,
      "data-first-in-range": (v && !u) || void 0,
      "data-last-in-range": (w && !u) || void 0,
      "data-static": b || void 0,
      unstyled: l,
      ...C,
      children: (h == null ? void 0 : h(c)) || c.getDate(),
    });
  });
ap.classes = Dw;
ap.displayName = "@mantine/dates/Day";
function WP({ locale: e, format: t = "dd", firstDayOfWeek: n = 1 }) {
  const r = Q().day(n),
    o = [];
  for (let s = 0; s < 7; s += 1)
    typeof t == "string"
      ? o.push(Q(r).add(s, "days").locale(e).format(t))
      : o.push(t(Q(r).add(s, "days").toDate()));
  return o;
}
var Pw = { weekday: "m_18a3eca" };
const YP = {},
  KP = (e, { size: t }) => ({
    weekdaysRow: { "--wr-fz": et(t), "--wr-spacing": aa(t) },
  }),
  cp = X((e, t) => {
    const n = U("WeekdaysRow", YP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        locale: c,
        firstDayOfWeek: u,
        weekdayFormat: d,
        cellComponent: f = "th",
        __staticSelector: m,
        ...p
      } = n,
      h = ue({
        name: m || "WeekdaysRow",
        classes: Pw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: KP,
        rootSelector: "weekdaysRow",
      }),
      S = sn(),
      v = WP({
        locale: S.getLocale(c),
        format: d,
        firstDayOfWeek: S.getFirstDayOfWeek(u),
      }).map((w, g) => x.jsx(f, { ...h("weekday"), children: w }, g));
    return x.jsx(G, {
      component: "tr",
      ref: t,
      ...h("weekdaysRow"),
      ...p,
      children: v,
    });
  });
cp.classes = Pw;
cp.displayName = "@mantine/dates/WeekdaysRow";
function qP(e, t = 1) {
  const n = new Date(e),
    r = t === 0 ? 6 : t - 1;
  for (; n.getDay() !== r; ) n.setDate(n.getDate() + 1);
  return n;
}
function GP(e, t = 1) {
  const n = new Date(e);
  for (; n.getDay() !== t; ) n.setDate(n.getDate() - 1);
  return n;
}
function XP({ month: e, firstDayOfWeek: t = 1, consistentWeeks: n }) {
  const r = e.getMonth(),
    o = new Date(e.getFullYear(), r, 1),
    s = new Date(e.getFullYear(), e.getMonth() + 1, 0),
    i = qP(s, t),
    l = GP(o, t),
    a = [];
  for (; l <= i; ) {
    const c = [];
    for (let u = 0; u < 7; u += 1)
      c.push(new Date(l)), l.setDate(l.getDate() + 1);
    a.push(c);
  }
  if (n && a.length < 6) {
    const c = a[a.length - 1],
      u = c[c.length - 1],
      d = new Date(u);
    for (d.setDate(d.getDate() + 1); a.length < 6; ) {
      const f = [];
      for (let m = 0; m < 7; m += 1)
        f.push(new Date(d)), d.setDate(d.getDate() + 1);
      a.push(f);
    }
  }
  return a;
}
function Tw(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth();
}
function Nw(e, t) {
  return t instanceof Date ? Q(e).isAfter(Q(t).subtract(1, "day"), "day") : !0;
}
function Ow(e, t) {
  return t instanceof Date ? Q(e).isBefore(Q(t).add(1, "day"), "day") : !0;
}
function QP(e, t, n, r, o, s, i) {
  const l = e.flat().filter((u) => {
      var d;
      return (
        Ow(u, n) &&
        Nw(u, t) &&
        !(o != null && o(u)) &&
        !((d = r == null ? void 0 : r(u)) != null && d.disabled) &&
        (!s || Tw(u, i))
      );
    }),
    a = l.find((u) => {
      var d;
      return (d = r == null ? void 0 : r(u)) == null ? void 0 : d.selected;
    });
  if (a) return a;
  const c = l.find((u) => Q().isSame(u, "date"));
  return c || l[0];
}
var jw = { month: "m_cc9820d3", monthCell: "m_8f457cd5" };
const JP = { withCellSpacing: !0 },
  Pa = X((e, t) => {
    const n = U("Month", JP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        locale: u,
        firstDayOfWeek: d,
        weekdayFormat: f,
        month: m,
        weekendDays: p,
        getDayProps: h,
        excludeDate: S,
        minDate: v,
        maxDate: w,
        renderDay: g,
        hideOutsideDates: b,
        hideWeekdays: C,
        getDayAriaLabel: E,
        static: _,
        __getDayRef: D,
        __onDayKeyDown: L,
        __onDayClick: N,
        __onDayMouseEnter: M,
        __preventFocus: B,
        __stopPropagation: V,
        withCellSpacing: A,
        size: j,
        ...P
      } = n,
      T = ue({
        name: c || "Month",
        classes: jw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "month",
      }),
      R = sn(),
      k = XP({
        month: m,
        firstDayOfWeek: R.getFirstDayOfWeek(d),
        consistentWeeks: R.consistentWeeks,
      }),
      $ = QP(k, v, w, h, S, b, m),
      { resolvedClassNames: O, resolvedStyles: I } = Bo({
        classNames: r,
        styles: i,
        props: n,
      }),
      K = k.map((J, ee) => {
        const ne = J.map((te, me) => {
          const oe = !Tw(te, m),
            le =
              (E == null ? void 0 : E(te)) ||
              Q(te)
                .locale(u || R.locale)
                .format("D MMMM YYYY"),
            Z = h == null ? void 0 : h(te),
            ge = Q(te).isSame($, "date");
          return x.jsx(
            "td",
            {
              ...T("monthCell"),
              "data-with-spacing": A || void 0,
              children: x.jsx(ap, {
                __staticSelector: c || "Month",
                classNames: O,
                styles: I,
                unstyled: l,
                "data-mantine-stop-propagation": V || void 0,
                renderDay: g,
                date: te,
                size: j,
                weekend: R.getWeekendDays(p).includes(te.getDay()),
                outside: oe,
                hidden: b ? oe : !1,
                "aria-label": le,
                static: _,
                disabled:
                  (S == null ? void 0 : S(te)) || !Ow(te, w) || !Nw(te, v),
                ref: (ce) => (D == null ? void 0 : D(ee, me, ce)),
                ...Z,
                onKeyDown: (ce) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onKeyDown) == null ||
                    se.call(Z, ce),
                    L == null ||
                      L(ce, { rowIndex: ee, cellIndex: me, date: te });
                },
                onMouseEnter: (ce) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onMouseEnter) == null ||
                    se.call(Z, ce),
                    M == null || M(ce, te);
                },
                onClick: (ce) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onClick) == null ||
                    se.call(Z, ce),
                    N == null || N(ce, te);
                },
                onMouseDown: (ce) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onMouseDown) == null ||
                    se.call(Z, ce),
                    B && ce.preventDefault();
                },
                tabIndex: B || !ge ? -1 : 0,
              }),
            },
            te.toString()
          );
        });
        return x.jsx("tr", { ...T("monthRow"), children: ne }, ee);
      });
    return x.jsxs(G, {
      component: "table",
      ...T("month"),
      size: j,
      ref: t,
      ...P,
      children: [
        !C &&
          x.jsx("thead", {
            ...T("monthThead"),
            children: x.jsx(cp, {
              __staticSelector: c || "Month",
              locale: u,
              firstDayOfWeek: d,
              weekdayFormat: f,
              size: j,
              classNames: O,
              styles: I,
              unstyled: l,
            }),
          }),
        x.jsx("tbody", { ...T("monthTbody"), children: K }),
      ],
    });
  });
Pa.classes = jw;
Pa.displayName = "@mantine/dates/Month";
var $w = { pickerControl: "m_dc6a3c71" };
const ZP = {},
  eT = (e, { size: t }) => ({
    pickerControl: { "--dpc-fz": et(t), "--dpc-size": Ee(t, "dpc-size") },
  }),
  Ta = X((e, t) => {
    const n = U("PickerControl", ZP, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        firstInRange: c,
        lastInRange: u,
        inRange: d,
        __staticSelector: f,
        selected: m,
        disabled: p,
        ...h
      } = n,
      S = ue({
        name: f || "PickerControl",
        classes: $w,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: eT,
        rootSelector: "pickerControl",
      });
    return x.jsx(Pn, {
      ...S("pickerControl"),
      ref: t,
      unstyled: l,
      "data-picker-control": !0,
      "data-selected": (m && !p) || void 0,
      "data-disabled": p || void 0,
      "data-in-range": (d && !p && !m) || void 0,
      "data-first-in-range": (c && !p) || void 0,
      "data-last-in-range": (u && !p) || void 0,
      disabled: p,
      ...h,
    });
  });
Ta.classes = $w;
Ta.displayName = "@mantine/dates/PickerControl";
function Lw(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && Q(e).isBefore(t, "year")) || (n && Q(e).isAfter(n, "year")));
}
function tT(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !Lw(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => Q().isSame(l, "year"));
  return i || o[0];
}
function Aw(e) {
  const t = e.getFullYear(),
    n = t - (t % 10);
  let r = 0;
  const o = [[], [], [], []];
  for (let s = 0; s < 4; s += 1) {
    const i = s === 3 ? 1 : 3;
    for (let l = 0; l < i; l += 1) o[s].push(new Date(n + r, 0)), (r += 1);
  }
  return o;
}
var Fw = { yearsList: "m_9206547b", yearsListCell: "m_c5a19c7d" };
const nT = { yearsListFormat: "YYYY", withCellSpacing: !0 },
  Na = X((e, t) => {
    const n = U("YearsList", nT, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        decade: c,
        yearsListFormat: u,
        locale: d,
        minDate: f,
        maxDate: m,
        getYearControlProps: p,
        __staticSelector: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: w,
        __onControlMouseEnter: g,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: _,
        ...D
      } = n,
      L = ue({
        name: h || "YearsList",
        classes: Fw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "yearsList",
      }),
      N = sn(),
      M = Aw(c),
      B = tT(M, f, m, p),
      V = M.map((A, j) => {
        const P = A.map((T, R) => {
          const k = p == null ? void 0 : p(T),
            $ = Q(T).isSame(B, "year");
          return x.jsx(
            "td",
            {
              ...L("yearsListCell"),
              "data-with-spacing": E || void 0,
              children: x.jsx(Ta, {
                ...L("yearsListControl"),
                size: _,
                unstyled: l,
                "data-mantine-stop-propagation": C || void 0,
                disabled: Lw(T, f, m),
                ref: (O) => (S == null ? void 0 : S(j, R, O)),
                ...k,
                onKeyDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, O),
                    v == null || v(O, { rowIndex: j, cellIndex: R, date: T });
                },
                onClick: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, O),
                    w == null || w(O, T);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, O),
                    g == null || g(O, T);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: Q(T).locale(N.getLocale(d)).format(u),
              }),
            },
            R
          );
        });
        return x.jsx("tr", { ...L("yearsListRow"), children: P }, j);
      });
    return x.jsx(G, {
      component: "table",
      ref: t,
      size: _,
      ...L("yearsList"),
      ...D,
      children: x.jsx("tbody", { children: V }),
    });
  });
Na.classes = Fw;
Na.displayName = "@mantine/dates/YearsList";
function Mw(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && Q(e).isBefore(t, "month")) || (n && Q(e).isAfter(n, "month")));
}
function rT(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !Mw(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => Q().isSame(l, "month"));
  return i || o[0];
}
function oT(e) {
  const t = Q(e).startOf("year").toDate(),
    n = [[], [], [], []];
  let r = 0;
  for (let o = 0; o < 4; o += 1)
    for (let s = 0; s < 3; s += 1)
      n[o].push(Q(t).add(r, "months").toDate()), (r += 1);
  return n;
}
var Iw = { monthsList: "m_2a6c32d", monthsListCell: "m_fe27622f" };
const sT = { monthsListFormat: "MMM", withCellSpacing: !0 },
  Oa = X((e, t) => {
    const n = U("MonthsList", sT, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        year: u,
        monthsListFormat: d,
        locale: f,
        minDate: m,
        maxDate: p,
        getMonthControlProps: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: w,
        __onControlMouseEnter: g,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: _,
        ...D
      } = n,
      L = ue({
        name: c || "MonthsList",
        classes: Iw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "monthsList",
      }),
      N = sn(),
      M = oT(u),
      B = rT(M, m, p, h),
      V = M.map((A, j) => {
        const P = A.map((T, R) => {
          const k = h == null ? void 0 : h(T),
            $ = Q(T).isSame(B, "month");
          return x.jsx(
            "td",
            {
              ...L("monthsListCell"),
              "data-with-spacing": E || void 0,
              children: x.jsx(Ta, {
                ...L("monthsListControl"),
                size: _,
                unstyled: l,
                __staticSelector: c || "MonthsList",
                "data-mantine-stop-propagation": C || void 0,
                disabled: Mw(T, m, p),
                ref: (O) => (S == null ? void 0 : S(j, R, O)),
                ...k,
                onKeyDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, O),
                    v == null || v(O, { rowIndex: j, cellIndex: R, date: T });
                },
                onClick: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, O),
                    w == null || w(O, T);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, O),
                    g == null || g(O, T);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: Q(T).locale(N.getLocale(f)).format(d),
              }),
            },
            R
          );
        });
        return x.jsx("tr", { ...L("monthsListRow"), children: P }, j);
      });
    return x.jsx(G, {
      component: "table",
      ref: t,
      size: _,
      ...L("monthsList"),
      ...D,
      children: x.jsx("tbody", { children: V }),
    });
  });
Oa.classes = Iw;
Oa.displayName = "@mantine/dates/MonthsList";
var zw = {
  calendarHeader: "m_730a79ed",
  calendarHeaderLevel: "m_f6645d97",
  calendarHeaderControl: "m_2351eeb0",
  calendarHeaderControlIcon: "m_367dc749",
};
const iT = {
    nextDisabled: !1,
    previousDisabled: !1,
    hasNextLevel: !0,
    withNext: !0,
    withPrevious: !0,
  },
  lT = (e, { size: t }) => ({
    calendarHeader: {
      "--dch-control-size": Ee(t, "dch-control-size"),
      "--dch-fz": et(t),
    },
  }),
  hr = X((e, t) => {
    const n = U("CalendarHeader", iT, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        nextIcon: c,
        previousIcon: u,
        nextLabel: d,
        previousLabel: f,
        onNext: m,
        onPrevious: p,
        onLevelClick: h,
        label: S,
        nextDisabled: v,
        previousDisabled: w,
        hasNextLevel: g,
        levelControlAriaLabel: b,
        withNext: C,
        withPrevious: E,
        __staticSelector: _,
        __preventFocus: D,
        __stopPropagation: L,
        ...N
      } = n,
      M = ue({
        name: _ || "CalendarHeader",
        classes: zw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: lT,
        rootSelector: "calendarHeader",
      }),
      B = D ? (V) => V.preventDefault() : void 0;
    return x.jsxs(G, {
      ...M("calendarHeader"),
      ref: t,
      ...N,
      children: [
        E &&
          x.jsx(Pn, {
            ...M("calendarHeaderControl"),
            "data-direction": "previous",
            "aria-label": f,
            onClick: p,
            unstyled: l,
            onMouseDown: B,
            disabled: w,
            "data-disabled": w || void 0,
            tabIndex: D || w ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              u ||
              x.jsx(Uu, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "previous",
                size: "45%",
              }),
          }),
        x.jsx(Pn, {
          component: g ? "button" : "div",
          ...M("calendarHeaderLevel"),
          onClick: g ? h : void 0,
          unstyled: l,
          onMouseDown: g ? B : void 0,
          disabled: !g,
          "data-static": !g || void 0,
          "aria-label": b,
          tabIndex: D || !g ? -1 : 0,
          "data-mantine-stop-propagation": L || void 0,
          children: S,
        }),
        C &&
          x.jsx(Pn, {
            ...M("calendarHeaderControl"),
            "data-direction": "next",
            "aria-label": d,
            onClick: m,
            unstyled: l,
            onMouseDown: B,
            disabled: v,
            "data-disabled": v || void 0,
            tabIndex: D || v ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              c ||
              x.jsx(Uu, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "next",
                size: "45%",
              }),
          }),
      ],
    });
  });
hr.classes = zw;
hr.displayName = "@mantine/dates/CalendarHeader";
function aT(e) {
  const t = Aw(e);
  return [t[0][0], t[3][0]];
}
const cT = { decadeLabelFormat: "YYYY" },
  ja = X((e, t) => {
    const n = U("DecadeLevel", cT, e),
      {
        decade: r,
        locale: o,
        minDate: s,
        maxDate: i,
        yearsListFormat: l,
        getYearControlProps: a,
        __getControlRef: c,
        __onControlKeyDown: u,
        __onControlClick: d,
        __onControlMouseEnter: f,
        withCellSpacing: m,
        __preventFocus: p,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: w,
        onNext: g,
        onPrevious: b,
        nextDisabled: C,
        previousDisabled: E,
        levelControlAriaLabel: _,
        withNext: D,
        withPrevious: L,
        decadeLabelFormat: N,
        classNames: M,
        styles: B,
        unstyled: V,
        __staticSelector: A,
        __stopPropagation: j,
        size: P,
        ...T
      } = n,
      R = sn(),
      [k, $] = aT(r),
      O = {
        __staticSelector: A || "DecadeLevel",
        classNames: M,
        styles: B,
        unstyled: V,
        size: P,
      },
      I = typeof C == "boolean" ? C : i ? !Q($).endOf("year").isBefore(i) : !1,
      K = typeof E == "boolean" ? E : s ? !Q(k).startOf("year").isAfter(s) : !1,
      J = (ee, ne) =>
        Q(ee)
          .locale(o || R.locale)
          .format(ne);
    return x.jsxs(G, {
      "data-decade-level": !0,
      size: P,
      ref: t,
      ...T,
      children: [
        x.jsx(hr, {
          label: typeof N == "function" ? N(k, $) : `${J(k, N)} – ${J($, N)}`,
          __preventFocus: p,
          __stopPropagation: j,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: w,
          onNext: g,
          onPrevious: b,
          nextDisabled: I,
          previousDisabled: K,
          hasNextLevel: !1,
          levelControlAriaLabel: _,
          withNext: D,
          withPrevious: L,
          ...O,
        }),
        x.jsx(Na, {
          decade: r,
          locale: o,
          minDate: s,
          maxDate: i,
          yearsListFormat: l,
          getYearControlProps: a,
          __getControlRef: c,
          __onControlKeyDown: u,
          __onControlClick: d,
          __onControlMouseEnter: f,
          __preventFocus: p,
          __stopPropagation: j,
          withCellSpacing: m,
          ...O,
        }),
      ],
    });
  });
ja.classes = { ...Na.classes, ...hr.classes };
ja.displayName = "@mantine/dates/DecadeLevel";
const uT = { yearLabelFormat: "YYYY" },
  $a = X((e, t) => {
    const n = U("YearLevel", uT, e),
      {
        year: r,
        locale: o,
        minDate: s,
        maxDate: i,
        monthsListFormat: l,
        getMonthControlProps: a,
        __getControlRef: c,
        __onControlKeyDown: u,
        __onControlClick: d,
        __onControlMouseEnter: f,
        withCellSpacing: m,
        __preventFocus: p,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: w,
        onNext: g,
        onPrevious: b,
        onLevelClick: C,
        nextDisabled: E,
        previousDisabled: _,
        hasNextLevel: D,
        levelControlAriaLabel: L,
        withNext: N,
        withPrevious: M,
        yearLabelFormat: B,
        __staticSelector: V,
        __stopPropagation: A,
        size: j,
        classNames: P,
        styles: T,
        unstyled: R,
        ...k
      } = n,
      $ = sn(),
      O = {
        __staticSelector: V || "YearLevel",
        classNames: P,
        styles: T,
        unstyled: R,
        size: j,
      },
      I = typeof E == "boolean" ? E : i ? !Q(r).endOf("year").isBefore(i) : !1,
      K = typeof _ == "boolean" ? _ : s ? !Q(r).startOf("year").isAfter(s) : !1;
    return x.jsxs(G, {
      "data-year-level": !0,
      size: j,
      ref: t,
      ...k,
      children: [
        x.jsx(hr, {
          label:
            typeof B == "function"
              ? B(r)
              : Q(r)
                  .locale(o || $.locale)
                  .format(B),
          __preventFocus: p,
          __stopPropagation: A,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: w,
          onNext: g,
          onPrevious: b,
          onLevelClick: C,
          nextDisabled: I,
          previousDisabled: K,
          hasNextLevel: D,
          levelControlAriaLabel: L,
          withNext: N,
          withPrevious: M,
          ...O,
        }),
        x.jsx(Oa, {
          year: r,
          locale: o,
          minDate: s,
          maxDate: i,
          monthsListFormat: l,
          getMonthControlProps: a,
          __getControlRef: c,
          __onControlKeyDown: u,
          __onControlClick: d,
          __onControlMouseEnter: f,
          __preventFocus: p,
          __stopPropagation: A,
          withCellSpacing: m,
          ...O,
        }),
      ],
    });
  });
$a.classes = { ...hr.classes, ...Oa.classes };
$a.displayName = "@mantine/dates/YearLevel";
const dT = { monthLabelFormat: "MMMM YYYY" },
  La = X((e, t) => {
    const n = U("MonthLevel", dT, e),
      {
        month: r,
        locale: o,
        firstDayOfWeek: s,
        weekdayFormat: i,
        weekendDays: l,
        getDayProps: a,
        excludeDate: c,
        minDate: u,
        maxDate: d,
        renderDay: f,
        hideOutsideDates: m,
        hideWeekdays: p,
        getDayAriaLabel: h,
        __getDayRef: S,
        __onDayKeyDown: v,
        __onDayClick: w,
        __onDayMouseEnter: g,
        withCellSpacing: b,
        __preventFocus: C,
        __stopPropagation: E,
        nextIcon: _,
        previousIcon: D,
        nextLabel: L,
        previousLabel: N,
        onNext: M,
        onPrevious: B,
        onLevelClick: V,
        nextDisabled: A,
        previousDisabled: j,
        hasNextLevel: P,
        levelControlAriaLabel: T,
        withNext: R,
        withPrevious: k,
        monthLabelFormat: $,
        classNames: O,
        styles: I,
        unstyled: K,
        __staticSelector: J,
        size: ee,
        static: ne,
        ...te
      } = n,
      me = sn(),
      oe = {
        __staticSelector: J || "MonthLevel",
        classNames: O,
        styles: I,
        unstyled: K,
        size: ee,
      },
      le =
        typeof A == "boolean" ? A : d ? !Q(r).endOf("month").isBefore(d) : !1,
      Z =
        typeof j == "boolean" ? j : u ? !Q(r).startOf("month").isAfter(u) : !1;
    return x.jsxs(G, {
      "data-month-level": !0,
      size: ee,
      ref: t,
      ...te,
      children: [
        x.jsx(hr, {
          label:
            typeof $ == "function"
              ? $(r)
              : Q(r)
                  .locale(o || me.locale)
                  .format($),
          __preventFocus: C,
          __stopPropagation: E,
          nextIcon: _,
          previousIcon: D,
          nextLabel: L,
          previousLabel: N,
          onNext: M,
          onPrevious: B,
          onLevelClick: V,
          nextDisabled: le,
          previousDisabled: Z,
          hasNextLevel: P,
          levelControlAriaLabel: T,
          withNext: R,
          withPrevious: k,
          ...oe,
        }),
        x.jsx(Pa, {
          month: r,
          locale: o,
          firstDayOfWeek: s,
          weekdayFormat: i,
          weekendDays: l,
          getDayProps: a,
          excludeDate: c,
          minDate: u,
          maxDate: d,
          renderDay: f,
          hideOutsideDates: m,
          hideWeekdays: p,
          getDayAriaLabel: h,
          __getDayRef: S,
          __onDayKeyDown: v,
          __onDayClick: w,
          __onDayMouseEnter: g,
          __preventFocus: C,
          __stopPropagation: E,
          static: ne,
          withCellSpacing: b,
          ...oe,
        }),
      ],
    });
  });
La.classes = { ...Pa.classes, ...hr.classes };
La.displayName = "@mantine/dates/MonthLevel";
var Bw = { levelsGroup: "m_30b26e33" };
const fT = {},
  gr = X((e, t) => {
    const n = U("LevelsGroup", fT, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        ...u
      } = n,
      d = ue({
        name: c || "LevelsGroup",
        classes: Bw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "levelsGroup",
      });
    return x.jsx(G, { ref: t, ...d("levelsGroup"), ...u });
  });
gr.classes = Bw;
gr.displayName = "@mantine/dates/LevelsGroup";
const pT = { numberOfColumns: 1 },
  Aa = X((e, t) => {
    const n = U("DecadeLevelGroup", pT, e),
      {
        decade: r,
        locale: o,
        minDate: s,
        maxDate: i,
        yearsListFormat: l,
        getYearControlProps: a,
        __onControlClick: c,
        __onControlMouseEnter: u,
        withCellSpacing: d,
        __preventFocus: f,
        nextIcon: m,
        previousIcon: p,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: w,
        nextDisabled: g,
        previousDisabled: b,
        classNames: C,
        styles: E,
        unstyled: _,
        __staticSelector: D,
        __stopPropagation: L,
        numberOfColumns: N,
        levelControlAriaLabel: M,
        decadeLabelFormat: B,
        size: V,
        vars: A,
        ...j
      } = n,
      P = y.useRef([]),
      T = Array(N)
        .fill(0)
        .map((R, k) => {
          const $ = Q(r)
            .add(k * 10, "years")
            .toDate();
          return x.jsx(
            ja,
            {
              size: V,
              yearsListFormat: l,
              decade: $,
              withNext: k === N - 1,
              withPrevious: k === 0,
              decadeLabelFormat: B,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (O, I) =>
                lp({
                  levelIndex: k,
                  rowIndex: I.rowIndex,
                  cellIndex: I.cellIndex,
                  event: O,
                  controlsRef: P,
                }),
              __getControlRef: (O, I, K) => {
                Array.isArray(P.current[k]) || (P.current[k] = []),
                  Array.isArray(P.current[k][O]) || (P.current[k][O] = []),
                  (P.current[k][O][I] = K);
              },
              levelControlAriaLabel: typeof M == "function" ? M($) : M,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: f,
              __stopPropagation: L,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: w,
              nextDisabled: g,
              previousDisabled: b,
              getYearControlProps: a,
              __staticSelector: D || "DecadeLevelGroup",
              classNames: C,
              styles: E,
              unstyled: _,
              withCellSpacing: d,
            },
            k
          );
        });
    return x.jsx(gr, {
      classNames: C,
      styles: E,
      __staticSelector: D || "DecadeLevelGroup",
      ref: t,
      size: V,
      unstyled: _,
      ...j,
      children: T,
    });
  });
Aa.classes = { ...gr.classes, ...ja.classes };
Aa.displayName = "@mantine/dates/DecadeLevelGroup";
const mT = { numberOfColumns: 1 },
  Fa = X((e, t) => {
    const n = U("YearLevelGroup", mT, e),
      {
        year: r,
        locale: o,
        minDate: s,
        maxDate: i,
        monthsListFormat: l,
        getMonthControlProps: a,
        __onControlClick: c,
        __onControlMouseEnter: u,
        withCellSpacing: d,
        __preventFocus: f,
        nextIcon: m,
        previousIcon: p,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: w,
        onLevelClick: g,
        nextDisabled: b,
        previousDisabled: C,
        hasNextLevel: E,
        classNames: _,
        styles: D,
        unstyled: L,
        __staticSelector: N,
        __stopPropagation: M,
        numberOfColumns: B,
        levelControlAriaLabel: V,
        yearLabelFormat: A,
        size: j,
        vars: P,
        ...T
      } = n,
      R = y.useRef([]),
      k = Array(B)
        .fill(0)
        .map(($, O) => {
          const I = Q(r).add(O, "years").toDate();
          return x.jsx(
            $a,
            {
              size: j,
              monthsListFormat: l,
              year: I,
              withNext: O === B - 1,
              withPrevious: O === 0,
              yearLabelFormat: A,
              __stopPropagation: M,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (K, J) =>
                lp({
                  levelIndex: O,
                  rowIndex: J.rowIndex,
                  cellIndex: J.cellIndex,
                  event: K,
                  controlsRef: R,
                }),
              __getControlRef: (K, J, ee) => {
                Array.isArray(R.current[O]) || (R.current[O] = []),
                  Array.isArray(R.current[O][K]) || (R.current[O][K] = []),
                  (R.current[O][K][J] = ee);
              },
              levelControlAriaLabel: typeof V == "function" ? V(I) : V,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: f,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: w,
              onLevelClick: g,
              nextDisabled: b,
              previousDisabled: C,
              hasNextLevel: E,
              getMonthControlProps: a,
              classNames: _,
              styles: D,
              unstyled: L,
              __staticSelector: N || "YearLevelGroup",
              withCellSpacing: d,
            },
            O
          );
        });
    return x.jsx(gr, {
      classNames: _,
      styles: D,
      __staticSelector: N || "YearLevelGroup",
      ref: t,
      size: j,
      unstyled: L,
      ...T,
      children: k,
    });
  });
Fa.classes = { ...$a.classes, ...gr.classes };
Fa.displayName = "@mantine/dates/YearLevelGroup";
const hT = { numberOfColumns: 1 },
  Ma = X((e, t) => {
    const n = U("MonthLevelGroup", hT, e),
      {
        month: r,
        locale: o,
        firstDayOfWeek: s,
        weekdayFormat: i,
        weekendDays: l,
        getDayProps: a,
        excludeDate: c,
        minDate: u,
        maxDate: d,
        renderDay: f,
        hideOutsideDates: m,
        hideWeekdays: p,
        getDayAriaLabel: h,
        __onDayClick: S,
        __onDayMouseEnter: v,
        withCellSpacing: w,
        __preventFocus: g,
        nextIcon: b,
        previousIcon: C,
        nextLabel: E,
        previousLabel: _,
        onNext: D,
        onPrevious: L,
        onLevelClick: N,
        nextDisabled: M,
        previousDisabled: B,
        hasNextLevel: V,
        classNames: A,
        styles: j,
        unstyled: P,
        numberOfColumns: T,
        levelControlAriaLabel: R,
        monthLabelFormat: k,
        __staticSelector: $,
        __stopPropagation: O,
        size: I,
        static: K,
        vars: J,
        ...ee
      } = n,
      ne = y.useRef([]),
      te = Array(T)
        .fill(0)
        .map((me, oe) => {
          const le = Q(r).add(oe, "months").toDate();
          return x.jsx(
            La,
            {
              month: le,
              withNext: oe === T - 1,
              withPrevious: oe === 0,
              monthLabelFormat: k,
              __stopPropagation: O,
              __onDayClick: S,
              __onDayMouseEnter: v,
              __onDayKeyDown: (Z, ge) =>
                lp({
                  levelIndex: oe,
                  rowIndex: ge.rowIndex,
                  cellIndex: ge.cellIndex,
                  event: Z,
                  controlsRef: ne,
                }),
              __getDayRef: (Z, ge, ce) => {
                Array.isArray(ne.current[oe]) || (ne.current[oe] = []),
                  Array.isArray(ne.current[oe][Z]) || (ne.current[oe][Z] = []),
                  (ne.current[oe][Z][ge] = ce);
              },
              levelControlAriaLabel: typeof R == "function" ? R(le) : R,
              locale: o,
              firstDayOfWeek: s,
              weekdayFormat: i,
              weekendDays: l,
              getDayProps: a,
              excludeDate: c,
              minDate: u,
              maxDate: d,
              renderDay: f,
              hideOutsideDates: m,
              hideWeekdays: p,
              getDayAriaLabel: h,
              __preventFocus: g,
              nextIcon: b,
              previousIcon: C,
              nextLabel: E,
              previousLabel: _,
              onNext: D,
              onPrevious: L,
              onLevelClick: N,
              nextDisabled: M,
              previousDisabled: B,
              hasNextLevel: V,
              classNames: A,
              styles: j,
              unstyled: P,
              __staticSelector: $ || "MonthLevelGroup",
              size: I,
              static: K,
              withCellSpacing: w,
            },
            oe
          );
        });
    return x.jsx(gr, {
      classNames: A,
      styles: j,
      __staticSelector: $ || "MonthLevelGroup",
      ref: t,
      size: I,
      ...ee,
      children: te,
    });
  });
Ma.classes = { ...gr.classes, ...La.classes };
Ma.displayName = "@mantine/dates/MonthLevelGroup";
const Vh = (e) => (e === "range" ? [null, null] : e === "multiple" ? [] : null);
function Vw({
  type: e,
  value: t,
  defaultValue: n,
  onChange: r,
  applyTimezone: o = !0,
}) {
  const s = y.useRef(e),
    i = sn(),
    [l, a, c] = $n({
      value: bo("add", t, i.getTimezone(), !o),
      defaultValue: bo("add", n, i.getTimezone(), !o),
      finalValue: Vh(e),
      onChange: (d) => {
        r == null || r(bo("remove", d, i.getTimezone(), !o));
      },
    });
  let u = l;
  return (
    s.current !== e &&
      ((s.current = e), t === void 0 && ((u = n !== void 0 ? n : Vh(e)), a(u))),
    [u, a, c]
  );
}
function Mc(e, t) {
  return e ? (e === "month" ? 0 : e === "year" ? 1 : 2) : t || 0;
}
function gT(e) {
  return e === 0 ? "month" : e === 1 ? "year" : "decade";
}
function us(e, t, n) {
  return gT(Yb(Mc(e, 0), Mc(t, 0), Mc(n, 2)));
}
const yT = {
    maxLevel: "decade",
    minLevel: "month",
    __updateDateOnYearSelect: !0,
    __updateDateOnMonthSelect: !0,
  },
  Ia = X((e, t) => {
    const n = U("Calendar", yT, e),
      {
        vars: r,
        maxLevel: o,
        minLevel: s,
        defaultLevel: i,
        level: l,
        onLevelChange: a,
        date: c,
        defaultDate: u,
        onDateChange: d,
        numberOfColumns: f,
        columnsToScroll: m,
        ariaLabels: p,
        onYearSelect: h,
        onMonthSelect: S,
        onYearMouseEnter: v,
        onMonthMouseEnter: w,
        __updateDateOnYearSelect: g,
        __updateDateOnMonthSelect: b,
        firstDayOfWeek: C,
        weekdayFormat: E,
        weekendDays: _,
        getDayProps: D,
        excludeDate: L,
        renderDay: N,
        hideOutsideDates: M,
        hideWeekdays: B,
        getDayAriaLabel: V,
        monthLabelFormat: A,
        nextIcon: j,
        previousIcon: P,
        __onDayClick: T,
        __onDayMouseEnter: R,
        withCellSpacing: k,
        monthsListFormat: $,
        getMonthControlProps: O,
        yearLabelFormat: I,
        yearsListFormat: K,
        getYearControlProps: J,
        decadeLabelFormat: ee,
        classNames: ne,
        styles: te,
        unstyled: me,
        minDate: oe,
        maxDate: le,
        locale: Z,
        __staticSelector: ge,
        size: ce,
        __preventFocus: se,
        __stopPropagation: je,
        onNextDecade: Ie,
        onPreviousDecade: ye,
        onNextYear: rt,
        onPreviousYear: Te,
        onNextMonth: Le,
        onPreviousMonth: W,
        static: re,
        __timezoneApplied: ie,
        ...Se
      } = n,
      { resolvedClassNames: Ae, resolvedStyles: Pt } = Bo({
        classNames: ne,
        styles: te,
        props: n,
      }),
      [be, Fe] = $n({
        value: l ? us(l, s, o) : void 0,
        defaultValue: i ? us(i, s, o) : void 0,
        finalValue: us(void 0, s, o),
        onChange: a,
      }),
      [an, qe] = Vw({
        type: "default",
        value: c,
        defaultValue: u,
        onChange: d,
        applyTimezone: !ie,
      }),
      Tt = {
        __staticSelector: ge || "Calendar",
        styles: Pt,
        classNames: Ae,
        unstyled: me,
        size: ce,
      },
      yr = sn(),
      cn = m || f || 1,
      Ht = an || bo("add", new Date(), yr.getTimezone()),
      Ka = () => {
        const ke = Q(Ht).add(cn, "month").toDate();
        Le == null || Le(ke), qe(ke);
      },
      Ut = () => {
        const ke = Q(Ht).subtract(cn, "month").toDate();
        W == null || W(ke), qe(ke);
      },
      Xo = () => {
        const ke = Q(Ht).add(cn, "year").toDate();
        rt == null || rt(ke), qe(ke);
      },
      qa = () => {
        const ke = Q(Ht).subtract(cn, "year").toDate();
        Te == null || Te(ke), qe(ke);
      },
      di = () => {
        const ke = Q(Ht)
          .add(10 * cn, "year")
          .toDate();
        Ie == null || Ie(ke), qe(ke);
      },
      Qo = () => {
        const ke = Q(Ht)
          .subtract(10 * cn, "year")
          .toDate();
        ye == null || ye(ke), qe(ke);
      };
    return x.jsxs(G, {
      ref: t,
      size: ce,
      "data-calendar": !0,
      ...Se,
      children: [
        be === "month" &&
          x.jsx(Ma, {
            month: Ht,
            minDate: oe,
            maxDate: le,
            firstDayOfWeek: C,
            weekdayFormat: E,
            weekendDays: _,
            getDayProps: D,
            excludeDate: L,
            renderDay: N,
            hideOutsideDates: M,
            hideWeekdays: B,
            getDayAriaLabel: V,
            onNext: Ka,
            onPrevious: Ut,
            hasNextLevel: o !== "month",
            onLevelClick: () => Fe("year"),
            numberOfColumns: f,
            locale: Z,
            levelControlAriaLabel: p == null ? void 0 : p.monthLevelControl,
            nextLabel: p == null ? void 0 : p.nextMonth,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousMonth,
            previousIcon: P,
            monthLabelFormat: A,
            __onDayClick: T,
            __onDayMouseEnter: R,
            __preventFocus: se,
            __stopPropagation: je,
            static: re,
            withCellSpacing: k,
            ...Tt,
          }),
        be === "year" &&
          x.jsx(Fa, {
            year: Ht,
            numberOfColumns: f,
            minDate: oe,
            maxDate: le,
            monthsListFormat: $,
            getMonthControlProps: O,
            locale: Z,
            onNext: Xo,
            onPrevious: qa,
            hasNextLevel: o !== "month" && o !== "year",
            onLevelClick: () => Fe("decade"),
            levelControlAriaLabel: p == null ? void 0 : p.yearLevelControl,
            nextLabel: p == null ? void 0 : p.nextYear,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousYear,
            previousIcon: P,
            yearLabelFormat: I,
            __onControlMouseEnter: w,
            __onControlClick: (ke, Nt) => {
              b && qe(Nt), Fe(us("month", s, o)), S == null || S(Nt);
            },
            __preventFocus: se,
            __stopPropagation: je,
            withCellSpacing: k,
            ...Tt,
          }),
        be === "decade" &&
          x.jsx(Aa, {
            decade: Ht,
            minDate: oe,
            maxDate: le,
            yearsListFormat: K,
            getYearControlProps: J,
            locale: Z,
            onNext: di,
            onPrevious: Qo,
            numberOfColumns: f,
            nextLabel: p == null ? void 0 : p.nextDecade,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousDecade,
            previousIcon: P,
            decadeLabelFormat: ee,
            __onControlMouseEnter: v,
            __onControlClick: (ke, Nt) => {
              g && qe(Nt), Fe(us("year", s, o)), h == null || h(Nt);
            },
            __preventFocus: se,
            __stopPropagation: je,
            withCellSpacing: k,
            ...Tt,
          }),
      ],
    });
  });
Ia.classes = { ...Aa.classes, ...Fa.classes, ...Ma.classes };
Ia.displayName = "@mantine/dates/Calendar";
function Hh(e, t) {
  const n = [...t].sort((r, o) => r.getTime() - o.getTime());
  return (
    Q(n[0]).startOf("day").subtract(1, "ms").isBefore(e) &&
    Q(n[1]).endOf("day").add(1, "ms").isAfter(e)
  );
}
function vT({
  type: e,
  level: t,
  value: n,
  defaultValue: r,
  onChange: o,
  allowSingleDateInRange: s,
  allowDeselect: i,
  onMouseLeave: l,
  applyTimezone: a = !0,
}) {
  const [c, u] = Vw({
      type: e,
      value: n,
      defaultValue: r,
      onChange: o,
      applyTimezone: a,
    }),
    [d, f] = y.useState(e === "range" && c[0] && !c[1] ? c[0] : null),
    [m, p] = y.useState(null),
    h = (E) => {
      if (e === "range") {
        if (d instanceof Date && !c[1]) {
          if (Q(E).isSame(d, t) && !s) {
            f(null), p(null), u([null, null]);
            return;
          }
          const _ = [E, d];
          _.sort((D, L) => D.getTime() - L.getTime()), u(_), p(null), f(null);
          return;
        }
        if (c[0] && !c[1] && Q(E).isSame(c[0], t) && !s) {
          f(null), p(null), u([null, null]);
          return;
        }
        u([E, null]), p(null), f(E);
        return;
      }
      if (e === "multiple") {
        c.some((_) => Q(_).isSame(E, t))
          ? u(c.filter((_) => !Q(_).isSame(E, t)))
          : u([...c, E]);
        return;
      }
      c && i && Q(E).isSame(c, t) ? u(null) : u(E);
    },
    S = (E) =>
      d instanceof Date && m instanceof Date
        ? Hh(E, [m, d])
        : c[0] instanceof Date && c[1] instanceof Date
        ? Hh(E, c)
        : !1,
    v =
      e === "range"
        ? (E) => {
            l == null || l(E), p(null);
          }
        : l,
    w = (E) =>
      c[0] instanceof Date && Q(E).isSame(c[0], t)
        ? !(m && Q(m).isBefore(c[0]))
        : !1,
    g = (E) =>
      c[1] instanceof Date
        ? Q(E).isSame(c[1], t)
        : !(c[0] instanceof Date) || !m
        ? !1
        : Q(m).isBefore(c[0]) && Q(E).isSame(c[0], t),
    b = (E) => {
      if (e === "range")
        return {
          selected: c.some((D) => D && Q(D).isSame(E, t)),
          inRange: S(E),
          firstInRange: w(E),
          lastInRange: g(E),
          "data-autofocus": (!!c[0] && Q(c[0]).isSame(E, t)) || void 0,
        };
      if (e === "multiple")
        return {
          selected: c.some((D) => D && Q(D).isSame(E, t)),
          "data-autofocus": (!!c[0] && Q(c[0]).isSame(E, t)) || void 0,
        };
      const _ = Q(c).isSame(E, t);
      return { selected: _, "data-autofocus": _ || void 0 };
    },
    C = e === "range" && d ? p : () => {};
  return (
    y.useEffect(() => {
      e === "range" && !c[0] && !c[1] && f(null);
    }, [n]),
    {
      onDateChange: h,
      onRootMouseLeave: v,
      onHoveredDateChange: C,
      getControlProps: b,
      _value: c,
      setValue: u,
    }
  );
}
const wT = { type: "default", defaultLevel: "month", numberOfColumns: 1 },
  up = X((e, t) => {
    const n = U("DatePicker", wT, e),
      {
        classNames: r,
        styles: o,
        vars: s,
        type: i,
        defaultValue: l,
        value: a,
        onChange: c,
        __staticSelector: u,
        getDayProps: d,
        allowSingleDateInRange: f,
        allowDeselect: m,
        onMouseLeave: p,
        numberOfColumns: h,
        hideOutsideDates: S,
        __onDayMouseEnter: v,
        __onDayClick: w,
        __timezoneApplied: g,
        ...b
      } = n,
      {
        onDateChange: C,
        onRootMouseLeave: E,
        onHoveredDateChange: _,
        getControlProps: D,
      } = vT({
        type: i,
        level: "day",
        allowDeselect: m,
        allowSingleDateInRange: f,
        value: a,
        defaultValue: l,
        onChange: c,
        onMouseLeave: p,
        applyTimezone: !g,
      }),
      { resolvedClassNames: L, resolvedStyles: N } = Bo({
        classNames: r,
        styles: o,
        props: n,
      }),
      M = sn();
    return x.jsx(Ia, {
      ref: t,
      minLevel: "month",
      classNames: L,
      styles: N,
      __staticSelector: u || "DatePicker",
      onMouseLeave: E,
      numberOfColumns: h,
      hideOutsideDates: S ?? h !== 1,
      __onDayMouseEnter: (B, V) => {
        _(V), v == null || v(B, V);
      },
      __onDayClick: (B, V) => {
        C(V), w == null || w(B, V);
      },
      getDayProps: (B) => ({ ...D(B), ...(d == null ? void 0 : d(B)) }),
      ...b,
      date: bo("add", b.date, M.getTimezone(), g),
      __timezoneApplied: !0,
    });
  });
up.classes = Ia.classes;
up.displayName = "@mantine/dates/DatePicker";
const dp = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = o.map((u) => u.option),
    [l, a] = y.useState(o.at(0));
  y.useEffect(() => {
    r.setFieldValue(s, l);
  }, []);
  const c = (u) => {
    a(u.value), r.setFieldValue(s, u.value);
  };
  return x.jsx(ep, {
    label: t,
    description: n,
    data: i,
    defaultValue: i.at(0),
    onChange: (u, d) => c(d),
    searchable: !0,
  });
};
dp.defaultProps = {};
dp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  options: Y.array,
};
const fp = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = new Date(),
    l = new Date();
  l.setFullYear(i.getFullYear() + 1);
  const [a, c] = y.useState(l),
    [u, d] = y.useState(a),
    [f, { open: m, close: p }] = Vs(!1);
  y.useEffect(() => {
    localStorage.setItem("embargo", a.toISOString().split("T")[0]);
  }, [a]);
  const h = () =>
      x.jsx(qn, {
        children: x.jsx(mn, {
          onClick: m,
          variant: "default",
          children: "Change embargo date",
        }),
      }),
    S = (w) => {
      const g = new Date(i);
      g.setMonth(i.getMonth() + w), c(g);
    },
    v = () =>
      a.getDate().toString() +
      " " +
      a.toLocaleString("default", { month: "long" }) +
      " " +
      a.getFullYear().toString();
  return x.jsxs("div", {
    children: [
      x.jsxs("header", {
        className: "",
        children: [
          x.jsx("h2", { className: "", children: t }),
          x.jsx("h4", { children: v() }),
          h(),
        ],
      }),
      x.jsxs(on, {
        opened: f,
        onClose: p,
        title: "Select embargo date",
        centered: !0,
        children: [
          x.jsxs(qn, {
            justify: "center",
            children: [
              x.jsx(mn, {
                variant: "default",
                onClick: () => {
                  S(6);
                },
                children: "6 months",
              }),
              x.jsx(mn, {
                variant: "default",
                onClick: () => {
                  S(12);
                },
                children: "12 months",
              }),
              x.jsx(mn, {
                variant: "default",
                onClick: () => {
                  S(18);
                },
                children: "18 months",
              }),
            ],
          }),
          x.jsx(qn, {
            justify: "center",
            children: x.jsxs("p", {
              children: ["New Embargo: ", x.jsx("b", { children: v() })],
            }),
          }),
          x.jsx(qn, {
            justify: "center",
            children: x.jsx(up, { defaultDate: i, value: a, onChange: c }),
          }),
          x.jsxs(qn, {
            justify: "center",
            children: [
              x.jsx(mn, {
                variant: "default",
                onClick: () => {
                  d(a), p();
                },
                children: "Accept",
              }),
              x.jsx(mn, {
                variant: "default",
                onClick: () => {
                  c(u), p();
                },
                children: "Cancel",
              }),
            ],
          }),
        ],
      }),
    ],
  });
};
fp.defaultProps = {};
fp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  options: Y.array,
};
const Hw = "",
  xT = "generic",
  ST = Hw + "/profile/profile/",
  Uw = Hw + "/api/submissions/",
  bT = "https://helpdesk.gfbio.org/browse/",
  CT = (e) => {
    const { title: t, description: n, form: r, options: o, field_id: s } = e,
      i = () => {
        const l = JSON.parse(localStorage.getItem("submission")),
          a = l.broker_submission_id || "",
          c = [];
        let u = 0;
        const d = `mailto:info@gfbio.org?subject=Help with Submission ${a}&body=Dear GFBio Team,`;
        return (
          a.length > 0 &&
            (c.push(
              x.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: x.jsxs("a", {
                    children: [
                      x.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Submission Id: ",
                      x.jsx("br", {}),
                      x.jsx("div", { className: "", children: a }),
                    ],
                  }),
                },
                u
              )
            ),
            u++),
          l.accessionId &&
            l.accessionId.length > 0 &&
            (c.push(
              x.jsxs("div", {
                children: [
                  x.jsx("i", { className: "", "aria-hidden": "true" }),
                  "ENA Accession:",
                  x.jsx("br", {}),
                ],
              })
            ),
            l.accessionId.forEach((f) => {
              c.push(
                x.jsx(
                  "li",
                  {
                    className: "list-group-item",
                    children: x.jsxs("a", {
                      children: [
                        x.jsxs("div", {
                          className: "",
                          children: [
                            x.jsx("span", {
                              style: { fontWeight: 600 },
                              children: "ID",
                            }),
                            ": ",
                            f.pid,
                          ],
                        }),
                        x.jsxs("div", {
                          className: "",
                          style: { marginTop: 0 },
                          children: [
                            x.jsx("span", {
                              style: { fontWeight: 600 },
                              children: "Status",
                            }),
                            ":",
                            " ",
                            f.status,
                          ],
                        }),
                      ],
                    }),
                  },
                  u
                )
              ),
                u++;
            })),
          l.issue &&
            l.issue.length > 0 &&
            (c.push(
              x.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: x.jsxs("a", {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "external",
                    href: bT + l.issue,
                    children: [
                      x.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Ticket:",
                      x.jsx("br", {}),
                      x.jsx("div", { className: "", children: l.issue }),
                    ],
                  }),
                },
                u
              )
            ),
            u++),
          l.readOnly &&
            (c.push(
              x.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: x.jsxs("a", {
                    children: [
                      x.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Status: ",
                      x.jsx("br", {}),
                      x.jsx("div", {
                        className: "",
                        children:
                          "Your data was already archived and only the embargo date can be changed. If you need to make other changes, please contact our team by replying to the corresponding Helpdesk ticket.",
                      }),
                    ],
                  }),
                },
                u
              )
            ),
            u++),
          c.push(
            x.jsx(
              "li",
              {
                className: "list-group-item",
                children: x.jsxs("a", {
                  href: d,
                  className: "external",
                  children: [
                    x.jsx("i", { className: "", "aria-hidden": "true" }),
                    "Do you need Help ?",
                  ],
                }),
              },
              u
            )
          ),
          u++,
          c
        );
      };
    return x.jsxs("div", {
      className: "",
      children: [
        x.jsxs("header", {
          className: "",
          children: [
            x.jsx("h2", { className: "", children: t }),
            x.jsx("p", { className: "" }),
          ],
        }),
        x.jsx("div", {
          className: "",
          children: x.jsx("ul", {
            className: "list-group list-group-flush",
            children: i(),
          }),
        }),
      ],
    });
  },
  ET = () => {
    const e = [
      {
        id: "molecular_template",
        name: "Molecular Data Template:",
        template_link:
          "https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/full_template.csv?ref_type=heads",
        description_link:
          "https://gitlab-pe.gwdg.de/gfbio/molecular-submission-templates/-/blob/master/Template-Description.md",
      },
      {
        id: "biodiversity_template",
        name: "Biodiversity, Ecological and Collection Data Template:",
        template_link:
          "https://species-id.net/o/media/1/1d/GFBio_data_submission_template.zip",
        description_link:
          "https://gfbio.biowikifarm.net/wiki/Data_submission_templates_for_biodiversity,_ecological_and_collection_data",
      },
    ];
    return x.jsxs("div", {
      children: [
        x.jsxs("h4", {
          children: [
            "Metadata Templates",
            " ",
            x.jsxs(Pr, {
              width: 320,
              shadow: "md",
              position: "right",
              withArrow: !0,
              children: [
                x.jsx(Pr.Target, {
                  children: x.jsx("i", {
                    className: "fa fa-question-circle-o",
                    "aria-hidden": "true",
                  }),
                }),
                x.jsx(Pr.Dropdown, {
                  children: x.jsx("p", {
                    children:
                      "Metadata templates are provided to help you structure your data submission. Using a metadata template is optional, but highly recommended. You can modify the existing templates to your needs.",
                  }),
                }),
              ],
            }),
          ],
        }),
        x.jsx("ul", {
          className: "list-group list-group-flush",
          children: e.map((t) =>
            x.jsxs(
              "li",
              {
                className: "list-group-item",
                children: [
                  t.name,
                  x.jsx("br", {}),
                  x.jsxs("a", {
                    href: t.template_link,
                    target: "_blank",
                    children: [
                      x.jsx("i", {
                        className: "fa fa-download",
                        "aria-hidden": "true",
                      }),
                      " CSV Template",
                    ],
                  }),
                  x.jsx("br", {}),
                  x.jsxs("a", {
                    href: t.description_link,
                    target: "_blank",
                    children: [
                      x.jsx("i", {
                        className: "fa fa-book",
                        "aria-hidden": "true",
                      }),
                      " Template Description",
                    ],
                  }),
                ],
              },
              t.id
            )
          ),
        }),
      ],
    });
  },
  pp = (e) => {
    const {
        title: t,
        description: n,
        form: r,
        options: o,
        field_id: s,
        default_value: i,
      } = e,
      l = i ? i.split(",") : [];
    return (
      r.setFieldValue(s, l),
      x.jsx("div", {
        children: x.jsx(
          Ys.Group,
          {
            label: t,
            description: n,
            ...r.getInputProps(s),
            children: o.map(function (a) {
              return x.jsx(Ys, { value: a, label: a });
            }),
          },
          r.key(s)
        ),
      })
    );
  };
pp.defaultProps = { default_value: "" };
pp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
  default_value: Y.string,
};
const mp = (e) => {
  const {
      title: t,
      description: n,
      form: r,
      options: o,
      field_id: s,
      default_value: i,
    } = e,
    l = i ? i.split(",") : [],
    [a, c] = y.useState(l);
  r.setFieldValue(s, a);
  const u = (f) => {
      c(f);
    },
    d = o.map((f) => ({ label: f, value: f }));
  return x.jsx("div", {
    children: x.jsx(Zf, {
      defaultValue: l,
      data: d,
      label: t,
      description: n,
      placeholder: "Select all matching",
      onChange: (f) => {
        u(f);
      },
    }),
  });
};
mp.defaultProps = { default_value: "" };
mp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
  default_value: Y.string,
};
const hp = (e) => {
  const { title: t, description: n, form: r, field_id: o, placeholder: s } = e;
  return x.jsx(
    qf,
    {
      label: t,
      description: n,
      placeholder: s,
      autosize: !0,
      minRows: 2,
      ...r.getInputProps(o),
    },
    r.key(o)
  );
};
hp.defaultProps = { placeholder: "" };
hp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const Il = (e) => {
  const {
    title: t,
    description: n,
    mandatory: r,
    form: o,
    field_id: s,
    placeholder: i,
  } = e;
  return x.jsx(
    Ra,
    {
      label: t,
      description: n,
      placeholder: i,
      required: r,
      ...o.getInputProps(s),
    },
    o.key(s)
  );
};
Il.defaultProps = { placeholder: "" };
Il.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  mandatory: Y.bool.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const Ww = ({ field: e, form: t }) => {
  const n = {
    title: e.title,
    description: e.description,
    default_value: e.default,
    mandatory: e.mandatory,
    options: e.options,
    field_id: e.field_id,
    form: t,
  };
  switch (e.field_type.type) {
    case "text-field":
      return x.jsx(Il, { ...n });
    case "text-area":
      return x.jsx(hp, { ...n });
    case "select-field":
      return x.jsx(dp, { ...n });
    case "file-upload":
      return x.jsx(ip, { ...n });
    case "collapsible-selector":
      return x.jsx(tp, { ...n });
    case "metadata-template":
      return x.jsx(ET, { ...n });
    case "info-box":
      return x.jsx(CT, { ...n });
    case "multiselect-checkboxes":
      return x.jsx(pp, { ...n });
    case "multiselect-dropdown":
      return x.jsx(mp, { ...n });
    case "embargo-date-picker":
      return x.jsx(fp, { ...n });
    case "data-url-field":
      return x.jsx(np, { ...n });
    default:
      return x.jsx(Il, { ...n });
  }
};
Ww.propTypes = { field: Y.object.isRequired, form: Y.object.isRequired };
function Yw(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: kT } = Object.prototype,
  { getPrototypeOf: gp } = Object,
  za = ((e) => (t) => {
    const n = kT.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  ln = (e) => ((e = e.toLowerCase()), (t) => za(t) === e),
  Ba = (e) => (t) => typeof t === e,
  { isArray: qo } = Array,
  Gs = Ba("undefined");
function _T(e) {
  return (
    e !== null &&
    !Gs(e) &&
    e.constructor !== null &&
    !Gs(e.constructor) &&
    Ft(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const Kw = ln("ArrayBuffer");
function RT(e) {
  let t;
  return (
    typeof ArrayBuffer < "u" && ArrayBuffer.isView
      ? (t = ArrayBuffer.isView(e))
      : (t = e && e.buffer && Kw(e.buffer)),
    t
  );
}
const DT = Ba("string"),
  Ft = Ba("function"),
  qw = Ba("number"),
  Va = (e) => e !== null && typeof e == "object",
  PT = (e) => e === !0 || e === !1,
  nl = (e) => {
    if (za(e) !== "object") return !1;
    const t = gp(e);
    return (
      (t === null ||
        t === Object.prototype ||
        Object.getPrototypeOf(t) === null) &&
      !(Symbol.toStringTag in e) &&
      !(Symbol.iterator in e)
    );
  },
  TT = ln("Date"),
  NT = ln("File"),
  OT = ln("Blob"),
  jT = ln("FileList"),
  $T = (e) => Va(e) && Ft(e.pipe),
  LT = (e) => {
    let t;
    return (
      e &&
      ((typeof FormData == "function" && e instanceof FormData) ||
        (Ft(e.append) &&
          ((t = za(e)) === "formdata" ||
            (t === "object" &&
              Ft(e.toString) &&
              e.toString() === "[object FormData]"))))
    );
  },
  AT = ln("URLSearchParams"),
  [FT, MT, IT, zT] = ["ReadableStream", "Request", "Response", "Headers"].map(
    ln
  ),
  BT = (e) =>
    e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function ai(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u") return;
  let r, o;
  if ((typeof e != "object" && (e = [e]), qo(e)))
    for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);
  else {
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      i = s.length;
    let l;
    for (r = 0; r < i; r++) (l = s[r]), t.call(null, e[l], l, e);
  }
}
function Gw(e, t) {
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    o;
  for (; r-- > 0; ) if (((o = n[r]), t === o.toLowerCase())) return o;
  return null;
}
const Xw =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
      ? self
      : typeof window < "u"
      ? window
      : global,
  Qw = (e) => !Gs(e) && e !== Xw;
function Ju() {
  const { caseless: e } = (Qw(this) && this) || {},
    t = {},
    n = (r, o) => {
      const s = (e && Gw(t, o)) || o;
      nl(t[s]) && nl(r)
        ? (t[s] = Ju(t[s], r))
        : nl(r)
        ? (t[s] = Ju({}, r))
        : qo(r)
        ? (t[s] = r.slice())
        : (t[s] = r);
    };
  for (let r = 0, o = arguments.length; r < o; r++)
    arguments[r] && ai(arguments[r], n);
  return t;
}
const VT = (e, t, n, { allOwnKeys: r } = {}) => (
    ai(
      t,
      (o, s) => {
        n && Ft(o) ? (e[s] = Yw(o, n)) : (e[s] = o);
      },
      { allOwnKeys: r }
    ),
    e
  ),
  HT = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  UT = (e, t, n, r) => {
    (e.prototype = Object.create(t.prototype, r)),
      (e.prototype.constructor = e),
      Object.defineProperty(e, "super", { value: t.prototype }),
      n && Object.assign(e.prototype, n);
  },
  WT = (e, t, n, r) => {
    let o, s, i;
    const l = {};
    if (((t = t || {}), e == null)) return t;
    do {
      for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
        (i = o[s]), (!r || r(i, e, t)) && !l[i] && ((t[i] = e[i]), (l[i] = !0));
      e = n !== !1 && gp(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  YT = (e, t, n) => {
    (e = String(e)),
      (n === void 0 || n > e.length) && (n = e.length),
      (n -= t.length);
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  KT = (e) => {
    if (!e) return null;
    if (qo(e)) return e;
    let t = e.length;
    if (!qw(t)) return null;
    const n = new Array(t);
    for (; t-- > 0; ) n[t] = e[t];
    return n;
  },
  qT = (
    (e) => (t) =>
      e && t instanceof e
  )(typeof Uint8Array < "u" && gp(Uint8Array)),
  GT = (e, t) => {
    const r = (e && e[Symbol.iterator]).call(e);
    let o;
    for (; (o = r.next()) && !o.done; ) {
      const s = o.value;
      t.call(e, s[0], s[1]);
    }
  },
  XT = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null; ) r.push(n);
    return r;
  },
  QT = ln("HTMLFormElement"),
  JT = (e) =>
    e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, o) {
      return r.toUpperCase() + o;
    }),
  Uh = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  ZT = ln("RegExp"),
  Jw = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    ai(n, (o, s) => {
      let i;
      (i = t(o, s, e)) !== !1 && (r[s] = i || o);
    }),
      Object.defineProperties(e, r);
  },
  eN = (e) => {
    Jw(e, (t, n) => {
      if (Ft(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1)
        return !1;
      const r = e[n];
      if (Ft(r)) {
        if (((t.enumerable = !1), "writable" in t)) {
          t.writable = !1;
          return;
        }
        t.set ||
          (t.set = () => {
            throw Error("Can not rewrite read-only method '" + n + "'");
          });
      }
    });
  },
  tN = (e, t) => {
    const n = {},
      r = (o) => {
        o.forEach((s) => {
          n[s] = !0;
        });
      };
    return qo(e) ? r(e) : r(String(e).split(t)), n;
  },
  nN = () => {},
  rN = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t),
  Ic = "abcdefghijklmnopqrstuvwxyz",
  Wh = "0123456789",
  Zw = { DIGIT: Wh, ALPHA: Ic, ALPHA_DIGIT: Ic + Ic.toUpperCase() + Wh },
  oN = (e = 16, t = Zw.ALPHA_DIGIT) => {
    let n = "";
    const { length: r } = t;
    for (; e--; ) n += t[(Math.random() * r) | 0];
    return n;
  };
function sN(e) {
  return !!(
    e &&
    Ft(e.append) &&
    e[Symbol.toStringTag] === "FormData" &&
    e[Symbol.iterator]
  );
}
const iN = (e) => {
    const t = new Array(10),
      n = (r, o) => {
        if (Va(r)) {
          if (t.indexOf(r) >= 0) return;
          if (!("toJSON" in r)) {
            t[o] = r;
            const s = qo(r) ? [] : {};
            return (
              ai(r, (i, l) => {
                const a = n(i, o + 1);
                !Gs(a) && (s[l] = a);
              }),
              (t[o] = void 0),
              s
            );
          }
        }
        return r;
      };
    return n(e, 0);
  },
  lN = ln("AsyncFunction"),
  aN = (e) => e && (Va(e) || Ft(e)) && Ft(e.then) && Ft(e.catch),
  F = {
    isArray: qo,
    isArrayBuffer: Kw,
    isBuffer: _T,
    isFormData: LT,
    isArrayBufferView: RT,
    isString: DT,
    isNumber: qw,
    isBoolean: PT,
    isObject: Va,
    isPlainObject: nl,
    isReadableStream: FT,
    isRequest: MT,
    isResponse: IT,
    isHeaders: zT,
    isUndefined: Gs,
    isDate: TT,
    isFile: NT,
    isBlob: OT,
    isRegExp: ZT,
    isFunction: Ft,
    isStream: $T,
    isURLSearchParams: AT,
    isTypedArray: qT,
    isFileList: jT,
    forEach: ai,
    merge: Ju,
    extend: VT,
    trim: BT,
    stripBOM: HT,
    inherits: UT,
    toFlatObject: WT,
    kindOf: za,
    kindOfTest: ln,
    endsWith: YT,
    toArray: KT,
    forEachEntry: GT,
    matchAll: XT,
    isHTMLForm: QT,
    hasOwnProperty: Uh,
    hasOwnProp: Uh,
    reduceDescriptors: Jw,
    freezeMethods: eN,
    toObjectSet: tN,
    toCamelCase: JT,
    noop: nN,
    toFiniteNumber: rN,
    findKey: Gw,
    global: Xw,
    isContextDefined: Qw,
    ALPHABET: Zw,
    generateString: oN,
    isSpecCompliantForm: sN,
    toJSONObject: iN,
    isAsyncFn: lN,
    isThenable: aN,
  };
function ae(e, t, n, r, o) {
  Error.call(this),
    Error.captureStackTrace
      ? Error.captureStackTrace(this, this.constructor)
      : (this.stack = new Error().stack),
    (this.message = e),
    (this.name = "AxiosError"),
    t && (this.code = t),
    n && (this.config = n),
    r && (this.request = r),
    o && (this.response = o);
}
F.inherits(ae, Error, {
  toJSON: function () {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: F.toJSONObject(this.config),
      code: this.code,
      status:
        this.response && this.response.status ? this.response.status : null,
    };
  },
});
const e1 = ae.prototype,
  t1 = {};
[
  "ERR_BAD_OPTION_VALUE",
  "ERR_BAD_OPTION",
  "ECONNABORTED",
  "ETIMEDOUT",
  "ERR_NETWORK",
  "ERR_FR_TOO_MANY_REDIRECTS",
  "ERR_DEPRECATED",
  "ERR_BAD_RESPONSE",
  "ERR_BAD_REQUEST",
  "ERR_CANCELED",
  "ERR_NOT_SUPPORT",
  "ERR_INVALID_URL",
].forEach((e) => {
  t1[e] = { value: e };
});
Object.defineProperties(ae, t1);
Object.defineProperty(e1, "isAxiosError", { value: !0 });
ae.from = (e, t, n, r, o, s) => {
  const i = Object.create(e1);
  return (
    F.toFlatObject(
      e,
      i,
      function (a) {
        return a !== Error.prototype;
      },
      (l) => l !== "isAxiosError"
    ),
    ae.call(i, e.message, t, n, r, o),
    (i.cause = e),
    (i.name = e.name),
    s && Object.assign(i, s),
    i
  );
};
const cN = null;
function Zu(e) {
  return F.isPlainObject(e) || F.isArray(e);
}
function n1(e) {
  return F.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function Yh(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (o, s) {
          return (o = n1(o)), !n && s ? "[" + o + "]" : o;
        })
        .join(n ? "." : "")
    : t;
}
function uN(e) {
  return F.isArray(e) && !e.some(Zu);
}
const dN = F.toFlatObject(F, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function Ha(e, t, n) {
  if (!F.isObject(e)) throw new TypeError("target must be an object");
  (t = t || new FormData()),
    (n = F.toFlatObject(
      n,
      { metaTokens: !0, dots: !1, indexes: !1 },
      !1,
      function (h, S) {
        return !F.isUndefined(S[h]);
      }
    ));
  const r = n.metaTokens,
    o = n.visitor || u,
    s = n.dots,
    i = n.indexes,
    a = (n.Blob || (typeof Blob < "u" && Blob)) && F.isSpecCompliantForm(t);
  if (!F.isFunction(o)) throw new TypeError("visitor must be a function");
  function c(p) {
    if (p === null) return "";
    if (F.isDate(p)) return p.toISOString();
    if (!a && F.isBlob(p))
      throw new ae("Blob is not supported. Use a Buffer instead.");
    return F.isArrayBuffer(p) || F.isTypedArray(p)
      ? a && typeof Blob == "function"
        ? new Blob([p])
        : Buffer.from(p)
      : p;
  }
  function u(p, h, S) {
    let v = p;
    if (p && !S && typeof p == "object") {
      if (F.endsWith(h, "{}"))
        (h = r ? h : h.slice(0, -2)), (p = JSON.stringify(p));
      else if (
        (F.isArray(p) && uN(p)) ||
        ((F.isFileList(p) || F.endsWith(h, "[]")) && (v = F.toArray(p)))
      )
        return (
          (h = n1(h)),
          v.forEach(function (g, b) {
            !(F.isUndefined(g) || g === null) &&
              t.append(
                i === !0 ? Yh([h], b, s) : i === null ? h : h + "[]",
                c(g)
              );
          }),
          !1
        );
    }
    return Zu(p) ? !0 : (t.append(Yh(S, h, s), c(p)), !1);
  }
  const d = [],
    f = Object.assign(dN, {
      defaultVisitor: u,
      convertValue: c,
      isVisitable: Zu,
    });
  function m(p, h) {
    if (!F.isUndefined(p)) {
      if (d.indexOf(p) !== -1)
        throw Error("Circular reference detected in " + h.join("."));
      d.push(p),
        F.forEach(p, function (v, w) {
          (!(F.isUndefined(v) || v === null) &&
            o.call(t, v, F.isString(w) ? w.trim() : w, h, f)) === !0 &&
            m(v, h ? h.concat(w) : [w]);
        }),
        d.pop();
    }
  }
  if (!F.isObject(e)) throw new TypeError("data must be an object");
  return m(e), t;
}
function Kh(e) {
  const t = {
    "!": "%21",
    "'": "%27",
    "(": "%28",
    ")": "%29",
    "~": "%7E",
    "%20": "+",
    "%00": "\0",
  };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function (r) {
    return t[r];
  });
}
function yp(e, t) {
  (this._pairs = []), e && Ha(e, this, t);
}
const r1 = yp.prototype;
r1.append = function (t, n) {
  this._pairs.push([t, n]);
};
r1.toString = function (t) {
  const n = t
    ? function (r) {
        return t.call(this, r, Kh);
      }
    : Kh;
  return this._pairs
    .map(function (o) {
      return n(o[0]) + "=" + n(o[1]);
    }, "")
    .join("&");
};
function fN(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}
function o1(e, t, n) {
  if (!t) return e;
  const r = (n && n.encode) || fN,
    o = n && n.serialize;
  let s;
  if (
    (o
      ? (s = o(t, n))
      : (s = F.isURLSearchParams(t) ? t.toString() : new yp(t, n).toString(r)),
    s)
  ) {
    const i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)),
      (e += (e.indexOf("?") === -1 ? "?" : "&") + s);
  }
  return e;
}
class qh {
  constructor() {
    this.handlers = [];
  }
  use(t, n, r) {
    return (
      this.handlers.push({
        fulfilled: t,
        rejected: n,
        synchronous: r ? r.synchronous : !1,
        runWhen: r ? r.runWhen : null,
      }),
      this.handlers.length - 1
    );
  }
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(t) {
    F.forEach(this.handlers, function (r) {
      r !== null && t(r);
    });
  }
}
const s1 = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
  },
  pN = typeof URLSearchParams < "u" ? URLSearchParams : yp,
  mN = typeof FormData < "u" ? FormData : null,
  hN = typeof Blob < "u" ? Blob : null,
  gN = {
    isBrowser: !0,
    classes: { URLSearchParams: pN, FormData: mN, Blob: hN },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  vp = typeof window < "u" && typeof document < "u",
  yN = ((e) => vp && ["ReactNative", "NativeScript", "NS"].indexOf(e) < 0)(
    typeof navigator < "u" && navigator.product
  ),
  vN =
    typeof WorkerGlobalScope < "u" &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == "function",
  wN = (vp && window.location.href) || "http://localhost",
  xN = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: vp,
        hasStandardBrowserEnv: yN,
        hasStandardBrowserWebWorkerEnv: vN,
        origin: wN,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  Jt = { ...xN, ...gN };
function SN(e, t) {
  return Ha(
    e,
    new Jt.classes.URLSearchParams(),
    Object.assign(
      {
        visitor: function (n, r, o, s) {
          return Jt.isNode && F.isBuffer(n)
            ? (this.append(r, n.toString("base64")), !1)
            : s.defaultVisitor.apply(this, arguments);
        },
      },
      t
    )
  );
}
function bN(e) {
  return F.matchAll(/\w+|\[(\w*)]/g, e).map((t) =>
    t[0] === "[]" ? "" : t[1] || t[0]
  );
}
function CN(e) {
  const t = {},
    n = Object.keys(e);
  let r;
  const o = n.length;
  let s;
  for (r = 0; r < o; r++) (s = n[r]), (t[s] = e[s]);
  return t;
}
function i1(e) {
  function t(n, r, o, s) {
    let i = n[s++];
    if (i === "__proto__") return !0;
    const l = Number.isFinite(+i),
      a = s >= n.length;
    return (
      (i = !i && F.isArray(o) ? o.length : i),
      a
        ? (F.hasOwnProp(o, i) ? (o[i] = [o[i], r]) : (o[i] = r), !l)
        : ((!o[i] || !F.isObject(o[i])) && (o[i] = []),
          t(n, r, o[i], s) && F.isArray(o[i]) && (o[i] = CN(o[i])),
          !l)
    );
  }
  if (F.isFormData(e) && F.isFunction(e.entries)) {
    const n = {};
    return (
      F.forEachEntry(e, (r, o) => {
        t(bN(r), o, n, 0);
      }),
      n
    );
  }
  return null;
}
function EN(e, t, n) {
  if (F.isString(e))
    try {
      return (t || JSON.parse)(e), F.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError") throw r;
    }
  return (n || JSON.stringify)(e);
}
const ci = {
  transitional: s1,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (t, n) {
      const r = n.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        s = F.isObject(t);
      if ((s && F.isHTMLForm(t) && (t = new FormData(t)), F.isFormData(t)))
        return o ? JSON.stringify(i1(t)) : t;
      if (
        F.isArrayBuffer(t) ||
        F.isBuffer(t) ||
        F.isStream(t) ||
        F.isFile(t) ||
        F.isBlob(t) ||
        F.isReadableStream(t)
      )
        return t;
      if (F.isArrayBufferView(t)) return t.buffer;
      if (F.isURLSearchParams(t))
        return (
          n.setContentType(
            "application/x-www-form-urlencoded;charset=utf-8",
            !1
          ),
          t.toString()
        );
      let l;
      if (s) {
        if (r.indexOf("application/x-www-form-urlencoded") > -1)
          return SN(t, this.formSerializer).toString();
        if ((l = F.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const a = this.env && this.env.FormData;
          return Ha(
            l ? { "files[]": t } : t,
            a && new a(),
            this.formSerializer
          );
        }
      }
      return s || o ? (n.setContentType("application/json", !1), EN(t)) : t;
    },
  ],
  transformResponse: [
    function (t) {
      const n = this.transitional || ci.transitional,
        r = n && n.forcedJSONParsing,
        o = this.responseType === "json";
      if (F.isResponse(t) || F.isReadableStream(t)) return t;
      if (t && F.isString(t) && ((r && !this.responseType) || o)) {
        const i = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t);
        } catch (l) {
          if (i)
            throw l.name === "SyntaxError"
              ? ae.from(l, ae.ERR_BAD_RESPONSE, this, null, this.response)
              : l;
        }
      }
      return t;
    },
  ],
  timeout: 0,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  maxContentLength: -1,
  maxBodyLength: -1,
  env: { FormData: Jt.classes.FormData, Blob: Jt.classes.Blob },
  validateStatus: function (t) {
    return t >= 200 && t < 300;
  },
  headers: {
    common: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": void 0,
    },
  },
};
F.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
  ci.headers[e] = {};
});
const kN = F.toObjectSet([
    "age",
    "authorization",
    "content-length",
    "content-type",
    "etag",
    "expires",
    "from",
    "host",
    "if-modified-since",
    "if-unmodified-since",
    "last-modified",
    "location",
    "max-forwards",
    "proxy-authorization",
    "referer",
    "retry-after",
    "user-agent",
  ]),
  _N = (e) => {
    const t = {};
    let n, r, o;
    return (
      e &&
        e
          .split(
            `
`
          )
          .forEach(function (i) {
            (o = i.indexOf(":")),
              (n = i.substring(0, o).trim().toLowerCase()),
              (r = i.substring(o + 1).trim()),
              !(!n || (t[n] && kN[n])) &&
                (n === "set-cookie"
                  ? t[n]
                    ? t[n].push(r)
                    : (t[n] = [r])
                  : (t[n] = t[n] ? t[n] + ", " + r : r));
          }),
      t
    );
  },
  Gh = Symbol("internals");
function ds(e) {
  return e && String(e).trim().toLowerCase();
}
function rl(e) {
  return e === !1 || e == null ? e : F.isArray(e) ? e.map(rl) : String(e);
}
function RN(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; (r = n.exec(e)); ) t[r[1]] = r[2];
  return t;
}
const DN = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function zc(e, t, n, r, o) {
  if (F.isFunction(r)) return r.call(this, t, n);
  if ((o && (t = n), !!F.isString(t))) {
    if (F.isString(r)) return t.indexOf(r) !== -1;
    if (F.isRegExp(r)) return r.test(t);
  }
}
function PN(e) {
  return e
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function TN(e, t) {
  const n = F.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      value: function (o, s, i) {
        return this[r].call(this, t, o, s, i);
      },
      configurable: !0,
    });
  });
}
class vt {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const o = this;
    function s(l, a, c) {
      const u = ds(a);
      if (!u) throw new Error("header name must be a non-empty string");
      const d = F.findKey(o, u);
      (!d || o[d] === void 0 || c === !0 || (c === void 0 && o[d] !== !1)) &&
        (o[d || a] = rl(l));
    }
    const i = (l, a) => F.forEach(l, (c, u) => s(c, u, a));
    if (F.isPlainObject(t) || t instanceof this.constructor) i(t, n);
    else if (F.isString(t) && (t = t.trim()) && !DN(t)) i(_N(t), n);
    else if (F.isHeaders(t)) for (const [l, a] of t.entries()) s(a, l, r);
    else t != null && s(n, t, r);
    return this;
  }
  get(t, n) {
    if (((t = ds(t)), t)) {
      const r = F.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n) return o;
        if (n === !0) return RN(o);
        if (F.isFunction(n)) return n.call(this, o, r);
        if (F.isRegExp(n)) return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (((t = ds(t)), t)) {
      const r = F.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || zc(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function s(i) {
      if (((i = ds(i)), i)) {
        const l = F.findKey(r, i);
        l && (!n || zc(r, r[l], l, n)) && (delete r[l], (o = !0));
      }
    }
    return F.isArray(t) ? t.forEach(s) : s(t), o;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length,
      o = !1;
    for (; r--; ) {
      const s = n[r];
      (!t || zc(this, this[s], s, t, !0)) && (delete this[s], (o = !0));
    }
    return o;
  }
  normalize(t) {
    const n = this,
      r = {};
    return (
      F.forEach(this, (o, s) => {
        const i = F.findKey(r, s);
        if (i) {
          (n[i] = rl(o)), delete n[s];
          return;
        }
        const l = t ? PN(s) : String(s).trim();
        l !== s && delete n[s], (n[l] = rl(o)), (r[l] = !0);
      }),
      this
    );
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = Object.create(null);
    return (
      F.forEach(this, (r, o) => {
        r != null && r !== !1 && (n[o] = t && F.isArray(r) ? r.join(", ") : r);
      }),
      n
    );
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ": " + n).join(`
`);
  }
  get [Symbol.toStringTag]() {
    return "AxiosHeaders";
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return n.forEach((o) => r.set(o)), r;
  }
  static accessor(t) {
    const r = (this[Gh] = this[Gh] = { accessors: {} }).accessors,
      o = this.prototype;
    function s(i) {
      const l = ds(i);
      r[l] || (TN(o, i), (r[l] = !0));
    }
    return F.isArray(t) ? t.forEach(s) : s(t), this;
  }
}
vt.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization",
]);
F.reduceDescriptors(vt.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    },
  };
});
F.freezeMethods(vt);
function Bc(e, t) {
  const n = this || ci,
    r = t || n,
    o = vt.from(r.headers);
  let s = r.data;
  return (
    F.forEach(e, function (l) {
      s = l.call(n, s, o.normalize(), t ? t.status : void 0);
    }),
    o.normalize(),
    s
  );
}
function l1(e) {
  return !!(e && e.__CANCEL__);
}
function Go(e, t, n) {
  ae.call(this, e ?? "canceled", ae.ERR_CANCELED, t, n),
    (this.name = "CanceledError");
}
F.inherits(Go, ae, { __CANCEL__: !0 });
function a1(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status)
    ? e(n)
    : t(
        new ae(
          "Request failed with status code " + n.status,
          [ae.ERR_BAD_REQUEST, ae.ERR_BAD_RESPONSE][
            Math.floor(n.status / 100) - 4
          ],
          n.config,
          n.request,
          n
        )
      );
}
function NN(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return (t && t[1]) || "";
}
function ON(e, t) {
  e = e || 10;
  const n = new Array(e),
    r = new Array(e);
  let o = 0,
    s = 0,
    i;
  return (
    (t = t !== void 0 ? t : 1e3),
    function (a) {
      const c = Date.now(),
        u = r[s];
      i || (i = c), (n[o] = a), (r[o] = c);
      let d = s,
        f = 0;
      for (; d !== o; ) (f += n[d++]), (d = d % e);
      if (((o = (o + 1) % e), o === s && (s = (s + 1) % e), c - i < t)) return;
      const m = u && c - u;
      return m ? Math.round((f * 1e3) / m) : void 0;
    }
  );
}
function jN(e, t) {
  let n = 0;
  const r = 1e3 / t;
  let o = null;
  return function () {
    const i = this === !0,
      l = Date.now();
    if (i || l - n > r)
      return (
        o && (clearTimeout(o), (o = null)), (n = l), e.apply(null, arguments)
      );
    o ||
      (o = setTimeout(
        () => ((o = null), (n = Date.now()), e.apply(null, arguments)),
        r - (l - n)
      ));
  };
}
const zl = (e, t, n = 3) => {
    let r = 0;
    const o = ON(50, 250);
    return jN((s) => {
      const i = s.loaded,
        l = s.lengthComputable ? s.total : void 0,
        a = i - r,
        c = o(a),
        u = i <= l;
      r = i;
      const d = {
        loaded: i,
        total: l,
        progress: l ? i / l : void 0,
        bytes: a,
        rate: c || void 0,
        estimated: c && l && u ? (l - i) / c : void 0,
        event: s,
        lengthComputable: l != null,
      };
      (d[t ? "download" : "upload"] = !0), e(d);
    }, n);
  },
  $N = Jt.hasStandardBrowserEnv
    ? (function () {
        const t = /(msie|trident)/i.test(navigator.userAgent),
          n = document.createElement("a");
        let r;
        function o(s) {
          let i = s;
          return (
            t && (n.setAttribute("href", i), (i = n.href)),
            n.setAttribute("href", i),
            {
              href: n.href,
              protocol: n.protocol ? n.protocol.replace(/:$/, "") : "",
              host: n.host,
              search: n.search ? n.search.replace(/^\?/, "") : "",
              hash: n.hash ? n.hash.replace(/^#/, "") : "",
              hostname: n.hostname,
              port: n.port,
              pathname:
                n.pathname.charAt(0) === "/" ? n.pathname : "/" + n.pathname,
            }
          );
        }
        return (
          (r = o(window.location.href)),
          function (i) {
            const l = F.isString(i) ? o(i) : i;
            return l.protocol === r.protocol && l.host === r.host;
          }
        );
      })()
    : (function () {
        return function () {
          return !0;
        };
      })(),
  LN = Jt.hasStandardBrowserEnv
    ? {
        write(e, t, n, r, o, s) {
          const i = [e + "=" + encodeURIComponent(t)];
          F.isNumber(n) && i.push("expires=" + new Date(n).toGMTString()),
            F.isString(r) && i.push("path=" + r),
            F.isString(o) && i.push("domain=" + o),
            s === !0 && i.push("secure"),
            (document.cookie = i.join("; "));
        },
        read(e) {
          const t = document.cookie.match(
            new RegExp("(^|;\\s*)(" + e + ")=([^;]*)")
          );
          return t ? decodeURIComponent(t[3]) : null;
        },
        remove(e) {
          this.write(e, "", Date.now() - 864e5);
        },
      }
    : {
        write() {},
        read() {
          return null;
        },
        remove() {},
      };
function AN(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function FN(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function c1(e, t) {
  return e && !AN(t) ? FN(e, t) : t;
}
const Xh = (e) => (e instanceof vt ? { ...e } : e);
function Ir(e, t) {
  t = t || {};
  const n = {};
  function r(c, u, d) {
    return F.isPlainObject(c) && F.isPlainObject(u)
      ? F.merge.call({ caseless: d }, c, u)
      : F.isPlainObject(u)
      ? F.merge({}, u)
      : F.isArray(u)
      ? u.slice()
      : u;
  }
  function o(c, u, d) {
    if (F.isUndefined(u)) {
      if (!F.isUndefined(c)) return r(void 0, c, d);
    } else return r(c, u, d);
  }
  function s(c, u) {
    if (!F.isUndefined(u)) return r(void 0, u);
  }
  function i(c, u) {
    if (F.isUndefined(u)) {
      if (!F.isUndefined(c)) return r(void 0, c);
    } else return r(void 0, u);
  }
  function l(c, u, d) {
    if (d in t) return r(c, u);
    if (d in e) return r(void 0, c);
  }
  const a = {
    url: s,
    method: s,
    data: s,
    baseURL: i,
    transformRequest: i,
    transformResponse: i,
    paramsSerializer: i,
    timeout: i,
    timeoutMessage: i,
    withCredentials: i,
    withXSRFToken: i,
    adapter: i,
    responseType: i,
    xsrfCookieName: i,
    xsrfHeaderName: i,
    onUploadProgress: i,
    onDownloadProgress: i,
    decompress: i,
    maxContentLength: i,
    maxBodyLength: i,
    beforeRedirect: i,
    transport: i,
    httpAgent: i,
    httpsAgent: i,
    cancelToken: i,
    socketPath: i,
    responseEncoding: i,
    validateStatus: l,
    headers: (c, u) => o(Xh(c), Xh(u), !0),
  };
  return (
    F.forEach(Object.keys(Object.assign({}, e, t)), function (u) {
      const d = a[u] || o,
        f = d(e[u], t[u], u);
      (F.isUndefined(f) && d !== l) || (n[u] = f);
    }),
    n
  );
}
const u1 = (e) => {
    const t = Ir({}, e);
    let {
      data: n,
      withXSRFToken: r,
      xsrfHeaderName: o,
      xsrfCookieName: s,
      headers: i,
      auth: l,
    } = t;
    (t.headers = i = vt.from(i)),
      (t.url = o1(c1(t.baseURL, t.url), e.params, e.paramsSerializer)),
      l &&
        i.set(
          "Authorization",
          "Basic " +
            btoa(
              (l.username || "") +
                ":" +
                (l.password ? unescape(encodeURIComponent(l.password)) : "")
            )
        );
    let a;
    if (F.isFormData(n)) {
      if (Jt.hasStandardBrowserEnv || Jt.hasStandardBrowserWebWorkerEnv)
        i.setContentType(void 0);
      else if ((a = i.getContentType()) !== !1) {
        const [c, ...u] = a
          ? a
              .split(";")
              .map((d) => d.trim())
              .filter(Boolean)
          : [];
        i.setContentType([c || "multipart/form-data", ...u].join("; "));
      }
    }
    if (
      Jt.hasStandardBrowserEnv &&
      (r && F.isFunction(r) && (r = r(t)), r || (r !== !1 && $N(t.url)))
    ) {
      const c = o && s && LN.read(s);
      c && i.set(o, c);
    }
    return t;
  },
  MN = typeof XMLHttpRequest < "u",
  IN =
    MN &&
    function (e) {
      return new Promise(function (n, r) {
        const o = u1(e);
        let s = o.data;
        const i = vt.from(o.headers).normalize();
        let { responseType: l } = o,
          a;
        function c() {
          o.cancelToken && o.cancelToken.unsubscribe(a),
            o.signal && o.signal.removeEventListener("abort", a);
        }
        let u = new XMLHttpRequest();
        u.open(o.method.toUpperCase(), o.url, !0), (u.timeout = o.timeout);
        function d() {
          if (!u) return;
          const m = vt.from(
              "getAllResponseHeaders" in u && u.getAllResponseHeaders()
            ),
            h = {
              data:
                !l || l === "text" || l === "json"
                  ? u.responseText
                  : u.response,
              status: u.status,
              statusText: u.statusText,
              headers: m,
              config: e,
              request: u,
            };
          a1(
            function (v) {
              n(v), c();
            },
            function (v) {
              r(v), c();
            },
            h
          ),
            (u = null);
        }
        "onloadend" in u
          ? (u.onloadend = d)
          : (u.onreadystatechange = function () {
              !u ||
                u.readyState !== 4 ||
                (u.status === 0 &&
                  !(u.responseURL && u.responseURL.indexOf("file:") === 0)) ||
                setTimeout(d);
            }),
          (u.onabort = function () {
            u &&
              (r(new ae("Request aborted", ae.ECONNABORTED, o, u)), (u = null));
          }),
          (u.onerror = function () {
            r(new ae("Network Error", ae.ERR_NETWORK, o, u)), (u = null);
          }),
          (u.ontimeout = function () {
            let p = o.timeout
              ? "timeout of " + o.timeout + "ms exceeded"
              : "timeout exceeded";
            const h = o.transitional || s1;
            o.timeoutErrorMessage && (p = o.timeoutErrorMessage),
              r(
                new ae(
                  p,
                  h.clarifyTimeoutError ? ae.ETIMEDOUT : ae.ECONNABORTED,
                  o,
                  u
                )
              ),
              (u = null);
          }),
          s === void 0 && i.setContentType(null),
          "setRequestHeader" in u &&
            F.forEach(i.toJSON(), function (p, h) {
              u.setRequestHeader(h, p);
            }),
          F.isUndefined(o.withCredentials) ||
            (u.withCredentials = !!o.withCredentials),
          l && l !== "json" && (u.responseType = o.responseType),
          typeof o.onDownloadProgress == "function" &&
            u.addEventListener("progress", zl(o.onDownloadProgress, !0)),
          typeof o.onUploadProgress == "function" &&
            u.upload &&
            u.upload.addEventListener("progress", zl(o.onUploadProgress)),
          (o.cancelToken || o.signal) &&
            ((a = (m) => {
              u &&
                (r(!m || m.type ? new Go(null, e, u) : m),
                u.abort(),
                (u = null));
            }),
            o.cancelToken && o.cancelToken.subscribe(a),
            o.signal &&
              (o.signal.aborted ? a() : o.signal.addEventListener("abort", a)));
        const f = NN(o.url);
        if (f && Jt.protocols.indexOf(f) === -1) {
          r(new ae("Unsupported protocol " + f + ":", ae.ERR_BAD_REQUEST, e));
          return;
        }
        u.send(s || null);
      });
    },
  zN = (e, t) => {
    let n = new AbortController(),
      r;
    const o = function (a) {
      if (!r) {
        (r = !0), i();
        const c = a instanceof Error ? a : this.reason;
        n.abort(
          c instanceof ae ? c : new Go(c instanceof Error ? c.message : c)
        );
      }
    };
    let s =
      t &&
      setTimeout(() => {
        o(new ae(`timeout ${t} of ms exceeded`, ae.ETIMEDOUT));
      }, t);
    const i = () => {
      e &&
        (s && clearTimeout(s),
        (s = null),
        e.forEach((a) => {
          a &&
            (a.removeEventListener
              ? a.removeEventListener("abort", o)
              : a.unsubscribe(o));
        }),
        (e = null));
    };
    e.forEach((a) => a && a.addEventListener && a.addEventListener("abort", o));
    const { signal: l } = n;
    return (
      (l.unsubscribe = i),
      [
        l,
        () => {
          s && clearTimeout(s), (s = null);
        },
      ]
    );
  },
  BN = function* (e, t) {
    let n = e.byteLength;
    if (!t || n < t) {
      yield e;
      return;
    }
    let r = 0,
      o;
    for (; r < n; ) (o = r + t), yield e.slice(r, o), (r = o);
  },
  VN = async function* (e, t, n) {
    for await (const r of e)
      yield* BN(ArrayBuffer.isView(r) ? r : await n(String(r)), t);
  },
  Qh = (e, t, n, r, o) => {
    const s = VN(e, t, o);
    let i = 0;
    return new ReadableStream(
      {
        type: "bytes",
        async pull(l) {
          const { done: a, value: c } = await s.next();
          if (a) {
            l.close(), r();
            return;
          }
          let u = c.byteLength;
          n && n((i += u)), l.enqueue(new Uint8Array(c));
        },
        cancel(l) {
          return r(l), s.return();
        },
      },
      { highWaterMark: 2 }
    );
  },
  Jh = (e, t) => {
    const n = e != null;
    return (r) =>
      setTimeout(() => t({ lengthComputable: n, total: e, loaded: r }));
  },
  Ua =
    typeof fetch == "function" &&
    typeof Request == "function" &&
    typeof Response == "function",
  d1 = Ua && typeof ReadableStream == "function",
  ed =
    Ua &&
    (typeof TextEncoder == "function"
      ? (
          (e) => (t) =>
            e.encode(t)
        )(new TextEncoder())
      : async (e) => new Uint8Array(await new Response(e).arrayBuffer())),
  HN =
    d1 &&
    (() => {
      let e = !1;
      const t = new Request(Jt.origin, {
        body: new ReadableStream(),
        method: "POST",
        get duplex() {
          return (e = !0), "half";
        },
      }).headers.has("Content-Type");
      return e && !t;
    })(),
  Zh = 64 * 1024,
  td =
    d1 &&
    !!(() => {
      try {
        return F.isReadableStream(new Response("").body);
      } catch {}
    })(),
  Bl = { stream: td && ((e) => e.body) };
Ua &&
  ((e) => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((t) => {
      !Bl[t] &&
        (Bl[t] = F.isFunction(e[t])
          ? (n) => n[t]()
          : (n, r) => {
              throw new ae(
                `Response type '${t}' is not supported`,
                ae.ERR_NOT_SUPPORT,
                r
              );
            });
    });
  })(new Response());
const UN = async (e) => {
    if (e == null) return 0;
    if (F.isBlob(e)) return e.size;
    if (F.isSpecCompliantForm(e))
      return (await new Request(e).arrayBuffer()).byteLength;
    if (F.isArrayBufferView(e)) return e.byteLength;
    if ((F.isURLSearchParams(e) && (e = e + ""), F.isString(e)))
      return (await ed(e)).byteLength;
  },
  WN = async (e, t) => {
    const n = F.toFiniteNumber(e.getContentLength());
    return n ?? UN(t);
  },
  YN =
    Ua &&
    (async (e) => {
      let {
        url: t,
        method: n,
        data: r,
        signal: o,
        cancelToken: s,
        timeout: i,
        onDownloadProgress: l,
        onUploadProgress: a,
        responseType: c,
        headers: u,
        withCredentials: d = "same-origin",
        fetchOptions: f,
      } = u1(e);
      c = c ? (c + "").toLowerCase() : "text";
      let [m, p] = o || s || i ? zN([o, s], i) : [],
        h,
        S;
      const v = () => {
        !h &&
          setTimeout(() => {
            m && m.unsubscribe();
          }),
          (h = !0);
      };
      let w;
      try {
        if (
          a &&
          HN &&
          n !== "get" &&
          n !== "head" &&
          (w = await WN(u, r)) !== 0
        ) {
          let E = new Request(t, { method: "POST", body: r, duplex: "half" }),
            _;
          F.isFormData(r) &&
            (_ = E.headers.get("content-type")) &&
            u.setContentType(_),
            E.body && (r = Qh(E.body, Zh, Jh(w, zl(a)), null, ed));
        }
        F.isString(d) || (d = d ? "cors" : "omit"),
          (S = new Request(t, {
            ...f,
            signal: m,
            method: n.toUpperCase(),
            headers: u.normalize().toJSON(),
            body: r,
            duplex: "half",
            withCredentials: d,
          }));
        let g = await fetch(S);
        const b = td && (c === "stream" || c === "response");
        if (td && (l || b)) {
          const E = {};
          ["status", "statusText", "headers"].forEach((D) => {
            E[D] = g[D];
          });
          const _ = F.toFiniteNumber(g.headers.get("content-length"));
          g = new Response(
            Qh(g.body, Zh, l && Jh(_, zl(l, !0)), b && v, ed),
            E
          );
        }
        c = c || "text";
        let C = await Bl[F.findKey(Bl, c) || "text"](g, e);
        return (
          !b && v(),
          p && p(),
          await new Promise((E, _) => {
            a1(E, _, {
              data: C,
              headers: vt.from(g.headers),
              status: g.status,
              statusText: g.statusText,
              config: e,
              request: S,
            });
          })
        );
      } catch (g) {
        throw (
          (v(),
          g && g.name === "TypeError" && /fetch/i.test(g.message)
            ? Object.assign(new ae("Network Error", ae.ERR_NETWORK, e, S), {
                cause: g.cause || g,
              })
            : ae.from(g, g && g.code, e, S))
        );
      }
    }),
  nd = { http: cN, xhr: IN, fetch: YN };
F.forEach(nd, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {}
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const eg = (e) => `- ${e}`,
  KN = (e) => F.isFunction(e) || e === null || e === !1,
  f1 = {
    getAdapter: (e) => {
      e = F.isArray(e) ? e : [e];
      const { length: t } = e;
      let n, r;
      const o = {};
      for (let s = 0; s < t; s++) {
        n = e[s];
        let i;
        if (
          ((r = n),
          !KN(n) && ((r = nd[(i = String(n)).toLowerCase()]), r === void 0))
        )
          throw new ae(`Unknown adapter '${i}'`);
        if (r) break;
        o[i || "#" + s] = r;
      }
      if (!r) {
        const s = Object.entries(o).map(
          ([l, a]) =>
            `adapter ${l} ` +
            (a === !1
              ? "is not supported by the environment"
              : "is not available in the build")
        );
        let i = t
          ? s.length > 1
            ? `since :
` +
              s.map(eg).join(`
`)
            : " " + eg(s[0])
          : "as no adapter specified";
        throw new ae(
          "There is no suitable adapter to dispatch the request " + i,
          "ERR_NOT_SUPPORT"
        );
      }
      return r;
    },
    adapters: nd,
  };
function Vc(e) {
  if (
    (e.cancelToken && e.cancelToken.throwIfRequested(),
    e.signal && e.signal.aborted)
  )
    throw new Go(null, e);
}
function tg(e) {
  return (
    Vc(e),
    (e.headers = vt.from(e.headers)),
    (e.data = Bc.call(e, e.transformRequest)),
    ["post", "put", "patch"].indexOf(e.method) !== -1 &&
      e.headers.setContentType("application/x-www-form-urlencoded", !1),
    f1
      .getAdapter(e.adapter || ci.adapter)(e)
      .then(
        function (r) {
          return (
            Vc(e),
            (r.data = Bc.call(e, e.transformResponse, r)),
            (r.headers = vt.from(r.headers)),
            r
          );
        },
        function (r) {
          return (
            l1(r) ||
              (Vc(e),
              r &&
                r.response &&
                ((r.response.data = Bc.call(
                  e,
                  e.transformResponse,
                  r.response
                )),
                (r.response.headers = vt.from(r.response.headers)))),
            Promise.reject(r)
          );
        }
      )
  );
}
const p1 = "1.7.2",
  wp = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  (e, t) => {
    wp[e] = function (r) {
      return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  }
);
const ng = {};
wp.transitional = function (t, n, r) {
  function o(s, i) {
    return (
      "[Axios v" +
      p1 +
      "] Transitional option '" +
      s +
      "'" +
      i +
      (r ? ". " + r : "")
    );
  }
  return (s, i, l) => {
    if (t === !1)
      throw new ae(
        o(i, " has been removed" + (n ? " in " + n : "")),
        ae.ERR_DEPRECATED
      );
    return (
      n &&
        !ng[i] &&
        ((ng[i] = !0),
        console.warn(
          o(
            i,
            " has been deprecated since v" +
              n +
              " and will be removed in the near future"
          )
        )),
      t ? t(s, i, l) : !0
    );
  };
};
function qN(e, t, n) {
  if (typeof e != "object")
    throw new ae("options must be an object", ae.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let o = r.length;
  for (; o-- > 0; ) {
    const s = r[o],
      i = t[s];
    if (i) {
      const l = e[s],
        a = l === void 0 || i(l, s, e);
      if (a !== !0)
        throw new ae("option " + s + " must be " + a, ae.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new ae("Unknown option " + s, ae.ERR_BAD_OPTION);
  }
}
const rd = { assertOptions: qN, validators: wp },
  Vn = rd.validators;
class Tr {
  constructor(t) {
    (this.defaults = t),
      (this.interceptors = { request: new qh(), response: new qh() });
  }
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
        let o;
        Error.captureStackTrace
          ? Error.captureStackTrace((o = {}))
          : (o = new Error());
        const s = o.stack ? o.stack.replace(/^.+\n/, "") : "";
        try {
          r.stack
            ? s &&
              !String(r.stack).endsWith(s.replace(/^.+\n.+\n/, "")) &&
              (r.stack +=
                `
` + s)
            : (r.stack = s);
        } catch {}
      }
      throw r;
    }
  }
  _request(t, n) {
    typeof t == "string" ? ((n = n || {}), (n.url = t)) : (n = t || {}),
      (n = Ir(this.defaults, n));
    const { transitional: r, paramsSerializer: o, headers: s } = n;
    r !== void 0 &&
      rd.assertOptions(
        r,
        {
          silentJSONParsing: Vn.transitional(Vn.boolean),
          forcedJSONParsing: Vn.transitional(Vn.boolean),
          clarifyTimeoutError: Vn.transitional(Vn.boolean),
        },
        !1
      ),
      o != null &&
        (F.isFunction(o)
          ? (n.paramsSerializer = { serialize: o })
          : rd.assertOptions(
              o,
              { encode: Vn.function, serialize: Vn.function },
              !0
            )),
      (n.method = (n.method || this.defaults.method || "get").toLowerCase());
    let i = s && F.merge(s.common, s[n.method]);
    s &&
      F.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (p) => {
          delete s[p];
        }
      ),
      (n.headers = vt.concat(i, s));
    const l = [];
    let a = !0;
    this.interceptors.request.forEach(function (h) {
      (typeof h.runWhen == "function" && h.runWhen(n) === !1) ||
        ((a = a && h.synchronous), l.unshift(h.fulfilled, h.rejected));
    });
    const c = [];
    this.interceptors.response.forEach(function (h) {
      c.push(h.fulfilled, h.rejected);
    });
    let u,
      d = 0,
      f;
    if (!a) {
      const p = [tg.bind(this), void 0];
      for (
        p.unshift.apply(p, l),
          p.push.apply(p, c),
          f = p.length,
          u = Promise.resolve(n);
        d < f;

      )
        u = u.then(p[d++], p[d++]);
      return u;
    }
    f = l.length;
    let m = n;
    for (d = 0; d < f; ) {
      const p = l[d++],
        h = l[d++];
      try {
        m = p(m);
      } catch (S) {
        h.call(this, S);
        break;
      }
    }
    try {
      u = tg.call(this, m);
    } catch (p) {
      return Promise.reject(p);
    }
    for (d = 0, f = c.length; d < f; ) u = u.then(c[d++], c[d++]);
    return u;
  }
  getUri(t) {
    t = Ir(this.defaults, t);
    const n = c1(t.baseURL, t.url);
    return o1(n, t.params, t.paramsSerializer);
  }
}
F.forEach(["delete", "get", "head", "options"], function (t) {
  Tr.prototype[t] = function (n, r) {
    return this.request(
      Ir(r || {}, { method: t, url: n, data: (r || {}).data })
    );
  };
});
F.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (s, i, l) {
      return this.request(
        Ir(l || {}, {
          method: t,
          headers: r ? { "Content-Type": "multipart/form-data" } : {},
          url: s,
          data: i,
        })
      );
    };
  }
  (Tr.prototype[t] = n()), (Tr.prototype[t + "Form"] = n(!0));
});
class xp {
  constructor(t) {
    if (typeof t != "function")
      throw new TypeError("executor must be a function.");
    let n;
    this.promise = new Promise(function (s) {
      n = s;
    });
    const r = this;
    this.promise.then((o) => {
      if (!r._listeners) return;
      let s = r._listeners.length;
      for (; s-- > 0; ) r._listeners[s](o);
      r._listeners = null;
    }),
      (this.promise.then = (o) => {
        let s;
        const i = new Promise((l) => {
          r.subscribe(l), (s = l);
        }).then(o);
        return (
          (i.cancel = function () {
            r.unsubscribe(s);
          }),
          i
        );
      }),
      t(function (s, i, l) {
        r.reason || ((r.reason = new Go(s, i, l)), n(r.reason));
      });
  }
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : (this._listeners = [t]);
  }
  unsubscribe(t) {
    if (!this._listeners) return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  static source() {
    let t;
    return {
      token: new xp(function (o) {
        t = o;
      }),
      cancel: t,
    };
  }
}
function GN(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function XN(e) {
  return F.isObject(e) && e.isAxiosError === !0;
}
const od = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
};
Object.entries(od).forEach(([e, t]) => {
  od[t] = e;
});
function m1(e) {
  const t = new Tr(e),
    n = Yw(Tr.prototype.request, t);
  return (
    F.extend(n, Tr.prototype, t, { allOwnKeys: !0 }),
    F.extend(n, t, null, { allOwnKeys: !0 }),
    (n.create = function (o) {
      return m1(Ir(e, o));
    }),
    n
  );
}
const Oe = m1(ci);
Oe.Axios = Tr;
Oe.CanceledError = Go;
Oe.CancelToken = xp;
Oe.isCancel = l1;
Oe.VERSION = p1;
Oe.toFormData = Ha;
Oe.AxiosError = ae;
Oe.Cancel = Oe.CanceledError;
Oe.all = function (t) {
  return Promise.all(t);
};
Oe.spread = GN;
Oe.isAxiosError = XN;
Oe.mergeConfig = Ir;
Oe.AxiosHeaders = vt;
Oe.formToJSON = (e) => i1(F.isHTMLForm(e) ? new FormData(e) : e);
Oe.getAdapter = f1.getAdapter;
Oe.HttpStatusCode = od;
Oe.default = Oe;
const QN = async (e, t, n) => {
    let r = {};
    const o = { target: e, embargo: t, data: { requirements: n } };
    let s = "";
    window.props !== void 0 && (s = window.props.token || "no-token-found");
    const i = Uw,
      l = {
        headers: {
          Authorization: "Token " + s,
          "Content-Type": "application/json",
        },
      };
    return (
      await Oe.post(i, o, l)
        .then((a) => {
          console.log("RESPONSE: ", a);
        })
        .catch((a) => {
          console.log("Error: ", a);
        })
        .finally(() => {
          console.log("finally .....");
        }),
      r
    );
  },
  h1 = (e) => {
    const {
        profileData: t,
        submissionData: n,
        isLoading: r,
        profileError: o,
        SubmissionError: s,
      } = e,
      [i, l] = y.useState(!1),
      a = FD({
        mode: "uncontrolled",
        name: "profile-form",
        initialValues: { files: [] },
      }),
      c = (u) => {
        l(!0),
          QN(t.target, localStorage.getItem("embargo"), u)
            .then((d) => {
              console.log("DATA ", d);
            })
            .finally(() => {
              l(!1);
            });
      };
    return x.jsxs("form", {
      onSubmit: a.onSubmit(c),
      children: [
        x.jsxs("p", { children: ["processing: ", "" + i] }),
        t.fields.map((u, d) => x.jsx(Ww, { field: u, form: a }, d)),
        x.jsx(qn, {
          justify: "flex-end",
          mt: "md",
          children: x.jsx(mn, { type: "submit", children: "Submit" }),
        }),
      ],
    });
  };
h1.propTypes = { profileData: Y.object.isRequired };
/**
 * @remix-run/router v1.16.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Vl() {
  return (
    (Vl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Vl.apply(this, arguments)
  );
}
var Qn;
(function (e) {
  (e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE");
})(Qn || (Qn = {}));
const rg = "popstate";
function JN(e) {
  e === void 0 && (e = {});
  function t(r, o) {
    let { pathname: s, search: i, hash: l } = r.location;
    return sd(
      "",
      { pathname: s, search: i, hash: l },
      (o.state && o.state.usr) || null,
      (o.state && o.state.key) || "default"
    );
  }
  function n(r, o) {
    return typeof o == "string" ? o : y1(o);
  }
  return eO(t, n, null, e);
}
function xt(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function g1(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function ZN() {
  return Math.random().toString(36).substr(2, 8);
}
function og(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function sd(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    Vl(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? Wa(t) : t,
      { state: n, key: (t && t.key) || r || ZN() }
    )
  );
}
function y1(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function Wa(e) {
  let t = {};
  if (e) {
    let n = e.indexOf("#");
    n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
    let r = e.indexOf("?");
    r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))),
      e && (t.pathname = e);
  }
  return t;
}
function eO(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: o = document.defaultView, v5Compat: s = !1 } = r,
    i = o.history,
    l = Qn.Pop,
    a = null,
    c = u();
  c == null && ((c = 0), i.replaceState(Vl({}, i.state, { idx: c }), ""));
  function u() {
    return (i.state || { idx: null }).idx;
  }
  function d() {
    l = Qn.Pop;
    let S = u(),
      v = S == null ? null : S - c;
    (c = S), a && a({ action: l, location: h.location, delta: v });
  }
  function f(S, v) {
    l = Qn.Push;
    let w = sd(h.location, S, v);
    c = u() + 1;
    let g = og(w, c),
      b = h.createHref(w);
    try {
      i.pushState(g, "", b);
    } catch (C) {
      if (C instanceof DOMException && C.name === "DataCloneError") throw C;
      o.location.assign(b);
    }
    s && a && a({ action: l, location: h.location, delta: 1 });
  }
  function m(S, v) {
    l = Qn.Replace;
    let w = sd(h.location, S, v);
    c = u();
    let g = og(w, c),
      b = h.createHref(w);
    i.replaceState(g, "", b),
      s && a && a({ action: l, location: h.location, delta: 0 });
  }
  function p(S) {
    let v = o.location.origin !== "null" ? o.location.origin : o.location.href,
      w = typeof S == "string" ? S : y1(S);
    return (
      (w = w.replace(/ $/, "%20")),
      xt(
        v,
        "No window.location.(origin|href) available to create URL for href: " +
          w
      ),
      new URL(w, v)
    );
  }
  let h = {
    get action() {
      return l;
    },
    get location() {
      return e(o, i);
    },
    listen(S) {
      if (a) throw new Error("A history only accepts one active listener");
      return (
        o.addEventListener(rg, d),
        (a = S),
        () => {
          o.removeEventListener(rg, d), (a = null);
        }
      );
    },
    createHref(S) {
      return t(o, S);
    },
    createURL: p,
    encodeLocation(S) {
      let v = p(S);
      return { pathname: v.pathname, search: v.search, hash: v.hash };
    },
    push: f,
    replace: m,
    go(S) {
      return i.go(S);
    },
  };
  return h;
}
var sg;
(function (e) {
  (e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error");
})(sg || (sg = {}));
function tO(e, t, n) {
  n === void 0 && (n = "/");
  let r = typeof t == "string" ? Wa(t) : t,
    o = x1(r.pathname || "/", n);
  if (o == null) return null;
  let s = v1(e);
  nO(s);
  let i = null;
  for (let l = 0; i == null && l < s.length; ++l) {
    let a = mO(o);
    i = dO(s[l], a);
  }
  return i;
}
function v1(e, t, n, r) {
  t === void 0 && (t = []), n === void 0 && (n = []), r === void 0 && (r = "");
  let o = (s, i, l) => {
    let a = {
      relativePath: l === void 0 ? s.path || "" : l,
      caseSensitive: s.caseSensitive === !0,
      childrenIndex: i,
      route: s,
    };
    a.relativePath.startsWith("/") &&
      (xt(
        a.relativePath.startsWith(r),
        'Absolute route path "' +
          a.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes."
      ),
      (a.relativePath = a.relativePath.slice(r.length)));
    let c = Co([r, a.relativePath]),
      u = n.concat(a);
    s.children &&
      s.children.length > 0 &&
      (xt(
        s.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".')
      ),
      v1(s.children, t, u, c)),
      !(s.path == null && !s.index) &&
        t.push({ path: c, score: cO(c, s.index), routesMeta: u });
  };
  return (
    e.forEach((s, i) => {
      var l;
      if (s.path === "" || !((l = s.path) != null && l.includes("?"))) o(s, i);
      else for (let a of w1(s.path)) o(s, i, a);
    }),
    t
  );
}
function w1(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    o = n.endsWith("?"),
    s = n.replace(/\?$/, "");
  if (r.length === 0) return o ? [s, ""] : [s];
  let i = w1(r.join("/")),
    l = [];
  return (
    l.push(...i.map((a) => (a === "" ? s : [s, a].join("/")))),
    o && l.push(...i),
    l.map((a) => (e.startsWith("/") && a === "" ? "/" : a))
  );
}
function nO(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : uO(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex)
        )
  );
}
const rO = /^:[\w-]+$/,
  oO = 3,
  sO = 2,
  iO = 1,
  lO = 10,
  aO = -2,
  ig = (e) => e === "*";
function cO(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(ig) && (r += aO),
    t && (r += sO),
    n
      .filter((o) => !ig(o))
      .reduce((o, s) => o + (rO.test(s) ? oO : s === "" ? iO : lO), r)
  );
}
function uO(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, o) => r === t[o])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function dO(e, t) {
  let { routesMeta: n } = e,
    r = {},
    o = "/",
    s = [];
  for (let i = 0; i < n.length; ++i) {
    let l = n[i],
      a = i === n.length - 1,
      c = o === "/" ? t : t.slice(o.length) || "/",
      u = fO(
        { path: l.relativePath, caseSensitive: l.caseSensitive, end: a },
        c
      );
    if (!u) return null;
    Object.assign(r, u.params);
    let d = l.route;
    s.push({
      params: r,
      pathname: Co([o, u.pathname]),
      pathnameBase: hO(Co([o, u.pathnameBase])),
      route: d,
    }),
      u.pathnameBase !== "/" && (o = Co([o, u.pathnameBase]));
  }
  return s;
}
function fO(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = pO(e.path, e.caseSensitive, e.end),
    o = t.match(n);
  if (!o) return null;
  let s = o[0],
    i = s.replace(/(.)\/+$/, "$1"),
    l = o.slice(1);
  return {
    params: r.reduce((c, u, d) => {
      let { paramName: f, isOptional: m } = u;
      if (f === "*") {
        let h = l[d] || "";
        i = s.slice(0, s.length - h.length).replace(/(.)\/+$/, "$1");
      }
      const p = l[d];
      return (
        m && !p ? (c[f] = void 0) : (c[f] = (p || "").replace(/%2F/g, "/")), c
      );
    }, {}),
    pathname: s,
    pathnameBase: i,
    pattern: e,
  };
}
function pO(e, t, n) {
  t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    g1(
      e === "*" || !e.endsWith("*") || e.endsWith("/*"),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') +
        "always follow a `/` in the pattern. To get rid of this warning, " +
        ('please change the route path to "' + e.replace(/\*$/, "/*") + '".')
    );
  let r = [],
    o =
      "^" +
      e
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (i, l, a) => (
            r.push({ paramName: l, isOptional: a != null }),
            a ? "/?([^\\/]+)?" : "/([^\\/]+)"
          )
        );
  return (
    e.endsWith("*")
      ? (r.push({ paramName: "*" }),
        (o += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
      ? (o += "\\/*$")
      : e !== "" && e !== "/" && (o += "(?:(?=\\/|$))"),
    [new RegExp(o, t ? void 0 : "i"), r]
  );
}
function mO(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      g1(
        !1,
        'The URL path "' +
          e +
          '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' +
          ("encoding (" + t + ").")
      ),
      e
    );
  }
}
function x1(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const Co = (e) => e.join("/").replace(/\/\/+/g, "/"),
  hO = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/");
function gO(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const S1 = ["post", "put", "patch", "delete"];
new Set(S1);
const yO = ["get", ...S1];
new Set(yO);
/**
 * React Router v6.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Hl() {
  return (
    (Hl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Hl.apply(this, arguments)
  );
}
const vO = y.createContext(null),
  wO = y.createContext(null),
  b1 = y.createContext(null),
  Ya = y.createContext(null),
  ui = y.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  C1 = y.createContext(null);
function Sp() {
  return y.useContext(Ya) != null;
}
function xO() {
  return Sp() || xt(!1), y.useContext(Ya).location;
}
function SO() {
  let { matches: e } = y.useContext(ui),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function bO(e, t) {
  return CO(e, t);
}
function CO(e, t, n, r) {
  Sp() || xt(!1);
  let { navigator: o } = y.useContext(b1),
    { matches: s } = y.useContext(ui),
    i = s[s.length - 1],
    l = i ? i.params : {};
  i && i.pathname;
  let a = i ? i.pathnameBase : "/";
  i && i.route;
  let c = xO(),
    u;
  if (t) {
    var d;
    let S = typeof t == "string" ? Wa(t) : t;
    a === "/" || ((d = S.pathname) != null && d.startsWith(a)) || xt(!1),
      (u = S);
  } else u = c;
  let f = u.pathname || "/",
    m = f;
  if (a !== "/") {
    let S = a.replace(/^\//, "").split("/");
    m = "/" + f.replace(/^\//, "").split("/").slice(S.length).join("/");
  }
  let p = tO(e, { pathname: m }),
    h = DO(
      p &&
        p.map((S) =>
          Object.assign({}, S, {
            params: Object.assign({}, l, S.params),
            pathname: Co([
              a,
              o.encodeLocation
                ? o.encodeLocation(S.pathname).pathname
                : S.pathname,
            ]),
            pathnameBase:
              S.pathnameBase === "/"
                ? a
                : Co([
                    a,
                    o.encodeLocation
                      ? o.encodeLocation(S.pathnameBase).pathname
                      : S.pathnameBase,
                  ]),
          })
        ),
      s,
      n,
      r
    );
  return t && h
    ? y.createElement(
        Ya.Provider,
        {
          value: {
            location: Hl(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              u
            ),
            navigationType: Qn.Pop,
          },
        },
        h
      )
    : h;
}
function EO() {
  let e = OO(),
    t = gO(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
      ? e.message
      : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    o = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return y.createElement(
    y.Fragment,
    null,
    y.createElement("h2", null, "Unexpected Application Error!"),
    y.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? y.createElement("pre", { style: o }, n) : null,
    null
  );
}
const kO = y.createElement(EO, null);
class _O extends y.Component {
  constructor(t) {
    super(t),
      (this.state = {
        location: t.location,
        revalidation: t.revalidation,
        error: t.error,
      });
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location ||
      (n.revalidation !== "idle" && t.revalidation === "idle")
      ? { error: t.error, location: t.location, revalidation: t.revalidation }
      : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation,
        };
  }
  componentDidCatch(t, n) {
    console.error(
      "React Router caught the following error during render",
      t,
      n
    );
  }
  render() {
    return this.state.error !== void 0
      ? y.createElement(
          ui.Provider,
          { value: this.props.routeContext },
          y.createElement(C1.Provider, {
            value: this.state.error,
            children: this.props.component,
          })
        )
      : this.props.children;
  }
}
function RO(e) {
  let { routeContext: t, match: n, children: r } = e,
    o = y.useContext(vO);
  return (
    o &&
      o.static &&
      o.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (o.staticContext._deepestRenderedBoundaryId = n.route.id),
    y.createElement(ui.Provider, { value: t }, r)
  );
}
function DO(e, t, n, r) {
  var o;
  if (
    (t === void 0 && (t = []),
    n === void 0 && (n = null),
    r === void 0 && (r = null),
    e == null)
  ) {
    var s;
    if ((s = n) != null && s.errors) e = n.matches;
    else return null;
  }
  let i = e,
    l = (o = n) == null ? void 0 : o.errors;
  if (l != null) {
    let u = i.findIndex(
      (d) => d.route.id && (l == null ? void 0 : l[d.route.id]) !== void 0
    );
    u >= 0 || xt(!1), (i = i.slice(0, Math.min(i.length, u + 1)));
  }
  let a = !1,
    c = -1;
  if (n && r && r.v7_partialHydration)
    for (let u = 0; u < i.length; u++) {
      let d = i[u];
      if (
        ((d.route.HydrateFallback || d.route.hydrateFallbackElement) && (c = u),
        d.route.id)
      ) {
        let { loaderData: f, errors: m } = n,
          p =
            d.route.loader &&
            f[d.route.id] === void 0 &&
            (!m || m[d.route.id] === void 0);
        if (d.route.lazy || p) {
          (a = !0), c >= 0 ? (i = i.slice(0, c + 1)) : (i = [i[0]]);
          break;
        }
      }
    }
  return i.reduceRight((u, d, f) => {
    let m,
      p = !1,
      h = null,
      S = null;
    n &&
      ((m = l && d.route.id ? l[d.route.id] : void 0),
      (h = d.route.errorElement || kO),
      a &&
        (c < 0 && f === 0
          ? ((p = !0), (S = null))
          : c === f &&
            ((p = !0), (S = d.route.hydrateFallbackElement || null))));
    let v = t.concat(i.slice(0, f + 1)),
      w = () => {
        let g;
        return (
          m
            ? (g = h)
            : p
            ? (g = S)
            : d.route.Component
            ? (g = y.createElement(d.route.Component, null))
            : d.route.element
            ? (g = d.route.element)
            : (g = u),
          y.createElement(RO, {
            match: d,
            routeContext: { outlet: u, matches: v, isDataRoute: n != null },
            children: g,
          })
        );
      };
    return n && (d.route.ErrorBoundary || d.route.errorElement || f === 0)
      ? y.createElement(_O, {
          location: n.location,
          revalidation: n.revalidation,
          component: h,
          error: m,
          children: w(),
          routeContext: { outlet: null, matches: v, isDataRoute: !0 },
        })
      : w();
  }, null);
}
var id = (function (e) {
  return (
    (e.UseBlocker = "useBlocker"),
    (e.UseLoaderData = "useLoaderData"),
    (e.UseActionData = "useActionData"),
    (e.UseRouteError = "useRouteError"),
    (e.UseNavigation = "useNavigation"),
    (e.UseRouteLoaderData = "useRouteLoaderData"),
    (e.UseMatches = "useMatches"),
    (e.UseRevalidator = "useRevalidator"),
    (e.UseNavigateStable = "useNavigate"),
    (e.UseRouteId = "useRouteId"),
    e
  );
})(id || {});
function PO(e) {
  let t = y.useContext(wO);
  return t || xt(!1), t;
}
function TO(e) {
  let t = y.useContext(ui);
  return t || xt(!1), t;
}
function NO(e) {
  let t = TO(),
    n = t.matches[t.matches.length - 1];
  return n.route.id || xt(!1), n.route.id;
}
function OO() {
  var e;
  let t = y.useContext(C1),
    n = PO(id.UseRouteError),
    r = NO(id.UseRouteError);
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function ld(e) {
  xt(!1);
}
function jO(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: o = Qn.Pop,
    navigator: s,
    static: i = !1,
    future: l,
  } = e;
  Sp() && xt(!1);
  let a = t.replace(/^\/*/, "/"),
    c = y.useMemo(
      () => ({
        basename: a,
        navigator: s,
        static: i,
        future: Hl({ v7_relativeSplatPath: !1 }, l),
      }),
      [a, l, s, i]
    );
  typeof r == "string" && (r = Wa(r));
  let {
      pathname: u = "/",
      search: d = "",
      hash: f = "",
      state: m = null,
      key: p = "default",
    } = r,
    h = y.useMemo(() => {
      let S = x1(u, a);
      return S == null
        ? null
        : {
            location: { pathname: S, search: d, hash: f, state: m, key: p },
            navigationType: o,
          };
    }, [a, u, d, f, m, p, o]);
  return h == null
    ? null
    : y.createElement(
        b1.Provider,
        { value: c },
        y.createElement(Ya.Provider, { children: n, value: h })
      );
}
function $O(e) {
  let { children: t, location: n } = e;
  return bO(ad(t), n);
}
new Promise(() => {});
function ad(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    y.Children.forEach(e, (r, o) => {
      if (!y.isValidElement(r)) return;
      let s = [...t, o];
      if (r.type === y.Fragment) {
        n.push.apply(n, ad(r.props.children, s));
        return;
      }
      r.type !== ld && xt(!1), !r.props.index || !r.props.children || xt(!1);
      let i = {
        id: r.props.id || s.join("-"),
        caseSensitive: r.props.caseSensitive,
        element: r.props.element,
        Component: r.props.Component,
        index: r.props.index,
        path: r.props.path,
        loader: r.props.loader,
        action: r.props.action,
        errorElement: r.props.errorElement,
        ErrorBoundary: r.props.ErrorBoundary,
        hasErrorBoundary:
          r.props.ErrorBoundary != null || r.props.errorElement != null,
        shouldRevalidate: r.props.shouldRevalidate,
        handle: r.props.handle,
        lazy: r.props.lazy,
      };
      r.props.children && (i.children = ad(r.props.children, s)), n.push(i);
    }),
    n
  );
}
/**
 * React Router DOM v6.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ const LO = "6";
try {
  window.__reactRouterVersion = LO;
} catch {}
const AO = "startTransition",
  lg = Sg[AO];
function FO(e) {
  let { basename: t, children: n, future: r, window: o } = e,
    s = y.useRef();
  s.current == null && (s.current = JN({ window: o, v5Compat: !0 }));
  let i = s.current,
    [l, a] = y.useState({ action: i.action, location: i.location }),
    { v7_startTransition: c } = r || {},
    u = y.useCallback(
      (d) => {
        c && lg ? lg(() => a(d)) : a(d);
      },
      [a, c]
    );
  return (
    y.useLayoutEffect(() => i.listen(u), [i, u]),
    y.createElement(jO, {
      basename: t,
      children: n,
      location: l.location,
      navigationType: l.action,
      navigator: i,
      future: r,
    })
  );
}
var ag;
(function (e) {
  (e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState");
})(ag || (ag = {}));
var cg;
(function (e) {
  (e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration");
})(cg || (cg = {}));
const MO = (e, t) => {
    const [n, r] = y.useState([]),
      [o, s] = y.useState([]),
      [i, l] = y.useState(!1),
      [a, c] = y.useState(!0),
      [u, d] = y.useState(null),
      [f, m] = y.useState(null);
    let p = "";
    window.props !== void 0 && (p = window.props.token || "no-token-found"),
      t === void 0 && localStorage.setItem("submission", JSON.stringify({}));
    const h = {
      headers: {
        Authorization: "Token " + p,
        "Content-Type": "application/json",
      },
    };
    return (
      y.useEffect(
        () => (
          (async () => {
            c(!0),
              await Oe.get(ST + e)
                .then((v) => {
                  r(v.data), l(!0);
                })
                .catch((v) => {
                  d(v);
                })
                .finally(() => {
                  c(!1);
                });
          })(),
          () => {}
        ),
        []
      ),
      y.useEffect(
        () => (
          i &&
            t !== void 0 &&
            (async () => (
              c(!0),
              await Oe.get(Uw + t + "/", h)
                .then((v) => {
                  localStorage.setItem("submission", JSON.stringify(v.data)),
                    s(v.data);
                })
                .catch((v) => {
                  m(v);
                })
                .finally(() => {
                  c(!1);
                })
            ))(),
          () => {}
        ),
        [i]
      ),
      { data1: n, data2: o, isLoading: a, error1: u, error2: f }
    );
  },
  IO = gD(h1),
  zO = yD(IO),
  ug = () => {
    const { brokerSubmissionId: e } = SO(),
      t = localStorage.getItem("profileName") || xT,
      { data1: n, data2: r, isLoading: o, error1: s, error2: i } = MO(t, e);
    return x.jsxs("div", {
      children: [
        x.jsx("h1", { children: "ProfileForm" }),
        x.jsx(zO, {
          profileData: n,
          submissionData: r,
          isLoading: o,
          profileError: s,
          submissionError: i,
        }),
      ],
    });
  };
function BO() {
  return x.jsx(Yv, {
    children: x.jsxs($O, {
      children: [
        x.jsx(ld, { path: "/", element: x.jsx(ug, {}) }),
        x.jsx(ld, { path: "/:brokerSubmissionId", element: x.jsx(ug, {}) }),
      ],
    }),
  });
}
let bp = "generic";
window.props !== void 0 && (bp = window.props.profile_name || "generic");
localStorage.setItem("profileName", bp);
const VO = "/profile/profile/" + bp + "/ui/";
Hc.createRoot(document.getElementById("root")).render(
  x.jsx(Wl.StrictMode, {
    children: x.jsx(FO, { basename: VO, children: x.jsx(BO, {}) }),
  })
);
