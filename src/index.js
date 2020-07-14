import rest from './rest';
import graphql from './graphql';

const PORT = process.env.PORT || 5000;

rest.listen({ port: PORT }, () => {
  console.log(`REST API: Listening: http://localhost:${PORT}`);
  console.log(
    `GRAPHQL API: Listening: http://localhost:${PORT}${graphql.graphqlPath}`
  );
});
