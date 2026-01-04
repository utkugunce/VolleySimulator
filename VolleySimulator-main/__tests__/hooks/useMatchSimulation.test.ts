/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useMatchSimulation } from '../../app/hooks/useMatchSimulation';

// Use fake timers for animation tests
jest.useFakeTimers();

describe('useMatchSimulation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it('initially has null simulation', () => {
        const { result } = renderHook(() => useMatchSimulation());
        expect(result.current.simulation).toBeNull();
        expect(result.current.isSimulating).toBe(false);
        expect(result.current.isPlaying).toBe(false);
    });

    it('starts simulation and generates match data', async () => {
        const { result } = renderHook(() => useMatchSimulation());

        await act(async () => {
            await result.current.startSimulation('Team A', 'Team B');
        });

        expect(result.current.simulation).not.toBeNull();
        expect(result.current.simulation?.homeTeam).toBe('Team A');
        expect(result.current.simulation?.awayTeam).toBe('Team B');
        expect(result.current.isPlaying).toBe(true);
    });

    it('toggles play/pause correctly', async () => {
        const { result } = renderHook(() => useMatchSimulation({ autoPlay: false }));

        await act(async () => {
            await result.current.startSimulation('A', 'B');
        });

        expect(result.current.isPlaying).toBe(false);

        act(() => {
            result.current.play();
        });
        expect(result.current.isPlaying).toBe(true);

        act(() => {
            result.current.pause();
        });
        expect(result.current.isPlaying).toBe(false);
    });

    it('resets correctly', async () => {
        const { result } = renderHook(() => useMatchSimulation());

        await act(async () => {
            await result.current.startSimulation('A', 'B');
        });

        act(() => {
            result.current.skipToEnd();
        });
        expect(result.current.progress).toBe(100);

        act(() => {
            result.current.reset();
        });
        expect(result.current.progress).toBe(0);
        expect(result.current.isPlaying).toBe(false);
    });

    it('advances progress in animation loop', async () => {
        const { result } = renderHook(() => useMatchSimulation({ speed: 4 }));

        await act(async () => {
            await result.current.startSimulation('A', 'B');
        });

        const initialProgress = result.current.progress;

        // Advance timers
        act(() => {
            jest.advanceTimersByTime(200);
        });

        expect(result.current.progress).toBeGreaterThan(initialProgress);
    });

    it('stops when reaching the end', async () => {
        const { result } = renderHook(() => useMatchSimulation());

        await act(async () => {
            await result.current.startSimulation('A', 'B');
        });

        act(() => {
            result.current.skipToEnd();
        });

        // One more tick to trigger the completion check in useEffect
        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(result.current.isPlaying).toBe(false);
    });
});
