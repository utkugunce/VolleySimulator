package main

import (
    "log"
    "os"
    "github.com/gofiber/fiber/v2"
    "github.com/gofiber/fiber/v2/middleware/cors"
    "github.com/gofiber/fiber/v2/middleware/logger"
    "github.com/joho/godotenv"
    
    "go-backend/database"
    "go-backend/handlers"
    "go-backend/middleware"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize Database
    if err := database.Init(); err != nil {
        log.Fatalf("Failed to initialize database: %v", err)
    }

    app := fiber.New(fiber.Config{
        Prefork:       false, // Disable prefork on Windows for development
        CaseSensitive: true,
        AppName:       "VolleySimulator API v1.0.0",
    })

    // Middleware
    app.Use(logger.New())
    app.Use(cors.New(cors.Config{
        AllowOrigins: "https://volleysimulator.com.tr,http://localhost:3000",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
    }))

    // Routes
    api := app.Group("/api")
    
    // Data endpoints (public)
    api.Get("/1lig", handlers.Get1Lig)
    api.Get("/scrape", handlers.Get2Lig)
    api.Get("/vsl", handlers.GetVSL)
    api.Get("/cev-cl", handlers.GetCEVCL)
    api.Get("/leaderboard", handlers.GetLeaderboard) // Leaderboard can be public
    
    // Protected endpoints
    protected := api.Group("/", middleware.AuthRequired())
    protected.Get("/predictions", handlers.GetPredictions)
    protected.Post("/predictions", handlers.SavePredictions)
    protected.Delete("/predictions", handlers.DeletePrediction)
    protected.Get("/user/profile", handlers.GetProfile)
    protected.Put("/user/profile", handlers.UpdateProfile)
    protected.Post("/calculate", handlers.Calculate)
    protected.Post("/predict-all", handlers.PredictAll)

    // Cron jobs
    api.Post("/results/sync", handlers.SyncResults)
    api.Post("/cron/update-results", handlers.UpdateResults)

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    
    log.Printf("Server starting on port %s", port)
    log.Fatal(app.Listen(":" + port))
}
