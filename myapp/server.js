import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

// Helper function to read data
const readData = async (resource) => {
  try {
    const filePath = path.join(__dirname, 'data', `${resource}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

// Helper function to write data
const writeData = async (resource, data) => {
  const filePath = path.join(__dirname, 'data', `${resource}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};

// Generic GET all
app.get('/api/:resource', async (req, res) => {
  const { resource } = req.params;
  const data = await readData(resource);
  if (!data) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  res.json(data);
});

// Generic GET by id
app.get('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  const data = await readData(resource);
  if (!data) return res.status(404).json({ error: 'Resource not found' });
  
  const item = Array.isArray(data) ? data.find(i => i.id === id) : data[id];
  if (!item) return res.status(404).json({ error: 'Item not found' });
  
  res.json(item);
});

// Generic POST
app.post('/api/:resource', async (req, res) => {
  const { resource } = req.params;
  let data = await readData(resource) || [];
  
  if (!Array.isArray(data)) {
     return res.status(400).json({ error: 'Cannot POST to a non-array resource' });
  }

  const newItem = req.body;
  // If id is not provided, generate a simple one
  if (!newItem.id) {
    newItem.id = Date.now().toString();
  }
  
  data.push(newItem);
  await writeData(resource, data);
  res.status(201).json(newItem);
});

// Generic PATCH (Partial update)
app.patch('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  let data = await readData(resource);
  if (!data) return res.status(404).json({ error: 'Resource not found' });

  if (Array.isArray(data)) {
    const index = data.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    
    data[index] = { ...data[index], ...req.body };
    await writeData(resource, data);
    res.json(data[index]);
  } else {
    // For single object resources (like dashboard)
    if (data[id] === undefined) return res.status(404).json({ error: 'Item not found' });
    data[id] = { ...data[id], ...req.body };
    await writeData(resource, data);
    res.json(data[id]);
  }
});

// Generic DELETE
app.delete('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  let data = await readData(resource);
  if (!data) return res.status(404).json({ error: 'Resource not found' });

  if (Array.isArray(data)) {
    const index = data.findIndex(i => i.id === id);
    if (index === -1) return res.status(404).json({ error: 'Item not found' });
    
    data.splice(index, 1);
    await writeData(resource, data);
    res.json({ success: true });
  } else {
    if (data[id] === undefined) return res.status(404).json({ error: 'Item not found' });
    delete data[id];
    await writeData(resource, data);
    res.json({ success: true });
  }
});

app.listen(PORT, () => {
  console.log(`Custom Express server running on http://localhost:${PORT}`);
});
