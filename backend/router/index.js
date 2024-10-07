const express = require('express');
const router = express.Router();
const { z } = require('zod');
const ImageData = require("../model/db");
const { ObjectId } = require('mongodb');

const dataSchema = z.object({
    name: z.string().trim().toUpperCase(),
    description: z.string().trim(),
    url: z.string().url()
});

function calculateNewRatings(result, leftRating, rightRating) {
    const K = 32;
    const expectedLeft = 1 / (1 + Math.pow(10, (rightRating - leftRating) / 400));
    const expectedRight = 1 / (1 + Math.pow(10, (leftRating - rightRating) / 400));
  
    const newLeftRating = leftRating + K * (result - expectedLeft);
    const newRightRating = rightRating + K * ((1 - result) - expectedRight);
  
    return [Math.round(newLeftRating), Math.round(newRightRating)];
}


module.exports = (io) => {
    router.get('/images', async (req, res) => {
        try {
            const images = await ImageData.aggregate([{ $sample: { size: 2 } }]).exec();
            if (images.length === 2) {
                res.json({
                    leftImage: images[0],
                    rightImage: images[1]
                });
            } else {
                res.status(500).json({ msg: 'Something went wrong' });
            }
        } catch (error) {
            console.error('Error fetching images:', error);
            res.status(500).json({ msg: 'Error fetching images' });
        }
    });


    router.post('/update', async (req, res) => {
        const { winner, leftImageId, rightImageId } = req.body;

        try {
            const leftImage = await ImageData.findOne({ _id: new ObjectId(leftImageId) });
            const rightImage = await ImageData.findOne({ _id: new ObjectId(rightImageId) });

            if (!leftImage || !rightImage) {
                return res.status(404).json({ msg: 'Image not found' });
            }

            const [newLeftRating, newRightRating] = calculateNewRatings(
                winner === 'left' ? 1 : 0, 
                leftImage.rating, 
                rightImage.rating
            );

            await ImageData.updateOne({ _id: new ObjectId(leftImageId) }, { $set: { rating: newLeftRating } });
            await ImageData.updateOne({ _id: new ObjectId(rightImageId) }, { $set: { rating: newRightRating } });

            
            io.emit('ratingUpdate', { leftImageId, newLeftRating, rightImageId, newRightRating });

            res.json({ newLeftRating, newRightRating });
        } catch (error) {
            console.error('Error updating ratings:', error);
            res.status(500).json({ msg: 'Error updating ratings', error: error.message });
        }
    });

    
    router.get('/leaderboard', async (req, res) => {
        try {
            const topImages = await ImageData.find().sort({ rating: -1 }).limit(10).exec();
            res.status(200).json({ topImages });
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            res.status(500).json({ msg: 'Error fetching leaderboard' });
        }
    });

  
    router.post('/admin', async (req, res) => {
        try {
            const body = req.body;
            dataSchema.parse(body);

            const newImage = await ImageData.create({
                name: body.name,
                description: body.description,
                url: body.url,
                rating: 600  
            });

            res.status(200).json({
                msg: "Image Inserted",
                image: newImage
            });
        } catch (error) {
            console.error('Error inserting image:', error);
            res.status(400).json({ msg: "Something went wrong", error: error.message });
        }
    });

    return router;
};
