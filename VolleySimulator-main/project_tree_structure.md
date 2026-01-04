# Project File Structure

> Auto-generated: 2026-01-04

```
VolleySimulator-main/
    .env.example
    .gitignore
    .hintrc
    1LIG.xlsx
    components.json
    Dockerfile
    eslint.config.mjs
    i18n.ts
    IMPROVEMENTS.md
    jest.config.js
    jest.setup.js
    middleware.ts
    next-env.d.ts
    next.config.ts
    package-lock.json
    package.json
    playwright.config.ts
    postcss.config.mjs
    project_core_context.md
    project_tree_structure.md
    README.md
    strength_rankings.md
    tailwind.config.ts
    tsconfig.json
    vercel.json
    VSL.xlsx
    
    .github/
        workflows/
            update-results.yml
    
    .vscode/
        settings.json
    
    app/
        error.tsx
        favicon.ico
        global-error.tsx
        globals.css
        layout.tsx
        not-found.tsx
        opengraph-image.tsx
        page.tsx
        robots.ts
        sitemap.ts
        types.ts
        
        1lig/
            gunceldurum/
                OneLigDetailedGroupsClient.tsx
                page.tsx
            playoffs/
                OneLigPlayoffsClient.tsx
                page.tsx
                [stage]/
                    [groupId]/
                        page.tsx
            stats/
                OneLigStatsClient.tsx
                page.tsx
            tahminoyunu/
                loading.tsx
                OneLigCalculatorClient.tsx
                page.tsx
        
        2lig/
            group/
                [groupId]/
                    page.tsx
            gunceldurum/
                page.tsx
                TwoLigDetailedGroupsClient.tsx
            playoffs/
                page.tsx
                TwoLigPlayoffsClient.tsx
                [stage]/
                    [groupId]/
                        page.tsx
            stats/
                page.tsx
                TwoLigStatsClient.tsx
            tahminoyunu/
                page.tsx
                TwoLigCalculatorClient.tsx
        
        anasayfa/
            AnasayfaClient.tsx
            page.tsx
        
        api/
            1lig/
                route.ts
            ai/
                analysis/
                    route.ts
                prediction/
                    route.ts
            calculate/
                route.ts
            cev-challenge/
                route.ts
            cev-cl/
                route.ts
            cev-cup/
                route.ts
            cron/
                update-results/
                    route.ts
            custom-leagues/
                route.ts
                join/
                    route.ts
            errors/
                route.ts
            friends/
                route.ts
                requests/
                    route.ts
                search/
                    route.ts
            leaderboard/
                route.ts
            live/
                route.ts
                [matchId]/
                    comments/
                        route.ts
                        [commentId]/
                            like/
                                route.ts
            notifications/
                route.ts
                preferences/
                    route.ts
                subscribe/
                    route.ts
            predict-all/
                route.ts
            predictions/
                route.ts
            push/
                subscribe/
                    route.ts
                unsubscribe/
                    route.ts
            quests/
                route.ts
            refresh/
                route.ts
            results/
                sync/
                    route.ts
            scrape/
                route.ts
            user/
                profile/
                    route.ts
            vsl/
                route.ts
        
        auth/
            auth-code-error/
                page.tsx
            callback/
                route.ts
        
        ayarlar/
            page.tsx
        
        cev-challenge/
            page.tsx
            anasayfa/
                page.tsx
            gunceldurum/
                CEVChallengeGuncelDurumClient.tsx
                page.tsx
            playoffs/
                CEVChallengePlayoffsClient.tsx
                page.tsx
            stats/
                CEVChallengeStatsClient.tsx
                page.tsx
            tahminoyunu/
                CEVChallengeTahminOyunuClient.tsx
                page.tsx
        
        cev-cl/
            anasayfa/
                page.tsx
            gunceldurum/
                CEVCLGuncelDurumClient.tsx
                page.tsx
            playoffs/
                CEVCLPlayoffsClient.tsx
                page.tsx
            stats/
                CEVCLStatsClient.tsx
                page.tsx
            tahminoyunu/
                CEVCLCalculatorClient.tsx
                page.tsx
        
        cev-cup/
            page.tsx
            anasayfa/
                page.tsx
            gunceldurum/
                CEVCupGuncelDurumClient.tsx
                page.tsx
            playoffs/
                CEVCupPlayoffsClient.tsx
                page.tsx
            stats/
                CEVCupStatsClient.tsx
                page.tsx
            tahminoyunu/
                CEVCupTahminOyunuClient.tsx
                page.tsx
        
        components/
            AccessiBeWidget.tsx
            Achievements.tsx
            AIPredictionCard.tsx
            AuthGuard.tsx
            BadgeDisplay.tsx
            BracketView.tsx
            ClientSideComponents.tsx
            Confetti.tsx
            DynamicTeamTheme.tsx
            ErrorBoundary.tsx
            ErrorFallback.tsx
            index.ts
            LanguageSwitcher.tsx
            LiveMatchCard.tsx
            LoginBackground.tsx
            Logo.tsx
            MiniBarChart.tsx
            MobileBottomNav.tsx
            Navbar.tsx
            NotificationBell.tsx
            NotificationToggle.tsx
            OptimizedImage.tsx
            ProgressRing.tsx
            QuestPanel.tsx
            ScenarioEditor.tsx
            ScrollToTop.tsx
            SearchFilter.tsx
            SEOSchema.tsx
            ShareButton.tsx
            StatsCard.tsx
            StreakWidget.tsx
            SwipeableTabs.tsx
            TeamAvatar.tsx
            TeamCompareModal.tsx
            TeamFormDisplay.tsx
            TeamLoyaltySelector.tsx
            ThemeToggle.tsx
            ThemeWrapper.tsx
            Toast.tsx
            Tooltip.tsx
            TutorialModal.tsx
            XPBar.tsx
            Calculator/
                FixtureList.tsx
                StandingsTable.tsx
                TeamStatsRadar.tsx
            LeagueTemplate/
                CalculatorTemplate.tsx
                index.ts
                LeagueActionBar.tsx
                PlayoffTemplate.tsx
                StatsTemplate.tsx
                types.ts
                useLeagueData.ts
            Simulation/
                MatchSummary.tsx
            Skeleton/
                index.tsx
            ui/
                Badge.tsx
                BottomSheet.tsx
                Button.tsx
                Card.tsx
                EmptyState.tsx
                LevelUpModal.tsx
                OnboardingTour.tsx
                Skeleton.tsx
        
        context/
            AuthContext.tsx
            CustomLeaguesContext.tsx
            FriendsContext.tsx
            LiveMatchContext.tsx
            LocaleContext.tsx
            NotificationsContext.tsx
            QuestsContext.tsx
            ThemeContext.tsx
        
        custom-leagues/
            page.tsx
        
        dashboard/
            page.tsx
        
        friends/
            page.tsx
            duel/
                page.tsx
        
        hooks/
            index.ts
            useAdvancedStats.ts
            useAIPredictions.ts
            useFetch.ts
            useLeagueQuery.ts
            useLocalStorage.ts
            useMatchSimulation.ts
            useModal.ts
            usePerformance.ts
            usePredictions.ts
            usePushNotifications.ts
            useSimulationEngine.ts
            useUndoableAction.ts
            useUserStats.ts
            useWallet.ts
        
        leaderboard/
            LeaderboardClient.tsx
            loading.tsx
            page.tsx
        
        lib/
            calculation/
                calculatorUtils.ts
                eloCalculator.ts
                playoffUtils.ts
                scenarioUtils.ts
            core/
                apiValidation.ts
                performance.ts
                rateLimit.ts
                sounds.ts
                teamSlug.ts
                validation.ts
            data/
                serverData.ts
                teamIds.ts
                team-themes.ts
            game/
                gameState.ts
            supabase/
                supabase.ts
                supabase-server.ts
        
        ligler/
            loading.tsx
            page.tsx
        
        live/
            page.tsx
        
        login/
            layout.tsx
            page.tsx
        
        notifications/
            page.tsx
        
        oauth/
            consent/
                page.tsx
        
        offline/
            page.tsx
        
        premium/
            page.tsx
        
        profile/
            page.tsx
        
        providers/
            QueryProvider.tsx
        
        quests/
            page.tsx
        
        register/
            layout.tsx
            page.tsx
        
        scenario/
            [shareId]/
                page.tsx
        
        scenario-standings/
            page.tsx
        
        shop/
            page.tsx
        
        simulation/
            page.tsx
        
        stats/
            page.tsx
            StatsClient.tsx
            advanced/
                page.tsx
        
        styles/
            tokens.ts
        
        takimlar/
            [teamSlug]/
                page.tsx
                TeamProfileClient.tsx
        
        tournament-predictions/
            page.tsx
        
        types/
            ai.ts
            gamification.ts
            index.ts
            league.ts
            premium.ts
            simulation.ts
            social.ts
            stats.ts
            tournament.ts
            ui.ts
            user.ts
        
        utils/
            apiValidation.ts
            calculatorUtils.ts
            eloCalculator.ts
            gameState.ts
            index.ts
            performance.ts
            playoffUtils.ts
            rateLimit.ts
            scenarioUtils.ts
            serverData.ts
            sounds.ts
            supabase.ts
            supabase-server.ts
            teamIds.ts
            teamSlug.ts
            team-themes.ts
            validation.ts
        
        vsl/
            gunceldurum/
                page.tsx
                VSLDetailedClient.tsx
            playoffs/
                page.tsx
                VSLPlayoffsClient.tsx
            stats/
                page.tsx
                VSLStatsClient.tsx
            tahminoyunu/
                loading.tsx
                page.tsx
                VSLCalculatorClient.tsx
        
        workers/
            simulation.worker.ts
    
    components/
        ui/
            accordion.tsx
            alert.tsx
            avatar.tsx
            badge.tsx
            button.tsx
            card.tsx
            checkbox.tsx
            collapsible.tsx
            command.tsx
            dialog.tsx
            dropdown-menu.tsx
            input.tsx
            label.tsx
            navigation-menu.tsx
            popover.tsx
            progress.tsx
            radio-group.tsx
            scroll-area.tsx
            select.tsx
            separator.tsx
            sheet.tsx
            skeleton.tsx
            slider.tsx
            sonner.tsx
            switch.tsx
            table.tsx
            tabs.tsx
            tooltip.tsx
    
    data/
        1lig-data.json
        2lig-data.json
        cev-challenge-cup-data.json
        cev-cl-data.json
        cev-cup-data.json
        team-registry.json
        tvf-data.json
        vsl-data.json
    
    docs/
        project_summary.md
        ui_ux_analysis.md
    
    e2e/
        accessibility.spec.ts
        auth.spec.ts
        calculator.spec.ts
        navigation.spec.ts
        predictions.spec.ts
        simulation.spec.ts
    
    i18n/
        request.ts
    
    lib/
        api-middleware.ts
        error-tracking.ts
        utils.ts
    
    messages/
        en.json
        tr.json
    
    public/
        favicon.svg
        file.svg
        globe.svg
        grid.svg
        logo.png
        manifest.json
        next.svg
        sw.js
        vercel.svg
        volley_simulator_logo.png
        window.svg
        logos/
            [30+ team logo files]
    
    scripts/
        add-club-ids.js
        calculate-strength.js
        convert-1lig-excel.js
        convert-vsl-excel.js
        download-vsl-logos.js
        generate-team-ids.js
        import-fixture.js
        list-teams.js
        pack_core_context.py
        pack_for_llm.py
        read-1lig-excel.js
        read-vsl-excel.js
        reset_vsl_scores.js
        reset_vsl_second_half.js
        scrape-cev-challenge.js
        scrape-tvf-live.js
        scrape-vsl.js
        simulate_vsl.js
        update_vsl_stats.js
        update-data.js
        verify-api.js
    
    supabase/
        schema.sql
        migrations/
            001_create_predictions_tables.sql
            20260103_performance_indexes.sql
            20260103_push_subscriptions.sql
    
    __tests__/
        apiValidation.test.ts
        calculatorUtils.test.ts
        performance.test.ts
        playoffUtils.test.ts
        StandingsTable.test.tsx
        useLocalStorage.test.ts
        useUndoableAction.test.ts
        components/
            TeamAvatar.test.tsx
        hooks/
            useMatchSimulation.test.ts
```

## Summary

| Category | Count |
|----------|-------|
| Total Files | ~280+ |
| App Pages | 45+ |
| API Routes | 30+ |
| Components | 60+ |
| Hooks | 15+ |
| Leagues Supported | 7 |
| Languages | 2 (TR, EN) |
