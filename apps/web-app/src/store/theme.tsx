import { ThemeProvider } from '@mui/material/styles';
import React, { useState } from 'react';
import { getTheme, ThemeNameType } from '../theme/theme';

const DEFAULT: {
  currentTheme: ThemeNameType;
  setTheme: (name: ThemeNameType) => void;
} = {
  currentTheme: 'dark',
  setTheme: (name: ThemeNameType) => { }
}

export const CustomThemeContext = React.createContext<{
  currentTheme: ThemeNameType;
  setTheme: (name: ThemeNameType) => void;
}>(
  DEFAULT
)

interface Props {
  children?: React.ReactNode
}

export const CustomThemeProvider = (props: Props) => {

  const [themeName, _setThemeName] = useState<ThemeNameType>(DEFAULT.currentTheme);

  const theme = getTheme(themeName);

  const setThemeName = (name: ThemeNameType) => {
    _setThemeName(name)
  }

  const contextValue = {
    currentTheme: DEFAULT.currentTheme,
    setTheme: setThemeName,
  }

  return (
    <CustomThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        {props.children}
      </ThemeProvider>
    </CustomThemeContext.Provider>
  )
}