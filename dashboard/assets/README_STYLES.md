# Arquitetura de Estilos (Fase 2)

Arquivos
- tokens.css: Design tokens (cores, tipografia, espaçamentos, raios, sombras, motion)
- tokens.json: Versão serializada dos tokens
- base.css: Estilos base (tipografia, fundo, containers, foco)
- components.css: Estilos de componentes (SectionHeader, MetricCard, Badge, Table, Button, Skeleton)
- modern.css: Estilo legado (será gradualmente substituído pelos tokens)

Carregamento recomendado (em ordem)
1. tokens.css
2. base.css
3. components.css
4. overrides específicos de página (opcional)

Boas práticas
- Não usar códigos hex diretamente. Use tokens (ex.: var(--color-primary-600)).
- Não declarar estilos inline no Python. Prefira classes e estilos nos arquivos CSS.
- Para cores semânticas, use gradientes e cores via tokens.
- Mantemos compatibilidade até completar migração.
