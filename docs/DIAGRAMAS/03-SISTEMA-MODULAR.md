# 🧩 Sistema Modular Plug-and-Play

```mermaid
graph LR
    subgraph "Core Modules Always Active"
        DASH[DASHBOARD]
        PAC[PACIENTES]
        PEP[PEP]
    end
    
    subgraph "Financial Modules"
        FIN[FINANCEIRO]
        SPLIT[SPLIT_PAGAMENTO]
        INAD[INADIMPLENCIA]
        CRYPTO[CRYPTO_PAYMENTS]
    end
    
    subgraph "Clinical Modules"
        AGENDA[AGENDA]
        ODONTO[ODONTOGRAMA]
        ORC[ORCAMENTOS]
        ESTOQUE[ESTOQUE]
    end
    
    subgraph "Compliance Modules"
        LGPD[LGPD]
        TISS[TISS]
        SIGN[ASSINATURA_ICP]
    end
    
    subgraph "Innovation Modules"
        TELEO[TELEODONTO]
        IA[IA]
        FLUXO[FLUXO_DIGITAL]
    end
    
    subgraph "Marketing Modules"
        CRM[CRM]
        MKTAUTO[MARKETING_AUTO]
        BI[BI]
    end
    
    SPLIT --> FIN
    INAD --> FIN
    CRYPTO --> FIN
    ORC --> ODONTO
    SIGN --> PEP
    TISS --> PEP
    FLUXO --> PEP
    IA --> PEP
    IA --> FLUXO
    
    style FIN fill:#4caf50,stroke:#fff,stroke-width:3px,color:#fff
    style PEP fill:#2196f3,stroke:#fff,stroke-width:3px,color:#fff
    style IA fill:#ff9800,stroke:#fff,stroke-width:3px,color:#fff
```

## Dependências

| Módulo | Depende de |
|--------|------------|
| SPLIT_PAGAMENTO | FINANCEIRO |
| INADIMPLENCIA | FINANCEIRO |
| CRYPTO_PAYMENTS | FINANCEIRO |
| ORCAMENTOS | ODONTOGRAMA |
| ASSINATURA_ICP | PEP |
| TISS | PEP |
| FLUXO_DIGITAL | PEP |
| IA | PEP + FLUXO_DIGITAL |

**Total: 21 módulos**
