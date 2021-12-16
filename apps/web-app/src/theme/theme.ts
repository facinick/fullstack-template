import { createTheme } from "@mui/material";
import { funk, system, swiss, dark, base, bootstrap, bulma, future, roboto, deep, tosh, sketchy, tailwind } from '@theme-ui/presets'
import { toMui } from './toMui';
export type Theme =
    typeof funk |
    typeof system |
    typeof swiss |
    typeof dark |
    typeof base |
    typeof bootstrap |
    typeof tailwind |
    typeof roboto |
    typeof bulma |
    typeof deep |
    typeof sketchy |
    typeof tosh |
    typeof future;

export type ThemeNameType = 'funk' | 'system' | 'swiss' | 'dark' | 'base' | 'bootstrap' | 'tailwind' | 'roboto' | 'bulma' | 'deep' | 'sketchy' | 'tosh' | 'future';

const getThemeByName = (themeName: ThemeNameType): Theme => {
    switch (themeName) {
        case 'funk':
            return funk;
        case 'system':
            return system;
        case 'swiss':
            return swiss;
        case 'dark':
            return dark;
        case 'bootstrap':
            return bootstrap;
        case 'tailwind':
            return tailwind;
        case 'roboto':
            return roboto;
        case 'bulma':
            return bulma;
        case 'deep':
            return deep;
        case 'sketchy':
            return sketchy;
        case 'tosh':
            return tosh;
        case 'future':
            return future;
        default:
            return future;
    }
}

export const getTheme = (name: ThemeNameType) => {
    //@ts-ignore
    return createTheme(toMui(getThemeByName(name)));
}