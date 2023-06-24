const chatNavButton = document.querySelector('#chat-nav-button');
const videoNavButton = document.querySelector('#video-nav-button');
const calendarNavButton = document.querySelector('#calendar-nav-button');

// Your chat, video and calendar components need to be in the DOM
const chatComponent = document.querySelector('#chat-component');
const videoComponent = document.querySelector('#video-component');
const calendarComponent = document.querySelector('#calendar-component');

chatNavButton.addEventListener('click', () => {
    // Hide other components and show chat
    videoComponent.style.display = 'none';
    calendarComponent.style.display = 'none';
    chatComponent.style.display = 'block';
});

videoNavButton.addEventListener('click', () => {
    // Hide other components and show video
    chatComponent.style.display = 'none';
    calendarComponent.style.display = 'none';
    videoComponent.style.display = 'block';
});

calendarNavButton.addEventListener('click', () => {
    // Hide other components and show calendar
    chatComponent.style.display = 'none';
    videoComponent.style.display = 'none';
    calendarComponent.style.display = 'block';
});
