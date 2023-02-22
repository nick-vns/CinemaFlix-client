import { createRoot } from "react-dom/client";
import Container from "react-bootstrap/Container";
import { MainView } from "./components/main-view/main-view";
import "./index.scss";

const MyFlixApplication = () => {
  return (
    <Container>
      <MainView />
    </Container>
  );
};

//finds root of my app
const container = document.querySelector("#root");
const root = createRoot(container);
//tells react to render my app in root DOM element
root.render(<MyFlixApplication />);
