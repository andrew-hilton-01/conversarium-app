// App.jsx
import { Routes, Route } from 'react-router-dom';
import Landing from './Landing';
import Demo from './Demo';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing/>}/>
      <Route path="/demo" element={<Demo/>}/>
    </Routes>
  );
}
