// -- création de notre canvas 
const canvas = document.querySelector('canvas');

// -- création de notre context 
const context = canvas.getContext('2d');

/*

// -- taille du canvas 
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

*/

// -- debut de l'application
const controller = new Leap.Controller();

// -- ouvre la connexion WebSocket
controller.connect(); 

// -- on écoute le controller
controller.on('frame', (frame) => {
	
	// -- efface le canvas à chaque frame
    context.clearRect(0, 0, canvas.width, canvas.height);
	
	// tableau qui parcourt chaque main
	frame.hands.forEach( hand => {

        // -- dessin de la paume
        const palmPos = get2dCoords(hand.palmPosition, frame, canvas);
        context.fillRect(palmPos.x, palmPos.y, 15, 15);
            
        hand.fingers.forEach( finger => {

            // -- conversion des coordonnées du doigt de 3D vers 2D
            const fingerTipPos = get2dCoords(finger.stabilizedTipPosition, frame, canvas); // -- distal phalange 
            const fingerMcp = get2dCoords(finger.mcpPosition, frame, canvas); // -- metacarpal 
            const fingerPip = get2dCoords(finger.pipPosition, frame, canvas); // -- proximal 
            const fingerCarp = get2dCoords(finger.dipPosition, frame, canvas); // -- intermediate phalange
            const fingerDip = get2dCoords(finger.carpPosition, frame, canvas); // -- carpal 

            // -- dessin d'un carré de 5 * 5 à la position 
            context.fillRect(fingerTipPos.x, fingerTipPos.y, 5, 5); // -- on définit la position et la taille 
            context.fillStyle = 'red'; // -- on définit notre couleur 
            context.fillRect(fingerMcp.x, fingerMcp.y, 5, 5);
            context.fillStyle = 'blue';
            context.fillRect(fingerPip.x, fingerPip.y, 5, 5);
            context.fillStyle = 'green';
            context.fillRect(fingerCarp.x, fingerCarp.y, 5, 5);
            context.fillStyle = 'pink';
            context.fillRect(fingerDip.x, fingerDip.y, 5, 5);
            context.fillStyle = 'yellow';

        });
        
    });
    
    //console.log(`Frame event for frame ${frame.id}`);

});

function get2dCoords(leapPosition, frame, canvas){

    const interactionBox = frame.interactionBox;
    const normalizedPoint = interactionBox.normalizePoint(leapPosition, true);

    return {
        x : normalizedPoint[0] * canvas.width,
        y : (1 - normalizedPoint[1]) * canvas.height
    }

}