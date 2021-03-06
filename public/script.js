(function() {
    console.log("script.js is working");
    var canvas = $('#canvas');
    var ctx = document.getElementById('canvas').getContext('2d');
    var url = $("#hiddenFieldforUrl");
    
    
    var pos = { x: 0, y: 0 };
    
    var canvasOffset=$("#canvas").offset();
    var offsetX = canvasOffset.left;
    var offsetY = canvasOffset.top;
    
    function setPosition(e) {
        pos.x= parseInt(e.pageX-offsetX);
        pos.y = parseInt(e.pageY-offsetY);
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
        ctx.strokeStyle = 'white';
        
        ctx.moveTo(pos.x, pos.y);
        setPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        url.val(canvas.get(0).toDataURL("image/png", 1.0));
        //console.log("url",url.val())
        
    }); 
})();
