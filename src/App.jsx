import React, {useState, useRef, useEffect, useCallback} from 'react';
import './App.css';
import distortionCurve from './distortionCurve';
import Oscilloscope from './Oscilloscope';
import FunctionGraph from './FunctionGraph';
import TremoloNode from './TremoloNode';
import PlatverbNode from './PlatverbNode';

const audioContext = new AudioContext();

function makeDistortionNode() {
  const distortion = audioContext.createWaveShaper();

  distortion.curve = distortionCurve.sigmoid();
  console.log(distortion.curve);

  distortion.oversample = '4x';
  return distortion;
}

function makeAudioGraph(audioElement) {
  const track = audioContext.createMediaElementSource(audioElement);
  const gain = audioContext.createGain();
  const distortion = makeDistortionNode();
  const tremolo = new TremoloNode(audioContext);
  const reverb = new PlatverbNode(audioContext);

  const nodes = [
    track,
    gain,
    distortion,
    tremolo,
    reverb,
    audioContext.destination,
  ];
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }

  return {
    track,
    distortion,
    gain,
    tremolo,
    reverb,
  };
}

function Slider({name, min, max, step, steps, value, onChange}) {
  return (
    <label>
      {name}
      <br />
      <input
        type="range"
        min={min}
        max={max}
        step={step != null ? step : (max - min) / steps}
        value={value}
        onChange={useCallback(
          (e) => {
            onChange(name, parseFloat(e.currentTarget.value));
          },
          [onChange, name]
        )}
      />
      <br />
      <input
        value={value.toFixed(2)}
        onChange={useCallback(
          (e) => {
            onChange(
              name,
              Math.min(Math.max(parseFloat(e.currentTarget.value), min), max)
            );
          },
          [onChange, name, max, min]
        )}
      />
    </label>
  );
}

const panelStyle = {margin: 8, padding: 8, border: 'solid 1px black'};

function Rack({audioGraph}) {
  const [gainAmount, setGainAmount] = useState(4);
  const [distortionType, setDistortionType] = useState({
    name: 'linear',
    curve: distortionCurve.linear(),
  });

  const gainPanel = (
    <div style={panelStyle}>
      <Slider
        name="gain"
        min={0.1}
        max={100}
        step={0.1}
        value={gainAmount}
        onChange={(name, value) => {
          const newGain = value;
          const gainNode = audioGraph.gain;
          if (gainNode) {
            gainNode.gain.linearRampToValueAtTime(
              newGain,
              audioContext.currentTime + 0.01
            );
          }

          setGainAmount(newGain);
        }}
      />
    </div>
  );

  const distortionPanel = (
    <div style={panelStyle}>
      <label>
        distortion
        <br />
        <select
          style={{margin: '8px 0'}}
          value={distortionType.name}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
            const distortionNode = audioGraph.distortion;
            if (distortionNode) {
              distortionNode.curve = distortionCurve[newValue]();
            }

            setDistortionType({
              name: newValue,
              curve: distortionNode.curve,
            });
          }}
        >
          {Object.keys(distortionCurve).map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </label>{' '}
      <div>
        <FunctionGraph width={200} height={100} data={distortionType.curve} />
      </div>
    </div>
  );

  const tremoloNode = audioGraph.tremolo;
  const [tremoloParams, setTremoloParams] = useState(
    () =>
      new Map(
        Array.from(tremoloNode.parameters).map(([name, param]) => [
          name,
          param.value,
        ])
      )
  );
  const setTremoloParam = useCallback(
    (name, value) => {
      tremoloNode.parameters
        .get(name)
        .linearRampToValueAtTime(value, audioContext.currentTime + 0.01);
      setTremoloParams((params) => {
        const updated = new Map(params);
        updated.set(name, value);
        return updated;
      });
    },
    [setTremoloParams, tremoloNode.parameters]
  );

  const tremoloPanel = (
    <div style={panelStyle}>
      tremolo
      {Array.from(tremoloNode.parameters).map(([name, param]) => {
        return (
          <div key={name}>
            <Slider
              name={name}
              min={param.minValue}
              max={param.maxValue}
              steps={100}
              value={tremoloParams.get(name)}
              onChange={setTremoloParam}
            />
          </div>
        );
      })}
    </div>
  );

  const reverbNode = audioGraph.reverb;
  const [reverbParams, setReverbParams] = useState(
    () =>
      new Map(
        Object.entries(PlatverbNode.getParamDefaults()).map(([name, value]) => [
          name,
          value,
        ])
      )
  );
  const setReverbParam = useCallback(
    (name, value) => {
      reverbNode.setNamedParam(name, value);
      setReverbParams((params) => {
        const updated = new Map(params);
        updated.set(name, value);
        return updated;
      });
    },
    [setReverbParams, reverbNode]
  );
  const reverbPanel = (
    <div style={panelStyle}>
      reverb
      <div className="Panel_columns">
        {Object.keys(PlatverbNode.getParamDefaults()).map((name) => {
          return (
            <div key={name}>
              <Slider
                name={name}
                min={0}
                max={1}
                steps={100}
                value={reverbParams.get(name)}
                onChange={setReverbParam}
              />
            </div>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    audioGraph.gain.gain.setValueAtTime(gainAmount, audioContext.currentTime);
    setReverbParam('Wet', 0);
    setTremoloParam('depth', 0);
  }, []);

  return (
    <div style={{display: 'flex'}}>
      {gainPanel}
      {distortionPanel}
      {tremoloPanel}
      {reverbPanel}
    </div>
  );
}

function App() {
  const [fileURL, setFileURL] = useState('/audio/z.wav');
  const audioElRef = useRef(null);
  const audioGraphRef = useRef(null);
  const [oscilloscopeSource, setOscilloscopeSource] = useState(null);

  useEffect(() => {
    if (audioElRef.current && !audioGraphRef.current) {
      audioGraphRef.current = makeAudioGraph(audioElRef.current);

      setOscilloscopeSource(audioGraphRef.current.tremolo);
    }
  }, []);

  return (
    <div>
      {audioGraphRef.current && <Rack audioGraph={audioGraphRef.current} />}
      <div style={{display: 'flex', flex: 1}}>
        <Oscilloscope audioContext={audioContext} source={oscilloscopeSource} />
        <div>
          <audio
            style={{display: 'block', padding: 8}}
            controls
            autoPlay
            loop
            src={fileURL}
            ref={audioElRef}
          />
          <input
            style={{display: 'block', padding: 8}}
            type="file"
            onChange={(e) => {
              const file = e.currentTarget.files[0];
              if (!file) return;
              setFileURL(URL.createObjectURL(file));
            }}
          />
        </div>
      </div>
    </div>
  );
}

function StartPage() {
  const [started, setStarted] = useState(audioContext.state === 'running');

  const [modulesReady, setModulesReady] = useState(false);

  useEffect(() => {
    Promise.all([
      PlatverbNode.load(audioContext),
      TremoloNode.load(audioContext),
    ]).then(() => {
      setModulesReady(true);
    });
  }, []);

  return (
    <div>
      {started ? (
        modulesReady ? (
          <App />
        ) : (
          'loading modules'
        )
      ) : (
        <button
          onClick={() => {
            // chrome autoplay policy requires a click to start audio context
            audioContext.resume();
            setStarted(true);
          }}
        >
          start
        </button>
      )}
    </div>
  );
}

export default StartPage;
