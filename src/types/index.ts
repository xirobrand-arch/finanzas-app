export type TransactionType = 'income' | 'expense' | 'transfer' | 'saving' | 'investment';

export type NecessityLevel = 'yes' | 'no' | 'unsure';

export type PaymentMethod =
  | 'cash'
  | 'yape'
  | 'plin'
  | 'debit_card'
  | 'credit_card'
  | 'bank_transfer'
  | 'other';

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
  subcategories: Subcategory[];
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  time: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  paymentMethod: PaymentMethod;
  accountId: string;
  isNecessary: NecessityLevel;
  isRecurring: boolean;
  notes?: string;
  createdAt: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'yape' | 'plin' | 'card' | 'savings' | 'business';
  balance: number;
  icon: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  limit: number;
  month: number;
  year: number;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  usedBalance: number;
  cutoffDate: number;
  paymentDate: number;
  color: string;
}

export interface Debt {
  id: string;
  creditor: string;
  initialAmount: number;
  currentBalance: number;
  monthlyPayment: number;
  interestRate: number;
  dueDate: string;
  totalInstallments: number;
  paidInstallments: number;
  status: 'active' | 'paid' | 'overdue';
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface UserSettings {
  currency: string;
  currencySymbol: string;
  monthlyBudgetTotal: number;
  userName: string;
}

export interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  budgets: Budget[];
  goals: FinancialGoal[];
  creditCards: CreditCard[];
  debts: Debt[];
  alerts: Alert[];
  settings: UserSettings;
  isAuthenticated: boolean;
}
