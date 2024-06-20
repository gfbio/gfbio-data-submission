import React, {useState} from 'react';
import PropTypes from "prop-types";
import {Dropzone} from '@mantine/dropzone';
import {Center, CloseButton, Text} from '@mantine/core';

const DropzoneUpload = (props) => {
    const {title, description, placeholder, form, field_id,} = props;

    const [localFiles, setLocalFiles] = useState([]);

    const selectedFiles = form.values.files.map((file, index) => (
        <Text key={file.name}>
            <b>{file.name}</b> ({(file.size / 1024).toFixed(2)} kb)
            <CloseButton
                size="xs"
                onClick={() =>
                    form.setFieldValue(
                        'files',
                        form.values.files.filter((_, i) => i !== index)
                    )
                }
            />
        </Text>
    ));

    const localSelectedFiles = localFiles.map((file, index) => (
        <Text key={file.name} className='ml-4'>
            <i class="icon ion-md-document green-text pr-2"></i>
            <b>{file.name}</b> ({(file.size / 1024).toFixed(2)} kb)
            <CloseButton
                size="xs"
                onClick={() => {
                    // console.log('remove ', index, ' file ', file);
                    // form.setFieldValue(
                    //     'files',
                    //     form.values.files.filter((_, i) => i !== index)
                    // );
                    const updatedFiles = localFiles.filter((_, i) => i !== index);
                    form.setFieldValue('files', updatedFiles)
                    setLocalFiles(updatedFiles);

                }
                }
            />
        </Text>
    ));

    // console.log('DropzoneUpload | localselectedFiles ', localSelectedFiles);
    // console.log('DropzoneUpload | selectedFiles ', selectedFiles);
    // console.log('DropzoneUpload | form files ', form.values.files);


    return (
        <div>
            {title && (<h2>{title}</h2>)}
            { description && ( <label>{description}</label> ) }

            {localSelectedFiles.length > 0 && (
                <div className='mb-2 uploaded-files'>
                    <Text mb={5} mt="md">
                        Selected files:
                    </Text>
                    {localSelectedFiles}
                </div>
            )}
            <Dropzone
                h={120}
                p={0}
                multiple
                // accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.svg]}

                // onDrop={(files) => form.setFieldValue('files', files)}

                onDrop={(files) => {
                    // console.log('ONDROP ', files);
                    // TODO: add to selected files here, in this construct the Drptone is not
                    //  re-rendering the form siince it is passed as a pop
                    form.setFieldValue('files', files);
                    setLocalFiles(files);
                }
                }
                // onReject={() => form.setFieldError('files', 'Select images only')}
            >
                <Center h={120}>
                    <Dropzone.Idle>{ placeholder ? (<>{placeholder}</>) : (<>Drop files here</>) }</Dropzone.Idle>
                    <Dropzone.Accept>Drop files here</Dropzone.Accept>
                    <Dropzone.Reject>Files are invalid</Dropzone.Reject>
                </Center>
            </Dropzone>

            {form.errors.files && (
                <Text c="red" mt={5}>
                    {form.errors.files}
                </Text>
            )}
        </div>
    );
}

DropzoneUpload.defaultProps = {}

DropzoneUpload.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
}

export default DropzoneUpload;
