import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectStatusChartProps {
  data: {
    active: number;
    completed: number;
    cancelled: number;
  };
}

const ProjectStatusChart: React.FC<ProjectStatusChartProps> = ({ data }) => {
  const chartData = {
    labels: ['Aktif Projeler', 'Tamamlanan Projeler', 'İptal Edilen Projeler'],
    datasets: [
      {
        data: [data.active, data.completed, data.cancelled],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Proje Durumu Dağılımı',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  const total = data.active + data.completed + data.cancelled;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div style={{ height: '400px' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      {total > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.active}</div>
            <div className="text-sm text-green-700">Aktif</div>
            <div className="text-xs text-green-600">
              {((data.active / total) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.completed}</div>
            <div className="text-sm text-blue-700">Tamamlanan</div>
            <div className="text-xs text-blue-600">
              {((data.completed / total) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{data.cancelled}</div>
            <div className="text-sm text-red-700">İptal Edilen</div>
            <div className="text-xs text-red-600">
              {((data.cancelled / total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusChart;
