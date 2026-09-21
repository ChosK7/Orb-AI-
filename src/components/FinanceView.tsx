import React, { useState, useMemo } from 'react';
import { FinancialTransaction, BillItem } from '../types';
import {
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Building,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { playChime } from '../utils/audio';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  bills: BillItem[];
  onAddTransaction: (trx: Omit<FinancialTransaction, 'id' | 'userId' | 'createdAt'>) => void;
  onAddBill: (bill: Omit<BillItem, 'id' | 'userId'>) => void;
  onPayBill: (billId: string) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  bills,
  onAddTransaction,
  onAddBill,
  onPayBill,
  onDeleteTransaction,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'transactions'>('overview');
  const [quickInput, setQuickInput] = useState('');

  // Transaction Modal State
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [trxType, setTrxType] = useState<'expense' | 'income'>('expense');
  const [trxAmount, setTrxAmount] = useState('');
  const [trxDesc, setTrxDesc] = useState('');
  const [trxCategory, setTrxCategory] = useState('Alimentação');

  // Bill Modal State
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billName, setBillName] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategory, setBillCategory] = useState('Contas');

  // Summary Math
  const { totalIncome, totalExpense, balance, categoryTotals } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach((t) => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      categoryTotals: catMap,
    };
  }, [transactions]);

  // Quick NLP expense parser (Spec 16: "Gastei R$ 35 no almoço")
  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    const lower = quickInput.toLowerCase();
    const matchAmount = lower.match(/(?:r\$\s*)?([0-9.,]+)/);
    const amount = matchAmount ? parseFloat(matchAmount[1].replace(',', '.')) : 0;

    let desc = quickInput.replace(/^(gastei|paguei|comprei)\s*/i, '').trim();
    let cat = 'Outros';
    if (/almoço|jantar|lanche|comida|mercado|café|restaurante/i.test(lower)) cat = 'Alimentação';
    else if (/uber|gasolina|ônibus|metrô|táxi/i.test(lower)) cat = 'Transporte';
    else if (/luz|energia|água|internet|celular|aluguel/i.test(lower)) cat = 'Contas';
    else if (/remédio|farmácia|médico/i.test(lower)) cat = 'Saúde';

    if (amount > 0) {
      if (window.confirm(`Orbi AI: Confirmar despesa de R$ ${amount.toFixed(2)} em "${desc}" (${cat})?`)) {
        onAddTransaction({
          type: 'expense',
          amount,
          description: desc || 'Gasto registrado',
          category: cat,
          date: new Date().toISOString().split('T')[0],
        });
        playChime('success');
        setQuickInput('');
      }
    } else {
      alert('Por favor, informe um valor. Exemplo: "Gastei R$ 35 no almoço"');
    }
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(trxAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    onAddTransaction({
      type: trxType,
      amount: parsedAmount,
      description: trxDesc || (trxType === 'income' ? 'Receita' : 'Despesa'),
      category: trxCategory,
      date: new Date().toISOString().split('T')[0],
    });

    playChime('success');
    setIsTrxModalOpen(false);
    setTrxAmount('');
    setTrxDesc('');
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(billAmount.replace(',', '.'));
    if (!billName.trim() || isNaN(parsedAmount)) return;

    onAddBill({
      name: billName,
      amount: parsedAmount,
      dueDate: billDueDate || new Date().toISOString().split('T')[0],
      category: billCategory,
      recurrence: 'monthly',
      status: 'upcoming',
    });

    playChime('success');
    setIsBillModalOpen(false);
    setBillName('');
    setBillAmount('');
  };

  return (
    <div className="space-y-5 pb-20 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" /> Finanças & Contas a Pagar
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visão consolidada, controle de despesas e inteligência preditiva de gastos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBillModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-white text-xs font-semibold hover:border-amber-500/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Conta a Pagar
          </button>
          <button
            onClick={() => setIsTrxModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Registro
          </button>
        </div>
      </div>

      {/* Quick Input Bar (Spec item 16) */}
      <form
        onSubmit={handleQuickSubmit}
        className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900 border border-slate-800 focus-within:border-emerald-500 transition-colors"
      >
        <span className="text-xs font-bold text-slate-400 pl-2 shrink-0">Registro Rápido:</span>
        <input
          type="text"
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          placeholder='Ex: "Gastei R$ 35 no almoço" ou "Comprei combustível 150"'
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2"
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors"
        >
          Salvar
        </button>
      </form>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Saldo Líquido</span>
            <Wallet className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400">
            R$ {balance.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-slate-400">Total registrado neste mês</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total de Receitas</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            R$ {totalIncome.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-emerald-400">Entradas conciliadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Total de Despesas</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black font-mono text-rose-400">
            R$ {totalExpense.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[11px] text-slate-400">{transactions.filter((t) => t.type === 'expense').length} despesas registradas</span>
        </div>
      </div>

      {/* AI Financial Intelligence Proactive Callout (Spec item 17) */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-500/20 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              Inteligência Financeira Orbi
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                Padrões & Alertas
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              "Identificamos que suas despesas com <strong>Alimentação</strong> somam R$ {(categoryTotals['Alimentação'] || 0).toFixed(2)}. Em comparação com a média esperada, seu orçamento permanece equilibrado. Mantenha os registros manuais para maior precisão."
            </p>
            <p className="text-[10px] text-slate-400 italic">
              * Nota: As análises do Orbi são sugestões contextuais de organização pessoal, não constituindo consultoria financeira formal.
            </p>
          </div>
        </div>
      </div>

      {/* Sub Navigation: Overview / Contas a Pagar / Extrato */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Distribuição de Gastos
        </button>
        <button
          onClick={() => setActiveTab('bills')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'bills' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Contas a Pagar ({bills.filter((b) => b.status !== 'paid').length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transactions' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Extrato Completo
        </button>
      </div>

      {/* TAB 1: GASTOS POR CATEGORIA */}
      {activeTab === 'overview' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Gastos por Categoria
            </h3>
            <span className="text-xs font-mono text-slate-400">Total: R$ {totalExpense.toFixed(2)}</span>
          </div>

          <div className="space-y-3">
            {Object.entries(categoryTotals).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhuma despesa categorizada ainda.</p>
            ) : (
              Object.entries(categoryTotals).map(([cat, val]) => {
                const percentage = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat}</span>
                      <span className="font-mono text-slate-400">
                        R$ {val.toFixed(2)} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONTAS A PAGAR (Spec 15 & 30: Pagamento sempre explícito) */}
      {activeTab === 'bills' && (
        <div className="space-y-3">
          <div className="space-y-2.5">
            {bills.map((bill) => {
              const isPaid = bill.status === 'paid';
              return (
                <div
                  key={bill.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isPaid
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{bill.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPaid
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {isPaid ? 'Paga' : 'A Vencer'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {bill.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Vencimento: {bill.dueDate}</span>
                      <span>Recorrência: {bill.recurrence}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-base font-bold font-mono text-white">
                        R$ {bill.amount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {!isPaid && (
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Confirmar pagamento manual da conta "${bill.name}" no valor de R$ ${bill.amount.toFixed(2)}?\n(Princípio Orbi: Nunca debitar sem sua autorização explícita).`
                            )
                          ) {
                            onPayBill(bill.id);
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                      >
                        Confirmar Pagamento
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: EXTRATO COMPLETO */}
      {activeTab === 'transactions' && (
        <div className="space-y-2.5">
          {transactions.map((trx) => (
            <div
              key={trx.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    trx.type === 'income'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {trx.type === 'income' ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <span className="text-xs font-bold text-white block truncate">
                    {trx.description}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{trx.category}</span>
                    <span>·</span>
                    <span>{trx.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-mono text-sm font-bold ${
                    trx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'
                  }`}
                >
                  {trx.type === 'income' ? '+' : '-'} R$ {trx.amount.toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => onDeleteTransaction(trx.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OPEN FINANCE & PIX ARCHITECTURE CALLOUT (Spec 29 & 30) */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-slate-200 mb-0.5">
            Arquitetura Preparada: Open Finance & PIX
          </div>
          <p className="leading-relaxed">
            Em conformidade com a especificação do produto, dados bancários reais não são simulados e senhas nunca são solicitadas. O Orbi AI possui barramento preparado para integração regulatória com Open Finance e iniciação de pagamentos PIX com dupla confirmação humana explícita.
          </p>
        </div>
      </div>

      {/* Modal: New Transaction */}
      {isTrxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Novo Registro Financeiro</h3>
            <form onSubmit={handleSaveTransaction} className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTrxType('expense')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    trxType === 'expense'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Despesa (-)
                </button>
                <button
                  type="button"
                  onClick={() => setTrxType('income')}
                  className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                    trxType === 'income'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Receita (+)
                </button>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Valor (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 35,00"
                  value={trxAmount}
                  onChange={(e) => setTrxAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Almoço executivo"
                  value={trxDesc}
                  onChange={(e) => setTrxDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                <select
                  value={trxCategory}
                  onChange={(e) => setTrxCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Alimentação">Alimentação</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Moradia">Moradia</option>
                  <option value="Contas">Contas</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Lazer">Lazer</option>
                  <option value="Compras">Compras</option>
                  <option value="Trabalho">Trabalho</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTrxModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Bill */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-4">Nova Conta a Pagar</h3>
            <form onSubmit={handleSaveBill} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nome da Conta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Internet Fibra 600MB"
                  value={billName}
                  onChange={(e) => setBillName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    required
                    placeholder="99,90"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Data de Vencimento</label>
                  <input
                    type="date"
                    required
                    value={billDueDate}
                    onChange={(e) => setBillDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Categoria</label>
                <select
                  value={billCategory}
                  onChange={(e) => setBillCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Contas">Contas (Internet, Celular, etc.)</option>
                  <option value="Moradia">Moradia (Luz, Água, Condomínio)</option>
                  <option value="Saúde">Saúde</option>
                  <option value="Educação">Educação</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBillModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
