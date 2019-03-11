// -- debut de l'application

const controller = new Leap.Controller();
controller.connect(); // Ouvre la connexion WebSocket

// -- on écoute le controller

controller.on('frame', (frame) => {
    console.log(`Frame event for frame ${frame.id}`);
});