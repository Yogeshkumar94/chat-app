console.log("welcome");
const socket = io("http://localhost:8000");

const form = document.getElementById("sendMessage");
const refresh = document.getElementById("refresh");
console.log(refresh);
const messageInput = document.getElementById("messageInp");
console.log("Message Input", messageInput);
const messageContainer = document.querySelector(".container");
const chatsContainer = document.querySelector(".chats");


const append = (message, position) => {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageElement.classList.add("message");
  messageElement.classList.add(position);
  messageContainer.append(messageElement);
};
const newChat = (nam, socketId) => {
  const nameElement = document.createElement("button");
  nameElement.innerText = nam;
  nameElement.classList.add("newChatName");
  nameElement.setAttribute('id',socketId)
  nameElement.addEventListener("click",(e)=>{
    socket.emit("privateChat",e.target.id)
  })
  chatsContainer.append(nameElement);
  
};


form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = e.target[0].value;
  append(`You: ${message}`, "right");
  socket.emit("send", message);
  e.target[0].value = "";
});
refresh.addEventListener("click", (e) => {
  socket.emit("reload");
});

let nam = prompt("Enter name: ");
socket.emit("new-user", nam);

socket.on("user-joined", (name, users) => {
  append(`${name} joined the chat`, "left");
  console.log(users);
  chatsContainer.innerText = "";
  for (const key in users) {
    newChat(users[key], key);
    console.log(users[key], key);
  }

});
socket.on("refresh", (users) => {
  console.log(users);
  chatsContainer.innerText = "";
  for (const key in users) {
    newChat(users[key], key);
    console.log(users[key], key);
  }
});
socket.on("receive", (data) => {
  append(`${data.nam}: ${data.message}`, "left");
});

socket.on("left", (nam) => {
  append(`${nam} has left the chat`, "left");
});

socket.on("privateMessage",(a,b)=>{
  console.log(`Welcome to private chat room with ${a} and ${b}`)
  
})