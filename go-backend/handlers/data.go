package handlers

import (
    "encoding/json"
    "os"
    "path/filepath"
    "github.com/gofiber/fiber/v2"
)

// Helper to read JSON data
func readJSON(filename string) (map[string]interface{}, error) {
    // Assuming 'data' folder is in the working directory
    path := filepath.Join("data", filename)
    
    // Check if file exists
    if _, err := os.Stat(path); os.IsNotExist(err) {
        return nil, err
    }

    content, err := os.ReadFile(path)
    if err != nil {
        return nil, err
    }

    var data map[string]interface{}
    if err := json.Unmarshal(content, &data); err != nil {
        return nil, err
    }

    return data, nil
}

func Get1Lig(c *fiber.Ctx) error {
    data, err := readJSON("1lig-data.json")
    if err != nil {
        return c.Status(404).JSON(fiber.Map{"error": "Data not found"})
    }
    
    // Filter withdrawn teams logic can go here if needed
    // ...
    
    return c.JSON(data)
}

func Get2Lig(c *fiber.Ctx) error {
    data, err := readJSON("2lig-data.json")
    if err != nil {
        return c.Status(404).JSON(fiber.Map{
            "error": "Cached data not found. Please run scraper script.",
        })
    }
    return c.JSON(data)
}

func GetVSL(c *fiber.Ctx) error {
    data, err := readJSON("vsl-data.json")
    if err != nil {
         return c.Status(404).JSON(fiber.Map{"error": "Data not found"})
    }
    return c.JSON(data)
}

func GetCEVCL(c *fiber.Ctx) error {
    // Assuming similar structure
    data, err := readJSON("cev-cl-data.json")
     if err != nil {
         return c.Status(404).JSON(fiber.Map{"error": "Data not found"})
    }
    return c.JSON(data)
}
