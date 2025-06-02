import React, { useState,useEffect } from 'react';
import './main.css';
import Home from "./Home.jsx";

function Main() {
    const [active, setActive] = useState(false);
    const [games, setGames] = useState([]);
    const handleToggleActive = () => {
        setActive(!active);
    };

    const fetchData = () => {
        fetch('http://localhost:5173/gamesData.json')
            .then(res => res.json())
            .then(data => {
                setGames(data);
                console.log(data);
            })
            .catch(err => console.log(err));
    }

    useEffect(() => {
        fetchData();
    },[])
    return (
        <main>
            <div className={`banner ${active ? 'active' : undefined}`}>
                <div className="container-fluid">
                    <Home games={games} />
                </div>
            </div>
        </main>
    );
}

export default Main;
