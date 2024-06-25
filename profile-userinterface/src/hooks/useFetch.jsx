import {useEffect, useState} from 'react';
import axios from "axios";

const useFetch = (url) => {
    const [data, setData] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await axios
                .get(url)
                .then((response) => {
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
