export default function handler(req, res) {
  res.status(200).json({ ok: true, service: 'taskflow-ai-backend', version: '1.0.0' });
}
