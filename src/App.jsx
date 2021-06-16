import React, {useState, useMemo, useRef, useEffect, useCallback} from 'react';
import './App.css';
import distortionCurve from './distortionCurve';
import Oscilloscope from './Oscilloscope';
import FunctionGraph from './FunctionGraph';
import TremoloNode from './TremoloNode';
import PlatverbNode from './PlatverbNode';
import demoSound from '../audio/z.wav';
import useLocalStorage from './useLocalStorage';
import VUMeter from './VUMeter';
import {tremolo} from './tremolo';

let demoNumber = parseInt(new URLSearchParams(window.location.search).get('d'));
if (isNaN(demoNumber)) {
  demoNumber = 4;
}

const audioContext = new AudioContext();

function makeDistortionNode() {
  const distortion = audioContext.createWaveShaper();

  distortion.curve = distortionCurve.sigmoid();

  distortion.oversample = '4x';
  return distortion;
}

function makeAudioGraph(audioElement) {
  const track = audioContext.createMediaElementSource(audioElement);
  const pregain = audioContext.createGain();
  const distortion =
    demoNumber != 1 && demoNumber < 4 ? null : makeDistortionNode();
  const tremolo =
    demoNumber != 2 && demoNumber < 4 ? null : new TremoloNode(audioContext);
  const reverb =
    demoNumber != 3 && demoNumber < 4 ? null : new PlatverbNode(audioContext);
  const postgain = audioContext.createGain();

  const nodes = [
    track,
    pregain,
    distortion,
    tremolo,
    reverb,
    postgain,
    audioContext.destination,
  ].filter(Boolean);
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].connect(nodes[i + 1]);
  }

  return {
    track,
    pregain,
    distortion,
    tremolo,
    reverb,
    postgain,
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

function TremoloPanel({tremoloNode}) {
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

  const tremoloGraph = useMemo(() => {
    const data = [];
    const samples = 200;

    for (let i = 0; i < samples; i++) {
      data.push(
        tremolo(
          1,
          i,
          tremoloParams.get('rate'),
          tremoloParams.get('depth'),
          samples
        ) *
          2 -
          1
      );
    }
    return data;
  }, [tremoloParams]);

  useEffect(() => {
    setTremoloParam('depth', 0);
  }, []);

  return (
    <div style={panelStyle}>
      tremolo
      {Array.from(tremoloNode.parameters).map(([name, param]) => {
        return (
          <div key={name}>
            <Slider
              name={name}
              min={param.minValue}
              max={param.maxValue}
              steps={200}
              value={tremoloParams.get(name)}
              onChange={setTremoloParam}
            />
          </div>
        );
      })}
      <div style={{padding: '8px 0'}}>
        <FunctionGraph width={200} height={100} data={tremoloGraph} />
      </div>
    </div>
  );
}

function DistortionPanel({distortionNode}) {
  const [distortionType, setDistortionType] = useState({
    name: 'linear',
    curve: distortionCurve.linear(),
  });
  return (
    <div style={panelStyle}>
      <label>
        distortion
        <br />
        <select
          style={{margin: '8px 0'}}
          value={distortionType.name}
          onChange={(e) => {
            const newValue = e.currentTarget.value;
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
      </label>
      <div>
        <FunctionGraph width={200} height={100} data={distortionType.curve} />
      </div>
    </div>
  );
}

function GainPanel({name, initialValue, gainNode, min, max, step, persists}) {
  const [gainAmount, setGainAmount] = persists
    ? useLocalStorage(name, initialValue)
    : useState(initialValue);

  useEffect(() => {
    gainNode.gain.setValueAtTime(gainAmount, audioContext.currentTime);
  }, []);

  return (
    <Slider
      name={name}
      {...{min, max, step}}
      value={gainAmount}
      onChange={(name, value) => {
        const newGain = value;
        if (gainNode) {
          gainNode.gain.linearRampToValueAtTime(
            newGain,
            audioContext.currentTime + 0.01
          );
        }

        setGainAmount(newGain);
      }}
    />
  );
}

function ReverbPanel({reverbNode}) {
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

  useEffect(() => {
    setReverbParam('Wet', 0);
  }, []);

  return (
    <div style={panelStyle}>
      reverb
      <div className="ReverbPanel_columns">
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
}

function Rack({audioGraph}) {
  const pregainPanel = (
    <div style={panelStyle}>
      <GainPanel
        name="input gain"
        initialValue={demoNumber === 3 ? 1 : 4}
        min={0.1}
        max={20}
        step={0.01}
        gainNode={audioGraph.pregain}
        persists={false}
      />
    </div>
  );

  const distortionPanel =
    audioGraph.distortion == null ? null : (
      <DistortionPanel distortionNode={audioGraph.distortion} />
    );

  const tremoloPanel =
    audioGraph.tremolo == null ? null : (
      <TremoloPanel tremoloNode={audioGraph.tremolo} />
    );

  const reverbPanel =
    audioGraph.reverb == null ? null : (
      <ReverbPanel reverbNode={audioGraph.reverb} />
    );

  const postgainPanel = (
    <div style={panelStyle}>
      <GainPanel
        name="output gain"
        initialValue={1}
        min={0.01}
        max={1.2}
        step={0.01}
        gainNode={audioGraph.postgain}
        persists={true}
      />
      <div style={{margin: '8px 0'}}>
        <VUMeter
          audioContext={audioContext}
          source={audioGraph.postgain}
          scale={1}
        />
      </div>
    </div>
  );

  return (
    <div style={{display: 'flex'}}>
      {pregainPanel}
      {distortionPanel}
      {tremoloPanel}
      {reverbPanel}
      {postgainPanel}
    </div>
  );
}

function App() {
  const [fileURL, setFileURL] = useState(demoSound);
  const audioElRef = useRef(null);
  const audioGraphRef = useRef(null);
  const [oscilloscopeSource, setOscilloscopeSource] = useState(null);

  useEffect(() => {
    if (audioElRef.current && !audioGraphRef.current) {
      audioGraphRef.current = makeAudioGraph(audioElRef.current);

      setOscilloscopeSource(
        audioGraphRef.current.reverb ||
          audioGraphRef.current.tremolo ||
          audioGraphRef.current.distortion ||
          audioGraphRef.current.postgain
      );
    }
  }, []);

  return (
    <div>
      <div style={{display: 'flex', flex: 1}}>
        <div style={{padding: '8px 8px 4px 8px'}}>
          <Oscilloscope
            audioContext={audioContext}
            source={oscilloscopeSource}
          />
        </div>
        <div style={panelStyle}>
          input
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
      {audioGraphRef.current && <Rack audioGraph={audioGraphRef.current} />}
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
