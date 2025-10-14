// Car data for filtering
import standard4 from '../assets/4standard.jpg';
import pro4 from '../assets/4pro.jpg';
import proplus4 from '../assets/4proplus.jpg';
import standard7 from '../assets/7standard.jpg';
import pro7 from '../assets/7pro.jpg';
import proplus7 from '../assets/7proplus.jpg';

const cars = [
    {
        id: 1,
        name: 'VF e34',
        image: standard4,
        type: '4-seater',
        grade: 'Standard',
        branch: 'q1',
    },
    {
        id: 2,
        name: 'VF 5 Plus',
        image: pro4,
        type: '4-seater',
        grade: 'Air pro',
        branch: 'q1',
    },
    {
        id: 3,
        name: 'VF 6',
        image: proplus4,
        type: '4-seater',
        grade: 'Air pro plus',
        branch: 'q7',
    },
    {
        id: 4,
        name: 'VF 9',
        image: standard7,
        type: '7-seater',
        grade: 'Standard',
        branch: 'q7',
    },
    {
        id: 5,
        name: 'VF 8',
        image: pro7,
        type: '7-seater',
        grade: 'Air pro',
        branch: 'td',
    },
    {
        id: 6,
        name: 'VF 7',
        image: proplus7,
        type: '7-seater',
        grade: 'Air pro plus',
        branch: 'td',
    },
];

export default cars;
