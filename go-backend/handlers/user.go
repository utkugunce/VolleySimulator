package handlers

import (
    "github.com/gofiber/fiber/v2"
    "go-backend/database"

    "github.com/supabase-community/postgrest-go"
)

func GetProfile(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)

    // 1. Get Profile
    var profile []map[string]interface{}
    database.Client.From("user_profiles").
        Select("*", "", false).
        Eq("id", userID).
        ExecuteTo(&profile)
    
    // 2. Get Leaderboard Entry (Stats)
    var stats []map[string]interface{}
    database.Client.From("leaderboard").
        Select("*", "", false).
        Eq("user_id", userID).
        ExecuteTo(&stats)

    // 3. Get Recent Predictions
    var recent []map[string]interface{}
    database.Client.From("predictions").
        Select("*", "", false).
        Eq("user_id", userID).
        Order("created_at", &postgrest.OrderOpts{Ascending: false}).
        Limit(10, "").
        ExecuteTo(&recent)

    // Construct response
    resp := fiber.Map{
        "profile": nil,
        "stats": fiber.Map{
            "total_points": 0,
            "correct_predictions": 0,
            "total_predictions": 0,
            "current_streak": 0,
            "best_streak": 0,
        },
        "recentPredictions": []interface{}{},
    }

    if len(profile) > 0 {
        resp["profile"] = profile[0]
    } else {
        // Default profile
        resp["profile"] = fiber.Map{
             "id": userID,
             "level": 1,
             "xp": 0,
        }
    }

    if len(stats) > 0 {
        resp["stats"] = stats[0]
    }
    
    if len(recent) > 0 {
        resp["recentPredictions"] = recent
    }

    return c.JSON(resp)
}

func UpdateProfile(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)
    
    var body map[string]interface{}
    if err := c.BodyParser(&body); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid body"})
    }

    updates := make(map[string]interface{})
    allowed := []string{"display_name", "avatar_url", "favorite_team"}
    
    for _, field := range allowed {
        if val, ok := body[field]; ok {
            updates[field] = val
        }
    }

    if len(updates) == 0 {
         return c.Status(400).JSON(fiber.Map{"error": "No valid fields"})
    }
    
    // In older TS: updated_at: new Date()...
    // updates["updated_at"] = time.Now()

    var result []map[string]interface{}
    _, err := database.Client.From("user_profiles").
        Update(updates, "", "").
        Eq("id", userID).
        ExecuteTo(&result)

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    // Also update leaderboard display_name if changed
    if name, ok := updates["display_name"]; ok {
         database.Client.From("leaderboard").
             Update(map[string]interface{}{"display_name": name}, "", "").
             Eq("user_id", userID).
             Execute()
    }
    
    if len(result) > 0 {
        return c.JSON(fiber.Map{"success": true, "profile": result[0]})
    }
    return c.JSON(fiber.Map{"success": true})
}
