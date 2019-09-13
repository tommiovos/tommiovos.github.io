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

$( document ).ready(function () 
{

        $('.highlighter2').hover(function() // on over
        
        {
            $('.highlight2').addClass('highlighted2');
        },

        function()  // on out
        {
            $('.highlight2').removeClass('highlighted2');
        })
});


var stopKonami = function() {
    $('.achieve').removeClass('achieveMove');
}

var stopWhite = function() {
    $('.hidescreen').removeClass('hideshow');
    $('.btnApp').removeClass('btnAppHide');
}

var startAchieve =  function() {
$('.achieve').addClass('achieveMove');
}

console.log('try ⬆️⬆️⬇️⬇️⬅️➡⬅️️➡️BA');
new KonamiCode(function () {
    console.log('KONAMI activated');
    
     $('.hidescreen').addClass('hideshow');
     $('.btnApp').addClass('btnAppHide');
     setTimeout(startAchieve, 1000);
     setTimeout(stopKonami, 3000);
     setTimeout(stopWhite, 4000);
    
});

// $('button class").click








// var elem = document.getElementById('test');
//     elem.style.color = "red";


