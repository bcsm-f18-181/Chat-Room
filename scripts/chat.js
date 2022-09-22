class Chatroom {
    constructor(room, username){
      this.room = room;
      this.username = username;
      this.chats = db.collection('chats');
      this.unsub;
    }
    async addChat(message){
      // format a chat object
      const now = new Date();
      const chat = {
        message: message,
        username: this.username,
        room: this.room,
        created_at: firebase.firestore.Timestamp.fromDate(now)
      };
      // save the chat document
      const response = await this.chats.add(chat);
      return response;
    }
    getChats(callback){
      this.unsub = this.chats
        .where('room', '==', this.room)
        .orderBy('created_at')
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if(change.type === 'added'){
              callback(change.doc.data());
            }
          });
      });
    }
    updateName(username){
      this.username = username;
    }
    updateRoom(room){
      this.room = room;
      console.log('room updated');
      if(this.unsub){
        this.unsub();
      }
    }
  }
 ///-----------------------appp js and ui-----------------------------------------------
 class ChatUI{
    constructor(list){
        this.list=list;
    }
        render(data){
             const when = dateFns.distanceInWordsToNow(
             data.created_at.toDate(),
            { addSuffix:true }
                  );
        const html=`
        <li class="list-gorup-item">
            <span>${data.username}</span>
            <span>${data.message}</span>
            <div>${when}</div>
        </li>
        `;
        this.list.innerHTML+=html;

    }
}

const chatList=document.querySelector('.chat-list');
const newChatForm= document.querySelector('.new-chat');
const newNameForm = document.querySelector('.new-name');
const updateMssg = document.querySelector('.update-mssg');

//class instance
const chatUI= new ChatUI(chatList);

newChatForm.addEventListener('submit' ,(e)=>{
    e.preventDefault();
    const message= newChatForm.message.value.trim();
    chatroom.addChat(message)
    .then(()=>{
        newChatForm.reset()
    })
    .catch((err)=>{
        console.log(err);
    })
})
// update username

newNameForm.addEventListener('submit', e => {
    e.preventDefault();
    // update name via chatroom
    const newName = newNameForm.name.value.trim();
    chatroom.updateName(newName);
    // reset the form
    newNameForm.reset();
    // show then hide the update message
    updateMssg.innerText = `Your name was updated to ${newName}`;
    setTimeout(() => updateMssg.innerText = '', 3000);
  });
  const username = localStorage.username ? localStorage.username : 'anon';
  const chatroom= new Chatroom('general',username);


chatroom.getChats((data)=>{
    chatUI.render(data);
});