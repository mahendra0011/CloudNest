const fs = require('fs');
const { getOwnerDriveClient, isOwnerDriveConfigured } = require('../config/googleDrive');

const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';

const categoryFolderNames = {
    image: 'Images',
    video: 'Videos',
    archive: 'Archives',
    document: 'Documents',
    other: 'Other Files'
};

function escapeDriveQueryValue(value) {
    return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

async function findOrCreateFolder({ drive, name, parentFolderId }) {
    const escapedName = escapeDriveQueryValue(name);
    const queryParts = [
        `name = '${escapedName}'`,
        `mimeType = '${DRIVE_FOLDER_MIME_TYPE}'`,
        'trashed = false'
    ];

    if (parentFolderId) {
        queryParts.push(`'${escapeDriveQueryValue(parentFolderId)}' in parents`);
    }

    const listResponse = await drive.files.list({
        q: queryParts.join(' and '),
        fields: 'files(id,name)',
        pageSize: 1,
        includeItemsFromAllDrives: true,
        supportsAllDrives: true
    });

    const existingFolder = listResponse.data.files?.[0];

    if (existingFolder) {
        return existingFolder.id;
    }

    const requestBody = {
        name,
        mimeType: DRIVE_FOLDER_MIME_TYPE
    };

    if (parentFolderId) {
        requestBody.parents = [parentFolderId];
    }

    const createResponse = await drive.files.create({
        requestBody,
        fields: 'id',
        supportsAllDrives: true
    });

    return createResponse.data.id;
}

async function getUploadParentId({ drive, category }) {
    const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const categoryFolderName = categoryFolderNames[category] || categoryFolderNames.other;

    if (!parentFolderId) {
        return findOrCreateFolder({
            drive,
            name: categoryFolderName
        });
    }

    return findOrCreateFolder({
        drive,
        name: categoryFolderName,
        parentFolderId
    });
}

async function uploadToDrive({ file, category }) {
    const drive = getOwnerDriveClient();
    const folderId = await getUploadParentId({ drive, category });

    const requestBody = {
        name: file.originalname,
        parents: [folderId]
    };

    const response = await drive.files.create({
        requestBody,
        media: {
            mimeType: file.mimetype,
            body: fs.createReadStream(file.path)
        },
        fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,createdTime',
        supportsAllDrives: true
    });

    return response.data;
}

async function downloadFromDrive({ driveFileId }) {
    const drive = getOwnerDriveClient();

    return drive.files.get(
        {
            fileId: driveFileId,
            alt: 'media',
            supportsAllDrives: true
        },
        {
            responseType: 'stream'
        }
    );
}

async function deleteFromDrive({ driveFileId }) {
    const drive = getOwnerDriveClient();
    await drive.files.delete({
        fileId: driveFileId,
        supportsAllDrives: true
    });
}

module.exports = {
    deleteFromDrive,
    downloadFromDrive,
    isOwnerDriveConfigured,
    uploadToDrive
};
