 let video, canvas, ctx;
        let isCalibrated = false;
        let pixelsPerMM = 1;
        let measurementPoints = [];
        let referencePoints = [];
        let isSelectingReference = false;
        let capturedFrame = null;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            initializeElements();
            setupEventListeners();
        });

        function initializeElements() {
            video = document.getElementById('videoElement');
            canvas = document.getElementById('canvas');
            ctx = canvas.getContext('2d');
        }

        function setupEventListeners() {
            document.getElementById('startCamera').addEventListener('click', startCamera);
            document.getElementById('captureBtn').addEventListener('click', captureFrame);
            document.getElementById('clearBtn').addEventListener('click', clearMeasurements);
            document.getElementById('autoDetect').addEventListener('click', autoDetect);
            document.getElementById('referenceSize').addEventListener('input', updateCalibration);
            canvas.addEventListener('click', handleCanvasClick);
        }

     async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: { ideal: "environment" }, // 🔑 force back camera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
        
        video.addEventListener('loadedmetadata', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.style.width = video.clientWidth + 'px';
            canvas.style.height = video.clientHeight + 'px';
            
            document.getElementById('captureBtn').disabled = false;
            updateStatus('Back camera started. Place your object and reference in view.', 'info');
        });
        
    } catch (error) {
        updateStatus('Camera access denied or no back camera found. Falling back to front camera.', 'warning');

        // fallback to front camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "user" } 
            });
            video.srcObject = stream;
        } catch (err) {
            updateStatus('No camera available.', 'warning');
        }
    }
}


        function captureFrame() {
            if (video.videoWidth === 0) return;
            
            // Create temporary canvas for capture
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = video.videoWidth;
            tempCanvas.height = video.videoHeight;
            
            tempCtx.drawImage(video, 0, 0);
            capturedFrame = tempCanvas;
            
            // Draw captured frame on main canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            document.getElementById('autoDetect').disabled = false;
            updateStatus('Frame captured. Click to measure or use Auto Detect.', 'info');
        }

        function handleCanvasClick(event) {
            if (!capturedFrame) {
                updateStatus('Please capture a frame first.', 'warning');
                return;
            }

            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;

            const referenceSize = parseFloat(document.getElementById('referenceSize').value);
            
            if (!isCalibrated && referenceSize > 0) {
                // Calibration mode
                referencePoints.push({x, y});
                drawPoint(x, y, 'red', 8);
                
                if (referencePoints.length === 2) {
                    const distance = calculateDistance(referencePoints[0], referencePoints[1]);
                    pixelsPerMM = distance / referenceSize;
                    isCalibrated = true;
                    
                    drawLine(referencePoints[0], referencePoints[1], 'red', 3);
                    updateScaleDisplay();
                    updateStatus('Calibrated! Now click points on your object to measure.', 'info');
                }
            } else if (isCalibrated) {
                // Measurement mode
                measurementPoints.push({x, y});
                drawPoint(x, y, 'blue', 6);
                
                if (measurementPoints.length >= 2) {
                    calculateMeasurements();
                }
            } else {
                updateStatus('Please enter reference object size first.', 'warning');
            }
        }

        function drawPoint(x, y, color, size) {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Add white border
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        function drawLine(point1, point2, color, width) {
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
        }

        function calculateDistance(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        }

        function calculateMeasurements() {
            if (measurementPoints.length < 2) return;
            
            // Calculate length (distance between first and last point)
            const length = calculateDistance(measurementPoints[0], measurementPoints[measurementPoints.length - 1]);
            const lengthMM = length / pixelsPerMM;
            
            // Draw measurement lines
            for (let i = 1; i < measurementPoints.length; i++) {
                drawLine(measurementPoints[i-1], measurementPoints[i], 'blue', 2);
            }
            
            // For diameter/thickness, use perpendicular measurements if available
            let diameterMM = 0;
            let thicknessMM = 0;
            
            if (measurementPoints.length >= 4) {
                // Calculate diameter as average of perpendicular measurements
                const dist1 = calculateDistance(measurementPoints[0], measurementPoints[1]);
                const dist2 = calculateDistance(measurementPoints[2], measurementPoints[3]);
                diameterMM = ((dist1 + dist2) / 2) / pixelsPerMM;
                thicknessMM = Math.min(dist1, dist2) / pixelsPerMM;
            }
            
            updateMeasurementDisplay(lengthMM, diameterMM, thicknessMM);
        }

        function updateMeasurementDisplay(length, diameter, thickness) {
            document.getElementById('lengthValue').textContent = length.toFixed(2) + ' mm';
            document.getElementById('diameterValue').textContent = diameter > 0 ? diameter.toFixed(2) + ' mm' : '-- mm';
            document.getElementById('thicknessValue').textContent = thickness > 0 ? thickness.toFixed(2) + ' mm' : '-- mm';
        }

        function updateScaleDisplay() {
            document.getElementById('scaleValue').textContent = pixelsPerMM.toFixed(2);
        }

        function updateCalibration() {
            const referenceSize = parseFloat(document.getElementById('referenceSize').value);
            if (referenceSize > 0 && referencePoints.length === 0) {
                updateStatus('Click two points on your reference object to calibrate.', 'info');
            }
        }

        function clearMeasurements() {
            measurementPoints = [];
            referencePoints = [];
            isCalibrated = false;
            pixelsPerMM = 1;
            
            if (capturedFrame) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(capturedFrame, 0, 0, canvas.width, canvas.height);
            }
            
            updateMeasurementDisplay(0, 0, 0);
            updateScaleDisplay();
            updateStatus('Measurements cleared. Ready for new calibration.', 'info');
        }

        function autoDetect() {
            if (!capturedFrame) {
                updateStatus('Please capture a frame first.', 'warning');
                return;
            }

            if (!window.cv || !window.cv.Mat) {
                updateStatus('OpenCV not loaded. Please wait...', 'warning');
                return;
            }

            try {
                // Convert canvas to OpenCV Mat
                const src = cv.imread(capturedFrame);
                const gray = new cv.Mat();
                const edges = new cv.Mat();
                const contours = new cv.MatVector();
                const hierarchy = new cv.Mat();

                // Convert to grayscale
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

                // Edge detection
                cv.Canny(gray, edges, 50, 150);

                // Find contours
                cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                // Find the largest contour (likely the main object)
                let maxArea = 0;
                let maxContourIndex = -1;
                
                for (let i = 0; i < contours.size(); i++) {
                    const area = cv.contourArea(contours.get(i));
                    if (area > maxArea && area > 1000) { // Minimum area threshold
                        maxArea = area;
                        maxContourIndex = i;
                    }
                }

                if (maxContourIndex >= 0) {
                    const contour = contours.get(maxContourIndex);
                    const rect = cv.boundingRect(contour);
                    
                    // Draw bounding rectangle
                    const color = new cv.Scalar(0, 255, 0, 255);
                    cv.rectangle(src, new cv.Point(rect.x, rect.y), 
                               new cv.Point(rect.x + rect.width, rect.y + rect.height), color, 3);
                    
                    // Auto-set measurement points
                    measurementPoints = [
                        {x: rect.x, y: rect.y + rect.height/2},
                        {x: rect.x + rect.width, y: rect.y + rect.height/2},
                        {x: rect.x + rect.width/2, y: rect.y},
                        {x: rect.x + rect.width/2, y: rect.y + rect.height}
                    ];
                    
                    // Display result
                    cv.imshow(canvas, src);
                    
                    // Draw measurement points
                    measurementPoints.forEach(point => drawPoint(point.x, point.y, 'blue', 6));
                    
                    if (isCalibrated) {
                        calculateMeasurements();
                        updateStatus('Object detected and measured automatically!', 'info');
                    } else {
                        updateStatus('Object detected. Please calibrate first for accurate measurements.', 'warning');
                    }
                }

                // Clean up
                src.delete();
                gray.delete();
                edges.delete();
                contours.delete();
                hierarchy.delete();

            } catch (error) {
                updateStatus('Auto detection failed. Try manual measurement.', 'warning');
                console.error('OpenCV error:', error);
            }
        }

        function updateStatus(message, type) {
            const statusElement = document.getElementById('status');
            statusElement.textContent = message;
            statusElement.className = `status ${type}`;
        }

        // Wait for OpenCV to load
        function onOpenCvReady() {
            console.log('OpenCV.js is ready');
        }

        // OpenCV loading handler
        var Module = {
            onRuntimeInitialized: onOpenCvReady
        };