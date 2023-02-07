import { object, string, number, TypeOf } from 'zod';


export const ethToPolkaSchema = object({
    body: object({
        owner: string({
            required_error: "Owner is required"
        }),
        contractAddress: string({
           required_error: "contractAddress is required"
        }),
        tokenId: string({
            required_error: "tokenId is required"
        }),
        receiver: string({
            required_error: "owner is required"
        }),
    })
});

export type EthToPolkaInput = TypeOf<typeof ethToPolkaSchema>;
