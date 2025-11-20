import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import CheckIn from '@/pages/CheckIn';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/" element={<CheckIn />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

