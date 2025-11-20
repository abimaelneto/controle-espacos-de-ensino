import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/layout';
import Dashboard from '@/pages/Dashboard';
import Students from '@/pages/Students';
import Rooms from '@/pages/Rooms';
import Analytics from '@/pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

