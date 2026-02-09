import { Elysia } from "elysia";
import { registerRestaurant } from "./routes/register-restaurante";
import { sendAuthLink } from "./routes/send-auth-link";
import { authenticateFromLink } from "./routes/authenticate-from-link";

const app = new Elysia()
  .use(registerRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink);

app.listen(3333, () => {
  console.log(`🚀 Server running at http://localhost:3333`);
});
