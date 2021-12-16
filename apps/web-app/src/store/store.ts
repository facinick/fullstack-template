import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { AUTH_DATA_FEATURE_KEY, authDataReducer } from "./auth-data.slice";

export type RootState = Record<string, any>

const store = configureStore({
    reducer: { [AUTH_DATA_FEATURE_KEY]: authDataReducer },
    // Additional middleware can be passed to this array
    middleware: [...getDefaultMiddleware()],
    devTools: process.env.NODE_ENV !== 'production',
    // Optional Redux store enhancers
    enhancers: [],
});

export default store;