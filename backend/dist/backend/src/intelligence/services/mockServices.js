"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockTimelineEngine = exports.MockExplainabilityEngine = exports.MockDecisionSimulatorEngine = exports.MockHistoricalMemoryEngine = exports.MockReflectionEngine = exports.MockRecommendationEngine = exports.MockDocumentAnalysisEngine = exports.MockWebsiteAnalysisEngine = exports.MockQuestionEngine = exports.MockCoverageEngine = exports.MockBusinessClassificationEngine = exports.MockDiscoveryEngine = void 0;
class MockDiscoveryEngine {
    async initializeFlow(organizationId) {
        return {
            organizationId,
            industry: 'TBD',
            completedCategories: [],
            currentCategory: 'IDENTITY',
            answers: {},
            questionsAnsweredCount: 0,
            totalQuestionsEstimated: 15,
            coveragePercentage: 0,
            understandingScore: 0,
        };
    }
    async detectIndustry(description) {
        if (description.toLowerCase().includes('software') || description.toLowerCase().includes('saas')) {
            return 'Software as a Service (SaaS)';
        }
        if (description.toLowerCase().includes('shop') || description.toLowerCase().includes('retail')) {
            return 'E-Commerce Retail';
        }
        return 'General Professional Services';
    }
    async getNextQuestions(state) {
        const questions = [
            {
                id: 'q1',
                category: 'IDENTITY',
                text: 'What is your primary product or service offering?',
                inputType: 'text',
                required: true,
            },
            {
                id: 'q2',
                category: 'IDENTITY',
                text: 'Who is your primary target customer segment?',
                inputType: 'select',
                options: ['B2B Enterprise', 'B2B SMB', 'B2C Consumers', 'Marketplace Users'],
                required: true,
            },
            {
                id: 'q3',
                category: 'IDENTITY',
                text: 'What is your current monthly recurring revenue (MRR) tier?',
                inputType: 'select',
                options: ['$0 - $10k', '$10k - $50k', '$50k - $250k', '$250k+'],
                required: false,
            }
        ];
        return questions;
    }
    async submitAnswers(organizationId, answers) {
        return {
            organizationId,
            industry: 'Software as a Service (SaaS)',
            completedCategories: ['IDENTITY'],
            currentCategory: 'MODEL',
            answers,
            questionsAnsweredCount: 3,
            totalQuestionsEstimated: 15,
            coveragePercentage: 20,
            understandingScore: 15,
        };
    }
    async enrichFromWebsite(organizationId, url) {
        return {
            identity: {
                id: 'twin-identity-1',
                legalName: 'TitanForge Software LLC',
                tradeName: 'TitanForge',
                foundedYear: 2024,
                headquarters: 'San Francisco, CA',
                description: 'AI-driven cloud productivity suite for developers.',
                industry: 'SaaS Productivity',
                websiteUrl: url,
                organizationId,
            }
        };
    }
    async enrichFromDocument(organizationId, documentId) {
        return {
            finance: {
                cashOnHand: 550000,
                burnRate: 45000,
                runwayMonths: 12.2,
                ebitda: -12000,
            }
        };
    }
}
exports.MockDiscoveryEngine = MockDiscoveryEngine;
class MockBusinessClassificationEngine {
    async classifyBusiness(twin) {
        return {
            primarySector: 'Technology',
            secondarySector: 'Enterprise Software',
            businessModel: ['SaaS', 'B2B'],
        };
    }
}
exports.MockBusinessClassificationEngine = MockBusinessClassificationEngine;
class MockCoverageEngine {
    async calculateCoverage(twin) {
        return {
            overallCoverage: 65,
            missingFields: [
                'operations.bottlenecks',
                'marketing.roi',
                'competitors'
            ],
            categoryBreakdown: {
                identity: 100,
                businessModel: 85,
                financials: 70,
                customers: 60,
                operations: 40,
                technology: 50,
            }
        };
    }
}
exports.MockCoverageEngine = MockCoverageEngine;
class MockQuestionEngine {
    async generateDynamicQuestions(twin, count = 3) {
        return [
            {
                id: 'dyn-q1',
                category: 'OPERATIONS',
                text: 'What are the main operational bottlenecks in your customer onboarding process?',
                inputType: 'text',
                required: false,
            },
            {
                id: 'dyn-q2',
                category: 'MARKETING',
                text: 'What is your current Customer Acquisition Cost (CAC) and customer lifetime value (LTV)?',
                inputType: 'text',
                required: false,
            }
        ].slice(0, count);
    }
}
exports.MockQuestionEngine = MockQuestionEngine;
class MockWebsiteAnalysisEngine {
    async analyzeUrl(url) {
        return {
            title: 'TitanForge Software',
            description: 'The premier software engine for high-performing engineering teams.',
            productsServices: ['TitanForge DevSuite', 'TitanForge Enterprise Cloud'],
            pricingModel: 'Per-seat subscription billing',
            brandingVoice: 'Professional, developer-friendly, authoritative',
            technologiesDetected: ['React', 'Next.js', 'Vercel', 'AWS', 'Stripe'],
        };
    }
}
exports.MockWebsiteAnalysisEngine = MockWebsiteAnalysisEngine;
class MockDocumentAnalysisEngine {
    async parseDocument(filePath, fileType) {
        return {
            extractedText: 'titanforge investor presentation deck content...',
            metadata: {
                author: 'Founder Name',
                pagesCount: 12,
                fileSize: '3.4 MB',
            },
            keyFindings: [
                'Revenue target for Q4 is $150k ARR.',
                'Core infrastructure is hosted on AWS with PostgreSQL.',
                'Primary customer acquisition channel is outbound sales and content marketing.'
            ],
        };
    }
}
exports.MockDocumentAnalysisEngine = MockDocumentAnalysisEngine;
class MockRecommendationEngine {
    async generateRecommendations(twin) {
        return [
            {
                id: 'rec-1',
                title: 'Optimize Infrastructure Cloud Spend',
                description: 'Consolidate AWS server instances and reserve databases to reduce burn rate by 15%.',
                supportingAgents: ['infra-cost-optimiser', 'finance-advisor'],
                opposingAgents: ['performance-monitor'],
                evidence: [
                    {
                        id: 'ev-1',
                        source: 'Operational Metrics',
                        type: 'HISTORICAL_DATA',
                        content: 'Average server utilization is under 22% during off-peak hours.',
                        confidenceScore: 0.95,
                        extractedAt: new Date().toISOString()
                    }
                ],
                assumptions: [
                    {
                        id: 'as-1',
                        statement: 'Server traffic will remain stable over the next 6 months.',
                        rationale: 'Historical traffic displays steady seasonal patterns.',
                        riskFactor: 0.2,
                        impactOnOutput: 0.8
                    }
                ],
                constraints: [
                    {
                        id: 'con-1',
                        name: 'Minimum Performance SLAs',
                        type: 'TECHNICAL',
                        description: 'Response time must remain below 300ms.',
                        value: 300
                    }
                ],
                risks: [
                    {
                        id: 'risk-1',
                        description: 'Peak spikes might cause minor slow-downs if server capacity is overly reduced.',
                        probability: 0.15,
                        impact: 0.4,
                        mitigationStrategy: 'Enable auto-scaling policies to spin up temporary instances on demand.'
                    }
                ],
                alternatives: [
                    {
                        id: 'alt-1',
                        title: 'Migrate to Google Cloud Platform',
                        description: 'Leverage GCP starter credits for first 6 months.',
                        expectedKPIImpact: {}
                    }
                ],
                rejectedAlternatives: [
                    {
                        id: 'rej-1',
                        title: 'Shutdown backup database replication',
                        description: 'Saves $2k/mo but violates data recovery and resilience constraints.',
                        rejectionReason: 'Exposes company to high risk of data loss.'
                    }
                ],
                expectedKPIImpact: {
                    burnRate: -7500,
                    runwayMonths: 1.8,
                    cashOnHand: 0,
                },
                confidence: {
                    overallScore: 0.9,
                    factors: {
                        dataQuality: 0.95,
                        modelCertainty: 0.88,
                        historicalAlignment: 0.9,
                        constraintMatch: 0.95,
                    },
                    explanation: 'High confidence based on detailed AWS usage logs and low seasonal variance.'
                },
                priority: 'HIGH',
                status: 'PENDING',
                timeline: [
                    {
                        id: 'tl-1',
                        title: 'Review cloud bills and trigger instance consolidation',
                        description: 'Select over-provisioned VMs',
                        daysAfterStart: 1
                    },
                    {
                        id: 'tl-2',
                        title: 'Purchase AWS Savings Plan',
                        description: 'Commit to 1-year usage base',
                        daysAfterStart: 7
                    }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }
    async getRecommendationById(id) {
        const list = await this.generateRecommendations({});
        return list.find(r => r.id === id) || null;
    }
}
exports.MockRecommendationEngine = MockRecommendationEngine;
class MockReflectionEngine {
    async reflectOnRecommendation(rec) {
        return {
            agentId: 'reflector-chief',
            timestamp: new Date().toISOString(),
            analysis: 'The cloud spend optimization proposal is highly actionable and low risk.',
            critique: 'Ensure auto-scaling triggers are properly tested to prevent latency spikes during high loads.'
        };
    }
    async evaluateDebate(rounds) {
        const engine = new MockRecommendationEngine();
        const recs = await engine.generateRecommendations({});
        return {
            consensusReached: true,
            recommendations: recs
        };
    }
}
exports.MockReflectionEngine = MockReflectionEngine;
class MockHistoricalMemoryEngine {
    async logDecisionOutcome(decisionId, observedKPIs) {
        console.log(`Log decision outcome: ${decisionId}`, observedKPIs);
    }
    async querySimilarDecisions(context) {
        return [
            {
                decisionId: 'past-dec-1',
                title: 'Optimize Database Indexing',
                outcome: 'Reduced query load by 40% and infrastructure bill by $800/mo.',
                relevanceScore: 0.85
            }
        ];
    }
}
exports.MockHistoricalMemoryEngine = MockHistoricalMemoryEngine;
class MockDecisionSimulatorEngine {
    async runSimulation(input) {
        return {
            simulationId: 'sim-res-123',
            input,
            kpiImpacts: [
                {
                    metric: 'Monthly Burn Rate',
                    baseline: 45000,
                    simulatedValue: 37500,
                    absoluteChange: -7500,
                    percentageChange: -16.6
                },
                {
                    metric: 'Runway Months',
                    baseline: 12.2,
                    simulatedValue: 14.6,
                    absoluteChange: 2.4,
                    percentageChange: 19.6
                }
            ],
            constraintChecks: [
                {
                    constraintId: 'con-1',
                    name: 'Latency SLA',
                    limitValue: 300,
                    actualValue: 280,
                    passed: true,
                    violationSeverity: 'NONE'
                }
            ],
            confidence: 0.88,
            optimisticOutcome: { burnRate: -9000, runwayMonths: 3.1 },
            pessimisticOutcome: { burnRate: -5000, runwayMonths: 1.4 },
            realisticOutcome: { burnRate: -7500, runwayMonths: 2.4 },
            simulatedAt: new Date().toISOString()
        };
    }
}
exports.MockDecisionSimulatorEngine = MockDecisionSimulatorEngine;
class MockExplainabilityEngine {
    async generateExplanationTrace(recId) {
        return {
            recommendationId: recId,
            logicalChain: [
                'Detected low AWS compute instance CPU utilization (<15%).',
                'Evaluated latency limits and verified CPU spikes remain below threshold.',
                'Calculated potential savings of $7,500/month through resizing.',
                'Ensured auto-scaling mitigates any performance risks.'
            ],
            evidenceLinked: [
                {
                    id: 'ev-1',
                    source: 'AWS CloudWatch Metrics',
                    type: 'HISTORICAL_DATA',
                    content: 'Max CPU utilization last 30 days was 22%. Average was 8.4%.',
                    confidenceScore: 0.99,
                    extractedAt: new Date().toISOString()
                }
            ],
            assumptionsUsed: [
                {
                    id: 'as-1',
                    statement: 'Daily active users will grow <10% month-over-month.',
                    rationale: 'Historical baseline expansion trend.',
                    riskFactor: 0.1,
                    impactOnOutput: 0.7
                }
            ],
            constraintsViolated: [],
            confidenceBreakdown: {
                overallScore: 0.94,
                dataQualityScore: 0.99,
                historicalPrecedentScore: 0.9,
                simulationConfidenceScore: 0.92,
                logicalConsistencyScore: 0.95
            },
            generatedAt: new Date().toISOString()
        };
    }
}
exports.MockExplainabilityEngine = MockExplainabilityEngine;
class MockTimelineEngine {
    async generateTimeline(organizationId) {
        return {
            events: [
                {
                    id: 't-ev-1',
                    title: 'Organization Registered',
                    description: 'TitanForge workspace bootstrapped.',
                    timestamp: new Date().toISOString(),
                    type: 'MILESTONE'
                }
            ]
        };
    }
}
exports.MockTimelineEngine = MockTimelineEngine;
