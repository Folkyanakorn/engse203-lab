import * as service from '../services/requestService.js';

/**
 * controller รู้จัก req/res และเป็นคนตัดสิน status code
 * แต่ไม่จัดการข้อมูลเอง — ให้ service ทำ
 */

export function listRequests(req, res) {
  const { status } = req.query;
  res.status(200).json(service.findAll({ status }));
}

export function getRequest(req, res) {
  const found = service.findById(req.params.id);
  if (!found) {
    return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
  }
  res.status(200).json(found);
}

export async function createRequest(req, res) {
  const created = await service.create(req.body);
  res.status(201).json(created);
}

export async function updateRequestStatus(req, res) {
  const validStatuses = ['pending', 'in-progress', 'completed'];
  const {status} = req.body;
  if (!validStatuses.includes(status)) {
    return res.status(400).json({error: 'สถานะไม่ถูกต้อง อนุญาตแค่ pending, in-progress, หรือ completed'});
  }
  const updated = await service.updateStatus(req.params.id , status);
  if (!updated) {
    return res.status(404).json({error: `ไม่พบคำร้องรหัส ${req.params.id}`});
  }
  res.status(200).json(updated);
}

export async function deleteRequest(req, res) {
  const removed = await service.remove(req.params.id);
  if (!removed) {
    return res.status(404).json({ error: `ไม่พบคำร้องรหัส ${req.params.id}` });
  }
  res.status(204).end();
}
