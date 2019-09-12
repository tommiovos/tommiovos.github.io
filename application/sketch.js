/* Declaration des variables necessaires au programme */
'use strict'
p5.disableFriendlyErrors = true; // disables FES
var button;
var sliderThresh, sliderTol, selBackground, selForeground, selOption;
var colorToRemove = [0, 255, 0]
var colorToRemove2
var thresh = 100;
var bgImg;
var allUIs;
var showUI;
var canvas;
var transparentImg;
var recorder;
var name_effet = "Image originale";

// Variables pour l'animation balais volants
let img;
let posX = [];
let tabImages = [];
let _posX;
let posY = [];
let _posY;
let nbre_perso = 15;
let personnages = [];
let index_perso;
let vitesseX = [];
let vitesseY = []
let taille = [];

// Variables pour la banniere
var temps;
var phrases = [];
var num_phrase;
var duree_message = 10;
var nbre_msg;
var index;
var bannerMove;
var changeText;

//change button color
var switcher

function preload() {
    tabImages[0] = loadImage('image1934/balai2.png');
    tabImages[1] = loadImage('image1934/Harry_potter_Nasrine.png');
    tabImages[2] = loadImage('image1934/naimPotter.png');
}

/* Initialisation du programme, cette partie du code n'est exécutée qu'une seule fois */
function setup() {

    // Ici on définit les medias (photos + videos) que l'on va utiliser dans le programme
    const medias = ["none",
        "enquete/batiment.jpg", "enquete/batiment2.jpg", "enquete/nightclub.jpg", "enquete/", "pic02.jpg",
        "franck.mp4", "tst.mp4", "minions.mp4", "beach.jpg", "pngtest.png",
        "webcam:0", "webcam:1", "meteo/accident.jpg", "meteo/accident2.jpg", "meteo/paneau.png", "meteo/attention.png", "meteo/soleil.jpg", "meteo/azkaban.jpg", "meteo/transat.jpg", "meteo/dobby.jpg", "meteo/Carte.jpg", "meteo/manif1.jpg", "lesAnges/intro.jpg", "JT/JT.jpg", "generique.mp4"
    ]

    /*  Cette partie est necessaire à l'initialisation du programme, mais vous n'avez pas besoin de la comprendre aujourd'hui ;)*/
    canvas = setupCanvas() // function to setup canvas and other stuffs hidden from student
    recorder, transparentImg = otherSetups(canvas, medias);
    /* ---------------------------------- */

    /* Vous pouvez rajouter du code en dessous */
    drawAnimationSetup();
    drawBanniereSetup();
    switcher = true;


}


/* Cette partie du code dessine sur le "canvas". La fonction draw() est exécutée en boucle */
function draw() {
    if (transparentImg) {
        drawBG();
        drawAnimation();
        drawFG();
        drawBanniere();
    }
}


/* ------------------------------------------------------------ */
/* Quelques fonctions utiles en dessous : 
   affichage du fond, du premier plan, 
   et récupération de la couleur où on clique 
*/


/* Cette fonction dessine le "Background" => c'est à dire le fond de l'image */
function drawBG() {
    background(255);
    const fitR = fitStretched(transparentImg, canvas);
    if (bgImg) {
        fill(0);
        image(bgImg, fitR.left, fitR.top, fitR.width, fitR.height);
        if (name_effet == "Image originale") {

        } else if (name_effet == "Inverser image") {
            filter(INVERT);
        } else if (name_effet == "Threshold") {
            filter(THRESHOLD);
        } else if (name_effet == "Grey") {
            filter(GRAY);
        } else if (name_effet == "Erode") {
            filter(ERODE);
        } else if (name_effet == "Posterize") {
            filter(POSTERIZE, 3);
        } else if (name_effet == "blur") {
            filter(BLUR, 40);
        }

    } else {
        fill(0, 255, 0);
        rect(fitR.left, fitR.top, fitR.width, fitR.height);

    }
}

/* Cette fonction dessin le "Foreground" => premier plan de l'image */
function drawFG() {
    transparentImg.loadPixels();
    colorToAlpha(transparentImg, colorToRemove, sliderThresh.value(), 0, sliderTol.value());
    transparentImg.updatePixels();
    const fitR = fitStretched(transparentImg, canvas);
    image(transparentImg, fitR.left, fitR.top, fitR.width, fitR.height);


    if (name_effet == "Image originale") {

    } else if (name_effet == "Inverser image") {
        filter(INVERT);
    } else if (name_effet == "Threshold") {
        filter(THRESHOLD);
    } else if (name_effet == "Grey") {
        filter(GRAY);
    } else if (name_effet == "Erode") {
        filter(ERODE);
    } else if (name_effet == "Posterize") {
        filter(POSTERIZE, 3);
    } else if (name_effet == "blur") {
        filter(BLUR, 1);
    }
}

/* Recupération de la couleur à l'endroit où l'on clique avec la souris */
function mouseClicked(e) {
    let color = getColorUnderMouseClick(e, transparentImg,);
    if (color) {
        if (keyIsDown(SHIFT)) {
            colorToRemove2 = color
        } else {
            colorToRemove = color
        }
    }
}

function drawAnimationSetup() {

    for (var i = 0; i < nbre_perso; i++) {
        index_perso = round(random(0, 2));
        personnages[i] = tabImages[index_perso];
        posX[i] = round(random(-100, width));
        posY[i] = round(random(0, height));
        vitesseX[i] = round(random(1, 4));
        vitesseY[i] = round(random(-2, 2));
        taille[i] = round(random(30, 200));
    }
}

function drawAnimation() {
    for (var i = 0; i < nbre_perso; i++) {
        posY[i] = posY[i] + vitesseY[i];
        posX[i] = posX[i] + vitesseX[i];

        if (posX[i] > width) {
            posX[i] = -100;
            posY[i] = round(random(0, height));
            vitesseX[i] = round(random(1, 10));
            vitesseY[i] = round(random(-2, 2));
            taille[i] = round(random(30, 200));
        }
        image(personnages[i], posX[i], posY[i], taille[i], taille[i])
    }
}

function drawBanniereSetup() {
//	timeStarted = temps;
    index = 0;
    phrases = ["Le petit Rafael aurait été retrouvé évanoui devant les portes du Beer'O'Clock.",
        "Louis a été surpris en train d'exprimer une émotion, il dément.",
        "Fred aurait enfin réussi à dire une bonne blague, bravo à lui.",
        "Quand on a dit à Clément de trouver un stage, il a fait une crise de panique.",
        "Tom Blonde PDG de Blonde Industries a déclaré « L'avenir c'est moi »",
        "Les chats de Sandra ont été retrouvés mêler dans une sale affaire de drogue.",
        "Jean-Charles aurait préferé être plus grand, indique sa petite amie.",
        "La salle de sport aurait été obligé de virer Saber pour cause de nudisme.",
        "Le prix d'excellence a été attribué à Naim, il l'a ensuite fait tombé par terre.",
        "Nazmi s'est fait intégrer son casque à l'intérieur de sa tête.",
        "Les tongs de Nasrine sont nommées trésor national."
    ];
    nbre_msg = phrases.length;
    bannerMove = 2200;
    changeText = 0;

}

// A rajouter dans master (à la fin)
function drawBanniere() {
    noStroke();
    fill(0, 100, 200, 150);
    // temps = millis() / 1000;
    rect(0, 840, windowWidth * 3, 75);
    textSize(36);
    textFont("Muli")
    fill(255);
    textAlign(CENTER, CENTER);
    // index = (temps - temps % duree_message) / duree_message;
    // num_phrase = index % nbre_msg;
    text(phrases[changeText], bannerMove, 880)
    bannerMove = bannerMove - 8;
    

    if (bannerMove < -700) {
        bannerMove = 2200;
        changeText++;
        
    }

    if (index = 10) {
        index = 0;
    }
}
