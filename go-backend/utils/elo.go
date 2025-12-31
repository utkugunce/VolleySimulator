package utils

import (
    "math"
    "sort"
    "strconv"
    "strings"
)

type TeamStats struct {
    Name     string `json:"name"`
    Points   int    `json:"points"`
    Wins     int    `json:"wins"`
    Played   int    `json:"played"`
    SetsWon  int    `json:"setsWon"`
    SetsLost int    `json:"setsLost"`
}

type Match struct {
    HomeTeam    string `json:"homeTeam"`
    AwayTeam    string `json:"awayTeam"`
    ResultScore string `json:"resultScore"`
    IsPlayed    bool   `json:"isPlayed"`
    MatchDate   string `json:"matchDate"`
}

func CalculateElo(teams []TeamStats, matches []Match) map[string]float64 {
    ratings := make(map[string]float64)
    
    // Initialize
    for _, t := range teams {
        ratings[t.Name] = 1200.0
    }

    // Sort valid matches by date
    // Making a copy to sort
    validMatches := make([]Match, 0)
    for _, m := range matches {
        if m.IsPlayed && m.ResultScore != "" {
            validMatches = append(validMatches, m)
        }
    }
    
    // Sort
    sort.Slice(validMatches, func(i, j int) bool {
        return validMatches[i].MatchDate < validMatches[j].MatchDate
    })

    for _, m := range validMatches {
        homeRatings := ratings[m.HomeTeam]
        if homeRatings == 0 { homeRatings = 1200 }
        
        awayRatings := ratings[m.AwayTeam]
        if awayRatings == 0 { awayRatings = 1200 }

        parts := strings.Split(m.ResultScore, "-")
        if len(parts) != 2 { continue }
        
        hSets, _ := strconv.Atoi(parts[0])
        aSets, _ := strconv.Atoi(parts[1])

        actualHome := 0.0
        if hSets > aSets { actualHome = 1.0 }
        
        actualAway := 1.0 - actualHome
        
        // K-Factor
        k := 32.0
        
        // Expected
        expectedHome := 1.0 / (1.0 + math.Pow(10, (awayRatings - homeRatings)/400.0))
        expectedAway := 1.0 / (1.0 + math.Pow(10, (homeRatings - awayRatings)/400.0))
        
        // Multiplier
        multiplier := 1.0
        diff := math.Abs(float64(hSets - aSets))
        if diff == 3 {
            multiplier = 1.3
        } else if diff == 2 {
            multiplier = 1.1
        }
        
        newHome := homeRatings + k * multiplier * (actualHome - expectedHome)
        newAway := awayRatings + k * multiplier * (actualAway - expectedAway)
        
        ratings[m.HomeTeam] = newHome
        ratings[m.AwayTeam] = newAway
    }

    return ratings
}
