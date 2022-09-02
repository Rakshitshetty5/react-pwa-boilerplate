import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ServiceWorkerUpdateListener } from './ServiceWorkerUpdateListener';
import UpdateWaiting from './UpdateWaiting ';

import NetflixBackgroundImage from './images/netflix-background.png';

const API_URL = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1'
const IMG_PATH = 'https://image.tmdb.org/t/p/w1280'

function App() {
  const [updateWaiting, setUpdateWaiting] = useState(false);
  const [registration, setRegistration] = useState(null);
  const [swListener, setSwListener] = useState({});
  const [showBtn, setShowBtn] = useState(false)
  const [ state, setState ] = useState([])
  useEffect(() => {
    (async () => {
      const response = await fetch(API_URL)
      const result = await response.json()
      setState(result.results) 
    })()
  }, [])
  useEffect(() => {
      if (process.env.NODE_ENV !== "development") {
        let listener = new ServiceWorkerUpdateListener();
        setSwListener(listener);
        listener.onupdateinstalling = (installingEvent) => {
        console.log("SW installed", installingEvent);
      };
      listener.onupdatewaiting = (waitingEvent) => {
        console.log("new update waiting", waitingEvent);
        setUpdateWaiting(true);
      };
      listener.onupdateready = (event) => {
        console.log("updateready event");
        window.location.reload();
      };
      navigator.serviceWorker.getRegistration().then((reg) => {
        listener.addRegistration(reg);
        setRegistration(reg);
      });

      return () => listener.removeEventListener();
    } else {
      //do nothing because no sw in development
    }
  }, [])
  let deferredPrompt = useRef();
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.current = e
      setShowBtn(true)
    })
  }, [])
  console.log(deferredPrompt.current)

  const handleInstall = () => {
    setShowBtn(false)
    console.log(deferredPrompt.current)
    deferredPrompt.current.prompt()
    deferredPrompt.current.userChoice.then((choiceResult) => {
      if(choiceResult.outcome === 'accepted'){
        console.log('accepted')
      }else{
        console.log('rejected')
      }
      deferredPrompt.current = null
    })
  }

  const handleUpdate = () => {
    swListener.skipWaiting(registration.waiting);
   }

  return (
    <div className="App">
      <div>
        {showBtn && <button onClick={handleInstall}>Install</button>}
        <h1>Rakshit Shetty</h1>
        <h2>Testing font cache</h2>
        <p>When you have some text, how can you choose a typeface? Many people—professional designers included—go through an app’s font menu until we find one we like. But the aim of this module is to show that there are many considerations that can improve our type choices. By setting some useful constraints to aid our type selection, we can also develop a critical eye for analyzing type along the way.</p>
        <div className="overlay" style={{background: `url(${NetflixBackgroundImage})`}}/>
        <div className='container'>
          {
            state.map(m => <div className='card' key={m.id}>
              <img src={IMG_PATH + m.backdrop_path} alt={"img"} className="image"/>
              <h1>{m.original_title}</h1>
            </div>)
          }
        </div>
      </div>
      <UpdateWaiting updateWaiting={updateWaiting} handleUpdate={handleUpdate}/>
    </div>
  );
}

export default App;