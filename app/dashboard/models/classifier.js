import * as tf from '@tensorflow/tfjs';

export const classifyImage = async (imageElement) => {
    try {
        // 1. Load the model from the public folder
        const model = await tf.loadLayersModel('/model/model.json');

        // 2. Process the image (MobileNet requires 224x224)
        const tensor = tf.browser.fromPixels(imageElement)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims();

        // 3. Predict
        const predictions = await model.predict(tensor).data();

        // 4. Map results to your labels
        // Order must match your Teachable Machine classes: Events, Outdoor, Indoor
        const labels = ["Events", "Outdoor", "Indoor"];
        const highestIndex = predictions.indexOf(Math.max(...predictions));

        return labels[highestIndex];
    } catch (error) {
        console.error("AI Classification Error:", error);
        return "Uncategorized";
    }
};