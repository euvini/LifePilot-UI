export type TaskStatus = "DONE" | "IN_PROGRESS" | "TODO"

export type TaskIconKey =
  | "doc-check"
  | "circle-check"
  | "truck"
  | "box"
  | "key"
  | "inspect"

export interface TaskItem {
  id: string
  title: string
  description: string
  dueDate: string
  status: TaskStatus
  icon: TaskIconKey
  highlighted?: boolean
}

export interface CopilotSuggestion {
  id: string
  title: string
  description?: string
  category?: string
  dueDate: string
  selected: boolean
}

export interface MovingPlan {
  id: string
  slug: string
  sidebarTitle: string
  title: string
  origin: string
  destination: string
  shortRoute: string
  movingDate: string
  daysRemaining: number
  progress: number
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  todoTasks: number
  sidebarIcon: "home" | "doc" | "box"
  tasks: TaskItem[]
  copilotSuggestions: CopilotSuggestion[]
}

export const INITIAL_MOVING_PLANS: MovingPlan[] = [
  {
    id: "mp-lisboa-302",
    slug: "lisboa-302",
    sidebarTitle: "Mudança para Lisboa",
    title: "Mudança para Lisboa — Ap. 302.",
    origin: "São Paulo, SP (Brasil)",
    destination: "Lisboa, Avenidas Novas (Portugal)",
    shortRoute: "São Paulo, SP → Lisboa, PT",
    movingDate: "2026-12-15",
    daysRemaining: 47,
    progress: 64,
    totalTasks: 14,
    completedTasks: 9,
    inProgressTasks: 3,
    todoTasks: 2,
    sidebarIcon: "home",
    tasks: [
      {
        id: "t-1",
        title: "Apostilar documentos civis e acadêmicos em Cartório",
        description: "Apostila de Haia para certidões, diplomas e antecedentes",
        dueDate: "2026-10-20",
        status: "DONE",
        icon: "doc-check",
      },
      {
        id: "t-2",
        title: "Solicitar NIF e abertura de conta bancária em Portugal",
        description: "Representante fiscal confirmado e IBAN português ativo",
        dueDate: "2026-10-28",
        status: "DONE",
        icon: "circle-check",
      },
      {
        id: "t-3",
        title: "Contratar container marítimo compartilhado (LCL)",
        description: "Comparando 3 cotações porta-a-porta Santos → Porto de Lisboa",
        dueDate: "2026-11-12",
        status: "IN_PROGRESS",
        icon: "truck",
        highlighted: true,
      },
      {
        id: "t-4",
        title: "Inventariar caixas por cômodo para alfândega ( Certificado de Bagagem )",
        description: "Lista detalhada de bens de uso pessoal para isenção de IVA",
        dueDate: "2026-11-20",
        status: "IN_PROGRESS",
        icon: "box",
      },
      {
        id: "t-5",
        title: "Agendar desligamento de energia (Enel), gás (Comgás) e fibra",
        description: "Executar 48h antes do voo · Sem multa fidelidade",
        dueDate: "2026-12-10",
        status: "TODO",
        icon: "key",
      },
      {
        id: "t-6",
        title: "Realizar vistoria final e entrega das chaves em São Paulo",
        description: "Assinar laudo de saída com imobiliária e encerrar seguro incêndio",
        dueDate: "2026-12-14",
        status: "TODO",
        icon: "inspect",
      },
    ],
    copilotSuggestions: [
      {
        id: "cs-1",
        title: "Solicitar PB4 (Seguro Saúde Internacional)",
        dueDate: "2026-11-18",
        selected: true,
      },
      {
        id: "cs-2",
        title: "Emitir CNH Internacional (PID) no Detran",
        dueDate: "2026-11-25",
        selected: true,
      },
      {
        id: "cs-3",
        title: "Transferir titularidade de água (EPAL Lisboa)",
        dueDate: "2026-12-12",
        selected: true,
      },
    ],
  },
  {
    id: "mp-pinheiros",
    slug: "pinheiros",
    sidebarTitle: "Entrega Ap. Pinheiros",
    title: "Entrega Ap. Pinheiros — Rua dos Pinheiros.",
    origin: "São Paulo, Pinheiros (Brasil)",
    destination: "São Paulo, Vila Madalena (Brasil)",
    shortRoute: "Pinheiros, SP → Vila Madalena, SP",
    movingDate: "2027-02-10",
    daysRemaining: 100,
    progress: 33,
    totalTasks: 9,
    completedTasks: 3,
    inProgressTasks: 2,
    todoTasks: 4,
    sidebarIcon: "doc",
    tasks: [
      {
        id: "tp-1",
        title: "Notificar imobiliária sobre aviso prévio de 30 dias",
        description: "Protocolo enviado via portal do inquilino",
        dueDate: "2027-01-10",
        status: "DONE",
        icon: "doc-check",
      },
      {
        id: "tp-2",
        title: "Orçar pintura interna e reparos de marcenaria",
        description: "Padrão de vistoria exigido no contrato",
        dueDate: "2027-01-25",
        status: "IN_PROGRESS",
        icon: "inspect",
        highlighted: true,
      },
      {
        id: "tp-3",
        title: "Agendar caminhão de mudança local e seguro de carga",
        description: "Reserva de elevador de serviço no condomínio",
        dueDate: "2027-02-05",
        status: "TODO",
        icon: "truck",
      },
    ],
    copilotSuggestions: [
      {
        id: "csp-1",
        title: "Solicitar declaração de quitação condominial",
        dueDate: "2027-02-01",
        selected: true,
      },
      {
        id: "csp-2",
        title: "Transferir titularidade da conta Enel SP",
        dueDate: "2027-02-08",
        selected: true,
      },
    ],
  },
  {
    id: "mp-deposito",
    slug: "deposito",
    sidebarTitle: "Depósito Temporário",
    title: "Depósito Temporário — Self Storage Moema.",
    origin: "São Paulo, SP (Brasil)",
    destination: "Box 42 · Moema Storage (Brasil)",
    shortRoute: "São Paulo, SP → Moema Storage",
    movingDate: "2026-11-28",
    daysRemaining: 26,
    progress: 80,
    totalTasks: 5,
    completedTasks: 4,
    inProgressTasks: 1,
    todoTasks: 0,
    sidebarIcon: "box",
    tasks: [
      {
        id: "td-1",
        title: "Assinar contrato de locação trimestral do box 12m³",
        description: "Acesso biométrico liberado 24h",
        dueDate: "2026-11-05",
        status: "DONE",
        icon: "circle-check",
      },
      {
        id: "td-2",
        title: "Embalar livros e quadros com proteção anti-umidade",
        description: "Caixas plásticas seladas com sílica gel",
        dueDate: "2026-11-20",
        status: "IN_PROGRESS",
        icon: "box",
        highlighted: true,
      },
    ],
    copilotSuggestions: [
      {
        id: "csd-1",
        title: "Fotografar lacres numerados das caixas de valor",
        dueDate: "2026-11-25",
        selected: true,
      },
    ],
  },
]

export const BERLIN_STEP2_SUGGESTIONS: CopilotSuggestion[] = [
  {
    id: "ber-1",
    title: "Solicitar Visto Nacional (D) no Consulado Geral da Alemanha",
    category: "VISTOS",
    description:
      "Reunir comprovante de renda, apólice de saúde e agendar entrevista presencial em SP.",
    dueDate: "2026-11-20",
    selected: true,
  },
  {
    id: "ber-2",
    title: "Apostilar certidões e histórico escolar (Apostila de Haia)",
    category: "DOCUMENTOS",
    description:
      "Encaminhar ao tradutor juramentado para alemão exigido pelo órgão regulador.",
    dueDate: "2026-11-28",
    selected: true,
  },
  {
    id: "ber-3",
    title: "Notificar rescisão do contrato de aluguel atual em SP",
    category: "MORADIA",
    description:
      "Enviar notificação formal à imobiliária com aviso prévio de 30 dias e agendar vistoria.",
    dueDate: "2026-12-05",
    selected: true,
  },
  {
    id: "ber-4",
    title: "Contratar frete internacional e desembaraço aduaneiro",
    category: "LOGÍSTICA",
    description:
      "Comparar cotações para carga LCL e redigir lista de bens de uso pessoal (Zoll).",
    dueDate: "2026-12-15",
    selected: true,
  },
  {
    id: "ber-5",
    title: "Vender móveis e eletrodomésticos incompatíveis (110V vs 230V)",
    category: "DESCARTE",
    description:
      "Item desmarcado: não será persistido na confirmação do lote.",
    dueDate: "2026-12-28",
    selected: false,
  },
  {
    id: "ber-6",
    title: "Abrir conta corrente com IBAN alemão e transferir euros",
    category: "FINANÇAS",
    description:
      "Habilitar IBAN DE para débito em conta de caução (Kaution) e contratos de telefonia.",
    dueDate: "2027-01-08",
    selected: true,
  },
  {
    id: "ber-7",
    title: "Agendar Anmeldung no Bürgeramt de Kreuzberg",
    category: "REGISTRO CIVIL",
    description:
      "Obrigatório nos primeiros 14 dias após chegada com Wohnungsgeberbestätigung.",
    dueDate: "2027-01-10",
    selected: true,
  },
  {
    id: "ber-8",
    title: "Contratar seguro saúde alemão (TK / AOK) para residência",
    category: "SAÚDE",
    description:
      "Substituir seguro viagem temporário pela cobertura estatutária alemã.",
    dueDate: "2027-01-12",
    selected: true,
  },
  {
    id: "ber-9",
    title: "Cancelar assinaturas locais e planos de academia no Brasil",
    category: "SERVIÇOS",
    description:
      "Item desmarcado: não será persistido na confirmação do lote.",
    dueDate: "2027-01-05",
    selected: false,
  },
  {
    id: "ber-10",
    title: "Confirmar traslado aeroporto BER e entrega das chaves",
    category: "CHEGADA",
    description:
      "Alinhar horário de check-in com proprietário em Berlim e protocolo de medidores.",
    dueDate: "2027-01-14",
    selected: true,
  },
]
