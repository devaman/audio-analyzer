let canvas = null;
const maxDepth = 50;
const particleAmount = 700;
let maxDistributionX;
let maxDistributionY;
const particles = new Array(particleAmount);
const placeParticles = () => {
  for (let i = 0; i < particles.length; i += 1) {
    particles[i] = {
      x: random(-maxDistributionX, maxDistributionX),
      y: random(-maxDistributionY, maxDistributionY),
      z: random(1, maxDepth),
    };
  }
};
// const displayType = 0 // Can be any integer from 0 - 3
// let color="#222"
const normalize = (val, threshold=200) => ((val > threshold) ? val - threshold : 0);
const normalize1 = (val, max, min) => ((val-min)/(max-min))
const changeRange =(OldValue,NewRange, OldRange, OldMin, NewMin)=>((((OldValue - OldMin) * NewRange) / OldRange) + NewMin)
const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
const drawVisualizer = ({ bufferLength, dataArray, config }) => {
  // let radius = 128

  // const barWidth = canvas.width / bufferLength;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // clears the canvas
  let max = Math.max(...dataArray.slice(0,bufferLength))
  let min = Math.min(...dataArray.slice(0,bufferLength))
  let threshold = min + (max - min) * 0.68;
  let radius =config.radius
  // ctx.translate(250, 250)
  // ctx.translate(canvas.width / 2, canvas.height / 2)
  const heightsArr =  dataArray.map(el=>{
    if(config.beatDetection) return normalize(el, threshold)*(radius/80)
    else return (el *0.4)*(radius/80)
  })
  for(let j=1;j<=heightsArr.length;j++){
    heightsArr[j] = (heightsArr[(j-1)%(heightsArr.length)]+heightsArr[j%(heightsArr.length)]+heightsArr[(j+1)%(heightsArr.length)]+heightsArr[(j+2)%(heightsArr.length)]) /4
  }
  for (let i = 0; i < bufferLength; i++) {
      // const height =normalize(dataArray[i],100,0)
      // -i>0?(dataArray[i] *0.4)-i:(dataArray[i] *0.4)
      
      drawLine(
        {
          i,
          bufferLength,
          heightsArr,
          radius,
          config
        },
        ctx
      );
    }
};
const drawLine = (opts, ctx) => {
  const { i, radius, bufferLength, heightsArr, config } = opts;
  const height = heightsArr[i]
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const lineWidth = 2 * Math.PI * radius / bufferLength;
  const rads = (Math.PI * 2) / bufferLength;
  
  let rot = Math.ceil(changeRange(i,bufferLength, bufferLength , 0, -bufferLength/4))
  const x = centerX + Math.cos(rads * rot) * (radius);
  const y = centerY + Math.sin(rads * rot) * (radius);
  const endX = centerX + Math.cos(rads * rot) * (radius + height);
  const endY = centerY + Math.sin(rads * rot) * (radius + height);

  // Mirror points
  // rot = changeRange(i,bufferLength, bufferLength , 0, -bufferLength/2) 
 
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
    break; case 4:
      ctx.fillRect(i * width, centerY - height, width, height * 2)
    break; case 5:
      let color = ctx.fillStyle.slice(1)
      ctx.fillStyle = `rgba(${parseInt(color.slice(0,2),16)},${parseInt(color.slice(2,4),16)},${parseInt(color.slice(4,6),16)},${height / 64})`
      ctx.fillRect(i * width, 0, width, canvas.height)
    break; case 6:
      ctx.beginPath()
      ctx.arc((Math.sin(rads * i) * radius * 1.5) + centerX,(Math.cos(rads * i) * radius * 1.5)+centerY,height / 2,0,Math.PI * 2)
      ctx.fill()
    break; case 7:
      ctx.beginPath()
      ctx.arc(endX,endY,5,0,10)
      ctx.fill()
    break; case 8:
      for (let j = 1; j < 6; j++) {
        ctx.beginPath()
        ctx.arc(
          centerX + (Math.sin(rads * i) * (height + radius) * (j / 3)),
          centerY + (Math.cos(rads * i) * (height + radius) * (j / 3)),
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
      if(i<=bufferLength/2) {
        const negx = centerX - Math.cos(rads * rot) * (radius);
        const negy = centerY + Math.sin(rads * rot) * (radius);
        const negendX = centerX - Math.cos(rads * rot) * (radius + heightsArr[i]);
        const negendY = centerY + Math.sin(rads * rot) * (radius + heightsArr[i]);
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, endY);
        ctx.moveTo(negx, negy);
        ctx.lineTo(negendX, negendY);
        ctx.stroke();
      }
      break; case 12:
      const negendX = centerX + Math.cos(rads * rot) * (radius + heightsArr[bufferLength-i]);
      const negendY = centerY + Math.sin(rads * rot) * (radius + heightsArr[bufferLength-i]);
      if(i<=bufferLength/2) {
        if (i == 0) {
          ctx.beginPath()
          ctx.moveTo(endX,endY)
        }
        ctx.lineTo(endX,endY)
        if (i == bufferLength/2) {
          ctx.moveTo(endX,endY)
        }
      } else {
        ctx.lineTo(negendX,negendY)
        if (i == bufferLength-1) {
          rot = Math.ceil(changeRange(0,bufferLength, bufferLength , 0, -bufferLength/4))
          const negendX = centerX + Math.cos(rads * rot) * (radius + heightsArr[0]);
          const negendY = centerY + Math.sin(rads * rot) * (radius + heightsArr[0]);
          ctx.lineTo(negendX,negendY)
          ctx.fill()
        }
      }
    break; default:
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

};
const drawStars = ({ bufferLength, dataArray, config })=>{
  if(!config.showParticles) return
  const ctx = canvas.getContext("2d");
  const r = parseInt(config.color.substr(1,2), 16)
  const g = parseInt(config.color.substr(3,2), 16)
  const b = parseInt(config.color.substr(5,2), 16)
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  let max = Math.max(...dataArray.slice(0,bufferLength/3))
  let min = Math.min(...dataArray.slice(0,bufferLength/3))
  threshold = min + (max - min) * 0.68;
  let speed = config.bounce;
  speed = speed>0.05?speed:0.05
  // .3 or .5 looks good, 1 for no shade
  // context.fillStyle = 'rgba(0, 34, 34, .5)';
  // context.fillRect(0, 0, canvas.width, canvas.height);
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < particles.length; i += 1) {
    particles[i].z -= speed;

    if (particles[i].z <= 0) {
      particles[i].x = random(-maxDistributionX, maxDistributionX);
      particles[i].y = random(-maxDistributionY, maxDistributionY);
      particles[i].z = maxDepth;
    }

    const k = 100 / particles[i].z;
    const newX = particles[i].x * k + centerX;
    const newY = particles[i].y * k + centerY;

    if (newX >= 0 && newX <= canvas.width && newY >= 0 && newY <= canvas.height) {
      const size = (1 - particles[i].z / maxDepth) * 12;
      var radgrad = ctx.createRadialGradient(newX,newY,0,newX,newY,size/2);
      radgrad.addColorStop(0, `rgba(${r},${g},${b},1)`);
      radgrad.addColorStop(0.5, `rgba(${r},${g},${b},.5)`);
      radgrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      // draw shape
      ctx.fillStyle = radgrad;
      // ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(newX, newY, size / 2, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fill();
    }
  }
}
onmessage = function (e) {
  console.log("Worker: Message received from main script");
  const { bufferLength, dataArray, config, canvas: canvasMessage, resize_canvas } = e.data;
  if (canvasMessage) {
    canvas = canvasMessage;
    maxDistributionX = canvas.width / 8
    maxDistributionY = canvas.height / 4
    placeParticles()
  } else if (resize_canvas) {
    [canvas.width, canvas.height] = resize_canvas
  }  else {
    drawVisualizer({ bufferLength, dataArray, config });
    drawStars({ bufferLength, dataArray, config })
  }
};
