import * as express from 'express';
import { server as apolloServer } from './graphql/server';
import * as http from 'http';

const app = express();

const httpServer = http.createServer(app);

apolloServer.applyMiddleware({ app });

apolloServer.installSubscriptionHandlers(httpServer);

app.get('/', function (req, res) {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  res.send(`Welcome to facinick API, navigate to ${host}/graphql`);
});

const port = process.env.PORT || 3333;

httpServer.listen(port, () => {
  console.log(
    `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`,
  );
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`,
  );
});


httpServer.on('error', console.error);
