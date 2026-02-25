"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfraccionesService = void 0;
const common_1 = require("@nestjs/common");
let InfraccionesService = class InfraccionesService {
    infracciones = [];
    create(createInfraccionDto) {
        const existe = this.infracciones.find((i) => i.folio === createInfraccionDto.folio);
        if (existe) {
            throw new common_1.BadRequestException(`El folio ya existe`);
        }
        const fechaHora = new Date(`${createInfraccionDto.fecha}T${createInfraccionDto.hora}:00`);
        const nuevaInfraccion = { ...createInfraccionDto, fechaHora };
        this.infracciones.push(nuevaInfraccion);
        return nuevaInfraccion;
    }
    findAll() {
        return this.infracciones;
    }
    findByFolio(folio) {
        const infraccion = this.infracciones.find((item) => item.folio === folio);
        if (!infraccion)
            throw new common_1.BadRequestException(`No existe infraccion con folio ${folio}`);
        return infraccion;
    }
    delete(folio) {
        const index = this.infracciones.findIndex((item) => item.folio === folio);
        if (index === -1)
            throw new common_1.BadRequestException(`No existe infraccion con folio ${folio}`);
        const [eliminada] = this.infracciones.splice(index, 1);
        return eliminada;
    }
};
exports.InfraccionesService = InfraccionesService;
exports.InfraccionesService = InfraccionesService = __decorate([
    (0, common_1.Injectable)()
], InfraccionesService);
//# sourceMappingURL=infracciones.service.js.map