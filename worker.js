let displayType = 12 // Can be any integer from 0 - 3
const background = 'rgba(255,255,255,0.25)'

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
const avg = (arr) => {
  let sum = 0;
  for (let i of arr) {
    sum += i
  }
  return sum / arr.length
}
const normalize = (val, max, min) => ((val - min) / (max - min)*10);
  const drawVisualizer = ({ bufferLength, dataArray }) => {
    let mean = avg(dataArray)
    let max = Math.max(...dataArray)
    let min = Math.min(...dataArray)
    // let radius = 128
    let radius = Math.min(canvas.width,canvas.height) / 3
    // const barWidth = canvas.width / bufferLength;
    const ctx = canvas.getContext("2d");
    // ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
    ctx.fillStyle = background
    ctx.resetTransform()
    ctx.fillRect(0,0,canvas.width,canvas.height)
    // ctx.translate(250, 250)
    // ctx.translate(canvas.width / 2, canvas.height / 2)
    for (var i = 0; i < bufferLength; i++) {
        // const height =normalize(dataArray[i],100,0) * 10
        const height = (dataArray[i] *0.4)
        // -i>0?(dataArray[i] *0.4)-i:(dataArray[i] *0.4)

        drawLine(
          {
            i,
            bufferLength,
            height,
            radius,
            mean,
            max,
            min
          },
          ctx
        );
      }
  };
  const drawLine = (opts, ctx) => {
    const { i, radius, bufferLength, height, mean, max, min } = opts;
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
    let width = canvas.width / bufferLength;
    ctx.strokeStyle = color;
    ctx.fillStyle = color
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    switch (displayType) {
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
      break; case 4:
        ctx.fillRect(i * width, centerY - height, width, height * 2)
      break; case 5:
        ctx.fillStyle = `hsl(${height},70%,60%)`
        ctx.fillRect(i * width, centerY - height, width, height * 2)
        break; case 6:
          ctx.beginPath()
          ctx.arc(x,y,height,0,10)
          ctx.fill()
      break; case 7:
        ctx.beginPath()
        ctx.arc(endX,endY,5,0,10)
        ctx.fill()
      break; case 8:
        for (let j = 1; j < 6; j++) {
          ctx.beginPath()
          ctx.arc(
            ((endX - centerX) * ((1/5) * j)) + centerX,
            ((endY - centerY) * ((1 / 5) * j)) + centerY,
            5,
            0,
            10
          )
          ctx.fill()
        }
      break; case 9:
        ctx.beginPath()
        ctx.arc(i * width,centerY,height,0,10)
        ctx.fill()
      break; case 10:
        ctx.beginPath()
        ctx.moveTo(
          centerX + Math.cos(rads * i) * (radius - height),
          centerY + Math.sin(rads * i) * (radius - height)
        )
        ctx.lineTo(
          centerX + Math.cos(rads * i) * (radius + height),
          centerY + Math.sin(rads * i) * (radius + height)
        )
        ctx.stroke()
      break; case 11:
        ctx.resetTransform()
        ctx.translate(centerX, centerY)
        // ctx.scale(100 / mean, 100 / mean)
        ctx.rotate(rads * i)
        // ctx.fillRect(0,0,(radius / bufferLength) * Math.PI * 2,height + radius)

        ctx.fillRect(0,(max * 0.4) + radius,10,10)
        ctx.fillRect(0,(min * 0.4) + radius,10,10)
        ctx.fillRect(0,(mean * 0.4) + radius,10,10)
      break; case 12:
        ctx.resetTransform()
        ctx.fillStyle = color
        ctx.translate(centerX, centerY)
        ctx.rotate(((Math.PI * 2) / (bufferLength - 1)) * i)
        if (i == 0) {
          ctx.beginPath()
          ctx.moveTo(0,radius-height)

        }
        // ctx.fillRect(0,radius,(radius / bufferLength) * Math.PI * 2,-(height))
        ctx.lineTo(0,radius-height)
        if (i >= bufferLength - 1) {
          ctx.rotate(-((Math.PI * 2) / (bufferLength - 1)) * i)
          ctx.lineTo(0,radius * 2)
          ctx.lineTo(radius* 2,radius * 2)
          ctx.lineTo(radius * 2,-radius * 2)
          ctx.lineTo(-radius * 2,-radius * 2)
          ctx.lineTo(-radius * 2,radius * 2)
          ctx.lineTo(0,radius * 2)
          ctx.fill()
        }
      break; default:
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }


    // ctx.fillRect(i,0,3,height)

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
    // console.log("Worker: Message received from main script");
    const { bufferLength, dataArray, stroke_color,logo, canvas: canvasMessage, resize_canvas, display_num } = e.data;
    if (canvasMessage) {
      canvas = canvasMessage;
    } else if(stroke_color){
        color=stroke_color
    } else if(logo){
        const ctx = canvas.getContext("2d");
        this.createImageBitmap(logo).then(img=>{
            ctx.drawImage(img,0,0); // Or at whatever offset you like
        })

    } else if (resize_canvas) {
      [canvas.width, canvas.height] = resize_canvas
    } else if (display_num) {
      displayType = parseInt(display_num)
      // console.log(displayType);
    } else {
      drawVisualizer({ bufferLength, dataArray });
    }
  };
