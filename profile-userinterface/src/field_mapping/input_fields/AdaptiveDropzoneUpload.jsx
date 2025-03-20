import DropzoneCloudUpload from "./DropzoneCloudUpload.jsx";
import DropzoneUpload from "./DropzoneUpload.jsx";

const AdaptiveDropzoneUpload = (props) => {
    const { submissionData, submissionFiles } = props;
    // For example, use a similar check as in ProfileForm:
    const useLocalUpload = submissionFiles && submissionFiles.some(file => file.is_local);

    return useLocalUpload ? (
        <DropzoneUpload {...props} />
    ) : (
        <DropzoneCloudUpload {...props} />
    );
};
export default AdaptiveDropzoneUpload;