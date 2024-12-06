import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async(localFilePath) => {
    try {
        if(!localFilePath) {
            return null
        }

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        )

        console.log("file is uploaded on cloudinary" , response.url)
        fs.unlinkSync(localFilePath)

        return response
    }
    catch(error) {
        fs.unlinkSync(localFilePath)

        return null
    }
}

const deleteFromCloudinary = async(fileId) => {
    try {
        if(!fileId) {
            return null
        }

        const response = await cloudinary.uploader.destroy(fileId)

        console.log("file is deleted from cloudinary" , response.result)

        return response
    }
    catch(error) {
        return null
    }
}

export {uploadOnCloudinary , deleteFromCloudinary}