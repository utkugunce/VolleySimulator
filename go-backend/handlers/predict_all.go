package handlers

import (
    "math"
    "github.com/gofiber/fiber/v2"
    "go-backend/utils"
)

type PredictAllRequest struct {
    Teams           []utils.TeamStats `json:"teams"`
    UpcomingMatches []utils.Match     `json:"upcomingMatches"`
    AllMatches      []utils.Match     `json:"allMatches"`
}

func PredictAll(c *fiber.Ctx) error {
    var req PredictAllRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }

    if len(req.Teams) == 0 {
        return c.Status(400).JSON(fiber.Map{"error": "Missing match data"})
    }

    eloMap := utils.CalculateElo(req.Teams, req.AllMatches)
    predictions := make(map[string]string)

    for _, m := range req.UpcomingMatches {
        hElo := eloMap[m.HomeTeam]
        if hElo == 0 { hElo = 1200 }
        aElo := eloMap[m.AwayTeam]
        if aElo == 0 { aElo = 1200 }

        expectedHome := 1.0 / (1.0 + math.Pow(10, (aElo-hElo)/400.0))
        score := "3-2"

        if expectedHome > 0.85 {
            score = "3-0"
        } else if expectedHome > 0.70 {
            score = "3-1"
        } else if expectedHome > 0.55 {
            score = "3-2"
        } else if expectedHome < 0.15 {
            score = "0-3"
        } else if expectedHome < 0.30 {
            score = "1-3"
        } else if expectedHome < 0.45 {
            score = "2-3"
        } else {
             if expectedHome >= 0.5 {
                 score = "3-2"
             } else {
                 score = "2-3"
             }
        }
        
        matchID := m.HomeTeam + "|||" + m.AwayTeam
        predictions[matchID] = score
    }

    return c.JSON(predictions)
}
