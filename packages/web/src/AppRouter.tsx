import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { setupApi } from './api/setup.api';
import { GitHubSetup } from './components/GitHubSetup';
import { Layout } from './components/Layout';
import { PageList } from './components/PageList';
import { PageEditor } from './components/PageEditor';
import { DatabaseView } from './components/DatabaseView';

function ProtectedRoutes() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const status = await setupApi.checkStatus();
      setIsConfigured(status.configured);
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setIsConfigured(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#718096'
      }}>
        Loading...
      </div>
    );
  }

  if (!isConfigured) {
    return <GitHubSetup />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<PageList />} />
        <Route path="/page/new" element={<PageEditor />} />
        <Route path="/page/:id" element={<PageEditor />} />
        <Route path="/database/new" element={<DatabaseView />} />
        <Route path="/database/:id" element={<DatabaseView />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <ProtectedRoutes />
    </BrowserRouter>
  );
}
