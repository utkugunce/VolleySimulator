package handlers

import (
    "github.com/gofiber/fiber/v2"
    "go-backend/database"

    "github.com/supabase-community/postgrest-go"
)

type PredictionInput struct {
    MatchID       string `json:"matchId"`
    League        string `json:"league"`
    GroupName     string `json:"groupName"`
    HomeTeam      string `json:"homeTeam"`
    AwayTeam      string `json:"awayTeam"`
    MatchDate     string `json:"matchDate,omitempty"`
    PredictedScore string `json:"predictedScore"`
}

func GetPredictions(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)
    league := c.Query("league")
    group := c.Query("group")

    // Construct query
    query := database.Client.From("predictions").
        Select("*", "", false).
        Eq("user_id", userID).
        Order("created_at", &postgrest.OrderOpts{Ascending: false})
    
    if league != "" {
        query = query.Eq("league", league)
    }
    if group != "" {
        query = query.Eq("group_name", group)
    }

    // Execute
    // Note: supabase-go might return json string or map, depending on usage.
    // ExecuteTo is useful to map to struct. 
    // For now we assume a raw Execute is fine or we define a struct.
    // Let's use a generic map for flexibility in this migration phase.
    var results []map[string]interface{}
    _, err := query.ExecuteTo(&results)
    
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    
    return c.JSON(fiber.Map{"predictions": results})
}

func SavePredictions(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)
    
    // Body can be array or single object
    var input []PredictionInput
    
    // Try parsing as array
    if err := c.BodyParser(&input); err != nil {
        // Try parsing as single object
        var single PredictionInput
        if err2 := c.BodyParser(&single); err2 == nil {
            input = []PredictionInput{single}
        } else {
             return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
        }
    }

    if len(input) == 0 {
        return c.Status(400).JSON(fiber.Map{"error": "No predictions provided"})
    }

    // Prepare data for upsert
    var records []map[string]interface{}
    for _, p := range input {
        // Need to convert matchDate if present
        // Default to nil or string logic
        var mDate interface{} = nil
        if p.MatchDate != "" {
            mDate = p.MatchDate // Assuming format is correct (YYYY-MM-DD or ISO)
        }

        records = append(records, map[string]interface{}{
            "user_id": userID,
            "match_id": p.MatchID,
            "league": p.League,
            "group_name": p.GroupName,
            "home_team": p.HomeTeam,
            "away_team": p.AwayTeam,
            "match_date": mDate,
            "predicted_score": p.PredictedScore,
            // "updated_at": time.Now()... // Supabase might handle this or we send it
        })
    }

    // Upsert
    // Note: supabase-go Upsert syntax
    _, _, err := database.Client.From("predictions").
        Upsert(records, "", "", "").
        Execute()

    if err != nil {
         return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{
        "success": true,
        "saved": len(records),
        "message": "Tahminler kaydedildi",
    })
}

func DeletePrediction(c *fiber.Ctx) error {
    userID := c.Locals("userID").(string)
    matchID := c.Query("matchId")
    
    if matchID == "" {
        return c.Status(400).JSON(fiber.Map{"error": "Match ID required"})
    }

    _, _, err := database.Client.From("predictions").
        Delete("", "").
        Eq("user_id", userID).
        Eq("match_id", matchID).
        Execute()

    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.JSON(fiber.Map{"success": true})
}
