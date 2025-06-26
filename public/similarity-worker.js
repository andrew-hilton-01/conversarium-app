console.log("WORKER: Script execution started.");

importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js');
importScripts('https://cdn.jsdelivr.net/npm/@tensorflow-models/universal-sentence-encoder@1.3.3/dist/universal-sentence-encoder.min.js');

let model = null;

async function loadModel() {
  try {
    model = await use.load(); 
    console.log('WORKER: USE model loaded successfully.');
    self.postMessage({ type: 'model_loaded' });
  } catch (error) {
    console.error('WORKER: Error loading model.', error);
    self.postMessage({ type: 'error', message: 'Failed to load model.' });
  }
}

self.onmessage = async (e) => {
  console.log("WORKER: Received a message:", e.data);
  const { type, userInput, nodes } = e.data;

  switch (type) {
    case 'init':
      console.log("WORKER: 'init' message received. Starting model load.");
      await loadModel();
      return;

    case 'similarity':
      if (!model) { return console.error("WORKER: Similarity called before model was ready."); }
      try {
        const sentences = [userInput, ...nodes.map(node => node.content)];
        const embeddings = await model.embed(sentences);
        const results = tf.tidy(() => {
          const [userInputVector, ...nodeVectors] = tf.unstack(embeddings);
          if (nodeVectors.length === 0) return [];
          const nodeMatrix = tf.stack(nodeVectors);
          const dotProduct = tf.matMul(nodeMatrix, userInputVector.expandDims(1));
          const nodeMagnitudes = nodeMatrix.norm(2, 1, true);
          const userMagnitude = userInputVector.norm();
          const similarities = dotProduct.div(nodeMagnitudes.mul(userMagnitude)).squeeze();
          return similarities.arraySync();
        });
        tf.dispose(embeddings);
        const finalResults = nodes.map((node, index) => ({
          nodeId: node.id,
          similarity: results[index] || 0,
          content: node.content
        })).sort((a, b) => b.similarity - a.similarity);
        self.postMessage({ type: 'similarity_result', results: finalResults });
      } catch (error) {
        console.error('WORKER: Error during similarity computation.', error);
        self.postMessage({ type: 'error', message: 'Failed to compute similarity.' });
      }
      return;
  }
};