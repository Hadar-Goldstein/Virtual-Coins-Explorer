"use strict";

(()=>{

    // Parallax Animation 
    // ******************
    $(window).scroll(() => {
        const scrollPositionY = $(window).scrollTop();
        const speed = 0.4;
        $(".parallaxImage").css("transform", `translate3d(0, ${scrollPositionY * speed}px, 0)`);
        
        const backgroundHeight = $(".parallaxBg").outerHeight();
        if (backgroundHeight <= scrollPositionY)
            $("nav a").css("color", "black");
        else
        $("nav a").css("color", "#d9d9d9");
    });
    
})();