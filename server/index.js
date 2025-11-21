import createApp from './app.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  const app = await createApp();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();