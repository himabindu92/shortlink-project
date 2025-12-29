import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useCallback } from "react";
import LinksPieChart from "../pieChart/pieChartLink.jsx";
import "./dashboard.css";


const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [url, setUrl] = useState("");
  const [code, setCode] = useState("");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const[urlError,setUrlError]=useState("");
  const[codeError,setCodeError]=useState("");
  
  const[loading,setLoading]=useState(false);  
 
  
  const navigate = useNavigate();
 

  // Fetch all links
  const getLinks = useCallback(async () => {
    setLoading(true);
    const res = await api.get("/api/links");
    setLinks(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    getLinks();
  }, [getLinks]);

  // Create new link
  const validateForm = () => {
    let isValid=true;

    //Url validation 
    if(!url || url.trim() ===""){
      setUrlError("pls Enter a URL");
      isValid=false;  
    }else{
      setUrlError("");
    
    } 

    if(code && !/^[A-Za-z0-9]{6,8}$/.test(code)){
      setCodeError("code must be alphanumeric and 6-8 characters long");
      isValid=false;
    }else{
      setCodeError("");
    }

    return isValid;
   }
   
   const handleSubmit = async (e) => {
    e.preventDefault();
  
    if(!validateForm()){
      return ;
    }
   try {
     await api.post("/api/links", { url, code });
        setUrl("");
        setCode("");
        getLinks();
        setUrlError("");
        setCodeError("");
     } catch (err) {
      console.log(err)
    }finally{
      console.log("Request completed")
    }
  };

  // Delete link
  const deleteLink = async (code) => {
    try {
      await api.delete(`/api/links/${code}`);
    
      setView("table");
      getLinks();
    } catch (err) {
      alert(err.response?.data?.error || "Error deleting link");
    }
  };

  // Filter search
  const filtered = links.filter(
    (l) =>
      l.code.toLowerCase().includes(search.toLowerCase()) ||
      l.url.toLowerCase().includes(search.toLowerCase())
  ); 

  //update Link 
 const getupdateLink = (code) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
  window.open(`${BASE_URL}/${code}`, "_blank");
};


  return (
  
    <div className="background-container">
      {/* NAVBAR */}
      <nav className="nav-bgcolor"> 

        <div className="logo-container">
          <img src="/ligo_short_url.png" alt="Website Logo" className="logo" />
           <h1 className="dash-board">Dashboard</h1>
        </div>
       
      <div className="button-container">
        <button
          onClick={() => setView("table")}
          className={view === "table" ? "active Linkbutton" : ""} 
        >
          Links Table
        </button>

        <button
          onClick={() => setView("health")}
          className={view === "health" ? "active Healthcheck-button" : ""}
        >
          Healthcheck
        </button> 

        <button
        onClick={() => setView("chart")}
        className={view === "chart" ? "active Linkbutton" : ""}
      >
        Analytics
        </button>
      </div>
      
      <div class="hanburger-menu" onClick={() => {
        const nav = document.querySelector('.button-container');
        nav.classList.toggle('active-menu');
      }}>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>
        
      </nav>

      {/* CREATE FORM */}
      <form onSubmit={handleSubmit} className="form-card">
        <div className="url-card-container">
          <label>Enter URL</label>
          <input
            className="url-name"
            placeholder="Enter URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onFocus={() => setUrlError("")}
          />
          {urlError && <p className="error-message">{urlError}</p>}
        </div>

        <div className="url-card-container">
          <label>Enter Custom Code (Optional)</label>
          <input
            className="code-name"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)} 
            onFocus={() => setCodeError("")}
          /> 
            {codeError &&  <p className="error-message">{codeError}</p> }
            
        </div>

        <button className="button">Generate</button>
      </form>

      {/* SEARCH */}
      {view === "table" && (
        <div className="search-container">
        <input
          className="search"
          placeholder="Search by code or URL"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> 

          <button
                  onClick={() =>  navigate("/Stats")}
                  className="button"
                >
                  Static View
          </button> 
      </div>
      )}

      {/* TABLE VIEW */}
      
      {view === "table"  && (
        loading ? (
          <p className="loading">Loading...</p>
      ) :
      (
        <table className="table-container">
          <thead>
            <tr className="table-colimn-name">
              <th>Short Code</th>
              <th>Target URL</th>
              <th>Total Clicks</th>
              <th>Last Clicked</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
          
            {filtered.map((l) => (
              <tr key={l.id}>
                <td
                  className="code-link"
                   onClick={() =>
                   getupdateLink(l.code)}
                >
                {l.code}
                </td>

                <td>{l.url}</td>
                <td>{l.clicks}</td>
                <td>{l.lastClicked || "—"}</td>
                <td>
                  <button className="del-btn" onClick={() => deleteLink(l.code)}>
                    Delete
                  </button> 
                    
              
                </td> 
                  
                
              </tr>
            ))}
          </tbody>
        </table>
      )
      )}
    
      {/* CHART VIEW */} 
      {view === "chart" && (
      <div className="chart-container">
        <h2>Link Click Analysis</h2> 
        <div className="chart-link">
        <LinksPieChart links={links} /> 
        </div>
      </div>
)}

  
      {/* HEALTH VIEW */}
      {view === "health" && (
        <div className="health-card">
          <h2>Health Check</h2>
          <p>API Status: ✅ OK</p>
        </div>
      )}

  
    </div>
  );
};

export default Dashboard;
