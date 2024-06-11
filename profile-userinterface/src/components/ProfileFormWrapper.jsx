import React from 'react';
import withLoading from '../hocs/withLoading';
import withErrorHandling from '../hocs/withErrorHandling';
import useFetch from '../hooks/useFetch';
import ProfileForm from './ProfileForm.jsx';
import {PROFILE_URL} from "../settings.jsx";

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {

    // TODO: add check and warning if necessary parmaters like token are not available
    // console.log('PROPS ', window.props);
    let profileName = 'generic';
    if (window.props !== undefined) {
        profileName = window.props.profile_name || 'generic';
    }



    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    const {data, isLoading, error} = useFetch(PROFILE_URL+profileName);

    return (
        <div>
            {/*<h1>ProfileForm</h1>*/}
            <ProfileWithErrorHandling data={data} isLoading={isLoading} error={error}/>
        </div>
    );
}

export default ProfileFormWrapper;
