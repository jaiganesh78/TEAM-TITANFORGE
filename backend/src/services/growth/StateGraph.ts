import { prisma } from '../../database/prisma';

export interface GraphState {
  businessId: string;
  sessionId: string;
  contextVersion: number;
  
  // Fact data (calculated pre-LLM)
  kpis: Record<string, any>;
  gaps: Record<string, any>;
  readinessReport: any;
  contextPackage: any;

  // Generated inputs/outputs (Zod-validated)
  marketResearch?: any;
  swot?: any;
  competitorAnalysis?: any;
  positioning?: any;
  pricing?: any;
  opportunities?: any;
  recommendations?: any[];
  strategicAssets?: any;

  // Marketing outputs
  audienceAnalysis?: any;
  customerJourney?: any;
  funnelAnalysis?: any;
  channelEvaluation?: any;
  creativeStrategy?: any;
  campaigns?: any[];
  budgetOptimizer?: any;
  experimentPortfolio?: any;
  contentPlan?: any;
  calendar?: any;
  executiveScores?: any;
  marketingRecommendations?: any[];

  // Lead outputs
  icpAnalysis?: any;
  leadSources?: any;
  acquisitionPlan?: any;
  qualificationRules?: any;
  scoringModel?: any;
  segmentation?: any;
  nurtureJourneys?: any;
  forecasts?: any;
  leadPlaybooks?: any[];
  leadRecommendations?: any[];
  leads?: any[];

  // Sales outputs
  opportunityAnalysis?: any;
  dealQualification?: any;
  buyingCommittee?: any;
  negotiationStrategy?: any;
  objectionHandling?: any;
  proposalStrategy?: any;
  dealRisk?: any;
  revenueOptimization?: any;
  salesForecast?: any;
  nextBestAction?: any;
  salesPlaybooks?: any[];
  salesRecommendations?: any[];

  // Revenue Intelligence Snapshot / Version tracking
  revenueSnapshotId?: string;
  revenueAssetVersion?: number;
  pipelineVersion?: number;
  forecastVersion?: number;
  dealTwinVersion?: number;

  // Analytics outputs
  businessHealthScore?: any;
  growthScore?: any;
  revenueHealth?: any;
  trendAnalysis?: any;
  forecastAnalysis?: any;
  businessBenchmark?: any;
  competitiveAnalysis?: any;
  marketReadiness?: any;
  riskAnalysis?: any;
  portfolioAnalysis?: any;
  executiveInsight?: any;
  analyticsRecommendations?: any[];
  prediction?: any;
  snapshotComparison?: any;

  // Analytics Snapshots & Version trackers
  analyticsSnapshotId?: string;
  analyticsAssetVersion?: number;

  // Customer Success outputs
  customerHealth?: any;
  customerSuccessJourney?: any;
  customerLifecycle?: any;
  customerAdoption?: any;
  supportIntelligence?: any;
  customerSentiment?: any;
  renewalForecast?: any;
  renewalPlan?: any;
  expansionOpportunity?: any;
  retentionStrategy?: any;
  churnRisk?: any;
  customerRecommendations?: any[];
  customerValueRealization?: any;
  customer360Timeline?: any[];
  executiveAccountSummary?: any;
  successPlaybooks?: any;
  customerAdvocacy?: any;
  customerPortfolioIntelligence?: any;

  // Customer Success Snapshots & Version trackers
  customerSuccessSnapshotId?: string;
  customerSuccessAssetVersion?: number;

  // Reflection loop track
  reflectionAttempts: number;
  confidenceScore: number;
  reflectionCritique?: string;

  // Executive Board outputs
  executiveBrief?: any;
  executiveReports?: any[];
  executiveAlerts?: any[];
  executiveDecisions?: any[];
  executiveRecommendations?: any[];
  executiveConsensus?: any[];
  executiveConflicts?: any[];
  executiveOperatingPlan?: any;
  executiveRoadmap?: any[];
  executiveKPITree?: any;
  decisionSimulations?: any;

  // Metadata / Logs
  logs: string[];
}

export type NodeFunction = (state: GraphState) => Promise<Partial<GraphState>>;

export class StateGraph {
  public engine: 'strategy' | 'marketing' | 'lead' | 'sales' | 'analytics' | 'customer-success' | 'executive-board' = 'strategy';
  private nodes: Map<string, NodeFunction> = new Map();
  private order: string[] = [];

  /**
   * Registers a new node function to the graph.
   */
  addNode(name: string, fn: NodeFunction): this {
    this.nodes.set(name, fn);
    this.order.push(name);
    return this;
  }

  /**
   * Executes the entire compiled graph, recording full observability trace details in DB.
   */
  async execute(initialState: GraphState): Promise<GraphState> {
    let state = { ...initialState };
    const traces: any[] = [];
    const startTime = new Date();

    // Create overall execution log
    const execLog = this.engine === 'lead'
      ? await prisma.leadGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : this.engine === 'sales'
      ? await prisma.salesGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : this.engine === 'marketing'
      ? await prisma.marketingGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : this.engine === 'analytics'
      ? await prisma.analyticsGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        })
      : this.engine === 'customer-success'
      ? await prisma.customerSuccessGraphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            graphType: 'master',
            status: 'IN_PROGRESS',
            durationMs: 0
          }
        })
      : this.engine === 'executive-board'
      ? await prisma.executiveBoardExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            graphType: 'master',
            status: 'RUNNING',
            durationMs: 0
          }
        })
      : await prisma.graphExecutionLog.create({
          data: {
            sessionId: state.sessionId,
            status: 'IN_PROGRESS',
            nodeTraces: '[]'
          }
        });

    state.logs.push(`Starting StateGraph [${this.engine}] execution at ${startTime.toISOString()}`);

    try {
      // Loop over nodes in order
      for (const nodeName of this.order) {
        const nodeFn = this.nodes.get(nodeName);
        if (!nodeFn) continue;

        const nodeStart = new Date();
        state.logs.push(`Node [${nodeName}] started`);

        // Serialize input size estimate
        const inputStr = JSON.stringify(state);
        const inputSize = inputStr.length;

        let outputState: Partial<GraphState> = {};
        let attempts = 0;
        const maxAttempts = 3;
        let success = false;
        let lastError = '';

        while (attempts < maxAttempts && !success) {
          attempts++;
          try {
            outputState = await nodeFn(state);
            success = true;
          } catch (err: any) {
            lastError = err.message;
            state.logs.push(`Node [${nodeName}] attempt ${attempts} failed: ${err.message}`);
          }
        }

        if (!success) {
          throw new Error(`Node [${nodeName}] failed after ${maxAttempts} attempts. Error: ${lastError}`);
        }

        // Apply outputs to current state
        state = { ...state, ...outputState };
        const nodeEnd = new Date();
        const durationMs = nodeEnd.getTime() - nodeStart.getTime();
        const outputSize = JSON.stringify(outputState).length;

        state.logs.push(`Node [${nodeName}] completed in ${durationMs}ms`);

        // Record Node Output in DB for observability
        if (this.engine === 'lead') {
          await prisma.leadGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'sales') {
          await prisma.salesGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'marketing') {
          await prisma.marketingGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'analytics') {
          await prisma.analyticsGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'customer-success') {
          await prisma.customerSuccessGraphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        } else if (this.engine === 'executive-board') {
          await prisma.executiveBoardNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              payload: JSON.stringify(outputState)
            }
          });
        } else {
          await prisma.graphNodeOutput.create({
            data: {
              sessionId: state.sessionId,
              nodeName,
              inputSize,
              outputSize,
              durationMs,
              attempts,
              payload: JSON.stringify(outputState),
              reflectionRuns: nodeName === 'ReflectionGraph' ? state.reflectionAttempts : 0
            }
          });
        }

        traces.push({
          nodeName,
          startedAt: nodeStart,
          finishedAt: nodeEnd,
          durationMs,
          success: true,
          attempts
        });
      }

      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      state.logs.push(`StateGraph completed in ${totalDuration}ms`);

      // Update execution log
      if (this.engine === 'lead') {
        await prisma.leadGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'sales') {
        await prisma.salesGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces),
            revenueSnapshotId: state.revenueSnapshotId || null,
            revenueAssetVersion: state.revenueAssetVersion || null,
            pipelineVersion: state.pipelineVersion || null,
            forecastVersion: state.forecastVersion || null,
            dealTwinVersion: state.dealTwinVersion || null
          }
        });
      } else if (this.engine === 'marketing') {
        await prisma.marketingGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'analytics') {
        await prisma.analyticsGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces),
            analyticsSnapshotId: state.analyticsSnapshotId || null,
            analyticsAssetVersion: state.analyticsAssetVersion || null
          }
        });
      } else if (this.engine === 'customer-success') {
        await prisma.customerSuccessGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            durationMs: totalDuration
          }
        });
      } else if (this.engine === 'executive-board') {
        await prisma.executiveBoardExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'COMPLETED',
            durationMs: totalDuration
          }
        });
      } else {
        await prisma.graphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'SUCCESS',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            nodeTraces: JSON.stringify(traces)
          }
        });
      }

    } catch (err: any) {
      const endTime = new Date();
      const totalDuration = endTime.getTime() - startTime.getTime();
      state.logs.push(`StateGraph failed: ${err.message}`);

      if (this.engine === 'lead') {
        await prisma.leadGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'sales') {
        await prisma.salesGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces),
            revenueSnapshotId: state.revenueSnapshotId || null,
            revenueAssetVersion: state.revenueAssetVersion || null,
            pipelineVersion: state.pipelineVersion || null,
            forecastVersion: state.forecastVersion || null,
            dealTwinVersion: state.dealTwinVersion || null
          }
        });
      } else if (this.engine === 'marketing') {
        await prisma.marketingGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      } else if (this.engine === 'analytics') {
        await prisma.analyticsGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces),
            analyticsSnapshotId: state.analyticsSnapshotId || null,
            analyticsAssetVersion: state.analyticsAssetVersion || null
          }
        });
      } else if (this.engine === 'customer-success') {
        await prisma.customerSuccessGraphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            error: err.message,
            durationMs: totalDuration
          }
        });
      } else if (this.engine === 'executive-board') {
        await prisma.executiveBoardExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            error: err.message,
            durationMs: totalDuration
          }
        });
      } else {
        await prisma.graphExecutionLog.update({
          where: { id: execLog.id },
          data: {
            status: 'FAILED',
            finishedAt: endTime,
            totalDurationMs: totalDuration,
            failureReason: err.message,
            nodeTraces: JSON.stringify(traces)
          }
        });
      }
      throw err;
    }

    return state;
  }
}
