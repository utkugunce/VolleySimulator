"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  MatchSimulation,
  SimulatedSet,
  SimulatedPoint,
  SimulationMoment
} from "../types";

interface UseMatchSimulationOptions {
  speed?: number; // Animation speed multiplier
  autoPlay?: boolean;
}

interface UseMatchSimulationReturn {
  simulation: MatchSimulation | null;
  isSimulating: boolean;
  isPlaying: boolean;
  currentSet: number;
  currentPoint: number;
  progress: number; // 0-100
  // Actions
  startSimulation: (homeTeam: string, awayTeam: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  skipToEnd: () => void;
  setSpeed: (speed: number) => void;
}

// Simulate a single set
const simulateSet = (
  setNumber: number,
  endScore: number,
  homeTeam: string,
  awayTeam: string
): SimulatedSet => {
  const points: SimulatedPoint[] = [];
  let homeScore = 0;
  let awayScore = 0;
  let pointNumber = 0;

  // Randomly determine which team is slightly favored
  const homeBias = 0.48 + Math.random() * 0.08; // 48-56% for home

  while (true) {
    pointNumber++;

    // Determine point type
    const types: Array<'attack' | 'block' | 'ace' | 'error'> = ['attack', 'attack', 'attack', 'block', 'ace', 'error'];
    const type = types[Math.floor(Math.random() * types.length)];

    // Determine scorer
    const scorer = Math.random() < homeBias ? 'home' : 'away';

    if (scorer === 'home') {
      homeScore++;
    } else {
      awayScore++;
    }

    points.push({
      pointNumber,
      homeScore,
      awayScore,
      scorer,
      type,
    });

    // Check if set is over
    const maxScore = Math.max(homeScore, awayScore);
    const minScore = Math.min(homeScore, awayScore);

    if (maxScore >= endScore && maxScore - minScore >= 2) {
      break;
    }

    // Safety limit
    if (pointNumber > 100) break;
  }

  return {
    setNumber,
    homePoints: homeScore,
    awayPoints: awayScore,
    winner: homeScore > awayScore ? 'home' : 'away',
    pointByPoint: points,
  };
};

export function useMatchSimulation(
  options: UseMatchSimulationOptions = {}
): UseMatchSimulationReturn {
  const { speed: initialSpeed = 1, autoPlay = true } = options;

  const [simulation, setSimulation] = useState<MatchSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [speed, setSpeedState] = useState(initialSpeed);

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);
  const [progressState, setProgressState] = useState(0);

  // Generate a simulated match
  const generateSimulation = useCallback((
    homeTeam: string,
    awayTeam: string
  ): MatchSimulation => {
    const sets: SimulatedSet[] = [];
    let homeSetsWon = 0;
    let awaySetsWon = 0;
    let setNumber = 0;
    const moments: SimulationMoment[] = [];
    let totalDuration = 0;

    // Simulate sets until one team wins 3
    while (homeSetsWon < 3 && awaySetsWon < 3) {
      setNumber++;
      const isDecidingSet = homeSetsWon === 2 && awaySetsWon === 2;
      const setEndScore = isDecidingSet ? 15 : 25;

      const set = simulateSet(setNumber, setEndScore, homeTeam, awayTeam);
      sets.push(set);

      if (set.winner === 'home') {
        homeSetsWon++;
      } else {
        awaySetsWon++;
      }

      // Add set end moment
      moments.push({
        time: totalDuration + set.pointByPoint.length * 2,
        type: 'set_point',
        description: `${set.winner === 'home' ? homeTeam : awayTeam} ${setNumber}. seti kazandı (${set.homePoints}-${set.awayPoints})`,
      });

      totalDuration += set.pointByPoint.length * 2;
    }

    const winner = homeSetsWon === 3 ? homeTeam : awayTeam;

    // Add match end moment
    moments.push({
      time: totalDuration,
      type: 'match_point',
      description: `${winner} maçı kazandı! (${homeSetsWon}-${awaySetsWon})`,
    });

    return {
      matchId: `sim-${Date.now()}`,
      homeTeam,
      awayTeam,
      simulatedSets: sets,
      finalScore: `${homeSetsWon}-${awaySetsWon}`,
      winner,
      keyMoments: moments,
      duration: totalDuration,
    };
  }, []);

  // Calculate progress - use state to avoid accessing ref during render
  const progress = simulation
    ? (progressState / simulation.duration) * 100
    : 0;

  // Start simulation
  const startSimulation = useCallback(async (
    homeTeam: string,
    awayTeam: string
  ) => {
    setIsSimulating(true);
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
    setProgressState(0);

    // Generate simulation
    const sim = generateSimulation(homeTeam, awayTeam);
    setSimulation(sim);
    setIsSimulating(false);

    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [generateSimulation, autoPlay]);

  // Play animation
  const play = useCallback(() => {
    if (!simulation) return;
    setIsPlaying(true);
  }, [simulation]);

  // Pause animation
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    pause();
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
    setProgressState(0);
  }, [pause]);

  // Skip to end
  const skipToEnd = useCallback(() => {
    if (!simulation) return;

    pause();
    setCurrentSet(simulation.simulatedSets.length - 1);
    const lastSet = simulation.simulatedSets[simulation.simulatedSets.length - 1];
    setCurrentPoint(lastSet.pointByPoint.length - 1);
    progressRef.current = simulation.duration;
    setProgressState(simulation.duration);
  }, [simulation, pause]);

  // Set speed
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(0.25, Math.min(4, newSpeed)));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !simulation) return;

    const animate = () => {
      progressRef.current += 2 * speed;
      setProgressState(progressRef.current);

      // Find current set and point based on progress
      let elapsed = 0;
      let foundSet = 0;
      let foundPoint = 0;

      for (let s = 0; s < simulation.simulatedSets.length; s++) {
        const set = simulation.simulatedSets[s];
        for (let p = 0; p < set.pointByPoint.length; p++) {
          elapsed += 2;
          if (elapsed >= progressRef.current) {
            foundSet = s;
            foundPoint = p;
            break;
          }
        }
        if (elapsed >= progressRef.current) break;
      }

      setCurrentSet(foundSet);
      setCurrentPoint(foundPoint);

      // Check if animation is complete
      if (progressRef.current >= simulation.duration) {
        setIsPlaying(false);
        return;
      }

      animationRef.current = setTimeout(animate, 50 / speed);
    };

    animationRef.current = setTimeout(animate, 50 / speed);

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, simulation, speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    simulation,
    isSimulating,
    isPlaying,
    currentSet,
    currentPoint,
    progress,
    startSimulation,
    play,
    pause,
    reset,
    skipToEnd,
    setSpeed,
  };
}

// Utility to get current state of simulation
export function getSimulationState(
  simulation: MatchSimulation,
  setIndex: number,
  pointIndex: number
) {
  const currentSetData = simulation.simulatedSets[setIndex];
  const currentPointData = currentSetData?.pointByPoint[pointIndex];

  let homeSetsWon = 0;
  let awaySetsWon = 0;

  for (let i = 0; i < setIndex; i++) {
    if (simulation.simulatedSets[i].winner === 'home') {
      homeSetsWon++;
    } else {
      awaySetsWon++;
    }
  }

  return {
    setScore: { home: homeSetsWon, away: awaySetsWon },
    currentSetScore: currentPointData
      ? { home: currentPointData.homeScore, away: currentPointData.awayScore }
      : { home: 0, away: 0 },
    lastPoint: currentPointData,
    isComplete: setIndex >= simulation.simulatedSets.length - 1 &&
      pointIndex >= currentSetData.pointByPoint.length - 1,
  };
}
