import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import gql from 'graphql-tag';
import { HeroSliderService } from './hero-slider.service';
import { HeroSliderResolver } from './hero-slider.resolver';

const schemaExtension = gql`
    extend type Query {
        heroSliderImages: [Asset!]!
    }
`;

@VendurePlugin({
    imports: [PluginCommonModule],
    providers: [HeroSliderService, HeroSliderResolver],
    shopApiExtensions: {
        schema: schemaExtension,
        resolvers: [HeroSliderResolver],
    },
})
export class HeroSliderPlugin { }
