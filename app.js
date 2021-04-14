// -- création de notre canvas 
const canvas = document.querySelector('canvas');

// -- création de notre context 
const context = canvas.getContext('2d');

// -- dimension du canvas 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// -- debut de l'application
const controller = new Leap.Controller();

// -- ouvre la connexion WebSocket
controller.connect(); 

// -- déclaration des coordonnées de notre ball 
const ball = {
    x    : canvas.width / 2,
    y    : canvas.height / 2,
    size : 100,
};

//console.log("Ball X : ",ball.x);
//console.log("Ball Y : ",ball.y);

// -- on écoute le controller
controller.on('frame', (frame) => {
    
    // Efface le canvas
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // -- efface le canvas à chaque frame
    //context.clearRect(0, 0, canvas.width, canvas.height);

    // Détection des gestures
    //console.log('gestures', frame.gestures);

    // -- va gérer tout ce qui est mouvement sur l'écran
    frame.gestures.forEach( gesture => {
        switch (gesture.type){
            case 'swipe' : 
                renderSwipe(frame, gesture);
                break;
            case 'circle' : 
                renderCircle(frame, gesture);
                break;
            case 'keyTap' : 
                renderKeyTap(frame, gesture);
                break;
        }
        // -- affichage des gestures 
        console.log(frame.gestures)
    });
    
    // -- dessin de notre ball
    context.fillStyle = 'cyan';
    context.beginPath();
    context.arc(ball.x, ball.y, 60, 0, Math.PI * 2);
    context.fill();
    context.closePath();  

	// tableau qui parcourt chaque main
	frame.hands.forEach( hand => {  
        
        // -- dessin de la paume
        const palmPos = get2dCoords(hand.stabilizedPalmPosition, frame, canvas); 
        context.fillStyle = 'white';
        // -- stabilizedPalmPosition ou juste palmPosition
        context.fillRect(palmPos.x, palmPos.y, 15, 15);
        //console.log("PALM X : ",palmPos.x);
        //console.log("PALM Y : ",palmPos.y);


        hand.fingers.forEach( finger => {

            // -- conversion des coordonnées du doigt de 3D vers 2D
            const fingerTipPos = get2dCoords(finger.stabilizedTipPosition, frame, canvas); // -- distal phalange 
            const fingerMcp = get2dCoords(finger.mcpPosition, frame, canvas); // -- metacarpal 
            const fingerPip = get2dCoords(finger.pipPosition, frame, canvas); // -- proximal 
            const fingerCarp = get2dCoords(finger.dipPosition, frame, canvas); // -- intermediate phalange
            const fingerDip = get2dCoords(finger.carpPosition, frame, canvas); // -- carpal 

            context.fillStyle = 'blue'; // -- on définit notre couleur 

            // -- dessin d'un carré de 5 * 5 à la position 
            context.fillRect(fingerTipPos.x, fingerTipPos.y, 5, 5); // -- on définit la position et la taille 
            context.fillRect(fingerMcp.x, fingerMcp.y, 5, 5);
            context.fillRect(fingerPip.x, fingerPip.y, 5, 5);
            context.fillRect(fingerCarp.x, fingerCarp.y, 5, 5);
            context.fillRect(fingerDip.x, fingerDip.y, 5, 5);

            // Toujours pour cette main, on gère l'éventuel "drag" de la balle rouge
            dragBall(hand, frame);

        });
        
    });

});
    //console.log(`Frame event for frame ${frame.id}`);

/**
 * Dessine un "swipe" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "swipe" qui a été détecté dans cette frame
 */

function renderSwipe(frame, gesture){

    const startPosition = get2dCoords(gesture.startPosition, frame, canvas);
    const currentPosition = get2dCoords(gesture.position, frame, canvas);

    //console.log(startPosition, currentPosition);

    context.strokeStyle = 'white';
    context.beginPath();
    context.moveTo(startPosition.x, startPosition.y);
    context.lineTo(currentPosition.x, currentPosition.y);
    context.stroke();
    context.closePath();
}

/**
 * Dessine un gesture "circle" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "circle" à dessiner
 */

function renderCircle(frame, gesture){

    const centerPosition = get2dCoords(gesture.center, frame, canvas);
    const radius = gesture.radius;

    context.strokeStyle = 'pink';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(centerPosition.x, centerPosition.y, radius, 0, Math.PI * 2);
    context.stroke();
    context.closePath();

}

/**
 * Dessine un "cercle remplit" à l'écran
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {Object} gesture Objet "gesture" de type "swipe" qui a été détecté dans cette frame
 */

function renderKeyTap(frame, gesture){

    const tapPosition = get2dCoords(gesture.position, frame, canvas);

    context.fillStyle = 'red';
    context.beginPath();
    context.arc(tapPosition.x, tapPosition.y, 30, 0, Math.PI * 2);
    context.fill();
    context.closePath();

}

/**
 * 
 * @param {*} hand Objet hand qui correspond à nos mains détéctées 
 * @param {*} frame Objet "frame" transmit par le Leap Motion
 */

function dragBall(hand, frame) {
    if (hand.grabStrength === 1){
        const palmPosition = get2dCoords(hand.stabilizedPalmPosition, frame, canvas);
        if((palmPosition.x >= ball.x - 40 && palmPosition.x <= ball.x + 40) 
        && 
        (palmPosition.y >= ball.y - 50 && palmPosition.y <= ball.y + 50)){
            ball.x = palmPosition.x;
            ball.y = palmPosition.y;
        }
    }
}

/**
 * Transforme les coordonnées 3D récupérée par le Leap en coordonnées 2D pour un <canvas> web
 * @param {Array} leapPosition Tableau de coordonnées 3d [x, y, z]
 * @param {Object} frame Objet "frame" transmit par le Leap Motion
 * @param {HTMLCanvasElement} canvas Objet canvas sur lequel sont dessinés les éléments
 */

function get2dCoords(leapPosition, frame, canvas){

    const interactionBox = frame.interactionBox;
    const normalizedPoint = interactionBox.normalizePoint(leapPosition, true);

    return {
        x : normalizedPoint[0] * canvas.width,
        y : (1 - normalizedPoint[1]) * canvas.height,
    }

}