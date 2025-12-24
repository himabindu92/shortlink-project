import { useEffect, useState } from "react";
import { useParams ,useNavigate} from "react-router-dom";
import api from "../api/axios.js";
import "./stats.css";

export default function Stats() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function fetchStats() {
    try {
      const res = await api.get(`/api/links/`);
      setData(res.data);
      console.log("result",res.data);
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [code]);

  if (loading) return <h2 className="Loading-container">Loading...</h2>;
    
      
 
  if (error) return <h2>Stats not found</h2>;

  return (
    <div className="stats-background" >
      <button className="back-button" onClick={() => navigate("/")}>⬅ Back</button> 
       <div className="stats-container">
        <h2>All Links Stats</h2>

        <ul className="static-code-link" >
          {data.map((each, index) => (
            <li key={each.id}  style={{ animationDelay: `${index * 0.15}s` }} className="stats-item">
              <p><b>Code:</b> {each.code}</p>
              <p><b>URL:</b> {each.url}</p>
              <p><b>Clicks:</b> {each.clicks}</p>
              <p><b>Last Clicked:</b> {each.lastClicked || "Never"}</p>
              <p><b>Created At:</b> {each.created_at}</p>
            </li>
          ))}
        </ul>
      </div>
  </div>
  );
}
