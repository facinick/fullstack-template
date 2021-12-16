import {
  fetchAuthData,
  authDataAdapter,
  authDataReducer,
} from './auth-data.slice';

describe('authData reducer', () => {
  it('should handle initial state', () => {
    const expected = authDataAdapter.getInitialState({
      loadingStatus: 'not loaded',
      error: null,
    });

    expect(authDataReducer(undefined, { type: '' })).toEqual(expected);
  });

  it('should handle fetchAuthDatas', () => {
    let state = authDataReducer(undefined, fetchAuthData.pending(null, null));

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loading',
        error: null,
        entities: {},
      })
    );

    state = authDataReducer(
      state,
      fetchAuthData.fulfilled([{ id: 1 }], null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'loaded',
        error: null,
        entities: { 1: { id: 1 } },
      })
    );

    state = authDataReducer(
      state,
      fetchAuthData.rejected(new Error('Uh oh'), null, null)
    );

    expect(state).toEqual(
      expect.objectContaining({
        loadingStatus: 'error',
        error: 'Uh oh',
        entities: { 1: { id: 1 } },
      })
    );
  });
});
