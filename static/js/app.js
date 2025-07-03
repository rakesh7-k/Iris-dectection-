document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('predictionForm');
    const resultContainer = document.getElementById('resultContainer');
    const predictBtn = document.getElementById('predictBtn');
    
    // Load data visualization on page load
    loadDataVisualization();
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Show loading state
        predictBtn.innerHTML = `
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Analyzing...</span>
        `;
        predictBtn.disabled = true;
        
        // Get form data
        const formData = {
            sepal_length: document.getElementById('sepal_length').value,
            sepal_width: document.getElementById('sepal_width').value,
            petal_length: document.getElementById('petal_length').value,
            petal_width: document.getElementById('petal_width').value
        };
        
        try {
            // Make prediction request
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            displayResult(result);
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while making the prediction.');
        } finally {
            // Reset button
            predictBtn.innerHTML = `
                <i data-lucide="sparkles" class="h-5 w-5"></i>
                <span>Predict Species</span>
            `;
            predictBtn.disabled = false;
            lucide.createIcons();
        }
    });
    
    function displayResult(result) {
        const speciesColors = {
            setosa: 'from-green-500 to-emerald-600',
            versicolor: 'from-blue-500 to-blue-600',
            virginica: 'from-purple-500 to-purple-600'
        };
        
        const speciesInfo = {
            setosa: {
                name: 'Iris Setosa',
                description: 'Known for its small petals and distinctive appearance',
                characteristics: ['Small petals', 'Broad sepals', 'Compact flower']
            },
            versicolor: {
                name: 'Iris Versicolor',
                description: 'Medium-sized flowers with balanced proportions',
                characteristics: ['Medium petals', 'Balanced proportions', 'Purple-blue flowers']
            },
            virginica: {
                name: 'Iris Virginica',
                description: 'Large flowers with long petals and sepals',
                characteristics: ['Large petals', 'Long sepals', 'Tall stems']
            }
        };
        
        const info = speciesInfo[result.prediction];
        const colorClass = speciesColors[result.prediction];
        
        resultContainer.innerHTML = `
            <div class="text-center mb-8">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${colorClass} text-white mb-4">
                    <i data-lucide="check-circle" class="h-8 w-8"></i>
                </div>
                <h2 class="text-3xl font-bold text-gray-800 mb-2">Prediction Result</h2>
                <div class="inline-block px-6 py-3 rounded-full bg-gradient-to-r ${colorClass} text-white font-semibold text-xl">
                    ${info.name}
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div class="flex items-center space-x-3">
                        <i data-lucide="target" class="h-6 w-6 text-blue-600"></i>
                        <h3 class="text-xl font-semibold text-gray-800">Confidence Score</h3>
                    </div>
                    
                    <div class="relative">
                        <div class="w-full bg-gray-200 rounded-full h-4">
                            <div class="h-4 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out"
                                 style="width: ${result.confidence * 100}%"></div>
                        </div>
                        <div class="text-center mt-2">
                            <span class="text-2xl font-bold text-gray-800">
                                ${(result.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4">
                        <p class="text-gray-700 text-center italic">
                            "${info.description}"
                        </p>
                    </div>
                </div>
                
                <div class="space-y-6">
                    <div class="flex items-center space-x-3">
                        <i data-lucide="users" class="h-6 w-6 text-green-600"></i>
                        <h3 class="text-xl font-semibold text-gray-800">Key Characteristics</h3>
                    </div>
                    
                    <ul class="space-y-3">
                        ${info.characteristics.map(char => `
                            <li class="flex items-center space-x-3">
                                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span class="text-gray-700">${char}</span>
                            </li>
                        `).join('')}
                    </ul>
                    
                    <div class="bg-blue-50 rounded-lg p-4">
                        <h4 class="font-semibold text-blue-800 mb-2">Nearest Neighbors</h4>
                        <p class="text-sm text-blue-700">
                            Based on ${result.neighbors.length} closest matches in the dataset
                        </p>
                        <div class="mt-2 text-xs text-blue-600">
                            Avg distance: ${(result.neighbors.reduce((sum, n) => sum + n.distance, 0) / result.neighbors.length).toFixed(3)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        resultContainer.classList.remove('hidden');
        lucide.createIcons();
    }
    
    async function loadDataVisualization() {
        try {
            const response = await fetch('/stats');
            const stats = await response.json();
            
            const visualization = document.getElementById('dataVisualization');
            visualization.innerHTML = `
                <div class="flex items-center space-x-3 mb-8">
                    <i data-lucide="bar-chart-3" class="h-6 w-6 text-purple-600"></i>
                    <h2 class="text-2xl font-bold text-gray-800">Dataset Overview</h2>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <div class="flex items-center space-x-2">
                            <i data-lucide="pie-chart" class="h-5 w-5 text-blue-600"></i>
                            <h3 class="text-lg font-semibold text-gray-800">Species Distribution</h3>
                        </div>
                        
                        <div class="space-y-4">
                            ${stats.map(species => `
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="font-medium text-gray-700 capitalize">${species.species}</span>
                                        <span class="text-sm text-gray-600">${species.count} samples</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-3">
                                        <div class="h-3 rounded-full transition-all duration-1000 ease-out"
                                             style="width: ${(species.count / 150) * 100}%; background-color: ${species.color}"></div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="space-y-6">
                        <h3 class="text-lg font-semibold text-gray-800">Average Measurements (cm)</h3>
                        
                        <div class="space-y-6">
                            ${stats.map(species => `
                                <div class="border rounded-lg p-4" style="border-color: ${species.color}">
                                    <h4 class="font-semibold text-gray-800 capitalize mb-3" style="color: ${species.color}">
                                        ${species.species}
                                    </h4>
                                    <div class="grid grid-cols-2 gap-3 text-sm">
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-gray-600">Sepal Length</div>
                                            <div class="font-semibold">${species.avgSepalLength.toFixed(1)}</div>
                                        </div>
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-gray-600">Sepal Width</div>
                                            <div class="font-semibold">${species.avgSepalWidth.toFixed(1)}</div>
                                        </div>
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-gray-600">Petal Length</div>
                                            <div class="font-semibold">${species.avgPetalLength.toFixed(1)}</div>
                                        </div>
                                        <div class="bg-gray-50 rounded p-2">
                                            <div class="text-gray-600">Petal Width</div>
                                            <div class="font-semibold">${species.avgPetalWidth.toFixed(1)}</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-3">About the Dataset</h3>
                    <p class="text-gray-700 leading-relaxed">
                        The Iris dataset contains 150 samples of iris flowers, with 50 samples from each of three species: 
                        Setosa, Versicolor, and Virginica. Each sample includes measurements of sepal length, sepal width, 
                        petal length, and petal width. This classic dataset is widely used for machine learning classification tasks.
                    </p>
                </div>
            `;
            
            lucide.createIcons();
            
        } catch (error) {
            console.error('Error loading visualization:', error);
        }
    }
});