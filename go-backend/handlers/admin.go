package handlers

import (
    "github.com/gofiber/fiber/v2"
    "go-backend/database"
)

func GetAdminStats(c *fiber.Ctx) error {
    // 1. Total Users
    var users []map[string]interface{}
    database.Client.From("user_profiles").Select("count", "exact", true).ExecuteTo(&users)
    
    // 2. Total Predictions
    var predictions []map[string]interface{}
    database.Client.From("predictions").Select("count", "exact", true).ExecuteTo(&predictions)

    // 3. Total Match Results (Recorded)
    var results []map[string]interface{}
    database.Client.From("match_results").Select("count", "exact", true).ExecuteTo(&results)

    // Note: Postgrest-go doesn't support 'count' easily in that way without Count option?
    // Actually, simple Select with HEAD is better for count, but library support varies.
    // Let's assume we fetch all for now in MVP or basic select.
    // Optimization: In real prod, use proper count query. But supabase-go client is a bit verbose.
    // Let's try to get count from the response header if possible, or just length of ID select.
    
    // Efficient way:
    // _, count, _ := database.Client.From("table").Select("id", "exact", true).Execute()
    
    _, userCount, _ := database.Client.From("user_profiles").Select("id", "exact", true).Execute()
    _, predCount, _ := database.Client.From("predictions").Select("id", "exact", true).Execute()
    _, resultCount, _ := database.Client.From("match_results").Select("id", "exact", true).Execute()

    return c.JSON(fiber.Map{
        "users":       userCount,
        "predictions": predCount,
        "results":     resultCount,
    })
}

type UpdateMatchRequest struct {
    MatchID     string `json:"matchId"`
    League      string `json:"league"`
    HomeTeam    string `json:"homeTeam"`
    AwayTeam    string `json:"awayTeam"`
    MatchDate   string `json:"matchDate"`
    ResultScore string `json:"resultScore"`
}

func UpdateMatchResult(c *fiber.Ctx) error {
    var req UpdateMatchRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
    }

    if req.MatchID == "" || req.ResultScore == "" {
        return c.Status(400).JSON(fiber.Map{"error": "MatchID and ResultScore are required"})
    }

    // 1. Upsert match result
    _, _, err := database.Client.From("match_results").Upsert(map[string]interface{}{
        "match_id": req.MatchID,
        "league": req.League,
        "home_team": req.HomeTeam,
        "away_team": req.AwayTeam,
        "match_date": req.MatchDate,
        "result_score": req.ResultScore,
        "is_verified": true, // Admin is manually verifying
    }, "", "", "").Execute()

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": "Failed to save match result: " + err.Error()})
    }

    // 2. Trigger prediction scoring
    scoredCount, err := processMatchResult(req.MatchID, req.ResultScore)
    if err != nil {
        // Log error but don't fail the request since the result is saved
        return c.JSON(fiber.Map{
            "success": true,
            "message": "Result saved but scoring failed",
            "error": err.Error(),
        })
    }

    return c.JSON(fiber.Map{
        "success": true,
        "scored": scoredCount,
    })
}
