const useRoutes = (app) => {
  // User Routes
  const userRouter = require("../routes/user");
  app.use("/api/users", userRouter);

  // Auth Routes
  const authRouter = require("../routes/auth");
  app.use("/api/auth", authRouter);

  // Provider Routes
  const providerRouter = require("../routes/provider");
  app.use("/api/provider", providerRouter);
};

module.exports = useRoutes;
