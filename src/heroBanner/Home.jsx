import React from 'react';
import GameSwiper from "../heroBanner/GameSwiper.jsx";
function Home({games}) {
    return (
           <section id="home" className="home active">
               <div className="container-fluid">
                   <div className="row">
                       <GameSwiper games={games} />
                   </div>
               </div>
           </section>
        );
    }

export default Home;