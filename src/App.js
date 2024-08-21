import logo from './logo.svg';
import './App.css';
import Form from './components/Form';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideBar from './components/SideBar';

function App() {
  return (
    <div className="App">
      <SideBar></SideBar>
      <Form></Form>
      <ToastContainer />
    </div>
  );
}

export default App;
