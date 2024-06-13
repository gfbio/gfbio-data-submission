function Aw(e, t) {
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
var zu =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
    ? window
    : typeof global < "u"
    ? global
    : typeof self < "u"
    ? self
    : {};
function Tr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default")
    ? e.default
    : e;
}
var Dh = { exports: {} },
  Rl = {},
  Ph = { exports: {} },
  ue = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var js = Symbol.for("react.element"),
  Fw = Symbol.for("react.portal"),
  Mw = Symbol.for("react.fragment"),
  zw = Symbol.for("react.strict_mode"),
  Iw = Symbol.for("react.profiler"),
  Bw = Symbol.for("react.provider"),
  Hw = Symbol.for("react.context"),
  Vw = Symbol.for("react.forward_ref"),
  Uw = Symbol.for("react.suspense"),
  Ww = Symbol.for("react.memo"),
  Yw = Symbol.for("react.lazy"),
  Ud = Symbol.iterator;
function Kw(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Ud && e[Ud]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Th = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Nh = Object.assign,
  Oh = {};
function _o(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = Oh),
    (this.updater = n || Th);
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
function $h() {}
$h.prototype = _o.prototype;
function Iu(e, t, n) {
  (this.props = e),
    (this.context = t),
    (this.refs = Oh),
    (this.updater = n || Th);
}
var Bu = (Iu.prototype = new $h());
Bu.constructor = Iu;
Nh(Bu, _o.prototype);
Bu.isPureReactComponent = !0;
var Wd = Array.isArray,
  jh = Object.prototype.hasOwnProperty,
  Hu = { current: null },
  Lh = { key: !0, ref: !0, __self: !0, __source: !0 };
function Ah(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (i = t.ref),
    t.key !== void 0 && (s = "" + t.key),
    t))
      jh.call(t, r) && !Lh.hasOwnProperty(r) && (o[r] = t[r]);
  var l = arguments.length - 2;
  if (l === 1) o.children = n;
  else if (1 < l) {
    for (var a = Array(l), c = 0; c < l; c++) a[c] = arguments[c + 2];
    o.children = a;
  }
  if (e && e.defaultProps)
    for (r in ((l = e.defaultProps), l)) o[r] === void 0 && (o[r] = l[r]);
  return {
    $$typeof: js,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: Hu.current,
  };
}
function qw(e, t) {
  return {
    $$typeof: js,
    type: e.type,
    key: t,
    ref: e.ref,
    props: e.props,
    _owner: e._owner,
  };
}
function Vu(e) {
  return typeof e == "object" && e !== null && e.$$typeof === js;
}
function Gw(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var Yd = /\/+/g;
function Pa(e, t) {
  return typeof e == "object" && e !== null && e.key != null
    ? Gw("" + e.key)
    : t.toString(36);
}
function Ei(e, t, n, r, o) {
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
          case js:
          case Fw:
            i = !0;
        }
    }
  if (i)
    return (
      (i = e),
      (o = o(i)),
      (e = r === "" ? "." + Pa(i, 0) : r),
      Wd(o)
        ? ((n = ""),
          e != null && (n = e.replace(Yd, "$&/") + "/"),
          Ei(o, t, n, "", function (c) {
            return c;
          }))
        : o != null &&
          (Vu(o) &&
            (o = qw(
              o,
              n +
                (!o.key || (i && i.key === o.key)
                  ? ""
                  : ("" + o.key).replace(Yd, "$&/") + "/") +
                e
            )),
          t.push(o)),
      1
    );
  if (((i = 0), (r = r === "" ? "." : r + ":"), Wd(e)))
    for (var l = 0; l < e.length; l++) {
      s = e[l];
      var a = r + Pa(s, l);
      i += Ei(s, t, n, a, o);
    }
  else if (((a = Kw(e)), typeof a == "function"))
    for (e = a.call(e), l = 0; !(s = e.next()).done; )
      (s = s.value), (a = r + Pa(s, l++)), (i += Ei(s, t, n, a, o));
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
function Qs(e, t, n) {
  if (e == null) return e;
  var r = [],
    o = 0;
  return (
    Ei(e, r, "", "", function (s) {
      return t.call(n, s, o++);
    }),
    r
  );
}
function Xw(e) {
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
  ki = { transition: null },
  Qw = {
    ReactCurrentDispatcher: rt,
    ReactCurrentBatchConfig: ki,
    ReactCurrentOwner: Hu,
  };
function Fh() {
  throw Error("act(...) is not supported in production builds of React.");
}
ue.Children = {
  map: Qs,
  forEach: function (e, t, n) {
    Qs(
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
      Qs(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      Qs(e, function (t) {
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
ue.Fragment = Mw;
ue.Profiler = Iw;
ue.PureComponent = Iu;
ue.StrictMode = zw;
ue.Suspense = Uw;
ue.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Qw;
ue.act = Fh;
ue.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " +
        e +
        "."
    );
  var r = Nh({}, e.props),
    o = e.key,
    s = e.ref,
    i = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((s = t.ref), (i = Hu.current)),
      t.key !== void 0 && (o = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var l = e.type.defaultProps;
    for (a in t)
      jh.call(t, a) &&
        !Lh.hasOwnProperty(a) &&
        (r[a] = t[a] === void 0 && l !== void 0 ? l[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    l = Array(a);
    for (var c = 0; c < a; c++) l[c] = arguments[c + 2];
    r.children = l;
  }
  return { $$typeof: js, type: e.type, key: o, ref: s, props: r, _owner: i };
};
ue.createContext = function (e) {
  return (
    (e = {
      $$typeof: Hw,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: Bw, _context: e }),
    (e.Consumer = e)
  );
};
ue.createElement = Ah;
ue.createFactory = function (e) {
  var t = Ah.bind(null, e);
  return (t.type = e), t;
};
ue.createRef = function () {
  return { current: null };
};
ue.forwardRef = function (e) {
  return { $$typeof: Vw, render: e };
};
ue.isValidElement = Vu;
ue.lazy = function (e) {
  return { $$typeof: Yw, _payload: { _status: -1, _result: e }, _init: Xw };
};
ue.memo = function (e, t) {
  return { $$typeof: Ww, type: e, compare: t === void 0 ? null : t };
};
ue.startTransition = function (e) {
  var t = ki.transition;
  ki.transition = {};
  try {
    e();
  } finally {
    ki.transition = t;
  }
};
ue.unstable_act = Fh;
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
Ph.exports = ue;
var w = Ph.exports;
const Dl = Tr(w),
  Mh = Aw({ __proto__: null, default: Dl }, [w]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Jw = w,
  Zw = Symbol.for("react.element"),
  e1 = Symbol.for("react.fragment"),
  t1 = Object.prototype.hasOwnProperty,
  n1 = Jw.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  r1 = { key: !0, ref: !0, __self: !0, __source: !0 };
function zh(e, t, n) {
  var r,
    o = {},
    s = null,
    i = null;
  n !== void 0 && (s = "" + n),
    t.key !== void 0 && (s = "" + t.key),
    t.ref !== void 0 && (i = t.ref);
  for (r in t) t1.call(t, r) && !r1.hasOwnProperty(r) && (o[r] = t[r]);
  if (e && e.defaultProps)
    for (r in ((t = e.defaultProps), t)) o[r] === void 0 && (o[r] = t[r]);
  return {
    $$typeof: Zw,
    type: e,
    key: s,
    ref: i,
    props: o,
    _owner: n1.current,
  };
}
Rl.Fragment = e1;
Rl.jsx = zh;
Rl.jsxs = zh;
Dh.exports = Rl;
var S = Dh.exports,
  Sc = {},
  Ih = { exports: {} },
  bt = {},
  Bh = { exports: {} },
  Hh = {};
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
      var O = ($ - 1) >>> 1,
        I = _[O];
      if (0 < o(I, k)) (_[O] = k), (_[$] = I), ($ = O);
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
      e: for (var O = 0, I = _.length, Y = I >>> 1; O < Y; ) {
        var X = 2 * (O + 1) - 1,
          ee = _[X],
          ne = X + 1,
          te = _[ne];
        if (0 > o(ee, $))
          ne < I && 0 > o(te, ee)
            ? ((_[O] = te), (_[ne] = $), (O = ne))
            : ((_[O] = ee), (_[X] = $), (O = X));
        else if (ne < I && 0 > o(te, $)) (_[O] = te), (_[ne] = $), (O = ne);
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
    x = typeof setTimeout == "function" ? setTimeout : null,
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
        k !== null && N(b, k.startTime - _);
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
        var O = f.callback;
        if (typeof O == "function") {
          (f.callback = null), (d = f.priorityLevel);
          var I = O(f.expirationTime <= k);
          (k = e.unstable_now()),
            typeof I == "function" ? (f.callback = I) : f === n(a) && r(a),
            y(k);
        } else r(a);
        f = n(a);
      }
      if (f !== null) var Y = !0;
      else {
        var X = n(c);
        X !== null && N(b, X.startTime - k), (Y = !1);
      }
      return Y;
    } finally {
      (f = null), (d = $), (m = !1);
    }
  }
  var E = !1,
    R = null,
    D = -1,
    L = 5,
    T = -1;
  function M() {
    return !(e.unstable_now() - T < L);
  }
  function B() {
    if (R !== null) {
      var _ = e.unstable_now();
      T = _;
      var k = !0;
      try {
        k = R(!0, _);
      } finally {
        k ? V() : ((E = !1), (R = null));
      }
    } else E = !1;
  }
  var V;
  if (typeof g == "function")
    V = function () {
      g(B);
    };
  else if (typeof MessageChannel < "u") {
    var F = new MessageChannel(),
      j = F.port2;
    (F.port1.onmessage = B),
      (V = function () {
        j.postMessage(null);
      });
  } else
    V = function () {
      x(B, 0);
    };
  function P(_) {
    (R = _), E || ((E = !0), V());
  }
  function N(_, k) {
    D = x(function () {
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
        : (L = 0 < _ ? Math.floor(1e3 / _) : 5);
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
      var O = e.unstable_now();
      switch (
        (typeof $ == "object" && $ !== null
          ? (($ = $.delay), ($ = typeof $ == "number" && 0 < $ ? O + $ : O))
          : ($ = O),
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
        $ > O
          ? ((_.sortIndex = $),
            t(c, _),
            n(a) === null &&
              _ === n(c) &&
              (h ? (v(D), (D = -1)) : (h = !0), N(b, $ - O)))
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
})(Hh);
Bh.exports = Hh;
var o1 = Bh.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var s1 = w,
  xt = o1;
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
var Vh = new Set(),
  fs = {};
function Nr(e, t) {
  po(e, t), po(e + "Capture", t);
}
function po(e, t) {
  for (fs[e] = t, e = 0; e < t.length; e++) Vh.add(t[e]);
}
var Sn = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  xc = Object.prototype.hasOwnProperty,
  i1 =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  Kd = {},
  qd = {};
function l1(e) {
  return xc.call(qd, e)
    ? !0
    : xc.call(Kd, e)
    ? !1
    : i1.test(e)
    ? (qd[e] = !0)
    : ((Kd[e] = !0), !1);
}
function a1(e, t, n, r) {
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
function c1(e, t, n, r) {
  if (t === null || typeof t > "u" || a1(e, t, n, r)) return !0;
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
var Uu = /[\-:]([a-z])/g;
function Wu(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Uu, Wu);
    Ue[t] = new ot(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Uu, Wu);
    Ue[t] = new ot(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Uu, Wu);
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
function Yu(e, t, n, r) {
  var o = Ue.hasOwnProperty(t) ? Ue[t] : null;
  (o !== null
    ? o.type !== 0
    : r ||
      !(2 < t.length) ||
      (t[0] !== "o" && t[0] !== "O") ||
      (t[1] !== "n" && t[1] !== "N")) &&
    (c1(t, n, o, r) && (n = null),
    r || o === null
      ? l1(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
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
var kn = s1.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  Js = Symbol.for("react.element"),
  Vr = Symbol.for("react.portal"),
  Ur = Symbol.for("react.fragment"),
  Ku = Symbol.for("react.strict_mode"),
  bc = Symbol.for("react.profiler"),
  Uh = Symbol.for("react.provider"),
  Wh = Symbol.for("react.context"),
  qu = Symbol.for("react.forward_ref"),
  Cc = Symbol.for("react.suspense"),
  Ec = Symbol.for("react.suspense_list"),
  Gu = Symbol.for("react.memo"),
  jn = Symbol.for("react.lazy"),
  Yh = Symbol.for("react.offscreen"),
  Gd = Symbol.iterator;
function zo(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (Gd && e[Gd]) || e["@@iterator"]),
      typeof e == "function" ? e : null);
}
var Ee = Object.assign,
  Ta;
function Jo(e) {
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
var Na = !1;
function Oa(e, t) {
  if (!e || Na) return "";
  Na = !0;
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
    (Na = !1), (Error.prepareStackTrace = n);
  }
  return (e = e ? e.displayName || e.name : "") ? Jo(e) : "";
}
function u1(e) {
  switch (e.tag) {
    case 5:
      return Jo(e.type);
    case 16:
      return Jo("Lazy");
    case 13:
      return Jo("Suspense");
    case 19:
      return Jo("SuspenseList");
    case 0:
    case 2:
    case 15:
      return (e = Oa(e.type, !1)), e;
    case 11:
      return (e = Oa(e.type.render, !1)), e;
    case 1:
      return (e = Oa(e.type, !0)), e;
    default:
      return "";
  }
}
function kc(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Ur:
      return "Fragment";
    case Vr:
      return "Portal";
    case bc:
      return "Profiler";
    case Ku:
      return "StrictMode";
    case Cc:
      return "Suspense";
    case Ec:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Wh:
        return (e.displayName || "Context") + ".Consumer";
      case Uh:
        return (e._context.displayName || "Context") + ".Provider";
      case qu:
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
          (t = e.displayName || null), t !== null ? t : kc(e.type) || "Memo"
        );
      case jn:
        (t = e._payload), (e = e._init);
        try {
          return kc(e(t));
        } catch {}
    }
  return null;
}
function f1(e) {
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
      return kc(t);
    case 8:
      return t === Ku ? "StrictMode" : "Mode";
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
function Kh(e) {
  var t = e.type;
  return (
    (e = e.nodeName) &&
    e.toLowerCase() === "input" &&
    (t === "checkbox" || t === "radio")
  );
}
function d1(e) {
  var t = Kh(e) ? "checked" : "value",
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
function Zs(e) {
  e._valueTracker || (e._valueTracker = d1(e));
}
function qh(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = Kh(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Bi(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u"))
    return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function _c(e, t) {
  var n = t.checked;
  return Ee({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function Xd(e, t) {
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
function Gh(e, t) {
  (t = t.checked), t != null && Yu(e, "checked", t, !1);
}
function Rc(e, t) {
  Gh(e, t);
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
    ? Dc(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && Dc(e, t.type, Qn(t.defaultValue)),
    t.checked == null &&
      t.defaultChecked != null &&
      (e.defaultChecked = !!t.defaultChecked);
}
function Qd(e, t, n) {
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
function Dc(e, t, n) {
  (t !== "number" || Bi(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Zo = Array.isArray;
function no(e, t, n, r) {
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
function Pc(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(H(91));
  return Ee({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function Jd(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(H(92));
      if (Zo(n)) {
        if (1 < n.length) throw Error(H(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), (n = t);
  }
  e._wrapperState = { initialValue: Qn(n) };
}
function Xh(e, t) {
  var n = Qn(t.value),
    r = Qn(t.defaultValue);
  n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r);
}
function Zd(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Qh(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Tc(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? Qh(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
    ? "http://www.w3.org/1999/xhtml"
    : e;
}
var ei,
  Jh = (function (e) {
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
        ei = ei || document.createElement("div"),
          ei.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = ei.firstChild;
        e.firstChild;

      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function ds(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var ns = {
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
  p1 = ["Webkit", "ms", "Moz", "O"];
Object.keys(ns).forEach(function (e) {
  p1.forEach(function (t) {
    (t = t + e.charAt(0).toUpperCase() + e.substring(1)), (ns[t] = ns[e]);
  });
});
function Zh(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (ns.hasOwnProperty(e) && ns[e])
    ? ("" + t).trim()
    : t + "px";
}
function eg(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        o = Zh(n, t[n], r);
      n === "float" && (n = "cssFloat"), r ? e.setProperty(n, o) : (e[n] = o);
    }
}
var m1 = Ee(
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
function Nc(e, t) {
  if (t) {
    if (m1[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
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
var $c = null;
function Xu(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var jc = null,
  ro = null,
  oo = null;
function ep(e) {
  if ((e = Fs(e))) {
    if (typeof jc != "function") throw Error(H(280));
    var t = e.stateNode;
    t && ((t = $l(t)), jc(e.stateNode, e.type, t));
  }
}
function tg(e) {
  ro ? (oo ? oo.push(e) : (oo = [e])) : (ro = e);
}
function ng() {
  if (ro) {
    var e = ro,
      t = oo;
    if (((oo = ro = null), ep(e), t)) for (e = 0; e < t.length; e++) ep(t[e]);
  }
}
function rg(e, t) {
  return e(t);
}
function og() {}
var $a = !1;
function sg(e, t, n) {
  if ($a) return e(t, n);
  $a = !0;
  try {
    return rg(e, t, n);
  } finally {
    ($a = !1), (ro !== null || oo !== null) && (og(), ng());
  }
}
function ps(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = $l(n);
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
var Lc = !1;
if (Sn)
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
function h1(e, t, n, r, o, s, i, l, a) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (u) {
    this.onError(u);
  }
}
var rs = !1,
  Hi = null,
  Vi = !1,
  Ac = null,
  g1 = {
    onError: function (e) {
      (rs = !0), (Hi = e);
    },
  };
function y1(e, t, n, r, o, s, i, l, a) {
  (rs = !1), (Hi = null), h1.apply(g1, arguments);
}
function v1(e, t, n, r, o, s, i, l, a) {
  if ((y1.apply(this, arguments), rs)) {
    if (rs) {
      var c = Hi;
      (rs = !1), (Hi = null);
    } else throw Error(H(198));
    Vi || ((Vi = !0), (Ac = c));
  }
}
function Or(e) {
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
function ig(e) {
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
function tp(e) {
  if (Or(e) !== e) throw Error(H(188));
}
function w1(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = Or(e)), t === null)) throw Error(H(188));
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
        if (s === n) return tp(o), e;
        if (s === r) return tp(o), t;
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
function lg(e) {
  return (e = w1(e)), e !== null ? ag(e) : null;
}
function ag(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = ag(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var cg = xt.unstable_scheduleCallback,
  np = xt.unstable_cancelCallback,
  S1 = xt.unstable_shouldYield,
  x1 = xt.unstable_requestPaint,
  Pe = xt.unstable_now,
  b1 = xt.unstable_getCurrentPriorityLevel,
  Qu = xt.unstable_ImmediatePriority,
  ug = xt.unstable_UserBlockingPriority,
  Ui = xt.unstable_NormalPriority,
  C1 = xt.unstable_LowPriority,
  fg = xt.unstable_IdlePriority,
  Pl = null,
  ln = null;
function E1(e) {
  if (ln && typeof ln.onCommitFiberRoot == "function")
    try {
      ln.onCommitFiberRoot(Pl, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var Ht = Math.clz32 ? Math.clz32 : R1,
  k1 = Math.log,
  _1 = Math.LN2;
function R1(e) {
  return (e >>>= 0), e === 0 ? 32 : (31 - ((k1(e) / _1) | 0)) | 0;
}
var ti = 64,
  ni = 4194304;
function es(e) {
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
function Wi(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    o = e.suspendedLanes,
    s = e.pingedLanes,
    i = n & 268435455;
  if (i !== 0) {
    var l = i & ~o;
    l !== 0 ? (r = es(l)) : ((s &= i), s !== 0 && (r = es(s)));
  } else (i = n & ~o), i !== 0 ? (r = es(i)) : s !== 0 && (r = es(s));
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
      (n = 31 - Ht(t)), (o = 1 << n), (r |= e[n]), (t &= ~o);
  return r;
}
function D1(e, t) {
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
function P1(e, t) {
  for (
    var n = e.suspendedLanes,
      r = e.pingedLanes,
      o = e.expirationTimes,
      s = e.pendingLanes;
    0 < s;

  ) {
    var i = 31 - Ht(s),
      l = 1 << i,
      a = o[i];
    a === -1
      ? (!(l & n) || l & r) && (o[i] = D1(l, t))
      : a <= t && (e.expiredLanes |= l),
      (s &= ~l);
  }
}
function Fc(e) {
  return (
    (e = e.pendingLanes & -1073741825),
    e !== 0 ? e : e & 1073741824 ? 1073741824 : 0
  );
}
function dg() {
  var e = ti;
  return (ti <<= 1), !(ti & 4194240) && (ti = 64), e;
}
function ja(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Ls(e, t, n) {
  (e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - Ht(t)),
    (e[t] = n);
}
function T1(e, t) {
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
    var o = 31 - Ht(n),
      s = 1 << o;
    (t[o] = 0), (r[o] = -1), (e[o] = -1), (n &= ~s);
  }
}
function Ju(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - Ht(n),
      o = 1 << r;
    (o & t) | (e[r] & t) && (e[r] |= t), (n &= ~o);
  }
}
var pe = 0;
function pg(e) {
  return (e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1;
}
var mg,
  Zu,
  hg,
  gg,
  yg,
  Mc = !1,
  ri = [],
  Vn = null,
  Un = null,
  Wn = null,
  ms = new Map(),
  hs = new Map(),
  Fn = [],
  N1 =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " "
    );
function rp(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Vn = null;
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
      ms.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      hs.delete(t.pointerId);
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
      t !== null && ((t = Fs(t)), t !== null && Zu(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      o !== null && t.indexOf(o) === -1 && t.push(o),
      e);
}
function O1(e, t, n, r, o) {
  switch (t) {
    case "focusin":
      return (Vn = Bo(Vn, e, t, n, r, o)), !0;
    case "dragenter":
      return (Un = Bo(Un, e, t, n, r, o)), !0;
    case "mouseover":
      return (Wn = Bo(Wn, e, t, n, r, o)), !0;
    case "pointerover":
      var s = o.pointerId;
      return ms.set(s, Bo(ms.get(s) || null, e, t, n, r, o)), !0;
    case "gotpointercapture":
      return (
        (s = o.pointerId), hs.set(s, Bo(hs.get(s) || null, e, t, n, r, o)), !0
      );
  }
  return !1;
}
function vg(e) {
  var t = mr(e.target);
  if (t !== null) {
    var n = Or(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = ig(n)), t !== null)) {
          (e.blockedOn = t),
            yg(e.priority, function () {
              hg(n);
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
function _i(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = zc(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ($c = r), n.target.dispatchEvent(r), ($c = null);
    } else return (t = Fs(n)), t !== null && Zu(t), (e.blockedOn = n), !1;
    t.shift();
  }
  return !0;
}
function op(e, t, n) {
  _i(e) && n.delete(t);
}
function $1() {
  (Mc = !1),
    Vn !== null && _i(Vn) && (Vn = null),
    Un !== null && _i(Un) && (Un = null),
    Wn !== null && _i(Wn) && (Wn = null),
    ms.forEach(op),
    hs.forEach(op);
}
function Ho(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Mc ||
      ((Mc = !0),
      xt.unstable_scheduleCallback(xt.unstable_NormalPriority, $1)));
}
function gs(e) {
  function t(o) {
    return Ho(o, e);
  }
  if (0 < ri.length) {
    Ho(ri[0], e);
    for (var n = 1; n < ri.length; n++) {
      var r = ri[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Vn !== null && Ho(Vn, e),
      Un !== null && Ho(Un, e),
      Wn !== null && Ho(Wn, e),
      ms.forEach(t),
      hs.forEach(t),
      n = 0;
    n < Fn.length;
    n++
  )
    (r = Fn[n]), r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < Fn.length && ((n = Fn[0]), n.blockedOn === null); )
    vg(n), n.blockedOn === null && Fn.shift();
}
var so = kn.ReactCurrentBatchConfig,
  Yi = !0;
function j1(e, t, n, r) {
  var o = pe,
    s = so.transition;
  so.transition = null;
  try {
    (pe = 1), ef(e, t, n, r);
  } finally {
    (pe = o), (so.transition = s);
  }
}
function L1(e, t, n, r) {
  var o = pe,
    s = so.transition;
  so.transition = null;
  try {
    (pe = 4), ef(e, t, n, r);
  } finally {
    (pe = o), (so.transition = s);
  }
}
function ef(e, t, n, r) {
  if (Yi) {
    var o = zc(e, t, n, r);
    if (o === null) Ua(e, t, r, Ki, n), rp(e, r);
    else if (O1(o, e, t, n, r)) r.stopPropagation();
    else if ((rp(e, r), t & 4 && -1 < N1.indexOf(e))) {
      for (; o !== null; ) {
        var s = Fs(o);
        if (
          (s !== null && mg(s),
          (s = zc(e, t, n, r)),
          s === null && Ua(e, t, r, Ki, n),
          s === o)
        )
          break;
        o = s;
      }
      o !== null && r.stopPropagation();
    } else Ua(e, t, r, null, n);
  }
}
var Ki = null;
function zc(e, t, n, r) {
  if (((Ki = null), (e = Xu(r)), (e = mr(e)), e !== null))
    if (((t = Or(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = ig(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return (Ki = e), null;
}
function wg(e) {
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
      switch (b1()) {
        case Qu:
          return 1;
        case ug:
          return 4;
        case Ui:
        case C1:
          return 16;
        case fg:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var In = null,
  tf = null,
  Ri = null;
function Sg() {
  if (Ri) return Ri;
  var e,
    t = tf,
    n = t.length,
    r,
    o = "value" in In ? In.value : In.textContent,
    s = o.length;
  for (e = 0; e < n && t[e] === o[e]; e++);
  var i = n - e;
  for (r = 1; r <= i && t[n - r] === o[s - r]; r++);
  return (Ri = o.slice(e, 1 < r ? 1 - r : void 0));
}
function Di(e) {
  var t = e.keyCode;
  return (
    "charCode" in e
      ? ((e = e.charCode), e === 0 && t === 13 && (e = 13))
      : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function oi() {
  return !0;
}
function sp() {
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
        ? oi
        : sp),
      (this.isPropagationStopped = sp),
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
          (this.isDefaultPrevented = oi));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = oi));
      },
      persist: function () {},
      isPersistent: oi,
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
  nf = Ct(Ro),
  As = Ee({}, Ro, { view: 0, detail: 0 }),
  A1 = Ct(As),
  La,
  Aa,
  Vo,
  Tl = Ee({}, As, {
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
    getModifierState: rf,
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
        : (e !== Vo &&
            (Vo && e.type === "mousemove"
              ? ((La = e.screenX - Vo.screenX), (Aa = e.screenY - Vo.screenY))
              : (Aa = La = 0),
            (Vo = e)),
          La);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : Aa;
    },
  }),
  ip = Ct(Tl),
  F1 = Ee({}, Tl, { dataTransfer: 0 }),
  M1 = Ct(F1),
  z1 = Ee({}, As, { relatedTarget: 0 }),
  Fa = Ct(z1),
  I1 = Ee({}, Ro, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  B1 = Ct(I1),
  H1 = Ee({}, Ro, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  V1 = Ct(H1),
  U1 = Ee({}, Ro, { data: 0 }),
  lp = Ct(U1),
  W1 = {
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
  Y1 = {
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
  K1 = {
    Alt: "altKey",
    Control: "ctrlKey",
    Meta: "metaKey",
    Shift: "shiftKey",
  };
function q1(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = K1[e]) ? !!t[e] : !1;
}
function rf() {
  return q1;
}
var G1 = Ee({}, As, {
    key: function (e) {
      if (e.key) {
        var t = W1[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Di(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
        ? Y1[e.keyCode] || "Unidentified"
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
    getModifierState: rf,
    charCode: function (e) {
      return e.type === "keypress" ? Di(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Di(e)
        : e.type === "keydown" || e.type === "keyup"
        ? e.keyCode
        : 0;
    },
  }),
  X1 = Ct(G1),
  Q1 = Ee({}, Tl, {
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
  ap = Ct(Q1),
  J1 = Ee({}, As, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: rf,
  }),
  Z1 = Ct(J1),
  eS = Ee({}, Ro, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  tS = Ct(eS),
  nS = Ee({}, Tl, {
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
  rS = Ct(nS),
  oS = [9, 13, 27, 32],
  of = Sn && "CompositionEvent" in window,
  os = null;
Sn && "documentMode" in document && (os = document.documentMode);
var sS = Sn && "TextEvent" in window && !os,
  xg = Sn && (!of || (os && 8 < os && 11 >= os)),
  cp = " ",
  up = !1;
function bg(e, t) {
  switch (e) {
    case "keyup":
      return oS.indexOf(t.keyCode) !== -1;
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
function Cg(e) {
  return (e = e.detail), typeof e == "object" && "data" in e ? e.data : null;
}
var Wr = !1;
function iS(e, t) {
  switch (e) {
    case "compositionend":
      return Cg(t);
    case "keypress":
      return t.which !== 32 ? null : ((up = !0), cp);
    case "textInput":
      return (e = t.data), e === cp && up ? null : e;
    default:
      return null;
  }
}
function lS(e, t) {
  if (Wr)
    return e === "compositionend" || (!of && bg(e, t))
      ? ((e = Sg()), (Ri = tf = In = null), (Wr = !1), e)
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
      return xg && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var aS = {
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
function fp(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!aS[e.type] : t === "textarea";
}
function Eg(e, t, n, r) {
  tg(r),
    (t = qi(t, "onChange")),
    0 < t.length &&
      ((n = new nf("onChange", "change", null, n, r)),
      e.push({ event: n, listeners: t }));
}
var ss = null,
  ys = null;
function cS(e) {
  Lg(e, 0);
}
function Nl(e) {
  var t = qr(e);
  if (qh(t)) return e;
}
function uS(e, t) {
  if (e === "change") return t;
}
var kg = !1;
if (Sn) {
  var Ma;
  if (Sn) {
    var za = "oninput" in document;
    if (!za) {
      var dp = document.createElement("div");
      dp.setAttribute("oninput", "return;"),
        (za = typeof dp.oninput == "function");
    }
    Ma = za;
  } else Ma = !1;
  kg = Ma && (!document.documentMode || 9 < document.documentMode);
}
function pp() {
  ss && (ss.detachEvent("onpropertychange", _g), (ys = ss = null));
}
function _g(e) {
  if (e.propertyName === "value" && Nl(ys)) {
    var t = [];
    Eg(t, ys, e, Xu(e)), sg(cS, t);
  }
}
function fS(e, t, n) {
  e === "focusin"
    ? (pp(), (ss = t), (ys = n), ss.attachEvent("onpropertychange", _g))
    : e === "focusout" && pp();
}
function dS(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown")
    return Nl(ys);
}
function pS(e, t) {
  if (e === "click") return Nl(t);
}
function mS(e, t) {
  if (e === "input" || e === "change") return Nl(t);
}
function hS(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Wt = typeof Object.is == "function" ? Object.is : hS;
function vs(e, t) {
  if (Wt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null)
    return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var o = n[r];
    if (!xc.call(t, o) || !Wt(e[o], t[o])) return !1;
  }
  return !0;
}
function mp(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function hp(e, t) {
  var n = mp(e);
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
    n = mp(n);
  }
}
function Rg(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
      ? !1
      : t && t.nodeType === 3
      ? Rg(e, t.parentNode)
      : "contains" in e
      ? e.contains(t)
      : e.compareDocumentPosition
      ? !!(e.compareDocumentPosition(t) & 16)
      : !1
    : !1;
}
function Dg() {
  for (var e = window, t = Bi(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Bi(e.document);
  }
  return t;
}
function sf(e) {
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
function gS(e) {
  var t = Dg(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (
    t !== n &&
    n &&
    n.ownerDocument &&
    Rg(n.ownerDocument.documentElement, n)
  ) {
    if (r !== null && sf(n)) {
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
          (o = hp(n, s));
        var i = hp(n, r);
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
var yS = Sn && "documentMode" in document && 11 >= document.documentMode,
  Yr = null,
  Ic = null,
  is = null,
  Bc = !1;
function gp(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  Bc ||
    Yr == null ||
    Yr !== Bi(r) ||
    ((r = Yr),
    "selectionStart" in r && sf(r)
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
    (is && vs(is, r)) ||
      ((is = r),
      (r = qi(Ic, "onSelect")),
      0 < r.length &&
        ((t = new nf("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Yr))));
}
function si(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Kr = {
    animationend: si("Animation", "AnimationEnd"),
    animationiteration: si("Animation", "AnimationIteration"),
    animationstart: si("Animation", "AnimationStart"),
    transitionend: si("Transition", "TransitionEnd"),
  },
  Ia = {},
  Pg = {};
Sn &&
  ((Pg = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Kr.animationend.animation,
    delete Kr.animationiteration.animation,
    delete Kr.animationstart.animation),
  "TransitionEvent" in window || delete Kr.transitionend.transition);
function Ol(e) {
  if (Ia[e]) return Ia[e];
  if (!Kr[e]) return e;
  var t = Kr[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Pg) return (Ia[e] = t[n]);
  return e;
}
var Tg = Ol("animationend"),
  Ng = Ol("animationiteration"),
  Og = Ol("animationstart"),
  $g = Ol("transitionend"),
  jg = new Map(),
  yp =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " "
    );
function tr(e, t) {
  jg.set(e, t), Nr(t, [e]);
}
for (var Ba = 0; Ba < yp.length; Ba++) {
  var Ha = yp[Ba],
    vS = Ha.toLowerCase(),
    wS = Ha[0].toUpperCase() + Ha.slice(1);
  tr(vS, "on" + wS);
}
tr(Tg, "onAnimationEnd");
tr(Ng, "onAnimationIteration");
tr(Og, "onAnimationStart");
tr("dblclick", "onDoubleClick");
tr("focusin", "onFocus");
tr("focusout", "onBlur");
tr($g, "onTransitionEnd");
po("onMouseEnter", ["mouseout", "mouseover"]);
po("onMouseLeave", ["mouseout", "mouseover"]);
po("onPointerEnter", ["pointerout", "pointerover"]);
po("onPointerLeave", ["pointerout", "pointerover"]);
Nr(
  "onChange",
  "change click focusin focusout input keydown keyup selectionchange".split(" ")
);
Nr(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
    " "
  )
);
Nr("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Nr(
  "onCompositionEnd",
  "compositionend focusout keydown keypress keyup mousedown".split(" ")
);
Nr(
  "onCompositionStart",
  "compositionstart focusout keydown keypress keyup mousedown".split(" ")
);
Nr(
  "onCompositionUpdate",
  "compositionupdate focusout keydown keypress keyup mousedown".split(" ")
);
var ts =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " "
    ),
  SS = new Set("cancel close invalid load scroll toggle".split(" ").concat(ts));
function vp(e, t, n) {
  var r = e.type || "unknown-event";
  (e.currentTarget = n), v1(r, t, void 0, e), (e.currentTarget = null);
}
function Lg(e, t) {
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
          vp(o, l, c), (s = a);
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
          vp(o, l, c), (s = a);
        }
    }
  }
  if (Vi) throw ((e = Ac), (Vi = !1), (Ac = null), e);
}
function ve(e, t) {
  var n = t[Yc];
  n === void 0 && (n = t[Yc] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Ag(t, e, 2, !1), n.add(r));
}
function Va(e, t, n) {
  var r = 0;
  t && (r |= 4), Ag(n, e, r, t);
}
var ii = "_reactListening" + Math.random().toString(36).slice(2);
function ws(e) {
  if (!e[ii]) {
    (e[ii] = !0),
      Vh.forEach(function (n) {
        n !== "selectionchange" && (SS.has(n) || Va(n, !1, e), Va(n, !0, e));
      });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[ii] || ((t[ii] = !0), Va("selectionchange", !1, t));
  }
}
function Ag(e, t, n, r) {
  switch (wg(t)) {
    case 1:
      var o = j1;
      break;
    case 4:
      o = L1;
      break;
    default:
      o = ef;
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
  sg(function () {
    var c = s,
      u = Xu(n),
      f = [];
    e: {
      var d = jg.get(e);
      if (d !== void 0) {
        var m = nf,
          p = e;
        switch (e) {
          case "keypress":
            if (Di(n) === 0) break e;
          case "keydown":
          case "keyup":
            m = X1;
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
            m = ip;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            m = M1;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            m = Z1;
            break;
          case Tg:
          case Ng:
          case Og:
            m = B1;
            break;
          case $g:
            m = tS;
            break;
          case "scroll":
            m = A1;
            break;
          case "wheel":
            m = rS;
            break;
          case "copy":
          case "cut":
          case "paste":
            m = V1;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            m = ap;
        }
        var h = (t & 4) !== 0,
          x = !h && e === "scroll",
          v = h ? (d !== null ? d + "Capture" : null) : d;
        h = [];
        for (var g = c, y; g !== null; ) {
          y = g;
          var b = y.stateNode;
          if (
            (y.tag === 5 &&
              b !== null &&
              ((y = b),
              v !== null && ((b = ps(g, v)), b != null && h.push(Ss(g, b, y)))),
            x)
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
            n !== $c &&
            (p = n.relatedTarget || n.fromElement) &&
            (mr(p) || p[xn]))
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
                ((x = Or(p)), p !== x || (p.tag !== 5 && p.tag !== 6)) &&
                (p = null))
            : ((m = null), (p = c)),
          m !== p)
        ) {
          if (
            ((h = ip),
            (b = "onMouseLeave"),
            (v = "onMouseEnter"),
            (g = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((h = ap),
              (b = "onPointerLeave"),
              (v = "onPointerEnter"),
              (g = "pointer")),
            (x = m == null ? d : qr(m)),
            (y = p == null ? d : qr(p)),
            (d = new h(b, g + "leave", m, n, u)),
            (d.target = x),
            (d.relatedTarget = y),
            (b = null),
            mr(u) === c &&
              ((h = new h(v, g + "enter", p, n, u)),
              (h.target = y),
              (h.relatedTarget = x),
              (b = h)),
            (x = b),
            m && p)
          )
            t: {
              for (h = m, v = p, g = 0, y = h; y; y = Fr(y)) g++;
              for (y = 0, b = v; b; b = Fr(b)) y++;
              for (; 0 < g - y; ) (h = Fr(h)), g--;
              for (; 0 < y - g; ) (v = Fr(v)), y--;
              for (; g--; ) {
                if (h === v || (v !== null && h === v.alternate)) break t;
                (h = Fr(h)), (v = Fr(v));
              }
              h = null;
            }
          else h = null;
          m !== null && wp(f, d, m, h, !1),
            p !== null && x !== null && wp(f, x, p, h, !0);
        }
      }
      e: {
        if (
          ((d = c ? qr(c) : window),
          (m = d.nodeName && d.nodeName.toLowerCase()),
          m === "select" || (m === "input" && d.type === "file"))
        )
          var C = uS;
        else if (fp(d))
          if (kg) C = mS;
          else {
            C = dS;
            var E = fS;
          }
        else
          (m = d.nodeName) &&
            m.toLowerCase() === "input" &&
            (d.type === "checkbox" || d.type === "radio") &&
            (C = pS);
        if (C && (C = C(e, c))) {
          Eg(f, C, n, u);
          break e;
        }
        E && E(e, d, c),
          e === "focusout" &&
            (E = d._wrapperState) &&
            E.controlled &&
            d.type === "number" &&
            Dc(d, "number", d.value);
      }
      switch (((E = c ? qr(c) : window), e)) {
        case "focusin":
          (fp(E) || E.contentEditable === "true") &&
            ((Yr = E), (Ic = c), (is = null));
          break;
        case "focusout":
          is = Ic = Yr = null;
          break;
        case "mousedown":
          Bc = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          (Bc = !1), gp(f, n, u);
          break;
        case "selectionchange":
          if (yS) break;
        case "keydown":
        case "keyup":
          gp(f, n, u);
      }
      var R;
      if (of)
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
        Wr
          ? bg(e, n) && (D = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (D = "onCompositionStart");
      D &&
        (xg &&
          n.locale !== "ko" &&
          (Wr || D !== "onCompositionStart"
            ? D === "onCompositionEnd" && Wr && (R = Sg())
            : ((In = u),
              (tf = "value" in In ? In.value : In.textContent),
              (Wr = !0))),
        (E = qi(c, D)),
        0 < E.length &&
          ((D = new lp(D, e, null, n, u)),
          f.push({ event: D, listeners: E }),
          R ? (D.data = R) : ((R = Cg(n)), R !== null && (D.data = R)))),
        (R = sS ? iS(e, n) : lS(e, n)) &&
          ((c = qi(c, "onBeforeInput")),
          0 < c.length &&
            ((u = new lp("onBeforeInput", "beforeinput", null, n, u)),
            f.push({ event: u, listeners: c }),
            (u.data = R)));
    }
    Lg(f, t);
  });
}
function Ss(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function qi(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var o = e,
      s = o.stateNode;
    o.tag === 5 &&
      s !== null &&
      ((o = s),
      (s = ps(e, n)),
      s != null && r.unshift(Ss(e, s, o)),
      (s = ps(e, t)),
      s != null && r.push(Ss(e, s, o))),
      (e = e.return);
  }
  return r;
}
function Fr(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function wp(e, t, n, r, o) {
  for (var s = t._reactName, i = []; n !== null && n !== r; ) {
    var l = n,
      a = l.alternate,
      c = l.stateNode;
    if (a !== null && a === r) break;
    l.tag === 5 &&
      c !== null &&
      ((l = c),
      o
        ? ((a = ps(n, s)), a != null && i.unshift(Ss(n, a, l)))
        : o || ((a = ps(n, s)), a != null && i.push(Ss(n, a, l)))),
      (n = n.return);
  }
  i.length !== 0 && e.push({ event: t, listeners: i });
}
var xS = /\r\n?/g,
  bS = /\u0000|\uFFFD/g;
function Sp(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      xS,
      `
`
    )
    .replace(bS, "");
}
function li(e, t, n) {
  if (((t = Sp(t)), Sp(e) !== t && n)) throw Error(H(425));
}
function Gi() {}
var Hc = null,
  Vc = null;
function Uc(e, t) {
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
var Wc = typeof setTimeout == "function" ? setTimeout : void 0,
  CS = typeof clearTimeout == "function" ? clearTimeout : void 0,
  xp = typeof Promise == "function" ? Promise : void 0,
  ES =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof xp < "u"
      ? function (e) {
          return xp.resolve(null).then(e).catch(kS);
        }
      : Wc;
function kS(e) {
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
          e.removeChild(o), gs(t);
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = o;
  } while (n);
  gs(t);
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
function bp(e) {
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
  on = "__reactFiber$" + Do,
  xs = "__reactProps$" + Do,
  xn = "__reactContainer$" + Do,
  Yc = "__reactEvents$" + Do,
  _S = "__reactListeners$" + Do,
  RS = "__reactHandles$" + Do;
function mr(e) {
  var t = e[on];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[xn] || n[on])) {
      if (
        ((n = t.alternate),
        t.child !== null || (n !== null && n.child !== null))
      )
        for (e = bp(e); e !== null; ) {
          if ((n = e[on])) return n;
          e = bp(e);
        }
      return t;
    }
    (e = n), (n = e.parentNode);
  }
  return null;
}
function Fs(e) {
  return (
    (e = e[on] || e[xn]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function qr(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(H(33));
}
function $l(e) {
  return e[xs] || null;
}
var Kc = [],
  Gr = -1;
function nr(e) {
  return { current: e };
}
function we(e) {
  0 > Gr || ((e.current = Kc[Gr]), (Kc[Gr] = null), Gr--);
}
function ge(e, t) {
  Gr++, (Kc[Gr] = e.current), (e.current = t);
}
var Jn = {},
  Ge = nr(Jn),
  ut = nr(!1),
  br = Jn;
function mo(e, t) {
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
  we(ut), we(Ge);
}
function Cp(e, t, n) {
  if (Ge.current !== Jn) throw Error(H(168));
  ge(Ge, t), ge(ut, n);
}
function Fg(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function"))
    return n;
  r = r.getChildContext();
  for (var o in r) if (!(o in t)) throw Error(H(108, f1(e) || "Unknown", o));
  return Ee({}, n, r);
}
function Qi(e) {
  return (
    (e =
      ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Jn),
    (br = Ge.current),
    ge(Ge, e),
    ge(ut, ut.current),
    !0
  );
}
function Ep(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(H(169));
  n
    ? ((e = Fg(e, t, br)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      we(ut),
      we(Ge),
      ge(Ge, e))
    : we(ut),
    ge(ut, n);
}
var hn = null,
  jl = !1,
  Ya = !1;
function Mg(e) {
  hn === null ? (hn = [e]) : hn.push(e);
}
function DS(e) {
  (jl = !0), Mg(e);
}
function rr() {
  if (!Ya && hn !== null) {
    Ya = !0;
    var e = 0,
      t = pe;
    try {
      var n = hn;
      for (pe = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      (hn = null), (jl = !1);
    } catch (o) {
      throw (hn !== null && (hn = hn.slice(e + 1)), cg(Qu, rr), o);
    } finally {
      (pe = t), (Ya = !1);
    }
  }
  return null;
}
var Xr = [],
  Qr = 0,
  Ji = null,
  Zi = 0,
  Et = [],
  kt = 0,
  Cr = null,
  gn = 1,
  yn = "";
function ur(e, t) {
  (Xr[Qr++] = Zi), (Xr[Qr++] = Ji), (Ji = e), (Zi = t);
}
function zg(e, t, n) {
  (Et[kt++] = gn), (Et[kt++] = yn), (Et[kt++] = Cr), (Cr = e);
  var r = gn;
  e = yn;
  var o = 32 - Ht(r) - 1;
  (r &= ~(1 << o)), (n += 1);
  var s = 32 - Ht(t) + o;
  if (30 < s) {
    var i = o - (o % 5);
    (s = (r & ((1 << i) - 1)).toString(32)),
      (r >>= i),
      (o -= i),
      (gn = (1 << (32 - Ht(t) + o)) | (n << o) | r),
      (yn = s + e);
  } else (gn = (1 << s) | (n << o) | r), (yn = e);
}
function lf(e) {
  e.return !== null && (ur(e, 1), zg(e, 1, 0));
}
function af(e) {
  for (; e === Ji; )
    (Ji = Xr[--Qr]), (Xr[Qr] = null), (Zi = Xr[--Qr]), (Xr[Qr] = null);
  for (; e === Cr; )
    (Cr = Et[--kt]),
      (Et[kt] = null),
      (yn = Et[--kt]),
      (Et[kt] = null),
      (gn = Et[--kt]),
      (Et[kt] = null);
}
var wt = null,
  vt = null,
  Se = !1,
  It = null;
function Ig(e, t) {
  var n = _t(5, null, null, 0);
  (n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n);
}
function kp(e, t) {
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
          ? ((n = Cr !== null ? { id: gn, overflow: yn } : null),
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
function qc(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Gc(e) {
  if (Se) {
    var t = vt;
    if (t) {
      var n = t;
      if (!kp(e, t)) {
        if (qc(e)) throw Error(H(418));
        t = Yn(n.nextSibling);
        var r = wt;
        t && kp(e, t)
          ? Ig(r, n)
          : ((e.flags = (e.flags & -4097) | 2), (Se = !1), (wt = e));
      }
    } else {
      if (qc(e)) throw Error(H(418));
      (e.flags = (e.flags & -4097) | 2), (Se = !1), (wt = e);
    }
  }
}
function _p(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; )
    e = e.return;
  wt = e;
}
function ai(e) {
  if (e !== wt) return !1;
  if (!Se) return _p(e), (Se = !0), !1;
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type),
      (t = t !== "head" && t !== "body" && !Uc(e.type, e.memoizedProps))),
    t && (t = vt))
  ) {
    if (qc(e)) throw (Bg(), Error(H(418)));
    for (; t; ) Ig(e, t), (t = Yn(t.nextSibling));
  }
  if ((_p(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e))
      throw Error(H(317));
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
function Bg() {
  for (var e = vt; e; ) e = Yn(e.nextSibling);
}
function ho() {
  (vt = wt = null), (Se = !1);
}
function cf(e) {
  It === null ? (It = [e]) : It.push(e);
}
var PS = kn.ReactCurrentBatchConfig;
function Uo(e, t, n) {
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
function ci(e, t) {
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
function Rp(e) {
  var t = e._init;
  return t(e._payload);
}
function Hg(e) {
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
    return (v = Xn(v, g)), (v.index = 0), (v.sibling = null), v;
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
    return C === Ur
      ? u(v, g, y.props.children, b, y.key)
      : g !== null &&
        (g.elementType === C ||
          (typeof C == "object" &&
            C !== null &&
            C.$$typeof === jn &&
            Rp(C) === g.type))
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
      ? ((g = wr(y, v.mode, b, C)), (g.return = v), g)
      : ((g = o(g, y)), (g.return = v), g);
  }
  function f(v, g, y) {
    if ((typeof g == "string" && g !== "") || typeof g == "number")
      return (g = Za("" + g, v.mode, y)), (g.return = v), g;
    if (typeof g == "object" && g !== null) {
      switch (g.$$typeof) {
        case Js:
          return (
            (y = Li(g.type, g.key, g.props, null, v.mode, y)),
            (y.ref = Uo(v, null, g)),
            (y.return = v),
            y
          );
        case Vr:
          return (g = ec(g, v.mode, y)), (g.return = v), g;
        case jn:
          var b = g._init;
          return f(v, b(g._payload), y);
      }
      if (Zo(g) || zo(g))
        return (g = wr(g, v.mode, y, null)), (g.return = v), g;
      ci(v, g);
    }
    return null;
  }
  function d(v, g, y, b) {
    var C = g !== null ? g.key : null;
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return C !== null ? null : l(v, g, "" + y, b);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case Js:
          return y.key === C ? a(v, g, y, b) : null;
        case Vr:
          return y.key === C ? c(v, g, y, b) : null;
        case jn:
          return (C = y._init), d(v, g, C(y._payload), b);
      }
      if (Zo(y) || zo(y)) return C !== null ? null : u(v, g, y, b, null);
      ci(v, y);
    }
    return null;
  }
  function m(v, g, y, b, C) {
    if ((typeof b == "string" && b !== "") || typeof b == "number")
      return (v = v.get(y) || null), l(g, v, "" + b, C);
    if (typeof b == "object" && b !== null) {
      switch (b.$$typeof) {
        case Js:
          return (v = v.get(b.key === null ? y : b.key) || null), a(g, v, b, C);
        case Vr:
          return (v = v.get(b.key === null ? y : b.key) || null), c(g, v, b, C);
        case jn:
          var E = b._init;
          return m(v, g, y, E(b._payload), C);
      }
      if (Zo(b) || zo(b)) return (v = v.get(y) || null), u(g, v, b, C, null);
      ci(g, b);
    }
    return null;
  }
  function p(v, g, y, b) {
    for (
      var C = null, E = null, R = g, D = (g = 0), L = null;
      R !== null && D < y.length;
      D++
    ) {
      R.index > D ? ((L = R), (R = null)) : (L = R.sibling);
      var T = d(v, R, y[D], b);
      if (T === null) {
        R === null && (R = L);
        break;
      }
      e && R && T.alternate === null && t(v, R),
        (g = s(T, g, D)),
        E === null ? (C = T) : (E.sibling = T),
        (E = T),
        (R = L);
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
      (L = m(R, v, D, y[D], b)),
        L !== null &&
          (e && L.alternate !== null && R.delete(L.key === null ? D : L.key),
          (g = s(L, g, D)),
          E === null ? (C = L) : (E.sibling = L),
          (E = L));
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
    if (typeof C != "function") throw Error(H(150));
    if (((y = C.call(y)), y == null)) throw Error(H(151));
    for (
      var E = (C = null), R = g, D = (g = 0), L = null, T = y.next();
      R !== null && !T.done;
      D++, T = y.next()
    ) {
      R.index > D ? ((L = R), (R = null)) : (L = R.sibling);
      var M = d(v, R, T.value, b);
      if (M === null) {
        R === null && (R = L);
        break;
      }
      e && R && M.alternate === null && t(v, R),
        (g = s(M, g, D)),
        E === null ? (C = M) : (E.sibling = M),
        (E = M),
        (R = L);
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
  function x(v, g, y, b) {
    if (
      (typeof y == "object" &&
        y !== null &&
        y.type === Ur &&
        y.key === null &&
        (y = y.props.children),
      typeof y == "object" && y !== null)
    ) {
      switch (y.$$typeof) {
        case Js:
          e: {
            for (var C = y.key, E = g; E !== null; ) {
              if (E.key === C) {
                if (((C = y.type), C === Ur)) {
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
                    C.$$typeof === jn &&
                    Rp(C) === E.type)
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
            y.type === Ur
              ? ((g = wr(y.props.children, v.mode, b, y.key)),
                (g.return = v),
                (v = g))
              : ((b = Li(y.type, y.key, y.props, null, v.mode, b)),
                (b.ref = Uo(v, g, y)),
                (b.return = v),
                (v = b));
          }
          return i(v);
        case Vr:
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
        case jn:
          return (E = y._init), x(v, g, E(y._payload), b);
      }
      if (Zo(y)) return p(v, g, y, b);
      if (zo(y)) return h(v, g, y, b);
      ci(v, y);
    }
    return (typeof y == "string" && y !== "") || typeof y == "number"
      ? ((y = "" + y),
        g !== null && g.tag === 6
          ? (n(v, g.sibling), (g = o(g, y)), (g.return = v), (v = g))
          : (n(v, g), (g = Za(y, v.mode, b)), (g.return = v), (v = g)),
        i(v))
      : n(v, g);
  }
  return x;
}
var go = Hg(!0),
  Vg = Hg(!1),
  el = nr(null),
  tl = null,
  Jr = null,
  uf = null;
function ff() {
  uf = Jr = tl = null;
}
function df(e) {
  var t = el.current;
  we(el), (e._currentValue = t);
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
function io(e, t) {
  (tl = e),
    (uf = Jr = null),
    (e = e.dependencies),
    e !== null &&
      e.firstContext !== null &&
      (e.lanes & t && (lt = !0), (e.firstContext = null));
}
function Pt(e) {
  var t = e._currentValue;
  if (uf !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Jr === null)) {
      if (tl === null) throw Error(H(308));
      (Jr = e), (tl.dependencies = { lanes: 0, firstContext: e });
    } else Jr = Jr.next = e;
  return t;
}
var hr = null;
function pf(e) {
  hr === null ? (hr = [e]) : hr.push(e);
}
function Ug(e, t, n, r) {
  var o = t.interleaved;
  return (
    o === null ? ((n.next = n), pf(t)) : ((n.next = o.next), (o.next = n)),
    (t.interleaved = n),
    bn(e, r)
  );
}
function bn(e, t) {
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
var Ln = !1;
function mf(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Wg(e, t) {
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
function vn(e, t) {
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
      bn(e, n)
    );
  }
  return (
    (o = r.interleaved),
    o === null ? ((t.next = t), pf(r)) : ((t.next = o.next), (o.next = t)),
    (r.interleaved = t),
    bn(e, n)
  );
}
function Pi(e, t, n) {
  if (
    ((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))
  ) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Ju(e, n);
  }
}
function Dp(e, t) {
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
function nl(e, t, n, r) {
  var o = e.updateQueue;
  Ln = !1;
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
              Ln = !0;
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
    (kr |= i), (e.lanes = i), (e.memoizedState = f);
  }
}
function Pp(e, t, n) {
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
var Ms = {},
  an = nr(Ms),
  bs = nr(Ms),
  Cs = nr(Ms);
function gr(e) {
  if (e === Ms) throw Error(H(174));
  return e;
}
function hf(e, t) {
  switch ((ge(Cs, t), ge(bs, e), ge(an, Ms), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Tc(null, "");
      break;
    default:
      (e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = Tc(t, e));
  }
  we(an), ge(an, t);
}
function yo() {
  we(an), we(bs), we(Cs);
}
function Yg(e) {
  gr(Cs.current);
  var t = gr(an.current),
    n = Tc(t, e.type);
  t !== n && (ge(bs, e), ge(an, n));
}
function gf(e) {
  bs.current === e && (we(an), we(bs));
}
var be = nr(0);
function rl(e) {
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
function yf() {
  for (var e = 0; e < Ka.length; e++)
    Ka[e]._workInProgressVersionPrimary = null;
  Ka.length = 0;
}
var Ti = kn.ReactCurrentDispatcher,
  qa = kn.ReactCurrentBatchConfig,
  Er = 0,
  Ce = null,
  $e = null,
  Fe = null,
  ol = !1,
  ls = !1,
  Es = 0,
  TS = 0;
function We() {
  throw Error(H(321));
}
function vf(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++)
    if (!Wt(e[n], t[n])) return !1;
  return !0;
}
function wf(e, t, n, r, o, s) {
  if (
    ((Er = s),
    (Ce = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Ti.current = e === null || e.memoizedState === null ? jS : LS),
    (e = n(r, o)),
    ls)
  ) {
    s = 0;
    do {
      if (((ls = !1), (Es = 0), 25 <= s)) throw Error(H(301));
      (s += 1),
        (Fe = $e = null),
        (t.updateQueue = null),
        (Ti.current = AS),
        (e = n(r, o));
    } while (ls);
  }
  if (
    ((Ti.current = sl),
    (t = $e !== null && $e.next !== null),
    (Er = 0),
    (Fe = $e = Ce = null),
    (ol = !1),
    t)
  )
    throw Error(H(300));
  return e;
}
function Sf() {
  var e = Es !== 0;
  return (Es = 0), e;
}
function tn() {
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
    if (e === null) throw Error(H(310));
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
function ks(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function Ga(e) {
  var t = Tt(),
    n = t.queue;
  if (n === null) throw Error(H(311));
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
      if ((Er & u) === u)
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
          (kr |= u);
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
    do (s = o.lane), (Ce.lanes |= s), (kr |= s), (o = o.next);
    while (o !== e);
  } else o === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function Xa(e) {
  var t = Tt(),
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
    Wt(s, t.memoizedState) || (lt = !0),
      (t.memoizedState = s),
      t.baseQueue === null && (t.baseState = s),
      (n.lastRenderedState = s);
  }
  return [s, r];
}
function Kg() {}
function qg(e, t) {
  var n = Ce,
    r = Tt(),
    o = t(),
    s = !Wt(r.memoizedState, o);
  if (
    (s && ((r.memoizedState = o), (lt = !0)),
    (r = r.queue),
    xf(Qg.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || s || (Fe !== null && Fe.memoizedState.tag & 1))
  ) {
    if (
      ((n.flags |= 2048),
      _s(9, Xg.bind(null, n, r, o, t), void 0, null),
      Me === null)
    )
      throw Error(H(349));
    Er & 30 || Gg(n, t, o);
  }
  return o;
}
function Gg(e, t, n) {
  (e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = Ce.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (Ce.updateQueue = t),
        (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e));
}
function Xg(e, t, n, r) {
  (t.value = n), (t.getSnapshot = r), Jg(t) && Zg(e);
}
function Qg(e, t, n) {
  return n(function () {
    Jg(t) && Zg(e);
  });
}
function Jg(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Wt(e, n);
  } catch {
    return !0;
  }
}
function Zg(e) {
  var t = bn(e, 1);
  t !== null && Vt(t, e, 1, -1);
}
function Tp(e) {
  var t = tn();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: ks,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = $S.bind(null, Ce, e)),
    [t.memoizedState, e]
  );
}
function _s(e, t, n, r) {
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
function ey() {
  return Tt().memoizedState;
}
function Ni(e, t, n, r) {
  var o = tn();
  (Ce.flags |= e),
    (o.memoizedState = _s(1 | t, n, void 0, r === void 0 ? null : r));
}
function Ll(e, t, n, r) {
  var o = Tt();
  r = r === void 0 ? null : r;
  var s = void 0;
  if ($e !== null) {
    var i = $e.memoizedState;
    if (((s = i.destroy), r !== null && vf(r, i.deps))) {
      o.memoizedState = _s(t, n, s, r);
      return;
    }
  }
  (Ce.flags |= e), (o.memoizedState = _s(1 | t, n, s, r));
}
function Np(e, t) {
  return Ni(8390656, 8, e, t);
}
function xf(e, t) {
  return Ll(2048, 8, e, t);
}
function ty(e, t) {
  return Ll(4, 2, e, t);
}
function ny(e, t) {
  return Ll(4, 4, e, t);
}
function ry(e, t) {
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
function oy(e, t, n) {
  return (
    (n = n != null ? n.concat([e]) : null), Ll(4, 4, ry.bind(null, t, e), n)
  );
}
function bf() {}
function sy(e, t) {
  var n = Tt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && vf(t, r[1])
    ? r[0]
    : ((n.memoizedState = [e, t]), e);
}
function iy(e, t) {
  var n = Tt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && vf(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function ly(e, t, n) {
  return Er & 21
    ? (Wt(n, t) || ((n = dg()), (Ce.lanes |= n), (kr |= n), (e.baseState = !0)),
      t)
    : (e.baseState && ((e.baseState = !1), (lt = !0)), (e.memoizedState = n));
}
function NS(e, t) {
  var n = pe;
  (pe = n !== 0 && 4 > n ? n : 4), e(!0);
  var r = qa.transition;
  qa.transition = {};
  try {
    e(!1), t();
  } finally {
    (pe = n), (qa.transition = r);
  }
}
function ay() {
  return Tt().memoizedState;
}
function OS(e, t, n) {
  var r = Gn(e);
  if (
    ((n = {
      lane: r,
      action: n,
      hasEagerState: !1,
      eagerState: null,
      next: null,
    }),
    cy(e))
  )
    uy(t, n);
  else if (((n = Ug(e, t, n, r)), n !== null)) {
    var o = et();
    Vt(n, e, r, o), fy(n, t, r);
  }
}
function $S(e, t, n) {
  var r = Gn(e),
    o = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (cy(e)) uy(t, o);
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
            ? ((o.next = o), pf(t))
            : ((o.next = a.next), (a.next = o)),
            (t.interleaved = o);
          return;
        }
      } catch {
      } finally {
      }
    (n = Ug(e, t, o, r)),
      n !== null && ((o = et()), Vt(n, e, r, o), fy(n, t, r));
  }
}
function cy(e) {
  var t = e.alternate;
  return e === Ce || (t !== null && t === Ce);
}
function uy(e, t) {
  ls = ol = !0;
  var n = e.pending;
  n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)),
    (e.pending = t);
}
function fy(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    (r &= e.pendingLanes), (n |= r), (t.lanes = n), Ju(e, n);
  }
}
var sl = {
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
  jS = {
    readContext: Pt,
    useCallback: function (e, t) {
      return (tn().memoizedState = [e, t === void 0 ? null : t]), e;
    },
    useContext: Pt,
    useEffect: Np,
    useImperativeHandle: function (e, t, n) {
      return (
        (n = n != null ? n.concat([e]) : null),
        Ni(4194308, 4, ry.bind(null, t, e), n)
      );
    },
    useLayoutEffect: function (e, t) {
      return Ni(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Ni(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = tn();
      return (
        (t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e
      );
    },
    useReducer: function (e, t, n) {
      var r = tn();
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
        (e = e.dispatch = OS.bind(null, Ce, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = tn();
      return (e = { current: e }), (t.memoizedState = e);
    },
    useState: Tp,
    useDebugValue: bf,
    useDeferredValue: function (e) {
      return (tn().memoizedState = e);
    },
    useTransition: function () {
      var e = Tp(!1),
        t = e[0];
      return (e = NS.bind(null, e[1])), (tn().memoizedState = e), [t, e];
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = Ce,
        o = tn();
      if (Se) {
        if (n === void 0) throw Error(H(407));
        n = n();
      } else {
        if (((n = t()), Me === null)) throw Error(H(349));
        Er & 30 || Gg(r, t, n);
      }
      o.memoizedState = n;
      var s = { value: n, getSnapshot: t };
      return (
        (o.queue = s),
        Np(Qg.bind(null, r, s, e), [e]),
        (r.flags |= 2048),
        _s(9, Xg.bind(null, r, s, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = tn(),
        t = Me.identifierPrefix;
      if (Se) {
        var n = yn,
          r = gn;
        (n = (r & ~(1 << (32 - Ht(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Es++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":");
      } else (n = TS++), (t = ":" + t + "r" + n.toString(32) + ":");
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  LS = {
    readContext: Pt,
    useCallback: sy,
    useContext: Pt,
    useEffect: xf,
    useImperativeHandle: oy,
    useInsertionEffect: ty,
    useLayoutEffect: ny,
    useMemo: iy,
    useReducer: Ga,
    useRef: ey,
    useState: function () {
      return Ga(ks);
    },
    useDebugValue: bf,
    useDeferredValue: function (e) {
      var t = Tt();
      return ly(t, $e.memoizedState, e);
    },
    useTransition: function () {
      var e = Ga(ks)[0],
        t = Tt().memoizedState;
      return [e, t];
    },
    useMutableSource: Kg,
    useSyncExternalStore: qg,
    useId: ay,
    unstable_isNewReconciler: !1,
  },
  AS = {
    readContext: Pt,
    useCallback: sy,
    useContext: Pt,
    useEffect: xf,
    useImperativeHandle: oy,
    useInsertionEffect: ty,
    useLayoutEffect: ny,
    useMemo: iy,
    useReducer: Xa,
    useRef: ey,
    useState: function () {
      return Xa(ks);
    },
    useDebugValue: bf,
    useDeferredValue: function (e) {
      var t = Tt();
      return $e === null ? (t.memoizedState = e) : ly(t, $e.memoizedState, e);
    },
    useTransition: function () {
      var e = Xa(ks)[0],
        t = Tt().memoizedState;
      return [e, t];
    },
    useMutableSource: Kg,
    useSyncExternalStore: qg,
    useId: ay,
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
function Qc(e, t, n, r) {
  (t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : Ee({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Al = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? Or(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = et(),
      o = Gn(e),
      s = vn(r, o);
    (s.payload = t),
      n != null && (s.callback = n),
      (t = Kn(e, s, o)),
      t !== null && (Vt(t, e, o, r), Pi(t, e, o));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = et(),
      o = Gn(e),
      s = vn(r, o);
    (s.tag = 1),
      (s.payload = t),
      n != null && (s.callback = n),
      (t = Kn(e, s, o)),
      t !== null && (Vt(t, e, o, r), Pi(t, e, o));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = et(),
      r = Gn(e),
      o = vn(n, r);
    (o.tag = 2),
      t != null && (o.callback = t),
      (t = Kn(e, o, r)),
      t !== null && (Vt(t, e, r, n), Pi(t, e, r));
  },
};
function Op(e, t, n, r, o, s, i) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, s, i)
      : t.prototype && t.prototype.isPureReactComponent
      ? !vs(n, r) || !vs(o, s)
      : !0
  );
}
function dy(e, t, n) {
  var r = !1,
    o = Jn,
    s = t.contextType;
  return (
    typeof s == "object" && s !== null
      ? (s = Pt(s))
      : ((o = ft(t) ? br : Ge.current),
        (r = t.contextTypes),
        (s = (r = r != null) ? mo(e, o) : Jn)),
    (t = new t(n, s)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Al),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = o),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    t
  );
}
function $p(e, t, n, r) {
  (e = t.state),
    typeof t.componentWillReceiveProps == "function" &&
      t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Al.enqueueReplaceState(t, t.state, null);
}
function Jc(e, t, n, r) {
  var o = e.stateNode;
  (o.props = n), (o.state = e.memoizedState), (o.refs = {}), mf(e);
  var s = t.contextType;
  typeof s == "object" && s !== null
    ? (o.context = Pt(s))
    : ((s = ft(t) ? br : Ge.current), (o.context = mo(e, s))),
    (o.state = e.memoizedState),
    (s = t.getDerivedStateFromProps),
    typeof s == "function" && (Qc(e, t, s, n), (o.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof o.getSnapshotBeforeUpdate == "function" ||
      (typeof o.UNSAFE_componentWillMount != "function" &&
        typeof o.componentWillMount != "function") ||
      ((t = o.state),
      typeof o.componentWillMount == "function" && o.componentWillMount(),
      typeof o.UNSAFE_componentWillMount == "function" &&
        o.UNSAFE_componentWillMount(),
      t !== o.state && Al.enqueueReplaceState(o, o.state, null),
      nl(e, n, o, r),
      (o.state = e.memoizedState)),
    typeof o.componentDidMount == "function" && (e.flags |= 4194308);
}
function vo(e, t) {
  try {
    var n = "",
      r = t;
    do (n += u1(r)), (r = r.return);
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
function Zc(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var FS = typeof WeakMap == "function" ? WeakMap : Map;
function py(e, t, n) {
  (n = vn(-1, n)), (n.tag = 3), (n.payload = { element: null });
  var r = t.value;
  return (
    (n.callback = function () {
      ll || ((ll = !0), (cu = r)), Zc(e, t);
    }),
    n
  );
}
function my(e, t, n) {
  (n = vn(-1, n)), (n.tag = 3);
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var o = t.value;
    (n.payload = function () {
      return r(o);
    }),
      (n.callback = function () {
        Zc(e, t);
      });
  }
  var s = e.stateNode;
  return (
    s !== null &&
      typeof s.componentDidCatch == "function" &&
      (n.callback = function () {
        Zc(e, t),
          typeof r != "function" &&
            (qn === null ? (qn = new Set([this])) : qn.add(this));
        var i = t.stack;
        this.componentDidCatch(t.value, {
          componentStack: i !== null ? i : "",
        });
      }),
    n
  );
}
function jp(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new FS();
    var o = new Set();
    r.set(t, o);
  } else (o = r.get(t)), o === void 0 && ((o = new Set()), r.set(t, o));
  o.has(n) || (o.add(n), (e = QS.bind(null, e, t, n)), t.then(e, e));
}
function Lp(e) {
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
function Ap(e, t, n, r, o) {
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
              : ((t = vn(-1, 1)), (t.tag = 2), Kn(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var MS = kn.ReactCurrentOwner,
  lt = !1;
function Je(e, t, n, r) {
  t.child = e === null ? Vg(t, null, n, r) : go(t, e.child, n, r);
}
function Fp(e, t, n, r, o) {
  n = n.render;
  var s = t.ref;
  return (
    io(t, o),
    (r = wf(e, t, n, r, s, o)),
    (n = Sf()),
    e !== null && !lt
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Cn(e, t, o))
      : (Se && n && lf(t), (t.flags |= 1), Je(e, t, r, o), t.child)
  );
}
function Mp(e, t, n, r, o) {
  if (e === null) {
    var s = n.type;
    return typeof s == "function" &&
      !Tf(s) &&
      s.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = s), hy(e, t, s, r, o))
      : ((e = Li(n.type, null, r, t, t.mode, o)),
        (e.ref = t.ref),
        (e.return = t),
        (t.child = e));
  }
  if (((s = e.child), !(e.lanes & o))) {
    var i = s.memoizedProps;
    if (
      ((n = n.compare), (n = n !== null ? n : vs), n(i, r) && e.ref === t.ref)
    )
      return Cn(e, t, o);
  }
  return (
    (t.flags |= 1),
    (e = Xn(s, r)),
    (e.ref = t.ref),
    (e.return = t),
    (t.child = e)
  );
}
function hy(e, t, n, r, o) {
  if (e !== null) {
    var s = e.memoizedProps;
    if (vs(s, r) && e.ref === t.ref)
      if (((lt = !1), (t.pendingProps = r = s), (e.lanes & o) !== 0))
        e.flags & 131072 && (lt = !0);
      else return (t.lanes = e.lanes), Cn(e, t, o);
  }
  return eu(e, t, n, r, o);
}
function gy(e, t, n) {
  var r = t.pendingProps,
    o = r.children,
    s = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        ge(eo, yt),
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
          ge(eo, yt),
          (yt |= e),
          null
        );
      (t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = s !== null ? s.baseLanes : n),
        ge(eo, yt),
        (yt |= r);
    }
  else
    s !== null ? ((r = s.baseLanes | n), (t.memoizedState = null)) : (r = n),
      ge(eo, yt),
      (yt |= r);
  return Je(e, t, o, n), t.child;
}
function yy(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function eu(e, t, n, r, o) {
  var s = ft(n) ? br : Ge.current;
  return (
    (s = mo(t, s)),
    io(t, o),
    (n = wf(e, t, n, r, s, o)),
    (r = Sf()),
    e !== null && !lt
      ? ((t.updateQueue = e.updateQueue),
        (t.flags &= -2053),
        (e.lanes &= ~o),
        Cn(e, t, o))
      : (Se && r && lf(t), (t.flags |= 1), Je(e, t, n, o), t.child)
  );
}
function zp(e, t, n, r, o) {
  if (ft(n)) {
    var s = !0;
    Qi(t);
  } else s = !1;
  if ((io(t, o), t.stateNode === null))
    Oi(e, t), dy(t, n, r), Jc(t, n, r, o), (r = !0);
  else if (e === null) {
    var i = t.stateNode,
      l = t.memoizedProps;
    i.props = l;
    var a = i.context,
      c = n.contextType;
    typeof c == "object" && c !== null
      ? (c = Pt(c))
      : ((c = ft(n) ? br : Ge.current), (c = mo(t, c)));
    var u = n.getDerivedStateFromProps,
      f =
        typeof u == "function" ||
        typeof i.getSnapshotBeforeUpdate == "function";
    f ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== r || a !== c) && $p(t, i, r, c)),
      (Ln = !1);
    var d = t.memoizedState;
    (i.state = d),
      nl(t, r, i, o),
      (a = t.memoizedState),
      l !== r || d !== a || ut.current || Ln
        ? (typeof u == "function" && (Qc(t, n, u, r), (a = t.memoizedState)),
          (l = Ln || Op(t, n, l, r, d, a, c))
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
      Wg(e, t),
      (l = t.memoizedProps),
      (c = t.type === t.elementType ? l : Mt(t.type, l)),
      (i.props = c),
      (f = t.pendingProps),
      (d = i.context),
      (a = n.contextType),
      typeof a == "object" && a !== null
        ? (a = Pt(a))
        : ((a = ft(n) ? br : Ge.current), (a = mo(t, a)));
    var m = n.getDerivedStateFromProps;
    (u =
      typeof m == "function" ||
      typeof i.getSnapshotBeforeUpdate == "function") ||
      (typeof i.UNSAFE_componentWillReceiveProps != "function" &&
        typeof i.componentWillReceiveProps != "function") ||
      ((l !== f || d !== a) && $p(t, i, r, a)),
      (Ln = !1),
      (d = t.memoizedState),
      (i.state = d),
      nl(t, r, i, o);
    var p = t.memoizedState;
    l !== f || d !== p || ut.current || Ln
      ? (typeof m == "function" && (Qc(t, n, m, r), (p = t.memoizedState)),
        (c = Ln || Op(t, n, c, r, d, p, a) || !1)
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
  return tu(e, t, n, r, s, o);
}
function tu(e, t, n, r, o, s) {
  yy(e, t);
  var i = (t.flags & 128) !== 0;
  if (!r && !i) return o && Ep(t, n, !1), Cn(e, t, s);
  (r = t.stateNode), (MS.current = t);
  var l =
    i && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && i
      ? ((t.child = go(t, e.child, null, s)), (t.child = go(t, null, l, s)))
      : Je(e, t, l, s),
    (t.memoizedState = r.state),
    o && Ep(t, n, !0),
    t.child
  );
}
function vy(e) {
  var t = e.stateNode;
  t.pendingContext
    ? Cp(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Cp(e, t.context, !1),
    hf(e, t.containerInfo);
}
function Ip(e, t, n, r, o) {
  return ho(), cf(o), (t.flags |= 256), Je(e, t, n, r), t.child;
}
var nu = { dehydrated: null, treeContext: null, retryLane: 0 };
function ru(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function wy(e, t, n) {
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
                : (s = zl(i, r, 0, null)),
              (e = wr(e, r, n, null)),
              (s.return = t),
              (e.return = t),
              (s.sibling = e),
              (t.child = s),
              (t.child.memoizedState = ru(n)),
              (t.memoizedState = nu),
              e)
            : Cf(t, i))
    );
  if (((o = e.memoizedState), o !== null && ((l = o.dehydrated), l !== null)))
    return zS(e, t, i, r, l, o, n);
  if (s) {
    (s = r.fallback), (i = t.mode), (o = e.child), (l = o.sibling);
    var a = { mode: "hidden", children: r.children };
    return (
      !(i & 1) && t.child !== o
        ? ((r = t.child),
          (r.childLanes = 0),
          (r.pendingProps = a),
          (t.deletions = null))
        : ((r = Xn(o, a)), (r.subtreeFlags = o.subtreeFlags & 14680064)),
      l !== null ? (s = Xn(l, s)) : ((s = wr(s, i, n, null)), (s.flags |= 2)),
      (s.return = t),
      (r.return = t),
      (r.sibling = s),
      (t.child = r),
      (r = s),
      (s = t.child),
      (i = e.child.memoizedState),
      (i =
        i === null
          ? ru(n)
          : {
              baseLanes: i.baseLanes | n,
              cachePool: null,
              transitions: i.transitions,
            }),
      (s.memoizedState = i),
      (s.childLanes = e.childLanes & ~n),
      (t.memoizedState = nu),
      r
    );
  }
  return (
    (s = e.child),
    (e = s.sibling),
    (r = Xn(s, { mode: "visible", children: r.children })),
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
function Cf(e, t) {
  return (
    (t = zl({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function ui(e, t, n, r) {
  return (
    r !== null && cf(r),
    go(t, e.child, null, n),
    (e = Cf(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function zS(e, t, n, r, o, s, i) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = Qa(Error(H(422)))), ui(e, t, i, r))
      : t.memoizedState !== null
      ? ((t.child = e.child), (t.flags |= 128), null)
      : ((s = r.fallback),
        (o = t.mode),
        (r = zl({ mode: "visible", children: r.children }, o, 0, null)),
        (s = wr(s, o, i, null)),
        (s.flags |= 2),
        (r.return = t),
        (s.return = t),
        (r.sibling = s),
        (t.child = r),
        t.mode & 1 && go(t, e.child, null, i),
        (t.child.memoizedState = ru(i)),
        (t.memoizedState = nu),
        s);
  if (!(t.mode & 1)) return ui(e, t, i, null);
  if (o.data === "$!") {
    if (((r = o.nextSibling && o.nextSibling.dataset), r)) var l = r.dgst;
    return (r = l), (s = Error(H(419))), (r = Qa(s, r, void 0)), ui(e, t, i, r);
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
          ((s.retryLane = o), bn(e, o), Vt(r, e, o, -1));
    }
    return Pf(), (r = Qa(Error(H(421)))), ui(e, t, i, r);
  }
  return o.data === "$?"
    ? ((t.flags |= 128),
      (t.child = e.child),
      (t = JS.bind(null, e)),
      (o._reactRetry = t),
      null)
    : ((e = s.treeContext),
      (vt = Yn(o.nextSibling)),
      (wt = t),
      (Se = !0),
      (It = null),
      e !== null &&
        ((Et[kt++] = gn),
        (Et[kt++] = yn),
        (Et[kt++] = Cr),
        (gn = e.id),
        (yn = e.overflow),
        (Cr = t)),
      (t = Cf(t, r.children)),
      (t.flags |= 4096),
      t);
}
function Bp(e, t, n) {
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
function Sy(e, t, n) {
  var r = t.pendingProps,
    o = r.revealOrder,
    s = r.tail;
  if ((Je(e, t, r.children, n), (r = be.current), r & 2))
    (r = (r & 1) | 2), (t.flags |= 128);
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && Bp(e, n, t);
        else if (e.tag === 19) Bp(e, n, t);
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
            e !== null && rl(e) === null && (o = n),
            (n = n.sibling);
        (n = o),
          n === null
            ? ((o = t.child), (t.child = null))
            : ((o = n.sibling), (n.sibling = null)),
          Ja(t, !1, o, n, s);
        break;
      case "backwards":
        for (n = null, o = t.child, t.child = null; o !== null; ) {
          if (((e = o.alternate), e !== null && rl(e) === null)) {
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
function Cn(e, t, n) {
  if (
    (e !== null && (t.dependencies = e.dependencies),
    (kr |= t.lanes),
    !(n & t.childLanes))
  )
    return null;
  if (e !== null && t.child !== e.child) throw Error(H(153));
  if (t.child !== null) {
    for (
      e = t.child, n = Xn(e, e.pendingProps), t.child = n, n.return = t;
      e.sibling !== null;

    )
      (e = e.sibling), (n = n.sibling = Xn(e, e.pendingProps)), (n.return = t);
    n.sibling = null;
  }
  return t.child;
}
function IS(e, t, n) {
  switch (t.tag) {
    case 3:
      vy(t), ho();
      break;
    case 5:
      Yg(t);
      break;
    case 1:
      ft(t.type) && Qi(t);
      break;
    case 4:
      hf(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        o = t.memoizedProps.value;
      ge(el, r._currentValue), (r._currentValue = o);
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (ge(be, be.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
          ? wy(e, t, n)
          : (ge(be, be.current & 1),
            (e = Cn(e, t, n)),
            e !== null ? e.sibling : null);
      ge(be, be.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return Sy(e, t, n);
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
      return (t.lanes = 0), gy(e, t, n);
  }
  return Cn(e, t, n);
}
var xy, ou, by, Cy;
xy = function (e, t) {
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
ou = function () {};
by = function (e, t, n, r) {
  var o = e.memoizedProps;
  if (o !== r) {
    (e = t.stateNode), gr(an.current);
    var s = null;
    switch (n) {
      case "input":
        (o = _c(e, o)), (r = _c(e, r)), (s = []);
        break;
      case "select":
        (o = Ee({}, o, { value: void 0 })),
          (r = Ee({}, r, { value: void 0 })),
          (s = []);
        break;
      case "textarea":
        (o = Pc(e, o)), (r = Pc(e, r)), (s = []);
        break;
      default:
        typeof o.onClick != "function" &&
          typeof r.onClick == "function" &&
          (e.onclick = Gi);
    }
    Nc(n, r);
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
            (fs.hasOwnProperty(c)
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
              (fs.hasOwnProperty(c)
                ? (a != null && c === "onScroll" && ve("scroll", e),
                  s || l === a || (s = []))
                : (s = s || []).push(c, a));
    }
    n && (s = s || []).push("style", n);
    var c = s;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
Cy = function (e, t, n, r) {
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
function BS(e, t, n) {
  var r = t.pendingProps;
  switch ((af(t), t.tag)) {
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
        yo(),
        we(ut),
        we(Ge),
        yf(),
        r.pendingContext &&
          ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (ai(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), It !== null && (du(It), (It = null)))),
        ou(e, t),
        Ye(t),
        null
      );
    case 5:
      gf(t);
      var o = gr(Cs.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        by(e, t, n, r, o),
          e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(H(166));
          return Ye(t), null;
        }
        if (((e = gr(an.current)), ai(t))) {
          (r = t.stateNode), (n = t.type);
          var s = t.memoizedProps;
          switch (((r[on] = t), (r[xs] = s), (e = (t.mode & 1) !== 0), n)) {
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
              for (o = 0; o < ts.length; o++) ve(ts[o], r);
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
              Xd(r, s), ve("invalid", r);
              break;
            case "select":
              (r._wrapperState = { wasMultiple: !!s.multiple }),
                ve("invalid", r);
              break;
            case "textarea":
              Jd(r, s), ve("invalid", r);
          }
          Nc(n, s), (o = null);
          for (var i in s)
            if (s.hasOwnProperty(i)) {
              var l = s[i];
              i === "children"
                ? typeof l == "string"
                  ? r.textContent !== l &&
                    (s.suppressHydrationWarning !== !0 &&
                      li(r.textContent, l, e),
                    (o = ["children", l]))
                  : typeof l == "number" &&
                    r.textContent !== "" + l &&
                    (s.suppressHydrationWarning !== !0 &&
                      li(r.textContent, l, e),
                    (o = ["children", "" + l]))
                : fs.hasOwnProperty(i) &&
                  l != null &&
                  i === "onScroll" &&
                  ve("scroll", r);
            }
          switch (n) {
            case "input":
              Zs(r), Qd(r, s, !0);
              break;
            case "textarea":
              Zs(r), Zd(r);
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
            e === "http://www.w3.org/1999/xhtml" && (e = Qh(n)),
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
            (e[on] = t),
            (e[xs] = r),
            xy(e, t, !1, !1),
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
                for (o = 0; o < ts.length; o++) ve(ts[o], e);
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
                Xd(e, r), (o = _c(e, r)), ve("invalid", e);
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
                Jd(e, r), (o = Pc(e, r)), ve("invalid", e);
                break;
              default:
                o = r;
            }
            Nc(n, o), (l = o);
            for (s in l)
              if (l.hasOwnProperty(s)) {
                var a = l[s];
                s === "style"
                  ? eg(e, a)
                  : s === "dangerouslySetInnerHTML"
                  ? ((a = a ? a.__html : void 0), a != null && Jh(e, a))
                  : s === "children"
                  ? typeof a == "string"
                    ? (n !== "textarea" || a !== "") && ds(e, a)
                    : typeof a == "number" && ds(e, "" + a)
                  : s !== "suppressContentEditableWarning" &&
                    s !== "suppressHydrationWarning" &&
                    s !== "autoFocus" &&
                    (fs.hasOwnProperty(s)
                      ? a != null && s === "onScroll" && ve("scroll", e)
                      : a != null && Yu(e, s, a, i));
              }
            switch (n) {
              case "input":
                Zs(e), Qd(e, r, !1);
                break;
              case "textarea":
                Zs(e), Zd(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Qn(r.value));
                break;
              case "select":
                (e.multiple = !!r.multiple),
                  (s = r.value),
                  s != null
                    ? no(e, !!r.multiple, s, !1)
                    : r.defaultValue != null &&
                      no(e, !!r.multiple, r.defaultValue, !0);
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
      if (e && t.stateNode != null) Cy(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(H(166));
        if (((n = gr(Cs.current)), gr(an.current), ai(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[on] = t),
            (s = r.nodeValue !== n) && ((e = wt), e !== null))
          )
            switch (e.tag) {
              case 3:
                li(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  li(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          s && (t.flags |= 4);
        } else
          (r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[on] = t),
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
          Bg(), ho(), (t.flags |= 98560), (s = !1);
        else if (((s = ai(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!s) throw Error(H(318));
            if (
              ((s = t.memoizedState),
              (s = s !== null ? s.dehydrated : null),
              !s)
            )
              throw Error(H(317));
            s[on] = t;
          } else
            ho(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4);
          Ye(t), (s = !1);
        } else It !== null && (du(It), (It = null)), (s = !0);
        if (!s) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 &&
              (e === null || be.current & 1 ? je === 0 && (je = 3) : Pf())),
          t.updateQueue !== null && (t.flags |= 4),
          Ye(t),
          null);
    case 4:
      return (
        yo(), ou(e, t), e === null && ws(t.stateNode.containerInfo), Ye(t), null
      );
    case 10:
      return df(t.type._context), Ye(t), null;
    case 17:
      return ft(t.type) && Xi(), Ye(t), null;
    case 19:
      if ((we(be), (s = t.memoizedState), s === null)) return Ye(t), null;
      if (((r = (t.flags & 128) !== 0), (i = s.rendering), i === null))
        if (r) Wo(s, !1);
        else {
          if (je !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((i = rl(e)), i !== null)) {
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
            Pe() > wo &&
            ((t.flags |= 128), (r = !0), Wo(s, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = rl(i)), e !== null)) {
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
            2 * Pe() - s.renderingStartTime > wo &&
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
        Df(),
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
  throw Error(H(156, t.tag));
}
function HS(e, t) {
  switch ((af(t), t.tag)) {
    case 1:
      return (
        ft(t.type) && Xi(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        yo(),
        we(ut),
        we(Ge),
        yf(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return gf(t), null;
    case 13:
      if (
        (we(be), (e = t.memoizedState), e !== null && e.dehydrated !== null)
      ) {
        if (t.alternate === null) throw Error(H(340));
        ho();
      }
      return (
        (e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 19:
      return we(be), null;
    case 4:
      return yo(), null;
    case 10:
      return df(t.type._context), null;
    case 22:
    case 23:
      return Df(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var fi = !1,
  Ke = !1,
  VS = typeof WeakSet == "function" ? WeakSet : Set,
  K = null;
function Zr(e, t) {
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
function su(e, t, n) {
  try {
    n();
  } catch (r) {
    Re(e, t, r);
  }
}
var Hp = !1;
function US(e, t) {
  if (((Hc = Yi), (e = Dg()), sf(e))) {
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
  for (Vc = { focusedElem: e, selectionRange: n }, Yi = !1, K = t; K !== null; )
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
                    x = p.memoizedState,
                    v = t.stateNode,
                    g = v.getSnapshotBeforeUpdate(
                      t.elementType === t.type ? h : Mt(t.type, h),
                      x
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
                throw Error(H(163));
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
  return (p = Hp), (Hp = !1), p;
}
function as(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var o = (r = r.next);
    do {
      if ((o.tag & e) === e) {
        var s = o.destroy;
        (o.destroy = void 0), s !== void 0 && su(t, n, s);
      }
      o = o.next;
    } while (o !== r);
  }
}
function Fl(e, t) {
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
function iu(e) {
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
function Ey(e) {
  var t = e.alternate;
  t !== null && ((e.alternate = null), Ey(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null &&
        (delete t[on], delete t[xs], delete t[Yc], delete t[_S], delete t[RS])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null);
}
function ky(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Vp(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || ky(e.return)) return null;
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
function lu(e, t, n) {
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
    for (lu(e, t, n), e = e.sibling; e !== null; ) lu(e, t, n), (e = e.sibling);
}
function au(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    (e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && ((e = e.child), e !== null))
    for (au(e, t, n), e = e.sibling; e !== null; ) au(e, t, n), (e = e.sibling);
}
var He = null,
  zt = !1;
function On(e, t, n) {
  for (n = n.child; n !== null; ) _y(e, t, n), (n = n.sibling);
}
function _y(e, t, n) {
  if (ln && typeof ln.onCommitFiberUnmount == "function")
    try {
      ln.onCommitFiberUnmount(Pl, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Ke || Zr(n, t);
    case 6:
      var r = He,
        o = zt;
      (He = null),
        On(e, t, n),
        (He = r),
        (zt = o),
        He !== null &&
          (zt
            ? ((e = He),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : He.removeChild(n.stateNode));
      break;
    case 18:
      He !== null &&
        (zt
          ? ((e = He),
            (n = n.stateNode),
            e.nodeType === 8
              ? Wa(e.parentNode, n)
              : e.nodeType === 1 && Wa(e, n),
            gs(e))
          : Wa(He, n.stateNode));
      break;
    case 4:
      (r = He),
        (o = zt),
        (He = n.stateNode.containerInfo),
        (zt = !0),
        On(e, t, n),
        (He = r),
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
            i !== void 0 && (s & 2 || s & 4) && su(n, t, i),
            (o = o.next);
        } while (o !== r);
      }
      On(e, t, n);
      break;
    case 1:
      if (
        !Ke &&
        (Zr(n, t),
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
      On(e, t, n);
      break;
    case 21:
      On(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Ke = (r = Ke) || n.memoizedState !== null), On(e, t, n), (Ke = r))
        : On(e, t, n);
      break;
    default:
      On(e, t, n);
  }
}
function Up(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new VS()),
      t.forEach(function (r) {
        var o = ZS.bind(null, e, r);
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
              (He = l.stateNode), (zt = !1);
              break e;
            case 3:
              (He = l.stateNode.containerInfo), (zt = !0);
              break e;
            case 4:
              (He = l.stateNode.containerInfo), (zt = !0);
              break e;
          }
          l = l.return;
        }
        if (He === null) throw Error(H(160));
        _y(s, i, o), (He = null), (zt = !1);
        var a = o.alternate;
        a !== null && (a.return = null), (o.return = null);
      } catch (c) {
        Re(o, t, c);
      }
    }
  if (t.subtreeFlags & 12854)
    for (t = t.child; t !== null; ) Ry(t, e), (t = t.sibling);
}
function Ry(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((Ft(t, e), Zt(e), r & 4)) {
        try {
          as(3, e, e.return), Fl(3, e);
        } catch (h) {
          Re(e, e.return, h);
        }
        try {
          as(5, e, e.return);
        } catch (h) {
          Re(e, e.return, h);
        }
      }
      break;
    case 1:
      Ft(t, e), Zt(e), r & 512 && n !== null && Zr(n, n.return);
      break;
    case 5:
      if (
        (Ft(t, e),
        Zt(e),
        r & 512 && n !== null && Zr(n, n.return),
        e.flags & 32)
      ) {
        var o = e.stateNode;
        try {
          ds(o, "");
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
            l === "input" && s.type === "radio" && s.name != null && Gh(o, s),
              Oc(l, i);
            var c = Oc(l, s);
            for (i = 0; i < a.length; i += 2) {
              var u = a[i],
                f = a[i + 1];
              u === "style"
                ? eg(o, f)
                : u === "dangerouslySetInnerHTML"
                ? Jh(o, f)
                : u === "children"
                ? ds(o, f)
                : Yu(o, u, f, c);
            }
            switch (l) {
              case "input":
                Rc(o, s);
                break;
              case "textarea":
                Xh(o, s);
                break;
              case "select":
                var d = o._wrapperState.wasMultiple;
                o._wrapperState.wasMultiple = !!s.multiple;
                var m = s.value;
                m != null
                  ? no(o, !!s.multiple, m, !1)
                  : d !== !!s.multiple &&
                    (s.defaultValue != null
                      ? no(o, !!s.multiple, s.defaultValue, !0)
                      : no(o, !!s.multiple, s.multiple ? [] : "", !1));
            }
            o[xs] = s;
          } catch (h) {
            Re(e, e.return, h);
          }
      }
      break;
    case 6:
      if ((Ft(t, e), Zt(e), r & 4)) {
        if (e.stateNode === null) throw Error(H(162));
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
        (Ft(t, e), Zt(e), r & 4 && n !== null && n.memoizedState.isDehydrated)
      )
        try {
          gs(t.containerInfo);
        } catch (h) {
          Re(e, e.return, h);
        }
      break;
    case 4:
      Ft(t, e), Zt(e);
      break;
    case 13:
      Ft(t, e),
        Zt(e),
        (o = e.child),
        o.flags & 8192 &&
          ((s = o.memoizedState !== null),
          (o.stateNode.isHidden = s),
          !s ||
            (o.alternate !== null && o.alternate.memoizedState !== null) ||
            (_f = Pe())),
        r & 4 && Up(e);
      break;
    case 22:
      if (
        ((u = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Ke = (c = Ke) || u), Ft(t, e), (Ke = c)) : Ft(t, e),
        Zt(e),
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
                  as(4, d, d.return);
                  break;
                case 1:
                  Zr(d, d.return);
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
                  Zr(d, d.return);
                  break;
                case 22:
                  if (d.memoizedState !== null) {
                    Yp(f);
                    continue;
                  }
              }
              m !== null ? ((m.return = d), (K = m)) : Yp(f);
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
                      (l.style.display = Zh("display", i)));
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
      Ft(t, e), Zt(e), r & 4 && Up(e);
      break;
    case 21:
      break;
    default:
      Ft(t, e), Zt(e);
  }
}
function Zt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (ky(n)) {
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
          r.flags & 32 && (ds(o, ""), (r.flags &= -33));
          var s = Vp(e);
          au(e, s, o);
          break;
        case 3:
        case 4:
          var i = r.stateNode.containerInfo,
            l = Vp(e);
          lu(e, l, i);
          break;
        default:
          throw Error(H(161));
      }
    } catch (a) {
      Re(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function WS(e, t, n) {
  (K = e), Dy(e);
}
function Dy(e, t, n) {
  for (var r = (e.mode & 1) !== 0; K !== null; ) {
    var o = K,
      s = o.child;
    if (o.tag === 22 && r) {
      var i = o.memoizedState !== null || fi;
      if (!i) {
        var l = o.alternate,
          a = (l !== null && l.memoizedState !== null) || Ke;
        l = fi;
        var c = Ke;
        if (((fi = i), (Ke = a) && !c))
          for (K = o; K !== null; )
            (i = K),
              (a = i.child),
              i.tag === 22 && i.memoizedState !== null
                ? Kp(o)
                : a !== null
                ? ((a.return = i), (K = a))
                : Kp(o);
        for (; s !== null; ) (K = s), Dy(s), (s = s.sibling);
        (K = o), (fi = l), (Ke = c);
      }
      Wp(e);
    } else
      o.subtreeFlags & 8772 && s !== null ? ((s.return = o), (K = s)) : Wp(e);
  }
}
function Wp(e) {
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
              Ke || Fl(5, t);
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
              s !== null && Pp(t, s, r);
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
                Pp(t, i, n);
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
                    f !== null && gs(f);
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
        Ke || (t.flags & 512 && iu(t));
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
function Yp(e) {
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
function Kp(e) {
  for (; K !== null; ) {
    var t = K;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Fl(4, t);
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
            iu(t);
          } catch (a) {
            Re(t, s, a);
          }
          break;
        case 5:
          var i = t.return;
          try {
            iu(t);
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
var YS = Math.ceil,
  il = kn.ReactCurrentDispatcher,
  Ef = kn.ReactCurrentOwner,
  Rt = kn.ReactCurrentBatchConfig,
  fe = 0,
  Me = null,
  Te = null,
  Ve = 0,
  yt = 0,
  eo = nr(0),
  je = 0,
  Rs = null,
  kr = 0,
  Ml = 0,
  kf = 0,
  cs = null,
  it = null,
  _f = 0,
  wo = 1 / 0,
  mn = null,
  ll = !1,
  cu = null,
  qn = null,
  di = !1,
  Bn = null,
  al = 0,
  us = 0,
  uu = null,
  $i = -1,
  ji = 0;
function et() {
  return fe & 6 ? Pe() : $i !== -1 ? $i : ($i = Pe());
}
function Gn(e) {
  return e.mode & 1
    ? fe & 2 && Ve !== 0
      ? Ve & -Ve
      : PS.transition !== null
      ? (ji === 0 && (ji = dg()), ji)
      : ((e = pe),
        e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : wg(e.type))),
        e)
    : 1;
}
function Vt(e, t, n, r) {
  if (50 < us) throw ((us = 0), (uu = null), Error(H(185)));
  Ls(e, n, r),
    (!(fe & 2) || e !== Me) &&
      (e === Me && (!(fe & 2) && (Ml |= n), je === 4 && Mn(e, Ve)),
      dt(e, r),
      n === 1 && fe === 0 && !(t.mode & 1) && ((wo = Pe() + 500), jl && rr()));
}
function dt(e, t) {
  var n = e.callbackNode;
  P1(e, t);
  var r = Wi(e, e === Me ? Ve : 0);
  if (r === 0)
    n !== null && np(n), (e.callbackNode = null), (e.callbackPriority = 0);
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && np(n), t === 1))
      e.tag === 0 ? DS(qp.bind(null, e)) : Mg(qp.bind(null, e)),
        ES(function () {
          !(fe & 6) && rr();
        }),
        (n = null);
    else {
      switch (pg(r)) {
        case 1:
          n = Qu;
          break;
        case 4:
          n = ug;
          break;
        case 16:
          n = Ui;
          break;
        case 536870912:
          n = fg;
          break;
        default:
          n = Ui;
      }
      n = Ay(n, Py.bind(null, e));
    }
    (e.callbackPriority = t), (e.callbackNode = n);
  }
}
function Py(e, t) {
  if ((($i = -1), (ji = 0), fe & 6)) throw Error(H(327));
  var n = e.callbackNode;
  if (lo() && e.callbackNode !== n) return null;
  var r = Wi(e, e === Me ? Ve : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = cl(e, r);
  else {
    t = r;
    var o = fe;
    fe |= 2;
    var s = Ny();
    (Me !== e || Ve !== t) && ((mn = null), (wo = Pe() + 500), vr(e, t));
    do
      try {
        GS();
        break;
      } catch (l) {
        Ty(e, l);
      }
    while (!0);
    ff(),
      (il.current = s),
      (fe = o),
      Te !== null ? (t = 0) : ((Me = null), (Ve = 0), (t = je));
  }
  if (t !== 0) {
    if (
      (t === 2 && ((o = Fc(e)), o !== 0 && ((r = o), (t = fu(e, o)))), t === 1)
    )
      throw ((n = Rs), vr(e, 0), Mn(e, r), dt(e, Pe()), n);
    if (t === 6) Mn(e, r);
    else {
      if (
        ((o = e.current.alternate),
        !(r & 30) &&
          !KS(o) &&
          ((t = cl(e, r)),
          t === 2 && ((s = Fc(e)), s !== 0 && ((r = s), (t = fu(e, s)))),
          t === 1))
      )
        throw ((n = Rs), vr(e, 0), Mn(e, r), dt(e, Pe()), n);
      switch (((e.finishedWork = o), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(H(345));
        case 2:
          fr(e, it, mn);
          break;
        case 3:
          if (
            (Mn(e, r), (r & 130023424) === r && ((t = _f + 500 - Pe()), 10 < t))
          ) {
            if (Wi(e, 0) !== 0) break;
            if (((o = e.suspendedLanes), (o & r) !== r)) {
              et(), (e.pingedLanes |= e.suspendedLanes & o);
              break;
            }
            e.timeoutHandle = Wc(fr.bind(null, e, it, mn), t);
            break;
          }
          fr(e, it, mn);
          break;
        case 4:
          if ((Mn(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, o = -1; 0 < r; ) {
            var i = 31 - Ht(r);
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
                : 1960 * YS(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = Wc(fr.bind(null, e, it, mn), r);
            break;
          }
          fr(e, it, mn);
          break;
        case 5:
          fr(e, it, mn);
          break;
        default:
          throw Error(H(329));
      }
    }
  }
  return dt(e, Pe()), e.callbackNode === n ? Py.bind(null, e) : null;
}
function fu(e, t) {
  var n = cs;
  return (
    e.current.memoizedState.isDehydrated && (vr(e, t).flags |= 256),
    (e = cl(e, t)),
    e !== 2 && ((t = it), (it = n), t !== null && du(t)),
    e
  );
}
function du(e) {
  it === null ? (it = e) : it.push.apply(it, e);
}
function KS(e) {
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
    t &= ~kf,
      t &= ~Ml,
      e.suspendedLanes |= t,
      e.pingedLanes &= ~t,
      e = e.expirationTimes;
    0 < t;

  ) {
    var n = 31 - Ht(t),
      r = 1 << n;
    (e[n] = -1), (t &= ~r);
  }
}
function qp(e) {
  if (fe & 6) throw Error(H(327));
  lo();
  var t = Wi(e, 0);
  if (!(t & 1)) return dt(e, Pe()), null;
  var n = cl(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Fc(e);
    r !== 0 && ((t = r), (n = fu(e, r)));
  }
  if (n === 1) throw ((n = Rs), vr(e, 0), Mn(e, t), dt(e, Pe()), n);
  if (n === 6) throw Error(H(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    fr(e, it, mn),
    dt(e, Pe()),
    null
  );
}
function Rf(e, t) {
  var n = fe;
  fe |= 1;
  try {
    return e(t);
  } finally {
    (fe = n), fe === 0 && ((wo = Pe() + 500), jl && rr());
  }
}
function _r(e) {
  Bn !== null && Bn.tag === 0 && !(fe & 6) && lo();
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
function Df() {
  (yt = eo.current), we(eo);
}
function vr(e, t) {
  (e.finishedWork = null), (e.finishedLanes = 0);
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), CS(n)), Te !== null))
    for (n = Te.return; n !== null; ) {
      var r = n;
      switch ((af(r), r.tag)) {
        case 1:
          (r = r.type.childContextTypes), r != null && Xi();
          break;
        case 3:
          yo(), we(ut), we(Ge), yf();
          break;
        case 5:
          gf(r);
          break;
        case 4:
          yo();
          break;
        case 13:
          we(be);
          break;
        case 19:
          we(be);
          break;
        case 10:
          df(r.type._context);
          break;
        case 22:
        case 23:
          Df();
      }
      n = n.return;
    }
  if (
    ((Me = e),
    (Te = e = Xn(e.current, null)),
    (Ve = yt = t),
    (je = 0),
    (Rs = null),
    (kf = Ml = kr = 0),
    (it = cs = null),
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
function Ty(e, t) {
  do {
    var n = Te;
    try {
      if ((ff(), (Ti.current = sl), ol)) {
        for (var r = Ce.memoizedState; r !== null; ) {
          var o = r.queue;
          o !== null && (o.pending = null), (r = r.next);
        }
        ol = !1;
      }
      if (
        ((Er = 0),
        (Fe = $e = Ce = null),
        (ls = !1),
        (Es = 0),
        (Ef.current = null),
        n === null || n.return === null)
      ) {
        (je = 1), (Rs = t), (Te = null);
        break;
      }
      e: {
        var s = e,
          i = n.return,
          l = n,
          a = t;
        if (
          ((t = Ve),
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
          var m = Lp(i);
          if (m !== null) {
            (m.flags &= -257),
              Ap(m, i, l, s, t),
              m.mode & 1 && jp(s, c, t),
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
              jp(s, c, t), Pf();
              break e;
            }
            a = Error(H(426));
          }
        } else if (Se && l.mode & 1) {
          var x = Lp(i);
          if (x !== null) {
            !(x.flags & 65536) && (x.flags |= 256),
              Ap(x, i, l, s, t),
              cf(vo(a, l));
            break e;
          }
        }
        (s = a = vo(a, l)),
          je !== 4 && (je = 2),
          cs === null ? (cs = [s]) : cs.push(s),
          (s = i);
        do {
          switch (s.tag) {
            case 3:
              (s.flags |= 65536), (t &= -t), (s.lanes |= t);
              var v = py(s, a, t);
              Dp(s, v);
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
                    (qn === null || !qn.has(y))))
              ) {
                (s.flags |= 65536), (t &= -t), (s.lanes |= t);
                var b = my(s, l, t);
                Dp(s, b);
                break e;
              }
          }
          s = s.return;
        } while (s !== null);
      }
      $y(n);
    } catch (C) {
      (t = C), Te === n && n !== null && (Te = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function Ny() {
  var e = il.current;
  return (il.current = sl), e === null ? sl : e;
}
function Pf() {
  (je === 0 || je === 3 || je === 2) && (je = 4),
    Me === null || (!(kr & 268435455) && !(Ml & 268435455)) || Mn(Me, Ve);
}
function cl(e, t) {
  var n = fe;
  fe |= 2;
  var r = Ny();
  (Me !== e || Ve !== t) && ((mn = null), vr(e, t));
  do
    try {
      qS();
      break;
    } catch (o) {
      Ty(e, o);
    }
  while (!0);
  if ((ff(), (fe = n), (il.current = r), Te !== null)) throw Error(H(261));
  return (Me = null), (Ve = 0), je;
}
function qS() {
  for (; Te !== null; ) Oy(Te);
}
function GS() {
  for (; Te !== null && !S1(); ) Oy(Te);
}
function Oy(e) {
  var t = Ly(e.alternate, e, yt);
  (e.memoizedProps = e.pendingProps),
    t === null ? $y(e) : (Te = t),
    (Ef.current = null);
}
function $y(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = HS(n, t)), n !== null)) {
        (n.flags &= 32767), (Te = n);
        return;
      }
      if (e !== null)
        (e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null);
      else {
        (je = 6), (Te = null);
        return;
      }
    } else if (((n = BS(n, t, yt)), n !== null)) {
      Te = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      Te = t;
      return;
    }
    Te = t = e;
  } while (t !== null);
  je === 0 && (je = 5);
}
function fr(e, t, n) {
  var r = pe,
    o = Rt.transition;
  try {
    (Rt.transition = null), (pe = 1), XS(e, t, n, r);
  } finally {
    (Rt.transition = o), (pe = r);
  }
  return null;
}
function XS(e, t, n, r) {
  do lo();
  while (Bn !== null);
  if (fe & 6) throw Error(H(327));
  n = e.finishedWork;
  var o = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current))
    throw Error(H(177));
  (e.callbackNode = null), (e.callbackPriority = 0);
  var s = n.lanes | n.childLanes;
  if (
    (T1(e, s),
    e === Me && ((Te = Me = null), (Ve = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      di ||
      ((di = !0),
      Ay(Ui, function () {
        return lo(), null;
      })),
    (s = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || s)
  ) {
    (s = Rt.transition), (Rt.transition = null);
    var i = pe;
    pe = 1;
    var l = fe;
    (fe |= 4),
      (Ef.current = null),
      US(e, n),
      Ry(n, e),
      gS(Vc),
      (Yi = !!Hc),
      (Vc = Hc = null),
      (e.current = n),
      WS(n),
      x1(),
      (fe = l),
      (pe = i),
      (Rt.transition = s);
  } else e.current = n;
  if (
    (di && ((di = !1), (Bn = e), (al = o)),
    (s = e.pendingLanes),
    s === 0 && (qn = null),
    E1(n.stateNode),
    dt(e, Pe()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      (o = t[n]), r(o.value, { componentStack: o.stack, digest: o.digest });
  if (ll) throw ((ll = !1), (e = cu), (cu = null), e);
  return (
    al & 1 && e.tag !== 0 && lo(),
    (s = e.pendingLanes),
    s & 1 ? (e === uu ? us++ : ((us = 0), (uu = e))) : (us = 0),
    rr(),
    null
  );
}
function lo() {
  if (Bn !== null) {
    var e = pg(al),
      t = Rt.transition,
      n = pe;
    try {
      if (((Rt.transition = null), (pe = 16 > e ? 16 : e), Bn === null))
        var r = !1;
      else {
        if (((e = Bn), (Bn = null), (al = 0), fe & 6)) throw Error(H(331));
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
                      as(8, u, s);
                  }
                  var f = u.child;
                  if (f !== null) (f.return = u), (K = f);
                  else
                    for (; K !== null; ) {
                      u = K;
                      var d = u.sibling,
                        m = u.return;
                      if ((Ey(u), u === c)) {
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
                    var x = h.sibling;
                    (h.sibling = null), (h = x);
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
                    as(9, s, s.return);
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
                      Fl(9, l);
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
          ((fe = o), rr(), ln && typeof ln.onPostCommitFiberRoot == "function")
        )
          try {
            ln.onPostCommitFiberRoot(Pl, e);
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
function Gp(e, t, n) {
  (t = vo(n, t)),
    (t = py(e, t, 1)),
    (e = Kn(e, t, 1)),
    (t = et()),
    e !== null && (Ls(e, 1, t), dt(e, t));
}
function Re(e, t, n) {
  if (e.tag === 3) Gp(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        Gp(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" &&
            (qn === null || !qn.has(r)))
        ) {
          (e = vo(n, e)),
            (e = my(t, e, 1)),
            (t = Kn(t, e, 1)),
            (e = et()),
            t !== null && (Ls(t, 1, e), dt(t, e));
          break;
        }
      }
      t = t.return;
    }
}
function QS(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t),
    (t = et()),
    (e.pingedLanes |= e.suspendedLanes & n),
    Me === e &&
      (Ve & n) === n &&
      (je === 4 || (je === 3 && (Ve & 130023424) === Ve && 500 > Pe() - _f)
        ? vr(e, 0)
        : (kf |= n)),
    dt(e, t);
}
function jy(e, t) {
  t === 0 &&
    (e.mode & 1
      ? ((t = ni), (ni <<= 1), !(ni & 130023424) && (ni = 4194304))
      : (t = 1));
  var n = et();
  (e = bn(e, t)), e !== null && (Ls(e, t, n), dt(e, n));
}
function JS(e) {
  var t = e.memoizedState,
    n = 0;
  t !== null && (n = t.retryLane), jy(e, n);
}
function ZS(e, t) {
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
  r !== null && r.delete(t), jy(e, n);
}
var Ly;
Ly = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || ut.current) lt = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return (lt = !1), IS(e, t, n);
      lt = !!(e.flags & 131072);
    }
  else (lt = !1), Se && t.flags & 1048576 && zg(t, Zi, t.index);
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      Oi(e, t), (e = t.pendingProps);
      var o = mo(t, Ge.current);
      io(t, n), (o = wf(null, t, r, e, o, n));
      var s = Sf();
      return (
        (t.flags |= 1),
        typeof o == "object" &&
        o !== null &&
        typeof o.render == "function" &&
        o.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            ft(r) ? ((s = !0), Qi(t)) : (s = !1),
            (t.memoizedState =
              o.state !== null && o.state !== void 0 ? o.state : null),
            mf(t),
            (o.updater = Al),
            (t.stateNode = o),
            (o._reactInternals = t),
            Jc(t, r, e, n),
            (t = tu(null, t, r, !0, s, n)))
          : ((t.tag = 0), Se && s && lf(t), Je(null, t, o, n), (t = t.child)),
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
          (o = t.tag = tx(r)),
          (e = Mt(r, e)),
          o)
        ) {
          case 0:
            t = eu(null, t, r, e, n);
            break e;
          case 1:
            t = zp(null, t, r, e, n);
            break e;
          case 11:
            t = Fp(null, t, r, e, n);
            break e;
          case 14:
            t = Mp(null, t, r, Mt(r.type, e), n);
            break e;
        }
        throw Error(H(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        eu(e, t, r, o, n)
      );
    case 1:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        zp(e, t, r, o, n)
      );
    case 3:
      e: {
        if ((vy(t), e === null)) throw Error(H(387));
        (r = t.pendingProps),
          (s = t.memoizedState),
          (o = s.element),
          Wg(e, t),
          nl(t, r, null, n);
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
            (o = vo(Error(H(423)), t)), (t = Ip(e, t, r, n, o));
            break e;
          } else if (r !== o) {
            (o = vo(Error(H(424)), t)), (t = Ip(e, t, r, n, o));
            break e;
          } else
            for (
              vt = Yn(t.stateNode.containerInfo.firstChild),
                wt = t,
                Se = !0,
                It = null,
                n = Vg(t, null, r, n),
                t.child = n;
              n;

            )
              (n.flags = (n.flags & -3) | 4096), (n = n.sibling);
        else {
          if ((ho(), r === o)) {
            t = Cn(e, t, n);
            break e;
          }
          Je(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Yg(t),
        e === null && Gc(t),
        (r = t.type),
        (o = t.pendingProps),
        (s = e !== null ? e.memoizedProps : null),
        (i = o.children),
        Uc(r, o) ? (i = null) : s !== null && Uc(r, s) && (t.flags |= 32),
        yy(e, t),
        Je(e, t, i, n),
        t.child
      );
    case 6:
      return e === null && Gc(t), null;
    case 13:
      return wy(e, t, n);
    case 4:
      return (
        hf(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = go(t, null, r, n)) : Je(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        Fp(e, t, r, o, n)
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
          ge(el, r._currentValue),
          (r._currentValue = i),
          s !== null)
        )
          if (Wt(s.value, i)) {
            if (s.children === o.children && !ut.current) {
              t = Cn(e, t, n);
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
                      (a = vn(-1, n & -n)), (a.tag = 2);
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
                if (((i = s.return), i === null)) throw Error(H(341));
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
        io(t, n),
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
        Mp(e, t, r, o, n)
      );
    case 15:
      return hy(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (o = t.pendingProps),
        (o = t.elementType === r ? o : Mt(r, o)),
        Oi(e, t),
        (t.tag = 1),
        ft(r) ? ((e = !0), Qi(t)) : (e = !1),
        io(t, n),
        dy(t, r, o),
        Jc(t, r, o, n),
        tu(null, t, r, !0, e, n)
      );
    case 19:
      return Sy(e, t, n);
    case 22:
      return gy(e, t, n);
  }
  throw Error(H(156, t.tag));
};
function Ay(e, t) {
  return cg(e, t);
}
function ex(e, t, n, r) {
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
  return new ex(e, t, n, r);
}
function Tf(e) {
  return (e = e.prototype), !(!e || !e.isReactComponent);
}
function tx(e) {
  if (typeof e == "function") return Tf(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === qu)) return 11;
    if (e === Gu) return 14;
  }
  return 2;
}
function Xn(e, t) {
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
  if (((r = e), typeof e == "function")) Tf(e) && (i = 1);
  else if (typeof e == "string") i = 5;
  else
    e: switch (e) {
      case Ur:
        return wr(n.children, o, s, t);
      case Ku:
        (i = 8), (o |= 8);
        break;
      case bc:
        return (
          (e = _t(12, n, t, o | 2)), (e.elementType = bc), (e.lanes = s), e
        );
      case Cc:
        return (e = _t(13, n, t, o)), (e.elementType = Cc), (e.lanes = s), e;
      case Ec:
        return (e = _t(19, n, t, o)), (e.elementType = Ec), (e.lanes = s), e;
      case Yh:
        return zl(n, o, s, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Uh:
              i = 10;
              break e;
            case Wh:
              i = 9;
              break e;
            case qu:
              i = 11;
              break e;
            case Gu:
              i = 14;
              break e;
            case jn:
              (i = 16), (r = null);
              break e;
          }
        throw Error(H(130, e == null ? e : typeof e, ""));
    }
  return (
    (t = _t(i, n, t, o)), (t.elementType = e), (t.type = r), (t.lanes = s), t
  );
}
function wr(e, t, n, r) {
  return (e = _t(7, e, r, t)), (e.lanes = n), e;
}
function zl(e, t, n, r) {
  return (
    (e = _t(22, e, r, t)),
    (e.elementType = Yh),
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
function nx(e, t, n, r, o) {
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
    (this.eventTimes = ja(0)),
    (this.expirationTimes = ja(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = ja(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = o),
    (this.mutableSourceEagerHydrationData = null);
}
function Nf(e, t, n, r, o, s, i, l, a) {
  return (
    (e = new nx(e, t, n, l, a)),
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
    mf(s),
    e
  );
}
function rx(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Vr,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Fy(e) {
  if (!e) return Jn;
  e = e._reactInternals;
  e: {
    if (Or(e) !== e || e.tag !== 1) throw Error(H(170));
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
    throw Error(H(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (ft(n)) return Fg(e, n, t);
  }
  return t;
}
function My(e, t, n, r, o, s, i, l, a) {
  return (
    (e = Nf(n, r, !0, e, o, s, i, l, a)),
    (e.context = Fy(null)),
    (n = e.current),
    (r = et()),
    (o = Gn(n)),
    (s = vn(r, o)),
    (s.callback = t ?? null),
    Kn(n, s, o),
    (e.current.lanes = o),
    Ls(e, o, r),
    dt(e, r),
    e
  );
}
function Il(e, t, n, r) {
  var o = t.current,
    s = et(),
    i = Gn(o);
  return (
    (n = Fy(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = vn(s, i)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Kn(o, t, i)),
    e !== null && (Vt(e, o, i, s), Pi(e, o, i)),
    i
  );
}
function ul(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Xp(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Of(e, t) {
  Xp(e, t), (e = e.alternate) && Xp(e, t);
}
function ox() {
  return null;
}
var zy =
  typeof reportError == "function"
    ? reportError
    : function (e) {
        console.error(e);
      };
function $f(e) {
  this._internalRoot = e;
}
Bl.prototype.render = $f.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(H(409));
  Il(e, t, null, null);
};
Bl.prototype.unmount = $f.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    _r(function () {
      Il(null, e, null, null);
    }),
      (t[xn] = null);
  }
};
function Bl(e) {
  this._internalRoot = e;
}
Bl.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = gg();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Fn.length && t !== 0 && t < Fn[n].priority; n++);
    Fn.splice(n, 0, e), n === 0 && vg(e);
  }
};
function jf(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Hl(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function Qp() {}
function sx(e, t, n, r, o) {
  if (o) {
    if (typeof r == "function") {
      var s = r;
      r = function () {
        var c = ul(i);
        s.call(c);
      };
    }
    var i = My(t, r, e, 0, null, !1, !1, "", Qp);
    return (
      (e._reactRootContainer = i),
      (e[xn] = i.current),
      ws(e.nodeType === 8 ? e.parentNode : e),
      _r(),
      i
    );
  }
  for (; (o = e.lastChild); ) e.removeChild(o);
  if (typeof r == "function") {
    var l = r;
    r = function () {
      var c = ul(a);
      l.call(c);
    };
  }
  var a = Nf(e, 0, !1, null, null, !1, !1, "", Qp);
  return (
    (e._reactRootContainer = a),
    (e[xn] = a.current),
    ws(e.nodeType === 8 ? e.parentNode : e),
    _r(function () {
      Il(t, a, n, r);
    }),
    a
  );
}
function Vl(e, t, n, r, o) {
  var s = n._reactRootContainer;
  if (s) {
    var i = s;
    if (typeof o == "function") {
      var l = o;
      o = function () {
        var a = ul(i);
        l.call(a);
      };
    }
    Il(t, i, e, o);
  } else i = sx(n, t, e, o, r);
  return ul(i);
}
mg = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = es(t.pendingLanes);
        n !== 0 &&
          (Ju(t, n | 1), dt(t, Pe()), !(fe & 6) && ((wo = Pe() + 500), rr()));
      }
      break;
    case 13:
      _r(function () {
        var r = bn(e, 1);
        if (r !== null) {
          var o = et();
          Vt(r, e, 1, o);
        }
      }),
        Of(e, 1);
  }
};
Zu = function (e) {
  if (e.tag === 13) {
    var t = bn(e, 134217728);
    if (t !== null) {
      var n = et();
      Vt(t, e, 134217728, n);
    }
    Of(e, 134217728);
  }
};
hg = function (e) {
  if (e.tag === 13) {
    var t = Gn(e),
      n = bn(e, t);
    if (n !== null) {
      var r = et();
      Vt(n, e, t, r);
    }
    Of(e, t);
  }
};
gg = function () {
  return pe;
};
yg = function (e, t) {
  var n = pe;
  try {
    return (pe = e), t();
  } finally {
    pe = n;
  }
};
jc = function (e, t, n) {
  switch (t) {
    case "input":
      if ((Rc(e, n), (t = n.name), n.type === "radio" && t != null)) {
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
            var o = $l(r);
            if (!o) throw Error(H(90));
            qh(r), Rc(r, o);
          }
        }
      }
      break;
    case "textarea":
      Xh(e, n);
      break;
    case "select":
      (t = n.value), t != null && no(e, !!n.multiple, t, !1);
  }
};
rg = Rf;
og = _r;
var ix = { usingClientEntryPoint: !1, Events: [Fs, qr, $l, tg, ng, Rf] },
  Yo = {
    findFiberByHostInstance: mr,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  lx = {
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
    currentDispatcherRef: kn.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return (e = lg(e)), e === null ? null : e.stateNode;
    },
    findFiberByHostInstance: Yo.findFiberByHostInstance || ox,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var pi = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!pi.isDisabled && pi.supportsFiber)
    try {
      (Pl = pi.inject(lx)), (ln = pi);
    } catch {}
}
bt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ix;
bt.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!jf(t)) throw Error(H(200));
  return rx(e, t, null, n);
};
bt.createRoot = function (e, t) {
  if (!jf(e)) throw Error(H(299));
  var n = !1,
    r = "",
    o = zy;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (o = t.onRecoverableError)),
    (t = Nf(e, 1, !1, null, null, n, !1, r, o)),
    (e[xn] = t.current),
    ws(e.nodeType === 8 ? e.parentNode : e),
    new $f(t)
  );
};
bt.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(H(188))
      : ((e = Object.keys(e).join(",")), Error(H(268, e)));
  return (e = lg(t)), (e = e === null ? null : e.stateNode), e;
};
bt.flushSync = function (e) {
  return _r(e);
};
bt.hydrate = function (e, t, n) {
  if (!Hl(t)) throw Error(H(200));
  return Vl(null, e, t, !0, n);
};
bt.hydrateRoot = function (e, t, n) {
  if (!jf(e)) throw Error(H(405));
  var r = (n != null && n.hydratedSources) || null,
    o = !1,
    s = "",
    i = zy;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (o = !0),
      n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (i = n.onRecoverableError)),
    (t = My(t, null, e, 1, n ?? null, o, !1, s, i)),
    (e[xn] = t.current),
    ws(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      (n = r[e]),
        (o = n._getVersion),
        (o = o(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, o])
          : t.mutableSourceEagerHydrationData.push(n, o);
  return new Bl(t);
};
bt.render = function (e, t, n) {
  if (!Hl(t)) throw Error(H(200));
  return Vl(null, e, t, !1, n);
};
bt.unmountComponentAtNode = function (e) {
  if (!Hl(e)) throw Error(H(40));
  return e._reactRootContainer
    ? (_r(function () {
        Vl(null, null, e, !1, function () {
          (e._reactRootContainer = null), (e[xn] = null);
        });
      }),
      !0)
    : !1;
};
bt.unstable_batchedUpdates = Rf;
bt.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Hl(n)) throw Error(H(200));
  if (e == null || e._reactInternals === void 0) throw Error(H(38));
  return Vl(e, t, n, !1, r);
};
bt.version = "18.3.1-next-f1338f8080-20240426";
function Iy() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Iy);
    } catch (e) {
      console.error(e);
    }
}
Iy(), (Ih.exports = bt);
var zs = Ih.exports;
const ax = Tr(zs);
var Jp = zs;
(Sc.createRoot = Jp.createRoot), (Sc.hydrateRoot = Jp.hydrateRoot);
var sn = function () {
  return (
    (sn =
      Object.assign ||
      function (t) {
        for (var n, r = 1, o = arguments.length; r < o; r++) {
          n = arguments[r];
          for (var s in n)
            Object.prototype.hasOwnProperty.call(n, s) && (t[s] = n[s]);
        }
        return t;
      }),
    sn.apply(this, arguments)
  );
};
function By(e, t) {
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
function cx(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, o = t.length, s; r < o; r++)
      (s || !(r in t)) &&
        (s || (s = Array.prototype.slice.call(t, 0, r)), (s[r] = t[r]));
  return e.concat(s || Array.prototype.slice.call(t));
}
var Ai = "right-scroll-bar-position",
  Fi = "width-before-scroll-bar",
  ux = "with-scroll-bars-hidden",
  fx = "--removed-body-scroll-bar-size";
function tc(e, t) {
  return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
function dx(e, t) {
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
var px = typeof window < "u" ? w.useLayoutEffect : w.useEffect,
  Zp = new WeakMap();
function mx(e, t) {
  var n = dx(null, function (r) {
    return e.forEach(function (o) {
      return tc(o, r);
    });
  });
  return (
    px(
      function () {
        var r = Zp.get(n);
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
        Zp.set(n, e);
      },
      [e]
    ),
    n
  );
}
function hx(e) {
  return e;
}
function gx(e, t) {
  t === void 0 && (t = hx);
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
function yx(e) {
  e === void 0 && (e = {});
  var t = gx(null);
  return (t.options = sn({ async: !0, ssr: !1 }, e)), t;
}
var Hy = function (e) {
  var t = e.sideCar,
    n = By(e, ["sideCar"]);
  if (!t)
    throw new Error(
      "Sidecar: please provide `sideCar` property to import the right car"
    );
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return w.createElement(r, sn({}, n));
};
Hy.isSideCarExport = !0;
function vx(e, t) {
  return e.useMedium(t), Hy;
}
var Vy = yx(),
  nc = function () {},
  Ul = w.forwardRef(function (e, t) {
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
      x = e.as,
      v = x === void 0 ? "div" : x,
      g = e.gapMode,
      y = By(e, [
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
      C = mx([n, t]),
      E = sn(sn({}, y), o);
    return w.createElement(
      w.Fragment,
      null,
      u &&
        w.createElement(b, {
          sideCar: Vy,
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
        ? w.cloneElement(w.Children.only(l), sn(sn({}, E), { ref: C }))
        : w.createElement(v, sn({}, E, { className: a, ref: C }), l)
    );
  });
Ul.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Ul.classNames = { fullWidth: Fi, zeroRight: Ai };
var wx = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function Sx() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = wx();
  return t && e.setAttribute("nonce", t), e;
}
function xx(e, t) {
  e.styleSheet
    ? (e.styleSheet.cssText = t)
    : e.appendChild(document.createTextNode(t));
}
function bx(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var Cx = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        e == 0 && (t = Sx()) && (xx(t, n), bx(t)), e++;
      },
      remove: function () {
        e--,
          !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null));
      },
    };
  },
  Ex = function () {
    var e = Cx();
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
  Uy = function () {
    var e = Ex(),
      t = function (n) {
        var r = n.styles,
          o = n.dynamic;
        return e(r, o), null;
      };
    return t;
  },
  kx = { left: 0, top: 0, right: 0, gap: 0 },
  rc = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  _x = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      o = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [rc(n), rc(r), rc(o)];
  },
  Rx = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return kx;
    var t = _x(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return {
      left: t[0],
      top: t[1],
      right: t[2],
      gap: Math.max(0, r - n + t[2] - t[0]),
    };
  },
  Dx = Uy(),
  ao = "data-scroll-locked",
  Px = function (e, t, n, r) {
    var o = e.left,
      s = e.top,
      i = e.right,
      l = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          ux,
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
          ao,
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
          Ai,
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
          Fi,
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
        .concat(Ai, " .")
        .concat(
          Ai,
          ` {
    right: 0 `
        )
        .concat(
          r,
          `;
  }
  
  .`
        )
        .concat(Fi, " .")
        .concat(
          Fi,
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
          ao,
          `] {
    `
        )
        .concat(fx, ": ")
        .concat(
          l,
          `px;
  }
`
        )
    );
  },
  em = function () {
    var e = parseInt(document.body.getAttribute(ao) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  Tx = function () {
    w.useEffect(function () {
      return (
        document.body.setAttribute(ao, (em() + 1).toString()),
        function () {
          var e = em() - 1;
          e <= 0
            ? document.body.removeAttribute(ao)
            : document.body.setAttribute(ao, e.toString());
        }
      );
    }, []);
  },
  Nx = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      o = r === void 0 ? "margin" : r;
    Tx();
    var s = w.useMemo(
      function () {
        return Rx(o);
      },
      [o]
    );
    return w.createElement(Dx, { styles: Px(s, !t, o, n ? "" : "!important") });
  },
  pu = !1;
if (typeof window < "u")
  try {
    var mi = Object.defineProperty({}, "passive", {
      get: function () {
        return (pu = !0), !0;
      },
    });
    window.addEventListener("test", mi, mi),
      window.removeEventListener("test", mi, mi);
  } catch {
    pu = !1;
  }
var Mr = pu ? { passive: !1 } : !1,
  Ox = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Wy = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return (
      n[t] !== "hidden" &&
      !(n.overflowY === n.overflowX && !Ox(e) && n[t] === "visible")
    );
  },
  $x = function (e) {
    return Wy(e, "overflowY");
  },
  jx = function (e) {
    return Wy(e, "overflowX");
  },
  tm = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var o = Yy(e, r);
      if (o) {
        var s = Ky(e, r),
          i = s[1],
          l = s[2];
        if (i > l) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  Lx = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Ax = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  Yy = function (e, t) {
    return e === "v" ? $x(t) : jx(t);
  },
  Ky = function (e, t) {
    return e === "v" ? Lx(t) : Ax(t);
  },
  Fx = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  Mx = function (e, t, n, r, o) {
    var s = Fx(e, window.getComputedStyle(t).direction),
      i = s * r,
      l = n.target,
      a = t.contains(l),
      c = !1,
      u = i > 0,
      f = 0,
      d = 0;
    do {
      var m = Ky(e, l),
        p = m[0],
        h = m[1],
        x = m[2],
        v = h - x - s * p;
      (p || v) && Yy(e, l) && ((f += v), (d += p)),
        l instanceof ShadowRoot ? (l = l.host) : (l = l.parentNode);
    } while ((!a && l !== document.body) || (a && (t.contains(l) || t === l)));
    return (
      ((u && (Math.abs(f) < 1 || !o)) || (!u && (Math.abs(d) < 1 || !o))) &&
        (c = !0),
      c
    );
  },
  hi = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  nm = function (e) {
    return [e.deltaX, e.deltaY];
  },
  rm = function (e) {
    return e && "current" in e ? e.current : e;
  },
  zx = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  Ix = function (e) {
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
  Bx = 0,
  zr = [];
function Hx(e) {
  var t = w.useRef([]),
    n = w.useRef([0, 0]),
    r = w.useRef(),
    o = w.useState(Bx++)[0],
    s = w.useState(Uy)[0],
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
          var h = cx([e.lockRef.current], (e.shards || []).map(rm), !0).filter(
            Boolean
          );
          return (
            h.forEach(function (x) {
              return x.classList.add("allow-interactivity-".concat(o));
            }),
            function () {
              document.body.classList.remove("block-interactivity-".concat(o)),
                h.forEach(function (x) {
                  return x.classList.remove("allow-interactivity-".concat(o));
                });
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards]
    );
  var l = w.useCallback(function (h, x) {
      if ("touches" in h && h.touches.length === 2)
        return !i.current.allowPinchZoom;
      var v = hi(h),
        g = n.current,
        y = "deltaX" in h ? h.deltaX : g[0] - v[0],
        b = "deltaY" in h ? h.deltaY : g[1] - v[1],
        C,
        E = h.target,
        R = Math.abs(y) > Math.abs(b) ? "h" : "v";
      if ("touches" in h && R === "h" && E.type === "range") return !1;
      var D = tm(R, E);
      if (!D) return !0;
      if ((D ? (C = R) : ((C = R === "v" ? "h" : "v"), (D = tm(R, E))), !D))
        return !1;
      if (
        (!r.current && "changedTouches" in h && (y || b) && (r.current = C), !C)
      )
        return !0;
      var L = r.current || C;
      return Mx(L, x, h, L === "h" ? y : b, !0);
    }, []),
    a = w.useCallback(function (h) {
      var x = h;
      if (!(!zr.length || zr[zr.length - 1] !== s)) {
        var v = "deltaY" in x ? nm(x) : hi(x),
          g = t.current.filter(function (C) {
            return (
              C.name === x.type &&
              (C.target === x.target || x.target === C.shadowParent) &&
              zx(C.delta, v)
            );
          })[0];
        if (g && g.should) {
          x.cancelable && x.preventDefault();
          return;
        }
        if (!g) {
          var y = (i.current.shards || [])
              .map(rm)
              .filter(Boolean)
              .filter(function (C) {
                return C.contains(x.target);
              }),
            b = y.length > 0 ? l(x, y[0]) : !i.current.noIsolation;
          b && x.cancelable && x.preventDefault();
        }
      }
    }, []),
    c = w.useCallback(function (h, x, v, g) {
      var y = { name: h, delta: x, target: v, should: g, shadowParent: Vx(v) };
      t.current.push(y),
        setTimeout(function () {
          t.current = t.current.filter(function (b) {
            return b !== y;
          });
        }, 1);
    }, []),
    u = w.useCallback(function (h) {
      (n.current = hi(h)), (r.current = void 0);
    }, []),
    f = w.useCallback(function (h) {
      c(h.type, nm(h), h.target, l(h, e.lockRef.current));
    }, []),
    d = w.useCallback(function (h) {
      c(h.type, hi(h), h.target, l(h, e.lockRef.current));
    }, []);
  w.useEffect(function () {
    return (
      zr.push(s),
      e.setCallbacks({
        onScrollCapture: f,
        onWheelCapture: f,
        onTouchMoveCapture: d,
      }),
      document.addEventListener("wheel", a, Mr),
      document.addEventListener("touchmove", a, Mr),
      document.addEventListener("touchstart", u, Mr),
      function () {
        (zr = zr.filter(function (h) {
          return h !== s;
        })),
          document.removeEventListener("wheel", a, Mr),
          document.removeEventListener("touchmove", a, Mr),
          document.removeEventListener("touchstart", u, Mr);
      }
    );
  }, []);
  var m = e.removeScrollBar,
    p = e.inert;
  return w.createElement(
    w.Fragment,
    null,
    p ? w.createElement(s, { styles: Ix(o) }) : null,
    m ? w.createElement(Nx, { gapMode: e.gapMode }) : null
  );
}
function Vx(e) {
  for (var t = null; e !== null; )
    e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode);
  return t;
}
const Ux = vx(Vy, Hx);
var qy = w.forwardRef(function (e, t) {
  return w.createElement(Ul, sn({}, e, { ref: t, sideCar: Ux }));
});
qy.classNames = Ul.classNames;
function cn(e) {
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
function Wx(e) {
  return e.replace(/[A-Z]/g, (t) => `-${t.toLowerCase()}`);
}
function Yx(e) {
  var t;
  return typeof e != "string" || !e.includes("var(--mantine-scale)")
    ? e
    : (t = e.match(/^calc\((.*?)\)$/)) == null
    ? void 0
    : t[1].split("*")[0].trim();
}
function Kx(e) {
  const t = Yx(e);
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
function Gy(e, { shouldScale: t = !1 } = {}) {
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
const z = Gy("rem", { shouldScale: !0 }),
  om = Gy("em");
function Af(e) {
  return Object.keys(e).reduce(
    (t, n) => (e[n] !== void 0 && (t[n] = e[n]), t),
    {}
  );
}
function Xy(e) {
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
function $r(e) {
  const t = w.createContext(null);
  return [
    ({ children: o, value: s }) => S.jsx(t.Provider, { value: s, children: o }),
    () => {
      const o = w.useContext(t);
      if (o === null) throw new Error(e);
      return o;
    },
  ];
}
function qx(e = null) {
  const t = w.createContext(e);
  return [
    ({ children: o, value: s }) => S.jsx(t.Provider, { value: s, children: o }),
    () => w.useContext(t),
  ];
}
const Gx = { app: 100, modal: 200, popover: 300, overlay: 400, max: 9999 };
function jr(e) {
  return Gx[e];
}
const Xx = () => {};
function Qx(e, t = { active: !0 }) {
  return typeof e != "function" || !t.active
    ? t.onKeyDown || Xx
    : (n) => {
        var r;
        n.key === "Escape" && (e(n), (r = t.onTrigger) == null || r.call(t));
      };
}
function ze(e, t = "size", n = !0) {
  if (e !== void 0) return Xy(e) ? (n ? z(e) : e) : `var(--${t}-${e})`;
}
function Wl(e) {
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
function Jx(e) {
  return ze(e, "mantine-line-height", !1);
}
function Ff(e) {
  if (e) return ze(e, "mantine-shadow", !1);
}
function Zx(e, t, n) {
  return t === void 0 && n === void 0
    ? e
    : t !== void 0 && n === void 0
    ? Math.max(e, t)
    : Math.min(t === void 0 && n !== void 0 ? e : Math.max(e, t), n);
}
function Qy() {
  return `mantine-${Math.random().toString(36).slice(2, 11)}`;
}
function sm(e) {
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
function Yl(e, t) {
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
const im = ["mousedown", "touchstart"];
function eb(e, t, n) {
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
        (t || im).forEach((s) => document.addEventListener(s, o)),
        () => {
          (t || im).forEach((s) => document.removeEventListener(s, o));
        }
      );
    }, [r, e, n]),
    r
  );
}
function tb(e, t) {
  try {
    return (
      e.addEventListener("change", t), () => e.removeEventListener("change", t)
    );
  } catch {
    return e.addListener(t), () => e.removeListener(t);
  }
}
function nb(e, t) {
  return typeof window < "u" && "matchMedia" in window
    ? window.matchMedia(e).matches
    : !1;
}
function rb(
  e,
  t,
  { getInitialValueInEffect: n } = { getInitialValueInEffect: !0 }
) {
  const [r, o] = w.useState(n ? t : nb(e)),
    s = w.useRef();
  return (
    w.useEffect(() => {
      if ("matchMedia" in window)
        return (
          (s.current = window.matchMedia(e)),
          o(s.current.matches),
          tb(s.current, (i) => o(i.matches))
        );
    }, [e]),
    r
  );
}
const Is = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
function Rr(e, t) {
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
function Jy({ opened: e, shouldReturnFocus: t = !0 }) {
  const n = w.useRef(),
    r = () => {
      var o;
      n.current &&
        "focus" in n.current &&
        typeof n.current.focus == "function" &&
        ((o = n.current) == null || o.focus({ preventScroll: !0 }));
    };
  return (
    Rr(() => {
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
function ob(e, t = "body > :not(script)") {
  const n = Qy(),
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
const sb = /input|select|textarea|button|object/,
  Zy = "a, input, select, textarea, button, object, [tabindex]";
function ib(e) {
  return e.style.display === "none";
}
function lb(e) {
  if (
    e.getAttribute("aria-hidden") ||
    e.getAttribute("hidden") ||
    e.getAttribute("type") === "hidden"
  )
    return !1;
  let n = e;
  for (; n && !(n === document.body || n.nodeType === 11); ) {
    if (ib(n)) return !1;
    n = n.parentNode;
  }
  return !0;
}
function ev(e) {
  let t = e.getAttribute("tabindex");
  return t === null && (t = void 0), parseInt(t, 10);
}
function mu(e) {
  const t = e.nodeName.toLowerCase(),
    n = !Number.isNaN(ev(e));
  return (
    ((sb.test(t) && !e.disabled) ||
      (e instanceof HTMLAnchorElement && e.href) ||
      n) &&
    lb(e)
  );
}
function tv(e) {
  const t = ev(e);
  return (Number.isNaN(t) || t >= 0) && mu(e);
}
function ab(e) {
  return Array.from(e.querySelectorAll(Zy)).filter(tv);
}
function cb(e, t) {
  const n = ab(e);
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
function ub(e = !0) {
  const t = w.useRef(),
    n = w.useRef(null),
    r = (s) => {
      let i = s.querySelector("[data-autofocus]");
      if (!i) {
        const l = Array.from(s.querySelectorAll(Zy));
        (i = l.find(tv) || l.find(mu) || null), !i && mu(s) && (i = s);
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
          (n.current = ob(s)),
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
        i.key === "Tab" && t.current && cb(t.current, i);
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
const fb = Dl.useId || (() => {});
function db() {
  const e = fb();
  return e ? `mantine-${e.replace(/:/g, "")}` : "";
}
function Bs(e) {
  const t = db(),
    [n, r] = w.useState(t);
  return (
    Is(() => {
      r(Qy());
    }, []),
    typeof e == "string" ? e : typeof window > "u" ? t : n
  );
}
function pb(e, t, n) {
  w.useEffect(
    () => (
      window.addEventListener(e, t, n),
      () => window.removeEventListener(e, t, n)
    ),
    [e, t]
  );
}
function Mf(e, t) {
  typeof e == "function"
    ? e(t)
    : typeof e == "object" && e !== null && "current" in e && (e.current = t);
}
function nv(...e) {
  return (t) => {
    e.forEach((n) => Mf(n, t));
  };
}
function Ot(...e) {
  return w.useCallback(nv(...e), e);
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
function zf(e, t) {
  return rb("(prefers-reduced-motion: reduce)", e, t);
}
function fl(e = !1, t) {
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
var mb = {};
function hb() {
  return typeof process < "u" && mb ? "production" : "development";
}
function rv(e) {
  var t,
    n,
    r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object")
    if (Array.isArray(e)) {
      var o = e.length;
      for (t = 0; t < o; t++)
        e[t] && (n = rv(e[t])) && (r && (r += " "), (r += n));
    } else for (n in e) e[n] && (r && (r += " "), (r += n));
  return r;
}
function nt() {
  for (var e, t, n = 0, r = "", o = arguments.length; n < o; n++)
    (e = arguments[n]) && (t = rv(e)) && (r && (r += " "), (r += t));
  return r;
}
const gb = {};
function yb(e) {
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
function Kl({ theme: e, classNames: t, props: n, stylesCtx: r }) {
  const s = (Array.isArray(t) ? t : [t]).map((i) =>
    typeof i == "function" ? i(e, n, r) : i || gb
  );
  return yb(s);
}
function dl({ theme: e, styles: t, props: n, stylesCtx: r }) {
  return (Array.isArray(t) ? t : [t]).reduce(
    (s, i) =>
      typeof i == "function" ? { ...s, ...i(e, n, r) } : { ...s, ...i },
    {}
  );
}
const ov = w.createContext(null);
function Lr() {
  const e = w.useContext(ov);
  if (!e)
    throw new Error("[@mantine/core] MantineProvider was not found in tree");
  return e;
}
function vb() {
  return Lr().cssVariablesResolver;
}
function wb() {
  return Lr().classNamesPrefix;
}
function If() {
  return Lr().getStyleNonce;
}
function Sb() {
  return Lr().withStaticClasses;
}
function xb() {
  return Lr().headless;
}
function bb() {
  var e;
  return (e = Lr().stylesTransform) == null ? void 0 : e.sx;
}
function Cb() {
  var e;
  return (e = Lr().stylesTransform) == null ? void 0 : e.styles;
}
function Eb(e) {
  return /^#?([0-9A-F]{3}){1,2}([0-9A-F]{2})?$/i.test(e);
}
function kb(e) {
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
function _b(e) {
  const [t, n, r, o] = e
    .replace(/[^0-9,./]/g, "")
    .split(/[/,]/)
    .map(Number);
  return { r: t, g: n, b: r, a: o || 1 };
}
function Rb(e) {
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
function Bf(e) {
  return Eb(e)
    ? kb(e)
    : e.startsWith("rgb")
    ? _b(e)
    : e.startsWith("hsl")
    ? Rb(e)
    : { r: 0, g: 0, b: 0, a: 1 };
}
function gi(e, t) {
  if (e.startsWith("var("))
    return `color-mix(in srgb, ${e}, black ${t * 100}%)`;
  const { r: n, g: r, b: o, a: s } = Bf(e),
    i = 1 - t,
    l = (a) => Math.round(a * i);
  return `rgba(${l(n)}, ${l(r)}, ${l(o)}, ${s})`;
}
function Ds(e, t) {
  return typeof e.primaryShade == "number"
    ? e.primaryShade
    : t === "dark"
    ? e.primaryShade.dark
    : e.primaryShade.light;
}
function ic(e) {
  return e <= 0.03928 ? e / 12.92 : ((e + 0.055) / 1.055) ** 2.4;
}
function Db(e) {
  const t = e.match(/oklch\((.*?)%\s/);
  return t ? parseFloat(t[1]) : null;
}
function Pb(e) {
  if (e.startsWith("oklch(")) return (Db(e) || 0) / 100;
  const { r: t, g: n, b: r } = Bf(e),
    o = t / 255,
    s = n / 255,
    i = r / 255,
    l = ic(o),
    a = ic(s),
    c = ic(i);
  return 0.2126 * l + 0.7152 * a + 0.0722 * c;
}
function Ko(e, t = 0.179) {
  return e.startsWith("var(") ? !1 : Pb(e) > t;
}
function Hs({ color: e, theme: t, colorScheme: n }) {
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
    const l = s !== void 0 ? t.colors[r][s] : t.colors[r][Ds(t, n || "light")];
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
function pl(e, t) {
  const n = Hs({ color: e || t.primaryColor, theme: t });
  return n.variable ? `var(${n.variable})` : e;
}
function hu(e, t) {
  const n = {
      from: (e == null ? void 0 : e.from) || t.defaultGradient.from,
      to: (e == null ? void 0 : e.to) || t.defaultGradient.to,
      deg: (e == null ? void 0 : e.deg) || t.defaultGradient.deg || 0,
    },
    r = pl(n.from, t),
    o = pl(n.to, t);
  return `linear-gradient(${n.deg}deg, ${r} 0%, ${o} 100%)`;
}
function nn(e, t) {
  if (typeof e != "string" || t > 1 || t < 0) return "rgba(0, 0, 0, 1)";
  if (e.startsWith("var(")) {
    const s = (1 - t) * 100;
    return `color-mix(in srgb, ${e}, transparent ${s}%)`;
  }
  if (e.startsWith("oklch"))
    return e.includes("/")
      ? e.replace(/\/\s*[\d.]+\s*\)/, `/ ${t})`)
      : e.replace(")", ` / ${t})`);
  const { r: n, g: r, b: o } = Bf(e);
  return `rgba(${n}, ${r}, ${o}, ${t})`;
}
const Ir = nn,
  Tb = ({ color: e, theme: t, variant: n, gradient: r, autoContrast: o }) => {
    const s = Hs({ color: e, theme: t }),
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
            hover: gi(e, 0.1),
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
          background: nn(l, 0.1),
          hover: nn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: nn(e, 0.1),
        hover: nn(e, 0.12),
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
              hover: nn(t.colors[s.color][s.shade], 0.05),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid var(--mantine-color-${s.color}-${
                s.shade
              })`,
            }
        : {
            background: "transparent",
            hover: nn(e, 0.05),
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
          hover: nn(l, 0.12),
          color: `var(--mantine-color-${s.color}-${Math.min(s.shade, 6)})`,
          border: `${z(1)} solid transparent`,
        };
      }
      return {
        background: "transparent",
        hover: nn(e, 0.12),
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
              hover: gi(t.white, 0.01),
              color: `var(--mantine-color-${e}-filled)`,
              border: `${z(1)} solid transparent`,
            }
          : {
              background: "var(--mantine-color-white)",
              hover: gi(t.white, 0.01),
              color: `var(--mantine-color-${s.color}-${s.shade})`,
              border: `${z(1)} solid transparent`,
            }
        : {
            background: "var(--mantine-color-white)",
            hover: gi(t.white, 0.01),
            color: e,
            border: `${z(1)} solid transparent`,
          }
      : n === "gradient"
      ? {
          background: hu(r, t),
          hover: hu(r, t),
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
  Nb = {
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
  lm =
    "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji",
  Hf = {
    scale: 1,
    fontSmoothing: !0,
    focusRing: "auto",
    white: "#fff",
    black: "#000",
    colors: Nb,
    primaryShade: { light: 6, dark: 8 },
    primaryColor: "blue",
    variantColorResolver: Tb,
    autoContrast: !1,
    luminanceThreshold: 0.3,
    fontFamily: lm,
    fontFamilyMonospace:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
    respectReducedMotion: !1,
    cursorType: "default",
    defaultGradient: { from: "blue", to: "cyan", deg: 45 },
    defaultRadius: "sm",
    activeClassName: "mantine-active",
    focusClassName: "",
    headings: {
      fontFamily: lm,
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
function am(e) {
  return e === "auto" || e === "dark" || e === "light";
}
function Ob({ key: e = "mantine-color-scheme-value" } = {}) {
  let t;
  return {
    get: (n) => {
      if (typeof window > "u") return n;
      try {
        const r = window.localStorage.getItem(e);
        return am(r) ? r : n;
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
          am(r.newValue) &&
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
const $b =
    "[@mantine/core] MantineProvider: Invalid theme.primaryColor, it accepts only key of theme.colors, learn more – https://mantine.dev/theming/colors/#primary-color",
  cm =
    "[@mantine/core] MantineProvider: Invalid theme.primaryShade, it accepts only 0-9 integers or an object { light: 0-9, dark: 0-9 }";
function lc(e) {
  return e < 0 || e > 9 ? !1 : parseInt(e.toString(), 10) === e;
}
function um(e) {
  if (!(e.primaryColor in e.colors)) throw new Error($b);
  if (
    typeof e.primaryShade == "object" &&
    (!lc(e.primaryShade.dark) || !lc(e.primaryShade.light))
  )
    throw new Error(cm);
  if (typeof e.primaryShade == "number" && !lc(e.primaryShade))
    throw new Error(cm);
}
function jb(e, t) {
  var r;
  if (!t) return um(e), e;
  const n = Lf(e, t);
  return (
    t.fontFamily &&
      !((r = t.headings) != null && r.fontFamily) &&
      (n.headings.fontFamily = t.fontFamily),
    um(n),
    n
  );
}
const Vf = w.createContext(null),
  Lb = () => w.useContext(Vf) || Hf;
function fn() {
  const e = w.useContext(Vf);
  if (!e)
    throw new Error(
      "@mantine/core: MantineProvider was not found in component tree, make sure you have it in your app"
    );
  return e;
}
function sv({ theme: e, children: t, inherit: n = !0 }) {
  const r = Lb(),
    o = w.useMemo(() => jb(n ? r : Hf, e), [e, r, n]);
  return S.jsx(Vf.Provider, { value: o, children: t });
}
sv.displayName = "@mantine/core/MantineThemeProvider";
function Ab() {
  const e = fn(),
    t = If(),
    n = cn(e.breakpoints).reduce((r, o) => {
      const s = e.breakpoints[o].includes("px"),
        i = Kx(e.breakpoints[o]),
        l = s ? `${i - 0.1}px` : om(i - 0.1),
        a = s ? `${i}px` : om(i);
      return `${r}@media (max-width: ${l}) {.mantine-visible-from-${o} {display: none !important;}}@media (min-width: ${a}) {.mantine-hidden-from-${o} {display: none !important;}}`;
    }, "");
  return S.jsx("style", {
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
function Fb(e, t) {
  const n = ac(e.variables),
    r = n ? cc(t, n) : "",
    o = ac(e.dark),
    s = o ? cc(`${t}[data-mantine-color-scheme="dark"]`, o) : "",
    i = ac(e.light),
    l = i ? cc(`${t}[data-mantine-color-scheme="light"]`, i) : "";
  return `${r}${s}${l}`;
}
function Mb({ color: e, theme: t, autoContrast: n }) {
  return (typeof n == "boolean" ? n : t.autoContrast) &&
    Hs({ color: e || t.primaryColor, theme: t }).isLight
    ? "var(--mantine-color-black)"
    : "var(--mantine-color-white)";
}
function fm(e, t) {
  return Mb({
    color: e.colors[e.primaryColor][Ds(e, t)],
    theme: e,
    autoContrast: null,
  });
}
function yi({
  theme: e,
  color: t,
  colorScheme: n,
  name: r = t,
  withColorValues: o = !0,
}) {
  if (!e.colors[t]) return {};
  if (n === "light") {
    const l = Ds(e, "light"),
      a = {
        [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-filled)`,
        [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
          l === 9 ? 8 : l + 1
        })`,
        [`--mantine-color-${r}-light`]: Ir(e.colors[t][l], 0.1),
        [`--mantine-color-${r}-light-hover`]: Ir(e.colors[t][l], 0.12),
        [`--mantine-color-${r}-light-color`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline`]: `var(--mantine-color-${r}-${l})`,
        [`--mantine-color-${r}-outline-hover`]: Ir(e.colors[t][l], 0.05),
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
  const s = Ds(e, "dark"),
    i = {
      [`--mantine-color-${r}-text`]: `var(--mantine-color-${r}-4)`,
      [`--mantine-color-${r}-filled`]: `var(--mantine-color-${r}-${s})`,
      [`--mantine-color-${r}-filled-hover`]: `var(--mantine-color-${r}-${
        s === 9 ? 8 : s + 1
      })`,
      [`--mantine-color-${r}-light`]: Ir(e.colors[t][Math.max(0, s - 2)], 0.15),
      [`--mantine-color-${r}-light-hover`]: Ir(
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
      [`--mantine-color-${r}-outline-hover`]: Ir(
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
function zb(e) {
  return !!e && typeof e == "object" && "mantine-virtual-color" in e;
}
function Br(e, t, n) {
  cn(t).forEach((r) => Object.assign(e, { [`--mantine-${n}-${r}`]: t[r] }));
}
const iv = (e) => {
  const t = Ds(e, "light"),
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
        "--mantine-primary-color-contrast": fm(e, "light"),
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
        "--mantine-primary-color-contrast": fm(e, "dark"),
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
  Br(r.variables, e.breakpoints, "breakpoint"),
    Br(r.variables, e.spacing, "spacing"),
    Br(r.variables, e.fontSizes, "font-size"),
    Br(r.variables, e.lineHeights, "line-height"),
    Br(r.variables, e.shadows, "shadow"),
    Br(r.variables, e.radius, "radius"),
    e.colors[e.primaryColor].forEach((s, i) => {
      r.variables[
        `--mantine-primary-color-${i}`
      ] = `var(--mantine-color-${e.primaryColor}-${i})`;
    }),
    cn(e.colors).forEach((s) => {
      const i = e.colors[s];
      if (zb(i)) {
        Object.assign(
          r.light,
          yi({
            theme: e,
            name: i.name,
            color: i.light,
            colorScheme: "light",
            withColorValues: !0,
          })
        ),
          Object.assign(
            r.dark,
            yi({
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
          yi({ theme: e, color: s, colorScheme: "light", withColorValues: !1 })
        ),
        Object.assign(
          r.dark,
          yi({ theme: e, color: s, colorScheme: "dark", withColorValues: !1 })
        );
    });
  const o = e.headings.sizes;
  return (
    cn(o).forEach((s) => {
      (r.variables[`--mantine-${s}-font-size`] = o[s].fontSize),
        (r.variables[`--mantine-${s}-line-height`] = o[s].lineHeight),
        (r.variables[`--mantine-${s}-font-weight`] =
          o[s].fontWeight || e.headings.fontWeight);
    }),
    r
  );
};
function Ib({ theme: e, generator: t }) {
  const n = iv(e),
    r = t == null ? void 0 : t(e);
  return r ? Lf(n, r) : n;
}
const uc = iv(Hf);
function Bb(e) {
  const t = { variables: {}, light: {}, dark: {} };
  return (
    cn(e.variables).forEach((n) => {
      uc.variables[n] !== e.variables[n] && (t.variables[n] = e.variables[n]);
    }),
    cn(e.light).forEach((n) => {
      uc.light[n] !== e.light[n] && (t.light[n] = e.light[n]);
    }),
    cn(e.dark).forEach((n) => {
      uc.dark[n] !== e.dark[n] && (t.dark[n] = e.dark[n]);
    }),
    t
  );
}
function Hb(e) {
  return `
  ${e}[data-mantine-color-scheme="dark"] { --mantine-color-scheme: dark; }
  ${e}[data-mantine-color-scheme="light"] { --mantine-color-scheme: light; }
`;
}
function lv({ cssVariablesSelector: e, deduplicateCssVariables: t }) {
  const n = fn(),
    r = If(),
    o = vb(),
    s = Ib({ theme: n, generator: o }),
    i = e === ":root" && t,
    l = i ? Bb(s) : s,
    a = Fb(l, e);
  return a
    ? S.jsx("style", {
        "data-mantine-styles": !0,
        nonce: r == null ? void 0 : r(),
        dangerouslySetInnerHTML: { __html: `${a}${i ? "" : Hb(e)}` },
      })
    : null;
}
lv.displayName = "@mantine/CssVariables";
function Vb() {
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
function Hr(e, t) {
  var r;
  const n =
    e !== "auto"
      ? e
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  (r = t()) == null || r.setAttribute("data-mantine-color-scheme", n);
}
function Ub({
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
        r || (Hr(u, n), i(u), e.set(u));
      },
      [e.set, l, r]
    ),
    c = w.useCallback(() => {
      i(t), Hr(t, n), e.clear();
    }, [e.clear, t]);
  return (
    w.useEffect(
      () => (e.subscribe(a), e.unsubscribe),
      [e.subscribe, e.unsubscribe]
    ),
    Is(() => {
      Hr(e.get(t), n);
    }, []),
    w.useEffect(() => {
      var f;
      if (r) return Hr(r, n), () => {};
      r === void 0 && Hr(s, n),
        (o.current = window.matchMedia("(prefers-color-scheme: dark)"));
      const u = (d) => {
        s === "auto" && Hr(d.matches ? "dark" : "light", n);
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
function Wb({ respectReducedMotion: e, getRootElement: t }) {
  Is(() => {
    var n;
    e &&
      ((n = t()) == null ||
        n.setAttribute("data-respect-reduced-motion", "true"));
  }, [e]);
}
Vb();
function av({
  theme: e,
  children: t,
  getStyleNonce: n,
  withStaticClasses: r = !0,
  withGlobalClasses: o = !0,
  deduplicateCssVariables: s = !0,
  withCssVariables: i = !0,
  cssVariablesSelector: l = ":root",
  classNamesPrefix: a = "mantine",
  colorSchemeManager: c = Ob(),
  defaultColorScheme: u = "light",
  getRootElement: f = () => document.documentElement,
  cssVariablesResolver: d,
  forceColorScheme: m,
  stylesTransform: p,
}) {
  const {
    colorScheme: h,
    setColorScheme: x,
    clearColorScheme: v,
  } = Ub({
    defaultColorScheme: u,
    forceColorScheme: m,
    manager: c,
    getRootElement: f,
  });
  return (
    Wb({
      respectReducedMotion: (e == null ? void 0 : e.respectReducedMotion) || !1,
      getRootElement: f,
    }),
    S.jsx(ov.Provider, {
      value: {
        colorScheme: h,
        setColorScheme: x,
        clearColorScheme: v,
        getRootElement: f,
        classNamesPrefix: a,
        getStyleNonce: n,
        cssVariablesResolver: d,
        cssVariablesSelector: l,
        withStaticClasses: r,
        stylesTransform: p,
      },
      children: S.jsxs(sv, {
        theme: e,
        children: [
          i &&
            S.jsx(lv, { cssVariablesSelector: l, deduplicateCssVariables: s }),
          o && S.jsx(Ab, {}),
          t,
        ],
      }),
    })
  );
}
av.displayName = "@mantine/core/MantineProvider";
function Vs({ classNames: e, styles: t, props: n, stylesCtx: r }) {
  const o = fn();
  return {
    resolvedClassNames: Kl({
      theme: o,
      classNames: e,
      props: n,
      stylesCtx: r || void 0,
    }),
    resolvedStyles: dl({
      theme: o,
      styles: t,
      props: n,
      stylesCtx: r || void 0,
    }),
  };
}
const Yb = {
  always: "mantine-focus-always",
  auto: "mantine-focus-auto",
  never: "mantine-focus-never",
};
function Kb({ theme: e, options: t, unstyled: n }) {
  return nt(
    (t == null ? void 0 : t.focusable) &&
      !n &&
      (e.focusClassName || Yb[e.focusRing]),
    (t == null ? void 0 : t.active) && !n && e.activeClassName
  );
}
function qb({ selector: e, stylesCtx: t, options: n, props: r, theme: o }) {
  return Kl({
    theme: o,
    classNames: n == null ? void 0 : n.classNames,
    props: (n == null ? void 0 : n.props) || r,
    stylesCtx: t,
  })[e];
}
function dm({ selector: e, stylesCtx: t, theme: n, classNames: r, props: o }) {
  return Kl({ theme: n, classNames: r, props: o, stylesCtx: t })[e];
}
function Gb({ rootSelector: e, selector: t, className: n }) {
  return e === t ? n : void 0;
}
function Xb({ selector: e, classes: t, unstyled: n }) {
  return n ? void 0 : t[e];
}
function Qb({
  themeName: e,
  classNamesPrefix: t,
  selector: n,
  withStaticClass: r,
}) {
  return r === !1 ? [] : e.map((o) => `${t}-${o}-${n}`);
}
function Jb({ themeName: e, theme: t, selector: n, props: r, stylesCtx: o }) {
  return e.map((s) => {
    var i, l;
    return (l = Kl({
      theme: t,
      classNames: (i = t.components[s]) == null ? void 0 : i.classNames,
      props: r,
      stylesCtx: o,
    })) == null
      ? void 0
      : l[n];
  });
}
function Zb({ options: e, classes: t, selector: n, unstyled: r }) {
  return e != null && e.variant && !r ? t[`${n}--${e.variant}`] : void 0;
}
function eC({
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
    Kb({ theme: e, options: t, unstyled: l || m }),
    Jb({ theme: e, themeName: n, selector: r, props: u, stylesCtx: f }),
    Zb({ options: t, classes: i, selector: r, unstyled: l }),
    dm({ selector: r, stylesCtx: f, theme: e, classNames: s, props: u }),
    dm({ selector: r, stylesCtx: f, theme: e, classNames: p, props: u }),
    qb({ selector: r, stylesCtx: f, options: t, props: u, theme: e }),
    Gb({ rootSelector: c, selector: r, className: a }),
    Xb({ selector: r, classes: i, unstyled: l || m }),
    d &&
      !m &&
      Qb({
        themeName: n,
        classNamesPrefix: o,
        selector: r,
        withStaticClass: t == null ? void 0 : t.withStaticClass,
      }),
    t == null ? void 0 : t.className
  );
}
function tC({ theme: e, themeName: t, props: n, stylesCtx: r, selector: o }) {
  return t
    .map((s) => {
      var i;
      return dl({
        theme: e,
        styles: (i = e.components[s]) == null ? void 0 : i.styles,
        props: n,
        stylesCtx: r,
      })[o];
    })
    .reduce((s, i) => ({ ...s, ...i }), {});
}
function gu({ style: e, theme: t }) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...gu({ style: r, theme: t }) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function nC(e) {
  return e.reduce(
    (t, n) => (
      n &&
        Object.keys(n).forEach((r) => {
          t[r] = { ...t[r], ...Af(n[r]) };
        }),
      t
    ),
    {}
  );
}
function rC({
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
  return (a = nC([
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
function oC({
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
      tC({ theme: e, themeName: t, props: o, stylesCtx: s, selector: n })),
    ...(!d && dl({ theme: e, styles: l, props: o, stylesCtx: s })[n]),
    ...(!d &&
      dl({
        theme: e,
        styles: r == null ? void 0 : r.styles,
        props: (r == null ? void 0 : r.props) || o,
        stylesCtx: s,
      })[n]),
    ...rC({
      theme: e,
      props: o,
      stylesCtx: s,
      vars: c,
      varsResolver: u,
      selector: n,
      themeName: t,
      headless: f,
    }),
    ...(i === n ? gu({ style: a, theme: e }) : null),
    ...gu({ style: r == null ? void 0 : r.style, theme: e }),
  };
}
function sC({ props: e, stylesCtx: t, themeName: n }) {
  var i;
  const r = fn(),
    o = (i = Cb()) == null ? void 0 : i();
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
  const d = fn(),
    m = wb(),
    p = Sb(),
    h = xb(),
    x = (Array.isArray(e) ? e : [e]).filter((y) => y),
    { withStylesTransform: v, getTransformedStyles: g } = sC({
      props: n,
      stylesCtx: r,
      themeName: x,
    });
  return (y, b) => ({
    className: eC({
      theme: d,
      options: b,
      themeName: x,
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
    style: oC({
      theme: d,
      themeName: x,
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
  const r = fn(),
    o = (i = r.components[e]) == null ? void 0 : i.defaultProps,
    s = typeof o == "function" ? o(r) : o;
  return { ...t, ...s, ...Af(n) };
}
function pm(e) {
  return cn(e)
    .reduce((t, n) => (e[n] !== void 0 ? `${t}${Wx(n)}:${e[n]};` : t), "")
    .trim();
}
function iC({ selector: e, styles: t, media: n }) {
  const r = t ? pm(t) : "",
    o = Array.isArray(n)
      ? n.map((s) => `@media${s.query}{${e}{${pm(s.styles)}}}`)
      : [];
  return `${r ? `${e}{${r}}` : ""}${o.join("")}`.trim();
}
function lC({ selector: e, styles: t, media: n }) {
  const r = If();
  return S.jsx("style", {
    "data-mantine-styles": "inline",
    nonce: r == null ? void 0 : r(),
    dangerouslySetInnerHTML: {
      __html: iC({ selector: e, styles: t, media: n }),
    },
  });
}
function Uf(e) {
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
    pr: x,
    pe: v,
    ps: g,
    bg: y,
    c: b,
    opacity: C,
    ff: E,
    fz: R,
    fw: D,
    lts: L,
    ta: T,
    lh: M,
    fs: B,
    tt: V,
    td: F,
    w: j,
    miw: P,
    maw: N,
    h: _,
    mih: k,
    mah: $,
    bgsz: O,
    bgp: I,
    bgr: Y,
    bga: X,
    pos: ee,
    top: ne,
    left: te,
    bottom: me,
    right: oe,
    inset: le,
    display: J,
    flex: ye,
    hiddenFrom: ce,
    visibleFrom: se,
    lightHidden: Ne,
    darkHidden: Xe,
    sx: xe,
    ...gt
  } = e;
  return {
    styleProps: Af({
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
      pr: x,
      pe: v,
      ps: g,
      bg: y,
      c: b,
      opacity: C,
      ff: E,
      fz: R,
      fw: D,
      lts: L,
      ta: T,
      lh: M,
      fs: B,
      tt: V,
      td: F,
      w: j,
      miw: P,
      maw: N,
      h: _,
      mih: k,
      mah: $,
      bgsz: O,
      bgp: I,
      bgr: Y,
      bga: X,
      pos: ee,
      top: ne,
      left: te,
      bottom: me,
      right: oe,
      inset: le,
      display: J,
      flex: ye,
      hiddenFrom: ce,
      visibleFrom: se,
      lightHidden: Ne,
      darkHidden: Xe,
      sx: xe,
    }),
    rest: gt,
  };
}
const aC = {
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
function cv(e, t) {
  const n = Hs({ color: e, theme: t });
  return n.color === "dimmed"
    ? "var(--mantine-color-dimmed)"
    : n.color === "bright"
    ? "var(--mantine-color-bright)"
    : n.variable
    ? `var(${n.variable})`
    : n.color;
}
function cC(e, t) {
  const n = Hs({ color: e, theme: t });
  return n.isThemeColor && n.shade === void 0
    ? `var(--mantine-color-${n.color}-text)`
    : cv(e, t);
}
const mm = {
  text: "var(--mantine-font-family)",
  mono: "var(--mantine-font-family-monospace)",
  monospace: "var(--mantine-font-family-monospace)",
  heading: "var(--mantine-font-family-headings)",
  headings: "var(--mantine-font-family-headings)",
};
function uC(e) {
  return typeof e == "string" && e in mm ? mm[e] : e;
}
const fC = ["h1", "h2", "h3", "h4", "h5", "h6"];
function dC(e, t) {
  return typeof e == "string" && e in t.fontSizes
    ? `var(--mantine-font-size-${e})`
    : typeof e == "string" && fC.includes(e)
    ? `var(--mantine-${e}-font-size)`
    : typeof e == "number" || typeof e == "string"
    ? z(e)
    : e;
}
function pC(e) {
  return e;
}
const mC = ["h1", "h2", "h3", "h4", "h5", "h6"];
function hC(e, t) {
  return typeof e == "string" && e in t.lineHeights
    ? `var(--mantine-line-height-${e})`
    : typeof e == "string" && mC.includes(e)
    ? `var(--mantine-${e}-line-height)`
    : e;
}
function gC(e) {
  return typeof e == "number" ? z(e) : e;
}
function yC(e, t) {
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
  color: cv,
  textColor: cC,
  fontSize: dC,
  spacing: yC,
  identity: pC,
  size: gC,
  lineHeight: hC,
  fontFamily: uC,
};
function hm(e) {
  return e.replace("(min-width: ", "").replace("em)", "");
}
function vC({ media: e, ...t }) {
  const r = Object.keys(e)
    .sort((o, s) => Number(hm(o)) - Number(hm(s)))
    .map((o) => ({ query: o, styles: e[o] }));
  return { ...t, media: r };
}
function wC(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.keys(e);
  return !(t.length === 1 && t[0] === "base");
}
function SC(e) {
  return typeof e == "object" && e !== null
    ? "base" in e
      ? e.base
      : void 0
    : e;
}
function xC(e) {
  return typeof e == "object" && e !== null
    ? cn(e).filter((t) => t !== "base")
    : [];
}
function bC(e, t) {
  return typeof e == "object" && e !== null && t in e ? e[t] : e;
}
function CC({ styleProps: e, data: t, theme: n }) {
  return vC(
    cn(e).reduce(
      (r, o) => {
        if (o === "hiddenFrom" || o === "visibleFrom" || o === "sx") return r;
        const s = t[o],
          i = Array.isArray(s.property) ? s.property : [s.property],
          l = SC(e[o]);
        if (!wC(e[o]))
          return (
            i.forEach((c) => {
              r.inlineStyles[c] = fc[s.type](l, n);
            }),
            r
          );
        r.hasResponsiveStyles = !0;
        const a = xC(e[o]);
        return (
          i.forEach((c) => {
            l && (r.styles[c] = fc[s.type](l, n)),
              a.forEach((u) => {
                const f = `(min-width: ${n.breakpoints[u]})`;
                r.media[f] = { ...r.media[f], [c]: fc[s.type](bC(e[o], u), n) };
              });
          }),
          r
        );
      },
      { hasResponsiveStyles: !1, styles: {}, inlineStyles: {}, media: {} }
    )
  );
}
function EC() {
  return `__m__-${w.useId().replace(/:/g, "")}`;
}
function uv(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...uv(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function fv(e) {
  return e.startsWith("data-") ? e : `data-${e}`;
}
function kC(e) {
  return Object.keys(e).reduce((t, n) => {
    const r = e[n];
    return (
      r === void 0 || r === "" || r === !1 || r === null || (t[fv(n)] = e[n]), t
    );
  }, {});
}
function dv(e) {
  return e
    ? typeof e == "string"
      ? { [fv(e)]: !0 }
      : Array.isArray(e)
      ? [...e].reduce((t, n) => ({ ...t, ...dv(n) }), {})
      : kC(e)
    : null;
}
function yu(e, t) {
  return Array.isArray(e)
    ? [...e].reduce((n, r) => ({ ...n, ...yu(r, t) }), {})
    : typeof e == "function"
    ? e(t)
    : e ?? {};
}
function _C({ theme: e, style: t, vars: n, styleProps: r }) {
  const o = yu(t, e),
    s = yu(n, e);
  return { ...o, ...s, ...r };
}
const pv = w.forwardRef(
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
    const p = fn(),
      h = e || "div",
      { styleProps: x, rest: v } = Uf(d),
      g = bb(),
      y = (R = g == null ? void 0 : g()) == null ? void 0 : R(x.sx),
      b = EC(),
      C = CC({ styleProps: x, theme: p, data: aC }),
      E = {
        ref: m,
        style: _C({ theme: p, style: t, vars: n, styleProps: C.inlineStyles }),
        className: nt(r, y, {
          [b]: C.hasResponsiveStyles,
          "mantine-light-hidden": c,
          "mantine-dark-hidden": u,
          [`mantine-hidden-from-${l}`]: l,
          [`mantine-visible-from-${a}`]: a,
        }),
        "data-variant": o,
        "data-size": Xy(i) ? void 0 : i || void 0,
        ...dv(s),
        ...v,
      };
    return S.jsxs(S.Fragment, {
      children: [
        C.hasResponsiveStyles &&
          S.jsx(lC, { selector: `.${b}`, styles: C.styles, media: C.media }),
        typeof f == "function" ? f(E) : S.jsx(h, { ...E }),
      ],
    });
  }
);
pv.displayName = "@mantine/core/Box";
const Z = pv;
function mv(e) {
  return e;
}
function Q(e) {
  const t = w.forwardRef(e);
  return (t.extend = mv), t;
}
function _n(e) {
  const t = w.forwardRef(e);
  return (t.extend = mv), t;
}
const RC = w.createContext({
  dir: "ltr",
  toggleDirection: () => {},
  setDirection: () => {},
});
function Wf() {
  return w.useContext(RC);
}
function DC(e) {
  if (!e || typeof e == "string") return 0;
  const t = e / 36;
  return Math.round((4 + 15 * t ** 0.25 + t / 5) * 10);
}
function dc(e) {
  return e != null && e.current ? e.current.scrollHeight : "auto";
}
const qo = typeof window < "u" && window.requestAnimationFrame;
function PC({
  transitionDuration: e,
  transitionTimingFunction: t = "ease",
  onTransitionEnd: n = () => {},
  opened: r,
}) {
  const o = w.useRef(null),
    s = 0,
    i = { display: "none", height: 0, overflow: "hidden" },
    [l, a] = w.useState(r ? {} : i),
    c = (p) => {
      zs.flushSync(() => a(p));
    },
    u = (p) => {
      c((h) => ({ ...h, ...p }));
    };
  function f(p) {
    const h = e || DC(p);
    return { transition: `height ${h}ms ${t}, opacity ${h}ms ${t}` };
  }
  Rr(() => {
    typeof qo == "function" &&
      qo(
        r
          ? () => {
              u({ willChange: "height", display: "block", overflow: "hidden" }),
                qo(() => {
                  const p = dc(o);
                  u({ ...f(p), height: p });
                });
            }
          : () => {
              const p = dc(o);
              u({ ...f(p), willChange: "height", height: p }),
                qo(() => u({ height: s, overflow: "hidden" }));
            }
      );
  }, [r]);
  const d = (p) => {
    if (!(p.target !== o.current || p.propertyName !== "height"))
      if (r) {
        const h = dc(o);
        h === l.height ? c({}) : u({ height: h }), n();
      } else l.height === s && (c(i), n());
  };
  function m({ style: p = {}, refKey: h = "ref", ...x } = {}) {
    const v = x[h];
    return {
      "aria-hidden": !r,
      ...x,
      [h]: nv(o, v),
      onTransitionEnd: d,
      style: { boxSizing: "border-box", ...p, ...l },
    };
  }
  return m;
}
const TC = {
    transitionDuration: 200,
    transitionTimingFunction: "ease",
    animateOpacity: !0,
  },
  hv = Q((e, t) => {
    const {
        children: n,
        in: r,
        transitionDuration: o,
        transitionTimingFunction: s,
        style: i,
        onTransitionEnd: l,
        animateOpacity: a,
        ...c
      } = W("Collapse", TC, e),
      u = fn(),
      f = zf(),
      m = (u.respectReducedMotion ? f : !1) ? 0 : o,
      p = PC({
        opened: r,
        transitionDuration: m,
        transitionTimingFunction: s,
        onTransitionEnd: l,
      });
    return m === 0
      ? r
        ? S.jsx(Z, { ...c, children: n })
        : null
      : S.jsx(Z, {
          ...p({
            style: {
              opacity: r || !a ? 1 : 0,
              transition: a ? `opacity ${m}ms ${s}` : "none",
              ...uv(i, u),
            },
            ref: t,
            ...c,
          }),
          children: n,
        });
  });
hv.displayName = "@mantine/core/Collapse";
const [NC, $t] = $r("ScrollArea.Root component was not found in tree");
function xo(e, t) {
  const n = dr(t);
  Is(() => {
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
const OC = w.forwardRef((e, t) => {
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
        ? S.jsx("div", { ...r, ref: t, style: { ...n, width: s, height: l } })
        : null
    );
  }),
  $C = w.forwardRef((e, t) => {
    const n = $t(),
      r = !!(n.scrollbarX && n.scrollbarY);
    return n.type !== "scroll" && r ? S.jsx(OC, { ...e, ref: t }) : null;
  }),
  jC = { scrollHideDelay: 1e3, type: "hover" },
  gv = w.forwardRef((e, t) => {
    const n = W("ScrollAreaRoot", jC, e),
      { type: r, scrollHideDelay: o, scrollbars: s, ...i } = n,
      [l, a] = w.useState(null),
      [c, u] = w.useState(null),
      [f, d] = w.useState(null),
      [m, p] = w.useState(null),
      [h, x] = w.useState(null),
      [v, g] = w.useState(0),
      [y, b] = w.useState(0),
      [C, E] = w.useState(!1),
      [R, D] = w.useState(!1),
      L = Ot(t, (T) => a(T));
    return S.jsx(NC, {
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
        onScrollbarYChange: x,
        scrollbarYEnabled: R,
        onScrollbarYEnabledChange: D,
        onCornerWidthChange: g,
        onCornerHeightChange: b,
      },
      children: S.jsx(Z, {
        ...i,
        ref: L,
        __vars: {
          "--sa-corner-width": s !== "xy" ? "0px" : `${v}px`,
          "--sa-corner-height": s !== "xy" ? "0px" : `${y}px`,
        },
      }),
    });
  });
gv.displayName = "@mantine/core/ScrollAreaRoot";
function yv(e, t) {
  const n = e / t;
  return Number.isNaN(n) ? 0 : n;
}
function ql(e) {
  const t = yv(e.viewport, e.content),
    n = e.scrollbar.paddingStart + e.scrollbar.paddingEnd,
    r = (e.scrollbar.size - n) * t;
  return Math.max(r, 18);
}
function vv(e, t) {
  return (n) => {
    if (e[0] === e[1] || t[0] === t[1]) return t[0];
    const r = (t[1] - t[0]) / (e[1] - e[0]);
    return t[0] + r * (n - e[0]);
  };
}
function LC(e, [t, n]) {
  return Math.min(n, Math.max(t, e));
}
function gm(e, t, n = "ltr") {
  const r = ql(t),
    o = t.scrollbar.paddingStart + t.scrollbar.paddingEnd,
    s = t.scrollbar.size - o,
    i = t.content - t.viewport,
    l = s - r,
    a = n === "ltr" ? [0, i] : [i * -1, 0],
    c = LC(e, a);
  return vv([0, i], [0, l])(c);
}
function AC(e, t, n, r = "ltr") {
  const o = ql(n),
    s = o / 2,
    i = t || s,
    l = o - i,
    a = n.scrollbar.paddingStart + i,
    c = n.scrollbar.size - n.scrollbar.paddingEnd - l,
    u = n.content - n.viewport,
    f = r === "ltr" ? [0, u] : [u * -1, 0];
  return vv([a, c], f)(e);
}
function wv(e, t) {
  return e > 0 && e < t;
}
function ml(e) {
  return e ? parseInt(e, 10) : 0;
}
function Sr(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
  return (r) => {
    e == null || e(r), (n === !1 || !r.defaultPrevented) && (t == null || t(r));
  };
}
const [FC, Sv] = $r("ScrollAreaScrollbar was not found in tree"),
  xv = w.forwardRef((e, t) => {
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
      h = Ot(t, (D) => p(D)),
      x = w.useRef(null),
      v = w.useRef(""),
      { viewport: g } = d,
      y = n.content - n.viewport,
      b = dr(c),
      C = dr(l),
      E = Yl(u, 10),
      R = (D) => {
        if (x.current) {
          const L = D.clientX - x.current.left,
            T = D.clientY - x.current.top;
          a({ x: L, y: T });
        }
      };
    return (
      w.useEffect(() => {
        const D = (L) => {
          const T = L.target;
          (m == null ? void 0 : m.contains(T)) && b(L, y);
        };
        return (
          document.addEventListener("wheel", D, { passive: !1 }),
          () => document.removeEventListener("wheel", D, { passive: !1 })
        );
      }, [g, m, y, b]),
      w.useEffect(C, [n, C]),
      xo(m, E),
      xo(d.content, E),
      S.jsx(FC, {
        value: {
          scrollbar: m,
          hasThumb: r,
          onThumbChange: dr(o),
          onThumbPointerUp: dr(s),
          onThumbPositionChange: C,
          onThumbPointerDown: dr(i),
        },
        children: S.jsx("div", {
          ...f,
          ref: h,
          style: { position: "absolute", ...f.style },
          onPointerDown: Sr(e.onPointerDown, (D) => {
            D.button === 0 &&
              (D.target.setPointerCapture(D.pointerId),
              (x.current = m.getBoundingClientRect()),
              (v.current = document.body.style.webkitUserSelect),
              (document.body.style.webkitUserSelect = "none"),
              R(D));
          }),
          onPointerMove: Sr(e.onPointerMove, R),
          onPointerUp: Sr(e.onPointerUp, (D) => {
            const L = D.target;
            L.hasPointerCapture(D.pointerId) &&
              L.releasePointerCapture(D.pointerId),
              (document.body.style.webkitUserSelect = v.current),
              (x.current = null);
          }),
        }),
      })
    );
  }),
  MC = w.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = $t(),
      [l, a] = w.useState(),
      c = w.useRef(null),
      u = Ot(t, c, i.onScrollbarXChange);
    return (
      w.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      S.jsx(xv, {
        "data-orientation": "horizontal",
        ...s,
        ref: u,
        sizes: n,
        style: { ...o, "--sa-thumb-width": `${ql(n)}px` },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.x),
        onDragScroll: (f) => e.onDragScroll(f.x),
        onWheelScroll: (f, d) => {
          if (i.viewport) {
            const m = i.viewport.scrollLeft + f.deltaX;
            e.onWheelScroll(m), wv(m, d) && f.preventDefault();
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
                paddingStart: ml(l.paddingLeft),
                paddingEnd: ml(l.paddingRight),
              },
            });
        },
      })
    );
  }),
  zC = w.forwardRef((e, t) => {
    const { sizes: n, onSizesChange: r, style: o, ...s } = e,
      i = $t(),
      [l, a] = w.useState(),
      c = w.useRef(null),
      u = Ot(t, c, i.onScrollbarYChange);
    return (
      w.useEffect(() => {
        c.current && a(getComputedStyle(c.current));
      }, [c]),
      S.jsx(xv, {
        ...s,
        "data-orientation": "vertical",
        ref: u,
        sizes: n,
        style: { "--sa-thumb-height": `${ql(n)}px`, ...o },
        onThumbPointerDown: (f) => e.onThumbPointerDown(f.y),
        onDragScroll: (f) => e.onDragScroll(f.y),
        onWheelScroll: (f, d) => {
          if (i.viewport) {
            const m = i.viewport.scrollTop + f.deltaY;
            e.onWheelScroll(m), wv(m, d) && f.preventDefault();
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
                paddingStart: ml(l.paddingTop),
                paddingEnd: ml(l.paddingBottom),
              },
            });
        },
      })
    );
  }),
  Yf = w.forwardRef((e, t) => {
    const { orientation: n = "vertical", ...r } = e,
      { dir: o } = Wf(),
      s = $t(),
      i = w.useRef(null),
      l = w.useRef(0),
      [a, c] = w.useState({
        content: 0,
        viewport: 0,
        scrollbar: { size: 0, paddingStart: 0, paddingEnd: 0 },
      }),
      u = yv(a.viewport, a.content),
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
      d = (m, p) => AC(m, l.current, a, p);
    return n === "horizontal"
      ? S.jsx(MC, {
          ...f,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollLeft,
                p = gm(m, a, o);
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
      ? S.jsx(zC, {
          ...f,
          ref: t,
          onThumbPositionChange: () => {
            if (s.viewport && i.current) {
              const m = s.viewport.scrollTop,
                p = gm(m, a);
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
  bv = w.forwardRef((e, t) => {
    const n = $t(),
      { forceMount: r, ...o } = e,
      [s, i] = w.useState(!1),
      l = e.orientation === "horizontal",
      a = Yl(() => {
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
        ? S.jsx(Yf, { "data-state": s ? "visible" : "hidden", ...o, ref: t })
        : null
    );
  }),
  IC = w.forwardRef((e, t) => {
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
        ? S.jsx(bv, { "data-state": s ? "visible" : "hidden", ...r, ref: t })
        : null
    );
  }),
  BC = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = $t(),
      s = e.orientation === "horizontal",
      [i, l] = w.useState("hidden"),
      a = Yl(() => l("idle"), 100);
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
        ? S.jsx(Yf, {
            "data-state": i === "hidden" ? "hidden" : "visible",
            ...r,
            ref: t,
            onPointerEnter: Sr(e.onPointerEnter, () => l("interacting")),
            onPointerLeave: Sr(e.onPointerLeave, () => l("idle")),
          })
        : null
    );
  }),
  ym = w.forwardRef((e, t) => {
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
        ? S.jsx(IC, { ...r, ref: t, forceMount: n })
        : o.type === "scroll"
        ? S.jsx(BC, { ...r, ref: t, forceMount: n })
        : o.type === "auto"
        ? S.jsx(bv, { ...r, ref: t, forceMount: n })
        : o.type === "always"
        ? S.jsx(Yf, { ...r, ref: t })
        : null
    );
  });
function HC(e, t = () => {}) {
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
const VC = w.forwardRef((e, t) => {
    const { style: n, ...r } = e,
      o = $t(),
      s = Sv(),
      { onThumbPositionChange: i } = s,
      l = Ot(t, (u) => s.onThumbChange(u)),
      a = w.useRef(),
      c = Yl(() => {
        a.current && (a.current(), (a.current = void 0));
      }, 100);
    return (
      w.useEffect(() => {
        const { viewport: u } = o;
        if (u) {
          const f = () => {
            if ((c(), !a.current)) {
              const d = HC(u, i);
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
      S.jsx("div", {
        "data-state": s.hasThumb ? "visible" : "hidden",
        ...r,
        ref: l,
        style: {
          width: "var(--sa-thumb-width)",
          height: "var(--sa-thumb-height)",
          ...n,
        },
        onPointerDownCapture: Sr(e.onPointerDownCapture, (u) => {
          const d = u.target.getBoundingClientRect(),
            m = u.clientX - d.left,
            p = u.clientY - d.top;
          s.onThumbPointerDown({ x: m, y: p });
        }),
        onPointerUp: Sr(e.onPointerUp, s.onThumbPointerUp),
      })
    );
  }),
  vm = w.forwardRef((e, t) => {
    const { forceMount: n, ...r } = e,
      o = Sv();
    return n || o.hasThumb ? S.jsx(VC, { ref: t, ...r }) : null;
  }),
  Cv = w.forwardRef(({ children: e, style: t, ...n }, r) => {
    const o = $t(),
      s = Ot(r, o.onViewportChange);
    return S.jsx(Z, {
      ...n,
      ref: s,
      style: {
        overflowX: o.scrollbarXEnabled ? "scroll" : "hidden",
        overflowY: o.scrollbarYEnabled ? "scroll" : "hidden",
        ...t,
      },
      children: S.jsx("div", {
        style: { minWidth: "100%", display: "table" },
        ref: o.onContentChange,
        children: e,
      }),
    });
  });
Cv.displayName = "@mantine/core/ScrollAreaViewport";
var Kf = {
  root: "m_d57069b5",
  viewport: "m_c0783ff9",
  viewportInner: "m_f8f631dd",
  scrollbar: "m_c44ba933",
  thumb: "m_d8b5e363",
  corner: "m_21657268",
};
const Ev = { scrollHideDelay: 1e3, type: "hover", scrollbars: "xy" },
  UC = (e, { scrollbarSize: t }) => ({
    root: { "--scrollarea-scrollbar-size": z(t) },
  }),
  Us = Q((e, t) => {
    const n = W("ScrollArea", Ev, e),
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
        offsetScrollbars: x,
        scrollbars: v,
        ...g
      } = n,
      [y, b] = w.useState(!1),
      C = de({
        name: "ScrollArea",
        props: n,
        classes: Kf,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: UC,
      });
    return S.jsxs(gv, {
      type: u === "never" ? "always" : u,
      scrollHideDelay: f,
      ref: t,
      scrollbars: v,
      ...C("root"),
      ...g,
      children: [
        S.jsx(Cv, {
          ...d,
          ...C("viewport", { style: d == null ? void 0 : d.style }),
          ref: m,
          "data-offset-scrollbars": x === !0 ? "xy" : x || void 0,
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
          S.jsx(ym, {
            ...C("scrollbar"),
            orientation: "horizontal",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: S.jsx(vm, { ...C("thumb") }),
          }),
        (v === "xy" || v === "y") &&
          S.jsx(ym, {
            ...C("scrollbar"),
            orientation: "vertical",
            "data-hidden": u === "never" || void 0,
            forceMount: !0,
            onMouseEnter: () => b(!0),
            onMouseLeave: () => b(!1),
            children: S.jsx(vm, { ...C("thumb") }),
          }),
        S.jsx($C, {
          ...C("corner"),
          "data-hovered": y || void 0,
          "data-hidden": u === "never" || void 0,
        }),
      ],
    });
  });
Us.displayName = "@mantine/core/ScrollArea";
const qf = Q((e, t) => {
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
    style: x,
    vars: v,
    ...g
  } = W("ScrollAreaAutosize", Ev, e);
  return S.jsx(Z, {
    ...g,
    ref: t,
    style: [{ display: "flex", overflow: "auto" }, x],
    children: S.jsx(Z, {
      style: { display: "flex", flexDirection: "column", flex: 1 },
      children: S.jsx(Us, {
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
Us.classes = Kf;
qf.displayName = "@mantine/core/ScrollAreaAutosize";
qf.classes = Kf;
Us.Autosize = qf;
var kv = { root: "m_87cf2631" };
const WC = { __staticSelector: "UnstyledButton" },
  wn = _n((e, t) => {
    const n = W("UnstyledButton", WC, e),
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
        classes: kv,
        className: r,
        style: c,
        classNames: l,
        styles: a,
        unstyled: i,
      });
    return S.jsx(Z, {
      ...f("root", { focusable: !0 }),
      component: o,
      ref: t,
      type: o === "button" ? "button" : void 0,
      ...u,
    });
  });
wn.classes = kv;
wn.displayName = "@mantine/core/UnstyledButton";
var _v = { root: "m_515a97f8" };
const YC = {},
  Gf = Q((e, t) => {
    const n = W("VisuallyHidden", YC, e),
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
        classes: _v,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
      });
    return S.jsx(Z, { component: "span", ref: t, ...u("root"), ...c });
  });
Gf.classes = _v;
Gf.displayName = "@mantine/core/VisuallyHidden";
var Rv = { root: "m_1b7284a3" };
const KC = {},
  qC = (e, { radius: t, shadow: n }) => ({
    root: {
      "--paper-radius": t === void 0 ? void 0 : or(t),
      "--paper-shadow": Ff(n),
    },
  }),
  Xf = _n((e, t) => {
    const n = W("Paper", KC, e),
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
        classes: Rv,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: qC,
      });
    return S.jsx(Z, {
      ref: t,
      mod: [{ "data-with-border": a }, m],
      ...h("root"),
      variant: d,
      ...p,
    });
  });
Xf.classes = Rv;
Xf.displayName = "@mantine/core/Paper";
function To(e) {
  return Dv(e) ? (e.nodeName || "").toLowerCase() : "#document";
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
  return (t = (Dv(e) ? e.ownerDocument : e.document) || window.document) == null
    ? void 0
    : t.documentElement;
}
function Dv(e) {
  return e instanceof Node || e instanceof St(e).Node;
}
function at(e) {
  return e instanceof Element || e instanceof St(e).Element;
}
function un(e) {
  return e instanceof HTMLElement || e instanceof St(e).HTMLElement;
}
function wm(e) {
  return typeof ShadowRoot > "u"
    ? !1
    : e instanceof ShadowRoot || e instanceof St(e).ShadowRoot;
}
function Ws(e) {
  const { overflow: t, overflowX: n, overflowY: r, display: o } = Yt(e);
  return (
    /auto|scroll|overlay|hidden|clip/.test(t + r + n) &&
    !["inline", "contents"].includes(o)
  );
}
function GC(e) {
  return ["table", "td", "th"].includes(To(e));
}
function Qf(e) {
  const t = Jf(),
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
function XC(e) {
  let t = Zn(e);
  for (; un(t) && !bo(t); ) {
    if (Qf(t)) return t;
    t = Zn(t);
  }
  return null;
}
function Jf() {
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
  const t = e.assignedSlot || e.parentNode || (wm(e) && e.host) || Rn(e);
  return wm(t) ? t.host : t;
}
function Pv(e) {
  const t = Zn(e);
  return bo(t)
    ? e.ownerDocument
      ? e.ownerDocument.body
      : e.body
    : un(t) && Ws(t)
    ? t
    : Pv(t);
}
function Ps(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const o = Pv(e),
    s = o === ((r = e.ownerDocument) == null ? void 0 : r.body),
    i = St(o);
  return s
    ? t.concat(
        i,
        i.visualViewport || [],
        Ws(o) ? o : [],
        i.frameElement && n ? Ps(i.frameElement) : []
      )
    : t.concat(o, Ps(o, [], n));
}
const Kt = Math.min,
  qe = Math.max,
  hl = Math.round,
  vi = Math.floor,
  er = (e) => ({ x: e, y: e }),
  QC = { left: "right", right: "left", bottom: "top", top: "bottom" },
  JC = { start: "end", end: "start" };
function vu(e, t, n) {
  return qe(e, Kt(t, n));
}
function En(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function qt(e) {
  return e.split("-")[0];
}
function No(e) {
  return e.split("-")[1];
}
function Zf(e) {
  return e === "x" ? "y" : "x";
}
function ed(e) {
  return e === "y" ? "height" : "width";
}
function Ar(e) {
  return ["top", "bottom"].includes(qt(e)) ? "y" : "x";
}
function td(e) {
  return Zf(Ar(e));
}
function ZC(e, t, n) {
  n === void 0 && (n = !1);
  const r = No(e),
    o = td(e),
    s = ed(o);
  let i =
    o === "x"
      ? r === (n ? "end" : "start")
        ? "right"
        : "left"
      : r === "start"
      ? "bottom"
      : "top";
  return t.reference[s] > t.floating[s] && (i = gl(i)), [i, gl(i)];
}
function eE(e) {
  const t = gl(e);
  return [wu(e), t, wu(t)];
}
function wu(e) {
  return e.replace(/start|end/g, (t) => JC[t]);
}
function tE(e, t, n) {
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
function nE(e, t, n, r) {
  const o = No(e);
  let s = tE(qt(e), n === "start", r);
  return (
    o && ((s = s.map((i) => i + "-" + o)), t && (s = s.concat(s.map(wu)))), s
  );
}
function gl(e) {
  return e.replace(/left|right|bottom|top/g, (t) => QC[t]);
}
function rE(e) {
  return { top: 0, right: 0, bottom: 0, left: 0, ...e };
}
function nd(e) {
  return typeof e != "number"
    ? rE(e)
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
function Sm(e, t, n) {
  let { reference: r, floating: o } = e;
  const s = Ar(t),
    i = td(t),
    l = ed(i),
    a = qt(t),
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
  switch (No(t)) {
    case "start":
      m[i] -= d * (n && c ? -1 : 1);
      break;
    case "end":
      m[i] += d * (n && c ? -1 : 1);
      break;
  }
  return m;
}
const oE = async (e, t, n) => {
  const {
      placement: r = "bottom",
      strategy: o = "absolute",
      middleware: s = [],
      platform: i,
    } = n,
    l = s.filter(Boolean),
    a = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let c = await i.getElementRects({ reference: e, floating: t, strategy: o }),
    { x: u, y: f } = Sm(c, r, a),
    d = r,
    m = {},
    p = 0;
  for (let h = 0; h < l.length; h++) {
    const { name: x, fn: v } = l[h],
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
      (m = { ...m, [x]: { ...m[x], ...b } }),
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
          ({ x: u, y: f } = Sm(c, d, a))),
        (h = -1));
  }
  return { x: u, y: f, placement: d, strategy: o, middlewareData: m };
};
async function rd(e, t) {
  var n;
  t === void 0 && (t = {});
  const { x: r, y: o, platform: s, rects: i, elements: l, strategy: a } = e,
    {
      boundary: c = "clippingAncestors",
      rootBoundary: u = "viewport",
      elementContext: f = "floating",
      altBoundary: d = !1,
      padding: m = 0,
    } = En(t, e),
    p = nd(m),
    x = l[d ? (f === "floating" ? "reference" : "floating") : f],
    v = Co(
      await s.getClippingRect({
        element:
          (n = await (s.isElement == null ? void 0 : s.isElement(x))) == null ||
          n
            ? x
            : x.contextElement ||
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
const sE = (e) => ({
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
        { element: c, padding: u = 0 } = En(e, t) || {};
      if (c == null) return {};
      const f = nd(u),
        d = { x: n, y: r },
        m = td(o),
        p = ed(m),
        h = await i.getDimensions(c),
        x = m === "y",
        v = x ? "top" : "left",
        g = x ? "bottom" : "right",
        y = x ? "clientHeight" : "clientWidth",
        b = s.reference[p] + s.reference[m] - d[m] - s.floating[p],
        C = d[m] - s.reference[m],
        E = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(c));
      let R = E ? E[y] : 0;
      (!R || !(await (i.isElement == null ? void 0 : i.isElement(E)))) &&
        (R = l.floating[y] || s.floating[p]);
      const D = b / 2 - C / 2,
        L = R / 2 - h[p] / 2 - 1,
        T = Kt(f[v], L),
        M = Kt(f[g], L),
        B = T,
        V = R - h[p] - M,
        F = R / 2 - h[p] / 2 + D,
        j = vu(B, F, V),
        P =
          !a.arrow &&
          No(o) != null &&
          F !== j &&
          s.reference[p] / 2 - (F < B ? T : M) - h[p] / 2 < 0,
        N = P ? (F < B ? F - B : F - V) : 0;
      return {
        [m]: d[m] + N,
        data: {
          [m]: j,
          centerOffset: F - j - N,
          ...(P && { alignmentOffset: N }),
        },
        reset: P,
      };
    },
  }),
  iE = function (e) {
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
              ...x
            } = En(e, t);
          if ((n = s.arrow) != null && n.alignmentOffset) return {};
          const v = qt(o),
            g = qt(l) === l,
            y = await (a.isRTL == null ? void 0 : a.isRTL(c.floating)),
            b = d || (g || !h ? [gl(l)] : eE(l));
          !d && p !== "none" && b.push(...nE(l, h, p, y));
          const C = [l, ...b],
            E = await rd(t, x),
            R = [];
          let D = ((r = s.flip) == null ? void 0 : r.overflows) || [];
          if ((u && R.push(E[v]), f)) {
            const B = ZC(o, i, y);
            R.push(E[B[0]], E[B[1]]);
          }
          if (
            ((D = [...D, { placement: o, overflows: R }]),
            !R.every((B) => B <= 0))
          ) {
            var L, T;
            const B = (((L = s.flip) == null ? void 0 : L.index) || 0) + 1,
              V = C[B];
            if (V)
              return {
                data: { index: B, overflows: D },
                reset: { placement: V },
              };
            let F =
              (T = D.filter((j) => j.overflows[0] <= 0).sort(
                (j, P) => j.overflows[1] - P.overflows[1]
              )[0]) == null
                ? void 0
                : T.placement;
            if (!F)
              switch (m) {
                case "bestFit": {
                  var M;
                  const j =
                    (M = D.map((P) => [
                      P.placement,
                      P.overflows
                        .filter((N) => N > 0)
                        .reduce((N, _) => N + _, 0),
                    ]).sort((P, N) => P[1] - N[1])[0]) == null
                      ? void 0
                      : M[0];
                  j && (F = j);
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
function Tv(e) {
  const t = Kt(...e.map((s) => s.left)),
    n = Kt(...e.map((s) => s.top)),
    r = qe(...e.map((s) => s.right)),
    o = qe(...e.map((s) => s.bottom));
  return { x: t, y: n, width: r - t, height: o - n };
}
function lE(e) {
  const t = e.slice().sort((o, s) => o.y - s.y),
    n = [];
  let r = null;
  for (let o = 0; o < t.length; o++) {
    const s = t[o];
    !r || s.y - r.y > r.height / 2 ? n.push([s]) : n[n.length - 1].push(s),
      (r = s);
  }
  return n.map((o) => Co(Tv(o)));
}
const aE = function (e) {
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
          { padding: l = 2, x: a, y: c } = En(e, t),
          u = Array.from(
            (await (s.getClientRects == null
              ? void 0
              : s.getClientRects(r.reference))) || []
          ),
          f = lE(u),
          d = Co(Tv(u)),
          m = nd(l);
        function p() {
          if (
            f.length === 2 &&
            f[0].left > f[1].right &&
            a != null &&
            c != null
          )
            return (
              f.find(
                (x) =>
                  a > x.left - m.left &&
                  a < x.right + m.right &&
                  c > x.top - m.top &&
                  c < x.bottom + m.bottom
              ) || d
            );
          if (f.length >= 2) {
            if (Ar(n) === "y") {
              const T = f[0],
                M = f[f.length - 1],
                B = qt(n) === "top",
                V = T.top,
                F = M.bottom,
                j = B ? T.left : M.left,
                P = B ? T.right : M.right,
                N = P - j,
                _ = F - V;
              return {
                top: V,
                bottom: F,
                left: j,
                right: P,
                width: N,
                height: _,
                x: j,
                y: V,
              };
            }
            const x = qt(n) === "left",
              v = qe(...f.map((T) => T.right)),
              g = Kt(...f.map((T) => T.left)),
              y = f.filter((T) => (x ? T.left === g : T.right === v)),
              b = y[0].top,
              C = y[y.length - 1].bottom,
              E = g,
              R = v,
              D = R - E,
              L = C - b;
            return {
              top: b,
              bottom: C,
              left: E,
              right: R,
              width: D,
              height: L,
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
async function cE(e, t) {
  const { placement: n, platform: r, elements: o } = e,
    s = await (r.isRTL == null ? void 0 : r.isRTL(o.floating)),
    i = qt(n),
    l = No(n),
    a = Ar(n) === "y",
    c = ["left", "top"].includes(i) ? -1 : 1,
    u = s && a ? -1 : 1,
    f = En(t, e);
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
const uE = function (e) {
    return (
      e === void 0 && (e = 0),
      {
        name: "offset",
        options: e,
        async fn(t) {
          var n, r;
          const { x: o, y: s, placement: i, middlewareData: l } = t,
            a = await cE(t, e);
          return i === ((n = l.offset) == null ? void 0 : n.placement) &&
            (r = l.arrow) != null &&
            r.alignmentOffset
            ? {}
            : { x: o + a.x, y: s + a.y, data: { ...a, placement: i } };
        },
      }
    );
  },
  fE = function (e) {
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
                fn: (x) => {
                  let { x: v, y: g } = x;
                  return { x: v, y: g };
                },
              },
              ...a
            } = En(e, t),
            c = { x: n, y: r },
            u = await rd(t, a),
            f = Ar(qt(o)),
            d = Zf(f);
          let m = c[d],
            p = c[f];
          if (s) {
            const x = d === "y" ? "top" : "left",
              v = d === "y" ? "bottom" : "right",
              g = m + u[x],
              y = m - u[v];
            m = vu(g, m, y);
          }
          if (i) {
            const x = f === "y" ? "top" : "left",
              v = f === "y" ? "bottom" : "right",
              g = p + u[x],
              y = p - u[v];
            p = vu(g, p, y);
          }
          const h = l.fn({ ...t, [d]: m, [f]: p });
          return { ...h, data: { x: h.x - n, y: h.y - r } };
        },
      }
    );
  },
  dE = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        options: e,
        fn(t) {
          const { x: n, y: r, placement: o, rects: s, middlewareData: i } = t,
            { offset: l = 0, mainAxis: a = !0, crossAxis: c = !0 } = En(e, t),
            u = { x: n, y: r },
            f = Ar(o),
            d = Zf(f);
          let m = u[d],
            p = u[f];
          const h = En(l, t),
            x =
              typeof h == "number"
                ? { mainAxis: h, crossAxis: 0 }
                : { mainAxis: 0, crossAxis: 0, ...h };
          if (a) {
            const y = d === "y" ? "height" : "width",
              b = s.reference[d] - s.floating[y] + x.mainAxis,
              C = s.reference[d] + s.reference[y] - x.mainAxis;
            m < b ? (m = b) : m > C && (m = C);
          }
          if (c) {
            var v, g;
            const y = d === "y" ? "width" : "height",
              b = ["top", "left"].includes(qt(o)),
              C =
                s.reference[f] -
                s.floating[y] +
                ((b && ((v = i.offset) == null ? void 0 : v[f])) || 0) +
                (b ? 0 : x.crossAxis),
              E =
                s.reference[f] +
                s.reference[y] +
                (b ? 0 : ((g = i.offset) == null ? void 0 : g[f]) || 0) -
                (b ? x.crossAxis : 0);
            p < C ? (p = C) : p > E && (p = E);
          }
          return { [d]: m, [f]: p };
        },
      }
    );
  },
  pE = function (e) {
    return (
      e === void 0 && (e = {}),
      {
        name: "size",
        options: e,
        async fn(t) {
          const { placement: n, rects: r, platform: o, elements: s } = t,
            { apply: i = () => {}, ...l } = En(e, t),
            a = await rd(t, l),
            c = qt(n),
            u = No(n),
            f = Ar(n) === "y",
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
          const x = m - a[p],
            v = d - a[h],
            g = !t.middlewareData.shift;
          let y = x,
            b = v;
          if (f) {
            const E = d - a.left - a.right;
            b = u || g ? Kt(v, E) : E;
          } else {
            const E = m - a.top - a.bottom;
            y = u || g ? Kt(x, E) : E;
          }
          if (g && !u) {
            const E = qe(a.left, 0),
              R = qe(a.right, 0),
              D = qe(a.top, 0),
              L = qe(a.bottom, 0);
            f
              ? (b = d - 2 * (E !== 0 || R !== 0 ? E + R : qe(a.left, a.right)))
              : (y =
                  m - 2 * (D !== 0 || L !== 0 ? D + L : qe(a.top, a.bottom)));
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
function Nv(e) {
  const t = Yt(e);
  let n = parseFloat(t.width) || 0,
    r = parseFloat(t.height) || 0;
  const o = un(e),
    s = o ? e.offsetWidth : n,
    i = o ? e.offsetHeight : r,
    l = hl(n) !== s || hl(r) !== i;
  return l && ((n = s), (r = i)), { width: n, height: r, $: l };
}
function od(e) {
  return at(e) ? e : e.contextElement;
}
function co(e) {
  const t = od(e);
  if (!un(t)) return er(1);
  const n = t.getBoundingClientRect(),
    { width: r, height: o, $: s } = Nv(t);
  let i = (s ? hl(n.width) : n.width) / r,
    l = (s ? hl(n.height) : n.height) / o;
  return (
    (!i || !Number.isFinite(i)) && (i = 1),
    (!l || !Number.isFinite(l)) && (l = 1),
    { x: i, y: l }
  );
}
const mE = er(0);
function Ov(e) {
  const t = St(e);
  return !Jf() || !t.visualViewport
    ? mE
    : { x: t.visualViewport.offsetLeft, y: t.visualViewport.offsetTop };
}
function hE(e, t, n) {
  return t === void 0 && (t = !1), !n || (t && n !== St(e)) ? !1 : t;
}
function Dr(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const o = e.getBoundingClientRect(),
    s = od(e);
  let i = er(1);
  t && (r ? at(r) && (i = co(r)) : (i = co(e)));
  const l = hE(s, n, r) ? Ov(s) : er(0);
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
      const x = co(h),
        v = h.getBoundingClientRect(),
        g = Yt(h),
        y = v.left + (h.clientLeft + parseFloat(g.paddingLeft)) * x.x,
        b = v.top + (h.clientTop + parseFloat(g.paddingTop)) * x.y;
      (a *= x.x),
        (c *= x.y),
        (u *= x.x),
        (f *= x.y),
        (a += y),
        (c += b),
        (p = St(h)),
        (h = p.frameElement);
    }
  }
  return Co({ width: u, height: f, x: a, y: c });
}
const gE = [":popover-open", ":modal"];
function sd(e) {
  return gE.some((t) => {
    try {
      return e.matches(t);
    } catch {
      return !1;
    }
  });
}
function yE(e) {
  let { elements: t, rect: n, offsetParent: r, strategy: o } = e;
  const s = o === "fixed",
    i = Rn(r),
    l = t ? sd(t.floating) : !1;
  if (r === i || (l && s)) return n;
  let a = { scrollLeft: 0, scrollTop: 0 },
    c = er(1);
  const u = er(0),
    f = un(r);
  if (
    (f || (!f && !s)) &&
    ((To(r) !== "body" || Ws(i)) && (a = Gl(r)), un(r))
  ) {
    const d = Dr(r);
    (c = co(r)), (u.x = d.x + r.clientLeft), (u.y = d.y + r.clientTop);
  }
  return {
    width: n.width * c.x,
    height: n.height * c.y,
    x: n.x * c.x - a.scrollLeft * c.x + u.x,
    y: n.y * c.y - a.scrollTop * c.y + u.y,
  };
}
function vE(e) {
  return Array.from(e.getClientRects());
}
function $v(e) {
  return Dr(Rn(e)).left + Gl(e).scrollLeft;
}
function wE(e) {
  const t = Rn(e),
    n = Gl(e),
    r = e.ownerDocument.body,
    o = qe(t.scrollWidth, t.clientWidth, r.scrollWidth, r.clientWidth),
    s = qe(t.scrollHeight, t.clientHeight, r.scrollHeight, r.clientHeight);
  let i = -n.scrollLeft + $v(e);
  const l = -n.scrollTop;
  return (
    Yt(r).direction === "rtl" && (i += qe(t.clientWidth, r.clientWidth) - o),
    { width: o, height: s, x: i, y: l }
  );
}
function SE(e, t) {
  const n = St(e),
    r = Rn(e),
    o = n.visualViewport;
  let s = r.clientWidth,
    i = r.clientHeight,
    l = 0,
    a = 0;
  if (o) {
    (s = o.width), (i = o.height);
    const c = Jf();
    (!c || (c && t === "fixed")) && ((l = o.offsetLeft), (a = o.offsetTop));
  }
  return { width: s, height: i, x: l, y: a };
}
function xE(e, t) {
  const n = Dr(e, !0, t === "fixed"),
    r = n.top + e.clientTop,
    o = n.left + e.clientLeft,
    s = un(e) ? co(e) : er(1),
    i = e.clientWidth * s.x,
    l = e.clientHeight * s.y,
    a = o * s.x,
    c = r * s.y;
  return { width: i, height: l, x: a, y: c };
}
function xm(e, t, n) {
  let r;
  if (t === "viewport") r = SE(e, n);
  else if (t === "document") r = wE(Rn(e));
  else if (at(t)) r = xE(t, n);
  else {
    const o = Ov(e);
    r = { ...t, x: t.x - o.x, y: t.y - o.y };
  }
  return Co(r);
}
function jv(e, t) {
  const n = Zn(e);
  return n === t || !at(n) || bo(n)
    ? !1
    : Yt(n).position === "fixed" || jv(n, t);
}
function bE(e, t) {
  const n = t.get(e);
  if (n) return n;
  let r = Ps(e, [], !1).filter((l) => at(l) && To(l) !== "body"),
    o = null;
  const s = Yt(e).position === "fixed";
  let i = s ? Zn(e) : e;
  for (; at(i) && !bo(i); ) {
    const l = Yt(i),
      a = Qf(i);
    !a && l.position === "fixed" && (o = null),
      (
        s
          ? !a && !o
          : (!a &&
              l.position === "static" &&
              !!o &&
              ["absolute", "fixed"].includes(o.position)) ||
            (Ws(i) && !a && jv(e, i))
      )
        ? (r = r.filter((u) => u !== i))
        : (o = l),
      (i = Zn(i));
  }
  return t.set(e, r), r;
}
function CE(e) {
  let { element: t, boundary: n, rootBoundary: r, strategy: o } = e;
  const i = [
      ...(n === "clippingAncestors"
        ? sd(t)
          ? []
          : bE(t, this._c)
        : [].concat(n)),
      r,
    ],
    l = i[0],
    a = i.reduce((c, u) => {
      const f = xm(t, u, o);
      return (
        (c.top = qe(f.top, c.top)),
        (c.right = Kt(f.right, c.right)),
        (c.bottom = Kt(f.bottom, c.bottom)),
        (c.left = qe(f.left, c.left)),
        c
      );
    }, xm(t, l, o));
  return {
    width: a.right - a.left,
    height: a.bottom - a.top,
    x: a.left,
    y: a.top,
  };
}
function EE(e) {
  const { width: t, height: n } = Nv(e);
  return { width: t, height: n };
}
function kE(e, t, n) {
  const r = un(t),
    o = Rn(t),
    s = n === "fixed",
    i = Dr(e, !0, s, t);
  let l = { scrollLeft: 0, scrollTop: 0 };
  const a = er(0);
  if (r || (!r && !s))
    if (((To(t) !== "body" || Ws(o)) && (l = Gl(t)), r)) {
      const f = Dr(t, !0, s, t);
      (a.x = f.x + t.clientLeft), (a.y = f.y + t.clientTop);
    } else o && (a.x = $v(o));
  const c = i.left + l.scrollLeft - a.x,
    u = i.top + l.scrollTop - a.y;
  return { x: c, y: u, width: i.width, height: i.height };
}
function pc(e) {
  return Yt(e).position === "static";
}
function bm(e, t) {
  return !un(e) || Yt(e).position === "fixed"
    ? null
    : t
    ? t(e)
    : e.offsetParent;
}
function Lv(e, t) {
  const n = St(e);
  if (sd(e)) return n;
  if (!un(e)) {
    let o = Zn(e);
    for (; o && !bo(o); ) {
      if (at(o) && !pc(o)) return o;
      o = Zn(o);
    }
    return n;
  }
  let r = bm(e, t);
  for (; r && GC(r) && pc(r); ) r = bm(r, t);
  return r && bo(r) && pc(r) && !Qf(r) ? n : r || XC(e) || n;
}
const _E = async function (e) {
  const t = this.getOffsetParent || Lv,
    n = this.getDimensions,
    r = await n(e.floating);
  return {
    reference: kE(e.reference, await t(e.floating), e.strategy),
    floating: { x: 0, y: 0, width: r.width, height: r.height },
  };
};
function RE(e) {
  return Yt(e).direction === "rtl";
}
const DE = {
  convertOffsetParentRelativeRectToViewportRelativeRect: yE,
  getDocumentElement: Rn,
  getClippingRect: CE,
  getOffsetParent: Lv,
  getElementRects: _E,
  getClientRects: vE,
  getDimensions: EE,
  getScale: co,
  isElement: at,
  isRTL: RE,
};
function PE(e, t) {
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
    const m = vi(u),
      p = vi(o.clientWidth - (c + f)),
      h = vi(o.clientHeight - (u + d)),
      x = vi(c),
      g = {
        rootMargin: -m + "px " + -p + "px " + -h + "px " + -x + "px",
        threshold: qe(0, Kt(1, a)) || 1,
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
function TE(e, t, n, r) {
  r === void 0 && (r = {});
  const {
      ancestorScroll: o = !0,
      ancestorResize: s = !0,
      elementResize: i = typeof ResizeObserver == "function",
      layoutShift: l = typeof IntersectionObserver == "function",
      animationFrame: a = !1,
    } = r,
    c = od(e),
    u = o || s ? [...(c ? Ps(c) : []), ...Ps(t)] : [];
  u.forEach((v) => {
    o && v.addEventListener("scroll", n, { passive: !0 }),
      s && v.addEventListener("resize", n);
  });
  const f = c && l ? PE(c, n) : null;
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
    h = a ? Dr(e) : null;
  a && x();
  function x() {
    const v = Dr(e);
    h &&
      (v.x !== h.x ||
        v.y !== h.y ||
        v.width !== h.width ||
        v.height !== h.height) &&
      n(),
      (h = v),
      (p = requestAnimationFrame(x));
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
const NE = uE,
  OE = fE,
  Cm = iE,
  $E = pE,
  Em = sE,
  km = aE,
  _m = dE,
  jE = (e, t, n) => {
    const r = new Map(),
      o = { platform: DE, ...n },
      s = { ...o.platform, _c: r };
    return oE(e, t, { ...o, platform: s });
  },
  LE = (e) => {
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
            ? Em({ element: r.current, padding: o }).fn(n)
            : {}
          : r
          ? Em({ element: r, padding: o }).fn(n)
          : {};
      },
    };
  };
var Mi = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
function yl(e, t) {
  if (e === t) return !0;
  if (typeof e != typeof t) return !1;
  if (typeof e == "function" && e.toString() === t.toString()) return !0;
  let n, r, o;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (((n = e.length), n !== t.length)) return !1;
      for (r = n; r-- !== 0; ) if (!yl(e[r], t[r])) return !1;
      return !0;
    }
    if (((o = Object.keys(e)), (n = o.length), n !== Object.keys(t).length))
      return !1;
    for (r = n; r-- !== 0; ) if (!{}.hasOwnProperty.call(t, o[r])) return !1;
    for (r = n; r-- !== 0; ) {
      const s = o[r];
      if (!(s === "_owner" && e.$$typeof) && !yl(e[s], t[s])) return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function Av(e) {
  return typeof window > "u"
    ? 1
    : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Rm(e, t) {
  const n = Av(e);
  return Math.round(t * n) / n;
}
function Dm(e) {
  const t = w.useRef(e);
  return (
    Mi(() => {
      t.current = e;
    }),
    t
  );
}
function AE(e) {
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
  yl(d, r) || m(r);
  const [p, h] = w.useState(null),
    [x, v] = w.useState(null),
    g = w.useCallback((N) => {
      N !== E.current && ((E.current = N), h(N));
    }, []),
    y = w.useCallback((N) => {
      N !== R.current && ((R.current = N), v(N));
    }, []),
    b = s || p,
    C = i || x,
    E = w.useRef(null),
    R = w.useRef(null),
    D = w.useRef(u),
    L = a != null,
    T = Dm(a),
    M = Dm(o),
    B = w.useCallback(() => {
      if (!E.current || !R.current) return;
      const N = { placement: t, strategy: n, middleware: d };
      M.current && (N.platform = M.current),
        jE(E.current, R.current, N).then((_) => {
          const k = { ..._, isPositioned: !0 };
          V.current &&
            !yl(D.current, k) &&
            ((D.current = k),
            zs.flushSync(() => {
              f(k);
            }));
        });
    }, [d, t, n, M]);
  Mi(() => {
    c === !1 &&
      D.current.isPositioned &&
      ((D.current.isPositioned = !1), f((N) => ({ ...N, isPositioned: !1 })));
  }, [c]);
  const V = w.useRef(!1);
  Mi(
    () => (
      (V.current = !0),
      () => {
        V.current = !1;
      }
    ),
    []
  ),
    Mi(() => {
      if ((b && (E.current = b), C && (R.current = C), b && C)) {
        if (T.current) return T.current(b, C, B);
        B();
      }
    }, [b, C, B, T, L]);
  const F = w.useMemo(
      () => ({ reference: E, floating: R, setReference: g, setFloating: y }),
      [g, y]
    ),
    j = w.useMemo(() => ({ reference: b, floating: C }), [b, C]),
    P = w.useMemo(() => {
      const N = { position: n, left: 0, top: 0 };
      if (!j.floating) return N;
      const _ = Rm(j.floating, u.x),
        k = Rm(j.floating, u.y);
      return l
        ? {
            ...N,
            transform: "translate(" + _ + "px, " + k + "px)",
            ...(Av(j.floating) >= 1.5 && { willChange: "transform" }),
          }
        : { position: n, left: _, top: k };
    }, [n, l, j.floating, u.x, u.y]);
  return w.useMemo(
    () => ({ ...u, update: B, refs: F, elements: j, floatingStyles: P }),
    [u, B, F, j, P]
  );
}
const Fv = { ...Mh },
  FE = Fv.useInsertionEffect,
  ME = FE || ((e) => e());
function zE(e) {
  const t = w.useRef(() => {});
  return (
    ME(() => {
      t.current = e;
    }),
    w.useCallback(function () {
      for (var n = arguments.length, r = new Array(n), o = 0; o < n; o++)
        r[o] = arguments[o];
      return t.current == null ? void 0 : t.current(...r);
    }, [])
  );
}
var Su = typeof document < "u" ? w.useLayoutEffect : w.useEffect;
let Pm = !1,
  IE = 0;
const Tm = () => "floating-ui-" + Math.random().toString(36).slice(2, 6) + IE++;
function BE() {
  const [e, t] = w.useState(() => (Pm ? Tm() : void 0));
  return (
    Su(() => {
      e == null && t(Tm());
    }, []),
    w.useEffect(() => {
      Pm = !0;
    }, []),
    e
  );
}
const HE = Fv.useId,
  VE = HE || BE;
function UE() {
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
const WE = w.createContext(null),
  YE = w.createContext(null),
  KE = () => {
    var e;
    return ((e = w.useContext(WE)) == null ? void 0 : e.id) || null;
  },
  qE = () => w.useContext(YE);
function GE(e) {
  const { open: t = !1, onOpenChange: n, elements: r } = e,
    o = VE(),
    s = w.useRef({}),
    [i] = w.useState(() => UE()),
    l = KE() != null,
    [a, c] = w.useState(r.reference),
    u = zE((m, p, h) => {
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
function XE(e) {
  e === void 0 && (e = {});
  const { nodeId: t } = e,
    n = GE({
      ...e,
      elements: { reference: null, floating: null, ...e.elements },
    }),
    r = e.rootContext || n,
    o = r.elements,
    [s, i] = w.useState(null),
    [l, a] = w.useState(null),
    u = (o == null ? void 0 : o.reference) || s,
    f = w.useRef(null),
    d = qE();
  Su(() => {
    u && (f.current = u);
  }, [u]);
  const m = AE({ ...e, elements: { ...o, ...(l && { reference: l }) } }),
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
    x = w.useMemo(
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
      () => ({ ...m, ...r, refs: x, elements: v, nodeId: t }),
      [m, x, v, t, r]
    );
  return (
    Su(() => {
      r.dataRef.current.floatingContext = g;
      const y = d == null ? void 0 : d.nodesRef.current.find((b) => b.id === t);
      y && (y.context = g);
    }),
    w.useMemo(() => ({ ...m, context: g, refs: x, elements: v }), [m, x, v, g])
  );
}
function QE(e, t) {
  if (e === "rtl" && (t.includes("right") || t.includes("left"))) {
    const [n, r] = t.split("-"),
      o = n === "right" ? "left" : "right";
    return r === void 0 ? o : `${o}-${r}`;
  }
  return t;
}
function Nm(e, t, n, r) {
  return e === "center" || r === "center"
    ? { top: t }
    : e === "end"
    ? { bottom: n }
    : e === "start"
    ? { top: n }
    : {};
}
function Om(e, t, n, r, o) {
  return e === "center" || r === "center"
    ? { left: t }
    : e === "end"
    ? { [o === "ltr" ? "right" : "left"]: n }
    : e === "start"
    ? { [o === "ltr" ? "left" : "right"]: n }
    : {};
}
const JE = {
  bottom: "borderTopLeftRadius",
  left: "borderTopRightRadius",
  right: "borderBottomLeftRadius",
  top: "borderBottomRightRadius",
};
function ZE({
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
      [JE[a]]: z(r),
    },
    f = z(-t / 2);
  return a === "left"
    ? {
        ...u,
        ...Nm(c, i, n, o),
        right: f,
        borderLeftColor: "transparent",
        borderBottomColor: "transparent",
      }
    : a === "right"
    ? {
        ...u,
        ...Nm(c, i, n, o),
        left: f,
        borderRightColor: "transparent",
        borderTopColor: "transparent",
      }
    : a === "top"
    ? {
        ...u,
        ...Om(c, s, n, o, l),
        bottom: f,
        borderTopColor: "transparent",
        borderLeftColor: "transparent",
      }
    : a === "bottom"
    ? {
        ...u,
        ...Om(c, s, n, o, l),
        top: f,
        borderBottomColor: "transparent",
        borderRightColor: "transparent",
      }
    : {};
}
const Mv = w.forwardRef(
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
    const { dir: f } = Wf();
    return s
      ? S.jsx("div", {
          ...c,
          ref: u,
          style: {
            ...a,
            ...ZE({
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
Mv.displayName = "@mantine/core/FloatingArrow";
const [ek, zv] = $r("Popover component was not found in the tree");
function Xl({ children: e, active: t = !0, refProp: n = "ref" }) {
  const r = ub(t),
    o = Ot(r, e == null ? void 0 : e.ref);
  return Po(e) ? w.cloneElement(e, { [n]: o }) : e;
}
function Iv(e) {
  return S.jsx(Gf, { tabIndex: -1, "data-autofocus": !0, ...e });
}
Xl.displayName = "@mantine/core/FocusTrap";
Iv.displayName = "@mantine/core/FocusTrapInitialFocus";
Xl.InitialFocus = Iv;
function tk(e) {
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
const nk = {},
  Bv = w.forwardRef((e, t) => {
    const { children: n, target: r, ...o } = W("Portal", nk, e),
      [s, i] = w.useState(!1),
      l = w.useRef(null);
    return (
      Is(
        () => (
          i(!0),
          (l.current = r
            ? typeof r == "string"
              ? document.querySelector(r)
              : r
            : tk(o)),
          Mf(t, l.current),
          !r && l.current && document.body.appendChild(l.current),
          () => {
            !r && l.current && document.body.removeChild(l.current);
          }
        ),
        [r]
      ),
      !s || !l.current
        ? null
        : zs.createPortal(S.jsx(S.Fragment, { children: n }), l.current)
    );
  });
Bv.displayName = "@mantine/core/Portal";
function Ql({ withinPortal: e = !0, children: t, ...n }) {
  return e
    ? S.jsx(Bv, { ...n, children: t })
    : S.jsx(S.Fragment, { children: t });
}
Ql.displayName = "@mantine/core/OptionalPortal";
const Go = (e) => ({
    in: { opacity: 1, transform: "scale(1)" },
    out: {
      opacity: 0,
      transform: `scale(.9) translateY(${z(e === "bottom" ? 10 : -10)})`,
    },
    transitionProperty: "transform, opacity",
  }),
  wi = {
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
  $m = {
    entering: "in",
    entered: "in",
    exiting: "out",
    exited: "out",
    "pre-exiting": "out",
    "pre-entering": "out",
  };
function rk({ transition: e, state: t, duration: n, timingFunction: r }) {
  const o = { transitionDuration: `${n}ms`, transitionTimingFunction: r };
  return typeof e == "string"
    ? e in wi
      ? {
          transitionProperty: wi[e].transitionProperty,
          ...o,
          ...wi[e].common,
          ...wi[e][$m[t]],
        }
      : {}
    : {
        transitionProperty: e.transitionProperty,
        ...o,
        ...e.common,
        ...e[$m[t]],
      };
}
function ok({
  duration: e,
  exitDuration: t,
  timingFunction: n,
  mounted: r,
  onEnter: o,
  onExit: s,
  onEntered: i,
  onExited: l,
}) {
  const a = fn(),
    c = zf(),
    u = a.respectReducedMotion ? c : !1,
    [f, d] = w.useState(u ? 0 : e),
    [m, p] = w.useState(r ? "entered" : "exited"),
    h = w.useRef(-1),
    x = w.useRef(-1),
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
          : (x.current = requestAnimationFrame(() => {
              ax.flushSync(() => {
                p(g ? "pre-entering" : "pre-exiting");
              }),
                (x.current = requestAnimationFrame(() => {
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
    Rr(() => {
      v(r);
    }, [r]),
    w.useEffect(
      () => () => {
        window.clearTimeout(h.current), cancelAnimationFrame(x.current);
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
function Oo({
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
  } = ok({
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
      ? S.jsx(S.Fragment, { children: s({}) })
      : e
      ? s({ display: "none" })
      : null
    : d === "exited"
    ? e
      ? s({ display: "none" })
      : null
    : S.jsx(S.Fragment, {
        children: s(
          rk({ transition: t, duration: f, state: d, timingFunction: m })
        ),
      });
}
Oo.displayName = "@mantine/core/Transition";
var Hv = { dropdown: "m_38a85659", arrow: "m_a31dc6c1" };
const sk = {},
  id = Q((e, t) => {
    var x, v, g, y;
    const n = W("PopoverDropdown", sk, e),
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
      d = zv(),
      m = Jy({ opened: d.opened, shouldReturnFocus: d.returnFocus }),
      p = d.withRoles
        ? {
            "aria-labelledby": d.getTargetId(),
            id: d.getDropdownId(),
            role: "dialog",
            tabIndex: -1,
          }
        : {},
      h = Ot(t, d.floating);
    return d.disabled
      ? null
      : S.jsx(Ql, {
          ...d.portalProps,
          withinPortal: d.withinPortal,
          children: S.jsx(Oo, {
            mounted: d.opened,
            ...d.transitionProps,
            transition:
              ((x = d.transitionProps) == null ? void 0 : x.transition) ||
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
              S.jsx(Xl, {
                active: d.trapFocus,
                children: S.jsxs(Z, {
                  ...p,
                  ...f,
                  variant: a,
                  ref: h,
                  onKeyDownCapture: Qx(d.onClose, {
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
                    S.jsx(Mv, {
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
id.classes = Hv;
id.displayName = "@mantine/core/PopoverDropdown";
const ik = { refProp: "ref", popupType: "dialog" },
  Vv = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      popupType: o,
      ...s
    } = W("PopoverTarget", ik, e);
    if (!Po(n))
      throw new Error(
        "Popover.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const i = s,
      l = zv(),
      a = Ot(l.reference, n.ref, t),
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
Vv.displayName = "@mantine/core/PopoverTarget";
function lk({ opened: e, floating: t, position: n, positionDependencies: r }) {
  const [o, s] = w.useState(0);
  w.useEffect(() => {
    if (t.refs.reference.current && t.refs.floating.current)
      return TE(t.refs.reference.current, t.refs.floating.current, t.update);
  }, [t.refs.reference.current, t.refs.floating.current, e, o, n]),
    Rr(() => {
      t.update();
    }, r),
    Rr(() => {
      s((i) => i + 1);
    }, [e]);
}
function ak(e) {
  if (e === void 0) return { shift: !0, flip: !0 };
  const t = { ...e };
  return (
    e.shift === void 0 && (t.shift = !0), e.flip === void 0 && (t.flip = !0), t
  );
}
function ck(e, t) {
  const n = ak(e.middlewares),
    r = [NE(e.offset)];
  return (
    n.shift &&
      r.push(
        OE(
          typeof n.shift == "boolean"
            ? { limiter: _m(), padding: 5 }
            : { limiter: _m(), padding: 5, ...n.shift }
        )
      ),
    n.flip && r.push(typeof n.flip == "boolean" ? Cm() : Cm(n.flip)),
    n.inline && r.push(typeof n.inline == "boolean" ? km() : km(n.inline)),
    r.push(LE({ element: e.arrowRef, padding: e.arrowOffset })),
    (n.size || e.width === "target") &&
      r.push(
        $E({
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
function uk(e) {
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
    s = XE({
      strategy: e.strategy,
      placement: e.position,
      middleware: ck(e, () => s),
    });
  return (
    lk({
      opened: e.opened,
      position: e.position,
      positionDependencies: e.positionDependencies || [],
      floating: s,
    }),
    Rr(() => {
      var i;
      (i = e.onPositionChange) == null || i.call(e, s.placement);
    }, [s.placement]),
    Rr(() => {
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
const fk = {
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
    zIndex: jr("popover"),
    __staticSelector: "Popover",
    width: "max-content",
  },
  dk = (e, { radius: t, shadow: n }) => ({
    dropdown: {
      "--popover-radius": t === void 0 ? void 0 : or(t),
      "--popover-shadow": Ff(n),
    },
  });
function sr(e) {
  var xe, gt, At, Ie, U, re;
  const t = W("Popover", fk, e),
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
      unstyled: x,
      classNames: v,
      styles: g,
      closeOnClickOutside: y,
      withinPortal: b,
      portalProps: C,
      closeOnEscape: E,
      clickOutsideEvents: R,
      trapFocus: D,
      onClose: L,
      onOpen: T,
      onChange: M,
      zIndex: B,
      radius: V,
      shadow: F,
      id: j,
      defaultOpened: P,
      __staticSelector: N,
      withRoles: _,
      disabled: k,
      returnFocus: $,
      variant: O,
      keepMounted: I,
      vars: Y,
      floatingStrategy: X,
      ...ee
    } = t,
    ne = de({
      name: N,
      props: t,
      classes: Hv,
      classNames: v,
      styles: g,
      unstyled: x,
      rootSelector: "dropdown",
      vars: Y,
      varsResolver: dk,
    }),
    te = w.useRef(null),
    [me, oe] = w.useState(null),
    [le, J] = w.useState(null),
    { dir: ye } = Wf(),
    ce = Bs(j),
    se = uk({
      middlewares: u,
      width: c,
      position: QE(ye, r),
      offset: typeof o == "number" ? o + (f ? d / 2 : 0) : o,
      arrowRef: te,
      arrowOffset: m,
      onPositionChange: s,
      positionDependencies: i,
      opened: l,
      defaultOpened: P,
      onChange: M,
      onOpen: T,
      onClose: L,
      strategy: X,
    });
  eb(() => y && se.onClose(), R, [me, le]);
  const Ne = w.useCallback(
      (ae) => {
        oe(ae), se.floating.refs.setReference(ae);
      },
      [se.floating.refs.setReference]
    ),
    Xe = w.useCallback(
      (ae) => {
        J(ae), se.floating.refs.setFloating(ae);
      },
      [se.floating.refs.setFloating]
    );
  return S.jsx(ek, {
    value: {
      returnFocus: $,
      disabled: k,
      controlled: se.controlled,
      reference: Ne,
      floating: Xe,
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
      radius: V,
      shadow: F,
      closeOnEscape: E,
      onClose: se.onClose,
      onToggle: se.onToggle,
      getTargetId: () => `${ce}-target`,
      getDropdownId: () => `${ce}-dropdown`,
      withRoles: _,
      targetProps: ee,
      __staticSelector: N,
      classNames: v,
      styles: g,
      unstyled: x,
      variant: O,
      keepMounted: I,
      getStyles: ne,
    },
    children: n,
  });
}
sr.Target = Vv;
sr.Dropdown = id;
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
const pk = w.forwardRef(({ className: e, ...t }, n) =>
    S.jsxs(Z, {
      component: "span",
      className: nt(Bt.barsLoader, e),
      ...t,
      ref: n,
      children: [
        S.jsx("span", { className: Bt.bar }),
        S.jsx("span", { className: Bt.bar }),
        S.jsx("span", { className: Bt.bar }),
      ],
    })
  ),
  mk = w.forwardRef(({ className: e, ...t }, n) =>
    S.jsxs(Z, {
      component: "span",
      className: nt(Bt.dotsLoader, e),
      ...t,
      ref: n,
      children: [
        S.jsx("span", { className: Bt.dot }),
        S.jsx("span", { className: Bt.dot }),
        S.jsx("span", { className: Bt.dot }),
      ],
    })
  ),
  hk = w.forwardRef(({ className: e, ...t }, n) =>
    S.jsx(Z, {
      component: "span",
      className: nt(Bt.ovalLoader, e),
      ...t,
      ref: n,
    })
  ),
  Uv = { bars: pk, oval: hk, dots: mk },
  gk = { loaders: Uv, type: "oval" },
  yk = (e, { size: t, color: n }) => ({
    root: {
      "--loader-size": ze(t, "loader-size"),
      "--loader-color": n ? pl(n, e) : void 0,
    },
  }),
  Ys = Q((e, t) => {
    const n = W("Loader", gk, e),
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
      x = de({
        name: "Loader",
        props: n,
        classes: Bt,
        className: l,
        style: a,
        classNames: c,
        styles: u,
        unstyled: f,
        vars: i,
        varsResolver: yk,
      });
    return p
      ? S.jsx(Z, { ...x("root"), ref: t, ...h, children: p })
      : S.jsx(Z, {
          ...x("root"),
          ref: t,
          component: d[s],
          variant: m,
          size: r,
          ...h,
        });
  });
Ys.defaultLoaders = Uv;
Ys.classes = Bt;
Ys.displayName = "@mantine/core/Loader";
const Wv = w.forwardRef(
  ({ size: e = "var(--cb-icon-size, 70%)", style: t, ...n }, r) =>
    S.jsx("svg", {
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      style: { ...t, width: e, height: e },
      ref: r,
      ...n,
      children: S.jsx("path", {
        d: "M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    })
);
Wv.displayName = "@mantine/core/CloseIcon";
var Yv = { root: "m_86a44da5", "root--subtle": "m_220c80f2" };
const vk = { variant: "subtle" },
  wk = (e, { size: t, radius: n, iconSize: r }) => ({
    root: {
      "--cb-size": ze(t, "cb-size"),
      "--cb-radius": n === void 0 ? void 0 : or(n),
      "--cb-icon-size": z(r),
    },
  }),
  Eo = _n((e, t) => {
    const n = W("CloseButton", vk, e),
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
        mod: x,
        ...v
      } = n,
      g = de({
        name: "CloseButton",
        props: n,
        className: l,
        style: c,
        classes: Yv,
        classNames: a,
        styles: u,
        unstyled: f,
        vars: s,
        varsResolver: wk,
      });
    return S.jsxs(wn, {
      ref: t,
      ...v,
      unstyled: f,
      variant: p,
      disabled: m,
      mod: [{ disabled: m || d }, x],
      ...g("root", { variant: p, active: !m && !d }),
      children: [h || S.jsx(Wv, {}), o],
    });
  });
Eo.classes = Yv;
Eo.displayName = "@mantine/core/CloseButton";
function Sk(e) {
  return w.Children.toArray(e).filter(Boolean);
}
var Kv = { root: "m_4081bf90" };
const xk = {
    preventGrowOverflow: !0,
    gap: "md",
    align: "center",
    justify: "flex-start",
    wrap: "wrap",
  },
  bk = (
    e,
    { grow: t, preventGrowOverflow: n, gap: r, align: o, justify: s, wrap: i },
    { childWidth: l }
  ) => ({
    root: {
      "--group-child-width": t && n ? l : void 0,
      "--group-gap": Wl(r),
      "--group-align": o,
      "--group-justify": s,
      "--group-wrap": i,
    },
  }),
  zn = Q((e, t) => {
    const n = W("Group", xk, e),
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
        variant: x,
        __size: v,
        mod: g,
        ...y
      } = n,
      b = Sk(a),
      C = b.length,
      E = Wl(c ?? "md"),
      D = { childWidth: `calc(${100 / C}% - (${E} - ${E} / ${C}))` },
      L = de({
        name: "Group",
        props: n,
        stylesCtx: D,
        className: o,
        style: s,
        classes: Kv,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: h,
        varsResolver: bk,
      });
    return S.jsx(Z, {
      ...L("root"),
      ref: t,
      variant: x,
      mod: [{ grow: m }, g],
      size: v,
      ...y,
      children: b,
    });
  });
zn.classes = Kv;
zn.displayName = "@mantine/core/Group";
var qv = { root: "m_9814e45f" };
const Ck = { zIndex: jr("modal") },
  Ek = (
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
        ((n !== void 0 || r !== void 0) && nn(n || "#000", r ?? 0.6)) ||
        void 0,
      "--overlay-filter": o ? `blur(${z(o)})` : void 0,
      "--overlay-radius": s === void 0 ? void 0 : or(s),
      "--overlay-z-index": i == null ? void 0 : i.toString(),
    },
  }),
  Ts = _n((e, t) => {
    const n = W("Overlay", Ck, e),
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
        color: x,
        backgroundOpacity: v,
        mod: g,
        ...y
      } = n,
      b = de({
        name: "Overlay",
        props: n,
        classes: qv,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: Ek,
      });
    return S.jsx(Z, {
      ref: t,
      ...b("root"),
      mod: [{ center: u, fixed: c }, g],
      ...y,
      children: f,
    });
  });
Ts.classes = qv;
Ts.displayName = "@mantine/core/Overlay";
const [kk, Dn] = $r("ModalBase component was not found in tree");
function _k({ opened: e, transitionDuration: t }) {
  const [n, r] = w.useState(e),
    o = w.useRef(),
    i = zf() ? 0 : t;
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
function Rk({
  id: e,
  transitionProps: t,
  opened: n,
  trapFocus: r,
  closeOnEscape: o,
  onClose: s,
  returnFocus: i,
}) {
  const l = Bs(e),
    [a, c] = w.useState(!1),
    [u, f] = w.useState(!1),
    d =
      typeof (t == null ? void 0 : t.duration) == "number"
        ? t == null
          ? void 0
          : t.duration
        : 200,
    m = _k({ opened: n, transitionDuration: d });
  return (
    pb(
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
    Jy({ opened: n, shouldReturnFocus: r && i }),
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
const Dk = w.forwardRef(
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
      __vars: x,
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
      setTitleMounted: L,
      setBodyMounted: T,
    } = Rk({
      id: r,
      transitionProps: o,
      opened: t,
      trapFocus: s,
      closeOnEscape: i,
      onClose: n,
      returnFocus: l,
    });
    return S.jsx(Ql, {
      ...u,
      withinPortal: c,
      children: S.jsx(kk, {
        value: {
          opened: t,
          onClose: n,
          closeOnClickOutside: a,
          transitionProps: { ...o, keepMounted: e },
          getTitleId: () => `${C}-title`,
          getBodyId: () => `${C}-body`,
          titleMounted: E,
          bodyMounted: R,
          setTitleMounted: L,
          setBodyMounted: T,
          trapFocus: s,
          closeOnEscape: i,
          zIndex: m,
          unstyled: v,
        },
        children: S.jsx(qy, {
          enabled: D && f,
          ...g,
          children: S.jsx(Z, {
            ref: b,
            ...y,
            __vars: {
              ...x,
              "--mb-z-index": (m || jr("modal")).toString(),
              "--mb-shadow": Ff(p),
              "--mb-padding": Wl(h),
            },
            children: d,
          }),
        }),
      }),
    });
  }
);
function Pk() {
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
const Gv = w.forwardRef(({ className: e, ...t }, n) => {
  const r = Pk(),
    o = Dn();
  return S.jsx(Z, {
    ref: n,
    ...t,
    id: r,
    className: nt({ [ko.body]: !o.unstyled }, e),
  });
});
Gv.displayName = "@mantine/core/ModalBaseBody";
const Xv = w.forwardRef(({ className: e, onClick: t, ...n }, r) => {
  const o = Dn();
  return S.jsx(Eo, {
    ref: r,
    ...n,
    onClick: (s) => {
      o.onClose(), t == null || t(s);
    },
    className: nt({ [ko.close]: !o.unstyled }, e),
    unstyled: o.unstyled,
  });
});
Xv.displayName = "@mantine/core/ModalBaseCloseButton";
const Tk = w.forwardRef(
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
      return S.jsx(Oo, {
        mounted: l.opened,
        transition: "pop",
        ...l.transitionProps,
        ...e,
        children: (a) =>
          S.jsx("div", {
            ...n,
            className: nt({ [ko.inner]: !l.unstyled }, n.className),
            children: S.jsx(Xl, {
              active: l.opened && l.trapFocus,
              children: S.jsx(Xf, {
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
  Qv = w.forwardRef(({ className: e, ...t }, n) => {
    const r = Dn();
    return S.jsx(Z, {
      component: "header",
      ref: n,
      className: nt({ [ko.header]: !r.unstyled }, e),
      ...t,
    });
  });
Qv.displayName = "@mantine/core/ModalBaseHeader";
const Nk = { duration: 200, timingFunction: "ease", transition: "fade" };
function Ok(e) {
  const t = Dn();
  return { ...Nk, ...t.transitionProps, ...e };
}
const Jv = w.forwardRef(
  ({ onClick: e, transitionProps: t, style: n, ...r }, o) => {
    const s = Dn(),
      i = Ok(t);
    return S.jsx(Oo, {
      mounted: s.opened,
      ...i,
      transition: "fade",
      children: (l) =>
        S.jsx(Ts, {
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
Jv.displayName = "@mantine/core/ModalBaseOverlay";
function $k() {
  const e = Dn();
  return (
    w.useEffect(() => (e.setTitleMounted(!0), () => e.setTitleMounted(!1)), []),
    e.getTitleId()
  );
}
const Zv = w.forwardRef(({ className: e, ...t }, n) => {
  const r = $k(),
    o = Dn();
  return S.jsx(Z, {
    component: "h2",
    ref: n,
    className: nt({ [ko.title]: !o.unstyled }, e),
    ...t,
    id: r,
  });
});
Zv.displayName = "@mantine/core/ModalBaseTitle";
function jk({ children: e }) {
  return S.jsx(S.Fragment, { children: e });
}
const [Lk, Jl] = qx({
  offsetBottom: !1,
  offsetTop: !1,
  describedBy: void 0,
  getStyles: null,
  inputId: void 0,
  labelId: void 0,
});
var jt = {
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
const jm = {},
  Ak = (e, { size: t }) => ({
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  Zl = Q((e, t) => {
    const n = W("InputDescription", jm, e),
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
      } = W("InputDescription", jm, n),
      p = Jl(),
      h = de({
        name: ["InputWrapper", u],
        props: n,
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "description",
        vars: a,
        varsResolver: Ak,
      }),
      x = (f && (p == null ? void 0 : p.getStyles)) || h;
    return S.jsx(Z, {
      component: "p",
      ref: t,
      variant: d,
      size: c,
      ...x(
        "description",
        p != null && p.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
Zl.classes = jt;
Zl.displayName = "@mantine/core/InputDescription";
const Fk = {},
  Mk = (e, { size: t }) => ({
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  ea = Q((e, t) => {
    const n = W("InputError", Fk, e),
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
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "error",
        vars: a,
        varsResolver: Mk,
      }),
      h = Jl(),
      x = (f && (h == null ? void 0 : h.getStyles)) || p;
    return S.jsx(Z, {
      component: "p",
      ref: t,
      variant: d,
      size: c,
      ...x(
        "error",
        h != null && h.getStyles ? { className: o, style: s } : void 0
      ),
      ...m,
    });
  });
ea.classes = jt;
ea.displayName = "@mantine/core/InputError";
const Lm = { labelElement: "label" },
  zk = (e, { size: t }) => ({
    label: { "--input-label-size": tt(t), "--input-asterisk-color": void 0 },
  }),
  ta = Q((e, t) => {
    const n = W("InputLabel", Lm, e),
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
        variant: x,
        mod: v,
        ...g
      } = W("InputLabel", Lm, n),
      y = de({
        name: ["InputWrapper", h],
        props: n,
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "label",
        vars: a,
        varsResolver: zk,
      }),
      b = Jl(),
      C = (b == null ? void 0 : b.getStyles) || y;
    return S.jsxs(Z, {
      ...C(
        "label",
        b != null && b.getStyles ? { className: o, style: s } : void 0
      ),
      component: c,
      variant: x,
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
          S.jsx("span", {
            ...C("required"),
            "aria-hidden": !0,
            children: " *",
          }),
      ],
    });
  });
ta.classes = jt;
ta.displayName = "@mantine/core/InputLabel";
const Am = {},
  ld = Q((e, t) => {
    const n = W("InputPlaceholder", Am, e),
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
      } = W("InputPlaceholder", Am, n),
      p = de({
        name: ["InputPlaceholder", c],
        props: n,
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        rootSelector: "placeholder",
      });
    return S.jsx(Z, {
      ...p("placeholder"),
      mod: [{ error: !!f }, d],
      component: "span",
      variant: u,
      ref: t,
      ...m,
    });
  });
ld.classes = jt;
ld.displayName = "@mantine/core/InputPlaceholder";
function Ik(e, { hasDescription: t, hasError: n }) {
  const r = e.findIndex((a) => a === "input"),
    o = e[r - 1],
    s = e[r + 1];
  return {
    offsetBottom: (t && s === "description") || (n && s === "error"),
    offsetTop: (t && o === "description") || (n && o === "error"),
  };
}
const Bk = {
    labelElement: "label",
    inputContainer: (e) => e,
    inputWrapperOrder: ["label", "description", "input", "error"],
  },
  Hk = (e, { size: t }) => ({
    label: { "--input-label-size": tt(t), "--input-asterisk-color": void 0 },
    error: {
      "--input-error-size": t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
    description: {
      "--input-description-size":
        t === void 0 ? void 0 : `calc(${tt(t)} - ${z(2)})`,
    },
  }),
  ad = Q((e, t) => {
    const n = W("InputWrapper", Bk, e),
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
        description: x,
        labelProps: v,
        descriptionProps: g,
        errorProps: y,
        labelElement: b,
        children: C,
        withAsterisk: E,
        id: R,
        required: D,
        __stylesApiProps: L,
        mod: T,
        ...M
      } = n,
      B = de({
        name: ["InputWrapper", f],
        props: L || n,
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: Hk,
      }),
      V = { size: c, variant: u, __staticSelector: f },
      F = Bs(R),
      j = typeof E == "boolean" ? E : D,
      P = (y == null ? void 0 : y.id) || `${F}-error`,
      N = (g == null ? void 0 : g.id) || `${F}-description`,
      _ = F,
      k = !!h && typeof h != "boolean",
      $ = !!x,
      O = `${k ? P : ""} ${$ ? N : ""}`,
      I = O.trim().length > 0 ? O.trim() : void 0,
      Y = (v == null ? void 0 : v.id) || `${F}-label`,
      X =
        p &&
        S.jsx(
          ta,
          {
            labelElement: b,
            id: Y,
            htmlFor: _,
            required: j,
            ...V,
            ...v,
            children: p,
          },
          "label"
        ),
      ee =
        $ &&
        S.jsx(
          Zl,
          {
            ...g,
            ...V,
            size: (g == null ? void 0 : g.size) || V.size,
            id: (g == null ? void 0 : g.id) || N,
            children: x,
          },
          "description"
        ),
      ne = S.jsx(w.Fragment, { children: d(C) }, "input"),
      te =
        k &&
        w.createElement(
          ea,
          {
            ...y,
            ...V,
            size: (y == null ? void 0 : y.size) || V.size,
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
    return S.jsx(Lk, {
      value: {
        getStyles: B,
        describedBy: I,
        inputId: _,
        labelId: Y,
        ...Ik(m, { hasDescription: $, hasError: k }),
      },
      children: S.jsx(Z, {
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
ad.classes = jt;
ad.displayName = "@mantine/core/InputWrapper";
const Vk = {
    variant: "default",
    leftSectionPointerEvents: "none",
    rightSectionPointerEvents: "none",
    withAria: !0,
    withErrorStyles: !0,
  },
  Uk = (e, t, n) => ({
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
  Nt = _n((e, t) => {
    const n = W("Input", Vk, e),
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
        leftSectionProps: x,
        leftSectionWidth: v,
        rightSection: g,
        rightSectionProps: y,
        rightSectionWidth: b,
        rightSectionPointerEvents: C,
        leftSectionPointerEvents: E,
        variant: R,
        vars: D,
        pointer: L,
        multiline: T,
        radius: M,
        id: B,
        withAria: V,
        withErrorStyles: F,
        mod: j,
        ...P
      } = n,
      { styleProps: N, rest: _ } = Uf(P),
      k = Jl(),
      $ = {
        offsetBottom: k == null ? void 0 : k.offsetBottom,
        offsetTop: k == null ? void 0 : k.offsetTop,
      },
      O = de({
        name: ["Input", c],
        props: u || n,
        classes: jt,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        stylesCtx: $,
        rootSelector: "wrapper",
        vars: D,
        varsResolver: Uk,
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
    return S.jsxs(Z, {
      ...O("wrapper"),
      ...N,
      ...d,
      mod: [
        {
          error: !!m && F,
          pointer: L,
          disabled: p,
          multiline: T,
          "data-with-right-section": !!g,
          "data-with-left-section": !!h,
        },
        j,
      ],
      variant: R,
      size: f,
      children: [
        h &&
          S.jsx("div", {
            ...x,
            "data-position": "left",
            ...O("section", {
              className: x == null ? void 0 : x.className,
              style: x == null ? void 0 : x.style,
            }),
            children: h,
          }),
        S.jsx(Z, {
          component: "input",
          ..._,
          ...I,
          ref: t,
          required: a,
          mod: { disabled: p, error: !!m && F },
          variant: R,
          ...O("input"),
        }),
        g &&
          S.jsx("div", {
            ...y,
            "data-position": "right",
            ...O("section", {
              className: y == null ? void 0 : y.className,
              style: y == null ? void 0 : y.style,
            }),
            children: g,
          }),
      ],
    });
  });
Nt.classes = jt;
Nt.Wrapper = ad;
Nt.Label = ta;
Nt.Error = ea;
Nt.Description = Zl;
Nt.Placeholder = ld;
Nt.displayName = "@mantine/core/Input";
function Wk(e, t, n) {
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
      descriptionProps: x,
      wrapperProps: v,
      id: g,
      size: y,
      style: b,
      inputContainer: C,
      inputWrapperOrder: E,
      withAsterisk: R,
      variant: D,
      vars: L,
      mod: T,
      ...M
    } = r,
    { styleProps: B, rest: V } = Uf(M),
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
      descriptionProps: x,
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
    ...V,
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
const Yk = { __staticSelector: "InputBase", withAria: !0 },
  ir = _n((e, t) => {
    const { inputProps: n, wrapperProps: r, ...o } = Wk("InputBase", Yk, e);
    return S.jsx(Nt.Wrapper, {
      ...r,
      children: S.jsx(Nt, { ...n, ...o, ref: t }),
    });
  });
ir.classes = { ...Nt.classes, ...Nt.Wrapper.classes };
ir.displayName = "@mantine/core/InputBase";
function xu({ style: e, size: t = 16, ...n }) {
  return S.jsx("svg", {
    viewBox: "0 0 15 15",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: { ...e, width: z(t), height: z(t), display: "block" },
    ...n,
    children: S.jsx("path", {
      d: "M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
xu.displayName = "@mantine/core/AccordionChevron";
var e0 = { root: "m_b6d8b162" };
function Kk(e) {
  if (e === "start") return "start";
  if (e === "end" || e) return "end";
}
const qk = { inherit: !1 },
  Gk = (e, { variant: t, lineClamp: n, gradient: r, size: o, color: s }) => ({
    root: {
      "--text-fz": tt(o),
      "--text-lh": Jx(o),
      "--text-gradient": t === "gradient" ? hu(r, e) : void 0,
      "--text-line-clamp": typeof n == "number" ? n.toString() : void 0,
      "--text-color": s ? pl(s, e) : void 0,
    },
  }),
  yr = _n((e, t) => {
    const n = W("Text", qk, e),
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
        variant: x,
        mod: v,
        size: g,
        ...y
      } = n,
      b = de({
        name: ["Text", c],
        props: n,
        classes: e0,
        className: f,
        style: d,
        classNames: m,
        styles: p,
        unstyled: h,
        vars: u,
        varsResolver: Gk,
      });
    return S.jsx(Z, {
      ...b("root", { focusable: !0 }),
      ref: t,
      component: a ? "span" : "p",
      variant: x,
      mod: [
        {
          "data-truncate": Kk(o),
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
yr.classes = e0;
yr.displayName = "@mantine/core/Text";
function t0(e) {
  return typeof e == "string"
    ? { value: e, label: e }
    : "value" in e && !("label" in e)
    ? { value: e.value, label: e.value, disabled: e.disabled }
    : typeof e == "number"
    ? { value: e.toString(), label: e.toString() }
    : "group" in e
    ? { group: e.group, items: e.items.map((t) => t0(t)) }
    : e;
}
function Xk(e) {
  return e ? e.map((t) => t0(t)) : [];
}
function n0(e) {
  return e.reduce(
    (t, n) => ("group" in n ? { ...t, ...n0(n.items) } : ((t[n.value] = n), t)),
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
const Qk = { error: null },
  Jk = (e, { size: t }) => ({
    chevron: { "--combobox-chevron-size": ze(t, "combobox-chevron-size") },
  }),
  cd = Q((e, t) => {
    const n = W("ComboboxChevron", Qk, e),
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
        varsResolver: Jk,
        rootSelector: "chevron",
      });
    return S.jsx(Z, {
      component: "svg",
      ...d,
      ...m("chevron"),
      size: r,
      viewBox: "0 0 15 15",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      mod: ["combobox-chevron", { error: o }, f],
      ref: t,
      children: S.jsx("path", {
        d: "M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z",
        fill: "currentColor",
        fillRule: "evenodd",
        clipRule: "evenodd",
      }),
    });
  });
cd.classes = mt;
cd.displayName = "@mantine/core/ComboboxChevron";
const [Zk, Lt] = $r("Combobox component was not found in tree"),
  r0 = w.forwardRef(
    ({ size: e, onMouseDown: t, onClick: n, onClear: r, ...o }, s) =>
      S.jsx(Eo, {
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
r0.displayName = "@mantine/core/ComboboxClearButton";
const e_ = {},
  ud = Q((e, t) => {
    const {
        classNames: n,
        styles: r,
        className: o,
        style: s,
        hidden: i,
        ...l
      } = W("ComboboxDropdown", e_, e),
      a = Lt();
    return S.jsx(sr.Dropdown, {
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
ud.classes = mt;
ud.displayName = "@mantine/core/ComboboxDropdown";
const t_ = { refProp: "ref" },
  o0 = Q((e, t) => {
    const { children: n, refProp: r } = W("ComboboxDropdownTarget", t_, e);
    if ((Lt(), !Po(n)))
      throw new Error(
        "Combobox.DropdownTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    return S.jsx(sr.Target, { ref: t, refProp: r, children: n });
  });
o0.displayName = "@mantine/core/ComboboxDropdownTarget";
const n_ = {},
  fd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxEmpty", n_, e),
      a = Lt();
    return S.jsx(Z, {
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
fd.classes = mt;
fd.displayName = "@mantine/core/ComboboxEmpty";
function dd({
  onKeyDown: e,
  withKeyboardNavigation: t,
  withAriaAttributes: n,
  withExpandedAttribute: r,
  targetType: o,
  autoComplete: s,
}) {
  const i = Lt(),
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
const r_ = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  s0 = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxEventsTarget", r_, e);
    if (!Po(n))
      throw new Error(
        "Combobox.EventsTarget component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Lt(),
      f = dd({
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
      [r]: Ot(t, u.store.targetRef, n == null ? void 0 : n.ref),
    });
  });
s0.displayName = "@mantine/core/ComboboxEventsTarget";
const o_ = {},
  pd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxFooter", o_, e),
      a = Lt();
    return S.jsx(Z, {
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
pd.classes = mt;
pd.displayName = "@mantine/core/ComboboxFooter";
const s_ = {},
  md = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        children: l,
        label: a,
        ...c
      } = W("ComboboxGroup", s_, e),
      u = Lt();
    return S.jsxs(Z, {
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
          S.jsx("div", {
            ...u.getStyles("groupLabel", { classNames: n, styles: s }),
            children: a,
          }),
        l,
      ],
    });
  });
md.classes = mt;
md.displayName = "@mantine/core/ComboboxGroup";
const i_ = {},
  hd = Q((e, t) => {
    const {
        classNames: n,
        className: r,
        style: o,
        styles: s,
        vars: i,
        ...l
      } = W("ComboboxHeader", i_, e),
      a = Lt();
    return S.jsx(Z, {
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
hd.classes = mt;
hd.displayName = "@mantine/core/ComboboxHeader";
function i0({ value: e, valuesDivider: t = ",", ...n }) {
  return S.jsx("input", {
    type: "hidden",
    value: Array.isArray(e) ? e.join(t) : e || "",
    ...n,
  });
}
i0.displayName = "@mantine/core/ComboboxHiddenInput";
const l_ = {},
  gd = Q((e, t) => {
    const n = W("ComboboxOption", l_, e),
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
        ...x
      } = n,
      v = Lt(),
      g = w.useId(),
      y = c || g;
    return S.jsx(Z, {
      ...v.getStyles("option", {
        className: o,
        classNames: r,
        styles: i,
        style: s,
      }),
      ...x,
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
gd.classes = mt;
gd.displayName = "@mantine/core/ComboboxOption";
const a_ = {},
  yd = Q((e, t) => {
    const n = W("ComboboxOptions", a_, e),
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
      f = Lt(),
      d = Bs(l);
    return (
      w.useEffect(() => {
        f.store.setListId(d);
      }, [d]),
      S.jsx(Z, {
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
yd.classes = mt;
yd.displayName = "@mantine/core/ComboboxOptions";
const c_ = { withAriaAttributes: !0, withKeyboardNavigation: !0 },
  vd = Q((e, t) => {
    const n = W("ComboboxSearch", c_, e),
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
      d = Lt(),
      m = d.getStyles("search"),
      p = dd({
        targetType: "input",
        withAriaAttributes: l,
        withKeyboardNavigation: c,
        withExpandedAttribute: !1,
        onKeyDown: a,
        autoComplete: "off",
      });
    return S.jsx(Nt, {
      ref: Ot(t, d.store.searchRef),
      classNames: [{ input: m.className }, r],
      styles: [{ input: m.style }, o],
      size: u || d.size,
      ...p,
      ...f,
      __staticSelector: "Combobox",
    });
  });
vd.classes = mt;
vd.displayName = "@mantine/core/ComboboxSearch";
const u_ = {
    refProp: "ref",
    targetType: "input",
    withKeyboardNavigation: !0,
    withAriaAttributes: !0,
    withExpandedAttribute: !1,
    autoComplete: "off",
  },
  l0 = Q((e, t) => {
    const {
      children: n,
      refProp: r,
      withKeyboardNavigation: o,
      withAriaAttributes: s,
      withExpandedAttribute: i,
      targetType: l,
      autoComplete: a,
      ...c
    } = W("ComboboxTarget", u_, e);
    if (!Po(n))
      throw new Error(
        "Combobox.Target component children should be an element or a component that accepts ref. Fragments, strings, numbers and other primitive values are not supported"
      );
    const u = Lt(),
      f = dd({
        targetType: l,
        withAriaAttributes: s,
        withKeyboardNavigation: o,
        withExpandedAttribute: i,
        onKeyDown: n.props.onKeyDown,
        autoComplete: a,
      }),
      d = w.cloneElement(n, { ...f, ...c });
    return S.jsx(sr.Target, { ref: Ot(t, u.store.targetRef), children: d });
  });
l0.displayName = "@mantine/core/ComboboxTarget";
function f_(e, t, n) {
  for (let r = e - 1; r >= 0; r -= 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = t.length - 1; r > -1; r -= 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function d_(e, t, n) {
  for (let r = e + 1; r < t.length; r += 1)
    if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  if (n) {
    for (let r = 0; r < t.length; r += 1)
      if (!t[r].hasAttribute("data-combobox-disabled")) return r;
  }
  return e;
}
function p_(e) {
  for (let t = 0; t < e.length; t += 1)
    if (!e[t].hasAttribute("data-combobox-disabled")) return t;
  return -1;
}
function a0({
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
    x = w.useCallback(
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
        l ? v(P) : x(P);
      },
      [v, x, l]
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
        const N = document.getElementById(c.current),
          _ = N == null ? void 0 : N.querySelectorAll("[data-combobox-option]");
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
        const N = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          _ = Array.from(N).findIndex((k) => k === P);
        return b(_);
      }
      return b(0);
    }, [b]),
    E = w.useCallback(
      () =>
        b(
          d_(
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
          f_(
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
          p_(document.querySelectorAll(`#${c.current} [data-combobox-option]`))
        ),
      [b]
    ),
    L = w.useCallback((P = "selected", N) => {
      h.current = window.setTimeout(() => {
        var $;
        const _ = document.querySelectorAll(
            `#${c.current} [data-combobox-option]`
          ),
          k = Array.from(_).findIndex((O) =>
            O.hasAttribute(`data-combobox-${P}`)
          );
        (u.current = k),
          N != null &&
            N.scrollIntoView &&
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
        N = P == null ? void 0 : P[u.current];
      N == null || N.click();
    }, []),
    B = w.useCallback((P) => {
      c.current = P;
    }, []),
    V = w.useCallback(() => {
      m.current = window.setTimeout(() => f.current.focus(), 0);
    }, []),
    F = w.useCallback(() => {
      p.current = window.setTimeout(() => d.current.focus(), 0);
    }, []),
    j = w.useCallback(() => u.current, []);
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
      openDropdown: x,
      closeDropdown: v,
      toggleDropdown: g,
      selectedOptionIndex: u.current,
      getSelectedOptionIndex: j,
      selectOption: b,
      selectFirstOption: D,
      selectActiveOption: C,
      selectNextOption: E,
      selectPreviousOption: R,
      resetSelectedOption: T,
      updateSelectedOptionIndex: L,
      listId: c.current,
      setListId: B,
      clickSelectedOption: M,
      searchRef: f,
      focusSearchInput: V,
      targetRef: d,
      focusTarget: F,
    }
  );
}
const m_ = {
    keepMounted: !0,
    withinPortal: !0,
    resetSelectionOnOptionHover: !1,
    width: "target",
    transitionProps: { transition: "fade", duration: 0 },
  },
  h_ = (e, { size: t, dropdownPadding: n }) => ({
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
  const t = W("Combobox", m_, e),
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
    x = a0(),
    v = i || x,
    g = de({
      name: m || "Combobox",
      classes: mt,
      props: t,
      classNames: n,
      styles: r,
      unstyled: o,
      vars: l,
      varsResolver: h_,
    }),
    y = () => {
      c == null || c(), v.closeDropdown();
    };
  return S.jsx(Zk, {
    value: {
      getStyles: g,
      store: v,
      onOptionSubmit: a,
      size: u,
      resetSelectionOnOptionHover: d,
      readOnly: p,
    },
    children: S.jsx(sr, {
      opened: v.dropdownOpened,
      ...h,
      onClose: y,
      withRoles: !1,
      unstyled: o,
      children: s,
    }),
  });
}
const g_ = (e) => e;
he.extend = g_;
he.classes = mt;
he.displayName = "@mantine/core/Combobox";
he.Target = l0;
he.Dropdown = ud;
he.Options = yd;
he.Option = gd;
he.Search = vd;
he.Empty = fd;
he.Chevron = cd;
he.Footer = pd;
he.Header = hd;
he.EventsTarget = s0;
he.DropdownTarget = o0;
he.Group = md;
he.ClearButton = r0;
he.HiddenInput = i0;
function y_({ size: e, style: t, ...n }) {
  const r = e !== void 0 ? { width: z(e), height: z(e), ...t } : t;
  return S.jsx("svg", {
    viewBox: "0 0 10 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    style: r,
    "aria-hidden": !0,
    ...n,
    children: S.jsx("path", {
      d: "M4 4.586L1.707 2.293A1 1 0 1 0 .293 3.707l3 3a.997.997 0 0 0 1.414 0l5-5A1 1 0 1 0 8.293.293L4 4.586z",
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
    }),
  });
}
function Ns(e) {
  return "group" in e;
}
function c0({ options: e, search: t, limit: n }) {
  const r = t.trim().toLowerCase(),
    o = [];
  for (let s = 0; s < e.length; s += 1) {
    const i = e[s];
    if (o.length === n) return o;
    Ns(i) &&
      o.push({
        group: i.group,
        items: c0({ options: i.items, search: t, limit: n - o.length }),
      }),
      Ns(i) || (i.label.toLowerCase().includes(r) && o.push(i));
  }
  return o;
}
function v_(e) {
  if (e.length === 0) return !0;
  for (const t of e) if (!("group" in t) || t.items.length > 0) return !1;
  return !0;
}
function u0(e, t = new Set()) {
  if (Array.isArray(e))
    for (const n of e)
      if (Ns(n)) u0(n.items, t);
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
function w_(e, t) {
  return Array.isArray(e) ? e.includes(t) : e === t;
}
function f0({
  data: e,
  withCheckIcon: t,
  value: n,
  checkIconPosition: r,
  unstyled: o,
  renderOption: s,
}) {
  if (!Ns(e)) {
    const l = w_(n, e.value),
      a = t && l && S.jsx(y_, { className: mt.optionsDropdownCheckIcon }),
      c = S.jsxs(S.Fragment, {
        children: [
          r === "left" && a,
          S.jsx("span", { children: e.label }),
          r === "right" && a,
        ],
      });
    return S.jsx(he.Option, {
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
    S.jsx(
      f0,
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
  return S.jsx(he.Group, { label: e.group, children: i });
}
function S_({
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
  scrollAreaProps: x,
  "aria-label": v,
}) {
  u0(e);
  const y =
      typeof o == "string"
        ? (r || c0)({ options: e, search: a ? o : "", limit: s ?? 1 / 0 })
        : e,
    b = v_(y),
    C = y.map((E) =>
      S.jsx(
        f0,
        {
          data: E,
          withCheckIcon: c,
          value: u,
          checkIconPosition: f,
          unstyled: m,
          renderOption: h,
        },
        Ns(E) ? E.group : E.value
      )
    );
  return S.jsx(he.Dropdown, {
    hidden: t || (n && b),
    children: S.jsxs(he.Options, {
      labelledBy: p,
      "aria-label": v,
      children: [
        l
          ? S.jsx(Us.Autosize, {
              mah: i ?? 220,
              type: "scroll",
              scrollbarSize: "var(--combobox-padding)",
              offsetScrollbars: "y",
              ...x,
              children: C,
            })
          : C,
        b && d && S.jsx(he.Empty, { children: d }),
      ],
    }),
  });
}
var na = {
  root: "m_77c9d27d",
  inner: "m_80f1301b",
  label: "m_811560b9",
  section: "m_a74036a",
  loader: "m_a25b86ee",
  group: "m_80d6d844",
};
const Fm = { orientation: "horizontal" },
  x_ = (e, { borderWidth: t }) => ({
    group: { "--button-border-width": z(t) },
  }),
  wd = Q((e, t) => {
    const n = W("ButtonGroup", Fm, e),
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
      } = W("ButtonGroup", Fm, e),
      p = de({
        name: "ButtonGroup",
        props: n,
        classes: na,
        className: r,
        style: o,
        classNames: s,
        styles: i,
        unstyled: l,
        vars: c,
        varsResolver: x_,
        rootSelector: "group",
      });
    return S.jsx(Z, {
      ...p("group"),
      ref: t,
      variant: f,
      mod: [{ "data-orientation": a }, d],
      role: "group",
      ...m,
    });
  });
wd.classes = na;
wd.displayName = "@mantine/core/ButtonGroup";
const b_ = {
    in: { opacity: 1, transform: `translate(-50%, calc(-50% + ${z(1)}))` },
    out: { opacity: 0, transform: "translate(-50%, -200%)" },
    common: { transformOrigin: "center" },
    transitionProperty: "transform, opacity",
  },
  C_ = {},
  E_ = (
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
  rn = _n((e, t) => {
    const n = W("Button", C_, e),
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
        gradient: x,
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
        classes: na,
        className: s,
        style: r,
        classNames: v,
        styles: g,
        unstyled: y,
        vars: o,
        varsResolver: E_,
      }),
      L = !!c,
      T = !!u;
    return S.jsxs(wn, {
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
          "with-left-section": L,
          "with-right-section": T,
        },
        E,
      ],
      ...R,
      children: [
        S.jsx(Oo, {
          mounted: !!p,
          transition: b_,
          duration: 150,
          children: (M) =>
            S.jsx(Z, {
              component: "span",
              ...D("loader", { style: M }),
              "aria-hidden": !0,
              children: S.jsx(Ys, {
                color: "var(--button-color)",
                size: "calc(var(--button-height) / 1.8)",
                ...h,
              }),
            }),
        }),
        S.jsxs("span", {
          ...D("inner"),
          children: [
            c &&
              S.jsx(Z, {
                component: "span",
                ...D("section"),
                mod: { position: "left" },
                children: c,
              }),
            S.jsx(Z, {
              component: "span",
              mod: { loading: p },
              ...D("label"),
              children: a,
            }),
            u &&
              S.jsx(Z, {
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
rn.classes = na;
rn.displayName = "@mantine/core/Button";
rn.Group = wd;
var d0 = { root: "m_4451eb3a" };
const k_ = {},
  Sd = _n((e, t) => {
    const n = W("Center", k_, e),
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
        classes: d0,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
      });
    return S.jsx(Z, { ref: t, mod: [{ inline: c }, u], ...d("root"), ...f });
  });
Sd.classes = d0;
Sd.displayName = "@mantine/core/Center";
function bu() {
  return (
    (bu = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    bu.apply(this, arguments)
  );
}
function __(e, t) {
  if (e == null) return {};
  var n = {};
  for (var r in e)
    if (Object.prototype.hasOwnProperty.call(e, r)) {
      if (t.indexOf(r) >= 0) continue;
      n[r] = e[r];
    }
  return n;
}
var R_ = w.useLayoutEffect,
  D_ = function (t) {
    var n = w.useRef(t);
    return (
      R_(function () {
        n.current = t;
      }),
      n
    );
  },
  Mm = function (t, n) {
    if (typeof t == "function") {
      t(n);
      return;
    }
    t.current = n;
  },
  P_ = function (t, n) {
    var r = w.useRef();
    return w.useCallback(
      function (o) {
        (t.current = o),
          r.current && Mm(r.current, null),
          (r.current = n),
          n && Mm(n, o);
      },
      [n]
    );
  },
  zm = {
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
  T_ = function (t) {
    Object.keys(zm).forEach(function (n) {
      t.style.setProperty(n, zm[n], "important");
    });
  },
  Im = T_,
  Qe = null,
  Bm = function (t, n) {
    var r = t.scrollHeight;
    return n.sizingStyle.boxSizing === "border-box"
      ? r + n.borderSize
      : r - n.paddingSize;
  };
function N_(e, t, n, r) {
  n === void 0 && (n = 1),
    r === void 0 && (r = 1 / 0),
    Qe ||
      ((Qe = document.createElement("textarea")),
      Qe.setAttribute("tabindex", "-1"),
      Qe.setAttribute("aria-hidden", "true"),
      Im(Qe)),
    Qe.parentNode === null && document.body.appendChild(Qe);
  var o = e.paddingSize,
    s = e.borderSize,
    i = e.sizingStyle,
    l = i.boxSizing;
  Object.keys(i).forEach(function (d) {
    var m = d;
    Qe.style[m] = i[m];
  }),
    Im(Qe),
    (Qe.value = t);
  var a = Bm(Qe, e);
  (Qe.value = t), (a = Bm(Qe, e)), (Qe.value = "x");
  var c = Qe.scrollHeight - o,
    u = c * n;
  l === "border-box" && (u = u + o + s), (a = Math.max(u, a));
  var f = c * r;
  return l === "border-box" && (f = f + o + s), (a = Math.min(f, a)), [a, c];
}
var Hm = function () {},
  O_ = function (t, n) {
    return t.reduce(function (r, o) {
      return (r[o] = n[o]), r;
    }, {});
  },
  $_ = [
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
  j_ = !!document.documentElement.currentStyle,
  L_ = function (t) {
    var n = window.getComputedStyle(t);
    if (n === null) return null;
    var r = O_($_, n),
      o = r.boxSizing;
    if (o === "") return null;
    j_ &&
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
  A_ = L_;
function p0(e, t, n) {
  var r = D_(n);
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
var F_ = function (t) {
    p0(window, "resize", t);
  },
  M_ = function (t) {
    p0(document.fonts, "loadingdone", t);
  },
  z_ = [
    "cacheMeasurements",
    "maxRows",
    "minRows",
    "onChange",
    "onHeightChange",
  ],
  I_ = function (t, n) {
    var r = t.cacheMeasurements,
      o = t.maxRows,
      s = t.minRows,
      i = t.onChange,
      l = i === void 0 ? Hm : i,
      a = t.onHeightChange,
      c = a === void 0 ? Hm : a,
      u = __(t, z_),
      f = u.value !== void 0,
      d = w.useRef(null),
      m = P_(d, n),
      p = w.useRef(0),
      h = w.useRef(),
      x = function () {
        var y = d.current,
          b = r && h.current ? h.current : A_(y);
        if (b) {
          h.current = b;
          var C = N_(b, y.value || y.placeholder || "x", s, o),
            E = C[0],
            R = C[1];
          p.current !== E &&
            ((p.current = E),
            y.style.setProperty("height", E + "px", "important"),
            c(E, { rowHeight: R }));
        }
      },
      v = function (y) {
        f || x(), l(y);
      };
    return (
      w.useLayoutEffect(x),
      F_(x),
      M_(x),
      w.createElement("textarea", bu({}, u, { onChange: v, ref: m }))
    );
  },
  B_ = w.forwardRef(I_);
const H_ = {},
  xd = Q((e, t) => {
    const {
        autosize: n,
        maxRows: r,
        minRows: o,
        __staticSelector: s,
        resize: i,
        ...l
      } = W("Textarea", H_, e),
      a = n && hb() !== "test",
      c = a ? { maxRows: r, minRows: o } : {};
    return S.jsx(ir, {
      component: a ? B_ : "textarea",
      ref: t,
      ...l,
      __staticSelector: s || "Textarea",
      multiline: !0,
      "data-no-overflow": (n && r === void 0) || void 0,
      __vars: { "--input-resize": i },
      ...c,
    });
  });
xd.classes = ir.classes;
xd.displayName = "@mantine/core/Textarea";
var m0 = { root: "m_6e45937b", loader: "m_e8eb006c", overlay: "m_df587f17" };
const Vm = {
    transitionProps: { transition: "fade", duration: 0 },
    overlayProps: { backgroundOpacity: 0.75 },
    zIndex: jr("overlay"),
  },
  V_ = (e, { zIndex: t }) => ({
    root: { "--lo-z-index": t == null ? void 0 : t.toString() },
  }),
  bd = Q((e, t) => {
    const n = W("LoadingOverlay", Vm, e),
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
      h = fn(),
      x = de({
        name: "LoadingOverlay",
        classes: m0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: V_,
      }),
      v = { ...Vm.overlayProps, ...f };
    return S.jsx(Oo, {
      transition: "fade",
      ...c,
      mounted: !!d,
      children: (g) =>
        S.jsxs(Z, {
          ...x("root", { style: g }),
          ref: t,
          ...p,
          children: [
            S.jsx(Ys, { ...x("loader"), unstyled: l, ...u }),
            S.jsx(Ts, {
              ...v,
              ...x("overlay"),
              darkHidden: !0,
              unstyled: l,
              color: (f == null ? void 0 : f.color) || h.white,
            }),
            S.jsx(Ts, {
              ...v,
              ...x("overlay"),
              lightHidden: !0,
              unstyled: l,
              color: (f == null ? void 0 : f.color) || h.colors.dark[5],
            }),
          ],
        }),
    });
  });
bd.classes = m0;
bd.displayName = "@mantine/core/LoadingOverlay";
const [U_, $o] = $r("Modal component was not found in tree");
var Pn = {
  root: "m_9df02822",
  content: "m_54c44539",
  inner: "m_1f958f16",
  header: "m_d0e2b9cd",
};
const W_ = {},
  ra = Q((e, t) => {
    const n = W("ModalBody", W_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return S.jsx(Gv, {
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
ra.classes = Pn;
ra.displayName = "@mantine/core/ModalBody";
const Y_ = {},
  oa = Q((e, t) => {
    const n = W("ModalCloseButton", Y_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return S.jsx(Xv, {
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
oa.classes = Pn;
oa.displayName = "@mantine/core/ModalCloseButton";
const K_ = {},
  sa = Q((e, t) => {
    const n = W("ModalContent", K_, e),
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
      f = u.scrollAreaComponent || jk;
    return S.jsx(Tk, {
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
      children: S.jsx(f, {
        style: {
          maxHeight: u.fullScreen
            ? "100dvh"
            : `calc(100dvh - (${z(u.yOffset)} * 2))`,
        },
        children: a,
      }),
    });
  });
sa.classes = Pn;
sa.displayName = "@mantine/core/ModalContent";
const q_ = {},
  ia = Q((e, t) => {
    const n = W("ModalHeader", q_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return S.jsx(Qv, {
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
ia.classes = Pn;
ia.displayName = "@mantine/core/ModalHeader";
const G_ = {},
  la = Q((e, t) => {
    const n = W("ModalOverlay", G_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return S.jsx(Jv, {
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
la.classes = Pn;
la.displayName = "@mantine/core/ModalOverlay";
const X_ = {
    __staticSelector: "Modal",
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: jr("modal"),
    transitionProps: { duration: 200, transition: "pop" },
    yOffset: "5dvh",
  },
  Q_ = (e, { radius: t, size: n, yOffset: r, xOffset: o }) => ({
    root: {
      "--modal-radius": t === void 0 ? void 0 : or(t),
      "--modal-size": ze(n, "modal-size"),
      "--modal-y-offset": z(r),
      "--modal-x-offset": z(o),
    },
  }),
  aa = Q((e, t) => {
    const n = W("ModalRoot", X_, e),
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
        ...x
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
        varsResolver: Q_,
      });
    return S.jsx(U_, {
      value: {
        yOffset: c,
        scrollAreaComponent: u,
        getStyles: v,
        fullScreen: d,
      },
      children: S.jsx(Dk, {
        ref: t,
        ...v("root"),
        "data-full-screen": d || void 0,
        "data-centered": m || void 0,
        unstyled: l,
        ...x,
      }),
    });
  });
aa.classes = Pn;
aa.displayName = "@mantine/core/ModalRoot";
const J_ = {},
  ca = Q((e, t) => {
    const n = W("ModalTitle", J_, e),
      { classNames: r, className: o, style: s, styles: i, vars: l, ...a } = n,
      c = $o();
    return S.jsx(Zv, {
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
ca.classes = Pn;
ca.displayName = "@mantine/core/ModalTitle";
const Z_ = {
    closeOnClickOutside: !0,
    withinPortal: !0,
    lockScroll: !0,
    trapFocus: !0,
    returnFocus: !0,
    closeOnEscape: !0,
    keepMounted: !1,
    zIndex: jr("modal"),
    transitionProps: { duration: 200, transition: "fade-down" },
    withOverlay: !0,
    withCloseButton: !0,
  },
  Gt = Q((e, t) => {
    const {
        title: n,
        withOverlay: r,
        overlayProps: o,
        withCloseButton: s,
        closeButtonProps: i,
        children: l,
        radius: a,
        ...c
      } = W("Modal", Z_, e),
      u = !!n || s;
    return S.jsxs(aa, {
      ref: t,
      radius: a,
      ...c,
      children: [
        r && S.jsx(la, { ...o }),
        S.jsxs(sa, {
          radius: a,
          children: [
            u &&
              S.jsxs(ia, {
                children: [
                  n && S.jsx(ca, { children: n }),
                  s && S.jsx(oa, { ...i }),
                ],
              }),
            S.jsx(ra, { children: l }),
          ],
        }),
      ],
    });
  });
Gt.classes = Pn;
Gt.displayName = "@mantine/core/Modal";
Gt.Root = aa;
Gt.Overlay = la;
Gt.Content = sa;
Gt.Body = ra;
Gt.Header = ia;
Gt.Title = ca;
Gt.CloseButton = oa;
const eR = {
    searchable: !1,
    withCheckIcon: !0,
    allowDeselect: !0,
    checkIconPosition: "left",
  },
  Cd = Q((e, t) => {
    const n = W("Select", eR, e),
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
        value: x,
        defaultValue: v,
        selectFirstOptionOnChange: g,
        onOptionSubmit: y,
        comboboxProps: b,
        readOnly: C,
        disabled: E,
        filter: R,
        limit: D,
        withScrollArea: L,
        maxDropdownHeight: T,
        size: M,
        searchable: B,
        rightSection: V,
        checkIconPosition: F,
        withCheckIcon: j,
        nothingFoundMessage: P,
        name: N,
        form: _,
        searchValue: k,
        defaultSearchValue: $,
        onSearchChange: O,
        allowDeselect: I,
        error: Y,
        rightSectionPointerEvents: X,
        id: ee,
        clearable: ne,
        clearButtonProps: te,
        hiddenInputProps: me,
        renderOption: oe,
        onClear: le,
        autoComplete: J,
        scrollAreaProps: ye,
        ...ce
      } = n,
      se = w.useMemo(() => Xk(h), [h]),
      Ne = w.useMemo(() => n0(se), [se]),
      Xe = Bs(ee),
      [xe, gt, At] = So({
        value: x,
        defaultValue: v,
        finalValue: null,
        onChange: p,
      }),
      Ie = typeof xe == "string" ? Ne[xe] : void 0,
      [U, re] = So({
        value: k,
        defaultValue: $,
        finalValue: Ie ? Ie.label : "",
        onChange: O,
      }),
      ae = a0({
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
      { resolvedClassNames: ke, resolvedStyles: Le } = Vs({
        props: n,
        styles: o,
        classNames: r,
      });
    w.useEffect(() => {
      g && ae.selectFirstOption();
    }, [g, xe]),
      w.useEffect(() => {
        x === null && re(""), typeof x == "string" && Ie && re(Ie.label);
      }, [x, Ie]);
    const Jt =
      ne &&
      !!xe &&
      !E &&
      !C &&
      S.jsx(he.ClearButton, {
        size: M,
        ...te,
        onClear: () => {
          gt(null, null), re(""), le == null || le();
        },
      });
    return S.jsxs(S.Fragment, {
      children: [
        S.jsxs(he, {
          store: ae,
          __staticSelector: "Select",
          classNames: ke,
          styles: Le,
          unstyled: s,
          readOnly: C,
          onOptionSubmit: (_e) => {
            y == null || y(_e);
            const Ae = I && Ne[_e].value === xe ? null : Ne[_e],
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
            S.jsx(he.Target, {
              targetType: B ? "input" : "button",
              autoComplete: J,
              children: S.jsx(ir, {
                id: Xe,
                ref: t,
                rightSection:
                  V ||
                  Jt ||
                  S.jsx(he.Chevron, { size: M, error: Y, unstyled: s }),
                rightSectionPointerEvents: X || (Jt ? "all" : "none"),
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
                        ((Ae = Ne[xe]) == null ? void 0 : Ae.label)) ||
                        ""
                    ),
                    d == null || d(_e);
                },
                onClick: (_e) => {
                  B ? ae.openDropdown() : ae.toggleDropdown(),
                    m == null || m(_e);
                },
                classNames: ke,
                styles: Le,
                unstyled: s,
                pointer: !B,
                error: Y,
              }),
            }),
            S.jsx(S_, {
              data: se,
              hidden: C || E,
              filter: R,
              search: U,
              limit: D,
              hiddenWhenEmpty: !B || !P,
              withScrollArea: L,
              maxDropdownHeight: T,
              filterOptions: B && (Ie == null ? void 0 : Ie.label) !== U,
              value: xe,
              checkIconPosition: F,
              withCheckIcon: j,
              nothingFoundMessage: P,
              unstyled: s,
              labelId: ce.label ? `${Xe}-label` : void 0,
              "aria-label": ce.label ? void 0 : ce["aria-label"],
              renderOption: oe,
              scrollAreaProps: ye,
            }),
          ],
        }),
        S.jsx(he.HiddenInput, {
          value: xe,
          name: N,
          form: _,
          disabled: E,
          ...me,
        }),
      ],
    });
  });
Cd.classes = { ...ir.classes, ...he.classes };
Cd.displayName = "@mantine/core/Select";
const tR = {},
  Ed = Q((e, t) => {
    const n = W("TextInput", tR, e);
    return S.jsx(ir, {
      component: "input",
      ref: t,
      ...n,
      __staticSelector: "TextInput",
    });
  });
Ed.classes = ir.classes;
Ed.displayName = "@mantine/core/TextInput";
function nR(e) {
  return function ({ isLoading: n, ...r }) {
    return n ? S.jsx("div", { children: "Loading..." }) : S.jsx(e, { ...r });
  };
}
function rR(e) {
  return function ({ error: n, ...r }) {
    return n
      ? S.jsxs("div", { children: ["Error: ", n.message] })
      : S.jsx(e, { ...r });
  };
}
var h0 = { exports: {} },
  oR = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED",
  sR = oR,
  iR = sR;
function g0() {}
function y0() {}
y0.resetWarningCache = g0;
var lR = function () {
  function e(r, o, s, i, l, a) {
    if (a !== iR) {
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
    checkPropTypes: y0,
    resetWarningCache: g0,
  };
  return (n.PropTypes = n), n;
};
h0.exports = lR();
var aR = h0.exports;
const G = Tr(aR);
function cR(e) {
  if (!/^[0-9a-zA-Z-]+$/.test(e))
    throw new Error(
      `[@mantine/use-form] Form name "${e}" is invalid, it should contain only letters, numbers and dashes`
    );
}
const uR = typeof window < "u" ? w.useLayoutEffect : w.useEffect;
function Be(e, t) {
  uR(() => {
    if (e)
      return (
        window.addEventListener(e, t), () => window.removeEventListener(e, t)
      );
  }, [e]);
}
function fR(e, t) {
  e && cR(e),
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
function dR(e) {
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
function Cu(e) {
  return e === null || typeof e != "object"
    ? {}
    : Object.keys(e).reduce((t, n) => {
        const r = e[n];
        return r != null && r !== !1 && (t[n] = r), t;
      }, {});
}
function pR(e) {
  const [t, n] = w.useState(Cu(e)),
    r = w.useCallback((l) => {
      n((a) => Cu(typeof l == "function" ? l(a) : l));
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
function v0(e, t) {
  if (t === null || typeof t != "object") return {};
  const n = { ...t };
  return (
    Object.keys(t).forEach((r) => {
      r.includes(`${String(e)}.`) && delete n[r];
    }),
    n
  );
}
function Um(e, t) {
  const n = e.substring(t.length + 1).split(".")[0];
  return parseInt(n, 10);
}
function Wm(e, t, n, r) {
  if (t === void 0) return n;
  const o = `${String(e)}`;
  let s = n;
  r === -1 && (s = v0(`${o}.${t}`, s));
  const i = { ...s },
    l = new Set();
  return (
    Object.entries(s)
      .filter(([a]) => {
        if (!a.startsWith(`${o}.`)) return !1;
        const c = Um(a, o);
        return Number.isNaN(c) ? !1 : c >= t;
      })
      .forEach(([a, c]) => {
        const u = Um(a, o),
          f = a.replace(`${o}.${u}`, `${o}.${u + r}`);
        (i[f] = c), l.add(f), l.has(a) || delete i[a];
      }),
    i
  );
}
function mR(e, { from: t, to: n }, r) {
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
function Ym(e, t, n) {
  typeof n.value == "object" && (n.value = to(n.value)),
    !n.enumerable ||
    n.get ||
    n.set ||
    !n.configurable ||
    !n.writable ||
    t === "__proto__"
      ? Object.defineProperty(e, t, n)
      : (e[t] = n.value);
}
function to(e) {
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
          o.add(to(i));
        }))
      : s === "[object Map]"
      ? ((o = new Map()),
        e.forEach(function (i, l) {
          o.set(to(l), to(i));
        }))
      : s === "[object Date]"
      ? (o = new Date(+e))
      : s === "[object RegExp]"
      ? (o = new RegExp(e.source, e.flags))
      : s === "[object DataView]"
      ? (o = new e.constructor(to(e.buffer)))
      : s === "[object ArrayBuffer]"
      ? (o = e.slice(0))
      : s.slice(-6) === "Array]" && (o = new e.constructor(e)),
    o)
  ) {
    for (r = Object.getOwnPropertySymbols(e); t < r.length; t++)
      Ym(o, r[t], Object.getOwnPropertyDescriptor(e, r[t]));
    for (t = 0, r = Object.getOwnPropertyNames(e); t < r.length; t++)
      (Object.hasOwnProperty.call(o, (n = r[t])) && o[n] === e[n]) ||
        Ym(o, n, Object.getOwnPropertyDescriptor(e, n));
  }
  return o || e;
}
function w0(e) {
  return typeof e != "string" ? [] : e.split(".");
}
function ct(e, t) {
  const n = w0(e);
  if (n.length === 0 || typeof t != "object" || t === null) return;
  let r = t[n[0]];
  for (let o = 1; o < n.length && r !== void 0; o += 1) r = r[n[o]];
  return r;
}
function ua(e, t, n) {
  const r = w0(e);
  if (r.length === 0) return n;
  const o = to(n);
  if (r.length === 1) return (o[r[0]] = t), o;
  let s = o[r[0]];
  for (let i = 1; i < r.length - 1; i += 1) {
    if (s === void 0) return o;
    s = s[r[i]];
  }
  return (s[r[r.length - 1]] = t), o;
}
function hR(e, { from: t, to: n }, r) {
  const o = ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o],
    i = o[t];
  return s.splice(t, 1), s.splice(n, 0, i), ua(e, s, r);
}
function gR(e, t, n, r) {
  const o = ct(e, r);
  if (!Array.isArray(o)) return r;
  const s = [...o];
  return s.splice(typeof n == "number" ? n : s.length, 0, t), ua(e, s, r);
}
function yR(e, t, n) {
  const r = ct(e, n);
  return Array.isArray(r)
    ? ua(
        e,
        r.filter((o, s) => s !== t),
        n
      )
    : n;
}
function vR({ $values: e, $errors: t, $status: n }) {
  const r = w.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => mR(i, l, a)),
        e.setValues({ values: hR(i, l, e.refValues.current), updateState: !0 });
    }, []),
    o = w.useCallback((i, l) => {
      n.clearFieldDirty(i),
        t.setErrors((a) => Wm(i, l, a, -1)),
        e.setValues({ values: yR(i, l, e.refValues.current), updateState: !0 });
    }, []),
    s = w.useCallback((i, l, a) => {
      n.clearFieldDirty(i),
        t.setErrors((c) => Wm(i, a, c, 1)),
        e.setValues({
          values: gR(i, l, a, e.refValues.current),
          updateState: !0,
        });
    }, []);
  return { reorderListItem: r, removeListItem: o, insertListItem: s };
}
var wR = function e(t, n) {
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
const mc = Tr(wR);
function Si(e, t) {
  const n = Object.keys(e);
  if (typeof t == "string") {
    const r = n.filter((o) => o.startsWith(`${t}.`));
    return e[t] || r.some((o) => e[o]) || !1;
  }
  return n.some((r) => e[r]);
}
function SR({ initialDirty: e, initialTouched: t, mode: n, $values: r }) {
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
      u((R) => (Si(R, C) === E ? R : { ...R, [C]: E }));
    }, []),
    h = w.useCallback((C, E) => {
      f((R) => (Si(R, C) === E ? R : { ...R, [C]: E }));
    }, []),
    x = w.useCallback((C) => Si(a.current, C), []),
    v = w.useCallback(
      (C) =>
        f((E) => {
          if (typeof C != "string") return E;
          const R = v0(C, E);
          return delete R[C], mc(R, E) ? E : R;
        }),
      []
    ),
    g = w.useCallback((C) => {
      if (C) {
        const R = ct(C, c.current);
        if (typeof R == "boolean") return R;
        const D = ct(C, r.refValues.current),
          L = ct(C, r.valuesSnapshot.current);
        return !mc(D, L);
      }
      return Object.keys(c.current).length > 0
        ? Si(c.current)
        : !mc(r.refValues.current, r.valuesSnapshot.current);
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
    isTouched: x,
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
function xR({ initialValues: e, onValuesChange: t, mode: n }) {
  const r = w.useRef(!1),
    [o, s] = w.useState(e || {}),
    i = w.useRef(o),
    l = w.useRef(o),
    a = w.useCallback(
      ({
        values: p,
        subscribers: h,
        updateState: x = !0,
        mergeWithPreviousValues: v = !0,
      }) => {
        const g = i.current,
          y = p instanceof Function ? p(i.current) : p,
          b = v ? { ...g, ...y } : y;
        (i.current = b),
          x && s(b),
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
        x = p.value instanceof Function ? p.value(h) : p.value;
      if (h !== x) {
        const g = i.current,
          y = ua(p.path, x, i.current);
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
function bR({ $status: e }) {
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
function Km(e) {
  const t = Cu(e);
  return { hasErrors: Object.keys(t).length > 0, errors: t };
}
function Eu(e, t, n = "", r = {}) {
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
            ((c = !0), a.forEach((u, f) => Eu(i, t, `${l}.${f}`, o))),
          typeof i == "object" &&
            typeof a == "object" &&
            a !== null &&
            (c || Eu(i, t, l, o)),
          o
        );
      }, r);
}
function ku(e, t) {
  return Km(typeof e == "function" ? e(t) : Eu(e, t));
}
function xi(e, t, n) {
  if (typeof e != "string") return { hasError: !1, error: null };
  const r = ku(t, n),
    o = Object.keys(r.errors).find((s) =>
      e.split(".").every((i, l) => i === s.split(".")[l])
    );
  return { hasError: !!o, error: o ? r.errors[o] : null };
}
const CR = "__MANTINE_FORM_INDEX__";
function qm(e, t) {
  return t
    ? typeof t == "boolean"
      ? t
      : Array.isArray(t)
      ? t.includes(e.replace(/[.][0-9]/g, `.${CR}`))
      : !1
    : !1;
}
function ER({
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
  const m = pR(r),
    p = xR({ initialValues: n, onValuesChange: c, mode: t }),
    h = SR({ initialDirty: o, initialTouched: s, $values: p, mode: t }),
    x = vR({ $values: p, $errors: m, $status: h }),
    v = bR({ $status: h }),
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
      (k, $, O) => {
        const I = qm(k, l);
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
                    const X = xi(k, d, Y.updatedValues);
                    X.hasError
                      ? m.setFieldError(k, X.error)
                      : m.clearFieldError(k);
                  }
                : null,
              (O == null ? void 0 : O.forceUpdate) !== !1 && t !== "controlled"
                ? () => C((Y) => ({ ...Y, [k]: (Y[k] || 0) + 1 }))
                : null,
            ],
          });
      },
      [c, d]
    ),
    L = w.useCallback(
      (k) => {
        const $ = p.refValues.current;
        p.setValues({ values: k, updateState: t === "controlled" }),
          i && m.clearErrors(),
          t === "uncontrolled" && y((O) => O + 1),
          Object.keys(v.subscribers.current).forEach((O) => {
            const I = ct(O, p.refValues.current),
              Y = ct(O, $);
            I !== Y &&
              v
                .getFieldSubscribers(O)
                .forEach((X) =>
                  X({ previousValues: $, updatedValues: p.refValues.current })
                );
          });
      },
      [c, i]
    ),
    T = w.useCallback(() => {
      const k = ku(d, p.refValues.current);
      return m.setErrors(k.errors), k;
    }, [d]),
    M = w.useCallback(
      (k) => {
        const $ = xi(k, d, p.refValues.current);
        return (
          $.hasError ? m.setFieldError(k, $.error) : m.clearFieldError(k), $
        );
      },
      [d]
    ),
    B = (
      k,
      { type: $ = "input", withError: O = !0, withFocus: I = !0, ...Y } = {}
    ) => {
      const ee = { onChange: dR((ne) => D(k, ne, { forceUpdate: !1 })) };
      return (
        O && (ee.error = m.errorsState[k]),
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
            if (qm(k, a)) {
              const ne = xi(k, d, p.refValues.current);
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
                options: { type: $, withError: O, withFocus: I, ...Y },
                form: _,
              })
        )
      );
    },
    V = (k, $) => (O) => {
      O == null || O.preventDefault();
      const I = T();
      I.hasErrors
        ? $ == null || $(I.errors, p.refValues.current, O)
        : k == null || k(u(p.refValues.current), O);
    },
    F = (k) => u(k || p.refValues.current),
    j = w.useCallback((k) => {
      k.preventDefault(), E();
    }, []),
    P = w.useCallback(
      (k) =>
        k
          ? !xi(k, d, p.refValues.current).hasError
          : !ku(d, p.refValues.current).hasErrors,
      [d]
    ),
    N = (k) => `${g}-${k}-${b[k] || 0}`,
    _ = {
      watch: v.watch,
      initialized: p.initialized.current,
      values: p.stateValues,
      getValues: p.getValues,
      setInitialValues: p.setValuesSnapshot,
      initialize: R,
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
      reorderListItem: x.reorderListItem,
      insertListItem: x.insertListItem,
      removeListItem: x.removeListItem,
      reset: E,
      validate: T,
      validateField: M,
      getInputProps: B,
      onSubmit: V,
      onReset: j,
      isValid: P,
      getTransformedValues: F,
      key: N,
    };
  return fR(e, _), _;
}
const kd = (e) => {
  const {
    title: t,
    description: n,
    form: r,
    options: o,
    default_value: s,
    field_id: i,
  } = e;
  console.log(o);
  var l = s ? o.map((d) => d.option).filter((d) => d == s) : null;
  const [a, c] = w.useState(l ? l[0] : o[0].option);
  r.setFieldValue(i, a);
  const [u, { toggle: f }] = fl(!1);
  return S.jsxs("div", {
    className: "collapsible-selector-container",
    children: [
      t && S.jsx("label", { children: t }),
      n && S.jsx("label", { children: n }),
      S.jsx("div", {
        className: "container",
        children: S.jsxs("div", {
          className: "multi-select-row row btn-style",
          onClick: f,
          children: [
            S.jsxs("p", {
              className: "col my-2 row-title",
              children: [S.jsx("i", { class: "fa fa-balance-scale mr-2" }), a],
            }),
            S.jsx("p", {
              className: "clickable-text col-auto text-right my-2",
              children: "change",
            }),
          ],
        }),
      }),
      S.jsx(hv, {
        className: "container",
        in: u,
        transitionDuration: 100,
        transitionTimingFunction: "linear",
        children: o.map((d) => {
          console.log(d);
          const [m, { open: p, close: h }] = fl(!1),
            x = function () {
              c(d.option);
            };
          return S.jsxs("div", {
            className: "multi-select-row row clickable-row",
            children: [
              S.jsx("p", {
                className: "col my-2 row-title",
                onClick: x,
                children: d.option,
              }),
              (d.description || d.help_link) &&
                S.jsxs(S.Fragment, {
                  children: [
                    S.jsxs(Gt, {
                      opened: m,
                      onClose: h,
                      title: d.option,
                      centered: !0,
                      size: "auto",
                      children: [
                        S.jsx("div", {
                          className: "modal-dialog-body",
                          children:
                            d.description &&
                            S.jsx(yr, { children: d.description }),
                        }),
                        S.jsxs("div", {
                          className: "modal-dialog-footer container p-0",
                          children: [
                            d.help_link &&
                              S.jsx("div", {
                                className: "row",
                                children: S.jsx("div", {
                                  className: "col-12",
                                  children: S.jsx("a", {
                                    href: d.help_link,
                                    className:
                                      "btn btn-light-blue-inverted btn-block",
                                    children: "More detail",
                                  }),
                                }),
                              }),
                            S.jsx("div", {
                              className: "row",
                              children: S.jsx("div", {
                                className: "col-12",
                                children: S.jsx("p", {
                                  className:
                                    "btn btn-light-blue-inverted btn-block",
                                  onClick: () => {
                                    x(), h();
                                  },
                                  children: "Choose this",
                                }),
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                    S.jsx("div", {
                      className: "col-auto clickable-text",
                      onClick: p,
                      children: S.jsx("p", {
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
kd.defaultProps = {};
kd.propTypes = {
  title: G.string.isRequired,
  description: G.string.isRequired,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
};
const kR = new Map([
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
function Ks(e, t) {
  const n = _R(e);
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
function _R(e) {
  const { name: t } = e;
  if (t && t.lastIndexOf(".") !== -1 && !e.type) {
    const r = t.split(".").pop().toLowerCase(),
      o = kR.get(r);
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
var jo = (e, t, n) =>
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
const RR = [".DS_Store", "Thumbs.db"];
function DR(e) {
  return jo(this, null, function* () {
    return vl(e) && PR(e.dataTransfer)
      ? $R(e.dataTransfer, e.type)
      : TR(e)
      ? NR(e)
      : Array.isArray(e) &&
        e.every((t) => "getFile" in t && typeof t.getFile == "function")
      ? OR(e)
      : [];
  });
}
function PR(e) {
  return vl(e);
}
function TR(e) {
  return vl(e) && vl(e.target);
}
function vl(e) {
  return typeof e == "object" && e !== null;
}
function NR(e) {
  return _u(e.target.files).map((t) => Ks(t));
}
function OR(e) {
  return jo(this, null, function* () {
    return (yield Promise.all(e.map((n) => n.getFile()))).map((n) => Ks(n));
  });
}
function $R(e, t) {
  return jo(this, null, function* () {
    if (e.items) {
      const n = _u(e.items).filter((o) => o.kind === "file");
      if (t !== "drop") return n;
      const r = yield Promise.all(n.map(jR));
      return Gm(S0(r));
    }
    return Gm(_u(e.files).map((n) => Ks(n)));
  });
}
function Gm(e) {
  return e.filter((t) => RR.indexOf(t.name) === -1);
}
function _u(e) {
  if (e === null) return [];
  const t = [];
  for (let n = 0; n < e.length; n++) {
    const r = e[n];
    t.push(r);
  }
  return t;
}
function jR(e) {
  if (typeof e.webkitGetAsEntry != "function") return Xm(e);
  const t = e.webkitGetAsEntry();
  return t && t.isDirectory ? x0(t) : Xm(e);
}
function S0(e) {
  return e.reduce((t, n) => [...t, ...(Array.isArray(n) ? S0(n) : [n])], []);
}
function Xm(e) {
  const t = e.getAsFile();
  if (!t) return Promise.reject(`${e} is not a File`);
  const n = Ks(t);
  return Promise.resolve(n);
}
function LR(e) {
  return jo(this, null, function* () {
    return e.isDirectory ? x0(e) : AR(e);
  });
}
function x0(e) {
  const t = e.createReader();
  return new Promise((n, r) => {
    const o = [];
    function s() {
      t.readEntries(
        (i) =>
          jo(this, null, function* () {
            if (i.length) {
              const l = Promise.all(i.map(LR));
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
function AR(e) {
  return jo(this, null, function* () {
    return new Promise((t, n) => {
      e.file(
        (r) => {
          const o = Ks(r, e.fullPath);
          t(o);
        },
        (r) => {
          n(r);
        }
      );
    });
  });
}
function FR(e, t) {
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
var MR = Object.defineProperty,
  zR = Object.defineProperties,
  IR = Object.getOwnPropertyDescriptors,
  Qm = Object.getOwnPropertySymbols,
  BR = Object.prototype.hasOwnProperty,
  HR = Object.prototype.propertyIsEnumerable,
  Jm = (e, t, n) =>
    t in e
      ? MR(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  VR = (e, t) => {
    for (var n in t || (t = {})) BR.call(t, n) && Jm(e, n, t[n]);
    if (Qm) for (var n of Qm(t)) HR.call(t, n) && Jm(e, n, t[n]);
    return e;
  },
  UR = (e, t) => zR(e, IR(t));
const WR = "file-invalid-type",
  YR = "file-too-large",
  KR = "file-too-small",
  qR = "too-many-files",
  GR = (e) => {
    e = Array.isArray(e) && e.length === 1 ? e[0] : e;
    const t = Array.isArray(e) ? `one of ${e.join(", ")}` : e;
    return { code: WR, message: `File type must be ${t}` };
  },
  Zm = (e) => ({
    code: YR,
    message: `File is larger than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  eh = (e) => ({
    code: KR,
    message: `File is smaller than ${e} ${e === 1 ? "byte" : "bytes"}`,
  }),
  XR = { code: qR, message: "Too many files" };
function b0(e, t) {
  const n = e.type === "application/x-moz-file" || FR(e, t);
  return [n, n ? null : GR(t)];
}
function C0(e, t, n) {
  if (pr(e.size))
    if (pr(t) && pr(n)) {
      if (e.size > n) return [!1, Zm(n)];
      if (e.size < t) return [!1, eh(t)];
    } else {
      if (pr(t) && e.size < t) return [!1, eh(t)];
      if (pr(n) && e.size > n) return [!1, Zm(n)];
    }
  return [!0, null];
}
function pr(e) {
  return e != null;
}
function QR({
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
        const [a] = b0(l, t),
          [c] = C0(l, n, r),
          u = i ? i(l) : null;
        return a && c && !u;
      });
}
function wl(e) {
  return typeof e.isPropagationStopped == "function"
    ? e.isPropagationStopped()
    : typeof e.cancelBubble < "u"
    ? e.cancelBubble
    : !1;
}
function bi(e) {
  return e.dataTransfer
    ? Array.prototype.some.call(
        e.dataTransfer.types,
        (t) => t === "Files" || t === "application/x-moz-file"
      )
    : !!e.target && !!e.target.files;
}
function th(e) {
  e.preventDefault();
}
function JR(e) {
  return e.indexOf("MSIE") !== -1 || e.indexOf("Trident/") !== -1;
}
function ZR(e) {
  return e.indexOf("Edge/") !== -1;
}
function eD(e = window.navigator.userAgent) {
  return JR(e) || ZR(e);
}
function en(...e) {
  return (t, ...n) => e.some((r) => (!wl(t) && r && r(t, ...n), wl(t)));
}
function tD() {
  return "showOpenFilePicker" in window;
}
function nD(e) {
  return pr(e)
    ? [
        {
          description: "Files",
          accept: Object.entries(e)
            .filter(([n, r]) => {
              let o = !0;
              return (
                E0(n) ||
                  (console.warn(
                    `Skipped "${n}" because it is not a valid MIME type. Check https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types for a list of valid MIME types.`
                  ),
                  (o = !1)),
                (!Array.isArray(r) || !r.every(k0)) &&
                  (console.warn(
                    `Skipped "${n}" because an invalid file extension was provided.`
                  ),
                  (o = !1)),
                o
              );
            })
            .reduce((n, [r, o]) => UR(VR({}, n), { [r]: o }), {}),
        },
      ]
    : e;
}
function rD(e) {
  if (pr(e))
    return Object.entries(e)
      .reduce((t, [n, r]) => [...t, n, ...r], [])
      .filter((t) => E0(t) || k0(t))
      .join(",");
}
function oD(e) {
  return (
    e instanceof DOMException &&
    (e.name === "AbortError" || e.code === e.ABORT_ERR)
  );
}
function sD(e) {
  return (
    e instanceof DOMException &&
    (e.name === "SecurityError" || e.code === e.SECURITY_ERR)
  );
}
function E0(e) {
  return (
    e === "audio/*" ||
    e === "video/*" ||
    e === "image/*" ||
    e === "text/*" ||
    /\w+\/[-+.\w]+/g.test(e)
  );
}
function k0(e) {
  return /^.*\.[\w]+$/.test(e);
}
var iD = Object.defineProperty,
  lD = Object.defineProperties,
  aD = Object.getOwnPropertyDescriptors,
  Sl = Object.getOwnPropertySymbols,
  _0 = Object.prototype.hasOwnProperty,
  R0 = Object.prototype.propertyIsEnumerable,
  nh = (e, t, n) =>
    t in e
      ? iD(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n })
      : (e[t] = n),
  Ze = (e, t) => {
    for (var n in t || (t = {})) _0.call(t, n) && nh(e, n, t[n]);
    if (Sl) for (var n of Sl(t)) R0.call(t, n) && nh(e, n, t[n]);
    return e;
  },
  An = (e, t) => lD(e, aD(t)),
  xl = (e, t) => {
    var n = {};
    for (var r in e) _0.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
    if (e != null && Sl)
      for (var r of Sl(e)) t.indexOf(r) < 0 && R0.call(e, r) && (n[r] = e[r]);
    return n;
  };
const _d = w.forwardRef((e, t) => {
  var n = e,
    { children: r } = n,
    o = xl(n, ["children"]);
  const s = P0(o),
    { open: i } = s,
    l = xl(s, ["open"]);
  return (
    w.useImperativeHandle(t, () => ({ open: i }), [i]),
    Dl.createElement(w.Fragment, null, r(An(Ze({}, l), { open: i })))
  );
});
_d.displayName = "Dropzone";
const D0 = {
  disabled: !1,
  getFilesFromEvent: DR,
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
_d.defaultProps = D0;
_d.propTypes = {
  children: G.func,
  accept: G.objectOf(G.arrayOf(G.string)),
  multiple: G.bool,
  preventDropOnDocument: G.bool,
  noClick: G.bool,
  noKeyboard: G.bool,
  noDrag: G.bool,
  noDragEventsBubbling: G.bool,
  minSize: G.number,
  maxSize: G.number,
  maxFiles: G.number,
  disabled: G.bool,
  getFilesFromEvent: G.func,
  onFileDialogCancel: G.func,
  onFileDialogOpen: G.func,
  useFsAccessApi: G.bool,
  autoFocus: G.bool,
  onDragEnter: G.func,
  onDragLeave: G.func,
  onDragOver: G.func,
  onDrop: G.func,
  onDropAccepted: G.func,
  onDropRejected: G.func,
  onError: G.func,
  validator: G.func,
};
const Ru = {
  isFocused: !1,
  isFileDialogActive: !1,
  isDragActive: !1,
  isDragAccept: !1,
  isDragReject: !1,
  acceptedFiles: [],
  fileRejections: [],
};
function P0(e = {}) {
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
      useFsAccessApi: x,
      autoFocus: v,
      preventDropOnDocument: g,
      noClick: y,
      noKeyboard: b,
      noDrag: C,
      noDragEventsBubbling: E,
      onError: R,
      validator: D,
    } = Ze(Ze({}, D0), e),
    L = w.useMemo(() => rD(t), [t]),
    T = w.useMemo(() => nD(t), [t]),
    M = w.useMemo(() => (typeof h == "function" ? h : rh), [h]),
    B = w.useMemo(() => (typeof p == "function" ? p : rh), [p]),
    V = w.useRef(null),
    F = w.useRef(null),
    [j, P] = w.useReducer(cD, Ru),
    { isFocused: N, isFileDialogActive: _ } = j,
    k = w.useRef(typeof window < "u" && window.isSecureContext && x && tD()),
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
  const O = w.useRef([]),
    I = (U) => {
      (V.current && V.current.contains(U.target)) ||
        (U.preventDefault(), (O.current = []));
    };
  w.useEffect(
    () => (
      g &&
        (document.addEventListener("dragover", th, !1),
        document.addEventListener("drop", I, !1)),
      () => {
        g &&
          (document.removeEventListener("dragover", th),
          document.removeEventListener("drop", I));
      }
    ),
    [V, g]
  ),
    w.useEffect(
      () => (!n && v && V.current && V.current.focus(), () => {}),
      [V, v, n]
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
          (O.current = [...O.current, U.target]),
          bi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                if (wl(U) && !E) return;
                const ae = re.length,
                  ke =
                    ae > 0 &&
                    QR({
                      files: re,
                      accept: L,
                      minSize: s,
                      maxSize: o,
                      multiple: i,
                      maxFiles: l,
                      validator: D,
                    }),
                  Le = ae > 0 && !ke;
                P({
                  isDragAccept: ke,
                  isDragReject: Le,
                  isDragActive: !0,
                  type: "setDraggedFiles",
                }),
                  a && a(U);
              })
              .catch((re) => Y(re));
      },
      [r, a, Y, E, L, s, o, i, l, D]
    ),
    ee = w.useCallback(
      (U) => {
        U.preventDefault(), U.persist(), xe(U);
        const re = bi(U);
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
        const re = O.current.filter(
            (ke) => V.current && V.current.contains(ke)
          ),
          ae = re.indexOf(U.target);
        ae !== -1 && re.splice(ae, 1),
          (O.current = re),
          !(re.length > 0) &&
            (P({
              type: "setDraggedFiles",
              isDragActive: !1,
              isDragAccept: !1,
              isDragReject: !1,
            }),
            bi(U) && c && c(U));
      },
      [V, c, E]
    ),
    te = w.useCallback(
      (U, re) => {
        const ae = [],
          ke = [];
        U.forEach((Le) => {
          const [Jt, _e] = b0(Le, L),
            [Ae, Tn] = C0(Le, s, o),
            st = D ? D(Le) : null;
          if (Jt && Ae && !st) ae.push(Le);
          else {
            let dn = [_e, Tn];
            st && (dn = dn.concat(st)),
              ke.push({ file: Le, errors: dn.filter((Fo) => Fo) });
          }
        }),
          ((!i && ae.length > 1) || (i && l >= 1 && ae.length > l)) &&
            (ae.forEach((Le) => {
              ke.push({ file: Le, errors: [XR] });
            }),
            ae.splice(0)),
          P({ acceptedFiles: ae, fileRejections: ke, type: "setFiles" }),
          f && f(ae, ke, re),
          ke.length > 0 && m && m(ke, re),
          ae.length > 0 && d && d(ae, re);
      },
      [P, i, L, s, o, l, f, d, m, D]
    ),
    me = w.useCallback(
      (U) => {
        U.preventDefault(),
          U.persist(),
          xe(U),
          (O.current = []),
          bi(U) &&
            Promise.resolve(r(U))
              .then((re) => {
                (wl(U) && !E) || te(re, U);
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
            oD(re)
              ? (B(re), P({ type: "closeDialog" }))
              : sD(re)
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
    }, [P, M, B, x, te, Y, T, i]),
    le = w.useCallback(
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
    J = w.useCallback(() => {
      P({ type: "focus" });
    }, []),
    ye = w.useCallback(() => {
      P({ type: "blur" });
    }, []),
    ce = w.useCallback(() => {
      y || (eD() ? setTimeout(oe, 0) : oe());
    }, [y, oe]),
    se = (U) => (n ? null : U),
    Ne = (U) => (b ? null : se(U)),
    Xe = (U) => (C ? null : se(U)),
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
              onKeyDown: Le,
              onFocus: Jt,
              onBlur: _e,
              onClick: Ae,
              onDragEnter: Tn,
              onDragOver: st,
              onDragLeave: dn,
              onDrop: Fo,
            } = re,
            Nn = xl(re, [
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
                onKeyDown: Ne(en(Le, le)),
                onFocus: Ne(en(Jt, J)),
                onBlur: Ne(en(_e, ye)),
                onClick: se(en(Ae, ce)),
                onDragEnter: Xe(en(Tn, X)),
                onDragOver: Xe(en(st, ee)),
                onDragLeave: Xe(en(dn, ne)),
                onDrop: Xe(en(Fo, me)),
                role: typeof ke == "string" && ke !== "" ? ke : "presentation",
                [ae]: V,
              },
              !n && !b ? { tabIndex: 0 } : {}
            ),
            Nn
          );
        },
      [V, le, J, ye, ce, X, ee, ne, me, b, C, n]
    ),
    At = w.useCallback((U) => {
      U.stopPropagation();
    }, []),
    Ie = w.useMemo(
      () =>
        (U = {}) => {
          var re = U,
            { refKey: ae = "ref", onChange: ke, onClick: Le } = re,
            Jt = xl(re, ["refKey", "onChange", "onClick"]);
          const _e = {
            accept: L,
            multiple: i,
            type: "file",
            style: { display: "none" },
            onChange: se(en(ke, me)),
            onClick: se(en(Le, At)),
            tabIndex: -1,
            [ae]: F,
          };
          return Ze(Ze({}, _e), Jt);
        },
      [F, t, i, me, n]
    );
  return An(Ze({}, j), {
    isFocused: N && !n,
    getRootProps: gt,
    getInputProps: Ie,
    rootRef: V,
    inputRef: F,
    open: se(oe),
  });
}
function cD(e, t) {
  switch (t.type) {
    case "focus":
      return An(Ze({}, e), { isFocused: !0 });
    case "blur":
      return An(Ze({}, e), { isFocused: !1 });
    case "openDialog":
      return An(Ze({}, Ru), { isFileDialogActive: !0 });
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
      return Ze({}, Ru);
    default:
      return e;
  }
}
function rh() {}
const [uD, fD] = $r("Dropzone component was not found in tree");
function Rd(e) {
  const t = (n) => {
    const { children: r, ...o } = W(`Dropzone${sm(e)}`, {}, n),
      s = fD(),
      i = Po(r) ? r : S.jsx("span", { children: r });
    return s[e] ? w.cloneElement(i, o) : null;
  };
  return (t.displayName = `@mantine/dropzone/${sm(e)}`), t;
}
const dD = Rd("accept"),
  pD = Rd("reject"),
  mD = Rd("idle");
var Os = {
  root: "m_d46a4834",
  inner: "m_b85f7144",
  fullScreen: "m_96f6e9ad",
  dropzone: "m_7946116d",
};
const hD = {
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
  gD = (e, { radius: t, variant: n, acceptColor: r, rejectColor: o }) => {
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
    const n = W("Dropzone", hD, e),
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
        onDropAny: x,
        onDrop: v,
        onReject: g,
        openRef: y,
        name: b,
        maxFiles: C,
        autoFocus: E,
        activateOnClick: R,
        activateOnDrag: D,
        dragEventsBubbling: L,
        activateOnKeyboard: T,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: V,
        onFileDialogCancel: F,
        onFileDialogOpen: j,
        preventDropOnDocument: P,
        useFsAccessApi: N,
        getFilesFromEvent: _,
        validator: k,
        rejectColor: $,
        acceptColor: O,
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
        varsResolver: gD,
      }),
      {
        getRootProps: me,
        getInputProps: oe,
        isDragAccept: le,
        isDragReject: J,
        open: ye,
      } = P0({
        onDrop: x,
        onDropAccepted: v,
        onDropRejected: g,
        disabled: u || f,
        accept: Array.isArray(p)
          ? p.reduce((se, Ne) => ({ ...se, [Ne]: [] }), {})
          : p,
        multiple: d,
        maxSize: m,
        maxFiles: C,
        autoFocus: E,
        noClick: !R,
        noDrag: !D,
        noDragEventsBubbling: !L,
        noKeyboard: !T,
        onDragEnter: M,
        onDragLeave: B,
        onDragOver: V,
        onFileDialogCancel: F,
        onFileDialogOpen: j,
        preventDropOnDocument: P,
        useFsAccessApi: N,
        validator: k,
        ...(_ ? { getFilesFromEvent: _ } : null),
      });
    Mf(y, ye);
    const ce = !le && !J;
    return S.jsx(uD, {
      value: { accept: le, reject: J, idle: ce },
      children: S.jsxs(Z, {
        ...me(),
        ...te("root", { focusable: !0 }),
        ...ne,
        mod: [
          {
            accept: le,
            reject: J,
            idle: ce,
            loading: f,
            "activate-on-click": R,
          },
          ee,
        ],
        children: [
          S.jsx(bd, {
            visible: f,
            overlayProps: { radius: c },
            unstyled: l,
            loaderProps: Y,
          }),
          S.jsx("input", { ...oe(X), name: b }),
          S.jsx("div", {
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
lr.Accept = dD;
lr.Idle = mD;
lr.Reject = pD;
const yD = {
    loading: !1,
    maxSize: 1 / 0,
    activateOnClick: !1,
    activateOnDrag: !0,
    dragEventsBubbling: !0,
    activateOnKeyboard: !0,
    active: !0,
    zIndex: jr("max"),
    withinPortal: !0,
  },
  Dd = Q((e, t) => {
    const n = W("DropzoneFullScreen", yD, e),
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
      x = de({
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
      { resolvedClassNames: v, resolvedStyles: g } = Vs({
        classNames: r,
        styles: i,
        props: n,
      }),
      [y, b] = w.useState(0),
      [C, { open: E, close: R }] = fl(!1),
      D = (T) => {
        var M;
        (M = T.dataTransfer) != null &&
          M.types.includes("Files") &&
          (b((B) => B + 1), E());
      },
      L = () => {
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
            document.addEventListener("dragleave", L, !1),
            () => {
              document.removeEventListener("dragenter", D, !1),
                document.removeEventListener("dragleave", L, !1);
            }
          );
      }, [c]),
      S.jsx(Ql, {
        ...p,
        withinPortal: m,
        children: S.jsx(Z, {
          ...x("fullScreen", {
            style: {
              opacity: C ? 1 : 0,
              pointerEvents: C ? "all" : "none",
              zIndex: d,
            },
          }),
          ref: t,
          children: S.jsx(lr, {
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
Dd.classes = Os;
Dd.displayName = "@mantine/dropzone/DropzoneFullScreen";
lr.FullScreen = Dd;
const Ci = lr,
  Pd = (e) => {
    const { title: t, description: n, form: r, field_id: o } = e,
      [s, i] = w.useState([]);
    r.values.files.map((a, c) =>
      S.jsxs(
        yr,
        {
          children: [
            S.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            S.jsx(Eo, {
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
      S.jsxs(
        yr,
        {
          children: [
            S.jsx("b", { children: a.name }),
            " (",
            (a.size / 1024).toFixed(2),
            " kb)",
            S.jsx(Eo, {
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
    return S.jsxs(S.Fragment, {
      children: [
        S.jsx(Ci, {
          h: 120,
          p: 0,
          multiple: !0,
          onDrop: (a) => {
            r.setFieldValue("files", a), i(a);
          },
          children: S.jsxs(Sd, {
            h: 120,
            children: [
              S.jsx(Ci.Idle, { children: "Drop files here" }),
              S.jsx(Ci.Accept, { children: "Drop files here" }),
              S.jsx(Ci.Reject, { children: "Files are invalid" }),
            ],
          }),
        }),
        r.errors.files &&
          S.jsx(yr, { c: "red", mt: 5, children: r.errors.files }),
        l.length > 0 &&
          S.jsxs(S.Fragment, {
            children: [
              S.jsx(yr, { mb: 5, mt: "md", children: "Selected files:" }),
              l,
            ],
          }),
      ],
    });
  };
Pd.defaultProps = {};
Pd.propTypes = {
  title: G.string.isRequired,
  description: G.string.isRequired,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
};
var T0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(zu, function () {
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
      x =
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
          var j = ["th", "st", "nd", "rd"],
            P = F % 100;
          return "[" + F + (j[(P - 20) % 10] || j[P] || j[0]) + "]";
        },
      },
      y = function (F, j, P) {
        var N = String(F);
        return !N || N.length >= j
          ? F
          : "" + Array(j + 1 - N.length).join(P) + F;
      },
      b = {
        s: y,
        z: function (F) {
          var j = -F.utcOffset(),
            P = Math.abs(j),
            N = Math.floor(P / 60),
            _ = P % 60;
          return (j <= 0 ? "+" : "-") + y(N, 2, "0") + ":" + y(_, 2, "0");
        },
        m: function F(j, P) {
          if (j.date() < P.date()) return -F(P, j);
          var N = 12 * (P.year() - j.year()) + (P.month() - j.month()),
            _ = j.clone().add(N, f),
            k = P - _ < 0,
            $ = j.clone().add(N + (k ? -1 : 1), f);
          return +(-(N + (P - _) / (k ? _ - $ : $ - _)) || 0);
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
      L = function F(j, P, N) {
        var _;
        if (!j) return C;
        if (typeof j == "string") {
          var k = j.toLowerCase();
          E[k] && (_ = k), P && ((E[k] = P), (_ = k));
          var $ = j.split("-");
          if (!_ && $.length > 1) return F($[0]);
        } else {
          var O = j.name;
          (E[O] = j), (_ = O);
        }
        return !N && _ && (C = _), _ || (!N && C);
      },
      T = function (F, j) {
        if (D(F)) return F.clone();
        var P = typeof j == "object" ? j : {};
        return (P.date = F), (P.args = arguments), new B(P);
      },
      M = b;
    (M.l = L),
      (M.i = D),
      (M.w = function (F, j) {
        return T(F, { locale: j.$L, utc: j.$u, x: j.$x, $offset: j.$offset });
      });
    var B = (function () {
        function F(P) {
          (this.$L = L(P.locale, null, !0)),
            this.parse(P),
            (this.$x = this.$x || P.x || {}),
            (this[R] = !0);
        }
        var j = F.prototype;
        return (
          (j.parse = function (P) {
            (this.$d = (function (N) {
              var _ = N.date,
                k = N.utc;
              if (_ === null) return new Date(NaN);
              if (M.u(_)) return new Date();
              if (_ instanceof Date) return new Date(_);
              if (typeof _ == "string" && !/Z$/i.test(_)) {
                var $ = _.match(x);
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
              return new Date(_);
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
          (j.isSame = function (P, N) {
            var _ = T(P);
            return this.startOf(N) <= _ && _ <= this.endOf(N);
          }),
          (j.isAfter = function (P, N) {
            return T(P) < this.startOf(N);
          }),
          (j.isBefore = function (P, N) {
            return this.endOf(N) < T(P);
          }),
          (j.$g = function (P, N, _) {
            return M.u(P) ? this[N] : this.set(_, P);
          }),
          (j.unix = function () {
            return Math.floor(this.valueOf() / 1e3);
          }),
          (j.valueOf = function () {
            return this.$d.getTime();
          }),
          (j.startOf = function (P, N) {
            var _ = this,
              k = !!M.u(N) || N,
              $ = M.p(P),
              O = function (oe, le) {
                var J = M.w(
                  _.$u ? Date.UTC(_.$y, le, oe) : new Date(_.$y, le, oe),
                  _
                );
                return k ? J : J.endOf(c);
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
                return k ? O(1, 0) : O(31, 11);
              case f:
                return k ? O(1, X) : O(0, X + 1);
              case u:
                var te = this.$locale().weekStart || 0,
                  me = (Y < te ? Y + 7 : Y) - te;
                return O(k ? ee - me : ee + (6 - me), X);
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
          (j.$set = function (P, N) {
            var _,
              k = M.p(P),
              $ = "set" + (this.$u ? "UTC" : ""),
              O = ((_ = {}),
              (_[c] = $ + "Date"),
              (_[p] = $ + "Date"),
              (_[f] = $ + "Month"),
              (_[m] = $ + "FullYear"),
              (_[a] = $ + "Hours"),
              (_[l] = $ + "Minutes"),
              (_[i] = $ + "Seconds"),
              (_[s] = $ + "Milliseconds"),
              _)[k],
              I = k === c ? this.$D + (N - this.$W) : N;
            if (k === f || k === m) {
              var Y = this.clone().set(p, 1);
              Y.$d[O](I),
                Y.init(),
                (this.$d = Y.set(p, Math.min(this.$D, Y.daysInMonth())).$d);
            } else O && this.$d[O](I);
            return this.init(), this;
          }),
          (j.set = function (P, N) {
            return this.clone().$set(P, N);
          }),
          (j.get = function (P) {
            return this[M.p(P)]();
          }),
          (j.add = function (P, N) {
            var _,
              k = this;
            P = Number(P);
            var $ = M.p(N),
              O = function (X) {
                var ee = T(k);
                return M.w(ee.date(ee.date() + Math.round(X * P)), k);
              };
            if ($ === f) return this.set(f, this.$M + P);
            if ($ === m) return this.set(m, this.$y + P);
            if ($ === c) return O(1);
            if ($ === u) return O(7);
            var I = ((_ = {}), (_[l] = r), (_[a] = o), (_[i] = n), _)[$] || 1,
              Y = this.$d.getTime() + P * I;
            return M.w(Y, this);
          }),
          (j.subtract = function (P, N) {
            return this.add(-1 * P, N);
          }),
          (j.format = function (P) {
            var N = this,
              _ = this.$locale();
            if (!this.isValid()) return _.invalidDate || h;
            var k = P || "YYYY-MM-DDTHH:mm:ssZ",
              $ = M.z(this),
              O = this.$H,
              I = this.$m,
              Y = this.$M,
              X = _.weekdays,
              ee = _.months,
              ne = _.meridiem,
              te = function (le, J, ye, ce) {
                return (le && (le[J] || le(N, k))) || ye[J].slice(0, ce);
              },
              me = function (le) {
                return M.s(O % 12 || 12, le, "0");
              },
              oe =
                ne ||
                function (le, J, ye) {
                  var ce = le < 12 ? "AM" : "PM";
                  return ye ? ce.toLowerCase() : ce;
                };
            return k.replace(v, function (le, J) {
              return (
                J ||
                (function (ye) {
                  switch (ye) {
                    case "YY":
                      return String(N.$y).slice(-2);
                    case "YYYY":
                      return M.s(N.$y, 4, "0");
                    case "M":
                      return Y + 1;
                    case "MM":
                      return M.s(Y + 1, 2, "0");
                    case "MMM":
                      return te(_.monthsShort, Y, ee, 3);
                    case "MMMM":
                      return te(ee, Y);
                    case "D":
                      return N.$D;
                    case "DD":
                      return M.s(N.$D, 2, "0");
                    case "d":
                      return String(N.$W);
                    case "dd":
                      return te(_.weekdaysMin, N.$W, X, 2);
                    case "ddd":
                      return te(_.weekdaysShort, N.$W, X, 3);
                    case "dddd":
                      return X[N.$W];
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
                      return String(N.$s);
                    case "ss":
                      return M.s(N.$s, 2, "0");
                    case "SSS":
                      return M.s(N.$ms, 3, "0");
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
          (j.diff = function (P, N, _) {
            var k,
              $ = this,
              O = M.p(N),
              I = T(P),
              Y = (I.utcOffset() - this.utcOffset()) * r,
              X = this - I,
              ee = function () {
                return M.m($, I);
              };
            switch (O) {
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
          (j.daysInMonth = function () {
            return this.endOf(f).$D;
          }),
          (j.$locale = function () {
            return E[this.$L];
          }),
          (j.locale = function (P, N) {
            if (!P) return this.$L;
            var _ = this.clone(),
              k = L(P, N, !0);
            return k && (_.$L = k), _;
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
          F
        );
      })(),
      V = B.prototype;
    return (
      (T.prototype = V),
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
        V[F[1]] = function (j) {
          return this.$g(j, F[0], F[1]);
        };
      }),
      (T.extend = function (F, j) {
        return F.$i || (F(j, B, T), (F.$i = !0)), T;
      }),
      (T.locale = L),
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
})(T0);
var vD = T0.exports;
const q = Tr(vD);
function wD({
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
function N0({
  controlsRef: e,
  direction: t,
  levelIndex: n,
  rowIndex: r,
  cellIndex: o,
  size: s,
}) {
  var a, c, u;
  const i = wD({
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
      ? N0({
          controlsRef: e,
          direction: t,
          levelIndex: i.levelIndex,
          cellIndex: i.cellIndex,
          rowIndex: i.rowIndex,
          size: s,
        })
      : l.focus());
}
function SD(e) {
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
function xD(e) {
  var t;
  return (t = e.current) == null
    ? void 0
    : t.map((n) => n.map((r) => r.length));
}
function Td({
  controlsRef: e,
  levelIndex: t,
  rowIndex: n,
  cellIndex: r,
  event: o,
}) {
  const s = SD(o.key);
  if (s) {
    o.preventDefault();
    const i = xD(e);
    N0({
      controlsRef: e,
      direction: s,
      levelIndex: t,
      rowIndex: n,
      cellIndex: r,
      size: i,
    });
  }
}
var O0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(zu, function () {
    var n = { year: 0, month: 1, day: 2, hour: 3, minute: 4, second: 5 },
      r = {};
    return function (o, s, i) {
      var l,
        a = function (d, m, p) {
          p === void 0 && (p = {});
          var h = new Date(d),
            x = (function (v, g) {
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
          return x.formatToParts(h);
        },
        c = function (d, m) {
          for (var p = a(d, m), h = [], x = 0; x < p.length; x += 1) {
            var v = p[x],
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
          x = h.toLocaleString("en-US", { timeZone: d }),
          v = Math.round((h - new Date(x)) / 1e3 / 60),
          g = i(x, { locale: this.$L })
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
            x = p || m || l,
            v = c(+i(), x);
          if (typeof d != "string") return i(d).tz(x);
          var g = (function (E, R, D) {
              var L = E - 60 * R * 1e3,
                T = c(L, D);
              if (R === T) return [L, R];
              var M = c((L -= 60 * (T - R) * 1e3), D);
              return T === M
                ? [L, T]
                : [E - 60 * Math.min(T, M) * 1e3, Math.max(T, M)];
            })(i.utc(d, h).valueOf(), v, x),
            y = g[0],
            b = g[1],
            C = i(y).utcOffset(b);
          return (C.$x.$timezone = x), C;
        }),
        (i.tz.guess = function () {
          return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }),
        (i.tz.setDefault = function (d) {
          l = d;
        });
    };
  });
})(O0);
var bD = O0.exports;
const CD = Tr(bD);
var $0 = { exports: {} };
(function (e, t) {
  (function (n, r) {
    e.exports = r();
  })(zu, function () {
    var n = "minute",
      r = /[+-]\d\d(?::?\d\d)?/g,
      o = /([+-]|\d\d)/g;
    return function (s, i, l) {
      var a = i.prototype;
      (l.utc = function (h) {
        var x = { date: h, utc: !0, args: arguments };
        return new i(x);
      }),
        (a.utc = function (h) {
          var x = l(this.toDate(), { locale: this.$L, utc: !0 });
          return h ? x.add(this.utcOffset(), n) : x;
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
      a.utcOffset = function (h, x) {
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
              L = 60 * +R[1] + +R[2];
            return L === 0 ? 0 : D === "+" ? L : -L;
          })(h)),
          h === null)
        )
          return this;
        var g = Math.abs(h) <= 16 ? 60 * h : h,
          y = this;
        if (x) return (y.$offset = g), (y.$u = h === 0), y;
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
        var x = h || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
        return d.call(this, x);
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
      a.diff = function (h, x, v) {
        if (h && this.$u === h.$u) return p.call(this, h, x, v);
        var g = this.local(),
          y = l(h).local();
        return p.call(g, y, x, v);
      };
    };
  });
})($0);
var ED = $0.exports;
const kD = Tr(ED);
q.extend(kD);
q.extend(CD);
function _D(e, t) {
  return t ? q(e).tz(t).utcOffset() + e.getTimezoneOffset() : 0;
}
const oh = (e, t, n) => {
  if (!e) return null;
  if (!t) return e;
  let r = _D(e, t);
  return n === "remove" && (r *= -1), q(e).add(r, "minutes").toDate();
};
function uo(e, t, n, r) {
  return r || !t
    ? t
    : Array.isArray(t)
    ? t.map((o) => oh(o, n, e))
    : oh(t, n, e);
}
const RD = {
    locale: "en",
    timezone: null,
    firstDayOfWeek: 1,
    weekendDays: [0, 6],
    labelSeparator: "–",
    consistentWeeks: !1,
  },
  DD = w.createContext(RD);
function Xt() {
  const e = w.useContext(DD),
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
var j0 = { day: "m_396ce5cb" };
const PD = {},
  TD = (e, { size: t }) => ({ day: { "--day-size": ze(t, "day-size") } }),
  Nd = Q((e, t) => {
    const n = W("Day", PD, e),
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
        inRange: x,
        firstInRange: v,
        lastInRange: g,
        hidden: y,
        static: b,
        ...C
      } = n,
      E = de({
        name: f || "Day",
        classes: j0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: TD,
        rootSelector: "day",
      }),
      R = Xt();
    return S.jsx(wn, {
      ...E("day", { style: y ? { display: "none" } : void 0 }),
      component: b ? "div" : "button",
      ref: t,
      disabled: u,
      "data-today":
        q(c).isSame(uo("add", new Date(), R.getTimezone()), "day") || void 0,
      "data-hidden": y || void 0,
      "data-disabled": u || void 0,
      "data-weekend": (!u && !m && d) || void 0,
      "data-outside": (!u && m) || void 0,
      "data-selected": (!u && p) || void 0,
      "data-in-range": (x && !u) || void 0,
      "data-first-in-range": (v && !u) || void 0,
      "data-last-in-range": (g && !u) || void 0,
      "data-static": b || void 0,
      unstyled: l,
      ...C,
      children: (h == null ? void 0 : h(c)) || c.getDate(),
    });
  });
Nd.classes = j0;
Nd.displayName = "@mantine/dates/Day";
function ND({ locale: e, format: t = "dd", firstDayOfWeek: n = 1 }) {
  const r = q().day(n),
    o = [];
  for (let s = 0; s < 7; s += 1)
    typeof t == "string"
      ? o.push(q(r).add(s, "days").locale(e).format(t))
      : o.push(t(q(r).add(s, "days").toDate()));
  return o;
}
var L0 = { weekday: "m_18a3eca" };
const OD = {},
  $D = (e, { size: t }) => ({
    weekdaysRow: { "--wr-fz": tt(t), "--wr-spacing": Wl(t) },
  }),
  Od = Q((e, t) => {
    const n = W("WeekdaysRow", OD, e),
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
        classes: L0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: $D,
        rootSelector: "weekdaysRow",
      }),
      x = Xt(),
      v = ND({
        locale: x.getLocale(c),
        format: f,
        firstDayOfWeek: x.getFirstDayOfWeek(u),
      }).map((g, y) => S.jsx(d, { ...h("weekday"), children: g }, y));
    return S.jsx(Z, {
      component: "tr",
      ref: t,
      ...h("weekdaysRow"),
      ...p,
      children: v,
    });
  });
Od.classes = L0;
Od.displayName = "@mantine/dates/WeekdaysRow";
function jD(e, t = 1) {
  const n = new Date(e),
    r = t === 0 ? 6 : t - 1;
  for (; n.getDay() !== r; ) n.setDate(n.getDate() + 1);
  return n;
}
function LD(e, t = 1) {
  const n = new Date(e);
  for (; n.getDay() !== t; ) n.setDate(n.getDate() - 1);
  return n;
}
function AD({ month: e, firstDayOfWeek: t = 1, consistentWeeks: n }) {
  const r = e.getMonth(),
    o = new Date(e.getFullYear(), r, 1),
    s = new Date(e.getFullYear(), e.getMonth() + 1, 0),
    i = jD(s, t),
    l = LD(o, t),
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
function A0(e, t) {
  return e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth();
}
function F0(e, t) {
  return t instanceof Date ? q(e).isAfter(q(t).subtract(1, "day"), "day") : !0;
}
function M0(e, t) {
  return t instanceof Date ? q(e).isBefore(q(t).add(1, "day"), "day") : !0;
}
function FD(e, t, n, r, o, s, i) {
  const l = e.flat().filter((u) => {
      var f;
      return (
        M0(u, n) &&
        F0(u, t) &&
        !(o != null && o(u)) &&
        !((f = r == null ? void 0 : r(u)) != null && f.disabled) &&
        (!s || A0(u, i))
      );
    }),
    a = l.find((u) => {
      var f;
      return (f = r == null ? void 0 : r(u)) == null ? void 0 : f.selected;
    });
  if (a) return a;
  const c = l.find((u) => q().isSame(u, "date"));
  return c || l[0];
}
var z0 = { month: "m_cc9820d3", monthCell: "m_8f457cd5" };
const MD = { withCellSpacing: !0 },
  fa = Q((e, t) => {
    const n = W("Month", MD, e),
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
        excludeDate: x,
        minDate: v,
        maxDate: g,
        renderDay: y,
        hideOutsideDates: b,
        hideWeekdays: C,
        getDayAriaLabel: E,
        static: R,
        __getDayRef: D,
        __onDayKeyDown: L,
        __onDayClick: T,
        __onDayMouseEnter: M,
        __preventFocus: B,
        __stopPropagation: V,
        withCellSpacing: F,
        size: j,
        ...P
      } = n,
      N = de({
        name: c || "Month",
        classes: z0,
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
      k = AD({
        month: m,
        firstDayOfWeek: _.getFirstDayOfWeek(f),
        consistentWeeks: _.consistentWeeks,
      }),
      $ = FD(k, v, g, h, x, b, m),
      { resolvedClassNames: O, resolvedStyles: I } = Vs({
        classNames: r,
        styles: i,
        props: n,
      }),
      Y = k.map((X, ee) => {
        const ne = X.map((te, me) => {
          const oe = !A0(te, m),
            le =
              (E == null ? void 0 : E(te)) ||
              q(te)
                .locale(u || _.locale)
                .format("D MMMM YYYY"),
            J = h == null ? void 0 : h(te),
            ye = q(te).isSame($, "date");
          return S.jsx(
            "td",
            {
              ...N("monthCell"),
              "data-with-spacing": F || void 0,
              children: S.jsx(Nd, {
                __staticSelector: c || "Month",
                classNames: O,
                styles: I,
                unstyled: l,
                "data-mantine-stop-propagation": V || void 0,
                renderDay: y,
                date: te,
                size: j,
                weekend: _.getWeekendDays(p).includes(te.getDay()),
                outside: oe,
                hidden: b ? oe : !1,
                "aria-label": le,
                static: R,
                disabled:
                  (x == null ? void 0 : x(te)) || !M0(te, g) || !F0(te, v),
                ref: (ce) => (D == null ? void 0 : D(ee, me, ce)),
                ...J,
                onKeyDown: (ce) => {
                  var se;
                  (se = J == null ? void 0 : J.onKeyDown) == null ||
                    se.call(J, ce),
                    L == null ||
                      L(ce, { rowIndex: ee, cellIndex: me, date: te });
                },
                onMouseEnter: (ce) => {
                  var se;
                  (se = J == null ? void 0 : J.onMouseEnter) == null ||
                    se.call(J, ce),
                    M == null || M(ce, te);
                },
                onClick: (ce) => {
                  var se;
                  (se = J == null ? void 0 : J.onClick) == null ||
                    se.call(J, ce),
                    T == null || T(ce, te);
                },
                onMouseDown: (ce) => {
                  var se;
                  (se = J == null ? void 0 : J.onMouseDown) == null ||
                    se.call(J, ce),
                    B && ce.preventDefault();
                },
                tabIndex: B || !ye ? -1 : 0,
              }),
            },
            te.toString()
          );
        });
        return S.jsx("tr", { ...N("monthRow"), children: ne }, ee);
      });
    return S.jsxs(Z, {
      component: "table",
      ...N("month"),
      size: j,
      ref: t,
      ...P,
      children: [
        !C &&
          S.jsx("thead", {
            ...N("monthThead"),
            children: S.jsx(Od, {
              __staticSelector: c || "Month",
              locale: u,
              firstDayOfWeek: f,
              weekdayFormat: d,
              size: j,
              classNames: O,
              styles: I,
              unstyled: l,
            }),
          }),
        S.jsx("tbody", { ...N("monthTbody"), children: Y }),
      ],
    });
  });
fa.classes = z0;
fa.displayName = "@mantine/dates/Month";
var I0 = { pickerControl: "m_dc6a3c71" };
const zD = {},
  ID = (e, { size: t }) => ({
    pickerControl: { "--dpc-fz": tt(t), "--dpc-size": ze(t, "dpc-size") },
  }),
  da = Q((e, t) => {
    const n = W("PickerControl", zD, e),
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
      x = de({
        name: d || "PickerControl",
        classes: I0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: ID,
        rootSelector: "pickerControl",
      });
    return S.jsx(wn, {
      ...x("pickerControl"),
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
da.classes = I0;
da.displayName = "@mantine/dates/PickerControl";
function B0(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && q(e).isBefore(t, "year")) || (n && q(e).isAfter(n, "year")));
}
function BD(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !B0(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => q().isSame(l, "year"));
  return i || o[0];
}
function H0(e) {
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
var V0 = { yearsList: "m_9206547b", yearsListCell: "m_c5a19c7d" };
const HD = { yearsListFormat: "YYYY", withCellSpacing: !0 },
  pa = Q((e, t) => {
    const n = W("YearsList", HD, e),
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
        __getControlRef: x,
        __onControlKeyDown: v,
        __onControlClick: g,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: R,
        ...D
      } = n,
      L = de({
        name: h || "YearsList",
        classes: V0,
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
      M = H0(c),
      B = BD(M, d, m, p),
      V = M.map((F, j) => {
        const P = F.map((N, _) => {
          const k = p == null ? void 0 : p(N),
            $ = q(N).isSame(B, "year");
          return S.jsx(
            "td",
            {
              ...L("yearsListCell"),
              "data-with-spacing": E || void 0,
              children: S.jsx(da, {
                ...L("yearsListControl"),
                size: R,
                unstyled: l,
                "data-mantine-stop-propagation": C || void 0,
                disabled: B0(N, d, m),
                ref: (O) => (x == null ? void 0 : x(j, _, O)),
                ...k,
                onKeyDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, O),
                    v == null || v(O, { rowIndex: j, cellIndex: _, date: N });
                },
                onClick: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, O),
                    g == null || g(O, N);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, O),
                    y == null || y(O, N);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: q(N).locale(T.getLocale(f)).format(u),
              }),
            },
            _
          );
        });
        return S.jsx("tr", { ...L("yearsListRow"), children: P }, j);
      });
    return S.jsx(Z, {
      component: "table",
      ref: t,
      size: R,
      ...L("yearsList"),
      ...D,
      children: S.jsx("tbody", { children: V }),
    });
  });
pa.classes = V0;
pa.displayName = "@mantine/dates/YearsList";
function U0(e, t, n) {
  return !t && !n
    ? !1
    : !!((t && q(e).isBefore(t, "month")) || (n && q(e).isAfter(n, "month")));
}
function VD(e, t, n, r) {
  const o = e.flat().filter((l) => {
      var a;
      return (
        !U0(l, t, n) && !((a = r == null ? void 0 : r(l)) != null && a.disabled)
      );
    }),
    s = o.find((l) => {
      var a;
      return (a = r == null ? void 0 : r(l)) == null ? void 0 : a.selected;
    });
  if (s) return s;
  const i = o.find((l) => q().isSame(l, "month"));
  return i || o[0];
}
function UD(e) {
  const t = q(e).startOf("year").toDate(),
    n = [[], [], [], []];
  let r = 0;
  for (let o = 0; o < 4; o += 1)
    for (let s = 0; s < 3; s += 1)
      n[o].push(q(t).add(r, "months").toDate()), (r += 1);
  return n;
}
var W0 = { monthsList: "m_2a6c32d", monthsListCell: "m_fe27622f" };
const WD = { monthsListFormat: "MMM", withCellSpacing: !0 },
  ma = Q((e, t) => {
    const n = W("MonthsList", WD, e),
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
        __getControlRef: x,
        __onControlKeyDown: v,
        __onControlClick: g,
        __onControlMouseEnter: y,
        __preventFocus: b,
        __stopPropagation: C,
        withCellSpacing: E,
        size: R,
        ...D
      } = n,
      L = de({
        name: c || "MonthsList",
        classes: W0,
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
      M = UD(u),
      B = VD(M, m, p, h),
      V = M.map((F, j) => {
        const P = F.map((N, _) => {
          const k = h == null ? void 0 : h(N),
            $ = q(N).isSame(B, "month");
          return S.jsx(
            "td",
            {
              ...L("monthsListCell"),
              "data-with-spacing": E || void 0,
              children: S.jsx(da, {
                ...L("monthsListControl"),
                size: R,
                unstyled: l,
                __staticSelector: c || "MonthsList",
                "data-mantine-stop-propagation": C || void 0,
                disabled: U0(N, m, p),
                ref: (O) => (x == null ? void 0 : x(j, _, O)),
                ...k,
                onKeyDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onKeyDown) == null ||
                    I.call(k, O),
                    v == null || v(O, { rowIndex: j, cellIndex: _, date: N });
                },
                onClick: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onClick) == null || I.call(k, O),
                    g == null || g(O, N);
                },
                onMouseEnter: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseEnter) == null ||
                    I.call(k, O),
                    y == null || y(O, N);
                },
                onMouseDown: (O) => {
                  var I;
                  (I = k == null ? void 0 : k.onMouseDown) == null ||
                    I.call(k, O),
                    b && O.preventDefault();
                },
                tabIndex: b || !$ ? -1 : 0,
                children: q(N).locale(T.getLocale(d)).format(f),
              }),
            },
            _
          );
        });
        return S.jsx("tr", { ...L("monthsListRow"), children: P }, j);
      });
    return S.jsx(Z, {
      component: "table",
      ref: t,
      size: R,
      ...L("monthsList"),
      ...D,
      children: S.jsx("tbody", { children: V }),
    });
  });
ma.classes = W0;
ma.displayName = "@mantine/dates/MonthsList";
var Y0 = {
  calendarHeader: "m_730a79ed",
  calendarHeaderLevel: "m_f6645d97",
  calendarHeaderControl: "m_2351eeb0",
  calendarHeaderControlIcon: "m_367dc749",
};
const YD = {
    nextDisabled: !1,
    previousDisabled: !1,
    hasNextLevel: !0,
    withNext: !0,
    withPrevious: !0,
  },
  KD = (e, { size: t }) => ({
    calendarHeader: {
      "--dch-control-size": ze(t, "dch-control-size"),
      "--dch-fz": tt(t),
    },
  }),
  ar = Q((e, t) => {
    const n = W("CalendarHeader", YD, e),
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
        label: x,
        nextDisabled: v,
        previousDisabled: g,
        hasNextLevel: y,
        levelControlAriaLabel: b,
        withNext: C,
        withPrevious: E,
        __staticSelector: R,
        __preventFocus: D,
        __stopPropagation: L,
        ...T
      } = n,
      M = de({
        name: R || "CalendarHeader",
        classes: Y0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        varsResolver: KD,
        rootSelector: "calendarHeader",
      }),
      B = D ? (V) => V.preventDefault() : void 0;
    return S.jsxs(Z, {
      ...M("calendarHeader"),
      ref: t,
      ...T,
      children: [
        E &&
          S.jsx(wn, {
            ...M("calendarHeaderControl"),
            "data-direction": "previous",
            "aria-label": d,
            onClick: p,
            unstyled: l,
            onMouseDown: B,
            disabled: g,
            "data-disabled": g || void 0,
            tabIndex: D || g ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              u ||
              S.jsx(xu, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "previous",
                size: "45%",
              }),
          }),
        S.jsx(wn, {
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
          children: x,
        }),
        C &&
          S.jsx(wn, {
            ...M("calendarHeaderControl"),
            "data-direction": "next",
            "aria-label": f,
            onClick: m,
            unstyled: l,
            onMouseDown: B,
            disabled: v,
            "data-disabled": v || void 0,
            tabIndex: D || v ? -1 : 0,
            "data-mantine-stop-propagation": L || void 0,
            children:
              c ||
              S.jsx(xu, {
                ...M("calendarHeaderControlIcon"),
                "data-direction": "next",
                size: "45%",
              }),
          }),
      ],
    });
  });
ar.classes = Y0;
ar.displayName = "@mantine/dates/CalendarHeader";
function qD(e) {
  const t = H0(e);
  return [t[0][0], t[3][0]];
}
const GD = { decadeLabelFormat: "YYYY" },
  ha = Q((e, t) => {
    const n = W("DecadeLevel", GD, e),
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
        previousIcon: x,
        nextLabel: v,
        previousLabel: g,
        onNext: y,
        onPrevious: b,
        nextDisabled: C,
        previousDisabled: E,
        levelControlAriaLabel: R,
        withNext: D,
        withPrevious: L,
        decadeLabelFormat: T,
        classNames: M,
        styles: B,
        unstyled: V,
        __staticSelector: F,
        __stopPropagation: j,
        size: P,
        ...N
      } = n,
      _ = Xt(),
      [k, $] = qD(r),
      O = {
        __staticSelector: F || "DecadeLevel",
        classNames: M,
        styles: B,
        unstyled: V,
        size: P,
      },
      I = typeof C == "boolean" ? C : i ? !q($).endOf("year").isBefore(i) : !1,
      Y = typeof E == "boolean" ? E : s ? !q(k).startOf("year").isAfter(s) : !1,
      X = (ee, ne) =>
        q(ee)
          .locale(o || _.locale)
          .format(ne);
    return S.jsxs(Z, {
      "data-decade-level": !0,
      size: P,
      ref: t,
      ...N,
      children: [
        S.jsx(ar, {
          label: typeof T == "function" ? T(k, $) : `${X(k, T)} – ${X($, T)}`,
          __preventFocus: p,
          __stopPropagation: j,
          nextIcon: h,
          previousIcon: x,
          nextLabel: v,
          previousLabel: g,
          onNext: y,
          onPrevious: b,
          nextDisabled: I,
          previousDisabled: Y,
          hasNextLevel: !1,
          levelControlAriaLabel: R,
          withNext: D,
          withPrevious: L,
          ...O,
        }),
        S.jsx(pa, {
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
          __stopPropagation: j,
          withCellSpacing: m,
          ...O,
        }),
      ],
    });
  });
ha.classes = { ...pa.classes, ...ar.classes };
ha.displayName = "@mantine/dates/DecadeLevel";
const XD = { yearLabelFormat: "YYYY" },
  ga = Q((e, t) => {
    const n = W("YearLevel", XD, e),
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
        previousIcon: x,
        nextLabel: v,
        previousLabel: g,
        onNext: y,
        onPrevious: b,
        onLevelClick: C,
        nextDisabled: E,
        previousDisabled: R,
        hasNextLevel: D,
        levelControlAriaLabel: L,
        withNext: T,
        withPrevious: M,
        yearLabelFormat: B,
        __staticSelector: V,
        __stopPropagation: F,
        size: j,
        classNames: P,
        styles: N,
        unstyled: _,
        ...k
      } = n,
      $ = Xt(),
      O = {
        __staticSelector: V || "YearLevel",
        classNames: P,
        styles: N,
        unstyled: _,
        size: j,
      },
      I = typeof E == "boolean" ? E : i ? !q(r).endOf("year").isBefore(i) : !1,
      Y = typeof R == "boolean" ? R : s ? !q(r).startOf("year").isAfter(s) : !1;
    return S.jsxs(Z, {
      "data-year-level": !0,
      size: j,
      ref: t,
      ...k,
      children: [
        S.jsx(ar, {
          label:
            typeof B == "function"
              ? B(r)
              : q(r)
                  .locale(o || $.locale)
                  .format(B),
          __preventFocus: p,
          __stopPropagation: F,
          nextIcon: h,
          previousIcon: x,
          nextLabel: v,
          previousLabel: g,
          onNext: y,
          onPrevious: b,
          onLevelClick: C,
          nextDisabled: I,
          previousDisabled: Y,
          hasNextLevel: D,
          levelControlAriaLabel: L,
          withNext: T,
          withPrevious: M,
          ...O,
        }),
        S.jsx(ma, {
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
          ...O,
        }),
      ],
    });
  });
ga.classes = { ...ar.classes, ...ma.classes };
ga.displayName = "@mantine/dates/YearLevel";
const QD = { monthLabelFormat: "MMMM YYYY" },
  ya = Q((e, t) => {
    const n = W("MonthLevel", QD, e),
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
        __getDayRef: x,
        __onDayKeyDown: v,
        __onDayClick: g,
        __onDayMouseEnter: y,
        withCellSpacing: b,
        __preventFocus: C,
        __stopPropagation: E,
        nextIcon: R,
        previousIcon: D,
        nextLabel: L,
        previousLabel: T,
        onNext: M,
        onPrevious: B,
        onLevelClick: V,
        nextDisabled: F,
        previousDisabled: j,
        hasNextLevel: P,
        levelControlAriaLabel: N,
        withNext: _,
        withPrevious: k,
        monthLabelFormat: $,
        classNames: O,
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
        classNames: O,
        styles: I,
        unstyled: Y,
        size: ee,
      },
      le =
        typeof F == "boolean" ? F : f ? !q(r).endOf("month").isBefore(f) : !1,
      J =
        typeof j == "boolean" ? j : u ? !q(r).startOf("month").isAfter(u) : !1;
    return S.jsxs(Z, {
      "data-month-level": !0,
      size: ee,
      ref: t,
      ...te,
      children: [
        S.jsx(ar, {
          label:
            typeof $ == "function"
              ? $(r)
              : q(r)
                  .locale(o || me.locale)
                  .format($),
          __preventFocus: C,
          __stopPropagation: E,
          nextIcon: R,
          previousIcon: D,
          nextLabel: L,
          previousLabel: T,
          onNext: M,
          onPrevious: B,
          onLevelClick: V,
          nextDisabled: le,
          previousDisabled: J,
          hasNextLevel: P,
          levelControlAriaLabel: N,
          withNext: _,
          withPrevious: k,
          ...oe,
        }),
        S.jsx(fa, {
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
          __getDayRef: x,
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
ya.classes = { ...fa.classes, ...ar.classes };
ya.displayName = "@mantine/dates/MonthLevel";
var K0 = { levelsGroup: "m_30b26e33" };
const JD = {},
  cr = Q((e, t) => {
    const n = W("LevelsGroup", JD, e),
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
        classes: K0,
        props: n,
        className: o,
        style: s,
        classNames: r,
        styles: i,
        unstyled: l,
        vars: a,
        rootSelector: "levelsGroup",
      });
    return S.jsx(Z, { ref: t, ...f("levelsGroup"), ...u });
  });
cr.classes = K0;
cr.displayName = "@mantine/dates/LevelsGroup";
const ZD = { numberOfColumns: 1 },
  va = Q((e, t) => {
    const n = W("DecadeLevelGroup", ZD, e),
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
        previousLabel: x,
        onNext: v,
        onPrevious: g,
        nextDisabled: y,
        previousDisabled: b,
        classNames: C,
        styles: E,
        unstyled: R,
        __staticSelector: D,
        __stopPropagation: L,
        numberOfColumns: T,
        levelControlAriaLabel: M,
        decadeLabelFormat: B,
        size: V,
        vars: F,
        ...j
      } = n,
      P = w.useRef([]),
      N = Array(T)
        .fill(0)
        .map((_, k) => {
          const $ = q(r)
            .add(k * 10, "years")
            .toDate();
          return S.jsx(
            ha,
            {
              size: V,
              yearsListFormat: l,
              decade: $,
              withNext: k === T - 1,
              withPrevious: k === 0,
              decadeLabelFormat: B,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (O, I) =>
                Td({
                  levelIndex: k,
                  rowIndex: I.rowIndex,
                  cellIndex: I.cellIndex,
                  event: O,
                  controlsRef: P,
                }),
              __getControlRef: (O, I, Y) => {
                Array.isArray(P.current[k]) || (P.current[k] = []),
                  Array.isArray(P.current[k][O]) || (P.current[k][O] = []),
                  (P.current[k][O][I] = Y);
              },
              levelControlAriaLabel: typeof M == "function" ? M($) : M,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: d,
              __stopPropagation: L,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: x,
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
    return S.jsx(cr, {
      classNames: C,
      styles: E,
      __staticSelector: D || "DecadeLevelGroup",
      ref: t,
      size: V,
      unstyled: R,
      ...j,
      children: N,
    });
  });
va.classes = { ...cr.classes, ...ha.classes };
va.displayName = "@mantine/dates/DecadeLevelGroup";
const eP = { numberOfColumns: 1 },
  wa = Q((e, t) => {
    const n = W("YearLevelGroup", eP, e),
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
        previousLabel: x,
        onNext: v,
        onPrevious: g,
        onLevelClick: y,
        nextDisabled: b,
        previousDisabled: C,
        hasNextLevel: E,
        classNames: R,
        styles: D,
        unstyled: L,
        __staticSelector: T,
        __stopPropagation: M,
        numberOfColumns: B,
        levelControlAriaLabel: V,
        yearLabelFormat: F,
        size: j,
        vars: P,
        ...N
      } = n,
      _ = w.useRef([]),
      k = Array(B)
        .fill(0)
        .map(($, O) => {
          const I = q(r).add(O, "years").toDate();
          return S.jsx(
            ga,
            {
              size: j,
              monthsListFormat: l,
              year: I,
              withNext: O === B - 1,
              withPrevious: O === 0,
              yearLabelFormat: F,
              __stopPropagation: M,
              __onControlClick: c,
              __onControlMouseEnter: u,
              __onControlKeyDown: (Y, X) =>
                Td({
                  levelIndex: O,
                  rowIndex: X.rowIndex,
                  cellIndex: X.cellIndex,
                  event: Y,
                  controlsRef: _,
                }),
              __getControlRef: (Y, X, ee) => {
                Array.isArray(_.current[O]) || (_.current[O] = []),
                  Array.isArray(_.current[O][Y]) || (_.current[O][Y] = []),
                  (_.current[O][Y][X] = ee);
              },
              levelControlAriaLabel: typeof V == "function" ? V(I) : V,
              locale: o,
              minDate: s,
              maxDate: i,
              __preventFocus: d,
              nextIcon: m,
              previousIcon: p,
              nextLabel: h,
              previousLabel: x,
              onNext: v,
              onPrevious: g,
              onLevelClick: y,
              nextDisabled: b,
              previousDisabled: C,
              hasNextLevel: E,
              getMonthControlProps: a,
              classNames: R,
              styles: D,
              unstyled: L,
              __staticSelector: T || "YearLevelGroup",
              withCellSpacing: f,
            },
            O
          );
        });
    return S.jsx(cr, {
      classNames: R,
      styles: D,
      __staticSelector: T || "YearLevelGroup",
      ref: t,
      size: j,
      unstyled: L,
      ...N,
      children: k,
    });
  });
wa.classes = { ...ga.classes, ...cr.classes };
wa.displayName = "@mantine/dates/YearLevelGroup";
const tP = { numberOfColumns: 1 },
  Sa = Q((e, t) => {
    const n = W("MonthLevelGroup", tP, e),
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
        __onDayClick: x,
        __onDayMouseEnter: v,
        withCellSpacing: g,
        __preventFocus: y,
        nextIcon: b,
        previousIcon: C,
        nextLabel: E,
        previousLabel: R,
        onNext: D,
        onPrevious: L,
        onLevelClick: T,
        nextDisabled: M,
        previousDisabled: B,
        hasNextLevel: V,
        classNames: F,
        styles: j,
        unstyled: P,
        numberOfColumns: N,
        levelControlAriaLabel: _,
        monthLabelFormat: k,
        __staticSelector: $,
        __stopPropagation: O,
        size: I,
        static: Y,
        vars: X,
        ...ee
      } = n,
      ne = w.useRef([]),
      te = Array(N)
        .fill(0)
        .map((me, oe) => {
          const le = q(r).add(oe, "months").toDate();
          return S.jsx(
            ya,
            {
              month: le,
              withNext: oe === N - 1,
              withPrevious: oe === 0,
              monthLabelFormat: k,
              __stopPropagation: O,
              __onDayClick: x,
              __onDayMouseEnter: v,
              __onDayKeyDown: (J, ye) =>
                Td({
                  levelIndex: oe,
                  rowIndex: ye.rowIndex,
                  cellIndex: ye.cellIndex,
                  event: J,
                  controlsRef: ne,
                }),
              __getDayRef: (J, ye, ce) => {
                Array.isArray(ne.current[oe]) || (ne.current[oe] = []),
                  Array.isArray(ne.current[oe][J]) || (ne.current[oe][J] = []),
                  (ne.current[oe][J][ye] = ce);
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
              onPrevious: L,
              onLevelClick: T,
              nextDisabled: M,
              previousDisabled: B,
              hasNextLevel: V,
              classNames: F,
              styles: j,
              unstyled: P,
              __staticSelector: $ || "MonthLevelGroup",
              size: I,
              static: Y,
              withCellSpacing: g,
            },
            oe
          );
        });
    return S.jsx(cr, {
      classNames: F,
      styles: j,
      __staticSelector: $ || "MonthLevelGroup",
      ref: t,
      size: I,
      ...ee,
      children: te,
    });
  });
Sa.classes = { ...cr.classes, ...ya.classes };
Sa.displayName = "@mantine/dates/MonthLevelGroup";
const sh = (e) => (e === "range" ? [null, null] : e === "multiple" ? [] : null);
function q0({
  type: e,
  value: t,
  defaultValue: n,
  onChange: r,
  applyTimezone: o = !0,
}) {
  const s = w.useRef(e),
    i = Xt(),
    [l, a, c] = So({
      value: uo("add", t, i.getTimezone(), !o),
      defaultValue: uo("add", n, i.getTimezone(), !o),
      finalValue: sh(e),
      onChange: (f) => {
        r == null || r(uo("remove", f, i.getTimezone(), !o));
      },
    });
  let u = l;
  return (
    s.current !== e &&
      ((s.current = e), t === void 0 && ((u = n !== void 0 ? n : sh(e)), a(u))),
    [u, a, c]
  );
}
function hc(e, t) {
  return e ? (e === "month" ? 0 : e === "year" ? 1 : 2) : t || 0;
}
function nP(e) {
  return e === 0 ? "month" : e === 1 ? "year" : "decade";
}
function Xo(e, t, n) {
  return nP(Zx(hc(e, 0), hc(t, 0), hc(n, 2)));
}
const rP = {
    maxLevel: "decade",
    minLevel: "month",
    __updateDateOnYearSelect: !0,
    __updateDateOnMonthSelect: !0,
  },
  xa = Q((e, t) => {
    const n = W("Calendar", rP, e),
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
        onMonthSelect: x,
        onYearMouseEnter: v,
        onMonthMouseEnter: g,
        __updateDateOnYearSelect: y,
        __updateDateOnMonthSelect: b,
        firstDayOfWeek: C,
        weekdayFormat: E,
        weekendDays: R,
        getDayProps: D,
        excludeDate: L,
        renderDay: T,
        hideOutsideDates: M,
        hideWeekdays: B,
        getDayAriaLabel: V,
        monthLabelFormat: F,
        nextIcon: j,
        previousIcon: P,
        __onDayClick: N,
        __onDayMouseEnter: _,
        withCellSpacing: k,
        monthsListFormat: $,
        getMonthControlProps: O,
        yearLabelFormat: I,
        yearsListFormat: Y,
        getYearControlProps: X,
        decadeLabelFormat: ee,
        classNames: ne,
        styles: te,
        unstyled: me,
        minDate: oe,
        maxDate: le,
        locale: J,
        __staticSelector: ye,
        size: ce,
        __preventFocus: se,
        __stopPropagation: Ne,
        onNextDecade: Xe,
        onPreviousDecade: xe,
        onNextYear: gt,
        onPreviousYear: At,
        onNextMonth: Ie,
        onPreviousMonth: U,
        static: re,
        __timezoneApplied: ae,
        ...ke
      } = n,
      { resolvedClassNames: Le, resolvedStyles: Jt } = Vs({
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
      [Tn, st] = q0({
        type: "default",
        value: c,
        defaultValue: u,
        onChange: f,
        applyTimezone: !ae,
      }),
      dn = {
        __staticSelector: ye || "Calendar",
        styles: Jt,
        classNames: Le,
        unstyled: me,
        size: ce,
      },
      Fo = Xt(),
      Nn = m || d || 1,
      pn = Tn || uo("add", new Date(), Fo.getTimezone()),
      Tw = () => {
        const Oe = q(pn).add(Nn, "month").toDate();
        Ie == null || Ie(Oe), st(Oe);
      },
      Nw = () => {
        const Oe = q(pn).subtract(Nn, "month").toDate();
        U == null || U(Oe), st(Oe);
      },
      Ow = () => {
        const Oe = q(pn).add(Nn, "year").toDate();
        gt == null || gt(Oe), st(Oe);
      },
      $w = () => {
        const Oe = q(pn).subtract(Nn, "year").toDate();
        At == null || At(Oe), st(Oe);
      },
      jw = () => {
        const Oe = q(pn)
          .add(10 * Nn, "year")
          .toDate();
        Xe == null || Xe(Oe), st(Oe);
      },
      Lw = () => {
        const Oe = q(pn)
          .subtract(10 * Nn, "year")
          .toDate();
        xe == null || xe(Oe), st(Oe);
      };
    return S.jsxs(Z, {
      ref: t,
      size: ce,
      "data-calendar": !0,
      ...ke,
      children: [
        _e === "month" &&
          S.jsx(Sa, {
            month: pn,
            minDate: oe,
            maxDate: le,
            firstDayOfWeek: C,
            weekdayFormat: E,
            weekendDays: R,
            getDayProps: D,
            excludeDate: L,
            renderDay: T,
            hideOutsideDates: M,
            hideWeekdays: B,
            getDayAriaLabel: V,
            onNext: Tw,
            onPrevious: Nw,
            hasNextLevel: o !== "month",
            onLevelClick: () => Ae("year"),
            numberOfColumns: d,
            locale: J,
            levelControlAriaLabel: p == null ? void 0 : p.monthLevelControl,
            nextLabel: p == null ? void 0 : p.nextMonth,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousMonth,
            previousIcon: P,
            monthLabelFormat: F,
            __onDayClick: N,
            __onDayMouseEnter: _,
            __preventFocus: se,
            __stopPropagation: Ne,
            static: re,
            withCellSpacing: k,
            ...dn,
          }),
        _e === "year" &&
          S.jsx(wa, {
            year: pn,
            numberOfColumns: d,
            minDate: oe,
            maxDate: le,
            monthsListFormat: $,
            getMonthControlProps: O,
            locale: J,
            onNext: Ow,
            onPrevious: $w,
            hasNextLevel: o !== "month" && o !== "year",
            onLevelClick: () => Ae("decade"),
            levelControlAriaLabel: p == null ? void 0 : p.yearLevelControl,
            nextLabel: p == null ? void 0 : p.nextYear,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousYear,
            previousIcon: P,
            yearLabelFormat: I,
            __onControlMouseEnter: g,
            __onControlClick: (Oe, Mo) => {
              b && st(Mo), Ae(Xo("month", s, o)), x == null || x(Mo);
            },
            __preventFocus: se,
            __stopPropagation: Ne,
            withCellSpacing: k,
            ...dn,
          }),
        _e === "decade" &&
          S.jsx(va, {
            decade: pn,
            minDate: oe,
            maxDate: le,
            yearsListFormat: Y,
            getYearControlProps: X,
            locale: J,
            onNext: jw,
            onPrevious: Lw,
            numberOfColumns: d,
            nextLabel: p == null ? void 0 : p.nextDecade,
            nextIcon: j,
            previousLabel: p == null ? void 0 : p.previousDecade,
            previousIcon: P,
            decadeLabelFormat: ee,
            __onControlMouseEnter: v,
            __onControlClick: (Oe, Mo) => {
              y && st(Mo), Ae(Xo("year", s, o)), h == null || h(Mo);
            },
            __preventFocus: se,
            __stopPropagation: Ne,
            withCellSpacing: k,
            ...dn,
          }),
      ],
    });
  });
xa.classes = { ...va.classes, ...wa.classes, ...Sa.classes };
xa.displayName = "@mantine/dates/Calendar";
function ih(e, t) {
  const n = [...t].sort((r, o) => r.getTime() - o.getTime());
  return (
    q(n[0]).startOf("day").subtract(1, "ms").isBefore(e) &&
    q(n[1]).endOf("day").add(1, "ms").isAfter(e)
  );
}
function oP({
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
  const [c, u] = q0({
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
          if (q(E).isSame(f, t) && !s) {
            d(null), p(null), u([null, null]);
            return;
          }
          const R = [E, f];
          R.sort((D, L) => D.getTime() - L.getTime()), u(R), p(null), d(null);
          return;
        }
        if (c[0] && !c[1] && q(E).isSame(c[0], t) && !s) {
          d(null), p(null), u([null, null]);
          return;
        }
        u([E, null]), p(null), d(E);
        return;
      }
      if (e === "multiple") {
        c.some((R) => q(R).isSame(E, t))
          ? u(c.filter((R) => !q(R).isSame(E, t)))
          : u([...c, E]);
        return;
      }
      c && i && q(E).isSame(c, t) ? u(null) : u(E);
    },
    x = (E) =>
      f instanceof Date && m instanceof Date
        ? ih(E, [m, f])
        : c[0] instanceof Date && c[1] instanceof Date
        ? ih(E, c)
        : !1,
    v =
      e === "range"
        ? (E) => {
            l == null || l(E), p(null);
          }
        : l,
    g = (E) =>
      c[0] instanceof Date && q(E).isSame(c[0], t)
        ? !(m && q(m).isBefore(c[0]))
        : !1,
    y = (E) =>
      c[1] instanceof Date
        ? q(E).isSame(c[1], t)
        : !(c[0] instanceof Date) || !m
        ? !1
        : q(m).isBefore(c[0]) && q(E).isSame(c[0], t),
    b = (E) => {
      if (e === "range")
        return {
          selected: c.some((D) => D && q(D).isSame(E, t)),
          inRange: x(E),
          firstInRange: g(E),
          lastInRange: y(E),
          "data-autofocus": (!!c[0] && q(c[0]).isSame(E, t)) || void 0,
        };
      if (e === "multiple")
        return {
          selected: c.some((D) => D && q(D).isSame(E, t)),
          "data-autofocus": (!!c[0] && q(c[0]).isSame(E, t)) || void 0,
        };
      const R = q(c).isSame(E, t);
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
const sP = { type: "default", defaultLevel: "month", numberOfColumns: 1 },
  $d = Q((e, t) => {
    const n = W("DatePicker", sP, e),
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
        hideOutsideDates: x,
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
      } = oP({
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
      { resolvedClassNames: L, resolvedStyles: T } = Vs({
        classNames: r,
        styles: o,
        props: n,
      }),
      M = Xt();
    return S.jsx(xa, {
      ref: t,
      minLevel: "month",
      classNames: L,
      styles: T,
      __staticSelector: u || "DatePicker",
      onMouseLeave: E,
      numberOfColumns: h,
      hideOutsideDates: x ?? h !== 1,
      __onDayMouseEnter: (B, V) => {
        R(V), v == null || v(B, V);
      },
      __onDayClick: (B, V) => {
        C(V), g == null || g(B, V);
      },
      getDayProps: (B) => ({ ...D(B), ...(f == null ? void 0 : f(B)) }),
      ...b,
      date: uo("add", b.date, M.getTimezone(), y),
      __timezoneApplied: !0,
    });
  });
$d.classes = xa.classes;
$d.displayName = "@mantine/dates/DatePicker";
const jd = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = o.map((u) => u.option),
    [l, a] = w.useState(o.at(0));
  w.useEffect(() => {
    r.setFieldValue(s, l);
  }, []);
  const c = (u) => {
    a(u.value), r.setFieldValue(s, u.value);
  };
  return S.jsx(Cd, {
    label: t,
    description: n,
    data: i,
    defaultValue: i.at(0),
    onChange: (u, f) => c(f),
    searchable: !0,
  });
};
jd.defaultProps = {};
jd.propTypes = {
  title: G.string.isRequired,
  description: G.string.isRequired,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
  options: G.array,
};
const Ld = (e) => {
  const { title: t, description: n, form: r, options: o, field_id: s } = e,
    i = new Date(),
    l = new Date();
  l.setFullYear(i.getFullYear() + 1);
  const [a, c] = w.useState(l),
    [u, f] = w.useState(a),
    [d, { open: m, close: p }] = fl(!1);
  w.useEffect(() => {
    localStorage.setItem("embargo", a.toISOString().split("T")[0]);
  }, [a]);
  const h = () =>
      S.jsx(zn, {
        children: S.jsx(rn, {
          onClick: m,
          variant: "default",
          children: "Change embargo date",
        }),
      }),
    x = (g) => {
      const y = new Date(i);
      y.setMonth(i.getMonth() + g), c(y);
    },
    v = () =>
      a.getDate().toString() +
      " " +
      a.toLocaleString("default", { month: "long" }) +
      " " +
      a.getFullYear().toString();
  return S.jsxs("div", {
    children: [
      S.jsxs("header", {
        className: "",
        children: [
          S.jsx("h2", { className: "", children: t }),
          S.jsx("h4", { children: v() }),
          h(),
        ],
      }),
      S.jsxs(Gt, {
        opened: d,
        onClose: p,
        title: "Select embargo date",
        centered: !0,
        children: [
          S.jsxs(zn, {
            justify: "center",
            children: [
              S.jsx(rn, {
                variant: "default",
                onClick: () => {
                  x(6);
                },
                children: "6 months",
              }),
              S.jsx(rn, {
                variant: "default",
                onClick: () => {
                  x(12);
                },
                children: "12 months",
              }),
              S.jsx(rn, {
                variant: "default",
                onClick: () => {
                  x(18);
                },
                children: "18 months",
              }),
            ],
          }),
          S.jsx(zn, {
            justify: "center",
            children: S.jsxs("p", {
              children: ["New Embargo: ", S.jsx("b", { children: v() })],
            }),
          }),
          S.jsx(zn, {
            justify: "center",
            children: S.jsx($d, { defaultDate: i, value: a, onChange: c }),
          }),
          S.jsxs(zn, {
            justify: "center",
            children: [
              S.jsx(rn, {
                variant: "default",
                onClick: () => {
                  f(a), p();
                },
                children: "Accept",
              }),
              S.jsx(rn, {
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
Ld.defaultProps = {};
Ld.propTypes = {
  title: G.string.isRequired,
  description: G.string,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
  options: G.array,
};
const G0 = "",
  iP = "generic",
  lP = G0 + "/profile/profile/",
  X0 = G0 + "/api/submissions/",
  aP = "https://helpdesk.gfbio.org/browse/",
  cP = (e) => {
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
              S.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: S.jsxs("a", {
                    children: [
                      S.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Submission Id: ",
                      S.jsx("br", {}),
                      S.jsx("div", { className: "", children: a }),
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
              S.jsxs("div", {
                children: [
                  S.jsx("i", { className: "", "aria-hidden": "true" }),
                  "ENA Accession:",
                  S.jsx("br", {}),
                ],
              })
            ),
            l.accessionId.forEach((d) => {
              c.push(
                S.jsx(
                  "li",
                  {
                    className: "list-group-item",
                    children: S.jsxs("a", {
                      children: [
                        S.jsxs("div", {
                          className: "",
                          children: [
                            S.jsx("span", {
                              style: { fontWeight: 600 },
                              children: "ID",
                            }),
                            ": ",
                            d.pid,
                          ],
                        }),
                        S.jsxs("div", {
                          className: "",
                          style: { marginTop: 0 },
                          children: [
                            S.jsx("span", {
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
              S.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: S.jsxs("a", {
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "external",
                    href: aP + l.issue,
                    children: [
                      S.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Ticket:",
                      S.jsx("br", {}),
                      S.jsx("div", { className: "", children: l.issue }),
                    ],
                  }),
                },
                u
              )
            ),
            u++),
          l.readOnly &&
            (c.push(
              S.jsx(
                "li",
                {
                  className: "list-group-item",
                  children: S.jsxs("a", {
                    children: [
                      S.jsx("i", { className: "", "aria-hidden": "true" }),
                      "Status: ",
                      S.jsx("br", {}),
                      S.jsx("div", {
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
            S.jsx(
              "li",
              {
                className: "list-group-item",
                children: S.jsxs("a", {
                  href: f,
                  className: "external",
                  children: [
                    S.jsx("i", { className: "", "aria-hidden": "true" }),
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
    return S.jsxs("div", {
      className: "",
      children: [
        S.jsxs("header", {
          className: "",
          children: [
            S.jsx("h2", { className: "", children: t }),
            S.jsx("p", { className: "" }),
          ],
        }),
        S.jsx("div", {
          className: "",
          children: S.jsx("ul", {
            className: "list-group list-group-flush",
            children: i(),
          }),
        }),
      ],
    });
  },
  Ad = (e) => {
    const {
      title: t,
      description: n,
      form: r,
      field_id: o,
      placeholder: s,
    } = e;
    return S.jsx(
      xd,
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
Ad.defaultProps = { placeholder: "" };
Ad.propTypes = {
  title: G.string.isRequired,
  description: G.string.isRequired,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
  placeholder: G.string,
};
const bl = (e) => {
  const {
    title: t,
    description: n,
    mandatory: r,
    form: o,
    field_id: s,
    placeholder: i,
  } = e;
  return S.jsx(
    Ed,
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
bl.defaultProps = { placeholder: "" };
bl.propTypes = {
  title: G.string.isRequired,
  description: G.string.isRequired,
  mandatory: G.bool.isRequired,
  form: G.object.isRequired,
  field_id: G.string.isRequired,
  placeholder: G.string,
};
const Q0 = ({ field: e, form: t }) => {
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
      return S.jsx(bl, { ...n });
    case "text-area":
      return S.jsx(Ad, { ...n });
    case "select-field":
      return S.jsx(jd, { ...n });
    case "file-upload":
      return S.jsx(Pd, { ...n });
    case "info-box":
      return S.jsx(cP, { ...n });
    case "embargo-date-picker":
      return S.jsx(Ld, { ...n });
    case "collapsible-selector":
      return S.jsx(kd, { ...n });
    default:
      return S.jsx(bl, { ...n });
  }
};
Q0.propTypes = { field: G.object.isRequired, form: G.object.isRequired };
function J0(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: uP } = Object.prototype,
  { getPrototypeOf: Fd } = Object,
  ba = ((e) => (t) => {
    const n = uP.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  Qt = (e) => ((e = e.toLowerCase()), (t) => ba(t) === e),
  Ca = (e) => (t) => typeof t === e,
  { isArray: Lo } = Array,
  $s = Ca("undefined");
function fP(e) {
  return (
    e !== null &&
    !$s(e) &&
    e.constructor !== null &&
    !$s(e.constructor) &&
    Dt(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const Z0 = Qt("ArrayBuffer");
function dP(e) {
  let t;
  return (
    typeof ArrayBuffer < "u" && ArrayBuffer.isView
      ? (t = ArrayBuffer.isView(e))
      : (t = e && e.buffer && Z0(e.buffer)),
    t
  );
}
const pP = Ca("string"),
  Dt = Ca("function"),
  ew = Ca("number"),
  Ea = (e) => e !== null && typeof e == "object",
  mP = (e) => e === !0 || e === !1,
  zi = (e) => {
    if (ba(e) !== "object") return !1;
    const t = Fd(e);
    return (
      (t === null ||
        t === Object.prototype ||
        Object.getPrototypeOf(t) === null) &&
      !(Symbol.toStringTag in e) &&
      !(Symbol.iterator in e)
    );
  },
  hP = Qt("Date"),
  gP = Qt("File"),
  yP = Qt("Blob"),
  vP = Qt("FileList"),
  wP = (e) => Ea(e) && Dt(e.pipe),
  SP = (e) => {
    let t;
    return (
      e &&
      ((typeof FormData == "function" && e instanceof FormData) ||
        (Dt(e.append) &&
          ((t = ba(e)) === "formdata" ||
            (t === "object" &&
              Dt(e.toString) &&
              e.toString() === "[object FormData]"))))
    );
  },
  xP = Qt("URLSearchParams"),
  [bP, CP, EP, kP] = ["ReadableStream", "Request", "Response", "Headers"].map(
    Qt
  ),
  _P = (e) =>
    e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
function qs(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > "u") return;
  let r, o;
  if ((typeof e != "object" && (e = [e]), Lo(e)))
    for (r = 0, o = e.length; r < o; r++) t.call(null, e[r], r, e);
  else {
    const s = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      i = s.length;
    let l;
    for (r = 0; r < i; r++) (l = s[r]), t.call(null, e[l], l, e);
  }
}
function tw(e, t) {
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    o;
  for (; r-- > 0; ) if (((o = n[r]), t === o.toLowerCase())) return o;
  return null;
}
const nw =
    typeof globalThis < "u"
      ? globalThis
      : typeof self < "u"
      ? self
      : typeof window < "u"
      ? window
      : global,
  rw = (e) => !$s(e) && e !== nw;
function Du() {
  const { caseless: e } = (rw(this) && this) || {},
    t = {},
    n = (r, o) => {
      const s = (e && tw(t, o)) || o;
      zi(t[s]) && zi(r)
        ? (t[s] = Du(t[s], r))
        : zi(r)
        ? (t[s] = Du({}, r))
        : Lo(r)
        ? (t[s] = r.slice())
        : (t[s] = r);
    };
  for (let r = 0, o = arguments.length; r < o; r++)
    arguments[r] && qs(arguments[r], n);
  return t;
}
const RP = (e, t, n, { allOwnKeys: r } = {}) => (
    qs(
      t,
      (o, s) => {
        n && Dt(o) ? (e[s] = J0(o, n)) : (e[s] = o);
      },
      { allOwnKeys: r }
    ),
    e
  ),
  DP = (e) => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  PP = (e, t, n, r) => {
    (e.prototype = Object.create(t.prototype, r)),
      (e.prototype.constructor = e),
      Object.defineProperty(e, "super", { value: t.prototype }),
      n && Object.assign(e.prototype, n);
  },
  TP = (e, t, n, r) => {
    let o, s, i;
    const l = {};
    if (((t = t || {}), e == null)) return t;
    do {
      for (o = Object.getOwnPropertyNames(e), s = o.length; s-- > 0; )
        (i = o[s]), (!r || r(i, e, t)) && !l[i] && ((t[i] = e[i]), (l[i] = !0));
      e = n !== !1 && Fd(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  NP = (e, t, n) => {
    (e = String(e)),
      (n === void 0 || n > e.length) && (n = e.length),
      (n -= t.length);
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  OP = (e) => {
    if (!e) return null;
    if (Lo(e)) return e;
    let t = e.length;
    if (!ew(t)) return null;
    const n = new Array(t);
    for (; t-- > 0; ) n[t] = e[t];
    return n;
  },
  $P = (
    (e) => (t) =>
      e && t instanceof e
  )(typeof Uint8Array < "u" && Fd(Uint8Array)),
  jP = (e, t) => {
    const r = (e && e[Symbol.iterator]).call(e);
    let o;
    for (; (o = r.next()) && !o.done; ) {
      const s = o.value;
      t.call(e, s[0], s[1]);
    }
  },
  LP = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null; ) r.push(n);
    return r;
  },
  AP = Qt("HTMLFormElement"),
  FP = (e) =>
    e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, o) {
      return r.toUpperCase() + o;
    }),
  lh = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  MP = Qt("RegExp"),
  ow = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    qs(n, (o, s) => {
      let i;
      (i = t(o, s, e)) !== !1 && (r[s] = i || o);
    }),
      Object.defineProperties(e, r);
  },
  zP = (e) => {
    ow(e, (t, n) => {
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
  IP = (e, t) => {
    const n = {},
      r = (o) => {
        o.forEach((s) => {
          n[s] = !0;
        });
      };
    return Lo(e) ? r(e) : r(String(e).split(t)), n;
  },
  BP = () => {},
  HP = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t),
  gc = "abcdefghijklmnopqrstuvwxyz",
  ah = "0123456789",
  sw = { DIGIT: ah, ALPHA: gc, ALPHA_DIGIT: gc + gc.toUpperCase() + ah },
  VP = (e = 16, t = sw.ALPHA_DIGIT) => {
    let n = "";
    const { length: r } = t;
    for (; e--; ) n += t[(Math.random() * r) | 0];
    return n;
  };
function UP(e) {
  return !!(
    e &&
    Dt(e.append) &&
    e[Symbol.toStringTag] === "FormData" &&
    e[Symbol.iterator]
  );
}
const WP = (e) => {
    const t = new Array(10),
      n = (r, o) => {
        if (Ea(r)) {
          if (t.indexOf(r) >= 0) return;
          if (!("toJSON" in r)) {
            t[o] = r;
            const s = Lo(r) ? [] : {};
            return (
              qs(r, (i, l) => {
                const a = n(i, o + 1);
                !$s(a) && (s[l] = a);
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
  YP = Qt("AsyncFunction"),
  KP = (e) => e && (Ea(e) || Dt(e)) && Dt(e.then) && Dt(e.catch),
  A = {
    isArray: Lo,
    isArrayBuffer: Z0,
    isBuffer: fP,
    isFormData: SP,
    isArrayBufferView: dP,
    isString: pP,
    isNumber: ew,
    isBoolean: mP,
    isObject: Ea,
    isPlainObject: zi,
    isReadableStream: bP,
    isRequest: CP,
    isResponse: EP,
    isHeaders: kP,
    isUndefined: $s,
    isDate: hP,
    isFile: gP,
    isBlob: yP,
    isRegExp: MP,
    isFunction: Dt,
    isStream: wP,
    isURLSearchParams: xP,
    isTypedArray: $P,
    isFileList: vP,
    forEach: qs,
    merge: Du,
    extend: RP,
    trim: _P,
    stripBOM: DP,
    inherits: PP,
    toFlatObject: TP,
    kindOf: ba,
    kindOfTest: Qt,
    endsWith: NP,
    toArray: OP,
    forEachEntry: jP,
    matchAll: LP,
    isHTMLForm: AP,
    hasOwnProperty: lh,
    hasOwnProp: lh,
    reduceDescriptors: ow,
    freezeMethods: zP,
    toObjectSet: IP,
    toCamelCase: FP,
    noop: BP,
    toFiniteNumber: HP,
    findKey: tw,
    global: nw,
    isContextDefined: rw,
    ALPHABET: sw,
    generateString: VP,
    isSpecCompliantForm: UP,
    toJSONObject: WP,
    isAsyncFn: YP,
    isThenable: KP,
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
const iw = ie.prototype,
  lw = {};
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
  lw[e] = { value: e };
});
Object.defineProperties(ie, lw);
Object.defineProperty(iw, "isAxiosError", { value: !0 });
ie.from = (e, t, n, r, o, s) => {
  const i = Object.create(iw);
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
const qP = null;
function Pu(e) {
  return A.isPlainObject(e) || A.isArray(e);
}
function aw(e) {
  return A.endsWith(e, "[]") ? e.slice(0, -2) : e;
}
function ch(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (o, s) {
          return (o = aw(o)), !n && s ? "[" + o + "]" : o;
        })
        .join(n ? "." : "")
    : t;
}
function GP(e) {
  return A.isArray(e) && !e.some(Pu);
}
const XP = A.toFlatObject(A, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function ka(e, t, n) {
  if (!A.isObject(e)) throw new TypeError("target must be an object");
  (t = t || new FormData()),
    (n = A.toFlatObject(
      n,
      { metaTokens: !0, dots: !1, indexes: !1 },
      !1,
      function (h, x) {
        return !A.isUndefined(x[h]);
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
  function u(p, h, x) {
    let v = p;
    if (p && !x && typeof p == "object") {
      if (A.endsWith(h, "{}"))
        (h = r ? h : h.slice(0, -2)), (p = JSON.stringify(p));
      else if (
        (A.isArray(p) && GP(p)) ||
        ((A.isFileList(p) || A.endsWith(h, "[]")) && (v = A.toArray(p)))
      )
        return (
          (h = aw(h)),
          v.forEach(function (y, b) {
            !(A.isUndefined(y) || y === null) &&
              t.append(
                i === !0 ? ch([h], b, s) : i === null ? h : h + "[]",
                c(y)
              );
          }),
          !1
        );
    }
    return Pu(p) ? !0 : (t.append(ch(x, h, s), c(p)), !1);
  }
  const f = [],
    d = Object.assign(XP, {
      defaultVisitor: u,
      convertValue: c,
      isVisitable: Pu,
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
function uh(e) {
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
function Md(e, t) {
  (this._pairs = []), e && ka(e, this, t);
}
const cw = Md.prototype;
cw.append = function (t, n) {
  this._pairs.push([t, n]);
};
cw.toString = function (t) {
  const n = t
    ? function (r) {
        return t.call(this, r, uh);
      }
    : uh;
  return this._pairs
    .map(function (o) {
      return n(o[0]) + "=" + n(o[1]);
    }, "")
    .join("&");
};
function QP(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ":")
    .replace(/%24/g, "$")
    .replace(/%2C/gi, ",")
    .replace(/%20/g, "+")
    .replace(/%5B/gi, "[")
    .replace(/%5D/gi, "]");
}
function uw(e, t, n) {
  if (!t) return e;
  const r = (n && n.encode) || QP,
    o = n && n.serialize;
  let s;
  if (
    (o
      ? (s = o(t, n))
      : (s = A.isURLSearchParams(t) ? t.toString() : new Md(t, n).toString(r)),
    s)
  ) {
    const i = e.indexOf("#");
    i !== -1 && (e = e.slice(0, i)),
      (e += (e.indexOf("?") === -1 ? "?" : "&") + s);
  }
  return e;
}
class fh {
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
const fw = {
    silentJSONParsing: !0,
    forcedJSONParsing: !0,
    clarifyTimeoutError: !1,
  },
  JP = typeof URLSearchParams < "u" ? URLSearchParams : Md,
  ZP = typeof FormData < "u" ? FormData : null,
  eT = typeof Blob < "u" ? Blob : null,
  tT = {
    isBrowser: !0,
    classes: { URLSearchParams: JP, FormData: ZP, Blob: eT },
    protocols: ["http", "https", "file", "blob", "url", "data"],
  },
  zd = typeof window < "u" && typeof document < "u",
  nT = ((e) => zd && ["ReactNative", "NativeScript", "NS"].indexOf(e) < 0)(
    typeof navigator < "u" && navigator.product
  ),
  rT =
    typeof WorkerGlobalScope < "u" &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == "function",
  oT = (zd && window.location.href) || "http://localhost",
  sT = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: zd,
        hasStandardBrowserEnv: nT,
        hasStandardBrowserWebWorkerEnv: rT,
        origin: oT,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  ),
  Ut = { ...sT, ...tT };
function iT(e, t) {
  return ka(
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
function lT(e) {
  return A.matchAll(/\w+|\[(\w*)]/g, e).map((t) =>
    t[0] === "[]" ? "" : t[1] || t[0]
  );
}
function aT(e) {
  const t = {},
    n = Object.keys(e);
  let r;
  const o = n.length;
  let s;
  for (r = 0; r < o; r++) (s = n[r]), (t[s] = e[s]);
  return t;
}
function dw(e) {
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
          t(n, r, o[i], s) && A.isArray(o[i]) && (o[i] = aT(o[i])),
          !l)
    );
  }
  if (A.isFormData(e) && A.isFunction(e.entries)) {
    const n = {};
    return (
      A.forEachEntry(e, (r, o) => {
        t(lT(r), o, n, 0);
      }),
      n
    );
  }
  return null;
}
function cT(e, t, n) {
  if (A.isString(e))
    try {
      return (t || JSON.parse)(e), A.trim(e);
    } catch (r) {
      if (r.name !== "SyntaxError") throw r;
    }
  return (n || JSON.stringify)(e);
}
const Gs = {
  transitional: fw,
  adapter: ["xhr", "http", "fetch"],
  transformRequest: [
    function (t, n) {
      const r = n.getContentType() || "",
        o = r.indexOf("application/json") > -1,
        s = A.isObject(t);
      if ((s && A.isHTMLForm(t) && (t = new FormData(t)), A.isFormData(t)))
        return o ? JSON.stringify(dw(t)) : t;
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
          return iT(t, this.formSerializer).toString();
        if ((l = A.isFileList(t)) || r.indexOf("multipart/form-data") > -1) {
          const a = this.env && this.env.FormData;
          return ka(
            l ? { "files[]": t } : t,
            a && new a(),
            this.formSerializer
          );
        }
      }
      return s || o ? (n.setContentType("application/json", !1), cT(t)) : t;
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
const uT = A.toObjectSet([
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
  fT = (e) => {
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
              !(!n || (t[n] && uT[n])) &&
                (n === "set-cookie"
                  ? t[n]
                    ? t[n].push(r)
                    : (t[n] = [r])
                  : (t[n] = t[n] ? t[n] + ", " + r : r));
          }),
      t
    );
  },
  dh = Symbol("internals");
function Qo(e) {
  return e && String(e).trim().toLowerCase();
}
function Ii(e) {
  return e === !1 || e == null ? e : A.isArray(e) ? e.map(Ii) : String(e);
}
function dT(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; (r = n.exec(e)); ) t[r[1]] = r[2];
  return t;
}
const pT = (e) => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function yc(e, t, n, r, o) {
  if (A.isFunction(r)) return r.call(this, t, n);
  if ((o && (t = n), !!A.isString(t))) {
    if (A.isString(r)) return t.indexOf(r) !== -1;
    if (A.isRegExp(r)) return r.test(t);
  }
}
function mT(e) {
  return e
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function hT(e, t) {
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
      const u = Qo(a);
      if (!u) throw new Error("header name must be a non-empty string");
      const f = A.findKey(o, u);
      (!f || o[f] === void 0 || c === !0 || (c === void 0 && o[f] !== !1)) &&
        (o[f || a] = Ii(l));
    }
    const i = (l, a) => A.forEach(l, (c, u) => s(c, u, a));
    if (A.isPlainObject(t) || t instanceof this.constructor) i(t, n);
    else if (A.isString(t) && (t = t.trim()) && !pT(t)) i(fT(t), n);
    else if (A.isHeaders(t)) for (const [l, a] of t.entries()) s(a, l, r);
    else t != null && s(n, t, r);
    return this;
  }
  get(t, n) {
    if (((t = Qo(t)), t)) {
      const r = A.findKey(this, t);
      if (r) {
        const o = this[r];
        if (!n) return o;
        if (n === !0) return dT(o);
        if (A.isFunction(n)) return n.call(this, o, r);
        if (A.isRegExp(n)) return n.exec(o);
        throw new TypeError("parser must be boolean|regexp|function");
      }
    }
  }
  has(t, n) {
    if (((t = Qo(t)), t)) {
      const r = A.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || yc(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let o = !1;
    function s(i) {
      if (((i = Qo(i)), i)) {
        const l = A.findKey(r, i);
        l && (!n || yc(r, r[l], l, n)) && (delete r[l], (o = !0));
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
      (!t || yc(this, this[s], s, t, !0)) && (delete this[s], (o = !0));
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
          (n[i] = Ii(o)), delete n[s];
          return;
        }
        const l = t ? mT(s) : String(s).trim();
        l !== s && delete n[s], (n[l] = Ii(o)), (r[l] = !0);
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
    const r = (this[dh] = this[dh] = { accessors: {} }).accessors,
      o = this.prototype;
    function s(i) {
      const l = Qo(i);
      r[l] || (hT(o, i), (r[l] = !0));
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
function vc(e, t) {
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
function pw(e) {
  return !!(e && e.__CANCEL__);
}
function Ao(e, t, n) {
  ie.call(this, e ?? "canceled", ie.ERR_CANCELED, t, n),
    (this.name = "CanceledError");
}
A.inherits(Ao, ie, { __CANCEL__: !0 });
function mw(e, t, n) {
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
function gT(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return (t && t[1]) || "";
}
function yT(e, t) {
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
function vT(e, t) {
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
const Cl = (e, t, n = 3) => {
    let r = 0;
    const o = yT(50, 250);
    return vT((s) => {
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
  wT = Ut.hasStandardBrowserEnv
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
  ST = Ut.hasStandardBrowserEnv
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
function xT(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function bT(e, t) {
  return t ? e.replace(/\/?\/$/, "") + "/" + t.replace(/^\/+/, "") : e;
}
function hw(e, t) {
  return e && !xT(t) ? bT(e, t) : t;
}
const ph = (e) => (e instanceof pt ? { ...e } : e);
function Pr(e, t) {
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
    headers: (c, u) => o(ph(c), ph(u), !0),
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
const gw = (e) => {
    const t = Pr({}, e);
    let {
      data: n,
      withXSRFToken: r,
      xsrfHeaderName: o,
      xsrfCookieName: s,
      headers: i,
      auth: l,
    } = t;
    (t.headers = i = pt.from(i)),
      (t.url = uw(hw(t.baseURL, t.url), e.params, e.paramsSerializer)),
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
      (r && A.isFunction(r) && (r = r(t)), r || (r !== !1 && wT(t.url)))
    ) {
      const c = o && s && ST.read(s);
      c && i.set(o, c);
    }
    return t;
  },
  CT = typeof XMLHttpRequest < "u",
  ET =
    CT &&
    function (e) {
      return new Promise(function (n, r) {
        const o = gw(e);
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
          mw(
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
            const h = o.transitional || fw;
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
            u.addEventListener("progress", Cl(o.onDownloadProgress, !0)),
          typeof o.onUploadProgress == "function" &&
            u.upload &&
            u.upload.addEventListener("progress", Cl(o.onUploadProgress)),
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
        const d = gT(o.url);
        if (d && Ut.protocols.indexOf(d) === -1) {
          r(new ie("Unsupported protocol " + d + ":", ie.ERR_BAD_REQUEST, e));
          return;
        }
        u.send(s || null);
      });
    },
  kT = (e, t) => {
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
  _T = function* (e, t) {
    let n = e.byteLength;
    if (!t || n < t) {
      yield e;
      return;
    }
    let r = 0,
      o;
    for (; r < n; ) (o = r + t), yield e.slice(r, o), (r = o);
  },
  RT = async function* (e, t, n) {
    for await (const r of e)
      yield* _T(ArrayBuffer.isView(r) ? r : await n(String(r)), t);
  },
  mh = (e, t, n, r, o) => {
    const s = RT(e, t, o);
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
  hh = (e, t) => {
    const n = e != null;
    return (r) =>
      setTimeout(() => t({ lengthComputable: n, total: e, loaded: r }));
  },
  _a =
    typeof fetch == "function" &&
    typeof Request == "function" &&
    typeof Response == "function",
  yw = _a && typeof ReadableStream == "function",
  Tu =
    _a &&
    (typeof TextEncoder == "function"
      ? (
          (e) => (t) =>
            e.encode(t)
        )(new TextEncoder())
      : async (e) => new Uint8Array(await new Response(e).arrayBuffer())),
  DT =
    yw &&
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
  gh = 64 * 1024,
  Nu =
    yw &&
    !!(() => {
      try {
        return A.isReadableStream(new Response("").body);
      } catch {}
    })(),
  El = { stream: Nu && ((e) => e.body) };
_a &&
  ((e) => {
    ["text", "arrayBuffer", "blob", "formData", "stream"].forEach((t) => {
      !El[t] &&
        (El[t] = A.isFunction(e[t])
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
const PT = async (e) => {
    if (e == null) return 0;
    if (A.isBlob(e)) return e.size;
    if (A.isSpecCompliantForm(e))
      return (await new Request(e).arrayBuffer()).byteLength;
    if (A.isArrayBufferView(e)) return e.byteLength;
    if ((A.isURLSearchParams(e) && (e = e + ""), A.isString(e)))
      return (await Tu(e)).byteLength;
  },
  TT = async (e, t) => {
    const n = A.toFiniteNumber(e.getContentLength());
    return n ?? PT(t);
  },
  NT =
    _a &&
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
      } = gw(e);
      c = c ? (c + "").toLowerCase() : "text";
      let [m, p] = o || s || i ? kT([o, s], i) : [],
        h,
        x;
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
          DT &&
          n !== "get" &&
          n !== "head" &&
          (g = await TT(u, r)) !== 0
        ) {
          let E = new Request(t, { method: "POST", body: r, duplex: "half" }),
            R;
          A.isFormData(r) &&
            (R = E.headers.get("content-type")) &&
            u.setContentType(R),
            E.body && (r = mh(E.body, gh, hh(g, Cl(a)), null, Tu));
        }
        A.isString(f) || (f = f ? "cors" : "omit"),
          (x = new Request(t, {
            ...d,
            signal: m,
            method: n.toUpperCase(),
            headers: u.normalize().toJSON(),
            body: r,
            duplex: "half",
            withCredentials: f,
          }));
        let y = await fetch(x);
        const b = Nu && (c === "stream" || c === "response");
        if (Nu && (l || b)) {
          const E = {};
          ["status", "statusText", "headers"].forEach((D) => {
            E[D] = y[D];
          });
          const R = A.toFiniteNumber(y.headers.get("content-length"));
          y = new Response(
            mh(y.body, gh, l && hh(R, Cl(l, !0)), b && v, Tu),
            E
          );
        }
        c = c || "text";
        let C = await El[A.findKey(El, c) || "text"](y, e);
        return (
          !b && v(),
          p && p(),
          await new Promise((E, R) => {
            mw(E, R, {
              data: C,
              headers: pt.from(y.headers),
              status: y.status,
              statusText: y.statusText,
              config: e,
              request: x,
            });
          })
        );
      } catch (y) {
        throw (
          (v(),
          y && y.name === "TypeError" && /fetch/i.test(y.message)
            ? Object.assign(new ie("Network Error", ie.ERR_NETWORK, e, x), {
                cause: y.cause || y,
              })
            : ie.from(y, y && y.code, e, x))
        );
      }
    }),
  Ou = { http: qP, xhr: ET, fetch: NT };
A.forEach(Ou, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, "name", { value: t });
    } catch {}
    Object.defineProperty(e, "adapterName", { value: t });
  }
});
const yh = (e) => `- ${e}`,
  OT = (e) => A.isFunction(e) || e === null || e === !1,
  vw = {
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
          !OT(n) && ((r = Ou[(i = String(n)).toLowerCase()]), r === void 0))
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
              s.map(yh).join(`
`)
            : " " + yh(s[0])
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
function wc(e) {
  if (
    (e.cancelToken && e.cancelToken.throwIfRequested(),
    e.signal && e.signal.aborted)
  )
    throw new Ao(null, e);
}
function vh(e) {
  return (
    wc(e),
    (e.headers = pt.from(e.headers)),
    (e.data = vc.call(e, e.transformRequest)),
    ["post", "put", "patch"].indexOf(e.method) !== -1 &&
      e.headers.setContentType("application/x-www-form-urlencoded", !1),
    vw
      .getAdapter(e.adapter || Gs.adapter)(e)
      .then(
        function (r) {
          return (
            wc(e),
            (r.data = vc.call(e, e.transformResponse, r)),
            (r.headers = pt.from(r.headers)),
            r
          );
        },
        function (r) {
          return (
            pw(r) ||
              (wc(e),
              r &&
                r.response &&
                ((r.response.data = vc.call(
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
const ww = "1.7.2",
  Id = {};
["object", "boolean", "number", "function", "string", "symbol"].forEach(
  (e, t) => {
    Id[e] = function (r) {
      return typeof r === e || "a" + (t < 1 ? "n " : " ") + e;
    };
  }
);
const wh = {};
Id.transitional = function (t, n, r) {
  function o(s, i) {
    return (
      "[Axios v" +
      ww +
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
        !wh[i] &&
        ((wh[i] = !0),
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
function $T(e, t, n) {
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
const $u = { assertOptions: $T, validators: Id },
  $n = $u.validators;
class xr {
  constructor(t) {
    (this.defaults = t),
      (this.interceptors = { request: new fh(), response: new fh() });
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
      (n = Pr(this.defaults, n));
    const { transitional: r, paramsSerializer: o, headers: s } = n;
    r !== void 0 &&
      $u.assertOptions(
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
          : $u.assertOptions(
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
      const p = [vh.bind(this), void 0];
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
      } catch (x) {
        h.call(this, x);
        break;
      }
    }
    try {
      u = vh.call(this, m);
    } catch (p) {
      return Promise.reject(p);
    }
    for (f = 0, d = c.length; f < d; ) u = u.then(c[f++], c[f++]);
    return u;
  }
  getUri(t) {
    t = Pr(this.defaults, t);
    const n = hw(t.baseURL, t.url);
    return uw(n, t.params, t.paramsSerializer);
  }
}
A.forEach(["delete", "get", "head", "options"], function (t) {
  xr.prototype[t] = function (n, r) {
    return this.request(
      Pr(r || {}, { method: t, url: n, data: (r || {}).data })
    );
  };
});
A.forEach(["post", "put", "patch"], function (t) {
  function n(r) {
    return function (s, i, l) {
      return this.request(
        Pr(l || {}, {
          method: t,
          headers: r ? { "Content-Type": "multipart/form-data" } : {},
          url: s,
          data: i,
        })
      );
    };
  }
  (xr.prototype[t] = n()), (xr.prototype[t + "Form"] = n(!0));
});
class Bd {
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
      token: new Bd(function (o) {
        t = o;
      }),
      cancel: t,
    };
  }
}
function jT(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function LT(e) {
  return A.isObject(e) && e.isAxiosError === !0;
}
const ju = {
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
Object.entries(ju).forEach(([e, t]) => {
  ju[t] = e;
});
function Sw(e) {
  const t = new xr(e),
    n = J0(xr.prototype.request, t);
  return (
    A.extend(n, xr.prototype, t, { allOwnKeys: !0 }),
    A.extend(n, t, null, { allOwnKeys: !0 }),
    (n.create = function (o) {
      return Sw(Pr(e, o));
    }),
    n
  );
}
const De = Sw(Gs);
De.Axios = xr;
De.CanceledError = Ao;
De.CancelToken = Bd;
De.isCancel = pw;
De.VERSION = ww;
De.toFormData = ka;
De.AxiosError = ie;
De.Cancel = De.CanceledError;
De.all = function (t) {
  return Promise.all(t);
};
De.spread = jT;
De.isAxiosError = LT;
De.mergeConfig = Pr;
De.AxiosHeaders = pt;
De.formToJSON = (e) => dw(A.isHTMLForm(e) ? new FormData(e) : e);
De.getAdapter = vw.getAdapter;
De.HttpStatusCode = ju;
De.default = De;
const AT = async (e, t, n) => {
    let r = {};
    const o = { target: e, embargo: t, data: { requirements: n } };
    let s = "";
    window.props !== void 0 && (s = window.props.token || "no-token-found");
    const i = X0,
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
  xw = (e) => {
    const {
        profileData: t,
        submissionData: n,
        isLoading: r,
        profileError: o,
        SubmissionError: s,
      } = e,
      [i, l] = w.useState(!1),
      a = ER({
        mode: "uncontrolled",
        name: "profile-form",
        initialValues: { files: [] },
      }),
      c = (u) => {
        l(!0),
          AT(t.target, localStorage.getItem("embargo"), u)
            .then((f) => {
              console.log("DATA ", f);
            })
            .finally(() => {
              l(!1);
            });
      };
    return S.jsxs("form", {
      onSubmit: a.onSubmit(c),
      children: [
        S.jsxs("p", { children: ["processing: ", "" + i] }),
        t.fields.map((u, f) => S.jsx(Q0, { field: u, form: a }, f)),
        S.jsx(zn, {
          justify: "flex-end",
          mt: "md",
          children: S.jsx(rn, { type: "submit", children: "Submit" }),
        }),
      ],
    });
  };
xw.propTypes = { profileData: G.object.isRequired };
/**
 * @remix-run/router v1.16.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function kl() {
  return (
    (kl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    kl.apply(this, arguments)
  );
}
var Hn;
(function (e) {
  (e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE");
})(Hn || (Hn = {}));
const Sh = "popstate";
function FT(e) {
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
    return typeof o == "string" ? o : Cw(o);
  }
  return zT(t, n, null, e);
}
function ht(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function bw(e, t) {
  if (!e) {
    typeof console < "u" && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function MT() {
  return Math.random().toString(36).substr(2, 8);
}
function xh(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function Lu(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    kl(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? Ra(t) : t,
      { state: n, key: (t && t.key) || r || MT() }
    )
  );
}
function Cw(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function Ra(e) {
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
function zT(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: o = document.defaultView, v5Compat: s = !1 } = r,
    i = o.history,
    l = Hn.Pop,
    a = null,
    c = u();
  c == null && ((c = 0), i.replaceState(kl({}, i.state, { idx: c }), ""));
  function u() {
    return (i.state || { idx: null }).idx;
  }
  function f() {
    l = Hn.Pop;
    let x = u(),
      v = x == null ? null : x - c;
    (c = x), a && a({ action: l, location: h.location, delta: v });
  }
  function d(x, v) {
    l = Hn.Push;
    let g = Lu(h.location, x, v);
    c = u() + 1;
    let y = xh(g, c),
      b = h.createHref(g);
    try {
      i.pushState(y, "", b);
    } catch (C) {
      if (C instanceof DOMException && C.name === "DataCloneError") throw C;
      o.location.assign(b);
    }
    s && a && a({ action: l, location: h.location, delta: 1 });
  }
  function m(x, v) {
    l = Hn.Replace;
    let g = Lu(h.location, x, v);
    c = u();
    let y = xh(g, c),
      b = h.createHref(g);
    i.replaceState(y, "", b),
      s && a && a({ action: l, location: h.location, delta: 0 });
  }
  function p(x) {
    let v = o.location.origin !== "null" ? o.location.origin : o.location.href,
      g = typeof x == "string" ? x : Cw(x);
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
    listen(x) {
      if (a) throw new Error("A history only accepts one active listener");
      return (
        o.addEventListener(Sh, f),
        (a = x),
        () => {
          o.removeEventListener(Sh, f), (a = null);
        }
      );
    },
    createHref(x) {
      return t(o, x);
    },
    createURL: p,
    encodeLocation(x) {
      let v = p(x);
      return { pathname: v.pathname, search: v.search, hash: v.hash };
    },
    push: d,
    replace: m,
    go(x) {
      return i.go(x);
    },
  };
  return h;
}
var bh;
(function (e) {
  (e.data = "data"),
    (e.deferred = "deferred"),
    (e.redirect = "redirect"),
    (e.error = "error");
})(bh || (bh = {}));
function IT(e, t, n) {
  n === void 0 && (n = "/");
  let r = typeof t == "string" ? Ra(t) : t,
    o = _w(r.pathname || "/", n);
  if (o == null) return null;
  let s = Ew(e);
  BT(s);
  let i = null;
  for (let l = 0; i == null && l < s.length; ++l) {
    let a = ZT(o);
    i = XT(s[l], a);
  }
  return i;
}
function Ew(e, t, n, r) {
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
    let c = fo([r, a.relativePath]),
      u = n.concat(a);
    s.children &&
      s.children.length > 0 &&
      (ht(
        s.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + c + '".')
      ),
      Ew(s.children, t, u, c)),
      !(s.path == null && !s.index) &&
        t.push({ path: c, score: qT(c, s.index), routesMeta: u });
  };
  return (
    e.forEach((s, i) => {
      var l;
      if (s.path === "" || !((l = s.path) != null && l.includes("?"))) o(s, i);
      else for (let a of kw(s.path)) o(s, i, a);
    }),
    t
  );
}
function kw(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    o = n.endsWith("?"),
    s = n.replace(/\?$/, "");
  if (r.length === 0) return o ? [s, ""] : [s];
  let i = kw(r.join("/")),
    l = [];
  return (
    l.push(...i.map((a) => (a === "" ? s : [s, a].join("/")))),
    o && l.push(...i),
    l.map((a) => (e.startsWith("/") && a === "" ? "/" : a))
  );
}
function BT(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : GT(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex)
        )
  );
}
const HT = /^:[\w-]+$/,
  VT = 3,
  UT = 2,
  WT = 1,
  YT = 10,
  KT = -2,
  Ch = (e) => e === "*";
function qT(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(Ch) && (r += KT),
    t && (r += UT),
    n
      .filter((o) => !Ch(o))
      .reduce((o, s) => o + (HT.test(s) ? VT : s === "" ? WT : YT), r)
  );
}
function GT(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, o) => r === t[o])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function XT(e, t) {
  let { routesMeta: n } = e,
    r = {},
    o = "/",
    s = [];
  for (let i = 0; i < n.length; ++i) {
    let l = n[i],
      a = i === n.length - 1,
      c = o === "/" ? t : t.slice(o.length) || "/",
      u = QT(
        { path: l.relativePath, caseSensitive: l.caseSensitive, end: a },
        c
      );
    if (!u) return null;
    Object.assign(r, u.params);
    let f = l.route;
    s.push({
      params: r,
      pathname: fo([o, u.pathname]),
      pathnameBase: eN(fo([o, u.pathnameBase])),
      route: f,
    }),
      u.pathnameBase !== "/" && (o = fo([o, u.pathnameBase]));
  }
  return s;
}
function QT(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = JT(e.path, e.caseSensitive, e.end),
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
function JT(e, t, n) {
  t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    bw(
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
function ZT(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      bw(
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
function _w(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const fo = (e) => e.join("/").replace(/\/\/+/g, "/"),
  eN = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/");
function tN(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const Rw = ["post", "put", "patch", "delete"];
new Set(Rw);
const nN = ["get", ...Rw];
new Set(nN);
/**
 * React Router v6.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function _l() {
  return (
    (_l = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n)
              Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    _l.apply(this, arguments)
  );
}
const rN = w.createContext(null),
  oN = w.createContext(null),
  Dw = w.createContext(null),
  Da = w.createContext(null),
  Xs = w.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  Pw = w.createContext(null);
function Hd() {
  return w.useContext(Da) != null;
}
function sN() {
  return Hd() || ht(!1), w.useContext(Da).location;
}
function iN() {
  let { matches: e } = w.useContext(Xs),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function lN(e, t) {
  return aN(e, t);
}
function aN(e, t, n, r) {
  Hd() || ht(!1);
  let { navigator: o } = w.useContext(Dw),
    { matches: s } = w.useContext(Xs),
    i = s[s.length - 1],
    l = i ? i.params : {};
  i && i.pathname;
  let a = i ? i.pathnameBase : "/";
  i && i.route;
  let c = sN(),
    u;
  if (t) {
    var f;
    let x = typeof t == "string" ? Ra(t) : t;
    a === "/" || ((f = x.pathname) != null && f.startsWith(a)) || ht(!1),
      (u = x);
  } else u = c;
  let d = u.pathname || "/",
    m = d;
  if (a !== "/") {
    let x = a.replace(/^\//, "").split("/");
    m = "/" + d.replace(/^\//, "").split("/").slice(x.length).join("/");
  }
  let p = IT(e, { pathname: m }),
    h = pN(
      p &&
        p.map((x) =>
          Object.assign({}, x, {
            params: Object.assign({}, l, x.params),
            pathname: fo([
              a,
              o.encodeLocation
                ? o.encodeLocation(x.pathname).pathname
                : x.pathname,
            ]),
            pathnameBase:
              x.pathnameBase === "/"
                ? a
                : fo([
                    a,
                    o.encodeLocation
                      ? o.encodeLocation(x.pathnameBase).pathname
                      : x.pathnameBase,
                  ]),
          })
        ),
      s,
      n,
      r
    );
  return t && h
    ? w.createElement(
        Da.Provider,
        {
          value: {
            location: _l(
              {
                pathname: "/",
                search: "",
                hash: "",
                state: null,
                key: "default",
              },
              u
            ),
            navigationType: Hn.Pop,
          },
        },
        h
      )
    : h;
}
function cN() {
  let e = yN(),
    t = tN(e)
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
const uN = w.createElement(cN, null);
class fN extends w.Component {
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
          w.createElement(Pw.Provider, {
            value: this.state.error,
            children: this.props.component,
          })
        )
      : this.props.children;
  }
}
function dN(e) {
  let { routeContext: t, match: n, children: r } = e,
    o = w.useContext(rN);
  return (
    o &&
      o.static &&
      o.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (o.staticContext._deepestRenderedBoundaryId = n.route.id),
    w.createElement(Xs.Provider, { value: t }, r)
  );
}
function pN(e, t, n, r) {
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
      x = null;
    n &&
      ((m = l && f.route.id ? l[f.route.id] : void 0),
      (h = f.route.errorElement || uN),
      a &&
        (c < 0 && d === 0
          ? ((p = !0), (x = null))
          : c === d &&
            ((p = !0), (x = f.route.hydrateFallbackElement || null))));
    let v = t.concat(i.slice(0, d + 1)),
      g = () => {
        let y;
        return (
          m
            ? (y = h)
            : p
            ? (y = x)
            : f.route.Component
            ? (y = w.createElement(f.route.Component, null))
            : f.route.element
            ? (y = f.route.element)
            : (y = u),
          w.createElement(dN, {
            match: f,
            routeContext: { outlet: u, matches: v, isDataRoute: n != null },
            children: y,
          })
        );
      };
    return n && (f.route.ErrorBoundary || f.route.errorElement || d === 0)
      ? w.createElement(fN, {
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
var Au = (function (e) {
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
})(Au || {});
function mN(e) {
  let t = w.useContext(oN);
  return t || ht(!1), t;
}
function hN(e) {
  let t = w.useContext(Xs);
  return t || ht(!1), t;
}
function gN(e) {
  let t = hN(),
    n = t.matches[t.matches.length - 1];
  return n.route.id || ht(!1), n.route.id;
}
function yN() {
  var e;
  let t = w.useContext(Pw),
    n = mN(Au.UseRouteError),
    r = gN(Au.UseRouteError);
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function Fu(e) {
  ht(!1);
}
function vN(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: o = Hn.Pop,
    navigator: s,
    static: i = !1,
    future: l,
  } = e;
  Hd() && ht(!1);
  let a = t.replace(/^\/*/, "/"),
    c = w.useMemo(
      () => ({
        basename: a,
        navigator: s,
        static: i,
        future: _l({ v7_relativeSplatPath: !1 }, l),
      }),
      [a, l, s, i]
    );
  typeof r == "string" && (r = Ra(r));
  let {
      pathname: u = "/",
      search: f = "",
      hash: d = "",
      state: m = null,
      key: p = "default",
    } = r,
    h = w.useMemo(() => {
      let x = _w(u, a);
      return x == null
        ? null
        : {
            location: { pathname: x, search: f, hash: d, state: m, key: p },
            navigationType: o,
          };
    }, [a, u, f, d, m, p, o]);
  return h == null
    ? null
    : w.createElement(
        Dw.Provider,
        { value: c },
        w.createElement(Da.Provider, { children: n, value: h })
      );
}
function wN(e) {
  let { children: t, location: n } = e;
  return lN(Mu(t), n);
}
new Promise(() => {});
function Mu(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    w.Children.forEach(e, (r, o) => {
      if (!w.isValidElement(r)) return;
      let s = [...t, o];
      if (r.type === w.Fragment) {
        n.push.apply(n, Mu(r.props.children, s));
        return;
      }
      r.type !== Fu && ht(!1), !r.props.index || !r.props.children || ht(!1);
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
      r.props.children && (i.children = Mu(r.props.children, s)), n.push(i);
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
 */ const SN = "6";
try {
  window.__reactRouterVersion = SN;
} catch {}
const xN = "startTransition",
  Eh = Mh[xN];
function bN(e) {
  let { basename: t, children: n, future: r, window: o } = e,
    s = w.useRef();
  s.current == null && (s.current = FT({ window: o, v5Compat: !0 }));
  let i = s.current,
    [l, a] = w.useState({ action: i.action, location: i.location }),
    { v7_startTransition: c } = r || {},
    u = w.useCallback(
      (f) => {
        c && Eh ? Eh(() => a(f)) : a(f);
      },
      [a, c]
    );
  return (
    w.useLayoutEffect(() => i.listen(u), [i, u]),
    w.createElement(vN, {
      basename: t,
      children: n,
      location: l.location,
      navigationType: l.action,
      navigator: i,
      future: r,
    })
  );
}
var kh;
(function (e) {
  (e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState");
})(kh || (kh = {}));
var _h;
(function (e) {
  (e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration");
})(_h || (_h = {}));
const CN = (e, t) => {
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
              await De.get(lP + e)
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
              await De.get(X0 + t + "/", h)
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
  },
  EN = nR(xw),
  kN = rR(EN),
  Rh = () => {
    const { brokerSubmissionId: e } = iN(),
      t = localStorage.getItem("profileName") || iP,
      { data1: n, data2: r, isLoading: o, error1: s, error2: i } = CN(t, e);
    return S.jsxs("div", {
      children: [
        S.jsx("h1", { children: "ProfileForm" }),
        S.jsx(kN, {
          profileData: n,
          submissionData: r,
          isLoading: o,
          profileError: s,
          submissionError: i,
        }),
      ],
    });
  };
function _N() {
  return S.jsx(av, {
    children: S.jsxs(wN, {
      children: [
        S.jsx(Fu, { path: "/", element: S.jsx(Rh, {}) }),
        S.jsx(Fu, { path: "/:brokerSubmissionId", element: S.jsx(Rh, {}) }),
      ],
    }),
  });
}
let Vd = "generic";
window.props !== void 0 && (Vd = window.props.profile_name || "generic");
localStorage.setItem("profileName", Vd);
const RN = "/profile/profile/" + Vd + "/ui/";
Sc.createRoot(document.getElementById("root")).render(
  S.jsx(Dl.StrictMode, {
    children: S.jsx(bN, { basename: RN, children: S.jsx(_N, {}) }),
  })
);
