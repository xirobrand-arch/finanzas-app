import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import type {
  FinanceState, Transaction, Account, Budget, FinancialGoal,
  CreditCard, Debt, Alert, Category, UserSettings,
} from '../types';
import { defaultCategories } from '../utils/categories';
import { loadState, saveState } from '../services/storage';

const defaultAccounts: Account[] = [
  { id: 'cash', name: 'Efectivo', type: 'cash', balance: 0, icon: '💵', color: '#22c55e' },
  { id: 'bank', name: 'Banco', type: 'bank', balance: 0, icon: '🏦', color: '#3b82f6' },
  { id: 'yape', name: 'Yape', type: 'yape', balance: 0, icon: '📱', color: '#7c3aed' },
  { id: 'plin', name: 'Plin', type: 'plin', balance: 0, icon: '📲', color: '#06b6d4' },
  { id: 'savings', name: 'Cuenta de ahorro', type: 'savings', balance: 0, icon: '🏧', color: '#f59e0b' },
];

const defaultSettings: UserSettings = {
  currency: 'PEN',
  currencySymbol: 'S/',
  monthlyBudgetTotal: 5000,
  userName: '',
};

function getInitialState(): FinanceState {
  return {
    transactions: loadState('transactions', []),
    categories: loadState('categories', defaultCategories),
    accounts: loadState('accounts', defaultAccounts),
    budgets: loadState('budgets', []),
    goals: loadState('goals', []),
    creditCards: loadState('creditCards', []),
    debts: loadState('debts', []),
    alerts: loadState('alerts', []),
    settings: loadState('settings', defaultSettings),
    isAuthenticated: loadState('isAuthenticated', false),
  };
}

type Action =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'ADD_ACCOUNT'; payload: Omit<Account, 'id'> }
  | { type: 'UPDATE_ACCOUNT'; payload: Account }
  | { type: 'DELETE_ACCOUNT'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'ADD_BUDGET'; payload: Omit<Budget, 'id'> }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'ADD_GOAL'; payload: Omit<FinancialGoal, 'id'> }
  | { type: 'UPDATE_GOAL'; payload: FinancialGoal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_CREDIT_CARD'; payload: Omit<CreditCard, 'id'> }
  | { type: 'UPDATE_CREDIT_CARD'; payload: CreditCard }
  | { type: 'DELETE_CREDIT_CARD'; payload: string }
  | { type: 'ADD_DEBT'; payload: Omit<Debt, 'id'> }
  | { type: 'UPDATE_DEBT'; payload: Debt }
  | { type: 'DELETE_DEBT'; payload: string }
  | { type: 'ADD_ALERT'; payload: Omit<Alert, 'id'> }
  | { type: 'DISMISS_ALERT'; payload: string }
  | { type: 'CLEAR_ALERTS' }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'LOGIN'; payload: string }
  | { type: 'LOGOUT' };

function updateAccountBalance(
  accounts: Account[],
  accountId: string,
  amount: number,
  isAdd: boolean,
): Account[] {
  return accounts.map((a) =>
    a.id === accountId ? { ...a, balance: a.balance + (isAdd ? amount : -amount) } : a,
  );
}

function reducer(state: FinanceState, action: Action): FinanceState {
  switch (action.type) {
    case 'ADD_TRANSACTION': {
      const tx: Transaction = { ...action.payload, id: uuid(), createdAt: new Date().toISOString() };
      const isIncome = tx.type === 'income';
      const accounts = updateAccountBalance(state.accounts, tx.accountId, tx.amount, isIncome);
      return { ...state, transactions: [tx, ...state.transactions], accounts };
    }
    case 'UPDATE_TRANSACTION': {
      const old = state.transactions.find((t) => t.id === action.payload.id);
      let accounts = state.accounts;
      if (old) {
        const wasIncome = old.type === 'income';
        accounts = updateAccountBalance(accounts, old.accountId, old.amount, !wasIncome);
        const isIncome = action.payload.type === 'income';
        accounts = updateAccountBalance(accounts, action.payload.accountId, action.payload.amount, isIncome);
      }
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === action.payload.id ? action.payload : t)),
        accounts,
      };
    }
    case 'DELETE_TRANSACTION': {
      const tx = state.transactions.find((t) => t.id === action.payload);
      let accounts = state.accounts;
      if (tx) {
        const wasIncome = tx.type === 'income';
        accounts = updateAccountBalance(accounts, tx.accountId, tx.amount, !wasIncome);
      }
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
        accounts,
      };
    }
    case 'ADD_ACCOUNT':
      return { ...state, accounts: [...state.accounts, { ...action.payload, id: uuid() }] };
    case 'UPDATE_ACCOUNT':
      return { ...state, accounts: state.accounts.map((a) => (a.id === action.payload.id ? action.payload : a)) };
    case 'DELETE_ACCOUNT':
      return { ...state, accounts: state.accounts.filter((a) => a.id !== action.payload) };
    case 'SET_BUDGETS':
      return { ...state, budgets: action.payload };
    case 'ADD_BUDGET':
      return { ...state, budgets: [...state.budgets, { ...action.payload, id: uuid() }] };
    case 'UPDATE_BUDGET':
      return { ...state, budgets: state.budgets.map((b) => (b.id === action.payload.id ? action.payload : b)) };
    case 'DELETE_BUDGET':
      return { ...state, budgets: state.budgets.filter((b) => b.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, { ...action.payload, id: uuid() }] };
    case 'UPDATE_GOAL':
      return { ...state, goals: state.goals.map((g) => (g.id === action.payload.id ? action.payload : g)) };
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };
    case 'ADD_CREDIT_CARD':
      return { ...state, creditCards: [...state.creditCards, { ...action.payload, id: uuid() }] };
    case 'UPDATE_CREDIT_CARD':
      return { ...state, creditCards: state.creditCards.map((c) => (c.id === action.payload.id ? action.payload : c)) };
    case 'DELETE_CREDIT_CARD':
      return { ...state, creditCards: state.creditCards.filter((c) => c.id !== action.payload) };
    case 'ADD_DEBT':
      return { ...state, debts: [...state.debts, { ...action.payload, id: uuid() }] };
    case 'UPDATE_DEBT':
      return { ...state, debts: state.debts.map((d) => (d.id === action.payload.id ? action.payload : d)) };
    case 'DELETE_DEBT':
      return { ...state, debts: state.debts.filter((d) => d.id !== action.payload) };
    case 'ADD_ALERT':
      return { ...state, alerts: [{ ...action.payload, id: uuid() }, ...state.alerts] };
    case 'DISMISS_ALERT':
      return { ...state, alerts: state.alerts.map((a) => (a.id === action.payload ? { ...a, read: true } : a)) };
    case 'CLEAR_ALERTS':
      return { ...state, alerts: [] };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, { ...action.payload, id: uuid(), isCustom: true }] };
    case 'UPDATE_CATEGORY':
      return { ...state, categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)) };
    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'LOGIN':
      return { ...state, isAuthenticated: true, settings: { ...state.settings, userName: action.payload } };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    default:
      return state;
  }
}

interface FinanceContextValue {
  state: FinanceState;
  dispatch: React.Dispatch<Action>;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => { saveState('transactions', state.transactions); }, [state.transactions]);
  useEffect(() => { saveState('categories', state.categories); }, [state.categories]);
  useEffect(() => { saveState('accounts', state.accounts); }, [state.accounts]);
  useEffect(() => { saveState('budgets', state.budgets); }, [state.budgets]);
  useEffect(() => { saveState('goals', state.goals); }, [state.goals]);
  useEffect(() => { saveState('creditCards', state.creditCards); }, [state.creditCards]);
  useEffect(() => { saveState('debts', state.debts); }, [state.debts]);
  useEffect(() => { saveState('alerts', state.alerts); }, [state.alerts]);
  useEffect(() => { saveState('settings', state.settings); }, [state.settings]);
  useEffect(() => { saveState('isAuthenticated', state.isAuthenticated); }, [state.isAuthenticated]);

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used inside FinanceProvider');
  return ctx;
}
