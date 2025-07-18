import { Routes, Route } from 'react-router';
import Home from './pages/Home';
import ItemDetails from './pages/ItemDetails';
import { Toaster } from 'sonner'

function App() {
  return (
    <>
      <Toaster richColors position='bottom-center'/>
      <Routes>
        <Route path="/" element={<Home />} />
      <Route path="/homeitems/:id" element={<ItemDetails />} />
    </Routes>
    </>
  );
}

export default App;
