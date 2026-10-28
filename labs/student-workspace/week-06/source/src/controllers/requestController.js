export const STATUSES = ['pending', 'in-progress', 'completed'];

/**
 * controller รู้จัก req/res และตัดสิน status code
 * แต่ไม่จัดการข้อมูลเอง ให้ service ทำ
 */
export function createRequestController(service) {
  return {
    async list(req, res) {
      const { status } = req.query;
      if (status !== undefined && !STATUSES.includes(status)) {
        return res.status(400).json({ error: `status ต้องเป็น ${STATUSES.join(', ')}` });
      }
      res.status(200).json(await service.list({ status }));
    },

    async get(req, res) {
      const found = await service.get(req.params.id);
      if (!found) return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
      res.status(200).json(found);
    },

    async create(req, res) {
      res.status(201).json(await service.create(req.body));
    },

    async updateStatus(req, res) {
      const { status } = req.body ?? {};
      if (!STATUSES.includes(status)) {
        return res.status(400).json({ error: `status ต้องเป็น ${STATUSES.join(', ')}` });
      }
      const updated = await service.updateStatus(req.params.id, status);
      if (!updated) return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
      res.status(200).json(updated);
    },

    async remove(req, res) {
      const removed = await service.remove(req.params.id);
      if (!removed) return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
      res.status(204).end();
    },
  };
}
