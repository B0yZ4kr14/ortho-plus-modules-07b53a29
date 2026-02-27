# Guia de Teste Manual - Busca Global e Hotkeys

## 🧪 Como Testar as Funcionalidades

### 1. Teste da Busca Global

#### Teste 1.1: Abrir a Busca
1. **Via Teclado:**
   - Pressione `Ctrl + K` (Windows/Linux) ou `Cmd + K` (Mac)
   - ✅ Deve abrir o modal de busca

2. **Via Clique:**
   - Clique na barra de busca no header
   - ✅ Deve abrir o modal de busca

#### Teste 1.2: Realizar Busca
1. Digite pelo menos 2 caracteres
2. Aguarde 300ms (debounce)
3. ✅ Deve exibir loading spinner
4. ✅ Deve exibir resultados agrupados por categoria
5. ✅ Deve mostrar ícones para cada tipo de resultado

#### Teste 1.3: Navegação via Resultado
1. Busque por algo (ex: "consulta")
2. Clique em um resultado
3. ✅ Deve navegar para a página correspondente
4. ✅ O modal deve fechar automaticamente

#### Teste 1.4: Empty State
1. Digite algo que não existe (ex: "xyzabc123")
2. ✅ Deve exibir "Nenhum resultado encontrado"

#### Teste 1.5: Fechar Modal
1. Abra a busca
2. Pressione `ESC` ou clique fora
3. ✅ Modal deve fechar

---

### 2. Teste dos Hotkeys de Navegação

#### Teste 2.1: Atalhos Individuais
Teste cada atalho pressionando `Ctrl/Cmd + Tecla`:

| Atalho | Página Destino | Resultado Esperado |
|--------|----------------|---------------------|
| `Ctrl/Cmd + D` | Dashboard | ✅ Navega + Toast |
| `Ctrl/Cmd + P` | Pacientes | ✅ Navega + Toast |
| `Ctrl/Cmd + A` | Agenda | ✅ Navega + Toast |
| `Ctrl/Cmd + E` | PEP | ✅ Navega + Toast |
| `Ctrl/Cmd + F` | Financeiro | ✅ Navega + Toast |
| `Ctrl/Cmd + O` | Orçamentos | ✅ Navega + Toast |
| `Ctrl/Cmd + C` | CRM | ✅ Navega + Toast |
| `Ctrl/Cmd + R` | Relatórios | ✅ Navega + Toast |
| `Ctrl/Cmd + S` | Configurações | ✅ Navega + Toast |

#### Teste 2.2: Toast Notification
1. Use qualquer atalho de navegação
2. ✅ Deve exibir toast no canto da tela
3. ✅ Toast deve mostrar o nome da página
4. ✅ Toast deve mostrar qual atalho foi usado
5. ✅ Toast deve desaparecer após 2 segundos

---

### 3. Teste do Modal de Ajuda

#### Teste 3.1: Abrir Modal de Ajuda
1. Pressione `?` (interrogação)
2. ✅ Modal deve abrir
3. ✅ Deve mostrar título "Atalhos de Teclado"

#### Teste 3.2: Conteúdo do Modal
1. Abra o modal de ajuda
2. ✅ Deve mostrar 4 categorias:
   - Navegação Geral
   - Cadastros
   - Clínica
   - Gestão
3. ✅ Cada atalho deve ter badges com teclas
4. ✅ Deve ter dica sobre Ctrl vs Cmd no rodapé

#### Teste 3.3: Scroll no Modal
1. Abra o modal de ajuda
2. ✅ Deve ser scrollável se houver muitos atalhos
3. ✅ Deve ter altura máxima de 80vh

#### Teste 3.4: Não Abrir em Inputs
1. Clique em qualquer campo de input
2. Pressione `?`
3. ✅ Modal NÃO deve abrir (para não interferir em digitação)

#### Teste 3.5: Fechar Modal
1. Abra o modal de ajuda
2. Pressione `ESC` ou clique no X
3. ✅ Modal deve fechar

---

### 4. Teste do Layout Header

#### Teste 4.1: Centralização da Busca
1. Observe o header
2. ✅ Barra de busca deve estar centralizada
3. ✅ Deve ter largura máxima de 2xl (768px)

#### Teste 4.2: Elementos do Header
1. Observe o lado direito do header
2. ✅ Deve ter ícone de paleta (Theme)
3. ✅ Deve ter toggle de tema (sol/lua)
4. ✅ Se múltiplas clínicas: deve ter seletor
5. ✅ Deve ter menu de usuário com avatar

#### Teste 4.3: Breadcrumbs
1. Navegue para qualquer página
2. ✅ Deve exibir breadcrumbs abaixo do header
3. ✅ Deve mostrar hierarquia (Home > Módulo > Submódulo)
4. ✅ Links devem ser clicáveis

#### Teste 4.4: Sem Sobreposições
1. Redimensione a janela
2. ✅ Nenhum elemento deve sobrepor outro
3. ✅ Todos devem permanecer visíveis
4. ✅ Layout deve ser responsivo

---

### 5. Testes de Integração

#### Teste 5.1: Busca + Hotkey
1. Abra a busca com `Ctrl/Cmd + K`
2. Busque algo e clique em resultado
3. Use um hotkey para navegar para outra página
4. ✅ Tudo deve funcionar sem conflitos

#### Teste 5.2: Modal Ajuda + Busca
1. Abra o modal de ajuda com `?`
2. Feche com ESC
3. Abra a busca com `Ctrl/Cmd + K`
4. ✅ Ambos devem funcionar independentemente

#### Teste 5.3: Múltiplos Hotkeys Sequenciais
1. Pressione `Ctrl/Cmd + P` (Pacientes)
2. Aguarde navegação
3. Pressione `Ctrl/Cmd + A` (Agenda)
4. Aguarde navegação
5. Pressione `Ctrl/Cmd + D` (Dashboard)
6. ✅ Todas as navegações devem funcionar

---

### 6. Testes de Performance

#### Teste 6.1: Busca Rápida
1. Abra a busca
2. Digite rapidamente vários caracteres
3. ✅ Debounce deve prevenir queries excessivas
4. ✅ Só deve buscar após 300ms de pausa

#### Teste 6.2: Muitos Resultados
1. Busque um termo genérico (ex: "a")
2. ✅ Deve limitar a 5 resultados por categoria
3. ✅ Não deve travar a interface

---

### 7. Testes de Edge Cases

#### Teste 7.1: Busca Vazia
1. Abra a busca
2. Digite 1 caractere apenas
3. ✅ Não deve fazer query (mínimo 2)

#### Teste 7.2: Caracteres Especiais
1. Busque com caracteres especiais (%, _, etc)
2. ✅ Não deve causar erro
3. ✅ Query deve ser sanitizada

#### Teste 7.3: Sem Conexão
1. Desabilite internet (simulate offline)
2. Tente buscar
3. ✅ Deve tratar erro gracefully
4. ✅ Não deve quebrar a aplicação

---

## ✅ Checklist de Validação

### Busca Global
- [ ] Abre com Ctrl/Cmd + K
- [ ] Abre com clique
- [ ] Busca em tempo real funciona
- [ ] Resultados agrupados
- [ ] Navegação funciona
- [ ] Loading state
- [ ] Empty state
- [ ] Fecha com ESC

### Hotkeys
- [ ] Ctrl/Cmd + D (Dashboard)
- [ ] Ctrl/Cmd + P (Pacientes)
- [ ] Ctrl/Cmd + A (Agenda)
- [ ] Ctrl/Cmd + E (PEP)
- [ ] Ctrl/Cmd + F (Financeiro)
- [ ] Ctrl/Cmd + O (Orçamentos)
- [ ] Ctrl/Cmd + C (CRM)
- [ ] Ctrl/Cmd + R (Relatórios)
- [ ] Ctrl/Cmd + S (Configurações)
- [ ] Toast notifications

### Modal de Ajuda
- [ ] Abre com ?
- [ ] 4 categorias visíveis
- [ ] Badges nas teclas
- [ ] Scrollável
- [ ] Não abre em inputs
- [ ] Fecha com ESC

### Layout Header
- [ ] Busca centralizada
- [ ] Sem sobreposições
- [ ] Breadcrumbs visíveis
- [ ] Responsivo
- [ ] Todos elementos acessíveis

## 📊 Resultado Esperado

✅ **TODOS os testes devem PASSAR**

Se algum teste falhar, verificar:
1. Console do navegador para erros
2. Network tab para requests falhando
3. Permissões do usuário
4. Estado de autenticação
