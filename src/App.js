import React, { useRef, useState, useEffect } from 'react';
import * as Icon from 'react-bootstrap-icons';
import './App.css';

import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyCsRuvkvP5vVpysLBU6a9G6vj42gSzlS2U",
  authDomain: "reactchat-hjc.firebaseapp.com",
  projectId: "reactchat-hjc",
  storageBucket: "reactchat-hjc.appspot.com",
  messagingSenderId: "983251516623",
  appId: "1:983251516623:web:3f29c8c0affeb245188bba"
})

const auth = firebase.auth();
const firestore = firebase.firestore();



function App() {

  const [user] = useAuthState(auth);
  
  return (
    <div className="App">
        {user ? <ChatRoom /> : <SignIn />}
    </div>
  );
}

// Sign In Page
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <button className='logout-button' onClick={signInWithGoogle}>Sign in with Google</button>
  )
}

// Sign Out Button
function SignOut() {
  return auth.currentUser && (
    <button className='logout-button' onClick={() => auth.signOut()}>
      <Icon.BoxArrowLeft className='input-button-icon' />
    </button>
  )
}

// Chat Room Page
function ChatRoom() {
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'asc');
  const dummy = useRef();

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const [nameValue, setNameValue] = useState('');

  // On first load scroll to latest text
  useEffect(() => {
    dummy.current.scrollIntoView({behavior: 'smooth'});
  });

  // Handle send a message
  const sendMessage = async(e) => {
    e.preventDefault();
    const { uid } = auth.currentUser;
    
    if (formValue !== '') {
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        name: nameValue,
        uid
      });

      setFormValue('');
      dummy.current.scrollIntoView({behavior: 'smooth'});
    }
  }

  // HTML for ChatRoom
  return (
    <div className='chat-room'>
      <div className='header-container'>
        <SignOut />
        <input className='header-text'
          placeholder='enter a username'
          type="text"
          maxlength="20"
          pattern="[a-zA-Z]*"
          value={nameValue} 
          onChange={(e) => setNameValue(e.target.validity.valid ? e.target.value : nameValue)}/>
      </div>
      
      <div className='message-container'>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </div>

      <form className='input-container' onSubmit={sendMessage}>
        <input className='input-textbox' 
          type="text" 
          maxlength="280"
          pattern="^[A-Za-z0-9.?! _]*$"
          value={formValue} 
          onClick={(e) => dummy.current.scrollIntoView({behavior: 'smooth'})}
          onChange={(e) => setFormValue(e.target.validity.valid ? e.target.value : formValue)}/>

        <button className='input-button' type="submit">
          <Icon.Send className='input-button-icon' />
        </button>
      </form>
    </div>
  )
}

function ChatMessage(props) {
  const { text, uid, name } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'recieved';

  return (
    <>    
      <p className={`sender ${messageClass}`}>{name}</p>
      <div className={`message ${messageClass}`}>
        <p className='message-text'>{ text }</p>
      </div>
    </>
  )
}

export default App;
