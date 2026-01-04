/**
 * useSimulationEngine Hook
 * 
 * Web Worker tabanlı simülasyon motorunu yöneten hook.
 * UI'ı bloklamadan arka planda simülasyon çalıştırır.
 * 
 * @example
 * ```tsx
 * const { runSimulation, isSimulating, result, error } = useSimulationEngine();
 * 
 * const handleSimulate = () => {
 *   runSimulation({
 *     teams: data.teams,
 *     matches: data.matches,
 *     currentStandings: data.standings,
 *   });
 * };
 * ```
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type {
  SimulationInput,
  SimulationResult,
  SimulationConfig,
  WorkerMessage,
  WorkerResponse,
} from '@/types/simulation';

interface UseSimulationEngineOptions {
  /** Worker hazır olduğunda çağrılır */
  onReady?: () => void;
  /** Simülasyon tamamlandığında çağrılır */
  onComplete?: (result: SimulationResult) => void;
  /** Hata oluştuğunda çağrılır */
  onError?: (error: string) => void;
}

interface UseSimulationEngineReturn {
  /** Simülasyonu başlat */
  runSimulation: (input: SimulationInput) => void;
  /** Simülasyon çalışıyor mu? */
  isSimulating: boolean;
  /** Simülasyon sonucu */
  result: SimulationResult | null;
  /** Hata mesajı */
  error: string | null;
  /** Worker hazır mı? */
  isReady: boolean;
  /** Simülasyonu iptal et */
  cancel: () => void;
  /** Sonucu temizle */
  reset: () => void;
}

export function useSimulationEngine(
  options: UseSimulationEngineOptions = {}
): UseSimulationEngineReturn {
  const { onReady, onComplete, onError } = options;
  
  const workerRef = useRef<Worker | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Worker'ı başlat
  useEffect(() => {
    // Client-side only check
    if (typeof window === 'undefined') return;

    try {
      workerRef.current = new Worker(
        new URL('../workers/simulation.worker.ts', import.meta.url)
      );

      workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const response = event.data;
        
        switch (response.type) {
          case 'READY':
            setIsReady(true);
            onReady?.();
            break;
            
          case 'SIMULATION_COMPLETE':
            setResult(response.payload);
            setIsSimulating(false);
            setError(null);
            onComplete?.(response.payload);
            break;
            
          case 'SIMULATION_PROGRESS':
            // Progress updates için state eklenebilir
            break;
            
          case 'ERROR':
            setError(response.error);
            setIsSimulating(false);
            onError?.(response.error);
            break;
        }
      };

      workerRef.current.onerror = (err) => {
        const errorMessage = `Worker error: ${err.message}`;
        setError(errorMessage);
        setIsSimulating(false);
        onError?.(errorMessage);
      };
    } catch (err) {
      console.error('Failed to create simulation worker:', err);
      setError('Failed to initialize simulation engine');
    }

    // Cleanup
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, [onReady, onComplete, onError]);

  // Simülasyonu başlat
  const runSimulation = useCallback((input: SimulationInput) => {
    if (!workerRef.current) {
      setError('Simulation engine not initialized');
      return;
    }

    setIsSimulating(true);
    setError(null);
    
    const message: WorkerMessage = {
      type: 'START_SIMULATION',
      payload: input,
    };
    
    workerRef.current.postMessage(message);
  }, []);

  // Simülasyonu iptal et
  const cancel = useCallback(() => {
    if (workerRef.current) {
      const message: WorkerMessage = { type: 'CANCEL_SIMULATION' };
      workerRef.current.postMessage(message);
      setIsSimulating(false);
    }
  }, []);

  // Sonucu temizle
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setIsSimulating(false);
  }, []);

  return {
    runSimulation,
    isSimulating,
    result,
    error,
    isReady,
    cancel,
    reset,
  };
}

/**
 * Simülasyon konfigürasyonunu yönetmek için hook
 */
export function useSimulationConfig(initialConfig?: Partial<SimulationConfig>) {
  const [config, setConfig] = useState<SimulationConfig>({
    strengthFactor: initialConfig?.strengthFactor ?? 0.7,
    homeAdvantage: initialConfig?.homeAdvantage ?? 0.1,
    formImpact: initialConfig?.formImpact ?? 0.2,
    randomness: initialConfig?.randomness ?? 0.3,
  });

  const updateConfig = useCallback((updates: Partial<SimulationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig({
      strengthFactor: 0.7,
      homeAdvantage: 0.1,
      formImpact: 0.2,
      randomness: 0.3,
    });
  }, []);

  return { config, updateConfig, resetConfig };
}

export default useSimulationEngine;
