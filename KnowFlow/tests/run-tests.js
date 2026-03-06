const { execSync } = require('child_process');

console.log('Running tests...');

try {
  // 运行核心模块测试
  console.log('\n=== Core Modules Tests ===');
  execSync('node core.test.js', { stdio: 'inherit', cwd: __dirname });
  
  // 运行插件测试
  console.log('\n=== Plugins Tests ===');
  execSync('node plugins.test.js', { stdio: 'inherit', cwd: __dirname });
  
  console.log('\n✅ All tests passed!');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}