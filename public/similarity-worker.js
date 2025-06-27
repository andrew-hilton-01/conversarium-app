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
  const { type, userInput, nodes } = e.data;

  switch (type) {
    case 'init':
      await loadModel();
      return;

    case 'similarity':
      if (!model) { return console.error("WORKER: Similarity called before model was ready."); }
      
      let embeddings; // Declare here for the finally block
      try {
        const sentences = [userInput, ...nodes.map(node => node.content)];
        embeddings = await model.embed(sentences);
        
        // --- NEW, SIMPLER, AND MORE ROBUST CALCULATION LOGIC ---
        const similarityScores = tf.tidy(() => {
          // Unpack the embeddings tensor into an array of 1D tensors
          const [userInputVector, ...nodeVectors] = tf.unstack(embeddings);

          // Calculate the similarity for each node vector against the user input vector
          const scores = nodeVectors.map(nodeVector => {
            const dotProduct = tf.dot(userInputVector, nodeVector);
            const userNorm = tf.norm(userInputVector);
            const nodeNorm = tf.norm(nodeVector);
            
            // All inputs to this division are now simple numbers (0D tensors), which is safe.
            const similarityTensor = dotProduct.div(userNorm.mul(nodeNorm));
            
            // Use .dataSync() to get the raw number from the tensor
            return similarityTensor.dataSync()[0];
          });
          
          return scores; // This is now a clean array of numbers, e.g., [0.73, 0.48, 0.44]
        });
        // --- END OF NEW LOGIC ---

        const finalResults = nodes.map((node, index) => ({
          nodeId: node.id,
          similarity: similarityScores[index] || 0,
          content: node.content
        })).sort((a, b) => b.similarity - a.similarity);

        console.log("WORKER: Sending back final results:", finalResults);
        self.postMessage({ type: 'similarity_result', results: finalResults });

      } catch (error) {
        console.error('WORKER: Error during similarity computation.', error);
        self.postMessage({ type: 'error', message: 'Failed to compute similarity.' });
      } finally {
        // Manually dispose of the embeddings tensor to prevent memory leaks
        if (embeddings) tf.dispose(embeddings);
      }
      return;
  }
};