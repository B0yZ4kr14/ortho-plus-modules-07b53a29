# ADR-001: Edge Function Naming Convention (kebab-case)

**Status:** Accepted  
**Date:** 2025-11-14  
**Deciders:** Architecture Team  
**Technical Story:** FASE 0 - T0.3 (Stabilization)

---

## Context

Durante a auditoria de estabilização do sistema Ortho+, identificamos **6 Edge Functions duplicadas** com nomenclaturas inconsistentes:
- `getMyModules` / `get-my-modules`
- `toggleModuleState` / `toggle-module-state`
- `requestNewModule` / `request-new-module`

Esta duplicação causava:
- **Ambiguidade**: Desenvolvedores não sabiam qual versão usar
- **Risco de drift**: Mudanças em uma versão não eram replicadas na outra
- **Custo de manutenção**: 2x o código para manter
- **Inconsistência arquitetural**: Violava princípio DRY (Don't Repeat Yourself)

---

## Decision

**Padronizar TODAS as Edge Functions para `kebab-case`** (lowercase com hífens).

### Rationale
1. **Convenção RESTful**: URLs seguem kebab-case (RFC 3986)
2. **Legibilidade**: `get-my-modules` é mais legível que `getMyModules` em URLs
3. **Compatibilidade**: Evita problemas case-sensitive em sistemas Unix/Windows
4. **Padrão da indústria**: AWS Lambda, Google Cloud Functions usam kebab-case
5. **Simplicidade**: Uma única convenção reduz carga cognitiva

### Actions Taken
- ✅ Deletadas versões camelCase: `getMyModules`, `toggleModuleState`, `requestNewModule`
- ✅ Atualizado `src/hooks/useModules.ts` para usar kebab-case
- ✅ Verificado todos os `apiClient.post()` no codebase

---

## Consequences

### Positive
- **-50% código**: Eliminadas 3 funções duplicadas
- **Zero ambiguidade**: Uma única fonte de verdade por função
- **Manutenibilidade**: Mudanças em um único lugar
- **Consistência**: Alinhamento com padrões da indústria

### Negative
- **Breaking change**: Frontend precisou ser atualizado (mitigado com busca/substituição global)

### Neutral
- **Retrocompatibilidade**: Não aplicável (sistema interno, sem API pública)

---

## Compliance

Este ADR implementa a seguinte diretriz do plano de refatoração:
> **T0.3**: Eliminar Edge Functions Duplicadas. Criar ADR #001 documentando decisão. Adicionar lint rule para prevenir recorrência.

---

## Enforcement

### Pre-commit Hook (Futuro - T7.x)
```bash
# .husky/pre-commit
#!/bin/sh
# Check for camelCase in function names
if find apiClient/functions -maxdepth 1 -type d | grep -E '[A-Z]'; then
  echo "❌ Error: Edge Function names must use kebab-case"
  echo "Found: $(find apiClient/functions -maxdepth 1 -type d | grep -E '[A-Z]')"
  exit 1
fi
```

### Linting Rule (ESLint - Futuro - T7.x)
```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.property.name='invoke'] Literal[value=/[A-Z]/]",
        "message": "Edge Function names must use kebab-case, not camelCase"
      }
    ]
  }
}
```

---

## References

- [RFC 3986 - URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [Google API Design Guide - Resource Names](https://cloud.google.com/apis/design/resource_names)
- [AWS Lambda - Naming Conventions](https://docs.aws.amazon.com/lambda/latest/dg/API_CreateFunction.html)
- PostgreSQL Edge Functions Docs

---

## Revision History

| Date | Author | Changes |
|---|---|---|
| 2025-11-14 | Architecture Team | Initial version - established kebab-case standard |
