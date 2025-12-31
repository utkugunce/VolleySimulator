package database

import (
    "os"
    "fmt"
    supa "github.com/supabase-community/supabase-go"
)

var Client *supa.Client

func Init() error {
    url := os.Getenv("SUPABASE_URL")
    key := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

    if url == "" || key == "" {
        return fmt.Errorf("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
    }

    var err error
    Client, err = supa.NewClient(url, key, nil)
    return err
}
