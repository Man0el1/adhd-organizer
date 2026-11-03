# Arquitetura dos Novos Modelos de Organização: FocusMod (Revisado)

Plano arquitetural atualizado incorporando as diretrizes de simplificação, sincronização estrita de estados e eliminação de redundâncias conceituais no banco de dados e na interface.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Ajustes e regras de negócio confirmados pelo usuário:

- **Kanban com 3 Colunas Fixas**: Operação com as três colunas padrão (`'todo'`, `'in_progress'`, `'done'`). Sem personalização de colunas nesta fase para manter simplicidade e previsibilidade.
- **Matriz Sem Redundância (`urgency` e `importance`)**: `TaskMatrix` armazenará estritamente dois booleanos: `urgency` e `importance`. O quadrante correspondente é calculado de forma pura na interface.
- **Microtarefas com Subtarefas Opcionais**: Uma tarefa do modelo de microtarefas pode existir sem subtarefas. A barra e indicador de progresso só serão exibidos quando houver ao menos uma subtarefa cadastrada.
- **Sincronização Única de Conclusão**:
  - `TaskKanban.column_id === 'done'` $\longleftrightarrow$ `Task.done === true`.
  - Mover cartão para `'done'` atualiza automaticamente `Task.done = true`.
  - Mover cartão para `'todo'` ou `'in_progress'` atualiza automaticamente `Task.done = false`.
  - Alternar checkbox de conclusão sincroniza a coluna (concluir move para `'done'`; reabrir move para `'in_progress'`).
- **Preservação do Fallback em Memória**: As mesmas regras de sincronização e estrutura de dados aplicadas ao Sequelize serão integradas ao `taskController.js` no padrão já utilizado (`inMemoryTasks` e persistência em `tasks_store.json`), evitando bifurcação de regras.

---

## 1. Visão Geral dos Modelos (Lote 1 Prioritário)

| Modelo | Proposta para TDAH | Entidade Principal | Estrutura de Apoio | Comportamento de Conclusão |
| :--- | :--- | :--- | :--- | :--- |
| **Microtarefas** | Divide tarefas em etapas menores para vencer paralisia inicial | `Task` | `Subtask` (1 : N opcional) | Conclusão individual por subtarefa; tarefa principal conclui se todas as subtarefas estiverem feitas ou via toggle manual |
| **Kanban** | Visualização de fluxo em 3 estados fixos com baixa fricção | `Task` | `TaskKanban` (1 : 1) | Coluna `'done'` é 100% espelhada em `Task.done` |
| **Matriz de Prioridades** | Separação pura de Urgência e Importância em 4 quadrantes visuais | `Task` | `TaskMatrix` (1 : 1 com `urgency` e `importance`) | Checkbox padrão `Task.done`, permitindo focar nos quadrantes ativos |

---

## 2. Modelagem de Dados & Associações Normalizadas

```
┌──────────────────────────────────────────────┐
│                    Task                      │
│  id_task (PK)                                │
│  id_account, id_model, name,                 │
│  description, done, createdAt                │
└───────┬───────────────────────────────┬──────┘
        │ 1 : 1                         │ 1 : 1
        ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│          TaskKanban          │ │          TaskMatrix          │
│  id_task_kanban (PK)         │ │  id_task_matrix (PK)         │
│  id_task (FK UNIQUE)         │ │  id_task (FK UNIQUE)         │
│  column_id ('todo',          │ │  urgency (BOOLEAN)           │
│   'in_progress', 'done')     │ │  importance (BOOLEAN)        │
│  order_index (INTEGER)       │ └──────────────────────────────┘
└──────────────────────────────┘
        │ 1 : N (opcional)
        ▼
┌──────────────────────────────┐
│           Subtask            │
│  id_subtask (PK)             │
│  id_task (FK)                │
│  title (VARCHAR)             │
│  done (BOOLEAN)              │
│  order_index (INTEGER)       │
└──────────────────────────────┘
```

### Regras de Cálculo dos Quadrantes da Matriz (Frontend):
- `urgency === true && importance === true` $\rightarrow$ **1. Fazer Primeiro (Urgente & Importante)**
- `urgency === false && importance === true` $\rightarrow$ **2. Agendar (Não Urgente & Importante)**
- `urgency === true && importance === false` $\rightarrow$ **3. Delegar / Rápido (Urgente & Não Importante)**
- `urgency === false && importance === false` $\rightarrow$ **4. Esperar / Eliminar (Não Urgente & Não Importante)**

---

## 3. Arquitetura do Formulário e Componentes React

Os componentes serão adicionados em `components/task-form/model-fields/`, mantendo a arquitetura modular já estabelecida:

```
frontend/src/components/task-form/
├── TaskFormModal.jsx
├── CommonFields.jsx
├── DateField.jsx
├── TimeFields.jsx
├── RecurrenceField.jsx
└── model-fields/
    ├── CalendarFields.jsx
    ├── VisualAgendaFields.jsx
    ├── BrainDumpFields.jsx
    ├── MicrotasksFields.jsx   # Adição de subtarefas iniciais (opcional)
    ├── KanbanFields.jsx       # Seleção de coluna inicial ('todo' / 'in_progress' / 'done')
    └── MatrixFields.jsx       # Seleção de Urgência (Sim/Não) e Importância (Sim/Não)
```

### Componentes de Interface dos Modelos (`frontend/src/components/ModelsUi/`):
- `Microtasks.jsx`:
  - Lista de tarefas com barra de progresso visual condicional (só renderiza `X de Y concluídas` quando houver $\ge 1$ subtarefas).
  - Adição rápida inline de nova subtarefa diretamente no cartão, sem abrir modal.
  - Conclusão com 1 clique de subtarefas individuais.
- `KanbanBoard.jsx`:
  - 3 colunas fixas: **A Fazer**, **Em Progresso**, **Concluído**.
  - Ações rápidas de mover cartão (botões de avanço/recuo ou drag & drop simplificado).
  - Sincronização automática com `done`: ao mover para Concluído, marca `Task.done = true`.
- `PriorityMatrix.jsx`:
  - Grade 2x2 com os 4 quadrantes claros e organizados.
  - Alternador visual de quadrante (botão de transferir entre quadrantes com 1 clique).
  - Checkbox direto para concluir a tarefa.

---

## 4. Regras de Backend & Fallback em Memória

### Endpoints da API:
- `GET /api/tasks?modelId=...`: retorna tarefas incluindo suas extensões (`kanban`, `matrix`, `subtasks`).
- `POST /api/tasks`: cria a tarefa base e, se o modelo for Kanban, cria `TaskKanban`; se Matriz, cria `TaskMatrix`; se houver subtarefas iniciais, insere em `Subtask`.
- `PUT /api/tasks/:id`: atualiza `Task`, `TaskKanban` (com sincronização de `done`) e `TaskMatrix`.
- `POST /api/tasks/:id/subtasks`: adiciona uma subtarefa à tarefa existente.
- `PUT /api/tasks/subtasks/:subtaskId`: atualiza status `done` ou título da subtarefa.
- `DELETE /api/tasks/subtasks/:subtaskId`: remove uma subtarefa específica.

### Sincronização Única de Estado no Controller:
```js
// No controller, tanto em Sequelize quanto no fallback em memória:
if (column_id) {
  taskRecord.done = (column_id === 'done');
} else if (done !== undefined && taskRecord.kanban) {
  taskRecord.kanban.column_id = done ? 'done' : 'in_progress';
}
```

---

## 5. Plano de Execução do Lote 1

1. **Backend (Modelos, Associações e Controller)**:
   - Criar `taskKanbanModel.js`, `taskMatrixModel.js` e `subtaskModel.js`.
   - Atualizar `associations.js`.
   - Atualizar DDL em `schema.sql` (tabelas `TaskKanban`, `TaskMatrix`, `Subtask`).
   - Implementar regras de persistência e endpoints de subtarefas no `taskController.js`, alinhando Sequelize e fallback em memória.
2. **Formulário Unificado**:
   - Criar `MicrotasksFields.jsx`, `KanbanFields.jsx` e `MatrixFields.jsx` em `components/task-form/model-fields/`.
   - Atualizar `TaskFormModal.jsx` para suportar os novos modelos.
3. **Componentes dos Modelos (Frontend)**:
   - Implementar `Microtasks.jsx`, `KanbanBoard.jsx` e `PriorityMatrix.jsx` em `components/ModelsUi/`.
   - Registrar os 3 modelos em `MODEL_TEMPLATES` e `DEFAULT_MODELS` no `Main.js`.
4. **Validação & Compilação**:
   - Testar fluxo completo com `compile_applet` e reiniciar o servidor dev.

---

## Status da Execução: Lote 1 Concluído com Sucesso
- [x] Modelos Sequelize e Associações (`TaskKanban`, `TaskMatrix`, `Subtask`)
- [x] Sincronização de estado Kanban <-> Conclusão e cálculo de Quadrante no frontend
- [x] Endpoints e regras de Subtarefas implementadas e testadas (PostgreSQL + Fallback em memória)
- [x] Componentes de formulário modulares (`MicrotasksFields`, `KanbanFields`, `MatrixFields`)
- [x] Telas dos 3 modelos criadas (`Microtasks`, `KanbanBoard`, `PriorityMatrix`)
- [x] Integração completa no `Main.js` e `AddModelModal.js`
- [x] Build e testes de API validados com sucesso

