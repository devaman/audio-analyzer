let canvas = null;
let color="#222"
const normalize = (val, threshold=200) => ((val > threshold) ? val - threshold : 0);

const drawVisualizer = ({ bufferLength, dataArray }) => {
  let radius = 128
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
  const max = Math.max(...dataArray.slice(0,bufferLength))
  const min = Math.min(...dataArray.slice(0,bufferLength))
  const threshold = min + (max - min) * 0.68;
  for (var i = 0; i < bufferLength; i++) {
      const height =normalize(dataArray[i], threshold)

      drawLine(
        {
          i,
          bufferLength,
          height,
          radius,
        },
        ctx
      );
    }
  };
  const drawLine = (opts, ctx) => {
    const { i, radius, bufferLength, height } = opts;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const lineWidth = 2 * Math.PI * radius / bufferLength;
    const rads = (Math.PI * 2) / bufferLength;

    const x = centerX + Math.cos(rads * i) * (radius);
    const y = centerY + Math.sin(rads * i) * (radius);
    const endX = centerX + Math.cos(rads * i) * (radius + height);
    const endY = centerY + Math.sin(rads * i) * (radius + height);
    // console.log(x,y,endX,endY)
    // draw the bar
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };
  onmessage = function (e) {
    console.log("Worker: Message received from main script");
    const { bufferLength, dataArray, stroke_color,logo, canvas: canvasMessage } = e.data;
    if (canvasMessage) {
      canvas = canvasMessage;
    } else if(stroke_color){
        color=stroke_color
    } else if(logo){
        const ctx = canvas.getContext("2d");
        this.createImageBitmap(logo).then(img=>{
            ctx.drawImage(img,0,0); // Or at whatever offset you like
        })
       
    } else {
      drawVisualizer({ bufferLength, dataArray });
    }
  };
  
  const arrAvg = (arr)=>(arr.reduce((a,b)=>a+b,0)/arr.length)