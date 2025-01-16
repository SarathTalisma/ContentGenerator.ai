import { createTheme, ThemeProvider } from '@mui/material/styles';
import ContentGenerator from './components/ContentGenerator';
const theme = createTheme({
  typography: {
    fontFamily: '"Abel", "Dosis", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <ContentGenerator />
    </ThemeProvider>
  );
};
export default App;