(function(){

    $('#menu').on('click', () => {
        $('#menu-left').css({
            "visibility":"visible",
            "transition-property": "transform",
            "transition-duration": "10s"
        })
    });
    
    $('#x').on('click', () => { 
        $('#menu-left').css({
            "visibility":"hidden",
            "transition-property": "transform",
            "transition-duration": "10s"
        })
    });
    
})();