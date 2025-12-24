import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend); 

const GenerateRandomColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i=0;i<6;i++){
    color += letters[Math.floor(Math.random()*16)]
  }
  return color;
}

const LinksPieChart = ({ links }) => {
  const chartData = {
    labels: links.map((l) => l.code),
    datasets: [
      {
        label: "Clicks",
        data: links.map((l) => l.clicks),
        backgroundColor: links.map(() => GenerateRandomColor()),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
  <div className="chart-container">
    <Pie data={chartData} options={options} />
  </div> 
  );
};

export default LinksPieChart;
