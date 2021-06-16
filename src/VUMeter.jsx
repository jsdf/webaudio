import React, {useRef, useEffect} from 'react';

const frameSkip = 1;
const historyFrames = 10;

export default function VUMeter({audioContext, source, scale}) {
  const canvasRef = useRef(null);
  const historyRef = useRef({
    cursor: 0,
    values: new Array(historyFrames).fill(0),
  });
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !source) return;
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Float32Array(bufferLength);
    const ctx = canvas.getContext('2d');

    let animFrame;
    let count = 0;
    function draw() {
      count++;
      if (count % frameSkip == 0) {
        analyser.getFloatTimeDomainData(dataArray);
        ctx.fillStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let max = 0;
        for (let i = 0; i < bufferLength; i++) {
          let power = dataArray[i];
          max = Math.max(Math.abs(power));
        }
        historyRef.current.values[historyRef.current.cursor] = max;
        historyRef.current.cursor++;
        historyRef.current.cursor = historyRef.current.cursor % historyFrames;

        const avg =
          historyRef.current.values.reduce((acc, val) => acc + val) /
          historyFrames;

        const avgScaled = avg * scale;

        ctx.fillStyle = avg < 1 ? 'rgb(0, 0, 0)' : 'rgb(200, 0, 0)';
        ctx.fillRect(
          0,
          canvas.height - canvas.height * avgScaled,
          canvas.width,
          canvas.height * avgScaled
        );
        ctx.stroke();
      }
      animFrame = requestAnimationFrame(draw);
    }
    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [audioContext, source]);
  return <canvas width={40} height={230} ref={canvasRef} />;
}
