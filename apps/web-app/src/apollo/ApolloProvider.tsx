import { ApolloClient, NormalizedCacheObject, ApolloLink, InMemoryCache, from, concat, ApolloProvider, HttpLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { useRef } from "react";
import { useSelector } from "react-redux";
import authDataSelector from "../store/auth-data.slice";

const httpLink = new HttpLink({ uri: '/api/graphql' });

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.log(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
        );

    if (networkError) console.log(`[Network error]: ${networkError}`);
});

export const ApolloInint = (props: { children?: JSX.Element }): JSX.Element => {

    const authData = useSelector(authDataSelector);
    const apolloClient = useRef<ApolloClient<NormalizedCacheObject>>();

    const authMiddleware = new ApolloLink((operation, forward) => {
        operation.setContext(({ headers = {} }) => {
            const token = authData.authPayload?.tokens?.accessToken;

            return ({
                headers: {
                    ...headers,
                    authorization: token ? `Bearer ${token}` : null,
                }
            })
        });

        return forward(operation);
    });

    apolloClient.current = new ApolloClient({
        uri: '/api/graphql',
        cache: new InMemoryCache(),
        link: from([errorLink, concat(authMiddleware, httpLink)]),
        connectToDevTools: true,
    });

    return (
        <ApolloProvider client={apolloClient.current as ApolloClient<NormalizedCacheObject>}>
            {props.children}
        </ApolloProvider>
    );
}
