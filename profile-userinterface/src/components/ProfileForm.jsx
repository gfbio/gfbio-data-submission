import React from 'react';
import withLoading from '../hocs/withLoading';
import withErrorHandling from '../hocs/withErrorHandling';
import useFetch from '../hooks/useFetch';
import Profile from './Profile';

const ProfileWithLoading = withLoading(Profile);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileForm = () => {
    const url = '/profile/profile/generic/';

    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    const localhost = 'http://0.0.0.0:8000/profile/profile/generic/'

    const initialData = {fields: []}

    const {data, isLoading, error} = useFetch(localhost, initialData);

    return (
        <div>
            <h1>ProfileForm</h1>
            <ProfileWithErrorHandling data={data} isLoading={isLoading} error={error}/>
        </div>
    );
}

export default ProfileForm;
