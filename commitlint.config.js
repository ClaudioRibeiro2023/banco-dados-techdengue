module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'docs',     // Documentação
        'style',    // Formatação (não altera código)
        'refactor', // Refatoração
        'perf',     // Performance
        'test',     // Testes
        'chore',    // Manutenção
        'ci',       // CI/CD
        'build',    // Build
        'revert',   // Reverter commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72],
  },
};
