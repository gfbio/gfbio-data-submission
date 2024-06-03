import React from 'react';
import withLoading from '../hocs/withLoading';
import withErrorHandling from '../hocs/withErrorHandling';
import useFetch from '../hooks/useFetch';
import ProfileForm from './ProfileForm.jsx';

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {

    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    const url = '/profile/profile/generic/';
    const localhost = 'http://0.0.0.0:8000/profile/profile/generic/'

    const {data, isLoading, error} = useFetch(localhost);

    // console.log('loading: ', isLoading, ' | data: ', data);

    return (
        <div>
            <h1>ProfileForm</h1>
            <ProfileWithErrorHandling data={data} isLoading={isLoading} error={error}/>
        </div>
    );
}

export default ProfileFormWrapper;
