import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Login from '../auth/login/login';
import authDataSelector from '../../store/auth-data.slice';
import './app.module.scss';
import Logout from '../auth/logout/logout';
import { useAuth } from '../auth/hooks';
import { Typography, useTheme } from '@mui/material';
import { Background } from '../../graphics/background/background';
import { Foreground } from '../foreground/Foreground';
import { Particle } from '../../graphics/background/particle/particle';

const AppWrapper = (props: { children?: React.ReactNode; }) => {
  const theme = useTheme();
  return (<div className="center" id="app" style={{ background: theme.palette.background.default, color: theme.palette.text.primary, height: "100%", position: "relative" }}>
    {props.children}
  </div>)
}

const App = () => {

  const authData = useSelector(authDataSelector);
  const [login, logout, refresh] = useAuth({});

  // for user who logged in and just reopened the tab/app
  useEffect(() => {
    refresh(true);
    const syncLogout = (event: StorageEvent) => {
      if (event.key === 'logout') {
        console.log('logged out from storage!');
        logout();
      }
    }
    window.addEventListener('storage', syncLogout);
    return () => {
      window.removeEventListener('storage', syncLogout);
    }
  }, [])

  if (authData.loadingStatus === 'not loaded') {
    return <AppWrapper><Typography>Initializing...</Typography></AppWrapper>
  }

  if (authData.loadingStatus === 'loading') {
    return <AppWrapper><Typography>Loading...</Typography></AppWrapper>
  }

  return (
    <AppWrapper>
      <Background>
        <Particle />
      </Background>
      <Foreground>
      </Foreground>
    </AppWrapper>
  );
};

export default App;
