import { ApolloError } from '@apollo/client';
import { AuthPayload, useRefreshMutation } from '@fullstack/data-access';
import { authDataActions } from 'apps/web-app/src/store/auth-data.slice';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';

export interface AuthRefreshProps {
  intervalSeconds: number;
  onError: () => void;
}

export function useAuthRefresh(props: AuthRefreshProps): [startAuthService: () => void, stopAuthService: () => void, error: ApolloError | undefined] {

  const [refreshMutation, { error }] = useRefreshMutation();

  const [isActive, setIsActive] = useState(false);

  const accessTokenRenewInterval = useRef<NodeJS.Timeout>();

  const errCount = useRef(0);

  const dispatch = useDispatch();

  useEffect(() => {

    if (isActive) {
      accessTokenRenewInterval.current = setInterval(async () => {
        let mutationResult;
        try {
          mutationResult = await refreshMutation();
        } catch (error) {
          // network req failed
          mutationResult = {
            data: null,
            errors: []
          }
        }

        let data = mutationResult.data;

        while (errCount.current < 3 && !data) {
          errCount.current = errCount.current + 1;
          console.log(`autorefresh failure, retry attempt #${errCount.current}`);
          data = await (await refreshMutation()).data;
        }

        if (data) {
          console.log(`autorefresh success (total re-attempts #${errCount.current})`);
          const authPaylaod = data.refresh as AuthPayload;
          dispatch(authDataActions.refresh(authPaylaod));
          errCount.current = 0;
        } else {
          console.log(`autorefresh failure (total re-attempts #${errCount.current}) | logging out`);
          props.onError();
        }

      }, (props.intervalSeconds) * 1000);
    } else {
      clearInterval(Number(accessTokenRenewInterval.current));
    }

    return () => {
      clearInterval(Number(accessTokenRenewInterval.current));
    };
  }, [isActive]);

  return [() => setIsActive(true), () => setIsActive(false), error];
}

export default useAuthRefresh;
