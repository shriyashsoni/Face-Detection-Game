const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const positiveScoreDisplay = document.getElementById('positiveScore');
const negativeScoreDisplay = document.getElementById('negativeScore');
let positiveScore = 0;
let negativeScore = 0;

document.getElementById('enableVideo').addEventListener('click', async () => {
    await setupCamera();
    video.style.display = 'block';
    detectFace();
});

async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    return new Promise(resolve => video.onloadedmetadata = resolve);
}

async function detectFace() {
    const model = await blazeface.load();
    setInterval(async () => {
        const predictions = await model.estimateFaces(video, false);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        if (predictions.length > 0) {
            predictions.forEach(prediction => {
                const [x, y, width, height] = prediction.topLeft.concat(prediction.bottomRight);
                ctx.strokeStyle = "#00FF00";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width - x, height - y);

                if (prediction.probability[0] > 0.9) { // Face detected
                    positiveScore += 1;
                }
                if (prediction.landmarks.length < 4) { // Covered face
                    negativeScore -= 2;
                }
            });
        }
        positiveScoreDisplay.textContent = `Positive Score: ${positiveScore}`;
        negativeScoreDisplay.textContent = `Negative Score: ${negativeScore}`;
    }, 1000);
}
