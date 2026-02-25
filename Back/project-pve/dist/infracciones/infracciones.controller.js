"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfraccionesController = void 0;
const common_1 = require("@nestjs/common");
const infracciones_service_1 = require("./infracciones.service");
const CreateInfraccion_dto_1 = require("./dto/CreateInfraccion.dto");
let InfraccionesController = class InfraccionesController {
    infraccionesService;
    constructor(infraccionesService) {
        this.infraccionesService = infraccionesService;
    }
    create(createInfraccionDto) {
        return this.infraccionesService.create(createInfraccionDto);
    }
    findAll() {
        return this.infraccionesService.findAll();
    }
    findByFolio(folio) {
        return this.infraccionesService.findByFolio(folio);
    }
    delete(folio) {
        const infraccion = this.infraccionesService.delete(folio);
        return { message: 'Infracción eliminada con éxito', data: infraccion };
    }
};
exports.InfraccionesController = InfraccionesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateInfraccion_dto_1.CreateInfraccionDto]),
    __metadata("design:returntype", void 0)
], InfraccionesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InfraccionesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':folio'),
    __param(0, (0, common_1.Param)('folio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], InfraccionesController.prototype, "findByFolio", null);
__decorate([
    (0, common_1.Delete)(':folio'),
    __param(0, (0, common_1.Param)('folio')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InfraccionesController.prototype, "delete", null);
exports.InfraccionesController = InfraccionesController = __decorate([
    (0, common_1.Controller)('infracciones'),
    __metadata("design:paramtypes", [infracciones_service_1.InfraccionesService])
], InfraccionesController);
//# sourceMappingURL=infracciones.controller.js.map