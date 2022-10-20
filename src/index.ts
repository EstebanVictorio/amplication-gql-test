import express, { RequestHandler } from "express"
import { shouldRenderGraphiQL,renderGraphiQL, getGraphQLParameters, processRequest, sendResult } from "graphql-helix"
import { loadSchema } from '@graphql-tools/load'
import { addResolversToSchema } from '@graphql-tools/schema'
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
const app = express()


app.use(express.json())


app.use('/graphql', async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if(shouldRenderGraphiQL(request)) {
    res.send(renderGraphiQL())
    return
  }
  const schemaPath = `${__dirname}/graphql/schema.graphql`
  
  
  const schema = addResolversToSchema({
    schema: await loadSchema(schemaPath, { loaders: [new GraphQLFileLoader()] }),
    resolvers: {
      Query: {
        hello: () => "Hello world from GQL Helix!"
      }
    }
  })
  
  const { operationName, query, variables } = getGraphQLParameters(request);
  const result = await processRequest({
    operationName,
    query,
    variables,
    request,
    schema,
  });

  sendResult(result, res)
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`GraphQL server is running on port ${port}.`);
});