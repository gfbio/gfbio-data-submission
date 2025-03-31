import PropTypes from "prop-types";
import DropzoneUpload from "./DropzoneUpload.jsx";
import DropzoneCloudUpload from "./DropzoneCloudUpload.jsx";
import { USE_LOCAL_UPLOAD_ONLY } from "../../settings.jsx";

const AdaptiveDropzoneUpload = (props) => {
    const { submissionFiles, localSubmissionFiles } = props;
    const useLocalUpload = (localSubmissionFiles && localSubmissionFiles.length > 0) || USE_LOCAL_UPLOAD_ONLY;
    const files = useLocalUpload ? localSubmissionFiles : submissionFiles;

    return useLocalUpload ? (
        <DropzoneUpload {...props} submissionFiles={files} />
    ) : (
        <DropzoneCloudUpload {...props} submissionFiles={files} />
    );
};

AdaptiveDropzoneUpload.propTypes = {
    submissionFiles: PropTypes.array,
    localSubmissionFiles: PropTypes.array,
};

export default AdaptiveDropzoneUpload;
