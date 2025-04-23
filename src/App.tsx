
import { BrowserRouter as Router } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Toaster } from 'sonner';
import PageLayout from './components/layout/PageLayout';
import './App.css';

function App() {
  return (
    <Router>
      <PageLayout>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </PageLayout>
    </Router>
  );
}

export default App;
