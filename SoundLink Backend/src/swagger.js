import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SoundLink API",
      version: "1.0.0",
      description: "API documentation for SoundLink music platform"
    }
  },
  apis: ["./src/routes/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}; 