   // Configuration
        const backendDetectUrl = "https://defector-backend.onrender.com/api/detect";
        const clientSecret = "welderskit";

        // DOM elements
        const video = document.getElementById('video');
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const status = document.getElementById('status');
        const statusIndicator = document.getElementById('statusIndicator');
        const captureBtn = document.getElementById('captureBtn');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const resultsCard = document.getElementById('resultsCard');
        const defectsList = document.getElementById('defectsList');

        // State variables
        let capturedImage = null;
        let isAnalyzing = false;

        // Start camera
        async function startCamera() {
            try {
                updateStatus("Starting camera...", "detecting");
                
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { 
                        facingMode: "environment",
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    }, 
                    audio: false 
                });
                
                video.srcObject = stream;
                await video.play();
                
                // Set canvas size to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                updateStatus("Camera ready. Capture a photo to analyze defects.", "active");
            } catch (err) {
                console.error("Camera error:", err);
                updateStatus(`Camera error: ${err.message}`, "error");
            }
        }

        // Capture photo from camera
        function capturePhoto() {
            if (!video.videoWidth) {
                updateStatus("Camera not ready", "error");
                return;
            }

            // Draw video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Hide video, show canvas
            video.style.display = 'none';
            canvas.style.display = 'block';
            
            // Update UI
            captureBtn.style.display = 'none';
            analyzeBtn.disabled = false;
            retakeBtn.style.display = 'inline-block';
            
            // Store the captured image
            capturedImage = canvas.toDataURL('image/jpeg', 0.8);
            
            updateStatus("Photo captured! Click 'Analyze Defects' to detect issues.", "active");
        }

        // Retake photo
        function retakePhoto() {
            // Show video, hide canvas
            video.style.display = 'block';
            canvas.style.display = 'none';
            
            // Reset UI
            captureBtn.style.display = 'inline-block';
            analyzeBtn.disabled = true;
            retakeBtn.style.display = 'none';
            resultsCard.style.display = 'none';
            
            // Clear captured image
            capturedImage = null;
            
            updateStatus("Camera ready. Capture a photo to analyze defects.", "active");
        }

        // Load image from file upload
        function loadImage(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Resize canvas to fit image
                    const maxWidth = 800;
                    const maxHeight = 600;
                    let { width, height } = img;

                    if (width > maxWidth || height > maxHeight) {
                        const scale = Math.min(maxWidth / width, maxHeight / height);
                        width *= scale;
                        height *= scale;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    // Draw image to canvas
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Show canvas, hide video
                    video.style.display = 'none';
                    canvas.style.display = 'block';
                    
                    // Update UI
                    captureBtn.style.display = 'none';
                    analyzeBtn.disabled = false;
                    retakeBtn.style.display = 'inline-block';
                    
                    // Store the image
                    capturedImage = canvas.toDataURL('image/jpeg', 0.8);
                    
                    updateStatus("Image loaded! Click 'Analyze Defects' to detect issues.", "active");
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        // Analyze captured photo
        async function analyzePhoto() {
            if (!capturedImage || isAnalyzing) return;

            isAnalyzing = true;
            analyzeBtn.disabled = true;
            updateStatus("Analyzing image for defects...", "processing");
            analyzeBtn.innerHTML = '<span class="loading"></span>Analyzing...';

            try {
                // Convert data URL to blob
                const response = await fetch(capturedImage);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('file', blob, 'captured_image.jpg');

                // Send to API
                const apiResponse = await fetch(backendDetectUrl, {
                    method: 'POST',
                    headers: { 'x-client-secret': clientSecret },
                    body: formData
                });

                if (!apiResponse.ok) {
                    throw new Error(`API error: ${apiResponse.status}`);
                }

                const result = await apiResponse.json();
                console.log("Detection result:", result);
                
                processResults(result);

            } catch (error) {
                console.error("Analysis error:", error);
                updateStatus(`Analysis failed: ${error.message}`, "error");
            } finally {
                isAnalyzing = false;
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '🔍 Analyze Defects';
            }
        }

        // Process and display results
        function processResults(result) {
            if (!result.predictions || result.predictions.length === 0) {
                updateStatus("✅ No defects detected in this image!", "active");
                resultsCard.style.display = 'none';
                document.getElementById('stats').style.display = 'none';
                return;
            }

            const predictions = result.predictions;
            console.log("Processing predictions:", predictions);

            // Filter by confidence (>= 30%)
            const validPredictions = predictions.filter(pred => pred.confidence >= 0.3);

            if (validPredictions.length === 0) {
                updateStatus("No high-confidence defects detected.", "active");
                resultsCard.style.display = 'none';
                return;
            }

            // Draw bounding boxes on the image
            drawDetections(validPredictions);

            // Update status and stats
            updateStatus(`⚠️ Found ${validPredictions.length} defect(s)!`, "detecting");
            
            document.getElementById('totalDefects').textContent = validPredictions.length;
            document.getElementById('highestConfidence').textContent = 
                Math.round(Math.max(...validPredictions.map(p => p.confidence)) * 100) + '%';
            document.getElementById('apiStatus').textContent = 'Complete';
            document.getElementById('stats').style.display = 'block';

            // Display defect list
            displayDefectsList(validPredictions);
            resultsCard.style.display = 'block';
        }

        // Draw detection boxes on the captured image
        function drawDetections(predictions) {
            predictions.forEach((pred, index) => {
                console.log(`Drawing detection ${index}:`, pred);
                
                // Handle different coordinate formats
                let x, y, w, h;

                // Roboflow typically returns center coordinates
                if (pred.x !== undefined && pred.y !== undefined) {
                    if (pred.x <= 1 && pred.y <= 1) {
                        // Normalized coordinates (0-1)
                        w = pred.width * canvas.width;
                        h = pred.height * canvas.height;
                        x = (pred.x * canvas.width) - (w / 2);
                        y = (pred.y * canvas.height) - (h / 2);
                    } else {
                        // Pixel coordinates - assume they're already in correct scale
                        const scaleX = 1;
                        const scaleY = 1;
                        
                        w = pred.width * scaleX;
                        h = pred.height * scaleY;
                        x = (pred.x * scaleX) - (w / 2);
                        y = (pred.y * scaleY) - (h / 2);
                    }
                }

                // Ensure valid coordinates
                x = Math.max(0, x);
                y = Math.max(0, y);
                w = Math.min(w, canvas.width - x);
                h = Math.min(h, canvas.height - y);

                console.log(`Drawing box at: x=${x}, y=${y}, w=${w}, h=${h}`);

                // Color coding
                const colors = {
                    'crack': '#FF0000',
                    'porosity': '#FF6600', 
                    'undercut': '#FFFF00',
                    'burn-through': '#FF3300',
                    'defect': '#FF6B00'
                };

                const color = colors[pred.class?.toLowerCase()] || colors['defect'];

                // Draw bounding box
                ctx.strokeStyle = color;
                ctx.lineWidth = 4;
                ctx.strokeRect(x, y, w, h);

                // Draw corner markers
                const cornerSize = 20;
                ctx.fillStyle = color;
                
                // Corners
                ctx.fillRect(x - 2, y - 2, cornerSize, 6);
                ctx.fillRect(x - 2, y - 2, 6, cornerSize);
                ctx.fillRect(x + w - cornerSize + 2, y - 2, cornerSize, 6);
                ctx.fillRect(x + w - 2, y - 2, 6, cornerSize);

                // Label with background
                const label = `${pred.class || 'Defect'}: ${Math.round(pred.confidence * 100)}%`;
                ctx.font = 'bold 18px Arial';
                const textWidth = ctx.measureText(label).width;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(x, y - 30, textWidth + 12, 25);
                
                ctx.fillStyle = color;
                ctx.fillText(label, x + 6, y - 8);
            });
        }

        // Display list of detected defects
        function displayDefectsList(predictions) {
            defectsList.innerHTML = '';
            
            predictions.forEach((pred, index) => {
                const defectDiv = document.createElement('div');
                defectDiv.className = 'defect-item';
                
                defectDiv.innerHTML = `
                    <div class="defect-type">${pred.class || 'Unknown Defect'}</div>
                    <div class="defect-confidence">Confidence: ${Math.round(pred.confidence * 100)}%</div>
                    <div class="defect-location">
                        Location: (${Math.round(pred.x || 0)}, ${Math.round(pred.y || 0)})
                        Size: ${Math.round(pred.width || 0)} × ${Math.round(pred.height || 0)}
                    </div>
                `;
                
                defectsList.appendChild(defectDiv);
            });
        }

        // Update status display
        function updateStatus(message, type) {
            status.textContent = message;
            statusIndicator.className = `status-indicator ${type}`;
        }

        // Initialize the application
        document.addEventListener('DOMContentLoaded', () => {
            startCamera();
        });

