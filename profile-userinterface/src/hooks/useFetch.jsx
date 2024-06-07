import {useEffect, useState} from 'react';
import axios from "axios";

const useFetch = (url) => {
    const [data, setData] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // console.log('FETCH')
            await axios
                .get(url)
                .then((response) => {
                        console.log('response ', response)
                        setData(response.data);
                    }
                )
                .catch((error) => {
                        setError(error);
                    }
                )
                .finally(() => {
                        setLoading(false);
                    }
                )
            // try {
            //     // TODO: use axios instead ? will be installed for POST anyways
            //     const response = await fetch(url);
            //     if (!response.ok) {
            //         throw new Error('Network response was not ok');
            //     }
            //     const json = await response.json();
            //     setData(json);
            // } catch (error) {
            //     setError(error);
            // } finally {
            //     setLoading(false);
            // }
        };

        fetchData();

        // Cleanup function
        return () => {
            // Cleanup logic if needed
        };
    }, [url]);

    return {data, isLoading, error};
};

export default useFetch;
