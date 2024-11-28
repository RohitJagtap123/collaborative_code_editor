import React, {useState} from 'react';
import Client from '../components/Client.js';
import Editor from '../components/Editor.js';
// import {Logo} from '../public/Logo';


const EditorPage = ()=>{

    const [clients,setClients]=useState([
        {socketId:1 ,username:'Rohan'},
        {socketId:2 ,username:'Rohit'}
    ]);


    return (

                
        <div className='Main'>

            <div className='left'>

                <div className='left-inner'>

                    <div className='logo'>
                         <img className='logoImg'  src="Logo.PNG"
                    alt="logo"/>
                    </div>

                    <h3>Connected</h3>


                    <div className='client-list'>

                       {
                        clients.map(client=>(
                            <Client
                              key={client.socketId}
                              username={client.username}
                            /> 
                        ))
                       }                    

                    </div>
                        
                </div>


                <button className='copybtn'>copy Room ID</button>
                <button className='leavebtn'>Leave button</button>

            </div>


            <div className='right'>

                 <Editor></Editor> 
                  
            </div>

        </div>
        
        
    )


}
export default EditorPage