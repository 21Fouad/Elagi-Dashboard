import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
    supportedLngs: ['en', 'ar'],
    fallbackLng: "en",
    detection: {
        order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage', 'cookie'],
    },
    backend: {
        loadPath: '/assets/locales/{{lng}}/translation.json',
    },
    react: { useSuspense: false }
});

export default i18n;
