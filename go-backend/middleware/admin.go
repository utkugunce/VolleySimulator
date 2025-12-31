package middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func AdminOnly() fiber.Handler {
	return func(c *fiber.Ctx) error {
		email, ok := c.Locals("userEmail").(string)
		if !ok || email == "" {
			return c.Status(403).JSON(fiber.Map{"error": "Forbidden: No email found in token"})
		}

		adminEmailsEnv := os.Getenv("ADMIN_EMAILS")
		if adminEmailsEnv == "" {
			return c.Status(403).JSON(fiber.Map{"error": "Forbidden: No admins configured"})
		}

		validAdmins := strings.Split(adminEmailsEnv, ",")
		isAdmin := false
		for _, adminEmail := range validAdmins {
			if strings.TrimSpace(adminEmail) == email {
				isAdmin = true
				break
			}
		}

		if !isAdmin {
			return c.Status(403).JSON(fiber.Map{"error": "Forbidden: Not an admin"})
		}

		return c.Next()
	}
}
