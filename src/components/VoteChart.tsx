import React from "react";
import {useEffect} from "react";
import Chart from 'chart.js/auto';
import {useRef} from 'react';
import 'react-toastify/dist/ReactToastify.css';

interface VoteChartProps {
    votesPerDay: number[];
    voteStartDate: string;
    voteEndDate: string;
}

const VoteChart: React.FC<VoteChartProps> = ({votesPerDay, voteStartDate, voteEndDate}) => {
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const ctx = chartRef.current?.getContext('2d');

        // Calculate the number of days between voteStartDate and voteEndDate
        const startDate = new Date(voteStartDate).getTime();
        const endDate = new Date(voteEndDate).getTime();
        const days = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Create an array of labels representing each day
        const labels = Array.from({length: days + 1}, (_, index) => {
            const date = new Date(startDate);
            date.setDate(date.getDate() + index);
            return date.toLocaleDateString();
        });

        // Create the chart
        if (!ctx) {
            return;
        }
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Votes per Day',
                        data: votesPerDay,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Date',
                        },
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Votes',
                        },
                        ticks: {
                            precision: 0,
                        },
                    },
                },
            },
        });
    }, [votesPerDay, voteStartDate, voteEndDate]);

    return <canvas ref={chartRef}/>;
};

export default VoteChart;