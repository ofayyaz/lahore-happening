import multer from 'multer';
import fs from 'fs';

const uploadDir = './public/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname);
        }
    })
}).array('file', 10);

export default async function handler(req, res) {
    await upload(req, res, async (error) => {
        if (error) {
            return res.status(500).json({ error: 'Failed to upload files' });
        }

        if (req.files && req.files.length > 0) {
            const urls = req.files.map(file => ({
                url: `/images/${file.filename}`,
                alt: '' // This needs to be handled if you want to support alt text from frontend
            }));
            res.status(200).json(urls);
        } else {
            res.status(500).json({ error: 'Failed to upload files' });
        }
    });
}

export const config = {
    api: {
        bodyParser: false, // Required for multer
    },
};
