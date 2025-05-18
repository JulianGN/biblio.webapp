import { BaseService } from "../base-service.js";

export class GestorInitService extends BaseService {
  async getInitData() {
    return this.get("gestor/dados-iniciais/");
  }
}
