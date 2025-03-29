package router

import (
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/sivasbeltr/sisman/internal/handlers"
	"github.com/sivasbeltr/sisman/internal/middleware"
	"gorm.io/gorm"
)

// ErrorHandler handles errors in a structured way
func ErrorHandler(c *fiber.Ctx, err error) error {
	// Default status code is 500
	code := fiber.StatusInternalServerError

	// Check if it's a Fiber error
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	// Return a JSON response with the error
	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": err.Error(),
	})
}

// SetupRoutes configures all the routes for the application
func SetupRoutes(app *fiber.App, db *gorm.DB) {
	// Middleware
	app.Use(logger.New(logger.Config{
		Format:     "[${time}] ${method} ${path} - ${status} ${latency}\n",
		TimeFormat: "2006-01-02 15:04:05",
	}))
	app.Use(recover.New())

	// Fix CORS configuration - using proper configuration syntax
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		// Fix: Remove AllowCredentials which is causing issues
	}))

	// Add request logging middleware
	app.Use(middleware.RequestLogger(db))

	// API group with version
	api := app.Group("/api/v1/sisman")

	// Auth routes - no auth required
	auth := api.Group("/auth")
	auth.Post("/login", handlers.Login(db))
	auth.Post("/refresh", handlers.RefreshToken(db))

	// User routes
	user := api.Group("/user", middleware.Auth())
	user.Get("/", middleware.RequireRole("admin"), handlers.GetAllUsers(db))
	user.Get("/:id", middleware.Auth(), handlers.GetUser(db))
	user.Post("/", middleware.RequireRole("admin"), handlers.CreateUser(db))
	user.Put("/:id", middleware.RequireRole("admin"), handlers.UpdateUser(db))
	user.Delete("/:id", middleware.RequireRole("admin"), handlers.DeleteUser(db))

	// User activity routes
	user.Get("/:id/activities", middleware.RequireRole("admin"), handlers.GetUserActivities(db))

	// Activity routes
	activities := api.Group("/activity", middleware.Auth(), middleware.RequireRole("admin"))
	activities.Get("/", handlers.GetAllActivities(db))
	activities.Get("/type/:type", handlers.GetActivitiesByType(db))
	activities.Get("/search", handlers.SearchActivities(db))
	activities.Delete("/cleanup", handlers.DeleteOldActivities(db))

	// Service monitoring routes
	service := api.Group("/service", middleware.Auth())
	service.Get("/", handlers.GetAllServices(db))
	service.Get("/:id", handlers.GetService(db))
	service.Get("/:id/metrics", handlers.GetServiceMetrics(db))
	service.Post("/", middleware.RequireRole("admin"), handlers.CreateService(db))
	service.Put("/:id", middleware.RequireRole("admin"), handlers.UpdateService(db))
	service.Delete("/:id", middleware.RequireRole("admin"), handlers.DeleteService(db))

	// Command routes
	command := api.Group("/command", middleware.Auth())
	command.Get("/", handlers.GetAllCommands(db))
	command.Get("/:id", handlers.GetCommand(db))
	command.Post("/", middleware.RequireRole("admin"), handlers.CreateCommand(db))
	command.Put("/:id", middleware.RequireRole("admin"), handlers.UpdateCommand(db))
	command.Delete("/:id", middleware.RequireRole("admin"), handlers.DeleteCommand(db))
	command.Post("/:id/execute", middleware.Auth(), handlers.ExecuteCommand(db))

	// Nginx routes
	nginx := api.Group("/nginx", middleware.Auth())
	nginx.Get("/", handlers.GetAllNginxConfigs(db))
	nginx.Get("/:id", handlers.GetNginxConfig(db))
	nginx.Post("/", middleware.RequireRole("admin"), handlers.CreateNginxConfig(db))
	nginx.Put("/:id", middleware.RequireRole("admin"), handlers.UpdateNginxConfig(db))
	nginx.Delete("/:id", middleware.RequireRole("admin"), handlers.DeleteNginxConfig(db))
	nginx.Post("/:id/apply", middleware.RequireRole("admin"), handlers.ApplyNginxConfig(db))

	// Docker routes
	docker := api.Group("/docker", middleware.Auth())
	docker.Get("/containers", handlers.GetAllContainers(db))
	docker.Get("/containers/:id", handlers.GetContainer(db))
	docker.Post("/containers/:id/start", middleware.RequireRole("admin"), handlers.StartContainer(db))
	docker.Post("/containers/:id/stop", middleware.RequireRole("admin"), handlers.StopContainer(db))
	docker.Get("/containers/:id/logs", middleware.Auth(), handlers.GetContainerLogs(db))
	docker.Get("/containers/:id/stats", handlers.GetContainerStats(db))
	docker.Get("/images", handlers.GetAllImages(db))

	// System health and info routes
	system := api.Group("/system")
	system.Get("/health", handlers.GetSystemHealth(db)) // Public health endpoint
	system.Get("/info", middleware.Auth(), middleware.RequireRole("admin"), handlers.GetSystemInfo(db))
}
