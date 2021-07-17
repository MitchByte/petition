(function () {

    console.log("script.js is working");

    //id = canvas
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');

    var pos = { x: 0, y: 0 };
    var canvasOffset=$("#canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;

    function setPosition(e) {
        pos.x= parseInt(e.clientX-offsetX);
        pos.y = parseInt(e.clientY-offsetY);
    }

    canvas.on('mousedown', setPosition);
    //canvas.on('mouseenter', setPosition);
    canvas.on('mousemove', (e) => {
        if (e.buttons !== 1) {
            return;
        }
        ctx.beginPath(); 

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'black';

        ctx.moveTo(pos.x, pos.y);
        setPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    });

})(); 
    