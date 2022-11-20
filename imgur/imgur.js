const { ImgurClient } = require("imgur");

async function uploadImage(imgPath) {
  const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
  });
  const imgurResponse = await imgurClient.upload({
    image: imgPath,
    type: "stream",
  });
  return {
    link: imgurResponse.data.link,
    deleteHash: imgurResponse.data.deletehash,
  };
}

async function deleteImage(imgDeleteHash) {
  const imgurClient = new ImgurClient({
    clientId: process.env.IMGUR_CLIENT_ID,
  });
  await imgurClient.deleteImage(imgDeleteHash);
}

const imgur = {
  uploadImage: uploadImage,
  deleteImage: deleteImage,
};

module.exports = imgur;
