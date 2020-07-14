import rest from './rest';
/* import graphql from './graphql'; */

const PORT = process.env.PORT || 5000;

rest.listen({ port: PORT }, () => {
  console.log(`REST API: Listening: http://localhost:5000`);
});

/*
graphql.listen({ port: 4000 }, () => {
  console.log(`GRAPHQL API: Listening: http://localhost:4000`);
});
*/
