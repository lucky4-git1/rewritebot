import assert from 'assert';
import { linguisticEvaluator, DEFAULT_EVALUATOR_WEIGHTS } from '../LinguisticEvaluator';
import { qualityGate } from '../QualityGate';

console.log('--- RUNNING LINGUISTIC & SEMANTIC EVALUATOR BENCHMARK ---');

const originalSource = 'At the beginning of the term, 860 female students from two public schools participated in the study. The incidence of dysmenorrhea increased significantly prior to medical examination.';

// Test 1: High quality human paraphrase
console.log('Testing Test 1: High quality human paraphrase...');
const goodParaphrase = '860 female students attending two state schools took part in the study at the start of the term. The occurrence of dysmenorrhea rose markedly before the medical exam.';
const res1 = linguisticEvaluator.evaluate(originalSource, goodParaphrase);
console.log('Test 1 Score:', res1.totalScore, 'Breakdown:', res1.breakdown);
assert(res1.passed === true, 'Test 1 should pass');
assert(res1.totalScore >= 85, 'Test 1 totalScore should be >= 85');
assert(res1.breakdown.semanticScore >= 90, 'Test 1 semanticScore should be >= 90');
assert(res1.metrics.directionalFlips.length === 0, 'Test 1 should have zero directional flips');
console.log('✓ Test 1 Passed: High-quality paraphrase correctly identified.');

// Test 2: Directional antonym flip (increased -> decreased)
console.log('\nTesting Test 2: Directional antonym flip (increased -> decreased)...');
const invertedParaphrase = '860 female students attending two state schools took part in the study at the start of the term. The occurrence of dysmenorrhea decreased markedly before the medical exam.';
const res2 = linguisticEvaluator.evaluate(originalSource, invertedParaphrase);
console.log('Test 2 Score:', res2.totalScore, 'Semantic:', res2.breakdown.semanticScore, 'Flips:', res2.metrics.directionalFlips);
assert(res2.passed === false, 'Test 2 should fail due to directional flip');
assert(res2.breakdown.semanticScore < 70, 'Test 2 semanticScore should be penalized (< 70)');
assert(res2.metrics.directionalFlips.length > 0, 'Test 2 should flag directional flip');
console.log('✓ Test 2 Passed: Semantic drift detected.');

// Test 3: Temporal inversion (prior to -> after)
console.log('\nTesting Test 3: Temporal inversion (prior to -> after)...');
const temporalInversion = '860 female students attending two state schools took part in the study at the start of the term. The occurrence of dysmenorrhea rose markedly after the medical exam.';
const res3 = linguisticEvaluator.evaluate(originalSource, temporalInversion);
console.log('Test 3 Score:', res3.totalScore, 'Semantic:', res3.breakdown.semanticScore, 'Flips:', res3.metrics.directionalFlips);
assert(res3.passed === false, 'Test 3 should fail due to temporal flip');
assert(res3.breakdown.semanticScore < 70, 'Test 3 semanticScore should be penalized');
console.log('✓ Test 3 Passed: Temporal relation drift detected.');

// Test 4: Verbatim copy check
console.log('\nTesting Test 4: Insufficient transformation (verbatim copy)...');
const res4 = linguisticEvaluator.evaluate(originalSource, originalSource);
console.log('Test 4 Score:', res4.totalScore, 'Transformation:', res4.breakdown.transformationScore);
assert(res4.passed === false, 'Test 4 should fail due to verbatim copy');
assert(res4.breakdown.transformationScore <= 50, 'Test 4 transformation score should be <= 50');
console.log('✓ Test 4 Passed: Pure copy-paste penalized.');

// Test 5: Robotic AI cliches
console.log('\nTesting Test 5: Robotic AI cliches...');
const roboticText = 'Furthermore, 860 female students from two state schools participated in this study. It is crucial to note that dysmenorrhea played a pivotal role as a testament to clinical factors.';
const res5Flu = linguisticEvaluator.evaluateFluency(roboticText);
console.log('Test 5 Fluency Score:', res5Flu.score, 'Issues:', res5Flu.issues);
assert(res5Flu.score < 80, 'Robotic text should have fluency score < 80');
console.log('✓ Test 5 Passed: AI discourse clichés penalized.');

// Test 6: QualityGate Factual Safety
console.log('\nTesting Test 6: QualityGate Factual Safety...');
const factEval = qualityGate.evaluateQuality(originalSource, goodParaphrase);
console.log('Test 6 QualityGate Passed:', factEval.passed, 'Score:', factEval.score);
assert(factEval.passed === true, 'QualityGate should pass for factual text');
console.log('✓ Test 6 Passed: Factual numbers preserved.');

console.log('\n======================================================');
console.log('ALL 6 LINGUISTIC & SEMANTIC BENCHMARK TESTS PASSED!');
console.log('======================================================');
