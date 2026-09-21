import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client with required telemetry header
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
    }
  }
  return aiClient;
}

// Fallback rule-based NLP interpreter if Gemini key is missing or offline
function localRuleBasedInterpreter(message: string, context: any) {
  const lower = message.toLowerCase().trim();

  // Ambiguity check: "me lembra amanhã" without subject
  if (/^(me\s+lembr[ae]|lembrar)(\s+amanhã|\s+depois|\s+hoje)?$/i.test(lower)) {
    return {
      intent: "NEED_CLARIFICATION",
      reply: "Claro! Sobre o que exatamente você gostaria de ser lembrado?",
      requiresConfirmation: false,
    };
  }

  // Reminder: "lembre de ...", "lembrar de ..."
  const reminderMatch = lower.match(/(?:me\s+)?lembr(?:e|ar)\s+(?:de\s+)?(.+?)(?:\s+(?:às|as|no dia|dia|amanhã|hoje)\s*(.*))?$/i);
  if (reminderMatch && !lower.includes("pagar")) {
    const title = reminderMatch[1]?.trim() || "Lembrete";
    const timeInfo = reminderMatch[2]?.trim() || "10:00";
    return {
      intent: "CREATE_REMINDER",
      requiresConfirmation: true,
      actionType: "CREATE_REMINDER",
      actionPayload: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        time: timeInfo.includes(":") ? timeInfo : "09:00",
        date: lower.includes("amanhã") ? "amanhã" : "hoje",
      },
      reply: `Entendi o lembrete para "${title}". Deseja confirmar?`,
    };
  }

  // Bills / Contas: "lembre de pagar a internet dia 10", "conta de luz vence amanhã"
  const billMatch = lower.match(/(?:pagar|conta\s+de?)\s+([a-zá-ú0-9\s]+?)(?:\s+(?:dia|valor|de)\s*(.*))?$/i);
  if (billMatch && (lower.includes("pagar") || lower.includes("conta"))) {
    const name = billMatch[1]?.trim() || "Conta";
    return {
      intent: "CREATE_BILL",
      requiresConfirmation: true,
      actionType: "CREATE_BILL",
      actionPayload: {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: 99.9,
        dueDate: "Em 2 dias",
        category: "Contas",
      },
      reply: `Identifiquei a conta de "${name}". Deseja cadastrar para acompanhamento de vencimento?`,
    };
  }

  // Expense: "gastei 35 no almoço", "comprei cafe 12"
  const expenseMatch = lower.match(/(?:gastei|paguei|comprei)\s+(?:r\$\s*)?([0-9.,]+)(?:\s+(?:no|na|com|em)\s*(.+))?/i);
  if (expenseMatch) {
    const amount = parseFloat(expenseMatch[1].replace(",", "."));
    const desc = expenseMatch[2]?.trim() || "Gasto geral";
    let cat = "Outros";
    if (/almoço|jantar|lanche|restaurante|comida|café|mercado/i.test(desc)) cat = "Alimentação";
    else if (/uber|gasolina|ônibus|metrô|táxi/i.test(desc)) cat = "Transporte";
    else if (/farmácia|remédio|médico/i.test(desc)) cat = "Saúde";

    return {
      intent: "ADD_TRANSACTION",
      requiresConfirmation: true,
      actionType: "ADD_TRANSACTION",
      actionPayload: {
        type: "expense",
        amount: isNaN(amount) ? 0 : amount,
        description: desc.charAt(0).toUpperCase() + desc.slice(1),
        category: cat,
      },
      reply: `Entendi: registro de despesa de R$ ${amount.toFixed(2)} em "${desc}" (${cat}). Confirmar registro?`,
    };
  }

  // Event / Meeting: "marque uma reunião amanhã às 9", "dentista amanhã 14h"
  const eventMatch = lower.match(/(?:marcar?|agendar?|consulta|reunião)\s*(.*?)(?:\s+(?:amanhã|hoje|segunda|terça|quarta|quinta|sexta|sábado|domingo))?(?:\s+(?:às|as)\s*([0-9]{1,2}(?::[0-9]{2}|h)?))?/i);
  if (eventMatch && (lower.includes("reunião") || lower.includes("consulta") || lower.includes("dentista") || lower.includes("marcar") || lower.includes("agenda"))) {
    const rawTitle = lower.includes("dentista") ? "Consulta Dentista" : lower.includes("reunião") ? "Reunião de Alinhamento" : "Compromisso";
    return {
      intent: "CREATE_EVENT",
      requiresConfirmation: true,
      actionType: "CREATE_EVENT",
      actionPayload: {
        title: rawTitle,
        time: lower.match(/([0-9]{1,2}(?::[0-9]{2}|h))/)?.[1] || "14:00",
        durationMinutes: 60,
        date: lower.includes("amanhã") ? "amanhã" : "hoje",
        priority: "important",
      },
      reply: `Entendi: criar o compromisso "${rawTitle}". Deseja confirmar na sua agenda?`,
    };
  }

  // Alarm: "crie um alarme para 6 horas", "alarme 7h"
  const alarmMatch = lower.match(/alarme.*?([0-9]{1,2}(?::[0-9]{2}|h)?)/i);
  if (alarmMatch) {
    const time = alarmMatch[1].replace("h", ":00");
    return {
      intent: "CREATE_ALARM",
      requiresConfirmation: true,
      actionType: "CREATE_ALARM",
      actionPayload: {
        time: time.includes(":") ? time : `${time}:00`,
        label: "Alarme Orbi",
        days: ["Seg", "Ter", "Qua", "Qui", "Sex"],
      },
      reply: `Programar alarme para ${time}?`,
    };
  }

  // Task: "criar tarefa comprar ração", "tarefa enviar relatório"
  if (lower.includes("tarefa") || lower.includes("fazer")) {
    const title = lower.replace(/^(criar\s+tarefa|tarefa|adicionar\s+tarefa|preciso)\s*/i, "").trim() || "Nova Tarefa";
    return {
      intent: "CREATE_TASK",
      requiresConfirmation: true,
      actionType: "CREATE_TASK",
      actionPayload: {
        title: title.charAt(0).toUpperCase() + title.slice(1),
        priority: lower.includes("urgente") ? "urgent" : "important",
        category: "Geral",
        status: "pending",
      },
      reply: `Deseja adicionar a tarefa "${title}" na sua lista?`,
    };
  }

  // Focus mode
  if (lower.includes("foco") || lower.includes("focus") || lower.includes("concentração")) {
    return {
      intent: "START_FOCUS_MODE",
      requiresConfirmation: true,
      actionType: "START_FOCUS_MODE",
      actionPayload: {
        durationMinutes: 45,
      },
      reply: `Identifiquei o pedido de foco. Deseja iniciar uma sessão de Modo Foco por 45 minutos com som ambiente?`,
    };
  }

  // Summary / Daily status
  if (lower.includes("o que tenho hoje") || lower.includes("meu dia") || lower.includes("resumo")) {
    return {
      intent: "GET_DAILY_SUMMARY",
      requiresConfirmation: false,
      reply: `Hoje você tem compromissos agendados, tarefas pendentes e contas sob controle no seu painel. Veja o resumo consolidado no topo do seu Orbi!`,
    };
  }

  // Default response
  return {
    intent: "GENERAL_ANSWER",
    requiresConfirmation: false,
    reply: `Sou o Orbi AI, seu assistente pessoal integrado. Posso organizar seus eventos, criar tarefas com prioridades, agendar lembretes e alarmes, registrar despesas e alertar sobre contas a vencer. Como posso ajudar agora?`,
  };
}

// System instructions for Orbi AI with Gemini
const ORBI_SYSTEM_PROMPT = `
Você é o Orbi AI — "Sua vida, em equilíbrio inteligente", o assistente pessoal integrado do usuário.
Você cuida de 4 pilares orbitais:
1. Tempo & Agenda (eventos, compromissos, lembretes, alarmes)
2. Tarefas & Produtividade (tarefas com prioridades 🔴 Urgente, 🟠 Importante, 🟡 Atenção, 🟢 Normal)
3. Finanças (receitas, despesas, contas a pagar, alertas de vencimento)
4. Bem-estar & Foco (tempo de tela, sessões de modo foco)

PRINCÍPIO FUNDAMENTAL DO ORBI:
SUGERIR → EXPLICAR → PEDIR CONFIRMAÇÃO → EXECUTAR.
Nunca execute mutações diretamente sem confirmação explícita se houver alteração de dados ou finanças.
Sempre que o usuário pedir para criar, agendar, registrar ou alterar algo, você DEVE retornar a intenção estruturada com:
- requiresConfirmation: true
- actionType: (CREATE_TASK | UPDATE_TASK | DELETE_TASK | CREATE_EVENT | UPDATE_EVENT | DELETE_EVENT | CREATE_REMINDER | CREATE_ALARM | ADD_TRANSACTION | CREATE_BILL | START_FOCUS_MODE)
- actionPayload: dados normalizados
- reply: texto amigável em português claro e conciso explicando o que foi entendido e perguntando "Confirmar?"

Se a solicitação for ambígua (ex: "me lembra amanhã" sem assunto), marque intent: "NEED_CLARIFICATION" e pergunte com gentileza o assunto.
Se o usuário perguntar sobre o que tem hoje ou finanças, retorne a resposta informativa e contextual.
NUNCA invente dados de bancos ou terceiros se não houver integração; declare com transparência.
Responda sempre em formato JSON rigoroso.
`;

// API endpoint for natural language / voice interaction with Orbi
app.post("/api/ai/process", async (req, res) => {
  const { message, userContext, history } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Mensagem obrigatória" });
  }

  const ai = getAIClient();

  if (!ai) {
    // If Gemini key is not configured, smoothly use the built-in local NLP interpreter
    const localResult = localRuleBasedInterpreter(message, userContext);
    return res.json({
      ...localResult,
      source: "local_engine",
      note: "Modo de processamento nativo ativo.",
    });
  }

  try {
    const prompt = `
Contexto atual do usuário:
- Data e Hora local: ${new Date().toLocaleString("pt-BR")}
- Nome: ${userContext?.name || "Usuário"}
- Tarefas pendentes: ${userContext?.pendingTasksCount || 0}
- Próximos eventos: ${userContext?.upcomingEventsSummary || "Nenhum"}
- Contas a vencer: ${userContext?.billsSummary || "Nenhuma"}

Mensagem do usuário:
"${message}"

Analise a intenção e responda em JSON com a estrutura:
{
  "intent": "CREATE_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "CREATE_EVENT" | "UPDATE_EVENT" | "DELETE_EVENT" | "CREATE_REMINDER" | "CREATE_ALARM" | "ADD_TRANSACTION" | "CREATE_BILL" | "GET_DAILY_SUMMARY" | "GET_FINANCIAL_SUMMARY" | "START_FOCUS_MODE" | "NEED_CLARIFICATION" | "GENERAL_ANSWER",
  "requiresConfirmation": boolean,
  "actionType": string | null,
  "actionPayload": object | null,
  "reply": string
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: ORBI_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const text = response.text?.trim() || "{}";
    const parsed = JSON.parse(text);
    return res.json({
      ...parsed,
      source: "gemini",
    });
  } catch (error: any) {
    console.error("Gemini API error in /api/ai/process, falling back to local engine:", error);
    const fallback = localRuleBasedInterpreter(message, userContext);
    return res.json({
      ...fallback,
      source: "local_engine_fallback",
    });
  }
});

// API endpoint for proactive AI suggestions based on user context
app.post("/api/ai/proactive-suggestions", async (req, res) => {
  const { events, tasks, bills, transactions, screenTime, userPreferences } = req.body;
  const ai = getAIClient();

  // Baseline rule-based proactive suggestions
  const fallbackSuggestions = [];

  // Check bills due soon
  if (Array.isArray(bills)) {
    const pendingBills = bills.filter((b: any) => b.status === "upcoming" || b.status === "overdue");
    if (pendingBills.length > 0) {
      fallbackSuggestions.push({
        id: "sug-bill-1",
        category: "finance",
        title: "Atenção a vencimentos",
        description: `Você tem ${pendingBills.length} conta(s) pendente(s), incluindo "${pendingBills[0].name}" (R$ ${Number(pendingBills[0].amount).toFixed(2)}).`,
        priority: "urgent",
        actionLabel: "Ver contas",
        actionTab: "finance",
      });
    }
  }

  // Check urgent tasks
  if (Array.isArray(tasks)) {
    const urgentTasks = tasks.filter((t: any) => t.status !== "completed" && (t.priority === "urgent" || t.priority === "important"));
    if (urgentTasks.length > 0) {
      fallbackSuggestions.push({
        id: "sug-task-1",
        category: "tasks",
        title: "Prioridades do dia",
        description: `Existem ${urgentTasks.length} tarefas de alta prioridade aguardando. Posso sugerir uma sessão de foco?`,
        priority: "important",
        actionLabel: "Organizar tarefas",
        actionTab: "tasks",
      });
    }
  }

  // Check calendar conflicts
  if (Array.isArray(events) && events.length >= 2) {
    // Check overlapping
    let conflict = false;
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (events[i].date === events[j].date && events[i].time === events[j].time) {
          conflict = true;
          fallbackSuggestions.push({
            id: `sug-conflict-${i}-${j}`,
            category: "agenda",
            title: "Conflito de agenda detectado",
            description: `Você tem dois compromissos agendados no mesmo horário (${events[i].time}): "${events[i].title}" e "${events[j].title}".`,
            priority: "urgent",
            actionLabel: "Resolver conflito",
            actionTab: "agenda",
          });
          break;
        }
      }
      if (conflict) break;
    }
  }

  // Well-being / focus suggestion
  fallbackSuggestions.push({
    id: "sug-focus-1",
    category: "focus",
    title: "Equilíbrio e Foco",
    description: "Sua meta de foco de hoje está aberta. Iniciar um bloco de 25 minutos para manter o ritmo sem cansaço?",
    priority: "normal",
    actionLabel: "Iniciar Foco",
    actionTab: "focus",
  });

  if (!ai) {
    return res.json({ suggestions: fallbackSuggestions });
  }

  try {
    const prompt = `
Gere 3 sugestões proativas contextualizadas e inteligentes para o usuário do Orbi AI com base nos seguintes dados reais:
- Eventos: ${JSON.stringify(events || [])}
- Tarefas: ${JSON.stringify(tasks || [])}
- Contas: ${JSON.stringify(bills || [])}
- Horário atual: ${new Date().toLocaleTimeString("pt-BR")}

Retorne exclusivamente JSON com array "suggestions", cada item com:
{
  "id": string,
  "category": "agenda" | "finance" | "tasks" | "focus",
  "title": string,
  "description": string,
  "priority": "urgent" | "important" | "attention" | "normal",
  "actionLabel": string,
  "actionTab": "agenda" | "tasks" | "finance" | "focus" | "orbi"
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      suggestions: parsed.suggestions?.length ? parsed.suggestions : fallbackSuggestions,
    });
  } catch (err) {
    return res.json({ suggestions: fallbackSuggestions });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    product: "Orbi AI",
    version: "1.0.0-mvp",
    aiAvailable: !!process.env.GEMINI_API_KEY,
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Orbi AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
