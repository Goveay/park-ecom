import { Injectable } from '@nestjs/common';
import { TransactionalConnection, Asset, RequestContext } from '@vendure/core';

@Injectable()
export class HeroSliderService {
    constructor(private connection: TransactionalConnection) { }

    async getHeroSliderImages(ctx: RequestContext) {
        return this.connection.getRepository(ctx, Asset)
            .createQueryBuilder('asset')
            .innerJoin('asset.tags', 'filterTag', 'filterTag.value IN (:...tagValues)', { tagValues: ['heroslider', 'heroslider-mobile', 'herocover'] })
            .leftJoinAndSelect('asset.tags', 'tag')
            .getMany();
    }
}
