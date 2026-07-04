"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateGraph = void 0;
const prisma_1 = require("../../database/prisma");
class StateGraph {
    engine = 'strategy';
    nodes = new Map();
    order = [];
    /**
     * Registers a new node function to the graph.
     */
    addNode(name, fn) {
        this.nodes.set(name, fn);
        this.order.push(name);
        return this;
    }
    /**
     * Executes the entire compiled graph, recording full observability trace details in DB.
     */
    async execute(initialState) {
        let state = { ...initialState };
        const traces = [];
        const startTime = new Date();
        // Create overall execution log
        const execLog = this.engine === 'lead'
            ? await prisma_1.prisma.leadGraphExecutionLog.create({
                data: {
                    sessionId: state.sessionId,
                    status: 'IN_PROGRESS',
                    nodeTraces: '[]'
                }
            })
            : this.engine === 'sales'
                ? await prisma_1.prisma.salesGraphExecutionLog.create({
                    data: {
                        sessionId: state.sessionId,
                        status: 'IN_PROGRESS',
                        nodeTraces: '[]'
                    }
                })
                : this.engine === 'marketing'
                    ? await prisma_1.prisma.marketingGraphExecutionLog.create({
                        data: {
                            sessionId: state.sessionId,
                            status: 'IN_PROGRESS',
                            nodeTraces: '[]'
                        }
                    })
                    : this.engine === 'analytics'
                        ? await prisma_1.prisma.analyticsGraphExecutionLog.create({
                            data: {
                                sessionId: state.sessionId,
                                status: 'IN_PROGRESS',
                                nodeTraces: '[]'
                            }
                        })
                        : this.engine === 'customer-success'
                            ? await prisma_1.prisma.customerSuccessGraphExecutionLog.create({
                                data: {
                                    sessionId: state.sessionId,
                                    graphType: 'master',
                                    status: 'IN_PROGRESS',
                                    durationMs: 0
                                }
                            })
                            : this.engine === 'executive-board'
                                ? await prisma_1.prisma.executiveBoardExecutionLog.create({
                                    data: {
                                        sessionId: state.sessionId,
                                        graphType: 'master',
                                        status: 'RUNNING',
                                        durationMs: 0
                                    }
                                })
                                : await prisma_1.prisma.graphExecutionLog.create({
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
                if (!nodeFn)
                    continue;
                const nodeStart = new Date();
                state.logs.push(`Node [${nodeName}] started`);
                // Serialize input size estimate
                const inputStr = JSON.stringify(state);
                const inputSize = inputStr.length;
                let outputState = {};
                let attempts = 0;
                const maxAttempts = 3;
                let success = false;
                let lastError = '';
                while (attempts < maxAttempts && !success) {
                    attempts++;
                    try {
                        outputState = await nodeFn(state);
                        success = true;
                    }
                    catch (err) {
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
                    await prisma_1.prisma.leadGraphNodeOutput.create({
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
                else if (this.engine === 'sales') {
                    await prisma_1.prisma.salesGraphNodeOutput.create({
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
                else if (this.engine === 'marketing') {
                    await prisma_1.prisma.marketingGraphNodeOutput.create({
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
                else if (this.engine === 'analytics') {
                    await prisma_1.prisma.analyticsGraphNodeOutput.create({
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
                else if (this.engine === 'customer-success') {
                    await prisma_1.prisma.customerSuccessGraphNodeOutput.create({
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
                else if (this.engine === 'executive-board') {
                    await prisma_1.prisma.executiveBoardNodeOutput.create({
                        data: {
                            sessionId: state.sessionId,
                            nodeName,
                            inputSize,
                            outputSize,
                            durationMs,
                            payload: JSON.stringify(outputState)
                        }
                    });
                }
                else {
                    await prisma_1.prisma.graphNodeOutput.create({
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
                await prisma_1.prisma.leadGraphExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'SUCCESS',
                        finishedAt: endTime,
                        totalDurationMs: totalDuration,
                        nodeTraces: JSON.stringify(traces)
                    }
                });
            }
            else if (this.engine === 'sales') {
                await prisma_1.prisma.salesGraphExecutionLog.update({
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
            }
            else if (this.engine === 'marketing') {
                await prisma_1.prisma.marketingGraphExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'SUCCESS',
                        finishedAt: endTime,
                        totalDurationMs: totalDuration,
                        nodeTraces: JSON.stringify(traces)
                    }
                });
            }
            else if (this.engine === 'analytics') {
                await prisma_1.prisma.analyticsGraphExecutionLog.update({
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
            }
            else if (this.engine === 'customer-success') {
                await prisma_1.prisma.customerSuccessGraphExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'SUCCESS',
                        durationMs: totalDuration
                    }
                });
            }
            else if (this.engine === 'executive-board') {
                await prisma_1.prisma.executiveBoardExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'COMPLETED',
                        durationMs: totalDuration
                    }
                });
            }
            else {
                await prisma_1.prisma.graphExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'SUCCESS',
                        finishedAt: endTime,
                        totalDurationMs: totalDuration,
                        nodeTraces: JSON.stringify(traces)
                    }
                });
            }
        }
        catch (err) {
            const endTime = new Date();
            const totalDuration = endTime.getTime() - startTime.getTime();
            state.logs.push(`StateGraph failed: ${err.message}`);
            if (this.engine === 'lead') {
                await prisma_1.prisma.leadGraphExecutionLog.update({
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
            else if (this.engine === 'sales') {
                await prisma_1.prisma.salesGraphExecutionLog.update({
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
            }
            else if (this.engine === 'marketing') {
                await prisma_1.prisma.marketingGraphExecutionLog.update({
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
            else if (this.engine === 'analytics') {
                await prisma_1.prisma.analyticsGraphExecutionLog.update({
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
            }
            else if (this.engine === 'customer-success') {
                await prisma_1.prisma.customerSuccessGraphExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'FAILED',
                        error: err.message,
                        durationMs: totalDuration
                    }
                });
            }
            else if (this.engine === 'executive-board') {
                await prisma_1.prisma.executiveBoardExecutionLog.update({
                    where: { id: execLog.id },
                    data: {
                        status: 'FAILED',
                        error: err.message,
                        durationMs: totalDuration
                    }
                });
            }
            else {
                await prisma_1.prisma.graphExecutionLog.update({
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
exports.StateGraph = StateGraph;
