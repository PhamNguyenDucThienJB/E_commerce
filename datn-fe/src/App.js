import "./App.css";
import UserLayOut from "./layout/UserLayOut";
import AdminLayOut from "./layout/AdminLayOut";
import { BrowserRouter as Router } from "react-router-dom";
function App() {
  return (
    <div className="container-fluid">
      <Router>
        <UserLayOut></UserLayOut>
      </Router>
    </div>
  );
}

export default App;
