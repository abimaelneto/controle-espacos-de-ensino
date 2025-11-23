#!/usr/bin/env node

/**
 * Script para validar resultados de testes de stress contra SLAs
 */

const fs = require('fs');
const path = require('path');

const SLAs = {
  latencyP95: 500,      // ms
  latencyP99: 1000,     // ms
  errorRate: 0.01,      // 1%
  successRate: 0.99,    // 99%
  minThroughput: 50,    // req/s
};

function loadArtilleryReport(reportPath) {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const content = fs.readFileSync(reportPath, 'utf8');
  return JSON.parse(content);
}

function validateSLA(report) {
  const results = {
    passed: true,
    violations: [],
    metrics: {}
  };

  const aggregate = report.aggregate || {};
  const latency = aggregate.latency || {};
  const requests = aggregate.requests || {};
  const errors = aggregate.errors || {};

  // Latência P95
  const p95 = latency.p95 || 0;
  results.metrics.p95 = p95;
  if (p95 > SLAs.latencyP95) {
    results.passed = false;
    results.violations.push({
      metric: 'Latency P95',
      value: `${p95}ms`,
      threshold: `${SLAs.latencyP95}ms`,
      severity: 'HIGH'
    });
  }

  // Latência P99
  const p99 = latency.p99 || 0;
  results.metrics.p99 = p99;
  if (p99 > SLAs.latencyP99) {
    results.passed = false;
    results.violations.push({
      metric: 'Latency P99',
      value: `${p99}ms`,
      threshold: `${SLAs.latencyP99}ms`,
      severity: 'HIGH'
    });
  }

  // Taxa de erro
  const totalRequests = requests.count || 0;
  const totalErrors = errors.count || 0;
  const errorRate = totalRequests > 0 ? totalErrors / totalRequests : 0;
  results.metrics.errorRate = errorRate;
  
  if (errorRate > SLAs.errorRate) {
    results.passed = false;
    results.violations.push({
      metric: 'Error Rate',
      value: `${(errorRate * 100).toFixed(2)}%`,
      threshold: `${(SLAs.errorRate * 100).toFixed(2)}%`,
      severity: 'HIGH'
    });
  }

  // Taxa de sucesso
  const successRate = 1 - errorRate;
  results.metrics.successRate = successRate;
  
  if (successRate < SLAs.successRate) {
    results.passed = false;
    results.violations.push({
      metric: 'Success Rate',
      value: `${(successRate * 100).toFixed(2)}%`,
      threshold: `${(SLAs.successRate * 100).toFixed(2)}%`,
      severity: 'HIGH'
    });
  }

  // Throughput
  const duration = aggregate.duration || 0;
  const throughput = duration > 0 ? totalRequests / (duration / 1000) : 0;
  results.metrics.throughput = throughput;
  
  if (throughput < SLAs.minThroughput) {
    results.passed = false;
    results.violations.push({
      metric: 'Throughput',
      value: `${throughput.toFixed(2)} req/s`,
      threshold: `${SLAs.minThroughput} req/s`,
      severity: 'MEDIUM'
    });
  }

  return results;
}

function printResults(results) {
  console.log('\n📊 SLA Validation Results\n');
  console.log('Metrics:');
  console.log(`  Latency P95: ${results.metrics.p95}ms (threshold: ${SLAs.latencyP95}ms)`);
  console.log(`  Latency P99: ${results.metrics.p99}ms (threshold: ${SLAs.latencyP99}ms)`);
  console.log(`  Error Rate: ${(results.metrics.errorRate * 100).toFixed(2)}% (threshold: ${(SLAs.errorRate * 100).toFixed(2)}%)`);
  console.log(`  Success Rate: ${(results.metrics.successRate * 100).toFixed(2)}% (threshold: ${(SLAs.successRate * 100).toFixed(2)}%)`);
  console.log(`  Throughput: ${results.metrics.throughput.toFixed(2)} req/s (threshold: ${SLAs.minThroughput} req/s)`);
  
  if (results.violations.length > 0) {
    console.log('\n❌ SLA Violations:');
    results.violations.forEach(violation => {
      console.log(`  [${violation.severity}] ${violation.metric}: ${violation.value} > ${violation.threshold}`);
    });
  } else {
    console.log('\n✅ All SLAs met!');
  }
}

function main() {
  const reportPath = process.argv[2] || 'artillery-report.json';
  
  try {
    const report = loadArtilleryReport(reportPath);
    const results = validateSLA(report);
    
    printResults(results);
    
    if (!results.passed) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSLA, SLAs };

