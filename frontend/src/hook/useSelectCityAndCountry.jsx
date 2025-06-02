import {useEffect, useState} from "react";
import {
    EMAIL_API_COUNTRY,
    TOKEN_API_COUNTRY,
    URL_CITY_API,
    URL_COUNTRY_API,
    URL_TOKEN_API_COUNTRY
} from "../utils/contant.js";
import useLocalStorage from "./useLocalStorage.jsx";

function useSelectCityAndCountry() {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [country, setCountry] = useState("");
    const [accessTokenCountry, saveValue] = useLocalStorage("ACCESS_TOKEN_COUNTRY",null);

    const fetchCountries = ()=>{
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Authorization", "Bearer "+ accessTokenCountry.auth_token);
        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        fetch(URL_COUNTRY_API, requestOptions)
            .then(response => response.json())
            .then(data => {
                setCountries(data);
            })
            .catch(error => console.log('error', error));
    }
    const fetchCities = ()=>{
        if(!country) return;
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Authorization", "Bearer "+ accessTokenCountry.auth_token);
        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        fetch(URL_CITY_API+country, requestOptions)
            .then(response => response.json())
            .then(data => setCities(data))
            .catch(error => console.log('error', error));
    }

    useEffect(() => {
        const headers = new Headers();
        headers.append("Accept", "application/json");
        headers.append("Content-Type", "application/json");
        headers.append("api-token", TOKEN_API_COUNTRY);
        headers.append("user-email", EMAIL_API_COUNTRY);

        const requestOptions = {
            method: 'GET',
            headers: headers
        };
        fetch(URL_TOKEN_API_COUNTRY, requestOptions)
            .then(response => response.json())
            .then(data => {
                saveValue(data);
                fetchCountries();
            })
            .catch(error => console.log('error', error));
    }, []);

    useEffect(() => {
        fetchCities();
    },[country])
    return [country, cities, countries, setCountry];
}
export default useSelectCityAndCountry;