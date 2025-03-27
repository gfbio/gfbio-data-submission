import PropTypes from "prop-types";
import DropzoneUpload from "./DropzoneUpload.jsx";
import DropzoneCloudUpload from "./DropzoneCloudUpload.jsx";

const AdaptiveDropzoneUpload = (props) => {
    const { submissionFiles, localSubmissionFiles } = props;
    const useLocalUpload = localSubmissionFiles && localSubmissionFiles.length > 0;
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
