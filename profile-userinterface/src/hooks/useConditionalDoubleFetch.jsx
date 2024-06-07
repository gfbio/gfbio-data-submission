import {useEffect, useState} from 'react';
import axios from "axios";

// const getResponseOne = async (url) => {
//     let result = {};
//     await axios
//         .get(url)
//         .then((response) => {
//                 result = response.data;
//             }
//         )
//     // .catch((error) => {
//     //     // https://designtechworld.medium.com/how-to-make-sequential-api-calls-in-react-applications-typescript-version-c07a023efd62
//     //     }
//     // )
//     return result;
// };
//
// const getResponseTwo = async (data, url) => {
//     let result = {};
//     await axios
//         .get(url)
//         .then((response) => {
//                 result = response.data;
//             }
//         )
//     // .catch((error) => {
//     //         // https://designtechworld.medium.com/how-to-make-sequential-api-calls-in-react-applications-typescript-version-c07a023efd62
//     //     }
//     // )
//     return result;
// }
const useConditionalDoubleFetch = (urlOne, urlTwo) => {
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [x, setX] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [error1, setError1] = useState(null);
    const [error2, setError2] = useState(null);

    // const [data, setData] = useState({});
    // const [isLoading, setLoading] = useState(true);
    // const [error, setError] = useState(null);
    // useEffect(() => {
    //     async function fetchData() {
    //         try {
    //             const response1 = await getResponseOne(url_1);
    //             const response2 = await getResponseTwo(response1, url_2);
    //             // setData({
    //             // Combine the data from both responses into a single object
    //             console.log('RES 1 ', response1);
    //             console.log('RES 2 ', response2);
    //             // });
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     }
    //
    //     fetchData();
    // }, []);
    // return {data, isLoading, error};
};

export default useConditionalDoubleFetch;
