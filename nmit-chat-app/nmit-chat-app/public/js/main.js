const socket = io();
const chatForm = document.getElementById('chat-form');
const urlparams = new URLSearchParams(window.location.search)
const chatMessages = document.querySelector('.chat-messages');
const userList = document.getElementById('users');
const feedback = document.querySelector('.feedback');
const themeSwitch = document.querySelector('input');

// Switch Dark-Light theme
themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('light-theme');
});

socket.emit('joinChat', urlparams.get('username'));

socket.on('onlineUsers', users => {

    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `;
})

socket.on('message', data => {
    
    // console.log(data.length);
    // console.log(data);

    if(data.length) {

        for(var i=0; i < data.length; i++) {
            const div = document.createElement('div');
            // console.log(data[i])
            div.classList.add('message');
            div.innerHTML = `
            <p class="meta">
                ${data[i].name} <span>${data[i].time}</span>
            </p>
            <p class="text">
                ${data[i].message}
            </p>`;
            // document.querySelector('.chat-messages').appendChild(div);
            document.querySelector('.chat-messages').insertBefore(div, feedback)
        }
        
    }
    // scroll down to the last message
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('serverMsg', data => {
    const div = document.createElement('div');
    // console.log(data[i])
    console.log(chatMessages.classList);
    div.classList.add('servermessage');
    div.innerHTML = `
    <p class="meta">
        <i>${data.name} <span>${data.message}</span></i>
    </p>`;
    document.querySelector('.chat-messages').insertBefore(div, feedback);

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('typing', (name) => {
    feedback.innerHTML = `
    <p class="meta">
        <i>${name} <span>is typing..</span></i>
    </p>`;

    setTimeout(function(){ feedback.innerHTML = "";},3000);
});

chatForm.addEventListener('keypress',function(){
    socket.emit('typing', urlparams.get('username'));
})

chatForm.addEventListener('submit', event => {
    event.preventDefault();

    // Get the message
    const msg = event.target.elements.msg.value;
    const username = urlparams.get('username');
    // console.log(msg)

    event.target.elements.msg.value = ''
    event.target.elements.msg.focus();

    // Emit the chat message to the server
    socket.emit('input', {
        name: username,
        message: msg,
    });

})