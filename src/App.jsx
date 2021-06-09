import React, {useState, useRef, useEffect, useCallback} from 'react';
import './App.css';
import distortionCurve from './distortionCurve';
import Oscilloscope from './Oscilloscope';
import FunctionGraph from './FunctionGraph';
import {loadTremoloProcessor, TremoloNode} from './TremoloNode';

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
  track.connect(gain);
  gain.connect(distortion);
  distortion.connect(tremolo);

  tremolo.connect(audioContext.destination);

  return {
    track,
    distortion,
    gain,
    tremolo,
  };
}

function Slider({name, min, max, steps, value, onChange}) {
  return (
    <label>
      {name}
      <br />
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / steps}
        value={value}
        onChange={useCallback(
          (e) => {
            onChange(name, parseFloat(e.currentTarget.value));
          },
          [onChange, name]
        )}
      />
      <br />
      <input value={value.toFixed(2)} readOnly />
    </label>
  );
}

function Rack({audioGraph}) {
  const [gainAmount, setGainAmount] = useState(4);
  const [distortionType, setDistortionType] = useState({
    name: 'sigmoid',
    curve: distortionCurve.sigmoid(),
  });
  useEffect(() => {
    audioGraph.gain.gain.setValueAtTime(gainAmount, audioContext.currentTime);
  }, []);

  const gainPanel = (
    <div style={{margin: 8}}>
      <label>
        gain
        <br />
        <input
          type="range"
          min={0.1}
          max={100}
          step={0.1}
          value={gainAmount}
          onChange={(e) => {
            const newGain = Math.max(0.1, parseFloat(e.currentTarget.value));
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
        <br />
        <input value={gainAmount} readOnly />
      </label>
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
    <div style={{margin: 8}}>
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

  const distortionPanel = (
    <div style={{margin: 8}}>
      <label>
        distortion
        <br />
        <select
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

  return (
    <div style={{display: 'flex'}}>
      {gainPanel}
      {distortionPanel}
      {tremoloPanel}
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
      <input
        type="file"
        onChange={(e) => {
          const file = e.currentTarget.files[0];
          if (!file) return;
          setFileURL(URL.createObjectURL(file));
        }}
      />
      <audio controls autoPlay loop src={fileURL} ref={audioElRef} />
      {audioGraphRef.current && <Rack audioGraph={audioGraphRef.current} />}
      <Oscilloscope audioContext={audioContext} source={oscilloscopeSource} />
    </div>
  );
}

function StartPage() {
  const [started, setStarted] = useState(audioContext.state === 'running');

  const [modulesReady, setModulesReady] = useState(false);

  useEffect(() => {
    loadTremoloProcessor(audioContext).then(() => {
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
