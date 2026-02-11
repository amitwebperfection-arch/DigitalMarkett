import { v2 as cloudinary } from 'cloudinary';
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET
} from './env.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file, folder = 'uploads') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

export const deleteFromCloudinary = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;


// import AWS from 'aws-sdk';
// import { AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION, AWS_BUCKET_NAME } from './env.js';

// const s3 = new AWS.S3({
//   accessKeyId: AWS_ACCESS_KEY,
//   secretAccessKey: AWS_SECRET_KEY,
//   region: AWS_REGION
// });

// export const uploadToS3 = async (file, folder = 'uploads') => {
//   const params = {
//     Bucket: AWS_BUCKET_NAME,
//     Key: `${folder}/${Date.now()}-${file.originalname}`,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//     ACL: 'private'
//   };

//   const result = await s3.upload(params).promise();
//   return result.Location;
// };

// export const getSignedUrl = (key, expiresIn = 3600) => {
//   const params = {
//     Bucket: AWS_BUCKET_NAME,
//     Key: key,
//     Expires: expiresIn
//   };

//   return s3.getSignedUrl('getObject', params);
// };

// export const deleteFromS3 = async (key) => {
//   const params = {
//     Bucket: AWS_BUCKET_NAME,
//     Key: key
//   };

//   await s3.deleteObject(params).promise();
// };

// export default s3;