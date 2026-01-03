"use client";

import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Extended PerformanceEntry types for Web Vitals
interface LCPEntry extends PerformanceEntry {
    renderTime?: number;
    loadTime?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
    hadRecentInput?: boolean;
    value: number;
}

interface InteractionEntry extends PerformanceEntry {
    processingDuration?: number;
}

interface WebVitals {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Track Web Vitals (LCP, FID, CLS)
 * Useful for performance monitoring and optimization
 */
export function useWebVitals() {
    useEffect(() => {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1] as LCPEntry;
                    if (lastEntry) {
                        const vital: WebVitals = {
                            name: 'LCP',
                            value: lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime || 0,
                        };
                        // LCP > 2.5s is poor
                        if (vital.value > 2500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 1200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
            } catch {
                console.warn('LCP observer not supported');
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((entryList) => {
                    let clsValue = 0;
                    for (const entry of entryList.getEntries()) {
                        const shiftEntry = entry as LayoutShiftEntry;
                        if (shiftEntry.hadRecentInput) continue;
                        clsValue += shiftEntry.value;
                    }
                    const vital: WebVitals = {
                        name: 'CLS',
                        value: clsValue,
                    };
                    // CLS > 0.25 is poor
                    if (vital.value > 0.25) {
                        vital.rating = 'poor';
                    } else if (vital.value > 0.1) {
                        vital.rating = 'needs-improvement';
                    } else {
                        vital.rating = 'good';
                    }
                    sendAnalytics(vital);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch {
                console.warn('CLS observer not supported');
            }

            // First Input Delay / Interaction to Next Paint
            try {
                const ttpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    if (entries.length > 0) {
                        const entry = entries[0] as InteractionEntry;
                        const vital: WebVitals = {
                            name: 'INP',
                            value: entry.processingDuration || 0,
                        };
                        // INP > 500ms is poor
                        if (vital.value > 500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                ttpObserver.observe({ entryTypes: ['first-input', 'interaction'], buffered: true });
            } catch {
                console.warn('INP observer not supported');
            }
        }
    }, []);
}

function sendAnalytics(vital: WebVitals) {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', vital.name, {
            value: Math.round(vital.value),
            event_category: 'Web Vitals',
            event_label: vital.name,
            non_interaction: true,
        });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${vital.name}] ${vital.value}ms - ${vital.rating}`);
    }
}

/**
 * Track Navigation Timing
 */
export function useNavigationTiming() {
    useEffect(() => {
        const logNavigationMetrics = () => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                
                if (perfData) {
                    const metrics = {
                        'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                        'TCP Connection': perfData.connectEnd - perfData.connectStart,
                        'Request Time': perfData.responseStart - perfData.requestStart,
                        'Response Time': perfData.responseEnd - perfData.responseStart,
                        'DOM Processing': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        'Page Load Time': perfData.loadEventEnd - perfData.loadEventStart,
                        'Total Time to Interactive': perfData.loadEventEnd - perfData.fetchStart,
                    };

                    if (process.env.NODE_ENV === 'development') {
                        console.group('Navigation Timing Metrics');
                        Object.entries(metrics).forEach(([key, value]) => {
                            console.log(`${key}: ${Math.round(value)}ms`);
                        });
                        console.groupEnd();
                    }
                }
            }
        };

        // Wait for page to fully load
        window.addEventListener('load', logNavigationMetrics);
        return () => window.removeEventListener('load', logNavigationMetrics);
    }, []);
}
