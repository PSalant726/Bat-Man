function draw() {
  var canvas = document.getElementById('game-canvas');
  if (canvas.getContext){
    var ctx = canvas.getContext('2d');

    // roundedRect(ctx,x,y,width,height,radius)
    // Outer Maze border
    roundedRect(ctx,10,10,675,800,15);
    roundedRect(ctx,35,35,625,750,10);

    // Inner Maze borders
    roundedRect(ctx,85,85,75,50,10);
    roundedRect(ctx,210,85,75,50,10);
    roundedRect(ctx,335,10,25,125,10);
    roundedRect(ctx,410,85,75,50,10);
    roundedRect(ctx,535,85,75,50,10);

    roundedRect(ctx,85,185,75,25,10);
    roundedRect(ctx,210,185,25,175,10);
    roundedRect(ctx,285,185,125,25,10);
    roundedRect(ctx,460,185,25,175,10);
    roundedRect(ctx,535,185,75,25,10);
    roundedRect(ctx,210,260,75,25,10);
    roundedRect(ctx,335,185,25,100,10);
    roundedRect(ctx,410,260,75,25,10);

    // Jail
    roundedRect(ctx,285,335,125,200,10);


    // Horizontal Guidelines
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect(0,85,700,1);
    ctx.fillRect(0,135,700,1);
    ctx.fillRect(0,185,700,1);
    ctx.fillRect(0,210,700,1);
    ctx.fillRect(0,260,700,1);
    ctx.fillRect(0,285,700,1);
    ctx.fillRect(0,335,700,1);
    ctx.fillRect(0,345,700,1);
    ctx.fillRect(0,525,700,1);
    ctx.fillRect(0,535,700,1);
    ctx.fillRect(0,585,700,1);
    ctx.fillRect(0,610,700,1);
    ctx.fillRect(0,660,700,1);
    ctx.fillRect(0,685,700,1);
    ctx.fillRect(0,735,700,1);

    // Vertical Guidelines
    ctx.fillStyle = "rgb(200,0,0)";
    ctx.fillRect(85,0,1,900);
    ctx.fillRect(135,0,1,900);
    ctx.fillRect(160,0,1,900);
    ctx.fillRect(210,0,1,900);
    ctx.fillRect(235,0,1,900);
    ctx.fillRect(335,0,1,900);
    ctx.fillRect(360,0,1,900);
    ctx.fillRect(460,0,1,900);
    ctx.fillRect(485,0,1,900);
    ctx.fillRect(535,0,1,900);
    ctx.fillRect(560,0,1,900);
    ctx.fillRect(610,0,1,900);

    // for(var i=0;i<8;i++){
    //   ctx.fillRect(51+i*16,35,4,4);
    // }
    //
    // for(i=0;i<6;i++){
    //   ctx.fillRect(115,51+i*16,4,4);
    // }
    //
    // for(i=0;i<8;i++){
    //   ctx.fillRect(51+i*16,99,4,4);
    // }
  }
}

// A utility function to draw a rectangle with rounded corners.

function roundedRect(ctx,x,y,width,height,radius){
  ctx.beginPath();
  ctx.moveTo(x,y+radius);
  ctx.lineTo(x,y+height-radius);
  ctx.arcTo(x,y+height,x+radius,y+height,radius);
  ctx.lineTo(x+width-radius,y+height);
  ctx.arcTo(x+width,y+height,x+width,y+height-radius,radius);
  ctx.lineTo(x+width,y+radius);
  ctx.arcTo(x+width,y,x+width-radius,y,radius);
  ctx.lineTo(x+radius,y);
  ctx.arcTo(x,y,x,y+radius,radius);
  ctx.stroke();
}
