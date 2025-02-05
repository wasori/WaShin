import { createGlobalStyle } from 'styled-components';
import '../App.css';

const GlobalStyles = createGlobalStyle`
  body {
    margin: 0;
    font-family: 'Arial', sans-serif;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden; /* 🔥 브라우저 전체 스크롤 제거 */
  }

  h3 {
    margin: 0 0 10px;
  }
`;


export default GlobalStyles;
