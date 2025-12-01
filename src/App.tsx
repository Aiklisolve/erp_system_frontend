import { RootLayout } from './app/layout/RootLayout';
import { HomePage } from './pages/HomePage';

// Fallback App component when not using RouterProvider directly.
export function App() {
  return (
    <RootLayout>
      <HomePage />
    </RootLayout>
  );
}

export default App;


