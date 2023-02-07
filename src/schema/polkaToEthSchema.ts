import { string, object, TypeOf, number } from 'zod';

export const polkaToEthSchema = object({
    body: object({
        collectionId: string({
            required_error: "CollectionId is required"
        }),
        tokenId: string({
            required_error: "TokenId is required"
        }),
        owner: string({
            required_error: "Owner is required"
        }),
    })
});


export type PolkaToEthInput = TypeOf<typeof polkaToEthSchema>;
