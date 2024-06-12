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
var Mu =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
function Dr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var Ch = { exports: {} },
  kl = {},
  Eh = { exports: {} },
  ue = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var $s = Symbol.for("react.element"),
  O1 = Symbol.for("react.portal"),
  N1 = Symbol.for("react.fragment"),
  $1 = Symbol.for("react.strict_mode"),
  L1 = Symbol.for("react.profiler"),
  j1 = Symbol.for("react.provider"),
  A1 = Symbol.for("react.context"),
  F1 = Symbol.for("react.forward_ref"),
  M1 = Symbol.for("react.suspense"),
  z1 = Symbol.for("react.memo"),
  I1 = Symbol.for("react.lazy"),
  Md = Symbol.iterator;
function B1(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Md && e[Md]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var kh = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  _h = Object.assign,
  Rh = {};
function _o(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = Rh),
    (this.updater = n || kh);
}
_o.prototype.isReactComponent = {};
_o.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables."
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
_o.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function Dh() {}
Dh.prototype = _o.prototype;
function zu(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = Rh),
    (this.updater = n || kh);
}
var Iu = (zu.prototype = new Dh());
Iu.constructor = zu;
_h(Iu, _o.prototype);
Iu.isPureReactComponent = !0;
var zd = Array.isArray,
  Ph = Object.prototype.hasOwnProperty,
  Bu = { current: null },
  Th = { key: !0, ref: !0, __self: !0, __source: !0 };
function Oh(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (i = t.ref),
    t.key !== void 0 && (s = "" + t.key),
    t))
      Ph.call(t, r) && !Th.hasOwnProperty(r) && (o[r] = t[r]);
  var l = arguments.length - 2;
  if (l === 1) o.children = n;
  else if (1 < l) {
    for (var a = Array(l), c = 0; c < l; c++) a[c] = arguments[c + 2];
    o.children = a;
  }
  if (e && e.defaultProps)
    for (r in ((l = e.defaultProps), l)) o[r] === void 0 && (o[r] = l[r]);
  return {
    $$typeof: $s,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: Bu.current,
  };
}
function V1(e, t) {
  return {
    $$typeof: $s,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Vu(e) {
  return typeof e == "object" && e !== null && e.$$typeof === $s;
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
var Id = /\/+/g;
function Pa(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? H1("" + e.key)
    : t.toString(36);
}
function Ci(e, t, n, r, o) {
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
          case $s:
          case O1:
            i = !0;
        }
    }
  if (i)
    return (
      (i = e),
      (o = o(i)),
      (e = r === "" ? "." + Pa(i, 0) : r),
      zd(o)
        ? ((n = ""),
          e != null && (n = e.replace(Id, "$&/") + "/"),
          Ci(o, t, n, "", function (c) {
            return c;
          }))
        : o != null &&
          (Vu(o) &&
            (o = V1(
              o,
              n +
                (!o.key || (i && i.key === o.key)
                  ? ""
                  : ("" + o.key).replace(Id, "$&/") + "/") +
                e
            )),
          t.push(o)),
      1
    );
  if (((i = 0), (r = r === "" ? "." : r + ":"), zd(e)))
    for (var l = 0; l < e.length; l++) {
      s = e[l];
      var a = r + Pa(s, l);
      i += Ci(s, t, n, a, o);
    }
  else if (((a = B1(e)), typeof a == "function"))
    for (e = a.call(e), l = 0; !(s = e.next()).done; )
      (s = s.value), (a = r + Pa(s, l++)), (i += Ci(s, t, n, a, o));
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
function qs(e, t, n) {
  if (e == null) return e;
  var r = [],
    o = 0;
  return (
    Ci(e, r, "", "", function (s) {
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
var rt = { current: null },
  Ei = { transition: null },
  W1 = {
    ReactCurrentDispatcher: rt,
    ReactCurrentBatchConfig: Ei,
    ReactCurrentOwner: Bu,
  };
function Nh() {
  throw Error("act(...) is not supported in production builds of React.");
}
ue.Children = {
  map: qs,
  forEach: function (e, t, n) {
    qs(
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
      qs(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      qs(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Vu(e))
      throw Error(
        "React.Children.only expected to receive a single React element child."
      );
    return e;
  },
};
ue.Component = _o;
ue.Fragment = N1;
ue.Profiler = L1;
ue.PureComponent = zu;
ue.StrictMode = $1;
ue.Suspense = M1;
ue.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W1;
ue.act = Nh;
ue.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        "."
    );
  var r = _h({}, e.props),
    o = e.key,
    s = e.ref,
    i = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((s = t.ref), (i = Bu.current)),
      t.key !== void 0 && (o = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var l = e.type.defaultProps;
    for (a in t)
      Ph.call(t, a) &&
        !Th.hasOwnProperty(a) &&
        (r[a] = t[a] === void 0 && l !== void 0 ? l[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    l = Array(a);
    for (var c = 0; c < a; c++) l[c] = arguments[c + 2];
    r.children = l;
  }
  return { $$typeof: $s, type: e.type, key: o, ref: s, props: r, _owner: i };
};
ue.createContext = function (e) {
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
    (e.Provider = { $$typeof: j1, _context: e }),
    (e.Consumer = e)
  );
};
ue.createElement = Oh;
ue.createFactory = function (e) {
  var t = Oh.bind(null, e);
  return (t.type = e), t;
};
ue.createRef = function () {
  return { current: null };
};
ue.forwardRef = function (e) {
  return { $$typeof: F1, render: e };
};
ue.isValidElement = Vu;
ue.lazy = function (e) {
  return { $$typeof: I1, _payload: { _status: -1, _result: e }, _init: U1 };
};
ue.memo = function (e, t) {
  return { $$typeof: z1, type: e, compare: t === void 0 ? null : t };
};
ue.startTransition = function (e) {
  var t = Ei.transition;
  Ei.transition = {};
  try {
    e();
  } finally {
    Ei.transition = t;
  }
};
ue.unstable_act = Nh;
ue.useCallback = function (e, t) {
  return rt.current.useCallback(e, t);
};
ue.useContext = function (e) {
  return rt.current.useContext(e);
};
ue.useDebugValue = function () {};
ue.useDeferredValue = function (e) {
  return rt.current.useDeferredValue(e);
};
ue.useEffect = function (e, t) {
  return rt.current.useEffect(e, t);
};
ue.useId = function () {
  return rt.current.useId();
};
ue.useImperativeHandle = function (e, t, n) {
  return rt.current.useImperativeHandle(e, t, n);
};
ue.useInsertionEffect = function (e, t) {
  return rt.current.useInsertionEffect(e, t);
};
ue.useLayoutEffect = function (e, t) {
  return rt.current.useLayoutEffect(e, t);
};
ue.useMemo = function (e, t) {
  return rt.current.useMemo(e, t);
};
ue.useReducer = function (e, t, n) {
  return rt.current.useReducer(e, t, n);
};
ue.useRef = function (e) {
  return rt.current.useRef(e);
};
ue.useState = function (e) {
  return rt.current.useState(e);
};
ue.useSyncExternalStore = function (e, t, n) {
  return rt.current.useSyncExternalStore(e, t, n);
};
ue.useTransition = function () {
  return rt.current.useTransition();
};
ue.version = "18.3.1";
Eh.exports = ue;
var w = Eh.exports;
const _l = Dr(w),
  $h = T1({ __proto__: null, default: _l }, [w]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Y1 = w,
  K1 = Symbol.for("react.element"),
  G1 = Symbol.for("react.fragment"),
  X1 = Object.prototype.hasOwnProperty,
  q1 = Y1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  Q1 = { key: !0, ref: !0, __self: !0, __source: !0 };
function Lh(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  n !== void 0 && (s = "" + n),
    t.key !== void 0 && (s = "" + t.key),
    t.ref !== void 0 && (i = t.ref);
  for (r in t) X1.call(t, r) && !Q1.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) o[r] === void 0 && (o[r] = t[r]);
  return {
    $$typeof: K1,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: q1.current,
  };
}
kl.Fragment = G1;
kl.jsx = Lh;
kl.jsxs = Lh;
Ch.exports = kl;
var x = Ch.exports,
  wc = {},
  jh = { exports: {} },
  bt = {},
  Ah = { exports: {} },
  Fh = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(_, k) {
    var $ = _.length;
    _.push(k);
    e: for (; 0 < $; ) {
      var N = ($ - 1) >>> 1,
        I = _[N];
      if (0 < o(I, k)) (_[N] = k), (_[$] = I), ($ = N);
      else break e;
    }
  }
  function n(_) {
    return _.length === 0 ? null : _[0];
  }
  function r(_) {
    if (_.length === 0) return null;
    var k = _[0],
      $ = _.pop();
    if ($ !== k) {
      _[0] = $;
      e: for (var N = 0, I = _.length, Y = I >>> 1; N < Y; ) {
        var X = 2 * (N + 1) - 1,
          ee = _[X],
          ne = X + 1,
          te = _[ne];
        if (0 > o(ee, $))
          ne < I && 0 > o(te, ee)
            ? ((_[N] = te), (_[ne] = $), (N = ne))
            : ((_[N] = ee), (_[X] = $), (N = X));
        else if (ne < I && 0 > o(te, $)) (_[N] = te), (_[ne] = $), (N = ne);
        else break e;
      }
    }
    return k;
  }
  function o(_, k) {
    var $ = _.sortIndex - k.sortIndex;
    return $ !== 0 ? $ : _.id - k.id;
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
    f = null,
    d = 3,
    m = !1,
    p = !1,
    h = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    v = typeof clearTimeout == "function" ? clearTimeout : null,
    g = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function y(_) {
    for (var k = n(c); k !== null; ) {
      if (k.callback === null) r(c);
      else if (k.startTime <= _)
        r(c), (k.sortIndex = k.expirationTime), t(a, k);
      else break;
      k = n(c);
    }
  }
  function b(_) {
    if (((h = !1), y(_), !p))
      if (n(a) !== null) (p = !0), P(C);
      else {
        var k = n(c);
        k !== null && O(b, k.startTime - _);
      }
  }
  function C(_, k) {
    (p = !1), h && ((h = !1), v(D), (D = -1)), (m = !0);
    var $ = d;
    try {
      for (
        y(k), f = n(a);
        f !== null && (!(f.expirationTime > k) || (_ && !M()));

      ) {
        var N = f.callback;
        if (typeof N == "function") {
          (f.callback = null), (d = f.priorityLevel);
          var I = N(f.expirationTime <= k);
          (k = e.unstable_now()),
            typeof I == "function" ? (f.callback = I) : f === n(a) && r(a),
            y(k);
        } else r(a);
        f = n(a);
      }
      if (f !== null) var Y = !0;
      else {
        var X = n(c);
        X !== null && O(b, X.startTime - k), (Y = !1);
      }
      return Y;
    } finally {
      (f = null), (d = $), (m = !1);
    }
  }
  var E = !1,
    R = null,
    D = -1,
    j = 5,
    T = -1;
  function M() {
    return !(e.unstable_now() - T < j);
  }
  function B() {
    if (R !== null) {
      var _ = e.unstable_now();
      T = _;
      var k = !0;
      try {
        k = R(!0, _);
      } finally {
        k ? H() : ((E = !1), (R = null));
      }
    } else E = !1;
  }
  var H;
  if (typeof g == "function")
    H = function () {
      g(B);
    };
  else if (typeof MessageChannel < "u") {
    var F = new MessageChannel(),
      L = F.port2;
    (F.port1.onmessage = B),
      (H = function () {
        L.postMessage(null);
      });
  } else
    H = function () {
      S(B, 0);
    };
  function P(_) {
    (R = _), E || ((E = !0), H());
  }
  function O(_, k) {
    D = S(function () {
      _(e.unstable_now());
    }, k);
  }
  (e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (_) {
      _.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      p || m || ((p = !0), P(C));
    }),
    (e.unstable_forceFrameRate = function (_) {
      0 > _ || 125 < _
        ? console.error(
            "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"
          )
        : (j = 0 < _ ? Math.floor(1e3 / _) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return d;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(a);
    }),
    (e.unstable_next = function (_) {
      switch (d) {
        case 1:
        case 2:
        case 3:
          var k = 3;
          break;
        default:
          k = d;
      }
      var $ = d;
      d = k;
      try {
        return _();
      } finally {
        d = $;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (_, k) {
      switch (_) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          _ = 3;
      }
      var $ = d;
      d = _;
      try {
        return k();
      } finally {
        d = $;
      }
    }),
    (e.unstable_scheduleCallback = function (_, k, $) {
      var N = e.unstable_now();
      switch (
        (typeof $ == "object" && $ !== null
          ? (($ = $.delay), ($ = typeof $ == "number" && 0 < $ ? N + $ : N))
          : ($ = N),
        _)
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
        (_ = {
          id: u++,
          callback: k,
          priorityLevel: _,
          startTime: $,
          expirationTime: I,
          sortIndex: -1,
        }),
        $ > N
          ? ((_.sortIndex = $),
            t(c, _),
            n(a) === null &&
              _ === n(c) &&
              (h ? (v(D), (D = -1)) : (h = !0), O(b, $ - N)))
          : ((_.sortIndex = I), t(a, _), p || m || ((p = !0), P(C))),
        _
      );
    }),
    (e.unstable_shouldYield = M),
    (e.unstable_wrapCallback = function (_) {
      var k = d;
      return function () {
        var $ = d;
        d = k;
        try {
          return _.apply(this, arguments);
        } finally {
          d = $;
        }
      };
    });
})(Fh);
Ah.exports = Fh;
var J1 = Ah.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Z1 = w,
  xt = J1;
function V(e) {
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
var Mh = new Set(),
  us = {};
function Pr(e, t) {
  fo(e, t), fo(e + "Capture", t);
}
function fo(e, t) {
  for (us[e] = t, e = 0; e < t.length; e++) Mh.add(t[e]);
}
var wn = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Sc = Object.prototype.hasOwnProperty,
  ew =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Bd = {},
  Vd = {};
function tw(e) {
  return Sc.call(Vd, e)
    ? !0
    : Sc.call(Bd, e)
    ? !1
    : ew.test(e)
    ? (Vd[e] = !0)
    : ((Bd[e] = !0), !1);
}
function nw(e, t, n, r) {
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
function rw(e, t, n, r) {
  if (t === null || typeof t > "u" || nw(e, t, n, r)) return !0;
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
function ot(e, t, n, r, o, s, i) {
  (this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = o),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = s),
    (this.removeEmptyString = i);
}
var Ue = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Ue[e] = new ot(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Ue[t] = new ot(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Ue[e] = new ot(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
[
  "autoReverse",
  "externalResourcesRequired",
  "focusable",
  "preserveAlpha",
].forEach(function (e) {
  Ue[e] = new ot(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Ue[e] = new ot(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Ue[e] = new ot(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Ue[e] = new ot(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Ue[e] = new ot(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Ue[e] = new ot(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Hu = /[\-:]([a-z])/g;
function Uu(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Hu, Uu);
    Ue[t] = new ot(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Hu, Uu);
    Ue[t] = new ot(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Hu, Uu);
  Ue[t] = new ot(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Ue[e] = new ot(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Ue.xlinkHref = new ot(
  "xlinkHref",
  1,
  !1,
  "xlink:href",
  "http://www.w3.org/1999/xlink",
  !0,
  !1
);
["src", "href", "action", "formAction"].forEach(function (e) {
  Ue[e] = new ot(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Wu(e, t, n, r) {
  var o = Ue.hasOwnProperty(t) ? Ue[t] : null;
  (o !== null
    ? o.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (rw(t, n, o, r) && (n = null),
    r || o === null
      ? tw(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
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
var En = Z1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Qs = Symbol.for("react.element"),
  Br = Symbol.for("react.portal"),
  Vr = Symbol.for("react.fragment"),
  Yu = Symbol.for("react.strict_mode"),
  xc = Symbol.for("react.profiler"),
  zh = Symbol.for("react.provider"),
  Ih = Symbol.for("react.context"),
  Ku = Symbol.for("react.forward_ref"),
  bc = Symbol.for("react.suspense"),
  Cc = Symbol.for("react.suspense_list"),
  Gu = Symbol.for("react.memo"),
  Ln = Symbol.for("react.lazy"),
  Bh = Symbol.for("react.offscreen"),
  Hd = Symbol.iterator;
function zo(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Hd && e[Hd]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Ee = Object.assign,
  Ta;
function Qo(e) {
  if (Ta === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      Ta = (t && t[1]) || "";
    }
  return (
    `
` +
    Ta +
    e
  );
}
var Oa = !1;
function Na(e, t) {
  if (!e || Oa) return "";
  Oa = !0;
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
    (Oa = !1), (Error.prepareStackTrace = n);
  }
  return (e = e ? e.displayName || e.name : "") ? Qo(e) : "";
}
function ow(e) {
  switch (e.tag) {
    case 5:
      return Qo(e.type);
    case 16:
      return Qo("Lazy");
    case 13:
      return Qo("Suspense");
    case 19:
      return Qo("SuspenseList");
    case 0:
    case 2:
    case 15:
      return (e = Na(e.type, !1)), e;
    case 11:
      return (e = Na(e.type.render, !1)), e;
    case 1:
      return (e = Na(e.type, !0)), e;
    default:
      return "";
  }
}
function Ec(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Vr:
      return "Fragment";
    case Br:
      return "Portal";
    case xc:
      return "Profiler";
    case Yu:
      return "StrictMode";
    case bc:
      return "Suspense";
    case Cc:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Ih:
        return (e.displayName || "Context") + ".Consumer";
      case zh:
        return (e._context.displayName || "Context") + ".Provider";
      case Ku:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Gu:
        return (
          (t = e.displayName || null), t !== null ? t : Ec(e.type) || "Memo"
        );
      case Ln:
        (t = e._payload), (e = e._init);
        try {
          return Ec(e(t));
        } catch {}
    }
  return null;
}
function sw(e) {
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
      return Ec(t);
    case 8:
      return t === Yu ? "StrictMode" : "Mode";
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
function Qn(e) {
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
function Vh(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function iw(e) {
  var t = Vh(e) ? "checked" : "value",
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
function Js(e) {
  e._valueTracker || (e._valueTracker = iw(e));
}
function Hh(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = Vh(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Ii(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function kc(e, t) {
  var n = t.checked;
  return Ee({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function Ud(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  (n = Qn(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled:
        t.type === "checkbox" || t.type === "radio"
          ? t.checked != null
          : t.value != null,
    });
}
function Uh(e, t) {
  (t = t.checked), t != null && Wu(e, "checked", t, !1);
}
function _c(e, t) {
  Uh(e, t);
  var n = Qn(t.value),
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
    ? Rc(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && Rc(e, t.type, Qn(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked);
}
function Wd(e, t, n) {
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
function Rc(e, t, n) {
  (t !== "number" || Ii(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Jo = Array.isArray;
function to(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var o = 0; o < n.length; o++) t["$" + n[o]] = !0;
    for (n = 0; n < e.length; n++)
      (o = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== o && (e[n].selected = o),
        o && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + Qn(n), t = null, o = 0; o < e.length; o++) {
      if (e[o].value === n) {
        (e[o].selected = !0), r && (e[o].defaultSelected = !0);
        return;
      }
      t !== null || e[o].disabled || (t = e[o]);
    }
    t !== null && (t.selected = !0);
  }
}
function Dc(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(V(91));
  return Ee({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function Yd(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(V(92));
      if (Jo(n)) {
        if (1 < n.length) throw Error(V(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), (n = t);
  }
  e._wrapperState = { initialValue: Qn(n) };
}
function Wh(e, t) {
  var n = Qn(t.value),
    r = Qn(t.defaultValue);
  n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r);
}
function Kd(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Yh(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Pc(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? Yh(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
    ? "http://www.w3.org/1999/xhtml"
    : e;
}
var Zs,
  Kh = (function (e) {
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
        Zs = Zs || document.createElement("div"),
          Zs.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = Zs.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function fs(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var ts = {
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
  lw = ["Webkit", "ms", "Moz", "O"];
Object.keys(ts).forEach(function (e) {
  lw.forEach(function (t) {
    (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (ts[t] = ts[e]);
  });
});
function Gh(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (ts.hasOwnProperty(e) && ts[e])
    ? ("" + t).trim()
    : t + "px";
}
function Xh(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        o = Gh(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : (e[n] = o);
    }
}
var aw = Ee(
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
function Tc(e, t) {
  if (t) {
    if (aw[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
      throw Error(V(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(V(60));
      if (
        typeof t.dangerouslySetInnerHTML != "object" ||
        !("__html" in t.dangerouslySetInnerHTML)
      )
        throw Error(V(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(V(62));
  }
}
function Oc(e, t) {
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
var Nc = null;
function Xu(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var $c = null,
  no = null,
  ro = null;
function Gd(e) {
  if ((e = As(e))) {
    if (typeof $c != "function") throw Error(V(280));
    var t = e.stateNode;
    t && ((t = Ol(t)), $c(e.stateNode, e.type, t));
  }
}
function qh(e) {
  no ? (ro ? ro.push(e) : (ro = [e])) : (no = e);
}
function Qh() {
  if (no) {
    var e = no,
      t = ro;
    if (((ro = no = null), Gd(e), t)) for (e = 0; e < t.length; e++) Gd(t[e]);
  }
}
function Jh(e, t) {
  return e(t);
}
function Zh() {}
var $a = !1;
function eg(e, t, n) {
  if ($a) return e(t, n);
  $a = !0;
  try {
    return Jh(e, t, n);
  } finally {
    ($a = !1), (no !== null || ro !== null) && (Zh(), Qh());
  }
}
function ds(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Ol(n);
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
  if (n && typeof n != "function") throw Error(V(231, t, typeof n));
  return n;
}
var Lc = !1;
if (wn)
  try {
    var Io = {};
    Object.defineProperty(Io, "passive", {
      get: function () {
        Lc = !0;
      },
    }),
      window.addEventListener("test", Io, Io),
      window.removeEventListener("test", Io, Io);
  } catch {
    Lc = !1;
  }
function cw(e, t, n, r, o, s, i, l, a) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (u) {
    this.onError(u);
  }
}
var ns = !1,
  Bi = null,
  Vi = !1,
  jc = null,
  uw = {
    onError: function (e) {
      (ns = !0), (Bi = e);
    },
  };
function fw(e, t, n, r, o, s, i, l, a) {
  (ns = !1), (Bi = null), cw.apply(uw, arguments);
}
function dw(e, t, n, r, o, s, i, l, a) {
  if ((fw.apply(this, arguments), ns)) {
    if (ns) {
      var c = Bi;
      (ns = !1), (Bi = null);
    } else throw Error(V(198));
    Vi || ((Vi = !0), (jc = c));
  }
}
function Tr(e) {
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
function tg(e) {
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
function Xd(e) {
  if (Tr(e) !== e) throw Error(V(188));
}
function pw(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = Tr(e)), t === null)) throw Error(V(188));
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
        if (s === n) return Xd(o), e;
        if (s === r) return Xd(o), t;
        s = s.sibling;
      }
      throw Error(V(188));
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
        if (!i) throw Error(V(189));
      }
    }
    if (n.alternate !== r) throw Error(V(190));
  }
  if (n.tag !== 3) throw Error(V(188));
  return n.stateNode.current === n ? e : t;
}
function ng(e) {
  return (e = pw(e)), e !== null ? rg(e) : null;
}
function rg(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = rg(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var og = xt.unstable_scheduleCallback,
  qd = xt.unstable_cancelCallback,
  mw = xt.unstable_shouldYield,
  hw = xt.unstable_requestPaint,
  Pe = xt.unstable_now,
  gw = xt.unstable_getCurrentPriorityLevel,
  qu = xt.unstable_ImmediatePriority,
  sg = xt.unstable_UserBlockingPriority,
  Hi = xt.unstable_NormalPriority,
  yw = xt.unstable_LowPriority,
  ig = xt.unstable_IdlePriority,
  Rl = null,
  sn = null;
function vw(e) {
  if (sn && typeof sn.onCommitFiberRoot == "function")
    try {
      sn.onCommitFiberRoot(Rl, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var Vt = Math.clz32 ? Math.clz32 : xw,
  ww = Math.log,
  Sw = Math.LN2;
function xw(e) {
  return (e >>>= 0), e === 0 ? 32 : (31 - ((ww(e) / Sw) | 0)) | 0;
}
var ei = 64,
  ti = 4194304;
function Zo(e) {
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
function Ui(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    o = e.suspendedLanes,
    s = e.pingedLanes,
    i = n & 268435455;
  if (i !== 0) {
    var l = i & ~o;
    l !== 0 ? (r = Zo(l)) : ((s &= i), s !== 0 && (r = Zo(s)));
  } else (i = n & ~o), i !== 0 ? (r = Zo(i)) : s !== 0 && (r = Zo(s));
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
      (n = 31 - Vt(t)), (o = 1 << n), (r |= e[n]), (t &= ~o);
  return r;
}
function bw(e, t) {
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
function Cw(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      o = e.expirationTimes,
      s = e.pendingLanes;
    0 < s;

  ) {
    var i = 31 - Vt(s),
      l = 1 << i,
      a = o[i];
    a === -1
      ? (!(l & n) || l & r) && (o[i] = bw(l, t))
      : a <= t && (e.expiredLanes |= l),
      (s &= ~l);
  }
}
function Ac(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function lg() {
  var e = ei;
  return (ei <<= 1), !(ei & 4194240) && (ei = 64), e;
}
function La(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Ls(e, t, n) {
  (e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - Vt(t)),
    (e[t] = n);
}
function Ew(e, t) {
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
    var o = 31 - Vt(n),
      s = 1 << o;
    (t[o] = 0), (r[o] = -1), (e[o] = -1), (n &= ~s);
  }
}
function Qu(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - Vt(n),
      o = 1 << r;
    (o & t) | (e[r] & t) && (e[r] |= t), (n &= ~o);
  }
}
var pe = 0;
function ag(e) {
  return (e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1;
}
var cg,
  Ju,
  ug,
  fg,
  dg,
  Fc = !1,
  ni = [],
  Hn = null,
  Un = null,
  Wn = null,
  ps = new Map(),
  ms = new Map(),
  Fn = [],
  kw =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " "
    );
function Qd(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Hn = null;
      break;
    case "dragenter":
    case "dragleave":
      Un = null;
      break;
    case "mouseover":
    case "mouseout":
      Wn = null;
      break;
    case "pointerover":
    case "pointerout":
      ps.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      ms.delete(t.pointerId);
  }
}
function Bo(e, t, n, r, o, s) {
  return e === null || e.nativeEvent !== s
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: s,
        targetContainers: [o],
      }),
      t !== null && ((t = As(t)), t !== null && Ju(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function _w(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return (Hn = Bo(Hn, e, t, n, r, o)), !0;
    case "dragenter":
      return (Un = Bo(Un, e, t, n, r, o)), !0;
    case "mouseover":
      return (Wn = Bo(Wn, e, t, n, r, o)), !0;
    case "pointerover":
      var s = o.pointerId;
      return ps.set(s, Bo(ps.get(s) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return (
        (s = o.pointerId), ms.set(s, Bo(ms.get(s) || null, e, t, n, r, o)), !0
      );
  }
  return !1;
}
function pg(e) {
  var t = mr(e.target);
  if (t !== null) {
    var n = Tr(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = tg(n)), t !== null)) {
          (e.blockedOn = t),
            dg(e.priority, function () {
              ug(n);
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
function ki(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Mc(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      (Nc = r), n.target.dispatchEvent(r), (Nc = null);
    } else return (t = As(n)), t !== null && Ju(t), (e.blockedOn = n), !1;
    t.shift();
  }
  return !0;
}
function Jd(e, t, n) {
  ki(e) && n.delete(t);
}
function Rw() {
  (Fc = !1),
    Hn !== null && ki(Hn) && (Hn = null),
    Un !== null && ki(Un) && (Un = null),
    Wn !== null && ki(Wn) && (Wn = null),
    ps.forEach(Jd),
    ms.forEach(Jd);
}
function Vo(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Fc ||
      ((Fc = !0),
      xt.unstable_scheduleCallback(xt.unstable_NormalPriority, Rw)));
}
function hs(e) {
  function t(o) {
    return Vo(o, e);
  }
  if (0 < ni.length) {
    Vo(ni[0], e);
    for (var n = 1; n < ni.length; n++) {
      var r = ni[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Hn !== null && Vo(Hn, e),
      Un !== null && Vo(Un, e),
      Wn !== null && Vo(Wn, e),
      ps.forEach(t),
      ms.forEach(t),
      n = 0;
    n < Fn.length;
    n++
  )
    (r = Fn[n]), r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < Fn.length && ((n = Fn[0]), n.blockedOn === null); )
    pg(n), n.blockedOn === null && Fn.shift();
}
var oo = En.ReactCurrentBatchConfig,
  Wi = !0;
function Dw(e, t, n, r) {
  var o = pe,
    s = oo.transition;
  oo.transition = null;
  try {
    (pe = 1), Zu(e, t, n, r);
  } finally {
    (pe = o), (oo.transition = s);
  }
}
function Pw(e, t, n, r) {
  var o = pe,
    s = oo.transition;
  oo.transition = null;
  try {
    (pe = 4), Zu(e, t, n, r);
  } finally {
    (pe = o), (oo.transition = s);
  }
}
function Zu(e, t, n, r) {
  if (Wi) {
    var o = Mc(e, t, n, r);
    if (o === null) Ua(e, t, r, Yi, n), Qd(e, r);
    else if (_w(o, e, t, n, r)) r.stopPropagation();
    else if ((Qd(e, r), t & 4 && -1 < kw.indexOf(e))) {
      for (; o !== null; ) {
        var s = As(o);
        if (
          (s !== null && cg(s),
          (s = Mc(e, t, n, r)),
          s === null && Ua(e, t, r, Yi, n),
          s === o)
        )
          break;
        o = s;
      }
      o !== null && r.stopPropagation();
    } else Ua(e, t, r, null, n);
  }
}
var Yi = null;
function Mc(e, t, n, r) {
  if (((Yi = null), (e = Xu(r)), (e = mr(e)), e !== null))
    if (((t = Tr(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = tg(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return (Yi = e), null;
}
function mg(e) {
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
      switch (gw()) {
        case qu:
          return 1;
        case sg:
          return 4;
        case Hi:
        case yw:
          return 16;
        case ig:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var In = null,
  ef = null,
  _i = null;
function hg() {
  if (_i) return _i;
  var e,
    t = ef,
    n = t.length,
    r,
    o = "value" in In ? In.value : In.textContent,
    s = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === o[s - r]; r++);
  return (_i = o.slice(e, 1 < r ? 1 - r : void 0));
}
function Ri(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function ri() {
  return !0;
}
function Zd() {
  return !1;
}
function Ct(e) {
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
        ? ri
        : Zd),
      (this.isPropagationStopped = Zd),
      this
    );
  }
  return (
    Ee(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = ri));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = ri));
      },
      persist: function () {},
      isPersistent: ri,
    }),
    t
  );
}
var Ro = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  tf = Ct(Ro),
  js = Ee({}, Ro, { view: 0, detail: 0 }),
  Tw = Ct(js),
  ja,
  Aa,
  Ho,
  Dl = Ee({}, js, {
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
    getModifierState: nf,
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
        : (e !== Ho &&
            (Ho && e.type === "mousemove"
              ? ((ja = e.screenX - Ho.screenX), (Aa = e.screenY - Ho.screenY))
              : (Aa = ja = 0),
            (Ho = e)),
          ja);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Aa;
    },
  }),
  ep = Ct(Dl),
  Ow = Ee({}, Dl, { dataTransfer: 0 }),
  Nw = Ct(Ow),
  $w = Ee({}, js, { relatedTarget: 0 }),
  Fa = Ct($w),
  Lw = Ee({}, Ro, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  jw = Ct(Lw),
  Aw = Ee({}, Ro, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Fw = Ct(Aw),
  Mw = Ee({}, Ro, { data: 0 }),
  tp = Ct(Mw),
  zw = {
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
  Iw = {
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
  Bw = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function Vw(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Bw[e]) ? !!t[e] : !1;
}
function nf() {
  return Vw;
}
var Hw = Ee({}, js, {
    key: function (e) {
      if (e.key) {
        var t = zw[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Ri(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
        ? Iw[e.keyCode] || "Unidentified"
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
    getModifierState: nf,
    charCode: function (e) {
      return e.type === "keypress" ? Ri(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Ri(e)
        : e.type === "keydown" || e.type === "keyup"
        ? e.keyCode
        : 0;
    },
  }),
  Uw = Ct(Hw),
  Ww = Ee({}, Dl, {
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
  np = Ct(Ww),
  Yw = Ee({}, js, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: nf,
  }),
  Kw = Ct(Yw),
  Gw = Ee({}, Ro, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Xw = Ct(Gw),
  qw = Ee({}, Dl, {
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
  Qw = Ct(qw),
  Jw = [9, 13, 27, 32],
  rf = wn && "CompositionEvent" in window,
  rs = null;
wn && "documentMode" in document && (rs = document.documentMode);
var Zw = wn && "TextEvent" in window && !rs,
  gg = wn && (!rf || (rs && 8 < rs && 11 >= rs)),
  rp = " ",
  op = !1;
function yg(e, t) {
  switch (e) {
    case "keyup":
      return Jw.indexOf(t.keyCode) !== -1;
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
function vg(e) {
  return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
}
var Hr = !1;
function eS(e, t) {
  switch (e) {
    case "compositionend":
      return vg(t);
    case "keypress":
      return t.which !== 32 ? null : ((op = !0), rp);
    case "textInput":
      return (e = t.data), e === rp && op ? null : e;
    default:
      return null;
  }
}
function tS(e, t) {
  if (Hr)
    return e === "compositionend" || (!rf && yg(e, t))
      ? ((e = hg()), (_i = ef = In = null), (Hr = !1), e)
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
      return gg && t.locale !== "ko" ? null : t.data;
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
function sp(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!nS[e.type] : t === "textarea";
}
function wg(e, t, n, r) {
  qh(r),
    (t = Ki(t, "onChange")),
    0 < t.length &&
      ((n = new tf("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t }));
}
var os = null,
  gs = null;
function rS(e) {
  Tg(e, 0);
}
function Pl(e) {
  var t = Yr(e);
  if (Hh(t)) return e;
}
function oS(e, t) {
  if (e === "change") return t;
}
var Sg = !1;
if (wn) {
  var Ma;
  if (wn) {
    var za = "oninput" in document;
    if (!za) {
      var ip = document.createElement("div");
      ip.setAttribute("oninput", "return;"),
        (za = typeof ip.oninput == "function");
    }
    Ma = za;
  } else Ma = !1;
  Sg = Ma && (!document.documentMode || 9 < document.documentMode);
}
function lp() {
  os && (os.detachEvent("onpropertychange", xg), (gs = os = null));
}
function xg(e) {
  if (e.propertyName === "value" && Pl(gs)) {
    var t = [];
    wg(t, gs, e, Xu(e)), eg(rS, t);
  }
}
function sS(e, t, n) {
  e === "focusin"
    ? (lp(), (os = t), (gs = n), os.attachEvent("onpropertychange", xg))
    : e === "focusout" && lp();
}
function iS(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return Pl(gs);
}
function lS(e, t) {
  if (e === "click") return Pl(t);
}
function aS(e, t) {
  if (e === "input" || e === "change") return Pl(t);
}
function cS(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Wt = typeof Object.is == "function" ? Object.is : cS;
function ys(e, t) {
  if (Wt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!Sc.call(t, o) || !Wt(e[o], t[o])) return !1;
  }
  return !0;
}
function ap(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function cp(e, t) {
  var n = ap(e);
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
    n = ap(n);
  }
}
function bg(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
      ? !1
      : t && t.nodeType === 3
      ? bg(e, t.parentNode)
      : "contains" in e
      ? e.contains(t)
      : e.compareDocumentPosition
      ? !!(e.compareDocumentPosition(t) & 16)
      : !1
    : !1;
}
function Cg() {
  for (var e = window, t = Ii(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Ii(e.document);
  }
  return t;
}
function of(e) {
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
  var t = Cg(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    bg(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && of(n)) {
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
          (o = cp(n, s));
        var i = cp(n, r);
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
var fS = wn && "documentMode" in document && 11 >= document.documentMode,
  Ur = null,
  zc = null,
  ss = null,
  Ic = !1;
function up(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Ic ||
    Ur == null ||
    Ur !== Ii(r) ||
    ((r = Ur),
    "selectionStart" in r && of(r)
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
    (ss && ys(ss, r)) ||
      ((ss = r),
      (r = Ki(zc, "onSelect")),
      0 < r.length &&
        ((t = new tf("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Ur))));
}
function oi(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Wr = {
    animationend: oi("Animation", "AnimationEnd"),
    animationiteration: oi("Animation", "AnimationIteration"),
    animationstart: oi("Animation", "AnimationStart"),
    transitionend: oi("Transition", "TransitionEnd"),
  },
  Ia = {},
  Eg = {};
wn &&
  ((Eg = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Wr.animationend.animation,
    delete Wr.animationiteration.animation,
    delete Wr.animationstart.animation),
  "TransitionEvent" in window || delete Wr.transitionend.transition);
function Tl(e) {
  if (Ia[e]) return Ia[e];
  if (!Wr[e]) return e;
  var t = Wr[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Eg) return (Ia[e] = t[n]);
  return e;
}
var kg = Tl("animationend"),
  _g = Tl("animationiteration"),
  Rg = Tl("animationstart"),
  Dg = Tl("transitionend"),
  Pg = new Map(),
  fp =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
function tr(e, t) {
  Pg.set(e, t), Pr(t, [e]);
}
for (var Ba = 0; Ba < fp.length; Ba++) {
  var Va = fp[Ba],
    dS = Va.toLowerCase(),
    pS = Va[0].toUpperCase() + Va.slice(1);
  tr(dS, "on" + pS);
}
tr(kg, "onAnimationEnd");
tr(_g, "onAnimationIteration");
tr(Rg, "onAnimationStart");
tr("dblclick", "onDoubleClick");
tr("focusin", "onFocus");
tr("focusout", "onBlur");
tr(Dg, "onTransitionEnd");
fo("onMouseEnter", ["mouseout", "mouseover"]);
fo("onMouseLeave", ["mouseout", "mouseover"]);
fo("onPointerEnter", ["pointerout", "pointerover"]);
fo("onPointerLeave", ["pointerout", "pointerover"]);
Pr(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
Pr(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
Pr("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Pr(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
Pr(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
Pr(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var es =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ),
  mS = new Set("cancel close invalid load scroll toggle".split(" ").concat(es));
function dp(e, t, n) {
  var r = e.type || "unknown-event";
  (e.currentTarget = n), dw(r, t, void 0, e), (e.currentTarget = null);
}
function Tg(e, t) {
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
          dp(o, l, c), (s = a);
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
          dp(o, l, c), (s = a);
        }
    }
  }
  if (Vi) throw ((e = jc), (Vi = !1), (jc = null), e);
}
function ve(e, t) {
  var n = t[Wc];
  n === void 0 && (n = t[Wc] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Og(t, e, 2, !1), n.add(r));
}
function Ha(e, t, n) {
  var r = 0;
  t && (r |= 4), Og(n, e, r, t);
}
var si = "_reactListening" + Math.random().toString(36).slice(2);
function vs(e) {
  if (!e[si]) {
    (e[si] = !0),
      Mh.forEach(function (n) {
        n !== "selectionchange" && (mS.has(n) || Ha(n, !1, e), Ha(n, !0, e));
      });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[si] || ((t[si] = !0), Ha("selectionchange", !1, t));
  }
}
function Og(e, t, n, r) {
  switch (mg(t)) {
    case 1:
      var o = Dw;
      break;
    case 4:
      o = Pw;
      break;
    default:
      o = Zu;
  }
  (n = o.bind(null, t, n, e)),
    (o = void 0),
    !Lc ||
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
function Ua(e, t, n, r, o) {
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
          if (((i = mr(l)), i === null)) return;
          if (((a = i.tag), a === 5 || a === 6)) {
            r = s = i;
            continue e;
          }
          l = l.parentNode;
        }
      }
      r = r.return;
    }
  eg(function () {
    var c = s,
      u = Xu(n),
      f = [];
    e: {
      var d = Pg.get(e);
      if (d !== void 0) {
        var m = tf,
          p = e;
        switch (e) {
          case "keypress":
            if (Ri(n) === 0) break e;
          case "keydown":
          case "keyup":
            m = Uw;
            break;
          case "focusin":
            (p = "focus"), (m = Fa);
            break;
          case "focusout":
            (p = "blur"), (m = Fa);
            break;
          case "beforeblur":
          case "afterblur":
            m = Fa;
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
            m = ep;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            m = Nw;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            m = Kw;
            break;
          case kg:
          case _g:
          case Rg:
            m = jw;
            break;
          case Dg:
            m = Xw;
            break;
          case "scroll":
            m = Tw;
            break;
          case "wheel":
            m = Qw;
            break;
          case "copy":
          case "cut":
          case "paste":
            m = Fw;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            m = np;
        }
        var h = (t & 4) !== 0,
          S = !h && e === "scroll",
          v = h ? (d !== null ? d + "Capture" : null) : d;
        h = [];
        for (var g = c, y; g !== null; ) {
          y = g;
          var b = y.stateNode;
          if (
            (y.tag === 5 &&
              b !== null &&
              ((y = b),
              v !== null && ((b = ds(g, v)), b != null && h.push(ws(g, b, y)))),
            S)
          )
            break;
          g = g.return;
        }
        0 < h.length &&
          ((d = new m(d, p, null, n, u)), f.push({ event: d, listeners: h }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((d = e === "mouseover" || e === "pointerover"),
          (m = e === "mouseout" || e === "pointerout"),
          d &&
            n !== Nc &&
            (p = n.relatedTarget || n.fromElement) &&
            (mr(p) || p[Sn]))
        )
          break e;
        if (
          (m || d) &&
          ((d =
            u.window === u
              ? u
              : (d = u.ownerDocument)
              ? d.defaultView || d.parentWindow
              : window),
          m
            ? ((p = n.relatedTarget || n.toElement),
              (m = c),
              (p = p ? mr(p) : null),
              p !== null &&
                ((S = Tr(p)), p !== S || (p.tag !== 5 && p.tag !== 6)) &&
                (p = null))
            : ((m = null), (p = c)),
          m !== p)
        ) {
          if (
            ((h = ep),
            (b = "onMouseLeave"),
            (v = "onMouseEnter"),
            (g = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((h = np),
              (b = "onPointerLeave"),
              (v = "onPointerEnter"),
              (g = "pointer")),
            (S = m == null ? d : Yr(m)),
            (y = p == null ? d : Yr(p)),
            (d = new h(b, g + "leave", m, n, u)),
            (d.target = S),
            (d.relatedTarget = y),
            (b = null),
            mr(u) === c &&
              ((h = new h(v, g + "enter", p, n, u)),
              (h.target = y),
              (h.relatedTarget = S),
              (b = h)),
            (S = b),
            m && p)
          )
            t: {
              for (h = m, v = p, g = 0, y = h; y; y = jr(y)) g++;
              for (y = 0, b = v; b; b = jr(b)) y++;
              for (; 0 < g - y; ) (h = jr(h)), g--;
              for (; 0 < y - g; ) (v = jr(v)), y--;
              for (; g--; ) {
                if (h === v || (v !== null && h === v.alternate)) break t;
                (h = jr(h)), (v = jr(v));
              }
              h = null;
            }
          else h = null;
          m !== null && pp(f, d, m, h, !1),
            p !== null && S !== null && pp(f, S, p, h, !0);
        }
      }
      e: {
        if (
          ((d = c ? Yr(c) : window),
          (m = d.nodeName && d.nodeName.toLowerCase()),
          m === "select" || (m === "input" && d.type === "file"))
        )
          var C = oS;
        else if (sp(d))
          if (Sg) C = aS;
          else {
            C = iS;
            var E = sS;
          }
        else
          (m = d.nodeName) &&
            m.toLowerCase() === "input" &&
            (d.type === "checkbox" || d.type === "radio") &&
            (C = lS);
        if (C && (C = C(e, c))) {
          wg(f, C, n, u);
          break e;
        }
        E && E(e, d, c),
          e === "focusout" &&
            (E = d._wrapperState) &&
            E.controlled &&
            d.type === "number" &&
            Rc(d, "number", d.value);
      }
      switch (((E = c ? Yr(c) : window), e)) {
        case "focusin":
          (sp(E) || E.contentEditable === "true") &&
            ((Ur = E), (zc = c), (ss = null));
          break;
        case "focusout":
          ss = zc = Ur = null;
          break;
        case "mousedown":
          Ic = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          (Ic = !1), up(f, n, u);
          break;
        case "selectionchange":
          if (fS) break;
        case "keydown":
        case "keyup":
          up(f, n, u);
      }
      var R;
      if (rf)
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
        Hr
          ? yg(e, n) && (D = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (D = "onCompositionStart");
      D &&
        (gg &&
          n.locale !== "ko" &&
          (Hr || D !== "onCompositionStart"
            ? D === "onCompositionEnd" && Hr && (R = hg())
            : ((In = u),
              (ef = "value" in In ? In.value : In.textContent),
              (Hr = !0))),
        (E = Ki(c, D)),
        0 < E.length &&
          ((D = new tp(D, e, null, n, u)),
          f.push({ event: D, listeners: E }),
          R ? (D.data = R) : ((R = vg(n)), R !== null && (D.data = R)))),
        (R = Zw ? eS(e, n) : tS(e, n)) &&
          ((c = Ki(c, "onBeforeInput")),
          0 < c.length &&
            ((u = new tp("onBeforeInput", "beforeinput", null, n, u)),
            f.push({ event: u, listeners: c }),
            (u.data = R)));
    }
    Tg(f, t);
  });
}
function ws(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Ki(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e,
      s = o.stateNode;
    o.tag === 5 &&
      s !== null &&
      ((o = s),
      (s = ds(e, n)),
      s != null && r.unshift(ws(e, s, o)),
      (s = ds(e, t)),
      s != null && r.push(ws(e, s, o))),
      (e = e.return);
  }
  return r;
}
function jr(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function pp(e, t, n, r, o) {
  for (var s = t._reactName, i = []; n !== null && n !== r; ) {
    var l = n,
      a = l.alternate,
      c = l.stateNode;
    if (a !== null && a === r) break;
    l.tag === 5 &&
      c !== null &&
      ((l = c),
      o
        ? ((a = ds(n, s)), a != null && i.unshift(ws(n, a, l)))
        : o || ((a = ds(n, s)), a != null && i.push(ws(n, a, l)))),
      (n = n.return);
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var hS = /\r\n?/g,
  gS = /\u0000|\uFFFD/g;
function mp(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      hS,
      `
`
    )
    .replace(gS, "");
}
function ii(e, t, n) {
  if (((t = mp(t)), mp(e) !== t && n)) throw Error(V(425));
}
function Gi() {}
var Bc = null,
  Vc = null;
function Hc(e, t) {
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
var Uc = typeof setTimeout == "function" ? setTimeout : void 0,
  yS = typeof clearTimeout == "function" ? clearTimeout : void 0,
  hp = typeof Promise == "function" ? Promise : void 0,
  vS =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof hp < "u"
      ? function (e) {
          return hp.resolve(null).then(e).catch(wS);
        }
      : Uc;
function wS(e) {
  setTimeout(function () {
    throw e;
  });
}
function Wa(e, t) {
  var n = t,
    r = 0;
  do {
    var o = n.nextSibling;
    if ((e.removeChild(n), o && o.nodeType === 8))
      if (((n = o.data), n === "/$")) {
        if (r === 0) {
          e.removeChild(o), hs(t);
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = o;
  } while (n);
  hs(t);
}
function Yn(e) {
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
function gp(e) {
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
var Do = Math.random().toString(36).slice(2),
  rn = "__reactFiber$" + Do,
  Ss = "__reactProps$" + Do,
  Sn = "__reactContainer$" + Do,
  Wc = "__reactEvents$" + Do,
  SS = "__reactListeners$" + Do,
  xS = "__reactHandles$" + Do;
function mr(e) {
  var t = e[rn];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[Sn] || n[rn])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = gp(e); e !== null; ) {
          if ((n = e[rn])) return n;
          e = gp(e);
        }
      return t;
    }
    (e = n), (n = e.parentNode);
  }
  return null;
}
function As(e) {
  return (
    (e = e[rn] || e[Sn]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function Yr(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(V(33));
}
function Ol(e) {
  return e[Ss] || null;
}
var Yc = [],
  Kr = -1;
function nr(e) {
  return { current: e };
}
function we(e) {
  0 > Kr || ((e.current = Yc[Kr]), (Yc[Kr] = null), Kr--);
}
function ge(e, t) {
  Kr++, (Yc[Kr] = e.current), (e.current = t);
}
var Jn = {},
  Xe = nr(Jn),
  ut = nr(!1),
  xr = Jn;
function po(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Jn;
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
function ft(e) {
  return (e = e.childContextTypes), e != null;
}
function Xi() {
  we(ut), we(Xe);
}
function yp(e, t, n) {
  if (Xe.current !== Jn) throw Error(V(168));
  ge(Xe, t), ge(ut, n);
}
function Ng(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(V(108, sw(e) || "Unknown", o));
  return Ee({}, n, r);
}
function qi(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Jn),
    (xr = Xe.current),
    ge(Xe, e),
    ge(ut, ut.current),
    !0
  );
}
function vp(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(V(169));
  n
    ? ((e = Ng(e, t, xr)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      we(ut),
      we(Xe),
      ge(Xe, e))
    : we(ut),
    ge(ut, n);
}
var mn = null,
  Nl = !1,
  Ya = !1;
function $g(e) {
  mn === null ? (mn = [e]) : mn.push(e);
}
function bS(e) {
  (Nl = !0), $g(e);
}
function rr() {
  if (!Ya && mn !== null) {
    Ya = !0;
    var e = 0,
      t = pe;
    try {
      var n = mn;
      for (pe = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      (mn = null), (Nl = !1);
    } catch (o) {
      throw (mn !== null && (mn = mn.slice(e + 1)), og(qu, rr), o);
    } finally {
      (pe = t), (Ya = !1);
    }
  }
  return null;
}
var Gr = [],
  Xr = 0,
  Qi = null,
  Ji = 0,
  Et = [],
  kt = 0,
  br = null,
  hn = 1,
  gn = "";
function ur(e, t) {
  (Gr[Xr++] = Ji), (Gr[Xr++] = Qi), (Qi = e), (Ji = t);
}
function Lg(e, t, n) {
  (Et[kt++] = hn), (Et[kt++] = gn), (Et[kt++] = br), (br = e);
  var r = hn;
  e = gn;
  var o = 32 - Vt(r) - 1;
  (r &= ~(1 << o)), (n += 1);
  var s = 32 - Vt(t) + o;
  if (30 < s) {
    var i = o - (o % 5);
    (s = (r & ((1 << i) - 1)).toString(32)),
      (r >>= i),
      (o -= i),
      (hn = (1 << (32 - Vt(t) + o)) | (n << o) | r),
      (gn = s + e);
  } else (hn = (1 << s) | (n << o) | r), (gn = e);
}
function sf(e) {
  e.return !== null && (ur(e, 1), Lg(e, 1, 0));
}
function lf(e) {
  for (; e === Qi; )
    (Qi = Gr[--Xr]), (Gr[Xr] = null), (Ji = Gr[--Xr]), (Gr[Xr] = null);
  for (; e === br; )
    (br = Et[--kt]),
      (Et[kt] = null),
      (gn = Et[--kt]),
      (Et[kt] = null),
      (hn = Et[--kt]),
      (Et[kt] = null);
}
var wt = null,
  vt = null,
  Se = !1,
  It = null;
function jg(e, t) {
  var n = _t(5, null, null, 0);
  (n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n);
}
function wp(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t =
          t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase()
            ? null
            : t),
        t !== null
          ? ((e.stateNode = t), (wt = e), (vt = Yn(t.firstChild)), !0)
          : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (wt = e), (vt = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = br !== null ? { id: hn, overflow: gn } : null),
            (e.memoizedState = {
              dehydrated: t,
              treeContext: n,
              retryLane: 1073741824,
            }),
            (n = _t(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (wt = e),
            (vt = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function Kc(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Gc(e) {
  if (Se) {
    var t = vt;
    if (t) {
      var n = t;
      if (!wp(e, t)) {
        if (Kc(e)) throw Error(V(418));
        t = Yn(n.nextSibling);
        var r = wt;
        t && wp(e, t)
          ? jg(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (Se = !1), (wt = e));
      }
    } else {
      if (Kc(e)) throw Error(V(418));
      (e.flags = (e.flags & -4097) | 2), (Se = !1), (wt = e);
    }
  }
}
function Sp(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  wt = e;
}
function li(e) {
  if (e !== wt) return !1;
  if (!Se) return Sp(e), (Se = !0), !1;
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !Hc(e.type, e.memoizedProps))),
    t && (t = vt))
  ) {
    if (Kc(e)) throw (Ag(), Error(V(418)));
    for (; t; ) jg(e, t), (t = Yn(t.nextSibling));
  }
  if ((Sp(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(V(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              vt = Yn(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      vt = null;
    }
  } else vt = wt ? Yn(e.stateNode.nextSibling) : null;
  return !0;
}
function Ag() {
  for (var e = vt; e; ) e = Yn(e.nextSibling);
}
function mo() {
  (vt = wt = null), (Se = !1);
}
function af(e) {
  It === null ? (It = [e]) : It.push(e);
}
var CS = En.ReactCurrentBatchConfig;
function Uo(e, t, n) {
  if (
    ((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")
  ) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(V(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(V(147, e));
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
    if (typeof e != "string") throw Error(V(284));
    if (!n._owner) throw Error(V(290, e));
  }
  return e;
}
function ai(e, t) {
  throw (
    ((e = Object.prototype.toString.call(t)),
    Error(
      V(
        31,
        e === "[object Object]"
          ? "object with keys {" + Object.keys(t).join(", ") + "}"
          : e
      )
    ))
  );
}
function xp(e) {
  var t = e._init;
  return t(e._payload);
}
function Fg(e) {
  function t(v, g) {
    if (e) {
      var y = v.deletions;
      y === null ? ((v.deletions = [g]), (v.flags |= 16)) : y.push(g);
    }
  }
  function n(v, g) {
    if (!e) return null;
    for (; g !== null; ) t(v, g), (g = g.sibling);
    return null;
  }
  function r(v, g) {
    for (v = new Map(); g !== null; )
      g.key !== null ? v.set(g.key, g) : v.set(g.index, g), (g = g.sibling);
    return v;
  }
  function o(v, g) {
    return (v = qn(v, g)), (v.index = 0), (v.sibling = null), v;
  }
  function s(v, g, y) {
    return (
      (v.index = y),
      e
        ? ((y = v.alternate),
          y !== null
            ? ((y = y.index), y < g ? ((v.flags |= 2), g) : y)
            : ((v.flags |= 2), g))
        : ((v.flags |= 1048576), g)
    );
  }
  function i(v) {
    return e && v.alternate === null && (v.flags |= 2), v;
  }
  function l(v, g, y, b) {
    return g === null || g.tag !== 6
      ? ((g = Za(y, v.mode, b)), (g.return = v), g)
      : ((g = o(g, y)), (g.return = v), g);
  }
  function a(v, g, y, b) {
    var C = y.type;
    return C === Vr
      ? u(v, g, y.props.children, b, y.key)
      : g !== null &&
        (g.elementType === C ||
          (typeof C == "object" &&
            C !== null &&
            C.$$typeof === Ln &&
            xp(C) === g.type))
      ? ((b = o(g, y.props)), (b.ref = Uo(v, g, y)), (b.return = v), b)
      : ((b = Li(y.type, y.key, y.props, null, v.mode, b)),
        (b.ref = Uo(v, g, y)),
        (b.return = v),
        b);
  }
  function c(v, g, y, b) {
    return g === null ||
      g.tag !== 4 ||
      g.stateNode.containerInfo !== y.containerInfo ||
      g.stateNode.implementation !== y.implementation
      ? ((g = ec(y, v.mode, b)), (g.return = v), g)
      : ((g = o(g, y.children || [])), (g.return = v), g);
  }
  function u(v, g, y, b, C) {
    return g === null || g.tag !== 7
      ? ((g = vr(y, v.mode, b, C)), (g.return = v), g)
      : ((g = o(g, y)), (g.return = v), g);
  }
  function f(v, g, y) {
    if ((typeof g == "string" && g !== "") || typeof g == "number")
      return (g = Za("" + g, v.mode, y)), (g.return = v), g;
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Qs:
          return (
            (y = Li(g.type, g.key, g.props, null, v.mode, y)),
            (y.ref = Uo(v, null, g)),
            (y.return = v),
            y
          );
        case Br:
          return (g = ec(g, v.mode, y)), (g.return = v), g;
        case Ln:
          var b = g._init;
          return f(v, b(g._payload), y);
      }
      if (Jo(g) || zo(g))
        return (g = vr(g, v.mode, y, null)), (g.return = v), g;
      ai(v, g);
    }
    return null;
  }
  function d(v, g, y, b) {
    var C = g !== null ? g.key : null;
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return C !== null ? null : l(v, g, "" + y, b);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Qs:
          return y.key === C ? a(v, g, y, b) : null;
        case Br:
          return y.key === C ? c(v, g, y, b) : null;
        case Ln:
          return (C = y._init), d(v, g, C(y._payload), b);
      }
      if (Jo(y) || zo(y)) return C !== null ? null : u(v, g, y, b, null);
      ai(v, y);
    }
    return null;
  }
  function m(v, g, y, b, C) {
    if ((typeof b == "string" && b !== "") || typeof b == "number")
      return (v = v.get(y) || null), l(g, v, "" + b, C);
    if (typeof b == "object" && b !== null) {
      switch (b.$$typeof) {
        case Qs:
          return (v = v.get(b.key === null ? y : b.key) || null), a(g, v, b, C);
        case Br:
          return (v = v.get(b.key === null ? y : b.key) || null), c(g, v, b, C);
        case Ln:
          var E = b._init;
          return m(v, g, y, E(b._payload), C);
      }
      if (Jo(b) || zo(b)) return (v = v.get(y) || null), u(g, v, b, C, null);
      ai(g, b);
    }
    return null;
  }
  function p(v, g, y, b) {
    for (
      var C = null, E = null, R = g, D = (g = 0), j = null;
      R !== null && D < y.length;
      D++
    ) {
      R.index > D ? ((j = R), (R = null)) : (j = R.sibling);
      var T = d(v, R, y[D], b);
      if (T === null) {
        R === null && (R = j);
        break;
      }
      e && R && T.alternate === null && t(v, R),
        (g = s(T, g, D)),
        E === null ? (C = T) : (E.sibling = T),
        (E = T),
        (R = j);
    }
    if (D === y.length) return n(v, R), Se && ur(v, D), C;
    if (R === null) {
      for (; D < y.length; D++)
        (R = f(v, y[D], b)),
          R !== null &&
            ((g = s(R, g, D)), E === null ? (C = R) : (E.sibling = R), (E = R));
      return Se && ur(v, D), C;
    }
    for (R = r(v, R); D < y.length; D++)
      (j = m(R, v, D, y[D], b)),
        j !== null &&
          (e && j.alternate !== null && R.delete(j.key === null ? D : j.key),
          (g = s(j, g, D)),
          E === null ? (C = j) : (E.sibling = j),
          (E = j));
    return (
      e &&
        R.forEach(function (M) {
          return t(v, M);
        }),
      Se && ur(v, D),
      C
    );
  }
  function h(v, g, y, b) {
    var C = zo(y);
    if (typeof C != "function") throw Error(V(150));
    if (((y = C.call(y)), y == null)) throw Error(V(151));
    for (
      var E = (C = null), R = g, D = (g = 0), j = null, T = y.next();
      R !== null && !T.done;
      D++, T = y.next()
    ) {
      R.index > D ? ((j = R), (R = null)) : (j = R.sibling);
      var M = d(v, R, T.value, b);
      if (M === null) {
        R === null && (R = j);
        break;
      }
      e && R && M.alternate === null && t(v, R),
        (g = s(M, g, D)),
        E === null ? (C = M) : (E.sibling = M),
        (E = M),
        (R = j);
    }
    if (T.done) return n(v, R), Se && ur(v, D), C;
    if (R === null) {
      for (; !T.done; D++, T = y.next())
        (T = f(v, T.value, b)),
          T !== null &&
            ((g = s(T, g, D)), E === null ? (C = T) : (E.sibling = T), (E = T));
      return Se && ur(v, D), C;
    }
    for (R = r(v, R); !T.done; D++, T = y.next())
      (T = m(R, v, D, T.value, b)),
        T !== null &&
          (e && T.alternate !== null && R.delete(T.key === null ? D : T.key),
          (g = s(T, g, D)),
          E === null ? (C = T) : (E.sibling = T),
          (E = T));
    return (
      e &&
        R.forEach(function (B) {
          return t(v, B);
        }),
      Se && ur(v, D),
      C
    );
  }
  function S(v, g, y, b) {
    if (
      (typeof y == "object" &&
        y !== null &&
        y.type === Vr &&
        y.key === null &&
        (y = y.props.children),
      typeof y == "object" && y !== null)
    ) {
      switch (y.$$typeof) {
        case Qs:
          e: {
            for (var C = y.key, E = g; E !== null; ) {
              if (E.key === C) {
                if (((C = y.type), C === Vr)) {
                  if (E.tag === 7) {
                    n(v, E.sibling),
                      (g = o(E, y.props.children)),
                      (g.return = v),
                      (v = g);
                    break e;
                  }
                } else if (
                  E.elementType === C ||
                  (typeof C == "object" &&
                    C !== null &&
                    C.$$typeof === Ln &&
                    xp(C) === E.type)
                ) {
                  n(v, E.sibling),
                    (g = o(E, y.props)),
                    (g.ref = Uo(v, E, y)),
                    (g.return = v),
                    (v = g);
                  break e;
                }
                n(v, E);
                break;
              } else t(v, E);
              E = E.sibling;
            }
            y.type === Vr
              ? ((g = vr(y.props.children, v.mode, b, y.key)),
                (g.return = v),
                (v = g))
              : ((b = Li(y.type, y.key, y.props, null, v.mode, b)),
                (b.ref = Uo(v, g, y)),
                (b.return = v),
                (v = b));
          }
          return i(v);
        case Br:
          e: {
            for (E = y.key; g !== null; ) {
              if (g.key === E)
                if (
                  g.tag === 4 &&
                  g.stateNode.containerInfo === y.containerInfo &&
                  g.stateNode.implementation === y.implementation
                ) {
                  n(v, g.sibling),
                    (g = o(g, y.children || [])),
                    (g.return = v),
                    (v = g);
                  break e;
                } else {
                  n(v, g);
                  break;
                }
              else t(v, g);
              g = g.sibling;
            }
            (g = ec(y, v.mode, b)), (g.return = v), (v = g);
          }
          return i(v);
        case Ln:
          return (E = y._init), S(v, g, E(y._payload), b);
      }
      if (Jo(y)) return p(v, g, y, b);
      if (zo(y)) return h(v, g, y, b);
      ai(v, y);
    }
    return (typeof y == "string" && y !== "") || typeof y == "number"
      ? ((y = "" + y),
        g !== null && g.tag === 6
          ? (n(v, g.sibling), (g = o(g, y)), (g.return = v), (v = g))
          : (n(v, g), (g = Za(y, v.mode, b)), (g.return = v), (v = g)),
        i(v))
      : n(v, g);
  }
  return S;
}
var ho = Fg(!0),
  Mg = Fg(!1),
  Zi = nr(null),
  el = null,
  qr = null,
  cf = null;
function uf() {
  cf = qr = el = null;
}
function ff(e) {
  var t = Zi.current;
  we(Zi), (e._currentValue = t);
}
function Xc(e, t, n) {
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
function so(e, t) {
  (el = e),
    (cf = qr = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (lt = !0), (e.firstContext = null));
}
function Pt(e) {
  var t = e._currentValue;
  if (cf !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), qr === null)) {
      if (el === null) throw Error(V(308));
      (qr = e), (el.dependencies = { lanes: 0, firstContext: e });
    } else qr = qr.next = e;
  return t;
}
var hr = null;
function df(e) {
  hr === null ? (hr = [e]) : hr.push(e);
}
function zg(e, t, n, r) {
  var o = t.interleaved;
  return (
    o === null ? ((n.next = n), df(t)) : ((n.next = o.next), (o.next = n)),
    (t.interleaved = n),
    xn(e, r)
  );
}
function xn(e, t) {
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
var jn = !1;
function pf(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Ig(e, t) {
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
function yn(e, t) {
  return {
    eventTime: e,
    lane: t,
    tag: 0,
    payload: null,
    callback: null,
    next: null,
  };
}
function Kn(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), fe & 2)) {
    var o = r.pending;
    return (
      o === null ? (t.next = t) : ((t.next = o.next), (o.next = t)),
      (r.pending = t),
      xn(e, n)
    );
  }
  return (
    (o = r.interleaved),
    o === null ? ((t.next = t), df(r)) : ((t.next = o.next), (o.next = t)),
    (r.interleaved = t),
    xn(e, n)
  );
}
function Di(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Qu(e, n);
  }
}
function bp(e, t) {
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
function tl(e, t, n, r) {
  var o = e.updateQueue;
  jn = !1;
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
    var f = o.baseState;
    (i = 0), (u = c = a = null), (l = s);
    do {
      var d = l.lane,
        m = l.eventTime;
      if ((r & d) === d) {
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
          switch (((d = t), (m = n), h.tag)) {
            case 1:
              if (((p = h.payload), typeof p == "function")) {
                f = p.call(m, f, d);
                break e;
              }
              f = p;
              break e;
            case 3:
              p.flags = (p.flags & -65537) | 128;
            case 0:
              if (
                ((p = h.payload),
                (d = typeof p == "function" ? p.call(m, f, d) : p),
                d == null)
              )
                break e;
              f = Ee({}, f, d);
              break e;
            case 2:
              jn = !0;
          }
        }
        l.callback !== null &&
          l.lane !== 0 &&
          ((e.flags |= 64),
          (d = o.effects),
          d === null ? (o.effects = [l]) : d.push(l));
      } else
        (m = {
          eventTime: m,
          lane: d,
          tag: l.tag,
          payload: l.payload,
          callback: l.callback,
          next: null,
        }),
          u === null ? ((c = u = m), (a = f)) : (u = u.next = m),
          (i |= d);
      if (((l = l.next), l === null)) {
        if (((l = o.shared.pending), l === null)) break;
        (d = l),
          (l = d.next),
          (d.next = null),
          (o.lastBaseUpdate = d),
          (o.shared.pending = null);
      }
    } while (!0);
    if (
      (u === null && (a = f),
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
    (Er |= i), (e.lanes = i), (e.memoizedState = f);
  }
}
function Cp(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        o = r.callback;
      if (o !== null) {
        if (((r.callback = null), (r = n), typeof o != "function"))
          throw Error(V(191, o));
        o.call(r);
      }
    }
}
var Fs = {},
  ln = nr(Fs),
  xs = nr(Fs),
  bs = nr(Fs);
function gr(e) {
  if (e === Fs) throw Error(V(174));
  return e;
}
function mf(e, t) {
  switch ((ge(bs, t), ge(xs, e), ge(ln, Fs), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Pc(null, "");
      break;
    default:
      (e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = Pc(t, e));
  }
  we(ln), ge(ln, t);
}
function go() {
  we(ln), we(xs), we(bs);
}
function Bg(e) {
  gr(bs.current);
  var t = gr(ln.current),
    n = Pc(t, e.type);
  t !== n && (ge(xs, e), ge(ln, n));
}
function hf(e) {
  xs.current === e && (we(ln), we(xs));
}
var be = nr(0);
function nl(e) {
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
var Ka = [];
function gf() {
  for (var e = 0; e < Ka.length; e++)
    Ka[e]._workInProgressVersionPrimary = null;
  Ka.length = 0;
}
var Pi = En.ReactCurrentDispatcher,
  Ga = En.ReactCurrentBatchConfig,
  Cr = 0,
  Ce = null,
  $e = null,
  Fe = null,
  rl = !1,
  is = !1,
  Cs = 0,
  ES = 0;
function We() {
  throw Error(V(321));
}
function yf(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!Wt(e[n], t[n])) return !1;
  return !0;
}
function vf(e, t, n, r, o, s) {
  if (
    ((Cr = s),
    (Ce = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Pi.current = e === null || e.memoizedState === null ? DS : PS),
    (e = n(r, o)),
    is)
  ) {
    s = 0;
    do {
      if (((is = !1), (Cs = 0), 25 <= s)) throw Error(V(301));
      (s += 1),
        (Fe = $e = null),
        (t.updateQueue = null),
        (Pi.current = TS),
        (e = n(r, o));
    } while (is);
  }
  if (
    ((Pi.current = ol),
    (t = $e !== null && $e.next !== null),
    (Cr = 0),
    (Fe = $e = Ce = null),
    (rl = !1),
    t)
  )
    throw Error(V(300));
  return e;
}
function wf() {
  var e = Cs !== 0;
  return (Cs = 0), e;
}
function en() {
  var e = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  return Fe === null ? (Ce.memoizedState = Fe = e) : (Fe = Fe.next = e), Fe;
}
function Tt() {
  if ($e === null) {
    var e = Ce.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = $e.next;
  var t = Fe === null ? Ce.memoizedState : Fe.next;
  if (t !== null) (Fe = t), ($e = e);
  else {
    if (e === null) throw Error(V(310));
    ($e = e),
      (e = {
        memoizedState: $e.memoizedState,
        baseState: $e.baseState,
        baseQueue: $e.baseQueue,
        queue: $e.queue,
        next: null,
      }),
      Fe === null ? (Ce.memoizedState = Fe = e) : (Fe = Fe.next = e);
  }
  return Fe;
}
function Es(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Xa(e) {
  var t = Tt(),
    n = t.queue;
  if (n === null) throw Error(V(311));
  n.lastRenderedReducer = e;
  var r = $e,
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
      if ((Cr & u) === u)
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
        var f = {
          lane: u,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        };
        a === null ? ((l = a = f), (i = r)) : (a = a.next = f),
          (Ce.lanes |= u),
          (Er |= u);
      }
      c = c.next;
    } while (c !== null && c !== s);
    a === null ? (i = r) : (a.next = l),
      Wt(r, t.memoizedState) || (lt = !0),
      (t.memoizedState = r),
      (t.baseState = i),
      (t.baseQueue = a),
      (n.lastRenderedState = r);
  }
  if (((e = n.interleaved), e !== null)) {
    o = e;
    do (s = o.lane), (Ce.lanes |= s), (Er |= s), (o = o.next);
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function qa(e) {
  var t = Tt(),
    n = t.queue;
  if (n === null) throw Error(V(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    o = n.pending,
    s = t.memoizedState;
  if (o !== null) {
    n.pending = null;
    var i = (o = o.next);
    do (s = e(s, i.action)), (i = i.next);
    while (i !== o);
    Wt(s, t.memoizedState) || (lt = !0),
      (t.memoizedState = s),
      t.baseQueue === null && (t.baseState = s),
      (n.lastRenderedState = s);
  }
  return [s, r];
}
function Vg() {}
function Hg(e, t) {
  var n = Ce,
    r = Tt(),
    o = t(),
    s = !Wt(r.memoizedState, o);
  if (
    (s && ((r.memoizedState = o), (lt = !0)),
    (r = r.queue),
    Sf(Yg.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || s || (Fe !== null && Fe.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      ks(9, Wg.bind(null, n, r, o, t), void 0, null),
      Me === null)
    )
      throw Error(V(349));
    Cr & 30 || Ug(n, t, o);
  }
  return o;
}
function Ug(e, t, n) {
  (e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = Ce.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (Ce.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e));
}
function Wg(e, t, n, r) {
  (t.value = n), (t.getSnapshot = r), Kg(t) && Gg(e);
}
function Yg(e, t, n) {
  return n(function () {
    Kg(t) && Gg(e);
  });
}
function Kg(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Wt(e, n);
  } catch {
    return !0;
  }
}
function Gg(e) {
  var t = xn(e, 1);
  t !== null && Ht(t, e, 1, -1);
}
function Ep(e) {
  var t = en();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Es,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = RS.bind(null, Ce, e)),
    [t.memoizedState, e]
  );
}
function ks(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = Ce.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (Ce.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function Xg() {
  return Tt().memoizedState;
}
function Ti(e, t, n, r) {
  var o = en();
  (Ce.flags |= e),
    (o.memoizedState = ks(1 | t, n, void 0, r === void 0 ? null : r));
}
function $l(e, t, n, r) {
  var o = Tt();
  r = r === void 0 ? null : r;
  var s = void 0;
  if ($e !== null) {
    var i = $e.memoizedState;
    if (((s = i.destroy), r !== null && yf(r, i.deps))) {
      o.memoizedState = ks(t, n, s, r);
      return;
    }
  }
  (Ce.flags |= e), (o.memoizedState = ks(1 | t, n, s, r));
}
function kp(e, t) {
  return Ti(8390656, 8, e, t);
}
function Sf(e, t) {
  return $l(2048, 8, e, t);
}
function qg(e, t) {
  return $l(4, 2, e, t);
}
function Qg(e, t) {
  return $l(4, 4, e, t);
}
function Jg(e, t) {
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
function Zg(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null), $l(4, 4, Jg.bind(null, t, e), n)
  );
}
function xf() {}
function ey(e, t) {
  var n = Tt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && yf(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function ty(e, t) {
  var n = Tt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && yf(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function ny(e, t, n) {
  return Cr & 21
    ? (Wt(n, t) || ((n = lg()), (Ce.lanes |= n), (Er |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (lt = !0)), (e.memoizedState = n));
}
function kS(e, t) {
  var n = pe;
  (pe = n !== 0 && 4 > n ? n : 4), e(!0);
  var r = Ga.transition;
  Ga.transition = {};
  try {
    e(!1), t();
  } finally {
    (pe = n), (Ga.transition = r);
  }
}
function ry() {
  return Tt().memoizedState;
}
function _S(e, t, n) {
  var r = Xn(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    oy(e))
  )
    sy(t, n);
  else if (((n = zg(e, t, n, r)), n !== null)) {
    var o = et();
    Ht(n, e, r, o), iy(n, t, r);
  }
}
function RS(e, t, n) {
  var r = Xn(e),
    o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (oy(e)) sy(t, o);
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
        if (((o.hasEagerState = !0), (o.eagerState = l), Wt(l, i))) {
          var a = t.interleaved;
          a === null
            ? ((o.next = o), df(t))
            : ((o.next = a.next), (a.next = o)),
            (t.interleaved = o);
          return;
        }
      } catch {
      } finally {
      }
    (n = zg(e, t, o, r)),
      n !== null && ((o = et()), Ht(n, e, r, o), iy(n, t, r));
  }
}
function oy(e) {
  var t = e.alternate;
  return e === Ce || (t !== null && t === Ce);
}
function sy(e, t) {
  is = rl = !0;
  var n = e.pending;
  n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t);
}
function iy(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Qu(e, n);
  }
}
var ol = {
    readContext: Pt,
    useCallback: We,
    useContext: We,
    useEffect: We,
    useImperativeHandle: We,
    useInsertionEffect: We,
    useLayoutEffect: We,
    useMemo: We,
    useReducer: We,
    useRef: We,
    useState: We,
    useDebugValue: We,
    useDeferredValue: We,
    useTransition: We,
    useMutableSource: We,
    useSyncExternalStore: We,
    useId: We,
    unstable_isNewReconciler: !1,
  },
  DS = {
    readContext: Pt,
    useCallback: function (e, t) {
      return (en().memoizedState = [e, t === void 0 ? null : t]), e;
    },
    useContext: Pt,
    useEffect: kp,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        Ti(4194308, 4, Jg.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return Ti(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Ti(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = en();
      return (
        (t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e
      );
    },
    useReducer: function (e, t, n) {
      var r = en();
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
        (e = e.dispatch = _S.bind(null, Ce, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = en();
      return (e = { current: e }), (t.memoizedState = e);
    },
    useState: Ep,
    useDebugValue: xf,
    useDeferredValue: function (e) {
      return (en().memoizedState = e);
    },
    useTransition: function () {
      var e = Ep(!1),
        t = e[0];
      return (e = kS.bind(null, e[1])), (en().memoizedState = e), [t, e];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = Ce,
        o = en();
      if (Se) {
        if (n === void 0) throw Error(V(407));
        n = n();
      } else {
        if (((n = t()), Me === null)) throw Error(V(349));
        Cr & 30 || Ug(r, t, n);
      }
      o.memoizedState = n;
      var s = { value: n, getSnapshot: t };
      return (
        (o.queue = s),
        kp(Yg.bind(null, r, s, e), [e]),
        (r.flags |= 2048),
        ks(9, Wg.bind(null, r, s, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = en(),
        t = Me.identifierPrefix;
      if (Se) {
        var n = gn,
          r = hn;
        (n = (r & ~(1 << (32 - Vt(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Cs++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":");
      } else (n = ES++), (t = ":" + t + "r" + n.toString(32) + ":");
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  PS = {
    readContext: Pt,
    useCallback: ey,
    useContext: Pt,
    useEffect: Sf,
    useImperativeHandle: Zg,
    useInsertionEffect: qg,
    useLayoutEffect: Qg,
    useMemo: ty,
    useReducer: Xa,
    useRef: Xg,
    useState: function () {
      return Xa(Es);
    },
    useDebugValue: xf,
    useDeferredValue: function (e) {
      var t = Tt();
      return ny(t, $e.memoizedState, e);
    },
    useTransition: function () {
      var e = Xa(Es)[0],
        t = Tt().memoizedState;
      return [e, t];
    },
    useMutableSource: Vg,
    useSyncExternalStore: Hg,
    useId: ry,
    unstable_isNewReconciler: !1,
  },
  TS = {
    readContext: Pt,
    useCallback: ey,
    useContext: Pt,
    useEffect: Sf,
    useImperativeHandle: Zg,
    useInsertionEffect: qg,
    useLayoutEffect: Qg,
    useMemo: ty,
    useReducer: qa,
    useRef: Xg,
    useState: function () {
      return qa(Es);
    },
    useDebugValue: xf,
    useDeferredValue: function (e) {
      var t = Tt();
      return $e === null ? (t.memoizedState = e) : ny(t, $e.memoizedState, e);
    },
    useTransition: function () {
      var e = qa(Es)[0],
        t = Tt().memoizedState;
      return [e, t];
    },
    useMutableSource: Vg,
    useSyncExternalStore: Hg,
    useId: ry,
    unstable_isNewReconciler: !1,
  };
function Mt(e, t) {
  if (e && e.defaultProps) {
    (t = Ee({}, t)), (e = e.defaultProps);
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function qc(e, t, n, r) {
  (t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : Ee({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Ll = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? Tr(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = et(),
      o = Xn(e),
      s = yn(r, o);
    (s.payload = t),
      n != null && (s.callback = n),
      (t = Kn(e, s, o)),
      t !== null && (Ht(t, e, o, r), Di(t, e, o));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = et(),
      o = Xn(e),
      s = yn(r, o);
    (s.tag = 1),
      (s.payload = t),
      n != null && (s.callback = n),
      (t = Kn(e, s, o)),
      t !== null && (Ht(t, e, o, r), Di(t, e, o));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = et(),
      r = Xn(e),
      o = yn(n, r);
    (o.tag = 2),
      t != null && (o.callback = t),
      (t = Kn(e, o, r)),
      t !== null && (Ht(t, e, r, n), Di(t, e, r));
  },
};
function _p(e, t, n, r, o, s, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, s, i)
      : t.prototype && t.prototype.isPureReactComponent
      ? !ys(n, r) || !ys(o, s)
      : !0
  );
}
function ly(e, t, n) {
  var r = !1,
    o = Jn,
    s = t.contextType;
  return (
    typeof s == "object" && s !== null
      ? (s = Pt(s))
      : ((o = ft(t) ? xr : Xe.current),
        (r = t.contextTypes),
        (s = (r = r != null) ? po(e, o) : Jn)),
    (t = new t(n, s)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Ll),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = o),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    t
  );
}
function Rp(e, t, n, r) {
  (e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Ll.enqueueReplaceState(t, t.state, null);
}
function Qc(e, t, n, r) {
  var o = e.stateNode;
  (o.props = n), (o.state = e.memoizedState), (o.refs = {}), pf(e);
  var s = t.contextType;
  typeof s == "object" && s !== null
    ? (o.context = Pt(s))
    : ((s = ft(t) ? xr : Xe.current), (o.context = po(e, s))),
    (o.state = e.memoizedState),
    (s = t.getDerivedStateFromProps),
    typeof s == "function" && (qc(e, t, s, n), (o.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof o.getSnapshotBeforeUpdate == "function" ||
      (typeof o.UNSAFE_componentWillMount != "function" &&
        typeof o.componentWillMount != "function") ||
      ((t = o.state),
      typeof o.componentWillMount == "function" && o.componentWillMount(),
      typeof o.UNSAFE_componentWillMount == "function" &&
        o.UNSAFE_componentWillMount(),
      t !== o.state && Ll.enqueueReplaceState(o, o.state, null),
      tl(e, n, o, r),
      (o.state = e.memoizedState)),
    typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function yo(e, t) {
  try {
    var n = "",
      r = t;
    do (n += ow(r)), (r = r.return);
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
function Qa(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Jc(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var OS = typeof WeakMap == "function" ? WeakMap : Map;
function ay(e, t, n) {
  (n = yn(-1, n)), (n.tag = 3), (n.payload = { element: null });
  var r = t.value;
  return (
    (n.callback = function () {
      il || ((il = !0), (au = r)), Jc(e, t);
    }),
    n
  );
}
function cy(e, t, n) {
  (n = yn(-1, n)), (n.tag = 3);
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    (n.payload = function () {
      return r(o);
    }),
      (n.callback = function () {
        Jc(e, t);
      });
  }
  var s = e.stateNode;
  return (
    s !== null &&
      typeof s.componentDidCatch == "function" &&
      (n.callback = function () {
        Jc(e, t),
          typeof r != "function" &&
            (Gn === null ? (Gn = new Set([this])) : Gn.add(this));
        var i = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: i !== null ? i : "",
        });
      }),
    n
  );
}
function Dp(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new OS();
    var o = new Set();
    r.set(t, o);
  } else (o = r.get(t)), o === void 0 && ((o = new Set()), r.set(t, o));
  o.has(n) || (o.add(n), (e = WS.bind(null, e, t, n)), t.then(e, e));
}
function Pp(e) {
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
function Tp(e, t, n, r, o) {
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
              : ((t = yn(-1, 1)), (t.tag = 2), Kn(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var NS = En.ReactCurrentOwner,
  lt = !1;
function Je(e, t, n, r) {
  t.child = e === null ? Mg(t, null, n, r) : ho(t, e.child, n, r);
}
function Op(e, t, n, r, o) {
  n = n.render;
  var s = t.ref;
  return (
    so(t, o),
    (r = vf(e, t, n, r, s, o)),
    (n = wf()),
    e !== null && !lt
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        bn(e, t, o))
      : (Se && n && sf(t), (t.flags |= 1), Je(e, t, r, o), t.child)
  );
}
function Np(e, t, n, r, o) {
  if (e === null) {
    var s = n.type;
    return typeof s == "function" &&
      !Pf(s) &&
      s.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = s), uy(e, t, s, r, o))
      : ((e = Li(n.type, null, r, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((s = e.child), !(e.lanes & o))) {
    var i = s.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : ys), n(i, r) && e.ref === t.ref)
    )
      return bn(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = qn(s, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function uy(e, t, n, r, o) {
  if (e !== null) {
    var s = e.memoizedProps;
    if (ys(s, r) && e.ref === t.ref)
      if (((lt = !1), (t.pendingProps = r = s), (e.lanes & o) !== 0))
        e.flags & 131072 && (lt = !0);
      else return (t.lanes = e.lanes), bn(e, t, o);
  }
  return Zc(e, t, n, r, o);
}
function fy(e, t, n) {
  var r = t.pendingProps,
    o = r.children,
    s = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        ge(Jr, yt),
        (yt |= n);
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
          ge(Jr, yt),
          (yt |= e),
          null
        );
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = s !== null ? s.baseLanes : n),
        ge(Jr, yt),
        (yt |= r);
    }
  else
    s !== null ? ((r = s.baseLanes | n), (t.memoizedState = null)) : (r = n),
      ge(Jr, yt),
      (yt |= r);
  return Je(e, t, o, n), t.child;
}
function dy(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function Zc(e, t, n, r, o) {
  var s = ft(n) ? xr : Xe.current;
  return (
    (s = po(t, s)),
    so(t, o),
    (n = vf(e, t, n, r, s, o)),
    (r = wf()),
    e !== null && !lt
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        bn(e, t, o))
      : (Se && r && sf(t), (t.flags |= 1), Je(e, t, n, o), t.child)
  );
}
function $p(e, t, n, r, o) {
  if (ft(n)) {
    var s = !0;
    qi(t);
  } else s = !1;
  if ((so(t, o), t.stateNode === null))
    Oi(e, t), ly(t, n, r), Qc(t, n, r, o), (r = !0);
  else if (e === null) {
    var i = t.stateNode,
      l = t.memoizedProps;
    i.props = l;
    var a = i.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = Pt(c))
      : ((c = ft(n) ? xr : Xe.current), (c = po(t, c)));
    var u = n.getDerivedStateFromProps,
      f =
        typeof u == "function" ||
        typeof i.getSnapshotBeforeUpdate == "function";
    f ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== r || a !== c) && Rp(t, i, r, c)),
      (jn = !1);
    var d = t.memoizedState;
    (i.state = d),
      tl(t, r, i, o),
      (a = t.memoizedState),
      l !== r || d !== a || ut.current || jn
        ? (typeof u == "function" && (qc(t, n, u, r), (a = t.memoizedState)),
          (l = jn || _p(t, n, l, r, d, a, c))
            ? (f ||
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
      Ig(e, t),
      (l = t.memoizedProps),
      (c = t.type === t.elementType ? l : Mt(t.type, l)),
      (i.props = c),
      (f = t.pendingProps),
      (d = i.context),
      (a = n.contextType),
      typeof a == "object" && a !== null
        ? (a = Pt(a))
        : ((a = ft(n) ? xr : Xe.current), (a = po(t, a)));
    var m = n.getDerivedStateFromProps;
    (u =
      typeof m == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function") ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== f || d !== a) && Rp(t, i, r, a)),
      (jn = !1),
      (d = t.memoizedState),
      (i.state = d),
      tl(t, r, i, o);
    var p = t.memoizedState;
    l !== f || d !== p || ut.current || jn
      ? (typeof m == "function" && (qc(t, n, m, r), (p = t.memoizedState)),
        (c = jn || _p(t, n, c, r, d, p, a) || !1)
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
              (l === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 4),
            typeof i.getSnapshotBeforeUpdate != "function" ||
              (l === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = p)),
        (i.props = r),
        (i.state = p),
        (i.context = a),
        (r = c))
      : (typeof i.componentDidUpdate != "function" ||
          (l === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 4),
        typeof i.getSnapshotBeforeUpdate != "function" ||
          (l === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return eu(e, t, n, r, s, o);
}
function eu(e, t, n, r, o, s) {
  dy(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return o && vp(t, n, !1), bn(e, t, s);
  (r = t.stateNode), (NS.current = t);
  var l =
    i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && i
      ? ((t.child = ho(t, e.child, null, s)), (t.child = ho(t, null, l, s)))
      : Je(e, t, l, s),
    (t.memoizedState = r.state),
    o && vp(t, n, !0),
    t.child
  );
}
function py(e) {
  var t = e.stateNode;
  t.pendingContext
    ? yp(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && yp(e, t.context, !1),
    mf(e, t.containerInfo);
}
function Lp(e, t, n, r, o) {
  return mo(), af(o), (t.flags |= 256), Je(e, t, n, r), t.child;
}
var tu = { dehydrated: null, treeContext: null, retryLane: 0 };
function nu(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function my(e, t, n) {
  var r = t.pendingProps,
    o = be.current,
    s = !1,
    i = (t.flags & 128) !== 0,
    l;
  if (
    ((l = i) ||
      (l = e !== null && e.memoizedState === null ? !1 : (o & 2) !== 0),
    l
      ? ((s = !0), (t.flags &= -129))
      : (e === null || e.memoizedState !== null) && (o |= 1),
    ge(be, o & 1),
    e === null)
  )
    return (
      Gc(t),
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
                : (s = Fl(i, r, 0, null)),
              (e = vr(e, r, n, null)),
              (s.return = t),
              (e.return = t),
              (s.sibling = e),
              (t.child = s),
              (t.child.memoizedState = nu(n)),
              (t.memoizedState = tu),
              e)
            : bf(t, i))
    );
  if (((o = e.memoizedState), o !== null && ((l = o.dehydrated), l !== null)))
    return $S(e, t, i, r, l, o, n);
  if (s) {
    (s = r.fallback), (i = t.mode), (o = e.child), (l = o.sibling);
    var a = { mode: "hidden", children: r.children };
    return (
      !(i & 1) && t.child !== o
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = a),
          (t.deletions = null))
        : ((r = qn(o, a)), (r.subtreeFlags = o.subtreeFlags & 14680064)),
      l !== null ? (s = qn(l, s)) : ((s = vr(s, i, n, null)), (s.flags |= 2)),
      (s.return = t),
      (r.return = t),
      (r.sibling = s),
      (t.child = r),
      (r = s),
      (s = t.child),
      (i = e.child.memoizedState),
      (i =
        i === null
          ? nu(n)
          : {
              baseLanes: i.baseLanes | n,
              cachePool: null,
              transitions: i.transitions,
            }),
      (s.memoizedState = i),
      (s.childLanes = e.childLanes & ~n),
      (t.memoizedState = tu),
      r
    );
  }
  return (
    (s = e.child),
    (e = s.sibling),
    (r = qn(s, { mode: "visible", children: r.children })),
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
function bf(e, t) {
  return (
    (t = Fl({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function ci(e, t, n, r) {
  return (
    r !== null && af(r),
    ho(t, e.child, null, n),
    (e = bf(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function $S(e, t, n, r, o, s, i) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Qa(Error(V(422)))), ci(e, t, i, r))
      : t.memoizedState !== null
      ? ((t.child = e.child), (t.flags |= 128), null)
      : ((s = r.fallback),
        (o = t.mode),
        (r = Fl({ mode: "visible", children: r.children }, o, 0, null)),
        (s = vr(s, o, i, null)),
        (s.flags |= 2),
        (r.return = t),
        (s.return = t),
        (r.sibling = s),
        (t.child = r),
        t.mode & 1 && ho(t, e.child, null, i),
        (t.child.memoizedState = nu(i)),
        (t.memoizedState = tu),
        s);
  if (!(t.mode & 1)) return ci(e, t, i, null);
  if (o.data === "$!") {
    if (((r = o.nextSibling && o.nextSibling.dataset), r)) var l = r.dgst;
    return (r = l), (s = Error(V(419))), (r = Qa(s, r, void 0)), ci(e, t, i, r);
  }
  if (((l = (i & e.childLanes) !== 0), lt || l)) {
    if (((r = Me), r !== null)) {
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
          ((s.retryLane = o), xn(e, o), Ht(r, e, o, -1));
    }
    return Df(), (r = Qa(Error(V(421)))), ci(e, t, i, r);
  }
  return o.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = YS.bind(null, e)),
      (o._reactRetry = t),
      null)
    : ((e = s.treeContext),
      (vt = Yn(o.nextSibling)),
      (wt = t),
      (Se = !0),
      (It = null),
      e !== null &&
        ((Et[kt++] = hn),
        (Et[kt++] = gn),
        (Et[kt++] = br),
        (hn = e.id),
        (gn = e.overflow),
        (br = t)),
      (t = bf(t, r.children)),
      (t.flags |= 4096),
      t);
}
function jp(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Xc(e.return, t, n);
}
function Ja(e, t, n, r, o) {
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
function hy(e, t, n) {
  var r = t.pendingProps,
    o = r.revealOrder,
    s = r.tail;
  if ((Je(e, t, r.children, n), (r = be.current), r & 2))
    (r = (r & 1) | 2), (t.flags |= 128);
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && jp(e, n, t);
        else if (e.tag === 19) jp(e, n, t);
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
  if ((ge(be, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (o) {
      case "forwards":
        for (n = t.child, o = null; n !== null; )
          (e = n.alternate),
            e !== null && nl(e) === null && (o = n),
            (n = n.sibling);
        (n = o),
          n === null
            ? ((o = t.child), (t.child = null))
            : ((o = n.sibling), (n.sibling = null)),
          Ja(t, !1, o, n, s);
        break;
      case "backwards":
        for (n = null, o = t.child, t.child = null; o !== null; ) {
          if (((e = o.alternate), e !== null && nl(e) === null)) {
            t.child = o;
            break;
          }
          (e = o.sibling), (o.sibling = n), (n = o), (o = e);
        }
        Ja(t, !0, n, null, s);
        break;
      case "together":
        Ja(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Oi(e, t) {
  !(t.mode & 1) &&
    e !== null &&
    ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function bn(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (Er |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(V(153));
  if (t.child !== null) {
    for (
      e = t.child, n = qn(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;

    )
      (e = e.sibling), (n = n.sibling = qn(e, e.pendingProps)), (n.return = t);
    n.sibling = null;
  }
  return t.child;
}
function LS(e, t, n) {
  switch (t.tag) {
    case 3:
      py(t), mo();
      break;
    case 5:
      Bg(t);
      break;
    case 1:
      ft(t.type) && qi(t);
      break;
    case 4:
      mf(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        o = t.memoizedProps.value;
      ge(Zi, r._currentValue), (r._currentValue = o);
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (ge(be, be.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
          ? my(e, t, n)
          : (ge(be, be.current & 1),
            (e = bn(e, t, n)),
            e !== null ? e.sibling : null);
      ge(be, be.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return hy(e, t, n);
        t.flags |= 128;
      }
      if (
        ((o = t.memoizedState),
        o !== null &&
          ((o.rendering = null), (o.tail = null), (o.lastEffect = null)),
        ge(be, be.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return (t.lanes = 0), fy(e, t, n);
  }
  return bn(e, t, n);
}
var gy, ru, yy, vy;
gy = function (e, t) {
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
ru = function () {};
yy = function (e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    (e = t.stateNode), gr(ln.current);
    var s = null;
    switch (n) {
      case "input":
        (o = kc(e, o)), (r = kc(e, r)), (s = []);
        break;
      case "select":
        (o = Ee({}, o, { value: void 0 })),
          (r = Ee({}, r, { value: void 0 })),
          (s = []);
        break;
      case "textarea":
        (o = Dc(e, o)), (r = Dc(e, r)), (s = []);
        break;
      default:
        typeof o.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = Gi);
    }
    Tc(n, r);
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
            (us.hasOwnProperty(c)
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
              (us.hasOwnProperty(c)
                ? (a != null && c === "onScroll" && ve("scroll", e),
                  s || l === a || (s = []))
                : (s = s || []).push(c, a));
    }
    n && (s = s || []).push("style", n);
    var c = s;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
vy = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Wo(e, t) {
  if (!Se)
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
function Ye(e) {
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
function jS(e, t, n) {
  var r = t.pendingProps;
  switch ((lf(t), t.tag)) {
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
      return Ye(t), null;
    case 1:
      return ft(t.type) && Xi(), Ye(t), null;
    case 3:
      return (
        (r = t.stateNode),
        go(),
        we(ut),
        we(Xe),
        gf(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (li(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), It !== null && (fu(It), (It = null)))),
        ru(e, t),
        Ye(t),
        null
      );
    case 5:
      hf(t);
      var o = gr(bs.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        yy(e, t, n, r, o),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(V(166));
          return Ye(t), null;
        }
        if (((e = gr(ln.current)), li(t))) {
          (r = t.stateNode), (n = t.type);
          var s = t.memoizedProps;
          switch (((r[rn] = t), (r[Ss] = s), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              ve("cancel", r), ve("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              ve("load", r);
              break;
            case "video":
            case "audio":
              for (o = 0; o < es.length; o++) ve(es[o], r);
              break;
            case "source":
              ve("error", r);
              break;
            case "img":
            case "image":
            case "link":
              ve("error", r), ve("load", r);
              break;
            case "details":
              ve("toggle", r);
              break;
            case "input":
              Ud(r, s), ve("invalid", r);
              break;
            case "select":
              (r._wrapperState = { wasMultiple: !!s.multiple }),
                ve("invalid", r);
              break;
            case "textarea":
              Yd(r, s), ve("invalid", r);
          }
          Tc(n, s), (o = null);
          for (var i in s)
            if (s.hasOwnProperty(i)) {
              var l = s[i];
              i === "children"
                ? typeof l == "string"
                  ? r.textContent !== l &&
                    (s.suppressHydrationWarning !== !0 &&
                      ii(r.textContent, l, e),
                    (o = ["children", l]))
                  : typeof l == "number" &&
                    r.textContent !== "" + l &&
                    (s.suppressHydrationWarning !== !0 &&
                      ii(r.textContent, l, e),
                    (o = ["children", "" + l]))
                : us.hasOwnProperty(i) &&
                  l != null &&
                  i === "onScroll" &&
                  ve("scroll", r);
            }
          switch (n) {
            case "input":
              Js(r), Wd(r, s, !0);
              break;
            case "textarea":
              Js(r), Kd(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof s.onClick == "function" && (r.onclick = Gi);
          }
          (r = o), (t.updateQueue = r), r !== null && (t.flags |= 4);
        } else {
          (i = o.nodeType === 9 ? o : o.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = Yh(n)),
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
            (e[rn] = t),
            (e[Ss] = r),
            gy(e, t, !1, !1),
            (t.stateNode = e);
          e: {
            switch (((i = Oc(n, r)), n)) {
              case "dialog":
                ve("cancel", e), ve("close", e), (o = r);
                break;
              case "iframe":
              case "object":
              case "embed":
                ve("load", e), (o = r);
                break;
              case "video":
              case "audio":
                for (o = 0; o < es.length; o++) ve(es[o], e);
                o = r;
                break;
              case "source":
                ve("error", e), (o = r);
                break;
              case "img":
              case "image":
              case "link":
                ve("error", e), ve("load", e), (o = r);
                break;
              case "details":
                ve("toggle", e), (o = r);
                break;
              case "input":
                Ud(e, r), (o = kc(e, r)), ve("invalid", e);
                break;
              case "option":
                o = r;
                break;
              case "select":
                (e._wrapperState = { wasMultiple: !!r.multiple }),
                  (o = Ee({}, r, { value: void 0 })),
                  ve("invalid", e);
                break;
              case "textarea":
                Yd(e, r), (o = Dc(e, r)), ve("invalid", e);
                break;
              default:
                o = r;
            }
            Tc(n, o), (l = o);
            for (s in l)
              if (l.hasOwnProperty(s)) {
                var a = l[s];
                s === "style"
                  ? Xh(e, a)
                  : s === "dangerouslySetInnerHTML"
                  ? ((a = a ? a.__html : void 0), a != null && Kh(e, a))
                  : s === "children"
                  ? typeof a == "string"
                    ? (n !== "textarea" || a !== "") && fs(e, a)
                    : typeof a == "number" && fs(e, "" + a)
                  : s !== "suppressContentEditableWarning" &&
                    s !== "suppressHydrationWarning" &&
                    s !== "autoFocus" &&
                    (us.hasOwnProperty(s)
                      ? a != null && s === "onScroll" && ve("scroll", e)
                      : a != null && Wu(e, s, a, i));
              }
            switch (n) {
              case "input":
                Js(e), Wd(e, r, !1);
                break;
              case "textarea":
                Js(e), Kd(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Qn(r.value));
                break;
              case "select":
                (e.multiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? to(e, !!r.multiple, s, !1)
                    : r.defaultValue != null &&
                      to(e, !!r.multiple, r.defaultValue, !0);
                break;
              default:
                typeof o.onClick == "function" && (e.onclick = Gi);
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
      return Ye(t), null;
    case 6:
      if (e && t.stateNode != null) vy(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(V(166));
        if (((n = gr(bs.current)), gr(ln.current), li(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[rn] = t),
            (s = r.nodeValue !== n) && ((e = wt), e !== null))
          )
            switch (e.tag) {
              case 3:
                ii(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  ii(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          s && (t.flags |= 4);
        } else
          (r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[rn] = t),
            (t.stateNode = r);
      }
      return Ye(t), null;
    case 13:
      if (
        (we(be),
        (r = t.memoizedState),
        e === null ||
          (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (Se && vt !== null && t.mode & 1 && !(t.flags & 128))
          Ag(), mo(), (t.flags |= 98560), (s = !1);
        else if (((s = li(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!s) throw Error(V(318));
            if (
              ((s = t.memoizedState),
              (s = s !== null ? s.dehydrated : null),
              !s)
            )
              throw Error(V(317));
            s[rn] = t;
          } else
            mo(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4);
          Ye(t), (s = !1);
        } else It !== null && (fu(It), (It = null)), (s = !0);
        if (!s) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || be.current & 1 ? Le === 0 && (Le = 3) : Df())),
          t.updateQueue !== null && (t.flags |= 4),
          Ye(t),
          null);
    case 4:
      return (
        go(), ru(e, t), e === null && vs(t.stateNode.containerInfo), Ye(t), null
      );
    case 10:
      return ff(t.type._context), Ye(t), null;
    case 17:
      return ft(t.type) && Xi(), Ye(t), null;
    case 19:
      if ((we(be), (s = t.memoizedState), s === null)) return Ye(t), null;
      if (((r = (t.flags & 128) !== 0), (i = s.rendering), i === null))
        if (r) Wo(s, !1);
        else {
          if (Le !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((i = nl(e)), i !== null)) {
                for (
                  t.flags |= 128,
                    Wo(s, !1),
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
                return ge(be, (be.current & 1) | 2), t.child;
              }
              e = e.sibling;
            }
          s.tail !== null &&
            Pe() > vo &&
            ((t.flags |= 128), (r = !0), Wo(s, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = nl(i)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              Wo(s, !0),
              s.tail === null && s.tailMode === "hidden" && !i.alternate && !Se)
            )
              return Ye(t), null;
          } else
            2 * Pe() - s.renderingStartTime > vo &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), Wo(s, !1), (t.lanes = 4194304));
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
          (s.renderingStartTime = Pe()),
          (t.sibling = null),
          (n = be.current),
          ge(be, r ? (n & 1) | 2 : n & 1),
          t)
        : (Ye(t), null);
    case 22:
    case 23:
      return (
        Rf(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? yt & 1073741824 && (Ye(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Ye(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(V(156, t.tag));
}
function AS(e, t) {
  switch ((lf(t), t.tag)) {
    case 1:
      return (
        ft(t.type) && Xi(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        go(),
        we(ut),
        we(Xe),
        gf(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return hf(t), null;
    case 13:
      if (
        (we(be), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(V(340));
        mo();
      }
      return (
        (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return we(be), null;
    case 4:
      return go(), null;
    case 10:
      return ff(t.type._context), null;
    case 22:
    case 23:
      return Rf(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var ui = !1,
  Ke = !1,
  FS = typeof WeakSet == "function" ? WeakSet : Set,
  K = null;
function Qr(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        Re(e, t, r);
      }
    else n.current = null;
}
function ou(e, t, n) {
  try {
    n();
  } catch (r) {
    Re(e, t, r);
  }
}
var Ap = !1;
function MS(e, t) {
  if (((Bc = Wi), (e = Cg()), of(e))) {
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
            f = e,
            d = null;
          t: for (;;) {
            for (
              var m;
              f !== n || (o !== 0 && f.nodeType !== 3) || (l = i + o),
                f !== s || (r !== 0 && f.nodeType !== 3) || (a = i + r),
                f.nodeType === 3 && (i += f.nodeValue.length),
                (m = f.firstChild) !== null;

            )
              (d = f), (f = m);
            for (;;) {
              if (f === e) break t;
              if (
                (d === n && ++c === o && (l = i),
                d === s && ++u === r && (a = i),
                (m = f.nextSibling) !== null)
              )
                break;
              (f = d), (d = f.parentNode);
            }
            f = m;
          }
          n = l === -1 || a === -1 ? null : { start: l, end: a };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Vc = { focusedElem: e, selectionRange: n }, Wi = !1, K = t; K !== null; )
    if (((t = K), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      (e.return = t), (K = e);
    else
      for (; K !== null; ) {
        t = K;
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
                    g = v.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? h : Mt(t.type, h),
                      S
                    );
                  v.__reactInternalSnapshotBeforeUpdate = g;
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
                throw Error(V(163));
            }
        } catch (b) {
          Re(t, t.return, b);
        }
        if (((e = t.sibling), e !== null)) {
          (e.return = t.return), (K = e);
          break;
        }
        K = t.return;
      }
  return (p = Ap), (Ap = !1), p;
}
function ls(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var o = (r = r.next);
    do {
      if ((o.tag & e) === e) {
        var s = o.destroy;
        (o.destroy = void 0), s !== void 0 && ou(t, n, s);
      }
      o = o.next;
    } while (o !== r);
  }
}
function jl(e, t) {
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
function su(e) {
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
function wy(e) {
  var t = e.alternate;
  t !== null && ((e.alternate = null), wy(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[rn], delete t[Ss], delete t[Wc], delete t[SS], delete t[xS])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null);
}
function Sy(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Fp(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Sy(e.return)) return null;
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
function iu(e, t, n) {
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
          n != null || t.onclick !== null || (t.onclick = Gi));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (iu(e, t, n), e = e.sibling; e !== null; ) iu(e, t, n), (e = e.sibling);
}
function lu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && ((e = e.child), e !== null))
    for (lu(e, t, n), e = e.sibling; e !== null; ) lu(e, t, n), (e = e.sibling);
}
var Ve = null,
  zt = !1;
function Nn(e, t, n) {
  for (n = n.child; n !== null; ) xy(e, t, n), (n = n.sibling);
}
function xy(e, t, n) {
  if (sn && typeof sn.onCommitFiberUnmount == "function")
    try {
      sn.onCommitFiberUnmount(Rl, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Ke || Qr(n, t);
    case 6:
      var r = Ve,
        o = zt;
      (Ve = null),
        Nn(e, t, n),
        (Ve = r),
        (zt = o),
        Ve !== null &&
          (zt
            ? ((e = Ve),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : Ve.removeChild(n.stateNode));
      break;
    case 18:
      Ve !== null &&
        (zt
          ? ((e = Ve),
            (n = n.stateNode),
            e.nodeType === 8
              ? Wa(e.parentNode, n)
              : e.nodeType === 1 && Wa(e, n),
            hs(e))
          : Wa(Ve, n.stateNode));
      break;
    case 4:
      (r = Ve),
        (o = zt),
        (Ve = n.stateNode.containerInfo),
        (zt = !0),
        Nn(e, t, n),
        (Ve = r),
        (zt = o);
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (
        !Ke &&
        ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))
      ) {
        o = r = r.next;
        do {
          var s = o,
            i = s.destroy;
          (s = s.tag),
            i !== void 0 && (s & 2 || s & 4) && ou(n, t, i),
            (o = o.next);
        } while (o !== r);
      }
      Nn(e, t, n);
      break;
    case 1:
      if (
        !Ke &&
        (Qr(n, t),
        (r = n.stateNode),
        typeof r.componentWillUnmount == "function")
      )
        try {
          (r.props = n.memoizedProps),
            (r.state = n.memoizedState),
            r.componentWillUnmount();
        } catch (l) {
          Re(n, t, l);
        }
      Nn(e, t, n);
      break;
    case 21:
      Nn(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Ke = (r = Ke) || n.memoizedState !== null), Nn(e, t, n), (Ke = r))
        : Nn(e, t, n);
      break;
    default:
      Nn(e, t, n);
  }
}
function Mp(e) {
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
function Ft(e, t) {
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
              (Ve = l.stateNode), (zt = !1);
              break e;
            case 3:
              (Ve = l.stateNode.containerInfo), (zt = !0);
              break e;
            case 4:
              (Ve = l.stateNode.containerInfo), (zt = !0);
              break e;
          }
          l = l.return;
        }
        if (Ve === null) throw Error(V(160));
        xy(s, i, o), (Ve = null), (zt = !1);
        var a = o.alternate;
        a !== null && (a.return = null), (o.return = null);
      } catch (c) {
        Re(o, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) by(t, e), (t = t.sibling);
}
function by(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Ft(t, e), Jt(e), r & 4)) {
        try {
          ls(3, e, e.return), jl(3, e);
        } catch (h) {
          Re(e, e.return, h);
        }
        try {
          ls(5, e, e.return);
        } catch (h) {
          Re(e, e.return, h);
        }
      }
      break;
    case 1:
      Ft(t, e), Jt(e), r & 512 && n !== null && Qr(n, n.return);
      break;
    case 5:
      if (
        (Ft(t, e),
        Jt(e),
        r & 512 && n !== null && Qr(n, n.return),
        e.flags & 32)
      ) {
        var o = e.stateNode;
        try {
          fs(o, "");
        } catch (h) {
          Re(e, e.return, h);
        }
      }
      if (r & 4 && ((o = e.stateNode), o != null)) {
        var s = e.memoizedProps,
          i = n !== null ? n.memoizedProps : s,
          l = e.type,
          a = e.updateQueue;
        if (((e.updateQueue = null), a !== null))
          try {
            l === "input" && s.type === "radio" && s.name != null && Uh(o, s),
              Oc(l, i);
            var c = Oc(l, s);
            for (i = 0; i < a.length; i += 2) {
              var u = a[i],
                f = a[i + 1];
              u === "style"
                ? Xh(o, f)
                : u === "dangerouslySetInnerHTML"
                ? Kh(o, f)
                : u === "children"
                ? fs(o, f)
                : Wu(o, u, f, c);
            }
            switch (l) {
              case "input":
                _c(o, s);
                break;
              case "textarea":
                Wh(o, s);
                break;
              case "select":
                var d = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!s.multiple;
                var m = s.value;
                m != null
                  ? to(o, !!s.multiple, m, !1)
                  : d !== !!s.multiple &&
                    (s.defaultValue != null
                      ? to(o, !!s.multiple, s.defaultValue, !0)
                      : to(o, !!s.multiple, s.multiple ? [] : "", !1));
            }
            o[Ss] = s;
          } catch (h) {
            Re(e, e.return, h);
          }
      }
      break;
    case 6:
      if ((Ft(t, e), Jt(e), r & 4)) {
        if (e.stateNode === null) throw Error(V(162));
        (o = e.stateNode), (s = e.memoizedProps);
        try {
          o.nodeValue = s;
        } catch (h) {
          Re(e, e.return, h);
        }
      }
      break;
    case 3:
      if (
        (Ft(t, e), Jt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          hs(t.containerInfo);
        } catch (h) {
          Re(e, e.return, h);
        }
      break;
    case 4:
      Ft(t, e), Jt(e);
      break;
    case 13:
      Ft(t, e),
        Jt(e),
        (o = e.child),
        o.flags & 8192 &&
          ((s = o.memoizedState !== null),
          (o.stateNode.isHidden = s),
          !s ||
            (o.alternate !== null && o.alternate.memoizedState !== null) ||
            (kf = Pe())),
        r & 4 && Mp(e);
      break;
    case 22:
      if (
        ((u = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Ke = (c = Ke) || u), Ft(t, e), (Ke = c)) : Ft(t, e),
        Jt(e),
        r & 8192)
      ) {
        if (
          ((c = e.memoizedState !== null),
          (e.stateNode.isHidden = c) && !u && e.mode & 1)
        )
          for (K = e, u = e.child; u !== null; ) {
            for (f = K = u; K !== null; ) {
              switch (((d = K), (m = d.child), d.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  ls(4, d, d.return);
                  break;
                case 1:
                  Qr(d, d.return);
                  var p = d.stateNode;
                  if (typeof p.componentWillUnmount == "function") {
                    (r = d), (n = d.return);
                    try {
                      (t = r),
                        (p.props = t.memoizedProps),
                        (p.state = t.memoizedState),
                        p.componentWillUnmount();
                    } catch (h) {
                      Re(r, n, h);
                    }
                  }
                  break;
                case 5:
                  Qr(d, d.return);
                  break;
                case 22:
                  if (d.memoizedState !== null) {
                    Ip(f);
                    continue;
                  }
              }
              m !== null ? ((m.return = d), (K = m)) : Ip(f);
            }
            u = u.sibling;
          }
        e: for (u = null, f = e; ; ) {
          if (f.tag === 5) {
            if (u === null) {
              u = f;
              try {
                (o = f.stateNode),
                  c
                    ? ((s = o.style),
                      typeof s.setProperty == "function"
                        ? s.setProperty("display", "none", "important")
                        : (s.display = "none"))
                    : ((l = f.stateNode),
                      (a = f.memoizedProps.style),
                      (i =
                        a != null && a.hasOwnProperty("display")
                          ? a.display
                          : null),
                      (l.style.display = Gh("display", i)));
              } catch (h) {
                Re(e, e.return, h);
              }
            }
          } else if (f.tag === 6) {
            if (u === null)
              try {
                f.stateNode.nodeValue = c ? "" : f.memoizedProps;
              } catch (h) {
                Re(e, e.return, h);
              }
          } else if (
            ((f.tag !== 22 && f.tag !== 23) ||
              f.memoizedState === null ||
              f === e) &&
            f.child !== null
          ) {
            (f.child.return = f), (f = f.child);
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            u === f && (u = null), (f = f.return);
          }
          u === f && (u = null), (f.sibling.return = f.return), (f = f.sibling);
        }
      }
      break;
    case 19:
      Ft(t, e), Jt(e), r & 4 && Mp(e);
      break;
    case 21:
      break;
    default:
      Ft(t, e), Jt(e);
  }
}
function Jt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Sy(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(V(160));
      }
      switch (r.tag) {
        case 5:
          var o = r.stateNode;
          r.flags & 32 && (fs(o, ""), (r.flags &= -33));
          var s = Fp(e);
          lu(e, s, o);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo,
            l = Fp(e);
          iu(e, l, i);
          break;
        default:
          throw Error(V(161));
      }
    } catch (a) {
      Re(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function zS(e, t, n) {
  (K = e), Cy(e);
}
function Cy(e, t, n) {
  for (var r = (e.mode & 1) !== 0; K !== null; ) {
    var o = K,
      s = o.child;
    if (o.tag === 22 && r) {
      var i = o.memoizedState !== null || ui;
      if (!i) {
        var l = o.alternate,
          a = (l !== null && l.memoizedState !== null) || Ke;
        l = ui;
        var c = Ke;
        if (((ui = i), (Ke = a) && !c))
          for (K = o; K !== null; )
            (i = K),
              (a = i.child),
              i.tag === 22 && i.memoizedState !== null
                ? Bp(o)
                : a !== null
                ? ((a.return = i), (K = a))
                : Bp(o);
        for (; s !== null; ) (K = s), Cy(s), (s = s.sibling);
        (K = o), (ui = l), (Ke = c);
      }
      zp(e);
    } else
      o.subtreeFlags & 8772 && s !== null ? ((s.return = o), (K = s)) : zp(e);
  }
}
function zp(e) {
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
              Ke || jl(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Ke)
                if (n === null) r.componentDidMount();
                else {
                  var o =
                    t.elementType === t.type
                      ? n.memoizedProps
                      : Mt(t.type, n.memoizedProps);
                  r.componentDidUpdate(
                    o,
                    n.memoizedState,
                    r.__reactInternalSnapshotBeforeUpdate
                  );
                }
              var s = t.updateQueue;
              s !== null && Cp(t, s, r);
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
                Cp(t, i, n);
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
                    var f = u.dehydrated;
                    f !== null && hs(f);
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
              throw Error(V(163));
          }
        Ke || (t.flags & 512 && su(t));
      } catch (d) {
        Re(t, t.return, d);
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
function Ip(e) {
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
function Bp(e) {
  for (; K !== null; ) {
    var t = K;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            jl(4, t);
          } catch (a) {
            Re(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var o = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              Re(t, o, a);
            }
          }
          var s = t.return;
          try {
            su(t);
          } catch (a) {
            Re(t, s, a);
          }
          break;
        case 5:
          var i = t.return;
          try {
            su(t);
          } catch (a) {
            Re(t, i, a);
          }
      }
    } catch (a) {
      Re(t, t.return, a);
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
var IS = Math.ceil,
  sl = En.ReactCurrentDispatcher,
  Cf = En.ReactCurrentOwner,
  Rt = En.ReactCurrentBatchConfig,
  fe = 0,
  Me = null,
  Te = null,
  He = 0,
  yt = 0,
  Jr = nr(0),
  Le = 0,
  _s = null,
  Er = 0,
  Al = 0,
  Ef = 0,
  as = null,
  it = null,
  kf = 0,
  vo = 1 / 0,
  pn = null,
  il = !1,
  au = null,
  Gn = null,
  fi = !1,
  Bn = null,
  ll = 0,
  cs = 0,
  cu = null,
  Ni = -1,
  $i = 0;
function et() {
  return fe & 6 ? Pe() : Ni !== -1 ? Ni : (Ni = Pe());
}
function Xn(e) {
  return e.mode & 1
    ? fe & 2 && He !== 0
      ? He & -He
      : CS.transition !== null
      ? ($i === 0 && ($i = lg()), $i)
      : ((e = pe),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : mg(e.type))),
        e)
    : 1;
}
function Ht(e, t, n, r) {
  if (50 < cs) throw ((cs = 0), (cu = null), Error(V(185)));
  Ls(e, n, r),
    (!(fe & 2) || e !== Me) &&
      (e === Me && (!(fe & 2) && (Al |= n), Le === 4 && Mn(e, He)),
      dt(e, r),
      n === 1 && fe === 0 && !(t.mode & 1) && ((vo = Pe() + 500), Nl && rr()));
}
function dt(e, t) {
  var n = e.callbackNode;
  Cw(e, t);
  var r = Ui(e, e === Me ? He : 0);
  if (r === 0)
    n !== null && qd(n), (e.callbackNode = null), (e.callbackPriority = 0);
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && qd(n), t === 1))
      e.tag === 0 ? bS(Vp.bind(null, e)) : $g(Vp.bind(null, e)),
        vS(function () {
          !(fe & 6) && rr();
        }),
        (n = null);
    else {
      switch (ag(r)) {
        case 1:
          n = qu;
          break;
        case 4:
          n = sg;
          break;
        case 16:
          n = Hi;
          break;
        case 536870912:
          n = ig;
          break;
        default:
          n = Hi;
      }
      n = Oy(n, Ey.bind(null, e));
    }
    (e.callbackPriority = t), (e.callbackNode = n);
  }
}
function Ey(e, t) {
  if (((Ni = -1), ($i = 0), fe & 6)) throw Error(V(327));
  var n = e.callbackNode;
  if (io() && e.callbackNode !== n) return null;
  var r = Ui(e, e === Me ? He : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = al(e, r);
  else {
    t = r;
    var o = fe;
    fe |= 2;
    var s = _y();
    (Me !== e || He !== t) && ((pn = null), (vo = Pe() + 500), yr(e, t));
    do
      try {
        HS();
        break;
      } catch (l) {
        ky(e, l);
      }
    while (!0);
    uf(),
      (sl.current = s),
      (fe = o),
      Te !== null ? (t = 0) : ((Me = null), (He = 0), (t = Le));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((o = Ac(e)), o !== 0 && ((r = o), (t = uu(e, o)))), t === 1)
    )
      throw ((n = _s), yr(e, 0), Mn(e, r), dt(e, Pe()), n);
    if (t === 6) Mn(e, r);
    else {
      if (
        ((o = e.current.alternate),
        !(r & 30) &&
          !BS(o) &&
          ((t = al(e, r)),
          t === 2 && ((s = Ac(e)), s !== 0 && ((r = s), (t = uu(e, s)))),
          t === 1))
      )
        throw ((n = _s), yr(e, 0), Mn(e, r), dt(e, Pe()), n);
      switch (((e.finishedWork = o), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(V(345));
        case 2:
          fr(e, it, pn);
          break;
        case 3:
          if (
            (Mn(e, r), (r & 130023424) === r && ((t = kf + 500 - Pe()), 10 < t))
          ) {
            if (Ui(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & r) !== r)) {
              et(), (e.pingedLanes |= e.suspendedLanes & o);
              break;
            }
            e.timeoutHandle = Uc(fr.bind(null, e, it, pn), t);
            break;
          }
          fr(e, it, pn);
          break;
        case 4:
          if ((Mn(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var i = 31 - Vt(r);
            (s = 1 << i), (i = t[i]), i > o && (o = i), (r &= ~s);
          }
          if (
            ((r = o),
            (r = Pe() - r),
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
                : 1960 * IS(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = Uc(fr.bind(null, e, it, pn), r);
            break;
          }
          fr(e, it, pn);
          break;
        case 5:
          fr(e, it, pn);
          break;
        default:
          throw Error(V(329));
      }
    }
  }
  return dt(e, Pe()), e.callbackNode === n ? Ey.bind(null, e) : null;
}
function uu(e, t) {
  var n = as;
  return (
    e.current.memoizedState.isDehydrated && (yr(e, t).flags |= 256),
    (e = al(e, t)),
    e !== 2 && ((t = it), (it = n), t !== null && fu(t)),
    e
  );
}
function fu(e) {
  it === null ? (it = e) : it.push.apply(it, e);
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
            if (!Wt(s(), o)) return !1;
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
function Mn(e, t) {
  for (
    t &= ~Ef,
      t &= ~Al,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;

  ) {
    var n = 31 - Vt(t),
      r = 1 << n;
    (e[n] = -1), (t &= ~r);
  }
}
function Vp(e) {
  if (fe & 6) throw Error(V(327));
  io();
  var t = Ui(e, 0);
  if (!(t & 1)) return dt(e, Pe()), null;
  var n = al(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Ac(e);
    r !== 0 && ((t = r), (n = uu(e, r)));
  }
  if (n === 1) throw ((n = _s), yr(e, 0), Mn(e, t), dt(e, Pe()), n);
  if (n === 6) throw Error(V(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    fr(e, it, pn),
    dt(e, Pe()),
    null
  );
}
function _f(e, t) {
  var n = fe;
  fe |= 1;
  try {
    return e(t);
  } finally {
    (fe = n), fe === 0 && ((vo = Pe() + 500), Nl && rr());
  }
}
function kr(e) {
  Bn !== null && Bn.tag === 0 && !(fe & 6) && io();
  var t = fe;
  fe |= 1;
  var n = Rt.transition,
    r = pe;
  try {
    if (((Rt.transition = null), (pe = 1), e)) return e();
  } finally {
    (pe = r), (Rt.transition = n), (fe = t), !(fe & 6) && rr();
  }
}
function Rf() {
  (yt = Jr.current), we(Jr);
}
function yr(e, t) {
  (e.finishedWork = null), (e.finishedLanes = 0);
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), yS(n)), Te !== null))
    for (n = Te.return; n !== null; ) {
      var r = n;
      switch ((lf(r), r.tag)) {
        case 1:
          (r = r.type.childContextTypes), r != null && Xi();
          break;
        case 3:
          go(), we(ut), we(Xe), gf();
          break;
        case 5:
          hf(r);
          break;
        case 4:
          go();
          break;
        case 13:
          we(be);
          break;
        case 19:
          we(be);
          break;
        case 10:
          ff(r.type._context);
          break;
        case 22:
        case 23:
          Rf();
      }
      n = n.return;
    }
  if (
    ((Me = e),
    (Te = e = qn(e.current, null)),
    (He = yt = t),
    (Le = 0),
    (_s = null),
    (Ef = Al = Er = 0),
    (it = as = null),
    hr !== null)
  ) {
    for (t = 0; t < hr.length; t++)
      if (((n = hr[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var o = r.next,
          s = n.pending;
        if (s !== null) {
          var i = s.next;
          (s.next = o), (r.next = i);
        }
        n.pending = r;
      }
    hr = null;
  }
  return e;
}
function ky(e, t) {
  do {
    var n = Te;
    try {
      if ((uf(), (Pi.current = ol), rl)) {
        for (var r = Ce.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), (r = r.next);
        }
        rl = !1;
      }
      if (
        ((Cr = 0),
        (Fe = $e = Ce = null),
        (is = !1),
        (Cs = 0),
        (Cf.current = null),
        n === null || n.return === null)
      ) {
        (Le = 1), (_s = t), (Te = null);
        break;
      }
      e: {
        var s = e,
          i = n.return,
          l = n,
          a = t;
        if (
          ((t = He),
          (l.flags |= 32768),
          a !== null && typeof a == "object" && typeof a.then == "function")
        ) {
          var c = a,
            u = l,
            f = u.tag;
          if (!(u.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var d = u.alternate;
            d
              ? ((u.updateQueue = d.updateQueue),
                (u.memoizedState = d.memoizedState),
                (u.lanes = d.lanes))
              : ((u.updateQueue = null), (u.memoizedState = null));
          }
          var m = Pp(i);
          if (m !== null) {
            (m.flags &= -257),
              Tp(m, i, l, s, t),
              m.mode & 1 && Dp(s, c, t),
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
              Dp(s, c, t), Df();
              break e;
            }
            a = Error(V(426));
          }
        } else if (Se && l.mode & 1) {
          var S = Pp(i);
          if (S !== null) {
            !(S.flags & 65536) && (S.flags |= 256),
              Tp(S, i, l, s, t),
              af(yo(a, l));
            break e;
          }
        }
        (s = a = yo(a, l)),
          Le !== 4 && (Le = 2),
          as === null ? (as = [s]) : as.push(s),
          (s = i);
        do {
          switch (s.tag) {
            case 3:
              (s.flags |= 65536), (t &= -t), (s.lanes |= t);
              var v = ay(s, a, t);
              bp(s, v);
              break e;
            case 1:
              l = a;
              var g = s.type,
                y = s.stateNode;
              if (
                !(s.flags & 128) &&
                (typeof g.getDerivedStateFromError == "function" ||
                  (y !== null &&
                    typeof y.componentDidCatch == "function" &&
                    (Gn === null || !Gn.has(y))))
              ) {
                (s.flags |= 65536), (t &= -t), (s.lanes |= t);
                var b = cy(s, l, t);
                bp(s, b);
                break e;
              }
          }
          s = s.return;
        } while (s !== null);
      }
      Dy(n);
    } catch (C) {
      (t = C), Te === n && n !== null && (Te = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function _y() {
  var e = sl.current;
  return (sl.current = ol), e === null ? ol : e;
}
function Df() {
  (Le === 0 || Le === 3 || Le === 2) && (Le = 4),
    Me === null || (!(Er & 268435455) && !(Al & 268435455)) || Mn(Me, He);
}
function al(e, t) {
  var n = fe;
  fe |= 2;
  var r = _y();
  (Me !== e || He !== t) && ((pn = null), yr(e, t));
  do
    try {
      VS();
      break;
    } catch (o) {
      ky(e, o);
    }
  while (!0);
  if ((uf(), (fe = n), (sl.current = r), Te !== null)) throw Error(V(261));
  return (Me = null), (He = 0), Le;
}
function VS() {
  for (; Te !== null; ) Ry(Te);
}
function HS() {
  for (; Te !== null && !mw(); ) Ry(Te);
}
function Ry(e) {
  var t = Ty(e.alternate, e, yt);
  (e.memoizedProps = e.pendingProps),
    t === null ? Dy(e) : (Te = t),
    (Cf.current = null);
}
function Dy(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = AS(n, t)), n !== null)) {
        (n.flags &= 32767), (Te = n);
        return;
      }
      if (e !== null)
        (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
      else {
        (Le = 6), (Te = null);
        return;
      }
    } else if (((n = jS(n, t, yt)), n !== null)) {
      Te = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Te = t;
      return;
    }
    Te = t = e;
  } while (t !== null);
  Le === 0 && (Le = 5);
}
function fr(e, t, n) {
  var r = pe,
    o = Rt.transition;
  try {
    (Rt.transition = null), (pe = 1), US(e, t, n, r);
  } finally {
    (Rt.transition = o), (pe = r);
  }
  return null;
}
function US(e, t, n, r) {
  do io();
  while (Bn !== null);
  if (fe & 6) throw Error(V(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(V(177));
  (e.callbackNode = null), (e.callbackPriority = 0);
  var s = n.lanes | n.childLanes;
  if (
    (Ew(e, s),
    e === Me && ((Te = Me = null), (He = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      fi ||
      ((fi = !0),
      Oy(Hi, function () {
        return io(), null;
      })),
    (s = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || s)
  ) {
    (s = Rt.transition), (Rt.transition = null);
    var i = pe;
    pe = 1;
    var l = fe;
    (fe |= 4),
      (Cf.current = null),
      MS(e, n),
      by(n, e),
      uS(Vc),
      (Wi = !!Bc),
      (Vc = Bc = null),
      (e.current = n),
      zS(n),
      hw(),
      (fe = l),
      (pe = i),
      (Rt.transition = s);
  } else e.current = n;
  if (
    (fi && ((fi = !1), (Bn = e), (ll = o)),
    (s = e.pendingLanes),
    s === 0 && (Gn = null),
    vw(n.stateNode),
    dt(e, Pe()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      (o = t[n]), r(o.value, { componentStack: o.stack, digest: o.digest });
  if (il) throw ((il = !1), (e = au), (au = null), e);
  return (
    ll & 1 && e.tag !== 0 && io(),
    (s = e.pendingLanes),
    s & 1 ? (e === cu ? cs++ : ((cs = 0), (cu = e))) : (cs = 0),
    rr(),
    null
  );
}
function io() {
  if (Bn !== null) {
    var e = ag(ll),
      t = Rt.transition,
      n = pe;
    try {
      if (((Rt.transition = null), (pe = 16 > e ? 16 : e), Bn === null))
        var r = !1;
      else {
        if (((e = Bn), (Bn = null), (ll = 0), fe & 6)) throw Error(V(331));
        var o = fe;
        for (fe |= 4, K = e.current; K !== null; ) {
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
                      ls(8, u, s);
                  }
                  var f = u.child;
                  if (f !== null) (f.return = u), (K = f);
                  else
                    for (; K !== null; ) {
                      u = K;
                      var d = u.sibling,
                        m = u.return;
                      if ((wy(u), u === c)) {
                        K = null;
                        break;
                      }
                      if (d !== null) {
                        (d.return = m), (K = d);
                        break;
                      }
                      K = m;
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
                    ls(9, s, s.return);
                }
              var v = s.sibling;
              if (v !== null) {
                (v.return = s.return), (K = v);
                break e;
              }
              K = s.return;
            }
        }
        var g = e.current;
        for (K = g; K !== null; ) {
          i = K;
          var y = i.child;
          if (i.subtreeFlags & 2064 && y !== null) (y.return = i), (K = y);
          else
            e: for (i = g; K !== null; ) {
              if (((l = K), l.flags & 2048))
                try {
                  switch (l.tag) {
                    case 0:
                    case 11:
                    case 15:
                      jl(9, l);
                  }
                } catch (C) {
                  Re(l, l.return, C);
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
          ((fe = o), rr(), sn && typeof sn.onPostCommitFiberRoot == "function")
        )
          try {
            sn.onPostCommitFiberRoot(Rl, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      (pe = n), (Rt.transition = t);
    }
  }
  return !1;
}
function Hp(e, t, n) {
  (t = yo(n, t)),
    (t = ay(e, t, 1)),
    (e = Kn(e, t, 1)),
    (t = et()),
    e !== null && (Ls(e, 1, t), dt(e, t));
}
function Re(e, t, n) {
  if (e.tag === 3) Hp(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        Hp(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (Gn === null || !Gn.has(r)))
        ) {
          (e = yo(n, e)),
            (e = cy(t, e, 1)),
            (t = Kn(t, e, 1)),
            (e = et()),
            t !== null && (Ls(t, 1, e), dt(t, e));
          break;
        }
      }
      t = t.return;
    }
}
function WS(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t),
    (t = et()),
    (e.pingedLanes |= e.suspendedLanes & n),
    Me === e &&
      (He & n) === n &&
      (Le === 4 || (Le === 3 && (He & 130023424) === He && 500 > Pe() - kf)
        ? yr(e, 0)
        : (Ef |= n)),
    dt(e, t);
}
function Py(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = ti), (ti <<= 1), !(ti & 130023424) && (ti = 4194304))
      : (t = 1));
  var n = et();
  (e = xn(e, t)), e !== null && (Ls(e, t, n), dt(e, n));
}
function YS(e) {
  var t = e.memoizedState,
    n = 0;
  t !== null && (n = t.retryLane), Py(e, n);
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
      throw Error(V(314));
  }
  r !== null && r.delete(t), Py(e, n);
}
var Ty;
Ty = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || ut.current) lt = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return (lt = !1), LS(e, t, n);
      lt = !!(e.flags & 131072);
    }
  else (lt = !1), Se && t.flags & 1048576 && Lg(t, Ji, t.index);
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      Oi(e, t), (e = t.pendingProps);
      var o = po(t, Xe.current);
      so(t, n), (o = vf(null, t, r, e, o, n));
      var s = wf();
      return (
        (t.flags |= 1),
        typeof o == "object" &&
        o !== null &&
        typeof o.render == "function" &&
        o.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            ft(r) ? ((s = !0), qi(t)) : (s = !1),
            (t.memoizedState =
              o.state !== null && o.state !== void 0 ? o.state : null),
            pf(t),
            (o.updater = Ll),
            (t.stateNode = o),
            (o._reactInternals = t),
            Qc(t, r, e, n),
            (t = eu(null, t, r, !0, s, n)))
          : ((t.tag = 0), Se && s && sf(t), Je(null, t, o, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Oi(e, t),
          (e = t.pendingProps),
          (o = r._init),
          (r = o(r._payload)),
          (t.type = r),
          (o = t.tag = XS(r)),
          (e = Mt(r, e)),
          o)
        ) {
          case 0:
            t = Zc(null, t, r, e, n);
            break e;
          case 1:
            t = $p(null, t, r, e, n);
            break e;
          case 11:
            t = Op(null, t, r, e, n);
            break e;
          case 14:
            t = Np(null, t, r, Mt(r.type, e), n);
            break e;
        }
        throw Error(V(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        Zc(e, t, r, o, n)
      );
    case 1:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        $p(e, t, r, o, n)
      );
    case 3:
      e: {
        if ((py(t), e === null)) throw Error(V(387));
        (r = t.pendingProps),
          (s = t.memoizedState),
          (o = s.element),
          Ig(e, t),
          tl(t, r, null, n);
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
            (o = yo(Error(V(423)), t)), (t = Lp(e, t, r, n, o));
            break e;
          } else if (r !== o) {
            (o = yo(Error(V(424)), t)), (t = Lp(e, t, r, n, o));
            break e;
          } else
            for (
              vt = Yn(t.stateNode.containerInfo.firstChild),
                wt = t,
                Se = !0,
                It = null,
                n = Mg(t, null, r, n),
                t.child = n;
              n;

            )
              (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
        else {
          if ((mo(), r === o)) {
            t = bn(e, t, n);
            break e;
          }
          Je(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Bg(t),
        e === null && Gc(t),
        (r = t.type),
        (o = t.pendingProps),
        (s = e !== null ? e.memoizedProps : null),
        (i = o.children),
        Hc(r, o) ? (i = null) : s !== null && Hc(r, s) && (t.flags |= 32),
        dy(e, t),
        Je(e, t, i, n),
        t.child
      );
    case 6:
      return e === null && Gc(t), null;
    case 13:
      return my(e, t, n);
    case 4:
      return (
        mf(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = ho(t, null, r, n)) : Je(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        Op(e, t, r, o, n)
      );
    case 7:
      return Je(e, t, t.pendingProps, n), t.child;
    case 8:
      return Je(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return Je(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (o = t.pendingProps),
          (s = t.memoizedProps),
          (i = o.value),
          ge(Zi, r._currentValue),
          (r._currentValue = i),
          s !== null)
        )
          if (Wt(s.value, i)) {
            if (s.children === o.children && !ut.current) {
              t = bn(e, t, n);
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
                      (a = yn(-1, n & -n)), (a.tag = 2);
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
                      Xc(s.return, n, t),
                      (l.lanes |= n);
                    break;
                  }
                  a = a.next;
                }
              } else if (s.tag === 10) i = s.type === t.type ? null : s.child;
              else if (s.tag === 18) {
                if (((i = s.return), i === null)) throw Error(V(341));
                (i.lanes |= n),
                  (l = i.alternate),
                  l !== null && (l.lanes |= n),
                  Xc(i, n, t),
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
        Je(e, t, o.children, n), (t = t.child);
      }
      return t;
    case 9:
      return (
        (o = t.type),
        (r = t.pendingProps.children),
        so(t, n),
        (o = Pt(o)),
        (r = r(o)),
        (t.flags |= 1),
        Je(e, t, r, n),
        t.child
      );
    case 14:
      return (
        (r = t.type),
        (o = Mt(r, t.pendingProps)),
        (o = Mt(r.type, o)),
        Np(e, t, r, o, n)
      );
    case 15:
      return uy(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        Oi(e, t),
        (t.tag = 1),
        ft(r) ? ((e = !0), qi(t)) : (e = !1),
        so(t, n),
        ly(t, r, o),
        Qc(t, r, o, n),
        eu(null, t, r, !0, e, n)
      );
    case 19:
      return hy(e, t, n);
    case 22:
      return fy(e, t, n);
  }
  throw Error(V(156, t.tag));
};
function Oy(e, t) {
  return og(e, t);
}
function GS(e, t, n, r) {
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
function _t(e, t, n, r) {
  return new GS(e, t, n, r);
}
function Pf(e) {
  return (e = e.prototype), !(!e || !e.isReactComponent);
}
function XS(e) {
  if (typeof e == "function") return Pf(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Ku)) return 11;
    if (e === Gu) return 14;
  }
  return 2;
}
function qn(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = _t(e.tag, t, e.key, e.mode)),
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
function Li(e, t, n, r, o, s) {
  var i = 2;
  if (((r = e), typeof e == "function")) Pf(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else
    e: switch (e) {
      case Vr:
        return vr(n.children, o, s, t);
      case Yu:
        (i = 8), (o |= 8);
        break;
      case xc:
        return (
          (e = _t(12, n, t, o | 2)), (e.elementType = xc), (e.lanes = s), e
        );
      case bc:
        return (e = _t(13, n, t, o)), (e.elementType = bc), (e.lanes = s), e;
      case Cc:
        return (e = _t(19, n, t, o)), (e.elementType = Cc), (e.lanes = s), e;
      case Bh:
        return Fl(n, o, s, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case zh:
              i = 10;
              break e;
            case Ih:
              i = 9;
              break e;
            case Ku:
              i = 11;
              break e;
            case Gu:
              i = 14;
              break e;
            case Ln:
              (i = 16), (r = null);
              break e;
          }
        throw Error(V(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = _t(i, n, t, o)), (t.elementType = e), (t.type = r), (t.lanes = s), t
  );
}
function vr(e, t, n, r) {
  return (e = _t(7, e, r, t)), (e.lanes = n), e;
}
function Fl(e, t, n, r) {
  return (
    (e = _t(22, e, r, t)),
    (e.elementType = Bh),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function Za(e, t, n) {
  return (e = _t(6, e, null, t)), (e.lanes = n), e;
}
function ec(e, t, n) {
  return (
    (t = _t(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function qS(e, t, n, r, o) {
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
    (this.eventTimes = La(0)),
    (this.expirationTimes = La(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = La(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = o),
    (this.mutableSourceEagerHydrationData = null);
}
function Tf(e, t, n, r, o, s, i, l, a) {
  return (
    (e = new qS(e, t, n, l, a)),
    t === 1 ? ((t = 1), s === !0 && (t |= 8)) : (t = 0),
    (s = _t(3, null, null, t)),
    (e.current = s),
    (s.stateNode = e),
    (s.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    pf(s),
    e
  );
}
function QS(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Br,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Ny(e) {
  if (!e) return Jn;
  e = e._reactInternals;
  e: {
    if (Tr(e) !== e || e.tag !== 1) throw Error(V(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (ft(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(V(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (ft(n)) return Ng(e, n, t);
  }
  return t;
}
function $y(e, t, n, r, o, s, i, l, a) {
  return (
    (e = Tf(n, r, !0, e, o, s, i, l, a)),
    (e.context = Ny(null)),
    (n = e.current),
    (r = et()),
    (o = Xn(n)),
    (s = yn(r, o)),
    (s.callback = t ?? null),
    Kn(n, s, o),
    (e.current.lanes = o),
    Ls(e, o, r),
    dt(e, r),
    e
  );
}
function Ml(e, t, n, r) {
  var o = t.current,
    s = et(),
    i = Xn(o);
  return (
    (n = Ny(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = yn(s, i)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Kn(o, t, i)),
    e !== null && (Ht(e, o, i, s), Di(e, o, i)),
    i
  );
}
function cl(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Up(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Of(e, t) {
  Up(e, t), (e = e.alternate) && Up(e, t);
}
function JS() {
  return null;
}
var Ly =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function Nf(e) {
  this._internalRoot = e;
}
zl.prototype.render = Nf.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(V(409));
  Ml(e, t, null, null);
};
zl.prototype.unmount = Nf.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    kr(function () {
      Ml(null, e, null, null);
    }),
      (t[Sn] = null);
  }
};
function zl(e) {
  this._internalRoot = e;
}
zl.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = fg();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Fn.length && t !== 0 && t < Fn[n].priority; n++);
    Fn.splice(n, 0, e), n === 0 && pg(e);
  }
};
function $f(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Il(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Wp() {}
function ZS(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var s = r;
      r = function () {
        var c = cl(i);
        s.call(c);
      };
    }
    var i = $y(t, r, e, 0, null, !1, !1, "", Wp);
    return (
      (e._reactRootContainer = i),
      (e[Sn] = i.current),
      vs(e.nodeType === 8 ? e.parentNode : e),
      kr(),
      i
    );
  }
  for (; (o = e.lastChild); ) e.removeChild(o);
  if (typeof r == "function") {
    var l = r;
    r = function () {
      var c = cl(a);
      l.call(c);
    };
  }
  var a = Tf(e, 0, !1, null, null, !1, !1, "", Wp);
  return (
    (e._reactRootContainer = a),
    (e[Sn] = a.current),
    vs(e.nodeType === 8 ? e.parentNode : e),
    kr(function () {
      Ml(t, a, n, r);
    }),
    a
  );
}
function Bl(e, t, n, r, o) {
  var s = n._reactRootContainer;
  if (s) {
    var i = s;
    if (typeof o == "function") {
      var l = o;
      o = function () {
        var a = cl(i);
        l.call(a);
      };
    }
    Ml(t, i, e, o);
  } else i = ZS(n, t, e, o, r);
  return cl(i);
}
cg = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Zo(t.pendingLanes);
        n !== 0 &&
          (Qu(t, n | 1), dt(t, Pe()), !(fe & 6) && ((vo = Pe() + 500), rr()));
      }
      break;
    case 13:
      kr(function () {
        var r = xn(e, 1);
        if (r !== null) {
          var o = et();
          Ht(r, e, 1, o);
        }
      }),
        Of(e, 1);
  }
};
Ju = function (e) {
  if (e.tag === 13) {
    var t = xn(e, 134217728);
    if (t !== null) {
      var n = et();
      Ht(t, e, 134217728, n);
    }
    Of(e, 134217728);
  }
};
ug = function (e) {
  if (e.tag === 13) {
    var t = Xn(e),
      n = xn(e, t);
    if (n !== null) {
      var r = et();
      Ht(n, e, t, r);
    }
    Of(e, t);
  }
};
fg = function () {
  return pe;
};
dg = function (e, t) {
  var n = pe;
  try {
    return (pe = e), t();
  } finally {
    pe = n;
  }
};
$c = function (e, t, n) {
  switch (t) {
    case "input":
      if ((_c(e, n), (t = n.name), n.type === "radio" && t != null)) {
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
            var o = Ol(r);
            if (!o) throw Error(V(90));
            Hh(r), _c(r, o);
          }
        }
      }
      break;
    case "textarea":
      Wh(e, n);
      break;
    case "select":
      (t = n.value), t != null && to(e, !!n.multiple, t, !1);
  }
};
Jh = _f;
Zh = kr;
var ex = { usingClientEntryPoint: !1, Events: [As, Yr, Ol, qh, Qh, _f] },
  Yo = {
    findFiberByHostInstance: mr,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  tx = {
    bundleType: Yo.bundleType,
    version: Yo.version,
    rendererPackageName: Yo.rendererPackageName,
    rendererConfig: Yo.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: En.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return (e = ng(e)), e === null ? null : e.stateNode;
    },
    findFiberByHostInstance: Yo.findFiberByHostInstance || JS,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var di = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!di.isDisabled && di.supportsFiber)
    try {
      (Rl = di.inject(tx)), (sn = di);
    } catch {}
}
bt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ex;
bt.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!$f(t)) throw Error(V(200));
  return QS(e, t, null, n);
};
bt.createRoot = function (e, t) {
  if (!$f(e)) throw Error(V(299));
  var n = !1,
    r = "",
    o = Ly;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
    (t = Tf(e, 1, !1, null, null, n, !1, r, o)),
    (e[Sn] = t.current),
    vs(e.nodeType === 8 ? e.parentNode : e),
    new Nf(t)
  );
};
bt.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(V(188))
      : ((e = Object.keys(e).join(",")), Error(V(268, e)));
  return (e = ng(t)), (e = e === null ? null : e.stateNode), e;
};
bt.flushSync = function (e) {
  return kr(e);
};
bt.hydrate = function (e, t, n) {
  if (!Il(t)) throw Error(V(200));
  return Bl(null, e, t, !0, n);
};
bt.hydrateRoot = function (e, t, n) {
  if (!$f(e)) throw Error(V(405));
  var r = (n != null && n.hydratedSources) || null,
    o = !1,
    s = "",
    i = Ly;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (o = !0),
      n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (t = $y(t, null, e, 1, n ?? null, o, !1, s, i)),
    (e[Sn] = t.current),
    vs(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      (n = r[e]),
        (o = n._getVersion),
        (o = o(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, o])
          : t.mutableSourceEagerHydrationData.push(n, o);
  return new zl(t);
};
bt.render = function (e, t, n) {
  if (!Il(t)) throw Error(V(200));
  return Bl(null, e, t, !1, n);
};
bt.unmountComponentAtNode = function (e) {
  if (!Il(e)) throw Error(V(40));
  return e._reactRootContainer
    ? (kr(function () {
        Bl(null, null, e, !1, function () {
          (e._reactRootContainer = null), (e[Sn] = null);
        });
      }),
      !0)
    : !1;
};
bt.unstable_batchedUpdates = _f;
bt.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Il(n)) throw Error(V(200));
  if (e == null || e._reactInternals === void 0) throw Error(V(38));
  return Bl(e, t, n, !1, r);
};
bt.version = "18.3.1-next-f1338f8080-20240426";
function jy() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jy);
    } catch (e) {
      console.error(e);
    }
}
jy(), (jh.exports = bt);
var Vl = jh.exports;
const nx = Dr(Vl);
var Yp = Vl;
(wc.createRoot = Yp.createRoot), (wc.hydrateRoot = Yp.hydrateRoot);
var on = function () {
  return (
    (on =
      Object.assign ||
      function (t) {
        for (var n, r = 1, o = arguments.length; r < o; r++) {
          n = arguments[r];
          for (var s in n)
            Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
        }
        return t;
      }),
    on.apply(this, arguments)
  );
};
function Ay(e, t) {
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
function rx(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, o = t.length, s; r < o; r++)
      (s || !(r in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, r)), (s[r] = t[r]));
  return e.concat(s || Array.prototype.slice.call(t));
}
var ji = "right-scroll-bar-position",
  Ai = "width-before-scroll-bar",
  ox = "with-scroll-bars-hidden",
  sx = "--removed-body-scroll-bar-size";
function tc(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function ix(e, t) {
  var n = w.useState(function () {
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
var lx = typeof window < "u" ? w.useLayoutEffect : w.useEffect,
  Kp = new WeakMap();
function ax(e, t) {
  var n = ix(null, function (r) {
    return e.forEach(function (o) {
      return tc(o, r);
    });
  });
  return (
    lx(
      function () {
        var r = Kp.get(n);
        if (r) {
          var o = new Set(r),
            s = new Set(e),
            i = n.current;
          o.forEach(function (l) {
            s.has(l) || tc(l, null);
          }),
            s.forEach(function (l) {
              o.has(l) || tc(l, i);
            });
        }
        Kp.set(n, e);
      },
      [e]
    ),
    n
  );
}
function cx(e) {
  return e;
}
function ux(e, t) {
  t === void 0 && (t = cx);
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
function fx(e) {
  e === void 0 && (e = {});
  var t = ux(null);
  return (t.options = on({ async: !0, ssr: !1 }, e)), t;
}
var Fy = function (e) {
  var t = e.sideCar,
    n = Ay(e, ["sideCar"]);
  if (!t)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car"
    );
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return w.createElement(r, on({}, n));
};
Fy.isSideCarExport = !0;
function dx(e, t) {
  return e.useMedium(t), Fy;
}
var My = fx(),
  nc = function () {},
  Hl = w.forwardRef(function (e, t) {
    var n = w.useRef(null),
      r = w.useState({
        onScrollCapture: nc,
        onWheelCapture: nc,
        onTouchMoveCapture: nc,
      }),
      o = r[0],
      s = r[1],
      i = e.forwardProps,
      l = e.children,
      a = e.className,
      c = e.removeScrollBar,
      u = e.enabled,
      f = e.shards,
      d = e.sideCar,
      m = e.noIsolation,
      p = e.inert,
      h = e.allowPinchZoom,
      S = e.as,
      v = S === void 0 ? "div" : S,
      g = e.gapMode,
      y = Ay(e, [
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
      b = d,
      C = ax([n, t]),
      E = on(on({}, y), o);
    return w.createElement(
      w.Fragment,
      null,
      u &&
        w.createElement(b, {
          sideCar: My,
          removeScrollBar: c,
          shards: f,
          noIsolation: m,
          inert: p,
          setCallbacks: s,
          allowPinchZoom: !!h,
          lockRef: n,
          gapMode: g,
        }),
      i
        ? w.cloneElement(w.Children.only(l), on(on({}, E), { ref: C }))
        : w.createElement(v, on({}, E, { className: a, ref: C }), l)
    );
  });
Hl.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Hl.classNames = { fullWidth: Ai, zeroRight: ji };
var px = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function mx() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = px();
  return t && e.setAttribute("nonce", t), e;
}
function hx(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function gx(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var yx = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        e == 0 && (t = mx()) && (hx(t, n), gx(t)), e++;
      },
      remove: function () {
        e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null));
      },
    };
  },
  vx = function () {
    var e = yx();
    return function (t, n) {
      w.useEffect(
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
  zy = function () {
    var e = vx(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return e(r, o), null;
      };
    return t;
  },
  wx = { left: 0, top: 0, right: 0, gap: 0 },
  rc = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  Sx = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [rc(n), rc(r), rc(o)];
  },
  xx = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return wx;
    var t = Sx(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    };
  },
  bx = zy(),
  lo = "data-scroll-locked",
  Cx = function (e, t, n, r) {
    var o = e.left,
      s = e.top,
      i = e.right,
      l = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          ox,
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
          lo,
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
          ji,
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
          Ai,
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
        .concat(ji, " .")
        .concat(
          ji,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Ai, " .")
        .concat(
          Ai,
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
          lo,
          `] {
    `
        )
        .concat(sx, ": ")
        .concat(
          l,
          `px;
  }
`
        )
    );
  },
  Gp = function () {
    var e = parseInt(document.body.getAttribute(lo) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  Ex = function () {
    w.useEffect(function () {
      return (
        document.body.setAttribute(lo, (Gp() + 1).toString()),
        function () {
          var e = Gp() - 1;
          e <= 0
            ? document.body.removeAttribute(lo)
            : document.body.setAttribute(lo, e.toString());
        }
      );
    }, []);
  },
  kx = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    Ex();
    var s = w.useMemo(
      function () {
        return xx(o);
      },
      [o]
    );
    return w.createElement(bx, { styles: Cx(s, !t, o, n ? "" : "!important") });
  },
  du = !1;
if (typeof window < "u")
  try {
    var pi = Object.defineProperty({}, "passive", {
      get: function () {
        return (du = !0), !0;
      },
    });
    window.addEventListener("test", pi, pi),
      window.removeEventListener("test", pi, pi);
  } catch {
    du = !1;
  }
var Ar = du ? { passive: !1 } : !1,
  _x = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Iy = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== "hidden" &&
      !(n.overflowY === n.overflowX && !_x(e) && n[t] === "visible")
    );
  },
  Rx = function (e) {
    return Iy(e, "overflowY");
  },
  Dx = function (e) {
    return Iy(e, "overflowX");
  },
  Xp = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = By(e, r);
      if (o) {
        var s = Vy(e, r),
          i = s[1],
          l = s[2];
        if (i > l) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  Px = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Tx = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  By = function (e, t) {
    return e === "v" ? Rx(t) : Dx(t);
  },
  Vy = function (e, t) {
    return e === "v" ? Px(t) : Tx(t);
  },
  Ox = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  Nx = function (e, t, n, r, o) {
    var s = Ox(e, window.getComputedStyle(t).direction),
      i = s * r,
      l = n.target,
      a = t.contains(l),
      c = !1,
      u = i > 0,
      f = 0,
      d = 0;
    do {
      var m = Vy(e, l),
        p = m[0],
        h = m[1],
        S = m[2],
        v = h - S - s * p;
      (p || v) && By(e, l) && ((f += v), (d += p)),
        l instanceof ShadowRoot ? (l = l.host) : (l = l.parentNode);
    } while ((!a && l !== document.body) || (a && (t.contains(l) || t === l)));
    return (
      ((u && (Math.abs(f) < 1 || !o)) || (!u && (Math.abs(d) < 1 || !o))) &&
        (c = !0),
      c
    );
  },
  mi = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  qp = function (e) {
    return [e.deltaX, e.deltaY];
  },
  Qp = function (e) {
    return e && "current" in e ? e.current : e;
  },
  $x = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  Lx = function (e) {
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
  jx = 0,
  Fr = [];
function Ax(e) {
  var t = w.useRef([]),
    n = w.useRef([0, 0]),
    r = w.useRef(),
    o = w.useState(jx++)[0],
    s = w.useState(zy)[0],
    i = w.useRef(e);
  w.useEffect(
    function () {
      i.current = e;
    },
    [e]
  ),
    w.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(o));
          var h = rx([e.lockRef.current], (e.shards || []).map(Qp), !0).filter(
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
  var l = w.useCallback(function (h, S) {
      if ("touches" in h && h.touches.length === 2)
        return !i.current.allowPinchZoom;
      var v = mi(h),
        g = n.current,
        y = "deltaX" in h ? h.deltaX : g[0] - v[0],
        b = "deltaY" in h ? h.deltaY : g[1] - v[1],
        C,
        E = h.target,
        R = Math.abs(y) > Math.abs(b) ? "h" : "v";
      if ("touches" in h && R === "h" && E.type === "range") return !1;
      var D = Xp(R, E);
      if (!D) return !0;
      if ((D ? (C = R) : ((C = R === "v" ? "h" : "v"), (D = Xp(R, E))), !D))
        return !1;
      if (
        (!r.current && "changedTouches" in h && (y || b) && (r.current = C), !C)
      )
        return !0;
      var j = r.current || C;
      return Nx(j, S, h, j === "h" ? y : b, !0);
    }, []),
    a = w.useCallback(function (h) {
      var S = h;
      if (!(!Fr.length || Fr[Fr.length - 1] !== s)) {
        var v = "deltaY" in S ? qp(S) : mi(S),
          g = t.current.filter(function (C) {
            return (
              C.name === S.type &&
              (C.target === S.target || S.target === C.shadowParent) &&
              $x(C.delta, v)
            );
          })[0];
        if (g && g.should) {
          S.cancelable && S.preventDefault();
          return;
        }
        if (!g) {
          var y = (i.current.shards || [])
              .map(Qp)
              .filter(Boolean)
              .filter(function (C) {
                return C.contains(S.target);
              }),
            b = y.length > 0 ? l(S, y[0]) : !i.current.noIsolation;
          b && S.cancelable && S.preventDefault();
        }
      }
    }, []),
    c = w.useCallback(function (h, S, v, g) {
      var y = { name: h, delta: S, target: v, should: g, shadowParent: Fx(v) };
      t.current.push(y),
        setTimeout(function () {
          t.current = t.current.filter(function (b) {
            return b !== y;
          });
        }, 1);
    }, []),
    u = w.useCallback(function (h) {
      (n.current = mi(h)), (r.current = void 0);
    }, []),
    f = w.useCallback(function (h) {
      c(h.type, qp(h), h.target, l(h, e.lockRef.current));
    }, []),
    d = w.useCallback(function (h) {
      c(h.type, mi(h), h.target, l(h, e.lockRef.current));
    }, []);
  w.useEffect(function () {
    return (
      Fr.push(s),
      e.setCallbacks({
        onScrollCapture: f,
        onWheelCapture: f,
        onTouchMoveCapture: d,
      }),
      document.addEventListener("wheel", a, Ar),
      document.addEventListener("touchmove", a, Ar),
      document.addEventListener("touchstart", u, Ar),
      function () {
        (Fr = Fr.filter(function (h) {
          return h !== s;
        })),
          document.removeEventListener("wheel", a, Ar),
          document.removeEventListener("touchmove", a, Ar),
          document.removeEventListener("touchstart", u, Ar);
      }
    );
  }, []);
  var m = e.removeScrollBar,
    p = e.inert;
  return w.createElement(
    w.Fragment,
    null,
    p ? w.createElement(s, { styles: Lx(o) }) : null,
    m ? w.createElement(kx, { gapMode: e.gapMode }) : null
  );
}
function Fx(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode);
  return t;
}
const Mx = dx(My, Ax);
var Hy = w.forwardRef(function (e, t) {
  return w.createElement(Hl, on({}, e, { ref: t, sideCar: Mx }));
});
Hy.classNames = Hl.classNames;
function an(e) {
  return Object.keys(e);
}
function oc(e) {
  return e && typeof e == "object" && !Array.isArray(e);
}
function Lf(e, t) {
  const n = { ...e },
    r = t;
  return (
    oc(e) &&
      oc(t) &&
      Object.keys(t).forEach((o) => {
        oc(r[o]) && o in e ? (n[o] = Lf(n[o], r[o])) : (n[o] = r[o]);
      }),
    n
  );
}
function zx(e) {
  return e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function Ix(e) {
  var t;
  return typeof e != "string" || !e.includes("var(--mantine-scale)")
    ? e
    : (t = e.match(/^calc\((.*?)\)$/)) == null
    ? void 0
    : t[1].split("*")[0].trim();
}
function Bx(e) {
  const t = Ix(e);
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
function sc(e) {
  return e === "0rem" ? "0rem" : `calc(${e} * var(--mantine-scale))`;
}
function Uy(e, { shouldScale: t = !1 } = {}) {
  function n(r) {
    if (r === 0 || r === "0") return `0${e}`;
    if (typeof r == "number") {
      const o = `${r / 16}${e}`;
      return t ? sc(o) : o;
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
      if (r.includes(e)) return t ? sc(r) : r;
      const o = r.replace("px", "");
      if (!Number.isNaN(Number(o))) {
        const s = `${Number(o) / 16}${e}`;
        return t ? sc(s) : s;
      }
    }
    return r;
  }
  return n;
}
const z = Uy("rem", { shouldScale: !0 }),
  Jp = Uy("em");
function jf(e) {
  return Object.keys(e).reduce(
    (t, n) => (e[n] !== void 0 && (t[n] = e[n]), t),
    {}
  );
}
function Wy(e) {
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
function Po(e) {
  return Array.isArray(e) || e === null
    ? !1
    : typeof e == "object"
    ? e.type !== w.Fragment
    : !1;
}
function Or(e) {
  const t = w.createContext(null);
  return [
    ({ children: o, value: s }) => x.jsx(t.Provider, { value: s, children: o }),
    () => {
      const o = w.useContext(t);
      if (o === null) throw new Error(e);
      return o;
    },
  ];
}
function Vx(e = null) {
  const t = w.createContext(e);
  return [
    ({ children: o, value: s }) => x.jsx(t.Provider, { value: s, children: o }),
    () => w.useContext(t),
  ];
}
const Hx = { app: 100, modal: 200, popover: 300, overlay: 400, max: 9999 };
function Nr(e) {
  return Hx[e];
}
const Ux = () => {};
function Wx(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active
    ? t.onKeyDown || Ux
    : (n) => {
        var r;
        n.key === "Escape" && (e(n), (r = t.onTrigger) == null || r.call(t));
      };
}
function ze(e, t = "size", n = !0) {
  if (e !== void 0) return Wy(e) ? (n ? z(e) : e) : `var(--${t}-${e})`;
}
function Ul(e) {
  return ze(e, "mantine-spacing");
}
function or(e) {
  return e === void 0
    ? "var(--mantine-radius-default)"
    : ze(e, "mantine-radius");
}
function tt(e) {
  return ze(e, "mantine-font-size");
}
function Yx(e) {
  return ze(e, "mantine-line-height", !1);
}
function Af(e) {
  if (e) return ze(e, "mantine-shadow", !1);
}
function Kx(e, t, n) {
  return t === void 0 && n === void 0
    ? e
    : t !== void 0 && n === void 0
    ? Math.max(e, t)
    : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Yy() {
  return `mantine-${Math.random().toString(36).slice(2, 11)}`;
}
function Zp(e) {
  return typeof e != "string" ? "" : e.charAt(0).toUpperCase() + e.slice(1);
}
function dr(e) {
  const t = w.useRef(e);
  return (
    w.useEffect(() => {
      t.current = e;
    }),
    w.useMemo(
      () =>
        (...n) => {
          var r;
          return (r = t.current) == null ? void 0 : r.call(t, ...n);
        },
      []
    )
  );
}
function Wl(e, t) {
  const n = dr(e),
    r = w.useRef(0);
  return (
    w.useEffect(() => () => window.clearTimeout(r.current), []),
    w.useCallback(
      (...o) => {
        window.clearTimeout(r.current),
          (r.current = window.setTimeout(() => n(...o), t));
      },
      [n, t]
    )
  );
}
const em = ["mousedown", "touchstart"];
function Gx(e, t, n) {
  const r = w.useRef();
  return (
    w.useEffect(() => {
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
        (t || em).forEach((s) => document.addEventListener(s, o)),
        () => {
          (t || em).forEach((s) => document.removeEventListener(s, o));
        }
      );
    }, [r, e, n]),
    r
  );
}
function Xx(e, t) {
  try {
    return (
      e.addEventListener("change", t), () => e.removeEventListener("change", t)
    );
  } catch {
    return e.addListener(t), () => e.removeListener(t);
  }
}
function qx(e, t) {
  return typeof window < "u" && "matchMedia" in window
    ? window.matchMedia(e).matches
    : !1;
}
function Qx(
  e,
  t,
  { getInitialValueInEffect: n } = { getInitialValueInEffect: !0 }
) {
  const [r, o] = w.useState(n ? t : qx(e)),
    s = w.useRef();
  return (
    w.useEffect(() => {
      if ("matchMedia" in window)
        return (
          (s.current = window.matchMedia(e)),
          o(s.current.matches),
          Xx(s.current, (i) => o(i.matches))
        );
    }, [e]),
    r
  );
}
const Ms = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
function wo(e, t) {
  const n = w.useRef(!1);
  w.useEffect(
    () => () => {
      n.current = !1;
    },
    []
  ),
    w.useEffect(() => {
      if (n.current) return e();
      n.current = !0;
    }, t);
}
function Ky({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = w.useRef(),
    r = () => {
      var o;
      n.current &&
        "focus" in n.current &&
        typeof n.current.focus == "function" &&
        ((o = n.current) == null || o.focus({ preventScroll: !0 }));
    };
  return (
    wo(() => {
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
function Jx(e, t = "body > :not(script)") {
  const n = Yy(),
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
const Zx = /input|select|textarea|button|object/,
  Gy = "a, input, select, textarea, button, object, [tabindex]";
function eb(e) {
  return e.style.display === "none";
}
function tb(e) {
  if (
    e.getAttribute("aria-hidden") ||
    e.getAttribute("hidden") ||
    e.getAttribute("type") === "hidden"
  )
    return !1;
  let n = e;
  for (; n && !(n === document.body || n.nodeType === 11); ) {
    if (eb(n)) return !1;
    n = n.parentNode;
  }
  return !0;
}
function Xy(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function pu(e) {
  const t = e.nodeName.toLowerCase(),
    n = !Number.isNaN(Xy(e));
  return (
    ((Zx.test(t) && !e.disabled) ||
      (e instanceof HTMLAnchorElement && e.href) ||
      n) &&
    tb(e)
  );
}
function qy(e) {
  const t = Xy(e);
  return (Number.isNaN(t) || t >= 0) && pu(e);
}
function nb(e) {
  return Array.from(e.querySelectorAll(Gy)).filter(qy);
}
function rb(e, t) {
  const n = nb(e);
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
function ob(e = !0) {
  const t = w.useRef(),
    n = w.useRef(null),
    r = (s) => {
      let i = s.querySelector("[data-autofocus]");
      if (!i) {
        const l = Array.from(s.querySelectorAll(Gy));
        (i = l.find(qy) || l.find(pu) || null), !i && pu(s) && (i = s);
      }
      i && i.focus({ preventScroll: !0 });
    },
    o = w.useCallback(
      (s) => {
        if (e) {
          if (s === null) {
            n.current && (n.current(), (n.current = null));
            return;
          }
          (n.current = Jx(s)),
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
    w.useEffect(() => {
      if (!e) return;
      t.current && setTimeout(() => r(t.current));
      const s = (i) => {
        i.key === "Tab" && t.current && rb(t.current, i);
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
const sb = _l.useId || (() => {});
function ib() {
  const e = sb();
  return e ? `mantine-${e.replace(/:/g, "")}` : "";
}
function zs(e) {
  const t = ib(),
    [n, r] = w.useState(t);
  return (
    Ms(() => {
      r(Yy());
    }, []),
    typeof e == "string" ? e : typeof window > "u" ? t : n
  );
}
function lb(e, t, n) {
  w.useEffect(
    () => (
      window.addEventListener(e, t, n),
      () => window.removeEventListener(e, t, n)
    ),
    [e, t]
  );
}
function Ff(e, t) {
  typeof e == "function"
    ? e(t)
    : typeof e == "object" && e !== null && "current" in e && (e.current = t);
}
function ab(...e) {
  return (t) => {
    e.forEach((n) => Ff(n, t));
  };
}
function Nt(...e) {
  return w.useCallback(ab(...e), e);
}
function So({
  value: e,
  defaultValue: t,
  finalValue: n,
  onChange: r = () => {},
}) {
  const [o, s] = w.useState(t !== void 0 ? t : n),
    i = (l, ...a) => {
      s(l), r == null || r(l, ...a);
    };
  return e !== void 0 ? [e, r, !0] : [o, i, !1];
}
function Qy(e, t) {
  return Qx("(prefers-reduced-motion: reduce)", e, t);
}
function Jy(e = !1, t) {
  const { onOpen: n, onClose: r } = {},
    [o, s] = w.useState(e),
    i = w.useCallback(() => {
      s((c) => c || (n == null || n(), !0));
    }, [n]),
    l = w.useCallback(() => {
      s((c) => c && (r == null || r(), !1));
    }, [r]),
    a = w.useCallback(() => {
      o ? l() : i();
    }, [l, i, o]);
  return [o, { open: i, close: l, toggle: a }];
}
var cb = {};
function ub() {
  return typeof process < "u" && cb ? "production" : "development";
}
function Zy(e) {
  var t,
    n,
    r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (n = Zy(e[t])) && (r && (r += " "), (r += n));
    } else for (n in e) e[n] && (r && (r += " "), (r += n));
  return r;
}
function nt() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = Zy(e)) && (r && (r += " "), (r += t));
  return r;
}
const fb = {};
function db(e) {
  const t = {};
  return (
    e.forEach((n) => {
      Object.entries(n).forEach(([r, o]) => {
        t[r] ? (t[r] = nt(t[r], o)) : (t[r] = o);
      });
    }),
    t
  );
}
function Yl({ theme: e, classNames: t, props: n, stylesCtx: r }) {
  const s = (Array.isArray(t) ? t : [t]).map((i) =>
    typeof i == "function" ? i(e, n, r) : i || fb
  );
  return db(s);
}
function ul({ theme: e, styles: t, props: n, stylesCtx: r }) {
  return (Array.isArray(t) ? t : [t]).reduce(
    (s, i) =>
      typeof i == "function" ? { ...s, ...i(e, n, r) } : { ...s, ...i },
    {}
  );
}
const ev = w.createContext(null);
function $r() {
  const e = w.useContext(ev);
  if (!e)
    throw new Error("[@mantine/core] MantineProvider was not found in tree");
  return e;
}
function pb() {
  return $r().cssVariablesResolver;
}
function mb() {
  return $r().classNamesPrefix;
}
function Mf() {
  return $r().getStyleNonce;
}
function hb() {
  return $r().withStaticClasses;
}
function gb() {
  return $r().headless;
}
function yb() {
  var e;
  return (e = $r().stylesTransform) == null ? void 0 : e.sx;
}
function vb() {
  var e;
  return (e = $r().stylesTransform) == null ? void 0 : e.styles;
}
function wb(e) {
  return /^#?([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(e);
}
function Sb(e) {
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
function xb(e) {
  const [t, n, r, o] = e
    .replace(/[^0-9,./]/g, "")
    .split(/[/,]/)
    .map(Number);
  return { r: t, g: n, b: r, a: o || 1 };
}
function bb(e) {
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
  let f, d, m;
  return (
    a >= 0 && a < 1
      ? ((f = l), (d = c), (m = 0))
      : a >= 1 && a < 2
      ? ((f = c), (d = l), (m = 0))
      : a >= 2 && a < 3
      ? ((f = 0), (d = l), (m = c))
      : a >= 3 && a < 4
      ? ((f = 0), (d = c), (m = l))
      : a >= 4 && a < 5
      ? ((f = c), (d = 0), (m = l))
      : ((f = l), (d = 0), (m = c)),
    {
      r: Math.round((f + u) * 255),
      g: Math.round((d + u) * 255),
      b: Math.round((m + u) * 255),
      a: i || 1,
    }
  );
}
function zf(e) {
  return wb(e)
    ? Sb(e)
    : e.startsWith("rgb")
    ? xb(e)
    : e.startsWith("hsl")
    ? bb(e)
    : { r: 0, g: 0, b: 0, a: 1 };
}
function hi(e, t) {
  if (e.startsWith("var("))
    return `color-mix(in srgb, ${e}, black ${t * 100}%)`;
  const { r: n, g: r, b: o, a: s } = zf(e),
    i = 1 - t,
    l = (a) => Math.round(a * i);
  return `rgba(${l(n)}, ${l(r)}, ${l(o)}, ${s})`;
}
function Rs(e, t) {
  return typeof e.primaryShade == "number"
    ? e.primaryShade
    : t === "dark"
    ? e.primaryShade.dark
    : e.primaryShade.light;
}
function ic(e) {
  return e <= 0.03928 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4;
}
function Cb(e) {
  const t = e.match(/oklch\((.*?)%\s/);
  return t ? parseFloat(t[1]) : null;
}
function Eb(e) {
  if (e.startsWith("oklch(")) return (Cb(e) || 0) / 100;
  const { r: t, g: n, b: r } = zf(e),
    o = t / 255,
    s = n / 255,
    i = r / 255,
    l = ic(o),
    a = ic(s),
    c = ic(i);
  return 0.2126 * l + 0.7152 * a + 0.0722 * c;
}
function Ko(e, t = 0.179) {
  return e.startsWith("var(") ? !1 : Eb(e) > t;
}
function Is({ color: e, theme: t, colorScheme: n }) {
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
      isLight: Ko(n === "dark" ? t.white : t.black, t.luminanceThreshold),
      variable: "--mantine-color-bright",
    };
  if (e === "dimmed")
    return {
      color: e,
      value: n === "dark" ? t.colors.dark[2] : t.colors.gray[7],
      shade: void 0,
      isThemeColor: !1,
      isLight: Ko(
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
      isLight: Ko(e === "white" ? t.white : t.black, t.luminanceThreshold),
      variable: `--mantine-color-${e}`,
    };
  const [r, o] = e.split("."),
    s = o ? Number(o) : void 0,
    i = r in t.colors;
  if (i) {
    const l = s !== void 0 ? t.colors[r][s] : t.colors[r][Rs(t, n || "light")];
    return {
      color: r,
      value: l,
      shade: s,
      isThemeColor: i,
      isLight: Ko(l, t.luminanceThreshold),
      variable: o ? `--mantine-color-${r}-${s}` : `--mantine-color-${r}-filled`,
    };
  }
  return {
    color: e,
    value: e,
    isThemeColor: i,
    isLight: Ko(e, t.luminanceThreshold),
    shade: s,
    variable: void 0,
  };
}
function fl(e, t) {
  const n = Is({ color: e || t.primaryColor, theme: t });
  return n.variable ? `var(${n.variable})` : e;
}
function mu(e, t) {
  const n = {
      from: (e == null ? void 0 : e.from) || t.defaultGradient.from,
      to: (e == null ? void 0 : e.to) || t.defaultGradient.to,
      deg: (e == null ? void 0 : e.deg) || t.defaultGradient.deg || 0,
    },
    r = fl(n.from, t),
    o = fl(n.to, t);
  return `linear-gradient(${n.deg}deg, ${r} 0%, ${o} 100%)`;
}
function tn(e, t) {
  if (typeof e != "string" || t > 1 || t < 0) return "rgba(0, 0, 0, 1)";
  if (e.startsWith("var(")) {
    const s = (1 - t) * 100;
    return `color-mix(in srgb, ${e}, transparent ${s}%)`;
  }
  if (e.startsWith("oklch"))
    return e.includes("/")
      ? e.replace(/\/\s*[\d.]+\s*\)/, `/ ${t})`)
      : e.replace(")", ` / ${t})`);
  const { r: n, g: r, b: o } = zf(e);
  return `rgba(${n}, ${r}, ${o}, ${t})`;
}
const Mr = tn,
  kb = ({ color: e, theme: t, variant: n, gradient: r, autoContrast: o }) => {
    const s = Is({ color: e, theme: t }),
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
            hover: hi(e, 0.1),
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
          background: tn(l, 0.1),
          hover: tn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: tn(e, 0.1),
        hover: tn(e, 0.12),
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
              hover: tn(t.colors[s.color][s.shade], 0.05),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid var(--mantine-color-${s.color}-${
                s.shade
              })`,
            }
        : {
            background: "transparent",
            hover: tn(e, 0.05),
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
          hover: tn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: "transparent",
        hover: tn(e, 0.12),
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
              hover: hi(t.white, 0.01),
              color: `var(--mantine-color-${e}-filled)`,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: "var(--mantine-color-white)",
              hover: hi(t.white, 0.01),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: "var(--mantine-color-white)",
            hover: hi(t.white, 0.01),
            color: e,
            border: `${z(1)} solid transparent`,
          }
      : n === "gradient"
      ? {
          background: mu(r, t),
          hover: mu(r, t),
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
  _b = {
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
  tm =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
  If = {
    scale: 1,
    fontSmoothing: !0,
    focusRing: "auto",
    white: "#fff",
    black: "#000",
    colors: _b,
    primaryShade: { light: 6, dark: 8 },
    primaryColor: "blue",
    variantColorResolver: kb,
    autoContrast: !1,
    luminanceThreshold: 0.3,
    fontFamily: tm,
    fontFamilyMonospace:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    respectReducedMotion: !1,
    cursorType: "default",
    defaultGradient: { from: "blue", to: "cyan", deg: 45 },
    defaultRadius: "sm",
    activeClassName: "mantine-active",
    focusClassName: "",
    headings: {
      fontFamily: tm,
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
function nm(e) {
  return e === "auto" || e === "dark" || e === "light";
}
function Rb({ key: e = "mantine-color-scheme-value" } = {}) {
  let t;
  return {
    get: (n) => {
      if (typeof window > "u") return n;
      try {
        const r = window.localStorage.getItem(e);
        return nm(r) ? r : n;
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
          nm(r.newValue) &&
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
const Db =
    "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color",
  rm =
    "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
function lc(e) {
  return e < 0 || e > 9 ? !1 : parseInt(e.toString(), 10) === e;
}
function om(e) {
  if (!(e.primaryColor in e.colors)) throw new Error(Db);
  if (
    typeof e.primaryShade == "object" &&
    (!lc(e.primaryShade.dark) || !lc(e.primaryShade.light))
  )
    throw new Error(rm);
  if (typeof e.primaryShade == "number" && !lc(e.primaryShade))
    throw new Error(rm);
}
function Pb(e, t) {
  var r;
  if (!t) return om(e), e;
  const n = Lf(e, t);
  return (
    t.fontFamily &&
      !((r = t.headings) != null && r.fontFamily) &&
      (n.headings.fontFamily = t.fontFamily),
    om(n),
    n
  );
}
const Bf = w.createContext(null),
  Tb = () => w.useContext(Bf) || If;
function kn() {
  const e = w.useContext(Bf);
  if (!e)
    throw new Error(
      "@mantine/core: MantineProvider was not found in component tree, make sure you have it in your app"
    );
  return e;
}
function tv({ theme: e, children: t, inherit: n = !0 }) {
  const r = Tb(),
    o = w.useMemo(() => Pb(n ? r : If, e), [e, r, n]);
  return x.jsx(Bf.Provider, { value: o, children: t });
}
tv.displayName = "@mantine/core/MantineThemeProvider";
function Ob() {
  const e = kn(),
    t = Mf(),
    n = an(e.breakpoints).reduce((r, o) => {
      const s = e.breakpoints[o].includes("px"),
        i = Bx(e.breakpoints[o]),
        l = s ? `${i - 0.1}px` : Jp(i - 0.1),
        a = s ? `${i}px` : Jp(i);
      return `${r}@media (max-width: ${l}) {.mantine-visible-from-${o} {display: none !important;}}@media (min-width: ${a}) {.mantine-hidden-from-${o} {display: none !important;}}`;
    }, "");
  return x.jsx("style", {
    "data-mantine-styles": "classes",
    nonce: t == null ? void 0 : t(),
    dangerouslySetInnerHTML: { __html: n },
  });
}
function ac(e) {
  return Object.entries(e)
    .map(([t, n]) => `${t}: ${n};`)
    .join("");
}
function cc(e, t) {
  return (Array.isArray(e) ? e : [e]).reduce((r, o) => `${o}{${r}}`, t);
}
function Nb(e, t) {
  const n = ac(e.variables),
    r = n ? cc(t, n) : "",
    o = ac(e.dark),
    s = o ? cc(`${t}[data-mantine-color-scheme="dark"]`, o) : "",
    i = ac(e.light),
    l = i ? cc(`${t}[data-mantine-color-scheme="light"]`, i) : "";
  return `${r}${s}${l}`;
}
function $b({ color: e, theme: t, autoContrast: n }) {
  return (typeof n == "boolean" ? n : t.autoContrast) &&
    Is({ color: e || t.primaryColor, theme: t }).isLight
    ? "var(--mantine-color-black)"
    : "var(--mantine-color-white)";
}
function sm(e, t) {
  return $b({
    color: e.colors[e.primaryColor][Rs(e, t)],
    theme: e,
    autoContrast: null,
  });
}
function gi({
  theme: e,
  color: t,
  colorScheme: n,
  name: r = t,
  withColorValues: o = !0,
}) {
  if (!e.colors[t]) return {};
  if (n === "light") {
    const l = Rs(e, "light"),
      a = {
        [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-filled)`,
        [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
          l === 9 ? 8 : l + 1
        })`,
        [`--mantine-color-${r}-light`]: Mr(e.colors[t][l], 0.1),
        [`--mantine-color-${r}-light-hover`]: Mr(e.colors[t][l], 0.12),
        [`--mantine-color-${r}-light-color`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline-hover`]: Mr(e.colors[t][l], 0.05),
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
  const s = Rs(e, "dark"),
    i = {
      [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-4)`,
      [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${s})`,
      [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
        s === 9 ? 8 : s + 1
      })`,
      [`--mantine-color-${r}-light`]: Mr(e.colors[t][Math.max(0, s - 2)], 0.15),
      [`--mantine-color-${r}-light-hover`]: Mr(
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
      [`--mantine-color-${r}-outline-hover`]: Mr(
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
function Lb(e) {
  return !!e && typeof e == "object" && "mantine-virtual-color" in e;
}
function zr(e, t, n) {
  an(t).forEach((r) => Object.assign(e, { [`--mantine-${n}-${r}`]: t[r] }));
}
const nv = (e) => {
  const t = Rs(e, "light"),
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
        "--mantine-primary-color-contrast": sm(e, "light"),
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
        "--mantine-primary-color-contrast": sm(e, "dark"),
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
  zr(r.variables, e.breakpoints, "breakpoint"),
    zr(r.variables, e.spacing, "spacing"),
    zr(r.variables, e.fontSizes, "font-size"),
    zr(r.variables, e.lineHeights, "line-height"),
    zr(r.variables, e.shadows, "shadow"),
    zr(r.variables, e.radius, "radius"),
    e.colors[e.primaryColor].forEach((s, i) => {
      r.variables[
        `--mantine-primary-color-${i}`
      ] = `var(--mantine-color-${e.primaryColor}-${i})`;
    }),
    an(e.colors).forEach((s) => {
      const i = e.colors[s];
      if (Lb(i)) {
        Object.assign(
          r.light,
          gi({
            theme: e,
            name: i.name,
            color: i.light,
            colorScheme: "light",
            withColorValues: !0,
          })
        ),
          Object.assign(
            r.dark,
            gi({
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
          gi({ theme: e, color: s, colorScheme: "light", withColorValues: !1 })
        ),
        Object.assign(
          r.dark,
          gi({ theme: e, color: s, colorScheme: "dark", withColorValues: !1 })
        );
    });
  const o = e.headings.sizes;
  return (
    an(o).forEach((s) => {
      (r.variables[`--mantine-${s}-font-size`] = o[s].fontSize),
        (r.variables[`--mantine-${s}-line-height`] = o[s].lineHeight),
        (r.variables[`--mantine-${s}-font-weight`] =
          o[s].fontWeight || e.headings.fontWeight);
    }),
    r
  );
};
function jb({ theme: e, generator: t }) {
  const n = nv(e),
    r = t == null ? void 0 : t(e);
  return r ? Lf(n, r) : n;
}
const uc = nv(If);
function Ab(e) {
  const t = { variables: {}, light: {}, dark: {} };
  return (
    an(e.variables).forEach((n) => {
      uc.variables[n] !== e.variables[n] && (t.variables[n] = e.variables[n]);
    }),
    an(e.light).forEach((n) => {
      uc.light[n] !== e.light[n] && (t.light[n] = e.light[n]);
    }),
    an(e.dark).forEach((n) => {
      uc.dark[n] !== e.dark[n] && (t.dark[n] = e.dark[n]);
    }),
    t
  );
}
function Fb(e) {
  return `
  ${e}[data-mantine-color-scheme="dark"] { --mantine-color-scheme: dark; }
  ${e}[data-mantine-color-scheme="light"] { --mantine-color-scheme: light; }
`;
}
function rv({ cssVariablesSelector: e, deduplicateCssVariables: t }) {
  const n = kn(),
    r = Mf(),
    o = pb(),
    s = jb({ theme: n, generator: o }),
    i = e === ":root" && t,
    l = i ? Ab(s) : s,
    a = Nb(l, e);
  return a
    ? x.jsx("style", {
        "data-mantine-styles": !0,
        nonce: r == null ? void 0 : r(),
        dangerouslySetInnerHTML: { __html: `${a}${i ? "" : Fb(e)}` },
      })
    : null;
}
rv.displayName = "@mantine/CssVariables";
function Mb() {
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
function Ir(e, t) {
  var r;
  const n =
    e !== "auto"
      ? e
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  (r = t()) == null || r.setAttribute("data-mantine-color-scheme", n);
}
function zb({
  manager: e,
  defaultColorScheme: t,
  getRootElement: n,
  forceColorScheme: r,
}) {
  const o = w.useRef(),
    [s, i] = w.useState(() => e.get(t)),
    l = r || s,
    a = w.useCallback(
      (u) => {
        r || (Ir(u, n), i(u), e.set(u));
      },
      [e.set, l, r]
    ),
    c = w.useCallback(() => {
      i(t), Ir(t, n), e.clear();
    }, [e.clear, t]);
  return (
    w.useEffect(
      () => (e.subscribe(a), e.unsubscribe),
      [e.subscribe, e.unsubscribe]
    ),
    Ms(() => {
      Ir(e.get(t), n);
    }, []),
    w.useEffect(() => {
      var f;
      if (r) return Ir(r, n), () => {};
      r === void 0 && Ir(s, n),
        (o.current = window.matchMedia("(prefers-color-scheme: dark)"));
      const u = (d) => {
        s === "auto" && Ir(d.matches ? "dark" : "light", n);
      };
      return (
        (f = o.current) == null || f.addEventListener("change", u),
        () => {
          var d;
          return (d = o.current) == null
            ? void 0
            : d.removeEventListener("change", u);
        }
      );
    }, [s, r]),
    { colorScheme: l, setColorScheme: a, clearColorScheme: c }
  );
}
function Ib({ respectReducedMotion: e, getRootElement: t }) {
  Ms(() => {
    var n;
    e &&
      ((n = t()) == null ||
        n.setAttribute("data-respect-reduced-motion", "true"));
  }, [e]);
}
Mb();
function ov({
  theme: e,
  children: t,
  getStyleNonce: n,
  withStaticClasses: r = !0,
  withGlobalClasses: o = !0,
  deduplicateCssVariables: s = !0,
  withCssVariables: i = !0,
  cssVariablesSelector: l = ":root",
  classNamesPrefix: a = "mantine",
  colorSchemeManager: c = Rb(),
  defaultColorScheme: u = "light",
  getRootElement: f = () => document.documentElement,
  cssVariablesResolver: d,
  forceColorScheme: m,
  stylesTransform: p,
}) {
  const {
    colorScheme: h,
    setColorScheme: S,
    clearColorScheme: v,
  } = zb({
    defaultColorScheme: u,
    forceColorScheme: m,
    manager: c,
    getRootElement: f,
  });
  return (
    Ib({
      respectReducedMotion: (e == null ? void 0 : e.respectReducedMotion) || !1,
      getRootElement: f,
    }),
    x.jsx(ev.Provider, {
      value: {
        colorScheme: h,
        setColorScheme: S,
        clearColorScheme: v,
        getRootElement: f,
        classNamesPrefix: a,
        getStyleNonce: n,
        cssVariablesResolver: d,
        cssVariablesSelector: l,
        withStaticClasses: r,
        stylesTransform: p,
      },
      children: x.jsxs(tv, {
        theme: e,
        children: [
          i &&
            x.jsx(rv, { cssVariablesSelector: l, deduplicateCssVariables: s }),
          o && x.jsx(Ob, {}),
          t,
        ],
      }),
    })
  );
}
ov.displayName = "@mantine/core/MantineProvider";
function Bs({ classNames: e, styles: t, props: n, stylesCtx: r }) {
  const o = kn();
  return {
    resolvedClassNames: Yl({
      theme: o,
      classNames: e,
      props: n,
      stylesCtx: r || void 0,
    }),
    resolvedStyles: ul({
      theme: o,
      styles: t,
      props: n,
      stylesCtx: r || void 0,
    }),
  };
}
const Bb = {
  always: "mantine-focus-always",
  auto: "mantine-focus-auto",
  never: "mantine-focus-never",
};
function Vb({ theme: e, options: t, unstyled: n }) {
  return nt(
    (t == null ? void 0 : t.focusable) &&
      !n &&
      (e.focusClassName || Bb[e.focusRing]),
    (t == null ? void 0 : t.active) && !n && e.activeClassName
  );
}
function Hb({ selector: e, stylesCtx: t, options: n, props: r, theme: o }) {
  return Yl({
    theme: o,
    classNames: n == null ? void 0 : n.classNames,
    props: (n == null ? void 0 : n.props) || r,
    stylesCtx: t,
  })[e];
}
function im({ selector: e, stylesCtx: t, theme: n, classNames: r, props: o }) {
  return Yl({ theme: n, classNames: r, props: o, stylesCtx: t })[e];
}
function Ub({ rootSelector: e, selector: t, className: n }) {
  return e === t ? n : void 0;
}
function Wb({ selector: e, classes: t, unstyled: n }) {
  return n ? void 0 : t[e];
}
function Yb({
  themeName: e,
  classNamesPrefix: t,
  selector: n,
  withStaticClass: r,
}) {
  return r === !1 ? [] : e.map((o) => `${t}-${o}-${n}`);
}
function Kb({ themeName: e, theme: t, selector: n, props: r, stylesCtx: o }) {
  return e.map((s) => {
    var i, l;
    return (l = Yl({
      theme: t,
      classNames: (i = t.components[s]) == null ? void 0 : i.classNames,
      props: r,
      stylesCtx: o,
    })) == null
      ? void 0
      : l[n];
  });
}
function Gb({ options: e, classes: t, selector: n, unstyled: r }) {
  return e != null && e.variant && !r ? t[`${n}--${e.variant}`] : void 0;
}
function Xb({
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
  stylesCtx: f,
  withStaticClasses: d,
  headless: m,
  transformedStyles: p,
}) {
  return nt(
    Vb({ theme: e, options: t, unstyled: l || m }),
    Kb({ theme: e, themeName: n, selector: r, props: u, stylesCtx: f }),
    Gb({ options: t, classes: i, selector: r, unstyled: l }),
    im({ selector: r, stylesCtx: f, theme: e, classNames: s, props: u }),
    im({ selector: r, stylesCtx: f, theme: e, classNames: p, props: u }),
    Hb({ selector: r, stylesCtx: f, options: t, props: u, theme: e }),
    Ub({ rootSelector: c, selector: r, className: a }),
    Wb({ selector: r, classes: i, unstyled: l || m }),
    d &&
      !m &&
      Yb({
        themeName: n,
        classNamesPrefix: o,
        selector: r,
        withStaticClass: t == null ? void 0 : t.withStaticClass,
      }),
    t == null ? void 0 : t.className
  );
}
function qb({ theme: e, themeName: t, props: n, stylesCtx: r, selector: o }) {
  return t
    .map((s) => {
      var i;
      return ul({
        theme: e,
        styles: (i = e.components[s]) == null ? void 0 : i.styles,
        props: n,
        stylesCtx: r,
      })[o];
    })
    .reduce((s, i) => ({ ...s, ...i }), {});
}
function hu({ style: e, theme: t }) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...hu({ style: r, theme: t }) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function Qb(e) {
  return e.reduce(
    (t, n) => (
      n &&
        Object.keys(n).forEach((r) => {
          t[r] = { ...t[r], ...jf(n[r]) };
        }),
      t
    ),
    {}
  );
}
function Jb({
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
  return (a = Qb([
    l ? {} : t == null ? void 0 : t(n, r, o),
    ...i.map((c) => {
      var u, f, d;
      return (d =
        (f = (u = n.components) == null ? void 0 : u[c]) == null
          ? void 0
          : f.vars) == null
        ? void 0
        : d.call(f, n, r, o);
    }),
    e == null ? void 0 : e(n, r, o),
  ])) == null
    ? void 0
    : a[s];
}
function Zb({
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
  headless: f,
  withStylesTransform: d,
}) {
  return {
    ...(!d &&
      qb({ theme: e, themeName: t, props: o, stylesCtx: s, selector: n })),
    ...(!d && ul({ theme: e, styles: l, props: o, stylesCtx: s })[n]),
    ...(!d &&
      ul({
        theme: e,
        styles: r == null ? void 0 : r.styles,
        props: (r == null ? void 0 : r.props) || o,
        stylesCtx: s,
      })[n]),
    ...Jb({
      theme: e,
      props: o,
      stylesCtx: s,
      vars: c,
      varsResolver: u,
      selector: n,
      themeName: t,
      headless: f,
    }),
    ...(i === n ? hu({ style: a, theme: e }) : null),
    ...hu({ style: r == null ? void 0 : r.style, theme: e }),
  };
}
function eC({ props: e, stylesCtx: t, themeName: n }) {
  var i;
  const r = kn(),
    o = (i = vb()) == null ? void 0 : i();
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
  varsResolver: f,
}) {
  const d = kn(),
    m = mb(),
    p = hb(),
    h = gb(),
    S = (Array.isArray(e) ? e : [e]).filter((y) => y),
    { withStylesTransform: v, getTransformedStyles: g } = eC({
      props: n,
      stylesCtx: r,
      themeName: S,
    });
  return (y, b) => ({
    className: Xb({
      theme: d,
      options: b,
      themeName: S,
      selector: y,
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
      transformedStyles: g([b == null ? void 0 : b.styles, c]),
    }),
    style: Zb({
      theme: d,
      themeName: S,
      selector: y,
      options: b,
      props: n,
      stylesCtx: r,
      rootSelector: i,
      styles: c,
      style: s,
      vars: u,
      varsResolver: f,
      headless: h,
      withStylesTransform: v,
    }),
  });
}
function W(e, t, n) {
  var i;
  const r = kn(),
    o = (i = r.components[e]) == null ? void 0 : i.defaultProps,
    s = typeof o == "function" ? o(r) : o;
  return { ...t, ...s, ...jf(n) };
}
function lm(e) {
  return an(e)
    .reduce((t, n) => (e[n] !== void 0 ? `${t}${zx(n)}:${e[n]};` : t), "")
    .trim();
}
function tC({ selector: e, styles: t, media: n }) {
  const r = t ? lm(t) : "",
    o = Array.isArray(n)
      ? n.map((s) => `@media${s.query}{${e}{${lm(s.styles)}}}`)
      : [];
  return `${r ? `${e}{${r}}` : ""}${o.join("")}`.trim();
}
function nC({ selector: e, styles: t, media: n }) {
  const r = Mf();
  return x.jsx("style", {
    "data-mantine-styles": "inline",
    nonce: r == null ? void 0 : r(),
    dangerouslySetInnerHTML: {
      __html: tC({ selector: e, styles: t, media: n }),
    },
  });
}
function Vf(e) {
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
    px: f,
    py: d,
    pt: m,
    pb: p,
    pl: h,
    pr: S,
    pe: v,
    ps: g,
    bg: y,
    c: b,
    opacity: C,
    ff: E,
    fz: R,
    fw: D,
    lts: j,
    ta: T,
    lh: M,
    fs: B,
    tt: H,
    td: F,
    w: L,
    miw: P,
    maw: O,
    h: _,
    mih: k,
    mah: $,
    bgsz: N,
    bgp: I,
    bgr: Y,
    bga: X,
    pos: ee,
    top: ne,
    left: te,
    bottom: me,
    right: oe,
    inset: le,
    display: q,
    flex: ye,
    hiddenFrom: ce,
    visibleFrom: se,
    lightHidden: Oe,
    darkHidden: qe,
    sx: xe,
    ...gt
  } = e;
  return {
    styleProps: jf({
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
      px: f,
      py: d,
      pt: m,
      pb: p,
      pl: h,
      pr: S,
      pe: v,
      ps: g,
      bg: y,
      c: b,
      opacity: C,
      ff: E,
      fz: R,
      fw: D,
      lts: j,
      ta: T,
      lh: M,
      fs: B,
      tt: H,
      td: F,
      w: L,
      miw: P,
      maw: O,
      h: _,
      mih: k,
      mah: $,
      bgsz: N,
      bgp: I,
      bgr: Y,
      bga: X,
      pos: ee,
      top: ne,
      left: te,
      bottom: me,
      right: oe,
      inset: le,
      display: q,
      flex: ye,
      hiddenFrom: ce,
      visibleFrom: se,
      lightHidden: Oe,
      darkHidden: qe,
      sx: xe,
    }),
    rest: gt,
  };
}
const rC = {
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
function sv(e, t) {
  const n = Is({ color: e, theme: t });
  return n.color === "dimmed"
    ? "var(--mantine-color-dimmed)"
    : n.color === "bright"
    ? "var(--mantine-color-bright)"
    : n.variable
    ? `var(${n.variable})`
    : n.color;
}
function oC(e, t) {
  const n = Is({ color: e, theme: t });
  return n.isThemeColor && n.shade === void 0
    ? `var(--mantine-color-${n.color}-text)`
    : sv(e, t);
}
const am = {
  text: "var(--mantine-font-family)",
  mono: "var(--mantine-font-family-monospace)",
  monospace: "var(--mantine-font-family-monospace)",
  heading: "var(--mantine-font-family-headings)",
  headings: "var(--mantine-font-family-headings)",
};
function sC(e) {
  return typeof e == "string" && e in am ? am[e] : e;
}
const iC = ["h1", "h2", "h3", "h4", "h5", "h6"];
function lC(e, t) {
  return typeof e == "string" && e in t.fontSizes
    ? `var(--mantine-font-size-${e})`
    : typeof e == "string" && iC.includes(e)
    ? `var(--mantine-${e}-font-size)`
    : typeof e == "number" || typeof e == "string"
    ? z(e)
    : e;
}
function aC(e) {
  return e;
}
const cC = ["h1", "h2", "h3", "h4", "h5", "h6"];
function uC(e, t) {
  return typeof e == "string" && e in t.lineHeights
    ? `var(--mantine-line-height-${e})`
    : typeof e == "string" && cC.includes(e)
    ? `var(--mantine-${e}-line-height)`
    : e;
}
function fC(e) {
  return typeof e == "number" ? z(e) : e;
}
function dC(e, t) {
  if (typeof e == "number") return z(e);
  if (typeof e == "string") {
    const n = e.replace("-", "");
    if (!(n in t.spacing)) return z(e);
    const r = `--mantine-spacing-${n}`;
    return e.startsWith("-") ? `calc(var(${r}) * -1)` : `var(${r})`;
  }
  return e;
}
const fc = {
  color: sv,
  textColor: oC,
  fontSize: lC,
  spacing: dC,
  identity: aC,
  size: fC,
  lineHeight: uC,
  fontFamily: sC,
};
function cm(e) {
  return e.replace("(min-width: ", "").replace("em)", "");
}
function pC({ media: e, ...t }) {
  const r = Object.keys(e)
    .sort((o, s) => Number(cm(o)) - Number(cm(s)))
    .map((o) => ({ query: o, styles: e[o] }));
  return { ...t, media: r };
}
function mC(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.keys(e);
  return !(t.length === 1 && t[0] === "base");
}
function hC(e) {
  return typeof e == "object" && e !== null
    ? "base" in e
      ? e.base
      : void 0
    : e;
}
function gC(e) {
  return typeof e == "object" && e !== null
    ? an(e).filter((t) => t !== "base")
    : [];
}
function yC(e, t) {
  return typeof e == "object" && e !== null && t in e ? e[t] : e;
}
function vC({ styleProps: e, data: t, theme: n }) {
  return pC(
    an(e).reduce(
      (r, o) => {
        if (o === "hiddenFrom" || o === "visibleFrom" || o === "sx") return r;
        const s = t[o],
          i = Array.isArray(s.property) ? s.property : [s.property],
          l = hC(e[o]);
        if (!mC(e[o]))
          return (
            i.forEach((c) => {
              r.inlineStyles[c] = fc[s.type](l, n);
            }),
            r
          );
        r.hasResponsiveStyles = !0;
        const a = gC(e[o]);
        return (
          i.forEach((c) => {
            l && (r.styles[c] = fc[s.type](l, n)),
              a.forEach((u) => {
                const f = `(min-width: ${n.breakpoints[u]})`;
                r.media[f] = { ...r.media[f], [c]: fc[s.type](yC(e[o], u), n) };
              });
          }),
          r
        );
      },
      { hasResponsiveStyles: !1, styles: {}, inlineStyles: {}, media: {} }
    )
  );
}
function wC() {
  return `__m__-${w.useId().replace(/:/g, "")}`;
}
function iv(e) {
  return e.startsWith("data-") ? e : `data-${e}`;
}
function SC(e) {
  return Object.keys(e).reduce((t, n) => {
    const r = e[n];
    return (
      r === void 0 || r === "" || r === !1 || r === null || (t[iv(n)] = e[n]), t
    );
  }, {});
}
function lv(e) {
  return e
    ? typeof e == "string"
      ? { [iv(e)]: !0 }
      : Array.isArray(e)
      ? [...e].reduce((t, n) => ({ ...t, ...lv(n) }), {})
      : SC(e)
    : null;
}
function gu(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...gu(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function xC({ theme: e, style: t, vars: n, styleProps: r }) {
  const o = gu(t, e),
    s = gu(n, e);
  return { ...o, ...s, ...r };
}
const av = w.forwardRef(
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
      renderRoot: f,
      ...d
    },
    m
  ) => {
    var R;
    const p = kn(),
      h = e || "div",
      { styleProps: S, rest: v } = Vf(d),
      g = yb(),
      y = (R = g == null ? void 0 : g()) == null ? void 0 : R(S.sx),
      b = wC(),
      C = vC({ styleProps: S, theme: p, data: rC }),
      E = {
        ref: m,
        style: xC({ theme: p, style: t, vars: n, styleProps: C.inlineStyles }),
        className: nt(r, y, {
          [b]: C.hasResponsiveStyles,
          "mantine-light-hidden": c,
          "mantine-dark-hidden": u,
          [`mantine-hidden-from-${l}`]: l,
          [`mantine-visible-from-${a}`]: a,
        }),
        "data-variant": o,
        "data-size": Wy(i) ? void 0 : i || void 0,
        ...lv(s),
        ...v,
      };
    return x.jsxs(x.Fragment, {
      children: [
        C.hasResponsiveStyles &&
          x.jsx(nC, { selector: `.${b}`, styles: C.styles, media: C.media }),
        typeof f == "function" ? f(E) : x.jsx(h, { ...E }),
      ],
    });
  }
);
av.displayName = "@mantine/core/Box";
const Z = av;
function cv(e) {
  return e;
}
function Q(e) {
  const t = w.forwardRef(e);
  return (t.extend = cv), t;
}
function _n(e) {
  const t = w.forwardRef(e);
  return (t.extend = cv), t;
}
const bC = w.createContext({
  dir: "ltr",
  toggleDirection: () => {},
  setDirection: () => {},
});
function Hf() {
  return w.useContext(bC);
}
const [CC, $t] = Or("ScrollArea.Root component was not found in tree");
function xo(e, t) {
  const n = dr(t);
  Ms(() => {
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
const EC = w.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = $t(),
      [s, i] = w.useState(0),
      [l, a] = w.useState(0),
      c = !!(s && l);
    return (
      xo(o.scrollbarX, () => {
        var f;
        const u = ((f = o.scrollbarX) == null ? void 0 : f.offsetHeight) || 0;
        o.onCornerHeightChange(u), a(u);
      }),
      xo(o.scrollbarY, () => {
        var f;
        const u = ((f = o.scrollbarY) == null ? void 0 : f.offsetWidth) || 0;
        o.onCornerWidthChange(u), i(u);
      }),
      c
        ? x.jsx("div", { ...r, ref: t, style: { ...n, width: s, height: l } })
        : null
    );
  }),
  kC = w.forwardRef((e, t) => {
    const n = $t(),
      r = !!(n.scrollbarX && n.scrollbarY);
    return n.type !== "scroll" && r ? x.jsx(EC, { ...e, ref: t }) : null;
  }),
  _C = { scrollHideDelay: 1e3, type: "hover" },
  uv = w.forwardRef((e, t) => {
    const n = W("ScrollAreaRoot", _C, e),
      { type: r, scrollHideDelay: o, scrollbars: s, ...i } = n,
      [l, a] = w.useState(null),
      [c, u] = w.useState(null),
      [f, d] = w.useState(null),
      [m, p] = w.useState(null),
      [h, S] = w.useState(null),
      [v, g] = w.useState(0),
      [y, b] = w.useState(0),
      [C, E] = w.useState(!1),
      [R, D] = w.useState(!1),
      j = Nt(t, (T) => a(T));
    return x.jsx(CC, {
      value: {
        type: r,
        scrollHideDelay: o,
        scrollArea: l,
        viewport: c,
        onViewportChange: u,
        content: f,
        onContentChange: d,
        scrollbarX: m,
        onScrollbarXChange: p,
        scrollbarXEnabled: C,
        onScrollbarXEnabledChange: E,
        scrollbarY: h,
        onScrollbarYChange: S,
        scrollbarYEnabled: R,
        onScrollbarYEnabledChange: D,
        onCornerWidthChange: g,
        onCornerHeightChange: b,
      },
      children: x.jsx(Z, {
        ...i,
        ref: j,
        __vars: {
          "--sa-corner-width": s !== "xy" ? "0px" : `${v}px`,
          "--sa-corner-height": s !== "xy" ? "0px" : `${y}px`,
        },
      }),
    });
  });
uv.displayName = "@mantine/core/ScrollAreaRoot";
function fv(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function Kl(e) {
  const t = fv(e.viewport, e.content),
    n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd,
    r = (e.scrollbar.size - n) * t;
  return Math.max(r, 18);
}
function dv(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function RC(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function um(e, t, n = "ltr") {
  const r = Kl(t),
    o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
    s = t.scrollbar.size - o,
    i = t.content - t.viewport,
    l = s - r,
    a = n === "ltr" ? [0, i] : [i * -1, 0],
    c = RC(e, a);
  return dv([0, i], [0, l])(c);
}
function DC(e, t, n, r = "ltr") {
  const o = Kl(n),
    s = o / 2,
    i = t || s,
    l = o - i,
    a = n.scrollbar.paddingStart + i,
    c = n.scrollbar.size - n.scrollbar.paddingEnd - l,
    u = n.content - n.viewport,
    f = r === "ltr" ? [0, u] : [u * -1, 0];
  return dv([a, c], f)(e);
}
function pv(e, t) {
  return e > 0 && e < t;
}
function dl(e) {
  return e ? parseInt(e, 10) : 0;
}
function wr(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (r) => {
    e == null || e(r), (n === !1 || !r.defaultPrevented) && (t == null || t(r));
  };
}
const [PC, mv] = Or("ScrollAreaScrollbar was not found in tree"),
  hv = w.forwardRef((e, t) => {
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
        ...f
      } = e,
      d = $t(),
      [m, p] = w.useState(null),
      h = Nt(t, (D) => p(D)),
      S = w.useRef(null),
      v = w.useRef(""),
      { viewport: g } = d,
      y = n.content - n.viewport,
      b = dr(c),
      C = dr(l),
      E = Wl(u, 10),
      R = (D) => {
        if (S.current) {
          const j = D.clientX - S.current.left,
            T = D.clientY - S.current.top;
          a({ x: j, y: T });
        }
      };
    return (
      w.useEffect(() => {
        const D = (j) => {
          const T = j.target;
          (m == null ? void 0 : m.contains(T)) && b(j, y);
        };
        return (
          document.addEventListener("wheel", D, { passive: !1 }),
          () => document.removeEventListener("wheel", D, { passive: !1 })
        );
      }, [g, m, y, b]),
      w.useEffect(C, [n, C]),
      xo(m, E),
      xo(d.content, E),
      x.jsx(PC, {
        value: {
          scrollbar: m,
          hasThumb: r,
          onThumbChange: dr(o),
          onThumbPointerUp: dr(s),
          onThumbPositionChange: C,
          onThumbPointerDown: dr(i),
        },
        children: x.jsx("div", {
          ...f,
          ref: h,
          style: { position: "absolute", ...f.style },
          onPointerDown: wr(e.onPointerDown, (D) => {
            D.button === 0 &&
              (D.target.setPointerCapture(D.pointerId),
              (S.current = m.getBoundingClientRect()),
              (v.current = document.body.style.webkitUserSelect),
              (document.body.style.webkitUserSelect = "none"),
              R(D));
          }),
          onPointerMove: wr(e.onPointerMove, R),
          onPointerUp: wr(e.onPointerUp, (D) => {
            const j = D.target;
            j.hasPointerCapture(D.pointerId) &&
              j.releasePointerCapture(D.pointerId),
              (document.body.style.webkitUserSelect = v.current),
              (S.current = null);
          }),
        }),
      })
    );
  }),
  TC = w.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = $t(),
      [l, a] = w.useState(),
      c = w.useRef(null),
      u = Nt(t, c, i.onScrollbarXChange);
    return (
      w.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      x.jsx(hv, {
        "data-orientation": "horizontal",
        ...s,
        ref: u,
        sizes: n,
        style: { ...o, "--sa-thumb-width": `${Kl(n)}px` },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.x),
        onDragScroll: (f) => e.onDragScroll(f.x),
        onWheelScroll: (f, d) => {
          if (i.viewport) {
            const m = i.viewport.scrollLeft + f.deltaX;
            e.onWheelScroll(m), pv(m, d) && f.preventDefault();
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
                paddingStart: dl(l.paddingLeft),
                paddingEnd: dl(l.paddingRight),
              },
            });
        },
      })
    );
  }),
  OC = w.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = $t(),
      [l, a] = w.useState(),
      c = w.useRef(null),
      u = Nt(t, c, i.onScrollbarYChange);
    return (
      w.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      x.jsx(hv, {
        ...s,
        "data-orientation": "vertical",
        ref: u,
        sizes: n,
        style: { "--sa-thumb-height": `${Kl(n)}px`, ...o },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.y),
        onDragScroll: (f) => e.onDragScroll(f.y),
        onWheelScroll: (f, d) => {
          if (i.viewport) {
            const m = i.viewport.scrollTop + f.deltaY;
            e.onWheelScroll(m), pv(m, d) && f.preventDefault();
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
                paddingStart: dl(l.paddingTop),
                paddingEnd: dl(l.paddingBottom),
              },
            });
        },
      })
    );
  }),
  Uf = w.forwardRef((e, t) => {
    const { orientation: n = "vertical", ...r } = e,
      { dir: o } = Hf(),
      s = $t(),
      i = w.useRef(null),
      l = w.useRef(0),
      [a, c] = w.useState({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
      }),
      u = fv(a.viewport, a.content),
      f = {
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
      d = (m, p) => DC(m, l.current, a, p);
    return n === "horizontal"
      ? x.jsx(TC, {
          ...f,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollLeft,
                p = um(m, a, o);
              i.current.style.transform = `translate3d(${p}px, 0, 0)`;
            }
          },
          onWheelScroll: (m) => {
            s.viewport && (s.viewport.scrollLeft = m);
          },
          onDragScroll: (m) => {
            s.viewport && (s.viewport.scrollLeft = d(m, o));
          },
        })
      : n === "vertical"
      ? x.jsx(OC, {
          ...f,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollTop,
                p = um(m, a);
              i.current.style.transform = `translate3d(0, ${p}px, 0)`;
            }
          },
          onWheelScroll: (m) => {
            s.viewport && (s.viewport.scrollTop = m);
          },
          onDragScroll: (m) => {
            s.viewport && (s.viewport.scrollTop = d(m));
          },
        })
      : null;
  }),
  gv = w.forwardRef((e, t) => {
    const n = $t(),
      { forceMount: r, ...o } = e,
      [s, i] = w.useState(!1),
      l = e.orientation === "horizontal",
      a = Wl(() => {
        if (n.viewport) {
          const c = n.viewport.offsetWidth < n.viewport.scrollWidth,
            u = n.viewport.offsetHeight < n.viewport.scrollHeight;
          i(l ? c : u);
        }
      }, 10);
    return (
      xo(n.viewport, a),
      xo(n.content, a),
      r || s
        ? x.jsx(Uf, { "data-state": s ? "visible" : "hidden", ...o, ref: t })
        : null
    );
  }),
  NC = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = $t(),
      [s, i] = w.useState(!1);
    return (
      w.useEffect(() => {
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
        ? x.jsx(gv, { "data-state": s ? "visible" : "hidden", ...r, ref: t })
        : null
    );
  }),
  $C = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = $t(),
      s = e.orientation === "horizontal",
      [i, l] = w.useState("hidden"),
      a = Wl(() => l("idle"), 100);
    return (
      w.useEffect(() => {
        if (i === "idle") {
          const c = window.setTimeout(() => l("hidden"), o.scrollHideDelay);
          return () => window.clearTimeout(c);
        }
      }, [i, o.scrollHideDelay]),
      w.useEffect(() => {
        const { viewport: c } = o,
          u = s ? "scrollLeft" : "scrollTop";
        if (c) {
          let f = c[u];
          const d = () => {
            const m = c[u];
            f !== m && (l("scrolling"), a()), (f = m);
          };
          return (
            c.addEventListener("scroll", d),
            () => c.removeEventListener("scroll", d)
          );
        }
      }, [o.viewport, s, a]),
      n || i !== "hidden"
        ? x.jsx(Uf, {
            "data-state": i === "hidden" ? "hidden" : "visible",
            ...r,
            ref: t,
            onPointerEnter: wr(e.onPointerEnter, () => l("interacting")),
            onPointerLeave: wr(e.onPointerLeave, () => l("idle")),
          })
        : null
    );
  }),
  fm = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = $t(),
      { onScrollbarXEnabledChange: s, onScrollbarYEnabledChange: i } = o,
      l = e.orientation === "horizontal";
    return (
      w.useEffect(
        () => (
          l ? s(!0) : i(!0),
          () => {
            l ? s(!1) : i(!1);
          }
        ),
        [l, s, i]
      ),
      o.type === "hover"
        ? x.jsx(NC, { ...r, ref: t, forceMount: n })
        : o.type === "scroll"
        ? x.jsx($C, { ...r, ref: t, forceMount: n })
        : o.type === "auto"
        ? x.jsx(gv, { ...r, ref: t, forceMount: n })
        : o.type === "always"
        ? x.jsx(Uf, { ...r, ref: t })
        : null
    );
  });
function LC(e, t = () => {}) {
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
const jC = w.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = $t(),
      s = mv(),
      { onThumbPositionChange: i } = s,
      l = Nt(t, (u) => s.onThumbChange(u)),
      a = w.useRef(),
      c = Wl(() => {
        a.current && (a.current(), (a.current = void 0));
      }, 100);
    return (
      w.useEffect(() => {
        const { viewport: u } = o;
        if (u) {
          const f = () => {
            if ((c(), !a.current)) {
              const d = LC(u, i);
              (a.current = d), i();
            }
          };
          return (
            i(),
            u.addEventListener("scroll", f),
            () => u.removeEventListener("scroll", f)
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
        onPointerDownCapture: wr(e.onPointerDownCapture, (u) => {
          const d = u.target.getBoundingClientRect(),
            m = u.clientX - d.left,
            p = u.clientY - d.top;
          s.onThumbPointerDown({ x: m, y: p });
        }),
        onPointerUp: wr(e.onPointerUp, s.onThumbPointerUp),
      })
    );
  }),
  dm = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = mv();
    return n || o.hasThumb ? x.jsx(jC, { ref: t, ...r }) : null;
  }),
  yv = w.forwardRef(({ children: e, style: t, ...n }, r) => {
    const o = $t(),
      s = Nt(r, o.onViewportChange);
    return x.jsx(Z, {
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
yv.displayName = "@mantine/core/ScrollAreaViewport";
var Wf = {
  root: "m_d57069b5",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268",
};
const vv = { scrollHideDelay: 1e3, type: "hover", scrollbars: "xy" },
  AC = (e, { scrollbarSize: t }) => ({
    root: { "--scrollarea-scrollbar-size": z(t) },
  }),
  Vs = Q((e, t) => {
    const n = W("ScrollArea", vv, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        scrollbarSize: a,
        vars: c,
        type: u,
        scrollHideDelay: f,
        viewportProps: d,
        viewportRef: m,
        onScrollPositionChange: p,
        children: h,
        offsetScrollbars: S,
        scrollbars: v,
        ...g
      } = n,
      [y, b] = w.useState(!1),
      C = de({
        name: "ScrollArea",
        props: n,
        classes: Wf,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: AC,
      });
    return x.jsxs(uv, {
      type: u === "never" ? "always" : u,
      scrollHideDelay: f,
      ref: t,
      scrollbars: v,
      ...C("root"),
      ...g,
      children: [
        x.jsx(yv, {
          ...d,
          ...C("viewport", { style: d == null ? void 0 : d.style }),
          ref: m,
          "data-offset-scrollbars": S === !0 ? "xy" : S || void 0,
          "data-scrollbars": v || void 0,
          onScroll: (E) => {
            var R;
            (R = d == null ? void 0 : d.onScroll) == null || R.call(d, E),
              p == null ||
                p({
                  x: E.currentTarget.scrollLeft,
                  y: E.currentTarget.scrollTop,
                });
          },
          children: h,
        }),
        (v === "xy" || v === "x") &&
          x.jsx(fm, {
            ...C("scrollbar"),
            orientation: "horizontal",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: x.jsx(dm, { ...C("thumb") }),
          }),
        (v === "xy" || v === "y") &&
          x.jsx(fm, {
            ...C("scrollbar"),
            orientation: "vertical",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: x.jsx(dm, { ...C("thumb") }),
          }),
        x.jsx(kC, {
          ...C("corner"),
          "data-hovered": y || void 0,
          "data-hidden": u === "never" || void 0,
        }),
      ],
    });
  });
Vs.displayName = "@mantine/core/ScrollArea";
const Yf = Q((e, t) => {
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
    onScrollPositionChange: f,
    unstyled: d,
    variant: m,
    viewportProps: p,
    scrollbars: h,
    style: S,
    vars: v,
    ...g
  } = W("ScrollAreaAutosize", vv, e);
  return x.jsx(Z, {
    ...g,
    ref: t,
    style: [{ display: "flex", overflow: "auto" }, S],
    children: x.jsx(Z, {
      style: { display: "flex", flexDirection: "column", flex: 1 },
      children: x.jsx(Vs, {
        classNames: r,
        styles: o,
        scrollHideDelay: i,
        scrollbarSize: s,
        type: l,
        dir: a,
        offsetScrollbars: c,
        viewportRef: u,
        onScrollPositionChange: f,
        unstyled: d,
        variant: m,
        viewportProps: p,
        vars: v,
        scrollbars: h,
        children: n,
      }),
    }),
  });
});
Vs.classes = Wf;
Yf.displayName = "@mantine/core/ScrollAreaAutosize";
Yf.classes = Wf;
Vs.Autosize = Yf;
var wv = { root: "m_87cf2631" };
const FC = { __staticSelector: "UnstyledButton" },
  vn = _n((e, t) => {
    const n = W("UnstyledButton", FC, e),
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
      f = de({
        name: s,
        props: n,
        classes: wv,
        className: r,
        style: c,
        classNames: l,
        styles: a,
        unstyled: i,
      });
    return x.jsx(Z, {
      ...f("root", { focusable: !0 }),
      component: o,
      ref: t,
      type: o === "button" ? "button" : void 0,
      ...u,
    });
  });
vn.classes = wv;
vn.displayName = "@mantine/core/UnstyledButton";
var Sv = { root: "m_515a97f8" };
const MC = {},
  Kf = Q((e, t) => {
    const n = W("VisuallyHidden", MC, e),
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
        classes: Sv,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
      });
    return x.jsx(Z, { component: "span", ref: t, ...u("root"), ...c });
  });
Kf.classes = Sv;
Kf.displayName = "@mantine/core/VisuallyHidden";
var xv = { root: "m_1b7284a3" };
const zC = {},
  IC = (e, { radius: t, shadow: n }) => ({
    root: {
      "--paper-radius": t === void 0 ? void 0 : or(t),
      "--paper-shadow": Af(n),
    },
  }),
  Gf = _n((e, t) => {
    const n = W("Paper", zC, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        withBorder: a,
        vars: c,
        radius: u,
        shadow: f,
        variant: d,
        mod: m,
        ...p
      } = n,
      h = de({
        name: "Paper",
        props: n,
        classes: xv,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: IC,
      });
    return x.jsx(Z, {
      ref: t,
      mod: [{ "data-with-border": a }, m],
      ...h("root"),
      variant: d,
      ...p,
    });
  });
Gf.classes = xv;
Gf.displayName = "@mantine/core/Paper";
function To(e) {
  return bv(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function St(e) {
  var t;
  return (
    (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) ||
    window
  );
}
function Rn(e) {
  var t;
  return (t = (bv(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function bv(e) {
  return e instanceof Node || e instanceof St(e).Node;
}
function at(e) {
  return e instanceof Element || e instanceof St(e).Element;
}
function cn(e) {
  return e instanceof HTMLElement || e instanceof St(e).HTMLElement;
}
function pm(e) {
  return typeof ShadowRoot > "u"
    ? !1
    : e instanceof ShadowRoot || e instanceof St(e).ShadowRoot;
}
function Hs(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: o } = Yt(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + r + n) &&
    !["inline", "contents"].includes(o)
  );
}
function BC(e) {
  return ["table", "td", "th"].includes(To(e));
}
function Xf(e) {
  const t = qf(),
    n = Yt(e);
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
function VC(e) {
  let t = Zn(e);
  for (; cn(t) && !bo(t); ) {
    if (Xf(t)) return t;
    t = Zn(t);
  }
  return null;
}
function qf() {
  return typeof CSS > "u" || !CSS.supports
    ? !1
    : CSS.supports("-webkit-backdrop-filter", "none");
}
function bo(e) {
  return ["html", "body", "#document"].includes(To(e));
}
function Yt(e) {
  return St(e).getComputedStyle(e);
}
function Gl(e) {
  return at(e)
    ? { scrollLeft: e.scrollLeft, scrollTop: e.scrollTop }
    : { scrollLeft: e.pageXOffset, scrollTop: e.pageYOffset };
}
function Zn(e) {
  if (To(e) === "html") return e;
  const t = e.assignedSlot || e.parentNode || (pm(e) && e.host) || Rn(e);
  return pm(t) ? t.host : t;
}
function Cv(e) {
  const t = Zn(e);
  return bo(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : cn(t) && Hs(t)
    ? t
    : Cv(t);
}
function Ds(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = Cv(e),
    s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
    i = St(o);
  return s
    ? t.concat(
        i,
        i.visualViewport || [],
        Hs(o) ? o : [],
        i.frameElement && n ? Ds(i.frameElement) : []
      )
    : t.concat(o, Ds(o, [], n));
}
const Kt = Math.min,
  Ge = Math.max,
  pl = Math.round,
  yi = Math.floor,
  er = (e) => ({ x: e, y: e }),
  HC = { left: "right", right: "left", bottom: "top", top: "bottom" },
  UC = { start: "end", end: "start" };
function yu(e, t, n) {
  return Ge(e, Kt(t, n));
}
function Cn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function Gt(e) {
  return e.split("-")[0];
}
function Oo(e) {
  return e.split("-")[1];
}
function Qf(e) {
  return e === "x" ? "y" : "x";
}
function Jf(e) {
  return e === "y" ? "height" : "width";
}
function Lr(e) {
  return ["top", "bottom"].includes(Gt(e)) ? "y" : "x";
}
function Zf(e) {
  return Qf(Lr(e));
}
function WC(e, t, n) {
  n === void 0 && (n = !1);
  const r = Oo(e),
    o = Zf(e),
    s = Jf(o);
  let i =
    o === "x"
      ? r === (n ? "end" : "start")
        ? "right"
        : "left"
      : r === "start"
      ? "bottom"
      : "top";
  return t.reference[s] > t.floating[s] && (i = ml(i)), [i, ml(i)];
}
function YC(e) {
  const t = ml(e);
  return [vu(e), t, vu(t)];
}
function vu(e) {
  return e.replace(/start|end/g, (t) => UC[t]);
}
function KC(e, t, n) {
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
function GC(e, t, n, r) {
  const o = Oo(e);
  let s = KC(Gt(e), n === "start", r);
  return (
    o && ((s = s.map((i) => i + "-" + o)), t && (s = s.concat(s.map(vu)))), s
  );
}
function ml(e) {
  return e.replace(/left|right|bottom|top/g, (t) => HC[t]);
}
function XC(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function ed(e) {
  return typeof e != "number"
    ? XC(e)
    : { top: e, right: e, bottom: e, left: e };
}
function Co(e) {
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
function mm(e, t, n) {
  let { reference: r, floating: o } = e;
  const s = Lr(t),
    i = Zf(t),
    l = Jf(i),
    a = Gt(t),
    c = s === "y",
    u = r.x + r.width / 2 - o.width / 2,
    f = r.y + r.height / 2 - o.height / 2,
    d = r[l] / 2 - o[l] / 2;
  let m;
  switch (a) {
    case "top":
      m = { x: u, y: r.y - o.height };
      break;
    case "bottom":
      m = { x: u, y: r.y + r.height };
      break;
    case "right":
      m = { x: r.x + r.width, y: f };
      break;
    case "left":
      m = { x: r.x - o.width, y: f };
      break;
    default:
      m = { x: r.x, y: r.y };
  }
  switch (Oo(t)) {
    case "start":
      m[i] -= d * (n && c ? -1 : 1);
      break;
    case "end":
      m[i] += d * (n && c ? -1 : 1);
      break;
  }
  return m;
}
const qC = async (e, t, n) => {
  const {
      placement: r = "bottom",
      strategy: o = "absolute",
      middleware: s = [],
      platform: i,
    } = n,
    l = s.filter(Boolean),
    a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({ reference: e, floating: t, strategy: o }),
    { x: u, y: f } = mm(c, r, a),
    d = r,
    m = {},
    p = 0;
  for (let h = 0; h < l.length; h++) {
    const { name: S, fn: v } = l[h],
      {
        x: g,
        y,
        data: b,
        reset: C,
      } = await v({
        x: u,
        y: f,
        initialPlacement: r,
        placement: d,
        strategy: o,
        middlewareData: m,
        rects: c,
        platform: i,
        elements: { reference: e, floating: t },
      });
    (u = g ?? u),
      (f = y ?? f),
      (m = { ...m, [S]: { ...m[S], ...b } }),
      C &&
        p <= 50 &&
        (p++,
        typeof C == "object" &&
          (C.placement && (d = C.placement),
          C.rects &&
            (c =
              C.rects === !0
                ? await i.getElementRects({
                    reference: e,
                    floating: t,
                    strategy: o,
                  })
                : C.rects),
          ({ x: u, y: f } = mm(c, d, a))),
        (h = -1));
  }
  return { x: u, y: f, placement: d, strategy: o, middlewareData: m };
};
async function td(e, t) {
  var n;
  t === void 0 && (t = {});
  const { x: r, y: o, platform: s, rects: i, elements: l, strategy: a } = e,
    {
      boundary: c = "clippingAncestors",
      rootBoundary: u = "viewport",
      elementContext: f = "floating",
      altBoundary: d = !1,
      padding: m = 0,
    } = Cn(t, e),
    p = ed(m),
    S = l[d ? (f === "floating" ? "reference" : "floating") : f],
    v = Co(
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
    g =
      f === "floating"
        ? { x: r, y: o, width: i.floating.width, height: i.floating.height }
        : i.reference,
    y = await (s.getOffsetParent == null
      ? void 0
      : s.getOffsetParent(l.floating)),
    b = (await (s.isElement == null ? void 0 : s.isElement(y)))
      ? (await (s.getScale == null ? void 0 : s.getScale(y))) || { x: 1, y: 1 }
      : { x: 1, y: 1 },
    C = Co(
      s.convertOffsetParentRelativeRectToViewportRelativeRect
        ? await s.convertOffsetParentRelativeRectToViewportRelativeRect({
            elements: l,
            rect: g,
            offsetParent: y,
            strategy: a,
          })
        : g
    );
  return {
    top: (v.top - C.top + p.top) / b.y,
    bottom: (C.bottom - v.bottom + p.bottom) / b.y,
    left: (v.left - C.left + p.left) / b.x,
    right: (C.right - v.right + p.right) / b.x,
  };
}
const QC = (e) => ({
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
        { element: c, padding: u = 0 } = Cn(e, t) || {};
      if (c == null) return {};
      const f = ed(u),
        d = { x: n, y: r },
        m = Zf(o),
        p = Jf(m),
        h = await i.getDimensions(c),
        S = m === "y",
        v = S ? "top" : "left",
        g = S ? "bottom" : "right",
        y = S ? "clientHeight" : "clientWidth",
        b = s.reference[p] + s.reference[m] - d[m] - s.floating[p],
        C = d[m] - s.reference[m],
        E = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
      let R = E ? E[y] : 0;
      (!R || !(await (i.isElement == null ? void 0 : i.isElement(E)))) &&
        (R = l.floating[y] || s.floating[p]);
      const D = b / 2 - C / 2,
        j = R / 2 - h[p] / 2 - 1,
        T = Kt(f[v], j),
        M = Kt(f[g], j),
        B = T,
        H = R - h[p] - M,
        F = R / 2 - h[p] / 2 + D,
        L = yu(B, F, H),
        P =
          !a.arrow &&
          Oo(o) != null &&
          F !== L &&
          s.reference[p] / 2 - (F < B ? T : M) - h[p] / 2 < 0,
        O = P ? (F < B ? F - B : F - H) : 0;
      return {
        [m]: d[m] + O,
        data: {
          [m]: L,
          centerOffset: F - L - O,
          ...(P && { alignmentOffset: O }),
        },
        reset: P,
      };
    },
  }),
  JC = function (e) {
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
              crossAxis: f = !0,
              fallbackPlacements: d,
              fallbackStrategy: m = "bestFit",
              fallbackAxisSideDirection: p = "none",
              flipAlignment: h = !0,
              ...S
            } = Cn(e, t);
          if ((n = s.arrow) != null && n.alignmentOffset) return {};
          const v = Gt(o),
            g = Gt(l) === l,
            y = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)),
            b = d || (g || !h ? [ml(l)] : YC(l));
          !d && p !== "none" && b.push(...GC(l, h, p, y));
          const C = [l, ...b],
            E = await td(t, S),
            R = [];
          let D = ((r = s.flip) == null ? void 0 : r.overflows) || [];
          if ((u && R.push(E[v]), f)) {
            const B = WC(o, i, y);
            R.push(E[B[0]], E[B[1]]);
          }
          if (
            ((D = [...D, { placement: o, overflows: R }]),
            !R.every((B) => B <= 0))
          ) {
            var j, T;
            const B = (((j = s.flip) == null ? void 0 : j.index) || 0) + 1,
              H = C[B];
            if (H)
              return {
                data: { index: B, overflows: D },
                reset: { placement: H },
              };
            let F =
              (T = D.filter((L) => L.overflows[0] <= 0).sort(
                (L, P) => L.overflows[1] - P.overflows[1]
              )[0]) == null
                ? void 0
                : T.placement;
            if (!F)
              switch (m) {
                case "bestFit": {
                  var M;
                  const L =
                    (M = D.map((P) => [
                      P.placement,
                      P.overflows
                        .filter((O) => O > 0)
                        .reduce((O, _) => O + _, 0),
                    ]).sort((P, O) => P[1] - O[1])[0]) == null
                      ? void 0
                      : M[0];
                  L && (F = L);
                  break;
                }
                case "initialPlacement":
                  F = l;
                  break;
              }
            if (o !== F) return { reset: { placement: F } };
          }
          return {};
        },
      }
    );
  };
function Ev(e) {
  const t = Kt(...e.map((s) => s.left)),
    n = Kt(...e.map((s) => s.top)),
    r = Ge(...e.map((s) => s.right)),
    o = Ge(...e.map((s) => s.bottom));
  return { x: t, y: n, width: r - t, height: o - n };
}
function ZC(e) {
  const t = e.slice().sort((o, s) => o.y - s.y),
    n = [];
  let r = null;
  for (let o = 0; o < t.length; o++) {
    const s = t[o];
    !r || s.y - r.y > r.height / 2 ? n.push([s]) : n[n.length - 1].push(s),
      (r = s);
  }
  return n.map((o) => Co(Ev(o)));
}
const eE = function (e) {
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
          { padding: l = 2, x: a, y: c } = Cn(e, t),
          u = Array.from(
            (await (s.getClientRects == null
              ? void 0
              : s.getClientRects(r.reference))) || []
          ),
          f = ZC(u),
          d = Co(Ev(u)),
          m = ed(l);
        function p() {
          if (
            f.length === 2 &&
            f[0].left > f[1].right &&
            a != null &&
            c != null
          )
            return (
              f.find(
                (S) =>
                  a > S.left - m.left &&
                  a < S.right + m.right &&
                  c > S.top - m.top &&
                  c < S.bottom + m.bottom
              ) || d
            );
          if (f.length >= 2) {
            if (Lr(n) === "y") {
              const T = f[0],
                M = f[f.length - 1],
                B = Gt(n) === "top",
                H = T.top,
                F = M.bottom,
                L = B ? T.left : M.left,
                P = B ? T.right : M.right,
                O = P - L,
                _ = F - H;
              return {
                top: H,
                bottom: F,
                left: L,
                right: P,
                width: O,
                height: _,
                x: L,
                y: H,
              };
            }
            const S = Gt(n) === "left",
              v = Ge(...f.map((T) => T.right)),
              g = Kt(...f.map((T) => T.left)),
              y = f.filter((T) => (S ? T.left === g : T.right === v)),
              b = y[0].top,
              C = y[y.length - 1].bottom,
              E = g,
              R = v,
              D = R - E,
              j = C - b;
            return {
              top: b,
              bottom: C,
              left: E,
              right: R,
              width: D,
              height: j,
              x: E,
              y: b,
            };
          }
          return d;
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
async function tE(e, t) {
  const { placement: n, platform: r, elements: o } = e,
    s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
    i = Gt(n),
    l = Oo(n),
    a = Lr(n) === "y",
    c = ["left", "top"].includes(i) ? -1 : 1,
    u = s && a ? -1 : 1,
    f = Cn(t, e);
  let {
    mainAxis: d,
    crossAxis: m,
    alignmentAxis: p,
  } = typeof f == "number"
    ? { mainAxis: f, crossAxis: 0, alignmentAxis: null }
    : { mainAxis: 0, crossAxis: 0, alignmentAxis: null, ...f };
  return (
    l && typeof p == "number" && (m = l === "end" ? p * -1 : p),
    a ? { x: m * u, y: d * c } : { x: d * c, y: m * u }
  );
}
const nE = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: "offset",
        options: e,
        async fn(t) {
          var n, r;
          const { x: o, y: s, placement: i, middlewareData: l } = t,
            a = await tE(t, e);
          return i === ((n = l.offset) == null ? void 0 : n.placement) &&
            (r = l.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: o + a.x, y: s + a.y, data: { ...a, placement: i } };
        },
      }
    );
  },
  rE = function (e) {
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
                  let { x: v, y: g } = S;
                  return { x: v, y: g };
                },
              },
              ...a
            } = Cn(e, t),
            c = { x: n, y: r },
            u = await td(t, a),
            f = Lr(Gt(o)),
            d = Qf(f);
          let m = c[d],
            p = c[f];
          if (s) {
            const S = d === "y" ? "top" : "left",
              v = d === "y" ? "bottom" : "right",
              g = m + u[S],
              y = m - u[v];
            m = yu(g, m, y);
          }
          if (i) {
            const S = f === "y" ? "top" : "left",
              v = f === "y" ? "bottom" : "right",
              g = p + u[S],
              y = p - u[v];
            p = yu(g, p, y);
          }
          const h = l.fn({ ...t, [d]: m, [f]: p });
          return { ...h, data: { x: h.x - n, y: h.y - r } };
        },
      }
    );
  },
  oE = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: r, placement: o, rects: s, middlewareData: i } = t,
            { offset: l = 0, mainAxis: a = !0, crossAxis: c = !0 } = Cn(e, t),
            u = { x: n, y: r },
            f = Lr(o),
            d = Qf(f);
          let m = u[d],
            p = u[f];
          const h = Cn(l, t),
            S =
              typeof h == "number"
                ? { mainAxis: h, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...h };
          if (a) {
            const y = d === "y" ? "height" : "width",
              b = s.reference[d] - s.floating[y] + S.mainAxis,
              C = s.reference[d] + s.reference[y] - S.mainAxis;
            m < b ? (m = b) : m > C && (m = C);
          }
          if (c) {
            var v, g;
            const y = d === "y" ? "width" : "height",
              b = ["top", "left"].includes(Gt(o)),
              C =
                s.reference[f] -
                s.floating[y] +
                ((b && ((v = i.offset) == null ? void 0 : v[f])) || 0) +
                (b ? 0 : S.crossAxis),
              E =
                s.reference[f] +
                s.reference[y] +
                (b ? 0 : ((g = i.offset) == null ? void 0 : g[f]) || 0) -
                (b ? S.crossAxis : 0);
            p < C ? (p = C) : p > E && (p = E);
          }
          return { [d]: m, [f]: p };
        },
      }
    );
  },
  sE = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "size",
        options: e,
        async fn(t) {
          const { placement: n, rects: r, platform: o, elements: s } = t,
            { apply: i = () => {}, ...l } = Cn(e, t),
            a = await td(t, l),
            c = Gt(n),
            u = Oo(n),
            f = Lr(n) === "y",
            { width: d, height: m } = r.floating;
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
            v = d - a[h],
            g = !t.middlewareData.shift;
          let y = S,
            b = v;
          if (f) {
            const E = d - a.left - a.right;
            b = u || g ? Kt(v, E) : E;
          } else {
            const E = m - a.top - a.bottom;
            y = u || g ? Kt(S, E) : E;
          }
          if (g && !u) {
            const E = Ge(a.left, 0),
              R = Ge(a.right, 0),
              D = Ge(a.top, 0),
              j = Ge(a.bottom, 0);
            f
              ? (b = d - 2 * (E !== 0 || R !== 0 ? E + R : Ge(a.left, a.right)))
              : (y =
                  m - 2 * (D !== 0 || j !== 0 ? D + j : Ge(a.top, a.bottom)));
          }
          await i({ ...t, availableWidth: b, availableHeight: y });
          const C = await o.getDimensions(s.floating);
          return d !== C.width || m !== C.height
            ? { reset: { rects: !0 } }
            : {};
        },
      }
    );
  };
function kv(e) {
  const t = Yt(e);
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0;
  const o = cn(e),
    s = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : r,
    l = pl(n) !== s || pl(r) !== i;
  return l && ((n = s), (r = i)), { width: n, height: r, $: l };
}
function nd(e) {
  return at(e) ? e : e.contextElement;
}
function ao(e) {
  const t = nd(e);
  if (!cn(t)) return er(1);
  const n = t.getBoundingClientRect(),
    { width: r, height: o, $: s } = kv(t);
  let i = (s ? pl(n.width) : n.width) / r,
    l = (s ? pl(n.height) : n.height) / o;
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: i, y: l }
  );
}
const iE = er(0);
function _v(e) {
  const t = St(e);
  return !qf() || !t.visualViewport
    ? iE
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function lE(e, t, n) {
  return t === void 0 && (t = !1), !n || (t && n !== St(e)) ? !1 : t;
}
function _r(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(),
    s = nd(e);
  let i = er(1);
  t && (r ? at(r) && (i = ao(r)) : (i = ao(e)));
  const l = lE(s, n, r) ? _v(s) : er(0);
  let a = (o.left + l.x) / i.x,
    c = (o.top + l.y) / i.y,
    u = o.width / i.x,
    f = o.height / i.y;
  if (s) {
    const d = St(s),
      m = r && at(r) ? St(r) : r;
    let p = d,
      h = p.frameElement;
    for (; h && r && m !== p; ) {
      const S = ao(h),
        v = h.getBoundingClientRect(),
        g = Yt(h),
        y = v.left + (h.clientLeft + parseFloat(g.paddingLeft)) * S.x,
        b = v.top + (h.clientTop + parseFloat(g.paddingTop)) * S.y;
      (a *= S.x),
        (c *= S.y),
        (u *= S.x),
        (f *= S.y),
        (a += y),
        (c += b),
        (p = St(h)),
        (h = p.frameElement);
    }
  }
  return Co({ width: u, height: f, x: a, y: c });
}
const aE = [":popover-open", ":modal"];
function rd(e) {
  return aE.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function cE(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: o } = e;
  const s = o === "fixed",
    i = Rn(r),
    l = t ? rd(t.floating) : !1;
  if (r === i || (l && s)) return n;
  let a = { scrollLeft: 0, scrollTop: 0 },
    c = er(1);
  const u = er(0),
    f = cn(r);
  if (
    (f || (!f && !s)) &&
    ((To(r) !== "body" || Hs(i)) && (a = Gl(r)), cn(r))
  ) {
    const d = _r(r);
    (c = ao(r)), (u.x = d.x + r.clientLeft), (u.y = d.y + r.clientTop);
  }
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - a.scrollLeft * c.x + u.x,
    y: n.y * c.y - a.scrollTop * c.y + u.y,
  };
}
function uE(e) {
  return Array.from(e.getClientRects());
}
function Rv(e) {
  return _r(Rn(e)).left + Gl(e).scrollLeft;
}
function fE(e) {
  const t = Rn(e),
    n = Gl(e),
    r = e.ownerDocument.body,
    o = Ge(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    s = Ge(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let i = -n.scrollLeft + Rv(e);
  const l = -n.scrollTop;
  return (
    Yt(r).direction === "rtl" && (i += Ge(t.clientWidth, r.clientWidth) - o),
    { width: o, height: s, x: i, y: l }
  );
}
function dE(e, t) {
  const n = St(e),
    r = Rn(e),
    o = n.visualViewport;
  let s = r.clientWidth,
    i = r.clientHeight,
    l = 0,
    a = 0;
  if (o) {
    (s = o.width), (i = o.height);
    const c = qf();
    (!c || (c && t === "fixed")) && ((l = o.offsetLeft), (a = o.offsetTop));
  }
  return { width: s, height: i, x: l, y: a };
}
function pE(e, t) {
  const n = _r(e, !0, t === "fixed"),
    r = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    s = cn(e) ? ao(e) : er(1),
    i = e.clientWidth * s.x,
    l = e.clientHeight * s.y,
    a = o * s.x,
    c = r * s.y;
  return { width: i, height: l, x: a, y: c };
}
function hm(e, t, n) {
  let r;
  if (t === "viewport") r = dE(e, n);
  else if (t === "document") r = fE(Rn(e));
  else if (at(t)) r = pE(t, n);
  else {
    const o = _v(e);
    r = { ...t, x: t.x - o.x, y: t.y - o.y };
  }
  return Co(r);
}
function Dv(e, t) {
  const n = Zn(e);
  return n === t || !at(n) || bo(n)
    ? !1
    : Yt(n).position === "fixed" || Dv(n, t);
}
function mE(e, t) {
  const n = t.get(e);
  if (n) return n;
  let r = Ds(e, [], !1).filter((l) => at(l) && To(l) !== "body"),
    o = null;
  const s = Yt(e).position === "fixed";
  let i = s ? Zn(e) : e;
  for (; at(i) && !bo(i); ) {
    const l = Yt(i),
      a = Xf(i);
    !a && l.position === "fixed" && (o = null),
      (
        s
          ? !a && !o
          : (!a &&
              l.position === "static" &&
              !!o &&
              ["absolute", "fixed"].includes(o.position)) ||
            (Hs(i) && !a && Dv(e, i))
      )
        ? (r = r.filter((u) => u !== i))
        : (o = l),
      (i = Zn(i));
  }
  return t.set(e, r), r;
}
function hE(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: o } = e;
  const i = [
      ...(n === "clippingAncestors"
        ? rd(t)
          ? []
          : mE(t, this._c)
        : [].concat(n)),
      r,
    ],
    l = i[0],
    a = i.reduce((c, u) => {
      const f = hm(t, u, o);
      return (
        (c.top = Ge(f.top, c.top)),
        (c.right = Kt(f.right, c.right)),
        (c.bottom = Kt(f.bottom, c.bottom)),
        (c.left = Ge(f.left, c.left)),
        c
      );
    }, hm(t, l, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top,
  };
}
function gE(e) {
  const { width: t, height: n } = kv(e);
  return { width: t, height: n };
}
function yE(e, t, n) {
  const r = cn(t),
    o = Rn(t),
    s = n === "fixed",
    i = _r(e, !0, s, t);
  let l = { scrollLeft: 0, scrollTop: 0 };
  const a = er(0);
  if (r || (!r && !s))
    if (((To(t) !== "body" || Hs(o)) && (l = Gl(t)), r)) {
      const f = _r(t, !0, s, t);
      (a.x = f.x + t.clientLeft), (a.y = f.y + t.clientTop);
    } else o && (a.x = Rv(o));
  const c = i.left + l.scrollLeft - a.x,
    u = i.top + l.scrollTop - a.y;
  return { x: c, y: u, width: i.width, height: i.height };
}
function dc(e) {
  return Yt(e).position === "static";
}
function gm(e, t) {
  return !cn(e) || Yt(e).position === "fixed"
    ? null
    : t
    ? t(e)
    : e.offsetParent;
}
function Pv(e, t) {
  const n = St(e);
  if (rd(e)) return n;
  if (!cn(e)) {
    let o = Zn(e);
    for (; o && !bo(o); ) {
      if (at(o) && !dc(o)) return o;
      o = Zn(o);
    }
    return n;
  }
  let r = gm(e, t);
  for (; r && BC(r) && dc(r); ) r = gm(r, t);
  return r && bo(r) && dc(r) && !Xf(r) ? n : r || VC(e) || n;
}
const vE = async function (e) {
  const t = this.getOffsetParent || Pv,
    n = this.getDimensions,
    r = await n(e.floating);
  return {
    reference: yE(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  };
};
function wE(e) {
  return Yt(e).direction === "rtl";
}
const SE = {
  convertOffsetParentRelativeRectToViewportRelativeRect: cE,
  getDocumentElement: Rn,
  getClippingRect: hE,
  getOffsetParent: Pv,
  getElementRects: vE,
  getClientRects: uE,
  getDimensions: gE,
  getScale: ao,
  isElement: at,
  isRTL: wE,
};
function xE(e, t) {
  let n = null,
    r;
  const o = Rn(e);
  function s() {
    var l;
    clearTimeout(r), (l = n) == null || l.disconnect(), (n = null);
  }
  function i(l, a) {
    l === void 0 && (l = !1), a === void 0 && (a = 1), s();
    const { left: c, top: u, width: f, height: d } = e.getBoundingClientRect();
    if ((l || t(), !f || !d)) return;
    const m = yi(u),
      p = yi(o.clientWidth - (c + f)),
      h = yi(o.clientHeight - (u + d)),
      S = yi(c),
      g = {
        rootMargin: -m + "px " + -p + "px " + -h + "px " + -S + "px",
        threshold: Ge(0, Kt(1, a)) || 1,
      };
    let y = !0;
    function b(C) {
      const E = C[0].intersectionRatio;
      if (E !== a) {
        if (!y) return i();
        E
          ? i(!1, E)
          : (r = setTimeout(() => {
              i(!1, 1e-7);
            }, 1e3));
      }
      y = !1;
    }
    try {
      n = new IntersectionObserver(b, { ...g, root: o.ownerDocument });
    } catch {
      n = new IntersectionObserver(b, g);
    }
    n.observe(e);
  }
  return i(!0), s;
}
function bE(e, t, n, r) {
  r === void 0 && (r = {});
  const {
      ancestorScroll: o = !0,
      ancestorResize: s = !0,
      elementResize: i = typeof ResizeObserver == "function",
      layoutShift: l = typeof IntersectionObserver == "function",
      animationFrame: a = !1,
    } = r,
    c = nd(e),
    u = o || s ? [...(c ? Ds(c) : []), ...Ds(t)] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n, { passive: !0 }),
      s && v.addEventListener("resize", n);
  });
  const f = c && l ? xE(c, n) : null;
  let d = -1,
    m = null;
  i &&
    ((m = new ResizeObserver((v) => {
      let [g] = v;
      g &&
        g.target === c &&
        m &&
        (m.unobserve(t),
        cancelAnimationFrame(d),
        (d = requestAnimationFrame(() => {
          var y;
          (y = m) == null || y.observe(t);
        }))),
        n();
    })),
    c && !a && m.observe(c),
    m.observe(t));
  let p,
    h = a ? _r(e) : null;
  a && S();
  function S() {
    const v = _r(e);
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
      u.forEach((g) => {
        o && g.removeEventListener("scroll", n),
          s && g.removeEventListener("resize", n);
      }),
        f == null || f(),
        (v = m) == null || v.disconnect(),
        (m = null),
        a && cancelAnimationFrame(p);
    }
  );
}
const CE = nE,
  EE = rE,
  ym = JC,
  kE = sE,
  vm = QC,
  wm = eE,
  Sm = oE,
  _E = (e, t, n) => {
    const r = new Map(),
      o = { platform: SE, ...n },
      s = { ...o.platform, _c: r };
    return qC(e, t, { ...o, platform: s });
  },
  RE = (e) => {
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
            ? vm({ element: r.current, padding: o }).fn(n)
            : {}
          : r
          ? vm({ element: r, padding: o }).fn(n)
          : {};
      },
    };
  };
var Fi = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
function hl(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == "function" && e.toString() === t.toString()) return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (r = n; r-- !== 0; ) if (!hl(e[r], t[r])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1;
    for (r = n; r-- !== 0; ) {
      const s = o[r];
      if (!(s === "_owner" && e.$$typeof) && !hl(e[s], t[s])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Tv(e) {
  return typeof window > "u"
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function xm(e, t) {
  const n = Tv(e);
  return Math.round(t * n) / n;
}
function bm(e) {
  const t = w.useRef(e);
  return (
    Fi(() => {
      t.current = e;
    }),
    t
  );
}
function DE(e) {
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
    [u, f] = w.useState({
      x: 0,
      y: 0,
      strategy: n,
      placement: t,
      middlewareData: {},
      isPositioned: !1,
    }),
    [d, m] = w.useState(r);
  hl(d, r) || m(r);
  const [p, h] = w.useState(null),
    [S, v] = w.useState(null),
    g = w.useCallback((O) => {
      O !== E.current && ((E.current = O), h(O));
    }, []),
    y = w.useCallback((O) => {
      O !== R.current && ((R.current = O), v(O));
    }, []),
    b = s || p,
    C = i || S,
    E = w.useRef(null),
    R = w.useRef(null),
    D = w.useRef(u),
    j = a != null,
    T = bm(a),
    M = bm(o),
    B = w.useCallback(() => {
      if (!E.current || !R.current) return;
      const O = { placement: t, strategy: n, middleware: d };
      M.current && (O.platform = M.current),
        _E(E.current, R.current, O).then((_) => {
          const k = { ..._, isPositioned: !0 };
          H.current &&
            !hl(D.current, k) &&
            ((D.current = k),
            Vl.flushSync(() => {
              f(k);
            }));
        });
    }, [d, t, n, M]);
  Fi(() => {
    c === !1 &&
      D.current.isPositioned &&
      ((D.current.isPositioned = !1), f((O) => ({ ...O, isPositioned: !1 })));
  }, [c]);
  const H = w.useRef(!1);
  Fi(
    () => (
      (H.current = !0),
      () => {
        H.current = !1;
      }
    ),
    []
  ),
    Fi(() => {
      if ((b && (E.current = b), C && (R.current = C), b && C)) {
        if (T.current) return T.current(b, C, B);
        B();
      }
    }, [b, C, B, T, j]);
  const F = w.useMemo(
      () => ({ reference: E, floating: R, setReference: g, setFloating: y }),
      [g, y]
    ),
    L = w.useMemo(() => ({ reference: b, floating: C }), [b, C]),
    P = w.useMemo(() => {
      const O = { position: n, left: 0, top: 0 };
      if (!L.floating) return O;
      const _ = xm(L.floating, u.x),
        k = xm(L.floating, u.y);
      return l
        ? {
            ...O,
            transform: "translate(" + _ + "px, " + k + "px)",
            ...(Tv(L.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: _, top: k };
    }, [n, l, L.floating, u.x, u.y]);
  return w.useMemo(
    () => ({ ...u, update: B, refs: F, elements: L, floatingStyles: P }),
    [u, B, F, L, P]
  );
}
const Ov = { ...$h },
  PE = Ov.useInsertionEffect,
  TE = PE || ((e) => e());
function OE(e) {
  const t = w.useRef(() => {});
  return (
    TE(() => {
      t.current = e;
    }),
    w.useCallback(function () {
      for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
        r[o] = arguments[o];
      return t.current == null ? void 0 : t.current(...r);
    }, [])
  );
}
var wu = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
let Cm = !1,
  NE = 0;
const Em = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + NE++;
function $E() {
  const [e, t] = w.useState(() => (Cm ? Em() : void 0));
  return (
    wu(() => {
      e == null && t(Em());
    }, []),
    w.useEffect(() => {
      Cm = !0;
    }, []),
    e
  );
}
const LE = Ov.useId,
  jE = LE || $E;
function AE() {
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
const FE = w.createContext(null),
  ME = w.createContext(null),
  zE = () => {
    var e;
    return ((e = w.useContext(FE)) == null ? void 0 : e.id) || null;
  },
  IE = () => w.useContext(ME);
function BE(e) {
  const { open: t = !1, onOpenChange: n, elements: r } = e,
    o = jE(),
    s = w.useRef({}),
    [i] = w.useState(() => AE()),
    l = zE() != null,
    [a, c] = w.useState(r.reference),
    u = OE((m, p, h) => {
      (s.current.openEvent = m ? p : void 0),
        i.emit("openchange", { open: m, event: p, reason: h, nested: l }),
        n == null || n(m, p, h);
    }),
    f = w.useMemo(() => ({ setPositionReference: c }), []),
    d = w.useMemo(
      () => ({
        reference: a || r.reference || null,
        floating: r.floating || null,
        domReference: r.reference,
      }),
      [a, r.reference, r.floating]
    );
  return w.useMemo(
    () => ({
      dataRef: s,
      open: t,
      onOpenChange: u,
      elements: d,
      events: i,
      floatingId: o,
      refs: f,
    }),
    [t, u, d, i, o, f]
  );
}
function VE(e) {
  e === void 0 && (e = {});
  const { nodeId: t } = e,
    n = BE({
      ...e,
      elements: { reference: null, floating: null, ...e.elements },
    }),
    r = e.rootContext || n,
    o = r.elements,
    [s, i] = w.useState(null),
    [l, a] = w.useState(null),
    u = (o == null ? void 0 : o.reference) || s,
    f = w.useRef(null),
    d = IE();
  wu(() => {
    u && (f.current = u);
  }, [u]);
  const m = DE({ ...e, elements: { ...o, ...(l && { reference: l }) } }),
    p = w.useCallback(
      (y) => {
        const b = at(y)
          ? {
              getBoundingClientRect: () => y.getBoundingClientRect(),
              contextElement: y,
            }
          : y;
        a(b), m.refs.setReference(b);
      },
      [m.refs]
    ),
    h = w.useCallback(
      (y) => {
        (at(y) || y === null) && ((f.current = y), i(y)),
          (at(m.refs.reference.current) ||
            m.refs.reference.current === null ||
            (y !== null && !at(y))) &&
            m.refs.setReference(y);
      },
      [m.refs]
    ),
    S = w.useMemo(
      () => ({
        ...m.refs,
        setReference: h,
        setPositionReference: p,
        domReference: f,
      }),
      [m.refs, h, p]
    ),
    v = w.useMemo(() => ({ ...m.elements, domReference: u }), [m.elements, u]),
    g = w.useMemo(
      () => ({ ...m, ...r, refs: S, elements: v, nodeId: t }),
      [m, S, v, t, r]
    );
  return (
    wu(() => {
      r.dataRef.current.floatingContext = g;
      const y = d == null ? void 0 : d.nodesRef.current.find((b) => b.id === t);
      y && (y.context = g);
    }),
    w.useMemo(() => ({ ...m, context: g, refs: S, elements: v }), [m, S, v, g])
  );
}
function HE(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, r] = t.split("-"),
      o = n === "right" ? "left" : "right";
    return r === void 0 ? o : `${o}-${r}`;
  }
  return t;
}
function km(e, t, n, r) {
  return e === "center" || r === "center"
    ? { top: t }
    : e === "end"
    ? { bottom: n }
    : e === "start"
    ? { top: n }
    : {};
}
function _m(e, t, n, r, o) {
  return e === "center" || r === "center"
    ? { left: t }
    : e === "end"
    ? { [o === "ltr" ? "right" : "left"]: n }
    : e === "start"
    ? { [o === "ltr" ? "left" : "right"]: n }
    : {};
}
const UE = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius",
};
function WE({
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
      [UE[a]]: z(r),
    },
    f = z(-t / 2);
  return a === "left"
    ? {
        ...u,
        ...km(c, i, n, o),
        right: f,
        borderLeftColor: "transparent",
        borderBottomColor: "transparent",
      }
    : a === "right"
    ? {
        ...u,
        ...km(c, i, n, o),
        left: f,
        borderRightColor: "transparent",
        borderTopColor: "transparent",
      }
    : a === "top"
    ? {
        ...u,
        ..._m(c, s, n, o, l),
        bottom: f,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
      }
    : a === "bottom"
    ? {
        ...u,
        ..._m(c, s, n, o, l),
        top: f,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
      }
    : {};
}
const Nv = w.forwardRef(
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
    const { dir: f } = Hf();
    return s
      ? x.jsx("div", {
          ...c,
          ref: u,
          style: {
            ...a,
            ...WE({
              position: e,
              arrowSize: t,
              arrowOffset: n,
              arrowRadius: r,
              arrowPosition: o,
              dir: f,
              arrowX: i,
              arrowY: l,
            }),
          },
        })
      : null;
  }
);
Nv.displayName = "@mantine/core/FloatingArrow";
const [YE, $v] = Or("Popover component was not found in the tree");
function Xl({ children: e, active: t = !0, refProp: n = "ref" }) {
  const r = ob(t),
    o = Nt(r, e == null ? void 0 : e.ref);
  return Po(e) ? w.cloneElement(e, { [n]: o }) : e;
}
function Lv(e) {
  return x.jsx(Kf, { tabIndex: -1, "data-autofocus": !0, ...e });
}
Xl.displayName = "@mantine/core/FocusTrap";
Lv.displayName = "@mantine/core/FocusTrapInitialFocus";
Xl.InitialFocus = Lv;
function KE(e) {
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
const GE = {},
  jv = w.forwardRef((e, t) => {
    const { children: n, target: r, ...o } = W("Portal", GE, e),
      [s, i] = w.useState(!1),
      l = w.useRef(null);
    return (
      Ms(
        () => (
          i(!0),
          (l.current = r
            ? typeof r == "string"
              ? document.querySelector(r)
              : r
            : KE(o)),
          Ff(t, l.current),
          !r && l.current && document.body.appendChild(l.current),
          () => {
            !r && l.current && document.body.removeChild(l.current);
          }
        ),
        [r]
      ),
      !s || !l.current
        ? null
        : Vl.createPortal(x.jsx(x.Fragment, { children: n }), l.current)
    );
  });
jv.displayName = "@mantine/core/Portal";
function ql({ withinPortal: e = !0, children: t, ...n }) {
  return e
    ? x.jsx(jv, { ...n, children: t })
    : x.jsx(x.Fragment, { children: t });
}
ql.displayName = "@mantine/core/OptionalPortal";
const Go = (e) => ({
    in: { opacity: 1, transform: "scale(1)" },
    out: {
      opacity: 0,
      transform: `scale(.9) translateY(${z(e === "bottom" ? 10 : -10)})`,
    },
    transitionProperty: "transform, opacity",
  }),
  vi = {
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
    pop: { ...Go("bottom"), common: { transformOrigin: "center center" } },
    "pop-bottom-left": {
      ...Go("bottom"),
      common: { transformOrigin: "bottom left" },
    },
    "pop-bottom-right": {
      ...Go("bottom"),
      common: { transformOrigin: "bottom right" },
    },
    "pop-top-left": { ...Go("top"), common: { transformOrigin: "top left" } },
    "pop-top-right": { ...Go("top"), common: { transformOrigin: "top right" } },
  },
  Rm = {
    entering: "in",
    entered: "in",
    exiting: "out",
    exited: "out",
    "pre-exiting": "out",
    "pre-entering": "out",
  };
function XE({ transition: e, state: t, duration: n, timingFunction: r }) {
  const o = { transitionDuration: `${n}ms`, transitionTimingFunction: r };
  return typeof e == "string"
    ? e in vi
      ? {
          transitionProperty: vi[e].transitionProperty,
          ...o,
          ...vi[e].common,
          ...vi[e][Rm[t]],
        }
      : {}
    : {
        transitionProperty: e.transitionProperty,
        ...o,
        ...e.common,
        ...e[Rm[t]],
      };
}
function qE({
  duration: e,
  exitDuration: t,
  timingFunction: n,
  mounted: r,
  onEnter: o,
  onExit: s,
  onEntered: i,
  onExited: l,
}) {
  const a = kn(),
    c = Qy(),
    u = a.respectReducedMotion ? c : !1,
    [f, d] = w.useState(u ? 0 : e),
    [m, p] = w.useState(r ? "entered" : "exited"),
    h = w.useRef(-1),
    S = w.useRef(-1),
    v = (g) => {
      const y = g ? o : s,
        b = g ? i : l;
      window.clearTimeout(h.current);
      const C = u ? 0 : g ? e : t;
      d(C),
        C === 0
          ? (typeof y == "function" && y(),
            typeof b == "function" && b(),
            p(g ? "entered" : "exited"))
          : (S.current = requestAnimationFrame(() => {
              nx.flushSync(() => {
                p(g ? "pre-entering" : "pre-exiting");
              }),
                (S.current = requestAnimationFrame(() => {
                  typeof y == "function" && y(),
                    p(g ? "entering" : "exiting"),
                    (h.current = window.setTimeout(() => {
                      typeof b == "function" && b(),
                        p(g ? "entered" : "exited");
                    }, C));
                }));
            }));
    };
  return (
    wo(() => {
      v(r);
    }, [r]),
    w.useEffect(
      () => () => {
        window.clearTimeout(h.current), cancelAnimationFrame(S.current);
      },
      []
    ),
    {
      transitionDuration: f,
      transitionStatus: m,
      transitionTimingFunction: n || "ease",
    }
  );
}
function No({
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
    transitionDuration: f,
    transitionStatus: d,
    transitionTimingFunction: m,
  } = qE({
    mounted: o,
    exitDuration: r,
    duration: n,
    timingFunction: i,
    onExit: l,
    onEntered: a,
    onEnter: c,
    onExited: u,
  });
  return f === 0
    ? o
      ? x.jsx(x.Fragment, { children: s({}) })
      : e
      ? s({ display: "none" })
      : null
    : d === "exited"
    ? e
      ? s({ display: "none" })
      : null
    : x.jsx(x.Fragment, {
        children: s(
          XE({ transition: t, duration: f, state: d, timingFunction: m })
        ),
      });
}
No.displayName = "@mantine/core/Transition";
var Av = { dropdown: "m_38a85659", arrow: "m_a31dc6c1" };
const QE = {},
  od = Q((e, t) => {
    var S, v, g, y;
    const n = W("PopoverDropdown", QE, e),
      {
        className: r,
        style: o,
        vars: s,
        children: i,
        onKeyDownCapture: l,
        variant: a,
        classNames: c,
        styles: u,
        ...f
      } = n,
      d = $v(),
      m = Ky({ opened: d.opened, shouldReturnFocus: d.returnFocus }),
      p = d.withRoles
        ? {
            "aria-labelledby": d.getTargetId(),
            id: d.getDropdownId(),
            role: "dialog",
            tabIndex: -1,
          }
        : {},
      h = Nt(t, d.floating);
    return d.disabled
      ? null
      : x.jsx(ql, {
          ...d.portalProps,
          withinPortal: d.withinPortal,
          children: x.jsx(No, {
            mounted: d.opened,
            ...d.transitionProps,
            transition:
              ((S = d.transitionProps) == null ? void 0 : S.transition) ||
              "fade",
            duration:
              ((v = d.transitionProps) == null ? void 0 : v.duration) ?? 150,
            keepMounted: d.keepMounted,
            exitDuration:
              typeof ((g = d.transitionProps) == null
                ? void 0
                : g.exitDuration) == "number"
                ? d.transitionProps.exitDuration
                : (y = d.transitionProps) == null
                ? void 0
                : y.duration,
            children: (b) =>
              x.jsx(Xl, {
                active: d.trapFocus,
                children: x.jsxs(Z, {
                  ...p,
                  ...f,
                  variant: a,
                  ref: h,
                  onKeyDownCapture: Wx(d.onClose, {
                    active: d.closeOnEscape,
                    onTrigger: m,
                    onKeyDown: l,
                  }),
                  "data-position": d.placement,
                  ...d.getStyles("dropdown", {
                    className: r,
                    props: n,
                    classNames: c,
                    styles: u,
                    style: [
                      {
                        ...b,
                        zIndex: d.zIndex,
                        top: d.y ?? 0,
                        left: d.x ?? 0,
                        width: d.width === "target" ? void 0 : z(d.width),
                      },
                      o,
                    ],
                  }),
                  children: [
                    i,
                    x.jsx(Nv, {
                      ref: d.arrowRef,
                      arrowX: d.arrowX,
                      arrowY: d.arrowY,
                      visible: d.withArrow,
                      position: d.placement,
                      arrowSize: d.arrowSize,
                      arrowRadius: d.arrowRadius,
                      arrowOffset: d.arrowOffset,
                      arrowPosition: d.arrowPosition,
                      ...d.getStyles("arrow", {
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
od.classes = Av;
od.displayName = "@mantine/core/PopoverDropdown";
const JE = { refProp: "ref", popupType: "dialog" },
  Fv = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      popupType: o,
      ...s
    } = W("PopoverTarget", JE, e);
    if (!Po(n))
      throw new Error(
        "Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = s,
      l = $v(),
      a = Nt(l.reference, n.ref, t),
      c = l.withRoles
        ? {
            "aria-haspopup": o,
            "aria-expanded": l.opened,
            "aria-controls": l.getDropdownId(),
            id: l.getTargetId(),
          }
        : {};
    return w.cloneElement(n, {
      ...i,
      ...c,
      ...l.targetProps,
      className: nt(l.targetProps.className, i.className, n.props.className),
      [r]: a,
      ...(l.controlled ? null : { onClick: l.onToggle }),
    });
  });
Fv.displayName = "@mantine/core/PopoverTarget";
function ZE({ opened: e, floating: t, position: n, positionDependencies: r }) {
  const [o, s] = w.useState(0);
  w.useEffect(() => {
    if (t.refs.reference.current && t.refs.floating.current)
      return bE(t.refs.reference.current, t.refs.floating.current, t.update);
  }, [t.refs.reference.current, t.refs.floating.current, e, o, n]),
    wo(() => {
      t.update();
    }, r),
    wo(() => {
      s((i) => i + 1);
    }, [e]);
}
function ek(e) {
  if (e === void 0) return { shift: !0, flip: !0 };
  const t = { ...e };
  return (
    e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t
  );
}
function tk(e, t) {
  const n = ek(e.middlewares),
    r = [CE(e.offset)];
  return (
    n.shift &&
      r.push(
        EE(
          typeof n.shift == "boolean"
            ? { limiter: Sm(), padding: 5 }
            : { limiter: Sm(), padding: 5, ...n.shift }
        )
      ),
    n.flip && r.push(typeof n.flip == "boolean" ? ym() : ym(n.flip)),
    n.inline && r.push(typeof n.inline == "boolean" ? wm() : wm(n.inline)),
    r.push(RE({ element: e.arrowRef, padding: e.arrowOffset })),
    (n.size || e.width === "target") &&
      r.push(
        kE({
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
function nk(e) {
  const [t, n] = So({
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
    s = VE({
      strategy: e.strategy,
      placement: e.position,
      middleware: tk(e, () => s),
    });
  return (
    ZE({
      opened: e.opened,
      position: e.position,
      positionDependencies: e.positionDependencies || [],
      floating: s,
    }),
    wo(() => {
      var i;
      (i = e.onPositionChange) == null || i.call(e, s.placement);
    }, [s.placement]),
    wo(() => {
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
const rk = {
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
    zIndex: Nr("popover"),
    __staticSelector: "Popover",
    width: "max-content",
  },
  ok = (e, { radius: t, shadow: n }) => ({
    dropdown: {
      "--popover-radius": t === void 0 ? void 0 : or(t),
      "--popover-shadow": Af(n),
    },
  });
function sr(e) {
  var xe, gt, At, Ie, U, re;
  const t = W("Popover", rk, e),
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
      withArrow: f,
      arrowSize: d,
      arrowOffset: m,
      arrowRadius: p,
      arrowPosition: h,
      unstyled: S,
      classNames: v,
      styles: g,
      closeOnClickOutside: y,
      withinPortal: b,
      portalProps: C,
      closeOnEscape: E,
      clickOutsideEvents: R,
      trapFocus: D,
      onClose: j,
      onOpen: T,
      onChange: M,
      zIndex: B,
      radius: H,
      shadow: F,
      id: L,
      defaultOpened: P,
      __staticSelector: O,
      withRoles: _,
      disabled: k,
      returnFocus: $,
      variant: N,
      keepMounted: I,
      vars: Y,
      floatingStrategy: X,
      ...ee
    } = t,
    ne = de({
      name: O,
      props: t,
      classes: Av,
      classNames: v,
      styles: g,
      unstyled: S,
      rootSelector: "dropdown",
      vars: Y,
      varsResolver: ok,
    }),
    te = w.useRef(null),
    [me, oe] = w.useState(null),
    [le, q] = w.useState(null),
    { dir: ye } = Hf(),
    ce = zs(L),
    se = nk({
      middlewares: u,
      width: c,
      position: HE(ye, r),
      offset: typeof o == "number" ? o + (f ? d / 2 : 0) : o,
      arrowRef: te,
      arrowOffset: m,
      onPositionChange: s,
      positionDependencies: i,
      opened: l,
      defaultOpened: P,
      onChange: M,
      onOpen: T,
      onClose: j,
      strategy: X,
    });
  Gx(() => y && se.onClose(), R, [me, le]);
  const Oe = w.useCallback(
      (ae) => {
        oe(ae), se.floating.refs.setReference(ae);
      },
      [se.floating.refs.setReference]
    ),
    qe = w.useCallback(
      (ae) => {
        q(ae), se.floating.refs.setFloating(ae);
      },
      [se.floating.refs.setFloating]
    );
  return x.jsx(YE, {
    value: {
      returnFocus: $,
      disabled: k,
      controlled: se.controlled,
      reference: Oe,
      floating: qe,
      x: se.floating.x,
      y: se.floating.y,
      arrowX:
        (At =
          (gt = (xe = se.floating) == null ? void 0 : xe.middlewareData) == null
            ? void 0
            : gt.arrow) == null
          ? void 0
          : At.x,
      arrowY:
        (re =
          (U = (Ie = se.floating) == null ? void 0 : Ie.middlewareData) == null
            ? void 0
            : U.arrow) == null
          ? void 0
          : re.y,
      opened: se.opened,
      arrowRef: te,
      transitionProps: a,
      width: c,
      withArrow: f,
      arrowSize: d,
      arrowOffset: m,
      arrowRadius: p,
      arrowPosition: h,
      placement: se.floating.placement,
      trapFocus: D,
      withinPortal: b,
      portalProps: C,
      zIndex: B,
      radius: H,
      shadow: F,
      closeOnEscape: E,
      onClose: se.onClose,
      onToggle: se.onToggle,
      getTargetId: () => `${ce}-target`,
      getDropdownId: () => `${ce}-dropdown`,
      withRoles: _,
      targetProps: ee,
      __staticSelector: O,
      classNames: v,
      styles: g,
      unstyled: S,
      variant: N,
      keepMounted: I,
      getStyles: ne,
    },
    children: n,
  });
}
sr.Target = Fv;
sr.Dropdown = od;
sr.displayName = "@mantine/core/Popover";
sr.extend = (e) => e;
var Bt = {
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
const sk = w.forwardRef(({ className: e, ...t }, n) =>
    x.jsxs(Z, {
      component: "span",
      className: nt(Bt.barsLoader, e),
      ...t,
      ref: n,
      children: [
        x.jsx("span", { className: Bt.bar }),
        x.jsx("span", { className: Bt.bar }),
        x.jsx("span", { className: Bt.bar }),
      ],
    })
  ),
  ik = w.forwardRef(({ className: e, ...t }, n) =>
    x.jsxs(Z, {
      component: "span",
      className: nt(Bt.dotsLoader, e),
      ...t,
      ref: n,
      children: [
        x.jsx("span", { className: Bt.dot }),
        x.jsx("span", { className: Bt.dot }),
        x.jsx("span", { className: Bt.dot }),
      ],
    })
  ),
  lk = w.forwardRef(({ className: e, ...t }, n) =>
    x.jsx(Z, {
      component: "span",
      className: nt(Bt.ovalLoader, e),
      ...t,
      ref: n,
    })
  ),
  Mv = { bars: sk, oval: lk, dots: ik },
  ak = { loaders: Mv, type: "oval" },
  ck = (e, { size: t, color: n }) => ({
    root: {
      "--loader-size": ze(t, "loader-size"),
      "--loader-color": n ? fl(n, e) : void 0,
    },
  }),
  Us = Q((e, t) => {
    const n = W("Loader", ak, e),
      {
        size: r,
        color: o,
        type: s,
        vars: i,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: f,
        loaders: d,
        variant: m,
        children: p,
        ...h
      } = n,
      S = de({
        name: "Loader",
        props: n,
        classes: Bt,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: f,
        vars: i,
        varsResolver: ck,
      });
    return p
      ? x.jsx(Z, { ...S("root"), ref: t, ...h, children: p })
      : x.jsx(Z, {
          ...S("root"),
          ref: t,
          component: d[s],
          variant: m,
          size: r,
          ...h,
        });
  });
Us.defaultLoaders = Mv;
Us.classes = Bt;
Us.displayName = "@mantine/core/Loader";
const zv = w.forwardRef(
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
zv.displayName = "@mantine/core/CloseIcon";
var Iv = { root: "m_86a44da5", "root--subtle": "m_220c80f2" };
const uk = { variant: "subtle" },
  fk = (e, { size: t, radius: n, iconSize: r }) => ({
    root: {
      "--cb-size": ze(t, "cb-size"),
      "--cb-radius": n === void 0 ? void 0 : or(n),
      "--cb-icon-size": z(r),
    },
  }),
  Eo = _n((e, t) => {
    const n = W("CloseButton", uk, e),
      {
        iconSize: r,
        children: o,
        vars: s,
        radius: i,
        className: l,
        classNames: a,
        style: c,
        styles: u,
        unstyled: f,
        "data-disabled": d,
        disabled: m,
        variant: p,
        icon: h,
        mod: S,
        ...v
      } = n,
      g = de({
        name: "CloseButton",
        props: n,
        className: l,
        style: c,
        classes: Iv,
        classNames: a,
        styles: u,
        unstyled: f,
        vars: s,
        varsResolver: fk,
      });
    return x.jsxs(vn, {
      ref: t,
      ...v,
      unstyled: f,
      variant: p,
      disabled: m,
      mod: [{ disabled: m || d }, S],
      ...g("root", { variant: p, active: !m && !d }),
      children: [h || x.jsx(zv, {}), o],
    });
  });
Eo.classes = Iv;
Eo.displayName = "@mantine/core/CloseButton";
function dk(e) {
  return w.Children.toArray(e).filter(Boolean);
}
var Bv = { root: "m_4081bf90" };
const pk = {
    preventGrowOverflow: !0,
    gap: "md",
    align: "center",
    justify: "flex-start",
    wrap: "wrap",
  },
  mk = (
    e,
    { grow: t, preventGrowOverflow: n, gap: r, align: o, justify: s, wrap: i },
    { childWidth: l }
  ) => ({
    root: {
      "--group-child-width": t && n ? l : void 0,
      "--group-gap": Ul(r),
      "--group-align": o,
      "--group-justify": s,
      "--group-wrap": i,
    },
  }),
  zn = Q((e, t) => {
    const n = W("Group", pk, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        children: a,
        gap: c,
        align: u,
        justify: f,
        wrap: d,
        grow: m,
        preventGrowOverflow: p,
        vars: h,
        variant: S,
        __size: v,
        mod: g,
        ...y
      } = n,
      b = dk(a),
      C = b.length,
      E = Ul(c ?? "md"),
      D = { childWidth: `calc(${100 / C}% - (${E} - ${E} / ${C}))` },
      j = de({
        name: "Group",
        props: n,
        stylesCtx: D,
        className: o,
        style: s,
        classes: Bv,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: h,
        varsResolver: mk,
      });
    return x.jsx(Z, {
      ...j("root"),
      ref: t,
      variant: S,
      mod: [{ grow: m }, g],
      size: v,
      ...y,
      children: b,
    });
  });
zn.classes = Bv;
zn.displayName = "@mantine/core/Group";
var Vv = { root: "m_9814e45f" };
const hk = { zIndex: Nr("modal") },
  gk = (
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
        ((n !== void 0 || r !== void 0) && tn(n || "#000", r ?? 0.6)) ||
        void 0,
      "--overlay-filter": o ? `blur(${z(o)})` : void 0,
      "--overlay-radius": s === void 0 ? void 0 : or(s),
      "--overlay-z-index": i == null ? void 0 : i.toString(),
    },
  }),
  Ps = _n((e, t) => {
    const n = W("Overlay", hk, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        fixed: c,
        center: u,
        children: f,
        radius: d,
        zIndex: m,
        gradient: p,
        blur: h,
        color: S,
        backgroundOpacity: v,
        mod: g,
        ...y
      } = n,
      b = de({
        name: "Overlay",
        props: n,
        classes: Vv,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: gk,
      });
    return x.jsx(Z, {
      ref: t,
      ...b("root"),
      mod: [{ center: u, fixed: c }, g],
      ...y,
      children: f,
    });
  });
Ps.classes = Vv;
Ps.displayName = "@mantine/core/Overlay";
const [yk, Dn] = Or("ModalBase component was not found in tree");
function vk({ opened: e, transitionDuration: t }) {
  const [n, r] = w.useState(e),
    o = w.useRef(),
    i = Qy() ? 0 : t;
  return (
    w.useEffect(
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
function wk({
  id: e,
  transitionProps: t,
  opened: n,
  trapFocus: r,
  closeOnEscape: o,
  onClose: s,
  returnFocus: i,
}) {
  const l = zs(e),
    [a, c] = w.useState(!1),
    [u, f] = w.useState(!1),
    d =
      typeof (t == null ? void 0 : t.duration) == "number"
        ? t == null
          ? void 0
          : t.duration
        : 200,
    m = vk({ opened: n, transitionDuration: d });
  return (
    lb(
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
    Ky({ opened: n, shouldReturnFocus: r && i }),
    {
      _id: l,
      titleMounted: a,
      bodyMounted: u,
      shouldLockScroll: m,
      setTitleMounted: c,
      setBodyMounted: f,
    }
  );
}
const Sk = w.forwardRef(
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
      lockScroll: f,
      children: d,
      zIndex: m,
      shadow: p,
      padding: h,
      __vars: S,
      unstyled: v,
      removeScrollProps: g,
      ...y
    },
    b
  ) => {
    const {
      _id: C,
      titleMounted: E,
      bodyMounted: R,
      shouldLockScroll: D,
      setTitleMounted: j,
      setBodyMounted: T,
    } = wk({
      id: r,
      transitionProps: o,
      opened: t,
      trapFocus: s,
      closeOnEscape: i,
      onClose: n,
      returnFocus: l,
    });
    return x.jsx(ql, {
      ...u,
      withinPortal: c,
      children: x.jsx(yk, {
        value: {
          opened: t,
          onClose: n,
          closeOnClickOutside: a,
          transitionProps: { ...o, keepMounted: e },
          getTitleId: () => `${C}-title`,
          getBodyId: () => `${C}-body`,
          titleMounted: E,
          bodyMounted: R,
          setTitleMounted: j,
          setBodyMounted: T,
          trapFocus: s,
          closeOnEscape: i,
          zIndex: m,
          unstyled: v,
        },
        children: x.jsx(Hy, {
          enabled: D && f,
          ...g,
          children: x.jsx(Z, {
            ref: b,
            ...y,
            __vars: {
              ...S,
              "--mb-z-index": (m || Nr("modal")).toString(),
              "--mb-shadow": Af(p),
              "--mb-padding": Ul(h),
            },
            children: d,
          }),
        }),
      }),
    });
  }
);
function xk() {
  const e = Dn();
  return (
    w.useEffect(() => (e.setBodyMounted(!0), () => e.setBodyMounted(!1)), []),
    e.getBodyId()
  );
}
var ko = {
  title: "m_615af6c9",
  header: "m_b5489c3c",
  inner: "m_60c222c7",
  content: "m_fd1ab0aa",
  close: "m_606cb269",
  body: "m_5df29311",
};
const Hv = w.forwardRef(({ className: e, ...t }, n) => {
  const r = xk(),
    o = Dn();
  return x.jsx(Z, {
    ref: n,
    ...t,
    id: r,
    className: nt({ [ko.body]: !o.unstyled }, e),
  });
});
Hv.displayName = "@mantine/core/ModalBaseBody";
const Uv = w.forwardRef(({ className: e, onClick: t, ...n }, r) => {
  const o = Dn();
  return x.jsx(Eo, {
    ref: r,
    ...n,
    onClick: (s) => {
      o.onClose(), t == null || t(s);
    },
    className: nt({ [ko.close]: !o.unstyled }, e),
    unstyled: o.unstyled,
  });
});
Uv.displayName = "@mantine/core/ModalBaseCloseButton";
const bk = w.forwardRef(
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
      const l = Dn();
      return x.jsx(No, {
        mounted: l.opened,
        transition: "pop",
        ...l.transitionProps,
        ...e,
        children: (a) =>
          x.jsx("div", {
            ...n,
            className: nt({ [ko.inner]: !l.unstyled }, n.className),
            children: x.jsx(Xl, {
              active: l.opened && l.trapFocus,
              children: x.jsx(Gf, {
                ...s,
                component: "section",
                role: "dialog",
                tabIndex: -1,
                "aria-modal": !0,
                "aria-describedby": l.bodyMounted ? l.getBodyId() : void 0,
                "aria-labelledby": l.titleMounted ? l.getTitleId() : void 0,
                ref: i,
                style: [o, a],
                className: nt({ [ko.content]: !l.unstyled }, t),
                unstyled: l.unstyled,
                children: s.children,
              }),
            }),
          }),
      });
    }
  ),
  Wv = w.forwardRef(({ className: e, ...t }, n) => {
    const r = Dn();
    return x.jsx(Z, {
      component: "header",
      ref: n,
      className: nt({ [ko.header]: !r.unstyled }, e),
      ...t,
    });
  });
Wv.displayName = "@mantine/core/ModalBaseHeader";
const Ck = { duration: 200, timingFunction: "ease", transition: "fade" };
function Ek(e) {
  const t = Dn();
  return { ...Ck, ...t.transitionProps, ...e };
}
const Yv = w.forwardRef(
  ({ onClick: e, transitionProps: t, style: n, ...r }, o) => {
    const s = Dn(),
      i = Ek(t);
    return x.jsx(No, {
      mounted: s.opened,
      ...i,
      transition: "fade",
      children: (l) =>
        x.jsx(Ps, {
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
Yv.displayName = "@mantine/core/ModalBaseOverlay";
function kk() {
  const e = Dn();
  return (
    w.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []),
    e.getTitleId()
  );
}
const Kv = w.forwardRef(({ className: e, ...t }, n) => {
  const r = kk(),
    o = Dn();
  return x.jsx(Z, {
    component: "h2",
    ref: n,
    className: nt({ [ko.title]: !o.unstyled }, e),
    ...t,
    id: r,
  });
});
Kv.displayName = "@mantine/core/ModalBaseTitle";
function _k({ children: e }) {
  return x.jsx(x.Fragment, { children: e });
}
const [Rk, Ql] = Vx({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0,
});
var Lt = {
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
const Dm = {},
  Dk = (e, { size: t }) => ({
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  Jl = Q((e, t) => {
    const n = W("InputDescription", Dm, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        __staticSelector: u,
        __inheritStyles: f = !0,
        variant: d,
        ...m
      } = W("InputDescription", Dm, n),
      p = Ql(),
      h = de({
        name: ["InputWrapper", u],
        props: n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "description",
        vars: a,
        varsResolver: Dk,
      }),
      S = (f && (p == null ? void 0 : p.getStyles)) || h;
    return x.jsx(Z, {
      component: "p",
      ref: t,
      variant: d,
      size: c,
      ...S(
        "description",
        p != null && p.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
Jl.classes = Lt;
Jl.displayName = "@mantine/core/InputDescription";
const Pk = {},
  Tk = (e, { size: t }) => ({
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  Zl = Q((e, t) => {
    const n = W("InputError", Pk, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        __staticSelector: u,
        __inheritStyles: f = !0,
        variant: d,
        ...m
      } = n,
      p = de({
        name: ["InputWrapper", u],
        props: n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "error",
        vars: a,
        varsResolver: Tk,
      }),
      h = Ql(),
      S = (f && (h == null ? void 0 : h.getStyles)) || p;
    return x.jsx(Z, {
      component: "p",
      ref: t,
      variant: d,
      size: c,
      ...S(
        "error",
        h != null && h.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
Zl.classes = Lt;
Zl.displayName = "@mantine/core/InputError";
const Pm = { labelElement: "label" },
  Ok = (e, { size: t }) => ({
    label: { "--input-label-size": tt(t), "--input-asterisk-color": void 0 },
  }),
  ea = Q((e, t) => {
    const n = W("InputLabel", Pm, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        labelElement: c,
        size: u,
        required: f,
        htmlFor: d,
        onMouseDown: m,
        children: p,
        __staticSelector: h,
        variant: S,
        mod: v,
        ...g
      } = W("InputLabel", Pm, n),
      y = de({
        name: ["InputWrapper", h],
        props: n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "label",
        vars: a,
        varsResolver: Ok,
      }),
      b = Ql(),
      C = (b == null ? void 0 : b.getStyles) || y;
    return x.jsxs(Z, {
      ...C(
        "label",
        b != null && b.getStyles ? { className: o, style: s } : void 0
      ),
      component: c,
      variant: S,
      size: u,
      ref: t,
      htmlFor: c === "label" ? d : void 0,
      mod: [{ required: f }, v],
      onMouseDown: (E) => {
        m == null || m(E),
          !E.defaultPrevented && E.detail > 1 && E.preventDefault();
      },
      ...g,
      children: [
        p,
        f &&
          x.jsx("span", {
            ...C("required"),
            "aria-hidden": !0,
            children: " *",
          }),
      ],
    });
  });
ea.classes = Lt;
ea.displayName = "@mantine/core/InputLabel";
const Tm = {},
  sd = Q((e, t) => {
    const n = W("InputPlaceholder", Tm, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        variant: u,
        error: f,
        mod: d,
        ...m
      } = W("InputPlaceholder", Tm, n),
      p = de({
        name: ["InputPlaceholder", c],
        props: n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "placeholder",
      });
    return x.jsx(Z, {
      ...p("placeholder"),
      mod: [{ error: !!f }, d],
      component: "span",
      variant: u,
      ref: t,
      ...m,
    });
  });
sd.classes = Lt;
sd.displayName = "@mantine/core/InputPlaceholder";
function Nk(e, { hasDescription: t, hasError: n }) {
  const r = e.findIndex((a) => a === "input"),
    o = e[r - 1],
    s = e[r + 1];
  return {
    offsetBottom: (t && s === "description") || (n && s === "error"),
    offsetTop: (t && o === "description") || (n && o === "error"),
  };
}
const $k = {
    labelElement: "label",
    inputContainer: (e) => e,
    inputWrapperOrder: ["label", "description", "input", "error"],
  },
  Lk = (e, { size: t }) => ({
    label: { "--input-label-size": tt(t), "--input-asterisk-color": void 0 },
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  id = Q((e, t) => {
    const n = W("InputWrapper", $k, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        size: c,
        variant: u,
        __staticSelector: f,
        inputContainer: d,
        inputWrapperOrder: m,
        label: p,
        error: h,
        description: S,
        labelProps: v,
        descriptionProps: g,
        errorProps: y,
        labelElement: b,
        children: C,
        withAsterisk: E,
        id: R,
        required: D,
        __stylesApiProps: j,
        mod: T,
        ...M
      } = n,
      B = de({
        name: ["InputWrapper", f],
        props: j || n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: Lk,
      }),
      H = { size: c, variant: u, __staticSelector: f },
      F = zs(R),
      L = typeof E == "boolean" ? E : D,
      P = (y == null ? void 0 : y.id) || `${F}-error`,
      O = (g == null ? void 0 : g.id) || `${F}-description`,
      _ = F,
      k = !!h && typeof h != "boolean",
      $ = !!S,
      N = `${k ? P : ""} ${$ ? O : ""}`,
      I = N.trim().length > 0 ? N.trim() : void 0,
      Y = (v == null ? void 0 : v.id) || `${F}-label`,
      X =
        p &&
        x.jsx(
          ea,
          {
            labelElement: b,
            id: Y,
            htmlFor: _,
            required: L,
            ...H,
            ...v,
            children: p,
          },
          "label"
        ),
      ee =
        $ &&
        x.jsx(
          Jl,
          {
            ...g,
            ...H,
            size: (g == null ? void 0 : g.size) || H.size,
            id: (g == null ? void 0 : g.id) || O,
            children: S,
          },
          "description"
        ),
      ne = x.jsx(w.Fragment, { children: d(C) }, "input"),
      te =
        k &&
        w.createElement(
          Zl,
          {
            ...y,
            ...H,
            size: (y == null ? void 0 : y.size) || H.size,
            key: "error",
            id: (y == null ? void 0 : y.id) || P,
          },
          h
        ),
      me = m.map((oe) => {
        switch (oe) {
          case "label":
            return X;
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
    return x.jsx(Rk, {
      value: {
        getStyles: B,
        describedBy: I,
        inputId: _,
        labelId: Y,
        ...Nk(m, { hasDescription: $, hasError: k }),
      },
      children: x.jsx(Z, {
        ref: t,
        variant: u,
        size: c,
        mod: [{ error: !!h }, T],
        ...B("root"),
        ...M,
        children: me,
      }),
    });
  });
id.classes = Lt;
id.displayName = "@mantine/core/InputWrapper";
const jk = {
    variant: "default",
    leftSectionPointerEvents: "none",
    rightSectionPointerEvents: "none",
    withAria: !0,
    withErrorStyles: !0,
  },
  Ak = (e, t, n) => ({
    wrapper: {
      "--input-margin-top": n.offsetTop
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-margin-bottom": n.offsetBottom
        ? "calc(var(--mantine-spacing-xs) / 2)"
        : void 0,
      "--input-height": ze(t.size, "input-height"),
      "--input-fz": tt(t.size),
      "--input-radius": t.radius === void 0 ? void 0 : or(t.radius),
      "--input-left-section-width":
        t.leftSectionWidth !== void 0 ? z(t.leftSectionWidth) : void 0,
      "--input-right-section-width":
        t.rightSectionWidth !== void 0 ? z(t.rightSectionWidth) : void 0,
      "--input-padding-y": t.multiline ? ze(t.size, "input-padding-y") : void 0,
      "--input-left-section-pointer-events": t.leftSectionPointerEvents,
      "--input-right-section-pointer-events": t.rightSectionPointerEvents,
    },
  }),
  Ot = _n((e, t) => {
    const n = W("Input", jk, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        required: a,
        __staticSelector: c,
        __stylesApiProps: u,
        size: f,
        wrapperProps: d,
        error: m,
        disabled: p,
        leftSection: h,
        leftSectionProps: S,
        leftSectionWidth: v,
        rightSection: g,
        rightSectionProps: y,
        rightSectionWidth: b,
        rightSectionPointerEvents: C,
        leftSectionPointerEvents: E,
        variant: R,
        vars: D,
        pointer: j,
        multiline: T,
        radius: M,
        id: B,
        withAria: H,
        withErrorStyles: F,
        mod: L,
        ...P
      } = n,
      { styleProps: O, rest: _ } = Vf(P),
      k = Ql(),
      $ = {
        offsetBottom: k == null ? void 0 : k.offsetBottom,
        offsetTop: k == null ? void 0 : k.offsetTop,
      },
      N = de({
        name: ["Input", c],
        props: u || n,
        classes: Lt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        stylesCtx: $,
        rootSelector: "wrapper",
        vars: D,
        varsResolver: Ak,
      }),
      I = H
        ? {
            required: a,
            disabled: p,
            "aria-invalid": !!m,
            "aria-describedby": k == null ? void 0 : k.describedBy,
            id: (k == null ? void 0 : k.inputId) || B,
          }
        : {};
    return x.jsxs(Z, {
      ...N("wrapper"),
      ...O,
      ...d,
      mod: [
        {
          error: !!m && F,
          pointer: j,
          disabled: p,
          multiline: T,
          "data-with-right-section": !!g,
          "data-with-left-section": !!h,
        },
        L,
      ],
      variant: R,
      size: f,
      children: [
        h &&
          x.jsx("div", {
            ...S,
            "data-position": "left",
            ...N("section", {
              className: S == null ? void 0 : S.className,
              style: S == null ? void 0 : S.style,
            }),
            children: h,
          }),
        x.jsx(Z, {
          component: "input",
          ..._,
          ...I,
          ref: t,
          required: a,
          mod: { disabled: p, error: !!m && F },
          variant: R,
          ...N("input"),
        }),
        g &&
          x.jsx("div", {
            ...y,
            "data-position": "right",
            ...N("section", {
              className: y == null ? void 0 : y.className,
              style: y == null ? void 0 : y.style,
            }),
            children: g,
          }),
      ],
    });
  });
Ot.classes = Lt;
Ot.Wrapper = id;
Ot.Label = ea;
Ot.Error = Zl;
Ot.Description = Jl;
Ot.Placeholder = sd;
Ot.displayName = "@mantine/core/Input";
function Fk(e, t, n) {
  const r = W(e, t, n),
    {
      label: o,
      description: s,
      error: i,
      required: l,
      classNames: a,
      styles: c,
      className: u,
      unstyled: f,
      __staticSelector: d,
      __stylesApiProps: m,
      errorProps: p,
      labelProps: h,
      descriptionProps: S,
      wrapperProps: v,
      id: g,
      size: y,
      style: b,
      inputContainer: C,
      inputWrapperOrder: E,
      withAsterisk: R,
      variant: D,
      vars: j,
      mod: T,
      ...M
    } = r,
    { styleProps: B, rest: H } = Vf(M),
    F = {
      label: o,
      description: s,
      error: i,
      required: l,
      classNames: a,
      className: u,
      __staticSelector: d,
      __stylesApiProps: m || r,
      errorProps: p,
      labelProps: h,
      descriptionProps: S,
      unstyled: f,
      styles: c,
      size: y,
      style: b,
      inputContainer: C,
      inputWrapperOrder: E,
      withAsterisk: R,
      variant: D,
      id: g,
      mod: T,
      ...v,
    };
  return {
    ...H,
    classNames: a,
    styles: c,
    unstyled: f,
    wrapperProps: { ...F, ...B },
    inputProps: {
      required: l,
      classNames: a,
      styles: c,
      unstyled: f,
      size: y,
      __staticSelector: d,
      __stylesApiProps: m || r,
      error: i,
      variant: D,
      id: g,
    },
  };
}
const Mk = { __staticSelector: "InputBase", withAria: !0 },
  ir = _n((e, t) => {
    const { inputProps: n, wrapperProps: r, ...o } = Fk("InputBase", Mk, e);
    return x.jsx(Ot.Wrapper, {
      ...r,
      children: x.jsx(Ot, { ...n, ...o, ref: t }),
    });
  });
ir.classes = { ...Ot.classes, ...Ot.Wrapper.classes };
ir.displayName = "@mantine/core/InputBase";
function Su({ style: e, size: t = 16, ...n }) {
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
Su.displayName = "@mantine/core/AccordionChevron";
var Gv = { root: "m_b6d8b162" };
function zk(e) {
  if (e === "start") return "start";
  if (e === "end" || e) return "end";
}
const Ik = { inherit: !1 },
  Bk = (e, { variant: t, lineClamp: n, gradient: r, size: o, color: s }) => ({
    root: {
      "--text-fz": tt(o),
      "--text-lh": Yx(o),
      "--text-gradient": t === "gradient" ? mu(r, e) : void 0,
      "--text-line-clamp": typeof n == "number" ? n.toString() : void 0,
      "--text-color": s ? fl(s, e) : void 0,
    },
  }),
  Zr = _n((e, t) => {
    const n = W("Text", Ik, e),
      {
        lineClamp: r,
        truncate: o,
        inline: s,
        inherit: i,
        gradient: l,
        span: a,
        __staticSelector: c,
        vars: u,
        className: f,
        style: d,
        classNames: m,
        styles: p,
        unstyled: h,
        variant: S,
        mod: v,
        size: g,
        ...y
      } = n,
      b = de({
        name: ["Text", c],
        props: n,
        classes: Gv,
        className: f,
        style: d,
        classNames: m,
        styles: p,
        unstyled: h,
        vars: u,
        varsResolver: Bk,
      });
    return x.jsx(Z, {
      ...b("root", { focusable: !0 }),
      ref: t,
      component: a ? "span" : "p",
      variant: S,
      mod: [
        {
          "data-truncate": zk(o),
          "data-line-clamp": typeof r == "number",
          "data-inline": s,
          "data-inherit": i,
        },
        v,
      ],
      size: g,
      ...y,
    });
  });
Zr.classes = Gv;
Zr.displayName = "@mantine/core/Text";
function Xv(e) {
  return typeof e == "string"
    ? { value: e, label: e }
    : "value" in e && !("label" in e)
    ? { value: e.value, label: e.value, disabled: e.disabled }
    : typeof e == "number"
    ? { value: e.toString(), label: e.toString() }
    : "group" in e
    ? { group: e.group, items: e.items.map((t) => Xv(t)) }
    : e;
}
function Vk(e) {
  return e ? e.map((t) => Xv(t)) : [];
}
function qv(e) {
  return e.reduce(
    (t, n) => ("group" in n ? { ...t, ...qv(n.items) } : ((t[n.value] = n), t)),
    {}
  );
}
var mt = {
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
const Hk = { error: null },
  Uk = (e, { size: t }) => ({
    chevron: { "--combobox-chevron-size": ze(t, "combobox-chevron-size") },
  }),
  ld = Q((e, t) => {
    const n = W("ComboboxChevron", Hk, e),
      {
        size: r,
        error: o,
        style: s,
        className: i,
        classNames: l,
        styles: a,
        unstyled: c,
        vars: u,
        mod: f,
        ...d
      } = n,
      m = de({
        name: "ComboboxChevron",
        classes: mt,
        props: n,
        style: s,
        className: i,
        classNames: l,
        styles: a,
        unstyled: c,
        vars: u,
        varsResolver: Uk,
        rootSelector: "chevron",
      });
    return x.jsx(Z, {
      component: "svg",
      ...d,
      ...m("chevron"),
      size: r,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      mod: ["combobox-chevron", { error: o }, f],
      ref: t,
      children: x.jsx("path", {
        d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    });
  });
ld.classes = mt;
ld.displayName = "@mantine/core/ComboboxChevron";
const [Wk, jt] = Or("Combobox component was not found in tree"),
  Qv = w.forwardRef(
    ({ size: e, onMouseDown: t, onClick: n, onClear: r, ...o }, s) =>
      x.jsx(Eo, {
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
Qv.displayName = "@mantine/core/ComboboxClearButton";
const Yk = {},
  ad = Q((e, t) => {
    const {
        classNames: n,
        styles: r,
        className: o,
        style: s,
        hidden: i,
        ...l
      } = W("ComboboxDropdown", Yk, e),
      a = jt();
    return x.jsx(sr.Dropdown, {
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
ad.classes = mt;
ad.displayName = "@mantine/core/ComboboxDropdown";
const Kk = { refProp: "ref" },
  Jv = Q((e, t) => {
    const { children: n, refProp: r } = W("ComboboxDropdownTarget", Kk, e);
    if ((jt(), !Po(n)))
      throw new Error(
        "Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    return x.jsx(sr.Target, { ref: t, refProp: r, children: n });
  });
Jv.displayName = "@mantine/core/ComboboxDropdownTarget";
const Gk = {},
  cd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxEmpty", Gk, e),
      a = jt();
    return x.jsx(Z, {
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
cd.classes = mt;
cd.displayName = "@mantine/core/ComboboxEmpty";
function ud({
  onKeyDown: e,
  withKeyboardNavigation: t,
  withAriaAttributes: n,
  withExpandedAttribute: r,
  targetType: o,
  autoComplete: s,
}) {
  const i = jt(),
    [l, a] = w.useState(null),
    c = (f) => {
      if ((e == null || e(f), !i.readOnly && t)) {
        if (f.nativeEvent.isComposing) return;
        if (
          (f.nativeEvent.code === "ArrowDown" &&
            (f.preventDefault(),
            i.store.dropdownOpened
              ? a(i.store.selectNextOption())
              : (i.store.openDropdown("keyboard"),
                a(i.store.selectActiveOption()))),
          f.nativeEvent.code === "ArrowUp" &&
            (f.preventDefault(),
            i.store.dropdownOpened
              ? a(i.store.selectPreviousOption())
              : (i.store.openDropdown("keyboard"),
                a(i.store.selectActiveOption()))),
          f.nativeEvent.code === "Enter" ||
            f.nativeEvent.code === "NumpadEnter")
        ) {
          if (f.nativeEvent.keyCode === 229) return;
          const d = i.store.getSelectedOptionIndex();
          i.store.dropdownOpened && d !== -1
            ? (f.preventDefault(), i.store.clickSelectedOption())
            : o === "button" &&
              (f.preventDefault(), i.store.openDropdown("keyboard"));
        }
        f.nativeEvent.code === "Escape" && i.store.closeDropdown("keyboard"),
          f.nativeEvent.code === "Space" &&
            o === "button" &&
            (f.preventDefault(), i.store.toggleDropdown("keyboard"));
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
const Xk = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  Zv = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxEventsTarget", Xk, e);
    if (!Po(n))
      throw new Error(
        "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = jt(),
      f = ud({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      });
    return w.cloneElement(n, {
      ...f,
      ...c,
      [r]: Nt(t, u.store.targetRef, n == null ? void 0 : n.ref),
    });
  });
Zv.displayName = "@mantine/core/ComboboxEventsTarget";
const qk = {},
  fd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxFooter", qk, e),
      a = jt();
    return x.jsx(Z, {
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
fd.classes = mt;
fd.displayName = "@mantine/core/ComboboxFooter";
const Qk = {},
  dd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        children: l,
        label: a,
        ...c
      } = W("ComboboxGroup", Qk, e),
      u = jt();
    return x.jsxs(Z, {
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
dd.classes = mt;
dd.displayName = "@mantine/core/ComboboxGroup";
const Jk = {},
  pd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxHeader", Jk, e),
      a = jt();
    return x.jsx(Z, {
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
pd.classes = mt;
pd.displayName = "@mantine/core/ComboboxHeader";
function e0({ value: e, valuesDivider: t = ",", ...n }) {
  return x.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e || "",
    ...n,
  });
}
e0.displayName = "@mantine/core/ComboboxHiddenInput";
const Zk = {},
  md = Q((e, t) => {
    const n = W("ComboboxOption", Zk, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        vars: l,
        onClick: a,
        id: c,
        active: u,
        onMouseDown: f,
        onMouseOver: d,
        disabled: m,
        selected: p,
        mod: h,
        ...S
      } = n,
      v = jt(),
      g = w.useId(),
      y = c || g;
    return x.jsx(Z, {
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
        b.preventDefault(), f == null || f(b);
      },
      onMouseOver: (b) => {
        v.resetSelectionOnOptionHover && v.store.resetSelectedOption(),
          d == null || d(b);
      },
    });
  });
md.classes = mt;
md.displayName = "@mantine/core/ComboboxOption";
const e_ = {},
  hd = Q((e, t) => {
    const n = W("ComboboxOptions", e_, e),
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
      f = jt(),
      d = zs(l);
    return (
      w.useEffect(() => {
        f.store.setListId(d);
      }, [d]),
      x.jsx(Z, {
        ref: t,
        ...f.getStyles("options", {
          className: o,
          style: s,
          classNames: r,
          styles: i,
        }),
        ...u,
        id: d,
        role: "listbox",
        "aria-labelledby": c,
        onMouseDown: (m) => {
          m.preventDefault(), a == null || a(m);
        },
      })
    );
  });
hd.classes = mt;
hd.displayName = "@mantine/core/ComboboxOptions";
const t_ = { withAriaAttributes: !0, withKeyboardNavigation: !0 },
  gd = Q((e, t) => {
    const n = W("ComboboxSearch", t_, e),
      {
        classNames: r,
        styles: o,
        unstyled: s,
        vars: i,
        withAriaAttributes: l,
        onKeyDown: a,
        withKeyboardNavigation: c,
        size: u,
        ...f
      } = n,
      d = jt(),
      m = d.getStyles("search"),
      p = ud({
        targetType: "input",
        withAriaAttributes: l,
        withKeyboardNavigation: c,
        withExpandedAttribute: !1,
        onKeyDown: a,
        autoComplete: "off",
      });
    return x.jsx(Ot, {
      ref: Nt(t, d.store.searchRef),
      classNames: [{ input: m.className }, r],
      styles: [{ input: m.style }, o],
      size: u || d.size,
      ...p,
      ...f,
      __staticSelector: "Combobox",
    });
  });
gd.classes = mt;
gd.displayName = "@mantine/core/ComboboxSearch";
const n_ = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  t0 = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxTarget", n_, e);
    if (!Po(n))
      throw new Error(
        "Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = jt(),
      f = ud({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      }),
      d = w.cloneElement(n, { ...f, ...c });
    return x.jsx(sr.Target, { ref: Nt(t, u.store.targetRef), children: d });
  });
t0.displayName = "@mantine/core/ComboboxTarget";
function r_(e, t, n) {
  for (let r = e - 1; r >= 0; r -= 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = t.length - 1; r > -1; r -= 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function o_(e, t, n) {
  for (let r = e + 1; r < t.length; r += 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = 0; r < t.length; r += 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function s_(e) {
  for (let t = 0; t < e.length; t += 1)
    if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function n0({
  defaultOpened: e,
  opened: t,
  onOpenedChange: n,
  onDropdownClose: r,
  onDropdownOpen: o,
  loop: s = !0,
  scrollBehavior: i = "instant",
} = {}) {
  const [l, a] = So({ value: t, defaultValue: e, finalValue: !1, onChange: n }),
    c = w.useRef(null),
    u = w.useRef(-1),
    f = w.useRef(null),
    d = w.useRef(null),
    m = w.useRef(-1),
    p = w.useRef(-1),
    h = w.useRef(-1),
    S = w.useCallback(
      (P = "unknown") => {
        l || (a(!0), o == null || o(P));
      },
      [a, o, l]
    ),
    v = w.useCallback(
      (P = "unknown") => {
        l && (a(!1), r == null || r(P));
      },
      [a, r, l]
    ),
    g = w.useCallback(
      (P = "unknown") => {
        l ? v(P) : S(P);
      },
      [v, S, l]
    ),
    y = w.useCallback(() => {
      const P = document.querySelector(
        `#${c.current} [data-combobox-selected]`
      );
      P == null || P.removeAttribute("data-combobox-selected"),
        P == null || P.removeAttribute("aria-selected");
    }, []),
    b = w.useCallback(
      (P) => {
        const O = document.getElementById(c.current),
          _ = O == null ? void 0 : O.querySelectorAll("[data-combobox-option]");
        if (!_) return null;
        const k = P >= _.length ? 0 : P < 0 ? _.length - 1 : P;
        return (
          (u.current = k),
          _ != null && _[k] && !_[k].hasAttribute("data-combobox-disabled")
            ? (y(),
              _[k].setAttribute("data-combobox-selected", "true"),
              _[k].setAttribute("aria-selected", "true"),
              _[k].scrollIntoView({ block: "nearest", behavior: i }),
              _[k].id)
            : null
        );
      },
      [i, y]
    ),
    C = w.useCallback(() => {
      const P = document.querySelector(`#${c.current} [data-combobox-active]`);
      if (P) {
        const O = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          _ = Array.from(O).findIndex((k) => k === P);
        return b(_);
      }
      return b(0);
    }, [b]),
    E = w.useCallback(
      () =>
        b(
          o_(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    R = w.useCallback(
      () =>
        b(
          r_(
            u.current,
            document.querySelectorAll(`#${c.current} [data-combobox-option]`),
            s
          )
        ),
      [b, s]
    ),
    D = w.useCallback(
      () =>
        b(
          s_(document.querySelectorAll(`#${c.current} [data-combobox-option]`))
        ),
      [b]
    ),
    j = w.useCallback((P = "selected", O) => {
      h.current = window.setTimeout(() => {
        var $;
        const _ = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          k = Array.from(_).findIndex((N) =>
            N.hasAttribute(`data-combobox-${P}`)
          );
        (u.current = k),
          O != null &&
            O.scrollIntoView &&
            (($ = _[k]) == null ||
              $.scrollIntoView({ block: "nearest", behavior: i }));
      }, 0);
    }, []),
    T = w.useCallback(() => {
      (u.current = -1), y();
    }, [y]),
    M = w.useCallback(() => {
      const P = document.querySelectorAll(
          `#${c.current} [data-combobox-option]`
        ),
        O = P == null ? void 0 : P[u.current];
      O == null || O.click();
    }, []),
    B = w.useCallback((P) => {
      c.current = P;
    }, []),
    H = w.useCallback(() => {
      m.current = window.setTimeout(() => f.current.focus(), 0);
    }, []),
    F = w.useCallback(() => {
      p.current = window.setTimeout(() => d.current.focus(), 0);
    }, []),
    L = w.useCallback(() => u.current, []);
  return (
    w.useEffect(
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
      toggleDropdown: g,
      selectedOptionIndex: u.current,
      getSelectedOptionIndex: L,
      selectOption: b,
      selectFirstOption: D,
      selectActiveOption: C,
      selectNextOption: E,
      selectPreviousOption: R,
      resetSelectedOption: T,
      updateSelectedOptionIndex: j,
      listId: c.current,
      setListId: B,
      clickSelectedOption: M,
      searchRef: f,
      focusSearchInput: H,
      targetRef: d,
      focusTarget: F,
    }
  );
}
const i_ = {
    keepMounted: !0,
    withinPortal: !0,
    resetSelectionOnOptionHover: !1,
    width: "target",
    transitionProps: { transition: "fade", duration: 0 },
  },
  l_ = (e, { size: t, dropdownPadding: n }) => ({
    options: {
      "--combobox-option-fz": tt(t),
      "--combobox-option-padding": ze(t, "combobox-option-padding"),
    },
    dropdown: {
      "--combobox-padding": n === void 0 ? void 0 : z(n),
      "--combobox-option-fz": tt(t),
      "--combobox-option-padding": ze(t, "combobox-option-padding"),
    },
  });
function he(e) {
  const t = W("Combobox", i_, e),
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
      dropdownPadding: f,
      resetSelectionOnOptionHover: d,
      __staticSelector: m,
      readOnly: p,
      ...h
    } = t,
    S = n0(),
    v = i || S,
    g = de({
      name: m || "Combobox",
      classes: mt,
      props: t,
      classNames: n,
      styles: r,
      unstyled: o,
      vars: l,
      varsResolver: l_,
    }),
    y = () => {
      c == null || c(), v.closeDropdown();
    };
  return x.jsx(Wk, {
    value: {
      getStyles: g,
      store: v,
      onOptionSubmit: a,
      size: u,
      resetSelectionOnOptionHover: d,
      readOnly: p,
    },
    children: x.jsx(sr, {
      opened: v.dropdownOpened,
      ...h,
      onClose: y,
      withRoles: !1,
      unstyled: o,
      children: s,
    }),
  });
}
const a_ = (e) => e;
he.extend = a_;
he.classes = mt;
he.displayName = "@mantine/core/Combobox";
he.Target = t0;
he.Dropdown = ad;
he.Options = hd;
he.Option = md;
he.Search = gd;
he.Empty = cd;
he.Chevron = ld;
he.Footer = fd;
he.Header = pd;
he.EventsTarget = Zv;
he.DropdownTarget = Jv;
he.Group = dd;
he.ClearButton = Qv;
he.HiddenInput = e0;
function c_({ size: e, style: t, ...n }) {
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
function Ts(e) {
  return "group" in e;
}
function r0({ options: e, search: t, limit: n }) {
  const r = t.trim().toLowerCase(),
    o = [];
  for (let s = 0; s < e.length; s += 1) {
    const i = e[s];
    if (o.length === n) return o;
    Ts(i) &&
      o.push({
        group: i.group,
        items: r0({ options: i.items, search: t, limit: n - o.length }),
      }),
      Ts(i) || (i.label.toLowerCase().includes(r) && o.push(i));
  }
  return o;
}
function u_(e) {
  if (e.length === 0) return !0;
  for (const t of e) if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function o0(e, t = new Set()) {
  if (Array.isArray(e))
    for (const n of e)
      if (Ts(n)) o0(n.items, t);
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
function f_(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function s0({
  data: e,
  withCheckIcon: t,
  value: n,
  checkIconPosition: r,
  unstyled: o,
  renderOption: s,
}) {
  if (!Ts(e)) {
    const l = f_(n, e.value),
      a = t && l && x.jsx(c_, { className: mt.optionsDropdownCheckIcon }),
      c = x.jsxs(x.Fragment, {
        children: [
          r === "left" && a,
          x.jsx("span", { children: e.label }),
          r === "right" && a,
        ],
      });
    return x.jsx(he.Option, {
      value: e.value,
      disabled: e.disabled,
      className: nt({ [mt.optionsDropdownOption]: !o }),
      "data-reverse": r === "right" || void 0,
      "data-checked": l || void 0,
      "aria-selected": l,
      active: l,
      children: typeof s == "function" ? s({ option: e, checked: l }) : c,
    });
  }
  const i = e.items.map((l) =>
    x.jsx(
      s0,
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
  return x.jsx(he.Group, { label: e.group, children: i });
}
function d_({
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
  checkIconPosition: f,
  nothingFoundMessage: d,
  unstyled: m,
  labelId: p,
  renderOption: h,
  scrollAreaProps: S,
  "aria-label": v,
}) {
  o0(e);
  const y =
      typeof o == "string"
        ? (r || r0)({ options: e, search: a ? o : "", limit: s ?? 1 / 0 })
        : e,
    b = u_(y),
    C = y.map((E) =>
      x.jsx(
        s0,
        {
          data: E,
          withCheckIcon: c,
          value: u,
          checkIconPosition: f,
          unstyled: m,
          renderOption: h,
        },
        Ts(E) ? E.group : E.value
      )
    );
  return x.jsx(he.Dropdown, {
    hidden: t || (n && b),
    children: x.jsxs(he.Options, {
      labelledBy: p,
      "aria-label": v,
      children: [
        l
          ? x.jsx(Vs.Autosize, {
              mah: i ?? 220,
              type: "scroll",
              scrollbarSize: "var(--combobox-padding)",
              offsetScrollbars: "y",
              ...S,
              children: C,
            })
          : C,
        b && d && x.jsx(he.Empty, { children: d }),
      ],
    }),
  });
}
var ta = {
  root: "m_77c9d27d",
  inner: "m_80f1301b",
  label: "m_811560b9",
  section: "m_a74036a",
  loader: "m_a25b86ee",
  group: "m_80d6d844",
};
const Om = { orientation: "horizontal" },
  p_ = (e, { borderWidth: t }) => ({
    group: { "--button-border-width": z(t) },
  }),
  yd = Q((e, t) => {
    const n = W("ButtonGroup", Om, e),
      {
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        orientation: a,
        vars: c,
        borderWidth: u,
        variant: f,
        mod: d,
        ...m
      } = W("ButtonGroup", Om, e),
      p = de({
        name: "ButtonGroup",
        props: n,
        classes: ta,
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: p_,
        rootSelector: "group",
      });
    return x.jsx(Z, {
      ...p("group"),
      ref: t,
      variant: f,
      mod: [{ "data-orientation": a }, d],
      role: "group",
      ...m,
    });
  });
yd.classes = ta;
yd.displayName = "@mantine/core/ButtonGroup";
const m_ = {
    in: { opacity: 1, transform: `translate(-50%, calc(-50% + ${z(1)}))` },
    out: { opacity: 0, transform: "translate(-50%, -200%)" },
    common: { transformOrigin: "center" },
    transitionProperty: "transform, opacity",
  },
  h_ = {},
  g_ = (
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
        "--button-height": ze(s, "button-height"),
        "--button-padding-x": ze(s, "button-padding-x"),
        "--button-fz":
          s != null && s.includes("compact")
            ? tt(s.replace("compact-", ""))
            : tt(s),
        "--button-radius": t === void 0 ? void 0 : or(t),
        "--button-bg": n || o ? a.background : void 0,
        "--button-hover": n || o ? a.hover : void 0,
        "--button-color": a.color,
        "--button-bd": n || o ? a.border : void 0,
        "--button-hover-color": n || o ? a.hoverColor : void 0,
      },
    };
  },
  nn = _n((e, t) => {
    const n = W("Button", h_, e),
      {
        style: r,
        vars: o,
        className: s,
        color: i,
        disabled: l,
        children: a,
        leftSection: c,
        rightSection: u,
        fullWidth: f,
        variant: d,
        radius: m,
        loading: p,
        loaderProps: h,
        gradient: S,
        classNames: v,
        styles: g,
        unstyled: y,
        "data-disabled": b,
        autoContrast: C,
        mod: E,
        ...R
      } = n,
      D = de({
        name: "Button",
        props: n,
        classes: ta,
        className: s,
        style: r,
        classNames: v,
        styles: g,
        unstyled: y,
        vars: o,
        varsResolver: g_,
      }),
      j = !!c,
      T = !!u;
    return x.jsxs(vn, {
      ref: t,
      ...D("root", { active: !l && !p && !b }),
      unstyled: y,
      variant: d,
      disabled: l || p,
      mod: [
        {
          disabled: l || b,
          loading: p,
          block: f,
          "with-left-section": j,
          "with-right-section": T,
        },
        E,
      ],
      ...R,
      children: [
        x.jsx(No, {
          mounted: !!p,
          transition: m_,
          duration: 150,
          children: (M) =>
            x.jsx(Z, {
              component: "span",
              ...D("loader", { style: M }),
              "aria-hidden": !0,
              children: x.jsx(Us, {
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
              x.jsx(Z, {
                component: "span",
                ...D("section"),
                mod: { position: "left" },
                children: c,
              }),
            x.jsx(Z, {
              component: "span",
              mod: { loading: p },
              ...D("label"),
              children: a,
            }),
            u &&
              x.jsx(Z, {
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
nn.classes = ta;
nn.displayName = "@mantine/core/Button";
nn.Group = yd;
var i0 = { root: "m_4451eb3a" };
const y_ = {},
  vd = _n((e, t) => {
    const n = W("Center", y_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        inline: c,
        mod: u,
        ...f
      } = n,
      d = de({
        name: "Center",
        props: n,
        classes: i0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
      });
    return x.jsx(Z, { ref: t, mod: [{ inline: c }, u], ...d("root"), ...f });
  });
vd.classes = i0;
vd.displayName = "@mantine/core/Center";
function xu() {
  return (
    (xu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    xu.apply(this, arguments)
  );
}
function v_(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) >= 0) continue;
      n[r] = e[r];
    }
  return n;
}
var w_ = w.useLayoutEffect,
  S_ = function (t) {
    var n = w.useRef(t);
    return (
      w_(function () {
        n.current = t;
      }),
      n
    );
  },
  Nm = function (t, n) {
    if (typeof t == "function") {
      t(n);
      return;
    }
    t.current = n;
  },
  x_ = function (t, n) {
    var r = w.useRef();
    return w.useCallback(
      function (o) {
        (t.current = o),
          r.current && Nm(r.current, null),
          (r.current = n),
          n && Nm(n, o);
      },
      [n]
    );
  },
  $m = {
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
  b_ = function (t) {
    Object.keys($m).forEach(function (n) {
      t.style.setProperty(n, $m[n], "important");
    });
  },
  Lm = b_,
  Qe = null,
  jm = function (t, n) {
    var r = t.scrollHeight;
    return n.sizingStyle.boxSizing === "border-box"
      ? r + n.borderSize
      : r - n.paddingSize;
  };
function C_(e, t, n, r) {
  n === void 0 && (n = 1),
    r === void 0 && (r = 1 / 0),
    Qe ||
      ((Qe = document.createElement("textarea")),
      Qe.setAttribute("tabindex", "-1"),
      Qe.setAttribute("aria-hidden", "true"),
      Lm(Qe)),
    Qe.parentNode === null && document.body.appendChild(Qe);
  var o = e.paddingSize,
    s = e.borderSize,
    i = e.sizingStyle,
    l = i.boxSizing;
  Object.keys(i).forEach(function (d) {
    var m = d;
    Qe.style[m] = i[m];
  }),
    Lm(Qe),
    (Qe.value = t);
  var a = jm(Qe, e);
  (Qe.value = t), (a = jm(Qe, e)), (Qe.value = "x");
  var c = Qe.scrollHeight - o,
    u = c * n;
  l === "border-box" && (u = u + o + s), (a = Math.max(u, a));
  var f = c * r;
  return l === "border-box" && (f = f + o + s), (a = Math.min(f, a)), [a, c];
}
var Am = function () {},
  E_ = function (t, n) {
    return t.reduce(function (r, o) {
      return (r[o] = n[o]), r;
    }, {});
  },
  k_ = [
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
  __ = !!document.documentElement.currentStyle,
  R_ = function (t) {
    var n = window.getComputedStyle(t);
    if (n === null) return null;
    var r = E_(k_, n),
      o = r.boxSizing;
    if (o === "") return null;
    __ &&
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
  D_ = R_;
function l0(e, t, n) {
  var r = S_(n);
  w.useLayoutEffect(function () {
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
var P_ = function (t) {
    l0(window, "resize", t);
  },
  T_ = function (t) {
    l0(document.fonts, "loadingdone", t);
  },
  O_ = [
    "cacheMeasurements",
    "maxRows",
    "minRows",
    "onChange",
    "onHeightChange",
  ],
  N_ = function (t, n) {
    var r = t.cacheMeasurements,
      o = t.maxRows,
      s = t.minRows,
      i = t.onChange,
      l = i === void 0 ? Am : i,
      a = t.onHeightChange,
      c = a === void 0 ? Am : a,
      u = v_(t, O_),
      f = u.value !== void 0,
      d = w.useRef(null),
      m = x_(d, n),
      p = w.useRef(0),
      h = w.useRef(),
      S = function () {
        var y = d.current,
          b = r && h.current ? h.current : D_(y);
        if (b) {
          h.current = b;
          var C = C_(b, y.value || y.placeholder || "x", s, o),
            E = C[0],
            R = C[1];
          p.current !== E &&
            ((p.current = E),
            y.style.setProperty("height", E + "px", "important"),
            c(E, { rowHeight: R }));
        }
      },
      v = function (y) {
        f || S(), l(y);
      };
    return (
      w.useLayoutEffect(S),
      P_(S),
      T_(S),
      w.createElement("textarea", xu({}, u, { onChange: v, ref: m }))
    );
  },
  $_ = w.forwardRef(N_);
const L_ = {},
  wd = Q((e, t) => {
    const {
        autosize: n,
        maxRows: r,
        minRows: o,
        __staticSelector: s,
        resize: i,
        ...l
      } = W("Textarea", L_, e),
      a = n && ub() !== "test",
      c = a ? { maxRows: r, minRows: o } : {};
    return x.jsx(ir, {
      component: a ? $_ : "textarea",
      ref: t,
      ...l,
      __staticSelector: s || "Textarea",
      multiline: !0,
      "data-no-overflow": (n && r === void 0) || void 0,
      __vars: { "--input-resize": i },
      ...c,
    });
  });
wd.classes = ir.classes;
wd.displayName = "@mantine/core/Textarea";
var a0 = { root: "m_6e45937b", loader: "m_e8eb006c", overlay: "m_df587f17" };
const Fm = {
    transitionProps: { transition: "fade", duration: 0 },
    overlayProps: { backgroundOpacity: 0.75 },
    zIndex: Nr("overlay"),
  },
  j_ = (e, { zIndex: t }) => ({
    root: { "--lo-z-index": t == null ? void 0 : t.toString() },
  }),
  Sd = Q((e, t) => {
    const n = W("LoadingOverlay", Fm, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        transitionProps: c,
        loaderProps: u,
        overlayProps: f,
        visible: d,
        zIndex: m,
        ...p
      } = n,
      h = kn(),
      S = de({
        name: "LoadingOverlay",
        classes: a0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: j_,
      }),
      v = { ...Fm.overlayProps, ...f };
    return x.jsx(No, {
      transition: "fade",
      ...c,
      mounted: !!d,
      children: (g) =>
        x.jsxs(Z, {
          ...S("root", { style: g }),
          ref: t,
          ...p,
          children: [
            x.jsx(Us, { ...S("loader"), unstyled: l, ...u }),
            x.jsx(Ps, {
              ...v,
              ...S("overlay"),
              darkHidden: !0,
              unstyled: l,
              color: (f == null ? void 0 : f.color) || h.white,
            }),
            x.jsx(Ps, {
              ...v,
              ...S("overlay"),
              lightHidden: !0,
              unstyled: l,
              color: (f == null ? void 0 : f.color) || h.colors.dark[5],
            }),
          ],
        }),
    });
  });
Sd.classes = a0;
Sd.displayName = "@mantine/core/LoadingOverlay";
const [A_, $o] = Or("Modal component was not found in tree");
var Pn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd",
};
const F_ = {},
  na = Q((e, t) => {
    const n = W("ModalBody", F_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return x.jsx(Hv, {
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
na.classes = Pn;
na.displayName = "@mantine/core/ModalBody";
const M_ = {},
  ra = Q((e, t) => {
    const n = W("ModalCloseButton", M_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return x.jsx(Uv, {
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
ra.classes = Pn;
ra.displayName = "@mantine/core/ModalCloseButton";
const z_ = {},
  oa = Q((e, t) => {
    const n = W("ModalContent", z_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        vars: l,
        children: a,
        ...c
      } = n,
      u = $o(),
      f = u.scrollAreaComponent || _k;
    return x.jsx(bk, {
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
      children: x.jsx(f, {
        style: {
          maxHeight: u.fullScreen
            ? "100dvh"
            : `calc(100dvh - (${z(u.yOffset)} * 2))`,
        },
        children: a,
      }),
    });
  });
oa.classes = Pn;
oa.displayName = "@mantine/core/ModalContent";
const I_ = {},
  sa = Q((e, t) => {
    const n = W("ModalHeader", I_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return x.jsx(Wv, {
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
sa.classes = Pn;
sa.displayName = "@mantine/core/ModalHeader";
const B_ = {},
  ia = Q((e, t) => {
    const n = W("ModalOverlay", B_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return x.jsx(Yv, {
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
ia.classes = Pn;
ia.displayName = "@mantine/core/ModalOverlay";
const V_ = {
    __staticSelector: "Modal",
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: Nr("modal"),
    transitionProps: { duration: 200, transition: "pop" },
    yOffset: "5dvh",
  },
  H_ = (e, { radius: t, size: n, yOffset: r, xOffset: o }) => ({
    root: {
      "--modal-radius": t === void 0 ? void 0 : or(t),
      "--modal-size": ze(n, "modal-size"),
      "--modal-y-offset": z(r),
      "--modal-x-offset": z(o),
    },
  }),
  la = Q((e, t) => {
    const n = W("ModalRoot", V_, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        yOffset: c,
        scrollAreaComponent: u,
        radius: f,
        fullScreen: d,
        centered: m,
        xOffset: p,
        __staticSelector: h,
        ...S
      } = n,
      v = de({
        name: h,
        classes: Pn,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: H_,
      });
    return x.jsx(A_, {
      value: {
        yOffset: c,
        scrollAreaComponent: u,
        getStyles: v,
        fullScreen: d,
      },
      children: x.jsx(Sk, {
        ref: t,
        ...v("root"),
        "data-full-screen": d || void 0,
        "data-centered": m || void 0,
        unstyled: l,
        ...S,
      }),
    });
  });
la.classes = Pn;
la.displayName = "@mantine/core/ModalRoot";
const U_ = {},
  aa = Q((e, t) => {
    const n = W("ModalTitle", U_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return x.jsx(Kv, {
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
aa.classes = Pn;
aa.displayName = "@mantine/core/ModalTitle";
const W_ = {
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: Nr("modal"),
    transitionProps: { duration: 200, transition: "fade-down" },
    withOverlay: !0,
    withCloseButton: !0,
  },
  un = Q((e, t) => {
    const {
        title: n,
        withOverlay: r,
        overlayProps: o,
        withCloseButton: s,
        closeButtonProps: i,
        children: l,
        radius: a,
        ...c
      } = W("Modal", W_, e),
      u = !!n || s;
    return x.jsxs(la, {
      ref: t,
      radius: a,
      ...c,
      children: [
        r && x.jsx(ia, { ...o }),
        x.jsxs(oa, {
          radius: a,
          children: [
            u &&
              x.jsxs(sa, {
                children: [
                  n && x.jsx(aa, { children: n }),
                  s && x.jsx(ra, { ...i }),
                ],
              }),
            x.jsx(na, { children: l }),
          ],
        }),
      ],
    });
  });
un.classes = Pn;
un.displayName = "@mantine/core/Modal";
un.Root = la;
un.Overlay = ia;
un.Content = oa;
un.Body = na;
un.Header = sa;
un.Title = aa;
un.CloseButton = ra;
const Y_ = {
    searchable: !1,
    withCheckIcon: !0,
    allowDeselect: !0,
    checkIconPosition: "left",
  },
  xd = Q((e, t) => {
    const n = W("Select", Y_, e),
      {
        classNames: r,
        styles: o,
        unstyled: s,
        vars: i,
        dropdownOpened: l,
        defaultDropdownOpened: a,
        onDropdownClose: c,
        onDropdownOpen: u,
        onFocus: f,
        onBlur: d,
        onClick: m,
        onChange: p,
        data: h,
        value: S,
        defaultValue: v,
        selectFirstOptionOnChange: g,
        onOptionSubmit: y,
        comboboxProps: b,
        readOnly: C,
        disabled: E,
        filter: R,
        limit: D,
        withScrollArea: j,
        maxDropdownHeight: T,
        size: M,
        searchable: B,
        rightSection: H,
        checkIconPosition: F,
        withCheckIcon: L,
        nothingFoundMessage: P,
        name: O,
        form: _,
        searchValue: k,
        defaultSearchValue: $,
        onSearchChange: N,
        allowDeselect: I,
        error: Y,
        rightSectionPointerEvents: X,
        id: ee,
        clearable: ne,
        clearButtonProps: te,
        hiddenInputProps: me,
        renderOption: oe,
        onClear: le,
        autoComplete: q,
        scrollAreaProps: ye,
        ...ce
      } = n,
      se = w.useMemo(() => Vk(h), [h]),
      Oe = w.useMemo(() => qv(se), [se]),
      qe = zs(ee),
      [xe, gt, At] = So({
        value: S,
        defaultValue: v,
        finalValue: null,
        onChange: p,
      }),
      Ie = typeof xe == "string" ? Oe[xe] : void 0,
      [U, re] = So({
        value: k,
        defaultValue: $,
        finalValue: Ie ? Ie.label : "",
        onChange: N,
      }),
      ae = n0({
        opened: l,
        defaultOpened: a,
        onDropdownOpen: () => {
          u == null || u(),
            ae.updateSelectedOptionIndex("active", { scrollIntoView: !0 });
        },
        onDropdownClose: () => {
          c == null || c(), ae.resetSelectedOption();
        },
      }),
      { resolvedClassNames: ke, resolvedStyles: je } = Bs({
        props: n,
        styles: o,
        classNames: r,
      });
    w.useEffect(() => {
      g && ae.selectFirstOption();
    }, [g, xe]),
      w.useEffect(() => {
        S === null && re(""), typeof S == "string" && Ie && re(Ie.label);
      }, [S, Ie]);
    const Qt =
      ne &&
      !!xe &&
      !E &&
      !C &&
      x.jsx(he.ClearButton, {
        size: M,
        ...te,
        onClear: () => {
          gt(null, null), re(""), le == null || le();
        },
      });
    return x.jsxs(x.Fragment, {
      children: [
        x.jsxs(he, {
          store: ae,
          __staticSelector: "Select",
          classNames: ke,
          styles: je,
          unstyled: s,
          readOnly: C,
          onOptionSubmit: (_e) => {
            y == null || y(_e);
            const Ae = I && Oe[_e].value === xe ? null : Oe[_e],
              Tn = Ae ? Ae.value : null;
            gt(Tn, Ae),
              !At &&
                re(
                  (typeof Tn == "string" && (Ae == null ? void 0 : Ae.label)) ||
                    ""
                ),
              ae.closeDropdown();
          },
          size: M,
          ...b,
          children: [
            x.jsx(he.Target, {
              targetType: B ? "input" : "button",
              autoComplete: q,
              children: x.jsx(ir, {
                id: qe,
                ref: t,
                rightSection:
                  H ||
                  Qt ||
                  x.jsx(he.Chevron, { size: M, error: Y, unstyled: s }),
                rightSectionPointerEvents: X || (Qt ? "all" : "none"),
                ...ce,
                size: M,
                __staticSelector: "Select",
                disabled: E,
                readOnly: C || !B,
                value: U,
                onChange: (_e) => {
                  re(_e.currentTarget.value),
                    ae.openDropdown(),
                    g && ae.selectFirstOption();
                },
                onFocus: (_e) => {
                  B && ae.openDropdown(), f == null || f(_e);
                },
                onBlur: (_e) => {
                  var Ae;
                  B && ae.closeDropdown(),
                    re(
                      (xe != null &&
                        ((Ae = Oe[xe]) == null ? void 0 : Ae.label)) ||
                        ""
                    ),
                    d == null || d(_e);
                },
                onClick: (_e) => {
                  B ? ae.openDropdown() : ae.toggleDropdown(),
                    m == null || m(_e);
                },
                classNames: ke,
                styles: je,
                unstyled: s,
                pointer: !B,
                error: Y,
              }),
            }),
            x.jsx(d_, {
              data: se,
              hidden: C || E,
              filter: R,
              search: U,
              limit: D,
              hiddenWhenEmpty: !B || !P,
              withScrollArea: j,
              maxDropdownHeight: T,
              filterOptions: B && (Ie == null ? void 0 : Ie.label) !== U,
              value: xe,
              checkIconPosition: F,
              withCheckIcon: L,
              nothingFoundMessage: P,
              unstyled: s,
              labelId: ce.label ? `${qe}-label` : void 0,
              "aria-label": ce.label ? void 0 : ce["aria-label"],
              renderOption: oe,
              scrollAreaProps: ye,
            }),
          ],
        }),
        x.jsx(he.HiddenInput, {
          value: xe,
          name: O,
          form: _,
          disabled: E,
          ...me,
        }),
      ],
    });
  });
xd.classes = { ...ir.classes, ...he.classes };
xd.displayName = "@mantine/core/Select";
const K_ = {},
  bd = Q((e, t) => {
    const n = W("TextInput", K_, e);
    return x.jsx(ir, {
      component: "input",
      ref: t,
      ...n,
      __staticSelector: "TextInput",
    });
  });
bd.classes = ir.classes;
bd.displayName = "@mantine/core/TextInput";
function G_(e) {
  return function ({ isLoading: n, ...r }) {
    return n ? x.jsx("div", { children: "Loading..." }) : x.jsx(e, { ...r });
  };
}
function X_(e) {
  return function ({ error: n, ...r }) {
    return n
      ? x.jsxs("div", { children: ["Error: ", n.message] })
      : x.jsx(e, { ...r });
  };
}
var c0 = { exports: {} },
  q_ = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",
  Q_ = q_,
  J_ = Q_;
function u0() {}
function f0() {}
f0.resetWarningCache = u0;
var Z_ = function () {
  function e(r, o, s, i, l, a) {
    if (a !== J_) {
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
    checkPropTypes: f0,
    resetWarningCache: u0,
  };
  return (n.PropTypes = n), n;
};
c0.exports = Z_();
var eR = c0.exports;
const J = Dr(eR);
function tR(e) {
  if (!/^[0-9a-zA-Z-]+$/.test(e))
    throw new Error(
      `[@mantine/use-form] Form name "${e}" is invalid, it should contain only letters, numbers and dashes`
    );
}
const nR = typeof window < "u" ? w.useLayoutEffect : w.useEffect;
function Be(e, t) {
  nR(() => {
    if (e)
      return (
        window.addEventListener(e, t), () => window.removeEventListener(e, t)
      );
  }, [e]);
}
function rR(e, t) {
  e && tR(e),
    Be(`mantine-form:${e}:set-field-value`, (n) =>
      t.setFieldValue(n.detail.path, n.detail.value)
    ),
    Be(`mantine-form:${e}:set-values`, (n) => t.setValues(n.detail)),
    Be(`mantine-form:${e}:set-initial-values`, (n) =>
      t.setInitialValues(n.detail)
    ),
    Be(`mantine-form:${e}:set-errors`, (n) => t.setErrors(n.detail)),
    Be(`mantine-form:${e}:set-field-error`, (n) =>
      t.setFieldError(n.detail.path, n.detail.error)
    ),
    Be(`mantine-form:${e}:clear-field-error`, (n) =>
      t.clearFieldError(n.detail)
    ),
    Be(`mantine-form:${e}:clear-errors`, t.clearErrors),
    Be(`mantine-form:${e}:reset`, t.reset),
    Be(`mantine-form:${e}:validate`, t.validate),
    Be(`mantine-form:${e}:validate-field`, (n) => t.validateField(n.detail)),
    Be(`mantine-form:${e}:reorder-list-item`, (n) =>
      t.reorderListItem(n.detail.path, n.detail.payload)
    ),
    Be(`mantine-form:${e}:remove-list-item`, (n) =>
      t.removeListItem(n.detail.path, n.detail.index)
    ),
    Be(`mantine-form:${e}:insert-list-item`, (n) =>
      t.insertListItem(n.detail.path, n.detail.item, n.detail.index)
    ),
    Be(`mantine-form:${e}:set-dirty`, (n) => t.setDirty(n.detail)),
    Be(`mantine-form:${e}:set-touched`, (n) => t.setTouched(n.detail)),
    Be(`mantine-form:${e}:reset-dirty`, (n) => t.resetDirty(n.detail)),
    Be(`mantine-form:${e}:reset-touched`, t.resetTouched);
}
function oR(e) {
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
function bu(e) {
  return e === null || typeof e != "object"
    ? {}
    : Object.keys(e).reduce((t, n) => {
        const r = e[n];
        return r != null && r !== !1 && (t[n] = r), t;
      }, {});
}
function sR(e) {
  const [t, n] = w.useState(bu(e)),
    r = w.useCallback((l) => {
      n((a) => bu(typeof l == "function" ? l(a) : l));
    }, []),
    o = w.useCallback(() => n({}), []),
    s = w.useCallback(
      (l) => {
        t[l] !== void 0 &&
          r((a) => {
            const c = { ...a };
            return delete c[l], c;
          });
      },
      [t]
    ),
    i = w.useCallback(
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
function d0(e, t) {
  if (t === null || typeof t != "object") return {};
  const n = { ...t };
  return (
    Object.keys(t).forEach((r) => {
      r.includes(`${String(e)}.`) && delete n[r];
    }),
    n
  );
}
function Mm(e, t) {
  const n = e.substring(t.length + 1).split(".")[0];
  return parseInt(n, 10);
}
function zm(e, t, n, r) {
  if (t === void 0) return n;
  const o = `${String(e)}`;
  let s = n;
  r === -1 && (s = d0(`${o}.${t}`, s));
  const i = { ...s },
    l = new Set();
  return (
    Object.entries(s)
      .filter(([a]) => {
        if (!a.startsWith(`${o}.`)) return !1;
        const c = Mm(a, o);
        return Number.isNaN(c) ? !1 : c >= t;
      })
      .forEach(([a, c]) => {
        const u = Mm(a, o),
          f = a.replace(`${o}.${u}`, `${o}.${u + r}`);
        (i[f] = c), l.add(f), l.has(a) || delete i[a];
      }),
    i
  );
}
function iR(e, { from: t, to: n }, r) {
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
          f = i[c];
        return (
          f === void 0 ? delete i[a] : (i[a] = f),
          u === void 0 ? delete i[c] : (i[c] = u),
          !1
        );
      }
      return !0;
    }),
    i
  );
}
function Im(e, t, n) {
  typeof n.value == "object" && (n.value = eo(n.value)),
    !n.enumerable ||
    n.get ||
    n.set ||
    !n.configurable ||
    !n.writable ||
    t === "__proto__"
      ? Object.defineProperty(e, t, n)
      : (e[t] = n.value);
}
function eo(e) {
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
          o.add(eo(i));
        }))
      : s === "[object Map]"
      ? ((o = new Map()),
        e.forEach(function (i, l) {
          o.set(eo(l), eo(i));
        }))
      : s === "[object Date]"
      ? (o = new Date(+e))
      : s === "[object RegExp]"
      ? (o = new RegExp(e.source, e.flags))
      : s === "[object DataView]"
      ? (o = new e.constructor(eo(e.buffer)))
      : s === "[object ArrayBuffer]"
      ? (o = e.slice(0))
      : s.slice(-6) === "Array]" && (o = new e.constructor(e)),
    o)
  ) {
    for (r = Object.getOwnPropertySymbols(e); t < r.length; t++)
      Im(o, r[t], Object.getOwnPropertyDescriptor(e, r[t]));
    for (t = 0, r = Object.getOwnPropertyNames(e); t < r.length; t++)
      (Object.hasOwnProperty.call(o, (n = r[t])) && o[n] === e[n]) ||
        Im(o, n, Object.getOwnPropertyDescriptor(e, n));
  }
  return o || e;
}
function p0(e) {
  return typeof e != "string" ? [] : e.split(".");
}
function ct(e, t) {
  const n = p0(e);
  if (n.length === 0 || typeof t != "object" || t === null) return;
  let r = t[n[0]];
  for (let o = 1; o < n.length && r !== void 0; o += 1) r = r[n[o]];
  return r;
}
function ca(e, t, n) {
  const r = p0(e);
  if (r.length === 0) return n;
  const o = eo(n);
  if (r.length === 1) return (o[r[0]] = t), o;
  let s = o[r[0]];
  for (let i = 1; i < r.length - 1; i += 1) {
    if (s === void 0) return o;
    s = s[r[i]];
  }
  return (s[r[r.length - 1]] = t), o;
}
function lR(e, { from: t, to: n }, r) {
  const o = ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o],
    i = o[t];
  return s.splice(t, 1), s.splice(n, 0, i), ca(e, s, r);
}
function aR(e, t, n, r) {
  const o = ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o];
  return s.splice(typeof n == "number" ? n : s.length, 0, t), ca(e, s, r);
}
function cR(e, t, n) {
  const r = ct(e, n);
  return Array.isArray(r)
    ? ca(
        e,
        r.filter((o, s) => s !== t),
        n
      )
    : n;
}
function uR({ $values: e, $errors: t, $status: n }) {
  const r = w.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => iR(i, l, a)),
        e.setValues({ values: lR(i, l, e.refValues.current), updateState: !0 });
    }, []),
    o = w.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => zm(i, l, a, -1)),
        e.setValues({ values: cR(i, l, e.refValues.current), updateState: !0 });
    }, []),
    s = w.useCallback((i, l, a) => {
      n.clearFieldDirty(i),
        t.setErrors((c) => zm(i, a, c, 1)),
        e.setValues({
          values: aR(i, l, a, e.refValues.current),
          updateState: !0,
        });
    }, []);
  return { reorderListItem: r, removeListItem: o, insertListItem: s };
}
var fR = function e(t, n) {
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
const pc = Dr(fR);
function wi(e, t) {
  const n = Object.keys(e);
  if (typeof t == "string") {
    const r = n.filter((o) => o.startsWith(`${t}.`));
    return e[t] || r.some((o) => e[o]) || !1;
  }
  return n.some((r) => e[r]);
}
function dR({ initialDirty: e, initialTouched: t, mode: n, $values: r }) {
  const [o, s] = w.useState(t),
    [i, l] = w.useState(e),
    a = w.useRef(t),
    c = w.useRef(e),
    u = w.useCallback((C) => {
      const E = typeof C == "function" ? C(a.current) : C;
      (a.current = E), n === "controlled" && s(E);
    }, []),
    f = w.useCallback((C) => {
      const E = typeof C == "function" ? C(c.current) : C;
      (c.current = E), n === "controlled" && l(E);
    }, []),
    d = w.useCallback(() => u({}), []),
    m = (C) => {
      const E = C ? { ...C, ...r.refValues.current } : r.refValues.current;
      r.setValuesSnapshot(E), f({});
    },
    p = w.useCallback((C, E) => {
      u((R) => (wi(R, C) === E ? R : { ...R, [C]: E }));
    }, []),
    h = w.useCallback((C, E) => {
      f((R) => (wi(R, C) === E ? R : { ...R, [C]: E }));
    }, []),
    S = w.useCallback((C) => wi(a.current, C), []),
    v = w.useCallback(
      (C) =>
        f((E) => {
          if (typeof C != "string") return E;
          const R = d0(C, E);
          return delete R[C], pc(R, E) ? E : R;
        }),
      []
    ),
    g = w.useCallback((C) => {
      if (C) {
        const R = ct(C, c.current);
        if (typeof R == "boolean") return R;
        const D = ct(C, r.refValues.current),
          j = ct(C, r.valuesSnapshot.current);
        return !pc(D, j);
      }
      return Object.keys(c.current).length > 0
        ? wi(c.current)
        : !pc(r.refValues.current, r.valuesSnapshot.current);
    }, []),
    y = w.useCallback(() => c.current, []),
    b = w.useCallback(() => a.current, []);
  return {
    touchedState: o,
    dirtyState: i,
    touchedRef: a,
    dirtyRef: c,
    setTouched: u,
    setDirty: f,
    resetDirty: m,
    resetTouched: d,
    isTouched: S,
    setFieldTouched: p,
    setFieldDirty: h,
    setTouchedState: s,
    setDirtyState: l,
    clearFieldDirty: v,
    isDirty: g,
    getDirty: y,
    getTouched: b,
  };
}
function pR({ initialValues: e, onValuesChange: t, mode: n }) {
  const r = w.useRef(!1),
    [o, s] = w.useState(e || {}),
    i = w.useRef(o),
    l = w.useRef(o),
    a = w.useCallback(
      ({
        values: p,
        subscribers: h,
        updateState: S = !0,
        mergeWithPreviousValues: v = !0,
      }) => {
        const g = i.current,
          y = p instanceof Function ? p(i.current) : p,
          b = v ? { ...g, ...y } : y;
        (i.current = b),
          S && s(b),
          t == null || t(b, g),
          h == null ||
            h
              .filter(Boolean)
              .forEach((C) => C({ updatedValues: b, previousValues: g }));
      },
      [t]
    ),
    c = w.useCallback((p) => {
      var v;
      const h = ct(p.path, i.current),
        S = p.value instanceof Function ? p.value(h) : p.value;
      if (h !== S) {
        const g = i.current,
          y = ca(p.path, S, i.current);
        a({ values: y, updateState: p.updateState }),
          (v = p.subscribers) == null ||
            v
              .filter(Boolean)
              .forEach((b) =>
                b({ path: p.path, updatedValues: y, previousValues: g })
              );
      }
    }, []),
    u = w.useCallback((p) => {
      l.current = p;
    }, []),
    f = w.useCallback((p, h) => {
      r.current ||
        ((r.current = !0),
        a({ values: p, updateState: n === "controlled" }),
        u(p),
        h());
    }, []),
    d = w.useCallback(() => {
      a({ values: l.current, updateState: !0, mergeWithPreviousValues: !1 });
    }, []),
    m = w.useCallback(() => i.current, []);
  return {
    initialized: r,
    stateValues: o,
    refValues: i,
    valuesSnapshot: l,
    setValues: a,
    setFieldValue: c,
    resetValues: d,
    setValuesSnapshot: u,
    initialize: f,
    getValues: m,
  };
}
function mR({ $status: e }) {
  const t = w.useRef({}),
    n = w.useCallback((o, s) => {
      w.useEffect(
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
    r = w.useCallback(
      (o) =>
        t.current[o]
          ? t.current[o].map(
              (s) => (i) =>
                s({
                  previousValue: ct(o, i.previousValues),
                  value: ct(o, i.updatedValues),
                  touched: e.isTouched(o),
                  dirty: e.isDirty(o),
                })
            )
          : [],
      []
    );
  return { subscribers: t, watch: n, getFieldSubscribers: r };
}
function Bm(e) {
  const t = bu(e);
  return { hasErrors: Object.keys(t).length > 0, errors: t };
}
function Cu(e, t, n = "", r = {}) {
  return typeof e != "object" || e === null
    ? r
    : Object.keys(e).reduce((o, s) => {
        const i = e[s],
          l = `${n === "" ? "" : `${n}.`}${s}`,
          a = ct(l, t);
        let c = !1;
        return (
          typeof i == "function" && (o[l] = i(a, t, l)),
          typeof i == "object" &&
            Array.isArray(a) &&
            ((c = !0), a.forEach((u, f) => Cu(i, t, `${l}.${f}`, o))),
          typeof i == "object" &&
            typeof a == "object" &&
            a !== null &&
            (c || Cu(i, t, l, o)),
          o
        );
      }, r);
}
function Eu(e, t) {
  return Bm(typeof e == "function" ? e(t) : Cu(e, t));
}
function Si(e, t, n) {
  if (typeof e != "string") return { hasError: !1, error: null };
  const r = Eu(t, n),
    o = Object.keys(r.errors).find((s) =>
      e.split(".").every((i, l) => i === s.split(".")[l])
    );
  return { hasError: !!o, error: o ? r.errors[o] : null };
}
const hR = "__MANTINE_FORM_INDEX__";
function Vm(e, t) {
  return t
    ? typeof t == "boolean"
      ? t
      : Array.isArray(t)
      ? t.includes(e.replace(/[.][0-9]/g, `.${hR}`))
      : !1
    : !1;
}
function gR({
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
  enhanceGetInputProps: f,
  validate: d,
} = {}) {
  const m = sR(r),
    p = pR({ initialValues: n, onValuesChange: c, mode: t }),
    h = dR({ initialDirty: o, initialTouched: s, $values: p, mode: t }),
    S = uR({ $values: p, $errors: m, $status: h }),
    v = mR({ $status: h }),
    [g, y] = w.useState(0),
    [b, C] = w.useState({}),
    E = w.useCallback(() => {
      p.resetValues(),
        m.clearErrors(),
        h.resetDirty(),
        h.resetTouched(),
        t === "uncontrolled" && y((k) => k + 1);
    }, []),
    R = w.useCallback((k) => {
      p.initialize(k, () => t === "uncontrolled" && y(($) => $ + 1));
    }, []),
    D = w.useCallback(
      (k, $, N) => {
        const I = Vm(k, l);
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
                ? (Y) => {
                    const X = Si(k, d, Y.updatedValues);
                    X.hasError
                      ? m.setFieldError(k, X.error)
                      : m.clearFieldError(k);
                  }
                : null,
              (N == null ? void 0 : N.forceUpdate) !== !1 && t !== "controlled"
                ? () => C((Y) => ({ ...Y, [k]: (Y[k] || 0) + 1 }))
                : null,
            ],
          });
      },
      [c, d]
    ),
    j = w.useCallback(
      (k) => {
        const $ = p.refValues.current;
        p.setValues({ values: k, updateState: t === "controlled" }),
          i && m.clearErrors(),
          t === "uncontrolled" && y((N) => N + 1),
          Object.keys(v.subscribers.current).forEach((N) => {
            const I = ct(N, p.refValues.current),
              Y = ct(N, $);
            I !== Y &&
              v
                .getFieldSubscribers(N)
                .forEach((X) =>
                  X({ previousValues: $, updatedValues: p.refValues.current })
                );
          });
      },
      [c, i]
    ),
    T = w.useCallback(() => {
      const k = Eu(d, p.refValues.current);
      return m.setErrors(k.errors), k;
    }, [d]),
    M = w.useCallback(
      (k) => {
        const $ = Si(k, d, p.refValues.current);
        return (
          $.hasError ? m.setFieldError(k, $.error) : m.clearFieldError(k), $
        );
      },
      [d]
    ),
    B = (
      k,
      { type: $ = "input", withError: N = !0, withFocus: I = !0, ...Y } = {}
    ) => {
      const ee = { onChange: oR((ne) => D(k, ne, { forceUpdate: !1 })) };
      return (
        N && (ee.error = m.errorsState[k]),
        $ === "checkbox"
          ? (ee[t === "controlled" ? "checked" : "defaultChecked"] = ct(
              k,
              p.refValues.current
            ))
          : (ee[t === "controlled" ? "value" : "defaultValue"] = ct(
              k,
              p.refValues.current
            )),
        I &&
          ((ee.onFocus = () => h.setFieldTouched(k, !0)),
          (ee.onBlur = () => {
            if (Vm(k, a)) {
              const ne = Si(k, d, p.refValues.current);
              ne.hasError ? m.setFieldError(k, ne.error) : m.clearFieldError(k);
            }
          })),
        Object.assign(
          ee,
          f == null
            ? void 0
            : f({
                inputProps: ee,
                field: k,
                options: { type: $, withError: N, withFocus: I, ...Y },
                form: _,
              })
        )
      );
    },
    H = (k, $) => (N) => {
      N == null || N.preventDefault();
      const I = T();
      I.hasErrors
        ? $ == null || $(I.errors, p.refValues.current, N)
        : k == null || k(u(p.refValues.current), N);
    },
    F = (k) => u(k || p.refValues.current),
    L = w.useCallback((k) => {
      k.preventDefault(), E();
    }, []),
    P = w.useCallback(
      (k) =>
        k
          ? !Si(k, d, p.refValues.current).hasError
          : !Eu(d, p.refValues.current).hasErrors,
      [d]
    ),
    O = (k) => `${g}-${k}-${b[k] || 0}`,
    _ = {
      watch: v.watch,
      initialized: p.initialized.current,
      values: p.stateValues,
      getValues: p.getValues,
      setInitialValues: p.setValuesSnapshot,
      initialize: R,
      setValues: j,
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
      validate: T,
      validateField: M,
      getInputProps: B,
      onSubmit: H,
      onReset: L,
      isValid: P,
      getTransformedValues: F,
      key: O,
    };
  return rR(e, _), _;
}
const gl = (e) => {
  const { title: t, description: n, form: r, field_id: o, placeholder: s } = e;
  return x.jsx(
    bd,
    {
      label: t,
      description: n,
      placeholder: s,
      required: !0,
      ...r.getInputProps(o),
    },
    r.key(o)
  );
};
gl.defaultProps = { placeholder: "" };
gl.propTypes = {
  title: J.string.isRequired,
  description: J.string.isRequired,
  form: J.object.isRequired,
  field_id: J.string.isRequired,
  placeholder: J.string,
};
const Cd = (e) => {
  const { title: t, description: n, form: r, field_id: o, placeholder: s } = e;
  return x.jsx(
    wd,
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
Cd.defaultProps = { placeholder: "" };
Cd.propTypes = {
  title: J.string.isRequired,
  description: J.string.isRequired,
  form: J.object.isRequired,
  field_id: J.string.isRequired,
  placeholder: J.string,
};
const yR = new Map([
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
function Ws(e, t) {
  const n = vR(e);
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
function vR(e) {
  const { name: t } = e;
  if (t && t.lastIndexOf(".") !== -1 && !e.type) {
    const r = t.split(".").pop().toLowerCase(),
      o = yR.get(r);
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
var Lo = (e, t, n) =>
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
const wR = [".DS_Store", "Thumbs.db"];
function SR(e) {
  return Lo(this, null, function* () {
    return yl(e) && xR(e.dataTransfer)
      ? kR(e.dataTransfer, e.type)
      : bR(e)
      ? CR(e)
      : Array.isArray(e) &&
        e.every((t) => "getFile" in t && typeof t.getFile == "function")
      ? ER(e)
      : [];
  });
}
function xR(e) {
  return yl(e);
}
function bR(e) {
  return yl(e) && yl(e.target);
}
function yl(e) {
  return typeof e == "object" && e !== null;
}
function CR(e) {
  return ku(e.target.files).map((t) => Ws(t));
}
function ER(e) {
  return Lo(this, null, function* () {
    return (yield Promise.all(e.map((n) => n.getFile()))).map((n) => Ws(n));
  });
}
function kR(e, t) {
  return Lo(this, null, function* () {
    if (e.items) {
      const n = ku(e.items).filter((o) => o.kind === "file");
      if (t !== "drop") return n;
      const r = yield Promise.all(n.map(_R));
      return Hm(m0(r));
    }
    return Hm(ku(e.files).map((n) => Ws(n)));
  });
}
function Hm(e) {
  return e.filter((t) => wR.indexOf(t.name) === -1);
}
function ku(e) {
  if (e === null) return [];
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    t.push(r);
  }
  return t;
}
function _R(e) {
  if (typeof e.webkitGetAsEntry != "function") return Um(e);
  const t = e.webkitGetAsEntry();
  return t && t.isDirectory ? h0(t) : Um(e);
}
function m0(e) {
  return e.reduce((t, n) => [...t, ...(Array.isArray(n) ? m0(n) : [n])], []);
}
function Um(e) {
  const t = e.getAsFile();
  if (!t) return Promise.reject(`${e} is not a File`);
  const n = Ws(t);
  return Promise.resolve(n);
}
function RR(e) {
  return Lo(this, null, function* () {
    return e.isDirectory ? h0(e) : DR(e);
  });
}
function h0(e) {
  const t = e.createReader();
  return new Promise((n, r) => {
    const o = [];
    function s() {
      t.readEntries(
        (i) =>
          Lo(this, null, function* () {
            if (i.length) {
              const l = Promise.all(i.map(RR));
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
function DR(e) {
  return Lo(this, null, function* () {
    return new Promise((t, n) => {
      e.file(
        (r) => {
          const o = Ws(r, e.fullPath);
          t(o);
        },
        (r) => {
          n(r);
        }
      );
    });
  });
}
function PR(e, t) {
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
var TR = Object.defineProperty,
  OR = Object.defineProperties,
  NR = Object.getOwnPropertyDescriptors,
  Wm = Object.getOwnPropertySymbols,
  $R = Object.prototype.hasOwnProperty,
  LR = Object.prototype.propertyIsEnumerable,
  Ym = (e, t, n) =>
    t in e
      ? TR(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  jR = (e, t) => {
    for (var n in t || (t = {})) $R.call(t, n) && Ym(e, n, t[n]);
    if (Wm) for (var n of Wm(t)) LR.call(t, n) && Ym(e, n, t[n]);
    return e;
  },
  AR = (e, t) => OR(e, NR(t));
const FR = "file-invalid-type",
  MR = "file-too-large",
  zR = "file-too-small",
  IR = "too-many-files",
  BR = (e) => {
    e = Array.isArray(e) && e.length === 1 ? e[0] : e;
    const t = Array.isArray(e) ? `one of ${e.join(", ")}` : e;
    return { code: FR, message: `File type must be ${t}` };
  },
  Km = (e) => ({
    code: MR,
    message: `File is larger than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  Gm = (e) => ({
    code: zR,
    message: `File is smaller than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  VR = { code: IR, message: "Too many files" };
function g0(e, t) {
  const n = e.type === "application/x-moz-file" || PR(e, t);
  return [n, n ? null : BR(t)];
}
function y0(e, t, n) {
  if (pr(e.size))
    if (pr(t) && pr(n)) {
      if (e.size > n) return [!1, Km(n)];
      if (e.size < t) return [!1, Gm(t)];
    } else {
      if (pr(t) && e.size < t) return [!1, Gm(t)];
      if (pr(n) && e.size > n) return [!1, Km(n)];
    }
  return [!0, null];
}
function pr(e) {
  return e != null;
}
function HR({
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
        const [a] = g0(l, t),
          [c] = y0(l, n, r),
          u = i ? i(l) : null;
        return a && c && !u;
      });
}
function vl(e) {
  return typeof e.isPropagationStopped == "function"
    ? e.isPropagationStopped()
    : typeof e.cancelBubble < "u"
    ? e.cancelBubble
    : !1;
}
function xi(e) {
  return e.dataTransfer
    ? Array.prototype.some.call(
        e.dataTransfer.types,
        (t) => t === "Files" || t === "application/x-moz-file"
      )
    : !!e.target && !!e.target.files;
}
function Xm(e) {
  e.preventDefault();
}
function UR(e) {
  return e.indexOf("MSIE") !== -1 || e.indexOf("Trident/") !== -1;
}
function WR(e) {
  return e.indexOf("Edge/") !== -1;
}
function YR(e = window.navigator.userAgent) {
  return UR(e) || WR(e);
}
function Zt(...e) {
  return (t, ...n) => e.some((r) => (!vl(t) && r && r(t, ...n), vl(t)));
}
function KR() {
  return "showOpenFilePicker" in window;
}
function GR(e) {
  return pr(e)
    ? [
        {
          description: "Files",
          accept: Object.entries(e)
            .filter(([n, r]) => {
              let o = !0;
              return (
                v0(n) ||
                  (console.warn(
                    `Skipped "${n}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`
                  ),
                  (o = !1)),
                (!Array.isArray(r) || !r.every(w0)) &&
                  (console.warn(
                    `Skipped "${n}" because an invalid file extension was provided.`
                  ),
                  (o = !1)),
                o
              );
            })
            .reduce((n, [r, o]) => AR(jR({}, n), { [r]: o }), {}),
        },
      ]
    : e;
}
function XR(e) {
  if (pr(e))
    return Object.entries(e)
      .reduce((t, [n, r]) => [...t, n, ...r], [])
      .filter((t) => v0(t) || w0(t))
      .join(",");
}
function qR(e) {
  return (
    e instanceof DOMException &&
    (e.name === "AbortError" || e.code === e.ABORT_ERR)
  );
}
function QR(e) {
  return (
    e instanceof DOMException &&
    (e.name === "SecurityError" || e.code === e.SECURITY_ERR)
  );
}
function v0(e) {
  return (
    e === "audio/*" ||
    e === "video/*" ||
    e === "image/*" ||
    e === "text/*" ||
    /\w+\/[-+.\w]+/g.test(e)
  );
}
function w0(e) {
  return /^.*\.[\w]+$/.test(e);
}
var JR = Object.defineProperty,
  ZR = Object.defineProperties,
  eD = Object.getOwnPropertyDescriptors,
  wl = Object.getOwnPropertySymbols,
  S0 = Object.prototype.hasOwnProperty,
  x0 = Object.prototype.propertyIsEnumerable,
  qm = (e, t, n) =>
    t in e
      ? JR(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Ze = (e, t) => {
    for (var n in t || (t = {})) S0.call(t, n) && qm(e, n, t[n]);
    if (wl) for (var n of wl(t)) x0.call(t, n) && qm(e, n, t[n]);
    return e;
  },
  An = (e, t) => ZR(e, eD(t)),
  Sl = (e, t) => {
    var n = {};
    for (var r in e) S0.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
    if (e != null && wl)
      for (var r of wl(e)) t.indexOf(r) < 0 && x0.call(e, r) && (n[r] = e[r]);
    return n;
  };
const Ed = w.forwardRef((e, t) => {
  var n = e,
    { children: r } = n,
    o = Sl(n, ["children"]);
  const s = C0(o),
    { open: i } = s,
    l = Sl(s, ["open"]);
  return (
    w.useImperativeHandle(t, () => ({ open: i }), [i]),
    _l.createElement(w.Fragment, null, r(An(Ze({}, l), { open: i })))
  );
});
Ed.displayName = "Dropzone";
const b0 = {
  disabled: !1,
  getFilesFromEvent: SR,
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
Ed.defaultProps = b0;
Ed.propTypes = {
  children: J.func,
  accept: J.objectOf(J.arrayOf(J.string)),
  multiple: J.bool,
  preventDropOnDocument: J.bool,
  noClick: J.bool,
  noKeyboard: J.bool,
  noDrag: J.bool,
  noDragEventsBubbling: J.bool,
  minSize: J.number,
  maxSize: J.number,
  maxFiles: J.number,
  disabled: J.bool,
  getFilesFromEvent: J.func,
  onFileDialogCancel: J.func,
  onFileDialogOpen: J.func,
  useFsAccessApi: J.bool,
  autoFocus: J.bool,
  onDragEnter: J.func,
  onDragLeave: J.func,
  onDragOver: J.func,
  onDrop: J.func,
  onDropAccepted: J.func,
  onDropRejected: J.func,
  onError: J.func,
  validator: J.func,
};
const _u = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  acceptedFiles: [],
  fileRejections: [],
};
function C0(e = {}) {
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
      onDrop: f,
      onDropAccepted: d,
      onDropRejected: m,
      onFileDialogCancel: p,
      onFileDialogOpen: h,
      useFsAccessApi: S,
      autoFocus: v,
      preventDropOnDocument: g,
      noClick: y,
      noKeyboard: b,
      noDrag: C,
      noDragEventsBubbling: E,
      onError: R,
      validator: D,
    } = Ze(Ze({}, b0), e),
    j = w.useMemo(() => XR(t), [t]),
    T = w.useMemo(() => GR(t), [t]),
    M = w.useMemo(() => (typeof h == "function" ? h : Qm), [h]),
    B = w.useMemo(() => (typeof p == "function" ? p : Qm), [p]),
    H = w.useRef(null),
    F = w.useRef(null),
    [L, P] = w.useReducer(tD, _u),
    { isFocused: O, isFileDialogActive: _ } = L,
    k = w.useRef(typeof window < "u" && window.isSecureContext && S && KR()),
    $ = () => {
      !k.current &&
        _ &&
        setTimeout(() => {
          if (F.current) {
            const { files: U } = F.current;
            U.length || (P({ type: "closeDialog" }), B());
          }
        }, 300);
    };
  w.useEffect(
    () => (
      window.addEventListener("focus", $, !1),
      () => {
        window.removeEventListener("focus", $, !1);
      }
    ),
    [F, _, B, k]
  );
  const N = w.useRef([]),
    I = (U) => {
      (H.current && H.current.contains(U.target)) ||
        (U.preventDefault(), (N.current = []));
    };
  w.useEffect(
    () => (
      g &&
        (document.addEventListener("dragover", Xm, !1),
        document.addEventListener("drop", I, !1)),
      () => {
        g &&
          (document.removeEventListener("dragover", Xm),
          document.removeEventListener("drop", I));
      }
    ),
    [H, g]
  ),
    w.useEffect(
      () => (!n && v && H.current && H.current.focus(), () => {}),
      [H, v, n]
    );
  const Y = w.useCallback(
      (U) => {
        R ? R(U) : console.error(U);
      },
      [R]
    ),
    X = w.useCallback(
      (U) => {
        U.preventDefault(),
          U.persist(),
          xe(U),
          (N.current = [...N.current, U.target]),
          xi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                if (vl(U) && !E) return;
                const ae = re.length,
                  ke =
                    ae > 0 &&
                    HR({
                      files: re,
                      accept: j,
                      minSize: s,
                      maxSize: o,
                      multiple: i,
                      maxFiles: l,
                      validator: D,
                    }),
                  je = ae > 0 && !ke;
                P({
                  isDragAccept: ke,
                  isDragReject: je,
                  isDragActive: !0,
                  type: "setDraggedFiles",
                }),
                  a && a(U);
              })
              .catch((re) => Y(re));
      },
      [r, a, Y, E, j, s, o, i, l, D]
    ),
    ee = w.useCallback(
      (U) => {
        U.preventDefault(), U.persist(), xe(U);
        const re = xi(U);
        if (re && U.dataTransfer)
          try {
            U.dataTransfer.dropEffect = "copy";
          } catch {}
        return re && u && u(U), !1;
      },
      [u, E]
    ),
    ne = w.useCallback(
      (U) => {
        U.preventDefault(), U.persist(), xe(U);
        const re = N.current.filter(
            (ke) => H.current && H.current.contains(ke)
          ),
          ae = re.indexOf(U.target);
        ae !== -1 && re.splice(ae, 1),
          (N.current = re),
          !(re.length > 0) &&
            (P({
              type: "setDraggedFiles",
              isDragActive: !1,
              isDragAccept: !1,
              isDragReject: !1,
            }),
            xi(U) && c && c(U));
      },
      [H, c, E]
    ),
    te = w.useCallback(
      (U, re) => {
        const ae = [],
          ke = [];
        U.forEach((je) => {
          const [Qt, _e] = g0(je, j),
            [Ae, Tn] = y0(je, s, o),
            st = D ? D(je) : null;
          if (Qt && Ae && !st) ae.push(je);
          else {
            let fn = [_e, Tn];
            st && (fn = fn.concat(st)),
              ke.push({ file: je, errors: fn.filter((Fo) => Fo) });
          }
        }),
          ((!i && ae.length > 1) || (i && l >= 1 && ae.length > l)) &&
            (ae.forEach((je) => {
              ke.push({ file: je, errors: [VR] });
            }),
            ae.splice(0)),
          P({ acceptedFiles: ae, fileRejections: ke, type: "setFiles" }),
          f && f(ae, ke, re),
          ke.length > 0 && m && m(ke, re),
          ae.length > 0 && d && d(ae, re);
      },
      [P, i, j, s, o, l, f, d, m, D]
    ),
    me = w.useCallback(
      (U) => {
        U.preventDefault(),
          U.persist(),
          xe(U),
          (N.current = []),
          xi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                (vl(U) && !E) || te(re, U);
              })
              .catch((re) => Y(re)),
          P({ type: "reset" });
      },
      [r, te, Y, E]
    ),
    oe = w.useCallback(() => {
      if (k.current) {
        P({ type: "openDialog" }), M();
        const U = { multiple: i, types: T };
        window
          .showOpenFilePicker(U)
          .then((re) => r(re))
          .then((re) => {
            te(re, null), P({ type: "closeDialog" });
          })
          .catch((re) => {
            qR(re)
              ? (B(re), P({ type: "closeDialog" }))
              : QR(re)
              ? ((k.current = !1),
                F.current
                  ? ((F.current.value = null), F.current.click())
                  : Y(
                      new Error(
                        "Cannot open the file picker because the https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API is not supported and no <input> was provided."
                      )
                    ))
              : Y(re);
          });
        return;
      }
      F.current &&
        (P({ type: "openDialog" }),
        M(),
        (F.current.value = null),
        F.current.click());
    }, [P, M, B, S, te, Y, T, i]),
    le = w.useCallback(
      (U) => {
        !H.current ||
          !H.current.isEqualNode(U.target) ||
          ((U.key === " " ||
            U.key === "Enter" ||
            U.keyCode === 32 ||
            U.keyCode === 13) &&
            (U.preventDefault(), oe()));
      },
      [H, oe]
    ),
    q = w.useCallback(() => {
      P({ type: "focus" });
    }, []),
    ye = w.useCallback(() => {
      P({ type: "blur" });
    }, []),
    ce = w.useCallback(() => {
      y || (YR() ? setTimeout(oe, 0) : oe());
    }, [y, oe]),
    se = (U) => (n ? null : U),
    Oe = (U) => (b ? null : se(U)),
    qe = (U) => (C ? null : se(U)),
    xe = (U) => {
      E && U.stopPropagation();
    },
    gt = w.useMemo(
      () =>
        (U = {}) => {
          var re = U,
            {
              refKey: ae = "ref",
              role: ke,
              onKeyDown: je,
              onFocus: Qt,
              onBlur: _e,
              onClick: Ae,
              onDragEnter: Tn,
              onDragOver: st,
              onDragLeave: fn,
              onDrop: Fo,
            } = re,
            On = Sl(re, [
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
          return Ze(
            Ze(
              {
                onKeyDown: Oe(Zt(je, le)),
                onFocus: Oe(Zt(Qt, q)),
                onBlur: Oe(Zt(_e, ye)),
                onClick: se(Zt(Ae, ce)),
                onDragEnter: qe(Zt(Tn, X)),
                onDragOver: qe(Zt(st, ee)),
                onDragLeave: qe(Zt(fn, ne)),
                onDrop: qe(Zt(Fo, me)),
                role: typeof ke == "string" && ke !== "" ? ke : "presentation",
                [ae]: H,
              },
              !n && !b ? { tabIndex: 0 } : {}
            ),
            On
          );
        },
      [H, le, q, ye, ce, X, ee, ne, me, b, C, n]
    ),
    At = w.useCallback((U) => {
      U.stopPropagation();
    }, []),
    Ie = w.useMemo(
      () =>
        (U = {}) => {
          var re = U,
            { refKey: ae = "ref", onChange: ke, onClick: je } = re,
            Qt = Sl(re, ["refKey", "onChange", "onClick"]);
          const _e = {
            accept: j,
            multiple: i,
            type: "file",
            style: { display: "none" },
            onChange: se(Zt(ke, me)),
            onClick: se(Zt(je, At)),
            tabIndex: -1,
            [ae]: F,
          };
          return Ze(Ze({}, _e), Qt);
        },
      [F, t, i, me, n]
    );
  return An(Ze({}, L), {
    isFocused: O && !n,
    getRootProps: gt,
    getInputProps: Ie,
    rootRef: H,
    inputRef: F,
    open: se(oe),
  });
}
function tD(e, t) {
  switch (t.type) {
    case "focus":
      return An(Ze({}, e), { isFocused: !0 });
    case "blur":
      return An(Ze({}, e), { isFocused: !1 });
    case "openDialog":
      return An(Ze({}, _u), { isFileDialogActive: !0 });
    case "closeDialog":
      return An(Ze({}, e), { isFileDialogActive: !1 });
    case "setDraggedFiles":
      return An(Ze({}, e), {
        isDragActive: t.isDragActive,
        isDragAccept: t.isDragAccept,
        isDragReject: t.isDragReject,
      });
    case "setFiles":
      return An(Ze({}, e), {
        acceptedFiles: t.acceptedFiles,
        fileRejections: t.fileRejections,
      });
    case "reset":
      return Ze({}, _u);
    default:
      return e;
  }
}
function Qm() {}
const [nD, rD] = Or("Dropzone component was not found in tree");
function kd(e) {
  const t = (n) => {
    const { children: r, ...o } = W(`Dropzone${Zp(e)}`, {}, n),
      s = rD(),
      i = Po(r) ? r : x.jsx("span", { children: r });
    return s[e] ? w.cloneElement(i, o) : null;
  };
  return (t.displayName = `@mantine/dropzone/${Zp(e)}`), t;
}
const oD = kd("accept"),
  sD = kd("reject"),
  iD = kd("idle");
var Os = {
  root: "m_d46a4834",
  inner: "m_b85f7144",
  fullScreen: "m_96f6e9ad",
  dropzone: "m_7946116d",
};
const lD = {
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
  aD = (e, { radius: t, variant: n, acceptColor: r, rejectColor: o }) => {
    const s = e.variantColorResolver({
        color: r || e.primaryColor,
        theme: e,
        variant: n,
      }),
      i = e.variantColorResolver({ color: o || "red", theme: e, variant: n });
    return {
      root: {
        "--dropzone-radius": or(t),
        "--dropzone-accept-color": s.color,
        "--dropzone-accept-bg": s.background,
        "--dropzone-reject-color": i.color,
        "--dropzone-reject-bg": i.background,
      },
    };
  },
  lr = Q((e, t) => {
    const n = W("Dropzone", lD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        radius: c,
        disabled: u,
        loading: f,
        multiple: d,
        maxSize: m,
        accept: p,
        children: h,
        onDropAny: S,
        onDrop: v,
        onReject: g,
        openRef: y,
        name: b,
        maxFiles: C,
        autoFocus: E,
        activateOnClick: R,
        activateOnDrag: D,
        dragEventsBubbling: j,
        activateOnKeyboard: T,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: H,
        onFileDialogCancel: F,
        onFileDialogOpen: L,
        preventDropOnDocument: P,
        useFsAccessApi: O,
        getFilesFromEvent: _,
        validator: k,
        rejectColor: $,
        acceptColor: N,
        enablePointerEvents: I,
        loaderProps: Y,
        inputProps: X,
        mod: ee,
        ...ne
      } = n,
      te = de({
        name: "Dropzone",
        classes: Os,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: aD,
      }),
      {
        getRootProps: me,
        getInputProps: oe,
        isDragAccept: le,
        isDragReject: q,
        open: ye,
      } = C0({
        onDrop: S,
        onDropAccepted: v,
        onDropRejected: g,
        disabled: u || f,
        accept: Array.isArray(p)
          ? p.reduce((se, Oe) => ({ ...se, [Oe]: [] }), {})
          : p,
        multiple: d,
        maxSize: m,
        maxFiles: C,
        autoFocus: E,
        noClick: !R,
        noDrag: !D,
        noDragEventsBubbling: !j,
        noKeyboard: !T,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: H,
        onFileDialogCancel: F,
        onFileDialogOpen: L,
        preventDropOnDocument: P,
        useFsAccessApi: O,
        validator: k,
        ...(_ ? { getFilesFromEvent: _ } : null),
      });
    Ff(y, ye);
    const ce = !le && !q;
    return x.jsx(nD, {
      value: { accept: le, reject: q, idle: ce },
      children: x.jsxs(Z, {
        ...me(),
        ...te("root", { focusable: !0 }),
        ...ne,
        mod: [
          {
            accept: le,
            reject: q,
            idle: ce,
            loading: f,
            "activate-on-click": R,
          },
          ee,
        ],
        children: [
          x.jsx(Sd, {
            visible: f,
            overlayProps: { radius: c },
            unstyled: l,
            loaderProps: Y,
          }),
          x.jsx("input", { ...oe(X), name: b }),
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
lr.classes = Os;
lr.displayName = "@mantine/dropzone/Dropzone";
lr.Accept = oD;
lr.Idle = iD;
lr.Reject = sD;
const cD = {
    loading: !1,
    maxSize: 1 / 0,
    activateOnClick: !1,
    activateOnDrag: !0,
    dragEventsBubbling: !0,
    activateOnKeyboard: !0,
    active: !0,
    zIndex: Nr("max"),
    withinPortal: !0,
  },
  _d = Q((e, t) => {
    const n = W("DropzoneFullScreen", cD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        active: c,
        onDrop: u,
        onReject: f,
        zIndex: d,
        withinPortal: m,
        portalProps: p,
        ...h
      } = n,
      S = de({
        name: "DropzoneFullScreen",
        classes: Os,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "fullScreen",
      }),
      { resolvedClassNames: v, resolvedStyles: g } = Bs({
        classNames: r,
        styles: i,
        props: n,
      }),
      [y, b] = w.useState(0),
      [C, { open: E, close: R }] = Jy(!1),
      D = (T) => {
        var M;
        (M = T.dataTransfer) != null &&
          M.types.includes("Files") &&
          (b((B) => B + 1), E());
      },
      j = () => {
        b((T) => T - 1);
      };
    return (
      w.useEffect(() => {
        y === 0 && R();
      }, [y]),
      w.useEffect(() => {
        if (c)
          return (
            document.addEventListener("dragenter", D, !1),
            document.addEventListener("dragleave", j, !1),
            () => {
              document.removeEventListener("dragenter", D, !1),
                document.removeEventListener("dragleave", j, !1);
            }
          );
      }, [c]),
      x.jsx(ql, {
        ...p,
        withinPortal: m,
        children: x.jsx(Z, {
          ...S("fullScreen", {
            style: {
              opacity: C ? 1 : 0,
              pointerEvents: C ? "all" : "none",
              zIndex: d,
            },
          }),
          ref: t,
          children: x.jsx(lr, {
            ...h,
            classNames: v,
            styles: g,
            unstyled: l,
            className: Os.dropzone,
            onDrop: (T) => {
              u == null || u(T), R(), b(0);
            },
            onReject: (T) => {
              f == null || f(T), R(), b(0);
            },
          }),
        }),
      })
    );
  });
_d.classes = Os;
_d.displayName = "@mantine/dropzone/DropzoneFullScreen";
lr.FullScreen = _d;
const bi = lr,
  Rd = (e) => {
    const { title: t, description: n, form: r, field_id: o } = e,
      [s, i] = w.useState([]);
    r.values.files.map((a, c) =>
      x.jsxs(
        Zr,
        {
          children: [
            x.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            x.jsx(Eo, {
              size: "xs",
              onClick: () =>
                r.setFieldValue(
                  "files",
                  r.values.files.filter((u, f) => f !== c)
                ),
            }),
          ],
        },
        a.name
      )
    );
    const l = s.map((a, c) =>
      x.jsxs(
        Zr,
        {
          children: [
            x.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            x.jsx(Eo, {
              size: "xs",
              onClick: () => {
                const u = s.filter((f, d) => d !== c);
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
        x.jsx(bi, {
          h: 120,
          p: 0,
          multiple: !0,
          onDrop: (a) => {
            r.setFieldValue("files", a), i(a);
          },
          children: x.jsxs(vd, {
            h: 120,
            children: [
              x.jsx(bi.Idle, { children: "Drop files here" }),
              x.jsx(bi.Accept, { children: "Drop files here" }),
              x.jsx(bi.Reject, { children: "Files are invalid" }),
            ],
          }),
        }),
        r.errors.files &&
          x.jsx(Zr, { c: "red", mt: 5, children: r.errors.files }),
        l.length > 0 &&
          x.jsxs(x.Fragment, {
            children: [
              x.jsx(Zr, { mb: 5, mt: "md", children: "Selected files:" }),
              l,
            ],
          }),
      ],
    });
  };
Rd.defaultProps = {};
Rd.propTypes = {
  title: J.string.isRequired,
  description: J.string.isRequired,
  form: J.object.isRequired,
  field_id: J.string.isRequired,
};
const Ys = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    [i, l] = w.useState(o.at(0));
  w.useEffect(() => {
    r.setFieldValue(s, i);
  }, []);
  const a = (c) => {
    l(c.value), r.setFieldValue(s, c.value);
  };
  return x.jsx(xd, {
    label: t,
    description: n,
    data: o,
    defaultValue: o.at(0),
    onChange: (c, u) => a(u),
    searchable: !0,
  });
};
Ys.defaultProps = {};
Ys.propTypes = {
  title: J.string.isRequired,
  description: J.string.isRequired,
  form: J.object.isRequired,
  field_id: J.string.isRequired,
  options: J.array,
};
const E0 = "",
  uD = "generic",
  fD = E0 + "/profile/profile/",
  k0 = E0 + "/api/submissions/",
  dD = "https://helpdesk.gfbio.org/browse/",
  pD = (e) => {
    const { title: t, description: n, form: r, options: o, field_id: s } = e,
      i = () => {
        const l = JSON.parse(localStorage.getItem("submission")),
          a = l.broker_submission_id || "",
          c = [];
        let u = 0;
        const f = `mailto:info@gfbio.org?subject=Help with Submission ${a}&body=Dear GFBio Team,`;
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
            l.accessionId.forEach((d) => {
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
                            d.pid,
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
                            d.status,
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
                    href: dD + l.issue,
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
                  href: f,
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
  };
var _0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(Mu, function () {
    var n = 1e3,
      r = 6e4,
      o = 36e5,
      s = "millisecond",
      i = "second",
      l = "minute",
      a = "hour",
      c = "day",
      u = "week",
      f = "month",
      d = "quarter",
      m = "year",
      p = "date",
      h = "Invalid Date",
      S =
        /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
      v =
        /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
      g = {
        name: "en",
        weekdays:
          "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months:
          "January_February_March_April_May_June_July_August_September_October_November_December".split(
            "_"
          ),
        ordinal: function (F) {
          var L = ["th", "st", "nd", "rd"],
            P = F % 100;
          return "[" + F + (L[(P - 20) % 10] || L[P] || L[0]) + "]";
        },
      },
      y = function (F, L, P) {
        var O = String(F);
        return !O || O.length >= L
          ? F
          : "" + Array(L + 1 - O.length).join(P) + F;
      },
      b = {
        s: y,
        z: function (F) {
          var L = -F.utcOffset(),
            P = Math.abs(L),
            O = Math.floor(P / 60),
            _ = P % 60;
          return (L <= 0 ? "+" : "-") + y(O, 2, "0") + ":" + y(_, 2, "0");
        },
        m: function F(L, P) {
          if (L.date() < P.date()) return -F(P, L);
          var O = 12 * (P.year() - L.year()) + (P.month() - L.month()),
            _ = L.clone().add(O, f),
            k = P - _ < 0,
            $ = L.clone().add(O + (k ? -1 : 1), f);
          return +(-(O + (P - _) / (k ? _ - $ : $ - _)) || 0);
        },
        a: function (F) {
          return F < 0 ? Math.ceil(F) || 0 : Math.floor(F);
        },
        p: function (F) {
          return (
            { M: f, y: m, w: u, d: c, D: p, h: a, m: l, s: i, ms: s, Q: d }[
              F
            ] ||
            String(F || "")
              .toLowerCase()
              .replace(/s$/, "")
          );
        },
        u: function (F) {
          return F === void 0;
        },
      },
      C = "en",
      E = {};
    E[C] = g;
    var R = "$isDayjsObject",
      D = function (F) {
        return F instanceof B || !(!F || !F[R]);
      },
      j = function F(L, P, O) {
        var _;
        if (!L) return C;
        if (typeof L == "string") {
          var k = L.toLowerCase();
          E[k] && (_ = k), P && ((E[k] = P), (_ = k));
          var $ = L.split("-");
          if (!_ && $.length > 1) return F($[0]);
        } else {
          var N = L.name;
          (E[N] = L), (_ = N);
        }
        return !O && _ && (C = _), _ || (!O && C);
      },
      T = function (F, L) {
        if (D(F)) return F.clone();
        var P = typeof L == "object" ? L : {};
        return (P.date = F), (P.args = arguments), new B(P);
      },
      M = b;
    (M.l = j),
      (M.i = D),
      (M.w = function (F, L) {
        return T(F, { locale: L.$L, utc: L.$u, x: L.$x, $offset: L.$offset });
      });
    var B = (function () {
        function F(P) {
          (this.$L = j(P.locale, null, !0)),
            this.parse(P),
            (this.$x = this.$x || P.x || {}),
            (this[R] = !0);
        }
        var L = F.prototype;
        return (
          (L.parse = function (P) {
            (this.$d = (function (O) {
              var _ = O.date,
                k = O.utc;
              if (_ === null) return new Date(NaN);
              if (M.u(_)) return new Date();
              if (_ instanceof Date) return new Date(_);
              if (typeof _ == "string" && !/Z$/i.test(_)) {
                var $ = _.match(S);
                if ($) {
                  var N = $[2] - 1 || 0,
                    I = ($[7] || "0").substring(0, 3);
                  return k
                    ? new Date(
                        Date.UTC(
                          $[1],
                          N,
                          $[3] || 1,
                          $[4] || 0,
                          $[5] || 0,
                          $[6] || 0,
                          I
                        )
                      )
                    : new Date(
                        $[1],
                        N,
                        $[3] || 1,
                        $[4] || 0,
                        $[5] || 0,
                        $[6] || 0,
                        I
                      );
                }
              }
              return new Date(_);
            })(P)),
              this.init();
          }),
          (L.init = function () {
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
          (L.$utils = function () {
            return M;
          }),
          (L.isValid = function () {
            return this.$d.toString() !== h;
          }),
          (L.isSame = function (P, O) {
            var _ = T(P);
            return this.startOf(O) <= _ && _ <= this.endOf(O);
          }),
          (L.isAfter = function (P, O) {
            return T(P) < this.startOf(O);
          }),
          (L.isBefore = function (P, O) {
            return this.endOf(O) < T(P);
          }),
          (L.$g = function (P, O, _) {
            return M.u(P) ? this[O] : this.set(_, P);
          }),
          (L.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }),
          (L.valueOf = function () {
            return this.$d.getTime();
          }),
          (L.startOf = function (P, O) {
            var _ = this,
              k = !!M.u(O) || O,
              $ = M.p(P),
              N = function (oe, le) {
                var q = M.w(
                  _.$u ? Date.UTC(_.$y, le, oe) : new Date(_.$y, le, oe),
                  _
                );
                return k ? q : q.endOf(c);
              },
              I = function (oe, le) {
                return M.w(
                  _.toDate()[oe].apply(
                    _.toDate("s"),
                    (k ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(le)
                  ),
                  _
                );
              },
              Y = this.$W,
              X = this.$M,
              ee = this.$D,
              ne = "set" + (this.$u ? "UTC" : "");
            switch ($) {
              case m:
                return k ? N(1, 0) : N(31, 11);
              case f:
                return k ? N(1, X) : N(0, X + 1);
              case u:
                var te = this.$locale().weekStart || 0,
                  me = (Y < te ? Y + 7 : Y) - te;
                return N(k ? ee - me : ee + (6 - me), X);
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
          (L.endOf = function (P) {
            return this.startOf(P, !1);
          }),
          (L.$set = function (P, O) {
            var _,
              k = M.p(P),
              $ = "set" + (this.$u ? "UTC" : ""),
              N = ((_ = {}),
              (_[c] = $ + "Date"),
              (_[p] = $ + "Date"),
              (_[f] = $ + "Month"),
              (_[m] = $ + "FullYear"),
              (_[a] = $ + "Hours"),
              (_[l] = $ + "Minutes"),
              (_[i] = $ + "Seconds"),
              (_[s] = $ + "Milliseconds"),
              _)[k],
              I = k === c ? this.$D + (O - this.$W) : O;
            if (k === f || k === m) {
              var Y = this.clone().set(p, 1);
              Y.$d[N](I),
                Y.init(),
                (this.$d = Y.set(p, Math.min(this.$D, Y.daysInMonth())).$d);
            } else N && this.$d[N](I);
            return this.init(), this;
          }),
          (L.set = function (P, O) {
            return this.clone().$set(P, O);
          }),
          (L.get = function (P) {
            return this[M.p(P)]();
          }),
          (L.add = function (P, O) {
            var _,
              k = this;
            P = Number(P);
            var $ = M.p(O),
              N = function (X) {
                var ee = T(k);
                return M.w(ee.date(ee.date() + Math.round(X * P)), k);
              };
            if ($ === f) return this.set(f, this.$M + P);
            if ($ === m) return this.set(m, this.$y + P);
            if ($ === c) return N(1);
            if ($ === u) return N(7);
            var I = ((_ = {}), (_[l] = r), (_[a] = o), (_[i] = n), _)[$] || 1,
              Y = this.$d.getTime() + P * I;
            return M.w(Y, this);
          }),
          (L.subtract = function (P, O) {
            return this.add(-1 * P, O);
          }),
          (L.format = function (P) {
            var O = this,
              _ = this.$locale();
            if (!this.isValid()) return _.invalidDate || h;
            var k = P || "YYYY-MM-DDTHH:mm:ssZ",
              $ = M.z(this),
              N = this.$H,
              I = this.$m,
              Y = this.$M,
              X = _.weekdays,
              ee = _.months,
              ne = _.meridiem,
              te = function (le, q, ye, ce) {
                return (le && (le[q] || le(O, k))) || ye[q].slice(0, ce);
              },
              me = function (le) {
                return M.s(N % 12 || 12, le, "0");
              },
              oe =
                ne ||
                function (le, q, ye) {
                  var ce = le < 12 ? "AM" : "PM";
                  return ye ? ce.toLowerCase() : ce;
                };
            return k.replace(v, function (le, q) {
              return (
                q ||
                (function (ye) {
                  switch (ye) {
                    case "YY":
                      return String(O.$y).slice(-2);
                    case "YYYY":
                      return M.s(O.$y, 4, "0");
                    case "M":
                      return Y + 1;
                    case "MM":
                      return M.s(Y + 1, 2, "0");
                    case "MMM":
                      return te(_.monthsShort, Y, ee, 3);
                    case "MMMM":
                      return te(ee, Y);
                    case "D":
                      return O.$D;
                    case "DD":
                      return M.s(O.$D, 2, "0");
                    case "d":
                      return String(O.$W);
                    case "dd":
                      return te(_.weekdaysMin, O.$W, X, 2);
                    case "ddd":
                      return te(_.weekdaysShort, O.$W, X, 3);
                    case "dddd":
                      return X[O.$W];
                    case "H":
                      return String(N);
                    case "HH":
                      return M.s(N, 2, "0");
                    case "h":
                      return me(1);
                    case "hh":
                      return me(2);
                    case "a":
                      return oe(N, I, !0);
                    case "A":
                      return oe(N, I, !1);
                    case "m":
                      return String(I);
                    case "mm":
                      return M.s(I, 2, "0");
                    case "s":
                      return String(O.$s);
                    case "ss":
                      return M.s(O.$s, 2, "0");
                    case "SSS":
                      return M.s(O.$ms, 3, "0");
                    case "Z":
                      return $;
                  }
                  return null;
                })(le) ||
                $.replace(":", "")
              );
            });
          }),
          (L.utcOffset = function () {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }),
          (L.diff = function (P, O, _) {
            var k,
              $ = this,
              N = M.p(O),
              I = T(P),
              Y = (I.utcOffset() - this.utcOffset()) * r,
              X = this - I,
              ee = function () {
                return M.m($, I);
              };
            switch (N) {
              case m:
                k = ee() / 12;
                break;
              case f:
                k = ee();
                break;
              case d:
                k = ee() / 3;
                break;
              case u:
                k = (X - Y) / 6048e5;
                break;
              case c:
                k = (X - Y) / 864e5;
                break;
              case a:
                k = X / o;
                break;
              case l:
                k = X / r;
                break;
              case i:
                k = X / n;
                break;
              default:
                k = X;
            }
            return _ ? k : M.a(k);
          }),
          (L.daysInMonth = function () {
            return this.endOf(f).$D;
          }),
          (L.$locale = function () {
            return E[this.$L];
          }),
          (L.locale = function (P, O) {
            if (!P) return this.$L;
            var _ = this.clone(),
              k = j(P, O, !0);
            return k && (_.$L = k), _;
          }),
          (L.clone = function () {
            return M.w(this.$d, this);
          }),
          (L.toDate = function () {
            return new Date(this.valueOf());
          }),
          (L.toJSON = function () {
            return this.isValid() ? this.toISOString() : null;
          }),
          (L.toISOString = function () {
            return this.$d.toISOString();
          }),
          (L.toString = function () {
            return this.$d.toUTCString();
          }),
          F
        );
      })(),
      H = B.prototype;
    return (
      (T.prototype = H),
      [
        ["$ms", s],
        ["$s", i],
        ["$m", l],
        ["$H", a],
        ["$W", c],
        ["$M", f],
        ["$y", m],
        ["$D", p],
      ].forEach(function (F) {
        H[F[1]] = function (L) {
          return this.$g(L, F[0], F[1]);
        };
      }),
      (T.extend = function (F, L) {
        return F.$i || (F(L, B, T), (F.$i = !0)), T;
      }),
      (T.locale = j),
      (T.isDayjs = D),
      (T.unix = function (F) {
        return T(1e3 * F);
      }),
      (T.en = E[C]),
      (T.Ls = E),
      (T.p = {}),
      T
    );
  });
})(_0);
var mD = _0.exports;
const G = Dr(mD);
function hD({
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
function R0({
  controlsRef: e,
  direction: t,
  levelIndex: n,
  rowIndex: r,
  cellIndex: o,
  size: s,
}) {
  var a, c, u;
  const i = hD({
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
      ? R0({
          controlsRef: e,
          direction: t,
          levelIndex: i.levelIndex,
          cellIndex: i.cellIndex,
          rowIndex: i.rowIndex,
          size: s,
        })
      : l.focus());
}
function gD(e) {
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
function yD(e) {
  var t;
  return (t = e.current) == null
    ? void 0
    : t.map((n) => n.map((r) => r.length));
}
function Dd({
  controlsRef: e,
  levelIndex: t,
  rowIndex: n,
  cellIndex: r,
  event: o,
}) {
  const s = gD(o.key);
  if (s) {
    o.preventDefault();
    const i = yD(e);
    R0({
      controlsRef: e,
      direction: s,
      levelIndex: t,
      rowIndex: n,
      cellIndex: r,
      size: i,
    });
  }
}
var D0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(Mu, function () {
    var n = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 },
      r = {};
    return function (o, s, i) {
      var l,
        a = function (d, m, p) {
          p === void 0 && (p = {});
          var h = new Date(d),
            S = (function (v, g) {
              g === void 0 && (g = {});
              var y = g.timeZoneName || "short",
                b = v + "|" + y,
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
                    timeZoneName: y,
                  })),
                  (r[b] = C)),
                C
              );
            })(m, p);
          return S.formatToParts(h);
        },
        c = function (d, m) {
          for (var p = a(d, m), h = [], S = 0; S < p.length; S += 1) {
            var v = p[S],
              g = v.type,
              y = v.value,
              b = n[g];
            b >= 0 && (h[b] = parseInt(y, 10));
          }
          var C = h[3],
            E = C === 24 ? 0 : C,
            R =
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
            D = +d;
          return (i.utc(R).valueOf() - (D -= D % 1e3)) / 6e4;
        },
        u = s.prototype;
      (u.tz = function (d, m) {
        d === void 0 && (d = l);
        var p = this.utcOffset(),
          h = this.toDate(),
          S = h.toLocaleString("en-US", { timeZone: d }),
          v = Math.round((h - new Date(S)) / 1e3 / 60),
          g = i(S, { locale: this.$L })
            .$set("millisecond", this.$ms)
            .utcOffset(15 * -Math.round(h.getTimezoneOffset() / 15) - v, !0);
        if (m) {
          var y = g.utcOffset();
          g = g.add(p - y, "minute");
        }
        return (g.$x.$timezone = d), g;
      }),
        (u.offsetName = function (d) {
          var m = this.$x.$timezone || i.tz.guess(),
            p = a(this.valueOf(), m, { timeZoneName: d }).find(function (h) {
              return h.type.toLowerCase() === "timezonename";
            });
          return p && p.value;
        });
      var f = u.startOf;
      (u.startOf = function (d, m) {
        if (!this.$x || !this.$x.$timezone) return f.call(this, d, m);
        var p = i(this.format("YYYY-MM-DD HH:mm:ss:SSS"), { locale: this.$L });
        return f.call(p, d, m).tz(this.$x.$timezone, !0);
      }),
        (i.tz = function (d, m, p) {
          var h = p && m,
            S = p || m || l,
            v = c(+i(), S);
          if (typeof d != "string") return i(d).tz(S);
          var g = (function (E, R, D) {
              var j = E - 60 * R * 1e3,
                T = c(j, D);
              if (R === T) return [j, R];
              var M = c((j -= 60 * (T - R) * 1e3), D);
              return T === M
                ? [j, T]
                : [E - 60 * Math.min(T, M) * 1e3, Math.max(T, M)];
            })(i.utc(d, h).valueOf(), v, S),
            y = g[0],
            b = g[1],
            C = i(y).utcOffset(b);
          return (C.$x.$timezone = S), C;
        }),
        (i.tz.guess = function () {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }),
        (i.tz.setDefault = function (d) {
          l = d;
        });
    };
  });
})(D0);
var vD = D0.exports;
const wD = Dr(vD);
var P0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(Mu, function () {
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
      var f = a.utcOffset;
      a.utcOffset = function (h, S) {
        var v = this.$utils().u;
        if (v(h))
          return this.$u ? 0 : v(this.$offset) ? f.call(this) : this.$offset;
        if (
          typeof h == "string" &&
          ((h = (function (C) {
            C === void 0 && (C = "");
            var E = C.match(r);
            if (!E) return null;
            var R = ("" + E[0]).match(o) || ["-", 0, 0],
              D = R[0],
              j = 60 * +R[1] + +R[2];
            return j === 0 ? 0 : D === "+" ? j : -j;
          })(h)),
          h === null)
        )
          return this;
        var g = Math.abs(h) <= 16 ? 60 * h : h,
          y = this;
        if (S) return (y.$offset = g), (y.$u = h === 0), y;
        if (h !== 0) {
          var b = this.$u
            ? this.toDate().getTimezoneOffset()
            : -1 * this.utcOffset();
          ((y = this.local().add(g + b, n)).$offset = g),
            (y.$x.$localOffset = b);
        } else y = this.utc();
        return y;
      };
      var d = a.format;
      (a.format = function (h) {
        var S = h || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
        return d.call(this, S);
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
        var g = this.local(),
          y = l(h).local();
        return p.call(g, y, S, v);
      };
    };
  });
})(P0);
var SD = P0.exports;
const xD = Dr(SD);
G.extend(xD);
G.extend(wD);
function bD(e, t) {
  return t ? G(e).tz(t).utcOffset() + e.getTimezoneOffset() : 0;
}
const Jm = (e, t, n) => {
  if (!e) return null;
  if (!t) return e;
  let r = bD(e, t);
  return n === "remove" && (r *= -1), G(e).add(r, "minutes").toDate();
};
function co(e, t, n, r) {
  return r || !t
    ? t
    : Array.isArray(t)
    ? t.map((o) => Jm(o, n, e))
    : Jm(t, n, e);
}
const CD = {
    locale: "en",
    timezone: null,
    firstDayOfWeek: 1,
    weekendDays: [0, 6],
    labelSeparator: "–",
    consistentWeeks: !1,
  },
  ED = w.createContext(CD);
function Xt() {
  const e = w.useContext(ED),
    t = w.useCallback((i) => i || e.locale, [e.locale]),
    n = w.useCallback((i) => i || e.timezone || void 0, [e.timezone]),
    r = w.useCallback(
      (i) => (typeof i == "number" ? i : e.firstDayOfWeek),
      [e.firstDayOfWeek]
    ),
    o = w.useCallback(
      (i) => (Array.isArray(i) ? i : e.weekendDays),
      [e.weekendDays]
    ),
    s = w.useCallback(
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
var T0 = { day: "m_396ce5cb" };
const kD = {},
  _D = (e, { size: t }) => ({ day: { "--day-size": ze(t, "day-size") } }),
  Pd = Q((e, t) => {
    const n = W("Day", kD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        date: c,
        disabled: u,
        __staticSelector: f,
        weekend: d,
        outside: m,
        selected: p,
        renderDay: h,
        inRange: S,
        firstInRange: v,
        lastInRange: g,
        hidden: y,
        static: b,
        ...C
      } = n,
      E = de({
        name: f || "Day",
        classes: T0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: _D,
        rootSelector: "day",
      }),
      R = Xt();
    return x.jsx(vn, {
      ...E("day", { style: y ? { display: "none" } : void 0 }),
      component: b ? "div" : "button",
      ref: t,
      disabled: u,
      "data-today":
        G(c).isSame(co("add", new Date(), R.getTimezone()), "day") || void 0,
      "data-hidden": y || void 0,
      "data-disabled": u || void 0,
      "data-weekend": (!u && !m && d) || void 0,
      "data-outside": (!u && m) || void 0,
      "data-selected": (!u && p) || void 0,
      "data-in-range": (S && !u) || void 0,
      "data-first-in-range": (v && !u) || void 0,
      "data-last-in-range": (g && !u) || void 0,
      "data-static": b || void 0,
      unstyled: l,
      ...C,
      children: (h == null ? void 0 : h(c)) || c.getDate(),
    });
  });
Pd.classes = T0;
Pd.displayName = "@mantine/dates/Day";
function RD({ locale: e, format: t = "dd", firstDayOfWeek: n = 1 }) {
  const r = G().day(n),
    o = [];
  for (let s = 0; s < 7; s += 1)
    typeof t == "string"
      ? o.push(G(r).add(s, "days").locale(e).format(t))
      : o.push(t(G(r).add(s, "days").toDate()));
  return o;
}
var O0 = { weekday: "m_18a3eca" };
const DD = {},
  PD = (e, { size: t }) => ({
    weekdaysRow: { "--wr-fz": tt(t), "--wr-spacing": Ul(t) },
  }),
  Td = Q((e, t) => {
    const n = W("WeekdaysRow", DD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        locale: c,
        firstDayOfWeek: u,
        weekdayFormat: f,
        cellComponent: d = "th",
        __staticSelector: m,
        ...p
      } = n,
      h = de({
        name: m || "WeekdaysRow",
        classes: O0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: PD,
        rootSelector: "weekdaysRow",
      }),
      S = Xt(),
      v = RD({
        locale: S.getLocale(c),
        format: f,
        firstDayOfWeek: S.getFirstDayOfWeek(u),
      }).map((g, y) => x.jsx(d, { ...h("weekday"), children: g }, y));
    return x.jsx(Z, {
      component: "tr",
      ref: t,
      ...h("weekdaysRow"),
      ...p,
      children: v,
    });
  });
Td.classes = O0;
Td.displayName = "@mantine/dates/WeekdaysRow";
function TD(e, t = 1) {
  const n = new Date(e),
    r = t === 0 ? 6 : t - 1;
  for (; n.getDay() !== r; ) n.setDate(n.getDate() + 1);
  return n;
}
function OD(e, t = 1) {
  const n = new Date(e);
  for (; n.getDay() !== t; ) n.setDate(n.getDate() - 1);
  return n;
}
function ND({ month: e, firstDayOfWeek: t = 1, consistentWeeks: n }) {
  const r = e.getMonth(),
    o = new Date(e.getFullYear(), r, 1),
    s = new Date(e.getFullYear(), e.getMonth() + 1, 0),
    i = TD(s, t),
    l = OD(o, t),
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
      f = new Date(u);
    for (f.setDate(f.getDate() + 1); a.length < 6; ) {
      const d = [];
      for (let m = 0; m < 7; m += 1)
        d.push(new Date(f)), f.setDate(f.getDate() + 1);
      a.push(d);
    }
  }
  return a;
}
function N0(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth();
}
function $0(e, t) {
  return t instanceof Date ? G(e).isAfter(G(t).subtract(1, "day"), "day") : !0;
}
function L0(e, t) {
  return t instanceof Date ? G(e).isBefore(G(t).add(1, "day"), "day") : !0;
}
function $D(e, t, n, r, o, s, i) {
  const l = e.flat().filter((u) => {
      var f;
      return (
        L0(u, n) &&
        $0(u, t) &&
        !(o != null && o(u)) &&
        !((f = r == null ? void 0 : r(u)) != null && f.disabled) &&
        (!s || N0(u, i))
      );
    }),
    a = l.find((u) => {
      var f;
      return (f = r == null ? void 0 : r(u)) == null ? void 0 : f.selected;
    });
  if (a) return a;
  const c = l.find((u) => G().isSame(u, "date"));
  return c || l[0];
}
var j0 = { month: "m_cc9820d3", monthCell: "m_8f457cd5" };
const LD = { withCellSpacing: !0 },
  ua = Q((e, t) => {
    const n = W("Month", LD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        locale: u,
        firstDayOfWeek: f,
        weekdayFormat: d,
        month: m,
        weekendDays: p,
        getDayProps: h,
        excludeDate: S,
        minDate: v,
        maxDate: g,
        renderDay: y,
        hideOutsideDates: b,
        hideWeekdays: C,
        getDayAriaLabel: E,
        static: R,
        __getDayRef: D,
        __onDayKeyDown: j,
        __onDayClick: T,
        __onDayMouseEnter: M,
        __preventFocus: B,
        __stopPropagation: H,
        withCellSpacing: F,
        size: L,
        ...P
      } = n,
      O = de({
        name: c || "Month",
        classes: j0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "month",
      }),
      _ = Xt(),
      k = ND({
        month: m,
        firstDayOfWeek: _.getFirstDayOfWeek(f),
        consistentWeeks: _.consistentWeeks,
      }),
      $ = $D(k, v, g, h, S, b, m),
      { resolvedClassNames: N, resolvedStyles: I } = Bs({
        classNames: r,
        styles: i,
        props: n,
      }),
      Y = k.map((X, ee) => {
        const ne = X.map((te, me) => {
          const oe = !N0(te, m),
            le =
              (E == null ? void 0 : E(te)) ||
              G(te)
                .locale(u || _.locale)
                .format("D MMMM YYYY"),
            q = h == null ? void 0 : h(te),
            ye = G(te).isSame($, "date");
          return x.jsx(
            "td",
            {
              ...O("monthCell"),
              "data-with-spacing": F || void 0,
              children: x.jsx(Pd, {
                __staticSelector: c || "Month",
                classNames: N,
                styles: I,
                unstyled: l,
                "data-mantine-stop-propagation": H || void 0,
                renderDay: y,
                date: te,
                size: L,
                weekend: _.getWeekendDays(p).includes(te.getDay()),
                outside: oe,
                hidden: b ? oe : !1,
                "aria-label": le,
                static: R,
                disabled:
                  (S == null ? void 0 : S(te)) || !L0(te, g) || !$0(te, v),
                ref: (ce) => (D == null ? void 0 : D(ee, me, ce)),
                ...q,
                onKeyDown: (ce) => {
                  var se;
                  (se = q == null ? void 0 : q.onKeyDown) == null ||
                    se.call(q, ce),
                    j == null ||
                      j(ce, { rowIndex: ee, cellIndex: me, date: te });
                },
                onMouseEnter: (ce) => {
                  var se;
                  (se = q == null ? void 0 : q.onMouseEnter) == null ||
                    se.call(q, ce),
                    M == null || M(ce, te);
                },
                onClick: (ce) => {
                  var se;
                  (se = q == null ? void 0 : q.onClick) == null ||
                    se.call(q, ce),
                    T == null || T(ce, te);
                },
                onMouseDown: (ce) => {
                  var se;
                  (se = q == null ? void 0 : q.onMouseDown) == null ||
                    se.call(q, ce),
                    B && ce.preventDefault();
                },
                tabIndex: B || !ye ? -1 : 0,
              }),
            },
            te.toString()
          );
        });
        return x.jsx("tr", { ...O("monthRow"), children: ne }, ee);
      });
    return x.jsxs(Z, {
      component: "table",
      ...O("month"),
      size: L,
      ref: t,
      ...P,
      children: [
        !C &&
          x.jsx("thead", {
            ...O("monthThead"),
            children: x.jsx(Td, {
              __staticSelector: c || "Month",
              locale: u,
              firstDayOfWeek: f,
              weekdayFormat: d,
              size: L,
              classNames: N,
              styles: I,
              unstyled: l,
            }),
          }),
        x.jsx("tbody", { ...O("monthTbody"), children: Y }),
      ],
    });
  });
ua.classes = j0;
ua.displayName = "@mantine/dates/Month";
var A0 = { pickerControl: "m_dc6a3c71" };
const jD = {},
  AD = (e, { size: t }) => ({
    pickerControl: { "--dpc-fz": tt(t), "--dpc-size": ze(t, "dpc-size") },
  }),
  fa = Q((e, t) => {
    const n = W("PickerControl", jD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        firstInRange: c,
        lastInRange: u,
        inRange: f,
        __staticSelector: d,
        selected: m,
        disabled: p,
        ...h
      } = n,
      S = de({
        name: d || "PickerControl",
        classes: A0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: AD,
        rootSelector: "pickerControl",
      });
    return x.jsx(vn, {
      ...S("pickerControl"),
      ref: t,
      unstyled: l,
      "data-picker-control": !0,
      "data-selected": (m && !p) || void 0,
      "data-disabled": p || void 0,
      "data-in-range": (f && !p && !m) || void 0,
      "data-first-in-range": (c && !p) || void 0,
      "data-last-in-range": (u && !p) || void 0,
      disabled: p,
      ...h,
    });
  });
fa.classes = A0;
fa.displayName = "@mantine/dates/PickerControl";
function F0(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && G(e).isBefore(t, "year")) || (n && G(e).isAfter(n, "year")));
}
function FD(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !F0(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => G().isSame(l, "year"));
  return i || o[0];
}
function M0(e) {
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
var z0 = { yearsList: "m_9206547b", yearsListCell: "m_c5a19c7d" };
const MD = { yearsListFormat: "YYYY", withCellSpacing: !0 },
  da = Q((e, t) => {
    const n = W("YearsList", MD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        decade: c,
        yearsListFormat: u,
        locale: f,
        minDate: d,
        maxDate: m,
        getYearControlProps: p,
        __staticSelector: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: g,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: R,
        ...D
      } = n,
      j = de({
        name: h || "YearsList",
        classes: z0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "yearsList",
      }),
      T = Xt(),
      M = M0(c),
      B = FD(M, d, m, p),
      H = M.map((F, L) => {
        const P = F.map((O, _) => {
          const k = p == null ? void 0 : p(O),
            $ = G(O).isSame(B, "year");
          return x.jsx(
            "td",
            {
              ...j("yearsListCell"),
              "data-with-spacing": E || void 0,
              children: x.jsx(fa, {
                ...j("yearsListControl"),
                size: R,
                unstyled: l,
                "data-mantine-stop-propagation": C || void 0,
                disabled: F0(O, d, m),
                ref: (N) => (S == null ? void 0 : S(L, _, N)),
                ...k,
                onKeyDown: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, N),
                    v == null || v(N, { rowIndex: L, cellIndex: _, date: O });
                },
                onClick: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, N),
                    g == null || g(N, O);
                },
                onMouseEnter: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, N),
                    y == null || y(N, O);
                },
                onMouseDown: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, N),
                    b && N.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: G(O).locale(T.getLocale(f)).format(u),
              }),
            },
            _
          );
        });
        return x.jsx("tr", { ...j("yearsListRow"), children: P }, L);
      });
    return x.jsx(Z, {
      component: "table",
      ref: t,
      size: R,
      ...j("yearsList"),
      ...D,
      children: x.jsx("tbody", { children: H }),
    });
  });
da.classes = z0;
da.displayName = "@mantine/dates/YearsList";
function I0(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && G(e).isBefore(t, "month")) || (n && G(e).isAfter(n, "month")));
}
function zD(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !I0(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => G().isSame(l, "month"));
  return i || o[0];
}
function ID(e) {
  const t = G(e).startOf("year").toDate(),
    n = [[], [], [], []];
  let r = 0;
  for (let o = 0; o < 4; o += 1)
    for (let s = 0; s < 3; s += 1)
      n[o].push(G(t).add(r, "months").toDate()), (r += 1);
  return n;
}
var B0 = { monthsList: "m_2a6c32d", monthsListCell: "m_fe27622f" };
const BD = { monthsListFormat: "MMM", withCellSpacing: !0 },
  pa = Q((e, t) => {
    const n = W("MonthsList", BD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        __staticSelector: c,
        year: u,
        monthsListFormat: f,
        locale: d,
        minDate: m,
        maxDate: p,
        getMonthControlProps: h,
        __getControlRef: S,
        __onControlKeyDown: v,
        __onControlClick: g,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: R,
        ...D
      } = n,
      j = de({
        name: c || "MonthsList",
        classes: B0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "monthsList",
      }),
      T = Xt(),
      M = ID(u),
      B = zD(M, m, p, h),
      H = M.map((F, L) => {
        const P = F.map((O, _) => {
          const k = h == null ? void 0 : h(O),
            $ = G(O).isSame(B, "month");
          return x.jsx(
            "td",
            {
              ...j("monthsListCell"),
              "data-with-spacing": E || void 0,
              children: x.jsx(fa, {
                ...j("monthsListControl"),
                size: R,
                unstyled: l,
                __staticSelector: c || "MonthsList",
                "data-mantine-stop-propagation": C || void 0,
                disabled: I0(O, m, p),
                ref: (N) => (S == null ? void 0 : S(L, _, N)),
                ...k,
                onKeyDown: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, N),
                    v == null || v(N, { rowIndex: L, cellIndex: _, date: O });
                },
                onClick: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, N),
                    g == null || g(N, O);
                },
                onMouseEnter: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, N),
                    y == null || y(N, O);
                },
                onMouseDown: (N) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, N),
                    b && N.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: G(O).locale(T.getLocale(d)).format(f),
              }),
            },
            _
          );
        });
        return x.jsx("tr", { ...j("monthsListRow"), children: P }, L);
      });
    return x.jsx(Z, {
      component: "table",
      ref: t,
      size: R,
      ...j("monthsList"),
      ...D,
      children: x.jsx("tbody", { children: H }),
    });
  });
pa.classes = B0;
pa.displayName = "@mantine/dates/MonthsList";
var V0 = {
  calendarHeader: "m_730a79ed",
  calendarHeaderLevel: "m_f6645d97",
  calendarHeaderControl: "m_2351eeb0",
  calendarHeaderControlIcon: "m_367dc749",
};
const VD = {
    nextDisabled: !1,
    previousDisabled: !1,
    hasNextLevel: !0,
    withNext: !0,
    withPrevious: !0,
  },
  HD = (e, { size: t }) => ({
    calendarHeader: {
      "--dch-control-size": ze(t, "dch-control-size"),
      "--dch-fz": tt(t),
    },
  }),
  ar = Q((e, t) => {
    const n = W("CalendarHeader", VD, e),
      {
        classNames: r,
        className: o,
        style: s,
        styles: i,
        unstyled: l,
        vars: a,
        nextIcon: c,
        previousIcon: u,
        nextLabel: f,
        previousLabel: d,
        onNext: m,
        onPrevious: p,
        onLevelClick: h,
        label: S,
        nextDisabled: v,
        previousDisabled: g,
        hasNextLevel: y,
        levelControlAriaLabel: b,
        withNext: C,
        withPrevious: E,
        __staticSelector: R,
        __preventFocus: D,
        __stopPropagation: j,
        ...T
      } = n,
      M = de({
        name: R || "CalendarHeader",
        classes: V0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: HD,
        rootSelector: "calendarHeader",
      }),
      B = D ? (H) => H.preventDefault() : void 0;
    return x.jsxs(Z, {
      ...M("calendarHeader"),
      ref: t,
      ...T,
      children: [
        E &&
          x.jsx(vn, {
            ...M("calendarHeaderControl"),
            "data-direction": "previous",
            "aria-label": d,
            onClick: p,
            unstyled: l,
            onMouseDown: B,
            disabled: g,
            "data-disabled": g || void 0,
            tabIndex: D || g ? -1 : 0,
            "data-mantine-stop-propagation": j || void 0,
            children:
              u ||
              x.jsx(Su, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "previous",
                size: "45%",
              }),
          }),
        x.jsx(vn, {
          component: y ? "button" : "div",
          ...M("calendarHeaderLevel"),
          onClick: y ? h : void 0,
          unstyled: l,
          onMouseDown: y ? B : void 0,
          disabled: !y,
          "data-static": !y || void 0,
          "aria-label": b,
          tabIndex: D || !y ? -1 : 0,
          "data-mantine-stop-propagation": j || void 0,
          children: S,
        }),
        C &&
          x.jsx(vn, {
            ...M("calendarHeaderControl"),
            "data-direction": "next",
            "aria-label": f,
            onClick: m,
            unstyled: l,
            onMouseDown: B,
            disabled: v,
            "data-disabled": v || void 0,
            tabIndex: D || v ? -1 : 0,
            "data-mantine-stop-propagation": j || void 0,
            children:
              c ||
              x.jsx(Su, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "next",
                size: "45%",
              }),
          }),
      ],
    });
  });
ar.classes = V0;
ar.displayName = "@mantine/dates/CalendarHeader";
function UD(e) {
  const t = M0(e);
  return [t[0][0], t[3][0]];
}
const WD = { decadeLabelFormat: "YYYY" },
  ma = Q((e, t) => {
    const n = W("DecadeLevel", WD, e),
      {
        decade: r,
        locale: o,
        minDate: s,
        maxDate: i,
        yearsListFormat: l,
        getYearControlProps: a,
        __getControlRef: c,
        __onControlKeyDown: u,
        __onControlClick: f,
        __onControlMouseEnter: d,
        withCellSpacing: m,
        __preventFocus: p,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: g,
        onNext: y,
        onPrevious: b,
        nextDisabled: C,
        previousDisabled: E,
        levelControlAriaLabel: R,
        withNext: D,
        withPrevious: j,
        decadeLabelFormat: T,
        classNames: M,
        styles: B,
        unstyled: H,
        __staticSelector: F,
        __stopPropagation: L,
        size: P,
        ...O
      } = n,
      _ = Xt(),
      [k, $] = UD(r),
      N = {
        __staticSelector: F || "DecadeLevel",
        classNames: M,
        styles: B,
        unstyled: H,
        size: P,
      },
      I = typeof C == "boolean" ? C : i ? !G($).endOf("year").isBefore(i) : !1,
      Y = typeof E == "boolean" ? E : s ? !G(k).startOf("year").isAfter(s) : !1,
      X = (ee, ne) =>
        G(ee)
          .locale(o || _.locale)
          .format(ne);
    return x.jsxs(Z, {
      "data-decade-level": !0,
      size: P,
      ref: t,
      ...O,
      children: [
        x.jsx(ar, {
          label: typeof T == "function" ? T(k, $) : `${X(k, T)} – ${X($, T)}`,
          __preventFocus: p,
          __stopPropagation: L,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: g,
          onNext: y,
          onPrevious: b,
          nextDisabled: I,
          previousDisabled: Y,
          hasNextLevel: !1,
          levelControlAriaLabel: R,
          withNext: D,
          withPrevious: j,
          ...N,
        }),
        x.jsx(da, {
          decade: r,
          locale: o,
          minDate: s,
          maxDate: i,
          yearsListFormat: l,
          getYearControlProps: a,
          __getControlRef: c,
          __onControlKeyDown: u,
          __onControlClick: f,
          __onControlMouseEnter: d,
          __preventFocus: p,
          __stopPropagation: L,
          withCellSpacing: m,
          ...N,
        }),
      ],
    });
  });
ma.classes = { ...da.classes, ...ar.classes };
ma.displayName = "@mantine/dates/DecadeLevel";
const YD = { yearLabelFormat: "YYYY" },
  ha = Q((e, t) => {
    const n = W("YearLevel", YD, e),
      {
        year: r,
        locale: o,
        minDate: s,
        maxDate: i,
        monthsListFormat: l,
        getMonthControlProps: a,
        __getControlRef: c,
        __onControlKeyDown: u,
        __onControlClick: f,
        __onControlMouseEnter: d,
        withCellSpacing: m,
        __preventFocus: p,
        nextIcon: h,
        previousIcon: S,
        nextLabel: v,
        previousLabel: g,
        onNext: y,
        onPrevious: b,
        onLevelClick: C,
        nextDisabled: E,
        previousDisabled: R,
        hasNextLevel: D,
        levelControlAriaLabel: j,
        withNext: T,
        withPrevious: M,
        yearLabelFormat: B,
        __staticSelector: H,
        __stopPropagation: F,
        size: L,
        classNames: P,
        styles: O,
        unstyled: _,
        ...k
      } = n,
      $ = Xt(),
      N = {
        __staticSelector: H || "YearLevel",
        classNames: P,
        styles: O,
        unstyled: _,
        size: L,
      },
      I = typeof E == "boolean" ? E : i ? !G(r).endOf("year").isBefore(i) : !1,
      Y = typeof R == "boolean" ? R : s ? !G(r).startOf("year").isAfter(s) : !1;
    return x.jsxs(Z, {
      "data-year-level": !0,
      size: L,
      ref: t,
      ...k,
      children: [
        x.jsx(ar, {
          label:
            typeof B == "function"
              ? B(r)
              : G(r)
                  .locale(o || $.locale)
                  .format(B),
          __preventFocus: p,
          __stopPropagation: F,
          nextIcon: h,
          previousIcon: S,
          nextLabel: v,
          previousLabel: g,
          onNext: y,
          onPrevious: b,
          onLevelClick: C,
          nextDisabled: I,
          previousDisabled: Y,
          hasNextLevel: D,
          levelControlAriaLabel: j,
          withNext: T,
          withPrevious: M,
          ...N,
        }),
        x.jsx(pa, {
          year: r,
          locale: o,
          minDate: s,
          maxDate: i,
          monthsListFormat: l,
          getMonthControlProps: a,
          __getControlRef: c,
          __onControlKeyDown: u,
          __onControlClick: f,
          __onControlMouseEnter: d,
          __preventFocus: p,
          __stopPropagation: F,
          withCellSpacing: m,
          ...N,
        }),
      ],
    });
  });
ha.classes = { ...ar.classes, ...pa.classes };
ha.displayName = "@mantine/dates/YearLevel";
const KD = { monthLabelFormat: "MMMM YYYY" },
  ga = Q((e, t) => {
    const n = W("MonthLevel", KD, e),
      {
        month: r,
        locale: o,
        firstDayOfWeek: s,
        weekdayFormat: i,
        weekendDays: l,
        getDayProps: a,
        excludeDate: c,
        minDate: u,
        maxDate: f,
        renderDay: d,
        hideOutsideDates: m,
        hideWeekdays: p,
        getDayAriaLabel: h,
        __getDayRef: S,
        __onDayKeyDown: v,
        __onDayClick: g,
        __onDayMouseEnter: y,
        withCellSpacing: b,
        __preventFocus: C,
        __stopPropagation: E,
        nextIcon: R,
        previousIcon: D,
        nextLabel: j,
        previousLabel: T,
        onNext: M,
        onPrevious: B,
        onLevelClick: H,
        nextDisabled: F,
        previousDisabled: L,
        hasNextLevel: P,
        levelControlAriaLabel: O,
        withNext: _,
        withPrevious: k,
        monthLabelFormat: $,
        classNames: N,
        styles: I,
        unstyled: Y,
        __staticSelector: X,
        size: ee,
        static: ne,
        ...te
      } = n,
      me = Xt(),
      oe = {
        __staticSelector: X || "MonthLevel",
        classNames: N,
        styles: I,
        unstyled: Y,
        size: ee,
      },
      le =
        typeof F == "boolean" ? F : f ? !G(r).endOf("month").isBefore(f) : !1,
      q =
        typeof L == "boolean" ? L : u ? !G(r).startOf("month").isAfter(u) : !1;
    return x.jsxs(Z, {
      "data-month-level": !0,
      size: ee,
      ref: t,
      ...te,
      children: [
        x.jsx(ar, {
          label:
            typeof $ == "function"
              ? $(r)
              : G(r)
                  .locale(o || me.locale)
                  .format($),
          __preventFocus: C,
          __stopPropagation: E,
          nextIcon: R,
          previousIcon: D,
          nextLabel: j,
          previousLabel: T,
          onNext: M,
          onPrevious: B,
          onLevelClick: H,
          nextDisabled: le,
          previousDisabled: q,
          hasNextLevel: P,
          levelControlAriaLabel: O,
          withNext: _,
          withPrevious: k,
          ...oe,
        }),
        x.jsx(ua, {
          month: r,
          locale: o,
          firstDayOfWeek: s,
          weekdayFormat: i,
          weekendDays: l,
          getDayProps: a,
          excludeDate: c,
          minDate: u,
          maxDate: f,
          renderDay: d,
          hideOutsideDates: m,
          hideWeekdays: p,
          getDayAriaLabel: h,
          __getDayRef: S,
          __onDayKeyDown: v,
          __onDayClick: g,
          __onDayMouseEnter: y,
          __preventFocus: C,
          __stopPropagation: E,
          static: ne,
          withCellSpacing: b,
          ...oe,
        }),
      ],
    });
  });
ga.classes = { ...ua.classes, ...ar.classes };
ga.displayName = "@mantine/dates/MonthLevel";
var H0 = { levelsGroup: "m_30b26e33" };
const GD = {},
  cr = Q((e, t) => {
    const n = W("LevelsGroup", GD, e),
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
      f = de({
        name: c || "LevelsGroup",
        classes: H0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "levelsGroup",
      });
    return x.jsx(Z, { ref: t, ...f("levelsGroup"), ...u });
  });
cr.classes = H0;
cr.displayName = "@mantine/dates/LevelsGroup";
const XD = { numberOfColumns: 1 },
  ya = Q((e, t) => {
    const n = W("DecadeLevelGroup", XD, e),
      {
        decade: r,
        locale: o,
        minDate: s,
        maxDate: i,
        yearsListFormat: l,
        getYearControlProps: a,
        __onControlClick: c,
        __onControlMouseEnter: u,
        withCellSpacing: f,
        __preventFocus: d,
        nextIcon: m,
        previousIcon: p,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: g,
        nextDisabled: y,
        previousDisabled: b,
        classNames: C,
        styles: E,
        unstyled: R,
        __staticSelector: D,
        __stopPropagation: j,
        numberOfColumns: T,
        levelControlAriaLabel: M,
        decadeLabelFormat: B,
        size: H,
        vars: F,
        ...L
      } = n,
      P = w.useRef([]),
      O = Array(T)
        .fill(0)
        .map((_, k) => {
          const $ = G(r)
            .add(k * 10, "years")
            .toDate();
          return x.jsx(
            ma,
            {
              size: H,
              yearsListFormat: l,
              decade: $,
              withNext: k === T - 1,
              withPrevious: k === 0,
              decadeLabelFormat: B,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (N, I) =>
                Dd({
                  levelIndex: k,
                  rowIndex: I.rowIndex,
                  cellIndex: I.cellIndex,
                  event: N,
                  controlsRef: P,
                }),
              __getControlRef: (N, I, Y) => {
                Array.isArray(P.current[k]) || (P.current[k] = []),
                  Array.isArray(P.current[k][N]) || (P.current[k][N] = []),
                  (P.current[k][N][I] = Y);
              },
              levelControlAriaLabel: typeof M == "function" ? M($) : M,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: d,
              __stopPropagation: j,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: g,
              nextDisabled: y,
              previousDisabled: b,
              getYearControlProps: a,
              __staticSelector: D || "DecadeLevelGroup",
              classNames: C,
              styles: E,
              unstyled: R,
              withCellSpacing: f,
            },
            k
          );
        });
    return x.jsx(cr, {
      classNames: C,
      styles: E,
      __staticSelector: D || "DecadeLevelGroup",
      ref: t,
      size: H,
      unstyled: R,
      ...L,
      children: O,
    });
  });
ya.classes = { ...cr.classes, ...ma.classes };
ya.displayName = "@mantine/dates/DecadeLevelGroup";
const qD = { numberOfColumns: 1 },
  va = Q((e, t) => {
    const n = W("YearLevelGroup", qD, e),
      {
        year: r,
        locale: o,
        minDate: s,
        maxDate: i,
        monthsListFormat: l,
        getMonthControlProps: a,
        __onControlClick: c,
        __onControlMouseEnter: u,
        withCellSpacing: f,
        __preventFocus: d,
        nextIcon: m,
        previousIcon: p,
        nextLabel: h,
        previousLabel: S,
        onNext: v,
        onPrevious: g,
        onLevelClick: y,
        nextDisabled: b,
        previousDisabled: C,
        hasNextLevel: E,
        classNames: R,
        styles: D,
        unstyled: j,
        __staticSelector: T,
        __stopPropagation: M,
        numberOfColumns: B,
        levelControlAriaLabel: H,
        yearLabelFormat: F,
        size: L,
        vars: P,
        ...O
      } = n,
      _ = w.useRef([]),
      k = Array(B)
        .fill(0)
        .map(($, N) => {
          const I = G(r).add(N, "years").toDate();
          return x.jsx(
            ha,
            {
              size: L,
              monthsListFormat: l,
              year: I,
              withNext: N === B - 1,
              withPrevious: N === 0,
              yearLabelFormat: F,
              __stopPropagation: M,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (Y, X) =>
                Dd({
                  levelIndex: N,
                  rowIndex: X.rowIndex,
                  cellIndex: X.cellIndex,
                  event: Y,
                  controlsRef: _,
                }),
              __getControlRef: (Y, X, ee) => {
                Array.isArray(_.current[N]) || (_.current[N] = []),
                  Array.isArray(_.current[N][Y]) || (_.current[N][Y] = []),
                  (_.current[N][Y][X] = ee);
              },
              levelControlAriaLabel: typeof H == "function" ? H(I) : H,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: d,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: S,
              onNext: v,
              onPrevious: g,
              onLevelClick: y,
              nextDisabled: b,
              previousDisabled: C,
              hasNextLevel: E,
              getMonthControlProps: a,
              classNames: R,
              styles: D,
              unstyled: j,
              __staticSelector: T || "YearLevelGroup",
              withCellSpacing: f,
            },
            N
          );
        });
    return x.jsx(cr, {
      classNames: R,
      styles: D,
      __staticSelector: T || "YearLevelGroup",
      ref: t,
      size: L,
      unstyled: j,
      ...O,
      children: k,
    });
  });
va.classes = { ...ha.classes, ...cr.classes };
va.displayName = "@mantine/dates/YearLevelGroup";
const QD = { numberOfColumns: 1 },
  wa = Q((e, t) => {
    const n = W("MonthLevelGroup", QD, e),
      {
        month: r,
        locale: o,
        firstDayOfWeek: s,
        weekdayFormat: i,
        weekendDays: l,
        getDayProps: a,
        excludeDate: c,
        minDate: u,
        maxDate: f,
        renderDay: d,
        hideOutsideDates: m,
        hideWeekdays: p,
        getDayAriaLabel: h,
        __onDayClick: S,
        __onDayMouseEnter: v,
        withCellSpacing: g,
        __preventFocus: y,
        nextIcon: b,
        previousIcon: C,
        nextLabel: E,
        previousLabel: R,
        onNext: D,
        onPrevious: j,
        onLevelClick: T,
        nextDisabled: M,
        previousDisabled: B,
        hasNextLevel: H,
        classNames: F,
        styles: L,
        unstyled: P,
        numberOfColumns: O,
        levelControlAriaLabel: _,
        monthLabelFormat: k,
        __staticSelector: $,
        __stopPropagation: N,
        size: I,
        static: Y,
        vars: X,
        ...ee
      } = n,
      ne = w.useRef([]),
      te = Array(O)
        .fill(0)
        .map((me, oe) => {
          const le = G(r).add(oe, "months").toDate();
          return x.jsx(
            ga,
            {
              month: le,
              withNext: oe === O - 1,
              withPrevious: oe === 0,
              monthLabelFormat: k,
              __stopPropagation: N,
              __onDayClick: S,
              __onDayMouseEnter: v,
              __onDayKeyDown: (q, ye) =>
                Dd({
                  levelIndex: oe,
                  rowIndex: ye.rowIndex,
                  cellIndex: ye.cellIndex,
                  event: q,
                  controlsRef: ne,
                }),
              __getDayRef: (q, ye, ce) => {
                Array.isArray(ne.current[oe]) || (ne.current[oe] = []),
                  Array.isArray(ne.current[oe][q]) || (ne.current[oe][q] = []),
                  (ne.current[oe][q][ye] = ce);
              },
              levelControlAriaLabel: typeof _ == "function" ? _(le) : _,
              locale: o,
              firstDayOfWeek: s,
              weekdayFormat: i,
              weekendDays: l,
              getDayProps: a,
              excludeDate: c,
              minDate: u,
              maxDate: f,
              renderDay: d,
              hideOutsideDates: m,
              hideWeekdays: p,
              getDayAriaLabel: h,
              __preventFocus: y,
              nextIcon: b,
              previousIcon: C,
              nextLabel: E,
              previousLabel: R,
              onNext: D,
              onPrevious: j,
              onLevelClick: T,
              nextDisabled: M,
              previousDisabled: B,
              hasNextLevel: H,
              classNames: F,
              styles: L,
              unstyled: P,
              __staticSelector: $ || "MonthLevelGroup",
              size: I,
              static: Y,
              withCellSpacing: g,
            },
            oe
          );
        });
    return x.jsx(cr, {
      classNames: F,
      styles: L,
      __staticSelector: $ || "MonthLevelGroup",
      ref: t,
      size: I,
      ...ee,
      children: te,
    });
  });
wa.classes = { ...cr.classes, ...ga.classes };
wa.displayName = "@mantine/dates/MonthLevelGroup";
const Zm = (e) => (e === "range" ? [null, null] : e === "multiple" ? [] : null);
function U0({
  type: e,
  value: t,
  defaultValue: n,
  onChange: r,
  applyTimezone: o = !0,
}) {
  const s = w.useRef(e),
    i = Xt(),
    [l, a, c] = So({
      value: co("add", t, i.getTimezone(), !o),
      defaultValue: co("add", n, i.getTimezone(), !o),
      finalValue: Zm(e),
      onChange: (f) => {
        r == null || r(co("remove", f, i.getTimezone(), !o));
      },
    });
  let u = l;
  return (
    s.current !== e &&
      ((s.current = e), t === void 0 && ((u = n !== void 0 ? n : Zm(e)), a(u))),
    [u, a, c]
  );
}
function mc(e, t) {
  return e ? (e === "month" ? 0 : e === "year" ? 1 : 2) : t || 0;
}
function JD(e) {
  return e === 0 ? "month" : e === 1 ? "year" : "decade";
}
function Xo(e, t, n) {
  return JD(Kx(mc(e, 0), mc(t, 0), mc(n, 2)));
}
const ZD = {
    maxLevel: "decade",
    minLevel: "month",
    __updateDateOnYearSelect: !0,
    __updateDateOnMonthSelect: !0,
  },
  Sa = Q((e, t) => {
    const n = W("Calendar", ZD, e),
      {
        vars: r,
        maxLevel: o,
        minLevel: s,
        defaultLevel: i,
        level: l,
        onLevelChange: a,
        date: c,
        defaultDate: u,
        onDateChange: f,
        numberOfColumns: d,
        columnsToScroll: m,
        ariaLabels: p,
        onYearSelect: h,
        onMonthSelect: S,
        onYearMouseEnter: v,
        onMonthMouseEnter: g,
        __updateDateOnYearSelect: y,
        __updateDateOnMonthSelect: b,
        firstDayOfWeek: C,
        weekdayFormat: E,
        weekendDays: R,
        getDayProps: D,
        excludeDate: j,
        renderDay: T,
        hideOutsideDates: M,
        hideWeekdays: B,
        getDayAriaLabel: H,
        monthLabelFormat: F,
        nextIcon: L,
        previousIcon: P,
        __onDayClick: O,
        __onDayMouseEnter: _,
        withCellSpacing: k,
        monthsListFormat: $,
        getMonthControlProps: N,
        yearLabelFormat: I,
        yearsListFormat: Y,
        getYearControlProps: X,
        decadeLabelFormat: ee,
        classNames: ne,
        styles: te,
        unstyled: me,
        minDate: oe,
        maxDate: le,
        locale: q,
        __staticSelector: ye,
        size: ce,
        __preventFocus: se,
        __stopPropagation: Oe,
        onNextDecade: qe,
        onPreviousDecade: xe,
        onNextYear: gt,
        onPreviousYear: At,
        onNextMonth: Ie,
        onPreviousMonth: U,
        static: re,
        __timezoneApplied: ae,
        ...ke
      } = n,
      { resolvedClassNames: je, resolvedStyles: Qt } = Bs({
        classNames: ne,
        styles: te,
        props: n,
      }),
      [_e, Ae] = So({
        value: l ? Xo(l, s, o) : void 0,
        defaultValue: i ? Xo(i, s, o) : void 0,
        finalValue: Xo(void 0, s, o),
        onChange: a,
      }),
      [Tn, st] = U0({
        type: "default",
        value: c,
        defaultValue: u,
        onChange: f,
        applyTimezone: !ae,
      }),
      fn = {
        __staticSelector: ye || "Calendar",
        styles: Qt,
        classNames: je,
        unstyled: me,
        size: ce,
      },
      Fo = Xt(),
      On = m || d || 1,
      dn = Tn || co("add", new Date(), Fo.getTimezone()),
      E1 = () => {
        const Ne = G(dn).add(On, "month").toDate();
        Ie == null || Ie(Ne), st(Ne);
      },
      k1 = () => {
        const Ne = G(dn).subtract(On, "month").toDate();
        U == null || U(Ne), st(Ne);
      },
      _1 = () => {
        const Ne = G(dn).add(On, "year").toDate();
        gt == null || gt(Ne), st(Ne);
      },
      R1 = () => {
        const Ne = G(dn).subtract(On, "year").toDate();
        At == null || At(Ne), st(Ne);
      },
      D1 = () => {
        const Ne = G(dn)
          .add(10 * On, "year")
          .toDate();
        qe == null || qe(Ne), st(Ne);
      },
      P1 = () => {
        const Ne = G(dn)
          .subtract(10 * On, "year")
          .toDate();
        xe == null || xe(Ne), st(Ne);
      };
    return x.jsxs(Z, {
      ref: t,
      size: ce,
      "data-calendar": !0,
      ...ke,
      children: [
        _e === "month" &&
          x.jsx(wa, {
            month: dn,
            minDate: oe,
            maxDate: le,
            firstDayOfWeek: C,
            weekdayFormat: E,
            weekendDays: R,
            getDayProps: D,
            excludeDate: j,
            renderDay: T,
            hideOutsideDates: M,
            hideWeekdays: B,
            getDayAriaLabel: H,
            onNext: E1,
            onPrevious: k1,
            hasNextLevel: o !== "month",
            onLevelClick: () => Ae("year"),
            numberOfColumns: d,
            locale: q,
            levelControlAriaLabel: p == null ? void 0 : p.monthLevelControl,
            nextLabel: p == null ? void 0 : p.nextMonth,
            nextIcon: L,
            previousLabel: p == null ? void 0 : p.previousMonth,
            previousIcon: P,
            monthLabelFormat: F,
            __onDayClick: O,
            __onDayMouseEnter: _,
            __preventFocus: se,
            __stopPropagation: Oe,
            static: re,
            withCellSpacing: k,
            ...fn,
          }),
        _e === "year" &&
          x.jsx(va, {
            year: dn,
            numberOfColumns: d,
            minDate: oe,
            maxDate: le,
            monthsListFormat: $,
            getMonthControlProps: N,
            locale: q,
            onNext: _1,
            onPrevious: R1,
            hasNextLevel: o !== "month" && o !== "year",
            onLevelClick: () => Ae("decade"),
            levelControlAriaLabel: p == null ? void 0 : p.yearLevelControl,
            nextLabel: p == null ? void 0 : p.nextYear,
            nextIcon: L,
            previousLabel: p == null ? void 0 : p.previousYear,
            previousIcon: P,
            yearLabelFormat: I,
            __onControlMouseEnter: g,
            __onControlClick: (Ne, Mo) => {
              b && st(Mo), Ae(Xo("month", s, o)), S == null || S(Mo);
            },
            __preventFocus: se,
            __stopPropagation: Oe,
            withCellSpacing: k,
            ...fn,
          }),
        _e === "decade" &&
          x.jsx(ya, {
            decade: dn,
            minDate: oe,
            maxDate: le,
            yearsListFormat: Y,
            getYearControlProps: X,
            locale: q,
            onNext: D1,
            onPrevious: P1,
            numberOfColumns: d,
            nextLabel: p == null ? void 0 : p.nextDecade,
            nextIcon: L,
            previousLabel: p == null ? void 0 : p.previousDecade,
            previousIcon: P,
            decadeLabelFormat: ee,
            __onControlMouseEnter: v,
            __onControlClick: (Ne, Mo) => {
              y && st(Mo), Ae(Xo("year", s, o)), h == null || h(Mo);
            },
            __preventFocus: se,
            __stopPropagation: Oe,
            withCellSpacing: k,
            ...fn,
          }),
      ],
    });
  });
Sa.classes = { ...ya.classes, ...va.classes, ...wa.classes };
Sa.displayName = "@mantine/dates/Calendar";
function eh(e, t) {
  const n = [...t].sort((r, o) => r.getTime() - o.getTime());
  return (
    G(n[0]).startOf("day").subtract(1, "ms").isBefore(e) &&
    G(n[1]).endOf("day").add(1, "ms").isAfter(e)
  );
}
function eP({
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
  const [c, u] = U0({
      type: e,
      value: n,
      defaultValue: r,
      onChange: o,
      applyTimezone: a,
    }),
    [f, d] = w.useState(e === "range" && c[0] && !c[1] ? c[0] : null),
    [m, p] = w.useState(null),
    h = (E) => {
      if (e === "range") {
        if (f instanceof Date && !c[1]) {
          if (G(E).isSame(f, t) && !s) {
            d(null), p(null), u([null, null]);
            return;
          }
          const R = [E, f];
          R.sort((D, j) => D.getTime() - j.getTime()), u(R), p(null), d(null);
          return;
        }
        if (c[0] && !c[1] && G(E).isSame(c[0], t) && !s) {
          d(null), p(null), u([null, null]);
          return;
        }
        u([E, null]), p(null), d(E);
        return;
      }
      if (e === "multiple") {
        c.some((R) => G(R).isSame(E, t))
          ? u(c.filter((R) => !G(R).isSame(E, t)))
          : u([...c, E]);
        return;
      }
      c && i && G(E).isSame(c, t) ? u(null) : u(E);
    },
    S = (E) =>
      f instanceof Date && m instanceof Date
        ? eh(E, [m, f])
        : c[0] instanceof Date && c[1] instanceof Date
        ? eh(E, c)
        : !1,
    v =
      e === "range"
        ? (E) => {
            l == null || l(E), p(null);
          }
        : l,
    g = (E) =>
      c[0] instanceof Date && G(E).isSame(c[0], t)
        ? !(m && G(m).isBefore(c[0]))
        : !1,
    y = (E) =>
      c[1] instanceof Date
        ? G(E).isSame(c[1], t)
        : !(c[0] instanceof Date) || !m
        ? !1
        : G(m).isBefore(c[0]) && G(E).isSame(c[0], t),
    b = (E) => {
      if (e === "range")
        return {
          selected: c.some((D) => D && G(D).isSame(E, t)),
          inRange: S(E),
          firstInRange: g(E),
          lastInRange: y(E),
          "data-autofocus": (!!c[0] && G(c[0]).isSame(E, t)) || void 0,
        };
      if (e === "multiple")
        return {
          selected: c.some((D) => D && G(D).isSame(E, t)),
          "data-autofocus": (!!c[0] && G(c[0]).isSame(E, t)) || void 0,
        };
      const R = G(c).isSame(E, t);
      return { selected: R, "data-autofocus": R || void 0 };
    },
    C = e === "range" && f ? p : () => {};
  return (
    w.useEffect(() => {
      e === "range" && !c[0] && !c[1] && d(null);
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
const tP = { type: "default", defaultLevel: "month", numberOfColumns: 1 },
  Od = Q((e, t) => {
    const n = W("DatePicker", tP, e),
      {
        classNames: r,
        styles: o,
        vars: s,
        type: i,
        defaultValue: l,
        value: a,
        onChange: c,
        __staticSelector: u,
        getDayProps: f,
        allowSingleDateInRange: d,
        allowDeselect: m,
        onMouseLeave: p,
        numberOfColumns: h,
        hideOutsideDates: S,
        __onDayMouseEnter: v,
        __onDayClick: g,
        __timezoneApplied: y,
        ...b
      } = n,
      {
        onDateChange: C,
        onRootMouseLeave: E,
        onHoveredDateChange: R,
        getControlProps: D,
      } = eP({
        type: i,
        level: "day",
        allowDeselect: m,
        allowSingleDateInRange: d,
        value: a,
        defaultValue: l,
        onChange: c,
        onMouseLeave: p,
        applyTimezone: !y,
      }),
      { resolvedClassNames: j, resolvedStyles: T } = Bs({
        classNames: r,
        styles: o,
        props: n,
      }),
      M = Xt();
    return x.jsx(Sa, {
      ref: t,
      minLevel: "month",
      classNames: j,
      styles: T,
      __staticSelector: u || "DatePicker",
      onMouseLeave: E,
      numberOfColumns: h,
      hideOutsideDates: S ?? h !== 1,
      __onDayMouseEnter: (B, H) => {
        R(H), v == null || v(B, H);
      },
      __onDayClick: (B, H) => {
        C(H), g == null || g(B, H);
      },
      getDayProps: (B) => ({ ...D(B), ...(f == null ? void 0 : f(B)) }),
      ...b,
      date: co("add", b.date, M.getTimezone(), y),
      __timezoneApplied: !0,
    });
  });
Od.classes = Sa.classes;
Od.displayName = "@mantine/dates/DatePicker";
const nP = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = new Date(),
    l = new Date();
  l.setFullYear(i.getFullYear() + 1);
  const [a, c] = w.useState(l),
    [u, f] = w.useState(a),
    [d, { open: m, close: p }] = Jy(!1);
  w.useEffect(() => {
    localStorage.setItem("embargo", a.toISOString().split("T")[0]);
  }, [a]);
  const h = () =>
      x.jsx(zn, {
        children: x.jsx(nn, {
          onClick: m,
          variant: "default",
          children: "Change embargo date",
        }),
      }),
    S = (g) => {
      const y = new Date(i);
      y.setMonth(i.getMonth() + g), c(y);
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
      x.jsxs(un, {
        opened: d,
        onClose: p,
        title: "Select embargo date",
        centered: !0,
        children: [
          x.jsxs(zn, {
            justify: "center",
            children: [
              x.jsx(nn, {
                variant: "default",
                onClick: () => {
                  S(6);
                },
                children: "6 months",
              }),
              x.jsx(nn, {
                variant: "default",
                onClick: () => {
                  S(12);
                },
                children: "12 months",
              }),
              x.jsx(nn, {
                variant: "default",
                onClick: () => {
                  S(18);
                },
                children: "18 months",
              }),
            ],
          }),
          x.jsx(zn, {
            justify: "center",
            children: x.jsxs("p", {
              children: ["New Embargo: ", x.jsx("b", { children: v() })],
            }),
          }),
          x.jsx(zn, {
            justify: "center",
            children: x.jsx(Od, { defaultDate: i, value: a, onChange: c }),
          }),
          x.jsxs(zn, {
            justify: "center",
            children: [
              x.jsx(nn, {
                variant: "default",
                onClick: () => {
                  f(a), p();
                },
                children: "Accept",
              }),
              x.jsx(nn, {
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
Ys.defaultProps = {};
Ys.propTypes = {
  title: J.string.isRequired,
  description: J.string,
  form: J.object.isRequired,
  field_id: J.string.isRequired,
  options: J.array,
};
const W0 = ({ field: e, form: t }) => {
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
      return x.jsx(gl, { ...n });
    case "text-area":
      return x.jsx(Cd, { ...n });
    case "select-field":
      return x.jsx(Ys, { ...n });
    case "file-upload":
      return x.jsx(Rd, { ...n });
    case "info-box":
      return x.jsx(pD, { ...n });
    case "embargo-date-picker":
      return x.jsx(nP, { ...n });
    default:
      return x.jsx(gl, { ...n });
  }
};
W0.propTypes = { field: J.object.isRequired, form: J.object.isRequired };
function Y0(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: rP } = Object.prototype,
  { getPrototypeOf: Nd } = Object,
  xa = ((e) => (t) => {
    const n = rP.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  qt = (e) => ((e = e.toLowerCase()), (t) => xa(t) === e),
  ba = (e) => (t) => typeof t === e,
  { isArray: jo } = Array,
  Ns = ba("undefined");
function oP(e) {
  return (
    e !== null &&
    !Ns(e) &&
    e.constructor !== null &&
    !Ns(e.constructor) &&
    Dt(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const K0 = qt("ArrayBuffer");
function sP(e) {
  let t;
  return (
    typeof ArrayBuffer < "u" && ArrayBuffer.isView
      ? (t = ArrayBuffer.isView(e))
      : (t = e && e.buffer && K0(e.buffer)),
    t
  );
}
const iP = ba("string"),
  Dt = ba("function"),
  G0 = ba("number"),
  Ca = (e) => e !== null && typeof e == "object",
  lP = (e) => e === !0 || e === !1,
  Mi = (e) => {
    if (xa(e) !== "object") return !1;
    const t = Nd(e);
    return (
      (t === null ||
        t === Object.prototype ||
        Object.getPrototypeOf(t) === null) &&
      !(Symbol.toStringTag in e) &&
      !(Symbol.iterator in e)
    );
  },
  aP = qt("Date"),
  cP = qt("File"),
  uP = qt("Blob"),
  fP = qt("FileList"),
  dP = (e) => Ca(e) && Dt(e.pipe),
  pP = (e) => {
    let t;
    return (
      e &&
      ((typeof FormData == "function" && e instanceof FormData) ||
        (Dt(e.append) &&
          ((t = xa(e)) === "formdata" ||
            (t === "object" &&
              Dt(e.toString) &&
              e.toString() === "[object FormData]"))))
    );
  },
  mP = qt("URLSearchParams"),
  [hP, gP, yP, vP] = ["ReadableStream", "Request", "Response", "Headers"].map(
    qt
  ),
  wP = (e) =>
    e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function Ks(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u") return;
  let r, o;
  if ((typeof e != "object" && (e = [e]), jo(e)))
    for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);
  else {
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      i = s.length;
    let l;
    for (r = 0; r < i; r++) (l = s[r]), t.call(null, e[l], l, e);
  }
}
function X0(e, t) {
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    o;
  for (; r-- > 0; ) if (((o = n[r]), t === o.toLowerCase())) return o;
  return null;
}
const q0 =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
      ? self
      : typeof window < "u"
      ? window
      : global,
  Q0 = (e) => !Ns(e) && e !== q0;
function Ru() {
  const { caseless: e } = (Q0(this) && this) || {},
    t = {},
    n = (r, o) => {
      const s = (e && X0(t, o)) || o;
      Mi(t[s]) && Mi(r)
        ? (t[s] = Ru(t[s], r))
        : Mi(r)
        ? (t[s] = Ru({}, r))
        : jo(r)
        ? (t[s] = r.slice())
        : (t[s] = r);
    };
  for (let r = 0, o = arguments.length; r < o; r++)
    arguments[r] && Ks(arguments[r], n);
  return t;
}
const SP = (e, t, n, { allOwnKeys: r } = {}) => (
    Ks(
      t,
      (o, s) => {
        n && Dt(o) ? (e[s] = Y0(o, n)) : (e[s] = o);
      },
      { allOwnKeys: r }
    ),
    e
  ),
  xP = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  bP = (e, t, n, r) => {
    (e.prototype = Object.create(t.prototype, r)),
      (e.prototype.constructor = e),
      Object.defineProperty(e, "super", { value: t.prototype }),
      n && Object.assign(e.prototype, n);
  },
  CP = (e, t, n, r) => {
    let o, s, i;
    const l = {};
    if (((t = t || {}), e == null)) return t;
    do {
      for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
        (i = o[s]), (!r || r(i, e, t)) && !l[i] && ((t[i] = e[i]), (l[i] = !0));
      e = n !== !1 && Nd(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  EP = (e, t, n) => {
    (e = String(e)),
      (n === void 0 || n > e.length) && (n = e.length),
      (n -= t.length);
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  kP = (e) => {
    if (!e) return null;
    if (jo(e)) return e;
    let t = e.length;
    if (!G0(t)) return null;
    const n = new Array(t);
    for (; t-- > 0; ) n[t] = e[t];
    return n;
  },
  _P = (
    (e) => (t) =>
      e && t instanceof e
  )(typeof Uint8Array < "u" && Nd(Uint8Array)),
  RP = (e, t) => {
    const r = (e && e[Symbol.iterator]).call(e);
    let o;
    for (; (o = r.next()) && !o.done; ) {
      const s = o.value;
      t.call(e, s[0], s[1]);
    }
  },
  DP = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null; ) r.push(n);
    return r;
  },
  PP = qt("HTMLFormElement"),
  TP = (e) =>
    e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, o) {
      return r.toUpperCase() + o;
    }),
  th = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  OP = qt("RegExp"),
  J0 = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    Ks(n, (o, s) => {
      let i;
      (i = t(o, s, e)) !== !1 && (r[s] = i || o);
    }),
      Object.defineProperties(e, r);
  },
  NP = (e) => {
    J0(e, (t, n) => {
      if (Dt(e) && ["arguments", "caller", "callee"].indexOf(n) !== -1)
        return !1;
      const r = e[n];
      if (Dt(r)) {
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
  $P = (e, t) => {
    const n = {},
      r = (o) => {
        o.forEach((s) => {
          n[s] = !0;
        });
      };
    return jo(e) ? r(e) : r(String(e).split(t)), n;
  },
  LP = () => {},
  jP = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t),
  hc = "abcdefghijklmnopqrstuvwxyz",
  nh = "0123456789",
  Z0 = { DIGIT: nh, ALPHA: hc, ALPHA_DIGIT: hc + hc.toUpperCase() + nh },
  AP = (e = 16, t = Z0.ALPHA_DIGIT) => {
    let n = "";
    const { length: r } = t;
    for (; e--; ) n += t[(Math.random() * r) | 0];
    return n;
  };
function FP(e) {
  return !!(
    e &&
    Dt(e.append) &&
    e[Symbol.toStringTag] === "FormData" &&
    e[Symbol.iterator]
  );
}
const MP = (e) => {
    const t = new Array(10),
      n = (r, o) => {
        if (Ca(r)) {
          if (t.indexOf(r) >= 0) return;
          if (!("toJSON" in r)) {
            t[o] = r;
            const s = jo(r) ? [] : {};
            return (
              Ks(r, (i, l) => {
                const a = n(i, o + 1);
                !Ns(a) && (s[l] = a);
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
  zP = qt("AsyncFunction"),
  IP = (e) => e && (Ca(e) || Dt(e)) && Dt(e.then) && Dt(e.catch),
  A = {
    isArray: jo,
    isArrayBuffer: K0,
    isBuffer: oP,
    isFormData: pP,
    isArrayBufferView: sP,
    isString: iP,
    isNumber: G0,
    isBoolean: lP,
    isObject: Ca,
    isPlainObject: Mi,
    isReadableStream: hP,
    isRequest: gP,
    isResponse: yP,
    isHeaders: vP,
    isUndefined: Ns,
    isDate: aP,
    isFile: cP,
    isBlob: uP,
    isRegExp: OP,
    isFunction: Dt,
    isStream: dP,
    isURLSearchParams: mP,
    isTypedArray: _P,
    isFileList: fP,
    forEach: Ks,
    merge: Ru,
    extend: SP,
    trim: wP,
    stripBOM: xP,
    inherits: bP,
    toFlatObject: CP,
    kindOf: xa,
    kindOfTest: qt,
    endsWith: EP,
    toArray: kP,
    forEachEntry: RP,
    matchAll: DP,
    isHTMLForm: PP,
    hasOwnProperty: th,
    hasOwnProp: th,
    reduceDescriptors: J0,
    freezeMethods: NP,
    toObjectSet: $P,
    toCamelCase: TP,
    noop: LP,
    toFiniteNumber: jP,
    findKey: X0,
    global: q0,
    isContextDefined: Q0,
    ALPHABET: Z0,
    generateString: AP,
    isSpecCompliantForm: FP,
    toJSONObject: MP,
    isAsyncFn: zP,
    isThenable: IP,
  };
function ie(e, t, n, r, o) {
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
A.inherits(ie, Error, {
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
      config: A.toJSONObject(this.config),
      code: this.code,
      status:
        this.response && this.response.status ? this.response.status : null,
    };
  },
});
const e1 = ie.prototype,
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
Object.defineProperties(ie, t1);
Object.defineProperty(e1, "isAxiosError", { value: !0 });
ie.from = (e, t, n, r, o, s) => {
  const i = Object.create(e1);
  return (
    A.toFlatObject(
      e,
      i,
      function (a) {
        return a !== Error.prototype;
      },
      (l) => l !== "isAxiosError"
    ),
    ie.call(i, e.message, t, n, r, o),
    (i.cause = e),
    (i.name = e.name),
    s && Object.assign(i, s),
    i
  );
};
const BP = null;
function Du(e) {
  return A.isPlainObject(e) || A.isArray(e);
}
function n1(e) {
  return A.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function rh(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (o, s) {
          return (o = n1(o)), !n && s ? "[" + o + "]" : o;
        })
        .join(n ? "." : "")
    : t;
}
function VP(e) {
  return A.isArray(e) && !e.some(Du);
}
const HP = A.toFlatObject(A, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function Ea(e, t, n) {
  if (!A.isObject(e)) throw new TypeError("target must be an object");
  (t = t || new FormData()),
    (n = A.toFlatObject(
      n,
      { metaTokens: !0, dots: !1, indexes: !1 },
      !1,
      function (h, S) {
        return !A.isUndefined(S[h]);
      }
    ));
  const r = n.metaTokens,
    o = n.visitor || u,
    s = n.dots,
    i = n.indexes,
    a = (n.Blob || (typeof Blob < "u" && Blob)) && A.isSpecCompliantForm(t);
  if (!A.isFunction(o)) throw new TypeError("visitor must be a function");
  function c(p) {
    if (p === null) return "";
    if (A.isDate(p)) return p.toISOString();
    if (!a && A.isBlob(p))
      throw new ie("Blob is not supported. Use a Buffer instead.");
    return A.isArrayBuffer(p) || A.isTypedArray(p)
      ? a && typeof Blob == "function"
        ? new Blob([p])
        : Buffer.from(p)
      : p;
  }
  function u(p, h, S) {
    let v = p;
    if (p && !S && typeof p == "object") {
      if (A.endsWith(h, "{}"))
        (h = r ? h : h.slice(0, -2)), (p = JSON.stringify(p));
      else if (
        (A.isArray(p) && VP(p)) ||
        ((A.isFileList(p) || A.endsWith(h, "[]")) && (v = A.toArray(p)))
      )
        return (
          (h = n1(h)),
          v.forEach(function (y, b) {
            !(A.isUndefined(y) || y === null) &&
              t.append(
                i === !0 ? rh([h], b, s) : i === null ? h : h + "[]",
                c(y)
              );
          }),
          !1
        );
    }
    return Du(p) ? !0 : (t.append(rh(S, h, s), c(p)), !1);
  }
  const f = [],
    d = Object.assign(HP, {
      defaultVisitor: u,
      convertValue: c,
      isVisitable: Du,
    });
  function m(p, h) {
    if (!A.isUndefined(p)) {
      if (f.indexOf(p) !== -1)
        throw Error("Circular reference detected in " + h.join("."));
      f.push(p),
        A.forEach(p, function (v, g) {
          (!(A.isUndefined(v) || v === null) &&
            o.call(t, v, A.isString(g) ? g.trim() : g, h, d)) === !0 &&
            m(v, h ? h.concat(g) : [g]);
        }),
        f.pop();
    }
  }
  if (!A.isObject(e)) throw new TypeError("data must be an object");
  return m(e), t;
}
function oh(e) {
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
function $d(e, t) {
  (this._pairs = []), e && Ea(e, this, t);
}
const r1 = $d.prototype;
r1.append = function (t, n) {
  this._pairs.push([t, n]);
};
r1.toString = function (t) {
  const n = t
    ? function (r) {
        return t.call(this, r, oh);
      }
    : oh;
  return this._pairs
    .map(function (o) {
      return n(o[0]) + "=" + n(o[1]);
    }, "")
    .join("&");
};
function UP(e) {
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
  const r = (n && n.encode) || UP,
    o = n && n.serialize;
  let s;
  if (
    (o
      ? (s = o(t, n))
      : (s = A.isURLSearchParams(t) ? t.toString() : new $d(t, n).toString(r)),
    s)
  ) {
    const i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)),
      (e += (e.indexOf("?") === -1 ? "?" : "&") + s);
  }
  return e;
}
class sh {
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
    A.forEach(this.handlers, function (r) {
      r !== null && t(r);
    });
  }
}
const s1 = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
  },
  WP = typeof URLSearchParams < "u" ? URLSearchParams : $d,
  YP = typeof FormData < "u" ? FormData : null,
  KP = typeof Blob < "u" ? Blob : null,
  GP = {
    isBrowser: !0,
    classes: { URLSearchParams: WP, FormData: YP, Blob: KP },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  Ld = typeof window < "u" && typeof document < "u",
  XP = ((e) => Ld && ["ReactNative", "NativeScript", "NS"].indexOf(e) < 0)(
    typeof navigator < "u" && navigator.product
  ),
  qP =
    typeof WorkerGlobalScope < "u" &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == "function",
  QP = (Ld && window.location.href) || "http://localhost",
  JP = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: Ld,
        hasStandardBrowserEnv: XP,
        hasStandardBrowserWebWorkerEnv: qP,
        origin: QP,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  Ut = { ...JP, ...GP };
function ZP(e, t) {
  return Ea(
    e,
    new Ut.classes.URLSearchParams(),
    Object.assign(
      {
        visitor: function (n, r, o, s) {
          return Ut.isNode && A.isBuffer(n)
            ? (this.append(r, n.toString("base64")), !1)
            : s.defaultVisitor.apply(this, arguments);
        },
      },
      t
    )
  );
}
function eT(e) {
  return A.matchAll(/\w+|\[(\w*)]/g, e).map((t) =>
    t[0] === "[]" ? "" : t[1] || t[0]
  );
}
function tT(e) {
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
      (i = !i && A.isArray(o) ? o.length : i),
      a
        ? (A.hasOwnProp(o, i) ? (o[i] = [o[i], r]) : (o[i] = r), !l)
        : ((!o[i] || !A.isObject(o[i])) && (o[i] = []),
          t(n, r, o[i], s) && A.isArray(o[i]) && (o[i] = tT(o[i])),
          !l)
    );
  }
  if (A.isFormData(e) && A.isFunction(e.entries)) {
    const n = {};
    return (
      A.forEachEntry(e, (r, o) => {
        t(eT(r), o, n, 0);
      }),
      n
    );
  }
  return null;
}
function nT(e, t, n) {
  if (A.isString(e))
    try {
      return (t || JSON.parse)(e), A.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError") throw r;
    }
  return (n || JSON.stringify)(e);
}
const Gs = {
  transitional: s1,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (t, n) {
      const r = n.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        s = A.isObject(t);
      if ((s && A.isHTMLForm(t) && (t = new FormData(t)), A.isFormData(t)))
        return o ? JSON.stringify(i1(t)) : t;
      if (
        A.isArrayBuffer(t) ||
        A.isBuffer(t) ||
        A.isStream(t) ||
        A.isFile(t) ||
        A.isBlob(t) ||
        A.isReadableStream(t)
      )
        return t;
      if (A.isArrayBufferView(t)) return t.buffer;
      if (A.isURLSearchParams(t))
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
          return ZP(t, this.formSerializer).toString();
        if ((l = A.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const a = this.env && this.env.FormData;
          return Ea(
            l ? { "files[]": t } : t,
            a && new a(),
            this.formSerializer
          );
        }
      }
      return s || o ? (n.setContentType("application/json", !1), nT(t)) : t;
    },
  ],
  transformResponse: [
    function (t) {
      const n = this.transitional || Gs.transitional,
        r = n && n.forcedJSONParsing,
        o = this.responseType === "json";
      if (A.isResponse(t) || A.isReadableStream(t)) return t;
      if (t && A.isString(t) && ((r && !this.responseType) || o)) {
        const i = !(n && n.silentJSONParsing) && o;
        try {
          return JSON.parse(t);
        } catch (l) {
          if (i)
            throw l.name === "SyntaxError"
              ? ie.from(l, ie.ERR_BAD_RESPONSE, this, null, this.response)
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
  env: { FormData: Ut.classes.FormData, Blob: Ut.classes.Blob },
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
A.forEach(["delete", "get", "head", "post", "put", "patch"], (e) => {
  Gs.headers[e] = {};
});
const rT = A.toObjectSet([
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
  oT = (e) => {
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
              !(!n || (t[n] && rT[n])) &&
                (n === "set-cookie"
                  ? t[n]
                    ? t[n].push(r)
                    : (t[n] = [r])
                  : (t[n] = t[n] ? t[n] + ", " + r : r));
          }),
      t
    );
  },
  ih = Symbol("internals");
function qo(e) {
  return e && String(e).trim().toLowerCase();
}
function zi(e) {
  return e === !1 || e == null ? e : A.isArray(e) ? e.map(zi) : String(e);
}
function sT(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; (r = n.exec(e)); ) t[r[1]] = r[2];
  return t;
}
const iT = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function gc(e, t, n, r, o) {
  if (A.isFunction(r)) return r.call(this, t, n);
  if ((o && (t = n), !!A.isString(t))) {
    if (A.isString(r)) return t.indexOf(r) !== -1;
    if (A.isRegExp(r)) return r.test(t);
  }
}
function lT(e) {
  return e
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function aT(e, t) {
  const n = A.toCamelCase(" " + t);
  ["get", "set", "has"].forEach((r) => {
    Object.defineProperty(e, r + n, {
      value: function (o, s, i) {
        return this[r].call(this, t, o, s, i);
      },
      configurable: !0,
    });
  });
}
class pt {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const o = this;
    function s(l, a, c) {
      const u = qo(a);
      if (!u) throw new Error("header name must be a non-empty string");
      const f = A.findKey(o, u);
      (!f || o[f] === void 0 || c === !0 || (c === void 0 && o[f] !== !1)) &&
        (o[f || a] = zi(l));
    }
    const i = (l, a) => A.forEach(l, (c, u) => s(c, u, a));
    if (A.isPlainObject(t) || t instanceof this.constructor) i(t, n);
    else if (A.isString(t) && (t = t.trim()) && !iT(t)) i(oT(t), n);
    else if (A.isHeaders(t)) for (const [l, a] of t.entries()) s(a, l, r);
    else t != null && s(n, t, r);
    return this;
  }
  get(t, n) {
    if (((t = qo(t)), t)) {
      const r = A.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n) return o;
        if (n === !0) return sT(o);
        if (A.isFunction(n)) return n.call(this, o, r);
        if (A.isRegExp(n)) return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (((t = qo(t)), t)) {
      const r = A.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || gc(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function s(i) {
      if (((i = qo(i)), i)) {
        const l = A.findKey(r, i);
        l && (!n || gc(r, r[l], l, n)) && (delete r[l], (o = !0));
      }
    }
    return A.isArray(t) ? t.forEach(s) : s(t), o;
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length,
      o = !1;
    for (; r--; ) {
      const s = n[r];
      (!t || gc(this, this[s], s, t, !0)) && (delete this[s], (o = !0));
    }
    return o;
  }
  normalize(t) {
    const n = this,
      r = {};
    return (
      A.forEach(this, (o, s) => {
        const i = A.findKey(r, s);
        if (i) {
          (n[i] = zi(o)), delete n[s];
          return;
        }
        const l = t ? lT(s) : String(s).trim();
        l !== s && delete n[s], (n[l] = zi(o)), (r[l] = !0);
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
      A.forEach(this, (r, o) => {
        r != null && r !== !1 && (n[o] = t && A.isArray(r) ? r.join(", ") : r);
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
    const r = (this[ih] = this[ih] = { accessors: {} }).accessors,
      o = this.prototype;
    function s(i) {
      const l = qo(i);
      r[l] || (aT(o, i), (r[l] = !0));
    }
    return A.isArray(t) ? t.forEach(s) : s(t), this;
  }
}
pt.accessor([
  "Content-Type",
  "Content-Length",
  "Accept",
  "Accept-Encoding",
  "User-Agent",
  "Authorization",
]);
A.reduceDescriptors(pt.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    },
  };
});
A.freezeMethods(pt);
function yc(e, t) {
  const n = this || Gs,
    r = t || n,
    o = pt.from(r.headers);
  let s = r.data;
  return (
    A.forEach(e, function (l) {
      s = l.call(n, s, o.normalize(), t ? t.status : void 0);
    }),
    o.normalize(),
    s
  );
}
function l1(e) {
  return !!(e && e.__CANCEL__);
}
function Ao(e, t, n) {
  ie.call(this, e ?? "canceled", ie.ERR_CANCELED, t, n),
    (this.name = "CanceledError");
}
A.inherits(Ao, ie, { __CANCEL__: !0 });
function a1(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status)
    ? e(n)
    : t(
        new ie(
          "Request failed with status code " + n.status,
          [ie.ERR_BAD_REQUEST, ie.ERR_BAD_RESPONSE][
            Math.floor(n.status / 100) - 4
          ],
          n.config,
          n.request,
          n
        )
      );
}
function cT(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return (t && t[1]) || "";
}
function uT(e, t) {
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
      let f = s,
        d = 0;
      for (; f !== o; ) (d += n[f++]), (f = f % e);
      if (((o = (o + 1) % e), o === s && (s = (s + 1) % e), c - i < t)) return;
      const m = u && c - u;
      return m ? Math.round((d * 1e3) / m) : void 0;
    }
  );
}
function fT(e, t) {
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
const xl = (e, t, n = 3) => {
    let r = 0;
    const o = uT(50, 250);
    return fT((s) => {
      const i = s.loaded,
        l = s.lengthComputable ? s.total : void 0,
        a = i - r,
        c = o(a),
        u = i <= l;
      r = i;
      const f = {
        loaded: i,
        total: l,
        progress: l ? i / l : void 0,
        bytes: a,
        rate: c || void 0,
        estimated: c && l && u ? (l - i) / c : void 0,
        event: s,
        lengthComputable: l != null,
      };
      (f[t ? "download" : "upload"] = !0), e(f);
    }, n);
  },
  dT = Ut.hasStandardBrowserEnv
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
            const l = A.isString(i) ? o(i) : i;
            return l.protocol === r.protocol && l.host === r.host;
          }
        );
      })()
    : (function () {
        return function () {
          return !0;
        };
      })(),
  pT = Ut.hasStandardBrowserEnv
    ? {
        write(e, t, n, r, o, s) {
          const i = [e + "=" + encodeURIComponent(t)];
          A.isNumber(n) && i.push("expires=" + new Date(n).toGMTString()),
            A.isString(r) && i.push("path=" + r),
            A.isString(o) && i.push("domain=" + o),
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
function mT(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function hT(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function c1(e, t) {
  return e && !mT(t) ? hT(e, t) : t;
}
const lh = (e) => (e instanceof pt ? { ...e } : e);
function Rr(e, t) {
  t = t || {};
  const n = {};
  function r(c, u, f) {
    return A.isPlainObject(c) && A.isPlainObject(u)
      ? A.merge.call({ caseless: f }, c, u)
      : A.isPlainObject(u)
      ? A.merge({}, u)
      : A.isArray(u)
      ? u.slice()
      : u;
  }
  function o(c, u, f) {
    if (A.isUndefined(u)) {
      if (!A.isUndefined(c)) return r(void 0, c, f);
    } else return r(c, u, f);
  }
  function s(c, u) {
    if (!A.isUndefined(u)) return r(void 0, u);
  }
  function i(c, u) {
    if (A.isUndefined(u)) {
      if (!A.isUndefined(c)) return r(void 0, c);
    } else return r(void 0, u);
  }
  function l(c, u, f) {
    if (f in t) return r(c, u);
    if (f in e) return r(void 0, c);
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
    headers: (c, u) => o(lh(c), lh(u), !0),
  };
  return (
    A.forEach(Object.keys(Object.assign({}, e, t)), function (u) {
      const f = a[u] || o,
        d = f(e[u], t[u], u);
      (A.isUndefined(d) && f !== l) || (n[u] = d);
    }),
    n
  );
}
const u1 = (e) => {
    const t = Rr({}, e);
    let {
      data: n,
      withXSRFToken: r,
      xsrfHeaderName: o,
      xsrfCookieName: s,
      headers: i,
      auth: l,
    } = t;
    (t.headers = i = pt.from(i)),
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
    if (A.isFormData(n)) {
      if (Ut.hasStandardBrowserEnv || Ut.hasStandardBrowserWebWorkerEnv)
        i.setContentType(void 0);
      else if ((a = i.getContentType()) !== !1) {
        const [c, ...u] = a
          ? a
              .split(";")
              .map((f) => f.trim())
              .filter(Boolean)
          : [];
        i.setContentType([c || "multipart/form-data", ...u].join("; "));
      }
    }
    if (
      Ut.hasStandardBrowserEnv &&
      (r && A.isFunction(r) && (r = r(t)), r || (r !== !1 && dT(t.url)))
    ) {
      const c = o && s && pT.read(s);
      c && i.set(o, c);
    }
    return t;
  },
  gT = typeof XMLHttpRequest < "u",
  yT =
    gT &&
    function (e) {
      return new Promise(function (n, r) {
        const o = u1(e);
        let s = o.data;
        const i = pt.from(o.headers).normalize();
        let { responseType: l } = o,
          a;
        function c() {
          o.cancelToken && o.cancelToken.unsubscribe(a),
            o.signal && o.signal.removeEventListener("abort", a);
        }
        let u = new XMLHttpRequest();
        u.open(o.method.toUpperCase(), o.url, !0), (u.timeout = o.timeout);
        function f() {
          if (!u) return;
          const m = pt.from(
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
          ? (u.onloadend = f)
          : (u.onreadystatechange = function () {
              !u ||
                u.readyState !== 4 ||
                (u.status === 0 &&
                  !(u.responseURL && u.responseURL.indexOf("file:") === 0)) ||
                setTimeout(f);
            }),
          (u.onabort = function () {
            u &&
              (r(new ie("Request aborted", ie.ECONNABORTED, o, u)), (u = null));
          }),
          (u.onerror = function () {
            r(new ie("Network Error", ie.ERR_NETWORK, o, u)), (u = null);
          }),
          (u.ontimeout = function () {
            let p = o.timeout
              ? "timeout of " + o.timeout + "ms exceeded"
              : "timeout exceeded";
            const h = o.transitional || s1;
            o.timeoutErrorMessage && (p = o.timeoutErrorMessage),
              r(
                new ie(
                  p,
                  h.clarifyTimeoutError ? ie.ETIMEDOUT : ie.ECONNABORTED,
                  o,
                  u
                )
              ),
              (u = null);
          }),
          s === void 0 && i.setContentType(null),
          "setRequestHeader" in u &&
            A.forEach(i.toJSON(), function (p, h) {
              u.setRequestHeader(h, p);
            }),
          A.isUndefined(o.withCredentials) ||
            (u.withCredentials = !!o.withCredentials),
          l && l !== "json" && (u.responseType = o.responseType),
          typeof o.onDownloadProgress == "function" &&
            u.addEventListener("progress", xl(o.onDownloadProgress, !0)),
          typeof o.onUploadProgress == "function" &&
            u.upload &&
            u.upload.addEventListener("progress", xl(o.onUploadProgress)),
          (o.cancelToken || o.signal) &&
            ((a = (m) => {
              u &&
                (r(!m || m.type ? new Ao(null, e, u) : m),
                u.abort(),
                (u = null));
            }),
            o.cancelToken && o.cancelToken.subscribe(a),
            o.signal &&
              (o.signal.aborted ? a() : o.signal.addEventListener("abort", a)));
        const d = cT(o.url);
        if (d && Ut.protocols.indexOf(d) === -1) {
          r(new ie("Unsupported protocol " + d + ":", ie.ERR_BAD_REQUEST, e));
          return;
        }
        u.send(s || null);
      });
    },
  vT = (e, t) => {
    let n = new AbortController(),
      r;
    const o = function (a) {
      if (!r) {
        (r = !0), i();
        const c = a instanceof Error ? a : this.reason;
        n.abort(
          c instanceof ie ? c : new Ao(c instanceof Error ? c.message : c)
        );
      }
    };
    let s =
      t &&
      setTimeout(() => {
        o(new ie(`timeout ${t} of ms exceeded`, ie.ETIMEDOUT));
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
  wT = function* (e, t) {
    let n = e.byteLength;
    if (!t || n < t) {
      yield e;
      return;
    }
    let r = 0,
      o;
    for (; r < n; ) (o = r + t), yield e.slice(r, o), (r = o);
  },
  ST = async function* (e, t, n) {
    for await (const r of e)
      yield* wT(ArrayBuffer.isView(r) ? r : await n(String(r)), t);
  },
  ah = (e, t, n, r, o) => {
    const s = ST(e, t, o);
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
  ch = (e, t) => {
    const n = e != null;
    return (r) =>
      setTimeout(() => t({ lengthComputable: n, total: e, loaded: r }));
  },
  ka =
    typeof fetch == "function" &&
    typeof Request == "function" &&
    typeof Response == "function",
  f1 = ka && typeof ReadableStream == "function",
  Pu =
    ka &&
    (typeof TextEncoder == "function"
      ? (
          (e) => (t) =>
            e.encode(t)
        )(new TextEncoder())
      : async (e) => new Uint8Array(await new Response(e).arrayBuffer())),
  xT =
    f1 &&
    (() => {
      let e = !1;
      const t = new Request(Ut.origin, {
        body: new ReadableStream(),
        method: "POST",
        get duplex() {
          return (e = !0), "half";
        },
      }).headers.has("Content-Type");
      return e && !t;
    })(),
  uh = 64 * 1024,
  Tu =
    f1 &&
    !!(() => {
      try {
        return A.isReadableStream(new Response("").body);
      } catch {}
    })(),
  bl = { stream: Tu && ((e) => e.body) };
ka &&
  ((e) => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((t) => {
      !bl[t] &&
        (bl[t] = A.isFunction(e[t])
          ? (n) => n[t]()
          : (n, r) => {
              throw new ie(
                `Response type '${t}' is not supported`,
                ie.ERR_NOT_SUPPORT,
                r
              );
            });
    });
  })(new Response());
const bT = async (e) => {
    if (e == null) return 0;
    if (A.isBlob(e)) return e.size;
    if (A.isSpecCompliantForm(e))
      return (await new Request(e).arrayBuffer()).byteLength;
    if (A.isArrayBufferView(e)) return e.byteLength;
    if ((A.isURLSearchParams(e) && (e = e + ""), A.isString(e)))
      return (await Pu(e)).byteLength;
  },
  CT = async (e, t) => {
    const n = A.toFiniteNumber(e.getContentLength());
    return n ?? bT(t);
  },
  ET =
    ka &&
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
        withCredentials: f = "same-origin",
        fetchOptions: d,
      } = u1(e);
      c = c ? (c + "").toLowerCase() : "text";
      let [m, p] = o || s || i ? vT([o, s], i) : [],
        h,
        S;
      const v = () => {
        !h &&
          setTimeout(() => {
            m && m.unsubscribe();
          }),
          (h = !0);
      };
      let g;
      try {
        if (
          a &&
          xT &&
          n !== "get" &&
          n !== "head" &&
          (g = await CT(u, r)) !== 0
        ) {
          let E = new Request(t, { method: "POST", body: r, duplex: "half" }),
            R;
          A.isFormData(r) &&
            (R = E.headers.get("content-type")) &&
            u.setContentType(R),
            E.body && (r = ah(E.body, uh, ch(g, xl(a)), null, Pu));
        }
        A.isString(f) || (f = f ? "cors" : "omit"),
          (S = new Request(t, {
            ...d,
            signal: m,
            method: n.toUpperCase(),
            headers: u.normalize().toJSON(),
            body: r,
            duplex: "half",
            withCredentials: f,
          }));
        let y = await fetch(S);
        const b = Tu && (c === "stream" || c === "response");
        if (Tu && (l || b)) {
          const E = {};
          ["status", "statusText", "headers"].forEach((D) => {
            E[D] = y[D];
          });
          const R = A.toFiniteNumber(y.headers.get("content-length"));
          y = new Response(
            ah(y.body, uh, l && ch(R, xl(l, !0)), b && v, Pu),
            E
          );
        }
        c = c || "text";
        let C = await bl[A.findKey(bl, c) || "text"](y, e);
        return (
          !b && v(),
          p && p(),
          await new Promise((E, R) => {
            a1(E, R, {
              data: C,
              headers: pt.from(y.headers),
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
            ? Object.assign(new ie("Network Error", ie.ERR_NETWORK, e, S), {
                cause: y.cause || y,
              })
            : ie.from(y, y && y.code, e, S))
        );
      }
    }),
  Ou = { http: BP, xhr: yT, fetch: ET };
A.forEach(Ou, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {}
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const fh = (e) => `- ${e}`,
  kT = (e) => A.isFunction(e) || e === null || e === !1,
  d1 = {
    getAdapter: (e) => {
      e = A.isArray(e) ? e : [e];
      const { length: t } = e;
      let n, r;
      const o = {};
      for (let s = 0; s < t; s++) {
        n = e[s];
        let i;
        if (
          ((r = n),
          !kT(n) && ((r = Ou[(i = String(n)).toLowerCase()]), r === void 0))
        )
          throw new ie(`Unknown adapter '${i}'`);
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
              s.map(fh).join(`
`)
            : " " + fh(s[0])
          : "as no adapter specified";
        throw new ie(
          "There is no suitable adapter to dispatch the request " + i,
          "ERR_NOT_SUPPORT"
        );
      }
      return r;
    },
    adapters: Ou,
  };
function vc(e) {
  if (
    (e.cancelToken && e.cancelToken.throwIfRequested(),
    e.signal && e.signal.aborted)
  )
    throw new Ao(null, e);
}
function dh(e) {
  return (
    vc(e),
    (e.headers = pt.from(e.headers)),
    (e.data = yc.call(e, e.transformRequest)),
    ["post", "put", "patch"].indexOf(e.method) !== -1 &&
      e.headers.setContentType("application/x-www-form-urlencoded", !1),
    d1
      .getAdapter(e.adapter || Gs.adapter)(e)
      .then(
        function (r) {
          return (
            vc(e),
            (r.data = yc.call(e, e.transformResponse, r)),
            (r.headers = pt.from(r.headers)),
            r
          );
        },
        function (r) {
          return (
            l1(r) ||
              (vc(e),
              r &&
                r.response &&
                ((r.response.data = yc.call(
                  e,
                  e.transformResponse,
                  r.response
                )),
                (r.response.headers = pt.from(r.response.headers)))),
            Promise.reject(r)
          );
        }
      )
  );
}
const p1 = "1.7.2",
  jd = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  (e, t) => {
    jd[e] = function (r) {
      return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  }
);
const ph = {};
jd.transitional = function (t, n, r) {
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
      throw new ie(
        o(i, " has been removed" + (n ? " in " + n : "")),
        ie.ERR_DEPRECATED
      );
    return (
      n &&
        !ph[i] &&
        ((ph[i] = !0),
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
function _T(e, t, n) {
  if (typeof e != "object")
    throw new ie("options must be an object", ie.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let o = r.length;
  for (; o-- > 0; ) {
    const s = r[o],
      i = t[s];
    if (i) {
      const l = e[s],
        a = l === void 0 || i(l, s, e);
      if (a !== !0)
        throw new ie("option " + s + " must be " + a, ie.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new ie("Unknown option " + s, ie.ERR_BAD_OPTION);
  }
}
const Nu = { assertOptions: _T, validators: jd },
  $n = Nu.validators;
class Sr {
  constructor(t) {
    (this.defaults = t),
      (this.interceptors = { request: new sh(), response: new sh() });
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
      (n = Rr(this.defaults, n));
    const { transitional: r, paramsSerializer: o, headers: s } = n;
    r !== void 0 &&
      Nu.assertOptions(
        r,
        {
          silentJSONParsing: $n.transitional($n.boolean),
          forcedJSONParsing: $n.transitional($n.boolean),
          clarifyTimeoutError: $n.transitional($n.boolean),
        },
        !1
      ),
      o != null &&
        (A.isFunction(o)
          ? (n.paramsSerializer = { serialize: o })
          : Nu.assertOptions(
              o,
              { encode: $n.function, serialize: $n.function },
              !0
            )),
      (n.method = (n.method || this.defaults.method || "get").toLowerCase());
    let i = s && A.merge(s.common, s[n.method]);
    s &&
      A.forEach(
        ["delete", "get", "head", "post", "put", "patch", "common"],
        (p) => {
          delete s[p];
        }
      ),
      (n.headers = pt.concat(i, s));
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
      f = 0,
      d;
    if (!a) {
      const p = [dh.bind(this), void 0];
      for (
        p.unshift.apply(p, l),
          p.push.apply(p, c),
          d = p.length,
          u = Promise.resolve(n);
        f < d;

      )
        u = u.then(p[f++], p[f++]);
      return u;
    }
    d = l.length;
    let m = n;
    for (f = 0; f < d; ) {
      const p = l[f++],
        h = l[f++];
      try {
        m = p(m);
      } catch (S) {
        h.call(this, S);
        break;
      }
    }
    try {
      u = dh.call(this, m);
    } catch (p) {
      return Promise.reject(p);
    }
    for (f = 0, d = c.length; f < d; ) u = u.then(c[f++], c[f++]);
    return u;
  }
  getUri(t) {
    t = Rr(this.defaults, t);
    const n = c1(t.baseURL, t.url);
    return o1(n, t.params, t.paramsSerializer);
  }
}
A.forEach(["delete", "get", "head", "options"], function (t) {
  Sr.prototype[t] = function (n, r) {
    return this.request(
      Rr(r || {}, { method: t, url: n, data: (r || {}).data })
    );
  };
});
A.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (s, i, l) {
      return this.request(
        Rr(l || {}, {
          method: t,
          headers: r ? { "Content-Type": "multipart/form-data" } : {},
          url: s,
          data: i,
        })
      );
    };
  }
  (Sr.prototype[t] = n()), (Sr.prototype[t + "Form"] = n(!0));
});
class Ad {
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
        r.reason || ((r.reason = new Ao(s, i, l)), n(r.reason));
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
      token: new Ad(function (o) {
        t = o;
      }),
      cancel: t,
    };
  }
}
function RT(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function DT(e) {
  return A.isObject(e) && e.isAxiosError === !0;
}
const $u = {
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
Object.entries($u).forEach(([e, t]) => {
  $u[t] = e;
});
function m1(e) {
  const t = new Sr(e),
    n = Y0(Sr.prototype.request, t);
  return (
    A.extend(n, Sr.prototype, t, { allOwnKeys: !0 }),
    A.extend(n, t, null, { allOwnKeys: !0 }),
    (n.create = function (o) {
      return m1(Rr(e, o));
    }),
    n
  );
}
const De = m1(Gs);
De.Axios = Sr;
De.CanceledError = Ao;
De.CancelToken = Ad;
De.isCancel = l1;
De.VERSION = p1;
De.toFormData = Ea;
De.AxiosError = ie;
De.Cancel = De.CanceledError;
De.all = function (t) {
  return Promise.all(t);
};
De.spread = RT;
De.isAxiosError = DT;
De.mergeConfig = Rr;
De.AxiosHeaders = pt;
De.formToJSON = (e) => i1(A.isHTMLForm(e) ? new FormData(e) : e);
De.getAdapter = d1.getAdapter;
De.HttpStatusCode = $u;
De.default = De;
const PT = async (e, t, n) => {
    let r = {};
    const o = { target: e, embargo: t, data: { requirements: n } };
    let s = "";
    window.props !== void 0 && (s = window.props.token || "no-token-found");
    const i = k0,
      l = {
        headers: {
          Authorization: "Token " + s,
          "Content-Type": "application/json",
        },
      };
    return (
      await De.post(i, o, l)
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
      [i, l] = w.useState(!1),
      a = gR({
        mode: "uncontrolled",
        name: "profile-form",
        initialValues: { files: [] },
      }),
      c = (u) => {
        l(!0),
          PT(t.target, localStorage.getItem("embargo"), u)
            .then((f) => {
              console.log("DATA ", f);
            })
            .finally(() => {
              l(!1);
            });
      };
    return x.jsxs("form", {
      onSubmit: a.onSubmit(c),
      children: [
        x.jsxs("p", { children: ["processing: ", "" + i] }),
        t.fields.map((u, f) => x.jsx(W0, { field: u, form: a }, f)),
        x.jsx(zn, {
          justify: "flex-end",
          mt: "md",
          children: x.jsx(nn, { type: "submit", children: "Submit" }),
        }),
      ],
    });
  };
h1.propTypes = { profileData: J.object.isRequired };
/**
 * @remix-run/router v1.16.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Cl() {
  return (
    (Cl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Cl.apply(this, arguments)
  );
}
var Vn;
(function (e) {
  (e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE");
})(Vn || (Vn = {}));
const mh = "popstate";
function TT(e) {
  e === void 0 && (e = {});
  function t(r, o) {
    let { pathname: s, search: i, hash: l } = r.location;
    return Lu(
      "",
      { pathname: s, search: i, hash: l },
      (o.state && o.state.usr) || null,
      (o.state && o.state.key) || "default"
    );
  }
  function n(r, o) {
    return typeof o == "string" ? o : y1(o);
  }
  return NT(t, n, null, e);
}
function ht(e, t) {
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
function OT() {
  return Math.random().toString(36).substr(2, 8);
}
function hh(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function Lu(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    Cl(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? _a(t) : t,
      { state: n, key: (t && t.key) || r || OT() }
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
function _a(e) {
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
function NT(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: o = document.defaultView, v5Compat: s = !1 } = r,
    i = o.history,
    l = Vn.Pop,
    a = null,
    c = u();
  c == null && ((c = 0), i.replaceState(Cl({}, i.state, { idx: c }), ""));
  function u() {
    return (i.state || { idx: null }).idx;
  }
  function f() {
    l = Vn.Pop;
    let S = u(),
      v = S == null ? null : S - c;
    (c = S), a && a({ action: l, location: h.location, delta: v });
  }
  function d(S, v) {
    l = Vn.Push;
    let g = Lu(h.location, S, v);
    c = u() + 1;
    let y = hh(g, c),
      b = h.createHref(g);
    try {
      i.pushState(y, "", b);
    } catch (C) {
      if (C instanceof DOMException && C.name === "DataCloneError") throw C;
      o.location.assign(b);
    }
    s && a && a({ action: l, location: h.location, delta: 1 });
  }
  function m(S, v) {
    l = Vn.Replace;
    let g = Lu(h.location, S, v);
    c = u();
    let y = hh(g, c),
      b = h.createHref(g);
    i.replaceState(y, "", b),
      s && a && a({ action: l, location: h.location, delta: 0 });
  }
  function p(S) {
    let v = o.location.origin !== "null" ? o.location.origin : o.location.href,
      g = typeof S == "string" ? S : y1(S);
    return (
      (g = g.replace(/ $/, "%20")),
      ht(
        v,
        "No window.location.(origin|href) available to create URL for href: " +
          g
      ),
      new URL(g, v)
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
        o.addEventListener(mh, f),
        (a = S),
        () => {
          o.removeEventListener(mh, f), (a = null);
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
    push: d,
    replace: m,
    go(S) {
      return i.go(S);
    },
  };
  return h;
}
var gh;
(function (e) {
  (e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error");
})(gh || (gh = {}));
function $T(e, t, n) {
  n === void 0 && (n = "/");
  let r = typeof t == "string" ? _a(t) : t,
    o = S1(r.pathname || "/", n);
  if (o == null) return null;
  let s = v1(e);
  LT(s);
  let i = null;
  for (let l = 0; i == null && l < s.length; ++l) {
    let a = YT(o);
    i = HT(s[l], a);
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
      (ht(
        a.relativePath.startsWith(r),
        'Absolute route path "' +
          a.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes."
      ),
      (a.relativePath = a.relativePath.slice(r.length)));
    let c = uo([r, a.relativePath]),
      u = n.concat(a);
    s.children &&
      s.children.length > 0 &&
      (ht(
        s.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".')
      ),
      v1(s.children, t, u, c)),
      !(s.path == null && !s.index) &&
        t.push({ path: c, score: BT(c, s.index), routesMeta: u });
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
function LT(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : VT(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex)
        )
  );
}
const jT = /^:[\w-]+$/,
  AT = 3,
  FT = 2,
  MT = 1,
  zT = 10,
  IT = -2,
  yh = (e) => e === "*";
function BT(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(yh) && (r += IT),
    t && (r += FT),
    n
      .filter((o) => !yh(o))
      .reduce((o, s) => o + (jT.test(s) ? AT : s === "" ? MT : zT), r)
  );
}
function VT(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, o) => r === t[o])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function HT(e, t) {
  let { routesMeta: n } = e,
    r = {},
    o = "/",
    s = [];
  for (let i = 0; i < n.length; ++i) {
    let l = n[i],
      a = i === n.length - 1,
      c = o === "/" ? t : t.slice(o.length) || "/",
      u = UT(
        { path: l.relativePath, caseSensitive: l.caseSensitive, end: a },
        c
      );
    if (!u) return null;
    Object.assign(r, u.params);
    let f = l.route;
    s.push({
      params: r,
      pathname: uo([o, u.pathname]),
      pathnameBase: KT(uo([o, u.pathnameBase])),
      route: f,
    }),
      u.pathnameBase !== "/" && (o = uo([o, u.pathnameBase]));
  }
  return s;
}
function UT(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = WT(e.path, e.caseSensitive, e.end),
    o = t.match(n);
  if (!o) return null;
  let s = o[0],
    i = s.replace(/(.)\/+$/, "$1"),
    l = o.slice(1);
  return {
    params: r.reduce((c, u, f) => {
      let { paramName: d, isOptional: m } = u;
      if (d === "*") {
        let h = l[f] || "";
        i = s.slice(0, s.length - h.length).replace(/(.)\/+$/, "$1");
      }
      const p = l[f];
      return (
        m && !p ? (c[d] = void 0) : (c[d] = (p || "").replace(/%2F/g, "/")), c
      );
    }, {}),
    pathname: s,
    pathnameBase: i,
    pattern: e,
  };
}
function WT(e, t, n) {
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
function YT(e) {
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
function S1(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const uo = (e) => e.join("/").replace(/\/\/+/g, "/"),
  KT = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/");
function GT(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const x1 = ["post", "put", "patch", "delete"];
new Set(x1);
const XT = ["get", ...x1];
new Set(XT);
/**
 * React Router v6.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function El() {
  return (
    (El = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    El.apply(this, arguments)
  );
}
const qT = w.createContext(null),
  QT = w.createContext(null),
  b1 = w.createContext(null),
  Ra = w.createContext(null),
  Xs = w.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  C1 = w.createContext(null);
function Fd() {
  return w.useContext(Ra) != null;
}
function JT() {
  return Fd() || ht(!1), w.useContext(Ra).location;
}
function ZT() {
  let { matches: e } = w.useContext(Xs),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function eO(e, t) {
  return tO(e, t);
}
function tO(e, t, n, r) {
  Fd() || ht(!1);
  let { navigator: o } = w.useContext(b1),
    { matches: s } = w.useContext(Xs),
    i = s[s.length - 1],
    l = i ? i.params : {};
  i && i.pathname;
  let a = i ? i.pathnameBase : "/";
  i && i.route;
  let c = JT(),
    u;
  if (t) {
    var f;
    let S = typeof t == "string" ? _a(t) : t;
    a === "/" || ((f = S.pathname) != null && f.startsWith(a)) || ht(!1),
      (u = S);
  } else u = c;
  let d = u.pathname || "/",
    m = d;
  if (a !== "/") {
    let S = a.replace(/^\//, "").split("/");
    m = "/" + d.replace(/^\//, "").split("/").slice(S.length).join("/");
  }
  let p = $T(e, { pathname: m }),
    h = iO(
      p &&
        p.map((S) =>
          Object.assign({}, S, {
            params: Object.assign({}, l, S.params),
            pathname: uo([
              a,
              o.encodeLocation
                ? o.encodeLocation(S.pathname).pathname
                : S.pathname,
            ]),
            pathnameBase:
              S.pathnameBase === "/"
                ? a
                : uo([
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
    ? w.createElement(
        Ra.Provider,
        {
          value: {
            location: El(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              u
            ),
            navigationType: Vn.Pop,
          },
        },
        h
      )
    : h;
}
function nO() {
  let e = uO(),
    t = GT(e)
      ? e.status + " " + e.statusText
      : e instanceof Error
      ? e.message
      : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    o = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return w.createElement(
    w.Fragment,
    null,
    w.createElement("h2", null, "Unexpected Application Error!"),
    w.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? w.createElement("pre", { style: o }, n) : null,
    null
  );
}
const rO = w.createElement(nO, null);
class oO extends w.Component {
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
      ? w.createElement(
          Xs.Provider,
          { value: this.props.routeContext },
          w.createElement(C1.Provider, {
            value: this.state.error,
            children: this.props.component,
          })
        )
      : this.props.children;
  }
}
function sO(e) {
  let { routeContext: t, match: n, children: r } = e,
    o = w.useContext(qT);
  return (
    o &&
      o.static &&
      o.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (o.staticContext._deepestRenderedBoundaryId = n.route.id),
    w.createElement(Xs.Provider, { value: t }, r)
  );
}
function iO(e, t, n, r) {
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
      (f) => f.route.id && (l == null ? void 0 : l[f.route.id]) !== void 0
    );
    u >= 0 || ht(!1), (i = i.slice(0, Math.min(i.length, u + 1)));
  }
  let a = !1,
    c = -1;
  if (n && r && r.v7_partialHydration)
    for (let u = 0; u < i.length; u++) {
      let f = i[u];
      if (
        ((f.route.HydrateFallback || f.route.hydrateFallbackElement) && (c = u),
        f.route.id)
      ) {
        let { loaderData: d, errors: m } = n,
          p =
            f.route.loader &&
            d[f.route.id] === void 0 &&
            (!m || m[f.route.id] === void 0);
        if (f.route.lazy || p) {
          (a = !0), c >= 0 ? (i = i.slice(0, c + 1)) : (i = [i[0]]);
          break;
        }
      }
    }
  return i.reduceRight((u, f, d) => {
    let m,
      p = !1,
      h = null,
      S = null;
    n &&
      ((m = l && f.route.id ? l[f.route.id] : void 0),
      (h = f.route.errorElement || rO),
      a &&
        (c < 0 && d === 0
          ? ((p = !0), (S = null))
          : c === d &&
            ((p = !0), (S = f.route.hydrateFallbackElement || null))));
    let v = t.concat(i.slice(0, d + 1)),
      g = () => {
        let y;
        return (
          m
            ? (y = h)
            : p
            ? (y = S)
            : f.route.Component
            ? (y = w.createElement(f.route.Component, null))
            : f.route.element
            ? (y = f.route.element)
            : (y = u),
          w.createElement(sO, {
            match: f,
            routeContext: { outlet: u, matches: v, isDataRoute: n != null },
            children: y,
          })
        );
      };
    return n && (f.route.ErrorBoundary || f.route.errorElement || d === 0)
      ? w.createElement(oO, {
          location: n.location,
          revalidation: n.revalidation,
          component: h,
          error: m,
          children: g(),
          routeContext: { outlet: null, matches: v, isDataRoute: !0 },
        })
      : g();
  }, null);
}
var ju = (function (e) {
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
})(ju || {});
function lO(e) {
  let t = w.useContext(QT);
  return t || ht(!1), t;
}
function aO(e) {
  let t = w.useContext(Xs);
  return t || ht(!1), t;
}
function cO(e) {
  let t = aO(),
    n = t.matches[t.matches.length - 1];
  return n.route.id || ht(!1), n.route.id;
}
function uO() {
  var e;
  let t = w.useContext(C1),
    n = lO(ju.UseRouteError),
    r = cO(ju.UseRouteError);
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function Au(e) {
  ht(!1);
}
function fO(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: o = Vn.Pop,
    navigator: s,
    static: i = !1,
    future: l,
  } = e;
  Fd() && ht(!1);
  let a = t.replace(/^\/*/, "/"),
    c = w.useMemo(
      () => ({
        basename: a,
        navigator: s,
        static: i,
        future: El({ v7_relativeSplatPath: !1 }, l),
      }),
      [a, l, s, i]
    );
  typeof r == "string" && (r = _a(r));
  let {
      pathname: u = "/",
      search: f = "",
      hash: d = "",
      state: m = null,
      key: p = "default",
    } = r,
    h = w.useMemo(() => {
      let S = S1(u, a);
      return S == null
        ? null
        : {
            location: { pathname: S, search: f, hash: d, state: m, key: p },
            navigationType: o,
          };
    }, [a, u, f, d, m, p, o]);
  return h == null
    ? null
    : w.createElement(
        b1.Provider,
        { value: c },
        w.createElement(Ra.Provider, { children: n, value: h })
      );
}
function dO(e) {
  let { children: t, location: n } = e;
  return eO(Fu(t), n);
}
new Promise(() => {});
function Fu(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    w.Children.forEach(e, (r, o) => {
      if (!w.isValidElement(r)) return;
      let s = [...t, o];
      if (r.type === w.Fragment) {
        n.push.apply(n, Fu(r.props.children, s));
        return;
      }
      r.type !== Au && ht(!1), !r.props.index || !r.props.children || ht(!1);
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
      r.props.children && (i.children = Fu(r.props.children, s)), n.push(i);
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
 */ const pO = "6";
try {
  window.__reactRouterVersion = pO;
} catch {}
const mO = "startTransition",
  vh = $h[mO];
function hO(e) {
  let { basename: t, children: n, future: r, window: o } = e,
    s = w.useRef();
  s.current == null && (s.current = TT({ window: o, v5Compat: !0 }));
  let i = s.current,
    [l, a] = w.useState({ action: i.action, location: i.location }),
    { v7_startTransition: c } = r || {},
    u = w.useCallback(
      (f) => {
        c && vh ? vh(() => a(f)) : a(f);
      },
      [a, c]
    );
  return (
    w.useLayoutEffect(() => i.listen(u), [i, u]),
    w.createElement(fO, {
      basename: t,
      children: n,
      location: l.location,
      navigationType: l.action,
      navigator: i,
      future: r,
    })
  );
}
var wh;
(function (e) {
  (e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState");
})(wh || (wh = {}));
var Sh;
(function (e) {
  (e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration");
})(Sh || (Sh = {}));
const gO = (e, t) => {
  const [n, r] = w.useState([]),
    [o, s] = w.useState([]),
    [i, l] = w.useState(!1),
    [a, c] = w.useState(!0),
    [u, f] = w.useState(null),
    [d, m] = w.useState(null);
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
    w.useEffect(
      () => (
        (async () => {
          c(!0),
            await De.get(fD + e)
              .then((v) => {
                r(v.data), l(!0);
              })
              .catch((v) => {
                f(v);
              })
              .finally(() => {
                c(!1);
              });
        })(),
        () => {}
      ),
      []
    ),
    w.useEffect(
      () => (
        i &&
          t !== void 0 &&
          (async () => (
            c(!0),
            await De.get(k0 + t + "/", h)
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
    { data1: n, data2: o, isLoading: a, error1: u, error2: d }
  );
};
var xh = { BASE_URL: "./", MODE: "production", DEV: !1, PROD: !0, SSR: !1 };
const yO = G_(h1),
  vO = X_(yO),
  bh = () => {
    console.log("ProfileFormWrapper", xh), console.log(xh.VITE_SOME_KEY);
    const { brokerSubmissionId: e } = ZT(),
      t = localStorage.getItem("profileName") || uD,
      { data1: n, data2: r, isLoading: o, error1: s, error2: i } = gO(t, e);
    return x.jsxs("div", {
      children: [
        x.jsx("h1", { children: "ProfileForm" }),
        x.jsx(vO, {
          profileData: n,
          submissionData: r,
          isLoading: o,
          profileError: s,
          submissionError: i,
        }),
      ],
    });
  };
function wO() {
  return x.jsx(ov, {
    children: x.jsxs(dO, {
      children: [
        x.jsx(Au, { path: "/", element: x.jsx(bh, {}) }),
        x.jsx(Au, { path: "/:brokerSubmissionId", element: x.jsx(bh, {}) }),
      ],
    }),
  });
}
console.log("main.jsx ---> ROUTER");
let Da = "generic";
window.props !== void 0 && (Da = window.props.profile_name || "generic");
localStorage.setItem("profileName", Da);
console.log("main.jsx ---> ROUTER | set dyn.: ", Da);
const SO = "/profile/profile/" + Da + "/ui/";
wc.createRoot(document.getElementById("root")).render(
  x.jsx(_l.StrictMode, {
    children: x.jsx(hO, { basename: SO, children: x.jsx(wO, {}) }),
  })
);
