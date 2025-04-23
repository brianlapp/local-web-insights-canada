
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from './components/ui/toaster';

import Layout from './layouts/Layout';
import Home from './pages/Home';
import About from './pages/About';
import NotFound from './pages/NotFound';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import ScraperControl from './pages/admin/ScraperControl';
import BusinessImport from './pages/admin/BusinessImport';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            
            {/* Admin Routes */}
            <Route path="admin">
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="scraper" element={<ScraperControl />} />
              <Route path="import" element={<BusinessImport />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
