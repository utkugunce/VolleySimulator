package middleware

import (
    "os"
    "strings"
    "github.com/gofiber/fiber/v2"
    "github.com/golang-jwt/jwt/v5"
)

func AuthRequired() fiber.Handler {
    return func(c *fiber.Ctx) error {
        authHeader := c.Get("Authorization")
        if authHeader == "" {
            return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
        }
        
        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        
        // Supabase JWT secret ile doğrula
        // Note: In production you should properly handle key rotation or read from env responsibly
        secret := os.Getenv("SUPABASE_JWT_SECRET") 
        if secret == "" {
             // Fallback to service role key if needed but better to enforce JWT secret
             // actually supabase usually uses the JWT Secret for signing user tokens.
             return c.Status(500).JSON(fiber.Map{"error": "Server configuration error"})
        }

        token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
            // Don't forget to validate the alg is what you expect:
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fiber.ErrUnauthorized
            }
            return []byte(secret), nil
        })
        
        if err != nil || !token.Valid {
            return c.Status(401).JSON(fiber.Map{"error": "Invalid token"})
        }
        
        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
             return c.Status(401).JSON(fiber.Map{"error": "Invalid token claims"})
        }

        c.Locals("userID", claims["sub"])
        
        return c.Next()
    }
}
