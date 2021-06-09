import React, {useState, useRef, useEffect} from 'react';

export default function FunctionGraph({data, width, height}) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 0, 0)';
    ctx.beginPath();
    let sliceWidth = (canvas.width * 1.0) / data.length;
    let x = 0;
    for (let i = 0; i < data.length; i++) {
      let v = data[i];
      let y = (1 - (v + 1) / 2) * canvas.height;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }
    ctx.stroke();
  }, [data]);
  return <canvas width={width} height={height} ref={canvasRef} />;
}
