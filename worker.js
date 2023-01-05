let canvas = null;
// const displayType = 0 // Can be any integer from 0 - 3
// let color="#222"
const normalize = (val, max, min) => ((val - min) / (max - min)*10); 
  const drawVisualizer = ({ bufferLength, dataArray, config }) => {
    // let radius = 128
    let radius = Math.min(config.width,config.height) / 2
    // const barWidth = canvas.width / bufferLength;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
    // ctx.translate(250, 250)
    // ctx.translate(canvas.width / 2, canvas.height / 2)
    for (var i = 0; i < bufferLength; i++) {
        // const height =normalize(dataArray[i],100,0)
        const height = (dataArray[i] *0.4)
        // -i>0?(dataArray[i] *0.4)-i:(dataArray[i] *0.4)

        drawLine(
          {
            i,
            bufferLength,
            height,
            radius,
            config
          },
          ctx
        );
      }
  };
  const drawLine = (opts, ctx) => {
    const { i, radius, bufferLength, height, config } = opts;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const lineWidth = 2 * Math.PI * radius / bufferLength;
    const rads = (Math.PI * 2) / bufferLength;

    const x = centerX + Math.cos(rads * i) * (radius);
    const y = centerY + Math.sin(rads * i) * (radius);
    const endX = centerX + Math.cos(rads * i) * (radius + height);
    const endY = centerY + Math.sin(rads * i) * (radius + height);
    let width = canvas.width / bufferLength;
    ctx.strokeStyle = config.color;
    ctx.fillStyle = config.color
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    switch (config.displayType) {
      case 1:
        if (i == 0) {
          ctx.beginPath()
          ctx.moveTo(endX,endY)
        }
        ctx.lineTo(endX,endY)
        if (i == bufferLength - 1) {
          ctx.fill()
        }
      break; case 2:
        // let width = canvas.width / bufferLength;
        ctx.fillRect(i * width, 0, width, height)
      break; case 3:
        // let width = canvas.width / bufferLength;
        if (i == 0) {
          ctx.beginPath()
          ctx.moveTo(0, 0)
        }
        ctx.lineTo(i * width, height)
        if (i == bufferLength - 1) {
          ctx.lineTo(canvas.width,0)
          ctx.fill()
        }
      break; default:
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }

  };
  onmessage = function (e) {
    console.log("Worker: Message received from main script");
    const { bufferLength, dataArray, config, canvas: canvasMessage, resize_canvas } = e.data;
    if (canvasMessage) {
      canvas = canvasMessage;
    } else if (resize_canvas) {
      [canvas.width, canvas.height] = resize_canvas
    }  else {
      drawVisualizer({ bufferLength, dataArray, config });
    }
  };
  