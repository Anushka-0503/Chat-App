const users = []

function userJoin(id, username,room) {
    const user = { id, username,room };

    users.push(user);
    return user;
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);
    
    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}
//get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

function onlineUsers() {
    return users;
}

module.exports = {
    userJoin,
    userLeave,
    onlineUsers,
    getRoomUsers
};