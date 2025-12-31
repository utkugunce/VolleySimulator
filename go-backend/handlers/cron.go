package handlers

import (
    "os"
    "strings"
    "github.com/gofiber/fiber/v2"
    "go-backend/database"
)

type ResultInput struct {
    MatchID     string `json:"matchId"`
    League      string `json:"league"`
    GroupName   string `json:"groupName"`
    HomeTeam    string `json:"homeTeam"`
    AwayTeam    string `json:"awayTeam"`
    MatchDate   string `json:"matchDate"`
    ResultScore string `json:"resultScore"`
}

type SyncResultsRequest struct {
    Results []ResultInput `json:"results"`
}

const (
    SCORE_EXACT_MATCH = 15
    SCORE_WINNER_CORRECT = 8
)

func getWinner(score string) string {
    parts := strings.Split(score, "-")
    if len(parts) != 2 { return "draw" }
    if parts[0] > parts[1] { return "home" }
    if parts[1] > parts[0] { return "away" }
    return "draw"
}

func calculatePoints(predicted, actual string) int {
    if predicted == actual { return SCORE_EXACT_MATCH }
    if getWinner(predicted) == getWinner(actual) { return SCORE_WINNER_CORRECT }
    return 0
}

func SyncResults(c *fiber.Ctx) error {
    authHeader := c.Get("Authorization")
    secret := os.Getenv("CRON_SECRET")
    
    if secret != "" && authHeader != "Bearer "+secret {
         return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
    }

    var req SyncResultsRequest
    if err := c.BodyParser(&req); err != nil {
         return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }

    savedResults := 0
    scoredPredictions := 0
    
    for _, res := range req.Results {
        // Upsert result
        _, _, err := database.Client.From("match_results").Upsert(map[string]interface{}{
            "match_id": res.MatchID,
            "league": res.League,
            "group_name": res.GroupName,
            "home_team": res.HomeTeam,
            "away_team": res.AwayTeam,
            "match_date": res.MatchDate,
            "result_score": res.ResultScore,
            "is_verified": true,
        }, "", "", "").Execute()
        
        if err == nil { 
            savedResults++
            if count, err := processMatchResult(res.MatchID, res.ResultScore); err == nil {
                scoredPredictions += count
            }
        }
    }

    return c.JSON(fiber.Map{
        "success": true,
        "savedResults": savedResults,
        "scoredPredictions": scoredPredictions,
    })
}

// processMatchResult calculates points for all pending predictions of a match
func processMatchResult(matchID, resultScore string) (int, error) {
    var preds []map[string]interface{}
    _, err := database.Client.From("predictions").
        Select("*", "", false).
        Eq("match_id", matchID).
        Eq("is_scored", "false").
        ExecuteTo(&preds)
    
    if err != nil {
        return 0, err
    }
        
    scoredCount := 0
    for _, p := range preds {
        predScore := p["predicted_score"].(string)
        points := calculatePoints(predScore, resultScore)
        
        database.Client.From("predictions").Update(map[string]interface{}{
            "points_earned": points,
            "is_scored": true,
        }, "", "").Eq("id", p["id"].(string)).Execute()
        scoredCount++
    }
    return scoredCount, nil
}


func UpdateResults(c *fiber.Ctx) error {
    return c.Status(501).JSON(fiber.Map{
        "message": "Scraping functionality is external (Node.js).",
    })
}
