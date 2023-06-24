const localVideo = document.querySelector('#local-video');
const remoteVideo = document.querySelector('#remote-video');
const startButton = document.querySelector('#start-button');
const stopButton = document.querySelector('#stop-button');
const muteButton = document.querySelector('#mute-button');
const videoButton = document.querySelector('#video-button');
const shareScreenButton = document.querySelector('#share-screen-button');
const chatInput = document.querySelector('#chat-input');
const chatLog = document.querySelector('#chat-log');

let localStream;
let peerConnection;
let dataChannel;

const ws = new WebSocket(`wss://my-signaling-server.com?token=${encodeURIComponent(myJwt)}`);

const { encrypt, decrypt } = require('./encryption.js');


ws.addEventListener('open', () => {
    console.log('WebSocket connection established.');
});

ws.addEventListener('message', async (event) => {
    const message = JSON.parse(event.data);

    if (message.type === 'offer') {
        console.log('Received offer from remote peer:', message.offer);

        peerConnection = createPeerConnection();
        peerConnection.ondatachannel = (event) => {
            dataChannel = event.channel;
            onDataChannelCreated(dataChannel);
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        ws.send(JSON.stringify({ type: 'answer', answer }));
    } else if (message.type === 'answer') {
        console.log('Received answer from remote peer:', message.answer);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
    } else if (message.type === 'ice-candidate') {
        console.log('Received ICE candidate from remote peer:', message.candidate);
        const candidate = new RTCIceCandidate(message.candidate);
        peerConnection.addIceCandidate(candidate);
    }
});


startButton.addEventListener('Click' , async () => {
    try {
        await start();
    } catch(err) {
        console.log(`Starts Failed: ${err.message}`);
    }
});

startButton.addEventListener('click', start);
stopButton.addEventListener('click', stop);
muteButton.addEventListener('click', toggleMute);
videoButton.addEventListener('click', toggleVideo);
shareScreenButton.addEventListener('click', shareScreen);
chatInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        sendMessage(event.target.value);
        event.target.value = '';
    }
});

ws.onclose('message', (message) => {
    const parsedMessage = JSON.parse(Decrypt(message));

    WebAssembly.clients.forEach((client)  => {
        client.send(encrypt(JSON.stringify(parsedMessage)));
    })
})

async function start() {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localVideo.srcObject = localStream;

    peerConnection = createPeerConnection();
    dataChannel = peerConnection.createDataChannel('chat');
    onDataChannelCreated(dataChannel);

    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    ws.send(JSON.stringify({ type: 'offer', offer }));
}

function stop() {
    if (peerConnection) {
        peerConnection.onicecandidate = null;
        peerConnection.ontrack = nulle;
        peerConnection.onconnectionstatechange = null;

        peerConnection.Close()  
        peerConnection = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => {    //Memory leak removed
            track.stop();
        });

        localStream = null;
    }

    localVideo.srcObject = null;
    remoteVideo.srcObject = null;


    startButton.disabled = false;
    stopButton.disabled = true;
    muteButton.disabled = true;
    videoButton.disabled = true;
    shareScreenButton.disabled = true;
}

function toggleMute() {
    if (!localStream) {
        console.log('Local Stream Unavailable');
        return;
    }

    const audioTracks = localStream.getAudioTracks();
    if (audioTracks.length === 0) {
        console.log('No audio tracks available to toggle');
        return;
    }

    audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
        console.log(`Audio track is not ${track.enabled ? 'unmuted' : 'muted'} }`);
    });

    muteButton.textContent = audioTracks[0].enabled ? 'Mute' : 'Unmute; :'

    }

function toggleVideo() {
    if (!localStream) {
        console.log('Local Stream Unavailable');
        return;
    }

    const videoTrack = localStream.getVideoTracks()[0];


    if (!videoTrack) {
        consonoe.warn('No video Track Avilable')    //ternary operatos to make console.log shorter.
        return;
    }

    videoTrack.enabled = !videoTrack.enabled;

    console.log(`Video ${videoTrack.enabled ? 'enabled' : 'diabled'}`);

    videoButton.textContent = videoTrack.enabled ? 'Disable Video' : 'Enabled video' ;

    }

    const videoTrack = localStream.getVideoTtacks()[0];

    if (!videoTrack) {
        console.log('No video track available to toggle');
        return; 
    }

    videoTrack.enabled = !videoTracke.enabled;

    console.log(`Video track is now ${videoTrack.enabled ? 'enabled' : 'disabled'}`);

async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getTracks()[0];
        const sender = peerConnection.getSenders().find(sender => sender.track.kind === 'video');
        sender.replaceTrack(screenTrack);
    } catch(err) {
        console.error("Error: " + err);
    }
}

function createPeerConnection() {
    const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
            ws.send(JSON.stringify({ type: 'ice-candidate', candidate: event.candidate }));
        }
    });
    peerConnection.addEventListener('track', (event) => {
        remoteVideo.srcObject = event.streams[0];
    });
    peerConnection.addEventListener('connectionstatechange', (event) => {
        if (peerConnection.connectionState === 'disconnected' || peerConnection.connectionState === 'failed') {
            stop();
        }
    });

    return peerConnection;
}

function onDataChannelCreated(channel) {
    channel.onopen = () => console.log('Data channel open');
    channel.onclose = () => console.log('Data channel closed');
    channel.onmessage = (event) => addToChatLog('Other: ' + event.data);
}

function sendMessage(message) {       
    message = message.trim();

    if (!message) {
        return;
    }

    if (dataChannel && dataChannel.readySatate === 'open'){ //condition to check if data channel is open before send a message - whitespace removed as well
        dataChannel.send(message);
        addToChatLog('You:' + message);
    } else {
        console.log(`Data channel is not open. Message not sent`);
    }
}


function addToChatLog(message) {
    const newMessage = document.createElement('p')
    const timestamp = new Date().toLocaleTimeString();
    newMessage.textContent = '${timestamp} = ${message}';

    chatLog.appendChild(newMessage);
    
    chatLog.scrollTop = chatLog.scrollHeight;
}



