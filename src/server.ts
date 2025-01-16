import express, { Request, Response } from 'express';

const app = express();
const port = 3002;

app.get('/healthcheck', (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
