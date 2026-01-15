import { Resolver, Query } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { HeroSliderService } from './hero-slider.service';

@Resolver()
export class HeroSliderResolver {
    constructor(private heroSliderService: HeroSliderService) { }

    @Query()
    async heroSliderImages(@Ctx() ctx: RequestContext) {
        return this.heroSliderService.getHeroSliderImages(ctx);
    }
}
