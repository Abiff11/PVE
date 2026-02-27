import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraEntry } from './entities/bitacora-entry.entity';
import { QueryBitacoraDto } from './dto/query-bitacora.dto';

interface LogPayload {
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: number;
  username?: string;
}

/**
 * Servicio centralizado para registrar y consultar eventos de la bitácora.
 */
@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(BitacoraEntry)
    private readonly bitacoraRepository: Repository<BitacoraEntry>,
  ) {}

  /**
   * Registra una nueva acción. Se invoca desde otros servicios cuando ocurre un movimiento.
   */
  async log(action: string, payload: LogPayload = {}) {
    const entry = this.bitacoraRepository.create({
      action,
      description: payload.description,
      metadata: payload.metadata,
      userId: payload.userId,
      username: payload.username,
    });
    await this.bitacoraRepository.save(entry);
  }

  /**
   * Devuelve la bitácora paginada y opcionalmente filtrada por acción o usuario.
   */
  async findAll(query: QueryBitacoraDto) {
    const { action, username, page = 1, pageSize = 20 } = query;

    const qb = this.bitacoraRepository.createQueryBuilder('bitacora');

    if (action) {
      qb.andWhere('LOWER(bitacora.action) LIKE :action', {
        action: `%${action.toLowerCase()}%`,
      });
    }

    if (username) {
      qb.andWhere('LOWER(bitacora.username) LIKE :username', {
        username: `%${username.toLowerCase()}%`,
      });
    }

    qb.orderBy('bitacora.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }
}
