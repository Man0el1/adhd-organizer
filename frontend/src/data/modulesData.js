export const AVAILABLE_MODULES = [
  {
    id: 'agenda-visual',
    name: 'Agenda Visual (Timeline)',
    shortDesc: 'Rotina em linha do tempo com barras de progresso visual estilo Tiimo.',
    fullDesc: 'Visualize o dia como uma sequência contínua de blocos de tempo coloridos. O tempo se torna concreto com marcadores visuais do que está acontecendo agora e o que vem a seguir.',
    category: 'rotina',
    icon: 'Clock3',
    badge: 'Mais Escolhido',
    previewTitle: 'Sua Linha do Tempo de Hoje',
    previewType: 'agenda',
    adhdBenefit: 'Combate a cegueira temporal mostrando o tempo escorrendo visualmente.',
    isDefault: true,
  },
  {
    id: 'calendario-lembretes',
    name: 'Calendário de Lembretes',
    shortDesc: 'Visão mensal e semanal espaçada para não esquecer compromissos importantes.',
    fullDesc: 'Um calendário simplificado que destaca apenas as datas críticas sem sobrecarregar com excesso de informação. Notificações gentis e contagem regressiva para eventos.',
    category: 'tempo',
    icon: 'CalendarDays',
    badge: 'Essencial',
    previewTitle: 'Calendário com Alertas Espaçados',
    previewType: 'calendar',
    adhdBenefit: 'Evita a ansiedade de esquecer prazos e compromissos futuros.',
    isDefault: true,
  },
  {
    id: 'temporizador-foco',
    name: 'Temporizador Dopamina & Foco',
    shortDesc: 'Pomodoro adaptável com sons suaves e pausas para recarregar o cérebro.',
    fullDesc: 'Blocos flexíveis de 15, 25 ou 45 minutos com contadores visuais sem tique-taque estressante. Permite pausar sem culpa e ajustar o tempo no meio do caminho.',
    category: 'foco',
    icon: 'Hourglass',
    badge: 'Anti-Paralisia',
    previewTitle: 'Sessão de Foco Consciente',
    previewType: 'timer',
    adhdBenefit: 'Ajuda a quebrar a inércia e começar tarefas difíceis sem pressão.',
    isDefault: false,
  },
  {
    id: 'brain-dump',
    name: 'Lixeira Mental (Brain Dump)',
    shortDesc: 'Despejo rápido de ideias e pensamentos intrusivos para não perder o foco.',
    fullDesc: 'Uma gaveta de captura rápida para anotar ideias repentinas que surgem enquanto você está fazendo outra coisa, sem desviar a sua atenção da tarefa atual.',
    category: 'organizacao',
    icon: 'Sparkles',
    badge: 'Alívio Mental',
    previewTitle: 'Captura Instantânea de Pensamentos',
    previewType: 'braindump',
    adhdBenefit: 'Esvazia a memória de trabalho sem deixar ideias valiosas escaparem.',
    isDefault: false,
  }
];

export const ADHD_CHALLENGES = [
  {
    id: 'cegueira-temporal',
    title: 'Cegueira Temporal',
    icon: 'EyeOff',
    description: 'Dificuldade de sentir o tempo passando ou estimar quanto tempo uma atividade leva.',
    solution: 'Barras de progresso visual contínuas e marcação de blocos coloridos.',
    suggestedModules: ['agenda-visual', 'temporizador-foco']
  },
  {
    id: 'paralisia-inicial',
    title: 'Paralisia de Iniciação',
    icon: 'Footprints',
    description: 'Saber exatamente o que precisa ser feito, mas não conseguir dar o primeiro passo.',
    solution: 'Quebra de grandes tarefas em micro-ações de menos de 2 minutos.',
    suggestedModules: ['decompositor-tarefas', 'temporizador-foco']
  },
  {
    id: 'esquecimento-ativo',
    title: 'Fora da Vista, Fora da Mente',
    icon: 'SearchX',
    description: 'Esquecer compromissos importantes simplesmente porque eles não estão visíveis.',
    solution: 'Calendário de lembretes limpo e sempre ancorado na barra lateral esquerda.',
    suggestedModules: ['calendario-lembretes', 'agenda-visual']
  },
  {
    id: 'sobrecarga-sensorial',
    title: 'Sobrecarga de Opções',
    icon: 'Layers',
    description: 'Apps tradicionais cheios de botões e abas geram estresse e abandono rápido.',
    solution: 'Você ativa apenas os modelos que realmente usa, mantendo a tela limpa.',
    suggestedModules: ['brain-dump', 'bateria-mental']
  }
];

export const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Monte seu Kit Pessoal',
    description: 'Nenhum cérebro com TDAH é idêntico. Selecione apenas as ferramentas que fazem sentido para você: só agenda, só calendário, ou o pacote completo.',
    tag: 'Personalização Total'
  },
  {
    step: '02',
    title: 'Acesso Rápido na Barra Lateral',
    description: 'Tudo o que você selecionou fica fixado e organizado na aba esquerda do seu painel. Sem menus escondidos, sem labirintos de configurações.',
    tag: 'Fricção Zero'
  },
  {
    step: '03',
    title: 'Acompanhe seu Dia sem Culpa',
    description: 'Execute suas tarefas com apoio visual do tempo, respeitando suas flutuações de energia e celebrando cada micro-conclusão sem cobranças irreais.',
    tag: 'Ritmo Neurodivergente'
  }
];

export const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Como funciona a escolha dos modelos na barra lateral?',
    answer: 'Ao criar sua conta (ou a qualquer momento no seu painel), você escolhe quais módulos deseja ativar. Se você precisa apenas de uma agenda visual, você terá apenas isso. Se quiser adicionar um calendário ou temporizador depois, basta ativar com um clique na barra lateral.'
  },
  {
    id: 'faq-2',
    question: 'Qual a diferença entre a Agenda Visual e o Calendário de Lembretes?',
    answer: 'A Agenda Visual (estilo Tiimo) foca no seu dia atual, mostrando a sequência de blocos de tempo com progresso em tempo real. Já o Calendário foca nas semanas e meses para registrar datas importantes, prazos e compromissos futuros.'
  },
  {
    id: 'faq-3',
    question: 'Posso mudar os modelos depois de criar a conta?',
    answer: 'Sim! A qualquer momento você pode clicar em "Editar Barra Lateral" no seu painel e ativar ou desativar qualquer ferramenta. Sua barra lateral esquerda se reorganiza instantaneamente.'
  },
  {
    id: 'faq-4',
    question: 'Por que o design utiliza tons elegantes de marrom e vinho?',
    answer: 'Cores excessivamente berrantes ou fundos brancos puros causam hiperestimulação sensorial e cansaço visual rápido. Tons terrosos, café e vinho conferem sofisticação, calor e conforto para longos períodos de foco.'
  },
  {
    id: 'faq-5',
    question: 'O FocusMod cobra alguma mensalidade no início?',
    answer: 'Não, o acesso aos modelos essenciais é gratuito para você montar seu kit e organizar a sua rotina no seu próprio ritmo.'
  }
];
