import {r as e, R as t, a as r} from './vendor.b1c20c04.js';
function a(e, t) {
  const r = Math.exp(e * t);
  return (r - 1) / (r + 1);
}
function n(e) {
  return Math.sin(e * Math.PI) / 2 + 0.5;
}
var o = {
  linear: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1), (t[r] = e);
    return t;
  },
  sine: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      t[r] = 2 * ((e = r / 256), -(Math.cos(Math.PI * e) - 1) / 2) - 1;
    return t;
  },
  cubic: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      t[r] =
        2 *
          ((e = r / 256) < 0.5
            ? 4 * e * e * e
            : 1 - Math.pow(-2 * e + 2, 3) / 2) -
        1;
    return t;
  },
  sigmoid: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1), (t[r] = a(e, 10));
    return t;
  },
  sinefold: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1), (t[r] = 2 * n(e) - 1);
    return t;
  },
  hardclip: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1),
        (t[r] = (1 * (e > 0.8 ? 0.8 : e < -0.8 ? -0.8 : e)) / 0.8);
    return t;
  },
  rectify: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1), (t[r] = Math.abs(e));
    return t;
  },
  halfrectify: function () {
    for (var e, t = new Float32Array(256), r = 0; r < 256; ++r)
      (e = (2 * r) / 256 - 1), (t[r] = e < 0 ? 0 : e);
    return t;
  },
};
function s({audioContext: r, source: a}) {
  const n = e.exports.useRef(null);
  return (
    e.exports.useEffect(() => {
      const e = n.current;
      if (!e || !a) return;
      const t = r.createAnalyser();
      a.connect(t), (t.fftSize = 1024);
      var o = t.frequencyBinCount,
        s = new Uint8Array(o);
      const l = e.getContext('2d');
      let i,
        u = 0;
      return (
        (i = requestAnimationFrame(function r() {
          if ((u++, u % 5 == 0)) {
            t.getByteTimeDomainData(s),
              l.clearRect(0, 0, e.width, e.height),
              (l.fillStyle = 'rgb(200, 200, 200)'),
              l.fillRect(0, 0, e.width, e.height),
              (l.lineWidth = 2),
              (l.strokeStyle = 'rgb(0, 0, 0)'),
              l.beginPath();
            let r = (1 * e.width) / o,
              a = 0;
            for (let t = 0; t < o; t++) {
              let n = s[t] / 128,
                o = e.height - (n * e.height) / 2;
              0 === t ? l.moveTo(a, o) : l.lineTo(a, o), (a += r);
            }
            l.lineTo(e.width, e.height / 2), l.stroke();
          }
          i = requestAnimationFrame(r);
        })),
        () => {
          cancelAnimationFrame(i);
        }
      );
    }, [r, a]),
    t.createElement('canvas', {width: 800, height: 400, ref: n})
  );
}
function l({data: r, width: a, height: n}) {
  const o = e.exports.useRef(null);
  return (
    e.exports.useEffect(() => {
      const e = o.current;
      if (!e) return;
      const t = e.getContext('2d');
      t.clearRect(0, 0, e.width, e.height),
        (t.fillStyle = 'rgb(200, 200, 200)'),
        t.fillRect(0, 0, e.width, e.height),
        (t.lineWidth = 2),
        (t.strokeStyle = 'rgb(0, 0, 0)'),
        t.beginPath();
      let a = (1 * e.width) / r.length,
        n = 0;
      for (let o = 0; o < r.length; o++) {
        let s = (1 - (r[o] + 1) / 2) * e.height;
        0 === o ? t.moveTo(n, s) : t.lineTo(n, s), (n += a);
      }
      t.stroke();
    }, [r]),
    t.createElement('canvas', {width: a, height: n, ref: o})
  );
}
class i extends AudioWorkletNode {
  constructor(e) {
    super(e, 'tremolo-processor');
  }
  static load(e) {
    return e.audioWorklet.addModule('tremoloProcessor.js');
  }
}
class u extends AudioWorkletNode {
  constructor(e, t, r) {
    super(e, t, r);
    var a = this;
    this.port.onmessage = function (e) {
      var t = e.data;
      try {
        t = JSON.parse(t);
      } catch (r) {}
      t && ('descriptor' == t.type && (a.descriptor = t.data), a.onmessage(t));
    };
  }
  setParam(e, t) {
    this.port.postMessage({type: 'param', key: e, value: t});
  }
  setPatch(e) {
    this.port.postMessage({type: 'patch', data: e});
  }
  setSysex(e) {
    this.port.postMessage({type: 'sysex', data: e});
  }
  onMidi(e) {
    this.port.postMessage({type: 'midi', data: e});
  }
  set midiIn(e) {
    this._midiInPort &&
      (this._midiInPort.close(), (this._midiInPort.onmidimessage = null)),
      (this._midiInPort = e),
      (this._midiInPort.onmidimessage = function (e) {
        this.port.postMessage({type: 'midi', data: e.data});
      }.bind(this));
  }
  sendMessage(e, t, r) {
    this.port.postMessage({type: 'msg', verb: e, prop: t, data: r});
  }
  get gui() {
    return null;
  }
  onmessage(e) {}
  getState() {
    return Promise.resolve(null);
  }
  setState(e) {
    return Promise.resolve();
  }
}
const c = {
    Dry: 1,
    Wet: 0.5,
    PreDelay: 0,
    Size: 0.5,
    Diffusion: 1,
    Decay: 0.5,
    InputHighDamp: 1,
    InputLowDamp: 1,
    ReverbHighDamp: 1,
    ReverbLowDamp: 1,
  },
  m = {};
[
  'Dry',
  'Wet',
  'PreDelay',
  'InputLowDamp',
  'InputHighDamp',
  'Size',
  'Diffusion',
  'Decay',
  'ReverbHighDamp',
  'ReverbLowDamp',
  'ModSpeed',
  'ModShape',
  'ModDepth',
  'Freeze',
  'Clear',
  'FreezeToggle',
  'ClearToggle',
  'DryCv',
  'WetCv',
  'InputLowDampCv',
  'InputHighDampCv',
  'SizeCv',
  'DiffusionCv',
  'DecayCv',
  'ReverbHighDampCv',
  'ReverbLowDampCv',
  'ModSpeedCv',
  'ModShapeCv',
  'ModDepthCv',
  'TunedMode',
  'DiffuseInput',
].forEach((e, t) => {
  m[e] = t;
});
class p extends u {
  constructor(e, t) {
    ((t = t || {}).numberOfInputs = 1),
      (t.numberOfOutputs = 1),
      (t.inputChannelCount = [2]),
      (t.outputChannelCount = [2]),
      super(e, 'Platverb', t);
  }
  setNamedParam(e, t) {
    this.setParam(m[e], t);
  }
  static getParamDefaults() {
    return c;
  }
  static load(e) {
    return e.audioWorklet.addModule('wasm/compiled/PlatverbModule.js');
  }
}
const d = new AudioContext();
function h(e) {
  const t = d.createMediaElementSource(e),
    r = d.createGain(),
    a = (function () {
      const e = d.createWaveShaper();
      return (
        (e.curve = o.sigmoid()), console.log(e.curve), (e.oversample = '4x'), e
      );
    })(),
    n = new i(d),
    s = new p(d),
    l = [t, r, a, n, s, d.destination];
  for (let o = 0; o < l.length - 1; o++) l[o].connect(l[o + 1]);
  return {track: t, distortion: a, gain: r, tremolo: n, reverb: s};
}
function g({
  name: r,
  min: a,
  max: n,
  step: o,
  steps: s,
  value: l,
  onChange: i,
}) {
  return t.createElement(
    'label',
    null,
    r,
    t.createElement('br', null),
    t.createElement('input', {
      type: 'range',
      min: a,
      max: n,
      step: null != o ? o : (n - a) / s,
      value: l,
      onChange: e.exports.useCallback(
        (e) => {
          i(r, parseFloat(e.currentTarget.value));
        },
        [i, r]
      ),
    }),
    t.createElement('br', null),
    t.createElement('input', {
      value: l.toFixed(2),
      onChange: e.exports.useCallback(
        (e) => {
          i(r, Math.min(Math.max(parseFloat(e.currentTarget.value), a), n));
        },
        [i, r, n, a]
      ),
    })
  );
}
const f = {margin: 8, padding: 8, border: 'solid 1px black'};
function v({audioGraph: r}) {
  const [a, n] = e.exports.useState(4),
    [s, i] = e.exports.useState({name: 'linear', curve: o.linear()}),
    u = t.createElement(
      'div',
      {style: f},
      t.createElement(g, {
        name: 'gain',
        min: 0.1,
        max: 100,
        step: 0.1,
        value: a,
        onChange: (e, t) => {
          const a = t,
            o = r.gain;
          o && o.gain.linearRampToValueAtTime(a, d.currentTime + 0.01), n(a);
        },
      })
    ),
    c = t.createElement(
      'div',
      {style: f},
      t.createElement(
        'label',
        null,
        'distortion',
        t.createElement('br', null),
        t.createElement(
          'select',
          {
            style: {margin: '8px 0'},
            value: s.name,
            onChange: (e) => {
              const t = e.currentTarget.value,
                a = r.distortion;
              a && (a.curve = o[t]()), i({name: t, curve: a.curve});
            },
          },
          Object.keys(o).map((e) =>
            t.createElement('option', {key: e, value: e}, e)
          )
        )
      ),
      ' ',
      t.createElement(
        'div',
        null,
        t.createElement(l, {width: 200, height: 100, data: s.curve})
      )
    ),
    m = r.tremolo,
    [h, v] = e.exports.useState(
      () => new Map(Array.from(m.parameters).map(([e, t]) => [e, t.value]))
    ),
    y = e.exports.useCallback(
      (e, t) => {
        m.parameters.get(e).linearRampToValueAtTime(t, d.currentTime + 0.01),
          v((r) => {
            const a = new Map(r);
            return a.set(e, t), a;
          });
      },
      [v, m.parameters]
    ),
    x = t.createElement(
      'div',
      {style: f},
      'tremolo',
      Array.from(m.parameters).map(([e, r]) =>
        t.createElement(
          'div',
          {key: e},
          t.createElement(g, {
            name: e,
            min: r.minValue,
            max: r.maxValue,
            steps: 100,
            value: h.get(e),
            onChange: y,
          })
        )
      )
    ),
    E = r.reverb,
    [b, C] = e.exports.useState(
      () =>
        new Map(Object.entries(p.getParamDefaults()).map(([e, t]) => [e, t]))
    ),
    w = e.exports.useCallback(
      (e, t) => {
        E.setNamedParam(e, t),
          C((r) => {
            const a = new Map(r);
            return a.set(e, t), a;
          });
      },
      [C, E]
    ),
    M = t.createElement(
      'div',
      {style: f},
      'reverb',
      t.createElement(
        'div',
        {className: 'Panel_columns'},
        Object.keys(p.getParamDefaults()).map((e) =>
          t.createElement(
            'div',
            {key: e},
            t.createElement(g, {
              name: e,
              min: 0,
              max: 1,
              steps: 100,
              value: b.get(e),
              onChange: w,
            })
          )
        )
      )
    );
  return (
    e.exports.useEffect(() => {
      r.gain.gain.setValueAtTime(a, d.currentTime), w('Wet', 0), y('depth', 0);
    }, []),
    t.createElement('div', {style: {display: 'flex'}}, u, c, x, M)
  );
}
function y() {
  const [r, a] = e.exports.useState('/webaudio/audio/z.wav'),
    n = e.exports.useRef(null),
    o = e.exports.useRef(null),
    [l, i] = e.exports.useState(null);
  return (
    e.exports.useEffect(() => {
      n.current &&
        !o.current &&
        ((o.current = h(n.current)), i(o.current.tremolo));
    }, []),
    t.createElement(
      'div',
      null,
      o.current && t.createElement(v, {audioGraph: o.current}),
      t.createElement(
        'div',
        {style: {display: 'flex', flex: 1}},
        t.createElement(s, {audioContext: d, source: l}),
        t.createElement(
          'div',
          null,
          t.createElement('audio', {
            style: {display: 'block', padding: 8},
            controls: !0,
            autoPlay: !0,
            loop: !0,
            src: r,
            ref: n,
          }),
          t.createElement('input', {
            style: {display: 'block', padding: 8},
            type: 'file',
            onChange: (e) => {
              const t = e.currentTarget.files[0];
              t && a(URL.createObjectURL(t));
            },
          })
        )
      )
    )
  );
}
function x() {
  const [r, a] = e.exports.useState('running' === d.state),
    [n, o] = e.exports.useState(!1);
  return (
    e.exports.useEffect(() => {
      Promise.all([p.load(d), i.load(d)]).then(() => {
        o(!0);
      });
    }, []),
    t.createElement(
      'div',
      null,
      r
        ? n
          ? t.createElement(y, null)
          : 'loading modules'
        : t.createElement(
            'button',
            {
              onClick: () => {
                d.resume(), a(!0);
              },
            },
            'start'
          )
    )
  );
}
r.render(
  t.createElement(t.StrictMode, null, t.createElement(x, null)),
  document.getElementById('root')
);
