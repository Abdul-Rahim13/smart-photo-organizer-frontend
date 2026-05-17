import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Cache models in memory to avoid reloading them on every upload
let customModelInstance = null;
let cocoModelInstance = null;

export const classifyAndDetectImage = async (imageElement) => {
    try {
        // 1. Lazy load both models if they aren't loaded yet
        if (!customModelInstance) {
            customModelInstance = await tf.loadLayersModel('/model/model.json');
        }
        if (!cocoModelInstance) {
            cocoModelInstance = await cocoSsd.load();
        }

        // --- PART A: SCENE ENVIRONMENT CLASSIFICATION ---
        // Process the image (MobileNet / Teachable Machine requires 224x224)
        const tensor = tf.browser.fromPixels(imageElement)
            .resizeNearestNeighbor([224, 224])
            .toFloat()
            .expandDims();

        const predictions = await customModelInstance.predict(tensor).data();
        
        // Match against your exact Teachable Machine class layout
        const labels = ["Events", "Outdoor", "Indoor"];
        const highestIndex = predictions.indexOf(Math.max(...predictions));
        let detectedCategory = labels[highestIndex];

        // Clean up tensor memory allocation immediately
        tensor.dispose();

        // --- PART B: PEOPLE DETECTION ---
        const objectsDetected = await cocoModelInstance.detect(imageElement);
        
        // Search through findings to verify if a person is present
        const containsPeople = objectsDetected.some(obj => obj.class === 'person');

        return {
            category: detectedCategory,
            hasPeople: containsPeople
        };

    } catch (error) {
        console.error("AI Classification Error:", error);
        return {
            category: "Uncategorized",
            hasPeople: false
        };
    }
};