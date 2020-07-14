import rest from './rest';
import graphql from './graphql';

rest.listen({ port: 5000 }, () => {
  console.log(`REST API: Listening: http://localhost:5000`);
});

graphql.listen({ port: 4000 }, () => {
  console.log(`GRAPHQL API: Listening: http://localhost:4000`);
});
