import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import './ChallengeSwiper.css';
import { EffectCoverflow, Navigation, Autoplay } from 'swiper/modules';
import { useTranslation } from 'react-i18next';

import gameData from '../../../../gamesData.json';

function ChallengeSwiper() {
    const [active, setActive] = useState(false);
    const { i18n } = useTranslation(); // lấy ngôn ngữ hiện tại
    const currentLang = i18n.language || 'en';

    const handleToggleVideo = () => {
        setActive(!active);
    };

    return (
        <Swiper
            effect={'coverflow'}
            grabCursor={true}
            navigation={true}
            loop={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
                rotate: 35,
                stretch: 200,
                depth: 250,
                modifier: 1,
                slideShadows: true,
            }}
            autoplay={{
                delay: 2500,
                disableOnInteraction: false,
            }}
            modules={[EffectCoverflow, Navigation, Autoplay]}
            className="gameSwiper">

            {gameData.map(game => (
                <SwiperSlide key={game._id}>
                    <div className="gameSlider">
                        <img src={game.img} alt="Game Image" />
                        <div className="content">
                            <h2 className="hidden lg:block">{game.title}</h2>
                            <h3 className="block lg:hidden">{game.title}</h3>
                            <p>{game.description?.[currentLang] || game.description?.en}</p>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}

export default ChallengeSwiper;
