// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationVI from "./locales/vi/translation.json";
import translationJP from "./locales/jp/translation.json";

const resources = {
    en: { translation: translationEN },
    jp: { translation: translationJP },
    vi: { translation: translationVI },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "vi", // default language
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
