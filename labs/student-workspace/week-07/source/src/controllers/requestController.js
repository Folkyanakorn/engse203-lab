import { notFoundError } from '../errors/AppError.js';
import { parseCreate, parseListQuery, parsePatch, parseReplace } from '../validators/requestValidator.js';

/**
 * controller: แปลง HTTP → เรียก validator + service → เลือก status code
 * error ทั้งหมดโยนเป็น AppError ให้ errorHandler จัดรูปแบบ response เดียวกัน
 */
export function createRequestController(service) {
  const mustFind = async (id) => {
    const found = await service.get(id);
    if (!found) throw notFoundError(`ไม่พบคำร้องรหัส ${id}`);
    return found;
  };

  return {
    async list(req, res) {
      const query = parseListQuery(req.query);
      const { items, total } = await service.list(query);
      res.set('X-Total-Count', String(total)).status(200).json(items);
    },

    async get(req, res) {
      res.status(200).json(await mustFind(req.params.id));
    },

    async create(req, res) {
      const created = await service.create(parseCreate(req.body));
      res.status(201).location(`/api/requests/${created.id}`).json(created);
    },

    async replace(req, res) {
      await mustFind(req.params.id);
      res.status(200).json(await service.update(req.params.id, parseReplace(req.body)));
    },

    async patch(req, res) {
      await mustFind(req.params.id);
      res.status(200).json(await service.update(req.params.id, parsePatch(req.body)));
    },

    async remove(req, res) {
      if (!(await service.remove(req.params.id))) throw notFoundError(`ไม่พบคำร้องรหัส ${req.params.id}`);
      res.status(204).end();
    },
  };
}
