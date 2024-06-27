function O1(e, t) {
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
var wd =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
function Zr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var bg = { exports: {} },
  na = {},
  Cg = { exports: {} },
  fe = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var fi = Symbol.for("react.element"),
  j1 = Symbol.for("react.portal"),
  $1 = Symbol.for("react.fragment"),
  L1 = Symbol.for("react.strict_mode"),
  A1 = Symbol.for("react.profiler"),
  F1 = Symbol.for("react.provider"),
  M1 = Symbol.for("react.context"),
  I1 = Symbol.for("react.forward_ref"),
  z1 = Symbol.for("react.suspense"),
  B1 = Symbol.for("react.memo"),
  V1 = Symbol.for("react.lazy"),
  Fp = Symbol.iterator;
function H1(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Fp && e[Fp]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Eg = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  _g = Object.assign,
  kg = {};
function Zo(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = kg),
    (this.updater = n || Eg);
}
Zo.prototype.isReactComponent = {};
Zo.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
Zo.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Rg() {}
Rg.prototype = Zo.prototype;
function xd(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = kg),
    (this.updater = n || Eg);
}
var Sd = (xd.prototype = new Rg());
Sd.constructor = xd;
_g(Sd, Zo.prototype);
Sd.isPureReactComponent = !0;
var Mp = Array.isArray,
  Dg = Object.prototype.hasOwnProperty,
  bd = { current: null },
  Pg = { key: !0, ref: !0, __self: !0, __source: !0 };
function Tg(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (i = t.ref),
    t.key !== void 0 && (s = "" + t.key),
    t))
      Dg.call(t, r) && !Pg.hasOwnProperty(r) && (o[r] = t[r]);
  var l = arguments.length - 2;
  if (l === 1) o.children = n;
  else if (1 < l) {
    for (var a = Array(l), c = 0; c < l; c++) a[c] = arguments[c + 2];
    o.children = a;
  }
  if (e && e.defaultProps)
    for (r in ((l = e.defaultProps), l)) o[r] === void 0 && (o[r] = l[r]);
  return {
    $$typeof: fi,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: bd.current,
  };
}
function W1(e, t) {
  return {
    $$typeof: fi,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Cd(e) {
  return typeof e == "object" && e !== null && e.$$typeof === fi;
}
function U1(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Ip = /\/+/g;
function ac(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? U1("" + e.key)
    : t.toString(36);
}
function tl(e, t, n, r, o) {
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
          case fi:
          case j1:
            i = !0;
        }
    }
  if (i)
    return (
      (i = e),
      (o = o(i)),
      (e = r === "" ? "." + ac(i, 0) : r),
      Mp(o)
        ? ((n = ""),
          e != null && (n = e.replace(Ip, "$&/") + "/"),
          tl(o, t, n, "", function (c) {
            return c;
          }))
        : o != null &&
          (Cd(o) &&
            (o = W1(
              o,
              n +
                (!o.key || (i && i.key === o.key)
                  ? ""
                  : ("" + o.key).replace(Ip, "$&/") + "/") +
                e
            )),
          t.push(o)),
      1
    );
  if (((i = 0), (r = r === "" ? "." : r + ":"), Mp(e)))
    for (var l = 0; l < e.length; l++) {
      s = e[l];
      var a = r + ac(s, l);
      i += tl(s, t, n, a, o);
    }
  else if (((a = H1(e)), typeof a == "function"))
    for (e = a.call(e), l = 0; !(s = e.next()).done; )
      (s = s.value), (a = r + ac(s, l++)), (i += tl(s, t, n, a, o));
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
function Di(e, t, n) {
  if (e == null) return e;
  var r = [],
    o = 0;
  return (
    tl(e, r, "", "", function (s) {
      return t.call(n, s, o++);
    }),
    r
  );
}
function Y1(e) {
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
var pt = { current: null },
  nl = { transition: null },
  q1 = {
    ReactCurrentDispatcher: pt,
    ReactCurrentBatchConfig: nl,
    ReactCurrentOwner: bd,
  };
function Ng() {
  throw Error("act(...) is not supported in production builds of React.");
}
fe.Children = {
  map: Di,
  forEach: function (e, t, n) {
    Di(
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
      Di(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      Di(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Cd(e))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return e;
  },
};
fe.Component = Zo;
fe.Fragment = $1;
fe.Profiler = A1;
fe.PureComponent = xd;
fe.StrictMode = L1;
fe.Suspense = z1;
fe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = q1;
fe.act = Ng;
fe.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        "."
    );
  var r = _g({}, e.props),
    o = e.key,
    s = e.ref,
    i = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((s = t.ref), (i = bd.current)),
      t.key !== void 0 && (o = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var l = e.type.defaultProps;
    for (a in t)
      Dg.call(t, a) &&
        !Pg.hasOwnProperty(a) &&
        (r[a] = t[a] === void 0 && l !== void 0 ? l[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    l = Array(a);
    for (var c = 0; c < a; c++) l[c] = arguments[c + 2];
    r.children = l;
  }
  return { $$typeof: fi, type: e.type, key: o, ref: s, props: r, _owner: i };
};
fe.createContext = function (e) {
  return (
    (e = {
      $$typeof: M1,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: F1, _context: e }),
    (e.Consumer = e)
  );
};
fe.createElement = Tg;
fe.createFactory = function (e) {
  var t = Tg.bind(null, e);
  return (t.type = e), t;
};
fe.createRef = function () {
  return { current: null };
};
fe.forwardRef = function (e) {
  return { $$typeof: I1, render: e };
};
fe.isValidElement = Cd;
fe.lazy = function (e) {
  return { $$typeof: V1, _payload: { _status: -1, _result: e }, _init: Y1 };
};
fe.memo = function (e, t) {
  return { $$typeof: B1, type: e, compare: t === void 0 ? null : t };
};
fe.startTransition = function (e) {
  var t = nl.transition;
  nl.transition = {};
  try {
    e();
  } finally {
    nl.transition = t;
  }
};
fe.unstable_act = Ng;
fe.useCallback = function (e, t) {
  return pt.current.useCallback(e, t);
};
fe.useContext = function (e) {
  return pt.current.useContext(e);
};
fe.useDebugValue = function () {};
fe.useDeferredValue = function (e) {
  return pt.current.useDeferredValue(e);
};
fe.useEffect = function (e, t) {
  return pt.current.useEffect(e, t);
};
fe.useId = function () {
  return pt.current.useId();
};
fe.useImperativeHandle = function (e, t, n) {
  return pt.current.useImperativeHandle(e, t, n);
};
fe.useInsertionEffect = function (e, t) {
  return pt.current.useInsertionEffect(e, t);
};
fe.useLayoutEffect = function (e, t) {
  return pt.current.useLayoutEffect(e, t);
};
fe.useMemo = function (e, t) {
  return pt.current.useMemo(e, t);
};
fe.useReducer = function (e, t, n) {
  return pt.current.useReducer(e, t, n);
};
fe.useRef = function (e) {
  return pt.current.useRef(e);
};
fe.useState = function (e) {
  return pt.current.useState(e);
};
fe.useSyncExternalStore = function (e, t, n) {
  return pt.current.useSyncExternalStore(e, t, n);
};
fe.useTransition = function () {
  return pt.current.useTransition();
};
fe.version = "18.3.1";
Cg.exports = fe;
var x = Cg.exports;
const ra = Zr(x),
  Og = O1({ __proto__: null, default: ra }, [x]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var K1 = x,
  G1 = Symbol.for("react.element"),
  X1 = Symbol.for("react.fragment"),
  Q1 = Object.prototype.hasOwnProperty,
  J1 = K1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  Z1 = { key: !0, ref: !0, __self: !0, __source: !0 };
function jg(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  n !== void 0 && (s = "" + n),
    t.key !== void 0 && (s = "" + t.key),
    t.ref !== void 0 && (i = t.ref);
  for (r in t) Q1.call(t, r) && !Z1.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) o[r] === void 0 && (o[r] = t[r]);
  return {
    $$typeof: G1,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: J1.current,
  };
}
na.Fragment = X1;
na.jsx = jg;
na.jsxs = jg;
bg.exports = na;
var g = bg.exports,
  Zc = {},
  $g = { exports: {} },
  At = {},
  Lg = { exports: {} },
  Ag = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(k, _) {
    var $ = k.length;
    k.push(_);
    e: for (; 0 < $; ) {
      var O = ($ - 1) >>> 1,
        I = k[O];
      if (0 < o(I, _)) (k[O] = _), (k[$] = I), ($ = O);
      else break e;
    }
  }
  function n(k) {
    return k.length === 0 ? null : k[0];
  }
  function r(k) {
    if (k.length === 0) return null;
    var _ = k[0],
      $ = k.pop();
    if ($ !== _) {
      k[0] = $;
      e: for (var O = 0, I = k.length, q = I >>> 1; O < q; ) {
        var Q = 2 * (O + 1) - 1,
          ee = k[Q],
          ne = Q + 1,
          te = k[ne];
        if (0 > o(ee, $))
          ne < I && 0 > o(te, ee)
            ? ((k[O] = te), (k[ne] = $), (O = ne))
            : ((k[O] = ee), (k[Q] = $), (O = Q));
        else if (ne < I && 0 > o(te, $)) (k[O] = te), (k[ne] = $), (O = ne);
        else break e;
      }
    }
    return _;
  }
  function o(k, _) {
    var $ = k.sortIndex - _.sortIndex;
    return $ !== 0 ? $ : k.id - _.id;
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
    p = !1,
    m = !1,
    h = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    v = typeof clearTimeout == "function" ? clearTimeout : null,
    w = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function y(k) {
    for (var _ = n(c); _ !== null; ) {
      if (_.callback === null) r(c);
      else if (_.startTime <= k)
        r(c), (_.sortIndex = _.expirationTime), t(a, _);
      else break;
      _ = n(c);
    }
  }
  function b(k) {
    if (((h = !1), y(k), !m))
      if (n(a) !== null) (m = !0), P(E);
      else {
        var _ = n(c);
        _ !== null && T(b, _.startTime - k);
      }
  }
  function E(k, _) {
    (m = !1), h && ((h = !1), v(D), (D = -1)), (p = !0);
    var $ = f;
    try {
      for (
        y(_), d = n(a);
        d !== null && (!(d.expirationTime > _) || (k && !M()));

      ) {
        var O = d.callback;
        if (typeof O == "function") {
          (d.callback = null), (f = d.priorityLevel);
          var I = O(d.expirationTime <= _);
          (_ = e.unstable_now()),
            typeof I == "function" ? (d.callback = I) : d === n(a) && r(a),
            y(_);
        } else r(a);
        d = n(a);
      }
      if (d !== null) var q = !0;
      else {
        var Q = n(c);
        Q !== null && T(b, Q.startTime - _), (q = !1);
      }
      return q;
    } finally {
      (d = null), (f = $), (p = !1);
    }
  }
  var C = !1,
    R = null,
    D = -1,
    L = 5,
    N = -1;
  function M() {
    return !(e.unstable_now() - N < L);
  }
  function B() {
    if (R !== null) {
      var k = e.unstable_now();
      N = k;
      var _ = !0;
      try {
        _ = R(!0, k);
      } finally {
        _ ? V() : ((C = !1), (R = null));
      }
    } else C = !1;
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
  function P(k) {
    (R = k), C || ((C = !0), V());
  }
  function T(k, _) {
    D = S(function () {
      k(e.unstable_now());
    }, _);
  }
  (e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (k) {
      k.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      m || p || ((m = !0), P(E));
    }),
    (e.unstable_forceFrameRate = function (k) {
      0 > k || 125 < k
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
          )
        : (L = 0 < k ? Math.floor(1e3 / k) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return f;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(a);
    }),
    (e.unstable_next = function (k) {
      switch (f) {
        case 1:
        case 2:
        case 3:
          var _ = 3;
          break;
        default:
          _ = f;
      }
      var $ = f;
      f = _;
      try {
        return k();
      } finally {
        f = $;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (k, _) {
      switch (k) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          k = 3;
      }
      var $ = f;
      f = k;
      try {
        return _();
      } finally {
        f = $;
      }
    }),
    (e.unstable_scheduleCallback = function (k, _, $) {
      var O = e.unstable_now();
      switch (
        (typeof $ == "object" && $ !== null
          ? (($ = $.delay), ($ = typeof $ == "number" && 0 < $ ? O + $ : O))
          : ($ = O),
        k)
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
        (k = {
          id: u++,
          callback: _,
          priorityLevel: k,
          startTime: $,
          expirationTime: I,
          sortIndex: -1,
        }),
        $ > O
          ? ((k.sortIndex = $),
            t(c, k),
            n(a) === null &&
              k === n(c) &&
              (h ? (v(D), (D = -1)) : (h = !0), T(b, $ - O)))
          : ((k.sortIndex = I), t(a, k), m || p || ((m = !0), P(E))),
        k
      );
    }),
    (e.unstable_shouldYield = M),
    (e.unstable_wrapCallback = function (k) {
      var _ = f;
      return function () {
        var $ = f;
        f = _;
        try {
          return k.apply(this, arguments);
        } finally {
          f = $;
        }
      };
    });
})(Ag);
Lg.exports = Ag;
var ex = Lg.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var tx = x,
  Lt = ex;
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
var Fg = new Set(),
  Vs = {};
function eo(e, t) {
  zo(e, t), zo(e + "Capture", t);
}
function zo(e, t) {
  for (Vs[e] = t, e = 0; e < t.length; e++) Fg.add(t[e]);
}
var In = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  eu = Object.prototype.hasOwnProperty,
  nx =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  zp = {},
  Bp = {};
function rx(e) {
  return eu.call(Bp, e)
    ? !0
    : eu.call(zp, e)
    ? !1
    : nx.test(e)
    ? (Bp[e] = !0)
    : ((zp[e] = !0), !1);
}
function ox(e, t, n, r) {
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
function sx(e, t, n, r) {
  if (t === null || typeof t > "u" || ox(e, t, n, r)) return !0;
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
function mt(e, t, n, r, o, s, i) {
  (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = o),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = s),
    (this.removeEmptyString = i);
}
var Ze = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Ze[e] = new mt(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Ze[t] = new mt(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Ze[e] = new mt(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  Ze[e] = new mt(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Ze[e] = new mt(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Ze[e] = new mt(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Ze[e] = new mt(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Ze[e] = new mt(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Ze[e] = new mt(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Ed = /[\-:]([a-z])/g;
function _d(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Ed, _d);
    Ze[t] = new mt(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Ed, _d);
    Ze[t] = new mt(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Ed, _d);
  Ze[t] = new mt(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Ze[e] = new mt(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Ze.xlinkHref = new mt(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1
);
["src", "href", "action", "formAction"].forEach(function (e) {
  Ze[e] = new mt(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function kd(e, t, n, r) {
  var o = Ze.hasOwnProperty(t) ? Ze[t] : null;
  (o !== null
    ? o.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (sx(t, n, o, r) && (n = null),
    r || o === null
      ? rx(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
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
var Wn = tx.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Pi = Symbol.for("react.element"),
  yo = Symbol.for("react.portal"),
  vo = Symbol.for("react.fragment"),
  Rd = Symbol.for("react.strict_mode"),
  tu = Symbol.for("react.profiler"),
  Mg = Symbol.for("react.provider"),
  Ig = Symbol.for("react.context"),
  Dd = Symbol.for("react.forward_ref"),
  nu = Symbol.for("react.suspense"),
  ru = Symbol.for("react.suspense_list"),
  Pd = Symbol.for("react.memo"),
  Jn = Symbol.for("react.lazy"),
  zg = Symbol.for("react.offscreen"),
  Vp = Symbol.iterator;
function hs(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Vp && e[Vp]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var je = Object.assign,
  cc;
function Ds(e) {
  if (cc === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      cc = (t && t[1]) || "";
    }
  return (
    `
` +
    cc +
    e
  );
}
var uc = !1;
function dc(e, t) {
  if (!e || uc) return "";
  uc = !0;
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
    (uc = !1), (Error.prepareStackTrace = n);
  }
  return (e = e ? e.displayName || e.name : "") ? Ds(e) : "";
}
function ix(e) {
  switch (e.tag) {
    case 5:
      return Ds(e.type);
    case 16:
      return Ds("Lazy");
    case 13:
      return Ds("Suspense");
    case 19:
      return Ds("SuspenseList");
    case 0:
    case 2:
    case 15:
      return (e = dc(e.type, !1)), e;
    case 11:
      return (e = dc(e.type.render, !1)), e;
    case 1:
      return (e = dc(e.type, !0)), e;
    default:
      return "";
  }
}
function ou(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case vo:
      return "Fragment";
    case yo:
      return "Portal";
    case tu:
      return "Profiler";
    case Rd:
      return "StrictMode";
    case nu:
      return "Suspense";
    case ru:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Ig:
        return (e.displayName || "Context") + ".Consumer";
      case Mg:
        return (e._context.displayName || "Context") + ".Provider";
      case Dd:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Pd:
        return (
          (t = e.displayName || null), t !== null ? t : ou(e.type) || "Memo"
        );
      case Jn:
        (t = e._payload), (e = e._init);
        try {
          return ou(e(t));
        } catch {}
    }
  return null;
}
function lx(e) {
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
      return ou(t);
    case 8:
      return t === Rd ? "StrictMode" : "Mode";
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
function hr(e) {
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
function Bg(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function ax(e) {
  var t = Bg(e) ? "checked" : "value",
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
function Ti(e) {
  e._valueTracker || (e._valueTracker = ax(e));
}
function Vg(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = Bg(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function vl(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function su(e, t) {
  var n = t.checked;
  return je({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function Hp(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  (n = hr(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    });
}
function Hg(e, t) {
  (t = t.checked), t != null && kd(e, "checked", t, !1);
}
function iu(e, t) {
  Hg(e, t);
  var n = hr(t.value),
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
    ? lu(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && lu(e, t.type, hr(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked);
}
function Wp(e, t, n) {
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
function lu(e, t, n) {
  (t !== "number" || vl(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Ps = Array.isArray;
function To(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++)
      (o = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== o && (e[n].selected = o),
        o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + hr(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        (e[o].selected = !0), r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function au(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(H(91));
  return je({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function Up(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(H(92));
      if (Ps(n)) {
        if (1 < n.length) throw Error(H(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), (n = t);
  }
  e._wrapperState = { initialValue: hr(n) };
}
function Wg(e, t) {
  var n = hr(t.value),
    r = hr(t.defaultValue);
  n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r);
}
function Yp(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Ug(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function cu(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? Ug(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
    ? "http://www.w3.org/1999/xhtml"
    : e;
}
var Ni,
  Yg = (function (e) {
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
        Ni = Ni || document.createElement("div"),
          Ni.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = Ni.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function Hs(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Os = {
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
  cx = ["Webkit", "ms", "Moz", "O"];
Object.keys(Os).forEach(function (e) {
  cx.forEach(function (t) {
    (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Os[t] = Os[e]);
  });
});
function qg(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (Os.hasOwnProperty(e) && Os[e])
    ? ("" + t).trim()
    : t + "px";
}
function Kg(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        o = qg(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : (e[n] = o);
    }
}
var ux = je(
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
function uu(e, t) {
  if (t) {
    if (ux[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
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
function du(e, t) {
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
var fu = null;
function Td(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var pu = null,
  No = null,
  Oo = null;
function qp(e) {
  if ((e = hi(e))) {
    if (typeof pu != "function") throw Error(H(280));
    var t = e.stateNode;
    t && ((t = aa(t)), pu(e.stateNode, e.type, t));
  }
}
function Gg(e) {
  No ? (Oo ? Oo.push(e) : (Oo = [e])) : (No = e);
}
function Xg() {
  if (No) {
    var e = No,
      t = Oo;
    if (((Oo = No = null), qp(e), t)) for (e = 0; e < t.length; e++) qp(t[e]);
  }
}
function Qg(e, t) {
  return e(t);
}
function Jg() {}
var fc = !1;
function Zg(e, t, n) {
  if (fc) return e(t, n);
  fc = !0;
  try {
    return Qg(e, t, n);
  } finally {
    (fc = !1), (No !== null || Oo !== null) && (Jg(), Xg());
  }
}
function Ws(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = aa(n);
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
var mu = !1;
if (In)
  try {
    var gs = {};
    Object.defineProperty(gs, "passive", {
      get: function () {
        mu = !0;
      },
    }),
      window.addEventListener("test", gs, gs),
      window.removeEventListener("test", gs, gs);
  } catch {
    mu = !1;
  }
function dx(e, t, n, r, o, s, i, l, a) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (u) {
    this.onError(u);
  }
}
var js = !1,
  wl = null,
  xl = !1,
  hu = null,
  fx = {
    onError: function (e) {
      (js = !0), (wl = e);
    },
  };
function px(e, t, n, r, o, s, i, l, a) {
  (js = !1), (wl = null), dx.apply(fx, arguments);
}
function mx(e, t, n, r, o, s, i, l, a) {
  if ((px.apply(this, arguments), js)) {
    if (js) {
      var c = wl;
      (js = !1), (wl = null);
    } else throw Error(H(198));
    xl || ((xl = !0), (hu = c));
  }
}
function to(e) {
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
function ey(e) {
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
function Kp(e) {
  if (to(e) !== e) throw Error(H(188));
}
function hx(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = to(e)), t === null)) throw Error(H(188));
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
        if (s === n) return Kp(o), e;
        if (s === r) return Kp(o), t;
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
function ty(e) {
  return (e = hx(e)), e !== null ? ny(e) : null;
}
function ny(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = ny(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var ry = Lt.unstable_scheduleCallback,
  Gp = Lt.unstable_cancelCallback,
  gx = Lt.unstable_shouldYield,
  yx = Lt.unstable_requestPaint,
  ze = Lt.unstable_now,
  vx = Lt.unstable_getCurrentPriorityLevel,
  Nd = Lt.unstable_ImmediatePriority,
  oy = Lt.unstable_UserBlockingPriority,
  Sl = Lt.unstable_NormalPriority,
  wx = Lt.unstable_LowPriority,
  sy = Lt.unstable_IdlePriority,
  oa = null,
  Cn = null;
function xx(e) {
  if (Cn && typeof Cn.onCommitFiberRoot == "function")
    try {
      Cn.onCommitFiberRoot(oa, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var tn = Math.clz32 ? Math.clz32 : Cx,
  Sx = Math.log,
  bx = Math.LN2;
function Cx(e) {
  return (e >>>= 0), e === 0 ? 32 : (31 - ((Sx(e) / bx) | 0)) | 0;
}
var Oi = 64,
  ji = 4194304;
function Ts(e) {
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
function bl(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    o = e.suspendedLanes,
    s = e.pingedLanes,
    i = n & 268435455;
  if (i !== 0) {
    var l = i & ~o;
    l !== 0 ? (r = Ts(l)) : ((s &= i), s !== 0 && (r = Ts(s)));
  } else (i = n & ~o), i !== 0 ? (r = Ts(i)) : s !== 0 && (r = Ts(s));
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
      (n = 31 - tn(t)), (o = 1 << n), (r |= e[n]), (t &= ~o);
  return r;
}
function Ex(e, t) {
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
function _x(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      o = e.expirationTimes,
      s = e.pendingLanes;
    0 < s;

  ) {
    var i = 31 - tn(s),
      l = 1 << i,
      a = o[i];
    a === -1
      ? (!(l & n) || l & r) && (o[i] = Ex(l, t))
      : a <= t && (e.expiredLanes |= l),
      (s &= ~l);
  }
}
function gu(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function iy() {
  var e = Oi;
  return (Oi <<= 1), !(Oi & 4194240) && (Oi = 64), e;
}
function pc(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function pi(e, t, n) {
  (e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - tn(t)),
    (e[t] = n);
}
function kx(e, t) {
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
    var o = 31 - tn(n),
      s = 1 << o;
    (t[o] = 0), (r[o] = -1), (e[o] = -1), (n &= ~s);
  }
}
function Od(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - tn(n),
      o = 1 << r;
    (o & t) | (e[r] & t) && (e[r] |= t), (n &= ~o);
  }
}
var ye = 0;
function ly(e) {
  return (e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1;
}
var ay,
  jd,
  cy,
  uy,
  dy,
  yu = !1,
  $i = [],
  lr = null,
  ar = null,
  cr = null,
  Us = new Map(),
  Ys = new Map(),
  tr = [],
  Rx =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " "
    );
function Xp(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      lr = null;
      break;
    case "dragenter":
    case "dragleave":
      ar = null;
      break;
    case "mouseover":
    case "mouseout":
      cr = null;
      break;
    case "pointerover":
    case "pointerout":
      Us.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      Ys.delete(t.pointerId);
  }
}
function ys(e, t, n, r, o, s) {
  return e === null || e.nativeEvent !== s
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: s,
        targetContainers: [o],
      }),
      t !== null && ((t = hi(t)), t !== null && jd(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function Dx(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return (lr = ys(lr, e, t, n, r, o)), !0;
    case "dragenter":
      return (ar = ys(ar, e, t, n, r, o)), !0;
    case "mouseover":
      return (cr = ys(cr, e, t, n, r, o)), !0;
    case "pointerover":
      var s = o.pointerId;
      return Us.set(s, ys(Us.get(s) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return (
        (s = o.pointerId), Ys.set(s, ys(Ys.get(s) || null, e, t, n, r, o)), !0
      );
  }
  return !1;
}
function fy(e) {
  var t = jr(e.target);
  if (t !== null) {
    var n = to(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = ey(n)), t !== null)) {
          (e.blockedOn = t),
            dy(e.priority, function () {
              cy(n);
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
function rl(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = vu(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      (fu = r), n.target.dispatchEvent(r), (fu = null);
    } else return (t = hi(n)), t !== null && jd(t), (e.blockedOn = n), !1;
    t.shift();
  }
  return !0;
}
function Qp(e, t, n) {
  rl(e) && n.delete(t);
}
function Px() {
  (yu = !1),
    lr !== null && rl(lr) && (lr = null),
    ar !== null && rl(ar) && (ar = null),
    cr !== null && rl(cr) && (cr = null),
    Us.forEach(Qp),
    Ys.forEach(Qp);
}
function vs(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    yu ||
      ((yu = !0),
      Lt.unstable_scheduleCallback(Lt.unstable_NormalPriority, Px)));
}
function qs(e) {
  function t(o) {
    return vs(o, e);
  }
  if (0 < $i.length) {
    vs($i[0], e);
    for (var n = 1; n < $i.length; n++) {
      var r = $i[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    lr !== null && vs(lr, e),
      ar !== null && vs(ar, e),
      cr !== null && vs(cr, e),
      Us.forEach(t),
      Ys.forEach(t),
      n = 0;
    n < tr.length;
    n++
  )
    (r = tr[n]), r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < tr.length && ((n = tr[0]), n.blockedOn === null); )
    fy(n), n.blockedOn === null && tr.shift();
}
var jo = Wn.ReactCurrentBatchConfig,
  Cl = !0;
function Tx(e, t, n, r) {
  var o = ye,
    s = jo.transition;
  jo.transition = null;
  try {
    (ye = 1), $d(e, t, n, r);
  } finally {
    (ye = o), (jo.transition = s);
  }
}
function Nx(e, t, n, r) {
  var o = ye,
    s = jo.transition;
  jo.transition = null;
  try {
    (ye = 4), $d(e, t, n, r);
  } finally {
    (ye = o), (jo.transition = s);
  }
}
function $d(e, t, n, r) {
  if (Cl) {
    var o = vu(e, t, n, r);
    if (o === null) Cc(e, t, r, El, n), Xp(e, r);
    else if (Dx(o, e, t, n, r)) r.stopPropagation();
    else if ((Xp(e, r), t & 4 && -1 < Rx.indexOf(e))) {
      for (; o !== null; ) {
        var s = hi(o);
        if (
          (s !== null && ay(s),
          (s = vu(e, t, n, r)),
          s === null && Cc(e, t, r, El, n),
          s === o)
        )
          break;
        o = s;
      }
      o !== null && r.stopPropagation();
    } else Cc(e, t, r, null, n);
  }
}
var El = null;
function vu(e, t, n, r) {
  if (((El = null), (e = Td(r)), (e = jr(e)), e !== null))
    if (((t = to(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = ey(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return (El = e), null;
}
function py(e) {
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
      switch (vx()) {
        case Nd:
          return 1;
        case oy:
          return 4;
        case Sl:
        case wx:
          return 16;
        case sy:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var or = null,
  Ld = null,
  ol = null;
function my() {
  if (ol) return ol;
  var e,
    t = Ld,
    n = t.length,
    r,
    o = "value" in or ? or.value : or.textContent,
    s = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === o[s - r]; r++);
  return (ol = o.slice(e, 1 < r ? 1 - r : void 0));
}
function sl(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Li() {
  return !0;
}
function Jp() {
  return !1;
}
function Ft(e) {
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
        ? Li
        : Jp),
      (this.isPropagationStopped = Jp),
      this
    );
  }
  return (
    je(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = Li));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = Li));
      },
      persist: function () {},
      isPersistent: Li,
    }),
    t
  );
}
var es = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  Ad = Ft(es),
  mi = je({}, es, { view: 0, detail: 0 }),
  Ox = Ft(mi),
  mc,
  hc,
  ws,
  sa = je({}, mi, {
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
    getModifierState: Fd,
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
        : (e !== ws &&
            (ws && e.type === "mousemove"
              ? ((mc = e.screenX - ws.screenX), (hc = e.screenY - ws.screenY))
              : (hc = mc = 0),
            (ws = e)),
          mc);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : hc;
    },
  }),
  Zp = Ft(sa),
  jx = je({}, sa, { dataTransfer: 0 }),
  $x = Ft(jx),
  Lx = je({}, mi, { relatedTarget: 0 }),
  gc = Ft(Lx),
  Ax = je({}, es, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Fx = Ft(Ax),
  Mx = je({}, es, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Ix = Ft(Mx),
  zx = je({}, es, { data: 0 }),
  em = Ft(zx),
  Bx = {
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
  Vx = {
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
  Hx = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function Wx(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Hx[e]) ? !!t[e] : !1;
}
function Fd() {
  return Wx;
}
var Ux = je({}, mi, {
    key: function (e) {
      if (e.key) {
        var t = Bx[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = sl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
        ? Vx[e.keyCode] || "Unidentified"
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
    getModifierState: Fd,
    charCode: function (e) {
      return e.type === "keypress" ? sl(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? sl(e)
        : e.type === "keydown" || e.type === "keyup"
        ? e.keyCode
        : 0;
    },
  }),
  Yx = Ft(Ux),
  qx = je({}, sa, {
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
  tm = Ft(qx),
  Kx = je({}, mi, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: Fd,
  }),
  Gx = Ft(Kx),
  Xx = je({}, es, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Qx = Ft(Xx),
  Jx = je({}, sa, {
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
  Zx = Ft(Jx),
  eS = [9, 13, 27, 32],
  Md = In && "CompositionEvent" in window,
  $s = null;
In && "documentMode" in document && ($s = document.documentMode);
var tS = In && "TextEvent" in window && !$s,
  hy = In && (!Md || ($s && 8 < $s && 11 >= $s)),
  nm = " ",
  rm = !1;
function gy(e, t) {
  switch (e) {
    case "keyup":
      return eS.indexOf(t.keyCode) !== -1;
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
function yy(e) {
  return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
}
var wo = !1;
function nS(e, t) {
  switch (e) {
    case "compositionend":
      return yy(t);
    case "keypress":
      return t.which !== 32 ? null : ((rm = !0), nm);
    case "textInput":
      return (e = t.data), e === nm && rm ? null : e;
    default:
      return null;
  }
}
function rS(e, t) {
  if (wo)
    return e === "compositionend" || (!Md && gy(e, t))
      ? ((e = my()), (ol = Ld = or = null), (wo = !1), e)
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
      return hy && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var oS = {
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
function om(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!oS[e.type] : t === "textarea";
}
function vy(e, t, n, r) {
  Gg(r),
    (t = _l(t, "onChange")),
    0 < t.length &&
      ((n = new Ad("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t }));
}
var Ls = null,
  Ks = null;
function sS(e) {
  Py(e, 0);
}
function ia(e) {
  var t = bo(e);
  if (Vg(t)) return e;
}
function iS(e, t) {
  if (e === "change") return t;
}
var wy = !1;
if (In) {
  var yc;
  if (In) {
    var vc = "oninput" in document;
    if (!vc) {
      var sm = document.createElement("div");
      sm.setAttribute("oninput", "return;"),
        (vc = typeof sm.oninput == "function");
    }
    yc = vc;
  } else yc = !1;
  wy = yc && (!document.documentMode || 9 < document.documentMode);
}
function im() {
  Ls && (Ls.detachEvent("onpropertychange", xy), (Ks = Ls = null));
}
function xy(e) {
  if (e.propertyName === "value" && ia(Ks)) {
    var t = [];
    vy(t, Ks, e, Td(e)), Zg(sS, t);
  }
}
function lS(e, t, n) {
  e === "focusin"
    ? (im(), (Ls = t), (Ks = n), Ls.attachEvent("onpropertychange", xy))
    : e === "focusout" && im();
}
function aS(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return ia(Ks);
}
function cS(e, t) {
  if (e === "click") return ia(t);
}
function uS(e, t) {
  if (e === "input" || e === "change") return ia(t);
}
function dS(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var on = typeof Object.is == "function" ? Object.is : dS;
function Gs(e, t) {
  if (on(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!eu.call(t, o) || !on(e[o], t[o])) return !1;
  }
  return !0;
}
function lm(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function am(e, t) {
  var n = lm(e);
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
    n = lm(n);
  }
}
function Sy(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
      ? !1
      : t && t.nodeType === 3
      ? Sy(e, t.parentNode)
      : "contains" in e
      ? e.contains(t)
      : e.compareDocumentPosition
      ? !!(e.compareDocumentPosition(t) & 16)
      : !1
    : !1;
}
function by() {
  for (var e = window, t = vl(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = vl(e.document);
  }
  return t;
}
function Id(e) {
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
function fS(e) {
  var t = by(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    Sy(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && Id(n)) {
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
          (o = am(n, s));
        var i = am(n, r);
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
var pS = In && "documentMode" in document && 11 >= document.documentMode,
  xo = null,
  wu = null,
  As = null,
  xu = !1;
function cm(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  xu ||
    xo == null ||
    xo !== vl(r) ||
    ((r = xo),
    "selectionStart" in r && Id(r)
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
    (As && Gs(As, r)) ||
      ((As = r),
      (r = _l(wu, "onSelect")),
      0 < r.length &&
        ((t = new Ad("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = xo))));
}
function Ai(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var So = {
    animationend: Ai("Animation", "AnimationEnd"),
    animationiteration: Ai("Animation", "AnimationIteration"),
    animationstart: Ai("Animation", "AnimationStart"),
    transitionend: Ai("Transition", "TransitionEnd"),
  },
  wc = {},
  Cy = {};
In &&
  ((Cy = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete So.animationend.animation,
    delete So.animationiteration.animation,
    delete So.animationstart.animation),
  "TransitionEvent" in window || delete So.transitionend.transition);
function la(e) {
  if (wc[e]) return wc[e];
  if (!So[e]) return e;
  var t = So[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Cy) return (wc[e] = t[n]);
  return e;
}
var Ey = la("animationend"),
  _y = la("animationiteration"),
  ky = la("animationstart"),
  Ry = la("transitionend"),
  Dy = new Map(),
  um =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
function wr(e, t) {
  Dy.set(e, t), eo(t, [e]);
}
for (var xc = 0; xc < um.length; xc++) {
  var Sc = um[xc],
    mS = Sc.toLowerCase(),
    hS = Sc[0].toUpperCase() + Sc.slice(1);
  wr(mS, "on" + hS);
}
wr(Ey, "onAnimationEnd");
wr(_y, "onAnimationIteration");
wr(ky, "onAnimationStart");
wr("dblclick", "onDoubleClick");
wr("focusin", "onFocus");
wr("focusout", "onBlur");
wr(Ry, "onTransitionEnd");
zo("onMouseEnter", ["mouseout", "mouseover"]);
zo("onMouseLeave", ["mouseout", "mouseover"]);
zo("onPointerEnter", ["pointerout", "pointerover"]);
zo("onPointerLeave", ["pointerout", "pointerover"]);
eo(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
eo(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
eo("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
eo(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
eo(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
eo(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var Ns =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ),
  gS = new Set("cancel close invalid load scroll toggle".split(" ").concat(Ns));
function dm(e, t, n) {
  var r = e.type || "unknown-event";
  (e.currentTarget = n), mx(r, t, void 0, e), (e.currentTarget = null);
}
function Py(e, t) {
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
          dm(o, l, c), (s = a);
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
          dm(o, l, c), (s = a);
        }
    }
  }
  if (xl) throw ((e = hu), (xl = !1), (hu = null), e);
}
function Ee(e, t) {
  var n = t[_u];
  n === void 0 && (n = t[_u] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Ty(t, e, 2, !1), n.add(r));
}
function bc(e, t, n) {
  var r = 0;
  t && (r |= 4), Ty(n, e, r, t);
}
var Fi = "_reactListening" + Math.random().toString(36).slice(2);
function Xs(e) {
  if (!e[Fi]) {
    (e[Fi] = !0),
      Fg.forEach(function (n) {
        n !== "selectionchange" && (gS.has(n) || bc(n, !1, e), bc(n, !0, e));
      });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Fi] || ((t[Fi] = !0), bc("selectionchange", !1, t));
  }
}
function Ty(e, t, n, r) {
  switch (py(t)) {
    case 1:
      var o = Tx;
      break;
    case 4:
      o = Nx;
      break;
    default:
      o = $d;
  }
  (n = o.bind(null, t, n, e)),
    (o = void 0),
    !mu ||
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
function Cc(e, t, n, r, o) {
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
          if (((i = jr(l)), i === null)) return;
          if (((a = i.tag), a === 5 || a === 6)) {
            r = s = i;
            continue e;
          }
          l = l.parentNode;
        }
      }
      r = r.return;
    }
  Zg(function () {
    var c = s,
      u = Td(n),
      d = [];
    e: {
      var f = Dy.get(e);
      if (f !== void 0) {
        var p = Ad,
          m = e;
        switch (e) {
          case "keypress":
            if (sl(n) === 0) break e;
          case "keydown":
          case "keyup":
            p = Yx;
            break;
          case "focusin":
            (m = "focus"), (p = gc);
            break;
          case "focusout":
            (m = "blur"), (p = gc);
            break;
          case "beforeblur":
          case "afterblur":
            p = gc;
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
            p = Zp;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            p = $x;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            p = Gx;
            break;
          case Ey:
          case _y:
          case ky:
            p = Fx;
            break;
          case Ry:
            p = Qx;
            break;
          case "scroll":
            p = Ox;
            break;
          case "wheel":
            p = Zx;
            break;
          case "copy":
          case "cut":
          case "paste":
            p = Ix;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            p = tm;
        }
        var h = (t & 4) !== 0,
          S = !h && e === "scroll",
          v = h ? (f !== null ? f + "Capture" : null) : f;
        h = [];
        for (var w = c, y; w !== null; ) {
          y = w;
          var b = y.stateNode;
          if (
            (y.tag === 5 &&
              b !== null &&
              ((y = b),
              v !== null && ((b = Ws(w, v)), b != null && h.push(Qs(w, b, y)))),
            S)
          )
            break;
          w = w.return;
        }
        0 < h.length &&
          ((f = new p(f, m, null, n, u)), d.push({ event: f, listeners: h }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((f = e === "mouseover" || e === "pointerover"),
          (p = e === "mouseout" || e === "pointerout"),
          f &&
            n !== fu &&
            (m = n.relatedTarget || n.fromElement) &&
            (jr(m) || m[zn]))
        )
          break e;
        if (
          (p || f) &&
          ((f =
            u.window === u
              ? u
              : (f = u.ownerDocument)
              ? f.defaultView || f.parentWindow
              : window),
          p
            ? ((m = n.relatedTarget || n.toElement),
              (p = c),
              (m = m ? jr(m) : null),
              m !== null &&
                ((S = to(m)), m !== S || (m.tag !== 5 && m.tag !== 6)) &&
                (m = null))
            : ((p = null), (m = c)),
          p !== m)
        ) {
          if (
            ((h = Zp),
            (b = "onMouseLeave"),
            (v = "onMouseEnter"),
            (w = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((h = tm),
              (b = "onPointerLeave"),
              (v = "onPointerEnter"),
              (w = "pointer")),
            (S = p == null ? f : bo(p)),
            (y = m == null ? f : bo(m)),
            (f = new h(b, w + "leave", p, n, u)),
            (f.target = S),
            (f.relatedTarget = y),
            (b = null),
            jr(u) === c &&
              ((h = new h(v, w + "enter", m, n, u)),
              (h.target = y),
              (h.relatedTarget = S),
              (b = h)),
            (S = b),
            p && m)
          )
            t: {
              for (h = p, v = m, w = 0, y = h; y; y = uo(y)) w++;
              for (y = 0, b = v; b; b = uo(b)) y++;
              for (; 0 < w - y; ) (h = uo(h)), w--;
              for (; 0 < y - w; ) (v = uo(v)), y--;
              for (; w--; ) {
                if (h === v || (v !== null && h === v.alternate)) break t;
                (h = uo(h)), (v = uo(v));
              }
              h = null;
            }
          else h = null;
          p !== null && fm(d, f, p, h, !1),
            m !== null && S !== null && fm(d, S, m, h, !0);
        }
      }
      e: {
        if (
          ((f = c ? bo(c) : window),
          (p = f.nodeName && f.nodeName.toLowerCase()),
          p === "select" || (p === "input" && f.type === "file"))
        )
          var E = iS;
        else if (om(f))
          if (wy) E = uS;
          else {
            E = aS;
            var C = lS;
          }
        else
          (p = f.nodeName) &&
            p.toLowerCase() === "input" &&
            (f.type === "checkbox" || f.type === "radio") &&
            (E = cS);
        if (E && (E = E(e, c))) {
          vy(d, E, n, u);
          break e;
        }
        C && C(e, f, c),
          e === "focusout" &&
            (C = f._wrapperState) &&
            C.controlled &&
            f.type === "number" &&
            lu(f, "number", f.value);
      }
      switch (((C = c ? bo(c) : window), e)) {
        case "focusin":
          (om(C) || C.contentEditable === "true") &&
            ((xo = C), (wu = c), (As = null));
          break;
        case "focusout":
          As = wu = xo = null;
          break;
        case "mousedown":
          xu = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          (xu = !1), cm(d, n, u);
          break;
        case "selectionchange":
          if (pS) break;
        case "keydown":
        case "keyup":
          cm(d, n, u);
      }
      var R;
      if (Md)
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
        wo
          ? gy(e, n) && (D = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (D = "onCompositionStart");
      D &&
        (hy &&
          n.locale !== "ko" &&
          (wo || D !== "onCompositionStart"
            ? D === "onCompositionEnd" && wo && (R = my())
            : ((or = u),
              (Ld = "value" in or ? or.value : or.textContent),
              (wo = !0))),
        (C = _l(c, D)),
        0 < C.length &&
          ((D = new em(D, e, null, n, u)),
          d.push({ event: D, listeners: C }),
          R ? (D.data = R) : ((R = yy(n)), R !== null && (D.data = R)))),
        (R = tS ? nS(e, n) : rS(e, n)) &&
          ((c = _l(c, "onBeforeInput")),
          0 < c.length &&
            ((u = new em("onBeforeInput", "beforeinput", null, n, u)),
            d.push({ event: u, listeners: c }),
            (u.data = R)));
    }
    Py(d, t);
  });
}
function Qs(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function _l(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e,
      s = o.stateNode;
    o.tag === 5 &&
      s !== null &&
      ((o = s),
      (s = Ws(e, n)),
      s != null && r.unshift(Qs(e, s, o)),
      (s = Ws(e, t)),
      s != null && r.push(Qs(e, s, o))),
      (e = e.return);
  }
  return r;
}
function uo(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function fm(e, t, n, r, o) {
  for (var s = t._reactName, i = []; n !== null && n !== r; ) {
    var l = n,
      a = l.alternate,
      c = l.stateNode;
    if (a !== null && a === r) break;
    l.tag === 5 &&
      c !== null &&
      ((l = c),
      o
        ? ((a = Ws(n, s)), a != null && i.unshift(Qs(n, a, l)))
        : o || ((a = Ws(n, s)), a != null && i.push(Qs(n, a, l)))),
      (n = n.return);
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var yS = /\r\n?/g,
  vS = /\u0000|\uFFFD/g;
function pm(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      yS,
      `
`
    )
    .replace(vS, "");
}
function Mi(e, t, n) {
  if (((t = pm(t)), pm(e) !== t && n)) throw Error(H(425));
}
function kl() {}
var Su = null,
  bu = null;
function Cu(e, t) {
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
var Eu = typeof setTimeout == "function" ? setTimeout : void 0,
  wS = typeof clearTimeout == "function" ? clearTimeout : void 0,
  mm = typeof Promise == "function" ? Promise : void 0,
  xS =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof mm < "u"
      ? function (e) {
          return mm.resolve(null).then(e).catch(SS);
        }
      : Eu;
function SS(e) {
  setTimeout(function () {
    throw e;
  });
}
function Ec(e, t) {
  var n = t,
    r = 0;
  do {
    var o = n.nextSibling;
    if ((e.removeChild(n), o && o.nodeType === 8))
      if (((n = o.data), n === "/$")) {
        if (r === 0) {
          e.removeChild(o), qs(t);
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = o;
  } while (n);
  qs(t);
}
function ur(e) {
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
function hm(e) {
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
var ts = Math.random().toString(36).slice(2),
  Sn = "__reactFiber$" + ts,
  Js = "__reactProps$" + ts,
  zn = "__reactContainer$" + ts,
  _u = "__reactEvents$" + ts,
  bS = "__reactListeners$" + ts,
  CS = "__reactHandles$" + ts;
function jr(e) {
  var t = e[Sn];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[zn] || n[Sn])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = hm(e); e !== null; ) {
          if ((n = e[Sn])) return n;
          e = hm(e);
        }
      return t;
    }
    (e = n), (n = e.parentNode);
  }
  return null;
}
function hi(e) {
  return (
    (e = e[Sn] || e[zn]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function bo(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(H(33));
}
function aa(e) {
  return e[Js] || null;
}
var ku = [],
  Co = -1;
function xr(e) {
  return { current: e };
}
function _e(e) {
  0 > Co || ((e.current = ku[Co]), (ku[Co] = null), Co--);
}
function be(e, t) {
  Co++, (ku[Co] = e.current), (e.current = t);
}
var gr = {},
  st = xr(gr),
  Et = xr(!1),
  Vr = gr;
function Bo(e, t) {
  var n = e.type.contextTypes;
  if (!n) return gr;
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
function _t(e) {
  return (e = e.childContextTypes), e != null;
}
function Rl() {
  _e(Et), _e(st);
}
function gm(e, t, n) {
  if (st.current !== gr) throw Error(H(168));
  be(st, t), be(Et, n);
}
function Ny(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(H(108, lx(e) || "Unknown", o));
  return je({}, n, r);
}
function Dl(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || gr),
    (Vr = st.current),
    be(st, e),
    be(Et, Et.current),
    !0
  );
}
function ym(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(H(169));
  n
    ? ((e = Ny(e, t, Vr)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      _e(Et),
      _e(st),
      be(st, e))
    : _e(Et),
    be(Et, n);
}
var $n = null,
  ca = !1,
  _c = !1;
function Oy(e) {
  $n === null ? ($n = [e]) : $n.push(e);
}
function ES(e) {
  (ca = !0), Oy(e);
}
function Sr() {
  if (!_c && $n !== null) {
    _c = !0;
    var e = 0,
      t = ye;
    try {
      var n = $n;
      for (ye = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ($n = null), (ca = !1);
    } catch (o) {
      throw ($n !== null && ($n = $n.slice(e + 1)), ry(Nd, Sr), o);
    } finally {
      (ye = t), (_c = !1);
    }
  }
  return null;
}
var Eo = [],
  _o = 0,
  Pl = null,
  Tl = 0,
  zt = [],
  Bt = 0,
  Hr = null,
  Ln = 1,
  An = "";
function Pr(e, t) {
  (Eo[_o++] = Tl), (Eo[_o++] = Pl), (Pl = e), (Tl = t);
}
function jy(e, t, n) {
  (zt[Bt++] = Ln), (zt[Bt++] = An), (zt[Bt++] = Hr), (Hr = e);
  var r = Ln;
  e = An;
  var o = 32 - tn(r) - 1;
  (r &= ~(1 << o)), (n += 1);
  var s = 32 - tn(t) + o;
  if (30 < s) {
    var i = o - (o % 5);
    (s = (r & ((1 << i) - 1)).toString(32)),
      (r >>= i),
      (o -= i),
      (Ln = (1 << (32 - tn(t) + o)) | (n << o) | r),
      (An = s + e);
  } else (Ln = (1 << s) | (n << o) | r), (An = e);
}
function zd(e) {
  e.return !== null && (Pr(e, 1), jy(e, 1, 0));
}
function Bd(e) {
  for (; e === Pl; )
    (Pl = Eo[--_o]), (Eo[_o] = null), (Tl = Eo[--_o]), (Eo[_o] = null);
  for (; e === Hr; )
    (Hr = zt[--Bt]),
      (zt[Bt] = null),
      (An = zt[--Bt]),
      (zt[Bt] = null),
      (Ln = zt[--Bt]),
      (zt[Bt] = null);
}
var jt = null,
  Ot = null,
  De = !1,
  Zt = null;
function $y(e, t) {
  var n = Vt(5, null, null, 0);
  (n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n);
}
function vm(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (jt = e), (Ot = ur(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (jt = e), (Ot = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = Hr !== null ? { id: Ln, overflow: An } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = Vt(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (jt = e),
            (Ot = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function Ru(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Du(e) {
  if (De) {
    var t = Ot;
    if (t) {
      var n = t;
      if (!vm(e, t)) {
        if (Ru(e)) throw Error(H(418));
        t = ur(n.nextSibling);
        var r = jt;
        t && vm(e, t)
          ? $y(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (De = !1), (jt = e));
      }
    } else {
      if (Ru(e)) throw Error(H(418));
      (e.flags = (e.flags & -4097) | 2), (De = !1), (jt = e);
    }
  }
}
function wm(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  jt = e;
}
function Ii(e) {
  if (e !== jt) return !1;
  if (!De) return wm(e), (De = !0), !1;
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !Cu(e.type, e.memoizedProps))),
    t && (t = Ot))
  ) {
    if (Ru(e)) throw (Ly(), Error(H(418)));
    for (; t; ) $y(e, t), (t = ur(t.nextSibling));
  }
  if ((wm(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(H(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              Ot = ur(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      Ot = null;
    }
  } else Ot = jt ? ur(e.stateNode.nextSibling) : null;
  return !0;
}
function Ly() {
  for (var e = Ot; e; ) e = ur(e.nextSibling);
}
function Vo() {
  (Ot = jt = null), (De = !1);
}
function Vd(e) {
  Zt === null ? (Zt = [e]) : Zt.push(e);
}
var _S = Wn.ReactCurrentBatchConfig;
function xs(e, t, n) {
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
function zi(e, t) {
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
function xm(e) {
  var t = e._init;
  return t(e._payload);
}
function Ay(e) {
  function t(v, w) {
    if (e) {
      var y = v.deletions;
      y === null ? ((v.deletions = [w]), (v.flags |= 16)) : y.push(w);
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
    return (v = mr(v, w)), (v.index = 0), (v.sibling = null), v;
  }
  function s(v, w, y) {
    return (
      (v.index = y),
      e
        ? ((y = v.alternate),
          y !== null
            ? ((y = y.index), y < w ? ((v.flags |= 2), w) : y)
            : ((v.flags |= 2), w))
        : ((v.flags |= 1048576), w)
    );
  }
  function i(v) {
    return e && v.alternate === null && (v.flags |= 2), v;
  }
  function l(v, w, y, b) {
    return w === null || w.tag !== 6
      ? ((w = Oc(y, v.mode, b)), (w.return = v), w)
      : ((w = o(w, y)), (w.return = v), w);
  }
  function a(v, w, y, b) {
    var E = y.type;
    return E === vo
      ? u(v, w, y.props.children, b, y.key)
      : w !== null &&
        (w.elementType === E ||
          (typeof E == "object" &&
            E !== null &&
            E.$$typeof === Jn &&
            xm(E) === w.type))
      ? ((b = o(w, y.props)), (b.ref = xs(v, w, y)), (b.return = v), b)
      : ((b = fl(y.type, y.key, y.props, null, v.mode, b)),
        (b.ref = xs(v, w, y)),
        (b.return = v),
        b);
  }
  function c(v, w, y, b) {
    return w === null ||
      w.tag !== 4 ||
      w.stateNode.containerInfo !== y.containerInfo ||
      w.stateNode.implementation !== y.implementation
      ? ((w = jc(y, v.mode, b)), (w.return = v), w)
      : ((w = o(w, y.children || [])), (w.return = v), w);
  }
  function u(v, w, y, b, E) {
    return w === null || w.tag !== 7
      ? ((w = Mr(y, v.mode, b, E)), (w.return = v), w)
      : ((w = o(w, y)), (w.return = v), w);
  }
  function d(v, w, y) {
    if ((typeof w == "string" && w !== "") || typeof w == "number")
      return (w = Oc("" + w, v.mode, y)), (w.return = v), w;
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Pi:
          return (
            (y = fl(w.type, w.key, w.props, null, v.mode, y)),
            (y.ref = xs(v, null, w)),
            (y.return = v),
            y
          );
        case yo:
          return (w = jc(w, v.mode, y)), (w.return = v), w;
        case Jn:
          var b = w._init;
          return d(v, b(w._payload), y);
      }
      if (Ps(w) || hs(w))
        return (w = Mr(w, v.mode, y, null)), (w.return = v), w;
      zi(v, w);
    }
    return null;
  }
  function f(v, w, y, b) {
    var E = w !== null ? w.key : null;
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return E !== null ? null : l(v, w, "" + y, b);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Pi:
          return y.key === E ? a(v, w, y, b) : null;
        case yo:
          return y.key === E ? c(v, w, y, b) : null;
        case Jn:
          return (E = y._init), f(v, w, E(y._payload), b);
      }
      if (Ps(y) || hs(y)) return E !== null ? null : u(v, w, y, b, null);
      zi(v, y);
    }
    return null;
  }
  function p(v, w, y, b, E) {
    if ((typeof b == "string" && b !== "") || typeof b == "number")
      return (v = v.get(y) || null), l(w, v, "" + b, E);
    if (typeof b == "object" && b !== null) {
      switch (b.$$typeof) {
        case Pi:
          return (v = v.get(b.key === null ? y : b.key) || null), a(w, v, b, E);
        case yo:
          return (v = v.get(b.key === null ? y : b.key) || null), c(w, v, b, E);
        case Jn:
          var C = b._init;
          return p(v, w, y, C(b._payload), E);
      }
      if (Ps(b) || hs(b)) return (v = v.get(y) || null), u(w, v, b, E, null);
      zi(w, b);
    }
    return null;
  }
  function m(v, w, y, b) {
    for (
      var E = null, C = null, R = w, D = (w = 0), L = null;
      R !== null && D < y.length;
      D++
    ) {
      R.index > D ? ((L = R), (R = null)) : (L = R.sibling);
      var N = f(v, R, y[D], b);
      if (N === null) {
        R === null && (R = L);
        break;
      }
      e && R && N.alternate === null && t(v, R),
        (w = s(N, w, D)),
        C === null ? (E = N) : (C.sibling = N),
        (C = N),
        (R = L);
    }
    if (D === y.length) return n(v, R), De && Pr(v, D), E;
    if (R === null) {
      for (; D < y.length; D++)
        (R = d(v, y[D], b)),
          R !== null &&
            ((w = s(R, w, D)), C === null ? (E = R) : (C.sibling = R), (C = R));
      return De && Pr(v, D), E;
    }
    for (R = r(v, R); D < y.length; D++)
      (L = p(R, v, D, y[D], b)),
        L !== null &&
          (e && L.alternate !== null && R.delete(L.key === null ? D : L.key),
          (w = s(L, w, D)),
          C === null ? (E = L) : (C.sibling = L),
          (C = L));
    return (
      e &&
        R.forEach(function (M) {
          return t(v, M);
        }),
      De && Pr(v, D),
      E
    );
  }
  function h(v, w, y, b) {
    var E = hs(y);
    if (typeof E != "function") throw Error(H(150));
    if (((y = E.call(y)), y == null)) throw Error(H(151));
    for (
      var C = (E = null), R = w, D = (w = 0), L = null, N = y.next();
      R !== null && !N.done;
      D++, N = y.next()
    ) {
      R.index > D ? ((L = R), (R = null)) : (L = R.sibling);
      var M = f(v, R, N.value, b);
      if (M === null) {
        R === null && (R = L);
        break;
      }
      e && R && M.alternate === null && t(v, R),
        (w = s(M, w, D)),
        C === null ? (E = M) : (C.sibling = M),
        (C = M),
        (R = L);
    }
    if (N.done) return n(v, R), De && Pr(v, D), E;
    if (R === null) {
      for (; !N.done; D++, N = y.next())
        (N = d(v, N.value, b)),
          N !== null &&
            ((w = s(N, w, D)), C === null ? (E = N) : (C.sibling = N), (C = N));
      return De && Pr(v, D), E;
    }
    for (R = r(v, R); !N.done; D++, N = y.next())
      (N = p(R, v, D, N.value, b)),
        N !== null &&
          (e && N.alternate !== null && R.delete(N.key === null ? D : N.key),
          (w = s(N, w, D)),
          C === null ? (E = N) : (C.sibling = N),
          (C = N));
    return (
      e &&
        R.forEach(function (B) {
          return t(v, B);
        }),
      De && Pr(v, D),
      E
    );
  }
  function S(v, w, y, b) {
    if (
      (typeof y == "object" &&
        y !== null &&
        y.type === vo &&
        y.key === null &&
        (y = y.props.children),
      typeof y == "object" && y !== null)
    ) {
      switch (y.$$typeof) {
        case Pi:
          e: {
            for (var E = y.key, C = w; C !== null; ) {
              if (C.key === E) {
                if (((E = y.type), E === vo)) {
                  if (C.tag === 7) {
                    n(v, C.sibling),
                      (w = o(C, y.props.children)),
                      (w.return = v),
                      (v = w);
                    break e;
                  }
                } else if (
                  C.elementType === E ||
                  (typeof E == "object" &&
                    E !== null &&
                    E.$$typeof === Jn &&
                    xm(E) === C.type)
                ) {
                  n(v, C.sibling),
                    (w = o(C, y.props)),
                    (w.ref = xs(v, C, y)),
                    (w.return = v),
                    (v = w);
                  break e;
                }
                n(v, C);
                break;
              } else t(v, C);
              C = C.sibling;
            }
            y.type === vo
              ? ((w = Mr(y.props.children, v.mode, b, y.key)),
                (w.return = v),
                (v = w))
              : ((b = fl(y.type, y.key, y.props, null, v.mode, b)),
                (b.ref = xs(v, w, y)),
                (b.return = v),
                (v = b));
          }
          return i(v);
        case yo:
          e: {
            for (C = y.key; w !== null; ) {
              if (w.key === C)
                if (
                  w.tag === 4 &&
                  w.stateNode.containerInfo === y.containerInfo &&
                  w.stateNode.implementation === y.implementation
                ) {
                  n(v, w.sibling),
                    (w = o(w, y.children || [])),
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
            (w = jc(y, v.mode, b)), (w.return = v), (v = w);
          }
          return i(v);
        case Jn:
          return (C = y._init), S(v, w, C(y._payload), b);
      }
      if (Ps(y)) return m(v, w, y, b);
      if (hs(y)) return h(v, w, y, b);
      zi(v, y);
    }
    return (typeof y == "string" && y !== "") || typeof y == "number"
      ? ((y = "" + y),
        w !== null && w.tag === 6
          ? (n(v, w.sibling), (w = o(w, y)), (w.return = v), (v = w))
          : (n(v, w), (w = Oc(y, v.mode, b)), (w.return = v), (v = w)),
        i(v))
      : n(v, w);
  }
  return S;
}
var Ho = Ay(!0),
  Fy = Ay(!1),
  Nl = xr(null),
  Ol = null,
  ko = null,
  Hd = null;
function Wd() {
  Hd = ko = Ol = null;
}
function Ud(e) {
  var t = Nl.current;
  _e(Nl), (e._currentValue = t);
}
function Pu(e, t, n) {
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
function $o(e, t) {
  (Ol = e),
    (Hd = ko = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (St = !0), (e.firstContext = null));
}
function Ut(e) {
  var t = e._currentValue;
  if (Hd !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), ko === null)) {
      if (Ol === null) throw Error(H(308));
      (ko = e), (Ol.dependencies = { lanes: 0, firstContext: e });
    } else ko = ko.next = e;
  return t;
}
var $r = null;
function Yd(e) {
  $r === null ? ($r = [e]) : $r.push(e);
}
function My(e, t, n, r) {
  var o = t.interleaved;
  return (
    o === null ? ((n.next = n), Yd(t)) : ((n.next = o.next), (o.next = n)),
    (t.interleaved = n),
    Bn(e, r)
  );
}
function Bn(e, t) {
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
var Zn = !1;
function qd(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Iy(e, t) {
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
function Fn(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function dr(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), pe & 2)) {
    var o = r.pending;
    return (
      o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
      (r.pending = t),
      Bn(e, n)
    );
  }
  return (
    (o = r.interleaved),
    o === null ? ((t.next = t), Yd(r)) : ((t.next = o.next), (o.next = t)),
    (r.interleaved = t),
    Bn(e, n)
  );
}
function il(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Od(e, n);
  }
}
function Sm(e, t) {
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
function jl(e, t, n, r) {
  var o = e.updateQueue;
  Zn = !1;
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
        p = l.eventTime;
      if ((r & f) === f) {
        u !== null &&
          (u = u.next =
            {
              eventTime: p,
              lane: 0,
              tag: l.tag,
              payload: l.payload,
              callback: l.callback,
              next: null,
            });
        e: {
          var m = e,
            h = l;
          switch (((f = t), (p = n), h.tag)) {
            case 1:
              if (((m = h.payload), typeof m == "function")) {
                d = m.call(p, d, f);
                break e;
              }
              d = m;
              break e;
            case 3:
              m.flags = (m.flags & -65537) | 128;
            case 0:
              if (
                ((m = h.payload),
                (f = typeof m == "function" ? m.call(p, d, f) : m),
                f == null)
              )
                break e;
              d = je({}, d, f);
              break e;
            case 2:
              Zn = !0;
          }
        }
        l.callback !== null &&
          l.lane !== 0 &&
          ((e.flags |= 64),
          (f = o.effects),
          f === null ? (o.effects = [l]) : f.push(l));
      } else
        (p = {
          eventTime: p,
          lane: f,
          tag: l.tag,
          payload: l.payload,
          callback: l.callback,
          next: null,
        }),
          u === null ? ((c = u = p), (a = d)) : (u = u.next = p),
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
    (Ur |= i), (e.lanes = i), (e.memoizedState = d);
  }
}
function bm(e, t, n) {
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
var gi = {},
  En = xr(gi),
  Zs = xr(gi),
  ei = xr(gi);
function Lr(e) {
  if (e === gi) throw Error(H(174));
  return e;
}
function Kd(e, t) {
  switch ((be(ei, t), be(Zs, e), be(En, gi), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : cu(null, "");
      break;
    default:
      (e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = cu(t, e));
  }
  _e(En), be(En, t);
}
function Wo() {
  _e(En), _e(Zs), _e(ei);
}
function zy(e) {
  Lr(ei.current);
  var t = Lr(En.current),
    n = cu(t, e.type);
  t !== n && (be(Zs, e), be(En, n));
}
function Gd(e) {
  Zs.current === e && (_e(En), _e(Zs));
}
var Ne = xr(0);
function $l(e) {
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
var kc = [];
function Xd() {
  for (var e = 0; e < kc.length; e++)
    kc[e]._workInProgressVersionPrimary = null;
  kc.length = 0;
}
var ll = Wn.ReactCurrentDispatcher,
  Rc = Wn.ReactCurrentBatchConfig,
  Wr = 0,
  Oe = null,
  He = null,
  Ye = null,
  Ll = !1,
  Fs = !1,
  ti = 0,
  kS = 0;
function et() {
  throw Error(H(321));
}
function Qd(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!on(e[n], t[n])) return !1;
  return !0;
}
function Jd(e, t, n, r, o, s) {
  if (
    ((Wr = s),
    (Oe = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (ll.current = e === null || e.memoizedState === null ? TS : NS),
    (e = n(r, o)),
    Fs)
  ) {
    s = 0;
    do {
      if (((Fs = !1), (ti = 0), 25 <= s)) throw Error(H(301));
      (s += 1),
        (Ye = He = null),
        (t.updateQueue = null),
        (ll.current = OS),
        (e = n(r, o));
    } while (Fs);
  }
  if (
    ((ll.current = Al),
    (t = He !== null && He.next !== null),
    (Wr = 0),
    (Ye = He = Oe = null),
    (Ll = !1),
    t)
  )
    throw Error(H(300));
  return e;
}
function Zd() {
  var e = ti !== 0;
  return (ti = 0), e;
}
function vn() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return Ye === null ? (Oe.memoizedState = Ye = e) : (Ye = Ye.next = e), Ye;
}
function Yt() {
  if (He === null) {
    var e = Oe.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = He.next;
  var t = Ye === null ? Oe.memoizedState : Ye.next;
  if (t !== null) (Ye = t), (He = e);
  else {
    if (e === null) throw Error(H(310));
    (He = e),
      (e = {
        memoizedState: He.memoizedState,
        baseState: He.baseState,
        baseQueue: He.baseQueue,
        queue: He.queue,
        next: null,
      }),
      Ye === null ? (Oe.memoizedState = Ye = e) : (Ye = Ye.next = e);
  }
  return Ye;
}
function ni(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Dc(e) {
  var t = Yt(),
    n = t.queue;
  if (n === null) throw Error(H(311));
  n.lastRenderedReducer = e;
  var r = He,
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
      if ((Wr & u) === u)
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
          (Oe.lanes |= u),
          (Ur |= u);
      }
      c = c.next;
    } while (c !== null && c !== s);
    a === null ? (i = r) : (a.next = l),
      on(r, t.memoizedState) || (St = !0),
      (t.memoizedState = r),
      (t.baseState = i),
      (t.baseQueue = a),
      (n.lastRenderedState = r);
  }
  if (((e = n.interleaved), e !== null)) {
    o = e;
    do (s = o.lane), (Oe.lanes |= s), (Ur |= s), (o = o.next);
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Pc(e) {
  var t = Yt(),
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
    on(s, t.memoizedState) || (St = !0),
      (t.memoizedState = s),
      t.baseQueue === null && (t.baseState = s),
      (n.lastRenderedState = s);
  }
  return [s, r];
}
function By() {}
function Vy(e, t) {
  var n = Oe,
    r = Yt(),
    o = t(),
    s = !on(r.memoizedState, o);
  if (
    (s && ((r.memoizedState = o), (St = !0)),
    (r = r.queue),
    ef(Uy.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || s || (Ye !== null && Ye.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      ri(9, Wy.bind(null, n, r, o, t), void 0, null),
      qe === null)
    )
      throw Error(H(349));
    Wr & 30 || Hy(n, t, o);
  }
  return o;
}
function Hy(e, t, n) {
  (e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = Oe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (Oe.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e));
}
function Wy(e, t, n, r) {
  (t.value = n), (t.getSnapshot = r), Yy(t) && qy(e);
}
function Uy(e, t, n) {
  return n(function () {
    Yy(t) && qy(e);
  });
}
function Yy(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !on(e, n);
  } catch {
    return !0;
  }
}
function qy(e) {
  var t = Bn(e, 1);
  t !== null && nn(t, e, 1, -1);
}
function Cm(e) {
  var t = vn();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ni,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = PS.bind(null, Oe, e)),
    [t.memoizedState, e]
  );
}
function ri(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = Oe.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (Oe.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function Ky() {
  return Yt().memoizedState;
}
function al(e, t, n, r) {
  var o = vn();
  (Oe.flags |= e),
    (o.memoizedState = ri(1 | t, n, void 0, r === void 0 ? null : r));
}
function ua(e, t, n, r) {
  var o = Yt();
  r = r === void 0 ? null : r;
  var s = void 0;
  if (He !== null) {
    var i = He.memoizedState;
    if (((s = i.destroy), r !== null && Qd(r, i.deps))) {
      o.memoizedState = ri(t, n, s, r);
      return;
    }
  }
  (Oe.flags |= e), (o.memoizedState = ri(1 | t, n, s, r));
}
function Em(e, t) {
  return al(8390656, 8, e, t);
}
function ef(e, t) {
  return ua(2048, 8, e, t);
}
function Gy(e, t) {
  return ua(4, 2, e, t);
}
function Xy(e, t) {
  return ua(4, 4, e, t);
}
function Qy(e, t) {
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
function Jy(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null), ua(4, 4, Qy.bind(null, t, e), n)
  );
}
function tf() {}
function Zy(e, t) {
  var n = Yt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Qd(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function ev(e, t) {
  var n = Yt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && Qd(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function tv(e, t, n) {
  return Wr & 21
    ? (on(n, t) || ((n = iy()), (Oe.lanes |= n), (Ur |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (St = !0)), (e.memoizedState = n));
}
function RS(e, t) {
  var n = ye;
  (ye = n !== 0 && 4 > n ? n : 4), e(!0);
  var r = Rc.transition;
  Rc.transition = {};
  try {
    e(!1), t();
  } finally {
    (ye = n), (Rc.transition = r);
  }
}
function nv() {
  return Yt().memoizedState;
}
function DS(e, t, n) {
  var r = pr(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    rv(e))
  )
    ov(t, n);
  else if (((n = My(e, t, n, r)), n !== null)) {
    var o = dt();
    nn(n, e, r, o), sv(n, t, r);
  }
}
function PS(e, t, n) {
  var r = pr(e),
    o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (rv(e)) ov(t, o);
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
        if (((o.hasEagerState = !0), (o.eagerState = l), on(l, i))) {
          var a = t.interleaved;
          a === null
            ? ((o.next = o), Yd(t))
            : ((o.next = a.next), (a.next = o)),
            (t.interleaved = o);
          return;
        }
      } catch {
      } finally {
      }
    (n = My(e, t, o, r)),
      n !== null && ((o = dt()), nn(n, e, r, o), sv(n, t, r));
  }
}
function rv(e) {
  var t = e.alternate;
  return e === Oe || (t !== null && t === Oe);
}
function ov(e, t) {
  Fs = Ll = !0;
  var n = e.pending;
  n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t);
}
function sv(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Od(e, n);
  }
}
var Al = {
    readContext: Ut,
    useCallback: et,
    useContext: et,
    useEffect: et,
    useImperativeHandle: et,
    useInsertionEffect: et,
    useLayoutEffect: et,
    useMemo: et,
    useReducer: et,
    useRef: et,
    useState: et,
    useDebugValue: et,
    useDeferredValue: et,
    useTransition: et,
    useMutableSource: et,
    useSyncExternalStore: et,
    useId: et,
    unstable_isNewReconciler: !1,
  },
  TS = {
    readContext: Ut,
    useCallback: function (e, t) {
      return (vn().memoizedState = [e, t === void 0 ? null : t]), e;
    },
    useContext: Ut,
    useEffect: Em,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        al(4194308, 4, Qy.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return al(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return al(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = vn();
      return (
        (t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e
      );
    },
    useReducer: function (e, t, n) {
      var r = vn();
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
        (e = e.dispatch = DS.bind(null, Oe, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = vn();
      return (e = { current: e }), (t.memoizedState = e);
    },
    useState: Cm,
    useDebugValue: tf,
    useDeferredValue: function (e) {
      return (vn().memoizedState = e);
    },
    useTransition: function () {
      var e = Cm(!1),
        t = e[0];
      return (e = RS.bind(null, e[1])), (vn().memoizedState = e), [t, e];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = Oe,
        o = vn();
      if (De) {
        if (n === void 0) throw Error(H(407));
        n = n();
      } else {
        if (((n = t()), qe === null)) throw Error(H(349));
        Wr & 30 || Hy(r, t, n);
      }
      o.memoizedState = n;
      var s = { value: n, getSnapshot: t };
      return (
        (o.queue = s),
        Em(Uy.bind(null, r, s, e), [e]),
        (r.flags |= 2048),
        ri(9, Wy.bind(null, r, s, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = vn(),
        t = qe.identifierPrefix;
      if (De) {
        var n = An,
          r = Ln;
        (n = (r & ~(1 << (32 - tn(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = ti++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":");
      } else (n = kS++), (t = ":" + t + "r" + n.toString(32) + ":");
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  NS = {
    readContext: Ut,
    useCallback: Zy,
    useContext: Ut,
    useEffect: ef,
    useImperativeHandle: Jy,
    useInsertionEffect: Gy,
    useLayoutEffect: Xy,
    useMemo: ev,
    useReducer: Dc,
    useRef: Ky,
    useState: function () {
      return Dc(ni);
    },
    useDebugValue: tf,
    useDeferredValue: function (e) {
      var t = Yt();
      return tv(t, He.memoizedState, e);
    },
    useTransition: function () {
      var e = Dc(ni)[0],
        t = Yt().memoizedState;
      return [e, t];
    },
    useMutableSource: By,
    useSyncExternalStore: Vy,
    useId: nv,
    unstable_isNewReconciler: !1,
  },
  OS = {
    readContext: Ut,
    useCallback: Zy,
    useContext: Ut,
    useEffect: ef,
    useImperativeHandle: Jy,
    useInsertionEffect: Gy,
    useLayoutEffect: Xy,
    useMemo: ev,
    useReducer: Pc,
    useRef: Ky,
    useState: function () {
      return Pc(ni);
    },
    useDebugValue: tf,
    useDeferredValue: function (e) {
      var t = Yt();
      return He === null ? (t.memoizedState = e) : tv(t, He.memoizedState, e);
    },
    useTransition: function () {
      var e = Pc(ni)[0],
        t = Yt().memoizedState;
      return [e, t];
    },
    useMutableSource: By,
    useSyncExternalStore: Vy,
    useId: nv,
    unstable_isNewReconciler: !1,
  };
function Qt(e, t) {
  if (e && e.defaultProps) {
    (t = je({}, t)), (e = e.defaultProps);
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function Tu(e, t, n, r) {
  (t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : je({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n);
}
var da = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? to(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = dt(),
      o = pr(e),
      s = Fn(r, o);
    (s.payload = t),
      n != null && (s.callback = n),
      (t = dr(e, s, o)),
      t !== null && (nn(t, e, o, r), il(t, e, o));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = dt(),
      o = pr(e),
      s = Fn(r, o);
    (s.tag = 1),
      (s.payload = t),
      n != null && (s.callback = n),
      (t = dr(e, s, o)),
      t !== null && (nn(t, e, o, r), il(t, e, o));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = dt(),
      r = pr(e),
      o = Fn(n, r);
    (o.tag = 2),
      t != null && (o.callback = t),
      (t = dr(e, o, r)),
      t !== null && (nn(t, e, r, n), il(t, e, r));
  },
};
function _m(e, t, n, r, o, s, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, s, i)
      : t.prototype && t.prototype.isPureReactComponent
      ? !Gs(n, r) || !Gs(o, s)
      : !0
  );
}
function iv(e, t, n) {
  var r = !1,
    o = gr,
    s = t.contextType;
  return (
    typeof s == "object" && s !== null
      ? (s = Ut(s))
      : ((o = _t(t) ? Vr : st.current),
        (r = t.contextTypes),
        (s = (r = r != null) ? Bo(e, o) : gr)),
    (t = new t(n, s)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = da),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = o),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    t
  );
}
function km(e, t, n, r) {
  (e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && da.enqueueReplaceState(t, t.state, null);
}
function Nu(e, t, n, r) {
  var o = e.stateNode;
  (o.props = n), (o.state = e.memoizedState), (o.refs = {}), qd(e);
  var s = t.contextType;
  typeof s == "object" && s !== null
    ? (o.context = Ut(s))
    : ((s = _t(t) ? Vr : st.current), (o.context = Bo(e, s))),
    (o.state = e.memoizedState),
    (s = t.getDerivedStateFromProps),
    typeof s == "function" && (Tu(e, t, s, n), (o.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof o.getSnapshotBeforeUpdate == "function" ||
      (typeof o.UNSAFE_componentWillMount != "function" &&
        typeof o.componentWillMount != "function") ||
      ((t = o.state),
      typeof o.componentWillMount == "function" && o.componentWillMount(),
      typeof o.UNSAFE_componentWillMount == "function" &&
        o.UNSAFE_componentWillMount(),
      t !== o.state && da.enqueueReplaceState(o, o.state, null),
      jl(e, n, o, r),
      (o.state = e.memoizedState)),
    typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function Uo(e, t) {
  try {
    var n = "",
      r = t;
    do (n += ix(r)), (r = r.return);
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
function Tc(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Ou(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var jS = typeof WeakMap == "function" ? WeakMap : Map;
function lv(e, t, n) {
  (n = Fn(-1, n)), (n.tag = 3), (n.payload = { element: null });
  var r = t.value;
  return (
    (n.callback = function () {
      Ml || ((Ml = !0), (Vu = r)), Ou(e, t);
    }),
    n
  );
}
function av(e, t, n) {
  (n = Fn(-1, n)), (n.tag = 3);
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    (n.payload = function () {
      return r(o);
    }),
      (n.callback = function () {
        Ou(e, t);
      });
  }
  var s = e.stateNode;
  return (
    s !== null &&
      typeof s.componentDidCatch == "function" &&
      (n.callback = function () {
        Ou(e, t),
          typeof r != "function" &&
            (fr === null ? (fr = new Set([this])) : fr.add(this));
        var i = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: i !== null ? i : "",
        });
      }),
    n
  );
}
function Rm(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new jS();
    var o = new Set();
    r.set(t, o);
  } else (o = r.get(t)), o === void 0 && ((o = new Set()), r.set(t, o));
  o.has(n) || (o.add(n), (e = qS.bind(null, e, t, n)), t.then(e, e));
}
function Dm(e) {
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
function Pm(e, t, n, r, o) {
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
              : ((t = Fn(-1, 1)), (t.tag = 2), dr(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var $S = Wn.ReactCurrentOwner,
  St = !1;
function ct(e, t, n, r) {
  t.child = e === null ? Fy(t, null, n, r) : Ho(t, e.child, n, r);
}
function Tm(e, t, n, r, o) {
  n = n.render;
  var s = t.ref;
  return (
    $o(t, o),
    (r = Jd(e, t, n, r, s, o)),
    (n = Zd()),
    e !== null && !St
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Vn(e, t, o))
      : (De && n && zd(t), (t.flags |= 1), ct(e, t, r, o), t.child)
  );
}
function Nm(e, t, n, r, o) {
  if (e === null) {
    var s = n.type;
    return typeof s == "function" &&
      !uf(s) &&
      s.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = s), cv(e, t, s, r, o))
      : ((e = fl(n.type, null, r, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((s = e.child), !(e.lanes & o))) {
    var i = s.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : Gs), n(i, r) && e.ref === t.ref)
    )
      return Vn(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = mr(s, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function cv(e, t, n, r, o) {
  if (e !== null) {
    var s = e.memoizedProps;
    if (Gs(s, r) && e.ref === t.ref)
      if (((St = !1), (t.pendingProps = r = s), (e.lanes & o) !== 0))
        e.flags & 131072 && (St = !0);
      else return (t.lanes = e.lanes), Vn(e, t, o);
  }
  return ju(e, t, n, r, o);
}
function uv(e, t, n) {
  var r = t.pendingProps,
    o = r.children,
    s = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        be(Do, Nt),
        (Nt |= n);
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
          be(Do, Nt),
          (Nt |= e),
          null
        );
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = s !== null ? s.baseLanes : n),
        be(Do, Nt),
        (Nt |= r);
    }
  else
    s !== null ? ((r = s.baseLanes | n), (t.memoizedState = null)) : (r = n),
      be(Do, Nt),
      (Nt |= r);
  return ct(e, t, o, n), t.child;
}
function dv(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function ju(e, t, n, r, o) {
  var s = _t(n) ? Vr : st.current;
  return (
    (s = Bo(t, s)),
    $o(t, o),
    (n = Jd(e, t, n, r, s, o)),
    (r = Zd()),
    e !== null && !St
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Vn(e, t, o))
      : (De && r && zd(t), (t.flags |= 1), ct(e, t, n, o), t.child)
  );
}
function Om(e, t, n, r, o) {
  if (_t(n)) {
    var s = !0;
    Dl(t);
  } else s = !1;
  if (($o(t, o), t.stateNode === null))
    cl(e, t), iv(t, n, r), Nu(t, n, r, o), (r = !0);
  else if (e === null) {
    var i = t.stateNode,
      l = t.memoizedProps;
    i.props = l;
    var a = i.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = Ut(c))
      : ((c = _t(n) ? Vr : st.current), (c = Bo(t, c)));
    var u = n.getDerivedStateFromProps,
      d =
        typeof u == "function" ||
        typeof i.getSnapshotBeforeUpdate == "function";
    d ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== r || a !== c) && km(t, i, r, c)),
      (Zn = !1);
    var f = t.memoizedState;
    (i.state = f),
      jl(t, r, i, o),
      (a = t.memoizedState),
      l !== r || f !== a || Et.current || Zn
        ? (typeof u == "function" && (Tu(t, n, u, r), (a = t.memoizedState)),
          (l = Zn || _m(t, n, l, r, f, a, c))
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
      Iy(e, t),
      (l = t.memoizedProps),
      (c = t.type === t.elementType ? l : Qt(t.type, l)),
      (i.props = c),
      (d = t.pendingProps),
      (f = i.context),
      (a = n.contextType),
      typeof a == "object" && a !== null
        ? (a = Ut(a))
        : ((a = _t(n) ? Vr : st.current), (a = Bo(t, a)));
    var p = n.getDerivedStateFromProps;
    (u =
      typeof p == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function") ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== d || f !== a) && km(t, i, r, a)),
      (Zn = !1),
      (f = t.memoizedState),
      (i.state = f),
      jl(t, r, i, o);
    var m = t.memoizedState;
    l !== d || f !== m || Et.current || Zn
      ? (typeof p == "function" && (Tu(t, n, p, r), (m = t.memoizedState)),
        (c = Zn || _m(t, n, c, r, f, m, a) || !1)
          ? (u ||
              (typeof i.UNSAFE_componentWillUpdate != "function" &&
                typeof i.componentWillUpdate != "function") ||
              (typeof i.componentWillUpdate == "function" &&
                i.componentWillUpdate(r, m, a),
              typeof i.UNSAFE_componentWillUpdate == "function" &&
                i.UNSAFE_componentWillUpdate(r, m, a)),
            typeof i.componentDidUpdate == "function" && (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof i.componentDidUpdate != "function" ||
              (l === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate != "function" ||
              (l === e.memoizedProps && f === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = m)),
        (i.props = r),
        (i.state = m),
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
  return $u(e, t, n, r, s, o);
}
function $u(e, t, n, r, o, s) {
  dv(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return o && ym(t, n, !1), Vn(e, t, s);
  (r = t.stateNode), ($S.current = t);
  var l =
    i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && i
      ? ((t.child = Ho(t, e.child, null, s)), (t.child = Ho(t, null, l, s)))
      : ct(e, t, l, s),
    (t.memoizedState = r.state),
    o && ym(t, n, !0),
    t.child
  );
}
function fv(e) {
  var t = e.stateNode;
  t.pendingContext
    ? gm(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && gm(e, t.context, !1),
    Kd(e, t.containerInfo);
}
function jm(e, t, n, r, o) {
  return Vo(), Vd(o), (t.flags |= 256), ct(e, t, n, r), t.child;
}
var Lu = { dehydrated: null, treeContext: null, retryLane: 0 };
function Au(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function pv(e, t, n) {
  var r = t.pendingProps,
    o = Ne.current,
    s = !1,
    i = (t.flags & 128) !== 0,
    l;
  if (
    ((l = i) ||
      (l = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
    l
      ? ((s = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (o |= 1),
    be(Ne, o & 1),
    e === null)
  )
    return (
      Du(t),
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
                : (s = ma(i, r, 0, null)),
              (e = Mr(e, r, n, null)),
              (s.return = t),
              (e.return = t),
              (s.sibling = e),
              (t.child = s),
              (t.child.memoizedState = Au(n)),
              (t.memoizedState = Lu),
              e)
            : nf(t, i))
    );
  if (((o = e.memoizedState), o !== null && ((l = o.dehydrated), l !== null)))
    return LS(e, t, i, r, l, o, n);
  if (s) {
    (s = r.fallback), (i = t.mode), (o = e.child), (l = o.sibling);
    var a = { mode: "hidden", children: r.children };
    return (
      !(i & 1) && t.child !== o
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = a),
          (t.deletions = null))
        : ((r = mr(o, a)), (r.subtreeFlags = o.subtreeFlags & 14680064)),
      l !== null ? (s = mr(l, s)) : ((s = Mr(s, i, n, null)), (s.flags |= 2)),
      (s.return = t),
      (r.return = t),
      (r.sibling = s),
      (t.child = r),
      (r = s),
      (s = t.child),
      (i = e.child.memoizedState),
      (i =
        i === null
          ? Au(n)
          : {
              baseLanes: i.baseLanes | n,
              cachePool: null,
              transitions: i.transitions,
            }),
      (s.memoizedState = i),
      (s.childLanes = e.childLanes & ~n),
      (t.memoizedState = Lu),
      r
    );
  }
  return (
    (s = e.child),
    (e = s.sibling),
    (r = mr(s, { mode: "visible", children: r.children })),
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
function nf(e, t) {
  return (
    (t = ma({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Bi(e, t, n, r) {
  return (
    r !== null && Vd(r),
    Ho(t, e.child, null, n),
    (e = nf(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function LS(e, t, n, r, o, s, i) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Tc(Error(H(422)))), Bi(e, t, i, r))
      : t.memoizedState !== null
      ? ((t.child = e.child), (t.flags |= 128), null)
      : ((s = r.fallback),
        (o = t.mode),
        (r = ma({ mode: "visible", children: r.children }, o, 0, null)),
        (s = Mr(s, o, i, null)),
        (s.flags |= 2),
        (r.return = t),
        (s.return = t),
        (r.sibling = s),
        (t.child = r),
        t.mode & 1 && Ho(t, e.child, null, i),
        (t.child.memoizedState = Au(i)),
        (t.memoizedState = Lu),
        s);
  if (!(t.mode & 1)) return Bi(e, t, i, null);
  if (o.data === "$!") {
    if (((r = o.nextSibling && o.nextSibling.dataset), r)) var l = r.dgst;
    return (r = l), (s = Error(H(419))), (r = Tc(s, r, void 0)), Bi(e, t, i, r);
  }
  if (((l = (i & e.childLanes) !== 0), St || l)) {
    if (((r = qe), r !== null)) {
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
          ((s.retryLane = o), Bn(e, o), nn(r, e, o, -1));
    }
    return cf(), (r = Tc(Error(H(421)))), Bi(e, t, i, r);
  }
  return o.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = KS.bind(null, e)),
      (o._reactRetry = t),
      null)
    : ((e = s.treeContext),
      (Ot = ur(o.nextSibling)),
      (jt = t),
      (De = !0),
      (Zt = null),
      e !== null &&
        ((zt[Bt++] = Ln),
        (zt[Bt++] = An),
        (zt[Bt++] = Hr),
        (Ln = e.id),
        (An = e.overflow),
        (Hr = t)),
      (t = nf(t, r.children)),
      (t.flags |= 4096),
      t);
}
function $m(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Pu(e.return, t, n);
}
function Nc(e, t, n, r, o) {
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
function mv(e, t, n) {
  var r = t.pendingProps,
    o = r.revealOrder,
    s = r.tail;
  if ((ct(e, t, r.children, n), (r = Ne.current), r & 2))
    (r = (r & 1) | 2), (t.flags |= 128);
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && $m(e, n, t);
        else if (e.tag === 19) $m(e, n, t);
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
  if ((be(Ne, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (o) {
      case "forwards":
        for (n = t.child, o = null; n !== null; )
          (e = n.alternate),
            e !== null && $l(e) === null && (o = n),
            (n = n.sibling);
        (n = o),
          n === null
            ? ((o = t.child), (t.child = null))
            : ((o = n.sibling), (n.sibling = null)),
          Nc(t, !1, o, n, s);
        break;
      case "backwards":
        for (n = null, o = t.child, t.child = null; o !== null; ) {
          if (((e = o.alternate), e !== null && $l(e) === null)) {
            t.child = o;
            break;
          }
          (e = o.sibling), (o.sibling = n), (n = o), (o = e);
        }
        Nc(t, !0, n, null, s);
        break;
      case "together":
        Nc(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function cl(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Vn(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (Ur |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(H(153));
  if (t.child !== null) {
    for (
      e = t.child, n = mr(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;

    )
      (e = e.sibling), (n = n.sibling = mr(e, e.pendingProps)), (n.return = t);
    n.sibling = null;
  }
  return t.child;
}
function AS(e, t, n) {
  switch (t.tag) {
    case 3:
      fv(t), Vo();
      break;
    case 5:
      zy(t);
      break;
    case 1:
      _t(t.type) && Dl(t);
      break;
    case 4:
      Kd(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        o = t.memoizedProps.value;
      be(Nl, r._currentValue), (r._currentValue = o);
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (be(Ne, Ne.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
          ? pv(e, t, n)
          : (be(Ne, Ne.current & 1),
            (e = Vn(e, t, n)),
            e !== null ? e.sibling : null);
      be(Ne, Ne.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return mv(e, t, n);
        t.flags |= 128;
      }
      if (
        ((o = t.memoizedState),
        o !== null &&
          ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
        be(Ne, Ne.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return (t.lanes = 0), uv(e, t, n);
  }
  return Vn(e, t, n);
}
var hv, Fu, gv, yv;
hv = function (e, t) {
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
Fu = function () {};
gv = function (e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    (e = t.stateNode), Lr(En.current);
    var s = null;
    switch (n) {
      case "input":
        (o = su(e, o)), (r = su(e, r)), (s = []);
        break;
      case "select":
        (o = je({}, o, { value: void 0 })),
          (r = je({}, r, { value: void 0 })),
          (s = []);
        break;
      case "textarea":
        (o = au(e, o)), (r = au(e, r)), (s = []);
        break;
      default:
        typeof o.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = kl);
    }
    uu(n, r);
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
            (Vs.hasOwnProperty(c)
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
              (Vs.hasOwnProperty(c)
                ? (a != null && c === "onScroll" && Ee("scroll", e),
                  s || l === a || (s = []))
                : (s = s || []).push(c, a));
    }
    n && (s = s || []).push("style", n);
    var c = s;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
yv = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Ss(e, t) {
  if (!De)
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
function tt(e) {
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
function FS(e, t, n) {
  var r = t.pendingProps;
  switch ((Bd(t), t.tag)) {
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
      return tt(t), null;
    case 1:
      return _t(t.type) && Rl(), tt(t), null;
    case 3:
      return (
        (r = t.stateNode),
        Wo(),
        _e(Et),
        _e(st),
        Xd(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (Ii(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), Zt !== null && (Uu(Zt), (Zt = null)))),
        Fu(e, t),
        tt(t),
        null
      );
    case 5:
      Gd(t);
      var o = Lr(ei.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        gv(e, t, n, r, o),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(H(166));
          return tt(t), null;
        }
        if (((e = Lr(En.current)), Ii(t))) {
          (r = t.stateNode), (n = t.type);
          var s = t.memoizedProps;
          switch (((r[Sn] = t), (r[Js] = s), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              Ee("cancel", r), Ee("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              Ee("load", r);
              break;
            case "video":
            case "audio":
              for (o = 0; o < Ns.length; o++) Ee(Ns[o], r);
              break;
            case "source":
              Ee("error", r);
              break;
            case "img":
            case "image":
            case "link":
              Ee("error", r), Ee("load", r);
              break;
            case "details":
              Ee("toggle", r);
              break;
            case "input":
              Hp(r, s), Ee("invalid", r);
              break;
            case "select":
              (r._wrapperState = { wasMultiple: !!s.multiple }),
                Ee("invalid", r);
              break;
            case "textarea":
              Up(r, s), Ee("invalid", r);
          }
          uu(n, s), (o = null);
          for (var i in s)
            if (s.hasOwnProperty(i)) {
              var l = s[i];
              i === "children"
                ? typeof l == "string"
                  ? r.textContent !== l &&
                    (s.suppressHydrationWarning !== !0 &&
                      Mi(r.textContent, l, e),
                    (o = ["children", l]))
                  : typeof l == "number" &&
                    r.textContent !== "" + l &&
                    (s.suppressHydrationWarning !== !0 &&
                      Mi(r.textContent, l, e),
                    (o = ["children", "" + l]))
                : Vs.hasOwnProperty(i) &&
                  l != null &&
                  i === "onScroll" &&
                  Ee("scroll", r);
            }
          switch (n) {
            case "input":
              Ti(r), Wp(r, s, !0);
              break;
            case "textarea":
              Ti(r), Yp(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof s.onClick == "function" && (r.onclick = kl);
          }
          (r = o), (t.updateQueue = r), r !== null && (t.flags |= 4);
        } else {
          (i = o.nodeType === 9 ? o : o.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = Ug(n)),
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
            (e[Sn] = t),
            (e[Js] = r),
            hv(e, t, !1, !1),
            (t.stateNode = e);
          e: {
            switch (((i = du(n, r)), n)) {
              case "dialog":
                Ee("cancel", e), Ee("close", e), (o = r);
                break;
              case "iframe":
              case "object":
              case "embed":
                Ee("load", e), (o = r);
                break;
              case "video":
              case "audio":
                for (o = 0; o < Ns.length; o++) Ee(Ns[o], e);
                o = r;
                break;
              case "source":
                Ee("error", e), (o = r);
                break;
              case "img":
              case "image":
              case "link":
                Ee("error", e), Ee("load", e), (o = r);
                break;
              case "details":
                Ee("toggle", e), (o = r);
                break;
              case "input":
                Hp(e, r), (o = su(e, r)), Ee("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                (e._wrapperState = { wasMultiple: !!r.multiple }),
                  (o = je({}, r, { value: void 0 })),
                  Ee("invalid", e);
                break;
              case "textarea":
                Up(e, r), (o = au(e, r)), Ee("invalid", e);
                break;
              default:
                o = r;
            }
            uu(n, o), (l = o);
            for (s in l)
              if (l.hasOwnProperty(s)) {
                var a = l[s];
                s === "style"
                  ? Kg(e, a)
                  : s === "dangerouslySetInnerHTML"
                  ? ((a = a ? a.__html : void 0), a != null && Yg(e, a))
                  : s === "children"
                  ? typeof a == "string"
                    ? (n !== "textarea" || a !== "") && Hs(e, a)
                    : typeof a == "number" && Hs(e, "" + a)
                  : s !== "suppressContentEditableWarning" &&
                    s !== "suppressHydrationWarning" &&
                    s !== "autoFocus" &&
                    (Vs.hasOwnProperty(s)
                      ? a != null && s === "onScroll" && Ee("scroll", e)
                      : a != null && kd(e, s, a, i));
              }
            switch (n) {
              case "input":
                Ti(e), Wp(e, r, !1);
                break;
              case "textarea":
                Ti(e), Yp(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + hr(r.value));
                break;
              case "select":
                (e.multiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? To(e, !!r.multiple, s, !1)
                    : r.defaultValue != null &&
                      To(e, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = kl);
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
      return tt(t), null;
    case 6:
      if (e && t.stateNode != null) yv(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(H(166));
        if (((n = Lr(ei.current)), Lr(En.current), Ii(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[Sn] = t),
            (s = r.nodeValue !== n) && ((e = jt), e !== null))
          )
            switch (e.tag) {
              case 3:
                Mi(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Mi(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          s && (t.flags |= 4);
        } else
          (r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[Sn] = t),
            (t.stateNode = r);
      }
      return tt(t), null;
    case 13:
      if (
        (_e(Ne),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (De && Ot !== null && t.mode & 1 && !(t.flags & 128))
          Ly(), Vo(), (t.flags |= 98560), (s = !1);
        else if (((s = Ii(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!s) throw Error(H(318));
            if (
              ((s = t.memoizedState),
              (s = s !== null ? s.dehydrated : null),
              !s)
            )
              throw Error(H(317));
            s[Sn] = t;
          } else
            Vo(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4);
          tt(t), (s = !1);
        } else Zt !== null && (Uu(Zt), (Zt = null)), (s = !0);
        if (!s) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || Ne.current & 1 ? We === 0 && (We = 3) : cf())),
          t.updateQueue !== null && (t.flags |= 4),
          tt(t),
          null);
    case 4:
      return (
        Wo(), Fu(e, t), e === null && Xs(t.stateNode.containerInfo), tt(t), null
      );
    case 10:
      return Ud(t.type._context), tt(t), null;
    case 17:
      return _t(t.type) && Rl(), tt(t), null;
    case 19:
      if ((_e(Ne), (s = t.memoizedState), s === null)) return tt(t), null;
      if (((r = (t.flags & 128) !== 0), (i = s.rendering), i === null))
        if (r) Ss(s, !1);
        else {
          if (We !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((i = $l(e)), i !== null)) {
                for (
                  t.flags |= 128,
                    Ss(s, !1),
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
                return be(Ne, (Ne.current & 1) | 2), t.child;
              }
              e = e.sibling;
            }
          s.tail !== null &&
            ze() > Yo &&
            ((t.flags |= 128), (r = !0), Ss(s, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = $l(i)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              Ss(s, !0),
              s.tail === null && s.tailMode === "hidden" && !i.alternate && !De)
            )
              return tt(t), null;
          } else
            2 * ze() - s.renderingStartTime > Yo &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), Ss(s, !1), (t.lanes = 4194304));
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
          (s.renderingStartTime = ze()),
          (t.sibling = null),
          (n = Ne.current),
          be(Ne, r ? (n & 1) | 2 : n & 1),
          t)
        : (tt(t), null);
    case 22:
    case 23:
      return (
        af(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Nt & 1073741824 && (tt(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : tt(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(H(156, t.tag));
}
function MS(e, t) {
  switch ((Bd(t), t.tag)) {
    case 1:
      return (
        _t(t.type) && Rl(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        Wo(),
        _e(Et),
        _e(st),
        Xd(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return Gd(t), null;
    case 13:
      if (
        (_e(Ne), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(H(340));
        Vo();
      }
      return (
        (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return _e(Ne), null;
    case 4:
      return Wo(), null;
    case 10:
      return Ud(t.type._context), null;
    case 22:
    case 23:
      return af(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var Vi = !1,
  nt = !1,
  IS = typeof WeakSet == "function" ? WeakSet : Set,
  K = null;
function Ro(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        Fe(e, t, r);
      }
    else n.current = null;
}
function Mu(e, t, n) {
  try {
    n();
  } catch (r) {
    Fe(e, t, r);
  }
}
var Lm = !1;
function zS(e, t) {
  if (((Su = Cl), (e = by()), Id(e))) {
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
              var p;
              d !== n || (o !== 0 && d.nodeType !== 3) || (l = i + o),
                d !== s || (r !== 0 && d.nodeType !== 3) || (a = i + r),
                d.nodeType === 3 && (i += d.nodeValue.length),
                (p = d.firstChild) !== null;

            )
              (f = d), (d = p);
            for (;;) {
              if (d === e) break t;
              if (
                (f === n && ++c === o && (l = i),
                f === s && ++u === r && (a = i),
                (p = d.nextSibling) !== null)
              )
                break;
              (d = f), (f = d.parentNode);
            }
            d = p;
          }
          n = l === -1 || a === -1 ? null : { start: l, end: a };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (bu = { focusedElem: e, selectionRange: n }, Cl = !1, K = t; K !== null; )
    if (((t = K), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      (e.return = t), (K = e);
    else
      for (; K !== null; ) {
        t = K;
        try {
          var m = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (m !== null) {
                  var h = m.memoizedProps,
                    S = m.memoizedState,
                    v = t.stateNode,
                    w = v.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? h : Qt(t.type, h),
                      S
                    );
                  v.__reactInternalSnapshotBeforeUpdate = w;
                }
                break;
              case 3:
                var y = t.stateNode.containerInfo;
                y.nodeType === 1
                  ? (y.textContent = "")
                  : y.nodeType === 9 &&
                    y.documentElement &&
                    y.removeChild(y.documentElement);
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
          Fe(t, t.return, b);
        }
        if (((e = t.sibling), e !== null)) {
          (e.return = t.return), (K = e);
          break;
        }
        K = t.return;
      }
  return (m = Lm), (Lm = !1), m;
}
function Ms(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var o = (r = r.next);
    do {
      if ((o.tag & e) === e) {
        var s = o.destroy;
        (o.destroy = void 0), s !== void 0 && Mu(t, n, s);
      }
      o = o.next;
    } while (o !== r);
  }
}
function fa(e, t) {
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
function Iu(e) {
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
function vv(e) {
  var t = e.alternate;
  t !== null && ((e.alternate = null), vv(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[Sn], delete t[Js], delete t[_u], delete t[bS], delete t[CS])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null);
}
function wv(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Am(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || wv(e.return)) return null;
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
function zu(e, t, n) {
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
          n != null || t.onclick !== null || (t.onclick = kl));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (zu(e, t, n), e = e.sibling; e !== null; ) zu(e, t, n), (e = e.sibling);
}
function Bu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Bu(e, t, n), e = e.sibling; e !== null; ) Bu(e, t, n), (e = e.sibling);
}
var Qe = null,
  Jt = !1;
function Xn(e, t, n) {
  for (n = n.child; n !== null; ) xv(e, t, n), (n = n.sibling);
}
function xv(e, t, n) {
  if (Cn && typeof Cn.onCommitFiberUnmount == "function")
    try {
      Cn.onCommitFiberUnmount(oa, n);
    } catch {}
  switch (n.tag) {
    case 5:
      nt || Ro(n, t);
    case 6:
      var r = Qe,
        o = Jt;
      (Qe = null),
        Xn(e, t, n),
        (Qe = r),
        (Jt = o),
        Qe !== null &&
          (Jt
            ? ((e = Qe),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : Qe.removeChild(n.stateNode));
      break;
    case 18:
      Qe !== null &&
        (Jt
          ? ((e = Qe),
            (n = n.stateNode),
            e.nodeType === 8
              ? Ec(e.parentNode, n)
              : e.nodeType === 1 && Ec(e, n),
            qs(e))
          : Ec(Qe, n.stateNode));
      break;
    case 4:
      (r = Qe),
        (o = Jt),
        (Qe = n.stateNode.containerInfo),
        (Jt = !0),
        Xn(e, t, n),
        (Qe = r),
        (Jt = o);
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !nt &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        o = r = r.next;
        do {
          var s = o,
            i = s.destroy;
          (s = s.tag),
            i !== void 0 && (s & 2 || s & 4) && Mu(n, t, i),
            (o = o.next);
        } while (o !== r);
      }
      Xn(e, t, n);
      break;
    case 1:
      if (
        !nt &&
        (Ro(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          (r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount();
        } catch (l) {
          Fe(n, t, l);
        }
      Xn(e, t, n);
      break;
    case 21:
      Xn(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((nt = (r = nt) || n.memoizedState !== null), Xn(e, t, n), (nt = r))
        : Xn(e, t, n);
      break;
    default:
      Xn(e, t, n);
  }
}
function Fm(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new IS()),
      t.forEach(function (r) {
        var o = GS.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(o, o));
      });
  }
}
function Xt(e, t) {
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
              (Qe = l.stateNode), (Jt = !1);
              break e;
            case 3:
              (Qe = l.stateNode.containerInfo), (Jt = !0);
              break e;
            case 4:
              (Qe = l.stateNode.containerInfo), (Jt = !0);
              break e;
          }
          l = l.return;
        }
        if (Qe === null) throw Error(H(160));
        xv(s, i, o), (Qe = null), (Jt = !1);
        var a = o.alternate;
        a !== null && (a.return = null), (o.return = null);
      } catch (c) {
        Fe(o, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) Sv(t, e), (t = t.sibling);
}
function Sv(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Xt(t, e), gn(e), r & 4)) {
        try {
          Ms(3, e, e.return), fa(3, e);
        } catch (h) {
          Fe(e, e.return, h);
        }
        try {
          Ms(5, e, e.return);
        } catch (h) {
          Fe(e, e.return, h);
        }
      }
      break;
    case 1:
      Xt(t, e), gn(e), r & 512 && n !== null && Ro(n, n.return);
      break;
    case 5:
      if (
        (Xt(t, e),
        gn(e),
        r & 512 && n !== null && Ro(n, n.return),
        e.flags & 32)
      ) {
        var o = e.stateNode;
        try {
          Hs(o, "");
        } catch (h) {
          Fe(e, e.return, h);
        }
      }
      if (r & 4 && ((o = e.stateNode), o != null)) {
        var s = e.memoizedProps,
          i = n !== null ? n.memoizedProps : s,
          l = e.type,
          a = e.updateQueue;
        if (((e.updateQueue = null), a !== null))
          try {
            l === "input" && s.type === "radio" && s.name != null && Hg(o, s),
              du(l, i);
            var c = du(l, s);
            for (i = 0; i < a.length; i += 2) {
              var u = a[i],
                d = a[i + 1];
              u === "style"
                ? Kg(o, d)
                : u === "dangerouslySetInnerHTML"
                ? Yg(o, d)
                : u === "children"
                ? Hs(o, d)
                : kd(o, u, d, c);
            }
            switch (l) {
              case "input":
                iu(o, s);
                break;
              case "textarea":
                Wg(o, s);
                break;
              case "select":
                var f = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!s.multiple;
                var p = s.value;
                p != null
                  ? To(o, !!s.multiple, p, !1)
                  : f !== !!s.multiple &&
                    (s.defaultValue != null
                      ? To(o, !!s.multiple, s.defaultValue, !0)
                      : To(o, !!s.multiple, s.multiple ? [] : "", !1));
            }
            o[Js] = s;
          } catch (h) {
            Fe(e, e.return, h);
          }
      }
      break;
    case 6:
      if ((Xt(t, e), gn(e), r & 4)) {
        if (e.stateNode === null) throw Error(H(162));
        (o = e.stateNode), (s = e.memoizedProps);
        try {
          o.nodeValue = s;
        } catch (h) {
          Fe(e, e.return, h);
        }
      }
      break;
    case 3:
      if (
        (Xt(t, e), gn(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          qs(t.containerInfo);
        } catch (h) {
          Fe(e, e.return, h);
        }
      break;
    case 4:
      Xt(t, e), gn(e);
      break;
    case 13:
      Xt(t, e),
        gn(e),
        (o = e.child),
        o.flags & 8192 &&
          ((s = o.memoizedState !== null),
          (o.stateNode.isHidden = s),
          !s ||
            (o.alternate !== null && o.alternate.memoizedState !== null) ||
            (sf = ze())),
        r & 4 && Fm(e);
      break;
    case 22:
      if (
        ((u = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((nt = (c = nt) || u), Xt(t, e), (nt = c)) : Xt(t, e),
        gn(e),
        r & 8192)
      ) {
        if (
          ((c = e.memoizedState !== null),
          (e.stateNode.isHidden = c) && !u && e.mode & 1)
        )
          for (K = e, u = e.child; u !== null; ) {
            for (d = K = u; K !== null; ) {
              switch (((f = K), (p = f.child), f.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Ms(4, f, f.return);
                  break;
                case 1:
                  Ro(f, f.return);
                  var m = f.stateNode;
                  if (typeof m.componentWillUnmount == "function") {
                    (r = f), (n = f.return);
                    try {
                      (t = r),
                        (m.props = t.memoizedProps),
                        (m.state = t.memoizedState),
                        m.componentWillUnmount();
                    } catch (h) {
                      Fe(r, n, h);
                    }
                  }
                  break;
                case 5:
                  Ro(f, f.return);
                  break;
                case 22:
                  if (f.memoizedState !== null) {
                    Im(d);
                    continue;
                  }
              }
              p !== null ? ((p.return = f), (K = p)) : Im(d);
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
                      (l.style.display = qg("display", i)));
              } catch (h) {
                Fe(e, e.return, h);
              }
            }
          } else if (d.tag === 6) {
            if (u === null)
              try {
                d.stateNode.nodeValue = c ? "" : d.memoizedProps;
              } catch (h) {
                Fe(e, e.return, h);
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
      Xt(t, e), gn(e), r & 4 && Fm(e);
      break;
    case 21:
      break;
    default:
      Xt(t, e), gn(e);
  }
}
function gn(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (wv(n)) {
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
          r.flags & 32 && (Hs(o, ""), (r.flags &= -33));
          var s = Am(e);
          Bu(e, s, o);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo,
            l = Am(e);
          zu(e, l, i);
          break;
        default:
          throw Error(H(161));
      }
    } catch (a) {
      Fe(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function BS(e, t, n) {
  (K = e), bv(e);
}
function bv(e, t, n) {
  for (var r = (e.mode & 1) !== 0; K !== null; ) {
    var o = K,
      s = o.child;
    if (o.tag === 22 && r) {
      var i = o.memoizedState !== null || Vi;
      if (!i) {
        var l = o.alternate,
          a = (l !== null && l.memoizedState !== null) || nt;
        l = Vi;
        var c = nt;
        if (((Vi = i), (nt = a) && !c))
          for (K = o; K !== null; )
            (i = K),
              (a = i.child),
              i.tag === 22 && i.memoizedState !== null
                ? zm(o)
                : a !== null
                ? ((a.return = i), (K = a))
                : zm(o);
        for (; s !== null; ) (K = s), bv(s), (s = s.sibling);
        (K = o), (Vi = l), (nt = c);
      }
      Mm(e);
    } else
      o.subtreeFlags & 8772 && s !== null ? ((s.return = o), (K = s)) : Mm(e);
  }
}
function Mm(e) {
  for (; K !== null; ) {
    var t = K;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              nt || fa(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !nt)
                if (n === null) r.componentDidMount();
                else {
                  var o =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : Qt(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    o,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate
                  );
                }
              var s = t.updateQueue;
              s !== null && bm(t, s, r);
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
                bm(t, i, n);
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
                    d !== null && qs(d);
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
        nt || (t.flags & 512 && Iu(t));
      } catch (f) {
        Fe(t, t.return, f);
      }
    }
    if (t === e) {
      K = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      (n.return = t.return), (K = n);
      break;
    }
    K = t.return;
  }
}
function Im(e) {
  for (; K !== null; ) {
    var t = K;
    if (t === e) {
      K = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      (n.return = t.return), (K = n);
      break;
    }
    K = t.return;
  }
}
function zm(e) {
  for (; K !== null; ) {
    var t = K;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            fa(4, t);
          } catch (a) {
            Fe(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              Fe(t, o, a);
            }
          }
          var s = t.return;
          try {
            Iu(t);
          } catch (a) {
            Fe(t, s, a);
          }
          break;
        case 5:
          var i = t.return;
          try {
            Iu(t);
          } catch (a) {
            Fe(t, i, a);
          }
      }
    } catch (a) {
      Fe(t, t.return, a);
    }
    if (t === e) {
      K = null;
      break;
    }
    var l = t.sibling;
    if (l !== null) {
      (l.return = t.return), (K = l);
      break;
    }
    K = t.return;
  }
}
var VS = Math.ceil,
  Fl = Wn.ReactCurrentDispatcher,
  rf = Wn.ReactCurrentOwner,
  Ht = Wn.ReactCurrentBatchConfig,
  pe = 0,
  qe = null,
  Be = null,
  Je = 0,
  Nt = 0,
  Do = xr(0),
  We = 0,
  oi = null,
  Ur = 0,
  pa = 0,
  of = 0,
  Is = null,
  xt = null,
  sf = 0,
  Yo = 1 / 0,
  jn = null,
  Ml = !1,
  Vu = null,
  fr = null,
  Hi = !1,
  sr = null,
  Il = 0,
  zs = 0,
  Hu = null,
  ul = -1,
  dl = 0;
function dt() {
  return pe & 6 ? ze() : ul !== -1 ? ul : (ul = ze());
}
function pr(e) {
  return e.mode & 1
    ? pe & 2 && Je !== 0
      ? Je & -Je
      : _S.transition !== null
      ? (dl === 0 && (dl = iy()), dl)
      : ((e = ye),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : py(e.type))),
        e)
    : 1;
}
function nn(e, t, n, r) {
  if (50 < zs) throw ((zs = 0), (Hu = null), Error(H(185)));
  pi(e, n, r),
    (!(pe & 2) || e !== qe) &&
      (e === qe && (!(pe & 2) && (pa |= n), We === 4 && nr(e, Je)),
      kt(e, r),
      n === 1 && pe === 0 && !(t.mode & 1) && ((Yo = ze() + 500), ca && Sr()));
}
function kt(e, t) {
  var n = e.callbackNode;
  _x(e, t);
  var r = bl(e, e === qe ? Je : 0);
  if (r === 0)
    n !== null && Gp(n), (e.callbackNode = null), (e.callbackPriority = 0);
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && Gp(n), t === 1))
      e.tag === 0 ? ES(Bm.bind(null, e)) : Oy(Bm.bind(null, e)),
        xS(function () {
          !(pe & 6) && Sr();
        }),
        (n = null);
    else {
      switch (ly(r)) {
        case 1:
          n = Nd;
          break;
        case 4:
          n = oy;
          break;
        case 16:
          n = Sl;
          break;
        case 536870912:
          n = sy;
          break;
        default:
          n = Sl;
      }
      n = Tv(n, Cv.bind(null, e));
    }
    (e.callbackPriority = t), (e.callbackNode = n);
  }
}
function Cv(e, t) {
  if (((ul = -1), (dl = 0), pe & 6)) throw Error(H(327));
  var n = e.callbackNode;
  if (Lo() && e.callbackNode !== n) return null;
  var r = bl(e, e === qe ? Je : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = zl(e, r);
  else {
    t = r;
    var o = pe;
    pe |= 2;
    var s = _v();
    (qe !== e || Je !== t) && ((jn = null), (Yo = ze() + 500), Fr(e, t));
    do
      try {
        US();
        break;
      } catch (l) {
        Ev(e, l);
      }
    while (!0);
    Wd(),
      (Fl.current = s),
      (pe = o),
      Be !== null ? (t = 0) : ((qe = null), (Je = 0), (t = We));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((o = gu(e)), o !== 0 && ((r = o), (t = Wu(e, o)))), t === 1)
    )
      throw ((n = oi), Fr(e, 0), nr(e, r), kt(e, ze()), n);
    if (t === 6) nr(e, r);
    else {
      if (
        ((o = e.current.alternate),
        !(r & 30) &&
          !HS(o) &&
          ((t = zl(e, r)),
          t === 2 && ((s = gu(e)), s !== 0 && ((r = s), (t = Wu(e, s)))),
          t === 1))
      )
        throw ((n = oi), Fr(e, 0), nr(e, r), kt(e, ze()), n);
      switch (((e.finishedWork = o), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(H(345));
        case 2:
          Tr(e, xt, jn);
          break;
        case 3:
          if (
            (nr(e, r), (r & 130023424) === r && ((t = sf + 500 - ze()), 10 < t))
          ) {
            if (bl(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & r) !== r)) {
              dt(), (e.pingedLanes |= e.suspendedLanes & o);
              break;
            }
            e.timeoutHandle = Eu(Tr.bind(null, e, xt, jn), t);
            break;
          }
          Tr(e, xt, jn);
          break;
        case 4:
          if ((nr(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var i = 31 - tn(r);
            (s = 1 << i), (i = t[i]), i > o && (o = i), (r &= ~s);
          }
          if (
            ((r = o),
            (r = ze() - r),
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
                : 1960 * VS(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = Eu(Tr.bind(null, e, xt, jn), r);
            break;
          }
          Tr(e, xt, jn);
          break;
        case 5:
          Tr(e, xt, jn);
          break;
        default:
          throw Error(H(329));
      }
    }
  }
  return kt(e, ze()), e.callbackNode === n ? Cv.bind(null, e) : null;
}
function Wu(e, t) {
  var n = Is;
  return (
    e.current.memoizedState.isDehydrated && (Fr(e, t).flags |= 256),
    (e = zl(e, t)),
    e !== 2 && ((t = xt), (xt = n), t !== null && Uu(t)),
    e
  );
}
function Uu(e) {
  xt === null ? (xt = e) : xt.push.apply(xt, e);
}
function HS(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var o = n[r],
            s = o.getSnapshot;
          o = o.value;
          try {
            if (!on(s(), o)) return !1;
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
function nr(e, t) {
  for (
    t &= ~of,
      t &= ~pa,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;

  ) {
    var n = 31 - tn(t),
      r = 1 << n;
    (e[n] = -1), (t &= ~r);
  }
}
function Bm(e) {
  if (pe & 6) throw Error(H(327));
  Lo();
  var t = bl(e, 0);
  if (!(t & 1)) return kt(e, ze()), null;
  var n = zl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = gu(e);
    r !== 0 && ((t = r), (n = Wu(e, r)));
  }
  if (n === 1) throw ((n = oi), Fr(e, 0), nr(e, t), kt(e, ze()), n);
  if (n === 6) throw Error(H(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    Tr(e, xt, jn),
    kt(e, ze()),
    null
  );
}
function lf(e, t) {
  var n = pe;
  pe |= 1;
  try {
    return e(t);
  } finally {
    (pe = n), pe === 0 && ((Yo = ze() + 500), ca && Sr());
  }
}
function Yr(e) {
  sr !== null && sr.tag === 0 && !(pe & 6) && Lo();
  var t = pe;
  pe |= 1;
  var n = Ht.transition,
    r = ye;
  try {
    if (((Ht.transition = null), (ye = 1), e)) return e();
  } finally {
    (ye = r), (Ht.transition = n), (pe = t), !(pe & 6) && Sr();
  }
}
function af() {
  (Nt = Do.current), _e(Do);
}
function Fr(e, t) {
  (e.finishedWork = null), (e.finishedLanes = 0);
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), wS(n)), Be !== null))
    for (n = Be.return; n !== null; ) {
      var r = n;
      switch ((Bd(r), r.tag)) {
        case 1:
          (r = r.type.childContextTypes), r != null && Rl();
          break;
        case 3:
          Wo(), _e(Et), _e(st), Xd();
          break;
        case 5:
          Gd(r);
          break;
        case 4:
          Wo();
          break;
        case 13:
          _e(Ne);
          break;
        case 19:
          _e(Ne);
          break;
        case 10:
          Ud(r.type._context);
          break;
        case 22:
        case 23:
          af();
      }
      n = n.return;
    }
  if (
    ((qe = e),
    (Be = e = mr(e.current, null)),
    (Je = Nt = t),
    (We = 0),
    (oi = null),
    (of = pa = Ur = 0),
    (xt = Is = null),
    $r !== null)
  ) {
    for (t = 0; t < $r.length; t++)
      if (((n = $r[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var o = r.next,
          s = n.pending;
        if (s !== null) {
          var i = s.next;
          (s.next = o), (r.next = i);
        }
        n.pending = r;
      }
    $r = null;
  }
  return e;
}
function Ev(e, t) {
  do {
    var n = Be;
    try {
      if ((Wd(), (ll.current = Al), Ll)) {
        for (var r = Oe.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), (r = r.next);
        }
        Ll = !1;
      }
      if (
        ((Wr = 0),
        (Ye = He = Oe = null),
        (Fs = !1),
        (ti = 0),
        (rf.current = null),
        n === null || n.return === null)
      ) {
        (We = 1), (oi = t), (Be = null);
        break;
      }
      e: {
        var s = e,
          i = n.return,
          l = n,
          a = t;
        if (
          ((t = Je),
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
          var p = Dm(i);
          if (p !== null) {
            (p.flags &= -257),
              Pm(p, i, l, s, t),
              p.mode & 1 && Rm(s, c, t),
              (t = p),
              (a = c);
            var m = t.updateQueue;
            if (m === null) {
              var h = new Set();
              h.add(a), (t.updateQueue = h);
            } else m.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              Rm(s, c, t), cf();
              break e;
            }
            a = Error(H(426));
          }
        } else if (De && l.mode & 1) {
          var S = Dm(i);
          if (S !== null) {
            !(S.flags & 65536) && (S.flags |= 256),
              Pm(S, i, l, s, t),
              Vd(Uo(a, l));
            break e;
          }
        }
        (s = a = Uo(a, l)),
          We !== 4 && (We = 2),
          Is === null ? (Is = [s]) : Is.push(s),
          (s = i);
        do {
          switch (s.tag) {
            case 3:
              (s.flags |= 65536), (t &= -t), (s.lanes |= t);
              var v = lv(s, a, t);
              Sm(s, v);
              break e;
            case 1:
              l = a;
              var w = s.type,
                y = s.stateNode;
              if (
                !(s.flags & 128) &&
                (typeof w.getDerivedStateFromError == "function" ||
                  (y !== null &&
                    typeof y.componentDidCatch == "function" &&
                    (fr === null || !fr.has(y))))
              ) {
                (s.flags |= 65536), (t &= -t), (s.lanes |= t);
                var b = av(s, l, t);
                Sm(s, b);
                break e;
              }
          }
          s = s.return;
        } while (s !== null);
      }
      Rv(n);
    } catch (E) {
      (t = E), Be === n && n !== null && (Be = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function _v() {
  var e = Fl.current;
  return (Fl.current = Al), e === null ? Al : e;
}
function cf() {
  (We === 0 || We === 3 || We === 2) && (We = 4),
    qe === null || (!(Ur & 268435455) && !(pa & 268435455)) || nr(qe, Je);
}
function zl(e, t) {
  var n = pe;
  pe |= 2;
  var r = _v();
  (qe !== e || Je !== t) && ((jn = null), Fr(e, t));
  do
    try {
      WS();
      break;
    } catch (o) {
      Ev(e, o);
    }
  while (!0);
  if ((Wd(), (pe = n), (Fl.current = r), Be !== null)) throw Error(H(261));
  return (qe = null), (Je = 0), We;
}
function WS() {
  for (; Be !== null; ) kv(Be);
}
function US() {
  for (; Be !== null && !gx(); ) kv(Be);
}
function kv(e) {
  var t = Pv(e.alternate, e, Nt);
  (e.memoizedProps = e.pendingProps),
    t === null ? Rv(e) : (Be = t),
    (rf.current = null);
}
function Rv(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = MS(n, t)), n !== null)) {
        (n.flags &= 32767), (Be = n);
        return;
      }
      if (e !== null)
        (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
      else {
        (We = 6), (Be = null);
        return;
      }
    } else if (((n = FS(n, t, Nt)), n !== null)) {
      Be = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Be = t;
      return;
    }
    Be = t = e;
  } while (t !== null);
  We === 0 && (We = 5);
}
function Tr(e, t, n) {
  var r = ye,
    o = Ht.transition;
  try {
    (Ht.transition = null), (ye = 1), YS(e, t, n, r);
  } finally {
    (Ht.transition = o), (ye = r);
  }
  return null;
}
function YS(e, t, n, r) {
  do Lo();
  while (sr !== null);
  if (pe & 6) throw Error(H(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(H(177));
  (e.callbackNode = null), (e.callbackPriority = 0);
  var s = n.lanes | n.childLanes;
  if (
    (kx(e, s),
    e === qe && ((Be = qe = null), (Je = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      Hi ||
      ((Hi = !0),
      Tv(Sl, function () {
        return Lo(), null;
      })),
    (s = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || s)
  ) {
    (s = Ht.transition), (Ht.transition = null);
    var i = ye;
    ye = 1;
    var l = pe;
    (pe |= 4),
      (rf.current = null),
      zS(e, n),
      Sv(n, e),
      fS(bu),
      (Cl = !!Su),
      (bu = Su = null),
      (e.current = n),
      BS(n),
      yx(),
      (pe = l),
      (ye = i),
      (Ht.transition = s);
  } else e.current = n;
  if (
    (Hi && ((Hi = !1), (sr = e), (Il = o)),
    (s = e.pendingLanes),
    s === 0 && (fr = null),
    xx(n.stateNode),
    kt(e, ze()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      (o = t[n]), r(o.value, { componentStack: o.stack, digest: o.digest });
  if (Ml) throw ((Ml = !1), (e = Vu), (Vu = null), e);
  return (
    Il & 1 && e.tag !== 0 && Lo(),
    (s = e.pendingLanes),
    s & 1 ? (e === Hu ? zs++ : ((zs = 0), (Hu = e))) : (zs = 0),
    Sr(),
    null
  );
}
function Lo() {
  if (sr !== null) {
    var e = ly(Il),
      t = Ht.transition,
      n = ye;
    try {
      if (((Ht.transition = null), (ye = 16 > e ? 16 : e), sr === null))
        var r = !1;
      else {
        if (((e = sr), (sr = null), (Il = 0), pe & 6)) throw Error(H(331));
        var o = pe;
        for (pe |= 4, K = e.current; K !== null; ) {
          var s = K,
            i = s.child;
          if (K.flags & 16) {
            var l = s.deletions;
            if (l !== null) {
              for (var a = 0; a < l.length; a++) {
                var c = l[a];
                for (K = c; K !== null; ) {
                  var u = K;
                  switch (u.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ms(8, u, s);
                  }
                  var d = u.child;
                  if (d !== null) (d.return = u), (K = d);
                  else
                    for (; K !== null; ) {
                      u = K;
                      var f = u.sibling,
                        p = u.return;
                      if ((vv(u), u === c)) {
                        K = null;
                        break;
                      }
                      if (f !== null) {
                        (f.return = p), (K = f);
                        break;
                      }
                      K = p;
                    }
                }
              }
              var m = s.alternate;
              if (m !== null) {
                var h = m.child;
                if (h !== null) {
                  m.child = null;
                  do {
                    var S = h.sibling;
                    (h.sibling = null), (h = S);
                  } while (h !== null);
                }
              }
              K = s;
            }
          }
          if (s.subtreeFlags & 2064 && i !== null) (i.return = s), (K = i);
          else
            e: for (; K !== null; ) {
              if (((s = K), s.flags & 2048))
                switch (s.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Ms(9, s, s.return);
                }
              var v = s.sibling;
              if (v !== null) {
                (v.return = s.return), (K = v);
                break e;
              }
              K = s.return;
            }
        }
        var w = e.current;
        for (K = w; K !== null; ) {
          i = K;
          var y = i.child;
          if (i.subtreeFlags & 2064 && y !== null) (y.return = i), (K = y);
          else
            e: for (i = w; K !== null; ) {
              if (((l = K), l.flags & 2048))
                try {
                  switch (l.tag) {
                    case 0:
                    case 11:
                    case 15:
                      fa(9, l);
                  }
                } catch (E) {
                  Fe(l, l.return, E);
                }
              if (l === i) {
                K = null;
                break e;
              }
              var b = l.sibling;
              if (b !== null) {
                (b.return = l.return), (K = b);
                break e;
              }
              K = l.return;
            }
        }
        if (
          ((pe = o), Sr(), Cn && typeof Cn.onPostCommitFiberRoot == "function")
        )
          try {
            Cn.onPostCommitFiberRoot(oa, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      (ye = n), (Ht.transition = t);
    }
  }
  return !1;
}
function Vm(e, t, n) {
  (t = Uo(n, t)),
    (t = lv(e, t, 1)),
    (e = dr(e, t, 1)),
    (t = dt()),
    e !== null && (pi(e, 1, t), kt(e, t));
}
function Fe(e, t, n) {
  if (e.tag === 3) Vm(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        Vm(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (fr === null || !fr.has(r)))
        ) {
          (e = Uo(n, e)),
            (e = av(t, e, 1)),
            (t = dr(t, e, 1)),
            (e = dt()),
            t !== null && (pi(t, 1, e), kt(t, e));
          break;
        }
      }
      t = t.return;
    }
}
function qS(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t),
    (t = dt()),
    (e.pingedLanes |= e.suspendedLanes & n),
    qe === e &&
      (Je & n) === n &&
      (We === 4 || (We === 3 && (Je & 130023424) === Je && 500 > ze() - sf)
        ? Fr(e, 0)
        : (of |= n)),
    kt(e, t);
}
function Dv(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = ji), (ji <<= 1), !(ji & 130023424) && (ji = 4194304))
      : (t = 1));
  var n = dt();
  (e = Bn(e, t)), e !== null && (pi(e, t, n), kt(e, n));
}
function KS(e) {
  var t = e.memoizedState,
    n = 0;
  t !== null && (n = t.retryLane), Dv(e, n);
}
function GS(e, t) {
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
  r !== null && r.delete(t), Dv(e, n);
}
var Pv;
Pv = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Et.current) St = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return (St = !1), AS(e, t, n);
      St = !!(e.flags & 131072);
    }
  else (St = !1), De && t.flags & 1048576 && jy(t, Tl, t.index);
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      cl(e, t), (e = t.pendingProps);
      var o = Bo(t, st.current);
      $o(t, n), (o = Jd(null, t, r, e, o, n));
      var s = Zd();
      return (
        (t.flags |= 1),
        typeof o == "object" &&
        o !== null &&
        typeof o.render == "function" &&
        o.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            _t(r) ? ((s = !0), Dl(t)) : (s = !1),
            (t.memoizedState =
              o.state !== null && o.state !== void 0 ? o.state : null),
            qd(t),
            (o.updater = da),
            (t.stateNode = o),
            (o._reactInternals = t),
            Nu(t, r, e, n),
            (t = $u(null, t, r, !0, s, n)))
          : ((t.tag = 0), De && s && zd(t), ct(null, t, o, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (cl(e, t),
          (e = t.pendingProps),
          (o = r._init),
          (r = o(r._payload)),
          (t.type = r),
          (o = t.tag = QS(r)),
          (e = Qt(r, e)),
          o)
        ) {
          case 0:
            t = ju(null, t, r, e, n);
            break e;
          case 1:
            t = Om(null, t, r, e, n);
            break e;
          case 11:
            t = Tm(null, t, r, e, n);
            break e;
          case 14:
            t = Nm(null, t, r, Qt(r.type, e), n);
            break e;
        }
        throw Error(H(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Qt(r, o)),
        ju(e, t, r, o, n)
      );
    case 1:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Qt(r, o)),
        Om(e, t, r, o, n)
      );
    case 3:
      e: {
        if ((fv(t), e === null)) throw Error(H(387));
        (r = t.pendingProps),
          (s = t.memoizedState),
          (o = s.element),
          Iy(e, t),
          jl(t, r, null, n);
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
            (o = Uo(Error(H(423)), t)), (t = jm(e, t, r, n, o));
            break e;
          } else if (r !== o) {
            (o = Uo(Error(H(424)), t)), (t = jm(e, t, r, n, o));
            break e;
          } else
            for (
              Ot = ur(t.stateNode.containerInfo.firstChild),
                jt = t,
                De = !0,
                Zt = null,
                n = Fy(t, null, r, n),
                t.child = n;
              n;

            )
              (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
        else {
          if ((Vo(), r === o)) {
            t = Vn(e, t, n);
            break e;
          }
          ct(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        zy(t),
        e === null && Du(t),
        (r = t.type),
        (o = t.pendingProps),
        (s = e !== null ? e.memoizedProps : null),
        (i = o.children),
        Cu(r, o) ? (i = null) : s !== null && Cu(r, s) && (t.flags |= 32),
        dv(e, t),
        ct(e, t, i, n),
        t.child
      );
    case 6:
      return e === null && Du(t), null;
    case 13:
      return pv(e, t, n);
    case 4:
      return (
        Kd(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = Ho(t, null, r, n)) : ct(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Qt(r, o)),
        Tm(e, t, r, o, n)
      );
    case 7:
      return ct(e, t, t.pendingProps, n), t.child;
    case 8:
      return ct(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ct(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (o = t.pendingProps),
          (s = t.memoizedProps),
          (i = o.value),
          be(Nl, r._currentValue),
          (r._currentValue = i),
          s !== null)
        )
          if (on(s.value, i)) {
            if (s.children === o.children && !Et.current) {
              t = Vn(e, t, n);
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
                      (a = Fn(-1, n & -n)), (a.tag = 2);
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
                      Pu(s.return, n, t),
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
                  Pu(i, n, t),
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
        ct(e, t, o.children, n), (t = t.child);
      }
      return t;
    case 9:
      return (
        (o = t.type),
        (r = t.pendingProps.children),
        $o(t, n),
        (o = Ut(o)),
        (r = r(o)),
        (t.flags |= 1),
        ct(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (o = Qt(r, t.pendingProps)),
        (o = Qt(r.type, o)),
        Nm(e, t, r, o, n)
      );
    case 15:
      return cv(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Qt(r, o)),
        cl(e, t),
        (t.tag = 1),
        _t(r) ? ((e = !0), Dl(t)) : (e = !1),
        $o(t, n),
        iv(t, r, o),
        Nu(t, r, o, n),
        $u(null, t, r, !0, e, n)
      );
    case 19:
      return mv(e, t, n);
    case 22:
      return uv(e, t, n);
  }
  throw Error(H(156, t.tag));
};
function Tv(e, t) {
  return ry(e, t);
}
function XS(e, t, n, r) {
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
function Vt(e, t, n, r) {
  return new XS(e, t, n, r);
}
function uf(e) {
  return (e = e.prototype), !(!e || !e.isReactComponent);
}
function QS(e) {
  if (typeof e == "function") return uf(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Dd)) return 11;
    if (e === Pd) return 14;
  }
  return 2;
}
function mr(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Vt(e.tag, t, e.key, e.mode)),
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
function fl(e, t, n, r, o, s) {
  var i = 2;
  if (((r = e), typeof e == "function")) uf(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else
    e: switch (e) {
      case vo:
        return Mr(n.children, o, s, t);
      case Rd:
        (i = 8), (o |= 8);
        break;
      case tu:
        return (
          (e = Vt(12, n, t, o | 2)), (e.elementType = tu), (e.lanes = s), e
        );
      case nu:
        return (e = Vt(13, n, t, o)), (e.elementType = nu), (e.lanes = s), e;
      case ru:
        return (e = Vt(19, n, t, o)), (e.elementType = ru), (e.lanes = s), e;
      case zg:
        return ma(n, o, s, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Mg:
              i = 10;
              break e;
            case Ig:
              i = 9;
              break e;
            case Dd:
              i = 11;
              break e;
            case Pd:
              i = 14;
              break e;
            case Jn:
              (i = 16), (r = null);
              break e;
          }
        throw Error(H(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = Vt(i, n, t, o)), (t.elementType = e), (t.type = r), (t.lanes = s), t
  );
}
function Mr(e, t, n, r) {
  return (e = Vt(7, e, r, t)), (e.lanes = n), e;
}
function ma(e, t, n, r) {
  return (
    (e = Vt(22, e, r, t)),
    (e.elementType = zg),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Oc(e, t, n) {
  return (e = Vt(6, e, null, t)), (e.lanes = n), e;
}
function jc(e, t, n) {
  return (
    (t = Vt(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function JS(e, t, n, r, o) {
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
    (this.eventTimes = pc(0)),
    (this.expirationTimes = pc(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = pc(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = o),
    (this.mutableSourceEagerHydrationData = null);
}
function df(e, t, n, r, o, s, i, l, a) {
  return (
    (e = new JS(e, t, n, l, a)),
    t === 1 ? ((t = 1), s === !0 && (t |= 8)) : (t = 0),
    (s = Vt(3, null, null, t)),
    (e.current = s),
    (s.stateNode = e),
    (s.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    qd(s),
    e
  );
}
function ZS(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: yo,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Nv(e) {
  if (!e) return gr;
  e = e._reactInternals;
  e: {
    if (to(e) !== e || e.tag !== 1) throw Error(H(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (_t(t.type)) {
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
    if (_t(n)) return Ny(e, n, t);
  }
  return t;
}
function Ov(e, t, n, r, o, s, i, l, a) {
  return (
    (e = df(n, r, !0, e, o, s, i, l, a)),
    (e.context = Nv(null)),
    (n = e.current),
    (r = dt()),
    (o = pr(n)),
    (s = Fn(r, o)),
    (s.callback = t ?? null),
    dr(n, s, o),
    (e.current.lanes = o),
    pi(e, o, r),
    kt(e, r),
    e
  );
}
function ha(e, t, n, r) {
  var o = t.current,
    s = dt(),
    i = pr(o);
  return (
    (n = Nv(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = Fn(s, i)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = dr(o, t, i)),
    e !== null && (nn(e, o, i, s), il(e, o, i)),
    i
  );
}
function Bl(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Hm(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ff(e, t) {
  Hm(e, t), (e = e.alternate) && Hm(e, t);
}
function eb() {
  return null;
}
var jv =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function pf(e) {
  this._internalRoot = e;
}
ga.prototype.render = pf.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(H(409));
  ha(e, t, null, null);
};
ga.prototype.unmount = pf.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    Yr(function () {
      ha(null, e, null, null);
    }),
      (t[zn] = null);
  }
};
function ga(e) {
  this._internalRoot = e;
}
ga.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = uy();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < tr.length && t !== 0 && t < tr[n].priority; n++);
    tr.splice(n, 0, e), n === 0 && fy(e);
  }
};
function mf(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function ya(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Wm() {}
function tb(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var s = r;
      r = function () {
        var c = Bl(i);
        s.call(c);
      };
    }
    var i = Ov(t, r, e, 0, null, !1, !1, "", Wm);
    return (
      (e._reactRootContainer = i),
      (e[zn] = i.current),
      Xs(e.nodeType === 8 ? e.parentNode : e),
      Yr(),
      i
    );
  }
  for (; (o = e.lastChild); ) e.removeChild(o);
  if (typeof r == "function") {
    var l = r;
    r = function () {
      var c = Bl(a);
      l.call(c);
    };
  }
  var a = df(e, 0, !1, null, null, !1, !1, "", Wm);
  return (
    (e._reactRootContainer = a),
    (e[zn] = a.current),
    Xs(e.nodeType === 8 ? e.parentNode : e),
    Yr(function () {
      ha(t, a, n, r);
    }),
    a
  );
}
function va(e, t, n, r, o) {
  var s = n._reactRootContainer;
  if (s) {
    var i = s;
    if (typeof o == "function") {
      var l = o;
      o = function () {
        var a = Bl(i);
        l.call(a);
      };
    }
    ha(t, i, e, o);
  } else i = tb(n, t, e, o, r);
  return Bl(i);
}
ay = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Ts(t.pendingLanes);
        n !== 0 &&
          (Od(t, n | 1), kt(t, ze()), !(pe & 6) && ((Yo = ze() + 500), Sr()));
      }
      break;
    case 13:
      Yr(function () {
        var r = Bn(e, 1);
        if (r !== null) {
          var o = dt();
          nn(r, e, 1, o);
        }
      }),
        ff(e, 1);
  }
};
jd = function (e) {
  if (e.tag === 13) {
    var t = Bn(e, 134217728);
    if (t !== null) {
      var n = dt();
      nn(t, e, 134217728, n);
    }
    ff(e, 134217728);
  }
};
cy = function (e) {
  if (e.tag === 13) {
    var t = pr(e),
      n = Bn(e, t);
    if (n !== null) {
      var r = dt();
      nn(n, e, t, r);
    }
    ff(e, t);
  }
};
uy = function () {
  return ye;
};
dy = function (e, t) {
  var n = ye;
  try {
    return (ye = e), t();
  } finally {
    ye = n;
  }
};
pu = function (e, t, n) {
  switch (t) {
    case "input":
      if ((iu(e, n), (t = n.name), n.type === "radio" && t != null)) {
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
            var o = aa(r);
            if (!o) throw Error(H(90));
            Vg(r), iu(r, o);
          }
        }
      }
      break;
    case "textarea":
      Wg(e, n);
      break;
    case "select":
      (t = n.value), t != null && To(e, !!n.multiple, t, !1);
  }
};
Qg = lf;
Jg = Yr;
var nb = { usingClientEntryPoint: !1, Events: [hi, bo, aa, Gg, Xg, lf] },
  bs = {
    findFiberByHostInstance: jr,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  rb = {
    bundleType: bs.bundleType,
    version: bs.version,
    rendererPackageName: bs.rendererPackageName,
    rendererConfig: bs.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Wn.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return (e = ty(e)), e === null ? null : e.stateNode;
    },
    findFiberByHostInstance: bs.findFiberByHostInstance || eb,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Wi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Wi.isDisabled && Wi.supportsFiber)
    try {
      (oa = Wi.inject(rb)), (Cn = Wi);
    } catch {}
}
At.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = nb;
At.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!mf(t)) throw Error(H(200));
  return ZS(e, t, null, n);
};
At.createRoot = function (e, t) {
  if (!mf(e)) throw Error(H(299));
  var n = !1,
    r = "",
    o = jv;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
    (t = df(e, 1, !1, null, null, n, !1, r, o)),
    (e[zn] = t.current),
    Xs(e.nodeType === 8 ? e.parentNode : e),
    new pf(t)
  );
};
At.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(H(188))
      : ((e = Object.keys(e).join(",")), Error(H(268, e)));
  return (e = ty(t)), (e = e === null ? null : e.stateNode), e;
};
At.flushSync = function (e) {
  return Yr(e);
};
At.hydrate = function (e, t, n) {
  if (!ya(t)) throw Error(H(200));
  return va(null, e, t, !0, n);
};
At.hydrateRoot = function (e, t, n) {
  if (!mf(e)) throw Error(H(405));
  var r = (n != null && n.hydratedSources) || null,
    o = !1,
    s = "",
    i = jv;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (o = !0),
      n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (t = Ov(t, null, e, 1, n ?? null, o, !1, s, i)),
    (e[zn] = t.current),
    Xs(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      (n = r[e]),
        (o = n._getVersion),
        (o = o(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, o])
          : t.mutableSourceEagerHydrationData.push(n, o);
  return new ga(t);
};
At.render = function (e, t, n) {
  if (!ya(t)) throw Error(H(200));
  return va(null, e, t, !1, n);
};
At.unmountComponentAtNode = function (e) {
  if (!ya(e)) throw Error(H(40));
  return e._reactRootContainer
    ? (Yr(function () {
        va(null, null, e, !1, function () {
          (e._reactRootContainer = null), (e[zn] = null);
        });
      }),
      !0)
    : !1;
};
At.unstable_batchedUpdates = lf;
At.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!ya(n)) throw Error(H(200));
  if (e == null || e._reactInternals === void 0) throw Error(H(38));
  return va(e, t, n, !1, r);
};
At.version = "18.3.1-next-f1338f8080-20240426";
function $v() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE($v);
    } catch (e) {
      console.error(e);
    }
}
$v(), ($g.exports = At);
var yi = $g.exports;
const ob = Zr(yi);
var Um = yi;
(Zc.createRoot = Um.createRoot), (Zc.hydrateRoot = Um.hydrateRoot);
var bn = function () {
  return (
    (bn =
      Object.assign ||
      function (t) {
        for (var n, r = 1, o = arguments.length; r < o; r++) {
          n = arguments[r];
          for (var s in n)
            Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
        }
        return t;
      }),
    bn.apply(this, arguments)
  );
};
function Lv(e, t) {
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
function sb(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, o = t.length, s; r < o; r++)
      (s || !(r in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, r)), (s[r] = t[r]));
  return e.concat(s || Array.prototype.slice.call(t));
}
var pl = "right-scroll-bar-position",
  ml = "width-before-scroll-bar",
  ib = "with-scroll-bars-hidden",
  lb = "--removed-body-scroll-bar-size";
function $c(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function ab(e, t) {
  var n = x.useState(function () {
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
var cb = typeof window < "u" ? x.useLayoutEffect : x.useEffect,
  Ym = new WeakMap();
function ub(e, t) {
  var n = ab(null, function (r) {
    return e.forEach(function (o) {
      return $c(o, r);
    });
  });
  return (
    cb(
      function () {
        var r = Ym.get(n);
        if (r) {
          var o = new Set(r),
            s = new Set(e),
            i = n.current;
          o.forEach(function (l) {
            s.has(l) || $c(l, null);
          }),
            s.forEach(function (l) {
              o.has(l) || $c(l, i);
            });
        }
        Ym.set(n, e);
      },
      [e]
    ),
    n
  );
}
function db(e) {
  return e;
}
function fb(e, t) {
  t === void 0 && (t = db);
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
function pb(e) {
  e === void 0 && (e = {});
  var t = fb(null);
  return (t.options = bn({ async: !0, ssr: !1 }, e)), t;
}
var Av = function (e) {
  var t = e.sideCar,
    n = Lv(e, ["sideCar"]);
  if (!t)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car"
    );
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return x.createElement(r, bn({}, n));
};
Av.isSideCarExport = !0;
function mb(e, t) {
  return e.useMedium(t), Av;
}
var Fv = pb(),
  Lc = function () {},
  wa = x.forwardRef(function (e, t) {
    var n = x.useRef(null),
      r = x.useState({
        onScrollCapture: Lc,
        onWheelCapture: Lc,
        onTouchMoveCapture: Lc,
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
      p = e.noIsolation,
      m = e.inert,
      h = e.allowPinchZoom,
      S = e.as,
      v = S === void 0 ? "div" : S,
      w = e.gapMode,
      y = Lv(e, [
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
      E = ub([n, t]),
      C = bn(bn({}, y), o);
    return x.createElement(
      x.Fragment,
      null,
      u &&
        x.createElement(b, {
          sideCar: Fv,
          removeScrollBar: c,
          shards: d,
          noIsolation: p,
          inert: m,
          setCallbacks: s,
          allowPinchZoom: !!h,
          lockRef: n,
          gapMode: w,
        }),
      i
        ? x.cloneElement(x.Children.only(l), bn(bn({}, C), { ref: E }))
        : x.createElement(v, bn({}, C, { className: a, ref: E }), l)
    );
  });
wa.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
wa.classNames = { fullWidth: ml, zeroRight: pl };
var hb = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function gb() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = hb();
  return t && e.setAttribute("nonce", t), e;
}
function yb(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function vb(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var wb = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        e == 0 && (t = gb()) && (yb(t, n), vb(t)), e++;
      },
      remove: function () {
        e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null));
      },
    };
  },
  xb = function () {
    var e = wb();
    return function (t, n) {
      x.useEffect(
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
  Mv = function () {
    var e = xb(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return e(r, o), null;
      };
    return t;
  },
  Sb = { left: 0, top: 0, right: 0, gap: 0 },
  Ac = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  bb = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [Ac(n), Ac(r), Ac(o)];
  },
  Cb = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return Sb;
    var t = bb(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    };
  },
  Eb = Mv(),
  Ao = "data-scroll-locked",
  _b = function (e, t, n, r) {
    var o = e.left,
      s = e.top,
      i = e.right,
      l = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          ib,
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
          Ao,
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
          hl,
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
          gl,
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
        .concat(hl, " .")
        .concat(
          hl,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(gl, " .")
        .concat(
          gl,
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
          Ao,
          `] {
    `
        )
        .concat(wb, ": ")
        .concat(
          l,
          `px;
  }
`
        )
    );
  },
  qm = function () {
    var e = parseInt(document.body.getAttribute(Ao) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  kb = function () {
    x.useEffect(function () {
      return (
        document.body.setAttribute(Ao, (qm() + 1).toString()),
        function () {
          var e = qm() - 1;
          e <= 0
            ? document.body.removeAttribute(Ao)
            : document.body.setAttribute(Ao, e.toString());
        }
      );
    }, []);
  },
  Rb = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    kb();
    var s = x.useMemo(
      function () {
        return Cb(o);
      },
      [o]
    );
    return x.createElement(Eb, { styles: _b(s, !t, o, n ? "" : "!important") });
  },
  Yu = !1;
if (typeof window < "u")
  try {
    var Ui = Object.defineProperty({}, "passive", {
      get: function () {
        return (Yu = !0), !0;
      },
    });
    window.addEventListener("test", Ui, Ui),
      window.removeEventListener("test", Ui, Ui);
  } catch {
    Yu = !1;
  }
var fo = Yu ? { passive: !1 } : !1,
  Db = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Iv = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== "hidden" &&
      !(n.overflowY === n.overflowX && !Db(e) && n[t] === "visible")
    );
  },
  Pb = function (e) {
    return Iv(e, "overflowY");
  },
  Tb = function (e) {
    return Iv(e, "overflowX");
  },
  Km = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = zv(e, r);
      if (o) {
        var s = Bv(e, r),
          i = s[1],
          l = s[2];
        if (i > l) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  Nb = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Ob = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  zv = function (e, t) {
    return e === "v" ? Pb(t) : Tb(t);
  },
  Bv = function (e, t) {
    return e === "v" ? Nb(t) : Ob(t);
  },
  jb = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  $b = function (e, t, n, r, o) {
    var s = jb(e, window.getComputedStyle(t).direction),
      i = s * r,
      l = n.target,
      a = t.contains(l),
      c = !1,
      u = i > 0,
      d = 0,
      f = 0;
    do {
      var p = Bv(e, l),
        m = p[0],
        h = p[1],
        S = p[2],
        v = h - S - s * m;
      (m || v) && zv(e, l) && ((d += v), (f += m)),
        l instanceof ShadowRoot ? (l = l.host) : (l = l.parentNode);
    } while ((!a && l !== document.body) || (a && (t.contains(l) || t === l)));
    return (
      ((u && (Math.abs(d) < 1 || !o)) || (!u && (Math.abs(f) < 1 || !o))) &&
        (c = !0),
      c
    );
  },
  Yi = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  Gm = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Xm = function (e) {
    return e && "current" in e ? e.current : e;
  },
  Lb = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  Ab = function (e) {
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
  Fb = 0,
  po = [];
function Mb(e) {
  var t = x.useRef([]),
    n = x.useRef([0, 0]),
    r = x.useRef(),
    o = x.useState(Fb++)[0],
    s = x.useState(Mv)[0],
    i = x.useRef(e);
  x.useEffect(
    function () {
      i.current = e;
    },
    [e]
  ),
    x.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var h = sb([e.lockRef.current], (e.shards || []).map(Xm), !0).filter(
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
  var l = x.useCallback(function (h, S) {
      if ("touches" in h && h.touches.length === 2)
        return !i.current.allowPinchZoom;
      var v = Yi(h),
        w = n.current,
        y = "deltaX" in h ? h.deltaX : w[0] - v[0],
        b = "deltaY" in h ? h.deltaY : w[1] - v[1],
        E,
        C = h.target,
        R = Math.abs(y) > Math.abs(b) ? "h" : "v";
      if ("touches" in h && R === "h" && C.type === "range") return !1;
      var D = Km(R, C);
      if (!D) return !0;
      if ((D ? (E = R) : ((E = R === "v" ? "h" : "v"), (D = Km(R, C))), !D))
        return !1;
      if (
        (!r.current && "changedTouches" in h && (y || b) && (r.current = E), !E)
      )
        return !0;
      var L = r.current || E;
      return $b(L, S, h, L === "h" ? y : b, !0);
    }, []),
    a = x.useCallback(function (h) {
      var S = h;
      if (!(!po.length || po[po.length - 1] !== s)) {
        var v = "deltaY" in S ? Gm(S) : Yi(S),
          w = t.current.filter(function (E) {
            return (
              E.name === S.type &&
              (E.target === S.target || S.target === E.shadowParent) &&
              Lb(E.delta, v)
            );
          })[0];
        if (w && w.should) {
          S.cancelable && S.preventDefault();
          return;
        }
        if (!w) {
          var y = (i.current.shards || [])
              .map(Xm)
              .filter(Boolean)
              .filter(function (E) {
                return E.contains(S.target);
              }),
            b = y.length > 0 ? l(S, y[0]) : !i.current.noIsolation;
          b && S.cancelable && S.preventDefault();
        }
      }
    }, []),
    c = x.useCallback(function (h, S, v, w) {
      var y = { name: h, delta: S, target: v, should: w, shadowParent: Ib(v) };
      t.current.push(y),
        setTimeout(function () {
          t.current = t.current.filter(function (b) {
            return b !== y;
          });
        }, 1);
    }, []),
    u = x.useCallback(function (h) {
      (n.current = Yi(h)), (r.current = void 0);
    }, []),
    d = x.useCallback(function (h) {
      c(h.type, Gm(h), h.target, l(h, e.lockRef.current));
    }, []),
    f = x.useCallback(function (h) {
      c(h.type, Yi(h), h.target, l(h, e.lockRef.current));
    }, []);
  x.useEffect(function () {
    return (
      po.push(s),
      e.setCallbacks({
        onScrollCapture: d,
        onWheelCapture: d,
        onTouchMoveCapture: f,
      }),
      document.addEventListener("wheel", a, fo),
      document.addEventListener("touchmove", a, fo),
      document.addEventListener("touchstart", u, fo),
      function () {
        (po = po.filter(function (h) {
          return h !== s;
        })),
          document.removeEventListener("wheel", a, fo),
          document.removeEventListener("touchmove", a, fo),
          document.removeEventListener("touchstart", u, fo);
      }
    );
  }, []);
  var p = e.removeScrollBar,
    m = e.inert;
  return x.createElement(
    x.Fragment,
    null,
    m ? x.createElement(s, { styles: Ab(o) }) : null,
    p ? x.createElement(Rb, { gapMode: e.gapMode }) : null
  );
}
function Ib(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode);
  return t;
}
const zb = mb(Fv, Mb);
var Vv = x.forwardRef(function (e, t) {
  return x.createElement(wa, bn({}, e, { ref: t, sideCar: zb }));
});
Vv.classNames = wa.classNames;
function _n(e) {
  return Object.keys(e);
}
function Fc(e) {
  return e && typeof e == "object" && !Array.isArray(e);
}
function hf(e, t) {
  const n = { ...e },
    r = t;
  return (
    Fc(e) &&
      Fc(t) &&
      Object.keys(t).forEach((o) => {
        Fc(r[o]) && o in e ? (n[o] = hf(n[o], r[o])) : (n[o] = r[o]);
      }),
    n
  );
}
function Bb(e) {
  return e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function Vb(e) {
  var t;
  return typeof e != "string" || !e.includes("var(--mantine-scale)")
    ? e
    : (t = e.match(/^calc\((.*?)\)$/)) == null
    ? void 0
    : t[1].split("*")[0].trim();
}
function Hb(e) {
  const t = Vb(e);
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
function Mc(e) {
  return e === "0rem" ? "0rem" : `calc(${e} * var(--mantine-scale))`;
}
function Hv(e, { shouldScale: t = !1 } = {}) {
  function n(r) {
    if (r === 0 || r === "0") return `0${e}`;
    if (typeof r == "number") {
      const o = `${r / 16}${e}`;
      return t ? Mc(o) : o;
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
      if (r.includes(e)) return t ? Mc(r) : r;
      const o = r.replace("px", "");
      if (!Number.isNaN(Number(o))) {
        const s = `${Number(o) / 16}${e}`;
        return t ? Mc(s) : s;
      }
    }
    return r;
  }
  return n;
}
const z = Hv("rem", { shouldScale: !0 }),
  Qm = Hv("em");
function gf(e) {
  return Object.keys(e).reduce(
    (t, n) => (e[n] !== void 0 && (t[n] = e[n]), t),
    {}
  );
}
function Wv(e) {
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
function no(e) {
  return Array.isArray(e) || e === null
    ? !1
    : typeof e == "object"
    ? e.type !== x.Fragment
    : !1;
}
function br(e) {
  const t = x.createContext(null);
  return [
    ({ children: o, value: s }) => g.jsx(t.Provider, { value: s, children: o }),
    () => {
      const o = x.useContext(t);
      if (o === null) throw new Error(e);
      return o;
    },
  ];
}
function yf(e = null) {
  const t = x.createContext(e);
  return [
    ({ children: o, value: s }) => g.jsx(t.Provider, { value: s, children: o }),
    () => x.useContext(t),
  ];
}
const Wb = { app: 100, modal: 200, popover: 300, overlay: 400, max: 9999 };
function ro(e) {
  return Wb[e];
}
const Ub = () => {};
function Yb(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active
    ? t.onKeyDown || Ub
    : (n) => {
        var r;
        n.key === "Escape" && (e(n), (r = t.onTrigger) == null || r.call(t));
      };
}
function Pe(e, t = "size", n = !0) {
  if (e !== void 0) return Wv(e) ? (n ? z(e) : e) : `var(--${t}-${e})`;
}
function xa(e) {
  return Pe(e, "mantine-spacing");
}
function Rn(e) {
  return e === void 0
    ? "var(--mantine-radius-default)"
    : Pe(e, "mantine-radius");
}
function ot(e) {
  return Pe(e, "mantine-font-size");
}
function qb(e) {
  return Pe(e, "mantine-line-height", !1);
}
function vf(e) {
  if (e) return Pe(e, "mantine-shadow", !1);
}
function Vl(e, t) {
  return (n) => {
    e == null || e(n), t == null || t(n);
  };
}
function Kb(e, t, n) {
  return t === void 0 && n === void 0
    ? e
    : t !== void 0 && n === void 0
    ? Math.max(e, t)
    : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Uv() {
  return `mantine-${Math.random().toString(36).slice(2, 11)}`;
}
function Jm(e) {
  return typeof e != "string" ? "" : e.charAt(0).toUpperCase() + e.slice(1);
}
function Nr(e) {
  const t = x.useRef(e);
  return (
    x.useEffect(() => {
      t.current = e;
    }),
    x.useMemo(
      () =>
        (...n) => {
          var r;
          return (r = t.current) == null ? void 0 : r.call(t, ...n);
        },
      []
    )
  );
}
function Sa(e, t) {
  const n = Nr(e),
    r = x.useRef(0);
  return (
    x.useEffect(() => () => window.clearTimeout(r.current), []),
    x.useCallback(
      (...o) => {
        window.clearTimeout(r.current),
          (r.current = window.setTimeout(() => n(...o), t));
      },
      [n, t]
    )
  );
}
const Zm = ["mousedown", "touchstart"];
function Gb(e, t, n) {
  const r = x.useRef();
  return (
    x.useEffect(() => {
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
        (t || Zm).forEach((s) => document.addEventListener(s, o)),
        () => {
          (t || Zm).forEach((s) => document.removeEventListener(s, o));
        }
      );
    }, [r, e, n]),
    r
  );
}
function Xb(e, t) {
  try {
    return (
      e.addEventListener("change", t), () => e.removeEventListener("change", t)
    );
  } catch {
    return e.addListener(t), () => e.removeListener(t);
  }
}
function Qb(e, t) {
  return typeof window < "u" && "matchMedia" in window
    ? window.matchMedia(e).matches
    : !1;
}
function Jb(
  e,
  t,
  { getInitialValueInEffect: n } = { getInitialValueInEffect: !0 }
) {
  const [r, o] = x.useState(n ? t : Qb(e)),
    s = x.useRef();
  return (
    x.useEffect(() => {
      if ("matchMedia" in window)
        return (
          (s.current = window.matchMedia(e)),
          o(s.current.matches),
          Xb(s.current, (i) => o(i.matches))
        );
    }, [e]),
    r
  );
}
const vi = typeof document < "u" ? x.useLayoutEffect : x.useEffect;
function qr(e, t) {
  const n = x.useRef(!1);
  x.useEffect(
    () => () => {
      n.current = !1;
    },
    []
  ),
    x.useEffect(() => {
      if (n.current) return e();
      n.current = !0;
    }, t);
}
function Yv({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = x.useRef(),
    r = () => {
      var o;
      n.current &&
        "focus" in n.current &&
        typeof n.current.focus == "function" &&
        ((o = n.current) == null || o.focus({ preventScroll: !0 }));
    };
  return (
    qr(() => {
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
function Zb(e, t = "body > :not(script)") {
  const n = Uv(),
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
const eC = /input|select|textarea|button|object/,
  qv = "a, input, select, textarea, button, object, [tabindex]";
function tC(e) {
  return e.style.display === "none";
}
function nC(e) {
  if (
    e.getAttribute("aria-hidden") ||
    e.getAttribute("hidden") ||
    e.getAttribute("type") === "hidden"
  )
    return !1;
  let n = e;
  for (; n && !(n === document.body || n.nodeType === 11); ) {
    if (tC(n)) return !1;
    n = n.parentNode;
  }
  return !0;
}
function Kv(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function qu(e) {
  const t = e.nodeName.toLowerCase(),
    n = !Number.isNaN(Kv(e));
  return (
    ((eC.test(t) && !e.disabled) ||
      (e instanceof HTMLAnchorElement && e.href) ||
      n) &&
    nC(e)
  );
}
function Gv(e) {
  const t = Kv(e);
  return (Number.isNaN(t) || t >= 0) && qu(e);
}
function rC(e) {
  return Array.from(e.querySelectorAll(qv)).filter(Gv);
}
function oC(e, t) {
  const n = rC(e);
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
function sC(e = !0) {
  const t = x.useRef(),
    n = x.useRef(null),
    r = (s) => {
      let i = s.querySelector("[data-autofocus]");
      if (!i) {
        const l = Array.from(s.querySelectorAll(qv));
        (i = l.find(Gv) || l.find(qu) || null), !i && qu(s) && (i = s);
      }
      i && i.focus({ preventScroll: !0 });
    },
    o = x.useCallback(
      (s) => {
        if (e) {
          if (s === null) {
            n.current && (n.current(), (n.current = null));
            return;
          }
          (n.current = Zb(s)),
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
    x.useEffect(() => {
      if (!e) return;
      t.current && setTimeout(() => r(t.current));
      const s = (i) => {
        i.key === "Tab" && t.current && oC(t.current, i);
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
const iC = ra.useId || (() => {});
function lC() {
  const e = iC();
  return e ? `mantine-${e.replace(/:/g, "")}` : "";
}
function Cr(e) {
  const t = lC(),
    [n, r] = x.useState(t);
  return (
    vi(() => {
      r(Uv());
    }, []),
    typeof e == "string" ? e : typeof window > "u" ? t : n
  );
}
function aC(e, t, n) {
  x.useEffect(
    () => (
      window.addEventListener(e, t, n),
      () => window.removeEventListener(e, t, n)
    ),
    [e, t]
  );
}
function wf(e, t) {
  typeof e == "function"
    ? e(t)
    : typeof e == "object" && e !== null && "current" in e && (e.current = t);
}
function Xv(...e) {
  return (t) => {
    e.forEach((n) => wf(n, t));
  };
}
function Mt(...e) {
  return x.useCallback(Xv(...e), e);
}
function sn({
  value: e,
  defaultValue: t,
  finalValue: n,
  onChange: r = () => {},
}) {
  const [o, s] = x.useState(t !== void 0 ? t : n),
    i = (l, ...a) => {
      s(l), r == null || r(l, ...a);
    };
  return e !== void 0 ? [e, r, !0] : [o, i, !1];
}
function xf(e, t) {
  return Jb("(prefers-reduced-motion: reduce)", e, t);
}
function si(e = !1, t) {
  const { onOpen: n, onClose: r } = t || {},
    [o, s] = x.useState(e),
    i = x.useCallback(() => {
      s((c) => c || (n == null || n(), !0));
    }, [n]),
    l = x.useCallback(() => {
      s((c) => c && (r == null || r(), !1));
    }, [r]),
    a = x.useCallback(() => {
      o ? l() : i();
    }, [l, i, o]);
  return [o, { open: i, close: l, toggle: a }];
}
var cC = {};
function uC() {
  return typeof process < "u" && cC ? "production" : "development";
}
function Qv(e) {
  var t,
    n,
    r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (n = Qv(e[t])) && (r && (r += " "), (r += n));
    } else for (n in e) e[n] && (r && (r += " "), (r += n));
  return r;
}
function ft() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = Qv(e)) && (r && (r += " "), (r += t));
  return r;
}
const dC = {};
function fC(e) {
  const t = {};
  return (
    e.forEach((n) => {
      Object.entries(n).forEach(([r, o]) => {
        t[r] ? (t[r] = ft(t[r], o)) : (t[r] = o);
      });
    }),
    t
  );
}
function ba({ theme: e, classNames: t, props: n, stylesCtx: r }) {
  const s = (Array.isArray(t) ? t : [t]).map((i) =>
    typeof i == "function" ? i(e, n, r) : i || dC
  );
  return fC(s);
}
function Hl({ theme: e, styles: t, props: n, stylesCtx: r }) {
  return (Array.isArray(t) ? t : [t]).reduce(
    (s, i) =>
      typeof i == "function" ? { ...s, ...i(e, n, r) } : { ...s, ...i },
    {}
  );
}
const Jv = x.createContext(null);
function oo() {
  const e = x.useContext(Jv);
  if (!e)
    throw new Error("[@mantine/core] MantineProvider was not found in tree");
  return e;
}
function pC() {
  return oo().cssVariablesResolver;
}
function mC() {
  return oo().classNamesPrefix;
}
function Sf() {
  return oo().getStyleNonce;
}
function hC() {
  return oo().withStaticClasses;
}
function gC() {
  return oo().headless;
}
function yC() {
  var e;
  return (e = oo().stylesTransform) == null ? void 0 : e.sx;
}
function vC() {
  var e;
  return (e = oo().stylesTransform) == null ? void 0 : e.styles;
}
function wC(e) {
  return /^#?([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(e);
}
function xC(e) {
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
function SC(e) {
  const [t, n, r, o] = e
    .replace(/[^0-9,./]/g, "")
    .split(/[/,]/)
    .map(Number);
  return { r: t, g: n, b: r, a: o || 1 };
}
function bC(e) {
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
  let d, f, p;
  return (
    a >= 0 && a < 1
      ? ((d = l), (f = c), (p = 0))
      : a >= 1 && a < 2
      ? ((d = c), (f = l), (p = 0))
      : a >= 2 && a < 3
      ? ((d = 0), (f = l), (p = c))
      : a >= 3 && a < 4
      ? ((d = 0), (f = c), (p = l))
      : a >= 4 && a < 5
      ? ((d = c), (f = 0), (p = l))
      : ((d = l), (f = 0), (p = c)),
    {
      r: Math.round((d + u) * 255),
      g: Math.round((f + u) * 255),
      b: Math.round((p + u) * 255),
      a: i || 1,
    }
  );
}
function bf(e) {
  return wC(e)
    ? xC(e)
    : e.startsWith("rgb")
    ? SC(e)
    : e.startsWith("hsl")
    ? bC(e)
    : { r: 0, g: 0, b: 0, a: 1 };
}
function qi(e, t) {
  if (e.startsWith("var("))
    return `color-mix(in srgb, ${e}, black ${t * 100}%)`;
  const { r: n, g: r, b: o, a: s } = bf(e),
    i = 1 - t,
    l = (a) => Math.round(a * i);
  return `rgba(${l(n)}, ${l(r)}, ${l(o)}, ${s})`;
}
function ii(e, t) {
  return typeof e.primaryShade == "number"
    ? e.primaryShade
    : t === "dark"
    ? e.primaryShade.dark
    : e.primaryShade.light;
}
function Ic(e) {
  return e <= 0.03928 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4;
}
function CC(e) {
  const t = e.match(/oklch\((.*?)%\s/);
  return t ? parseFloat(t[1]) : null;
}
function EC(e) {
  if (e.startsWith("oklch(")) return (CC(e) || 0) / 100;
  const { r: t, g: n, b: r } = bf(e),
    o = t / 255,
    s = n / 255,
    i = r / 255,
    l = Ic(o),
    a = Ic(s),
    c = Ic(i);
  return 0.2126 * l + 0.7152 * a + 0.0722 * c;
}
function Cs(e, t = 0.179) {
  return e.startsWith("var(") ? !1 : EC(e) > t;
}
function ns({ color: e, theme: t, colorScheme: n }) {
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
      isLight: Cs(n === "dark" ? t.white : t.black, t.luminanceThreshold),
      variable: "--mantine-color-bright",
    };
  if (e === "dimmed")
    return {
      color: e,
      value: n === "dark" ? t.colors.dark[2] : t.colors.gray[7],
      shade: void 0,
      isThemeColor: !1,
      isLight: Cs(
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
      isLight: Cs(e === "white" ? t.white : t.black, t.luminanceThreshold),
      variable: `--mantine-color-${e}`,
    };
  const [r, o] = e.split("."),
    s = o ? Number(o) : void 0,
    i = r in t.colors;
  if (i) {
    const l = s !== void 0 ? t.colors[r][s] : t.colors[r][ii(t, n || "light")];
    return {
      color: r,
      value: l,
      shade: s,
      isThemeColor: i,
      isLight: Cs(l, t.luminanceThreshold),
      variable: o ? `--mantine-color-${r}-${s}` : `--mantine-color-${r}-filled`,
    };
  }
  return {
    color: e,
    value: e,
    isThemeColor: i,
    isLight: Cs(e, t.luminanceThreshold),
    shade: s,
    variable: void 0,
  };
}
function qo(e, t) {
  const n = ns({ color: e || t.primaryColor, theme: t });
  return n.variable ? `var(${n.variable})` : e;
}
function Ku(e, t) {
  const n = {
      from: (e == null ? void 0 : e.from) || t.defaultGradient.from,
      to: (e == null ? void 0 : e.to) || t.defaultGradient.to,
      deg: (e == null ? void 0 : e.deg) || t.defaultGradient.deg || 0,
    },
    r = qo(n.from, t),
    o = qo(n.to, t);
  return `linear-gradient(${n.deg}deg, ${r} 0%, ${o} 100%)`;
}
function wn(e, t) {
  if (typeof e != "string" || t > 1 || t < 0) return "rgba(0, 0, 0, 1)";
  if (e.startsWith("var(")) {
    const s = (1 - t) * 100;
    return `color-mix(in srgb, ${e}, transparent ${s}%)`;
  }
  if (e.startsWith("oklch"))
    return e.includes("/")
      ? e.replace(/\/\s*[\d.]+\s*\)/, `/ ${t})`)
      : e.replace(")", ` / ${t})`);
  const { r: n, g: r, b: o } = bf(e);
  return `rgba(${n}, ${r}, ${o}, ${t})`;
}
const mo = wn,
  _C = ({ color: e, theme: t, variant: n, gradient: r, autoContrast: o }) => {
    const s = ns({ color: e, theme: t }),
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
            hover: qi(e, 0.1),
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
          background: wn(l, 0.1),
          hover: wn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: wn(e, 0.1),
        hover: wn(e, 0.12),
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
              hover: wn(t.colors[s.color][s.shade], 0.05),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid var(--mantine-color-${s.color}-${
                s.shade
              })`,
            }
        : {
            background: "transparent",
            hover: wn(e, 0.05),
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
          hover: wn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: "transparent",
        hover: wn(e, 0.12),
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
              hover: qi(t.white, 0.01),
              color: `var(--mantine-color-${e}-filled)`,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: "var(--mantine-color-white)",
              hover: qi(t.white, 0.01),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: "var(--mantine-color-white)",
            hover: qi(t.white, 0.01),
            color: e,
            border: `${z(1)} solid transparent`,
          }
      : n === "gradient"
      ? {
          background: Ku(r, t),
          hover: Ku(r, t),
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
  kC = {
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
  eh =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
  Cf = {
    scale: 1,
    fontSmoothing: !0,
    focusRing: "auto",
    white: "#fff",
    black: "#000",
    colors: kC,
    primaryShade: { light: 6, dark: 8 },
    primaryColor: "blue",
    variantColorResolver: _C,
    autoContrast: !1,
    luminanceThreshold: 0.3,
    fontFamily: eh,
    fontFamilyMonospace:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    respectReducedMotion: !1,
    cursorType: "default",
    defaultGradient: { from: "blue", to: "cyan", deg: 45 },
    defaultRadius: "sm",
    activeClassName: "mantine-active",
    focusClassName: "",
    headings: {
      fontFamily: eh,
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
function th(e) {
  return e === "auto" || e === "dark" || e === "light";
}
function RC({ key: e = "mantine-color-scheme-value" } = {}) {
  let t;
  return {
    get: (n) => {
      if (typeof window > "u") return n;
      try {
        const r = window.localStorage.getItem(e);
        return th(r) ? r : n;
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
          th(r.newValue) &&
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
const DC =
    "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color",
  nh =
    "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
function zc(e) {
  return e < 0 || e > 9 ? !1 : parseInt(e.toString(), 10) === e;
}
function rh(e) {
  if (!(e.primaryColor in e.colors)) throw new Error(DC);
  if (
    typeof e.primaryShade == "object" &&
    (!zc(e.primaryShade.dark) || !zc(e.primaryShade.light))
  )
    throw new Error(nh);
  if (typeof e.primaryShade == "number" && !zc(e.primaryShade))
    throw new Error(nh);
}
function PC(e, t) {
  var r;
  if (!t) return rh(e), e;
  const n = hf(e, t);
  return (
    t.fontFamily &&
      !((r = t.headings) != null && r.fontFamily) &&
      (n.headings.fontFamily = t.fontFamily),
    rh(n),
    n
  );
}
const Ef = x.createContext(null),
  TC = () => x.useContext(Ef) || Cf;
function Dn() {
  const e = x.useContext(Ef);
  if (!e)
    throw new Error(
      "@mantine/core: MantineProvider was not found in component tree, make sure you have it in your app"
    );
  return e;
}
function Zv({ theme: e, children: t, inherit: n = !0 }) {
  const r = TC(),
    o = x.useMemo(() => PC(n ? r : Cf, e), [e, r, n]);
  return g.jsx(Ef.Provider, { value: o, children: t });
}
Zv.displayName = "@mantine/core/MantineThemeProvider";
function NC() {
  const e = Dn(),
    t = Sf(),
    n = _n(e.breakpoints).reduce((r, o) => {
      const s = e.breakpoints[o].includes("px"),
        i = Hb(e.breakpoints[o]),
        l = s ? `${i - 0.1}px` : Qm(i - 0.1),
        a = s ? `${i}px` : Qm(i);
      return `${r}@media (max-width: ${l}) {.mantine-visible-from-${o} {display: none !important;}}@media (min-width: ${a}) {.mantine-hidden-from-${o} {display: none !important;}}`;
    }, "");
  return g.jsx("style", {
    "data-mantine-styles": "classes",
    nonce: t == null ? void 0 : t(),
    dangerouslySetInnerHTML: { __html: n },
  });
}
function Bc(e) {
  return Object.entries(e)
    .map(([t, n]) => `${t}: ${n};`)
    .join("");
}
function Vc(e, t) {
  return (Array.isArray(e) ? e : [e]).reduce((r, o) => `${o}{${r}}`, t);
}
function OC(e, t) {
  const n = Bc(e.variables),
    r = n ? Vc(t, n) : "",
    o = Bc(e.dark),
    s = o ? Vc(`${t}[data-mantine-color-scheme="dark"]`, o) : "",
    i = Bc(e.light),
    l = i ? Vc(`${t}[data-mantine-color-scheme="light"]`, i) : "";
  return `${r}${s}${l}`;
}
function e0({ color: e, theme: t, autoContrast: n }) {
  return (typeof n == "boolean" ? n : t.autoContrast) &&
    ns({ color: e || t.primaryColor, theme: t }).isLight
    ? "var(--mantine-color-black)"
    : "var(--mantine-color-white)";
}
function oh(e, t) {
  return e0({
    color: e.colors[e.primaryColor][ii(e, t)],
    theme: e,
    autoContrast: null,
  });
}
function Ki({
  theme: e,
  color: t,
  colorScheme: n,
  name: r = t,
  withColorValues: o = !0,
}) {
  if (!e.colors[t]) return {};
  if (n === "light") {
    const l = ii(e, "light"),
      a = {
        [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-filled)`,
        [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
          l === 9 ? 8 : l + 1
        })`,
        [`--mantine-color-${r}-light`]: mo(e.colors[t][l], 0.1),
        [`--mantine-color-${r}-light-hover`]: mo(e.colors[t][l], 0.12),
        [`--mantine-color-${r}-light-color`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline-hover`]: mo(e.colors[t][l], 0.05),
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
  const s = ii(e, "dark"),
    i = {
      [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-4)`,
      [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${s})`,
      [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
        s === 9 ? 8 : s + 1
      })`,
      [`--mantine-color-${r}-light`]: mo(e.colors[t][Math.max(0, s - 2)], 0.15),
      [`--mantine-color-${r}-light-hover`]: mo(
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
      [`--mantine-color-${r}-outline-hover`]: mo(
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
function jC(e) {
  return !!e && typeof e == "object" && "mantine-virtual-color" in e;
}
function ho(e, t, n) {
  _n(t).forEach((r) => Object.assign(e, { [`--mantine-${n}-${r}`]: t[r] }));
}
const t0 = (e) => {
  const t = ii(e, "light"),
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
        "--mantine-primary-color-contrast": oh(e, "light"),
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
        "--mantine-primary-color-contrast": oh(e, "dark"),
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
  ho(r.variables, e.breakpoints, "breakpoint"),
    ho(r.variables, e.spacing, "spacing"),
    ho(r.variables, e.fontSizes, "font-size"),
    ho(r.variables, e.lineHeights, "line-height"),
    ho(r.variables, e.shadows, "shadow"),
    ho(r.variables, e.radius, "radius"),
    e.colors[e.primaryColor].forEach((s, i) => {
      r.variables[
        `--mantine-primary-color-${i}`
      ] = `var(--mantine-color-${e.primaryColor}-${i})`;
    }),
    _n(e.colors).forEach((s) => {
      const i = e.colors[s];
      if (jC(i)) {
        Object.assign(
          r.light,
          Ki({
            theme: e,
            name: i.name,
            color: i.light,
            colorScheme: "light",
            withColorValues: !0,
          })
        ),
          Object.assign(
            r.dark,
            Ki({
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
          Ki({ theme: e, color: s, colorScheme: "light", withColorValues: !1 })
        ),
        Object.assign(
          r.dark,
          Ki({ theme: e, color: s, colorScheme: "dark", withColorValues: !1 })
        );
    });
  const o = e.headings.sizes;
  return (
    _n(o).forEach((s) => {
      (r.variables[`--mantine-${s}-font-size`] = o[s].fontSize),
        (r.variables[`--mantine-${s}-line-height`] = o[s].lineHeight),
        (r.variables[`--mantine-${s}-font-weight`] =
          o[s].fontWeight || e.headings.fontWeight);
    }),
    r
  );
};
function $C({ theme: e, generator: t }) {
  const n = t0(e),
    r = t == null ? void 0 : t(e);
  return r ? hf(n, r) : n;
}
const Hc = t0(Cf);
function LC(e) {
  const t = { variables: {}, light: {}, dark: {} };
  return (
    _n(e.variables).forEach((n) => {
      Hc.variables[n] !== e.variables[n] && (t.variables[n] = e.variables[n]);
    }),
    _n(e.light).forEach((n) => {
      Hc.light[n] !== e.light[n] && (t.light[n] = e.light[n]);
    }),
    _n(e.dark).forEach((n) => {
      Hc.dark[n] !== e.dark[n] && (t.dark[n] = e.dark[n]);
    }),
    t
  );
}
function AC(e) {
  return `
  ${e}[data-mantine-color-scheme="dark"] { --mantine-color-scheme: dark; }
  ${e}[data-mantine-color-scheme="light"] { --mantine-color-scheme: light; }
`;
}
function n0({ cssVariablesSelector: e, deduplicateCssVariables: t }) {
  const n = Dn(),
    r = Sf(),
    o = pC(),
    s = $C({ theme: n, generator: o }),
    i = e === ":root" && t,
    l = i ? LC(s) : s,
    a = OC(l, e);
  return a
    ? g.jsx("style", {
        "data-mantine-styles": !0,
        nonce: r == null ? void 0 : r(),
        dangerouslySetInnerHTML: { __html: `${a}${i ? "" : AC(e)}` },
      })
    : null;
}
n0.displayName = "@mantine/CssVariables";
function FC() {
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
function go(e, t) {
  var r;
  const n =
    e !== "auto"
      ? e
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  (r = t()) == null || r.setAttribute("data-mantine-color-scheme", n);
}
function MC({
  manager: e,
  defaultColorScheme: t,
  getRootElement: n,
  forceColorScheme: r,
}) {
  const o = x.useRef(),
    [s, i] = x.useState(() => e.get(t)),
    l = r || s,
    a = x.useCallback(
      (u) => {
        r || (go(u, n), i(u), e.set(u));
      },
      [e.set, l, r]
    ),
    c = x.useCallback(() => {
      i(t), go(t, n), e.clear();
    }, [e.clear, t]);
  return (
    x.useEffect(
      () => (e.subscribe(a), e.unsubscribe),
      [e.subscribe, e.unsubscribe]
    ),
    vi(() => {
      go(e.get(t), n);
    }, []),
    x.useEffect(() => {
      var d;
      if (r) return go(r, n), () => {};
      r === void 0 && go(s, n),
        (o.current = window.matchMedia("(prefers-color-scheme: dark)"));
      const u = (f) => {
        s === "auto" && go(f.matches ? "dark" : "light", n);
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
function IC({ respectReducedMotion: e, getRootElement: t }) {
  vi(() => {
    var n;
    e &&
      ((n = t()) == null ||
        n.setAttribute("data-respect-reduced-motion", "true"));
  }, [e]);
}
FC();
function r0({
  theme: e,
  children: t,
  getStyleNonce: n,
  withStaticClasses: r = !0,
  withGlobalClasses: o = !0,
  deduplicateCssVariables: s = !0,
  withCssVariables: i = !0,
  cssVariablesSelector: l = ":root",
  classNamesPrefix: a = "mantine",
  colorSchemeManager: c = RC(),
  defaultColorScheme: u = "light",
  getRootElement: d = () => document.documentElement,
  cssVariablesResolver: f,
  forceColorScheme: p,
  stylesTransform: m,
}) {
  const {
    colorScheme: h,
    setColorScheme: S,
    clearColorScheme: v,
  } = MC({
    defaultColorScheme: u,
    forceColorScheme: p,
    manager: c,
    getRootElement: d,
  });
  return (
    IC({
      respectReducedMotion: (e == null ? void 0 : e.respectReducedMotion) || !1,
      getRootElement: d,
    }),
    g.jsx(Jv.Provider, {
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
        stylesTransform: m,
      },
      children: g.jsxs(Zv, {
        theme: e,
        children: [
          i &&
            g.jsx(n0, { cssVariablesSelector: l, deduplicateCssVariables: s }),
          o && g.jsx(NC, {}),
          t,
        ],
      }),
    })
  );
}
r0.displayName = "@mantine/core/MantineProvider";
function so({ classNames: e, styles: t, props: n, stylesCtx: r }) {
  const o = Dn();
  return {
    resolvedClassNames: ba({
      theme: o,
      classNames: e,
      props: n,
      stylesCtx: r || void 0,
    }),
    resolvedStyles: Hl({
      theme: o,
      styles: t,
      props: n,
      stylesCtx: r || void 0,
    }),
  };
}
const zC = {
  always: "mantine-focus-always",
  auto: "mantine-focus-auto",
  never: "mantine-focus-never",
};
function BC({ theme: e, options: t, unstyled: n }) {
  return ft(
    (t == null ? void 0 : t.focusable) &&
      !n &&
      (e.focusClassName || zC[e.focusRing]),
    (t == null ? void 0 : t.active) && !n && e.activeClassName
  );
}
function VC({ selector: e, stylesCtx: t, options: n, props: r, theme: o }) {
  return ba({
    theme: o,
    classNames: n == null ? void 0 : n.classNames,
    props: (n == null ? void 0 : n.props) || r,
    stylesCtx: t,
  })[e];
}
function sh({ selector: e, stylesCtx: t, theme: n, classNames: r, props: o }) {
  return ba({ theme: n, classNames: r, props: o, stylesCtx: t })[e];
}
function HC({ rootSelector: e, selector: t, className: n }) {
  return e === t ? n : void 0;
}
function WC({ selector: e, classes: t, unstyled: n }) {
  return n ? void 0 : t[e];
}
function UC({
  themeName: e,
  classNamesPrefix: t,
  selector: n,
  withStaticClass: r,
}) {
  return r === !1 ? [] : e.map((o) => `${t}-${o}-${n}`);
}
function YC({ themeName: e, theme: t, selector: n, props: r, stylesCtx: o }) {
  return e.map((s) => {
    var i, l;
    return (l = ba({
      theme: t,
      classNames: (i = t.components[s]) == null ? void 0 : i.classNames,
      props: r,
      stylesCtx: o,
    })) == null
      ? void 0
      : l[n];
  });
}
function qC({ options: e, classes: t, selector: n, unstyled: r }) {
  return e != null && e.variant && !r ? t[`${n}--${e.variant}`] : void 0;
}
function KC({
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
  headless: p,
  transformedStyles: m,
}) {
  return ft(
    BC({ theme: e, options: t, unstyled: l || p }),
    YC({ theme: e, themeName: n, selector: r, props: u, stylesCtx: d }),
    qC({ options: t, classes: i, selector: r, unstyled: l }),
    sh({ selector: r, stylesCtx: d, theme: e, classNames: s, props: u }),
    sh({ selector: r, stylesCtx: d, theme: e, classNames: m, props: u }),
    VC({ selector: r, stylesCtx: d, options: t, props: u, theme: e }),
    HC({ rootSelector: c, selector: r, className: a }),
    WC({ selector: r, classes: i, unstyled: l || p }),
    f &&
      !p &&
      UC({
        themeName: n,
        classNamesPrefix: o,
        selector: r,
        withStaticClass: t == null ? void 0 : t.withStaticClass,
      }),
    t == null ? void 0 : t.className
  );
}
function GC({ theme: e, themeName: t, props: n, stylesCtx: r, selector: o }) {
  return t
    .map((s) => {
      var i;
      return Hl({
        theme: e,
        styles: (i = e.components[s]) == null ? void 0 : i.styles,
        props: n,
        stylesCtx: r,
      })[o];
    })
    .reduce((s, i) => ({ ...s, ...i }), {});
}
function Gu({ style: e, theme: t }) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...Gu({ style: r, theme: t }) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function XC(e) {
  return e.reduce(
    (t, n) => (
      n &&
        Object.keys(n).forEach((r) => {
          t[r] = { ...t[r], ...gf(n[r]) };
        }),
      t
    ),
    {}
  );
}
function QC({
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
  return (a = XC([
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
function JC({
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
      GC({ theme: e, themeName: t, props: o, stylesCtx: s, selector: n })),
    ...(!f && Hl({ theme: e, styles: l, props: o, stylesCtx: s })[n]),
    ...(!f &&
      Hl({
        theme: e,
        styles: r == null ? void 0 : r.styles,
        props: (r == null ? void 0 : r.props) || o,
        stylesCtx: s,
      })[n]),
    ...QC({
      theme: e,
      props: o,
      stylesCtx: s,
      vars: c,
      varsResolver: u,
      selector: n,
      themeName: t,
      headless: d,
    }),
    ...(i === n ? Gu({ style: a, theme: e }) : null),
    ...Gu({ style: r == null ? void 0 : r.style, theme: e }),
  };
}
function ZC({ props: e, stylesCtx: t, themeName: n }) {
  var i;
  const r = Dn(),
    o = (i = vC()) == null ? void 0 : i();
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
function de({
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
  const f = Dn(),
    p = mC(),
    m = hC(),
    h = gC(),
    S = (Array.isArray(e) ? e : [e]).filter((y) => y),
    { withStylesTransform: v, getTransformedStyles: w } = ZC({
      props: n,
      stylesCtx: r,
      themeName: S,
    });
  return (y, b) => ({
    className: KC({
      theme: f,
      options: b,
      themeName: S,
      selector: y,
      classNamesPrefix: p,
      classNames: a,
      classes: t,
      unstyled: l,
      className: o,
      rootSelector: i,
      props: n,
      stylesCtx: r,
      withStaticClasses: m,
      headless: h,
      transformedStyles: w([b == null ? void 0 : b.styles, c]),
    }),
    style: JC({
      theme: f,
      themeName: S,
      selector: y,
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
function eE(e, t) {
  return typeof e == "boolean" ? e : t.autoContrast;
}
function W(e, t, n) {
  var i;
  const r = Dn(),
    o = (i = r.components[e]) == null ? void 0 : i.defaultProps,
    s = typeof o == "function" ? o(r) : o;
  return { ...t, ...s, ...gf(n) };
}
function ih(e) {
  return _n(e)
    .reduce((t, n) => (e[n] !== void 0 ? `${t}${Bb(n)}:${e[n]};` : t), "")
    .trim();
}
function tE({ selector: e, styles: t, media: n }) {
  const r = t ? ih(t) : "",
    o = Array.isArray(n)
      ? n.map((s) => `@media${s.query}{${e}{${ih(s.styles)}}}`)
      : [];
  return `${r ? `${e}{${r}}` : ""}${o.join("")}`.trim();
}
function nE({ selector: e, styles: t, media: n }) {
  const r = Sf();
  return g.jsx("style", {
    "data-mantine-styles": "inline",
    nonce: r == null ? void 0 : r(),
    dangerouslySetInnerHTML: {
      __html: tE({ selector: e, styles: t, media: n }),
    },
  });
}
function rs(e) {
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
    pt: p,
    pb: m,
    pl: h,
    pr: S,
    pe: v,
    ps: w,
    bg: y,
    c: b,
    opacity: E,
    ff: C,
    fz: R,
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
    h: k,
    mih: _,
    mah: $,
    bgsz: O,
    bgp: I,
    bgr: q,
    bga: Q,
    pos: ee,
    top: ne,
    left: te,
    bottom: me,
    right: oe,
    inset: le,
    display: Z,
    flex: he,
    hiddenFrom: ae,
    visibleFrom: se,
    lightHidden: ke,
    darkHidden: Ie,
    sx: ve,
    ...Ke
  } = e;
  return {
    styleProps: gf({
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
      pt: p,
      pb: m,
      pl: h,
      pr: S,
      pe: v,
      ps: w,
      bg: y,
      c: b,
      opacity: E,
      ff: C,
      fz: R,
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
      h: k,
      mih: _,
      mah: $,
      bgsz: O,
      bgp: I,
      bgr: q,
      bga: Q,
      pos: ee,
      top: ne,
      left: te,
      bottom: me,
      right: oe,
      inset: le,
      display: Z,
      flex: he,
      hiddenFrom: ae,
      visibleFrom: se,
      lightHidden: ke,
      darkHidden: Ie,
      sx: ve,
    }),
    rest: Ke,
  };
}
const rE = {
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
function o0(e, t) {
  const n = ns({ color: e, theme: t });
  return n.color === "dimmed"
    ? "var(--mantine-color-dimmed)"
    : n.color === "bright"
    ? "var(--mantine-color-bright)"
    : n.variable
    ? `var(${n.variable})`
    : n.color;
}
function oE(e, t) {
  const n = ns({ color: e, theme: t });
  return n.isThemeColor && n.shade === void 0
    ? `var(--mantine-color-${n.color}-text)`
    : o0(e, t);
}
const lh = {
  text: "var(--mantine-font-family)",
  mono: "var(--mantine-font-family-monospace)",
  monospace: "var(--mantine-font-family-monospace)",
  heading: "var(--mantine-font-family-headings)",
  headings: "var(--mantine-font-family-headings)",
};
function sE(e) {
  return typeof e == "string" && e in lh ? lh[e] : e;
}
const iE = ["h1", "h2", "h3", "h4", "h5", "h6"];
function lE(e, t) {
  return typeof e == "string" && e in t.fontSizes
    ? `var(--mantine-font-size-${e})`
    : typeof e == "string" && iE.includes(e)
    ? `var(--mantine-${e}-font-size)`
    : typeof e == "number" || typeof e == "string"
    ? z(e)
    : e;
}
function aE(e) {
  return e;
}
const cE = ["h1", "h2", "h3", "h4", "h5", "h6"];
function uE(e, t) {
  return typeof e == "string" && e in t.lineHeights
    ? `var(--mantine-line-height-${e})`
    : typeof e == "string" && cE.includes(e)
    ? `var(--mantine-${e}-line-height)`
    : e;
}
function dE(e) {
  return typeof e == "number" ? z(e) : e;
}
function fE(e, t) {
  if (typeof e == "number") return z(e);
  if (typeof e == "string") {
    const n = e.replace("-", "");
    if (!(n in t.spacing)) return z(e);
    const r = `--mantine-spacing-${n}`;
    return e.startsWith("-") ? `calc(var(${r}) * -1)` : `var(${r})`;
  }
  return e;
}
const Wc = {
  color: o0,
  textColor: oE,
  fontSize: lE,
  spacing: fE,
  identity: aE,
  size: dE,
  lineHeight: uE,
  fontFamily: sE,
};
function ah(e) {
  return e.replace("(min-width: ", "").replace("em)", "");
}
function pE({ media: e, ...t }) {
  const r = Object.keys(e)
    .sort((o, s) => Number(ah(o)) - Number(ah(s)))
    .map((o) => ({ query: o, styles: e[o] }));
  return { ...t, media: r };
}
function mE(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.keys(e);
  return !(t.length === 1 && t[0] === "base");
}
function hE(e) {
  return typeof e == "object" && e !== null
    ? "base" in e
      ? e.base
      : void 0
    : e;
}
function gE(e) {
  return typeof e == "object" && e !== null
    ? _n(e).filter((t) => t !== "base")
    : [];
}
function yE(e, t) {
  return typeof e == "object" && e !== null && t in e ? e[t] : e;
}
function vE({ styleProps: e, data: t, theme: n }) {
  return pE(
    _n(e).reduce(
      (r, o) => {
        if (o === "hiddenFrom" || o === "visibleFrom" || o === "sx") return r;
        const s = t[o],
          i = Array.isArray(s.property) ? s.property : [s.property],
          l = hE(e[o]);
        if (!mE(e[o]))
          return (
            i.forEach((c) => {
              r.inlineStyles[c] = Wc[s.type](l, n);
            }),
            r
          );
        r.hasResponsiveStyles = !0;
        const a = gE(e[o]);
        return (
          i.forEach((c) => {
            l && (r.styles[c] = Wc[s.type](l, n)),
              a.forEach((u) => {
                const d = `(min-width: ${n.breakpoints[u]})`;
                r.media[d] = { ...r.media[d], [c]: Wc[s.type](yE(e[o], u), n) };
              });
          }),
          r
        );
      },
      { hasResponsiveStyles: !1, styles: {}, inlineStyles: {}, media: {} }
    )
  );
}
function wE() {
  return `__m__-${x.useId().replace(/:/g, "")}`;
}
function s0(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...s0(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function i0(e) {
  return e.startsWith("data-") ? e : `data-${e}`;
}
function xE(e) {
  return Object.keys(e).reduce((t, n) => {
    const r = e[n];
    return (
      r === void 0 || r === "" || r === !1 || r === null || (t[i0(n)] = e[n]), t
    );
  }, {});
}
function l0(e) {
  return e
    ? typeof e == "string"
      ? { [i0(e)]: !0 }
      : Array.isArray(e)
      ? [...e].reduce((t, n) => ({ ...t, ...l0(n) }), {})
      : xE(e)
    : null;
}
function Xu(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...Xu(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function SE({ theme: e, style: t, vars: n, styleProps: r }) {
  const o = Xu(t, e),
    s = Xu(n, e);
  return { ...o, ...s, ...r };
}
const a0 = x.forwardRef(
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
    p
  ) => {
    var R;
    const m = Dn(),
      h = e || "div",
      { styleProps: S, rest: v } = rs(f),
      w = yC(),
      y = (R = w == null ? void 0 : w()) == null ? void 0 : R(S.sx),
      b = wE(),
      E = vE({ styleProps: S, theme: m, data: rE }),
      C = {
        ref: p,
        style: SE({ theme: m, style: t, vars: n, styleProps: E.inlineStyles }),
        className: ft(r, y, {
          [b]: E.hasResponsiveStyles,
          "mantine-light-hidden": c,
          "mantine-dark-hidden": u,
          [`mantine-hidden-from-${l}`]: l,
          [`mantine-visible-from-${a}`]: a,
        }),
        "data-variant": o,
        "data-size": Wv(i) ? void 0 : i || void 0,
        ...l0(s),
        ...v,
      };
    return g.jsxs(g.Fragment, {
      children: [
        E.hasResponsiveStyles &&
          g.jsx(nE, { selector: `.${b}`, styles: E.styles, media: E.media }),
        typeof d == "function" ? d(C) : g.jsx(h, { ...C }),
      ],
    });
  }
);
a0.displayName = "@mantine/core/Box";
const X = a0;
function c0(e) {
  return e;
}
function G(e) {
  const t = x.forwardRef(e);
  return (t.extend = c0), t;
}
function Un(e) {
  const t = x.forwardRef(e);
  return (t.extend = c0), t;
}
const bE = x.createContext({
  dir: "ltr",
  toggleDirection: () => {},
  setDirection: () => {},
});
function _f() {
  return x.useContext(bE);
}
function CE(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function Uc(e) {
  return e != null && e.current ? e.current.scrollHeight : "auto";
}
const Es = typeof window < "u" && window.requestAnimationFrame;
function EE({
  transitionDuration: e,
  transitionTimingFunction: t = "ease",
  onTransitionEnd: n = () => {},
  opened: r,
}) {
  const o = x.useRef(null),
    s = 0,
    i = { display: "none", height: 0, overflow: "hidden" },
    [l, a] = x.useState(r ? {} : i),
    c = (m) => {
      yi.flushSync(() => a(m));
    },
    u = (m) => {
      c((h) => ({ ...h, ...m }));
    };
  function d(m) {
    const h = e || CE(m);
    return { transition: `height ${h}ms ${t}, opacity ${h}ms ${t}` };
  }
  qr(() => {
    typeof Es == "function" &&
      Es(
        r
          ? () => {
              u({ willChange: "height", display: "block", overflow: "hidden" }),
                Es(() => {
                  const m = Uc(o);
                  u({ ...d(m), height: m });
                });
            }
          : () => {
              const m = Uc(o);
              u({ ...d(m), willChange: "height", height: m }),
                Es(() => u({ height: s, overflow: "hidden" }));
            }
      );
  }, [r]);
  const f = (m) => {
    if (!(m.target !== o.current || m.propertyName !== "height"))
      if (r) {
        const h = Uc(o);
        h === l.height ? c({}) : u({ height: h }), n();
      } else l.height === s && (c(i), n());
  };
  function p({ style: m = {}, refKey: h = "ref", ...S } = {}) {
    const v = S[h];
    return {
      "aria-hidden": !r,
      ...S,
      [h]: Xv(o, v),
      onTransitionEnd: f,
      style: { boxSizing: "border-box", ...m, ...l },
    };
  }
  return p;
}
const _E = {
    transitionDuration: 200,
    transitionTimingFunction: "ease",
    animateOpacity: !0,
  },
  u0 = G((e, t) => {
    const {
        children: n,
        in: r,
        transitionDuration: o,
        transitionTimingFunction: s,
        style: i,
        onTransitionEnd: l,
        animateOpacity: a,
        ...c
      } = W("Collapse", _E, e),
      u = Dn(),
      d = xf(),
      p = (u.respectReducedMotion ? d : !1) ? 0 : o,
      m = EE({
        opened: r,
        transitionDuration: p,
        transitionTimingFunction: s,
        onTransitionEnd: l,
      });
    return p === 0
      ? r
        ? g.jsx(X, { ...c, children: n })
        : null
      : g.jsx(X, {
          ...m({
            style: {
              opacity: r || !a ? 1 : 0,
              transition: a ? `opacity ${p}ms ${s}` : "none",
              ...s0(i, u),
            },
            ref: t,
            ...c,
          }),
          children: n,
        });
  });
u0.displayName = "@mantine/core/Collapse";
const [kE, qt] = br("ScrollArea.Root component was not found in tree");
function Ko(e, t) {
  const n = Nr(t);
  vi(() => {
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
const RE = x.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = qt(),
      [s, i] = x.useState(0),
      [l, a] = x.useState(0),
      c = !!(s && l);
    return (
      Ko(o.scrollbarX, () => {
        var d;
        const u = ((d = o.scrollbarX) == null ? void 0 : d.offsetHeight) || 0;
        o.onCornerHeightChange(u), a(u);
      }),
      Ko(o.scrollbarY, () => {
        var d;
        const u = ((d = o.scrollbarY) == null ? void 0 : d.offsetWidth) || 0;
        o.onCornerWidthChange(u), i(u);
      }),
      c
        ? g.jsx("div", { ...r, ref: t, style: { ...n, width: s, height: l } })
        : null
    );
  }),
  DE = x.forwardRef((e, t) => {
    const n = qt(),
      r = !!(n.scrollbarX && n.scrollbarY);
    return n.type !== "scroll" && r ? g.jsx(RE, { ...e, ref: t }) : null;
  }),
  PE = { scrollHideDelay: 1e3, type: "hover" },
  d0 = x.forwardRef((e, t) => {
    const n = W("ScrollAreaRoot", PE, e),
      { type: r, scrollHideDelay: o, scrollbars: s, ...i } = n,
      [l, a] = x.useState(null),
      [c, u] = x.useState(null),
      [d, f] = x.useState(null),
      [p, m] = x.useState(null),
      [h, S] = x.useState(null),
      [v, w] = x.useState(0),
      [y, b] = x.useState(0),
      [E, C] = x.useState(!1),
      [R, D] = x.useState(!1),
      L = Mt(t, (N) => a(N));
    return g.jsx(kE, {
      value: {
        type: r,
        scrollHideDelay: o,
        scrollArea: l,
        viewport: c,
        onViewportChange: u,
        content: d,
        onContentChange: f,
        scrollbarX: p,
        onScrollbarXChange: m,
        scrollbarXEnabled: E,
        onScrollbarXEnabledChange: C,
        scrollbarY: h,
        onScrollbarYChange: S,
        scrollbarYEnabled: R,
        onScrollbarYEnabledChange: D,
        onCornerWidthChange: w,
        onCornerHeightChange: b,
      },
      children: g.jsx(X, {
        ...i,
        ref: L,
        __vars: {
          "--sa-corner-width": s !== "xy" ? "0px" : `${v}px`,
          "--sa-corner-height": s !== "xy" ? "0px" : `${y}px`,
        },
      }),
    });
  });
d0.displayName = "@mantine/core/ScrollAreaRoot";
function f0(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function Ca(e) {
  const t = f0(e.viewport, e.content),
    n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd,
    r = (e.scrollbar.size - n) * t;
  return Math.max(r, 18);
}
function p0(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function TE(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function ch(e, t, n = "ltr") {
  const r = Ca(t),
    o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
    s = t.scrollbar.size - o,
    i = t.content - t.viewport,
    l = s - r,
    a = n === "ltr" ? [0, i] : [i * -1, 0],
    c = TE(e, a);
  return p0([0, i], [0, l])(c);
}
function NE(e, t, n, r = "ltr") {
  const o = Ca(n),
    s = o / 2,
    i = t || s,
    l = o - i,
    a = n.scrollbar.paddingStart + i,
    c = n.scrollbar.size - n.scrollbar.paddingEnd - l,
    u = n.content - n.viewport,
    d = r === "ltr" ? [0, u] : [u * -1, 0];
  return p0([a, c], d)(e);
}
function m0(e, t) {
  return e > 0 && e < t;
}
function Wl(e) {
  return e ? parseInt(e, 10) : 0;
}
function Ir(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (r) => {
    e == null || e(r), (n === !1 || !r.defaultPrevented) && (t == null || t(r));
  };
}
const [OE, h0] = br("ScrollAreaScrollbar was not found in tree"),
  g0 = x.forwardRef((e, t) => {
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
      f = qt(),
      [p, m] = x.useState(null),
      h = Mt(t, (D) => m(D)),
      S = x.useRef(null),
      v = x.useRef(""),
      { viewport: w } = f,
      y = n.content - n.viewport,
      b = Nr(c),
      E = Nr(l),
      C = Sa(u, 10),
      R = (D) => {
        if (S.current) {
          const L = D.clientX - S.current.left,
            N = D.clientY - S.current.top;
          a({ x: L, y: N });
        }
      };
    return (
      x.useEffect(() => {
        const D = (L) => {
          const N = L.target;
          (p == null ? void 0 : p.contains(N)) && b(L, y);
        };
        return (
          document.addEventListener("wheel", D, { passive: !1 }),
          () => document.removeEventListener("wheel", D, { passive: !1 })
        );
      }, [w, p, y, b]),
      x.useEffect(E, [n, E]),
      Ko(p, C),
      Ko(f.content, C),
      g.jsx(OE, {
        value: {
          scrollbar: p,
          hasThumb: r,
          onThumbChange: Nr(o),
          onThumbPointerUp: Nr(s),
          onThumbPositionChange: E,
          onThumbPointerDown: Nr(i),
        },
        children: g.jsx("div", {
          ...d,
          ref: h,
          style: { position: "absolute", ...d.style },
          onPointerDown: Ir(e.onPointerDown, (D) => {
            D.button === 0 &&
              (D.target.setPointerCapture(D.pointerId),
              (S.current = p.getBoundingClientRect()),
              (v.current = document.body.style.webkitUserSelect),
              (document.body.style.webkitUserSelect = "none"),
              R(D));
          }),
          onPointerMove: Ir(e.onPointerMove, R),
          onPointerUp: Ir(e.onPointerUp, (D) => {
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
  jE = x.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = qt(),
      [l, a] = x.useState(),
      c = x.useRef(null),
      u = Mt(t, c, i.onScrollbarXChange);
    return (
      x.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      g.jsx(g0, {
        "data-orientation": "horizontal",
        ...s,
        ref: u,
        sizes: n,
        style: { ...o, "--sa-thumb-width": `${Ca(n)}px` },
        onThumbPointerDown: (d) => e.onThumbPointerDown(d.x),
        onDragScroll: (d) => e.onDragScroll(d.x),
        onWheelScroll: (d, f) => {
          if (i.viewport) {
            const p = i.viewport.scrollLeft + d.deltaX;
            e.onWheelScroll(p), m0(p, f) && d.preventDefault();
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
                paddingStart: Wl(l.paddingLeft),
                paddingEnd: Wl(l.paddingRight),
              },
            });
        },
      })
    );
  }),
  $E = x.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = qt(),
      [l, a] = x.useState(),
      c = x.useRef(null),
      u = Mt(t, c, i.onScrollbarYChange);
    return (
      x.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      g.jsx(g0, {
        ...s,
        "data-orientation": "vertical",
        ref: u,
        sizes: n,
        style: { "--sa-thumb-height": `${Ca(n)}px`, ...o },
        onThumbPointerDown: (d) => e.onThumbPointerDown(d.y),
        onDragScroll: (d) => e.onDragScroll(d.y),
        onWheelScroll: (d, f) => {
          if (i.viewport) {
            const p = i.viewport.scrollTop + d.deltaY;
            e.onWheelScroll(p), m0(p, f) && d.preventDefault();
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
                paddingStart: Wl(l.paddingTop),
                paddingEnd: Wl(l.paddingBottom),
              },
            });
        },
      })
    );
  }),
  kf = x.forwardRef((e, t) => {
    const { orientation: n = "vertical", ...r } = e,
      { dir: o } = _f(),
      s = qt(),
      i = x.useRef(null),
      l = x.useRef(0),
      [a, c] = x.useState({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
      }),
      u = f0(a.viewport, a.content),
      d = {
        ...r,
        sizes: a,
        onSizesChange: c,
        hasThumb: u > 0 && u < 1,
        onThumbChange: (p) => {
          i.current = p;
        },
        onThumbPointerUp: () => {
          l.current = 0;
        },
        onThumbPointerDown: (p) => {
          l.current = p;
        },
      },
      f = (p, m) => NE(p, l.current, a, m);
    return n === "horizontal"
      ? g.jsx(jE, {
          ...d,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const p = s.viewport.scrollLeft,
                m = ch(p, a, o);
              i.current.style.transform = `translate3d(${m}px, 0, 0)`;
            }
          },
          onWheelScroll: (p) => {
            s.viewport && (s.viewport.scrollLeft = p);
          },
          onDragScroll: (p) => {
            s.viewport && (s.viewport.scrollLeft = f(p, o));
          },
        })
      : n === "vertical"
      ? g.jsx($E, {
          ...d,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const p = s.viewport.scrollTop,
                m = ch(p, a);
              i.current.style.transform = `translate3d(0, ${m}px, 0)`;
            }
          },
          onWheelScroll: (p) => {
            s.viewport && (s.viewport.scrollTop = p);
          },
          onDragScroll: (p) => {
            s.viewport && (s.viewport.scrollTop = f(p));
          },
        })
      : null;
  }),
  y0 = x.forwardRef((e, t) => {
    const n = qt(),
      { forceMount: r, ...o } = e,
      [s, i] = x.useState(!1),
      l = e.orientation === "horizontal",
      a = Sa(() => {
        if (n.viewport) {
          const c = n.viewport.offsetWidth < n.viewport.scrollWidth,
            u = n.viewport.offsetHeight < n.viewport.scrollHeight;
          i(l ? c : u);
        }
      }, 10);
    return (
      Ko(n.viewport, a),
      Ko(n.content, a),
      r || s
        ? g.jsx(kf, { "data-state": s ? "visible" : "hidden", ...o, ref: t })
        : null
    );
  }),
  LE = x.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = qt(),
      [s, i] = x.useState(!1);
    return (
      x.useEffect(() => {
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
        ? g.jsx(y0, { "data-state": s ? "visible" : "hidden", ...r, ref: t })
        : null
    );
  }),
  AE = x.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = qt(),
      s = e.orientation === "horizontal",
      [i, l] = x.useState("hidden"),
      a = Sa(() => l("idle"), 100);
    return (
      x.useEffect(() => {
        if (i === "idle") {
          const c = window.setTimeout(() => l("hidden"), o.scrollHideDelay);
          return () => window.clearTimeout(c);
        }
      }, [i, o.scrollHideDelay]),
      x.useEffect(() => {
        const { viewport: c } = o,
          u = s ? "scrollLeft" : "scrollTop";
        if (c) {
          let d = c[u];
          const f = () => {
            const p = c[u];
            d !== p && (l("scrolling"), a()), (d = p);
          };
          return (
            c.addEventListener("scroll", f),
            () => c.removeEventListener("scroll", f)
          );
        }
      }, [o.viewport, s, a]),
      n || i !== "hidden"
        ? g.jsx(kf, {
            "data-state": i === "hidden" ? "hidden" : "visible",
            ...r,
            ref: t,
            onPointerEnter: Ir(e.onPointerEnter, () => l("interacting")),
            onPointerLeave: Ir(e.onPointerLeave, () => l("idle")),
          })
        : null
    );
  }),
  uh = x.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = qt(),
      { onScrollbarXEnabledChange: s, onScrollbarYEnabledChange: i } = o,
      l = e.orientation === "horizontal";
    return (
      x.useEffect(
        () => (
          l ? s(!0) : i(!0),
          () => {
            l ? s(!1) : i(!1);
          }
        ),
        [l, s, i]
      ),
      o.type === "hover"
        ? g.jsx(LE, { ...r, ref: t, forceMount: n })
        : o.type === "scroll"
        ? g.jsx(AE, { ...r, ref: t, forceMount: n })
        : o.type === "auto"
        ? g.jsx(y0, { ...r, ref: t, forceMount: n })
        : o.type === "always"
        ? g.jsx(kf, { ...r, ref: t })
        : null
    );
  });
function FE(e, t = () => {}) {
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
const ME = x.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = qt(),
      s = h0(),
      { onThumbPositionChange: i } = s,
      l = Mt(t, (u) => s.onThumbChange(u)),
      a = x.useRef(),
      c = Sa(() => {
        a.current && (a.current(), (a.current = void 0));
      }, 100);
    return (
      x.useEffect(() => {
        const { viewport: u } = o;
        if (u) {
          const d = () => {
            if ((c(), !a.current)) {
              const f = FE(u, i);
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
      g.jsx("div", {
        "data-state": s.hasThumb ? "visible" : "hidden",
        ...r,
        ref: l,
        style: {
          width: "var(--sa-thumb-width)",
          height: "var(--sa-thumb-height)",
          ...n,
        },
        onPointerDownCapture: Ir(e.onPointerDownCapture, (u) => {
          const f = u.target.getBoundingClientRect(),
            p = u.clientX - f.left,
            m = u.clientY - f.top;
          s.onThumbPointerDown({ x: p, y: m });
        }),
        onPointerUp: Ir(e.onPointerUp, s.onThumbPointerUp),
      })
    );
  }),
  dh = x.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = h0();
    return n || o.hasThumb ? g.jsx(ME, { ref: t, ...r }) : null;
  }),
  v0 = x.forwardRef(({ children: e, style: t, ...n }, r) => {
    const o = qt(),
      s = Mt(r, o.onViewportChange);
    return g.jsx(X, {
      ...n,
      ref: s,
      style: {
        overflowX: o.scrollbarXEnabled ? "scroll" : "hidden",
        overflowY: o.scrollbarYEnabled ? "scroll" : "hidden",
        ...t,
      },
      children: g.jsx("div", {
        style: { minWidth: "100%", display: "table" },
        ref: o.onContentChange,
        children: e,
      }),
    });
  });
v0.displayName = "@mantine/core/ScrollAreaViewport";
var Rf = {
  root: "m_d57069b5",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268",
};
const w0 = { scrollHideDelay: 1e3, type: "hover", scrollbars: "xy" },
  IE = (e, { scrollbarSize: t }) => ({
    root: { "--scrollarea-scrollbar-size": z(t) },
  }),
  wi = G((e, t) => {
    const n = W("ScrollArea", w0, e),
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
        viewportRef: p,
        onScrollPositionChange: m,
        children: h,
        offsetScrollbars: S,
        scrollbars: v,
        ...w
      } = n,
      [y, b] = x.useState(!1),
      E = de({
        name: "ScrollArea",
        props: n,
        classes: Rf,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: IE,
      });
    return g.jsxs(d0, {
      type: u === "never" ? "always" : u,
      scrollHideDelay: d,
      ref: t,
      scrollbars: v,
      ...E("root"),
      ...w,
      children: [
        g.jsx(v0, {
          ...f,
          ...E("viewport", { style: f == null ? void 0 : f.style }),
          ref: p,
          "data-offset-scrollbars": S === !0 ? "xy" : S || void 0,
          "data-scrollbars": v || void 0,
          onScroll: (C) => {
            var R;
            (R = f == null ? void 0 : f.onScroll) == null || R.call(f, C),
              m == null ||
                m({
                  x: C.currentTarget.scrollLeft,
                  y: C.currentTarget.scrollTop,
                });
          },
          children: h,
        }),
        (v === "xy" || v === "x") &&
          g.jsx(uh, {
            ...E("scrollbar"),
            orientation: "horizontal",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: g.jsx(dh, { ...E("thumb") }),
          }),
        (v === "xy" || v === "y") &&
          g.jsx(uh, {
            ...E("scrollbar"),
            orientation: "vertical",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: g.jsx(dh, { ...E("thumb") }),
          }),
        g.jsx(DE, {
          ...E("corner"),
          "data-hovered": y || void 0,
          "data-hidden": u === "never" || void 0,
        }),
      ],
    });
  });
wi.displayName = "@mantine/core/ScrollArea";
const Df = G((e, t) => {
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
    variant: p,
    viewportProps: m,
    scrollbars: h,
    style: S,
    vars: v,
    ...w
  } = W("ScrollAreaAutosize", w0, e);
  return g.jsx(X, {
    ...w,
    ref: t,
    style: [{ display: "flex", overflow: "auto" }, S],
    children: g.jsx(X, {
      style: { display: "flex", flexDirection: "column", flex: 1 },
      children: g.jsx(wi, {
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
        variant: p,
        viewportProps: m,
        vars: v,
        scrollbars: h,
        children: n,
      }),
    }),
  });
});
wi.classes = Rf;
Df.displayName = "@mantine/core/ScrollAreaAutosize";
Df.classes = Rf;
wi.Autosize = Df;
var x0 = { root: "m_87cf2631" };
const zE = { __staticSelector: "UnstyledButton" },
  Mn = Un((e, t) => {
    const n = W("UnstyledButton", zE, e),
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
      d = de({
        name: s,
        props: n,
        classes: x0,
        className: r,
        style: c,
        classNames: l,
        styles: a,
        unstyled: i,
      });
    return g.jsx(X, {
      ...d("root", { focusable: !0 }),
      component: o,
      ref: t,
      type: o === "button" ? "button" : void 0,
      ...u,
    });
  });
Mn.classes = x0;
Mn.displayName = "@mantine/core/UnstyledButton";
var S0 = { root: "m_515a97f8" };
const BE = {},
  Pf = G((e, t) => {
    const n = W("VisuallyHidden", BE, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        ...c
      } = n,
      u = de({
        name: "VisuallyHidden",
        classes: S0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
      });
    return g.jsx(X, { component: "span", ref: t, ...u("root"), ...c });
  });
Pf.classes = S0;
Pf.displayName = "@mantine/core/VisuallyHidden";
var b0 = { root: "m_1b7284a3" };
const VE = {},
  HE = (e, { radius: t, shadow: n }) => ({
    root: {
      "--paper-radius": t === void 0 ? void 0 : Rn(t),
      "--paper-shadow": vf(n),
    },
  }),
  Tf = Un((e, t) => {
    const n = W("Paper", VE, e),
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
        mod: p,
        ...m
      } = n,
      h = de({
        name: "Paper",
        props: n,
        classes: b0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: HE,
      });
    return g.jsx(X, {
      ref: t,
      mod: [{ "data-with-border": a }, p],
      ...h("root"),
      variant: f,
      ...m,
    });
  });
Tf.classes = b0;
Tf.displayName = "@mantine/core/Paper";
function os(e) {
  return C0(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function $t(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function Yn(e) {
  var t;
  return (t = (C0(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function C0(e) {
  return e instanceof Node || e instanceof $t(e).Node;
}
function bt(e) {
  return e instanceof Element || e instanceof $t(e).Element;
}
function kn(e) {
  return e instanceof HTMLElement || e instanceof $t(e).HTMLElement;
}
function fh(e) {
  return typeof ShadowRoot > "u"
    ? !1
    : e instanceof ShadowRoot || e instanceof $t(e).ShadowRoot;
}
function xi(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: o } = ln(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + r + n) &&
    !["inline", "contents"].includes(o)
  );
}
function WE(e) {
  return ["table", "td", "th"].includes(os(e));
}
function Nf(e) {
  const t = Of(),
    n = ln(e);
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
function UE(e) {
  let t = yr(e);
  for (; kn(t) && !Go(t); ) {
    if (Nf(t)) return t;
    t = yr(t);
  }
  return null;
}
function Of() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none");
}
function Go(e) {
  return ["html", "body", "#document"].includes(os(e));
}
function ln(e) {
  return $t(e).getComputedStyle(e);
}
function Ea(e) {
  return bt(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.pageXOffset, scrollTop: e.pageYOffset };
}
function yr(e) {
  if (os(e) === "html") return e;
  const t = e.assignedSlot || e.parentNode || (fh(e) && e.host) || Yn(e);
  return fh(t) ? t.host : t;
}
function E0(e) {
  const t = yr(e);
  return Go(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : kn(t) && xi(t)
    ? t
    : E0(t);
}
function li(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = E0(e),
    s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
    i = $t(o);
  return s
    ? t.concat(
        i,
        i.visualViewport || [],
        xi(o) ? o : [],
        i.frameElement && n ? li(i.frameElement) : []
      )
    : t.concat(o, li(o, [], n));
}
const an = Math.min,
  rt = Math.max,
  Ul = Math.round,
  Gi = Math.floor,
  vr = (e) => ({ x: e, y: e }),
  YE = { left: "right", right: "left", bottom: "top", top: "bottom" },
  qE = { start: "end", end: "start" };
function Qu(e, t, n) {
  return rt(e, an(t, n));
}
function Hn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function cn(e) {
  return e.split("-")[0];
}
function ss(e) {
  return e.split("-")[1];
}
function jf(e) {
  return e === "x" ? "y" : "x";
}
function $f(e) {
  return e === "y" ? "height" : "width";
}
function io(e) {
  return ["top", "bottom"].includes(cn(e)) ? "y" : "x";
}
function Lf(e) {
  return jf(io(e));
}
function KE(e, t, n) {
  n === void 0 && (n = !1);
  const r = ss(e),
    o = Lf(e),
    s = $f(o);
  let i =
    o === "x"
      ? r === (n ? "end" : "start")
        ? "right"
        : "left"
      : r === "start"
      ? "bottom"
      : "top";
  return t.reference[s] > t.floating[s] && (i = Yl(i)), [i, Yl(i)];
}
function GE(e) {
  const t = Yl(e);
  return [Ju(e), t, Ju(t)];
}
function Ju(e) {
  return e.replace(/start|end/g, (t) => qE[t]);
}
function XE(e, t, n) {
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
function QE(e, t, n, r) {
  const o = ss(e);
  let s = XE(cn(e), n === "start", r);
  return (
    o && ((s = s.map((i) => i + "-" + o)), t && (s = s.concat(s.map(Ju)))), s
  );
}
function Yl(e) {
  return e.replace(/left|right|bottom|top/g, (t) => YE[t]);
}
function JE(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function Af(e) {
  return typeof e != "number"
    ? JE(e)
    : { top: e, right: e, bottom: e, left: e };
}
function Xo(e) {
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
function ph(e, t, n) {
  let { reference: r, floating: o } = e;
  const s = io(t),
    i = Lf(t),
    l = $f(i),
    a = cn(t),
    c = s === "y",
    u = r.x + r.width / 2 - o.width / 2,
    d = r.y + r.height / 2 - o.height / 2,
    f = r[l] / 2 - o[l] / 2;
  let p;
  switch (a) {
    case "top":
      p = { x: u, y: r.y - o.height };
      break;
    case "bottom":
      p = { x: u, y: r.y + r.height };
      break;
    case "right":
      p = { x: r.x + r.width, y: d };
      break;
    case "left":
      p = { x: r.x - o.width, y: d };
      break;
    default:
      p = { x: r.x, y: r.y };
  }
  switch (ss(t)) {
    case "start":
      p[i] -= f * (n && c ? -1 : 1);
      break;
    case "end":
      p[i] += f * (n && c ? -1 : 1);
      break;
  }
  return p;
}
const ZE = async (e, t, n) => {
  const {
      placement: r = "bottom",
      strategy: o = "absolute",
      middleware: s = [],
      platform: i,
    } = n,
    l = s.filter(Boolean),
    a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({ reference: e, floating: t, strategy: o }),
    { x: u, y: d } = ph(c, r, a),
    f = r,
    p = {},
    m = 0;
  for (let h = 0; h < l.length; h++) {
    const { name: S, fn: v } = l[h],
      {
        x: w,
        y,
        data: b,
        reset: E,
      } = await v({
        x: u,
        y: d,
        initialPlacement: r,
        placement: f,
        strategy: o,
        middlewareData: p,
        rects: c,
        platform: i,
        elements: { reference: e, floating: t },
      });
    (u = w ?? u),
      (d = y ?? d),
      (p = { ...p, [S]: { ...p[S], ...b } }),
      E &&
        m <= 50 &&
        (m++,
        typeof E == "object" &&
          (E.placement && (f = E.placement),
          E.rects &&
            (c =
              E.rects === !0
                ? await i.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: o,
                  })
                : E.rects),
          ({ x: u, y: d } = ph(c, f, a))),
        (h = -1));
  }
  return { x: u, y: d, placement: f, strategy: o, middlewareData: p };
};
async function Ff(e, t) {
  var n;
  t === void 0 && (t = {});
  const { x: r, y: o, platform: s, rects: i, elements: l, strategy: a } = e,
    {
      boundary: c = "clippingAncestors",
      rootBoundary: u = "viewport",
      elementContext: d = "floating",
      altBoundary: f = !1,
      padding: p = 0,
    } = Hn(t, e),
    m = Af(p),
    S = l[f ? (d === "floating" ? "reference" : "floating") : d],
    v = Xo(
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
    y = await (s.getOffsetParent == null
      ? void 0
      : s.getOffsetParent(l.floating)),
    b = (await (s.isElement == null ? void 0 : s.isElement(y)))
      ? (await (s.getScale == null ? void 0 : s.getScale(y))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    E = Xo(
      s.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: w,
            offsetParent: y,
            strategy: a,
          })
        : w
    );
  return {
    top: (v.top - E.top + m.top) / b.y,
    bottom: (E.bottom - v.bottom + m.bottom) / b.y,
    left: (v.left - E.left + m.left) / b.x,
    right: (E.right - v.right + m.right) / b.x,
  };
}
const e_ = (e) => ({
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
        { element: c, padding: u = 0 } = Hn(e, t) || {};
      if (c == null) return {};
      const d = Af(u),
        f = { x: n, y: r },
        p = Lf(o),
        m = $f(p),
        h = await i.getDimensions(c),
        S = p === "y",
        v = S ? "top" : "left",
        w = S ? "bottom" : "right",
        y = S ? "clientHeight" : "clientWidth",
        b = s.reference[m] + s.reference[p] - f[p] - s.floating[m],
        E = f[p] - s.reference[p],
        C = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
      let R = C ? C[y] : 0;
      (!R || !(await (i.isElement == null ? void 0 : i.isElement(C)))) &&
        (R = l.floating[y] || s.floating[m]);
      const D = b / 2 - E / 2,
        L = R / 2 - h[m] / 2 - 1,
        N = an(d[v], L),
        M = an(d[w], L),
        B = N,
        V = R - h[m] - M,
        A = R / 2 - h[m] / 2 + D,
        j = Qu(B, A, V),
        P =
          !a.arrow &&
          ss(o) != null &&
          A !== j &&
          s.reference[m] / 2 - (A < B ? N : M) - h[m] / 2 < 0,
        T = P ? (A < B ? A - B : A - V) : 0;
      return {
        [p]: f[p] + T,
        data: {
          [p]: j,
          centerOffset: A - j - T,
          ...(P && { alignmentOffset: T }),
        },
        reset: P,
      };
    },
  }),
  t_ = function (e) {
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
              fallbackStrategy: p = "bestFit",
              fallbackAxisSideDirection: m = "none",
              flipAlignment: h = !0,
              ...S
            } = Hn(e, t);
          if ((n = s.arrow) != null && n.alignmentOffset) return {};
          const v = cn(o),
            w = cn(l) === l,
            y = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)),
            b = f || (w || !h ? [Yl(l)] : GE(l));
          !f && m !== "none" && b.push(...QE(l, h, m, y));
          const E = [l, ...b],
            C = await Ff(t, S),
            R = [];
          let D = ((r = s.flip) == null ? void 0 : r.overflows) || [];
          if ((u && R.push(C[v]), d)) {
            const B = KE(o, i, y);
            R.push(C[B[0]], C[B[1]]);
          }
          if (
            ((D = [...D, { placement: o, overflows: R }]),
            !R.every((B) => B <= 0))
          ) {
            var L, N;
            const B = (((L = s.flip) == null ? void 0 : L.index) || 0) + 1,
              V = E[B];
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
              switch (p) {
                case "bestFit": {
                  var M;
                  const j =
                    (M = D.map((P) => [
                      P.placement,
                      P.overflows
                        .filter((T) => T > 0)
                        .reduce((T, k) => T + k, 0),
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
function _0(e) {
  const t = an(...e.map((s) => s.left)),
    n = an(...e.map((s) => s.top)),
    r = rt(...e.map((s) => s.right)),
    o = rt(...e.map((s) => s.bottom));
  return { x: t, y: n, width: r - t, height: o - n };
}
function n_(e) {
  const t = e.slice().sort((o, s) => o.y - s.y),
    n = [];
  let r = null;
  for (let o = 0; o < t.length; o++) {
    const s = t[o];
    !r || s.y - r.y > r.height / 2 ? n.push([s]) : n[n.length - 1].push(s),
      (r = s);
  }
  return n.map((o) => Xo(_0(o)));
}
const r_ = function (e) {
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
          { padding: l = 2, x: a, y: c } = Hn(e, t),
          u = Array.from(
            (await (s.getClientRects == null
              ? void 0
              : s.getClientRects(r.reference))) || []
          ),
          d = n_(u),
          f = Xo(_0(u)),
          p = Af(l);
        function m() {
          if (
            d.length === 2 &&
            d[0].left > d[1].right &&
            a != null &&
            c != null
          )
            return (
              d.find(
                (S) =>
                  a > S.left - p.left &&
                  a < S.right + p.right &&
                  c > S.top - p.top &&
                  c < S.bottom + p.bottom
              ) || f
            );
          if (d.length >= 2) {
            if (io(n) === "y") {
              const N = d[0],
                M = d[d.length - 1],
                B = cn(n) === "top",
                V = N.top,
                A = M.bottom,
                j = B ? N.left : M.left,
                P = B ? N.right : M.right,
                T = P - j,
                k = A - V;
              return {
                top: V,
                bottom: A,
                left: j,
                right: P,
                width: T,
                height: k,
                x: j,
                y: V,
              };
            }
            const S = cn(n) === "left",
              v = rt(...d.map((N) => N.right)),
              w = an(...d.map((N) => N.left)),
              y = d.filter((N) => (S ? N.left === w : N.right === v)),
              b = y[0].top,
              E = y[y.length - 1].bottom,
              C = w,
              R = v,
              D = R - C,
              L = E - b;
            return {
              top: b,
              bottom: E,
              left: C,
              right: R,
              width: D,
              height: L,
              x: C,
              y: b,
            };
          }
          return f;
        }
        const h = await s.getElementRects({
          reference: { getBoundingClientRect: m },
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
async function o_(e, t) {
  const { placement: n, platform: r, elements: o } = e,
    s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
    i = cn(n),
    l = ss(n),
    a = io(n) === "y",
    c = ["left", "top"].includes(i) ? -1 : 1,
    u = s && a ? -1 : 1,
    d = Hn(t, e);
  let {
    mainAxis: f,
    crossAxis: p,
    alignmentAxis: m,
  } = typeof d == "number"
    ? { mainAxis: d, crossAxis: 0, alignmentAxis: null }
    : { mainAxis: 0, crossAxis: 0, alignmentAxis: null, ...d };
  return (
    l && typeof m == "number" && (p = l === "end" ? m * -1 : m),
    a ? { x: p * u, y: f * c } : { x: f * c, y: p * u }
  );
}
const s_ = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: "offset",
        options: e,
        async fn(t) {
          var n, r;
          const { x: o, y: s, placement: i, middlewareData: l } = t,
            a = await o_(t, e);
          return i === ((n = l.offset) == null ? void 0 : n.placement) &&
            (r = l.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: o + a.x, y: s + a.y, data: { ...a, placement: i } };
        },
      }
    );
  },
  i_ = function (e) {
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
            } = Hn(e, t),
            c = { x: n, y: r },
            u = await Ff(t, a),
            d = io(cn(o)),
            f = jf(d);
          let p = c[f],
            m = c[d];
          if (s) {
            const S = f === "y" ? "top" : "left",
              v = f === "y" ? "bottom" : "right",
              w = p + u[S],
              y = p - u[v];
            p = Qu(w, p, y);
          }
          if (i) {
            const S = d === "y" ? "top" : "left",
              v = d === "y" ? "bottom" : "right",
              w = m + u[S],
              y = m - u[v];
            m = Qu(w, m, y);
          }
          const h = l.fn({ ...t, [f]: p, [d]: m });
          return { ...h, data: { x: h.x - n, y: h.y - r } };
        },
      }
    );
  },
  l_ = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: r, placement: o, rects: s, middlewareData: i } = t,
            { offset: l = 0, mainAxis: a = !0, crossAxis: c = !0 } = Hn(e, t),
            u = { x: n, y: r },
            d = io(o),
            f = jf(d);
          let p = u[f],
            m = u[d];
          const h = Hn(l, t),
            S =
              typeof h == "number"
                ? { mainAxis: h, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...h };
          if (a) {
            const y = f === "y" ? "height" : "width",
              b = s.reference[f] - s.floating[y] + S.mainAxis,
              E = s.reference[f] + s.reference[y] - S.mainAxis;
            p < b ? (p = b) : p > E && (p = E);
          }
          if (c) {
            var v, w;
            const y = f === "y" ? "width" : "height",
              b = ["top", "left"].includes(cn(o)),
              E =
                s.reference[d] -
                s.floating[y] +
                ((b && ((v = i.offset) == null ? void 0 : v[d])) || 0) +
                (b ? 0 : S.crossAxis),
              C =
                s.reference[d] +
                s.reference[y] +
                (b ? 0 : ((w = i.offset) == null ? void 0 : w[d]) || 0) -
                (b ? S.crossAxis : 0);
            m < E ? (m = E) : m > C && (m = C);
          }
          return { [f]: p, [d]: m };
        },
      }
    );
  },
  a_ = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "size",
        options: e,
        async fn(t) {
          const { placement: n, rects: r, platform: o, elements: s } = t,
            { apply: i = () => {}, ...l } = Hn(e, t),
            a = await Ff(t, l),
            c = cn(n),
            u = ss(n),
            d = io(n) === "y",
            { width: f, height: p } = r.floating;
          let m, h;
          c === "top" || c === "bottom"
            ? ((m = c),
              (h =
                u ===
                ((await (o.isRTL == null ? void 0 : o.isRTL(s.floating)))
                  ? "start"
                  : "end")
                  ? "left"
                  : "right"))
            : ((h = c), (m = u === "end" ? "top" : "bottom"));
          const S = p - a[m],
            v = f - a[h],
            w = !t.middlewareData.shift;
          let y = S,
            b = v;
          if (d) {
            const C = f - a.left - a.right;
            b = u || w ? an(v, C) : C;
          } else {
            const C = p - a.top - a.bottom;
            y = u || w ? an(S, C) : C;
          }
          if (w && !u) {
            const C = rt(a.left, 0),
              R = rt(a.right, 0),
              D = rt(a.top, 0),
              L = rt(a.bottom, 0);
            d
              ? (b = f - 2 * (C !== 0 || R !== 0 ? C + R : rt(a.left, a.right)))
              : (y =
                  p - 2 * (D !== 0 || L !== 0 ? D + L : rt(a.top, a.bottom)));
          }
          await i({ ...t, availableWidth: b, availableHeight: y });
          const E = await o.getDimensions(s.floating);
          return f !== E.width || p !== E.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function k0(e) {
  const t = ln(e);
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0;
  const o = kn(e),
    s = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : r,
    l = Ul(n) !== s || Ul(r) !== i;
  return l && ((n = s), (r = i)), { width: n, height: r, $: l };
}
function Mf(e) {
  return bt(e) ? e : e.contextElement;
}
function Fo(e) {
  const t = Mf(e);
  if (!kn(t)) return vr(1);
  const n = t.getBoundingClientRect(),
    { width: r, height: o, $: s } = k0(t);
  let i = (s ? Ul(n.width) : n.width) / r,
    l = (s ? Ul(n.height) : n.height) / o;
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: i, y: l }
  );
}
const c_ = vr(0);
function R0(e) {
  const t = $t(e);
  return !Of() || !t.visualViewport
    ? c_
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function u_(e, t, n) {
  return t === void 0 && (t = !1), !n || (t && n !== $t(e)) ? !1 : t;
}
function Kr(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(),
    s = Mf(e);
  let i = vr(1);
  t && (r ? bt(r) && (i = Fo(r)) : (i = Fo(e)));
  const l = u_(s, n, r) ? R0(s) : vr(0);
  let a = (o.left + l.x) / i.x,
    c = (o.top + l.y) / i.y,
    u = o.width / i.x,
    d = o.height / i.y;
  if (s) {
    const f = $t(s),
      p = r && bt(r) ? $t(r) : r;
    let m = f,
      h = m.frameElement;
    for (; h && r && p !== m; ) {
      const S = Fo(h),
        v = h.getBoundingClientRect(),
        w = ln(h),
        y = v.left + (h.clientLeft + parseFloat(w.paddingLeft)) * S.x,
        b = v.top + (h.clientTop + parseFloat(w.paddingTop)) * S.y;
      (a *= S.x),
        (c *= S.y),
        (u *= S.x),
        (d *= S.y),
        (a += y),
        (c += b),
        (m = $t(h)),
        (h = m.frameElement);
    }
  }
  return Xo({ width: u, height: d, x: a, y: c });
}
const d_ = [":popover-open", ":modal"];
function If(e) {
  return d_.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function f_(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: o } = e;
  const s = o === "fixed",
    i = Yn(r),
    l = t ? If(t.floating) : !1;
  if (r === i || (l && s)) return n;
  let a = { scrollLeft: 0, scrollTop: 0 },
    c = vr(1);
  const u = vr(0),
    d = kn(r);
  if (
    (d || (!d && !s)) &&
    ((os(r) !== "body" || xi(i)) && (a = Ea(r)), kn(r))
  ) {
    const f = Kr(r);
    (c = Fo(r)), (u.x = f.x + r.clientLeft), (u.y = f.y + r.clientTop);
  }
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - a.scrollLeft * c.x + u.x,
    y: n.y * c.y - a.scrollTop * c.y + u.y,
  };
}
function p_(e) {
  return Array.from(e.getClientRects());
}
function D0(e) {
  return Kr(Yn(e)).left + Ea(e).scrollLeft;
}
function m_(e) {
  const t = Yn(e),
    n = Ea(e),
    r = e.ownerDocument.body,
    o = rt(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    s = rt(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let i = -n.scrollLeft + D0(e);
  const l = -n.scrollTop;
  return (
    ln(r).direction === "rtl" && (i += rt(t.clientWidth, r.clientWidth) - o),
    { width: o, height: s, x: i, y: l }
  );
}
function h_(e, t) {
  const n = $t(e),
    r = Yn(e),
    o = n.visualViewport;
  let s = r.clientWidth,
    i = r.clientHeight,
    l = 0,
    a = 0;
  if (o) {
    (s = o.width), (i = o.height);
    const c = Of();
    (!c || (c && t === "fixed")) && ((l = o.offsetLeft), (a = o.offsetTop));
  }
  return { width: s, height: i, x: l, y: a };
}
function g_(e, t) {
  const n = Kr(e, !0, t === "fixed"),
    r = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    s = kn(e) ? Fo(e) : vr(1),
    i = e.clientWidth * s.x,
    l = e.clientHeight * s.y,
    a = o * s.x,
    c = r * s.y;
  return { width: i, height: l, x: a, y: c };
}
function mh(e, t, n) {
  let r;
  if (t === "viewport") r = h_(e, n);
  else if (t === "document") r = m_(Yn(e));
  else if (bt(t)) r = g_(t, n);
  else {
    const o = R0(e);
    r = { ...t, x: t.x - o.x, y: t.y - o.y };
  }
  return Xo(r);
}
function P0(e, t) {
  const n = yr(e);
  return n === t || !bt(n) || Go(n)
    ? !1
    : ln(n).position === "fixed" || P0(n, t);
}
function y_(e, t) {
  const n = t.get(e);
  if (n) return n;
  let r = li(e, [], !1).filter((l) => bt(l) && os(l) !== "body"),
    o = null;
  const s = ln(e).position === "fixed";
  let i = s ? yr(e) : e;
  for (; bt(i) && !Go(i); ) {
    const l = ln(i),
      a = Nf(i);
    !a && l.position === "fixed" && (o = null),
      (
        s
          ? !a && !o
          : (!a &&
              l.position === "static" &&
              !!o &&
              ["absolute", "fixed"].includes(o.position)) ||
            (xi(i) && !a && P0(e, i))
      )
        ? (r = r.filter((u) => u !== i))
        : (o = l),
      (i = yr(i));
  }
  return t.set(e, r), r;
}
function v_(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: o } = e;
  const i = [
      ...(n === "clippingAncestors"
        ? If(t)
          ? []
          : y_(t, this._c)
        : [].concat(n)),
      r,
    ],
    l = i[0],
    a = i.reduce((c, u) => {
      const d = mh(t, u, o);
      return (
        (c.top = rt(d.top, c.top)),
        (c.right = an(d.right, c.right)),
        (c.bottom = an(d.bottom, c.bottom)),
        (c.left = rt(d.left, c.left)),
        c
      );
    }, mh(t, l, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top,
  };
}
function w_(e) {
  const { width: t, height: n } = k0(e);
  return { width: t, height: n };
}
function x_(e, t, n) {
  const r = kn(t),
    o = Yn(t),
    s = n === "fixed",
    i = Kr(e, !0, s, t);
  let l = { scrollLeft: 0, scrollTop: 0 };
  const a = vr(0);
  if (r || (!r && !s))
    if (((os(t) !== "body" || xi(o)) && (l = Ea(t)), r)) {
      const d = Kr(t, !0, s, t);
      (a.x = d.x + t.clientLeft), (a.y = d.y + t.clientTop);
    } else o && (a.x = D0(o));
  const c = i.left + l.scrollLeft - a.x,
    u = i.top + l.scrollTop - a.y;
  return { x: c, y: u, width: i.width, height: i.height };
}
function Yc(e) {
  return ln(e).position === "static";
}
function hh(e, t) {
  return !kn(e) || ln(e).position === "fixed"
    ? null
    : t
    ? t(e)
    : e.offsetParent;
}
function T0(e, t) {
  const n = $t(e);
  if (If(e)) return n;
  if (!kn(e)) {
    let o = yr(e);
    for (; o && !Go(o); ) {
      if (bt(o) && !Yc(o)) return o;
      o = yr(o);
    }
    return n;
  }
  let r = hh(e, t);
  for (; r && WE(r) && Yc(r); ) r = hh(r, t);
  return r && Go(r) && Yc(r) && !Nf(r) ? n : r || UE(e) || n;
}
const S_ = async function (e) {
  const t = this.getOffsetParent || T0,
    n = this.getDimensions,
    r = await n(e.floating);
  return {
    reference: x_(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  };
};
function b_(e) {
  return ln(e).direction === "rtl";
}
const C_ = {
  convertOffsetParentRelativeRectToViewportRelativeRect: f_,
  getDocumentElement: Yn,
  getClippingRect: v_,
  getOffsetParent: T0,
  getElementRects: S_,
  getClientRects: p_,
  getDimensions: w_,
  getScale: Fo,
  isElement: bt,
  isRTL: b_,
};
function E_(e, t) {
  let n = null,
    r;
  const o = Yn(e);
  function s() {
    var l;
    clearTimeout(r), (l = n) == null || l.disconnect(), (n = null);
  }
  function i(l, a) {
    l === void 0 && (l = !1), a === void 0 && (a = 1), s();
    const { left: c, top: u, width: d, height: f } = e.getBoundingClientRect();
    if ((l || t(), !d || !f)) return;
    const p = Gi(u),
      m = Gi(o.clientWidth - (c + d)),
      h = Gi(o.clientHeight - (u + f)),
      S = Gi(c),
      w = {
        rootMargin: -p + "px " + -m + "px " + -h + "px " + -S + "px",
        threshold: rt(0, an(1, a)) || 1,
      };
    let y = !0;
    function b(E) {
      const C = E[0].intersectionRatio;
      if (C !== a) {
        if (!y) return i();
        C
          ? i(!1, C)
          : (r = setTimeout(() => {
              i(!1, 1e-7);
            }, 1e3));
      }
      y = !1;
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
function __(e, t, n, r) {
  r === void 0 && (r = {});
  const {
      ancestorScroll: o = !0,
      ancestorResize: s = !0,
      elementResize: i = typeof ResizeObserver == "function",
      layoutShift: l = typeof IntersectionObserver == "function",
      animationFrame: a = !1,
    } = r,
    c = Mf(e),
    u = o || s ? [...(c ? li(c) : []), ...li(t)] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n, { passive: !0 }),
      s && v.addEventListener("resize", n);
  });
  const d = c && l ? E_(c, n) : null;
  let f = -1,
    p = null;
  i &&
    ((p = new ResizeObserver((v) => {
      let [w] = v;
      w &&
        w.target === c &&
        p &&
        (p.unobserve(t),
        cancelAnimationFrame(f),
        (f = requestAnimationFrame(() => {
          var y;
          (y = p) == null || y.observe(t);
        }))),
        n();
    })),
    c && !a && p.observe(c),
    p.observe(t));
  let m,
    h = a ? Kr(e) : null;
  a && S();
  function S() {
    const v = Kr(e);
    h &&
      (v.x !== h.x ||
        v.y !== h.y ||
        v.width !== h.width ||
        v.height !== h.height) &&
      n(),
      (h = v),
      (m = requestAnimationFrame(S));
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
        (v = p) == null || v.disconnect(),
        (p = null),
        a && cancelAnimationFrame(m);
    }
  );
}
const k_ = s_,
  R_ = i_,
  gh = t_,
  D_ = a_,
  yh = e_,
  vh = r_,
  wh = l_,
  P_ = (e, t, n) => {
    const r = new Map(),
      o = { platform: C_, ...n },
      s = { ...o.platform, _c: r };
    return ZE(e, t, { ...o, platform: s });
  },
  T_ = (e) => {
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
            ? yh({ element: r.current, padding: o }).fn(n)
            : {}
          : r
          ? yh({ element: r, padding: o }).fn(n)
          : {};
      },
    };
  };
var hl = typeof document < "u" ? x.useLayoutEffect : x.useEffect;
function ql(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == "function" && e.toString() === t.toString()) return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (r = n; r-- !== 0; ) if (!ql(e[r], t[r])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1;
    for (r = n; r-- !== 0; ) {
      const s = o[r];
      if (!(s === "_owner" && e.$$typeof) && !ql(e[s], t[s])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function N0(e) {
  return typeof window > "u"
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function xh(e, t) {
  const n = N0(e);
  return Math.round(t * n) / n;
}
function Sh(e) {
  const t = x.useRef(e);
  return (
    hl(() => {
      t.current = e;
    }),
    t
  );
}
function N_(e) {
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
    [u, d] = x.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [f, p] = x.useState(r);
  ql(f, r) || p(r);
  const [m, h] = x.useState(null),
    [S, v] = x.useState(null),
    w = x.useCallback((T) => {
      T !== C.current && ((C.current = T), h(T));
    }, []),
    y = x.useCallback((T) => {
      T !== R.current && ((R.current = T), v(T));
    }, []),
    b = s || m,
    E = i || S,
    C = x.useRef(null),
    R = x.useRef(null),
    D = x.useRef(u),
    L = a != null,
    N = Sh(a),
    M = Sh(o),
    B = x.useCallback(() => {
      if (!C.current || !R.current) return;
      const T = { placement: t, strategy: n, middleware: f };
      M.current && (T.platform = M.current),
        P_(C.current, R.current, T).then((k) => {
          const _ = { ...k, isPositioned: !0 };
          V.current &&
            !ql(D.current, _) &&
            ((D.current = _),
            yi.flushSync(() => {
              d(_);
            }));
        });
    }, [f, t, n, M]);
  hl(() => {
    c === !1 &&
      D.current.isPositioned &&
      ((D.current.isPositioned = !1), d((T) => ({ ...T, isPositioned: !1 })));
  }, [c]);
  const V = x.useRef(!1);
  hl(
    () => (
      (V.current = !0),
      () => {
        V.current = !1;
      }
    ),
    []
  ),
    hl(() => {
      if ((b && (C.current = b), E && (R.current = E), b && E)) {
        if (N.current) return N.current(b, E, B);
        B();
      }
    }, [b, E, B, N, L]);
  const A = x.useMemo(
      () => ({ reference: C, floating: R, setReference: w, setFloating: y }),
      [w, y]
    ),
    j = x.useMemo(() => ({ reference: b, floating: E }), [b, E]),
    P = x.useMemo(() => {
      const T = { position: n, left: 0, top: 0 };
      if (!j.floating) return T;
      const k = xh(j.floating, u.x),
        _ = xh(j.floating, u.y);
      return l
        ? {
            ...T,
            transform: "translate(" + k + "px, " + _ + "px)",
            ...(N0(j.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: k, top: _ };
    }, [n, l, j.floating, u.x, u.y]);
  return x.useMemo(
    () => ({ ...u, update: B, refs: A, elements: j, floatingStyles: P }),
    [u, B, A, j, P]
  );
}
const O0 = { ...Og },
  O_ = O0.useInsertionEffect,
  j_ = O_ || ((e) => e());
function $_(e) {
  const t = x.useRef(() => {});
  return (
    j_(() => {
      t.current = e;
    }),
    x.useCallback(function () {
      for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
        r[o] = arguments[o];
      return t.current == null ? void 0 : t.current(...r);
    }, [])
  );
}
var Zu = typeof document < "u" ? x.useLayoutEffect : x.useEffect;
let bh = !1,
  L_ = 0;
const Ch = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + L_++;
function A_() {
  const [e, t] = x.useState(() => (bh ? Ch() : void 0));
  return (
    Zu(() => {
      e == null && t(Ch());
    }, []),
    x.useEffect(() => {
      bh = !0;
    }, []),
    e
  );
}
const F_ = O0.useId,
  M_ = F_ || A_;
function I_() {
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
const z_ = x.createContext(null),
  B_ = x.createContext(null),
  V_ = () => {
    var e;
    return ((e = x.useContext(z_)) == null ? void 0 : e.id) || null;
  },
  H_ = () => x.useContext(B_);
function W_(e) {
  const { open: t = !1, onOpenChange: n, elements: r } = e,
    o = M_(),
    s = x.useRef({}),
    [i] = x.useState(() => I_()),
    l = V_() != null,
    [a, c] = x.useState(r.reference),
    u = $_((p, m, h) => {
      (s.current.openEvent = p ? m : void 0),
        i.emit("openchange", { open: p, event: m, reason: h, nested: l }),
        n == null || n(p, m, h);
    }),
    d = x.useMemo(() => ({ setPositionReference: c }), []),
    f = x.useMemo(
      () => ({
        reference: a || r.reference || null,
        floating: r.floating || null,
        domReference: r.reference,
      }),
      [a, r.reference, r.floating]
    );
  return x.useMemo(
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
function U_(e) {
  e === void 0 && (e = {});
  const { nodeId: t } = e,
    n = W_({
      ...e,
      elements: { reference: null, floating: null, ...e.elements },
    }),
    r = e.rootContext || n,
    o = r.elements,
    [s, i] = x.useState(null),
    [l, a] = x.useState(null),
    u = (o == null ? void 0 : o.reference) || s,
    d = x.useRef(null),
    f = H_();
  Zu(() => {
    u && (d.current = u);
  }, [u]);
  const p = N_({ ...e, elements: { ...o, ...(l && { reference: l }) } }),
    m = x.useCallback(
      (y) => {
        const b = bt(y)
          ? {
              getBoundingClientRect: () => y.getBoundingClientRect(),
              contextElement: y,
            }
          : y;
        a(b), p.refs.setReference(b);
      },
      [p.refs]
    ),
    h = x.useCallback(
      (y) => {
        (bt(y) || y === null) && ((d.current = y), i(y)),
          (bt(p.refs.reference.current) ||
            p.refs.reference.current === null ||
            (y !== null && !bt(y))) &&
            p.refs.setReference(y);
      },
      [p.refs]
    ),
    S = x.useMemo(
      () => ({
        ...p.refs,
        setReference: h,
        setPositionReference: m,
        domReference: d,
      }),
      [p.refs, h, m]
    ),
    v = x.useMemo(() => ({ ...p.elements, domReference: u }), [p.elements, u]),
    w = x.useMemo(
      () => ({ ...p, ...r, refs: S, elements: v, nodeId: t }),
      [p, S, v, t, r]
    );
  return (
    Zu(() => {
      r.dataRef.current.floatingContext = w;
      const y = f == null ? void 0 : f.nodesRef.current.find((b) => b.id === t);
      y && (y.context = w);
    }),
    x.useMemo(() => ({ ...p, context: w, refs: S, elements: v }), [p, S, v, w])
  );
}
function Y_(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, r] = t.split("-"),
      o = n === "right" ? "left" : "right";
    return r === void 0 ? o : `${o}-${r}`;
  }
  return t;
}
function Eh(e, t, n, r) {
  return e === "center" || r === "center"
    ? { top: t }
    : e === "end"
    ? { bottom: n }
    : e === "start"
    ? { top: n }
    : {};
}
function _h(e, t, n, r, o) {
  return e === "center" || r === "center"
    ? { left: t }
    : e === "end"
    ? { [o === "ltr" ? "right" : "left"]: n }
    : e === "start"
    ? { [o === "ltr" ? "left" : "right"]: n }
    : {};
}
const q_ = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius",
};
function K_({
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
      [q_[a]]: z(r),
    },
    d = z(-t / 2);
  return a === "left"
    ? {
        ...u,
        ...Eh(c, i, n, o),
        right: d,
        borderLeftColor: "transparent",
        borderBottomColor: "transparent",
      }
    : a === "right"
    ? {
        ...u,
        ...Eh(c, i, n, o),
        left: d,
        borderRightColor: "transparent",
        borderTopColor: "transparent",
      }
    : a === "top"
    ? {
        ...u,
        ..._h(c, s, n, o, l),
        bottom: d,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
      }
    : a === "bottom"
    ? {
        ...u,
        ..._h(c, s, n, o, l),
        top: d,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
      }
    : {};
}
const j0 = x.forwardRef(
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
    const { dir: d } = _f();
    return s
      ? g.jsx("div", {
          ...c,
          ref: u,
          style: {
            ...a,
            ...K_({
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
j0.displayName = "@mantine/core/FloatingArrow";
const [G_, $0] = br("Popover component was not found in the tree");
function _a({ children: e, active: t = !0, refProp: n = "ref" }) {
  const r = sC(t),
    o = Mt(r, e == null ? void 0 : e.ref);
  return no(e) ? x.cloneElement(e, { [n]: o }) : e;
}
function L0(e) {
  return g.jsx(Pf, { tabIndex: -1, "data-autofocus": !0, ...e });
}
_a.displayName = "@mantine/core/FocusTrap";
L0.displayName = "@mantine/core/FocusTrapInitialFocus";
_a.InitialFocus = L0;
function X_(e) {
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
const Q_ = {},
  A0 = x.forwardRef((e, t) => {
    const { children: n, target: r, ...o } = W("Portal", Q_, e),
      [s, i] = x.useState(!1),
      l = x.useRef(null);
    return (
      vi(
        () => (
          i(!0),
          (l.current = r
            ? typeof r == "string"
              ? document.querySelector(r)
              : r
            : X_(o)),
          wf(t, l.current),
          !r && l.current && document.body.appendChild(l.current),
          () => {
            !r && l.current && document.body.removeChild(l.current);
          }
        ),
        [r]
      ),
      !s || !l.current
        ? null
        : yi.createPortal(g.jsx(g.Fragment, { children: n }), l.current)
    );
  });
A0.displayName = "@mantine/core/Portal";
function ka({ withinPortal: e = !0, children: t, ...n }) {
  return e
    ? g.jsx(A0, { ...n, children: t })
    : g.jsx(g.Fragment, { children: t });
}
ka.displayName = "@mantine/core/OptionalPortal";
const _s = (e) => ({
    in: { opacity: 1, transform: "scale(1)" },
    out: {
      opacity: 0,
      transform: `scale(.9) translateY(${z(e === "bottom" ? 10 : -10)})`,
    },
    transitionProperty: "transform, opacity",
  }),
  Xi = {
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
    pop: { ..._s("bottom"), common: { transformOrigin: "center center" } },
    "pop-bottom-left": {
      ..._s("bottom"),
      common: { transformOrigin: "bottom left" },
    },
    "pop-bottom-right": {
      ..._s("bottom"),
      common: { transformOrigin: "bottom right" },
    },
    "pop-top-left": { ..._s("top"), common: { transformOrigin: "top left" } },
    "pop-top-right": { ..._s("top"), common: { transformOrigin: "top right" } },
  },
  kh = {
    entering: "in",
    entered: "in",
    exiting: "out",
    exited: "out",
    "pre-exiting": "out",
    "pre-entering": "out",
  };
function J_({ transition: e, state: t, duration: n, timingFunction: r }) {
  const o = { transitionDuration: `${n}ms`, transitionTimingFunction: r };
  return typeof e == "string"
    ? e in Xi
      ? {
          transitionProperty: Xi[e].transitionProperty,
          ...o,
          ...Xi[e].common,
          ...Xi[e][kh[t]],
        }
      : {}
    : {
        transitionProperty: e.transitionProperty,
        ...o,
        ...e.common,
        ...e[kh[t]],
      };
}
function Z_({
  duration: e,
  exitDuration: t,
  timingFunction: n,
  mounted: r,
  onEnter: o,
  onExit: s,
  onEntered: i,
  onExited: l,
}) {
  const a = Dn(),
    c = xf(),
    u = a.respectReducedMotion ? c : !1,
    [d, f] = x.useState(u ? 0 : e),
    [p, m] = x.useState(r ? "entered" : "exited"),
    h = x.useRef(-1),
    S = x.useRef(-1),
    v = (w) => {
      const y = w ? o : s,
        b = w ? i : l;
      window.clearTimeout(h.current);
      const E = u ? 0 : w ? e : t;
      f(E),
        E === 0
          ? (typeof y == "function" && y(),
            typeof b == "function" && b(),
            m(w ? "entered" : "exited"))
          : (S.current = requestAnimationFrame(() => {
              ob.flushSync(() => {
                m(w ? "pre-entering" : "pre-exiting");
              }),
                (S.current = requestAnimationFrame(() => {
                  typeof y == "function" && y(),
                    m(w ? "entering" : "exiting"),
                    (h.current = window.setTimeout(() => {
                      typeof b == "function" && b(),
                        m(w ? "entered" : "exited");
                    }, E));
                }));
            }));
    };
  return (
    qr(() => {
      v(r);
    }, [r]),
    x.useEffect(
      () => () => {
        window.clearTimeout(h.current), cancelAnimationFrame(S.current);
      },
      []
    ),
    {
      transitionDuration: d,
      transitionStatus: p,
      transitionTimingFunction: n || "ease",
    }
  );
}
function is({
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
    transitionTimingFunction: p,
  } = Z_({
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
      ? g.jsx(g.Fragment, { children: s({}) })
      : e
      ? s({ display: "none" })
      : null
    : f === "exited"
    ? e
      ? s({ display: "none" })
      : null
    : g.jsx(g.Fragment, {
        children: s(
          J_({ transition: t, duration: d, state: f, timingFunction: p })
        ),
      });
}
is.displayName = "@mantine/core/Transition";
var F0 = { dropdown: "m_38a85659", arrow: "m_a31dc6c1" };
const ek = {},
  zf = G((e, t) => {
    var S, v, w, y;
    const n = W("PopoverDropdown", ek, e),
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
      f = $0(),
      p = Yv({ opened: f.opened, shouldReturnFocus: f.returnFocus }),
      m = f.withRoles
        ? {
            "aria-labelledby": f.getTargetId(),
            id: f.getDropdownId(),
            role: "dialog",
            tabIndex: -1,
          }
        : {},
      h = Mt(t, f.floating);
    return f.disabled
      ? null
      : g.jsx(ka, {
          ...f.portalProps,
          withinPortal: f.withinPortal,
          children: g.jsx(is, {
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
                : (y = f.transitionProps) == null
                ? void 0
                : y.duration,
            children: (b) =>
              g.jsx(_a, {
                active: f.trapFocus,
                children: g.jsxs(X, {
                  ...m,
                  ...d,
                  variant: a,
                  ref: h,
                  onKeyDownCapture: Yb(f.onClose, {
                    active: f.closeOnEscape,
                    onTrigger: p,
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
                    g.jsx(j0, {
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
zf.classes = F0;
zf.displayName = "@mantine/core/PopoverDropdown";
const tk = { refProp: "ref", popupType: "dialog" },
  M0 = G((e, t) => {
    const {
      children: n,
      refProp: r,
      popupType: o,
      ...s
    } = W("PopoverTarget", tk, e);
    if (!no(n))
      throw new Error(
        "Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = s,
      l = $0(),
      a = Mt(l.reference, n.ref, t),
      c = l.withRoles
        ? {
            "aria-haspopup": o,
            "aria-expanded": l.opened,
            "aria-controls": l.getDropdownId(),
            id: l.getTargetId(),
          }
        : {};
    return x.cloneElement(n, {
      ...i,
      ...c,
      ...l.targetProps,
      className: ft(l.targetProps.className, i.className, n.props.className),
      [r]: a,
      ...(l.controlled ? null : { onClick: l.onToggle }),
    });
  });
M0.displayName = "@mantine/core/PopoverTarget";
function nk({ opened: e, floating: t, position: n, positionDependencies: r }) {
  const [o, s] = x.useState(0);
  x.useEffect(() => {
    if (t.refs.reference.current && t.refs.floating.current)
      return __(t.refs.reference.current, t.refs.floating.current, t.update);
  }, [t.refs.reference.current, t.refs.floating.current, e, o, n]),
    qr(() => {
      t.update();
    }, r),
    qr(() => {
      s((i) => i + 1);
    }, [e]);
}
function rk(e) {
  if (e === void 0) return { shift: !0, flip: !0 };
  const t = { ...e };
  return (
    e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t
  );
}
function ok(e, t) {
  const n = rk(e.middlewares),
    r = [k_(e.offset)];
  return (
    n.shift &&
      r.push(
        R_(
          typeof n.shift == "boolean"
            ? { limiter: wh(), padding: 5 }
            : { limiter: wh(), padding: 5, ...n.shift }
        )
      ),
    n.flip && r.push(typeof n.flip == "boolean" ? gh() : gh(n.flip)),
    n.inline && r.push(typeof n.inline == "boolean" ? vh() : vh(n.inline)),
    r.push(T_({ element: e.arrowRef, padding: e.arrowOffset })),
    (n.size || e.width === "target") &&
      r.push(
        D_({
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
function sk(e) {
  const [t, n] = sn({
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
    s = U_({
      strategy: e.strategy,
      placement: e.position,
      middleware: ok(e, () => s),
    });
  return (
    nk({
      opened: e.opened,
      position: e.position,
      positionDependencies: e.positionDependencies || [],
      floating: s,
    }),
    qr(() => {
      var i;
      (i = e.onPositionChange) == null || i.call(e, s.placement);
    }, [s.placement]),
    qr(() => {
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
const ik = {
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
    zIndex: ro("popover"),
    __staticSelector: "Popover",
    width: "max-content",
  },
  lk = (e, { radius: t, shadow: n }) => ({
    dropdown: {
      "--popover-radius": t === void 0 ? void 0 : Rn(t),
      "--popover-shadow": vf(n),
    },
  });
function un(e) {
  var ve, Ke, Re, $e, U, re;
  const t = W("Popover", ik, e),
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
      arrowOffset: p,
      arrowRadius: m,
      arrowPosition: h,
      unstyled: S,
      classNames: v,
      styles: w,
      closeOnClickOutside: y,
      withinPortal: b,
      portalProps: E,
      closeOnEscape: C,
      clickOutsideEvents: R,
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
      withRoles: k,
      disabled: _,
      returnFocus: $,
      variant: O,
      keepMounted: I,
      vars: q,
      floatingStrategy: Q,
      ...ee
    } = t,
    ne = de({
      name: T,
      props: t,
      classes: F0,
      classNames: v,
      styles: w,
      unstyled: S,
      rootSelector: "dropdown",
      vars: q,
      varsResolver: lk,
    }),
    te = x.useRef(null),
    [me, oe] = x.useState(null),
    [le, Z] = x.useState(null),
    { dir: he } = _f(),
    ae = Cr(j),
    se = sk({
      middlewares: u,
      width: c,
      position: Y_(he, r),
      offset: typeof o == "number" ? o + (d ? f / 2 : 0) : o,
      arrowRef: te,
      arrowOffset: p,
      onPositionChange: s,
      positionDependencies: i,
      opened: l,
      defaultOpened: P,
      onChange: M,
      onOpen: N,
      onClose: L,
      strategy: Q,
    });
  Gb(() => y && se.onClose(), R, [me, le]);
  const ke = x.useCallback(
      (ie) => {
        oe(ie), se.floating.refs.setReference(ie);
      },
      [se.floating.refs.setReference]
    ),
    Ie = x.useCallback(
      (ie) => {
        Z(ie), se.floating.refs.setFloating(ie);
      },
      [se.floating.refs.setFloating]
    );
  return g.jsx(G_, {
    value: {
      returnFocus: $,
      disabled: _,
      controlled: se.controlled,
      reference: ke,
      floating: Ie,
      x: se.floating.x,
      y: se.floating.y,
      arrowX:
        (Re =
          (Ke = (ve = se.floating) == null ? void 0 : ve.middlewareData) == null
            ? void 0
            : Ke.arrow) == null
          ? void 0
          : Re.x,
      arrowY:
        (re =
          (U = ($e = se.floating) == null ? void 0 : $e.middlewareData) == null
            ? void 0
            : U.arrow) == null
          ? void 0
          : re.y,
      opened: se.opened,
      arrowRef: te,
      transitionProps: a,
      width: c,
      withArrow: d,
      arrowSize: f,
      arrowOffset: p,
      arrowRadius: m,
      arrowPosition: h,
      placement: se.floating.placement,
      trapFocus: D,
      withinPortal: b,
      portalProps: E,
      zIndex: B,
      radius: V,
      shadow: A,
      closeOnEscape: C,
      onClose: se.onClose,
      onToggle: se.onToggle,
      getTargetId: () => `${ae}-target`,
      getDropdownId: () => `${ae}-dropdown`,
      withRoles: k,
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
un.Target = M0;
un.Dropdown = zf;
un.displayName = "@mantine/core/Popover";
un.extend = (e) => e;
var en = {
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
const ak = x.forwardRef(({ className: e, ...t }, n) =>
    g.jsxs(X, {
      component: "span",
      className: ft(en.barsLoader, e),
      ...t,
      ref: n,
      children: [
        g.jsx("span", { className: en.bar }),
        g.jsx("span", { className: en.bar }),
        g.jsx("span", { className: en.bar }),
      ],
    })
  ),
  ck = x.forwardRef(({ className: e, ...t }, n) =>
    g.jsxs(X, {
      component: "span",
      className: ft(en.dotsLoader, e),
      ...t,
      ref: n,
      children: [
        g.jsx("span", { className: en.dot }),
        g.jsx("span", { className: en.dot }),
        g.jsx("span", { className: en.dot }),
      ],
    })
  ),
  uk = x.forwardRef(({ className: e, ...t }, n) =>
    g.jsx(X, {
      component: "span",
      className: ft(en.ovalLoader, e),
      ...t,
      ref: n,
    })
  ),
  I0 = { bars: ak, oval: uk, dots: ck },
  dk = { loaders: I0, type: "oval" },
  fk = (e, { size: t, color: n }) => ({
    root: {
      "--loader-size": Pe(t, "loader-size"),
      "--loader-color": n ? qo(n, e) : void 0,
    },
  }),
  Si = G((e, t) => {
    const n = W("Loader", dk, e),
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
        variant: p,
        children: m,
        ...h
      } = n,
      S = de({
        name: "Loader",
        props: n,
        classes: en,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: d,
        vars: i,
        varsResolver: fk,
      });
    return m
      ? g.jsx(X, { ...S("root"), ref: t, ...h, children: m })
      : g.jsx(X, {
          ...S("root"),
          ref: t,
          component: f[s],
          variant: p,
          size: r,
          ...h,
        });
  });
Si.defaultLoaders = I0;
Si.classes = en;
Si.displayName = "@mantine/core/Loader";
const z0 = x.forwardRef(
  ({ size: e = "var(--cb-icon-size, 70%)", style: t, ...n }, r) =>
    g.jsx("svg", {
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { ...t, width: e, height: e },
      ref: r,
      ...n,
      children: g.jsx("path", {
        d: "M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    })
);
z0.displayName = "@mantine/core/CloseIcon";
var B0 = { root: "m_86a44da5", "root--subtle": "m_220c80f2" };
const pk = { variant: "subtle" },
  mk = (e, { size: t, radius: n, iconSize: r }) => ({
    root: {
      "--cb-size": Pe(t, "cb-size"),
      "--cb-radius": n === void 0 ? void 0 : Rn(n),
      "--cb-icon-size": z(r),
    },
  }),
  Gr = Un((e, t) => {
    const n = W("CloseButton", pk, e),
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
        disabled: p,
        variant: m,
        icon: h,
        mod: S,
        ...v
      } = n,
      w = de({
        name: "CloseButton",
        props: n,
        className: l,
        style: c,
        classes: B0,
        classNames: a,
        styles: u,
        unstyled: d,
        vars: s,
        varsResolver: mk,
      });
    return g.jsxs(Mn, {
      ref: t,
      ...v,
      unstyled: d,
      variant: m,
      disabled: p,
      mod: [{ disabled: p || f }, S],
      ...w("root", { variant: m, active: !p && !f }),
      children: [h || g.jsx(z0, {}), o],
    });
  });
Gr.classes = B0;
Gr.displayName = "@mantine/core/CloseButton";
function hk(e) {
  return x.Children.toArray(e).filter(Boolean);
}
var V0 = { root: "m_4081bf90" };
const gk = {
    preventGrowOverflow: !0,
    gap: "md",
    align: "center",
    justify: "flex-start",
    wrap: "wrap",
  },
  yk = (
    e,
    { grow: t, preventGrowOverflow: n, gap: r, align: o, justify: s, wrap: i },
    { childWidth: l }
  ) => ({
    root: {
      "--group-child-width": t && n ? l : void 0,
      "--group-gap": xa(r),
      "--group-align": o,
      "--group-justify": s,
      "--group-wrap": i,
    },
  }),
  rr = G((e, t) => {
    const n = W("Group", gk, e),
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
        grow: p,
        preventGrowOverflow: m,
        vars: h,
        variant: S,
        __size: v,
        mod: w,
        ...y
      } = n,
      b = hk(a),
      E = b.length,
      C = xa(c ?? "md"),
      D = { childWidth: `calc(${100 / E}% - (${C} - ${C} / ${E}))` },
      L = de({
        name: "Group",
        props: n,
        stylesCtx: D,
        className: o,
        style: s,
        classes: V0,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: h,
        varsResolver: yk,
      });
    return g.jsx(X, {
      ...L("root"),
      ref: t,
      variant: S,
      mod: [{ grow: p }, w],
      size: v,
      ...y,
      children: b,
    });
  });
rr.classes = V0;
rr.displayName = "@mantine/core/Group";
var H0 = { root: "m_9814e45f" };
const vk = { zIndex: ro("modal") },
  wk = (
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
        ((n !== void 0 || r !== void 0) && wn(n || "#000", r ?? 0.6)) ||
        void 0,
      "--overlay-filter": o ? `blur(${z(o)})` : void 0,
      "--overlay-radius": s === void 0 ? void 0 : Rn(s),
      "--overlay-z-index": i == null ? void 0 : i.toString(),
    },
  }),
  ai = Un((e, t) => {
    const n = W("Overlay", vk, e),
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
        zIndex: p,
        gradient: m,
        blur: h,
        color: S,
        backgroundOpacity: v,
        mod: w,
        ...y
      } = n,
      b = de({
        name: "Overlay",
        props: n,
        classes: H0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: wk,
      });
    return g.jsx(X, {
      ref: t,
      ...b("root"),
      mod: [{ center: u, fixed: c }, w],
      ...y,
      children: d,
    });
  });
ai.classes = H0;
ai.displayName = "@mantine/core/Overlay";
const [xk, qn] = br("ModalBase component was not found in tree");
function Sk({ opened: e, transitionDuration: t }) {
  const [n, r] = x.useState(e),
    o = x.useRef(),
    i = xf() ? 0 : t;
  return (
    x.useEffect(
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
function bk({
  id: e,
  transitionProps: t,
  opened: n,
  trapFocus: r,
  closeOnEscape: o,
  onClose: s,
  returnFocus: i,
}) {
  const l = Cr(e),
    [a, c] = x.useState(!1),
    [u, d] = x.useState(!1),
    f =
      typeof (t == null ? void 0 : t.duration) == "number"
        ? t == null
          ? void 0
          : t.duration
        : 200,
    p = Sk({ opened: n, transitionDuration: f });
  return (
    aC(
      "keydown",
      (m) => {
        var h;
        m.key === "Escape" &&
          o &&
          n &&
          ((h = m.target) == null
            ? void 0
            : h.getAttribute("data-mantine-stop-propagation")) !== "true" &&
          s();
      },
      { capture: !0 }
    ),
    Yv({ opened: n, shouldReturnFocus: r && i }),
    {
      _id: l,
      titleMounted: a,
      bodyMounted: u,
      shouldLockScroll: p,
      setTitleMounted: c,
      setBodyMounted: d,
    }
  );
}
const Ck = x.forwardRef(
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
      zIndex: p,
      shadow: m,
      padding: h,
      __vars: S,
      unstyled: v,
      removeScrollProps: w,
      ...y
    },
    b
  ) => {
    const {
      _id: E,
      titleMounted: C,
      bodyMounted: R,
      shouldLockScroll: D,
      setTitleMounted: L,
      setBodyMounted: N,
    } = bk({
      id: r,
      transitionProps: o,
      opened: t,
      trapFocus: s,
      closeOnEscape: i,
      onClose: n,
      returnFocus: l,
    });
    return g.jsx(ka, {
      ...u,
      withinPortal: c,
      children: g.jsx(xk, {
        value: {
          opened: t,
          onClose: n,
          closeOnClickOutside: a,
          transitionProps: { ...o, keepMounted: e },
          getTitleId: () => `${E}-title`,
          getBodyId: () => `${E}-body`,
          titleMounted: C,
          bodyMounted: R,
          setTitleMounted: L,
          setBodyMounted: N,
          trapFocus: s,
          closeOnEscape: i,
          zIndex: p,
          unstyled: v,
        },
        children: g.jsx(Vv, {
          enabled: D && d,
          ...w,
          children: g.jsx(X, {
            ref: b,
            ...y,
            __vars: {
              ...S,
              "--mb-z-index": (p || ro("modal")).toString(),
              "--mb-shadow": vf(m),
              "--mb-padding": xa(h),
            },
            children: f,
          }),
        }),
      }),
    });
  }
);
function Ek() {
  const e = qn();
  return (
    x.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []),
    e.getBodyId()
  );
}
var Qo = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311",
};
const W0 = x.forwardRef(({ className: e, ...t }, n) => {
  const r = Ek(),
    o = qn();
  return g.jsx(X, {
    ref: n,
    ...t,
    id: r,
    className: ft({ [Qo.body]: !o.unstyled }, e),
  });
});
W0.displayName = "@mantine/core/ModalBaseBody";
const U0 = x.forwardRef(({ className: e, onClick: t, ...n }, r) => {
  const o = qn();
  return g.jsx(Gr, {
    ref: r,
    ...n,
    onClick: (s) => {
      o.onClose(), t == null || t(s);
    },
    className: ft({ [Qo.close]: !o.unstyled }, e),
    unstyled: o.unstyled,
  });
});
U0.displayName = "@mantine/core/ModalBaseCloseButton";
const _k = x.forwardRef(
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
      const l = qn();
      return g.jsx(is, {
        mounted: l.opened,
        transition: "pop",
        ...l.transitionProps,
        ...e,
        children: (a) =>
          g.jsx("div", {
            ...n,
            className: ft({ [Qo.inner]: !l.unstyled }, n.className),
            children: g.jsx(_a, {
              active: l.opened && l.trapFocus,
              children: g.jsx(Tf, {
                ...s,
                component: "section",
                role: "dialog",
                tabIndex: -1,
                "aria-modal": !0,
                "aria-describedby": l.bodyMounted ? l.getBodyId() : void 0,
                "aria-labelledby": l.titleMounted ? l.getTitleId() : void 0,
                ref: i,
                style: [o, a],
                className: ft({ [Qo.content]: !l.unstyled }, t),
                unstyled: l.unstyled,
                children: s.children,
              }),
            }),
          }),
      });
    }
  ),
  Y0 = x.forwardRef(({ className: e, ...t }, n) => {
    const r = qn();
    return g.jsx(X, {
      component: "header",
      ref: n,
      className: ft({ [Qo.header]: !r.unstyled }, e),
      ...t,
    });
  });
Y0.displayName = "@mantine/core/ModalBaseHeader";
const kk = { duration: 200, timingFunction: "ease", transition: "fade" };
function Rk(e) {
  const t = qn();
  return { ...kk, ...t.transitionProps, ...e };
}
const q0 = x.forwardRef(
  ({ onClick: e, transitionProps: t, style: n, ...r }, o) => {
    const s = qn(),
      i = Rk(t);
    return g.jsx(is, {
      mounted: s.opened,
      ...i,
      transition: "fade",
      children: (l) =>
        g.jsx(ai, {
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
q0.displayName = "@mantine/core/ModalBaseOverlay";
function Dk() {
  const e = qn();
  return (
    x.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []),
    e.getTitleId()
  );
}
const K0 = x.forwardRef(({ className: e, ...t }, n) => {
  const r = Dk(),
    o = qn();
  return g.jsx(X, {
    component: "h2",
    ref: n,
    className: ft({ [Qo.title]: !o.unstyled }, e),
    ...t,
    id: r,
  });
});
K0.displayName = "@mantine/core/ModalBaseTitle";
function Pk({ children: e }) {
  return g.jsx(g.Fragment, { children: e });
}
const [Tk, ls] = yf({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0,
});
var Kt = {
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
const Rh = {},
  Nk = (e, { size: t }) => ({
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${ot(t)} - ${z(2)})`,
    },
  }),
  Ra = G((e, t) => {
    const n = W("InputDescription", Rh, e),
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
        ...p
      } = W("InputDescription", Rh, n),
      m = ls(),
      h = de({
        name: ["InputWrapper", u],
        props: n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "description",
        vars: a,
        varsResolver: Nk,
      }),
      S = (d && (m == null ? void 0 : m.getStyles)) || h;
    return g.jsx(X, {
      component: "p",
      ref: t,
      variant: f,
      size: c,
      ...S(
        "description",
        m != null && m.getStyles ? { className: o, style: s } : void 0
      ),
      ...p,
    });
  });
Ra.classes = Kt;
Ra.displayName = "@mantine/core/InputDescription";
const Ok = {},
  jk = (e, { size: t }) => ({
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${ot(t)} - ${z(2)})`,
    },
  }),
  Da = G((e, t) => {
    const n = W("InputError", Ok, e),
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
        ...p
      } = n,
      m = de({
        name: ["InputWrapper", u],
        props: n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "error",
        vars: a,
        varsResolver: jk,
      }),
      h = ls(),
      S = (d && (h == null ? void 0 : h.getStyles)) || m;
    return g.jsx(X, {
      component: "p",
      ref: t,
      variant: f,
      size: c,
      ...S(
        "error",
        h != null && h.getStyles ? { className: o, style: s } : void 0
      ),
      ...p,
    });
  });
Da.classes = Kt;
Da.displayName = "@mantine/core/InputError";
const Dh = { labelElement: "label" },
  $k = (e, { size: t }) => ({
    label: { "--input-label-size": ot(t), "--input-asterisk-color": void 0 },
  }),
  Pa = G((e, t) => {
    const n = W("InputLabel", Dh, e),
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
        onMouseDown: p,
        children: m,
        __staticSelector: h,
        variant: S,
        mod: v,
        ...w
      } = W("InputLabel", Dh, n),
      y = de({
        name: ["InputWrapper", h],
        props: n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "label",
        vars: a,
        varsResolver: $k,
      }),
      b = ls(),
      E = (b == null ? void 0 : b.getStyles) || y;
    return g.jsxs(X, {
      ...E(
        "label",
        b != null && b.getStyles ? { className: o, style: s } : void 0
      ),
      component: c,
      variant: S,
      size: u,
      ref: t,
      htmlFor: c === "label" ? f : void 0,
      mod: [{ required: d }, v],
      onMouseDown: (C) => {
        p == null || p(C),
          !C.defaultPrevented && C.detail > 1 && C.preventDefault();
      },
      ...w,
      children: [
        m,
        d &&
          g.jsx("span", {
            ...E("required"),
            "aria-hidden": !0,
            children: " *",
          }),
      ],
    });
  });
Pa.classes = Kt;
Pa.displayName = "@mantine/core/InputLabel";
const Ph = {},
  Bf = G((e, t) => {
    const n = W("InputPlaceholder", Ph, e),
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
        ...p
      } = W("InputPlaceholder", Ph, n),
      m = de({
        name: ["InputPlaceholder", c],
        props: n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "placeholder",
      });
    return g.jsx(X, {
      ...m("placeholder"),
      mod: [{ error: !!d }, f],
      component: "span",
      variant: u,
      ref: t,
      ...p,
    });
  });
Bf.classes = Kt;
Bf.displayName = "@mantine/core/InputPlaceholder";
function Lk(e, { hasDescription: t, hasError: n }) {
  const r = e.findIndex((a) => a === "input"),
    o = e[r - 1],
    s = e[r + 1];
  return {
    offsetBottom: (t && s === "description") || (n && s === "error"),
    offsetTop: (t && o === "description") || (n && o === "error"),
  };
}
const Ak = {
    labelElement: "label",
    inputContainer: (e) => e,
    inputWrapperOrder: ["label", "description", "input", "error"],
  },
  Fk = (e, { size: t }) => ({
    label: { "--input-label-size": ot(t), "--input-asterisk-color": void 0 },
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${ot(t)} - ${z(2)})`,
    },
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${ot(t)} - ${z(2)})`,
    },
  }),
  Vf = G((e, t) => {
    const n = W("InputWrapper", Ak, e),
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
        inputWrapperOrder: p,
        label: m,
        error: h,
        description: S,
        labelProps: v,
        descriptionProps: w,
        errorProps: y,
        labelElement: b,
        children: E,
        withAsterisk: C,
        id: R,
        required: D,
        __stylesApiProps: L,
        mod: N,
        ...M
      } = n,
      B = de({
        name: ["InputWrapper", d],
        props: L || n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: Fk,
      }),
      V = { size: c, variant: u, __staticSelector: d },
      A = Cr(R),
      j = typeof C == "boolean" ? C : D,
      P = (y == null ? void 0 : y.id) || `${A}-error`,
      T = (w == null ? void 0 : w.id) || `${A}-description`,
      k = A,
      _ = !!h && typeof h != "boolean",
      $ = !!S,
      O = `${_ ? P : ""} ${$ ? T : ""}`,
      I = O.trim().length > 0 ? O.trim() : void 0,
      q = (v == null ? void 0 : v.id) || `${A}-label`,
      Q =
        m &&
        g.jsx(
          Pa,
          {
            labelElement: b,
            id: q,
            htmlFor: k,
            required: j,
            ...V,
            ...v,
            children: m,
          },
          "label"
        ),
      ee =
        $ &&
        g.jsx(
          Ra,
          {
            ...w,
            ...V,
            size: (w == null ? void 0 : w.size) || V.size,
            id: (w == null ? void 0 : w.id) || T,
            children: S,
          },
          "description"
        ),
      ne = g.jsx(x.Fragment, { children: f(E) }, "input"),
      te =
        _ &&
        x.createElement(
          Da,
          {
            ...y,
            ...V,
            size: (y == null ? void 0 : y.size) || V.size,
            key: "error",
            id: (y == null ? void 0 : y.id) || P,
          },
          h
        ),
      me = p.map((oe) => {
        switch (oe) {
          case "label":
            return Q;
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
    return g.jsx(Tk, {
      value: {
        getStyles: B,
        describedBy: I,
        inputId: k,
        labelId: q,
        ...Lk(p, { hasDescription: $, hasError: _ }),
      },
      children: g.jsx(X, {
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
Vf.classes = Kt;
Vf.displayName = "@mantine/core/InputWrapper";
const Mk = {
    variant: "default",
    leftSectionPointerEvents: "none",
    rightSectionPointerEvents: "none",
    withAria: !0,
    withErrorStyles: !0,
  },
  Ik = (e, t, n) => ({
    wrapper: {
      "--input-margin-top": n.offsetTop
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-margin-bottom": n.offsetBottom
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-height": Pe(t.size, "input-height"),
      "--input-fz": ot(t.size),
      "--input-radius": t.radius === void 0 ? void 0 : Rn(t.radius),
      "--input-left-section-width":
        t.leftSectionWidth !== void 0 ? z(t.leftSectionWidth) : void 0,
      "--input-right-section-width":
        t.rightSectionWidth !== void 0 ? z(t.rightSectionWidth) : void 0,
      "--input-padding-y": t.multiline ? Pe(t.size, "input-padding-y") : void 0,
      "--input-left-section-pointer-events": t.leftSectionPointerEvents,
      "--input-right-section-pointer-events": t.rightSectionPointerEvents,
    },
  }),
  it = Un((e, t) => {
    const n = W("Input", Mk, e),
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
        error: p,
        disabled: m,
        leftSection: h,
        leftSectionProps: S,
        leftSectionWidth: v,
        rightSection: w,
        rightSectionProps: y,
        rightSectionWidth: b,
        rightSectionPointerEvents: E,
        leftSectionPointerEvents: C,
        variant: R,
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
      { styleProps: T, rest: k } = rs(P),
      _ = ls(),
      $ = {
        offsetBottom: _ == null ? void 0 : _.offsetBottom,
        offsetTop: _ == null ? void 0 : _.offsetTop,
      },
      O = de({
        name: ["Input", c],
        props: u || n,
        classes: Kt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        stylesCtx: $,
        rootSelector: "wrapper",
        vars: D,
        varsResolver: Ik,
      }),
      I = V
        ? {
            required: a,
            disabled: m,
            "aria-invalid": !!p,
            "aria-describedby": _ == null ? void 0 : _.describedBy,
            id: (_ == null ? void 0 : _.inputId) || B,
          }
        : {};
    return g.jsxs(X, {
      ...O("wrapper"),
      ...T,
      ...f,
      mod: [
        {
          error: !!p && A,
          pointer: L,
          disabled: m,
          multiline: N,
          "data-with-right-section": !!w,
          "data-with-left-section": !!h,
        },
        j,
      ],
      variant: R,
      size: d,
      children: [
        h &&
          g.jsx("div", {
            ...S,
            "data-position": "left",
            ...O("section", {
              className: S == null ? void 0 : S.className,
              style: S == null ? void 0 : S.style,
            }),
            children: h,
          }),
        g.jsx(X, {
          component: "input",
          ...k,
          ...I,
          ref: t,
          required: a,
          mod: { disabled: m, error: !!p && A },
          variant: R,
          ...O("input"),
        }),
        w &&
          g.jsx("div", {
            ...y,
            "data-position": "right",
            ...O("section", {
              className: y == null ? void 0 : y.className,
              style: y == null ? void 0 : y.style,
            }),
            children: w,
          }),
      ],
    });
  });
it.classes = Kt;
it.Wrapper = Vf;
it.Label = Pa;
it.Error = Da;
it.Description = Ra;
it.Placeholder = Bf;
it.displayName = "@mantine/core/Input";
function zk(e, t, n) {
  const r = W(e, t, n),
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
      __stylesApiProps: p,
      errorProps: m,
      labelProps: h,
      descriptionProps: S,
      wrapperProps: v,
      id: w,
      size: y,
      style: b,
      inputContainer: E,
      inputWrapperOrder: C,
      withAsterisk: R,
      variant: D,
      vars: L,
      mod: N,
      ...M
    } = r,
    { styleProps: B, rest: V } = rs(M),
    A = {
      label: o,
      description: s,
      error: i,
      required: l,
      classNames: a,
      className: u,
      __staticSelector: f,
      __stylesApiProps: p || r,
      errorProps: m,
      labelProps: h,
      descriptionProps: S,
      unstyled: d,
      styles: c,
      size: y,
      style: b,
      inputContainer: E,
      inputWrapperOrder: C,
      withAsterisk: R,
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
      size: y,
      __staticSelector: f,
      __stylesApiProps: p || r,
      error: i,
      variant: D,
      id: w,
    },
  };
}
const Bk = { __staticSelector: "InputBase", withAria: !0 },
  dn = Un((e, t) => {
    const { inputProps: n, wrapperProps: r, ...o } = zk("InputBase", Bk, e);
    return g.jsx(it.Wrapper, {
      ...r,
      children: g.jsx(it, { ...n, ...o, ref: t }),
    });
  });
dn.classes = { ...it.classes, ...it.Wrapper.classes };
dn.displayName = "@mantine/core/InputBase";
function ed({ style: e, size: t = 16, ...n }) {
  return g.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { ...e, width: z(t), height: z(t), display: "block" },
    ...n,
    children: g.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
ed.displayName = "@mantine/core/AccordionChevron";
var G0 = { root: "m_b6d8b162" };
function Vk(e) {
  if (e === "start") return "start";
  if (e === "end" || e) return "end";
}
const Hk = { inherit: !1 },
  Wk = (e, { variant: t, lineClamp: n, gradient: r, size: o, color: s }) => ({
    root: {
      "--text-fz": ot(o),
      "--text-lh": qb(o),
      "--text-gradient": t === "gradient" ? Ku(r, e) : void 0,
      "--text-line-clamp": typeof n == "number" ? n.toString() : void 0,
      "--text-color": s ? qo(s, e) : void 0,
    },
  }),
  Ar = Un((e, t) => {
    const n = W("Text", Hk, e),
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
        classNames: p,
        styles: m,
        unstyled: h,
        variant: S,
        mod: v,
        size: w,
        ...y
      } = n,
      b = de({
        name: ["Text", c],
        props: n,
        classes: G0,
        className: d,
        style: f,
        classNames: p,
        styles: m,
        unstyled: h,
        vars: u,
        varsResolver: Wk,
      });
    return g.jsx(X, {
      ...b("root", { focusable: !0 }),
      ref: t,
      component: a ? "span" : "p",
      variant: S,
      mod: [
        {
          "data-truncate": Vk(o),
          "data-line-clamp": typeof r == "number",
          "data-inline": s,
          "data-inherit": i,
        },
        v,
      ],
      size: w,
      ...y,
    });
  });
Ar.classes = G0;
Ar.displayName = "@mantine/core/Text";
function X0(e) {
  return typeof e == "string"
    ? { value: e, label: e }
    : "value" in e && !("label" in e)
    ? { value: e.value, label: e.value, disabled: e.disabled }
    : typeof e == "number"
    ? { value: e.toString(), label: e.toString() }
    : "group" in e
    ? { group: e.group, items: e.items.map((t) => X0(t)) }
    : e;
}
function Hf(e) {
  return e ? e.map((t) => X0(t)) : [];
}
function Ta(e) {
  return e.reduce(
    (t, n) => ("group" in n ? { ...t, ...Ta(n.items) } : ((t[n.value] = n), t)),
    {}
  );
}
var Dt = {
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
const Uk = { error: null },
  Yk = (e, { size: t }) => ({
    chevron: { "--combobox-chevron-size": Pe(t, "combobox-chevron-size") },
  }),
  Wf = G((e, t) => {
    const n = W("ComboboxChevron", Uk, e),
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
      p = de({
        name: "ComboboxChevron",
        classes: Dt,
        props: n,
        style: s,
        className: i,
        classNames: l,
        styles: a,
        unstyled: c,
        vars: u,
        varsResolver: Yk,
        rootSelector: "chevron",
      });
    return g.jsx(X, {
      component: "svg",
      ...f,
      ...p("chevron"),
      size: r,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      mod: ["combobox-chevron", { error: o }, d],
      ref: t,
      children: g.jsx("path", {
        d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    });
  });
Wf.classes = Dt;
Wf.displayName = "@mantine/core/ComboboxChevron";
const [qk, Gt] = br("Combobox component was not found in tree"),
  Q0 = x.forwardRef(
    ({ size: e, onMouseDown: t, onClick: n, onClear: r, ...o }, s) =>
      g.jsx(Gr, {
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
Q0.displayName = "@mantine/core/ComboboxClearButton";
const Kk = {},
  Uf = G((e, t) => {
    const {
        classNames: n,
        styles: r,
        className: o,
        style: s,
        hidden: i,
        ...l
      } = W("ComboboxDropdown", Kk, e),
      a = Gt();
    return g.jsx(un.Dropdown, {
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
Uf.classes = Dt;
Uf.displayName = "@mantine/core/ComboboxDropdown";
const Gk = { refProp: "ref" },
  J0 = G((e, t) => {
    const { children: n, refProp: r } = W("ComboboxDropdownTarget", Gk, e);
    if ((Gt(), !no(n)))
      throw new Error(
        "Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    return g.jsx(un.Target, { ref: t, refProp: r, children: n });
  });
J0.displayName = "@mantine/core/ComboboxDropdownTarget";
const Xk = {},
  Yf = G((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxEmpty", Xk, e),
      a = Gt();
    return g.jsx(X, {
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
Yf.classes = Dt;
Yf.displayName = "@mantine/core/ComboboxEmpty";
function qf({
  onKeyDown: e,
  withKeyboardNavigation: t,
  withAriaAttributes: n,
  withExpandedAttribute: r,
  targetType: o,
  autoComplete: s,
}) {
  const i = Gt(),
    [l, a] = x.useState(null),
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
const Qk = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  Z0 = G((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxEventsTarget", Qk, e);
    if (!no(n))
      throw new Error(
        "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Gt(),
      d = qf({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      });
    return x.cloneElement(n, {
      ...d,
      ...c,
      [r]: Mt(t, u.store.targetRef, n == null ? void 0 : n.ref),
    });
  });
Z0.displayName = "@mantine/core/ComboboxEventsTarget";
const Jk = {},
  Kf = G((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxFooter", Jk, e),
      a = Gt();
    return g.jsx(X, {
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
Kf.classes = Dt;
Kf.displayName = "@mantine/core/ComboboxFooter";
const Zk = {},
  Gf = G((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        children: l,
        label: a,
        ...c
      } = W("ComboboxGroup", Zk, e),
      u = Gt();
    return g.jsxs(X, {
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
          g.jsx("div", {
            ...u.getStyles("groupLabel", { classNames: n, styles: s }),
            children: a,
          }),
        l,
      ],
    });
  });
Gf.classes = Dt;
Gf.displayName = "@mantine/core/ComboboxGroup";
const eR = {},
  Xf = G((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxHeader", eR, e),
      a = Gt();
    return g.jsx(X, {
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
Xf.classes = Dt;
Xf.displayName = "@mantine/core/ComboboxHeader";
function ew({ value: e, valuesDivider: t = ",", ...n }) {
  return g.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e || "",
    ...n,
  });
}
ew.displayName = "@mantine/core/ComboboxHiddenInput";
const tR = {},
  Qf = G((e, t) => {
    const n = W("ComboboxOption", tR, e),
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
        disabled: p,
        selected: m,
        mod: h,
        ...S
      } = n,
      v = Gt(),
      w = x.useId(),
      y = c || w;
    return g.jsx(X, {
      ...v.getStyles("option", {
        className: o,
        classNames: r,
        styles: i,
        style: s,
      }),
      ...S,
      ref: t,
      id: y,
      mod: [
        "combobox-option",
        {
          "combobox-active": u,
          "combobox-disabled": p,
          "combobox-selected": m,
        },
        h,
      ],
      role: "option",
      onClick: (b) => {
        var E;
        p
          ? b.preventDefault()
          : ((E = v.onOptionSubmit) == null || E.call(v, n.value, n),
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
Qf.classes = Dt;
Qf.displayName = "@mantine/core/ComboboxOption";
const nR = {},
  Jf = G((e, t) => {
    const n = W("ComboboxOptions", nR, e),
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
      d = Gt(),
      f = Cr(l);
    return (
      x.useEffect(() => {
        d.store.setListId(f);
      }, [f]),
      g.jsx(X, {
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
        onMouseDown: (p) => {
          p.preventDefault(), a == null || a(p);
        },
      })
    );
  });
Jf.classes = Dt;
Jf.displayName = "@mantine/core/ComboboxOptions";
const rR = { withAriaAttributes: !0, withKeyboardNavigation: !0 },
  Zf = G((e, t) => {
    const n = W("ComboboxSearch", rR, e),
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
      f = Gt(),
      p = f.getStyles("search"),
      m = qf({
        targetType: "input",
        withAriaAttributes: l,
        withKeyboardNavigation: c,
        withExpandedAttribute: !1,
        onKeyDown: a,
        autoComplete: "off",
      });
    return g.jsx(it, {
      ref: Mt(t, f.store.searchRef),
      classNames: [{ input: p.className }, r],
      styles: [{ input: p.style }, o],
      size: u || f.size,
      ...m,
      ...d,
      __staticSelector: "Combobox",
    });
  });
Zf.classes = Dt;
Zf.displayName = "@mantine/core/ComboboxSearch";
const oR = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  tw = G((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxTarget", oR, e);
    if (!no(n))
      throw new Error(
        "Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Gt(),
      d = qf({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      }),
      f = x.cloneElement(n, { ...d, ...c });
    return g.jsx(un.Target, { ref: Mt(t, u.store.targetRef), children: f });
  });
tw.displayName = "@mantine/core/ComboboxTarget";
function sR(e, t, n) {
  for (let r = e - 1; r >= 0; r -= 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = t.length - 1; r > -1; r -= 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function iR(e, t, n) {
  for (let r = e + 1; r < t.length; r += 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = 0; r < t.length; r += 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function lR(e) {
  for (let t = 0; t < e.length; t += 1)
    if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function Na({
  defaultOpened: e,
  opened: t,
  onOpenedChange: n,
  onDropdownClose: r,
  onDropdownOpen: o,
  loop: s = !0,
  scrollBehavior: i = "instant",
} = {}) {
  const [l, a] = sn({ value: t, defaultValue: e, finalValue: !1, onChange: n }),
    c = x.useRef(null),
    u = x.useRef(-1),
    d = x.useRef(null),
    f = x.useRef(null),
    p = x.useRef(-1),
    m = x.useRef(-1),
    h = x.useRef(-1),
    S = x.useCallback(
      (P = "unknown") => {
        l || (a(!0), o == null || o(P));
      },
      [a, o, l]
    ),
    v = x.useCallback(
      (P = "unknown") => {
        l && (a(!1), r == null || r(P));
      },
      [a, r, l]
    ),
    w = x.useCallback(
      (P = "unknown") => {
        l ? v(P) : S(P);
      },
      [v, S, l]
    ),
    y = x.useCallback(() => {
      const P = document.querySelector(
        `#${c.current} [data-combobox-selected]`
      );
      P == null || P.removeAttribute("data-combobox-selected"),
        P == null || P.removeAttribute("aria-selected");
    }, []),
    b = x.useCallback(
      (P) => {
        const T = document.getElementById(c.current),
          k = T == null ? void 0 : T.querySelectorAll("[data-combobox-option]");
        if (!k) return null;
        const _ = P >= k.length ? 0 : P < 0 ? k.length - 1 : P;
        return (
          (u.current = _),
          k != null && k[_] && !k[_].hasAttribute("data-combobox-disabled")
            ? (y(),
              k[_].setAttribute("data-combobox-selected", "true"),
              k[_].setAttribute("aria-selected", "true"),
              k[_].scrollIntoView({ block: "nearest", behavior: i }),
              k[_].id)
            : null
        );
      },
      [i, y]
    ),
    E = x.useCallback(() => {
      const P = document.querySelector(`#${c.current} [data-combobox-active]`);
      if (P) {
        const T = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          k = Array.from(T).findIndex((_) => _ === P);
        return b(k);
      }
      return b(0);
    }, [b]),
    C = x.useCallback(
      () =>
        b(
          iR(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    R = x.useCallback(
      () =>
        b(
          sR(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    D = x.useCallback(
      () =>
        b(
          lR(document.querySelectorAll(`#${c.current} [data-combobox-option]`))
        ),
      [b]
    ),
    L = x.useCallback((P = "selected", T) => {
      h.current = window.setTimeout(() => {
        var $;
        const k = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          _ = Array.from(k).findIndex((O) =>
            O.hasAttribute(`data-combobox-${P}`)
          );
        (u.current = _),
          T != null &&
            T.scrollIntoView &&
            (($ = k[_]) == null ||
              $.scrollIntoView({ block: "nearest", behavior: i }));
      }, 0);
    }, []),
    N = x.useCallback(() => {
      (u.current = -1), y();
    }, [y]),
    M = x.useCallback(() => {
      const P = document.querySelectorAll(
          `#${c.current} [data-combobox-option]`
        ),
        T = P == null ? void 0 : P[u.current];
      T == null || T.click();
    }, []),
    B = x.useCallback((P) => {
      c.current = P;
    }, []),
    V = x.useCallback(() => {
      p.current = window.setTimeout(() => d.current.focus(), 0);
    }, []),
    A = x.useCallback(() => {
      m.current = window.setTimeout(() => f.current.focus(), 0);
    }, []),
    j = x.useCallback(() => u.current, []);
  return (
    x.useEffect(
      () => () => {
        window.clearTimeout(p.current),
          window.clearTimeout(m.current),
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
      selectActiveOption: E,
      selectNextOption: C,
      selectPreviousOption: R,
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
const aR = {
    keepMounted: !0,
    withinPortal: !0,
    resetSelectionOnOptionHover: !1,
    width: "target",
    transitionProps: { transition: "fade", duration: 0 },
  },
  cR = (e, { size: t, dropdownPadding: n }) => ({
    options: {
      "--combobox-option-fz": ot(t),
      "--combobox-option-padding": Pe(t, "combobox-option-padding"),
    },
    dropdown: {
      "--combobox-padding": n === void 0 ? void 0 : z(n),
      "--combobox-option-fz": ot(t),
      "--combobox-option-padding": Pe(t, "combobox-option-padding"),
    },
  });
function ue(e) {
  const t = W("Combobox", aR, e),
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
      __staticSelector: p,
      readOnly: m,
      ...h
    } = t,
    S = Na(),
    v = i || S,
    w = de({
      name: p || "Combobox",
      classes: Dt,
      props: t,
      classNames: n,
      styles: r,
      unstyled: o,
      vars: l,
      varsResolver: cR,
    }),
    y = () => {
      c == null || c(), v.closeDropdown();
    };
  return g.jsx(qk, {
    value: {
      getStyles: w,
      store: v,
      onOptionSubmit: a,
      size: u,
      resetSelectionOnOptionHover: f,
      readOnly: m,
    },
    children: g.jsx(un, {
      opened: v.dropdownOpened,
      ...h,
      onClose: y,
      withRoles: !1,
      unstyled: o,
      children: s,
    }),
  });
}
const uR = (e) => e;
ue.extend = uR;
ue.classes = Dt;
ue.displayName = "@mantine/core/Combobox";
ue.Target = tw;
ue.Dropdown = Uf;
ue.Options = Jf;
ue.Option = Qf;
ue.Search = Zf;
ue.Empty = Yf;
ue.Chevron = Wf;
ue.Footer = Kf;
ue.Header = Xf;
ue.EventsTarget = Z0;
ue.DropdownTarget = J0;
ue.Group = Gf;
ue.ClearButton = Q0;
ue.HiddenInput = ew;
var nw = {
  root: "m_5f75b09e",
  body: "m_5f6e695e",
  labelWrapper: "m_d3ea56bb",
  label: "m_8ee546b8",
  description: "m_328f68c0",
  error: "m_8e8a99cc",
};
const dR = nw,
  rw = x.forwardRef(
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
        labelPosition: p = "left",
        bodyElement: m = "div",
        labelElement: h = "label",
        variant: S,
        style: v,
        vars: w,
        mod: y,
        ...b
      },
      E
    ) => {
      const C = de({
        name: e,
        props: t,
        className: n,
        style: v,
        classes: nw,
        classNames: r,
        styles: o,
        unstyled: s,
      });
      return g.jsx(X, {
        ...C("root"),
        ref: E,
        __vars: { "--label-fz": ot(f), "--label-lh": Pe(f, "label-lh") },
        mod: [{ "label-position": p }, y],
        variant: S,
        size: f,
        ...b,
        children: g.jsxs(X, {
          component: m,
          htmlFor: m === "label" ? c : void 0,
          ...C("body"),
          children: [
            i,
            g.jsxs("div", {
              ...C("labelWrapper"),
              "data-disabled": u || void 0,
              children: [
                l &&
                  g.jsx(X, {
                    component: h,
                    htmlFor: h === "label" ? c : void 0,
                    ...C("label"),
                    "data-disabled": u || void 0,
                    children: l,
                  }),
                a &&
                  g.jsx(it.Description, {
                    size: f,
                    __inheritStyles: !1,
                    ...C("description"),
                    children: a,
                  }),
                d &&
                  typeof d != "boolean" &&
                  g.jsx(it.Error, {
                    size: f,
                    __inheritStyles: !1,
                    ...C("error"),
                    children: d,
                  }),
              ],
            }),
          ],
        }),
      });
    }
  );
rw.displayName = "@mantine/core/InlineInput";
const ow = x.createContext(null),
  fR = ow.Provider,
  pR = () => x.useContext(ow);
function mR({ children: e, role: t }) {
  const n = ls();
  return n
    ? g.jsx("div", {
        role: t,
        "aria-labelledby": n.labelId,
        "aria-describedby": n.describedBy,
        children: e,
      })
    : g.jsx(g.Fragment, { children: e });
}
const hR = {},
  ep = G((e, t) => {
    const {
        value: n,
        defaultValue: r,
        onChange: o,
        size: s,
        wrapperProps: i,
        children: l,
        readOnly: a,
        ...c
      } = W("CheckboxGroup", hR, e),
      [u, d] = sn({ value: n, defaultValue: r, finalValue: [], onChange: o }),
      f = (p) => {
        const m = p.currentTarget.value;
        !a && d(u.includes(m) ? u.filter((h) => h !== m) : [...u, m]);
      };
    return g.jsx(fR, {
      value: { value: u, onChange: f, size: s },
      children: g.jsx(it.Wrapper, {
        size: s,
        ref: t,
        ...i,
        ...c,
        labelElement: "div",
        __staticSelector: "CheckboxGroup",
        children: g.jsx(mR, { role: "group", children: l }),
      }),
    });
  });
ep.classes = it.Wrapper.classes;
ep.displayName = "@mantine/core/CheckboxGroup";
function sw({ size: e, style: t, ...n }) {
  const r = e !== void 0 ? { width: z(e), height: z(e), ...t } : t;
  return g.jsx("svg", {
    viewBox: "0 0 10 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: r,
    "aria-hidden": !0,
    ...n,
    children: g.jsx("path", {
      d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
function gR({ indeterminate: e, ...t }) {
  return e
    ? g.jsx("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 32 6",
        "aria-hidden": !0,
        ...t,
        children: g.jsx("rect", {
          width: "32",
          height: "6",
          fill: "currentColor",
          rx: "3",
        }),
      })
    : g.jsx(sw, { ...t });
}
var iw = {
  root: "m_bf2d988c",
  inner: "m_26062bec",
  input: "m_26063560",
  icon: "m_bf295423",
  "input--outline": "m_215c4542",
};
const yR = { labelPosition: "right", icon: gR },
  vR = (
    e,
    { radius: t, color: n, size: r, iconColor: o, variant: s, autoContrast: i }
  ) => {
    const l = ns({ color: n || e.primaryColor, theme: e }),
      a =
        l.isThemeColor && l.shade === void 0
          ? `var(--mantine-color-${l.color}-outline)`
          : l.color;
    return {
      root: {
        "--checkbox-size": Pe(r, "checkbox-size"),
        "--checkbox-radius": t === void 0 ? void 0 : Rn(t),
        "--checkbox-color": s === "outline" ? a : qo(n, e),
        "--checkbox-icon-color": o
          ? qo(o, e)
          : eE(i, e)
          ? e0({ color: n, theme: e })
          : void 0,
      },
    };
  },
  ci = G((e, t) => {
    const n = W("Checkbox", yR, e),
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
        radius: p,
        wrapperProps: m,
        children: h,
        checked: S,
        labelPosition: v,
        description: w,
        error: y,
        disabled: b,
        variant: E,
        indeterminate: C,
        icon: R,
        rootRef: D,
        iconColor: L,
        onChange: N,
        autoContrast: M,
        mod: B,
        ...V
      } = n,
      A = pR(),
      j = f || (A == null ? void 0 : A.size),
      P = R,
      T = de({
        name: "Checkbox",
        props: n,
        classes: iw,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: vR,
      }),
      { styleProps: k, rest: _ } = rs(V),
      $ = Cr(d),
      O = A
        ? {
            checked: A.value.includes(_.value),
            onChange: (I) => {
              A.onChange(I), N == null || N(I);
            },
          }
        : {};
    return g.jsx(rw, {
      ...T("root"),
      __staticSelector: "Checkbox",
      __stylesApiProps: n,
      id: $,
      size: j,
      labelPosition: v,
      label: u,
      description: w,
      error: y,
      disabled: b,
      classNames: r,
      styles: i,
      unstyled: l,
      "data-checked": O.checked || S || void 0,
      variant: E,
      ref: D,
      mod: B,
      ...k,
      ...m,
      children: g.jsxs(X, {
        ...T("inner"),
        mod: { "data-label-position": v },
        children: [
          g.jsx(X, {
            component: "input",
            id: $,
            ref: t,
            checked: S,
            disabled: b,
            mod: { error: !!y, indeterminate: C },
            ...T("input", { focusable: !0, variant: E }),
            onChange: N,
            ..._,
            ...O,
            type: "checkbox",
          }),
          g.jsx(P, { indeterminate: C, ...T("icon") }),
        ],
      }),
    });
  });
ci.classes = { ...iw, ...dR };
ci.displayName = "@mantine/core/Checkbox";
ci.Group = ep;
function Xr(e) {
  return "group" in e;
}
function lw({ options: e, search: t, limit: n }) {
  const r = t.trim().toLowerCase(),
    o = [];
  for (let s = 0; s < e.length; s += 1) {
    const i = e[s];
    if (o.length === n) return o;
    Xr(i) &&
      o.push({
        group: i.group,
        items: lw({ options: i.items, search: t, limit: n - o.length }),
      }),
      Xr(i) || (i.label.toLowerCase().includes(r) && o.push(i));
  }
  return o;
}
function wR(e) {
  if (e.length === 0) return !0;
  for (const t of e) if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function aw(e, t = new Set()) {
  if (Array.isArray(e))
    for (const n of e)
      if (Xr(n)) aw(n.items, t);
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
function xR(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function cw({
  data: e,
  withCheckIcon: t,
  value: n,
  checkIconPosition: r,
  unstyled: o,
  renderOption: s,
}) {
  if (!Xr(e)) {
    const l = xR(n, e.value),
      a = t && l && g.jsx(sw, { className: Dt.optionsDropdownCheckIcon }),
      c = g.jsxs(g.Fragment, {
        children: [
          r === "left" && a,
          g.jsx("span", { children: e.label }),
          r === "right" && a,
        ],
      });
    return g.jsx(ue.Option, {
      value: e.value,
      disabled: e.disabled,
      className: ft({ [Dt.optionsDropdownOption]: !o }),
      "data-reverse": r === "right" || void 0,
      "data-checked": l || void 0,
      "aria-selected": l,
      active: l,
      children: typeof s == "function" ? s({ option: e, checked: l }) : c,
    });
  }
  const i = e.items.map((l) =>
    g.jsx(
      cw,
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
  return g.jsx(ue.Group, { label: e.group, children: i });
}
function tp({
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
  unstyled: p,
  labelId: m,
  renderOption: h,
  scrollAreaProps: S,
  "aria-label": v,
}) {
  aw(e);
  const y =
      typeof o == "string"
        ? (r || lw)({ options: e, search: a ? o : "", limit: s ?? 1 / 0 })
        : e,
    b = wR(y),
    E = y.map((C) =>
      g.jsx(
        cw,
        {
          data: C,
          withCheckIcon: c,
          value: u,
          checkIconPosition: d,
          unstyled: p,
          renderOption: h,
        },
        Xr(C) ? C.group : C.value
      )
    );
  return g.jsx(ue.Dropdown, {
    hidden: t || (n && b),
    children: g.jsxs(ue.Options, {
      labelledBy: m,
      "aria-label": v,
      children: [
        l
          ? g.jsx(wi.Autosize, {
              mah: i ?? 220,
              type: "scroll",
              scrollbarSize: "var(--combobox-padding)",
              offsetScrollbars: "y",
              ...S,
              children: E,
            })
          : E,
        b && f && g.jsx(ue.Empty, { children: f }),
      ],
    }),
  });
}
var Oa = {
  root: "m_77c9d27d",
  inner: "m_80f1301b",
  label: "m_811560b9",
  section: "m_a74036a",
  loader: "m_a25b86ee",
  group: "m_80d6d844",
};
const Th = { orientation: "horizontal" },
  SR = (e, { borderWidth: t }) => ({
    group: { "--button-border-width": z(t) },
  }),
  np = G((e, t) => {
    const n = W("ButtonGroup", Th, e),
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
        ...p
      } = W("ButtonGroup", Th, e),
      m = de({
        name: "ButtonGroup",
        props: n,
        classes: Oa,
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: SR,
        rootSelector: "group",
      });
    return g.jsx(X, {
      ...m("group"),
      ref: t,
      variant: d,
      mod: [{ "data-orientation": a }, f],
      role: "group",
      ...p,
    });
  });
np.classes = Oa;
np.displayName = "@mantine/core/ButtonGroup";
const bR = {
    in: { opacity: 1, transform: `translate(-50%, calc(-50% + ${z(1)}))` },
    out: { opacity: 0, transform: "translate(-50%, -200%)" },
    common: { transformOrigin: "center" },
    transitionProperty: "transform, opacity",
  },
  CR = {},
  ER = (
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
        "--button-height": Pe(s, "button-height"),
        "--button-padding-x": Pe(s, "button-padding-x"),
        "--button-fz":
          s != null && s.includes("compact")
            ? ot(s.replace("compact-", ""))
            : ot(s),
        "--button-radius": t === void 0 ? void 0 : Rn(t),
        "--button-bg": n || o ? a.background : void 0,
        "--button-hover": n || o ? a.hover : void 0,
        "--button-color": a.color,
        "--button-bd": n || o ? a.border : void 0,
        "--button-hover-color": n || o ? a.hoverColor : void 0,
      },
    };
  },
  xn = Un((e, t) => {
    const n = W("Button", CR, e),
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
        radius: p,
        loading: m,
        loaderProps: h,
        gradient: S,
        classNames: v,
        styles: w,
        unstyled: y,
        "data-disabled": b,
        autoContrast: E,
        mod: C,
        ...R
      } = n,
      D = de({
        name: "Button",
        props: n,
        classes: Oa,
        className: s,
        style: r,
        classNames: v,
        styles: w,
        unstyled: y,
        vars: o,
        varsResolver: ER,
      }),
      L = !!c,
      N = !!u;
    return g.jsxs(Mn, {
      ref: t,
      ...D("root", { active: !l && !m && !b }),
      unstyled: y,
      variant: f,
      disabled: l || m,
      mod: [
        {
          disabled: l || b,
          loading: m,
          block: d,
          "with-left-section": L,
          "with-right-section": N,
        },
        C,
      ],
      ...R,
      children: [
        g.jsx(is, {
          mounted: !!m,
          transition: bR,
          duration: 150,
          children: (M) =>
            g.jsx(X, {
              component: "span",
              ...D("loader", { style: M }),
              "aria-hidden": !0,
              children: g.jsx(Si, {
                color: "var(--button-color)",
                size: "calc(var(--button-height) / 1.8)",
                ...h,
              }),
            }),
        }),
        g.jsxs("span", {
          ...D("inner"),
          children: [
            c &&
              g.jsx(X, {
                component: "span",
                ...D("section"),
                mod: { position: "left" },
                children: c,
              }),
            g.jsx(X, {
              component: "span",
              mod: { loading: m },
              ...D("label"),
              children: a,
            }),
            u &&
              g.jsx(X, {
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
xn.classes = Oa;
xn.displayName = "@mantine/core/Button";
xn.Group = np;
var uw = { root: "m_4451eb3a" };
const _R = {},
  rp = Un((e, t) => {
    const n = W("Center", _R, e),
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
      f = de({
        name: "Center",
        props: n,
        classes: uw,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
      });
    return g.jsx(X, { ref: t, mod: [{ inline: c }, u], ...f("root"), ...d });
  });
rp.classes = uw;
rp.displayName = "@mantine/core/Center";
function kR({ open: e, close: t, openDelay: n, closeDelay: r }) {
  const o = x.useRef(-1),
    s = x.useRef(-1),
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
  return x.useEffect(() => i, []), { openDropdown: l, closeDropdown: a };
}
const [RR, dw] = br("HoverCard component was not found in the tree"),
  DR = {};
function fw(e) {
  const {
      children: t,
      onMouseEnter: n,
      onMouseLeave: r,
      ...o
    } = W("HoverCardDropdown", DR, e),
    s = dw(),
    i = Vl(n, s.openDropdown),
    l = Vl(r, s.closeDropdown);
  return g.jsx(un.Dropdown, {
    onMouseEnter: i,
    onMouseLeave: l,
    ...o,
    children: t,
  });
}
fw.displayName = "@mantine/core/HoverCardDropdown";
const PR = { refProp: "ref" },
  pw = x.forwardRef((e, t) => {
    const {
      children: n,
      refProp: r,
      eventPropsWrapperName: o,
      ...s
    } = W("HoverCardTarget", PR, e);
    if (!no(n))
      throw new Error(
        "HoverCard.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = dw(),
      l = Vl(n.props.onMouseEnter, i.openDropdown),
      a = Vl(n.props.onMouseLeave, i.closeDropdown),
      c = { onMouseEnter: l, onMouseLeave: a };
    return g.jsx(un.Target, {
      refProp: r,
      ref: t,
      ...s,
      children: x.cloneElement(n, o ? { [o]: c } : c),
    });
  });
pw.displayName = "@mantine/core/HoverCardTarget";
const TR = { openDelay: 0, closeDelay: 150, initiallyOpened: !1 };
function zr(e) {
  const {
      children: t,
      onOpen: n,
      onClose: r,
      openDelay: o,
      closeDelay: s,
      initiallyOpened: i,
      ...l
    } = W("HoverCard", TR, e),
    [a, { open: c, close: u }] = si(i, { onClose: r, onOpen: n }),
    { openDropdown: d, closeDropdown: f } = kR({
      open: c,
      close: u,
      openDelay: o,
      closeDelay: s,
    });
  return g.jsx(RR, {
    value: { openDropdown: d, closeDropdown: f },
    children: g.jsx(un, {
      ...l,
      opened: a,
      __staticSelector: "HoverCard",
      children: t,
    }),
  });
}
zr.displayName = "@mantine/core/HoverCard";
zr.Target = pw;
zr.Dropdown = fw;
zr.extend = (e) => e;
function td() {
  return (
    (td = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    td.apply(this, arguments)
  );
}
function NR(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) >= 0) continue;
      n[r] = e[r];
    }
  return n;
}
var OR = x.useLayoutEffect,
  jR = function (t) {
    var n = x.useRef(t);
    return (
      OR(function () {
        n.current = t;
      }),
      n
    );
  },
  Nh = function (t, n) {
    if (typeof t == "function") {
      t(n);
      return;
    }
    t.current = n;
  },
  $R = function (t, n) {
    var r = x.useRef();
    return x.useCallback(
      function (o) {
        (t.current = o),
          r.current && Nh(r.current, null),
          (r.current = n),
          n && Nh(n, o);
      },
      [n]
    );
  },
  Oh = {
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
  LR = function (t) {
    Object.keys(Oh).forEach(function (n) {
      t.style.setProperty(n, Oh[n], "important");
    });
  },
  jh = LR,
  at = null,
  $h = function (t, n) {
    var r = t.scrollHeight;
    return n.sizingStyle.boxSizing === "border-box"
      ? r + n.borderSize
      : r - n.paddingSize;
  };
function AR(e, t, n, r) {
  n === void 0 && (n = 1),
    r === void 0 && (r = 1 / 0),
    at ||
      ((at = document.createElement("textarea")),
      at.setAttribute("tabindex", "-1"),
      at.setAttribute("aria-hidden", "true"),
      jh(at)),
    at.parentNode === null && document.body.appendChild(at);
  var o = e.paddingSize,
    s = e.borderSize,
    i = e.sizingStyle,
    l = i.boxSizing;
  Object.keys(i).forEach(function (f) {
    var p = f;
    at.style[p] = i[p];
  }),
    jh(at),
    (at.value = t);
  var a = $h(at, e);
  (at.value = t), (a = $h(at, e)), (at.value = "x");
  var c = at.scrollHeight - o,
    u = c * n;
  l === "border-box" && (u = u + o + s), (a = Math.max(u, a));
  var d = c * r;
  return l === "border-box" && (d = d + o + s), (a = Math.min(d, a)), [a, c];
}
var Lh = function () {},
  FR = function (t, n) {
    return t.reduce(function (r, o) {
      return (r[o] = n[o]), r;
    }, {});
  },
  MR = [
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
  IR = !!document.documentElement.currentStyle,
  zR = function (t) {
    var n = window.getComputedStyle(t);
    if (n === null) return null;
    var r = FR(MR, n),
      o = r.boxSizing;
    if (o === "") return null;
    IR &&
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
  BR = zR;
function mw(e, t, n) {
  var r = jR(n);
  x.useLayoutEffect(function () {
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
var VR = function (t) {
    mw(window, "resize", t);
  },
  HR = function (t) {
    mw(document.fonts, "loadingdone", t);
  },
  WR = [
    "cacheMeasurements",
    "maxRows",
    "minRows",
    "onChange",
    "onHeightChange",
  ],
  UR = function (t, n) {
    var r = t.cacheMeasurements,
      o = t.maxRows,
      s = t.minRows,
      i = t.onChange,
      l = i === void 0 ? Lh : i,
      a = t.onHeightChange,
      c = a === void 0 ? Lh : a,
      u = NR(t, WR),
      d = u.value !== void 0,
      f = x.useRef(null),
      p = $R(f, n),
      m = x.useRef(0),
      h = x.useRef(),
      S = function () {
        var y = f.current,
          b = r && h.current ? h.current : BR(y);
        if (b) {
          h.current = b;
          var E = AR(b, y.value || y.placeholder || "x", s, o),
            C = E[0],
            R = E[1];
          m.current !== C &&
            ((m.current = C),
            y.style.setProperty("height", C + "px", "important"),
            c(C, { rowHeight: R }));
        }
      },
      v = function (y) {
        d || S(), l(y);
      };
    return (
      x.useLayoutEffect(S),
      VR(S),
      HR(S),
      x.createElement("textarea", td({}, u, { onChange: v, ref: p }))
    );
  },
  YR = x.forwardRef(UR);
const qR = {},
  op = G((e, t) => {
    const {
        autosize: n,
        maxRows: r,
        minRows: o,
        __staticSelector: s,
        resize: i,
        ...l
      } = W("Textarea", qR, e),
      a = n && uC() !== "test",
      c = a ? { maxRows: r, minRows: o } : {};
    return g.jsx(dn, {
      component: a ? YR : "textarea",
      ref: t,
      ...l,
      __staticSelector: s || "Textarea",
      multiline: !0,
      "data-no-overflow": (n && r === void 0) || void 0,
      __vars: { "--input-resize": i },
      ...c,
    });
  });
op.classes = dn.classes;
op.displayName = "@mantine/core/Textarea";
var hw = { root: "m_6e45937b", loader: "m_e8eb006c", overlay: "m_df587f17" };
const Ah = {
    transitionProps: { transition: "fade", duration: 0 },
    overlayProps: { backgroundOpacity: 0.75 },
    zIndex: ro("overlay"),
  },
  KR = (e, { zIndex: t }) => ({
    root: { "--lo-z-index": t == null ? void 0 : t.toString() },
  }),
  sp = G((e, t) => {
    const n = W("LoadingOverlay", Ah, e),
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
        zIndex: p,
        ...m
      } = n,
      h = Dn(),
      S = de({
        name: "LoadingOverlay",
        classes: hw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: KR,
      }),
      v = { ...Ah.overlayProps, ...d };
    return g.jsx(is, {
      transition: "fade",
      ...c,
      mounted: !!f,
      children: (w) =>
        g.jsxs(X, {
          ...S("root", { style: w }),
          ref: t,
          ...m,
          children: [
            g.jsx(Si, { ...S("loader"), unstyled: l, ...u }),
            g.jsx(ai, {
              ...v,
              ...S("overlay"),
              darkHidden: !0,
              unstyled: l,
              color: (d == null ? void 0 : d.color) || h.white,
            }),
            g.jsx(ai, {
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
sp.classes = hw;
sp.displayName = "@mantine/core/LoadingOverlay";
const [GR, as] = br("Modal component was not found in tree");
var Kn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd",
};
const XR = {},
  ja = G((e, t) => {
    const n = W("ModalBody", XR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = as();
    return g.jsx(W0, {
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
ja.classes = Kn;
ja.displayName = "@mantine/core/ModalBody";
const QR = {},
  $a = G((e, t) => {
    const n = W("ModalCloseButton", QR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = as();
    return g.jsx(U0, {
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
$a.classes = Kn;
$a.displayName = "@mantine/core/ModalCloseButton";
const JR = {},
  La = G((e, t) => {
    const n = W("ModalContent", JR, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        vars: l,
        children: a,
        ...c
      } = n,
      u = as(),
      d = u.scrollAreaComponent || Pk;
    return g.jsx(_k, {
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
      children: g.jsx(d, {
        style: {
          maxHeight: u.fullScreen
            ? "100dvh"
            : `calc(100dvh - (${z(u.yOffset)} * 2))`,
        },
        children: a,
      }),
    });
  });
La.classes = Kn;
La.displayName = "@mantine/core/ModalContent";
const ZR = {},
  Aa = G((e, t) => {
    const n = W("ModalHeader", ZR, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = as();
    return g.jsx(Y0, {
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
Aa.classes = Kn;
Aa.displayName = "@mantine/core/ModalHeader";
const eD = {},
  Fa = G((e, t) => {
    const n = W("ModalOverlay", eD, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = as();
    return g.jsx(q0, {
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
Fa.classes = Kn;
Fa.displayName = "@mantine/core/ModalOverlay";
const tD = {
    __staticSelector: "Modal",
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: ro("modal"),
    transitionProps: { duration: 200, transition: "pop" },
    yOffset: "5dvh",
  },
  nD = (e, { radius: t, size: n, yOffset: r, xOffset: o }) => ({
    root: {
      "--modal-radius": t === void 0 ? void 0 : Rn(t),
      "--modal-size": Pe(n, "modal-size"),
      "--modal-y-offset": z(r),
      "--modal-x-offset": z(o),
    },
  }),
  Ma = G((e, t) => {
    const n = W("ModalRoot", tD, e),
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
        centered: p,
        xOffset: m,
        __staticSelector: h,
        ...S
      } = n,
      v = de({
        name: h,
        classes: Kn,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: nD,
      });
    return g.jsx(GR, {
      value: {
        yOffset: c,
        scrollAreaComponent: u,
        getStyles: v,
        fullScreen: f,
      },
      children: g.jsx(Ck, {
        ref: t,
        ...v("root"),
        "data-full-screen": f || void 0,
        "data-centered": p || void 0,
        unstyled: l,
        ...S,
      }),
    });
  });
Ma.classes = Kn;
Ma.displayName = "@mantine/core/ModalRoot";
const rD = {},
  Ia = G((e, t) => {
    const n = W("ModalTitle", rD, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = as();
    return g.jsx(K0, {
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
Ia.classes = Kn;
Ia.displayName = "@mantine/core/ModalTitle";
const oD = {
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: ro("modal"),
    transitionProps: { duration: 200, transition: "fade-down" },
    withOverlay: !0,
    withCloseButton: !0,
  },
  fn = G((e, t) => {
    const {
        title: n,
        withOverlay: r,
        overlayProps: o,
        withCloseButton: s,
        closeButtonProps: i,
        children: l,
        radius: a,
        ...c
      } = W("Modal", oD, e),
      u = !!n || s;
    return g.jsxs(Ma, {
      ref: t,
      radius: a,
      ...c,
      children: [
        r && g.jsx(Fa, { ...o }),
        g.jsxs(La, {
          radius: a,
          children: [
            u &&
              g.jsxs(Aa, {
                children: [
                  n && g.jsx(Ia, { children: n }),
                  s && g.jsx($a, { ...i }),
                ],
              }),
            g.jsx(ja, { children: l }),
          ],
        }),
      ],
    });
  });
fn.classes = Kn;
fn.displayName = "@mantine/core/Modal";
fn.Root = Ma;
fn.Overlay = Fa;
fn.Content = La;
fn.Body = ja;
fn.Header = Aa;
fn.Title = Ia;
fn.CloseButton = $a;
const [sD, ip] = yf(),
  [iD, lD] = yf();
var za = {
  root: "m_7cda1cd6",
  "root--default": "m_44da308b",
  "root--contrast": "m_e3a01f8",
  label: "m_1e0e6180",
  remove: "m_ae386778",
  group: "m_1dcfd90b",
};
const aD = {},
  cD = (e, { gap: t }, { size: n }) => ({
    group: { "--pg-gap": t !== void 0 ? Pe(t) : Pe(n, "pg-gap") },
  }),
  lp = G((e, t) => {
    const n = W("PillGroup", aD, e),
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
      f = ip(),
      p = (f == null ? void 0 : f.size) || c || void 0,
      m = de({
        name: "PillGroup",
        classes: za,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: cD,
        stylesCtx: { size: p },
        rootSelector: "group",
      });
    return g.jsx(iD, {
      value: { size: p, disabled: u },
      children: g.jsx(X, { ref: t, size: p, ...m("group"), ...d }),
    });
  });
lp.classes = za;
lp.displayName = "@mantine/core/PillGroup";
const uD = { variant: "default" },
  dD = (e, { radius: t }, { size: n }) => ({
    root: {
      "--pill-fz": Pe(n, "pill-fz"),
      "--pill-height": Pe(n, "pill-height"),
      "--pill-radius": t === void 0 ? void 0 : Rn(t),
    },
  }),
  Qr = G((e, t) => {
    const n = W("Pill", uD, e),
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
        removeButtonProps: p,
        radius: m,
        size: h,
        disabled: S,
        mod: v,
        ...w
      } = n,
      y = lD(),
      b = ip(),
      E = h || (y == null ? void 0 : y.size) || void 0,
      C =
        (b == null ? void 0 : b.variant) === "filled"
          ? "contrast"
          : c || "default",
      R = de({
        name: "Pill",
        classes: za,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: dD,
        stylesCtx: { size: E },
      });
    return g.jsxs(X, {
      component: "span",
      ref: t,
      variant: C,
      size: E,
      ...R("root", { variant: C }),
      mod: [
        {
          "with-remove": d && !S,
          disabled: S || (y == null ? void 0 : y.disabled),
        },
        v,
      ],
      ...w,
      children: [
        g.jsx("span", { ...R("label"), children: u }),
        d &&
          g.jsx(Gr, {
            variant: "transparent",
            radius: m,
            tabIndex: -1,
            "aria-hidden": !0,
            unstyled: l,
            ...p,
            ...R("remove", {
              className: p == null ? void 0 : p.className,
              style: p == null ? void 0 : p.style,
            }),
            onMouseDown: (D) => {
              var L;
              D.preventDefault(),
                D.stopPropagation(),
                (L = p == null ? void 0 : p.onMouseDown) == null ||
                  L.call(p, D);
            },
            onClick: (D) => {
              var L;
              D.stopPropagation(),
                f == null || f(),
                (L = p == null ? void 0 : p.onClick) == null || L.call(p, D);
            },
          }),
      ],
    });
  });
Qr.classes = za;
Qr.displayName = "@mantine/core/Pill";
Qr.Group = lp;
var gw = { field: "m_45c4369d" };
const fD = { type: "visible" },
  ap = G((e, t) => {
    const n = W("PillsInputField", fD, e),
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
        mod: p,
        ...m
      } = n,
      h = ip(),
      S = ls(),
      v = de({
        name: "PillsInputField",
        classes: gw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "field",
      }),
      w = u || (h == null ? void 0 : h.disabled);
    return g.jsx(X, {
      component: "input",
      ref: Mt(t, h == null ? void 0 : h.fieldRef),
      "data-type": c,
      disabled: w,
      mod: [{ disabled: w, pointer: f }, p],
      ...v("field"),
      ...m,
      id: (S == null ? void 0 : S.inputId) || d,
      "aria-invalid": h == null ? void 0 : h.hasError,
      "aria-describedby": S == null ? void 0 : S.describedBy,
      type: "text",
      onMouseDown: (y) => !f && y.stopPropagation(),
    });
  });
ap.classes = gw;
ap.displayName = "@mantine/core/PillsInputField";
const pD = {},
  Jo = G((e, t) => {
    const n = W("PillsInput", pD, e),
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
      f = x.useRef();
    return g.jsx(sD, {
      value: { fieldRef: f, size: i, disabled: l, hasError: !!c, variant: u },
      children: g.jsx(dn, {
        size: i,
        error: c,
        variant: u,
        component: "div",
        ref: t,
        onMouseDown: (p) => {
          var m;
          p.preventDefault(),
            o == null || o(p),
            (m = f.current) == null || m.focus();
        },
        onClick: (p) => {
          var m;
          p.preventDefault(),
            s == null || s(p),
            (m = f.current) == null || m.focus();
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
Jo.displayName = "@mantine/core/PillsInput";
Jo.Field = ap;
function mD({ data: e, value: t }) {
  const n = t.map((o) => o.trim().toLowerCase());
  return e.reduce(
    (o, s) => (
      Xr(s)
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
const hD = {
    maxValues: 1 / 0,
    withCheckIcon: !0,
    checkIconPosition: "left",
    hiddenInputValuesDivider: ",",
  },
  cp = G((e, t) => {
    const n = W("MultiSelect", hD, e),
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
        onKeyDown: p,
        variant: m,
        data: h,
        dropdownOpened: S,
        defaultDropdownOpened: v,
        onDropdownOpen: w,
        onDropdownClose: y,
        selectFirstOptionOnChange: b,
        onOptionSubmit: E,
        comboboxProps: C,
        filter: R,
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
        onPaste: k,
        radius: _,
        rightSection: $,
        rightSectionWidth: O,
        rightSectionPointerEvents: I,
        rightSectionProps: q,
        leftSection: Q,
        leftSectionWidth: ee,
        leftSectionPointerEvents: ne,
        leftSectionProps: te,
        inputContainer: me,
        inputWrapperOrder: oe,
        withAsterisk: le,
        labelProps: Z,
        descriptionProps: he,
        errorProps: ae,
        wrapperProps: se,
        description: ke,
        label: Ie,
        error: ve,
        maxValues: Ke,
        searchable: Re,
        nothingFoundMessage: $e,
        withCheckIcon: U,
        checkIconPosition: re,
        hidePickedOptions: ie,
        withErrorStyles: xe,
        name: Le,
        form: ht,
        id: Se,
        clearable: Ae,
        clearButtonProps: It,
        hiddenInputProps: Ue,
        placeholder: gt,
        hiddenInputValuesDivider: Pn,
        required: Ge,
        mod: lt,
        renderOption: fs,
        onRemove: yt,
        onClear: Tn,
        scrollAreaProps: lo,
        ...ao
      } = n,
      hn = Cr(Se),
      Ce = Hf(h),
      Tt = Ta(Ce),
      vt = Na({
        opened: S,
        defaultOpened: v,
        onDropdownOpen: w,
        onDropdownClose: () => {
          y == null || y(), vt.resetSelectedOption();
        },
      }),
      {
        styleProps: ic,
        rest: { type: Ve, autoComplete: Nn, ...co },
      } = rs(ao),
      [Te, On] = sn({ value: u, defaultValue: d, finalValue: [], onChange: f }),
      [Rr, Dr] = sn({ value: M, defaultValue: B, finalValue: "", onChange: V }),
      ps = de({
        name: "MultiSelect",
        classes: {},
        props: n,
        classNames: r,
        styles: i,
        unstyled: l,
      }),
      { resolvedClassNames: ki, resolvedStyles: Ri } = so({
        props: n,
        styles: i,
        classNames: r,
      }),
      lc = (we) => {
        p == null || p(we),
          we.key === " " && !Re && (we.preventDefault(), vt.toggleDropdown()),
          we.key === "Backspace" &&
            Rr.length === 0 &&
            Te.length > 0 &&
            (yt == null || yt(Te[Te.length - 1]),
            On(Te.slice(0, Te.length - 1)));
      },
      ge = Te.map((we, ms) => {
        var Lp, Ap;
        return g.jsx(
          Qr,
          {
            withRemoveButton: !A && !((Lp = Tt[we]) != null && Lp.disabled),
            onRemove: () => {
              On(Te.filter((N1) => we !== N1)), yt == null || yt(we);
            },
            unstyled: l,
            disabled: j,
            ...ps("pill"),
            children: ((Ap = Tt[we]) == null ? void 0 : Ap.label) || we,
          },
          `${we}-${ms}`
        );
      });
    x.useEffect(() => {
      b && vt.selectFirstOption();
    }, [b, Te]);
    const wt =
        Ae &&
        Te.length > 0 &&
        !j &&
        !A &&
        g.jsx(ue.ClearButton, {
          size: c,
          ...It,
          onClear: () => {
            Tn == null || Tn(), On([]), Dr("");
          },
        }),
      Gn = mD({ data: Ce, value: Te });
    return g.jsxs(g.Fragment, {
      children: [
        g.jsxs(ue, {
          store: vt,
          classNames: ki,
          styles: Ri,
          unstyled: l,
          size: c,
          readOnly: A,
          __staticSelector: "MultiSelect",
          onOptionSubmit: (we) => {
            E == null || E(we),
              Dr(""),
              vt.updateSelectedOptionIndex("selected"),
              Te.includes(Tt[we].value)
                ? (On(Te.filter((ms) => ms !== Tt[we].value)),
                  yt == null || yt(Tt[we].value))
                : Te.length < Ke && On([...Te, Tt[we].value]);
          },
          ...C,
          children: [
            g.jsx(ue.DropdownTarget, {
              children: g.jsx(Jo, {
                ...ic,
                __staticSelector: "MultiSelect",
                classNames: ki,
                styles: Ri,
                unstyled: l,
                size: c,
                className: o,
                style: s,
                variant: m,
                disabled: j,
                radius: _,
                rightSection:
                  $ ||
                  wt ||
                  g.jsx(ue.Chevron, { size: c, error: ve, unstyled: l }),
                rightSectionPointerEvents: I || (wt ? "all" : "none"),
                rightSectionWidth: O,
                rightSectionProps: q,
                leftSection: Q,
                leftSectionWidth: ee,
                leftSectionPointerEvents: ne,
                leftSectionProps: te,
                inputContainer: me,
                inputWrapperOrder: oe,
                withAsterisk: le,
                labelProps: Z,
                descriptionProps: he,
                errorProps: ae,
                wrapperProps: se,
                description: ke,
                label: Ie,
                error: ve,
                multiline: !0,
                withErrorStyles: xe,
                __stylesApiProps: {
                  ...n,
                  rightSectionPointerEvents: I || (wt ? "all" : "none"),
                  multiline: !0,
                },
                pointer: !Re,
                onClick: () => (Re ? vt.openDropdown() : vt.toggleDropdown()),
                "data-expanded": vt.dropdownOpened || void 0,
                id: hn,
                required: Ge,
                mod: lt,
                children: g.jsxs(Qr.Group, {
                  disabled: j,
                  unstyled: l,
                  ...ps("pillsList"),
                  children: [
                    ge,
                    g.jsx(ue.EventsTarget, {
                      autoComplete: Nn,
                      children: g.jsx(Jo.Field, {
                        ...co,
                        ref: t,
                        id: hn,
                        placeholder: gt,
                        type: !Re && !gt ? "hidden" : "visible",
                        ...ps("inputField"),
                        unstyled: l,
                        onFocus: (we) => {
                          P == null || P(we), Re && vt.openDropdown();
                        },
                        onBlur: (we) => {
                          T == null || T(we), vt.closeDropdown(), Dr("");
                        },
                        onKeyDown: lc,
                        value: Rr,
                        onChange: (we) => {
                          Dr(we.currentTarget.value),
                            Re && vt.openDropdown(),
                            b && vt.selectFirstOption();
                        },
                        disabled: j,
                        readOnly: A || !Re,
                        pointer: !Re,
                      }),
                    }),
                  ],
                }),
              }),
            }),
            g.jsx(tp, {
              data: ie ? Gn : Ce,
              hidden: A || j,
              filter: R,
              search: Rr,
              limit: D,
              hiddenWhenEmpty:
                !Re || !$e || (ie && Gn.length === 0 && Rr.trim().length === 0),
              withScrollArea: L,
              maxDropdownHeight: N,
              filterOptions: Re,
              value: Te,
              checkIconPosition: re,
              withCheckIcon: U,
              nothingFoundMessage: $e,
              unstyled: l,
              labelId: Ie ? `${hn}-label` : void 0,
              "aria-label": Ie ? void 0 : ao["aria-label"],
              renderOption: fs,
              scrollAreaProps: lo,
            }),
          ],
        }),
        g.jsx(ue.HiddenInput, {
          name: Le,
          valuesDivider: Pn,
          value: Te,
          form: ht,
          disabled: j,
          ...Ue,
        }),
      ],
    });
  });
cp.classes = { ...dn.classes, ...ue.classes };
cp.displayName = "@mantine/core/MultiSelect";
const gD = {
    searchable: !1,
    withCheckIcon: !0,
    allowDeselect: !0,
    checkIconPosition: "left",
  },
  up = G((e, t) => {
    const n = W("Select", gD, e),
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
        onClick: p,
        onChange: m,
        data: h,
        value: S,
        defaultValue: v,
        selectFirstOptionOnChange: w,
        onOptionSubmit: y,
        comboboxProps: b,
        readOnly: E,
        disabled: C,
        filter: R,
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
        form: k,
        searchValue: _,
        defaultSearchValue: $,
        onSearchChange: O,
        allowDeselect: I,
        error: q,
        rightSectionPointerEvents: Q,
        id: ee,
        clearable: ne,
        clearButtonProps: te,
        hiddenInputProps: me,
        renderOption: oe,
        onClear: le,
        autoComplete: Z,
        scrollAreaProps: he,
        ...ae
      } = n,
      se = x.useMemo(() => Hf(h), [h]),
      ke = x.useMemo(() => Ta(se), [se]),
      Ie = Cr(ee),
      [ve, Ke, Re] = sn({
        value: S,
        defaultValue: v,
        finalValue: null,
        onChange: m,
      }),
      $e = typeof ve == "string" ? ke[ve] : void 0,
      [U, re] = sn({
        value: _,
        defaultValue: $,
        finalValue: $e ? $e.label : "",
        onChange: O,
      }),
      ie = Na({
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
      { resolvedClassNames: xe, resolvedStyles: Le } = so({
        props: n,
        styles: o,
        classNames: r,
      });
    x.useEffect(() => {
      w && ie.selectFirstOption();
    }, [w, ve]),
      x.useEffect(() => {
        S === null && re(""), typeof S == "string" && $e && re($e.label);
      }, [S, $e]);
    const ht =
      ne &&
      !!ve &&
      !C &&
      !E &&
      g.jsx(ue.ClearButton, {
        size: M,
        ...te,
        onClear: () => {
          Ke(null, null), re(""), le == null || le();
        },
      });
    return g.jsxs(g.Fragment, {
      children: [
        g.jsxs(ue, {
          store: ie,
          __staticSelector: "Select",
          classNames: xe,
          styles: Le,
          unstyled: s,
          readOnly: E,
          onOptionSubmit: (Se) => {
            y == null || y(Se);
            const Ae = I && ke[Se].value === ve ? null : ke[Se],
              It = Ae ? Ae.value : null;
            Ke(It, Ae),
              !Re &&
                re(
                  (typeof It == "string" && (Ae == null ? void 0 : Ae.label)) ||
                    ""
                ),
              ie.closeDropdown();
          },
          size: M,
          ...b,
          children: [
            g.jsx(ue.Target, {
              targetType: B ? "input" : "button",
              autoComplete: Z,
              children: g.jsx(dn, {
                id: Ie,
                ref: t,
                rightSection:
                  V ||
                  ht ||
                  g.jsx(ue.Chevron, { size: M, error: q, unstyled: s }),
                rightSectionPointerEvents: Q || (ht ? "all" : "none"),
                ...ae,
                size: M,
                __staticSelector: "Select",
                disabled: C,
                readOnly: E || !B,
                value: U,
                onChange: (Se) => {
                  re(Se.currentTarget.value),
                    ie.openDropdown(),
                    w && ie.selectFirstOption();
                },
                onFocus: (Se) => {
                  B && ie.openDropdown(), d == null || d(Se);
                },
                onBlur: (Se) => {
                  var Ae;
                  B && ie.closeDropdown(),
                    re(
                      (ve != null &&
                        ((Ae = ke[ve]) == null ? void 0 : Ae.label)) ||
                        ""
                    ),
                    f == null || f(Se);
                },
                onClick: (Se) => {
                  B ? ie.openDropdown() : ie.toggleDropdown(),
                    p == null || p(Se);
                },
                classNames: xe,
                styles: Le,
                unstyled: s,
                pointer: !B,
                error: q,
              }),
            }),
            g.jsx(tp, {
              data: se,
              hidden: E || C,
              filter: R,
              search: U,
              limit: D,
              hiddenWhenEmpty: !B || !P,
              withScrollArea: L,
              maxDropdownHeight: N,
              filterOptions: B && ($e == null ? void 0 : $e.label) !== U,
              value: ve,
              checkIconPosition: A,
              withCheckIcon: j,
              nothingFoundMessage: P,
              unstyled: s,
              labelId: ae.label ? `${Ie}-label` : void 0,
              "aria-label": ae.label ? void 0 : ae["aria-label"],
              renderOption: oe,
              scrollAreaProps: he,
            }),
          ],
        }),
        g.jsx(ue.HiddenInput, {
          value: ve,
          name: T,
          form: k,
          disabled: C,
          ...me,
        }),
      ],
    });
  });
up.classes = { ...dn.classes, ...ue.classes };
up.displayName = "@mantine/core/Select";
function yD({ data: e, value: t }) {
  const n = t.map((o) => o.trim().toLowerCase());
  return e.reduce(
    (o, s) => (
      Xr(s)
        ? o.push({
            group: s.group,
            items: s.items.filter(
              (i) => n.indexOf(i.label.toLowerCase().trim()) === -1
            ),
          })
        : n.indexOf(s.label.toLowerCase().trim()) === -1 && o.push(s),
      o
    ),
    []
  );
}
function vD(e, t) {
  return e
    ? t
        .split(new RegExp(`[${e.join("")}]`))
        .map((n) => n.trim())
        .filter((n) => n !== "")
    : [t];
}
function Fh({
  splitChars: e,
  allowDuplicates: t,
  maxTags: n,
  value: r,
  currentTags: o,
}) {
  const s = vD(e, r),
    i = t ? [...o, ...s] : [...new Set([...o, ...s])];
  return n ? i.slice(0, n) : i;
}
const wD = {
    maxTags: 1 / 0,
    allowDuplicates: !1,
    splitChars: [","],
    hiddenInputValuesDivider: ",",
  },
  dp = G((e, t) => {
    const n = W("TagsInput", wD, e),
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
        onKeyDown: p,
        maxTags: m,
        allowDuplicates: h,
        onDuplicate: S,
        variant: v,
        data: w,
        dropdownOpened: y,
        defaultDropdownOpened: b,
        onDropdownOpen: E,
        onDropdownClose: C,
        selectFirstOptionOnChange: R,
        onOptionSubmit: D,
        comboboxProps: L,
        filter: N,
        limit: M,
        withScrollArea: B,
        maxDropdownHeight: V,
        searchValue: A,
        defaultSearchValue: j,
        onSearchChange: P,
        readOnly: T,
        disabled: k,
        splitChars: _,
        onFocus: $,
        onBlur: O,
        onPaste: I,
        radius: q,
        rightSection: Q,
        rightSectionWidth: ee,
        rightSectionPointerEvents: ne,
        rightSectionProps: te,
        leftSection: me,
        leftSectionWidth: oe,
        leftSectionPointerEvents: le,
        leftSectionProps: Z,
        inputContainer: he,
        inputWrapperOrder: ae,
        withAsterisk: se,
        required: ke,
        labelProps: Ie,
        descriptionProps: ve,
        errorProps: Ke,
        wrapperProps: Re,
        description: $e,
        label: U,
        error: re,
        withErrorStyles: ie,
        name: xe,
        form: Le,
        id: ht,
        clearable: Se,
        clearButtonProps: Ae,
        hiddenInputProps: It,
        hiddenInputValuesDivider: Ue,
        mod: gt,
        renderOption: Pn,
        onRemove: Ge,
        onClear: lt,
        scrollAreaProps: fs,
        ...yt
      } = n,
      Tn = Cr(ht),
      lo = Hf(w),
      ao = Ta(lo),
      hn = Na({
        opened: y,
        defaultOpened: b,
        onDropdownOpen: E,
        onDropdownClose: () => {
          C == null || C(), hn.resetSelectedOption();
        },
      }),
      {
        styleProps: Ce,
        rest: { type: Tt, autoComplete: vt, ...ic },
      } = rs(yt),
      [Ve, Nn] = sn({ value: u, defaultValue: d, finalValue: [], onChange: f }),
      [co, Te] = sn({ value: A, defaultValue: j, finalValue: "", onChange: P }),
      On = de({
        name: "TagsInput",
        classes: {},
        props: n,
        classNames: r,
        styles: i,
        unstyled: l,
      }),
      { resolvedClassNames: Rr, resolvedStyles: Dr } = so({
        props: n,
        styles: i,
        classNames: r,
      }),
      ps = (ge) => {
        p == null || p(ge);
        const wt = co.trim(),
          { length: Gn } = wt;
        if (
          (_.includes(ge.key) &&
            Gn > 0 &&
            (Nn(
              Fh({
                splitChars: _,
                allowDuplicates: h,
                maxTags: m,
                value: co,
                currentTags: Ve,
              })
            ),
            Te(""),
            ge.preventDefault()),
          ge.key === "Enter" && Gn > 0 && !ge.nativeEvent.isComposing)
        ) {
          ge.preventDefault();
          const we = Ve.some((ms) => ms.toLowerCase() === wt.toLowerCase());
          we && (S == null || S(wt)),
            (!we || (we && h)) &&
              Ve.length < m &&
              (D == null || D(wt), Te(""), wt.length > 0 && Nn([...Ve, wt]));
        }
        ge.key === "Backspace" &&
          Gn === 0 &&
          Ve.length > 0 &&
          !ge.nativeEvent.isComposing &&
          (Ge == null || Ge(Ve[Ve.length - 1]), Nn(Ve.slice(0, Ve.length - 1)));
      },
      ki = (ge) => {
        if ((I == null || I(ge), ge.preventDefault(), ge.clipboardData)) {
          const wt = ge.clipboardData.getData("text/plain");
          Nn(
            Fh({
              splitChars: _,
              allowDuplicates: h,
              maxTags: m,
              value: wt,
              currentTags: Ve,
            })
          ),
            Te("");
        }
      },
      Ri = Ve.map((ge, wt) =>
        g.jsx(
          Qr,
          {
            withRemoveButton: !T,
            onRemove: () => {
              Nn(Ve.filter((Gn) => ge !== Gn)), Ge == null || Ge(ge);
            },
            unstyled: l,
            disabled: k,
            ...On("pill"),
            children: ge,
          },
          `${ge}-${wt}`
        )
      ),
      lc =
        Se &&
        Ve.length > 0 &&
        !k &&
        !T &&
        g.jsx(ue.ClearButton, {
          size: c,
          ...Ae,
          onClear: () => {
            Nn([]), Te(""), lt == null || lt();
          },
        });
    return g.jsxs(g.Fragment, {
      children: [
        g.jsxs(ue, {
          store: hn,
          classNames: Rr,
          styles: Dr,
          unstyled: l,
          size: c,
          readOnly: T,
          __staticSelector: "TagsInput",
          onOptionSubmit: (ge) => {
            D == null || D(ge),
              Te(""),
              Ve.length < m && Nn([...Ve, ao[ge].label]);
          },
          ...L,
          children: [
            g.jsx(ue.DropdownTarget, {
              children: g.jsx(Jo, {
                ...Ce,
                __staticSelector: "TagsInput",
                classNames: Rr,
                styles: Dr,
                unstyled: l,
                size: c,
                className: o,
                style: s,
                variant: v,
                disabled: k,
                radius: q,
                rightSection: Q || lc,
                rightSectionWidth: ee,
                rightSectionPointerEvents: ne,
                rightSectionProps: te,
                leftSection: me,
                leftSectionWidth: oe,
                leftSectionPointerEvents: le,
                leftSectionProps: Z,
                inputContainer: he,
                inputWrapperOrder: ae,
                withAsterisk: se,
                required: ke,
                labelProps: Ie,
                descriptionProps: ve,
                errorProps: Ke,
                wrapperProps: Re,
                description: $e,
                label: U,
                error: re,
                multiline: !0,
                withErrorStyles: ie,
                __stylesApiProps: { ...n, multiline: !0 },
                id: Tn,
                mod: gt,
                children: g.jsxs(Qr.Group, {
                  disabled: k,
                  unstyled: l,
                  ...On("pillsList"),
                  children: [
                    Ri,
                    g.jsx(ue.EventsTarget, {
                      autoComplete: vt,
                      children: g.jsx(Jo.Field, {
                        ...ic,
                        ref: t,
                        ...On("inputField"),
                        unstyled: l,
                        onKeyDown: ps,
                        onFocus: (ge) => {
                          $ == null || $(ge), hn.openDropdown();
                        },
                        onBlur: (ge) => {
                          O == null || O(ge), hn.closeDropdown();
                        },
                        onPaste: ki,
                        value: co,
                        onChange: (ge) => Te(ge.currentTarget.value),
                        required: ke && Ve.length === 0,
                        disabled: k,
                        readOnly: T,
                        id: Tn,
                      }),
                    }),
                  ],
                }),
              }),
            }),
            g.jsx(tp, {
              data: yD({ data: lo, value: Ve }),
              hidden: T || k,
              filter: N,
              search: co,
              limit: M,
              hiddenWhenEmpty: !0,
              withScrollArea: B,
              maxDropdownHeight: V,
              unstyled: l,
              labelId: U ? `${Tn}-label` : void 0,
              "aria-label": U ? void 0 : yt["aria-label"],
              renderOption: Pn,
              scrollAreaProps: fs,
            }),
          ],
        }),
        g.jsx(ue.HiddenInput, {
          name: xe,
          form: Le,
          value: Ve,
          valuesDivider: Ue,
          disabled: k,
          ...It,
        }),
      ],
    });
  });
dp.classes = { ...dn.classes, ...ue.classes };
dp.displayName = "@mantine/core/TagsInput";
const xD = {},
  fp = G((e, t) => {
    const n = W("TextInput", xD, e);
    return g.jsx(dn, {
      component: "input",
      ref: t,
      ...n,
      __staticSelector: "TextInput",
    });
  });
fp.classes = dn.classes;
fp.displayName = "@mantine/core/TextInput";
function SD(e) {
  return function ({ isLoading: n, ...r }) {
    return n ? g.jsx("div", { children: "Loading..." }) : g.jsx(e, { ...r });
  };
}
function bD(e) {
  return function ({ error: n, ...r }) {
    return n
      ? g.jsxs("div", { children: ["Error: ", n.message] })
      : g.jsx(e, { ...r });
  };
}
var yw = { exports: {} },
  CD = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",
  ED = CD,
  _D = ED;
function vw() {}
function ww() {}
ww.resetWarningCache = vw;
var kD = function () {
  function e(r, o, s, i, l, a) {
    if (a !== _D) {
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
    checkPropTypes: ww,
    resetWarningCache: vw,
  };
  return (n.PropTypes = n), n;
};
yw.exports = kD();
var RD = yw.exports;
const Y = Zr(RD);
function DD(e) {
  if (!/^[0-9a-zA-Z-]+$/.test(e))
    throw new Error(
      `[@mantine/use-form] Form name "${e}" is invalid, it should contain only letters, numbers and dashes`
    );
}
const PD = typeof window < "u" ? x.useLayoutEffect : x.useEffect;
function Xe(e, t) {
  PD(() => {
    if (e)
      return (
        window.addEventListener(e, t), () => window.removeEventListener(e, t)
      );
  }, [e]);
}
function TD(e, t) {
  e && DD(e),
    Xe(`mantine-form:${e}:set-field-value`, (n) =>
      t.setFieldValue(n.detail.path, n.detail.value)
    ),
    Xe(`mantine-form:${e}:set-values`, (n) => t.setValues(n.detail)),
    Xe(`mantine-form:${e}:set-initial-values`, (n) =>
      t.setInitialValues(n.detail)
    ),
    Xe(`mantine-form:${e}:set-errors`, (n) => t.setErrors(n.detail)),
    Xe(`mantine-form:${e}:set-field-error`, (n) =>
      t.setFieldError(n.detail.path, n.detail.error)
    ),
    Xe(`mantine-form:${e}:clear-field-error`, (n) =>
      t.clearFieldError(n.detail)
    ),
    Xe(`mantine-form:${e}:clear-errors`, t.clearErrors),
    Xe(`mantine-form:${e}:reset`, t.reset),
    Xe(`mantine-form:${e}:validate`, t.validate),
    Xe(`mantine-form:${e}:validate-field`, (n) => t.validateField(n.detail)),
    Xe(`mantine-form:${e}:reorder-list-item`, (n) =>
      t.reorderListItem(n.detail.path, n.detail.payload)
    ),
    Xe(`mantine-form:${e}:remove-list-item`, (n) =>
      t.removeListItem(n.detail.path, n.detail.index)
    ),
    Xe(`mantine-form:${e}:insert-list-item`, (n) =>
      t.insertListItem(n.detail.path, n.detail.item, n.detail.index)
    ),
    Xe(`mantine-form:${e}:set-dirty`, (n) => t.setDirty(n.detail)),
    Xe(`mantine-form:${e}:set-touched`, (n) => t.setTouched(n.detail)),
    Xe(`mantine-form:${e}:reset-dirty`, (n) => t.resetDirty(n.detail)),
    Xe(`mantine-form:${e}:reset-touched`, t.resetTouched);
}
function ND(e) {
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
function nd(e) {
  return e === null || typeof e != "object"
    ? {}
    : Object.keys(e).reduce((t, n) => {
        const r = e[n];
        return r != null && r !== !1 && (t[n] = r), t;
      }, {});
}
function OD(e) {
  const [t, n] = x.useState(nd(e)),
    r = x.useCallback((l) => {
      n((a) => nd(typeof l == "function" ? l(a) : l));
    }, []),
    o = x.useCallback(() => n({}), []),
    s = x.useCallback(
      (l) => {
        t[l] !== void 0 &&
          r((a) => {
            const c = { ...a };
            return delete c[l], c;
          });
      },
      [t]
    ),
    i = x.useCallback(
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
function xw(e, t) {
  if (t === null || typeof t != "object") return {};
  const n = { ...t };
  return (
    Object.keys(t).forEach((r) => {
      r.includes(`${String(e)}.`) && delete n[r];
    }),
    n
  );
}
function Mh(e, t) {
  const n = e.substring(t.length + 1).split(".")[0];
  return parseInt(n, 10);
}
function Ih(e, t, n, r) {
  if (t === void 0) return n;
  const o = `${String(e)}`;
  let s = n;
  r === -1 && (s = xw(`${o}.${t}`, s));
  const i = { ...s },
    l = new Set();
  return (
    Object.entries(s)
      .filter(([a]) => {
        if (!a.startsWith(`${o}.`)) return !1;
        const c = Mh(a, o);
        return Number.isNaN(c) ? !1 : c >= t;
      })
      .forEach(([a, c]) => {
        const u = Mh(a, o),
          d = a.replace(`${o}.${u}`, `${o}.${u + r}`);
        (i[d] = c), l.add(d), l.has(a) || delete i[a];
      }),
    i
  );
}
function jD(e, { from: t, to: n }, r) {
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
function zh(e, t, n) {
  typeof n.value == "object" && (n.value = Po(n.value)),
    !n.enumerable ||
    n.get ||
    n.set ||
    !n.configurable ||
    !n.writable ||
    t === "__proto__"
      ? Object.defineProperty(e, t, n)
      : (e[t] = n.value);
}
function Po(e) {
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
          o.add(Po(i));
        }))
      : s === "[object Map]"
      ? ((o = new Map()),
        e.forEach(function (i, l) {
          o.set(Po(l), Po(i));
        }))
      : s === "[object Date]"
      ? (o = new Date(+e))
      : s === "[object RegExp]"
      ? (o = new RegExp(e.source, e.flags))
      : s === "[object DataView]"
      ? (o = new e.constructor(Po(e.buffer)))
      : s === "[object ArrayBuffer]"
      ? (o = e.slice(0))
      : s.slice(-6) === "Array]" && (o = new e.constructor(e)),
    o)
  ) {
    for (r = Object.getOwnPropertySymbols(e); t < r.length; t++)
      zh(o, r[t], Object.getOwnPropertyDescriptor(e, r[t]));
    for (t = 0, r = Object.getOwnPropertyNames(e); t < r.length; t++)
      (Object.hasOwnProperty.call(o, (n = r[t])) && o[n] === e[n]) ||
        zh(o, n, Object.getOwnPropertyDescriptor(e, n));
  }
  return o || e;
}
function Sw(e) {
  return typeof e != "string" ? [] : e.split(".");
}
function Ct(e, t) {
  const n = Sw(e);
  if (n.length === 0 || typeof t != "object" || t === null) return;
  let r = t[n[0]];
  for (let o = 1; o < n.length && r !== void 0; o += 1) r = r[n[o]];
  return r;
}
function Ba(e, t, n) {
  const r = Sw(e);
  if (r.length === 0) return n;
  const o = Po(n);
  if (r.length === 1) return (o[r[0]] = t), o;
  let s = o[r[0]];
  for (let i = 1; i < r.length - 1; i += 1) {
    if (s === void 0) return o;
    s = s[r[i]];
  }
  return (s[r[r.length - 1]] = t), o;
}
function $D(e, { from: t, to: n }, r) {
  const o = Ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o],
    i = o[t];
  return s.splice(t, 1), s.splice(n, 0, i), Ba(e, s, r);
}
function LD(e, t, n, r) {
  const o = Ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o];
  return s.splice(typeof n == "number" ? n : s.length, 0, t), Ba(e, s, r);
}
function AD(e, t, n) {
  const r = Ct(e, n);
  return Array.isArray(r)
    ? Ba(
        e,
        r.filter((o, s) => s !== t),
        n
      )
    : n;
}
function FD({ $values: e, $errors: t, $status: n }) {
  const r = x.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => jD(i, l, a)),
        e.setValues({ values: $D(i, l, e.refValues.current), updateState: !0 });
    }, []),
    o = x.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => Ih(i, l, a, -1)),
        e.setValues({ values: AD(i, l, e.refValues.current), updateState: !0 });
    }, []),
    s = x.useCallback((i, l, a) => {
      n.clearFieldDirty(i),
        t.setErrors((c) => Ih(i, a, c, 1)),
        e.setValues({
          values: LD(i, l, a, e.refValues.current),
          updateState: !0,
        });
    }, []);
  return { reorderListItem: r, removeListItem: o, insertListItem: s };
}
var MD = function e(t, n) {
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
const qc = Zr(MD);
function Qi(e, t) {
  const n = Object.keys(e);
  if (typeof t == "string") {
    const r = n.filter((o) => o.startsWith(`${t}.`));
    return e[t] || r.some((o) => e[o]) || !1;
  }
  return n.some((r) => e[r]);
}
function ID({ initialDirty: e, initialTouched: t, mode: n, $values: r }) {
  const [o, s] = x.useState(t),
    [i, l] = x.useState(e),
    a = x.useRef(t),
    c = x.useRef(e),
    u = x.useCallback((E) => {
      const C = typeof E == "function" ? E(a.current) : E;
      (a.current = C), n === "controlled" && s(C);
    }, []),
    d = x.useCallback((E) => {
      const C = typeof E == "function" ? E(c.current) : E;
      (c.current = C), n === "controlled" && l(C);
    }, []),
    f = x.useCallback(() => u({}), []),
    p = (E) => {
      const C = E ? { ...E, ...r.refValues.current } : r.refValues.current;
      r.setValuesSnapshot(C), d({});
    },
    m = x.useCallback((E, C) => {
      u((R) => (Qi(R, E) === C ? R : { ...R, [E]: C }));
    }, []),
    h = x.useCallback((E, C) => {
      d((R) => (Qi(R, E) === C ? R : { ...R, [E]: C }));
    }, []),
    S = x.useCallback((E) => Qi(a.current, E), []),
    v = x.useCallback(
      (E) =>
        d((C) => {
          if (typeof E != "string") return C;
          const R = xw(E, C);
          return delete R[E], qc(R, C) ? C : R;
        }),
      []
    ),
    w = x.useCallback((E) => {
      if (E) {
        const R = Ct(E, c.current);
        if (typeof R == "boolean") return R;
        const D = Ct(E, r.refValues.current),
          L = Ct(E, r.valuesSnapshot.current);
        return !qc(D, L);
      }
      return Object.keys(c.current).length > 0
        ? Qi(c.current)
        : !qc(r.refValues.current, r.valuesSnapshot.current);
    }, []),
    y = x.useCallback(() => c.current, []),
    b = x.useCallback(() => a.current, []);
  return {
    touchedState: o,
    dirtyState: i,
    touchedRef: a,
    dirtyRef: c,
    setTouched: u,
    setDirty: d,
    resetDirty: p,
    resetTouched: f,
    isTouched: S,
    setFieldTouched: m,
    setFieldDirty: h,
    setTouchedState: s,
    setDirtyState: l,
    clearFieldDirty: v,
    isDirty: w,
    getDirty: y,
    getTouched: b,
  };
}
function zD({ initialValues: e, onValuesChange: t, mode: n }) {
  const r = x.useRef(!1),
    [o, s] = x.useState(e || {}),
    i = x.useRef(o),
    l = x.useRef(o),
    a = x.useCallback(
      ({
        values: m,
        subscribers: h,
        updateState: S = !0,
        mergeWithPreviousValues: v = !0,
      }) => {
        const w = i.current,
          y = m instanceof Function ? m(i.current) : m,
          b = v ? { ...w, ...y } : y;
        (i.current = b),
          S && s(b),
          t == null || t(b, w),
          h == null ||
            h
              .filter(Boolean)
              .forEach((E) => E({ updatedValues: b, previousValues: w }));
      },
      [t]
    ),
    c = x.useCallback((m) => {
      var v;
      const h = Ct(m.path, i.current),
        S = m.value instanceof Function ? m.value(h) : m.value;
      if (h !== S) {
        const w = i.current,
          y = Ba(m.path, S, i.current);
        a({ values: y, updateState: m.updateState }),
          (v = m.subscribers) == null ||
            v
              .filter(Boolean)
              .forEach((b) =>
                b({ path: m.path, updatedValues: y, previousValues: w })
              );
      }
    }, []),
    u = x.useCallback((m) => {
      l.current = m;
    }, []),
    d = x.useCallback((m, h) => {
      r.current ||
        ((r.current = !0),
        a({ values: m, updateState: n === "controlled" }),
        u(m),
        h());
    }, []),
    f = x.useCallback(() => {
      a({ values: l.current, updateState: !0, mergeWithPreviousValues: !1 });
    }, []),
    p = x.useCallback(() => i.current, []);
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
    getValues: p,
  };
}
function BD({ $status: e }) {
  const t = x.useRef({}),
    n = x.useCallback((o, s) => {
      x.useEffect(
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
    r = x.useCallback(
      (o) =>
        t.current[o]
          ? t.current[o].map(
              (s) => (i) =>
                s({
                  previousValue: Ct(o, i.previousValues),
                  value: Ct(o, i.updatedValues),
                  touched: e.isTouched(o),
                  dirty: e.isDirty(o),
                })
            )
          : [],
      []
    );
  return { subscribers: t, watch: n, getFieldSubscribers: r };
}
function Bh(e) {
  const t = nd(e);
  return { hasErrors: Object.keys(t).length > 0, errors: t };
}
function rd(e, t, n = "", r = {}) {
  return typeof e != "object" || e === null
    ? r
    : Object.keys(e).reduce((o, s) => {
        const i = e[s],
          l = `${n === "" ? "" : `${n}.`}${s}`,
          a = Ct(l, t);
        let c = !1;
        return (
          typeof i == "function" && (o[l] = i(a, t, l)),
          typeof i == "object" &&
            Array.isArray(a) &&
            ((c = !0), a.forEach((u, d) => rd(i, t, `${l}.${d}`, o))),
          typeof i == "object" &&
            typeof a == "object" &&
            a !== null &&
            (c || rd(i, t, l, o)),
          o
        );
      }, r);
}
function od(e, t) {
  return Bh(typeof e == "function" ? e(t) : rd(e, t));
}
function Ji(e, t, n) {
  if (typeof e != "string") return { hasError: !1, error: null };
  const r = od(t, n),
    o = Object.keys(r.errors).find((s) =>
      e.split(".").every((i, l) => i === s.split(".")[l])
    );
  return { hasError: !!o, error: o ? r.errors[o] : null };
}
const VD = "__MANTINE_FORM_INDEX__";
function Vh(e, t) {
  return t
    ? typeof t == "boolean"
      ? t
      : Array.isArray(t)
      ? t.includes(e.replace(/[.][0-9]/g, `.${VD}`))
      : !1
    : !1;
}
function HD({
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
  transformValues: u = (p) => p,
  enhanceGetInputProps: d,
  validate: f,
} = {}) {
  const p = OD(r),
    m = zD({ initialValues: n, onValuesChange: c, mode: t }),
    h = ID({ initialDirty: o, initialTouched: s, $values: m, mode: t }),
    S = FD({ $values: m, $errors: p, $status: h }),
    v = BD({ $status: h }),
    [w, y] = x.useState(0),
    [b, E] = x.useState({}),
    C = x.useCallback(() => {
      m.resetValues(),
        p.clearErrors(),
        h.resetDirty(),
        h.resetTouched(),
        t === "uncontrolled" && y((_) => _ + 1);
    }, []),
    R = x.useCallback((_) => {
      m.initialize(_, () => t === "uncontrolled" && y(($) => $ + 1));
    }, []),
    D = x.useCallback(
      (_, $, O) => {
        const I = Vh(_, l);
        h.clearFieldDirty(_),
          h.setFieldTouched(_, !0),
          !I && i && p.clearFieldError(_),
          m.setFieldValue({
            path: _,
            value: $,
            updateState: t === "controlled",
            subscribers: [
              ...v.getFieldSubscribers(_),
              I
                ? (q) => {
                    const Q = Ji(_, f, q.updatedValues);
                    Q.hasError
                      ? p.setFieldError(_, Q.error)
                      : p.clearFieldError(_);
                  }
                : null,
              (O == null ? void 0 : O.forceUpdate) !== !1 && t !== "controlled"
                ? () => E((q) => ({ ...q, [_]: (q[_] || 0) + 1 }))
                : null,
            ],
          });
      },
      [c, f]
    ),
    L = x.useCallback(
      (_) => {
        const $ = m.refValues.current;
        m.setValues({ values: _, updateState: t === "controlled" }),
          i && p.clearErrors(),
          t === "uncontrolled" && y((O) => O + 1),
          Object.keys(v.subscribers.current).forEach((O) => {
            const I = Ct(O, m.refValues.current),
              q = Ct(O, $);
            I !== q &&
              v
                .getFieldSubscribers(O)
                .forEach((Q) =>
                  Q({ previousValues: $, updatedValues: m.refValues.current })
                );
          });
      },
      [c, i]
    ),
    N = x.useCallback(() => {
      const _ = od(f, m.refValues.current);
      return p.setErrors(_.errors), _;
    }, [f]),
    M = x.useCallback(
      (_) => {
        const $ = Ji(_, f, m.refValues.current);
        return (
          $.hasError ? p.setFieldError(_, $.error) : p.clearFieldError(_), $
        );
      },
      [f]
    ),
    B = (
      _,
      { type: $ = "input", withError: O = !0, withFocus: I = !0, ...q } = {}
    ) => {
      const ee = { onChange: ND((ne) => D(_, ne, { forceUpdate: !1 })) };
      return (
        O && (ee.error = p.errorsState[_]),
        $ === "checkbox"
          ? (ee[t === "controlled" ? "checked" : "defaultChecked"] = Ct(
              _,
              m.refValues.current
            ))
          : (ee[t === "controlled" ? "value" : "defaultValue"] = Ct(
              _,
              m.refValues.current
            )),
        I &&
          ((ee.onFocus = () => h.setFieldTouched(_, !0)),
          (ee.onBlur = () => {
            if (Vh(_, a)) {
              const ne = Ji(_, f, m.refValues.current);
              ne.hasError ? p.setFieldError(_, ne.error) : p.clearFieldError(_);
            }
          })),
        Object.assign(
          ee,
          d == null
            ? void 0
            : d({
                inputProps: ee,
                field: _,
                options: { type: $, withError: O, withFocus: I, ...q },
                form: k,
              })
        )
      );
    },
    V = (_, $) => (O) => {
      O == null || O.preventDefault();
      const I = N();
      I.hasErrors
        ? $ == null || $(I.errors, m.refValues.current, O)
        : _ == null || _(u(m.refValues.current), O);
    },
    A = (_) => u(_ || m.refValues.current),
    j = x.useCallback((_) => {
      _.preventDefault(), C();
    }, []),
    P = x.useCallback(
      (_) =>
        _
          ? !Ji(_, f, m.refValues.current).hasError
          : !od(f, m.refValues.current).hasErrors,
      [f]
    ),
    T = (_) => `${w}-${_}-${b[_] || 0}`,
    k = {
      watch: v.watch,
      initialized: m.initialized.current,
      values: m.stateValues,
      getValues: m.getValues,
      setInitialValues: m.setValuesSnapshot,
      initialize: R,
      setValues: L,
      setFieldValue: D,
      errors: p.errorsState,
      setErrors: p.setErrors,
      setFieldError: p.setFieldError,
      clearFieldError: p.clearFieldError,
      clearErrors: p.clearErrors,
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
      reset: C,
      validate: N,
      validateField: M,
      getInputProps: B,
      onSubmit: V,
      onReset: j,
      isValid: P,
      getTransformedValues: A,
      key: T,
    };
  return TD(e, k), k;
}
const pp = (e) => {
  const {
    title: t,
    description: n,
    form: r,
    options: o,
    default_value: s,
    field_id: i,
    mandatory: l,
  } = e;
  var a = s ? o.map((p) => p.option).filter((p) => p == s) : null;
  const [c, u] = x.useState(a ? a[0] : o[0].option);
  r.setFieldValue(i, c);
  const [d, { toggle: f }] = si(!1);
  return g.jsxs("div", {
    className: "collapsible-selector-container",
    children: [
      t &&
        g.jsxs("h2", {
          children: [
            t,
            " ",
            l &&
              g.jsx("span", {
                class:
                  "mantine-InputWrapper-required mantine-TextInput-required",
                children: "*",
              }),
          ],
        }),
      n && g.jsx("label", { children: n }),
      g.jsx("div", {
        className: "container",
        children: g.jsxs("div", {
          className: "multi-select-row row btn-style",
          onClick: f,
          children: [
            g.jsxs("p", {
              className: "col my-2 row-title",
              children: [g.jsx("i", { class: "fa fa-balance-scale mr-2" }), c],
            }),
            g.jsx("p", {
              className: "clickable-text col-auto text-right my-2",
              children: "change",
            }),
          ],
        }),
      }),
      g.jsx(u0, {
        className: "container",
        in: d,
        transitionDuration: 100,
        transitionTimingFunction: "linear",
        children: o.map((p) => {
          const [m, { open: h, close: S }] = si(!1),
            v = function () {
              u(p.option);
            };
          return g.jsxs("div", {
            className: "multi-select-row row clickable-row",
            children: [
              g.jsx("p", {
                className: "col my-2 row-title",
                onClick: v,
                children: p.option,
              }),
              (p.description || p.help_link) &&
                g.jsxs(g.Fragment, {
                  children: [
                    g.jsxs(fn, {
                      opened: m,
                      onClose: S,
                      title: p.option,
                      centered: !0,
                      size: "auto",
                      children: [
                        g.jsx("div", {
                          className: "modal-dialog-body",
                          children:
                            p.description &&
                            g.jsx(Ar, {
                              className: "use-line-breaks",
                              children: p.description,
                            }),
                        }),
                        g.jsxs("div", {
                          className: "modal-dialog-footer container p-0",
                          children: [
                            p.help_link &&
                              g.jsx("div", {
                                className: "row",
                                children: g.jsx("div", {
                                  className: "col-12",
                                  children: g.jsx("a", {
                                    href: p.help_link,
                                    className:
                                      "btn btn-light-blue-inverted btn-block",
                                    children: "More detail",
                                  }),
                                }),
                              }),
                            g.jsx("div", {
                              className: "row",
                              children: g.jsx("div", {
                                className: "col-12",
                                children: g.jsx("p", {
                                  className:
                                    "btn btn-light-blue-inverted btn-block",
                                  onClick: () => {
                                    v(), S();
                                  },
                                  children: "Choose this",
                                }),
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    g.jsx("div", {
                      className: "col-auto clickable-text",
                      onClick: h,
                      children: g.jsx("p", {
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
pp.defaultProps = {};
pp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
};
const WD = new Map([
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
function bi(e, t) {
  const n = UD(e);
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
function UD(e) {
  const { name: t } = e;
  if (t && t.lastIndexOf(".") !== -1 && !e.type) {
    const r = t.split(".").pop().toLowerCase(),
      o = WD.get(r);
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
var cs = (e, t, n) =>
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
const YD = [".DS_Store", "Thumbs.db"];
function qD(e) {
  return cs(this, null, function* () {
    return Kl(e) && KD(e.dataTransfer)
      ? JD(e.dataTransfer, e.type)
      : GD(e)
      ? XD(e)
      : Array.isArray(e) &&
        e.every((t) => "getFile" in t && typeof t.getFile == "function")
      ? QD(e)
      : [];
  });
}
function KD(e) {
  return Kl(e);
}
function GD(e) {
  return Kl(e) && Kl(e.target);
}
function Kl(e) {
  return typeof e == "object" && e !== null;
}
function XD(e) {
  return sd(e.target.files).map((t) => bi(t));
}
function QD(e) {
  return cs(this, null, function* () {
    return (yield Promise.all(e.map((n) => n.getFile()))).map((n) => bi(n));
  });
}
function JD(e, t) {
  return cs(this, null, function* () {
    if (e.items) {
      const n = sd(e.items).filter((o) => o.kind === "file");
      if (t !== "drop") return n;
      const r = yield Promise.all(n.map(ZD));
      return Hh(bw(r));
    }
    return Hh(sd(e.files).map((n) => bi(n)));
  });
}
function Hh(e) {
  return e.filter((t) => YD.indexOf(t.name) === -1);
}
function sd(e) {
  if (e === null) return [];
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    t.push(r);
  }
  return t;
}
function ZD(e) {
  if (typeof e.webkitGetAsEntry != "function") return Wh(e);
  const t = e.webkitGetAsEntry();
  return t && t.isDirectory ? Cw(t) : Wh(e);
}
function bw(e) {
  return e.reduce((t, n) => [...t, ...(Array.isArray(n) ? bw(n) : [n])], []);
}
function Wh(e) {
  const t = e.getAsFile();
  if (!t) return Promise.reject(`${e} is not a File`);
  const n = bi(t);
  return Promise.resolve(n);
}
function eP(e) {
  return cs(this, null, function* () {
    return e.isDirectory ? Cw(e) : tP(e);
  });
}
function Cw(e) {
  const t = e.createReader();
  return new Promise((n, r) => {
    const o = [];
    function s() {
      t.readEntries(
        (i) =>
          cs(this, null, function* () {
            if (i.length) {
              const l = Promise.all(i.map(eP));
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
function tP(e) {
  return cs(this, null, function* () {
    return new Promise((t, n) => {
      e.file(
        (r) => {
          const o = bi(r, e.fullPath);
          t(o);
        },
        (r) => {
          n(r);
        }
      );
    });
  });
}
function nP(e, t) {
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
var rP = Object.defineProperty,
  oP = Object.defineProperties,
  sP = Object.getOwnPropertyDescriptors,
  Uh = Object.getOwnPropertySymbols,
  iP = Object.prototype.hasOwnProperty,
  lP = Object.prototype.propertyIsEnumerable,
  Yh = (e, t, n) =>
    t in e
      ? rP(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  aP = (e, t) => {
    for (var n in t || (t = {})) iP.call(t, n) && Yh(e, n, t[n]);
    if (Uh) for (var n of Uh(t)) lP.call(t, n) && Yh(e, n, t[n]);
    return e;
  },
  cP = (e, t) => oP(e, sP(t));
const uP = "file-invalid-type",
  dP = "file-too-large",
  fP = "file-too-small",
  pP = "too-many-files",
  mP = (e) => {
    e = Array.isArray(e) && e.length === 1 ? e[0] : e;
    const t = Array.isArray(e) ? `one of ${e.join(", ")}` : e;
    return { code: uP, message: `File type must be ${t}` };
  },
  qh = (e) => ({
    code: dP,
    message: `File is larger than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  Kh = (e) => ({
    code: fP,
    message: `File is smaller than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  hP = { code: pP, message: "Too many files" };
function Ew(e, t) {
  const n = e.type === "application/x-moz-file" || nP(e, t);
  return [n, n ? null : mP(t)];
}
function _w(e, t, n) {
  if (Or(e.size))
    if (Or(t) && Or(n)) {
      if (e.size > n) return [!1, qh(n)];
      if (e.size < t) return [!1, Kh(t)];
    } else {
      if (Or(t) && e.size < t) return [!1, Kh(t)];
      if (Or(n) && e.size > n) return [!1, qh(n)];
    }
  return [!0, null];
}
function Or(e) {
  return e != null;
}
function gP({
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
        const [a] = Ew(l, t),
          [c] = _w(l, n, r),
          u = i ? i(l) : null;
        return a && c && !u;
      });
}
function Gl(e) {
  return typeof e.isPropagationStopped == "function"
    ? e.isPropagationStopped()
    : typeof e.cancelBubble < "u"
    ? e.cancelBubble
    : !1;
}
function Zi(e) {
  return e.dataTransfer
    ? Array.prototype.some.call(
        e.dataTransfer.types,
        (t) => t === "Files" || t === "application/x-moz-file"
      )
    : !!e.target && !!e.target.files;
}
function Gh(e) {
  e.preventDefault();
}
function yP(e) {
  return e.indexOf("MSIE") !== -1 || e.indexOf("Trident/") !== -1;
}
function vP(e) {
  return e.indexOf("Edge/") !== -1;
}
function wP(e = window.navigator.userAgent) {
  return yP(e) || vP(e);
}
function yn(...e) {
  return (t, ...n) => e.some((r) => (!Gl(t) && r && r(t, ...n), Gl(t)));
}
function xP() {
  return "showOpenFilePicker" in window;
}
function SP(e) {
  return Or(e)
    ? [
        {
          description: "Files",
          accept: Object.entries(e)
            .filter(([n, r]) => {
              let o = !0;
              return (
                kw(n) ||
                  (console.warn(
                    `Skipped "${n}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`
                  ),
                  (o = !1)),
                (!Array.isArray(r) || !r.every(Rw)) &&
                  (console.warn(
                    `Skipped "${n}" because an invalid file extension was provided.`
                  ),
                  (o = !1)),
                o
              );
            })
            .reduce((n, [r, o]) => cP(aP({}, n), { [r]: o }), {}),
        },
      ]
    : e;
}
function bP(e) {
  if (Or(e))
    return Object.entries(e)
      .reduce((t, [n, r]) => [...t, n, ...r], [])
      .filter((t) => kw(t) || Rw(t))
      .join(",");
}
function CP(e) {
  return (
    e instanceof DOMException &&
    (e.name === "AbortError" || e.code === e.ABORT_ERR)
  );
}
function EP(e) {
  return (
    e instanceof DOMException &&
    (e.name === "SecurityError" || e.code === e.SECURITY_ERR)
  );
}
function kw(e) {
  return (
    e === "audio/*" ||
    e === "video/*" ||
    e === "image/*" ||
    e === "text/*" ||
    /\w+\/[-+.\w]+/g.test(e)
  );
}
function Rw(e) {
  return /^.*\.[\w]+$/.test(e);
}
var _P = Object.defineProperty,
  kP = Object.defineProperties,
  RP = Object.getOwnPropertyDescriptors,
  Xl = Object.getOwnPropertySymbols,
  Dw = Object.prototype.hasOwnProperty,
  Pw = Object.prototype.propertyIsEnumerable,
  Xh = (e, t, n) =>
    t in e
      ? _P(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  ut = (e, t) => {
    for (var n in t || (t = {})) Dw.call(t, n) && Xh(e, n, t[n]);
    if (Xl) for (var n of Xl(t)) Pw.call(t, n) && Xh(e, n, t[n]);
    return e;
  },
  er = (e, t) => kP(e, RP(t)),
  Ql = (e, t) => {
    var n = {};
    for (var r in e) Dw.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
    if (e != null && Xl)
      for (var r of Xl(e)) t.indexOf(r) < 0 && Pw.call(e, r) && (n[r] = e[r]);
    return n;
  };
const mp = x.forwardRef((e, t) => {
  var n = e,
    { children: r } = n,
    o = Ql(n, ["children"]);
  const s = Nw(o),
    { open: i } = s,
    l = Ql(s, ["open"]);
  return (
    x.useImperativeHandle(t, () => ({ open: i }), [i]),
    ra.createElement(x.Fragment, null, r(er(ut({}, l), { open: i })))
  );
});
mp.displayName = "Dropzone";
const Tw = {
  disabled: !1,
  getFilesFromEvent: qD,
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
mp.defaultProps = Tw;
mp.propTypes = {
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
const id = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  acceptedFiles: [],
  fileRejections: [],
};
function Nw(e = {}) {
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
      onDropRejected: p,
      onFileDialogCancel: m,
      onFileDialogOpen: h,
      useFsAccessApi: S,
      autoFocus: v,
      preventDropOnDocument: w,
      noClick: y,
      noKeyboard: b,
      noDrag: E,
      noDragEventsBubbling: C,
      onError: R,
      validator: D,
    } = ut(ut({}, Tw), e),
    L = x.useMemo(() => bP(t), [t]),
    N = x.useMemo(() => SP(t), [t]),
    M = x.useMemo(() => (typeof h == "function" ? h : Qh), [h]),
    B = x.useMemo(() => (typeof m == "function" ? m : Qh), [m]),
    V = x.useRef(null),
    A = x.useRef(null),
    [j, P] = x.useReducer(DP, id),
    { isFocused: T, isFileDialogActive: k } = j,
    _ = x.useRef(typeof window < "u" && window.isSecureContext && S && xP()),
    $ = () => {
      !_.current &&
        k &&
        setTimeout(() => {
          if (A.current) {
            const { files: U } = A.current;
            U.length || (P({ type: "closeDialog" }), B());
          }
        }, 300);
    };
  x.useEffect(
    () => (
      window.addEventListener("focus", $, !1),
      () => {
        window.removeEventListener("focus", $, !1);
      }
    ),
    [A, k, B, _]
  );
  const O = x.useRef([]),
    I = (U) => {
      (V.current && V.current.contains(U.target)) ||
        (U.preventDefault(), (O.current = []));
    };
  x.useEffect(
    () => (
      w &&
        (document.addEventListener("dragover", Gh, !1),
        document.addEventListener("drop", I, !1)),
      () => {
        w &&
          (document.removeEventListener("dragover", Gh),
          document.removeEventListener("drop", I));
      }
    ),
    [V, w]
  ),
    x.useEffect(
      () => (!n && v && V.current && V.current.focus(), () => {}),
      [V, v, n]
    );
  const q = x.useCallback(
      (U) => {
        R ? R(U) : console.error(U);
      },
      [R]
    ),
    Q = x.useCallback(
      (U) => {
        U.preventDefault(),
          U.persist(),
          ve(U),
          (O.current = [...O.current, U.target]),
          Zi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                if (Gl(U) && !C) return;
                const ie = re.length,
                  xe =
                    ie > 0 &&
                    gP({
                      files: re,
                      accept: L,
                      minSize: s,
                      maxSize: o,
                      multiple: i,
                      maxFiles: l,
                      validator: D,
                    }),
                  Le = ie > 0 && !xe;
                P({
                  isDragAccept: xe,
                  isDragReject: Le,
                  isDragActive: !0,
                  type: "setDraggedFiles",
                }),
                  a && a(U);
              })
              .catch((re) => q(re));
      },
      [r, a, q, C, L, s, o, i, l, D]
    ),
    ee = x.useCallback(
      (U) => {
        U.preventDefault(), U.persist(), ve(U);
        const re = Zi(U);
        if (re && U.dataTransfer)
          try {
            U.dataTransfer.dropEffect = "copy";
          } catch {}
        return re && u && u(U), !1;
      },
      [u, C]
    ),
    ne = x.useCallback(
      (U) => {
        U.preventDefault(), U.persist(), ve(U);
        const re = O.current.filter(
            (xe) => V.current && V.current.contains(xe)
          ),
          ie = re.indexOf(U.target);
        ie !== -1 && re.splice(ie, 1),
          (O.current = re),
          !(re.length > 0) &&
            (P({
              type: "setDraggedFiles",
              isDragActive: !1,
              isDragAccept: !1,
              isDragReject: !1,
            }),
            Zi(U) && c && c(U));
      },
      [V, c, C]
    ),
    te = x.useCallback(
      (U, re) => {
        const ie = [],
          xe = [];
        U.forEach((Le) => {
          const [ht, Se] = Ew(Le, L),
            [Ae, It] = _w(Le, s, o),
            Ue = D ? D(Le) : null;
          if (ht && Ae && !Ue) ie.push(Le);
          else {
            let gt = [Se, It];
            Ue && (gt = gt.concat(Ue)),
              xe.push({ file: Le, errors: gt.filter((Pn) => Pn) });
          }
        }),
          ((!i && ie.length > 1) || (i && l >= 1 && ie.length > l)) &&
            (ie.forEach((Le) => {
              xe.push({ file: Le, errors: [hP] });
            }),
            ie.splice(0)),
          P({ acceptedFiles: ie, fileRejections: xe, type: "setFiles" }),
          d && d(ie, xe, re),
          xe.length > 0 && p && p(xe, re),
          ie.length > 0 && f && f(ie, re);
      },
      [P, i, L, s, o, l, d, f, p, D]
    ),
    me = x.useCallback(
      (U) => {
        U.preventDefault(),
          U.persist(),
          ve(U),
          (O.current = []),
          Zi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                (Gl(U) && !C) || te(re, U);
              })
              .catch((re) => q(re)),
          P({ type: "reset" });
      },
      [r, te, q, C]
    ),
    oe = x.useCallback(() => {
      if (_.current) {
        P({ type: "openDialog" }), M();
        const U = { multiple: i, types: N };
        window
          .showOpenFilePicker(U)
          .then((re) => r(re))
          .then((re) => {
            te(re, null), P({ type: "closeDialog" });
          })
          .catch((re) => {
            CP(re)
              ? (B(re), P({ type: "closeDialog" }))
              : EP(re)
              ? ((_.current = !1),
                A.current
                  ? ((A.current.value = null), A.current.click())
                  : q(
                      new Error(
                        "Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."
                      )
                    ))
              : q(re);
          });
        return;
      }
      A.current &&
        (P({ type: "openDialog" }),
        M(),
        (A.current.value = null),
        A.current.click());
    }, [P, M, B, S, te, q, N, i]),
    le = x.useCallback(
      (U) => {
        !V.current ||
          !V.current.isEqualNode(U.target) ||
          ((U.key === " " ||
            U.key === "Enter" ||
            U.keyCode === 32 ||
            U.keyCode === 13) &&
            (U.preventDefault(), oe()));
      },
      [V, oe]
    ),
    Z = x.useCallback(() => {
      P({ type: "focus" });
    }, []),
    he = x.useCallback(() => {
      P({ type: "blur" });
    }, []),
    ae = x.useCallback(() => {
      y || (wP() ? setTimeout(oe, 0) : oe());
    }, [y, oe]),
    se = (U) => (n ? null : U),
    ke = (U) => (b ? null : se(U)),
    Ie = (U) => (E ? null : se(U)),
    ve = (U) => {
      C && U.stopPropagation();
    },
    Ke = x.useMemo(
      () =>
        (U = {}) => {
          var re = U,
            {
              refKey: ie = "ref",
              role: xe,
              onKeyDown: Le,
              onFocus: ht,
              onBlur: Se,
              onClick: Ae,
              onDragEnter: It,
              onDragOver: Ue,
              onDragLeave: gt,
              onDrop: Pn,
            } = re,
            Ge = Ql(re, [
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
          return ut(
            ut(
              {
                onKeyDown: ke(yn(Le, le)),
                onFocus: ke(yn(ht, Z)),
                onBlur: ke(yn(Se, he)),
                onClick: se(yn(Ae, ae)),
                onDragEnter: Ie(yn(It, Q)),
                onDragOver: Ie(yn(Ue, ee)),
                onDragLeave: Ie(yn(gt, ne)),
                onDrop: Ie(yn(Pn, me)),
                role: typeof xe == "string" && xe !== "" ? xe : "presentation",
                [ie]: V,
              },
              !n && !b ? { tabIndex: 0 } : {}
            ),
            Ge
          );
        },
      [V, le, Z, he, ae, Q, ee, ne, me, b, E, n]
    ),
    Re = x.useCallback((U) => {
      U.stopPropagation();
    }, []),
    $e = x.useMemo(
      () =>
        (U = {}) => {
          var re = U,
            { refKey: ie = "ref", onChange: xe, onClick: Le } = re,
            ht = Ql(re, ["refKey", "onChange", "onClick"]);
          const Se = {
            accept: L,
            multiple: i,
            type: "file",
            style: { display: "none" },
            onChange: se(yn(xe, me)),
            onClick: se(yn(Le, Re)),
            tabIndex: -1,
            [ie]: A,
          };
          return ut(ut({}, Se), ht);
        },
      [A, t, i, me, n]
    );
  return er(ut({}, j), {
    isFocused: T && !n,
    getRootProps: Ke,
    getInputProps: $e,
    rootRef: V,
    inputRef: A,
    open: se(oe),
  });
}
function DP(e, t) {
  switch (t.type) {
    case "focus":
      return er(ut({}, e), { isFocused: !0 });
    case "blur":
      return er(ut({}, e), { isFocused: !1 });
    case "openDialog":
      return er(ut({}, id), { isFileDialogActive: !0 });
    case "closeDialog":
      return er(ut({}, e), { isFileDialogActive: !1 });
    case "setDraggedFiles":
      return er(ut({}, e), {
        isDragActive: t.isDragActive,
        isDragAccept: t.isDragAccept,
        isDragReject: t.isDragReject,
      });
    case "setFiles":
      return er(ut({}, e), {
        acceptedFiles: t.acceptedFiles,
        fileRejections: t.fileRejections,
      });
    case "reset":
      return ut({}, id);
    default:
      return e;
  }
}
function Qh() {}
const [PP, TP] = br("Dropzone component was not found in tree");
function hp(e) {
  const t = (n) => {
    const { children: r, ...o } = W(`Dropzone${Jm(e)}`, {}, n),
      s = TP(),
      i = no(r) ? r : g.jsx("span", { children: r });
    return s[e] ? x.cloneElement(i, o) : null;
  };
  return (t.displayName = `@mantine/dropzone/${Jm(e)}`), t;
}
const NP = hp("accept"),
  OP = hp("reject"),
  jP = hp("idle");
var ui = {
  root: "m_d46a4834",
  inner: "m_b85f7144",
  fullScreen: "m_96f6e9ad",
  dropzone: "m_7946116d",
};
const $P = {
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
  LP = (e, { radius: t, variant: n, acceptColor: r, rejectColor: o }) => {
    const s = e.variantColorResolver({
        color: r || e.primaryColor,
        theme: e,
        variant: n,
      }),
      i = e.variantColorResolver({ color: o || "red", theme: e, variant: n });
    return {
      root: {
        "--dropzone-radius": Rn(t),
        "--dropzone-accept-color": s.color,
        "--dropzone-accept-bg": s.background,
        "--dropzone-reject-color": i.color,
        "--dropzone-reject-bg": i.background,
      },
    };
  },
  Er = G((e, t) => {
    const n = W("Dropzone", $P, e),
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
        maxSize: p,
        accept: m,
        children: h,
        onDropAny: S,
        onDrop: v,
        onReject: w,
        openRef: y,
        name: b,
        maxFiles: E,
        autoFocus: C,
        activateOnClick: R,
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
        getFilesFromEvent: k,
        validator: _,
        rejectColor: $,
        acceptColor: O,
        enablePointerEvents: I,
        loaderProps: q,
        inputProps: Q,
        mod: ee,
        ...ne
      } = n,
      te = de({
        name: "Dropzone",
        classes: ui,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: LP,
      }),
      {
        getRootProps: me,
        getInputProps: oe,
        isDragAccept: le,
        isDragReject: Z,
        open: he,
      } = Nw({
        onDrop: S,
        onDropAccepted: v,
        onDropRejected: w,
        disabled: u || d,
        accept: Array.isArray(m)
          ? m.reduce((se, ke) => ({ ...se, [ke]: [] }), {})
          : m,
        multiple: f,
        maxSize: p,
        maxFiles: E,
        autoFocus: C,
        noClick: !R,
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
        validator: _,
        ...(k ? { getFilesFromEvent: k } : null),
      });
    wf(y, he);
    const ae = !le && !Z;
    return g.jsx(PP, {
      value: { accept: le, reject: Z, idle: ae },
      children: g.jsxs(X, {
        ...me(),
        ...te("root", { focusable: !0 }),
        ...ne,
        mod: [
          {
            accept: le,
            reject: Z,
            idle: ae,
            loading: d,
            "activate-on-click": R,
          },
          ee,
        ],
        children: [
          g.jsx(sp, {
            visible: d,
            overlayProps: { radius: c },
            unstyled: l,
            loaderProps: q,
          }),
          g.jsx("input", { ...oe(Q), name: b }),
          g.jsx("div", {
            ...te("inner"),
            ref: t,
            "data-enable-pointer-events": I || void 0,
            children: h,
          }),
        ],
      }),
    });
  });
Er.classes = ui;
Er.displayName = "@mantine/dropzone/Dropzone";
Er.Accept = NP;
Er.Idle = jP;
Er.Reject = OP;
const AP = {
    loading: !1,
    maxSize: 1 / 0,
    activateOnClick: !1,
    activateOnDrag: !0,
    dragEventsBubbling: !0,
    activateOnKeyboard: !0,
    active: !0,
    zIndex: ro("max"),
    withinPortal: !0,
  },
  gp = G((e, t) => {
    const n = W("DropzoneFullScreen", AP, e),
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
        withinPortal: p,
        portalProps: m,
        ...h
      } = n,
      S = de({
        name: "DropzoneFullScreen",
        classes: ui,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "fullScreen",
      }),
      { resolvedClassNames: v, resolvedStyles: w } = so({
        classNames: r,
        styles: i,
        props: n,
      }),
      [y, b] = x.useState(0),
      [E, { open: C, close: R }] = si(!1),
      D = (N) => {
        var M;
        (M = N.dataTransfer) != null &&
          M.types.includes("Files") &&
          (b((B) => B + 1), C());
      },
      L = () => {
        b((N) => N - 1);
      };
    return (
      x.useEffect(() => {
        y === 0 && R();
      }, [y]),
      x.useEffect(() => {
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
      g.jsx(ka, {
        ...m,
        withinPortal: p,
        children: g.jsx(X, {
          ...S("fullScreen", {
            style: {
              opacity: E ? 1 : 0,
              pointerEvents: E ? "all" : "none",
              zIndex: f,
            },
          }),
          ref: t,
          children: g.jsx(Er, {
            ...h,
            classNames: v,
            styles: w,
            unstyled: l,
            className: ui.dropzone,
            onDrop: (N) => {
              u == null || u(N), R(), b(0);
            },
            onReject: (N) => {
              d == null || d(N), R(), b(0);
            },
          }),
        }),
      })
    );
  });
gp.classes = ui;
gp.displayName = "@mantine/dropzone/DropzoneFullScreen";
Er.FullScreen = gp;
const el = Er,
  yp = (e) => {
    const {
        title: t,
        description: n,
        placeholder: r,
        form: o,
        field_id: s,
      } = e,
      [i, l] = x.useState([]);
    o.values.files.map((c, u) =>
      g.jsxs(
        Ar,
        {
          children: [
            g.jsx("b", { children: c.name }),
            " (",
            (c.size / 1024).toFixed(2),
            " kb)",
            g.jsx(Gr, {
              size: "xs",
              onClick: () =>
                o.setFieldValue(
                  "files",
                  o.values.files.filter((d, f) => f !== u)
                ),
            }),
          ],
        },
        c.name
      )
    );
    const a = i.map((c, u) =>
      g.jsxs(
        Ar,
        {
          className: "ml-4",
          children: [
            g.jsx("i", { class: "icon ion-md-document green-text pr-2" }),
            g.jsx("b", { children: c.name }),
            " (",
            (c.size / 1024).toFixed(2),
            " kb)",
            g.jsx(Gr, {
              size: "xs",
              onClick: () => {
                const d = i.filter((f, p) => p !== u);
                o.setFieldValue("files", d), l(d);
              },
            }),
          ],
        },
        c.name
      )
    );
    return g.jsxs("div", {
      children: [
        t && g.jsx("h2", { children: t }),
        n && g.jsx("label", { children: n }),
        a.length > 0 &&
          g.jsxs("div", {
            className: "mb-2 uploaded-files",
            children: [
              g.jsx(Ar, { mb: 5, mt: "md", children: "Selected files:" }),
              a,
            ],
          }),
        g.jsx(el, {
          h: 120,
          p: 0,
          multiple: !0,
          onDrop: (c) => {
            o.setFieldValue("files", c), l(c);
          },
          children: g.jsxs(rp, {
            h: 120,
            children: [
              g.jsx(el.Idle, {
                className: "p-3",
                children: r
                  ? g.jsx(g.Fragment, { children: r })
                  : g.jsx(g.Fragment, { children: "Drop files here" }),
              }),
              g.jsx(el.Accept, { children: "Drop files here" }),
              g.jsx(el.Reject, { children: "Files are invalid" }),
            ],
          }),
        }),
        o.errors.files &&
          g.jsx(Ar, { c: "red", mt: 5, children: o.errors.files }),
      ],
    });
  };
yp.defaultProps = {};
yp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
};
var Ow = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(wd, function () {
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
      p = "year",
      m = "date",
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
      y = function (A, j, P) {
        var T = String(A);
        return !T || T.length >= j
          ? A
          : "" + Array(j + 1 - T.length).join(P) + A;
      },
      b = {
        s: y,
        z: function (A) {
          var j = -A.utcOffset(),
            P = Math.abs(j),
            T = Math.floor(P / 60),
            k = P % 60;
          return (j <= 0 ? "+" : "-") + y(T, 2, "0") + ":" + y(k, 2, "0");
        },
        m: function A(j, P) {
          if (j.date() < P.date()) return -A(P, j);
          var T = 12 * (P.year() - j.year()) + (P.month() - j.month()),
            k = j.clone().add(T, d),
            _ = P - k < 0,
            $ = j.clone().add(T + (_ ? -1 : 1), d);
          return +(-(T + (P - k) / (_ ? k - $ : $ - k)) || 0);
        },
        a: function (A) {
          return A < 0 ? Math.ceil(A) || 0 : Math.floor(A);
        },
        p: function (A) {
          return (
            { M: d, y: p, w: u, d: c, D: m, h: a, m: l, s: i, ms: s, Q: f }[
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
      E = "en",
      C = {};
    C[E] = w;
    var R = "$isDayjsObject",
      D = function (A) {
        return A instanceof B || !(!A || !A[R]);
      },
      L = function A(j, P, T) {
        var k;
        if (!j) return E;
        if (typeof j == "string") {
          var _ = j.toLowerCase();
          C[_] && (k = _), P && ((C[_] = P), (k = _));
          var $ = j.split("-");
          if (!k && $.length > 1) return A($[0]);
        } else {
          var O = j.name;
          (C[O] = j), (k = O);
        }
        return !T && k && (E = k), k || (!T && E);
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
            (this[R] = !0);
        }
        var j = A.prototype;
        return (
          (j.parse = function (P) {
            (this.$d = (function (T) {
              var k = T.date,
                _ = T.utc;
              if (k === null) return new Date(NaN);
              if (M.u(k)) return new Date();
              if (k instanceof Date) return new Date(k);
              if (typeof k == "string" && !/Z$/i.test(k)) {
                var $ = k.match(S);
                if ($) {
                  var O = $[2] - 1 || 0,
                    I = ($[7] || "0").substring(0, 3);
                  return _
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
              return new Date(k);
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
            var k = N(P);
            return this.startOf(T) <= k && k <= this.endOf(T);
          }),
          (j.isAfter = function (P, T) {
            return N(P) < this.startOf(T);
          }),
          (j.isBefore = function (P, T) {
            return this.endOf(T) < N(P);
          }),
          (j.$g = function (P, T, k) {
            return M.u(P) ? this[T] : this.set(k, P);
          }),
          (j.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }),
          (j.valueOf = function () {
            return this.$d.getTime();
          }),
          (j.startOf = function (P, T) {
            var k = this,
              _ = !!M.u(T) || T,
              $ = M.p(P),
              O = function (oe, le) {
                var Z = M.w(
                  k.$u ? Date.UTC(k.$y, le, oe) : new Date(k.$y, le, oe),
                  k
                );
                return _ ? Z : Z.endOf(c);
              },
              I = function (oe, le) {
                return M.w(
                  k
                    .toDate()
                    [oe].apply(
                      k.toDate("s"),
                      (_ ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(le)
                    ),
                  k
                );
              },
              q = this.$W,
              Q = this.$M,
              ee = this.$D,
              ne = "set" + (this.$u ? "UTC" : "");
            switch ($) {
              case p:
                return _ ? O(1, 0) : O(31, 11);
              case d:
                return _ ? O(1, Q) : O(0, Q + 1);
              case u:
                var te = this.$locale().weekStart || 0,
                  me = (q < te ? q + 7 : q) - te;
                return O(_ ? ee - me : ee + (6 - me), Q);
              case c:
              case m:
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
            var k,
              _ = M.p(P),
              $ = "set" + (this.$u ? "UTC" : ""),
              O = ((k = {}),
              (k[c] = $ + "Date"),
              (k[m] = $ + "Date"),
              (k[d] = $ + "Month"),
              (k[p] = $ + "FullYear"),
              (k[a] = $ + "Hours"),
              (k[l] = $ + "Minutes"),
              (k[i] = $ + "Seconds"),
              (k[s] = $ + "Milliseconds"),
              k)[_],
              I = _ === c ? this.$D + (T - this.$W) : T;
            if (_ === d || _ === p) {
              var q = this.clone().set(m, 1);
              q.$d[O](I),
                q.init(),
                (this.$d = q.set(m, Math.min(this.$D, q.daysInMonth())).$d);
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
            var k,
              _ = this;
            P = Number(P);
            var $ = M.p(T),
              O = function (Q) {
                var ee = N(_);
                return M.w(ee.date(ee.date() + Math.round(Q * P)), _);
              };
            if ($ === d) return this.set(d, this.$M + P);
            if ($ === p) return this.set(p, this.$y + P);
            if ($ === c) return O(1);
            if ($ === u) return O(7);
            var I = ((k = {}), (k[l] = r), (k[a] = o), (k[i] = n), k)[$] || 1,
              q = this.$d.getTime() + P * I;
            return M.w(q, this);
          }),
          (j.subtract = function (P, T) {
            return this.add(-1 * P, T);
          }),
          (j.format = function (P) {
            var T = this,
              k = this.$locale();
            if (!this.isValid()) return k.invalidDate || h;
            var _ = P || "YYYY-MM-DDTHH:mm:ssZ",
              $ = M.z(this),
              O = this.$H,
              I = this.$m,
              q = this.$M,
              Q = k.weekdays,
              ee = k.months,
              ne = k.meridiem,
              te = function (le, Z, he, ae) {
                return (le && (le[Z] || le(T, _))) || he[Z].slice(0, ae);
              },
              me = function (le) {
                return M.s(O % 12 || 12, le, "0");
              },
              oe =
                ne ||
                function (le, Z, he) {
                  var ae = le < 12 ? "AM" : "PM";
                  return he ? ae.toLowerCase() : ae;
                };
            return _.replace(v, function (le, Z) {
              return (
                Z ||
                (function (he) {
                  switch (he) {
                    case "YY":
                      return String(T.$y).slice(-2);
                    case "YYYY":
                      return M.s(T.$y, 4, "0");
                    case "M":
                      return q + 1;
                    case "MM":
                      return M.s(q + 1, 2, "0");
                    case "MMM":
                      return te(k.monthsShort, q, ee, 3);
                    case "MMMM":
                      return te(ee, q);
                    case "D":
                      return T.$D;
                    case "DD":
                      return M.s(T.$D, 2, "0");
                    case "d":
                      return String(T.$W);
                    case "dd":
                      return te(k.weekdaysMin, T.$W, Q, 2);
                    case "ddd":
                      return te(k.weekdaysShort, T.$W, Q, 3);
                    case "dddd":
                      return Q[T.$W];
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
          (j.diff = function (P, T, k) {
            var _,
              $ = this,
              O = M.p(T),
              I = N(P),
              q = (I.utcOffset() - this.utcOffset()) * r,
              Q = this - I,
              ee = function () {
                return M.m($, I);
              };
            switch (O) {
              case p:
                _ = ee() / 12;
                break;
              case d:
                _ = ee();
                break;
              case f:
                _ = ee() / 3;
                break;
              case u:
                _ = (Q - q) / 6048e5;
                break;
              case c:
                _ = (Q - q) / 864e5;
                break;
              case a:
                _ = Q / o;
                break;
              case l:
                _ = Q / r;
                break;
              case i:
                _ = Q / n;
                break;
              default:
                _ = Q;
            }
            return k ? _ : M.a(_);
          }),
          (j.daysInMonth = function () {
            return this.endOf(d).$D;
          }),
          (j.$locale = function () {
            return C[this.$L];
          }),
          (j.locale = function (P, T) {
            if (!P) return this.$L;
            var k = this.clone(),
              _ = L(P, T, !0);
            return _ && (k.$L = _), k;
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
        ["$y", p],
        ["$D", m],
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
      (N.en = C[E]),
      (N.Ls = C),
      (N.p = {}),
      N
    );
  });
})(Ow);
var FP = Ow.exports;
const J = Zr(FP);
function MP({
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
function jw({
  controlsRef: e,
  direction: t,
  levelIndex: n,
  rowIndex: r,
  cellIndex: o,
  size: s,
}) {
  var a, c, u;
  const i = MP({
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
      ? jw({
          controlsRef: e,
          direction: t,
          levelIndex: i.levelIndex,
          cellIndex: i.cellIndex,
          rowIndex: i.rowIndex,
          size: s,
        })
      : l.focus());
}
function IP(e) {
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
function zP(e) {
  var t;
  return (t = e.current) == null
    ? void 0
    : t.map((n) => n.map((r) => r.length));
}
function vp({
  controlsRef: e,
  levelIndex: t,
  rowIndex: n,
  cellIndex: r,
  event: o,
}) {
  const s = IP(o.key);
  if (s) {
    o.preventDefault();
    const i = zP(e);
    jw({
      controlsRef: e,
      direction: s,
      levelIndex: t,
      rowIndex: n,
      cellIndex: r,
      size: i,
    });
  }
}
var $w = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(wd, function () {
    var n = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 },
      r = {};
    return function (o, s, i) {
      var l,
        a = function (f, p, m) {
          m === void 0 && (m = {});
          var h = new Date(f),
            S = (function (v, w) {
              w === void 0 && (w = {});
              var y = w.timeZoneName || "short",
                b = v + "|" + y,
                E = r[b];
              return (
                E ||
                  ((E = new Intl.DateTimeFormat("en-US", {
                    hour12: !1,
                    timeZone: v,
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: y,
                  })),
                  (r[b] = E)),
                E
              );
            })(p, m);
          return S.formatToParts(h);
        },
        c = function (f, p) {
          for (var m = a(f, p), h = [], S = 0; S < m.length; S += 1) {
            var v = m[S],
              w = v.type,
              y = v.value,
              b = n[w];
            b >= 0 && (h[b] = parseInt(y, 10));
          }
          var E = h[3],
            C = E === 24 ? 0 : E,
            R =
              h[0] +
              "-" +
              h[1] +
              "-" +
              h[2] +
              " " +
              C +
              ":" +
              h[4] +
              ":" +
              h[5] +
              ":000",
            D = +f;
          return (i.utc(R).valueOf() - (D -= D % 1e3)) / 6e4;
        },
        u = s.prototype;
      (u.tz = function (f, p) {
        f === void 0 && (f = l);
        var m = this.utcOffset(),
          h = this.toDate(),
          S = h.toLocaleString("en-US", { timeZone: f }),
          v = Math.round((h - new Date(S)) / 1e3 / 60),
          w = i(S, { locale: this.$L })
            .$set("millisecond", this.$ms)
            .utcOffset(15 * -Math.round(h.getTimezoneOffset() / 15) - v, !0);
        if (p) {
          var y = w.utcOffset();
          w = w.add(m - y, "minute");
        }
        return (w.$x.$timezone = f), w;
      }),
        (u.offsetName = function (f) {
          var p = this.$x.$timezone || i.tz.guess(),
            m = a(this.valueOf(), p, { timeZoneName: f }).find(function (h) {
              return h.type.toLowerCase() === "timezonename";
            });
          return m && m.value;
        });
      var d = u.startOf;
      (u.startOf = function (f, p) {
        if (!this.$x || !this.$x.$timezone) return d.call(this, f, p);
        var m = i(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
        return d.call(m, f, p).tz(this.$x.$timezone, !0);
      }),
        (i.tz = function (f, p, m) {
          var h = m && p,
            S = m || p || l,
            v = c(+i(), S);
          if (typeof f != "string") return i(f).tz(S);
          var w = (function (C, R, D) {
              var L = C - 60 * R * 1e3,
                N = c(L, D);
              if (R === N) return [L, R];
              var M = c((L -= 60 * (N - R) * 1e3), D);
              return N === M
                ? [L, N]
                : [C - 60 * Math.min(N, M) * 1e3, Math.max(N, M)];
            })(i.utc(f, h).valueOf(), v, S),
            y = w[0],
            b = w[1],
            E = i(y).utcOffset(b);
          return (E.$x.$timezone = S), E;
        }),
        (i.tz.guess = function () {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }),
        (i.tz.setDefault = function (f) {
          l = f;
        });
    };
  });
})($w);
var BP = $w.exports;
const VP = Zr(BP);
var Lw = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(wd, function () {
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
          ((h = (function (E) {
            E === void 0 && (E = "");
            var C = E.match(r);
            if (!C) return null;
            var R = ("" + C[0]).match(o) || ["-", 0, 0],
              D = R[0],
              L = 60 * +R[1] + +R[2];
            return L === 0 ? 0 : D === "+" ? L : -L;
          })(h)),
          h === null)
        )
          return this;
        var w = Math.abs(h) <= 16 ? 60 * h : h,
          y = this;
        if (S) return (y.$offset = w), (y.$u = h === 0), y;
        if (h !== 0) {
          var b = this.$u
            ? this.toDate().getTimezoneOffset()
            : -1 * this.utcOffset();
          ((y = this.local().add(w + b, n)).$offset = w),
            (y.$x.$localOffset = b);
        } else y = this.utc();
        return y;
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
      var p = a.toDate;
      a.toDate = function (h) {
        return h === "s" && this.$offset
          ? l(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate()
          : p.call(this);
      };
      var m = a.diff;
      a.diff = function (h, S, v) {
        if (h && this.$u === h.$u) return m.call(this, h, S, v);
        var w = this.local(),
          y = l(h).local();
        return m.call(w, y, S, v);
      };
    };
  });
})(Lw);
var HP = Lw.exports;
const WP = Zr(HP);
J.extend(WP);
J.extend(VP);
function UP(e, t) {
  return t ? J(e).tz(t).utcOffset() + e.getTimezoneOffset() : 0;
}
const Jh = (e, t, n) => {
  if (!e) return null;
  if (!t) return e;
  let r = UP(e, t);
  return n === "remove" && (r *= -1), J(e).add(r, "minutes").toDate();
};
function Mo(e, t, n, r) {
  return r || !t
    ? t
    : Array.isArray(t)
    ? t.map((o) => Jh(o, n, e))
    : Jh(t, n, e);
}
const YP = {
    locale: "en",
    timezone: null,
    firstDayOfWeek: 1,
    weekendDays: [0, 6],
    labelSeparator: "–",
    consistentWeeks: !1,
  },
  qP = x.createContext(YP);
function pn() {
  const e = x.useContext(qP),
    t = x.useCallback((i) => i || e.locale, [e.locale]),
    n = x.useCallback((i) => i || e.timezone || void 0, [e.timezone]),
    r = x.useCallback(
      (i) => (typeof i == "number" ? i : e.firstDayOfWeek),
      [e.firstDayOfWeek]
    ),
    o = x.useCallback(
      (i) => (Array.isArray(i) ? i : e.weekendDays),
      [e.weekendDays]
    ),
    s = x.useCallback(
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
var Aw = { day: "m_396ce5cb" };
const KP = {},
  GP = (e, { size: t }) => ({ day: { "--day-size": Pe(t, "day-size") } }),
  wp = G((e, t) => {
    const n = W("Day", KP, e),
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
        outside: p,
        selected: m,
        renderDay: h,
        inRange: S,
        firstInRange: v,
        lastInRange: w,
        hidden: y,
        static: b,
        ...E
      } = n,
      C = de({
        name: d || "Day",
        classes: Aw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: GP,
        rootSelector: "day",
      }),
      R = pn();
    return g.jsx(Mn, {
      ...C("day", { style: y ? { display: "none" } : void 0 }),
      component: b ? "div" : "button",
      ref: t,
      disabled: u,
      "data-today":
        J(c).isSame(Mo("add", new Date(), R.getTimezone()), "day") || void 0,
      "data-hidden": y || void 0,
      "data-disabled": u || void 0,
      "data-weekend": (!u && !p && f) || void 0,
      "data-outside": (!u && p) || void 0,
      "data-selected": (!u && m) || void 0,
      "data-in-range": (S && !u) || void 0,
      "data-first-in-range": (v && !u) || void 0,
      "data-last-in-range": (w && !u) || void 0,
      "data-static": b || void 0,
      unstyled: l,
      ...E,
      children: (h == null ? void 0 : h(c)) || c.getDate(),
    });
  });
wp.classes = Aw;
wp.displayName = "@mantine/dates/Day";
function XP({ locale: e, format: t = "dd", firstDayOfWeek: n = 1 }) {
  const r = J().day(n),
    o = [];
  for (let s = 0; s < 7; s += 1)
    typeof t == "string"
      ? o.push(J(r).add(s, "days").locale(e).format(t))
      : o.push(t(J(r).add(s, "days").toDate()));
  return o;
}
var Fw = { weekday: "m_18a3eca" };
const QP = {},
  JP = (e, { size: t }) => ({
    weekdaysRow: { "--wr-fz": ot(t), "--wr-spacing": xa(t) },
  }),
  xp = G((e, t) => {
    const n = W("WeekdaysRow", QP, e),
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
        __staticSelector: p,
        ...m
      } = n,
      h = de({
        name: p || "WeekdaysRow",
        classes: Fw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: JP,
        rootSelector: "weekdaysRow",
      }),
      S = pn(),
      v = XP({
        locale: S.getLocale(c),
        format: d,
        firstDayOfWeek: S.getFirstDayOfWeek(u),
      }).map((w, y) => g.jsx(f, { ...h("weekday"), children: w }, y));
    return g.jsx(X, {
      component: "tr",
      ref: t,
      ...h("weekdaysRow"),
      ...m,
      children: v,
    });
  });
xp.classes = Fw;
xp.displayName = "@mantine/dates/WeekdaysRow";
function ZP(e, t = 1) {
  const n = new Date(e),
    r = t === 0 ? 6 : t - 1;
  for (; n.getDay() !== r; ) n.setDate(n.getDate() + 1);
  return n;
}
function eT(e, t = 1) {
  const n = new Date(e);
  for (; n.getDay() !== t; ) n.setDate(n.getDate() - 1);
  return n;
}
function tT({ month: e, firstDayOfWeek: t = 1, consistentWeeks: n }) {
  const r = e.getMonth(),
    o = new Date(e.getFullYear(), r, 1),
    s = new Date(e.getFullYear(), e.getMonth() + 1, 0),
    i = ZP(s, t),
    l = eT(o, t),
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
      for (let p = 0; p < 7; p += 1)
        f.push(new Date(d)), d.setDate(d.getDate() + 1);
      a.push(f);
    }
  }
  return a;
}
function Mw(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth();
}
function Iw(e, t) {
  return t instanceof Date ? J(e).isAfter(J(t).subtract(1, "day"), "day") : !0;
}
function zw(e, t) {
  return t instanceof Date ? J(e).isBefore(J(t).add(1, "day"), "day") : !0;
}
function nT(e, t, n, r, o, s, i) {
  const l = e.flat().filter((u) => {
      var d;
      return (
        zw(u, n) &&
        Iw(u, t) &&
        !(o != null && o(u)) &&
        !((d = r == null ? void 0 : r(u)) != null && d.disabled) &&
        (!s || Mw(u, i))
      );
    }),
    a = l.find((u) => {
      var d;
      return (d = r == null ? void 0 : r(u)) == null ? void 0 : d.selected;
    });
  if (a) return a;
  const c = l.find((u) => J().isSame(u, "date"));
  return c || l[0];
}
var Bw = { month: "m_cc9820d3", monthCell: "m_8f457cd5" };
const rT = { withCellSpacing: !0 },
  Va = G((e, t) => {
    const n = W("Month", rT, e),
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
        month: p,
        weekendDays: m,
        getDayProps: h,
        excludeDate: S,
        minDate: v,
        maxDate: w,
        renderDay: y,
        hideOutsideDates: b,
        hideWeekdays: E,
        getDayAriaLabel: C,
        static: R,
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
      T = de({
        name: c || "Month",
        classes: Bw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "month",
      }),
      k = pn(),
      _ = tT({
        month: p,
        firstDayOfWeek: k.getFirstDayOfWeek(d),
        consistentWeeks: k.consistentWeeks,
      }),
      $ = nT(_, v, w, h, S, b, p),
      { resolvedClassNames: O, resolvedStyles: I } = so({
        classNames: r,
        styles: i,
        props: n,
      }),
      q = _.map((Q, ee) => {
        const ne = Q.map((te, me) => {
          const oe = !Mw(te, p),
            le =
              (C == null ? void 0 : C(te)) ||
              J(te)
                .locale(u || k.locale)
                .format("D MMMM YYYY"),
            Z = h == null ? void 0 : h(te),
            he = J(te).isSame($, "date");
          return g.jsx(
            "td",
            {
              ...T("monthCell"),
              "data-with-spacing": A || void 0,
              children: g.jsx(wp, {
                __staticSelector: c || "Month",
                classNames: O,
                styles: I,
                unstyled: l,
                "data-mantine-stop-propagation": V || void 0,
                renderDay: y,
                date: te,
                size: j,
                weekend: k.getWeekendDays(m).includes(te.getDay()),
                outside: oe,
                hidden: b ? oe : !1,
                "aria-label": le,
                static: R,
                disabled:
                  (S == null ? void 0 : S(te)) || !zw(te, w) || !Iw(te, v),
                ref: (ae) => (D == null ? void 0 : D(ee, me, ae)),
                ...Z,
                onKeyDown: (ae) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onKeyDown) == null ||
                    se.call(Z, ae),
                    L == null ||
                      L(ae, { rowIndex: ee, cellIndex: me, date: te });
                },
                onMouseEnter: (ae) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onMouseEnter) == null ||
                    se.call(Z, ae),
                    M == null || M(ae, te);
                },
                onClick: (ae) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onClick) == null ||
                    se.call(Z, ae),
                    N == null || N(ae, te);
                },
                onMouseDown: (ae) => {
                  var se;
                  (se = Z == null ? void 0 : Z.onMouseDown) == null ||
                    se.call(Z, ae),
                    B && ae.preventDefault();
                },
                tabIndex: B || !he ? -1 : 0,
              }),
            },
            te.toString()
          );
        });
        return g.jsx("tr", { ...T("monthRow"), children: ne }, ee);
      });
    return g.jsxs(X, {
      component: "table",
      ...T("month"),
      size: j,
      ref: t,
      ...P,
      children: [
        !E &&
          g.jsx("thead", {
            ...T("monthThead"),
            children: g.jsx(xp, {
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
        g.jsx("tbody", { ...T("monthTbody"), children: q }),
      ],
    });
  });
Va.classes = Bw;
Va.displayName = "@mantine/dates/Month";
var Vw = { pickerControl: "m_dc6a3c71" };
const oT = {},
  sT = (e, { size: t }) => ({
    pickerControl: { "--dpc-fz": ot(t), "--dpc-size": Pe(t, "dpc-size") },
  }),
  Ha = G((e, t) => {
    const n = W("PickerControl", oT, e),
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
        selected: p,
        disabled: m,
        ...h
      } = n,
      S = de({
        name: f || "PickerControl",
        classes: Vw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: sT,
        rootSelector: "pickerControl",
      });
    return g.jsx(Mn, {
      ...S("pickerControl"),
      ref: t,
      unstyled: l,
      "data-picker-control": !0,
      "data-selected": (p && !m) || void 0,
      "data-disabled": m || void 0,
      "data-in-range": (d && !m && !p) || void 0,
      "data-first-in-range": (c && !m) || void 0,
      "data-last-in-range": (u && !m) || void 0,
      disabled: m,
      ...h,
    });
  });
Ha.classes = Vw;
Ha.displayName = "@mantine/dates/PickerControl";
function Hw(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && J(e).isBefore(t, "year")) || (n && J(e).isAfter(n, "year")));
}
function iT(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !Hw(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => J().isSame(l, "year"));
  return i || o[0];
}
function Ww(e) {
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
var Uw = { yearsList: "m_9206547b", yearsListCell: "m_c5a19c7d" };
const lT = { yearsListFormat: "YYYY", withCellSpacing: !0 },
  Wa = G((e, t) => {
    const n = W("YearsList", lT, e),
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
        maxDate: p,
        getYearControlProps: m,
        __staticSelector: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: w,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: E,
        withCellSpacing: C,
        size: R,
        ...D
      } = n,
      L = de({
        name: h || "YearsList",
        classes: Uw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "yearsList",
      }),
      N = pn(),
      M = Ww(c),
      B = iT(M, f, p, m),
      V = M.map((A, j) => {
        const P = A.map((T, k) => {
          const _ = m == null ? void 0 : m(T),
            $ = J(T).isSame(B, "year");
          return g.jsx(
            "td",
            {
              ...L("yearsListCell"),
              "data-with-spacing": C || void 0,
              children: g.jsx(Ha, {
                ...L("yearsListControl"),
                size: R,
                unstyled: l,
                "data-mantine-stop-propagation": E || void 0,
                disabled: Hw(T, f, p),
                ref: (O) => (S == null ? void 0 : S(j, k, O)),
                ..._,
                onKeyDown: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onKeyDown) == null ||
                    I.call(_, O),
                    v == null || v(O, { rowIndex: j, cellIndex: k, date: T });
                },
                onClick: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onClick) == null || I.call(_, O),
                    w == null || w(O, T);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onMouseEnter) == null ||
                    I.call(_, O),
                    y == null || y(O, T);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onMouseDown) == null ||
                    I.call(_, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: J(T).locale(N.getLocale(d)).format(u),
              }),
            },
            k
          );
        });
        return g.jsx("tr", { ...L("yearsListRow"), children: P }, j);
      });
    return g.jsx(X, {
      component: "table",
      ref: t,
      size: R,
      ...L("yearsList"),
      ...D,
      children: g.jsx("tbody", { children: V }),
    });
  });
Wa.classes = Uw;
Wa.displayName = "@mantine/dates/YearsList";
function Yw(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && J(e).isBefore(t, "month")) || (n && J(e).isAfter(n, "month")));
}
function aT(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !Yw(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => J().isSame(l, "month"));
  return i || o[0];
}
function cT(e) {
  const t = J(e).startOf("year").toDate(),
    n = [[], [], [], []];
  let r = 0;
  for (let o = 0; o < 4; o += 1)
    for (let s = 0; s < 3; s += 1)
      n[o].push(J(t).add(r, "months").toDate()), (r += 1);
  return n;
}
var qw = { monthsList: "m_2a6c32d", monthsListCell: "m_fe27622f" };
const uT = { monthsListFormat: "MMM", withCellSpacing: !0 },
  Ua = G((e, t) => {
    const n = W("MonthsList", uT, e),
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
        minDate: p,
        maxDate: m,
        getMonthControlProps: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: w,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: E,
        withCellSpacing: C,
        size: R,
        ...D
      } = n,
      L = de({
        name: c || "MonthsList",
        classes: qw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "monthsList",
      }),
      N = pn(),
      M = cT(u),
      B = aT(M, p, m, h),
      V = M.map((A, j) => {
        const P = A.map((T, k) => {
          const _ = h == null ? void 0 : h(T),
            $ = J(T).isSame(B, "month");
          return g.jsx(
            "td",
            {
              ...L("monthsListCell"),
              "data-with-spacing": C || void 0,
              children: g.jsx(Ha, {
                ...L("monthsListControl"),
                size: R,
                unstyled: l,
                __staticSelector: c || "MonthsList",
                "data-mantine-stop-propagation": E || void 0,
                disabled: Yw(T, p, m),
                ref: (O) => (S == null ? void 0 : S(j, k, O)),
                ..._,
                onKeyDown: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onKeyDown) == null ||
                    I.call(_, O),
                    v == null || v(O, { rowIndex: j, cellIndex: k, date: T });
                },
                onClick: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onClick) == null || I.call(_, O),
                    w == null || w(O, T);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onMouseEnter) == null ||
                    I.call(_, O),
                    y == null || y(O, T);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = _ == null ? void 0 : _.onMouseDown) == null ||
                    I.call(_, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: J(T).locale(N.getLocale(f)).format(d),
              }),
            },
            k
          );
        });
        return g.jsx("tr", { ...L("monthsListRow"), children: P }, j);
      });
    return g.jsx(X, {
      component: "table",
      ref: t,
      size: R,
      ...L("monthsList"),
      ...D,
      children: g.jsx("tbody", { children: V }),
    });
  });
Ua.classes = qw;
Ua.displayName = "@mantine/dates/MonthsList";
var Kw = {
  calendarHeader: "m_730a79ed",
  calendarHeaderLevel: "m_f6645d97",
  calendarHeaderControl: "m_2351eeb0",
  calendarHeaderControlIcon: "m_367dc749",
};
const dT = {
    nextDisabled: !1,
    previousDisabled: !1,
    hasNextLevel: !0,
    withNext: !0,
    withPrevious: !0,
  },
  fT = (e, { size: t }) => ({
    calendarHeader: {
      "--dch-control-size": Pe(t, "dch-control-size"),
      "--dch-fz": ot(t),
    },
  }),
  _r = G((e, t) => {
    const n = W("CalendarHeader", dT, e),
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
        onNext: p,
        onPrevious: m,
        onLevelClick: h,
        label: S,
        nextDisabled: v,
        previousDisabled: w,
        hasNextLevel: y,
        levelControlAriaLabel: b,
        withNext: E,
        withPrevious: C,
        __staticSelector: R,
        __preventFocus: D,
        __stopPropagation: L,
        ...N
      } = n,
      M = de({
        name: R || "CalendarHeader",
        classes: Kw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: fT,
        rootSelector: "calendarHeader",
      }),
      B = D ? (V) => V.preventDefault() : void 0;
    return g.jsxs(X, {
      ...M("calendarHeader"),
      ref: t,
      ...N,
      children: [
        C &&
          g.jsx(Mn, {
            ...M("calendarHeaderControl"),
            "data-direction": "previous",
            "aria-label": f,
            onClick: m,
            unstyled: l,
            onMouseDown: B,
            disabled: w,
            "data-disabled": w || void 0,
            tabIndex: D || w ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              u ||
              g.jsx(ed, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "previous",
                size: "45%",
              }),
          }),
        g.jsx(Mn, {
          component: y ? "button" : "div",
          ...M("calendarHeaderLevel"),
          onClick: y ? h : void 0,
          unstyled: l,
          onMouseDown: y ? B : void 0,
          disabled: !y,
          "data-static": !y || void 0,
          "aria-label": b,
          tabIndex: D || !y ? -1 : 0,
          "data-mantine-stop-propagation": L || void 0,
          children: S,
        }),
        E &&
          g.jsx(Mn, {
            ...M("calendarHeaderControl"),
            "data-direction": "next",
            "aria-label": d,
            onClick: p,
            unstyled: l,
            onMouseDown: B,
            disabled: v,
            "data-disabled": v || void 0,
            tabIndex: D || v ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              c ||
              g.jsx(ed, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "next",
                size: "45%",
              }),
          }),
      ],
    });
  });
_r.classes = Kw;
_r.displayName = "@mantine/dates/CalendarHeader";
function pT(e) {
  const t = Ww(e);
  return [t[0][0], t[3][0]];
}
const mT = { decadeLabelFormat: "YYYY" },
  Ya = G((e, t) => {
    const n = W("DecadeLevel", mT, e),
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
        withCellSpacing: p,
        __preventFocus: m,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: w,
        onNext: y,
        onPrevious: b,
        nextDisabled: E,
        previousDisabled: C,
        levelControlAriaLabel: R,
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
      k = pn(),
      [_, $] = pT(r),
      O = {
        __staticSelector: A || "DecadeLevel",
        classNames: M,
        styles: B,
        unstyled: V,
        size: P,
      },
      I = typeof E == "boolean" ? E : i ? !J($).endOf("year").isBefore(i) : !1,
      q = typeof C == "boolean" ? C : s ? !J(_).startOf("year").isAfter(s) : !1,
      Q = (ee, ne) =>
        J(ee)
          .locale(o || k.locale)
          .format(ne);
    return g.jsxs(X, {
      "data-decade-level": !0,
      size: P,
      ref: t,
      ...T,
      children: [
        g.jsx(_r, {
          label: typeof N == "function" ? N(_, $) : `${Q(_, N)} – ${Q($, N)}`,
          __preventFocus: m,
          __stopPropagation: j,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: w,
          onNext: y,
          onPrevious: b,
          nextDisabled: I,
          previousDisabled: q,
          hasNextLevel: !1,
          levelControlAriaLabel: R,
          withNext: D,
          withPrevious: L,
          ...O,
        }),
        g.jsx(Wa, {
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
          __preventFocus: m,
          __stopPropagation: j,
          withCellSpacing: p,
          ...O,
        }),
      ],
    });
  });
Ya.classes = { ...Wa.classes, ..._r.classes };
Ya.displayName = "@mantine/dates/DecadeLevel";
const hT = { yearLabelFormat: "YYYY" },
  qa = G((e, t) => {
    const n = W("YearLevel", hT, e),
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
        withCellSpacing: p,
        __preventFocus: m,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: w,
        onNext: y,
        onPrevious: b,
        onLevelClick: E,
        nextDisabled: C,
        previousDisabled: R,
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
        unstyled: k,
        ..._
      } = n,
      $ = pn(),
      O = {
        __staticSelector: V || "YearLevel",
        classNames: P,
        styles: T,
        unstyled: k,
        size: j,
      },
      I = typeof C == "boolean" ? C : i ? !J(r).endOf("year").isBefore(i) : !1,
      q = typeof R == "boolean" ? R : s ? !J(r).startOf("year").isAfter(s) : !1;
    return g.jsxs(X, {
      "data-year-level": !0,
      size: j,
      ref: t,
      ..._,
      children: [
        g.jsx(_r, {
          label:
            typeof B == "function"
              ? B(r)
              : J(r)
                  .locale(o || $.locale)
                  .format(B),
          __preventFocus: m,
          __stopPropagation: A,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: w,
          onNext: y,
          onPrevious: b,
          onLevelClick: E,
          nextDisabled: I,
          previousDisabled: q,
          hasNextLevel: D,
          levelControlAriaLabel: L,
          withNext: N,
          withPrevious: M,
          ...O,
        }),
        g.jsx(Ua, {
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
          __preventFocus: m,
          __stopPropagation: A,
          withCellSpacing: p,
          ...O,
        }),
      ],
    });
  });
qa.classes = { ..._r.classes, ...Ua.classes };
qa.displayName = "@mantine/dates/YearLevel";
const gT = { monthLabelFormat: "MMMM YYYY" },
  Ka = G((e, t) => {
    const n = W("MonthLevel", gT, e),
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
        hideOutsideDates: p,
        hideWeekdays: m,
        getDayAriaLabel: h,
        __getDayRef: S,
        __onDayKeyDown: v,
        __onDayClick: w,
        __onDayMouseEnter: y,
        withCellSpacing: b,
        __preventFocus: E,
        __stopPropagation: C,
        nextIcon: R,
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
        withNext: k,
        withPrevious: _,
        monthLabelFormat: $,
        classNames: O,
        styles: I,
        unstyled: q,
        __staticSelector: Q,
        size: ee,
        static: ne,
        ...te
      } = n,
      me = pn(),
      oe = {
        __staticSelector: Q || "MonthLevel",
        classNames: O,
        styles: I,
        unstyled: q,
        size: ee,
      },
      le =
        typeof A == "boolean" ? A : d ? !J(r).endOf("month").isBefore(d) : !1,
      Z =
        typeof j == "boolean" ? j : u ? !J(r).startOf("month").isAfter(u) : !1;
    return g.jsxs(X, {
      "data-month-level": !0,
      size: ee,
      ref: t,
      ...te,
      children: [
        g.jsx(_r, {
          label:
            typeof $ == "function"
              ? $(r)
              : J(r)
                  .locale(o || me.locale)
                  .format($),
          __preventFocus: E,
          __stopPropagation: C,
          nextIcon: R,
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
          withNext: k,
          withPrevious: _,
          ...oe,
        }),
        g.jsx(Va, {
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
          hideOutsideDates: p,
          hideWeekdays: m,
          getDayAriaLabel: h,
          __getDayRef: S,
          __onDayKeyDown: v,
          __onDayClick: w,
          __onDayMouseEnter: y,
          __preventFocus: E,
          __stopPropagation: C,
          static: ne,
          withCellSpacing: b,
          ...oe,
        }),
      ],
    });
  });
Ka.classes = { ...Va.classes, ..._r.classes };
Ka.displayName = "@mantine/dates/MonthLevel";
var Gw = { levelsGroup: "m_30b26e33" };
const yT = {},
  kr = G((e, t) => {
    const n = W("LevelsGroup", yT, e),
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
      d = de({
        name: c || "LevelsGroup",
        classes: Gw,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "levelsGroup",
      });
    return g.jsx(X, { ref: t, ...d("levelsGroup"), ...u });
  });
kr.classes = Gw;
kr.displayName = "@mantine/dates/LevelsGroup";
const vT = { numberOfColumns: 1 },
  Ga = G((e, t) => {
    const n = W("DecadeLevelGroup", vT, e),
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
        nextIcon: p,
        previousIcon: m,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: w,
        nextDisabled: y,
        previousDisabled: b,
        classNames: E,
        styles: C,
        unstyled: R,
        __staticSelector: D,
        __stopPropagation: L,
        numberOfColumns: N,
        levelControlAriaLabel: M,
        decadeLabelFormat: B,
        size: V,
        vars: A,
        ...j
      } = n,
      P = x.useRef([]),
      T = Array(N)
        .fill(0)
        .map((k, _) => {
          const $ = J(r)
            .add(_ * 10, "years")
            .toDate();
          return g.jsx(
            Ya,
            {
              size: V,
              yearsListFormat: l,
              decade: $,
              withNext: _ === N - 1,
              withPrevious: _ === 0,
              decadeLabelFormat: B,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (O, I) =>
                vp({
                  levelIndex: _,
                  rowIndex: I.rowIndex,
                  cellIndex: I.cellIndex,
                  event: O,
                  controlsRef: P,
                }),
              __getControlRef: (O, I, q) => {
                Array.isArray(P.current[_]) || (P.current[_] = []),
                  Array.isArray(P.current[_][O]) || (P.current[_][O] = []),
                  (P.current[_][O][I] = q);
              },
              levelControlAriaLabel: typeof M == "function" ? M($) : M,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: f,
              __stopPropagation: L,
              nextIcon: p,
              previousIcon: m,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: w,
              nextDisabled: y,
              previousDisabled: b,
              getYearControlProps: a,
              __staticSelector: D || "DecadeLevelGroup",
              classNames: E,
              styles: C,
              unstyled: R,
              withCellSpacing: d,
            },
            _
          );
        });
    return g.jsx(kr, {
      classNames: E,
      styles: C,
      __staticSelector: D || "DecadeLevelGroup",
      ref: t,
      size: V,
      unstyled: R,
      ...j,
      children: T,
    });
  });
Ga.classes = { ...kr.classes, ...Ya.classes };
Ga.displayName = "@mantine/dates/DecadeLevelGroup";
const wT = { numberOfColumns: 1 },
  Xa = G((e, t) => {
    const n = W("YearLevelGroup", wT, e),
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
        nextIcon: p,
        previousIcon: m,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: w,
        onLevelClick: y,
        nextDisabled: b,
        previousDisabled: E,
        hasNextLevel: C,
        classNames: R,
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
      k = x.useRef([]),
      _ = Array(B)
        .fill(0)
        .map(($, O) => {
          const I = J(r).add(O, "years").toDate();
          return g.jsx(
            qa,
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
              __onControlKeyDown: (q, Q) =>
                vp({
                  levelIndex: O,
                  rowIndex: Q.rowIndex,
                  cellIndex: Q.cellIndex,
                  event: q,
                  controlsRef: k,
                }),
              __getControlRef: (q, Q, ee) => {
                Array.isArray(k.current[O]) || (k.current[O] = []),
                  Array.isArray(k.current[O][q]) || (k.current[O][q] = []),
                  (k.current[O][q][Q] = ee);
              },
              levelControlAriaLabel: typeof V == "function" ? V(I) : V,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: f,
              nextIcon: p,
              previousIcon: m,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: w,
              onLevelClick: y,
              nextDisabled: b,
              previousDisabled: E,
              hasNextLevel: C,
              getMonthControlProps: a,
              classNames: R,
              styles: D,
              unstyled: L,
              __staticSelector: N || "YearLevelGroup",
              withCellSpacing: d,
            },
            O
          );
        });
    return g.jsx(kr, {
      classNames: R,
      styles: D,
      __staticSelector: N || "YearLevelGroup",
      ref: t,
      size: j,
      unstyled: L,
      ...T,
      children: _,
    });
  });
Xa.classes = { ...qa.classes, ...kr.classes };
Xa.displayName = "@mantine/dates/YearLevelGroup";
const xT = { numberOfColumns: 1 },
  Qa = G((e, t) => {
    const n = W("MonthLevelGroup", xT, e),
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
        hideOutsideDates: p,
        hideWeekdays: m,
        getDayAriaLabel: h,
        __onDayClick: S,
        __onDayMouseEnter: v,
        withCellSpacing: w,
        __preventFocus: y,
        nextIcon: b,
        previousIcon: E,
        nextLabel: C,
        previousLabel: R,
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
        levelControlAriaLabel: k,
        monthLabelFormat: _,
        __staticSelector: $,
        __stopPropagation: O,
        size: I,
        static: q,
        vars: Q,
        ...ee
      } = n,
      ne = x.useRef([]),
      te = Array(T)
        .fill(0)
        .map((me, oe) => {
          const le = J(r).add(oe, "months").toDate();
          return g.jsx(
            Ka,
            {
              month: le,
              withNext: oe === T - 1,
              withPrevious: oe === 0,
              monthLabelFormat: _,
              __stopPropagation: O,
              __onDayClick: S,
              __onDayMouseEnter: v,
              __onDayKeyDown: (Z, he) =>
                vp({
                  levelIndex: oe,
                  rowIndex: he.rowIndex,
                  cellIndex: he.cellIndex,
                  event: Z,
                  controlsRef: ne,
                }),
              __getDayRef: (Z, he, ae) => {
                Array.isArray(ne.current[oe]) || (ne.current[oe] = []),
                  Array.isArray(ne.current[oe][Z]) || (ne.current[oe][Z] = []),
                  (ne.current[oe][Z][he] = ae);
              },
              levelControlAriaLabel: typeof k == "function" ? k(le) : k,
              locale: o,
              firstDayOfWeek: s,
              weekdayFormat: i,
              weekendDays: l,
              getDayProps: a,
              excludeDate: c,
              minDate: u,
              maxDate: d,
              renderDay: f,
              hideOutsideDates: p,
              hideWeekdays: m,
              getDayAriaLabel: h,
              __preventFocus: y,
              nextIcon: b,
              previousIcon: E,
              nextLabel: C,
              previousLabel: R,
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
              static: q,
              withCellSpacing: w,
            },
            oe
          );
        });
    return g.jsx(kr, {
      classNames: A,
      styles: j,
      __staticSelector: $ || "MonthLevelGroup",
      ref: t,
      size: I,
      ...ee,
      children: te,
    });
  });
Qa.classes = { ...kr.classes, ...Ka.classes };
Qa.displayName = "@mantine/dates/MonthLevelGroup";
const Zh = (e) => (e === "range" ? [null, null] : e === "multiple" ? [] : null);
function Xw({
  type: e,
  value: t,
  defaultValue: n,
  onChange: r,
  applyTimezone: o = !0,
}) {
  const s = x.useRef(e),
    i = pn(),
    [l, a, c] = sn({
      value: Mo("add", t, i.getTimezone(), !o),
      defaultValue: Mo("add", n, i.getTimezone(), !o),
      finalValue: Zh(e),
      onChange: (d) => {
        r == null || r(Mo("remove", d, i.getTimezone(), !o));
      },
    });
  let u = l;
  return (
    s.current !== e &&
      ((s.current = e), t === void 0 && ((u = n !== void 0 ? n : Zh(e)), a(u))),
    [u, a, c]
  );
}
function Kc(e, t) {
  return e ? (e === "month" ? 0 : e === "year" ? 1 : 2) : t || 0;
}
function ST(e) {
  return e === 0 ? "month" : e === 1 ? "year" : "decade";
}
function ks(e, t, n) {
  return ST(Kb(Kc(e, 0), Kc(t, 0), Kc(n, 2)));
}
const bT = {
    maxLevel: "decade",
    minLevel: "month",
    __updateDateOnYearSelect: !0,
    __updateDateOnMonthSelect: !0,
  },
  Ja = G((e, t) => {
    const n = W("Calendar", bT, e),
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
        columnsToScroll: p,
        ariaLabels: m,
        onYearSelect: h,
        onMonthSelect: S,
        onYearMouseEnter: v,
        onMonthMouseEnter: w,
        __updateDateOnYearSelect: y,
        __updateDateOnMonthSelect: b,
        firstDayOfWeek: E,
        weekdayFormat: C,
        weekendDays: R,
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
        __onDayMouseEnter: k,
        withCellSpacing: _,
        monthsListFormat: $,
        getMonthControlProps: O,
        yearLabelFormat: I,
        yearsListFormat: q,
        getYearControlProps: Q,
        decadeLabelFormat: ee,
        classNames: ne,
        styles: te,
        unstyled: me,
        minDate: oe,
        maxDate: le,
        locale: Z,
        __staticSelector: he,
        size: ae,
        __preventFocus: se,
        __stopPropagation: ke,
        onNextDecade: Ie,
        onPreviousDecade: ve,
        onNextYear: Ke,
        onPreviousYear: Re,
        onNextMonth: $e,
        onPreviousMonth: U,
        static: re,
        __timezoneApplied: ie,
        ...xe
      } = n,
      { resolvedClassNames: Le, resolvedStyles: ht } = so({
        classNames: ne,
        styles: te,
        props: n,
      }),
      [Se, Ae] = sn({
        value: l ? ks(l, s, o) : void 0,
        defaultValue: i ? ks(i, s, o) : void 0,
        finalValue: ks(void 0, s, o),
        onChange: a,
      }),
      [It, Ue] = Xw({
        type: "default",
        value: c,
        defaultValue: u,
        onChange: d,
        applyTimezone: !ie,
      }),
      gt = {
        __staticSelector: he || "Calendar",
        styles: ht,
        classNames: Le,
        unstyled: me,
        size: ae,
      },
      Pn = pn(),
      Ge = p || f || 1,
      lt = It || Mo("add", new Date(), Pn.getTimezone()),
      fs = () => {
        const Ce = J(lt).add(Ge, "month").toDate();
        $e == null || $e(Ce), Ue(Ce);
      },
      yt = () => {
        const Ce = J(lt).subtract(Ge, "month").toDate();
        U == null || U(Ce), Ue(Ce);
      },
      Tn = () => {
        const Ce = J(lt).add(Ge, "year").toDate();
        Ke == null || Ke(Ce), Ue(Ce);
      },
      lo = () => {
        const Ce = J(lt).subtract(Ge, "year").toDate();
        Re == null || Re(Ce), Ue(Ce);
      },
      ao = () => {
        const Ce = J(lt)
          .add(10 * Ge, "year")
          .toDate();
        Ie == null || Ie(Ce), Ue(Ce);
      },
      hn = () => {
        const Ce = J(lt)
          .subtract(10 * Ge, "year")
          .toDate();
        ve == null || ve(Ce), Ue(Ce);
      };
    return g.jsxs(X, {
      ref: t,
      size: ae,
      "data-calendar": !0,
      ...xe,
      children: [
        Se === "month" &&
          g.jsx(Qa, {
            month: lt,
            minDate: oe,
            maxDate: le,
            firstDayOfWeek: E,
            weekdayFormat: C,
            weekendDays: R,
            getDayProps: D,
            excludeDate: L,
            renderDay: N,
            hideOutsideDates: M,
            hideWeekdays: B,
            getDayAriaLabel: V,
            onNext: fs,
            onPrevious: yt,
            hasNextLevel: o !== "month",
            onLevelClick: () => Ae("year"),
            numberOfColumns: f,
            locale: Z,
            levelControlAriaLabel: m == null ? void 0 : m.monthLevelControl,
            nextLabel: m == null ? void 0 : m.nextMonth,
            nextIcon: j,
            previousLabel: m == null ? void 0 : m.previousMonth,
            previousIcon: P,
            monthLabelFormat: A,
            __onDayClick: T,
            __onDayMouseEnter: k,
            __preventFocus: se,
            __stopPropagation: ke,
            static: re,
            withCellSpacing: _,
            ...gt,
          }),
        Se === "year" &&
          g.jsx(Xa, {
            year: lt,
            numberOfColumns: f,
            minDate: oe,
            maxDate: le,
            monthsListFormat: $,
            getMonthControlProps: O,
            locale: Z,
            onNext: Tn,
            onPrevious: lo,
            hasNextLevel: o !== "month" && o !== "year",
            onLevelClick: () => Ae("decade"),
            levelControlAriaLabel: m == null ? void 0 : m.yearLevelControl,
            nextLabel: m == null ? void 0 : m.nextYear,
            nextIcon: j,
            previousLabel: m == null ? void 0 : m.previousYear,
            previousIcon: P,
            yearLabelFormat: I,
            __onControlMouseEnter: w,
            __onControlClick: (Ce, Tt) => {
              b && Ue(Tt), Ae(ks("month", s, o)), S == null || S(Tt);
            },
            __preventFocus: se,
            __stopPropagation: ke,
            withCellSpacing: _,
            ...gt,
          }),
        Se === "decade" &&
          g.jsx(Ga, {
            decade: lt,
            minDate: oe,
            maxDate: le,
            yearsListFormat: q,
            getYearControlProps: Q,
            locale: Z,
            onNext: ao,
            onPrevious: hn,
            numberOfColumns: f,
            nextLabel: m == null ? void 0 : m.nextDecade,
            nextIcon: j,
            previousLabel: m == null ? void 0 : m.previousDecade,
            previousIcon: P,
            decadeLabelFormat: ee,
            __onControlMouseEnter: v,
            __onControlClick: (Ce, Tt) => {
              y && Ue(Tt), Ae(ks("year", s, o)), h == null || h(Tt);
            },
            __preventFocus: se,
            __stopPropagation: ke,
            withCellSpacing: _,
            ...gt,
          }),
      ],
    });
  });
Ja.classes = { ...Ga.classes, ...Xa.classes, ...Qa.classes };
Ja.displayName = "@mantine/dates/Calendar";
function eg(e, t) {
  const n = [...t].sort((r, o) => r.getTime() - o.getTime());
  return (
    J(n[0]).startOf("day").subtract(1, "ms").isBefore(e) &&
    J(n[1]).endOf("day").add(1, "ms").isAfter(e)
  );
}
function CT({
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
  const [c, u] = Xw({
      type: e,
      value: n,
      defaultValue: r,
      onChange: o,
      applyTimezone: a,
    }),
    [d, f] = x.useState(e === "range" && c[0] && !c[1] ? c[0] : null),
    [p, m] = x.useState(null),
    h = (C) => {
      if (e === "range") {
        if (d instanceof Date && !c[1]) {
          if (J(C).isSame(d, t) && !s) {
            f(null), m(null), u([null, null]);
            return;
          }
          const R = [C, d];
          R.sort((D, L) => D.getTime() - L.getTime()), u(R), m(null), f(null);
          return;
        }
        if (c[0] && !c[1] && J(C).isSame(c[0], t) && !s) {
          f(null), m(null), u([null, null]);
          return;
        }
        u([C, null]), m(null), f(C);
        return;
      }
      if (e === "multiple") {
        c.some((R) => J(R).isSame(C, t))
          ? u(c.filter((R) => !J(R).isSame(C, t)))
          : u([...c, C]);
        return;
      }
      c && i && J(C).isSame(c, t) ? u(null) : u(C);
    },
    S = (C) =>
      d instanceof Date && p instanceof Date
        ? eg(C, [p, d])
        : c[0] instanceof Date && c[1] instanceof Date
        ? eg(C, c)
        : !1,
    v =
      e === "range"
        ? (C) => {
            l == null || l(C), m(null);
          }
        : l,
    w = (C) =>
      c[0] instanceof Date && J(C).isSame(c[0], t)
        ? !(p && J(p).isBefore(c[0]))
        : !1,
    y = (C) =>
      c[1] instanceof Date
        ? J(C).isSame(c[1], t)
        : !(c[0] instanceof Date) || !p
        ? !1
        : J(p).isBefore(c[0]) && J(C).isSame(c[0], t),
    b = (C) => {
      if (e === "range")
        return {
          selected: c.some((D) => D && J(D).isSame(C, t)),
          inRange: S(C),
          firstInRange: w(C),
          lastInRange: y(C),
          "data-autofocus": (!!c[0] && J(c[0]).isSame(C, t)) || void 0,
        };
      if (e === "multiple")
        return {
          selected: c.some((D) => D && J(D).isSame(C, t)),
          "data-autofocus": (!!c[0] && J(c[0]).isSame(C, t)) || void 0,
        };
      const R = J(c).isSame(C, t);
      return { selected: R, "data-autofocus": R || void 0 };
    },
    E = e === "range" && d ? m : () => {};
  return (
    x.useEffect(() => {
      e === "range" && !c[0] && !c[1] && f(null);
    }, [n]),
    {
      onDateChange: h,
      onRootMouseLeave: v,
      onHoveredDateChange: E,
      getControlProps: b,
      _value: c,
      setValue: u,
    }
  );
}
const ET = { type: "default", defaultLevel: "month", numberOfColumns: 1 },
  Sp = G((e, t) => {
    const n = W("DatePicker", ET, e),
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
        allowDeselect: p,
        onMouseLeave: m,
        numberOfColumns: h,
        hideOutsideDates: S,
        __onDayMouseEnter: v,
        __onDayClick: w,
        __timezoneApplied: y,
        ...b
      } = n,
      {
        onDateChange: E,
        onRootMouseLeave: C,
        onHoveredDateChange: R,
        getControlProps: D,
      } = CT({
        type: i,
        level: "day",
        allowDeselect: p,
        allowSingleDateInRange: f,
        value: a,
        defaultValue: l,
        onChange: c,
        onMouseLeave: m,
        applyTimezone: !y,
      }),
      { resolvedClassNames: L, resolvedStyles: N } = so({
        classNames: r,
        styles: o,
        props: n,
      }),
      M = pn();
    return g.jsx(Ja, {
      ref: t,
      minLevel: "month",
      classNames: L,
      styles: N,
      __staticSelector: u || "DatePicker",
      onMouseLeave: C,
      numberOfColumns: h,
      hideOutsideDates: S ?? h !== 1,
      __onDayMouseEnter: (B, V) => {
        R(V), v == null || v(B, V);
      },
      __onDayClick: (B, V) => {
        E(V), w == null || w(B, V);
      },
      getDayProps: (B) => ({ ...D(B), ...(d == null ? void 0 : d(B)) }),
      ...b,
      date: Mo("add", b.date, M.getTimezone(), y),
      __timezoneApplied: !0,
    });
  });
Sp.classes = Ja.classes;
Sp.displayName = "@mantine/dates/DatePicker";
const bp = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = o.map((u) => u.option),
    [l, a] = x.useState(o.at(0));
  x.useEffect(() => {
    r.setFieldValue(s, l);
  }, []);
  const c = (u) => {
    a(u.value), r.setFieldValue(s, u.value);
  };
  return g.jsx(up, {
    label: t,
    description: n,
    data: i,
    defaultValue: i.at(0),
    onChange: (u, d) => c(d),
    searchable: !0,
  });
};
bp.defaultProps = {};
bp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  options: Y.array,
};
const Cp = (e) => {
  const {
      title: t,
      description: n,
      form: r,
      options: o,
      field_id: s,
      mandatory: i,
    } = e,
    l = new Date(),
    a = new Date();
  a.setDate(a.getDate() + 1);
  const c = new Date();
  c.setFullYear(l.getFullYear() + 1);
  const u = new Date();
  u.setFullYear(l.getFullYear() + 2);
  const [d, f] = x.useState(c),
    [p, m] = x.useState(d),
    [h, { open: S, close: v }] = si(!1);
  x.useEffect(() => {
    localStorage.setItem("embargo", d.toISOString().split("T")[0]);
  }, [d]);
  const w = () =>
      g.jsx(rr, {
        children: g.jsxs(xn, {
          onClick: S,
          variant: "default",
          className: "link-style",
          children: [
            g.jsx("i", { className: "icon ion-md-calendar align-top mr-2" }),
            "Change embargo date",
          ],
        }),
      }),
    y = (E) => {
      const C = new Date(l);
      C.setMonth(l.getMonth() + E), f(C);
    },
    b = () =>
      d.getDate().toString() +
      " " +
      d.toLocaleString("default", { month: "long" }) +
      " " +
      d.getFullYear().toString();
  return g.jsxs("div", {
    children: [
      g.jsxs("header", {
        className: "",
        children: [
          g.jsxs("h2", {
            className: "",
            children: [
              t,
              " ",
              i &&
                g.jsx("span", {
                  class:
                    "mantine-InputWrapper-required mantine-TextInput-required",
                  children: "*",
                }),
            ],
          }),
          g.jsx("h4", { children: b() }),
          w(),
        ],
      }),
      g.jsxs(fn, {
        opened: h,
        onClose: v,
        title: "Select embargo date",
        centered: !0,
        children: [
          g.jsx(rr, {
            justify: "center",
            children: g.jsxs("p", {
              className: "my-3",
              children: ["New Embargo: ", g.jsx("b", { children: b() })],
            }),
          }),
          g.jsxs(rr, {
            justify: "center",
            children: [
              g.jsx(xn, {
                className: "button-inverted blue-button",
                variant: "default",
                onClick: () => {
                  y(6);
                },
                children: "6 months",
              }),
              g.jsx(xn, {
                className: "button-inverted blue-button",
                variant: "default",
                onClick: () => {
                  y(12);
                },
                children: "12 months",
              }),
              g.jsx(xn, {
                className: "button-inverted blue-button",
                variant: "default",
                onClick: () => {
                  y(18);
                },
                children: "18 months",
              }),
            ],
          }),
          g.jsx(rr, {
            className: "pt-3 pb-5",
            justify: "center",
            children: g.jsx(Sp, {
              defaultDate: c,
              minDate: a,
              maxDate: u,
              value: d,
              onChange: f,
            }),
          }),
          g.jsxs(rr, {
            justify: "center",
            children: [
              g.jsx(xn, {
                className: "button-inverted green-button",
                variant: "default",
                onClick: () => {
                  m(d), v();
                },
                children: "Accept",
              }),
              g.jsx(xn, {
                className: "button-inverted red-button",
                variant: "default",
                onClick: () => {
                  f(p), v();
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
Cp.defaultProps = {};
Cp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  options: Y.array,
};
const Qw = "",
  _T = "generic",
  kT = Qw + "/profile/profile/",
  Jw = Qw + "/api/submissions/",
  RT = "https://helpdesk.gfbio.org/browse/",
  DT = (e) => {
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
              g.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: g.jsxs("a", {
                    children: [
                      g.jsx("i", {
                        className: "fa fa-bookmark-o pr-2",
                        "aria-hidden": "true",
                      }),
                      "Submission Id: ",
                      g.jsx("br", {}),
                      g.jsx("div", { className: "data-field", children: a }),
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
              g.jsxs("div", {
                className: "info-box-header",
                children: [
                  g.jsx("i", {
                    className: "fa fa-archive pr-2",
                    "aria-hidden": "true",
                  }),
                  "ENA Accession:",
                  g.jsx("br", {}),
                ],
              })
            ),
            l.accessionId.forEach((f) => {
              c.push(
                g.jsx(
                  "li",
                  {
                    className: "list-group-item",
                    children: g.jsxs("div", {
                      className: "data-field",
                      children: [
                        g.jsxs("div", {
                          className: "",
                          children: [
                            g.jsx("span", {
                              style: { fontWeight: 600 },
                              children: "ID",
                            }),
                            ": ",
                            f.pid,
                          ],
                        }),
                        g.jsxs("div", {
                          className: "",
                          style: { marginTop: 0 },
                          children: [
                            g.jsx("span", {
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
              g.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: g.jsxs("a", {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "external",
                    href: RT + l.issue,
                    children: [
                      g.jsx("i", {
                        className: "fa fa-tags pr-2",
                        "aria-hidden": "true",
                      }),
                      "Ticket:",
                      g.jsx("br", {}),
                      g.jsx("div", {
                        className: "data-field",
                        children: l.issue,
                      }),
                    ],
                  }),
                },
                u
              )
            ),
            u++),
          l.readOnly &&
            (c.push(
              g.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: g.jsxs("a", {
                    children: [
                      g.jsx("i", {
                        className: "fa fa-info-circle pr-2",
                        "aria-hidden": "true",
                      }),
                      "Status: ",
                      g.jsx("br", {}),
                      g.jsx("div", {
                        className: "data-field",
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
            g.jsx(
              "li",
              {
                className: "list-group-item",
                children: g.jsxs("a", {
                  href: d,
                  className: "external",
                  children: [
                    g.jsx("i", {
                      className: "fa fa-comments pr-2",
                      "aria-hidden": "true",
                    }),
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
    return g.jsxs("div", {
      className: "info-box",
      children: [
        g.jsxs("header", {
          className: "",
          children: [
            g.jsx("h2", { className: "ommit-optional", children: t }),
            g.jsx("p", { className: "" }),
          ],
        }),
        g.jsx("div", {
          className: "",
          children: g.jsx("ul", {
            className: "list-group list-group-flush",
            children: i(),
          }),
        }),
      ],
    });
  },
  PT = () => {
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
    return g.jsxs("div", {
      children: [
        g.jsxs("h4", {
          children: [
            "Metadata Templates",
            " ",
            g.jsxs(zr, {
              width: 320,
              shadow: "md",
              position: "right",
              withArrow: !0,
              children: [
                g.jsx(zr.Target, {
                  children: g.jsx("i", {
                    className: "fa fa-question-circle-o",
                    "aria-hidden": "true",
                  }),
                }),
                g.jsx(zr.Dropdown, {
                  children: g.jsx("p", {
                    children:
                      "Metadata templates are provided to help you structure your data submission. Using a metadata template is optional, but highly recommended. You can modify the existing templates to your needs.",
                  }),
                }),
              ],
            }),
          ],
        }),
        g.jsx("ul", {
          className: "list-group list-group-flush",
          children: e.map((t) =>
            g.jsxs(
              "li",
              {
                className: "list-group-item",
                children: [
                  t.name,
                  g.jsx("br", {}),
                  g.jsxs("a", {
                    href: t.template_link,
                    target: "_blank",
                    children: [
                      g.jsx("i", {
                        className: "fa fa-download",
                        "aria-hidden": "true",
                      }),
                      " CSV Template",
                    ],
                  }),
                  g.jsx("br", {}),
                  g.jsxs("a", {
                    href: t.description_link,
                    target: "_blank",
                    children: [
                      g.jsx("i", {
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
  Ep = (e) => {
    const {
      title: t,
      description: n,
      form: r,
      options: o,
      field_id: s,
      default_value: i,
    } = e;
    x.useEffect(() => {
      const a = i ? i.split(",") : [];
      r.setFieldValue(s, a);
    }, []);
    const l = o.map((a) => a.option);
    return g.jsx("div", {
      children: g.jsx(
        ci.Group,
        {
          label: t,
          description: n,
          ...r.getInputProps(s),
          children: l.map(function (a) {
            return g.jsx(ci, { value: a, label: a });
          }),
        },
        r.key(s)
      ),
    });
  };
Ep.defaultProps = { default_value: "" };
Ep.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
  default_value: Y.string,
};
const _p = (e) => {
  const {
      title: t,
      description: n,
      form: r,
      options: o,
      field_id: s,
      default_value: i,
    } = e,
    l = i ? i.split(",") : [];
  x.useEffect(() => {
    r.setFieldValue(s, l);
  }, []);
  const a = (u) => {
      r.setFieldValue(s, u);
    },
    c = o.map((u) => ({ label: u.option, value: u.option }));
  return g.jsx("div", {
    children: g.jsx(cp, {
      defaultValue: l,
      data: c,
      label: t,
      description: n,
      placeholder: "Select all matching",
      onChange: (u) => {
        a(u);
      },
    }),
  });
};
_p.defaultProps = { default_value: "" };
_p.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
  default_value: Y.string,
};
const kp = (e) => {
  const {
    title: t,
    description: n,
    mandatory: r,
    form: o,
    field_id: s,
    placeholder: i,
  } = e;
  return g.jsx(
    dp,
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
kp.defaultProps = { placeholder: "" };
kp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  mandatory: Y.bool.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const Rp = (e) => {
  const {
    title: t,
    description: n,
    form: r,
    field_id: o,
    placeholder: s,
    mandatory: i,
  } = e;
  return g.jsx(
    op,
    {
      label: t,
      description: n,
      placeholder: s,
      autosize: !0,
      resize: "vertical",
      minRows: 2,
      required: i,
      ...r.getInputProps(o),
    },
    r.key(o)
  );
};
Rp.defaultProps = { placeholder: "" };
Rp.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const Bs = (e) => {
  const {
    title: t,
    description: n,
    mandatory: r,
    form: o,
    field_id: s,
    placeholder: i,
  } = e;
  return g.jsx(
    fp,
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
Bs.defaultProps = { placeholder: "" };
Bs.propTypes = {
  title: Y.string.isRequired,
  description: Y.string.isRequired,
  mandatory: Y.bool.isRequired,
  form: Y.object.isRequired,
  field_id: Y.string.isRequired,
  placeholder: Y.string,
};
const ld = ({ field: e, form: t }) => {
  const n = {
    title: e.title,
    description: e.description,
    default_value: e.default,
    mandatory: e.mandatory,
    options: e.options,
    field_id: e.field_id,
    placeholder: e.placeholder,
    form: t,
  };
  switch (e.field_type.type) {
    case "text-field":
      return g.jsx(Bs, { ...n });
    case "text-area":
      return g.jsx(Rp, { ...n });
    case "select-field":
      return g.jsx(bp, { ...n });
    case "file-upload":
      return g.jsx(yp, { ...n });
    case "collapsible-selector":
      return g.jsx(pp, { ...n });
    case "metadata-template":
      return g.jsx(PT, { ...n });
    case "info-box":
      return g.jsx(DT, { ...n });
    case "multiselect-checkboxes":
      return g.jsx(Ep, { ...n });
    case "multiselect-dropdown":
      return g.jsx(_p, { ...n });
    case "embargo-date-picker":
      return g.jsx(Cp, { ...n });
    case "data-url-field":
      return g.jsx(Bs, { ...n });
    case "tags-input":
      return g.jsx(kp, { ...n });
    default:
      return g.jsx(Bs, { ...n });
  }
};
ld.propTypes = { field: Y.object.isRequired, form: Y.object.isRequired };
function Zw(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: TT } = Object.prototype,
  { getPrototypeOf: Dp } = Object,
  Za = ((e) => (t) => {
    const n = TT.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  mn = (e) => ((e = e.toLowerCase()), (t) => Za(t) === e),
  ec = (e) => (t) => typeof t === e,
  { isArray: us } = Array,
  di = ec("undefined");
function NT(e) {
  return (
    e !== null &&
    !di(e) &&
    e.constructor !== null &&
    !di(e.constructor) &&
    Wt(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const e1 = mn("ArrayBuffer");
function OT(e) {
  let t;
  return (
    typeof ArrayBuffer < "u" && ArrayBuffer.isView
      ? (t = ArrayBuffer.isView(e))
      : (t = e && e.buffer && e1(e.buffer)),
    t
  );
}
const jT = ec("string"),
  Wt = ec("function"),
  t1 = ec("number"),
  tc = (e) => e !== null && typeof e == "object",
  $T = (e) => e === !0 || e === !1,
  gl = (e) => {
    if (Za(e) !== "object") return !1;
    const t = Dp(e);
    return (
      (t === null ||
        t === Object.prototype ||
        Object.getPrototypeOf(t) === null) &&
      !(Symbol.toStringTag in e) &&
      !(Symbol.iterator in e)
    );
  },
  LT = mn("Date"),
  AT = mn("File"),
  FT = mn("Blob"),
  MT = mn("FileList"),
  IT = (e) => tc(e) && Wt(e.pipe),
  zT = (e) => {
    let t;
    return (
      e &&
      ((typeof FormData == "function" && e instanceof FormData) ||
        (Wt(e.append) &&
          ((t = Za(e)) === "formdata" ||
            (t === "object" &&
              Wt(e.toString) &&
              e.toString() === "[object FormData]"))))
    );
  },
  BT = mn("URLSearchParams"),
  [VT, HT, WT, UT] = ["ReadableStream", "Request", "Response", "Headers"].map(
    mn
  ),
  YT = (e) =>
    e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Ci(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u") return;
  let r, o;
  if ((typeof e != "object" && (e = [e]), us(e)))
    for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);
  else {
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      i = s.length;
    let l;
    for (r = 0; r < i; r++) (l = s[r]), t.call(null, e[l], l, e);
  }
}
function n1(e, t) {
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    o;
  for (; r-- > 0; ) if (((o = n[r]), t === o.toLowerCase())) return o;
  return null;
}
const r1 =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
      ? self
      : typeof window < "u"
      ? window
      : global,
  o1 = (e) => !di(e) && e !== r1;
function ad() {
  const { caseless: e } = (o1(this) && this) || {},
    t = {},
    n = (r, o) => {
      const s = (e && n1(t, o)) || o;
      gl(t[s]) && gl(r)
        ? (t[s] = ad(t[s], r))
        : gl(r)
        ? (t[s] = ad({}, r))
        : us(r)
        ? (t[s] = r.slice())
        : (t[s] = r);
    };
  for (let r = 0, o = arguments.length; r < o; r++)
    arguments[r] && Ci(arguments[r], n);
  return t;
}
const qT = (e, t, n, { allOwnKeys: r } = {}) => (
    Ci(
      t,
      (o, s) => {
        n && Wt(o) ? (e[s] = Zw(o, n)) : (e[s] = o);
      },
      { allOwnKeys: r }
    ),
    e
  ),
  KT = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  GT = (e, t, n, r) => {
    (e.prototype = Object.create(t.prototype, r)),
      (e.prototype.constructor = e),
      Object.defineProperty(e, "super", { value: t.prototype }),
      n && Object.assign(e.prototype, n);
  },
  XT = (e, t, n, r) => {
    let o, s, i;
    const l = {};
    if (((t = t || {}), e == null)) return t;
    do {
      for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
        (i = o[s]), (!r || r(i, e, t)) && !l[i] && ((t[i] = e[i]), (l[i] = !0));
      e = n !== !1 && Dp(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  QT = (e, t, n) => {
    (e = String(e)),
      (n === void 0 || n > e.length) && (n = e.length),
      (n -= t.length);
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  JT = (e) => {
    if (!e) return null;
    if (us(e)) return e;
    let t = e.length;
    if (!t1(t)) return null;
    const n = new Array(t);
    for (; t-- > 0; ) n[t] = e[t];
    return n;
  },
  ZT = (
    (e) => (t) =>
      e && t instanceof e
  )(typeof Uint8Array < "u" && Dp(Uint8Array)),
  eN = (e, t) => {
    const r = (e && e[Symbol.iterator]).call(e);
    let o;
    for (; (o = r.next()) && !o.done; ) {
      const s = o.value;
      t.call(e, s[0], s[1]);
    }
  },
  tN = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null; ) r.push(n);
    return r;
  },
  nN = mn("HTMLFormElement"),
  rN = (e) =>
    e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, o) {
      return r.toUpperCase() + o;
    }),
  tg = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  oN = mn("RegExp"),
  s1 = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    Ci(n, (o, s) => {
      let i;
      (i = t(o, s, e)) !== !1 && (r[s] = i || o);
    }),
      Object.defineProperties(e, r);
  },
  sN = (e) => {
    s1(e, (t, n) => {
      if (Wt(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1)
        return !1;
      const r = e[n];
      if (Wt(r)) {
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
  iN = (e, t) => {
    const n = {},
      r = (o) => {
        o.forEach((s) => {
          n[s] = !0;
        });
      };
    return us(e) ? r(e) : r(String(e).split(t)), n;
  },
  lN = () => {},
  aN = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t),
  Gc = "abcdefghijklmnopqrstuvwxyz",
  ng = "0123456789",
  i1 = { DIGIT: ng, ALPHA: Gc, ALPHA_DIGIT: Gc + Gc.toUpperCase() + ng },
  cN = (e = 16, t = i1.ALPHA_DIGIT) => {
    let n = "";
    const { length: r } = t;
    for (; e--; ) n += t[(Math.random() * r) | 0];
    return n;
  };
function uN(e) {
  return !!(
    e &&
    Wt(e.append) &&
    e[Symbol.toStringTag] === "FormData" &&
    e[Symbol.iterator]
  );
}
const dN = (e) => {
    const t = new Array(10),
      n = (r, o) => {
        if (tc(r)) {
          if (t.indexOf(r) >= 0) return;
          if (!("toJSON" in r)) {
            t[o] = r;
            const s = us(r) ? [] : {};
            return (
              Ci(r, (i, l) => {
                const a = n(i, o + 1);
                !di(a) && (s[l] = a);
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
  fN = mn("AsyncFunction"),
  pN = (e) => e && (tc(e) || Wt(e)) && Wt(e.then) && Wt(e.catch),
  F = {
    isArray: us,
    isArrayBuffer: e1,
    isBuffer: NT,
    isFormData: zT,
    isArrayBufferView: OT,
    isString: jT,
    isNumber: t1,
    isBoolean: $T,
    isObject: tc,
    isPlainObject: gl,
    isReadableStream: VT,
    isRequest: HT,
    isResponse: WT,
    isHeaders: UT,
    isUndefined: di,
    isDate: LT,
    isFile: AT,
    isBlob: FT,
    isRegExp: oN,
    isFunction: Wt,
    isStream: IT,
    isURLSearchParams: BT,
    isTypedArray: ZT,
    isFileList: MT,
    forEach: Ci,
    merge: ad,
    extend: qT,
    trim: YT,
    stripBOM: KT,
    inherits: GT,
    toFlatObject: XT,
    kindOf: Za,
    kindOfTest: mn,
    endsWith: QT,
    toArray: JT,
    forEachEntry: eN,
    matchAll: tN,
    isHTMLForm: nN,
    hasOwnProperty: tg,
    hasOwnProp: tg,
    reduceDescriptors: s1,
    freezeMethods: sN,
    toObjectSet: iN,
    toCamelCase: rN,
    noop: lN,
    toFiniteNumber: aN,
    findKey: n1,
    global: r1,
    isContextDefined: o1,
    ALPHABET: i1,
    generateString: cN,
    isSpecCompliantForm: uN,
    toJSONObject: dN,
    isAsyncFn: fN,
    isThenable: pN,
  };
function ce(e, t, n, r, o) {
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
F.inherits(ce, Error, {
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
const l1 = ce.prototype,
  a1 = {};
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
  a1[e] = { value: e };
});
Object.defineProperties(ce, a1);
Object.defineProperty(l1, "isAxiosError", { value: !0 });
ce.from = (e, t, n, r, o, s) => {
  const i = Object.create(l1);
  return (
    F.toFlatObject(
      e,
      i,
      function (a) {
        return a !== Error.prototype;
      },
      (l) => l !== "isAxiosError"
    ),
    ce.call(i, e.message, t, n, r, o),
    (i.cause = e),
    (i.name = e.name),
    s && Object.assign(i, s),
    i
  );
};
const mN = null;
function cd(e) {
  return F.isPlainObject(e) || F.isArray(e);
}
function c1(e) {
  return F.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function rg(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (o, s) {
          return (o = c1(o)), !n && s ? "[" + o + "]" : o;
        })
        .join(n ? "." : "")
    : t;
}
function hN(e) {
  return F.isArray(e) && !e.some(cd);
}
const gN = F.toFlatObject(F, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function nc(e, t, n) {
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
  function c(m) {
    if (m === null) return "";
    if (F.isDate(m)) return m.toISOString();
    if (!a && F.isBlob(m))
      throw new ce("Blob is not supported. Use a Buffer instead.");
    return F.isArrayBuffer(m) || F.isTypedArray(m)
      ? a && typeof Blob == "function"
        ? new Blob([m])
        : Buffer.from(m)
      : m;
  }
  function u(m, h, S) {
    let v = m;
    if (m && !S && typeof m == "object") {
      if (F.endsWith(h, "{}"))
        (h = r ? h : h.slice(0, -2)), (m = JSON.stringify(m));
      else if (
        (F.isArray(m) && hN(m)) ||
        ((F.isFileList(m) || F.endsWith(h, "[]")) && (v = F.toArray(m)))
      )
        return (
          (h = c1(h)),
          v.forEach(function (y, b) {
            !(F.isUndefined(y) || y === null) &&
              t.append(
                i === !0 ? rg([h], b, s) : i === null ? h : h + "[]",
                c(y)
              );
          }),
          !1
        );
    }
    return cd(m) ? !0 : (t.append(rg(S, h, s), c(m)), !1);
  }
  const d = [],
    f = Object.assign(gN, {
      defaultVisitor: u,
      convertValue: c,
      isVisitable: cd,
    });
  function p(m, h) {
    if (!F.isUndefined(m)) {
      if (d.indexOf(m) !== -1)
        throw Error("Circular reference detected in " + h.join("."));
      d.push(m),
        F.forEach(m, function (v, w) {
          (!(F.isUndefined(v) || v === null) &&
            o.call(t, v, F.isString(w) ? w.trim() : w, h, f)) === !0 &&
            p(v, h ? h.concat(w) : [w]);
        }),
        d.pop();
    }
  }
  if (!F.isObject(e)) throw new TypeError("data must be an object");
  return p(e), t;
}
function og(e) {
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
function Pp(e, t) {
  (this._pairs = []), e && nc(e, this, t);
}
const u1 = Pp.prototype;
u1.append = function (t, n) {
  this._pairs.push([t, n]);
};
u1.toString = function (t) {
  const n = t
    ? function (r) {
        return t.call(this, r, og);
      }
    : og;
  return this._pairs
    .map(function (o) {
      return n(o[0]) + "=" + n(o[1]);
    }, "")
    .join("&");
};
function yN(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}
function d1(e, t, n) {
  if (!t) return e;
  const r = (n && n.encode) || yN,
    o = n && n.serialize;
  let s;
  if (
    (o
      ? (s = o(t, n))
      : (s = F.isURLSearchParams(t) ? t.toString() : new Pp(t, n).toString(r)),
    s)
  ) {
    const i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)),
      (e += (e.indexOf("?") === -1 ? "?" : "&") + s);
  }
  return e;
}
class sg {
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
const f1 = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
  },
  vN = typeof URLSearchParams < "u" ? URLSearchParams : Pp,
  wN = typeof FormData < "u" ? FormData : null,
  xN = typeof Blob < "u" ? Blob : null,
  SN = {
    isBrowser: !0,
    classes: { URLSearchParams: vN, FormData: wN, Blob: xN },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  Tp = typeof window < "u" && typeof document < "u",
  bN = ((e) => Tp && ["ReactNative", "NativeScript", "NS"].indexOf(e) < 0)(
    typeof navigator < "u" && navigator.product
  ),
  CN =
    typeof WorkerGlobalScope < "u" &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == "function",
  EN = (Tp && window.location.href) || "http://localhost",
  _N = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: Tp,
        hasStandardBrowserEnv: bN,
        hasStandardBrowserWebWorkerEnv: CN,
        origin: EN,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  rn = { ..._N, ...SN };
function kN(e, t) {
  return nc(
    e,
    new rn.classes.URLSearchParams(),
    Object.assign(
      {
        visitor: function (n, r, o, s) {
          return rn.isNode && F.isBuffer(n)
            ? (this.append(r, n.toString("base64")), !1)
            : s.defaultVisitor.apply(this, arguments);
        },
      },
      t
    )
  );
}
function RN(e) {
  return F.matchAll(/\w+|\[(\w*)]/g, e).map((t) =>
    t[0] === "[]" ? "" : t[1] || t[0]
  );
}
function DN(e) {
  const t = {},
    n = Object.keys(e);
  let r;
  const o = n.length;
  let s;
  for (r = 0; r < o; r++) (s = n[r]), (t[s] = e[s]);
  return t;
}
function p1(e) {
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
          t(n, r, o[i], s) && F.isArray(o[i]) && (o[i] = DN(o[i])),
          !l)
    );
  }
  if (F.isFormData(e) && F.isFunction(e.entries)) {
    const n = {};
    return (
      F.forEachEntry(e, (r, o) => {
        t(RN(r), o, n, 0);
      }),
      n
    );
  }
  return null;
}
function PN(e, t, n) {
  if (F.isString(e))
    try {
      return (t || JSON.parse)(e), F.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError") throw r;
    }
  return (n || JSON.stringify)(e);
}
const Ei = {
  transitional: f1,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (t, n) {
      const r = n.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        s = F.isObject(t);
      if ((s && F.isHTMLForm(t) && (t = new FormData(t)), F.isFormData(t)))
        return o ? JSON.stringify(p1(t)) : t;
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
          return kN(t, this.formSerializer).toString();
        if ((l = F.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const a = this.env && this.env.FormData;
          return nc(
            l ? { "files[]": t } : t,
            a && new a(),
            this.formSerializer
          );
        }
      }
      return s || o ? (n.setContentType("application/json", !1), PN(t)) : t;
    },
  ],
  transformResponse: [
    function (t) {
      const n = this.transitional || Ei.transitional,
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
              ? ce.from(l, ce.ERR_BAD_RESPONSE, this, null, this.response)
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
  env: { FormData: rn.classes.FormData, Blob: rn.classes.Blob },
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
  Ei.headers[e] = {};
});
const TN = F.toObjectSet([
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
  NN = (e) => {
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
              !(!n || (t[n] && TN[n])) &&
                (n === "set-cookie"
                  ? t[n]
                    ? t[n].push(r)
                    : (t[n] = [r])
                  : (t[n] = t[n] ? t[n] + ", " + r : r));
          }),
      t
    );
  },
  ig = Symbol("internals");
function Rs(e) {
  return e && String(e).trim().toLowerCase();
}
function yl(e) {
  return e === !1 || e == null ? e : F.isArray(e) ? e.map(yl) : String(e);
}
function ON(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; (r = n.exec(e)); ) t[r[1]] = r[2];
  return t;
}
const jN = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Xc(e, t, n, r, o) {
  if (F.isFunction(r)) return r.call(this, t, n);
  if ((o && (t = n), !!F.isString(t))) {
    if (F.isString(r)) return t.indexOf(r) !== -1;
    if (F.isRegExp(r)) return r.test(t);
  }
}
function $N(e) {
  return e
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function LN(e, t) {
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
class Rt {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const o = this;
    function s(l, a, c) {
      const u = Rs(a);
      if (!u) throw new Error("header name must be a non-empty string");
      const d = F.findKey(o, u);
      (!d || o[d] === void 0 || c === !0 || (c === void 0 && o[d] !== !1)) &&
        (o[d || a] = yl(l));
    }
    const i = (l, a) => F.forEach(l, (c, u) => s(c, u, a));
    if (F.isPlainObject(t) || t instanceof this.constructor) i(t, n);
    else if (F.isString(t) && (t = t.trim()) && !jN(t)) i(NN(t), n);
    else if (F.isHeaders(t)) for (const [l, a] of t.entries()) s(a, l, r);
    else t != null && s(n, t, r);
    return this;
  }
  get(t, n) {
    if (((t = Rs(t)), t)) {
      const r = F.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n) return o;
        if (n === !0) return ON(o);
        if (F.isFunction(n)) return n.call(this, o, r);
        if (F.isRegExp(n)) return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (((t = Rs(t)), t)) {
      const r = F.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Xc(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function s(i) {
      if (((i = Rs(i)), i)) {
        const l = F.findKey(r, i);
        l && (!n || Xc(r, r[l], l, n)) && (delete r[l], (o = !0));
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
      (!t || Xc(this, this[s], s, t, !0)) && (delete this[s], (o = !0));
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
          (n[i] = yl(o)), delete n[s];
          return;
        }
        const l = t ? $N(s) : String(s).trim();
        l !== s && delete n[s], (n[l] = yl(o)), (r[l] = !0);
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
    const r = (this[ig] = this[ig] = { accessors: {} }).accessors,
      o = this.prototype;
    function s(i) {
      const l = Rs(i);
      r[l] || (LN(o, i), (r[l] = !0));
    }
    return F.isArray(t) ? t.forEach(s) : s(t), this;
  }
}
Rt.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization",
]);
F.reduceDescriptors(Rt.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    },
  };
});
F.freezeMethods(Rt);
function Qc(e, t) {
  const n = this || Ei,
    r = t || n,
    o = Rt.from(r.headers);
  let s = r.data;
  return (
    F.forEach(e, function (l) {
      s = l.call(n, s, o.normalize(), t ? t.status : void 0);
    }),
    o.normalize(),
    s
  );
}
function m1(e) {
  return !!(e && e.__CANCEL__);
}
function ds(e, t, n) {
  ce.call(this, e ?? "canceled", ce.ERR_CANCELED, t, n),
    (this.name = "CanceledError");
}
F.inherits(ds, ce, { __CANCEL__: !0 });
function h1(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status)
    ? e(n)
    : t(
        new ce(
          "Request failed with status code " + n.status,
          [ce.ERR_BAD_REQUEST, ce.ERR_BAD_RESPONSE][
            Math.floor(n.status / 100) - 4
          ],
          n.config,
          n.request,
          n
        )
      );
}
function AN(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return (t && t[1]) || "";
}
function FN(e, t) {
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
      const p = u && c - u;
      return p ? Math.round((f * 1e3) / p) : void 0;
    }
  );
}
function MN(e, t) {
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
const Jl = (e, t, n = 3) => {
    let r = 0;
    const o = FN(50, 250);
    return MN((s) => {
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
  IN = rn.hasStandardBrowserEnv
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
  zN = rn.hasStandardBrowserEnv
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
function BN(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function VN(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function g1(e, t) {
  return e && !BN(t) ? VN(e, t) : t;
}
const lg = (e) => (e instanceof Rt ? { ...e } : e);
function Jr(e, t) {
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
    headers: (c, u) => o(lg(c), lg(u), !0),
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
const y1 = (e) => {
    const t = Jr({}, e);
    let {
      data: n,
      withXSRFToken: r,
      xsrfHeaderName: o,
      xsrfCookieName: s,
      headers: i,
      auth: l,
    } = t;
    (t.headers = i = Rt.from(i)),
      (t.url = d1(g1(t.baseURL, t.url), e.params, e.paramsSerializer)),
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
      if (rn.hasStandardBrowserEnv || rn.hasStandardBrowserWebWorkerEnv)
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
      rn.hasStandardBrowserEnv &&
      (r && F.isFunction(r) && (r = r(t)), r || (r !== !1 && IN(t.url)))
    ) {
      const c = o && s && zN.read(s);
      c && i.set(o, c);
    }
    return t;
  },
  HN = typeof XMLHttpRequest < "u",
  WN =
    HN &&
    function (e) {
      return new Promise(function (n, r) {
        const o = y1(e);
        let s = o.data;
        const i = Rt.from(o.headers).normalize();
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
          const p = Rt.from(
              "getAllResponseHeaders" in u && u.getAllResponseHeaders()
            ),
            h = {
              data:
                !l || l === "text" || l === "json"
                  ? u.responseText
                  : u.response,
              status: u.status,
              statusText: u.statusText,
              headers: p,
              config: e,
              request: u,
            };
          h1(
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
              (r(new ce("Request aborted", ce.ECONNABORTED, o, u)), (u = null));
          }),
          (u.onerror = function () {
            r(new ce("Network Error", ce.ERR_NETWORK, o, u)), (u = null);
          }),
          (u.ontimeout = function () {
            let m = o.timeout
              ? "timeout of " + o.timeout + "ms exceeded"
              : "timeout exceeded";
            const h = o.transitional || f1;
            o.timeoutErrorMessage && (m = o.timeoutErrorMessage),
              r(
                new ce(
                  m,
                  h.clarifyTimeoutError ? ce.ETIMEDOUT : ce.ECONNABORTED,
                  o,
                  u
                )
              ),
              (u = null);
          }),
          s === void 0 && i.setContentType(null),
          "setRequestHeader" in u &&
            F.forEach(i.toJSON(), function (m, h) {
              u.setRequestHeader(h, m);
            }),
          F.isUndefined(o.withCredentials) ||
            (u.withCredentials = !!o.withCredentials),
          l && l !== "json" && (u.responseType = o.responseType),
          typeof o.onDownloadProgress == "function" &&
            u.addEventListener("progress", Jl(o.onDownloadProgress, !0)),
          typeof o.onUploadProgress == "function" &&
            u.upload &&
            u.upload.addEventListener("progress", Jl(o.onUploadProgress)),
          (o.cancelToken || o.signal) &&
            ((a = (p) => {
              u &&
                (r(!p || p.type ? new ds(null, e, u) : p),
                u.abort(),
                (u = null));
            }),
            o.cancelToken && o.cancelToken.subscribe(a),
            o.signal &&
              (o.signal.aborted ? a() : o.signal.addEventListener("abort", a)));
        const f = AN(o.url);
        if (f && rn.protocols.indexOf(f) === -1) {
          r(new ce("Unsupported protocol " + f + ":", ce.ERR_BAD_REQUEST, e));
          return;
        }
        u.send(s || null);
      });
    },
  UN = (e, t) => {
    let n = new AbortController(),
      r;
    const o = function (a) {
      if (!r) {
        (r = !0), i();
        const c = a instanceof Error ? a : this.reason;
        n.abort(
          c instanceof ce ? c : new ds(c instanceof Error ? c.message : c)
        );
      }
    };
    let s =
      t &&
      setTimeout(() => {
        o(new ce(`timeout ${t} of ms exceeded`, ce.ETIMEDOUT));
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
  YN = function* (e, t) {
    let n = e.byteLength;
    if (!t || n < t) {
      yield e;
      return;
    }
    let r = 0,
      o;
    for (; r < n; ) (o = r + t), yield e.slice(r, o), (r = o);
  },
  qN = async function* (e, t, n) {
    for await (const r of e)
      yield* YN(ArrayBuffer.isView(r) ? r : await n(String(r)), t);
  },
  ag = (e, t, n, r, o) => {
    const s = qN(e, t, o);
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
  cg = (e, t) => {
    const n = e != null;
    return (r) =>
      setTimeout(() => t({ lengthComputable: n, total: e, loaded: r }));
  },
  rc =
    typeof fetch == "function" &&
    typeof Request == "function" &&
    typeof Response == "function",
  v1 = rc && typeof ReadableStream == "function",
  ud =
    rc &&
    (typeof TextEncoder == "function"
      ? (
          (e) => (t) =>
            e.encode(t)
        )(new TextEncoder())
      : async (e) => new Uint8Array(await new Response(e).arrayBuffer())),
  KN =
    v1 &&
    (() => {
      let e = !1;
      const t = new Request(rn.origin, {
        body: new ReadableStream(),
        method: "POST",
        get duplex() {
          return (e = !0), "half";
        },
      }).headers.has("Content-Type");
      return e && !t;
    })(),
  ug = 64 * 1024,
  dd =
    v1 &&
    !!(() => {
      try {
        return F.isReadableStream(new Response("").body);
      } catch {}
    })(),
  Zl = { stream: dd && ((e) => e.body) };
rc &&
  ((e) => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((t) => {
      !Zl[t] &&
        (Zl[t] = F.isFunction(e[t])
          ? (n) => n[t]()
          : (n, r) => {
              throw new ce(
                `Response type '${t}' is not supported`,
                ce.ERR_NOT_SUPPORT,
                r
              );
            });
    });
  })(new Response());
const GN = async (e) => {
    if (e == null) return 0;
    if (F.isBlob(e)) return e.size;
    if (F.isSpecCompliantForm(e))
      return (await new Request(e).arrayBuffer()).byteLength;
    if (F.isArrayBufferView(e)) return e.byteLength;
    if ((F.isURLSearchParams(e) && (e = e + ""), F.isString(e)))
      return (await ud(e)).byteLength;
  },
  XN = async (e, t) => {
    const n = F.toFiniteNumber(e.getContentLength());
    return n ?? GN(t);
  },
  QN =
    rc &&
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
      } = y1(e);
      c = c ? (c + "").toLowerCase() : "text";
      let [p, m] = o || s || i ? UN([o, s], i) : [],
        h,
        S;
      const v = () => {
        !h &&
          setTimeout(() => {
            p && p.unsubscribe();
          }),
          (h = !0);
      };
      let w;
      try {
        if (
          a &&
          KN &&
          n !== "get" &&
          n !== "head" &&
          (w = await XN(u, r)) !== 0
        ) {
          let C = new Request(t, { method: "POST", body: r, duplex: "half" }),
            R;
          F.isFormData(r) &&
            (R = C.headers.get("content-type")) &&
            u.setContentType(R),
            C.body && (r = ag(C.body, ug, cg(w, Jl(a)), null, ud));
        }
        F.isString(d) || (d = d ? "cors" : "omit"),
          (S = new Request(t, {
            ...f,
            signal: p,
            method: n.toUpperCase(),
            headers: u.normalize().toJSON(),
            body: r,
            duplex: "half",
            withCredentials: d,
          }));
        let y = await fetch(S);
        const b = dd && (c === "stream" || c === "response");
        if (dd && (l || b)) {
          const C = {};
          ["status", "statusText", "headers"].forEach((D) => {
            C[D] = y[D];
          });
          const R = F.toFiniteNumber(y.headers.get("content-length"));
          y = new Response(
            ag(y.body, ug, l && cg(R, Jl(l, !0)), b && v, ud),
            C
          );
        }
        c = c || "text";
        let E = await Zl[F.findKey(Zl, c) || "text"](y, e);
        return (
          !b && v(),
          m && m(),
          await new Promise((C, R) => {
            h1(C, R, {
              data: E,
              headers: Rt.from(y.headers),
              status: y.status,
              statusText: y.statusText,
              config: e,
              request: S,
            });
          })
        );
      } catch (y) {
        throw (
          (v(),
          y && y.name === "TypeError" && /fetch/i.test(y.message)
            ? Object.assign(new ce("Network Error", ce.ERR_NETWORK, e, S), {
                cause: y.cause || y,
              })
            : ce.from(y, y && y.code, e, S))
        );
      }
    }),
  fd = { http: mN, xhr: WN, fetch: QN };
F.forEach(fd, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {}
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const dg = (e) => `- ${e}`,
  JN = (e) => F.isFunction(e) || e === null || e === !1,
  w1 = {
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
          !JN(n) && ((r = fd[(i = String(n)).toLowerCase()]), r === void 0))
        )
          throw new ce(`Unknown adapter '${i}'`);
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
              s.map(dg).join(`
`)
            : " " + dg(s[0])
          : "as no adapter specified";
        throw new ce(
          "There is no suitable adapter to dispatch the request " + i,
          "ERR_NOT_SUPPORT"
        );
      }
      return r;
    },
    adapters: fd,
  };
function Jc(e) {
  if (
    (e.cancelToken && e.cancelToken.throwIfRequested(),
    e.signal && e.signal.aborted)
  )
    throw new ds(null, e);
}
function fg(e) {
  return (
    Jc(e),
    (e.headers = Rt.from(e.headers)),
    (e.data = Qc.call(e, e.transformRequest)),
    ["post", "put", "patch"].indexOf(e.method) !== -1 &&
      e.headers.setContentType("application/x-www-form-urlencoded", !1),
    w1
      .getAdapter(e.adapter || Ei.adapter)(e)
      .then(
        function (r) {
          return (
            Jc(e),
            (r.data = Qc.call(e, e.transformResponse, r)),
            (r.headers = Rt.from(r.headers)),
            r
          );
        },
        function (r) {
          return (
            m1(r) ||
              (Jc(e),
              r &&
                r.response &&
                ((r.response.data = Qc.call(
                  e,
                  e.transformResponse,
                  r.response
                )),
                (r.response.headers = Rt.from(r.response.headers)))),
            Promise.reject(r)
          );
        }
      )
  );
}
const x1 = "1.7.2",
  Np = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  (e, t) => {
    Np[e] = function (r) {
      return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  }
);
const pg = {};
Np.transitional = function (t, n, r) {
  function o(s, i) {
    return (
      "[Axios v" +
      x1 +
      "] Transitional option '" +
      s +
      "'" +
      i +
      (r ? ". " + r : "")
    );
  }
  return (s, i, l) => {
    if (t === !1)
      throw new ce(
        o(i, " has been removed" + (n ? " in " + n : "")),
        ce.ERR_DEPRECATED
      );
    return (
      n &&
        !pg[i] &&
        ((pg[i] = !0),
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
function ZN(e, t, n) {
  if (typeof e != "object")
    throw new ce("options must be an object", ce.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let o = r.length;
  for (; o-- > 0; ) {
    const s = r[o],
      i = t[s];
    if (i) {
      const l = e[s],
        a = l === void 0 || i(l, s, e);
      if (a !== !0)
        throw new ce("option " + s + " must be " + a, ce.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new ce("Unknown option " + s, ce.ERR_BAD_OPTION);
  }
}
const pd = { assertOptions: ZN, validators: Np },
  Qn = pd.validators;
class Br {
  constructor(t) {
    (this.defaults = t),
      (this.interceptors = { request: new sg(), response: new sg() });
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
      (n = Jr(this.defaults, n));
    const { transitional: r, paramsSerializer: o, headers: s } = n;
    r !== void 0 &&
      pd.assertOptions(
        r,
        {
          silentJSONParsing: Qn.transitional(Qn.boolean),
          forcedJSONParsing: Qn.transitional(Qn.boolean),
          clarifyTimeoutError: Qn.transitional(Qn.boolean),
        },
        !1
      ),
      o != null &&
        (F.isFunction(o)
          ? (n.paramsSerializer = { serialize: o })
          : pd.assertOptions(
              o,
              { encode: Qn.function, serialize: Qn.function },
              !0
            )),
      (n.method = (n.method || this.defaults.method || "get").toLowerCase());
    let i = s && F.merge(s.common, s[n.method]);
    s &&
      F.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (m) => {
          delete s[m];
        }
      ),
      (n.headers = Rt.concat(i, s));
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
      const m = [fg.bind(this), void 0];
      for (
        m.unshift.apply(m, l),
          m.push.apply(m, c),
          f = m.length,
          u = Promise.resolve(n);
        d < f;

      )
        u = u.then(m[d++], m[d++]);
      return u;
    }
    f = l.length;
    let p = n;
    for (d = 0; d < f; ) {
      const m = l[d++],
        h = l[d++];
      try {
        p = m(p);
      } catch (S) {
        h.call(this, S);
        break;
      }
    }
    try {
      u = fg.call(this, p);
    } catch (m) {
      return Promise.reject(m);
    }
    for (d = 0, f = c.length; d < f; ) u = u.then(c[d++], c[d++]);
    return u;
  }
  getUri(t) {
    t = Jr(this.defaults, t);
    const n = g1(t.baseURL, t.url);
    return d1(n, t.params, t.paramsSerializer);
  }
}
F.forEach(["delete", "get", "head", "options"], function (t) {
  Br.prototype[t] = function (n, r) {
    return this.request(
      Jr(r || {}, { method: t, url: n, data: (r || {}).data })
    );
  };
});
F.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (s, i, l) {
      return this.request(
        Jr(l || {}, {
          method: t,
          headers: r ? { "Content-Type": "multipart/form-data" } : {},
          url: s,
          data: i,
        })
      );
    };
  }
  (Br.prototype[t] = n()), (Br.prototype[t + "Form"] = n(!0));
});
class Op {
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
        r.reason || ((r.reason = new ds(s, i, l)), n(r.reason));
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
      token: new Op(function (o) {
        t = o;
      }),
      cancel: t,
    };
  }
}
function eO(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function tO(e) {
  return F.isObject(e) && e.isAxiosError === !0;
}
const md = {
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
Object.entries(md).forEach(([e, t]) => {
  md[t] = e;
});
function S1(e) {
  const t = new Br(e),
    n = Zw(Br.prototype.request, t);
  return (
    F.extend(n, Br.prototype, t, { allOwnKeys: !0 }),
    F.extend(n, t, null, { allOwnKeys: !0 }),
    (n.create = function (o) {
      return S1(Jr(e, o));
    }),
    n
  );
}
const Me = S1(Ei);
Me.Axios = Br;
Me.CanceledError = ds;
Me.CancelToken = Op;
Me.isCancel = m1;
Me.VERSION = x1;
Me.toFormData = nc;
Me.AxiosError = ce;
Me.Cancel = Me.CanceledError;
Me.all = function (t) {
  return Promise.all(t);
};
Me.spread = eO;
Me.isAxiosError = tO;
Me.mergeConfig = Jr;
Me.AxiosHeaders = Rt;
Me.formToJSON = (e) => p1(F.isHTMLForm(e) ? new FormData(e) : e);
Me.getAdapter = w1.getAdapter;
Me.HttpStatusCode = md;
Me.default = Me;
const nO = async (e, t, n) => {
    let r = {};
    const o = { target: e, embargo: t, data: { requirements: n } };
    let s = "";
    window.props !== void 0 && (s = window.props.token || "no-token-found");
    const i = Jw,
      l = {
        headers: {
          Authorization: "Token " + s,
          "Content-Type": "application/json",
        },
      };
    return (
      await Me.post(i, o, l)
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
  b1 = (e) => {
    const {
        profileData: t,
        submissionData: n,
        isLoading: r,
        profileError: o,
        SubmissionError: s,
      } = e,
      [i, l] = x.useState(!1),
      a = HD({
        mode: "uncontrolled",
        name: "profile-form",
        validateInputOnBlur: !0,
        initialValues: { files: [] },
        validate: (u) => {
          if (t.fields.map((f) => f.field_type.type).includes("data-url-field"))
            return validateDataUrlField(u, t);
        },
      }),
      c = (u) => {
        l(!0),
          nO(t.target, localStorage.getItem("embargo"), u)
            .then((d) => {
              console.log("DATA ", d);
            })
            .finally(() => {
              l(!1);
            });
      };
    return (
      console.log("FORM FIELDS ", t.form_fields),
      g.jsxs("form", {
        onSubmit: a.onSubmit(c),
        className: "submission-form container",
        children: [
          g.jsxs("p", { children: ["processing: ", "" + i] }),
          g.jsxs("div", {
            className: "row",
            children: [
              g.jsx("div", {
                className: "col-md-9",
                children: t.form_fields
                  .filter((u) => u.position == "main")
                  .map((u, d) => g.jsx(ld, { field: u, form: a }, d)),
              }),
              g.jsx("div", {
                className: "col-md-3",
                children: t.form_fields
                  .filter((u) => u.position == "sidebar")
                  .map((u, d) => g.jsx(ld, { field: u, form: a }, d)),
              }),
            ],
          }),
          g.jsx("div", {
            className: "row",
            children: g.jsx(rr, {
              mt: "md",
              className: "mt-5 col-md-9",
              children: g.jsxs(xn, {
                className: "submission-button",
                type: "submit",
                children: [
                  g.jsx("i", { class: "fa fa-play mr-3" }),
                  " Create Submission",
                ],
              }),
            }),
          }),
        ],
      })
    );
  };
b1.propTypes = { profileData: Y.object.isRequired };
/**
 * @remix-run/router v1.16.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function ea() {
  return (
    (ea = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    ea.apply(this, arguments)
  );
}
var ir;
(function (e) {
  (e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE");
})(ir || (ir = {}));
const mg = "popstate";
function rO(e) {
  e === void 0 && (e = {});
  function t(r, o) {
    let { pathname: s, search: i, hash: l } = r.location;
    return hd(
      "",
      { pathname: s, search: i, hash: l },
      (o.state && o.state.usr) || null,
      (o.state && o.state.key) || "default"
    );
  }
  function n(r, o) {
    return typeof o == "string" ? o : E1(o);
  }
  return sO(t, n, null, e);
}
function Pt(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function C1(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function oO() {
  return Math.random().toString(36).substr(2, 8);
}
function hg(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function hd(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    ea(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? oc(t) : t,
      { state: n, key: (t && t.key) || r || oO() }
    )
  );
}
function E1(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function oc(e) {
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
function sO(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: o = document.defaultView, v5Compat: s = !1 } = r,
    i = o.history,
    l = ir.Pop,
    a = null,
    c = u();
  c == null && ((c = 0), i.replaceState(ea({}, i.state, { idx: c }), ""));
  function u() {
    return (i.state || { idx: null }).idx;
  }
  function d() {
    l = ir.Pop;
    let S = u(),
      v = S == null ? null : S - c;
    (c = S), a && a({ action: l, location: h.location, delta: v });
  }
  function f(S, v) {
    l = ir.Push;
    let w = hd(h.location, S, v);
    c = u() + 1;
    let y = hg(w, c),
      b = h.createHref(w);
    try {
      i.pushState(y, "", b);
    } catch (E) {
      if (E instanceof DOMException && E.name === "DataCloneError") throw E;
      o.location.assign(b);
    }
    s && a && a({ action: l, location: h.location, delta: 1 });
  }
  function p(S, v) {
    l = ir.Replace;
    let w = hd(h.location, S, v);
    c = u();
    let y = hg(w, c),
      b = h.createHref(w);
    i.replaceState(y, "", b),
      s && a && a({ action: l, location: h.location, delta: 0 });
  }
  function m(S) {
    let v = o.location.origin !== "null" ? o.location.origin : o.location.href,
      w = typeof S == "string" ? S : E1(S);
    return (
      (w = w.replace(/ $/, "%20")),
      Pt(
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
        o.addEventListener(mg, d),
        (a = S),
        () => {
          o.removeEventListener(mg, d), (a = null);
        }
      );
    },
    createHref(S) {
      return t(o, S);
    },
    createURL: m,
    encodeLocation(S) {
      let v = m(S);
      return { pathname: v.pathname, search: v.search, hash: v.hash };
    },
    push: f,
    replace: p,
    go(S) {
      return i.go(S);
    },
  };
  return h;
}
var gg;
(function (e) {
  (e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error");
})(gg || (gg = {}));
function iO(e, t, n) {
  n === void 0 && (n = "/");
  let r = typeof t == "string" ? oc(t) : t,
    o = R1(r.pathname || "/", n);
  if (o == null) return null;
  let s = _1(e);
  lO(s);
  let i = null;
  for (let l = 0; i == null && l < s.length; ++l) {
    let a = wO(o);
    i = gO(s[l], a);
  }
  return i;
}
function _1(e, t, n, r) {
  t === void 0 && (t = []), n === void 0 && (n = []), r === void 0 && (r = "");
  let o = (s, i, l) => {
    let a = {
      relativePath: l === void 0 ? s.path || "" : l,
      caseSensitive: s.caseSensitive === !0,
      childrenIndex: i,
      route: s,
    };
    a.relativePath.startsWith("/") &&
      (Pt(
        a.relativePath.startsWith(r),
        'Absolute route path "' +
          a.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes."
      ),
      (a.relativePath = a.relativePath.slice(r.length)));
    let c = Io([r, a.relativePath]),
      u = n.concat(a);
    s.children &&
      s.children.length > 0 &&
      (Pt(
        s.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".')
      ),
      _1(s.children, t, u, c)),
      !(s.path == null && !s.index) &&
        t.push({ path: c, score: mO(c, s.index), routesMeta: u });
  };
  return (
    e.forEach((s, i) => {
      var l;
      if (s.path === "" || !((l = s.path) != null && l.includes("?"))) o(s, i);
      else for (let a of k1(s.path)) o(s, i, a);
    }),
    t
  );
}
function k1(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    o = n.endsWith("?"),
    s = n.replace(/\?$/, "");
  if (r.length === 0) return o ? [s, ""] : [s];
  let i = k1(r.join("/")),
    l = [];
  return (
    l.push(...i.map((a) => (a === "" ? s : [s, a].join("/")))),
    o && l.push(...i),
    l.map((a) => (e.startsWith("/") && a === "" ? "/" : a))
  );
}
function lO(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : hO(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex)
        )
  );
}
const aO = /^:[\w-]+$/,
  cO = 3,
  uO = 2,
  dO = 1,
  fO = 10,
  pO = -2,
  yg = (e) => e === "*";
function mO(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(yg) && (r += pO),
    t && (r += uO),
    n
      .filter((o) => !yg(o))
      .reduce((o, s) => o + (aO.test(s) ? cO : s === "" ? dO : fO), r)
  );
}
function hO(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, o) => r === t[o])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function gO(e, t) {
  let { routesMeta: n } = e,
    r = {},
    o = "/",
    s = [];
  for (let i = 0; i < n.length; ++i) {
    let l = n[i],
      a = i === n.length - 1,
      c = o === "/" ? t : t.slice(o.length) || "/",
      u = yO(
        { path: l.relativePath, caseSensitive: l.caseSensitive, end: a },
        c
      );
    if (!u) return null;
    Object.assign(r, u.params);
    let d = l.route;
    s.push({
      params: r,
      pathname: Io([o, u.pathname]),
      pathnameBase: xO(Io([o, u.pathnameBase])),
      route: d,
    }),
      u.pathnameBase !== "/" && (o = Io([o, u.pathnameBase]));
  }
  return s;
}
function yO(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = vO(e.path, e.caseSensitive, e.end),
    o = t.match(n);
  if (!o) return null;
  let s = o[0],
    i = s.replace(/(.)\/+$/, "$1"),
    l = o.slice(1);
  return {
    params: r.reduce((c, u, d) => {
      let { paramName: f, isOptional: p } = u;
      if (f === "*") {
        let h = l[d] || "";
        i = s.slice(0, s.length - h.length).replace(/(.)\/+$/, "$1");
      }
      const m = l[d];
      return (
        p && !m ? (c[f] = void 0) : (c[f] = (m || "").replace(/%2F/g, "/")), c
      );
    }, {}),
    pathname: s,
    pathnameBase: i,
    pattern: e,
  };
}
function vO(e, t, n) {
  t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    C1(
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
function wO(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      C1(
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
function R1(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const Io = (e) => e.join("/").replace(/\/\/+/g, "/"),
  xO = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/");
function SO(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const D1 = ["post", "put", "patch", "delete"];
new Set(D1);
const bO = ["get", ...D1];
new Set(bO);
/**
 * React Router v6.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function ta() {
  return (
    (ta = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    ta.apply(this, arguments)
  );
}
const CO = x.createContext(null),
  EO = x.createContext(null),
  P1 = x.createContext(null),
  sc = x.createContext(null),
  _i = x.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  T1 = x.createContext(null);
function jp() {
  return x.useContext(sc) != null;
}
function _O() {
  return jp() || Pt(!1), x.useContext(sc).location;
}
function kO() {
  let { matches: e } = x.useContext(_i),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function RO(e, t) {
  return DO(e, t);
}
function DO(e, t, n, r) {
  jp() || Pt(!1);
  let { navigator: o } = x.useContext(P1),
    { matches: s } = x.useContext(_i),
    i = s[s.length - 1],
    l = i ? i.params : {};
  i && i.pathname;
  let a = i ? i.pathnameBase : "/";
  i && i.route;
  let c = _O(),
    u;
  if (t) {
    var d;
    let S = typeof t == "string" ? oc(t) : t;
    a === "/" || ((d = S.pathname) != null && d.startsWith(a)) || Pt(!1),
      (u = S);
  } else u = c;
  let f = u.pathname || "/",
    p = f;
  if (a !== "/") {
    let S = a.replace(/^\//, "").split("/");
    p = "/" + f.replace(/^\//, "").split("/").slice(S.length).join("/");
  }
  let m = iO(e, { pathname: p }),
    h = jO(
      m &&
        m.map((S) =>
          Object.assign({}, S, {
            params: Object.assign({}, l, S.params),
            pathname: Io([
              a,
              o.encodeLocation
                ? o.encodeLocation(S.pathname).pathname
                : S.pathname,
            ]),
            pathnameBase:
              S.pathnameBase === "/"
                ? a
                : Io([
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
    ? x.createElement(
        sc.Provider,
        {
          value: {
            location: ta(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              u
            ),
            navigationType: ir.Pop,
          },
        },
        h
      )
    : h;
}
function PO() {
  let e = FO(),
    t = SO(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
      ? e.message
      : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    o = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return x.createElement(
    x.Fragment,
    null,
    x.createElement("h2", null, "Unexpected Application Error!"),
    x.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? x.createElement("pre", { style: o }, n) : null,
    null
  );
}
const TO = x.createElement(PO, null);
class NO extends x.Component {
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
      ? x.createElement(
          _i.Provider,
          { value: this.props.routeContext },
          x.createElement(T1.Provider, {
            value: this.state.error,
            children: this.props.component,
          })
        )
      : this.props.children;
  }
}
function OO(e) {
  let { routeContext: t, match: n, children: r } = e,
    o = x.useContext(CO);
  return (
    o &&
      o.static &&
      o.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (o.staticContext._deepestRenderedBoundaryId = n.route.id),
    x.createElement(_i.Provider, { value: t }, r)
  );
}
function jO(e, t, n, r) {
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
    u >= 0 || Pt(!1), (i = i.slice(0, Math.min(i.length, u + 1)));
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
        let { loaderData: f, errors: p } = n,
          m =
            d.route.loader &&
            f[d.route.id] === void 0 &&
            (!p || p[d.route.id] === void 0);
        if (d.route.lazy || m) {
          (a = !0), c >= 0 ? (i = i.slice(0, c + 1)) : (i = [i[0]]);
          break;
        }
      }
    }
  return i.reduceRight((u, d, f) => {
    let p,
      m = !1,
      h = null,
      S = null;
    n &&
      ((p = l && d.route.id ? l[d.route.id] : void 0),
      (h = d.route.errorElement || TO),
      a &&
        (c < 0 && f === 0
          ? ((m = !0), (S = null))
          : c === f &&
            ((m = !0), (S = d.route.hydrateFallbackElement || null))));
    let v = t.concat(i.slice(0, f + 1)),
      w = () => {
        let y;
        return (
          p
            ? (y = h)
            : m
            ? (y = S)
            : d.route.Component
            ? (y = x.createElement(d.route.Component, null))
            : d.route.element
            ? (y = d.route.element)
            : (y = u),
          x.createElement(OO, {
            match: d,
            routeContext: { outlet: u, matches: v, isDataRoute: n != null },
            children: y,
          })
        );
      };
    return n && (d.route.ErrorBoundary || d.route.errorElement || f === 0)
      ? x.createElement(NO, {
          location: n.location,
          revalidation: n.revalidation,
          component: h,
          error: p,
          children: w(),
          routeContext: { outlet: null, matches: v, isDataRoute: !0 },
        })
      : w();
  }, null);
}
var gd = (function (e) {
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
})(gd || {});
function $O(e) {
  let t = x.useContext(EO);
  return t || Pt(!1), t;
}
function LO(e) {
  let t = x.useContext(_i);
  return t || Pt(!1), t;
}
function AO(e) {
  let t = LO(),
    n = t.matches[t.matches.length - 1];
  return n.route.id || Pt(!1), n.route.id;
}
function FO() {
  var e;
  let t = x.useContext(T1),
    n = $O(gd.UseRouteError),
    r = AO(gd.UseRouteError);
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function yd(e) {
  Pt(!1);
}
function MO(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: o = ir.Pop,
    navigator: s,
    static: i = !1,
    future: l,
  } = e;
  jp() && Pt(!1);
  let a = t.replace(/^\/*/, "/"),
    c = x.useMemo(
      () => ({
        basename: a,
        navigator: s,
        static: i,
        future: ta({ v7_relativeSplatPath: !1 }, l),
      }),
      [a, l, s, i]
    );
  typeof r == "string" && (r = oc(r));
  let {
      pathname: u = "/",
      search: d = "",
      hash: f = "",
      state: p = null,
      key: m = "default",
    } = r,
    h = x.useMemo(() => {
      let S = R1(u, a);
      return S == null
        ? null
        : {
            location: { pathname: S, search: d, hash: f, state: p, key: m },
            navigationType: o,
          };
    }, [a, u, d, f, p, m, o]);
  return h == null
    ? null
    : x.createElement(
        P1.Provider,
        { value: c },
        x.createElement(sc.Provider, { children: n, value: h })
      );
}
function IO(e) {
  let { children: t, location: n } = e;
  return RO(vd(t), n);
}
new Promise(() => {});
function vd(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    x.Children.forEach(e, (r, o) => {
      if (!x.isValidElement(r)) return;
      let s = [...t, o];
      if (r.type === x.Fragment) {
        n.push.apply(n, vd(r.props.children, s));
        return;
      }
      r.type !== yd && Pt(!1), !r.props.index || !r.props.children || Pt(!1);
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
      r.props.children && (i.children = vd(r.props.children, s)), n.push(i);
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
 */ const zO = "6";
try {
  window.__reactRouterVersion = zO;
} catch {}
const BO = "startTransition",
  vg = Og[BO];
function VO(e) {
  let { basename: t, children: n, future: r, window: o } = e,
    s = x.useRef();
  s.current == null && (s.current = rO({ window: o, v5Compat: !0 }));
  let i = s.current,
    [l, a] = x.useState({ action: i.action, location: i.location }),
    { v7_startTransition: c } = r || {},
    u = x.useCallback(
      (d) => {
        c && vg ? vg(() => a(d)) : a(d);
      },
      [a, c]
    );
  return (
    x.useLayoutEffect(() => i.listen(u), [i, u]),
    x.createElement(MO, {
      basename: t,
      children: n,
      location: l.location,
      navigationType: l.action,
      navigator: i,
      future: r,
    })
  );
}
var wg;
(function (e) {
  (e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState");
})(wg || (wg = {}));
var xg;
(function (e) {
  (e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration");
})(xg || (xg = {}));
const HO = (e, t) => {
    const [n, r] = x.useState([]),
      [o, s] = x.useState([]),
      [i, l] = x.useState(!1),
      [a, c] = x.useState(!0),
      [u, d] = x.useState(null),
      [f, p] = x.useState(null);
    let m = "";
    window.props !== void 0 && (m = window.props.token || "no-token-found"),
      t === void 0 && localStorage.setItem("submission", JSON.stringify({}));
    const h = {
      headers: {
        Authorization: "Token " + m,
        "Content-Type": "application/json",
      },
    };
    return (
      x.useEffect(
        () => (
          (async () => {
            c(!0),
              await Me.get(kT + e)
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
      x.useEffect(
        () => (
          i &&
            t !== void 0 &&
            (async () => (
              c(!0),
              await Me.get(Jw + t + "/", h)
                .then((v) => {
                  localStorage.setItem("submission", JSON.stringify(v.data)),
                    s(v.data);
                })
                .catch((v) => {
                  p(v);
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
  WO = SD(b1),
  UO = bD(WO),
  Sg = () => {
    const { brokerSubmissionId: e } = kO(),
      t = localStorage.getItem("profileName") || _T,
      { data1: n, data2: r, isLoading: o, error1: s, error2: i } = HO(t, e);
    return g.jsxs("div", {
      children: [
        g.jsx("h1", { children: "ProfileForm" }),
        g.jsx(UO, {
          profileData: n,
          submissionData: r,
          isLoading: o,
          profileError: s,
          submissionError: i,
        }),
      ],
    });
  };
function YO() {
  return g.jsx(r0, {
    children: g.jsxs(IO, {
      children: [
        g.jsx(yd, { path: "/", element: g.jsx(Sg, {}) }),
        g.jsx(yd, { path: "/:brokerSubmissionId", element: g.jsx(Sg, {}) }),
      ],
    }),
  });
}
let $p = "generic";
window.props !== void 0 && ($p = window.props.profile_name || "generic");
localStorage.setItem("profileName", $p);
const qO = "/profile/profile/" + $p + "/ui/";
Zc.createRoot(document.getElementById("root")).render(
  g.jsx(ra.StrictMode, {
    children: g.jsx(VO, { basename: qO, children: g.jsx(YO, {}) }),
  })
);
