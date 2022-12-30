let canvas = null;
let color="#222"
OffscreenCanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, 0);
    this.arcTo(x,   y+h, x,   y,   0);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  }
const normalize = (val, max, min) => ((val - min) / (max - min)*10); 
  const drawVisualizer = ({ bufferLength, dataArray }) => {
    let radius = 128
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
            radius
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

    // ctx.beginPath();
    // ctx.moveTo(x, y);
    // ctx.arcTo(x+endX, y,   x+endX, y+endY, 2);
    // ctx.arcTo(x+endX, y+endY, x,   y+endY, 0);
    // ctx.arcTo(x,   y+endY, x,   y,   0);
    // ctx.arcTo(x,   y,   x+endX, y,   2);
    // ctx.stroke()
    // ctx.roundRect(x,y,endX,endY).fill()
    // ctx.fillStyle = 'white'
    // ctx.fillRect(x, y, endX+lineWidth, endY);

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
  