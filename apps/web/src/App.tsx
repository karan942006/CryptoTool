import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './pages/LandingPage';
import { Login, Register, ForgotPassword, Onboarding } from './pages/AuthPages';
import { MainDashboard } from './pages/MainDashboard';
import { AssetsPage, AddAssetPage, AssetDetailsPage } from './pages/AssetsPages';
import { StartScanPage, ScanProgressPage, ScanResultsPage, ScanHistoryPage } from './pages/ScanPages';
import { CryptoBOMPage, CryptoInventoryPage } from './pages/CryptoBOMPages';
import { FindingsPage, FindingDetailsPage } from './pages/FindingsPages';
import { RiskDashboardPage } from './pages/RiskDashboardPage';
import { AISecurityAnalystPage } from './pages/AISecurityAnalystPage';
import { PQCReadinessPage } from './pages/PQCReadinessPage';
import { CertificatesPage } from './pages/CertificatesPage';
import { ReportsPage, ReportDetailsPage } from './pages/ReportsPages';
import { TeamUsersPage, SettingsPage, AuditLogsPage, CryptoTalkDemoPage } from './pages/AdminPages';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Authenticated / Console Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/assets/new" element={<AddAssetPage />} />
            <Route path="/assets/:id" element={<AssetDetailsPage />} />
            <Route path="/scans/new" element={<StartScanPage />} />
            <Route path="/scans/progress/:id" element={<ScanProgressPage />} />
            <Route path="/scans/results/:id" element={<ScanResultsPage />} />
            <Route path="/scans/history" element={<ScanHistoryPage />} />
            <Route path="/crypto-bom" element={<CryptoBOMPage />} />
            <Route path="/crypto-inventory" element={<CryptoInventoryPage />} />
            <Route path="/findings" element={<FindingsPage />} />
            <Route path="/findings/:id" element={<FindingDetailsPage />} />
            <Route path="/risk" element={<RiskDashboardPage />} />
            <Route path="/ai-analyst" element={<AISecurityAnalystPage />} />
            <Route path="/pqc" element={<PQCReadinessPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailsPage />} />
            <Route path="/team" element={<TeamUsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/demo/cryptotalk" element={<CryptoTalkDemoPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
};
