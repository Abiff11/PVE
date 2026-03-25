import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraEntry } from './entities/bitacora-entry.entity';
import { QueryBitacoraDto } from './dto/query-bitacora.dto';

interface LogPayload {
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: number;
  infraccionId?: string;
}

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(BitacoraEntry)
    private readonly bitacoraRepository: Repository<BitacoraEntry>,
  ) {}

  async log(action: string, payload: LogPayload = {}) {
    const entry = this.bitacoraRepository.create({
      action,
      description: payload.description,
      metadata: payload.metadata,
      user: payload.userId ? ({ id: payload.userId } as BitacoraEntry['user']) : undefined,
      infraccion: payload.infraccionId
        ? ({ id: payload.infraccionId } as BitacoraEntry['infraccion'])
        : undefined,
    });
    await this.bitacoraRepository.save(entry);
  }

  async findAll(query: QueryBitacoraDto) {
    const { action, username, page = 1, pageSize = 20 } = query;

    const qb = this.bitacoraRepository
      .createQueryBuilder('bitacora')
      .leftJoinAndSelect('bitacora.user', 'user')
      .leftJoinAndSelect('bitacora.infraccion', 'infraccion');

    if (action) {
      qb.andWhere('LOWER(bitacora.action) LIKE :action', {
        action: `%${action.toLowerCase()}%`,
      });
    }

    if (username) {
      qb.andWhere('LOWER(user.username) LIKE :username', {
        username: `%${username.toLowerCase()}%`,
      });
    }

    qb.orderBy('bitacora.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, total] = await qb.getManyAndCount();

    return {
      data: data.map((entry) => ({
        id: entry.id,
        action: entry.action,
        description: entry.description,
        metadata: entry.metadata,
        createdAt: entry.createdAt,
        user: entry.user
          ? {
              id: entry.user.id,
              username: entry.user.username,
              nombre: entry.user.nombre,
              apellido: entry.user.apellido,
              role: entry.user.role,
            }
          : null,
        infraccion: entry.infraccion
          ? {
              id: entry.infraccion.id,
              folioInfraccion: entry.infraccion.folioInfraccion,
            }
          : null,
      })),
      total,
      page,
      pageSize,
    };
  }
}
