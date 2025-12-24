import {BrowserRouter , Routes , Route} from "react-router-dom";
import Dashboard from './Dashboard' 
import Stats from "./Stats";


const App = () => {
  return(
    <BrowserRouter>
        <Routes>
           <Route path="/" element={<Dashboard />} />
            <Route path="/stats" element={<Stats />} />
        </Routes>
    
    </BrowserRouter>
  )
} 

export default App

