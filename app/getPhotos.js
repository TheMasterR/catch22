const path = require("path");
const fs = require("fs");
const photosPath = path.join(__dirname, 'static/images');

const getPhotos = async () => {
    return new Promise((resolve, reject) => {
        fs.readdir(photosPath, (err, files) => {
            resolve(files);
        });
    });
}

module.exports = { getPhotos };
