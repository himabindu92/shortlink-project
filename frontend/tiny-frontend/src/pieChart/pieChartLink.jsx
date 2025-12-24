import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const LinksPieChart = ({ links }) => {
  const chartData = {
    labels: links.map((l) => l.code),
    datasets: [
      {
        label: "Clicks",
        data: links.map((l) => l.clicks),
        backgroundColor: [
          "#6366f1",
          "#22c55e",
          "#f59e0b",
          "#ef4444",
          "#06b6d4",
          "#8b5cf6",
        ],
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
