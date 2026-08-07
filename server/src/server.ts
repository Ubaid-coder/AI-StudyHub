import { env } from "./config/env";

import app from "./app";

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