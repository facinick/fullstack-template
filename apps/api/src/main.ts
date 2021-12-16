import * as express from 'express';
import { server as apolloServer } from './graphql/server';

const app = express();

apolloServer.applyMiddleware({ app });

app.get('/', function (req, res) {
  const proxyHost = req.headers["x-forwarded-host"];
  const host = proxyHost ? proxyHost : req.headers.host;
  res.send(`Welcome to facinick API, navigate to ${host}/graphql`);
});

const port = process.env.PORT || 3333;

const server = app.listen(port, () => {
  console.log('🔥🔥🔥 Listening at http://localhost:' + port + " 🔥🔥🔥");
});

server.on('error', console.error);
