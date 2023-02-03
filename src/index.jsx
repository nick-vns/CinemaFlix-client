import { createRoot } from 'react-dom/client';
import { MainView } from './components/main-view/main-view';
import './index.scss';

const MyFlixApplication = () => {
  return <MainView />;
};

//finds root of my app
const container = document.querySelector('#root');
const root = createRoot(container);
//tells react to render my app in root DOM element
root.render(<MyFlixApplication />);
