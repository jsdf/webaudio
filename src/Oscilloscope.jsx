import React, {useRef, useState, useEffect} from 'react';

export default function Oscilloscope({audioContext, source}) {
  const canvasRef = useRef(null);
  const frameSkipRef = useRef(4);
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !source) return;
    const analyser = audioContext.createAnalyser();

    source.connect(analyser);
    analyser.fftSize = 2048 / 2;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Float32Array(bufferLength);
    const ctx = canvas.getContext('2d');

    let animFrame;
    let count = 0;
    function draw() {
      count++;

      if (frameSkipRef.current === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(200, 200, 200, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      if (frameSkipRef.current !== 0 && count % frameSkipRef.current == 0) {
        analyser.getFloatTimeDomainData(dataArray);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(200, 200, 200, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        let sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          let v = dataArray[i] + 1;
          let y = canvas.height - (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
      }
      animFrame = requestAnimationFrame(draw);
    }
    animFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [audioContext, source]);
  return (
    <canvas
      width={800}
      height={400}
      ref={canvasRef}
      style={{cursor: 'pointer'}}
      onClick={() => {
        frameSkipRef.current = frameSkipRef.current === 4 ? 0 : 4;
      }}
    />
  );
}
