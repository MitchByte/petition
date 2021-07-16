(function () {
    let canvas = $("#canvas");
    let ctx = canvas.getContext("2d");


    canvas.on("mousedown", (e) => {
        console.log("mouse down")
    })
    ctx.on("click", () => {
        console.log("clicked on canvas")
    })
})();