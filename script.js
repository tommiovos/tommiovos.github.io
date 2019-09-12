$( document ).ready(function () 
{

        $('.highlighter').hover(function() // on over
        
        {
            $('.highlight').addClass('highlighted');
        },

        function()  // on out
        {
            $('.highlight').removeClass('highlighted');;
        })
});








// var elem = document.getElementById('test');
//     elem.style.color = "red";


