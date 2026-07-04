export interface AssumptionOverride {
  assumptionId: string;
  originalStatement: string;
  overriddenStatement: string;
  adjustedProbability: number;
}

export interface ConstraintCheck {
  constraintId: string;
  name: string;
  limitValue: any;
  actualValue: any;
  passed: boolean;
  violationSeverity: 'NONE' | 'WARNING' | 'CRITICAL';
}

export interface KPIImpact {
  metric: string;
  baseline: number;
  simulatedValue: number;
  absoluteChange: number;
  percentageChange: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  baseTwinId: string;
  variables: Record<string, any>;
}

export interface SimulationInput {
  scenarioId?: string;
  proposedAction: string;
  durationMonths: number;
  variablesOverride: Record<string, any>;
  assumptionOverrides: AssumptionOverride[];
}

export interface SimulationResult {
  simulationId: string;
  input: SimulationInput;
  kpiImpacts: KPIImpact[];
  constraintChecks: ConstraintCheck[];
  confidence: number;
  optimisticOutcome: Record<string, number>;
  pessimisticOutcome: Record<string, number>;
  realisticOutcome: Record<string, number>;
  simulatedAt: string;
}
