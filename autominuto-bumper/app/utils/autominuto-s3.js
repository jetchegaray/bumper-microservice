const AWS = require("aws-sdk");
const constants = require("./constants");

// using native promise
AWS.config.setPromisesDependency(null);

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  region: "sa-east-1",
  accessKeyId: "access-key1",
  secretAccessKey: "secret-access-key1",
});

module.exports = {
  putBatch: function (files) {
    return Promise.all(
      files.map(function (file) {
        let params = {
          Bucket: constants.S3_BUCKET_TEST,
          Key: file.key,
          Body: file.stream,
          ACL: "public-read",
        };
        return s3.putObject(params).promise();
      })
    );
  },
  putFile: function (file) {
    let params = {
      Bucket: constants.S3_BUCKET_TEST,
      Key: file.key,
      Body: file.stream,
      ACL: "public-read",
    };
    return s3.putObject(params).promise();
  },
  getPresignedUrl: function (bucket, key, type, callback) {
    console.log(bucket, key, type);

    s3.getSignedUrl(
      "putObject",
      {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 60,
        ContentType: type,
      },
      callback
    );
  },
};
