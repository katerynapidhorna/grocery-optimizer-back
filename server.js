const express = require("express");
// auth_____________________START
const authMiddleware = require("./auth/middleware");
const authRouter = require("./routers/auth");
// auth_____________________END

const { PORT } = require("./config/constants");
const cors = require("cors");
const { graphqlHTTP } = require("express-graphql");

const { GraphQLSchema } = require("graphql");
const { RootQueryType } = require("./graphql/query");
const { RootMutationType } = require("./graphql/mutation");
const app = express();
app.use(cors());
const bodyParserMiddleWare = express.json();
app.use(bodyParserMiddleWare);

console.log("RootQueryType", RootQueryType);

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

app.use("/", authRouter);

app.use(
  "/graphql",
  authMiddleware,
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log("Server started:", PORT);
});
