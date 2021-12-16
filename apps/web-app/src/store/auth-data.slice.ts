import { AuthPayload } from '@fullstack/data-access';
import {
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';
import { RootState } from './store';

export const AUTH_DATA_FEATURE_KEY = 'authData';

export interface AuthDataState {
  loadingStatus: 'not loaded' | 'loading' | 'loaded' | 'error';
  error: string | null;
  authenticated: boolean;
  authPayload: AuthPayload | null
}

export const initialAuthDataState: AuthDataState = {
  loadingStatus: 'not loaded',
  error: null,
  authenticated: false,
  authPayload: null,
}

export const authDataSlice = createSlice({
  name: AUTH_DATA_FEATURE_KEY,
  initialState: initialAuthDataState,
  reducers: {
    login: (state: AuthDataState, action: PayloadAction<AuthPayload>) => {
      state.authPayload = action.payload;
      state.authenticated = true;
    },
    loading: (state: AuthDataState, action: PayloadAction<{ loading: 'not loaded' | 'loading' | 'loaded' | 'error' }>) => {
      state.loadingStatus = action.payload.loading;
    },
    refresh: (state: AuthDataState, action: PayloadAction<AuthPayload>) => {
      state.authPayload = action.payload;
      state.authenticated = true;
    },
    logout: () => {
      return initialAuthDataState;
    },
  },
});

/*
 * Export reducer for store configuration.
 */
export const authDataReducer = authDataSlice.reducer;
export const authDataActions = authDataSlice.actions;

export const getAuthDataState = (rootState: RootState): AuthDataState =>
  rootState[AUTH_DATA_FEATURE_KEY];

const authDataSelector = (state: RootState): AuthDataState => state.authData;;

export default authDataSelector;
