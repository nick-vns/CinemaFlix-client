import { createRoot } from 'react-dom/client';
import './index.scss';

const MyFlixApplication = () => {
  return (
    <div className='my-flix'>
      <div>Good morning</div>
    </div>
  );   
};
//finds root of my app
const container = document.querySelector('#root');
const root = createRoot(container);
//tells react to render my app in root DOM element
root.render(<MyFlixApplication />);
