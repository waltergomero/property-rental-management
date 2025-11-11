import { NextResponse } from "next/server";
import  prisma  from '@/lib/prisma';
import sharp from 'sharp';
//import path from 'path';
//const fs = require('fs');

import cloudinary from '../../../../cloudinary/cloudinary-config';


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const type = formData.get("type"); // 'image' or 'video'
    const imageFile = formData.get("image");
    const videoFile = formData.get("video");
    //const extension = formData.get("extension") as string;
    const categoryId = formData.get("categoryId") as string;
    const category_name = formData.get("category_name") as string;
    const userId = formData.get("userId") as string;
    const caption = formData.get("caption") as string;

    let file: File | Blob | null = null;
    let isVideo = false;
    if (type === 'video' && videoFile && videoFile instanceof File) {
      file = videoFile;
      isVideo = true;
    } else if (type === 'image' && imageFile && imageFile instanceof File) {
      file = imageFile;
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const date = new Date();
    const unixTimestamp = Math.floor(date.getTime());


    // const newName = unixTimestamp + "." + extension;

    // if (!(file instanceof Blob)) {
    //   return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    // }
    // var blob = file.slice(0, file.size);
    // var newFileName = new File([blob], newName, { type: file.type });
    // const savedName = newFileName.name;

    // let partialDir = '';
    // if (isVideo) {
    //   partialDir = '/videos/gallery/' + category_name;
    // } else {
    //   partialDir = '/images/gallery/' + category_name;
    // }
    // const dir = path.join(process.cwd(), 'public', partialDir);
    // const dirExist = fs.existsSync(dir);
    // if (!dirExist) {
    //   fs.mkdirSync(dir, { recursive: true });
    // }
    // const partialPath = partialDir + "/" + savedName;
    // const src = `./public/${partialPath}`;
    // const absolutePath = dir + "/" + savedName;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    //await fs.promises.writeFile(src, buffer);

    // Upload to Cloudinary
    const result = await saveToCloudinary(category_name as string, isVideo, unixTimestamp, buffer) as {
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
    };
    //console.log("result from cloudinary: ", result );

    if (isVideo) {
      // Save video metadata (basic)
      const addVideoToGallery = {
        userId: userId,
        categoryId: categoryId,
        category_name: category_name,
        src: result.secure_url, // Use Cloudinary URL
        format: 'video',
        type: 'video',
        width: 0,
        height: 0,
        caption: caption,
        isactive: true,
        isblackwhite: false,
      };
     // console.log(addVideoToGallery);
      await prisma.userImages.create({ data: addVideoToGallery });
      return NextResponse.json({ status: "success" });
    } else {
      // Image processing
      //const { width, height } = await sharp(src).metadata();
      const width = result.width;
      const height = result.height;
      let format = "landscape";
      if (height > width) format = "portrait";
      const isBW = await isBlackAndWhite(buffer);
      const addImageToGallery = {
        userId: userId,
        categoryId: categoryId,
        category_name: category_name,
        src: result.secure_url,
        public_id: result.public_id,
        format: format,
        type: 'image',
        width: width,
        height: height,
        caption: caption,
        isactive: true,
        isblackwhite: isBW,
      };
     //console.log(addImageToGallery);
      await prisma.userImages.create({ data: addImageToGallery });
      return NextResponse.json({ status: "success" });
    }
  } catch (error) {
    console.error("Error processing request: ", error);
    return NextResponse.json({ error: "Error processing request" }, { status: 500 });
  }
}

//async function isBlackAndWhite(imagePath: string) {
async function isBlackAndWhite(buffer: Uint8Array) {
  const image = sharp(buffer);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const tolerance = 2; // Allow minor differences

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (
      Math.abs(r - g) > tolerance ||
      Math.abs(g - b) > tolerance ||
      Math.abs(r - b) > tolerance
    ) {
      return false;
    }
    // Skip alpha if present
  }
  return true;
}

async function saveToCloudinary(category_name: string, isVideo: boolean, unixTimestamp: number, buffer: Uint8Array) {
    const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'gallery/' + category_name,
          resource_type: isVideo ? 'video' : 'image',
          public_id: unixTimestamp.toString(), // optional: set a custom public_id
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });
    return result;
}