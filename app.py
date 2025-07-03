from flask import Flask, render_template, request, jsonify
import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import pandas as pd

app = Flask(__name__)

# Load and prepare the iris dataset
def load_iris_data():
    # You can load from your CSV file
    df = pd.read_csv('iris.csv')
    X = df[['sepal_length', 'sepal_width', 'petal_length', 'petal_width']].values
    y = df['species'].values
    return X, y, df

X, y, iris_df = load_iris_data()
model = KNeighborsClassifier(n_neighbors=5)
model.fit(X, y)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = [
        float(data['sepal_length']),
        float(data['sepal_width']),
        float(data['petal_length']),
        float(data['petal_width'])
    ]
    
    # Make prediction
    prediction = model.predict([features])[0]
    probabilities = model.predict_proba([features])[0]
    confidence = max(probabilities)
    
    # Get nearest neighbors
    distances, indices = model.kneighbors([features])
    neighbors = []
    for i, idx in enumerate(indices[0]):
        neighbors.append({
            'distance': distances[0][i],
            'species': y[idx]
        })
    
    return jsonify({
        'prediction': prediction,
        'confidence': confidence,
        'neighbors': neighbors
    })

@app.route('/stats')
def get_stats():
    stats = []
    colors = {'setosa': '#10B981', 'versicolor': '#3B82F6', 'virginica': '#8B5CF6'}
    
    for species in iris_df['species'].unique():
        species_data = iris_df[iris_df['species'] == species]
        stats.append({
            'species': species,
            'count': len(species_data),
            'avgSepalLength': species_data['sepal_length'].mean(),
            'avgSepalWidth': species_data['sepal_width'].mean(),
            'avgPetalLength': species_data['petal_length'].mean(),
            'avgPetalWidth': species_data['petal_width'].mean(),
            'color': colors.get(species, '#6B7280')
        })
    
    return jsonify(stats)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=10000)