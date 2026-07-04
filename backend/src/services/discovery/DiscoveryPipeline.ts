export interface DiscoveryPhase {
  name: string;
  key: string;
  categoryKeys: string[];
  description: string;
}

export const DISCOVERY_PHASES: DiscoveryPhase[] = [
  {
    name: 'Business Identity',
    key: 'IDENTITY',
    categoryKeys: ['identity', 'model'],
    description: 'Establish your company structure, brand name, and operating model.'
  },
  {
    name: 'Products & Services',
    key: 'PRODUCTS',
    categoryKeys: ['products-services'],
    description: 'Define your core catalog offerings, product items, and solutions.'
  },
  {
    name: 'Customers',
    key: 'CUSTOMERS',
    categoryKeys: ['customers'],
    description: 'Outline target segments, primary personas, and market demographics.'
  },
  {
    name: 'Pricing & Packages',
    key: 'PRICING',
    categoryKeys: ['finance'], // mapped to finance category for billing & packages
    description: 'Determine pricing models, price lists, and margin rules.'
  },
  {
    name: 'Operations & Org',
    key: 'OPERATIONS',
    categoryKeys: ['operations', 'technology'],
    description: 'Review tech stacks, headcount count, and infrastructure cost metrics.'
  },
  {
    name: 'Marketing Channels',
    key: 'MARKETING',
    categoryKeys: ['marketing'],
    description: 'Analyze campaigns spend, channel conversion performance, and CAC.'
  },
  {
    name: 'Sales Channels',
    key: 'SALES',
    categoryKeys: ['sales'],
    description: 'Analyze lead conversion, deal size velocity, and pipeline values.'
  },
  {
    name: 'Growth & Risks',
    key: 'GROWTH',
    categoryKeys: ['goals', 'constraints', 'risks', 'kpis'],
    description: 'Assess business targets, growth blockages, and operational threats.'
  },
  {
    name: 'Validation & Review',
    key: 'VALIDATION',
    categoryKeys: [],
    description: 'Confirm and approve the generated Executive Growth Twin Summary.'
  }
];

export class DiscoveryPipeline {
  /**
   * Evaluates the active phase based on completion status.
   */
  static getActivePhase(overallCoverage: Record<string, number>): DiscoveryPhase {
    for (const phase of DISCOVERY_PHASES) {
      if (phase.key === 'VALIDATION') {
        return phase;
      }
      
      // Check if all categories in this phase are complete (100% coverage)
      const allComplete = phase.categoryKeys.every(
        (catKey) => (overallCoverage[catKey] ?? 0) >= 100
      );

      if (!allComplete) {
        return phase;
      }
    }
    
    return DISCOVERY_PHASES[DISCOVERY_PHASES.length - 1]; // Return VALIDATION by default
  }

  /**
   * Calculates the overall completion percent of the active phase.
   */
  static getPhaseProgress(phase: DiscoveryPhase, overallCoverage: Record<string, number>): number {
    if (phase.key === 'VALIDATION') return 100;
    if (phase.categoryKeys.length === 0) return 0;
    
    const sum = phase.categoryKeys.reduce((acc, catKey) => acc + (overallCoverage[catKey] ?? 0), 0);
    return Math.round(sum / phase.categoryKeys.length);
  }
}
