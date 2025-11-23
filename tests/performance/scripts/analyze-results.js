#!/usr/bin/env node

/**
 * Script para análise detalhada de resultados de testes de stress
 */

const fs = require('fs');
const path = require('path');

function analyzeResults(reportPath) {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const aggregate = report.aggregate || {};
  
  const analysis = {
    summary: {},
    phases: [],
    endpoints: {},
    errors: {}
  };

  // Resumo geral
  analysis.summary = {
    totalRequests: aggregate.requests?.count || 0,
    totalErrors: aggregate.errors?.count || 0,
    duration: aggregate.duration || 0,
    latency: {
      min: aggregate.latency?.min || 0,
      max: aggregate.latency?.max || 0,
      median: aggregate.latency?.median || 0,
      p95: aggregate.latency?.p95 || 0,
      p99: aggregate.latency?.p99 || 0
    },
    throughput: aggregate.requests?.count / (aggregate.duration / 1000) || 0
  };

  // Análise por fase
  if (report.phases) {
    report.phases.forEach((phase, index) => {
      analysis.phases.push({
        name: phase.name || `Phase ${index + 1}`,
        duration: phase.duration || 0,
        arrivalRate: phase.arrivalRate || 0,
        requests: phase.requests?.count || 0,
        errors: phase.errors?.count || 0,
        latencyP95: phase.latency?.p95 || 0,
        throughput: phase.requests?.count / (phase.duration || 1)
      });
    });
  }

  // Análise de erros
  if (aggregate.errors) {
    analysis.errors = {
      total: aggregate.errors.count || 0,
      byCode: aggregate.errors.codes || {},
      byMessage: aggregate.errors.messages || {}
    };
  }

  return analysis;
}

function generateReport(analysis) {
  const errorRate = analysis.summary.totalRequests > 0 
    ? (analysis.summary.totalErrors / analysis.summary.totalRequests) * 100 
    : 0;

  const report = `# Test Results Analysis

## Summary

- **Total Requests**: ${analysis.summary.totalRequests.toLocaleString()}
- **Total Errors**: ${analysis.summary.totalErrors.toLocaleString()}
- **Error Rate**: ${errorRate.toFixed(2)}%
- **Duration**: ${(analysis.summary.duration / 1000).toFixed(2)}s
- **Throughput**: ${analysis.summary.throughput.toFixed(2)} req/s

## Latency

- **Min**: ${analysis.summary.latency.min}ms
- **Max**: ${analysis.summary.latency.max}ms
- **Median**: ${analysis.summary.latency.median}ms
- **P95**: ${analysis.summary.latency.p95}ms
- **P99**: ${analysis.summary.latency.p99}ms

## Phases

${analysis.phases.map(phase => `
### ${phase.name}

- Duration: ${phase.duration}s
- Arrival Rate: ${phase.arrivalRate} req/s
- Requests: ${phase.requests.toLocaleString()}
- Errors: ${phase.errors.toLocaleString()}
- Latency P95: ${phase.latencyP95}ms
- Throughput: ${phase.throughput.toFixed(2)} req/s
`).join('\n')}

## Errors

${Object.entries(analysis.errors.byCode).length > 0 
  ? Object.entries(analysis.errors.byCode).map(([code, count]) => `
- **${code}**: ${count}
`).join('')
  : '- No errors found'
}
`;

  return report;
}

function main() {
  const reportPath = process.argv[2] || 'artillery-report.json';
  const outputPath = process.argv[3] || 'analysis-report.md';

  try {
    const analysis = analyzeResults(reportPath);
    const report = generateReport(analysis);
    
    fs.writeFileSync(outputPath, report);
    console.log(`✅ Analysis report generated: ${outputPath}`);
    
    // Também imprimir resumo no console
    console.log('\n📊 Summary:');
    console.log(`  Total Requests: ${analysis.summary.totalRequests.toLocaleString()}`);
    console.log(`  Total Errors: ${analysis.summary.totalErrors.toLocaleString()}`);
    const errorRate = analysis.summary.totalRequests > 0 
      ? (analysis.summary.totalErrors / analysis.summary.totalRequests) * 100 
      : 0;
    console.log(`  Error Rate: ${errorRate.toFixed(2)}%`);
    console.log(`  Latency P95: ${analysis.summary.latency.p95}ms`);
    console.log(`  Latency P99: ${analysis.summary.latency.p99}ms`);
    console.log(`  Throughput: ${analysis.summary.throughput.toFixed(2)} req/s`);
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeResults, generateReport };

