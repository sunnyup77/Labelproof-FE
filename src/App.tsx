import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UploadPage } from './pages/UploadPage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { StatsPage } from './pages/StatsPage';
import { EmptyState } from './components/ErrorState';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="container">
      <EmptyState
        title="Page not found"
        description="The page you're looking for doesn't exist."
        action={<Link to="/" className="btn btn-primary">Go to upload</Link>}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"               element={<UploadPage />} />
          <Route path="/scans/:scanId"  element={<ReportPage />} />
          <Route path="/history"        element={<HistoryPage />} />
          <Route path="/stats"          element={<StatsPage />} />
          <Route path="*"               element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
