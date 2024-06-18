import nextConnect from 'next-connect';
import multer from 'multer';

const upload = multer({
    storage: multer.diskStorage({
        destination: './public/images', // Target directory
        filename: (req, file, cb) => {
            cb(null, file.originalname); // Use original file name
        }
    })
});

const handler = nextConnect();

handler.use(upload.array('file', 10));

handler.post((req, res) => {
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

export const config = {
    api: {
        bodyParser: false, // Disabling body parsing because we're using multer
    },
};

export default handler;
