  (function () {
    console.log("script.js is working");
    
    var canvas = $("#canvas").get(0).getContext("2d");
    var url = $("#hiddenFieldforUrl").get(0);

    /*function mousePosition() {
        canvas.on("mousemove", (e) => {
            let mousePosition = {
                x: e.pageX,
                y: e.pageY
            };
            return mousePosition;
        })  
    }

    let mouseInterval = setInterval(mousePosition,500);

    canvas.on("mousedown", (e) => {
        mousePosition();
        console.log("mouse position", mousePosition())

        canvas.beginPath();
        canvas.strokeStyle = "black";
        canvas.lineWidth = 3;
        console.log("mouseinterval", mouseInterval)

    })
    */

})(); 
    
