import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "./locales/en/translation.json";
import translationVI from "./locales/vi/translation.json";
import translationJP from "./locales/jp/translation.json";

import validationEN from "./locales/en/validation.json";
import validationVI from "./locales/vi/validation.json";
import validationJP from "./locales/jp/validation.json";

const resources = {
    en: {
        translation: translationEN,
        validation: validationEN,
    },
    vi: {
        translation: translationVI,
        validation: validationVI,
    },
    jp: {
        translation: translationJP,
        validation: validationJP,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: "vi",
    fallbackLng: "en",
    ns: ["translation", "validation"],
    defaultNS: "translation",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;