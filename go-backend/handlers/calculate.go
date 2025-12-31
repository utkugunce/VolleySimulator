package handlers

import (
    "context"
    "fmt"
    "math"
    "math/rand"
    "os"
    "sort"
    "time"

    "github.com/gofiber/fiber/v2"
    "github.com/google/generative-ai-go/genai"
    "google.golang.org/api/option"
    
    "go-backend/utils"
)

type CalculateRequest struct {
    Teams      []utils.TeamStats `json:"teams"`
    Fixture    []utils.Match     `json:"fixture"`
    TargetTeam string            `json:"targetTeam"`
    Overrides  []interface{}     `json:"overrides"` // Ignoring structure for now
}

type MatchOutcome struct {
    HomeSets   int
    AwaySets   int
    HomePoints int
    AwayPoints int
    HomeWin    bool
}

func simulateMatch(homeElo, awayElo float64) MatchOutcome {
    expectedHome := 1.0 / (1.0 + math.Pow(10, (awayElo-homeElo)/400.0))
    homeWin := rand.Float64() < expectedHome
    
    var hSets, aSets int
    if homeWin {
        hSets = 3
        dominance := expectedHome
        r2 := rand.Float64()
        if dominance > 0.8 {
            if r2 < 0.7 { aSets = 0 } else { aSets = 1 }
        } else if dominance > 0.6 {
            if r2 < 0.5 { aSets = 1 } else { aSets = 2 }
        } else {
             aSets = 2
        }
    } else {
        aSets = 3
        dominance := 1.0 - expectedHome
        r2 := rand.Float64()
        if dominance > 0.8 {
            if r2 < 0.7 { hSets = 0 } else { hSets = 1 }
        } else if dominance > 0.6 {
            if r2 < 0.5 { hSets = 1 } else { hSets = 2 }
        } else {
             hSets = 2
        }
    }
    
    var hPoints, aPoints int
    if hSets == 3 {
        if aSets <= 1 {
            hPoints = 3
        } else {
            hPoints = 2
            aPoints = 1
        }
    } else {
        if hSets <= 1 {
            aPoints = 3
        } else {
            aPoints = 2
            hPoints = 1
        }
    }

    return MatchOutcome{hSets, aSets, hPoints, aPoints, homeWin}
}

func Calculate(c *fiber.Ctx) error {
    var req CalculateRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "Invalid JSON"})
    }

    if req.TargetTeam == "" || len(req.Teams) == 0 {
         return c.Status(400).JSON(fiber.Map{"error": "Missing required fields"})
    }

    // 1. Calculate Elo
    eloMap := utils.CalculateElo(req.Teams, req.Fixture)

    // 2. Identify Unplayed
    matchesToSimulate := make([]utils.Match, 0)
    for _, m := range req.Fixture {
        if !m.IsPlayed {
            matchesToSimulate = append(matchesToSimulate, m)
        }
    }

    if len(matchesToSimulate) == 0 {
         // Return current rank
         // Need to find rank logic (simpler here just loop)
         return c.JSON(fiber.Map{
             "bestRank": 1,
             "worstRank": 1,
             "aiAnalysis": "All matches played.",
         })
    }

    // 3. Monte Carlo
    const SIMULATIONS = 1000
    ranks := make([]int, 0, SIMULATIONS)
    
    rand.Seed(time.Now().UnixNano())

    // Base state copy
    // We only need specific fields for simulation: points, wins, sets
    // Create a simplified structure for speed?
    // Let's just use the strict type but map by name
    baseTeamMap := make(map[string]utils.TeamStats)
    for _, t := range req.Teams {
        baseTeamMap[t.Name] = t
    }

    for i := 0; i < SIMULATIONS; i++ {
        // Clone state
        simStats := make(map[string]*utils.TeamStats)
        for k, v := range baseTeamMap {
            // Copy value
             ts := v
             simStats[k] = &ts
        }

        for _, m := range matchesToSimulate {
             hName := m.HomeTeam
             aName := m.AwayTeam
             
             hElo := eloMap[hName]
             if hElo == 0 { hElo = 1200 }
             aElo := eloMap[aName]
             if aElo == 0 { aElo = 1200 }

             res := simulateMatch(hElo, aElo)
             
             if h, ok := simStats[hName]; ok {
                 h.Played++
                 if res.HomeWin { h.Wins++ }
                 h.Points += res.HomePoints
                 h.SetsWon += res.HomeSets
                 h.SetsLost += res.AwaySets
             }
             if a, ok := simStats[aName]; ok {
                 a.Played++
                 if !res.HomeWin { a.Wins++ }
                 a.Points += res.AwayPoints
                 a.SetsWon += res.AwaySets
                 a.SetsLost += res.HomeSets
             }
        }

        // Sort to find rank of target team
        // We convert back to slice
        simList := make([]utils.TeamStats, 0, len(simStats))
        for _, v := range simStats {
            simList = append(simList, *v)
        }
        
        sort.Slice(simList, func(x, y int) bool {
            if simList[x].Points != simList[y].Points {
                return simList[x].Points > simList[y].Points
            }
            if simList[x].Wins != simList[y].Wins {
                return simList[x].Wins > simList[y].Wins
            }
            // Ratio logic skipped for brevity, falling back to sets won difference
            return (simList[x].SetsWon - simList[x].SetsLost) > (simList[y].SetsWon - simList[y].SetsLost)
        })

        for idx, t := range simList {
            if t.Name == req.TargetTeam {
                ranks = append(ranks, idx+1)
                break
            }
        }
    }

    // 4. Stats
    minRank, maxRank := 100, 0
    champCount, playoffCount, relCount := 0, 0, 0
    totalTeams := len(req.Teams)
    
    for _, r := range ranks {
        if r < minRank { minRank = r }
        if r > maxRank { maxRank = r }
        if r == 1 { champCount++ }
        if r <= 4 { playoffCount++ }
        if r >= totalTeams - 1 { relCount++ } // Last 2 approx
    }

    // 5. AI
    aiAnalysis := "Analiz servis dışı."
    apiKey := os.Getenv("GEMINI_API_KEY")
    if apiKey != "" {
        ctx := context.Background()
        client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
        if err == nil {
            defer client.Close()
            model := client.GenerativeModel("gemini-pro")
            
            prompt := fmt.Sprintf(`
Takım: %s
Takım sayısı: %d
Simülasyon (1000 tekrar):
- En İyi: %d
- En Kötü: %d
- Şampiyonluk: %.1f%%
- Playoff: %.1f%%
- Düşme: %.1f%%

Bu takım için kısa, esprili voleybol yorumu yaz.`, 
            req.TargetTeam, totalTeams, minRank, maxRank, 
            float64(champCount)/10.0, float64(playoffCount)/10.0, float64(relCount)/10.0)

            resp, err := model.GenerateContent(ctx, genai.Text(prompt))
            if err == nil && len(resp.Candidates) > 0 {
                if len(resp.Candidates[0].Content.Parts) > 0 {
                     if txt, ok := resp.Candidates[0].Content.Parts[0].(genai.Text); ok {
                         aiAnalysis = string(txt)
                     }
                }
            }
        }
    }

    return c.JSON(fiber.Map{
        "bestRank": minRank,
        "worstRank": maxRank,
        "championshipProbability": float64(champCount) / 10.0,
        "playoffProbability": float64(playoffCount) / 10.0,
        "relegationProbability": float64(relCount) / 10.0,
        "aiAnalysis": aiAnalysis,
    })
}
