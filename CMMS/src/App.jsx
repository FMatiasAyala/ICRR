import React from 'react';
import Dashboard from './components/Home/Dashboard';
import Login from './components/Auth/Login';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'; 

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/cmms" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
