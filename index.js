const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the path to the FFmpeg binary
ffmpeg.setFfmpegPath(ffmpegPath);

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// API endpoint for file upload and conversion
app.post('/convert', upload.single('ogaFile'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file provided' });
    return;
  }

  // Generate output file name with .mp3 extension
  const outputFilePath = `uploads/${req.file.originalname}.mp3`;

  // Convert OGA file to MP3 using FFmpeg
  ffmpeg(req.file.path)
    .toFormat('mp3')
    .on('error', (err) => {
      console.error(err);
      res.status(500).json({ error: 'Conversion failed' });
    })
    .on('end', () => {
      // Send the converted MP3 file for download
      res.download(outputFilePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Download failed' });
        }

        // Clean up the uploaded and converted files
        fs.unlinkSync(req.file.path);
        fs.unlinkSync(outputFilePath);
      });
    })
    .save(outputFilePath);
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
