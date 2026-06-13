import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

const ThemedToaster = () => {
  const { isDark } = useTheme();
  return (
    <Toaster 
      position="top-center" 
      reverseOrder={false} 
      toastOptions={{
        style: {
          background: isDark ? '#1A1D24' : '#ffffff',
          color: isDark ? '#ffffff' : '#0f2a5e',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        },
        success: {
          iconTheme: {
            primary: isDark ? '#4ade80' : '#22c55e',
            secondary: isDark ? '#1A1D24' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: isDark ? '#f87171' : '#ef4444',
            secondary: isDark ? '#1A1D24' : '#ffffff',
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ThemedToaster />
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
