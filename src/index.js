import restApp from './rest';
/* import graphqlApp from './graphql'; */

restApp.listen({ port: 5000 }, () => {
  console.log(`REST API: Listening: http://localhost:5000`);
});

/*
graphqlApp.listen({ port: 5000 }, () => {
  console.log(`GraphQl: listening: http://localhost:5000`);
});
*/
