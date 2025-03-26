import React from 'react';
import GameSwiper from "../../heroBanner/GameSwiper.jsx";
import ChallengeSwiper from "../ui/ChallengeSwiper/ChallengeSwiper.jsx";
function ChallengePage() {
    return (
        <section id="home" className="home active">
            <div className="container-fluid">
                <div className="row">
                    <ChallengeSwiper />
                </div>
            </div>
        </section>
    );
}

export default ChallengePage;