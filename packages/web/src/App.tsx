import { AppRouter } from './AppRouter';
import { RefreshProvider } from './contexts/RefreshContext';
import './App.css';

function App() {
  return (
    <RefreshProvider>
      <AppRouter />
    </RefreshProvider>
  );
}

export default App;
