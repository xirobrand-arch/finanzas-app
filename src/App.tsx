import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider, useFinance } from './store/FinanceContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import BudgetPage from './pages/BudgetPage';
import ChartsPage from './pages/ChartsPage';
import CalendarPage from './pages/CalendarPage';
import IncomePage from './pages/IncomePage';
import AccountsPage from './pages/AccountsPage';
import CreditCardsPage from './pages/CreditCardsPage';
import DebtsPage from './pages/DebtsPage';
import GoalsPage from './pages/GoalsPage';
import LeaksPage from './pages/LeaksPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';

function AppRoutes() {
  const { state } = useFinance();

  if (!state.isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/charts" element={<ChartsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/income" element={<IncomePage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/credit-cards" element={<CreditCardsPage />} />
        <Route path="/debts" element={<DebtsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/leaks" element={<LeaksPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <AppRoutes />
      </FinanceProvider>
    </BrowserRouter>
  );
}
