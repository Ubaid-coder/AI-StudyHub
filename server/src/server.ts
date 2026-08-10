import { env } from "./config/env";
import { connectDatabase } from './config/database';
import app from "./app";

const startServer = async () => {
  await connectDatabase();
  const PORT = env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`
    ================================
    
    🚀 Server Running
    
    Port : ${PORT}
    
    Mode : ${process.env.NODE_ENV}
    
    ================================
    `);
  });
}

startServer();