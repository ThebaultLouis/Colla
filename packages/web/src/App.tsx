import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageList } from './components/PageList';
import { PageEditor } from './components/PageEditor';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageList />} />
        <Route path="/page/new" element={<PageEditor />} />
        <Route path="/page/:id" element={<PageEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
