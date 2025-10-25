import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PageList } from './components/PageList';
import { PageEditor } from './components/PageEditor';
import { DatabaseView } from './components/DatabaseView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PageList />} />
          <Route path="/page/new" element={<PageEditor />} />
          <Route path="/page/:id" element={<PageEditor />} />
          <Route path="/database/new" element={<DatabaseView />} />
          <Route path="/database/:id" element={<DatabaseView />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
